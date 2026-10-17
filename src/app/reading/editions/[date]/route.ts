import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Serves a published edition's full visual HTML newspaper.
 * The file lives in the repo (not public/) so its .html extension can't
 * collide with static-file serving quirks; this route sets the content type.
 */
const HTML_DIR = join(process.cwd(), "content", "reading", "editions-html");

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
