/**
 * Print notes (W-709-platform "Print notes"). In print media a lecture is its Read-mode notes: 0 canvases, one numbered
 * figure per stage change (the count the page announces), the running head, no chrome; `page.pdf()` succeeds.
 * Physics 448 Lecture 1 runs in both projects; the 709 demo chapter (the Print notes button, both tracks, bridges as
 * footnotes) is `@dev-only`. One printed page is kept as a PNG for visual QA in e2e/__screens__/709/ (git-ignored).
 */
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

const SCREENS = fileURLToPath(new URL('./__screens__/709/', import.meta.url))

/** Figures the page announces (LecturePage writes the lecture's figure count on its root). */
const announced = (page: Page) => page.locator('.lecture').getAttribute('data-figures').then(Number)
const visibleCount = (page: Page, sel: string) =>
  page.evaluate((s) => [...document.querySelectorAll(s)].filter((el) => getComputedStyle(el).display !== 'none' && (el as HTMLElement).offsetParent !== null).length, sel)

test('448 Lecture 1 prints as notes: 0 canvases, every figure, a running head, a PDF', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/lecture/L1')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  await page.getByRole('button', { name: 'Read', exact: true }).click()
  await expect(page.locator('.static-story')).toHaveCount(5)
  await page.emulateMedia({ media: 'print' })
  const n = await announced(page)
  expect(n).toBeGreaterThan(10)
  expect(await visibleCount(page, 'figure.print-figure')).toBe(n)
  expect(await visibleCount(page, 'canvas')).toBe(0)
  expect(await visibleCount(page, '.topbar')).toBe(0)
  await expect(page.locator('.print-head')).toContainText('Physics 448')
  await expect(page.locator('.print-head')).toContainText('Lecture 1')
  // every figure is titled "Fig. L1.k" and has a drawing
  const titles = await page.locator('figure.print-figure svg title').allTextContents()
  expect(titles.every((t) => /^Fig\. L1\.\d+: /.test(t))).toBe(true)
  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  expect(pdf.byteLength).toBeGreaterThan(20_000)
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
  await page.emulateMedia({ media: 'screen' })
  await expect(page.locator('figure.print-figure').first()).toBeHidden()
  await page.getByRole('button', { name: 'Story', exact: true }).click()
  await expectNoErrors(errors)
})

test.describe('@dev-only print notes of the demo chapter', () => {
  test('the Print notes button prints the Read-mode notes and restores Story mode; bridges are footnotes', async ({ page }) => {
    const errors = collectErrors(page)
    // record what the page looks like at the moment print() is called (headless print is a no-op)
    await page.addInitScript(() => {
      window.print = () => {
        const w = window as unknown as { __printed: unknown[] }
        w.__printed ??= []
        w.__printed.push({
          read: document.querySelectorAll('.story[data-mode="live"]').length === 0,
          figures: document.querySelectorAll('figure.print-figure').length,
          notes: document.querySelectorAll('.print-notes li').length,
          fonts: document.fonts.status,
        })
      }
    })
    await page.goto('#/709/ch/Q0?track=formal')
    // the WebGL unit and the SVG-only unit (q0-demo-kinds)
    await expect(page.locator('.story[data-mode="live"]')).toHaveCount(2)
    await page.getByRole('button', { name: 'Print notes' }).click()
    await expect.poll(() => page.evaluate(() => (window as unknown as { __printed?: unknown[] }).__printed?.length ?? 0)).toBe(1)
    const [at] = await page.evaluate(() => (window as unknown as { __printed: { read: boolean; figures: number; notes: number; fonts: string }[] }).__printed)
    expect(at).toEqual({ read: true, figures: await announced(page), notes: 2, fonts: 'loaded' })
    await expect(page.locator('.story[data-mode="live"]')).toHaveCount(2) // Story mode is back
    await expect(page.getByRole('button', { name: 'Story', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expectNoErrors(errors)
  })

  for (const track of ['ground', 'formal'] as const)
    test(`${track}: print media, figures Q0.k, footnotes naming Spin Lab units, a PDF and a page picture`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto(`#/709/ch/Q0?track=${track}`)
      await page.getByRole('button', { name: 'Read', exact: true }).click()
      await page.emulateMedia({ media: 'print' })
      await page.evaluate(() => document.fonts.ready)
      expect(await visibleCount(page, 'canvas')).toBe(0)
      const n = await announced(page)
      // q0-demo-sphere: b1 |0⟩, b2 the quarter turn, b3 |+x⟩ measured, b4 |0⟩ again (a change from b3); then one figure
      // per beat of the SVG unit q0-demo-kinds (every beat changes its picture)
      const kindsBeats = await page.locator('.static-story[data-unit="q0-demo-kinds"] .static-beat').count()
      expect(kindsBeats).toBeGreaterThan(0)
      expect(n).toBe(4 + kindsBeats)
      expect(await visibleCount(page, 'figure.print-figure')).toBe(n)
      await expect(page.locator('figure.print-figure figcaption b')).toHaveText(Array.from({ length: n }, (_, i) => `Fig. Q0.${i + 1}`))
      // every figure is titled, and an SVG kind's figure is its own scene in print ink, with no unresolved number
      const figs = await page.locator('figure.print-figure').evaluateAll((els) =>
        els.map((f) => ({ titles: [...f.querySelectorAll('svg > title')].map((t) => t.textContent ?? ''), svg: !!f.querySelector('svg.svgk-print'), text: f.textContent ?? '' })),
      )
      for (const f of figs) {
        expect(f.titles.length).toBeGreaterThan(0)
        expect(f.titles.every((t) => /^Fig\. Q0\.\d+: /.test(t)), f.titles.join(' | ')).toBe(true)
        expect(f.text).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
      }
      expect(figs.filter((f) => f.svg).length).toBe(kindsBeats)
      await expect(page.locator('.print-head')).toContainText(`Physics 709`)
      await expect(page.locator('.print-head')).toContainText(track === 'formal' ? 'Formal track' : 'Ground-up track')
      const notes = page.locator('.static-story[data-unit="q0-demo-sphere"] .print-notes li')
      await expect(notes).toHaveCount(2)
      await expect(notes.nth(0)).toContainText('Spin Lab (Physics 448), Lecture 6, unit 6.2')
      await expect(notes.nth(1)).toContainText('Lecture 2, unit 2.3, “Numbers that turn”')
      await expect(page.locator('.static-beat[data-beat="q0-demo-sphere:b2"] .print-fn')).toHaveText('1')
      expect(await visibleCount(page, '.bridge-chip')).toBe(0)
      const pdf = await page.pdf({ format: 'A4', printBackground: true })
      expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
      expect(pdf.byteLength).toBeGreaterThan(20_000)
      // (the PDF itself is not kept: no *.pdf may live under app/, content/verbatim.test.ts)
      mkdirSync(SCREENS, { recursive: true })
      await page.setViewportSize({ width: 794, height: 1123 }) // A4 at 96 dpi
      await page.screenshot({ path: `${SCREENS}print-q0-${track}-page.png`, fullPage: false })
      await expectNoErrors(errors)
    })
})
