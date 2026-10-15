/**
 * Tiny dense complex matrices and vectors for the Pauli-based and injection engines of the background chapter B4 (up to 4 qubits, 16 x 16). Row-major, real and imaginary parts apart.
 * Pure TypeScript with no import: it is the "dense route" the compiler, the injection and the absorbed measurement are checked against inside the engine itself
 * (the numpy twins in pipeline/b4_numpy.py do the same sums in a second implementation).
 */
export interface DMat {
  readonly n: number
  readonly re: Float64Array
  readonly im: Float64Array
}
export interface DVec {
  readonly re: Float64Array
  readonly im: Float64Array
}

export const dZero = (n: number): DMat => ({ n, re: new Float64Array(n * n), im: new Float64Array(n * n) })
export function dEye(n: number): DMat {
  const m = dZero(n)
  for (let i = 0; i < n; i++) m.re[i * n + i] = 1
  return m
}
export function dFrom(rows: readonly (readonly [number, number])[][]): DMat {
  const n = rows.length
  const m = dZero(n)
  rows.forEach((r, i) => r.forEach(([a, b], j) => ((m.re[i * n + j] = a), (m.im[i * n + j] = b))))
  return m
}
export function dMul(a: DMat, b: DMat): DMat {
  const n = a.n
  const out = dZero(n)
  for (let i = 0; i < n; i++)
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k]
      const ai = a.im[i * n + k]
      if (ar === 0 && ai === 0) continue
      for (let j = 0; j < n; j++) {
        const br = b.re[k * n + j]
        const bi = b.im[k * n + j]
        out.re[i * n + j] += ar * br - ai * bi
        out.im[i * n + j] += ar * bi + ai * br
      }
    }
  return out
}
export function dKron(a: DMat, b: DMat): DMat {
  const n = a.n * b.n
  const out = dZero(n)
  for (let i = 0; i < a.n; i++)
    for (let j = 0; j < a.n; j++)
      for (let k = 0; k < b.n; k++)
        for (let l = 0; l < b.n; l++) {
          const ar = a.re[i * a.n + j]
          const ai = a.im[i * a.n + j]
          const br = b.re[k * b.n + l]
          const bi = b.im[k * b.n + l]
          const r = i * b.n + k
          const c = j * b.n + l
          out.re[r * n + c] = ar * br - ai * bi
          out.im[r * n + c] = ar * bi + ai * br
        }
  return out
}
export function dDagger(a: DMat): DMat {
  const n = a.n
  const out = dZero(n)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      out.re[j * n + i] = a.re[i * n + j]
      out.im[j * n + i] = -a.im[i * n + j]
    }
  return out
}
/** a·(sr + i·si) + b·(tr + i·ti) */
export function dCombine(a: DMat, sr: number, si: number, b: DMat, tr: number, ti: number): DMat {
  const out = dZero(a.n)
  for (let k = 0; k < a.re.length; k++) {
    out.re[k] = a.re[k] * sr - a.im[k] * si + b.re[k] * tr - b.im[k] * ti
    out.im[k] = a.re[k] * si + a.im[k] * sr + b.re[k] * ti + b.im[k] * tr
  }
  return out
}
export const dScale = (a: DMat, sr: number, si = 0): DMat => dCombine(a, sr, si, a, 0, 0)

const r2 = Math.SQRT1_2
const ex = (phi: number): [number, number] => [Math.cos(phi), Math.sin(phi)]
export const D1: Readonly<Record<'I' | 'X' | 'Y' | 'Z' | 'H' | 'S' | 'Sdg' | 'T' | 'Tdg', DMat>> = {
  I: dFrom([[[1, 0], [0, 0]], [[0, 0], [1, 0]]]),
  X: dFrom([[[0, 0], [1, 0]], [[1, 0], [0, 0]]]),
  Y: dFrom([[[0, 0], [0, -1]], [[0, 1], [0, 0]]]),
  Z: dFrom([[[1, 0], [0, 0]], [[0, 0], [-1, 0]]]),
  H: dFrom([[[r2, 0], [r2, 0]], [[r2, 0], [-r2, 0]]]),
  S: dFrom([[[1, 0], [0, 0]], [[0, 0], [0, 1]]]),
  Sdg: dFrom([[[1, 0], [0, 0]], [[0, 0], [0, -1]]]),
  T: dFrom([[[1, 0], [0, 0]], [[0, 0], ex(Math.PI / 4)]]),
  Tdg: dFrom([[[1, 0], [0, 0]], [[0, 0], ex(-Math.PI / 4)]]),
}

