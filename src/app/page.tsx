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
  description: "Scan any Base coin for rugs before you buy: a 0–100 safety score in the feed.",
  other: {
    "fc:miniapp": JSON.stringify(embed),
    "fc:frame": JSON.stringify(embed),
  },
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Scan any Base coin for rugs before you ape.</h1>
        <p className="lede">
          Paste a token and get a 0–100 safety score with the exact red flags, read live
          onchain, right where you're about to buy.
        </p>
      </section>

      <ScoreCoin />

      <section className="section">
        <h3>How it works</h3>
        <ol className="how">
          <li><b>Paste a coin.</b> Any Base token contract address.</li>
          <li><b>We read it onchain.</b> Honeypot, buy and sell tax, owner powers, mintability, liquidity and holders.</li>
          <li><b>Get a score.</b> 0–100 with the red flags. Share the check to warn others.</li>
        </ol>
      </section>

      <section className="section">
        <h3>Why trust it</h3>
        <ul className="safe">
          <li><b>Live onchain data.</b> Risk is read from the contract in real time, not from a stale list.</li>
          <li><b>Built on GoPlus Security.</b> Established detection, shown where you actually trade.</li>
          <li><b>Non-custodial.</b> RugRadar never touches your wallet or funds.</li>
          <li><b>A signal, not advice.</b> It flags risk. It can't promise a coin is safe.</li>
        </ul>
      </section>
    </>
  );
}
