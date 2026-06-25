"use client";

import { SONGS } from "@/lib/musicData";
import { PROJECTS } from "@/lib/profile/projects";
import {
  canOpenExternalLink,
  validateSiteCommand,
  type SiteCommand,
  type ValidatedSiteCommand,
} from "./commands";

export type MusicCommandControls = {
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  setSong: (index: number) => void;
  setVolume: (volume: number) => void;
  openSheet: () => void;
  closeSheet: () => void;
};

export type SiteCommandHandlerOptions = {
  music: MusicCommandControls;
  setAgentVolume?: (volume: number) => void;
  explicitUserIntent?: boolean;
};

export type SiteCommandResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const HIGHLIGHT_CLASS = "jj-command-highlight";
const SCROLL_OFFSET_PX = 112;

function scrollToElement(element: Element): void {
  const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth",
  });
}

function flashElement(element: Element): void {
  element.classList.remove(HIGHLIGHT_CLASS);
  window.setTimeout(() => element.classList.add(HIGHLIGHT_CLASS), 20);
  window.setTimeout(() => element.classList.remove(HIGHLIGHT_CLASS), 1800);
}

function targetBySelector(selector: string): Element | null {
  return document.querySelector(selector);
}

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
  switch (command.type) {
    case "scroll_to_section": {
      const target = document.getElementById(command.sectionId);
      if (!target) return { ok: false, message: `Section not found: ${command.sectionId}` };
      scrollToElement(target);
      flashElement(target);
      return { ok: true, message: `Scrolled to ${command.sectionId}` };
    }
    case "focus_project":
    case "highlight_project": {
      const target = targetBySelector(`[data-jj-project-id="${command.projectId}"]`);
      if (!target) return { ok: false, message: `Project not found: ${command.projectId}` };
      scrollToElement(target);
      flashElement(target);
      return { ok: true, message: `Focused project ${command.projectId}` };
    }
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
    case "focus_experience": {
      const target = targetBySelector(`[data-jj-company-id="${command.companyId}"]`);
      if (!target) return { ok: false, message: `Experience not found: ${command.companyId}` };
      scrollToElement(target);
      flashElement(target);
      return { ok: true, message: `Focused experience ${command.companyId}` };
    }
    case "highlight_outcome": {
      const target = targetBySelector(`[data-jj-outcome-id="${command.outcomeId}"]`);
      if (!target) return { ok: false, message: `Outcome not found: ${command.outcomeId}` };
      scrollToElement(target);
      flashElement(target);
      return { ok: true, message: `Highlighted outcome ${command.outcomeId}` };
    }
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
      options.music.setSong(index);
      window.setTimeout(options.music.play, 80);
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
