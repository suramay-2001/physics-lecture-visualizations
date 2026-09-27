/**
 * Security smoke on the BUILT app (owner S; S-L1 §4b/§4c, W-L1 §4.5–4.7, decision #11). Preview project only —
 * the CSP <meta> exists only in `vite build` output.
 *   npx vite build && PW_PREVIEW_PORT=5185 npx playwright test --project=preview e2e/security.spec.ts
 * Per route (full load + scroll to the bottom and back):
 *   - 0 `securitypolicyviolation` events (collected from the first byte by an init script) and 0 CSP console errors;
 *   - 0 requests to any origin other than the preview server (data:/blob: are local);
 *   - 0 uncaught page errors.
 * Fonts: every font file comes from /assets/ on the same origin; Chrome's own layout (CDP
 * CSS.getPlatformFontsForNode) renders body, display and mono text with the self-hosted faces, and no glyph of
 * the physics alphabet falls back to "LastResort" (macOS tofu).
 */
import { expect, test, type Page } from '@playwright/test'
import { distState } from '../src/security/distState.ts'

declare global {
  interface Window {
    __csp?: string[]
  }
}

const ROUTES = ['#/', '#/lecture/L1', '#/lecture/L2', '#/lecture/L3', '#/lecture/L4', '#/lecture/L5', '#/lecture/L6', '#/lecture/L7', '#/gate', '#/arcade', '#/map', '#/formulas', '#/help', '#/lab',
  // Physics 709 (second course): its home and pages load lazily with their own stylesheet and faces
  '#/709', '#/709/ch/Q4', '#/709/map', '#/709/arcade', '#/709/formulas', '#/709/help']

// `vite preview` serves whatever dist/ holds: on a missing or stale build, fail once with the reason instead of
// testing old code (round-3 #1; same guard as the vitest dist checks).
const DIST = distState()
test('app/dist is a current production build of this tree (else: run `npm run build` first)', async ({ baseURL }) => {
  expect(baseURL).toBeTruthy() // (project filter lives in beforeEach)
  if (!DIST.ok) throw new Error(DIST.message)
})

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'preview', 'the CSP <meta> exists only in the built app (preview project)')
  test.skip(!DIST.ok && !info.title.startsWith('app/dist is a current'), 'dist/ is not current (see the first test)')
  await page.setViewportSize({ width: 1000, height: 640 })
  await page.addInitScript(() => {
    window.__csp = []
    document.addEventListener('securitypolicyviolation', (e) => window.__csp!.push(`${e.violatedDirective} ← ${e.blockedURI || 'inline'} (${e.sourceFile}:${e.lineNumber})`))
  })
})

function watch(page: Page, origin: string) {
  const foreign: string[] = []
  const errors: string[] = []
  const fonts: string[] = []
  page.on('request', (r) => {
    const u = r.url()
    if (u.startsWith('data:') || u.startsWith('blob:')) return
    if (new URL(u).origin !== origin) foreign.push(u)
    if (r.resourceType() === 'font') fonts.push(u)
  })
  page.on('console', (m) => {
    if (m.type() === 'error' && /Content Security Policy|violates the following/i.test(m.text())) errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  return { foreign, errors, fonts }
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(300, innerHeight * 0.8)
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 40))
    }
    scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 200))
  })
}

for (const route of ROUTES) {
  test(`CSP + network: ${route} — 0 violations, 0 third-party requests`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL!).origin
    const w = watch(page, origin)
    await page.goto(`./?security=${encodeURIComponent(route)}${route}`, { waitUntil: 'load' })
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1)
    await page.waitForLoadState('networkidle')
    await scrollThrough(page)
    await page.waitForLoadState('networkidle')
    const violations = await page.evaluate(() => window.__csp ?? [])
    console.log(`${route}: ${violations.length} CSP violations, ${w.foreign.length} third-party requests, ${w.fonts.length} font files`)
    expect(violations).toEqual([])
    expect(w.errors).toEqual([])
    expect(w.foreign).toEqual([])
  })
}

