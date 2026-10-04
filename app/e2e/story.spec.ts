/**
 * The scroll story end to end (W-L1 §6.2), on the real LecturePage over the DEV demo lecture
 * (`#/dev/lecture/demo`: two story units + one plain unit) until P's L1 story lands; the "real lectures" block
 * also runs on L1 in both projects (production preview with `?measure`). @dev-only: the demo
 * route exists only in DEV builds (StrictMode double effects included).
 *
 *   PW_DEV_PORT=5182 npx playwright test e2e/story.spec.ts --project=dev
 *
 * Installed Google Chrome only (`channel: 'chrome'`, decision #19): never download browsers.
 */
import { expect, test, type Page } from '@playwright/test'
import { beatIds, collectErrors, countContexts, expectNoErrors, waitForStage } from './helpers.ts'

const DEMO = '#/dev/lecture/demo'
const ISLAND = '#/dev/lecture/demo-island'
const STORY_UNITS = ['demo-story', 'demo-ball']
const SCREENS = 'e2e/__screens__/demo'

async function open(page: Page, url = DEMO, units = STORY_UNITS.length) {
  await page.goto(url)
  await waitForStage(page, units)
  await page.waitForFunction(() => (window.__stage?.views() ?? []).some((v) => v.renders > 0), undefined, { timeout: 20_000 })
}

/** A quantum ± outcome in overlay text (independent of the app's own guard): signed count / ħ, %, Born, P(±), ⟨σ⟩. */
const OUTCOME = /[+−±]\s*(\d|ħ)|\d\s*%|Born|P\(\s*[+−]\s*\)|⟨σ/
const CLASSICAL_NOTE = 'classical: continuous band, no ± split'

/** Overlay readouts and labels of a stage box that a reader can see now. */
async function visibleOverlayText(page: Page, unit: string): Promise<string[]> {
  return page.locator(`.story-stage[data-unit="${unit}"]`).evaluate((b) =>
    [...b.querySelectorAll<HTMLElement>('.stage-readout, .stage-label')]
      .filter((el) => {
        const cs = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        return cs.display !== 'none' && Number(cs.opacity) > 0.02 && el.dataset.hidden !== '1' && r.width > 0 && (el.textContent ?? '').trim() !== ''
      })
      .map((el) => (el.textContent ?? '').trim().replace(/\s+/g, ' ')),
  )
}

/**
 * For every beat of every live story unit: scroll to it and check the beat, overlay, views and box. On a beat
 * whose lab model is 'classical' (Round 3 #5) no visible readout or label may show a quantum ± outcome, and the
 * readout column says the classical note. Returns how many classical beats were checked.
 */
async function everyBeat(page: Page, units: readonly string[], screens: string, track: 'ground' | 'formal' = 'ground'): Promise<number> {
  let classical = 0
  for (const unit of units) {
    const ids = await beatIds(page, unit)
    expect(ids.length).toBeGreaterThan(0)
    for (let i = 0; i < ids.length; i++) {
      const r = await page.evaluate((id) => window.__stage!.scrollToBeat(id, { wait: false }), ids[i])
      expect(r.beat, `${ids[i]} selected by scroll`).toBe(i)
      const want = (await page.evaluate(([u, k, tr]) => window.__stage!.layoutOf(u as string, k as number, false, tr as 'ground' | 'formal'), [unit, i, track] as const))!
      const box = page.locator(`.story-stage[data-unit="${unit}"]`)
      if (want.caption) await expect(box.locator('.stage-caption')).toHaveAttribute('data-source', want.caption)
      expect(await box.locator('.stage-passport').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.kind))).toEqual(want.kinds)
      const drawn = await page.evaluate((u) => window.__stage!.views().filter((v) => v.key.startsWith(`${u}/`) && v.weight > 0 && v.screen), unit)
      expect(drawn.map((v) => v.kind).sort(), `${ids[i]} views`).toEqual([...want.kinds].sort())
      await expect(page.locator(`.story-beat[data-beat="${ids[i]}"]`)).toHaveAttribute('data-active', 'true')
      const br = (await box.boundingBox())!
      expect(br.y >= 0 && br.y + br.height <= page.viewportSize()!.height, `${ids[i]} stage box on screen`).toBe(true)
      // screenshot only once the drawn scenes have mounted (lazy scene chunks) and been warmed up
      await page.waitForFunction(
        (u) => window.__stage!.views().filter((v) => v.key.startsWith(`${u}/`) && v.weight > 0).every((v) => v.warmups > 0),
        unit,
        { timeout: 10_000 },
      )
      await page.evaluate(() => window.__stage!.settle())
      if (want.models.includes('classical')) {
        classical++
        const shown = await visibleOverlayText(page, unit)
        const bad = shown.filter((t) => !/^θ\s*=/.test(t) && OUTCOME.test(t))
        expect(bad, `${ids[i]} (classical model) shows a quantum ± outcome; visible: ${JSON.stringify(shown)}`).toEqual([])
        await expect(box.locator('[data-model-note="classical"]')).toHaveText(CLASSICAL_NOTE)
      } else await expect(box.locator('[data-model-note]')).toHaveCount(0)
      await box.screenshot({ path: `${screens}/${ids[i].replace(':', '_')}.png` })
    }
  }
  return classical
}

