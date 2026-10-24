import { test, expect } from "@playwright/test";

test("homepage loads and shows title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/FormatScope/);
  await expect(page.locator("h1")).toContainText("binary format workbench");
});

test("drop zone is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".dropzone")).toBeVisible();
  await expect(page.locator("text=Drop a binary file")).toBeVisible();
});

test("shows 8 MB limit pill", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".pill")).toContainText("8 MB limit");
});

test("byte grid renders on desktop", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".grid-container")).toBeVisible();
});

test("byte grid uses 16 columns on desktop", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 1024, height: 768 });
  const cells = page.locator(".grid-row .cell").first();
  await expect(cells).toBeVisible();
});

test("byte grid uses 8 columns on phone", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".grid-container")).toBeVisible();
});
