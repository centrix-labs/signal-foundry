import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const viewCases = [
  { nav: "Judge Mode", evidence: "01-judge-mode", text: "Governed Copilot workflows" },
  { nav: "Foundry Floor", evidence: "02-foundry-floor", text: "Latest governed interaction" },
  { nav: "Signal Atlas", evidence: "03-signal-atlas", text: "Summary work signals" },
  { nav: "Release Pipeline", evidence: "04-release-pipeline", text: "01 Ingest" },
  { nav: "Review Queue", evidence: "05-review-queue", text: "Human approval required" },
  { nav: "Copilot Mirror", evidence: "06-copilot-mirror", text: "Microsoft 365 Copilot proof" },
  { nav: "Light Executive", evidence: "07-light-executive", text: "Approved workflow launchpad" }
] as const;

const evidenceDir = process.env["SIGNAL_FOUNDRY_EVIDENCE_DIR"];

function routeSignedIn(page: Page) {
  return page.route("**/.auth/me", (route) =>
    route.fulfill({
      json: {
        clientPrincipal: {
          identityProvider: "aad",
          userDetails: "qa-judge@asteria-dynamics.example",
          userId: "qa-judge",
          userRoles: ["authenticated"]
        }
      }
    })
  );
}

async function openPortal(page: Page) {
  await page.addInitScript(() => window.sessionStorage.setItem("signal-foundry-access", "granted"));
  await routeSignedIn(page);
  await page.goto("/?hideMicrosoftLogo=1");
  await expect(page.getByRole("region", { name: "Judge Mode" })).toBeVisible({ timeout: 15000 });
}

async function capture(page: Page, name: string) {
  if (!evidenceDir) {
    return;
  }
  mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({ path: join(evidenceDir, `${name}.png`), fullPage: true });
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

async function expectLinksUsable(page: Page) {
  const links = await page.locator("a[href]").evaluateAll((items) =>
    items.map((item) => item.getAttribute("href") ?? "")
  );
  expect(links.length).toBeGreaterThan(0);
  for (const href of links) {
    expect(href).toBeTruthy();
    expect(href).not.toBe("#");
    expect(href).not.toMatch(/^javascript:/i);
  }
}

test("portal QA sweep covers screens, controls, links, motion, and evidence", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 960 });
  await openPortal(page);
  await capture(page, "00-initial-judge-mode");

  for (const view of viewCases) {
    await page.getByRole("button", { name: view.nav }).click();
    await expect(page.getByText(view.text).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectLinksUsable(page);
    await capture(page, view.evidence);
  }

  await page.getByRole("button", { name: "Judge Mode" }).click();
  const stageStepper = page.locator(".stage-stepper");
  for (const stage of ["Discover", "Propose", "Score", "Review", "Release"]) {
    await stageStepper.getByRole("button", { name: new RegExp(stage) }).click();
    await expect(page.locator(".stage-stepper button.active")).toContainText(stage);
    await expect(page.getByRole("region", { name: "Signal Atlas" })).toBeVisible();
  }
  await page.getByRole("button", { name: /Reset golden scenario/i }).first().click();
  await expect(page.getByRole("button", { name: /Advance to Propose/i }).first()).toBeVisible();
  await page.getByRole("button", { name: /Advance to Propose/i }).first().click();
  await expect(page.locator(".stage-stepper button.active")).toContainText("Propose");
  await expect(page.getByRole("button", { name: /Advance to Score/i }).first()).toBeVisible();
  await expect(page.locator(".ledger-card")).toHaveCount(5);
  await expect(page.locator(".ledger-card.done")).toHaveCount(1);
  await expect(page.locator(".ledger-card.current")).toHaveCount(1);

  await page.getByRole("button", { name: "Foundry Floor" }).click();
  await expect(page.locator(".advisory-analysis").first()).toBeVisible();
  await page.getByLabel("Search synthetic records").fill("zzzz-no-match");
  await expect(page.getByText("No records match the current search and filters.")).toBeVisible();
  await page.getByLabel("Search synthetic records").fill("");
  await page.getByRole("button", { name: /Stage: Pending Review/i }).click();
  await expect(page.getByRole("button", { name: /Stage: Pending Review/i })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Role:/ }).first().click();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Review Queue" }).click();
  await page.getByRole("button", { name: /Save for Later/i }).click();
  await expect(page.getByText("Saved for later")).toBeVisible();
  await page.getByRole("button", { name: /Request Changes/i }).click();
  await expect(page.getByText("Changes requested")).toBeVisible();
  await page.getByRole("button", { name: /Approve & Release/i }).click();
  await expect(page.getByRole("region", { name: "Judge Mode" })).toBeVisible();

  await page.getByRole("button", { name: "Light Executive" }).click();
  await page.getByRole("button", { name: /Open release packet/i }).click();
  await expect(page.getByText("Human approval required")).toBeVisible();

  await page.getByRole("button", { name: "Judge Mode" }).click();
  await page.getByRole("button", { name: /Open Copilot proof/i }).click();
  await expect(page.getByText("Microsoft 365 Copilot proof")).toBeVisible();
  await expect(page.getByText(/Live from approved MCP checkpoints|Demo transcript fallback/)).toBeVisible();
  await page.getByRole("button", { name: /Hide mirror/i }).click();
  await expect(page.getByText("Latest governed interaction")).toBeVisible();

  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/light-mode/);
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await capture(page, "08-controls-after-clicks");

  const particles = page.locator(".atlas-flow-particle");
  await expect(particles.first()).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(particles.first()).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
  await capture(page, "09-mobile-reduced-motion");
  expect(consoleErrors).toEqual([]);
});

test("locked and signed-out portal states expose usable actions without dead links", async ({ page }) => {
  await page.route("**/.auth/me", (route) => route.fulfill({ json: { clientPrincipal: null } }));
  await page.goto("/?hideMicrosoftLogo=1");
  await page.getByRole("button", { name: "Light" }).click();
  await expect(page.getByRole("heading", { name: "Signal Foundry is locked" })).toBeVisible();
  await page.getByPlaceholder("Enter review code").fill("bad-code");
  await page.getByRole("button", { name: "Unlock demo" }).click();
  await expect(page.getByRole("alert")).toContainText("Access code not recognized.");

  await page.evaluate(() => window.sessionStorage.setItem("signal-foundry-access", "granted"));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Signal Foundry" })).toBeVisible();
  await expectLinksUsable(page);
  await capture(page, "10-signed-out-login");

  if (evidenceDir) {
    writeFileSync(
      join(evidenceDir, "walkthrough-summary.md"),
      [
        "# Portal QA Sweep",
        "",
        "- Covered access gate, signed-out login, Judge Mode, Foundry Floor, Atlas, Pipeline, Review, Mirror, and Executive views.",
        "- Exercised stage buttons, search, filters, review decisions, Copilot proof, theme toggle, links, animation visibility, reduced motion, and mobile overflow.",
        "- Console errors and page errors failed the run."
      ].join("\n")
    );
  }
});
