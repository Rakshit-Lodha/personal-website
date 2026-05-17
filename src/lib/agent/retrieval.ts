import { getReadyDeepEvidence, PROFILE_DATA } from "@/lib/profile";

type SearchMode = "fit" | "ask" | "auto" | "both";

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
    identity: PROFILE_DATA.person,
    education: PROFILE_DATA.education,
    hiringPreferences: PROFILE_DATA.hiringPreferences,
  };
}

export function getProjectDetails(projectIds?: readonly string[]) {
  const wanted = new Set(projectIds ?? []);
  const projects = wanted.size
    ? PROFILE_DATA.projects.filter((project) => wanted.has(project.id))
    : PROFILE_DATA.projects.filter((project) => project.featured);
  const readyDeepEvidence = getReadyDeepEvidence().filter((entry) =>
    projects.some((project) => project.id === entry.sourceId),
  );

  return {
    projects,
    ...(readyDeepEvidence.length ? { deepEvidence: readyDeepEvidence } : {}),
  };
}

export function getExperienceOutcomes(query: string) {
  const outcomes = PROFILE_DATA.experience.flatMap((experience) =>
    experience.outcomes.map((outcome) => ({
      company: experience.company,
      role: experience.role,
      period: `${experience.start} - ${experience.end}`,
      ...outcome,
    })),
  );

  return {
    outcomes: topMatches(outcomes, query, 8),
    companies: topMatches(PROFILE_DATA.experience, query, 3),
  };
}

export function searchProfileEvidence(query: string, mode: SearchMode = "auto") {
  const fitMatches = topMatches(PROFILE_DATA.fitThemes, query, mode === "fit" || mode === "both" ? 6 : 4);
  const technicalMatches = topMatches(PROFILE_DATA.technicalEvidence, query, 5);
  const projectMatches = topMatches(PROFILE_DATA.projects, query, 5);
  const deepEvidenceMatches = topMatches(getReadyDeepEvidence(), query, 3);
  const outcomeMatches = getExperienceOutcomes(query).outcomes;

  return {
    mode,
    identity: {
      name: PROFILE_DATA.person.name,
      title: PROFILE_DATA.person.title,
      location: PROFILE_DATA.person.location,
      locationPreference: PROFILE_DATA.person.locationPreference,
      summary: PROFILE_DATA.person.summary,
      positioning: PROFILE_DATA.person.positioning,
      domains: PROFILE_DATA.person.domains,
      workStyle: PROFILE_DATA.person.workStyle,
      aiProductCapabilities: PROFILE_DATA.person.aiProductCapabilities,
      technicalTools: PROFILE_DATA.person.technicalTools,
    },
    fitEvidence: fitMatches.length ? fitMatches : PROFILE_DATA.fitThemes.slice(0, 4),
    technicalEvidence: technicalMatches.length ? technicalMatches : PROFILE_DATA.technicalEvidence.slice(0, 4),
    projects: projectMatches.length
      ? projectMatches
      : PROFILE_DATA.projects.filter((project) => project.featured).slice(0, 4),
    outcomes: outcomeMatches,
    ...(deepEvidenceMatches.length ? { deepEvidence: deepEvidenceMatches } : {}),
  };
}
