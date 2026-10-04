"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { ArrowLeft, ArrowRight, Camera, GripVertical, Loader2, Star, Trash2, Upload } from "lucide-react";

export type FormImage = { url: string; alt?: string | null; category?: string | null };
const CATEGORIES = ["exterior", "interior", "engine", "tyres", "docs", "defects"];

/**
 * Multi-upload (drag-drop, file picker, phone camera), drag-to-reorder with
 * keyboard/touch-friendly arrow buttons, hero pick, per-photo category + alt text.
 */
export function ImageManager({
  images,
  heroIndex,
  onChange,
  error,
}: {
  images: FormImage[];
  heroIndex: number;
  onChange: (images: FormImage[], heroIndex: number) => void;
  error?: string;
}) {
  const [uploading, setUploading] = useState(0);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const dragFrom = useRef<number | null>(null);
  const heroUrl = images[heroIndex]?.url;

  const emit = (next: FormImage[], hero = heroUrl) => {
    const h = Math.max(0, next.findIndex((i) => i.url === hero));
    onChange(next, h);
  };

  async function upload(files: File[]) {
    if (!files.length) return;
    setUploadErrors([]);
    setUploading((n) => n + files.length);
    // Upload in small batches so phones on 4G show progress.
    const batches: File[][] = [];
    for (let i = 0; i < files.length; i += 4) batches.push(files.slice(i, i + 4));
    let acc = [...images];
    for (const batch of batches) {
      const fd = new FormData();
      batch.forEach((f) => fd.append("files", f));
      try {
        const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
        const data = await res.json();
        acc = [...acc, ...(data.uploaded ?? []).map((u: { url: string }) => ({ url: u.url, alt: null, category: "exterior" }))];
        emit(acc, heroUrl ?? acc[0]?.url);
        if (data.errors?.length || data.error) setUploadErrors((e) => [...e, ...(data.errors ?? [data.error])]);
      } catch {
        setUploadErrors((e) => [...e, "Upload failed — check your connection."]);
      } finally {
        setUploading((n) => n - batch.length);
      }
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    emit(next);
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDragOver(false);
          upload(Array.from(e.dataTransfer.files));
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-red ${dragOver ? "border-red bg-red-soft" : error ? "border-bad" : "border-line-strong bg-paper hover:border-ink"}`}
      >
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { upload(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
        <span className="flex gap-2 text-muted">
          <Upload className="size-6" aria-hidden />
          <Camera className="size-6" aria-hidden />
        </span>
        <span className="font-semibold">Drop photos here, or tap to choose / take photos</span>
        <span className="text-xs text-muted">JPEG/PNG/WebP up to 12 MB each. Compressed to WebP, location data removed.</span>
      </label>
      {error && <p className="error-text">{error}</p>}
      {uploading > 0 && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Uploading {uploading} photo{uploading === 1 ? "" : "s"}…
        </p>
      )}
      {uploadErrors.length > 0 && <p className="error-text">{uploadErrors.join(" ")}</p>}

      {images.length > 0 && (
        <>
          <p className="mb-2 mt-4 text-xs text-muted">Drag to reorder (or use the arrows). The ★ photo is the cover on listings.</p>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img, i) => (
              <li
                key={img.url}
                draggable
                onDragStart={(e) => {
                  dragFrom.current = i;
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (dragFrom.current !== null) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragFrom.current !== null) move(dragFrom.current, i);
                  dragFrom.current = null;
                }}
                className={`group rounded-xl border bg-card p-1.5 ${i === heroIndex ? "border-red ring-1 ring-red" : "border-line"}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper">
                  <Image src={img.url} alt={img.alt || `Photo ${i + 1}`} fill sizes="240px" className="object-cover" />
                  <span className="num absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/65 px-1.5 py-0.5 text-[0.7rem] font-semibold text-white">
                    <GripVertical className="size-3" aria-hidden /> {i + 1}
                  </span>
                  <button type="button" onClick={() => onChange(images, i)} aria-pressed={i === heroIndex} aria-label={i === heroIndex ? "Cover photo" : `Make photo ${i + 1} the cover`} className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full bg-white/90">
                    <Star className={`size-4 ${i === heroIndex ? "fill-red text-red" : "text-ink"}`} aria-hidden />
                  </button>
                </div>
                <div className="mt-1.5 flex items-center gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid size-8 place-items-center rounded-md hover:bg-paper disabled:opacity-30" aria-label={`Move photo ${i + 1} earlier`}><ArrowLeft className="size-4" /></button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="grid size-8 place-items-center rounded-md hover:bg-paper disabled:opacity-30" aria-label={`Move photo ${i + 1} later`}><ArrowRight className="size-4" /></button>
                  <Dropdown
                    variant="ghost"
                    className="min-w-0 flex-1"
                    aria-label={`Category of photo ${i + 1}`}
                    value={img.category ?? ""}
                    onChange={(val) => emit(images.map((x, j) => (j === i ? { ...x, category: val || null } : x)))}
                    placeholder="Category"
                    options={[{ value: "", label: "No category" }, ...CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))]}
                  />
                  <button type="button" onClick={() => emit(images.filter((_, j) => j !== i), i === heroIndex ? images[i === 0 ? 1 : 0]?.url : heroUrl)} className="grid size-8 place-items-center rounded-md text-bad hover:bg-red-soft" aria-label={`Delete photo ${i + 1}`}><Trash2 className="size-4" /></button>
                </div>
                <input aria-label={`Alt text for photo ${i + 1}`} placeholder="Describe (alt text)" value={img.alt ?? ""} onChange={(e) => emit(images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} className="mt-1 w-full rounded-md border border-line px-2 py-1 text-xs" />
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
