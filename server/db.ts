import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "budget.db");

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
];

function open(): Database.Database {
  if (DB_PATH !== ":memory:") {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

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

export const db = globalForDb.budgetDb ?? (globalForDb.budgetDb = open());
