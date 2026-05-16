export type AgentMode = "auto" | "fit" | "ask" | "both";
export type AgentResponseType = "qa" | "fitment" | "both";

export type AgentMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentBrief = {
  responseType: AgentResponseType;
  mode: "fit" | "ask";
  headline: string;
  fitLevel: "Strong fit" | "Relevant fit" | "Partial fit" | "Not enough evidence";
  summary: string;
  proofPoints: string[];
  relevantProjects: string[];
  relevantOutcomes: string[];
  gapsOrUnknowns: string[];
  suggestedFollowups: string[];
  cta: string;
};

export type AgentResponse = AgentBrief & {
  answerText: string;
};

export type AgentStatusStage =
  | "websearch_start"
  | "websearch_complete"
  | "context_start"
  | "context_complete"
  | "answer_start"
  | "answer_complete";

export type AgentStreamEvent =
  | { type: "status"; stage: AgentStatusStage; elapsed_ms: number; message: string }
  | { type: "delta"; text: string }
  | { type: "final"; response: AgentResponse }
  | { type: "error"; message: string };
