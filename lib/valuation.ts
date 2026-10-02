// Indicative trade-in range — DEMO logic only (BRIEF §12: "indicative price range (mock logic)").
// Replace with the dealer's own pricing rules or a valuation API before launch.

const SEGMENT_NEW_PRICE: Record<string, number> = {
  Hatchback: 7_50_000,
  Sedan: 12_00_000,
  "Compact SUV": 11_00_000,
  SUV: 18_00_000,
  MPV: 16_00_000,
};
const LUXURY = new Set(["BMW", "Mercedes-Benz", "Audi", "Volvo", "Lexus", "Jaguar", "Land Rover", "Porsche", "Mini"]);
const PREMIUM = new Set(["Toyota", "Jeep", "Skoda", "Volkswagen", "MG", "Kia"]);
const PREFERRED_STATES = new Set(["DL", "HR", "UP", "CH", "PB", "UK"]);
const KM_FACTOR: Record<string, number> = {
  "Under 10,000": 1.0,
  "10,000–25,000": 0.97,
  "25,000–50,000": 0.93,
  "50,000–75,000": 0.88,
  "75,000–1,00,000": 0.83,
  "Over 1,00,000": 0.74,
};

export type ValuationInput = { make: string; bodyType?: string; mfgYear: number; owners: number; kmRange: string; state: string; fuel: string };

export function indicativeValuation(input: ValuationInput, now = new Date()): { min: number; max: number; notes: string[] } {
  const notes: string[] = [];
  let ref = SEGMENT_NEW_PRICE[input.bodyType ?? ""] ?? 10_00_000;
  if (LUXURY.has(input.make)) ref *= 3.2;
  else if (PREMIUM.has(input.make)) ref *= 1.15;

  const age = Math.max(0, now.getFullYear() - input.mfgYear);
  // ~15% first year, then ~10% per year, floored at 15% of new.
  let v = ref * Math.max(0.15, 0.85 * Math.pow(0.9, Math.max(0, age - 1)));
  v *= KM_FACTOR[input.kmRange] ?? 0.9;
  v *= input.owners <= 1 ? 1 : input.owners === 2 ? 0.93 : 0.82;
  if (!PREFERRED_STATES.has(input.state)) {
    v *= 0.9;
    notes.push("Out-of-region registration usually needs an NOC, which affects the offer.");
  }
  if (input.fuel === "Diesel" && age >= 8) {
    v *= 0.8;
    notes.push("Older diesels face Delhi NCR age limits, which lowers resale value.");
  }
  if (input.owners >= 3) notes.push("Third-owner cars are harder to resell; we'll be upfront about it.");

  const round = (n: number) => Math.round(n / 5_000) * 5_000;
  return { min: round(v * 0.93), max: round(v * 1.05), notes };
}
