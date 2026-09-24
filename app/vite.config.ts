/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { cspMeta } from './build/csp.ts'

// Relative base so the built site works from any static host path (GitHub Pages, a shared folder).
export default defineConfig({
  base: './',
  // cspMeta(): build-only CSP <meta> (owned by S; a no-op until S enables it — W-L1 §4.6).
  plugins: [react(), cspMeta()],
  build: { chunkSizeWarningLimit: 1200 },
  test: {
    // Playwright specs live in e2e/ and run with `npm run e2e`, never under vitest.
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
})
