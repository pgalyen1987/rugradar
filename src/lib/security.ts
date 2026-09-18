import type { TokenSecurity } from "./types";

// Build ON commodity detection: GoPlus token-security API (free, covers Base).
// We do not reinvent contract analysis — we place its verdict where the buy
// happens and add our own scoring on top.
const GOPLUS = "https://api.gopluslabs.io/api/v1/token_security/8453";

const flag = (v: unknown) => v === "1" || v === 1;
const num = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : Number(v));
// The zero address and the conventional 0x…dEaD burn address, exactly. A looser /dead/ match
// counted any address that happened to contain "dead" as burned liquidity.
const DEAD = /^0x0{40}$|^0x0{36}dead$/i;

interface LpHolder { address?: string; percent?: string | number; is_locked?: number | string }

export async function fetchSecurity(address: `0x${string}`): Promise<TokenSecurity> {
  const r = await fetch(`${GOPLUS}?contract_addresses=${address}`, {
    headers: { accept: "application/json" }, cache: "no-store",
  });
  if (!r.ok) throw new Error(`Security provider error (${r.status}).`);
  const j = await r.json();
  const rec = j?.result?.[address.toLowerCase()];
  if (!rec) throw new Error("No data for this token on Base. Is it a Base ERC-20?");
  return parseSecurity(address, rec);
}

/** A GoPlus token_security record → the facts we score. Pure, so it is tested on real records. */
export function parseSecurity(address: `0x${string}`, rec: any): TokenSecurity {
  const owner = String(rec.owner_address || "").toLowerCase();

  // Weigh LP holders by their share. "Any holder locked" passed a pool whose zero-address entry
  // held 0.00% while two wallets held the rest unlocked. No LP data at all (Uniswap v4 pools,
  // including every Zora coin) is unknown, not unlocked.
  const holders: LpHolder[] = Array.isArray(rec.lp_holders) ? rec.lp_holders : [];
  // LP holders exist only for pools that mint LP tokens. When most liquidity sits in v3/v4
  // positions (DEGEN: ~$404 in LP-token pools, ~$234k in v3/v4) they describe a sideshow.
  const pools: { liquidity_type?: string; liquidity?: string }[] = Array.isArray(rec.dex) ? rec.dex : [];
  const total = pools.reduce((sum, d) => sum + (Number(d.liquidity) || 0), 0);
  const positions = pools.filter((d) => /v3|v4/i.test(d.liquidity_type || "")).reduce((sum, d) => sum + (Number(d.liquidity) || 0), 0);
  const lpDataCoversLiquidity = total === 0 || (total - positions) / total >= 0.5;
  const lpLockedShare = holders.length && lpDataCoversLiquidity
    ? Math.min(1, holders
        .filter((h) => flag(h.is_locked) || DEAD.test(h.address || ""))
        .reduce((sum, h) => sum + (Number(h.percent) || 0), 0))
    : undefined;

  return {
    address, name: rec.token_name, symbol: rec.token_symbol,
    isOpenSource: flag(rec.is_open_source),
    isHoneypot: flag(rec.is_honeypot),
    isMintable: flag(rec.is_mintable),
    isProxy: flag(rec.is_proxy),
    canTakeBackOwnership: flag(rec.can_take_back_ownership),
    hiddenOwner: flag(rec.hidden_owner),
    selfdestruct: flag(rec.selfdestruct),
    ownerRenounced: owner === "" || DEAD.test(owner),
    buyTax: num(rec.buy_tax),
    sellTax: num(rec.sell_tax),
    holderCount: num(rec.holder_count),
    lpHolderCount: num(rec.lp_holder_count),
    lpLocked: lpLockedShare === undefined ? undefined : lpLockedShare >= 0.9,
    lpLockedShare,
    transferPausable: flag(rec.transfer_pausable),
    isInDex: flag(rec.is_in_dex),
  };
}
