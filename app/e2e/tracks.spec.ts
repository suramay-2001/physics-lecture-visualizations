/**
 * Two tracks (W-709-platform §B) on the DEV demo chapter Q0 (`#/709/ch/Q0`, never in a production build: `@dev-only`).
 * The toggle sits beside Story/Read and is independent of it; switching keeps the beat under the centre line; the face
 * tells the track (STIX Two for Formal); `?track=` overrides the stored choice; the choice survives a reload; a 448
 * lecture has no track toggle. Screens (both tracks, the derivation stepping) go to e2e/__screens__/709/ for visual QA.
 *   PW_DEV_PORT=5178 npx playwright test e2e/tracks.spec.ts --project=dev
 */
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

const SCREENS = fileURLToPath(new URL('./__screens__/709/', import.meta.url))
const toggle = (page: Page) => page.getByRole('group', { name: 'Which track' })

const beatAtCentre = (page: Page) =>
  page.evaluate(() => {
    const mid = innerHeight / 2
    for (const el of document.querySelectorAll<HTMLElement>('.story-beat[data-beat], .static-beat[data-beat]')) {
      const r = el.getBoundingClientRect()
      if (r.height && r.top <= mid && r.bottom >= mid) return el.dataset.beat ?? null
    }
    return null
  })

test.describe('@dev-only two tracks on the demo chapter', () => {
  test('the toggle swaps every text, keeps the place and the face tells the track', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('#/709/ch/Q0')
    await expect(toggle(page)).toBeVisible()
    await expect(page.getByRole('group', { name: 'How to read this lecture' })).toBeVisible()
    const b3 = page.locator('.story-beat[data-beat="q0-demo-sphere:b3"]')
    await b3.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b3')
    await expect(b3).toContainText('equally likely')
    await expect(b3.locator('.deriv-steps li')).toHaveCount(3)

    // the rail's copy is in reach on the beat being read: switching there keeps the place (the header's copy is at the
    // top of the page, so reaching it scrolls there first, and switching keeps the top)
    const rail = page.getByRole('group', { name: 'Track for this page' })
    await expect(rail).toBeInViewport()
    await rail.getByRole('button', { name: 'Formal' }).click()
    await expect(page.locator('.lecture')).toHaveAttribute('data-track', 'formal')
    await expect(b3).toContainText('By the Born rule')
    await expect(b3.locator('.deriv-steps li')).toHaveCount(2)
    await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b3')
    await expect(toggle(page).getByRole('button', { name: 'Formal' })).toHaveAttribute('aria-pressed', 'true') // both copies agree
    await page.evaluate(() => document.fonts.ready)
    await expect(b3.locator('.rich').first()).toHaveCSS('font-family', /STIX Two Text/)
    // the stage is shared: the same caption slot, now in the Formal words
    await expect(page.locator('.story[data-unit="q0-demo-sphere"] .stage-caption')).toContainText('P(0)')

    // and back, still on the same beat
    await rail.getByRole('button', { name: 'Ground-up' }).click()
    await expect(page.locator('.lecture')).toHaveAttribute('data-track', 'ground')
    await expect(toggle(page).getByRole('button', { name: 'Ground-up' })).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b3')
    await rail.getByRole('button', { name: 'Formal' }).click()
    await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b3')

    // the choice survives a reload; Story/Read is independent of it
    await page.reload()
    await expect(toggle(page).getByRole('button', { name: 'Formal' })).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Read', exact: true }).click()
    await expect(page.locator('.static-beat[data-beat="q0-demo-sphere:b3"]')).toContainText('By the Born rule')
    await page.getByRole('button', { name: 'Story', exact: true }).click()

    // ?track= overrides the stored choice for that URL; choosing a track drops the override
    await page.goto('#/709/ch/Q0?track=ground')
    await expect(toggle(page).getByRole('button', { name: 'Ground-up' })).toHaveAttribute('aria-pressed', 'true')
    await toggle(page).getByRole('button', { name: 'Formal' }).click()
    await expect(page).toHaveURL(/#\/709\/ch\/Q0$/)
    await toggle(page).getByRole('button', { name: 'Ground-up' }).click()
    await expectNoErrors(errors)
  })

  test('the Formal gloss sentence, and a 448 lecture has no track toggle', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('#/709/ch/Q0?track=formal')
    const gloss = page.locator('.story-beat[data-beat="q0-demo-sphere:b3"] button.gloss[data-gloss="qc-demo-amplitude"]')
    await gloss.scrollIntoViewIfNeeded()
    await gloss.hover()
    await expect(page.locator('.gloss-pop')).toContainText('A coefficient of the state')
    await page.goto('#/lecture/L1')
    await expect(page.locator('.lecture-head h1')).toBeVisible()
    await expect(toggle(page)).toHaveCount(0)
    await expect(page.locator('.lecture')).not.toHaveAttribute('data-track', /./)
    await expectNoErrors(errors)
  })

  test('derivations drive the stage (W-709 #11): stepping and at-rest selection move the live stage, and leaving restores it', async ({ page }) => {
    const errors = collectErrors(page)
    await page.emulateMedia({ reducedMotion: 'reduce' }) // deterministic: no cross-fade to wait out
    await page.goto('#/709/ch/Q0')
    await page.waitForFunction(() => !!(window as unknown as { __stage?: unknown }).__stage)
    // stand on a beat: the DOM centre line (scroll) AND the live track's internal beat index (window.__stage),
    // which can briefly lag the DOM on a freshly (or very quickly) loaded page
    const standOn = async (beatId: string, unitId: string, i: number) => {
      await page.locator(`[data-beat="${beatId}"]`).evaluate((el) => el.scrollIntoView({ block: 'center' }))
      await expect.poll(() => beatAtCentre(page)).toBe(beatId)
      await page.waitForFunction(
        ([u, want]) => (window as unknown as { __stage: { beats: () => Record<string, { beat: number }> } }).__stage.beats()[u as string]?.beat === want,
        [unitId, i] as const,
      )
    }
    const b3 = page.locator('.story-beat[data-beat="q0-demo-sphere:b3"]')
    await standOn('q0-demo-sphere:b3', 'q0-demo-sphere', 2)
    // the bloch readout is one of several in the column (ket labels etc.): check the column's text, not one span
    const readout = page.locator('.story[data-unit="q0-demo-sphere"] .stage-readouts')
    const caption = page.locator('.story[data-unit="q0-demo-sphere"] .stage-caption')
    // the DRAWN VIEW (readout): bare (no measurement axis) vs measured (P(+) ...)
    const drawnBare = async () => {
      await expect(readout).toContainText('pure state')
      await expect(readout).not.toContainText('P(+) along n̂')
    }
    const drawnMeasured = () => expect(readout).toContainText('P(+) along n̂')
    // the CAPTION: the beat's own at rest; a step's own viewCaption while it governs (even when the drawn view
    // happens to match the beat's own, e.g. the last step inherits the same "measured" picture)
    const captionIs = (text: string) => expect(caption).toContainText(text)
    const OWN_CAPTION = 'the chance of 0 is 50'
    const BARE_CAPTION = 'before any measurement axis is drawn'
    const MEASURED_CAPTION = 'Measuring along z picks out the top number'

    // at rest, the beat's own stage shows: the measurement is drawn (P(+) ...), with the beat's own caption
    await drawnMeasured()
    await captionIs(OWN_CAPTION)

    // stepping: line 1 has no measurement drawn yet ("pure state"), its own viewCaption; line 2 draws it again,
    // captioned by ITS OWN viewCaption (not the beat's caption, even though the drawn view now matches it)
    const d = b3.locator('.deriv')
    await d.getByRole('button', { name: 'Step through' }).click()
    await expect(d.locator('[aria-live="polite"]')).toHaveText('Line 1 of 3')
    await drawnBare()
    await captionIs(BARE_CAPTION)
    await d.getByRole('button', { name: 'Next step' }).click()
    await drawnMeasured()
    await captionIs(MEASURED_CAPTION)
    // "Show all" returns to the beat-driven state: the drawn view AND the caption go back to the beat's own
    await d.getByRole('button', { name: 'Show all' }).click()
    await drawnMeasured()
    await captionIs(OWN_CAPTION)

    // at rest, focusing a line (keyboard-accessible: Tab reaches it) selects it and moves the stage the same way
    await d.locator('li').first().focus()
    await drawnBare()
    await captionIs(BARE_CAPTION)
    await d.locator('li').nth(1).focus()
    await drawnMeasured()
    await captionIs(MEASURED_CAPTION)

    // leaving the beat (scrolling away) returns the stage to the beat-driven state, even mid-selection
    await d.locator('li').first().focus()
    await drawnBare()
    await standOn('q0-demo-sphere:b1', 'q0-demo-sphere', 0)
    await standOn('q0-demo-sphere:b3', 'q0-demo-sphere', 2)
    await drawnMeasured() // not "pure state": the selection did not survive leaving
    await captionIs(OWN_CAPTION) // the beat's own caption, not line 1's viewCaption
    await expectNoErrors(errors)
  })

  test('screens: both tracks and the derivation stepping, 1440×900', async ({ page }) => {
    mkdirSync(SCREENS, { recursive: true })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1440, height: 900 })
    for (const track of ['ground', 'formal'] as const) {
      await page.goto('about:blank')
      await page.goto(`#/709/ch/Q0?track=${track}`)
      const b3 = page.locator('.story-beat[data-beat="q0-demo-sphere:b3"]')
      await b3.evaluate((el) => el.scrollIntoView({ block: 'center' }))
      await expect.poll(() => beatAtCentre(page)).toBe('q0-demo-sphere:b3')
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(600)
      await page.screenshot({ path: `${SCREENS}q0-${track}-1440.png` })
      await b3.getByRole('button', { name: 'Step through' }).click()
      await b3.getByRole('button', { name: 'Next step' }).click()
      await page.waitForTimeout(300)
      await page.screenshot({ path: `${SCREENS}q0-${track}-derivation-stepping-1440.png` })
    }
  })
})
