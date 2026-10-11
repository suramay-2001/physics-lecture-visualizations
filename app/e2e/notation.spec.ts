/**
 * The notation explainers (decisions/notation-explainers.md), on the built app and the dev server alike:
 *   - on by default with a topbar toggle "Explain notation", remembered per viewer;
 *   - desktop: hover opens a card after ~300 ms, click pins, Esc closes, a press elsewhere closes a pinned card;
 *   - touch: a tap opens a card that stays inside a 375 px screen;
 *   - keyboard: ONE Tab stop per reading group (a story beat, a review card, a challenge …), not one per formula; focus shows an
 *     outline and a hint, never a card; arrows move between the marks of the whole group, Enter or Space opens and pins, Esc
 *     closes and keeps focus; Tab inside a card never leaves the document; a polite live region speaks the card;
 *   - cards use the formula's own limits and pieces ("add the next part once for every x from 0 to 2^n − 1");
 *   - 709's cards follow the reader's track; 448 has one voice;
 *   - the card's link goes where the notation is taught, with the return bar;
 *   - print: no cards and no underline, and "Notation in this chapter" is printed;
 *   - 0 console errors and 0 CSP violations (the CSP <meta> exists only in the built app: preview project).
 *   npx vite build && PW_PREVIEW_PORT=5246 npx playwright test --project=preview e2e/notation.spec.ts
 */
import { expect, test, type Locator, type Page } from '@playwright/test'

declare global {
  interface Window {
    __csp?: string[]
  }
}

// Where a mark is explained: in the reading column, not inside a control, a popover or a stage label (see UNEXPLAINED in
// components/NotationRuntime.tsx), so a test never aims at a mark that is meant to do nothing
const UNEXPLAINED = 'button, a, summary, label, [role="button"], .gloss-pop, .stage-label, .stage-passport'
const MARK = `.lecture-body .katex-html [data-notation]:not(:is(${UNEXPLAINED}) *)`
const CARD = '.notation-card'
const STORAGE = 'spinlab.notation.v1'

/**
 * Errors the test cares about: page errors, and console errors, except in the dev project two that are not about notation:
 * the dev server refusing fonts that live outside a worktree, and React's development-only "unmount a root while rendering"
 * warning from the stage canvas (it appears with notation off too, at any phone width).
 */
function watch(page: Page, project: string) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    if (project === 'dev' && /Failed to load resource|synchronously unmount a root/.test(m.text())) return
    errors.push(m.text())
  })
  return errors
}

async function open(page: Page, route: string, project = 'preview') {
  const errors = watch(page, project)
  await page.addInitScript(() => {
    window.__csp = []
    document.addEventListener('securitypolicyviolation', (e) => window.__csp!.push(`${e.violatedDirective} ← ${e.blockedURI || 'inline'}`))
  })
  await page.goto(route)
  await expect(page.locator(MARK).first()).toBeAttached({ timeout: 30_000 })
  return errors
}

/** A point on the page that is neither inside the card nor on anything that reacts to a press: for "a tap elsewhere". */
async function emptySpot(page: Page): Promise<{ x: number; y: number }> {
  const spot = await page.evaluate(() => {
    const card = document.querySelector('.notation-card')?.getBoundingClientRect()
    for (let y = 70; y < innerHeight - 10; y += 25)
      for (let x = 6; x < innerWidth - 6; x += 20) {
        if (card && x >= card.left - 4 && x <= card.right + 4 && y >= card.top - 4 && y <= card.bottom + 4) continue
        const el = document.elementFromPoint(x, y)
        if (el && !el.closest('a, button, input, summary, label, [data-notation], [tabindex], .katex, .notation-card, .topbar')) return { x, y }
      }
    return null
  })
  expect(spot, 'somewhere to tap that does nothing').not.toBeNull()
  return spot!
}

const center = async (l: Locator) => {
  await l.scrollIntoViewIfNeeded()
  const b = (await l.boundingBox())!
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}
/** A mark of this notation that is on the page and visible (in prose, not behind the stage). */
const markOf = (page: Page, id: string, extra = '') => page.locator(`${MARK}[data-notation="${id}"]${extra}`).filter({ visible: true }).first()

// The reading groups of ui/notationFocus.ts: one Tab stop each
const GROUPS = '.story-beat, .static-beat, .review-card, .challenge, .stage, .unit-head, .lecture-head'

/** Press Tab (a real key) until the focus is on a formula that has notation marks, and return it. */
async function tabToFormula(page: Page, max = 250): Promise<Locator> {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    const on = await page.evaluate(() => {
      const a = document.activeElement
      if (!a || !a.classList.contains('katex') || !a.querySelector('[data-notation]')) return false
      document.querySelectorAll('[data-kb-host]').forEach((e) => e.removeAttribute('data-kb-host'))
      a.setAttribute('data-kb-host', '') // a stable handle: `:focus` moves on when the focus does
      return true
    })
    if (on) return page.locator('[data-kb-host]')
  }
  throw new Error(`Tab did not reach a formula with notation in ${max} presses`)
}
/** How many formulas with marks the reading group of a formula holds. */
const formulasInGroup = (host: Locator) =>
  host.evaluate((el, sel) => [...(el.closest(sel) ?? el.parentElement)!.querySelectorAll('.katex')].filter((k) => k.querySelector('[data-notation]') && k.getClientRects().length > 0).length, GROUPS)
