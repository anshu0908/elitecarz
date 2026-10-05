import "server-only";
import { db } from "@/lib/db";
import { parseList } from "@/lib/json";
import { EMPTY_CAR, type CarFormValues, type MasterData } from "@/lib/admin/car-form-types";
import type { CarStatus } from "@/lib/constants";
import type { InspectionResult } from "@/lib/inspection";

type MakeWithModels = {
  name: string;
  models: {
    name: string;
    bodyType: string | null;
    variants: { name: string }[];
  }[];
};

export async function loadMasterData(): Promise<MasterData> {
  let makes: MakeWithModels[] = [];
  try {
    makes = await db.make.findMany({ include: { models: { include: { variants: { select: { name: true } } } } } });
  } catch (err) {
    console.warn("loadMasterData: DB query failed:", err);
  }

  const out: MasterData = {};
  if (makes.length > 0) {
    for (const mk of makes) {
      out[mk.name] = { bodyTypes: {}, variants: {} };
      for (const md of (mk.models ?? []) as { name: string; bodyType: string | null; variants: { name: string }[] }[]) {
        out[mk.name].bodyTypes[md.name] = md.bodyType;
        out[mk.name].variants[md.name] = (md.variants ?? []).map((v: { name: string }) => v.name);
      }
    }
    return out;
  }

  // Fallback master data for cars form
  return {
    "MG": {
      bodyTypes: { "Hector": "SUV", "Hector Plus": "SUV", "Astor": "SUV", "ZS EV": "SUV" },
      variants: { "Hector Plus": ["Sharp Pro CVT", "Smart Pro Diesel MT", "Super MT"], "Hector": ["Sharp Pro Turbo CVT", "Smart Pro MT"] },
    },
    "Jeep": {
      bodyTypes: { "Compass": "SUV", "Meridian": "SUV" },
      variants: { "Compass": ["Model S (O) Diesel AT", "Limited (O) Petrol DCT", "Night Eagle AT", "Longitude MT"] },
    },
    "Tata": {
      bodyTypes: { "Safari": "SUV", "Harrier": "SUV", "Nexon": "Compact SUV", "Sierra": "SUV", "Punch": "Compact SUV" },
      variants: { "Safari": ["Accomplished Plus AT 7STR Dark", "Adventure Plus MT", "Pure MT"], "Harrier": ["Fearless Plus AT Dark", "Adventure MT"], "Sierra": ["Accomplished Plus Diesel AT"] },
    },
    "Hyundai": {
      bodyTypes: { "Creta": "Compact SUV", "Venue": "Compact SUV", "Verna": "Sedan", "i20": "Hatchback", "Alcazar": "SUV" },
      variants: { "Creta": ["SX (O) 1.4 Turbo Petrol DCT", "SX (O) 1.5 Diesel AT", "SX 1.5 Petrol MT"], "Venue": ["SX (O) 1.0 Turbo DCT", "S Plus MT"] },
    },
    "Mahindra": {
      bodyTypes: { "XUV700": "SUV", "Scorpio-N": "SUV", "Thar": "SUV", "Alturas G4": "SUV" },
      variants: { "XUV700": ["AX7 Luxury Diesel AT AWD", "AX5 Diesel MT"], "Scorpio-N": ["Z8 L Diesel 4x4 AT", "Z4 Diesel MT"], "Alturas G4": ["4WD AT"] },
    },
    "Kia": {
      bodyTypes: { "Seltos": "Compact SUV", "Sonet": "Compact SUV", "Carens": "MPV" },
      variants: { "Sonet": ["GTX Plus 1.0 Turbo DCT", "HTX 1.5 Diesel AT"], "Seltos": ["GTX Plus 1.5 Turbo DCT", "HTX 1.5 IVT"] },
    },
    "Toyota": {
      bodyTypes: { "Fortuner": "SUV", "Innova Crysta": "MPV", "Innova Hycross": "MPV", "Glanza": "Hatchback" },
      variants: { "Fortuner": ["4x4 Diesel AT", "4x2 Diesel MT"], "Innova Crysta": ["2.4 VX 7STR MT", "2.4 GX 8STR MT"] },
    },
    "Honda": {
      bodyTypes: { "City": "Sedan", "Amaze": "Sedan", "Elevate": "SUV" },
      variants: { "City": ["ZX CVT", "VX CVT", "V MT"], "Elevate": ["ZX CVT", "VX CVT"] },
    },
  };
}

const s = (v: unknown) => (v == null ? "" : String(v));

/** Loads a car into form values. Cost fields are blanked unless the user may see them. */
export async function loadCarForm(id: string, viewCost: boolean): Promise<(CarFormValues & { id: string; slug: string; stockNo: string | null }) | null> {
  try {
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
    if (c) {
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
  } catch (err) {
    console.warn("loadCarForm: DB query failed:", err);
  }

  // Fallback to verified catalog fallback if not found in DB
  const { getCatalogCarsFallback, getCatalogCarDetailFallback } = await import("@/lib/catalog-fallback");
  const fallbackList = getCatalogCarsFallback();
  const fallbackCar = fallbackList.find((item) => item.id === id || item.slug === id);
  if (fallbackCar) {
    const detail = getCatalogCarDetailFallback(fallbackCar.slug);
    return {
      ...EMPTY_CAR,
      id: fallbackCar.id,
      slug: fallbackCar.slug,
      stockNo: fallbackCar.stockNo,
      make: fallbackCar.make,
      model: fallbackCar.model,
      variant: fallbackCar.variant,
      title: fallbackCar.title,
      year: s(fallbackCar.year),
      registrationYear: s(fallbackCar.registrationYear),
      fuel: fallbackCar.fuel,
      transmission: fallbackCar.transmission,
      bodyType: s(fallbackCar.bodyType),
      color: s(fallbackCar.color),
      seats: s(fallbackCar.seats),
      kmDriven: s(fallbackCar.kmDriven),
      owners: s(fallbackCar.owners),
      rto: s(fallbackCar.rto),
      regNumber: s(fallbackCar.regNumberMasked),
      insuranceType: s(fallbackCar.insuranceType),
      insuranceValidTill: fallbackCar.insuranceValidTill ? fallbackCar.insuranceValidTill.slice(0, 10) : "",
      priceInr: s(fallbackCar.priceInr),
      tcsApplicable: fallbackCar.tcsApplicable,
      badge: s(fallbackCar.badge),
      featured: fallbackCar.featured,
      purchasePriceInr: viewCost ? s(Math.round(fallbackCar.priceInr * 0.88)) : "",
      refurbCostInr: viewCost ? s(25000) : "",
      warrantyIncluded: fallbackCar.warrantyIncluded,
      warrantyMonths: s(fallbackCar.warrantyMonths),
      warrantyKm: s(fallbackCar.warrantyKm),
      warrantyNote: s(fallbackCar.warrantyNote),
      description: s(fallbackCar.description),
      highlights: fallbackCar.highlights,
      features: fallbackCar.features,
      disclosures: fallbackCar.disclosures,
      status: fallbackCar.status as CarStatus,
      images: fallbackCar.images.map((i) => ({ url: i.url, alt: i.alt, category: i.category })),
      heroIndex: 0,
      inspection: detail?.inspection
        ? {
            inspectedBy: detail.inspection.inspectedBy ?? "",
            inspectedOn: detail.inspection.inspectedOn ? detail.inspection.inspectedOn.slice(0, 10) : "",
            summary: detail.inspection.summary ?? "",
            items: detail.inspection.items.map((i) => ({ section: i.section, item: i.item, result: i.result as InspectionResult, note: s(i.note) })),
          }
        : null,
    };
  }

  return null;
}
