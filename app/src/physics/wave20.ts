/**
 * Lecture 20 engine (448): the bound states of a finite square well (the stage source `wavefunction.source.well`, the `plot` curves `wellMatchEven` and `wellMatchOdd`). ħ = m = 1.
 * V = 0 for |x| < a/2 and V₀ outside, 0 < E < V₀; k = √(2E), κ = √(2(V₀ − E)), so k² + κ² = 2V₀. Even states are cos kx inside and C e^{−κ|x|} outside, odd ones sin kx and ±D e^{−κ|x|};
 * joining ψ and ψ′ at x = a/2 gives the smooth forms  κ cos(ka/2) − k sin(ka/2) = 0 (even)  and  κ sin(ka/2) + k cos(ka/2) = 0 (odd)  (no tangents, so no poles).
 * With u = ka/2 and z₀ = (a/2)√(2V₀) the roots are one per quarter-period of u below z₀: even in (mπ, mπ + π/2), odd in (mπ + π/2, (m + 1)π), each bracketed and bisected.
 * A lecture-only module (the lazy wavefunction and plot chunks and content/L20.values.ts); nothing in the entry closure. Numpy twin: pipeline/make_fixtures.py `lecture19_20_cases`
 * (scipy brentq on the same forms plus a finite-difference Hamiltonian); tests: physics/wave20.test.ts.
 */
export type WellParity = 'even' | 'odd'
export interface WellLevel {
  /** 1 for the lowest */
  n: number
  parity: WellParity
  E: number
  k: number
  kappa: number
}

/** The matching form in u = ka/2 with κa/2 = √(z₀² − u²). */
const form = (parity: WellParity, u: number, z0: number): number => {
  const kt = Math.sqrt(Math.max(0, z0 * z0 - u * u))
  return parity === 'even' ? kt * Math.cos(u) - u * Math.sin(u) : kt * Math.sin(u) + u * Math.cos(u)
}

function bisect(f: (u: number) => number, lo: number, hi: number): number {
  let a = lo
  let b = hi
  const fa = f(a)
  for (let i = 0; i < 200 && b - a > 1e-16 * Math.max(1, b); i++) {
    const m = (a + b) / 2
    const fm = f(m)
    if (fm === 0) return m
    if (Math.sign(fm) === Math.sign(fa)) a = m
    else b = m
  }
  return (a + b) / 2
}

const z0Of = (V0: number, a: number): number => (a / 2) * Math.sqrt(2 * V0)

/** The number of bound levels: ⌈a√(2V₀)/π⌉ (a level exactly at the top is not bound). */
export function wellCount(V0: number, a: number): number {
  if (!(V0 > 0 && a > 0)) throw new Error(`wellCount: needs V0 > 0 and a > 0 (got ${V0}, ${a})`)
  return Math.ceil((2 * z0Of(V0, a)) / Math.PI - 1e-12)
}

/** Every bound level, lowest first: n = 1 is even, n = 2 odd, and so on. */
export function wellLevels(V0: number, a: number): WellLevel[] {
  if (!(V0 > 0 && a > 0)) throw new Error(`wellLevels: needs V0 > 0 and a > 0 (got ${V0}, ${a})`)
  const z0 = z0Of(V0, a)
  const found: { parity: WellParity; u: number }[] = []
  const half = Math.PI / 2
  for (let m = 0; m * Math.PI < z0 - 1e-12; m++) {
    const lo = m * Math.PI
    const hi = Math.min(lo + half, z0)
    if (hi > lo) found.push({ parity: 'even', u: bisect((u) => form('even', u, z0), lo, hi) })
    const lo2 = lo + half
    const hi2 = Math.min(lo + Math.PI, z0)
    if (hi2 > lo2) found.push({ parity: 'odd', u: bisect((u) => form('odd', u, z0), lo2, hi2) })
  }
  found.sort((p, q) => p.u - q.u)
  return found.map((f, i) => {
    const k = (2 * f.u) / a
    return { n: i + 1, parity: f.parity, E: (k * k) / 2, k, kappa: Math.sqrt(Math.max(0, 2 * V0 - k * k)) }
  })
}

