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
 *     fidelity note; the DOM readouts equal the model's (`__lab.grapher.readouts()`); the Try this does not answer
 *     itself at first load (no "445", no "at no sample" anywhere on the page: P review item 9), and once "Compare the
 *     layers" is ticked it reads f = g exactly at 445 samples, crossing in no cell; every number is finite.
 *   - a malformed expression shows the caret under the right character and a plain reason; the picture keeps the last
 *     graph that read; a reversed range is refused; fixing the text clears the error; "2 3" and "sin 2x" are refused
 *     with the fix named (P review item 1); the error is announced politely once typing pauses, never as an alert on
 *     every keystroke (item 12).
 *   - a pathological expression at 128² on both layers does not freeze the tab: the re-sample time and the longest task.
 *   - frame p95 ≤ 8 ms at 1440×900 @2× while orbiting a 128² surface pair and while dragging the cursor; the cost of a
 *     full re-sample frame is reported.
 *   - a real mouse drag and the keyboard twin move the cursor; the preset allowlist, and a deep link's note goes
 *     away once another preset is chosen (item 8); 800 px: readouts and an SVG outline in the page, no canvas, no
 *     Babylon chunk.
 *   - screenshots (1440×900, 1024×768: surface preset, curve, Bloch path, an error) with no label clash.
 * The Stern–Gerlach bench (#/lab/sg, D-lab §2.1):
 *   - 0 console errors or warnings, 0 CSP violations, 0 other origins, 0 trips; the PHYSICAL SPACE passport and its
 *     fidelity note; the hardware read from our own lab.glb (8 meshes); the DOM readouts equal the model's
 *     (`__lab.sg.readouts()`); a real Fire 1 000 click lands the counts an independent twin of the engine's sampling
 *     gives for the volley's seed (mulberry32 and the Born rule on Bloch vectors, written here): Born 25.0 %, and the
 *     counted line expects ± 1.4 pt at N = 1 000; reduced motion lands a volley at once.
 *   - in the scene: a real mouse drag of a knob turns its magnet about the beam (15° snaps), taps on the pads keep the
 *     other beam, add and remove a magnet; the knob's keyboard twin steps 15° (Shift 1°); readouts follow.
 *   - the preset allowlist; 800 px: readouts, dials and the plate's counts in the page, no canvas, no Babylon chunk.
 *   - frame p95 ≤ 8 ms at 1440×900 @2× while a 10 000-atom volley flies (2 000 drawn with trails, marks landing).
 *   - screenshots (1440×900, 1024×768: default, z → x → z fired, four magnets, a sealed |+y⟩ source) with no label clash.
 *   - the P review (docs/roles/audits/P-sg-review.md), what only the page shows: #3 the plate inset draws only the
 *     plate, even when a short chain runs low; #5 the protractor ring and the magnets measured in the rendered frame;
 *     #4 the < 900 px plate picture turns with the last magnet; #12 the pads' DOM twins are ≥ 24 px. The model's items
 *     are src/lab/benches/sg/review.test.ts.
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
    // P review item 9: the bench opens on the Try this, and nothing on the page answers it yet
    const first = await grDom(page)
    expect(first['touch']).toBeUndefined()
    expect(first['below']).toBeUndefined()
    for (const text of await page.evaluate(() => [document.body.innerText, document.body.textContent ?? ''])) {
      expect(text).not.toContain('445')
      expect(text).not.toContain('at no sample')
    }
    await page.getByRole('checkbox', { name: /Compare the layers/ }).check()
    await expect(page.locator('.lab-stage .stage-readout[data-key="touch"]')).toHaveText('f = g exactly at 445 samples')
    const r = await grDom(page)
    expect(r['cross']).toBe('the layers cross in no cell')
    expect(r['below']).toBe('f < g at no sample')
    expect(r['f-range']).toBe('f from 0 to 0.25 (sampled)')
    expect(r['g-range']).toBe('g from 0 to 0.25 (sampled)')
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
    // P review item 12: no alert role (it re-announced on every keystroke); a polite region speaks once typing pauses
    await expect(err).not.toHaveAttribute('role', 'alert')
    await expect(page.locator('[role="alert"]')).toHaveCount(0)
    await expect(err.locator('[data-announce="f"]')).toHaveAttribute('aria-live', 'polite')
    await expect(err.locator('[data-announce="f"]')).toHaveText(/^Character 12: The expression stops too early/)
    // P review item 1: two numbers side by side, and a function's bare number before a product, are refused
    await f.fill('x^2 3')
    await expect(err.locator('p')).toContainText('Character 5: Two numbers side by side: put · or * between 2 and 3')
    expect(await err.locator('pre').textContent()).toBe('x^2 3\n    ^')
    await f.fill('sin 2x')
    await expect(err.locator('p')).toContainText('write sin(2x) or sin(2)·x.')
    expect(await err.locator('pre').textContent()).toBe('sin 2x\n     ^')
    // the help's examples are the ones the parser was checked on (review.test.ts)
    await expect(page.locator('[data-help] code')).toContainText(['2pi', '2 x', 'x y', 'sin x cos y', '2 3'])
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
    await page.getByRole('checkbox', { name: /Compare the layers/ }).check()
    await expect(page.locator('.lab-stage .stage-readout[data-key="touch"]')).toHaveText(/^f = g exactly at (no sample|\d+ samples?)$/)
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
    // P review item 8: another preset takes the deep link's note away (it sat above a helix)
    await page.getByRole('button', { name: 'Helix', exact: true }).click()
    await expect(page.locator('[data-preset-note]')).toHaveCount(0)
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
    await expect(page.locator('[data-readouts="paper"] [data-key="f-range"]')).toHaveText('f from 0 to 0.25 (sampled)')
    expect(await page.evaluate(() => document.body.textContent)).not.toContain('445')
    await page.getByRole('checkbox', { name: /Compare the layers/ }).check()
    await expect(page.locator('[data-readouts="paper"] [data-key="touch"]')).toHaveText('f = g exactly at 445 samples')
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
      // P review item 10: the bead sits on |−x⟩ (t = π/2): that pole's label gives way and the state's label names it
      await expect(page.locator('.lab-label[data-label="psi"]')).toContainText('ψ(t) = ')
      await expect(page.locator('.lab-label[data-label="pole-x"]')).toHaveCount(0)
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

/* ------------------------------------------------------------------------------------------------ */
/* The Stern–Gerlach bench                                                                            */
/* ------------------------------------------------------------------------------------------------ */
type Sign = '+' | '-'
/** `__lab.sg` (app/src/lab/instrument.ts SgLabApi). */
interface SgState {
  source: string
  tilts: number[]
  keep: Sign[]
  preset: string | null
  counts: { n: number; plus: number; minus: number; blocked: number[] }
  flight: unknown
  volleys: number
  last: { n: number; seed: number } | null
  marks: number
  landed: number
  flying: boolean
  hardware: number
}
interface SgApi {
  state(): SgState
  readouts(): Record<string, string>
  setup(id: string): void
  fire(n: number): void
  land(): void
  clear(): void
  drag(handle: string, points: [number, number, number][]): void
  pick(handle: string): void
  knobPoint(k: number, deg: number): [number, number, number] | null
  modulePoint(k: number, p: [number, number, number]): [number, number, number] | null
}
type LabWithSg = {
  sg: SgApi | null
  bench(o: { frames?: number; drag?: string }): Promise<LabBenchResult | null>
  handleScreen(id: string): [number, number] | null
  project(p: [number, number, number]): [number, number] | null
  seen(view: string): string[]
  firstHit(p: [number, number, number], view?: string): string | null
}
const NBSP = ' '
const NNBSP = ' '
const sgState = (page: Page) => page.evaluate(() => (window.__lab as unknown as LabWithSg).sg!.state())
const sgCall = (page: Page, fn: string, ...args: unknown[]) =>
  page.evaluate(([f, a]) => ((window.__lab as unknown as LabWithSg).sg as unknown as Record<string, (...x: unknown[]) => unknown>)[f as string](...(a as unknown[])), [fn, args] as const)

async function openSg(page: Page, query = '', fresh = false, search = '?measure') {
  if (fresh) await page.goto('about:blank')
  await page.goto(`${search}#/lab/sg${query}`)
  await page.waitForFunction(() => window.__lab?.mounted === true && !!(window.__lab as unknown as LabWithSg).sg, undefined, { timeout: 20_000 })
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await expect.poll(async () => (await page.evaluate(() => window.__lab!.bench({ frames: 1 })))?.environment, { timeout: 10_000 }).toBe(true)
  // the Blender hardware is read from lab.glb (8 meshes) once the engine is up
  await expect.poll(async () => (await sgState(page)).hardware, { timeout: 10_000 }).toBe(8)
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
/** Stage readouts (or the paper list when the stage is squarer), key → text. */
const sgDom = (page: Page) =>
  page.evaluate(() => {
    const on = [...document.querySelectorAll<HTMLElement>('.lab-stage .stage-readouts .stage-readout')]
    const paper = [...document.querySelectorAll<HTMLElement>('[data-readouts="paper"] li')]
    return Object.fromEntries((on.length ? on : paper).map((el) => [el.dataset.key!, el.textContent!]))
  })
async function expectSgReadoutsFromEngine(page: Page) {
  await expect
    .poll(async () => JSON.stringify(await sgDom(page)) === JSON.stringify(await page.evaluate(() => (window.__lab as unknown as LabWithSg).sg!.readouts())))
    .toBe(true)
}
/**
 * An independent twin of the engine's seeded sampling (physics/random.ts mulberry32, physics/sg.ts fireAtom), written
 * here from the Born rule on Bloch vectors: P(+ along n | state r) = (1 + n·r)/2, ½ for the oven; each magnet leaves ±n;
 * a magnet tilted by t about the beam measures along n = (sin t, 0, cos t). Counts cumulative over `volleys`.
 */
function twinCounts(setup: { source: string; tilts: number[]; keep: Sign[] }, volleys: { n: number; seed: number }[]) {
  const BLOCH: Record<string, [number, number, number]> = { '+z': [0, 0, 1], '-z': [0, 0, -1], '+x': [1, 0, 0], '-x': [-1, 0, 0], '+y': [0, 1, 0], '-y': [0, -1, 0] }
  const t = { plus: 0, minus: 0, blocked: setup.keep.map(() => 0) }
  for (const v of volleys) {
    let a = v.seed >>> 0
    const rand = () => {
      a = (a + 0x6d2b79f5) >>> 0
      let x = a
      x = Math.imul(x ^ (x >>> 15), x | 1)
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296
    }
    for (let i = 0; i < v.n; i++) {
      let r: [number, number, number] | null = setup.source === 'oven' ? null : BLOCH[setup.source]
      for (let k = 0; k < setup.tilts.length; k++) {
        const d = (setup.tilts[k] * Math.PI) / 180
        const n: [number, number, number] = [Math.sin(d), 0, Math.cos(d)]
        const p = r ? (1 + n[0] * r[0] + n[1] * r[1] + n[2] * r[2]) / 2 : 0.5
        const s = rand() < p ? 1 : -1
        r = [s * n[0], s * n[1], s * n[2]]
        if (k < setup.tilts.length - 1) {
          if ((s > 0 ? '+' : '-') !== setup.keep[k]) {
            t.blocked[k]++
            break
          }
        } else if (s > 0) t.plus++
        else t.minus++
      }
    }
  }
  return t
}

test.describe('Stern–Gerlach bench', () => {
  test('#/lab/sg: 0 errors/warnings/CSP/other origins/trips; passport; lab.glb; readouts = engine; Fire 1 000 lands the engine’s counts', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    const w = watchAll(page, new URL(baseURL!).origin)
    const glb: string[] = []
    page.on('request', (r) => {
      if (r.url().includes('lab.glb')) glb.push(r.url())
    })
    await openSg(page)
    await expect(page.locator('.lab-stage canvas.lab-canvas')).toHaveCount(1)
    await expect(page.locator('.lab-stage .stage-passport')).toContainText('PHYSICAL SPACE ℝ³')
    await expect(page.locator('.lab-stage .stage-passport')).not.toContainText('metres')
    await expect(page.locator('.lab-stage .stage-passport')).toContainText('schematic · not to scale')
    expect(glb).toHaveLength(1)
    expect(new URL(glb[0]).origin).toBe(new URL(baseURL!).origin)
    // D-lab's example bench: oven → z keep + → x
    const r0 = await sgDom(page)
    expect(r0['m1']).toBe(`magnet 1 · 0° · passes 50.0${NBSP}%`)
    expect(r0['m2']).toBe('magnet 2 · 90° · to the plate')
    expect(r0['tally']).toBe('nothing fired yet')
    expect(r0['born-plus']).toBe(`+ spot · Born 25.0${NBSP}%`)
    await expectSgReadoutsFromEngine(page)
    // a real click: the volley flies, then its counts land (the engine's own fireMany with the volley's seed)
    await page.getByRole('button', { name: `Fire 1${NNBSP}000` }).click()
    await expect.poll(async () => (await sgState(page)).flying).toBe(true)
    await expect(page.locator('.lab-stage .stage-readout[data-key="tally"]')).toHaveText('nothing fired yet')
    await expect.poll(async () => (await sgState(page)).counts.n, { timeout: 4000 }).toBe(1000)
    const st = await sgState(page)
    const eng = twinCounts(st, [st.last!])
    expect({ plus: st.counts.plus, minus: st.counts.minus, blocked: st.counts.blocked }).toEqual(eng)
    await expect(page.locator('.lab-stage .stage-readout[data-key="tally"]')).toHaveText(`+${NBSP}${eng.plus} · −${NBSP}${eng.minus} · stopped${NBSP}${eng.blocked[0]}${NBSP}/${NBSP}1${NNBSP}000`)
    await expect(page.locator('.lab-stage .stage-readout[data-key="born-plus"]')).toHaveText(`+ spot · Born 25.0${NBSP}%`)
    await expect(page.locator('.lab-stage .stage-readout[data-key="counted"]')).toHaveText(new RegExp(` · expect ±${NBSP}1\\.4${NBSP}pt at N${NBSP}=${NBSP}1${NNBSP}000$`))
    expect(st.marks).toBe(eng.plus + eng.minus)
    await expectSgReadoutsFromEngine(page)
    // a second volley: a new seed, counts cumulative
    await sgCall(page, 'fire', 100)
    await sgCall(page, 'land')
    const st2 = await sgState(page)
    expect(st2.last!.seed).not.toBe(st.last!.seed)
    const eng2 = twinCounts(st2, [st.last!, st2.last!])
    expect({ plus: st2.counts.plus, minus: st2.counts.minus, blocked: st2.counts.blocked }).toEqual(eng2)
    await expectSgReadoutsFromEngine(page)
    // the fidelity note, one click away
    await page.locator('.lab-stage .stage-passport').click()
    await expect(page.locator('.stage-drawer [data-fidelity="lab-sg-about-beam"]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.stage-drawer')).toHaveCount(0)
    await page.waitForTimeout(300)
    expect(await idleFrames(page)).toBe(0)
    await page.waitForLoadState('networkidle')
    expect(await page.evaluate(() => window.__csp ?? [])).toEqual([])
    expect(w.foreign).toEqual([])
    expect(w.warnings).toEqual([])
    expect(await page.evaluate(() => window.__lab!.tripwire())).toEqual([])
    expect(errors).toEqual([])
  })

  test('reduced motion: a volley lands at once (no flight)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openSg(page, '', true, '?measure&motion=reduce')
    await page.getByRole('button', { name: 'Fire 100', exact: true }).click()
    const st = await sgState(page)
    expect(st.flying).toBe(false)
    expect(st.counts.n).toBe(100)
    await expect(page.locator('.lab-stage .stage-readout[data-key="tally"]')).toHaveText(/\s\/\s100$/)
    await expectSgReadoutsFromEngine(page)
    expect(errors).toEqual([])
  })

  test('in the scene: a mouse drag turns a knob about the beam (15° snaps); pad taps keep, add and remove; the keyboard twin steps', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openSg(page, '?preset=l1-zxz', true)
    // a real drag of magnet 2's knob to the 60° point of its ring
    const from = (await page.evaluate(() => window.__lab!.handleScreen('knob-1')))!
    const p60 = (await sgCall(page, 'knobPoint', 1, 60)) as [number, number, number]
    const to = (await page.evaluate((p) => window.__lab!.project(p), p60))!
    expect(from).not.toBeNull()
    await page.mouse.move(from[0], from[1])
    await page.mouse.down()
    for (let i = 1; i <= 12; i++) await page.mouse.move(from[0] + ((to[0] - from[0]) * i) / 12, from[1] + ((to[1] - from[1]) * i) / 12)
    await page.mouse.up()
    expect((await sgState(page)).tilts).toEqual([0, 60, 0])
    await expect(page.locator('.lab-stage .stage-readout[data-key="m2"]')).toHaveText(`magnet 2 · 60° · passes 75.0${NBSP}%`)
    // the same gesture path by __lab: 52° snaps to 45°
    await sgCall(page, 'drag', 'knob-1', [await sgCall(page, 'knobPoint', 1, 52)])
    expect((await sgState(page)).tilts[1]).toBe(45)
    // tap the − pad of stop 1: the − beam goes on
    const minusPad = (await page.evaluate(() => window.__lab!.handleScreen('keep-0-minus')))!
    await page.mouse.click(minusPad[0], minusPad[1])
    await expect.poll(async () => (await sgState(page)).keep).toEqual(['-', '+'])
    // tap "+" at the rail's end: a fourth magnet
    await page.waitForTimeout(400)
    const add = (await page.evaluate(() => window.__lab!.handleScreen('add')))!
    await page.mouse.click(add[0], add[1])
    await expect.poll(async () => (await sgState(page)).tilts).toEqual([0, 45, 0, 0])
    expect((await page.evaluate(() => window.__lab!.handleScreen('add')))).toBeNull()
    // tap "−" above magnet 3: it goes
    await page.waitForTimeout(400)
    const rm = (await page.evaluate(() => window.__lab!.handleScreen('remove-2')))!
    await page.mouse.click(rm[0], rm[1])
    await expect.poll(async () => (await sgState(page)).tilts).toEqual([0, 45, 0])
    // the knob's keyboard twin: → a 15° step, Shift+→ 1°
    const twin = page.getByRole('slider', { name: 'Knob of magnet 2' })
    await twin.focus()
    await page.keyboard.press('ArrowRight')
    expect((await sgState(page)).tilts[1]).toBe(60)
    await page.keyboard.press('Shift+ArrowRight')
    expect((await sgState(page)).tilts[1]).toBe(61)
    await expectSgReadoutsFromEngine(page)
    expect(errors).toEqual([])
  })

  test('preset allowlist: an allowlisted id sets its bench; crafted queries set nothing', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openSg(page, '?preset=l1-zxz', true)
    await expect(page.locator('[data-preset-note]')).toContainText('The classic surprise')
    expect((await sgState(page)).tilts).toEqual([0, 90, 0])
    for (const q of ['?preset=__proto__&tilts=60', '?preset=constructor', '?tilts=0,60,0&preset=evil', '?preset=%7B%22tilts%22%3A%5B0%2C60%2C0%5D%7D', '?preset=L1-ZXZ', '?preset=l1-zxz%26tilts%3D60']) {
      await openSg(page, q, true)
      const s = await sgState(page)
      expect({ tilts: s.tilts, keep: s.keep, source: s.source, preset: s.preset }, q).toEqual({ tilts: [0, 90], keep: ['+'], source: 'oven', preset: 'l1-zx' })
      await expect(page.locator('[data-preset-note]'), q).toHaveCount(0)
    }
    expect(errors).toEqual([])
  })

  test('800 px: readouts, dials and the plate’s counts in the page, no canvas, no Babylon chunk', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 })
    const errors = collectErrors(page)
    const urls: string[] = []
    page.on('request', (r) => urls.push(r.url()))
    await page.goto('?measure#/lab/sg')
    await expect(page.locator('.lab-paper h1')).toHaveText('Stern–Gerlach bench')
    await expect(page.locator('[data-readouts="paper"] [data-key="m1"]')).toHaveText(`magnet 1 · 0° · passes 50.0${NBSP}%`)
    await expect(page.locator('.sg-svg circle[data-tone="frame"]')).toHaveCount(2)
    // no 3D view: a volley lands at once
    await page.getByRole('button', { name: 'Fire 100', exact: true }).click()
    await expect(page.locator('[data-readouts="paper"] [data-key="tally"]')).toHaveText(/\s\/\s100$/)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(300)
    expect(await page.locator('canvas').count()).toBe(0)
    expect(urls.filter((u) => LAB_CHUNKS.some((c) => u.endsWith(c)) || /mountLab|lab\.glb/.test(u))).toEqual([])
    expect(await page.evaluate(() => [window.__lab!.mounts, window.__lab!.contexts])).toEqual([0, 0])
    expect(errors).toEqual([])
  })

  test.describe('frame time (1440×900 @2×)', () => {
    test.use({ deviceScaleFactor: 2 })
    test('p95 ≤ 8 ms while a 10 000-atom volley flies (2 000 drawn with trails, marks landing); orbiting reported', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await openSg(page, '?preset=l3-four', true)
      await sgCall(page, 'fire', 10000)
      await sgCall(page, 'land')
      await page.waitForTimeout(300)
      const runs: Record<'volley' | 'orbit', number[]> = { volley: [], orbit: [] }
      let last: LabBenchResult | null = null
      for (let round = 0; round < 3; round++) {
        last = (await page.evaluate(() => (window.__lab as unknown as LabWithSg).bench({ frames: 120, drag: 'volley' })))!
        runs.volley.push(last.p95)
        runs.orbit.push((await page.evaluate(() => (window.__lab as unknown as LabWithSg).bench({ frames: 120 })))!.p95)
        await sgCall(page, 'land')
      }
      const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
      const summary = { volley: median(runs.volley), orbit: median(runs.orbit), runs }
      const st = await sgState(page)
      console.log(`[lab] sg frame p95 @ canvas ${last!.canvas.join('×')} (${last!.activeMeshes} meshes, ${st.marks} marks): ${JSON.stringify(summary)}`)
      expect(last!.canvas[0]).toBeGreaterThan(1400)
      expect(summary.volley).toBeLessThanOrEqual(8)
      expect(summary.orbit).toBeLessThanOrEqual(8)
    })
  })

  test('screenshots for visual QA (1440×900, 1024×768): default, z → x → z fired, four magnets, sealed |+y⟩; no label clash', async ({ page }) => {
    mkdirSync(SCREENS, { recursive: true })
    const errors = collectErrors(page)
    for (const [w, h] of [
      [1440, 900],
      [1024, 768],
    ] as const) {
      await page.setViewportSize({ width: w, height: h })
      await openSg(page, '', true)
      await page.screenshot({ path: `${SCREENS}sg-${w}x${h}-default.png` })
      await expectNoGrapherClash(page, `${w} default`, 5)
      await sgCall(page, 'setup', 'l1-zxz')
      await sgCall(page, 'fire', 1000)
      await page.waitForTimeout(650)
      await page.screenshot({ path: `${SCREENS}sg-${w}x${h}-zxz-flying.png` })
      await sgCall(page, 'land')
      await page.waitForTimeout(400)
      await page.screenshot({ path: `${SCREENS}sg-${w}x${h}-zxz-fired.png` })
      await expectNoGrapherClash(page, `${w} z → x → z fired`, 6)
      await expectSgReadoutsFromEngine(page)
      await sgCall(page, 'setup', 'l3-four')
      await sgCall(page, 'fire', 10000)
      await sgCall(page, 'land')
      await page.waitForTimeout(500)
      await page.screenshot({ path: `${SCREENS}sg-${w}x${h}-four.png` })
      await expectNoGrapherClash(page, `${w} four magnets`, 7)
      await sgCall(page, 'setup', 'l2-plus-y')
      await sgCall(page, 'fire', 1000)
      await sgCall(page, 'land')
      await page.waitForTimeout(500)
      await page.screenshot({ path: `${SCREENS}sg-${w}x${h}-sealed-y.png` })
      await expectNoGrapherClash(page, `${w} sealed |+y⟩`, 4)
      await expect(page.locator('.lab-label[data-label="source"]')).toHaveText('|+y⟩ · sealed box')
    }
    expect(errors).toEqual([])
  })
})

