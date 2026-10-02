# EliteCarz Website Rebuild — Project Brief v2 (Handoff for Claude Code)

> **v2 adds Part B (Sections 15–25): full professional-site requirements, the Admin Panel spec (add/edit/delete listings, leads CRM, content), database schema, security/compliance, roadmap and a ready-to-paste Claude Code kickoff prompt.** Where Part B conflicts with Section 12, **Part B wins.**

> Audit date: 2 Oct 2026. Source: live crawl of elitecarz.in (homepage, one car detail page, Sell a Car page) + the Google Business Profile text pasted by the user. I read text/HTML structure only: **rendered visuals, mobile layout, page speed and structured data were NOT verified.**

---

## 1. Goal

I (the user) want to **pitch my own version of the EliteCarz website to the dealership owner**. Deliverable now: a **working, clickable demo** using EliteCarz's real inventory and branding, plus the audit evidence that shows why a rebuild is worth paying for.

Pitch strategy:
1. Lead with objective, easily-verified bugs (Section 6A).
2. Show the working demo (Section 12, Phase 1).
3. Frame the benefit as outcomes: more WhatsApp enquiries, more trade-in leads, more visible trust. Quote the price *after* the demo.
4. Demo is **private**. Do not publish it publicly or reuse EliteCarz photos beyond the pitch.

---

## 2. The Business

| Field | Detail |
|---|---|
| Name | EliteCarz (Hindi: एलिटकार्ज) |
| Type | Used / pre-owned car dealer, Delhi NCR |
| Address | Indra Market, CB-382, Ring Rd, Block CB, Naraina Village, Naraina, New Delhi, Delhi 110028 |
| Plus code | J4GM+JC New Delhi, Delhi |
| Phone | +91 97111 63000 (097111 63000) |
| Email | ElitecarzIndia@gmail.com |
| Website | https://elitecarz.in (Shopify store) |
| Hours (site) | Mon–Sun 11:00 am – 7:00 pm |
| Hours (Google, 2 Oct 2026) | Closes 7 pm; "Opens 11 am Sat"; note says Gandhi Jayanti may affect hours |
| Google rating | **4.7 ★ from 118 reviews** |
| Delivery | Google profile lists "Delivery" |
| Also at same address on Maps | "Great x transport" (warehouse, 5.0, 4 reviews), likely unrelated/shared premises |
| Similar listings Google shows | ELITE CAR (4.9, 9 reviews, car dealer), Auto Elite (4.1, 310 reviews, used car dealer), Car Ki Deal (3.7, 3 reviews) |

### What they do
- **Sell** inspected pre-owned cars at a **fixed, no-negotiation price** with RC transfer included and a "150+ checkpoints" inspection claim.
- **Finance** via banks/NBFCs (EMI shown on every listing).
- **Buy / exchange** cars from owners (Sell a Car lead form), with stated filters on what they won't buy (see 3.5).
- Offer warranty (site says "selected vehicles"), test drives, vehicle history reports (claimed), refundable booking ("Book Now – 100% Refundable").

### Reputation (Google review themes)
- Review chips: "initial inspection" (2), "prompt query resolution" (2), "transparent dealing" (3), "car collection" (2), +6 more.
- Review summary quotes (paraphrase when reusing): all models at one location with good customer service; easy-going process and good staff; good vehicle quality and price.
- Fanishwar Rana (5 months ago): excellent experience, smooth from online booking through final delivery.
- शुभ हैं हम (Local Guide, 6 months ago): didn't buy due to personal reasons but praised professionalism, transparency, customer-friendly approach.
- Aman Rajmalani (Local Guide, 5 months ago): praised **Kirat**, who handled the car-selling process personally: inspected the car himself, explained each step.
- **Insight:** the real asset is trust + a named, personal sales contact (Kirat). The current site doesn't show people, real reviews, or proof.

### Competitive context
Spinny, Cars24, CarDekho Used, Droom, Mahindra First Choice, plus other Delhi dealers. EliteCarz edge: local, personal, transparent fixed pricing. The site should look **credible and premium**, not try to copy a big marketplace.

---

## 3. Current Website — Full Content Inventory

Platform: **Shopify** (cart, `/cdn/shop/` assets, `/cart/<variant>:1?checkout`, Shopify digital wallet meta).
Only 3 pages were crawled. Other known URLs: `/collections/all`, `/collections/cars`, `/pages/contact`, `/pages/privacy-policy`, `/pages/terms-conditions`, `/pages/shipping-policy`.

### 3.1 Meta
- `<title>`: "Elitecarz" (homepage). Car page: "2023 MG Hector Plus Sharp Pro CVT – Elitecarz".
- Meta / OG / Twitter description: **"Elitecarz"** (just the name) everywhere.
- OG image only set on product pages.

### 3.2 Navigation
- Header: **Sell a Car**, **Contact us**, More, Search, Account, Cart (0).
- Footer Quick Links: Sell a Car, Contact us.
- Footer Brands (all link to `/collections/all`): Tata, Mahindra, Hyundai, Audi, Ford.
- Footer Policies: Privacy Policy, Terms & Conditions, Shipping policy.
- Very bottom bar: Privacy Policy, Terms & Conditions, Refund Policy → all `href="#"` (dead).

### 3.3 Homepage content (in order)
1. Hero: **"A Collection Built On Trust"** — "Every EliteCarz vehicle is handpicked - so you get trust, quality, and value in one place." CTA: View All Cars (`/collections/cars`). Two hero images.
2. "Welcome to Elitecarz": "We are premium pre-owned car dealership in Delhi NCR, offering handpicked, fully inspected vehicles with warranty and complete peace of mind."
3. Car grid (featured) — 16 cars (table below).
4. Two banner images linking to `/collections/all`.
5. "New Arrivals" — repeats the first 8 cars from the featured grid (duplicate content).
6. "What our customers say" — 4 testimonials.
7. Contacts block + contact info + "Send Message" form.
8. FAQ (10 items, text below).
9. Footer.

### 3.4 Inventory (as listed on the site on 2 Oct 2026)

| # | Car | Fuel | Transmission | RTO | Price | EMI/m (card) |
|---|---|---|---|---|---|---|
| 1 | 2024 VW Virtus GT Plus 1.5 AT | Petrol | Automatic | UP | ₹14.75 L | ₹26,099 |
| 2 | 2023 Ford Endeavour Titanium Plus 2.0 4WD AT | Diesel | Automatic | CH | ₹29.75 L | ₹52,640 |
| 3 | 2023 MG Hector Plus Sharp Pro CVT | Petrol | Automatic (CVT) | DL | ₹14.75 L | ₹26,099 |
| 4 | 2021 Hyundai Creta SX (O) 1.4 Turbo | Petrol | Automatic | DL | ₹11.85 L | ₹20,967 |
| 5 | 2022 Kia Seltos HTX 1.5 MT | Petrol | Manual | HR | ₹10.75 L | ₹19,021 |
| 6 | 2026 Tata Sierra Accomplished Plus AT (1.5L Turbo Diesel) | Diesel | Automatic (TC) | HR03 | ₹21.75 L | ₹38,484 |
| 7 | 2025 Mahindra Bolero Neo N10 (O) | Diesel | Manual | HR | ₹9.75 L | ₹17,252 |
| 8 | 2020 Ford Ecosport 1.5 Titanium Plus AT | Petrol | Automatic | DL | ₹7.25 L | ₹12,828 |
| 9 | 2022 Kia Sonet GTX Plus AT | Diesel | Automatic | HR | ₹10.25 L | ₹18,136 |
| 10 | 2023 Toyota Hyryder S AT NeoDrive | Petrol Hybrid | Automatic | DL | ₹11.75 L | ₹20,790 |
| 11 | 2023 Jeep Compass S(O2) AT | Petrol | Automatic | DL | ₹17.75 L | ₹31,407 |
| 12 | 2018 Toyota Corolla Altis G AT | Petrol | Automatic | UP | ₹7.45 L | ₹13,182 |
| 13 | 2024 Tata Safari Accomplished AT 7STR Dark Edition | Diesel | Automatic | UP | ₹20.25 L | ₹35,830 |
| 14 | 2023 Skoda Slavia Style 1.0 TSI AT | Petrol | Automatic | HR | ₹10.75 L | ₹19,021 |
| 15 | 2018 Tata Hexa XMA 4X2 | Diesel | Automatic | DL | ₹6.75 L | ₹11,943 |
| 16 | 2020 Mahindra XUV500 W11 AT | Diesel | Automatic | DL | ₹10.75 L | ₹19,021 |
| 17 | 2018 Hyundai Tucson GL AT *(seen in related/search)* | Diesel | Automatic | DL | ₹8.75 L | ₹15,482 |
| 18 | 2020 Ford Ecosport Titanium *(related)* | Petrol | Manual | DL | ₹4.95 L | ₹8,759 |
| 19 | 2019 Mahindra Alturas G4 4WD *(related)* | Diesel | Automatic | HR | ₹15.75 L | ₹27,868 |

