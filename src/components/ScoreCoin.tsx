"use client";
import { useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import type { ScoreResult } from "@/lib/types";

const BAND = {
  safe: { label: "Looks safe", color: "#39d98a" },
  caution: { label: "Caution", color: "#f5c451" },
  "high-risk": { label: "High risk", color: "#ff8c42" },
  critical: { label: "Critical — do not buy", color: "#ff6b6b" },
} as const;

export default function ScoreCoin() {
  const [addr, setAddr] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<ScoreResult | null>(null);

  async function check() {
    setErr(""); setRes(null); setBusy(true);
    try {
      const r = await fetch(`/api/score?address=${encodeURIComponent(addr.trim())}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "could not check");
      setRes(j as ScoreResult);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  async function share() {
    if (!res) return;
    const b = BAND[res.band];
    const tag = res.symbol ? `$${res.symbol}` : res.address.slice(0, 8);
    try {
      await sdk.actions.composeCast({
        text: `${tag} safety score: ${res.score}/100 — ${b.label}. Checked with RugRadar 🛡️`,
        embeds: [`https://rugradar-production.up.railway.app/?a=${res.address}`],
      });
    } catch (e) { setErr((e as Error).message); }
  }

  const b = res ? BAND[res.band] : null;

  return (
    <div className="card">
      <h2>Check a coin</h2>
      <p className="muted small">Paste a Base token address. We read it onchain and score the risk before you buy.</p>
      <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="0x… token contract" />
      {err && <p className="err">{err}</p>}
      <button disabled={busy || !addr} onClick={check}>{busy ? "Scanning…" : "Scan for rugs"}</button>

      {res && b && (
        <div className="result" style={{ marginTop: 8 }}>
          <div className="scorebar" style={{ borderColor: b.color }}>
            <span className="scorenum" style={{ color: b.color }}>{res.score}</span>
            <span className="muted small">/100</span>
            <span className="bandlabel" style={{ background: b.color }}>{b.label}</span>
          </div>
          <p className="muted small" style={{ marginTop: 6 }}>
            {res.name ? `${res.name} ` : ""}{res.symbol ? `($${res.symbol})` : ""}
          </p>
          {res.flags.length > 0 && (
            <ul className="flags">{res.flags.map((f) => <li key={f}>⚠️ {f}</li>)}</ul>
          )}
          {res.positives.length > 0 && (
            <ul className="positives">{res.positives.map((p) => <li key={p}>✓ {p}</li>)}</ul>
          )}
          <button className="ghost" onClick={share}>Share this check</button>
          <p className="muted small">Not financial advice — a risk signal, not a guarantee.</p>
        </div>
      )}
    </div>
  );
}
