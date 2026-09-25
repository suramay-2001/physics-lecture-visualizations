/**
 * "No runtime third party" gate (S-L1 §4c/§4d/§4i.5, W-L1 §4.7; owner S).
 *
 * 1. Source rules (always run): no drei helpers whose defaults fetch from CDNs (<Environment preset>, <Text> /
 *    troika, Cloud, matcap/normal textures, KTX2, FaceLandmarker), no useGLTF without `false, false`, no remote
 *    URLs in src except the documented reading links in content/refs.ts.
 * 2. Build rules (run when app/dist exists — `npx vite build` first): index.html is the CSP'd shell with external
 *    module scripts only; HTML/CSS reference no third-party origin at all; JS may only CONTAIN the documented
 *    inert origins below (library error-message links, XML namespaces) plus the content's reading links; no CDN
 *    host or path (Google Fonts, gstatic Draco, githack HDRIs, jsdelivr, unpkg, Babylon) appears anywhere; no
 *    absolute local paths (/Users/…) leak into any built file.
 * The Playwright spec e2e/security.spec.ts is the runtime twin (0 non-self requests, 0 CSP violations).
 */
import { describe, expect, it } from 'vitest'
import { APP_DIR, fs, path, walk } from './node'

const SRC = import.meta.glob<string>('/src/**/*.{ts,tsx,css}', { query: '?raw', import: 'default', eager: true })
const DIST = path.join(APP_DIR, 'dist')
const HAS_DIST = fs.existsSync(path.join(DIST, 'index.html'))

/** Hosts and paths that mean "fetches from a CDN / tracker". Never allowed in src or dist, in any file type. */
const BANNED = [
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /www\.gstatic\.com/, // drei useGLTF Draco decoder default
  /\/draco\/versioned\/decoders/,
  /githack\.com/, // drei Environment presets, Cloud, NormalTexture
  /drei-assets/,
  /cdn\.jsdelivr\.net/, // troika font resolver, KTX2/basis, matcaps, mediapipe
  /unicode-font-resolver/,
  /unpkg\.com/,
  /cdnjs\.cloudflare\.com/,
  /cdn\.babylonjs\.com/,
  /esm\.sh|cdn\.skypack\.dev|jspm\.io/,
  /storage\.googleapis\.com/,
  /googletagmanager\.com|google-analytics\.com|plausible\.io|segment\.(io|com)|sentry\.io|hotjar\.com/,
]

/**
 * Origins that may appear INSIDE bundled JS because a library carries them as inert strings (never fetched).
 * Adding one needs a reason and S sign-off; the Playwright network log proves they are never requested.
 */
const INERT_JS_ORIGINS: Record<string, string> = {
  'http://www.w3.org': 'XML namespaces (SVG/MathML/XLink) used by React, KaTeX and three',
  'https://react.dev': 'React error-decoder links in thrown error messages',
  'https://reactrouter.com': 'react-router warning messages',
  'http://localhost': 'react-router parses relative URLs against a dummy http://localhost base',
  'https://github.com': 'issue/licence links in error messages and comments (three, r3f, GSAP)',
  'https://opencollective.com': 'r3f/drei sponsor comment',
  'https://jcgt.org': 'citation in a three.js shader comment',
  'https://docs.pmnd.rs': 'r3f error messages',
  'https://gsap.com': 'GSAP licence/help link in a comment',
}

const ORIGIN = /\bhttps?:\/\/[a-z0-9.-]+(?::\d+)?/gi
const originsIn = (text: string) => [...new Set((text.match(ORIGIN) ?? []).map((o) => o.toLowerCase()))]
const read = (f: string) => fs.readFileSync(f, 'utf8')

/** The reading links authored in content (RefList renders them as <a rel="noreferrer">); documented in content/refs.ts. */
const CONTENT_LINK_ORIGINS = new Set(
  Object.entries(SRC)
    .filter(([f]) => f.startsWith('/src/content/') && !/\.test\.tsx?$/.test(f))
    .flatMap(([, t]) => originsIn(t)),
)

