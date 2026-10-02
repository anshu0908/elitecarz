import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { leadScope } from "@/lib/admin/leads-service";
import { toCsv } from "@/lib/csv";


export async function GET(req: NextRequest, ctx: RouteContext<"/api/admin/export/[entity]">) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "export")) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const { entity } = await ctx.params;
  const ids = req.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean);
  let rows: Record<string, unknown>[] = [];

  if (entity === "cars") {
    const cars = await db.car.findMany({
      where: { deletedAt: null, ...(ids ? { id: { in: ids } } : {}) },
      include: { make: true, model: true, variant: true, _count: { select: { leads: true, images: true } } },
      orderBy: { stockNo: "asc" },
    });
    rows = cars.map((c) => ({
      stock_no: c.stockNo, title: c.title, status: c.status, make: c.make?.name, model: c.model?.name, variant: c.variant?.name,
      year: c.year, reg_year: c.registrationYear, fuel: c.fuel, transmission: c.transmission, km: c.kmDriven, owners: c.owners,
      rto: c.rto, reg_number: c.regNumber, price_inr: c.priceInr, purchase_price_inr: c.purchasePriceInr, refurb_cost_inr: c.refurbCostInr,
      photos: c._count.images, leads: c._count.leads, views: c.views, published_at: c.publishedAt, sold_at: c.soldAt, url: `/cars/${c.slug}`,
    }));
  } else if (entity === "leads") {
    const leads = await db.lead.findMany({ where: leadScope(user), include: { car: { select: { title: true } }, assignedTo: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
    rows = leads.map((l) => ({ created_at: l.createdAt, type: l.type, status: l.status, name: l.name, phone: l.phone, email: l.email, car: l.car?.title, source: l.source, assigned_to: l.assignedTo?.name, next_followup: l.nextFollowupAt, lost_reason: l.lostReason, message: l.message }));
  } else if (entity === "audit") {
    const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20000, include: { user: { select: { email: true } } } });
    rows = logs.map((a) => ({ at: a.createdAt, user: a.user?.email, action: a.action, entity: a.entity, entity_id: a.entityId, diff: a.diff, ip: a.ip }));
  } else {
    return NextResponse.json({ error: "Unknown export" }, { status: 404 });
  }

  await audit(user.id, "export", entity, null, { rows: rows.length });
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + toCsv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="elitecarz-${entity}-${date}.csv"`, "Cache-Control": "no-store" },
  });
}
