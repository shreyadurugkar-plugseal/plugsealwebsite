import { withErrorHandling } from "@/server/http";
import { getDashboard } from "@/server/services/analytics";

export const GET = withErrorHandling(() => Response.json(getDashboard()));
