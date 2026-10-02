import "server-only";
import { db } from "@/lib/db";
import { audit, diffFields } from "@/lib/audit";
import { can, canSetStatus } from "@/lib/permissions";
import { carSlug, carTitle, maskRegNumber, slugify, uniqueSlug } from "@/lib/slug";
import type { CarFormData } from "@/lib/validation";
import type { CurrentUser } from "@/lib/auth";
import type { CarStatus } from "@/lib/constants";

export class ActionError extends Error {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message);
  }
}

async function nextStockNo(): Promise<string> {
  const rows = await db.car.findMany({ where: { stockNo: { startsWith: "EC-" } }, select: { stockNo: true } });
  const max = rows.reduce((m, r) => Math.max(m, Number(r.stockNo?.slice(3)) || 0), 0);
  return `EC-${String(max + 1).padStart(4, "0")}`;
}

async function resolveMaster(make: string, model: string, variant: string | undefined, bodyType: string | undefined) {
  const mk = await db.make.upsert({ where: { name: make }, update: {}, create: { name: make } });
  const md = await db.model.upsert({
    where: { makeId_name: { makeId: mk.id, name: model } },
    update: {},
    create: { makeId: mk.id, name: model, bodyType: bodyType ?? null },
  });
  const vr = variant
    ? await db.variant.upsert({ where: { modelId_name: { modelId: md.id, name: variant } }, update: {}, create: { modelId: md.id, name: variant } })
    : null;
  return { makeId: mk.id, modelId: md.id, variantId: vr?.id ?? null };
}

const slugTaken = (excludeId?: string) => async (slug: string) => !!(await db.car.findFirst({ where: { slug, NOT: excludeId ? { id: excludeId } : undefined }, select: { id: true } }));

/** Category page a deleted car's URL should point to (keeps SEO equity, BRIEF §16.4). */
export async function fallbackPathFor(carId: string): Promise<string> {
  const car = await db.car.findUnique({ where: { id: carId }, select: { make: { select: { name: true } } } });
  return car?.make ? `/used-cars/${slugify(car.make.name)}` : "/cars";
}

