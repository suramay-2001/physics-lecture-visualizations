/**
 * Lecture 9's chips into Physics 709 (content/bridges448.ts; W-448 #4 "Go further in 709" with a return bar to the exact 448 beat),
 * on the real lecture page: a Go-deeper chip opens F6's product test and Return lands back on the beat; a clue's chip sits in its
 * reveal, hidden until "Show me".
 *
 *   PW_PREVIEW_PORT=5233 npx playwright test --project=preview e2e/l9-bridges.spec.ts
 */
import { expect, test, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

const bar448 = (page: Page) => page.getByRole('navigation', { name: 'Return to Physics 448' })
/** Pre-existing on main: leaving a 448 lecture in Read mode may tear a canvas down (Lecture 9 has none, but the message is the platform's). */
const KNOWN_READ_EXIT = /Attempted to synchronously unmount a root while React was already rendering|Failed to execute 'removeChild' on 'Node'/

test.describe('Lecture 9 chips into Physics 709', () => {
  test('the Go-deeper chip opens F6’s product test with a way back to the same beat, and Return lands on it', async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('#/lecture/L9')
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    await page.getByRole('button', { name: 'Read', exact: true }).click()
    const beat = page.locator('.static-beat[data-beat="l9-singlet:b8"]')
    await beat.scrollIntoViewIfNeeded()
    const chip = beat.locator('a.bridge[data-bridge="sl-f6-product-or-not"]')
    await expect(chip).toContainText('Go further in 709 · Chapter F6')
    await expect(chip).toHaveAttribute('data-from', 'sl448')
    await chip.click()
    await expect(page).toHaveURL(/#\/709\/ch\/F6\?ret=sl448~L9~l9-singlet:b8~[0-9.]+~ground#f6-product-or-not$/)
    await expect(bar448(page)).toBeVisible()
    await expect(bar448(page).getByRole('link')).toHaveText(/^↑Return to Spin Lab · Lecture 9 · The singlet: a pair with no separate states, step 8$/)
    await bar448(page).getByRole('link').click()
    await expect(page).toHaveURL(/#\/lecture\/L9$/)
    await expect(bar448(page)).toHaveCount(0)
    await expectNoErrors(errors.filter((e) => !KNOWN_READ_EXIT.test(e)))
  })

  test('a clue’s chip sits in its reveal: hidden until "Show me", then it opens F6’s joint space', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('#/lecture/L9')
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    const beat = page.locator('.story-beat[data-beat="l9-tensor:b6"]')
    await beat.scrollIntoViewIfNeeded()
    const chip = beat.locator('a.bridge[data-bridge="sl-f6-pairs"]')
    await expect(chip).toBeHidden()
    await beat.locator('.reveal-btn').click()
    await expect(chip).toBeVisible()
    await chip.click()
    await expect(page).toHaveURL(/#\/709\/ch\/F6\?ret=sl448~L9~l9-tensor:b6~[0-9.]+~ground#f6-pairs$/)
  })
})
