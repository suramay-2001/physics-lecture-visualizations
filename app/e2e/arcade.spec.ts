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
  // Lecture 9 is built: one Spot-the-error round per unit links into its chapters
  await expect(page.locator('#arcade-L9 .arcade-card')).toHaveCount(1)
  await expect(page.locator('#arcade-L9')).not.toContainText('ahead of the course')
  // Lecture 8 is built: its Spot-the-error rounds and Catch Eve link into its chapters
  await expect(page.locator('#arcade-L8 .arcade-card')).toHaveCount(2)
  await expect(page.locator('#arcade-L8')).not.toContainText('ahead of the course')
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

test('Catch Eve: sift the board, size the test, and keep a secret key (every verdict is the BB84 engine’s)', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/arcade/catch-eve')
  // level 1: a round that agrees only by luck is not kept
  await page.getByRole('checkbox', { name: 'Keep round 2' }).check()
  await page.getByRole('button', { name: 'Check the key' }).click()
  await expect(page.locator('.step-note')).toContainText('Not yet')
  await page.getByRole('checkbox', { name: 'Keep round 2' }).uncheck()
  for (const n of [1, 4, 5, 6]) await page.getByRole('checkbox', { name: `Keep round ${n}` }).check()
  await page.getByRole('button', { name: 'Check the key' }).click()
  await expect(page.locator('.game-solved')).toContainText('Solved.')
  await expect(page.locator('.game-verdict')).toContainText('Alice’s key 0010 · Bob’s key 0010')
  await page.getByRole('button', { name: 'Next level' }).click()
  // level 2: one kept round with Eve in the wrong basis errs half the time
  await expect(page.locator('#level-title')).toContainText('Level 2 of 5')
  await page.getByRole('group', { name: 'Answers' }).getByRole('button', { name: '¼' }).click()
  await expect(page.locator('.step-note')).toContainText('not the chance')
  await page.getByRole('group', { name: 'Answers' }).getByRole('button', { name: '½' }).click()
  await expect(page.locator('.game-solved')).toContainText('Solved.')
  await page.getByRole('button', { name: 'Next level' }).click()
  // level 3: the average over Eve's basis
  await page.getByRole('group', { name: 'Answers' }).getByRole('button', { name: '¼' }).click()
  await expect(page.locator('.game-solved')).toContainText('Solved.')
  await page.getByRole('button', { name: 'Next level' }).click()
  // level 4: the smallest test is 17 bits
  const m = page.getByRole('slider', { name: 'Test size m' })
  await m.fill('16')
  await expect(page.locator('.game-verdict')).toContainText('m = 16 · chance the test shows no error 1.00%')
  await page.getByRole('button', { name: /^Lock in/ }).click()
  await expect(page.locator('.step-note')).toContainText('too often')
  await m.fill('17')
  await expect(page.locator('.game-verdict')).toContainText('m = 17 · chance the test shows no error 0.75%')
  await page.getByRole('button', { name: /^Lock in/ }).click()
  await expect(page.locator('.game-solved')).toContainText('Solved.')
  await page.getByRole('button', { name: 'Next level' }).click()
  // level 5: the test must also leave 80 secret bits of the 101 sifted
  await expect(page.locator('#level-title')).toContainText('Level 5 of 5')
  await page.getByRole('slider', { name: 'Test size m' }).fill('22')
  await expect(page.locator('.game-verdict')).toContainText('sifted bits 101 · secret bits left 79')
  await page.getByRole('button', { name: /^Lock in/ }).click()
  await expect(page.locator('.step-note')).toContainText('Only 79 secret bits')
  await page.getByRole('slider', { name: 'Test size m' }).fill('20')
  await page.getByRole('button', { name: /^Lock in/ }).click()
  await expect(page.locator('.game-solved')).toContainText('Solved.')
  await expect(page.getByRole('button', { name: 'Next level' })).toHaveCount(0)
  await expectNoErrors(errors)
})
