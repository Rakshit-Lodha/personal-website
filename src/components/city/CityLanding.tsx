"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import {
  AROUND_TOWN,
  COMPANY_PLACES,
  PLACES,
  PLACE_BY_ID,
  TOUR_STOPS,
  type Place,
} from "./atlas";
import PlacePanel from "./panel/PlacePanel";
import CityScene from "./CityScene";
import { useReducedMotion, useWebglSupport } from "./env";
import { useJJSession } from "@/components/jj/JJSessionProvider";
import { useCitySurface } from "./useCitySurface";
import "./city.css";

export default function CityLanding() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [dusk, setDusk] = useState(false);
  const [ready, setReady] = useState(false);
  const [touring, setTouring] = useState(false);
  const [litFloor, setLitFloor] = useState<string | null>(null);
  const tourIndex = useRef(0);
  const paused = useReducedMotion();
  const { open: openJJ } = useJJSession();
  const supported = useWebglSupport();

  // Guided tour: walk the districts one at a time.
  useEffect(() => {
    if (!touring) return;
    const step = () => {
      setSelected(TOUR_STOPS[tourIndex.current % TOUR_STOPS.length]);
      tourIndex.current += 1;
    };
    step();
    const id = window.setInterval(step, 5200);
    return () => window.clearInterval(id);
  }, [touring]);

  const pick = useCallback((id: string) => {
    setTouring(false);
    setLitFloor(null);
    setSelected((cur) => (cur === id ? null : id));
  }, []);

  const clearSelection = useCallback(() => {
    setTouring(false);
    setLitFloor(null);
    setSelected(null);
  }, []);

  const pickFloor = useCallback((placeId: string, floorId: string) => {
    setTouring(false);
    setSelected(placeId);
    setLitFloor((cur) => (cur === floorId ? null : floorId));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setLitFloor(null);
        setTouring(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  // JJ drives the same city through the shared SiteCommand vocabulary.
  const citySurface = useMemo(
    () => ({
      focusPlace: (placeId: string) => {
        setTouring(false);
        setLitFloor(null);
        setSelected(placeId);
      },
      resetView: () => {
        setTouring(false);
        setLitFloor(null);
        setSelected(null);
      },
      highlightFloor: (_companyId: string, outcomeId: string) => setLitFloor(outcomeId),
    }),
    []
  );
  useCitySurface(citySurface);

  const active = selected ? PLACE_BY_ID[selected] : null;

  if (supported === false) return <CityFallback />;

  return (
    <div className="city-shell" data-dusk={dusk ? "true" : "false"}>
      {supported && (
        <Canvas
          shadows
          orthographic
          dpr={[1, 1.75]}
          camera={{ position: [26, 21, 26], zoom: 11, near: -200, far: 400 }}
          gl={{ antialias: true }}
          onCreated={() => setReady(true)}
          style={{
            opacity: ready ? 1 : 0,
            transition: "opacity 900ms ease",
            touchAction: "none",
          }}
        >
          <CityScene
            hovered={hovered}
            selected={selected}
            litFloor={litFloor}
            dusk={dusk}
            paused={paused}
            onHover={setHovered}
            onSelect={pick}
            onSelectFloor={pickFloor}
            onClearSelection={clearSelection}
          />
        </Canvas>
      )}

      <div className="city-hud">
        {/* ── top bar ── */}
        <header className="flex items-start justify-between gap-4 p-5 sm:p-8">
          <div>
            <p className="city-ink text-[15px] font-semibold tracking-tight sm:text-[17px]">
              Rakshit Lodha
            </p>
            <p className="city-ink-muted text-[11.5px] font-medium text-[#6B6860] sm:text-[12.5px]">
              Senior Product Manager · Paytm Money
            </p>
          </div>
          <nav className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDusk((d) => !d)}
              className="city-chip"
              aria-pressed={dusk}
            >
              {dusk ? "☾ Dusk" : "☀ Day"}
            </button>
            <Link href="/" className="city-chip" data-on="true">
              Enter the site →
            </Link>
          </nav>
        </header>

        {/* ── headline + district rail ── */}
        <div className="flex flex-col gap-4 p-5 sm:p-8">
          {active ? (
            <PlacePanel
              key={active.id}
              place={active}
              litFloor={litFloor}
              onSelectFloor={setLitFloor}
              onClose={() => {
                setSelected(null);
                setLitFloor(null);
                setTouring(false);
              }}
            />
          ) : (
            <motion.div
              key="headline"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="max-w-[30rem]"
            >
              <h1 className="city-ink text-[30px] leading-[1.08] font-semibold tracking-[-0.02em] text-[#111111] sm:text-[42px]">
                Everything I&apos;ve built,
                <br />
                <span className="font-serif font-normal italic">laid out as a city.</span>
              </h1>
              <p className="city-ink-muted mt-3 max-w-[26rem] text-[13.5px] leading-relaxed text-[#6B6860] sm:text-[15px]">
                Every building is a place I worked or a thing I built. Drag to orbit,
                scroll to zoom, and click one to find out what happened there.
              </p>
              <div className="mt-4 flex flex-wrap gap-2" data-interactive>
                <button
                  type="button"
                  className="city-chip"
                  data-on="true"
                  onClick={() => {
                    tourIndex.current = 0;
                    setTouring(true);
                  }}
                >
                  ▶ Take the tour
                </button>
                <button type="button" className="city-chip" onClick={openJJ}>
                  ◉ Talk to JJ
                </button>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col gap-2" data-interactive>
            <ChipRail
              label="Worked at"
              places={COMPANY_PLACES}
              selected={selected}
              onHover={setHovered}
              onPick={pick}
            />
            <ChipRail
              label="In town"
              places={AROUND_TOWN}
              selected={selected}
              onHover={setHovered}
              onPick={pick}
            />
          </div>

          <p className="city-ink-muted hidden text-[11px] font-medium text-[#6B6860] sm:block">
            drag to orbit · scroll to zoom · esc to reset
          </p>
        </div>
      </div>
    </div>
  );
}

function ChipRail({
  label,
  places,
  selected,
  onHover,
  onPick,
}: {
  label: string;
  places: Place[];
  selected: string | null;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="city-ink-muted hidden w-[82px] shrink-0 whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#6B6860] sm:block">
        {label}
      </span>
      <div className="city-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {places.map((p) => (
          <button
            key={p.id}
            type="button"
            className="city-chip"
            data-on={selected === p.id ? "true" : "false"}
            style={selected === p.id ? { color: p.accent } : undefined}
            onMouseEnter={() => onHover(p.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onPick(p.id)}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} />
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Static, no-WebGL version — same information, no scene. */
function CityFallback() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-[15px] font-semibold tracking-tight">Rakshit Lodha</p>
      <p className="text-[13px] text-[#6B6860]">Senior Product Manager · Paytm Money</p>
      <h1 className="mt-8 text-[34px] leading-tight font-semibold tracking-[-0.02em]">
        Everything I&apos;ve built,{" "}
        <span className="font-serif italic font-normal">laid out as a city.</span>
      </h1>
      <p className="mt-3 text-[15px] text-[#6B6860]">
        Your browser can&apos;t render the 3D map, so here is the city as a list.
      </p>
      <ul className="mt-8 space-y-5">
        {PLACES.map((p) => (
          <li key={p.id} className="border-t border-[#E4E0DA] pt-4">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: p.accent }}
            >
              {p.cityCopy.kicker}
            </span>
            <h2 className="mt-1 text-[19px] font-semibold tracking-tight">{p.label}</h2>
            <p className="mt-1 text-[14px] text-[#6B6860]">{p.cityCopy.body}</p>
            {p.sectionId && (
              <Link
                href={`/#${p.sectionId}`}
                className="mt-2 inline-block text-[13px] font-semibold"
                style={{ color: p.accent }}
              >
                See this on the site →
              </Link>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
