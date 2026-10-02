"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

type Img = { url: string; alt: string | null; category: string | null };

/** Swipeable gallery: native scroll-snap on touch, arrow keys/buttons on desktop, fullscreen viewer. */
export function Gallery({ images, title, sold = false }: { images: Img[]; title: string; sold?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const go = useCallback(
    (i: number) => {
      const n = Math.max(0, Math.min(images.length - 1, i));
      const el = trackRef.current;
      if (el) el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
      setIndex(n);
    },
    [images.length],
  );

  // Track the visible slide when the user swipes.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => setIndex(Math.round(el.scrollLeft / el.clientWidth)), 60);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    thumbsRef.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (full && !d.open) d.showModal();
    if (!full && d.open) d.close();
  }, [full]);

  if (!images.length) return <div className="aspect-[4/3] rounded-2xl bg-ink-3" />;

  return (
    <div>
      <div
        className="group relative overflow-hidden rounded-2xl bg-ink-3"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} photos`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1);
          if (e.key === "ArrowLeft") go(index - 1);
        }}
      >
        <div ref={trackRef} className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" tabIndex={0} aria-label="Use arrow keys to change photo">
          {images.map((img, i) => (
            <div key={img.url} className="relative h-full w-full shrink-0 snap-start" aria-roledescription="slide" aria-label={`${i + 1} of ${images.length}`}>
              <Image
                src={img.url}
                alt={img.alt ?? `${title} photo ${i + 1}`}
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                sizes="(min-width: 1024px) 760px, 100vw"
                className={`object-cover ${sold ? "grayscale-[50%]" : ""}`}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow disabled:opacity-0 md:grid" aria-label="Previous photo">
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <button type="button" onClick={() => go(index + 1)} disabled={index === images.length - 1} className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow disabled:opacity-0 md:grid" aria-label="Next photo">
          <ChevronRight className="size-6" aria-hidden />
        </button>
        <span className="num absolute bottom-3 left-3 rounded-md bg-black/65 px-2 py-1 text-xs font-semibold text-white" aria-live="polite">
          {index + 1} / {images.length}
        </span>
        <button type="button" onClick={() => setFull(true)} className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-black/65 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-black/80">
          <Expand className="size-4" aria-hidden /> Full screen
        </button>
      </div>

      <div ref={thumbsRef} className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            data-i={i}
            onClick={() => go(i)}
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === index}
            className={`relative aspect-[4/3] w-[84px] shrink-0 overflow-hidden rounded-lg border-2 ${i === index ? "border-red" : "border-transparent opacity-75 hover:opacity-100"}`}
          >
            <Image src={img.url} alt="" fill sizes="84px" loading="lazy" className="object-cover" />
          </button>
        ))}
      </div>

      <dialog ref={dialogRef} onClose={() => setFull(false)} className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black" aria-label={`${title} — full screen photos`}>
        {full && (
          <div
            className="relative flex h-full flex-col"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setIndex((i) => Math.min(images.length - 1, i + 1));
              if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
            }}
          >
            <div className="flex items-center justify-between p-3">
              <span className="num text-sm">{index + 1} / {images.length}</span>
              <button type="button" onClick={() => setFull(false)} className="grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label="Close full screen" autoFocus>
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <div className="relative flex-1">
              <Image src={images[index].url} alt={images[index].alt ?? title} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex justify-center gap-3 p-4">
              <button type="button" className="btn btn-ghost-dark" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
                <ChevronLeft className="size-5" aria-hidden /> Prev
              </button>
              <button type="button" className="btn btn-ghost-dark" onClick={() => setIndex((i) => Math.min(images.length - 1, i + 1))} disabled={index === images.length - 1}>
                Next <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
