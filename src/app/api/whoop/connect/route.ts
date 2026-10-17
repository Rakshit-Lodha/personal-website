import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { OWNER_SCOPES, assertWhoopOAuthConfig, whoopConfig } from "@/lib/whoop/config";
import { setJson } from "@/lib/whoop/store";

export const runtime = "nodejs";

function equalSecrets(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
const hash = (value: string) => createHash("sha256").update(value).digest("base64url");

export async function POST(request: Request) {
  try {
    assertWhoopOAuthConfig();
    if (!whoopConfig.adminSecret) return Response.json({ error: "WHOOP owner connection is not configured." }, { status: 503 });
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
    const body = (await request.json()) as { adminSecret?: unknown };
    if (typeof body.adminSecret !== "string" || !equalSecrets(body.adminSecret, whoopConfig.adminSecret)) {
      return Response.json({ error: "Invalid administrator secret." }, { status: 401 });
    }

    const state = randomBytes(32).toString("base64url");
    const browserNonce = randomBytes(32).toString("base64url");
    await setJson(`oauth:${hash(state)}`, { browserNonceHash: hash(browserNonce), createdAt: new Date().toISOString() }, 10 * 60);
    const url = new URL(whoopConfig.authorizationUrl);
    url.searchParams.set("client_id", whoopConfig.clientId!);
    url.searchParams.set("redirect_uri", whoopConfig.redirectUri!);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", OWNER_SCOPES.join(" "));
    url.searchParams.set("state", state);

    const response = NextResponse.json({ url: url.toString() });
    response.cookies.set("whoop_oauth", browserNonce, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 10 * 60, path: "/api/whoop/callback" });
    return response;
  } catch (error) {
    console.error("WHOOP connect failed", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "WHOOP connection is temporarily unavailable." }, { status: 503 });
  }
}
