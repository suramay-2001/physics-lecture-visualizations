/**
 * Lecture 9's Try-it widget W4 `pair-grid` (448 L9; rulings 448-L8L11 L9 R1) on the real lecture page: a lazy widget that draws the
 * `matrix` stage kind's pair view. Each test drives it the way the unit's "Try this" lines say and reads the numbers it draws,
 * so a line that stopped being true on the widget as it renders fails here.
 *
 *   PW_PREVIEW_PORT=5233 npx playwright test --project=preview e2e/pair-grid.spec.ts
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

/** The text the widget's drawing shows: its readout lines are the svg's own text. */
const drawn = (w: Locator) => w.locator('svg').first().textContent()
const cells = (w: Locator) => w.locator('svg [data-anchor^="cell-"]')

async function widgetOf(page: Page, k: number): Promise<Locator> {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('#/lecture/L9')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  const w = page.locator('section.widget').nth(k)
  await w.scrollIntoViewIfNeeded()
  await expect(w.locator('svg')).toBeVisible({ timeout: 15_000 }) // the widget is a lazy chunk
  return w
}

test.describe('Lecture 9 Try-it: the pair grid', () => {
  test('unit 9.1: 2 × 6 = 12 boxes; switching to two spins gives 4', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await widgetOf(page, 0)
    await expect(cells(w)).toHaveCount(12)
    expect(await drawn(w)).toContain('dim = 2 × 6 = 12')
    expect(await drawn(w)).toContain('|V3⟩')
    await w.getByRole('radio', { name: 'two spins' }).click()
    await expect(cells(w)).toHaveCount(4)
    await expectNoErrors(errors)
  })

  test('unit 9.2: the dealer’s averages, then two separate dealers at 0.7 and 0.4', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await widgetOf(page, 1)
    const text = await drawn(w)
    expect(text).toContain('⟨a⟩ = 0, ⟨b⟩ = 0')
    expect(text).toContain('⟨ab⟩ = −1')
    await w.getByRole('radio', { name: 'two separate dealers' }).click()
    await w.locator('input[type=range]').nth(0).fill('0.7')
    await w.locator('input[type=range]').nth(1).fill('0.4')
    const sep = await drawn(w)
    expect(sep).toContain('⟨ab⟩ = −0.08')
    expect(sep).toContain('correlation = 0')
    // no setting of the two sliders correlates two separate dealers
    for (const [a, b] of [['0.1', '0.9'], ['1', '0.3'], ['0.5', '0.5']]) {
      await w.locator('input[type=range]').nth(0).fill(a)
      await w.locator('input[type=range]').nth(1).fill(b)
      expect(await drawn(w)).toContain('correlation = 0')
    }
    await expectNoErrors(errors)
  })

  test('unit 9.3: |ud⟩ lights one box; flipping both spins lights |du⟩', async ({ page }) => {
    const w = await widgetOf(page, 2)
    expect(await drawn(w)).toContain('Bob: u 0, d 1')
    await w.locator('input[type=range]').nth(0).fill('180') // Alice θ
    await w.locator('input[type=range]').nth(2).fill('0') // Bob θ
    const text = await drawn(w)
    expect(text).toContain('Alice: u 0, d 1')
    expect(text).toContain('Bob: u 1, d 0')
  })

  test('unit 9.4: four boxes read 0.612 and 0.354; Bob’s totals stay 0.5 as Alice turns; the chances add to 1', async ({ page }) => {
    const w = await widgetOf(page, 3)
    const first = await drawn(w)
    for (const n of ['0.612', '0.354', 'chances add to 1', 'Bob: u 0.5, d 0.5']) expect(first).toContain(n)
    for (const th of ['0', '120', '180']) {
      await w.locator('input[type=range]').nth(0).fill(th)
      const t = await drawn(w)
      expect(t).toContain('Bob: u 0.5, d 0.5')
      expect(t).toContain('chances add to 1')
    }
  })

  test('unit 9.5: the family starts at |ud⟩ and reaches the singlet at 45°; two separate spins cannot', async ({ page }) => {
    const w = await widgetOf(page, 4)
    await expect(w.locator('input[type=range]')).toHaveCount(1) // t only
    await w.locator('input[type=range]').fill('45')
    expect(await drawn(w)).toContain('1/√2')
    await w.getByRole('radio', { name: 'two separate spins' }).click()
    await expect(w.locator('input[type=range]')).toHaveCount(4)
    expect(await drawn(w)).toContain('α_u')
  })

  test('unit 9.6: the factoring test is opt-in (beyond the notes): off at first, 0.5 for the singlet, 0 for any two separate spins', async ({ page }) => {
    const w = await widgetOf(page, 5)
    expect(await drawn(w)).not.toContain('ψuuψdd')
    expect(await drawn(w)).not.toContain('product')
    const box = w.getByRole('checkbox')
    await expect(box).not.toBeChecked()
    await box.check()
    const deep = await drawn(w)
    expect(deep).toContain('ψuuψdd − ψudψdu = 0.5')
    expect(deep).toContain('not a product')
    await w.getByRole('radio', { name: 'two separate spins' }).click()
    for (const th of ['0', '90', '135']) {
      await w.locator('input[type=range]').nth(0).fill(th)
      const t = await drawn(w)
      expect(t).toMatch(/ψuuψdd − ψudψdu = 0(?![.\d])/)
      expect(t).not.toContain('not a product')
    }
  })
})
