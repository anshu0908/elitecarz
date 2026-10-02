import type { Metadata } from "next";
import { BadgeIndianRupee, ClipboardCheck, FileCheck2, Timer } from "lucide-react";
import { SellFlow } from "@/components/forms/SellFlow";
import { Breadcrumbs } from "@/components/site/Section";
import { FaqList } from "@/components/site/FaqList";
import { db } from "@/lib/db";
import { getFaqs } from "@/lib/content";
import { getPublicSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Sell or exchange your car in Delhi",
  description: "Get an indicative price for your car in a minute, then a firm offer after a free inspection. EliteCarz buys and exchanges cars in Delhi NCR.",
  alternates: { canonical: "/sell-your-car" },
};

export default async function SellPage() {
  const [makes, settings, faqs] = await Promise.all([
    db.make.findMany({ select: { name: true, models: { select: { name: true }, orderBy: { name: "asc" } } } }),
    getPublicSettings(),
    getFaqs(),
  ]);
  const modelsByMake = Object.fromEntries(makes.map((m) => [m.name, m.models.map((x) => x.name)]));

  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Sell your car" }]} />
      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <p className="eyebrow">Sell or exchange</p>
          <h1 className="mt-2 text-[2.1rem] font-extrabold leading-[1.05] md:text-[2.8rem]">Sell your car without the runaround</h1>
          <p className="mt-4 max-w-md text-muted">
            Three short steps, an indicative range straight away, and a firm offer after we&apos;ve seen the car. Exchange it against any car in our stock if you like.
          </p>
          <ul className="mt-8 space-y-5">
            {[
              { icon: Timer, t: "A range in a minute", d: "Based on model, age, kilometres and ownership." },
              { icon: ClipboardCheck, t: "Free inspection", d: "At our Naraina showroom, or we come to you. About 30 minutes." },
              { icon: BadgeIndianRupee, t: "Firm offer, same day", d: "Payment by bank transfer once the paperwork is signed." },
              { icon: FileCheck2, t: "We handle the RC transfer", d: "Including loan closure and NOC if there's a loan on the car." },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-white">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>
                  <strong className="block">{t}</strong>
                  <span className="text-sm text-muted">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <SellFlow modelsByMake={modelsByMake} whatsapp={settings.business.whatsapp} />
      </div>
      <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="sell-faq">
        <h2 id="sell-faq" className="mb-4 text-2xl font-extrabold">Selling questions</h2>
        <FaqList faqs={faqs.filter((f) => f.category === "Selling")} />
      </section>
    </div>
  );
}
