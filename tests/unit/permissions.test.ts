import { describe, expect, it } from "vitest";
import { can, canSetStatus } from "@/lib/permissions";

describe("role permissions (BRIEF §16.1)", () => {
  it("only owner and manager see purchase price / margin", () => {
    expect(can("owner", "cars.viewCost")).toBe(true);
    expect(can("manager", "cars.viewCost")).toBe(true);
    expect(can("sales", "cars.viewCost")).toBe(false);
    expect(can("viewer", "cars.viewCost")).toBe(false);
  });
  it("viewer cannot edit anything", () => {
    for (const cap of ["cars.edit", "cars.publish", "cars.delete", "leads.edit", "settings.edit"] as const) expect(can("viewer", cap)).toBe(false);
  });
  it("sales can save drafts but not publish or delete", () => {
    expect(canSetStatus("sales", "draft")).toBe(true);
    expect(canSetStatus("sales", "published")).toBe(false);
    expect(canSetStatus("sales", "sold")).toBe(false);
    expect(can("sales", "cars.delete")).toBe(false);
  });
  it("only the owner purges, manages users, sees audit and exports", () => {
    for (const cap of ["cars.purge", "users.manage", "audit.view", "export", "settings.edit"] as const) {
      expect(can("owner", cap)).toBe(true);
      expect(can("manager", cap)).toBe(false);
    }
  });
  it("rejects unknown roles", () => {
    expect(can("admin", "cars.view")).toBe(false);
    expect(can(null, "cars.view")).toBe(false);
  });
});
