// Seed: real EliteCarz inventory snapshot + clearly-flagged DEMO extras.
// Run: npm run db:seed  (idempotent — wipes and recreates demo data)
import "dotenv/config";
import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../lib/generated/prisma/client";
import { CATALOG, HECTOR_EXTRAS } from "../data/catalog";
import { INSPECTION_TEMPLATE } from "../lib/inspection";
import { DEFAULT_SETTINGS } from "../lib/settings-defaults";
import { carSlug, maskRegNumber } from "../lib/slug";

const db = new PrismaClient({ adapter: new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" }) });

type SourceCar = { handle: string; title: string; price: number; createdAt: string; images: string[]; detail: Record<string, string> };
const source: { cars: SourceCar[] } = JSON.parse(readFileSync(new URL("../data/source-cars.json", import.meta.url), "utf8"));

export const DEMO_PASSWORD = "EliteCarz@2026";

const year = (s: string | undefined) => (s ? Number(s.match(/\d{4}/)?.[0]) || undefined : undefined);
const km = (s: string | undefined) => (s ? Number(s.replace(/\D/g, "")) || undefined : undefined);
const owners = (s: string | undefined) => (s ? Number(s.match(/\d/)?.[0]) || undefined : undefined);
const fuel = (s: string | undefined) => (s === "Electric" ? "Electric" : s ?? "Petrol");

// Deterministic pseudo-random so re-seeding gives the same DEMO numbers.
let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);

async function wipe() {
  await db.auditLog.deleteMany();
  await db.leadNote.deleteMany();
  await db.sellRequest.deleteMany();
  await db.booking.deleteMany();
  await db.lead.deleteMany();
  await db.priceHistory.deleteMany();
  await db.inspectionItem.deleteMany();
  await db.inspection.deleteMany();
  await db.carDocument.deleteMany();
  await db.carImage.deleteMany();
  await db.car.deleteMany();
  await db.variant.deleteMany();
  await db.model.deleteMany();
  await db.make.deleteMany();
  await db.user.deleteMany();
  await db.review.deleteMany();
  await db.faq.deleteMany();
  await db.page.deleteMany();
  await db.lender.deleteMany();
  await db.redirect.deleteMany();
  await db.teamMember.deleteMany();
  await db.setting.deleteMany();
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = [
    { name: "Owner (demo)", email: "owner@elitecarz.demo", role: "owner" },
    { name: "Manager (demo)", email: "manager@elitecarz.demo", role: "manager" },
    { name: "Sales (demo)", email: "sales@elitecarz.demo", role: "sales" },
    { name: "Viewer (demo)", email: "viewer@elitecarz.demo", role: "viewer" },
  ];
  const out: Record<string, string> = {};
  for (const u of users) out[u.role] = (await db.user.create({ data: { ...u, passwordHash } })).id;
  return out;
}

async function seedMasterData() {
  const ids = new Map<string, { makeId: number; modelId: number; variantId: number }>();
  for (const c of CATALOG) {
    const make = await db.make.upsert({ where: { name: c.make }, update: {}, create: { name: c.make } });
    const model = await db.model.upsert({
      where: { makeId_name: { makeId: make.id, name: c.model } },
      update: {},
      create: { makeId: make.id, name: c.model, bodyType: c.bodyType },
    });
    const variant = await db.variant.upsert({
      where: { modelId_name: { modelId: model.id, name: c.variant } },
      update: {},
      create: { modelId: model.id, name: c.variant, transmission: c.transmission },
    });
    ids.set(c.handle, { makeId: make.id, modelId: model.id, variantId: variant.id });
  }
  // Common Delhi used-car stock so staff autocomplete works beyond current inventory.
  const extra: Record<string, [string, string][]> = {
    "Maruti Suzuki": [["Swift", "Hatchback"], ["Baleno", "Hatchback"], ["Brezza", "Compact SUV"], ["Ertiga", "MPV"], ["Grand Vitara", "SUV"], ["Dzire", "Sedan"]],
    Hyundai: [["Venue", "Compact SUV"], ["Verna", "Sedan"], ["i20", "Hatchback"], ["Alcazar", "SUV"]],
    Tata: [["Nexon", "Compact SUV"], ["Harrier", "SUV"], ["Punch", "Compact SUV"], ["Altroz", "Hatchback"]],
    Mahindra: [["XUV700", "SUV"], ["Scorpio-N", "SUV"], ["Thar", "SUV"], ["XUV 3XO", "Compact SUV"]],
    Toyota: [["Fortuner", "SUV"], ["Glanza", "Hatchback"], ["Innova Hycross", "MPV"]],
    Kia: [["Carens", "MPV"]],
    Honda: [["City", "Sedan"], ["Amaze", "Sedan"], ["Elevate", "SUV"]],
    MG: [["Astor", "SUV"], ["Hector", "SUV"], ["ZS EV", "SUV"]],
    Skoda: [["Kushaq", "SUV"], ["Kodiaq", "SUV"]],
    Volkswagen: [["Taigun", "SUV"], ["Tiguan", "SUV"]],
  };
  for (const [makeName, models] of Object.entries(extra)) {
    const make = await db.make.upsert({ where: { name: makeName }, update: {}, create: { name: makeName } });
    for (const [name, bodyType] of models) {
      await db.model.upsert({ where: { makeId_name: { makeId: make.id, name } }, update: {}, create: { makeId: make.id, name, bodyType } });
    }
  }
  return ids;
}

function demoInspection(carId: string, opts: { minors: string[] }) {
  const items = INSPECTION_TEMPLATE.flatMap((s) =>
    s.items.map((item) => {
      const isMinor = opts.minors.includes(item);
      const na = item === "Turbo / hybrid system" || item === "Rear AC vents" || item === "Drive modes";
      return {
        section: s.section,
        item,
        result: na ? "na" : isMinor ? "minor" : "pass",
        note: isMinor ? "DEMO note — minor wear, disclosed" : null,
      };
    }),
  );
  return db.inspection.create({
    data: {
      carId,
      inspectedBy: "EliteCarz workshop (DEMO)",
      inspectedOn: new Date("2026-09-15"),
      summary: "DEMO sample report showing the format. Replace with the dealer's real checklist and results.",
      isDemo: true,
      items: { create: items },
    },
  });
}

async function seedCars(userIds: Record<string, string>, master: Awaited<ReturnType<typeof seedMasterData>>) {
  let n = 0;
  const carIds: Record<string, string> = {};
  for (const entry of CATALOG) {
    const src = source.cars.find((s) => s.handle === entry.handle);
    if (!src) throw new Error(`missing source car ${entry.handle}`);
    n++;
    const d = src.detail;
    const isHector = entry.handle.includes("hector");
    const title = `${entry.listedYear} ${entry.make} ${entry.model} ${entry.variant}`;
    const price = entry.priceOverride ?? src.price;
    const rto = d["RTO"] ?? "DL";
    const demoReg = `${rto.slice(0, 2)}${rto.length > 2 ? rto.slice(2) : String(1 + Math.floor(rand() * 12)).padStart(2, "0")}C${String.fromCharCode(65 + Math.floor(rand() * 26))}${1000 + Math.floor(rand() * 8999)}`;
    const ownerCount = owners(d["Ownership"]);
    const demoFields = ["regNumber", "purchasePriceInr", "refurbCostInr", "warranty", "views"];
    if (entry.priceOverride) demoFields.push("priceInr", "status");
    if (isHector) demoFields.push("features", "highlights", "disclosures", "inspection");
    const status = entry.status ?? "published";
    const addedAt = new Date(src.createdAt);

    // Photos: lead with the first real photo (3/4 view) rather than the designed front graphic.
    const photos = [...src.images];
    const firstPhoto = photos.findIndex((u) => /\.jpe?g/i.test(u.split("?")[0]));
    if (firstPhoto > 0) photos.unshift(...photos.splice(firstPhoto, 1));

    const car = await db.car.create({
      data: {
        slug: carSlug(title),
        stockNo: `EC-${String(n).padStart(4, "0")}`,
        status,
        ...master.get(entry.handle),
        title,
        year: year(d["Make Year"]) ?? entry.listedYear,
        registrationYear: year(d["Registration Year"]) ?? entry.listedYear,
        fuel: fuel(d["Fuel"]),
        transmission: entry.transmission,
        bodyType: entry.bodyType,
        kmDriven: km(d["Driven"]),
        owners: ownerCount,
        color: d["Color"],
        seats: entry.seats ?? 5,
        rto,
        regNumber: demoReg,
        regNumberMasked: maskRegNumber(demoReg),
        insuranceType: entry.insuranceType ?? null,
        insuranceValidTill: entry.insuranceValidTill ? new Date(entry.insuranceValidTill) : null,
        priceInr: price,
        tcsApplicable: true,
        warrantyIncluded: true,
        warrantyNote: "Listed as included on the current site — coverage terms to be confirmed (DEMO).",
        description: isHector ? HECTOR_EXTRAS.description : null,
        highlights: JSON.stringify(isHector ? HECTOR_EXTRAS.highlights : []),
        features: JSON.stringify(isHector ? HECTOR_EXTRAS.features : []),
        disclosures: JSON.stringify(isHector ? HECTOR_EXTRAS.disclosures : []),
        featured: ["hector", "safari", "sierra", "compass", "endeavour"].some((k) => entry.handle.includes(k)),
        badge: addedAt > new Date("2026-09-10") ? "New arrival" : null,
        purchasePriceInr: Math.round((price * (0.86 + rand() * 0.04)) / 5000) * 5000,
        refurbCostInr: Math.round((15000 + rand() * 45000) / 1000) * 1000,
        source: entry.inBrief ? "elitecarz.in (brief §3.4)" : "elitecarz.in live feed",
        notesInternal: entry.priceOverride ? "Live site shows ₹3,000 placeholder price — confirm status with owner." : null,
        demoFields: JSON.stringify(demoFields),
        views: Math.floor(40 + rand() * 400),
        publishedAt: addedAt,
        soldAt: status === "sold" ? new Date("2026-09-25") : null,
        soldPriceInr: status === "sold" ? price : null,
        createdById: userIds.owner,
        createdAt: addedAt,
        images: {
          create: photos.map((url, i) => ({
            url,
            alt: `${title} — photo ${i + 1}`,
            category: i < 8 ? "exterior" : "interior",
            sortOrder: i,
            isHero: i === 0,
          })),
        },
        documents: {
          create: [
            { type: "rc", verified: true },
            { type: "insurance", verified: !!entry.insuranceValidTill },
            { type: "challan_check", verified: true },
          ],
        },
      },
    });
    carIds[entry.handle] = car.id;
    if (isHector) await demoInspection(car.id, { minors: ["Bumpers", "Front left tread"] });
    if (entry.handle.includes("safari")) await demoInspection(car.id, { minors: ["Seats & upholstery"] });
    if (entry.handle.includes("creta")) await demoInspection(car.id, { minors: ["Paint finish & repaint check", "Battery health"] });
  }
  // Price-drop history example (DEMO) on the Compass.
  const compass = carIds["2023-jeep-compass-s02-at"];
  await db.priceHistory.create({ data: { carId: compass, oldPrice: 18_45_000, newPrice: 17_75_000, changedById: userIds.manager, changedAt: new Date("2026-09-20") } });
  await db.car.update({ where: { id: compass }, data: { badge: "Price drop" } });
  return carIds;
}

async function seedLeads(userIds: Record<string, string>, carIds: Record<string, string>) {
  const now = Date.now();
  const h = (hours: number) => new Date(now - hours * 3_600_000);
  const leads = [
    { type: "enquiry", status: "new", name: "Rohit (DEMO)", phone: "9810000001", car: "2023-mg-hector-plus-sharp-pro-cvt", source: "website", createdAt: h(2), message: "Is the Hector available for a test drive this Saturday?" },
    { type: "whatsapp_click", status: "new", name: null, phone: null, car: "2024-tata-safari-accomplished-plus-at-7str-dark-edition", source: "website", createdAt: h(5) },
    { type: "test_drive", status: "contacted", name: "Neha (DEMO)", phone: "9810000002", car: "2023-jeep-compass-s02-at", source: "google", createdAt: h(20), assigned: "sales", followup: 24 },
    { type: "sell_car", status: "new", name: "Amit (DEMO)", phone: "9810000003", car: null, source: "website", createdAt: h(30), sell: { make: "Hyundai", model: "Venue", mfgYear: 2021, kmRange: "25,000–50,000", fuel: "Petrol", transmission: "Manual", state: "DL", owners: 1, expectedPrice: 7_20_000, offeredMin: 6_40_000, offeredMax: 7_00_000 } },
    { type: "finance", status: "negotiating", name: "Sandeep (DEMO)", phone: "9810000004", car: "2026-tata-sierra-accomplished-plus-diesel-1-5l-turbo-at", source: "website", createdAt: h(52), assigned: "manager" },
    { type: "reserve", status: "visit_scheduled", name: "Priya (DEMO)", phone: "9810000005", car: "2021-hyundai-creta-sx-o-1-4-turbo", source: "website", createdAt: h(70), assigned: "sales", followup: -4 },
    { type: "call_back", status: "new", name: "Vikas (DEMO)", phone: "9810000006", car: null, source: "website", createdAt: h(28), message: "Call after 6 pm please" },
    { type: "enquiry", status: "won", name: "Karan (DEMO)", phone: "9810000007", car: "2019-mahindra-alturas-g4-4wd", source: "walk-in", createdAt: h(240), assigned: "manager" },
    { type: "enquiry", status: "lost", name: "Manish (DEMO)", phone: "9810000008", car: "2022-kia-sonet-gtx-plus-at", source: "website", createdAt: h(160), lostReason: "Bought elsewhere" },
    { type: "contact", status: "spam", name: "SEO offer", phone: "9810000009", car: null, source: "website", createdAt: h(90), message: "We can rank your site #1…" },
  ] as const;

  for (const l of leads) {
    const lead = await db.lead.create({
      data: {
        type: l.type,
        status: l.status,
        name: l.name,
        phone: l.phone,
        whatsapp: l.phone,
        carId: l.car ? carIds[l.car] : null,
        source: l.source,
        message: "message" in l ? l.message : null,
        lostReason: "lostReason" in l ? l.lostReason : null,
        assignedToId: "assigned" in l ? userIds[l.assigned] : null,
        nextFollowupAt: "followup" in l ? new Date(now + l.followup * 3_600_000) : null,
        payload: JSON.stringify({ demo: true }),
        createdAt: l.createdAt,
        pageUrl: l.car ? `/cars/${l.car}` : "/",
      },
    });
    if ("sell" in l) await db.sellRequest.create({ data: { leadId: lead.id, ...l.sell, regNumber: "DL8CAF0000" } });
    if (l.type === "test_drive" || l.type === "reserve") {
      await db.booking.create({
        data: {
          leadId: lead.id,
          carId: l.car ? carIds[l.car] : null,
          kind: l.type === "reserve" ? "reservation" : "test_drive",
          slot: new Date(now + 48 * 3_600_000),
          tokenAmount: l.type === "reserve" ? DEFAULT_SETTINGS.booking.tokenAmountInr : null,
          paymentStatus: l.type === "reserve" ? "not_enabled" : null,
        },
      });
    }
    if (l.status === "contacted") {
      await db.leadNote.create({ data: { leadId: lead.id, userId: userIds.sales, note: "Called, wants Saturday 12 pm slot. Confirmed on WhatsApp. (DEMO)" } });
    }
  }
}

async function seedContent() {
  // Paraphrased from public Google reviews (BRIEF §2). Names shortened; consent pending before publishing.
  await db.review.createMany({
    data: [
      { author: "Fanishwar R.", rating: 5, body: "Smooth from the online booking right through to delivery.", reviewedOn: "5 months ago", isFeatured: true },
      { author: "Aman R. · Local Guide", rating: 5, body: "Kirat handled selling my car personally — inspected it himself and explained every step.", reviewedOn: "5 months ago", isFeatured: true, carLabel: "Sold his car" },
      { author: "Local Guide (review in Hindi)", rating: 5, body: "Didn't end up buying for personal reasons, but the team was professional, transparent and easy to deal with.", reviewedOn: "6 months ago", isFeatured: true },
    ],
  });

  await db.faq.createMany({
    data: [
      { question: "Is the price negotiable?", answer: "No. Every car has one fixed price, shown with the full breakup — car price, RC transfer (included) and TCS where it applies. You see the same number we'd quote at the showroom.", category: "Buying", sortOrder: 1 },
      { question: "What does the price include?", answer: "The listed price includes RC transfer and the paperwork that goes with it. Cars above ₹10 lakh attract 1% TCS, which is shown separately and can be claimed against your income tax.", category: "Buying", sortOrder: 2 },
      { question: "Can I take a test drive?", answer: "Yes. Book a slot from any car page, or WhatsApp us. We're open 11 am to 7 pm, every day.", category: "Buying", sortOrder: 3 },
      { question: "How does reserving a car work?", answer: "You pay a refundable token to hold the car while you arrange finance or visit. If you decide not to buy, the token is refunded. Exact amount and timelines are on the booking policy page. (DEMO — terms to be confirmed)", category: "Buying", sortOrder: 4 },
      { question: "Do you help with loans?", answer: "Yes, through partner banks and NBFCs. The EMI shown on each car is an estimate using the rate and tenure stated next to it; your actual rate depends on the lender's approval.", category: "Finance", sortOrder: 5 },
      { question: "Is there a warranty?", answer: "Warranty is listed on each car where it applies, with the coverage period and what it covers. Ask us about extended warranty plans at the time of booking.", category: "After sale", sortOrder: 6 },
      { question: "Will you buy my car or take it in exchange?", answer: "Yes. Start with your registration number and a few details on the Sell page. We'll give you an indicative range, then inspect the car and make a firm offer.", category: "Selling", sortOrder: 7 },
      { question: "Which cars do you usually buy?", answer: "Mostly 2012-onwards cars registered in Delhi NCR and nearby states, first or second owner, under about 1 lakh km. If yours is outside this, send it anyway — we'll tell you honestly.", category: "Selling", sortOrder: 8 },
    ],
  });

  const draftNote = "> **DEMO draft.** To be reviewed with the owner and a lawyer before launch.\n\n";
  await db.page.createMany({
    data: [
      { slug: "privacy-policy", title: "Privacy policy", bodyMd: draftNote + "## What we collect\nName, phone number, and the details you enter in our forms (for example the car you're interested in, or details of a car you want to sell).\n\n## Why\nTo contact you about your enquiry. We don't sell your data or use it for anything else.\n\n## How long\nEnquiries are kept for 24 months, then deleted.\n\n## Your rights (DPDP Act, 2023)\nYou can ask us to show, correct or delete your data at any time: email ElitecarzIndia@gmail.com.\n\n## Cookies\nEssential cookies only, unless you accept analytics in the cookie banner." },
      { slug: "terms", title: "Terms of use", bodyMd: draftNote + "## Listings\nWe take care to describe every car accurately. If something on a listing is wrong, the inspection report and documents shown at the showroom take precedence, and we'll tell you before you pay anything.\n\n## Prices\nPrices are fixed and include RC transfer. TCS (1%) applies to cars above ₹10 lakh.\n\n## EMI estimates\nEMI figures are indicative. Your rate, tenure and approval are decided by the lender." },
      { slug: "booking-refund-policy", title: "Booking & refund policy", bodyMd: draftNote + "## Reserving a car\nA refundable token of ₹25,000 (DEMO amount) holds the car for you for 7 days.\n\n## Refunds\nIf you decide not to buy, tell us within the hold period and the token is refunded in full to the original payment method within 7 working days.\n\n## If the car isn't as described\nFull refund, no questions." },
      { slug: "cookie-policy", title: "Cookie policy", bodyMd: draftNote + "We use essential cookies to keep the site working (for example your shortlist). Analytics cookies are only set if you accept them in the cookie banner. You can change your choice any time from the footer." },
      { slug: "delivery-handover", title: "Delivery & handover", bodyMd: draftNote + "Collect your car from our Naraina showroom, or ask about delivery across Delhi NCR. At handover we go through the documents, service history and the car's features with you." },
    ],
  });

  await db.lender.createMany({
    data: [
      { name: "Partner bank A (DEMO)", minRate: 9.5, maxRate: 12.5, maxTenureMonths: 84 },
      { name: "Partner bank B (DEMO)", minRate: 10.25, maxRate: 13.5, maxTenureMonths: 72 },
      { name: "Partner NBFC (DEMO)", minRate: 12, maxRate: 16, maxTenureMonths: 60 },
    ],
  });

  await db.teamMember.createMany({
    data: [{ name: "Kirat", role: "Sales & car buying", bio: "Named by customers in Google reviews for handling sales and trade-ins personally. (Photo and bio pending consent.)", sortOrder: 1 }],
  });

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.setting.create({ data: { key, value: JSON.stringify(value) } });
  }
}

