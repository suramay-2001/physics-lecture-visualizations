/**
 * Readout formatting shared by every lab bench (pure, tested). The lab formats like the lecture scenes: statistics
 * in 2 decimals with a real minus and no "−0" (`short2`), amplitudes in exact form where the engine's `snap` finds
 * one (`amp`: 1/√2, i/√2, √3/2), else 2 decimals. Numbers are formatted here, on the page side, from engine values;
 * the Babylon side never formats a number (lab/rules.test.ts).
 */
import { snap, type C } from '../physics/complex'
import type { Mat, Vec } from '../physics/linalg'
import { amp, short2 } from '../stage/scenes/bloch/blochLabels'

export { short2 }

/** Where a quantity carries ħ (spin operators, their eigenvalues and averages), the UI appends it (ħ = 1 inside). */
export type Unit = 'hbar' | 'none'
export const withUnit = (s: string, unit: Unit): string => (unit === 'hbar' && s !== '0' ? `${s} ħ` : s)
/** A quantity in ħ^n (n = 0, 1, 2: e.g. a⃗ × b⃗ of two spin operators is in ħ²). "0" stays bare. */
export const withHbarPow = (s: string, n: number): string => (n <= 0 || s === '0' ? s : `${s} ħ${n === 1 ? '' : n === 2 ? '²' : `^${n}`}`)

/** A complex number for a readout: exact forms where the engine's snap finds one, a real minus sign. */
export const cnum = (z: C): string => amp(z).replace(/-/g, '−')

/** A real number to `digits` significant figures, trailing zeros dropped, a real minus ("0.0005", "−1.2e-7"). */
export const sig = (x: number, digits = 4): string => {
  if (x === 0 || !Number.isFinite(x)) return x === 0 ? '0' : String(x)
  return String(Number(x.toPrecision(digits))).replace('-', '−').replace('e−', 'e-')
}
/** A part of a complex number: an exact form where the engine's snap finds one (1/√2, √3/2, 1/2, integers), else
 *  `digits` significant figures; |x| < tol is 0 (a float residue, not a digit the student typed). */
function sigPart(x: number, tol: number, digits: number): string {
  if (Math.abs(x) < tol) return '0'
  // snap(x, 1) has a decimal point exactly when it found no exact form (its fallback is toFixed)
  const ex = snap(x, 1)
  return ex.includes('.') ? sig(x, digits) : ex.replace('-', '−')
}
/**
 * A complex number to 4 significant figures (P review item 11): used when A is not Hermitian, so a small imaginary
 * part that makes it so (M₁₀ = 0.5 + 0.001i) is shown instead of being rounded away. `tol` is the residue cut-off
 * (the caller scales it with the size of the matrix).
 */
export function cnumSig(z: C, tol = 1e-12, digits = 4): string {
  const r = sigPart(z.re, tol, digits)
  const i = sigPart(z.im, tol, digits)
  if (i === '0') return r
  const neg = i.startsWith('−')
  const m = neg ? i.slice(1) : i
  const body = m === '1' ? 'i' : m.startsWith('1/') ? `i${m.slice(1)}` : /[/√]/.test(m) ? `i${m}` : `${m}i`
  if (r === '0') return (neg ? '−' : '') + body
  return `${r} ${neg ? '−' : '+'} ${body}`
}

/** A real number with its sign: "+0.5", "−0.5", "0". */
export const signed = (x: number): string => {
  const s = short2(x)
  return s === '0' || s.startsWith('−') ? s : `+${s}`
}

/** A real 3-vector: "(0.5, 0, −0.25)". */
export const vec3 = (v: readonly number[]): string => `(${v.map(short2).join(', ')})`

/** A ket's two amplitudes: "(1/√2, i/√2)" (`fmt`: cnum, or cnumSig for a non-Hermitian A). */
export const ketText = (v: Vec, fmt: (z: C) => string = cnum): string => `(${fmt(v[0])}, ${fmt(v[1])})`

/**
 * A readout's pieces that must not wrap inside (P review item 15: "after:" wrapped mid-number): the text split
 * after each ", " so a line breaks only between amplitudes or components. `chunks.join(' ') === text`.
 */
export const commaChunks = (text: string): string[] => {
  const parts = text.split(', ')
  return parts.map((p, i) => (i < parts.length - 1 ? `${p},` : p))
}

/** Whole degrees with a real minus: "90°", "−45°". */
export const degText = (rad: number): string => {
  const d = Math.round((rad * 180) / Math.PI)
  return `${d === 0 ? 0 : d}°`.replace('-', '−')
}

/** A 2×2 matrix as two bracketed rows with aligned columns (mono readout): "[ 0    1/2 ]", "[ 1/2  0   ]". */
export function matRows(M: Mat, fmt: (z: C) => string = cnum): [string, string] {
  const cells = M.map((row) => row.map(fmt))
  const w0 = Math.max(cells[0][0].length, cells[1][0].length)
  const w1 = Math.max(cells[0][1].length, cells[1][1].length)
  const row = (r: string[]) => `[ ${r[0].padEnd(w0)}  ${r[1].padEnd(w1)} ]`
  return [row(cells[0]), row(cells[1])]
}

/** An angle in radians as whole degrees plus the number of full laps: "450° (1 lap + 90°)". */
export function turnText(rad: number): string {
  const deg = Math.round((rad * 180) / Math.PI)
  const laps = Math.floor(deg / 360)
  if (laps < 1) return `${deg}°`
  const rest = deg - laps * 360
  return `${deg}° (${laps} lap${laps > 1 ? 's' : ''}${rest ? ` + ${rest}°` : ''})`
}
