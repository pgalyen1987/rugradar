import { createPublicClient, getAddress, http, keccak256, parseAbi, stringToHex, type Address, type Hex, type PublicClient } from "viem";
import { base } from "viem/chains";

// Facts RugRadar reads from the chain itself, for scams a security API does not flag.
// The case that prompted this (AICC, 2026-09-17) passed GoPlus with no honeypot flag, an
// empty owner and "LP locked": it was an upgradeable proxy controlled by one wallet whose
// balanceOf reported 17,500 tokens for every address, then mass-emitted fake Transfer events
// so the tokens appeared in thousands of wallets. Selling them reverted.

export interface OnchainFacts {
  phantomBalance?: boolean;
  upgradeable?: boolean;
  upgradeController?: Address;
  upgradeControllerIsWallet?: boolean;
}

/** The slice of a viem client we use, so tests can pass a client for any chain. */
export type ChainReader = Pick<PublicClient, "getStorageAt" | "getCode" | "readContract">;

// Addresses no one has a key for: last 20 bytes of keccak256("rugradar:never-used:N").
// An honest token reports 0 for them; a fake-airdrop token reports its bait amount.
export const PROBES: Address[] = [1, 2].map((i) => getAddress(`0x${keccak256(stringToHex(`rugradar:never-used:${i}`)).slice(-40)}`));

const SLOT = {
  implementation: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc", // EIP-1967
  admin: "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103",          // EIP-1967
  beacon: "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50",         // EIP-1967
  zosImplementation: "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3", // ZeppelinOS (USDC)
  zosAdmin: "0x10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b",
} as const satisfies Record<string, Hex>;

const ERC20 = parseAbi(["function balanceOf(address) view returns (uint256)"]);
const OWNED = parseAbi(["function owner() view returns (address)"]);
const ZERO = /^0x0*$/;

const slotAddress = (word: Hex | undefined): Address | undefined => {
  if (!word || ZERO.test(word)) return undefined;
  const a = `0x${word.slice(-40)}`;
  return ZERO.test(a) ? undefined : getAddress(a);
};

/** No code, or an EIP-7702 delegation (0xef0100…), is still one private key. */
async function isWallet(client: ChainReader, address: Address): Promise<boolean> {
  const code = await client.getCode({ address });
  return !code || code === "0x" || code.toLowerCase().startsWith("0xef0100");
}

async function ownerOf(client: ChainReader, address: Address): Promise<Address | undefined> {
  try {
    const o = await client.readContract({ address, abi: OWNED, functionName: "owner" });
    return ZERO.test(o) ? undefined : o;
  } catch { return undefined; }
}

const defaultClient = (): ChainReader => createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL || undefined, { timeout: 8_000, retryCount: 1 }),
});

/** Never throws: a fact that could not be read stays undefined, which the scorer ignores. */
export async function fetchOnchain(token: Address, client: ChainReader = defaultClient()): Promise<OnchainFacts> {
  const read = async (): Promise<OnchainFacts> => {
    const slot = (s: Hex) => client.getStorageAt({ address: token, slot: s }).catch(() => undefined);
    const [balances, impl, admin, beacon, zosImpl, zosAdmin] = await Promise.all([
      Promise.all(PROBES.map((p) =>
        client.readContract({ address: token, abi: ERC20, functionName: "balanceOf", args: [p] }).catch(() => undefined))),
      slot(SLOT.implementation), slot(SLOT.admin), slot(SLOT.beacon), slot(SLOT.zosImplementation), slot(SLOT.zosAdmin),
    ]);

    const known = balances.filter((b): b is bigint => typeof b === "bigint");
    const facts: OnchainFacts = { phantomBalance: known.length ? known.some((b) => b > 0n) : undefined };

    const beaconAddress = slotAddress(beacon);
    facts.upgradeable = !!(slotAddress(impl) || slotAddress(zosImpl) || beaconAddress);
    if (!facts.upgradeable) return facts;

    // Who can swap the code: a transparent proxy's admin (or, when that admin is a ProxyAdmin
    // contract, its owner); a beacon's owner; for UUPS, the token's own owner.
    const adminAddress = slotAddress(admin) ?? slotAddress(zosAdmin);
    let controller: Address | undefined;
    if (adminAddress) controller = (await isWallet(client, adminAddress)) ? adminAddress : (await ownerOf(client, adminAddress)) ?? adminAddress;
    else controller = await ownerOf(client, beaconAddress ?? token);

    if (controller) {
      facts.upgradeController = controller;
      facts.upgradeControllerIsWallet = await isWallet(client, controller).catch(() => undefined);
    }
    return facts;
  };

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<OnchainFacts>((resolve) => { timer = setTimeout(() => resolve({}), 10_000); });
  return Promise.race([read().catch(() => ({})), timeout]).finally(() => clearTimeout(timer));
}
