/**
 * The `code` stage kind and the stage-code additions (S2 `amplitudes.keep` as a wire list, S3 the error-correction plot curves, S4 the circuit and tableau
 * pictures of the plans), mounted on the DEV demo chapter Q0 (units `q0-demo-code` and `q0-demo-ec`: `#/709/ch/Q0`). The demo chapter exists only in DEV builds
 * (it never ships), so every test here is @dev-only and runs in the dev project:
 *
 *   PW_DEV_PORT=5282 npx playwright test e2e/code-kind.spec.ts --project=dev
 *
 * What is checked in a real browser: every beat of both units syncs in both tracks (passports, drawn views, caption) as any SVG kind does, with 0 console
 * errors; the drawn syndrome, correction, residual, focus edges and shift are what the engine says (read off the instrument's frame); every qubit and check
 * is labelled in the DOM; the clue reveals by click; the reading version (375 px, no WebGL) draws the same pictures as figures; nothing scrolls sideways;
 * screenshots of every view and overlay go to e2e/__screens__/code/ (git-ignored) for the visual pass.
 */
import { expect, test, type Page } from '@playwright/test'
import { beatIds, collectErrors, expectNoErrors, waitForStage } from './helpers.ts'

const CODE = 'q0-demo-code'
const EC = 'q0-demo-ec'
const SCREENS = 'e2e/__screens__/code'

/** React's dev-only warning on the demo chapter below 900 px (present without any code unit; it logs from the Vite client, not from the app). */
const KNOWN = /synchronously unmount a root/

interface CodeFrame {
  state: {
    id: string
    n: number
    view: string
    syndrome: string | null
    correction: string | null
    residual: string | null
    residualKind: string | null
    error: string | null
    distance: { d: number | null; reported: number | null }
    logical: { weight: number } | null
    checks: { label: string; flipped: number | null }[]
    qubits: { error: string | null; logical: string | null }[]
    tile: { focus: { label: string; edges: { kind: string; target: string }[] }[]; shift: { delta: number[]; preserves: boolean } | null } | null
    table: { rows: unknown[]; errors: { syndrome: number[] }[] } | null
    words: { name: string; terms: unknown[] } | null
  }
}
const codeFrame = (page: Page): Promise<CodeFrame> => page.evaluate((u) => window.__stage!.frame(`${u}/code`) as unknown as CodeFrame, CODE)