/** Lectures built in the app (content/index.ts LECTURES); nav.spec checks the topbar lists exactly these. */
export const BUILT = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'] as const

test.describe('real lectures (dev and production preview, `?measure`)', () => {
  for (const L of BUILT)
  test(`${L}: 0 console errors; a canvas only if the lecture has a story; every beat syncs when it does`, async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    // E2E_LECTURE_URL points the same checks at another lecture (e.g. a temporary build with a story)
    await page.goto(process.env.E2E_LECTURE_URL ?? `?measure#/lecture/${L}`)
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    const stories = await page.locator('.story[data-mode="live"]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.unit!))
    if (!stories.length) {
      // before P's story lands: the host is never requested, so no WebGL at all
      await page.waitForTimeout(500)
      expect(await page.locator('canvas').count()).toBe(0)
    } else {
      await waitForStage(page, stories.length)
      // the lecture opener fills the first screen (Phase 4a), so bring the first stage on screen before asking it to draw
      const first = (await beatIds(page, stories[0]))[0]
      await page.evaluate((id) => window.__stage!.scrollToBeat(id, { wait: false }), first)
      await page.waitForFunction(() => (window.__stage?.views() ?? []).some((v) => v.renders > 0), undefined, { timeout: 20_000 })
      const classical = await everyBeat(page, stories, `e2e/__screens__/${L}`)
      console.log(`${L}: ${classical} classical-model beat(s) checked for ± outcomes`)
      if (!process.env.E2E_LECTURE_URL && L === 'L1') expect(classical).toBeGreaterThanOrEqual(1) // l1-quantized:b2
      // one WebGL canvas; a chapter-opener film (L7's belt trick) draws on its own 2D canvas and is not counted
      expect(await page.evaluate(() => [window.__stage!.contexts - window.__stage!.contextsLost, document.querySelectorAll('canvas:not(.opener-canvas)').length])).toEqual([1, 1])
    }
    await expectNoErrors(errors)
  })

  test('L1 overlay emits the hooks D’s CSS styles (D6); passport without a literal ⓘ, ℂ² kept with its word (#9)', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('?measure#/lecture/L1')
    // the lecture is its own chunk: read its stories only once it is on the page (else this test would skip itself)
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    const stories = await page.locator('.story[data-mode="live"]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.unit!))
    test.skip(!stories.includes('l1-quantized'), 'L1 has no live story')
    await waitForStage(page, stories.length)
    // l1-quantized:b1 flags the lab item "lab-glow-not-light" (the opener fills the first screen: scroll, then draw)
    await page.evaluate(() => window.__stage!.scrollToBeat('l1-quantized:b1', { wait: false }))
    await page.waitForFunction(() => (window.__stage?.views() ?? []).some((v) => v.renders > 0), undefined, { timeout: 20_000 })
    const box = page.locator('.story-stage[data-unit="l1-quantized"]')
    const passport = box.locator('.stage-passport[data-slot="full"]')
    await expect(passport).toHaveCount(1)
    await expect(passport).toHaveAttribute('aria-expanded', 'false')
    await expect(passport).toHaveAttribute('data-relevant', '1')
    expect(await passport.textContent()).not.toContain('ⓘ')
    // D's CSS draws the glyph from [aria-expanded] and the "relevant now" dot from [data-relevant='1']
    expect(await passport.evaluate((el) => getComputedStyle(el, '::after').content)).toBe('"ⓘ"')
    expect(await passport.evaluate((el) => getComputedStyle(el, '::before').width)).toBe('6px')
    await expect(box.locator('.stage-readouts')).toHaveCount(1)
    await expect(box.locator('.stage-caption')).toHaveCount(1)
    const labels = box.locator('.stage-label')
    expect(await labels.count()).toBeGreaterThan(2)
    expect(await labels.evaluateAll((els) => els.filter((e) => !e.hasAttribute('data-tier') || !e.hasAttribute('data-tone')).length)).toBe(0)
    // D3: no v1 unit-heading style (2 px underline, capitals) reaches an overlay label
    const axis0 = box.locator('.stage-label[data-label="axis-0"]')
    expect(await axis0.evaluate((el) => [getComputedStyle(el).borderBottomWidth, getComputedStyle(el).textTransform])).toEqual(['0px', 'none'])

    // the drawer: D's selectors match and its visuals apply
    await passport.click()
    const drawer = page.locator('.stage-drawer[role="dialog"]')
    await expect(drawer).toBeVisible()
    await expect(passport).toHaveAttribute('aria-expanded', 'true')
    await expect(drawer.locator('[data-group-title]')).toHaveCount(3)
    expect(await drawer.locator('ul li').count()).toBeGreaterThan(2)
    await expect(drawer.locator('li[data-relevant="1"]')).toHaveCount(1)
    expect(await drawer.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(9, 12, 19, 0.92)')
    await page.keyboard.press('Escape')
    await expect(drawer).toHaveCount(0)

    // hilbert-plane passport: "of ℂ²" is joined by a no-break space and renders on one line
    const planeBeat = await page.evaluate(() => {
      for (const unit of Object.keys(window.__stage!.beats()))
        for (let i = 0, l = window.__stage!.layoutOf(unit, 0); l; l = window.__stage!.layoutOf(unit, ++i))
          if (l.kinds.includes('hilbert-plane')) return { unit, beatId: l.beatId }
      return null
    })
    expect(planeBeat).not.toBeNull()
    await page.evaluate((id) => window.__stage!.scrollToBeat(id, { wait: false }), planeBeat!.beatId)
    const plane = page.locator(`.story-stage[data-unit="${planeBeat!.unit}"] .stage-passport[data-kind="hilbert-plane"]`)
    expect(await plane.textContent()).toContain('of\u00a0ℂ²')
    const tops = await plane.evaluate((el) => {
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const at = n.textContent!.indexOf('of\u00a0ℂ²')
        if (at < 0) continue
        const r = document.createRange()
        r.setStart(n, at)
        r.setEnd(n, at + 4)
        return [...r.getClientRects()].map((x) => Math.round(x.top))
      }
      return []
    })
    expect(tops.length).toBeGreaterThan(0)
    expect(new Set(tops).size, `line tops ${tops}`).toBe(1)
    await expectNoErrors(errors)
  })

  test('D7: measurement tools on window.__stage (bench, contrast, overlaps, audit); __stageD removed', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('?measure#/lecture/L1')
    // the lecture is its own chunk: read its stories only once it is on the page (else this test would skip itself)
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    const stories = await page.locator('.story[data-mode="live"]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.unit!))
    test.skip(!stories.includes('l1-quantized'), 'L1 has no live story')
    await waitForStage(page, stories.length)
    await page.evaluate(() => window.__stage!.scrollToBeat('l1-quantized:b3', { wait: false }))
    await page.waitForFunction(() => (window.__stage?.views() ?? []).some((v) => v.renders > 0), undefined, { timeout: 20_000 })
    await page.waitForFunction(() => window.__stage!.views().filter((v) => v.key.startsWith('l1-quantized/') && v.weight > 0).every((v) => v.warmups > 0), undefined, { timeout: 10_000 })

    const b = (await page.evaluate(() => window.__stage!.bench('l1-quantized', [2.5], 8)))!
    expect(b.per['2.50'].n).toBe(8)
    expect(b.per['2.50'].p95).toBeGreaterThan(0)
    const a = (await page.evaluate(() => window.__stage!.audit('l1-quantized', [2.5, 3.5])))!
    expect(a.rows.map((r) => r.u)).toEqual([2.5, 3.5])
    expect(a.rows[0].labels).toBeGreaterThan(0)
    expect(Number.isFinite(a.worst)).toBe(true)
    console.log(`audit l1-quantized b3/b4: worst ${a.worst}:1 (${a.worstAt}); overlaps ${a.overlaps.length}; bench p95 ${b.all.p95} ms`)
    const visible = await page.evaluate(() => window.__stage!.contrast({ visible: true }))
    expect(visible.length).toBeGreaterThan(0)
    expect(visible.every((r) => r.ratio > 0 && r.worstPixel.startsWith('#'))).toBe(true)
    expect(Array.isArray(await page.evaluate(() => window.__stage!.overlaps()))).toBe(true)
    // D's interim __stageD was removed in round 3b (S-R3-01); window.__stage is the only measurement surface
    expect(await page.evaluate(() => 'undefined' === typeof (window as unknown as { __stageD?: unknown }).__stageD)).toBe(true)
    await expectNoErrors(errors)
  })
})

