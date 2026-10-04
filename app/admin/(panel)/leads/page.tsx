import type { Metadata } from "next";
import { Download } from "lucide-react";
import { LeadsBoard, type LeadCard } from "@/components/admin/LeadsBoard";
import { NewLeadButton } from "@/components/admin/NewLeadButton";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { leadScope } from "@/lib/admin/leads-service";
import { parseObject } from "@/lib/json";
import type { Prisma } from "@/lib/generated/prisma/client";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const user = await requirePageUser();
  if (!can(user.role, "leads.viewOwn") && !can(user.role, "leads.viewAll")) return <p>Not allowed.</p>;
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const showClicks = str("clicks") === "1";

  const where: Prisma.LeadWhereInput = {
    ...leadScope(user),
    ...(str("type") ? { type: str("type") } : showClicks ? {} : { type: { not: "whatsapp_click" } }),
    ...(str("car") ? { carId: str("car") } : {}),
    ...(str("assignee") ? { assignedToId: str("assignee") === "none" ? null : str("assignee") } : {}),
    ...(str("source") ? { source: str("source") } : {}),
  };
  let leads: any[] = [];
  let users: { id: string; name: string }[] = [];
  let cars: { id: string; title: string }[] = [];
  let stock: { id: string; title: string }[] = [];

  try {
    [leads, users, cars, stock] = await Promise.all([
      db.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 500,
        include: { car: { select: { title: true, id: true } }, assignedTo: { select: { name: true } }, _count: { select: { notes: true } } },
      }),
      db.user.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
      db.car.findMany({ where: { deletedAt: null, leads: { some: {} } }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
      db.car.findMany({ where: { deletedAt: null, status: { in: ["published", "reserved", "draft"] } }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    ]);
  } catch (err) {
    console.warn("LeadsPage: db query failed:", err);
  }

  if (users.length === 0) {
    users = [
      { id: "demo-owner", name: "Owner (Demo)" },
      { id: "demo-manager", name: "Manager (Demo)" },
      { id: "demo-sales", name: "Sales (Demo)" },
    ];
  }

  if (stock.length === 0) {
    const { getCatalogCarsFallback } = await import("@/lib/catalog-fallback");
    stock = getCatalogCarsFallback().map((c) => ({ id: c.id, title: c.title }));
    cars = stock.slice(0, 5);
  }

  const now = new Date();
  let cards: LeadCard[] = [];
  if (leads.length > 0) {
    cards = leads.map((l) => ({
      id: l.id,
      type: l.type,
      status: l.status,
      name: l.name,
      phone: l.phone,
      car: l.car?.title ?? null,
      source: l.source,
      assignee: l.assignedTo?.name ?? null,
      createdAt: l.createdAt.toISOString(),
      nextFollowupAt: l.nextFollowupAt?.toISOString() ?? null,
      overdue: !!l.nextFollowupAt && l.nextFollowupAt < now && !["won", "lost", "spam"].includes(l.status),
      notes: l._count?.notes ?? 0,
      duplicate: !!parseObject<{ duplicateOf?: string }>(l.payload).duplicateOf,
      demo: !!parseObject<{ demo?: boolean }>(l.payload).demo,
    }));
  } else {
    cards = [
      {
        id: "lead-demo-1",
        type: "enquiry",
        status: "new",
        name: "Rohit Malhotra (DEMO)",
        phone: "9810000001",
        car: stock[0]?.title ?? "2023 MG Hector Plus Sharp Pro CVT",
        source: "website",
        assignee: "Sales (Demo)",
        createdAt: new Date(now.getTime() - 2 * 3600_000).toISOString(),
        nextFollowupAt: new Date(now.getTime() + 4 * 3600_000).toISOString(),
        overdue: false,
        notes: 1,
        duplicate: false,
        demo: true,
      },
      {
        id: "lead-demo-2",
        type: "test_drive",
        status: "contacted",
        name: "Neha Sharma (DEMO)",
        phone: "9810000002",
        car: stock[1]?.title ?? "2023 Jeep Compass Model S (O) Diesel AT",
        source: "google",
        assignee: "Sales (Demo)",
        createdAt: new Date(now.getTime() - 8 * 3600_000).toISOString(),
        nextFollowupAt: new Date(now.getTime() + 24 * 3600_000).toISOString(),
        overdue: false,
        notes: 2,
        duplicate: false,
        demo: true,
      },
      {
        id: "lead-demo-3",
        type: "finance",
        status: "negotiating",
        name: "Sandeep Verma (DEMO)",
        phone: "9810000004",
        car: stock[2]?.title ?? "2024 Tata Safari Accomplished Plus AT",
        source: "website",
        assignee: "Manager (Demo)",
        createdAt: new Date(now.getTime() - 24 * 3600_000).toISOString(),
        nextFollowupAt: new Date(now.getTime() - 2 * 3600_000).toISOString(),
        overdue: true,
        notes: 3,
        duplicate: false,
        demo: true,
      },
      {
        id: "lead-demo-4",
        type: "sell_car",
        status: "new",
        name: "Amit Kapur (DEMO)",
        phone: "9810000003",
        car: null,
        source: "website",
        assignee: null,
        createdAt: new Date(now.getTime() - 14 * 3600_000).toISOString(),
        nextFollowupAt: null,
        overdue: false,
        notes: 0,
        duplicate: false,
        demo: true,
      },
      {
        id: "lead-demo-5",
        type: "reserve",
        status: "visit_scheduled",
        name: "Priya Sundaram (DEMO)",
        phone: "9810000005",
        car: stock[3]?.title ?? "2021 Hyundai Creta SX (O) 1.4 Turbo Petrol DCT",
        source: "website",
        assignee: "Sales (Demo)",
        createdAt: new Date(now.getTime() - 36 * 3600_000).toISOString(),
        nextFollowupAt: new Date(now.getTime() + 12 * 3600_000).toISOString(),
        overdue: false,
        notes: 1,
        duplicate: false,
        demo: true,
      },
    ];
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-extrabold">Leads</h1>
        {can(user.role, "export") && (
          <a download href="/api/admin/export/leads" className="btn btn-outline btn-sm">
            <Download className="size-4" aria-hidden /> Export CSV
          </a>
        )}
        {can(user.role, "leads.edit") && <NewLeadButton cars={stock} />}
      </div>
      <LeadsBoard
        leads={cards}
        users={users}
        cars={cars}
        filters={{ type: str("type"), car: str("car"), assignee: str("assignee"), source: str("source"), view: str("view") || "board", clicks: showClicks }}
        canEdit={can(user.role, "leads.edit")}
      />
    </div>
  );
}
