/**
 * Arcade v1 (Phase 4a item 5): play each game through the UI. Runs in both projects.
 *
 *   PW_DEV_PORT=5178 npx playwright test e2e/arcade.spec.ts --project=dev
 */
import { expect, test } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

test('the Arcade lists its games by lecture station, with links back into the chapters', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/arcade')
  await expect(page.locator('#arcade-L1 .arcade-card')).toHaveCount(2)
  // Lecture 7 is built: its games (route, spot the error, golf) link into its chapters, none is ahead of the course
  await expect(page.locator('#arcade-L7 .arcade-card')).toHaveCount(3)
  await expect(page.locator('#arcade-L7')).not.toContainText('ahead of the course')
  await page.locator('#arcade-L1 a.trains-chip', { hasText: '1.2' }).first().click()
  await expect(page).toHaveURL(/#\/lecture\/L1#l1-sequential$/)
  await expectNoErrors(errors)
})

test('Route the beam: level 1 is solved by the engine as soon as the bench lands a quarter', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/arcade/route-the-beam')
  await expect(page.locator('.game-verdict')).toContainText('+ spot now: 50.0% · target 25.0%')
  await page.getByRole('button', { name: 'Add device' }).click() // oven → z (keep +) → x
  await expect(page.locator('.game-verdict')).toContainText('+ spot now: 25.0% · target 25.0% · solved')
  await expect(page.getByRole('status')).toContainText('Solved.')
  await expect(page.locator('.level-bar button').first()).toHaveAttribute('data-cleared', 'true')
  await page.getByRole('button', { name: 'Next level' }).click()
  await expect(page.locator('#level-title')).toContainText('Level 2 of 12')
  await expectNoErrors(errors)
})

test('Spot the error: a sound step is marked as holding; the planted one solves the round', async ({ page }) => {
  await page.goto('#/arcade/spot-the-error')
  await page.getByRole('button', { name: /^Step 1/ }).click()
  await expect(page.locator('.step-note')).toHaveText('This step holds. Look again.')
  await page.getByRole('button', { name: /^Step 3/ }).click()
  await expect(page.getByRole('status')).toContainText('0.854')
})

test('Bloch golf: one quarter turn about y sinks hole 1; four about x bring back −|+z⟩', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/arcade/bloch-golf')
  await page.getByRole('button', { name: 'y +90°' }).click()
  await expect(page.locator('.game-verdict')).toContainText('strokes 1 · par 1 · on par')
  await page.locator('.level-bar button').nth(4).click()
  await expect(page.locator('#level-title')).toContainText('All the way round')
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'x +90°' }).click()
  await expect(page.locator('.phase-note')).toContainText('opposite sign')
  await expectNoErrors(errors)
})