test.describe('@dev-only story on the demo lecture', () => {
  test('every beat: scroll selects it, overlay and views follow the layout; 1 WebGL context; 0 console errors', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page)
    await everyBeat(page, STORY_UNITS, SCREENS)
    // mid-hold, every drawn view has full weight (no half-faded pane)
    for (const unit of STORY_UNITS) {
      const ids = await beatIds(page, unit)
      expect(ids.length).toBeGreaterThan(1)
      await page.evaluate((id) => window.__stage!.scrollToBeat(id, { wait: false }), ids[ids.length - 1])
      const drawn = await page.evaluate((u) => window.__stage!.views().filter((v) => v.key.startsWith(`${u}/`) && v.weight > 0), unit)
      expect(drawn.every((v) => v.weight === 1)).toBe(true)
    }
    // warm-up runs for every mounted view (a view that re-mounted after scrolling back warms up one frame later)
    await expect
      .poll(async () => {
        const views = await page.evaluate(() => window.__stage!.views())
        return views.length > 0 && views.every((v) => v.warmups >= 1)
      })
      .toBe(true)
    expect(await page.evaluate(() => [window.__stage!.contexts, window.__stage!.contextsLost, document.querySelectorAll('canvas').length])).toEqual([1, 0, 1])
    await expectNoErrors(errors)
  })

  test('clue beats: the stage holds the question picture until "Show me" is clicked', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page)
    await page.evaluate(() => window.__stage!.scrollToBeat('demo-story:b4', { wait: false }))
    const shadows = () => page.evaluate(() => window.__stage!.frame('demo-story/hilbert-plane')!.state.shadows as number)
    expect(await shadows()).toBe(0)
    const article = page.locator('.story-beat[data-beat="demo-story:b4"]')
    await expect(article.getByText('its square is the probability')).toHaveCount(0)
    await article.getByRole('button', { name: 'Show me' }).click()
    await expect(article.getByText('its square is the probability')).toBeVisible()
    await expect.poll(shadows, { timeout: 3000 }).toBe(1)
    const want = (await page.evaluate(() => window.__stage!.layoutOf('demo-story', 3, true)))!
    await expect(page.locator('.story-stage[data-unit="demo-story"] .stage-caption')).toHaveAttribute('data-source', want.caption!)
    expect((await page.evaluate(() => window.__stage!.beats()['demo-story'].revealed))).toEqual([3])
    // the reveal changed the layout (full plane → split lab | plane): passports and drawn views follow it
    expect(want.kinds).toEqual(['lab-r3', 'hilbert-plane'])
    await expect
      .poll(() => page.locator('.story-stage[data-unit="demo-story"] .stage-passport').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.slot)))
      .toEqual(['top', 'bottom'])
    await expect
      .poll(() => page.evaluate(() => window.__stage!.views().filter((v) => v.key.startsWith('demo-story/') && v.weight === 1).map((v) => `${v.kind}:${v.slot}`).sort()))
      .toEqual(['hilbert-plane:bottom', 'lab-r3:top'])
    // the lower view reads out in its own column, inside its own half (L6 QA: never under the upper view's numbers)
    const lower = page.locator('.story-stage[data-unit="demo-story"] .stage-readouts[data-slot="bottom"]')
    await expect(lower).toHaveCount(1)
    const [stageBox, lowerBox] = [await page.locator('.story-stage[data-unit="demo-story"]').boundingBox(), await lower.boundingBox()]
    expect(lowerBox!.y - stageBox!.y).toBeGreaterThan(stageBox!.height / 2)
    // and back
    await article.getByRole('button', { name: 'Hide the answer' }).click()
    await expect.poll(shadows, { timeout: 3000 }).toBe(0)
    await expect(lower).toHaveCount(0)
    // second unit: the reveal adds the recipe
    await page.evaluate(() => window.__stage!.scrollToBeat('demo-ball:b2', { wait: false }))
    const recipe = () => page.evaluate(() => window.__stage!.frame('demo-ball/bloch-ball')!.state.recipe)
    expect(await recipe()).toBeNull()
    await page.locator('.story-beat[data-beat="demo-ball:b2"]').getByRole('button', { name: 'Show me' }).click()
    await expect.poll(async () => (await recipe()) !== null, { timeout: 3000 }).toBe(true)
    await expectNoErrors(errors)
  })

  test('trigger hygiene across route round-trips; the one canvas survives them', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page)
    const triggers = () => page.evaluate(() => window.__stage!.triggers())
    expect(await triggers()).toBe(STORY_UNITS.length)
    // "Away" routes must have no story. L1 gained a real story when P merged, so it is checked separately:
    // it must own exactly one trigger per story unit, and leaving it must release them all.
    for (const away of ['#/', '#/formulas', '#/help']) {
      await page.goto(away)
      await expect.poll(triggers).toBe(0)
      await expect.poll(() => page.evaluate(() => [Object.keys(window.__stage!.beats()).length, window.__stage!.views().length])).toEqual([0, 0])
      await open(page)
      expect(await triggers()).toBe(STORY_UNITS.length)
    }
    await page.goto('#/lecture/L1')
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    const l1Units = await page.evaluate(() => document.querySelectorAll('section.unit-story').length)
    expect(l1Units).toBeGreaterThan(0)
    await expect.poll(triggers).toBe(l1Units)
    await open(page)
    expect(await triggers()).toBe(STORY_UNITS.length)
    expect(await page.evaluate(() => [window.__stage!.contexts, window.__stage!.contextsLost, document.querySelectorAll('canvas').length])).toEqual([1, 0, 1])
    await expectNoErrors(errors)
  })

  test('stacking: passport, caption and labels sit above the canvas; the canvas above the dark column', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page)
    await page.evaluate(() => window.__stage!.scrollToBeat('demo-story:b1', { wait: false }))
    const probe = await page.evaluate(() => {
      // hit-testing skips `pointer-events: none` (the canvas, the overlay): make them hittable for the probe
      const probeCss = document.createElement('style')
      probeCss.textContent = '.stage-canvas, .stage-canvas *, .stage-overlay, .stage-overlay * { pointer-events: auto !important }'
      document.head.appendChild(probeCss)
      const out: { what: string; top: boolean; canvasAboveCol: boolean }[] = []
      document.querySelectorAll<HTMLElement>('.story-stage[data-unit="demo-story"] .stage-passport, .story-stage[data-unit="demo-story"] .stage-caption').forEach((el) => {
        const r = el.getBoundingClientRect()
        const stack = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        const iCanvas = stack.findIndex((e) => e.classList.contains('stage-canvas') || e.parentElement?.classList.contains('stage-canvas'))
        const iCol = stack.findIndex((e) => e.classList.contains('story-stage-col'))
        out.push({ what: el.className, top: el.contains(stack[0]), canvasAboveCol: iCanvas >= 0 && iCol >= 0 && iCanvas < iCol })
      })
      probeCss.remove()
      return out
    })
    expect(probe.length).toBeGreaterThan(1)
    for (const p of probe) expect(p, JSON.stringify(p)).toEqual({ what: p.what, top: true, canvasAboveCol: true })
  })

  test('overlay contrast ≥ 4.5 : 1 over the rendered stage at every beat (gate method)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page)
    const rows = await page.evaluate(() => window.__stage!.contrastAll())
    expect(rows.length).toBeGreaterThan(0)
    const worst = rows[0]
    console.log(`contrast: ${rows.length} elements, worst ${worst.ratio}:1 (${worst.kind} "${worst.text}" at ${worst.atBeat})`)
    expect(worst.ratio).toBeGreaterThanOrEqual(4.5)
  })

  test('fidelity drawer and gloss popover are accessible (keyboard, Esc, focus return)', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page)
    await page.evaluate(() => window.__stage!.scrollToBeat('demo-story:b1', { wait: false }))
    const passport = page.locator('.story-stage[data-unit="demo-story"] .stage-passport').first()
    await passport.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(passport).toHaveAttribute('aria-expanded', 'true')
    await expect(dialog.locator('[data-relevant="1"]')).toHaveCount(1) // b1 flags lab-glow-not-light
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(passport).toBeFocused()
    // gloss: focus opens a tooltip portalled to <body>; Esc closes it
    const gloss = page.locator('.story-beat[data-beat="demo-story:b1"] .gloss').first()
    await gloss.focus()
    const tip = page.getByRole('tooltip')
    await expect(tip).toBeVisible()
    expect(await tip.evaluate((el) => el.parentElement === document.body)).toBe(true)
    await expect(gloss).toHaveAttribute('aria-describedby', (await tip.getAttribute('id'))!)
    await page.keyboard.press('Escape')
    await expect(tip).toHaveCount(0)
    // a gloss inside a stage caption (inset beat) is reachable too: hover opens it
    await page.evaluate(() => window.__stage!.scrollToBeat('demo-story:b3', { wait: false }))
    const captionGloss = page.locator('.story-stage[data-unit="demo-story"] .stage-caption .gloss')
    await captionGloss.hover()
    await expect(page.getByRole('tooltip')).toBeVisible()
    await page.mouse.move(5, 5)
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    // nested \htmlClass terms in one formula: hovering the inner term focuses it (not the outer one),
    // and the stage frame of that kind sees the inner term's anchor
    const focus = () => page.evaluate(() => (window.__stage as unknown as { store: { focusTerm: string | null } }).store.focusTerm)
    const b3 = page.locator('.story-beat[data-beat="demo-story:b3"]')
    await b3.locator('.enclosing.term-amp').first().hover()
    expect(await focus()).toBe('amp')
    await expect.poll(() => page.evaluate(() => window.__stage!.frame('demo-story/hilbert-plane')!.state && (window.__stage!.frame('demo-story/hilbert-plane') as unknown as { focus: string | null }).focus)).toBe('shadow-1')
    await b3.locator('.term[data-term="inset-magnet"]').hover()
    expect(await focus()).toBe('inset-magnet')
    await page.mouse.move(5, 5)
    await expect.poll(focus).toBe(null)
    await expectNoErrors(errors)
  })

  test('context loss → StaticStory within 1 s; restore → the live stage again (one remount)', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page)
    expect(await page.evaluate(() => window.__stage!.loseContext())).toBe(true)
    await expect(page.locator('.static-story')).toHaveCount(STORY_UNITS.length, { timeout: 1000 })
    await expect(page.locator('.story[data-mode="live"]')).toHaveCount(0)
    expect(await page.evaluate(() => window.__stage!.restoreContext())).toBe(true)
    await expect(page.locator('.story[data-mode="live"]')).toHaveCount(STORY_UNITS.length, { timeout: 5000 })
    await page.waitForFunction(() => (window.__stage?.views() ?? []).some((v) => v.renders > 0), undefined, { timeout: 10_000 })
    // the remount made a fresh context; exactly one is alive
    const [created, lost, canvases] = await page.evaluate(() => [window.__stage!.contexts, window.__stage!.contextsLost, document.querySelectorAll('canvas').length])
    expect(created - lost).toBe(1)
    expect(canvases).toBe(1)
    await expectNoErrors(errors)
  })
})

