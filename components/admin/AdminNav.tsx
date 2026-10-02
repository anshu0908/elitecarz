"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Car, ExternalLink, Inbox, LayoutDashboard, LogOut, Menu, ScrollText, Settings, Trash2, Users, X } from "lucide-react";
import { logout } from "@/app/admin/login/actions";
import { can, ROLE_LABELS, type Capability } from "@/lib/permissions";
import type { CurrentUser } from "@/lib/auth";

const ITEMS: { href: string; label: string; icon: typeof Car; cap: Capability; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, cap: "dashboard.view", exact: true },
  { href: "/admin/cars", label: "Cars", icon: Car, cap: "cars.view" },
  { href: "/admin/leads", label: "Leads", icon: Inbox, cap: "leads.viewOwn" },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays, cap: "leads.viewOwn" },
  { href: "/admin/trash", label: "Trash", icon: Trash2, cap: "cars.delete" },
  { href: "/admin/settings", label: "Settings", icon: Settings, cap: "settings.edit" },
  { href: "/admin/users", label: "Users", icon: Users, cap: "users.manage" },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText, cap: "audit.view" },
];

export function AdminNav({ user, newLeads }: { user: CurrentUser; newLeads: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = ITEMS.filter((i) => can(user.role, i.cap) || (i.cap === "leads.viewOwn" && can(user.role, "leads.viewAll")));

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-0.5 p-3">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
          >
            <Icon className="size-[18px]" aria-hidden />
            <span className="flex-1">{label}</span>
            {href === "/admin/leads" && newLeads > 0 && <span className="num rounded-full bg-red px-1.5 text-xs leading-5 text-white">{newLeads}</span>}
          </Link>
        );
      })}
      <Link href="/" target="_blank" className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:text-white">
        <ExternalLink className="size-[18px]" aria-hidden /> View website
      </Link>
      <div className="mt-auto border-t border-ink-line px-3 pt-4">
        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
        <p className="truncate text-xs text-white/60">{ROLE_LABELS[user.role]} · {user.email}</p>
        <form action={logout} className="mt-3">
          <button type="submit" className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <LogOut className="size-4" aria-hidden /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <header className="dark-surface sticky top-0 z-40 flex h-14 items-center gap-3 bg-ink px-4 text-white lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center" aria-label="Open admin menu" aria-expanded={open}>
          <Menu className="size-6" aria-hidden />
        </button>
        <Image src="/logo-elitecarz.png" alt="EliteCarz" width={1160} height={192} className="h-4 w-auto" />
        <span className="text-xs text-white/60">Admin</span>
        <Link href="/admin/cars/new?quick=1" className="btn btn-red btn-sm ml-auto">+ Car</Link>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="dark-surface relative flex h-full w-72 flex-col bg-ink">
            <div className="flex h-14 items-center justify-between px-4">
              <Image src="/logo-elitecarz.png" alt="EliteCarz" width={1160} height={192} className="h-4 w-auto" />
              <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center text-white" aria-label="Close menu">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
      <aside className="dark-surface sticky top-0 hidden h-dvh flex-col bg-ink lg:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <Image src="/logo-elitecarz.png" alt="EliteCarz" width={1160} height={192} className="h-[18px] w-auto" />
          <span className="text-xs font-semibold text-white/50">ADMIN</span>
        </div>
        {nav}
      </aside>
    </>
  );
}
