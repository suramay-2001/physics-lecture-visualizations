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
    await expect(panel.locator('.panel-units a')).toHaveCount(5)
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
