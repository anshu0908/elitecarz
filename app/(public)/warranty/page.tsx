import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Section";
import { DemoTag } from "@/components/ui/Demo";
import { INSPECTION_POINT_COUNT, INSPECTION_TEMPLATE } from "@/lib/inspection";
import { getPublicCars } from "@/lib/cars";

export const metadata: Metadata = {
  title: "Inspection & warranty",
  description: "What we check on every car before it's listed, how the inspection report works, and what the warranty covers.",
  alternates: { canonical: "/warranty" },
};

export default async function WarrantyPage() {
  const cars = await getPublicCars();
  const sample = cars.find((c) => c.slug.includes("hector"));
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Inspection & warranty" }]} />
      <div className="mt-4 max-w-2xl">
        <p className="eyebrow">Inspection & warranty</p>
        <h1 className="mt-2 text-[2.1rem] font-extrabold leading-[1.05] md:text-[2.8rem]">What we check, and what&apos;s covered</h1>
        <p className="mt-3 text-muted">
          A checklist only means something if you can read it. Each car&apos;s report is on its listing, item by item, with notes on anything that isn&apos;t perfect.
        </p>
        <p className="mt-3 rounded-lg bg-demo-soft px-3 py-2 text-sm text-demo">
          <strong>DEMO:</strong> the checklist below is a {INSPECTION_POINT_COUNT}-point sample format. The dealer&apos;s actual 150+ point checklist and warranty terms replace it before launch.
        </p>
      </div>

      <section className="mt-10" aria-labelledby="checklist">
        <h2 id="checklist" className="text-2xl font-extrabold">The checklist</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INSPECTION_TEMPLATE.map((s) => (
            <div key={s.section} className="card p-5">
              <h3 className="flex items-baseline justify-between font-bold" style={{ fontStretch: "100%" }}>
                {s.section} <span className="num text-sm font-normal text-muted">{s.items.length} checks</span>
              </h3>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {sample && (
          <Link href={`/cars/${sample.slug}#inspection`} className="btn btn-dark mt-6">See a completed report</Link>
        )}
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2" aria-labelledby="warranty">
        <div>
          <h2 id="warranty" className="text-2xl font-extrabold">Warranty <DemoTag /></h2>
          <p className="mt-3 text-muted">
            Each listing says whether warranty is included and for how long. Extended warranty plans can be added at booking. Coverage, exclusions and the claims process will be published here once confirmed with the warranty provider.
          </p>
        </div>
        <ul className="card divide-y divide-line">
          {[
            ["Typically covered", "Engine, gearbox, steering, electricals"],
            ["Typically not covered", "Wear parts: tyres, brake pads, clutch plate, battery"],
            ["How to claim", "WhatsApp us with the car number; we arrange the workshop visit"],
          ].map(([k, v]) => (
            <li key={k} className="flex gap-3 p-4 text-sm">
              <ShieldCheck className="size-5 shrink-0 text-red" aria-hidden />
              <span>
                <strong className="block">{k}</strong>
                <span className="text-muted">{v}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
