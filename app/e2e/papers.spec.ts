/**
 * The Papers section (docs/specs/papers-platform.md §6; rulings papers.md R1–R5). Runs in both projects.
 *   PW_PREVIEW_PORT=5271 npx playwright test e2e/papers.spec.ts --project=preview
 * The switcher lists Papers third and the document takes its identity; the shelf (the P1 card: authors, arXiv id + version,
 * licence, its three pages; the planned background chapters); a cold deep link to the stub lecture (paper card, two tracks,
 * the "The paper says" phase, the Reported block with its screen-reader text, the trail line); the trail link opening the
 * reference's entry on References used (depth, cited vs read, where taught, the step that relies on it, and back); the
 * prerequisite map (one line per teaching chapter, each station linked to its unit, a planned chapter in preparation, the
 * relations drawn and said); a bridge into 709 and the return bar back to the exact beat; 375 px with no sideways scroll;
 * print notes. 0 console errors and (preview) 0 CSP violations throughout. Screens for visual QA (1280 and 375) go to
 * e2e/__screens__/papers/ (git-ignored).
 */
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

const SCREENS = fileURLToPath(new URL('./__screens__/papers/', import.meta.url))
const course = (page: Page) => page.evaluate(() => document.documentElement.dataset.course)

declare global {
  interface Window {
    __csp?: string[]
  }
}

test.beforeEach(async ({ page }) => {
  // CSP violations from the first byte (the <meta> policy exists in the built app; the dev server has none, so 0 there too)
  await page.addInitScript(() => {
    window.__csp = []
    document.addEventListener('securitypolicyviolation', (e) => window.__csp!.push(`${e.violatedDirective} ← ${e.blockedURI || 'inline'}`))
  })
})
const expectNoCsp = async (page: Page) => expect(await page.evaluate(() => window.__csp ?? [])).toEqual([])

/** The beat article under the viewport centre line (live or static), or null. */
const beatAtCentre = (page: Page) =>
  page.evaluate(() => {
    const mid = innerHeight / 2
    for (const el of document.querySelectorAll<HTMLElement>('.story-beat[data-beat], .static-beat[data-beat]')) {
      const r = el.getBoundingClientRect()
      if (r.height && r.top <= mid && r.bottom >= mid) return el.dataset.beat ?? null
    }
    return null
  })

test('the switcher lists Papers third; the shelf shows the paper card and the planned background chapters', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/')
  await page.getByRole('button', { name: /^Course: / }).click()
  const panel = page.getByRole('region', { name: 'Switch course' })
  await expect(panel.locator('.co-name')).toHaveText(['Physics 448 · Spin Lab', 'Physics 709 · Quantum computing', 'Papers · Research papers'])
  await panel.getByRole('link', { name: 'Papers · Research papers' }).click()
  await expect(page).toHaveURL(/#\/papers$/)
  await expect(page.locator('main h1')).toHaveText('The reading desk')
  expect(await course(page)).toBe('papers')
  await expect(page).toHaveTitle('Spin Lab — Papers')
  await expect(page.getByRole('button', { name: /^Course: / })).toHaveAccessibleName('Course: Papers, Research papers. Switch course')
  // the nav speaks the section's words: the shelf, no Arcade or formula sheet
  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link', { name: 'Shelf' })).toHaveAttribute('href', '#/papers')
  await expect(nav.getByRole('link', { name: 'Arcade' })).toHaveCount(0)

  const card = page.locator('.paper-card[data-paper="P1"]')
  await expect(card.locator('h3')).toHaveText('Tour de gross')
  await expect(card.locator('.paper-authors')).toContainText('Yoder, Schoute, Rall, Pritchett, Gambetta, Cross, Carroll, Beverland')
  await expect(card.getByRole('link', { name: /arXiv:2506\.03094v1/ })).toHaveAttribute('href', 'https://arxiv.org/abs/2506.03094v1')
  await expect(card.locator('.paper-ids')).toContainText('June 2025')
  await expect(card.locator('.paper-licence')).toContainText('arXiv non-exclusive distribution licence')
  await expect(card.locator('[data-paper-link]')).toHaveText(['The lecture', 'References used (14)', 'Prerequisites (72)'])
  await expect(page.locator('.planned-background')).toContainText('quantum LDPC')
  // B1, the surface code, is written: its card is on the shelf and it is no longer "planned"
  await expect(page.locator('.paper-card[data-paper="B1"] h3')).toContainText('surface code')
  await expect(page.locator('.planned-background')).not.toContainText('the surface code')
  // B2, quantum LDPC and bivariate bicycle codes, is written too
  await expect(page.locator('.paper-card[data-paper="B2"] h3')).toContainText('bicycle')
  // B3, logical measurement and lattice surgery, is written too
  await expect(page.locator('.paper-card[data-paper="B3"] h3')).toContainText('logical operators')
  await expect(page.locator('.planned-background')).not.toContainText('lattice surgery')
  // B4, magic states and Pauli-based computation, is written too
  await expect(page.locator('.paper-card[data-paper="B4"] h3')).toContainText('Magic states')
  await expect(page.locator('.planned-background')).not.toContainText('magic states')
  await expectNoErrors(errors)
  await expectNoCsp(page)
})

