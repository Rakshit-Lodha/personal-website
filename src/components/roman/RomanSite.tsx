import type { RomanContent } from "@/lib/roman/types";
import Arrival from "./Arrival";
import Closing from "./Closing";
import DailyReading from "./DailyReading";
import JJSection from "./JJSection";
import Loader from "./Loader";
import Nav from "./Nav";
import Playground from "./Playground";
import RomanSurface from "./RomanSurface";
import SelectedProjects from "./SelectedProjects";
import WhoopSnapshot from "./WhoopSnapshot";
import WorkJourney from "./WorkJourney";
import WritingList from "./WritingList";
import s from "./roman.module.css";

/** Server composition. Only the interactive sections are client components. */
export default function RomanSite({ content }: { content: RomanContent }) {
  return (
    <div className={s.site}>
      <Loader />
      <a href="#journey" className={s.skip}>
        Skip to content
      </a>
      <Nav />
      <main>
        {/* One scroll-linked walk: in through the arch to the journey wall. */}
        <div className={s.walk}>
          <Arrival intro={content.intro} />
          <WorkJourney entries={content.journey} />
        </div>
        <SelectedProjects projects={content.projects} />
        <DailyReading edition={content.reading.latest} />
        <WritingList entries={content.writing} />
        <Playground>
          <WhoopSnapshot snapshot={content.whoop} />
        </Playground>
        <JJSection />
        <Closing contact={content.contact} quote={content.quote} />
      </main>
      <RomanSurface />
    </div>
  );
}
