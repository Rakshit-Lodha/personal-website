import { Agent, run, tool } from "@openai/agents";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { AgentResponse, AgentStatusStage, AgentStreamEvent } from "@/lib/agent/types";
import { serializeProfileSections } from "@/lib/agent/profileContext";
import { getAgentPrompts } from "@/lib/agent/prompts";
import {
  getExperienceOutcomes,
  getIdentityContext,
  getProjectDetails,
  searchProfileEvidence,
} from "@/lib/agent/retrieval";
import { PROFILE_DATA } from "@/lib/profile";

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
const INTENT_MODEL = process.env.OPENAI_INTENT_MODEL || "gpt-4o-mini";
const SELECTED_PROMPTS = getAgentPrompts();
const PROMPT_VERSION = process.env.OPENAI_AGENT_PROMPT_VERSION || "v3Pipeline";
const IS_V3_PIPELINE = PROMPT_VERSION === "v3Pipeline";
const SELECTED_PROMPT_MAP = SELECTED_PROMPTS as unknown as Record<string, string>;

function selectedPrompt(key: string, fallback: string) {
  return SELECTED_PROMPT_MAP[key] || fallback;
}

function getOpenAIClient() {
  return new OpenAI();
}

const ContextBriefSchema = z.object({
  responseType: z.enum(["qa", "fitment", "both"]),
  selectedSections: z.array(z.string()).max(6),
  contextBrief: z.string(),
  missingEvidence: z.array(z.string()).max(5),
});

const IntentTargetSchema = z.object({
  roleTitle: z.string().nullish(),
  companyName: z.string().nullish(),
  companyUrl: z.string().nullish(),
  jdTextPresent: z.boolean(),
});

const IntentPlanSchema = z.object({
  responseType: z.enum(["qa", "fitment", "both"]),
  querySummary: z.string(),
  target: IntentTargetSchema,
  assumedTargetRole: z.string().nullish(),
  retrievalNeeds: z.array(z.string()).max(10),
  mustHaveCriteria: z.array(z.string()).max(8),
  missingOrAmbiguousInputs: z.array(z.string()).max(6),
  shouldResearchCompany: z.boolean(),
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
  likelyPMProblemSpaces: z.array(z.string()).max(6),
  likelyAIPMProblemSpaces: z.array(z.string()).max(6),
  domainSpecificRequirements: z.array(z.string()).max(8),
  uncertaintyNotes: z.array(z.string()).max(6),
  openQuestions: z.array(z.string()).max(5),
  sources: z.array(CompanySourceSchema).max(6),
});

type CompanyBrief = z.infer<typeof CompanyBriefSchema>;

const EvidenceItemSchema = z.object({
  id: z.string(),
  sourceType: z.enum(["identity", "experience", "project", "technical", "fitTheme", "deepEvidence", "company", "constraint"]),
  workContext: z.enum(["production", "professional", "personal_project", "generic_capability", "company_context", "constraint"]),
  evidenceStrength: z.enum(["direct_shipped", "direct_claim", "adjacent", "generic"]),
  title: z.string(),
  evidence: z.string(),
  relevance: z.string(),
  evidenceType: z.enum(["direct", "adjacent"]),
  supports: z.array(z.string()).max(5),
});

const CriteriaCoverageSchema = z.object({
  requirement: z.string(),
  weight: z.enum(["core", "supporting", "nice-to-have"]),
  status: z.enum(["direct", "adjacent", "missing"]),
  evidenceIds: z.array(z.string()).max(6),
  notes: z.string(),
});

const EvidencePacketSchema = z.object({
  summary: z.string(),
  directEvidence: z.array(EvidenceItemSchema).max(10),
  adjacentEvidence: z.array(EvidenceItemSchema).max(10),
  gaps: z.array(z.string()).max(8),
  criteriaCoverage: z.array(CriteriaCoverageSchema).max(8),
  strongestEvidenceIds: z.array(z.string()).max(6),
});

type IntentPlan = z.infer<typeof IntentPlanSchema>;
type EvidencePacket = z.infer<typeof EvidencePacketSchema>;

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

