import type { ReadingEdition } from "@/lib/roman/types";
import { SAMPLE_EDITION } from "./fixture";
import { museEditionSchema } from "./schema";

/**
 * Latest published edition. No publication store exists yet, so this returns the
 * validated fixture, flagged as a sample and without audio.
 */
export async function getLatestEdition(): Promise<ReadingEdition | null> {
  const edition = museEditionSchema.parse(SAMPLE_EDITION);
  return {
    date: edition.date,
    title: edition.title,
    summary: edition.summary,
    sources: edition.sources,
    sample: true,
  };
}
