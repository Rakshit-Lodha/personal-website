/**
 * Contract between the Roman v2 data layer (src/lib/roman-v2) and its UI (src/components/roman-v2).
 * The page calls getRomanV2Content() on the server; each section receives only its own slice.
 */

/** A destination that is either real and enabled, or visibly present but inert. Never a placeholder href. */
export type AvailableAction =
  | { available: true; label: string; href: string }
  | { available: false; label: string };

/** Two-tone editorial headline: `lead` in ink, `accent` in oxblood. */
export type RomanV2Heading = { lead: string; accent: string };

export type RomanV2Image = { src: string; alt: string; width: number; height: number };

export type RomanV2SectionId = "top" | "work" | "products" | "beyond" | "jj" | "contact";

export type RomanV2NavItem = { id: RomanV2SectionId; label: string; href: `#${string}` };

export type RomanV2Nav = {
  wordmark: string;
  items: RomanV2NavItem[];
  jjLabel: string;
};

export type RomanV2Hero = {
  heading: RomanV2Heading;
  body: string;
  primaryAction: AvailableAction;
  jjLabel: string;
};

export type RomanV2Outcome = {
  /** EXPERIENCE outcome id the figure comes from. */
  sourceId: string;
  /** Display figure, e.g. "55%". */
  value: string;
  /** Caption under the figure, e.g. "fewer monthly support tickets". */
  label: string;
};

export type RomanV2Chapter = {
  /** Matches EXPERIENCE ids. */
  id: string;
  company: string;
  role: string;
  /** Year range, e.g. "2022 — 2026". */
  period: string;
  current: boolean;
  title: string;
  narrative: string;
  /** Verified outcomes only, at most three. May be empty (no invented metrics). */
  outcomes: RomanV2Outcome[];
};

export type RomanV2Career = {
  heading: RomanV2Heading;
  body: string;
  chapters: RomanV2Chapter[];
  /** Chapter shown first. */
  initialChapterId: string;
};

export type RomanV2Product = {
  /** Matches PROJECTS ids. */
  id: string;
  name: string;
  tagline: string;
  summary: string;
  status: string;
  featured: boolean;
  /** Real product capture; null until one exists. */
  screenshot: RomanV2Image | null;
  primaryAction: AvailableAction;
  sourceAction: AvailableAction;
};

export type RomanV2Products = {
  heading: RomanV2Heading;
  body: string;
  /** Featured product first. */
  items: RomanV2Product[];
};

export type RomanV2ReadingEdition =
  | { fixture: false; date: string; title: string; summary: string }
  | { fixture: true; title: string; summary: string };

export type RomanV2Reading = {
  eyebrow: string;
  heading: string;
  body: string;
  edition: RomanV2ReadingEdition;
  action: AvailableAction;
};

export type RomanV2WritingRow = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  date?: string;
  fixture: boolean;
  action: AvailableAction;
};

export type RomanV2Writing = {
  eyebrow: string;
  body: string;
  rows: RomanV2WritingRow[];
  indexAction: AvailableAction;
};

export type RomanV2Track = { id: string; title: string; cover: string; durationSeconds: number };

export type RomanV2Music = {
  eyebrow: string;
  heading: string;
  actionLabel: string;
  /** Null disables the play control; otherwise the control opens the existing music sheet. */
  track: RomanV2Track | null;
};

export type RomanV2WhoopMetric = {
  key: "recovery" | "sleep" | "strain";
  label: string;
  /** null renders an em dash, never zero. */
  value: number | null;
  unit: "" | "%";
};

export type RomanV2Whoop = {
  eyebrow: string;
  /** "live"/"stale" carry real readings; "unavailable" has every value null. */
  status: "live" | "stale" | "unavailable";
  metrics: RomanV2WhoopMetric[];
  syncedAt?: string;
};

export type RomanV2Beyond = {
  heading: RomanV2Heading;
  body: string;
  reading: RomanV2Reading;
  writing: RomanV2Writing;
  music: RomanV2Music;
  whoop: RomanV2Whoop;
};

export type RomanV2JJ = {
  heading: RomanV2Heading;
  body: string;
  voiceLabel: string;
  questionLabel: string;
  questionPlaceholder: string;
  /** Typed questions go to `${chatPath}?q=...`. */
  chatPath: string;
};

export type RomanV2Closing = {
  heading: RomanV2Heading;
  conversationAction: AvailableAction;
  scheduleAction: AvailableAction;
  wordmark: string;
  tagline: string;
  navItems: { label: string; href: `#${string}` }[];
  socials: AvailableAction[];
  timezone: string;
  backToTop: AvailableAction;
  inscription: { latin: string; translation: string };
};

export type RomanV2Content = {
  nav: RomanV2Nav;
  hero: RomanV2Hero;
  career: RomanV2Career;
  products: RomanV2Products;
  beyond: RomanV2Beyond;
  jj: RomanV2JJ;
  closing: RomanV2Closing;
};
