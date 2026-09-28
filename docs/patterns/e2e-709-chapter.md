# Pattern: an e2e spec for a second course

Real example (trimmed), `app/e2e/course709.spec.ts`:

```ts
import { expect, test, type Page } from '@playwright/test'
import { collectErrors, expectNoErrors } from './helpers.ts'

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
  expect(await course(page)).toBe('sl448')

  await switchTo(page, /^Physics 709 · Quantum computing$/)
  await expect(page).toHaveURL(/#\/709$/)
  expect(await course(page)).toBe('qc709')
  await expect(page).toHaveTitle('Spin Lab — Physics 709')
  // navy chrome in BOTH colour schemes — a literal computed-style check, not a class-name check
  await expect(page.locator('.topbar')).toHaveCSS('background-color', 'rgb(11, 21, 48)')

  await switchTo(page, /^Physics 448 · Spin Lab$/)
  await expect(page).toHaveURL(/#\/$/)
  expect(await course(page)).toBe('sl448')
  expectNoErrors(errors)
})
```

## What a second-course spec must cover, beyond a single-course one

1. **The switcher, both directions**, and that `document.documentElement.dataset.course` (every Cryostat CSS
   rule keys off it — `docs/specs/design-cryostat-709.md`) actually flips, not just the URL.
2. **A literal computed-style assertion** for a "chrome stays navy in both schemes" claim
   (`toHaveCSS('background-color', 'rgb(...)')`) — a class/token-name assertion alone misses a specificity bug.
3. **Course-specific page titles and headings** (`toHaveTitle`, a course-specific `h1` id).
4. **A round trip**: 448 → 709 → 448 → 709 in one test, not just "can reach 709" — this is what catches state
   left over from the first course leaking into the second.
5. **0 console errors across the whole trip** (`collectErrors`/`expectNoErrors`).
6. Screenshots into `e2e/__screens__/709/` (git-ignored), both viewport sizes and both colour schemes, for
   `09-visual-qa` to consume.

## Route, security and port discipline

- `security.spec.ts` ROUTES gains every 709 route: 0 CSP violations, 0 third-party requests, same as 448.
- The **whole existing 448 e2e suite must pass completely unchanged** after any 709 platform commit — the real
  regression gate is `08-merge-gate` running the full suite, not a separate "448 still works" spec.
- A chapter's own story/reveal coverage (both tracks) is a throwaway QA spec (`09-visual-qa`), not a permanent
  e2e file — `course709.spec.ts` stays about the *platform* (switcher, home, map, round trip), not one chapter.
- Playwright starts one webServer per run, keyed off `argv` containing "preview". A worktree agent runs the
  **preview** project only, on its assigned port; the orchestrator runs **dev** separately after merging. Never
  run both projects in one invocation.