async function openQ0(page: Page, track: 'ground' | 'formal', width = 1280, height = 860): Promise<string[]> {
  await page.setViewportSize({ width, height })
  await page.goto(`#/709/ch/Q0?track=${track}`)
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  const stories = await page.locator('.story[data-mode="live"]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.unit!))
  expect(stories).toContain(CODE)
  expect(stories).toContain(EC)
  await waitForStage(page, stories.length)
  return stories
}

async function toBeat(page: Page, id: string): Promise<void> {
  await page.evaluate((b) => window.__stage!.scrollToBeat(b, { wait: false }), id)
  await page.waitForFunction((b) => window.__stage!.beats()[b.split(':')[0]]?.beatId === b, id, { timeout: 10_000 })
  await page.waitForFunction(
    (u) => window.__stage!.views().filter((v) => v.key.startsWith(`${u}/`) && v.weight > 0).every((v) => v.warmups > 0),
    id.split(':')[0],
    { timeout: 10_000 },
  )
  await page.evaluate(() => window.__stage!.settle())
}

test.describe('@dev-only the code kind and the stage-code additions on the demo chapter Q0', () => {
  for (const track of ['ground', 'formal'] as const)
    test(`${track}: every beat of the code unit and the circuits unit syncs (passports, drawn views, caption); SVG views are DOM; 0 console errors`, async ({ page }) => {
      const errors = collectErrors(page)
      const stories = await openQ0(page, track)
      void stories
      for (const unit of [CODE, EC]) {
        const ids = await beatIds(page, unit)
        expect(ids.length).toBeGreaterThan(5)
        for (let i = 0; i < ids.length; i++) {
          await toBeat(page, ids[i])
          const want = (await page.evaluate(([u, k, t]) => window.__stage!.layoutOf(u as string, k as number, false, t as 'ground' | 'formal'), [unit, i, track] as const))!
          const box = page.locator(`.story-stage[data-unit="${unit}"]`)
          if (want.caption) await expect(box.locator('.stage-caption')).toHaveAttribute('data-source', want.caption)
          expect(await box.locator('.stage-passport').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.kind))).toEqual(want.kinds)
          const drawn = () => page.evaluate((u) => window.__stage!.views().filter((v) => v.key.startsWith(`${u}/`) && v.weight > 0 && v.screen).map((v) => v.kind).sort(), unit)
          await expect.poll(drawn, { message: `${ids[i]} views`, timeout: 5000 }).toEqual([...want.kinds].sort())
          // SVG views are DOM in the stage box: one <svg> per drawn kind, never a canvas
          await expect(box.locator('.svg-stage-layer > svg')).toHaveCount(want.kinds.length)
          const br = (await box.boundingBox())!
          expect(br.y >= 0 && br.y + br.height <= page.viewportSize()!.height, `${ids[i]} stage box on screen`).toBe(true)
          await box.screenshot({ path: `${SCREENS}/${track}-${ids[i].replace(':', '_')}.png` })
        }
      }
      expect(await page.locator('[data-unit="q0-demo-code"] canvas, [data-unit="q0-demo-ec"] canvas').count()).toBe(0)
      await expectNoErrors(errors)
    })

  test('the code unit draws what the engine says: syndromes, corrections, residuals, logical operators, tables, words, the torus tile', async ({ page }) => {
    const errors = collectErrors(page)
    await openQ0(page, 'ground')
    const at = async (n: number) => {
      await toBeat(page, `${CODE}:b${n}`)
      return (await codeFrame(page)).state
    }
    // b1: the Steane code, no overlay
    let s = await at(1)
    expect(s).toMatchObject({ id: 'steane7', n: 7, view: 'layout', syndrome: null, error: null })
    expect(s.distance.d).toBe(3)
    // b2: X on qubit 5 lights Z1 and Z3 (the Z checks that hold it): X1 X2 X3 Z1 Z2 Z3 = 000101
    s = await at(2)
    expect(s.error).toBe('IIIIXII')
    expect(s.syndrome).toBe('000101')
    expect(s.checks.filter((c) => c.flipped === 1).map((c) => c.label)).toEqual(['Z1', 'Z3'])
    await expect(page.locator(`.story-stage[data-unit="${CODE}"] [data-check][data-lit="1"]`)).toHaveCount(2)
    // every qubit and every check carries an accessible name
    await expect(page.locator(`.story-stage[data-unit="${CODE}"] svg[data-kind="code"] [data-qubit]`)).toHaveCount(7)
    await expect(page.locator(`.story-stage[data-unit="${CODE}"] svg[data-kind="code"] [data-check] title`)).toHaveCount(6)
    // the readout column says the syndrome in words
    await expect(page.locator(`.story-stage[data-unit="${CODE}"] .stage-readout`, { hasText: 'Z1, Z3 read −1' })).toHaveCount(1)
    // b3 / b4: the lookup decoder: exactly undone, then fooled by two flips (a logical X is left)
    s = await at(3)
    expect([s.correction, s.residualKind]).toEqual(['IIIIXII', 'identity'])
    s = await at(4)
    expect([s.correction, s.residual, s.residualKind]).toEqual(['IIXIIII', 'XXXIIII', 'logical-X'])
    // b5: Shor, Z on qubit 4: X1 and X2 light; b6: a minimum-weight logical operator of weight 3
    s = await at(5)
    expect(s.checks.filter((c) => c.flipped === 1).map((c) => c.label)).toEqual(['X1', 'X2'])
    s = await at(6)
    expect(s.logical!.weight).toBe(3)
    expect(s.qubits.filter((q) => q.logical).length).toBe(3)
    // b7 / b8: the surface codes
    s = await at(7)
    expect([s.id, s.n]).toEqual(['surface3', 9])
    s = await at(8)
    expect([s.id, s.n, s.distance.d]).toEqual(['surface5', 25, 5])
    // b11 / b12: the checks view with its error rows; b13 – b15: the words view
    s = await at(11)
    expect(s.table!.rows.length).toBe(8)
    expect(s.table!.errors.map((e) => e.syndrome.join(''))).toEqual(['00100000', '11000000', '00000001'])
    s = await at(12)
    expect(s.table!.rows.length).toBe(6)
    s = await at(13)
    expect(s.words!.terms.length).toBe(8)
    s = await at(14)
    expect(s.words!.terms.length).toBe(16)
    s = await at(15)
    expect(s.words!.name).toBe('logical |1⟩')
    // b16 – b20: the bicycle tile: 144 qubits and checks, a focused check with four near edges and two long-range stubs, a shift, a logical operator of weight 12
    s = await at(16)
    expect([s.id, s.n, s.checks.length]).toEqual(['gross', 144, 144])
    await expect(page.locator(`.story-stage[data-unit="${CODE}"] svg[data-kind="code"] [data-qubit]`)).toHaveCount(144)
    s = await at(17)
    expect(s.tile!.focus[0].label).toBe('X20')
    expect(s.tile!.focus[0].edges.filter((e) => e.kind === 'long').map((e) => e.target).sort()).toEqual(['L(6, 1)', 'R(2, 5)'])
    await expect(page.locator(`.story-stage[data-unit="${CODE}"] [data-anchor="stub"]`)).toHaveCount(2) // the two long-range edges; X20 is an inner cell, so none of its four near edges wraps over the seam
    s = await at(18)
    expect(s.tile!.focus.map((f) => f.label)).toEqual(['X20', 'Z5'])
    expect(s.tile!.shift).toMatchObject({ delta: [3, -1], preserves: true })
    s = await at(19)
    expect(s.checks.filter((c) => c.flipped === 1).length).toBe(3)
    expect(s.logical!.weight).toBe(12)
    s = await at(20)
    expect([s.id, s.n]).toEqual(['two-gross', 288])
    await expectNoErrors(errors)
  })

  test('S3 and S2 on the stage: the plot curves are the engine’s; a wire-list reading of the helper wires is one bar of 100 %', async ({ page }) => {
    const errors = collectErrors(page)
    await openQ0(page, 'ground')
    const plot = async (n: number) => {
      await toBeat(page, `${CODE}:b${n}`)
      return page.evaluate((u) => (window.__stage!.frame(`${u}/plot`) as unknown as { state: { fn: string; markers: { x: number; y: number; yVs: number | null }[]; xLabel: string } }).state, CODE)
    }
    let p = await plot(21)
    expect(p.fn).toBe('repFail3')
    expect(p.xLabel).toBe('p')
    expect(p.markers[0].y).toBeCloseTo(0.028, 9)
    expect(p.markers[1].y).toBeCloseTo(0.5, 9)
    p = await plot(22)
    expect(p.fn).toBe('steaneFailX')
    expect(p.markers[0].y).toBeCloseTo(0.00200407496752, 9)
    expect(p.markers[1].y).toBeCloseTo(p.markers[1].yVs!, 4) // the crossing with the bare qubit
    p = await plot(23)
    expect(p.fn).toBe('qhbNeed1')
    expect([p.markers[0].y, p.markers[0].yVs]).toEqual([32, 32])
    await toBeat(page, `${CODE}:b24`)
    const amp = await page.evaluate((u) => (window.__stage!.frame(`${u}/amplitudes`) as unknown as { state: { n: number; keepWires: number[]; probs: number[] } }).state, CODE)
    expect(amp.keepWires).toEqual([3, 4])
    expect(amp.n).toBe(2)
    expect(amp.probs[3]).toBeCloseTo(1, 12)
    await expect(page.locator(`.story-stage[data-unit="${CODE}"] .stage-readout`, { hasText: 'wires 3, 4 (from 0)' })).toHaveCount(1)
    await expectNoErrors(errors)
  })

  test('the clue reveals by click: a bare code, then the flip on qubit 3 with its lit check', async ({ page }) => {
    const errors = collectErrors(page)
    await openQ0(page, 'ground')
    await toBeat(page, `${CODE}:b25`)
    expect((await codeFrame(page)).state.syndrome).toBeNull()
    await page.locator('.story-beat[data-beat="q0-demo-code:b25"]').getByRole('button', { name: 'Show me' }).click()
    await expect.poll(async () => (await codeFrame(page)).state.syndrome, { timeout: 4000 }).toBe('01')
    expect((await codeFrame(page)).state.checks.filter((c) => c.flipped === 1).map((c) => c.label)).toEqual(['Z2'])
    await expectNoErrors(errors)
  })

  test('S4: the circuit and tableau pictures of the plans draw as asked (conditioned X columns, the Rx label, 5 wires × 11 columns, the tableau, the CNOT product grid)', async ({ page }) => {
    const errors = collectErrors(page)
    await openQ0(page, 'ground')
    const box = page.locator(`.story-stage[data-unit="${EC}"]`)
    await toBeat(page, `${EC}:b1`)
    // three conditioned X gates, each with its condition inside the figure (the last column hangs left of the cursor)
    const conds = box.locator('svg[data-kind="circuit"] text', { hasText: /c0c1=\d\d|if c0,c1/ })
    await expect(conds).toHaveCount(3)
    const cursor = (await box.locator('[data-anchor="cursor"] line').boundingBox())!
    const svgBox = (await box.locator('.svg-stage-layer > svg').boundingBox())!
    for (let i = 0; i < 3; i++) {
      const b = (await conds.nth(i).boundingBox())!
      expect(b.x + b.width, `condition ${i} stays left of the cursor line`).toBeLessThanOrEqual(cursor.x + 1)
      expect(b.x, `condition ${i} stays inside the figure`).toBeGreaterThanOrEqual(svgBox.x)
    }
    // the first gate's label is inside its box: "Ry" over "106°", clear of the wire's ket
    const ry = box.locator('svg[data-kind="circuit"] text', { hasText: /^Ry$/ })
    await expect(ry).toHaveCount(1)
    const ket = (await box.locator('svg[data-kind="circuit"] [data-anchor="wires"] text').first().boundingBox())!
    const rb = (await ry.boundingBox())!
    expect(rb.x, 'the gate label starts to the right of the ket').toBeGreaterThan(ket.x + ket.width)
    await toBeat(page, `${EC}:b3`)
    await expect(box.locator('svg[data-kind="circuit"] text', { hasText: /^Rx$/ })).toHaveCount(1)
    await expect(box.locator('svg[data-kind="circuit"] text', { hasText: /^60°$/ })).toHaveCount(1)
    // 5 wires × 11 columns
    await toBeat(page, `${EC}:b4`)
    const wires = await box.locator('svg[data-kind="circuit"] [data-anchor="wires"] line').count()
    expect(wires).toBe(5)
    const f = await page.evaluate((u) => (window.__stage!.frame(`${u}/circuit`) as unknown as { state: { n: number; columns: unknown[] } }).state, EC)
    expect([f.n, f.columns.length]).toEqual([5, 11])
    // the tableau of a state that is an eigenstate of two rows and not of the third: +1, +1 and a dash
    await toBeat(page, `${EC}:b5`)
    await expect(box.locator('svg[data-kind="matrix"] text', { hasText: '—' })).toHaveCount(1)
    // the product grid is X ⊗ X: four 1s on the anti-diagonal
    await toBeat(page, `${EC}:b6`)
    const grid = await page.evaluate((u) => (window.__stage!.frame(`${u}/matrix`) as unknown as { state: { cells: { re: number }[][] } }).state.cells.map((r) => r.map((z) => Math.round(z.re))), EC)
    expect(grid).toEqual([[0, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0], [1, 0, 0, 0]])
    // the tableau split: the circuit above and the Pauli table below
    await toBeat(page, `${EC}:b7`)
    expect(await box.locator('.stage-passport').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.kind))).toEqual(['circuit', 'matrix'])
    await expectNoErrors(errors)
  })

  test('375 px: the reading version draws the same pictures as figures, with a text summary, and nothing scrolls sideways', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('#/709/ch/Q0?track=ground')
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    await page.waitForSelector(`[data-unit="${CODE}"] .svg-still`, { timeout: 30_000 })
    await page.waitForTimeout(800)
    const stills = page.locator(`[data-unit="${CODE}"] .svg-still`)
    const n = await stills.count()
    expect(n).toBe(25)
    for (let i = 0; i < n; i++) {
      await stills.nth(i).scrollIntoViewIfNeeded()
      const svg = stills.nth(i).locator('svg').first()
      const label = (await svg.getAttribute('aria-label')) ?? ''
      expect(label.length, `still ${i + 1} is named`).toBeGreaterThan(10)
      const r = (await svg.boundingBox())!
      expect(r.width, `still ${i + 1} fits the screen`).toBeLessThanOrEqual(375)
      expect(await svg.evaluate((e) => e.getAttribute('viewBox')), `still ${i + 1}`).toMatch(/^0 0 320 \d+$/)
      await stills.nth(i).screenshot({ path: `${SCREENS}/w375-still-${String(i + 1).padStart(2, '0')}.png` })
    }
    // the syndrome of b2 is in the figure's name, in words
    expect(await stills.nth(1).locator('svg').first().getAttribute('aria-label')).toContain('Z1, Z3 read −1')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)
    await expectNoErrors(errors.filter((e) => !KNOWN.test(e)))
  })

  test('print: in Read mode every stage of the code unit has a numbered figure drawn by the same scene, with no placeholder', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1280, height: 860 })
    await page.goto('#/709/ch/Q0?track=ground')
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    await page.getByRole('button', { name: 'Read', exact: true }).click()
    await expect(page.locator('.static-story').first()).toBeVisible()
    await page.emulateMedia({ media: 'print' })
    const figs = page.locator('figure.print-figure[data-kinds="code"]')
    await expect.poll(() => figs.count(), { timeout: 15_000 }).toBeGreaterThanOrEqual(20)
    const titles = await figs.locator('svg.print-fig-svg > title').allTextContents()
    expect(titles.every((t) => /^Fig\. Q0\.\d+: CODE · qubits and checks$/.test(t))).toBe(true)
    const html = await page.locator('.lecture').evaluate((e) => e.innerHTML)
    expect(html).not.toMatch(/no print drawing yet|NaN|Infinity/)
    await page.emulateMedia({ media: 'screen' })
    await expectNoErrors(errors)
  })
})
