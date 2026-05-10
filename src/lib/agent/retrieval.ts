import {
  EDUCATION,
  EXPERIENCE,
  FIT_EVIDENCE,
  IDENTITY,
  PROJECTS,
  TECHNICAL_EVIDENCE,
} from "@/lib/profile";

type SearchMode = "fit" | "ask" | "auto";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "our",
  "the",
  "this",
  "to",
  "with",
  "you",
]);

function tokens(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9₹+.-]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function searchableText(value: unknown) {
  return JSON.stringify(value).toLowerCase();
}

function score(value: unknown, query: string) {
  const haystack = searchableText(value);
  return tokens(query).reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
}

function topMatches<T>(items: readonly T[], query: string, limit: number) {
  return items
    .map((item) => ({ item, score: score(item, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function getIdentityContext() {
  return {
    identity: IDENTITY,
    education: EDUCATION,
  };
}

export function getProjectDetails(projectIds?: readonly string[]) {
  const wanted = new Set(projectIds ?? []);
  const projects = wanted.size
    ? PROJECTS.filter((project) => wanted.has(project.id))
    : PROJECTS.filter((project) => project.featured);

  return {
    projects,
  };
}

export function getExperienceOutcomes(query: string) {
  const outcomes = EXPERIENCE.flatMap((experience) =>
    experience.outcomes.map((outcome) => ({
      company: experience.company,
      role: experience.role,
      period: `${experience.start} - ${experience.end}`,
      ...outcome,
    })),
  );

  return {
    outcomes: topMatches(outcomes, query, 8),
    companies: topMatches(EXPERIENCE, query, 3),
  };
}

export function searchProfileEvidence(query: string, mode: SearchMode = "auto") {
  const fitMatches = topMatches(FIT_EVIDENCE, query, mode === "fit" ? 6 : 4);
  const technicalMatches = topMatches(TECHNICAL_EVIDENCE, query, 5);
  const projectMatches = topMatches(PROJECTS, query, 5);
  const outcomeMatches = getExperienceOutcomes(query).outcomes;

  return {
    mode,
    identity: {
      name: IDENTITY.name,
      title: IDENTITY.title,
      summary: IDENTITY.summary,
      positioning: IDENTITY.positioning,
      domains: IDENTITY.domains,
      aiProductCapabilities: IDENTITY.aiProductCapabilities,
      technicalTools: IDENTITY.technicalTools,
    },
    fitEvidence: fitMatches.length ? fitMatches : FIT_EVIDENCE.slice(0, 4),
    technicalEvidence: technicalMatches.length ? technicalMatches : TECHNICAL_EVIDENCE.slice(0, 4),
    projects: projectMatches.length ? projectMatches : PROJECTS.filter((project) => project.featured).slice(0, 4),
    outcomes: outcomeMatches,
  };
}