describe('source rules (src/**)', () => {
  const files = Object.entries(SRC).filter(([f]) => !/\.(test|spec)\.tsx?$/.test(f) && !f.startsWith('/src/security/'))

  it('no CDN hosts or tracker hosts anywhere in app code', () => {
    const hits = files.flatMap(([f, t]) => BANNED.filter((re) => re.test(t)).map((re) => `${f}: ${re}`))
    expect(hits).toEqual([])
  })

  it('remote URLs appear only in content (the documented reading links)', () => {
    const hits = files
      .filter(([f]) => !f.startsWith('/src/content/'))
      .flatMap(([f, t]) => originsIn(t).filter((o) => o !== 'http://www.w3.org').map((o) => `${f}: ${o}`))
    expect(hits).toEqual([])
    expect([...CONTENT_LINK_ORIGINS].every((o) => o.startsWith('https://'))).toBe(true)
  })

  it('no drei helpers whose defaults fetch from a CDN', () => {
    const BAD_DREI = /\b(Text|Cloud|Clouds|FaceLandmarker|useMatcapTexture|MatcapTexture|useNormalTexture|NormalTexture|useKTX2|Ktx2|useEnvironment)\b/
    const hits: string[] = []
    for (const [f, t] of files) {
      for (const m of t.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]@react-three\/drei['"]/g)) {
        const names = m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0])
        for (const n of names) if (BAD_DREI.test(n) && n.length) hits.push(`${f}: ${n}`)
      }
      if (/<Environment\b[^>]*\bpreset\s*=/.test(t)) hits.push(`${f}: <Environment preset=…>`)
      if (/\buseGLTF(\.preload)?\s*\(/.test(t) && /\buseGLTF(\.preload)?\s*\((?![^)]*,\s*false\s*,\s*false)/.test(t)) hits.push(`${f}: useGLTF without (url, false, false)`)
    }
    expect(hits).toEqual([])
  })
})

describe.skipIf(!HAS_DIST)('build rules (app/dist)', () => {
  const files = HAS_DIST ? walk(DIST, (f) => /\.(html|css|js|mjs|json|svg|txt|webmanifest|map)$/.test(f) || f.endsWith('_headers')) : []
  const rel = (f: string) => path.relative(DIST, f)
  const html = HAS_DIST ? read(path.join(DIST, 'index.html')) : ''

  it('index.html: CSP meta first in <head>, charset within 1024 bytes, external module scripts only, no inline style', () => {
    expect(html).toMatch(/<head>\s*<meta http-equiv="Content-Security-Policy" content="default-src/)
    expect(html.indexOf('<meta charset')).toBeGreaterThan(0)
    expect(new TextEncoder().encode(html.slice(0, html.indexOf('<meta charset'))).length).toBeLessThan(1024)
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    expect(scripts.length).toBeGreaterThan(0)
    for (const [, attrs, body] of scripts) {
      expect(attrs).toMatch(/type="module"/)
      expect(attrs).toMatch(/src="\.\/assets\/[^"]+\.js"/)
      expect(body.trim()).toBe('')
    }
    expect(html).not.toMatch(/<style\b/)
    expect(html).not.toMatch(/\son[a-z]+\s*=/i)
    expect(html).not.toMatch(/style="/)
  })

  it('no CDN / tracker host or path in any built file', () => {
    const hits = files.flatMap((f) => {
      const t = read(f)
      return BANNED.filter((re) => re.test(t)).map((re) => `${rel(f)}: ${re}`)
    })
    expect(hits).toEqual([])
  })

  it('HTML and CSS reference no third-party origin (only XML namespaces)', () => {
    const hits = files
      .filter((f) => /\.(html|css|svg)$/.test(f))
      .flatMap((f) => originsIn(read(f)).filter((o) => o !== 'http://www.w3.org').map((o) => `${rel(f)}: ${o}`))
    expect(hits).toEqual([])
  })

  it('JS contains only documented origins (inert library strings + content reading links)', () => {
    const allowed = new Set([...Object.keys(INERT_JS_ORIGINS), ...CONTENT_LINK_ORIGINS])
    const hits = files
      .filter((f) => /\.m?js$/.test(f))
      .flatMap((f) => originsIn(read(f)).filter((o) => !allowed.has(o)).map((o) => `${rel(f)}: ${o}`))
    expect(hits).toEqual([])
  })

  it('no absolute local paths leak into the build (privacy, S-01)', () => {
    const hits = files.filter((f) => /\/Users\/[^/\s"']+|\/home\/[a-z][^/\s"']*\/|[A-Z]:\\Users\\/.test(read(f))).map(rel)
    expect(hits).toEqual([])
  })

  it('fonts are bundled locally (no remote @font-face)', () => {
    const css = files.filter((f) => f.endsWith('.css')).map(read).join('\n')
    const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? []
    expect(faces.length).toBeGreaterThan(20)
    for (const family of ['Barlow Condensed', 'Literata Variable', 'Martian Mono', 'KaTeX_Main'])
      expect(faces.some((f) => f.includes(family)), family).toBe(true)
    for (const f of faces) for (const u of f.matchAll(/url\(([^)]+)\)/g)) expect(u[1]).toMatch(/^["']?(\.\/|\/assets\/|data:font\/)/)
  })

  it('ships the OFL licences next to the fonts', () => {
    for (const n of ['barlow-condensed', 'literata', 'martian-mono']) {
      const f = path.join(DIST, 'licenses', 'fonts', `${n}-OFL.txt`)
      expect(fs.existsSync(f), n).toBe(true)
      expect(read(f)).toContain('SIL Open Font License')
    }
  })
})

if (!HAS_DIST) it.todo('app/dist absent: build rules skipped — run `npx vite build` then vitest')
