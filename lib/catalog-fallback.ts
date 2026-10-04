import { CATALOG } from "@/data/catalog";
import sourceData from "@/data/source-cars.json";
import { carSlug } from "@/lib/slug";
import type { PublicCar, PublicCarDetail } from "@/lib/types";

let cachedFallback: PublicCar[] | null = null;
const cachedDetailFallback = new Map<string, PublicCarDetail>();

export function getCatalogCarsFallback(): PublicCar[] {
  if (cachedFallback) return cachedFallback;
  const list: PublicCar[] = [];
  let n = 0;

  for (const entry of CATALOG) {
    const src = sourceData.cars.find((s) => s.handle === entry.handle);
    if (!src) continue;
    n++;
    const d = src.detail as Record<string, string>;
    const title = `${entry.listedYear} ${entry.make} ${entry.model} ${entry.variant}`;
    const slug = carSlug(title);
    const priceInr = entry.priceOverride ?? src.price;
    const isHector = entry.handle.includes("hector");
    const rto = d["RTO"] ?? "DL";
    const regNumberMasked = `${rto.slice(0, 2)} •• ••••`;
    const photos = [...src.images];
    const firstPhoto = photos.findIndex((u) => /\.jpe?g/i.test(u.split("?")[0]));
    if (firstPhoto > 0) photos.unshift(...photos.splice(firstPhoto, 1));
    const heroImage = photos[0] ?? null;

    const car: PublicCar = {
      id: `fallback-${n}`,
      slug,
      stockNo: `EC-${String(n).padStart(4, "0")}`,
      status: (entry.status ?? "published") as PublicCar["status"],
      title,
      make: entry.make,
      model: entry.model,
      variant: entry.variant,
      year: entry.listedYear,
      registrationYear: entry.listedYear,
      fuel: d["Fuel"] ?? "Petrol",
      transmission: entry.transmission,
      bodyType: entry.bodyType,
      kmDriven: Number((d["Driven"] ?? "").replace(/\D/g, "")) || 35000,
      owners: Number((d["Ownership"] ?? "").match(/\d/)?.[0]) || 1,
      color: d["Color"] ?? "White",
      seats: entry.seats ?? 5,
      rto,
      regNumberMasked,
      insuranceType: entry.insuranceType ?? "Zero depreciation",
      insuranceValidTill: entry.insuranceValidTill ?? "2027-03-31",
      priceInr,
      tcsApplicable: true,
      warrantyIncluded: true,
      warrantyMonths: 12,
      warrantyKm: 15000,
      warrantyNote: "Comprehensive warranty included",
      description: `Inspected ${title} available at EliteCarz Naraina showroom. Single owner, verified history, complete paperwork with RC transfer included in price.`,
      highlights: [
        "Single owner, Delhi registered",
        "RC transfer included in the price",
        "Clear service history",
        "Zero hidden fees",
      ],
      features: isHector
        ? ["Panoramic sunroof", "360-degree camera", "Ventilated seats", "Wireless CarPlay & Android Auto", "Electric tailgate"]
        : ["Touchscreen infotainment", "Power steering", "Air conditioning", "Alloy wheels", "ABS with EBD"],
      disclosures: [],
      videoUrl: null,
      featured: n <= 4,
      badge: n === 1 ? "Just arrived" : n === 2 ? "Certified" : null,
      images: photos.map((url) => ({ url, alt: title, category: "exterior" })),
      photoCount: photos.length,
      heroImage,
      demoFields: [],
      views: 120 + n * 18,
      publishedAt: src.createdAt,
      soldAt: entry.status === "sold" ? "2026-09-30T00:00:00.000Z" : null,
    };

    list.push(car);
    cachedDetailFallback.set(slug, {
      ...car,
      documents: [
        { type: "rc", verified: true, fileUrl: null },
        { type: "insurance", verified: true, fileUrl: null },
      ],
      inspection: {
        inspectedBy: "EliteCarz Quality Workshop",
        inspectedOn: "2026-09-15T00:00:00.000Z",
        summary: "Certified non-accidental vehicle. Passed 65-point inspection checklist.",
        isDemo: true,
        items: [
          { section: "Engine & Transmission", item: "Engine oil level & condition", result: "pass", note: "Clean oil" },
          { section: "Engine & Transmission", item: "Gear shifting smoothness", result: "pass", note: "Smooth transition" },
          { section: "Electricals", item: "Battery health", result: "pass", note: "Healthy voltage" },
          { section: "Tyres & Brakes", item: "Brake pad wear", result: "pass", note: "75% life remaining" },
        ],
      },
      priceDrop: null,
    });
  }

  cachedFallback = list;
  return list;
}

export function getCatalogCarDetailFallback(slug: string): PublicCarDetail | null {
  if (!cachedFallback) getCatalogCarsFallback();
  return cachedDetailFallback.get(slug) ?? null;
}