/** Written 709 chapters whose stages include a WebGL kind (one shared canvas): every beat, in both tracks. */
export const BUILT_709_GL = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q8'] as const

/** Minimum classical-model beats each BUILT_709_GL chapter must show, keyed by chapter (default 0: not every chapter teaches the classical/quantum contrast). */
const MIN_CLASSICAL: Partial<Record<(typeof BUILT_709_GL)[number], number>> = { Q1: 1 } // q1-two-spots:b4

test.describe('709 chapters (dev and production preview, `?measure`)', () => {
  for (const C of BUILT_709_GL)
    for (const track of ['ground', 'formal'] as const)
      test(`${C} ${track}: 0 console errors; one canvas; every beat syncs in its track (passports, drawn views, caption)`, async ({ page }) => {
        const errors = collectErrors(page)
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto(`?measure#/709/ch/${C}?track=${track}`)
        await expect(page.locator('.lecture-head h1')).toBeVisible()
        const stories = await page.locator('.story[data-mode="live"]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.unit!))
        expect(stories.length).toBeGreaterThan(0)
        await waitForStage(page, stories.length)
        const first = (await beatIds(page, stories[0]))[0]
        await page.evaluate((id) => window.__stage!.scrollToBeat(id, { wait: false }), first)
        await page.waitForFunction(() => (window.__stage?.views() ?? []).some((v) => v.renders > 0), undefined, { timeout: 20_000 })
        const classical = await everyBeat(page, stories, `e2e/__screens__/709/${C}-${track}`, track)
        console.log(`${C} ${track}: ${classical} classical-model beat(s) checked for ± outcomes`)
        expect(classical).toBeGreaterThanOrEqual(MIN_CLASSICAL[C] ?? 0)
        expect(await page.evaluate(() => [window.__stage!.contexts - window.__stage!.contextsLost, document.querySelectorAll('canvas:not(.opener-canvas)').length])).toEqual([1, 1])
        await expectNoErrors(errors)
      })
})

/**
 * The 709 stage kinds (W-709-platform §E; content/stage.ts KIND_RENDER) on the DEV demo chapter Q0: a WebGL unit
 * (q0-demo-sphere) and an SVG-only unit (q0-demo-kinds: complex-plane, amplitudes, circuit and their split), checked
 * beat by beat exactly as a 448 lecture is, in both tracks. SVG views are DOM in the stage box: the one canvas is the
 * WebGL unit's.
 */
test.describe('@dev-only the 709 demo chapter: WebGL and SVG stage kinds', () => {
  for (const track of ['ground', 'formal'] as const)
    test(`${track}: every beat syncs (passports, drawn views, caption); SVG views are DOM; 0 console errors`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(`#/709/ch/Q0?track=${track}`)
      await expect(page.locator('.lecture-head h1')).toBeVisible()
      const stories = await page.locator('.story[data-mode="live"]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.unit!))
      expect(stories).toContain('q0-demo-kinds')
      await waitForStage(page, stories.length)
      const svgKinds = await page.evaluate(() => {
        const ks = new Set<string>()
        for (let i = 0, l = window.__stage!.layoutOf('q0-demo-kinds', 0); l; l = window.__stage!.layoutOf('q0-demo-kinds', ++i)) l.kinds.forEach((k) => ks.add(k))
        return [...ks].sort()
      })
      expect(svgKinds.length).toBeGreaterThan(0)
      await everyBeat(page, stories, `e2e/__screens__/709/Q0-${track}`, track)
      // the SVG unit draws DOM (one <svg> per drawn kind, in its slot), never a canvas of its own
      await page.evaluate(() => window.__stage!.scrollToBeat('q0-demo-kinds:b1', { wait: false }))
      await expect(page.locator('.story-stage[data-unit="q0-demo-kinds"] .svg-stage-layer > svg')).toHaveCount(1)
      expect(await page.evaluate(() => [window.__stage!.contexts - window.__stage!.contextsLost, document.querySelectorAll('canvas').length])).toEqual([1, 1])
      await expectNoErrors(errors)
    })

  test('an SVG clue reveals by click and scrubs by scroll; its readouts sit in the overlay column', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('#/709/ch/Q0')
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    await page.waitForFunction(() => !!window.__stage?.beats()['q0-demo-kinds'])
    const clue = await page.evaluate(() => {
      const t = window.__stage!.beats()['q0-demo-kinds']
      void t
      for (let i = 0, l = window.__stage!.layoutOf('q0-demo-kinds', 0); l; l = window.__stage!.layoutOf('q0-demo-kinds', ++i)) if (l.hasReveal) return l.beatId
      return null
    })
    expect(clue).not.toBeNull()
    await page.evaluate((id) => window.__stage!.scrollToBeat(id!, { wait: false }), clue)
    const frame = () => page.evaluate(() => window.__stage!.frame('q0-demo-kinds/complex-plane') as unknown as { state: { chain: unknown; spokes: unknown } } | null)
    expect((await frame())!.state.chain).toBeNull()
    await page.locator(`.story-beat[data-beat="${clue}"]`).getByRole('button', { name: 'Show me' }).click()
    await expect.poll(async () => (await frame())!.state.chain !== null, { timeout: 3000 }).toBe(true)
    await expect(page.locator('.story-stage[data-unit="q0-demo-kinds"] .stage-readout').first()).toContainText('sum = ')
    // a scrubbed beat: the hold moves the number (the complex-plane sweep of b5)
    const phiAt = async (at: number) => {
      await page.evaluate((a) => window.__stage!.scrollToBeat('q0-demo-kinds:b5', { wait: false, at: a }), at)
      return page.evaluate(() => (window.__stage!.frame('q0-demo-kinds/complex-plane') as unknown as { state: { z: { phi: number } } }).state.z.phi)
    }
    expect(await phiAt(0.8)).toBeGreaterThan(await phiAt(0.4))
    await expectNoErrors(errors)
  })
})

