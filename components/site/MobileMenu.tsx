"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
          <a href={telLink(phone)} className="btn btn-ghost-dark mt-6 w-full">
            Call {formatPhone(phone)}
          </a>
        </div>
      )}
    </div>
  );
}
