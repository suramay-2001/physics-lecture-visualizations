/**
 * "No runtime third party" gate (S-L1 §4c/§4d/§4i.5, W-L1 §4.7; owner S).
 *
 * 1. Source rules (always run): no drei helpers whose defaults fetch from CDNs (<Environment preset>, <Text> /
 *    troika, Cloud, matcap/normal textures, KTX2, FaceLandmarker), no useGLTF without `false, false`, no remote
 *    URLs in src except the documented reading links in content/refs.ts.
 * 2. Build rules (need a CURRENT build — `npm run build` first; a missing/stale dist fails ONE test that says so
 *    and skips the rest, see ./distState.ts): index.html is the CSP'd shell with external
 *    module scripts only; HTML/CSS reference no third-party origin at all; JS may only CONTAIN the documented
 *    inert origins below (library error-message links, XML namespaces) plus the content's reading links; no CDN
 *    host or path (Google Fonts, gstatic Draco, githack HDRIs, jsdelivr, unpkg, Babylon) appears anywhere; no
 *    absolute local paths (/Users/…) leak into any built file.
 * 3. Lab chunks (decisions/lab.md #8–9; scopes from build/chunkGraph.ts via the chunk report): the bans above stay
 *    ABSOLUTE for every other built file (entry closure, lecture chunks, everything else). The chunks only the lab
 *    gate can load (Babylon) are parsed instead (TypeScript AST, so comments never count): every http(s) origin in a
 *    string, template or regex literal, and every code sink (eval, Function, importScripts, WebAssembly, an injected
 *    <script>/<style>, WebSocket, sendBeacon) must be carried ONLY by modules listed in LAB_REMOTE / LAB_SINKS below,
 *    each with the control that keeps it unreachable at runtime. Unlisted carriers, unattributed hits and stale
 *    entries fail. Runtime twin: e2e/lab.spec.ts (0 non-self requests, 0 CSP violations, 0 tripwire trips).
 * The Playwright spec e2e/security.spec.ts is the runtime twin (0 non-self requests, 0 CSP violations).
 */
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { labScopes, type ChunkReport } from '../../build/chunkGraph.ts'
import { BUILD_FIRST, distState } from './distState.ts'
import { APP_DIR, fs, path, walk } from './node'

const SRC = import.meta.glob<string>('/src/**/*.{ts,tsx,css}', { query: '?raw', import: 'default', eager: true })
const DIST = path.join(APP_DIR, 'dist')
const DIST_STATE = distState()
const HAS_DIST = DIST_STATE.ok

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

type Sink = 'eval' | 'Function' | 'importScripts' | 'WebAssembly' | 'createElement(script)' | 'createElement(style)' | 'WebSocket' | 'sendBeacon'

/**
 * Lab chunks: (module, origin) pairs that may stay in the bundle, each with the control that keeps the origin from
 * ever being fetched. `module` matches the chunk report's root-relative module id. Stale entries fail.
 */
const LAB_REMOTE: { module: RegExp; origin: string; reason: string }[] = [
  {
    module: /\/@babylonjs\/core\/Misc\/tools\.pure\.js$/,
    origin: 'https://cdn.babylonjs.com',
    reason:
      'Tools._DefaultCdnUrl (scripts, decoders). Control: lab/babylon/tripwire.ts sets CDNBaseUrl/ScriptBaseUrl to ./babylon-off/ before the first engine and refuses cross-origin LoadScript/LoadFile; CSP script-src and connect-src are self; e2e/lab.spec.ts: 0 non-self requests, 0 trips.',
  },
  {
    module: /\/@babylonjs\/core\/Misc\/tools\.pure\.js$/,
    origin: 'https://assets.babylonjs.com',
    reason:
      'Tools._DefaultAssetsUrl (sample textures/environments). Control: tripwire.ts sets AssetBaseUrl to ./babylon-off/ (GetAssetUrl rewrites to it); the lab loads no texture or environment (lab/rules.test.ts); CSP img-src/connect-src self.',
  },
  {
    module: /\/@babylonjs\/core\/(Animations\/animation\.pure|Materials\/shaderMaterial\.pure|Engines\/constants)\.js$/,
    origin: 'https://snippet.babylonjs.com',
    reason:
      'SnippetUrl defaults (Animation, ShaderMaterial, Constants), used only by the ParseFromSnippetAsync / snippet loaders, which no lab file names (lab/rules.test.ts rule 4); CSP connect-src self would block the fetch.',
  },
  {
    module: /\/@babylonjs\/core\/Misc\/devTools\.js$/,
    origin: 'https://doc.babylonjs.com',
    reason: 'Documentation link inside a console warning about a missing side-effect import (inert text, never fetched; the lab e2e fails on any console warning of that kind).',
  },
]

