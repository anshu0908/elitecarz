import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { publicCarWhere } from "@/lib/cars";
import { STATIC_SEGMENTS } from "@/lib/segments";
import { slugify } from "@/lib/slug";
import { abs } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cars, makes, pages] = await Promise.all([
    db.car.findMany({ where: publicCarWhere, select: { slug: true, updatedAt: true, status: true } }),
    db.make.findMany({ where: { cars: { some: publicCarWhere } }, select: { name: true } }),
    db.page.findMany({ select: { slug: true } }),
  ]);
  const now = new Date();
  const fixed = ["/", "/cars", "/sell-your-car", "/finance", "/warranty", "/reviews", "/about", "/contact"].map((p) => ({
    url: abs(p),
    lastModified: now,
    changeFrequency: p === "/" || p === "/cars" ? ("daily" as const) : ("monthly" as const),
    priority: p === "/" ? 1 : p === "/cars" ? 0.9 : 0.6,
  }));
  return [
    ...fixed,
    ...cars.map((c) => ({ url: abs(`/cars/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: c.status === "sold" ? 0.3 : 0.8 })),
    ...STATIC_SEGMENTS.map((s) => ({ url: abs(`/used-cars/${s.slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...makes.map((m) => ({ url: abs(`/used-cars/${slugify(m.name)}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    ...pages.map((p) => ({ url: abs(`/policies/${p.slug}`), lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
