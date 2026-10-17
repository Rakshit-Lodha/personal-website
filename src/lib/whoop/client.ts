import "server-only";
import { randomUUID } from "node:crypto";
import type { WhoopMetric, WhoopSnapshot } from "@/lib/roman/types";
import { decryptSecret, encryptSecret } from "./crypto";
import { whoopConfig } from "./config";
import { acquireLock, releaseLock, whoopStore, type StoredWhoopConnection } from "./store";

type TokenResponse = { access_token: string; refresh_token: string; expires_in: number; scope?: string };
type Collection<T> = { records: T[] };
type Cycle = { updated_at: string; score_state: string; score?: { strain?: number } };
type Recovery = { sleep_id: string; updated_at: string; score_state: string; score?: { user_calibrating?: boolean; recovery_score?: number; resting_heart_rate?: number; hrv_rmssd_milli?: number } };
type Sleep = { id: string; end: string; updated_at: string; nap: boolean; score_state: string; score?: { sleep_performance_percentage?: number } };

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetry(input: string, init: RequestInit) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(input, init);
    if (response.status !== 429 && response.status < 500) return response;
    if (attempt === 2) return response;
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 2_000) : 500 * 2 ** attempt;
    await wait(delay);
  }
  throw new Error("WHOOP request retry loop ended unexpectedly");
}

async function tokenRequest(params: URLSearchParams): Promise<TokenResponse> {
  const response = await fetchWithRetry(whoopConfig.tokenUrl, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: params, cache: "no-store" });
  if (!response.ok) throw new Error(`WHOOP token request failed (${response.status})`);
  return (await response.json()) as TokenResponse;
}
function storedTokens(token: TokenResponse, connectedAt = new Date().toISOString()): StoredWhoopConnection {
  return { accessToken: encryptSecret(token.access_token), refreshToken: encryptSecret(token.refresh_token), expiresAt: new Date(Date.now() + Math.max(0, token.expires_in - 60) * 1000).toISOString(), scopes: (token.scope ?? "").split(/\s+/).filter(Boolean), connectedAt };
}
export async function exchangeAuthorizationCode(code: string) {
  const token = await tokenRequest(new URLSearchParams({ grant_type: "authorization_code", code, client_id: whoopConfig.clientId!, client_secret: whoopConfig.clientSecret!, redirect_uri: whoopConfig.redirectUri! }));
  await whoopStore.setConnection(storedTokens(token));
}

async function accessToken() {
  let connection = await whoopStore.getConnection();
  if (!connection) throw new Error("WHOOP owner is not connected");
  if (new Date(connection.expiresAt).getTime() > Date.now()) return decryptSecret(connection.accessToken);
  const lockOwner = randomUUID();
  if (!(await acquireLock("refresh", lockOwner))) throw new Error("WHOOP credential refresh is already in progress");
  try {
    connection = await whoopStore.getConnection();
    if (!connection) throw new Error("WHOOP owner is not connected");
    if (new Date(connection.expiresAt).getTime() > Date.now()) return decryptSecret(connection.accessToken);
    const token = await tokenRequest(new URLSearchParams({ grant_type: "refresh_token", refresh_token: decryptSecret(connection.refreshToken), client_id: whoopConfig.clientId!, client_secret: whoopConfig.clientSecret!, scope: "offline" }));
    await whoopStore.setConnection(storedTokens(token, connection.connectedAt));
    return token.access_token;
  } finally { await releaseLock("refresh", lockOwner); }
}

async function getCollection<T>(path: string, token: string) {
  const response = await fetchWithRetry(`${whoopConfig.apiUrl}${path}`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`WHOOP API request failed (${response.status})`);
  return (await response.json()) as Collection<T>;
}
const metric = (key: WhoopMetric["key"], label: string, value: number | null, unit: WhoopMetric["unit"], measuredAt?: string): WhoopMetric => ({ key, label, value, unit, ...(measuredAt ? { measuredAt } : {}) });

export async function syncOwnerWhoop(): Promise<WhoopSnapshot> {
  const token = await accessToken();
  const [cycles, recoveries, sleeps] = await Promise.all([getCollection<Cycle>("/cycle?limit=10", token), getCollection<Recovery>("/recovery?limit=10", token), getCollection<Sleep>("/activity/sleep?limit=10", token)]);
  const cycle = cycles.records[0];
  const recovery = recoveries.records.find((item) => item.score_state === "SCORED" && !item.score?.user_calibrating);
  const sleep = sleeps.records.find((item) => item.id === recovery?.sleep_id) ?? sleeps.records.find((item) => !item.nap && item.score_state === "SCORED");
  const recoveryMeasuredAt = sleep?.end ?? recovery?.updated_at;
  const snapshot: WhoopSnapshot = { status: "live", syncedAt: new Date().toISOString(), metrics: [
    metric("recovery", "Recovery", recovery?.score?.recovery_score ?? null, "%", recoveryMeasuredAt),
    metric("sleepPerformance", "Sleep performance", sleep?.score?.sleep_performance_percentage ?? null, "%", sleep?.end ?? sleep?.updated_at),
    metric("strain", "Strain", cycle?.score_state === "SCORED" ? cycle.score?.strain ?? null : null, "", cycle?.updated_at),
    metric("hrv", "HRV", recovery?.score?.hrv_rmssd_milli ?? null, "ms", recoveryMeasuredAt),
    metric("restingHeartRate", "Resting heart rate", recovery?.score?.resting_heart_rate ?? null, "bpm", recoveryMeasuredAt),
  ] };
  await whoopStore.setSnapshot(snapshot);
  return snapshot;
}
