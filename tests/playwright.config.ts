import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  testDir: fileURLToPath(new URL("./e2e", import.meta.url)),
  outputDir: fileURLToPath(new URL("../test-results", import.meta.url)),
  // Golden flow must be deterministic from a fresh reset; never mask flakes.
  retries: 0,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5173"
  },
  webServer: [
    {
      command: `npm --prefix ${repoRoot} run dev:mcp`,
      url: "http://127.0.0.1:7071/health",
      reuseExistingServer: false,
      timeout: 60000,
      env: {
        SIGNAL_FOUNDRY_ADVISORY_MODE: "off",
        SIGNAL_FOUNDRY_AUTH_MODE: "demo"
      }
    },
    {
      command: `npm --prefix ${repoRoot}/apps/foundry-floor run dev`,
      url: "http://127.0.0.1:5173",
      reuseExistingServer: false,
      timeout: 60000,
      env: {
        VITE_SIGNAL_FOUNDRY_API_BASE: "http://127.0.0.1:7071"
      }
    }
  ]
});
