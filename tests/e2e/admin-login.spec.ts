import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "change-me-now-min-8-chars";

test.describe("Admin login", () => {
  test("logs in with valid credentials and reaches the dashboard", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/admin/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("shows an error and stays on the login page for a wrong password", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', "definitely-wrong-password");
    await page.click('button[type="submit"]');

    await expect(page.getByText("Invalid email or password")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("redirects an unauthenticated visitor away from a protected admin page", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/admin/login**");
  });
});
