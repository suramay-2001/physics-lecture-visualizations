/**
 * Lecture 11's Try-it widgets on the real lecture page: the Bloch sphere's turns (units 11.1 and 11.4), the complex plane (11.2 multiply,
 * 11.3 Euler), the phase dial (11.5) and the two phase clocks (11.6). Each test does what the unit's "Try this" lines say and reads
 * the numbers the widget draws, so a line that stopped being true on the widget as it renders fails here. The clocks' drawing is one
 * svg whose aria-label carries its readout lines. Reduced motion is requested, so the sphere's turns land at once.
 *
 *   PW_PREVIEW_PORT=5236 npx playwright test --project=preview e2e/l11-widgets.spec.ts
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

async function openLecture(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('#/lecture/L11')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
}

/** The k-th Try-it widget of the lecture (one per unit, in order). */
async function tryIt(page: Page, k: number): Promise<Locator> {
  await openLecture(page)
  const w = page.locator('section.widget').nth(k)
  await w.scrollIntoViewIfNeeded()
  await expect(w).toBeVisible()
  return w
}

const setRange = async (input: Locator, value: number) => {
  await input.evaluate((el, v) => {
    const i = el as HTMLInputElement
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    set.call(i, String(v))
    i.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

test.describe('Lecture 11 Try-it: the Bloch sphere', () => {
  test('unit 11.1: three R_z(30°) turns reach φ = 90°, and so does one R_z(90°) from φ = 0°', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 0)
    await expect(w.locator('.widget-note')).toContainText('θ = 90°')
    await expect(w.locator('.widget-note')).toContainText('φ = 0°')
    const turn30 = w.locator('.preset-row', { hasText: 'Rotate about z' }).locator('button').first()
    for (const want of [30, 60, 90]) {
      await turn30.click()
      await expect(w.locator('.widget-note')).toContainText(`φ = ${want}°`)
    }
    await setRange(w.locator('input[type=range]').nth(1), 0)
    await expect(w.locator('.widget-note')).toContainText('φ = 0°')
    await w.locator('.preset-row', { hasText: 'Rotate about z' }).locator('button').nth(1).click()
    await expect(w.locator('.widget-note')).toContainText('φ = 90°')
    await expectNoErrors(errors)
  })

  test('unit 11.4: nine R_z(10°) turns make a quarter turn', async ({ page }) => {
    const w = await tryIt(page, 3)
    const turn10 = w.locator('.preset-row', { hasText: 'Rotate about z' }).locator('button').first()
    for (let k = 1; k <= 9; k++) {
      await turn10.click()
      await expect(w.locator('.widget-note')).toContainText(`φ = ${10 * k}°`)
    }
  })
})

test.describe('Lecture 11 Try-it: the complex plane', () => {
  test('unit 11.2: z, w and zw all have size 1; pulling w off the unit circle stretches zw by the same factor', async ({ page }) => {
    const w = await tryIt(page, 1)
    const table = w.locator('.readout-table')
    await expect(table.locator('tr', { hasText: 'zw' })).toContainText('r=1')
    await expect(table.locator('tr').nth(0)).toContainText('r=1')
    await expect(table.locator('tr').nth(1)).toContainText('r=1')
    await w.getByRole('radio', { name: 'drag w' }).click()
    const svg = w.locator('svg.plane')
    const box = (await svg.boundingBox())!
    const unit = Number(await svg.locator('circle.unit-circle').getAttribute('r'))
    const k = box.width / 340
    const at = (x: number, y: number) => ({ x: box.x + (170 + x * unit) * k, y: box.y + (170 - y * unit) * k })
    const from = at(0.8, 0.6)
    const to = at(1.6, 1.2)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps: 8 })
    await page.mouse.up()
    const rw = Number(((await table.locator('tr').nth(1).textContent()) ?? '').match(/r=([\d.]+)/)![1])
    const rzw = Number(((await table.locator('tr', { hasText: 'zw' }).textContent()) ?? '').match(/r=([\d.]+)/)![1])
    expect(rw).toBeGreaterThan(1.5)
    expect(rzw).toBeCloseTo(rw, 2)
  })

  test('unit 11.3: with n = 1 the step ends outside the circle; at n = 64 the polygon closes on −i', async ({ page }) => {
    const w = await tryIt(page, 2)
    await expect(w.locator('svg.svgk')).toBeVisible({ timeout: 15_000 })
    await expect(w.locator('svg.svgk')).toHaveAttribute('aria-label', /n = 1/)
    const size1 = Number(((await w.locator('svg.svgk').getAttribute('aria-label')) ?? '').match(/size ([\d.]+)/)![1])
    expect(size1).toBeGreaterThan(1.5)
    await setRange(w.locator('input[type=range]').nth(1), 64)
    await expect(w.locator('svg.svgk')).toHaveAttribute('aria-label', /n = 64/)
    const label = (await w.locator('svg.svgk').getAttribute('aria-label')) ?? ''
    const size64 = Number(label.match(/size ([\d.]+)/)![1])
    expect(size64).toBeGreaterThan(1)
    expect(size64).toBeLessThan(1.03)
    expect(label).toMatch(/end [^;]*1\.0\d*i/)
  })
})