/** The matching mismatch at energy E (0 ≤ E ≤ V₀) divided by √(k² + κ²) = √(2V₀), so it lies in [−1, 1]; zero at a bound level of that parity. */
export function wellMismatch(E: number, V0: number, a: number, parity: WellParity): number {
  const k = Math.sqrt(2 * E)
  const kappa = Math.sqrt(Math.max(0, 2 * (V0 - E)))
  const f = parity === 'even' ? kappa * Math.cos((k * a) / 2) - k * Math.sin((k * a) / 2) : kappa * Math.sin((k * a) / 2) + k * Math.cos((k * a) / 2)
  return f / Math.sqrt(k * k + kappa * kappa)
}

function level(V0: number, a: number, n: number): WellLevel {
  const lv = wellLevels(V0, a)
  if (!Number.isInteger(n) || n < 1 || n > lv.length) throw new Error(`well: level n = ${n} is not bound (V0 = ${V0}, a = ${a} has ${lv.length})`)
  return lv[n - 1]
}

/** The unnormalised weights: ∫|φ|² inside, over both tails, and the value of φ at the wall. */
function weights(V0: number, a: number, n: number) {
  const lv = level(V0, a, n)
  const { k, kappa, parity } = lv
  const edge = parity === 'even' ? Math.cos((k * a) / 2) : Math.sin((k * a) / 2)
  const inside = parity === 'even' ? a / 2 + Math.sin(k * a) / (2 * k) : a / 2 - Math.sin(k * a) / (2 * k)
  const outside = (edge * edge) / kappa // two tails of (edge e^{−κ(|x| − a/2)})²: 2 · edge²/(2κ)
  return { lv, edge, inside, outside }
}

/** The chance of finding the particle outside |x| < a/2 in level n. */
export function wellTail(V0: number, a: number, n: number): number {
  const { inside, outside } = weights(V0, a, n)
  return outside / (inside + outside)
}

/** φₙ at each x of `xs`, normalised to ∫|φ|²dx = 1 over the whole line (tails included); even states are positive at 0, odd states positive at x > 0. */
export function wellStateSamples(xs: ArrayLike<number>, V0: number, a: number, n: number): Float64Array {
  const { lv, edge, inside, outside } = weights(V0, a, n)
  const nrm = 1 / Math.sqrt(inside + outside)
  const out = new Float64Array(xs.length)
  const even = lv.parity === 'even'
  for (let j = 0; j < xs.length; j++) {
    const x = xs[j]
    const ax = Math.abs(x)
    let v: number
    if (ax <= a / 2) v = even ? Math.cos(lv.k * x) : Math.sin(lv.k * x)
    else {
      v = edge * Math.exp(-lv.kappa * (ax - a / 2))
      if (!even && x < 0) v = -v
    }
    out[j] = v * nrm
  }
  return out
}

/** ∫|φₙ|²dx by Simpson's rule over |x| ≤ a/2 + 40/κ: a check on the closed-form normalisation (1 to about 1e-7). */
export function wellNorm(V0: number, a: number, n: number): number {
  const { kappa } = level(V0, a, n)
  const X = a / 2 + 40 / kappa
  const N = 2 * Math.min(200000, Math.max(2000, Math.ceil(X / (a * 2e-3))))
  const h = (2 * X) / N
  const xs = Array.from({ length: N + 1 }, (_, j) => -X + j * h)
  const w = wellStateSamples(xs, V0, a, n)
  let s = 0
  for (let j = 0; j <= N; j++) s += (j === 0 || j === N ? 1 : j % 2 ? 4 : 2) * w[j] * w[j]
  return (s * h) / 3
}
