"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { ConsentReopen } from "@/components/site/ConsentBanner";
import { formatPhone } from "@/lib/format";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import type { PublicSettings } from "@/lib/settings";

const COLUMNS = [
  {
    title: "Buy & Inventory",
    links: [
      { href: "/cars", label: "All cars in stock" },
      { href: "/used-cars/suv", label: "SUVs" },
      { href: "/used-cars/sedan", label: "Sedans" },
      { href: "/used-cars/under-10-lakh", label: "Under ₹10 lakh" },
      { href: "/used-cars/automatic", label: "Automatic cars" },
      { href: "/compare", label: "Compare cars" },
    ],
  },
  {
    title: "Popular Brands",
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
    title: "Customer Services",
    links: [
      { href: "/sell-your-car", label: "Sell or trade-in car" },
      { href: "/finance", label: "Car loans & EMI calculator" },
      { href: "/warranty", label: "Inspection & warranty" },
      { href: "/faq", label: "FAQs & straight answers" },
      { href: "/reviews", label: "Customer reviews" },
      { href: "/about", label: "About & how it works" },
      { href: "/contact", label: "Showroom location & hours" },
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
  // Accordion toggle on mobile screens
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <footer className="dark-surface bg-ink text-white/80 pb-20 lg:pb-0 border-t border-ink-line">
      <div className="container-x py-8 md:py-14">
        {/* Main Grid: Showroom overview + 3 navigation columns */}
        <div className="grid gap-8 md:grid-cols-[1.25fr_repeat(3,1fr)] lg:gap-12">
          
          {/* Showroom & Contact Info */}
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Logo />
            </div>
            
            <p className="max-w-sm text-xs leading-relaxed text-white/70">
              Fixed-price, verified used cars in Delhi NCR. 100% refundable token, multi-point inspection report, and RC transfer included.
            </p>

            {/* Mobile Quick Action Buttons (Call, WhatsApp) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 md:hidden">
              <a
                href={telLink(b.phone)}
                className="btn btn-sm flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center justify-center gap-1.5 py-2"
              >
                <Phone className="size-3.5" aria-hidden /> Call {formatPhone(b.phone)}
              </a>
              <a
                href={whatsappLink(b.phone, "Hi EliteCarz, I have an enquiry about a car.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 border border-[#25D366]/30 font-semibold flex items-center justify-center gap-1.5 py-2 px-3"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="size-4" aria-hidden /> WhatsApp
              </a>
            </div>

            {/* Contact details list */}
            <ul className="space-y-2 text-xs text-white/70 pt-1">
              <li className="flex gap-2.5 items-start">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-white/50" aria-hidden />
                <span>{b.addressLines.join(", ")}, {b.locality}, {b.city} {b.postalCode}</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Clock className="size-3.5 shrink-0 text-white/50" aria-hidden />
                <span>11:00 AM – 7:00 PM (All 7 Days)</span>
              </li>
              <li className="hidden md:flex gap-2.5 items-center">
                <Phone className="size-3.5 shrink-0 text-white/50" aria-hidden />
                <a href={telLink(b.phone)} className="hover:text-white font-medium">{formatPhone(b.phone)}</a>
              </li>
              <li className="flex gap-2.5 items-center">
                <Mail className="size-3.5 shrink-0 text-white/50" aria-hidden />
                <a href={`mailto:${b.email}`} className="truncate hover:text-white">{b.email}</a>
              </li>
              <li className="flex gap-2 items-center pt-1">
                <a
                  href={b.googleProfileUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/10 transition-colors"
                >
                  <span className="flex items-center text-amber-400">
                    <Star className="size-3 fill-current" aria-hidden />
                    <Star className="size-3 fill-current" aria-hidden />
                    <Star className="size-3 fill-current" aria-hidden />
                    <Star className="size-3 fill-current" aria-hidden />
                    <Star className="size-3 fill-current" aria-hidden />
                  </span>
                  <span className="font-bold">4.7★</span>
                  <span className="text-white/60">on Google Reviews</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation Links Columns: Accordion on Mobile (< md), Full Columns on Desktop */}
          {COLUMNS.map((col) => {
            const isOpen = !!openSections[col.title];
            return (
              <nav
                key={col.title}
                aria-label={col.title}
                className="border-t border-white/10 pt-3 md:border-t-0 md:pt-0"
              >
                {/* Mobile Accordion Header Button */}
                <button
                  type="button"
                  onClick={() => toggleSection(col.title)}
                  className="flex w-full items-center justify-between py-1 text-left font-sans text-xs font-bold uppercase tracking-[0.14em] text-white/90 md:hidden"
                  aria-expanded={isOpen}
                >
                  <span>{col.title}</span>
                  <ChevronDown
                    className={`size-4 text-white/50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                {/* Desktop Static Header */}
                <h2
                  className="hidden md:block mb-3 font-sans text-xs font-bold uppercase tracking-[0.14em] text-white/50"
                  style={{ fontStretch: "100%" }}
                >
                  {col.title}
                </h2>

                {/* Links: Collapsible on mobile, visible on desktop */}
                <ul
                  className={`mt-2 space-y-2 text-sm transition-all md:mt-0 ${
                    isOpen ? "block pb-3" : "hidden md:block"
                  }`}
                >
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-block py-0.5 text-white/70 hover:text-white transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>
      </div>

      {/* Bottom Legal & Policies Strip */}
      <div className="border-t border-ink-line bg-black/40">
        <div className="container-x flex flex-col gap-3 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} {b.name}.</span>
            <span>{b.gstin ? `GSTIN ${b.gstin}` : "Verified Dealer Delhi NCR"}</span>
            <span className="demo-tag ml-1">PITCH DEMO</span>
          </p>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-white/60">
            {POLICIES.map((p, idx) => (
              <li key={p.href} className="flex items-center gap-3">
                <Link href={p.href} className="hover:text-white transition-colors">{p.label}</Link>
                {idx < POLICIES.length - 1 && <span className="text-white/20 select-none">·</span>}
              </li>
            ))}
            <li className="flex items-center gap-3">
              <span className="text-white/20 select-none">·</span>
              <ConsentReopen />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
