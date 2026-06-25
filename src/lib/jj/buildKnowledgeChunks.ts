import { SONGS } from "@/lib/musicData";
import { EDUCATION, EXPERIENCE, PROJECTS, TECHNICAL_EVIDENCE } from "@/lib/profile";
import { PROFILE_V2_DEEP_EVIDENCE } from "@/lib/profile/v2";
import type { SiteCommand } from "./commands";
import type { KnowledgeChunk } from "./knowledgeTypes";

const sectionChunks: KnowledgeChunk[] = [
  {
    id: "navigation:hero",
    entityType: "navigation",
    entityId: "hero",
    title: "Home hero",
    aliases: ["home", "top", "start", "hero", "intro"],
    retrievalText: "The hero section introduces Rakshit Lodha and the portfolio.",
    speechSummary: "The hero is the top intro section of Rakshit's portfolio.",
    facts: ["Visible on the home page.", "Useful when the user asks to go to the top."],
    metadata: {
      source: "site",
      sectionId: "hero",
      pageAnchor: "#hero",
      visibleOnPage: true,
      workContext: "site_navigation",
      evidenceStrength: "direct_claim",
      tags: ["navigation", "home", "hero", "intro"],
      priority: 40,
    },
    preferredCommands: [{ type: "scroll_to_section", sectionId: "hero" }],
  },
  {
    id: "navigation:my-story",
    entityType: "navigation",
    entityId: "my-story",
    title: "My Story",
    aliases: ["my story", "story", "experience", "career", "work history"],
    retrievalText:
      "The My Story section contains Rakshit's LearnApp, INDMoney, and ET Money experience timeline.",
    speechSummary: "My Story shows Rakshit's career timeline across LearnApp, INDMoney, and ET Money.",
    facts: ["Contains visible career cards.", "Includes outcomes from LearnApp, INDMoney, and ET Money."],
    metadata: {
      source: "site",
      sectionId: "my-story",
      pageAnchor: "#my-story",
      visibleOnPage: true,
      workContext: "site_navigation",
      evidenceStrength: "direct_claim",
      tags: ["navigation", "experience", "career", "timeline"],
      priority: 70,
    },
    preferredCommands: [{ type: "scroll_to_section", sectionId: "my-story" }],
  },
  {
    id: "navigation:projects",
    entityType: "navigation",
    entityId: "projects",
    title: "Projects",
    aliases: ["projects", "portfolio projects", "side projects", "ai projects"],
    retrievalText:
      "The Projects section contains Rakshit's featured AI projects including Krux.news, AI Hiring Chat, MF Semantic Search, and more.",
    speechSummary: "Projects shows Rakshit's featured AI and product builds.",
    facts: ["Visible on the home page.", "Contains project cards and links."],
    metadata: {
      source: "site",
      sectionId: "projects",
      pageAnchor: "#projects",
      visibleOnPage: true,
      workContext: "site_navigation",
      evidenceStrength: "direct_claim",
      tags: ["navigation", "projects", "ai projects"],
      priority: 80,
    },
    preferredCommands: [{ type: "scroll_to_section", sectionId: "projects" }],
  },
  {
    id: "navigation:skill-map",
    entityType: "navigation",
    entityId: "skill-map",
    title: "Skill Map",
    aliases: ["skills", "skill map", "technical skills", "tools"],
    retrievalText:
      "The Skill Map section shows Rakshit's AI, technical, product, analytics, and design skills.",
    speechSummary: "Skill Map shows Rakshit's AI, technical, product, analytics, and design skills.",
    facts: ["Visible on the home page.", "Includes AI, tools, product, analytics, and design skills."],
    metadata: {
      source: "site",
      sectionId: "skill-map",
      pageAnchor: "#skill-map",
      visibleOnPage: true,
      workContext: "site_navigation",
      evidenceStrength: "direct_claim",
      tags: ["navigation", "skills", "tools"],
      priority: 60,
    },
    preferredCommands: [{ type: "scroll_to_section", sectionId: "skill-map" }],
  },
  {
    id: "navigation:education",
    entityType: "navigation",
    entityId: "education",
    title: "Education",
    aliases: ["education", "college", "school", "degrees"],
    retrievalText:
      "The Education section lists Rakshit's MBA, BBA, and LSE summer school education.",
    speechSummary: "Education shows Rakshit's academic background.",
    facts: EDUCATION.map((entry) => `${entry.school}: ${entry.credential}`),
    metadata: {
      source: "site",
      sectionId: "education",
      pageAnchor: "#education",
      visibleOnPage: true,
      workContext: "education",
      evidenceStrength: "direct_claim",
      tags: ["navigation", "education", "school", "degree"],
      priority: 50,
    },
    preferredCommands: [{ type: "scroll_to_section", sectionId: "education" }],
  },
];