Product URL pattern: `https://elitecarz.in/products/<year>-<make>-<model-slug>` (e.g. `2023-mg-hector-plus-sharp-pro-cvt`). Image CDN: `https://elitecarz.in/cdn/shop/files/...`.
Price range ≈ ₹4.95 L – ₹29.75 L; most stock ₹7–22 L SUVs/compact SUVs. Mostly automatics. Registration states seen: DL, HR, UP, CH.

### 3.5 Car detail page structure (reference: 2023 MG Hector Plus Sharp Pro CVT)
- ~30 images (first image is a designed graphic, rest are phone photos `IMG_xxxx.jpg`).
- Title; "49,000 Km Petrol Automatic (CVT)"; **₹14,75,000 + 1% TCS**; "Price Breakup" link; "Starting EMI ₹26,099/m"; "Calculate your EMI".
- CTAs: **Call Now 11AM To 7PM** (`tel:97111-63000`), **Book Now 100% Refundable** (also a `tel:` link, not a real booking flow), **Buy Now** (Shopify direct checkout `/cart/<variantId>:1?checkout`).
- **Car Detail:** Make Year 2023, Registration Year 2023, Ownership 1st, Fuel Petrol, Driven 49,000 Km, RTO DL, Transmission Automatic (CVT), Insurance "Z.D Insurance (3/09/2027)", Color Black.
- "Special about this car": single generic card "Well Maintained – Regularly serviced and kept in excellent condition".
- **EMI calculator:** Loan Amount (Max 80%) ₹11,80,000; Down Payment (Min 20%) ₹2,95,000; Tenure 5 years; Monthly EMI ₹22,463; Principal ₹11,80,000; Total Interest ₹3,32,202; Total Payment ₹13,47,802.
- **Benefits icons:** Transfer — "Cost Included"; Warranty — "Included"; "150+ Checkpoints"; "Get Extended Warranty" (link `#`); "Want Extended Warranty? Our sales executive will help you…".
- **Price summary:** "Fixed price assured! To save you time on negotiations"; Car amount ₹14,75,000; "Rc Transfer & More. Included"; 1% TCS ₹14,750; **Total ₹14,89,750**.
- Related Products: Tucson, Ecosport Titanium, Alturas (cheapest/random, not similar to a ₹15 L Hector).
- Testimonials + same 10-item FAQ repeated.

### 3.6 Sell a Car page (`/pages/sell-a-car`)
Heading "Sell Your Car". **Visible leaked brief copy:**
> "Share your vehicle details below and our team will review your car quickly. Designed in a compact EliteCarz style with proper mobile responsiveness."
> Feature tiles: "Fast Review – Compact form with quick vehicle details capture." / "Verified Buying – Premium used car sourcing and inspection process." / "Responsive Design – Clean, compact and mobile-friendly layout." / "Brand Consistent – Black, white and red website-style appearance."
> Bottom chips: "Quick callback · Verified team · Compact mobile form".

Form fields (all required): Your Name; Mobile Number; WhatsApp Number; Your City; Registration Number; State [DL, HR, UP, CH, PB, UK, "Other State (Less Likely We Buy)"]; Manufacturing Year [2025…2009, Other]; Registration Year [same]; Owner Type [1st Owner, 2nd Owner, "3rd or Above (Less Likely We Buy)"]; Brand [Hyundai, Ford, Maruti Suzuki, KIA, Skoda, Honda, Renault, Nissan, BYD, MG, BMW, Mercedes-Benz, Audi, Land Rover, Jeep, Porsche, Citroen, Lamborghini, Volvo, Volkswagen, Lexus, Ferrari, Jaguar, Maserati, Mini, Rolls-Royce, Aston Martin, McLaren, Isuzu, Force Motors, Bentley]; Model Name; Variant; Driven KM [Below 10,000 … 75,000–100,000, "Above 100,000 (Less Likely We Buy)"]; Fuel [Petrol, Diesel, CNG, EV]; Transmission [Manual, Automatic, iMT]; Expected Price. Submit "Submit Details".

**Business rules revealed by the form (useful for the new valuation flow):** prefer DL/HR/UP/CH/PB/UK registrations, 1st/2nd owners, ≤ ~1 lakh km, mostly 2009+.

### 3.7 Testimonials on site (as shown)
1. Dalpat Raj Choudhary — tag "XUV500" (homepage) / "Safari" (car page): seamless from quote to drop-off, transparent pricing, no hidden fees.
2. Krishnendra Dwivedi — "Safari": transparent and trustworthy, no hidden costs, no false promises.
3. Lalit Wadhwa — "Kia Seltos": same "transparent and trustworthy… no hidden costs, no false promises" phrasing; car as shown in pictures, quick delivery.
4. Shabab — "Harrier" (homepage) / "Safari" (car page): liked the honesty; condition, mileage, service history explained; no pressure.

### 3.8 FAQ on site (10 Qs — answers are generic/AI-like)
Contact; RC transfer & documentation (yes, complete help); how to purchase; warranty ("selected vehicles", varies); types of cars (mentions Thar, XUV500, Audi A6 — **not in stock**); inspection (multi-point); test drive (yes); vehicle history reports (yes, "for all our cars"); financing (banks/NBFCs); sell/exchange (yes, expert evaluation).

---

## 4. What the Current Site Does Well (keep)
- **Fixed-price + transparent breakup** (price, TCS, RC transfer included, total).
- EMI shown on every card.
- Large photo galleries (30+ images on the Hector).
- Clear "Sell a Car" funnel exists and business rules are honestly disclosed.
- Fuel / transmission / RTO chips on cards.
- Trust claims already there (150+ checks, warranty, refundable booking): they just lack proof.

---

## 5. Brand Notes
- Existing palette (from Sell page copy): **black, white and red**. Logo file: `https://elitecarz.in/cdn/shop/files/1751041270logo_250ce11c-d2ca-43e2-917d-9fcf945e8732.png` (wordmark "ELITECARZ").
- Tagline on site: "Premium Pre-Owned Automotive Experience" / "Luxury, trust, and performance — handpicked pre-owned cars for buyers who expect more."
- Keep black/white/red as the brand base; make it feel more premium and less template-y.

---

## 6. Audit Findings

