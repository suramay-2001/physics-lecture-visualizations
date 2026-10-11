/**
 * Widget W16 `oracle-bench` on the real chapter pages (Q16: Deutsch–Jozsa and Bernstein–Vazirani, Q17: Grover; Simon is reached through the mode buttons): each test does what
 * the unit's "Try this" lines say and reads what the widget draws. The picture is three svgs (the circuit, the bars, Grover's plane) whose aria-labels carry their readouts;
 * the numbers under the buttons are a list of readings and the sentence under the step buttons is a live region. e2e does not import app code, so the expected numbers are
 * the engine values the vitest suites pin to the engine (widgets/OracleBench.test.tsx, content/qc709/Q16.tryits.test.tsx, Q17.tryits.test.tsx): the page must print them.
 * For each mode: a step changes the bars, the readings equal the engine value, the page logs no console error, and at 375 px nothing overflows and the controls sit above the
 * drawing. Screens for visual QA (each mode at 1280 and 375) go to e2e/__screens__/709/ (git-ignored).
 *
 *   PW_PREVIEW_PORT=5257 npx playwright test --project=preview e2e/oracle-bench.spec.ts
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { collectErrors, expectNoErrors } from './helpers.ts'

const SCREENS = fileURLToPath(new URL('./__screens__/709/', import.meta.url))

/**
 * The oracle bench of a chapter's k-th unit (Q16 has one per unit, four; Q17 has five). The widget is a lazy chunk and each unit's
 * Suspense boundary commits on its own (under load in two batches), so a position among "the widgets drawn so far" moves as a later one
 * arrives: a bench that was `.first()` becomes `.nth(1)` and the locator reads a fresh bench (a run that looks reset to Start, a radio
 * that never reads checked; instrumented stress, skill 17: no widget ever unmounted). So the bench is found inside its UNIT (units are on
 * the page from the start) by its title; unit 1 of Q16 is the Hadamard bench, the rest are Oracle benches.
 */
 */
