import type { SiteCommand } from "./commands";
import type { KnowledgeChunk } from "./knowledgeTypes";
import type { RetrievedPortfolioContext, RetrievalCandidate } from "./retrieval";

type RerankOptions = {
  limit: number;
  commandFastPath: SiteCommand[];
  fallback: () => RetrievedPortfolioContext;
};

type RerankResponse = {
  selected: Array<{
    chunkId: string;
    relevance: "high" | "medium" | "low";
    reason: string;
    useForAnswer: boolean;
    useForAction: boolean;
  }>;
  rejected: Array<{
    chunkId: string;
    reason: string;
  }>;
  missingEvidence: string[];
};

const RERANK_MODEL = process.env.OPENAI_JJ_RERANK_MODEL ?? process.env.OPENAI_CONTEXT_MODEL ?? "gpt-4o";

export async function rerankPortfolioCandidates(
  query: string,
  candidates: RetrievalCandidate[],
  options: RerankOptions
): Promise<RetrievedPortfolioContext> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || candidates.length === 0) return options.fallback();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: RERANK_MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "You rerank portfolio knowledge chunks for a voice portfolio agent.",
              "Select the best chunks for answering and action.",
              "Do not write the final user-facing answer.",
              "Never invent chunk IDs. Use only the provided candidates.",
              "Return JSON with selected, rejected, and missingEvidence.",
              "Prefer exact entity/alias matches, professional evidence for work questions, and song chunks for music meaning questions.",
            ].join("\n"),
          },
          {
            role: "user",
            content: JSON.stringify({
              query,
              maxSelected: options.limit,
              candidates: candidates.map((candidate) => candidateForPrompt(candidate.chunk)),
            }),
          },
        ],
      }),
    });

    if (!response.ok) return options.fallback();

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const parsed = parseRerankJson(data.choices?.[0]?.message?.content);
    if (!parsed) return options.fallback();

    return buildRerankedResult(query, candidates, parsed, options);
  } catch {
    return options.fallback();
  }
}

function candidateForPrompt(chunk: KnowledgeChunk) {
  return {
    chunkId: chunk.id,
    entityType: chunk.entityType,
    entityId: chunk.entityId,
    title: chunk.title,
    aliases: chunk.aliases.slice(0, 12),
    speechSummary: chunk.speechSummary,
    facts: chunk.facts.slice(0, 6),
    tags: chunk.metadata.tags.slice(0, 12),
    preferredCommands: chunk.preferredCommands.slice(0, 4),
  };
}

function parseRerankJson(content: string | null | undefined): RerankResponse | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as Partial<RerankResponse>;
    if (!Array.isArray(parsed.selected)) return null;
    return {
      selected: parsed.selected.filter(isValidSelected),
      rejected: Array.isArray(parsed.rejected) ? parsed.rejected.filter(isValidRejected) : [],
      missingEvidence: Array.isArray(parsed.missingEvidence)
        ? parsed.missingEvidence.filter((item): item is string => typeof item === "string")
        : [],
    };
  } catch {
    return null;
  }
}

function isValidSelected(value: unknown): value is RerankResponse["selected"][number] {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.chunkId === "string" &&
    (item.relevance === "high" || item.relevance === "medium" || item.relevance === "low") &&
    typeof item.reason === "string" &&
    typeof item.useForAnswer === "boolean" &&
    typeof item.useForAction === "boolean"
  );
}

function isValidRejected(value: unknown): value is RerankResponse["rejected"][number] {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.chunkId === "string" && typeof item.reason === "string";
}

function buildRerankedResult(
  query: string,
  candidates: RetrievalCandidate[],
  reranked: RerankResponse,
  options: RerankOptions
): RetrievedPortfolioContext {
  const candidateById = new Map(candidates.map((candidate) => [candidate.chunk.id, candidate]));
  const selected = reranked.selected
    .map((item) => ({ item, candidate: candidateById.get(item.chunkId) }))
    .filter((entry): entry is { item: RerankResponse["selected"][number]; candidate: RetrievalCandidate } =>
      Boolean(entry.candidate)
    )
    .slice(0, options.limit);

  if (selected.length === 0) return options.fallback();

  const selectedIds = new Set(selected.map((entry) => entry.candidate.chunk.id));
  const rejectedFromModel = reranked.rejected
    .filter((item) => candidateById.has(item.chunkId) && !selectedIds.has(item.chunkId))
    .slice(0, 8);
  const rejectedFallback = candidates
    .filter((candidate) => !selectedIds.has(candidate.chunk.id))
    .slice(0, Math.max(0, 8 - rejectedFromModel.length))
    .map((candidate) => ({
      chunkId: candidate.chunk.id,
      reason: "Not selected by reranker",
    }));

  return {
    query,
    chunks: selected.map((entry) => entry.candidate.chunk),
    commandFastPath: options.commandFastPath,
    selected: selected.map(({ item, candidate }) => ({
      chunkId: candidate.chunk.id,
      relevance: item.relevance,
      reason: item.reason,
      useForAnswer: item.useForAnswer,
      useForAction: item.useForAction,
      suggestedCommands: [...options.commandFastPath, ...candidate.chunk.preferredCommands].slice(0, 5),
    })),
    rejected: [...rejectedFromModel, ...rejectedFallback],
    missingEvidence: reranked.missingEvidence,
  };
}
