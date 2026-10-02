// Zod schemas shared by client forms and server handlers.
import { z } from "zod";
import { normalizeIndianMobile } from "@/lib/format";
import { CAR_STATUSES, FUELS, LEAD_STATUSES, LEAD_TYPES } from "@/lib/constants";

export const indianMobile = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const n = normalizeIndianMobile(v);
    if (!n) {
      ctx.addIssue({ code: "custom", message: "Enter a valid 10-digit Indian mobile number" });
      return z.NEVER;
    }
    return n;
  });

const optionalText = (max: number) => z.string().trim().max(max).optional().transform((v) => (v ? v : undefined));

const base = z.object({
  carId: z.string().uuid().optional(),
  pageUrl: z.string().max(300).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
  hp: z.string().max(0, "Bot check failed").optional(), // honeypot — must stay empty
  turnstileToken: z.string().max(4096).optional(),
});

const contactFields = {
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: indianMobile,
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional().transform((v) => v || undefined),
  message: optionalText(1000),
  consent: z.literal(true, { error: "Please agree so we can contact you" }),
};

export const sellPayload = z.object({
  regNumber: z.string().trim().toUpperCase().min(4, "Enter the registration number").max(14),
  make: z.string().trim().min(1, "Choose the brand").max(40),
  model: z.string().trim().min(1, "Enter the model").max(60),
  variant: optionalText(80),
  mfgYear: z.coerce.number().int().min(1990).max(new Date().getFullYear()),
  regYear: z.coerce.number().int().min(1990).max(new Date().getFullYear()).optional(),
  owners: z.coerce.number().int().min(1).max(5),
  kmRange: z.string().min(1, "Choose the kilometres driven").max(40),
  fuel: z.enum(FUELS),
  transmission: z.enum(["Manual", "Automatic", "iMT"]),
  state: z.string().min(2).max(3),
  city: optionalText(60),
  expectedPrice: z.coerce.number().int().min(0).max(5_00_00_000).optional(),
  photos: z.array(z.string().regex(/^\/uploads\/sell\/[\w-]+\.webp$/)).max(8).optional(),
});

export const leadSchema = z.discriminatedUnion("type", [
  base.extend({ type: z.literal("whatsapp_click") }),
  base.extend({ type: z.literal("enquiry"), ...contactFields }),
  base.extend({ type: z.literal("contact"), ...contactFields }),
  base.extend({ type: z.literal("call_back"), ...contactFields, preferredTime: optionalText(60) }),
  base.extend({
    type: z.literal("test_drive"),
    ...contactFields,
    carId: z.string().uuid(),
    slot: z.string().datetime({ offset: true }),
  }),
  base.extend({ type: z.literal("reserve"), ...contactFields, carId: z.string().uuid(), visitDate: optionalText(20) }),
  base.extend({
    type: z.literal("finance"),
    ...contactFields,
    employment: z.enum(["salaried", "self_employed", "business"]),
    monthlyIncome: z.coerce.number().int().min(0).max(1_00_00_000).optional(),
    downPayment: z.coerce.number().int().min(0).max(5_00_00_000).optional(),
    tenureMonths: z.coerce.number().int().min(12).max(84).optional(),
  }),
  base.extend({ type: z.literal("sell_car"), ...contactFields, whatsapp: indianMobile.optional(), sell: sellPayload }),
  base.extend({
    type: z.literal("newsletter"),
    phone: indianMobile,
    name: optionalText(80),
    consent: z.literal(true, { error: "Please agree so we can send alerts" }),
  }),
]);
export type LeadInput = z.input<typeof leadSchema>;
export type LeadParsed = z.output<typeof leadSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// ───────── Admin ─────────

const optInt = z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().min(0).optional());
const optFloat = z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().min(0).optional());
const optStr = (max = 200) => z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional());
const strList = z.array(z.string().trim().min(1).max(160)).max(40).default([]);

export const carFormSchema = z.object({
  make: z.string().trim().min(1, "Make is required").max(40),
  model: z.string().trim().min(1, "Model is required").max(60),
  variant: optStr(100),
  title: optStr(160),
  year: z.coerce.number().int().min(1990, "Year looks wrong").max(new Date().getFullYear() + 1),
  registrationYear: optInt,
  fuel: z.enum(FUELS),
  transmission: z.string().min(1).max(20),
  bodyType: optStr(30),
  color: optStr(30),
  seats: optInt,
  kmDriven: optInt,
  owners: optInt,
  rto: optStr(6),
  regNumber: optStr(14),
  insuranceType: optStr(60),
  insuranceValidTill: optStr(10),
  priceInr: z.coerce.number().int().min(10_000, "Enter the price in rupees, e.g. 1475000").max(10_00_00_000),
  tcsApplicable: z.coerce.boolean().default(true),
  badge: optStr(30),
  featured: z.coerce.boolean().default(false),
  purchasePriceInr: optInt,
  refurbCostInr: optInt,
  warrantyIncluded: z.coerce.boolean().default(false),
  warrantyMonths: optInt,
  warrantyKm: optInt,
  warrantyNote: optStr(300),
  engineCc: optInt,
  powerBhp: optFloat,
  mileageKmpl: optFloat,
  description: optStr(4000),
  highlights: strList,
  features: strList,
  disclosures: strList,
  videoUrl: z.preprocess((v) => (v === "" ? undefined : v), z.string().url().max(300).optional()),
  notesInternal: optStr(2000),
  slug: optStr(160),
  status: z.enum(CAR_STATUSES),
  images: z
    .array(z.object({ url: z.string().min(1).max(500), alt: z.string().max(200).optional().nullable(), category: z.string().max(20).optional().nullable() }))
    .max(80)
    .default([]),
  heroIndex: z.coerce.number().int().min(0).default(0),
  inspection: z
    .object({
      inspectedBy: optStr(80),
      inspectedOn: optStr(10),
      summary: optStr(1000),
      items: z.array(z.object({ section: z.string().max(60), item: z.string().max(120), result: z.enum(["pass", "minor", "fail", "na"]), note: z.string().max(300).optional().nullable() })).max(300),
    })
    .nullable()
    .optional(),
});
export type CarFormInput = z.input<typeof carFormSchema>;
export type CarFormData = z.output<typeof carFormSchema>;

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  nextFollowupAt: z.string().nullable().optional(),
  lostReason: z.string().max(200).nullable().optional(),
});

export const manualLeadSchema = z.object({
  type: z.enum(LEAD_TYPES),
  name: z.string().trim().min(2).max(80),
  phone: indianMobile,
  carId: z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional()),
  source: z.string().max(40).default("walk-in"),
  message: optStr(1000),
});
