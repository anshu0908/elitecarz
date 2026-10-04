import type { Metadata } from "next";
import { TrashList } from "@/components/admin/TrashList";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";

export const metadata: Metadata = { title: "Trash" };

export default async function TrashPage() {
  const user = await requirePageUser("cars.delete");
  let cars: any[] = [];
  let redirects: any[] = [];
  try {
    cars = await db.car.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: { id: true, title: true, stockNo: true, slug: true, deletedAt: true, priceInr: true },
    });
    redirects = await db.redirect.findMany({ where: { fromPath: { in: cars.map((c) => `/cars/${c.slug}`) } } });
  } catch (err) {
    console.warn("TrashPage: db query failed:", err);
  }
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Trash</h1>
      <p className="mb-5 mt-1 text-sm text-muted">Deleted cars stay here for 30 days. Their old links redirect to the brand page so Google doesn&apos;t see broken pages.</p>
      <TrashList
        canPurge={can(user.role, "cars.purge")}
        rows={cars.map((c) => ({
          id: c.id,
          title: c.title,
          stockNo: c.stockNo,
          priceInr: c.priceInr,
          deletedAt: c.deletedAt!.toISOString(),
          redirect: redirects.find((r) => r.fromPath === `/cars/${c.slug}`)?.toPath ?? null,
          slug: c.slug,
        }))}
      />
    </div>
  );
}