/** The formulas with marks that are on the page, the reading groups they sit in, and the Tab stops among them. */
const stopCount = (page: Page) =>
  page.evaluate((sel) => {
    const hosts = [...document.querySelectorAll<HTMLElement>('.katex')].filter(
      (k) => k.querySelector('[data-notation]') && !k.closest('.notation-card, .gloss-pop, .stage-label, .stage-passport, button, a, summary, label, [role="button"]') && k.getClientRects().length > 0,
    )
    const groups = new Map<Element, HTMLElement[]>()
    for (const h of hosts) {
      const g = h.closest(sel) ?? h.parentElement!
      groups.set(g, [...(groups.get(g) ?? []), h])
    }
    // a formula that also holds term links is a Tab stop of the glossary's own (ui/Rich.tsx): not counted here
    const stop = (h: HTMLElement) => h.tabIndex === 0 && !h.hasAttribute('data-term')
    const per = [...groups.values()].map((hs) => ({ n: hs.filter(stop).length, terms: hs.filter((h) => h.hasAttribute('data-term')).length }))
    return {
      formulas: hosts.length,
      groups: groups.size,
      stops: hosts.filter(stop).length,
      maxPerGroup: Math.max(0, ...per.map((p) => p.n)),
      uncovered: per.filter((p) => p.n === 0 && p.terms === 0).length,
    }
  }, GROUPS)

