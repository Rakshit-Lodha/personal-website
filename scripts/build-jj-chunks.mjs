import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outPath = resolve(root, "src/lib/jj/generated/knowledge-chunks.json");

const jiti = createJiti(import.meta.url, {
  moduleCache: false,
  tsconfigPaths: true,
});

const { buildKnowledgeChunks } = await jiti.import("../src/lib/jj/buildKnowledgeChunks.ts");
const chunks = buildKnowledgeChunks();

validateChunks(chunks);

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(chunks, null, 2)}\n`);

console.log(`Wrote ${chunks.length} JJ knowledge chunks to ${outPath}`);

function validateChunks(chunks) {
  const ids = new Set();
  for (const chunk of chunks) {
    assertString(chunk.id, "id");
    assertString(chunk.entityType, `${chunk.id}.entityType`);
    assertString(chunk.title, `${chunk.id}.title`);
    assertString(chunk.retrievalText, `${chunk.id}.retrievalText`);
    assertString(chunk.speechSummary, `${chunk.id}.speechSummary`);
    assertArray(chunk.metadata?.tags, `${chunk.id}.metadata.tags`);
    assertArray(chunk.preferredCommands, `${chunk.id}.preferredCommands`);

    if (ids.has(chunk.id)) {
      throw new Error(`Duplicate chunk id: ${chunk.id}`);
    }
    ids.add(chunk.id);

    if (chunk.entityType === "project" && chunk.metadata?.links) {
      for (const [key, value] of Object.entries(chunk.metadata.links)) {
        if (value != null && typeof value !== "string") {
          throw new Error(`${chunk.id}.metadata.links.${key} must be a string`);
        }
      }
    }

    if (chunk.entityType === "song") {
      assertString(chunk.metadata?.songId, `${chunk.id}.metadata.songId`);
      const text = `${chunk.retrievalText} ${chunk.speechSummary} ${chunk.facts.join(" ")} ${chunk.metadata.tags.join(" ")}`;
      if (!/Style:/i.test(text)) {
        throw new Error(`${chunk.id} must include song style context`);
      }
    }
  }
}

function assertString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array`);
  }
}
