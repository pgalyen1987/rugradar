import { describe, it, expect } from "vitest";
import { scoreToken } from "../src/lib/score";
import type { TokenSecurity } from "../src/lib/types";

const base: TokenSecurity = {
  address: "0x0000000000000000000000000000000000000001",
  isOpenSource: true, isHoneypot: false, ownerRenounced: true, lpLocked: true,
  buyTax: 0, sellTax: 0, holderCount: 500,
};

describe("scoreToken", () => {
  it("clean coin scores safe", () => {
    const r = scoreToken(base);
    expect(r.band).toBe("safe");
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(r.flags).toHaveLength(0);
    expect(r.positives).toContain("Owner renounced");
  });
  it("honeypot is critical with score 0", () => {
    const r = scoreToken({ ...base, isHoneypot: true });
    expect(r.band).toBe("critical");
    expect(r.score).toBe(0);
    expect(r.flags[0]).toMatch(/honeypot/i);
  });
  it("taxes + unverified + mintable stack deductions", () => {
    const r = scoreToken({ ...base, isOpenSource: false, isMintable: true, sellTax: 0.25, ownerRenounced: false });
    expect(r.score).toBeLessThan(80);
    expect(r.flags).toContain("Source not verified");
    expect(r.flags).toContain("High sell tax (>10%)");
  });
});

describe("scoreToken: onchain facts", () => {
  it("fake balances are critical and disqualify the tax reassurance", () => {
    const r = scoreToken({ ...base, phantomBalance: true });
    expect(r.band).toBe("critical");
    expect(r.flags[0]).toMatch(/fake balances/i);
    expect(r.positives).not.toContain("No buy/sell tax");
  });
  it("one wallet controlling upgrades is flagged, and a renounced owner stops reassuring", () => {
    const r = scoreToken({ ...base, upgradeable: true, upgradeControllerIsWallet: true });
    expect(r.flags).toContain("One wallet can replace the contract's code at any time");
    expect(r.flags).toContain("Owner looks renounced, but a wallet still controls upgrades");
    expect(r.positives).not.toContain("Owner renounced");
    expect(r.band).not.toBe("safe");
  });
  it("a verified token that admits its owner keeps a wallet upgrade key as a small flag (USDC)", () => {
    const r = scoreToken({ ...base, ownerRenounced: false, upgradeable: true, upgradeControllerIsWallet: true });
    expect(r.flags).toContain("One wallet can replace the contract's code at any time");
    expect(r.band).toBe("safe");
  });
  it("renounced-looking + wallet upgrade key is high-risk even with verified code", () => {
    expect(scoreToken({ ...base, upgradeable: true, upgradeControllerIsWallet: true }).band).toBe("high-risk");
  });
  it("upgrades held by a contract (multisig/timelock) are a milder flag", () => {
    const r = scoreToken({ ...base, upgradeable: true, upgradeControllerIsWallet: false });
    expect(r.flags).toEqual(["Upgradeable — the contract's code can be replaced"]);
    expect(r.positives).toContain("Owner renounced");
  });
  it("the onchain read overrides GoPlus's proxy flag; the flag only fills in when the read failed", () => {
    expect(scoreToken({ ...base, isProxy: true, upgradeable: false }).flags).toHaveLength(0);
    expect(scoreToken({ ...base, isProxy: true }).flags).toContain("Upgradeable — the contract's code can be replaced");
  });
});

describe("scoreToken: liquidity and unknowns", () => {
  it("weighs locked liquidity by share", () => {
    const low = scoreToken({ ...base, lpLocked: false, lpLockedShare: 0.3 });
    expect(low.flags).toContain("Liquidity can be pulled (30% locked/burned)");
    const mid = scoreToken({ ...base, lpLocked: false, lpLockedShare: 0.75 });
    expect(mid.flags).toEqual(["Some liquidity can be pulled (75% locked/burned)"]);
    expect(mid.score).toBe(90);
  });
  it("no LP data (Uniswap v4, Zora coins) neither counts against nor reassures", () => {
    const r = scoreToken({ ...base, lpLocked: undefined });
    expect(r.flags).toHaveLength(0);
    expect(r.positives).not.toContain("Liquidity locked/burned");
  });
  it("unknown taxes don't earn 'No buy/sell tax'", () => {
    expect(scoreToken({ ...base, buyTax: undefined, sellTax: undefined }).positives).not.toContain("No buy/sell tax");
  });
});
