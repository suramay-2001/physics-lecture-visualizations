/**
 * Stage palette gates (D §1.1–1.2, decisions #20–#21): backgrounds inside the 6–18 % luminance band
 * (judged by CIE L*, as the gate), reserved encodings distinct and readable on the stage, orchid present.
 */
import { describe, expect, it } from 'vitest'
import { HOPF_RAMP, INK, STAGE_BG, hopfRampHex } from './tokens'

const lin = (c: number) => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const Y = (hex: string) => {
  const [r, g, b] = rgb(hex).map(lin)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const Lstar = (hex: string) => {
  const y = Y(hex)
  return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [Y(a), Y(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('stage tokens', () => {
  it('every stage background sits in the 6–18 % band (CIE L*)', () => {
    for (const [k, v] of Object.entries(STAGE_BG)) {
      expect(Lstar(v), k).toBeGreaterThanOrEqual(6)
      expect(Lstar(v), k).toBeLessThanOrEqual(18)
    }
  })

  it('reserved encodings are distinct hexes and ≥ 4.5 : 1 on the state background', () => {
    const reserved = [INK.plus, INK.minus, INK.state, INK.op]
    expect(new Set(reserved).size).toBe(4)
    expect(INK.op).toBe('#e58bd3') // decision #21: orchid = operators only
    for (const c of [...reserved, INK.silver, INK.unpol]) expect(contrast(c, STAGE_BG['hilbert-plane'])).toBeGreaterThanOrEqual(4.5)
  })

  it('the Hopf luminance ramp never reaches the state colour (the marked fiber always out-shines it)', () => {
    for (const { hex } of HOPF_RAMP) expect(Lstar(INK.state) - Lstar(hex)).toBeGreaterThanOrEqual(12)
  })

  it('hopfRampHex reproduces the tabled ramp within one step per channel', () => {
    for (const { thetaDeg, hex } of HOPF_RAMP) {
      const got = rgb(hopfRampHex((thetaDeg * Math.PI) / 180))
      rgb(hex).forEach((v, i) => expect(Math.abs(got[i] - v), `${thetaDeg}° channel ${i}`).toBeLessThanOrEqual(1))
    }
  })
})