test.describe('on a desktop', () => {
  test('marks are on by default, with a dotted underline, and the topbar toggle says so', async ({ page }, info) => {
    const errors = await open(page, '#/lecture/L2', info.project.name)
    expect(await page.locator(MARK).count()).toBeGreaterThan(20)
    await expect(page.getByRole('button', { name: 'Explain notation' })).toHaveAttribute('aria-pressed', 'true')
    const style = await markOf(page, 'ket').evaluate((el) => getComputedStyle(el).borderBottomStyle)
    expect(style).toBe('dotted')
    expect(errors).toEqual([])
  })

  test('the underline of a mark around tall content sits under the whole of it: a matrix, a Σ with limits, a fraction (review #24)', async ({ page }, info) => {
    // KaTeX offsets stacked parts, so a bare inline mark's box stays one font high and its border ran across the matrix or the limit
    const bottoms = (m: Locator) =>
      m.evaluate((el) => {
        const glyphs = [...el.querySelectorAll('*')].filter((x) => [...x.childNodes].some((n) => n.nodeType === 3 && n.textContent!.replace(/​/g, '').trim()))
        return { box: el.getBoundingClientRect().bottom, lowest: Math.max(...glyphs.map((x) => x.getBoundingClientRect().bottom)), display: getComputedStyle(el).display }
      })
    await open(page, '#/lecture/L4', info.project.name)
    const matrix = markOf(page, 'matrix', ':has(.mtable)')
    await matrix.scrollIntoViewIfNeeded()
    const m = await bottoms(matrix)
    expect(m.display).toBe('inline-block')
    expect(m.box + 3, 'the matrix mark ends at its lowest row').toBeGreaterThanOrEqual(m.lowest)
    await page.goto('#/709/ch/Q16')
    const sum = markOf(page, 'sum', ':has(.op-limits)')
    await expect(sum).toBeAttached({ timeout: 30_000 })
    await sum.scrollIntoViewIfNeeded()
    const s = await bottoms(sum)
    expect(s.display).toBe('inline-block')
    expect(s.box + 3, 'the Σ mark ends below its lower limit').toBeGreaterThanOrEqual(s.lowest)
    // a plain mark stays an inline span
    expect((await bottoms(markOf(page, 'ket', ':not(:has(.mtable, .op-limits, .mfrac))'))).display).toBe('inline')
  })

  test('hover opens the card after a short delay and moving away closes it', async ({ page }, info) => {
    const errors = await open(page, '#/lecture/L2', info.project.name)
    const mark = markOf(page, 'braket')
    const at = await center(mark)
    await page.mouse.move(at.x, at.y)
    await page.waitForTimeout(100)
    expect(await page.locator(CARD).count(), 'not yet, at 100 ms').toBe(0)
    const card = page.locator(CARD)
    await expect(card).toBeVisible({ timeout: 5000 })
    await expect(card).toContainText('Bracket (overlap, inner product)')
    await expect(card).toContainText('The overlap of')
    await expect(card).toContainText('Example')
    await expect(card).toContainText('Read it as')
    // the mark whose card is open is highlighted
    await expect(mark).toHaveAttribute('data-nopen', '')
    await page.mouse.move(2, 2)
    await expect(card).toBeHidden({ timeout: 3000 })
    await expect(mark).not.toHaveAttribute('data-nopen', '')
    expect(errors).toEqual([])
  })

  test('the card can be entered with the pointer without closing', async ({ page }) => {
    await open(page, '#/lecture/L2')
    const at = await center(markOf(page, 'ket'))
    await page.mouse.move(at.x, at.y)
    const card = page.locator(CARD)
    await expect(card).toBeVisible({ timeout: 5000 })
    const box = (await card.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 })
    await page.waitForTimeout(500)
    await expect(card).toBeVisible()
  })

  test('click pins the card; Esc, a second click, or a press elsewhere closes it', async ({ page }) => {
    await open(page, '#/lecture/L2')
    const mark = markOf(page, 'ket')
    const at = await center(mark)
    const card = page.locator(CARD)
    await page.mouse.click(at.x, at.y)
    await expect(card).toBeVisible({ timeout: 5000 })
    await expect(card.locator('.nc-close')).toBeVisible() // a pinned card has a close button
    await page.mouse.move(2, 2)
    await page.waitForTimeout(700)
    await expect(card, 'pinned: stays after the pointer leaves').toBeVisible()
    await page.keyboard.press('Escape')
    await expect(card).toBeHidden()
    // a second click on the same mark toggles
    await page.mouse.click(at.x, at.y)
    await expect(card).toBeVisible()
    await page.mouse.click(at.x, at.y)
    await expect(card).toBeHidden()
    // a press elsewhere
    await page.mouse.click(at.x, at.y)
    await expect(card).toBeVisible()
    await page.locator('.lecture-head h1').click()
    await expect(card).toBeHidden()
    // and the close button (the page scrolled to the heading: find the mark again)
    const again = await center(mark)
    await page.mouse.click(again.x, again.y)
    await expect(card).toBeVisible()
    await card.locator('.nc-close').click()
    await expect(card).toBeHidden()
  })

  test('the card is a tooltip, or a labelled group when it holds a link', async ({ page }) => {
    await open(page, '#/lecture/L2')
    const at = await center(markOf(page, 'ket'))
    await page.mouse.click(at.x, at.y)
    const card = page.locator(CARD)
    await expect(card).toBeVisible({ timeout: 5000 })
    await expect(card).toHaveAttribute('role', 'group')
    await expect(card).toHaveAttribute('aria-label', 'Ket')
    await page.keyboard.press('Escape')
    // a notation no chapter teaches has no link and is a plain tooltip
    await page.mouse.click(...(Object.values(await center(markOf(page, 'plusminus'))) as [number, number]))
    await expect(card).toBeVisible()
    await expect(card).toHaveAttribute('role', 'tooltip')
    await expect(card.locator('a')).toHaveCount(0)
  })

  test('the toggle turns the marks and cards off, and the choice is remembered', async ({ page }, info) => {
    await open(page, '#/lecture/L2', info.project.name)
    const toggle = page.getByRole('button', { name: 'Explain notation' })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator(MARK)).toHaveCount(0)
    expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE)).toBe('off')
    // no card where there used to be a mark
    const where = await center(page.locator('.rich .katex').filter({ visible: true }).first())
    await page.mouse.move(where.x, where.y)
    await page.waitForTimeout(500)
    expect(await page.locator(CARD).count()).toBe(0)
    // remembered across a reload
    await page.reload()
    await expect(page.locator('.katex').first()).toBeAttached({ timeout: 30_000 })
    await expect(page.getByRole('button', { name: 'Explain notation' })).toHaveAttribute('aria-pressed', 'false')
    await page.waitForTimeout(500)
    await expect(page.locator(MARK)).toHaveCount(0)
    // and back on
    await page.getByRole('button', { name: 'Explain notation' }).click()
    await expect(page.locator(MARK).first()).toBeAttached()
    expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE)).toBeNull()
  })

  test('turning the toggle off closes an open card', async ({ page }) => {
    await open(page, '#/lecture/L2')
    const at = await center(markOf(page, 'ket'))
    await page.mouse.click(at.x, at.y)
    await expect(page.locator(CARD)).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Explain notation' }).click()
    await expect(page.locator(CARD)).toBeHidden()
  })

  test('blocked storage: the toggle still works for the visit', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } })
    })
    await open(page, '#/lecture/L2')
    await page.getByRole('button', { name: 'Explain notation' }).click()
    await expect(page.locator(MARK)).toHaveCount(0)
    await page.getByRole('button', { name: 'Explain notation' }).click()
    await expect(page.locator(MARK).first()).toBeAttached()
  })
})

