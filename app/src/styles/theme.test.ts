/**
 * Course themes (W-709-platform §D; the approved Cryostat identity, D-709-identity §2):
 *  1. page text contrast, per course × scheme (WCAG 2.x normal text ≥ 4.5 : 1), read from the stylesheets themselves:
 *     448 from index.css, 709 from index.css + styles/theme-cryostat.css resolved the way the cascade does;
 *  2. 709's chrome (navy in both schemes): every chrome text colour on every chrome ground;
 *  3. gilt and copper stay far from amber #f0a93a (|0⟩ ≡ |+z⟩, "+"): CIEDE2000 ΔE00 ≥ 20;
 *  4. gilt and copper never reach the stage, and copper is never text.
 */
import { describe, expect, it } from 'vitest'
import { APP_DIR, fs, path } from '../security/node'
import { HOPF_RAMP, INK, LAB_MATERIAL, STAGE_THEME } from '../stage/tokens'

const read = (p: string) => fs.readFileSync(path.join(APP_DIR, p), 'utf8')
// vitest turns CSS imports into empty modules: read the files from disk
const INDEX = read('src/index.css')
const CRYO = read('src/styles/theme-cryostat.css')

/** Custom properties (hex values only) of the first block whose selector starts with `head`. */
function block(css: string, head: string): Record<string, string> {
  const at = css.indexOf(head)
  if (at < 0) throw new Error(`no block ${head}`)
  const body = css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at))
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2].toLowerCase()]))
}
/** Every custom property NAME a block sets (any value), to compare the token lists of the three 709 blocks. */
function names(css: string, head: string): string[] {
  const at = css.indexOf(head)
  const body = css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at))
  return [...body.matchAll(/--([\w-]+):/g)].map((m) => m[1]).sort()
}

const HEAD = {
  base448: ':root {',
  dark448: ":root[data-theme='dark'] {",
  base709: ":root[data-course='qc709'] {",
  media709: ":root[data-course='qc709']:not([data-theme='light']) {",
  dark709: ":root[data-course='qc709'][data-theme='dark'] {",
}

/** The tokens in force, per course × scheme, as the cascade resolves them (see the header of theme-cryostat.css). */
const SCHEMES: Record<string, Record<string, string>> = {
  '448 light': block(INDEX, HEAD.base448),
  '448 dark': { ...block(INDEX, HEAD.base448), ...block(INDEX, HEAD.dark448) },
  '709 light': { ...block(INDEX, HEAD.base448), ...block(CRYO, HEAD.base709) },
  '709 dark': { ...block(INDEX, HEAD.base448), ...block(INDEX, HEAD.dark448), ...block(CRYO, HEAD.base709), ...block(CRYO, HEAD.dark709) },
}

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** sRGB hex → CIE L*a*b* (D65). */
function lab(hex: string): [number, number, number] {
  const [R, G, B] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  const X = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047
  const Y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B
  const Z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / 1.08883
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116)
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]
}

/** CIEDE2000 colour difference (Sharma, Wu & Dalal 2005). */
export function dE00([L1, a1, b1]: number[], [L2, a2, b2]: number[]): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const Cb = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
  const a1p = (1 + G) * a1
  const a2p = (1 + G) * a2
  const C1 = Math.hypot(a1p, b1)
  const C2 = Math.hypot(a2p, b2)
  const hue = (b: number, a: number) => (b === 0 && a === 0 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360)
  const h1 = hue(b1, a1p)
  const h2 = hue(b2, a2p)
  let dh = 0
  if (C1 * C2 !== 0) dh = h2 - h1 > 180 ? h2 - h1 - 360 : h2 - h1 < -180 ? h2 - h1 + 360 : h2 - h1
  const dH = 2 * Math.sqrt(C1 * C2) * Math.sin(rad(dh / 2))
  const Lb = (L1 + L2) / 2
  const Cbp = (C1 + C2) / 2
  let hb = h1 + h2
  if (C1 * C2 !== 0) hb = Math.abs(h1 - h2) > 180 ? (h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2) : (h1 + h2) / 2
  const T = 1 - 0.17 * Math.cos(rad(hb - 30)) + 0.24 * Math.cos(rad(2 * hb)) + 0.32 * Math.cos(rad(3 * hb + 6)) - 0.2 * Math.cos(rad(4 * hb - 63))
  const dTheta = 30 * Math.exp(-(((hb - 275) / 25) ** 2))
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
  const Sl = 1 + (0.015 * (Lb - 50) ** 2) / Math.sqrt(20 + (Lb - 50) ** 2)
  const Sc = 1 + 0.045 * Cbp
  const Sh = 1 + 0.015 * Cbp * T
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc
  const [l, c, h] = [(L2 - L1) / Sl, (C2 - C1) / Sc, dH / Sh]
  return Math.sqrt(l * l + c * c + h * h + Rt * c * h)
}
const dE = (a: string, b: string) => dE00(lab(a), lab(b))

