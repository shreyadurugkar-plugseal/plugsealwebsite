import {
  deletePurchase,
  getPurchase,
  updatePurchase,
} from "@/server/repositories/purchases";
import { notFound, readJson, withErrorHandling } from "@/server/http";
import { purchaseUpdateSchema } from "@/server/validation";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_req: Request, { params }: Ctx) => {
  const purchase = getPurchase((await params).id);
  if (!purchase) throw notFound("Purchase");
  return Response.json({ purchase });
});

export const PATCH = withErrorHandling(async (request: Request, { params }: Ctx) => {
  const patch = purchaseUpdateSchema.parse(await readJson(request));
  const purchase = updatePurchase((await params).id, patch);
  if (!purchase) throw notFound("Purchase");
  return Response.json({ purchase });
});

export const DELETE = withErrorHandling(async (_req: Request, { params }: Ctx) => {
  if (!deletePurchase((await params).id)) throw notFound("Purchase");
  return new Response(null, { status: 204 });
});
