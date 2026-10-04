"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Shield, X } from "lucide-react";
import { formatPhone } from "@/lib/format";
import { telLink } from "@/lib/whatsapp";

export function MobileMenu({ nav, phone }: { nav: { href: string; label: string }[]; phone: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    // Close the menu after navigation.
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="grid size-10 place-items-center rounded-lg text-white"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
      </button>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto bg-ink px-4 pb-10 pt-2">
          <nav aria-label="Mobile">
            <ul className="divide-y divide-ink-line">
              {[...nav, { href: "/shortlist", label: "Shortlist" }].map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="flex py-4 font-display text-xl font-semibold"
                    aria-current={pathname === n.href ? "page" : undefined}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-amber-400" aria-hidden />
                <span className="font-semibold text-white">Admin Panel</span>
              </div>
              <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">Demo</span>
            </div>
            <p className="mt-1 text-xs text-white/70">Review inventory, CRM leads, and settings.</p>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="btn btn-sm mt-3 w-full border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold"
            >
              Open Admin Panel →
            </Link>
          </div>
          <a href={telLink(phone)} className="btn btn-ghost-dark mt-4 w-full">
            Call {formatPhone(phone)}
          </a>
        </div>
      )}
    </div>
  );
}