export function dKronAll(ms: readonly DMat[]): DMat {
  return ms.reduce((acc, m) => dKron(acc, m), dEye(1))
}
/** The dense Pauli string, wire 0 the leftmost factor. */
export function dPauli(letters: string): DMat {
  return dKronAll([...letters].map((ch) => D1[ch as 'I' | 'X' | 'Y' | 'Z']))
}
export function dEmbed1(u: DMat, q: number, n: number): DMat {
  return dKronAll(Array.from({ length: n }, (_, i) => (i === q ? u : D1.I)))
}
export function dCnot(c: number, t: number, n: number): DMat {
  const p0 = dFrom([[[1, 0], [0, 0]], [[0, 0], [0, 0]]])
  const p1 = dFrom([[[0, 0], [0, 0]], [[0, 0], [1, 0]]])
  const a = dKronAll(Array.from({ length: n }, (_, i) => (i === c ? p0 : D1.I)))
  const b = dKronAll(Array.from({ length: n }, (_, i) => (i === c ? p1 : i === t ? D1.X : D1.I)))
  return dCombine(a, 1, 0, b, 1, 0)
}
/** exp(i φ P / 2) = cos(φ/2) I + i sin(φ/2) P for a Pauli string P. */
export function dRot(pauli: string, phi: number): DMat {
  const P = dPauli(pauli)
  return dCombine(dEye(P.n), Math.cos(phi / 2), 0, P, 0, Math.sin(phi / 2))
}
/** Is a = e^{iθ} b (θ any angle), to the tolerance? */
export function dEqualUpToPhase(a: DMat, b: DMat, tol = 1e-9): boolean {
  let k = 0
  for (let i = 1; i < b.re.length; i++) if (Math.hypot(b.re[i], b.im[i]) > Math.hypot(b.re[k], b.im[k])) k = i
  const bm = Math.hypot(b.re[k], b.im[k])
  if (bm < tol) return false
  // c = a_k / b_k
  const d = bm * bm
  const cr = (a.re[k] * b.re[k] + a.im[k] * b.im[k]) / d
  const ci = (a.im[k] * b.re[k] - a.re[k] * b.im[k]) / d
  if (Math.abs(Math.hypot(cr, ci) - 1) > 1e-8) return false
  for (let i = 0; i < a.re.length; i++) {
    if (Math.abs(a.re[i] - (cr * b.re[i] - ci * b.im[i])) > tol) return false
    if (Math.abs(a.im[i] - (cr * b.im[i] + ci * b.re[i])) > tol) return false
  }
  return true
}
export function dMaxAbsDiff(a: DMat, b: DMat): number {
  let m = 0
  for (let i = 0; i < a.re.length; i++) m = Math.max(m, Math.hypot(a.re[i] - b.re[i], a.im[i] - b.im[i]))
  return m
}
export function dApply(m: DMat, v: DVec): DVec {
  const n = m.n
  const re = new Float64Array(n)
  const im = new Float64Array(n)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      re[i] += m.re[i * n + j] * v.re[j] - m.im[i * n + j] * v.im[j]
      im[i] += m.re[i * n + j] * v.im[j] + m.im[i * n + j] * v.re[j]
    }
  return { re, im }
}
export const vNorm2 = (v: DVec): number => v.re.reduce((s, x, i) => s + x * x + v.im[i] * v.im[i], 0)
export const vInner = (a: DVec, b: DVec): [number, number] => {
  let re = 0
  let im = 0
  for (let i = 0; i < a.re.length; i++) {
    re += a.re[i] * b.re[i] + a.im[i] * b.im[i]
    im += a.re[i] * b.im[i] - a.im[i] * b.re[i]
  }
  return [re, im]
}
export function vKron(a: DVec, b: DVec): DVec {
  const re = new Float64Array(a.re.length * b.re.length)
  const im = new Float64Array(re.length)
  for (let i = 0; i < a.re.length; i++)
    for (let j = 0; j < b.re.length; j++) {
      re[i * b.re.length + j] = a.re[i] * b.re[j] - a.im[i] * b.im[j]
      im[i * b.re.length + j] = a.re[i] * b.im[j] + a.im[i] * b.re[j]
    }
  return { re, im }
}
/** The projector (I + sign·P)/2 applied to a vector, P a dense Hermitian involution. */
export function vProject(m: DMat, v: DVec, sign: 1 | -1): DVec {
  const w = dApply(m, v)
  return { re: v.re.map((x, i) => (x + sign * w.re[i]) / 2), im: v.im.map((x, i) => (x + sign * w.im[i]) / 2) }
}
export const vScale = (v: DVec, k: number): DVec => ({ re: v.re.map((x) => x * k), im: v.im.map((x) => x * k) })
