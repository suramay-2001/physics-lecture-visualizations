/**
 * Vitest setup: KaTeX is a lazy chunk in the app (ui/texLoader.ts), and a component that typesets suspends until it has
 * arrived. The tests render with react-dom/server, which cannot wait, so every test file starts with the renderers loaded.
 */
import { loadTex } from '../ui/texLoader'

await loadTex()
