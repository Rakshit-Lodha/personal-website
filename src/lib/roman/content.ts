import { CHAPTERS } from "@/lib/profile/chapters";
import { EXPERIENCE } from "@/lib/profile/experience";
import { IDENTITY } from "@/lib/profile/identity";
import { PROJECTS } from "@/lib/profile/projects";
import { getLatestEdition } from "@/lib/reading";
import { getPublicWhoopSnapshot } from "@/lib/whoop";
import { getWritingEntries } from "@/lib/writing";
import type { RomanContent, RomanJourneyEntry, RomanProject } from "./types";

// EXPERIENCE is already ordered newest first.
const journey: RomanJourneyEntry[] = EXPERIENCE.map((experience) => {
  const chapter = CHAPTERS.find((item) => item.companyId === experience.id);
  return {
    id: experience.id,
    company: experience.company,
    role: experience.role,
    period: `${experience.start} — ${experience.end}`,
    current: experience.end === "Present",
    logo: chapter?.icon,
    summary: experience.headline,
    story: chapter?.description,
    outcomes: experience.outcomes.slice(0, 4).map((outcome) => ({
      id: outcome.id,
      label: outcome.label,
      metric: outcome.metric.replaceAll("->", "→"),
    })),
  };
});

/** Presentation details the profile data does not carry. Order here is display order. */
const FEATURED_PROJECTS = [
  {
    id: "krux-new",
    tagline: "AI news in short, swipeable stories",
    image: {
      src: "/landing/krux-banner.png",
      alt: "Krux logo card with the line \"Everything about AI in 100 words\" on a lavender background.",
      width: 723,
      height: 498,
    },
  },
  {
    id: "mf-semantic-search",
    tagline: "Semantic search across mutual funds",
    image: {
      src: "/landing/mf-search-banner.png",
      alt: "Illustration of a magnifying glass over a fan of translucent gradient panels, labelled MF Search.",
      width: 724,
      height: 498,
    },
  },
  {
    id: "ai-hiring-chat",
    tagline: "Hiring assistant for this portfolio",
    image: {
      src: "/landing/ai-hiring-chat-banner.png",
      alt: "Illustration of a phone with chat bubbles and sparkle icons, labelled AI Hiring Chat.",
      width: 724,
      height: 498,
    },
    // Lives on this site; the profile data has no external demo link.
    demoUrl: "/chat",
  },
];

const projects: RomanProject[] = FEATURED_PROJECTS.flatMap((featured) => {
  const project = PROJECTS.find((item) => item.id === featured.id);
  if (!project) return [];
  return {
    id: project.id,
    name: project.name,
    tagline: featured.tagline,
    summary: project.summary,
    status: project.status,
    image: featured.image,
    demoUrl: featured.demoUrl ?? project.links.demo ?? undefined,
    sourceUrl: project.links.github,
  };
});

export async function getRomanContent(): Promise<RomanContent> {
  const [latest, writing, whoop] = await Promise.all([
    getLatestEdition(),
    getWritingEntries(),
    getPublicWhoopSnapshot(),
  ]);

  return {
    intro: {
      name: IDENTITY.name,
      headline: "I work on products.",
      subline: "I also build things, write, and follow ideas that interest me.",
    },
    journey,
    projects,
    reading: { latest },
    writing,
    whoop,
    contact: {
      email: IDENTITY.contact.email,
      links: IDENTITY.contact.socials.map(({ label, url }) => ({ label, url })),
      // resumeUrl: no résumé file exists in public/ yet.
    },
    quote: {
      text: "No good thing is pleasant to possess, without friends to share it.",
      author: "Seneca",
      source: "Letters to Lucilius, 6.4",
    },
  };
}
