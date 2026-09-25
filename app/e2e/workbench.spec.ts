/**
 * W0 freeze smoke test (@dev-only: the Workbench route exists only in DEV builds). Drives the demo story
 * through `window.__stage`: one WebGL context, views follow the layout, the clue reveal changes the
 * picture, a route round trip keeps the one canvas, and no console errors. W1's story.spec.ts supersedes it.
 *   PW_DEV_PORT=5181 npx playwright test --project=dev   (with `npx vite --port 5181` running)
 */
import { expect, test } from '@playwright/test'

interface StageApi {
  contexts: number
  contextsLost: number
  views: () => { key: string; weight: number; slot: string | null; renders: number }[]
  beats: () => Record<string, { beat: number; revealed: number[] }>
  setU: (unit: string, u: number) => boolean
  reveal: (unit: string, beat: string, on?: boolean) => void
  frame: (key: string) => { state: { shadows?: number; benches?: { theory: { plus: number } }[] } } | null
}
declare global {
  interface Window {
    __stage?: StageApi
  }
}

test('@dev-only demo story on the Workbench: 1 context, layout-driven views, reveal, route round trip', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.setViewportSize({ width: 1000, height: 640 })
  await page.goto('#/dev/stage/demo/demo-story')
  await page.waitForFunction(() => (window.__stage?.views() ?? []).some((v) => v.renders > 2))

  const settle = () => page.waitForTimeout(400)
  expect(await page.evaluate(() => window.__stage!.contexts)).toBe(1)

  // beat 1: lab only
  let views = await page.evaluate(() => window.__stage!.views())
  expect(views.find((v) => v.key.endsWith('lab-r3'))!.weight).toBe(1)
  expect(views.find((v) => v.key.endsWith('hilbert-plane'))!.weight).toBe(0)

  // beat 2 hold: split, both panes drawn
  await page.evaluate(() => window.__stage!.setU('demo-story', 1.5))
  await settle()
  views = await page.evaluate(() => window.__stage!.views())
  expect(views.map((v) => [v.key.split('/')[1], v.slot, v.weight])).toEqual([
    ['lab-r3', 'top', 1],
    ['hilbert-plane', 'bottom', 1],
  ])

  // beat 3: clue holds the question picture until revealed
  await page.evaluate(() => window.__stage!.setU('demo-story', 2.5))
  await settle()
  expect(await page.evaluate(() => window.__stage!.frame('demo-story/hilbert-plane')!.state.shadows)).toBe(0)
  await page.getByRole('button', { name: 'Show me' }).click()
  await page.waitForTimeout(1200)
  expect(await page.evaluate(() => window.__stage!.frame('demo-story/hilbert-plane')!.state.shadows)).toBe(1)
  await expect(page.locator('.wb-text')).toContainText('its square is the probability')

  // route round trip: same canvas, same single context
  await page.goto('#/formulas')
  await settle()
  expect(await page.evaluate(() => window.__stage!.views().length)).toBe(0)
  await page.goto('#/dev/stage/demo/demo-story')
  await page.waitForFunction(() => (window.__stage?.views() ?? []).length === 2)
  await settle()
  expect(await page.evaluate(() => [window.__stage!.contexts, window.__stage!.contextsLost, document.querySelectorAll('canvas').length])).toEqual([1, 0, 1])
  expect(errors).toEqual([])
})
