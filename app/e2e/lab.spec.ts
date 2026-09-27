/**
 * The Babylon /lab foundation (decisions/lab.md; W-lab §5): the G-lab measurements on the BUILT app.
 *   npm run build && PW_PREVIEW_PORT=5186 npx playwright test --project=preview e2e/lab.spec.ts
 * `?measure` installs window.__lab (and window.__stage) in the production build.
 *   - #/lab: 0 console errors, 0 CSP violations, 0 requests to another origin, 0 Babylon side-effect warnings,
 *     0 tripwire trips; an idle lab draws 0 frames.
 *   - contexts: lecture → lab = 2 live, lab → lecture = 1; the lecture canvas draws 0 frames on /lab; the engine is
 *     disposed after leaving; the lecture draws again.
 *   - handedness (ruling #1): the ±x, ±y, +z tips project where the r3f Bloch scene (B-STD) puts them, and
 *     R_z(+90°) carries the |+x⟩ bead onto the |+y⟩ label (R_z(−90°) onto |−y⟩).
 *   - 800 px: the fallback shows and no lab (Babylon) chunk is requested.
 *   - reduced motion: orbiting stops the moment the pointer is released (inertia 0); full motion glides briefly.
 *   - a lost context shows the fallback; Restart 3D remounts on a fresh canvas.
 *   - frame time: p95 over 120 frames of continuous orbiting at 1440×900 @2× (budget 8 ms), GUI on / static / off
 *     (median of three interleaved rounds).
 * The Operator Lab (#/lab/operator, D-lab §2.2):
 *   - 0 console errors or warnings, 0 CSP violations, 0 other origins, 0 trips; two linked views (left/right at 1440),
 *     the prefiltered room environment in use; the DOM readouts equal the engine model's (`__lab.op.readouts()`).
 *   - a real mouse drag of the a⃗ tip and a `__lab` drag of the bead change the DOM readouts to the engine values
 *     (hand values: S_x λ± = ±ħ/2; S_z from |+x⟩, one lap of the bead = τ 2π, ket −|+x⟩; two laps, +|+x⟩).
 *   - a keyboard twin nudges the same parameter; the preset allowlist: an allowlisted id sets its setup, crafted
 *     queries set nothing; 800 px: readouts in the page, no canvas, no Babylon chunk.
 *   - frame p95 ≤ 8 ms at 1440×900 @2× while dragging the tip and the bead (store → engine model → scene → draw).
 *   - screenshots for visual QA (1440×900 and 1024×768: default, dragged, commutator, non-Hermitian) into
 *     e2e/__screens__/lab/ (git-ignored); in each state no two visible labels overlap and no label covers a
 *     passport, a readout line or the caption (`__lab.labels()`), and no ket or vector wraps inside an amplitude.
 *   - the P review (docs/roles/audits/P-oplab-review.md): typed Hermitian matrices up to 10⁶ never crash (τ-sweep,
 *     a crafted 2+9e-10i); Predict first hides the turn angle, "eigenstate", the basis radios and the non-Hermitian
 *     lines; a spin preset's readouts carry ħ, a typed or dragged operator's never do.
 * The Grapher (#/lab/grapher, D-lab §2.4):
 *   - 0 console errors or warnings, 0 CSP violations, 0 other origins, 0 trips; the GRAPH SPACE passport and its
 *     fidelity note; the DOM readouts equal the model's (`__lab.grapher.readouts()`); the Try this readout (f = g at
 *     445 of 4225 samples); every number of the view is finite.
 *   - a malformed expression shows the caret under the right character and a plain reason; the picture keeps the last
 *     graph that read; a reversed range is refused; fixing the text clears the error.
 *   - a pathological expression at 128² on both layers does not freeze the tab: the re-sample time and the longest task.
 *   - frame p95 ≤ 8 ms at 1440×900 @2× while orbiting a 128² surface pair and while dragging the cursor; the cost of a
 *     full re-sample frame is reported.
 *   - a real mouse drag and the keyboard twin move the cursor; the preset allowlist; 800 px: readouts and an SVG
 *     outline in the page, no canvas, no Babylon chunk.
 *   - screenshots (1440×900, 1024×768: surface preset, curve, Bloch path, an error) with no label clash.
 */
import { expect, test, type Page } from '@playwright/test'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { labScopes, type ChunkReport } from '../build/chunkGraph.ts'
import { collectErrors, type LabBenchResult } from './helpers.ts'

declare global {
  interface Window {
    __csp?: string[]
  }
}

const REPORT_FILE = fileURLToPath(new URL('../node_modules/.tmp/chunk-modules.json', import.meta.url))
/** File names (assets/x.js) of the chunks only the lab gate can load (from the build's chunk report). */
const LAB_CHUNKS: string[] = existsSync(REPORT_FILE) ? [...labScopes(JSON.parse(readFileSync(REPORT_FILE, 'utf8')) as ChunkReport).lab] : []

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'preview', 'the lab is measured on the production build (preview project)')
  await page.addInitScript(() => {
    window.__csp = []
    document.addEventListener('securitypolicyviolation', (e) => window.__csp!.push(`${e.violatedDirective} ← ${e.blockedURI || 'inline'}`))
  })
})

function watch(page: Page, origin: string) {
  const foreign: string[] = []
  const urls: string[] = []
  const warnings: string[] = []
  page.on('request', (r) => {
    const u = r.url()
    urls.push(u)
    if (u.startsWith('data:') || u.startsWith('blob:')) return
    if (new URL(u).origin !== origin) foreign.push(u)
  })
  page.on('console', (m) => {
    if (m.type() === 'warning' && /Babylon|side-effect import/i.test(m.text())) warnings.push(m.text())
  })
  return { foreign, urls, warnings }
}

/** Frames the lab draws in `ms` of doing nothing. */
async function idleFrames(page: Page, ms = 600): Promise<number> {
  const a = await page.evaluate(() => window.__lab!.framesDrawn)
  await page.waitForTimeout(ms)
  return (await page.evaluate(() => window.__lab!.framesDrawn)) - a
}

async function openLab(page: Page, url = '?measure#/lab') {
  await page.goto(url)
  await page.waitForFunction(() => window.__lab?.mounted === true, undefined, { timeout: 20_000 })
  // fonts and KaTeX change the layout (a resize redraws); then wait until the scene is ready and the loop idle
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(
    async () => {
      const a = window.__lab!.framesDrawn
      await new Promise((r) => setTimeout(r, 250))
      return a > 0 && window.__lab!.framesDrawn === a
    },
    undefined,
    { timeout: 20_000, polling: 300 },
  )
}

test('#/lab: 0 errors, 0 CSP violations, 0 other origins, 0 Babylon warnings, 0 trips; idle = 0 frames', async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const errors = collectErrors(page)
  const w = watch(page, new URL(baseURL!).origin)
  await openLab(page)
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1)
  await expect(page.locator('.lab-stage canvas.lab-canvas')).toHaveCount(1)
  await expect(page.locator('.lab-stage .stage-passport')).toContainText('STATE SPACE')
  await expect(page.locator('.lab-stage .stage-readout').first()).toHaveText('R_z(0°) |+x⟩')
  // the pole labels are DOM, placed by projection
  await expect(page.locator('.lab-stage .stage-label[data-hidden="0"]')).toHaveCount(6)
  expect(await idleFrames(page)).toBe(0)
  // a DOM control redraws once, then the lab is idle again
  await page.getByRole('button', { name: 'Turn by plus 15 degrees about z' }).click()
  await expect(page.locator('.lab-stage .stage-readout').first()).toHaveText('R_z(15°) |+x⟩')
  await page.waitForTimeout(300)
  expect(await idleFrames(page)).toBe(0)
  await page.waitForLoadState('networkidle')
  expect(await page.evaluate(() => window.__csp ?? [])).toEqual([])
  expect(w.foreign).toEqual([])
  expect(w.warnings).toEqual([])
  expect(await page.evaluate(() => window.__lab!.tripwire())).toEqual([])
  expect(errors).toEqual([])
  // the lab chunks really were fetched here (so the 800 px test below proves something)
  expect(LAB_CHUNKS.length).toBeGreaterThan(0)
  expect(w.urls.some((u) => LAB_CHUNKS.some((c) => u.endsWith(c)))).toBe(true)
})