const songMeaning: Record<
  string,
  {
    anchor: string;
    style: string[];
    aliases: string[];
    commands: SiteCommand[];
    companyId?: "etmoney" | "indmoney" | "learnapp";
    sectionId?: "projects" | "my-story";
  }
> = {
  "open-it-up": {
    anchor: "Projects",
    style: ["rap", "Eminem-style rap"],
    aliases: ["project song", "projects song", "rap song for projects"],
    sectionId: "projects",
    commands: [
      { type: "music_play_track", songId: "open-it-up" },
      { type: "scroll_to_section", sectionId: "projects" },
      { type: "open_music_player" },
    ],
  },
  "what-good-looks-like": {
    anchor: "ET Money",
    style: ["rap", "boom bap", "hip hop"],
    aliases: ["et money song", "etmoney song", "boom bap song", "hip hop song"],
    companyId: "etmoney",
    sectionId: "my-story",
    commands: [
      { type: "music_play_track", songId: "what-good-looks-like" },
      { type: "focus_experience", companyId: "etmoney" },
      { type: "open_music_player" },
    ],
  },
  "closer-to-the-choice": {
    anchor: "INDMoney",
    style: ["rock", "hard rock", "arena rock"],
    aliases: ["indmoney song", "ind money song", "rock song", "hard rock song"],
    companyId: "indmoney",
    sectionId: "my-story",
    commands: [
      { type: "music_play_track", songId: "closer-to-the-choice" },
      { type: "focus_experience", companyId: "indmoney" },
      { type: "open_music_player" },
    ],
  },
  "make-it-to-the-end": {
    anchor: "LearnApp",
    style: ["acoustic rock", "indie rock", "energetic rock"],
    aliases: ["learnapp song", "learn app song", "acoustic rock song", "indie rock song"],
    companyId: "learnapp",
    sectionId: "my-story",
    commands: [
      { type: "music_play_track", songId: "make-it-to-the-end" },
      { type: "focus_experience", companyId: "learnapp" },
      { type: "open_music_player" },
    ],
  },
};

function compactFacts(items: readonly string[], max = 6): string[] {
  return items.filter(Boolean).slice(0, max);
}

function projectAliases(project: (typeof PROJECTS)[number]): string[] {
  const aliases: string[] = [project.name, project.id, project.type, ...project.capabilities];
  if (project.id === "krux-new") {
    aliases.push("Krux", "Crux", "Krux.news", "Crux.news", "Krux news", "Crux news", "AI Times", "ai-times");
  }
  return [...new Set(aliases.map((alias) => alias.trim()).filter(Boolean))];
}

function projectCommands(project: (typeof PROJECTS)[number]): SiteCommand[] {
  const commands: SiteCommand[] = [
    { type: "scroll_to_section", sectionId: "projects" },
    { type: "focus_project", projectId: project.id },
  ];
  if (project.links.github) {
    commands.push({ type: "open_project_link", projectId: project.id, linkType: "github" });
  }
  if (project.links.demo) {
    commands.push({ type: "open_project_link", projectId: project.id, linkType: "demo" });
  }
  return commands;
}

