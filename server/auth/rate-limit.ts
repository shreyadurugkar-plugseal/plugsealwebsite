import "server-only";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;

// In-memory, so it resets on restart and isn't shared across instances —
// enough to stop casual password guessing on a single-server deploy.
const globalForLimits = globalThis as unknown as {
  loginFailures?: Map<string, { count: number; resetAt: number }>;
};
const failures = (globalForLimits.loginFailures ??= new Map());

export function isLoginBlocked(key: string): boolean {
  const entry = failures.get(key);
  if (!entry) return false;
  if (entry.resetAt <= Date.now()) {
    failures.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  const entry = failures.get(key);
  if (!entry || entry.resetAt <= now) {
    failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count++;
  }
}

export function clearLoginFailures(key: string) {
  failures.delete(key);
}
