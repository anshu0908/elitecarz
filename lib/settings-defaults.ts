// Default settings (BRIEF §16.8). Stored in the `Setting` table as JSON; these are
// the seed values and the fallback when a key is missing.

export type BusinessSettings = {
  name: string;
  legalName: string;
  addressLines: string[];
  locality: string;
  city: string;
  postalCode: string;
  phone: string; // 10-digit
  whatsapp: string; // 10-digit
  email: string;
  hours: { days: string; open: string; close: string }[];
  holidayNote: string;
  mapsUrl: string;
  geo: { lat: number; lng: number };
  googleRating: number;
  googleReviewCount: number;
  googleProfileUrl: string;
  gstin: string;
};

export type FinanceSettings = {
  annualRatePct: number;
  tenureMonths: number;
  downPaymentPct: number;
  maxLoanPct: number;
  rateIsDemo: boolean;
};

export type BookingSettings = {
  tokenAmountInr: number;
  tokenIsDemo: boolean;
  refundDays: number;
  testDriveSlotMinutes: number;
  openHour: number;
  closeHour: number;
  holidays: string[]; // ISO dates
};

export type TrackingSettings = { ga4Id: string; clarityId: string; metaPixelId: string };

export type NotificationSettings = { leadEmails: string[] };

export type SettingsMap = {
  business: BusinessSettings;
  finance: FinanceSettings;
  booking: BookingSettings;
  tracking: TrackingSettings;
  notifications: NotificationSettings;
};

export const DEFAULT_SETTINGS: SettingsMap = {
  business: {
    name: "EliteCarz",
    legalName: "EliteCarz (legal name to confirm)",
    addressLines: ["Indra Market, CB-382, Ring Rd", "Block CB, Naraina Village"],
    locality: "Naraina",
    city: "New Delhi",
    postalCode: "110028",
    phone: "9711163000",
    whatsapp: "9711163000",
    email: "ElitecarzIndia@gmail.com",
    hours: [{ days: "Mon–Sun", open: "11:00", close: "19:00" }],
    holidayNote: "Hours may differ on public holidays.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=EliteCarz+Naraina+New+Delhi",
    geo: { lat: 28.6266, lng: 77.1336 }, // decoded from plus code J4GM+JC
    googleRating: 4.7,
    googleReviewCount: 118,
    googleProfileUrl: "https://www.google.com/maps/search/?api=1&query=EliteCarz+Naraina+New+Delhi",
    gstin: "",
  },
  finance: { annualRatePct: 10.5, tenureMonths: 60, downPaymentPct: 20, maxLoanPct: 80, rateIsDemo: true },
  booking: { tokenAmountInr: 25000, tokenIsDemo: true, refundDays: 7, testDriveSlotMinutes: 45, openHour: 11, closeHour: 19, holidays: ["2026-10-02"] },
  tracking: { ga4Id: "", clarityId: "", metaPixelId: "" },
  notifications: { leadEmails: ["ElitecarzIndia@gmail.com"] },
};

export type SettingKey = keyof SettingsMap;
export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as SettingKey[];
