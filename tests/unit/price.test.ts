import { describe, expect, it } from "vitest";
import { priceBreakup } from "@/lib/price";

describe("priceBreakup", () => {
  it("adds 1% TCS above ₹10 lakh — matches the Hector listing (₹14,89,750)", () => {
    expect(priceBreakup(14_75_000)).toEqual({ carPrice: 14_75_000, tcs: 14_750, total: 14_89_750, tcsApplies: true });
  });
  it("no TCS at or below ₹10 lakh", () => {
    expect(priceBreakup(10_00_000).tcs).toBe(0);
    expect(priceBreakup(9_75_000).total).toBe(9_75_000);
  });
  it("respects a car-level TCS opt-out", () => {
    expect(priceBreakup(20_00_000, false)).toMatchObject({ tcs: 0, total: 20_00_000, tcsApplies: false });
  });
  it("rounds TCS to whole rupees", () => {
    expect(priceBreakup(10_00_050).tcs).toBe(10_001);
  });
});
