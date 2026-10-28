/**
 * The 709 Optics Lab (the second notes collection; card notes-platform, docs/roles/proposals/W-709-notes.md and the Optics Lab platform). Runs in
 * both projects, like notes.spec.ts:
 *   PW_PREVIEW_PORT=5271 npx playwright test e2e/optics.spec.ts --project=preview
 *   PW_DEV_PORT=5278 npx playwright test e2e/optics.spec.ts --project=dev
 * The index ("Optics Lab — cooling and trapping atoms") lists every built page with its book chapter, printed pages and the chapters it feeds;
 * a page numbers its sections, draws its paragraph widget (the `optics-bench`: an SVG plot, sliders you can drive from the keyboard, readouts
 * from the engine) in place with no canvas; a bridge opens the chapter unit with the return bar and Return puts the paragraph back; the
 * chapter unit shows "From the optics lab" whose chip opens the section with a bar back; the two collections do not answer for each other's ids;
 * reduced motion stops the plot's fade; print hides the sliders and `page.pdf()` succeeds in memory. 0 console errors throughout.
 *
 * THE ONE E2E COUNT of the weekly checklist: `BUILT` lists the built optics pages in order; a new page adds its id, its section ids, the
 * paragraph that carries its first bench (and that bench's preset) and its bridge round trip here (one line), plus its route in
 * e2e/security.spec.ts ROUTES. What a page's numbering, pages and chips say is read from the generated meta (OPTICS_META, OPTICS_BY_UNIT),
 * never typed here.
 */
