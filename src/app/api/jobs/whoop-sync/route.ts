import { timingSafeEqual } from "node:crypto";
import { syncOwnerWhoop } from "@/lib/whoop";
import { whoopConfig } from "@/lib/whoop/config";

export const runtime = "nodejs";
export const maxDuration = 30;

function authorized(request: Request) {
  const configured = whoopConfig.jobSecret;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!configured || !supplied) return false;
  const a = Buffer.from(configured);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const snapshot = await syncOwnerWhoop();
    return Response.json({ ok: true, syncedAt: snapshot.syncedAt });
  } catch (error) {
    console.error("WHOOP sync failed", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "WHOOP sync failed" }, { status: 502 });
  }
}

export const GET = POST;
