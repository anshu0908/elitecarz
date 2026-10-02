import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp, { type OutputInfo } from "sharp";
import { head, put } from "@vercel/blob";

// Storage: Vercel Blob when BLOB_READ_WRITE_TOKEN is set (deployed), otherwise the local ./uploads folder.
// Serverless hosts have no persistent disk, so Blob is required on Vercel.
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
  if (blobEnabled()) {
    const blob = await put(`${folder}/${name}`, out.data, { access: "public", contentType: "image/webp", addRandomSuffix: false });
    // Car photos are served straight from the Blob CDN. Seller photos are lead data: the app proxies them
    // to signed-in staff only, so their Blob URL (an unguessable UUID) is never sent to browsers.
    return { url: folder === "cars" ? blob.url : `/uploads/${folder}/${name}`, width: out.info.width, height: out.info.height };
  }
  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), out.data);
  return { url: `/uploads/${folder}/${name}`, width: out.info.width, height: out.info.height };
}

export function blobEnabled() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/** Reads a stored upload by folder + file name, from Blob or local disk. */
export async function readUpload(folder: UploadFolder, file: string): Promise<Uint8Array<ArrayBuffer> | null> {
  try {
    if (blobEnabled()) {
      const meta = await head(`${folder}/${file}`);
      const res = await fetch(meta.url);
      return res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
    }
    const { readFile } = await import("node:fs/promises");
    return new Uint8Array(await readFile(path.join(UPLOAD_ROOT, folder, file)));
  } catch {
    return null;
  }
}
