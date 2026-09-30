import { withErrorHandling } from "@/server/http";
import { getAnalytics } from "@/server/services/analytics";

export const GET = withErrorHandling(() => Response.json(getAnalytics()));
