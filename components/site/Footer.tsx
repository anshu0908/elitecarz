import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Star } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { ConsentReopen } from "@/components/site/ConsentBanner";
import { formatPhone } from "@/lib/format";
import { telLink } from "@/lib/whatsapp";
import type { PublicSettings } from "@/lib/settings";

const COLUMNS = [
  {
    title: "Buy",
    links: [
      { href: "/cars", label: "All cars" },
      { href: "/used-cars/suv", label: "SUVs" },
      { href: "/used-cars/sedan", label: "Sedans" },
      { href: "/used-cars/under-10-lakh", label: "Under ₹10 lakh" },
      { href: "/used-cars/automatic", label: "Automatics" },
      { href: "/compare", label: "Compare cars" },
    ],
  },
  {
    title: "Brands we stock",
    links: [
      { href: "/used-cars/tata", label: "Tata" },
      { href: "/used-cars/mahindra", label: "Mahindra" },
      { href: "/used-cars/toyota", label: "Toyota" },
      { href: "/used-cars/hyundai", label: "Hyundai" },
      { href: "/used-cars/kia", label: "Kia" },
      { href: "/used-cars/ford", label: "Ford" },
    ],
  },
  {
    title: "EliteCarz",
    links: [
      { href: "/sell-your-car", label: "Sell or exchange" },
      { href: "/finance", label: "Car loans & EMI" },
      { href: "/warranty", label: "Inspection & warranty" },
      { href: "/about", label: "About & how it works" },
      { href: "/reviews", label: "Reviews" },
      { href: "/contact", label: "Visit the showroom" },
      { href: "/admin", label: "Staff Sign In (Demo)" },
    ],
  },
];

const POLICIES = [
  { href: "/policies/privacy-policy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
  { href: "/policies/booking-refund-policy", label: "Booking & refunds" },
  { href: "/policies/delivery-handover", label: "Delivery & handover" },
  { href: "/policies/cookie-policy", label: "Cookies" },
];

export function Footer({ settings }: { settings: PublicSettings }) {
  const b = settings.business;
  return (
    <footer className="dark-surface bg-ink pb-24 text-white/80 lg:pb-0">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="space-y-4 text-sm">
          <Logo />
          <p className="max-w-xs text-white/70">Fixed-price, inspected used cars. RC transfer included. One showroom, in Naraina.</p>
          <ul className="space-y-2.5">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
              <span>
                {b.addressLines.join(", ")}, {b.locality}, {b.city} {b.postalCode}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
              <span>{b.hours.map((h) => `${h.days}, 11 am – 7 pm`).join(" · ")}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
              <a href={telLink(b.phone)} className="hover:text-white">{formatPhone(b.phone)}</a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
              <a href={`mailto:${b.email}`} className="break-all hover:text-white">{b.email}</a>
            </li>
            <li className="flex gap-2.5">
              <Star className="mt-0.5 size-4 shrink-0 fill-current text-amber-400" aria-hidden />
              <a href={b.googleProfileUrl} target="_blank" rel="noopener" className="hover:text-white">
                4.7★ review on Google
              </a>
            </li>
          </ul>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.14em] text-white/50" style={{ fontStretch: "100%" }}>{col.title}</h2>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-ink-line">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {b.name}. {b.gstin ? `GSTIN ${b.gstin}.` : "GSTIN: to be added."}{" "}
            <span className="demo-tag">PITCH DEMO</span>
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {POLICIES.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="hover:text-white">{p.label}</Link>
              </li>
            ))}
            <li>
              <ConsentReopen />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
