// Inventory filtering/sorting — pure, shared by the inventory page (client) and
// landing pages (server). Filters round-trip through URL search params.
import type { PublicCar } from "@/lib/types";

export type SortKey = "newest" | "price_asc" | "price_desc" | "km_asc" | "year_desc";
export const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest first",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  km_asc: "Kilometres: lowest",
  year_desc: "Year: newest",
};

export type Filters = {
  q: string;
  minPrice: number | null;
  maxPrice: number | null;
  make: string[];
  body: string[];
  fuel: string[];
  trans: string[];
  owners: number | null; // max owners
  minYear: number | null;
  maxKm: number | null;
  rto: string[];
  sort: SortKey;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  minPrice: null,
  maxPrice: null,
  make: [],
  body: [],
  fuel: [],
  trans: [],
  owners: null,
  minYear: null,
  maxKm: null,
  rto: [],
  sort: "newest",
};

const num = (v: string | null) => (v && /^\d+$/.test(v) ? Number(v) : null);
const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

export function parseFilters(params: URLSearchParams | Record<string, string | string[] | undefined>): Filters {
  const get = (k: string): string | null => {
    if (params instanceof URLSearchParams) return params.get(k);
    const v = params[k];
    return Array.isArray(v) ? v[0] ?? null : v ?? null;
  };
  const sort = get("sort");
  return {
    q: get("q") ?? "",
    minPrice: num(get("min")),
    maxPrice: num(get("max")),
    make: list(get("make")),
    body: list(get("body")),
    fuel: list(get("fuel")),
    trans: list(get("trans")),
    owners: num(get("owners")),
    minYear: num(get("year")),
    maxKm: num(get("km")),
    rto: list(get("rto")),
    sort: sort && sort in SORT_LABELS ? (sort as SortKey) : "newest",
  };
}

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.minPrice != null) p.set("min", String(f.minPrice));
  if (f.maxPrice != null) p.set("max", String(f.maxPrice));
  if (f.make.length) p.set("make", f.make.join(","));
  if (f.body.length) p.set("body", f.body.join(","));
  if (f.fuel.length) p.set("fuel", f.fuel.join(","));
  if (f.trans.length) p.set("trans", f.trans.join(","));
  if (f.owners != null) p.set("owners", String(f.owners));
  if (f.minYear != null) p.set("year", String(f.minYear));
  if (f.maxKm != null) p.set("km", String(f.maxKm));
  if (f.rto.length) p.set("rto", f.rto.join(","));
  if (f.sort !== "newest") p.set("sort", f.sort);
  return p;
}

/** Manual / Automatic grouping so "Automatic" includes CVT, DCT, AMT. */
export function transmissionGroup(t: string): "Manual" | "Automatic" {
  return t === "Manual" || t === "iMT" ? "Manual" : "Automatic";
}

export function applyFilters(cars: PublicCar[], f: Filters): PublicCar[] {
  const q = f.q.trim().toLowerCase();
  const out = cars.filter((c) => {
    if (q && !`${c.title} ${c.make} ${c.model} ${c.bodyType ?? ""} ${c.fuel} ${c.color ?? ""}`.toLowerCase().includes(q)) return false;
    if (f.minPrice != null && c.priceInr < f.minPrice) return false;
    if (f.maxPrice != null && c.priceInr > f.maxPrice) return false;
    if (f.make.length && !f.make.includes(c.make)) return false;
    if (f.body.length && !f.body.includes(c.bodyType ?? "")) return false;
    if (f.fuel.length && !f.fuel.includes(c.fuel)) return false;
    if (f.trans.length && !f.trans.includes(transmissionGroup(c.transmission))) return false;
    if (f.owners != null && (c.owners ?? 99) > f.owners) return false;
    if (f.minYear != null && c.year < f.minYear) return false;
    if (f.maxKm != null && (c.kmDriven ?? Infinity) > f.maxKm) return false;
    if (f.rto.length && !f.rto.includes((c.rto ?? "").slice(0, 2).toUpperCase())) return false;
    return true;
  });
  return sortCars(out, f.sort);
}

export function sortCars(cars: PublicCar[], sort: SortKey): PublicCar[] {
  const soldLast = (a: PublicCar, b: PublicCar) => Number(a.status === "sold") - Number(b.status === "sold");
  const by: Record<SortKey, (a: PublicCar, b: PublicCar) => number> = {
    newest: (a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
    price_asc: (a, b) => a.priceInr - b.priceInr,
    price_desc: (a, b) => b.priceInr - a.priceInr,
    km_asc: (a, b) => (a.kmDriven ?? Infinity) - (b.kmDriven ?? Infinity),
    year_desc: (a, b) => b.year - a.year,
  };
  return [...cars].sort((a, b) => soldLast(a, b) || by[sort](a, b));
}

export function countActive(f: Filters): number {
  return (
    (f.q ? 1 : 0) +
    (f.minPrice != null || f.maxPrice != null ? 1 : 0) +
    f.make.length + f.body.length + f.fuel.length + f.trans.length + f.rto.length +
    (f.owners != null ? 1 : 0) + (f.minYear != null ? 1 : 0) + (f.maxKm != null ? 1 : 0)
  );
}

/** Same body type, price within ±35%, excluding the car itself and sold cars. */
export function similarCars(all: PublicCar[], car: PublicCar, limit = 4): PublicCar[] {
  return all
    .filter((c) => c.id !== car.id && c.status !== "sold")
    .map((c) => {
      const priceGap = Math.abs(c.priceInr - car.priceInr) / car.priceInr;
      const score = priceGap + (c.bodyType === car.bodyType ? 0 : 0.5) + (c.make === car.make ? -0.1 : 0);
      return { c, score, priceGap };
    })
    .filter((x) => x.priceGap <= 0.35)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.c);
}

export const BUDGET_PRESETS = [
  { label: "Under ₹8 L", max: 8_00_000 },
  { label: "₹8–12 L", min: 8_00_000, max: 12_00_000 },
  { label: "₹12–18 L", min: 12_00_000, max: 18_00_000 },
  { label: "Above ₹18 L", min: 18_00_000 },
] as const;