async function bench(page: Page, chapter: 'Q16' | 'Q17', k: number, width = 1280): Promise<Locator> {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width, height: width < 700 ? 812 : 1000 })
  await page.goto(`#/709/ch/${chapter}`)
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  const w = page.locator('section.unit').nth(k).locator('.stage-visual section.widget', { hasText: /(Oracle|Hadamard) bench/ })
  await w.scrollIntoViewIfNeeded()
  await expect(w).toBeVisible()
  // the widget is lazy: wait for its drawing
  await expect(w.locator('svg.ob-circuit')).toBeVisible()
  return w
}
const press = (w: Locator, name: string) => w.getByRole('button', { name, exact: true }).click()
const choose = (w: Locator, name: string) => w.getByRole('radio', { name, exact: true }).click()
const reading = (w: Locator, key: string) => w.locator(`li[data-reading="${key}"]`)
const headline = (w: Locator) => w.locator('.ob-headline')
const label = (w: Locator, cls: 'ob-circuit' | 'ob-bars' | 'ob-plane') => w.locator(`svg.${cls}`).getAttribute('aria-label')
const setRange = async (input: Locator, value: number) => {
  await input.evaluate((el, v) => {
    const i = el as HTMLInputElement
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    set.call(i, String(v))
    i.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}
/** The bars as drawn: how many hang below the axis (negative amplitudes), how many have any height, and the signature of their geometry. */
const bars = (w: Locator) =>
  w.locator('svg.ob-bars').evaluate((svg) => {
    const base = Number(svg.querySelector('[data-anchor="axis"] line')!.getAttribute('y1'))
    const rects = [...svg.querySelectorAll('[data-anchor^="bar-"] rect')] as SVGRectElement[]
    return {
      below: rects.filter((r) => Number(r.getAttribute('y')) >= base - 0.5).length,
      tall: rects.filter((r) => Number(r.getAttribute('height')) > 1).length,
      sig: rects.map((r) => `${r.getAttribute('y')}:${r.getAttribute('height')}`).join('|'),
    }
  })
const enabled = async (w: Locator): Promise<string[]> => {
  const out: string[] = []
  for (const name of ['Hadamards', 'Hadamards again', 'Prepare', 'Oracle', 'Mark (U_f)', 'Diffuse (D)', 'Whole step (Q)', 'Final Hadamards', 'Query (U_f)', 'Measure the answer', 'Measure', 'Measure y', 'Back', 'Reset']) {
    const b = w.getByRole('button', { name, exact: true })
    if ((await b.count()) && (await b.isEnabled())) out.push(name)
  }
  return out
}

test.describe('oracle bench: Deutsch–Jozsa (Q16 unit 2, n = 3, the balanced step function)', () => {
  test('each step changes the bars and the readings equal the engine values; the live region says what happened', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 'Q16', 1)
    await expect(w.locator('.ob-headline')).toHaveAttribute('role', 'status')
    await expect(headline(w)).toHaveText('Start: every wire is |0⟩. Press Prepare.')
    expect(await enabled(w)).toEqual(['Prepare'])
    await expect(reading(w, 'f')).toHaveText('f(x) = 1 for x = 1 … 4, else 0 (balanced)')
    await expect(reading(w, 'cost')).toHaveText('oracle calls: 1 in this circuit, 5 for a classical computer that must be sure')
    const b0 = await bars(w)

    await press(w, 'Prepare')
    await expect(headline(w)).toHaveText('Prepared: 8 equal bars of height 0.354.')
    expect(await label(w, 'ob-bars')).toContain('after column 1')
    expect(await label(w, 'ob-circuit')).toContain('after column 1 of 3')
    const b1 = await bars(w)
    expect(b1.sig).not.toBe(b0.sig)
    expect([b1.below, b1.tall]).toEqual([0, 8])
    expect(await enabled(w)).toEqual(['Oracle', 'Back', 'Reset'])

    await press(w, 'Oracle')
    await expect(headline(w)).toHaveText('Oracle applied: 4 of 8 bars point down. The mean of the bars is 0.')
    const b2 = await bars(w)
    expect(b2.sig).not.toBe(b1.sig)
    expect([b2.below, b2.tall]).toEqual([4, 8])
    await expect(reading(w, 'mean')).toHaveText('average of the signs (−1)^f(x): 0')

    await press(w, 'Final Hadamards')
    await expect(headline(w)).toHaveText('Final Hadamards: the amplitude of |000⟩ is 0, so the chance of all zeros is 0.')
    const b3 = await bars(w)
    expect(b3.sig).not.toBe(b2.sig)
    expect([b3.below, b3.tall]).toEqual([1, 4]) // four strings of amplitude ±½: one minus sign
    await expect(reading(w, 'amp0')).toHaveText('amplitude of |000⟩: 0')
    await expect(reading(w, 'p0')).toHaveText('chance of all zeros: 0')
    await expect(reading(w, 'likely')).toHaveText('most likely reading: 4 strings tie at chance 0.25, the first is 100')

    await press(w, 'Measure')
    await expect(headline(w)).toHaveText('Reading: all zeros has chance 0, so f is balanced.')
    const b4 = await bars(w)
    expect(b4.sig).not.toBe(b3.sig)
    expect([b4.below, b4.tall]).toEqual([0, 4]) // the chances: four bars of ¼
    expect(await label(w, 'ob-bars')).toMatch(/P\(100\) = 25 %/)
    await expect(reading(w, 'verdict')).toHaveText('reading: all zeros has chance 0, so f is balanced')
    expect(await enabled(w)).toEqual(['Back', 'Reset'])

    // Back undoes one step, Reset starts again
    await press(w, 'Back')
    await expect(headline(w)).toHaveText('Final Hadamards: the amplitude of |000⟩ is 0, so the chance of all zeros is 0.')
    expect((await bars(w)).sig).toBe(b3.sig)
    await press(w, 'Reset')
    await expect(headline(w)).toHaveText('Start: every wire is |0⟩. Press Prepare.')
    expect((await bars(w)).sig).toBe(b0.sig)
    await expectNoErrors(errors)
  })

  test('the Try-it line: “constant” and “f = 1”, then the three steps: the amplitude of |000⟩ reads −1 and all zeros has chance 1', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 'Q16', 1)
    await choose(w, 'constant')
    await choose(w, 'f = 1')
    await expect(reading(w, 'f')).toHaveText('f(x) = 1 for every x (constant)')
    for (const s of ['Prepare', 'Oracle', 'Final Hadamards']) await press(w, s)
    await expect(reading(w, 'amp0')).toHaveText('amplitude of |000⟩: −1')
    await expect(reading(w, 'p0')).toHaveText('chance of all zeros: 1')
    await expect(reading(w, 'likely')).toHaveText('most likely reading: 000, chance 1')
    expect(await bars(w)).toMatchObject({ below: 1, tall: 1 })
    // changing the function starts the run again
    await choose(w, 'linear a·x ⊕ b')
    await expect(headline(w)).toHaveText('Start: every wire is |0⟩. Press Prepare.')
    await expectNoErrors(errors)
  })

  test('the cost unit: 1 oracle call against 5 classical at n = 3, 9 at n = 4 (the slider), and the one call decides', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 'Q16', 2)
    await expect(reading(w, 'cost')).toHaveText('oracle calls: 1 in this circuit, 5 for a classical computer that must be sure')
    await setRange(w.getByLabel('wires n'), 4)
    await expect(reading(w, 'cost')).toHaveText('oracle calls: 1 in this circuit, 9 for a classical computer that must be sure')
    for (const s of ['Prepare', 'Oracle', 'Final Hadamards', 'Measure']) await press(w, s)
    await expect(reading(w, 'verdict')).toHaveText('reading: all zeros has chance 0, so f is balanced')
    // sixteen bars at n = 4, and the balanced step function is not offered below n = 3
    await setRange(w.getByLabel('wires n'), 2)
    await expect(w.getByRole('radio', { name: 'balanced, not linear' })).toBeDisabled()
    await expect(reading(w, 'f')).toContainText('(balanced)')
    await expectNoErrors(errors)
  })
})

