import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { saveImage, UploadError } from "@/lib/uploads";

const MAX_FILES = 8;

/** Public photo upload for the sell-my-car flow. Rate-limited; files are only viewable by staff. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_FILES * 12 * 1024 * 1024) return NextResponse.json({ error: "Too much data" }, { status: 413 });

  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File).slice(0, MAX_FILES);
  if (!files.length) return NextResponse.json({ error: "No photos received" }, { status: 400 });
  if (!rateLimit(`sell-upload:${ip}`, 24, 60 * 60_000).ok) {
    return NextResponse.json({ error: "Upload limit reached — you can send more photos on WhatsApp." }, { status: 429 });
  }

  const urls: string[] = [];
  const errors: string[] = [];
  for (const f of files) {
    try {
      urls.push((await saveImage(f, "sell")).url);
    } catch (e) {
      errors.push(e instanceof UploadError ? e.message : `${f.name}: upload failed`);
    }
  }
  return NextResponse.json({ urls, errors }, { status: urls.length ? 201 : 400 });
}
