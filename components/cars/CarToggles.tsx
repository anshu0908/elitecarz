"use client";
import { Heart } from "lucide-react";
import { useSyncExternalStore } from "react";
import { compareStore, shortlistStore } from "@/lib/client/store";
import { track } from "@/lib/client/analytics";

const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);

export function ShortlistButton({ carId, title, className = "" }: { carId: string; title: string; className?: string }) {
  const ids = shortlistStore.use();
  const on = ids.includes(carId);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${title} from shortlist` : `Add ${title} to shortlist`}
      className={`relative z-10 grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-white ${className}`}
      onClick={() => {
        const added = shortlistStore.toggle(carId);
        if (added) track("shortlist_add", { car_id: carId });
      }}
    >
      <Heart className={`size-5 ${on ? "fill-red text-red" : ""}`} aria-hidden />
    </button>
  );
}

export function CompareToggle({ carId }: { carId: string }) {
  const ids = compareStore.use();
  const hydrated = useHydrated();
  const on = ids.includes(carId);
  const full = !on && ids.length >= compareStore.max;
  return (
    <label className={`flex cursor-pointer select-none items-center gap-1.5 text-xs font-semibold ${full ? "text-muted/60" : "text-muted"}`} title={full ? "You can compare up to 3 cars" : undefined}>
      <input
        type="checkbox"
        className="size-4 accent-[var(--color-red)]"
        checked={hydrated && on}
        disabled={full}
        onChange={() => {
          const added = compareStore.toggle(carId);
          if (added) track("compare_add", { car_id: carId });
        }}
      />
      Compare
    </label>
  );
}
