import { EDUCATION } from "./education";
import { EXPERIENCE } from "./experience";
import { FIT_EVIDENCE } from "./fitEvidence";
import { HIRING_PREFERENCES } from "./hiringPreferences";
import { IDENTITY } from "./identity";
import { PROJECTS } from "./projects";
import { SUGGESTED_PROMPTS } from "./prompts";
import { TECHNICAL_EVIDENCE } from "./technicalEvidence";
import { PROFILE_DATA_V2 } from "./v2";

export { EDUCATION } from "./education";
export type { Education } from "./education";
export { EXPERIENCE } from "./experience";
export type { Experience, Outcome } from "./experience";
export { FIT_EVIDENCE } from "./fitEvidence";
export type { FitEvidence } from "./fitEvidence";
export { HIRING_PREFERENCES } from "./hiringPreferences";
export type { HiringPreferences } from "./hiringPreferences";
export { IDENTITY } from "./identity";
export type { Identity } from "./identity";
export { PROJECTS } from "./projects";
export type { Project } from "./projects";
export { SUGGESTED_PROMPTS } from "./prompts";
export { TECHNICAL_EVIDENCE } from "./technicalEvidence";
export type { TechnicalEvidence } from "./technicalEvidence";
export { PROFILE_DATA_V2, PROFILE_V2_DEEP_EVIDENCE } from "./v2";
export type { DeepEvidenceInput } from "./v2";

export const PROFILE_VERSION = process.env.OPENAI_PROFILE_VERSION || "v2";

export const PROFILE_DATA_V1 = {
  person: IDENTITY,
  aiProductCapabilities: IDENTITY.aiProductCapabilities,
  hobbies: IDENTITY.personalSignals,
  technicalTools: IDENTITY.technicalTools,
  experience: EXPERIENCE,
  projects: PROJECTS,
  education: EDUCATION,
  hiringPreferences: HIRING_PREFERENCES,
  fitThemes: FIT_EVIDENCE,
  technicalEvidence: TECHNICAL_EVIDENCE,
  suggestedPrompts: SUGGESTED_PROMPTS,
} as const;

export const PROFILE_DATA = PROFILE_VERSION === "v2" ? PROFILE_DATA_V2 : PROFILE_DATA_V1;

export function getReadyDeepEvidence() {
  return PROFILE_VERSION === "v2"
    ? PROFILE_DATA_V2.deepEvidence.filter((entry) => entry.status === "ready")
    : [];
}

export type ProfileData = typeof PROFILE_DATA;
