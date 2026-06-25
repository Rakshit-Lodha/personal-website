import type { RetrievalEvalCase } from "../knowledgeTypes";

export const JJ_RETRIEVAL_CASES: RetrievalEvalCase[] = [
  {
    id: "krux-exact",
    query: "Tell me about Krux",
    expectedChunks: ["project:krux-new"],
    forbiddenChunks: ["project:talk-to-krishna"],
    expectedCommands: [{ type: "focus_project", projectId: "krux-new" }],
  },
  {
    id: "krux-asr-crux",
    query: "Tell me about Crux",
    expectedChunks: ["project:krux-new"],
    forbiddenChunks: ["project:talk-to-krishna"],
    expectedCommands: [{ type: "focus_project", projectId: "krux-new" }],
  },
  {
    id: "krux-semantic",
    query: "Which project turns AI news into short swipeable stories?",
    expectedChunks: ["project:krux-new"],
    acceptableChunks: ["navigation:projects", "skill:full-stack-ai-products"],
    forbiddenChunks: ["project:talk-to-krishna"],
  },
  {
    id: "indmoney-planning",
    query: "What did Rakshit build at INDMoney around financial planning?",
    expectedChunks: ["experience:indmoney", "outcome:indmoney-financial-planning"],
    acceptableChunks: ["outcome:indmoney-insurance-recommendations"],
    expectedCommands: [{ type: "focus_experience", companyId: "indmoney" }],
  },
  {
    id: "etmoney-support-automation",
    query: "Tell me about ET Money support automation and the eval pipeline",
    expectedChunks: ["outcome:etmoney-support-automation"],
    acceptableChunks: ["experience:etmoney", "skill:eval-driven-ai-product"],
    expectedCommands: [{ type: "focus_experience", companyId: "etmoney" }],
  },
  {
    id: "agentic-ai",
    query: "What agentic AI work has Rakshit done?",
    expectedChunks: ["skill:agents-and-tool-orchestration"],
    acceptableChunks: [
      "project:feedback-agent",
      "project:us-stocks-analysis-agent",
      "project:ai-hiring-chat",
      "project:krux-new",
    ],
  },
  {
    id: "song-etmoney",
    query: "Play the song related to ET Money",
    expectedChunks: ["song:what-good-looks-like"],
    acceptableChunks: ["experience:etmoney"],
    expectedCommands: [{ type: "music_play_track", songId: "what-good-looks-like" }],
  },
  {
    id: "pure-play-music",
    query: "Play music",
    expectedChunks: [],
    expectedCommands: [{ type: "music_play" }],
  },
  {
    id: "pure-scroll-projects",
    query: "Show me the projects section",
    expectedChunks: [],
    expectedCommands: [{ type: "scroll_to_section", sectionId: "projects" }],
  },
];