async function seedRedirects(carIds: Record<string, string>) {
  // Old Shopify URLs → new routes (BRIEF §20).
  const cars = await db.car.findMany({ select: { id: true, slug: true } });
  const byId = new Map(cars.map((c) => [c.id, c.slug]));
  const rows = Object.entries(carIds).map(([handle, id]) => ({ fromPath: `/products/${handle}`, toPath: `/cars/${byId.get(id)}` }));
  rows.push(
    { fromPath: "/collections/all", toPath: "/cars" },
    { fromPath: "/collections/cars", toPath: "/cars" },
    { fromPath: "/pages/sell-a-car", toPath: "/sell-your-car" },
    { fromPath: "/pages/contact", toPath: "/contact" },
    { fromPath: "/pages/privacy-policy", toPath: "/policies/privacy-policy" },
    { fromPath: "/pages/terms-conditions", toPath: "/policies/terms" },
    { fromPath: "/pages/shipping-policy", toPath: "/policies/delivery-handover" },
  );
  await db.redirect.createMany({ data: rows });
}

async function main() {
  await wipe();
  const userIds = await seedUsers();
  const master = await seedMasterData();
  const carIds = await seedCars(userIds, master);
  await seedLeads(userIds, carIds);
  await seedContent();
  await seedRedirects(carIds);
  const count = await db.car.count();
  console.log(`Seeded ${count} cars. Admin logins: owner|manager|sales|viewer@elitecarz.demo / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
