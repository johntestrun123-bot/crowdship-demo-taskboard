import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("shows the seeded tasks and counts", async ({ page }) => {
  await expect(page.getByTestId("task-item")).toHaveCount(3);
  await expect(page.getByTestId("total-count")).toHaveText("3");
  await expect(page.getByTestId("remaining-count")).toHaveText("3");
});

test("adds a task", async ({ page }) => {
  await page.getByTestId("new-task-input").fill("Grab coffee");
  await page.getByTestId("add-task-button").click();
  await expect(page.getByTestId("task-item")).toHaveCount(4);
  await expect(page.getByTestId("total-count")).toHaveText("4");
});

test("completes a task", async ({ page }) => {
  await page.getByTestId("task-checkbox").first().check();
  await expect(page.getByTestId("completed-count")).toHaveText("1");
  await expect(page.getByTestId("remaining-count")).toHaveText("2");
});

test("un-completing a task restores the completed count", async ({ page }) => {
  const checkbox = page.getByTestId("task-checkbox").first();
  await expect(page.getByTestId("completed-count")).toHaveText("0");
  await checkbox.check();
  await expect(page.getByTestId("completed-count")).toHaveText("1");
  await checkbox.uncheck();
  await expect(page.getByTestId("completed-count")).toHaveText("0");
  await expect(page.getByTestId("remaining-count")).toHaveText("3");
  await expect(page.getByTestId("total-count")).toHaveText("3");
});

test("counts stay in sync after reload", async ({ page }) => {
  await page.getByTestId("task-checkbox").nth(1).check();
  await page.reload();
  await expect(page.getByTestId("completed-count")).toHaveText("1");
  await page.getByTestId("task-checkbox").nth(1).uncheck();
  await expect(page.getByTestId("completed-count")).toHaveText("0");
  await expect(page.getByTestId("remaining-count")).toHaveText("3");
});

test("tasks persist across reloads", async ({ page }) => {
  await page.getByTestId("new-task-input").fill("Persist me");
  await page.getByTestId("add-task-button").click();
  await page.reload();
  await expect(page.getByText("Persist me")).toBeVisible();
});
