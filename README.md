# 🛡️ RugRadar

**Scan any Base coin for rugs — before you ape.** A Farcaster / Base mini-app.

~1 in 6 new Base memecoins is a scam and 91% have contract vulnerabilities, yet
Base has no native token-vetting and buyers ape straight from the feed. RugRadar
reads a coin's contract live and returns a **0–100 safety score + plain-English
red flags**, right where the buy happens — plus a free, embeddable score API so
any app can surface the same signal.

## What it does

Paste a Base token address → get:
- a **0–100 score** and a risk band (safe / caution / high-risk / critical),
- the **red flags** behind it (honeypot, buy/sell tax, owner powers, mintability,
  unlocked liquidity, thin holder base),
- a **shareable check** you can cast to warn others.

It **builds on established detection** ([GoPlus Security](https://gopluslabs.io))
rather than reinventing contract analysis — the value is *placement* (in-feed, at
the point of trade) and *composability* (a public API any mini app can embed).

## Public API

```bash
curl "https://rugradar-production-e532.up.railway.app/api/score?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
```

```json
{ "address": "0x833589…", "name": "USD Coin", "symbol": "USDC",
  "score": 60, "band": "caution",
  "flags": ["Owner not renounced", "Liquidity not locked/burned"],
  "positives": ["Source verified", "No buy/sell tax"] }
```

CORS-open — drop the score into your own app or bot.

## Architecture

- **Next.js 14** (App Router), TypeScript, zero CSS framework.
- `src/lib/security.ts` — GoPlus adapter (Base, chain 8453), normalized.
- `src/lib/score.ts` — pure, tested scoring (rules → score + flags).
- `src/app/api/score` — the public score endpoint.
- `src/components/ScoreCoin.tsx` — the in-feed scanner UI.
- `@farcaster/miniapp-sdk` for `ready` / `composeCast`.

## Develop

```bash
npm install
npm run typecheck && npm test
npm run dev
```

## Honest limitations

- Tuned for **new memecoins**; blue-chips (USDC) can trip "owner not renounced /
  LP not locked" and read as *caution* — calibration for established tokens is on
  the roadmap.
- A **risk signal, not financial advice**, and not a guarantee a coin is safe.
- **Non-custodial** — RugRadar never touches your wallet or funds.

## License

MIT.
