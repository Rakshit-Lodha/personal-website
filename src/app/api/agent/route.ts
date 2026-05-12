import { Agent, run, tool } from "@openai/agents";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
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
const WEBSEARCH_MODEL = process.env.OPENAI_WEBSEARCH_MODEL || "gpt-4o";
const openai = new OpenAI();

const ContextBriefSchema = z.object({
  responseType: z.enum(["qa", "fitment", "both"]),
  selectedSections: z.array(z.string()).max(6),
  contextBrief: z.string(),
  missingEvidence: z.array(z.string()).max(5),
});

const CompanySourceSchema = z.object({
  title: z.string(),
  url: z.string(),
});

const CompanyBriefSchema = z.object({
  companyName: z.string(),
  companyUrl: z.string(),
  companySummary: z.string(),
  productAreas: z.array(z.string()).max(6),
  businessModel: z.string(),
  targetUsers: z.array(z.string()).max(6),
  hiringOrProductSignals: z.array(z.string()).max(6),
  fitRelevantContext: z.array(z.string()).max(6),
  openQuestions: z.array(z.string()).max(5),
  sources: z.array(CompanySourceSchema).max(6),
});

type CompanyBrief = z.infer<typeof CompanyBriefSchema>;

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

async function websearch(companyUrl: string, userQuestion: string): Promise<CompanyBrief> {
  const result = await openai.responses.parse({
    model: WEBSEARCH_MODEL,
    tools: [{ type: "web_search", search_context_size: "low" }],
    tool_choice: "auto",
    text: {
      format: zodTextFormat(CompanyBriefSchema, "company_brief"),
    },
    input: [
      {
        role: "system",
        content:
          "You research companies from public web sources for a portfolio fit agent. Use web search when needed. Be conservative: do not infer funding, tech stack, hiring needs, or company stage unless public sources support it. Return compact structured JSON only.",
      },
      {
        role: "user",
        content: [
          `Company URL: ${companyUrl}`,
          `Visitor question: ${userQuestion}`,
          "Find public information about what this company does, who it serves, what products or business areas are visible, and which facts matter for assessing whether Rakshit Lodha is a relevant product/AI/fintech fit.",
          "Include only source URLs you actually used. If evidence is sparse, say so in openQuestions.",
        ].join("\n\n"),
      },
    ],
  });

  const parsed = result.output_parsed;
  if (!parsed) throw new Error("Websearch returned no structured company brief.");

  return parsed;
}

const websearchTool = tool({
  name: "websearch",
  description:
    "Research a public company URL with gpt-5-nano and web search, then return a compact company brief for fit assessment.",
  parameters: z.object({
    companyUrl: z.string().describe("The public company website URL to research."),
    userQuestion: z.string().describe("The visitor's question or fit context."),
  }),
  execute: async ({ companyUrl, userQuestion }) => JSON.stringify(await websearch(companyUrl, userQuestion)),
});

function extractFirstUrl(text: string) {
  const match = text.match(/https?:\/\/[^\s<>"')]+/i);
  if (!match) return null;

  try {
    return new URL(match[0]).toString();
  } catch {
    return null;
  }
}

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
    websearchTool,
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
- If the visitor provides a company URL and no company websearch brief is present, call websearch before assessing fit.
- Do not call websearch again when a company websearch brief is already present.
- Use only facts returned by tools, present in the provided profile context, or present in the conversation.
- If the visitor uses a typo or synonym, answer using the canonical profile term when the meaning is clear. Do not mark a synonym as missing evidence when the underlying capability is present.
- Do not combine separate facts into a new claim. If a tool appears only as a general capability, say that; do not attach it to a named project unless the context explicitly links them.
- Do not invent employers, dates, metrics, links, technologies, education, or claims.
- If a company websearch brief is provided, use it to assess company relevance, but clearly distinguish public company facts from Rakshit's profile evidence.
- When company web facts materially affect the answer, put sources only at the very end of answerText under a "Sources" heading as a markdown bullet list.
- Never insert source URLs, source titles, or "Sources:" inline inside an answer paragraph.
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
- cta: a short next action, usually "Ask my AI agent" or "Email me".
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

function formatCompanyBrief(companyBrief: CompanyBrief) {
  return [
    `Company: ${companyBrief.companyName}`,
    `URL: ${companyBrief.companyUrl}`,
    `Summary: ${companyBrief.companySummary}`,
    `Product areas: ${companyBrief.productAreas.join(", ") || "Not enough public evidence"}`,
    `Business model: ${companyBrief.businessModel || "Not enough public evidence"}`,
    `Target users: ${companyBrief.targetUsers.join(", ") || "Not enough public evidence"}`,
    companyBrief.hiringOrProductSignals.length
      ? `Public hiring/product signals:\n${companyBrief.hiringOrProductSignals.map((item) => `- ${item}`).join("\n")}`
      : "Public hiring/product signals: none found",
    companyBrief.fitRelevantContext.length
      ? `Fit-relevant company context:\n${companyBrief.fitRelevantContext.map((item) => `- ${item}`).join("\n")}`
      : "Fit-relevant company context: none found",
    companyBrief.openQuestions.length
      ? `Open questions / weak evidence:\n${companyBrief.openQuestions.map((item) => `- ${item}`).join("\n")}`
      : "Open questions / weak evidence: none identified",
    companyBrief.sources.length
      ? `Sources:\n${companyBrief.sources.map((source) => `- ${source.title}: ${source.url}`).join("\n")}`
      : "Sources: none",
  ].join("\n");
}

function toAgentInputWithContext(
  mode: string,
  messages: { role: "user" | "assistant"; content: string }[],
  context: z.infer<typeof ContextBriefSchema>,
  companyBrief?: CompanyBrief,
) {
  return [
    `Requested mode: ${mode}`,
    `Context-classified response type: ${context.responseType}`,
    companyBrief
      ? [
          "Company websearch brief:",
          formatCompanyBrief(companyBrief),
          "Use this company context only as public web evidence. Cite source URLs in answerText when company facts materially affect the fit assessment.",
        ].join("\n\n")
      : "Company websearch brief: none",
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
        const latestUserMessage = parsed.messages.findLast((message) => message.role === "user");
        const companyUrl = latestUserMessage ? extractFirstUrl(latestUserMessage.content) : null;
        let companyBrief: CompanyBrief | undefined;

        if (companyUrl && latestUserMessage) {
          send({ type: "status", message: "Researching company website" });
          companyBrief = await websearch(companyUrl, latestUserMessage.content);
        }

        send({ type: "status", message: "Reading profile context" });
        const contextMessages =
          companyBrief && latestUserMessage
            ? [
                ...parsed.messages,
                {
                  role: "user" as const,
                  content: `Company websearch brief for fit context:\n${formatCompanyBrief(companyBrief)}`,
                },
              ]
            : parsed.messages;

        const contextResult = await run(contextAgent, toContextInput(companyBrief ? "fit" : parsed.mode, contextMessages), {
          maxTurns: 2,
        });
        const context = contextResult.finalOutput;
        if (!context) throw new Error("Context agent returned no final output.");

        send({ type: "status", message: "Summarizing relevant context" });

        const result = await run(rakshitAgent, toAgentInputWithContext(companyBrief ? "fit" : parsed.mode, parsed.messages, context, companyBrief), {
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
        console.log("Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : "No stack trace",
        });
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