test.describe('oracle bench: Hadamard signs (Q16 unit 1)', () => {
  test('unit 1: Hadamards writes the signs of H⊗³|101⟩ (four bars below the axis); Hadamards again puts all the weight back on |101⟩; no later unit’s name is on the bench', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 'Q16', 0)
    await expect(headline(w)).toHaveText('Start: the wires hold the string |101⟩. Press Hadamards.')
    expect(await enabled(w)).toEqual(['Hadamards'])
    expect(await bars(w)).toMatchObject({ below: 0, tall: 1 })
    // the only algorithm choice is Hadamard signs; there is no function, no cost line and no oracle
    await expect(w.getByRole('radio')).toHaveCount(1)
    await expect(w.getByRole('radio', { name: 'Hadamard signs', exact: true })).toHaveAttribute('aria-checked', 'true')
    const shown = await w.innerText()
    for (const later of ['Bernstein', 'Vazirani', 'Deutsch', 'a·x', '⊕', 'oracle calls', 'classical', 'Hidden string']) expect(shown, later).not.toContain(later)
    await expect(w.locator('li[data-reading="cost"], li[data-reading="f"]')).toHaveCount(0)

    await press(w, 'Hadamards')
    await expect(headline(w)).toHaveText('One column of Hadamards: 8 bars of size 0.354, 4 pointing up and 4 pointing down.')
    expect(await bars(w)).toMatchObject({ below: 4, tall: 8 })
    await expect(reading(w, 'signs')).toHaveText('bars below the axis: 4 of 8')
    expect(await enabled(w)).toEqual(['Hadamards again', 'Back', 'Reset'])
    await press(w, 'Hadamards again')
    expect(await bars(w)).toMatchObject({ below: 0, tall: 1 })
    await expect(reading(w, 'amp')).toHaveText('amplitude of |101⟩: 1')
    await expect(reading(w, 'chance')).toHaveText('chance of 101: 1')
    // the starting string is set with the bit buttons: x = 111 puts half the bars below the axis too (every x but 000 does)
    await w.getByRole('button', { name: 'Starting string x, bit 2 of 3: 0', exact: true }).click()
    await expect(headline(w)).toHaveText('Start: the wires hold the string |111⟩. Press Hadamards.')
    await press(w, 'Hadamards')
    await expect(reading(w, 'signs')).toHaveText('bars below the axis: 4 of 8')
    await expectNoErrors(errors)
  })
})

