import { hashPassword } from "@/server/auth/password";
import { startSession } from "@/server/auth/session";
import { HttpError, readJson, withErrorHandling } from "@/server/http";
import { createUser, EmailTakenError } from "@/server/repositories/users";
import { credentialsSchema } from "@/server/validation";

export const POST = withErrorHandling(async (request: Request) => {
  const { email, password } = credentialsSchema.parse(await readJson(request));
  let user;
  try {
    user = createUser(email, await hashPassword(password));
  } catch (err) {
    if (err instanceof EmailTakenError) {
      throw new HttpError(409, "An account with this email already exists");
    }
    throw err;
  }
  await startSession(request, user.id);
  return Response.json({ user }, { status: 201 });
});
