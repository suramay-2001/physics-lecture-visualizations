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
 * THE ONE E2E COUNT of the weekly checklist: `BUILT` lists the built optics pages in order; a new page adds its id, its section ids and its
 * bridge round trip here (one line), plus its route in e2e/security.spec.ts ROUTES.
 */
import { expect, test, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

/** Built optics pages: id, sections, the section whose first paragraph carries the bench, and the first chapter unit that section links. */
const BUILT = [
  { id: 'O1', sections: ['o1-why', 'o1-force', 'o1-compensation', 'o1-probe', 'o1-cooling'], preset: 'slower-force', benchParagraph: 'o1-force:b4', bridgeParagraph: 'o1-probe:b2', section: 'o1-probe', bridge: 'qc-q8-mixed', unit: 'q8-mixed', chapter: 'Q8' },
  { id: 'O2', sections: ['o2-friction', 'o2-limit', 'o2-collimation', 'o2-dressed', 'o2-3d'], preset: 'molasses-force', benchParagraph: 'o2-friction:b4', bridgeParagraph: 'o2-limit:b1', section: 'o2-limit', bridge: 'qc-q8-mixed', unit: 'q8-mixed', chapter: 'Q8' },
  { id: 'O3', sections: ['o3-gradient', 'o3-milc', 'o3-sigma', 'o3-vsr', 'o3-theory', 'o3-3d'], preset: 'sisyphus-hills', benchParagraph: 'o3-gradient:b5', bridgeParagraph: 'o3-gradient:b4', section: 'o3-gradient', bridge: 'qc-q8-pure-rho', unit: 'q8-pure-rho', chapter: 'Q8' },
  { id: 'O4', sections: ['o4-why', 'o4-quadrupole', 'o4-orbits', 'o4-quantum', 'o4-experiments'], preset: 'quadrupole-orbit', benchParagraph: 'o4-orbits:b3', bridgeParagraph: 'o4-orbits:b2', section: 'o4-orbits', bridge: 'qc-l11-two-level', unit: 'l11-two-level', chapter: 'L11' },
  { id: 'O5', sections: ['o5-dipole', 'o5-lattice', 'o5-mot', 'o5-capture', 'o5-variants'], preset: 'dipole-well', benchParagraph: 'o5-dipole:b4', bridgeParagraph: 'o5-capture:b2', section: 'o5-capture', bridge: 'qc-q8-mixed', unit: 'q8-mixed', chapter: 'Q8' },
  { id: 'O6', sections: ['o6-beams', 'o6-clocks', 'o6-collisions', 'o6-decay', 'o6-matterwaves', 'o6-nonlinear'], preset: 'ramsey-fountain', benchParagraph: 'o6-clocks:b4', bridgeParagraph: 'o6-matterwaves:b2', section: 'o6-matterwaves', bridge: 'qc-q5-interferometer', unit: 'q5-interferometer', chapter: 'Q5' },
] as const
const O1 = BUILT[0]

const bar = (page: Page) => page.getByRole('navigation', { name: 'Return to Physics 709' })

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
  await page.goto('#/709/optics')
  await expect(page.locator('main h1')).toHaveText('Optics Lab — cooling and trapping atoms')
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Optics lab' })).toHaveAttribute('href', '#/709/optics')
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Notes' })).toHaveAttribute('href', '#/709/notes')
  await expect(page.locator('.notes-row')).toHaveCount(BUILT.length)
  const row = page.locator(`.notes-row[data-notes="${O1.id}"]`)
  await expect(row).toContainText('Optics Lab O1')
  await expect(row.locator('.notes-row-meta')).toContainText('Metcalf')
  await expect(row.locator('.notes-row-meta')).toContainText('pp. 6–15')
  await expect(row.locator('.notes-row-meta')).toContainText(`feeds ${O1.chapter}`)
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
  for (const s of O1.sections) await expect(page.locator(`section#${s}`)).toBeVisible()
  await expect(page.locator('#o1-why-title')).toContainText('§Intro')
  await expect(page.locator('#o1-why-title .notes-pages')).toHaveText('pp. 6–7')
  await expect(page.locator('#o1-force-title .notes-pages')).toHaveText('pp. 8–10')
  await expect(page.locator('.notes-meta')).toContainText('Metcalf')
  const widget = page.locator(`[data-beat="${O1.benchParagraph}"] .notes-widget[data-widget="optics-bench"]`)
  await expect(widget).toBeVisible()
  await expect(widget.locator(`[data-optics-preset="${O1.preset}"]`)).toBeVisible()
  await expect(widget.locator('svg.ob-plot[role="img"]')).toBeVisible()
  await expect(widget.locator('svg.ob-plot path.ob-curve')).toHaveCount(2)
  await expect(widget.locator('.ob-legend li')).toHaveCount(2)
  await expect(widget.locator('input[type="range"]')).toHaveCount(3)
  await expect(widget.locator('.ob-readout')).toHaveCount(4)
  await expect(page.locator('canvas')).toHaveCount(0)
  await expectNoErrors(errors)
})

