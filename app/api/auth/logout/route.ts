import { endSession } from "@/server/auth/session";
import { withErrorHandling } from "@/server/http";

export const POST = withErrorHandling(async () => {
  await endSession();
  return new Response(null, { status: 204 });
});
