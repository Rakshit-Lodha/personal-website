"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";

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
    "Intent classification",
    "Recommendation systems",
  ],
  product_management: [
    "0-to-1 product building",
    "PRDs",
    "GTM planning",
    "Business case modeling",
  ],
  research_and_design: ["User interviews", "Figma", "Wireframing"],
  analytics_and_experimentation: [
    "A/B testing",
    "SQL",
    "Mixpanel",
    "Cohort analysis",
    "Event instrumentation",
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
} as const;

const anchorSkills = new Set([
  "RAG",
  "LLM evals",
  "0-to-1 product building",
  "User interviews",
  "A/B testing",
  "SQL",
  "Python",
  "Anthropic API",
]);

const categoryLabels = {
  ai_product: "AI Product",
  product_management: "Product Management",
  research_and_design: "Research & Design",
  analytics_and_experimentation: "Analytics & Experimentation",
  technical_tools: "Technical Tools",
} as const;

type CategoryKey = keyof typeof skills;

type Zone = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type SkillNode = {
  category: CategoryKey;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  isAnchor: boolean;
};

const zonesDesktop: Record<CategoryKey, Zone> = {
  ai_product: { x: 40, y: 60, w: 460, h: 320 },
  technical_tools: { x: 540, y: 60, w: 460, h: 360 },
  product_management: { x: 40, y: 400, w: 280, h: 220 },
  analytics_and_experimentation: { x: 340, y: 440, w: 320, h: 220 },
  research_and_design: { x: 680, y: 440, w: 320, h: 220 },
};

const desktopOrder: CategoryKey[] = [
  "ai_product",
  "technical_tools",
  "product_management",
  "analytics_and_experimentation",
  "research_and_design",
];

const mobileOrder: CategoryKey[] = [
  "ai_product",
  "technical_tools",
  "analytics_and_experimentation",
  "product_management",
  "research_and_design",
];

const mobileZoneHeights: Record<CategoryKey, number> = {
  ai_product: 292,
  technical_tools: 320,
  analytics_and_experimentation: 190,
  product_management: 168,
  research_and_design: 136,
};

const zoneGap = 24;
const labelTopSpace = 48;
const zonePadding = 16;
const minGap = 12;
const desktopCanvas = { width: 1040, height: 680 };

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function isElement<T extends Element>(node: T | null): node is T {
  return Boolean(node);
}

function estimateLabelSize(label: string, isAnchor: boolean, isMobile: boolean) {
  const fontSize = isAnchor ? (isMobile ? 16 : 18) : isMobile ? 12 : 13;
  const width = Math.ceil(label.length * fontSize * (isAnchor ? 0.58 : 0.54));

  return {
    width: Math.max(width, isAnchor ? 34 : 28),
    height: isAnchor ? (isMobile ? 20 : 22) : isMobile ? 15 : 16,
  };
}

function hasSpacingConflict(
  candidate: Pick<SkillNode, "left" | "top" | "width" | "height">,
  placed: SkillNode[],
) {
  const candidateRect = {
    left: candidate.left - minGap,
    right: candidate.left + candidate.width + minGap,
    top: candidate.top - minGap,
    bottom: candidate.top + candidate.height + minGap,
  };

  return placed.some((node) => {
    const nodeRect = {
      left: node.left,
      right: node.left + node.width,
      top: node.top,
      bottom: node.top + node.height,
    };

    return !(
      candidateRect.right < nodeRect.left ||
      candidateRect.left > nodeRect.right ||
      candidateRect.bottom < nodeRect.top ||
      candidateRect.top > nodeRect.bottom
    );
  });
}

function createMobileZones(canvasWidth: number) {
  let y = 0;

  return mobileOrder.reduce(
    (zones, category) => {
      zones[category] = {
        x: 0,
        y,
        w: canvasWidth,
        h: mobileZoneHeights[category],
      };
      y += mobileZoneHeights[category] + zoneGap;
      return zones;
    },
    {} as Record<CategoryKey, Zone>,
  );
}

function getCanvasHeight(isMobile: boolean) {
  if (!isMobile) return desktopCanvas.height;

  return (
    mobileOrder.reduce((height, category) => height + mobileZoneHeights[category], 0) +
    zoneGap * (mobileOrder.length - 1)
  );
}

function clampWithinZone(value: number, min: number, max: number) {
  return utils.clamp(value, min, Math.max(min, max));
}

function createGridSlots(inner: Zone, count: number, random: () => number) {
  const rows = Math.max(3, Math.ceil((count + 3) / 3));
  const slots: { x: number; y: number; distance: number }[] = [];
  const centerX = inner.x + inner.w / 2;
  const centerY = inner.y + inner.h / 2;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const x = inner.x + (inner.w * (col + 0.5)) / 3 + (random() * 16 - 8);
      const y = inner.y + (inner.h * (row + 0.5)) / rows + (random() * 12 - 6);
      const distance = Math.hypot(x - centerX, y - centerY);
      slots.push({ x, y, distance });
    }
  }

  return slots.sort((a, b) => a.distance - b.distance);
}

