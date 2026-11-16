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

/* ---------------------------------------------------- Lecture 20 only: the values of the bound-state unit (content/L20.values.ts) ---------------------------------------------------- */

/** Composite Simpson's rule on [a, b] with N (even) panels: exact for cubics, about 1e-15 for the smooth integrands here. */
function simpson(f: (x: number) => number, a: number, b: number, N = 20000): number {
  const h = (b - a) / N
  let s = f(a) + f(b)
  for (let j = 1; j < N; j++) s += (j % 2 ? 4 : 2) * f(a + j * h)
  return (s * h) / 3
}

/** The slope √(2/L)·nπ/L of the box state φₙ just inside the wall at x = 0 (it drops to 0 outside: an infinitely high wall allows the jump). ħ = m = 1. */
export function boxWallSlope(L: number, n: number): number {
  if (!(L > 0) || !Number.isInteger(n) || n < 1) throw new Error('boxWallSlope: L must be positive and n a whole number ≥ 1')
  return Math.sqrt(2 / L) * ((n * Math.PI) / L)
}

/** The depth V₀ at which level n of a well of width a first appears: the (n − 1)th infinite-well energy of that width, (n − 1)²π²/(2a²). */
export function wellThreshold(a: number, n: number): number {
  if (!(a > 0) || !Number.isInteger(n) || n < 1) throw new Error('wellThreshold: a must be positive and n a whole number ≥ 1')
  return ((n - 1) * (n - 1) * Math.PI * Math.PI) / (2 * a * a)
}

/** φ(a/2) over φ(0) for the ground state (even): cos(ka/2). */
export function wellWallRatio(V0: number, a: number): number {
  const l = wellLevels(V0, a)[0]
  return Math.cos((l.k * a) / 2)
}

/** ∫φ(x)φ(−x)dx for level n: +1 for an even state, −1 for an odd one (Simpson over the whole line to the tails' 1e-12). */
export function wellParityOverlap(V0: number, a: number, n: number): number {
  const { kappa } = level(V0, a, n)
  const X = a / 2 + 40 / kappa
  const f = (x: number) => wellStateSamples([x], V0, a, n)[0] * wellStateSamples([-x], V0, a, n)[0]
  const h = a / 2
  return simpson(f, -X, -h, 4000) + simpson(f, -h, h, 4000) + simpson(f, h, X, 4000) // split at the edges, where φ″ jumps
}

/** The interior nodes of level n: sign changes of φ over a fine grid on |x| < a/2 + 8/κ (the grid is offset so that no sample sits on the centre of an odd state). */
export function wellNodes(V0: number, a: number, n: number): number {
  const { kappa } = level(V0, a, n)
  const X = a / 2 + 8 / kappa
  const N = 4000
  const xs = Array.from({ length: N }, (_, j) => -X + (2 * X * (j + 0.5)) / N)
  const w = wellStateSamples(xs, V0, a, n)
  let c = 0
  for (let j = 1; j < N; j++) if (w[j - 1] * w[j] < 0) c++
  return c
}

/** k tan(ka/2) for the ground state: the left side of the even condition (the right side is κ). */
export function wellEvenLeft(V0: number, a: number): number {
  const l = wellLevels(V0, a)[0]
  return l.k * Math.tan((l.k * a) / 2)
}

/** E_n of the finite well over the infinite well's n²π²/(2a²) of the same width. */
export function wellEnergyRatio(V0: number, a: number, n: number): number {
  return level(V0, a, n).E / ((n * n * Math.PI * Math.PI) / (2 * a * a))
}

/** The binding energy V₀ − E₁ of a thin deep well of depth V₀ = g/2a, for comparison with the delta well's κ²/2 (κ = g/2 when the slope jumps by −gφ(0), ħ = m = 1). */
export function thinWellBinding(g: number, a: number): number {
  const V0 = g / (2 * a)
  return V0 - wellLevels(V0, a)[0].E
}

/** The function f on (0, L), normalised, overlapped with level n of the box 0 < x < L: ∫fφₙdx/√∫f², φₙ = √(2/L) sin(nπx/L). */
export function boxFunctionOverlap(f: (x: number) => number, L: number, n: number): number {
  const nrm = Math.sqrt(simpson((x) => f(x) * f(x), 0, L))
  return simpson((x) => f(x) * Math.sqrt(2 / L) * Math.sin((n * Math.PI * x) / L), 0, L) / nrm
}

