import Link from "next/link";
import { Search, Shield } from "lucide-react";
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
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link href="/cars" aria-label="Search cars" className="grid size-10 place-items-center rounded-lg text-white/80 hover:text-white lg:hidden">
            <Search className="size-5" aria-hidden />
          </Link>
          <ShortlistLink />
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 transition hover:border-amber-400 hover:bg-amber-500/20"
            title="Open Admin Panel (Demo Review)"
          >
            <Shield className="size-3.5 text-amber-400" aria-hidden />
            <span className="hidden sm:inline">Admin Panel</span>
            <span className="sm:hidden">Admin</span>
            <span className="rounded bg-amber-400/20 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-200">
              Demo
            </span>
          </Link>
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
