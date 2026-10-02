"use client";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { compareStore, shortlistStore } from "@/lib/client/store";
import { CarCard, emiFor } from "@/components/cars/CarCard";
import { formatInr, formatKm, ordinal } from "@/lib/format";
import { priceBreakup } from "@/lib/price";
import type { FinanceSettings } from "@/lib/settings-defaults";
import type { PublicCar } from "@/lib/types";

export function CompareView({ cars, finance }: { cars: PublicCar[]; finance: FinanceSettings }) {
  const ids = compareStore.use();
  const picked = ids.map((id) => cars.find((c) => c.id === id)).filter(Boolean) as PublicCar[];

  if (picked.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg font-bold">No cars picked yet</p>
        <p className="mt-1 text-muted">Tick “Compare” on up to 3 cars in the listings.</p>
        <Link href="/cars" className="btn btn-red mt-5">Browse cars</Link>
      </div>
    );
  }

  const rows: [string, (c: PublicCar) => React.ReactNode][] = [
    ["Price", (c) => <strong>{formatInr(c.priceInr)}</strong>],
    ["Total payable", (c) => formatInr(priceBreakup(c.priceInr, c.tcsApplicable).total)],
    ["EMI from", (c) => `${formatInr(emiFor(c.priceInr, finance))}/m`],
    ["Year", (c) => c.year],
    ["Kilometres", (c) => (c.kmDriven != null ? formatKm(c.kmDriven) : "—")],
    ["Owners", (c) => (c.owners ? `${ordinal(c.owners)} owner` : "—")],
    ["Fuel", (c) => c.fuel],
    ["Gearbox", (c) => c.transmission],
    ["Body", (c) => c.bodyType ?? "—"],
    ["Seats", (c) => c.seats ?? "—"],
    ["Registration", (c) => c.rto ?? "—"],
    ["Insurance", (c) => c.insuranceType ?? "—"],
    ["Warranty", (c) => (c.warrantyIncluded ? "Included" : "—")],
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="num w-full min-w-[640px] text-sm">
        <caption className="sr-only">Comparison of {picked.length} cars</caption>
        <thead>
          <tr>
            <th scope="col" className="w-36 p-3 text-left align-bottom text-xs uppercase tracking-wide text-muted">Car</th>
            {picked.map((c) => (
              <th key={c.id} scope="col" className="p-3 text-left align-top font-normal">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ink-3">
                  {c.heroImage && <Image src={c.heroImage} alt="" fill sizes="240px" className="object-cover" />}
                  <button type="button" onClick={() => compareStore.remove(c.id)} className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full bg-white/90" aria-label={`Remove ${c.title}`}>
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
                <Link href={`/cars/${c.slug}`} className="mt-2 block font-bold hover:underline">{c.title}</Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, get]) => (
            <tr key={label} className="border-t border-line">
              <th scope="row" className="p-3 text-left font-semibold text-muted">{label}</th>
              {picked.map((c) => (
                <td key={c.id} className="p-3">{get(c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ShortlistView({ cars, finance }: { cars: PublicCar[]; finance: FinanceSettings }) {
  const ids = shortlistStore.use();
  const list = ids.map((id) => cars.find((c) => c.id === id)).filter(Boolean) as PublicCar[];
  if (!list.length) {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg font-bold">Your shortlist is empty</p>
        <p className="mt-1 text-muted">Tap the heart on any car to save it here. It stays on this device.</p>
        <Link href="/cars" className="btn btn-red mt-5">Browse cars</Link>
      </div>
    );
  }
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((c) => (
        <li key={c.id}>
          <CarCard car={c} finance={finance} />
        </li>
      ))}
    </ul>
  );
}
