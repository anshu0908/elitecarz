import "server-only";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { notifyNewLead } from "@/lib/notify";
import { indicativeValuation } from "@/lib/valuation";
import { publicCarWhere } from "@/lib/cars";
import type { LeadParsed } from "@/lib/validation";

export class LeadError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
  }
}

/** Test-drive slots must be in the future, inside opening hours, and not on a listed holiday (IST). */
export function validateSlot(iso: string, booking: { openHour: number; closeHour: number; holidays: string[]; testDriveSlotMinutes: number }, now = new Date()) {
  const slot = new Date(iso);
  if (Number.isNaN(slot.getTime())) throw new LeadError("Pick a valid date and time", "slot");
  if (slot.getTime() < now.getTime() + 60 * 60 * 1000) throw new LeadError("Pick a slot at least an hour from now", "slot");
  if (slot.getTime() > now.getTime() + 30 * 86_400_000) throw new LeadError("Slots open up to 30 days ahead", "slot");
  const ist = new Date(slot.getTime() + 330 * 60_000);
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  if (minutes < booking.openHour * 60 || minutes + booking.testDriveSlotMinutes > booking.closeHour * 60) {
    throw new LeadError(`We're open ${booking.openHour} am to ${booking.closeHour - 12} pm`, "slot");
  }
  if (booking.holidays.includes(ist.toISOString().slice(0, 10))) throw new LeadError("We're closed that day — please pick another", "slot");
  return slot;
}

export async function createLead(input: LeadParsed, meta: { source?: string }) {
  const settings = await getSettings();
  let car: { id: string; title: string; bodyType: string | null } | null = null;
  if (input.carId) {
    car = await db.car.findFirst({ where: { ...publicCarWhere, id: input.carId }, select: { id: true, title: true, bodyType: true } });
    if (!car) throw new LeadError("That car is no longer listed", "carId");
  }

  const phone = "phone" in input ? input.phone : null;
  const name = "name" in input ? input.name ?? null : null;
  const message = "message" in input ? input.message ?? null : null;
  const payload: Record<string, unknown> = {};
  let slot: Date | null = null;
  let valuation: ReturnType<typeof indicativeValuation> | null = null;

  switch (input.type) {
    case "test_drive":
      slot = validateSlot(input.slot, settings.booking);
      payload.slot = slot.toISOString();
      break;
    case "reserve":
      payload.visitDate = input.visitDate;
      payload.tokenAmount = settings.booking.tokenAmountInr;
      break;
    case "call_back":
      payload.preferredTime = input.preferredTime;
      break;
    case "finance":
      Object.assign(payload, { employment: input.employment, monthlyIncome: input.monthlyIncome, downPayment: input.downPayment, tenureMonths: input.tenureMonths });
      break;
    case "sell_car": {
      const model = await db.model.findFirst({ where: { name: input.sell.model, make: { name: input.sell.make } }, select: { bodyType: true } });
      valuation = indicativeValuation({ ...input.sell, bodyType: model?.bodyType ?? undefined });
      payload.valuation = valuation;
      break;
    }
  }

  // Duplicate-phone detection (BRIEF §16.5): link to the most recent lead from the same number.
  if (phone) {
    const dup = await db.lead.findFirst({
      where: { phone, createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) } },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (dup) payload.duplicateOf = dup.id;
  }

  const lead = await db.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        type: input.type,
        name,
        phone,
        whatsapp: input.type === "sell_car" ? input.whatsapp ?? phone : phone,
        email: "email" in input ? input.email ?? null : null,
        city: input.type === "sell_car" ? input.sell.city ?? null : null,
        carId: car?.id ?? null,
        message,
        payload: JSON.stringify(payload),
        source: meta.source ?? (input.utm?.utm_source ? input.utm.utm_source : "website"),
        utm: input.utm ? JSON.stringify(input.utm) : null,
        pageUrl: input.pageUrl ?? null,
      },
    });
    if (input.type === "test_drive" || input.type === "reserve") {
      await tx.booking.create({
        data: {
          leadId: lead.id,
          carId: car?.id ?? null,
          kind: input.type === "reserve" ? "reservation" : "test_drive",
          slot,
          tokenAmount: input.type === "reserve" ? settings.booking.tokenAmountInr : null,
          paymentStatus: input.type === "reserve" ? "not_enabled" : null,
        },
      });
    }
    if (input.type === "sell_car") {
      const s = input.sell;
      await tx.sellRequest.create({
        data: {
          leadId: lead.id,
          regNumber: s.regNumber,
          make: s.make,
          model: s.model,
          variant: s.variant ?? null,
          mfgYear: s.mfgYear,
          regYear: s.regYear ?? null,
          owners: s.owners,
          kmRange: s.kmRange,
          fuel: s.fuel,
          transmission: s.transmission,
          state: s.state,
          expectedPrice: s.expectedPrice ?? null,
          photos: JSON.stringify(s.photos ?? []),
          offeredMin: valuation?.min ?? null,
          offeredMax: valuation?.max ?? null,
        },
      });
    }
    return lead;
  });

  if (input.type !== "whatsapp_click") {
    await notifyNewLead({ id: lead.id, type: input.type, name, phone, carTitle: car?.title, message }, settings.notifications.leadEmails);
  }
  return { id: lead.id, valuation, tokenAmount: input.type === "reserve" ? settings.booking.tokenAmountInr : undefined };
}
