// Screenshot helper for design review:
//   node scripts/shot.mjs <path> <out.png> [desktop|mobile] [full|viewport] [loginEmail]
import { chromium, devices } from "@playwright/test";
const [, , path = "/", out = "shot.png", mode = "desktop", full = "full", login = ""] = process.argv;
const base = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext(mode === "mobile" ? { ...devices["Pixel 7"] } : { viewport: { width: 1366, height: 860 } });
await ctx.addInitScript(() => { try { localStorage.setItem("ec_consent", "essential"); } catch {} });
const page = await ctx.newPage();
if (login) {
  await page.goto(`${base}/admin/login`);
  await page.getByLabel("Email").fill(login);
  await page.getByLabel("Password").fill("EliteCarz@2026");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/admin(?!\/login)/);
}
await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: full === "full" });
await browser.close();
