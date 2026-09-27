/**
 * The phase hue wheel (stage/phaseHue.ts): one colour per angle, legible on the stage ground and on paper, and the four
 * quarter turns kept apart from the reserved encodings (amber +, cobalt −, orchid operators).
 */
import { describe, expect, it } from 'vitest'
import { INK, STAGE_BG, STAGE_THEME } from './tokens'
import { PHASE_H0, oklchHex, phaseColor, wheelWedges } from './phaseHue'

const lin = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
const rgb = (hex: string) => [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255))
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
/** sRGB hex → OKLab (Björn Ottosson's matrices), for colour distances. */
function oklab(hex: string): [number, number, number] {
  const [r, g, b] = rgb(hex)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}
const dE = (a: string, b: string) => Math.hypot(...oklab(a).map((x, i) => x - oklab(b)[i]))

describe('phase hue wheel', () => {
  const angles = Array.from({ length: 72 }, (_, k) => (k / 72) * 2 * Math.PI)
  it('round-trips OKLCH: the hue of phase φ is H0 + φ, wrapped; any real angle works', () => {
    expect(oklchHex(1, 0, 0)).toBe('#ffffff')
    expect(phaseColor(0)).toBe(oklchHex(0.8, 0.12, PHASE_H0))
    expect(phaseColor(2 * Math.PI)).toBe(phaseColor(0))
    expect(phaseColor(-Math.PI / 2)).toBe(phaseColor((3 * Math.PI) / 2))
    expect(wheelWedges(24)).toHaveLength(24)
  })
  it('every phase is legible on the stage grounds (≥ 7 : 1) and in print on white (≥ 4.5 : 1)', () => {
    for (const bg of [STAGE_BG['complex-plane'], STAGE_THEME.qc709.bg['complex-plane'], STAGE_BG.inset])
      for (const a of angles) expect(contrast(phaseColor(a), bg), `${a} on ${bg}`).toBeGreaterThanOrEqual(7)
    for (const a of angles) expect(contrast(phaseColor(a, 'print'), '#ffffff'), `${a} print`).toBeGreaterThanOrEqual(4.5)
  })
  it('the quarter turns 1, i, −1, −i stay clear of amber (+), cobalt (−) and orchid (operators)', () => {
    for (const q of [0, 1, 2, 3]) for (const reserved of [INK.plus, INK.minus, INK.op]) expect(dE(phaseColor((q * Math.PI) / 2), reserved), `${q}·90° vs ${reserved}`).toBeGreaterThan(0.08)
  })
})
