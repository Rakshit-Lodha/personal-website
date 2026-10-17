import type { Metadata } from "next";
import Link from "next/link";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Rakshit Lodha",
  description: "How rakshitlodha.com handles website, chat, voice and WHOOP data.",
};

const sections = [
  {
    title: "Who is responsible",
    body: <><p>This website and its connected experiences are operated by Rakshit Lodha. Questions, privacy requests and security concerns can be sent to <a href="mailto:rakshitlodha.business@gmail.com">rakshitlodha.business@gmail.com</a>.</p></>,
  },
  {
    title: "Information collected",
    body: <><p>The site may process information you choose to provide, including chat messages, job descriptions, documents, voice recordings and messages sent by email.</p><p>Basic usage information—such as pages viewed, device and browser information, approximate location derived from an IP address and interaction events—may be collected through Google Analytics and hosting logs. A short-lived, secure cookie is used only while completing WHOOP authorization.</p></>,
  },
  {
    title: "WHOOP data",
    body: <><p>The WHOOP integration requests access only to recovery, sleep and physiological-cycle data, plus offline access so authorization can be refreshed. From that data, the site uses recovery score, sleep performance, strain, heart-rate variability, resting heart rate and relevant timestamps.</p><p><strong>The connected account belongs to the site owner.</strong> By completing the private owner connection, the owner expressly authorizes these selected current measurements to be displayed publicly on this personal website. Profile, body-measurement and workout data are not requested.</p><div className={s.callout}>WHOOP data is shown for personal context only. It is not medical advice, diagnosis or a claim about health.</div></>,
  },
  {
    title: "How information is used",
    body: <ul><li>To operate, secure and improve the website.</li><li>To answer portfolio and career questions through the site’s assistant.</li><li>To transcribe voice input and generate spoken responses when requested.</li><li>To retrieve and display the owner’s selected WHOOP measurements.</li><li>To diagnose failures, prevent abuse and understand aggregate usage.</li></ul>,
  },
  {
    title: "Service providers",
    body: <><p>Information is shared only as needed to operate the requested feature. Providers may include Vercel for hosting, Upstash for encrypted server-side storage, Google Analytics for usage measurement, OpenAI for assistant responses, Sarvam AI for speech features and WHOOP as the source of authorized fitness data.</p><p>Information is not sold, rented or used to advertise based on WHOOP data. It may also be disclosed when required by law or necessary to protect the site, its users or others.</p></>,
  },
  {
    title: "Storage and retention",
    body: <><p>WHOOP access and refresh credentials are encrypted before being stored and are never placed in browser storage. The latest allowlisted measurement snapshot is kept separately from credentials and replaced as newer data is synchronized.</p><p>WHOOP credentials and snapshots are retained while the integration remains connected. They are deleted when the integration is disconnected or following a verified deletion request. The temporary OAuth cookie expires after ten minutes. Uploaded documents and voice clips are processed for the requested interaction and are not used as a server-side conversation archive by this site.</p></>,
  },
  {
    title: "Your choices",
    body: <><p>You can decline optional features, avoid providing files or voice, and use WHOOP’s connected-app controls to withdraw authorization. To request access, correction or deletion of information handled by this site, email <a href="mailto:rakshitlodha.business@gmail.com?subject=Privacy%20request">rakshitlodha.business@gmail.com</a>.</p><p>When WHOOP access is withdrawn, future synchronization stops. A verified request can also be used to remove the locally stored connection and snapshot.</p></>,
  },
  {
    title: "Security and changes",
    body: <><p>Reasonable technical and organizational measures are used, including HTTPS, server-only credentials, encryption at rest for WHOOP credentials, restricted scopes and separation of public measurements from private authorization data. No method of storage or transmission can be guaranteed completely secure.</p><p>This policy may be updated as the site changes. Material updates will be reflected on this page with a revised effective date.</p></>,
  },
];

export default function PrivacyPage() {
  return (
    <main className={s.page}>
      <div className={s.shell}>
        <header className={s.masthead}>
          <Link className={s.brand} href="/roman-v2">Rakshit Lodha</Link>
          <Link className={s.back} href="/roman-v2">Return to the site</Link>
        </header>
        <section className={s.hero}>
          <div><p className={s.eyebrow}>Trust, in plain language</p><h1 className={s.title}>Privacy<br />policy</h1></div>
          <p className={s.intro}>What this site collects, why it is needed, and the choices available to you.<span className={s.updated}>Effective 17 October 2026</span></p>
        </section>
        <div className={s.content}>
          {sections.map((section, index) => (
            <section className={s.section} key={section.title}>
              <span className={s.number}>{String(index + 1).padStart(2, "0")}</span>
              <h2 className={s.heading}>{section.title}</h2>
              <div className={s.copy}>{section.body}</div>
            </section>
          ))}
        </div>
        <footer className={s.footer}><span>© 2026 Rakshit Lodha</span><span>Clarity before collection.</span></footer>
      </div>
    </main>
  );
}
