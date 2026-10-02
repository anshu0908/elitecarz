import "server-only";
import { db } from "@/lib/db";
import { parseList } from "@/lib/json";
import { EMPTY_CAR, type CarFormValues, type MasterData } from "@/lib/admin/car-form-types";
import type { CarStatus } from "@/lib/constants";
import type { InspectionResult } from "@/lib/inspection";

export async function loadMasterData(): Promise<MasterData> {
  const makes = await db.make.findMany({ include: { models: { include: { variants: { select: { name: true } } } } } });
  const out: MasterData = {};
  for (const mk of makes) {
    out[mk.name] = { bodyTypes: {}, variants: {} };
    for (const md of mk.models) {
      out[mk.name].bodyTypes[md.name] = md.bodyType;
      out[mk.name].variants[md.name] = md.variants.map((v) => v.name);
    }
  }
  return out;
}

const s = (v: unknown) => (v == null ? "" : String(v));

/** Loads a car into form values. Cost fields are blanked unless the user may see them. */
export async function loadCarForm(id: string, viewCost: boolean): Promise<(CarFormValues & { id: string; slug: string; stockNo: string | null }) | null> {
  const c = await db.car.findFirst({
    where: { id, deletedAt: null },
    include: {
      make: true,
      model: true,
      variant: true,
      images: { orderBy: { sortOrder: "asc" } },
      inspections: { take: 1, orderBy: { inspectedOn: "desc" }, include: { items: true } },
    },
  });
  if (!c) return null;
  const insp = c.inspections[0];
  return {
    ...EMPTY_CAR,
    id: c.id,
    slug: c.slug,
    stockNo: c.stockNo,
    make: c.make?.name ?? "",
    model: c.model?.name ?? "",
    variant: c.variant?.name ?? "",
    title: c.title,
    year: s(c.year),
    registrationYear: s(c.registrationYear),
    fuel: c.fuel,
    transmission: c.transmission,
    bodyType: s(c.bodyType),
    color: s(c.color),
    seats: s(c.seats),
    kmDriven: s(c.kmDriven),
    owners: s(c.owners),
    rto: s(c.rto),
    regNumber: s(c.regNumber),
    insuranceType: s(c.insuranceType),
    insuranceValidTill: c.insuranceValidTill ? c.insuranceValidTill.toISOString().slice(0, 10) : "",
    priceInr: s(c.priceInr),
    tcsApplicable: c.tcsApplicable,
    badge: s(c.badge),
    featured: c.featured,
    purchasePriceInr: viewCost ? s(c.purchasePriceInr) : "",
    refurbCostInr: viewCost ? s(c.refurbCostInr) : "",
    warrantyIncluded: c.warrantyIncluded,
    warrantyMonths: s(c.warrantyMonths),
    warrantyKm: s(c.warrantyKm),
    warrantyNote: s(c.warrantyNote),
    engineCc: s(c.engineCc),
    powerBhp: s(c.powerBhp),
    mileageKmpl: s(c.mileageKmpl),
    description: s(c.description),
    highlights: parseList(c.highlights),
    features: parseList(c.features),
    disclosures: parseList(c.disclosures),
    videoUrl: s(c.videoUrl),
    notesInternal: s(c.notesInternal),
    status: c.status as CarStatus,
    images: c.images.map((i) => ({ url: i.url, alt: i.alt, category: i.category })),
    heroIndex: Math.max(0, c.images.findIndex((i) => i.isHero)),
    inspection: insp
      ? {
          inspectedBy: s(insp.inspectedBy),
          inspectedOn: insp.inspectedOn ? insp.inspectedOn.toISOString().slice(0, 10) : "",
          summary: s(insp.summary),
          items: insp.items.map((i) => ({ section: i.section, item: i.item, result: i.result as InspectionResult, note: s(i.note) })),
        }
      : null,
  };
}
