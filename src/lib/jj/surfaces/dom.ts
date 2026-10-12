"use client";

import type { SiteCommandResult } from "../commandHandlers";
import type { SurfaceAdapter } from "./types";

/**
 * The scroll site (`/`): scroll the section into view and flash it.
 * This is the original behaviour of commandHandlers and stays the default.
 */

const HIGHLIGHT_CLASS = "jj-highlight";
const LEGACY_HIGHLIGHT_CLASS = "jj-command-highlight";
const SCROLL_OFFSET_PX = 112;
let clearHighlightTimer: number | null = null;

function scrollToElement(element: Element): void {
  const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth",
  });
}

function flashElement(element: Element): void {
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}, .${LEGACY_HIGHLIGHT_CLASS}`).forEach((target) => {
    target.classList.remove(HIGHLIGHT_CLASS, LEGACY_HIGHLIGHT_CLASS);
  });
  if (clearHighlightTimer !== null) window.clearTimeout(clearHighlightTimer);

  element.classList.remove(HIGHLIGHT_CLASS);
  window.setTimeout(() => element.classList.add(HIGHLIGHT_CLASS), 20);
  clearHighlightTimer = window.setTimeout(() => {
    element.classList.remove(HIGHLIGHT_CLASS, LEGACY_HIGHLIGHT_CLASS);
    clearHighlightTimer = null;
  }, 6000);
}

function reveal(element: Element | null, missing: string, done: string): SiteCommandResult {
  if (!element) return { ok: false, message: missing };
  scrollToElement(element);
  flashElement(element);
  return { ok: true, message: done };
}

export const domSurfaceAdapter: SurfaceAdapter = {
  id: "dom",
  focusSection: (sectionId) =>
    reveal(
      document.getElementById(sectionId),
      `Section not found: ${sectionId}`,
      `Scrolled to ${sectionId}`
    ),
  focusProject: (projectId) =>
    reveal(
      document.querySelector(`[data-jj-project-id="${projectId}"]`),
      `Project not found: ${projectId}`,
      `Focused project ${projectId}`
    ),
  focusExperience: (companyId) =>
    reveal(
      document.querySelector(`[data-jj-company-id="${companyId}"]`),
      `Experience not found: ${companyId}`,
      `Focused experience ${companyId}`
    ),
  focusOutcome: (outcomeId) =>
    reveal(
      document.querySelector(`[data-jj-outcome-id="${outcomeId}"]`),
      `Outcome not found: ${outcomeId}`,
      `Highlighted outcome ${outcomeId}`
    ),
};
