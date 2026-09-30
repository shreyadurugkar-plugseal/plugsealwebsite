import { insertPurchase, listPurchases, summarize } from "@/server/repositories/purchases";
import { requireUser } from "@/server/auth/session";
import { queryObject, readJson, withErrorHandling } from "@/server/http";
import { purchaseCreateSchema, purchaseListQuerySchema } from "@/server/validation";

export const GET = withErrorHandling(async (request: Request) => {
  const user = await requireUser();
  const query = purchaseListQuerySchema.parse(queryObject(request));
  return Response.json({
    purchases: listPurchases(user.id, query),
    ...summarize(user.id, query),
  });
});

export const POST = withErrorHandling(async (request: Request) => {
  const user = await requireUser();
  const input = purchaseCreateSchema.parse(await readJson(request));
  return Response.json({ purchase: insertPurchase(user.id, input) }, { status: 201 });
});
