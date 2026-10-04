/**
 * Physics 709 as a second course (W-709-platform §A/§D). Runs in both projects.
 *   PW_PREVIEW_PORT=5186 npx playwright test e2e/course709.spec.ts --project=preview
 * The switcher both ways and back; the 709 home's descent (six plates, twelve Parts, the written chapters linked and
 * every other chapter planned); the 709 Map (the written chapters' stations and their dashed links into Spin Lab's map);
 * the Arcade / Formulas / Help stubs and a planned chapter; the #/448 alias; a trip back to 448 that lands where the
 * switcher says; 0 console errors throughout. Screenshots of the 709 home and the open
 * switcher (1440×900 and 390×844, light and dark) go to e2e/__screens__/709/ (git-ignored) for visual QA.
 */
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

const SCREENS = fileURLToPath(new URL('./__screens__/709/', import.meta.url))

const switcher = (page: Page) => page.getByRole('button', { name: /^Course: / })
const switchPanel = (page: Page) => page.getByRole('region', { name: 'Switch course' })
const course = (page: Page) => page.evaluate(() => document.documentElement.dataset.course)

async function switchTo(page: Page, name: RegExp) {
  await switcher(page).click()
  await expect(switchPanel(page)).toBeVisible()
  await switchPanel(page).getByRole('link', { name }).click()
}

