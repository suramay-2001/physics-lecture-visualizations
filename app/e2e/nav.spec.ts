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
