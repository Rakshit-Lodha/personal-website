"use client";

import { useEffect, useMemo } from "react";
import { useSiteActions } from "@/components/jj/SiteActionProvider";
import type { SurfaceAdapter } from "@/lib/jj/surfaces/types";
import type { SiteCommandResult } from "@/lib/jj/commandHandlers";
import {
  PLACE_BY_COMPANY,
  PLACE_BY_PROJECT,
  companyForOutcome,
  type Place,
} from "./atlas";

type CityControls = {
  /** Fly to a place and open its panel. */
  focusPlace: (placeId: string) => void;
  /** Return to the wide city view. */
  resetView: () => void;
  /** Light up one outcome floor inside a company building. */
  highlightFloor: (companyId: string, outcomeId: string) => void;
};

/** Which place a `/` section maps to in the city. */
const SECTION_TO_PLACE: Record<string, string | null> = {
  hero: null,
  "my-story": "etmoney",
  projects: "ai-hiring-chat",
  "skill-map": "factory",
  education: "academy",
};

/**
 * Registers the city as the active surface for JJ's navigation commands, so the
 * same SiteCommand vocabulary flies the camera instead of scrolling the page.
 */
export function useCitySurface(controls: CityControls) {
  const { registerSurface } = useSiteActions();

  const adapter = useMemo<SurfaceAdapter>(() => {
    const go = (place: Place | undefined, missing: string, done: string): SiteCommandResult => {
      if (!place) return { ok: false, message: missing };
      controls.focusPlace(place.id);
      return { ok: true, message: done };
    };

    return {
      id: "city",
      focusSection: (sectionId) => {
        const placeId = SECTION_TO_PLACE[sectionId];
        if (placeId === null) {
          controls.resetView();
          return { ok: true, message: "Returned to the city view" };
        }
        if (!placeId) return { ok: false, message: `No district for section: ${sectionId}` };
        controls.focusPlace(placeId);
        return { ok: true, message: `Flew to ${placeId}` };
      },
      focusProject: (projectId) =>
        go(
          PLACE_BY_PROJECT[projectId],
          `No building for project: ${projectId}`,
          `Flew to project ${projectId}`
        ),
      focusExperience: (companyId) =>
        go(
          PLACE_BY_COMPANY[companyId],
          `No building for company: ${companyId}`,
          `Flew to ${companyId}`
        ),
      focusOutcome: (outcomeId) => {
        const companyId = companyForOutcome(outcomeId);
        const place = companyId ? PLACE_BY_COMPANY[companyId] : undefined;
        if (!place || !companyId) return { ok: false, message: `No floor for outcome: ${outcomeId}` };
        controls.focusPlace(place.id);
        controls.highlightFloor(companyId, outcomeId);
        return { ok: true, message: `Lit up ${outcomeId} in ${companyId}` };
      },
    };
  }, [controls]);

  useEffect(() => registerSurface(adapter), [registerSurface, adapter]);
}
