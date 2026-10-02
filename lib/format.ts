// Indian number/currency formatting helpers. Pure — safe on client and server.

const inrFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹14,75,000 */
export function formatInr(amount: number): string {
  return `₹${inrFormatter.format(Math.round(amount))}`;
}

/** ₹14.75 L / ₹1.2 Cr / ₹85,000 */
export function formatLakh(amount: number): string {
  if (amount >= 1_00_00_000) return `₹${trim(amount / 1_00_00_000)} Cr`;
  if (amount >= 1_00_000) return `₹${trim(amount / 1_00_000)} L`;
  return formatInr(amount);
}

function trim(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, "");
}

/** 49,000 km */
export function formatKm(km: number): string {
  return `${inrFormatter.format(km)} km`;
}

/** 1st / 2nd / 3rd / 4th owner */
export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** "9711163000" or "+91 97111 63000" → "+91 97111 63000" */
export function formatPhone(raw: string): string {
  const d = normalizeIndianMobile(raw);
  if (!d) return raw;
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}

/** Returns the 10-digit Indian mobile number or null if invalid. */
export function normalizeIndianMobile(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

export function formatDate(d: Date | string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts }).format(new Date(d));
}

export function daysSince(d: Date | string, now = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(d).getTime()) / 86_400_000));
}
