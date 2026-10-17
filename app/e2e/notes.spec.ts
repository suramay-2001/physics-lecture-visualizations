/**
 * The 709 lecture notes (docs/roles/proposals/W-709-notes.md §6; rulings docs/roles/decisions/qc709-notes.md). Runs in both projects:
 *   PW_PREVIEW_PORT=5271 npx playwright test e2e/notes.spec.ts --project=preview
 *   PW_DEV_PORT=5278 npx playwright test e2e/notes.spec.ts --project=dev
 * The index lists every built lecture; the lecture page numbers its sections and prints their pages as the notes do, draws its
 * figure as an SVG (no canvas); a bridge in a note opens the chapter unit with the return bar, and Return puts the paragraph back under
 * the centre line with focus; the chapter unit shows "From the lecture notes", whose chip opens the section with a bar back; `L<k>`
 * redirects to `N<k>`; print gives one `.print-figure` per figure and `page.pdf()` succeeds in memory (ruling W9: no new print button).
 * 0 console errors throughout.
 *
 * THE ONE E2E COUNT of the weekly checklist (card notes-platform): `BUILT` lists the built notes lectures in order; a new lecture adds
 * its id, its section count and its figure count here.
 */
import { expect, test, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

/** Built notes lectures: id, sections, figures, and the first chapter unit its first section links (for the bridge round trip). */
const BUILT = [
  { id: 'N1', sections: ['n1-stern-gerlach', 'n1-superposition', 'n1-vector-space', 'n1-inner-product'], figures: 1, bridge: 'qc-q1-sequences', paragraph: 'n1-stern-gerlach:b2', unit: 'q1-sequences' },
  { id: 'N2', sections: ['n2-basis', 'n2-spin-space', 'n2-change', 'n2-photon', 'n2-operators'], figures: 0, bridge: 'qc-q2-basis', paragraph: 'n2-basis:b1', unit: 'q2-basis' },
  { id: 'N3', sections: ['n3-born', 'n3-bloch', 'n3-spin-operators', 'n3-observables'], figures: 0, bridge: 'qc-q3-born', paragraph: 'n3-born:b1', unit: 'q3-born' },
  { id: 'N4', sections: ['n4-spectral', 'n4-commutator', 'n4-uncertainty'], figures: 0, bridge: 'qc-q3-spectral', paragraph: 'n4-spectral:b1', unit: 'q3-spectral' },
  { id: 'N5', sections: ['n5-composite', 'n5-tensor', 'n5-gates', 'n5-bell-basis', 'n5-bell-circuit'], figures: 0, bridge: 'qc-q6-many', paragraph: 'n5-composite:b1', unit: 'q6-many' },
  { id: 'N6', sections: ['n6-bell-circuit', 'n6-parities', 'n6-ghz', 'n6-bit-strings'], figures: 0, bridge: 'qc-q6-bell-circuit', paragraph: 'n6-bell-circuit:b1', unit: 'q6-bell-circuit' },
  { id: 'N7', sections: ['n7-observables', 'n7-mermin', 'n7-density'], figures: 0, bridge: 'qc-q7-observables', paragraph: 'n7-observables:b1', unit: 'q7-observables' },
  { id: 'N8', sections: ['n8-density', 'n8-mixed', 'n8-ball', 'n8-recipes', 'n8-bipartite'], figures: 4, bridge: 'qc-q8-pure-rho', paragraph: 'n8-density:b1', unit: 'q8-pure-rho' },
] as const
const N1 = BUILT[0]

const bar = (page: Page) => page.getByRole('navigation', { name: 'Return to Physics 709' })

/** The notes paragraph under the viewport centre line, or null. */
const paragraphAtCentre = (page: Page) =>
  page.evaluate(() => {
    const mid = innerHeight / 2
    for (const el of document.querySelectorAll<HTMLElement>('.notes-beat[data-beat]')) {
      const r = el.getBoundingClientRect()
      if (r.height && r.top <= mid && r.bottom >= mid) return el.dataset.beat ?? null
    }
    return null
  })

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 })
})

test('the index lists every built lecture, with its date, printed pages, topics and the chapters it feeds; a row opens the lecture', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/709/notes')
  await expect(page.locator('main h1')).toHaveText('Lecture notes')
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Notes' })).toHaveAttribute('href', '#/709/notes')
  await expect(page.locator('.notes-row')).toHaveCount(BUILT.length)
  const row = page.locator(`.notes-row[data-notes="${N1.id}"]`)
  await expect(row).toContainText('Lecture 1 notes')
  await expect(row.locator('.notes-row-meta')).toContainText('2 Sep 2026')
  await expect(row.locator('.notes-row-meta')).toContainText('pp. 4–7')
  await expect(row.locator('.notes-row-meta')).toContainText('feeds Q1')
  await expect(page.locator('.notes-later')).toHaveText('Later lectures arrive after each class.')
  await expect(row.locator('.notes-row-sections a')).toHaveCount(N1.sections.length)
  await row.locator('h2 a').click()
  await expect(page).toHaveURL(/#\/709\/notes\/N1$/)
  await expect(page.locator('main h1')).toContainText('Lecture 1 notes')
  await expectNoErrors(errors)
})

