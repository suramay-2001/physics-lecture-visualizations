/**
 * Words and numbers the operator-space stage shows (pure, tested). Everything comes from the resolved state:
 * A = a₀I + a⃗·σ⃗, its eigenvalues a₀ ± |a⃗| (engine), and the classification flags (physics/operators.ts).
 */
import type { OpClass } from '../../../physics/operators'
import type { V3 } from '../../types'

/** A plain decimal with a real minus sign and no "−0". */
export function num(x: number, digits = 2): string {
  const r = Number(x.toFixed(digits))
  return r === 0 ? (0).toFixed(digits) : (r < 0 ? '−' : '') + Math.abs(r).toFixed(digits)
}
/** Signed, for eigenvalues: +0.50 / −0.50. */
export const signedNum = (x: number, digits = 2): string => (Number(x.toFixed(digits)) > 0 ? '+' : '') + num(x, digits)

/** Short form for the narrow readout column: 0.50 → 0.5, 1.00 → 1, −0.25 → −0.25. */
export const short = (x: number): string => num(x).replace(/\.?0+$/, '') || '0'

/** Two short readout lines: "a₀ = 0" and "a = (0, 0, 0.5)" (plain a: the mono font has no combining arrow). */
export function opLines(a0: number, a: V3): [string, string] {
  return [`a₀ = ${short(a0)}`, `a = (${a.map(short).join(', ')})`]
}

export function eigReadout(eig: [number, number], a: V3): string {
  const len = Math.hypot(a[0], a[1], a[2])
  if (len < 1e-12) return `λ = ${short(eig[0])} (all states)`
  const sg = (x: number) => (Number(x.toFixed(2)) > 0 ? '+' : '') + short(x)
  return `λ = ${sg(eig[0])}, ${sg(eig[1])}`
}

/** The flags that are true, in a fixed teaching order (Hermitian first). */
export function classReadout(c: OpClass): string {
  const out: string[] = []
  if (c.hermitian) out.push('Hermitian')
  if (c.unitary) out.push('unitary')
  if (c.projector) out.push('projector')
  if (c.involution) out.push('squares to I')
  if (c.scalar) out.push('a multiple of I')
  if (!out.length) out.push(c.normal ? 'normal' : 'not normal')
  return out.join(' · ')
}

/** Arrows longer than this are drawn at half scale (and the stage says so). */
export const SCALE_LIMIT = 1.5
export const drawScale = (lens: number[]): 1 | 0.5 => (Math.max(0, ...lens) > SCALE_LIMIT ? 0.5 : 1)
