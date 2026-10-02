"use client";
import Image from "next/image";
import Link from "next/link";
import { recentStore } from "@/lib/client/store";
import { formatLakh } from "@/lib/format";

type Lite = { id: string; slug: string; title: string; heroImage: string | null; priceInr: number };

export function RecentlyViewed({ cars, currentId }: { cars: Lite[]; currentId: string }) {
  const ids = recentStore.use().filter((id) => id !== currentId);
  const list = ids.map((id) => cars.find((c) => c.id === id)).filter(Boolean).slice(0, 6) as Lite[];
  if (!list.length) return null;
  return (
    <section aria-labelledby="recent" className="mt-14 print:hidden">
      <h2 id="recent" className="mb-4 text-lg font-extrabold">Recently viewed</h2>
      <ul className="flex gap-3 overflow-x-auto pb-2">
        {list.map((c) => (
          <li key={c.id} className="w-44 shrink-0">
            <Link href={`/cars/${c.slug}`} className="block rounded-xl border border-line bg-card p-2 hover:border-ink">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ink-3">
                {c.heroImage && <Image src={c.heroImage} alt="" fill sizes="176px" className="object-cover" />}
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-semibold">{c.title}</p>
              <p className="num text-sm font-bold">{formatLakh(c.priceInr)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
