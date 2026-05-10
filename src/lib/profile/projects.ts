export const PROJECTS = [
  {
    id: "krux-new",
    name: "Krux.news",
    type: "AI news platform / news agent",
    status: "Live",
    featured: true,
    summary:
      "End-to-end AI news product that turns fast-moving AI company updates into short, swipeable stories with research, summaries, generated images, and a mobile-first feed.",
    capabilities: [
      "RSS ingestion",
      "AI story curation",
      "web research",
      "Claude tool calls",
      "100-word summaries",
      "image generation",
      "Supabase-backed publishing",
      "mobile feed",
      "RSS and sitemap distribution",
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "Framer Motion", "Python", "Supabase", "Anthropic SDK", "OpenAI SDK", "Feedparser"],
    architecture:
      "Python pipeline monitors RSS feeds, stores raw items in Supabase, uses Claude for curation, OpenAI web search for research, Claude tool calls for article generation, OpenAI image generation for visuals, and a Next.js app for distribution.",
    proofPoints: [
      "Built both the content pipeline and the consumer web app.",
      "Designed a multi-stage AI content workflow from ingestion to publishing.",
      "Implemented distribution surfaces including story pages, deep links, RSS, sitemaps, PWA metadata, and swipe reaction tracking.",
    ],
    links: {
      github: null,
      demo: "https://krux.news/",
    },
  },
  {
    id: "feedback-agent",
    name: "Feedback Intelligence",
    type: "Cross-channel product feedback agent",
    status: "Live",
    featured: true,
    summary:
      "SaaS product for aggregating public user feedback across app stores, YouTube, and X, then turning it into prioritized product signals through a conversational agent.",
    capabilities: [
      "OpenAI Agents SDK",
      "function tools",
      "persistent agent memory",
      "Play Store review ingestion",
      "App Store review ingestion",
      "YouTube comment ingestion",
      "X mention ingestion",
      "relevance filtering",
      "feedback classification",
      "onboarding preview APIs",
    ],
    stack: ["Python", "OpenAI Agents SDK", "FastAPI", "Streamlit", "Next.js 14", "React 18", "TypeScript", "Turso", "YouTube Data API", "X API"],
    architecture:
      "OpenAI agent uses source-specific function tools, session memory through Turso, and a strict product feedback analysis prompt. A FastAPI backend verifies public sources for onboarding and a Next.js frontend provides source connection flows.",
    proofPoints: [
      "Built an agent that classifies feedback into P0 bugs, UX complaints, feature requests, positive signals, and sentiment trends.",
      "Implemented source tools for Google Play, App Store, YouTube, and X/Twitter.",
      "Separated UI chat state from persistent model session memory.",
      "Designed the product around cross-channel correlation, not generic dashboard reporting.",
    ],
    links: {
      github: null,
      demo: "https://managed-agents-review.onrender.com",
    },
  },
  {
    id: "mf-semantic-search",
    name: "MF Semantic Search",
    type: "Semantic search across mutual funds",
    status: "Beta",
    featured: true,
    summary:
      "Semantic search engine across 16,197 mutual funds, using LLM-based intent classification to route queries into single-fund lookup, fund comparison, or filtered discovery workflows.",
    capabilities: [
      "semantic search",
      "intent classification",
      "fuzzy fund matching",
      "query routing",
      "single-fund lookup",
      "fund comparison",
      "filtered discovery",
      "AI-generated investment analysis",
    ],
    stack: ["Streamlit", "ChromaDB", "OpenAI text-embedding-3-small", "GPT-4o", "GPT-4o-mini", "Streamlit Cloud"],
    architecture:
      "GPT-4o-mini classifies user intent, ChromaDB and OpenAI embeddings retrieve relevant funds from a 16,197-fund database, and GPT-4o generates professional analysis across returns, risk, and expense ratios.",
    proofPoints: [
      "Designed three search modes: single lookup, comparison, and filtered discovery.",
      "Handled natural language queries, typos, partial names, categories, and investment styles.",
      "Built domain-specific routing for mutual fund discovery rather than a generic vector search demo.",
    ],
    links: {
      github: null,
      demo: "https://mf-ai-search.streamlit.app/",
    },
  },
  {
    id: "us-stocks-analysis-agent",
    name: "US Stocks Analysis Agent",
    type: "AI financial analysis agent",
    status: "Beta",
    featured: true,
    summary:
      "Multi-agent stock analysis system with specialist handoffs, real-time financial tools, voice input/output, and a systematic evaluation framework that improved tool-use accuracy from 58% to 90%.",
    capabilities: [
      "multi-agent architecture",
      "agent handoffs",
      "financial statement tools",
      "earnings analysis",
      "multi-company comparison",
      "speech-to-text",
      "text-to-speech",
      "trace evaluation",
      "eval-driven redesign",
    ],
    stack: ["Python", "Streamlit", "OpenAI Agents architecture", "OpenAI Whisper", "OpenAI TTS", "Alpha Vantage API", "OpenAI trace evaluation"],
    architecture:
      "A triage agent routes queries to specialist agents for financial data, qualitative earnings analysis, or full analysis. The system uses income statement, balance sheet, cash flow, price, and earnings tools, with voice input and spoken output.",
    metrics: [
      "Overall tool-use accuracy improved from 58% to 90%.",
      "Cash flow query accuracy improved from 33% to 100%.",
      "Evaluation suite covers 20+ test cases across 5 query categories.",
    ],
    proofPoints: [
      "Used evals to justify moving from a single-agent design to specialized agent handoffs.",
      "Built both the financial analysis workflow and the voice interaction layer.",
      "Validated major query types with systematic testing instead of relying on demos alone.",
    ],
    links: {
      github: null,
      demo: "https://us-stock-agent.streamlit.app/",
    },
  },
  {
    id: "ai-evaluation-framework",
    name: "AI Evaluation Framework",
    type: "Text and voice AI evaluation system",
    status: "Prototype",
    featured: false,
    summary:
      "Evaluation system for conversational AI quality, accountability, safety, and voice ASR accuracy, covering LLM-as-judge rubrics and WER/CER measurement.",
    capabilities: [
      "LLM-as-judge evaluation",
      "structured rubrics",
      "safety classification",
      "accountability testing",
      "prompt iteration",
      "ASR evaluation",
      "WER/CER measurement",
    ],
    stack: ["GPT-4o", "Python", "structured eval datasets", "voice transcription metrics"],
    architecture:
      "Text evals use real-world scenarios and GPT-4o rubric grading for empathy, accountability, actionable guidance, and safety. Voice evals measure ASR accuracy with WER and CER across languages and speaking styles.",
    metrics: [
      "Text eval pass rate improved from 57% to 100%.",
      "Accountability accuracy improved from 20% to 100%.",
      "Safety compliance reached 100% on crisis scenarios.",
      "Measured English WER between 4.1% and 11.7%, and Hindi WER at 27.7%.",
    ],
    proofPoints: [
      "Built evals for both product quality and safety behavior.",
      "Defined automatic-fail conditions for missed crisis escalation, dismissal, or forced optimism.",
      "Used eval results to expose language and speaking-style limits in voice products.",
    ],
    links: {
      github: null,
      demo: null,
    },
  },
  {
    id: "talk-to-krishna",
    name: "TalkToKrishna",
    type: "RAG spiritual counseling product",
    status: "Prototype",
    featured: false,
    summary:
      "RAG-based conversational product grounded in 700 Bhagavad Gita verses, with dual retrieval collections, persona-aware generation, and a 50-question evaluation suite.",
    capabilities: [
      "RAG",
      "dual-collection retrieval",
      "semantic search",
      "persona prompting",
      "safety handling",
      "LLM-as-judge evaluation",
      "prompt rollback decisions",
    ],
    stack: ["Python", "ChromaDB", "OpenAI text-embedding-3-small", "GPT-4o", "pandas"],
    architecture:
      "User queries retrieve from separate Problems and Solutions collections: Arjuna's struggles for emotional matching and Krishna's teachings for guidance. GPT-4o then generates grounded responses with verse references and safety-aware behavior.",
    metrics: [
      "Baseline score: 84.2/100 across a 50-question suite.",
      "Correctness: 91.7/100.",
      "Tone and persona: 87.8/100.",
      "Safety: 100/100 across crisis and dangerous-reasoning test cases.",
    ],
    proofPoints: [
      "Built a RAG architecture that maps a user's emotional state to analogous source material before giving guidance.",
      "Used multi-dimensional evals across relevance, correctness, tone, citation quality, and safety.",
      "Made a product decision to revert a more complex prompt when evals showed lower consistency and higher variance.",
    ],
    links: {
      github: null,
      demo: null,
    },
  },
] as const;

export type Project = (typeof PROJECTS)[number];
