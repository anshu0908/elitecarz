import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CalendarClock, ImageOff, Plus, ShieldAlert, Timer, UserPlus, Zap } from "lucide-react";
import { LeadsChart } from "@/components/admin/LeadsChart";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { leadScope } from "@/lib/admin/leads-service";
import { daysSince, formatDate, formatLakh } from "@/lib/format";
import { LEAD_TYPE_LABELS, type LeadType } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard" };

const DAY = 86_400_000;

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const user = await requirePageUser("dashboard.view");
  const { denied } = await searchParams;
  const now = new Date();
  const istMidnight = new Date(Math.floor((now.getTime() + 330 * 60_000) / DAY) * DAY - 330 * 60_000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const scope = leadScope(user);
  const formLeads = { ...scope, type: { not: "whatsapp_click" } };

  const [stock, soldThisMonth, leadsToday, leadsWeek, followupsDue, untouched, recentLeads, clicks14, insuranceSoon, noPhotos, topViewed] = await Promise.all([
    db.car.findMany({ where: { deletedAt: null, status: { in: ["published", "reserved", "draft"] } }, select: { id: true, title: true, status: true, publishedAt: true, createdAt: true, priceInr: true, _count: { select: { leads: true } } } }),
    db.car.count({ where: { deletedAt: null, status: "sold", soldAt: { gte: monthStart } } }),
    db.lead.count({ where: { ...formLeads, createdAt: { gte: istMidnight } } }),
    db.lead.count({ where: { ...formLeads, createdAt: { gte: new Date(now.getTime() - 7 * DAY) } } }),
    db.lead.findMany({ where: { ...scope, nextFollowupAt: { lte: new Date(now.getTime() + DAY) }, status: { notIn: ["won", "lost", "spam"] } }, orderBy: { nextFollowupAt: "asc" }, take: 6, select: { id: true, name: true, nextFollowupAt: true, type: true } }),
    db.lead.findMany({ where: { ...formLeads, status: "new", createdAt: { lt: new Date(now.getTime() - DAY) } }, select: { id: true, name: true, createdAt: true, type: true }, take: 6 }),
    db.lead.findMany({ where: { ...formLeads, createdAt: { gte: new Date(istMidnight.getTime() - 13 * DAY) } }, select: { createdAt: true, source: true } }),
    db.lead.count({ where: { ...scope, type: "whatsapp_click", createdAt: { gte: new Date(now.getTime() - 14 * DAY) } } }),
    db.car.findMany({ where: { deletedAt: null, status: { in: ["published", "reserved"] }, insuranceValidTill: { lte: new Date(now.getTime() + 30 * DAY) } }, select: { id: true, title: true, insuranceValidTill: true } }),
    db.car.findMany({ where: { deletedAt: null, images: { none: {} } }, select: { id: true, title: true } }),
    db.car.findMany({ where: { deletedAt: null, status: "published" }, orderBy: { views: "desc" }, take: 5, select: { id: true, title: true, views: true, _count: { select: { leads: true } } } }),
  ]);

  const live = stock.filter((c) => c.status !== "draft");
  const published = stock.filter((c) => c.status === "published").length;
  const reserved = stock.filter((c) => c.status === "reserved").length;
  const avgDays = live.length ? Math.round(live.reduce((s, c) => s + daysSince(c.publishedAt ?? c.createdAt, now), 0) / live.length) : 0;
  const aged = live.map((c) => ({ ...c, days: daysSince(c.publishedAt ?? c.createdAt, now) })).filter((c) => c.days > 45).sort((a, b) => b.days - a.days);

  // Leads per IST day, last 14 days.
  const days = Array.from({ length: 14 }, (_, i) => {
    const start = new Date(istMidnight.getTime() - (13 - i) * DAY);
    return { date: start.toISOString(), count: recentLeads.filter((l) => l.createdAt >= start && l.createdAt.getTime() < start.getTime() + DAY).length };
  });
  const bySource = Object.entries(recentLeads.reduce<Record<string, number>>((a, l) => ((a[l.source ?? "website"] = (a[l.source ?? "website"] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {denied && <p role="alert" className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">You don&apos;t have access to that page.</p>}
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-auto">
          <h1 className="text-2xl font-extrabold">Good {Math.floor((now.getTime() / 3_600_000 + 5.5) % 24) < 12 ? "morning" : Math.floor((now.getTime() / 3_600_000 + 5.5) % 24) < 17 ? "afternoon" : "evening"}, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted">{formatDate(now, { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        {can(user.role, "cars.edit") && (
          <>
            <Link href="/admin/cars/new?quick=1" className="btn btn-outline btn-sm"><Zap className="size-4" aria-hidden /> Quick add car</Link>
            <Link href="/admin/cars/new" className="btn btn-red btn-sm"><Plus className="size-4" aria-hidden /> Add car</Link>
          </>
        )}
        {can(user.role, "leads.edit") && <Link href="/admin/leads" className="btn btn-outline btn-sm"><UserPlus className="size-4" aria-hidden /> Leads</Link>}
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Kpi label="In stock" value={live.length} href="/admin/cars" />
        <Kpi label="Published" value={published} href="/admin/cars?status=published" />
        <Kpi label="Reserved" value={reserved} href="/admin/cars?status=reserved" />
        <Kpi label="Sold this month" value={soldThisMonth} href="/admin/cars?status=sold" />
        <Kpi label="New leads today" value={leadsToday} sub={`${leadsWeek} this week`} href="/admin/leads" accent={leadsToday > 0} />
        <Kpi label="Follow-ups due" value={followupsDue.length} href="/admin/leads?view=list" accent={followupsDue.some((f) => f.nextFollowupAt! < now)} />
        <Kpi label="Avg days in stock" value={avgDays} />
      </dl>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="card p-5" aria-labelledby="chart-h">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="chart-h" className="font-extrabold">Leads per day — last 14 days</h2>
            <p className="num text-sm text-muted">{recentLeads.length} form leads · {clicks14} WhatsApp clicks</p>
          </div>
          <LeadsChart days={days} />
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            {bySource.map(([s, n]) => (
              <li key={s} className="chip capitalize">{s} <span className="num text-muted">{n}</span></li>
            ))}
          </ul>
        </section>

        <section className="card p-5" aria-labelledby="alerts-h">
          <h2 id="alerts-h" className="font-extrabold">Needs attention</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {untouched.map((l) => (
              <Alert key={l.id} icon={Timer} tone="bad" href={`/admin/leads/${l.id}`}>
                {l.name ?? "Lead"} ({LEAD_TYPE_LABELS[l.type as LeadType]}) untouched for {Math.floor((now.getTime() - l.createdAt.getTime()) / 3_600_000)} h
              </Alert>
            ))}
            {followupsDue.filter((f) => f.nextFollowupAt! < now).map((l) => (
              <Alert key={l.id} icon={CalendarClock} tone="bad" href={`/admin/leads/${l.id}`}>
                Follow-up overdue: {l.name ?? "Lead"}
              </Alert>
            ))}
            {aged.slice(0, 5).map((c) => (
              <Alert key={c.id} icon={AlertTriangle} tone={c.days > 90 ? "bad" : "warn"} href={`/admin/cars/${c.id}`}>
                {c.title} — {c.days} days in stock{c._count.leads === 0 ? ", no enquiries" : ""}
              </Alert>
            ))}
            {insuranceSoon.map((c) => (
              <Alert key={c.id} icon={ShieldAlert} tone="warn" href={`/admin/cars/${c.id}`}>
                Insurance {c.insuranceValidTill! < now ? "expired" : "expires"} {formatDate(c.insuranceValidTill!)}: {c.title}
              </Alert>
            ))}
            {noPhotos.map((c) => (
              <Alert key={c.id} icon={ImageOff} tone="warn" href={`/admin/cars/${c.id}#photos`}>
                No photos: {c.title}
              </Alert>
            ))}
            {!untouched.length && !aged.length && !insuranceSoon.length && !noPhotos.length && <li className="text-muted">All clear.</li>}
          </ul>
        </section>
      </div>

      <section className="card p-5" aria-labelledby="top-h">
        <h2 id="top-h" className="font-extrabold">Most viewed cars</h2>
        <table className="num mt-3 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted">
            <tr><th className="pb-2 font-semibold">Car</th><th className="pb-2 text-right font-semibold">Views</th><th className="pb-2 text-right font-semibold">Leads</th><th className="pb-2 text-right font-semibold">Lead rate</th></tr>
          </thead>
          <tbody>
            {topViewed.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="py-2"><Link href={`/admin/cars/${c.id}`} className="hover:underline">{c.title}</Link></td>
                <td className="py-2 text-right">{c.views}</td>
                <td className="py-2 text-right">{c._count.leads}</td>
                <td className="py-2 text-right">{c.views ? ((c._count.leads / c.views) * 100).toFixed(1) : "0.0"}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-muted">Stock value listed: {formatLakh(live.reduce((s, c) => s + c.priceInr, 0))}. View counts on seeded cars are <span className="demo-tag">DEMO</span> numbers.</p>
      </section>
    </div>
  );
}

function Kpi({ label, value, sub, href, accent }: { label: string; value: number; sub?: string; href?: string; accent?: boolean }) {
  const body = (
    <>
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className={`num mt-1 font-display text-[1.9rem] font-extrabold leading-none ${accent ? "text-red" : ""}`}>{value}</dd>
      {sub && <dd className="num mt-1 text-xs text-muted">{sub}</dd>}
    </>
  );
  return href ? (
    <Link href={href} className="card block p-4 transition hover:border-ink">{body}</Link>
  ) : (
    <div className="card p-4">{body}</div>
  );
}

function Alert({ icon: Icon, tone, href, children }: { icon: typeof Timer; tone: "warn" | "bad"; href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-paper">
        <Icon className={`mt-0.5 size-4 shrink-0 ${tone === "bad" ? "text-bad" : "text-warn"}`} aria-hidden />
        <span>{children}</span>
      </Link>
    </li>
  );
}
