import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeAuthorizationCode, syncOwnerWhoop } from "@/lib/whoop";
import { assertWhoopOAuthConfig } from "@/lib/whoop/config";
import { takeJson } from "@/lib/whoop/store";

export const runtime = "nodejs";
type OAuthState = { browserNonceHash: string; createdAt: string };
const hash = (value: string) => createHash("sha256").update(value).digest("base64url");

function redirect(request: Request, result: "connected" | "error") {
  return NextResponse.redirect(new URL(`/whoop?result=${result}`, request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const nonce = (await cookies()).get("whoop_oauth")?.value;
  if (!code || !state || !nonce || url.searchParams.has("error")) return redirect(request, "error");
  try {
    assertWhoopOAuthConfig();
    const saved = await takeJson<OAuthState>(`oauth:${hash(state)}`);
    if (!saved) return redirect(request, "error");
    const expected = Buffer.from(saved.browserNonceHash);
    const actual = Buffer.from(hash(nonce));
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return redirect(request, "error");
    await exchangeAuthorizationCode(code);
    await syncOwnerWhoop();
    const response = redirect(request, "connected");
    response.cookies.delete("whoop_oauth");
    return response;
  } catch (error) {
    console.error("WHOOP callback failed", error instanceof Error ? error.message : "Unknown error");
    return redirect(request, "error");
  }
}
