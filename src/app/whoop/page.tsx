import type { Metadata } from "next";
import WhoopConnect from "./WhoopConnect";

export const metadata: Metadata = { title: "Connect WHOOP", robots: { index: false, follow: false } };

export default async function WhoopPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const result = (await searchParams).result;
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f5f2eb", color: "#171714", fontFamily: "Arial, sans-serif" }}>
      <section style={{ width: "min(100%, 440px)", background: "#fff", border: "1px solid #ddd8ce", borderRadius: 18, padding: 32 }}>
        <p style={{ textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 }}>Private owner setup</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 38, margin: "12px 0" }}>Connect WHOOP</h1>
        <p style={{ lineHeight: 1.55, color: "#5d5a53" }}>This connects Rakshit’s account and publishes only recovery, sleep performance, strain, HRV and resting heart rate. Credentials remain encrypted on the server.</p>
        {result === "connected" ? <p role="status" style={{ color: "#15803d" }}>WHOOP is connected and the first snapshot is synced.</p> : null}
        {result === "error" ? <p role="alert" style={{ color: "#a22" }}>The connection could not be completed. Please try again.</p> : null}
        <WhoopConnect />
      </section>
    </main>
  );
}
