import { NextResponse } from "next/server";
import { CURRENT_CAREER_STATUS } from "@/lib/assistantIdentity";
import { retrievePortfolioContext } from "@/lib/jj/retrieval";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    query?: unknown;
    limit?: unknown;
    rerank?: unknown;
    useEmbeddings?: unknown;
  } | null;
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  const limit = typeof body?.limit === "number" ? body.limit : undefined;
  const rerank = typeof body?.rerank === "boolean" ? body.rerank : undefined;
  const useEmbeddings = typeof body?.useEmbeddings === "boolean" ? body.useEmbeddings : undefined;

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const context = await retrievePortfolioContext(query, { limit, rerank, useEmbeddings });
  return NextResponse.json({ ...context, currentCareerStatus: CURRENT_CAREER_STATUS });
}
