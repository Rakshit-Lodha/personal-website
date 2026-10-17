"use client";

import { FormEvent, useState } from "react";

export default function WhoopConnect() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/whoop/connect", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ adminSecret: form.get("adminSecret") }) });
    const body = (await response.json()) as { url?: string; error?: string };
    if (response.ok && body.url) window.location.assign(body.url);
    else { setError(body.error ?? "Could not start the WHOOP connection."); setLoading(false); }
  }
  return (
    <form onSubmit={connect} style={{ display: "grid", gap: 16 }}>
      <label style={{ display: "grid", gap: 8 }}>
        Administrator secret
        <input name="adminSecret" type="password" required autoComplete="current-password" style={{ border: "1px solid #bbb", borderRadius: 8, padding: 12, font: "inherit" }} />
      </label>
      <button type="submit" disabled={loading} style={{ border: 0, borderRadius: 999, padding: "12px 18px", background: "#171714", color: "white", font: "inherit", cursor: "pointer" }}>
        {loading ? "Connecting…" : "Connect WHOOP"}
      </button>
      {error ? <p role="alert" style={{ color: "#a22", margin: 0 }}>{error}</p> : null}
    </form>
  );
}
