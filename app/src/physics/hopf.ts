/**
 * Hopf fibration S³ → S² for spin-½ states (moved from the Phase-0 gate; API unchanged, W-L1 §3.1).
 *
 * A normalized spinor ψ = (ψ₁, ψ₂) ∈ ℂ² is a point x = (Re ψ₁, Im ψ₁, Re ψ₂, Im ψ₂) on S³ ⊂ ℝ⁴.
 * The Bloch point of ψ is r = (2 Re ψ₁*ψ₂, 2 Im ψ₁*ψ₂, |ψ₁|² − |ψ₂|²) (same formula as
 * physics/spin.ts `blochVector`). Multiplying by a global phase e^{iχ} moves x around a great circle
 * of S³ — the fiber — and leaves r unchanged.
 *
 * Phase χ vs rotation angle φ (decision L1 #15). χ is periodic with period 2π: `fiberPoint(θ, φ, 0)` and
 * `fiberPoint(θ, φ, 4π)` (χ = 0° and 720°) are the SAME point of S³, i.e. the same state vector, and
 * χ = 360° is the same point too. When the stage scrubs χ from 0° to 720° the bead laps the fiber twice
 * only because the animation path is not wrapped (stage/interp.ts); nothing about the state needs 720°.
 * The "720° to come back" fact belongs to the ROTATION angle φ: R_z(φ)|+z⟩ = e^{−iφ/2}|+z⟩, so a rotation
 * by φ moves the bead by χ = −φ/2 along its fiber. φ = 360° lands on −|+z⟩ (half a lap: a different
 * vector, the same physical state); φ = 720° is needed to return to |+z⟩ itself.
 *
 * Drawing: stereographic projection from the pole N = (0, 0, 0, 1): p = (x₁, x₂, x₃) / (1 − x₄).
 * Exactly one fiber passes through N: the fiber over the Bloch south pole |−z⟩ (θ = π), which becomes
 * the whole x₃ axis (a "circle through infinity"). Fibers near it become very large circles.
 *
 * Clamping (documented choice): we never scale points. Instead every fiber is drawn over the χ-interval
 * whose image lies inside the ball |p| ≤ rClamp. A circle meets a sphere in at most two points, so that
 * inside set is one arc (or the whole circle). The arc ends are found by bisection so they sit exactly
 * on the clamp sphere. The |−z⟩ fiber is thus drawn as the segment −rClamp ≤ p₃ ≤ rClamp of the axis.
 * Base points used for the picture avoid θ = π, so no ordinary fiber is clipped at rClamp = 6.
 */

export type R4 = [number, number, number, number]
export type V3 = [number, number, number]

const TAU = Math.PI * 2

/** e^{iχ}(cos θ/2, e^{iφ} sin θ/2) as a point of ℝ⁴. */
export function fiberPoint(theta: number, phi: number, chi: number): R4 {
  const a = Math.cos(theta / 2)
  const b = Math.sin(theta / 2)
  return [a * Math.cos(chi), a * Math.sin(chi), b * Math.cos(chi + phi), b * Math.sin(chi + phi)]
}

export const norm4 = (x: R4) => Math.hypot(x[0], x[1], x[2], x[3])

/** Hopf map S³ → S²: the Bloch vector of ψ = (x₁ + i x₂, x₃ + i x₄). */
export function hopfMap(x: R4): V3 {
  const [x1, x2, x3, x4] = x
  // ψ₁* ψ₂ = (x₁ − i x₂)(x₃ + i x₄) = (x₁x₃ + x₂x₄) + i(x₁x₄ − x₂x₃)
  return [2 * (x1 * x3 + x2 * x4), 2 * (x1 * x4 - x2 * x3), x1 * x1 + x2 * x2 - x3 * x3 - x4 * x4]
}

export function blochPoint(theta: number, phi: number): V3 {
  return [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)]
}

/** Stereographic projection from (0,0,0,pole). Returns null at the projection point itself. */
export function stereo(x: R4, pole: 1 | -1 = 1): V3 | null {
  const d = 1 - pole * x[3]
  if (d < 1e-12) return null
  return [x[0] / d, x[1] / d, x[2] / d]
}

export function inverseStereo(p: V3, pole: 1 | -1 = 1): R4 {
  const s = p[0] * p[0] + p[1] * p[1] + p[2] * p[2]
  const k = 2 / (1 + s)
  return [k * p[0], k * p[1], k * p[2], (pole * (s - 1)) / (s + 1)]
}

export function fiberPoint3(theta: number, phi: number, chi: number, pole: 1 | -1 = 1): V3 | null {
  return stereo(fiberPoint(theta, phi, chi), pole)
}

export interface FiberSpan {
  /** true: draw χ ∈ [0, 2π) as a closed loop. false: draw the open arc χ ∈ [chi0, chi1]. */
  closed: boolean
  chi0: number
  chi1: number
  /** true when part of the fiber was cut away by the clamp sphere. */
  clipped: boolean
  /** true when nothing of the fiber lies inside the clamp sphere. */
  empty: boolean
}

