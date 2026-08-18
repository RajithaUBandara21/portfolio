import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "change-me-now-min-8-chars";

test.describe("Project lifecycle", () => {
  // The admin project editor (dense multi-tab form + architecture node/edge grid editor) is
  // desktop-oriented, same as most real-world CMS content editors — the public pages, including
  // the published diagram itself, are the mobile-tested surface (see the architecture-diagram
  // test). Known limitation, not an oversight: revisit if mobile content authoring becomes a
  // real requirement.
  test.skip(({ isMobile }) => isMobile, "Admin project editor is desktop-oriented");

  test("create, publish, view with architecture diagram, unpublish, then 404", async ({ page }) => {
    const slug = `e2e-test-project-${Date.now()}`;

    await page.goto("/admin/login");
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/dashboard");

    await page.goto("/admin/projects/new");
    await page.fill("#title", "E2E Test Project");
    await page.fill("#slug", slug);
    await page.fill("#shortDescription", "Created by an automated end-to-end test.");
    await page.fill(
      "#fullDescription",
      "This project exists only to verify the lifecycle end-to-end.",
    );
    await page.getByText("Backend", { exact: true }).click();

    await page.click('button[role="tab"]:has-text("Architecture")');
    await page.click('button:has-text("Add node")');
    await page.click('button:has-text("Add node")');
    const nodeKeyInputs = page.locator('input[placeholder="key (e.g. api)"]');
    await nodeKeyInputs.nth(0).fill("api");
    await page.locator('input[placeholder="Label"]').nth(0).fill("API");
    await nodeKeyInputs.nth(1).fill("db");
    await page.locator('input[placeholder="Label"]').nth(1).fill("Database");
    await page.click('button:has-text("Add edge")');

    await page.click('button[role="tab"]:has-text("Basics")');
    await page.click("#contentStatus");
    await page.click('[role="option"]:has-text("PUBLISHED")');

    await page.click('button:has-text("Save project")');
    await expect(page.getByText("Project saved")).toBeVisible();

    await page.goto(`/projects/${slug}`);
    await expect(page.getByRole("heading", { name: "E2E Test Project" })).toBeVisible();
    await expect(page.locator(".react-flow__node")).toHaveCount(2);

    await page.click(".react-flow__node >> nth=0");
    await expect(page.locator('[role="dialog"], [data-slot="sheet-content"]')).toBeVisible();

    await page.goto("/admin/projects");
    await page
      .locator("tr", { has: page.getByText("E2E Test Project") })
      .getByRole("button", { name: "Unpublish" })
      .click();
    await expect(page.getByText("Unpublished")).toBeVisible();

    const response = await page.goto(`/projects/${slug}`);
    expect(response?.status()).toBe(404);

    // Cleanup: delete the test project so it doesn't linger.
    await page.goto("/admin/projects");
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .locator("tr", { has: page.getByText("E2E Test Project") })
      .getByRole("button", { name: "Delete" })
      .click();
  });
});
