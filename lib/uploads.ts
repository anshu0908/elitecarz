import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp, { type OutputInfo } from "sharp";

// Local disk storage for the demo. Swap for Supabase Storage / Cloudinary in production (BRIEF §15.1).
export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
export const UPLOAD_FOLDERS = ["cars", "sell"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export class UploadError extends Error {}

/** Validates, auto-rotates, strips EXIF (incl. GPS), resizes to ≤1600px and stores as WebP. */
export async function saveImage(file: File, folder: UploadFolder): Promise<{ url: string; width: number; height: number }> {
  if (!ALLOWED.has(file.type)) throw new UploadError(`${file.name}: only JPEG, PNG, WebP or AVIF photos`);
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`${file.name}: larger than 12 MB`);
  const input = Buffer.from(await file.arrayBuffer());
  let out: { data: Buffer; info: OutputInfo };
  try {
    out = await sharp(input, { limitInputPixels: 60_000_000 })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new UploadError(`${file.name}: couldn't read this image`);
  }
  const name = `${randomUUID()}.webp`;
  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), out.data);
  return { url: `/uploads/${folder}/${name}`, width: out.info.width, height: out.info.height };
}
