"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PermissionError, requireActionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { fieldErrors, indianMobile } from "@/lib/validation";
import { getSettings } from "@/lib/settings";
import type { ActionResult } from "@/app/admin/(panel)/cars/actions";

const schemas = {
  business: z.object({
    name: z.string().trim().min(1).max(60),
    legalName: z.string().trim().max(120),
    phone: indianMobile,
    whatsapp: indianMobile,
    email: z.string().trim().email(),
    mapsUrl: z.string().url(),
    holidayNote: z.string().max(200),
    googleRating: z.coerce.number().min(0).max(5),
    googleReviewCount: z.coerce.number().int().min(0),
    googleProfileUrl: z.string().url(),
    gstin: z.union([z.literal(""), z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Not a valid GSTIN")]),
  }),
  finance: z.object({
    annualRatePct: z.coerce.number().min(5).max(25),
    tenureMonths: z.coerce.number().int().min(12).max(84),
    downPaymentPct: z.coerce.number().min(0).max(90),
    maxLoanPct: z.coerce.number().min(10).max(100),
    rateIsDemo: z.coerce.boolean(),
  }),
  booking: z.object({
    tokenAmountInr: z.coerce.number().int().min(0).max(5_00_000),
    tokenIsDemo: z.coerce.boolean(),
    refundDays: z.coerce.number().int().min(0).max(60),
    testDriveSlotMinutes: z.coerce.number().int().min(15).max(180),
    openHour: z.coerce.number().int().min(0).max(23),
    closeHour: z.coerce.number().int().min(1).max(24),
    holidays: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(60),
  }),
  notifications: z.object({ leadEmails: z.array(z.string().email()).max(10) }),
  tracking: z.object({ ga4Id: z.union([z.literal(""), z.string().regex(/^G-[A-Z0-9]+$/, "Looks like G-XXXXXXX")]), clarityId: z.string().max(40), metaPixelId: z.string().max(40) }),
};
export type SettingsSection = keyof typeof schemas;

export async function saveSettingsAction(section: SettingsSection, input: unknown): Promise<ActionResult & { fields?: Record<string, string> }> {
  try {
    const user = await requireActionUser("settings.edit");
    const schema = schemas[section];
    if (!schema) return { ok: false, error: "Unknown section" };
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) };
    const current = (await getSettings())[section];
    const value = { ...current, ...parsed.data };
    await db.setting.upsert({ where: { key: section }, update: { value: JSON.stringify(value) }, create: { key: section, value: JSON.stringify(value) } });
    await audit(user.id, "settings", "setting", section, parsed.data);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    if (e instanceof PermissionError) return { ok: false, error: e.message };
    console.error(e);
    return { ok: false, error: "Couldn't save settings" };
  }
}
