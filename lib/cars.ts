import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { parseList } from "@/lib/json";
import { PUBLIC_STATUSES } from "@/lib/constants";
import type { PublicCar, PublicCarDetail } from "@/lib/types";

// The ONLY select used for public pages/APIs. Admin-only columns (purchasePriceInr,
// refurbCostInr, notesInternal, regNumber, source, createdBy…) are deliberately absent.
export const publicCarSelect = {
  id: true,
  slug: true,
  stockNo: true,
  status: true,
  title: true,
  year: true,
  registrationYear: true,
  fuel: true,
  transmission: true,
  bodyType: true,
  kmDriven: true,
  owners: true,
  color: true,
  seats: true,
  rto: true,
  regNumberMasked: true,
  insuranceType: true,
  insuranceValidTill: true,
  priceInr: true,
  tcsApplicable: true,
  warrantyIncluded: true,
  warrantyMonths: true,
  warrantyKm: true,
  warrantyNote: true,
  description: true,
  highlights: true,
  features: true,
  disclosures: true,
  videoUrl: true,
  featured: true,
  badge: true,
  demoFields: true,
  views: true,
  publishedAt: true,
  soldAt: true,
  make: { select: { name: true } },
  model: { select: { name: true } },
  variant: { select: { name: true } },
  images: { select: { url: true, alt: true, category: true, isHero: true }, orderBy: { sortOrder: "asc" } },
} satisfies Prisma.CarSelect;

type PublicCarRow = Prisma.CarGetPayload<{ select: typeof publicCarSelect }>;

export const publicCarWhere = { deletedAt: null, status: { in: PUBLIC_STATUSES } } satisfies Prisma.CarWhereInput;

export function toPublicCar(row: PublicCarRow): PublicCar {
  const hero = row.images.find((i) => i.isHero) ?? row.images[0];
  return {
    id: row.id,
    slug: row.slug,
    stockNo: row.stockNo,
    status: row.status as PublicCar["status"],
    title: row.title,
    make: row.make?.name ?? "",
    model: row.model?.name ?? "",
    variant: row.variant?.name ?? "",
    year: row.year,
    registrationYear: row.registrationYear,
    fuel: row.fuel,
    transmission: row.transmission,
    bodyType: row.bodyType,
    kmDriven: row.kmDriven,
    owners: row.owners,
    color: row.color,
    seats: row.seats,
    rto: row.rto,
    regNumberMasked: row.regNumberMasked,
    insuranceType: row.insuranceType,
    insuranceValidTill: row.insuranceValidTill?.toISOString() ?? null,
    priceInr: row.priceInr,
    tcsApplicable: row.tcsApplicable,
    warrantyIncluded: row.warrantyIncluded,
    warrantyMonths: row.warrantyMonths,
    warrantyKm: row.warrantyKm,
    warrantyNote: row.warrantyNote,
    description: row.description,
    highlights: parseList(row.highlights),
    features: parseList(row.features),
    disclosures: parseList(row.disclosures),
    videoUrl: row.videoUrl,
    featured: row.featured,
    badge: row.badge,
    images: row.images.map(({ url, alt, category }) => ({ url, alt, category })),
    heroImage: hero?.url ?? null,
    demoFields: parseList(row.demoFields),
    views: row.views,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    soldAt: row.soldAt?.toISOString() ?? null,
  };
}

/** All cars visible on the public site (published, reserved, and recently sold). */
export const getPublicCars = cache(async (): Promise<PublicCar[]> => {
  const rows = await db.car.findMany({
    where: publicCarWhere,
    select: publicCarSelect,
    orderBy: [{ publishedAt: "desc" }],
  });
  return rows.map(toPublicCar);
});

export const getPublicCarBySlug = cache(async (slug: string): Promise<PublicCarDetail | null> => {
  const row = await db.car.findFirst({
    where: { ...publicCarWhere, slug },
    select: {
      ...publicCarSelect,
      documents: { select: { type: true, verified: true, fileUrl: true, isPublic: true } },
      inspections: {
        take: 1,
        orderBy: { inspectedOn: "desc" },
        select: { inspectedBy: true, inspectedOn: true, summary: true, isDemo: true, items: { select: { section: true, item: true, result: true, note: true } } },
      },
      priceHistory: { take: 1, orderBy: { changedAt: "desc" }, select: { oldPrice: true, newPrice: true, changedAt: true } },
    },
  });
  if (!row) return null;
  const { documents, inspections, priceHistory, ...rest } = row;
  const insp = inspections[0];
  const drop = priceHistory[0];
  return {
    ...toPublicCar(rest),
    // Only the verified flag is public; files are exposed only when explicitly marked public.
    documents: documents.map((d) => ({ type: d.type, verified: d.verified, fileUrl: d.isPublic ? d.fileUrl : null })),
    inspection: insp
      ? { inspectedBy: insp.inspectedBy, inspectedOn: insp.inspectedOn?.toISOString() ?? null, summary: insp.summary, isDemo: insp.isDemo, items: insp.items }
      : null,
    priceDrop: drop && drop.newPrice < drop.oldPrice ? { oldPrice: drop.oldPrice, newPrice: drop.newPrice, changedAt: drop.changedAt.toISOString() } : null,
  };
});
