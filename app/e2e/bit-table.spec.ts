/**
 * Chapter F7's Try-it widget (`bit-table`) on the real chapter page: each test does what the unit's "Try this" lines say and reads what the widget draws, so a line that
 * stopped being true on the widget as it renders fails here. The picture is one svg whose aria-label carries its readout lines; the note under it is a status line.
 *
 *   PW_PREVIEW_PORT=5242 npx playwright test --project=preview e2e/bit-table.spec.ts
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

/** The k-th Try-it widget of the chapter (one per unit, in order). */
async function tryIt(page: Page, k: number): Promise<Locator> {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('#/709/ch/F7')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  const w = page.locator('section.widget').nth(k)
  await w.scrollIntoViewIfNeeded()
  await expect(w).toBeVisible()
  return w
}
const readout = (w: Locator) => w.locator('svg.bit-table-svg')
const setRange = async (input: Locator, value: number) => {
  await input.evaluate((el, v) => {
    const i = el as HTMLInputElement
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    set.call(i, String(v))
    i.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

test.describe('F7 Try-it: gates, strings, a reduction and the cost', () => {
  test('unit 1: AND as a table; the inputs light one output each; XOR is balanced, NAND is not', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 0)
    await expect(readout(w)).toHaveAttribute('aria-label', /1s: 1 of 4/)
    await expect(readout(w)).toHaveAttribute('aria-label', /not constant or balanced/)
    for (const [input, want] of [['00', 'AND(0 0) = 0'], ['01', 'AND(0 1) = 0'], ['10', 'AND(1 0) = 0'], ['11', 'AND(1 1) = 1']] as const) {
      await w.getByRole('button', { name: input, exact: true }).click()
      await expect(w.locator('.widget-note')).toHaveText(want)
    }
    await w.getByRole('radio', { name: 'XOR', exact: true }).click()
    await expect(readout(w)).toHaveAttribute('aria-label', /1s: 2 of 4/)
    await expect(readout(w)).toHaveAttribute('aria-label', /balanced/)
    await w.getByRole('radio', { name: 'NAND', exact: true }).click()
    await expect(readout(w)).toHaveAttribute('aria-label', /1s: 3 of 4/)
    await expect(readout(w)).toHaveAttribute('aria-label', /not constant or balanced/)
    await expectNoErrors(errors)
  })

  test('unit 2: AND merges three arrows; CNOT and Toffoli are reversible; Toffoli swaps only 110 and 111', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 1)
    await expect(readout(w)).toHaveAttribute('aria-label', /3 inputs → one output/)
    await expect(w.locator('svg.bit-table-svg text', { hasText: '×3' })).toHaveCount(1)
    await w.getByRole('radio', { name: 'CNOT', exact: true }).click()
    await expect(readout(w)).toHaveAttribute('aria-label', /reversible/)
    await expect(w.locator('svg.bit-table-svg text', { hasText: '×' })).toHaveCount(0)
    await w.getByRole('radio', { name: 'Toffoli', exact: true }).click()
    await expect(readout(w)).toHaveAttribute('aria-label', /reversible/)
    await w.getByRole('button', { name: '110', exact: true }).click()
    await expect(w.locator('.widget-note')).toHaveText('Toffoli(1 1 0) = 1 1 1')
    await w.getByRole('button', { name: '111', exact: true }).click()
    await expect(w.locator('.widget-note')).toHaveText('Toffoli(1 1 1) = 1 1 0')
    await expectNoErrors(errors)
  })

  test('unit 3: a ⊕ b = 1101 and a·b = 1; three flips make b = 1011 and the XOR 0000; the a·b button shows the AND row', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 2)
    await expect(w.locator('.widget-note')).toHaveText('a ⊕ b = 1101 and a·b = 1.')
    await expect(readout(w)).toHaveAttribute('aria-label', /differ in 3 places/)
    for (const place of [1, 2, 4]) await w.getByRole('button', { name: new RegExp(`^b, place ${place}:`) }).click()
    await expect(w.locator('.widget-note')).toHaveText('a ⊕ b = 0000 and a·b = 1.')
    await w.getByRole('radio', { name: 'a·b', exact: true }).click()
    await expect(readout(w)).toHaveAttribute('aria-label', /a·b = 1/)
    await expect(readout(w)).toHaveAttribute('aria-label', /a AND b = 1011/)
    await expectNoErrors(errors)
  })

  test('unit 4: Step swaps then adds, then rank 2 and the null space 000, 110; flipping 111 to 011 gives 000, 100', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 3)
    await expect(readout(w)).toHaveAttribute('aria-label', /move 0 of 2/)
    await w.getByRole('button', { name: 'Step', exact: true }).click()
    await expect(readout(w)).toHaveAttribute('aria-label', /swap rows 1 and 2/)
    await w.getByRole('button', { name: 'Step', exact: true }).click()
    await expect(readout(w)).toHaveAttribute('aria-label', /add row 2 to row 1/)
    await expect(readout(w)).toHaveAttribute('aria-label', /rank 2/)
    await expect(readout(w)).toHaveAttribute('aria-label', /null space: 000, 110/)
    await w.getByRole('button', { name: /^row 2, place 1:/ }).click()
    await expect(readout(w)).toHaveAttribute('aria-label', /move 0 of 2/)
    await w.getByRole('button', { name: 'Step', exact: true }).click()
    await w.getByRole('button', { name: 'Step', exact: true }).click()
    await expect(readout(w)).toHaveAttribute('aria-label', /rank 2/)
    await expect(readout(w)).toHaveAttribute('aria-label', /null space: 000, 100/)
    await expectNoErrors(errors)
  })

  test('unit 5: n = 10 reads 100, 1024 and 32; n = 20 reads 400, 1 048 576 and 1024', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await tryIt(page, 4)
    await expect(w.locator('.widget-note')).toHaveText('n = 10: n² = 100, 2ⁿ = 1024, 2^(n/2) = 32.')
    await setRange(w.locator('input[type=range]'), 20)
    await expect(w.locator('.widget-note')).toContainText('n = 20: n² = 400, 2ⁿ = 1 048 576, 2^(n/2) = 1024.')
    await expectNoErrors(errors)
  })
})
