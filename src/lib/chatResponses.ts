type Response = { text: string };

const responses: Record<string, Response> = {
  "is rakshit a fit for our ai pm role?": {
    text: "Yes — Rakshit has 5+ years in fintech product, with the last 3 focused on shipping LLM products. He's built RAG pipelines, agentic workflows, eval systems, semantic search, and voice interfaces. He doesn't just spec AI features — he owns the full loop from problem to production. At ET Money he reduced support tickets from 17K to 7K by leading the AI automation build end-to-end.",
  },
  "what problems does he solve?": {
    text: "Rakshit solves three types of problems: (1) Scaling ops-heavy workflows with AI — e.g. compressing financial planning from 4-5 hrs to 15 mins. (2) Building AI support systems that reduce ticket volume — 17K → 7K. (3) Taking fintech products from 0-to-1 — Loan Against MFs to ₹100Cr disbursals, ET Money Earn to ₹300Cr AUM. He's effective across wealth, lending, advisory, and support.",
  },
  "share outcomes from rakshit's projects": {
    text: "Here's what he's shipped:\n• 17K → 7K support tickets via AI triage at ET Money\n• ₹100Cr in Loan Against MF disbursals in 7 months\n• ₹300Cr AUM enabled via ET Money Earn\n• 4-5 hrs → 15 mins for financial plan creation at INDMoney\n• 20,000+ plans generated, ₹1.5Cr ARR in insurance\n• 50% course completion and ₹1.2Cr ARR at LearnApp\nActive projects: Krux.new (news agent), Feedback Agent, MF Semantic Search, US Stocks Analysis Agent.",
  },
  "how does he approach product strategy?": {
    text: "Rakshit anchors strategy on outcomes, not output. He works backwards from measurable user or business impact — then builds the smallest system that reliably produces it. For AI products, he focuses on eval-driven iteration: measure quality first, then scale. He's comfortable owning ambiguous problems where the solution space is undefined, which is why he's often pulled into 0-to-1 and platform-level work.",
  },
};

const fallback =
  "I can share more about Rakshit's experience, projects, or approach to AI product work. Try one of the suggested questions, or ask me something specific.";

export function getLocalResponse(query: string): string {
  const key = query.toLowerCase().trim();
  for (const [pattern, response] of Object.entries(responses)) {
    if (key.includes(pattern) || pattern.includes(key)) {
      return response.text;
    }
  }

  if (key.includes("ticket") || key.includes("support") || key.includes("ai")) {
    return responses["is rakshit a fit for our ai pm role?"].text;
  }
  if (key.includes("outcome") || key.includes("result") || key.includes("impact")) {
    return responses["share outcomes from rakshit's projects"].text;
  }
  if (key.includes("strategy") || key.includes("approach") || key.includes("think")) {
    return responses["how does he approach product strategy?"].text;
  }
  if (key.includes("problem") || key.includes("solve") || key.includes("build")) {
    return responses["what problems does he solve?"].text;
  }

  return fallback;
}
