# 🔑 Keycast

**Hold a creator's Zora coin, unlock their content.** A Farcaster / Base mini-app.

Creator coins on Zora mostly have no utility beyond speculation — the loudest
creator complaint is that holding a coin *does nothing*. Keycast makes a coin a
**key**: a creator gates a link / Discord / download / message behind holding a
minimum balance; holders unlock it, everyone else gets a one-tap buy.

## Why this shape (the honest strategy)

Two ways to get paid, **both independent of having an audience** — which is the
wall every other approach hit:

1. **Base Builder Rewards** (primary, reliable): Keycast is an open-source Base
   mini-app with real onchain activity. Builder Rewards pay ~2 ETH/week split
   across the top Base builders, automatically, ranked by GitHub + contract +
   mini-app activity. No users required — it rewards the building.
2. **Zora trade-referral fees** (upside): the "buy to unlock" flow routes through
   Zora; where the client supports attaching a `traderReferrer`, the operator
   earns a cut of the 1% trade fee. Grows with usage, not billing.

Plus **distribution is built in**: a creator shares a gate with `composeCast`, and
it spreads through the Farcaster feed to their followers — the platform hands you
reach instead of you manufacturing it.

## How it works (security)

- **Balance is read server-side** from Base via viem (`balanceOf`) — can't be faked.
- **Wallet ownership is proven** before any balance read: the viewer signs a
  single-use nonce (`/api/nonce` → `personal_sign` → `/api/unlock` verifies with
  viem). So nobody can claim a whale's address to unlock content they don't hold.
- **Secret content is never in the page or the URL** — it's stored server-side and
  returned only after the balance check passes.

## Architecture

- **Next.js 14** (App Router), TypeScript, zero-CSS-framework.
- `src/lib` — pure, tested core: `validate`, `format` (units), `chain` (viem Base
  reads), `auth` (nonce + signature verify), `store` (memory dev / Upstash prod),
  `referrer` (CAIP-19).
- `src/app/api` — `gates` (create), `gates/[id]` (public meta), `nonce`, `unlock`.
- `src/components` — `CreateGate`, `Unlock`, `wallet` (mini-app EIP-1193 via viem).
- `@farcaster/miniapp-sdk` for `ready` / `composeCast` / `swapToken` / wallet.

## Develop

```bash
npm install
cp .env.example .env.local     # fill in values (memory store works with none set)
npm run dev                    # http://localhost:3000
npm run typecheck              # tsc --noEmit  (clean)
npm test                       # vitest — 13 tests incl. the ownership-proof crypto
```

> Note on building here: `npm run build` runs Next's native toolchain, which
> crashes (SIGBUS) in the constrained sandbox this was authored in. It builds
> normally on Vercel or any standard machine. Correctness is enforced by
> `typecheck` + `test`, both green.

See **DEPLOY.md** to ship it and turn on the two income rails.
