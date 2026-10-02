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
  const [leads, users, cars, stock] = await Promise.all([
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

  const cards: LeadCard[] = leads.map((l) => ({
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
    notes: l._count.notes,
    duplicate: !!parseObject<{ duplicateOf?: string }>(l.payload).duplicateOf,
    demo: !!parseObject<{ demo?: boolean }>(l.payload).demo,
  }));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-extrabold">Leads</h1>
        {can(user.role, "export") && (
          <a href="/api/admin/export/leads" className="btn btn-outline btn-sm">
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
