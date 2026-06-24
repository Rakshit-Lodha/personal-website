"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LottieRefCurrentProps } from "lottie-react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const REST_MS = 2800;

export default function Footer() {
  const [animationData, setAnimationData] = useState<unknown>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    fetch("/landing/jump.json")
      .then((r) => r.json())
      .then(setAnimationData)
      .catch(() => setAnimationData(null));
  }, []);

  const handleComplete = () => {
    setTimeout(() => {
      lottieRef.current?.goToAndPlay(0, true);
    }, REST_MS);
  };

  return (
    <footer
      id="footer-cta"
      className="flex flex-col items-center bg-[#161616]"
      style={{ padding: "clamp(56px,6vw,104px) clamp(16px,4.6vw,80px) 0" }}
    >
      <p
        className="font-display text-center text-[#496dff]"
        style={{
          fontSize: "clamp(36px,8.2vw,142px)",
          lineHeight: 1.08,
          opacity: 0.75,
        }}
      >
        The conversation doesn&apos;t
        <br />
        have to end here.
      </p>

      <div
        className="mx-auto flex items-center justify-center"
        style={{
          width: "clamp(200px,20vw,360px)",
          height: "clamp(200px,20vw,360px)",
          margin: "clamp(8px,1.5vw,24px) auto",
          overflow: "visible",
        }}
      >
        {animationData ? (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            autoplay
            onComplete={handleComplete}
            style={{ width: "100%", height: "100%" }}
          />
        ) : null}
      </div>

      <div
        className="mx-auto flex flex-col"
        style={{
          gap: "clamp(14px,1.39vw,24px)",
          width: "clamp(260px,34vw,588px)",
          margin: "clamp(16px,2vw,32px) auto clamp(40px,5vw,80px)",
        }}
      >
        <Link
          href="/chat"
          className="font-figtree flex items-center justify-center bg-[#456aff] text-white no-underline transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{
            borderRadius: "clamp(12px,1.11vw,19px)",
            padding: "clamp(16px,1.33vw,23px) clamp(32px,3.7vw,64px)",
            height: "clamp(52px,5.1vw,88px)",
            gap: "clamp(8px,0.93vw,16px)",
            fontSize: "clamp(14px,1.62vw,28px)",
            fontWeight: 500,
          }}
        >
          <span>Chat with my AI</span>
          <span style={{ fontSize: "1.1em" }}>✦</span>
        </Link>
        <a
          href="mailto:rlodha1@gmail.com"
          className="font-figtree flex items-center justify-center bg-transparent text-[#456aff] no-underline transition-all hover:bg-[rgba(69,106,255,.1)] hover:-translate-y-0.5"
          style={{
            border: "2px solid #456aff",
            borderRadius: "clamp(12px,1.11vw,19px)",
            padding: "clamp(16px,1.33vw,23px) clamp(32px,3.82vw,66px)",
            height: "clamp(52px,5.1vw,88px)",
            fontSize: "clamp(14px,1.62vw,28px)",
            fontWeight: 500,
          }}
        >
          Drop Me a Mail
        </a>
      </div>

      <div
        className="flex w-full items-center justify-between"
        style={{
          borderTop: "1.5px solid rgba(255,255,255,0.18)",
          padding: "clamp(20px,2.3vw,32px) 0",
        }}
      >
        <span
          className="font-figtree uppercase text-white/80"
          style={{
            fontSize: "clamp(10px,0.82vw,14px)",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          © 2025 Rakshit Lodha. All rights reserved.
        </span>
        <div className="flex items-center" style={{ gap: "clamp(8px,0.7vw,12px)" }}>
          <SocialBtn href="https://www.youtube.com/" label="YouTube">
            <svg viewBox="0 0 25 18" fill="none" style={{ width: "clamp(14px,1.16vw,20px)", height: "auto" }}>
              <path d="M24.3 2.8C24 1.6 23.1.7 21.9.4 20 0 12.5 0 12.5 0S5 0 3.1.4C1.9.7 1 1.6.7 2.8 .3 4.7.3 9 .3 9s0 4.3.4 6.2c.3 1.2 1.2 2.1 2.4 2.4C5 18 12.5 18 12.5 18s7.5 0 9.4-.4c1.2-.3 2.1-1.2 2.4-2.4.4-1.9.4-6.2.4-6.2s0-4.3-.4-6.2zM10 12.9V5.1l6.3 3.9-6.3 3.9z" fill="white" />
            </svg>
          </SocialBtn>
          <SocialBtn href="https://x.com/rakshitlodha" label="X">
            <svg viewBox="0 0 20 17" fill="none" style={{ width: "clamp(14px,1.16vw,20px)", height: "auto" }}>
              <path d="M17.9 0h3.5L13.9 7.2 22.8 17H16l-5.4-7-6.2 7H1l7.9-9-8.5-8h7l4.9 6.5L17.9 0z" fill="white" />
            </svg>
          </SocialBtn>
          <SocialBtn
            href="https://www.linkedin.com/in/rakshit-lodha-360241187/"
            label="LinkedIn"
          >
            <svg viewBox="0 0 20 19" fill="none" style={{ width: "clamp(14px,1.16vw,20px)", height: "auto" }}>
              <path d="M4.5 6.3H.3V19H4.5V6.3zm-2.1-5.8C.9.5 0 1.4 0 2.5s.9 2 2.1 2c1.2 0 2.1-.9 2.1-2s-.9-2-2.1-2zM20 11.3c0-3.6-1.9-5.3-4.5-5.3-2 0-3 1.1-3.5 1.9V6.3H7.8V19H12v-7.1c0-1.9 1.1-3.2 2.8-3.2 1.6 0 2.2 1.2 2.2 3V19H20v-7.7z" fill="white" />
            </svg>
          </SocialBtn>
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex items-center justify-center bg-white/10 no-underline transition-colors hover:bg-white/20"
      style={{
        width: "clamp(32px,2.6vw,44px)",
        height: "clamp(32px,2.6vw,44px)",
        borderRadius: "6px",
      }}
    >
      {children}
    </a>
  );
}
