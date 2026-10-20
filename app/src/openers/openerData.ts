/**
 * What the two Blender chapter openers draw, computed by the engine (decision P3 #4: Blender computes no
 * physics). `node pipeline/blender/gen_opener_data.ts` writes these as JSON for the render scripts; the
 * app itself only ever shows the rendered frames. Imports carry `.ts` so Node's type stripping can run this
 * file directly (tsconfig allows it; everything here is erasable syntax).
 *
 * Opener A (Hopf): D-L1-scenes §5.3 table A, rings from §3.5 (θ 30°/55°/80°/105°/130°), 128 fibers.
 * Opener B (belt trick): §5.3 table B with the homotopy of physics/belt.ts.
 * Opener C (Grover's rotation, Part VII): the arrow of physics/qc/grover.ts stepping by 2α in the plane beside N amplitude bars.
 */
import { fiberPolyline, fiberSpan, fiberPoint3, type V3 } from '../physics/hopf.ts'
import { ribbon, twistFrame, untwistFrame, type P3, type Quat } from '../physics/belt.ts'
import { c } from '../physics/complex.ts'
import { apply } from '../physics/linalg.ts'
import { groverAngle, groverPlane, groverStateVector, rotate2D } from '../physics/qc/grover.ts'
import { hopfRampHex } from '../stage/sceneTokens.ts'
import { INK, STAGE_THEME } from '../stage/tokens.ts'

