export type DeepEvidenceInput = {
  id: string;
  sourceType: "project" | "experience" | "failure" | "skill-theme";
  sourceId: string;
  title: string;
  status: "needs-input" | "draft" | "ready";
  oneLine: string;
  context: string;
  userOrBusinessProblem: string;
  rakshitRole: string;
  constraints: string[];
  decisions: Array<{
    decision: string;
    why: string;
    alternativesConsidered: string[];
    tradeoff: string;
  }>;
  executionDetails: string[];
  metrics: Array<{
    label: string;
    before: string;
    after: string;
    timeframe: string;
    caveat: string;
  }>;
  failureModesOrRisks: string[];
  lessonsLearned: string[];
  evidenceLimits: string[];
  goodForQuestionsAbout: string[];
};

export const PROFILE_V2_DEEP_EVIDENCE: DeepEvidenceInput[] = [
  {
    id: "ai-hiring-chat-deep-dive",
    sourceType: "project",
    sourceId: "ai-hiring-chat",
    title: "AI Hiring Chat deep evidence",
    status: "ready",
    oneLine:
      "A portfolio website evolved into an agentic hiring assistant that helps recruiters and founders assess Rakshit through chat instead of reading a static profile.",
    context:
      "The project started as a personal website, but the product insight was that recruiters, founders, or potential collaborators need fast answers about fit, not another static portfolio page.",
    userOrBusinessProblem:
      "People evaluating Rakshit would otherwise need to scan pages, infer fit themselves, or book a call too early; the assistant makes it easier to ask role-specific questions and decide whether a conversation is worth having.",
    rakshitRole:
      "Rakshit defined the product concept, built the chat experience, designed the agent pipeline, created the structured profile context, and built the eval loop used to improve prompts and profile data over time.",
    constraints: [
      "The agent had to answer both normal background questions and fitment questions without forcing everything into a hiring-assessment frame.",
      "The system needed to stay grounded in profile data while still producing useful, conversational answers.",
      "The structured fit output had to avoid numeric match scores and use only the four fit labels supported by the product.",
      "Latency mattered because the experience needed to feel like a chat product, not a slow report generator.",
    ],
    decisions: [
      {
        decision: "Split the pipeline into a context selector and an answer agent.",
        why: "The context selector can classify the user query as Q&A, fitment, or both, then brief the answer agent with only the relevant profile sections.",
        alternativesConsidered: ["A single prompt that reads the full profile every time", "A static FAQ-style site"],
        tradeoff:
          "The two-agent setup adds latency and complexity, but it gives cleaner separation between retrieval/classification and final answer quality.",
      },
      {
        decision: "Turn prompts and profile data into versioned dynamic elements.",
        why: "The agent should improve through evals without silently changing production behavior.",
        alternativesConsidered: ["Editing the live prompt directly", "Treating every improvement as a one-off code change"],
        tradeoff:
          "Versioning adds process overhead, but makes it possible to compare V1 and V2 candidates against the same baseline.",
      },
      {
        decision: "Build an eval pipeline before promoting prompt or profile changes.",
        why: "Founder feedback showed that fit labels and answer quality needed measurement, not subjective prompt tinkering.",
        alternativesConsidered: ["Manual review only", "Relying only on qualitative founder feedback"],
        tradeoff:
          "Eval work slows down initial iteration, but creates confidence before changing the core logic.",
      },
    ],
    executionDetails: [
      "Built a standalone chat interface for recruiters, founders, and collaborators to ask about Rakshit or paste a job description.",
      "Implemented a context selector that reviews the profile and classifies the query as Q&A, fitment, or both.",
      "Implemented an answer agent that writes the final response and returns a structured AgentResponse.",
      "Classifies fit only with four labels: Strong fit, Relevant fit, Partial fit, and Not enough evidence.",
      "Built rakshitlodha.com and the AI Hiring Chat with Next.js 16, TypeScript, OpenAI Agents SDK, Tailwind CSS, and shadcn/ui.",
      "Launched the experience to founders and used their real questions and feedback to identify gaps in fit calibration and answer depth.",
      "Built a 52-question eval pipeline covering factual accuracy, quality, fitment accuracy, and latency.",
      "Broke dynamic behavior into versioned prompt and profile layers so future improvements can be tested before release.",
    ],
    metrics: [
      {
        label: "Eval coverage",
        before: "No systematic regression suite",
        after: "52-question eval pipeline across factual, quality, fitment, and latency dimensions",
        timeframe: "V1 baseline period",
        caveat: "The eval suite measures agent behavior, not production recruiter conversion.",
      },
    ],
    failureModesOrRisks: [
      "The fit label can become too generous if the answer agent overweights adjacent evidence.",
      "Q&A answers can become shallow if the profile data only contains short project summaries.",
      "Latency can increase as the pipeline adds web search, context selection, and richer answer generation.",
    ],
    lessonsLearned: [
      "A personal website can become more useful when it answers the evaluator's exact question instead of only presenting static sections.",
      "Prompt changes need eval gates because subjective answer quality can improve while fit calibration regresses.",
      "For Q&A depth, richer profile evidence is as important as a better final answer prompt.",
    ],
    evidenceLimits: [
      "Do not claim this has measured recruiter conversion or hiring outcomes unless those numbers are added later.",
      "Do not claim the V2 prompts outperform V1 until eval results show it.",
      "If asked how the hireability agent classifies fit, answer with the four fit labels, not only the Q&A/fitment/both routing modes.",
      "If asked what stack rakshitlodha.com is built on, use the repo/profile stack: Next.js 16, TypeScript, OpenAI Agents SDK, Tailwind CSS, and shadcn/ui.",
    ],
    goodForQuestionsAbout: ["agent pipelines", "evals", "prompt versioning", "portfolio chat", "fit assessment"],
  },
  {
    id: "krux-news-deep-dive",
    sourceType: "project",
    sourceId: "krux-new",
    title: "Krux.news deep evidence",
    status: "ready",
    oneLine:
      "An AI-news product that pivoted from comparing LLM-written articles to a short, persona-aware feed for people who want to understand AI updates quickly.",
    context:
      "The first concept was to send the same news item to multiple LLMs and compare their 300-400 word articles to expose model biases. User behavior showed that people did not want to read multiple long versions of the same story.",
    userOrBusinessProblem:
      "Product managers, VCs, and AI-curious operators need a fast way to understand important AI news without reading long articles or duplicate coverage.",
    rakshitRole:
      "Rakshit defined the pivot, built the content pipeline, implemented the frontend and backend, designed the persona-based curation flow, and kept the product running after the retention learnings.",
    constraints: [
      "The product needed to compress fast-moving AI news into less than 100 words without losing the core point.",
      "The feed had to support quick consumption through mobile-first swipe cards.",
      "The curation system needed rules for what was interesting to a defined persona instead of publishing every RSS item.",
      "Retention did not work strongly enough to justify making it the main focus.",
    ],
    decisions: [
      {
        decision: "Pivot from multi-LLM comparison to short persona-based news.",
        why: "People were not motivated to read three separate articles on the same topic, even if the model differences were intellectually interesting.",
        alternativesConsidered: ["Keep the model-bias comparison concept", "Publish longer AI explainers"],
        tradeoff:
          "The pivot reduced the novelty of comparing model outputs, but made the product more practical for everyday reading.",
      },
      {
        decision: "Use a daily cron pipeline to select the top articles before deep research and writing.",
        why: "The product needed a repeatable way to move from noisy RSS feeds to a smaller set of relevant stories.",
        alternativesConsidered: ["Manual curation", "Publishing all RSS items", "Only using one source"],
        tradeoff:
          "Rule-based filtering can miss interesting edge cases, but it keeps the pipeline simple and predictable.",
      },
      {
        decision: "Add swipe reactions as a learning signal.",
        why: "Swipe-left and swipe-right behavior could eventually help determine what is relevant for a given reader profile.",
        alternativesConsidered: ["Only track page views", "Ask users to manually personalize topics upfront"],
        tradeoff:
          "Swipe signals are lightweight, but require enough repeat usage to become meaningfully personalized.",
      },
    ],
    executionDetails: [
      "Built a Next.js frontend and a Python/FastAPI backend pipeline.",
      "Ingested news and reports from multiple RSS feeds.",
      "Ran a morning cron job that selected around 15 potentially interesting pieces for a defined persona.",
      "Performed deeper research on selected stories before sending them to the article writer prompt.",
      "Generated articles in 100 words or less.",
      "Built a two-stage image pipeline: first generating an image prompt, then using an image model to create the final card asset.",
      "Published stories into swipeable cards where users could swipe right for useful stories and left for irrelevant ones.",
    ],
    metrics: [
      {
        label: "Users acquired",
        before: "0 users",
        after: "About 500 users",
        timeframe: "Initial product launch",
        caveat: "Retention did not work well enough for Rakshit to keep focusing heavily on the product.",
      },
    ],
    failureModesOrRisks: [
      "The original multi-LLM comparison idea was more interesting as a demo than as a repeat-use news product.",
      "Short articles risk oversimplifying nuanced AI news.",
      "Personalization from swipes needs retention and repeat behavior to become powerful.",
    ],
    lessonsLearned: [
      "A technically clever AI concept still needs a clear consumption habit.",
      "For news products, time-to-value can matter more than showing the underlying AI sophistication.",
      "Retention should determine whether a side product remains a focus or simply stays live.",
    ],
    evidenceLimits: [
      "Do not claim strong retention or product-market fit.",
      "Do not imply the product currently provides mature personalization unless newer evidence is added.",
    ],
    goodForQuestionsAbout: ["AI content pipelines", "news products", "publishing workflows", "mobile feeds"],
  },
  {
    id: "feedback-agent-deep-dive",
    sourceType: "project",
    sourceId: "feedback-agent",
    title: "Feedback Intelligence deep evidence",
    status: "ready",
    oneLine:
      "A product-feedback agent inspired by ET Money pain points, built to help PMs quickly understand app-store, Play Store, and social feedback instead of waiting for slow feedback loops.",
    context:
      "At ET Money, product teams often learned about user pain through customer support with too much delay. Rakshit wanted a more dynamic feedback loop directly from public user channels.",
    userOrBusinessProblem:
      "Product managers need to understand what went wrong in a release, what users are complaining about, and which issues matter, without manually reading reviews across multiple platforms.",
    rakshitRole:
      "Rakshit identified the problem from his own product work, defined the workflow for PMs, built the data ingestion approach, and used the OpenAI Agents SDK to summarize and answer questions over the feedback.",
    constraints: [
      "Feedback lived across multiple sources with different APIs and data quality.",
      "PMs needed a simple conversational interface rather than a complex dashboard.",
      "The system had to support period-based analysis so teams could investigate specific releases or incidents.",
      "Public review data can be noisy, duplicated, emotional, or unrelated to product issues.",
    ],
    decisions: [
      {
        decision: "Start with Play Store and App Store scraping plus X API ingestion.",
        why: "These were practical channels where users publicly expressed product feedback.",
        alternativesConsidered: ["Only app-store reviews", "Support-ticket ingestion first", "Manual CSV upload"],
        tradeoff:
          "Public channels are easier to start with, but they do not represent the full customer-support universe.",
      },
      {
        decision: "Make the PM ask questions conversationally instead of only showing static reports.",
        why: "PMs often have follow-up questions like what changed in a version, what complaints repeated, or which issues are urgent.",
        alternativesConsidered: ["A fixed analytics dashboard", "A weekly report generator"],
        tradeoff:
          "Chat adds flexibility, but requires stronger context assembly and answer grounding.",
      },
      {
        decision: "Inject relevant feedback context into the system prompt for summarization.",
        why: "The agent needed to answer PM-style questions using the selected period and source-specific feedback.",
        alternativesConsidered: ["Summarize all feedback upfront", "Let the model search raw data without pre-filtered context"],
        tradeoff:
          "Pre-filtering keeps answers focused, but bad filtering can hide useful feedback.",
      },
    ],
    executionDetails: [
      "Built dynamic scraping for Play Store and App Store reviews over a user-selected period.",
      "Used the official X API to pull feedback from X for the relevant period.",
      "Allowed the user to define the period through a sidebar.",
      "Assembled relevant review and social context based on the PM's question.",
      "Used OpenAI Agents SDK to summarize issues, identify what was right or wrong, and support release-specific analysis.",
    ],
    metrics: [],
    failureModesOrRisks: [
      "Public feedback can overrepresent angry or vocal users.",
      "A release issue may not be obvious unless the feedback is tied to version, date, and source metadata.",
      "The product could hallucinate patterns if the retrieved context is too thin or too broad.",
    ],
    lessonsLearned: [
      "The most valuable AI workflow for PMs is often not generic summarization, but shortening the loop from user signal to product action.",
      "Source selection and period filtering are product decisions, not just backend implementation details.",
      "Feedback products need to preserve enough raw context for PMs to trust the synthesized insight.",
    ],
    evidenceLimits: [
      "Do not claim enterprise adoption or revenue unless added later.",
      "Do not claim support-ticket ingestion unless that source is added to this project evidence.",
    ],
    goodForQuestionsAbout: ["feedback analysis", "agent tools", "product discovery", "cross-channel feedback"],
  },
  {
    id: "mf-semantic-search-deep-dive",
    sourceType: "project",
    sourceId: "mf-semantic-search",
    title: "MF Semantic Search deep evidence",
    status: "ready",
    oneLine:
      "A mutual-fund search POC built after seeing exact-match search fail, focused on comparison, better RAG-based search, and fund explanation.",
    context:
      "Rakshit was frustrated that mutual-fund search required users to type exact fund names. He built a POC to explore whether semantic search and intent routing could create a better fund discovery and advisory experience.",
    userOrBusinessProblem:
      "Mutual-fund users often search with partial names, natural-language intent, categories, or comparison questions; exact-match search creates friction and hides relevant funds.",
    rakshitRole:
      "Rakshit conceived the POC, defined the three core use cases, built the semantic search workflow, and mapped each use case to possible product entry points.",
    constraints: [
      "The POC needed to be narrow enough to build quickly but realistic enough to show product value.",
      "Search results had to support financial explanation, not just retrieval.",
      "The use cases needed clear entry points inside an existing mutual-fund product.",
    ],
    decisions: [
      {
        decision: "Focus on comparison, better search through RAG, and fund explanation.",
        why: "These mapped to concrete user entry points: comparison and explanation on fund detail pages, and better search in the search bar.",
        alternativesConsidered: ["Build a broad robo-advisor", "Only improve fund-name matching", "Only create a fund Q&A bot"],
        tradeoff:
          "The scope avoided a full advisory product, but made the POC easier to reason about and integrate into existing journeys.",
      },
      {
        decision: "Use intent detection to route different query types.",
        why: "A comparison query, a search query, and an explanation query need different retrieval and answer behavior.",
        alternativesConsidered: ["One generic vector search flow for every query"],
        tradeoff:
          "Routing adds complexity, but improves answer shape and product relevance.",
      },
    ],
    executionDetails: [
      "Built a POC for mutual-fund semantic search and explanation.",
      "Supported better search for non-exact fund queries.",
      "Designed comparison and fund-explanation workflows as separate use cases.",
      "Mapped comparison and explanation to fund detail page entry points.",
      "Mapped improved search to the search bar and core user discovery experience.",
    ],
    metrics: [],
    failureModesOrRisks: [
      "A POC can prove experience value without proving production-scale ranking quality.",
      "Fund explanations need strong compliance and accuracy controls before real user deployment.",
      "RAG retrieval can still surface the wrong fund if names, categories, and user intent are ambiguous.",
    ],
    lessonsLearned: [
      "Semantic retrieval is most useful when paired with clear product entry points.",
      "Narrowing an AI POC to three high-value workflows makes it easier to evaluate and explain.",
      "Financial search is not just search quality; it also needs explanation quality and user trust.",
    ],
    evidenceLimits: [
      "Do not claim this shipped inside ET Money unless explicit evidence is added.",
      "Do not present it as regulated financial advice.",
    ],
    goodForQuestionsAbout: ["semantic search", "mutual funds", "query routing", "fintech AI"],
  },
  {
    id: "us-stocks-analysis-agent-deep-dive",
    sourceType: "project",
    sourceId: "us-stocks-analysis-agent",
    title: "US Stocks Analysis Agent deep evidence",
    status: "ready",
    oneLine:
      "A personal US-stock analyst built with OpenAI Agents SDK, financial-data tools, specialist sub-agents, voice input, and an eval loop that improved tool-use accuracy from 58% to 90%.",
    context:
      "Rakshit had started investing in US stocks and wanted a faster way to analyze fundamentals and earnings reports without manually pulling data from multiple sources.",
    userOrBusinessProblem:
      "A retail investor needs reliable answers about financial statements, earnings, and full-company analysis; a generic chatbot can easily call the wrong tool or hallucinate financial details.",
    rakshitRole:
      "Rakshit designed the agent architecture, chose tools over RAG for changing market data, built the voice interaction layer, and redesigned the system based on evaluation results.",
    constraints: [
      "US stock data changes constantly, making a static RAG system hard to maintain.",
      "Financial answers need accurate tool calls for income statements, balance sheets, cash flows, annual statements, quarterly statements, and earnings context.",
      "Voice interaction needs lower latency than a heavy multi-tool research flow.",
    ],
    decisions: [
      {
        decision: "Use OpenAI Agents SDK with live financial tool calls instead of a RAG-based system.",
        why: "The data domain changes constantly, so maintaining a fresh vector database would be brittle.",
        alternativesConsidered: ["RAG over financial documents", "A single LLM prompt without tools"],
        tradeoff:
          "Tool calls require careful routing and evaluation, but they keep answers closer to live structured data.",
      },
      {
        decision: "Split the original single agent into specialist sub-agents.",
        why: "The single agent had only 58% accuracy because it often chose the wrong tool. Specialist agents reduced tool-selection confusion.",
        alternativesConsidered: ["Keep improving the single-agent prompt", "Add more tools to the same agent"],
        tradeoff:
          "Specialist routing adds orchestration complexity, but improved tool-use accuracy significantly.",
      },
      {
        decision: "Build a simpler voice path with fewer tool calls.",
        why: "Voice experiences are more sensitive to latency, so the system needed faster retrieval and response generation.",
        alternativesConsidered: ["Use the full analysis flow for every voice question"],
        tradeoff:
          "The voice path may answer less comprehensively, but feels more usable in a spoken interface.",
      },
    ],
    executionDetails: [
      "Used Alpha Vantage APIs to fetch financial statements and stock data.",
      "Built a first single-agent version that decided which financial tool to call.",
      "Evaluated tool-use behavior and found the single-agent design reached 58% accuracy.",
      "Created three specialist sub-agents: a financial data agent, a qualitative earnings-call agent, and a full analysis agent.",
      "Routed user queries to the relevant specialist agent based on query intent.",
      "Added voice input using OpenAI Whisper transcription.",
      "Sent transcribed voice queries into the agent workflow and returned spoken answers through OpenAI text-to-speech.",
    ],
    metrics: [
      {
        label: "Tool-use accuracy",
        before: "58%",
        after: "90%",
        timeframe: "After moving from a single agent to specialist sub-agents",
        caveat: "Measured on Rakshit's eval set for this project, not an external benchmark.",
      },
    ],
    failureModesOrRisks: [
      "Wrong tool selection can produce confidently wrong financial answers.",
      "Voice latency can make an otherwise accurate system feel poor.",
      "Financial API limits, missing fields, or stale data can affect answer quality.",
    ],
    lessonsLearned: [
      "Agent architecture can matter more than adding more prompt instructions.",
      "Specialist agents are useful when the core failure mode is wrong tool routing.",
      "Voice AI forces product tradeoffs between completeness and speed.",
    ],
    evidenceLimits: [
      "Do not present this as investment advice.",
      "Do not claim production usage by external investors unless added later.",
    ],
    goodForQuestionsAbout: ["multi-agent systems", "tool-use evals", "financial analysis", "voice AI"],
  },
  {
    id: "ai-evaluation-framework-deep-dive",
    sourceType: "project",
    sourceId: "ai-evaluation-framework",
    title: "AI Evaluation Framework deep evidence",
    status: "draft",
    oneLine:
      "The standalone evaluation-framework evidence is currently represented most concretely through ET Money AI support automation and other project-specific eval loops.",
    context:
      "Rakshit's eval work shows up across multiple projects, especially the ET Money support automation system, AI Hiring Chat, US Stocks Analysis Agent, and TalkToKrishna.",
    userOrBusinessProblem:
      "AI products needed a way to measure factuality, answer quality, safety, empathy, tool routing, fit calibration, and regression behavior instead of relying on demos.",
    rakshitRole:
      "Rakshit designed project-specific eval loops and used the results to decide whether to change prompts, data layers, routing, or architecture.",
    constraints: [
      "The strongest current evidence is project-specific rather than a single standalone evaluation product narrative.",
      "Different AI systems required different rubrics: support automation, hiring fit, tool routing, voice quality, RAG safety, and persona quality were not evaluated the same way.",
    ],
    decisions: [],
    executionDetails: [],
    metrics: [],
    failureModesOrRisks: [],
    lessonsLearned: [],
    evidenceLimits: [
      "Prefer citing the specific project eval loop instead of describing one generic AI Evaluation Framework unless the user asks broadly about eval philosophy.",
      "For ET Money support automation, use the support automation deep evidence as the primary source.",
    ],
    goodForQuestionsAbout: ["LLM evals", "safety rubrics", "accountability testing", "voice evaluation"],
  },
  {
    id: "talk-to-krishna-deep-dive",
    sourceType: "project",
    sourceId: "talk-to-krishna",
    title: "TalkToKrishna deep evidence",
    status: "ready",
    oneLine:
      "A Bhagavad Gita RAG product built after a personal moment of wanting a better way to read, understand, and apply the text.",
    context:
      "After a breakup, Rakshit was reading the Bhagavad Gita and felt there should be a more interactive way to understand it than reading linearly.",
    userOrBusinessProblem:
      "A user may arrive with an emotional, philosophical, practical, or crisis-oriented question and needs grounded guidance from the Gita without hallucinated scripture or unsafe advice.",
    rakshitRole:
      "Rakshit built the Streamlit product, structured the verse data, designed the ChromaDB retrieval flow, created the generation prompt, and built the LLM-judge evaluation categories.",
    constraints: [
      "The source text was static and bounded, making RAG appropriate.",
      "Answers needed to remain grounded in Gita verses and cite references.",
      "The persona needed to feel empathetic without becoming unsafe or inventing teachings.",
      "Response time needed to stay around 3-4 seconds for a usable chat experience.",
    ],
    decisions: [
      {
        decision: "Use a RAG pipeline over the Gita verses instead of a pure prompt.",
        why: "The dataset was limited and static, so retrieval could keep answers grounded and faster.",
        alternativesConsidered: ["A generic chatbot persona without retrieval", "Manual chapter browsing"],
        tradeoff:
          "RAG improves grounding but depends heavily on retrieval quality and verse selection.",
      },
      {
        decision: "Run a two-stage retrieval and relevance process.",
        why: "Semantic search could find the top similar verses, then an LLM could decide which were most relevant for the user's situation.",
        alternativesConsidered: ["Use only raw vector similarity", "Give all retrieved verses to generation without reranking"],
        tradeoff:
          "The second stage adds model cost and latency but improves relevance control.",
      },
      {
        decision: "Separate problem and solution collections, then focus on Krishna's teaching for the solution path.",
        why: "The product needed to map user difficulty into a grounded problem-to-solution narrative.",
        alternativesConsidered: ["One combined collection", "Only retrieve from emotional problem examples"],
        tradeoff:
          "Separating collections adds design complexity, but makes the narrative structure clearer.",
      },
    ],
    executionDetails: [
      "Built a Streamlit app for conversational Gita guidance.",
      "Embedded the Gita verses into ChromaDB.",
      "Ran semantic search against the user's query to retrieve similar results.",
      "Used an LLM relevance step to choose the most appropriate verses.",
      "Generated responses with GPT-4o in an empathetic Krishna persona.",
      "Grounded answers in retrieved verses and included verse citations.",
      "Built evaluation categories for crisis, philosophical, dangerous relationship, practical, adversarial, and negative cases.",
      "Evaluated relevance, correctness, tone/persona, Gita reference quality, and safety with LLM-as-judge scoring.",
    ],
    metrics: [
      {
        label: "Response time",
        before: "Slower non-optimized flow",
        after: "About 3-4 seconds",
        timeframe: "After using the RAG pipeline",
        caveat: "Measured for this prototype, not a large-scale production system.",
      },
    ],
    failureModesOrRisks: [
      "The system could retrieve a verse that is semantically similar but spiritually or contextually wrong.",
      "A spiritual persona can become risky in crisis or dangerous relationship situations if safety is weak.",
      "Verse citation quality matters because users may trust the answer as scripture-backed.",
    ],
    lessonsLearned: [
      "Bounded, static knowledge domains are good candidates for RAG when grounding matters.",
      "Safety evaluation needs category-specific cases, not only average answer quality.",
      "A persona prompt must be judged on correctness, tone, citation quality, and safety together.",
    ],
    evidenceLimits: [
      "Do not claim theological authority.",
      "Do not claim clinical mental-health support.",
      "Do not say all 800 verses were used if another profile source says 700; phrase as the Gita verse dataset unless the final number is confirmed.",
    ],
    goodForQuestionsAbout: ["RAG", "persona prompting", "prompt rollback", "spiritual counseling", "safety"],
  },
  {
    id: "etmoney-support-automation-deep-dive",
    sourceType: "experience",
    sourceId: "etmoney-support-automation",
    title: "ET Money AI support automation deep evidence",
    status: "ready",
    oneLine:
      "A production AI support automation system that reduced monthly tickets from roughly 17,000-19,000 to about 7,000-7,500 while improving support quality and keeping costs controlled.",
    context:
      "ET Money had high support volume, especially around mutual-fund transactions. Rakshit focused on the categories with the highest volume and built a data-grounded AI support system instead of relying on a free-form LLM.",
    userOrBusinessProblem:
      "Users needed accurate, empathetic answers about transaction status, withdrawal TAT, payment failures, lump sum TAT, and SIP failures without waiting for human support.",
    rakshitRole:
      "Rakshit selected the initial scope, defined the answer logic, wrote the good-answer templates, designed the eval process, analyzed human-in-the-loop failures, and iterated the data layer and proactive transaction-page flows.",
    constraints: [
      "Mutual funds made up around 70-80% of support queries, so solving every product area would have diluted focus.",
      "The agent needed exact transaction metadata to avoid hallucinating on sensitive financial support questions.",
      "Cost needed to stay practical at 20,000-25,000 monthly AI-handled queries.",
      "Responses needed to be both factual and empathetic.",
      "The team could not depend only on LLM judgment because early versions hallucinated.",
    ],
    decisions: [
      {
        decision: "Scope V1 to mutual-fund support queries.",
        why: "Around 70-80% of queries were mutual-fund related, making it the highest-leverage category.",
        alternativesConsidered: ["Solve support across every ET Money product", "Start with lower-volume products"],
        tradeoff:
          "This left some product categories for later, but maximized early ticket reduction impact.",
      },
      {
        decision: "Focus first on the dominant mutual-fund query types.",
        why: "Withdrawal TAT, payment failures, lump sum TAT, and SIP failures covered most mutual-fund support cases.",
        alternativesConsidered: ["Build a generic MF support chatbot", "Handcraft every possible support flow upfront"],
        tradeoff:
          "The narrower scope reduced coverage breadth, but improved accuracy for the highest-volume issues.",
      },
      {
        decision: "Use intelligent routing and metadata-backed answers instead of free-form LLM answers.",
        why: "Early hallucinations showed that the agent needed exact support data and approved answer patterns.",
        alternativesConsidered: ["Let the LLM infer answers from policy text", "Use human support only"],
        tradeoff:
          "The engineered data layer took more work, but reduced hallucination risk and controlled cost.",
      },
      {
        decision: "Build proactive transaction-page flows alongside a generic agent.",
        why: "Most mutual-fund support queries came from transaction pages where the system already knew the order context.",
        alternativesConsidered: ["Always wait for the user to describe the issue", "Only offer a generic support chat entry point"],
        tradeoff:
          "Proactive flows are less flexible, but they can be more accurate and faster when transaction context is known.",
      },
    ],
    executionDetails: [
      "Analyzed query distribution and chose mutual-fund support as the first major scope.",
      "Identified the highest-volume MF categories: withdrawal TAT, payment failures, lump sum TAT, and SIP failures.",
      "Built data flows to fetch accurate metadata from relevant systems and mutual-fund teams.",
      "Mapped query categories to the right systems and answer logic.",
      "Wrote approved answer patterns for specific support cases to reduce hallucination.",
      "Started with a 10% user launch in December 2025 and human-in-the-loop review by Rakshit and ops.",
      "Used review findings to strengthen the data layer, especially for withdrawal TAT hallucinations.",
      "Built an automated eval pipeline comparing the agent's response with the final human support response for tickets that escalated.",
      "Evaluated factual accuracy, intent detection, query classification, and empathy.",
      "Ran quality evaluation on non-escalated AI-resolved queries.",
      "Expanded launch from 10% users in December 2025 to 50% in January 2026 and 100% in February 2026.",
      "Added transaction-page flows where the system used known order context to answer likely status questions upfront.",
    ],
    metrics: [
      {
        label: "Monthly support tickets",
        before: "Around 17,000-19,000 per month",
        after: "About 7,000-7,500 per month",
        timeframe: "After rollout to 100% users",
        caveat: "The baseline profile/eval uses 17,000 to 7,000; the richer notes describe the target/result as about 7,500. Treat this as an approximate range.",
      },
      {
        label: "AI support query volume and cost",
        before: "Manual/support-heavy handling",
        after: "About 20,000-25,000 queries per month at roughly INR 15,000-20,000 cost",
        timeframe: "Production usage period",
        caveat: "Cost depends on model, routing, and volume assumptions.",
      },
      {
        label: "Rollout",
        before: "10% of users",
        after: "100% of users",
        timeframe: "December 2025 to February 2026",
        caveat: "Dates should not be used if discussing work before December 2025.",
      },
      {
        label: "Support rating",
        before: "About 3 out of 5, or about 6 out of 10",
        after: "About 3.8 out of 5, or about 7.6 out of 10",
        timeframe: "After full rollout and iteration",
        caveat: "Two rating scales were mentioned; avoid mixing them as the same metric unless clarified.",
      },
    ],
    failureModesOrRisks: [
      "Withdrawal TAT answers hallucinated before the metadata layer was improved.",
      "A purely factual answer was not enough; users also needed empathetic language.",
      "If the final human support response is used as ground truth, the eval assumes human support was correct.",
      "The generic agent could be less accurate than transaction-page flows when known order context was available.",
    ],
    lessonsLearned: [
      "For production support AI, the data layer matters more than prompt cleverness.",
      "The highest-leverage automation starts by finding where most real queries come from.",
      "Human-in-the-loop review is useful early, but automated evals are needed to scale iteration.",
      "AI can outperform human support on both volume and quality when it has exact context and scoped answer logic.",
    ],
    evidenceLimits: [
      "Do not say the agent solved every ET Money support category; the initial scope was heavily mutual-fund focused.",
      "Do not imply the system relied only on LLM generation; the core design used routing, metadata, and approved answer patterns.",
      "If asked for the baseline factual metric, answer 17,000 to 7,000. If giving the richer narrative, say roughly 7,000-7,500.",
      "If asked what the support bot eval pipeline scored, include empathy, answer quality, policy compliance, and regression as the baseline eval dimensions.",
    ],
    goodForQuestionsAbout: ["support automation", "AI workflows", "production AI", "customer experience"],
  },
  {
    id: "etmoney-lamf-deep-dive",
    sourceType: "experience",
    sourceId: "etmoney-lamf",
    title: "ET Money Loan Against Mutual Funds deep evidence",
    status: "ready",
    oneLine:
      "A loan-against-mutual-funds product built on ET Money's large mutual-fund user base, combining partner selection, pricing, pledge UX, and contextual distribution entry points.",
    context:
      "ET Money had about INR 25,000 crore of AUM and roughly 5.5-6 lakh active mutual-fund investors, creating a natural opportunity to build lending on top of users' existing holdings.",
    userOrBusinessProblem:
      "Mutual-fund investors may need liquidity without selling investments; they need to understand when pledging funds is better than a personal loan and what happens to their pledged units.",
    rakshitRole:
      "Rakshit helped define the product approach, partner rationale, proposition, marketing and pledge UX, entry-point strategy, and integration with the mutual-fund experience.",
    constraints: [
      "The product needed faster time-to-market despite KYC, agreement, lending, and pledge complexity.",
      "Users needed enough transparency to trust what was being pledged without being overwhelmed by fund-by-fund complexity.",
      "The business needed early book creation and processing-fee revenue while proving retention beyond the introductory period.",
      "The product had to avoid user confusion when pledged funds later affected withdrawals.",
    ],
    decisions: [
      {
        decision: "Partner with DSP Finance.",
        why: "DSP had strong new-age tech, absorbed major KYC and agreement-flow complexity, offered campaign flexibility, and had a lower interest rate than much of the market at the time.",
        alternativesConsidered: ["Build lending infrastructure in-house", "Partner with less flexible lenders"],
        tradeoff:
          "Partnering reduced time-to-market and complexity, but meant core lending flows depended on partner systems.",
      },
      {
        decision: "Launch with an introductory interest-rate offer.",
        why: "The business wanted to create credit lines and capture processing-fee revenue while building market share.",
        alternativesConsidered: ["Optimize for book income from day one", "Match standard market pricing"],
        tradeoff:
          "The offer improved acquisition, but depended on enough users staying beyond the introductory period for book revenue.",
      },
      {
        decision: "Use a hybrid pledge-selection UX.",
        why: "Competitors either made users select every fund manually or hid too much information. ET Money needed simplicity plus transparency.",
        alternativesConsidered: ["User manually selects all funds", "System pledges funds without meaningful visibility"],
        tradeoff:
          "The hybrid approach required internal pledge prioritization logic, but reduced friction while keeping users informed.",
      },
      {
        decision: "Place LAMF entry points at withdrawal moments.",
        why: "Withdrawal intent is a natural moment to show users they could get liquidity by pledging instead of selling.",
        alternativesConsidered: ["Only promote from a landing page", "Only cross-sell from the home page"],
        tradeoff:
          "Contextual entry points can add traffic, but must be presented carefully so users understand the borrowing cost.",
      },
    ],
    executionDetails: [
      "Used ET Money's mutual-fund AUM and active investor base as the strategic starting point for the lending product.",
      "Compared market products to identify gaps in proposition and UX.",
      "Positioned the product against personal loans with examples that explained when LAMF made sense.",
      "Created a marketing page that moved users toward selecting a loan amount.",
      "Built pledge-selection logic that prioritized pledging fewer funds where possible.",
      "Showed users which mutual funds would be pledged on their behalf.",
      "Integrated pledged-unit awareness into the mutual-fund product so users understood why later withdrawals might fail.",
      "Added withdrawal-context entry points showing approximate monthly interest if the user pledged instead of withdrew.",
    ],
    metrics: [
      {
        label: "Marketing to loan amount conversion",
        before: "New product journey",
        after: "About 6% conversion from marketing page to select-loan-amount page",
        timeframe: "Launch period",
        caveat: "This is a funnel step, not final disbursal conversion.",
      },
      {
        label: "Withdrawal entry-point traffic",
        before: "No withdrawal-context LAMF entry point",
        after: "About 15-20% additional traffic into the LAMF journey",
        timeframe: "After adding withdrawal placements",
        caveat: "Traffic lift is not the same as loan disbursal lift.",
      },
      {
        label: "Disbursals",
        before: "0",
        after: "INR 100 crore disbursals",
        timeframe: "7 months",
        caveat: "Existing profile-level metric; use with the detailed V2 narrative.",
      },
    ],
    failureModesOrRisks: [
      "Users could withdraw pledged funds later and be confused when the withdrawal fails.",
      "Too much pledge control could make the journey complex; too little could reduce trust.",
      "An introductory interest offer can bring acquisition without guaranteeing long-term book revenue.",
    ],
    lessonsLearned: [
      "The best fintech product opportunities often come from existing asset and user-base advantages.",
      "Partner selection is a product strategy decision when it affects time-to-market, pricing, and campaign flexibility.",
      "Financial-product UX needs to be simple, but not opaque.",
    ],
    evidenceLimits: [
      "Do not claim Rakshit personally built DSP's KYC or agreement systems.",
      "Do not claim final profitability of the book unless newer numbers are added.",
    ],
    goodForQuestionsAbout: ["lending", "mutual funds", "fintech product strategy", "partner integrations", "conversion"],
  },
  {
    id: "etmoney-rm-deep-dive",
    sourceType: "experience",
    sourceId: "etmoney-offline-distribution",
    title: "ET Money relationship-manager distribution deep evidence",
    status: "ready",
    oneLine:
      "A new offline wealth-management distribution business built on ET Money's platform, giving RMs tools to create goal plans, fix portfolios, send actions, and track customers through CRM integration.",
    context:
      "As ET Money moved toward becoming a mutual-fund distributor, the team brought in relationship managers and needed systems that let them serve more clients through the existing ET Money app.",
    userOrBusinessProblem:
      "RMs needed a way to understand client portfolios, create goal-based plans, recommend portfolio fixes, execute mutual-fund actions, and track follow-ups without operating outside the core app ecosystem.",
    rakshitRole:
      "Rakshit helped build the internal RM system, app-side RM center, action flows, portfolio and goal-planning tooling, portfolio-fix workflows, mutual-fund strategy integration, and Zoho CRM tracking integration.",
    constraints: [
      "The internal RM system had to talk cleanly with the main ET Money app.",
      "User-facing actions needed to be executable inside the app, not only discussed on calls.",
      "The business needed performance tracking across calls, no-shows, cancelled meetings, and RM-level outcomes.",
      "RMs needed enough one-glance context to manage clients efficiently.",
    ],
    decisions: [
      {
        decision: "Build both an internal RM system and an app-side RM center.",
        why: "RMs needed a working console, while users needed a trusted in-app place to book calls and act on RM recommendations.",
        alternativesConsidered: ["Run the business mostly through CRM and phone calls", "Only build user-facing appointment booking"],
        tradeoff:
          "Building both sides increased scope, but made the operating model more scalable and app-native.",
      },
      {
        decision: "Start with portfolio and goal-based investment plans, then add portfolio fixes.",
        why: "Goal planning created the advisory foundation, while portfolio fixes helped RMs identify bad funds and send concrete actions.",
        alternativesConsidered: ["Only enable transactions", "Only provide portfolio visibility"],
        tradeoff:
          "The broader advisory workflow took more product work, but gave RMs more reasons to engage customers.",
      },
      {
        decision: "Integrate with Zoho CRM for operational tracking.",
        why: "The business needed to monitor calls, no-shows, cancellations, RM performance, and client follow-ups.",
        alternativesConsidered: ["Build a custom CRM from scratch", "Track activity manually"],
        tradeoff:
          "Zoho integration created dependency on an external CRM, but avoided rebuilding mature CRM functionality.",
      },
    ],
    executionDetails: [
      "Built an RM center in the ET Money app where users could book calls and see actions sent by their RM.",
      "Built an internal system for RMs covering portfolio context and goal-based investment planning.",
      "Added portfolio-fix workflows so RMs could identify poor funds and send corrective actions.",
      "Integrated SIPs and mutual-fund strategies from the app into the RM workflow.",
      "Integrated Zoho CRM to track calls, no-shows, cancellations, RM-wise performance, and client details.",
      "Surfaced user context for RMs, including mutual-fund AUM, SIP data, and relevant actions.",
      "Created task triggers for events like SIP cancellation so the RM could follow up with the client.",
    ],
    metrics: [
      {
        label: "SIP book contribution",
        before: "0% from the new RM business",
        after: "About 12% of SIP book",
        timeframe: "Within about 4 months",
        caveat: "Use as contribution metric, not total company SIP book size.",
      },
      {
        label: "Gross sales contribution",
        before: "0% from the new RM business",
        after: "About 10% of gross sales",
        timeframe: "Within about 4 months",
        caveat: "Original notes mention both AUM and gross sales; avoid conflating the two.",
      },
      {
        label: "Concentration insight",
        before: "New business",
        after: "Roughly 2% of users contributed about 10% of AUM and 12% of SIP book",
        timeframe: "After launch ramp",
        caveat: "Use as a portfolio/customer concentration insight, not a broad user behavior claim.",
      },
    ],
    failureModesOrRisks: [
      "If app actions and RM recommendations were not tightly connected, users would drop between advice and execution.",
      "RMs needed actionable client context; raw CRM tracking alone would not improve productivity.",
      "Manual follow-up could miss important moments like SIP cancellations without automated task creation.",
    ],
    lessonsLearned: [
      "Offline distribution can scale better when it is productized inside the core app.",
      "RM productivity depends on workflow design, not only hiring more relationship managers.",
      "A wealth-management product needs both advisory context and execution rails.",
    ],
    evidenceLimits: [
      "Do not describe this as a fully automated robo-advisor; it was relationship-manager-led distribution.",
      "Do not claim exact revenue unless a separate revenue number is provided.",
    ],
    goodForQuestionsAbout: ["wealth management", "offline distribution", "CRM integration", "RM tooling", "mutual funds"],
  },
  {
    id: "indmoney-goals-feature-failure-deep-dive",
    sourceType: "failure",
    sourceId: "indmoney-goals-feature",
    title: "INDMoney Goals feature failure deep evidence",
    status: "needs-input",
    oneLine: "",
    context: "",
    userOrBusinessProblem: "",
    rakshitRole: "",
    constraints: [],
    decisions: [],
    executionDetails: [],
    metrics: [],
    failureModesOrRisks: [],
    lessonsLearned: [],
    evidenceLimits: [],
    goodForQuestionsAbout: ["product failure", "PMF", "retention", "learning from mistakes"],
  },
];
