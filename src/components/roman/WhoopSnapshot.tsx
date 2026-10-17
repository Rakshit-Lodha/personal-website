import type { WhoopMetric, WhoopSnapshot as Snapshot } from "@/lib/roman/types";
import s from "./roman.module.css";

/** null is "no reading", shown as an em dash. It must never read as zero. */
function reading({ key, value, unit }: WhoopMetric) {
  if (value === null) return "—";
  if (key === "strain") return value.toFixed(1);
  return unit === "" || unit === "%" ? `${value}${unit}` : `${value} ${unit}`;
}

function status({ status, syncedAt }: Snapshot) {
  if (status === "sample") return "Sample data";
  if (status === "unavailable") return "Not connected yet";
  if (!syncedAt) return status === "live" ? "Live" : "Not synced recently";
  const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(new Date(syncedAt));
  return `${status === "live" ? "Updated" : "Last synced"} ${when} IST`;
}

/** Plain labelled readings. No charts, rings or interpretation. */
export default function WhoopSnapshot({ snapshot }: { snapshot: Snapshot }) {
  return (
    <aside className={s.whoop} aria-labelledby="whoop-title">
      <div className={s.whoopHead}>
        <h3 id="whoop-title">Health Maxxing</h3>
        <span className={s.whoopStatus}>{status(snapshot)}</span>
      </div>
      <p className={s.body}>A snapshot of my current state.</p>
      <dl className={s.metrics}>
        {snapshot.metrics.map((metric) => (
          <div key={metric.key}>
            <dt>{metric.label}</dt>
            <dd>{reading(metric)}</dd>
          </div>
        ))}
      </dl>
      <p className={s.note}>Compare with me — coming soon.</p>
    </aside>
  );
}
