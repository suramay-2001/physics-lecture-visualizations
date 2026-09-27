/** Minimal complex arithmetic. Plain objects so values serialize and compare easily. */
export interface C {
  re: number
  im: number
}

export const c = (re: number, im = 0): C => ({ re, im })
export const ZERO = c(0)
export const ONE = c(1)
export const I = c(0, 1)

export const add = (a: C, b: C): C => c(a.re + b.re, a.im + b.im)
export const sub = (a: C, b: C): C => c(a.re - b.re, a.im - b.im)
export const mul = (a: C, b: C): C => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
export const scale = (a: C, k: number): C => c(a.re * k, a.im * k)
export const conj = (a: C): C => c(a.re, -a.im)
export const neg = (a: C): C => c(-a.re, -a.im)
export const abs2 = (a: C): number => a.re * a.re + a.im * a.im
export const abs = (a: C): number => Math.hypot(a.re, a.im)
export const arg = (a: C): number => Math.atan2(a.im, a.re)
export const div = (a: C, b: C): C => scale(mul(a, conj(b)), 1 / abs2(b))
/** e^{iθ} */
export const expi = (theta: number): C => c(Math.cos(theta), Math.sin(theta))
export const polar = (r: number, theta: number): C => scale(expi(theta), r)

/** Principal square root: half the angle, root of the size. √(−2) = 1.414i. */
export const csqrt = (z: C): C => polar(Math.sqrt(abs(z)), arg(z) / 2)
/** zⁿ for an integer n by repeated squaring (exact for i: i² = −1, i³ = −i, i⁴ = 1). */
export function cpow(z: C, n: number): C {
  if (!Number.isInteger(n)) throw new Error('cpow: integer powers only')
  let base = n < 0 ? div(ONE, z) : z
  let k = Math.abs(n)
  let acc = ONE
  while (k > 0) {
    if (k & 1) acc = mul(acc, base)
    base = mul(base, base)
    k >>= 1
  }
  return acc
}

export const approxEq = (a: C, b: C, eps = 1e-9): boolean =>
  Math.abs(a.re - b.re) < eps && Math.abs(a.im - b.im) < eps

/** Human-readable form, snapping to common exact values (1/√2, √3/2, ...). */
export function fmt(z: C, digits = 3): string {
  const r = snap(z.re, digits)
  const i = snap(z.im, digits)
  if (i === '0') return r
  const iPart = i === '1' ? 'i' : i === '-1' ? '-i' : `${i}i`
  if (r === '0') return iPart
  return iPart.startsWith('-') ? `${r} − ${iPart.slice(1)}` : `${r} + ${iPart}`
}

const EXACT: [number, string][] = [
  [Math.SQRT1_2, '1/√2'],
  [Math.sqrt(3) / 2, '√3/2'],
  [0.5, '1/2'],
  [0.25, '1/4'],
  [0.75, '3/4'],
  [Math.sqrt(3) / 4, '√3/4'],
]

export function snap(x: number, digits = 3): string {
  if (Math.abs(x) < 1e-10) return '0'
  if (Math.abs(x - Math.round(x)) < 1e-10) return String(Math.round(x))
  for (const [v, s] of EXACT) {
    if (Math.abs(Math.abs(x) - v) < 1e-9) return (x < 0 ? '-' : '') + s
  }
  return x.toFixed(digits)
}
