/**
 * Films dev server (Motion Canvas 3.17.2 on Vite 8; see README for the peer-range override).
 * `/` serves the headless render driver (render/driver.ts) in place of the Motion Canvas editor UI.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import motionCanvasModule from '@motion-canvas/vite-plugin'
import { defineConfig, type Plugin } from 'vite'

const FILMS = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(FILMS, '..')
const OUTPUT = path.join(FILMS, 'output')

// the plugin is CommonJS with `exports.default`; depending on the loader the default import is the function or the module
const motionCanvas = ((motionCanvasModule as unknown as { default?: unknown }).default ?? motionCanvasModule) as typeof motionCanvasModule

/** Receives the scene's manifest from the driver and writes output/<film>/manifest.json. */
function filmsManifest(): Plugin {
  return {
    name: 'films:manifest',
    configureServer(server) {
      server.ws.on('films:manifest', ({ film, manifest }: { film: string; manifest: unknown }, client) => {
        if (!/^[a-z0-9-]+$/.test(film)) throw new Error(`films: bad film id ${film}`)
        const dir = path.join(OUTPUT, film)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
        client.send('films:manifest-ack', { film })
      })
    },
  }
}

export default defineConfig({
  root: FILMS,
  plugins: [
    motionCanvas({
      project: './src/project.ts',
      output: path.join(OUTPUT, 'png'),
      editor: path.join(FILMS, 'render', 'driver.ts'),
    }),
    filmsManifest(),
  ],
  // the plugin sets esbuild's JSX options; Vite 8 transforms with Oxc, so say it here too
  oxc: { jsx: { runtime: 'automatic', importSource: '@motion-canvas/2d/lib' } },
  // Pre-bundle both packages in ONE pass. The dep scanner does not follow `?scene` imports, so on a cold cache 2d was
  // found late and re-optimized into a second chunk: the scene then held a different copy of core than the renderer
  // ("The playback is not available in the current context"). Found by the spike's cold-cache run.
  optimizeDeps: { include: ['@motion-canvas/core', '@motion-canvas/2d'] },
  // makeScene2D asks for the 2D inspector (editor UI, needs @motion-canvas/ui): not used by a headless render
  resolve: { alias: [{ find: /^@motion-canvas\/2d\/editor(?=$|\?)/, replacement: path.join(FILMS, 'render', 'no-editor-plugin.ts') }] },
  server: {
    host: '127.0.0.1',
    fs: {
      strict: true,
      // the films package plus the engine and the stage palette, nothing else of app/
      allow: [FILMS, path.join(REPO, 'app/src/physics'), path.join(REPO, 'app/src/stage/tokens.ts')],
    },
  },
})