const TAU = Math.PI * 2
const deg = (d: number) => (d * Math.PI) / 180
/** smoothstep: each opener segment eases in and out, so the story's beats (360°, 720°) are held briefly */
const ease = (t: number) => {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

export const OPENER_FRAMES = 120

// ── Opener A: Hopf fibration ───────────────────────────────────────────────────────────────────────────
export const HOPF_OPENER = {
  rClamp: 6,
  samples: 144,
  /** §3.5 overview rings, doubled to 128 fibers (fewer inside where fibers are small, more outside) */
  rings: [
    { thetaDeg: 30, count: 12 },
    { thetaDeg: 55, count: 20 },
    { thetaDeg: 80, count: 28 },
    { thetaDeg: 105, count: 32 },
    { thetaDeg: 130, count: 36 },
  ],
  /** the ring that assembles alone in frames 30–59 */
  firstRing: 2,
} as const

export interface OpenerFiber {
  id: string
  /** 'plus' = the |+z⟩ circle (the bead's fiber), 'minus' = the |−z⟩ line, else the ring index */
  role: 'plus' | 'minus' | number
  thetaDeg: number
  phi: number
  closed: boolean
  hex: string
  /** projected points p (physics axes) */
  points: V3[]
}

export function hopfOpenerFibers(): OpenerFiber[] {
  const { rClamp, samples, rings } = HOPF_OPENER
  const out: OpenerFiber[] = [
    { id: 'plus', role: 'plus', thetaDeg: 0, phi: 0, closed: true, hex: INK.state, points: fiberPolyline(0, 0, rClamp, samples) },
    { id: 'minus', role: 'minus', thetaDeg: 180, phi: 0, closed: false, hex: hopfRampHex(Math.PI), points: fiberPolyline(Math.PI, 0, rClamp, 2) },
  ]
  rings.forEach(({ thetaDeg, count }, ring) => {
    const offset = (ring * 0.37) % (TAU / count)
    for (let j = 0; j < count; j++) {
      const theta = deg(thetaDeg)
      const phi = offset + (TAU * j) / count
      out.push({
        id: `r${ring}-${j}`,
        role: ring,
        thetaDeg,
        phi,
        closed: fiberSpan(theta, phi, rClamp).closed,
        hex: hopfRampHex(theta),
        points: fiberPolyline(theta, phi, rClamp, samples),
      })
    }
  })
  return out
}

/** The bead: the state |+z⟩ times e^{iχ}; frames 0–29 lap the fiber once (χ 0 → 2π), then it rests at χ = 0. */
export function hopfBead(f: number): V3 {
  const chi = f < 30 ? (TAU * f) / 29 : 0
  return fiberPoint3(0, 0, chi) as V3
}

// ── Opener B: belt trick ───────────────────────────────────────────────────────────────────────────────
export const BELT_OPENER = {
  samples: 65,
  /** bracket above, block top below (block: 0.6 u cube centred at the origin) */
  top: [0, 0, 2.4] as P3,
  bottom: [0, 0, 0.3] as P3,
} as const

export interface BeltFrame {
  f: number
  /** block turn so far, degrees (twist stage) */
  alphaDeg: number
  /** untwist progress 0…1 (0 during the twist stage) */
  u: number
  /** the block's quaternion as an SU(2) element: w = −1 after 360°, +1 after 720° */
  block: Quat
  points: P3[]
  widths: P3[]
}

/** Frames 0–39: 0° → 360° · 40–79: 360° → 720° · 80–119: block held still, belt untwists (u 0 → 1). */
export function beltSchedule(f: number): { alpha: number; u: number | null } {
  if (f < 40) return { alpha: TAU * ease(f / 39), u: null }
  if (f < 80) return { alpha: TAU + TAU * ease((f - 40) / 39), u: null }
  return { alpha: 2 * TAU, u: ease((f - 80) / 39) }
}

export function beltOpenerFrame(f: number): BeltFrame {
  const { alpha, u } = beltSchedule(f)
  const frame = u === null ? (s: number) => twistFrame(alpha, s) : (s: number) => untwistFrame(u, s)
  const r = ribbon(frame, BELT_OPENER.top, BELT_OPENER.bottom, BELT_OPENER.samples)
  return { f, alphaDeg: (alpha * 180) / Math.PI, u: u ?? 0, block: r.block, points: r.points, widths: r.widths }
}

// ── Opener C: Grover's rotation (Part VII, before Unit 17.2; P-Q17-story §10, ruling R6 of P-Q16-story) ──────────────
/**
 * Chapter Q17's running example: three wires (N = 8), one marked string, 101. One step turns the arrow in the plane by 2α.
 * The opener runs three of them, so the arrow passes the vertical (the best number of steps for N = 8 is two) and the
 * marked column starts to shrink again. The frames carry no number: the captions in openerCopy.ts do.
 */
export const GROVER_OPENER = {
  n: 3,
  /** the marked string 101, as an index (q0 the most significant bit) */
  marked: 5,
  /** whole steps the film runs */
  steps: 3,
  /** the frame where each step's turn begins (a turn takes GROVER_TURN_FRAMES frames, then the arrow holds) */
  stepStart: [20, 46, 72],
  /** the stage ground behind the film: the 709 Grover plane's (tokens.ts) */
  ground: STAGE_THEME.qc709.bg['grover-plane'],
} as const
export const GROVER_TURN_FRAMES = 18

/** Steps turned by frame f: 0 before the first, then each turn eases from j to j + 1 and the arrow holds there. */
export function groverSteps(f: number): number {
  let t = 0
  for (let j = 0; j < GROVER_OPENER.steps; j++) {
    const start = GROVER_OPENER.stepStart[j]
    if (f >= start) t = j + ease((f - start) / (GROVER_TURN_FRAMES - 1))
  }
  return t
}

export interface GroverFrame {
  f: number
  /** steps turned so far (a whole number at rest, between two whole numbers mid-turn) */
  steps: number
  /** the state's coordinates in the plane's basis (|x₀⊥⟩ across, |x₀⟩ up): a unit vector */
  plane: [number, number]
  /** the state's angle above the |x₀⊥⟩ axis, degrees */
  angleDeg: number
  /** the N signed amplitudes of the strings 000 … 111 (index = string, q0 the most significant bit) */
  bars: number[]
  /** the plane coordinates of every whole step the arrow has left behind, from the start (k = 0) on */
  trail: [number, number][]
}

const N8 = 2 ** GROVER_OPENER.n
const ALPHA8 = groverAngle(N8)

/**
 * The state `t` steps in. A whole t is exactly the algorithm's state after t steps (`groverPlane`, Eq. 7.18). Between two
 * whole steps the arrow glides: the state after ⌊t⌋ steps turned by the engine's `rotate2D` through that fraction of 2α, and
 * the bars are the plane's usual split (the marked string takes the sine, the other N − 1 strings share the cosine evenly).
 * The glide is not a state the algorithm reaches; the fidelity note beside the film says so.
 */
export function groverGlide(t: number): { plane: [number, number]; bars: number[] } {
  const k = Math.min(GROVER_OPENER.steps, Math.floor(t + 1e-9))
  const frac = Math.min(1, Math.max(0, t - k))
  const [x, y] = groverPlane(N8, 1, k)
  const turned = frac < 1e-12 ? [c(x), c(y)] : apply(rotate2D((frac * 2 * ALPHA8 * 180) / Math.PI), [c(x), c(y)])
  const plane: [number, number] = [turned[0].re, turned[1].re]
  const bars = Array.from({ length: N8 }, (_, s) => (s === GROVER_OPENER.marked ? plane[1] : plane[0] / Math.sqrt(N8 - 1)))
  return { plane, bars }
}

export function groverOpenerFrame(f: number): GroverFrame {
  const steps = groverSteps(f)
  const { plane, bars } = groverGlide(steps)
  // every whole step strictly behind the arrow leaves a faint arrow at its old place
  const trail: [number, number][] = []
  for (let k = 0; k < steps - 1e-9; k++) trail.push(groverPlane(N8, 1, k))
  return { f, steps, plane, angleDeg: (Math.atan2(plane[1], plane[0]) * 180) / Math.PI, bars, trail }
}

/** The amplitudes after k whole steps straight from the engine's full state vector (a test sets the plane's split beside them). */
export const groverWholeStepBars = (k: number): number[] => groverStateVector(GROVER_OPENER.n, [GROVER_OPENER.marked], k).map((z) => z.re)
