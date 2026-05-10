export const CHAPTERS = [
  {
    id: "learnapp",
    company: "LearnApp",
    years: "2018-2020",
    role: "Core Team Member",
    theme: "learnapp",
    accentColor: "#1B6AE7",
    borderColor: "border-blue-500",
    badgeText: "EARLY STAGE",
    badgeClass: "bg-blue-50 text-blue-600",
    title: "Built investing courses from scratch",
    tagPrimary: "Core Team Member",
    description:
      "Joined as employee #7. Wore every hat — product, content, and ops — to build India's first investing education platform.",
    tags: ["Product", "Content", "Ops"],
    metrics: [
      {
        icon: "🎓",
        value: "50%",
        label: "completion rate",
        sub: "Course average",
        color: "green",
      },
      {
        icon: "💰",
        value: "₹1.2Cr",
        label: "ARR",
        sub: "Achieved",
        color: "amber",
      },
      {
        icon: "🚀",
        value: "Employee #7",
        label: "Early belief",
        sub: "0 → 1 builder",
        color: "purple",
      },
    ],
  },
  {
    id: "indmoney",
    company: "INDMoney",
    years: "2020-2022",
    role: "Associate Product Manager",
    theme: "indmoney",
    accentColor: "#16A34A",
    borderColor: "border-green-500",
    badgeText: "2020-2022",
    badgeClass: "bg-green-50 text-green-700",
    title: "Turned planning into a product system",
    tagPrimary: "Associate Product Manager · INDMoney",
    description:
      "Turned a 4-5 hour manual advisory process into a 15-minute automated planning engine — scaled to 20,000+ plans.",
    tags: ["Recommendations", "Planning", "Insurance"],
    metrics: [
      {
        icon: "⏱",
        value: "4-5 hrs → 15 mins",
        label: "per plan",
        sub: "Planning time",
        color: "green",
      },
      {
        icon: "📋",
        value: "20,000+",
        label: "plans",
        sub: "Generated",
        color: "amber",
      },
      {
        icon: "₹",
        value: "₹1.5Cr",
        label: "ARR",
        sub: "Insurance",
        color: "purple",
      },
    ],
  },
  {
    id: "etmoney",
    company: "ET Money",
    years: "2022-Present",
    role: "Product Manager",
    theme: "etmoney",
    accentColor: "#1B6AE7",
    borderColor: "border-blue-500",
    badgeText: "CURRENT",
    badgeClass: "bg-blue-50 text-blue-600",
    title: "Scaled AI + fintech products",
    tagPrimary: "AI support automation",
    description:
      "Built AI-powered triage and resolution systems that cut response time by 60% and ticket volume by 58%.",
    tags: ["Product systems", "Lending", "Wealth"],
    metrics: [
      {
        icon: "🎧",
        value: "17K → 7K",
        label: "tickets",
        sub: "-58% volume",
        color: "green",
      },
      {
        icon: "🪙",
        value: "₹100Cr",
        label: "disbursals",
        sub: "7 months",
        color: "amber",
      },
      {
        icon: "📊",
        value: "₹300Cr",
        label: "AUM",
        sub: "Enabled",
        color: "purple",
      },
    ],
  },
] as const;

export const PROJECTS = [
  {
    name: "Krux.new",
    tag: "News Agent",
    description: "AI copilot for mutual fund investors.",
    status: "Live" as const,
    icon: "🌐",
    iconBg: "bg-blue-50",
    href: "#",
  },
  {
    name: "Feedback Agent",
    tag: "Feedback Agent",
    description: "Real-time agent for user feedback.",
    status: "Live" as const,
    icon: "💬",
    iconBg: "bg-green-50",
    href: "#",
  },
  {
    name: "MF Semantic Search",
    tag: "MF Semantic Search",
    description: "Semantic search across mutual funds.",
    status: "Beta" as const,
    icon: "🔍",
    iconBg: "bg-amber-50",
    href: "#",
  },
  {
    name: "US Stocks Analysis Agent",
    tag: "US Stocks Analysis Agent",
    description: "AI agent for US stock deep analysis.",
    status: "Beta" as const,
    icon: "📈",
    iconBg: "bg-purple-50",
    href: "#",
  },
] as const;

export const TECHNICAL_SKILLS = [
  {
    title: "AI/ML",
    skills: [
      "RAG",
      "Semantic Search",
      "LLM Evals",
      "Model-Graded Rubrics",
      "Prompt Engineering",
      "Agentic Workflows",
      "Tool Calling",
      "Vector Databases",
      "Voice AI",
    ],
  },
  {
    title: "Tools/Tech",
    skills: [
      "Python",
      "MySQL",
      "OpenAI APIs",
      "Anthropic APIs",
      "XAI APIs",
      "Sarvam APIs",
      "ChromaDB",
      "Supabase",
    ],
  },
  {
    title: "Data",
    skills: ["Mixpanel", "WebEngage", "Python", "SQL"],
  },
] as const;

export const EDUCATION = [
  { name: "SP Jain GSM", short: "SP" },
  { name: "Christ University", short: "CU" },
  { name: "LSE", short: "LSE" },
] as const;

export const CHAT_PROMPTS = [
  "Is Rakshit a fit for our AI PM role?",
  "What problems does he solve?",
  "Share outcomes from Rakshit's projects",
  "How does he approach product strategy?",
] as const;
