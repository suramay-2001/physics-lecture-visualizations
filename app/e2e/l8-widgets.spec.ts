/**
 * Lecture 8's Try-it widgets on the real lecture page: the polarization dial (unit 8.3) and the four BB84 benches (units 8.4,
 * 8.6, 8.7, 8.8). Each test does what the unit's "Try this" lines say and reads the numbers the widget draws, so a line that stopped
 * being true on the widget as it renders fails here. The bench's drawing is one svg whose aria-label carries its readout lines.
 *
 *   PW_PREVIEW_PORT=5234 npx playwright test --project=preview e2e/l8-widgets.spec.ts
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

async function openLecture(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('#/lecture/L8')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
}

async function dial(page: Page): Promise<Locator> {
  await openLecture(page)
  const w = page.locator('section.widget:has(.pdial-readout)')
  await w.scrollIntoViewIfNeeded()
  await expect(w.locator('svg.pdial-svg')).toBeVisible({ timeout: 15_000 }) // a lazy widget chunk
  return w
}

/** The k-th BB84 bench of the lecture (units 8.4, 8.6, 8.7, 8.8 in order). */
async function bench(page: Page, k: number): Promise<Locator> {
  await openLecture(page)
  // the four benches are lazy chunks that mount one after another: pick by position only once all four are there, or `nth(0)` can be the
  // second unit's bench while the first is still loading (a flake of the original spec, found in the L8/L9 fix pass)
  await expect(page.locator('section.widget', { hasText: 'BB84 bench' })).toHaveCount(4, { timeout: 20_000 })
  const w = page.locator('section.widget', { hasText: 'BB84 bench' }).nth(k)
  await w.scrollIntoViewIfNeeded()
  await expect(w.getByRole('button', { name: 'Send 10', exact: true })).toBeVisible({ timeout: 15_000 })
  return w
}

/** The readout lines of the bench's drawing (its svg's aria-label). */
const ledger = (w: Locator) => w.locator('svg.bb84-bench-svg')
const num = (s: string | null, re: RegExp): number => {
  const m = (s ?? '').match(re)
  if (!m) throw new Error(`no match for ${re} in "${s}"`)
  return Number(m[1])
}

test.describe('Lecture 8 Try-it: the polarization dial', () => {
  test('unit 8.3: 45° of light is 90° on the sphere; an electron’s 45° is 45°; 180° flips the arrow and keeps every chance', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await dial(page)
    const readout = w.locator('.pdial-readout')
    await w.getByRole('button', { name: 'Turn 45°' }).click()
    await expect(readout).toContainText('lab turn 45° → sphere turn 90°')
    await w.getByRole('radio', { name: 'electron' }).click()
    await w.getByRole('button', { name: 'Turn 45°' }).click()
    await expect(readout).toContainText('lab turn 45° → sphere turn 45°')
    await w.getByRole('radio', { name: 'photon' }).click()
    await w.getByRole('button', { name: 'Turn 180°' }).click()
    await expect(readout).toContainText('sphere turn 360°')
    await expect(readout).toContainText(/aligned port\s*P = 100\.0%/)
    await expect(readout).toContainText('The arrow now points the other way')
    await expectNoErrors(errors)
  })

  test('unit 8.3: 90° of light crosses the whole sphere, so the aligned port goes dark', async ({ page }) => {
    const w = await dial(page)
    await w.getByRole('button', { name: 'Turn 90°' }).click()
    await expect(w.locator('.pdial-readout')).toContainText('lab turn 90° → sphere turn 180°')
    await expect(w.locator('.pdial-readout')).toContainText(/aligned port\s*P = 0\.0%/)
    await w.getByRole('button', { name: 'Back to 0°' }).click()
    await expect(w.locator('.pdial-readout')).toContainText(/aligned port\s*P = 100\.0%/)
  })
})

