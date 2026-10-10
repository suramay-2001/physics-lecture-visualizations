/**
 * Lecture 10's Try-it widgets on the real lecture page (the two-spin widget in units 10.1–10.3, the one ghz-game widget in units 10.4–10.8)
 * and the GHZ game in the Arcade. Each test does what the unit's "Try this" lines say and reads the numbers the widget draws, so a line that
 * stopped being true on the widget as it renders fails here.
 *
 *   PW_PREVIEW_PORT=5235 npx playwright test --project=preview e2e/l10-widgets.spec.ts
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

async function openLecture(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('#/lecture/L10')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
}

/** The Try-it widget of a unit (a lazy chunk, so wait for its picture). */
async function widgetOf(page: Page, unit: string, title: RegExp): Promise<Locator> {
  await openLecture(page)
  const w = page.locator(`#${unit} section.widget`, { hasText: title }).first()
  await w.scrollIntoViewIfNeeded()
  await expect(w.locator('svg').first()).toBeVisible({ timeout: 15_000 })
  return w
}

/** The percentage in the cell `col` (1-based among the tally columns) of the tally row named `row`. */
async function share(w: Locator, row: string, col: number): Promise<string> {
  const cells = w.locator('table.two-spin-tally tbody tr', { hasText: row }).first().locator('td')
  return (await cells.nth(col).innerText()).trim()
}

test.describe('Lecture 10 Try-it: the two-spin widget', () => {
  test('unit 10.1: |ud⟩ with Z on Alice is +1 every time, in either order; the singlet makes Alice’s +1 share about a half', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await widgetOf(page, 'l10-local', /Two spins/)
    await w.getByRole('button', { name: 'Measure 100 pairs' }).click()
    await expect(w.locator('table.two-spin-tally tbody tr', { hasText: 'Alice first' }).locator('td').first()).toHaveText('100')
    await expect.poll(() => share(w, 'Alice first', 1)).toBe('100%') // Alice +1
    await w.getByRole('radio', { name: 'Bob first' }).click()
    await w.getByRole('button', { name: 'Measure 100 pairs' }).click()
    await expect.poll(() => share(w, 'Bob first', 1)).toBe('100%')
    // Bob along x: a coin toss in either order
    for (const row of ['Alice first', 'Bob first']) {
      const bob = Number((await share(w, row, 2)).replace('%', ''))
      expect(bob, `${row}: Bob’s +1 share`).toBeGreaterThan(30)
      expect(bob, `${row}: Bob’s +1 share`).toBeLessThan(70)
    }
    // the singlet (a new setup, a fresh tally)
    await w.getByRole('radio', { name: 'singlet', exact: true }).click()
    await w.getByRole('button', { name: 'Measure 100 pairs' }).click()
    await expect.poll(async () => Number((await share(w, 'Bob first', 1)).replace('%', ''))).toBeGreaterThan(30)
    await expect(w.locator('table.two-spin-tally .two-spin-exact')).toContainText('50%')
    await expectNoErrors(errors)
  })

  test('unit 10.2: both arrows have length 0 on the singlet and jump to 1 on the product |ud⟩', async ({ page }) => {
    const w = await widgetOf(page, 'l10-empty-centre', /Two spins/)
    const readout = w.locator('svg.two-spin-svg')
    await expect(readout).toHaveAttribute('aria-label', /\|r_A\| = 0 · \|r_B\| = 0/)
    await w.getByRole('radio', { name: 'Alice x' }).click()
    await w.getByRole('button', { name: 'Measure 100 pairs' }).click()
    const alice = Number((await share(w, 'Alice first', 1)).replace('%', ''))
    expect(alice).toBeGreaterThan(30)
    expect(alice).toBeLessThan(70)
    await w.getByRole('radio', { name: 'product |ud⟩' }).click()
    await expect(readout).toHaveAttribute('aria-label', /\|r_A\| = 1 · \|r_B\| = 1/)
  })

  test('unit 10.3: the path from |ud⟩ to the singlet: at 30° each arrow is 0.5 long, at 45° it is 0', async ({ page }) => {
    const w = await widgetOf(page, 'l10-correlations', /Two spins/)
    const readout = w.locator('svg.two-spin-svg')
    await expect(readout).toHaveAttribute('aria-label', /\|r_A\| = 1 · \|r_B\| = 1/)
    const slider = w.locator('input[type="range"]')
    await slider.fill('30')
    await expect(readout).toHaveAttribute('aria-label', /\|r_A\| = 0\.5 · \|r_B\| = 0\.5/)
    await slider.fill('45')
    await expect(readout).toHaveAttribute('aria-label', /\|r_A\| = 0 · \|r_B\| = 0/)
    await w.getByRole('radio', { name: 'Alice z' }).click()
    await w.getByRole('radio', { name: 'Bob x' }).click()
    await w.getByRole('button', { name: 'Measure 100 pairs' }).click()
    await expect(w.locator('table.two-spin-tally .two-spin-exact')).toContainText('50%')
    const product = Number((await share(w, 'Alice first', 3)).replace('%', ''))
    expect(product).toBeGreaterThan(30)
    expect(product).toBeLessThan(70)
  })
})

