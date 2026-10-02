import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { rateLimit } from "@/lib/rate-limit";
import { saveImage, UploadError } from "@/lib/uploads";

/** Staff photo upload for car listings: compressed to WebP, EXIF/GPS stripped. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "cars.edit")) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  if (!rateLimit(`admin-upload:${user.id}`, 300, 60 * 60_000).ok) return NextResponse.json({ error: "Upload limit reached" }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File).slice(0, 40);
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

  const uploaded: { url: string }[] = [];
  const errors: string[] = [];
  for (const f of files) {
    try {
      uploaded.push({ url: (await saveImage(f, "cars")).url });
    } catch (e) {
      errors.push(e instanceof UploadError ? e.message : `${f.name}: failed`);
    }
  }
  return NextResponse.json({ uploaded, errors }, { status: uploaded.length ? 201 : 400 });
}
