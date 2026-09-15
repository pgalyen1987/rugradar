# Deploying Keycast + turning on the income rails

## 1. Deploy (Vercel, ~5 min)
1. Push this repo to GitHub.
2. Import into Vercel (Framework: Next.js — auto-detected).
3. Set env vars (Project → Settings → Environment Variables), from `.env.example`:
   - `NEXT_PUBLIC_APP_URL` = your deployed URL (e.g. `https://keycast.vercel.app`)
   - `NEXT_PUBLIC_REFERRER_ADDRESS` = your Base wallet (Basename recommended — see §4)
   - `BASE_RPC_URL` = a Base RPC (public works to start)
   - `UPSTASH_REDIS_REST_URL` / `_TOKEN` = free Upstash Redis (persists gates across
     restarts — required for production; without it the in-memory store resets)
4. Deploy. Store-spec images are already committed and correct:
   `public/icon.png` (1024×1024 opaque), `public/embed.png` (1200×800, 3:2),
   `public/splash.png` (200×200). Swap them for your own branding anytime.

> **Local build note:** `next build` SIGBUSes on this machine (Node 22 + the Kali
> 6.19 kernel crash Next's build worker — reproducible with SWC *and* Babel). It is
> an environment fault, not a code fault: `npm run typecheck` and `npm test` both
> pass, and Vercel's Node-20 build image builds it cleanly. Don't chase the local crash.

## 2. Register the mini-app manifest
The manifest is served at `/.well-known/farcaster.json` (generated from env).
Generate the **accountAssociation** (proves you own the domain) with the Farcaster
/ Base manifest tool for your deployed domain, then set:
- `FARCASTER_HEADER`, `FARCASTER_PAYLOAD`, `FARCASTER_SIGNATURE`
Redeploy. Verify `https://<your-domain>/.well-known/farcaster.json` returns your
values. This is what makes it a *verified* mini-app (eligible for rewards + sharing).

## 3. Test it
- Open `https://<your-domain>` in the Base app (or a Farcaster client) → create a
  gate against one of your Zora coins.
- Share it (the in-app "Share to Farcaster" button uses `composeCast`).
- From a wallet that holds the coin, open the gate → Unlock → content appears.
- From one that doesn't → "Buy to unlock" opens the native swap.

## 4. Turn on Rail #1 — Base Builder Rewards (the reliable one)
No application; you're ranked automatically. Do this once:
1. Get a **Basename** (base.org/names) for your builder wallet.
2. Create a profile at **talent.app**, connect your GitHub + this wallet, reach
   **Builder Score ≥ 40** (public repo for Keycast + the deployed contract activity
   help). Complete human verification.
3. Keep shipping: open-source commits + onchain activity from real Keycast usage
   feed your weekly score. Rewards land automatically on Mondays.

## 5. Rail #2 — Zora trade-referral (upside, NOT yet captured)
`NEXT_PUBLIC_REFERRER_ADDRESS` holds the operator address, but the ~4% trade
referral is **not earned yet**. Per Zora's V4 docs, trade referral is attributed
*only* by encoding your address in the swap's `hookData`
(`abi.encode(YOUR_ADDRESS)`) and executing the swap yourself through the Uniswap V4
router. The current "buy to unlock" uses the client's native `swapToken`, which
can't carry that; and `@zoralabs/coins-sdk@0.8.0` `tradeCoin`/`createTradeCall`
expose no referrer field either (`TradeParameters` has none). So capturing it means
hand-rolling the V4 swap with hookData — real onchain code that needs testnet +
mainnet testing before shipping (moves user funds). **Deliberately deferred:** v1
ships the robust native swap; Keycast's reliable income is Rail #1 (Builder
Rewards). The 20% *platform* referral (5× bigger) is captured at coin *creation*
via `createCoinCall({ platformReferrer })` — that's a separate app ("Coined it"),
not Keycast.

## 6. Grants (bonus)
Once it has real usage, submit Keycast to **Base Builder Grants** (retroactive,
1–5 ETH) and **Base Batches** ($10k–50k). "A social protocol/creator tool that
brings users onchain" is exactly their stated target.
