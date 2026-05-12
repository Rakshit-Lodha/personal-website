"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

export type Chapter = {
  meta: string;
  lesson: string;
  shipped: string[];
  agentLinkLabel: string;
  agentLinkQuery: string;
};

const chapters = [
  {
    meta: "LearnApp · 2018–2020 · Core Team Member",
    lesson:
      "I joined LearnApp because as a college student I believed that financial education was broken in India and I believed that the only way to bring change in financial habits was through education.",
    shipped: [
      "Designed library of investing and finance courses",
      "50% course completion rate (category average: ~10%)",
      "₹1.2Cr ARR",
    ],
    agentLinkLabel: "Ask my agent about the LearnApp's course's module →",
    agentLinkQuery:
      "Tell+me+about+Rakshit%27s+work+on+the+LearnApp+course+library",
  },
  {
    meta: "INDMoney · 2020–2022 · Associate Product Manager",
    lesson:
      "Joined INDMoney because I realised that while financial education was important, it only changes what people know. But the real leverage in personal finance is at the moment of decision when you're buying a product, not before it.",
    shipped: [
      "Built financial planning module with recommendation algorithms — 4–5 hours to 15 minutes per plan",
      "Enabled 20,000+ advisory plans",
      "Built personalized insurance recommendation engine aligned to user goals — ₹1.5Cr ARR in year one",
    ],
    agentLinkLabel: "Ask my agent about the financial planning module at INDMoney →",
    agentLinkQuery: "Tell+me+about+the+financial+planning+module+at+INDMoney",
  },
  {
    meta: "ET Money · 2022–Present · Product Manager",
    lesson:
      "Four years at ET Money taught me one thing about AI products: the model is interchangeable, the eval is the product. The rubric is where the judgment lives. It's also where I now spend most of my time.",
    shipped: [
      "Built AI support automation — 17K to 7K monthly tickets via intent classification, 100+ resolution workflows, and a four-dimension eval pipeline (empathy, accuracy, policy, regression)",
      "Built 0-to-1 offline distribution business for relationship managers — 12% of SIP book, 10% of gross sales within 4 months",
      "Built Loan Against Mutual Funds from zero — ₹100Cr disbursals in 7 months",
      "Led ET Money Earn from 0 to ₹300Cr AUM",
      "Built execution-only Mutual Fund Platform — projected ₹10Cr annual revenue",
    ],
    agentLinkLabel:
      "Ask my agent about the support agent eval pipeline at ET Money →",
    agentLinkQuery:
      "Tell+me+about+the+support+bot+eval+pipeline+at+ET+Money",
  },
] satisfies Chapter[];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function ChapterStack({ chapters }: { chapters: Chapter[] }) {
  return (
    <div className="mx-auto mt-16 max-w-[640px] space-y-16 px-1 md:mt-24 md:space-y-24 md:px-0">
      {chapters.map((chapter) => (
        <motion.article key={chapter.meta} variants={fadeUp}>
          <p className="text-[13px] leading-none text-neutral-500">
            {chapter.meta}
          </p>

          <p className="mt-4 text-[17px] leading-[1.65] text-[#111111] md:text-lg">
            {chapter.lesson}
          </p>

          <ul className="mt-8 space-y-2.5 border-l border-neutral-200">
            {chapter.shipped.map((item) => (
              <li
                key={item}
                className="pl-4 text-[15px] font-normal leading-6 text-neutral-700"
              >
                {item}
              </li>
            ))}
          </ul>

          <Link
            href={`/chat?q=${chapter.agentLinkQuery}`}
            className="mt-8 inline-block text-sm font-medium text-[#2563eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563eb]"
          >
            {chapter.agentLinkLabel}
          </Link>
        </motion.article>
      ))}
    </div>
  );
}

export default function MyStory() {
  return (
    <section id="story" className="bg-[#faf8f4] px-5 pb-16 pt-16 text-[#111111] sm:px-6 md:pt-24 lg:px-8 lg:pb-24">
      <motion.div
        className="mx-auto max-w-7xl"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={containerVariants}
      >
        <div className="mx-auto max-w-[640px] px-1 md:px-0">
          <motion.div variants={fadeUp}>
            <h2 className="text-[32px] font-medium leading-tight tracking-normal text-[#111111] md:text-[40px]">
              My Story
            </h2>
          </motion.div>
        </div>

        <ChapterStack chapters={chapters} />
      </motion.div>
    </section>
  );
}
