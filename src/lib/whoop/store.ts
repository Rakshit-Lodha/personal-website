import "server-only";
import type { WhoopSnapshot } from "@/lib/roman/types";

export type StoredWhoopConnection = { accessToken: string; refreshToken: string; expiresAt: string; scopes: string[]; connectedAt: string };
const PREFIX = "personal-site:whoop:";

function credentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("A durable Redis store is required for WHOOP");
  return { url: url.replace(/\/$/, ""), token };
}

async function command<T>(...parts: Array<string | number>) {
  const { url, token } = credentials();
  const response = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(parts), cache: "no-store" });
  if (!response.ok) throw new Error(`WHOOP store request failed (${response.status})`);
  const body = (await response.json()) as { result?: T; error?: string };
  if (body.error) throw new Error(`WHOOP store error: ${body.error}`);
  return body.result as T;
}

export async function getJson<T>(name: string): Promise<T | null> {
  const raw = await command<string | null>("GET", `${PREFIX}${name}`);
  return raw ? (JSON.parse(raw) as T) : null;
}
export async function setJson(name: string, value: unknown, ttlSeconds?: number) {
  const parts: Array<string | number> = ["SET", `${PREFIX}${name}`, JSON.stringify(value)];
  if (ttlSeconds) parts.push("EX", ttlSeconds);
  await command(...parts);
}
export async function takeJson<T>(name: string): Promise<T | null> {
  const raw = await command<string | null>("GETDEL", `${PREFIX}${name}`);
  return raw ? (JSON.parse(raw) as T) : null;
}
export async function acquireLock(name: string, owner: string, ttlMs = 30_000) {
  return (await command<string | null>("SET", `${PREFIX}lock:${name}`, owner, "NX", "PX", ttlMs)) === "OK";
}
export async function releaseLock(name: string, owner: string) {
  await command("EVAL", "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end", 1, `${PREFIX}lock:${name}`, owner);
}

export const whoopStore = {
  getConnection: () => getJson<StoredWhoopConnection>("owner:connection"),
  setConnection: (value: StoredWhoopConnection) => setJson("owner:connection", value),
  getSnapshot: () => getJson<WhoopSnapshot>("owner:snapshot"),
  setSnapshot: (value: WhoopSnapshot) => setJson("owner:snapshot", value),
};
