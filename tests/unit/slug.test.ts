import { describe, expect, it } from "vitest";
import { carSlug, carTitle, maskRegNumber, slugify, uniqueSlug } from "@/lib/slug";

describe("slugs", () => {
  it("slugifies titles with brackets and symbols", () => {
    expect(slugify("2021 Hyundai Creta SX (O) 1.4 Turbo")).toBe("2021-hyundai-creta-sx-o-1-4-turbo");
    expect(slugify("  Jeep Compass S(O2) AT ")).toBe("jeep-compass-so2-at");
  });
  it("adds the city for local SEO, once", () => {
    expect(carSlug("2023 MG Hector Plus Sharp Pro CVT")).toBe("2023-mg-hector-plus-sharp-pro-cvt-delhi");
    expect(carSlug("2023 MG Hector delhi")).toBe("2023-mg-hector-delhi");
  });
  it("makes slugs unique", async () => {
    const taken = new Set(["a", "a-2"]);
    expect(await uniqueSlug("a", async (s) => taken.has(s))).toBe("a-3");
    expect(await uniqueSlug("b", async (s) => taken.has(s))).toBe("b");
  });
  it("builds titles without gaps", () => {
    expect(carTitle({ year: 2024, make: "Tata", model: "Safari", variant: null })).toBe("2024 Tata Safari");
  });
  it("masks registration numbers", () => {
    expect(maskRegNumber("DL 3C AB 1234")).toBe("DL 3C ••34");
    expect(maskRegNumber("HR26DK8337")).toBe("HR 26D ••37");
    expect(maskRegNumber("DL3CAB1234")).not.toContain("1234");
  });
});
