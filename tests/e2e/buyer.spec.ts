import { expect, test } from "@playwright/test";
import { acceptEssentialCookies } from "./helpers";

test.beforeEach(async ({ page }) => acceptEssentialCookies(page));

test("filter → car → enquiry", async ({ page, isMobile }) => {
  await page.goto("/cars");
  await expect(page.getByRole("heading", { name: "Used cars in Delhi" })).toBeVisible();

  // Apply the Automatic gearbox filter (sidebar on desktop, bottom sheet on phones).
  if (isMobile) await page.getByRole("button", { name: /^Filters/ }).click();
  const scope = isMobile ? page.getByRole("dialog") : page.getByRole("complementary", { name: "Filters" });
  await scope.getByRole("checkbox", { name: /^Automatic/ }).check();
  if (isMobile) await page.getByRole("button", { name: /^Show \d+ cars/ }).click();
  await expect(page).toHaveURL(/trans=Automatic/);
  await expect(page.getByRole("button", { name: "Remove filter Automatic" })).toBeVisible();

  // Manual-only cars disappear; the Hector (CVT) stays.
  await expect(page.getByRole("link", { name: "2022 Kia Seltos" })).toHaveCount(0);
  await page.getByRole("link", { name: "2023 MG Hector Plus" }).click();

  await expect(page.getByRole("heading", { level: 1, name: /MG Hector Plus Sharp Pro CVT/ })).toBeVisible();
  const priceBox = page.getByRole("complementary", { name: "Price and actions" });
  await expect(priceBox.getByText("₹14,75,000", { exact: true })).toBeVisible();
  await expect(priceBox.getByText("₹14,89,750")).toBeVisible(); // price + 1% TCS, matches the live listing

  await priceBox.getByRole("button", { name: "Ask a question instead" }).click();
  const dialog = page.getByRole("dialog", { name: "Ask about this car" });
  await dialog.getByRole("button", { name: "Send" }).click();
  await expect(dialog.getByText("Please enter your name")).toBeVisible(); // validation runs server-side too

  await dialog.getByLabel(/Your name/).fill("E2E Buyer");
  await dialog.getByLabel(/Mobile number/).fill("98111 22334");
  await dialog.getByLabel(/Your question/).fill("Is it available this weekend?");
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Send" }).click();
  await expect(dialog.getByText("Got it — thank you.")).toBeVisible();
});

test("old Shopify product URL redirects to the new car page", async ({ page }) => {
  await page.goto("/products/2023-mg-hector-plus-sharp-pro-cvt");
  await expect(page).toHaveURL(/\/cars\/2023-mg-hector-plus-sharp-pro-cvt-delhi$/);
});

test("sell form lists Tata, Mahindra and Toyota and years through the current year", async ({ page }) => {
  await page.goto("/sell-your-car");
  await page.getByRole("combobox", { name: /^Brand/ }).click();
  for (const b of ["Tata", "Mahindra", "Toyota"]) await expect(page.getByRole("option", { name: b, exact: true })).toHaveCount(1);
  await page.keyboard.press("Escape");
  await page.getByRole("combobox", { name: /^Manufacturing year/ }).click();
  await expect(page.getByRole("option", { name: String(new Date().getFullYear()), exact: true })).toHaveCount(1);
});

test("public pages never expose private car data", async ({ request }) => {
  for (const path of ["/", "/cars", "/cars/2023-mg-hector-plus-sharp-pro-cvt-delhi"]) {
    const html = await (await request.get(path)).text();
    for (const leak of ["purchasePriceInr", "refurbCostInr", "notesInternal", "\"regNumber\""]) expect(html, `${leak} on ${path}`).not.toContain(leak);
  }
});
