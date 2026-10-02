import { expect, type Page } from "@playwright/test";

export const DEMO_PASSWORD = "EliteCarz@2026";

export async function acceptEssentialCookies(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("ec_consent", "essential");
    } catch {
      /* ignore */
    }
  });
}

export async function login(page: Page, email = "owner@elitecarz.demo") {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

/** A small real JPEG for upload tests. */
export async function jpeg(color = "#c8102e"): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  return sharp({ create: { width: 800, height: 600, channels: 3, background: color } }).jpeg().toBuffer();
}
