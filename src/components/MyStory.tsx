"use client";

import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

const storyChapters = [
  {
    company: "LearnApp",
    years: "2018–2020",
    role: "Core Team Member",
    chapterLabel: "Chapter 1 · LearnApp",
    title: "Learnt to build from scratch",
    storyPoints: [
      "Joined LearnApp (Now Zero1 by Zerodha) in 2018 as employee #7.",
      "Worked across ops, content, product and design.",
      "Built investing and personal finance learning experiences.",
      "Figured out that real financial impact can only be built by building financial products not education",
    ],
    achievements: [
      {
        title: "Employee #7",
        description: "One of the earliest members of the team",
      },
      {
        title: "Multi-functional builder",
        description: "Worked across ops, content, product and design",
      },
      {
        title: "Built learning experiences",
        description: "Created impactful learning products for thousands",
      },
    ],
  },
  {
    company: "INDMoney",
    years: "2020–2022",
    role: "Associate Product Manager",
    chapterLabel: "Chapter 2 · INDMoney",
    title: "Learnt data driven decisions",
    storyPoints: [
      "Built financial planning journeys for users and advisors.",
      "Helped reduce plan creation time from 4–5 hours to 15 minutes.",
      "Worked on personalized insurance recommendation systems.",
      "Learned how to turn complex financial decisions into simple user flows.",
    ],
    achievements: [
      {
        title: "20,000+ advisory plans",
        description: "Enabled planning journeys for users and advisors",
      },
      {
        title: "4–5 hours to 15 minutes",
        description: "Reduced time needed to create each plan",
      },
      {
        title: "₹1.5Cr ARR",
        description: "Generated from insurance recommendations",
      },
    ],
  },
  {
    company: "ET Money",
    years: "2022–Present",
    role: "Product Manager",
    chapterLabel: "Chapter 3 · ET Money",
    title: "Where I scaled AI + fintech products",
    storyPoints: [
      "Built AI-powered support automation for user queries.",
      "Reduced monthly support tickets from 17K to 7K.",
      "Built and scaled Loan Against Mutual Funds to ₹100Cr disbursals in 7 months.",
      "Worked across wealth, lending, advisory and AI product systems.",
    ],
    achievements: [
      {
        title: "17K → 7K tickets",
        description: "Reduced support ticket volume by 58%",
      },
      {
        title: "₹100Cr disbursals",
        description: "Scaled Loan Against Mutual Funds in 7 months",
      },
      {
        title: "₹300Cr AUM",
        description: "Enabled ET Money Earn growth",
      },
    ],
  },
] as const;

type ChapterIndex = 0 | 1 | 2;

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

