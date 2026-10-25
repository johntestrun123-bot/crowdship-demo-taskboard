import { expect, test, type Page } from "@playwright/test";

const bodyColors = (page: Page) =>
  page.evaluate(() => {
    const s = getComputedStyle(document.body);
    return { bg: s.backgroundColor, fg: s.color };
  });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("defaults to the system light theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await bodyColors(page)).toEqual({ bg: "rgb(247, 247, 245)", fg: "rgb(28, 29, 33)" });
});

test("defaults to the system dark theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await bodyColors(page)).toEqual({ bg: "rgb(18, 19, 23)", fg: "rgb(236, 236, 241)" });
  await expect(page.getByTestId("theme-toggle")).toHaveAttribute("aria-pressed", "true");
});

test("toggles the theme and keeps the choice after a refresh", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  const html = page.locator("html");
  const toggle = page.getByTestId("theme-toggle");

  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(page.getByTestId("task-item")).toHaveCount(3);

  await page.getByTestId("theme-toggle").click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
});
