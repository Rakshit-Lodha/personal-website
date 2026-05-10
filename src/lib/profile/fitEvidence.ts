export const FIT_EVIDENCE = [
  {
    id: "ai-product-management",
    label: "AI Product Management",
    summary:
      "Hands-on AI product work across LLM workflows, evals, semantic search, voice interfaces, and agentic systems.",
    evidenceIds: [
      "etmoney-support-automation",
      "feedback-agent",
      "mf-semantic-search",
      "us-stocks-analysis-agent",
      "krux-new",
      "ai-evaluation-framework",
    ],
    roleMatches: ["AI Product Manager", "LLM Product Manager", "Agentic Workflows PM"],
    themes: ["LLM products", "RAG", "semantic search", "agentic workflows", "eval systems", "voice AI"],
  },
  {
    id: "agentic-systems",
    label: "Agentic Systems",
    summary:
      "Built agent products with tool calling, specialized handoffs, persistent memory, multi-source ingestion, and eval-backed architecture changes.",
    evidenceIds: ["feedback-agent", "us-stocks-analysis-agent", "krux-new"],
    roleMatches: ["Agentic AI PM", "AI Platform PM", "AI Product Lead"],
    themes: ["OpenAI Agents SDK", "tool calling", "agent handoffs", "persistent memory", "multi-tool orchestration"],
  },
  {
    id: "rag-search-and-retrieval",
    label: "RAG, Search, and Retrieval",
    summary:
      "Built semantic search and RAG systems across financial discovery and spiritual counseling use cases.",
    evidenceIds: ["mf-semantic-search", "talk-to-krishna"],
    roleMatches: ["Search Product Manager", "RAG Product Manager", "AI Discovery PM"],
    themes: ["RAG", "semantic search", "ChromaDB", "embeddings", "intent classification", "dual retrieval"],
  },
  {
    id: "eval-driven-ai",
    label: "Eval-Driven AI",
    summary:
      "Used structured evals to improve agent accuracy, conversational quality, safety behavior, accountability, RAG correctness, persona consistency, and voice ASR measurement.",
    evidenceIds: ["us-stocks-analysis-agent", "ai-evaluation-framework", "talk-to-krishna", "etmoney-support-automation"],
    roleMatches: ["AI Evaluation PM", "LLM Quality PM", "AI Product Manager"],
    themes: ["LLM evals", "trace evaluation", "LLM-as-judge", "rubrics", "safety", "WER", "CER"],
  },
  {
    id: "voice-ai",
    label: "Voice AI",
    summary:
      "Built voice-enabled AI experiences and measured ASR quality using production-relevant voice metrics.",
    evidenceIds: ["us-stocks-analysis-agent", "ai-evaluation-framework"],
    roleMatches: ["Voice AI PM", "Conversational AI PM", "AI Product Manager"],
    themes: ["speech-to-text", "text-to-speech", "ASR", "WER", "CER"],
  },
  {
    id: "support-automation",
    label: "Support Automation",
    summary:
      "Reduced support tickets from 17,000 to 7,000 by building intent classification, resolution workflows, and eval systems.",
    evidenceIds: ["etmoney-support-automation"],
    roleMatches: ["AI Support Automation PM", "Customer Experience PM", "AI Operations PM"],
    themes: ["support automation", "intent classification", "resolution workflows", "LLM evals"],
  },
  {
    id: "fintech-growth",
    label: "Fintech Growth",
    summary:
      "Shipped and scaled fintech products across lending, wealth, insurance, advisory, mutual funds, and P2P investments.",
    evidenceIds: [
      "etmoney-lamf",
      "etmoney-earn",
      "etmoney-insurance-platform",
      "etmoney-earn-p2p-investment",
      "indmoney-insurance-recommendations",
    ],
    roleMatches: ["Fintech Product Manager", "Growth Product Manager", "Wealth Product Manager"],
    themes: ["lending", "wealth", "insurance", "mutual funds", "revenue", "AUM"],
  },
  {
    id: "recommendation-systems",
    label: "Recommendation Systems",
    summary:
      "Built planning and insurance recommendation systems that compressed workflows and created revenue impact.",
    evidenceIds: ["indmoney-financial-planning", "indmoney-insurance-recommendations"],
    roleMatches: ["Recommendation Systems PM", "Personalization PM", "Advisory Product Manager"],
    themes: ["recommendations", "personalization", "financial planning", "insurance"],
  },
  {
    id: "zero-to-one",
    label: "0-to-1 Product Building",
    summary:
      "Repeatedly built new product lines and workflows from the ground up, then scaled them to measurable business outcomes.",
    evidenceIds: [
      "etmoney-offline-distribution",
      "etmoney-lamf",
      "etmoney-earn",
      "etmoney-earn-p2p-investment",
      "learnapp-courses",
    ],
    roleMatches: ["0-to-1 Product Manager", "Founder Office Product Lead", "New Initiatives PM"],
    themes: ["0-to-1", "new product lines", "distribution", "investments", "education"],
  },
  {
    id: "consumer-fintech-monetization",
    label: "Consumer Fintech Monetization",
    summary:
      "Created measurable revenue, AUM, disbursal, and sales impact across multiple consumer fintech product lines.",
    evidenceIds: [
      "etmoney-lamf",
      "etmoney-earn",
      "etmoney-mf-platform",
      "etmoney-insurance-platform",
      "etmoney-earn-p2p-investment",
      "indmoney-insurance-recommendations",
    ],
    roleMatches: ["Revenue Product Manager", "Consumer Fintech PM", "Monetization PM"],
    themes: ["revenue", "AUM", "disbursals", "insurance sales", "mutual funds"],
  },
] as const;

export type FitEvidence = (typeof FIT_EVIDENCE)[number];
