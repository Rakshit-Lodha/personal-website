import type { ReadingEdition } from "@/lib/roman/types";
import { SAMPLE_EDITION } from "./fixture";
import { museEditionSchema } from "./schema";
import { audioSrc, getLatestPublishedEdition } from "./store";

/** Latest published edition, or the validated sample fixture when nothing is published yet. */
export async function getLatestEdition(): Promise<ReadingEdition | null> {
  const published = getLatestPublishedEdition();
  if (published) {
    return {
      date: published.date,
      title: published.title,
      summary: published.summary,
      url: `/reading/${published.date}`,
      audio:
        published.audioAssetId && published.audioDurationSeconds
          ? { src: audioSrc(published.audioAssetId), durationSeconds: published.audioDurationSeconds }
          : undefined,
      sources: published.sources,
      sample: false,
    };
  }
  const edition = museEditionSchema.parse(SAMPLE_EDITION);
  return {
    date: edition.date,
    title: edition.title,
    summary: edition.summary,
    sources: edition.sources,
    sample: true,
  };
}
