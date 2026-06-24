import Image from "next/image";

type Entry = { school: string; degree: string };

const ENTRIES: Entry[] = [
  { school: "SP Jain Global School of Management", degree: "MBA (Executive)" },
  { school: "Christ University", degree: "BBA, Finance & International Business" },
  { school: "London School of Economics", degree: "Summer School, Alt. Investments" },
];

function EduCard({ entry }: { entry: Entry }) {
  return (
    <div
      className="flex flex-col bg-white"
      style={{
        border: "1.5px solid #496dff",
        padding: "clamp(14px,1.39vw,24px) clamp(12px,1.04vw,18px)",
        flex: 1,
        minWidth: "clamp(200px,22vw,438px)",
        gap: "clamp(5px,0.4vw,7px)",
      }}
    >
      <span
        className="font-figtree text-[#636364]"
        style={{
          fontSize: "clamp(11px,1.04vw,18px)",
          fontWeight: 300,
          lineHeight: 1.42,
        }}
      >
        {entry.school}
      </span>
      <span
        className="font-figtree text-[#111]"
        style={{
          fontSize: "clamp(13px,1.28vw,22px)",
          fontWeight: 500,
          lineHeight: 1.3,
          letterSpacing: "0.02em",
        }}
      >
        {entry.degree}
      </span>
    </div>
  );
}

function ArrowIcon({ idSuffix }: { idSuffix: string }) {
  const gradId0 = `edu-grad-0-${idSuffix}`;
  const gradId1 = `edu-grad-1-${idSuffix}`;
  const gradId2 = `edu-grad-2-${idSuffix}`;
  return (
    <svg width="53" height="36" viewBox="0 0 53 36" fill="none" aria-hidden="true">
      <path d="M17.2656 0.397461L34.6965 17.8283L17.2656 35.2592" stroke={`url(#${gradId0})`} strokeWidth="1.12457" />
      <path d="M34.1367 0.397461L51.5676 17.8283L34.1367 35.2592" stroke={`url(#${gradId1})`} strokeWidth="1.12457" />
      <path d="M0.398438 0.397461L17.8293 17.8283L0.398437 35.2592" stroke={`url(#${gradId2})`} strokeWidth="1.12457" />
      <defs>
        <linearGradient id={gradId0} x1="34.1342" y1="17.8283" x2="16.7033" y2="17.8283" gradientUnits="userSpaceOnUse">
          <stop stopColor="#496DFF" />
          <stop offset="1" stopColor="#FEFEFE" />
        </linearGradient>
        <linearGradient id={gradId1} x1="51.0053" y1="17.8283" x2="33.5744" y2="17.8283" gradientUnits="userSpaceOnUse">
          <stop stopColor="#496DFF" />
          <stop offset="1" stopColor="#FEFEFE" />
        </linearGradient>
        <linearGradient id={gradId2} x1="17.267" y1="17.8283" x2="-0.163849" y2="17.8283" gradientUnits="userSpaceOnUse">
          <stop stopColor="#496DFF" />
          <stop offset="1" stopColor="#FEFEFE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Education() {
  return (
    <section
      id="education"
      className="bg-[#F3F7F8]"
      style={{
        padding:
          "clamp(48px,5.5vw,96px) clamp(16px,5.3vw,92px) clamp(80px,9.3vw,161px)",
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
            EDUCATION
          </h2>
          <Image
            src="/landing/education-icon.png"
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

      <div className="flex flex-col items-stretch md:flex-row md:flex-wrap md:items-center" style={{ marginTop: "clamp(24px,3vw,45px)" }}>
        {ENTRIES.map((entry, i) => (
          <div key={entry.school} className="contents">
            <EduCard entry={entry} />
            {i < ENTRIES.length - 1 && (
              <div
                className="flex items-center justify-center self-center md:rotate-0 rotate-90"
                style={{ padding: "0 clamp(8px,1vw,20px)", flexShrink: 0 }}
              >
                <ArrowIcon idSuffix={String(i)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
