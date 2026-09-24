/**
 * Stern–Gerlach field picture and deflection formula (W-L1 §3.4). Pure: no DOM, React or three.js.
 *
 * Coordinates are physics coordinates (beam along +y, z up), in the lab scene's schematic units for the
 * streamlines (knife tip at z = +0.61, groove shoulders at z = −0.46, pole half-width 0.95, D §3.1), and SI
 * for the deflection formula. The streamlines are QUALITATIVE: ∇·B = 0 is not enforced (fidelity item
 * "lab-field-qualitative"); they exist to show "stronger near the sharp pole".
 */
export type V3 = [number, number, number]

/** Knife-edge / groove geometry used by the streamlines (schematic units, D §3.1). */
export const POLE = { tipZ: 0.61, tipR: 0.05, shoulderZ: -0.46, grooveHalf: 0.38, grooveDepth: 0.34, halfWidth: 0.95 } as const

/** D §3.1: 9 lines per slice, packed at the knife (0°, ±8°, ±17°, ±27°, ±38°). */
const PACKED_DEG = [-38, -27, -17, -8, 0, 8, 17, 27, 38]

/**
 * Schematic field lines in the x–z slice at beam position y: from the knife tip, fanning out onto the
 * groove (gradient field), or straight parallel lines 0.2 apart (uniform field, l1-quantized:b5a).
 * Deterministic. Each line is `samples` points of a quadratic Bézier (the gate's `fieldLines`).
 * `count` other than 9 spreads the angles evenly over ±38° (still denser near 0 via a power law).
 */
export function streamlines(
  y: number,
  opts: { count?: number; samples?: number; field?: 'gradient' | 'uniform' } = {},
): V3[][] {
  const count = Math.max(1, Math.floor(opts.count ?? 9))
  const samples = Math.max(2, Math.floor(opts.samples ?? 24))
  const field = opts.field ?? 'gradient'
  const lines: V3[][] = []
  if (field === 'uniform') {
    for (let k = 0; k < count; k++) {
      const x = (k - (count - 1) / 2) * 0.2
      const line: V3[] = []
      for (let j = 0; j < samples; j++) line.push([x, y, 0.53 - (1.06 * j) / (samples - 1)])
      lines.push(line)
    }
    return lines
  }
  const angles =
    count === 9
      ? PACKED_DEG
      : Array.from({ length: count }, (_, k) => {
          const u = count === 1 ? 0 : (2 * k) / (count - 1) - 1 // −1 … 1
          return 38 * Math.sign(u) * Math.abs(u) ** 1.25
        })
  for (const deg of angles) {
    const a = (deg * Math.PI) / 180
    const start: V3 = [Math.sin(a) * POLE.tipR, y, POLE.tipZ - Math.cos(a) * POLE.tipR]
    const xe = Math.tan(a) * POLE.halfWidth
    const inGroove = Math.abs(xe) < POLE.grooveHalf
    const ze = (inGroove ? POLE.shoulderZ - POLE.grooveDepth * (1 - (xe / POLE.grooveHalf) ** 2) : POLE.shoulderZ) + 0.015
    const end: V3 = [xe, y, ze]
    const ctrl: V3 = [Math.sin(a) * 0.35, y, 0.05]
    const line: V3[] = []
    for (let j = 0; j < samples; j++) {
      const t = j / (samples - 1)
      const b0 = (1 - t) * (1 - t)
      const b1 = 2 * (1 - t) * t
      const b2 = t * t
      line.push([b0 * start[0] + b1 * ctrl[0] + b2 * end[0], y, b0 * start[2] + b1 * ctrl[2] + b2 * end[2]])
    }
    lines.push(line)
  }
  return lines
}

/** Relative gradient strength across the beam width (x ∈ [−1, 1]): 1 − 0.55 x², which bends each spot into the "lip". */
export const gradientFalloff = (x: number): number => 1 - 0.55 * x * x

/** SI parameters: moment component μ_z (J/T), gradient ∂B_z/∂z (T/m), mass m (kg), speed v (m/s),
 *  magnet length L (m), drift D from magnet exit to plate (m). */
export interface SGParams {
  muZ: number
  dBdz: number
  m: number
  v: number
  L: number
  D: number
}

/** Δz at the plate: (μ_z / 2m)(∂B_z/∂z)(L/v)²(1 + 2D/L), the formula the gate displayed. */
export function sgDeflection(p: SGParams): number {
  const a = (p.muZ * p.dBdz) / p.m
  return 0.5 * a * (p.L / p.v) ** 2 * (1 + (2 * p.D) / p.L)
}

/**
 * z(y) along the beam, y measured from the magnet entrance: 0 before it, a parabola ½a(y/v)² inside
 * (constant force), then a straight line with the exit slope (no force in the drift). Continuous in value
 * and slope at y = L; equals `sgDeflection` at y = L + D.
 */
export function sgTrajectoryZ(p: SGParams, yFromMagnetEntry: number): number {
  const y = yFromMagnetEntry
  if (y <= 0) return 0
  const a = (p.muZ * p.dBdz) / p.m
  if (y <= p.L) return 0.5 * a * (y / p.v) ** 2
  const tL = p.L / p.v
  return 0.5 * a * tL * tL + a * tL * ((y - p.L) / p.v)
}

/** Silver: atomic mass 107.8682 u → kg; Bohr magneton μ_B (J/T), |μ_z| of silver ≈ μ_B. */
export const SILVER = { m: 107.8682 * 1.6605390666e-27, muB: 9.2740100783e-24 } as const
