import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime-2";

const commandSchema = {
  type: "object",
  properties: {
    commands: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "scroll_to_section",
              "focus_project",
              "highlight_project",
              "open_project_link",
              "focus_experience",
              "highlight_outcome",
              "music_play",
              "music_pause",
              "music_next",
              "music_previous",
              "music_play_track",
              "music_set_volume",
              "agent_set_volume",
              "open_music_player",
              "close_music_player",
            ],
          },
          sectionId: { type: "string" },
          projectId: { type: "string" },
          linkType: { type: "string", enum: ["github", "demo", "caseStudy"] },
          companyId: { type: "string" },
          outcomeId: { type: "string" },
          songId: { type: "string" },
          volume: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["type"],
        additionalProperties: false,
      },
    },
  },
  required: ["commands"],
  additionalProperties: false,
};

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "OpenAI-Safety-Identifier": "personal-website-jj-demo",
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: REALTIME_MODEL,
        instructions: [
          "You are JJ, Jarvis Junior, Rakshit Lodha's voice-first portfolio guide.",
          "Speak like a polished British AI butler: calm, precise, lightly witty, and composed.",
          "Use crisp British diction and concise phrasing, but do not imitate any specific actor, celebrity, or copyrighted character exactly.",
          "Answer briefly and naturally in voice.",
          "Use execute_site_command when the user asks to move around the site, focus a project or experience, or control music.",
          "Use retrieve_portfolio_context before answering specific questions about Rakshit's projects, work, skills, education, or music meaning.",
          "Do not invent evidence. If evidence is missing, say that plainly.",
          "Never produce numeric fit scores, ratings, percentages, or 0-10 fit numbers.",
          "Only call open_project_link when the user explicitly asks to open a link.",
        ].join("\n"),
        audio: {
          output: {
            voice: process.env.OPENAI_REALTIME_VOICE ?? "cedar",
          },
        },
        reasoning: {
          effort: "low",
        },
        tools: [
          {
            type: "function",
            name: "execute_site_command",
            description:
              "Dispatch one or more intentional website commands for navigation, highlighting, link opening, music control, or JJ volume.",
            parameters: commandSchema,
          },
          {
            type: "function",
            name: "control_music",
            description:
              "Control the website music player. Use for play, pause, next, previous, play a track by song ID, volume, and opening or closing the player.",
            parameters: commandSchema,
          },
          {
            type: "function",
            name: "retrieve_portfolio_context",
            description:
              "Retrieve compact portfolio context for a user question. Returns grounded chunks and suggested site/music commands; the browser may auto-apply safe focus or highlight commands.",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string" },
              },
              required: ["query"],
              additionalProperties: false,
            },
          },
        ],
        tool_choice: "auto",
      },
    }),
  });

  const data = (await response.json()) as unknown;
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
