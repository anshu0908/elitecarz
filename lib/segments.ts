// Programmatic SEO landing pages (BRIEF §8, §17.7): /used-cars/<segment>.
import { EMPTY_FILTERS, type Filters } from "@/lib/filters";
import { slugify } from "@/lib/slug";

export type Segment = { slug: string; h1: string; title: string; description: string; intro: string; filters: Partial<Filters> };

const STATIC: Segment[] = [
  { slug: "suv", h1: "Used SUVs in Delhi", title: "Used SUVs for sale in Delhi", description: "Inspected used SUVs at fixed prices in Naraina, New Delhi — Safari, Creta, Compass, Hector and more.", intro: "Mid-size and full-size SUVs, mostly automatics, all at one fixed price with RC transfer included.", filters: { body: ["SUV"] } },
  { slug: "compact-suv", h1: "Used compact SUVs in Delhi", title: "Used compact SUVs in Delhi", description: "Used compact SUVs like the Sonet and EcoSport at fixed prices in Naraina, Delhi.", intro: "Easy to park, high driving position, low running costs.", filters: { body: ["Compact SUV"] } },
  { slug: "sedan", h1: "Used sedans in Delhi", title: "Used sedans for sale in Delhi", description: "Used sedans — Virtus, Slavia, Corolla Altis — inspected and fixed-price in Naraina, New Delhi.", intro: "Comfortable, efficient sedans for city and highway.", filters: { body: ["Sedan"] } },
  { slug: "mpv", h1: "Used MPVs & 7-seaters in Delhi", title: "Used Innova Crysta & MPVs in Delhi", description: "Used Toyota Innova Crysta and other MPVs at fixed prices in Delhi.", intro: "Seven seats, proper boot space, and Toyota reliability.", filters: { body: ["MPV"] } },
  { slug: "automatic", h1: "Used automatic cars in Delhi", title: "Used automatic cars in Delhi", description: "Automatic used cars — CVT, DCT and torque-converter — at fixed prices in Naraina, New Delhi.", intro: "Most of our stock is automatic. Every listing says which type of gearbox it has.", filters: { trans: ["Automatic"] } },
  { slug: "diesel", h1: "Used diesel cars in Delhi", title: "Used diesel cars in Delhi", description: "Used diesel SUVs and MPVs in Delhi. Check Delhi NCR age rules before buying older diesels.", intro: "Delhi NCR has age limits for diesel vehicles — each listing shows the registration year so you can check.", filters: { fuel: ["Diesel"] } },
  { slug: "under-10-lakh", h1: "Used cars under ₹10 lakh in Delhi", title: "Used cars under ₹10 lakh in Delhi", description: "Inspected used cars under ₹10 lakh in Naraina, Delhi. Fixed prices, RC transfer included.", intro: "Every car here is under ₹10 lakh, so no TCS applies either.", filters: { maxPrice: 10_00_000 } },
  { slug: "under-15-lakh", h1: "Used cars under ₹15 lakh in Delhi", title: "Used cars under ₹15 lakh in Delhi", description: "Used SUVs and sedans under ₹15 lakh in Naraina, New Delhi.", intro: "The sweet spot for nearly-new compact SUVs and sedans.", filters: { maxPrice: 15_00_000 } },
  { slug: "delhi", h1: "Used cars in Delhi", title: "Used cars in Delhi — fixed price, inspected", description: "Buy a used car in Delhi at one fixed price, with RC transfer included. Showroom in Naraina, West Delhi.", intro: "All our stock is at one showroom on Ring Road, Naraina — a short drive from Rajouri Garden, Janakpuri and Dwarka.", filters: {} },
  { slug: "naraina", h1: "Used car dealer in Naraina, West Delhi", title: "Used car dealer in Naraina, New Delhi", description: "EliteCarz, Indra Market, Ring Road, Naraina. Pre-owned cars at fixed prices, open 11–7 every day.", intro: "Find us at Indra Market, CB-382, Ring Road, Naraina Village — open every day, 11 am to 7 pm.", filters: {} },
];

export function brandSegment(make: string): Segment {
  return {
    slug: slugify(make),
    h1: `Used ${make} cars in Delhi`,
    title: `Used ${make} cars for sale in Delhi`,
    description: `Used ${make} cars at fixed prices in Naraina, New Delhi. Inspection report and full price breakup on every car.`,
    intro: `Every ${make} we have right now, at one fixed price with RC transfer included.`,
    filters: { make: [make] },
  };
}

export function findSegment(slug: string, makes: string[]): Segment | null {
  const s = STATIC.find((x) => x.slug === slug);
  if (s) return s;
  const make = makes.find((m) => slugify(m) === slug);
  return make ? brandSegment(make) : null;
}

export function segmentFilters(seg: Segment): Filters {
  return { ...EMPTY_FILTERS, ...seg.filters };
}

export const STATIC_SEGMENTS = STATIC;
