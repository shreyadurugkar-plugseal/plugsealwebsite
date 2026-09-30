import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/server/db";
import type { User } from "@/lib/types";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
}

export function findUserByEmail(
  email: string
): (User & { passwordHash: string }) | null {
  const row = db
    .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .get(email) as UserRow | undefined;
  return row ? { id: row.id, email: row.email, passwordHash: row.password_hash } : null;
}

export class EmailTakenError extends Error {}

export function createUser(email: string, passwordHash: string): User {
  const id = randomUUID();
  db.transaction(() => {
    const isFirstUser =
      (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n === 0;
    try {
      db.prepare(
        "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)"
      ).run(id, email, passwordHash);
    } catch (err) {
      if ((err as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") {
        throw new EmailTakenError();
      }
      throw err;
    }
    // Purchases recorded before accounts existed belong to whoever signs up first.
    if (isFirstUser) {
      db.prepare("UPDATE purchases SET user_id = ? WHERE user_id IS NULL").run(id);
    }
  })();
  return { id, email };
}

export function insertSession(tokenHash: string, userId: string, expiresAt: number) {
  db.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(tokenHash, userId, expiresAt);
}

export function findUserBySession(tokenHash: string, now: number): User | null {
  const row = db
    .prepare(
      `SELECT u.id, u.email FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > ?`
    )
    .get(tokenHash, now) as User | undefined;
  return row ?? null;
}

export function deleteSession(tokenHash: string) {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

export function deleteExpiredSessions(now: number) {
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
}
