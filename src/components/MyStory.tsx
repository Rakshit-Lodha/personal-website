"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

type Chapter = {
  id: string;
  company: string;
  date: string;
  description: string;
  icon: string;
  achievements: string[];
  chatQuery: string;
};

const CHAPTERS: Chapter[] = [
  {
    id: "learnapp",
    company: "LearnApp - Core Team Member",
    date: "2018–2020",
    icon: "/landing/learnapp.png",
    description:
      "I joined LearnApp as a college student because I believed that financial education was broken in India and the only way to bring change in financial habits was through education.",
    achievements: [
      "Designed library of investing and finance courses",
      "50% course completion rate (category average: ~10%)",
      "₹1.2Cr ARR",
    ],
    chatQuery: "Tell me about Rakshit's work on the LearnApp course library",
  },
  {
    id: "ind-money",
    company: "IND MONEY - ASSOCIATE PRODUCT MANAGER",
    date: "2020–2022",
    icon: "/landing/ind-money-v2.png",
    description:
      "Joined INDMoney because I realised that while financial education was important, it only changes what people know. But the real leverage in personal finance is at the moment of decision when you're buying a product, not before it.",
    achievements: [
      "Built financial planning module with recommendation algorithms — 4–5 hours to 15 minutes per plan",
      "Enabled 20,000+ advisory plans",
      "Built personalized insurance recommendation engine aligned to user goals — ₹1.5Cr ARR in year one",
    ],
    chatQuery: "Tell me about the financial planning module at INDMoney",
  },
  {
    id: "et-money",
    company: "ET Money - Product Manager",
    date: "2022–Present",
    icon: "/landing/et-money-v2.png",
    description:
      "Four years at ET Money taught me one thing about AI products: the model is interchangeable, the eval is the product. The rubric is where the judgment lives. It's also where I now spend most of my time.",
    achievements: [
      "Built AI support automation — 19K to 9K monthly tickets, a 55% reduction, and 30% CSAT improvement",
      "Built 0-to-1 offline distribution business — 12% of SIP book, 10% of gross sales within 4 months",
      "Built Loan Against Mutual Funds from zero — ₹100Cr disbursals in 7 months",
      "Led ET Money Earn from 0 to ₹300Cr AUM",
      "Built execution-only Mutual Fund Platform — projected ₹10Cr annual revenue",
    ],
    chatQuery: "Tell me about the support bot eval pipeline at ET Money",
  },
];