export function buildKnowledgeChunks(): KnowledgeChunk[] {
  const projectChunks: KnowledgeChunk[] = PROJECTS.map((project) => {
    const deepEvidence = PROFILE_V2_DEEP_EVIDENCE.find(
      (entry) => entry.sourceType === "project" && entry.sourceId === project.id && entry.status === "ready"
    );
    const retrievalParts = [
      project.name,
      project.type,
      project.summary,
      project.architecture,
      ...project.capabilities,
      ...project.stack,
      ...(project.proofPoints ?? []),
      ...("metrics" in project ? project.metrics : []),
      deepEvidence?.oneLine,
      deepEvidence?.context,
      deepEvidence?.userOrBusinessProblem,
      deepEvidence?.rakshitRole,
      ...(deepEvidence?.executionDetails ?? []),
      ...(deepEvidence?.lessonsLearned ?? []),
    ];

    return {
      id: `project:${project.id}`,
      entityType: "project",
      entityId: project.id,
      title: project.name,
      aliases: projectAliases(project),
      retrievalText: retrievalParts.filter(Boolean).join("\n"),
      speechSummary: deepEvidence?.oneLine ?? project.summary,
      facts: compactFacts([project.summary, project.architecture, ...(project.proofPoints ?? [])], 8),
      metadata: {
        source: "profile",
        sectionId: "projects",
        pageAnchor: "#projects",
        visibleOnPage: true,
        projectId: project.id,
        workContext: "personal_project",
        evidenceStrength: "direct_shipped",
        tags: [...new Set(["project", project.type, project.status, ...project.capabilities, ...project.stack])],
        priority: project.featured ? 95 : 70,
        links: {
          github: project.links.github,
          demo: project.links.demo ?? undefined,
        },
      },
      preferredCommands: projectCommands(project),
    };
  });

  const experienceChunks: KnowledgeChunk[] = EXPERIENCE.flatMap((experience) => {
    const experienceChunk: KnowledgeChunk = {
      id: `experience:${experience.id}`,
      entityType: "experience",
      entityId: experience.id,
      title: `${experience.company} - ${experience.role}`,
      aliases: [experience.company, experience.id, experience.role, ...experience.tags],
      retrievalText: [
        experience.company,
        experience.role,
        experience.location,
        experience.start,
        experience.end,
        experience.headline,
        ...experience.tags,
        ...experience.outcomes.flatMap((outcome) => [
          outcome.label,
          outcome.metric,
          outcome.impact,
          outcome.evidence,
          ...outcome.themes,
        ]),
      ].join("\n"),
      speechSummary: experience.headline,
      facts: compactFacts([
        `${experience.role} at ${experience.company}`,
        experience.headline,
        ...experience.outcomes.map((outcome) => `${outcome.label}: ${outcome.metric}`),
      ]),
      metadata: {
        source: "profile",
        sectionId: "my-story",
        pageAnchor: "#my-story",
        visibleOnPage: true,
        companyId: experience.id,
        workContext: "professional",
        evidenceStrength: "direct_shipped",
        tags: ["experience", experience.company, experience.role, ...experience.tags],
        priority: 100,
      },
      preferredCommands: [
        { type: "scroll_to_section", sectionId: "my-story" },
        { type: "focus_experience", companyId: experience.id },
      ],
    };

    const outcomeChunks: KnowledgeChunk[] = experience.outcomes.map((outcome) => ({
      id: `outcome:${outcome.id}`,
      entityType: "outcome",
      entityId: outcome.id,
      parentId: experience.id,
      title: `${experience.company}: ${outcome.label}`,
      aliases: [outcome.label, outcome.id, experience.company, ...outcome.themes],
      retrievalText: [
        experience.company,
        outcome.label,
        outcome.metric,
        outcome.impact,
        outcome.evidence,
        ...outcome.themes,
      ].join("\n"),
      speechSummary: `${outcome.label}: ${outcome.impact}`,
      facts: compactFacts([outcome.metric, outcome.impact, outcome.evidence]),
      metadata: {
        source: "profile",
        sectionId: "my-story",
        pageAnchor: "#my-story",
        visibleOnPage: true,
        companyId: experience.id,
        outcomeId: outcome.id,
        workContext: "professional",
        evidenceStrength: "direct_shipped",
        tags: ["outcome", experience.company, outcome.label, ...outcome.themes],
        priority: 100,
      },
      preferredCommands: [
        { type: "focus_experience", companyId: experience.id },
        { type: "highlight_outcome", outcomeId: outcome.id },
      ],
    }));

    const failureChunks: KnowledgeChunk[] =
      "failures" in experience
        ? experience.failures.map((failure) => ({
            id: `failure:${failure.id}`,
            entityType: "failure",
            entityId: failure.id,
            parentId: experience.id,
            title: `${experience.company}: ${failure.label}`,
            aliases: [failure.label, failure.id, experience.company, ...failure.themes],
            retrievalText: [
              experience.company,
              failure.label,
              failure.summary,
              ...failure.whatWentWrong,
              ...failure.themes,
            ].join("\n"),
            speechSummary: failure.summary,
            facts: compactFacts([failure.summary, ...failure.whatWentWrong], 8),
            metadata: {
              source: "profile",
              sectionId: "my-story",
              pageAnchor: "#my-story",
              visibleOnPage: false,
              companyId: experience.id,
              workContext: "professional",
              evidenceStrength: "direct_claim",
              tags: ["failure", experience.company, failure.label, ...failure.themes],
              priority: 75,
            },
            preferredCommands: [{ type: "focus_experience", companyId: experience.id }],
          }))
        : [];

    return [experienceChunk, ...outcomeChunks, ...failureChunks];
  });

  const skillChunks: KnowledgeChunk[] = TECHNICAL_EVIDENCE.map((skill) => ({
    id: `skill:${skill.id}`,
    entityType: "skill",
    entityId: skill.id,
    title: skill.label,
    aliases: [skill.label, skill.id, ...skill.tools],
    retrievalText: [
      skill.label,
      skill.summary,
      ...skill.evidence,
      ...skill.tools,
      ...skill.projectIds,
    ].join("\n"),
    speechSummary: skill.summary,
    facts: compactFacts(skill.evidence, 8),
    metadata: {
      source: "profile",
      sectionId: "skill-map",
      pageAnchor: "#skill-map",
      visibleOnPage: true,
      workContext: "personal_project",
      evidenceStrength: "direct_claim",
      tags: ["skill", skill.label, ...skill.tools, ...skill.projectIds],
      priority: 80,
    },
    preferredCommands: [{ type: "scroll_to_section", sectionId: "skill-map" }],
  }));

  const songChunks: KnowledgeChunk[] = SONGS.map((song) => {
    const meaning = songMeaning[song.id];
    const style = meaning?.style ?? [];
    const anchor = meaning?.anchor ?? "Music player";
    return {
      id: `song:${song.id}`,
      entityType: "song",
      entityId: song.id,
      title: song.title,
      aliases: [song.title, song.id, ...(meaning?.aliases ?? []), ...style],
      retrievalText: `${song.title} is tied to Rakshit's ${anchor} phase. Style: ${style.join(", ")}. It is available in the website music player.`,
      speechSummary: `${song.title} is the ${anchor} track${style.length ? ` with a ${style.join(", ")} feel` : ""}.`,
      facts: [
        `Mapped to Rakshit's ${anchor} phase.`,
        style.length ? `Style: ${style.join(", ")}.` : "Available in the website music player.",
        "Available in the website music player.",
      ],
      metadata: {
        source: "music",
        sectionId: meaning?.sectionId,
        visibleOnPage: true,
        companyId: meaning?.companyId,
        songId: song.id,
        workContext: "music",
        evidenceStrength: "direct_claim",
        tags: ["music", "song", anchor, ...style],
        priority: 100,
      },
      preferredCommands: meaning?.commands ?? [
        { type: "music_play_track", songId: song.id },
        { type: "open_music_player" },
      ],
    };
  });

  return [...sectionChunks, ...projectChunks, ...experienceChunks, ...skillChunks, ...songChunks];
}

export const JJ_KNOWLEDGE_CHUNKS = buildKnowledgeChunks();