/**
 * Written Physics 709 chapters (content/qc709/meta.generated.ts), checked beat by beat in both tracks exactly as a 448
 * lecture is, in both projects (production preview with `?measure`). F1's stages are all SVG kinds (complex-plane,
 * amplitudes), so the chapter runs live with no WebGL canvas at all.
 */
export const BUILT_709_SVG = ['F1', 'Q6', 'Q7'] as const

test.describe('real 709 chapters (dev and production preview, `?measure`)', () => {
  for (const ch of BUILT_709_SVG)
    for (const track of ['ground', 'formal'] as const)
      test(`${ch} ${track}: 0 console errors; every beat syncs (passports, drawn views, caption); no canvas`, async ({ page }) => {
        const errors = collectErrors(page)
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto(`?measure#/709/ch/${ch}?track=${track}`)
        await expect(page.locator('.lecture-head h1')).toBeVisible()
        const stories = await page.locator('.story[data-mode="live"]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.unit!))
        expect(stories.length).toBeGreaterThan(0)
        await waitForStage(page, stories.length)
        // the chapter opener fills the first screen: bring the first stage on screen before asking it to draw
        const first = (await beatIds(page, stories[0]))[0]
        await page.evaluate((id) => window.__stage!.scrollToBeat(id, { wait: false }), first)
        await everyBeat(page, stories, `e2e/__screens__/709/${ch}-${track}`, track)
        // SVG stages are DOM in the stage box: an all-SVG chapter never creates a canvas
        expect(await page.locator('canvas').count()).toBe(0)
        await expectNoErrors(errors)
      })
})

test.describe('@dev-only reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('scroll still selects the beat; every change is a cut; sweeps snap to 3 stops; the clock stands still', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page)
    expect(await page.evaluate(() => window.__stage!.motion())).toBe(false)
    // just past the b1 → b2 boundary (inside the transition window under full motion): a cut, u = uRaw
    const r = await page.evaluate(() => window.__stage!.scrollToBeat('demo-story:b2', { wait: false, at: 0.05 }))
    expect(r.beat).toBe(1)
    expect(r.u).toBe(r.uRaw)
    const f = await page.evaluate(() => window.__stage!.frame('demo-story/lab-r3')!)
    expect(f.t).toBe(0)
    // the θ sweep of b2 only ever shows 0°, 90° or 180°
    const tilts = new Set<number>()
    for (const at of [0.1, 0.3, 0.45, 0.5, 0.55, 0.7, 0.9]) {
      await page.evaluate((a) => window.__stage!.scrollToBeat('demo-story:b2', { wait: false, at: a }), at)
      const s = await page.evaluate(() => window.__stage!.frame('demo-story/lab-r3')!.state as { benches: { tilts: number[] }[] })
      tilts.add(Math.round((s.benches[0].tilts[0] * 180) / Math.PI))
    }
    expect([...tilts].every((t) => [0, 90, 180].includes(t)), [...tilts].join(',')).toBe(true)
    // clock frozen: two frames 500 ms apart
    const c1 = await page.evaluate(() => window.__stage!.frame('demo-story/lab-r3')!.clock)
    await page.waitForTimeout(500)
    const c2 = await page.evaluate(() => window.__stage!.frame('demo-story/lab-r3')!.clock)
    expect(c2).toBe(c1)
    // a reveal is a cut too: the next frame already shows the answer picture
    await page.evaluate(() => window.__stage!.scrollToBeat('demo-story:b4', { wait: false }))
    await page.locator('.story-beat[data-beat="demo-story:b4"]').getByRole('button', { name: 'Show me' }).click()
    await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))))
    const pf = await page.evaluate(() => window.__stage!.frame('demo-story/hilbert-plane')!)
    expect([pf.t, pf.state.shadows]).toEqual([0, 1])
    await expectNoErrors(errors)
  })
})

