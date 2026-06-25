import type { SiteCommand } from "./commands";

export type KnowledgeEntityType =
  | "project"
  | "experience"
  | "outcome"
  | "failure"
  | "skill"
  | "song"
  | "navigation";

export type KnowledgeChunk = {
  id: string;
  entityType: KnowledgeEntityType;
  entityId: string;
  parentId?: string;
  title: string;
  aliases: string[];
  retrievalText: string;
  speechSummary: string;
  facts: string[];
  metadata: {
    source: "profile" | "music" | "site";
    sectionId?: "hero" | "my-story" | "projects" | "skill-map" | "education";
    pageAnchor?: string;
    visibleOnPage: boolean;
    companyId?: "etmoney" | "indmoney" | "learnapp";
    projectId?: string;
    outcomeId?: string;
    songId?: string;
    workContext?:
      | "professional"
      | "personal_project"
      | "education"
      | "music"
      | "site_navigation";
    evidenceStrength?: "direct_shipped" | "direct_claim" | "adjacent" | "generic";
    tags: string[];
    priority: number;
    links?: {
      github?: string;
      demo?: string;
      caseStudy?: string;
    };
  };
  preferredCommands: SiteCommand[];
};

export type EmbeddedKnowledgeChunk = KnowledgeChunk & {
  embedding: number[];
};

export type RetrievalResult = {
  query: string;
  selected: {
    chunkId: string;
    relevance: "high" | "medium" | "low";
    reason: string;
    useForAnswer: boolean;
    useForAction: boolean;
    suggestedCommands: SiteCommand[];
  }[];
  rejected: {
    chunkId: string;
    reason: string;
  }[];
  missingEvidence: string[];
};

export type RetrievalEvalCase = {
  id: string;
  query: string;
  expectedChunks: string[];
  acceptableChunks?: string[];
  forbiddenChunks?: string[];
  expectedCommands?: SiteCommand[];
};

export type RetrievalEvalResult = {
  caseId: string;
  passed: boolean;
  retrievedChunkIds: string[];
  selectedChunkIds: string[];
  commandMatches: boolean;
  notes: string[];
};