export async function saveCar(user: CurrentUser, id: string | null, data: CarFormData) {
  const existing = id ? await db.car.findFirst({ where: { id, deletedAt: null } }) : null;
  if (id && !existing) throw new ActionError("This car no longer exists (it may be in Trash).");

  // Sales can only create/edit drafts (BRIEF §16.1).
  if (!can(user.role, "cars.publish")) {
    if (existing && existing.status !== "draft") throw new ActionError("Only a manager can edit a car that's already live. Ask them, or duplicate it as a draft.");
    if (data.status !== "draft") throw new ActionError("You can save drafts; a manager publishes them.");
  }
  if (!canSetStatus(user.role, data.status)) throw new ActionError("You don't have permission to set that status.");
  if (data.status === "published" && data.images.length === 0) throw new ActionError("Add at least one photo before publishing.", { images: "Add at least one photo" });

  const master = await resolveMaster(data.make, data.model, data.variant, data.bodyType);
  const title = data.title || carTitle({ year: data.registrationYear ?? data.year, make: data.make, model: data.model, variant: data.variant });
  const wantedSlug = data.slug ? slugify(data.slug) : existing?.slug ?? carSlug(title);
  const slug = await uniqueSlug(wantedSlug, slugTaken(existing?.id));
  const viewCost = can(user.role, "cars.viewCost");
  const now = new Date();

  const fields = {
    ...master,
    title,
    slug,
    status: data.status,
    year: data.year,
    registrationYear: data.registrationYear ?? null,
    fuel: data.fuel,
    transmission: data.transmission,
    bodyType: data.bodyType ?? null,
    color: data.color ?? null,
    seats: data.seats ?? null,
    kmDriven: data.kmDriven ?? null,
    owners: data.owners ?? null,
    rto: data.rto?.toUpperCase() ?? null,
    regNumber: data.regNumber?.toUpperCase().replace(/\s/g, "") ?? null,
    regNumberMasked: data.regNumber ? maskRegNumber(data.regNumber) : null,
    insuranceType: data.insuranceType ?? null,
    insuranceValidTill: data.insuranceValidTill ? new Date(data.insuranceValidTill) : null,
    priceInr: data.priceInr,
    tcsApplicable: data.tcsApplicable,
    badge: data.badge ?? null,
    featured: data.featured,
    warrantyIncluded: data.warrantyIncluded,
    warrantyMonths: data.warrantyMonths ?? null,
    warrantyKm: data.warrantyKm ?? null,
    warrantyNote: data.warrantyNote ?? null,
    engineCc: data.engineCc ?? null,
    powerBhp: data.powerBhp ?? null,
    mileageKmpl: data.mileageKmpl ?? null,
    description: data.description ?? null,
    highlights: JSON.stringify(data.highlights),
    features: JSON.stringify(data.features),
    disclosures: JSON.stringify(data.disclosures),
    videoUrl: data.videoUrl ?? null,
    notesInternal: data.notesInternal ?? null,
    ...(viewCost ? { purchasePriceInr: data.purchasePriceInr ?? null, refurbCostInr: data.refurbCostInr ?? null } : {}),
    publishedAt: data.status === "published" && !existing?.publishedAt ? now : existing?.publishedAt ?? null,
    soldAt: data.status === "sold" ? existing?.soldAt ?? now : null,
    soldPriceInr: data.status === "sold" ? existing?.soldPriceInr ?? data.priceInr : null,
    updatedById: user.id,
  };

  // Auto "Price drop" badge when a live car gets cheaper and no badge was chosen.
  if (existing && data.priceInr < existing.priceInr && existing.status === "published" && !data.badge) fields.badge = "Price drop";

  // Read outside the transaction: SQLite has one writer, so a non-tx query inside it would wait on itself.
  const stockNo = existing ? null : await nextStockNo();
  const car = await db.$transaction(async (tx) => {
    const car = existing
      ? await tx.car.update({ where: { id: existing.id }, data: fields })
      : await tx.car.create({ data: { ...fields, stockNo, createdById: user.id, purchasePriceInr: viewCost ? data.purchasePriceInr ?? null : null, refurbCostInr: viewCost ? data.refurbCostInr ?? null : null } });

    await tx.carImage.deleteMany({ where: { carId: car.id } });
    if (data.images.length) {
      const hero = Math.min(data.heroIndex, data.images.length - 1);
      await tx.carImage.createMany({
        data: data.images.map((img, i) => ({ carId: car.id, url: img.url, alt: img.alt || `${title} — photo ${i + 1}`, category: img.category ?? null, sortOrder: i, isHero: i === hero })),
      });
    }

    if (existing && existing.priceInr !== data.priceInr) {
      await tx.priceHistory.create({ data: { carId: car.id, oldPrice: existing.priceInr, newPrice: data.priceInr, changedById: user.id } });
    }

    if (data.inspection !== undefined) {
      await tx.inspection.deleteMany({ where: { carId: car.id } });
      if (data.inspection && data.inspection.items.length) {
        await tx.inspection.create({
          data: {
            carId: car.id,
            inspectedBy: data.inspection.inspectedBy ?? null,
            inspectedOn: data.inspection.inspectedOn ? new Date(data.inspection.inspectedOn) : null,
            summary: data.inspection.summary ?? null,
            items: { create: data.inspection.items.map((it) => ({ section: it.section, item: it.item, result: it.result, note: it.note || null })) },
          },
        });
      }
    }

    // Slug changed on a car that was public → keep the old URL working.
    if (existing && existing.slug !== slug && existing.publishedAt) {
      await tx.redirect.upsert({ where: { fromPath: `/cars/${existing.slug}` }, update: { toPath: `/cars/${slug}` }, create: { fromPath: `/cars/${existing.slug}`, toPath: `/cars/${slug}` } });
    }
    // A live car must never be shadowed by an old redirect.
    await tx.redirect.deleteMany({ where: { fromPath: `/cars/${slug}` } });
    return car;
  });

  const { highlights: _h, features: _f, disclosures: _d, ...auditable } = fields;
  void _h; void _f; void _d;
  await audit(user.id, existing ? "update" : "create", "car", car.id, existing ? diffFields(existing as unknown as Record<string, unknown>, auditable) : { title, status: data.status, priceInr: data.priceInr });
  if (existing && existing.status !== data.status) await audit(user.id, `status:${data.status}`, "car", car.id);
  return { id: car.id, slug: car.slug, status: car.status };
}

export type BulkAction = "publish" | "unpublish" | "reserve" | "sold" | "archive" | "feature" | "unfeature" | "delete" | "restore" | "purge";

const STATUS_FOR: Partial<Record<BulkAction, CarStatus>> = { publish: "published", unpublish: "draft", reserve: "reserved", sold: "sold", archive: "archived" };

