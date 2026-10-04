"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { shortlistStore } from "@/lib/client/store";

export function ShortlistLink() {
  const ids = shortlistStore.use();
  return (
    <Link
      href="/shortlist"
      className="relative grid size-9 shrink-0 place-items-center rounded-lg text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
      aria-label={`Shortlist, ${ids.length} cars`}
    >
      <Heart className="size-4.5" aria-hidden />
      {ids.length > 0 && (
        <span className="num absolute right-0 top-0 grid min-w-[16px] place-items-center rounded-full bg-red px-1 text-[0.65rem] font-bold leading-[16px] text-white">
          {ids.length}
        </span>
      )}
    </Link>
  );
}
