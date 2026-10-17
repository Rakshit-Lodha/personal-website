"use client";

import { useEffect } from "react";
import { useSiteActions } from "@/components/jj/SiteActionProvider";
import { emitSelect } from "@/components/roman/select";
import { EXPERIENCE } from "@/lib/profile/experience";

/** JJ's section vocabulary mapped onto the v2 section ids. Education has no v2 section. */
const SECTIONS: Record<string, string> = { hero: "top", "my-story": "work", projects: "products", "skill-map": "products" };

function scrollToId(id: string) {
  const element = document.getElementById(id);
  if (!element) return false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  return true;
}

function showChapter(companyId: string) {
  emitSelect("experience", companyId);
  return scrollToId("work")
    ? { ok: true as const, message: `Showing ${companyId}` }
    : { ok: false as const, message: "Work section not found" };
}

/** Registers /roman-v2 as JJ's navigation surface. Renders nothing. */
export default function RomanV2Surface() {
  const { registerSurface } = useSiteActions();

  useEffect(
    () =>
      registerSurface({
        id: "roman-v2",
        focusSection: (sectionId) => {
          const id = SECTIONS[sectionId];
          if (!id || !scrollToId(id)) return { ok: false, message: `Not on this page: ${sectionId}` };
          return { ok: true, message: `Scrolled to ${id}` };
        },
        focusProject: (projectId) =>
          scrollToId("products")
            ? { ok: true, message: `Showing products for ${projectId}` }
            : { ok: false, message: "Products section not found" },
        focusExperience: (companyId) => showChapter(companyId),
        focusOutcome: (outcomeId) => {
          const company = EXPERIENCE.find((item) => item.outcomes.some((outcome) => outcome.id === outcomeId));
          return company ? showChapter(company.id) : { ok: false, message: `Outcome not found: ${outcomeId}` };
        },
      }),
    [registerSurface]
  );

  return null;
}