test('a cold deep link to the lecture P1: the paper card, two tracks, the Reported block and the trail line', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/papers/ch/P1')
  await expect(page.locator('.lecture-head h1')).toHaveAccessibleName('Tour de gross: a computer built from code modules')
  expect(await course(page)).toBe('papers')
  await expect(page.locator('.lecture-head .eyebrow').first()).toHaveText('Chapter P1')
  const aside = page.locator('.paper-aside')
  await expect(aside).toContainText('Tour de gross')
  await expect(aside.getByRole('link', { name: 'References used (14)' })).toHaveAttribute('href', '#/papers/refs/P1')
  await expect(page.getByRole('group', { name: 'Which track' }).first()).toBeVisible()

  const b1 = page.locator('[data-beat="p1-criteria:b1"]')
  await expect(b1.locator('.eyebrow').first()).toHaveText('The paper says')
  const b2 = page.locator('[data-beat="p1-criteria:b2"]')
  const rep = b2.locator('.reported[data-reported="t1-u"]')
  await expect(rep.locator('.reported-badge')).toHaveText('Reported')
  await expect(rep.locator('.reported-value')).toHaveText('90')
  await expect(rep.locator('.reported-where')).toHaveText('Table 1, p. 6')
  await expect(rep.locator('.visually-hidden')).toHaveText('Reported by the paper, Table 1, page 6: ')
  // a reported number never sits among the engine's: its own list, its own colour
  await expect(b2.getByRole('list', { name: 'Numbers reported by the paper' })).toHaveCount(1)
  await expect(b1.locator('.trail-line')).toContainText('This step relies on Litinski 2019, §2 rules list')
  await expect(b1.locator('.trail-ref')).toHaveAttribute('href', '#/papers/refs/P1#ref-lit19a')

  // a lower-case id is the same chapter, at its canonical URL
  await page.goto('#/papers/ch/p1')
  await expect(page).toHaveURL(/#\/papers\/ch\/P1$/)
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  // and an unknown chapter says so
  await page.goto('#/papers/ch/P9')
  await expect(page.locator('main h1')).toHaveText('No chapter called “P9”')
  await expectNoErrors(errors)
  await expectNoCsp(page)
})

