import { describe, expect, it } from "vitest";
import { calculateEmi, startingEmi } from "@/lib/emi";

describe("calculateEmi", () => {
  it("matches the reducing-balance formula for a standard car loan", () => {
    // ₹10,00,000 at 10% for 60 months — reference value from bank EMI calculators: ₹21,247.
    const r = calculateEmi({ principal: 10_00_000, annualRatePct: 10, tenureMonths: 60 });
    expect(Math.round(r.emi)).toBe(21_247);
    expect(Math.round(r.totalPayment)).toBe(Math.round(r.emi * 60));
    expect(Math.round(r.totalInterest)).toBe(Math.round(r.totalPayment - 10_00_000));
  });

  it("handles a zero interest rate", () => {
    const r = calculateEmi({ principal: 6_00_000, annualRatePct: 0, tenureMonths: 60 });
    expect(r.emi).toBe(10_000);
    expect(r.totalInterest).toBe(0);
  });

  it("returns zeros for an empty loan", () => {
    expect(calculateEmi({ principal: 0, annualRatePct: 10, tenureMonths: 60 }).emi).toBe(0);
  });

  it("is internally consistent, unlike the current site calculator (BRIEF §6A.3)", () => {
    // Current site: principal ₹11,80,000, EMI ₹22,463, 60 months, "Total Interest ₹3,32,202".
    const impliedInterest = 22_463 * 60 - 11_80_000;
    expect(impliedInterest).toBe(1_67_780); // not 3,32,202 — the old numbers don't reconcile
    const ours = calculateEmi({ principal: 11_80_000, annualRatePct: 10.5, tenureMonths: 60 });
    expect(Math.abs(ours.totalInterest - (ours.emi * 60 - 11_80_000))).toBeLessThan(0.01);
  });

  it("card EMI uses max loan %, default rate and tenure", () => {
    const expected = calculateEmi({ principal: 11_80_000, annualRatePct: 10.5, tenureMonths: 60 }).emi;
    expect(Math.round(startingEmi(14_75_000))).toBe(Math.round(expected));
  });
});
