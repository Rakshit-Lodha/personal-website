export type TestSet = "factual" | "quality" | "skeptic";

export type StageTiming = {
  stage: string;
  elapsed_ms: number;
  message: string;
};

export type CaseResult = {
  id: string;
  question: string;
  expected: string | null;
  response: Record<string, unknown> | null;
  answer_text: string;
  stages: StageTiming[];
  first_delta_ms: number | null;
  total_ms: number;
  error?: string;
};

export type RunFile = {
  version: string;
  test_set: TestSet;
  date: string;
  prompt_version?: string;
  profile_version?: string;
  system_prompt_sha: string;
  api_url: string;
  cases: CaseResult[];
};

export type FactualScore = {
  id: string;
  pass: boolean;
  reasoning: string;
};

export type QualityScore = {
  id: string;
  specificity: number;
  evidence_citation: number;
  anti_hallucination: number;
  reasoning: string;
};

export type SkepticScore = {
  id: string;
  fit_level_correct: boolean;
  expected_fit_level: string;
  actual_fit_level: string;
  core_criteria: string[];
  matched_criteria: string[];
  missing_or_weak_criteria: string[];
  target_alignment: number;
  fit_calibration: number;
  evidence_citation: number;
  anti_hallucination: number;
  reasoning: string;
};

export type ScoreFile = {
  version: string;
  test_set: TestSet;
  judge_model: string;
  date: string;
  cases: Array<FactualScore | QualityScore | SkepticScore>;
  summary: Record<string, number>;
};
