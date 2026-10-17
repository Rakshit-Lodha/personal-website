import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Serves a published edition's full visual HTML newspaper.
 * The file lives in the repo (not public/) so its .html extension can't
 * collide with static-file serving quirks; this route sets the content type.
 * Pre-rendered at build time via generateStaticParams (files are only
 * guaranteed readable during the build).
 */
const HTML_DIR = join(process.cwd(), "content", "reading", "editions-html");

export function generateStaticParams() {
  if (!existsSync(HTML_DIR)) return [];
  return readdirSync(HTML_DIR)
    .filter((name) => name.endsWith(".html"))
    .map((name) => ({ date: name.replace(/\.html$/, "") }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response("Not found", { status: 404 });
  }
  const file = join(HTML_DIR, `${date}.html`);
  if (!existsSync(file)) {
    return new Response("Not found", { status: 404 });
  }
  const html = readFileSync(file, "utf8");
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
