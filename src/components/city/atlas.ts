/**
 * The atlas holds ONLY spatial and visual data. All copy, metrics, and links come
 * from the existing content sources, referenced by their real entity IDs — so the
 * city and the scroll site can never drift apart.
 *
 * City-specific wording goes in `cityCopy`, and nowhere else.
 */

import { EXPERIENCE } from "@/lib/profile/experience";
import { PROJECTS } from "@/lib/profile/projects";
import type { JJCompanyId, JJProjectId, JJSectionId } from "@/lib/jj/entities";

export type PlaceKind =
  | "company"
  | "project"
  | "factory"
  | "club"
  | "signal"
  | "academy"
  | "plaza";

export type Place = {
  id: string;
  kind: PlaceKind;
  label: string;
  /** Ground position and footprint, in world units. */
  cx: number;
  cz: number;
  accent: string;
  /** Which JJ entity this place represents, if any. */
  companyId?: JJCompanyId;
  projectId?: JJProjectId;
  /** Section on `/` that holds the same content. */
  sectionId?: JJSectionId;
  /** City-voice copy. Everything factual is read from the content sources. */
  cityCopy: {
    kicker: string;
    tagline: string;
    body: string;
  };
  /** Bespoke interior, or the shared cutaway shell. */
  interior: "bespoke" | "shell" | "none";
};

/* ── Career Avenue ────────────────────────────────────────────────────────────
   Four buildings along one street, oldest to newest. Height is derived from
   tenure and outcome count at render time, not hardcoded here.              */

export const COMPANY_PLACES: Place[] = [
  {
    id: "learnapp",
    kind: "company",
    companyId: "learnapp",
    sectionId: "my-story",
    label: "LearnApp",
    cx: -11,
    cz: -9.5,
    accent: "#16A34A",
    interior: "shell",
    cityCopy: {
      kicker: "2018 — 2020",
      tagline: "The first building on the street.",
      body: "Where a college student decided financial education in India was broken, and that teaching people was the way to fix it.",
    },
  },
  {
    id: "indmoney",
    kind: "company",
    companyId: "indmoney",
    sectionId: "my-story",
    label: "INDMoney",
    cx: -4.5,
    cz: -11.5,
    accent: "#D97706",
    interior: "shell",
    cityCopy: {
      kicker: "2020 — 2022",
      tagline: "Education changes what people know. Decisions change what they do.",
      body: "Advisory and insurance workflows turned into recommendation products. One floor here is dark — the Goals feature never found product-market fit, and it is still the most useful thing that happened in this building.",
    },
  },
  {
    id: "etmoney",
    kind: "company",
    companyId: "etmoney",
    sectionId: "my-story",
    label: "ET Money",
    cx: 3,
    cz: -12,
    accent: "#1B6AE7",
    interior: "shell",
    cityCopy: {
      kicker: "2022 — 2026",
      tagline: "The tower. Seven lit floors, one per thing that shipped.",
      body: "Lending, wealth, insurance, and the AI support automation that took monthly tickets from 19,000 to 9,000. This is where the lesson landed: the model is interchangeable, the eval is the product.",
    },
  },
  {
    id: "paytmmoney",
    kind: "company",
    companyId: "paytmmoney",
    sectionId: "my-story",
    label: "Paytm Money",
    cx: 10.5,
    cz: -9,
    accent: "#0EA5E9",
    interior: "shell",
    cityCopy: {
      kicker: "Jul 2026 — now",
      tagline: "Still under construction.",
      body: "Senior Product Manager, working on agents and the overall app experience. The cranes are still up because this one is not finished.",
    },
  },
];

/* ── Projects township & the Factory ──────────────────────────────────────── */

const SHIPPED = PROJECTS.filter((p) => p.status !== "Prototype");
const EXPERIMENTS = PROJECTS.filter((p) => p.status === "Prototype");

/** Houses arranged around the township green. */
export const PROJECT_PLACES: Place[] = SHIPPED.map((project, i) => {
  const angle = (i / SHIPPED.length) * Math.PI * 2;
  return {
    id: project.id,
    kind: "project" as const,
    projectId: project.id,
    sectionId: "projects" as const,
    label: project.name,
    cx: 10 + Math.cos(angle) * 3.4,
    cz: 6 + Math.sin(angle) * 3.4,
    accent: project.status === "Live" ? "#7C3AED" : "#A78BFA",
    interior: "none" as const,
    cityCopy: {
      kicker: project.status,
      tagline: project.type,
      body: project.summary,
    },
  };
});

export const EXPERIMENT_IDS = EXPERIMENTS.map((p) => p.id);

export const FACTORY_PLACE: Place = {
  id: "factory",
  kind: "factory",
  sectionId: "skill-map",
  label: "The Factory",
  cx: -11,
  cz: 8.5,
  accent: "#D97706",
  interior: "bespoke",
  cityCopy: {
    kicker: "Experiments",
    tagline: "Where things get taken apart to see how they work.",
    body: "The prototypes live here — the eval framework, the RAG experiments. Nothing in this building is finished, which is the point of it.",
  },
};

