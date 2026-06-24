import Image from "next/image";
import Link from "next/link";

type Tag = { label: string; bold?: boolean };
type Card = { category: string; tags: Tag[] };

const ROW1: Card[] = [
  {
    category: "AI",
    tags: [
      { label: "RAG", bold: true },
      { label: "Semantic search" },
      { label: "LLM evals", bold: true },
      { label: "Model-graded rubrics" },
      { label: "Prompt engineering" },
      { label: "Vector databases" },
      { label: "Tool calling" },
      { label: "Agentic workflows" },
      { label: "Voice AI" },
    ],
  },
  {
    category: "Technical Tools",
    tags: [
      { label: "Python", bold: true },
      { label: "TypeScript" },
      { label: "Anthropic API", bold: true },
      { label: "Next.js" },
      { label: "React" },
      { label: "FastAPI" },
      { label: "OpenAI API" },
      { label: "xAI API" },
      { label: "Sarvam API" },
      { label: "ChromaDB" },
      { label: "Supabase" },
    ],
  },
];

const ROW2: Card[] = [
  {
    category: "Product",
    tags: [
      { label: "0 to 1" },
      { label: "Agile" },
      { label: "GTM planning", bold: true },
      { label: "Business case modelling" },
    ],
  },
  {
    category: "Analytics",
    tags: [
      { label: "A/B testing", bold: true },
      { label: "Cohort analysis" },
      { label: "SQL", bold: true },
      { label: "Mixpanel" },
    ],
  },
  {
    category: "Design",
    tags: [
      { label: "User interviews", bold: true },
      { label: "Figma" },
      { label: "Wireframing" },
    ],
  },
];

function SkillCard({ card }: { card: Card }) {
  return (
    <div
      className="flex flex-1 min-w-0 flex-col bg-white"
      style={{
        padding: "clamp(12px,1.04vw,18px)",
        gap: "clamp(12px,1.39vw,24px)",
        boxShadow:
          "0 19px 21px rgba(0,0,0,0.10), 0 77px 38.5px rgba(0,0,0,0.09), 0 173px 52px rgba(0,0,0,0.05), 0 307px 61.5px rgba(0,0,0,0.01)",
      }}
    >
      <div
        className="font-figtree uppercase text-[#496dff]"
        style={{
          fontSize: "clamp(11px,1.04vw,18px)",
          fontWeight: 800,
          lineHeight: 1.42,
        }}
      >
        {card.category}
      </div>
      <div
        className="flex flex-wrap"
        style={{
          gap: "clamp(10px,1.1vw,18px) clamp(14px,1.4vw,22px)",
        }}
      >
        {card.tags.map((t) => (
          <Link
            key={t.label}
            href={`/chat?q=${encodeURIComponent(
              `Tell me about Rakshit's experience with ${t.label}`
            )}`}
            className="skill-tag font-figtree whitespace-nowrap text-[#111]"
            style={{
              fontSize: t.bold ? "clamp(11px,1.04vw,18px)" : "clamp(10px,0.93vw,16px)",
              fontWeight: t.bold ? 700 : 400,
              lineHeight: 1.4,
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SkillMap() {
  return (
    <section
      id="skill-map"
      className="bg-[#F3F7F8]"
      style={{
        padding:
          "clamp(48px,5.5vw,96px) clamp(16px,5.3vw,92px) clamp(64px,9.3vw,120px)",
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: "clamp(12px,1.6vw,28px)", marginBottom: "clamp(24px,3vw,40px)" }}
      >
        <div
          className="flex flex-shrink-0 items-center"
          style={{ gap: "clamp(6px,0.5vw,9px)" }}
        >
          <h2
            className="font-display whitespace-nowrap text-[#496dff]"
            style={{ fontSize: "clamp(28px,3.7vw,82px)", lineHeight: 1 }}
          >
            SKILL MAP
          </h2>
          <Image
            src="/landing/skill-map-icon.png"
            alt=""
            width={100}
            height={100}
            className="flex-shrink-0 object-contain"
            style={{
              width: "clamp(40px,5.8vw,100px)",
              height: "clamp(40px,5.8vw,100px)",
            }}
          />
        </div>
        <div className="h-px flex-1 bg-[#c8d0ee]" />
      </div>

      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #dde0ff, #bbc8ff)",
          padding: "clamp(20px,2.4vw,42px)",
          gap: "clamp(16px,1.85vw,32px)",
        }}
      >
        <div
          className="flex flex-col items-stretch md:flex-row"
          style={{ gap: "clamp(12px,1.85vw,32px)" }}
        >
          {ROW1.map((c) => (
            <SkillCard key={c.category} card={c} />
          ))}
        </div>
        <div
          className="flex flex-col items-stretch md:flex-row"
          style={{ gap: "clamp(12px,1.85vw,32px)" }}
        >
          {ROW2.map((c) => (
            <SkillCard key={c.category} card={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
