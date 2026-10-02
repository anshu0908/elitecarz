"use client";
// next/image loader: Shopify CDN resizes on the fly (and serves WebP/AVIF by Accept
// header), so we request the right width directly instead of proxying through Next.
// Local uploads are already compressed to WebP on upload (see app/api/admin/uploads).

export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("https://cdn.shopify.com/") || src.includes("/cdn/shop/")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    // Shopify's default JPEG quality is high; q65 roughly halves bytes with no visible loss on car photos.
    url.searchParams.set("quality", String(quality ?? 65));
    return url.toString();
  }
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}w=${width}`;
}
