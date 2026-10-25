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

test("tasks persist across reloads", async ({ page }) => {
  await page.getByTestId("new-task-input").fill("Persist me");
  await page.getByTestId("add-task-button").click();
  await page.reload();
  await expect(page.getByText("Persist me")).toBeVisible();
});

test("sorts tasks by newest, oldest and alphabetical", async ({ page }) => {
  const titles = page.getByTestId("task-item");
  await page.getByTestId("new-task-input").fill("Zip up the backpack");
  await page.getByTestId("add-task-button").click();

  await expect(titles).toHaveText([
    "Pick up badges at registration",
    "Join the opening keynote",
    "Find a team for the hackathon",
    "Zip up the backpack",
  ]);

  await page.getByTestId("sort-select").selectOption("newest");
  await expect(titles).toHaveText([
    "Zip up the backpack",
    "Find a team for the hackathon",
    "Join the opening keynote",
    "Pick up badges at registration",
  ]);

  await page.getByTestId("sort-select").selectOption("alphabetical");
  await expect(titles).toHaveText([
    "Find a team for the hackathon",
    "Join the opening keynote",
    "Pick up badges at registration",
    "Zip up the backpack",
  ]);

  await page.getByTestId("sort-select").selectOption("oldest");
  await expect(titles.first()).toHaveText("Pick up badges at registration");
});

test("moves completed tasks below incomplete ones when enabled", async ({ page }) => {
  const titles = page.getByTestId("task-item");
  await page.getByTestId("task-checkbox").first().check();
  await expect(titles.first()).toHaveText("Pick up badges at registration");

  await page.getByTestId("incomplete-first-toggle").check();
  await expect(titles).toHaveText([
    "Join the opening keynote",
    "Find a team for the hackathon",
    "Pick up badges at registration",
  ]);
  await expect(page.getByTestId("task-checkbox").last()).toBeChecked();

  await page.getByTestId("task-checkbox").first().check();
  await expect(titles.last()).toHaveText("Join the opening keynote");
  await expect(titles.first()).toHaveText("Find a team for the hackathon");

  await page.getByTestId("incomplete-first-toggle").uncheck();
  await expect(titles.first()).toHaveText("Pick up badges at registration");
});
