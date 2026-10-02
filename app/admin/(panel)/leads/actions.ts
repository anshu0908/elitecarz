"use server";
import { revalidatePath } from "next/cache";
import { PermissionError, requireActionUser } from "@/lib/auth";
import { ActionError } from "@/lib/admin/cars-service";
import { addLeadNote, updateLead, updateSellValuation } from "@/lib/admin/leads-service";
import { leadUpdateSchema, manualLeadSchema, fieldErrors } from "@/lib/validation";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import type { ActionResult } from "@/app/admin/(panel)/cars/actions";

function fail(e: unknown): { ok: false; error: string } {
  if (e instanceof ActionError || e instanceof PermissionError) return { ok: false, error: e.message };
  console.error("[admin/leads]", e);
  return { ok: false, error: "Something went wrong." };
}

export async function updateLeadAction(id: string, patch: unknown): Promise<ActionResult> {
  try {
    const user = await requireActionUser("leads.edit");
    const parsed = leadUpdateSchema.safeParse(patch);
    if (!parsed.success) return { ok: false, error: "Invalid update" };
    await updateLead(user, id, parsed.data);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function addNoteAction(id: string, note: string): Promise<ActionResult> {
  try {
    const user = await requireActionUser("leads.edit");
    await addLeadNote(user, id, note);
    revalidatePath(`/admin/leads/${id}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateValuationAction(sellId: string, patch: { offeredMin?: number | null; offeredMax?: number | null; outcome?: string | null; inspectionSlot?: string | null }): Promise<ActionResult> {
  try {
    const user = await requireActionUser("leads.edit");
    await updateSellValuation(user, sellId, patch);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Walk-in / phone lead entered by staff (BRIEF §16.5). */
export async function createManualLeadAction(input: unknown): Promise<ActionResult<{ id: string }> & { fields?: Record<string, string> }> {
  try {
    const user = await requireActionUser("leads.edit");
    const parsed = manualLeadSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) };
    const d = parsed.data;
    const lead = await db.lead.create({
      data: { type: d.type, name: d.name, phone: d.phone, whatsapp: d.phone, carId: d.carId ?? null, source: d.source, message: d.message ?? null, assignedToId: user.id, status: "contacted" },
    });
    await audit(user.id, "create", "lead", lead.id, { manual: true });
    revalidatePath("/admin", "layout");
    return { ok: true, id: lead.id };
  } catch (e) {
    return fail(e);
  }
}