test('contexts: lecture → lab = 2 live, lecture canvas draws 0 frames on /lab; back = 1 live, engine disposed, lecture draws again', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const errors = collectErrors(page)
  await page.goto('?measure#/lecture/L6')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  await page.waitForFunction(() => !!window.__stage && Object.keys(window.__stage.beats()).length > 0, undefined, { timeout: 20_000 })
  await page.evaluate(() => window.__stage!.scrollToBeat('l6-bloch:b2', { wait: false }))
  await page.waitForFunction(() => (window.__stage?.views() ?? []).some((v) => v.renders > 0), undefined, { timeout: 20_000 })
  expect(await page.evaluate(() => window.__stage!.contexts - window.__stage!.contextsLost)).toBe(1)

  await page.evaluate(() => (location.hash = '#/lab'))
  await page.waitForFunction(() => window.__lab?.mounted === true, undefined, { timeout: 20_000 })
  expect(await page.evaluate(() => [window.__lab!.live, window.__lab!.engines()])).toEqual([2, 1])
  // orbit the lab for a while: the lecture host must not draw a single frame meanwhile
  const hostBefore = await page.evaluate(() => window.__stage!.framesDrawn)
  const labBefore = await page.evaluate(() => window.__lab!.framesDrawn)
  const box = (await page.locator('.lab-canvas').boundingBox())!
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5)
  await page.mouse.down()
  for (let i = 1; i <= 20; i++) await page.mouse.move(box.x + box.width * (0.5 + i * 0.01), box.y + box.height * 0.5)
  await page.mouse.up()
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => window.__lab!.framesDrawn)).toBeGreaterThan(labBefore)
  expect(await page.evaluate(() => window.__stage!.framesDrawn)).toBe(hostBefore)

  await page.evaluate(() => (location.hash = '#/lecture/L6'))
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  await page.waitForFunction(() => window.__lab!.mounted === false, undefined, { timeout: 10_000 })
  expect(await page.evaluate(() => [window.__lab!.live, window.__lab!.engines(), window.__lab!.mounts, window.__lab!.disposals])).toEqual([1, 0, 1, 1])
  expect(await page.locator('canvas.lab-canvas').count()).toBe(0)
  await page.evaluate(() => window.__stage!.scrollToBeat('l6-bloch:b2', { wait: false }))
  const hostBack = await page.evaluate(() => window.__stage!.framesDrawn)
  await page.waitForFunction((n) => window.__stage!.framesDrawn > n + 5, hostBack, { timeout: 10_000 })
  expect(errors).toEqual([])
})

test('lab first, then leave: 1 context while open, 0 after', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openLab(page)
  expect(await page.evaluate(() => window.__lab!.live)).toBe(1)
  await page.evaluate(() => (location.hash = '#/help'))
  await page.waitForFunction(() => window.__lab!.mounted === false)
  expect(await page.evaluate(() => [window.__lab!.live, window.__lab!.engines()])).toEqual([0, 0])
})

test('handedness: tips project like the r3f Bloch scene (B-STD); R_z(+90°) carries the |+x⟩ bead onto the |+y⟩ label', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const errors = collectErrors(page)
  const TIPS: [number, number, number][] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [-1, 0, 0],
    [0, -1, 0],
  ]
  // r3f: the lecture Bloch scene at B-STD (L6 "l6-bloch:b2")
  await page.goto('?measure#/lecture/L6')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  await page.waitForFunction(() => !!window.__stage && Object.keys(window.__stage.beats()).length > 0, undefined, { timeout: 20_000 })
  await page.evaluate(() => window.__stage!.scrollToBeat('l6-bloch:b2', { wait: false }))
  // the scene chunk loads lazily: until it registers its camera the view draws through a fallback camera
  await page.waitForFunction(() => (window.__stage?.views() ?? []).some((v) => v.key === 'l6-bloch/bloch' && v.hasCamera && v.renders > 2 && !!v.screen), undefined, { timeout: 20_000 })
  await page.evaluate(() => window.__stage!.settle())
  const r3f = await page.evaluate((tips) => {
    const v = window.__stage!.views().find((x) => x.key === 'l6-bloch/bloch')!
    const o = window.__stage!.project('l6-bloch/bloch', [0, 0, 0])!
    return { rect: v.screen!, cam: window.__stage!.camera('l6-bloch/bloch')!, o, tips: tips.map((t) => window.__stage!.project('l6-bloch/bloch', t)!) }
  }, TIPS)
  const [, , , rh] = r3f.rect
  // the r3f camera as drawn (BlochScene backs it off to fit the stage): physics azimuth, elevation, distance, lens
  const [cx, cy, cz] = r3f.cam.position
  const d = Math.hypot(cx, cy, cz)
  const az = (Math.atan2(cy, cx) * 180) / Math.PI
  const el = (Math.asin(cz / d) * 180) / Math.PI
  console.log(`[lab] r3f B-STD camera: az ${az.toFixed(2)}°, el ${el.toFixed(2)}°, d ${d.toFixed(3)}, fov ${r3f.cam.fov}°, up ${r3f.cam.up.map((x) => +x.toFixed(3))}`)
  expect(Math.abs(az - 30)).toBeLessThan(0.01)
  expect(Math.abs(el - 22)).toBeLessThan(0.01)

  // Babylon: the same direction, distance and lens
  await page.evaluate(() => (location.hash = '#/lab'))
  await page.waitForFunction(() => window.__lab?.mounted === true, undefined, { timeout: 20_000 })
  await page.evaluate(([dist, fov]) => window.__lab!.shot(30, 22, dist, fov), [d, r3f.cam.fov ?? 40])
  const lab = await page.evaluate((tips) => {
    const c = document.querySelector('.lab-canvas')!.getBoundingClientRect()
    return { h: c.height, o: window.__lab!.project([0, 0, 0])!, tips: tips.map((t) => window.__lab!.project(t)!) }
  }, TIPS)
  // screen offsets from the centre, in units of the view height (a vertical-fov lens makes them aspect-independent)
  const rows = TIPS.map((t, i) => {
    const a = [(r3f.tips[i][0] - r3f.o[0]) / rh, (r3f.tips[i][1] - r3f.o[1]) / rh]
    const b = [(lab.tips[i][0] - lab.o[0]) / lab.h, (lab.tips[i][1] - lab.o[1]) / lab.h]
    return { tip: t.join(','), r3f: a.map((x) => +x.toFixed(4)), lab: b.map((x) => +x.toFixed(4)), err: Math.hypot(a[0] - b[0], a[1] - b[1]) }
  })
  console.log(`[lab] handedness (offsets / view height), d = ${d.toFixed(3)}:\n${rows.map((r) => `  ${r.tip}: r3f ${r.r3f} lab ${r.lab} err ${r.err.toExponential(2)}`).join('\n')}`)
  for (const r of rows) expect(r.err, r.tip).toBeLessThan(0.005)
  // a mirrored scene would put +y on the other side of the screen: the check above cannot pass by symmetry
  expect(Math.sign(lab.tips[1][0] - lab.o[0])).toBe(Math.sign(r3f.tips[1][0] - r3f.o[0]))

  // R_z(+90°)|+x⟩ = |+y⟩ (engine): the bead must sit on the |+y⟩ label; R_z(−90°) on |−y⟩; 0° on |+x⟩
  const nearest = async (deg: number) => {
    await page.evaluate((x) => window.__lab!.setPhi(x), deg)
    await page.waitForFunction((x) => window.__lab!.state().phi === x && !!window.__lab!.beadScreen(), deg)
    await page.waitForTimeout(100)
    return page.evaluate(() => {
      const bead = window.__lab!.beadScreen()!
      const labels = [...document.querySelectorAll<HTMLElement>('.lab-stage .stage-label[data-hidden="0"]')].map((el) => {
        const r = el.getBoundingClientRect()
        return { label: el.dataset.label!, dist: Math.hypot(r.left + r.width / 2 - bead[0], r.top + r.height / 2 - bead[1]) }
      })
      labels.sort((a, b) => a.dist - b.dist)
      return labels[0]
    })
  }
  const at90 = await nearest(90)
  expect(at90.label).toBe('+y')
  expect(at90.dist).toBeLessThan(40)
  expect((await nearest(270)).label).toBe('-y')
  expect((await nearest(0)).label).toBe('+x')
  expect((await nearest(180)).label).toBe('-x')
  expect(errors).toEqual([])
})

