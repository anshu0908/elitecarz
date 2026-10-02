// One-off: snapshot the public elitecarz.in Shopify inventory into data/source-cars.json.
// Reads the public products.json feed plus each product page's "Car Detail" block.
// Used only to seed the private pitch demo. Run: node scripts/scrape-elitecarz.mjs
import { writeFileSync } from "node:fs";

const BASE = "https://elitecarz.in";
const UA = { "user-agent": "Mozilla/5.0 (EliteCarz pitch demo snapshot)" };

const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#8377;/g, "₹")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

const FIELDS = ["Make Year", "Registration Year", "Ownership", "Fuel", "Driven", "RTO", "Transmission", "Insurance", "Color"];

function parseDetail(t) {
  const start = t.indexOf("Car Detail Make Year");
  if (start < 0) return {};
  const end = t.indexOf("Special about this car", start);
  const block = t.slice(start + "Car Detail ".length, end > 0 ? end : start + 600);
  const out = {};
  FIELDS.forEach((f, i) => {
    const a = block.indexOf(f + " ");
    if (a < 0) return;
    const next = FIELDS.slice(i + 1).map((n) => block.indexOf(" " + n + " ", a)).filter((x) => x > 0);
    const b = next.length ? Math.min(...next) : block.length;
    out[f] = block.slice(a + f.length + 1, b).trim();
  });
  return out;
}

const feed = await (await fetch(`${BASE}/products.json?limit=250`, { headers: UA })).json();
const cars = [];
for (const p of feed.products) {
  const html = await (await fetch(`${BASE}/products/${p.handle}`, { headers: UA })).text();
  const t = text(html);
  cars.push({
    handle: p.handle,
    title: p.title,
    price: Number(p.variants[0].price),
    available: p.variants[0].available,
    createdAt: p.created_at,
    images: p.images.map((i) => i.src),
    detail: parseDetail(t),
  });
  console.log(p.handle, JSON.stringify(cars.at(-1).detail));
}
writeFileSync(new URL("../data/source-cars.json", import.meta.url), JSON.stringify({ fetchedAt: new Date().toISOString(), cars }, null, 2));
console.log(`saved ${cars.length} cars`);
