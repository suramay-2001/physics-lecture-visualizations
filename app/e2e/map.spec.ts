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
  await expect(page.locator('.map-line')).toHaveCount(19)
  await expect(page.locator('#map-L1 a.map-station')).toHaveCount(5)
  // Lecture 7 is built: seven stations, one per unit (six lecture units and the Townsend unit l7-ladder), all links; no line is in preparation any more
  await expect(page.locator('#map-L7 .map-station')).toHaveCount(7)
  await expect(page.locator('#map-L7 a.map-station')).toHaveCount(7)
  await expect(page.locator('#map-L7')).not.toContainText('in preparation')
  // Lecture 8 is built: eight stations, one per unit, all links
  await expect(page.locator('#map-L8 .map-station')).toHaveCount(8)
  await expect(page.locator('#map-L8 a.map-station')).toHaveCount(8)
  await expect(page.locator('#map-L8')).not.toContainText('in preparation')
  // Lecture 9 is built: six stations, one per unit, all links
  await expect(page.locator('#map-L9 .map-station')).toHaveCount(6)
  await expect(page.locator('#map-L9 a.map-station')).toHaveCount(6)
  await expect(page.locator('#map-L9')).not.toContainText('in preparation')
  // Lecture 10 is built: eight stations, one per unit, all links
  await expect(page.locator('#map-L10 .map-station')).toHaveCount(8)
  await expect(page.locator('#map-L10 a.map-station')).toHaveCount(8)
  await expect(page.locator('#map-L10')).not.toContainText('in preparation')
  // Lecture 11 is built: six stations, one per unit, all links
  await expect(page.locator('#map-L11 .map-station')).toHaveCount(6)
  await expect(page.locator('#map-L11 a.map-station')).toHaveCount(6)
  await expect(page.locator('#map-L11')).not.toContainText('in preparation')
  // Lecture 12 is built: six stations, one per unit, all links
  await expect(page.locator('#map-L12 .map-station')).toHaveCount(7) // six lecture units and the Townsend unit l12-driven
  await expect(page.locator('#map-L12 a.map-station')).toHaveCount(7)
  await expect(page.locator('#map-L12')).not.toContainText('in preparation')
  // Lecture 13 is built: seven stations, one per unit (seven lecture units; the box moved to L14 and l13-flow to L17 and L18), all links
  await expect(page.locator('#map-L13 .map-station')).toHaveCount(7)
  await expect(page.locator('#map-L13 a.map-station')).toHaveCount(7)
  await expect(page.locator('#map-L13')).not.toContainText('in preparation')
  // Lecture 14 is built: six stations, one per unit (five lecture units and the books-only box l14-box), all links
  await expect(page.locator('#map-L14 .map-station')).toHaveCount(6)
  await expect(page.locator('#map-L14 a.map-station')).toHaveCount(6)
  await expect(page.locator('#map-L14')).not.toContainText('in preparation')
  // Lecture 15 is built: six stations, one per unit (six lecture units), all links
  await expect(page.locator('#map-L15 .map-station')).toHaveCount(6)
  await expect(page.locator('#map-L15 a.map-station')).toHaveCount(6)
  await expect(page.locator('#map-L15')).not.toContainText('in preparation')
  // Lecture 16 is built: four stations, one per unit (four lecture units), all links
  await expect(page.locator('#map-L16 .map-station')).toHaveCount(4)
  await expect(page.locator('#map-L16 a.map-station')).toHaveCount(4)
  await expect(page.locator('#map-L16')).not.toContainText('in preparation')
  // Lecture 17 is built: three stations, one per unit (mean force, the step, the current), all links
  await expect(page.locator('#map-L17 .map-station')).toHaveCount(3)
  await expect(page.locator('#map-L17 a.map-station')).toHaveCount(3)
  await expect(page.locator('#map-L17')).not.toContainText('in preparation')
  // Lecture 18 is built: four stations, one per unit (the packet at a step, the flux, below the step, the barrier), all links
  await expect(page.locator('#map-L18 .map-station')).toHaveCount(4)
  await expect(page.locator('#map-L18 a.map-station')).toHaveCount(4)
  await expect(page.locator('#map-L18')).not.toContainText('in preparation')
  // Lecture 19 is built: five stations, one per unit (the second edge, three regions, four conditions, reading T, energy and uses), all links
  await expect(page.locator('#map-L19 .map-station')).toHaveCount(5)
  await expect(page.locator('#map-L19 a.map-station')).toHaveCount(5)
  await expect(page.locator('#map-L19')).not.toContainText('in preparation')
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
