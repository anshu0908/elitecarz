// Guards the public/private rule (BRIEF §15.3, §23): nothing admin-only can reach public pages or APIs.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { getPublicCarBySlug, getPublicCars, publicCarSelect } from "@/lib/cars";

const PRIVATE_FIELDS = ["purchasePriceInr", "refurbCostInr", "notesInternal", "regNumber", "source", "createdById", "updatedById", "deletedAt"];
const SECRET_REG = "DL9ZZ9999";
const SECRET_NOTE = "secret-note-do-not-leak";
let draftId = "";
let liveId = "";

beforeAll(async () => {
  const base = { year: 2024, fuel: "Petrol", transmission: "Manual", priceInr: 5_00_000, purchasePriceInr: 4_11_111, refurbCostInr: 22_222, notesInternal: SECRET_NOTE, regNumber: SECRET_REG };
  draftId = (await db.car.create({ data: { ...base, slug: "leak-test-draft", title: "Leak test draft", status: "draft" } })).id;
  liveId = (await db.car.create({ data: { ...base, slug: "leak-test-live", title: "Leak test live", status: "published" } })).id;
});

afterAll(async () => {
  await db.car.deleteMany({ where: { id: { in: [draftId, liveId] } } });
});

describe("public car data", () => {
  it("the public select omits every private column", () => {
    for (const f of PRIVATE_FIELDS) expect(Object.keys(publicCarSelect)).not.toContain(f);
  });

  it("drafts, archived and deleted cars are never listed", async () => {
    const ids = (await getPublicCars()).map((c) => c.id);
    expect(ids).not.toContain(draftId);
    expect(ids).toContain(liveId);
    expect(await getPublicCarBySlug("leak-test-draft")).toBeNull();
  });

  it("published cars carry no private values", async () => {
    const detail = await getPublicCarBySlug("leak-test-live");
    expect(detail).not.toBeNull();
    const json = JSON.stringify(detail);
    for (const f of PRIVATE_FIELDS) expect(detail).not.toHaveProperty(f);
    expect(json).not.toContain(SECRET_REG);
    expect(json).not.toContain(SECRET_NOTE);
    expect(json).not.toContain("411111");
  });
});