test.describe('keyboard and screen readers (one Tab stop per reading group; Enter opens; focus never leaves the document)', () => {
  test('Tab lands on a formula and shows an outline and a hint, never a card; Enter opens and pins; Esc closes and keeps focus', async ({ page }) => {
    await open(page, '#/lecture/L2')
    const host = await tabToFormula(page)
    const card = page.locator(CARD)
    // focus alone shows no card: a hint under the formula says what to press, and describes the formula for a screen reader
    await expect(card).toHaveCount(0)
    const hint = page.locator('.notation-hint')
    await expect(hint).toBeVisible()
    await expect(hint).toContainText('Enter explains the notation')
    const hintId = (await hint.getAttribute('id'))!
    await expect(host).toHaveAttribute('aria-describedby', hintId)
    expect(await host.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid')
    await page.keyboard.press('Enter')
    await expect(card).toBeVisible()
    await expect(card.locator('.nc-close')).toBeVisible() // pinned
    await expect(hint).toHaveCount(0)
    await expect(host).toHaveAttribute('aria-describedby', (await card.getAttribute('id'))!)
    await page.keyboard.press('Escape')
    await expect(card).toBeHidden()
    await expect(page.locator(':focus')).toHaveClass(/katex/) // focus is back on the formula
    await expect(host).toHaveAttribute('aria-describedby', hintId) // the card is gone: the formula is described by the hint again
    // Space opens too, and a second Enter closes
    await page.keyboard.press('Space')
    await expect(card).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(card).toBeHidden()
  })

  test('Enter on a ket pins its card and moves focus into its link; Esc goes back to the formula', async ({ page }) => {
    await open(page, '#/lecture/L2')
    await tabToFormula(page) // a real key press first, so the focus that follows shows as a keyboard focus
    const host = page.locator('.lecture-body .katex').filter({ has: page.locator('[data-notation="ket"]') }).filter({ visible: true }).first()
    await host.scrollIntoViewIfNeeded()
    await host.focus()
    const card = page.locator(CARD)
    await expect(card).toHaveCount(0)
    await page.keyboard.press('Enter')
    await expect(card.locator('a[href]')).toBeFocused({ timeout: 3000 })
    await page.keyboard.press('Escape')
    await expect(card).toBeHidden()
    await expect(page.locator(':focus')).toHaveClass(/katex/)
  })

  test('a screen reader hears the card: one polite live region says its name, how to read it and what it means', async ({ page }) => {
    await open(page, '#/lecture/L2')
    const live = page.locator('.notation-live')
    await expect(live).toHaveCount(1)
    // A bare polite region, never a second role="status" (the page's own status, e.g. the Arcade's "Solved.", stays unique).
    await expect(live).not.toHaveAttribute('role', /./)
    await expect(live).toHaveAttribute('aria-live', 'polite')
    await tabToFormula(page)
    await page.keyboard.press('Enter')
    const card = page.locator(CARD)
    await expect(card).toBeVisible()
    const name = (await card.locator('.nc-name').innerText()).trim()
    await expect(live).toContainText(name, { timeout: 5000 })
    await expect(live).toContainText('Read it as')
    // the plain meaning is in it too, and the maths of the card is not read twice (no raw TeX)
    const meaning = ((await card.locator('.nc-block').first().innerText()) ?? '').replace(/\s+/g, ' ').slice(0, 24)
    expect((await live.innerText()).replace(/\s+/g, ' ')).toContain(meaning.split(' ').slice(0, 2).join(' '))
    expect(await live.innerText()).not.toContain('\\')
  })

  test('with a card open, the arrows move it to the next mark and the live region says the new name', async ({ page }) => {
    await open(page, '#/lecture/L2')
    // a formula with at least two marks: press its first mark with the mouse, then use the keyboard
    const first = page.locator('.lecture-body .katex').filter({ has: page.locator('[data-notation] ~ [data-notation], [data-notation] [data-notation]') }).filter({ visible: true }).first()
    const marks = first.locator('.katex-html [data-notation]')
    expect(await marks.count()).toBeGreaterThan(1)
    const at = await center(marks.first())
    await page.mouse.click(at.x, at.y)
    const card = page.locator(CARD)
    await expect(card).toBeVisible({ timeout: 5000 })
    // (one mark on the page has its card open: `data-nopen`)
    const opened = () => page.locator('.katex-html [data-nopen]').evaluate((e) => (e as HTMLElement).dataset.notation + '/' + [...(e.closest('.katex')?.querySelectorAll('.katex-html [data-notation]') ?? [])].indexOf(e))
    const before = await opened()
    // the mouse left the formula focused; a key press moves the card along the group
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(150)
      if ((await opened()) !== before) break
    }
    expect(await opened(), 'the card moved to another mark').not.toBe(before)
    const name = (await card.locator('.nc-name').innerText()).trim()
    await expect(page.locator('.notation-live')).toContainText(name, { timeout: 5000 })
  })

  test('the arrows walk every mark of the reading group across its formulas, and carry the Tab stop with them', async ({ page }) => {
    await open(page, '#/lecture/L2')
    let host = await tabToFormula(page)
    // a group with several formulas
    for (let i = 0; i < 80 && (await formulasInGroup(host)) < 2; i++) host = await tabToFormula(page)
    expect(await formulasInGroup(host), 'a group with two formulas').toBeGreaterThanOrEqual(2)
    const stopCount = () => host.evaluate((el, sel) => [...(el.closest(sel) ?? el.parentElement)!.querySelectorAll<HTMLElement>('.katex')].filter((k) => k.querySelector('[data-notation]') && k.tabIndex === 0 && !k.hasAttribute('data-term')).length, GROUPS)
    expect(await stopCount()).toBe(1)
    const start = await page.evaluate(() => [...document.querySelectorAll('.katex')].indexOf(document.activeElement as Element))
    let moved = false
    for (let i = 0; i < 40 && !moved; i++) {
      await page.keyboard.press('ArrowRight')
      moved = await page.evaluate((s) => [...document.querySelectorAll('.katex')].indexOf(document.activeElement as Element) !== s, start)
    }
    expect(moved, 'the arrows reached the next formula of the group').toBe(true)
    // the stop moved with the focus: exactly one formula of the group has tabindex 0 and it is the focused one
    const now = page.locator(':focus')
    await expect(now).toHaveClass(/katex/)
    await expect(now).toHaveAttribute('tabindex', '0')
    await expect(host).toHaveAttribute('tabindex', '-1')
    expect(await now.evaluate((el, sel) => [...(el.closest(sel) ?? el.parentElement)!.querySelectorAll<HTMLElement>('.katex')].filter((k) => k.querySelector('[data-notation]') && k.tabIndex === 0 && !k.hasAttribute('data-term')).length, GROUPS)).toBe(1)
    // Home and End jump to the first and last mark of the group
    await page.keyboard.press('End')
    const lastIdx = await page.evaluate(() => [...document.querySelectorAll('.katex')].indexOf(document.activeElement as Element))
    await page.keyboard.press('Home')
    const firstIdx = await page.evaluate(() => [...document.querySelectorAll('.katex')].indexOf(document.activeElement as Element))
    expect(lastIdx).toBeGreaterThanOrEqual(firstIdx)
    expect(firstIdx).toBe(start)
  })

  test('Tab leaves the group: the next stop is another group, not the next formula', async ({ page }) => {
    await open(page, '#/lecture/L2')
    let host = await tabToFormula(page)
    for (let i = 0; i < 80 && (await formulasInGroup(host)) < 2; i++) host = await tabToFormula(page)
    const group = await host.evaluate((el, sel) => (el.closest(sel) ?? el.parentElement)!.tagName + (el.closest(sel)?.className ?? ''), GROUPS)
    await page.keyboard.press('Tab')
    const next = await page.evaluate((sel) => {
      const a = document.activeElement as HTMLElement | null
      return a ? (a.closest(sel)?.tagName ?? '') + (a.closest(sel)?.className ?? '') : ''
    }, GROUPS)
    const same = await page.evaluate(([sel, g]) => {
      const a = document.activeElement as HTMLElement | null
      return !!a && a.classList.contains('katex') && (a.closest(sel)?.tagName ?? '') + (a.closest(sel)?.className ?? '') === g
    }, [GROUPS, group] as const)
    expect(same, `Tab went on to ${next}, which is the same group as ${group}`).toBe(false)
  })

  test('a chapter has one Tab stop per reading group, not one per formula (L4)', async ({ page }, info) => {
    await open(page, '#/lecture/L4', info.project.name)
    await expect.poll(async () => (await stopCount(page)).stops, { timeout: 20_000 }).toBeGreaterThan(10)
    await page.waitForTimeout(500)
    const n = await stopCount(page)
    info.annotations.push({ type: 'L4 Tab stops', description: `${n.stops} Tab stops for ${n.formulas} formulas with marks in ${n.groups} reading groups` })
    expect(n.formulas, 'many formulas with notation').toBeGreaterThan(150)
    expect(n.maxPerGroup, 'never two stops in one group').toBe(1)
    expect(n.uncovered, 'every group with a formula has its one stop').toBe(0)
    expect(n.stops).toBeLessThanOrEqual(n.groups)
    expect(n.stops, `${n.stops} stops (it was one per formula, 282 in L4)`).toBeLessThanOrEqual(110)
  })

  test('Tab and Shift+Tab inside a card go around it or back to the formula, never out of the document; × returns focus', async ({ page }) => {
    await open(page, '#/lecture/L2')
    await tabToFormula(page)
    const host = page.locator('.lecture-body .katex').filter({ has: page.locator('[data-notation="ket"]') }).filter({ visible: true }).first()
    await host.scrollIntoViewIfNeeded()
    await host.focus()
    const card = page.locator(CARD)
    const inDocument = () => page.evaluate(() => !!document.activeElement && document.activeElement !== document.body && document.hasFocus())
    // Enter: focus goes to the link, the last control. Tab from it returns to the formula and closes the card
    await page.keyboard.press('Enter')
    await expect(card.locator('a[href]')).toBeFocused({ timeout: 3000 })
    await page.keyboard.press('Tab')
    await expect(card).toBeHidden()
    await expect(page.locator(':focus')).toHaveClass(/katex/)
    expect(await inDocument()).toBe(true)
    // Shift+Tab from the link reaches the × button; once more goes back to the formula
    await page.keyboard.press('Enter')
    await expect(card.locator('a[href]')).toBeFocused({ timeout: 3000 })
    await page.keyboard.press('Shift+Tab')
    await expect(card.locator('.nc-close')).toBeFocused()
    expect(await inDocument()).toBe(true)
    await page.keyboard.press('Shift+Tab')
    await expect(card).toBeHidden()
    await expect(page.locator(':focus')).toHaveClass(/katex/)
    // × (Enter on it) closes the card and puts focus back on the formula
    await page.keyboard.press('Enter')
    await expect(card.locator('a[href]')).toBeFocused({ timeout: 3000 })
    await page.keyboard.press('Shift+Tab')
    await expect(card.locator('.nc-close')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(card).toBeHidden()
    await expect(page.locator(':focus')).toHaveClass(/katex/)
    expect(await inDocument()).toBe(true)
    // many more Tab presses from a card never drop focus to the page itself
    await page.keyboard.press('Enter')
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab')
      expect(await inDocument(), `press ${i}`).toBe(true)
    }
  })

  test('Esc is kept from other widgets only while a card is open', async ({ page }) => {
    await open(page, '#/lecture/L2')
    await page.evaluate(() => {
      ;(window as unknown as { __esc: number }).__esc = 0
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') (window as unknown as { __esc: number }).__esc++
      })
    })
    const esc = () => page.evaluate(() => (window as unknown as { __esc: number }).__esc)
    await tabToFormula(page)
    await page.keyboard.press('Escape') // no card: the key goes on to whoever listens
    expect(await esc()).toBe(1)
    await page.keyboard.press('Enter')
    await expect(page.locator(CARD)).toBeVisible()
    await page.keyboard.press('Escape') // a card is open: this press only closes it
    await expect(page.locator(CARD)).toBeHidden()
    expect(await esc()).toBe(1)
  })
})

