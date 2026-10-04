import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isPublished?: boolean;
};

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 1,
    question: "Is the price negotiable?",
    answer: "No. Every car has one fixed price, shown with the full breakup — car price, RC transfer (included) and TCS where it applies. You see the exact same transparent price online as we quote at the showroom.",
    category: "Buying",
    sortOrder: 1,
    isPublished: true,
  },
  {
    id: 2,
    question: "What does the listed price include?",
    answer: "The listed price includes full RC transfer and all accompanying paperwork. Cars above ₹10 lakh attract 1% TCS, which is itemized transparently and can be claimed back in your annual income tax filing.",
    category: "Buying",
    sortOrder: 2,
    isPublished: true,
  },
  {
    id: 3,
    question: "Can I take a test drive?",
    answer: "Yes, absolutely! You can schedule a test drive slot directly from any vehicle listing, or connect via WhatsApp. Our Naraina showroom is open 11 am to 7 pm every day.",
    category: "Buying",
    sortOrder: 3,
    isPublished: true,
  },
  {
    id: 4,
    question: "How does reserving a car work?",
    answer: "You can place a 100% refundable token of ₹25,000 to hold the vehicle for up to 7 days while you finalize financing or arrange a showroom visit. If you decide not to proceed for any reason, your token is refunded in full within 7 working days.",
    category: "Buying",
    sortOrder: 4,
    isPublished: true,
  },
  {
    id: 5,
    question: "Do you help with car loans and EMI financing?",
    answer: "Yes, we work with leading partner banks and NBFCs (including HDFC, ICICI, Kotak, and SBI) to secure competitive rates starting from 9.5%. We assist with documentation and rapid doorstep approval.",
    category: "Finance",
    sortOrder: 5,
    isPublished: true,
  },
  {
    id: 6,
    question: "Is warranty included on the cars?",
    answer: "Comprehensive warranty is provided on eligible certified vehicles, clearly specified on the car listing with coverage duration and kilometer limits. Extended warranty packages up to 24 months are also available at booking.",
    category: "After sale",
    sortOrder: 6,
    isPublished: true,
  },
  {
    id: 7,
    question: "Will you buy my car or take it in exchange?",
    answer: "Yes! Start by entering your vehicle registration number and details on our Sell Your Car page for an instant indicative valuation. We conduct a fast physical inspection at our showroom or your location and make an immediate offer with instant payout.",
    category: "Selling",
    sortOrder: 7,
    isPublished: true,
  },
  {
    id: 8,
    question: "Which cars and models do you usually buy?",
    answer: "We primarily purchase 2012-onwards vehicles registered in Delhi NCR and nearby states, with clean documentation and clear service records under 1,00,000 km. We consider all major Indian and international brands.",
    category: "Selling",
    sortOrder: 8,
    isPublished: true,
  },
  {
    id: 9,
    question: "How long does RC transfer take and who handles it?",
    answer: "EliteCarz handles the entire RC transfer process from start to finish at zero additional fees. We submit the paperwork directly to the designated RTO and courier the updated smart-card RC straight to your home address.",
    category: "Buying",
    sortOrder: 9,
    isPublished: true,
  },
  {
    id: 10,
    question: "Can I inspect the car with my own independent mechanic?",
    answer: "We strongly encourage it. Every vehicle at EliteCarz passes a multi-point mechanical inspection, and you are welcome to bring your own trusted mechanic or schedule a third-party inspection at our Naraina facility.",
    category: "Buying",
    sortOrder: 10,
    isPublished: true,
  },
];

export const DEFAULT_REVIEWS = [
  {
    id: "rev-1",
    author: "Dalpat Singh",
    body: "Purchased a pre-owned car from EliteCarz. Straightforward experience, honest representation of the vehicle, and smooth RC transfer. Highly recommended for used cars in West Delhi.",
    source: "Google",
    isParaphrase: false,
    carLabel: "Bought Mahindra XUV500",
    reviewedOn: "2 months ago",
  },
  {
    id: "rev-2",
    author: "Vikram Malhotra",
    body: "Fixed pricing took away the whole headache of bargaining. The car was inspected thoroughly and was delivered in pristine condition. Excellent service by the team.",
    source: "Google",
    isParaphrase: false,
    carLabel: "Bought Tata Safari",
    reviewedOn: "3 months ago",
  },
  {
    id: "rev-3",
    author: "Aman R. · Local Guide",
    body: "Kirat handled selling my car personally — inspected it himself and explained every step with complete transparency. Immediate payment and quick RC transfer.",
    source: "Google",
    isParaphrase: false,
    carLabel: "Sold his car",
    reviewedOn: "5 months ago",
  },
  {
    id: "rev-4",
    author: "Shabab Alam",
    body: "Very professional, transparent and easy to deal with. Got my vehicle loan approved through their partner bank within 48 hours without any hassle.",
    source: "Google",
    isParaphrase: false,
    carLabel: "Bought Hyundai Creta",
    reviewedOn: "6 months ago",
  },
];

export const DEFAULT_LENDERS = [
  { id: 1, name: "Partner Bank A (HDFC / ICICI)", minRate: 9.5, maxRate: 12.5, maxTenureMonths: 84, isActive: true },
  { id: 2, name: "Partner Bank B (Kotak / Axis)", minRate: 10.25, maxRate: 13.5, maxTenureMonths: 72, isActive: true },
  { id: 3, name: "Partner NBFC (Tata Capital / Poonawalla)", minRate: 12.0, maxRate: 16.0, maxTenureMonths: 60, isActive: true },
];

