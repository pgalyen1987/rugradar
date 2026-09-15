import { NextRequest, NextResponse } from "next/server";
import { cleanAddress } from "@/lib/validate";
import { fetchSecurity } from "@/lib/security";
import { scoreToken } from "@/lib/score";

export const runtime = "nodejs";

// GET /api/score?address=0x… → { score, band, flags, positives }.
// Public + CORS-open so any mini app can embed the score. This is the wedge:
// the safety read, everywhere the buy happens.
export async function GET(req: NextRequest) {
  try {
    const address = cleanAddress(req.nextUrl.searchParams.get("address") || "");
    const result = scoreToken(await fetchSecurity(address));
    return NextResponse.json(result, { headers: { "access-control-allow-origin": "*" } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "bad request" },
      { status: 400, headers: { "access-control-allow-origin": "*" } });
  }
}