test.describe('Lecture 8 Try-it: the BB84 bench', () => {
  test('unit 8.4: matched rows agree; with Eve on, comparing bases shows the kept-bits-wrong share above 0', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 0)
    await w.getByRole('button', { name: 'Send 10', exact: true }).click()
    await expect(ledger(w)).toHaveAttribute('aria-label', /10 photons sent/)
    await w.getByRole('checkbox', { name: /compare bases/ }).check()
    await expect(ledger(w)).toHaveAttribute('aria-label', /kept bits wrong 0(;|$)/)
    await w.getByRole('radio', { name: 'Eve on every photon' }).click()
    await w.getByRole('button', { name: 'Send 100', exact: true }).click()
    await expect(ledger(w)).toHaveAttribute('aria-label', /110 photons sent/)
    await expect(ledger(w)).not.toHaveAttribute('aria-label', /kept bits wrong 0(;|$)/)
    await expectNoErrors(errors)
  })

  test('unit 8.6: about half of 100 rounds are kept; a 20-bit test of an Eve-free run shows 0 errors and leaves the rest secret', async ({ page }) => {
    const w = await bench(page, 1)
    await w.getByRole('button', { name: 'Send 100', exact: true }).click()
    await w.getByRole('checkbox', { name: /compare bases/ }).check()
    const label = await ledger(w).getAttribute('aria-label')
    const kept = num(label, /kept (\d+) of 100/)
    expect(kept).toBeGreaterThan(35)
    expect(kept).toBeLessThan(65)
    expect(label).toMatch(/kept bits wrong 0(;|$)/)
    await w.locator('input[type=range]').fill('20')
    await expect(ledger(w)).toHaveAttribute('aria-label', /test: 20 bits, 0 errors/)
    expect(num(await ledger(w).getAttribute('aria-label'), /(\d+) bits stay secret/)).toBe(kept - 20)
    // a new run still never disagrees
    await w.getByRole('button', { name: 'New run' }).click()
    await w.getByRole('button', { name: 'Send 100', exact: true }).click()
    await expect(ledger(w)).toHaveAttribute('aria-label', /kept bits wrong 0(;|$)/)
  })

  test('unit 8.7: under the full attack the kept-bits-wrong share lands near the exact ¼ and Eve knows about half of the kept bits', async ({ page }) => {
    const w = await bench(page, 2)
    await w.getByRole('button', { name: 'Send 1000', exact: true }).click()
    await w.getByRole('checkbox', { name: /compare bases/ }).check()
    const label = await ledger(w).getAttribute('aria-label')
    expect(label).toContain('exact error rate 0.25')
    expect(num(label, /kept bits wrong (\d\.\d+)/)).toBeGreaterThan(0.2)
    expect(num(label, /kept bits wrong (\d\.\d+)/)).toBeLessThan(0.3)
    const knows = num(label, /Eve knows (\d+) of \d+/)
    const kept = num(label, /Eve knows \d+ of (\d+)/)
    expect(kept).toBe(num(label, /kept (\d+) of 1000/))
    expect(knows / kept).toBeGreaterThan(0.4)
    expect(knows / kept).toBeLessThan(0.6)
  })

  test('unit 8.8: the no-error chance is 0.0075 for 17 tested bits, 0.0100 for 16 and 0.0032 for 20', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 3)
    await w.getByRole('button', { name: 'Send 100', exact: true }).click()
    await expect(ledger(w)).toHaveAttribute('aria-label', /no-error chance 0\.0075/)
    const m = w.locator('input[type=range]')
    await m.fill('16')
    await expect(ledger(w)).toHaveAttribute('aria-label', /no-error chance 0\.0100/)
    await m.fill('17')
    await expect(ledger(w)).toHaveAttribute('aria-label', /no-error chance 0\.0075/)
    await m.fill('20')
    await expect(ledger(w)).toHaveAttribute('aria-label', /no-error chance 0\.0032/)
    await expectNoErrors(errors)
  })
})
