import { EDUCATION } from "../education";
import { EXPERIENCE } from "../experience";
import { FIT_EVIDENCE } from "../fitEvidence";
import { HIRING_PREFERENCES } from "../hiringPreferences";
import { IDENTITY } from "../identity";
import { PROJECTS } from "../projects";
import { SUGGESTED_PROMPTS } from "../prompts";
import { TECHNICAL_EVIDENCE } from "../technicalEvidence";
import { PROFILE_V2_DEEP_EVIDENCE } from "./deepEvidence";

export { PROFILE_V2_DEEP_EVIDENCE } from "./deepEvidence";
export type { DeepEvidenceInput } from "./deepEvidence";

export const PROFILE_DATA_V2 = {
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
  deepEvidence: PROFILE_V2_DEEP_EVIDENCE,
} as const;
