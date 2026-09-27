/**
 * Concept map (Phase 4a item 6). Runs in both projects.
 *
 *   PW_DEV_PORT=5178 npx playwright test e2e/map.spec.ts --project=dev
 */
import { expect, test } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

test('the course as beamlines: every station of the built course links into its chapter', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/map')
  await expect(page.locator('.map-line')).toHaveCount(7)
  await expect(page.locator('#map-L1 a.map-station')).toHaveCount(5)
  // Lecture 7 is built: six stations, one per unit, all links; no line is in preparation any more
  await expect(page.locator('#map-L7 .map-station')).toHaveCount(6)
  await expect(page.locator('#map-L7 a.map-station')).toHaveCount(6)
  await expect(page.locator('#map-L7')).not.toContainText('in preparation')
  // every lecture is built, so the intro no longer promises dashed "in preparation" stations
  await expect(page.locator('.map-page .section-lede')).not.toContainText('in preparation')
  await expectNoErrors(errors)
})

test('focusing a station draws and says what it builds on and what builds on it', async ({ page }) => {
  await page.goto('#/map')
  await page.locator('[data-concept="prepares"]').focus()
  await expect(page.locator('.map-edges path')).toHaveCount(3) // needs: quantized · leads: probability, order
  await expect(page.locator('.map-edges path[data-kind="leads"]')).toHaveCount(2)
  await expect(page.locator('.map-say')).toContainText('Builds on: Two spots: quantized outcomes')
  await expect(page.locator('[data-concept="order"]')).toHaveAttribute('data-rel', 'leads')
  await page.locator('[data-concept="prepares"]').click()
  await expect(page).toHaveURL(/#\/lecture\/L1#l1-sequential$/)
})

test('the lecture fork lands on its line of the map', async ({ page }) => {
  await page.goto('#/lecture/L1')
  const fork = page.getByRole('navigation', { name: 'Where next' })
  await fork.scrollIntoViewIfNeeded()
  await fork.getByRole('link', { name: /Concept map/ }).click()
  await expect(page.locator('#map-L1')).toBeInViewport()
})