function packCategorySkills(
  category: CategoryKey,
  zone: Zone,
  isMobile: boolean,
  random: () => number,
) {
  const inner: Zone = {
    x: zone.x + zonePadding,
    y: zone.y + labelTopSpace,
    w: zone.w - zonePadding * 2,
    h: zone.h - labelTopSpace - zonePadding,
  };
  const categorySkills = [...skills[category]];
  const anchors = categorySkills.filter((skill) => anchorSkills.has(skill));
  const nonAnchors = categorySkills.filter((skill) => !anchorSkills.has(skill));
  const placed: SkillNode[] = [];

  anchors.forEach((label, index) => {
    const size = estimateLabelSize(label, true, isMobile);
    const offset =
      anchors.length === 2 ? (index === 0 ? -inner.w * 0.13 : inner.w * 0.13) : 0;
    const centerX = inner.x + inner.w / 2 + offset;
    const centerY = inner.y + inner.h / 2;
    const left = clampWithinZone(centerX - size.width / 2, inner.x, zone.x + zone.w - zonePadding - size.width);
    const top = clampWithinZone(centerY - size.height / 2, inner.y, zone.y + zone.h - zonePadding - size.height);

    placed.push({
      category,
      label,
      left,
      top,
      width: size.width,
      height: size.height,
      centerX: left + size.width / 2,
      centerY: top + size.height / 2,
      isAnchor: true,
    });
  });

  const slots = createGridSlots(inner, nonAnchors.length, random);

  nonAnchors.forEach((label, index) => {
    const size = estimateLabelSize(label, false, isMobile);
    const candidates = [...slots.slice(index), ...slots.slice(0, index)];
    let chosen = candidates.find((slot) => {
      const left = clampWithinZone(
        slot.x - size.width / 2,
        inner.x,
        zone.x + zone.w - zonePadding - size.width,
      );
      const top = clampWithinZone(
        slot.y - size.height / 2,
        inner.y,
        zone.y + zone.h - zonePadding - size.height,
      );

      return !hasSpacingConflict({ left, top, ...size }, placed);
    });

    chosen ??= candidates.find((slot) => {
      const left = clampWithinZone(
        slot.x - size.width / 2,
        inner.x,
        zone.x + zone.w - zonePadding - size.width,
      );
      const top = clampWithinZone(
        slot.y - size.height / 2,
        inner.y,
        zone.y + zone.h - zonePadding - size.height,
      );

      return !hasSpacingConflict({ left, top, width: size.width, height: size.height * 0.7 }, placed);
    });

    const fallback = candidates[index % candidates.length] ?? {
      x: inner.x + inner.w / 2,
      y: inner.y + inner.h / 2,
    };
    const slot = chosen ?? fallback;
    const left = clampWithinZone(
      slot.x - size.width / 2,
      inner.x,
      zone.x + zone.w - zonePadding - size.width,
    );
    const top = clampWithinZone(
      slot.y - size.height / 2,
      inner.y,
      zone.y + zone.h - zonePadding - size.height,
    );

    placed.push({
      category,
      label,
      left,
      top,
      width: size.width,
      height: size.height,
      centerX: left + size.width / 2,
      centerY: top + size.height / 2,
      isAnchor: false,
    });
  });

  return placed;
}