/** Lab chunks: (module, sink) pairs that may stay in the bundle, each with its control. Stale entries fail. */
const LAB_SINKS: { module: RegExp; sink: Sink; reason: string }[] = [
  {
    module: /\/@babylonjs\/core\/Misc\/tools\.pure\.js$/,
    sink: 'Function',
    reason:
      'Tools._LoadScriptNative runs Function(data) only under Babylon Native (_native defined), never in a browser; LoadScript is wrapped by the tripwire, and our CSP (no unsafe-eval) makes Function() throw.',
  },
  {
    module: /\/@babylonjs\/core\/Misc\/tools\.pure\.js$/,
    sink: 'importScripts',
    reason: 'Tools._LoadScriptWeb inside a worker only; the lab starts no worker and never calls LoadScript (lab/rules.test.ts); the tripwire refuses cross-origin URLs; CSP script-src self.',
  },
  {
    module: /\/@babylonjs\/core\/Misc\/tools\.pure\.js$/,
    sink: 'createElement(script)',
    reason:
      'Tools._LoadScriptWeb appends a <script>; never called by the lab (lab/rules.test.ts), wrapped by the tripwire (cross-origin refused), and CSP script-src self blocks remote and inline scripts.',
  },
]

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

it('app/dist is a current production build of this tree (else: run `npm run build` first)', () => {
  if (!DIST_STATE.ok) throw new Error(DIST_STATE.message)
})

/* ------------------------------------------------------------------------------------------------ */
/* Lab chunks: AST facts per file (origins in literals, code sinks)                                  */
/* ------------------------------------------------------------------------------------------------ */

interface CodeFacts {
  origins: Set<string>
  sinks: Set<Sink>
}
const GLOBAL_BASE = /^(window|globalThis|self)$/

/** Origins in string / template / regex literals and code sinks of one JS or TS file. Comments are not nodes. */
function codeFacts(code: string, file: string): CodeFacts {
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : file.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, false, kind)
  const origins = new Set<string>()
  const sinks = new Set<Sink>()
  const callee = (e: ts.Expression): { name: string; global: boolean } | null => {
    if (ts.isIdentifier(e)) return { name: e.text, global: true }
    if (ts.isPropertyAccessExpression(e)) return { name: e.name.text, global: ts.isIdentifier(e.expression) && GLOBAL_BASE.test(e.expression.text) }
    if (ts.isParenthesizedExpression(e)) return callee(e.expression)
    return null
  }
  const visit = (n: ts.Node) => {
    if (ts.isStringLiteralLike(n) || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n) || ts.isRegularExpressionLiteral(n))
      for (const o of originsIn(n.text)) origins.add(o)
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
      const c = callee(n.expression)
      if (c?.global && c.name === 'eval') sinks.add('eval')
      if (c?.global && c.name === 'Function') sinks.add('Function')
      if (c?.global && c.name === 'importScripts') sinks.add('importScripts')
      if (c?.global && c.name === 'WebSocket' && ts.isNewExpression(n)) sinks.add('WebSocket')
      if (c?.name === 'sendBeacon') sinks.add('sendBeacon')
      const a0 = n.arguments?.[0]
      if (c?.name === 'createElement' && a0 && ts.isStringLiteralLike(a0) && /^(script|style)$/i.test(a0.text))
        sinks.add(a0.text.toLowerCase() === 'script' ? 'createElement(script)' : 'createElement(style)')
    }
    if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'WebAssembly') sinks.add('WebAssembly')
    ts.forEachChild(n, visit)
  }
  visit(sf)
  return { origins, sinks }
}

