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

/** Presentation of each chapter. `company`, `role` and `period` override EXPERIENCE where the copy differs. */
const CHAPTER_COPY: Record<
  string,
  { title: string; narrative: string; company?: string; role?: string; period?: string; outcomes: RomanV2Outcome[] }
> = {
  paytmmoney: {
    title: "App experience + Agents",
    narrative: "Improving the app experience and building consumer-facing agents.",
    period: "Present",
    outcomes: [{ value: "FAFO", label: "" }],
  },
  etmoney: {
    title: "Scaled numbers beyond the powerpoint",
    narrative:
      "Built AI, lending and wealth products that deliver real numbers. Taught customer support AI empathy along the way. Humans remain a work in progress.",
    outcomes: [
      { value: "53%", label: "fewer tickets" },
      { value: "₹300Cr", label: "AUM for ET Money Earn" },
      { value: "₹250Cr", label: "disbursals in 12 months" },
    ],
  },
  indmoney: {
    title: "From “someday” to a plan",
    company: "INDmoney",
    narrative:
      "Built the goal planning tool from zero and grew it to 2 million users, contributing 30% of total subscription revenue and almost ₹1.5Cr in insurance sales. “Someday” turned out to be a sizeable product opportunity.",
    outcomes: [
      { value: "2M", label: "goal planning users" },
      { value: "30%", label: "of subscription revenue" },
      { value: "₹1.5Cr", label: "in insurance sales" },
    ],
  },
  learnapp: {
    title: "Bunking classes to build a business",
    role: "Core team member",
    narrative:
      "Joined in my second year of college and built its live-class business and investing catalog from zero, together contributing almost 40% of subscription revenue. Along the way, I grew an investing community and built custom content with AMCs.",
    outcomes: [
      { value: "40%", label: "of subscription revenue" },
      { value: "₹10L", label: "MRR" },
    ],
  },
};

const year = (value: string) => (value === "Present" ? "Now" : value.slice(-4));

// EXPERIENCE is already ordered newest first.
const chapters: RomanV2Chapter[] = EXPERIENCE.map((experience) => {
  const copy = CHAPTER_COPY[experience.id];
  return {
    id: experience.id,
    company: copy?.company ?? experience.company,
    role: copy?.role ?? experience.role,
    period: copy?.period ?? `${year(experience.start)} — ${year(experience.end)}`,
    current: experience.end === "Present",
    title: copy?.title ?? experience.company,
    narrative: copy?.narrative ?? experience.headline,
    outcomes: (copy?.outcomes ?? []).slice(0, 3),
  };
});

const SCREENS = "/roman-v2/projects/screens";

/**
 * Display order; first is featured. `href` overrides the profile demo link: on-site products, or the
 * source while a hosted demo is down (Feedback Intelligence's Render service is suspended).
 * Screenshots are real 1440×900 captures.
 */
const PRODUCT_COPY: {
  id: string;
  tagline: string;
  actionLabel?: string;
  /** Hover panel; products without one show none. */
  details?: RomanV2Product["details"];
  href?: string | null;
  screenshot?: RomanV2Product["screenshot"];
}[] = [
  {
    id: "ai-hiring-chat",
    tagline: "A portfolio that can evaluate the fit.",
    actionLabel: "Try Now",
    details: {
      title: "Hiring Assistant",
      body: "Helping recruiters assess fit using a job description, company link, or question.",
      actionLabel: "Try it out",
    },
    href: "/chat",
    screenshot: {
      src: `${SCREENS}/ai-hiring-chat`,
      alt: "AI Hiring Chat welcome screen with suggested questions and a message box",
      width: 1100,
      height: 866,
      widths: [560, 1100],
    },
  },
  {
    id: "krux-new",
    tagline: "AI news in 100 words",
    details: {
      title: "Krux.news",
      body: "Multi-stage AI pipeline combines ingestion, web research, curation, and publishing into swipeable news stories.",
      actionLabel: "Try it out",
    },
    screenshot: {
      src: `${SCREENS}/krux-new`,
      alt: "Krux.news introduction card: everything about AI in 100 words",
      width: 960,
      height: 900,
      widths: [480, 960],
    },
  },
  {
    id: "feedback-agent",
    tagline: "Signals from customer noise",
    // The hosted demo is suspended, so the card links to the source.
    href: "https://github.com/Rakshit-Lodha/managed-agents-review",
    details: {
      title: "Feedback Intelligence",
      body: "Feedback agent built with OpenAI Agents SDK, Next.js onboarding, and a FastAPI preview backend.",
      actionLabel: "Learn More",
    },
  },
  {
    id: "mf-semantic-search",
    tagline: "Find funds by intent",
    details: {
      title: "Fund Finder",
      body: "Embeddings and ChromaDB power semantic lookup, comparison, and discovery across all mutual funds.",
      actionLabel: "Try it out",
    },
    screenshot: {
      src: `${SCREENS}/mf-semantic-search`,
      alt: "MF Semantic Search with example queries and a fund search box",
      width: 900,
      height: 833,
      widths: [450, 900],
    },
  },
];

const products: RomanV2Product[] = PRODUCT_COPY.flatMap((copy, index) => {
  const project = PROJECTS.find((item) => item.id === copy.id);
  if (!project) return [];
  return {
    id: project.id,
    name: project.name,
    tagline: copy.tagline,
    summary: project.summary,
    featured: index === 0,
    screenshot: copy.screenshot ?? null,
    details: copy.details ?? null,
    primaryAction: action(copy.actionLabel ?? `Open ${project.name}`, copy.href !== undefined ? copy.href : project.links.demo),
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
    eyebrow: "Health Maxxing",
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
      body: "Building consumer products which people actually love and use",
      primaryAction: action("Explore my work", "#work"),
      jjLabel: "Talk to JJ",
    },
    career: {
      heading: { lead: "Work,", accent: "over time." },
      body: "",
      chapters,
      initialChapterId: "etmoney",
    },
    products: {
      heading: { lead: "Selected", accent: "products" },
      body: "",
      items: products,
    },
    beyond: {
      heading: { lead: "Beyond", accent: "work" },
      body: "",
      reading: {
        eyebrow: "Daily reading",
        heading: "From my corner of the internet",
        body: "Today’s ideas, distilled by Muse.",
        edition,
        // Points at the latest published one-pager once an edition exists.
        action: action("Read the latest edition", realEdition ? `/roman-v2/reading/${realEdition.date}` : null),
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
      heading: { lead: "Have more", accent: "questions?" },
      body: "Ask JJ about my work, decisions, failures and how I think",
      voiceLabel: "Talk to JJ",
    },
    closing: {
      heading: { lead: "Festina Lente", accent: "Make haste slowly" },
      attribution: "Augustus",
      conversationAction: action("Start a conversation", `mailto:${IDENTITY.contact.email}`),
      socials: IDENTITY.contact.socials.map(({ label, url }) => action(label, url)),
    },
  };
}
