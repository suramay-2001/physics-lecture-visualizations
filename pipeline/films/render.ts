/**
 * Render a Motion Canvas film headlessly. From the repo root:
 *   node pipeline/films/render.ts
 *
 * Starts the films dev server (films/vite.config.ts) in-process, opens `/` in the INSTALLED Chrome through Playwright
 * (`channel: 'chrome'`, as the app's e2e does; never `playwright install`), and waits for the driver
 * (films/render/driver.ts) to finish. Motion Canvas's own Renderer + image-sequence exporter write the PNGs to
 * films/output/png/<film>/ and the scene's manifest to films/output/<film>/manifest.json; this script writes the
 * timings to films/output/<film>/render.json.
 *
 * Playwright is not a films dependency: it is resolved from app/node_modules (in a git worktree without one, from the
 * main checkout's), or from $FILMS_PLAYWRIGHT.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const FILM = 'f1-euler-limit'
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const FILMS = path.join(REPO, 'films')
const OUT = path.join(FILMS, 'output')
const PORT = Number(process.env.FILMS_PORT ?? 5231)
const TIMEOUT_MS = 10 * 60 * 1000

function playwrightDir(): string {
  if (process.env.FILMS_PLAYWRIGHT) return process.env.FILMS_PLAYWRIGHT
  const local = path.join(REPO, 'app/node_modules/playwright')
  if (fs.existsSync(local)) return local
  const common = execFileSync('git', ['-C', REPO, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' }).trim()
  return path.join(path.dirname(common), 'app/node_modules/playwright')
}

const pct = (xs: number[], p: number) => {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor(p * s.length))]
}
const round = (x: number) => Math.round(x * 10) / 10

const wall0 = performance.now()
const pngDir = path.join(OUT, 'png', FILM)
fs.rmSync(pngDir, { recursive: true, force: true })
fs.rmSync(path.join(OUT, FILM, 'manifest.json'), { force: true })

const filmsRequire = createRequire(path.join(FILMS, 'package.json'))
const vite = await import(pathToFileURL(filmsRequire.resolve('vite')).href)
const { chromium } = createRequire(import.meta.url)(playwrightDir())

const server = await vite.createServer({
  configFile: path.join(FILMS, 'vite.config.ts'),
  root: FILMS,
  logLevel: 'warn',
  server: { port: PORT, strictPort: true },
})
await server.listen()
const url = `http://127.0.0.1:${PORT}/`
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors: string[] = []
try {
  const page = await browser.newPage()
  page.on('pageerror', (e: Error) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m: { type(): string; text(): string }) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`)
  })
  page.on('response', (r: { status(): number; url(): string }) => {
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`)
  })
  const load0 = performance.now()
  await page.goto(url)
  await page.waitForFunction(() => (window as unknown as { __films?: { done: boolean } }).__films?.done === true, null, {
    timeout: TIMEOUT_MS,
    polling: 250,
  })
  const res = await page.evaluate(() => (window as unknown as { __films: unknown }).__films)
  const r = res as { result: string; frames: number; renderMs: number; frameMs: number[]; error?: string; log: string[] }
  const pngs = fs.existsSync(pngDir) ? fs.readdirSync(pngDir).filter((f) => f.endsWith('.png')).sort() : []
  const perFrame = r.frameMs.slice(1) // the first entry includes scene setup
  if (!perFrame.length) perFrame.push(NaN)
  const report = {
    film: FILM,
    result: r.result,
    error: r.error ?? null,
    framesDrawn: r.frames,
    pngs: pngs.length,
    firstPng: pngs[0],
    lastPng: pngs.at(-1),
    pageToDoneMs: round(performance.now() - load0),
    renderMs: round(r.renderMs),
    msPerFrame: { mean: round(r.renderMs / pngs.length), p50: round(pct(perFrame, 0.5)), p95: round(pct(perFrame, 0.95)), max: round(Math.max(...perFrame)) },
    wallMs: 0,
    consoleErrors: errors,
    motionCanvasLog: r.log,
  }
  report.wallMs = round(performance.now() - wall0)
  fs.mkdirSync(path.join(OUT, FILM), { recursive: true })
  fs.writeFileSync(path.join(OUT, FILM, 'render.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
  if (r.result !== 'Success' || r.error || pngs.length !== r.frames || pngs.length === 0) process.exitCode = 1
} finally {
  await browser.close()
  await server.close()
}
