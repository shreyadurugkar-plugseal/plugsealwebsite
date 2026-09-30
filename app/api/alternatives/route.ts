import { queryObject, withErrorHandling } from "@/server/http";
import { getAlternatives } from "@/server/services/alternatives";
import { alternativesQuerySchema } from "@/server/validation";

export const GET = withErrorHandling((request: Request) => {
  const { category, name } = alternativesQuerySchema.parse(queryObject(request));
  return Response.json({ alternatives: getAlternatives(category, name) });
});
