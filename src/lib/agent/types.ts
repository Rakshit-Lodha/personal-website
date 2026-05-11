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
  fitScore?: string;
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

export type AgentStreamEvent =
  | { type: "status"; message: string }
  | { type: "delta"; text: string }
  | { type: "final"; response: AgentResponse }
  | { type: "error"; message: string };
