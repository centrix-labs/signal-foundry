import { chromium } from "@playwright/test";

const BASE = "http://127.0.0.1:4173";
const OUT = "/private/tmp/claude-demo/scenes";

async function scene(browser, name, actions) {
  const context = await browser.newContext({
    viewport: { width: 960, height: 1080 },
    recordVideo: { dir: OUT, size: { width: 960, height: 1080 } }
  });
  await context.addInitScript(() => sessionStorage.setItem("signal-foundry-access", "granted"));
  const page = await context.newPage();
  await page.goto(BASE);
  await page.getByText("Live registry synced").waitFor({ timeout: 20000 });
  await actions(page);
  const video = page.video();
  await context.close();
  const path = await video.path();
  const fs = await import("node:fs");
  fs.renameSync(path, `${OUT}/${name}.webm`);
  console.log("scene done:", name);
}

const browser = await chromium.launch();

await scene(browser, "judge-story", async (page) => {
  await page.waitForTimeout(2500);
  for (let i = 0; i < 4; i++) {
    await page.locator(".judge-action-strip .judge-actions .primary").click();
    await page.waitForTimeout(2400);
  }
  await page.waitForTimeout(2000);
});

await scene(browser, "floor-released", async (page) => {
  await page.getByRole("button", { name: "Foundry Floor" }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /Incident Summarization Copilot/ }).first().click();
  await page.waitForTimeout(3500);
  await page.getByLabel("Open audit trail").click();
  await page.waitForTimeout(4500);
  await page.getByLabel("Close audit trail").click();
  await page.waitForTimeout(1200);
});

await scene(browser, "judge-deck", async (page) => {
  await page.getByRole("button", { name: "Judge Deck" }).click();
  await page.getByText("MCP healthy").waitFor({ timeout: 20000 });
  await page.waitForTimeout(7000);
});

await browser.close();
console.log("all scenes captured");
