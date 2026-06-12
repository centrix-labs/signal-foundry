import { expect, test, type Page } from "@playwright/test";

const ACCESS_CODE = process.env["SIGNAL_FOUNDRY_DEMO_ACCESS_CODE"];

function routeSignedOut(page: Page) {
  return page.route("**/.auth/me", (route) =>
    route.fulfill({
      json: {
        clientPrincipal: null
      }
    })
  );
}

function routeSignedIn(page: Page) {
  return page.route("**/.auth/me", (route) =>
    route.fulfill({
      json: {
        clientPrincipal: {
          identityProvider: "aad",
          userDetails: "mobile-reviewer@asteria-dynamics.example",
          userId: "mobile-reviewer",
          userRoles: ["authenticated"]
        }
      }
    })
  );
}

test("demo access unlock reaches Microsoft sign-in with provider mark hidden", async ({ page }) => {
  test.skip(!ACCESS_CODE, "Set SIGNAL_FOUNDRY_DEMO_ACCESS_CODE to run the demo access gate check.");
  await page.setViewportSize({ width: 390, height: 844 });
  await routeSignedOut(page);

  await page.goto("/?hideMicrosoftLogo=1");
  await page.getByPlaceholder("Enter review code").fill(ACCESS_CODE);
  await page.getByRole("button", { name: "Unlock demo" }).click();

  await expect(page.getByRole("link", { name: "Continue with Microsoft" })).toBeVisible();
  await expect(page.locator(".microsoft-mark")).toHaveCount(0);
});

test("mobile floor can open Copilot Mirror from the live link", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => window.sessionStorage.setItem("signal-foundry-access", "granted"));
  await routeSignedIn(page);

  await page.goto("/?hideMicrosoftLogo=1");
  await page.getByRole("button", { name: /Open Copilot proof/i }).click();

  await expect(page.getByRole("heading", { name: "Microsoft 365 Copilot proof" })).toBeVisible();
  await expect(page.getByText(/Live from approved MCP checkpoints|Demo transcript fallback/)).toBeVisible();
  await expect(page.getByText(/Proposal created, medium risk assigned|approved source summaries/)).toBeVisible();
  await expect(page.getByRole("region", { name: "Signal Atlas" })).toBeVisible();

  await page.getByRole("button", { name: /Hide mirror/i }).click();
  await expect(page.getByRole("heading", { name: "What happened to this capability" })).toBeVisible();
});
