import { requireUser } from "@/server/auth/session";
import { withErrorHandling } from "@/server/http";
import { getDashboard } from "@/server/services/analytics";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  return Response.json(getDashboard(user.id));
});
