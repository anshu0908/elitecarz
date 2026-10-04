import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarForm } from "@/components/admin/CarForm";
import { CarActivity } from "@/components/admin/CarActivity";
import { DuplicateButton } from "@/components/admin/DuplicateButton";
import { StatusPill } from "@/components/admin/StatusPill";
import { requirePageUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { loadCarForm, loadMasterData } from "@/lib/admin/car-form-data";

export const metadata: Metadata = { title: "Edit car" };

export default async function EditCarPage({ params }: PageProps<"/admin/cars/[id]">) {
  const user = await requirePageUser("cars.view");
  const { id } = await params;
  const viewCost = can(user.role, "cars.viewCost");
  const [car, master] = await Promise.all([loadCarForm(id, viewCost), loadMasterData()]);
  if (!car) notFound();
  let prices: any[] = [];
  let audits: any[] = [];
  let leadCount = 0;
  try {
    [prices, audits, leadCount] = await Promise.all([
      db.priceHistory.findMany({ where: { carId: id }, orderBy: { changedAt: "desc" }, take: 20, include: { changedBy: { select: { name: true } } } }),
      db.auditLog.findMany({ where: { entity: "car", entityId: id }, orderBy: { createdAt: "desc" }, take: 30, include: { user: { select: { name: true } } } }),
      db.lead.count({ where: { carId: id } }),
    ]);
  } catch (err) {
    console.warn("EditCarPage activity query error:", err);
  }
  const canEdit = can(user.role, "cars.edit") && (can(user.role, "cars.publish") || car.status === "draft");

  return (
    <div>
      <Link href="/admin/cars" className="text-sm text-muted hover:text-text">← Cars</Link>
      <div className="mb-5 mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">{car.title}</h1>
        <StatusPill status={car.status} />
        <span className="num text-sm text-muted">{car.stockNo}</span>
        <span className="ml-auto flex gap-2">
          <Link href={`/admin/leads?car=${id}`} className="btn btn-outline btn-sm">{leadCount} leads</Link>
          {can(user.role, "cars.edit") && <DuplicateButton id={id} />}
        </span>
      </div>
      {canEdit ? (
        <CarForm carId={id} initial={car} master={master} perms={{ publish: can(user.role, "cars.publish"), viewCost }} preview={{ slug: car.slug, status: car.status }} />
      ) : (
        <p className="card p-5 text-sm text-muted">You can view this car but not edit it. {car.status !== "draft" && "Live cars can only be changed by a manager."}</p>
      )}
      <CarActivity
        prices={prices.map((p) => ({ id: p.id, oldPrice: p.oldPrice, newPrice: p.newPrice, by: p.changedBy?.name ?? "—", at: p.changedAt.toISOString() }))}
        audits={audits.map((a) => ({ id: a.id, action: a.action, by: a.user?.name ?? "—", at: a.createdAt.toISOString(), diff: a.diff }))}
      />
    </div>
  );
}
