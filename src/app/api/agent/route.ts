import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import type { AgentResponse, AgentStreamEvent } from "@/lib/agent/types";
import { serializeProfileSections } from "@/lib/agent/profileContext";
import {
  getExperienceOutcomes,
  getIdentityContext,
  getProjectDetails,
  searchProfileEvidence,
} from "@/lib/agent/retrieval";

export const runtime = "nodejs";

const AgentRequestSchema = z.object({
  mode: z.enum(["auto", "fit", "ask", "both"]).default("auto"),
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
  responseType: z.enum(["qa", "fitment", "both"]),
  mode: z.enum(["fit", "ask"]),
  headline: z.string(),
  fitLevel: z.enum(["Strong fit", "Relevant fit", "Partial fit", "Not enough evidence"]),
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
const CONTEXT_MODEL = process.env.OPENAI_CONTEXT_MODEL || "gpt-4o";

const ContextBriefSchema = z.object({
  responseType: z.enum(["qa", "fitment", "both"]),
  selectedSections: z.array(z.string()).max(6),
  contextBrief: z.string(),
  missingEvidence: z.array(z.string()).max(5),
});

const searchProfileEvidenceTool = tool({
  name: "search_profile_evidence",
  description:
    "Search Rakshit Lodha's structured profile for fit themes, technical proof, projects, and outcomes relevant to a query.",
  parameters: z.object({
    query: z.string().describe("The visitor's role, company, product problem, or question."),
    mode: z.enum(["auto", "fit", "ask", "both"]).default("auto"),
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

const contextAgent = new Agent({
  name: "Rakshit Context Selector",
  model: CONTEXT_MODEL,
  outputType: ContextBriefSchema,
  instructions: `
You prepare compact context for Rakshit Lodha's portfolio chat agent.

Given the visitor's latest query, conversation, and structured profile sections:
- Understand the intent even when the wording has typos, synonyms, or indirect phrasing.
- Treat clear typo corrections and common synonyms as the same concept when the profile supports it, such as "fir base" meaning Firebase and "split testing" meaning A/B testing.
- Select only the profile sections that are relevant.
- Summarize the selected section facts into a concise context brief.
- Preserve specific metrics, tools, employers, locations, project names, dates, and caveats.
- Keep general capabilities separate from project-specific evidence. Do not imply a tool was used in a project unless that project or evidence item explicitly says so.
- Do not invent evidence. Put missing information in missingEvidence.
- Classify responseType as:
  - "qa" for general questions.
  - "fitment" for JD, role-fit, hiring, requirements, or responsibility matching.
  - "both" when the user asks both a general question and fitment.
`.trim(),
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
- Classify the visitor's intent before answering:
  - responseType "qa": general questions about Rakshit's background, projects, outcomes, skills, education, work style, or preferences.
  - responseType "fitment": job descriptions, explicit role/company fit checks, hiring evaluations, or requirements/responsibilities matching.
  - responseType "both": the visitor asks a general question and also asks for role fit in the same turn.
- For responseType "qa", answer conversationally. Do not force a fit level, assessment structure, or strengths/gaps framing.
- For responseType "fitment" or "both", include the fitment fields needed for an assessment card.
- Use the provided profile context first. Call profile tools only if the context is not enough for a specific factual answer.
- Use only facts returned by tools, present in the provided profile context, or present in the conversation.
- If the visitor uses a typo or synonym, answer using the canonical profile term when the meaning is clear. Do not mark a synonym as missing evidence when the underlying capability is present.
- Do not combine separate facts into a new claim. If a tool appears only as a general capability, say that; do not attach it to a named project unless the context explicitly links them.
- Do not invent employers, dates, metrics, links, technologies, education, or claims.
- If evidence is missing, put it in gapsOrUnknowns instead of guessing.
- Be concise, confident, and outcome-led. Avoid resume boilerplate.
- Refer to Rakshit in third person.

Output requirements:
- answerText: 2-4 short paragraphs suitable for a chat bubble.
- mode: use "ask" for responseType "qa"; use "fit" for responseType "fitment" or "both".
- For responseType "qa", set headline and summary to empty strings, fitLevel to "Not enough evidence", and proofPoints, relevantProjects, relevantOutcomes, and gapsOrUnknowns to empty arrays.
- Do not include a match score, rating, percentage, or 0-10 fit number anywhere in the response.
- proofPoints: concrete evidence-backed claims for fitment assessments.
- relevantProjects: project names plus why they matter for fitment assessments.
- relevantOutcomes: metrics or outcomes relevant to fitment assessments.
- gapsOrUnknowns: honest limits or missing evidence for fitment assessments.
- suggestedFollowups: useful next questions for the visitor.
- cta: a short next action, usually "Chat with me" or "Schedule a call".
`.trim(),
});

function toContextInput(mode: string, messages: { role: "user" | "assistant"; content: string }[]) {
  return [
    `Requested mode: ${mode}`,
    "Conversation so far:",
    ...messages.map((message) => `${message.role === "user" ? "Visitor" : "Agent"}: ${message.content}`),
    "Structured profile sections:",
    serializeProfileSections(),
  ].join("\n\n");
}

function toAgentInputWithContext(
  mode: string,
  messages: { role: "user" | "assistant"; content: string }[],
  context: z.infer<typeof ContextBriefSchema>,
) {
  return [
    `Requested mode: ${mode}`,
    `Context-classified response type: ${context.responseType}`,
    `Selected profile sections: ${context.selectedSections.join(", ") || "none"}`,
    "Profile context brief:",
    context.contextBrief,
    context.missingEvidence.length
      ? `Missing or weak evidence:\n${context.missingEvidence.map((item) => `- ${item}`).join("\n")}`
      : "Missing or weak evidence: none identified",
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
        const contextResult = await run(contextAgent, toContextInput(parsed.mode, parsed.messages), {
          maxTurns: 2,
        });
        const context = contextResult.finalOutput;
        if (!context) throw new Error("Context agent returned no final output.");

        send({ type: "status", message: "Summarizing relevant context" });

        const result = await run(rakshitAgent, toAgentInputWithContext(parsed.mode, parsed.messages, context), {
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
