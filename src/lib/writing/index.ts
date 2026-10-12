import type { WritingEntry } from "@/lib/roman/types";

/** No authored writing exists yet; these are labelled placeholders, one per kind. */
const SAMPLE_ENTRIES: WritingEntry[] = [
  {
    slug: "sample-essay",
    kind: "essay",
    title: "An idea worth exploring",
    summary: "Placeholder for a longer essay.",
    sample: true,
  },
  {
    slug: "sample-note",
    kind: "note",
    title: "A question I keep returning to",
    summary: "Placeholder for a short note.",
    sample: true,
  },
  {
    slug: "sample-work-in-progress",
    kind: "work-in-progress",
    title: "Something I changed my mind about",
    summary: "Placeholder for a piece still being written.",
    sample: true,
  },
];

export async function getWritingEntries(): Promise<WritingEntry[]> {
  return SAMPLE_ENTRIES;
}