### 6A. Hard bugs / errors (use these first in the pitch)
1. **Leaked dev brief copy on Sell a Car page** (quoted in 3.6): "Designed in a compact EliteCarz style with proper mobile responsiveness", "Responsive Design", "Brand Consistent: Black, white and red…".
2. **Sell form brand list omits Tata, Mahindra, Toyota** (all stocked: Safari, Hexa, Sierra, XUV500, Bolero Neo, Alturas, Hyryder, Corolla) while listing Lamborghini, Ferrari, Rolls-Royce, Bentley, McLaren. Year dropdown stops at 2025 while they stock a 2026 Sierra. Owners of those cars cannot submit them.
3. **EMI numbers don't reconcile.** Calculator: principal ₹11,80,000, EMI ₹22,463, total payment ₹13,47,802 → implied interest ≈ ₹1,67,802, but the page shows "Total Interest ₹3,32,202". The implied rate (~5–6% p.a.) is far below typical used-car loan rates, which could be misleading — verify and confirm real lender rates. Card EMI (₹26,099 for ₹14.75 L = ~1.77% of price) uses undisclosed rate/tenure and doesn't match the calculator (₹22,463 on 80% loan).
4. **Dead links:** footer-bottom Privacy / Terms / Refund → `#`; "Get Extended Warranty" → `#`. Footer lists a **"Shipping policy"** for a car dealer.
5. **Footer "Brands" all link to `/collections/all`** and list Audi (not in stock).
6. **FAQ contradicts site/inventory:** says history reports for *all* cars (none shown); warranty "selected vehicles" vs car page "Warranty: Included"; names Thar and Audi A6 (not in stock).
7. **Testimonials look templated/inconsistent:** two reviews share near-identical phrasing; the car tag differs between pages for the same reviewer (Dalpat: XUV500 vs Safari; Shabab: Harrier vs Safari).
8. **Typos:** "Z.D Insurance" (zero-dep), "Rc Transfer & More. Included", "Ecosport" vs "EcoSport", "Hyrider" in URL vs "Hyryder" in title, "S(02)" vs "S(O2)".

### 6B. Conversion / UX problems
- Nav has only *Sell a Car* + *Contact us*. No Buy / Cars, Finance, Warranty, About, Reviews.
- **No filters/sorting/search facets** (budget, body type, fuel, transmission, year, owners, RTO, brand).
- Homepage "Featured" and "New Arrivals" show the **same cars** (duplicate).
- **Retail checkout for cars:** cart icon, "Your cart is empty", Shopify "Buy Now" direct checkout; "Book Now – 100% Refundable" is just a phone link, with no real token-payment/booking flow.
- **No WhatsApp CTA** anywhere; contact is phone (11am–7pm) + Gmail. Enquiries outside hours have no capture path.
- Car pages lack proof: no inspection report, no service history, no documents, no accident-free statement, no walkaround video, no feature list, no 360. "Special about this car" is one generic card. "150+ checkpoints" has nothing behind it.
- RTO chips like "UP", "CH", "HR03" are unexplained; no owner count/KM on cards.
- Related products are random, not similar by price/segment.
- Sell form: 17 required fields, no photo upload, no instant price range, negative "(Less Likely We Buy)" wording.
- No About / team / showroom photos / Google Maps embed. No Hindi option.

### 6C. SEO / technical
- Title = "Elitecarz" on homepage; meta description = "Elitecarz" sitewide.
- No visible local-SEO content or landing pages (used cars in Delhi / Naraina; per-brand, per-budget, per-body-type pages). No blog.
- Structured data not verified; **check page source** for AutoDealer/LocalBusiness, Vehicle/Product, FAQPage, Review/AggregateRating.
- Shopify image serving looks OK (width params), but run **Lighthouse / PageSpeed on mobile** and capture scores for the pitch deck.
- Review-count/rating on site is not tied to the real Google reviews (118 @ 4.7).

---

## 7. Proposed New Site — Positioning
**"Delhi's fixed-price, fully documented used cars. Every claim has proof on the page."**
Tone: confident, premium, plain-spoken (English with optional Hindi toggle). Avoid generic AI-sounding copy.

## 8. New Sitemap
1. **Home**
2. **Buy Cars** (inventory with filters) + landing pages: `/used-cars/suv`, `/used-cars/under-10-lakh`, `/used-cars/<brand>`, `/used-cars-delhi`, `/used-cars-naraina`
3. **Car detail** (`/cars/<slug>`)
4. **Sell / Trade-in** (`/sell-your-car`) multi-step valuation
5. **Finance** (`/finance`): EMI calculator + lender partners + doc checklist
6. **Warranty & Inspection** (`/warranty`, `/inspection-process`): what the 150+ points are, sample report
7. **How it works / Buying process** (book → inspect → paperwork → delivery)
8. **Reviews** (real Google reviews, live or curated)
9. **About / Team / Showroom** (Kirat and team, map, photos, hours)
10. **Contact** (WhatsApp, call, callback request, map)
11. **Blog / Guides** (local SEO)
12. **Policies** (Privacy, Terms, Refund/Booking policy: real, working pages; remove "Shipping")

## 9. New Features (mapped to problems)

| Problem | Fix |
|---|---|
| No filters | Budget slider, body type, brand, fuel, transmission, year, owners, KM, RTO state; sort by price/year/km; compare up to 3 cars |
| Duplicate home sections | "Just arrived" (by date) + "Under ₹10 L" + "Automatic SUVs" + "Most viewed" rails |
| No WhatsApp | Sticky WhatsApp + Call buttons (mobile bottom bar), pre-filled message per car ("Hi, I'm interested in <car> <link>"), click-to-WhatsApp on every card; after-hours callback form |
| Fake checkout | Replace "Buy Now" with **Reserve this car** (refundable token, shown amount + terms) and **Book test drive** (date/time slot picker) |
| No proof on car page | Inspection report (sectioned pass/fail, 150+ points summary), service history, document status (RC, insurance, challan check), accident-free/flood-free declarations, walkaround video, feature list, highlights, "issues disclosed honestly" section |
| Inconsistent EMI | One EMI engine: rate, tenure, down-payment sliders; show assumptions & "indicative only"; per-lender estimates; link to pre-approval request |
| Price clarity | Single price box: Car price + TCS + (optional insurance/extended warranty add-ons) = on-road total; fixed-price badge |
| Trade-in friction | 4-field start (reg. no., model, km, phone) → instant indicative range → photo upload → inspection slot. Full brand/model list including Tata, Mahindra, Toyota; year through 2026 |
| Generic trust | Real Google rating widget (4.7★ / 118), real review cards, team page with Kirat, showroom photos, Google Maps |
| SEO gaps | Unique title/meta per page, JSON-LD (AutoDealer, Vehicle, Offer, FAQPage, AggregateRating, BreadcrumbList), sitemap.xml, programmatic landing pages, image alt text, Open Graph per car |
| Language | English/Hindi toggle on key pages |
| Admin | Easy way for staff to add a car (keep Shopify admin or a simple CMS/Google Sheet → JSON) |
| Analytics | GA4 events: WhatsApp click, call click, reserve start, test-drive booked, sell-form step completion |

## 10. Data Model (for the demo + real build)

```ts
type Car = {
  id: string; slug: string;
  year: number; make: string; model: string; variant: string;
  fuel: 'Petrol'|'Diesel'|'CNG'|'Petrol Hybrid'|'EV';
  transmission: 'Manual'|'Automatic'|'CVT'|'iMT'|'TC';
  bodyType: 'SUV'|'Compact SUV'|'Sedan'|'Hatchback'|'MPV';
  priceInr: number;           // ex-TCS
  tcsPct: 1;                  // applies above ₹10 L
  kmDriven?: number; owners?: number; rto: string; color?: string;
  insuranceType?: string; insuranceValidTill?: string;
  registrationYear?: number;
  images: string[]; videoUrl?: string;
  features: string[]; highlights: string[]; disclosures: string[];
  inspection?: { sections: { name: string; passed: number; total: number; notes?: string }[] };
  warranty?: { included: boolean; months?: number; kmLimit?: number };
  status: 'available'|'reserved'|'sold';
  addedAt: string;
};
```
Seed `data/cars.json` from Section 3.4 (fill unknown fields with plausible placeholders **clearly flagged `// DEMO`**). Known full record: the Hector (49,000 km, 1st owner, DL, black, ZD insurance valid till 3 Sep 2027).

