import type { SiteCommand } from "./commands";

export type JJTurnState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "executing"
  | "interrupted"
  | "error";

export type JJVoiceEvent =
  | { type: "state"; state: JJTurnState }
  | { type: "transcript_delta"; text: string }
  | { type: "transcript_final"; text: string }
  | { type: "assistant_delta"; text: string }
  | { type: "assistant_final"; text: string }
  | { type: "command"; command: SiteCommand }
  | { type: "error"; message: string };

export type JJSessionStatus = {
  state: JJTurnState;
  connected: boolean;
  lastError?: string;
};