test.describe('context: a card says what THIS formula says', () => {
  test('a sum over x from 0 to 2^n − 1 says exactly that', async ({ page }) => {
    await open(page, '#/709/ch/Q4')
    const mark = markOf(page, 'sum', '[data-lo][data-hi]')
    const at = await center(mark)
    await page.mouse.click(at.x, at.y)
    const here = page.locator(`${CARD} .nc-here`)
    await expect(here).toBeVisible({ timeout: 8000 })
    const text = (await here.innerText()).replace(/\s+/g, ' ')
    expect(text).toMatch(/Add the next part once for every/i)
    expect(text).toContain('from')
    expect(text).toContain('to')
    // the limits and the part are TeX in the card, taken from the formula
    expect(await here.locator('.katex').count()).toBeGreaterThanOrEqual(3)
  })

  test('a bracket says what it is the overlap of', async ({ page }) => {
    await open(page, '#/lecture/L2')
    const at = await center(markOf(page, 'braket', '[data-a][data-b]'))
    await page.mouse.click(at.x, at.y)
    await expect(page.locator(`${CARD} .nc-here`)).toContainText('The overlap of', { timeout: 8000 })
  })

  test('a ket with a spin label names the state', async ({ page }) => {
    await open(page, '#/lecture/L2')
    const marks = page.locator(`${MARK}[data-notation="ket"]`)
    const n = await marks.count()
    let found = false
    for (let i = 0; i < n && !found; i++) {
      const a = await marks.nth(i).getAttribute('data-a')
      if (a === '.7b.2bz.7d') {
        const at = await center(marks.nth(i))
        await page.mouse.click(at.x, at.y)
        await expect(page.locator(`${CARD} .nc-here`)).toContainText('spin up along z', { timeout: 8000 })
        found = true
      }
    }
    expect(found, 'a |+z⟩ ket on the page').toBe(true)
  })
})