test.describe('Lecture 10 Try-it: the GHZ game widget', () => {
  test('unit 10.4: write a plan for two (flip Bob’s two answers), then hide it: Alice’s +1 share is about a half, Bob always opposite', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await widgetOf(page, 'l10-instructions', /A plan for two/)
    await expect(w.locator('.ghz-verdict')).toContainText('matches 0 of the 2 rows')
    await expect(w.getByRole('button', { name: /Hide the plan/ })).toBeDisabled()
    await w.getByRole('button', { name: /Bob's answer to Z/ }).click()
    await w.getByRole('button', { name: /Bob's answer to X/ }).click()
    await expect(w.locator('.ghz-verdict')).toContainText('matches both rows')
    await expect(w.locator('.ghz-verdict')).toContainText('4 of the 16 possible plans do')
    await w.getByRole('button', { name: /Hide the plan/ }).click()
    const stats = w.locator('.ghz-stats')
    await expect(stats).toContainText('20 pairs: Alice answered +1 in')
    await expect(stats).toContainText('Bob answered the opposite in 20 of 20')
    await expectNoErrors(errors)
  })

  test('unit 10.5: “always −1” loses ZZZ; two flips find a plan that loses only XZX; no plan shows more than 3 of 4', async ({ page }) => {
    const w = await widgetOf(page, 'l10-ghz-game', /The GHZ game/)
    await expect(w.locator('.ghz-verdict')).toContainText('This plan wins 3 of the 4 inputs and loses ZZZ')
    await w.getByRole('button', { name: /Alice's answer to X/ }).click()
    await w.getByRole('button', { name: /Charlie's answer to Z/ }).click()
    await expect(w.locator('.ghz-verdict')).toContainText('and loses XZX')
    // every one of 64 plans: the verdict never says 4 of the 4
    const names = ['Alice', 'Bob', 'Charlie'].flatMap((p) => ['Z', 'X'].map((c) => new RegExp(`${p}'s answer to ${c}`)))
    for (let k = 0; k < 20; k++) {
      await w.getByRole('button', { name: names[k % 6] }).click()
      await expect(w.locator('.ghz-verdict')).not.toContainText('wins all four')
      await expect(w.locator('.ghz-verdict')).toContainText('The best any of the 64 plans does is 3 of 4')
    }
  })

  test('unit 10.6: the proof line, under any plan: the four row products multiply to +1, the four needs to −1', async ({ page }) => {
    const w = await widgetOf(page, 'l10-no-table', /The GHZ game/)
    const proof = w.locator('.ghz-proof')
    for (const name of [/Alice's answer to Z/, /Bob's answer to X/, /Charlie's answer to Z/]) {
      await w.getByRole('button', { name }).click()
      await expect(proof).toContainText('multiplied: +1')
      await expect(proof).toContainText('The four needs: +1, −1, −1, −1; multiplied: −1')
      await expect(w.locator('.ghz-verdict')).toContainText(/wins (1|3) of the 4 inputs/)
    }
  })

  test('unit 10.7: play 20 rounds on |G⟩: every round is a win and about half of Alice’s answers are −1', async ({ page }) => {
    const w = await widgetOf(page, 'l10-quantum-wins', /share the state/)
    await w.getByRole('button', { name: 'Play 20 rounds' }).click()
    const stats = w.locator('.ghz-stats')
    await expect(stats).toContainText('20 of 20 rounds won')
    const minus = Number((await stats.innerText()).match(/Alice answered −1 in (\d+) of 20/)![1])
    expect(minus).toBeGreaterThanOrEqual(6)
    expect(minus).toBeLessThanOrEqual(14)
    // a fixed input: still every round
    await w.getByRole('radio', { name: 'ZXX' }).click()
    await w.getByRole('button', { name: 'Play 20 rounds' }).click()
    await expect(stats).toContainText('40 of 40 rounds won')
  })

  test('unit 10.8: 40 rounds, the plan “always −1” against |G⟩ on the same inputs: the state wins all 40, the plan loses some', async ({ page }) => {
    const w = await widgetOf(page, 'l10-what-ghz-proves', /best plan against/)
    await w.getByRole('button', { name: 'Play 40 rounds' }).click()
    await expect(w.locator('.ghz-ledger[data-who="state"] .ghz-stats')).toContainText('40 of 40 rounds won')
    const text = await w.locator('.ghz-ledger[data-who="plan"] .ghz-stats').innerText()
    const won = Number(text.match(/(\d+) of 40 rounds won/)![1])
    expect(won).toBeLessThan(40) // it loses whenever the referee names ZZZ: about a quarter of the rounds
    expect(won).toBeGreaterThanOrEqual(20)
  })
})

test.describe('Lecture 10 Arcade: the GHZ game', () => {
  test('the Arcade lists the GHZ game under Lecture 10 with the Spot-the-error rounds', async ({ page }) => {
    await page.goto('#/arcade')
    await expect(page.locator('#arcade-L10 .arcade-card')).toHaveCount(2)
    await expect(page.locator('#arcade-L10')).not.toContainText('ahead of the course')
  })

  test('level 1 accepts only a plan that wins exactly three inputs; level 2 only the right reason; level 3 only 20 of 20; level 4 only XXZ', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('#/arcade/ghz-game')
    await expect(page.locator('#level-title')).toContainText('Three of four')
    const board = page.locator('section.widget')
    await expect(board.locator('svg').first()).toBeVisible({ timeout: 15_000 })
    // the starting plan (all +1) wins one input: refused
    await page.getByRole('button', { name: 'Submit this plan' }).click()
    await expect(page.locator('.step-note')).toContainText('This plan wins 1 of the 4 inputs')
    // flipping Alice's X answer to −1 makes XZX and XXZ meet their needs: three inputs won
    await page.getByRole('button', { name: /Alice's answer to X/ }).click()
    await page.getByRole('button', { name: 'Submit this plan' }).click()
    await expect(page.locator('.game-solved')).toContainText('Solved')
    await page.getByRole('button', { name: 'Next level' }).click()
    // level 2: three wrong reasons, then the right one
    await expect(page.locator('#level-title')).toContainText('Four of four?')
    const options = page.locator('.ce-options button')
    await options.nth(1).click()
    await expect(page.locator('.step-note')).toContainText('That is not it')
    await options.nth(0).click()
    await expect(page.locator('.game-solved')).toContainText('Each of the six answers appears twice')
    await page.getByRole('button', { name: 'Next level' }).click()
    // level 3: share |G>
    await expect(page.locator('#level-title')).toContainText('Share |G⟩')
    await page.getByRole('button', { name: 'Play 20 rounds' }).click()
    await page.locator('.ce-options button', { hasText: '15' }).click()
    await expect(page.locator('.step-note')).toContainText('That is not it')
    await page.locator('.ce-options button', { hasText: '20' }).click()
    await expect(page.locator('.game-verdict')).toContainText('20 of 20 rounds won')
    await page.getByRole('button', { name: 'Next level' }).click()
    // level 4: call the loss
    await expect(page.locator('#level-title')).toContainText('Call the loss')
    await page.locator('.ce-options button', { hasText: /^ZZZ$/ }).click()
    await expect(page.locator('.step-note')).toContainText('That is not it')
    await page.locator('.ce-options button', { hasText: /^XXZ$/ }).click()
    await expect(page.locator('.game-verdict')).toContainText('The plan loses XXZ')
    await expectNoErrors(errors)
  })

  test('Spot the error: the four Lecture 10 rounds each have a planted step', async ({ page }) => {
    await page.goto('#/arcade/spot-the-error')
    const bar = page.locator('.level-bar button')
    await expect(bar.last()).toBeVisible()
    // the Lecture 10 rounds sit between Lecture 9's and Lecture 11's: found by title, so a later lecture's rounds cannot move them
    const titles = ['Which letter does Z act on?', 'The centre of the ball', 'After Alice reads +1', 'A message from Alice?']
    const n = await bar.count()
    let found = 0
    for (let k = 0; k < n; k++) {
      await bar.nth(k).click()
      const title = (await page.locator('#level-title').textContent()) ?? ''
      if (!titles.some((t) => title.endsWith(t))) continue
      await page.getByRole('button', { name: /^Step 3/ }).click()
      await expect(page.locator('.game-solved')).toBeVisible()
      found++
    }
    expect(found).toBe(titles.length)
  })
})
