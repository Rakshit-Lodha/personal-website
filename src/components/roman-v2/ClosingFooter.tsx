import type { RomanV2Closing } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import shared from "./contemporary-roman.module.css";
import s from "./ClosingFooter.module.css";

/** Final invitation and site footer in one contentinfo landmark, so the invitation sits outside <main>. */
export default function ClosingFooter({ closing }: { closing: RomanV2Closing }) {
  return (
    <footer id="contact" aria-labelledby="contact-title" className={`${shared.section} ${s.root}`}>
      <div className={shared.container}>
        <h2 id="contact-title" className={shared.h2}>
          {closing.heading.lead} <span className={shared.accent}>{closing.heading.accent}</span>
        </h2>
        <AvailabilityAction action={closing.conversationAction} variant="text" />
        <AvailabilityAction action={closing.scheduleAction} variant="outline" />
        <p className={shared.inscription}>{closing.inscription.latin}</p>
      </div>
    </footer>
  );
}