test.describe('two tracks', () => {
  test('709 cards follow the reader’s track; 448 reads one voice', async ({ page }) => {
    await open(page, '#/709/ch/F2')
    const trackButton = (name: string) => page.getByRole('group', { name: 'Which track' }).getByRole('button', { name })
    const meaning = async () => {
      const at = await center(markOf(page, 'ket'))
      await page.mouse.click(at.x, at.y)
      await expect(page.locator(CARD)).toBeVisible({ timeout: 8000 })
      const t = (await page.locator(`${CARD} .nc-block`).first().innerText()).replace(/\s+/g, ' ')
      await page.keyboard.press('Escape')
      return t
    }
    await trackButton('Ground-up').click()
    await expect(markOf(page, 'ket')).toBeAttached()
    const ground = await meaning()
    await trackButton('Formal').click()
    await expect(markOf(page, 'ket')).toBeAttached()
    await expect.poll(meaning).not.toBe(ground)
    expect(ground).toMatch(/column of numbers/)
    // 448 has no track toggle
    await page.goto('#/lecture/L2')
    await expect(page.getByRole('group', { name: 'Which track' })).toHaveCount(0)
  })
})

test.describe('the link to where it is taught', () => {
  test('goes to the unit, with a way back that returns to the same place', async ({ page }) => {
    await open(page, '#/lecture/L2')
    const at = await center(markOf(page, 'ket'))
    await page.mouse.click(at.x, at.y)
    const link = page.locator(`${CARD} a[data-bridge]`)
    await expect(link).toBeVisible({ timeout: 8000 })
    await expect(link).toContainText('Learn it in')
    await link.click()
    await expect(page).toHaveURL(/ret=/)
    await expect(page.locator('nav.return-bar')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator(CARD)).toHaveCount(0) // the card belongs to the page it was opened on
    await page.locator('nav.return-bar .rb-go').click()
    await expect(page).toHaveURL(/lecture\/L2/)
    await expect(page.locator(MARK).first()).toBeAttached({ timeout: 15_000 })
  })

  test('a 448 reader is sent into Physics 709 for notation only 709 teaches', async ({ page }) => {
    await open(page, '#/lecture/L4')
    const at = await center(markOf(page, 'sum'))
    await page.mouse.click(at.x, at.y)
    const link = page.locator(`${CARD} a[data-bridge]`)
    await expect(link).toBeVisible({ timeout: 8000 })
    await expect(link).toHaveAttribute('data-to', /sl448|qc709/)
    await link.click()
    await expect(page).toHaveURL(/ret=/)
  })
})

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true })

  test('a tap opens a card that stays inside the screen, and a tap elsewhere closes it', async ({ page }, info) => {
    const errors = await open(page, '#/lecture/L2', info.project.name)
    const inside = async () => {
      const b = (await page.locator(CARD).boundingBox())!
      expect(b.x, 'left edge').toBeGreaterThanOrEqual(0)
      expect(b.y, 'top edge').toBeGreaterThanOrEqual(0)
      expect(b.x + b.width, 'right edge').toBeLessThanOrEqual(375.5)
      expect(b.y + b.height, 'bottom edge').toBeLessThanOrEqual(812.5)
    }
    const card = page.locator(CARD)
    // the mark furthest to the right in the viewport, the first one, and one near the bottom edge
    const marks = page.locator(`${MARK}[data-notation="ket"], ${MARK}[data-notation="braket"], ${MARK}[data-notation="sum"]`).filter({ visible: true })
    expect(await marks.count()).toBeGreaterThan(3)
    for (const pick of [0, 1, 2]) {
      const mark = marks.nth(pick)
      await mark.scrollIntoViewIfNeeded()
      await mark.tap()
      await expect(card).toBeVisible({ timeout: 8000 })
      await inside()
      const away = await emptySpot(page)
      await page.touchscreen.tap(away.x, away.y)
      await expect(card).toBeHidden()
    }
    // a mark flush against the right edge of the screen, and one low on the screen
    const edge = await page.evaluate(() => {
      const rects = [...document.querySelectorAll<HTMLElement>('.lecture-body .katex-html [data-notation]')]
        .filter((el) => !el.closest('button, a, summary, label, [role="button"], .gloss-pop, .stage-label, .stage-passport'))
        .map((el, i) => ({ i, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.top > 100 && r.bottom < innerHeight - 100)
        .sort((a, b) => b.r.right - a.r.right)
      return rects.length ? { i: rects[0].i, right: rects[0].r.right } : null
    })
    if (edge) {
      const mark = page.locator(MARK).nth(edge.i)
      await mark.scrollIntoViewIfNeeded()
      await mark.tap()
      await expect(card).toBeVisible({ timeout: 8000 })
      await inside()
      await expect(card.locator('.nc-close')).toBeVisible() // a pinned card has a close button for a touch screen
      await card.locator('.nc-close').tap()
      await expect(card).toBeHidden()
    }
    expect(errors).toEqual([])
  })

  test('a tall card on a phone scrolls inside the screen instead of running off it', async ({ page }) => {
    await open(page, '#/709/ch/Q6')
    const mark = markOf(page, 'matrix')
    await mark.scrollIntoViewIfNeeded()
    await mark.tap()
    const card = page.locator(CARD)
    await expect(card).toBeVisible({ timeout: 8000 })
    const b = (await card.boundingBox())!
    expect(b.y).toBeGreaterThanOrEqual(0)
    expect(b.y + b.height).toBeLessThanOrEqual(812.5)
    expect(b.x + b.width).toBeLessThanOrEqual(375.5)
  })
})