test.describe('@dev-only the 709 demo chapter: Q1’s fields on the shared kinds', () => {
  test('the plane’s sum and the 709 names; the sphere’s north pole; the bench’s drawn split grows on reveal', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('#/709/ch/Q0')
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    await page.waitForFunction(() => !!window.__stage?.beats()['q0-demo-fields'])
    await page.evaluate(() => window.__stage!.scrollToBeat('q0-demo-fields:b1', { wait: false }))
    await page.waitForFunction(() => window.__stage!.views().some((v) => v.key === 'q0-demo-fields/hilbert-plane' && v.warmups > 0), undefined, { timeout: 10_000 })
    const plane = () => page.evaluate(() => (window.__stage!.frame('q0-demo-fields/hilbert-plane') as unknown as { state: { sum: { len: number } | null } }).state)
    expect((await plane()).sum!.len).toBeCloseTo(2 * Math.cos(Math.PI / 8), 6)
    const box = page.locator('.story-stage[data-unit="q0-demo-fields"]')
    await expect(box.locator('.stage-readout', { hasText: '|sum| = 1.848' })).toHaveCount(1)
    // 709 names the z frame |0⟩ = |+z⟩ (448 keeps |↑⟩ = |+z⟩)
    await expect(box.locator('.stage-label[data-label="e1"]')).toContainText('0')
    // the drawer shows 709's added note on this beat, flagged
    await box.locator('.stage-passport[data-kind="hilbert-plane"]').click()
    await expect(page.locator('.stage-drawer li[data-relevant="1"]')).toContainText('Only arrows of length 1 are states')
    await page.keyboard.press('Escape')
    // the sphere: the 709 passport names the north pole
    await page.evaluate(() => window.__stage!.scrollToBeat('q0-demo-fields:b3', { wait: false }))
    await expect(box.locator('.stage-passport[data-kind="bloch"]')).toContainText('north pole |0⟩ = |+z⟩')
    // the bench: the drawn split goes 0.5 → 1 on reveal; the fractions do not change
    await page.evaluate(() => window.__stage!.scrollToBeat('q0-demo-fields:b4', { wait: false }))
    const lab = () => page.evaluate(() => (window.__stage!.frame('q0-demo-fields/lab-r3') as unknown as { state: { gradientScale: number; benches: { theory: { plus: number } }[] } }).state)
    expect((await lab()).gradientScale).toBe(0.5)
    await page.locator('.story-beat[data-beat="q0-demo-fields:b4"]').getByRole('button', { name: 'Show me' }).click()
    await expect.poll(async () => (await lab()).gradientScale, { timeout: 3000 }).toBe(1)
    expect((await lab()).benches[0].theory.plus).toBe(0.5)
    await expectNoErrors(errors)
  })
})

