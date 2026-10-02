"use client";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { compareStore } from "@/lib/client/store";
import type { PublicCar } from "@/lib/types";

/** Floating tray shown while cars are picked for comparison (max 3). */
export function CompareTray({ cars }: { cars: PublicCar[] }) {
  const ids = compareStore.use();
  const picked = ids.map((id) => cars.find((c) => c.id === id)).filter(Boolean) as PublicCar[];
  if (!picked.length) return null;
  return (
    <div className="fixed inset-x-3 bottom-[84px] z-30 mx-auto max-w-2xl rounded-2xl border border-ink-line bg-ink p-3 text-white shadow-[var(--shadow-pop)] lg:bottom-5" role="region" aria-label="Compare cars">
      <div className="flex items-center gap-3">
        <ul className="flex flex-1 gap-2 overflow-x-auto">
          {picked.map((c) => (
            <li key={c.id} className="flex shrink-0 items-center gap-2 rounded-lg bg-ink-3 py-1 pl-1 pr-1.5">
              {c.heroImage && <Image src={c.heroImage} alt="" width={48} height={36} className="h-9 w-12 rounded object-cover" />}
              <span className="max-w-[110px] truncate text-xs font-semibold">{c.make} {c.model}</span>
              <button type="button" className="grid size-7 place-items-center rounded hover:bg-white/10" aria-label={`Remove ${c.title} from compare`} onClick={() => compareStore.remove(c.id)}>
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <Link href="/compare" className={`btn btn-red btn-sm shrink-0 ${picked.length < 2 ? "pointer-events-none opacity-50" : ""}`} aria-disabled={picked.length < 2}>
          Compare {picked.length}/3
        </Link>
      </div>
    </div>
  );
}
