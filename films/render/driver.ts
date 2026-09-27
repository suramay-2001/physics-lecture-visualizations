/**
 * The headless render driver. The Motion Canvas vite plugin loads an "editor" module for the page at `/` and calls
 * `editor(project)`; we pass this file as that editor (vite.config.ts), so no @motion-canvas/ui is installed.
 *
 * It renders the whole project with Motion Canvas's own Renderer and its image-sequence exporter (PNG), which sends
 * each frame over Vite's HMR socket to the plugin's exporter (`output/png/<film>/NNNNNN.png`). When the render
 * finishes it sends the scene's manifest to the films plugin (vite.config.ts), then exposes the result on
 * `window.__films` for the Playwright script (`pipeline/films/render.ts`).
 */
import { Renderer, RendererResult, Vector2, type Project } from '@motion-canvas/core'
import { manifestEntries } from '../src/manifest'
import { COLORS, FILM_ID, FORMAT } from '../src/scenes/f1-euler-limit.data'

interface FilmsResult {
  done: boolean
  result?: string
  frames: number
  renderMs: number
  frameMs: number[]
  error?: string
  /** Motion Canvas's own log (errors and warnings), which never reaches the console */
  log: string[]
}

declare global {
  interface Window {
    __films: FilmsResult
  }
}

export function editor(project: Project) {
  const state: FilmsResult = { done: false, frames: 0, renderMs: 0, frameMs: [], log: [] }
  window.__films = state
  for (const p of project.logger.history) state.log.push(`${p.level}: ${p.message}`)
  project.logger.onLogged.subscribe((p) => {
    if (p.level === 'error' || p.level === 'warn') state.log.push(`${p.level}: ${p.message}${p.stack ? `\n${p.stack}` : ''}`)
  })
  const renderer = new Renderer(project)
  let last = performance.now()
  const t0 = last
  renderer.onFrameChanged.subscribe(() => {
    const now = performance.now()
    state.frameMs.push(now - last)
    last = now
  })
  renderer.onFinished.subscribe((result) => {
    state.renderMs = performance.now() - t0
    state.result = RendererResult[result]
    const manifest = manifestEntries()
    state.frames = typeof manifest.lastFrame === 'number' ? manifest.lastFrame + 1 : 0
    const hot = import.meta.hot
    if (!hot) {
      state.error = 'no HMR channel: the manifest cannot reach the dev server'
      state.done = true
      return
    }
    hot.on('films:manifest-ack', () => {
      state.done = true
    })
    hot.send('films:manifest', { film: FILM_ID, manifest })
  })
  void renderer.render({
    ...project.meta.getFullRenderingSettings(),
    name: FILM_ID,
    size: new Vector2(FORMAT.width, FORMAT.height),
    fps: FORMAT.fps,
    resolutionScale: 1,
    colorSpace: 'srgb',
    background: COLORS.ground,
    range: [0, Infinity],
    exporter: { name: '@motion-canvas/core/image-sequence', options: { fileType: 'image/png', quality: 100, groupByScene: false } },
  })
}