test('800 px: the fallback shows and no Babylon chunk is requested', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 })
  const errors = collectErrors(page)
  const urls: string[] = []
  page.on('request', (r) => urls.push(r.url()))
  await page.goto('?measure#/lab')
  await expect(page.locator('.lab-paper h1')).toHaveText('Frame check')
  await expect(page.locator('.lab-readout-list li').first()).toHaveText('R_z(0°) |+x⟩')
  await page.getByRole('button', { name: 'Turn by plus 15 degrees about z' }).click()
  await expect(page.locator('.lab-readout-list li').first()).toHaveText('R_z(15°) |+x⟩')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
  expect(await page.locator('canvas').count()).toBe(0)
  expect(LAB_CHUNKS.length).toBeGreaterThan(0)
  expect(urls.filter((u) => LAB_CHUNKS.some((c) => u.endsWith(c)) || /mountLab/.test(u))).toEqual([])
  expect(await page.evaluate(() => [window.__lab!.mounts, window.__lab!.contexts])).toEqual([0, 0])
  expect(errors).toEqual([])
})

test('motion: reduced motion stops orbiting on release (inertia 0); full motion glides to a stop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const drag = async () => {
    const box = (await page.locator('.lab-canvas').boundingBox())!
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5)
    await page.mouse.down()
    for (let i = 1; i <= 8; i++) await page.mouse.move(box.x + box.width * (0.4 + i * 0.03), box.y + box.height * 0.5)
    await page.mouse.up()
    // frames drawn after the release
    const a = await page.evaluate(() => window.__lab!.framesDrawn)
    await page.waitForTimeout(700)
    return (await page.evaluate(() => window.__lab!.framesDrawn)) - a
  }
  await openLab(page, '?measure&motion=reduce#/lab')
  const reduced = await drag()
  expect(reduced).toBeLessThanOrEqual(1)
  await openLab(page, '?measure#/lab')
  const full = await drag()
  expect(full).toBeGreaterThanOrEqual(3)
  expect(await idleFrames(page)).toBe(0)
  console.log(`[lab] frames after release: reduced ${reduced}, full ${full}`)
})

test('a lost context shows the fallback; Restart 3D remounts on a fresh canvas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const errors = collectErrors(page)
  await openLab(page)
  const first = await page.locator('.lab-canvas').elementHandle()
  expect(await page.evaluate(() => window.__lab!.loseContext())).toBe(true)
  await expect(page.getByRole('button', { name: 'Restart 3D' })).toBeVisible()
  await page.getByRole('button', { name: 'Restart 3D' }).click()
  await page.waitForFunction(() => window.__lab!.mounted && window.__lab!.mounts === 2, undefined, { timeout: 20_000 })
  expect(await first!.evaluate((c) => c.isConnected)).toBe(false)
  await expect(page.locator('.lab-canvas')).toHaveCount(1)
  expect(await page.evaluate(() => window.__lab!.live)).toBe(1)
  expect(errors).toEqual([])
})

test.describe('frame time (1440×900 @2×)', () => {
  test.use({ deviceScaleFactor: 2 })
  test('p95 of 120 frames of continuous orbiting ≤ 8 ms (GUI on); GUI static and off reported', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await openLab(page)
    // three interleaved rounds per GUI mode (the machine may be busy): the median round's p95 is the result
    const MODES = ['on', 'static', 'off'] as const
    const runs: Record<(typeof MODES)[number], LabBenchResult[]> = { on: [], static: [], off: [] }
    for (let round = 0; round < 3; round++)
      for (const gui of MODES) runs[gui].push((await page.evaluate((g) => window.__lab!.bench({ frames: 120, gui: g }), gui))!)
    const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
    const summary = Object.fromEntries(MODES.map((m) => [m, { p50: median(runs[m].map((r) => r.p50)), p95: median(runs[m].map((r) => r.p95)), p95s: runs[m].map((r) => r.p95) }]))
    const r0 = runs.on[0]
    console.log(`[lab] frame time @ canvas ${r0.canvas.join('×')} (viewport ${r0.viewport.join('×')}, hw scaling ${r0.hardwareScaling}, ${r0.activeMeshes} meshes): ${JSON.stringify(summary)}`)
    expect(r0.canvas[0]).toBeGreaterThan(1400) // really @2×
    expect(summary.on.p95).toBeLessThanOrEqual(8)
    expect(summary.static.p95).toBeLessThanOrEqual(8)
  })
})

/* ------------------------------------------------------------------------------------------------ */
/* The Operator Lab                                                                                   */
/* ------------------------------------------------------------------------------------------------ */
const SCREENS = fileURLToPath(new URL('./__screens__/lab/', import.meta.url))

/** `__lab.labels()` (app/src/lab/labelBoxes.ts): visible projected labels and the furniture, page rects [x, y, w, h]. */
type Box = [number, number, number, number]
interface LabelBoxes {
  labels: { key: string; box: Box }[]
  furniture: { what: string; box: Box }[]
}
/** Every overlap on the stage: label × label and label × furniture (a passport, a readout line, the caption). */
async function labelClashes(page: Page): Promise<string[]> {
  const b = await page.evaluate(() => (window.__lab as unknown as { labels(): LabelBoxes }).labels())
  const hit = (p: Box, q: Box) => p[0] < q[0] + q[2] - 0.5 && p[0] + p[2] - 0.5 > q[0] && p[1] < q[1] + q[3] - 0.5 && p[1] + p[3] - 0.5 > q[1]
  const out: string[] = []
  b.labels.forEach((l, i) => {
    for (const m of b.labels.slice(i + 1)) if (hit(l.box, m.box)) out.push(`${l.key} × ${m.key}`)
    for (const f of b.furniture) if (hit(l.box, f.box)) out.push(`${l.key} × ${f.what}`)
  })
  return out
}
/** P review items 3 and 12: after the scene settles, no clash; the labels are really there. */
async function expectNoLabelClash(page: Page, state: string) {
  await expect.poll(() => labelClashes(page), { message: state, timeout: 5_000 }).toEqual([])
  const n = await page.evaluate(() => (window.__lab as unknown as { labels(): LabelBoxes }).labels().labels.length)
  expect(n, state).toBeGreaterThanOrEqual(8)
}
/** P review item 15: every no-wrap piece of a ket or vector readout sits on one line. */
async function expectNoMidAmplitudeWrap(page: Page, state: string) {
  const broken = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('.lab-stage .lab-nowrap, [data-readouts="paper"] .lab-nowrap')].filter((el) => el.getClientRects().length > 1).map((el) => el.textContent),
  )
  expect(broken, state).toEqual([])
}