## 11. Design Direction
- Base: black / white / red from existing brand, but more refined: near-black surfaces, off-white content areas, a single sharp red accent, generous whitespace.
- Typography: one confident display face for headings + a clean sans for UI/body (Google Fonts); numerals tabular for prices/EMI.
- Cards: big photo, price top-left, key specs row (year · km · fuel · transmission · owner), RTO, "Fixed price" tag, EMI, WhatsApp/Call icons.
- Mobile-first (most Indian car buyers browse on phones): sticky bottom bar (WhatsApp, Call, Reserve), thumb-friendly filters in a bottom sheet.
- Trust strip: 150+ checks · Fixed price · RC transfer included · Warranty · 4.7★ Google.
- Avoid stock AI-template feel: real car photos only, restrained animation, no generic gradient hero.
- Use the project's frontend-design skill/guidelines if available.

## 12. Build Plan (start here in Claude Code)

**Recommended stack for the demo:** Next.js (App Router) + TypeScript + Tailwind, static JSON data, deployable to Vercel/Netlify as a private preview link.
**Recommended stack for the real build (after the pitch is won):** keep **Shopify** as inventory back end and build a custom theme or headless front end via the Storefront API, so the owner keeps their workflow. Alternative: Next.js + Sanity/Google Sheet CMS.

### Phase 0 — Setup
- [ ] Scaffold project, Tailwind, fonts, `data/cars.json` from Section 3.4, `/public` placeholder for logo.
- [ ] Save this brief as `CLAUDE.md`.

### Phase 1 — Pitch demo (priority)
- [ ] **Home**: hero with budget/body-type finder, trust strip, "Just arrived" + "Under ₹10 L" + "Automatic SUVs" rails, sell/trade-in block, real-review strip, showroom + map, sticky mobile bar.
- [ ] **Inventory**: working client-side filters + sort + compare (use cars.json).
- [ ] **Car detail** (build in full for the Hector; reuse template): gallery, price box (price + TCS = total), EMI calculator (editable rate/tenure, correct math), inspection report UI (sample data flagged DEMO), documents, features, WhatsApp-prefilled CTA, reserve & test-drive modals, similar cars.
- [ ] **Admin panel demo** (see Section 16): login screen, dashboard, car list with search/filter, **Add car** form with image upload + drag-reorder, **edit**, **delete (soft, with undo)**, status changes (Draft/Published/Reserved/Sold), leads inbox. For the pitch demo it may run on mock data/local state, but build it with the real schema in Section 15 so it can be wired to a database later.
- [ ] **Sell / Trade-in**: 3-step form (basics → car → photos/contact), full brand list incl. Tata/Mahindra/Toyota, years to 2026, indicative price range (mock logic), success state.
- [ ] **Finance** page with calculator; **About/Contact** with map placeholder.
- [ ] Correct EMI formula: `EMI = P·r·(1+r)^n / ((1+r)^n − 1)`, `r = annualRate/12/100`. Show assumptions.
- [ ] SEO basics: unique titles/meta, JSON-LD for AutoDealer + Vehicle, sitemap.

### Phase 2 — Pitch assets
- [ ] One-page **audit report** (PDF/HTML) with before/after screenshots of: leaked brief copy, brand-dropdown gap, EMI mismatch, dead links, meta description = "Elitecarz".
- [ ] Lighthouse mobile scores of current site (to run locally; not captured yet).
- [ ] 6–8 slide pitch deck: problems → demo → outcomes → scope → timeline → price options.
- [ ] Short screen-recorded walkthrough of the demo (optional).

### Phase 3 — If hired
- [ ] Connect to real inventory (Shopify Storefront API or CMS), real Google Reviews (Places API or curated), WhatsApp Business API / click-to-chat, payment gateway (Razorpay) for refundable token, lender integrations for pre-approval, GA4 + Search Console, redirects from old URLs (`/products/...` → `/cars/...`), staff training.

## 13. Open Questions to Resolve
1. Pitch to whom / how: owner in person, WhatsApp, email? Budget range I should aim for?
2. Do they use Shopify admin daily (keep it) or would a simpler CMS suit them?
3. Real EMI rate/tenure and lender partners to display?
4. Real inspection checklist (the "150+ points") and warranty terms (months/km, who underwrites)?
5. Is the token amount for "Book Now 100% Refundable" fixed? Refund policy wording?
6. Can I get permission to use their photos/logo in the demo (pitch is private; confirm)?
7. Is Kirat (and others) OK to be featured on a Team page?
8. Hindi copy needed?

## 14. Constraints / Notes for Claude Code
- Do **not** present demo placeholders (inspection results, ratings, rates) as real; label them `DEMO`.
- Use their real inventory and names only for the private pitch.
- Don't invent customer testimonials. Use paraphrased real Google review themes or leave placeholders; real names/quotes need consent.
- Indian formatting: `₹14,75,000`, lakh notation ("₹14.75 L"), +91 phone format, Indian English.
- Verified facts only from Sections 2–3; everything else is a proposal.

---
---

# PART B — FULL PROFESSIONAL SITE + ADMIN PANEL SPEC (v2 additions)

> Everything in Part B is a **proposal** for the new build (not facts about the current site). Items marked **[OPTIONAL/PAID]** need third-party services or fees; confirm with the owner before promising them in the pitch.

## 15. Architecture & Stack (decision)

### 15.1 Recommended: custom build with owned admin panel
| Layer | Choice | Why |
|---|---|---|
| Front end | **Next.js (App Router) + TypeScript + Tailwind** | SSR/ISR for SEO, fast, one codebase for site + admin |
| Database | **PostgreSQL** (Supabase or Neon) | Relational fit for cars/leads/users; free tier OK to start |
| ORM | **Prisma** or Drizzle | Typed schema, migrations |
| Auth | **Supabase Auth** or **Auth.js (NextAuth)** with email+password, optional Google login | Role-based access for admin |
| File storage / images | **Supabase Storage** or **Cloudinary** (auto WebP/AVIF, resizing, watermark) | Fast image delivery; staff upload from phone |
| Hosting | **Vercel** (site) + managed Postgres | Simple deploys, previews, CDN |
| Email | **Resend** / SendGrid / Brevo | Lead notifications, receipts |
| WhatsApp | **click-to-chat links** (free) now; **WhatsApp Cloud API** later **[OPTIONAL/PAID]** | Instant staff alerts, follow-ups |
| Payments (token) | **Razorpay** (UPI/cards) **[OPTIONAL]** | Refundable booking amount |
| Search | Postgres full-text first; Meilisearch/Algolia later | Instant filter/search |
| Analytics | GA4 + Search Console + Microsoft Clarity (heatmaps) | Funnel + SEO tracking |
| Monitoring | Sentry + UptimeRobot/Better Stack | Errors + downtime alerts |
| Forms anti-spam | Cloudflare Turnstile / hCaptcha + rate limiting | Prevent junk leads |

### 15.2 Alternative: keep Shopify (lower-risk pitch)
Keep Shopify as the inventory/admin (they already use it), build a **custom theme or headless front end** on the Storefront API. Add a small custom app/metafields for inspection reports and car specs. Trade-off: Shopify admin is retail-oriented (SKUs, carts) and awkward for used cars with unique specs; the owner keeps a familiar tool though. **Present both options in the pitch and let the owner choose.**

### 15.3 Database schema (PostgreSQL — starting point)

