import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import { LeadControls, NoteForm, ValuationTool } from "@/components/admin/LeadDetail";
import { StatusPill } from "@/components/admin/StatusPill";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { leadScope } from "@/lib/admin/leads-service";
import { parseList, parseObject } from "@/lib/json";
import { LEAD_TYPE_LABELS, type LeadType } from "@/lib/constants";
import { formatDate, formatInr, formatPhone } from "@/lib/format";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Lead" };

export default async function LeadPage({ params, searchParams }: PageProps<"/admin/leads/[id]">) {
  const user = await requirePageUser();
  const { id } = await params;
  const { lost } = await searchParams;
  const lead = await db.lead.findFirst({
    where: { id, ...leadScope(user) },
    include: {
      car: { select: { id: true, title: true, slug: true, priceInr: true, stockNo: true } },
      assignedTo: { select: { name: true } },
      notes: { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } },
      sellRequests: true,
      bookings: { orderBy: { slot: "asc" } },
    },
  });
  if (!lead) notFound();
  const [users, audits, others] = await Promise.all([
    db.user.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    db.auditLog.findMany({ where: { entity: "lead", entityId: id }, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } }),
    lead.phone ? db.lead.findMany({ where: { phone: lead.phone, NOT: { id }, ...leadScope(user) }, select: { id: true, type: true, createdAt: true }, orderBy: { createdAt: "desc" } }) : [],
  ]);
  const payload = parseObject<Record<string, unknown>>(lead.payload);
  const utm = parseObject<Record<string, string>>(lead.utm);
  const sell = lead.sellRequests[0];
  const canEdit = can(user.role, "leads.edit");
  const when = (d: Date) => formatDate(d, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

  const timeline = [
    { at: lead.createdAt, text: `Lead received via ${lead.source ?? "website"}${lead.pageUrl ? ` (${lead.pageUrl})` : ""}` },
    ...lead.notes.map((n) => ({ at: n.createdAt, text: `${n.user?.name ?? "Staff"}: ${n.note}`, note: true })),
    ...audits.filter((a) => a.action !== "note").map((a) => ({ at: a.createdAt, text: `${a.user?.name ?? "System"} — ${a.action.replace(/[_:]/g, " ")}` })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div>
      <Link href="/admin/leads" className="text-sm text-muted hover:text-text">← Leads</Link>
      <div className="mb-5 mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">{lead.name ?? "Anonymous visitor"}</h1>
        <StatusPill status={lead.status} />
        <span className="chip">{LEAD_TYPE_LABELS[lead.type as LeadType] ?? lead.type}</span>
        {payload.demo === true && <span className="demo-tag">DEMO</span>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="font-extrabold">Contact</h2>
            {lead.phone ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="num mr-2 text-lg font-semibold">{formatPhone(lead.phone)}</span>
                <a href={whatsappLink(lead.whatsapp ?? lead.phone, `Hi ${lead.name ?? ""}, this is EliteCarz${lead.car ? ` about the ${lead.car.title}` : ""}.`)} target="_blank" rel="noopener" className="btn btn-wa btn-sm">
                  <WhatsappIcon className="size-4" /> WhatsApp
                </a>
                <a href={telLink(lead.phone)} className="btn btn-outline btn-sm"><Phone className="size-4" aria-hidden /> Call</a>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">No contact details — this is a WhatsApp click event (the conversation happens in WhatsApp).</p>
            )}
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {lead.email && <Row k="Email" v={lead.email} />}
              {lead.city && <Row k="City" v={lead.city} />}
              <Row k="Received" v={when(lead.createdAt)} />
              <Row k="Source" v={lead.source ?? "—"} />
              {Object.keys(utm).length > 0 && <Row k="Campaign" v={Object.entries(utm).map(([k, v]) => `${k.replace("utm_", "")}: ${v}`).join(", ")} />}
              {typeof payload.slot === "string" && <Row k="Requested slot" v={when(new Date(payload.slot))} />}
              {typeof payload.preferredTime === "string" && <Row k="Best time" v={payload.preferredTime} />}
              {typeof payload.employment === "string" && <Row k="Employment" v={payload.employment.replace("_", " ")} />}
              {typeof payload.monthlyIncome === "number" && <Row k="Monthly income" v={formatInr(payload.monthlyIncome)} />}
              {typeof payload.tokenAmount === "number" && <Row k="Token (on reservation)" v={formatInr(payload.tokenAmount)} />}
            </dl>
            {lead.message && <p className="mt-4 rounded-lg bg-paper p-3 text-sm">“{lead.message}”</p>}
            {others.length > 0 && (
              <p className="mt-4 rounded-lg bg-warn-soft p-3 text-sm text-warn">
                Same number has {others.length} other lead{others.length === 1 ? "" : "s"}:{" "}
                {others.map((o, i) => (
                  <span key={o.id}>{i > 0 && ", "}<Link href={`/admin/leads/${o.id}`} className="font-semibold underline">{LEAD_TYPE_LABELS[o.type as LeadType] ?? o.type} ({formatDate(o.createdAt, { day: "numeric", month: "short" })})</Link></span>
                ))}
              </p>
            )}
          </section>

          {lead.car && (
            <section className="card flex flex-wrap items-center gap-3 p-5">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Car of interest</p>
                <Link href={`/admin/cars/${lead.car.id}`} className="font-bold hover:underline">{lead.car.title}</Link>
                <p className="num text-sm text-muted">{lead.car.stockNo} · {formatInr(lead.car.priceInr)}</p>
              </div>
              <a href={`/cars/${lead.car.slug}`} target="_blank" className="btn btn-outline btn-sm">Open listing</a>
            </section>
          )}

          {sell && (
            <section className="card p-5">
              <h2 className="font-extrabold">Car they want to sell</h2>
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <Row k="Car" v={`${sell.mfgYear ?? ""} ${sell.make ?? ""} ${sell.model ?? ""} ${sell.variant ?? ""}`} />
                <Row k="Registration" v={`${sell.regNumber ?? "—"} (${sell.state ?? "—"})`} />
                <Row k="Kilometres" v={sell.kmRange ?? "—"} />
                <Row k="Owners" v={String(sell.owners ?? "—")} />
                <Row k="Fuel / gearbox" v={`${sell.fuel ?? "—"} · ${sell.transmission ?? "—"}`} />
                <Row k="Expected price" v={sell.expectedPrice ? formatInr(sell.expectedPrice) : "Not given"} />
              </dl>
              {parseList(sell.photos).length > 0 && (
                <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {parseList(sell.photos).map((p, i) => (
                    <li key={p}>
                      <a href={p} target="_blank" className="relative block aspect-square overflow-hidden rounded-lg bg-paper">
                        <Image src={p} alt={`Seller photo ${i + 1}`} fill sizes="160px" className="object-cover" unoptimized />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <ValuationTool
                sellId={sell.id}
                canEdit={canEdit}
                initial={{ offeredMin: sell.offeredMin, offeredMax: sell.offeredMax, outcome: sell.outcome, inspectionSlot: sell.inspectionSlot?.toISOString() ?? null }}
              />
            </section>
          )}

          {lead.bookings.length > 0 && (
            <section className="card p-5">
              <h2 className="font-extrabold">Bookings</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {lead.bookings.map((b) => (
                  <li key={b.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-paper px-3 py-2">
                    <span className="font-semibold capitalize">{b.kind.replace(/_/g, " ")}</span>
                    <span>{b.slot ? when(b.slot) : "No slot"}</span>
                    <span className="text-muted">{b.status}{b.tokenAmount ? ` · token ${formatInr(b.tokenAmount)} (${b.paymentStatus?.replace(/_/g, " ")})` : ""}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-5">
            <h2 className="font-extrabold">Notes & timeline</h2>
            {canEdit && <NoteForm leadId={lead.id} />}
            <ol className="mt-4 space-y-3 border-l-2 border-line pl-4">
              {timeline.map((t, i) => (
                <li key={i} className="relative text-sm">
                  <span className={`absolute -left-[23px] top-1.5 size-3 rounded-full border-2 border-card ${"note" in t ? "bg-red" : "bg-line-strong"}`} aria-hidden />
                  <p className={"note" in t ? "font-medium" : "text-muted"}>{t.text}</p>
                  <p className="text-xs text-muted">{when(t.at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside>
          <LeadControls
            lead={{ id: lead.id, status: lead.status, assignedToId: lead.assignedToId, nextFollowupAt: lead.nextFollowupAt?.toISOString() ?? null, lostReason: lead.lostReason }}
            users={users}
            canEdit={canEdit}
            canAssign={can(user.role, "leads.assign")}
            currentUserId={user.id}
            focusLost={lost === "1"}
          />
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</dt>
      <dd className="mt-0.5">{v}</dd>
    </div>
  );
}
