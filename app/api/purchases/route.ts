import { insertPurchase, listPurchases, summarize } from "@/server/repositories/purchases";
import { queryObject, readJson, withErrorHandling } from "@/server/http";
import { purchaseCreateSchema, purchaseListQuerySchema } from "@/server/validation";

export const GET = withErrorHandling(async (request: Request) => {
  const query = purchaseListQuerySchema.parse(queryObject(request));
  return Response.json({ purchases: listPurchases(query), ...summarize(query) });
});

export const POST = withErrorHandling(async (request: Request) => {
  const input = purchaseCreateSchema.parse(await readJson(request));
  return Response.json({ purchase: insertPurchase(input) }, { status: 201 });
});
