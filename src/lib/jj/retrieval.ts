import generatedChunks from "./generated/knowledge-chunks.json";
import portfolioIndex from "./generated/portfolio-index.json";
import { rerankPortfolioCandidates } from "./rerank";
import { validateSiteCommand, type SiteCommand } from "./commands";
import {
  JJ_COMPANY_ALIASES,
  JJ_PROJECT_ALIASES,
  JJ_SONG_ALIASES,
  normalizeCompanyId,
  normalizeProjectId,
  normalizeSongId,
} from "./entities";
import type { EmbeddedKnowledgeChunk, KnowledgeChunk, RetrievalResult } from "./knowledgeTypes";

const JJ_KNOWLEDGE_CHUNKS = generatedChunks as KnowledgeChunk[];
const JJ_EMBEDDED_CHUNKS = portfolioIndex.chunks as EmbeddedKnowledgeChunk[];
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? portfolioIndex.model ?? "text-embedding-3-small";

export type RetrievedPortfolioContext = RetrievalResult & {
  chunks: KnowledgeChunk[];
  commandFastPath: SiteCommand[];
  skippedReason?: string;
};

export type RetrievalCandidate = {
  chunk: KnowledgeChunk;
  score: number;
  reasons: string[];
};

const STOPWORDS = new Set([
  "a",
  "about",
  "and",
  "are",
  "can",
  "for",
  "give",
  "he",
  "his",
  "i",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "rakshit",
  "tell",
  "the",
  "to",
  "what",
  "who",
  "with",
]);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.news/g, " news")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function hasPhrase(haystack: string, needle: string): boolean {
  return normalizeText(haystack).includes(normalizeText(needle));
}

export function detectCommands(query: string): SiteCommand[] {
  const normalized = normalizeText(query);
  const commands: SiteCommand[] = [];

  if (/\b(play|start)\b.*\b(music|song|track)\b/.test(normalized)) {
    commands.push({ type: "music_play" });
  }
  if (/\b(pause|stop)\b.*\b(music|song|track)\b/.test(normalized)) {
    commands.push({ type: "music_pause" });
  }
  if (/\b(next|skip)\b.*\b(song|track|music)\b/.test(normalized)) {
    commands.push({ type: "music_next" });
  }
  if (/\b(previous|prev|back)\b.*\b(song|track|music)\b/.test(normalized)) {
    commands.push({ type: "music_previous" });
  }
  if (/\b(open|show)\b.*\b(music player|player)\b/.test(normalized)) {
    commands.push({ type: "open_music_player" });
  }
  if (/\b(project|projects)\b/.test(normalized) && /\b(show|go|open|scroll|take)\b/.test(normalized)) {
    commands.push({ type: "scroll_to_section", sectionId: "projects" });
  }

  const projectId = Object.keys(JJ_PROJECT_ALIASES).find((alias) => hasPhrase(query, alias));
  const normalizedProjectId = projectId ? normalizeProjectId(projectId) : null;
  if (normalizedProjectId && /\b(show|focus|highlight|open|go|take)\b/.test(normalized)) {
    commands.push({ type: "focus_project", projectId: normalizedProjectId });
  }

  const companyId = Object.keys(JJ_COMPANY_ALIASES).find((alias) => hasPhrase(query, alias));
  const normalizedCompanyId = companyId ? normalizeCompanyId(companyId) : null;
  if (normalizedCompanyId && /\b(show|focus|highlight|open|go|take)\b/.test(normalized)) {
    commands.push({ type: "focus_experience", companyId: normalizedCompanyId });
  }
  if (normalizedCompanyId && /\b(play|start)\b/.test(normalized) && /\b(song|track|music|phase|related)\b/.test(normalized)) {
    const songByCompany = {
      etmoney: "what-good-looks-like",
      indmoney: "closer-to-the-choice",
      learnapp: "make-it-to-the-end",
    } as const;
    commands.push({ type: "music_play_track", songId: songByCompany[normalizedCompanyId] });
  }

  const songId = Object.keys(JJ_SONG_ALIASES).find((alias) => hasPhrase(query, alias));
  const normalizedSongId = songId ? normalizeSongId(songId) : null;
  if (normalizedSongId && /\b(play|start)\b/.test(normalized)) {
    commands.push({ type: "music_play_track", songId: normalizedSongId });
  }

  return commands.filter((command) => validateSiteCommand(command).ok);
}

export function classifyCommandIntent(query: string): {
  isPureCommand: boolean;
  commands: SiteCommand[];
} {
  const normalized = normalizeText(query);
  const commands = detectCommands(query);
  const asksForKnowledge = /\b(about|tell|explain|what|why|how|detail|details|describe|compare|which|related)\b/.test(
    normalized
  );
  const hasCommandVerb = /\b(play|pause|stop|next|previous|prev|skip|open|show|go|scroll|focus|highlight|take)\b/.test(
    normalized
  );

  return {
    isPureCommand: commands.length > 0 && hasCommandVerb && !asksForKnowledge,
    commands,
  };
}

