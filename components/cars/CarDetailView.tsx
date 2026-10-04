import Link from "next/link";
import { AlertTriangle, BadgeCheck, CheckCircle2, CircleDashed, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { Gallery } from "@/components/cars/Gallery";
import { CarActions, ShareRow } from "@/components/cars/CarActions";
import { EmiCalculator } from "@/components/cars/EmiCalculator";
import { InspectionReport, NoInspection } from "@/components/cars/InspectionReport";
import { CarCard, emiFor, StatusBadge } from "@/components/cars/CarCard";
import { RecentlyViewed } from "@/components/cars/RecentlyViewed";
import { Breadcrumbs } from "@/components/site/Section";
import { JsonLd } from "@/components/site/JsonLd";
import { DemoTag } from "@/components/ui/Demo";
import type { PublicSettings } from "@/lib/settings";
import type { PublicCar, PublicCarDetail } from "@/lib/types";
import { similarCars } from "@/lib/filters";
import { formatDate, formatInr, formatKm, formatLakh, ordinal } from "@/lib/format";
import { priceBreakup } from "@/lib/price";
import { rtoLabel } from "@/lib/constants";
import { abs, breadcrumbJsonLd, carJsonLd } from "@/lib/seo";

const DOC_LABELS: Record<string, string> = {
  rc: "RC (registration certificate)",
  insurance: "Insurance policy",
  service_history: "Service history",
  pollution: "PUC certificate",
  challan_check: "No pending challans",
  loan_noc: "Loan NOC / hypothecation cleared",
  inspection_pdf: "Inspection PDF",
};

type Lender = { name: string; minRate: number; maxRate: number; maxTenureMonths: number };

/** Car detail body — shared by the public page and the admin draft preview. */
export function CarDetailView({ car, all, settings, lenders }: { car: PublicCarDetail; all: PublicCar[]; settings: PublicSettings; lenders: Lender[] }) {
  const b = settings.business;
  const breakup = priceBreakup(car.priceInr, car.tcsApplicable);
  const similar = similarCars(all, car);
  const url = abs(`/cars/${car.slug}`);
  const demo = new Set(car.demoFields);
  const sold = car.status === "sold";

  const specs: [string, React.ReactNode][] = [
    ["Manufactured", car.year],
    ["Registered", car.registrationYear ?? "—"],
    ["Kilometres", car.kmDriven != null ? formatKm(car.kmDriven) : "—"],
    ["Ownership", car.owners ? `${ordinal(car.owners)} owner` : "—"],
    ["Fuel", car.fuel],
    ["Gearbox", car.transmission],
    ["Body type", car.bodyType ?? "—"],
    ["Seats", car.seats ?? "—"],
    ["Colour", car.color ?? "—"],
    ["Registration", car.rto ? <span key="rto">{rtoLabel(car.rto)}{car.regNumberMasked && <span className="block text-xs text-muted">{car.regNumberMasked}</span>}</span> : "—"],
    [
      "Insurance",
      car.insuranceType ? (
        <span key="ins">
          {car.insuranceType}
          {car.insuranceValidTill && <span className="block text-xs text-muted">valid till {formatDate(car.insuranceValidTill)}</span>}
        </span>
      ) : (
        "Ask us"
      ),
    ],
    ["Stock no.", car.stockNo ?? "—"],
  ];

  return (
    <div className="container-x py-6 md:py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Buy a car", path: "/cars" }, { name: `${car.make} ${car.model}` }]} />

      {/* Phones: gallery → price box → details. Desktop: gallery + details on the left, sticky price box on the right. */}
      <div className="mt-4 grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-y-10">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <Gallery images={car.images} title={car.title} sold={sold} />
        </div>

        {/* RIGHT: sticky price box */}
        <aside className="lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start" aria-label="Price and actions">
          <div className="card p-5 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge car={car} />
              {!sold && <span className="chip border-ok/25 bg-ok-soft text-ok">Fixed price</span>}
            </div>
            <h1 className="mt-3 text-[1.55rem] font-extrabold leading-tight">{car.title}</h1>
            <p className="num mt-1.5 text-sm text-muted">
              {[car.kmDriven != null ? formatKm(car.kmDriven) : null, car.fuel, car.transmission, car.owners ? `${ordinal(car.owners)} owner` : null].filter(Boolean).join(" · ")}
            </p>

            <div className="mt-4 border-t border-line pt-4">
              {car.priceDrop && (
                <p className="num text-sm text-muted">
                  <s>{formatInr(car.priceDrop.oldPrice)}</s> <span className="font-semibold text-red">Save {formatInr(car.priceDrop.oldPrice - car.priceDrop.newPrice)}</span>
                </p>
              )}
              <p className="num font-display text-[2.1rem] font-extrabold leading-none">{formatInr(car.priceInr)}</p>
              <dl className="num mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted">RC transfer & paperwork</dt><dd className="font-semibold text-ok">Included</dd></div>
                <div className="flex justify-between">
                  <dt className="text-muted">TCS {breakup.tcsApplies ? "(1%, claimable in ITR)" : ""}</dt>
                  <dd className="font-semibold">{breakup.tcsApplies ? formatInr(breakup.tcs) : "Not applicable"}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-base"><dt className="font-bold">Total payable</dt><dd className="font-bold">{formatInr(breakup.total)}</dd></div>
              </dl>
              {!sold && (
                <a href="#emi" className="num mt-2 inline-block text-sm font-semibold text-red hover:underline">
                  EMI from {formatInr(emiFor(car.priceInr, settings.finance))}/month
                </a>
              )}
            </div>

            <div className="mt-5">
              <CarActions car={{ id: car.id, slug: car.slug, title: car.title, priceInr: car.priceInr, stockNo: car.stockNo, status: car.status }} whatsapp={b.whatsapp} phone={b.phone} booking={settings.booking} url={url} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 print:hidden">
            <ShareRow title={`${car.title} — ${formatLakh(car.priceInr)}`} url={url} />
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <FileText className="size-3.5" aria-hidden /> Listed {car.publishedAt ? formatDate(car.publishedAt) : ""} · {car.views} views
          </p>
        </aside>

        <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-2">

          <section aria-labelledby="specs">
            <h2 id="specs" className="text-xl font-extrabold">Specifications</h2>
            <dl className="num mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
              {specs.map(([k, v]) => (
                <div key={k} className="bg-card p-3.5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {(car.description || car.highlights.length > 0) && (
            <section aria-labelledby="about-car">
              <h2 id="about-car" className="text-xl font-extrabold">About this car {demo.has("highlights") && <DemoTag />}</h2>
              {car.description && <p className="mt-3 max-w-prose leading-relaxed text-[#2b2b2b]">{car.description}</p>}
              {car.highlights.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {car.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5">
                      <BadgeCheck className="mt-0.5 size-5 shrink-0 text-red" aria-hidden /> {h}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {car.features.length > 0 && (
            <section aria-labelledby="features">
              <h2 id="features" className="text-xl font-extrabold">Features {demo.has("features") && <DemoTag title="From the manufacturer's spec for this variant — to be checked against the car" />}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {car.features.map((f) => (
                  <li key={f} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-sm">
                    <Sparkles className="size-3.5 text-red" aria-hidden /> {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="disclosures-h" id="disclosures" className="scroll-mt-24">
            <h2 className="text-xl font-extrabold" id="disclosures-h">Known issues, disclosed {demo.has("disclosures") && <DemoTag />}</h2>
            {car.disclosures.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {car.disclosures.map((d) => (
                  <li key={d} className="flex gap-2.5 rounded-lg bg-warn-soft px-3 py-2.5 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden /> {d}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Nothing disclosed on this listing yet. Anything we find during inspection is listed here before you visit.</p>
            )}
          </section>

          <section aria-labelledby="inspection-h" id="inspection" className="scroll-mt-24">
            <h2 id="inspection-h" className="mb-4 text-xl font-extrabold">Inspection report</h2>
            {car.inspection ? <InspectionReport inspection={car.inspection} /> : <NoInspection />}
          </section>

          <section aria-labelledby="docs">
            <h2 id="docs" className="text-xl font-extrabold">Documents</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {Object.entries(DOC_LABELS)
                .filter(([type]) => type !== "inspection_pdf")
                .map(([type, label]) => {
                  const doc = car.documents.find((d) => d.type === type);
                  const ok = doc?.verified;
                  return (
                    <li key={type} className="flex items-center gap-2.5 rounded-lg border border-line bg-card px-3 py-2.5 text-sm">
                      {ok ? <CheckCircle2 className="size-5 shrink-0 text-ok" aria-hidden /> : <CircleDashed className="size-5 shrink-0 text-muted" aria-hidden />}
                      <span className="flex-1">{label}</span>
                      <span className={`text-xs font-semibold ${ok ? "text-ok" : "text-muted"}`}>{ok ? "Verified" : "Ask us"}</span>
                    </li>
                  );
                })}
            </ul>
            <p className="mt-2 text-xs text-muted">Originals are shown at the showroom. Verification status is set by our team <DemoTag />.</p>
          </section>

          <section aria-labelledby="warranty-h">
            <h2 id="warranty-h" className="text-xl font-extrabold">Warranty</h2>
            <div className="mt-3 flex gap-3 rounded-xl border border-line bg-card p-4">
              <ShieldCheck className="size-6 shrink-0 text-red" aria-hidden />
              <div className="text-sm">
                <p className="font-semibold">
                  {car.warrantyIncluded ? "Warranty included" : "No warranty on this car"}
                  {car.warrantyMonths ? ` · ${car.warrantyMonths} months` : ""}
                  {car.warrantyKm ? ` / ${formatKm(car.warrantyKm)}` : ""} {demo.has("warranty") && <DemoTag />}
                </p>
                {car.warrantyNote && <p className="mt-1 text-muted">{car.warrantyNote}</p>}
                <Link href="/warranty" className="mt-2 inline-block font-semibold text-red hover:underline">What&apos;s covered</Link>
              </div>
            </div>
          </section>

          {!sold && (
            <section aria-labelledby="emi-h" id="emi" className="scroll-mt-24">
              <h2 id="emi-h" className="mb-4 text-xl font-extrabold">EMI calculator</h2>
              <EmiCalculator price={car.priceInr} finance={settings.finance} lenders={lenders} carId={car.id} />
            </section>
          )}

          <section className="card flex flex-wrap items-center justify-between gap-4 p-5 print:hidden">
            <div>
              <h2 className="text-lg font-extrabold">Trading in your current car?</h2>
              <p className="text-sm text-muted">Get an indicative value in a minute and use it towards this one.</p>
            </div>
            <Link href="/sell-your-car" className="btn btn-dark">Value my car</Link>
          </section>
        </div>


      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar" className="mt-16 print:hidden">
          <h2 id="similar" className="mb-5 text-2xl font-extrabold">Similar cars</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((c) => (
              <CarCard key={c.id} car={c} finance={settings.finance} />
            ))}
          </div>
        </section>
      )}
      <RecentlyViewed cars={all.map((c) => ({ id: c.id, slug: c.slug, title: c.title, heroImage: c.heroImage, priceInr: c.priceInr }))} currentId={car.id} />

      <JsonLd data={carJsonLd(car)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Buy a car", path: "/cars" }, { name: car.title, path: `/cars/${car.slug}` }])} />
    </div>
  );
}
