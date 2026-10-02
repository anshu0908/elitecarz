import { expect, test, type Page } from "@playwright/test";
import { acceptEssentialCookies, jpeg, login } from "./helpers";

test.describe.configure({ mode: "serial" });

const tag = `E2E${Date.now().toString().slice(-6)}`;
const variant = `Creative ${tag}`;
const title = `2022 Tata Nexon ${variant}`;
let carUrl = "";

test.beforeEach(async ({ page }) => acceptEssentialCookies(page));

async function openRowMenu(page: Page) {
  await page.goto("/admin/cars");
  await page.getByRole("searchbox", { name: "Search cars" }).fill(tag);
  await expect(page.getByRole("link", { name: title })).toBeVisible();
  await page.getByLabel(`Actions for ${title}`).click();
}

test("admin adds a car, publishes it, and it appears on the site", async ({ page }) => {
  await login(page);
  await page.goto("/admin/cars/new");
  await page.getByLabel("Make *").fill("Tata");
  await page.getByLabel("Model *").fill("Nexon");
  await page.getByLabel("Variant").fill(variant);
  await page.getByLabel("Manufacturing year *").fill("2022");
  await page.getByLabel("Kilometres driven").fill("21000");
  await page.getByLabel("Price (₹) *").fill("925000");

  // Publishing without photos is refused.
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Add at least one photo" })).toBeVisible();

  await page.locator('#photos input[type="file"]').setInputFiles([
    { name: "front.jpg", mimeType: "image/jpeg", buffer: await jpeg("#c8102e") },
    { name: "side.jpg", mimeType: "image/jpeg", buffer: await jpeg("#222222") },
  ]);
  await expect(page.getByRole("button", { name: "Delete photo 2" })).toBeVisible({ timeout: 20_000 });

  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Published — it's live on the website now")).toBeVisible({ timeout: 30_000 });
  await expect(page).toHaveURL(/\/admin\/cars\/[0-9a-f-]{36}$/);

  // Visible on the public site straight away.
  await page.goto(`/cars?q=${tag}`);
  const card = page.getByRole("link", { name: "2022 Tata Nexon" });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.getByText("₹9,25,000", { exact: true }).first()).toBeVisible();
  carUrl = new URL(page.url()).pathname;
});

test("delete → trash (link redirects) → restore", async ({ page }) => {
  test.skip(!carUrl, "depends on the previous test");
  await login(page);

  await openRowMenu(page);
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Move to Trash" }).click();
  await expect(page.getByText("1 car moved to Trash")).toBeVisible();
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();

  // Gone from the site; its URL now 301s to the brand page.
  const res = await page.request.get(carUrl, { maxRedirects: 0 });
  expect([301, 308]).toContain(res.status());
  expect(res.headers()["location"]).toContain("/used-cars/tata");

  await page.goto("/admin/trash");
  const row = page.getByRole("listitem").filter({ hasText: title });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Restore" }).click();
  await expect(page.getByText(`Restored ${title}`)).toBeVisible();

  const back = await page.request.get(carUrl, { maxRedirects: 0 });
  expect(back.status()).toBe(200);
});

test("undo from the toast restores immediately; owner can purge", async ({ page }) => {
  test.skip(!carUrl, "depends on the first test");
  await login(page);
  await openRowMenu(page);
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Move to Trash" }).click();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Restored")).toBeVisible();
  await expect(page.getByRole("link", { name: title })).toBeVisible();

  // Clean up: delete and purge permanently.
  await page.getByLabel(`Actions for ${title}`).click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Move to Trash" }).click();
  await page.goto("/admin/trash");
  await page.getByRole("listitem").filter({ hasText: title }).getByRole("button", { name: "Delete forever" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete forever" }).click();
  await expect(page.getByText("Permanently deleted")).toBeVisible();
});

test("sales users cannot see purchase prices or publish", async ({ page }) => {
  await login(page, "sales@elitecarz.demo");
  await page.goto("/admin/cars");
  await expect(page.getByRole("columnheader", { name: "Margin" })).toHaveCount(0);
  await page.getByRole("link", { name: "2023 MG Hector Plus Sharp Pro CVT" }).click();
  await expect(page.getByText("Live cars can only be changed by a manager.")).toBeVisible();
  await expect(page.getByText("Internal only")).toHaveCount(0);
  await page.goto("/admin/cars/new");
  await expect(page.getByRole("button", { name: "Publish" })).toHaveCount(0);
});
