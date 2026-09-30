import {
  deletePurchase,
  getPurchase,
  updatePurchase,
} from "@/server/repositories/purchases";
import { requireUser } from "@/server/auth/session";
import { notFound, readJson, withErrorHandling } from "@/server/http";
import { purchaseUpdateSchema } from "@/server/validation";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const purchase = getPurchase(user.id, (await params).id);
  if (!purchase) throw notFound("Purchase");
  return Response.json({ purchase });
});

export const PATCH = withErrorHandling(async (request: Request, { params }: Ctx) => {
  const user = await requireUser();
  const patch = purchaseUpdateSchema.parse(await readJson(request));
  const purchase = updatePurchase(user.id, (await params).id, patch);
  if (!purchase) throw notFound("Purchase");
  return Response.json({ purchase });
});

export const DELETE = withErrorHandling(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  if (!deletePurchase(user.id, (await params).id)) throw notFound("Purchase");
  return new Response(null, { status: 204 });
});
