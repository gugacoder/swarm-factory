import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:8081',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    port: 8081,
    reuseExistingServer: true,
    timeout: 15_000,
  },
})