```sql
-- USERS & ROLES
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text unique not null, phone text,
  role text not null check (role in ('owner','manager','sales','viewer')),
  is_active boolean default true,
  last_login_at timestamptz, created_at timestamptz default now()
);

-- MASTER DATA (for autocomplete + clean data)
create table makes (id serial primary key, name text unique not null, logo_url text);
create table models (id serial primary key, make_id int references makes(id), name text not null, body_type text, unique(make_id,name));
create table variants (id serial primary key, model_id int references models(id), name text not null, fuel text, transmission text, engine text, unique(model_id,name));

-- CARS
create table cars (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  stock_no text unique,                         -- internal ID e.g. EC-0042
  status text not null default 'draft' check (status in ('draft','published','reserved','sold','archived')),
  make_id int references makes(id), model_id int references models(id), variant_id int references variants(id),
  title text not null,                           -- auto-generated, editable: "2023 MG Hector Plus Sharp Pro CVT"
  year int not null, registration_year int,
  fuel text not null, transmission text not null, body_type text,
  km_driven int, owners int, color text, seats int,
  rto text, reg_number_masked text,              -- show "DL 3C ••12" publicly, full number admin-only
  insurance_type text, insurance_valid_till date,
  price_inr bigint not null, tcs_applicable boolean default true,
  mrp_note text, negotiable boolean default false,
  warranty_included boolean default false, warranty_months int, warranty_km int, warranty_note text,
  engine_cc int, power_bhp numeric, mileage_kmpl numeric,
  description text, highlights text[], features text[], disclosures text[],   -- disclosures = honest issues
  video_url text, view_360_url text,
  featured boolean default false, badge text,    -- 'New arrival','Price drop','Certified'
  hero_image_id uuid,
  purchase_price_inr bigint, refurb_cost_inr bigint,       -- ADMIN ONLY (never exposed publicly)
  source text, notes_internal text,
  published_at timestamptz, sold_at timestamptz, sold_price_inr bigint,
  created_by uuid references users(id), updated_by uuid references users(id),
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz                          -- SOFT DELETE
);
create index on cars(status, price_inr);
create index on cars(make_id, model_id);

create table car_images (
  id uuid primary key default gen_random_uuid(),
  car_id uuid references cars(id) on delete cascade,
  url text not null, thumb_url text, alt text, category text,  -- exterior/interior/engine/tyres/docs/defects
  sort_order int default 0, is_hero boolean default false
);

create table car_documents (            -- admin uploads; public sees only "verified" badges unless flagged public
  id uuid primary key default gen_random_uuid(),
  car_id uuid references cars(id) on delete cascade,
  type text check (type in ('rc','insurance','service_history','pollution','challan_check','loan_noc','inspection_pdf','other')),
  file_url text, verified boolean default false, is_public boolean default false
);

create table inspections (
  id uuid primary key default gen_random_uuid(),
  car_id uuid references cars(id) on delete cascade,
  inspected_by text, inspected_on date, overall_score numeric, summary text, report_pdf_url text
);
create table inspection_items (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid references inspections(id) on delete cascade,
  section text, item text, result text check (result in ('pass','minor','fail','na')), note text, photo_url text
);

create table price_history (id bigserial primary key, car_id uuid references cars(id), old_price bigint, new_price bigint, changed_by uuid references users(id), changed_at timestamptz default now());

-- LEADS / CRM
create table leads (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('enquiry','call_back','test_drive','reserve','finance','sell_car','contact','whatsapp_click','newsletter')),
  status text default 'new' check (status in ('new','contacted','visit_scheduled','negotiating','won','lost','spam')),
  name text, phone text, whatsapp text, email text, city text,
  car_id uuid references cars(id),                 -- car of interest
  payload jsonb,                                   -- type-specific (e.g. sell-car details, preferred slot, budget)
  source text, utm jsonb, page_url text,
  assigned_to uuid references users(id),
  next_followup_at timestamptz, lost_reason text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table lead_notes (id bigserial primary key, lead_id uuid references leads(id) on delete cascade, user_id uuid references users(id), note text, created_at timestamptz default now());

create table sell_requests (                      -- trade-in valuation submissions
  id uuid primary key default gen_random_uuid(), lead_id uuid references leads(id),
  reg_number text, make text, model text, variant text, mfg_year int, reg_year int, owners int,
  km_range text, fuel text, transmission text, state text, expected_price bigint,
  photos text[], offered_min bigint, offered_max bigint, inspection_slot timestamptz, outcome text
);

create table bookings (                           -- test drives + reservations
  id uuid primary key default gen_random_uuid(), lead_id uuid references leads(id), car_id uuid references cars(id),
  kind text check (kind in ('test_drive','reservation')), slot timestamptz,
  token_amount bigint, payment_status text, payment_ref text, refund_status text, status text default 'pending'
);

-- CONTENT
create table reviews (id uuid primary key default gen_random_uuid(), author text, rating int, body text, source text default 'google', car_label text, photo_url text, is_featured boolean default false, is_published boolean default true, reviewed_on date);
create table faqs (id serial primary key, question text, answer text, category text, sort_order int, is_published boolean default true);
create table posts (id uuid primary key default gen_random_uuid(), slug text unique, title text, excerpt text, body_md text, cover_url text, status text default 'draft', seo_title text, seo_description text, published_at timestamptz);
create table team_members (id serial primary key, name text, role text, photo_url text, bio text, phone text, sort_order int);
create table banners (id serial primary key, title text, subtitle text, image_url text, cta_label text, cta_url text, starts_on date, ends_on date, is_active boolean default true, sort_order int);
create table pages (id serial primary key, slug text unique, title text, body_md text, seo_title text, seo_description text);  -- privacy, terms, refund, warranty, etc.
create table lenders (id serial primary key, name text, logo_url text, min_rate numeric, max_rate numeric, max_tenure_months int, is_active boolean default true);
create table redirects (id serial primary key, from_path text unique, to_path text, code int default 301); -- old Shopify URLs

-- SETTINGS & AUDIT
create table settings (key text primary key, value jsonb);  -- business hours, phone, whatsapp, address, map link, default EMI rate/tenure, TCS %, token amount, social links, GA id, etc.
create table audit_log (id bigserial primary key, user_id uuid references users(id), action text, entity text, entity_id text, diff jsonb, ip inet, created_at timestamptz default now());
```

**Public vs private rule:** `purchase_price_inr`, `refurb_cost_inr`, `notes_internal`, full registration number, documents (unless `is_public`) and all lead data are **never** returned by public APIs. Enforce with row-level security / separate server-only queries.

---

## 16. ADMIN PANEL — Full Specification

URL: `/admin` (separate layout, `noindex`, not linked from the public site). Mobile-friendly: staff will add cars from a phone on the lot.

### 16.1 Roles & permissions
| Capability | Owner | Manager | Sales | Viewer |
|---|---|---|---|---|
| View dashboard / analytics | ✅ | ✅ | limited (own leads) | ✅ |
| Add / edit cars | ✅ | ✅ | ✅ (draft only, optional) | ❌ |
| Publish / unpublish / mark sold | ✅ | ✅ | ❌ (request) | ❌ |
| Delete / restore cars | ✅ | ✅ (soft) | ❌ | ❌ |
| See purchase price & margin | ✅ | ✅ | ❌ | ❌ |
| Leads: view/assign/edit | ✅ | ✅ | own/assigned | ❌ |
| Content (reviews, FAQ, blog, banners) | ✅ | ✅ | ❌ | ❌ |
| Settings, users, audit log, export | ✅ | ❌ | ❌ | ❌ |

### 16.2 Authentication & security
- Email + password (min 12 chars) with **forgot/reset password**; optional **2FA (TOTP)** for Owner/Manager; session timeout (e.g. 8h idle 30 min); login attempt rate-limit + lockout; **Cloudflare Turnstile** on login.
- Invite-based user creation (Owner invites staff by email); deactivate user instantly.
- All admin routes server-protected (middleware + per-action permission checks); CSRF protection; strict input validation (Zod); upload type/size validation; security headers (CSP, HSTS, X-Frame-Options).
- **Audit log:** every create/update/delete/publish/price change/login recorded with user, time, diff (viewable by Owner).