test.describe('oracle bench: Hadamard signs at 375 px', () => {
  test('unit 1 at 375 px: no sideways scroll, the settings and the steps above the drawing; screens at 1280 and 375', async ({ page }) => {
    const errors = collectErrors(page)
    for (const width of [1280, 375]) {
      const w = await bench(page, 'Q16', 0, width)
      // the second pass is the same page at a narrower width (a hash-only navigation keeps the widget), so the first press may already be done
      if (await w.getByRole('button', { name: 'Hadamards', exact: true }).isEnabled()) await press(w, 'Hadamards')
      const box = (await w.boundingBox())!
      expect(box.width).toBeLessThanOrEqual(width)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      const draw = (await w.locator('.ob-draw').boundingBox())!
      for (const part of ['.ob-setup', '.ob-steps']) {
        const r = (await w.locator(part).boundingBox())!
        if (width < 700) expect(r.y + r.height, `${part} above the drawing`).toBeLessThanOrEqual(draw.y + 1)
      }
      await w.scrollIntoViewIfNeeded()
      await w.screenshot({ path: `${SCREENS}oracle-bench-HadamardSigns-${width}.png` })
    }
    await expectNoErrors(errors)
  })
})

test.describe('oracle bench: Bernstein–Vazirani (Q16 unit 4)', () => {
  test('unit 4 (n = 4, a = 1011, b = 1): the read-off is 1011 with amplitude −1; “b = 0” and run again: amplitude 1; the string is the same', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 'Q16', 3)
    await expect(reading(w, 'cost')).toHaveText('oracle calls: 1 in this circuit, 5 classical')
    for (const s of ['Prepare', 'Oracle', 'Final Hadamards']) await press(w, s)
    await expect(reading(w, 'readoff')).toHaveText('read-off a = 1011, chance 1')
    await expect(reading(w, 'amp')).toHaveText('amplitude of |1011⟩: −1')
    expect(await bars(w)).toMatchObject({ below: 1, tall: 1 })
    expect(await label(w, 'ob-bars')).toContain('|1011⟩: −1')
    await choose(w, 'b = 0')
    for (const s of ['Prepare', 'Oracle', 'Final Hadamards']) await press(w, s)
    await expect(reading(w, 'readoff')).toHaveText('read-off a = 1011, chance 1')
    await expect(reading(w, 'amp')).toHaveText('amplitude of |1011⟩: 1')
    expect(await bars(w)).toMatchObject({ below: 0, tall: 1 })
    // the hidden string is flipped bit by bit: a = 1010
    await w.getByRole('button', { name: 'Hidden string a, bit 4 of 4: 1', exact: true }).click()
    for (const s of ['Prepare', 'Oracle', 'Final Hadamards']) await press(w, s)
    await expect(reading(w, 'readoff')).toHaveText('read-off a = 1010, chance 1')
    await expectNoErrors(errors)
  })
})

