import type { SiteCommandResult } from "../commandHandlers";
import type {
  JJCompanyId,
  JJOutcomeId,
  JJProjectId,
  JJSectionId,
} from "../entities";

/**
 * How navigation commands are carried out on the current surface.
 *
 * The scroll site (`/`) scrolls and flashes DOM nodes; the city (`/city`) flies the
 * camera and opens a panel. Both speak the same SiteCommand vocabulary, so the agent,
 * prompts, tool schemas, and evals are identical on either surface.
 */
export type SurfaceAdapter = {
  id: string;
  focusSection: (sectionId: JJSectionId) => SiteCommandResult;
  focusProject: (projectId: JJProjectId, mode: "focus" | "highlight") => SiteCommandResult;
  focusExperience: (companyId: JJCompanyId) => SiteCommandResult;
  focusOutcome: (outcomeId: JJOutcomeId) => SiteCommandResult;
};
