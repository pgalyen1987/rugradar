import type { Metadata } from "next";
import ScoreCoin from "@/components/ScoreCoin";

const APP = process.env.NEXT_PUBLIC_APP_URL || "";

const embed = {
  version: "1",
  imageUrl: `${APP}/embed.png`,
  button: {
    title: "🛡️ Scan a coin",
    action: { type: "launch_miniapp", name: "RugRadar", url: APP || "/" },
  },
};

export const metadata: Metadata = {
  title: "RugRadar",
  description: "Scan any Base coin for rugs before you buy — a 0–100 safety score in the feed.",
  other: {
    "fc:miniapp": JSON.stringify(embed),
    "fc:frame": JSON.stringify(embed),
  },
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Scan any Base coin for rugs — before you ape.</h1>
        <p className="lede">
          1 in 6 new Base coins is a scam. Paste a token, get a 0–100 safety score
          and the exact red flags — read live onchain, right where you're about to buy.
        </p>
        <div className="badges">
          <span className="badge gold">Farcaster Mini App</span>
          <span className="badge">✓ Verified on Farcaster</span>
          <span className="badge">Onchain · Base</span>
          <span className="badge">Powered by GoPlus</span>
        </div>
      </section>

      <section className="section">
        <h3>How it works</h3>
        <div className="steps">
          <div className="step"><div className="n">1</div><p className="t"><b>Paste a coin</b> — any Base token contract address.</p></div>
          <div className="step"><div className="n">2</div><p className="t"><b>We read it onchain</b> — honeypot, buy/sell tax, owner powers, mintability, liquidity, holders.</p></div>
          <div className="step"><div className="n">3</div><p className="t"><b>Get a score</b> — 0–100 with the red flags, and share the check to warn others.</p></div>
        </div>
      </section>

      <ScoreCoin />

      <section className="section">
        <h3>Why trust it</h3>
        <ul className="safe">
          <li><span><b>Live onchain data</b> — risk is read from the contract in real time, not a stale list.</span></li>
          <li><span><b>Built on GoPlus Security</b> — established detection, surfaced where you actually trade.</span></li>
          <li><span><b>Non-custodial</b> — RugRadar never touches your wallet or funds.</span></li>
          <li><span><b>A signal, not advice</b> — it flags risk; it can't promise a coin is safe.</span></li>
        </ul>
      </section>
    </>
  );
}
