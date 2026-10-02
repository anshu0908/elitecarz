// Shapes passed from server to client components. PublicCar never contains admin-only fields.

export type PublicCar = {
  id: string;
  slug: string;
  stockNo: string | null;
  status: "published" | "reserved" | "sold";
  title: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  registrationYear: number | null;
  fuel: string;
  transmission: string;
  bodyType: string | null;
  kmDriven: number | null;
  owners: number | null;
  color: string | null;
  seats: number | null;
  rto: string | null;
  regNumberMasked: string | null;
  insuranceType: string | null;
  insuranceValidTill: string | null;
  priceInr: number;
  tcsApplicable: boolean;
  warrantyIncluded: boolean;
  warrantyMonths: number | null;
  warrantyKm: number | null;
  warrantyNote: string | null;
  description: string | null;
  highlights: string[];
  features: string[];
  disclosures: string[];
  videoUrl: string | null;
  featured: boolean;
  badge: string | null;
  images: { url: string; alt: string | null; category: string | null }[];
  heroImage: string | null;
  photoCount: number;
  demoFields: string[];
  views: number;
  publishedAt: string | null;
  soldAt: string | null;
};

export type PublicCarDetail = PublicCar & {
  documents: { type: string; verified: boolean; fileUrl: string | null }[];
  inspection: {
    inspectedBy: string | null;
    inspectedOn: string | null;
    summary: string | null;
    isDemo: boolean;
    items: { section: string; item: string; result: string; note: string | null }[];
  } | null;
  priceDrop: { oldPrice: number; newPrice: number; changedAt: string } | null;
};