test.describe('print', () => {
  test('no cards and no underline; "Notation in this chapter" is printed, open', async ({ page }) => {
    await open(page, '#/lecture/L2')
    await expect(page.locator('.notation-key')).toBeAttached({ timeout: 20_000 })
    // on screen, with cards on, the list starts folded
    await expect(page.locator('.notation-key ul')).toBeHidden()
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('.notation-key')).toBeVisible()
    await expect(page.locator('.notation-key h2')).toHaveText('Notation in this chapter')
    const items = page.locator('.notation-key li')
    expect(await items.count()).toBeGreaterThan(5)
    await expect(items.first()).toBeVisible()
    await expect(page.locator('.notation-key')).toContainText('Ket')
    await expect(page.locator('.notation-key')).toContainText('Bracket (overlap, inner product)')
    await expect(page.locator('.notation-key .nk-toggle')).toBeHidden()
    expect(await markOf(page, 'ket').evaluate((el) => getComputedStyle(el).borderBottomWidth)).toBe('0px')
    expect(await page.locator(CARD).count()).toBe(0)
    expect(await page.locator('.notation-toggle').evaluate((el) => getComputedStyle(el).display === 'none' || el.closest('.topbar') !== null && getComputedStyle(el.closest('.topbar')!).display === 'none')).toBe(true)
    // the print PDF still builds
    const pdf = await page.pdf({ format: 'A4', printBackground: true })
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
    await page.emulateMedia({ media: 'screen' })
  })

  test('a 709 key speaks the reader’s track and also prints', async ({ page }) => {
    await open(page, '#/709/ch/F2')
    await expect(page.locator('.notation-key')).toBeAttached({ timeout: 20_000 })
    await page.getByRole('group', { name: 'Which track' }).getByRole('button', { name: 'Formal' }).click()
    await expect(page.locator('.notation-key li[data-notation-key="ket"] .nk-meaning')).toContainText('vector in the space of states')
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('.notation-key li[data-notation-key="ket"]')).toBeVisible()
    await page.emulateMedia({ media: 'screen' })
  })

  test('the reader can fold and unfold the key; it starts folded while cards are on', async ({ page }) => {
    await open(page, '#/lecture/L2')
    const list = page.locator('.notation-key ul')
    await expect(page.locator('.notation-key')).toBeAttached({ timeout: 20_000 })
    await expect(list).toBeHidden()
    await expect(page.locator('.notation-key .nk-toggle')).toHaveAttribute('aria-expanded', 'false')
    await page.locator('.notation-key .nk-toggle').click()
    await expect(list).toBeVisible()
    await expect(page.locator('.notation-key .nk-toggle')).toHaveAttribute('aria-expanded', 'true')
    await page.locator('.notation-key .nk-toggle').click()
    await expect(list).toBeHidden()
  })

  test('with cards off, the key starts open: it is the only explanation then', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('spinlab.notation.v1', 'off'))
    await page.goto('#/lecture/L2')
    await expect(page.locator('.notation-key')).toBeAttached({ timeout: 30_000 })
    await expect(page.locator('.notation-key ul')).toBeVisible()
    await expect(page.locator('.notation-key li').first()).toBeVisible()
    expect(await page.locator(MARK).count()).toBe(0)
  })

  test('in Read mode the key starts open too', async ({ page }) => {
    await open(page, '#/lecture/L2')
    await page.getByRole('button', { name: 'Read', exact: true }).first().click()
    await expect(page.locator('.static-story').first()).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.notation-key')).toBeAttached({ timeout: 20_000 })
    await expect(page.locator('.notation-key ul')).toBeVisible()
    await page.getByRole('button', { name: 'Story', exact: true }).first().click()
  })
})