test.describe('Lecture 11 Try-it: the phase dial', () => {
  test('unit 11.5: a common phase turns both phasors and leaves the point and the relative phase alone; the slider moves the point', async ({ page }) => {
    const w = await tryIt(page, 4)
    await expect(w.getByText(/relative phase arg\(β\/α\) = 0°/)).toBeVisible()
    await w.getByRole('button', { name: /multiply both by/ }).click()
    await expect(w.getByText(/Last applied/)).toBeVisible()
    await expect(w.getByText(/relative phase arg\(β\/α\) = 0°/)).toBeVisible()
    await setRange(w.locator('input[type=range]'), 90)
    await expect(w.getByText(/relative phase arg\(β\/α\) = 90°/)).toBeVisible()
  })
})

test.describe('Lecture 11 Try-it: the two phase clocks', () => {
  const drawing = (w: Locator) => w.locator('svg.two-clocks-svg')
  const label = async (w: Locator) => (await drawing(w).getAttribute('aria-label')) ?? ''

  test('unit 11.6: at εt/ħ = 45° the gap is 90° and the arrow points along +y; raising Ē changes the hands, not the gap or P(+x)', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 5)
    await expect(drawing(w)).toBeVisible({ timeout: 15_000 })
    await expect(drawing(w)).toHaveAttribute('aria-label', /εt\/ħ = 0°/)
    await setRange(w.locator('input[type=range]').nth(0), 45)
    await expect(drawing(w)).toHaveAttribute('aria-label', /gap = 90°/)
    await expect(drawing(w).locator('[data-panel="top"]')).toContainText('φ = 90°')
    const before = await label(w)
    expect(before).toMatch(/hands −135°, −45°/)
    expect(before).toMatch(/P\(\+x\) = 0\.5(;|$)/)
    await setRange(w.locator('input[type=range]').nth(1), 4)
    await expect(drawing(w)).toHaveAttribute('aria-label', /hands 135°, −135°/)
    const after = await label(w)
    expect(after).toMatch(/gap = 90°/)
    expect(after).toMatch(/P\(\+x\) = 0\.5(;|$)/)
    await expect(drawing(w).locator('[data-panel="top"]')).toContainText('φ = 90°')
    await expectNoErrors(errors)
  })

  test('unit 11.6: starting in |+z⟩ gives one clock and no motion at any time', async ({ page }) => {
    const w = await tryIt(page, 5)
    await expect(drawing(w)).toBeVisible({ timeout: 15_000 })
    await w.getByRole('radio', { name: '|+z⟩' }).click()
    await setRange(w.locator('input[type=range]').nth(0), 100)
    await expect(drawing(w)).toHaveAttribute('aria-label', /gap: one clock only/)
    await expect(drawing(w).locator('[data-panel="top"]')).toContainText('a pole: no azimuth')
    await expect(drawing(w).locator('[data-panel="gap"]')).toContainText('one clock only')
  })

  test('unit 11.6: Play runs the time round and Pause stops it; Back to t = 0 resets', async ({ page }) => {
    const w = await tryIt(page, 5)
    await expect(drawing(w)).toBeVisible({ timeout: 15_000 })
    const play = w.getByRole('button', { name: 'Play' })
    await play.click()
    await expect(w.getByRole('button', { name: 'Pause' })).toBeVisible()
    await expect.poll(async () => Number(await w.locator('input[type=range]').nth(0).inputValue()), { timeout: 8000 }).toBeGreaterThan(10)
    await w.getByRole('button', { name: 'Pause' }).click()
    const frozen = Number(await w.locator('input[type=range]').nth(0).inputValue())
    await page.waitForTimeout(500)
    expect(Number(await w.locator('input[type=range]').nth(0).inputValue())).toBe(frozen)
    await w.getByRole('button', { name: /Back to t = 0/ }).click()
    await expect(drawing(w)).toHaveAttribute('aria-label', /εt\/ħ = 0°/)
  })
})

test.describe('Lecture 11 Arcade', () => {
  test('Bloch golf: the Waiting game offers one turn (a quarter period of waiting); three of them sink the hole', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('#/arcade/bloch-golf')
    const bar = page.locator('.level-bar button')
    await bar.nth((await bar.count()) - 1).click()
    await expect(page.locator('#level-title')).toContainText('Waiting game')
    await expect(page.locator('.golf-moves button')).toHaveCount(1)
    const wait = page.getByRole('button', { name: 'z +90°' })
    await expect(wait).toBeVisible()
    await wait.click()
    await wait.click()
    await expect(page.locator('.game-verdict')).toContainText('strokes 2 · par 3')
    await wait.click()
    await expect(page.locator('.game-verdict')).toContainText('strokes 3 · par 3 · on par')
    await expectNoErrors(errors)
  })

  test('Spot the error: the dropped i of the Schrödinger equation is step 4; the step before it holds', async ({ page }) => {
    await page.goto('#/arcade/spot-the-error')
    const bar = page.locator('.level-bar button')
    // the five Lecture 11 rounds come last: keep-z, step-exact, drop-i, energy-constant, turn-rate
    await bar.nth((await bar.count()) - 3).click()
    await expect(page.locator('#level-title')).toContainText('The last step of the equation')
    await page.getByRole('button', { name: /^Step 3/ }).click()
    await expect(page.locator('.step-note')).toHaveText('This step holds. Look again.')
    await page.getByRole('button', { name: /^Step 4/ }).click()
    await expect(page.getByRole('status')).toContainText('The factor to multiply by')
  })
})
