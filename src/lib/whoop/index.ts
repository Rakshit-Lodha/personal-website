import type { WhoopMetric, WhoopSnapshot } from "@/lib/roman/types";
import { whoopStore } from "./store";

const EMPTY_METRICS: WhoopMetric[] = [
  { key: "recovery", label: "Recovery", value: null, unit: "%" },
  { key: "sleepPerformance", label: "Sleep performance", value: null, unit: "%" },
  { key: "strain", label: "Strain", value: null, unit: "" },
  { key: "hrv", label: "HRV", value: null, unit: "ms" },
  { key: "restingHeartRate", label: "Resting heart rate", value: null, unit: "bpm" },
];

export async function getPublicWhoopSnapshot(): Promise<WhoopSnapshot> {
  try {
    const snapshot = await whoopStore.getSnapshot();
    if (!snapshot?.syncedAt) return { status: "unavailable", metrics: EMPTY_METRICS };
    const stale = Date.now() - new Date(snapshot.syncedAt).getTime() > 90 * 60 * 1000;
    return { ...snapshot, status: stale ? "stale" : "live" };
  } catch {
    return { status: "unavailable", metrics: EMPTY_METRICS };
  }
}

export { exchangeAuthorizationCode, syncOwnerWhoop } from "./client";
