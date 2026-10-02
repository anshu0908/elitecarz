// Inspection report template (BRIEF §16.4.7). This is a structural sample — the
// dealer's real 150+ point checklist replaces it once shared (BRIEF §13 Q4).

export const INSPECTION_RESULTS = ["pass", "minor", "fail", "na"] as const;
export type InspectionResult = (typeof INSPECTION_RESULTS)[number];

export const INSPECTION_TEMPLATE: { section: string; items: string[] }[] = [
  { section: "Exterior", items: ["Body panels & alignment", "Paint finish & repaint check", "Glass & windscreen", "Headlamps & tail lamps", "Bumpers", "Doors, bonnet & boot operation", "ORVMs", "Rust & corrosion", "Flood-damage signs"] },
  { section: "Interior", items: ["Seats & upholstery", "Dashboard & trims", "Steering wheel & controls", "Infotainment & speakers", "Instrument cluster warnings", "Power windows", "Central locking", "Roof lining & sunroof", "Odour & dampness"] },
  { section: "Engine", items: ["Cold start", "Idle smoothness", "Oil leaks", "Coolant level & leaks", "Belts & hoses", "Exhaust smoke", "Engine mounts", "Turbo / hybrid system"] },
  { section: "Transmission", items: ["Gear shifts", "Clutch / torque converter", "Reverse engagement", "Transmission leaks", "Drive modes"] },
  { section: "Suspension & brakes", items: ["Front suspension", "Rear suspension", "Shock absorbers", "Brake pads & discs", "Brake fluid", "Parking brake", "Steering play & alignment"] },
  { section: "Tyres", items: ["Front left tread", "Front right tread", "Rear left tread", "Rear right tread", "Spare tyre & tools", "Tyre age (DOT)"] },
  { section: "Electricals", items: ["Battery health", "Alternator output", "OBD fault codes", "Horn", "Wipers & washers", "Interior lights"] },
  { section: "AC & climate", items: ["Cooling performance", "Blower speeds", "Rear AC vents", "Heater"] },
  { section: "Safety", items: ["Airbag warning", "Seat belts", "ABS / ESP warnings", "Reverse camera / sensors", "Child-seat anchors"] },
  { section: "Documents", items: ["RC matches chassis & engine no.", "Insurance validity", "PUC", "Service records", "Pending challans", "Hypothecation / loan NOC"] },
];

export const INSPECTION_POINT_COUNT = INSPECTION_TEMPLATE.reduce((n, s) => n + s.items.length, 0);

export type InspectionItemLike = { section: string; item: string; result: string; note?: string | null };

export function summariseInspection(items: InspectionItemLike[]) {
  const bySection = new Map<string, { section: string; pass: number; minor: number; fail: number; na: number; items: InspectionItemLike[] }>();
  for (const it of items) {
    const s = bySection.get(it.section) ?? { section: it.section, pass: 0, minor: 0, fail: 0, na: 0, items: [] };
    if (it.result === "pass" || it.result === "minor" || it.result === "fail" || it.result === "na") s[it.result]++;
    s.items.push(it);
    bySection.set(it.section, s);
  }
  const sections = [...bySection.values()];
  const checked = items.filter((i) => i.result !== "na").length;
  const passed = items.filter((i) => i.result === "pass").length;
  const minor = items.filter((i) => i.result === "minor").length;
  // Score: pass = 1, minor = 0.5, fail = 0 — out of 10.
  const score = checked ? Math.round(((passed + minor * 0.5) / checked) * 100) / 10 : 0;
  return { sections, checked, passed, minor, failed: items.filter((i) => i.result === "fail").length, score };
}
