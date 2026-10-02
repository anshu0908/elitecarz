"use client";
// next/image loader: Shopify CDN resizes on the fly (and serves WebP/AVIF by Accept
// header), so we request the right width directly instead of proxying through Next.
// Local uploads are already compressed to WebP on upload (see app/api/admin/uploads).

export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("https://cdn.shopify.com/") || src.includes("/cdn/shop/")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    if (quality) url.searchParams.set("quality", String(quality));
    return url.toString();
  }
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}w=${width}`;
}