/* ------------------------------------------------------------------------------------------------ */
/* The SG bench: the P review's items that only the page shows                                        */
/* ------------------------------------------------------------------------------------------------ */
/** Build a bench through the paper column's own controls (source, magnets, tilts, kept beams). */
async function buildSg(page: Page, source: string, tilts: number[], keep: Sign[]) {
  await page.locator(`input[name="sg-source"][value="${source}"]`).check()
  for (let n = await page.locator('.sg-magnet').count(); n < tilts.length; n++) await page.getByRole('button', { name: 'Add a magnet' }).click()
  for (let n = await page.locator('.sg-magnet').count(); n > tilts.length; n--) await page.getByRole('button', { name: `Remove magnet ${n}` }).click()
  for (let k = 0; k < tilts.length; k++) await page.getByLabel(`Tilt of magnet ${k + 1} in degrees`).fill(String(tilts[k]))
  for (let k = 0; k < keep.length; k++) await page.locator(`input[name="sg-keep-${k}"]`).nth(keep[k] === '+' ? 0 : 1).check()
  await expect.poll(async () => JSON.stringify((await sgState(page)).tilts)).toBe(JSON.stringify(tilts))
}
/** WCAG relative luminance of each pixel of a viewport screenshot, read back in the page (a data: image; CSP img-src). */
async function lumaSamples(page: Page, pts: [number, number][], r: number) {
  const png = (await page.screenshot()).toString('base64')
  return page.evaluate(
    async ({ png, pts, r }) => {
      const img = new Image()
      img.src = `data:image/png;base64,${png}`
      await img.decode()
      const dpr = img.width / innerWidth
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      return pts.map(([x, y]) => {
        const R = Math.max(1, Math.round(r * dpr))
        const cx = Math.round(x * dpr)
        const cy = Math.round(y * dpr)
        const d = ctx.getImageData(cx - 3 * R, cy - 3 * R, 6 * R + 1, 6 * R + 1).data
        const inner: number[] = []
        const ring: number[] = []
        for (let j = -3 * R; j <= 3 * R; j++)
          for (let i = -3 * R; i <= 3 * R; i++) {
            const o = 4 * ((j + 3 * R) * (6 * R + 1) + (i + 3 * R))
            const Y = 0.2126 * lin(d[o] / 255) + 0.7152 * lin(d[o + 1] / 255) + 0.0722 * lin(d[o + 2] / 255)
            const q = Math.hypot(i, j)
            if (q <= R) inner.push(Y)
            else if (q >= 2 * R && q <= 3 * R) ring.push(Y)
          }
        inner.sort((a, b) => a - b)
        ring.sort((a, b) => a - b)
        return { peak: inner[inner.length - 1], median: inner[inner.length >> 1], around: ring[Math.floor(ring.length * 0.3)] }
      })
    },
    { png, pts, r },
  )
}
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
const lumHex = (h: string) => {
  const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(h.slice(i, i + 2), 16) / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
/**
 * Each magnet's screen footprint (the convex hull of projected points), read back from a screenshot: the share of its
 * pixels whose contrast with the stage (luminance `bg`) is ≥ 3 : 1, and the median contrast.
 */
async function magnetShares(page: Page, hulls: [number, number][][], bg: number) {
  const png = (await page.screenshot()).toString('base64')
  return page.evaluate(
    async ({ png, hulls, bg }) => {
      const img = new Image()
      img.src = `data:image/png;base64,${png}`
      await img.decode()
      const dpr = img.width / innerWidth
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      const hullOf = (ps: [number, number][]) => {
        const p = [...ps].sort((a, b) => a[0] - b[0] || a[1] - b[1])
        const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
        const lo: [number, number][] = []
        const hi: [number, number][] = []
        for (const q of p) {
          while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop()
          lo.push(q)
        }
        for (const q of [...p].reverse()) {
          while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop()
          hi.push(q)
        }
        return [...lo.slice(0, -1), ...hi.slice(0, -1)]
      }
      return hulls.map((ps) => {
        const h = hullOf(ps.map(([x, y]) => [x * dpr, y * dpr]))
        const xs = h.map((q) => q[0])
        const ys = h.map((q) => q[1])
        const [x0, x1, y0, y1] = [Math.floor(Math.min(...xs)), Math.ceil(Math.max(...xs)), Math.floor(Math.min(...ys)), Math.ceil(Math.max(...ys))]
        const d = ctx.getImageData(x0, y0, x1 - x0 + 1, y1 - y0 + 1).data
        const side = (x: number, y: number) =>
          h.map((a, i) => {
            const b = h[(i + 1) % h.length]
            return (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])
          })
        const inside = (x: number, y: number) => {
          const s = side(x, y)
          return s.every((v) => v >= 0) || s.every((v) => v <= 0)
        }
        const cs: number[] = []
        for (let y = y0; y <= y1; y += 2)
          for (let x = x0; x <= x1; x += 2) {
            if (!inside(x, y)) continue
            const o = 4 * ((y - y0) * (x1 - x0 + 1) + (x - x0))
            const Y = 0.2126 * lin(d[o] / 255) + 0.7152 * lin(d[o + 1] / 255) + 0.0722 * lin(d[o + 2] / 255)
            cs.push((Math.max(Y, bg) + 0.05) / (Math.min(Y, bg) + 0.05))
          }
        cs.sort((a, b) => a - b)
        const at = (p: number) => Math.round(cs[Math.floor(p * (cs.length - 1))] * 100) / 100
        return { pixels: cs.length, share3: Math.round((cs.filter((v) => v >= 3).length / cs.length) * 1000) / 1000, median: at(0.5), p75: at(0.75), p90: at(0.9) }
      })
    },
    { png, hulls, bg },
  )
}
/** The inset may draw the plate and nothing else: its glass, frame, marks and its own backdrop. */
const INSET_ONLY = new Set(['sg-glass', 'sg-marks', 'sg-backdrop', 'sg-plate_frame'])