### 16.3 Dashboard (`/admin`)
- KPI cards: **Cars in stock**, Published, Reserved, Sold this month, **New leads today / this week**, **Pending follow-ups**, Avg days-in-stock.
- Charts: leads by day & source (website / WhatsApp / call / Google), top-viewed cars, enquiries per car, sold per month.
- Alerts: cars **> 45/60/90 days in stock**, **insurance expiring soon**, drafts missing photos, leads untouched > 24 h.
- Quick actions: **+ Add car**, + Add lead (walk-in/phone), Export.

### 16.4 Inventory management (`/admin/cars`)
**List view**
- Table + card toggle; columns: photo, stock no., title, year, fuel/trans, km, price, status, days in stock, views, enquiries, last updated.
- Search (title / stock no. / reg no.), filters (status, make, fuel, price range, year, featured, missing-photos), sort, pagination.
- **Bulk actions:** publish, unpublish, mark reserved/sold, feature, change badge, archive, **delete (soft)**, export CSV.
- **Inline quick edit:** price, status, featured toggle directly in the table.
- Status chips: Draft · Published · Reserved · Sold · Archived · **Trash** (soft-deleted, restorable for 30 days; Owner can permanently purge).

**Add / Edit car form** (sections, with autosave draft + validation + "Save draft" / "Publish")
1. **Basics:** Make → Model → Variant (cascading autocomplete from master data; "Add new" fallback), year, registration year, fuel, transmission, body type, colour, seats.
2. **Usage & registration:** KM driven, owners, RTO/state, registration number (stored full; public shows masked), insurance type + valid-till (date picker), PUC validity.
3. **Pricing:** Price (₹), TCS applies toggle (auto-calc total on-road), badge (New arrival / Price drop / Certified), featured; **internal-only**: purchase price, refurb cost, expected margin (hidden from Sales role).
4. **Warranty:** included? months / km / provider / notes.
5. **Photos & media:** **drag-and-drop multi-upload** (also camera capture on mobile), auto-compress to WebP, **drag to reorder**, pick hero, per-photo category + alt text, delete/replace photo, optional **auto-watermark/blur number plate** **[OPTIONAL]**; video URL (YouTube/Drive), 360° URL.
6. **Highlights / Features / Disclosures:** tag-style inputs with **feature presets** (sunroof, ADAS, 360 cam, ventilated seats, etc.); "Known issues disclosed" list (builds trust).
7. **Inspection report:** template of sections (Exterior, Interior, Engine, Transmission, Suspension & brakes, Tyres, Electricals, AC, Safety, Documents) × items with Pass/Minor/Fail/NA + note + photo; auto-calculated score; attach PDF.
8. **Documents:** upload RC, insurance, service history, challan check, loan NOC; mark verified; choose which are public.
9. **SEO:** auto-generated slug/title/meta (editable), social image preview.
10. **Description:** rich text with **AI-assist button [OPTIONAL]** to draft from specs (human must review).
- **Duplicate car** (copy specs for similar stock), **Preview as public page**, **Share link**, **Print spec sheet / PDF**, activity history tab (price changes + audit entries).
- **Quick-add mode:** minimal 8-field mobile form (make/model/variant, year, km, owner, price, photos) → saves as Draft → finish later.
- **[OPTIONAL/PAID]** Registration-number lookup API to prefill make/model/RTO/owner count/insurance.

**Delete behaviour (explicit requirement):** "Delete" = **soft delete** into Trash with confirmation dialog + **Undo toast**; restore from Trash; permanent delete only by Owner. Deleting a car **auto-creates a 301 redirect** (to its brand/category page) so SEO isn't broken. Marking **Sold** keeps the page live for a while as "Sold" (social proof) then auto-archives.

### 16.5 Leads & mini-CRM (`/admin/leads`)
- Unified inbox for: car enquiries, call-back requests, test-drive bookings, reservations, finance requests, **sell-a-car submissions**, contact form, newsletter sign-ups, WhatsApp-click events.
- Kanban pipeline (New → Contacted → Visit scheduled → Negotiating → Won / Lost / Spam) + list view; filters by type, source, car, assignee, date.
- Lead detail: contact info, car of interest (linked), UTM/source, page visited, timeline, **notes**, next follow-up date (reminders), **one-click WhatsApp / Call**, status change, assign to staff, mark lost with reason.
- **Instant notifications** to staff on new lead: email now; WhatsApp/Telegram alert later; daily digest email.
- Sell-a-car view: photos, submitted details, **valuation range tool** (min/max), "Schedule inspection" → creates booking; outcome (bought / declined).
- Duplicate-phone detection, spam flag, export CSV.
- Walk-in/phone lead manual entry.

### 16.6 Bookings (`/admin/bookings`)
Test-drive slots & reservations: calendar view, confirm/reschedule/cancel, send confirmation (email/WhatsApp link), token payment status & refund tracking (when payments enabled), no-show flag. Settings control slot length, days/hours, buffer, holidays (e.g. Gandhi Jayanti).

### 16.7 Content management
- **Banners/hero** (schedule start/end), **Featured collections** (e.g. "Under ₹10 L", "Automatic SUVs", editable rules).
- **Reviews:** add/import Google reviews (manual paste or Places API **[OPTIONAL]**), feature/hide, add customer photo (with consent). **Never fabricate reviews.**
- **Delivered customers gallery** (photo + car + consent flag).
- **FAQs** (categorised, reorder), **Blog/Guides** (markdown/rich text, SEO fields, schedule), **Team** profiles, **Static pages** (privacy, terms, booking/refund policy, warranty, how it works, about) with edit + version history.
- **Lenders/finance partners** (logos, rates, tenures) feeding the EMI tool.
- **Redirects manager** (old Shopify URLs → new).

### 16.8 Settings (Owner)
Business profile (name, address, phones, WhatsApp number, email, Google Maps link, hours per weekday + holiday overrides), default EMI rate & tenure options, TCS %, token amount & refund policy text, lead notification recipients, social links, tracking IDs (GA4, Meta Pixel, Clarity), SEO defaults, maintenance mode toggle, **data export (full CSV/JSON backup)**, user management, audit log viewer.

### 16.9 Reports (export CSV/PDF)
Inventory ageing, stock valuation (purchase vs listed — Owner only), sales by month/brand, lead source performance, conversion funnel (enquiry → visit → sale), staff performance, sell-a-car pipeline.

### 16.10 Admin API routes (server actions or REST)
`POST /api/auth/login|logout|reset`; `GET/POST /api/admin/cars`; `GET/PATCH/DELETE /api/admin/cars/:id`; `POST /api/admin/cars/:id/restore|duplicate|publish|unpublish|mark-sold`; `POST /api/admin/cars/:id/images` (signed upload), `PATCH …/images/reorder`; `GET/PATCH /api/admin/leads`; `POST /api/leads` (public, rate-limited + captcha); `GET/POST /api/admin/bookings`; CRUD for reviews/faqs/posts/banners/pages/team/lenders/redirects/settings/users; `GET /api/admin/audit`; `GET /api/admin/export/:entity`.
Public read APIs/pages: cars list + detail (published only, sanitized fields), reviews, faqs, settings (public subset), sitemap.

---

## 17. Public Site — Complete Professional Checklist

### 17.1 Pages & templates
Home · Inventory (+ SEO landing templates: by brand, body type, budget, fuel, city/locality) · Car detail · Sold-car (archive) page · Compare · Shortlist/Wishlist · Sell/Trade-in · Finance · Insurance/Extended warranty info · Warranty & Inspection · How it works · About + Team · Showroom/Contact (map, directions, hours) · Reviews · Blog index + post · FAQ · Privacy · Terms · Refund/Booking policy · Cookie policy · 404 · 500 · Maintenance · Thank-you pages (for conversion tracking).

