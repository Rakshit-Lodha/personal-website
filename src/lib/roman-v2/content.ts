import { EXPERIENCE } from "@/lib/profile/experience";
import { IDENTITY } from "@/lib/profile/identity";
import { PROJECTS } from "@/lib/profile/projects";
import { SONGS } from "@/lib/musicData";
import { getLatestEdition } from "@/lib/reading";
import { getPublicWhoopSnapshot } from "@/lib/whoop";
import { getWritingEntries } from "@/lib/writing";
import { READING_FIXTURE, WRITING_FIXTURES } from "./fixtures";
import type {
  AvailableAction,
  RomanV2Chapter,
  RomanV2Content,
  RomanV2Outcome,
  RomanV2Product,
  RomanV2ReadingEdition,
  RomanV2Whoop,
  RomanV2WritingRow,
} from "./types";

function action(label: string, href: string | null | undefined): AvailableAction {
  return href ? { available: true, label, href } : { available: false, label };
}

/** Presentation of each chapter. Figures restate EXPERIENCE outcomes; a missing sourceId drops the figure. */
const CHAPTER_COPY: Record<string, { title: string; narrative?: string; outcomes: RomanV2Outcome[] }> = {
  paytmmoney: { title: "Agents and app experience", outcomes: [] },
  etmoney: {
    title: "Scaled AI + financial products",
    narrative:
      "Support automation, lending and wealth products — built from first principles and scaled to real outcomes.",
    outcomes: [
      { sourceId: "etmoney-support-automation", value: "55%", label: "fewer monthly support tickets" },
      { sourceId: "etmoney-earn", value: "₹300Cr", label: "AUM on ET Money Earn" },
      { sourceId: "etmoney-lamf", value: "₹100Cr", label: "disbursed in 7 months" },
    ],
  },
  indmoney: {
    title: "Advice, turned into products",
    outcomes: [
      { sourceId: "indmoney-financial-planning", value: "15 min", label: "per financial plan, down from 4–5 hours" },
      { sourceId: "indmoney-financial-planning", value: "20,000+", label: "advisory plans enabled" },
      { sourceId: "indmoney-insurance-recommendations", value: "₹1.5Cr", label: "insurance ARR in year one" },
    ],
  },
  learnapp: {
    title: "Financial education, early team",
    outcomes: [
      { sourceId: "learnapp-courses", value: "50%", label: "course completion" },
      { sourceId: "learnapp-courses", value: "₹1.2Cr", label: "ARR from the course library" },
    ],
  },
};

const year = (value: string) => (value === "Present" ? "Now" : value.slice(-4));

// EXPERIENCE is already ordered newest first.
const chapters: RomanV2Chapter[] = EXPERIENCE.map((experience) => {
  const copy = CHAPTER_COPY[experience.id];
  const outcomeIds = new Set<string>(experience.outcomes.map((outcome) => outcome.id));
  return {
    id: experience.id,
    company: experience.company,
    role: experience.role,
    period: `${year(experience.start)} — ${year(experience.end)}`,
    current: experience.end === "Present",
    title: copy?.title ?? experience.company,
    narrative: copy?.narrative ?? experience.headline,
    outcomes: (copy?.outcomes ?? []).filter((outcome) => outcomeIds.has(outcome.sourceId)).slice(0, 3),
  };
});

/** Display order; first is featured. `href` overrides the profile demo link for on-site products. */
const PRODUCT_COPY = [
  { id: "ai-hiring-chat", tagline: "A portfolio that can evaluate the fit.", actionLabel: "Try the product", href: "/chat" },
  { id: "krux-new", tagline: "AI news in 100 words" },
  { id: "feedback-agent", tagline: "Signals from customer noise" },
  { id: "mf-semantic-search", tagline: "Find funds by intent" },
];

const products: RomanV2Product[] = PRODUCT_COPY.flatMap((copy, index) => {
  const project = PROJECTS.find((item) => item.id === copy.id);
  if (!project) return [];
  return {
    id: project.id,
    name: project.name,
    tagline: copy.tagline,
    summary: project.summary,
    status: project.status,
    featured: index === 0,
    screenshot: null,
    primaryAction: action(copy.actionLabel ?? `Open ${project.name}`, copy.href ?? project.links.demo),
    sourceAction: action(`View ${project.name} source`, project.links.github),
  };
});

const firstSong = SONGS[0];

