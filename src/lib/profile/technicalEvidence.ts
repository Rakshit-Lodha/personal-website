export const TECHNICAL_EVIDENCE = [
  {
    id: "agents-and-tool-orchestration",
    label: "Agents and Tool Orchestration",
    summary:
      "Built agentic products with function tools, specialist handoffs, persistent memory, real-time APIs, and measured tool-use behavior.",
    projectIds: ["feedback-agent", "us-stocks-analysis-agent", "krux-new"],
    evidence: [
      "Feedback Intelligence uses OpenAI Agents SDK function tools for Play Store, App Store, YouTube, and X feedback retrieval.",
      "US Stocks Analysis Agent moved from a single-agent design to specialist handoffs and improved tool-use accuracy from 58% to 90%.",
      "Krux.news uses a multi-stage pipeline with curation, research, summarization, image generation, and publishing steps.",
    ],
    tools: ["OpenAI Agents SDK", "function tools", "agent handoffs", "Turso session memory", "real-time financial APIs"],
  },
  {
    id: "rag-and-semantic-search",
    label: "RAG and Semantic Search",
    summary:
      "Built retrieval systems for mutual funds and spiritual guidance, including vector search, intent classification, and dual-collection retrieval strategies.",
    projectIds: ["mf-semantic-search", "talk-to-krishna"],
    evidence: [
      "MF Semantic Search searches 16,197 mutual funds using ChromaDB, OpenAI embeddings, and LLM-based routing.",
      "TalkToKrishna retrieves from separate Problems and Solutions collections across 700 Bhagavad Gita verses.",
    ],
    tools: ["ChromaDB", "OpenAI text-embedding-3-small", "GPT-4o", "GPT-4o-mini"],
  },
  {
    id: "eval-driven-ai-product",
    label: "Eval-Driven AI Product Development",
    summary:
      "Designed evaluation systems for agent tool usage, conversational quality, safety, accountability, RAG correctness, persona consistency, and ASR accuracy.",
    projectIds: ["us-stocks-analysis-agent", "ai-evaluation-framework", "talk-to-krishna"],
    evidence: [
      "US Stocks Analysis Agent used 20+ test cases across 5 categories and improved overall accuracy from 58% to 90%.",
      "AI Evaluation Framework improved conversational pass rate from 57% to 100% and accountability accuracy from 20% to 100%.",
      "TalkToKrishna used a 50-question suite and reverted a more complex prompt after evals showed worse consistency.",
    ],
    tools: ["LLM-as-judge", "trace evaluation", "structured rubrics", "WER", "CER"],
  },
  {
    id: "voice-ai",
    label: "Voice AI",
    summary:
      "Built and evaluated voice interfaces, including speech-to-text, text-to-speech, and ASR quality measurement.",
    projectIds: ["us-stocks-analysis-agent", "ai-evaluation-framework"],
    evidence: [
      "US Stocks Analysis Agent supports spoken stock questions, transcription, agent processing, and spoken answers.",
      "AI Evaluation Framework measures ASR quality with WER and CER, including language and speaking-style comparisons.",
    ],
    tools: ["OpenAI Whisper", "OpenAI TTS", "WER", "CER"],
  },
  {
    id: "full-stack-ai-products",
    label: "Full-Stack AI Products",
    summary:
      "Built deployable AI products across pipelines, backends, frontends, storage, and hosted demos.",
    projectIds: ["krux-new", "feedback-agent", "mf-semantic-search", "us-stocks-analysis-agent"],
    evidence: [
      "Krux.news combines a Python AI pipeline, Supabase storage, and a Next.js consumer app.",
      "Feedback Intelligence combines an Agents SDK backend, Streamlit chat UI, FastAPI preview API, and Next.js onboarding flow.",
      "MF Semantic Search and US Stocks Analysis Agent are deployed as Streamlit apps.",
    ],
    tools: ["Next.js", "React", "TypeScript", "Python", "FastAPI", "Streamlit", "Supabase", "Streamlit Cloud", "Render"],
  },
] as const;

export type TechnicalEvidence = (typeof TECHNICAL_EVIDENCE)[number];