/** The χ-interval of a fiber whose stereographic image lies inside |p| ≤ rClamp (see header). */
export function fiberSpan(theta: number, phi: number, rClamp: number, pole: 1 | -1 = 1, samples = 720): FiberSpan {
  const inside = (chi: number) => {
    const p = fiberPoint3(theta, phi, chi, pole)
    return p !== null && Math.hypot(p[0], p[1], p[2]) <= rClamp
  }
  const step = TAU / samples
  const flags = Array.from({ length: samples }, (_, j) => inside(j * step))
  if (flags.every(Boolean)) return { closed: true, chi0: 0, chi1: TAU, clipped: false, empty: false }
  if (!flags.some(Boolean)) return { closed: false, chi0: 0, chi1: 0, clipped: true, empty: true }
  let bestStart = 0
  let bestLen = 0
  for (let j = 0; j < samples; j++) {
    if (flags[j] && !flags[(j - 1 + samples) % samples]) {
      let len = 0
      while (len < samples && flags[(j + len) % samples]) len++
      if (len > bestLen) {
        bestLen = len
        bestStart = j
      }
    }
  }
  const bisect = (cin: number, cout: number) => {
    for (let k = 0; k < 60; k++) {
      const mid = (cin + cout) / 2
      if (inside(mid)) cin = mid
      else cout = mid
    }
    return cin
  }
  const chi0 = bisect(bestStart * step, (bestStart - 1) * step)
  const chi1 = bisect((bestStart + bestLen - 1) * step, (bestStart + bestLen) * step)
  return { closed: false, chi0, chi1, clipped: true, empty: false }
}

/**
 * The drawable part of one fiber as a polyline in projected coordinates p (physics axes, not three.js):
 * n points evenly spaced in χ over `fiberSpan` (closed fibers: n points, the first is NOT repeated — draw
 * as a loop; open arcs: n points including both ends on the clamp sphere). Empty when nothing is inside.
 * Scenes convert p to their own frame; this function stays pure (moved inline code from the gate scene).
 */
export function fiberPolyline(theta: number, phi: number, rClamp: number, n: number, pole: 1 | -1 = 1): V3[] {
  const span = fiberSpan(theta, phi, rClamp, pole)
  if (span.empty || n < 2) return []
  const out: V3[] = []
  const chi1 = span.closed ? span.chi0 + TAU : span.chi1
  const steps = span.closed ? n : n - 1
  for (let k = 0; k < n; k++) {
    const p = fiberPoint3(theta, phi, span.chi0 + ((chi1 - span.chi0) * k) / steps, pole)
    if (p) out.push(p)
  }
  return out
}

export interface BasePoint {
  theta: number
  phi: number
  ring: number
}

/** Latitudes (radians) used for the picture; all avoid θ = π, the fiber through the projection pole. */
export const RING_THETAS = [20, 45, 70, 95, 120].map((d) => (d * Math.PI) / 180)
const RING_COUNTS: Record<64 | 128, number[]> = { 64: [8, 12, 14, 15, 15], 128: [16, 24, 28, 30, 30] }
/** Index into RING_THETAS of the ring revealed first ("one latitude"). */
export const FIRST_RING = 2

/** Base points on latitude circles; ring FIRST_RING comes first so a draw range can reveal it alone. */
export function basePoints(count: 64 | 128): BasePoint[] {
  const counts = RING_COUNTS[count]
  const order = [FIRST_RING, ...RING_THETAS.map((_, i) => i).filter((i) => i !== FIRST_RING)]
  const out: BasePoint[] = []
  for (const ring of order) {
    const n = counts[ring]
    const offset = (ring * 0.37) % (TAU / n)
    for (let j = 0; j < n; j++) out.push({ theta: RING_THETAS[ring], phi: offset + (TAU * j) / n, ring })
  }
  return out
}

/** Numerical Gauss linking integral of two closed polylines (used to test "every pair links once"). */
export function linkingNumber(a: V3[], b: V3[]): number {
  let sum = 0
  const na = a.length
  const nb = b.length
  for (let i = 0; i < na; i++) {
    const a0 = a[i]
    const a1 = a[(i + 1) % na]
    const da: V3 = [a1[0] - a0[0], a1[1] - a0[1], a1[2] - a0[2]]
    const ma: V3 = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2, (a0[2] + a1[2]) / 2]
    for (let j = 0; j < nb; j++) {
      const b0 = b[j]
      const b1 = b[(j + 1) % nb]
      const db: V3 = [b1[0] - b0[0], b1[1] - b0[1], b1[2] - b0[2]]
      const r: V3 = [ma[0] - (b0[0] + b1[0]) / 2, ma[1] - (b0[1] + b1[1]) / 2, ma[2] - (b0[2] + b1[2]) / 2]
      const cx = da[1] * db[2] - da[2] * db[1]
      const cy = da[2] * db[0] - da[0] * db[2]
      const cz = da[0] * db[1] - da[1] * db[0]
      const d = Math.hypot(r[0], r[1], r[2])
      sum += (r[0] * cx + r[1] * cy + r[2] * cz) / (d * d * d)
    }
  }
  return sum / (4 * Math.PI)
}