export async function getRomanV2Content(): Promise<RomanV2Content> {
  const [latest, writing, whoop] = await Promise.all([
    getLatestEdition(),
    getWritingEntries(),
    getPublicWhoopSnapshot(),
  ]);

  const realEdition = latest && !latest.sample ? latest : null;
  const edition: RomanV2ReadingEdition = realEdition
    ? { fixture: false, date: realEdition.date, title: realEdition.title, summary: realEdition.summary }
    : READING_FIXTURE;

  const realWriting: RomanV2WritingRow[] = writing
    .filter((entry) => !entry.sample)
    .map((entry) => ({
      id: entry.slug,
      kind: entry.kind,
      title: entry.title,
      summary: entry.summary,
      date: entry.date,
      fixture: false,
      action: action(entry.title, entry.url),
    }));

  // Sample readings are mock values: only live or stale snapshots carry real numbers.
  const realWhoop = whoop.status === "live" || whoop.status === "stale";
  const reading = (key: string) => {
    const metric = whoop.metrics.find((item) => item.key === key);
    return realWhoop && metric ? metric.value : null;
  };
  const whoopModule: RomanV2Whoop = {
    eyebrow: "WHOOP",
    status: realWhoop ? (whoop.status as "live" | "stale") : "unavailable",
    metrics: [
      { key: "recovery", label: "Recovery", value: reading("recovery"), unit: "%" },
      { key: "sleep", label: "Sleep", value: reading("sleepPerformance"), unit: "%" },
      { key: "strain", label: "Strain", value: reading("strain"), unit: "" },
    ],
    syncedAt: realWhoop ? whoop.syncedAt : undefined,
  };

  return {
    nav: {
      wordmark: IDENTITY.name,
      items: [
        { id: "work", label: "Work", href: "#work" },
        { id: "products", label: "Products", href: "#products" },
        { id: "beyond", label: "Beyond", href: "#beyond" },
      ],
      jjLabel: "Talk to JJ",
    },
    hero: {
      heading: { lead: "Product", accent: "judgment." },
      body: "I build AI and financial products that turn complicated systems into things people can use.",
      primaryAction: action("Explore my work", "#work"),
      jjLabel: "Talk to JJ",
    },
    career: {
      heading: { lead: "Work,", accent: "over time." },
      body: "A career spent turning difficult systems into useful products.",
      chapters,
      initialChapterId: "etmoney",
    },
    products: {
      heading: { lead: "Selected", accent: "products" },
      body: "Useful ideas, shipped.",
      items: products,
    },
    beyond: {
      heading: { lead: "Beyond", accent: "work" },
      body: "Things I read, write, make and measure.",
      reading: {
        eyebrow: "Daily reading",
        heading: "From my corner of the internet",
        body: "Today’s ideas, distilled by Muse.",
        edition,
        // The reading module has no canonical edition URL yet.
        action: action("Read the latest edition", null),
      },
      writing: {
        eyebrow: "Writing",
        body: "Notes on products, AI and everything between",
        rows: realWriting.length > 0 ? realWriting : WRITING_FIXTURES,
        indexAction: action("See all writing", null),
      },
      music: {
        eyebrow: "Music",
        heading: "What I’m listening to",
        actionLabel: "Play a track",
        track: firstSong
          ? { id: firstSong.id, title: firstSong.title, cover: firstSong.cover, durationSeconds: firstSong.duration }
          : null,
      },
      whoop: whoopModule,
    },
    jj: {
      heading: { lead: "The portfolio", accent: "can answer back." },
      body: "Ask JJ about my work, decisions, failures and what I’d build next.",
      voiceLabel: "Talk to JJ",
      questionLabel: "Ask JJ a question",
      questionPlaceholder: "Type a question",
      chatPath: "/chat",
    },
    closing: {
      heading: { lead: "Let’s build something", accent: "people actually want to use." },
      conversationAction: action("Start a conversation", `mailto:${IDENTITY.contact.email}`),
      // No verified scheduling URL exists in the repository.
      scheduleAction: action("Schedule a call", null),
      wordmark: IDENTITY.name,
      tagline: "AI product builder. Fintech operator. Curious human.",
      navItems: [
        { label: "Work", href: "#work" },
        { label: "Products", href: "#products" },
        { label: "Beyond work", href: "#beyond" },
        { label: "Talk to JJ", href: "#jj" },
      ],
      socials: IDENTITY.contact.socials.map(({ label, url }) => action(label, url)),
      timezone: "India · IST",
      backToTop: action("Back to top", "#top"),
      inscription: { latin: "Festina lente.", translation: "Make haste slowly." },
    },
  };
}
