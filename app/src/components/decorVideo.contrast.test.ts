/**
 * Decor scrim contrast (components/decorVideo.css; skill 14-decor-clip "honours reduced motion" + the component's
 * own accessibility contract). The scrim sits between the video and any text drawn over it; the footage brightness
 * varies frame to frame, so the worst case tested here is a fully white frame blended with the scrim's own alpha —
 * every reserved Cryostat text token used on decor (frost, gilt, rime, rime-dim) must still read >= 4.5 : 1 against
 * that blend (WCAG 2.x normal text), the same bar as src/index.contrast.test.ts.
 */
import { describe, expect, it } from 'vitest'
import { APP_DIR, fs, path } from '../security/node'

const decorCss = fs.readFileSync(path.join(APP_DIR, 'src/components/decorVideo.css'), 'utf8')
const themeCss = fs.readFileSync(path.join(APP_DIR, 'src/styles/theme-cryostat.css'), 'utf8')

/** The `rgba(r, g, b, a)` background of the first rule matching `selector`. */
function scrimRgba(selector: string): [number, number, number, number] {
  const at = decorCss.indexOf(selector)
  if (at < 0) throw new Error(`no rule ${selector}`)
  const body = decorCss.slice(decorCss.indexOf('{', at) + 1, decorCss.indexOf('}', at))
  const m = /rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/.exec(body)
  if (!m) throw new Error(`no rgba() background in ${selector}`)
  return [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])]
}

/** The custom properties of the first block that starts with `head` (same helper as index.contrast.test.ts). */
function tokens(head: string): Record<string, string> {
  const at = themeCss.indexOf(head)
  if (at < 0) throw new Error(`no block ${head}`)
  const body = themeCss.slice(themeCss.indexOf('{', at) + 1, themeCss.indexOf('}', at))
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]))
}

const hexToRgb = (hex: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]
const lum = ([r, g, b]: [number, number, number]) =>
  [r, g, b]
    .map((c) => c / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + [0.2126, 0.7152, 0.0722][i] * c, 0)
const ratio = (a: number, b: number) => {
  const [hi, lo] = [a, b].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('decor scrim: a fully white frame behind it still keeps every 709 chrome text token >= 4.5 : 1', () => {
  const [sr, sg, sb, alpha] = scrimRgba('.decor-scrim')
  it('the scrim is a genuine overlay, not opaque and not a no-op', () => {
    expect(alpha).toBeGreaterThan(0)
    expect(alpha).toBeLessThan(1)
  })
  // blend the scrim over a pure-white frame: the brightest a clip could ever show behind it
  const blended: [number, number, number] = [sr, sg, sb].map((c) => alpha * c + (1 - alpha) * 255) as [number, number, number]
  const bgLum = lum(blended)
  const t = tokens(":root[data-course='qc709'] {")
  const TEXT = ['frost', 'gilt', 'rime', 'rime-dim'] as const

  it.each(TEXT)('%s reads >= 4.5 : 1 on the worst-case (fully white) scrim', (name) => {
    const r = ratio(lum(hexToRgb(t[name])), bgLum)
    expect(r, `${name} on worst-case scrim: ${r.toFixed(2)}`).toBeGreaterThanOrEqual(4.5)
  })
})
