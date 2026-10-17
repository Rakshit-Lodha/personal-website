import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { museEditionSchema, type MuseEdition } from "./schema";

/**
 * Git-backed edition store. Muse publishes each daily edition by committing a
 * validated JSON file here; the site reads it at build time. No database, no
 * publisher API needed for the daily flow.
 */
const EDITIONS_DIR = join(process.cwd(), "content", "reading", "editions");

function readEditionFile(name: string): MuseEdition | null {
  try {
    return museEditionSchema.parse(JSON.parse(readFileSync(join(EDITIONS_DIR, name), "utf8")));
  } catch {
    return null;
  }
}

/** Published and text-only editions, newest first. Drafts and invalid files never surface. */
export function getPublishedEditions(): MuseEdition[] {
  if (!existsSync(EDITIONS_DIR)) return [];
  return readdirSync(EDITIONS_DIR)
    .filter((name) => name.endsWith(".json"))
    .map(readEditionFile)
    .filter((edition): edition is MuseEdition => edition !== null && edition.status !== "draft")
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Newest published edition. Reads files newest-first and stops at the first valid one. */
export function getLatestPublishedEdition(): MuseEdition | null {
  if (!existsSync(EDITIONS_DIR)) return null;
  const names = readdirSync(EDITIONS_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .reverse();
  for (const name of names) {
    const edition = readEditionFile(name);
    if (edition && edition.status !== "draft") return edition;
  }
  return null;
}

/** One edition by date. Reads only that file. */
export function getPublishedEdition(date: string): MuseEdition | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !existsSync(EDITIONS_DIR)) return null;
  const edition = readEditionFile(`${date}.json`);
  return edition && edition.status !== "draft" ? edition : null;
}

/** Committed audio file name -> public URL served from /public. */
export function audioSrc(audioAssetId: string): string {
  return `/reading/audio/${audioAssetId}`;
}
