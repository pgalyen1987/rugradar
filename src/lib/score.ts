import type { RiskBand, ScoreResult, TokenSecurity } from "./types";

// Pure scoring: raw token-security facts → a 0-100 score, a band, and the
// human-readable flags behind it. No network here so it is fully testable.
// Philosophy: a honeypot or a self-destruct is disqualifying (score floors);
// everything else is weighted deductions. We never invent certainty — missing
// fields don't count against a coin, they just don't reassure.

interface Rule {
  when: (s: TokenSecurity) => boolean | undefined;
  penalty: number;              // points off (100 = instant fail)
  flag: string;
}

const RULES: Rule[] = [
  { when: (s) => s.isHoneypot, penalty: 100, flag: "Honeypot — buyers can't sell" },
  { when: (s) => s.selfdestruct, penalty: 100, flag: "Contract can self-destruct" },
  { when: (s) => s.hiddenOwner, penalty: 60, flag: "Hidden owner" },
  { when: (s) => s.canTakeBackOwnership, penalty: 45, flag: "Owner can reclaim ownership" },
  { when: (s) => s.transferPausable, penalty: 35, flag: "Transfers can be paused" },
  { when: (s) => s.isMintable, penalty: 30, flag: "Supply is mintable (dilution risk)" },
  { when: (s) => (s.sellTax ?? 0) > 0.10, penalty: 40, flag: "High sell tax (>10%)" },
  { when: (s) => (s.buyTax ?? 0) > 0.10, penalty: 20, flag: "High buy tax (>10%)" },
  { when: (s) => s.isOpenSource === false, penalty: 25, flag: "Source not verified" },
  { when: (s) => s.ownerRenounced === false && !s.hiddenOwner, penalty: 15, flag: "Owner not renounced" },
  { when: (s) => s.lpLocked === false, penalty: 25, flag: "Liquidity not locked/burned" },
  { when: (s) => s.holderCount !== undefined && s.holderCount < 25, penalty: 15, flag: "Very few holders" },
];

function band(score: number, honeypotOrSelfdestruct: boolean): RiskBand {
  if (honeypotOrSelfdestruct || score <= 20) return "critical";
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
      flags.push(r.flag);
      if (r.penalty >= 100) hardFail = true;
    }
  }
  score = Math.max(0, Math.min(100, score));

  const positives: string[] = [];
  if (s.isOpenSource) positives.push("Source verified");
  if (s.ownerRenounced) positives.push("Owner renounced");
  if (s.lpLocked) positives.push("Liquidity locked/burned");
  if (!s.isHoneypot && (s.sellTax ?? 0) === 0 && (s.buyTax ?? 0) === 0) positives.push("No buy/sell tax");

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
