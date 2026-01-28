import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "src/tests",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run preview -- --port 4173",
    port: 4173,
    reuseExistingServer: false,
  },
});