test('switcher: 448 → 709 → 448 → 709, and the document takes each course’s identity', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/')
  await expect(page.locator('.home h1')).toBeVisible()
  expect(await course(page)).toBe('sl448')
  await expect(switcher(page)).toHaveAttribute('aria-expanded', 'false')
  await expect(switcher(page)).toHaveAccessibleName('Course: Physics 448, Spin Lab. Switch course')

  // a disclosure: opens on click, focus moves into it, Escape closes and returns focus
  await switcher(page).click()
  await expect(switchPanel(page)).toBeVisible()
  await expect(switchPanel(page).getByRole('link', { name: 'Physics 448 · Spin Lab' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(switchPanel(page)).toHaveCount(0)
  await expect(switcher(page)).toBeFocused()

  await switchTo(page, /^Physics 709 · Quantum computing$/)
  await expect(page).toHaveURL(/#\/709$/)
  await expect(page.locator('#cr-home-h1')).toContainText('Ten millikelvin.')
  expect(await course(page)).toBe('qc709')
  await expect(page).toHaveTitle('Spin Lab — Physics 709')
  // navy chrome in both schemes; the nav speaks 709's words
  await expect(page.locator('.topbar')).toHaveCSS('background-color', 'rgb(11, 21, 48)')
  await expect(page.getByRole('button', { name: /^Chapters/ })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Map', exact: true })).toHaveAttribute('href', '#/709/map')
  await expect(page.getByRole('link', { name: 'Physics 709 home' })).toHaveAttribute('href', '#/709')

  await switchTo(page, /^Physics 448 · Spin Lab$/)
  await expect(page).toHaveURL(/#\/$/)
  await expect(page.locator('.home h1')).toContainText('Two spots.')
  expect(await course(page)).toBe('sl448')
  await expect(page).toHaveTitle('Spin Lab — Physics 448')
  await expect(page.getByRole('button', { name: /^Lectures/ })).toBeVisible()

  // and back once more, from a 448 lecture page this time
  await page.goto('#/lecture/L1')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  await switchTo(page, /^Physics 709 · Quantum computing$/)
  await expect(page.locator('#cr-home-h1')).toBeVisible()
  expect(await course(page)).toBe('qc709')
  await expectNoErrors(errors)
})

/** 709 chapters written so far (content/qc709/meta.generated.ts): linked from the home and the panel; the rest are planned. */
const WRITTEN = ['F1', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q11']

test('709 home: the descent lists six plates, twelve Parts and every chapter of the map; written ones linked, the rest planned', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/709')
  const rows = page.locator('.cr-plate-row')
  await expect(rows).toHaveCount(6)
  await expect(page.locator('.cr-temp [aria-hidden="true"]')).toHaveText(['300 K', '50 K', '4 K', '800 mK', '100 mK', '10 mK'])
  await expect(page.locator('.cr-part-num')).toHaveText(['Part F', 'Part I', 'Part II', 'Part III', 'Part IV', 'Part V', 'Part VI', 'Part VII', 'Part VIII', 'Part IX', 'Part X', 'Part XI'])
  // Foundations and the QM review share the 300 K top flange
  await expect(rows.first().locator('.cr-part-num')).toHaveText(['Part F', 'Part I'])
  const chapters = page.locator('.cr-ch')
  await expect(chapters).toHaveCount(35)
  await expect(page.locator('.cr-ch[data-state="planned"]')).toHaveCount(35 - WRITTEN.length)
  // planned chapters are listed, not linked; a written one links to its page (never visited here: state "new")
  await expect(page.locator('.cr-ch a')).toHaveCount(WRITTEN.length)
  await expect(page.locator('.cr-ch[data-state="new"] a .cr-ch-id')).toHaveText(WRITTEN)
  await expect(page.locator('.cr-ch a').first()).toHaveAttribute('href', `#/709/ch/${WRITTEN[0]}`)
  await expect(chapters.first().locator('.cr-ch-id')).toHaveText('F1')
  await expect(chapters.last().locator('.cr-ch-id')).toHaveText('Q27')
  await expect(page.locator('.cr-ch[data-state="planned"] .cr-ch-state').first()).toHaveText('planned')
  await expect(page.locator('.cr-chip-label')).toContainText('The qubit chip.')

  // the Cryostat faces: Archivo for display, Atkinson Hyperlegible Next for the body (self-hosted, loaded for 709)
  await page.evaluate(() => document.fonts.ready)
  await expect.poll(() => page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')))).toEqual(
    expect.arrayContaining(['Archivo Variable', 'Atkinson Hyperlegible Next Variable']),
  )
  await expect(page.locator('#cr-home-h1')).toHaveCSS('font-family', /^"Archivo Variable"/)

  // the topbar's chapter panel: Foundations, then Chapters; the written ones link, the others are planned
  const menu = page.getByRole('button', { name: /^Chapters/ })
  await menu.click()
  const panel = page.getByRole('region', { name: 'Chapters' })
  await expect(panel.locator('.panel-group')).toHaveText(['Foundations', 'Chapters'])
  await expect(panel.locator('[data-status="planned"]')).toHaveCount(35 - WRITTEN.length)
  await expect(panel.locator('[data-status="built"] a .panel-num')).toHaveText(WRITTEN)
  // focus moves into the panel: its first link, or the panel itself while its lazy list is still loading
  await expect.poll(() => panel.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(menu).toBeFocused()
  await expectNoErrors(errors)
})

test('709 formulas and help stubs render; planned and unknown chapters answer; the #/448 alias redirects', async ({ page }) => {
  const errors = collectErrors(page)
  for (const [route, h1] of [
    ['#/709/formulas', 'The boards'],
    ['#/709/help', 'Getting unstuck'],
  ]) {
    await page.goto(route)
    await expect(page.locator('main h1')).toHaveText(h1)
    await expect(page.locator('.coming-709')).toContainText('Coming with the first chapters')
    await expect(page.locator('.coming-709 a')).toHaveAttribute('href', '#/709')
    expect(await course(page)).toBe('qc709')
  }
  await page.goto('#/709/ch/Q10')
  await expect(page.locator('main h1')).toHaveText('Entanglement, no signalling and Bell’s inequality')
  await expect(page.locator('.chapter-planned')).toContainText('Planned, not written yet')
  await expect(page.locator('.planned-plate')).toContainText('4 K')
  await expect(page.locator('.chapter-planned .eyebrow').first()).toHaveText('Part IV · Entanglement · Chapter Q10')
  await page.goto('#/709/ch/Q99')
  await expect(page.locator('main h1')).toContainText('No chapter called')
  // a 448 game is not a 709 game, and a 709 id is not a 448 lecture
  await page.goto('#/709/arcade/route-the-beam')
  await expect(page.locator('main h1')).toContainText('No game called')
  await page.goto('#/lecture/Q3')
  await expect(page.locator('main h1')).toContainText('No lecture called')
  // the alias keeps the anchor and lands on the canonical 448 URL
  await page.goto('#/448/lecture/L2#l2-inner-product')
  await expect(page).toHaveURL(/#\/lecture\/L2#l2-inner-product$/)
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  await expect(page.locator('#l2-inner-product')).toBeInViewport()
  expect(await course(page)).toBe('sl448')
  await expectNoErrors(errors)
})

test('709 arcade: grouped by chapter; Route the beam and Spot the error are playable with an engine verdict and a link back to the unit', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/709/arcade')
  await expect(page.locator('main h1')).toHaveText('Arcade')
  // F1 trains only Spot the error here; Q1 trains both formats (its q1-sequences unit is the Route the beam level)
  await expect(page.locator('#arcade-F1 .arcade-card')).toHaveCount(1)
  await expect(page.locator('#arcade-Q1 .arcade-card')).toHaveCount(2)
  await expect(page.locator('#arcade-F1')).not.toContainText('ahead of the course')
  await expect(page.locator('#arcade-Q1')).not.toContainText('ahead of the course')

  // Route the beam: the one level (qc-sixteenth), solved by the engine at z, x, z, x
  await page.goto('#/709/arcade/qc-route-the-beam')
  await expect(page.locator('#level-title')).toContainText('One sixteenth')
  await expect(page.locator('.game-verdict')).toContainText('target 6.3%')
  await page.getByRole('button', { name: 'Add device' }).click() // z → x
  await page.getByRole('button', { name: 'Add device' }).click() // → x, x
  await page.getByRole('radiogroup', { name: 'Device 3 axis' }).getByRole('radio', { name: 'z' }).click()
  await page.getByRole('button', { name: 'Add device' }).click() // → z, x
  await expect(page.locator('.game-verdict')).toContainText('solved')
  await expect(page.locator('.game-solved-trains a.trains-chip')).toHaveAttribute('href', '#/709/ch/Q1#q1-sequences')

  // Spot the error: qc-root-minus-4, wrong step 2; the correction states the engine's number, and links back to F1
  await page.goto('#/709/arcade/qc-spot-the-error')
  await expect(page.locator('#level-title')).toContainText('The square root of −4')
  await page.getByRole('button', { name: /^Step 1/ }).click()
  await expect(page.locator('.step-note')).toHaveText('This step holds. Look again.')
  await page.getByRole('button', { name: /^Step 2/ }).click()
  await expect(page.getByRole('status')).toContainText('A negative number squared is positive')
  await expect(page.locator('.game-solved-trains a.trains-chip')).toHaveAttribute('href', '#/709/ch/F1#f1-number-line')
  await page.locator('.game-solved-trains a.trains-chip').click()
  await expect(page).toHaveURL(/#\/709\/ch\/F1#f1-number-line$/)
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  await expectNoErrors(errors)
})

test('709 map: the written chapters’ stations, and a dashed link from each Spin Lab twin to its station on 448’s map', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/709/map')
  await expect(page.locator('main h1')).toHaveText('Concept map')
  expect(await course(page)).toBe('qc709')
  // F1's line: five stations, each linking into its unit
  const f1 = page.locator('#map709-F1')
  await expect(f1.locator('a.map-station')).toHaveCount(5)
  await expect(f1.locator('[data-concept="qc-imaginary-unit"]')).toHaveAttribute('href', '#/709/ch/F1#f1-number-line')
  await expect(f1.locator('[data-concept="qc-phase"]')).toHaveAttribute('href', '#/709/ch/F1#f1-phase')
  // ruling 6 (qc709-pilots.md): the four number stations are Spin Lab's "complex numbers as turns" (Unit 2.3); the
  // phase station only links to 448 ideas, so it has no twin edge
  const twins = f1.locator('a.map-twin')
  await expect(twins).toHaveCount(4)
  await expect(twins).toHaveText(Array(4).fill('met in Spin Lab 2.3'))
  await expect(f1.locator('li:has([data-concept="qc-phase"]) .map-twin')).toHaveCount(0)
  expect(await twins.first().evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe('dashed')
  await expect(twins.first()).toHaveAttribute('href', '#/map#map-L2')
  await expect(twins.first()).toHaveAttribute('data-twin', 'complex-numbers')
  // following it lands on Spin Lab's map, on the line that holds the twin station
  await twins.first().click()
  await expect(page).toHaveURL(/#\/map#map-L2$/)
  await expect(page.locator('#map-L2')).toBeInViewport()
  await expect(page.locator('#map-L2 [data-concept="complex-numbers"]')).toBeVisible()
  await expect.poll(() => course(page)).toBe('sl448')
  await expectNoErrors(errors)
})

test('a trip back to 448 lands where the switcher says', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('#/lecture/L3')
  await expect(page.locator('.lecture-head h1')).toBeVisible()
  // read on into the second unit
  const stations = page.locator('.route-station > a')
  await stations.nth(1).click()
  await expect(stations.nth(1)).toHaveAttribute('aria-current', 'location')
  const unit = (await stations.nth(1).getAttribute('href'))!.slice(1)
  const unitTitle = (await stations.nth(1).innerText()).replace(/^3\.2\s*/, '').trim()

  await switchTo(page, /^Physics 709 · Quantum computing$/)
  await expect(page.locator('#cr-home-h1')).toBeVisible()

  await switcher(page).click()
  const back = switchPanel(page).locator('[data-course="sl448"] .co-continue')
  await expect(back).toHaveText(`Continue at Lecture 3, unit 3.2 · ${unitTitle}`)
  await expect(back).toHaveAttribute('href', `#/lecture/L3#${unit}`)
  await back.click()
  await expect(page).toHaveURL(new RegExp(`#/lecture/L3#${unit}$`))
  await expect(page.locator(`#${unit}`)).toBeInViewport()
  expect(await course(page)).toBe('sl448')
  // no 709 chapter has been opened in this session, so 709 offers no "continue at"
  await switcher(page).click()
  await expect(switchPanel(page).locator('[data-course="qc709"] .co-continue')).toHaveCount(0)
  await expectNoErrors(errors)
})

test('decor video (14-decor-clip): present and aria-hidden on the home descent at 1440, poster-only under reduced motion and at 390, and the chapter opener carries its plate’s clip', async ({ page }) => {
  const errors = collectErrors(page)

  // 1440, normal motion: the three decor rows (300 K, 50 K, 4 K) each mount a muted, looping, aria-hidden <video>
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('#/709')
  const decorRows = page.locator('.cr-plate-row[data-decor="true"]')
  await expect(decorRows).toHaveCount(3)
  const videos = decorRows.locator('video')
  await expect(videos).toHaveCount(3)
  const firstVideo = videos.first()
  await expect(firstVideo).toHaveAttribute('aria-hidden', 'true')
  await expect(firstVideo).toHaveAttribute('preload', 'none')
  await expect(firstVideo).toHaveAttribute('poster', /\/decor\/qc709\/plate-(300k|50k|4k)\.webp$/)
  await expect(firstVideo).toHaveJSProperty('muted', true)
  await expect(firstVideo).toHaveJSProperty('loop', true)
  await expect(firstVideo).toHaveJSProperty('playsInline', true)

  // reduced motion: the poster only — no <video> element in the DOM at all
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('#/709')
  await expect(page.locator('.cr-plate-row[data-decor="true"] video')).toHaveCount(0)
  await expect(page.locator('.cr-plate-row[data-decor="true"] img.decor-video-poster')).toHaveCount(3)
  await page.emulateMedia({ reducedMotion: 'no-preference' })

  // 390: below the live stage's own 900 px floor (stage/useLiveStage.ts WIDE_QUERY) — no <video> element either
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('#/709')
  await expect(page.locator('.cr-plate-row[data-decor="true"] video')).toHaveCount(0)
  await expect(page.locator('.cr-plate-row[data-decor="true"] img.decor-video-poster')).toHaveCount(3)

  // the chapter opener (F1, Part F: 300 K plate): the same clip, behind the header, chrome-styled (has-decor)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('#/709/ch/F1')
  await expect(page.locator('.lecture-head.lecture-opener.has-decor')).toHaveCount(1)
  const openerVideo = page.locator('.lecture-opener.has-decor video')
  await expect(openerVideo).toHaveCount(1)
  await expect(openerVideo).toHaveAttribute('aria-hidden', 'true')
  await expect(openerVideo).toHaveAttribute('poster', /plate-300k\.webp$/)
  await expect(page.locator('.lecture-head h1')).toBeVisible() // the header's own reading content still renders, above the decor

  await expectNoErrors(errors)
})

test('screens for visual QA: the 709 home and the open switcher, 1440×900 and 390×844, light and dark', async ({ page }) => {
  mkdirSync(SCREENS, { recursive: true })
  const errors = collectErrors(page)
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
    for (const [w, h] of [
      [1440, 900],
      [390, 844],
    ]) {
      await page.setViewportSize({ width: w, height: h })
      await page.goto('about:blank') // a fresh document, so the full-page capture measures this page alone
      await page.goto('#/709')
      await expect(page.locator('.cr-plate-row')).toHaveCount(6)
      await page.evaluate(() => document.fonts.ready)
      // no horizontal page scroll at any width
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
      await page.screenshot({ path: `${SCREENS}home-${w}-${scheme}.png`, fullPage: true })
      await switcher(page).click()
      await expect(switchPanel(page)).toBeVisible()
      await page.screenshot({ path: `${SCREENS}switcher-${w}-${scheme}.png` })
      await page.keyboard.press('Escape')
      // the 448 side of the same switcher
      await page.goto('#/')
      await expect(page.locator('.home h1')).toBeVisible()
      await switcher(page).click()
      await page.screenshot({ path: `${SCREENS}switcher448-${w}-${scheme}.png` })
      await page.keyboard.press('Escape')
    }
  }
  await expectNoErrors(errors)
})
