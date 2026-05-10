import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import type { AgentResponse, AgentStreamEvent } from "@/lib/agent/types";
import {
  getExperienceOutcomes,
  getIdentityContext,
  getProjectDetails,
  searchProfileEvidence,
} from "@/lib/agent/retrieval";

export const runtime = "nodejs";

const AgentRequestSchema = z.object({
  mode: z.enum(["auto", "fit", "ask"]).default("auto"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(8000),
      }),
    )
    .min(1)
    .max(40),
});

const AgentResponseSchema = z.object({
  mode: z.enum(["fit", "ask"]),
  headline: z.string(),
  fitLevel: z.enum(["Strong fit", "Relevant fit", "Partial fit", "Not enough evidence"]),
  fitScore: z.string().optional(),
  summary: z.string(),
  answerText: z.string(),
  proofPoints: z.array(z.string()).max(6),
  relevantProjects: z.array(z.string()).max(5),
  relevantOutcomes: z.array(z.string()).max(6),
  gapsOrUnknowns: z.array(z.string()).max(4),
  suggestedFollowups: z.array(z.string()).max(4),
  cta: z.string(),
});

const MODEL = process.env.OPENAI_AGENT_MODEL || "gpt-5.5";

const searchProfileEvidenceTool = tool({
  name: "search_profile_evidence",
  description:
    "Search Rakshit Lodha's structured profile for fit themes, technical proof, projects, and outcomes relevant to a query.",
  parameters: z.object({
    query: z.string().describe("The visitor's role, company, product problem, or question."),
    mode: z.enum(["auto", "fit", "ask"]).default("auto"),
  }),
  execute: async ({ query, mode }) => JSON.stringify(searchProfileEvidence(query, mode)),
});

const getProjectDetailsTool = tool({
  name: "get_project_details",
  description:
    "Get detailed project evidence. If no project IDs are provided, returns the featured portfolio projects.",
  parameters: z.object({
    projectIds: z.array(z.string()).optional(),
  }),
  execute: async ({ projectIds }) => JSON.stringify(getProjectDetails(projectIds)),
});

const getExperienceOutcomesTool = tool({
  name: "get_experience_outcomes",
  description: "Search Rakshit's professional experience outcomes by company, domain, product, metric, or theme.",
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => JSON.stringify(getExperienceOutcomes(query)),
});

const getIdentityContextTool = tool({
  name: "get_identity_context",
  description: "Get Rakshit's high-level identity, positioning, capabilities, tools, and education.",
  parameters: z.object({}),
  execute: async () => JSON.stringify(getIdentityContext()),
});

const rakshitAgent = new Agent({
  name: "Rakshit Fit Agent",
  model: MODEL,
  outputType: AgentResponseSchema,
  tools: [
    searchProfileEvidenceTool,
    getProjectDetailsTool,
    getExperienceOutcomesTool,
    getIdentityContextTool,
  ],
  instructions: `
You represent Rakshit Lodha's portfolio. You help visitors evaluate whether Rakshit is relevant for a role, company, product problem, or collaboration.

Primary behavior:
- If the user provides a job description, product problem, company context, or asks about fit, produce a fit brief.
- If the user asks a general question, answer it directly and include structured evidence cards.
- Always call the profile tools before answering.
- Use only facts returned by tools or present in the conversation.
- Do not invent employers, dates, metrics, links, technologies, education, or claims.
- If evidence is missing, put it in gapsOrUnknowns instead of guessing.
- Be concise, confident, and outcome-led. Avoid resume boilerplate.
- Refer to Rakshit in third person.

Output requirements:
- answerText: 2-4 short paragraphs suitable for a chat bubble.
- fitScore: only include a score such as "8.2/10" when the visitor provided a JD, role context, or explicitly asked about fit. Omit it for normal Q&A.
- proofPoints: concrete evidence-backed claims.
- relevantProjects: project names plus why they matter.
- relevantOutcomes: metrics or outcomes relevant to the query.
- gapsOrUnknowns: honest limits or missing evidence.
- suggestedFollowups: useful next questions for the visitor.
- cta: a short next action, usually "Chat with me" or "Schedule a call".
`.trim(),
});

function toAgentInput(mode: string, messages: { role: "user" | "assistant"; content: string }[]) {
  return [
    `Requested mode: ${mode}`,
    "Conversation so far:",
    ...messages.map((message) => `${message.role === "user" ? "Visitor" : "Agent"}: ${message.content}`),
  ].join("\n\n");
}

function sse(event: AgentStreamEvent) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function chunkText(text: string) {
  const chunks = text.match(/.{1,42}(\s|$)/g);
  return chunks && chunks.length ? chunks : [text];
}

export async function POST(request: Request) {
  const encoder = new TextEncoder();

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  let parsed: z.infer<typeof AgentRequestSchema>;
  try {
    parsed = AgentRequestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid agent request." }, { status: 400 });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AgentStreamEvent) => controller.enqueue(encoder.encode(sse(event)));

      try {
        send({ type: "status", message: "Reading profile context" });
        send({ type: "status", message: "Retrieving evidence" });

        const result = await run(rakshitAgent, toAgentInput(parsed.mode, parsed.messages), {
          maxTurns: 6,
        });

        const response = result.finalOutput as AgentResponse | undefined;
        if (!response) throw new Error("Agent returned no final output.");

        send({ type: "status", message: "Drafting brief" });
        for (const chunk of chunkText(response.answerText)) {
          send({ type: "delta", text: chunk });
          await new Promise((resolve) => setTimeout(resolve, 18));
        }

        send({ type: "final", response });
      } catch (error) {
        console.error("Rakshit agent error", error);
        send({
          type: "error",
          message:
            "I could not generate a live agent response right now. Please try again in a moment.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
