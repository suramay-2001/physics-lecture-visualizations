/**
 * Bridges with return (W-709-platform §C). A 709 chapter links into Spin Lab (448); the 448 page shows the return bar
 * (only 709 material on it); the bar survives a reload, a new tab and further navigation; Return (or Back) puts the
 * same beat under the centre line in the same track, with focus on it. Keyboard only works end to end.
 *
 * The chapter-side tests run on the DEV demo chapter Q0 (`#/709/ch/Q0`, never in a production build), so they are
 * `@dev-only`; the hostile-`ret` tests run in both projects.
 *
 * The other direction (W-448 #4: a Spin Lab lecture links into a 709 unit, "Go further in 709", and the return bar on the
 * 709 page leads back to the exact 448 beat) runs on the real Lecture 5 with a TEMPORARY DEV-only chip that
 * content/load.ts adds (content/__fixtures__/devBridge448.ts) until Lecture 8 lands a real one: `@dev-only`. Its return
 * half and its hostile values run in both projects, against the real 709 chapter Q1.
 *   PW_DEV_PORT=5178 npx playwright test e2e/bridge.spec.ts --project=dev
 * Screens for visual QA (a 448 page with the return bar, 1440 and 390) go to e2e/__screens__/709/ (git-ignored).
 */
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

const SCREENS = fileURLToPath(new URL('./__screens__/709/', import.meta.url))
const Q0 = '#/709/ch/Q0'
const bar = (page: Page) => page.getByRole('navigation', { name: 'Return to Physics 709' })
const bar448 = (page: Page) => page.getByRole('navigation', { name: 'Return to Physics 448' })

/** The beat article under the viewport centre line (live or static), or null. */
const beatAtCentre = (page: Page) =>
  page.evaluate(() => {
    const mid = innerHeight / 2
    for (const el of document.querySelectorAll<HTMLElement>('.story-beat[data-beat], .static-beat[data-beat]')) {
      const r = el.getBoundingClientRect()
      if (r.height && r.top <= mid && r.bottom >= mid) return el.dataset.beat ?? null
    }
    return null
  })

/** Put a beat under the centre line and wait until the page has taken it (the probe runs once per frame). */
async function standOn(page: Page, beat: string) {
  await page.evaluate((b) => document.querySelector(`[data-beat="${b}"]`)!.scrollIntoView({ block: 'center' }), beat)
  await expect.poll(() => beatAtCentre(page)).toBe(beat)
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
}

async function openQ0(page: Page, opts: { mode?: 'story' | 'read'; track?: 'ground' | 'formal' } = {}) {
  await page.goto(Q0)
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  if (opts.mode === 'read') await page.getByRole('button', { name: 'Read', exact: true }).click()
  const head = page.getByRole('group', { name: 'Which track' })
  if (opts.track === 'formal') await head.getByRole('button', { name: 'Formal', exact: true }).click()
  await expect(head.getByRole('button', { name: opts.track === 'formal' ? 'Formal' : 'Ground-up', exact: true })).toHaveAttribute('aria-pressed', 'true')
}

