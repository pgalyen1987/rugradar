import { describe, it, expect } from "vitest";
import { createPublicClient, http } from "viem";
import { base, mainnet } from "viem/chains";
import { fetchOnchain, type ChainReader } from "../src/lib/onchain";

// Hits public RPCs, so it only runs on request:  LIVE=1 npx vitest run test/onchain.live.test.ts
const baseClient = createPublicClient({ chain: base, transport: http(process.env.BASE_RPC_URL) }) as ChainReader;
const ethClient = createPublicClient({ chain: mainnet, transport: http(process.env.ETH_RPC_URL || "https://ethereum-rpc.publicnode.com") }) as ChainReader;

describe.skipIf(process.env.LIVE !== "1")("onchain facts (live)", () => {
  it("AICC on Ethereum: fake balances, upgradeable, one wallet holds the upgrade key", async () => {
    const f = await fetchOnchain("0x66a3c2fa3e467aa586e90912f977e648589cabaf", ethClient);
    expect(f.phantomBalance).toBe(true);
    expect(f.upgradeable).toBe(true);
    expect(f.upgradeController).toBe("0x3Cd0dCabBc05b0a89147D265b1401691E69ad1Ec");
    expect(f.upgradeControllerIsWallet).toBe(true);
  }, 30_000);

  it("a Zora coin on Base (Fat Vance 64) is a plain clone: honest balances, not upgradeable", async () => {
    const f = await fetchOnchain("0x0b8590d3c0b1ee6c797e184a4afbb15f8f58a46b", baseClient);
    expect(f.phantomBalance).toBe(false);
    expect(f.upgradeable).toBe(false);
  }, 30_000);

  it("USDC on Base uses the older ZeppelinOS proxy slots and is still seen as upgradeable", async () => {
    const f = await fetchOnchain("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", baseClient);
    expect(f.phantomBalance).toBe(false);
    expect(f.upgradeable).toBe(true);
  }, 30_000);
});