test.describe('Stern–Gerlach bench: the P review', () => {
  test('review #3: the plate inset draws only the plate, even when a short chain runs low (z keep − → z; the review’s own chain)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openSg(page, '?preset=l1-zz', true)
    const cases: [string, number[], Sign[]][] = [
      // the short chain: the kept − beam drops the plate by 1.07, so the rail and the floor cross the inset's view
      ['oven', [0, 0], ['-']],
      // the review's chain (mine3): the rail's end-on profile sat inside the plate face
      ['oven', [45, 105, 270], ['-', '+']],
    ]
    for (const [source, tilts, keep] of cases) {
      await buildSg(page, source, tilts, keep)
      await sgCall(page, 'fire', 1000)
      await sgCall(page, 'land')
      await page.waitForTimeout(300)
      const inset = await page.evaluate(() => (window.__lab as unknown as LabWithSg).seen('plate'))
      const main = await page.evaluate(() => (window.__lab as unknown as LabWithSg).seen('main'))
      const what = `${source} ${tilts.join(',')} ${keep.join('')}`
      expect(inset.filter((m) => !INSET_ONLY.has(m)), what).toEqual([])
      for (const m of ['sg-glass', 'sg-marks', 'sg-plate_frame']) expect(inset, `${what}: the inset shows ${m}`).toContain(m)
      // the hardware is still drawn, in the main view
      for (const m of ['sg-bench_rail', 'sg-sg_yoke', 'sg-plate_frame', 'sg-marks']) expect(main, `${what}: the main view shows ${m}`).toContain(m)
      expect(main).not.toContain('sg-backdrop')
    }
    await page.locator('.lab-stage').screenshot({ path: `${SCREENS}sg-review3-low-chain.png` })
    expect(errors).toEqual([])
  })

  test('review #5: on the dark stage the protractor ring reads ≥ 3 : 1 and the magnets read as objects (measured in the frame, 1440×900 @2×)', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    const errors = collectErrors(page)
    await openSg(page, '?preset=l1-zx', true)
    const bg = lumHex('#1a1f28')
    // the ring: both magnets' rings every 15°, away from the knob, where nothing hides it; points over hardware are left
    // out too (their ground is the magnet, not the stage)
    const ringPts: { k: number; deg: number; at: [number, number] }[] = []
    const hiddenBy: string[] = []
    const st = await sgState(page)
    for (let k = 0; k < st.tilts.length; k++)
      // halfway between the 15° ticks (a tick is its own stroke, opaque, drawn over the ring)
      for (let deg = 7.5; deg < 360; deg += 15) {
        const off = Math.abs((((deg - st.tilts[k]) % 360) + 540) % 360 - 180)
        if (off < 30) continue
        const p = (await sgCall(page, 'knobPoint', k, deg)) as [number, number, number]
        const at = await page.evaluate((q) => window.__lab!.project(q), p)
        // in plain sight only (nothing drawn between the camera and the ring there)
        const hidden = await page.evaluate((q) => (window.__lab as unknown as LabWithSg).firstHit(q), p)
        if (hidden) hiddenBy.push(`m${k + 1} ${deg}°: ${hidden}`)
        if (at && !hidden) ringPts.push({ k, deg, at })
      }
    const ring = await lumaSamples(page, ringPts.map((p) => p.at), 2)
    const overStage = ring.map((s, i) => ({ ...s, ...ringPts[i] })).filter((s) => s.around <= bg * 1.6)
    const ringRatios = overStage.map((s) => contrast(s.peak, Math.max(bg, s.around)))
    // the magnets: each magnet's footprint on the screen (the hull of its yoke-and-poles box, projected), measured with
    // the DOM overlay hidden: the share of its pixels at ≥ 3 : 1 on the stage, and its median
    const box = [-1.57, 0.95].flatMap((x) => [0, 3.2].flatMap((y) => [-2.02, 2.02].map((z): [number, number, number] => [x, y, z])))
    const hulls: [number, number][][] = []
    for (let k = 0; k < st.tilts.length; k++) {
      const pts: [number, number][] = []
      for (const c of box) {
        const w = (await sgCall(page, 'modulePoint', k, c)) as [number, number, number]
        pts.push((await page.evaluate((x) => window.__lab!.project(x), w))!)
      }
      hulls.push(pts)
    }
    await page.evaluate(() => document.querySelector<HTMLElement>('.lab-stage .stage-overlay')!.style.setProperty('visibility', 'hidden'))
    const shots = await magnetShares(page, hulls, bg)
    await page.screenshot({ path: `${SCREENS}sg-review5-contrast.png` })
    await page.evaluate(() => document.querySelector<HTMLElement>('.lab-stage .stage-overlay')!.style.removeProperty('visibility'))
    const q = (xs: number[], p: number) => [...xs].sort((a, b) => a - b)[Math.floor(p * (xs.length - 1))] ?? NaN
    console.log(`[lab] sg review #5: ring points hidden by hardware: ${hiddenBy.join(', ') || 'none'}`)
    const faint = overStage.filter((_, i) => ringRatios[i] < 3).map((s) => `m${s.k + 1} ${s.deg}°: ${contrast(s.peak, Math.max(bg, s.around)).toFixed(2)}`)
    console.log(
      `[lab] sg review #5: ring over the stage ${overStage.length}/${ringPts.length} points, min ${q(ringRatios, 0).toFixed(2)} · median ${q(ringRatios, 0.5).toFixed(2)} · max ${q(ringRatios, 1).toFixed(2)}; below 3: ${faint.join(', ') || 'none'}; magnets ${JSON.stringify(shots)}`,
    )
    expect(overStage.length).toBeGreaterThan(10)
    expect(q(ringRatios, 0), 'the ring, its faintest point over the stage').toBeGreaterThanOrEqual(3)
    // readable as objects: a large share of each magnet's footprint stands ≥ 3 : 1 off the stage, and its median ≥ 2.5 : 1.
    // Before the fix (the hardware drawn inside out, the yoke #39414f, the ring at α 0.7): ring min 2.71 · median 2.79;
    // magnets share 1.6 % / 0.9 %, median 1.09 / 1.09. After: ring 3.69 · 3.69; share 49 % / 52 %, median 2.77 / 3.21.
    shots.forEach((m, k) => {
      expect(m.share3, `magnet ${k + 1}: share of its footprint at ≥ 3 : 1`).toBeGreaterThanOrEqual(0.4)
      expect(m.median, `magnet ${k + 1}: median contrast`).toBeGreaterThanOrEqual(2.5)
    })
    expect(errors).toEqual([])
    await ctx.close()
  })

  test('review #4 and #1: below 900 px the plate turns with the last magnet, names what it counts, and + text is --up-text', async ({ page }) => {
    const errors = collectErrors(page)
    for (const [w, h] of [
      [390, 844],
      [800, 900],
    ] as const) {
      await page.setViewportSize({ width: w, height: h })
      await page.goto('about:blank')
      await page.goto('?measure#/lab/sg?preset=l1-zx')
      await expect(page.locator('.lab-paper h1')).toHaveText('Stern–Gerlach bench')
      const where = async () =>
        page.evaluate(() => {
          const svg = document.querySelector('[data-plate-face] svg')!.getBoundingClientRect()
          const r = (s: string) => document.querySelector(`[data-plate-face] [data-sign="${s}"]`)!.getBoundingClientRect()
          const c = [svg.left + svg.width / 2, svg.top + svg.height / 2]
          const at = (b: DOMRect) => [b.left + b.width / 2 - c[0], b.top + b.height / 2 - c[1]]
          return { plus: at(r('plus')), minus: at(r('minus')), size: svg.width }
        })
      // z then x: the last magnet is x, so + is to the right and − to the left (z up, x right, like the dials)
      let p = await where()
      expect(p.plus[0], `${w}: + right`).toBeGreaterThan(0.25 * p.size)
      expect(p.minus[0], `${w}: − left`).toBeLessThan(-0.25 * p.size)
      expect(Math.abs(p.plus[1])).toBeLessThan(0.05 * p.size)
      await page.getByRole('button', { name: 'Fire 1 000'.replace(' ', NNBSP) }).click()
      const st = await sgState(page)
      await expect(page.locator('[data-plate-caption]')).toContainText(`On the plate: +${NBSP}${st.counts.plus} and −${NBSP}${st.counts.minus} of the 1${NNBSP}000 atoms fired.`)
      await expect(page.locator('[data-plate-caption]')).not.toContainText('%')
      // one magnet at 0°: + up, − down
      await page.getByRole('button', { name: 'One magnet', exact: true }).click()
      p = await where()
      expect(p.plus[1], `${w}: + up`).toBeLessThan(-0.25 * p.size)
      expect(p.minus[1], `${w}: − down`).toBeGreaterThan(0.25 * p.size)
      // review #1: the paper's + readout is amber TEXT (--up-text), not the fill
      const colour = await page.locator('[data-readouts="paper"] [data-key="born-plus"]').evaluate((el) => getComputedStyle(el).color)
      expect(colour).toBe('rgb(128, 79, 0)')
      await page.screenshot({ path: `${SCREENS}sg-review4-plate-${w}x${h}.png`, fullPage: true })
    }
    expect(errors).toEqual([])
  })

  test('review #12: the pads’ DOM twins are ≥ 24 px targets (keep radios, Remove, Add, the knobs’ sliders)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    await openSg(page, '?preset=l1-zxz', true)
    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('.sg-keep, .sg-magnet button, .sg-magnets > .lab-row button, .sg-magnet [role="slider"]')].map((el) => {
        const b = el.getBoundingClientRect()
        return { what: el.textContent!.trim().slice(0, 24), w: b.width, h: b.height }
      }),
    )
    expect(boxes.length).toBeGreaterThanOrEqual(4 + 2 + 1 + 3)
    expect(boxes.filter((b) => b.w < 24 || b.h < 24)).toEqual([])
    expect(errors).toEqual([])
  })
})