import { expect, test, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

/** The generated indexes, as e2e needs them (types here: a static import of the app's `meta.generated.ts` would pull its extensionless `../../unitNotes` into this project's nodenext type-check). */
interface Row {
  unit: string
  where: string
}
interface Section {
  id: string
  title: string
  pages: string
  feeds: { chapter: string; unit: string }[]
}
interface PageMeta {
  id: string
  book: string
  pages: string
  units: Section[]
}
const generated = <T>(file: string): Promise<T> => import(new URL(`../src/content/qc709/${file}`, import.meta.url).href) as Promise<T>
const { OPTICS_META, OPTICS_BY_UNIT } = await generated<{ OPTICS_META: PageMeta[]; OPTICS_BY_UNIT: Record<string, Row[]> }>('optics/meta.generated.ts')
const { NOTES_BY_UNIT } = await generated<{ NOTES_BY_UNIT: Record<string, Row[]> }>('notes/meta.generated.ts')

/** Built optics pages: id, sections, the paragraph that carries the first bench and its preset, and the first chapter unit that section links. */
const BUILT = [
  { id: 'O1', sections: ['o1-why', 'o1-force', 'o1-compensation', 'o1-probe', 'o1-cooling'], preset: 'slower-force', benchParagraph: 'o1-force:b4', bridgeParagraph: 'o1-probe:b2', section: 'o1-probe', bridge: 'qc-q8-mixed', unit: 'q8-mixed', chapter: 'Q8' },
  { id: 'O2', sections: ['o2-friction', 'o2-limit', 'o2-collimation', 'o2-dressed', 'o2-3d'], preset: 'molasses-force', benchParagraph: 'o2-friction:b4', bridgeParagraph: 'o2-limit:b1', section: 'o2-limit', bridge: 'qc-q8-mixed', unit: 'q8-mixed', chapter: 'Q8' },
  { id: 'O3', sections: ['o3-gradient', 'o3-milc', 'o3-sigma', 'o3-vsr', 'o3-theory', 'o3-3d'], preset: 'sisyphus-hills', benchParagraph: 'o3-gradient:b5', bridgeParagraph: 'o3-gradient:b4', section: 'o3-gradient', bridge: 'qc-q8-pure-rho', unit: 'q8-pure-rho', chapter: 'Q8' },
  { id: 'O4', sections: ['o4-why', 'o4-quadrupole', 'o4-orbits', 'o4-quantum', 'o4-experiments'], preset: 'quadrupole-orbit', benchParagraph: 'o4-orbits:b3', bridgeParagraph: 'o4-orbits:b2', section: 'o4-orbits', bridge: 'qc-l11-two-level', unit: 'l11-two-level', chapter: 'L11' },
  { id: 'O5', sections: ['o5-dipole', 'o5-lattice', 'o5-mot', 'o5-capture', 'o5-variants'], preset: 'dipole-well', benchParagraph: 'o5-dipole:b4', bridgeParagraph: 'o5-capture:b2', section: 'o5-capture', bridge: 'qc-q8-mixed', unit: 'q8-mixed', chapter: 'Q8' },
  { id: 'O6', sections: ['o6-beams', 'o6-clocks', 'o6-collisions', 'o6-decay', 'o6-matterwaves', 'o6-nonlinear'], preset: 'ramsey-fountain', benchParagraph: 'o6-clocks:b3', bridgeParagraph: 'o6-matterwaves:b2', section: 'o6-matterwaves', bridge: 'qc-q5-interferometer', unit: 'q5-interferometer', chapter: 'Q5' },
] as const
const O1 = BUILT[0]
const meta = (id: string) => OPTICS_META.find((m) => m.id === id)!
const O1_META = meta(O1.id)

const bar = (page: Page) => page.getByRole('navigation', { name: 'Return to Physics 709' })

/** A page's first bench, scoped by its paragraph: an optics page draws more than one `optics-bench`, so a bare `.notes-widget` matches several. */
const bench = (page: Page, p: { benchParagraph: string } = O1) => page.locator(`[data-beat="${p.benchParagraph}"] .notes-widget[data-widget="optics-bench"]`)

/** The paragraph number a beat id ends in: `o1-probe:b2` is paragraph 2, which the return bar calls "step 2". */
const paragraphNumber = (beat: string) => Number(/:b(\d+)$/.exec(beat)?.[1])

/** The paragraph under the viewport centre line, or null. */
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

test('the index is headed "Optics Lab — cooling and trapping atoms" and lists every built page with its book chapter, pages and the chapters it feeds', async ({ page }) => {
  const errors = collectErrors(page)
  expect(OPTICS_META.map((m) => m.id)).toEqual(BUILT.map((b) => b.id)) // the one count: a page in the generated meta is a line in BUILT
  await page.goto('#/709/optics')
  await expect(page.locator('main h1')).toHaveText('Optics Lab — cooling and trapping atoms')
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Optics lab' })).toHaveAttribute('href', '#/709/optics')
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Notes' })).toHaveAttribute('href', '#/709/notes')
  await expect(page.locator('.notes-row')).toHaveCount(BUILT.length)
  const row = page.locator(`.notes-row[data-notes="${O1.id}"]`)
  const feeds = [...new Set(O1_META.units.flatMap((u) => u.feeds.map((f) => f.chapter)))].join(', ')
  await expect(row).toContainText('Optics Lab O1')
  await expect(row.locator('.notes-row-meta')).toContainText(`${O1_META.book} · ${O1_META.pages}`)
  await expect(row.locator('.notes-row-meta')).toContainText(`feeds ${feeds}`)
  await expect(row.locator('.notes-row-meta')).not.toContainText('2026') // an optics page has no class date
  await expect(row.locator('.notes-row-sections a')).toHaveCount(O1.sections.length)
  await expect(page.locator('.notes-later')).toHaveText('More pages arrive as the lab is built.')
  await row.locator('h2 a').click()
  await expect(page).toHaveURL(/#\/709\/optics\/O1$/)
  await expect(page.locator('main h1')).toContainText('Optics Lab O1')
  await expectNoErrors(errors)
})

test('the 709 home links the Optics Lab', async ({ page }) => {
  await page.goto('#/709')
  const link = page.getByRole('link', { name: /Optics Lab: cooling and trapping atoms/ })
  await expect(link).toHaveAttribute('href', '#/709/optics')
  await link.click()
  await expect(page).toHaveURL(/#\/709\/optics$/)
})

test('a page numbers its sections, prints their pages, and draws its bench in place: an SVG plot with two curves, sliders, readouts, no canvas', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(`#/709/optics/${O1.id}`)
  expect(O1_META.units.map((u) => u.id)).toEqual([...O1.sections])
  for (const u of O1_META.units) {
    await expect(page.locator(`section#${u.id}`)).toBeVisible()
    await expect(page.locator(`#${u.id}-title`)).toContainText(u.title) // the section's number ("§1.2.2") and name
    await expect(page.locator(`#${u.id}-title .notes-pages`)).toHaveText(u.pages)
  }
  await expect(page.locator('.notes-meta')).toContainText('Metcalf')
  const widget = bench(page)
  await expect(widget).toBeVisible()
  await expect(widget.locator(`[data-optics-preset="${O1.preset}"]`)).toBeVisible()
  await expect(widget.locator('svg.ob-plot[role="img"]')).toBeVisible()
  await expect(widget.locator('svg.ob-plot path.ob-curve')).toHaveCount(2)
  await expect(widget.locator('.ob-legend li')).toHaveCount(2)
  await expect(widget.locator('input[type="range"]')).toHaveCount(3) // slower-force: saturation, comparison saturation, detuning
  await expect(widget.locator('.ob-readout')).toHaveCount(3) // peak deceleration, width, stopping length
  for (const dd of await widget.locator('.ob-readout dd').all()) await expect(dd).toHaveText(/\d/) // every readout shows a number from the engine
  await expect(page.locator('canvas')).toHaveCount(0)
  await expectNoErrors(errors)
})

test('every built page draws its first bench (the preset named for it) in its paragraph, beside the bridge the round trip uses', async ({ page }) => {
  const errors = collectErrors(page)
  for (const p of BUILT) {
    await page.goto(`#/709/optics/${p.id}`)
    expect(meta(p.id).units.map((u) => u.id)).toEqual([...p.sections])
    const widget = bench(page, p)
    await expect(widget.locator(`[data-optics-preset="${p.preset}"]`)).toBeVisible()
    await expect(widget.locator('svg.ob-plot path.ob-curve').first()).toBeVisible()
    await expect(widget.locator('input[type="range"]').first()).toBeVisible()
    await expect(widget.locator('.ob-readout').first()).toBeVisible()
    await expect(page.locator(`[data-beat="${p.bridgeParagraph}"] a[data-bridge="${p.bridge}"]`).first()).toBeAttached()
  }
  await expectNoErrors(errors)
})

test('the sliders work from the keyboard: an arrow key moves the value and changes a readout; Reset restores both', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(`#/709/optics/${O1.id}`)
  const widget = bench(page)
  const saturation = widget.getByLabel(/^Saturation s/) // not "Comparison saturation s′"
  const peak = widget.locator('[data-readout="0"]') // the peak deceleration, which depends on the saturation
  const curve = widget.locator('path.ob-curve-0').first()
  await saturation.scrollIntoViewIfNeeded()
  const start = await saturation.inputValue()
  const step = Number(await saturation.getAttribute('step'))
  const max = (await saturation.getAttribute('max')) ?? ''
  expect(step).toBeGreaterThan(0)
  const next = +(Number(start) + step).toFixed(6)
  const before = await peak.textContent()
  const pathBefore = await curve.getAttribute('d')
  await saturation.focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(async () => Number(await saturation.inputValue())).toBeCloseTo(next, 6)
  await expect(peak).not.toHaveText(before ?? '')
  await expect(curve).not.toHaveAttribute('d', pathBefore ?? '')
  await expect(widget.locator('.slider-value').first()).toContainText(String(next))
  await page.keyboard.press('End')
  await expect(saturation).toHaveValue(max)
  await widget.getByRole('button', { name: 'Reset sliders' }).click()
  await expect(saturation).toHaveValue(start)
  await expect(peak).toHaveText(before ?? '')
  await expect(curve).toHaveAttribute('d', pathBefore ?? '')
  await expectNoErrors(errors)
})

test('reduced motion: the plot does not fade in (no animation under prefers-reduced-motion: reduce)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`#/709/optics/${O1.id}`)
  const plot = page.locator('svg.ob-plot').first()
  await expect(plot).toBeVisible()
  expect(await plot.evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  expect(await plot.evaluate((el) => getComputedStyle(el).animationName)).toBe('ob-fade')
})

test('a bridge in a page opens the chapter unit with the return bar; Return puts the paragraph back under the centre line with focus', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(`#/709/optics/${O1.id}`)
  const beat = page.locator(`[data-beat="${O1.bridgeParagraph}"]`)
  const section = O1_META.units.find((u) => u.id === O1.section)!
  await beat.scrollIntoViewIfNeeded()
  await beat.locator(`a[data-bridge="${O1.bridge}"]`).click()
  await expect(page).toHaveURL(new RegExp(`#/709/ch/${O1.chapter}\\?ret=qc709~O1~${O1.bridgeParagraph}~[0-9.]+~(ground|formal)#${O1.unit}$`))
  await expect(page.locator(`#${O1.unit}-title`)).toBeFocused()
  await expect(bar(page)).toBeVisible()
  await expect(bar(page)).toContainText('Optics Lab O1')
  await expect(bar(page)).toContainText(`${section.title}, step ${paragraphNumber(O1.bridgeParagraph)}`) // the section and the paragraph it will return to
  await bar(page).getByRole('link').first().click()
  await expect(page).toHaveURL(/#\/709\/optics\/O1/)
  await expect(page.locator(`[data-beat="${O1.bridgeParagraph}"]`)).toBeFocused()
  await expect.poll(() => paragraphAtCentre(page)).toBe(O1.bridgeParagraph)
  await expect(bar(page)).toHaveCount(0)
  await expectNoErrors(errors)
})

test('the chapter unit shows "From the optics lab"; its chip opens the section with a bar back to the unit', async ({ page }) => {
  const errors = collectErrors(page)
  const chip = OPTICS_BY_UNIT[O1.unit].find((r) => r.unit === O1.section)! // the generated row: "§1.2.2, p. 13"
  await page.goto(`#/709/ch/${O1.chapter}#${O1.unit}`)
  const optics = page.locator(`.unit-notes[data-unit-optics="${O1.unit}"]`)
  await expect(optics).toContainText('From the optics lab')
  await expect(optics).toContainText(chip.where)
  await expect(optics.locator('a[data-bridge^="qc-o"]')).toHaveCount(OPTICS_BY_UNIT[O1.unit].length) // one chip per section that feeds the unit
  await optics.locator(`a[data-bridge="qc-${O1.section}"]`).click()
  await expect(page).toHaveURL(new RegExp(`#/709/optics/O1\\?ret=qc709~${O1.chapter}~${O1.unit}[^#]*#${O1.section}$`))
  await expect(page.locator(`#${O1.section}-title`)).toBeFocused()
  await expect(bar(page)).toContainText(`Chapter ${O1.chapter}`)
  await bar(page).getByRole('link').first().click()
  await expect(page).toHaveURL(new RegExp(`#/709/ch/${O1.chapter}`))
  await expect(bar(page)).toHaveCount(0)
  await expectNoErrors(errors)
})

test('a unit no optics page links shows no optics chip; the lecture notes line is unchanged beside it', async ({ page }) => {
  // a unit of the same chapter that a lecture-notes section feeds but no optics section does (read from the two generated indexes)
  const unlinked = Object.keys(NOTES_BY_UNIT).find((u) => u.startsWith(`${O1.chapter.toLowerCase()}-`) && !(u in OPTICS_BY_UNIT))!
  expect(unlinked).toBeTruthy()
  await page.goto(`#/709/ch/${O1.chapter}#${unlinked}`)
  await expect(page.locator(`#${unlinked}-title`)).toBeVisible()
  await expect(page.locator(`.unit-notes[data-unit-optics="${O1.unit}"]`)).toHaveCount(1) // the page does draw optics lines: the linked unit has one
  await expect(page.locator(`.unit-notes[data-unit-optics="${unlinked}"]`)).toHaveCount(0)
  await expect(page.locator(`.unit-notes[data-unit-notes="${unlinked}"]`)).toHaveCount(1) // the lecture notes line is still there
  await page.goto('#/lecture/L1')
  await expect(page.locator('main h1')).toBeVisible()
  await expect(page.locator('.unit-notes')).toHaveCount(0)
})

test('the two collections do not answer for each other: an optics id on the notes route and a notes id on the optics route say so in words', async ({ page }) => {
  await page.goto('#/709/notes/O1')
  await expect(page.locator('main h1')).toContainText('No lecture notes called “O1”')
  await page.goto('#/709/optics/N1')
  await expect(page.locator('main h1')).toContainText('No optics page called “N1”')
  await page.goto('#/709/optics/L1')
  await expect(page.locator('main h1')).toContainText('No optics page called “L1”')
  await page.goto('#/709/ch/O1')
  await expect(page).toHaveURL(/#\/709\/optics\/O1$/) // a chapter route for an optics id redirects, like N<k>
})

test('print: the sliders are hidden, the plot stays, and page.pdf() succeeds in memory', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(`#/709/optics/${O1.id}`)
  const widget = bench(page)
  await expect(widget.locator('svg.ob-plot')).toBeVisible()
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.topbar')).toBeHidden()
  await expect(widget.locator('.ob-sliders')).toBeHidden()
  await expect(widget.locator('svg.ob-plot')).toBeVisible()
  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-') // (not kept: no *.pdf may live under app/, content/verbatim.test.ts)
  expect(pdf.byteLength).toBeGreaterThan(10_000)
  await page.emulateMedia({ media: 'screen' })
  await expectNoErrors(errors)
})

test('375 px: the page and its bench read in one column with no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto(`#/709/optics/${O1.id}`)
  await expect(bench(page).locator('svg.ob-plot')).toBeVisible()
  const wide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  expect(wide).toBe(false)
})
