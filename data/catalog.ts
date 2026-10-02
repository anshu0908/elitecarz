// Normalised catalogue for the seed. Real values come from data/source-cars.json
// (snapshot of elitecarz.in, 2 Oct 2026). Only make/model/variant splitting and
// body type are added here; anything invented is listed in `demo`.

export type CatalogEntry = {
  handle: string;
  make: string;
  model: string;
  variant: string;
  bodyType: "SUV" | "Compact SUV" | "Sedan" | "Hatchback" | "MPV";
  /** Title year as listed on the current site (they use the registration year). */
  listedYear: number;
  transmission: string;
  insuranceType?: string;
  insuranceValidTill?: string; // ISO date
  seats?: number;
  /** Override for the Shopify price (₹3,000 placeholders on the live site). */
  priceOverride?: number;
  status?: "published" | "sold" | "reserved";
  /** Cars listed in BRIEF §3.4 vs extra cars found in the live feed. */
  inBrief: boolean;
};

export const CATALOG: CatalogEntry[] = [
  { handle: "2024-vw-virtus-gt-plus-1-5-at", make: "Volkswagen", model: "Virtus", variant: "GT Plus 1.5 AT", bodyType: "Sedan", listedYear: 2024, transmission: "Automatic", inBrief: true },
  { handle: "2023-ford-endeavour-titanium-plus-2-0-4wd-at", make: "Ford", model: "Endeavour", variant: "Titanium Plus 2.0 4WD AT", bodyType: "SUV", listedYear: 2023, transmission: "Automatic", insuranceType: "Expired", seats: 7, inBrief: true },
  { handle: "2025-mahindra-xev-9e-three-b79", make: "Mahindra", model: "XEV 9e", variant: "Pack Three (79 kWh)", bodyType: "SUV", listedYear: 2025, transmission: "Automatic", insuranceType: "Zero depreciation", insuranceValidTill: "2028-10-31", inBrief: false },
  { handle: "2023-mg-hector-plus-sharp-pro-cvt", make: "MG", model: "Hector Plus", variant: "Sharp Pro CVT", bodyType: "SUV", listedYear: 2023, transmission: "CVT", insuranceType: "Zero depreciation", insuranceValidTill: "2027-09-03", seats: 7, inBrief: true },
  { handle: "2021-hyundai-creta-sx-o-1-4-turbo", make: "Hyundai", model: "Creta", variant: "SX (O) 1.4 Turbo", bodyType: "SUV", listedYear: 2021, transmission: "Automatic", insuranceType: "Zero depreciation", insuranceValidTill: "2027-07-23", inBrief: true },
  { handle: "2022-kia-seltos-htx-1-5-mt", make: "Kia", model: "Seltos", variant: "HTX 1.5 MT", bodyType: "SUV", listedYear: 2022, transmission: "Manual", insuranceType: "Zero depreciation", insuranceValidTill: "2026-10-29", inBrief: true },
  { handle: "2026-tata-sierra-accomplished-plus-diesel-1-5l-turbo-at", make: "Tata", model: "Sierra", variant: "Accomplished Plus 1.5L Turbo Diesel AT", bodyType: "SUV", listedYear: 2026, transmission: "Automatic", inBrief: true },
  { handle: "2025-mahindra-bolero-neo-n10-o", make: "Mahindra", model: "Bolero Neo", variant: "N10 (O)", bodyType: "SUV", listedYear: 2025, transmission: "Manual", insuranceType: "Zero depreciation (20% NCB)", insuranceValidTill: "2027-03-31", seats: 7, inBrief: true },
  { handle: "2020-ford-ecosport-1-5-titanium-plus-at", make: "Ford", model: "EcoSport", variant: "1.5 Titanium Plus AT", bodyType: "Compact SUV", listedYear: 2020, transmission: "Automatic", insuranceType: "Comprehensive (25% NCB)", insuranceValidTill: "2026-11-26", inBrief: true },
  { handle: "2022-kia-sonet-gtx-plus-at", make: "Kia", model: "Sonet", variant: "GTX Plus AT", bodyType: "Compact SUV", listedYear: 2022, transmission: "Automatic", insuranceType: "Expired", inBrief: true },
  { handle: "2023-jeep-compass-s02-at", make: "Jeep", model: "Compass", variant: "S(O2) AT", bodyType: "SUV", listedYear: 2023, transmission: "Automatic", insuranceType: "Zero depreciation", insuranceValidTill: "2027-01-26", inBrief: true },
  { handle: "2023-toyota-hyrider-s-at-neodrive", make: "Toyota", model: "Urban Cruiser Hyryder", variant: "S AT NeoDrive", bodyType: "SUV", listedYear: 2023, transmission: "Automatic", insuranceType: "Zero depreciation", insuranceValidTill: "2027-02-08", inBrief: true },
  { handle: "2018-toyota-corolla-altis-g-at", make: "Toyota", model: "Corolla Altis", variant: "G AT", bodyType: "Sedan", listedYear: 2018, transmission: "Automatic", insuranceType: "Expired", inBrief: true },
  { handle: "2024-tata-safari-accomplished-plus-at-7str-dark-edition", make: "Tata", model: "Safari", variant: "Accomplished Plus AT 7-Seater Dark Edition", bodyType: "SUV", listedYear: 2024, transmission: "Automatic", insuranceType: "Zero depreciation", insuranceValidTill: "2027-02-23", seats: 7, inBrief: true },
  { handle: "2023-skoda-slavia-style-1-0-tsi-at", make: "Skoda", model: "Slavia", variant: "Style 1.0 TSI AT", bodyType: "Sedan", listedYear: 2023, transmission: "Automatic", insuranceType: "Zero depreciation", insuranceValidTill: "2027-05-27", inBrief: true },
  { handle: "2018-tata-hexa-xma-4x2", make: "Tata", model: "Hexa", variant: "XMA 4x2", bodyType: "SUV", listedYear: 2018, transmission: "Automatic", insuranceType: "Comprehensive", insuranceValidTill: "2026-08-09", seats: 7, inBrief: true },
  { handle: "2020-mahindra-xuv500-w11-at", make: "Mahindra", model: "XUV500", variant: "W11 AT", bodyType: "SUV", listedYear: 2020, transmission: "Automatic", seats: 7, inBrief: true },
  { handle: "2022-toyota-innova-crysta-zx-2-7-at", make: "Toyota", model: "Innova Crysta", variant: "ZX 2.7 AT", bodyType: "MPV", listedYear: 2022, transmission: "Automatic", seats: 7, inBrief: false },
  { handle: "toyota-innova-crysta-2-7-g-at", make: "Toyota", model: "Innova Crysta", variant: "2.7 G AT", bodyType: "MPV", listedYear: 2021, transmission: "Automatic", insuranceType: "Comprehensive", insuranceValidTill: "2027-03-31", seats: 7, inBrief: false },
  { handle: "toyota-innova-crysta-2-4-g-mt", make: "Toyota", model: "Innova Crysta", variant: "2.4 G MT", bodyType: "MPV", listedYear: 2022, transmission: "Manual", insuranceType: "Zero depreciation (45% NCB)", insuranceValidTill: "2027-02-28", seats: 7, inBrief: false },
  { handle: "2018-hyundai-tucson-gl-at", make: "Hyundai", model: "Tucson", variant: "GL AT", bodyType: "SUV", listedYear: 2018, transmission: "Automatic", insuranceType: "Comprehensive", insuranceValidTill: "2026-12-11", inBrief: true },
  { handle: "2020-ford-ecosport-titanium", make: "Ford", model: "EcoSport", variant: "Titanium", bodyType: "Compact SUV", listedYear: 2020, transmission: "Manual", inBrief: true },
  // Live feed shows ₹3,000 (placeholder); BRIEF §3.4 recorded ₹15.75 L. Shown as recently sold for the demo.
  { handle: "2019-mahindra-alturas-g4-4wd", make: "Mahindra", model: "Alturas G4", variant: "4WD AT", bodyType: "SUV", listedYear: 2019, transmission: "Automatic", seats: 7, priceOverride: 15_75_000, status: "sold", inBrief: true },
];

// Feature/highlight copy for the Hector only (BRIEF: "build in full for the Hector").
// Variant features are from MG's published spec for Hector Plus Sharp Pro — DEMO until checked against the actual car.
export const HECTOR_EXTRAS = {
  highlights: [
    "Single owner, Delhi registered",
    "Zero-dep insurance valid till 3 Sep 2027",
    "7-seater with captain-free bench layout",
  ],
  features: [
    "Panoramic sunroof",
    "14-inch touchscreen",
    "360° camera",
    "Ventilated front seats",
    "Powered driver seat",
    "Wireless Android Auto / Apple CarPlay",
    "Connected car tech",
    "6 airbags",
  ],
  disclosures: ["Minor scuff on rear bumper (left corner) — DEMO example of an honest disclosure"],
  description:
    "Black Hector Plus Sharp Pro with the CVT automatic, one owner from new and 49,000 km on the clock. Delhi registered, zero-dep insurance till September 2027. Price includes RC transfer.",
};
