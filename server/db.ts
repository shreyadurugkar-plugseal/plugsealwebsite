import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// Append-only: each entry runs once, tracked via SQLite's user_version pragma.
const MIGRATIONS = [
  `CREATE TABLE purchases (
     id           TEXT PRIMARY KEY,
     name         TEXT NOT NULL,
     amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
     category     TEXT NOT NULL,
     date         TEXT NOT NULL,
     note         TEXT,
     is_impulse   INTEGER NOT NULL DEFAULT 0,
     created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
   );
   CREATE INDEX idx_purchases_date ON purchases(date);
   CREATE INDEX idx_purchases_category ON purchases(category);`,

  `CREATE TABLE users (
     id            TEXT PRIMARY KEY,
     email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
     password_hash TEXT NOT NULL,
     created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
   );
   CREATE TABLE sessions (
     token_hash TEXT PRIMARY KEY,
     user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     expires_at INTEGER NOT NULL
   );
   CREATE INDEX idx_sessions_user ON sessions(user_id);
   ALTER TABLE purchases ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
   CREATE INDEX idx_purchases_user_date ON purchases(user_id, date);`,
];

function resolvePath(): string {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  // Railway sets RAILWAY_VOLUME_MOUNT_PATH when a volume is attached to the service.
  const volume = process.env.RAILWAY_VOLUME_MOUNT_PATH;
  if (volume) return path.join(volume, "budget.db");
  if (process.env.RAILWAY_ENVIRONMENT) {
    console.warn(
      "[db] WARNING: no Railway volume attached, so the database will be wiped on every deploy. " +
        "Attach a volume to this service (any mount path, e.g. /data)."
    );
  }
  return path.join(process.cwd(), "data", "budget.db");
}

function open(): Database.Database {
  const dbPath = resolvePath();
  if (dbPath !== ":memory:") {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const current = db.pragma("user_version", { simple: true }) as number;
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
  return db;
}

// Survive dev-server hot reloads without opening a new handle each time.
const globalForDb = globalThis as unknown as { budgetDb?: Database.Database };

// Opened lazily: `next build` imports this module, and the database (e.g. a
// Railway volume) isn't available at build time.
export function getDb(): Database.Database {
  return (globalForDb.budgetDb ??= open());
}
