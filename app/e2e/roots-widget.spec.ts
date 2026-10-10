/**
 * Chapter F8's Try-it widgets on the real chapter page (the `complex-plane` widget in its roots and phasor modes, and 448's multiply mode for the last unit): each test does
 * what the unit's "Try this" lines say and reads what the widget draws, so a line that stopped being true on the widget as it renders fails here. The picture is one svg whose
 * aria-label carries its readout lines; the line under the roots sliders says how many corners the arrows use.
 *
 *   PW_PREVIEW_PORT=5244 npx playwright test --project=preview e2e/roots-widget.spec.ts
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

/** The k-th Try-it widget of the chapter (one per unit, in order). */
async function tryIt(page: Page, k: number): Promise<Locator> {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('#/709/ch/F8')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  const w = page.locator('section.widget').nth(k)
  await w.scrollIntoViewIfNeeded()
  await expect(w).toBeVisible()
  return w
}
const plane = (w: Locator) => w.locator('svg.plane')
const setRange = async (input: Locator, value: number) => {
  await input.evaluate((el, v) => {
    const i = el as HTMLInputElement
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    set.call(i, String(v))
    i.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}
/** The two sliders of the roots mode: N, then the step. */
const stepSlider = (w: Locator) => w.locator('input[type=range]').nth(1)
const use = (w: Locator) => w.locator('[data-roots-use]')

test.describe('F8 Try-it: roots of unity, partial laps, the kernel and a doubled turn', () => {
  test('unit 1 (clock): step 4 on 12 uses three corners, four times each; step 5 uses all twelve', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 0)
    await expect(use(w)).toHaveText('corners used: 3 of 12, each 4 times')
    await setRange(stepSlider(w), 5)
    await expect(use(w)).toHaveText('corners used: 12 of 12, each 1 time')
    await expectNoErrors(errors)
  })

  test('unit 2 (euclid): step 5 on 12 uses all twelve; step 8 uses three (gcd 4); step 7 uses all twelve again', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 1)
    await expect(use(w)).toHaveText('corners used: 12 of 12, each 1 time')
    await setRange(stepSlider(w), 8)
    await expect(use(w)).toHaveText('corners used: 3 of 12, each 4 times')
    await setRange(stepSlider(w), 7)
    await expect(use(w)).toHaveText('corners used: 12 of 12, each 1 time')
    await expectNoErrors(errors)
  })

  test('unit 3 (roots): N = 8, step 3 closes (sum = 0, size 0); step 8 gives sum = 8; step 4 gives sum = 0 again', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 2)
    await expect(plane(w)).toHaveAttribute('aria-label', /sum = 0/)
    await expect(plane(w)).toHaveAttribute('aria-label', /size 0;/)
    await expect(plane(w).locator('text', { hasText: 'sum = 0' }).first()).toBeVisible()
    await setRange(stepSlider(w), 8)
    await expect(plane(w)).toHaveAttribute('aria-label', /sum = 8/)
    await expect(plane(w)).toHaveAttribute('aria-label', /size 8;/)
    await setRange(stepSlider(w), 4)
    await expect(plane(w)).toHaveAttribute('aria-label', /sum = 0/)
    await expect(use(w)).toHaveText('corners used: 2 of 8, each 4 times')
    await expectNoErrors(errors)
  })

  test('unit 4 (dft): N = 8, step 0 gives sum = 8; steps 1 to 7 each give sum = 0', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 3)
    await expect(plane(w)).toHaveAttribute('aria-label', /sum = 8/)
    await expect(plane(w)).toHaveAttribute('aria-label', /size 8;/)
    for (let k = 1; k <= 7; k++) {
      await setRange(stepSlider(w), k)
      await expect(plane(w), `step ${k}`).toHaveAttribute('aria-label', /sum = 0/)
    }
    await expectNoErrors(errors)
  })

  test('unit 5 (geometric): three arrows 20° apart read size 2.879; 0°, 60°, 120° read size 2; 0°, 120°, 240° read size 0', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 4)
    await expect(plane(w)).toHaveAttribute('aria-label', /size 2\.879;/)
    const sliders = w.locator('input[type=range]')
    await setRange(sliders.nth(1), 60)
    await setRange(sliders.nth(2), 120)
    await expect(plane(w)).toHaveAttribute('aria-label', /size 2;/)
    await setRange(sliders.nth(1), 120)
    await setRange(sliders.nth(2), 240)
    await expect(plane(w)).toHaveAttribute('aria-label', /size 0;/)
    await expectNoErrors(errors)
  })

  test('unit 6 (fractions): z = w at −135° and the product row reads 90°; dragging w to −i makes it read 135°', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 5)
    const row = (name: string) => w.locator('table.readout-table tr', { has: page.locator('th', { hasText: new RegExp(`^${name}$`) }) })
    await expect(row('z')).toContainText('φ=-135°')
    await expect(row('w')).toContainText('φ=-135°')
    await expect(row('zw')).toContainText('φ=90°')
    await w.getByRole('radio', { name: 'drag w' }).click()
    // the plane is drawn with extent 2.5 in a 340-unit view: the point −i is 1/2.5 of the half-width below the centre
    const box = (await plane(w).boundingBox())!
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2 + (box.height / 2) * (1 / 2.5)
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.up()
    await expect(row('w')).toContainText('φ=-90°')
    await expect(row('zw')).toContainText('φ=135°')
    await expectNoErrors(errors)
  })
})
