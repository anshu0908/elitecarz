"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarClock, IndianRupee, KeyRound, Link2, MessageSquare, Printer, Share2 } from "lucide-react";
import { CallButton, WhatsappButton } from "@/components/site/ContactButtons";
import { CarLeadModal, type LeadKind } from "@/components/forms/LeadForms";
import { recentStore } from "@/lib/client/store";
import { beaconLead, track } from "@/lib/client/analytics";
import { carWhatsappText, whatsappLink } from "@/lib/whatsapp";
import { formatLakh } from "@/lib/format";
import type { BookingSettings } from "@/lib/settings-defaults";

type CarLite = { id: string; slug: string; title: string; priceInr: number; stockNo: string | null; status: string };

/** CTA group + the car-specific sticky mobile bar. One modal state shared by both. */
export function CarActions({ car, whatsapp, phone, booking, url }: { car: CarLite; whatsapp: string; phone: string; booking: BookingSettings; url: string }) {
  const [kind, setKind] = useState<LeadKind | null>(null);
  const text = carWhatsappText(car, url);
  const available = car.status === "published";

  useEffect(() => {
    recentStore.pushFront(car.id);
    track("view_item", { car_id: car.id, price: car.priceInr });
    // Count the view server-side (rate-limited per visitor).
    fetch(`/api/cars/${car.id}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [car.id, car.priceInr]);

  const open = (k: LeadKind) => {
    setKind(k);
    if (k === "test_drive") track("test_drive_start", { car_id: car.id });
  };

  return (
    <>
      {available ? (
        <div className="grid gap-2.5">
          <WhatsappButton whatsapp={whatsapp} text={text} carId={car.id} location="car_cta" className="btn btn-wa w-full" label="WhatsApp about this car" />
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" className="btn btn-red" onClick={() => open("reserve")}>
              <KeyRound className="size-[18px]" aria-hidden /> Reserve
            </button>
            <button type="button" className="btn btn-dark" onClick={() => open("test_drive")}>
              <CalendarClock className="size-[18px]" aria-hidden /> Test drive
            </button>
            <CallButton phone={phone} carId={car.id} location="car_cta" className="btn btn-outline" label="Call 11–7" />
            <button type="button" className="btn btn-outline" onClick={() => open("finance")}>
              <IndianRupee className="size-[18px]" aria-hidden /> Get a loan
            </button>
          </div>
          <button type="button" className="inline-flex items-center justify-center gap-1.5 py-1 text-sm font-semibold text-muted hover:text-text" onClick={() => open("enquiry")}>
            <MessageSquare className="size-4" aria-hidden /> Ask a question instead
          </button>
        </div>
      ) : (
        <div className="grid gap-2.5">
          <p className="rounded-lg bg-paper p-3 text-sm">
            {car.status === "sold" ? "This car has been sold. Similar cars are listed below." : "This car is reserved by another buyer. Leave your number and we'll call if it becomes available."}
          </p>
          {car.status === "reserved" && (
            <button type="button" className="btn btn-dark" onClick={() => open("call_back")}>
              Join the waitlist
            </button>
          )}
          <Link href="/cars" className="btn btn-outline">See available cars</Link>
        </div>
      )}

      {/* Car-specific sticky bar on phones */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="num font-display text-lg font-bold leading-none">{formatLakh(car.priceInr)}</p>
            <p className="truncate text-xs text-muted">{car.title}</p>
          </div>
          <a
            href={whatsappLink(whatsapp, text)}
            target="_blank"
            rel="noopener"
            className="btn btn-wa btn-sm"
            onClick={() => {
              track("whatsapp_click", { location: "car_bar", car_id: car.id });
              beaconLead("whatsapp_click", car.id);
            }}
          >
            WhatsApp
          </a>
          {available && (
            <button type="button" className="btn btn-red btn-sm" onClick={() => open("reserve")}>
              Reserve
            </button>
          )}
        </div>
      </div>

      <CarLeadModal kind={kind} onClose={() => setKind(null)} car={car} booking={booking} />
    </>
  );
}

export function ShareRow({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <a href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm" onClick={() => track("share", { method: "whatsapp" })}>
        <Share2 className="size-4" aria-hidden /> Share
      </a>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* ignore */
          }
        }}
      >
        <Link2 className="size-4" aria-hidden /> {copied ? "Copied" : "Copy link"}
      </button>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}>
        <Printer className="size-4" aria-hidden /> Spec sheet
      </button>
    </div>
  );
}
