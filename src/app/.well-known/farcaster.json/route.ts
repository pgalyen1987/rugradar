export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const app = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER || "",
      payload: process.env.FARCASTER_PAYLOAD || "",
      signature: process.env.FARCASTER_SIGNATURE || "",
    },
    miniapp: {
      version: "1",
      name: "RugRadar",
      iconUrl: `${app}/icon.png`,
      homeUrl: app,
      imageUrl: `${app}/embed.png`,
      buttonTitle: "🛡️ Scan a coin",
      splashImageUrl: `${app}/splash.png`,
      splashBackgroundColor: "#0c0e12",
      subtitle: "Scan Base coins for rugs",
      description: "Paste any Base token and get a 0–100 safety score with the red flags — honeypot, taxes, owner powers, liquidity — read live onchain, right where you buy.",
      tagline: "Scan before you ape",
      primaryCategory: "utility",
      tags: ["safety", "security", "rug", "base", "coin"],
      ogTitle: "RugRadar",
      ogDescription: "Scan any Base coin for rugs before you buy.",
      ogImageUrl: `${app}/embed.png`,
      heroImageUrl: `${app}/embed.png`,
      requiredChains: ["eip155:8453"],
      noindex: false,
    },
  });
}