/** ⟨E⟩ = ½∫f′²dx/∫f²dx for a function f on (0, L) that vanishes at both walls (ħ = m = 1); df is its derivative, and `kink` splits the range where df jumps (a kink costs a finite energy). */
export function boxFunctionEnergy(f: (x: number) => number, df: (x: number) => number, L: number, kink?: number): number {
  const num = kink === undefined ? simpson((x) => df(x) ** 2, 0, L) : simpson((x) => df(x) ** 2, 0, kink) + simpson((x) => df(x) ** 2, kink, L)
  return num / 2 / simpson((x) => f(x) * f(x), 0, L)
}

/** ⟨H⟩ = 1/(8σ²) + ω²σ²/2 of the Gaussian of width σ in V = ω²x²/2 (ħ = m = 1): kinetic Δp²/2 with Δp = 1/2σ plus the mean potential. */
export function gaussianOscillatorEnergy(sigma: number, omega: number): number {
  if (!(sigma > 0)) throw new Error('gaussianOscillatorEnergy: σ must be positive')
  return 1 / (8 * sigma * sigma) + (omega * omega * sigma * sigma) / 2
}

/** The width that minimises gaussianOscillatorEnergy: setting the slope to zero gives σ⁴ = 1/(4ω²), so σ = 1/√(2ω) (the test confirms it by a scan). */
export function gaussianOscillatorBestWidth(omega: number): number {
  if (!(omega > 0)) throw new Error('gaussianOscillatorBestWidth: ω must be positive')
  return 1 / Math.sqrt(2 * omega)
}

/** Δx of level n of the box of width L: L√(1/12 − 1/(2n²π²)) (ħ = m = 1 changes nothing: a length). */
export function boxPositionSpread(L: number, n: number): number {
  if (!(L > 0) || !Number.isInteger(n) || n < 1) throw new Error('boxPositionSpread: L must be positive and n a whole number ≥ 1')
  return L * Math.sqrt(1 / 12 - 1 / (2 * n * n * Math.PI * Math.PI))
}

/**
 * ⟨x⟩ of the equal superposition of levels m ≠ n of the box 0 < x < L at time t: L/2 + x_mn cos((E_n − E_m)t), with the matrix element
 * x_mn = −8Lmn/(π²(m² − n²)²) when m + n is odd (and 0 when it is even, so the mean stays at L/2). ħ = m = 1.
 */
export function boxPairMeanX(L: number, m: number, n: number, t: number): number {
  if (!(L > 0) || !Number.isInteger(m) || !Number.isInteger(n) || m < 1 || n < 1 || m === n) throw new Error('boxPairMeanX: L positive and two different whole levels ≥ 1')
  const odd = (m + n) % 2 === 1
  const xmn = odd ? (-8 * L * m * n) / (Math.PI * Math.PI * (m * m - n * n) ** 2) : 0
  const dE = ((n * n - m * m) * Math.PI * Math.PI) / (2 * L * L)
  return L / 2 + xmn * Math.cos(dE * t)
}

/** The bound state of the delta well whose slope jumps by −gφ(0) (Townsend Problem 6.19 type, ħ = m = 1): κ = g/2 and E = −κ²/2; this returns the binding energy κ²/2 = g²/8. */
export function deltaWellBinding(g: number): number {
  if (!(g > 0)) throw new Error('deltaWellBinding: g must be positive')
  return (g * g) / 8
}

/**
 * The probability current j = ħ Im(φ*φ′)/m of level n at x, ħ = m = 1. The state is real (a real equation with a normalisable solution has a constant phase), so φ* = φ and Im(φ*φ′) = φ·Im(φ′) − Im(φ)·φ′ = 0:
 * it is computed that way from the closed-form φ and φ′ (the one-sided slope at an edge is not asked for), so the zero is exact and the stage needs no `current` readout.
 */
export function wellCurrent(V0: number, a: number, n: number, x: number): number {
  const { k, kappa, parity } = level(V0, a, n)
  const w = weights(V0, a, n)
  const nrm = 1 / Math.sqrt(w.inside + w.outside)
  const ax = Math.abs(x)
  if (Math.abs(ax - a / 2) < 1e-12) throw new Error('wellCurrent: φ′ jumps in its second derivative only, but ask away from the edge x = ±a/2')
  const even = parity === 'even'
  let phi: number
  let dphi: number
  if (ax < a / 2) {
    phi = even ? Math.cos(k * x) : Math.sin(k * x)
    dphi = even ? -k * Math.sin(k * x) : k * Math.cos(k * x)
  } else {
    const sign = !even && x < 0 ? -1 : 1
    phi = sign * w.edge * Math.exp(-kappa * (ax - a / 2))
    dphi = -Math.sign(x) * kappa * phi
  }
  const re = phi * nrm
  const dre = dphi * nrm
  const im = 0
  const dim = 0
  return re * dim - im * dre
}