test('harness self-check: an injected <style> and a remote image ARE reported', async ({ page, baseURL }) => {
  const w = watch(page, new URL(baseURL!).origin)
  await page.goto('./?security=selfcheck#/help', { waitUntil: 'load' })
  await page.evaluate(() => {
    const s = document.createElement('style')
    s.textContent = '.x{color:red}'
    document.head.appendChild(s)
    new Image().src = 'https://example.com/pixel.png'
  })
  await expect.poll(() => page.evaluate(() => window.__csp?.length ?? 0)).toBeGreaterThanOrEqual(2)
  const v = await page.evaluate(() => window.__csp!)
  expect(v.some((x) => x.startsWith('style-src-elem'))).toBe(true)
  expect(v.some((x) => x.startsWith('img-src') && x.includes('example.com'))).toBe(true)
  // the request listener sees the ATTEMPT even though CSP blocks it — so the route tests count attempts too
  expect(w.foreign).toEqual(['https://example.com/pixel.png'])
})

test('fonts: self-hosted files, rendered by Chrome with the intended faces, no tofu', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin
  const w = watch(page, origin)
  await page.goto('./?security=fonts#/', { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState('networkidle')

  // every font file is ours
  expect(w.fonts.length).toBeGreaterThan(0)
  for (const f of w.fonts) expect(f).toMatch(new RegExp(`^${origin}/assets/.+\\.(woff2?|ttf)$`))
  const loaded = await page.evaluate(() => [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')))])
  for (const fam of ['Barlow Condensed', 'Literata Variable', 'Martian Mono']) expect(loaded).toContain(fam)

  // what Chrome actually used to draw the text (not just what CSS asked for)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('DOM.enable')
  await cdp.send('CSS.enable')
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 })
  const usedFonts = async (selector: string) => {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector })
    expect(nodeId, selector).toBeGreaterThan(0)
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId })
    return fonts as { familyName: string; postScriptName: string; isCustomFont: boolean; glyphCount: number }[]
  }
  const EXPECT: [string, RegExp][] = [
    ['.hero-lede', /^Literata/],
    ['.home h1', /^Barlow Condensed/],
    ['.station-progress', /^Martian Mono/],
  ]
  for (const [sel, face] of EXPECT) {
    const fonts = await usedFonts(sel)
    const main = fonts.reduce((a, b) => (b.glyphCount > a.glyphCount ? b : a))
    console.log(`${sel}: ${fonts.map((f) => `${f.familyName}${f.isCustomFont ? ' (web font)' : ''} ×${f.glyphCount}`).join(', ')}`)
    expect(main.familyName, sel).toMatch(face)
    expect(main.isCustomFont, sel).toBe(true)
    expect(fonts.filter((f) => !f.isCustomFont), `${sel} fell back to a system font`).toEqual([])
  }

  // the physics alphabet in the body face: in Literata, or a clean system fallback — never LastResort (tofu)
  const GLYPHS = ['ψ', 'θ', 'φ', 'ħ', 'ℂ', 'ℝ', '⟨', '⟩', '₀', '₁', '₂', '₃', '±', '√', '·', '−', '½']
  await page.evaluate((gs) => {
    const box = document.createElement('div')
    box.id = 'glyph-probe'
    box.style.fontFamily = 'var(--font-body)'
    for (const g of gs) {
      const s = document.createElement('span')
      s.textContent = g
      box.appendChild(s)
    }
    document.body.appendChild(box)
  }, GLYPHS)
  // unicode-range subsets (e.g. Literata Greek) load only once a glyph needs them: let them arrive first
  await page.evaluate(async () => {
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    await document.fonts.ready
  })
  await page.waitForLoadState('networkidle')
  const { root: root2 } = await cdp.send('DOM.getDocument', { depth: -1 })
  const report: string[] = []
  for (let i = 0; i < GLYPHS.length; i++) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root2.nodeId, selector: `#glyph-probe > span:nth-child(${i + 1})` })
    const { fonts } = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId })) as { fonts: { familyName: string }[] }
    const names = fonts.map((f) => f.familyName)
    report.push(`${GLYPHS[i]}:${names.join('+')}`)
    expect(names.join(','), GLYPHS[i]).not.toMatch(/LastResort/i)
    expect(names.length, GLYPHS[i]).toBeGreaterThan(0)
  }
  console.log(`glyphs: ${report.join('  ')}`)
})
