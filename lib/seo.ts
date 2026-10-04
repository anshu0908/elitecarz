// JSON-LD builders (BRIEF §17.7). Only real data goes into AggregateRating.
import type { PublicSettings } from "@/lib/settings";
import type { PublicCar } from "@/lib/types";
import { priceBreakup } from "@/lib/price";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
export const SITE_URL = rawUrl.replace(/\/$/, "");
export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export function autoDealerJsonLd(s: PublicSettings) {
  const b = s.business;
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": abs("/#dealer"),
    name: b.name,
    url: SITE_URL,
    logo: abs("/logo-elitecarz.png"),
    telephone: `+91${b.phone}`,
    email: b.email,
    priceRange: "₹5 L – ₹30 L",
    address: {
      "@type": "PostalAddress",
      streetAddress: b.addressLines.join(", "),
      addressLocality: `${b.locality}, ${b.city}`,
      addressRegion: "Delhi",
      postalCode: b.postalCode,
      addressCountry: "IN",
    },
    geo: { "@type": "GeoCoordinates", latitude: b.geo.lat, longitude: b.geo.lng },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "11:00",
        closes: "19:00",
      },
    ],
    aggregateRating: { "@type": "AggregateRating", ratingValue: b.googleRating, reviewCount: b.googleReviewCount, bestRating: 5 },
    hasMap: b.mapsUrl,
  };
}

const FUEL_SCHEMA: Record<string, string> = {
  Petrol: "Gasoline",
  Diesel: "Diesel",
  CNG: "CompressedNaturalGas",
  "Petrol Hybrid": "Hybrid",
  Electric: "Electric",
};

export function carJsonLd(car: PublicCar) {
  const { total } = priceBreakup(car.priceInr, car.tcsApplicable);
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: car.title,
    url: abs(`/cars/${car.slug}`),
    image: car.images.slice(0, 6).map((i) => i.url),
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleConfiguration: car.variant,
    vehicleModelDate: String(car.year),
    productionDate: String(car.year),
    bodyType: car.bodyType ?? undefined,
    color: car.color ?? undefined,
    fuelType: FUEL_SCHEMA[car.fuel] ?? car.fuel,
    vehicleTransmission: car.transmission === "Manual" ? "ManualTransmission" : "AutomaticTransmission",
    numberOfPreviousOwners: car.owners ?? undefined,
    seatingCapacity: car.seats ?? undefined,
    mileageFromOdometer: car.kmDriven ? { "@type": "QuantitativeValue", value: car.kmDriven, unitCode: "KMT" } : undefined,
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      price: car.priceInr,
      priceCurrency: "INR",
      priceSpecification: { "@type": "PriceSpecification", price: total, priceCurrency: "INR", description: "Total payable incl. TCS where applicable; RC transfer included" },
      availability:
        car.status === "sold" ? "https://schema.org/SoldOut" : car.status === "reserved" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
      seller: { "@id": abs("/#dealer") },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "EliteCarz",
    url: SITE_URL,
    potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/cars?q={search_term_string}`, "query-input": "required name=search_term_string" },
  };
}
