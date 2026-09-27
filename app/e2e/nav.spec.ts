/**
 * Story navigation (Phase 4a, docs/roles/proposals/D-nav-story.md). Runs in both projects.
 *
 *   PW_DEV_PORT=5178 npx playwright test e2e/nav.spec.ts --project=dev
 */
import { expect, test } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

test.describe('topbar', () => {
  test('Lectures panel: opens from any page, lists every unit, Escape closes it and returns focus', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('#/help')
    const button = page.getByRole('button', { name: /Lectures/ })
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await button.click()
    const panel = page.getByRole('region', { name: 'Lectures' })
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('link', { name: /Stern–Gerlach/ })).toBeFocused()
    await expect(panel.locator('.panel-units a')).toHaveCount(38) // L1, L2, L5 and L6 (five units each), L3, L4 and L7 (six each)
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
    await expect(button).toBeFocused()
    // a unit link lands on that unit
    await button.click()
    await panel.locator('.panel-units a').nth(1).click()
    await expect(page).toHaveURL(/#\/lecture\/L1#l1-sequential$/)
    await expect(page.locator('#l1-sequential')).toBeInViewport()
    await expectNoErrors(errors)
  })

  test('Motion toggle: a reader choice that persists across reloads and pages', async ({ page }) => {
    await page.goto('#/')
    const toggle = page.getByRole('button', { name: /Motion/ })
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(toggle).toHaveText(/Motion off/)
    await page.reload()
    await expect(page.getByRole('button', { name: /Motion/ })).toHaveAttribute('aria-pressed', 'false')
    // motion off → the home opener shows its poster instead of the scrubbed film
    await expect(page.locator('.opener-still img')).toHaveCount(1)
    await page.getByRole('button', { name: /Motion/ }).click()
    await expect(page.locator('canvas.opener-canvas')).toHaveCount(1)
  })
})

test.describe('lecture beamline (route rail + chapter cards)', () => {
  test('stations, "you are here", step strip, [ / ] jumps and the chapter counter', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('#/lecture/L1')
    const h1 = page.locator('.lecture-head h1')
    await expect(h1).toHaveAttribute('aria-label', 'Stern–Gerlach and the birth of the quantum state')
    await expect(h1).toHaveText('Stern–Gerlach and the birth of the quantum state') // words keep their spaces
    await expect(page.locator('.lecture-stats')).toHaveText('5 units · 31 beats · 14 challenges')
    const rail = page.getByRole('navigation', { name: 'Units in this lecture' })
    await expect(rail.locator('.route-station')).toHaveCount(5)

    // a chapter card: counter, and its strip link lands on the step
    const card = page.locator('#l1-average .chapter-card')
    await expect(card.locator('.chapter-count')).toHaveText('03 / 05')
    await card.scrollIntoViewIfNeeded()
    await card.getByRole('link', { name: 'Intuition' }).click()
    await expect(page.locator('#l1-average--intuition')).toBeInViewport()
    await expect(rail.locator('[aria-current="location"]')).toContainText('1.3')
    await expect(rail.locator('.route-steps li')).toHaveCount(await card.locator('.step-strip li').count())

    // ] goes to the next unit; the rail follows; the atom moved
    const atomY = () => rail.locator('.route-atom').evaluate((el) => el.getBoundingClientRect().top)
    const before = await atomY()
    await page.locator('body').press(']')
    await expect(rail.locator('[aria-current="location"]')).toContainText('1.4')
    await expect.poll(atomY).toBeGreaterThan(before)
    // [ at a unit's start goes back one unit
    await page.locator('body').press('[')
    await expect(rail.locator('[aria-current="location"]')).toContainText('1.3')
    await expectNoErrors(errors)
  })

  test('the atom only moves forward while the reader scrolls forward (no layout jumps)', async ({ page }) => {
    await page.goto('#/lecture/L1')
    const rail = page.getByRole('navigation', { name: 'Units in this lecture' })
    await expect(rail.locator('.route-station')).toHaveCount(5)
    const offset = () => rail.evaluate((r) => r.querySelector('.route-atom')!.getBoundingClientRect().top - r.getBoundingClientRect().top)
    const [top, bottom] = await page.evaluate(() => {
      const first = document.querySelector('.unit')!.getBoundingClientRect().top + scrollY
      const units = document.querySelectorAll('.unit')
      const last = units[units.length - 1].getBoundingClientRect().bottom + scrollY
      return [first - innerHeight / 2, last - innerHeight / 2]
    })
    let prev = -Infinity
    for (let i = 0; i <= 40; i++) {
      await page.evaluate((y) => scrollTo(0, y), top + ((bottom - top) * i) / 40)
      await page.waitForTimeout(60)
      const y = await offset()
      expect(y, `step ${i}`).toBeGreaterThanOrEqual(prev - 0.5)
      prev = y
    }
  })

  test('the atom sits between the station it is in and the next one', async ({ page }) => {
    await page.goto('#/lecture/L1')
    const rail = page.getByRole('navigation', { name: 'Units in this lecture' })
    // each lecture is its own chunk (content/load.ts): wait for it before scrolling inside it
    await expect(page.locator('#l1-sequential--try')).toBeAttached()
    await page.evaluate(() => document.getElementById('l1-sequential--try')!.scrollIntoView({ block: 'center' }))
    await expect(rail.locator('[aria-current="location"]')).toContainText('1.2')
    await expect
      .poll(() =>
        rail.evaluate((r) => {
          const mid = (el: Element) => {
            const b = el.getBoundingClientRect()
            return b.top + b.height / 2
          }
          const dots = [...r.querySelectorAll('[data-station-dot]')]
          const atom = mid(r.querySelector('.route-atom')!)
          return atom > mid(dots[1]) && atom < mid(dots[2])
        }),
      )
      .toBe(true)
  })
})