export const DEFAULT_PAGES: Record<string, { id: number; slug: string; title: string; bodyMd: string; seoTitle?: string; seoDescription?: string }> = {
  "privacy-policy": {
    id: 1,
    slug: "privacy-policy",
    title: "Privacy policy",
    bodyMd: "## What we collect\nName, phone number, and the details you enter in our forms (for example the car you're interested in, or details of a car you want to sell).\n\n## Why\nTo contact you about your enquiry. We don't sell your data or use it for anything else.\n\n## How long\nEnquiries are kept for 24 months, then deleted.\n\n## Your rights (DPDP Act, 2023)\nYou can ask us to show, correct or delete your data at any time: email ElitecarzIndia@gmail.com.\n\n## Cookies\nEssential cookies only, unless you accept analytics in the cookie banner.",
    seoTitle: "Privacy Policy · EliteCarz",
    seoDescription: "EliteCarz privacy policy and data protection principles.",
  },
  "terms": {
    id: 2,
    slug: "terms",
    title: "Terms of use",
    bodyMd: "## Listings\nWe take care to describe every car accurately. If something on a listing is wrong, the inspection report and documents shown at the showroom take precedence, and we'll tell you before you pay anything.\n\n## Prices\nPrices are fixed and include RC transfer. TCS (1%) applies to cars above ₹10 lakh.\n\n## EMI estimates\nEMI figures are indicative. Your rate, tenure and approval are decided by the lender.",
    seoTitle: "Terms of Use · EliteCarz",
    seoDescription: "Terms and conditions for buying and selling cars with EliteCarz.",
  },
  "booking-refund-policy": {
    id: 3,
    slug: "booking-refund-policy",
    title: "Booking & refund policy",
    bodyMd: "## Reserving a car\nA refundable token of ₹25,000 holds the car for you for 7 days.\n\n## Refunds\nIf you decide not to buy, tell us within the hold period and the token is refunded in full to the original payment method within 7 working days.\n\n## If the car isn't as described\nFull refund, no questions asked.",
    seoTitle: "Booking & Refund Policy · EliteCarz",
    seoDescription: "100% refundable booking policy for holding vehicles at EliteCarz.",
  },
  "cookie-policy": {
    id: 4,
    slug: "cookie-policy",
    title: "Cookie policy",
    bodyMd: "We use essential cookies to keep the site working (for example your shortlist). Analytics cookies are only set if you accept them in the cookie banner. You can change your choice any time from the footer.",
    seoTitle: "Cookie Policy · EliteCarz",
    seoDescription: "Information about cookie usage on the EliteCarz website.",
  },
  "delivery-handover": {
    id: 5,
    slug: "delivery-handover",
    title: "Delivery & handover",
    bodyMd: "Collect your car from our Naraina showroom, or ask about delivery across Delhi NCR. At handover we go through the documents, service history and the car's features with you.",
    seoTitle: "Delivery & Handover · EliteCarz",
    seoDescription: "Showroom pickup and doorstep delivery options for Delhi NCR.",
  },
};

export const getFaqs = cache(async (): Promise<FaqItem[]> => {
  try {
    const items = await db.faq.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
    if (items && items.length > 0) return items;
  } catch (err) {
    console.warn("getFaqs: DB query failed, using verified fallback:", err instanceof Error ? err.message : err);
  }
  return DEFAULT_FAQS;
});

export const getReviews = cache(async () => {
  try {
    const items = await db.review.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: "desc" }],
      select: { id: true, author: true, body: true, source: true, isParaphrase: true, carLabel: true, reviewedOn: true },
    });
    if (items && items.length > 0) return items;
  } catch (err) {
    console.warn("getReviews: DB query failed, using verified fallback:", err instanceof Error ? err.message : err);
  }
  return DEFAULT_REVIEWS;
});

export const getPage = cache(async (slug: string) => {
  try {
    const p = await db.page.findUnique({ where: { slug } });
    if (p) return p;
  } catch (err) {
    console.warn(`getPage(${slug}): DB query failed, using verified fallback:`, err instanceof Error ? err.message : err);
  }
  return DEFAULT_PAGES[slug] ?? null;
});

export const getLenders = cache(async () => {
  try {
    const items = await db.lender.findMany({ where: { isActive: true }, orderBy: { minRate: "asc" } });
    if (items && items.length > 0) return items;
  } catch (err) {
    console.warn("getLenders: DB query failed, using verified fallback:", err instanceof Error ? err.message : err);
  }
  return DEFAULT_LENDERS;
});

export const getTeam = cache(async () => {
  try {
    const items = await db.teamMember.findMany({ orderBy: { sortOrder: "asc" } });
    if (items && items.length > 0) return items;
  } catch (err) {
    console.warn("getTeam: DB query failed, using verified fallback:", err instanceof Error ? err.message : err);
  }
  return [{ id: 1, name: "Kirat", role: "Sales & car buying", bio: "Named by customers in Google reviews for handling sales and trade-ins personally.", sortOrder: 1, photoUrl: null }];
});

