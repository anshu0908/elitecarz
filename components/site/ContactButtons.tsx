"use client";
import { Phone } from "lucide-react";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { beaconLead, track } from "@/lib/client/analytics";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export function WhatsappButton({
  whatsapp,
  text,
  carId,
  location,
  className = "btn btn-wa",
  label = "WhatsApp",
}: {
  whatsapp: string;
  text: string;
  carId?: string;
  location: string;
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={whatsappLink(whatsapp, text)}
      target="_blank"
      rel="noopener"
      className={className}
      onClick={() => {
        track("whatsapp_click", { location, car_id: carId });
        beaconLead("whatsapp_click", carId);
      }}
    >
      <WhatsappIcon className="size-5" />
      <span>{label}</span>
    </a>
  );
}

export function CallButton({
  phone,
  carId,
  location,
  className = "btn btn-outline",
  label = "Call",
}: {
  phone: string;
  carId?: string;
  location: string;
  className?: string;
  label?: string;
}) {
  return (
    <a href={telLink(phone)} className={className} onClick={() => track("call_click", { location, car_id: carId })}>
      <Phone className="size-[18px]" aria-hidden />
      <span>{label}</span>
    </a>
  );
}
