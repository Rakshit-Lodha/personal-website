import type { RomanV2Content } from "@/lib/roman-v2/types";
import BeyondWork from "./BeyondWork";
import CareerJourney from "./CareerJourney";
import ClosingFooter from "./ClosingFooter";
import FloatingNav from "./FloatingNav";
import Hero from "./Hero";
import JJCallout from "./JJCallout";
import RomanV2Surface from "./RomanV2Surface";
import SelectedProducts from "./SelectedProducts";
import s from "./contemporary-roman.module.css";

/** Server composition. Each section receives only its own slice of content. */
export default function ContemporaryRomanSite({ content }: { content: RomanV2Content }) {
  return (
    <div className={s.root}>
      <a href="#main" className={s.skipLink}>
        Skip to content
      </a>
      <FloatingNav nav={content.nav} />
      <main id="main">
        <Hero hero={content.hero} />
        <CareerJourney career={content.career} />
        <SelectedProducts products={content.products} />
        <BeyondWork beyond={content.beyond} />
        <JJCallout jj={content.jj} />
      </main>
      <ClosingFooter closing={content.closing} />
      <RomanV2Surface />
    </div>
  );
}
