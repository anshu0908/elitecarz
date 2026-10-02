// Shared option lists. Brands cover everything stocked (incl. Tata, Mahindra, Toyota — BRIEF §6A.2).

export const CAR_STATUSES = ["draft", "published", "reserved", "sold", "archived"] as const;
export type CarStatus = (typeof CAR_STATUSES)[number];
export const PUBLIC_STATUSES: CarStatus[] = ["published", "reserved", "sold"];

export const FUELS = ["Petrol", "Diesel", "CNG", "Petrol Hybrid", "Electric"] as const;
export const TRANSMISSIONS = ["Manual", "Automatic", "CVT", "DCT", "AMT", "iMT"] as const;
export const BODY_TYPES = ["SUV", "Compact SUV", "Sedan", "Hatchback", "MPV"] as const;
export const BADGES = ["New arrival", "Price drop", "Certified"] as const;

export const LEAD_TYPES = ["enquiry", "call_back", "test_drive", "reserve", "finance", "sell_car", "contact", "whatsapp_click", "newsletter"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];
export const LEAD_STATUSES = ["new", "contacted", "visit_scheduled", "negotiating", "won", "lost", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  enquiry: "Car enquiry",
  call_back: "Call-back",
  test_drive: "Test drive",
  reserve: "Reservation",
  finance: "Finance",
  sell_car: "Sell my car",
  contact: "Contact form",
  whatsapp_click: "WhatsApp click",
  newsletter: "Alerts sign-up",
};
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  visit_scheduled: "Visit scheduled",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
  spam: "Spam",
};

export const SELL_BRANDS = [
  "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Toyota", "Kia", "Honda", "MG", "Skoda", "Volkswagen",
  "Renault", "Nissan", "Jeep", "Ford", "Citroen", "BYD", "Isuzu", "Force Motors",
  "BMW", "Mercedes-Benz", "Audi", "Volvo", "Lexus", "Jaguar", "Land Rover", "Mini", "Porsche", "Other",
];

export const REG_STATES = [
  { code: "DL", name: "Delhi" },
  { code: "HR", name: "Haryana" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "CH", name: "Chandigarh" },
  { code: "PB", name: "Punjab" },
  { code: "UK", name: "Uttarakhand" },
  { code: "RJ", name: "Rajasthan" },
  { code: "OT", name: "Other state" },
];

export const KM_RANGES = ["Under 10,000", "10,000–25,000", "25,000–50,000", "50,000–75,000", "75,000–1,00,000", "Over 1,00,000"];

export function yearOptions(from = 2009, to = new Date().getFullYear()): number[] {
  const out: number[] = [];
  for (let y = to; y >= from; y--) out.push(y);
  return out;
}

export const RTO_STATE_NAMES: Record<string, string> = Object.fromEntries(REG_STATES.map((s) => [s.code, s.name]));
export function rtoLabel(rto: string | null | undefined): string {
  if (!rto) return "";
  const state = rto.slice(0, 2).toUpperCase();
  const name = RTO_STATE_NAMES[state];
  return name ? `${rto.toUpperCase()} · ${name}` : rto.toUpperCase();
}