test.describe('oracle bench: Grover (Q17)', () => {
  test('unit 1: Prepare, Mark: the marked bar flips below the axis and its chance stays 0.125; D, Q, Q give 0.781, 0.945 and 0.33; the plane agrees', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 'Q17', 0)
    await expect(w.locator('.ob-plane-box')).toContainText('The plane starts once |w₀⟩ is prepared')
    await press(w, 'Prepare')
    await expect(headline(w)).toHaveText('Prepared: 8 equal bars of height 0.354. The chance of 101 is 0.125.')
    expect(await bars(w)).toMatchObject({ below: 0, tall: 8 })
    expect(await label(w, 'ob-plane')).toContain('α = 20.7°')
    expect(await label(w, 'ob-plane')).toContain('chance = 0.125')

    await press(w, 'Mark (U_f)')
    await expect(headline(w)).toHaveText('U_f applied: the bar of |101⟩ flips to −0.354. Its chance is still 0.125.')
    expect(await bars(w)).toMatchObject({ below: 1, tall: 8 })
    await expect(reading(w, 'chance')).toHaveText('chance of 101: 0.125')
    await expect(reading(w, 'mean')).toHaveText('mean amplitude: 0.265')
    expect(await label(w, 'ob-bars')).toContain('mean = 0.265')
    expect(await enabled(w)).toEqual(['Diffuse (D)', 'Measure', 'Back', 'Reset'])
    // the half step: the plane draws both mirrors and the ghost arrow ("after the mark")
    await expect(w.locator('svg.ob-plane')).toContainText('after the mark')

    await press(w, 'Diffuse (D)')
    await expect(reading(w, 'chance')).toHaveText('chance of 101: 0.781')
    await expect(reading(w, 'steps')).toHaveText('whole steps done: 1')
    expect(await label(w, 'ob-plane')).toContain('(2k+1)α = 62.1°')
    expect(await label(w, 'ob-plane')).toContain('chance = 0.7813')
    const afterOne = await bars(w)

    await press(w, 'Whole step (Q)')
    await expect(reading(w, 'chance')).toHaveText('chance of 101: 0.945')
    expect((await bars(w)).sig).not.toBe(afterOne.sig)
    await press(w, 'Whole step (Q)')
    await expect(reading(w, 'chance')).toHaveText('chance of 101: 0.33')
    expect(await label(w, 'ob-plane')).toContain('(2k+1)α = 144.9°')
    expect(await label(w, 'ob-circuit')).toContain('after column 13 of 17')

    await press(w, 'Measure')
    await expect(headline(w)).toHaveText('Reading 101 has chance 0.33.')
    expect(await bars(w)).toMatchObject({ below: 0 })
    expect(await enabled(w)).toEqual(['Back', 'Reset'])
    await expectNoErrors(errors)
  })

  test('unit 5: k* = 2 with chance 0.945 for eight strings; the slider to n = 4 gives k* = 3 with chance 0.961, and a fourth Whole step gives 0.582', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 'Q17', 4)
    await expect(reading(w, 'kopt')).toHaveText('α = 20.7°; best number of steps k* = 2, chance 0.945')
    await press(w, 'Prepare')
    await press(w, 'Whole step (Q)')
    await press(w, 'Whole step (Q)')
    await expect(reading(w, 'chance')).toHaveText('chance of 101: 0.945')
    await setRange(w.getByLabel('wires n'), 4)
    await expect(reading(w, 'kopt')).toHaveText('α = 14.5°; best number of steps k* = 3, chance 0.961')
    await expect(headline(w)).toHaveText('Start: every wire is |0⟩. Press Prepare.')
    await press(w, 'Prepare')
    for (let k = 1; k <= 4; k++) await press(w, 'Whole step (Q)')
    await expect(reading(w, 'chance')).toHaveText('chance of 0101: 0.582')
    await expect(reading(w, 'steps')).toHaveText('whole steps done: 4')
    // sixteen bars; the marked item is chosen with the bit buttons
    await w.getByRole('button', { name: 'Marked item, bit 1 of 4: 0', exact: true }).click()
    await expect(reading(w, 'search')).toHaveText('16 strings, marked item 1101')
    await expectNoErrors(errors)
  })

  test('unit 3: Mark draws both mirror lines, Diffuse turns the arrow by 2α = 41.4° to 62.1°', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 'Q17', 2)
    await press(w, 'Prepare')
    await press(w, 'Mark (U_f)')
    const half = w.locator('svg.ob-plane')
    await expect(half).toContainText('the mark')
    await expect(half).toContainText('through |w₀⟩')
    await press(w, 'Diffuse (D)')
    await expect(half).toContainText('2α = 41.4°')
    await expect(half).toContainText('α = 20.7°')
    expect(await label(w, 'ob-plane')).toContain('(2k+1)α = 62.1°')
    await expectNoErrors(errors)
  })
})