test('the sliders work from the keyboard: an arrow key moves the value and changes a readout; Reset restores both', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(`#/709/optics/${O1.id}`)
  const widget = page.locator('.notes-widget[data-widget="optics-bench"]')
  const drive = widget.getByLabel(/Drive strength/)
  const flip = widget.locator('[data-readout="3"]') // the first full flip on resonance
  await drive.scrollIntoViewIfNeeded()
  await expect(drive).toHaveValue('1')
  const before = await flip.textContent()
  const pathBefore = await widget.locator('path.ob-curve-0').first().getAttribute('d')
  await drive.focus()
  await page.keyboard.press('ArrowRight')
  await expect(drive).toHaveValue('1.05')
  await expect(flip).not.toHaveText(before ?? '')
  await expect(widget.locator('path.ob-curve-0').first()).not.toHaveAttribute('d', pathBefore ?? '')
  await expect(widget.locator('.slider-value').first()).toContainText('1.05')
  await page.keyboard.press('End')
  await expect(drive).toHaveValue('4')
  await widget.getByRole('button', { name: 'Reset sliders' }).click()
  await expect(drive).toHaveValue('1')
  await expect(flip).toHaveText(before ?? '')
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
  await beat.scrollIntoViewIfNeeded()
  await beat.locator(`a[data-bridge="${O1.bridge}"]`).click()
  await expect(page).toHaveURL(new RegExp(`#/709/ch/${O1.chapter}\\?ret=qc709~O1~${O1.bridgeParagraph}~[0-9.]+~(ground|formal)#${O1.unit}$`))
  await expect(page.locator(`#${O1.unit}-title`)).toBeFocused()
  await expect(bar(page)).toBeVisible()
  await expect(bar(page)).toContainText('Optics Lab O1')
  await expect(bar(page)).toContainText('step 1')
  await bar(page).getByRole('link').first().click()
  await expect(page).toHaveURL(/#\/709\/optics\/O1/)
  await expect(page.locator(`[data-beat="${O1.bridgeParagraph}"]`)).toBeFocused()
  await expect.poll(() => paragraphAtCentre(page)).toBe(O1.bridgeParagraph)
  await expect(bar(page)).toHaveCount(0)
  await expectNoErrors(errors)
})

test('the chapter unit shows "From the optics lab"; its chip opens the section with a bar back to the unit', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(`#/709/ch/${O1.chapter}#${O1.unit}`)
  const optics = page.locator(`.unit-notes[data-unit-optics="${O1.unit}"]`)
  await expect(optics).toContainText('From the optics lab')
  await expect(optics).toContainText('§2, pp. 127–128')
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
  await page.goto('#/709/ch/Q5#q5-problem')
  await expect(page.locator('#q5-problem-title')).toBeVisible()
  await expect(page.locator('.unit-notes[data-unit-optics]')).toHaveCount(0)
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
  await expect(page.locator('.notes-widget svg.ob-plot')).toBeVisible()
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.topbar')).toBeHidden()
  await expect(page.locator('.notes-widget .ob-sliders')).toBeHidden()
  await expect(page.locator('.notes-widget svg.ob-plot')).toBeVisible()
  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-') // (not kept: no *.pdf may live under app/, content/verbatim.test.ts)
  expect(pdf.byteLength).toBeGreaterThan(10_000)
  await page.emulateMedia({ media: 'screen' })
  await expectNoErrors(errors)
})

test('375 px: the page and its bench read in one column with no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto(`#/709/optics/${O1.id}`)
  await expect(page.locator('.notes-widget svg.ob-plot')).toBeVisible()
  const wide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  expect(wide).toBe(false)
})