async function websearch(companyTarget: string, userQuestion: string): Promise<CompanyBrief> {
  const result = await getOpenAIClient().responses.parse({
    model: WEBSEARCH_MODEL,
    tools: [{ type: "web_search", search_context_size: "low" }],
    tool_choice: "auto",
    text: {
      format: zodTextFormat(CompanyBriefSchema, "company_brief"),
    },
    input: [
      {
        role: "system",
        content: selectedPrompt("companyResearchInstructions", [
          "You research companies from public web sources for a portfolio fit agent.",
          "Use web search when needed. Return compact structured JSON only.",
          "Infer likely PM and AI PM problem spaces from public company context, but do not claim there is an open role unless public sources support it.",
        ].join(" ")),
      },
      {
        role: "user",
        content: [
          `Company target: ${companyTarget}`,
          `Visitor question: ${userQuestion}`,
          "Find the company's official public website or strongest public source, then research what this company does, who it serves, what products or business areas are visible, which PM or AI PM problem spaces are likely, and which facts matter for assessing whether Rakshit Lodha is a relevant product/AI/fintech fit.",
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
    "Research a public company target with web search, then return a compact company brief for fit assessment.",
  parameters: z.object({
    companyUrl: z.string().describe("The public company website URL, bare domain, or company name to research."),
    userQuestion: z.string().describe("The visitor's question or fit context."),
  }),
  execute: async ({ companyUrl, userQuestion }) => JSON.stringify(await websearch(companyUrl, userQuestion)),
});

function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"')]+/i);
  if (!match) return null;

  try {
    return new URL(match[0]).toString();
  } catch {
    return null;
  }
}

function extractQuestionFromChatUrl(text: string) {
  const url = extractFirstUrl(text);
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const isPortfolioHost = ["rakshitlodha.com", "www.rakshitlodha.com", "localhost", "127.0.0.1"].includes(
      parsed.hostname,
    );
    const question = parsed.searchParams.get("q")?.trim();

    return isPortfolioHost && parsed.pathname === "/chat" && question ? question : null;
  } catch {
    return null;
  }
}

function normalizeBareDomain(domain: string) {
  const normalized = domain.replace(/[.,;:!?]+$/g, "").toLowerCase();

  try {
    return new URL(`https://${normalized}`).toString();
  } catch {
    return null;
  }
}

function extractBareDomain(text: string) {
  const matches = text.matchAll(/(?:^|[\s(<])((?:[a-z0-9-]+\.)+[a-z]{2,})(?:[/?#][^\s<>"')]*)?/gi);

  for (const match of matches) {
    const domain = match[1];
    if (!domain) continue;

    const normalized = normalizeBareDomain(domain);
    if (normalized) return normalized;
  }

  return null;
}

function mentionsKnownProfileDomain(text: string) {
  const normalized = text.toLowerCase();

  return ["krux.news", "rakshitlodha.com", "www.rakshitlodha.com"].some((domain) =>
    normalized.includes(domain),
  );
}

function cleanCompanyName(value: string) {
  return value
    .replace(/\b(the|a|an|this|that|at|for|with|role|company|startup|team|good|great|strong|relevant|fit)\b/gi, " ")
    .replace(/[^a-z0-9&.\- ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,;:!?]+$/g, "");
}

function extractCompanyNameFromFitQuestion(text: string) {
  const patterns = [
    /\b(?:fit|match)\s+(?:at|for|with)\s+([a-z0-9][a-z0-9&.\- ]{1,80})/i,
    /\b(?:at|for|with)\s+([a-z0-9][a-z0-9&.\- ]{1,80})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;

    const name = cleanCompanyName(match[1].split(/\b(?:because|if|and|or|where|who|that|which|when)\b/i)[0]);
    if (name && name.length <= 80) return name;
  }

  return null;
}

function hasCompanyFitIntent(text: string, requestedMode: z.infer<typeof AgentRequestSchema>["mode"]) {
  if (requestedMode === "fit" || requestedMode === "both") return true;

  const normalized = text.toLowerCase();
  return [
    "good fit",
    "great fit",
    "strong fit",
    "relevant fit",
    "would fit",
    "would be a fit",
    "fit at",
    "fit for",
    "fit with",
    "match for",
    "evaluate him for",
    "evaluate rakshit for",
    "assess fit",
  ].some((signal) => normalized.includes(signal));
}

function extractCompanyResearchTarget(text: string, requestedMode: z.infer<typeof AgentRequestSchema>["mode"]) {
  const chatUrlQuestion = extractQuestionFromChatUrl(text);
  if (chatUrlQuestion) {
    return extractCompanyResearchTarget(chatUrlQuestion, requestedMode);
  }

  if (!hasCompanyFitIntent(text, requestedMode) && mentionsKnownProfileDomain(text)) {
    return null;
  }

  return (
    extractFirstUrl(text) ||
    extractBareDomain(text) ||
    (hasCompanyFitIntent(text, requestedMode) ? extractCompanyNameFromFitQuestion(text) : null)
  );
}

const contextAgent = new Agent({
  name: "Rakshit Context Selector",
  model: CONTEXT_MODEL,
  outputType: ContextBriefSchema,
  instructions: SELECTED_PROMPTS.contextInstructions,
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
  instructions: SELECTED_PROMPTS.answerInstructions,
});

const intentPlannerAgent = new Agent({
  name: "Rakshit Intent Planner",
  model: INTENT_MODEL,
  outputType: IntentPlanSchema,
  instructions: selectedPrompt(
    "intentPlannerInstructions",
    "Classify the visitor query as qa, fitment, or both and return a compact retrieval plan.",
  ),
});

const evidenceGathererAgent = new Agent({
  name: "Rakshit Evidence Gatherer",
  model: CONTEXT_MODEL,
  outputType: EvidencePacketSchema,
  instructions: selectedPrompt(
    "evidenceGathererInstructions",
    "Classify retrieved Rakshit profile evidence into direct evidence, adjacent evidence, and gaps.",
  ),
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
    companyBrief.likelyPMProblemSpaces.length
      ? `Likely PM problem spaces:\n${companyBrief.likelyPMProblemSpaces.map((item) => `- ${item}`).join("\n")}`
      : "Likely PM problem spaces: not enough public evidence",
    companyBrief.likelyAIPMProblemSpaces.length
      ? `Likely AI PM problem spaces:\n${companyBrief.likelyAIPMProblemSpaces.map((item) => `- ${item}`).join("\n")}`
      : "Likely AI PM problem spaces: not enough public evidence",
    companyBrief.domainSpecificRequirements.length
      ? `Domain-specific requirements:\n${companyBrief.domainSpecificRequirements.map((item) => `- ${item}`).join("\n")}`
      : "Domain-specific requirements: none identified",
    companyBrief.hiringOrProductSignals.length
      ? `Public hiring/product signals:\n${companyBrief.hiringOrProductSignals.map((item) => `- ${item}`).join("\n")}`
      : "Public hiring/product signals: none found",
    companyBrief.fitRelevantContext.length
      ? `Fit-relevant company context:\n${companyBrief.fitRelevantContext.map((item) => `- ${item}`).join("\n")}`
      : "Fit-relevant company context: none found",
    companyBrief.openQuestions.length
      ? `Open questions / weak evidence:\n${companyBrief.openQuestions.map((item) => `- ${item}`).join("\n")}`
      : "Open questions / weak evidence: none identified",
    companyBrief.uncertaintyNotes.length
      ? `Uncertainty notes:\n${companyBrief.uncertaintyNotes.map((item) => `- ${item}`).join("\n")}`
      : "Uncertainty notes: none",
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

function toIntentInput(mode: string, messages: { role: "user" | "assistant"; content: string }[]) {
  const recent = messages.slice(-3);
  return [
    `Requested mode: ${mode}`,
    "Conversation so far:",
    ...recent.map((message) => `${message.role === "user" ? "Visitor" : "Agent"}: ${message.content}`),
  ].join("\n\n");
}

function getIntentSearchText(intentPlan: IntentPlan, messages: { role: "user" | "assistant"; content: string }[]) {
  const latestUserMessage = messages.findLast((message) => message.role === "user")?.content ?? "";
  return [
    intentPlan.querySummary,
    intentPlan.assumedTargetRole,
    intentPlan.target.roleTitle,
    intentPlan.target.companyName,
    intentPlan.mustHaveCriteria.join(" "),
    latestUserMessage,
  ]
    .filter(Boolean)
    .join("\n");
}

function shouldFetchConstraints(intentPlan: IntentPlan) {
  const text = [
    intentPlan.querySummary,
    intentPlan.assumedTargetRole,
    intentPlan.retrievalNeeds.join(" "),
    intentPlan.mustHaveCriteria.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return [
    "education",
    "mba",
    "degree",
    "master",
    "phd",
    "b.tech",
    "m.tech",
    "credential",
    "location",
    "relocation",
    "remote",
    "hybrid",
    "availability",
    "compensation",
    "salary",
    "seniority",
    "years",
    "visa",
    "current employer",
    "employer",
  ].some((signal) => text.includes(signal));
}

function getBaselineFacts(includeConstraints: boolean) {
  const currentExperience = PROFILE_DATA.experience.find((experience) => experience.end.toLowerCase() === "present");

  return {
    identity: {
      name: PROFILE_DATA.person.name,
      title: PROFILE_DATA.person.title,
      location: PROFILE_DATA.person.location,
      summary: PROFILE_DATA.person.summary,
    },
    currentExperience: currentExperience
      ? {
          company: currentExperience.company,
          role: currentExperience.role,
          start: currentExperience.start,
          end: currentExperience.end,
          headline: currentExperience.headline,
        }
      : null,
    education: includeConstraints ? PROFILE_DATA.education : undefined,
    hiringPreferences: includeConstraints ? PROFILE_DATA.hiringPreferences : undefined,
  };
}

function getProfessionalEvidenceFallback() {
  return PROFILE_DATA.experience.map((experience) => ({
    id: experience.id,
    company: experience.company,
    role: experience.role,
    period: `${experience.start} - ${experience.end}`,
    headline: experience.headline,
    tags: experience.tags,
    workContext: "professional" as const,
    evidenceStrength: "direct_claim" as const,
    outcomes: experience.outcomes.map((outcome) => ({
      ...outcome,
      workContext: "production" as const,
      evidenceStrength: "direct_shipped" as const,
    })),
    failures: "failures" in experience
      ? experience.failures.map((failure) => ({
          ...failure,
          workContext: "professional" as const,
          evidenceStrength: "direct_claim" as const,
        }))
      : [],
  }));
}

async function gatherRawEvidence(intentPlan: IntentPlan, messages: { role: "user" | "assistant"; content: string }[]) {
  const query = getIntentSearchText(intentPlan, messages);
  const mode = intentPlan.responseType === "qa" ? "ask" : intentPlan.responseType === "both" ? "both" : "fit";
  const profileEvidence = searchProfileEvidence(query, mode);
  const projectIds = profileEvidence.projects.map((project) => project.id).filter(Boolean);
  const includeConstraints = shouldFetchConstraints(intentPlan);

  const [experienceOutcomes, projectDetails, identityContext] = await Promise.all([
    Promise.resolve(getExperienceOutcomes(query)),
    Promise.resolve(getProjectDetails(projectIds)),
    Promise.resolve(includeConstraints ? getIdentityContext() : null),
  ]);

  return {
    query,
    baselineFacts: getBaselineFacts(includeConstraints),
    professionalEvidenceFallback: getProfessionalEvidenceFallback(),
    profileEvidence,
    experienceOutcomes,
    projectDetails,
    constraints: identityContext,
  };
}

function toEvidenceInput(
  intentPlan: IntentPlan,
  rawEvidence: Awaited<ReturnType<typeof gatherRawEvidence>>,
  companyBrief?: CompanyBrief,
) {
  return [
    "Intent plan:",
    JSON.stringify(intentPlan),
    companyBrief ? "Company brief:" : "Company brief: none",
    companyBrief ? JSON.stringify(companyBrief) : "",
    "Retrieved profile evidence:",
    JSON.stringify(rawEvidence),
  ].join("\n\n");
}

function toV3AnswerInput(
  mode: string,
  messages: { role: "user" | "assistant"; content: string }[],
  intentPlan: IntentPlan,
  evidencePacket: EvidencePacket,
  companyBrief?: CompanyBrief,
) {
  return [
    `Requested mode: ${mode}`,
    "Intent plan:",
    JSON.stringify(intentPlan),
    companyBrief
      ? [
          "Company websearch brief:",
          formatCompanyBrief(companyBrief),
          "Use this company context as public web evidence. Cite source URLs in answerText when company facts materially affect the fit assessment.",
        ].join("\n\n")
      : "Company websearch brief: none",
    "Evidence packet:",
    JSON.stringify(evidencePacket),
    "Conversation so far:",
    ...messages.map((message) => `${message.role === "user" ? "Visitor" : "Agent"}: ${message.content}`),
  ].join("\n\n");
}

function getCompanyTargetFromIntent(intentPlan: IntentPlan, latestUserText: string, requestedMode: z.infer<typeof AgentRequestSchema>["mode"]) {
  const target =
    intentPlan.target.companyUrl ||
    intentPlan.target.companyName ||
    extractCompanyResearchTarget(latestUserText, requestedMode);

  if (!target || !isConcreteCompanyTarget(target)) return null;
  return target;
}

function isConcreteCompanyTarget(target: string) {
  const normalized = target
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[.[\](){}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return false;
  if (target.includes(".")) return true;

  const genericTargets = [
    "none",
    "url not provided",
    "company",
    "startup",
    "team",
    "b2c consumer app",
    "consumer app",
    "ai infrastructure company",
    "series a fintech",
    "series a ai startup",
    "series c company",
    "series c founder",
    "b2b saas company",
  ];

  if (genericTargets.some((generic) => normalized === generic || normalized.includes(generic))) return false;
  return /^[a-z0-9][a-z0-9&.\- ]{1,80}$/i.test(target);
}

function sse(event: AgentStreamEvent) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function chunkText(text: string) {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += 42) {
    chunks.push(text.slice(index, index + 42));
  }

  return chunks.length ? chunks : [text];
}

export async function POST(request: Request) {
  const startTime = Date.now();
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
      const sendStatus = (stage: AgentStatusStage, message: string) => {
        send({ type: "status", stage, elapsed_ms: Date.now() - startTime, message });
      };

      try {
        const latestUserMessage = parsed.messages.findLast((message) => message.role === "user");

        if (IS_V3_PIPELINE) {
          sendStatus("intent_start", "Understanding the question");
          const intentResult = await run(intentPlannerAgent, toIntentInput(parsed.mode, parsed.messages), {
            maxTurns: 2,
          });
          const intentPlan = intentResult.finalOutput;
          if (!intentPlan) throw new Error("Intent planner returned no final output.");
          sendStatus("intent_complete", "Planned retrieval");

          const latestUserText = latestUserMessage?.content ?? "";
          const companyTarget =
            intentPlan.shouldResearchCompany && latestUserMessage
              ? getCompanyTargetFromIntent(intentPlan, latestUserText, parsed.mode)
              : null;

          if (companyTarget) sendStatus("websearch_start", "Researching company context");
          sendStatus("evidence_start", "Gathering profile evidence");

          const [companyBrief, evidencePacket] = await Promise.all([
            companyTarget
              ? websearch(companyTarget, latestUserText || intentPlan.querySummary)
              : Promise.resolve(undefined as CompanyBrief | undefined),
            (async () => {
              const rawEvidence = await gatherRawEvidence(intentPlan, parsed.messages);
              const evidenceResult = await run(evidenceGathererAgent, toEvidenceInput(intentPlan, rawEvidence), {
                maxTurns: 2,
              });
              const packet = evidenceResult.finalOutput;
              if (!packet) throw new Error("Evidence gatherer returned no final output.");
              return packet;
            })(),
          ]);

          if (companyBrief) sendStatus("websearch_complete", "Built company brief");
          sendStatus("evidence_complete", "Classified evidence");

          sendStatus("answer_start", "Drafting answer");
          const promptKey =
            intentPlan.responseType === "qa"
              ? "qaAnswerInstructions"
              : intentPlan.responseType === "both"
              ? "bothAnswerInstructions"
              : "fitmentAnswerInstructions";
          const answerInput = toV3AnswerInput(
            companyBrief ? "fit" : parsed.mode,
            parsed.messages,
            intentPlan,
            evidencePacket,
            companyBrief,
          );

          const answerStream = getOpenAIClient().responses.stream({
            model: MODEL,
            text: { format: zodTextFormat(AgentResponseSchema, "agent_response") },
            input: [
              { role: "system", content: selectedPrompt(promptKey, SELECTED_PROMPTS.answerInstructions) },
              { role: "user", content: answerInput },
            ],
          });

          // Stream answerText deltas as they arrive in the partial JSON
          const ANSWER_MARKER = '"answerText":"';
          let searchBuf = "";
          let markerFound = false;
          let prevBackslash = false;
          let answerDone = false;
          answerStream.on("response.output_text.delta", (event) => {
            if (answerDone) return;
            const delta = event.delta;
            let toProcess: string;
            if (!markerFound) {
              searchBuf += delta;
              const idx = searchBuf.indexOf(ANSWER_MARKER);
              if (idx < 0) {
                if (searchBuf.length > ANSWER_MARKER.length + 5) searchBuf = searchBuf.slice(-ANSWER_MARKER.length - 2);
                return;
              }
              markerFound = true;
              toProcess = searchBuf.slice(idx + ANSWER_MARKER.length);
            } else {
              toProcess = delta;
            }
            let toSend = "";
            for (const ch of toProcess) {
              if (prevBackslash) {
                prevBackslash = false;
                if (ch === '"') toSend += '"';
                else if (ch === "\\") toSend += "\\";
                else if (ch === "n") toSend += "\n";
                else if (ch === "t") toSend += "\t";
                else if (ch === "r") toSend += "\r";
                else toSend += ch;
              } else if (ch === "\\") {
                prevBackslash = true;
              } else if (ch === '"') {
                if (toSend) send({ type: "delta", text: toSend });
                answerDone = true;
                return;
              } else {
                toSend += ch;
              }
            }
            if (toSend) send({ type: "delta", text: toSend });
          });

          const finalResult = await answerStream.finalResponse();
          const response = finalResult.output_parsed as z.infer<typeof AgentResponseSchema> | null;
          if (!response) throw new Error("Answer agent returned no final output.");

          const responseWithDebug = {
            ...response,
            v3Debug: {
              intentPlan,
              companyBrief: companyBrief ?? null,
              evidencePacket,
            },
          };

          sendStatus("answer_complete", "Drafted answer");
          send({ type: "final", response: responseWithDebug });
          return;
        }

        const companyTarget = latestUserMessage
          ? extractCompanyResearchTarget(latestUserMessage.content, parsed.mode)
          : null;
        let companyBrief: CompanyBrief | undefined;

        if (companyTarget && latestUserMessage) {
          sendStatus("websearch_start", "Researching company website");
          companyBrief = await websearch(companyTarget, latestUserMessage.content);
          sendStatus("websearch_complete", "Researching company website");
        }

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

        sendStatus("context_start", "Reading profile context");
        const contextResult = await run(contextAgent, toContextInput(companyBrief ? "fit" : parsed.mode, contextMessages), {
          maxTurns: 2,
        });
        const context = contextResult.finalOutput;
        if (!context) throw new Error("Context agent returned no final output.");

        sendStatus("context_complete", "Summarizing relevant context");

        sendStatus("answer_start", "Summarizing relevant context");
        const result = await run(rakshitAgent, toAgentInputWithContext(companyBrief ? "fit" : parsed.mode, parsed.messages, context, companyBrief), {
          maxTurns: 6,
        });

        const response = result.finalOutput as AgentResponse | undefined;
        if (!response) throw new Error("Agent returned no final output.");

        sendStatus("answer_complete", "Drafting brief");
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
