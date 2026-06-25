import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const chunksPath = resolve(root, "src/lib/jj/generated/knowledge-chunks.json");
const outPath = resolve(root, "src/lib/jj/generated/portfolio-index.json");
const model = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

loadDotEnv(resolve(root, ".env"));
loadDotEnv(resolve(root, ".env.local"));

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required to build the JJ embedding index");
}

const chunks = JSON.parse(await readFile(chunksPath, "utf8"));
const embedded = [];

for (let i = 0; i < chunks.length; i += 64) {
  const batch = chunks.slice(i, i + 64);
  const inputs = batch.map(buildEmbeddingText);
  const embeddings = await createEmbeddings(inputs);

  for (let j = 0; j < batch.length; j += 1) {
    embedded.push({
      ...batch[j],
      embedding: embeddings[j],
    });
  }

  console.log(`Embedded ${Math.min(i + batch.length, chunks.length)} / ${chunks.length}`);
}

await mkdir(dirname(outPath), { recursive: true });
await writeFile(
  outPath,
  `${JSON.stringify(
    {
      model,
      generatedAt: new Date().toISOString(),
      count: embedded.length,
      chunks: embedded,
    },
    null,
    2
  )}\n`
);

console.log(`Wrote JJ embedding index to ${outPath}`);

function buildEmbeddingText(chunk) {
  return [
    `id: ${chunk.id}`,
    `entityType: ${chunk.entityType}`,
    `entityId: ${chunk.entityId}`,
    `title: ${chunk.title}`,
    `aliases: ${chunk.aliases.join(", ")}`,
    `retrievalText: ${chunk.retrievalText}`,
    `facts: ${chunk.facts.join(" ")}`,
    `tags: ${chunk.metadata.tags.join(", ")}`,
    chunk.metadata.companyId ? `companyId: ${chunk.metadata.companyId}` : "",
    chunk.metadata.projectId ? `projectId: ${chunk.metadata.projectId}` : "",
    chunk.metadata.songId ? `songId: ${chunk.metadata.songId}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function createEmbeddings(input) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input }),
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message ?? `OpenAI embeddings request failed: ${response.status}`;
    throw new Error(message);
  }

  return data.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

function loadDotEnv(path) {
  try {
    if (!existsSync(path)) return;
    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // Optional local env loading only.
  }
}
