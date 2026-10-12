"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CHAPTERS } from "@/lib/profile/chapters";
import { PROJECTS } from "@/lib/profile/projects";
import { floorsFor, type Place } from "../atlas";

type Props = {
  place: Place;
  litFloor: string | null;
  onSelectFloor: (floorId: string | null) => void;
  onClose: () => void;
};

/**
 * The city is navigation; this panel is the content. Everything factual here is
 * read from the same sources the scroll site uses.
 */
export default function PlacePanel({ place, litFloor, onSelectFloor, onClose }: Props) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="city-glass city-panel w-full max-w-[28rem] p-5 sm:p-6"
      data-interactive
      aria-label={place.label}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: place.accent }} />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: place.accent }}
          >
            {place.cityCopy.kicker}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="city-ink-muted -mr-1 -mt-1 rounded-full px-2 py-1 text-[12px] font-medium text-[#6B6860] hover:text-[#111111]"
          aria-label="Back to the map"
        >
          ✕
        </button>
      </div>

      <h2 className="city-ink mt-2 text-[22px] font-semibold tracking-tight text-[#111111] sm:text-[26px]">
        {place.label}
      </h2>
      <p className="city-ink mt-1 text-[14px] font-medium text-[#111111] sm:text-[15px]">
        {place.cityCopy.tagline}
      </p>
      <p className="city-ink-muted mt-2.5 text-[13px] leading-relaxed text-[#6B6860]">
        {place.cityCopy.body}
      </p>

      {place.kind === "company" && (
        <CompanyBody place={place} litFloor={litFloor} onSelectFloor={onSelectFloor} />
      )}
      {place.kind === "project" && <ProjectBody place={place} />}

      {place.sectionId && (
        <Link
          href={`/#${place.sectionId}`}
          className="mt-4 inline-block rounded-full px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:-translate-y-0.5"
          style={{ background: place.accent }}
        >
          See this on the site →
        </Link>
      )}
    </motion.aside>
  );
}

/** A company's floors, in the same order they are stacked on the building. */
function CompanyBody({
  place,
  litFloor,
  onSelectFloor,
}: {
  place: Place;
  litFloor: string | null;
  onSelectFloor: (floorId: string | null) => void;
}) {
  const companyId = place.companyId!;
  const chapter = CHAPTERS.find((c) => c.companyId === companyId);
  const floors = floorsFor(companyId);

  return (
    <div className="mt-4">
      {chapter && (
        <div className="flex items-start gap-3 border-t border-[#E4E0DA] pt-3.5">
          {chapter.icon && (
            <Image
              src={chapter.icon}
              alt=""
              width={30}
              height={30}
              className="mt-0.5 shrink-0 rounded-md object-contain"
            />
          )}
          <p className="city-ink-muted text-[12.5px] leading-relaxed text-[#6B6860]">
            {chapter.description}
          </p>
        </div>
      )}

      {floors.length > 0 && (
        <>
          <p className="city-ink-muted mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B6860]">
            {floors.length} {floors.length === 1 ? "floor" : "floors"} · tap one to light it up
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {floors.map((floor) => {
              const open = litFloor === floor.id;
              return (
                <li key={floor.id}>
                  <button
                    type="button"
                    onClick={() => onSelectFloor(open ? null : floor.id)}
                    className="city-floor w-full text-left"
                    data-open={open}
                    data-failed={floor.failed}
                    style={{ ["--accent" as string]: place.accent }}
                  >
                    <span className="city-floor__row">
                      <span className="city-floor__label">{floor.label}</span>
                      <span className="city-floor__metric">{floor.metric}</span>
                    </span>
                    {open && <span className="city-floor__impact">{floor.impact}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function ProjectBody({ place }: { place: Place }) {
  const project = PROJECTS.find((p) => p.id === place.projectId);
  if (!project) return null;
  return (
    <div className="mt-4 border-t border-[#E4E0DA] pt-3.5">
      <ul className="flex flex-wrap gap-1.5">
        {project.stack.slice(0, 6).map((tech) => (
          <li
            key={tech}
            className="city-ink-muted rounded-full border border-[#E4E0DA] px-2.5 py-1 text-[11px] font-medium text-[#6B6860]"
          >
            {tech}
          </li>
        ))}
      </ul>
      {project.links.github && (
        <a
          href={project.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="city-ink-muted mt-3 inline-block text-[12.5px] font-semibold text-[#6B6860] underline underline-offset-2"
        >
          View the code
        </a>
      )}
    </div>
  );
}
