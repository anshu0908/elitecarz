// Screenshot helper for design review: node scripts/shot.mjs <path> <out.png> [mobile] [fullPage]
import { chromium, devices } from "@playwright/test";
const [, , path = "/", out = "shot.png", mode = "desktop", full = "full"] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext(mode === "mobile" ? { ...devices["Pixel 7"] } : { viewport: { width: 1366, height: 860 } });
await ctx.addInitScript(() => { try { localStorage.setItem("ec_consent", "essential"); } catch {} });
const page = await ctx.newPage();
await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: full === "full" });
await browser.close();
