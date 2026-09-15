import { parseUnits, formatUnits } from "viem";

/** Human amount ("1.5") + decimals -> base-unit string ("1500000000000000000"). */
export function toBaseUnits(amount: string, decimals: number): string {
  const clean = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(clean)) throw new Error("amount must be a non-negative number");
  return parseUnits(clean, decimals).toString();
}

/** Base-unit string -> human amount, trimmed. */
export function fromBaseUnits(wei: string, decimals: number): string {
  const s = formatUnits(BigInt(wei), decimals);
  return s.replace(/\.?0+$/, "");
}

/** Does `have` (base units) meet `need` (base units)? */
export function meets(have: bigint, need: string): boolean {
  return have >= BigInt(need);
}
