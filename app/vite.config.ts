import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the built site works from any static host path (GitHub Pages, a shared folder).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1200 },
})
