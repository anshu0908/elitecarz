"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { shortlistStore } from "@/lib/client/store";

export function ShortlistLink() {
  const ids = shortlistStore.use();
  return (
    <Link
      href="/shortlist"
      className="relative grid size-10 place-items-center rounded-lg text-white/80 hover:text-white"
      aria-label={`Shortlist, ${ids.length} cars`}
    >
      <Heart className="size-5" aria-hidden />
      {ids.length > 0 && (
        <span className="num absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-red px-1 text-[0.65rem] font-bold leading-[18px] text-white">
          {ids.length}
        </span>
      )}
    </Link>
  );
}
