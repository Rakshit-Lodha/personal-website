export const IDENTITY = {
  name: "Rakshit Lodha",
  title: "AI Product Manager",
  location: "Gurugram",
  locationPreference: "Based in Gurugram and open to relocating anywhere for the right opportunity.",
  summary:
    "AI Product Manager with 5+ years of fintech product experience and hands-on experience building LLM products across RAG, semantic search, agentic workflows, voice interfaces, and eval systems.",
  positioning:
    "Strong in translating ambiguous user and business problems into AI-powered workflows, evaluation frameworks, and scalable product systems.",
  domains: ["wealth", "lending", "advisory", "support automation"],
  contact: {
    email: "rakshitlodha.business@gmail.com",
    socials: [
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/rakshit-lodha-360241187/",
      },
      {
        label: "GitHub",
        url: "https://github.com/Rakshit-Lodha",
      },
      {
        label: "X",
        url: "https://x.com/rakshitlodha",
      },
    ],
  },
  workStyle: [
    "Prototype-first and hands-on: prefers to build, design, and test a working MVP himself before taking an idea into broader execution.",
    "Do-it-yourself approach: comfortable moving from problem framing to wireframes, prototypes, data checks, prompts, workflow design, and early product demos without waiting for a full team to assemble.",
    "Uses prototypes to make ambiguity concrete, align stakeholders, learn from users faster, and then partner with design and engineering to harden the product.",
    "Bias for shipping practical versions quickly, validating what matters, and iterating based on evidence rather than long theoretical planning cycles.",
  ],
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
    "Firebase",
    "Firebase A/B Testing",
    "Jira",
    "Figma",
    "Mixpanel",
    "Amplitude",
    "Google Analytics",
    "SQL",
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
