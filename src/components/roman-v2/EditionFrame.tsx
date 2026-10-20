"use client";

import { useRef, useState } from "react";

/**
 * Embeds a full edition's visual HTML newspaper in an isolated frame.
 * srcDoc keeps it same-origin so the frame auto-sizes to its content.
 */
export default function EditionFrame({
  html,
  title,
  background = "#f1eadf",
}: {
  html: string;
  title: string;
  background?: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(1200);

  return (
    <iframe
      ref={ref}
      title={title}
      srcDoc={html}
      loading="lazy"
      onLoad={() => {
        const doc = ref.current?.contentDocument;
        if (doc?.documentElement) {
          doc.documentElement.style.setProperty("background", background, "important");
          doc.body?.style.setProperty("background", background, "important");
          setHeight(doc.documentElement.scrollHeight + 40);
        }
      }}
      style={{
        width: "100%",
        height: `${height}px`,
        border: 0,
        borderRadius: 0,
        background,
      }}
    />
  );
}
