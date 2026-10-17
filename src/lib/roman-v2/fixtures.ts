/**
 * Preview-only stand-ins that let /roman-v2 show its final layout before real content exists.
 * Used by content.ts only when the real source is missing. Never import these into profile, JJ,
 * metadata or search data, and never present them as published content.
 */
import type { RomanV2ReadingEdition, RomanV2WritingRow } from "./types";

export const READING_FIXTURE: Extract<RomanV2ReadingEdition, { fixture: true }> = {
  fixture: true,
  title: "Preview edition",
  summary: "Layout preview for the daily one-pager. No edition has been published yet.",
};

export const WRITING_FIXTURES: (RomanV2WritingRow & { fixture: true })[] = [
  { id: "preview-essay", kind: "Essay", title: "Untitled essay", summary: "Preview row", fixture: true, action: { available: false, label: "Untitled essay" } },
  { id: "preview-note", kind: "Note", title: "Untitled note", summary: "Preview row", fixture: true, action: { available: false, label: "Untitled note" } },
  { id: "preview-draft", kind: "Work in progress", title: "Untitled draft", summary: "Preview row", fixture: true, action: { available: false, label: "Untitled draft" } },
];