function computeLayout(canvasWidth: number, isMobile: boolean) {
  const zones = isMobile ? createMobileZones(canvasWidth) : zonesDesktop;
  const random = mulberry32(42);
  const order = isMobile ? mobileOrder : desktopOrder;

  return {
    zones,
    nodes: order.flatMap((category) =>
      packCategorySkills(category, zones[category], isMobile, random),
    ),
    height: getCanvasHeight(isMobile),
  };
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

export default function SkillMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const skillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const anchorRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hasAnimatedRef = useRef(false);
  const lastMoveRef = useRef(0);
  const breathingRef = useRef<ReturnType<typeof animate> | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [viewport, setViewport] = useState({ width: desktopCanvas.width, isMobile: false });

  const layout = useMemo(
    () => computeLayout(viewport.isMobile ? viewport.width : desktopCanvas.width, viewport.isMobile),
    [viewport],
  );
  const order = viewport.isMobile ? mobileOrder : desktopOrder;

  useEffect(() => {
    const updateViewport = () => {
      const isMobile = window.innerWidth < 768;
      setViewport({
        width: isMobile ? Math.max(280, window.innerWidth - 24) : desktopCanvas.width,
        isMobile,
      });
    };
    let resizeTimer: number | undefined;
    const debouncedUpdate = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(updateViewport, 200);
    };

    updateViewport();
    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedUpdate);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const labels = labelRefs.current.filter(isElement);
    const skillElements = skillRefs.current.filter(isElement);
    const anchors = anchorRefs.current.filter(isElement);

    breathingRef.current?.cancel();
    breathingRef.current = null;

    const startBreathing = () => {
      if (!anchors.length || prefersReducedMotion) return;
      console.log("SkillMap: breathing loop started");
      breathingRef.current = animate(anchors, {
        scale: [1, 1.02, 1],
        duration: 4000,
        delay: stagger(500),
        loop: true,
        ease: "inOutSine",
      });
    };

    if (prefersReducedMotion || hasAnimatedRef.current) {
      utils.set([...labels, ...skillElements], {
        opacity: 1,
        translateX: 0,
        translateY: 0,
      });
      utils.set(anchors, { scale: 1 });
      if (!prefersReducedMotion) startBreathing();
      return;
    }

    utils.set([...labels, ...skillElements], {
      opacity: 0,
      translateX: 0,
      translateY: 8,
    });
    utils.set(labels, { translateY: -4 });
    utils.set(anchors, { scale: 0.92 });

    const startEntrance = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;
      console.log("SkillMap: entrance animation started");

      const timeline = createTimeline();
      timeline
        .add(labels, {
          opacity: [0, 1],
          translateY: [-4, 0],
          delay: stagger(100),
          duration: 500,
          ease: "outQuad",
        })
        .add(
          skillElements,
          {
            opacity: [0, 1],
            translateY: [8, 0],
            delay: stagger(30, { from: "center" }),
            duration: 700,
            ease: "outCubic",
          },
          300,
        )
        .add(
          anchors,
          {
            scale: [0.92, 1],
            delay: stagger(30, { from: "center" }),
            duration: 700,
            ease: "outCubic",
          },
          300,
        )
        .then(startBreathing);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startEntrance();
      },
      { rootMargin: "-15% 0px", threshold: 0.15 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [layout, prefersReducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewport.isMobile || prefersReducedMotion) return;

    const handleMouseMove = (event: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveRef.current < 16) return;
      lastMoveRef.current = now;

      const rect = canvas.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;

      layout.nodes.forEach((node, index) => {
        const element = skillRefs.current[index];
        if (!element) return;

        const distance = Math.hypot(node.centerX - cursorX, node.centerY - cursorY);
        if (distance > 120) {
          animate(element, {
            translateX: 0,
            translateY: 0,
            duration: 400,
            ease: "outQuad",
          });
          return;
        }

        const shift = 8 * (1 - distance / 120);
        const safeDistance = distance || 1;
        const translateX = ((node.centerX - cursorX) / safeDistance) * shift;
        const translateY = ((node.centerY - cursorY) / safeDistance) * shift;

        animate(element, {
          translateX,
          translateY,
          duration: 400,
          ease: "outQuad",
        });
      });
    };

    const handleMouseLeave = () => {
      animate(skillRefs.current.filter(isElement), {
        translateX: 0,
        translateY: 0,
        duration: 600,
        ease: "outQuad",
      });
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [layout, prefersReducedMotion, viewport.isMobile]);

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

        <div className="mx-auto mt-8 w-[calc(100vw-24px)] max-w-[1040px] md:mt-12">
          <div
            ref={canvasRef}
            className="relative select-none"
            style={{
              width: viewport.isMobile ? viewport.width : desktopCanvas.width,
              maxWidth: "100%",
              height: layout.height,
            }}
          >
            {order.map((category, index) => {
              const zone = layout.zones[category];

              return (
                <div
                  key={category}
                  data-zone={category}
                  className="absolute"
                  style={{
                    left: zone.x,
                    top: zone.y,
                    width: zone.w,
                    height: zone.h,
                  }}
                >
                  <span
                    ref={(element) => {
                      labelRefs.current[index] = element;
                    }}
                    className="absolute left-4 top-4 text-[11px] font-medium uppercase leading-none tracking-[1.5px] text-neutral-400"
                  >
                    {categoryLabels[category]}
                  </span>
                </div>
              );
            })}

            {layout.nodes.map((node, index) => (
              <span
                key={`${node.category}-${node.label}`}
                ref={(element) => {
                  skillRefs.current[index] = element;
                }}
                data-skill={node.label}
                data-category={node.category}
                data-anchor={node.isAnchor}
                className="absolute whitespace-nowrap leading-none"
                style={{
                  left: node.left,
                  top: node.top,
                }}
              >
                <span
                  ref={(element) => {
                    anchorRefs.current[index] = node.isAnchor ? element : null;
                  }}
                  className={`inline-block [transform-origin:center] ${
                    node.isAnchor
                      ? "text-base font-semibold tracking-[-0.2px] text-[#111111] md:text-lg"
                      : "text-xs font-normal text-neutral-700 md:text-[13px]"
                  }`}
                >
                  {node.label}
                </span>
              </span>
            ))}
          </div>
        </div>

        <ul className="sr-only">
          {order.map((category) => (
            <li key={category}>
              {categoryLabels[category]}
              <ul>
                {skills[category].map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