test('a lecture numbers its sections and prints their pages as the notes do; the figure is an SVG and there is no canvas', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(`#/709/notes/${N1.id}`)
  for (const s of N1.sections) await expect(page.locator(`section#${s}`)).toBeVisible()
  await expect(page.locator('#n1-stern-gerlach-title')).toContainText('§I.A')
  await expect(page.locator('#n1-stern-gerlach-title .notes-pages')).toHaveText('pp. 4–5')
  await expect(page.locator('#n1-superposition-title')).toContainText('§I.B.1')
  await expect(page.locator('#n1-superposition-title .notes-pages')).toHaveText('p. 5')
  await expect(page.locator('#n1-inner-product-title')).toContainText('§I.B.3')
  await expect(page.locator('#n1-inner-product-title .notes-pages')).toHaveText('pp. 6–7')
  // every paragraph is a reading-position beat
  await expect(page.locator('.notes-beat[data-beat]')).toHaveCount(5)
  // the figure: drawn from the existing SVG kind, numbered, and no WebGL canvas anywhere on the page
  await expect(page.locator('.notes-figure')).toHaveCount(N1.figures)
  await expect(page.locator('.notes-figure[data-figure="N1.1"] .svg-still svg[role="img"]')).toBeVisible()
  await expect(page.locator('.notes-figure[data-figure="N1.1"] .notes-caption')).toContainText('Fig. N1.1')
  await expect(page.locator('canvas')).toHaveCount(0)
  expect(await page.evaluate(() => (window as { __stage?: unknown }).__stage === undefined)).toBe(true)
  await expectNoErrors(errors)
})

test('L1 redirects to N1, a chapter id with the notes prefix to the notes page, and an unknown id answers in words', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/709/notes/L1')
  await expect(page).toHaveURL(/#\/709\/notes\/N1$/)
  await expect(page.locator('main h1')).toContainText('Lecture 1 notes')
  await page.goto('#/709/ch/N1')
  await expect(page).toHaveURL(/#\/709\/notes\/N1$/)
  await page.goto('#/709/notes/N99')
  await expect(page.locator('main h1')).toHaveText('No lecture notes called “N99”')
  await page.goto('#/709/notes/Q1')
  await expect(page.locator('main h1')).toHaveText('No lecture notes called “Q1”')
  await expectNoErrors(errors)
})

test('a bridge in a note opens the chapter unit with the return bar; Return puts the paragraph back under the centre line with focus', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(`#/709/notes/${N1.id}`)
  const beat = page.locator(`[data-beat="${N1.paragraph}"]`)
  await beat.scrollIntoViewIfNeeded()
  await beat.locator(`a[data-bridge="${N1.bridge}"]`).click()
  await expect(page).toHaveURL(new RegExp(`#/709/ch/Q1\\?ret=qc709~N1~${N1.paragraph}~[0-9.]+~(ground|formal)#${N1.unit}$`))
  // the chapter unit's heading takes focus, and the bar says where the way back leads
  await expect(page.locator(`#${N1.unit}-title`)).toBeFocused()
  await expect(bar(page)).toBeVisible()
  await expect(bar(page)).toContainText('Lecture 1 notes')
  await expect(bar(page)).toContainText('step 2')
  await bar(page).getByRole('link').first().click()
  await expect(page).toHaveURL(/#\/709\/notes\/N1/)
  await expect(page.locator(`[data-beat="${N1.paragraph}"]`)).toBeFocused()
  await expect.poll(() => paragraphAtCentre(page)).toBe(N1.paragraph)
  await expect(bar(page)).toHaveCount(0)
  await expectNoErrors(errors)
})

test('the chapter unit shows "From the lecture notes"; its chip opens the section with a bar back to the unit', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(`#/709/ch/Q1#${N1.unit}`)
  const notes = page.locator(`.unit-notes[data-unit-notes="${N1.unit}"]`)
  await expect(notes).toContainText('From the lecture notes')
  await expect(notes).toContainText('§I.A, pp. 4–5')
  await notes.locator('a[data-bridge="qc-n1-stern-gerlach"]').click()
  await expect(page).toHaveURL(/#\/709\/notes\/N1\?ret=qc709~Q1~q1-sequences[^#]*#n1-stern-gerlach$/)
  await expect(page.locator('#n1-stern-gerlach-title')).toBeFocused()
  await expect(bar(page)).toContainText('Chapter Q1')
  await bar(page).getByRole('link').first().click()
  await expect(page).toHaveURL(/#\/709\/ch\/Q1/)
  await expect(bar(page)).toHaveCount(0)
  await expectNoErrors(errors)
})

test('a unit no note links, and a Spin Lab lecture, show no notes chip', async ({ page }) => {
  await page.goto('#/709/ch/Q5#q5-problem')
  await expect(page.locator('#q5-problem-title')).toBeVisible()
  await expect(page.locator('.unit-notes[data-unit-notes="q5-problem"]')).toHaveCount(0)
  await page.goto('#/lecture/L1')
  await expect(page.locator('main h1')).toBeVisible()
  await expect(page.locator('.unit-notes')).toHaveCount(0)
})

test('print: one numbered figure per figure (the count the page announces), no chrome, and page.pdf() succeeds in memory', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(`#/709/notes/${N1.id}`)
  await expect(page.locator('section#n1-inner-product')).toBeVisible()
  const announced = Number(await page.locator('.notes-page').getAttribute('data-figures'))
  expect(announced).toBe(N1.figures)
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.topbar')).toBeHidden()
  await expect(page.locator('.print-figure')).toHaveCount(announced)
  await expect(page.locator('.print-figure').first()).toBeVisible()
  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-') // (not kept: no *.pdf may live under app/, content/verbatim.test.ts)
  expect(pdf.byteLength).toBeGreaterThan(10_000)
  await page.emulateMedia({ media: 'screen' })
  await expectNoErrors(errors)
})

test('375 px: the lecture reads in one column with no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto(`#/709/notes/${N1.id}`)
  await expect(page.locator('section#n1-inner-product')).toBeVisible()
  const wide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  expect(wide).toBe(false)
})
