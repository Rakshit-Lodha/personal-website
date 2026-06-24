type GtagCommand =
  | ["config", string, Record<string, unknown>?]
  | ["event", string, Record<string, unknown>?]
  | ["js", Date];

declare global {
  interface Window {
    dataLayer?: GtagCommand[];
    gtag?: (...args: GtagCommand) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function getGtag() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    ((...args: GtagCommand) => {
      window.dataLayer?.push(args);
    });

  return window.gtag;
}

export function trackPageView(path: string) {
  if (!GA_MEASUREMENT_ID) return;

  getGtag()("event", "page_view", {
    page_path: path,
    send_to: GA_MEASUREMENT_ID,
  });
}

export function trackChatInteraction({
  mode,
  hasFile,
}: {
  mode: string;
  hasFile: boolean;
}) {
  if (!GA_MEASUREMENT_ID) return;

  getGtag()("event", "chat_message_sent", {
    chat_mode: mode,
    has_file: hasFile,
    send_to: GA_MEASUREMENT_ID,
  });
}
