"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car } from "lucide-react";
import { CallButton, WhatsappButton } from "@/components/site/ContactButtons";

/** Sticky bottom bar on phones (BRIEF §11). Car pages render their own car-specific bar. */
export function MobileBar({ whatsapp, phone }: { whatsapp: string; phone: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/cars/")) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 backdrop-blur lg:hidden">
      <div className="grid grid-cols-3 gap-2">
        <WhatsappButton whatsapp={whatsapp} text="Hi EliteCarz, I'd like to know more about your cars." location="mobile_bar" className="btn btn-wa btn-sm" />
        <CallButton phone={phone} location="mobile_bar" className="btn btn-outline btn-sm" />
        <Link href="/cars" className="btn btn-red btn-sm">
          <Car className="size-[18px]" aria-hidden /> Cars
        </Link>
      </div>
    </div>
  );
}
