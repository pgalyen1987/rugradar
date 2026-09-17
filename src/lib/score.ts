import type { RiskBand, ScoreResult, TokenSecurity } from "./types";

// Pure scoring: raw token-security facts → a 0-100 score, a band, and the
// human-readable flags behind it. No network here so it is fully testable.
// Philosophy: a honeypot, a self-destruct or fake balances are disqualifying (score floors);
// everything else is weighted deductions. We never invent certainty — missing
// fields don't count against a coin, they just don't reassure.

interface Rule {
  when: (s: TokenSecurity) => boolean | undefined;
  penalty: number;              // points off (100 = instant fail)
  flag: string | ((s: TokenSecurity) => string);
}

const pct = (share: number) => `${Math.round(share * 100)}%`;

/** Owner reads as renounced, yet one wallet can still replace the whole contract. */
const fakeRenounce = (s: TokenSecurity) =>
  s.ownerRenounced === true && s.upgradeable === true && s.upgradeControllerIsWallet === true;

// An upgrade key in one wallet weighs by whether the token admits its control. USDC does: a named
// owner and verified code, already counted by "Owner not renounced", so the key adds a little.
// A token that looks renounced or hides its code (AICC) is using that key as the rug.
const walletUpgrade = (s: TokenSecurity) => s.upgradeable === true && s.upgradeControllerIsWallet === true;
const admitsControl = (s: TokenSecurity) => s.ownerRenounced === false && s.isOpenSource === true;
const WALLET_UPGRADE = "One wallet can replace the contract's code at any time";

const RULES: Rule[] = [
  { when: (s) => s.phantomBalance, penalty: 100, flag: "Fake balances — wallets that never bought it show tokens (fake-airdrop scam)" },
  { when: (s) => s.isHoneypot, penalty: 100, flag: "Honeypot — buyers can't sell" },
  { when: (s) => s.selfdestruct, penalty: 100, flag: "Contract can self-destruct" },
  { when: (s) => s.hiddenOwner, penalty: 60, flag: "Hidden owner" },
  { when: (s) => s.canTakeBackOwnership, penalty: 45, flag: "Owner can reclaim ownership" },
  { when: (s) => walletUpgrade(s) && !admitsControl(s), penalty: 20, flag: WALLET_UPGRADE },
  { when: (s) => s.transferPausable, penalty: 35, flag: "Transfers can be paused" },
  { when: (s) => s.isMintable, penalty: 30, flag: "Supply is mintable (dilution risk)" },
  { when: (s) => (s.sellTax ?? 0) > 0.10, penalty: 40, flag: "High sell tax (>10%)" },
  { when: (s) => (s.buyTax ?? 0) > 0.10, penalty: 20, flag: "High buy tax (>10%)" },
  { when: (s) => s.isOpenSource === false, penalty: 25, flag: "Source not verified" },
  // Onchain proxy slots are the truth when we read them; GoPlus's flag only fills in when we couldn't.
  { when: (s) => (s.upgradeable ?? s.isProxy) && !s.upgradeControllerIsWallet, penalty: 15, flag: "Upgradeable — the contract's code can be replaced" },
  { when: fakeRenounce, penalty: 35, flag: "Owner looks renounced, but a wallet still controls upgrades" },
  { when: (s) => walletUpgrade(s) && admitsControl(s), penalty: 5, flag: WALLET_UPGRADE },
  { when: (s) => s.ownerRenounced === false && !s.hiddenOwner, penalty: 15, flag: "Owner not renounced" },
  { when: (s) => (s.lpLockedShare !== undefined ? s.lpLockedShare < 0.5 : s.lpLocked === false), penalty: 25,
    flag: (s) => (s.lpLockedShare !== undefined ? `Liquidity can be pulled (${pct(s.lpLockedShare)} locked/burned)` : "Liquidity not locked/burned") },
  { when: (s) => s.lpLockedShare !== undefined && s.lpLockedShare >= 0.5 && s.lpLockedShare < 0.9, penalty: 10,
    flag: (s) => `Some liquidity can be pulled (${pct(s.lpLockedShare!)} locked/burned)` },
  { when: (s) => s.holderCount !== undefined && s.holderCount < 25, penalty: 15, flag: "Very few holders" },
];

function band(score: number, hardFail: boolean): RiskBand {
  if (hardFail || score <= 20) return "critical";
  if (score < 50) return "high-risk";
  if (score < 80) return "caution";
  return "safe";
}

export function scoreToken(s: TokenSecurity): ScoreResult {
  let score = 100;
  const flags: string[] = [];
  let hardFail = false;
  for (const r of RULES) {
    if (r.when(s)) {
      score -= r.penalty;
      flags.push(typeof r.flag === "function" ? r.flag(s) : r.flag);
      if (r.penalty >= 100) hardFail = true;
    }
  }
  score = Math.max(0, Math.min(100, score));

  // Reassure only on facts we actually have: an empty tax field from the provider is "unknown".
  const positives: string[] = [];
  if (s.isOpenSource) positives.push("Source verified");
  if (s.ownerRenounced && !fakeRenounce(s)) positives.push("Owner renounced");
  if (s.lpLocked) positives.push("Liquidity locked/burned");
  if (!s.isHoneypot && !s.phantomBalance && s.sellTax === 0 && s.buyTax === 0) positives.push("No buy/sell tax");

  return {
    address: s.address,
    name: s.name,
    symbol: s.symbol,
    score,
    band: band(score, hardFail),
    flags,
    positives,
  };
}