function scoreChunk(
  query: string,
  chunk: KnowledgeChunk,
  vectorScore: number
): { score: number; reasons: string[] } {
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokens(query);
  const detectedProjectId = Object.keys(JJ_PROJECT_ALIASES)
    .map((alias) => (hasPhrase(query, alias) ? normalizeProjectId(alias) : null))
    .find(Boolean);
  const detectedCompanyId = Object.keys(JJ_COMPANY_ALIASES)
    .map((alias) => (hasPhrase(query, alias) ? normalizeCompanyId(alias) : null))
    .find(Boolean);
  const searchText = normalizeText(
    [
      chunk.id,
      chunk.title,
      chunk.entityType,
      chunk.entityId,
      ...chunk.aliases,
      chunk.retrievalText,
      chunk.speechSummary,
      ...chunk.facts,
      ...chunk.metadata.tags,
    ].join("\n")
  );
  let score = chunk.metadata.priority / 100 + vectorScore;
  const reasons: string[] = [];

  if (vectorScore > 0) {
    reasons.push("Embedding similarity");
  }

  if (detectedProjectId && chunk.entityType === "project" && chunk.entityId !== detectedProjectId) {
    score -= 30;
    reasons.push("Suppressed non-matching project for exact project query");
  }

  if (detectedCompanyId && chunk.entityType === "song" && chunk.metadata.companyId === detectedCompanyId) {
    score += 18;
    reasons.push("Company-song mapping");
  }

  for (const alias of chunk.aliases) {
    if (alias && hasPhrase(normalizedQuery, alias)) {
      score += 14;
      reasons.push(`Alias match: ${alias}`);
    }
  }

  if (hasPhrase(normalizedQuery, chunk.title) || hasPhrase(normalizedQuery, chunk.entityId)) {
    score += 18;
    reasons.push("Exact entity match");
  }

  const matchingTokens = queryTokens.filter((token) => searchText.includes(token));
  score += matchingTokens.length * 1.4;
  if (matchingTokens.length) reasons.push(`Token matches: ${matchingTokens.slice(0, 6).join(", ")}`);

  if (chunk.entityType === "project" && detectedProjectId) {
    if (detectedProjectId === chunk.entityId) {
      score += 20;
      reasons.push("Project alias fast path");
    }
  }

  if (chunk.entityType === "song" && Object.keys(JJ_SONG_ALIASES).some((alias) => hasPhrase(query, alias))) {
    const songId = Object.keys(JJ_SONG_ALIASES)
      .map((alias) => (hasPhrase(query, alias) ? normalizeSongId(alias) : null))
      .find(Boolean);
    if (songId === chunk.entityId) {
      score += 20;
      reasons.push("Song alias fast path");
    }
  }

  return { score, reasons };
}

export async function retrievePortfolioContext(
  query: string,
  options: { limit?: number; rerank?: boolean; useEmbeddings?: boolean } = {}
): Promise<RetrievedPortfolioContext> {
  const limit = options.limit ?? 6;
  const commandIntent = classifyCommandIntent(query);

  if (commandIntent.isPureCommand) {
    return {
      query,
      chunks: [],
      selected: [],
      rejected: [],
      missingEvidence: [],
      commandFastPath: commandIntent.commands,
      skippedReason: "Pure command fast path skipped portfolio retrieval.",
    };
  }

  const queryEmbedding = options.useEmbeddings === false ? null : await embedQuery(query);
  const vectorScores = queryEmbedding ? scoreVectorMatches(queryEmbedding) : new Map<string, number>();
  const scored = JJ_KNOWLEDGE_CHUNKS.map((chunk) => ({
    chunk,
    ...scoreChunk(query, chunk, vectorScores.get(chunk.id) ?? 0),
  }))
    .filter((item) => item.score > 1.5)
    .sort((a, b) => b.score - a.score);

  const commandFastPath = commandIntent.commands;
  const candidates = scored.slice(0, Math.max(12, limit * 2));
  const result = options.rerank === false
    ? buildRetrievalResult(query, candidates.slice(0, limit), scored, commandFastPath)
    : await rerankPortfolioCandidates(query, candidates, {
        limit,
        commandFastPath,
        fallback: () => buildRetrievalResult(query, candidates.slice(0, limit), scored, commandFastPath),
      });

  return result;
}

export function buildRetrievalResult(
  query: string,
  selectedCandidates: RetrievalCandidate[],
  allCandidates: RetrievalCandidate[],
  commandFastPath: SiteCommand[]
): RetrievedPortfolioContext {
  const chunks = selectedCandidates.map((item) => item.chunk);

  return {
    query,
    chunks,
    commandFastPath,
    selected: selectedCandidates.map((item) => ({
      chunkId: item.chunk.id,
      relevance: item.score >= 15 ? "high" : item.score >= 7 ? "medium" : "low",
      reason: item.reasons.join("; ") || "Lexical relevance",
      useForAnswer: true,
      useForAction: item.chunk.preferredCommands.length > 0,
      suggestedCommands: [...commandFastPath, ...item.chunk.preferredCommands].slice(0, 5),
    })),
    rejected: allCandidates
      .filter((item) => !selectedCandidates.some((selected) => selected.chunk.id === item.chunk.id))
      .slice(0, 8)
      .map((item) => ({
        chunkId: item.chunk.id,
        reason: "Lower ranked lexical match",
      })),
    missingEvidence:
      chunks.length > 0
        ? []
        : ["No matching JJ knowledge chunk found. Ask a more specific question or build the embedding index."],
  };
}

async function embedQuery(query: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: query,
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
  return data.data?.[0]?.embedding ?? null;
}

function scoreVectorMatches(queryEmbedding: number[]): Map<string, number> {
  const scores = JJ_EMBEDDED_CHUNKS.map((chunk) => ({
    id: chunk.id,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  })).sort((a, b) => b.score - a.score);

  const map = new Map<string, number>();
  scores.slice(0, 12).forEach((item, index) => {
    map.set(item.id, Math.max(0, item.score) * 12 + Math.max(0, 4 - index * 0.25));
  });
  return map;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    aMag += a[i] * a[i];
    bMag += b[i] * b[i];
  }
  if (aMag === 0 || bMag === 0) return 0;
  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
}