async function openOperator(page: Page, query = '', fresh = false) {
  // a hash-only goto keeps the document (and the bench's store); `fresh` loads the page anew
  if (fresh) await page.goto('about:blank')
  await page.goto(`?measure#/lab/operator${query}`)
  await page.waitForFunction(() => window.__lab?.mounted === true && !!window.__lab.op, undefined, { timeout: 20_000 })
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  // the procedural room is rendered once and prefiltered (a few frames after mount)
  await expect.poll(async () => (await page.evaluate(() => window.__lab!.bench({ frames: 1 })))?.environment, { timeout: 10_000 }).toBe(true)
  // idle: the scene is ready (shaders, the prefiltered environment) and the loop has stopped
  await page.waitForFunction(
    async () => {
      const a = window.__lab!.framesDrawn
      await new Promise((r) => setTimeout(r, 300))
      return a > 0 && window.__lab!.framesDrawn === a
    },
    undefined,
    { timeout: 20_000, polling: 350 },
  )
}
/** Stage readouts of one view (DOM), key → text. */
const domReadouts = (page: Page, view: 'op' | 'state') =>
  page.evaluate(
    (v) => Object.fromEntries([...document.querySelectorAll<HTMLElement>(`.lab-stage .stage-readouts[data-view="${v}"] .stage-readout`)].map((el) => [el.dataset.key!, el.textContent!])),
    view,
  )
/** The DOM readouts equal the engine model's, view by view. */
async function expectReadoutsFromEngine(page: Page) {
  await expect
    .poll(async () => {
      const engine = await page.evaluate(() => window.__lab!.op!.readouts())
      return JSON.stringify([await domReadouts(page, 'op'), await domReadouts(page, 'state')]) === JSON.stringify([engine.op, engine.state])
    })
    .toBe(true)
}
function watchAll(page: Page, origin: string) {
  const foreign: string[] = []
  const warnings: string[] = []
  page.on('request', (r) => {
    const u = r.url()
    if (!u.startsWith('data:') && !u.startsWith('blob:') && new URL(u).origin !== origin) foreign.push(u)
  })
  page.on('console', (m) => {
    if (m.type() === 'warning') warnings.push(m.text())
  })
  return { foreign, warnings }
}

