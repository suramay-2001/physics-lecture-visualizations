/**
 * Readout formatting shared by every lab bench (pure, tested). The lab formats like the lecture scenes: statistics
 * in 2 decimals with a real minus and no "−0" (`short2`), amplitudes in exact form where the engine's `snap` finds
 * one (`amp`: 1/√2, i/√2, √3/2), else 2 decimals. Numbers are formatted here, on the page side, from engine values;
 * the Babylon side never formats a number (lab/rules.test.ts).
 */
import type { C } from '../physics/complex'
import type { Mat, Vec } from '../physics/linalg'
import { amp, short2 } from '../stage/scenes/bloch/blochLabels'

export { short2 }

/** Where a quantity carries ħ (spin operators, their eigenvalues and averages), the UI appends it (ħ = 1 inside). */
export type Unit = 'hbar' | 'none'
export const withUnit = (s: string, unit: Unit): string => (unit === 'hbar' && s !== '0' ? `${s} ħ` : s)

/** A complex number for a readout: exact forms where the engine's snap finds one, a real minus sign. */
export const cnum = (z: C): string => amp(z).replace(/-/g, '−')

/** A real number with its sign: "+0.5", "−0.5", "0". */
export const signed = (x: number): string => {
  const s = short2(x)
  return s === '0' || s.startsWith('−') ? s : `+${s}`
}

/** A real 3-vector: "(0.5, 0, −0.25)". */
export const vec3 = (v: readonly number[]): string => `(${v.map(short2).join(', ')})`

/** A ket's two amplitudes: "(1/√2, i/√2)". */
export const ketText = (v: Vec): string => `(${cnum(v[0])}, ${cnum(v[1])})`

/** Whole degrees with a real minus: "90°", "−45°". */
export const degText = (rad: number): string => {
  const d = Math.round((rad * 180) / Math.PI)
  return `${d === 0 ? 0 : d}°`.replace('-', '−')
}

/** A 2×2 matrix as two bracketed rows with aligned columns (mono readout): "[ 0    1/2 ]", "[ 1/2  0   ]". */
export function matRows(M: Mat): [string, string] {
  const cells = M.map((row) => row.map(cnum))
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