export const CLUB_PLACE: Place = {
  id: "club",
  kind: "club",
  label: "The Club",
  cx: 5.5,
  cz: 13,
  accent: "#E11D74",
  interior: "bespoke",
  cityCopy: {
    kicker: "Now playing",
    tagline: "The city has a soundtrack, and it is playing in here.",
    body: "Original tracks, written and produced. Step inside and the room moves with whatever is actually coming out of the speakers.",
  },
};

export const SIGNAL_PLACE: Place = {
  id: "signal",
  kind: "signal",
  label: "Signal Tower",
  cx: 13.5,
  cz: -3.5,
  accent: "#1B6AE7",
  interior: "none",
  cityCopy: {
    kicker: "Talk to JJ",
    tagline: "Ask out loud. It answers with evidence.",
    body: "The broadcast mast. A voice agent that reads a job description or a company URL and argues the case with sources instead of adjectives.",
  },
};

export const ACADEMY_PLACE: Place = {
  id: "academy",
  kind: "academy",
  sectionId: "education",
  label: "Academy Hill",
  cx: -13,
  cz: 3.5,
  accent: "#16A34A",
  interior: "none",
  cityCopy: {
    kicker: "Education",
    tagline: "The part that came before the rest.",
    body: "Degrees, coursework, and the certifications picked up while self-teaching the AI product work.",
  },
};

export const PLAZA_PLACE: Place = {
  id: "plaza",
  kind: "plaza",
  label: "Central Plaza",
  cx: 0,
  cz: 0,
  accent: "#1B6AE7",
  interior: "none",
  cityCopy: {
    kicker: "Get in touch",
    tagline: "Every road leads here.",
    body: "Email, LinkedIn, GitHub, X — and the fastest route to a conversation about product work.",
  },
};

export const PLACES: Place[] = [
  ...COMPANY_PLACES,
  ...PROJECT_PLACES,
  FACTORY_PLACE,
  CLUB_PLACE,
  SIGNAL_PLACE,
  ACADEMY_PLACE,
  PLAZA_PLACE,
];

export const PLACE_BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p])) as Record<string, Place>;

export const PLACE_BY_COMPANY = Object.fromEntries(
  COMPANY_PLACES.map((p) => [p.companyId as string, p])
) as Record<string, Place>;

export const PLACE_BY_PROJECT = Object.fromEntries(
  PROJECT_PLACES.map((p) => [p.projectId as string, p])
) as Record<string, Place>;

/** Outcomes become floors. ET Money has seven; Paytm Money has none yet. */
export function outcomesFor(companyId: string) {
  return EXPERIENCE.find((e) => e.id === companyId)?.outcomes ?? [];
}

export function failuresFor(companyId: string) {
  const entry = EXPERIENCE.find((e) => e.id === companyId);
  return entry && "failures" in entry ? entry.failures : [];
}

/** Which company building owns a given outcome floor. */
export function companyForOutcome(outcomeId: string): string | null {
  for (const entry of EXPERIENCE) {
    if (entry.outcomes.some((o) => o.id === outcomeId)) return entry.id;
  }
  return null;
}

/* ── Geometry derived from the content, not hardcoded ─────────────────────── */

export type Floor = {
  id: string;
  label: string;
  metric: string;
  impact: string;
  /** A floor that did not work out. Rendered dark. */
  failed: boolean;
};

/** Outcomes become floors, newest work highest. Failures get a floor too. */
export function floorsFor(companyId: string): Floor[] {
  const outcomes = outcomesFor(companyId).map((o) => ({
    id: o.id,
    label: o.label,
    metric: o.metric,
    impact: o.impact,
    failed: false,
  }));
  const failed = failuresFor(companyId).map((f) => ({
    id: f.id,
    label: f.label,
    metric: "No product-market fit",
    impact: f.summary,
    failed: true,
  }));
  return [...failed, ...outcomes];
}

/** ET Money has seven floors and is the tower; Paytm Money is still going up. */
export function companyHeight(companyId: string): number {
  return 4.2 + floorsFor(companyId).length * 1.15;
}

export function isUnderConstruction(companyId: string): boolean {
  return floorsFor(companyId).length === 0;
}

/** Chip rails in the HUD. */
export const AROUND_TOWN: Place[] = [
  PROJECT_PLACES[0],
  FACTORY_PLACE,
  CLUB_PLACE,
  SIGNAL_PLACE,
  ACADEMY_PLACE,
  PLAZA_PLACE,
].filter(Boolean);

/** The guided tour: the career first, then everything else. */
export const TOUR_STOPS: string[] = [
  ...COMPANY_PLACES.map((p) => p.id),
  ...PROJECT_PLACES.slice(0, 2).map((p) => p.id),
  FACTORY_PLACE.id,
  CLUB_PLACE.id,
  SIGNAL_PLACE.id,
  ACADEMY_PLACE.id,
  PLAZA_PLACE.id,
];