/** Text tokens on the page grounds, and bar labels on their soft fills (as index.contrast.test.ts, for both courses). */
const TEXT = ['ink', 'ink-2', 'ink-3', 'up-text', 'down'] as const
const GROUNDS = ['plate', 'plate-2', 'panel'] as const
const FILLS: [string, string][] = [
  ['up-text', 'up-soft'],
  ['down', 'down-soft'],
]

describe.each(Object.entries(SCHEMES))('page text contrast: %s', (_name, t) => {
  it('every text token reads ≥ 4.5 : 1 on every page ground, and bar labels on their soft fills', () => {
    const pairs = [...TEXT.flatMap((fg) => GROUNDS.map((bg) => [fg, bg] as const)), ...FILLS]
    for (const [fg, bg] of pairs) expect([t[fg], t[bg]], `${fg} and ${bg} defined`).toEqual([expect.stringMatching(/^#[0-9a-f]{6}$/), expect.stringMatching(/^#[0-9a-f]{6}$/)])
    const bad = pairs.map(([fg, bg]) => [fg, bg, ratio(t[fg], t[bg])] as const).filter(([, , r]) => !(r >= 4.5))
    expect(bad.map(([fg, bg, r]) => `${fg} on ${bg}: ${r.toFixed(2)}`)).toEqual([])
  })
})

describe('709 theme: blocks and chrome', () => {
  const base = block(CRYO, HEAD.base709)
  const CHROME = ['shield', 'vacuum', 'can', 'frost', 'rime', 'rime-dim', 'hair', 'gilt', 'copper', 't300', 't50', 't4', 't800', 't100', 't10']

  it('both dark blocks set the same tokens, and every reading-surface token of the base block (a missed one would stay light in dark mode)', () => {
    const media = names(CRYO, HEAD.media709)
    expect(names(CRYO, HEAD.dark709)).toEqual(media)
    const page = names(CRYO, HEAD.base709).filter((n) => !CHROME.includes(n) && !n.startsWith('gilt-') && !n.startsWith('font-'))
    expect(media).toEqual(page)
    expect(block(CRYO, HEAD.dark709)).toEqual(block(CRYO, HEAD.media709))
  })

  it('the chrome is the same navy in both schemes (no dark block redefines it) and matches the approved palette', () => {
    for (const n of CHROME) expect(names(CRYO, HEAD.dark709), n).not.toContain(n)
    expect(base).toMatchObject({ shield: '#0b1530', can: '#0e1934', vacuum: '#070d20', frost: '#eaf1fa', rime: '#a9b8d4', 'rime-dim': '#8a9aba', gilt: '#f2e8c8', copper: '#c4705f' })
    expect([base.t300, base.t50, base.t4, base.t800, base.t100, base.t10]).toEqual(['#18223d', '#141e38', '#111a33', '#0d162d', '#0a1227', '#070d20'])
  })

  it('chrome text (frost, rime, rime-dim, gilt) reads ≥ 4.5 : 1 on every chrome ground; navy on a gilt button too', () => {
    const grounds = ['shield', 'can', 'vacuum', 't300', 't50', 't4', 't800', 't100', 't10']
    const bad = ['frost', 'rime', 'rime-dim', 'gilt']
      .flatMap((fg) => grounds.map((bg) => [fg, bg, ratio(base[fg], base[bg])] as const))
      .filter(([, , r]) => !(r >= 4.5))
    expect(bad.map(([fg, bg, r]) => `${fg} on ${bg}: ${r.toFixed(2)}`)).toEqual([])
    expect(ratio(base.shield, base.gilt)).toBeGreaterThanOrEqual(4.5)
  })

  it('copper falls below 4.5 : 1 on the warmest plate tint (why it is never text), and no stylesheet uses it as a text colour', () => {
    expect(Math.min(...['shield', 'can', 't300', 't50'].map((g) => ratio(base.copper, base[g])))).toBeLessThan(4.5)
    const sheets = ['src/index.css', 'src/app.css', 'src/styles/theme-cryostat.css', 'src/styles/course709.css', 'src/stage/story.css', 'src/stage/overlay.css']
    for (const s of sheets) expect(read(s), s).not.toMatch(/(^|[\s;{])color:\s*(var\(--copper\)|#c4705f)/i)
  })
})

describe('gilt and copper vs amber (|0⟩, "+")', () => {
  it('CIEDE2000 matches its reference data (Sharma et al. pairs 1 and 17) and D’s measured values', () => {
    expect(dE00([50, 2.6772, -79.7751], [50, 0, -82.7485])).toBeCloseTo(2.0425, 3)
    expect(dE00([50, 2.5, 0], [73, 25, -18])).toBeCloseTo(27.1492, 3)
    // D-709-identity §2: gilt 22.7 / copper 28.0 vs #f0a93a; 30.4 / 22.8 vs light --up #c9820c; a yellower #d9c690 only 15.4
    expect(dE('#f2e8c8', '#f0a93a')).toBeCloseTo(22.7, 0)
    expect(dE('#c4705f', '#f0a93a')).toBeCloseTo(28.0, 0)
    expect(dE('#d9c690', '#f0a93a')).toBeLessThan(20)
  })

  it('gilt and copper are ≥ 20 ΔE00 from amber on the stage and from --up in both page schemes', () => {
    const base = block(CRYO, HEAD.base709)
    const ambers = [INK.plus, SCHEMES['448 light'].up, SCHEMES['448 dark'].up, SCHEMES['709 light'].up, SCHEMES['709 dark'].up]
    for (const metal of [base.gilt, base.copper]) for (const a of ambers) expect(dE(metal, a), `${metal} vs ${a}`).toBeGreaterThanOrEqual(20)
    // and the shared outcome colours are untouched by the 709 theme
    expect(SCHEMES['709 light'].up).toBe(SCHEMES['448 light'].up)
    expect(SCHEMES['709 dark'].up).toBe(SCHEMES['448 dark'].up)
    expect(SCHEMES['709 dark'].down).toBe(SCHEMES['448 dark'].down)
  })
})

describe('gilt and copper never reach the stage', () => {
  const METALS = ['#f2e8c8', '#c4705f']
  it('no stage token is gilt or copper, or within ΔE00 10 of them', () => {
    const stage = [...Object.values(INK), ...Object.values(LAB_MATERIAL), ...HOPF_RAMP.map((h) => h.hex), ...Object.values(STAGE_THEME).flatMap((t) => [...Object.values(t.bg), t.inset, t.backdrop])]
    for (const c of stage) for (const m of METALS) expect(dE(c, m), `${c} vs ${m}`).toBeGreaterThanOrEqual(10)
  })
  it('no stage source or stylesheet names them (hex or token)', () => {
    const hits: string[] = []
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(path.join(APP_DIR, dir), { withFileTypes: true })) {
        const p = `${dir}/${e.name}`
        if (e.isDirectory()) walk(p)
        else if (/\.(tsx?|css)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) && /(--gilt|--copper|#f2e8c8|#c4705f)/i.test(read(p))) hits.push(p)
      }
    }
    for (const d of ['src/stage', 'src/widgets', 'src/openers']) walk(d)
    expect(hits).toEqual([])
  })
})