test('the trail link opens the reference’s entry on References used, which leads back to the step', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/papers/ch/P1')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  await page.locator('[data-beat="p1-criteria:b1"] .trail-ref').click()
  await expect(page).toHaveURL(/#\/papers\/refs\/P1#ref-lit19a$/)
  await expect(page.locator('main h1')).toHaveText('References used')
  const entry = page.locator('#ref-lit19a')
  await expect(entry).toHaveAttribute('data-target', 'true')
  await expect(entry).toBeInViewport()
  await expect(entry.locator('h2')).toHaveText('Litinski 2019')
  await expect(entry.locator('.ref-depth')).toHaveText('Depth 1 · cited by the paper')
  await expect(entry.locator('.ref-status')).toContainText('Read: ')
  await expect(entry.getByRole('link', { name: /arXiv:1808\.02892/ })).toHaveAttribute('href', 'https://arxiv.org/abs/1808.02892')
  await expect(entry).toContainText('Where the idea is taught: Papers · Chapter B4')
  await expect(entry).not.toContainText('(planned, not written yet)')
  const step = entry.locator('.ref-steps a').first()
  await expect(step).toContainText('What a full quantum computer needs')
  await step.click()
  await expect(page).toHaveURL(/#\/papers\/ch\/P1$/) // at / f leave the URL once the place is restored
  await expect.poll(() => beatAtCentre(page)).toBe('p1-criteria:b1')
  await expectNoErrors(errors)
  await expectNoCsp(page)
})

test('the prerequisite map: one line per teaching chapter, every station linked to its unit, relations drawn and said', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/papers/prereq/P1')
  await expect(page.locator('main h1')).toHaveText('Prerequisites')
  // Spin Lab first, then 709, then the background chapters and the lecture itself
  await expect(page.locator('.map-line')).toHaveCount(11)
  await expect(page.locator('.map-line .map-num').last()).toHaveText('P1')
  await expect(page.locator('.map-station')).toHaveCount(72)
  await expect(page.locator('a[data-concept="bell-states"]')).toHaveAttribute('href', '#/709/ch/Q6#q6-bell-basis')
  await expect(page.locator('a[data-concept="hamiltonian-evolution"]')).toHaveAttribute('href', '#/lecture/L11#l11-generator')
  await expect(page.locator('a[data-concept="lpu"]')).toHaveAttribute('href', '#/papers/ch/P1#p1-lpu')
  await expect(page.locator('a[data-concept="gross-code"]')).toHaveAttribute('href', '#/papers/ch/B2#b2-gross')
  await page.locator('[data-concept="lpu"]').focus()
  await expect(page.locator('.map-edges path').first()).toBeAttached()
  await expect(page.locator('.map-say')).toContainText('Builds on:')
  await expect(page.locator('.map-say')).toContainText('Leads to:')
  await page.locator('a[data-concept="bell-states"]').click()
  await expect(page).toHaveURL(/#\/709\/ch\/Q6#q6-bell-basis$/)
  await expectNoErrors(errors)
  await expectNoCsp(page)
})

test('a bridge into 709 and the return bar back to the exact beat of the paper lecture', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/papers/ch/P1?track=formal')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  const beat = 'p1-compile:b2'
  await page.evaluate((b) => document.querySelector(`[data-beat="${b}"]`)!.scrollIntoView({ block: 'center' }), beat)
  await expect.poll(() => beatAtCentre(page)).toBe(beat)
  const chip = page.locator(`[data-beat="${beat}"] a.bridge[data-bridge="pp-q7-ghz"]`).first()
  await expect(chip.locator('.bridge-text')).toHaveText('709 · Chapter Q7')
  await chip.click()
  await expect(page).toHaveURL(/#\/709\/ch\/Q7\?ret=papers~P1~p1-compile:b2~[0-9.]+~formal#q7-ghz$/)
  const bar = page.getByRole('navigation', { name: 'Return to Papers' })
  await expect(bar).toBeVisible()
  await expect(bar.getByRole('link')).toHaveText('↑Return to Papers · Chapter P1 · From gates to bicycle instructions, step 2')
  // a reload keeps the bar (the place is in the URL; the Papers registry loads on demand)
  await page.reload()
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  await expect(bar).toBeVisible()
  await bar.getByRole('link').click()
  await expect(page).toHaveURL(/#\/papers\/ch\/P1$/)
  await expect.poll(() => beatAtCentre(page)).toBe(beat)
  await expect(page.getByRole('navigation', { name: 'Return to Papers' })).toHaveCount(0)
  await expectNoErrors(errors)
  await expectNoCsp(page)
})

for (const [w, h] of [
  [1280, 900],
  [375, 812],
] as const)
  test(`${w} px: no sideways scroll on the shelf, the lecture, References used and the prerequisite map; screens for visual QA`, async ({ page }) => {
    const errors = collectErrors(page)
    mkdirSync(SCREENS, { recursive: true })
    await page.setViewportSize({ width: w, height: h })
    for (const [name, url, ready] of [
      ['shelf', '#/papers', 'main h1'],
      ['chapter', '#/papers/ch/P1', '.lecture-head h1'],
      ['references', '#/papers/refs/P1', '#ref-bra24'],
      ['prereq', '#/papers/prereq/P1', '.map-line'],
    ] as const) {
      await page.goto(url)
      await expect(page.locator(ready).first()).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${name}: page width`).toBeLessThanOrEqual(w)
      if (name === 'chapter') {
        const rep = page.locator('.reported').first()
        await rep.scrollIntoViewIfNeeded()
        const box = await rep.boundingBox()
        expect(box && box.x >= 0 && box.x + box.width <= w, 'the Reported block fits the screen').toBe(true)
      }
      await page.screenshot({ path: `${SCREENS}${name}-${w}.png`, fullPage: name !== 'chapter' })
      if (name === 'chapter') {
        await page.locator('[data-beat="p1-criteria:b2"]').first().scrollIntoViewIfNeeded()
        await page.screenshot({ path: `${SCREENS}chapter-b2-${w}.png` })
      }
    }
    await expectNoErrors(errors)
    await expectNoCsp(page)
  })

test('print notes of the lecture P1: Read-mode notes, the running head, the Reported block, a PDF', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/papers/ch/P1')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  await page.getByRole('button', { name: 'Read', exact: true }).first().click()
  await expect(page.locator('.static-story')).toHaveCount(9)
  await page.emulateMedia({ media: 'print' })
  const visible = (sel: string) =>
    page.evaluate((s) => [...document.querySelectorAll(s)].filter((el) => getComputedStyle(el).display !== 'none' && (el as HTMLElement).offsetParent !== null).length, sel)
  const n = Number(await page.locator('.lecture').getAttribute('data-figures'))
  expect(n).toBeGreaterThan(0)
  expect(await visible('figure.print-figure')).toBe(n)
  expect(await visible('canvas')).toBe(0)
  expect(await visible('.topbar')).toBe(0)
  expect(await visible('.reported')).toBeGreaterThan(0)
  expect(await visible('.trail-line')).toBeGreaterThan(0)
  await expect(page.locator('.print-head')).toContainText('Papers · Chapter P1')
  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
  mkdirSync(SCREENS, { recursive: true })
  await page.screenshot({ path: `${SCREENS}print-1280.png`, fullPage: true })
  await page.emulateMedia({ media: 'screen' })
  await page.getByRole('button', { name: 'Story', exact: true }).first().click()
  await expectNoErrors(errors)
  await expectNoCsp(page)
})

/**
 * P1 draws only SVG stages (module-map, plot, code, bits, circuit, amplitudes, surgery-graph, pauli-program) and has no WebGL Try-it, so the chapter page never asks for the
 * WebGL stage host (no `window.__stage`, no canvas): the beat-by-beat run therefore reads the DOM. Every beat of both tracks brings its unit's stage on screen with an
 * SVG picture, 0 console errors, no canvas; one screenshot of each stage goes to e2e/__screens__/papers/P1-<track>/ (contact sheets for visual QA).
 */
for (const track of ['ground', 'formal'] as const)
  test(`P1 ${track}: every beat draws an SVG stage; 0 console errors; no canvas`, async ({ page }) => {
    test.setTimeout(240_000)
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`#/papers/ch/P1?track=${track}`)
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    const beats = await page.evaluate(() => [...document.querySelectorAll('[data-beat]')].map((e) => ({ id: (e as HTMLElement).dataset.beat!, unit: (e.closest('.story') as HTMLElement).dataset.unit! })))
    expect(beats).toHaveLength(48)
    const dir = `e2e/__screens__/papers/P1-${track}/`
    mkdirSync(dir, { recursive: true })
    for (const { id, unit } of beats) {
      await page.evaluate((b) => document.querySelector(`[data-beat="${b}"]`)!.scrollIntoView({ block: 'center' }), id)
      await expect.poll(() => beatAtCentre(page), { message: id }).toBe(id)
      const stage = page.locator(`.story-stage[data-unit="${unit}"]`)
      await expect(stage.locator('svg').first(), `${id}: the stage draws an SVG picture`).toBeVisible()
      await page.waitForTimeout(250)
      await stage.screenshot({ path: `${dir}${id.replace(':', '-')}.png` })
    }
    expect(await page.locator('canvas:not(.opener-canvas)').count()).toBe(0)
    await expectNoErrors(errors)
  })
