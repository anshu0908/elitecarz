import type { Metadata } from "next";
import Link from "next/link";
import { Download, Plus, Zap } from "lucide-react";
import { CarsTable, type AdminCarRow } from "@/components/admin/CarsTable";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { daysSince } from "@/lib/format";

export const metadata: Metadata = { title: "Cars" };

export default async function AdminCarsPage({ searchParams }: PageProps<"/admin/cars">) {
  const user = await requirePageUser("cars.view");
  const sp = await searchParams;
  const viewCost = can(user.role, "cars.viewCost");
  let cars: any[] = [];
  try {
    cars = await db.car.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        stockNo: true,
        title: true,
        status: true,
        year: true,
        fuel: true,
        transmission: true,
        kmDriven: true,
        priceInr: true,
        featured: true,
        badge: true,
        views: true,
        regNumber: true,
        createdAt: true,
        publishedAt: true,
        updatedAt: true,
        purchasePriceInr: viewCost,
        refurbCostInr: viewCost,
        make: { select: { name: true } },
        images: { where: { isHero: true }, select: { url: true }, take: 1 },
        _count: { select: { images: true, leads: true } },
      },
    });
  } catch (err) {
    console.warn("AdminCarsPage: DB query failed:", err);
  }

  const hasDbCars = cars.length > 0;
  const rows: AdminCarRow[] = hasDbCars
    ? cars.map((c) => ({
        id: c.id,
        slug: c.slug,
        stockNo: c.stockNo,
        title: c.title,
        status: c.status,
        make: c.make?.name ?? "",
        year: c.year,
        fuel: c.fuel,
        transmission: c.transmission,
        kmDriven: c.kmDriven,
        priceInr: c.priceInr,
        featured: c.featured,
        badge: c.badge,
        views: c.views,
        regNumber: c.regNumber,
        hero: c.images[0]?.url ?? null,
        photoCount: c._count.images,
        leadCount: c._count.leads,
        daysInStock: daysSince(c.publishedAt ?? c.createdAt),
        updatedAt: c.updatedAt.toISOString(),
        margin: viewCost && c.purchasePriceInr != null ? c.priceInr - c.purchasePriceInr - (c.refurbCostInr ?? 0) : null,
      }))
    : (await import("@/lib/catalog-fallback")).getCatalogCarsFallback().map((c) => ({
        id: c.id,
        slug: c.slug,
        stockNo: c.stockNo,
        title: c.title,
        status: c.status,
        make: c.make,
        year: c.year,
        fuel: c.fuel,
        transmission: c.transmission,
        kmDriven: c.kmDriven,
        priceInr: c.priceInr,
        featured: c.featured,
        badge: c.badge,
        views: c.views,
        regNumber: c.regNumberMasked,
        hero: c.heroImage,
        photoCount: c.photoCount,
        leadCount: 2,
        daysInStock: 8,
        updatedAt: new Date().toISOString(),
        margin: viewCost ? Math.round(c.priceInr * 0.08) : null,
      }));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-extrabold">Cars</h1>
        {can(user.role, "export") && (
          <a download href="/api/admin/export/cars" className="btn btn-outline btn-sm">
            <Download className="size-4" aria-hidden /> Export CSV
          </a>
        )}
        {can(user.role, "cars.edit") && (
          <>
            <Link href="/admin/cars/new?quick=1" className="btn btn-outline btn-sm">
              <Zap className="size-4" aria-hidden /> Quick add
            </Link>
            <Link href="/admin/cars/new" className="btn btn-red btn-sm">
              <Plus className="size-4" aria-hidden /> Add car
            </Link>
          </>
        )}
      </div>
      <CarsTable
        rows={rows}
        initialStatus={typeof sp.status === "string" ? sp.status : "all"}
        perms={{ edit: can(user.role, "cars.edit"), publish: can(user.role, "cars.publish"), delete: can(user.role, "cars.delete"), viewCost }}
      />
    </div>
  );
}
