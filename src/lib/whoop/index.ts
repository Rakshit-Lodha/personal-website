import type { WhoopMetric, WhoopSnapshot } from "@/lib/roman/types";

type SampleMetric = Omit<WhoopMetric, "value"> & { value: number };

/** Mock readings, not real measurements. Never served in production. */
const SAMPLE_METRICS: SampleMetric[] = [
  { key: "recovery", label: "Recovery", value: 71, unit: "%" },
  { key: "sleepPerformance", label: "Sleep performance", value: 82, unit: "%" },
  { key: "strain", label: "Strain", value: 4.6, unit: "" },
  { key: "hrv", label: "HRV", value: 52, unit: "ms" },
  { key: "restingHeartRate", label: "Resting heart rate", value: 58, unit: "bpm" },
];

/**
 * Public owner readings. No WHOOP connection exists yet: sample values outside
 * production, "unavailable" with null values in production.
 */
export async function getPublicWhoopSnapshot(): Promise<WhoopSnapshot> {
  if (process.env.NODE_ENV !== "production") {
    return { status: "sample", metrics: SAMPLE_METRICS };
  }
  return {
    status: "unavailable",
    metrics: SAMPLE_METRICS.map((metric) => ({ ...metric, value: null })),
  };
}
