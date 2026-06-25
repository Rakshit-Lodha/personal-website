import {
  JJ_COMPANY_IDS,
  JJ_OUTCOME_IDS,
  JJ_PROJECT_IDS,
  JJ_SONG_IDS,
  normalizeCompanyId,
  normalizeProjectId,
  normalizeSectionId,
  normalizeSongId,
  type JJCompanyId,
  type JJOutcomeId,
  type JJProjectId,
  type JJSectionId,
  type JJSongId,
} from "./entities";

export type SiteCommand =
  | { type: "scroll_to_section"; sectionId: JJSectionId | "skills" }
  | { type: "focus_project"; projectId: JJProjectId | string }
  | { type: "highlight_project"; projectId: JJProjectId | string }
  | {
      type: "open_project_link";
      projectId: JJProjectId | string;
      linkType: "github" | "demo" | "caseStudy";
    }
  | { type: "focus_experience"; companyId: JJCompanyId | string }
  | { type: "highlight_outcome"; outcomeId: JJOutcomeId | string }
  | { type: "music_play" }
  | { type: "music_pause" }
  | { type: "music_next" }
  | { type: "music_previous" }
  | { type: "music_play_track"; songId: JJSongId | string }
  | { type: "music_set_volume"; volume: number }
  | { type: "agent_set_volume"; volume: number }
  | { type: "open_music_player" }
  | { type: "close_music_player" };

export type ValidatedSiteCommand =
  | { type: "scroll_to_section"; sectionId: JJSectionId }
  | { type: "focus_project"; projectId: JJProjectId }
  | { type: "highlight_project"; projectId: JJProjectId }
  | {
      type: "open_project_link";
      projectId: JJProjectId;
      linkType: "github" | "demo" | "caseStudy";
    }
  | { type: "focus_experience"; companyId: JJCompanyId }
  | { type: "highlight_outcome"; outcomeId: JJOutcomeId }
  | { type: "music_play" }
  | { type: "music_pause" }
  | { type: "music_next" }
  | { type: "music_previous" }
  | { type: "music_play_track"; songId: JJSongId }
  | { type: "music_set_volume"; volume: number }
  | { type: "agent_set_volume"; volume: number }
  | { type: "open_music_player" }
  | { type: "close_music_player" };

export type CommandValidationResult =
  | { ok: true; command: ValidatedSiteCommand }
  | { ok: false; reason: string };

const clampVolume = (volume: number) => Math.max(0, Math.min(1, volume));

export function isExternalOpenCommand(command: SiteCommand): boolean {
  return command.type === "open_project_link";
}

export function canOpenExternalLink(
  command: SiteCommand,
  options: { explicitUserIntent: boolean }
): boolean {
  if (!isExternalOpenCommand(command)) return true;
  return options.explicitUserIntent;
}

export function validateSiteCommand(command: SiteCommand): CommandValidationResult {
  switch (command.type) {
    case "scroll_to_section": {
      const sectionId = normalizeSectionId(command.sectionId);
      return sectionId
        ? { ok: true, command: { type: "scroll_to_section", sectionId } }
        : { ok: false, reason: `Unknown section: ${command.sectionId}` };
    }
    case "focus_project":
    case "highlight_project": {
      const projectId = normalizeProjectId(command.projectId);
      if (!projectId || !JJ_PROJECT_IDS.includes(projectId)) {
        return { ok: false, reason: `Unknown project: ${command.projectId}` };
      }
      return { ok: true, command: { type: command.type, projectId } };
    }
    case "open_project_link": {
      const projectId = normalizeProjectId(command.projectId);
      if (!projectId || !JJ_PROJECT_IDS.includes(projectId)) {
        return { ok: false, reason: `Unknown project: ${command.projectId}` };
      }
      return {
        ok: true,
        command: { type: "open_project_link", projectId, linkType: command.linkType },
      };
    }
    case "focus_experience": {
      const companyId = normalizeCompanyId(command.companyId);
      if (!companyId || !JJ_COMPANY_IDS.includes(companyId)) {
        return { ok: false, reason: `Unknown company: ${command.companyId}` };
      }
      return { ok: true, command: { type: "focus_experience", companyId } };
    }
    case "highlight_outcome": {
      if (!JJ_OUTCOME_IDS.includes(command.outcomeId as JJOutcomeId)) {
        return { ok: false, reason: `Unknown outcome: ${command.outcomeId}` };
      }
      return {
        ok: true,
        command: { type: "highlight_outcome", outcomeId: command.outcomeId as JJOutcomeId },
      };
    }
    case "music_play_track": {
      const songId = normalizeSongId(command.songId);
      if (!songId || !JJ_SONG_IDS.includes(songId)) {
        return { ok: false, reason: `Unknown song: ${command.songId}` };
      }
      return { ok: true, command: { type: "music_play_track", songId } };
    }
    case "music_set_volume":
    case "agent_set_volume":
      return {
        ok: true,
        command: { type: command.type, volume: clampVolume(command.volume) },
      };
    default:
      return { ok: true, command };
  }
}
