/**
 * The phase hue wheel (709 stage kinds `complex-plane` and `amplitudes`; the passport legend): ONE colour per angle,
 * the same wherever a complex number or an amplitude is drawn. Hue turns with the phase at constant lightness and
 * chroma (OKLCH), so no phase looks brighter than another. Phase 0 (a positive real number) is cyan-blue; the four
 * quarter turns (1, i, −1, −i) sit at least 30° of hue away from the reserved outcome hues (amber +, cobalt −) and
 * from orchid (operators). A hue here is a CODE for an angle, never an outcome: the fidelity notes say so.
 * Pure and small: the passport legend in the main chunk draws it too. 'print' is darker, for white paper.
 */

/** Hue (OKLCH degrees) of phase 0; phase φ sits at H0 + φ. */
export const PHASE_H0 = 215
const LC = { stage: { L: 0.8, C: 0.12 }, print: { L: 0.52, C: 0.13 } } as const

/** OKLCH (L 0…1, C, h degrees) → sRGB hex, clamped to the gamut. */
export function oklchHex(L: number, C: number, hDeg: number): string {
  const h = (hDeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
  const enc = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
  return '#' + lin.map((v) => Math.round(255 * Math.min(1, Math.max(0, enc(v)))).toString(16).padStart(2, '0')).join('')
}

/** The colour of phase φ (radians; any real, wrapped). */
export function phaseColor(phi: number, mode: 'stage' | 'print' = 'stage'): string {
  const deg = (((PHASE_H0 + (phi * 180) / Math.PI) % 360) + 360) % 360
  const { L, C } = LC[mode]
  return oklchHex(L, C, deg)
}

/** Wedges of the legend wheel: `n` pieces, piece k centred on phase 2πk/n (counter-clockwise from +x, y up). */
export function wheelWedges(n = 24, r = 7, r0 = 3.5, cx = 8, cy = 8, mode: 'stage' | 'print' = 'stage'): { d: string; fill: string }[] {
  const out: { d: string; fill: string }[] = []
  for (let k = 0; k < n; k++) {
    const a0 = ((k - 0.5) / n) * 2 * Math.PI
    const a1 = ((k + 0.5) / n) * 2 * Math.PI
    const p = (a: number, rr: number) => `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy - rr * Math.sin(a)).toFixed(2)}`
    out.push({ d: `M${p(a0, r0)} L${p(a0, r)} A${r},${r} 0 0 0 ${p(a1, r)} L${p(a1, r0)} A${r0},${r0} 0 0 1 ${p(a0, r0)} Z`, fill: phaseColor((k / n) * 2 * Math.PI, mode) })
  }
  return out
}