test.describe('safety', () => {
  test('a session with hovers, pins, a toggle and a link breaks no CSP and logs no errors', async ({ page }, info) => {
    test.skip(info.project.name !== 'preview', 'the CSP <meta> exists only in the built app (preview project)')
    const errors = await open(page, '#/lecture/L2', info.project.name)
    for (const id of ['ket', 'braket', 'sum', 'sandwich', 'dagger']) {
      const mark = markOf(page, id)
      if (!(await mark.count())) continue
      const at = await center(mark)
      await page.mouse.click(at.x, at.y)
      await expect(page.locator(CARD)).toBeVisible({ timeout: 8000 })
      await page.keyboard.press('Escape')
    }
    await page.getByRole('button', { name: 'Explain notation' }).click()
    await page.getByRole('button', { name: 'Explain notation' }).click()
    await page.goto('#/709/ch/Q4')
    await expect(page.locator(MARK).first()).toBeAttached({ timeout: 30_000 })
    expect(await page.evaluate(() => window.__csp)).toEqual([])
    expect(errors).toEqual([])
  })

  test('nothing in a mark is executable: only data attributes were added', async ({ page }) => {
    await open(page, '#/709/ch/Q4')
    const bad = await page.evaluate(() => {
      const out: string[] = []
      document.querySelectorAll('.katex-html [data-notation]').forEach((el) => {
        for (const a of el.attributes) if (!/^(class|data-(notation|lo|hi|of|a|m|b|nopen))$/.test(a.name)) out.push(`${el.tagName} ${a.name}`)
        if (el.tagName !== 'SPAN') out.push(el.tagName)
      })
      return out
    })
    expect(bad).toEqual([])
  })

  test('a glossary popover is still the glossary’s, and its maths is not marked', async ({ page }) => {
    await open(page, '#/lecture/L2')
    const gloss = page.locator('button.gloss').first()
    await gloss.scrollIntoViewIfNeeded()
    await gloss.hover()
    await expect(page.locator('.gloss-pop').first()).toBeVisible({ timeout: 5000 })
    expect(await page.locator('.gloss-pop [data-notation]').count()).toBe(0)
  })
})
