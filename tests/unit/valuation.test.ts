import { describe, expect, it } from "vitest";
import { indicativeValuation } from "@/lib/valuation";

const now = new Date("2026-10-02");

describe("indicative valuation (DEMO logic)", () => {
  it("returns an ordered, rounded range", () => {
    const v = indicativeValuation({ make: "Hyundai", bodyType: "Compact SUV", mfgYear: 2021, owners: 1, kmRange: "25,000–50,000", state: "DL", fuel: "Petrol" }, now);
    expect(v.min).toBeLessThan(v.max);
    expect(v.min % 5000).toBe(0);
  });
  it("older and more-owner cars are worth less", () => {
    const base = { make: "Tata", bodyType: "SUV", owners: 1, kmRange: "25,000–50,000", state: "DL", fuel: "Petrol" };
    const newer = indicativeValuation({ ...base, mfgYear: 2023 }, now);
    expect(indicativeValuation({ ...base, mfgYear: 2018 }, now).max).toBeLessThan(newer.max);
    expect(indicativeValuation({ ...base, mfgYear: 2023, owners: 3 }, now).max).toBeLessThan(newer.max);
  });
  it("explains NCR diesel age limits", () => {
    const v = indicativeValuation({ make: "Mahindra", bodyType: "SUV", mfgYear: 2015, owners: 1, kmRange: "75,000–1,00,000", state: "DL", fuel: "Diesel" }, now);
    expect(v.notes.join(" ")).toMatch(/diesel/i);
  });
});
