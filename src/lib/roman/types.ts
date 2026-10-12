/**
 * Contract between the Roman site's data layer (src/lib/roman, reading, writing, whoop)
 * and its UI (src/components/roman). The page calls getRomanContent() on the server and
 * passes the result down; components never import profile data directly.
 */

export type RomanSectionId =
  | "arrival"
  | "journey"
  | "projects"
  | "reading"
  | "writing"
  | "playground"
  | "jj"
  | "contact";

export type RomanOutcome = { id: string; label: string; metric: string };

export type RomanJourneyEntry = {
  /** Matches EXPERIENCE ids so JJ can focus the entry. */
  id: string;
  company: string;
  role: string;
  period: string;
  current: boolean;
  logo?: string;
  /** One-line description of the role. */
  summary: string;
  /** First-person reason for joining, when the profile has one. */
  story?: string;
  outcomes: RomanOutcome[];
};

export type RomanProject = {
  /** Matches PROJECTS ids so JJ can focus the project. */
  id: string;
  name: string;
  tagline: string;
  summary: string;
  status: string;
  image?: { src: string; alt: string; width: number; height: number };
  /** Live product or internal route. */
  demoUrl?: string;
  sourceUrl?: string;
};

export type ReadingSource = { url: string; label: string; author?: string };

export type ReadingEdition = {
  /** ISO date in Asia/Kolkata. */
  date: string;
  title: string;
  summary: string;
  url?: string;
  /** Absent when an edition is text-only; the UI must not render a play control. */
  audio?: { src: string; durationSeconds: number };
  sources: ReadingSource[];
  /** True for fixtures; the UI labels these as samples. */
  sample: boolean;
};

export type WritingKind = "essay" | "note" | "work-in-progress";

export type WritingEntry = {
  slug: string;
  kind: WritingKind;
  title: string;
  summary: string;
  date?: string;
  readingMinutes?: number;
  url?: string;
  sample: boolean;
};

export type WhoopMetricKey = "recovery" | "sleepPerformance" | "strain" | "hrv" | "restingHeartRate";

export type WhoopMetric = {
  key: WhoopMetricKey;
  label: string;
  /** null means unscored or unavailable; render an em dash, never zero. */
  value: number | null;
  unit: "" | "%" | "ms" | "bpm";
  measuredAt?: string;
};

export type WhoopSnapshot = {
  status: "live" | "stale" | "sample" | "unavailable";
  metrics: WhoopMetric[];
  syncedAt?: string;
};

export type RomanContact = {
  email: string;
  links: { label: string; url: string }[];
  resumeUrl?: string;
};

export type RomanContent = {
  intro: { name: string; headline: string; subline: string };
  journey: RomanJourneyEntry[];
  projects: RomanProject[];
  reading: { latest: ReadingEdition | null };
  writing: WritingEntry[];
  whoop: WhoopSnapshot;
  contact: RomanContact;
  quote: { text: string; author: string; source: string };
};
