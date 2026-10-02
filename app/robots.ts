import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Pitch demo: set ALLOW_INDEXING=true only on the real production site.
  if (process.env.ALLOW_INDEXING !== "true") return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/compare", "/shortlist"] }],
    sitemap: abs("/sitemap.xml"),
  };
}