export default function MyStory() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const timeline = timelineRef.current;
    const fill = fillRef.current;
    if (!timeline || !fill) return;

    let rafId = 0;
    let pending = false;

    const apply = () => {
      pending = false;
      const tRect = timeline.getBoundingClientRect();
      const vMid = window.innerHeight * 0.5;
      const pct = (vMid - tRect.top) / tRect.height;
      fill.style.height =
        Math.max(0, Math.min(pct, 1)) * timeline.offsetHeight + "px";

      for (let i = 0; i < itemRefs.current.length; i++) {
        const item = itemRefs.current[i];
        const dot = dotRefs.current[i];
        if (!item || !dot) continue;
        const dTop = dot.getBoundingClientRect().top;
        item.classList.remove("tl-active", "tl-completed");
        if (dTop < vMid - 120) {
          item.classList.add("tl-completed");
        } else if (dTop <= vMid + 120) {
          item.classList.add("tl-active");
        }
      }
    };

    const schedule = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(apply);
    };

    apply();
    requestAnimationFrame(apply);
    const settleTimer = window.setTimeout(apply, 120);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", apply);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", apply);
      window.clearTimeout(settleTimer);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      id="my-story"
      className="bg-[#F3F7F8]"
      style={{
        padding:
          "clamp(48px,5.5vw,96px) clamp(16px,5.3vw,92px) clamp(64px,9.3vw,161px)",
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: "clamp(10px,1vw,18px)", marginBottom: "clamp(32px,5vw,87px)" }}
      >
        <span
          className="font-display whitespace-nowrap text-[#496dff]"
          style={{ fontSize: "clamp(32px,4.74vw,82px)", lineHeight: 1 }}
        >
          MY STORY
        </span>
        <Image
          src="/landing/suitcase.png"
          alt=""
          width={130}
          height={130}
          className="flex-shrink-0 object-contain"
          style={{ width: "clamp(52px,7.5vw,130px)", height: "clamp(52px,7.5vw,130px)" }}
        />
      </div>

      <div className="timeline relative" ref={timelineRef}>
        <div
          className="absolute top-0 bottom-0 rounded-[2px] bg-[#e0e4f5]"
          style={{ left: "10px", width: "2px", zIndex: 0 }}
        >
          <div
            ref={fillRef}
            className="tl-fill absolute top-0 left-0 w-full rounded-[2px] bg-[#496dff]"
            style={{ height: 0 }}
          />
        </div>

        <div
          className="flex flex-col"
          style={{ marginLeft: "40px", gap: "clamp(24px,5vw,88px)" }}
        >
          {CHAPTERS.map((ch, i) => (
            <div
              key={ch.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="tl-item relative"
            >
              <div
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className="tl-dot absolute flex items-center justify-center rounded-full border-2 bg-white"
                style={{
                  top: "clamp(12px,1.4vw,20px)",
                  left: "-40px",
                  width: "22px",
                  height: "22px",
                  zIndex: 3,
                }}
              >
                <span className="tl-dot-inner rounded-full" />
              </div>

              <div className="tl-card flex flex-col border border-[#dbdbdb]">
                <div
                  className="flex flex-col"
                  style={{
                    padding: "clamp(20px,1.85vw,32px) clamp(20px,1.85vw,32px) 0",
                    gap: "clamp(16px,1.62vw,32px)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex flex-1 min-w-0 items-center"
                      style={{ gap: "clamp(8px,.69vw,12px)" }}
                    >
                      <Image
                        src={ch.icon}
                        alt={ch.company}
                        width={42}
                        height={42}
                        className="flex-shrink-0 object-cover"
                        style={{
                          width: "clamp(24px,2.43vw,42px)",
                          height: "clamp(24px,2.43vw,42px)",
                          borderRadius: "clamp(4px,.46vw,8px)",
                        }}
                      />
                      <span
                        className="font-figtree text-[#222]"
                        style={{
                          fontSize: "clamp(13px,1.85vw,32px)",
                          lineHeight: 1.26,
                        }}
                      >
                        {ch.company}
                      </span>
                    </div>
                    <span
                      className="font-figtree font-semibold text-[#666] whitespace-nowrap flex-shrink-0"
                      style={{
                        fontSize: "clamp(11px,1.39vw,24px)",
                        letterSpacing: "2px",
                      }}
                    >
                      {ch.date}
                    </span>
                  </div>
                  <p
                    className="font-figtree text-[#666]"
                    style={{ fontSize: "clamp(12px,1.39vw,24px)", lineHeight: 1.32 }}
                  >
                    {ch.description}
                  </p>
                </div>

                <div
                  className="flex flex-col border-t border-[#dbdbdb] bg-white"
                  style={{
                    padding: "clamp(20px,1.85vw,32px)",
                    gap: "clamp(20px,1.62vw,28px)",
                    marginTop: "clamp(20px,1.85vw,32px)",
                  }}
                >
                  <div className="flex flex-col" style={{ gap: "clamp(14px,1.04vw,22px)" }}>
                    {ch.achievements.map((a, j) => (
                      <div
                        key={j}
                        className="flex items-start"
                        style={{ gap: "clamp(6px,.52vw,9px)" }}
                      >
                        <Image
                          src="/landing/bullet-check.svg"
                          alt=""
                          width={28}
                          height={28}
                          className="flex-shrink-0"
                          style={{
                            width: "clamp(14px,1.62vw,28px)",
                            height: "clamp(14px,1.62vw,28px)",
                            marginTop: "1px",
                          }}
                        />
                        <span
                          className="font-figtree text-[#404040]"
                          style={{
                            fontSize: "clamp(11px,1.16vw,20px)",
                            lineHeight: 1.3,
                          }}
                        >
                          {a}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/chat?q=${encodeURIComponent(ch.chatQuery)}`}
                    className="font-figtree inline-flex items-center self-start justify-center border border-[#496dff] text-[#496dff] no-underline transition-all hover:bg-[rgba(73,109,255,.06)] hover:-translate-y-0.5 whitespace-nowrap"
                    style={{
                      gap: "clamp(5px,.58vw,10px)",
                      borderRadius: "clamp(5px,.52vw,9px)",
                      padding: "clamp(7px,.81vw,14px) clamp(12px,1.74vw,30px)",
                      fontSize: "clamp(10px,.93vw,16px)",
                      fontWeight: 500,
                    }}
                  >
                    Know More
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
