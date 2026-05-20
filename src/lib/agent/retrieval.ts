import { getReadyDeepEvidence, PROFILE_DATA } from "@/lib/profile";

type SearchMode = "fit" | "ask" | "auto" | "both";
type WorkContext = "production" | "professional" | "personal_project" | "generic_capability";
type EvidenceStrength = "direct_shipped" | "direct_claim" | "adjacent" | "generic";

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

function withEvidenceMetadata<T extends object>(
  item: T,
  workContext: WorkContext,
  evidenceStrength: EvidenceStrength,
) {
  return {
    ...item,
    workContext,
    evidenceStrength,
  };
}

function describeEvidencePriority() {
  return {
    rankingOrder: [
      "1. Professional shipped outcomes from ET Money, INDMoney, and LearnApp.",
      "2. Work-linked deepEvidence with sourceType experience or failure.",
      "3. Personal projects only as supporting evidence unless the user asks about projects or no professional evidence exists.",
      "4. Generic capability/tool lists only as weak support; do not lead with them.",
    ],
    qnaRule:
      "For Q&A about skills, product judgment, research, design, PRDs, prioritization, stakeholder management, fintech, or domain expertise, lead with production/professional evidence whenever present.",
    fitmentRule:
      "For fitment, calibrate directness from concrete shipped outcomes and criteria coverage, not keyword proximity.",
  };
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
    evidencePriority: describeEvidencePriority(),
    projects: projects.map((project) => withEvidenceMetadata(project, "personal_project", "direct_claim")),
    ...(readyDeepEvidence.length
      ? {
          deepEvidence: readyDeepEvidence.map((entry) =>
            withEvidenceMetadata(
              entry,
              entry.sourceType === "experience" || entry.sourceType === "failure" ? "professional" : "personal_project",
              entry.sourceType === "experience" || entry.sourceType === "failure" ? "direct_shipped" : "direct_claim",
            ),
          ),
        }
      : {}),
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
    evidencePriority: describeEvidencePriority(),
    outcomes: topMatches(outcomes, query, 8).map((outcome) =>
      withEvidenceMetadata(outcome, "production", "direct_shipped"),
    ),
    companies: topMatches(PROFILE_DATA.experience, query, 3).map((company) =>
      withEvidenceMetadata(company, "professional", "direct_claim"),
    ),
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
    evidencePriority: describeEvidencePriority(),
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
    technicalEvidence: (technicalMatches.length ? technicalMatches : PROFILE_DATA.technicalEvidence.slice(0, 4)).map(
      (item) => withEvidenceMetadata(item, "generic_capability", "generic"),
    ),
    projects: projectMatches.length
      ? projectMatches
          .map((project) => withEvidenceMetadata(project, "personal_project", "direct_claim"))
      : PROFILE_DATA.projects
          .filter((project) => project.featured)
          .slice(0, 4)
          .map((project) => withEvidenceMetadata(project, "personal_project", "direct_claim")),
    outcomes: outcomeMatches,
    ...(deepEvidenceMatches.length
      ? {
          deepEvidence: deepEvidenceMatches.map((entry) =>
            withEvidenceMetadata(
              entry,
              entry.sourceType === "experience" || entry.sourceType === "failure" ? "professional" : "personal_project",
              entry.sourceType === "experience" || entry.sourceType === "failure" ? "direct_shipped" : "direct_claim",
            ),
          ),
        }
      : {}),
  };
}
