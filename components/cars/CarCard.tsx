import Image from "next/image";
import Link from "next/link";
import { ShortlistButton, CompareToggle } from "@/components/cars/CarToggles";
import { calculateEmi } from "@/lib/emi";
import { formatInr, formatKm, formatLakh, ordinal } from "@/lib/format";
import type { FinanceSettings } from "@/lib/settings-defaults";
import type { PublicCar } from "@/lib/types";

export function emiFor(price: number, f: FinanceSettings) {
  return calculateEmi({ principal: (price * f.maxLoanPct) / 100, annualRatePct: f.annualRatePct, tenureMonths: f.tenureMonths }).emi;
}

export function StatusBadge({ car }: { car: Pick<PublicCar, "status" | "badge"> }) {
  if (car.status === "sold") return <span className="rounded-md bg-ink px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">Sold</span>;
  if (car.status === "reserved") return <span className="rounded-md bg-warn px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">Reserved</span>;
  if (car.badge === "Price drop") return <span className="rounded-md bg-red px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">Price drop</span>;
  if (car.badge) return <span className="rounded-md bg-white px-2 py-1 text-xs font-bold uppercase tracking-wide text-ink">{car.badge}</span>;
  return null;
}

export function CarCard({ car, finance, priority = false }: { car: PublicCar; finance: FinanceSettings; priority?: boolean }) {
  const sold = car.status === "sold";
  const specs = [
    car.kmDriven != null ? formatKm(car.kmDriven) : null,
    car.fuel,
    car.transmission,
    car.owners ? `${ordinal(car.owners)} owner` : null,
  ].filter(Boolean);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-3">
        {car.heroImage && (
          <Image
            src={car.heroImage}
            alt={car.title}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 45vw, 92vw"
            className={`object-cover transition duration-500 group-hover:scale-[1.03] ${sold ? "grayscale-[60%]" : ""}`}
          />
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <StatusBadge car={car} />
        </div>
        <div className="absolute right-2 top-2">
          <ShortlistButton carId={car.id} title={car.title} />
        </div>
        <span className="num absolute bottom-2 left-3 rounded bg-black/60 px-1.5 py-0.5 text-[0.7rem] font-medium text-white">{car.images.length} photos</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[1.05rem] font-bold leading-tight" style={{ fontStretch: "100%" }}>
            <Link href={`/cars/${car.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {car.year} {car.make} {car.model}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted">{car.variant}</p>
        </div>
        <p className="num flex flex-wrap gap-x-2 gap-y-1 text-[0.8rem] text-muted">
          {specs.map((s, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="size-1 rounded-full bg-line-strong" />}
              {s}
            </span>
          ))}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-line pt-3">
          <div>
            <p className="num font-display text-[1.35rem] font-bold leading-none">
              <span className="sr-only">Price </span>
              {formatLakh(car.priceInr)}
            </p>
            {!sold && (
              <p className="num mt-1 text-xs text-muted">
                EMI from {formatInr(emiFor(car.priceInr, finance))}/m
              </p>
            )}
          </div>
          <div className="relative z-10 flex flex-col items-end gap-1">
            {car.rto && <span className="chip num" title="Registration (RTO)">{car.rto} reg.</span>}
            {!sold && <CompareToggle carId={car.id} />}
          </div>
        </div>
      </div>
    </article>
  );
}
