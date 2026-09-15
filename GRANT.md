# RugRadar — grant proposal (draft)

**One-liner:** An open-source, Farcaster-native safety layer that scores any Base
coin for rug risk *in the feed, at the moment of the buy* — and exposes a free
API/badge any mini app can embed.

**Applicant:** Rebel Studios Software · rebelstudiossoftware.com · Farcaster
@rebelstudios (fid 3350929) · builder wallet `0x8E57…d5D0`

**Live:** https://rugradar-production-e532.up.railway.app · API:
`/api/score?address=0x…` · Source: (GitHub — to publish)

---

## The problem (quantified)
Base has no native token-vetting process, and the scale of harm is measured:
**~1 in 6 new Base memecoins is a scam and 91% have contract vulnerabilities**
(Cointelegraph, 2026), while Clanker alone deploys **13,000–21,000 coins/day**.
Buyers ape in the Farcaster feed with no risk signal where the decision happens.
Generic rug-checkers exist, but they are websites and CLIs — none meets the user
*in-feed, at the point of trade*, and the platforms that profit from volume have
no incentive to flag their own coins.

## The solution
RugRadar reads a coin's contract live (honeypot, buy/sell tax, owner powers,
mintability, liquidity lock, holder count) and returns a **0–100 safety score +
plain-English red flags**, as:
1. a **Farcaster mini app** — paste/scan a coin, get the score, share the check;
2. a **free, CORS-open `/api/score` endpoint + embeddable badge** any other mini
   app (launchers, wallets, feeds) can drop in — so the safety read spreads to
   where trades actually happen.

It **builds on established detection** (GoPlus) rather than reinventing contract
analysis, and adds the missing layer: **placement, a shareable warning, and
composability.**

## Why it's a public good (grant fit)
- Protects Base users from quantified, ongoing harm.
- **Open source + free API** — other builders embed it at no cost, compounding
  ecosystem safety.
- Brings safety onchain and lowers the trust barrier that keeps mainstream users
  out — directly on-mission for Base/Zora ecosystem support and OP RetroPGF.

## What's already shipped (this is not vaporware)
- Live mini app + verified Farcaster manifest.
- Live scoring on real Base coins (tested end-to-end).
- Public API + shareable result cards.
- Built on a reusable open mini-app boilerplate (a second public good for Base
  builders).

## Milestones
| # | Deliverable | Ask |
|---|---|---|
| M1 | Live scanner + public API (**done**) | retroactive |
| M2 | Embeddable badge + social-graph signals (deployer's Farcaster reputation, coin age) + scoring calibration for blue-chips | — |
| M3 | Auto-scan integration (warn on Clanker/Zora coin embeds in-feed) + open dataset of flagged coins | — |

**Requested:** a modest milestone grant (e.g. **1–3 ETH** or **$5k–$15k**), split
retroactive (M1) + M2/M3, adjustable to the program's norms.

## Team
Rebel Studios Software — solo builder with a security/systems background
(Vigilo on-device anomaly detection; trade-guard trading-safety SaaS) shipping a
family of Base/Zora/Farcaster mini apps (Keycast, Coined it, RugRadar).

## Links
- App: https://rugradar-production-e532.up.railway.app
- API: https://rugradar-production-e532.up.railway.app/api/score?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
- Site: https://rebelstudiossoftware.com
- Farcaster: https://farcaster.xyz/rebelstudios
