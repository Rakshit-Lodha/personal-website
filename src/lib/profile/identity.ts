export const IDENTITY = {
  name: "Rakshit Lodha",
  title: "AI Product Manager",
  location: "Gurugram / Remote",
  summary:
    "AI Product Manager with 5+ years of fintech product experience and hands-on experience building LLM products across RAG, semantic search, agentic workflows, voice interfaces, and eval systems.",
  positioning:
    "Strong in translating ambiguous user and business problems into AI-powered workflows, evaluation frameworks, and scalable product systems.",
  domains: ["wealth", "lending", "advisory", "support automation"],
  contact: {
    email: "rakshitlodha.business@gmail.com",
    socials: ["LinkedIn", "GitHub", "X"],
  },
  aiProductCapabilities: [
    "RAG",
    "semantic search",
    "LLM evals",
    "model-graded rubrics",
    "prompt engineering",
    "agentic workflows",
    "tool calling",
    "vector databases",
    "voice AI",
  ],
  technicalTools: [
    "Python",
    "MySQL",
    "TypeScript",
    "Next.js",
    "React",
    "Streamlit",
    "FastAPI",
    "OpenAI API",
    "Anthropic API",
    "xAI API",
    "Sarvam API",
    "ChromaDB",
    "Supabase",
    "Turso",
    "Alpha Vantage API",
    "YouTube Data API",
    "X API",
  ],
  personalSignals: [
    "likes to work out and track his fitness",
    "morning person",
    "likes making interesting side projects for the love of building",
  ],
} as const;

export type Identity = typeof IDENTITY;
