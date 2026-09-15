import { describe, it, expect } from "vitest";
import { toBaseUnits, fromBaseUnits, meets } from "../src/lib/format";

describe("units", () => {
  it("converts human -> base units", () => {
    expect(toBaseUnits("1", 18)).toBe("1000000000000000000");
    expect(toBaseUnits("1.5", 6)).toBe("1500000");
    expect(toBaseUnits("100", 18)).toBe("100000000000000000000");
  });
  it("round-trips and trims", () => {
    expect(fromBaseUnits("1500000", 6)).toBe("1.5");
    expect(fromBaseUnits("1000000000000000000", 18)).toBe("1");
  });
  it("rejects junk", () => {
    expect(() => toBaseUnits("abc", 18)).toThrow();
    expect(() => toBaseUnits("-5", 18)).toThrow();
  });
  it("meets threshold", () => {
    expect(meets(100n, "100")).toBe(true);
    expect(meets(99n, "100")).toBe(false);
    expect(meets(101n, "100")).toBe(true);
  });
});