export async function bulkCars(user: CurrentUser, ids: string[], action: BulkAction) {
  if (!ids.length) return 0;
  const now = new Date();
  if (action === "delete") {
    if (!can(user.role, "cars.delete")) throw new ActionError("You don't have permission to delete cars.");
    const cars = await db.car.findMany({ where: { id: { in: ids }, deletedAt: null }, select: { id: true, slug: true } });
    for (const c of cars) {
      const to = await fallbackPathFor(c.id);
      await db.$transaction([
        db.car.update({ where: { id: c.id }, data: { deletedAt: now, updatedById: user.id } }),
        db.redirect.upsert({ where: { fromPath: `/cars/${c.slug}` }, update: { toPath: to, code: 301 }, create: { fromPath: `/cars/${c.slug}`, toPath: to, code: 301 } }),
      ]);
      await audit(user.id, "delete", "car", c.id, { redirect: to });
    }
    return cars.length;
  }
  if (action === "restore") {
    if (!can(user.role, "cars.delete")) throw new ActionError("You don't have permission to restore cars.");
    const cars = await db.car.findMany({ where: { id: { in: ids }, deletedAt: { not: null } }, select: { id: true, slug: true } });
    for (const c of cars) {
      await db.$transaction([
        db.car.update({ where: { id: c.id }, data: { deletedAt: null, updatedById: user.id } }),
        db.redirect.deleteMany({ where: { fromPath: `/cars/${c.slug}` } }),
      ]);
      await audit(user.id, "restore", "car", c.id);
    }
    return cars.length;
  }
  if (action === "purge") {
    if (!can(user.role, "cars.purge")) throw new ActionError("Only the owner can permanently delete cars.");
    const cars = await db.car.findMany({ where: { id: { in: ids }, deletedAt: { not: null } }, select: { id: true, title: true } });
    for (const c of cars) {
      await db.$transaction([
        db.lead.updateMany({ where: { carId: c.id }, data: { carId: null } }),
        db.booking.updateMany({ where: { carId: c.id }, data: { carId: null } }),
        db.car.delete({ where: { id: c.id } }),
      ]);
      await audit(user.id, "purge", "car", c.id, { title: c.title });
    }
    return cars.length;
  }

  if (!can(user.role, "cars.publish")) throw new ActionError("Only a manager can change a car's status.");
  const cars = await db.car.findMany({ where: { id: { in: ids }, deletedAt: null }, select: { id: true, status: true, publishedAt: true, priceInr: true, _count: { select: { images: true } } } });
  let n = 0;
  for (const c of cars) {
    if (action === "feature" || action === "unfeature") {
      await db.car.update({ where: { id: c.id }, data: { featured: action === "feature", updatedById: user.id } });
    } else {
      const status = STATUS_FOR[action]!;
      if (status === "published" && c._count.images === 0) continue; // can't publish without photos
      await db.car.update({
        where: { id: c.id },
        data: {
          status,
          publishedAt: status === "published" && !c.publishedAt ? now : undefined,
          soldAt: status === "sold" ? now : status === "published" ? null : undefined,
          soldPriceInr: status === "sold" ? c.priceInr : undefined,
          updatedById: user.id,
        },
      });
    }
    await audit(user.id, action === "feature" || action === "unfeature" ? action : `status:${STATUS_FOR[action]}`, "car", c.id);
    n++;
  }
  return n;
}

export async function inlineUpdate(user: CurrentUser, id: string, patch: { priceInr?: number; status?: CarStatus; featured?: boolean }) {
  const car = await db.car.findFirst({ where: { id, deletedAt: null } });
  if (!car) throw new ActionError("Car not found");
  if (patch.status !== undefined && patch.status !== car.status && !canSetStatus(user.role, patch.status)) throw new ActionError("You don't have permission to change status.");
  if ((patch.featured !== undefined || patch.priceInr !== undefined) && !can(user.role, "cars.publish") && car.status !== "draft") {
    throw new ActionError("Only a manager can change a live car.");
  }
  if (patch.status === "published" && (await db.carImage.count({ where: { carId: id } })) === 0) throw new ActionError("Add a photo before publishing.");
  if (patch.priceInr !== undefined && (patch.priceInr < 10_000 || patch.priceInr > 10_00_00_000)) throw new ActionError("Price looks wrong");

  const data: Record<string, unknown> = { ...patch, updatedById: user.id };
  if (patch.status === "published" && !car.publishedAt) data.publishedAt = new Date();
  if (patch.status === "sold") Object.assign(data, { soldAt: new Date(), soldPriceInr: car.priceInr });
  if (patch.priceInr !== undefined && patch.priceInr < car.priceInr && car.status === "published" && !car.badge) data.badge = "Price drop";

  await db.car.update({ where: { id }, data });
  if (patch.priceInr !== undefined && patch.priceInr !== car.priceInr) {
    await db.priceHistory.create({ data: { carId: id, oldPrice: car.priceInr, newPrice: patch.priceInr, changedById: user.id } });
  }
  await audit(user.id, "inline_update", "car", id, diffFields(car as unknown as Record<string, unknown>, patch));
}

export async function duplicateCar(user: CurrentUser, id: string) {
  const src = await db.car.findFirst({ where: { id, deletedAt: null }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  if (!src) throw new ActionError("Car not found");
  const title = `${src.title} (copy)`;
  const slug = await uniqueSlug(`${src.slug}-copy`, slugTaken());
  const { id: _id, slug: _s, stockNo: _n, createdAt: _c, updatedAt: _u, publishedAt: _p, soldAt: _sa, soldPriceInr: _sp, views: _v, regNumber: _r, regNumberMasked: _rm, deletedAt: _d, images, ...rest } = src;
  void [_id, _s, _n, _c, _u, _p, _sa, _sp, _v, _r, _rm, _d];
  const copy = await db.car.create({
    data: {
      ...rest,
      title,
      slug,
      status: "draft",
      stockNo: await nextStockNo(),
      views: 0,
      badge: null,
      demoFields: "[]",
      createdById: user.id,
      updatedById: user.id,
      images: { create: images.map(({ url, alt, category, sortOrder, isHero }) => ({ url, alt, category, sortOrder, isHero })) },
    },
  });
  await audit(user.id, "duplicate", "car", copy.id, { from: id });
  return { id: copy.id };
}
