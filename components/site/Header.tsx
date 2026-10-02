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
      <div className="container-x flex h-16 items-center gap-3">
        <Logo />
        <nav aria-label="Main" className="ml-6 hidden items-center lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-2.5 py-2 text-[0.9rem] text-white/80 transition hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Link href="/cars" aria-label="Search cars" className="grid size-10 place-items-center rounded-lg text-white/80 hover:text-white lg:hidden">
            <Search className="size-5" aria-hidden />
          </Link>
          <ShortlistLink />
          <CallButton phone={b.phone} location="header" label={formatPhone(b.phone)} className="btn btn-sm btn-ghost-dark hidden xl:inline-flex" />
          <WhatsappButton
            whatsapp={b.whatsapp}
            text="Hi EliteCarz, I'd like to know more about your cars."
            location="header"
            className="btn btn-sm btn-wa hidden sm:inline-flex"
          />
          <MobileMenu nav={NAV} phone={b.phone} />
        </div>
      </div>
    </header>
  );
}
