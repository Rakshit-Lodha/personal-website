import { getPublicWhoopSnapshot } from "@/lib/whoop";

export async function GET() {
  return Response.json(await getPublicWhoopSnapshot());
}
