// Role → capability matrix from BRIEF §16.1. Every server action checks `can()`.

export const ROLES = ["owner", "manager", "sales", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const CAPABILITIES = [
  "dashboard.view",
  "cars.view",
  "cars.edit", // add / edit (sales: drafts only — enforced in actions)
  "cars.publish", // publish / unpublish / reserve / sold / archive / feature
  "cars.delete", // soft delete + restore
  "cars.purge", // permanent delete from Trash
  "cars.viewCost", // purchase price, refurb cost, margin
  "leads.viewAll",
  "leads.viewOwn",
  "leads.edit",
  "leads.assign",
  "content.edit",
  "settings.edit",
  "users.manage",
  "audit.view",
  "export",
] as const;
export type Capability = (typeof CAPABILITIES)[number];

const MATRIX: Record<Role, readonly Capability[]> = {
  owner: CAPABILITIES,
  manager: [
    "dashboard.view", "cars.view", "cars.edit", "cars.publish", "cars.delete", "cars.viewCost",
    "leads.viewAll", "leads.viewOwn", "leads.edit", "leads.assign", "content.edit",
  ],
  sales: ["dashboard.view", "cars.view", "cars.edit", "leads.viewOwn", "leads.edit"],
  viewer: ["dashboard.view", "cars.view", "leads.viewAll"],
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function can(role: string | null | undefined, capability: Capability): boolean {
  return !!role && isRole(role) && MATRIX[role].includes(capability);
}

/** Sales may save drafts but not change a car into a public status. */
export function canSetStatus(role: string, status: string): boolean {
  if (status === "draft") return can(role, "cars.edit");
  return can(role, "cars.publish");
}

export const ROLE_LABELS: Record<Role, string> = { owner: "Owner", manager: "Manager", sales: "Sales", viewer: "Viewer" };