### 17.2 Home page sections (order)
1. Sticky header (logo, Buy, Sell, Finance, Warranty, Reviews, About, Contact; WhatsApp + Call buttons; search)
2. Hero with **car finder** (budget / body type / brand / transmission) + trust line
3. Trust strip: 150+ checks · fixed price · RC transfer included · warranty · ★ Google rating (live count)
4. Rails: Just arrived · Under ₹10 L · Automatic SUVs · Premium picks · Recently sold
5. Shop by body type + by brand
6. **How buying works** (4 steps)
7. Why EliteCarz (inspection report sample, documents, no-pressure promise) — with proof, not slogans
8. Sell / trade-in CTA with mini form (reg no + phone)
9. Finance block with quick EMI
10. Real reviews + delivered-customer photos
11. Team/Showroom with embedded map
12. FAQ (top 6) · Blog highlights · Newsletter/WhatsApp subscribe
13. Footer: full links, address, hours, socials, policies, copyright; sticky mobile bar (WhatsApp / Call / Reserve)

### 17.3 Car detail page — must-haves
Gallery (zoom, swipe, categories, fullscreen, video, 360) · title + key specs row · **price box** (price, TCS, on-road total, fixed-price badge, price-drop badge) · **CTA group**: WhatsApp (pre-filled), Call, Book test drive, **Reserve (refundable)**, Get best finance · EMI calculator (rate/tenure/down payment sliders; lender estimates; "indicative" disclaimer) · specs table · features · highlights · **honest disclosures** · inspection report (expandable by section with photos) · documents status badges · service history · warranty details · RTO/insurance info · **trade-in "get value for your car"** · share (WhatsApp, copy link) · **print/PDF spec sheet** · similar cars (same segment/price band) · recently viewed · "Notify me of price drops" · breadcrumbs · structured data.

### 17.4 Inventory page — must-haves
Filters (budget slider, brand/model, body type, fuel, transmission, year range, KM range, owners, RTO state, colour, features) · sort · grid/list toggle · instant results, URL-synced filters (shareable) · active-filter chips · save search / alert **[OPTIONAL]** · compare (up to 3) · shortlist heart · skeleton loading · empty-state with "tell us what you want" lead form · pagination or infinite scroll with SEO-safe URLs.

### 17.5 Forms (all with validation, Turnstile/hCaptcha, consent checkbox, success state, GA4 event)
Enquiry · Call-back (incl. after-hours: "we'll call at 11 am") · Test-drive (date/time slot) · Reserve car · Finance eligibility · Sell-a-car (stepwise, mobile-first, photo upload, instant range) · Contact · Newsletter. Phone validation for India (+91, 10 digits). Auto-reply email/WhatsApp link. Staff notification.

### 17.6 Trust & credibility
Live Google rating + review count with link to the Google profile · real review cards with consent · team page (names, photos, roles, e.g. Kirat) · showroom photos/video · delivered customers gallery · sample inspection report · transparent price breakup · clear refund/booking policy · warranty terms in plain language · business registration/GST details in footer **(confirm with owner)** · no fake urgency/countdowns · every claim backed on-page.

### 17.7 SEO (technical + content)
- Unique `<title>`/meta description/OG image per page (car pages auto-generate OG image with price).
- JSON-LD: `AutoDealer`/`LocalBusiness` (with hours, geo, sameAs), `Vehicle`/`Car` + `Offer` per listing, `AggregateRating` + `Review` (only real), `FAQPage`, `BreadcrumbList`, `Organization`, `WebSite` (sitelinks search).
- XML sitemap (cars, categories, posts), robots.txt, canonical URLs, clean slugs `/cars/2023-mg-hector-plus-sharp-pro-cvt-delhi`, hreflang if Hindi added, pagination handling, 301 map from old Shopify `/products/*` and `/collections/*`.
- Local SEO: Naraina/West Delhi pages, Google Business Profile sync (post new arrivals), NAP consistency, embedded map, "used cars near me" intent pages, review-request flow after delivery.
- Content: 10–20 launch guides (e.g. "How to check a used car before buying in Delhi", "RC transfer process in Delhi", "Used car loan: documents & rates", "Petrol vs diesel in Delhi NCR given regulations" — verify rules before publishing).
- Image SEO: descriptive file names/alt text, WebP/AVIF, lazy-load below the fold.

### 17.8 Performance targets (mobile, 4G)
LCP < 2.5 s · INP < 200 ms · CLS < 0.1 · Lighthouse ≥ 90 (Performance/SEO/Best Practices/Accessibility) · image CDN with responsive `srcset` · font subsetting + `font-display: swap` · code-split · cache/ISR for inventory · no layout shift on gallery · total JS budget on car page < ~200 KB gz where practical.

### 17.9 Accessibility
WCAG 2.1 AA: semantic HTML, keyboard navigation + visible focus, alt text, colour contrast ≥ 4.5:1, form labels/errors announced, reduced-motion respect, gallery operable by keyboard, skip-to-content link.

### 17.10 Analytics & marketing
GA4 events (view_item, filter_use, whatsapp_click, call_click, form_start/submit per form, reserve_start/complete, emi_calculated, compare_add, shortlist_add, sell_step_n) · Search Console · Meta Pixel/Conversions API and Google Ads tag **[OPTIONAL]** · UTM capture saved into leads · Clarity heatmaps · call-tracking number **[OPTIONAL]** · dashboards for the owner (admin 16.3) · consent banner gating non-essential trackers.

### 17.11 Legal & compliance (India) — *confirm with a lawyer / the owner*
- **Digital Personal Data Protection Act, 2023:** clear consent on forms, privacy notice (what data, why, retention, contact for grievance), data deletion on request, don't collect more than needed, secure storage of leads & uploaded documents.
- Cookie/consent banner (essential vs analytics/marketing).
- Terms of use, **booking/refund policy** (refundable token: conditions and timelines), warranty terms (provider, coverage, exclusions), price disclosure (TCS, RC transfer scope) in plain language.
- Accuracy duty: do not claim "100% accident-free", "certified" or "150+ checks" unless the inspection record exists; do not show unverified history reports.
- Display business legal name, GST number, address (if applicable) in footer; grievance/contact officer info.
- Review policy: only genuine reviews, with attribution; get consent for customer photos.
- Remove irrelevant "Shipping policy"; replace with Delivery & Handover policy.

### 17.12 Security (public)
HTTPS everywhere + HSTS · security headers/CSP · rate limiting on forms/APIs · bot protection · input sanitisation/escaping · no sensitive fields in public JSON · image hotlink/size limits · dependency scanning (Dependabot) · secrets in env vars only · regular DB backups (daily, 30-day retention) with a tested restore · least-privilege DB roles.

### 17.13 Extra "professional" features
PWA (installable, offline-friendly shortlist) · Hindi/English toggle · dark/light follows brand (default dark premium) · WhatsApp share of any car · QR code on showroom cars linking to the live listing · price-drop & new-arrival alerts via WhatsApp/email **[OPTIONAL]** · live chat/WhatsApp widget · EMI pre-approval request · insurance quote request **[OPTIONAL]** · buy-back / exchange offer messaging (only if the owner offers it) · home delivery across NCR info + delivery tracker status updates · virtual showroom video call booking · 404 page with search + popular cars · print-friendly pages · social proof feed (Instagram reels / YouTube walkarounds embed) · auto-generated Instagram/WhatsApp share cards for each new car (image with price & key specs).

---

## 18. Non-Functional Requirements
- **Environments:** local · staging (password-protected, noindex) · production. Preview deployments per branch.
- **CI/CD:** GitHub Actions: typecheck, lint, unit tests, Playwright e2e on key flows (filter → car → enquiry; admin add car → publish → appears on site; delete → trash → restore), Lighthouse CI budget.
- **Testing:** unit (EMI math, price/TCS, slug generation), integration (API + RLS), e2e (above), accessibility (axe), cross-browser (Chrome, Safari iOS, Samsung Internet).
- **Observability:** Sentry (front + back), uptime monitor, DB slow-query alerts.
- **Backups & recovery:** daily automated DB backups + image storage versioning; documented restore steps; RPO ≤ 24 h.
- **Scalability:** designed for 50–500 cars and thousands of monthly visitors; ISR/CDN caching; indexes on filter columns.
- **Docs:** README (setup), `.env.example`, admin user guide (with screenshots / short videos), handover checklist.

