import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Section";
import { FaqExplorer } from "@/components/site/FaqExplorer";
import { JsonLd } from "@/components/site/JsonLd";
import { getFaqs } from "@/lib/content";
import { getPublicSettings } from "@/lib/settings";
import { faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Frequently Asked Questions · EliteCarz",
  description: "Straight answers to common questions about buying, selling, test drives, token booking, RC transfer, warranty, and car loans at EliteCarz New Delhi.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([getFaqs(), getPublicSettings()]);

  return (
    <div className="container-x max-w-4xl py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "FAQs" }]} />

      <header className="mb-8 mt-4">
        <p className="eyebrow">Help & Information</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-2.5 max-w-2xl text-muted leading-relaxed">
          Everything you need to know about our fixed-price policy, RC transfer, refundable tokens, vehicle inspections, and doorstep trade-ins.
        </p>
      </header>

      <FaqExplorer faqs={faqs} phone={settings.business.phone} />

      <JsonLd data={faqJsonLd(faqs)} />
    </div>
  );
}
