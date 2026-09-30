import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { User } from "@/lib/types";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import { HttpError } from "@/server/http";
import * as users from "@/server/repositories/users";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

function isHttps(request: Request) {
  const forwarded = request.headers.get("x-forwarded-proto");
  return (forwarded ?? new URL(request.url).protocol.replace(":", "")) === "https";
}

export async function startSession(request: Request, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  users.deleteExpiredSessions(now);
  users.insertSession(hashToken(token), userId, now + SESSION_TTL_MS);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(request),
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) users.deleteSession(hashToken(token));
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? users.findUserBySession(hashToken(token), Date.now()) : null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    // Clear a stale cookie so the proxy stops treating this browser as signed in.
    (await cookies()).delete(SESSION_COOKIE);
    throw new HttpError(401, "Please log in");
  }
  return user;
}
