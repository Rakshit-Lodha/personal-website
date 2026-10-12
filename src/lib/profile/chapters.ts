/**
 * Career chapters as shown on the site. Single source of truth for both the
 * scroll site's timeline (MyStory) and the city's Career Avenue.
 *
 * `companyId` and `outcomeIds` key into EXPERIENCE in ./experience.
 */

export type Chapter = {
  id: string;
  companyId: string;
  company: string;
  date: string;
  description: string;
  icon?: string;
  achievements: string[];
  outcomeIds: string[];
};

export const CHAPTERS: Chapter[] = [
  {
    id: "learnapp",
    companyId: "learnapp",
    company: "LearnApp - Core Team Member",
    date: "2018–2020",
    icon: "/landing/learnapp.png",
    description:
      "I joined LearnApp as a college student because I believed that financial education was broken in India and the only way to bring change in financial habits was through education.",
    achievements: [
      "Designed library of investing and finance courses",
      "50% course completion rate (category average: ~10%)",
      "₹1.2Cr ARR",
    ],
    outcomeIds: ["learnapp-courses", "learnapp-courses", "learnapp-courses"],
  },
  {
    id: "ind-money",
    companyId: "indmoney",
    company: "IND MONEY - ASSOCIATE PRODUCT MANAGER",
    date: "2020–2022",
    icon: "/landing/ind-money-v2.png",
    description:
      "Joined INDMoney because I realised that while financial education was important, it only changes what people know. But the real leverage in personal finance is at the moment of decision when you're buying a product, not before it.",
    achievements: [
      "Built financial planning module with recommendation algorithms — 4–5 hours to 15 minutes per plan",
      "Enabled 20,000+ advisory plans",
      "Built personalized insurance recommendation engine aligned to user goals — ₹1.5Cr ARR in year one",
    ],
    outcomeIds: [
      "indmoney-financial-planning",
      "indmoney-financial-planning",
      "indmoney-insurance-recommendations",
    ],
  },
  {
    id: "et-money",
    companyId: "etmoney",
    company: "ET Money - Product Manager",
    date: "2022–2026",
    icon: "/landing/et-money-v2.png",
    description:
      "My time at ET Money taught me one thing about AI products: the model is interchangeable, the eval is the product. The rubric is where the judgment lives. That experience continues to shape how I build.",
    achievements: [
      "Built AI support automation — 19K to 9K monthly tickets, a 55% reduction, and 30% CSAT improvement",
      "Built 0-to-1 offline distribution business — 12% of SIP book, 10% of gross sales within 4 months",
      "Built Loan Against Mutual Funds from zero — ₹100Cr disbursals in 7 months",
      "Led ET Money Earn from 0 to ₹300Cr AUM",
      "Built execution-only Mutual Fund Platform — projected ₹10Cr annual revenue",
    ],
    outcomeIds: [
      "etmoney-support-automation",
      "etmoney-offline-distribution",
      "etmoney-lamf",
      "etmoney-earn",
      "etmoney-mf-platform",
    ],
  },
  {
    id: "paytm-money",
    companyId: "paytmmoney",
    company: "Paytm Money - Sr. Product Manager",
    icon: "/landing/paytm-money.svg",
    date: "Jul 2026–Present",
    description:
      "I joined Paytm Money in July 2026. My current focus is on building agents and improving the overall app experience.",
    achievements: ["Working on agents", "Improving the overall app experience"],
    outcomeIds: [],
  },
];