test.describe('@dev-only bridges from the demo chapter', () => {
  for (const mode of ['story', 'read'] as const)
    for (const track of ['ground', 'formal'] as const)
      test(`${mode} · ${track}: out to Spin Lab 2.3 and back to the same beat, through a reload`, async ({ page }) => {
        const errors = collectErrors(page)
        await openQ0(page, { mode, track })
        const beat = 'q0-demo-sphere:b3'
        await standOn(page, beat)
        const kind = mode === 'story' ? '.story-beat' : '.static-beat'
        await page.locator(`${kind}[data-beat="${beat}"] a.bridge[data-bridge="qc-demo-complex"]`).click()

        // on the 448 page: the unit, the bar, focus on the unit heading, a polite announcement
        await expect(page).toHaveURL(new RegExp(`#/lecture/L2\\?ret=qc709~Q0~q0-demo-sphere:b3~[0-9.]+~${track}#l2-complex$`))
        await expect(bar(page)).toBeVisible()
        await expect(bar(page).getByRole('link')).toHaveText('↓Return to 709 · Chapter Q0 · A state on the sphere, step 3')
        await expect(page.locator('#l2-complex-title')).toBeFocused()
        await expect(page.locator('[aria-live="polite"]', { hasText: 'Arrived at Numbers that turn' })).toHaveCount(1)
        expect(await page.evaluate(() => document.documentElement.dataset.course)).toBe('sl448')

        // a reload keeps the bar (the place is in the URL)
        await page.reload()
        await expect(page.locator('.lecture-head h1')).toBeVisible()
        await expect(bar(page)).toBeVisible()

        await bar(page).getByRole('link').click()
        await expect(page).toHaveURL(/#\/709\/ch\/Q0$/) // at / f leave the URL once the place is restored
        await expect.poll(() => beatAtCentre(page)).toBe(beat)
        await expect(page.locator(`${kind}[data-beat="${beat}"]`)).toBeFocused()
        await expect(page.getByRole('button', { name: track === 'formal' ? 'Formal' : 'Ground-up', exact: true })).toHaveAttribute('aria-pressed', 'true')
        await expect(bar(page)).toHaveCount(0)
        // KNOWN, pre-existing on main (reproduced on main's own build, reported as a follow-up task): leaving a 448 lecture
        // in Read mode tears down the Bloch widget's own <Canvas> mid-render ("synchronously unmount a root" on the dev
        // server, a removeChild NotFoundError in production). Nothing else may appear.
        const known = /Attempted to synchronously unmount a root while React was already rendering|Failed to execute 'removeChild' on 'Node'/
        await expectNoErrors(mode === 'read' ? errors.filter((e) => !known.test(e)) : errors)
      })

  test('Back from the 448 page returns to the same beat (the bridge wrote the place into the 709 entry)', async ({ page }) => {
    const errors = collectErrors(page)
    await openQ0(page)
    await standOn(page, 'q0-demo-sphere:b2')
    await page.locator('.story-beat[data-beat="q0-demo-sphere:b2"] a.bridge').click()
    await expect(page).toHaveURL(/#\/lecture\/L6\?ret=/)
    await page.goBack()
    await expect(page).toHaveURL(/#\/709\/ch\/Q0$/)
    await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b2')
    await expectNoErrors(errors)
  })

  test('a chain: the bar is carried to further Spin Lab pages, survives a reload there, and still returns to Q0', async ({ page }) => {
    const errors = collectErrors(page)
    await openQ0(page)
    await standOn(page, 'q0-demo-sphere:b2')
    await page.locator('.story-beat[data-beat="q0-demo-sphere:b2"] a.bridge[data-bridge="qc-demo-equator"]').click()
    // a beat target: that beat is put under the centre line
    await expect(page).toHaveURL(/#\/lecture\/L6\?ret=qc709~Q0~q0-demo-sphere:b2~/)
    await expect.poll(() => beatAtCentre(page)).toBe('l6-equator:b2')
    await expect(page.locator('#l6-equator-title')).toBeFocused()
    // on to another lecture through the topbar: the way back comes along
    await page.getByRole('button', { name: /^Lectures/ }).click()
    await page.getByRole('region', { name: 'Lectures' }).locator('.panel-units a[href^="#/lecture/L3"]').first().click()
    await expect(page).toHaveURL(/#\/lecture\/L3\?ret=qc709~Q0~q0-demo-sphere:b2~/)
    await expect(bar(page)).toBeVisible()
    await page.reload()
    await expect(bar(page)).toBeVisible()
    await bar(page).getByRole('link').click()
    await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b2')
    // back in the chapter: the detour is over, the next 448 visit carries nothing
    await page.goto('#/lecture/L1')
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    await expect(bar(page)).toHaveCount(0)
    await expectNoErrors(errors)
  })

  test('a new tab opens the bridge with its way back', async ({ page, context }) => {
    const errors = collectErrors(page)
    await openQ0(page)
    await standOn(page, 'q0-demo-sphere:b3')
    const link = page.locator('.story-beat[data-beat="q0-demo-sphere:b3"] a.bridge').first()
    await link.hover()
    const href = await link.getAttribute('href')
    expect(href).toMatch(/^#\/lecture\/L2\?ret=qc709~Q0~q0-demo-sphere:b3~[0-9.]+~ground#l2-complex$/)
    const tab = await context.newPage()
    await tab.goto(href!)
    await expect(bar(tab)).toBeVisible()
    await bar(tab).getByRole('link').click()
    await expect.poll(() => beatAtCentre(tab)).toBe('q0-demo-sphere:b3')
    await tab.close()
    await expectNoErrors(errors)
  })

  test('keyboard only: a gloss offers its bridge, Enter follows it, Tab reaches the bar, Enter returns', async ({ page }) => {
    const errors = collectErrors(page)
    await openQ0(page)
    await standOn(page, 'q0-demo-sphere:b3')
    const gloss = page.locator('.story-beat[data-beat="q0-demo-sphere:b3"] button.gloss[data-gloss="qc-demo-amplitude"]')
    await gloss.focus()
    await page.keyboard.press('Enter')
    const offer = page.getByRole('link', { name: /^Learn it in Spin Lab 2\.3/ })
    await expect(offer).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(gloss).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(offer).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#\/lecture\/L2\?ret=qc709~Q0~q0-demo-sphere:b3~/)
    await expect(page.locator('#l2-complex-title')).toBeFocused()
    // the way back is one Shift+Tab away (a link that shows while focused), and it is the bar's way back
    await page.keyboard.press('Shift+Tab')
    const skip = page.locator('#l2-complex a.rb-skip')
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    await expect(skip).toHaveText(await bar(page).getByRole('link').innerText().then((t) => t.replace(/^↓\s*/, '')))
    // a reload keeps the bar but does not move focus again; from the top of the page, Tab reaches the bar after the
    // top bar
    const fresh = page.url().replace(/#l2-complex$/, '')
    await page.goto('about:blank')
    await page.goto(fresh)
    await expect(bar(page)).toBeVisible()
    const back = bar(page).getByRole('link')
    for (let i = 0; i < 20 && !(await back.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab')
    await expect(back).toBeFocused()
    await page.keyboard.press('Enter')
    await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b3')
    await expect(page.locator('.story-beat[data-beat="q0-demo-sphere:b3"]')).toBeFocused()
    await expectNoErrors(errors)
  })

  test('keyboard only: the skip link returns too, and the track toggle and the derivation work from the keyboard', async ({ page }) => {
    const errors = collectErrors(page)
    await openQ0(page)
    await standOn(page, 'q0-demo-sphere:b3')
    await page.locator('.story-beat[data-beat="q0-demo-sphere:b3"] a.bridge').first().focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#l2-complex-title')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#\/709\/ch\/Q0$/)
    await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b3')
    // the rail's track switch (sticky, beside the reading place): Space on "Formal" keeps the place
    await page.getByRole('button', { name: 'Formal track here' }).focus()
    await page.keyboard.press('Space')
    await expect(page.locator('.lecture')).toHaveAttribute('data-track', 'formal')
    await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b3')
    // the derivation: Step through, arrow keys, Show all
    const d = page.locator('.story-beat[data-beat="q0-demo-sphere:b3"] .deriv')
    await d.getByRole('button', { name: 'Step through' }).focus()
    await page.keyboard.press('Enter')
    await expect(d.locator('li:visible')).toHaveCount(1)
    await expect(d.locator('[aria-live="polite"]')).toHaveText('Line 1 of 2')
    await page.keyboard.press('ArrowRight')
    await expect(d.locator('li:visible')).toHaveCount(2)
    await expect(d.locator('li[aria-current="step"]')).toContainText('Evaluate the modulus squared')
    await page.keyboard.press('ArrowRight') // past the end: stays on the last line
    await expect(d.locator('[aria-live="polite"]')).toHaveText('Line 2 of 2')
    await page.keyboard.press('Enter') // focus is still on the toggle, now "Show all"
    await expect(d.getByRole('button', { name: 'Step through' })).toBeFocused()
    await expect(d.locator('li:visible')).toHaveCount(2)
    await expectNoErrors(errors)
  })

  test('dismissing the bar removes the way back from the URL', async ({ page }) => {
    const errors = collectErrors(page)
    await openQ0(page)
    await standOn(page, 'q0-demo-sphere:b3')
    await page.locator('.story-beat[data-beat="q0-demo-sphere:b3"] a.bridge').first().click()
    await expect(bar(page)).toBeVisible()
    await page.getByRole('button', { name: 'Dismiss the return bar' }).click()
    await expect(bar(page)).toHaveCount(0)
    await expect(page).toHaveURL(/#\/lecture\/L2#l2-complex$/)
    await expectNoErrors(errors)
  })

  test('screens: a 448 page with the return bar, 1440×900 and 390×844', async ({ page }) => {
    mkdirSync(SCREENS, { recursive: true })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const [w, h] of [
      [1440, 900],
      [390, 844],
    ]) {
      await page.setViewportSize({ width: w, height: h })
      await openQ0(page)
      await standOn(page, 'q0-demo-sphere:b3')
      await page.locator('[data-beat="q0-demo-sphere:b3"] a.bridge').first().click()
      await expect(bar(page)).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
      await page.screenshot({ path: `${SCREENS}bridge-448-return-bar-${w}.png` })
    }
  })
})

test.describe('hostile ret values (both projects)', () => {
  for (const ret of [
    'https://evil.example/',
    'qc709~Q0~javascript:alert(1)~0.4~ground',
    'qc709~Q3~q3-bell:b4~0.4~ground', // well-formed, but Q3 is not a written chapter
    'qc709~L1~l1-quantized:b1~0.4~ground',
    'qc709~Q0~q0-demo-sphere:b3~0.4~ground' + '~x'.repeat(200),
    '%3Cscript%3Ealert(1)%3C%2Fscript%3E',
  ])
    test(`no return bar and no error for ret=${ret.slice(0, 40)}`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto(`#/lecture/L2?ret=${ret}#l2-complex`)
      await expect(page.locator('.lecture-head h1')).toBeVisible()
      await page.waitForTimeout(300) // the 709 registry may load on demand; still nothing
      await expect(bar(page)).toHaveCount(0)
      expect(await page.evaluate(() => document.querySelectorAll('.return-bar a').length)).toBe(0)
      await expectNoErrors(errors)
    })

  // the 448 form of a way back, on a 448 page: well-formed ones that name the page itself show nothing either
  for (const ret of ['sl448~L2~l2-complex:b2~0.4~ground', 'sl448~L2~l2-complex:b2~0.4~formal', 'sl448~Q0~q0-demo-sphere:b3~0.4~ground', 'sl448~L99~l99-x:b1~0.4~ground'])
    test(`no return bar and no error for the 448 form ret=${ret.slice(0, 40)}`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto(`#/lecture/L2?ret=${ret}#l2-complex`)
      await expect(page.locator('.lecture-head h1')).toBeVisible()
      await page.waitForTimeout(300)
      await expect(bar(page)).toHaveCount(0)
      await expect(bar448(page)).toHaveCount(0)
      await expectNoErrors(errors)
    })
})

/* ------------------------------------------------------------------------------------------------------------------ */
/* Spin Lab → 709 (W-448 #4)                                                                                           */
/* ------------------------------------------------------------------------------------------------------------------ */

const L5 = '#/lecture/L5'
const L5_BEAT = 'l5-coordinates:b1'
const CHIP = 'a.bridge[data-bridge="sl-dev-q0-sphere"]'

async function openL5(page: Page, mode: 'story' | 'read' = 'story') {
  await page.goto(L5)
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  // below 900 px the page is already the Read-mode column and has no toggle
  if (mode === 'read' && (page.viewportSize()?.width ?? 1440) >= 900) await page.getByRole('button', { name: 'Read', exact: true }).click()
}

/** Pre-existing on main, see the 709 → 448 test above: leaving a 448 lecture in Read mode tears its Bloch canvas down. */
const KNOWN_READ_EXIT = /Attempted to synchronously unmount a root while React was already rendering|Failed to execute 'removeChild' on 'Node'/

test.describe('@dev-only bridges from a Spin Lab lecture (temporary DEV chip on Lecture 5)', () => {
  // content/load.ts adds the chip only when the page says so before it loads (every page of the context, a new tab too)
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      ;(window as unknown as { __devChip448?: boolean }).__devChip448 = true
    })
  })

  for (const mode of ['story', 'read'] as const)
    test(`${mode}: "Go further in 709" opens the 709 unit with a way back, and Return puts the same beat under the centre line`, async ({ page }) => {
      const errors = collectErrors(page)
      await openL5(page, mode)
      await standOn(page, L5_BEAT)
      const kind = mode === 'story' ? '.story-beat' : '.static-beat'
      const chip = page.locator(`${kind}[data-beat="${L5_BEAT}"] ${CHIP}`)
      await expect(chip).toContainText('Go further in 709 · Chapter Q0')
      await expect(chip).toHaveAttribute('data-from', 'sl448')
      await chip.click()

      // on the 709 page: the unit's beat under the centre line, the bar (Spin Lab's), focus on the heading, an announcement
      await expect(page).toHaveURL(/#\/709\/ch\/Q0\?ret=sl448~L5~l5-coordinates:b1~[0-9.]+~ground#q0-demo-sphere$/)
      await expect(bar448(page)).toBeVisible()
      await expect(bar448(page).getByRole('link')).toHaveText(/^↑Return to Spin Lab · Lecture 5 · Same state, new coordinates, step 1$/)
      await expect(bar(page)).toHaveCount(0)
      await expect(page.locator('#q0-demo-sphere-title')).toBeFocused()
      await expect(page.locator('[aria-live="polite"]', { hasText: /^Arrived at .*returns you to Physics 448\.$/ })).toHaveCount(1)
      await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b2')
      expect(await page.evaluate(() => document.documentElement.dataset.course)).toBe('qc709')

      // a reload keeps the bar (the place is in the URL)
      await page.reload()
      await expect(page.locator('.lecture-head h1')).toBeVisible()
      await expect(bar448(page)).toBeVisible()

      await bar448(page).getByRole('link').click()
      await expect(page).toHaveURL(/#\/lecture\/L5$/) // at / f leave the URL once the place is restored
      await expect.poll(() => beatAtCentre(page)).toBe(L5_BEAT)
      await expect(page.locator(`${kind}[data-beat="${L5_BEAT}"]`)).toBeFocused()
      await expect(bar448(page)).toHaveCount(0)
      expect(await page.evaluate(() => document.documentElement.dataset.course)).toBe('sl448')
      await expectNoErrors(errors.filter((e) => !KNOWN_READ_EXIT.test(e)))
    })

  test('Back from the 709 page returns to the same beat (the bridge wrote the place into the 448 entry)', async ({ page }) => {
    const errors = collectErrors(page)
    await openL5(page)
    await standOn(page, L5_BEAT)
    await page.locator(`.story-beat[data-beat="${L5_BEAT}"] ${CHIP}`).click()
    await expect(page).toHaveURL(/#\/709\/ch\/Q0\?ret=sl448~L5~/)
    await page.goBack()
    await expect(page).toHaveURL(/#\/lecture\/L5$/)
    await expect.poll(() => beatAtCentre(page)).toBe(L5_BEAT)
    await expectNoErrors(errors)
  })

  test('a new tab opens the bridge with its way back', async ({ page, context }) => {
    const errors = collectErrors(page)
    await openL5(page)
    await standOn(page, L5_BEAT)
    const link = page.locator(`.story-beat[data-beat="${L5_BEAT}"] ${CHIP}`)
    await link.hover()
    const href = await link.getAttribute('href')
    expect(href).toMatch(/^#\/709\/ch\/Q0\?ret=sl448~L5~l5-coordinates:b1~[0-9.]+~ground#q0-demo-sphere$/)
    const tab = await context.newPage()
    await tab.goto(href!)
    await expect(bar448(tab)).toBeVisible()
    await bar448(tab).getByRole('link').click()
    await expect.poll(() => beatAtCentre(tab)).toBe(L5_BEAT)
    await tab.close()
    await expectNoErrors(errors)
  })

  test('keyboard only: Enter on the chip, the skip link one Shift+Tab away, Enter returns', async ({ page }) => {
    const errors = collectErrors(page)
    await openL5(page)
    await standOn(page, L5_BEAT)
    await page.locator(`.story-beat[data-beat="${L5_BEAT}"] ${CHIP}`).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#q0-demo-sphere-title')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    const skip = page.locator('#q0-demo-sphere a.rb-skip')
    await expect(skip).toBeFocused()
    await expect(skip).toHaveText(await bar448(page).getByRole('link').innerText().then((t) => t.replace(/^↑\s*/, '')))
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#\/lecture\/L5$/)
    await expect.poll(() => beatAtCentre(page)).toBe(L5_BEAT)
    await expectNoErrors(errors)
  })

  test('a chain: the bar is carried to the next 709 page and a reload there, and dismissing it removes the way back', async ({ page }) => {
    const errors = collectErrors(page)
    await openL5(page)
    await standOn(page, L5_BEAT)
    await page.locator(`.story-beat[data-beat="${L5_BEAT}"] ${CHIP}`).click()
    await expect(bar448(page)).toBeVisible()
    // on through the 709 topbar: the way back comes along
    await page.getByRole('link', { name: 'Formulas', exact: true }).first().click()
    await expect(page).toHaveURL(/#\/709\/formulas\?ret=sl448~L5~/)
    await expect(bar448(page)).toBeVisible()
    await page.reload()
    await expect(bar448(page)).toBeVisible()
    await page.getByRole('button', { name: 'Dismiss the return bar' }).click()
    await expect(bar448(page)).toHaveCount(0)
    await expect(page).toHaveURL(/#\/709\/formulas$/)
    await expectNoErrors(errors)
  })

  test('screens: the chip on the 448 page and the Spin Lab return bar on the 709 page, 1440×900 and 390×844', async ({ page }) => {
    mkdirSync(SCREENS, { recursive: true })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const [w, h] of [
      [1440, 900],
      [390, 844],
    ]) {
      await page.setViewportSize({ width: w, height: h })
      await openL5(page, w < 900 ? 'read' : 'story')
      await standOn(page, L5_BEAT)
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: `${SCREENS}bridge-709-chip-${w}.png` })
      await page.locator(`[data-beat="${L5_BEAT}"] ${CHIP}`).click()
      await expect(bar448(page)).toBeVisible()
      await expect(page.locator('.lecture-head h1')).toBeVisible() // the 709 chapter has loaded
      await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b2')
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
      await page.screenshot({ path: `${SCREENS}bridge-448-return-bar-on-709-${w}.png` })
    }
  })
})

test.describe('the way back into Spin Lab, on a real 709 chapter (both projects)', () => {
  const Q1_UNIT = '#/709/ch/Q1?ret=sl448~L2~l2-complex:b3~0.5~ground#q1-two-spots'

  test('a crafted-but-valid ret shows Spin Lab’s bar on Q1; Return opens Lecture 2 at that beat; nothing else appears', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(Q1_UNIT)
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    await expect(bar448(page)).toBeVisible()
    await expect(bar448(page).getByRole('link')).toHaveText(/^↑Return to Spin Lab · Lecture 2 · Numbers that turn, step 3$/)
    expect(await bar448(page).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(228, 234, 238)') // 448's plate, not the fridge's navy
    await bar448(page).getByRole('link').click()
    await expect(page).toHaveURL(/#\/lecture\/L2$/)
    await expect.poll(() => beatAtCentre(page)).toBe('l2-complex:b3')
    await expect(bar448(page)).toHaveCount(0)
    await expectNoErrors(errors)
  })

  for (const ret of [
    'sl448~L2~l2-complex:b3~0.5~formal', // Spin Lab has no Formal track
    'sl448~Q1~q1-two-spots:b1~0.5~ground', // a 709 chapter under Spin Lab’s name
    'sl448~L2~q1-two-spots:b1~0.5~ground', // a unit of another chapter
    'sl448~L99~l99-x:b1~0.5~ground', // not a written lecture
    'sl448~L2~l2-nowhere:b1~0.5~ground', // not a unit of it
    'sl448~//evil.example~l2-complex:b3~0.5~ground',
    'sl448~L2~https://evil.example/~0.5~ground',
    'sl448~L2~javascript:alert(1)~0.5~ground',
    'sl448~L2~l2-complex:b3~0.5~ground' + '~x'.repeat(200),
  ])
    test(`no return bar and no error for ret=${ret.slice(0, 44)}`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto(`#/709/ch/Q1?ret=${ret}#q1-two-spots`)
      await expect(page.locator('.lecture-head h1')).toBeVisible()
      await page.waitForTimeout(300)
      await expect(bar448(page)).toHaveCount(0)
      await expect(bar(page)).toHaveCount(0)
      expect(await page.evaluate(() => document.querySelectorAll('.return-bar a').length)).toBe(0)
      await expectNoErrors(errors)
    })
})