test.describe('Operator Lab', () => {
  test('#/lab/operator: 0 errors/warnings/CSP/other origins/trips; two linked views; readouts = engine; hand values', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    const w = watchAll(page, new URL(baseURL!).origin)
    await openOperator(page)
    await expect(page.locator('.lab-stage canvas.lab-canvas')).toHaveCount(1)
    await expect(page.locator('.lab-views')).toHaveAttribute('data-split', 'lr')
    await expect(page.locator('.lab-view[data-view="op"] .stage-passport')).toContainText('OPERATOR SPACE')
    await expect(page.locator('.lab-view[data-view="state"] .stage-passport')).toContainText('STATE SPACE')
    // default: S_x (hand values: eigenvalues ±ħ/2, eigenvectors |±x⟩), ψ₀ = |+z⟩, τ = π/2
    const op = await domReadouts(page, 'op')
    expect(op['lam+']).toBe('λ₊ = +0.5 ħ')
    expect(op['lam-']).toBe('λ₋ = −0.5 ħ')
    expect(op['vec0']).toBe('|λ₊⟩ = (1/√2, 1/√2)')
    await expectReadoutsFromEngine(page)
    // the passport opens the bench's fidelity note, one click away
    await page.locator('.lab-view[data-view="state"] .stage-passport').click()
    await expect(page.locator('.stage-drawer [data-fidelity="lab-op-global-phase"]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.stage-drawer')).toHaveCount(0)
    // the procedural room lights the PBR materials (prefiltered once; no file, no CDN)
    const b = (await page.evaluate(() => window.__lab!.bench({ frames: 2 })))!
    expect(b.environment).toBe(true)
    await page.waitForLoadState('networkidle')
    expect(await page.evaluate(() => window.__csp ?? [])).toEqual([])
    expect(w.foreign).toEqual([])
    expect(w.warnings).toEqual([])
    expect(await page.evaluate(() => window.__lab!.tripwire())).toEqual([])
    expect(errors).toEqual([])
  })

  test('drags: a real mouse drag of the a tip and a __lab drag of the bead set the DOM readouts to the engine values', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openOperator(page)
    const before = (await page.evaluate(() => window.__lab!.op!.state())).a
    const tip = (await page.evaluate(() => window.__lab!.handleScreen('tip')))!
    expect(tip).not.toBeNull()
    await page.mouse.move(tip[0], tip[1])
    await page.mouse.down()
    for (let i = 1; i <= 12; i++) await page.mouse.move(tip[0] - i * 5, tip[1] - i * 8)
    await page.mouse.up()
    const after = (await page.evaluate(() => window.__lab!.op!.state())).a
    expect(after).not.toEqual(before)
    // the drag moved the tip, not the camera: the tip's handle is now where the pointer let go
    await expect
      .poll(async () => {
        const t = (await page.evaluate(() => window.__lab!.handleScreen('tip')))!
        return Math.hypot(t[0] - (tip[0] - 60), t[1] - (tip[1] - 96))
      })
      .toBeLessThan(12)
    await expectReadoutsFromEngine(page)
    const len = Math.hypot(...after)
    const op = await domReadouts(page, 'op')
    // λ± = a₀ ± |a| with a₀ = 0 (the drag keeps a₀), two decimals; a dragged A is no longer the spin preset S_x, so
    // its readouts are plain numbers (P review item 7: no ħ after a drag)
    const two = (x: number) => x.toFixed(2).replace(/\.?0+$/, '')
    expect(op['lam+']).toBe(`λ₊ = +${two(len)}`)
    expect(op['lam-']).toBe(`λ₋ = −${two(len)}`)
    expect(Object.values(op).join(' | ')).not.toMatch(/ħ/)

    // ψ₀ with the mouse: from |+z⟩ down the front of the sphere; it leaves the named ket, the readouts follow
    const psi = (await page.evaluate(() => window.__lab!.handleScreen('psi0')))!
    await page.mouse.move(psi[0], psi[1])
    await page.mouse.down()
    for (let i = 1; i <= 10; i++) await page.mouse.move(psi[0] - i * 3, psi[1] + i * 9)
    await page.mouse.up()
    const p0 = (await page.evaluate(() => window.__lab!.op!.state())).psi0
    expect(p0.named).toBeNull()
    expect(p0.theta).toBeGreaterThan(0.3)
    await expectReadoutsFromEngine(page)
    expect((await domReadouts(page, 'state'))['psi0']).toMatch(/^ψ₀ at θ \d+°, φ −?\d+°$/)

    // the Try this: S_z from |+x⟩; the bead once round (the drag snaps onto the lap): home, and the ket is −|+x⟩
    await page.evaluate(() => window.__lab!.op!.setup('sz-lap'))
    const lap: [number, number, number][] = [
      [1, 0.01, 0],
      [0.7, 0.7, 0],
      [0, 1, 0],
      [-1, 0.01, 0],
      [-0.1, -1, 0],
      [1, -0.02, 0],
    ]
    await page.evaluate((pts) => window.__lab!.op!.drag('bead', pts), lap)
    expect((await page.evaluate(() => window.__lab!.op!.state())).tau).toBeCloseTo(2 * Math.PI, 12)
    await expectReadoutsFromEngine(page)
    let st = await domReadouts(page, 'state')
    expect(st['after']).toBe('after: (−1/√2, −1/√2)')
    expect(st['home']).toBe('same point as ψ₀ · ket = −ψ₀')
    expect(st['turn']).toBe('turn 360° (1 lap) about â')
    // round again: two laps, the ket is back
    const again: [number, number, number][] = [
      [0.02, 1, 0],
      [-1, 0.02, 0],
      [0, -1, 0],
      [1, 0.01, 0],
    ]
    await page.evaluate((pts) => window.__lab!.op!.drag('bead', pts), again)
    expect((await page.evaluate(() => window.__lab!.op!.state())).tau).toBeCloseTo(4 * Math.PI, 12)
    await expectReadoutsFromEngine(page)
    st = await domReadouts(page, 'state')
    expect(st['home']).toBe('same point as ψ₀ · ket = +ψ₀')
    expect(errors).toEqual([])
  })

  test('keyboard twin: the bead twin nudges τ by a 5° turn (Shift 1°); readouts follow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await openOperator(page, '?preset=sz-lap')
    const twin = page.getByRole('slider', { name: 'Bead U(τ)ψ₀ on its orbit' })
    await twin.focus()
    await page.keyboard.press('ArrowRight')
    expect((await page.evaluate(() => window.__lab!.op!.state())).tau).toBeCloseTo((5 * Math.PI) / 180, 12)
    await page.keyboard.press('Shift+ArrowRight')
    expect((await page.evaluate(() => window.__lab!.op!.state())).tau).toBeCloseTo((6 * Math.PI) / 180, 12)
    await expectReadoutsFromEngine(page)
    await expect(page.locator('.lab-stage .stage-readout[data-key="turn"]')).toHaveText('turn 6° about â')
  })

  test('preset allowlist: an allowlisted id sets its setup; crafted queries set nothing', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openOperator(page, '?preset=commute-xy')
    await expect(page.locator('.lab-stage .stage-readout[data-key="comm"]')).toHaveText('[A,B]/2i: a×b = (0, 0, 0.25) ħ²')
    await expect(page.locator('[data-preset-note]')).toContainText('Commutator mode')
    const crafted = ['?preset=__proto__&a0=3&tau=9', '?preset=constructor', '?a0=3&preset=evil', '?preset=%7B%22a0%22%3A3%7D', '?preset=SZ-LAP', '?preset=sx%26a0%3D3']
    // navigating within the page to a crafted query changes nothing (the commutator setup stays as it was)
    const kept = await page.evaluate(() => window.__lab!.op!.state())
    for (const q of crafted) {
      await page.evaluate((h) => (location.hash = h), `#/lab/operator${q}`)
      await page.waitForTimeout(150)
      expect(await page.evaluate(() => window.__lab!.op!.state()), q).toEqual(kept)
    }
    // a fresh load with a crafted query opens the default bench: nothing from the query became state
    const defaults = { preset: 'sx', a0: 0, a: [0.5, 0, 0], B: null, source: 'params' }
    for (const q of crafted) {
      await openOperator(page, q, true)
      const s = await page.evaluate(() => window.__lab!.op!.state())
      expect({ preset: s.preset, a0: s.a0, a: s.a, B: s.B, source: s.source }, q).toEqual(defaults)
      expect(s.tau, q).toBeCloseTo(Math.PI / 2, 12)
      await expect(page.locator('[data-preset-note]'), q).toHaveCount(0)
    }
    expect(errors).toEqual([])
  })

  test('800 px: readouts in the page, no canvas, no Babylon chunk', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 })
    const errors = collectErrors(page)
    const urls: string[] = []
    page.on('request', (r) => urls.push(r.url()))
    await page.goto('?measure#/lab/operator')
    await expect(page.locator('.lab-paper h1')).toHaveText('Operator Lab')
    await expect(page.locator('[data-readouts="paper"] [data-key="lam+"]')).toHaveText('λ₊ = +0.5 ħ')
    await page.getByRole('button', { name: 'Preset S_z' }).click()
    await expect(page.locator('[data-readouts="paper"] [data-key="vec0"]')).toHaveText('|λ₊⟩ = (1, 0)')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(300)
    expect(await page.locator('canvas').count()).toBe(0)
    expect(LAB_CHUNKS.length).toBeGreaterThan(0)
    expect(urls.filter((u) => LAB_CHUNKS.some((c) => u.endsWith(c)) || /mountLab/.test(u))).toEqual([])
    expect(await page.evaluate(() => [window.__lab!.mounts, window.__lab!.contexts])).toEqual([0, 0])
    expect(errors).toEqual([])
  })

  test('leaving the Operator Lab releases its engine and context', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await openOperator(page)
    expect(await page.evaluate(() => [window.__lab!.live, window.__lab!.engines()])).toEqual([1, 1])
    await page.evaluate(() => (location.hash = '#/lab'))
    await page.waitForFunction(() => window.__lab!.mounted && window.__lab!.mounts === 2, undefined, { timeout: 20_000 })
    expect(await page.evaluate(() => [window.__lab!.live, window.__lab!.engines(), window.__lab!.disposals])).toEqual([1, 1, 1])
    await page.evaluate(() => (location.hash = '#/help'))
    await page.waitForFunction(() => window.__lab!.mounted === false)
    expect(await page.evaluate(() => [window.__lab!.live, window.__lab!.engines()])).toEqual([0, 0])
  })

  test.describe('frame time while dragging (1440×900 @2×)', () => {
    test.use({ deviceScaleFactor: 2 })
    test('p95 of 120 frames ≤ 8 ms while the tip and the bead are dragged (store → engine model → scene → draw)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await openOperator(page, '?preset=sz-lap')
      const runs: Record<'tip' | 'bead' | 'orbit', number[]> = { tip: [], bead: [], orbit: [] }
      let last: LabBenchResult | null = null
      for (let round = 0; round < 3; round++) {
        await page.evaluate(() => window.__lab!.op!.setup('sz-lap'))
        runs.bead.push((await page.evaluate(() => window.__lab!.bench({ frames: 120, drag: 'bead' })))!.p95)
        last = await page.evaluate(() => window.__lab!.bench({ frames: 120, drag: 'tip' }))
        runs.tip.push(last!.p95)
        runs.orbit.push((await page.evaluate(() => window.__lab!.bench({ frames: 120 })))!.p95)
      }
      const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
      const summary = { tip: median(runs.tip), bead: median(runs.bead), orbit: median(runs.orbit), runs }
      console.log(`[lab] operator frame p95 @ canvas ${last!.canvas.join('×')} (${last!.activeMeshes} meshes, env ${last!.environment}): ${JSON.stringify(summary)}`)
      expect(last!.canvas[0]).toBeGreaterThan(1400) // really @2×
      expect(summary.tip).toBeLessThanOrEqual(8)
      expect(summary.bead).toBeLessThanOrEqual(8)
      expect(summary.orbit).toBeLessThanOrEqual(8)
    })
  })

  test('screenshots for visual QA (1440×900, 1024×768): default, dragged, commutator, non-Hermitian', async ({ page }) => {
    mkdirSync(SCREENS, { recursive: true })
    const errors = collectErrors(page)
    for (const [w, h] of [
      [1440, 900],
      [1024, 768],
    ] as const) {
      await page.setViewportSize({ width: w, height: h })
      await openOperator(page, '', true)
      await expect(page.locator('.lab-views')).toHaveAttribute('data-split', w === 1440 ? 'lr' : 'tb')
      await expectNoLabelClash(page, `${w} default`)
      await page.screenshot({ path: `${SCREENS}operator-${w}x${h}-default.png` })
      const tip: [number, number, number][] = [
        [0.5, 0, 0],
        [0.4, -0.5, 0.7],
        [0.55, -0.55, 0.65],
      ]
      const bead: [number, number, number][] = [
        [0, -0.3, 0.9],
        [0.2, -0.9, 0.2],
        [0.1, -0.5, -0.8],
      ]
      await page.evaluate((pts) => window.__lab!.op!.drag('tip', pts), tip)
      await page.evaluate((pts) => window.__lab!.op!.drag('bead', pts), bead)
      await page.waitForTimeout(400)
      await expectNoLabelClash(page, `${w} dragged`)
      await expectNoMidAmplitudeWrap(page, `${w} dragged`)
      await page.screenshot({ path: `${SCREENS}operator-${w}x${h}-dragged.png` })
      await page.evaluate(() => window.__lab!.op!.setup('commute-xy'))
      await page.waitForTimeout(400)
      await expectNoLabelClash(page, `${w} commutator`)
      await page.screenshot({ path: `${SCREENS}operator-${w}x${h}-commutator.png` })
      await page.evaluate(() => window.__lab!.op!.setup('non-hermitian'))
      await page.waitForTimeout(400)
      await expectNoLabelClash(page, `${w} non-Hermitian`)
      await expectNoMidAmplitudeWrap(page, `${w} non-Hermitian`)
      await page.screenshot({ path: `${SCREENS}operator-${w}x${h}-nonhermitian.png` })
    }
    expect(errors).toEqual([])
  })

  test('P review item 1: typed Hermitian matrices up to 10⁶ never crash (τ-sweep, a crafted 2+9e-10i); item 7: no ħ', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openOperator(page, '', true)
    const cell = (r: number, k: number) => page.getByLabel(`Matrix entry row ${r}, column ${k}`)
    const tau = page.getByLabel('tau, typed (for example 2pi)')
    for (const cells of [
      ['1e6', '1e6', '1e6', '-1e6'],
      ['1', '2+9e-10i', '2', '-1'],
    ]) {
      await cell(1, 1).fill(cells[0])
      await cell(1, 2).fill(cells[1])
      await cell(2, 1).fill(cells[2])
      await cell(2, 2).fill(cells[3])
      await expect(page.locator('.lab-stage .stage-readout[data-key="class"]')).toHaveText(/^Hermitian/)
      // the review's τ = π/2 and a sweep over [0, 4π] (about a third of these threw before the fix)
      for (const v of ['pi/2', ...Array.from({ length: 24 }, (_, i) => `${((i + 1) * 4 * Math.PI) / 25}`)]) {
        await tau.fill(v)
        await expect(page.locator('.lab-stage .stage-readout[data-key="mean"]')).toHaveText(/^⟨A⟩ = /)
      }
      await expect(page.locator('.lab-paper h1')).toHaveText('Operator Lab')
      await expectReadoutsFromEngine(page)
      // a typed operator is a plain number (item 7)
      const all = [...Object.values(await domReadouts(page, 'op')), ...Object.values(await domReadouts(page, 'state'))].join(' | ')
      expect(all).not.toMatch(/ħ/)
    }
    expect(errors).toEqual([])
  })

  test('P review item 6: Predict first hides the turn angle, "eigenstate", the basis radios and the non-Hermitian lines', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openOperator(page, '?preset=sz', true)
    const radios = page.locator('input[name="op-basis"]')
    const bead = page.getByRole('slider', { name: 'Bead U(τ)ψ₀ on its orbit' })
    // S_z from |+z⟩ (an eigenstate), results shown: the twin says so, the radios work
    await expect(bead).toContainText('ψ₀ is an eigenstate: only the phase changes')
    await page.getByRole('checkbox', { name: /Hide the results/ }).check()
    for (let i = 0; i < 3; i++) await expect(radios.nth(i)).toBeDisabled()
    await expect(bead).toHaveAttribute('aria-valuetext', 'τ = π/2')
    await expect(bead).toContainText('hidden until you check')
    await expect(bead).not.toContainText('eigenstate')
    // a typed non-Hermitian matrix, still hidden: no "not Hermitian" / "not unitary" lines, the twin says nothing
    await page.evaluate(() => window.__lab!.op!.setup('non-hermitian'))
    await expect(page.locator('.lab-stage .stage-readout[data-key="pending"]')).toBeVisible()
    await expect(page.locator('.lab-stage')).not.toContainText(/not Hermitian|not unitary|imaginary/)
    await expect(bead).toContainText('hidden until you check')
    expect(await bead.getAttribute('aria-valuetext')).not.toMatch(/turn/)
    // check the prediction: everything comes back, and the twin says why nothing turns (item 2)
    await page.getByLabel('your lambda plus').fill('1')
    await page.getByLabel('your lambda minus').fill('-1')
    await page.getByRole('button', { name: 'Check', exact: true }).click()
    await expect(page.locator('.lab-stage .stage-readout[data-key="nonherm"]')).toBeVisible()
    await expect(page.locator('.lab-stage .stage-readout[data-key="normal"]')).toHaveText('eigenvectors not orthogonal (A not normal)')
    await expect(bead).toContainText('no turn: A is not Hermitian')
    await expect(bead).not.toContainText('eigenstate')
    for (let i = 0; i < 3; i++) await expect(radios.nth(i)).toBeEnabled()
    await expectReadoutsFromEngine(page)
    expect(errors).toEqual([])
  })
})