test.describe('oracle bench: Simon (the mode buttons of any bench)', () => {
  test('n = 3, s = 110: Prepare, Query, Measure the answer, Final Hadamards give chance ¼ to each of 000, 001, 110, 111; any answer read gives the same', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 'Q16', 1)
    await choose(w, 'Simon')
    await expect(w.getByLabel('wires n')).toHaveCount(0)
    await expect(reading(w, 's')).toHaveText('secret string s = 110, so f(x) = f(x ⊕ s)')
    expect(await label(w, 'ob-circuit')).toContain('Circuit on 5 wires, 5 columns')
    await press(w, 'Prepare')
    const b1 = await bars(w)
    await press(w, 'Query (U_f)')
    await expect(headline(w)).toHaveText('Query done: the answer wires now hold f(x) beside each input string x.')
    await press(w, 'Measure the answer')
    await expect(reading(w, 'answer')).toHaveText('answer wires read: 00')
    await press(w, 'Final Hadamards')
    await expect(reading(w, 'perp')).toHaveText('strings y with y·s = 0: 000, 001, 110, 111')
    await expect(reading(w, 'chance')).toHaveText('chance of each of those 4: 0.25')
    const b3 = await bars(w)
    expect(b3.sig).not.toBe(b1.sig)
    expect(b3.tall).toBe(4)
    expect(await label(w, 'ob-bars')).toContain('first 3 wires')
    // the bars' readout names the two tallest chances and counts the rest
    expect(await label(w, 'ob-bars')).toMatch(/P\(000\) = 25 %; P\(001\) = 25 %; 2 smaller bars/)
    // the answer wires can be read as any of the four outcomes; the chances of y do not change
    await choose(w, '11')
    await expect(reading(w, 'answer')).toHaveText('answer wires read: 11')
    await expect(reading(w, 'chance')).toHaveText('chance of each of those 4: 0.25')
    // s is chosen with the bit buttons: s = 010 leaves the strings with a zero middle bit
    await w.getByRole('button', { name: 'Secret string s, bit 1 of 3: 1', exact: true }).click()
    await expect(reading(w, 's')).toHaveText('secret string s = 010, so f(x) = f(x ⊕ s)')
    await press(w, 'Prepare')
    for (const s of ['Query (U_f)', 'Measure the answer', 'Final Hadamards']) await press(w, s)
    await expect(reading(w, 'perp')).toHaveText('strings y with y·s = 0: 000, 001, 100, 101')
    await press(w, 'Measure y')
    await expect(headline(w)).toHaveText('Reading y: each of the 4 strings with y·s = 0 has chance 0.25.')
    await expectNoErrors(errors)
  })
})

