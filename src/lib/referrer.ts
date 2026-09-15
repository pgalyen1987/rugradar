export const BASE_CHAIN_ID = 8453;

/** CAIP-19 asset id for a Base ERC-20, used by sdk.actions.swapToken. */
export function caip19(coin: string): string {
  return `eip155:${BASE_CHAIN_ID}/erc20:${coin}`;
}

/** The operator's referrer address (earns Zora trade-referral where wired). */
export function referrerAddress(): `0x${string}` | undefined {
  const a = process.env.NEXT_PUBLIC_REFERRER_ADDRESS;
  return a && /^0x[a-fA-F0-9]{40}$/.test(a) && !/^0x0{40}$/.test(a)
    ? (a as `0x${string}`) : undefined;
}