it('codeFacts: literals and sinks count, comments and look-alikes do not (self-check)', () => {
  const sample = [
    '/* https://in.comment.example */ // eval(x)',
    'const a = "https://cdn.example.com/x.js", b = `http://tpl.example:8080/${a}`, r = /https:\\/\\/re\\.example/',
    'new Function("return 1"); window.eval("1"); importScripts(a); new WebSocket(a); navigator.sendBeacon(a, b)',
    'document.createElement("script"); document.createElement("STYLE"); WebAssembly.instantiate(a)',
    'model.eval(); obj.Function(); document.createElement("div")',
  ].join('\n')
  const f = codeFacts(sample, 'x.js')
  // the comment's origin and the escaped regex (https:\/\/…) are not origins; the string and the template are
  expect([...f.origins].sort()).toEqual(['http://tpl.example:8080', 'https://cdn.example.com'])
  expect([...f.sinks].sort()).toEqual(['Function', 'WebAssembly', 'WebSocket', 'createElement(script)', 'createElement(style)', 'eval', 'importScripts', 'sendBeacon'])
})

/** The chunk report of the same build (build/chunkReport.ts writes it to node_modules/.tmp, never into dist/). */
const REPORT_FILE = path.join(APP_DIR, 'node_modules', '.tmp', 'chunk-modules.json')
const REPORT: ChunkReport | null = HAS_DIST && fs.existsSync(REPORT_FILE) ? (JSON.parse(read(REPORT_FILE)) as ChunkReport) : null
/** The lab chunks (file names as in the report, e.g. assets/x.js) and their absolute dist paths. */
const LAB_CHUNKS: string[] = REPORT ? [...labScopes(REPORT).lab].sort() : []
const LAB_FILES = new Set(LAB_CHUNKS.map((f) => path.join(DIST, f)))

/** Source of a bundled module id (/node_modules/…, /src/…); null for virtual modules (vite/…, rolldown/…). */
function moduleSource(id: string): string | null {
  if (!id.startsWith('/node_modules/') && !id.startsWith('/src/')) return null
  const f = path.join(APP_DIR, id)
  return fs.existsSync(f) ? read(f) : null
}

describe.skipIf(!HAS_DIST)('lab chunks (reachable only through the lab gate): origins and sinks, by module', () => {
  it('the chunk report of this build is present', () => {
    expect(REPORT, `${REPORT_FILE} is missing: ${BUILD_FIRST}`).not.toBeNull()
  })

  // Facts of every lab chunk, then each hit attributed to the bundled modules that carry it IN CODE.
  const rows = LAB_CHUNKS.map((chunk) => {
    const facts = codeFacts(read(path.join(DIST, chunk)), chunk)
    const hits = [...[...facts.origins].map((o) => `origin ${o}`), ...[...facts.sinks].map((k) => `sink ${k}`)]
    const carriers = new Map<string, string[]>(hits.map((h) => [h, []]))
    for (const id of REPORT![chunk].moduleIds) {
      const src = moduleSource(id)
      if (src === null || !hits.length) continue
      // a cheap text prefilter for origins; the AST then confirms the hit is code, not a comment
      const lower = src.toLowerCase()
      const maybe = hits.filter((h) => !h.startsWith('origin ') || lower.includes(h.slice(7)))
      if (!maybe.length) continue
      const mf = codeFacts(src, id)
      for (const h of maybe) if (h.startsWith('origin ') ? mf.origins.has(h.slice(7)) : mf.sinks.has(h.slice(5) as Sink)) carriers.get(h)!.push(id)
    }
    return { chunk, carriers }
  })
  const used = new Set<object>()

  it('every origin and sink in a lab chunk is carried only by allowlisted modules (each with its control)', () => {
    const bad: string[] = []
    for (const { chunk, carriers } of rows)
      for (const [hit, mods] of carriers) {
        if (!mods.length) {
          bad.push(`${chunk}: ${hit} — no bundled module carries it in code`)
          continue
        }
        for (const m of mods) {
          const entry = hit.startsWith('origin ')
            ? LAB_REMOTE.find((e) => e.module.test(m) && e.origin === hit.slice(7))
            : LAB_SINKS.find((e) => e.module.test(m) && e.sink === hit.slice(5))
          if (entry) used.add(entry)
          else bad.push(`${chunk}: ${hit} in ${m} — not allowlisted`)
        }
      }
    expect(bad).toEqual([])
  })

  it('no stale allowlist entries (each one is still needed by this build)', () => {
    if (!LAB_CHUNKS.length) return // nothing Babylon is bundled yet
    const stale = [...LAB_REMOTE.map((e) => `${e.module} ${e.origin}`), ...LAB_SINKS.map((e) => `${e.module} ${e.sink}`)].filter(
      (_, i) => !used.has(i < LAB_REMOTE.length ? LAB_REMOTE[i] : LAB_SINKS[i - LAB_REMOTE.length]),
    )
    expect(stale).toEqual([])
  })

  it('every allowlist entry names its control', () => {
    for (const e of [...LAB_REMOTE, ...LAB_SINKS]) expect(e.reason.length, String(e.module)).toBeGreaterThan(30)
  })
})

