/**
 * Playwright (decision L1 #19): drive the Google Chrome already installed on this Mac via
 * `channel: 'chrome'`. Never run `npx playwright install` — no browser download.
 *
 * Projects (W-L1 §6.2):
 *   preview — production build (`vite build` + `vite preview`, CSP meta once S enables it) on :4178
 *   dev     — Vite dev server (StrictMode double effects, DEV-only Workbench route) on :5178
 * Specs live in e2e/ (excluded from vitest). `window.__stage` is the only instrumentation surface.
 */
import { defineConfig } from '@playwright/test'

// Ports can be overridden (e.g. PW_DEV_PORT=5181 to reuse a worktree's own dev server instead of another
// checkout's server on 5178 — reuseExistingServer would otherwise test the wrong code).
const PREVIEW = Number(process.env.PW_PREVIEW_PORT ?? 4178)
const DEV = Number(process.env.PW_DEV_PORT ?? 5178)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
    // Software GL is not needed on the user's Mac; CI would add --use-angle=swiftshader (W-L1 §6.3).
  },
  projects: [
    {
      name: 'preview',
      use: { channel: 'chrome', baseURL: `http://localhost:${PREVIEW}/` },
      grepInvert: /@dev-only/,
    },
    {
      name: 'dev',
      use: { channel: 'chrome', baseURL: `http://localhost:${DEV}/` },
    },
  ],
  // Start only the server the selected project needs (`--project=preview` needs a built dist/).
  webServer: process.argv.some((a) => a.includes('preview'))
    ? { command: `npx vite preview --port ${PREVIEW} --strictPort`, port: PREVIEW, reuseExistingServer: true }
    : { command: `npx vite --port ${DEV} --strictPort`, port: DEV, reuseExistingServer: true },
})
