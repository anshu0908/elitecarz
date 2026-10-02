import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { EmiCalculator } from "@/components/cars/EmiCalculator";
import { FinanceLeadButton } from "@/components/forms/LeadButtons";
import { Breadcrumbs } from "@/components/site/Section";
import { FaqList } from "@/components/site/FaqList";
import { getFaqs, getLenders } from "@/lib/content";
import { getPublicSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Used car loans & EMI calculator",
  description: "Work out your EMI with a transparent calculator, compare indicative lender rates, and see the documents you'll need for a used car loan in Delhi.",
  alternates: { canonical: "/finance" },
};

const DOCS = {
  Salaried: ["PAN card", "Aadhaar or passport (address proof)", "Last 3 months' salary slips", "Last 6 months' bank statement", "Form 16 or latest ITR"],
  "Self-employed": ["PAN card", "Aadhaar or passport (address proof)", "Last 2 years' ITR with computation", "Last 12 months' bank statement", "Business proof (GST registration / shop licence)"],
};

export default async function FinancePage() {
  const [settings, lenders, faqs] = await Promise.all([getPublicSettings(), getLenders(), getFaqs()]);
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Finance" }]} />
      <div className="mt-4 max-w-2xl">
        <p className="eyebrow">Finance</p>
        <h1 className="mt-2 text-[2.1rem] font-extrabold leading-[1.05] md:text-[2.8rem]">Car loans, worked out in the open</h1>
        <p className="mt-3 text-muted">
          The EMI on every listing comes from this calculator, using the rate and tenure shown underneath it. Change the numbers and the maths updates — nothing hidden.
        </p>
      </div>

      <section className="card mt-8 p-5 md:p-8" aria-label="EMI calculator">
        <EmiCalculator price={10_00_000} finance={settings.finance} lenders={lenders} priceEditable />
      </section>

      <div className="mt-12 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="docs">
          <h2 id="docs" className="text-2xl font-extrabold">Documents you&apos;ll need</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Object.entries(DOCS).map(([who, list]) => (
              <div key={who} className="card p-5">
                <h3 className="font-bold" style={{ fontStretch: "100%" }}>{who}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {list.map((d) => (
                    <li key={d} className="flex gap-2">
                      <FileText className="mt-0.5 size-4 shrink-0 text-red" aria-hidden /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Typical requirements — each lender may ask for more.</p>
        </section>
        <section className="dark-surface rounded-2xl bg-ink p-6 text-white" aria-labelledby="pre">
          <h2 id="pre" className="text-xl font-extrabold">Check your eligibility</h2>
          <p className="mt-2 text-sm text-white/75">Share a few details and we&apos;ll come back with what partner lenders can offer — before you pick a car. No credit check at this stage.</p>
          <FinanceLeadButton booking={settings.booking} />
        </section>
      </div>

      <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="fin-faq">
        <h2 id="fin-faq" className="mb-4 text-2xl font-extrabold">Finance questions</h2>
        <FaqList faqs={faqs.filter((f) => f.category === "Finance" || f.question.includes("price include"))} />
      </section>
    </div>
  );
}
