/**
 * Which fibers the live Hopf stage draws (pure, tested). Rings follow D-L1-scenes §3.5 (θ 30°/55°/80°/105°/130°,
 * 64 = 6/10/14/16/18; 128 doubles each) — the same rings as the home-page Hopf film. Fiber curves themselves
 * come from physics/hopf.ts (`fiberPolyline`); this module only chooses base points, set membership, tube radius
 * and readout words.
 *
 * Reveal levels (resolver `reveal`, continuous while a beat scrolls): 0 none · 1 pair (the |+z⟩ circle and the
 * |−z⟩ line) · 2 one (+ the marked state's fiber) · 3 ring (+ θ = 80°) · 4 nested (+ θ = 55°) · 5 all.
 */

export const OVERVIEW_RINGS = [
  { thetaDeg: 30, count: 6 },
  { thetaDeg: 55, count: 10 },
  { thetaDeg: 80, count: 14 },
  { thetaDeg: 105, count: 16 },
  { thetaDeg: 130, count: 18 },
] as const

export interface RingFiber {
  theta: number
  phi: number
  thetaDeg: number
  /** the reveal level at which this fiber appears */
  level: 3 | 4 | 5
}

export function ringFibers(count: 64 | 128): RingFiber[] {
  const k = count / 64
  const out: RingFiber[] = []
  OVERVIEW_RINGS.forEach(({ thetaDeg, count: n0 }, ring) => {
    const n = n0 * k
    const offset = (ring * 0.37) % ((2 * Math.PI) / n)
    const level = thetaDeg === 80 ? 3 : thetaDeg === 55 ? 4 : 5
    for (let j = 0; j < n; j++) out.push({ theta: (thetaDeg * Math.PI) / 180, phi: offset + (2 * Math.PI * j) / n, thetaDeg, level })
  })
  return out
}

/** Opacity of a set that appears at `level`, given the continuous reveal index (a one-level fade). */
export const setAlpha = (level: number, reveal: number): number => Math.min(1, Math.max(0, reveal - (level - 1)))

/** Tube radius: constant thickness on S³, projected (D §3.5), evaluated at the fiber's mean distance. */
export function tubeRadius(meanP2: number, scale = 1.5): number {
  return scale * Math.min(0.04, Math.max(0.006, (0.01 * (1 + meanP2)) / 2))
}

const deg = (rad: number) => String(Math.round((rad * 180) / Math.PI)).replace('-', '−')

/** Readout for the marked state: where the bead is along its fiber, and what a rotation did. */
export function hopfReadout(m: { chi: number; rotAngle: number } | null, fibers: number): string[] {
  const lines = [`fibers ${fibers}`]
  if (!m) return lines
  // short lines: the readout column is ~160 px beside the passport
  if (Math.abs(m.rotAngle) > 1e-9) lines.unshift(`Rz(${deg(m.rotAngle)}°): χ ${deg(-m.rotAngle / 2)}°`)
  else lines.unshift(`χ = ${deg(m.chi)}° · point fixed`)
  return lines
}
