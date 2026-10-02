import { describe, expect, it } from "vitest";
import { formatInr, formatKm, formatLakh, formatPhone, normalizeIndianMobile, ordinal } from "@/lib/format";

describe("Indian formatting", () => {
  it("formats rupees with lakh grouping", () => {
    expect(formatInr(1475000)).toBe("₹14,75,000");
    expect(formatInr(26099.4)).toBe("₹26,099");
  });
  it("formats lakh / crore shorthand", () => {
    expect(formatLakh(1475000)).toBe("₹14.75 L");
    expect(formatLakh(2975000)).toBe("₹29.75 L");
    expect(formatLakh(500000)).toBe("₹5 L");
    expect(formatLakh(30800000)).toBe("₹3.08 Cr");
  });
  it("formats km and ordinals", () => {
    expect(formatKm(49000)).toBe("49,000 km");
    expect([1, 2, 3, 4, 11].map(ordinal)).toEqual(["1st", "2nd", "3rd", "4th", "11th"]);
  });
  it("validates and formats Indian mobiles", () => {
    expect(normalizeIndianMobile("+91 97111 63000")).toBe("9711163000");
    expect(normalizeIndianMobile("097111 63000")).toBe("9711163000");
    expect(normalizeIndianMobile("12345")).toBeNull();
    expect(normalizeIndianMobile("5711163000")).toBeNull();
    expect(formatPhone("9711163000")).toBe("+91 97111 63000");
  });
});
