export function cleanAddress(a?: string): `0x${string}` {
  const s = (a || "").trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(s)) throw new Error("Enter a valid 0x token address.");
  return s.toLowerCase() as `0x${string}`;
}
