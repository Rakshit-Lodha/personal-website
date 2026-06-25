import { retrievePortfolioContext } from "../retrieval";
import type { RetrievalEvalCase, RetrievalEvalResult } from "../knowledgeTypes";
import type { SiteCommand } from "../commands";
import { JJ_RETRIEVAL_CASES } from "./retrievalCases";

type PerCaseResult = RetrievalEvalResult & {
  query: string;
  vectorChunkIds: string[];
  rejectedChunkIds: string[];
  expectedChunks: string[];
  acceptableChunks: string[];
  forbiddenChunks: string[];
  expectedCommands: SiteCommand[];
  actualCommands: SiteCommand[];
};

type AggregateMetrics = {
  cases: number;
  passed: number;
  recallAt10: number;
  precisionAt5: number;
  mrr: number;
  forbiddenHitRate: number;
  commandAccuracy: number;
};

export async function runRetrievalEval(
  cases: RetrievalEvalCase[] = JJ_RETRIEVAL_CASES
): Promise<{ perCase: PerCaseResult[]; aggregate: AggregateMetrics }> {
  const perCase: PerCaseResult[] = [];

  for (const testCase of cases) {
    const vectorResult = await retrievePortfolioContext(testCase.query, {
      limit: 10,
      rerank: false,
    });
    const rerankedResult = await retrievePortfolioContext(testCase.query, {
      limit: 5,
      rerank: true,
    });

    const vectorChunkIds = vectorResult.chunks.map((chunk) => chunk.id);
    const selectedChunkIds = rerankedResult.chunks.map((chunk) => chunk.id);
    const rejectedChunkIds = rerankedResult.rejected.map((item) => item.chunkId);
    const expectedChunks = testCase.expectedChunks;
    const acceptableChunks = testCase.acceptableChunks ?? [];
    const forbiddenChunks = testCase.forbiddenChunks ?? [];
    const expectedCommands = testCase.expectedCommands ?? [];
    const actualCommands = [
      ...rerankedResult.commandFastPath,
      ...rerankedResult.selected.flatMap((item) => item.suggestedCommands),
    ];

    const expectedInVector = expectedChunks.filter((id) => vectorChunkIds.includes(id)).length;
    const expectedInSelected = expectedChunks.filter((id) => selectedChunkIds.includes(id)).length;
    const forbiddenHits = forbiddenChunks.filter((id) => selectedChunkIds.includes(id));
    const commandMatches = commandsMatch(expectedCommands, actualCommands);
    const passed =
      expectedInVector === expectedChunks.length &&
      (expectedChunks.length === 0 || expectedInSelected > 0) &&
      forbiddenHits.length === 0 &&
      commandMatches;

    const notes: string[] = [];
    if (expectedInVector !== expectedChunks.length) {
      notes.push(`Missing expected chunk(s) from vector recall: ${expectedChunks.filter((id) => !vectorChunkIds.includes(id)).join(", ")}`);
    }
    if (expectedChunks.length > 0 && expectedInSelected === 0) {
      notes.push(`Reranker selected none of expected chunks: ${expectedChunks.join(", ")}`);
    }
    if (forbiddenHits.length > 0) {
      notes.push(`Forbidden chunks selected: ${forbiddenHits.join(", ")}`);
    }
    if (!commandMatches) {
      notes.push(`Expected command(s) not found: ${expectedCommands.map(commandKey).join(", ")}`);
    }

    perCase.push({
      caseId: testCase.id,
      query: testCase.query,
      passed,
      retrievedChunkIds: rerankedResult.chunks.map((chunk) => chunk.id),
      selectedChunkIds,
      vectorChunkIds,
      rejectedChunkIds,
      commandMatches,
      expectedChunks,
      acceptableChunks,
      forbiddenChunks,
      expectedCommands,
      actualCommands,
      notes,
    });
  }

  return { perCase, aggregate: aggregate(perCase) };
}

function aggregate(perCase: PerCaseResult[]): AggregateMetrics {
  const expectedCases = perCase.filter((item) => item.expectedChunks.length > 0);
  const recallAt10 =
    expectedCases.length === 0
      ? 1
      : average(
          expectedCases.map((item) => {
            const hits = item.expectedChunks.filter((id) => item.vectorChunkIds.includes(id)).length;
            return hits / item.expectedChunks.length;
          })
        );

  const precisionAt5 =
    expectedCases.length === 0
      ? 1
      : average(
          expectedCases.map((item) => {
            const relevant = new Set([...item.expectedChunks, ...item.acceptableChunks]);
            if (item.selectedChunkIds.length === 0) return 0;
            return item.selectedChunkIds.filter((id) => relevant.has(id)).length / item.selectedChunkIds.length;
          })
        );

  const mrr =
    expectedCases.length === 0
      ? 1
      : average(
          expectedCases.map((item) => {
            const rank = item.selectedChunkIds.findIndex((id) => item.expectedChunks.includes(id));
            return rank < 0 ? 0 : 1 / (rank + 1);
          })
        );

  const forbiddenCases = perCase.filter((item) => item.forbiddenChunks.length > 0);
  const forbiddenHitRate =
    forbiddenCases.length === 0
      ? 0
      : average(
          forbiddenCases.map((item) =>
            item.selectedChunkIds.some((id) => item.forbiddenChunks.includes(id)) ? 1 : 0
          )
        );

  const commandCases = perCase.filter((item) => item.expectedCommands.length > 0);
  const commandAccuracy =
    commandCases.length === 0
      ? 1
      : average(commandCases.map((item) => (item.commandMatches ? 1 : 0)));

  return {
    cases: perCase.length,
    passed: perCase.filter((item) => item.passed).length,
    recallAt10,
    precisionAt5,
    mrr,
    forbiddenHitRate,
    commandAccuracy,
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function commandsMatch(expected: SiteCommand[], actual: SiteCommand[]): boolean {
  return expected.every((expectedCommand) =>
    actual.some((actualCommand) => commandKey(actualCommand) === commandKey(expectedCommand))
  );
}

function commandKey(command: SiteCommand): string {
  switch (command.type) {
    case "scroll_to_section":
      return `${command.type}:${command.sectionId}`;
    case "focus_project":
    case "highlight_project":
      return `${command.type}:${command.projectId}`;
    case "open_project_link":
      return `${command.type}:${command.projectId}:${command.linkType}`;
    case "focus_experience":
      return `${command.type}:${command.companyId}`;
    case "highlight_outcome":
      return `${command.type}:${command.outcomeId}`;
    case "music_play_track":
      return `${command.type}:${command.songId}`;
    case "music_set_volume":
    case "agent_set_volume":
      return command.type;
    default:
      return command.type;
  }
}
