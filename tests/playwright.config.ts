import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "/Users/mattgraves/Documents/hackathon-enterprise/tests",
  outputDir: "/Users/mattgraves/Documents/hackathon-enterprise/test-results",
  use: {
    baseURL: "http://127.0.0.1:5173"
  }
});