/* ------------------------------------------------------------------------------------------------ */
/* The Grapher                                                                                        */
/* ------------------------------------------------------------------------------------------------ */
/** `__lab.grapher` (app/src/lab/instrument.ts GrapherLabApi); e2e/helpers.ts declares only the older hooks. */
interface GrapherApi {
  state(): { mode: string; a: number; cursor: { surface: [number, number]; curve: number; bloch: number }; preset: string | null; text: Record<string, string>; res: Record<string, number> }
  readouts(): Record<string, string>
  setup(id: string): void
  drag(points: [number, number, number][]): void
  sample(): { ms: number; samples: number; gaps: number; finite: boolean; mode: string }
  flush(): void
}
type LabWithGrapher = { grapher: GrapherApi | null; bench(o: { frames?: number; drag?: string }): Promise<LabBenchResult | null> }

async function openGrapher(page: Page, query = '', fresh = false) {
  if (fresh) await page.goto('about:blank')
  await page.goto(`?measure#/lab/grapher${query}`)
  await page.waitForFunction(() => window.__lab?.mounted === true && !!(window.__lab as unknown as LabWithGrapher).grapher, undefined, { timeout: 20_000 })
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await expect.poll(async () => (await page.evaluate(() => window.__lab!.bench({ frames: 1 })))?.environment, { timeout: 10_000 }).toBe(true)
  await page.waitForFunction(
    async () => {
      const a = window.__lab!.framesDrawn
      await new Promise((r) => setTimeout(r, 300))
      return a > 0 && window.__lab!.framesDrawn === a
    },
    undefined,
    { timeout: 20_000, polling: 350 },
  )
}
const grDom = (page: Page) =>
  page.evaluate(() => {
    const on = [...document.querySelectorAll<HTMLElement>('.lab-stage .stage-readouts .stage-readout')]
    const paper = [...document.querySelectorAll<HTMLElement>('[data-readouts="paper"] li')]
    return Object.fromEntries((on.length ? on : paper).map((el) => [el.dataset.key!, el.textContent!]))
  })
