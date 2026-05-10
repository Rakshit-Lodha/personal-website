import { EDUCATION } from "./education";
import { EXPERIENCE } from "./experience";
import { FIT_EVIDENCE } from "./fitEvidence";
import { IDENTITY } from "./identity";
import { PROJECTS } from "./projects";
import { SUGGESTED_PROMPTS } from "./prompts";
import { TECHNICAL_EVIDENCE } from "./technicalEvidence";

export { EDUCATION } from "./education";
export type { Education } from "./education";
export { EXPERIENCE } from "./experience";
export type { Experience, Outcome } from "./experience";
export { FIT_EVIDENCE } from "./fitEvidence";
export type { FitEvidence } from "./fitEvidence";
export { IDENTITY } from "./identity";
export type { Identity } from "./identity";
export { PROJECTS } from "./projects";
export type { Project } from "./projects";
export { SUGGESTED_PROMPTS } from "./prompts";
export { TECHNICAL_EVIDENCE } from "./technicalEvidence";
export type { TechnicalEvidence } from "./technicalEvidence";

export const PROFILE_DATA = {
  person: IDENTITY,
  aiProductCapabilities: IDENTITY.aiProductCapabilities,
  hobbies: IDENTITY.personalSignals,
  technicalTools: IDENTITY.technicalTools,
  experience: EXPERIENCE,
  projects: PROJECTS,
  education: EDUCATION,
  fitThemes: FIT_EVIDENCE,
  technicalEvidence: TECHNICAL_EVIDENCE,
  suggestedPrompts: SUGGESTED_PROMPTS,
} as const;

export type ProfileData = typeof PROFILE_DATA;
