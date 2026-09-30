import { DUMMY_HASH, verifyPassword } from "@/server/auth/password";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "@/server/auth/rate-limit";
import { startSession } from "@/server/auth/session";
import { HttpError, readJson, withErrorHandling } from "@/server/http";
import { findUserByEmail } from "@/server/repositories/users";
import { credentialsSchema } from "@/server/validation";

export const POST = withErrorHandling(async (request: Request) => {
  const { email, password } = credentialsSchema.parse(await readJson(request));

  if (isLoginBlocked(email)) {
    throw new HttpError(429, "Too many failed attempts. Try again in 15 minutes.");
  }

  const user = findUserByEmail(email);
  const valid = await verifyPassword(password, user?.passwordHash ?? (await DUMMY_HASH));
  if (!user || !valid) {
    recordLoginFailure(email);
    throw new HttpError(401, "Incorrect email or password");
  }

  clearLoginFailures(email);
  await startSession(request, user.id);
  return Response.json({ user: { id: user.id, email: user.email } });
});
