/** Subset of a token-security report we score on. All GoPlus fields arrive as
 *  strings ("0"/"1" or decimal strings); we normalize on the way in. */
export interface TokenSecurity {
  address: `0x${string}`;
  name?: string;
  symbol?: string;
  isOpenSource?: boolean;       // verified source
  isHoneypot?: boolean;         // can't sell
  isMintable?: boolean;
  isProxy?: boolean;
  canTakeBackOwnership?: boolean;
  hiddenOwner?: boolean;
  selfdestruct?: boolean;
  ownerRenounced?: boolean;     // owner == 0x0 / dead
  buyTax?: number;              // 0..1
  sellTax?: number;             // 0..1
  holderCount?: number;
  lpHolderCount?: number;
  lpLocked?: boolean;           // any LP locked/burned
  transferPausable?: boolean;
  isInDex?: boolean;
}

export type RiskBand = "safe" | "caution" | "high-risk" | "critical";

export interface ScoreResult {
  address: `0x${string}`;
  name?: string;
  symbol?: string;
  score: number;                // 0..100
  band: RiskBand;
  flags: string[];              // human-readable red flags, worst first
  positives: string[];         // reassuring signals
}
