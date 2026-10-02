export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** "2023 MG Hector Plus Sharp Pro CVT" → "2023-mg-hector-plus-sharp-pro-cvt-delhi" */
export function carSlug(title: string, city = "delhi"): string {
  const base = slugify(title);
  return city && !base.endsWith(`-${city}`) ? `${base}-${city}` : base;
}

/** Appends -2, -3… until `isTaken` returns false. */
export async function uniqueSlug(base: string, isTaken: (slug: string) => Promise<boolean>): Promise<string> {
  let slug = base;
  for (let i = 2; await isTaken(slug); i++) slug = `${base}-${i}`;
  return slug;
}

export function carTitle(p: { year: number; make: string; model: string; variant?: string | null }): string {
  return [p.year, p.make, p.model, p.variant].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

/** "DL3CAB1234" → "DL 3C ••34" */
export function maskRegNumber(reg: string): string {
  const r = reg.replace(/[\s-]/g, "").toUpperCase();
  const m = r.match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/);
  if (!m) return r.length > 4 ? `${r.slice(0, 2)} ••${r.slice(-2)}` : "••";
  return `${m[1]} ${m[2]}${m[3] ? m[3][0] : ""} ••${m[4].slice(-2)}`;
}
