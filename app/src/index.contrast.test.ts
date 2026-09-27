/**
 * Page text contrast in both schemes (WCAG 2.x, normal text ≥ 4.5 : 1), read from the tokens in index.css itself.
 * Found by D's 709 identity review: in the light scheme `--ink-3` (eyebrows, labels) read 3.6 : 1 and amber `--up`
 * as text 2.6 : 1. Amber keeps its meaning (+ outcome) as a fill; its TEXT uses `--up-text`.
 */
import { describe, expect, it } from 'vitest'
import { APP_DIR, fs, path } from './security/node'

// read from disk: vitest turns CSS imports (including ?raw) into empty modules
const css = fs.readFileSync(path.join(APP_DIR, 'src/index.css'), 'utf8')

/** The custom properties of the first block that starts with `head`. */
function tokens(head: string): Record<string, string> {
  const at = css.indexOf(head)
  if (at < 0) throw new Error(`no block ${head}`)
  const body = css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at))
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]))
}
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Text tokens on the grounds they are set on (bars: `.up-bar` / `.down-bar` put their text on the soft fills). */
const TEXT = ['ink', 'ink-2', 'ink-3', 'up-text', 'down'] as const
const GROUNDS = ['plate', 'plate-2', 'panel'] as const
const FILLS: [string, string][] = [
  ['up-text', 'up-soft'],
  ['down', 'down-soft'],
]

describe.each([
  ['light', ':root {'],
  ['dark', ":root[data-theme='dark'] {"],
])('page text contrast, %s scheme', (_, head) => {
  const t = tokens(head)
  it('every text token reads ≥ 4.5 : 1 on every page ground', () => {
    const bad = TEXT.flatMap((fg) => GROUNDS.map((bg) => [fg, bg, ratio(t[fg], t[bg])] as const)).filter(([, , r]) => !(r >= 4.5))
    expect(bad.map(([fg, bg, r]) => `${fg} on ${bg}: ${r.toFixed(2)}`)).toEqual([])
  })
  it('bar labels read ≥ 4.5 : 1 on their soft fills', () => {
    const bad = FILLS.map(([fg, bg]) => [fg, bg, ratio(t[fg], t[bg])] as const).filter(([, , r]) => !(r >= 4.5))
    expect(bad.map(([fg, bg, r]) => `${fg} on ${bg}: ${r.toFixed(2)}`)).toEqual([])
  })
})
