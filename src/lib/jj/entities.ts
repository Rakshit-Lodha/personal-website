import { SONGS } from "@/lib/musicData";
import { EXPERIENCE } from "@/lib/profile/experience";
import { PROJECTS } from "@/lib/profile/projects";

export const JJ_SECTION_IDS = [
  "hero",
  "my-story",
  "projects",
  "skill-map",
  "education",
] as const;

export type JJSectionId = (typeof JJ_SECTION_IDS)[number];

export const JJ_SECTION_ALIASES: Record<JJSectionId | "skills", JJSectionId> = {
  hero: "hero",
  "my-story": "my-story",
  projects: "projects",
  "skill-map": "skill-map",
  skills: "skill-map",
  education: "education",
};

export const JJ_COMPANY_IDS = EXPERIENCE.map((item) => item.id);
export type JJCompanyId = (typeof JJ_COMPANY_IDS)[number];

export const JJ_COMPANY_ALIASES: Record<string, JJCompanyId> = {
  etmoney: "etmoney",
  "et-money": "etmoney",
  "et money": "etmoney",
  indmoney: "indmoney",
  "ind-money": "indmoney",
  "ind money": "indmoney",
  learnapp: "learnapp",
  "learn-app": "learnapp",
  "learn app": "learnapp",
};

export const JJ_PROJECT_IDS = PROJECTS.map((project) => project.id);
export type JJProjectId = (typeof JJ_PROJECT_IDS)[number];

export const JJ_PROJECT_ALIASES: Record<string, JJProjectId> = {
  "ai-hiring-chat": "ai-hiring-chat",
  "hiring-chat": "ai-hiring-chat",
  "ai hiring chat": "ai-hiring-chat",
  "hiring assistant": "ai-hiring-chat",
  "krux": "krux-new",
  "crux": "krux-new",
  "krux.news": "krux-new",
  "crux.news": "krux-new",
  "krux news": "krux-new",
  "crux news": "krux-new",
  "krux-new": "krux-new",
  "ai-times": "krux-new",
  "ai times": "krux-new",
  "mf-search": "mf-semantic-search",
  "mf search": "mf-semantic-search",
  "mf-semantic-search": "mf-semantic-search",
  "mf semantic search": "mf-semantic-search",
  "mutual fund search": "mf-semantic-search",
  "feedback-agent": "feedback-agent",
  "feedback agent": "feedback-agent",
  "feedback-intelligence": "feedback-agent",
  "feedback intelligence": "feedback-agent",
  "us-stocks-analysis-agent": "us-stocks-analysis-agent",
  "us stocks analysis agent": "us-stocks-analysis-agent",
  "us-stock-agent": "us-stocks-analysis-agent",
  "us stock agent": "us-stocks-analysis-agent",
  "ai-evaluation-framework": "ai-evaluation-framework",
  "ai evaluation framework": "ai-evaluation-framework",
  "evaluation-framework": "ai-evaluation-framework",
  "evaluation framework": "ai-evaluation-framework",
  "talk-to-krishna": "talk-to-krishna",
  "talk to krishna": "talk-to-krishna",
  talktokrishna: "talk-to-krishna",
};

export const JJ_OUTCOME_IDS = EXPERIENCE.flatMap((item) =>
  item.outcomes.map((outcome) => outcome.id)
);
export type JJOutcomeId = (typeof JJ_OUTCOME_IDS)[number];

export const JJ_SONG_IDS = SONGS.map((song) => song.id);
export type JJSongId = (typeof JJ_SONG_IDS)[number];

export const JJ_SONG_ALIASES: Record<string, JJSongId> = {
  "open-it-up": "open-it-up",
  "open it up": "open-it-up",
  "what-good-looks-like": "what-good-looks-like",
  "what good looks like": "what-good-looks-like",
  "closer-to-the-choice": "closer-to-the-choice",
  "closer to the choice": "closer-to-the-choice",
  "make-it-to-the-end": "make-it-to-the-end",
  "make it to the end": "make-it-to-the-end",
};

export function normalizeSectionId(value: string): JJSectionId | null {
  return JJ_SECTION_ALIASES[value as keyof typeof JJ_SECTION_ALIASES] ?? null;
}

export function normalizeCompanyId(value: string): JJCompanyId | null {
  return JJ_COMPANY_ALIASES[value.trim().toLowerCase()] ?? null;
}

export function normalizeProjectId(value: string): JJProjectId | null {
  return JJ_PROJECT_ALIASES[value.trim().toLowerCase()] ?? null;
}

export function normalizeSongId(value: string): JJSongId | null {
  return JJ_SONG_ALIASES[value.trim().toLowerCase()] ?? null;
}
