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
