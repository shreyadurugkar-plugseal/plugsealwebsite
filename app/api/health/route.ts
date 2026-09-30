import { getDb } from "@/server/db";

export function GET() {
  try {
    getDb().prepare("SELECT 1").get();
    return Response.json({ status: "ok" });
  } catch (err) {
    console.error("[health]", err);
    return Response.json({ status: "error" }, { status: 503 });
  }
}
