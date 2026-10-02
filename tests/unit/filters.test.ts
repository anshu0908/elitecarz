import { describe, expect, it } from "vitest";
import { applyFilters, EMPTY_FILTERS, filtersToParams, parseFilters, similarCars } from "@/lib/filters";
import type { PublicCar } from "@/lib/types";

const car = (p: Partial<PublicCar>): PublicCar => ({
  id: "x", slug: "x", stockNo: null, status: "published", title: "t", make: "Tata", model: "M", variant: "", year: 2022, registrationYear: 2022,
  fuel: "Diesel", transmission: "Automatic", bodyType: "SUV", kmDriven: 30000, owners: 1, color: null, seats: 5, rto: "DL", regNumberMasked: null,
  insuranceType: null, insuranceValidTill: null, priceInr: 10_00_000, tcsApplicable: true, warrantyIncluded: false, warrantyMonths: null, warrantyKm: null,
  warrantyNote: null, description: null, highlights: [], features: [], disclosures: [], videoUrl: null, featured: false, badge: null, images: [],
  heroImage: null, photoCount: 0, demoFields: [], views: 0, publishedAt: "2026-09-01", soldAt: null, ...p,
});

const cars = [
  car({ id: "a", priceInr: 7_00_000, transmission: "Manual", make: "Ford", bodyType: "Compact SUV" }),
  car({ id: "b", priceInr: 14_75_000, transmission: "CVT", make: "MG", rto: "HR03" }),
  car({ id: "c", priceInr: 20_00_000, owners: 2, publishedAt: "2026-09-20" }),
  car({ id: "d", priceInr: 15_00_000, status: "sold" }),
];

describe("inventory filters", () => {
  it("groups CVT/DCT/AMT under Automatic", () => {
    expect(applyFilters(cars, { ...EMPTY_FILTERS, trans: ["Automatic"] }).map((c) => c.id)).not.toContain("a");
  });
  it("filters by budget, owners and RTO state prefix", () => {
    expect(applyFilters(cars, { ...EMPTY_FILTERS, maxPrice: 15_00_000, minPrice: 10_00_000 }).map((c) => c.id)).toEqual(["b", "d"]);
    expect(applyFilters(cars, { ...EMPTY_FILTERS, owners: 1 }).map((c) => c.id)).not.toContain("c");
    expect(applyFilters(cars, { ...EMPTY_FILTERS, rto: ["HR"] }).map((c) => c.id)).toEqual(["b"]);
  });
  it("sorts sold cars last", () => {
    expect(applyFilters(cars, { ...EMPTY_FILTERS, sort: "price_desc" }).map((c) => c.id).at(-1)).toBe("d");
  });
  it("round-trips through URL params", () => {
    const f = { ...EMPTY_FILTERS, make: ["Tata", "MG"], maxPrice: 10_00_000, sort: "km_asc" as const, q: "safari" };
    expect(parseFilters(filtersToParams(f))).toEqual(f);
  });
  it("ignores junk params", () => {
    expect(parseFilters(new URLSearchParams("min=abc&sort=evil"))).toMatchObject({ minPrice: null, sort: "newest" });
  });
  it("similar cars stay within the price band and exclude sold", () => {
    const sim = similarCars(cars, cars[1]).map((c) => c.id);
    expect(sim).not.toContain("d");
    expect(sim).not.toContain("a"); // ₹7 L is more than 35% away from ₹14.75 L
  });
});