async function expectGrapherReadoutsFromEngine(page: Page) {
  await expect
    .poll(async () => JSON.stringify(await grDom(page)) === JSON.stringify(await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.readouts())))
    .toBe(true)
}
async function expectNoGrapherClash(page: Page, state: string, min: number) {
  await expect.poll(() => labelClashes(page), { message: state, timeout: 5_000 }).toEqual([])
  const n = await page.evaluate(() => (window.__lab as unknown as { labels(): LabelBoxes }).labels().labels.length)
  expect(n, state).toBeGreaterThanOrEqual(min)
}
const grSample = (page: Page) => page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.sample())

test.describe('Grapher', () => {
  test('#/lab/grapher: 0 errors/warnings/CSP/other origins/trips; passport; readouts = engine; the Try this readout; finite view', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    const w = watchAll(page, new URL(baseURL!).origin)
    await openGrapher(page)
    await expect(page.locator('.lab-stage canvas.lab-canvas')).toHaveCount(1)
    await expect(page.locator('.lab-stage .stage-passport')).toContainText('GRAPH SPACE ℝ³ · no units')
    await expect(page.locator('.lab-stage .stage-passport')).toContainText('not a place · x, y are your inputs')
    const r = await grDom(page)
    expect(r['touch']).toBe('f = g at 445 of 4225 samples')
    expect(r['below']).toBe('f < g at no sample')
    expect(r['f-range']).toBe('f from 0 to 0.25')
    expect(r['g-range']).toBe('g from 0 to 0.25')
    expect(r['gaps']).toBe('gaps: f 0, g 0 of 4225 samples')
    expect(Object.values(r).join(' | ')).not.toMatch(/ħ/)
    await expectGrapherReadoutsFromEngine(page)
    expect((await grSample(page)).finite).toBe(true)
    // the axes carry the student's names
    await expect(page.locator('.lab-label[data-label="ax-x"]')).toHaveText('x ∈ [0, 3.142]')
    await expect(page.locator('.lab-label[data-label="ax-z"]')).toHaveText('f, g ∈ [0, 0.25]')
    // the fidelity note, one click away
    await page.locator('.lab-stage .stage-passport').click()
    await expect(page.locator('.stage-drawer [data-fidelity="lab-gr-fit"]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.stage-drawer')).toHaveCount(0)
    // the Bloch path: the other passport, spin.ts readouts at the cursor (equator, t = π/2: |+y⟩)
    await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.setup('equator'))
    await expect(page.locator('.lab-stage .stage-passport')).toContainText('STATE SPACE · Bloch sphere')
    await expect(page.locator('.lab-stage .stage-readout[data-key="r"]')).toHaveText('r = (0, 1, 0)')
    await expect(page.locator('.lab-stage .stage-readout[data-key="px"]')).toHaveText('P(+x) = 0.5')
    await expectGrapherReadoutsFromEngine(page)
    await page.waitForLoadState('networkidle')
    expect(await page.evaluate(() => window.__csp ?? [])).toEqual([])
    expect(w.foreign).toEqual([])
    expect(w.warnings).toEqual([])
    expect(await page.evaluate(() => window.__lab!.tripwire())).toEqual([])
    expect(errors).toEqual([])
  })

  test('a malformed expression shows the caret and a plain reason; the picture keeps the last graph; a reversed range is refused', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openGrapher(page, '', true)
    const before = await grDom(page)
    const f = page.locator('input[data-field="f"]')
    await f.fill('sin(x cos y')
    const err = page.locator('[data-error="f"]')
    await expect(err).toBeVisible()
    await expect(f).toHaveAttribute('aria-invalid', 'true')
    await expect(err.locator('p')).toHaveText('Character 12: The expression stops too early: something is missing at the end. The picture keeps the last graph that read correctly.')
    // the caret sits under the character the reason names (column 11, 0-based)
    expect(await err.locator('pre').textContent()).toBe('sin(x cos y\n           ^')
    // a product typed as one name: the reason suggests the split
    await f.fill('sin xy')
    await expect(err.locator('p')).toContainText('“xy” is not a name. For a product, put a space or * between the names: “x y”.')
    expect(await err.locator('pre').textContent()).toBe('sin xy\n    ^')
    await page.waitForTimeout(200)
    expect(await grDom(page)).toEqual(before)
    // S-lab §5 item 4: typed text is echoed as plain text (never TeX, never a link)
    await f.fill('\\href{javascript:alert(1)}{x}')
    await expect(err.locator('p')).toContainText('The character “\\” is not allowed here.')
    await expect(page.locator('a[href^="javascript"]')).toHaveCount(0)
    expect(await err.locator('pre').textContent()).toBe('\\href{javascript:alert(1)}{x}\n^')
    // a reversed range
    await page.locator('input[data-field="x1"]').fill('-1')
    await expect(page.locator('[data-error="x1"] p')).toContainText('The end is before the start: swap them.')
    await page.locator('input[data-field="x1"]').fill('pi')
    await f.fill('sin x cos y')
    await expect(page.locator('[data-error]')).toHaveCount(0)
    await expect(page.locator('.lab-stage .stage-readout[data-key="f-range"]')).toHaveText(/^f from −/)
    await expectGrapherReadoutsFromEngine(page)
    expect(errors).toEqual([])
  })

  test('a pathological expression at 128² does not freeze the tab (re-sample time, longest task)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openGrapher(page, '', true)
    await page.evaluate(() => {
      const w = window as unknown as { __long: number[] }
      w.__long = []
      new PerformanceObserver((l) => l.getEntries().forEach((e) => w.__long.push(e.duration))).observe({ type: 'longtask', buffered: false })
    })
    // 128 × 128 samples per layer
    const res = page.getByRole('slider', { name: 'samples per side' })
    await res.focus()
    await page.keyboard.press('End')
    await expect.poll(async () => (await grSample(page)).samples).toBe(128 * 128)
    // the heaviest the limits allow: 128 tokens of nested functions on both layers (200 characters each at most)
    const heavy = 'exp(sin(cos(x y+a)))*tanh(x-y)+sqrt(abs(sin(x^3-y)))/cosh(y)+atan(exp(cos(x-y)))-ln(abs(x y)+1)+asin(tanh(x))*acos(tanh(y))+sinh(tan(x y))'
    expect(heavy.length).toBeLessThanOrEqual(200)
    await page.locator('input[data-field="f"]').fill(heavy)
    // the same on the wire layer: every sample pair is then within 10⁻⁶, so the touch check re-evaluates all of them
    await page.locator('input[data-field="g"]').fill(heavy)
    await expect(page.locator('[data-error]')).toHaveCount(0)
    await expect(page.locator('.lab-stage .stage-readout[data-key="touch"]')).toHaveText(/^f = g at \d+ of \d+ samples$/)
    await page.waitForTimeout(400)
    // and slide a (each change is a full re-sample, throttled): the tab stays responsive
    const aSlider = page.getByRole('slider', { name: 'parameter a' })
    await aSlider.focus()
    for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(400)
    const s = await grSample(page)
    const long = await page.evaluate(() => (window as unknown as { __long: number[] }).__long)
    // a rAF round trip measures whether the page still paints
    const raf = await page.evaluate(() => new Promise<number>((r) => { const t = performance.now(); requestAnimationFrame(() => r(performance.now() - t)) }))
    console.log(`[lab] grapher pathological re-sample: ${s.ms.toFixed(1)} ms for 2 × ${s.samples} samples, gaps ${s.gaps}, longest task ${Math.max(0, ...long).toFixed(0)} ms (${long.length} long tasks), rAF ${raf.toFixed(1)} ms`)
    expect(s.samples).toBe(128 * 128)
    expect(s.finite).toBe(true)
    expect(s.ms).toBeLessThan(100)
    expect(Math.max(0, ...long)).toBeLessThan(150)
    expect(errors).toEqual([])
  })

  test('the mouse drags the cursor, the keyboard twin nudges it; readouts follow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openGrapher(page, '', true)
    const api = () => page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.state())
    const c0 = (await api()).cursor.surface
    const at = (await page.evaluate(() => window.__lab!.handleScreen('cursor')))!
    expect(at).not.toBeNull()
    await page.mouse.move(at[0], at[1])
    await page.mouse.down()
    for (let i = 1; i <= 10; i++) await page.mouse.move(at[0] + i * 6, at[1] + i * 3)
    await page.mouse.up()
    const c1 = (await api()).cursor.surface
    expect(c1).not.toEqual(c0)
    await expectGrapherReadoutsFromEngine(page)
    // keyboard: → moves x by one sample (1/64 of the range on the 65 × 65 preset)
    await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.setup('uncertainty'))
    const twin = page.getByRole('group', { name: 'Cursor', exact: true })
    await twin.focus()
    await page.keyboard.press('ArrowRight')
    expect((await api()).cursor.surface[0]).toBeCloseTo(0.25 + 1 / 64, 12)
    await expect(page.locator('.lab-stage .stage-readout[data-key="cursor"]')).toHaveText(`x = ${Number((Math.PI * (0.25 + 1 / 64)).toPrecision(4))}, y = 0.7854`)
    // the curve: the cursor sits on samples; the twin is a slider in t
    await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.setup('helix'))
    const t0 = (await api()).cursor.curve
    await page.getByRole('slider', { name: 'Cursor', exact: true }).focus()
    await page.keyboard.press('ArrowRight')
    // off the grid (0.25 · 399 = 99.75), a step lands on the next sample: 100/399
    expect((await api()).cursor.curve).toBeCloseTo(Math.ceil(t0 * 399) / 399, 12)
    await expectGrapherReadoutsFromEngine(page)
    expect(errors).toEqual([])
  })

  test('preset allowlist: an allowlisted id sets its preset; crafted queries set nothing', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openGrapher(page, '?preset=spiral', true)
    await expect(page.locator('[data-preset-note]')).toContainText('A spiral from')
    expect((await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.state())).mode).toBe('bloch')
    for (const q of ['?preset=__proto__&a=3', '?preset=constructor', '?a=3&preset=evil', '?preset=%7B%22a%22%3A3%7D', '?preset=SPIRAL', '?preset=helix%26a%3D3']) {
      await openGrapher(page, q, true)
      const s = await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.state())
      expect({ mode: s.mode, a: s.a, preset: s.preset }, q).toEqual({ mode: 'surface', a: 0, preset: 'uncertainty' })
      await expect(page.locator('[data-preset-note]'), q).toHaveCount(0)
    }
    expect(errors).toEqual([])
  })

  test('800 px: readouts and an SVG outline in the page, no canvas, no Babylon chunk', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 })
    const errors = collectErrors(page)
    const urls: string[] = []
    page.on('request', (r) => urls.push(r.url()))
    await page.goto('?measure#/lab/grapher')
    await expect(page.locator('.lab-paper h1')).toHaveText('Grapher')
    await expect(page.locator('[data-readouts="paper"] [data-key="touch"]')).toHaveText('f = g at 445 of 4225 samples')
    expect(await page.locator('.gr-svg path').count()).toBeGreaterThan(20)
    await page.getByRole('radio', { name: 'Bloch path' }).check()
    await expect(page.locator('[data-readouts="paper"] [data-key="pz"]')).toHaveText('P(+z) = 0.5')
    expect(await page.locator('.gr-svg path').count()).toBeGreaterThanOrEqual(3)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(300)
    expect(await page.locator('canvas').count()).toBe(0)
    expect(urls.filter((u) => LAB_CHUNKS.some((c) => u.endsWith(c)) || /mountLab/.test(u))).toEqual([])
    expect(await page.evaluate(() => [window.__lab!.mounts, window.__lab!.contexts])).toEqual([0, 0])
    expect(errors).toEqual([])
  })

  test.describe('frame time (1440×900 @2×)', () => {
    test.use({ deviceScaleFactor: 2 })
    test('p95 ≤ 8 ms orbiting a 128² surface pair and dragging the cursor; a full re-sample frame reported', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await openGrapher(page, '', true)
      const res = page.getByRole('slider', { name: 'samples per side' })
      await res.focus()
      await page.keyboard.press('End')
      await expect.poll(async () => (await grSample(page)).samples).toBe(128 * 128)
      await page.waitForTimeout(300)
      const runs: Record<'orbit' | 'cursor' | 'resample', number[]> = { orbit: [], cursor: [], resample: [] }
      let last: LabBenchResult | null = null
      for (let round = 0; round < 3; round++) {
        last = (await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).bench({ frames: 120 })))!
        runs.orbit.push(last.p95)
        runs.cursor.push((await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).bench({ frames: 120, drag: 'cursor' })))!.p95)
        runs.resample.push((await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).bench({ frames: 30, drag: 'a' })))!.p95)
      }
      const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
      const summary = { orbit: median(runs.orbit), cursor: median(runs.cursor), resample: median(runs.resample), runs }
      console.log(`[lab] grapher frame p95 @ canvas ${last!.canvas.join('×')} (${last!.activeMeshes} meshes, 2 × 128² samples): ${JSON.stringify(summary)}`)
      expect(last!.canvas[0]).toBeGreaterThan(1400)
      expect(summary.orbit).toBeLessThanOrEqual(8)
      expect(summary.cursor).toBeLessThanOrEqual(8)
      // the preset's own grid (65²): a full re-sample frame within D-lab §6's 16 ms
      await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.setup('uncertainty'))
      await page.waitForTimeout(300)
      const pre = (await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).bench({ frames: 30, drag: 'a' })))!.p95
      console.log(`[lab] grapher re-sample frame p95 at the preset's 65² (both layers): ${pre} ms`)
      expect(pre).toBeLessThanOrEqual(16)
    })
  })

  test('screenshots for visual QA (1440×900, 1024×768): surface preset, curve, Bloch path, an error; no label clash', async ({ page }) => {
    mkdirSync(SCREENS, { recursive: true })
    const errors = collectErrors(page)
    for (const [w, h] of [
      [1440, 900],
      [1024, 768],
    ] as const) {
      await page.setViewportSize({ width: w, height: h })
      await openGrapher(page, '', true)
      await page.screenshot({ path: `${SCREENS}grapher-${w}x${h}-surface.png` })
      await expectNoGrapherClash(page, `${w} surface`, 3)
      expect((await grSample(page)).finite).toBe(true)
      await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.setup('helix'))
      await page.waitForTimeout(400)
      await page.screenshot({ path: `${SCREENS}grapher-${w}x${h}-curve.png` })
      await expectNoGrapherClash(page, `${w} curve`, 3)
      await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.setup('spiral'))
      await page.waitForTimeout(400)
      await page.screenshot({ path: `${SCREENS}grapher-${w}x${h}-bloch.png` })
      await expectNoGrapherClash(page, `${w} Bloch path`, 6)
      await page.evaluate(() => (window.__lab as unknown as LabWithGrapher).grapher!.setup('saddle'))
      await page.locator('input[data-field="f"]').fill('x^2 - y^^2')
      await expect(page.locator('[data-error="f"]')).toBeVisible()
      await page.locator('[data-error="f"]').scrollIntoViewIfNeeded()
      await page.waitForTimeout(400)
      await page.screenshot({ path: `${SCREENS}grapher-${w}x${h}-error.png` })
      await expectNoGrapherClash(page, `${w} error`, 3)
    }
    expect(errors).toEqual([])
  })
})
