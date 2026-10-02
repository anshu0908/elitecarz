import "server-only";
import { db } from "@/lib/db";
import { audit, diffFields } from "@/lib/audit";
import { can } from "@/lib/permissions";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { CurrentUser } from "@/lib/auth";
import { ActionError } from "@/lib/admin/cars-service";
import type { LeadStatus } from "@/lib/constants";

/** Leads a user may see: everything for owner/manager/viewer; own + unassigned for sales (BRIEF §16.1). */
export function leadScope(user: CurrentUser): Prisma.LeadWhereInput {
  if (can(user.role, "leads.viewAll")) return {};
  return { OR: [{ assignedToId: user.id }, { assignedToId: null }] };
}

async function loadEditable(user: CurrentUser, id: string) {
  if (!can(user.role, "leads.edit")) throw new ActionError("You can view leads but not change them.");
  const lead = await db.lead.findFirst({ where: { id, ...leadScope(user) } });
  if (!lead) throw new ActionError("Lead not found");
  return lead;
}

export async function updateLead(user: CurrentUser, id: string, patch: { status?: LeadStatus; assignedToId?: string | null; nextFollowupAt?: string | null; lostReason?: string | null }) {
  const lead = await loadEditable(user, id);
  if (patch.assignedToId !== undefined && patch.assignedToId !== lead.assignedToId) {
    // Sales can only pick up a lead for themselves.
    if (!can(user.role, "leads.assign") && patch.assignedToId !== user.id) throw new ActionError("Only a manager can assign leads to others.");
    if (patch.assignedToId) {
      const u = await db.user.findFirst({ where: { id: patch.assignedToId, isActive: true } });
      if (!u) throw new ActionError("That user doesn't exist or is inactive.");
    }
  }
  if (patch.status === "lost" && !(patch.lostReason ?? lead.lostReason)) throw new ActionError("Add a reason when marking a lead lost.");
  const data = {
    ...patch,
    nextFollowupAt: patch.nextFollowupAt === undefined ? undefined : patch.nextFollowupAt ? new Date(patch.nextFollowupAt) : null,
  };
  await db.lead.update({ where: { id }, data });
  await audit(user.id, patch.status && patch.status !== lead.status ? `lead:${patch.status}` : "update", "lead", id, diffFields(lead as unknown as Record<string, unknown>, data));
}

export async function addLeadNote(user: CurrentUser, id: string, note: string) {
  await loadEditable(user, id);
  const text = note.trim().slice(0, 2000);
  if (!text) throw new ActionError("Write a note first.");
  await db.leadNote.create({ data: { leadId: id, userId: user.id, note: text } });
  // First human touch moves a new lead to "contacted".
  await db.lead.updateMany({ where: { id, status: "new" }, data: { status: "contacted" } });
  await audit(user.id, "note", "lead", id);
}

export async function updateSellValuation(user: CurrentUser, sellId: string, patch: { offeredMin?: number | null; offeredMax?: number | null; outcome?: string | null; inspectionSlot?: string | null }) {
  const sr = await db.sellRequest.findUnique({ where: { id: sellId } });
  if (!sr) throw new ActionError("Not found");
  await loadEditable(user, sr.leadId);
  if (patch.offeredMin != null && patch.offeredMax != null && patch.offeredMin > patch.offeredMax) throw new ActionError("Minimum offer is above the maximum.");
  const slot = patch.inspectionSlot === undefined ? undefined : patch.inspectionSlot ? new Date(patch.inspectionSlot) : null;
  await db.sellRequest.update({ where: { id: sellId }, data: { ...patch, inspectionSlot: slot } });
  if (slot) {
    // "Schedule inspection" creates a booking (BRIEF §16.5).
    await db.booking.create({ data: { leadId: sr.leadId, kind: "sell_inspection", slot, status: "confirmed" } });
    await db.lead.update({ where: { id: sr.leadId }, data: { status: "visit_scheduled" } });
  }
  await audit(user.id, "valuation", "sell_request", sellId, patch);
}
