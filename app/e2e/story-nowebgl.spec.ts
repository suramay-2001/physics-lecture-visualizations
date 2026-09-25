/**
 * No WebGL (W-L1 §2.7, §2.9): Chrome with 3D APIs disabled. `WebGLRenderingContext` still exists, so the
 * page asks for the stage host; the renderer then fails to create a context, the `stage-host` boundary
 * flips `contextLost`, and every story falls back to StaticStory. A separate file because launch options
 * need their own worker.
 *   PW_DEV_PORT=5182 npx playwright test e2e/story-nowebgl.spec.ts --project=dev
 */
import { expect, test } from '@playwright/test'
import { collectErrors } from './helpers.ts'

test.use({ launchOptions: { args: ['--disable-3d-apis'] } })

test('@dev-only a failed WebGL context creation falls back to StaticStory; the page keeps working', async ({ page }) => {
  const errors = collectErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('#/dev/lecture/demo')
  await expect(page.locator('.static-story')).toHaveCount(2, { timeout: 10_000 })
  await expect(page.locator('.story[data-mode="live"]')).toHaveCount(0)
  const clue = page.locator('.static-beat[data-beat="demo-story:b4"]')
  await clue.getByRole('button', { name: 'Show me' }).click()
  await expect(clue.getByText('its square is the probability')).toBeVisible()
  // the only console errors are the caught creation failure (logged in DEV by React and the boundary)
  // the fallback came through the boundary (the cheap probe saw WebGL; context creation failed)
  expect(await page.evaluate(() => typeof WebGLRenderingContext)).toBe('function')
  expect(errors.length).toBeGreaterThan(0)
  const unexpected = errors.filter((e) => !/WebGL|IslandBoundary|stage-host|error occurred in|THREE/i.test(e))
  expect(unexpected, errors.join('\n')).toEqual([])
})
