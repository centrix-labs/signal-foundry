import { expect, test } from "@playwright/test";

test("judge deck renders the single-screen evidence scorecard", async ({ page }) => {
  await page.addInitScript(() => window.sessionStorage.setItem("signal-foundry-access", "granted"));
  await page.goto("/");
  await expect(page.getByText("Live registry synced")).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: "Judge Deck" }).click();
  await expect(page.getByRole("heading", { name: "Judge Deck" })).toBeVisible();

  const cards = page.locator(".deck-card");
  await expect(cards).toHaveCount(8);
  await expect(page.getByText("MCP healthy")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("Live registry", { exact: true })).toBeVisible();
  await expect(page.locator(".deck-card", { hasText: "Risk gate + advisory" })).toBeVisible();
  await page.screenshot({ path: "evidence/screenshots/judge-deck-local.png", fullPage: true });

  await page.getByRole("button", { name: "Judge Mode" }).click();
  await expect(page.locator(".ledger-card")).toHaveCount(5);
  await expect(page.locator(".ledger-card.current")).toHaveCount(1);
  await page.locator(".judge-action-strip .judge-actions .primary").click();
  await expect(page.locator(".ledger-card.done")).toHaveCount(1);
  await expect(page.locator(".ledger-card.current strong")).not.toHaveText("Permission-aware work signals enter the forge");
  await page.screenshot({ path: "evidence/screenshots/judge-mode-local-refined.png", fullPage: true });
});
