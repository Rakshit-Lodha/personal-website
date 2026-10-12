"use client";

import { SONGS } from "@/lib/musicData";
import { PROJECTS } from "@/lib/profile/projects";
import {
  canOpenExternalLink,
  validateSiteCommand,
  type SiteCommand,
  type ValidatedSiteCommand,
} from "./commands";
import { domSurfaceAdapter } from "./surfaces/dom";
import type { SurfaceAdapter } from "./surfaces/types";

export type MusicCommandControls = {
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  setSong: (index: number, opts?: { summonedBy?: "jj" }) => void;
  setVolume: (volume: number) => void;
  openSheet: () => void;
  closeSheet: () => void;
  resetSummonedBy: () => void;
};

export type SiteCommandHandlerOptions = {
  music: MusicCommandControls;
  setAgentVolume?: (volume: number) => void;
  explicitUserIntent?: boolean;
  /** Defaults to the scroll site's DOM behaviour. */
  surface?: SurfaceAdapter;
};

export type SiteCommandResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function projectLink(projectId: string, linkType: "github" | "demo" | "caseStudy"): string | null {
  const project = PROJECTS.find((item) => item.id === projectId);
  const links = project?.links;
  if (!links) return null;
  if (linkType === "github") return links.github ?? null;
  if (linkType === "demo") return links.demo ?? null;
  return null;
}

function runValidatedCommand(
  command: ValidatedSiteCommand,
  options: SiteCommandHandlerOptions
): SiteCommandResult {
  const surface = options.surface ?? domSurfaceAdapter;
  switch (command.type) {
    case "scroll_to_section":
      return surface.focusSection(command.sectionId);
    case "focus_project":
    case "highlight_project":
      return surface.focusProject(
        command.projectId,
        command.type === "focus_project" ? "focus" : "highlight"
      );
    case "open_project_link": {
      const href = projectLink(command.projectId, command.linkType);
      if (!href) {
        return {
          ok: false,
          message: `No ${command.linkType} link for project ${command.projectId}`,
        };
      }
      window.open(href, href.startsWith("/") ? "_self" : "_blank", "noopener,noreferrer");
      return { ok: true, message: `Opened ${command.linkType} for ${command.projectId}` };
    }
    case "focus_experience":
      return surface.focusExperience(command.companyId);
    case "highlight_outcome":
      return surface.focusOutcome(command.outcomeId);
    case "music_play":
      options.music.play();
      return { ok: true, message: "Music playing" };
    case "music_pause":
      options.music.pause();
      return { ok: true, message: "Music paused" };
    case "music_next":
      options.music.next();
      options.music.play();
      return { ok: true, message: "Skipped to next track" };
    case "music_previous":
      options.music.prev();
      options.music.play();
      return { ok: true, message: "Went to previous track" };
    case "music_play_track": {
      const index = SONGS.findIndex((song) => song.id === command.songId);
      if (index < 0) return { ok: false, message: `Song not found: ${command.songId}` };
      options.music.setSong(index, { summonedBy: "jj" });
      if (window.matchMedia("(max-width: 1023px)").matches) {
        window.setTimeout(options.music.play, 80);
      } else {
        options.music.openSheet();
      }
      return { ok: true, message: `Playing ${command.songId}` };
    }
    case "music_set_volume":
      options.music.setVolume(command.volume);
      return { ok: true, message: `Music volume set to ${command.volume}` };
    case "agent_set_volume":
      options.setAgentVolume?.(command.volume);
      return { ok: true, message: `Agent volume set to ${command.volume}` };
    case "open_music_player":
      options.music.openSheet();
      return { ok: true, message: "Opened music player" };
    case "close_music_player":
      options.music.closeSheet();
      return { ok: true, message: "Closed music player" };
    default:
      return { ok: false, message: "Unsupported command" };
  }
}

export function handleSiteCommand(
  command: SiteCommand,
  options: SiteCommandHandlerOptions
): SiteCommandResult {
  const explicitUserIntent = options.explicitUserIntent ?? command.type === "open_project_link";
  if (!canOpenExternalLink(command, { explicitUserIntent })) {
    return { ok: false, message: "External link open blocked without explicit user intent" };
  }

  const validation = validateSiteCommand(command);
  if (!validation.ok) return { ok: false, message: validation.reason };
  return runValidatedCommand(validation.command, options);
}
