import type { Metadata } from "next";
import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { leadScope } from "@/lib/admin/leads-service";
import { formatDate, formatInr } from "@/lib/format";

export const metadata: Metadata = { title: "Bookings" };

const KIND: Record<string, string> = { test_drive: "Test drive", reservation: "Reservation", sell_inspection: "Sell inspection" };

const yesterday = () => new Date(Date.now() - 86_400_000);

/** Upcoming test drives, reservations and sell inspections grouped by day (BRIEF §16.6 — list view for the demo). */
export default async function BookingsPage() {
  const user = await requirePageUser();
  const bookings = await db.booking.findMany({
    where: { lead: leadScope(user), OR: [{ slot: { gte: yesterday() } }, { slot: null }] },
    orderBy: { slot: "asc" },
    include: { lead: { select: { id: true, name: true, phone: true } }, car: { select: { id: true, title: true } } },
  });
  const groups = new Map<string, typeof bookings>();
  for (const b of bookings) {
    const key = b.slot ? formatDate(b.slot, { weekday: "long", day: "numeric", month: "long" }) : "No slot yet";
    groups.set(key, [...(groups.get(key) ?? []), b]);
  }
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Bookings</h1>
      <p className="mb-5 mt-1 text-sm text-muted">Test drives, reservations and sell-car inspections. Online token payment is not switched on in the demo.</p>
      {bookings.length === 0 && <div className="card p-10 text-center text-muted">Nothing booked.</div>}
      <div className="space-y-5">
        {[...groups.entries()].map(([day, list]) => (
          <section key={day} aria-label={day}>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">{day}</h2>
            <ul className="divide-y divide-line rounded-xl border border-line bg-card">
              {list.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
                  <span className="num w-16 font-bold">{b.slot ? formatDate(b.slot, { hour: "numeric", minute: "2-digit" }) : "—"}</span>
                  <span className="chip">{KIND[b.kind] ?? b.kind}</span>
                  <span className="min-w-0 flex-1">
                    {b.lead ? <Link href={`/admin/leads/${b.lead.id}`} className="font-semibold hover:underline">{b.lead.name ?? "Lead"}</Link> : "—"}
                    {b.car && <span className="block truncate text-muted">{b.car.title}</span>}
                  </span>
                  {b.tokenAmount && <span className="num text-muted">Token {formatInr(b.tokenAmount)} · {b.paymentStatus?.replace(/_/g, " ")}</span>}
                  <span className="capitalize text-muted">{b.status}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
