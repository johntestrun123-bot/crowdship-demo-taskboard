import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

const bodyColors = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const s = getComputedStyle(document.body);
    return { bg: s.backgroundColor, fg: s.color };
  });

test.describe("system light preference", () => {
  test.use({ colorScheme: "light" });

  test("defaults to light and can switch to dark", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");
    const light = await bodyColors(page);

    await page.getByTestId("theme-toggle").click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    const dark = await bodyColors(page);
    expect(dark.bg).not.toBe(light.bg);
    expect(dark.fg).not.toBe(dark.bg);
    expect(light.fg).not.toBe(light.bg);
  });

  test("preference survives a refresh", async ({ page }) => {
    await page.getByTestId("theme-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByTestId("theme-toggle")).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("system dark preference", () => {
  test.use({ colorScheme: "dark" });

  test("defaults to dark and remembers an explicit light choice", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.getByTestId("theme-toggle").click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("tasks remain visible in dark mode", async ({ page }) => {
    await expect(page.getByTestId("task-item")).toHaveCount(3);
    await expect(page.getByText("Pick up badges at registration")).toBeVisible();
  });
});