## 19. Content & Assets to Collect from the Owner
Logo (SVG/PNG, high-res) · brand colours · showroom photos/video · team photos + names/roles · business legal name, GST, address proof wording · real inspection checklist (the actual 150+ points) and a sample report · warranty terms (provider, months/km, exclusions) · refundable token amount + refund terms · lender partners & indicative rates · RTO/RC-transfer process they follow · delivery areas & charges · best photos/walkarounds for each car (or a photo standard guide) · Google Business Profile access (for review/post sync) · WhatsApp Business number · social handles · current Shopify data export (products CSV, customers, orders) for migration · any existing domain/DNS/email access · preferred languages · who will update inventory daily.

## 20. Migration Plan (Shopify → new site, if chosen)
1. Export products (CSV/API) → map to `cars` (title, price, images, variants → fuel/trans). 2. Import images to storage with renamed files + alt text. 3. Generate slugs; build **redirect map** from every old `/products/*`, `/collections/*`, `/pages/*` URL. 4. Staging QA vs old site. 5. Switch DNS during low-traffic hours; keep Shopify read-only 2–4 weeks as fallback. 6. Submit new sitemap in Search Console; monitor 404s and rankings. 7. Update Google Business Profile website link.

## 21. Package Options for the Pitch (fill prices after discussion)
| | **Starter** | **Professional (recommended)** | **Premium** |
|---|---|---|---|
| Design | Custom homepage + templates | Full custom design system | + Brand refresh, photo/video direction |
| Public site | Inventory, car page, sell form, contact | + Finance, warranty, reviews, blog, comparison, shortlist | + Hindi, PWA, alerts, advanced search |
| **Admin panel** | Add/edit/delete cars, photo upload, leads list | + Roles, inspection builder, leads CRM, bookings, content mgmt, reports, audit log | + WhatsApp API alerts, payment token (Razorpay), reg-number lookup, multi-location |
| SEO | Meta + sitemap + schema | + Local SEO pages, redirects, 10 guides | + Ongoing content & GBP posting |
| Training/support | 1 session + guide | Training + 30 days support | Retainer (monthly) |
| Price (₹) | ___ | ___ | ___ |
| Timeline | ___ wks | ___ wks | ___ wks |

Ongoing costs to disclose: domain, hosting, database, image CDN, email/WhatsApp API usage, payment gateway fees, any paid APIs. Offer an optional monthly maintenance plan.

## 22. Updated Roadmap (supersedes Section 12 ordering where different)

**Phase 0 — Foundations (day 1):** scaffold Next.js/TS/Tailwind, ESLint/Prettier, Prisma + Postgres (local Docker or Supabase), env setup, seed master data (makes/models/variants for the brands in stock), seed `cars` from Section 3.4 (flag DEMO fields), design tokens, layout shells (public + admin).

**Phase 1 — Public demo MVP:** Home, Inventory with filters/sort/compare/shortlist, Car detail (Hector fully built incl. EMI engine, price box, inspection UI, WhatsApp CTA, reserve/test-drive modals writing to `leads`/`bookings`), Sell flow (3 steps, correct brand/year lists), Finance, Contact, About/Reviews placeholders, SEO + JSON-LD, mobile sticky bar.

**Phase 2 — Admin MVP (key pitch differentiator):** auth + roles, dashboard, **cars list + Add/Edit form + image upload/reorder + status workflow + soft delete/restore + duplicate**, leads inbox with statuses/notes/assign, notifications (email), settings. Public pages read live from DB — **"add a car in admin → it appears on the site instantly"** is the demo moment to rehearse.

**Phase 3 — Professional completeness:** inspection report builder, documents, bookings calendar, content management (reviews/FAQ/blog/banners/team/pages/redirects), reports/exports, audit log viewer, 2FA, Hindi toggle, PWA, analytics + consent, accessibility + performance pass.

**Phase 4 — Integrations & launch:** payments (Razorpay token), WhatsApp Cloud API alerts, Google reviews sync, reg-number lookup API, migration + redirects, staging QA, training, launch checklist (DNS, SSL, Search Console, GA4, sitemap, GBP link), 30-day hypercare.

## 23. Definition of Done / Acceptance Checklist
- [ ] Staff can **add a car from a phone in < 3 minutes** (quick-add) and publish it; it appears on the site < 1 min later.
- [ ] Staff can **edit price/status** inline, **delete** to Trash with undo, **restore**, and Owner can purge; redirects auto-created.
- [ ] Sales role cannot see purchase price/margin; Viewer cannot edit; all actions in audit log.
- [ ] Every public form creates a lead, notifies staff, passes spam checks, fires GA4 event.
- [ ] No private field (purchase price, full reg no., internal notes, unpublished cars, leads) is retrievable from public endpoints (tested).
- [ ] EMI math verified against a reference calculator; assumptions displayed.
- [ ] Lighthouse mobile ≥ 90 on Home, Inventory, Car page; Core Web Vitals within targets.
- [ ] Axe accessibility scan: 0 critical issues; keyboard-only flow works.
- [ ] Unique title/meta/OG on all pages; valid JSON-LD (Rich Results test); sitemap & robots correct; old URLs redirect.
- [ ] Privacy/Terms/Refund/Cookie pages live and linked; consent banner functional; no dead links (link checker).
- [ ] Sell form includes Tata, Mahindra, Toyota (and all brands in stock) and years through current year.
- [ ] Backups configured and a restore test performed; Sentry and uptime alerts active.
- [ ] Admin guide + training session delivered; `.env.example` and README complete.

## 24. Risks & Notes
- Claims (150+ checks, warranty, history reports, certified) must match real records — otherwise remove them (legal + trust risk).
- Token/payment flows and refund promises need clear policy wording agreed with the owner.
- Third-party APIs (reg lookup, WhatsApp, Places) add running costs and approvals; treat as Phase 4 add-ons.
- Staff adoption is the main failure mode for admin panels: keep forms short, mobile-first, with quick-add and good defaults.
- Reusing EliteCarz images/logo in the demo is for a private pitch only.

## 25. Kickoff prompt (as executed)

1. Scaffold Next.js (App Router) + TypeScript + Tailwind + Prisma + PostgreSQL (SQLite locally if Postgres isn't available; keep schema portable). `.env.example`, README, folders: app/(public), app/admin, lib, prisma, components, data.
2. Prisma schema from 15.3; seed with the cars from 3.4. Mark invented fields DEMO.
3. Public site: Home, Inventory (filters/sort/compare/shortlist, URL-synced), Car detail, Sell/Trade-in (3-step; Tata/Mahindra/Toyota; years through 2026), Finance (correct EMI + assumptions), Contact/About, Reviews. Mobile-first, black/white/red, sticky WhatsApp/Call bar. WhatsApp number is a setting.
4. Admin per Section 16: auth + roles, dashboard, cars list (search/filter/bulk/inline edit), Add/Edit with upload + reorder + hero + quick-add, status workflow, soft delete + Undo + Trash + restore + auto 301, duplicate, leads kanban + notes + assign + follow-ups, settings, audit log. Public pages read from DB.
5. SEO (meta, JSON-LD, sitemap, robots), analytics hooks, consent banner, security headers, rate limiting + Turnstile placeholder; test that private fields never leak.
6. Tests: EMI, price+TCS, slugs, permissions; Playwright e2e for filter → car → enquiry; admin add → publish → visible; delete → trash → restore.
7. Lighthouse + axe; REPORT.md (screenshots list, how to run, demo script, mock vs real).

Constraints: no fabricated testimonials; label placeholders DEMO; Indian formatting (₹14,75,000 / ₹14.75 L); plain-spoken copy; don't publish or deploy publicly without asking.