test.describe('@dev-only reduced motion: an SVG kind', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the SVG unit stays live; its sweep snaps to 3 stops and a beat change is a cut', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('#/709/ch/Q0')
    await expect(page.locator('.story[data-unit="q0-demo-kinds"][data-mode="live"]')).toHaveCount(1)
    await page.waitForFunction(() => !!window.__stage?.beats()['q0-demo-kinds'])
    expect(await page.evaluate(() => window.__stage!.motion())).toBe(false)
    const angles = new Set<number>()
    for (const at of [0.1, 0.3, 0.45, 0.5, 0.55, 0.7, 0.9]) {
      await page.evaluate((a) => window.__stage!.scrollToBeat('q0-demo-kinds:b5', { wait: false, at: a }), at)
      const f = await page.evaluate(() => window.__stage!.frame('q0-demo-kinds/complex-plane') as unknown as { t: number; state: { z: { phi: number } } })
      expect(f.t).toBe(0)
      angles.add(Math.round((f.state.z.phi * 180) / Math.PI))
    }
    expect([...angles].every((a) => [0, 90, 180].includes(a)), [...angles].join(',')).toBe(true)
    await expectNoErrors(errors)
  })
})

test.describe('@dev-only narrow and islands', () => {
  test('< 900 px: StaticStory, 0 canvases, 0 WebGL contexts; every beat and the 2D widgets are present', async ({ page }) => {
    const errors = collectErrors(page)
    await countContexts(page)
    await page.setViewportSize({ width: 800, height: 900 })
    await page.goto(DEMO)
    await expect(page.locator('.static-story')).toHaveCount(STORY_UNITS.length)
    await expect(page.locator('.story[data-mode="live"]')).toHaveCount(0)
    for (const id of ['demo-story:b1', 'demo-story:b2', 'demo-story:b3', 'demo-story:b4', 'demo-ball:b1', 'demo-ball:b2'])
      await expect(page.locator(`.static-beat[data-beat="${id}"]`)).toHaveCount(1)
    await expect(page.locator('.static-story .widget').first()).toBeVisible()
    await page.mouse.wheel(0, 4000)
    await page.waitForTimeout(500)
    expect(await page.evaluate(() => [document.querySelectorAll('canvas').length, window.__ctxCount ?? 0])).toEqual([0, 0])
    // crossing 900 px swaps to the live stage and keeps the reading position on the current beat
    await page.locator('.static-beat[data-beat="demo-story:b2"]').scrollIntoViewIfNeeded()
    await page.evaluate(() => document.querySelector('.static-beat[data-beat="demo-story:b2"]')!.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(200)
    await page.setViewportSize({ width: 1200, height: 900 })
    await expect(page.locator('.story[data-mode="live"]')).toHaveCount(STORY_UNITS.length)
    await expect
      .poll(() => page.evaluate(() => {
        const el = document.querySelector('.story-beat[data-beat="demo-story:b2"]')!.getBoundingClientRect()
        return el.top < innerHeight / 2 && el.bottom > innerHeight / 2
      }))
      .toBe(true)
    await expectNoErrors(errors)
  })

  test('widget island: the 3D Bloch widget draws on the shared canvas (still 1 WebGL context)', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page, ISLAND, 1)
    const island = page.locator('.widget-island')
    await island.scrollIntoViewIfNeeded()
    await expect.poll(() => page.evaluate(() => window.__stage!.islands().map((i) => i.renders > 0)), { timeout: 10_000 }).toEqual([true])
    expect(await page.evaluate(() => [window.__stage!.contexts, document.querySelectorAll('canvas').length])).toEqual([1, 1])
    await expect(island.locator('canvas')).toHaveCount(0)
    // labels are projected into the widget
    await expect.poll(() => island.locator('.island-label').evaluateAll((els) => els.filter((e) => (e as HTMLElement).style.opacity !== '0').length)).toBeGreaterThan(2)
    await expectNoErrors(errors)
  })
})