export default function MyStory() {
  const [activeIndex, setActiveIndex] = useState<ChapterIndex>(0);
  const activeChapter = storyChapters[activeIndex];

  const handleSelectorKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowLeft") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + storyChapters.length) % storyChapters.length;
    setActiveIndex(nextIndex as ChapterIndex);
  };

  return (
    <section id="story" className="bg-[#faf8f4] px-5 py-16 text-[#111111] sm:px-6 lg:px-8 lg:py-24">
      <motion.div
        className="mx-auto max-w-7xl"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={containerVariants}
      >
        <div>
          <motion.div variants={fadeUp}>
            <h2 className="text-5xl font-bold tracking-normal text-[#070707] sm:text-6xl lg:text-7xl">
              My Story
            </h2>
            <div className="mt-6 h-1 w-20 rounded-full bg-[#2563eb]" />
            <p className="mt-6 max-w-lg text-base leading-7 text-[#6f6b66] sm:text-lg">
              A journey through the roles, experiments and products that shaped me.
            </p>
          </motion.div>

          <div
            className="mt-9"
            role="tablist"
            aria-label="Select story chapter"
          >
            <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
              {storyChapters.map((chapter, index) => {
                const isActive = activeIndex === index;

                return (
                  <button
                    key={chapter.company}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveIndex(index as ChapterIndex)}
                    onKeyDown={(event) => handleSelectorKeyDown(event, index)}
                    className={[
                      "group relative flex min-w-[220px] snap-start items-center gap-4 rounded-[22px] border bg-white p-4 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563eb] md:min-w-0 md:p-6",
                      isActive
                        ? "border-[#2563eb] shadow-[0_18px_50px_rgba(37,99,235,0.14)]"
                        : "border-[#e7e2db] shadow-[0_10px_30px_rgba(17,17,17,0.04)] hover:-translate-y-0.5 hover:border-[#d7d0c7] hover:shadow-[0_16px_42px_rgba(17,17,17,0.07)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-base font-bold transition-all duration-300",
                        isActive
                          ? "border-[#2563eb] bg-[#2563eb] text-white shadow-[0_10px_24px_rgba(37,99,235,0.3)]"
                          : "border-[#e7e2db] bg-[#faf8f4] text-[#7d7770]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={[
                          "block text-[11px] font-bold uppercase tracking-normal",
                          isActive ? "text-[#2563eb]" : "text-[#8a8580]",
                        ].join(" ")}
                      >
                        {isActive ? "Current" : "Up Next"}
                      </span>
                      <span className="mt-1 block text-lg font-bold text-[#111111]">
                        {chapter.company}
                      </span>
                      <span className="mt-1 block text-sm text-[#7b7670]">
                        {chapter.years}
                      </span>
                    </span>

                    <ChevronRight
                      className={[
                        "h-5 w-5 shrink-0 transition-colors duration-300",
                        isActive ? "text-[#2563eb]" : "text-[#9d9790] group-hover:text-[#2563eb]",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-9 lg:mt-12">
          <motion.div
            className="overflow-hidden rounded-[28px] border border-[#e7e2db] bg-white p-5 shadow-[0_24px_80px_rgba(17,17,17,0.07)] sm:p-8 lg:p-11"
            variants={{
              hidden: { opacity: 0, scale: 0.97, y: 12 },
              show: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.5, ease: "easeOut" },
              },
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeChapter.company}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
                  <div>
                    <p className="text-sm font-bold text-[#2563eb] sm:text-base">
                      {activeChapter.chapterLabel}
                    </p>
                    <h3 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.08] tracking-normal text-[#070707] sm:text-5xl lg:text-6xl">
                      {activeChapter.title}
                    </h3>
                    <p className="mt-5 text-base text-[#6f6b66] sm:text-lg">
                      {activeChapter.years} <span className="mx-2 text-[#2563eb]">·</span>{" "}
                      {activeChapter.role}
                    </p>

                    <motion.ol
                      className="mt-8 space-y-0"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {activeChapter.storyPoints.map((point, index) => {
                        return (
                          <motion.li
                            key={point}
                            variants={fadeUp}
                            className="grid grid-cols-[42px_minmax(0,1fr)] items-start border-b border-dashed border-[#e3ddd4] py-4 last:border-b-0"
                          >
                            <span className="pt-2 text-base font-bold text-[#2563eb]">
                              {index + 1}.
                            </span>
                            <span className="pt-2 text-base leading-7 text-[#232323] sm:text-lg">
                              {point}
                            </span>
                          </motion.li>
                        );
                      })}
                    </motion.ol>
                  </div>
                </div>

                <div className="mt-8 lg:mt-10">
                  <h4 className="text-lg font-bold text-[#111111]">Top achievements</h4>
                  <motion.div
                    className="mt-5 grid gap-3 sm:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {activeChapter.achievements.map((achievement) => {
                      return (
                        <motion.div
                          key={achievement.title}
                          variants={fadeUp}
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="rounded-[20px] border border-[#e7e2db] bg-[#fffdfb] p-5 shadow-[0_10px_28px_rgba(17,17,17,0.04)] hover:shadow-[0_18px_42px_rgba(17,17,17,0.08)]"
                        >
                          <div>
                            <p className="font-bold leading-snug text-[#151515]">
                              {achievement.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#6f6b66]">
                              {achievement.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.a
            href="#projects"
            className="mx-auto mt-9 flex w-fit items-center gap-3 rounded-full px-4 py-2 text-base font-bold text-[#2563eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563eb]"
            variants={fadeUp}
            whileHover={{ y: -2 }}
          >
            <span>Continue the journey</span>
            <motion.span
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            >
              <ArrowRight className="h-6 w-6" />
            </motion.span>
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
