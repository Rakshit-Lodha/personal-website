"use client";

import { motion, type Variants } from "framer-motion";

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

const failures = [
  {
    meta: "INDMoney · 2020–2022 · Goals Feature",
    context:
      "The Goals feature was meant to help users set and track financial goals — a core retention driver for the planning module. It didn't get PMF. Monthly retention was low and users weren't coming back.",
    whatWentWrong: [
      "Unclear target market — were we building for advisors or end customers?",
      "No single north star — acquisition, retention, and monetisation were all chased simultaneously",
      "Bet on algorithm complexity over product simplicity",
      "Didn't instrument or review data regularly — flew blind on what was actually happening",
      "Constant friction with business stakeholders — limited cross-functional buy-in",
      "Shipped features without defining what success looked like first",
      "Started with the algorithm and worked backwards to customer experience, not the other way around",
      "Didn't use the right channels at the right time to drive adoption",
    ],
  },
];

export default function Failures() {
  return (
    <section
      id="failures"
      className="bg-[#faf8f4] px-5 pb-16 pt-16 text-[#111111] sm:px-6 md:pt-24 lg:px-8 lg:pb-24"
    >
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
              What I Got Wrong
            </h2>
            <p className="mt-4 text-[15px] leading-[1.65] text-neutral-500 md:text-base">
              Not everything I shipped worked. These are the ones that didn&apos;t, and what they taught me.
            </p>
          </motion.div>
        </div>

        <div className="mx-auto mt-16 max-w-[640px] space-y-16 px-1 md:mt-24 md:space-y-24 md:px-0">
          {failures.map((failure) => (
            <motion.article key={failure.meta} variants={fadeUp}>
              <p className="text-[13px] leading-none text-neutral-500">
                {failure.meta}
              </p>

              <p className="mt-4 text-[17px] leading-[1.65] text-[#111111] md:text-lg">
                {failure.context}
              </p>

              <p className="mt-8 text-[12px] font-medium uppercase tracking-widest text-neutral-400">
                What went wrong
              </p>

              <ul className="mt-3 space-y-2.5 border-l border-neutral-200">
                {failure.whatWentWrong.map((item) => (
                  <li
                    key={item}
                    className="pl-4 text-[15px] font-normal leading-6 text-neutral-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
