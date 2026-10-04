import Link from "next/link";
import { Shield } from "lucide-react";

export function DemoBadge() {
  return (
    <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6">
      <Link
        href="/admin"
        className="group inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-[#121215]/95 px-3.5 py-2 text-xs font-semibold text-amber-300 shadow-2xl backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:border-amber-400 hover:bg-zinc-900 focus-visible:outline-none"
        title="Open Admin Panel (Demo Review)"
      >
        <span className="flex size-2 rounded-full bg-amber-400 animate-pulse" />
        <Shield className="size-3.5 text-amber-400" aria-hidden />
        <span>Admin Panel</span>
        <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300 group-hover:bg-amber-400/30">
          Demo
        </span>
      </Link>
    </div>
  );
}