test.describe('oracle bench: keyboard and labels', () => {
  test('every control has a name; the steps, the choices and the bit buttons work from the keyboard', async ({ page }) => {
    const errors = collectErrors(page)
    const w = await bench(page, 'Q17', 0)
    for (const b of await w.getByRole('button').all()) expect((await b.getAttribute('aria-label')) || (await b.innerText()), 'a button without a name').toBeTruthy()
    await expect(w.getByRole('radiogroup', { name: 'Algorithm' })).toBeVisible()
    await expect(w.getByLabel('wires n')).toBeVisible()
    await expect(w.getByRole('group', { name: 'Marked item' })).toBeVisible()
    await expect(w.getByRole('group', { name: 'Circuit steps' })).toBeVisible()
    await expect(w.getByRole('button', { name: 'Marked item, bit 3 of 3: 1', exact: true })).toHaveAttribute('aria-pressed', 'true')
    // Enter on a focused button presses it; Space too
    await w.getByRole('button', { name: 'Prepare', exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect(headline(w)).toContainText('Prepared')
    await w.getByRole('button', { name: 'Mark (U_f)', exact: true }).focus()
    await page.keyboard.press('Space')
    await expect(headline(w)).toContainText('U_f applied')
    // the marked item is a keyboard-operable bit button, and the whole run starts again
    await w.getByRole('button', { name: 'Marked item, bit 3 of 3: 1', exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect(reading(w, 'search')).toHaveText('8 strings, marked item 100')
    await expect(headline(w)).toContainText('Start:')
    // a radio is a button too
    await w.getByRole('radio', { name: 'Bernstein–Vazirani', exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect(w.getByRole('radio', { name: 'Bernstein–Vazirani', exact: true })).toHaveAttribute('aria-checked', 'true')
    await expectNoErrors(errors)
  })
})

test.describe('oracle bench at 375 px and the visual screens', () => {
  for (const [chapter, k, modes] of [['Q17', 0, ['Grover', 'Deutsch–Jozsa', 'Bernstein–Vazirani', 'Simon']], ['Q16', 1, ['Deutsch–Jozsa']]] as const) {
    test(`${chapter} bench ${k + 1} at 375 px: no sideways scroll, the controls above the drawing, every mode runs; screens at 1280 and 375`, async ({ page }) => {
      const errors = collectErrors(page)
      const run = async (w: Locator, mode: string) => {
        await choose(w, mode)
        const first = mode === 'Simon' ? ['Prepare', 'Query (U_f)', 'Measure the answer', 'Final Hadamards'] : mode === 'Grover' ? ['Prepare', 'Mark (U_f)', 'Diffuse (D)', 'Whole step (Q)', 'Whole step (Q)'] : ['Prepare', 'Oracle', 'Final Hadamards']
        for (const s of first) await press(w, s)
      }
      const shot = async (w: Locator, mode: string, width: number) => {
        await w.scrollIntoViewIfNeeded()
        await w.screenshot({ path: `${SCREENS}oracle-bench-${mode.replace(/[^A-Za-z]/g, '')}-${width}.png` })
      }
      // 1280: each mode, then the same at 375
      let w = await bench(page, chapter, k, 1280)
      for (const mode of modes) {
        await run(w, mode)
        await shot(w, mode, 1280)
      }
      w = await bench(page, chapter, k, 375)
      for (const mode of modes) {
        await run(w, mode)
        const box = (await w.boundingBox())!
        expect(box.width, `${mode}: the widget fits the 375 px screen`).toBeLessThanOrEqual(375)
        expect(await page.evaluate(() => document.documentElement.scrollWidth), `${mode}: no sideways page scroll`).toBeLessThanOrEqual(375)
        // the settings and the step buttons come before the drawing, and the drawing is not wider than the widget
        const setup = (await w.locator('.ob-setup').boundingBox())!
        const steps = (await w.locator('.ob-steps').boundingBox())!
        const draw = (await w.locator('.ob-draw').boundingBox())!
        expect(setup.y + setup.height, `${mode}: settings above the drawing`).toBeLessThanOrEqual(draw.y + 1)
        expect(steps.y + steps.height, `${mode}: steps above the drawing`).toBeLessThanOrEqual(draw.y + 1)
        for (const cls of ['ob-bars', 'ob-plane'] as const) {
          const svg = w.locator(`svg.${cls}`)
          if (await svg.count()) expect((await svg.boundingBox())!.width, `${mode}: ${cls} within the widget`).toBeLessThanOrEqual(box.width)
        }
        await shot(w, mode, 375)
      }
      await expectNoErrors(errors)
    })
  }
})
