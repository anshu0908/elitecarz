import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { MobileMenu } from "@/components/site/MobileMenu";
import { CallButton, WhatsappButton } from "@/components/site/ContactButtons";
import { ShortlistLink } from "@/components/site/ShortlistLink";
import { formatPhone } from "@/lib/format";
import type { PublicSettings } from "@/lib/settings";

export const NAV = [
  { href: "/cars", label: "Buy a car" },
  { href: "/sell-your-car", label: "Sell your car" },
  { href: "/finance", label: "Finance" },
  { href: "/warranty", label: "Inspection & warranty" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({ settings }: { settings: PublicSettings }) {
  const b = settings.business;
  return (
    <header className="dark-surface sticky top-0 z-40 border-b border-ink-line bg-ink text-white">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        {/* Brand + Navigation */}
        <div className="flex items-center gap-6 xl:gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="inline-flex items-center h-9 rounded-lg px-2.5 text-[0.875rem] font-medium whitespace-nowrap text-white/80 transition-colors hover:text-white hover:bg-white/[0.06]"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/cars"
            aria-label="Search cars"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors lg:hidden"
          >
            <Search className="size-4" aria-hidden />
          </Link>
          <ShortlistLink />
          <CallButton
            phone={b.phone}
            location="header"
            label={formatPhone(b.phone)}
            className="btn btn-sm btn-ghost-dark hidden xl:inline-flex shrink-0 h-9"
          />
          <WhatsappButton
            whatsapp={b.whatsapp}
            text="Hi EliteCarz, I'd like to know more about your cars."
            location="header"
            className="btn btn-sm btn-wa hidden sm:inline-flex shrink-0 h-9"
          />
          <MobileMenu nav={NAV} phone={b.phone} />
        </div>
      </div>
    </header>
  );
}
