/**
 * The Blender chapter openers (P3 #9) on the DEV preview route (#/dev/openers). @dev-only: the route exists only
 * in DEV builds until the openers get their place in the course.
 *
 *   PW_DEV_PORT=5178 npx playwright test e2e/openers.spec.ts --project=dev
 *
 * Checks the D §5.3 player contract: scroll drives the film to its last frames, never more than 9 decoded
 * bitmaps (+ the one on screen), no errors, trigger hygiene, and the reduced-motion path fetches no frames.
 */
import { expect, test, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

const URL = '#/dev/openers'
const FRAME_REQUEST = /\/openers\/(hopf|belt)\/\d{4}\.webp$/

async function scrub(page: Page, index: number): Promise<{ frames: number[]; decoded: number[] }> {
  const section = page.locator('section.opener').nth(index)
  const canvas = section.locator('canvas.opener-canvas')
  const { top, height } = await section.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top + scrollY, height: r.height }
  })
  const frames: number[] = []
  const decoded: number[] = []
  // the film follows the viewport centre line: run it from the section top to the section bottom
  const from = top - VIEWPORT_H / 2
  for (let i = 0; i <= 24; i++) {
    await page.evaluate((y) => scrollTo(0, y), from + (height * i) / 24)
    await page.waitForTimeout(120)
    frames.push(Number(await canvas.getAttribute('data-frame')))
    decoded.push(Number(await canvas.getAttribute('data-decoded')))
  }
  return { frames, decoded }
}
const VIEWPORT_H = 900 // playwright.config viewport height

test.describe('@dev-only chapter openers', () => {
  test('scroll scrubs each film to its end, holding at most 10 decoded frames', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(URL)
    await expect(page.locator('section.opener')).toHaveCount(2)
    // frames load after idle, coarse-to-fine; give the local server a moment to deliver them
    await expect.poll(() => page.locator('canvas.opener-canvas').first().getAttribute('data-frame')).not.toBe('-1')
    await page.waitForTimeout(2500)
    for (const i of [0, 1]) {
      const { frames, decoded } = await scrub(page, i)
      expect(Math.max(...frames), `opener ${i} reaches its last frames`).toBeGreaterThanOrEqual(110)
      expect(frames[0], `opener ${i} starts near frame 0`).toBeLessThanOrEqual(8)
      expect(Math.max(...decoded), `opener ${i} decoded bitmaps`).toBeLessThanOrEqual(10)
      // scrolling forward never runs the film backwards by more than a stand-in step
      for (let k = 1; k < frames.length; k++) expect(frames[k] - frames[k - 1]).toBeGreaterThanOrEqual(-8)
    }
    await expectNoErrors(errors)
  })

  test('the caption on screen covers the frame on screen', async ({ page }) => {
    await page.goto(URL)
    const section = page.locator('section.opener').first()
    await expect.poll(() => section.locator('canvas').getAttribute('data-frame')).not.toBe('-1')
    await page.waitForTimeout(2500)
    const ranges = [
      [0, 29],
      [30, 59],
      [60, 119],
    ]
    for (let b = 0; b < 3; b++) {
      await section.locator(`[data-opener-beat="${b}"]`).evaluate((el) => {
        const r = el.getBoundingClientRect()
        scrollTo(0, r.top + scrollY + r.height / 2 - innerHeight / 2)
      })
      await expect(section.locator(`[data-opener-beat="${b}"]`)).toHaveAttribute('data-active', 'true')
      await expect
        .poll(async () => {
          const f = Number(await section.locator('canvas').getAttribute('data-frame'))
          return f >= ranges[b][0] && f <= ranges[b][1]
        })
        .toBe(true)
    }
  })

  test('one opener:* trigger per film, and none left after leaving the route', async ({ page }) => {
    const triggers = () => page.evaluate(() => window.__openers?.triggers() ?? -1)
    await page.goto(URL)
    await expect.poll(triggers).toBe(2)
    for (let i = 0; i < 2; i++) {
      await page.goto('#/help')
      await expect.poll(triggers).toBe(0)
      await page.goto(URL)
      await expect.poll(triggers).toBe(2)
    }
  })

  test('reduced motion: posters and captions, no frame is fetched', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const frameRequests: string[] = []
    page.on('request', (r) => FRAME_REQUEST.test(r.url()) && frameRequests.push(r.url()))
    await page.goto(URL)
    await expect(page.locator('.opener-still img')).toHaveCount(2)
    await expect(page.locator('canvas.opener-canvas')).toHaveCount(0)
    await page.waitForTimeout(2000)
    expect(frameRequests).toEqual([])
    for (const img of await page.locator('.opener-still img').all()) await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBe(1080)
  })
})
