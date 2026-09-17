import { describe, it, expect } from "vitest";
import { parseSecurity } from "../src/lib/security";
import { scoreToken } from "../src/lib/score";
import aicc from "./fixtures/aicc-goplus.json";

const AICC = "0x66a3c2fa3e467aa586e90912f977e648589cabaf" as const;

describe("parseSecurity", () => {
  it("AICC: a 0.00% zero-address LP entry is not locked liquidity", () => {
    const s = parseSecurity(AICC, aicc.record);
    expect(s.lpLockedShare).toBeLessThan(0.01);
    expect(s.lpLocked).toBe(false);
    expect(s.ownerRenounced).toBe(true);   // what GoPlus reports — the fake renounce
    expect(s.buyTax).toBeUndefined();      // "" from GoPlus is unknown, not zero
  });
  it("no LP holder data is unknown, not unlocked", () => {
    const s = parseSecurity(AICC, { token_symbol: "ZORA-COIN", is_open_source: "1" });
    expect(s.lpLocked).toBeUndefined();
    expect(s.lpLockedShare).toBeUndefined();
  });
  it("LP holders from a minor LP-token pool don't speak for liquidity held in v3/v4 (DEGEN)", () => {
    const s = parseSecurity(AICC, {
      lp_holders: [{ address: "0x66bdc08a0db3a83d374670a57aa8ecd5b51b55e5", percent: "0.52", is_locked: 0 }],
      dex: [
        { liquidity_type: "UniV3", liquidity: "216712" }, { liquidity_type: "UniV3", liquidity: "17660" },
        { liquidity_type: "UniV4", liquidity: "2395" }, { liquidity_type: "UniV2", liquidity: "352" },
      ],
    });
    expect(s.lpLocked).toBeUndefined();
  });
  it("an address that merely contains 'dead' is not a burn address", () => {
    const s = parseSecurity(AICC, { lp_holders: [
      { address: "0x1234dead5678000000000000000000000000beef", percent: "1", is_locked: 0 },
    ] });
    expect(s.lpLocked).toBe(false);
    const burned = parseSecurity(AICC, { lp_holders: [
      { address: "0x000000000000000000000000000000000000dEaD", percent: "0.95", is_locked: 0 },
    ] });
    expect(burned.lpLocked).toBe(true);
  });
});

describe("AICC end to end (GoPlus record + the onchain facts read 2026-09-17)", () => {
  const r = scoreToken({
    ...parseSecurity(AICC, aicc.record),
    phantomBalance: true, upgradeable: true,
    upgradeController: "0x3Cd0dCabBc05b0a89147D265b1401691E69ad1Ec", upgradeControllerIsWallet: true,
  });
  it("is critical, led by the fake balances", () => {
    expect(r.band).toBe("critical");
    expect(r.flags[0]).toMatch(/fake balances/i);
    expect(r.flags).toContain("Liquidity can be pulled (0% locked/burned)");
  });
  it("gives none of the reassurances it used to (owner renounced, LP locked, no tax)", () => {
    expect(r.positives).toEqual([]);
  });
});
