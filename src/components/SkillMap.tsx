"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const skills = {
  ai_product: [
    "RAG",
    "Semantic search",
    "LLM evals",
    "Model-graded rubrics",
    "Prompt engineering",
    "Agentic workflows",
    "Tool calling",
    "Vector databases",
    "Voice AI",
  ],
  technical_tools: [
    "Python",
    "TypeScript",
    "Next.js",
    "React",
    "FastAPI",
    "OpenAI API",
    "Anthropic API",
    "xAI API",
    "Sarvam API",
    "ChromaDB",
    "Supabase",
    "MySQL",
  ],
  product_management: [
    "0 to 1",
    "Agile",
    "GTM planning",
    "Business case modelling",
  ],
  analytics_and_experimentation: [
    "A/B testing",
    "SQL",
    "Mixpanel",
    "Cohort analysis"
  ],
  research_and_design: ["User interviews", "Figma", "Wireframing"],
} as const;

const anchorSkills = new Set([
  "RAG",
  "LLM evals",
  "Python",
  "Anthropic API",
  "GTM planning",
  "A/B testing",
  "SQL",
  "User interviews",
]);

const categoryLabels = {
  ai_product: "AI",
  technical_tools: "Technical Tools",
  product_management: "Product",
  analytics_and_experimentation: "Analytics",
  research_and_design: "Design",
} as const;

type CategoryKey = keyof typeof skills;

const categoryChatPrompts: Record<CategoryKey, string> = {
  ai_product: "Tell me in detail about his AI skills",
  technical_tools: "Tell me in detail about the technical tools he knows",
  product_management: "Tell me in detail about his product management skills",
  analytics_and_experimentation:
    "Tell me in detail about his analytics and experimentation skills",
  research_and_design: "Tell me in detail about his research and design skills",
};

const categoryOrder = Object.keys(skills) as CategoryKey[];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

function SkillChip({ skill }: { skill: string }) {
  const isAnchor = anchorSkills.has(skill);

  return (
    <span
      className={`whitespace-nowrap leading-none ${
        isAnchor
          ? "text-base font-semibold tracking-[-0.2px] text-[#111111] md:text-lg"
          : "text-[13px] font-normal tracking-normal text-neutral-700 md:text-sm"
      }`}
    >
      {skill}
    </span>
  );
}

function SkillCategoryCard({
  category,
  index,
  hasEntered,
  prefersReducedMotion,
}: {
  category: CategoryKey;
  index: number;
  hasEntered: boolean;
  prefersReducedMotion: boolean;
}) {
  const labelId = `skill-map-${category}`;

  return (
    <motion.div
      role="group"
      aria-labelledby={labelId}
      custom={index}
      variants={cardVariants}
      initial={prefersReducedMotion ? "show" : "hidden"}
      animate={prefersReducedMotion || hasEntered ? "show" : "hidden"}
      className="rounded-xl bg-neutral-50 transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <Link
        href={`/chat?q=${encodeURIComponent(categoryChatPrompts[category])}`}
        className="block h-full rounded-xl p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7] md:p-6"
      >
        <h3
          id={labelId}
          className="mb-5 text-[11px] font-medium uppercase leading-none tracking-[1.5px] text-neutral-500"
        >
          {categoryLabels[category]}
        </h3>
        <div className="flex flex-wrap items-baseline gap-3">
          {skills[category].map((skill) => (
            <SkillChip key={skill} skill={skill} />
          ))}
        </div>
      </Link>
    </motion.div>
  );
}

export default function SkillMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-15% 0px", threshold: 0.15 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const isVisible = Boolean(prefersReducedMotion) || hasEntered;

  return (
    <section
      ref={sectionRef}
      aria-label="Skill Map"
      className="bg-white px-5 pt-16 text-[#111111] sm:px-6 md:pt-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-[640px] px-1 md:px-0">
          <h2 className="text-[32px] font-medium leading-tight tracking-normal text-[#111111] md:text-[40px]">
            Skill Map
          </h2>
        </div>

        <div className="mx-auto mt-8 w-full max-w-[1040px] md:mt-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] md:gap-5">
            {categoryOrder.slice(0, 2).map((category, index) => (
              <SkillCategoryCard
                key={category}
                category={category}
                index={index}
                hasEntered={isVisible}
                prefersReducedMotion={Boolean(prefersReducedMotion)}
              />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 md:grid-cols-[minmax(0,30fr)_minmax(0,38fr)_minmax(0,32fr)] md:gap-5">
            {categoryOrder.slice(2).map((category, index) => (
              <SkillCategoryCard
                key={category}
                category={category}
                index={index + 2}
                hasEntered={isVisible}
                prefersReducedMotion={Boolean(prefersReducedMotion)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
