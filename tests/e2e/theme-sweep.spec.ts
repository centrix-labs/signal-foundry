import { expect, test } from "@playwright/test";

const VIEWS = [
  { nav: "Judge Mode", probe: ".ledger-card" },
  { nav: "Judge Deck", probe: ".deck-card" },
  { nav: "Foundry Floor", probe: ".capability-list" },
  { nav: "Signal Atlas", probe: ".atlas-panel" },
  { nav: "Release Pipeline", probe: ".release-pipeline" },
  { nav: "Review Queue", probe: ".panel" },
  { nav: "Copilot Mirror", probe: ".copilot-chat" },
  { nav: "Light Executive", probe: ".panel" }
] as const;

for (const theme of ["light", "dark"] as const) {
  test(`theme parity sweep: every view renders in ${theme} mode`, async ({ page }) => {
    await page.addInitScript(() => window.sessionStorage.setItem("signal-foundry-access", "granted"));
    await page.goto("/");
    await expect(page.getByText("Live registry synced")).toBeVisible({ timeout: 15000 });
    await page.locator(".theme-switch button", { hasText: theme === "dark" ? "Dark" : "Light" }).click();
    await page.waitForTimeout(450); // let theme transitions settle so screenshots show steady state
    for (const view of VIEWS) {
      await page.getByRole("button", { name: view.nav, exact: true }).click();
      await expect(page.locator(view.probe).first()).toBeVisible();
      const slug = view.nav.toLowerCase().replace(/\s+/g, "-");
      await page.screenshot({ path: `evidence/screenshots/theme-${theme}-${slug}.png`, fullPage: true });
    }
  });
}
