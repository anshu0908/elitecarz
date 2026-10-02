import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Section";
import { CallButton, WhatsappButton } from "@/components/site/ContactButtons";
import { ContactForm } from "@/components/forms/ContactForm";
import { getPublicSettings } from "@/lib/settings";
import { formatPhone } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contact & visit the showroom",
  description: "EliteCarz, Indra Market, CB-382, Ring Road, Naraina, New Delhi 110028. Open 11 am – 7 pm every day. Call or WhatsApp +91 97111 63000.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getPublicSettings();
  const b = settings.business;
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Contact" }]} />
      <h1 className="mt-3 text-[2.1rem] font-extrabold leading-tight md:text-[2.8rem]">Talk to us</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <WhatsappButton whatsapp={b.whatsapp} text="Hi EliteCarz, I have a question." location="contact_page" />
            <CallButton phone={b.phone} location="contact_page" label={formatPhone(b.phone)} />
          </div>
          <ul className="card divide-y divide-line">
            <li className="flex gap-3 p-4">
              <MapPin className="mt-0.5 size-5 shrink-0 text-red" aria-hidden />
              <address className="not-italic">
                {b.addressLines.map((l) => (
                  <span key={l} className="block">{l}</span>
                ))}
                {b.locality}, {b.city} {b.postalCode}
                <a href={b.mapsUrl} target="_blank" rel="noopener" className="mt-1 block text-sm font-semibold text-red hover:underline">Get directions</a>
              </address>
            </li>
            <li className="flex gap-3 p-4">
              <Clock className="mt-0.5 size-5 shrink-0 text-red" aria-hidden />
              <span>
                Every day, 11 am – 7 pm
                <span className="block text-sm text-muted">{b.holidayNote}</span>
              </span>
            </li>
            <li className="flex gap-3 p-4">
              <Phone className="mt-0.5 size-5 shrink-0 text-red" aria-hidden />
              {formatPhone(b.phone)}
            </li>
            <li className="flex gap-3 p-4">
              <Mail className="mt-0.5 size-5 shrink-0 text-red" aria-hidden />
              <a href={`mailto:${b.email}`} className="break-all hover:underline">{b.email}</a>
            </li>
          </ul>
          <iframe
            title="EliteCarz on Google Maps"
            src={`https://www.google.com/maps?q=${b.geo.lat},${b.geo.lng}&z=16&output=embed`}
            loading="lazy"
            className="h-72 w-full rounded-2xl border border-line"
          />
        </div>
        <div className="card p-5 md:p-8">
          <h2 className="text-xl font-extrabold">Send a message or ask for a call-back</h2>
          <p className="mt-1 text-sm text-muted">Outside 11–7? Leave your number and we&apos;ll call after 11 am.</p>
          <ContactForm booking={settings.booking} />
        </div>
      </div>
    </div>
  );
}
