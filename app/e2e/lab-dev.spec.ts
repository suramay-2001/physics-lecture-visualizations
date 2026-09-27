/**
 * The lab under React StrictMode (dev project only: StrictMode double-invokes effects in development builds). The lab
 * must survive mount → dispose → mount on a FRESH canvas (decisions/lab.md ruling 6): one live engine, one live context,
 * frames that actually draw, and nothing left after leaving. The production build is measured in lab.spec.ts.
 */
import { expect, test } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'dev', 'StrictMode double effects exist only in the dev build')
})

test('@dev-only StrictMode: one engine that draws; leave and come back = a real dispose and a remount that draws', async ({ page }) => {
  const errors = collectErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('#/lab')
  await page.waitForFunction(() => window.__lab?.mounted === true, undefined, { timeout: 30_000 })
  const lab = () => page.evaluate(() => ({ mounts: window.__lab!.mounts, disposals: window.__lab!.disposals, engines: window.__lab!.engines(), live: window.__lab!.live }))
  // StrictMode's first effect is cancelled before its async Babylon import creates anything: no engine leaks from it
  const first = await lab()
  expect(first.mounts - first.disposals).toBe(1)
  expect([first.engines, first.live]).toEqual([1, 1])
  const draws = async () => {
    const before = await page.evaluate(() => window.__lab!.framesDrawn)
    await page.evaluate(() => window.__lab!.setPhi(90))
    await page.waitForFunction((n) => window.__lab!.framesDrawn > n, before, { timeout: 10_000 })
    expect(await page.evaluate(() => window.__lab!.beadScreen())).not.toBeNull()
  }
  await draws()
  // leave: nothing Babylon survives
  await page.evaluate(() => (location.hash = '#/help'))
  await page.waitForFunction(() => window.__lab!.mounted === false)
  expect(await page.evaluate(() => [window.__lab!.engines(), window.__lab!.live])).toEqual([0, 0])
  // come back: a second engine on a FRESH canvas (a released context handed back would draw nothing)
  await page.evaluate(() => (location.hash = '#/lab'))
  await page.waitForFunction(() => window.__lab!.mounted === true, undefined, { timeout: 30_000 })
  const again = await lab()
  expect(again.mounts).toBe(first.mounts + 1)
  expect(again.disposals).toBe(first.disposals + 1)
  expect([again.engines, again.live]).toEqual([1, 1])
  await draws()
  await expectNoErrors(errors)
})
