import { getPublicWhoopSnapshot } from "@/lib/whoop";

export async function GET() {
  return Response.json(await getPublicWhoopSnapshot(), {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=300" },
  });
}
