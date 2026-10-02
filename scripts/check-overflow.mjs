// Lists elements wider than a phone viewport: node scripts/check-overflow.mjs /path [/path...]
import { chromium, devices } from "@playwright/test";
const b = await chromium.launch(); const ctx = await b.newContext({ ...devices["Pixel 7"] });
await ctx.addInitScript(() => localStorage.setItem("ec_consent", "essential"));
const p = await ctx.newPage();
for (const path of process.argv.slice(2)) {
  await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const rect = el.getBoundingClientRect();
      if (rect.right > vw + 1 && rect.width > 0) {
        // skip children of horizontally scrolling containers
        let p = el.parentElement, clipped = false;
        while (p) { const ov = getComputedStyle(p).overflowX; if (ov === "auto" || ov === "scroll" || ov === "hidden") { clipped = true; break; } p = p.parentElement; }
        if (!clipped) out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 80)} right=${Math.round(rect.right)} w=${Math.round(rect.width)}`);
      }
    }
    return { vw, sw: document.documentElement.scrollWidth, out: out.slice(0, 8) };
  });
  console.log(path, JSON.stringify(r, null, 1));
}
await b.close();
