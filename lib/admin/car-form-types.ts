// Shared (server + client) shapes for the admin car form.
import type { CarStatus } from "@/lib/constants";
import type { InspectionResult } from "@/lib/inspection";
import type { FormImage } from "@/components/admin/ImageManager";

export type MasterData = Record<string, { bodyTypes: Record<string, string | null>; variants: Record<string, string[]> }>;

export type CarFormValues = {
  make: string; model: string; variant: string; title: string; slug: string;
  year: string; registrationYear: string; fuel: string; transmission: string; bodyType: string; color: string; seats: string;
  kmDriven: string; owners: string; rto: string; regNumber: string; insuranceType: string; insuranceValidTill: string;
  priceInr: string; tcsApplicable: boolean; badge: string; featured: boolean; purchasePriceInr: string; refurbCostInr: string;
  warrantyIncluded: boolean; warrantyMonths: string; warrantyKm: string; warrantyNote: string;
  engineCc: string; powerBhp: string; mileageKmpl: string;
  description: string; highlights: string[]; features: string[]; disclosures: string[]; videoUrl: string; notesInternal: string;
  status: CarStatus; images: FormImage[]; heroIndex: number;
  inspection: { inspectedBy: string; inspectedOn: string; summary: string; items: { section: string; item: string; result: InspectionResult; note: string }[] } | null;
};

export const EMPTY_CAR: CarFormValues = {
  make: "", model: "", variant: "", title: "", slug: "", year: String(new Date().getFullYear() - 3), registrationYear: "", fuel: "Petrol", transmission: "Automatic", bodyType: "SUV",
  color: "", seats: "5", kmDriven: "", owners: "1", rto: "DL", regNumber: "", insuranceType: "", insuranceValidTill: "", priceInr: "", tcsApplicable: true, badge: "New arrival",
  featured: false, purchasePriceInr: "", refurbCostInr: "", warrantyIncluded: false, warrantyMonths: "", warrantyKm: "", warrantyNote: "", engineCc: "", powerBhp: "", mileageKmpl: "",
  description: "", highlights: [], features: [], disclosures: [], videoUrl: "", notesInternal: "", status: "draft", images: [], heroIndex: 0, inspection: null,
};

