/**
 * Bridges with return (W-709-platform §C). A 709 chapter links into Spin Lab (448); the 448 page shows the return bar
 * (only 709 material on it); the bar survives a reload, a new tab and further navigation; Return (or Back) puts the
 * same beat under the centre line in the same track, with focus on it. Keyboard only works end to end.
 *
 * The chapter-side tests run on the DEV demo chapter Q0 (`#/709/ch/Q0`, never in a production build), so they are
 * `@dev-only`; the hostile-`ret` tests run in both projects.
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
})
