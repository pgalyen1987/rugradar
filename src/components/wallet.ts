"use client";
import { createWalletClient, createPublicClient, custom, http } from "viem";
import { base } from "viem/chains";
import { sdk } from "@farcaster/miniapp-sdk";

async function provider() {
  const p = await sdk.wallet.getEthereumProvider();
  if (!p) throw new Error("No wallet found. Open Coined it inside the Base app or a Farcaster client.");
  return p as { request: (a: unknown) => Promise<unknown> };
}

export async function connect(): Promise<`0x${string}`> {
  const wc = createWalletClient({ chain: base, transport: custom(await provider()) });
  const [addr] = await wc.requestAddresses();
  if (!addr) throw new Error("No wallet account connected.");
  return addr;
}

export async function walletClientFor(account: `0x${string}`) {
  return createWalletClient({ account, chain: base, transport: custom(await provider()) });
}

export function publicClient() {
  const rpc = process.env.NEXT_PUBLIC_BASE_RPC_URL;
  return createPublicClient({ chain: base, transport: rpc ? http(rpc) : http() });
}