describe.skipIf(!HAS_DIST)('build rules (app/dist)', () => {
  // every built file EXCEPT the lab chunks: the bans stay absolute here (entry closure, lecture chunks, the rest)
  const files = HAS_DIST ? walk(DIST, (f) => /\.(html|css|js|mjs|json|svg|txt|webmanifest|map)$/.test(f) || f.endsWith('_headers')).filter((f) => !LAB_FILES.has(f)) : []
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

  it('no CDN / tracker host or path in any built file (outside the lab chunks)', () => {
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

  it('no absolute local paths leak into the build (privacy, S-01), lab chunks included', () => {
    const hits = [...files, ...LAB_FILES].filter((f) => /\/Users\/[^/\s"']+|\/home\/[a-z][^/\s"']*\/|[A-Z]:\\Users\\/.test(read(f))).map(rel)
    expect(hits).toEqual([])
  })

  it('only lab JS chunks are exempt from the absolute bans, and none of them is reachable without the lab gate', () => {
    expect([...LAB_FILES].filter((f) => !/\.m?js$/.test(f)).map(rel)).toEqual([])
    if (REPORT) {
      const s = labScopes(REPORT)
      expect([...s.lab].filter((f) => s.withoutLab.has(f))).toEqual([])
    }
  })

  it('fonts are bundled locally (no remote @font-face)', () => {
    const css = files.filter((f) => f.endsWith('.css')).map(read).join('\n')
    const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? []
    expect(faces.length).toBeGreaterThan(20)
    // 709's faces arrive in their own lazy stylesheet (styles/fonts709.ts), still bundled and same-origin
    for (const family of ['Barlow Condensed', 'Literata Variable', 'Martian Mono', 'KaTeX_Main', 'Archivo Variable', 'Atkinson Hyperlegible Next Variable', 'STIX Two Text Variable'])
      expect(faces.some((f) => f.includes(family)), family).toBe(true)
    for (const f of faces) for (const u of f.matchAll(/url\(([^)]+)\)/g)) expect(u[1]).toMatch(/^["']?(\.\/|\/assets\/|data:font\/)/)
  })

  it('ships the OFL licences next to the fonts', () => {
    for (const n of ['barlow-condensed', 'literata', 'martian-mono', 'archivo', 'atkinson-hyperlegible-next', 'stix-two-text']) {
      const f = path.join(DIST, 'licenses', 'fonts', `${n}-OFL.txt`)
      expect(fs.existsSync(f), n).toBe(true)
      expect(read(f)).toContain('SIL Open Font License')
    }
  })
})
