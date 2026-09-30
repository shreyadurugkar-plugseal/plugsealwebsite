import "server-only";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export const notFound = (what = "Resource") =>
  new HttpError(404, `${what} not found`);

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
}

export function queryObject(request: Request): Record<string, string> {
  const params = new URL(request.url).searchParams;
  return Object.fromEntries(
    [...params.entries()].filter(([, v]) => v !== "")
  );
}

export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response> | Response
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return Response.json(
          {
            error: "Validation failed",
            issues: err.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message,
            })),
          },
          { status: 400 }
        );
      }
      if (err instanceof HttpError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
