import { requireUser } from "@/server/auth/session";
import { withErrorHandling } from "@/server/http";

export const GET = withErrorHandling(async () => {
  return Response.json({ user: await requireUser() });
});
