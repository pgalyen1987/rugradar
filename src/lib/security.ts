import type { TokenSecurity } from "./types";

// Build ON commodity detection: GoPlus token-security API (free, covers Base).
// We do not reinvent contract analysis — we place its verdict where the buy
// happens and add our own scoring on top.
const GOPLUS = "https://api.gopluslabs.io/api/v1/token_security/8453";

const flag = (v: unknown) => v === "1" || v === 1;
const num = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : Number(v));
const DEAD = /^0x0{40}$|dead/i;

export async function fetchSecurity(address: `0x${string}`): Promise<TokenSecurity> {
  const r = await fetch(`${GOPLUS}?contract_addresses=${address}`, {
    headers: { accept: "application/json" }, cache: "no-store",
  });
  if (!r.ok) throw new Error(`Security provider error (${r.status}).`);
  const j = await r.json();
  const rec = j?.result?.[address.toLowerCase()];
  if (!rec) throw new Error("No data for this token on Base — is it a Base ERC-20?");

  const owner = String(rec.owner_address || "").toLowerCase();
  const lpLocked = Array.isArray(rec.lp_holders) &&
    rec.lp_holders.some((h: { is_locked?: number; address?: string }) =>
      h.is_locked === 1 || DEAD.test(h.address || ""));

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
    lpLocked,
    transferPausable: flag(rec.transfer_pausable),
    isInDex: flag(rec.is_in_dex),
  };
}
