"use client";

import { useEffect } from "react";
import { useSiteActions } from "@/components/jj/SiteActionProvider";
import { emitSelect } from "./select";
import s from "./roman.module.css";

/** Section ids from the scroll site that JJ may still send. */
const SECTION_ALIASES: Record<string, string> = { hero: "arrival", "my-story": "journey", "skill-map": "projects" };

/**
 * Scroll the page (vertically only: the hall walks itself sideways) to an element. The journey stage is
 * pinned during the walk-in, so anything inside it is measured against where the stage rests afterwards.
 */
function scrollTo(element: Element, block: "start" | "center" = "start") {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rect = element.getBoundingClientRect();
  const stage = element.closest("[data-walk-stage]") ?? element.querySelector(":scope > [data-walk-stage]");
  const section = stage?.parentElement;
  let top = rect.top + window.scrollY;
  let offset = block === "center" ? (window.innerHeight - rect.height) / 2 : 72;
  if (stage && section) {
    const rest = section.getBoundingClientRect().top + window.scrollY + section.offsetHeight - (stage as HTMLElement).offsetHeight;
    if (element === section) offset = 0;
    top = rest + (element === section ? 0 : rect.top - stage.getBoundingClientRect().top);
  }
  window.scrollTo({ top: Math.max(0, top - offset), behavior: reduced ? "auto" : "smooth" });
}

/** Expand the owning chapter/project first, then scroll once it has rendered. */
function reveal(kind: "experience" | "project", id: string, targetId: string, flash = false) {
  if (!document.getElementById(targetId)) return { ok: false as const, message: `Not on this page: ${targetId}` };
  emitSelect(kind, id);
  window.setTimeout(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    scrollTo(target, flash ? "center" : "start");
    if (flash) {
      target.classList.add(s.flash);
      window.setTimeout(() => target.classList.remove(s.flash), 2500);
    }
  }, 80);
  return { ok: true as const, message: `Showing ${targetId}` };
}

/** Registers the Roman page as JJ's navigation surface. Renders nothing. */
export default function RomanSurface() {
  const { registerSurface } = useSiteActions();

  useEffect(
    () =>
      registerSurface({
        id: "roman",
        focusSection: (sectionId) => {
          const id = SECTION_ALIASES[sectionId] ?? sectionId;
          const section = document.getElementById(id);
          if (!section) return { ok: false, message: `Section not found: ${sectionId}` };
          scrollTo(section);
          return { ok: true, message: `Scrolled to ${id}` };
        },
        focusProject: (projectId) => reveal("project", projectId, `project-${projectId}`),
        focusExperience: (companyId) => reveal("experience", companyId, `experience-${companyId}`),
        focusOutcome: (outcomeId) => {
          const chapter = document.getElementById(outcomeId)?.closest("[id^='experience-']");
          if (!chapter) return { ok: false, message: `Outcome not found: ${outcomeId}` };
          return reveal("experience", chapter.id.replace("experience-", ""), outcomeId, true);
        },
      }),
    [registerSurface]
  );

  return null;
}
