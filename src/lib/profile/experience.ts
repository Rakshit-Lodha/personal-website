export const EXPERIENCE = [
  {
    id: "etmoney",
    company: "ET Money",
    location: "Gurugram",
    role: "Product Manager",
    start: "Dec 2022",
    end: "Present",
    headline: "Scaled AI support automation, lending, wealth, insurance, and mutual fund products.",
    tags: ["AI support automation", "lending", "wealth", "insurance", "mutual funds", "distribution"],
    outcomes: [
      {
        id: "etmoney-support-automation",
        label: "AI support automation",
        metric: "17,000 -> 7,000 monthly tickets",
        impact: "Reduced monthly ticket volume by designing intent classification, 100+ resolution workflows, and an eval pipeline.",
        evidence:
          "Built and scaled an AI support automation system with intent classification, 100+ resolution workflows, and evals for empathy, answer quality, policy compliance, and regression testing.",
        themes: ["support automation", "agentic workflows", "eval systems", "LLM products"],
      },
      {
        id: "etmoney-offline-distribution",
        label: "Offline distribution business",
        metric: "12% of SIP book and 10% of gross sales within 4 months",
        impact:
          "Enabled relationship managers to create goal-based investment plans and execute transactions on ET Money's platform.",
        evidence:
          "Built a 0-to-1 offline distribution business on top of ET Money's platform for relationship-manager-led planning and transactions.",
        themes: ["0-to-1", "wealth", "advisory", "distribution"],
      },
      {
        id: "etmoney-lamf",
        label: "Loan Against Mutual Funds",
        metric: "INR 100Cr disbursals in 7 months",
        impact: "Built and scaled Loan Against Mutual Funds from the ground up.",
        evidence: "Built and scaled Loan Against Mutual Funds from ground up to INR 100Cr disbursals in 7 months.",
        themes: ["lending", "mutual funds", "0-to-1"],
      },
      {
        id: "etmoney-earn",
        label: "ET Money Earn",
        metric: "INR 300Cr AUM",
        impact: "Led 0-to-1 development and scaling of ET Money Earn.",
        evidence: "Led 0-to-1 development and scaling of ET Money Earn to INR 300Cr AUM.",
        themes: ["wealth", "0-to-1", "AUM"],
      },
      {
        id: "etmoney-mf-platform",
        label: "Execution-only Mutual Fund Platform",
        metric: "Projected INR 10Cr annual revenue",
        impact: "Built an execution-only mutual fund platform with meaningful revenue potential.",
        evidence: "Built execution-only Mutual Fund Platform, projected to generate INR 10Cr annual revenue.",
        themes: ["mutual funds", "wealth", "revenue"],
      },
      {
        id: "etmoney-insurance-platform",
        label: "Health & Term Insurance",
        metric: "Increased term and health insurance policy sales by 100%",
        impact:
          "Increased insurance revenue from INR 1.5Cr to INR 3Cr by revamping term and health insurance journeys, adding partners, and introducing a new 1Cr health insurance product.",
        evidence: "Increased revenue of insurance as a vertical from INR 1.5Cr to INR 3Cr.",
        themes: ["insurance", "term insurance", "health insurance", "revenue"],
      },
      {
        id: "etmoney-earn-p2p-investment",
        label: "ET Money Earn (P2P Investment)",
        metric: "0 -> INR 100Cr AUM in 1 month",
        impact: "Built ET Money Earn from the ground up, reached INR 100Cr AUM in 1 month, and had the product showcased in an IPL ad.",
        evidence: "Generated INR 3Cr in annual income in the first year.",
        themes: ["investments", "P2P investment", "revenue", "0-to-1"],
      },
    ],
  },
  {
    id: "indmoney",
    company: "INDMoney",
    location: "Gurugram",
    role: "Associate Product Manager",
    start: "Dec 2020",
    end: "Dec 2022",
    headline: "Turned advisory and insurance workflows into scalable recommendation products.",
    tags: ["recommendations", "financial planning", "insurance", "advisory"],
    outcomes: [
      {
        id: "indmoney-financial-planning",
        label: "Financial planning module",
        metric: "4-5 hours -> 15 minutes; 20,000+ advisory plans",
        impact:
          "Reduced financial plan creation time with recommendation algorithms and scaled advisory plan generation.",
        evidence:
          "Built financial planning module with recommendation algorithms, reducing plan creation time from 4-5 hours to 15 minutes and enabling 20,000+ advisory plans.",
        themes: ["recommendations", "advisory", "workflow automation", "planning"],
      },
      {
        id: "indmoney-insurance-recommendations",
        label: "Insurance recommendations",
        metric: "INR 1.5Cr ARR in first year",
        impact: "Developed personalized insurance recommendations aligned with users' financial goals.",
        evidence:
          "Developed personalized insurance recommendation system aligned with financial goals, achieving INR 1.5Cr ARR in the first year.",
        themes: ["recommendations", "insurance", "personalization", "revenue"],
      },
    ],
  },
  {
    id: "learnapp",
    company: "LearnApp",
    location: "Remote",
    role: "Core Team Member",
    start: "Nov 2018",
    end: "Dec 2020",
    headline: "Helped build an investing education platform from an early-stage team.",
    tags: ["0-to-1", "education", "content", "investing"],
    outcomes: [
      {
        id: "learnapp-courses",
        label: "Investing and finance course library",
        metric: "50% course completion; INR 1.2Cr ARR",
        impact: "Designed a course library that improved completion and generated recurring revenue.",
        evidence:
          "Designed library of investing and finance courses, achieving 50% course completion rate and generating INR 1.2Cr ARR.",
        themes: ["0-to-1", "education", "investing", "content"],
      },
    ],
  },
] as const;

export type Experience = (typeof EXPERIENCE)[number];
export type Outcome = Experience["outcomes"][number];