test.describe('end of a lecture and Read mode', () => {
  test('the lecture ends in a fork: next lecture (or the end of the course), games, formulas, map', async ({ page }) => {
    await page.goto('#/lecture/L1')
    const fork = page.getByRole('navigation', { name: 'Where next' })
    await fork.scrollIntoViewIfNeeded()
    await expect(fork.locator('.fork-route')).toHaveCount(4)
    await expect(fork.locator('a.fork-route')).toHaveCount(4) // L2 is built: the next lecture is a link
    await expect(fork.getByRole('link', { name: /Next lecture/ })).toHaveAttribute('href', '#/lecture/L2')
    await fork.getByRole('link', { name: /Formula board/ }).click()
    await expect(page).toHaveURL(/#\/formulas#formulas-L1$/)
    await expect(page.locator('#formulas-L1')).toBeInViewport()
    // L2's fork links on to L3, which is built
    await page.goto('#/lecture/L2')
    const fork2 = page.getByRole('navigation', { name: 'Where next' })
    await fork2.scrollIntoViewIfNeeded()
    await expect(fork2.locator('a.fork-route')).toHaveCount(4)
    await expect(fork2.getByRole('link', { name: /Next lecture/ })).toHaveAttribute('href', '#/lecture/L3')
    // L3's fork links on to L4, which is built
    await page.goto('#/lecture/L3')
    const fork3 = page.getByRole('navigation', { name: 'Where next' })
    await fork3.scrollIntoViewIfNeeded()
    await expect(fork3.locator('a.fork-route')).toHaveCount(4)
    await expect(fork3.getByRole('link', { name: /Next lecture/ })).toHaveAttribute('href', '#/lecture/L4')
    // L4's fork links on to L5, which is built
    await page.goto('#/lecture/L4')
    const fork4 = page.getByRole('navigation', { name: 'Where next' })
    await fork4.scrollIntoViewIfNeeded()
    await expect(fork4.locator('a.fork-route')).toHaveCount(4)
    await expect(fork4.getByRole('link', { name: /Next lecture/ })).toHaveAttribute('href', '#/lecture/L5')
    // L5's fork links on to L6, which is built
    await page.goto('#/lecture/L5')
    const fork5 = page.getByRole('navigation', { name: 'Where next' })
    await fork5.scrollIntoViewIfNeeded()
    await expect(fork5.locator('a.fork-route')).toHaveCount(4)
    await expect(fork5.getByRole('link', { name: /Next lecture/ })).toHaveAttribute('href', '#/lecture/L6')
    // L6's fork links on to L7, which is built
    await page.goto('#/lecture/L6')
    const fork6 = page.getByRole('navigation', { name: 'Where next' })
    await fork6.scrollIntoViewIfNeeded()
    await expect(fork6.locator('a.fork-route')).toHaveCount(4)
    await expect(fork6.getByRole('link', { name: /Next lecture/ })).toHaveAttribute('href', '#/lecture/L7')
    // L7 is the course's last lecture: its fork ends the course with a link to the whole map, never "in preparation"
    await page.goto('#/lecture/L7')
    const fork7 = page.getByRole('navigation', { name: 'Where next' })
    await fork7.scrollIntoViewIfNeeded()
    await expect(fork7.locator('a.fork-route')).toHaveCount(4)
    await expect(fork7).toContainText('End of the course')
    await expect(fork7).not.toContainText('in preparation')
    await expect(fork7.getByRole('link', { name: /End of the course/ })).toHaveAttribute('href', '#/map')
  })

  test('unit questions and the fork preview typeset their math (no raw $…$)', async ({ page }) => {
    await page.goto('#/lecture/L2')
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    const questions = page.locator('.unit-question')
    await expect(questions.first()).toBeAttached()
    for (const text of await questions.allTextContents()) expect(text).not.toContain('$')
    expect(await page.locator('.unit-question .katex').count()).toBeGreaterThan(0) // 2.3 "multiplying by i"
    for (const id of ['L2', 'L3', 'L4', 'L5', 'L6']) {
      await page.goto(`#/lecture/${id}`)
      const next = page.getByRole('link', { name: /Next lecture/ })
      await expect(next).toBeAttached()
      expect(await next.textContent()).not.toContain('$')
    }
  })

  test('Read mode: the reading column on a wide screen, kept across reloads, same place in the text', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('#/lecture/L1')
    await expect(page.locator('.story[data-mode="live"]')).toHaveCount(5)
    // stand on a beat in the middle of the lecture, then switch
    await page.evaluate(() => document.querySelector('[data-beat="l1-average:b3"]')!.scrollIntoView({ block: 'center' }))
    // the reading position is probed once per frame after a scroll: wait until the story has taken this beat as the
    // current one (a reader never switches within the same frame; the test could, 1 run in 4 on the dev server)
    await expect(page.locator('.story-beat[data-beat="l1-average:b3"]')).toHaveAttribute('data-active', 'true')
    await page.getByRole('button', { name: 'Read', exact: true }).click()
    await expect(page.locator('.story[data-mode="live"]')).toHaveCount(0)
    await expect(page.locator('.static-beat[data-beat="l1-average:b3"]')).toBeInViewport()
    await page.reload()
    await expect(page.getByRole('button', { name: 'Read', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.story[data-mode="live"]')).toHaveCount(0)
    await page.getByRole('button', { name: 'Story', exact: true }).click()
    await expect(page.locator('.story[data-mode="live"]')).toHaveCount(5)
    await expectNoErrors(errors)
  })
})


test('Help: every walkthrough routes back to its challenge and to its chapter', async ({ page }) => {
  await page.goto('#/help')
  await page.locator('.help-toggle').first().click()
  const routes = page.locator('.help-routes').first()
  await expect(routes.getByRole('link')).toHaveCount(2)
  await routes.getByRole('link', { name: /Read the chapter/ }).click()
  await expect(page).toHaveURL(/#\/lecture\/L1#l1-quantized$/)
  await expect(page.locator('#l1-quantized')).toBeInViewport()
})
