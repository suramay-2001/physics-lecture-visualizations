/**
 * What the film `f1-euler-limit` draws, computed by the app's engine (P-F1-story §10.2: "(1 + iφ/n)ⁿ winds onto
 * the circle"). The scene only lays these values out; it types no physics number of its own. The film's INPUTS are
 * the storyboard's (φ = π; n = 1, 2, 4, 8, 16, 64); every coordinate, end point and target comes from
 * `physics/qc/complexExtra.ts` and `physics/complex.ts`. Colours come from `stage/tokens.ts` (the only palette).
 *
 * Pure TS: no Motion Canvas import, so the layout can be reasoned about (and later tested) without a browser.
 */
import { abs, expi, type C } from '../../../app/src/physics/complex.ts'
import { eulerLimit, eulerPath } from '../../../app/src/physics/qc/complexExtra.ts'
import { INK, STAGE_THEME } from '../../../app/src/stage/tokens.ts'

export const FILM_ID = 'f1-euler-limit'

/**
 * Output format = the Blender openers' (OpenerScrub draws 1080 × 1350 frames, 120 of them). The frame rate is
 * nominal (the film is scrubbed by scroll); a power of two keeps every frame time exact in binary, so each beat starts
 * on its planned frame. At 30 fps float ties moved four stage starts one frame early (caught by check_manifest).
 */
export const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 } as const

/** The storyboard's inputs (P-F1-story §10.2, first pass: φ = π). */
export const PHI = Math.PI
export const NS = [1, 2, 4, 8, 16, 64] as const

/** The 709 stage ground and the reserved stage inks (never gold/copper on a stage: tokens.ts). */
export const COLORS = {
  ground: STAGE_THEME.qc709.bg['hilbert-plane'],
  path: INK.state, // near-white = the state (reserved)
  axis: INK.silver, // structure 1: axes
  circle: INK.silver2, // structure 2: the unit circle
  target: INK.silver, // the point e^{iφ} the paths close in on: structure, drawn hollow
  label: INK.text,
} as const

/** Timeline in frames: each n draws, then holds; the last beat lands on e^{iφ} and holds to the end. */
export const TIMING = { draw: 11, hold: 5 } as const
export const stageFrames = TIMING.draw + TIMING.hold
export const landingFrames = FORMAT.frames - NS.length * stageFrames

export interface EulerStage {
  n: number
  /** the polygon's corners (1 + iφ/n)^k, k = 0 … n */
  path: C[]
  /** (1 + iφ/n)^n by repeated squaring (engine `eulerLimit`) */
  end: C
  /** frames this stage occupies (inclusive) */
  from: number
  to: number
}

export const STAGES: EulerStage[] = NS.map((n, k) => ({
  n,
  path: eulerPath(PHI, n),
  end: eulerLimit(PHI, n),
  from: k * stageFrames,
  to: (k + 1) * stageFrames - 1,
}))

/** e^{iφ}: where the end points close in (−1 at φ = π). */
export const TARGET: C = expi(PHI)

/** The unit circle's radius, |e^{iφ}| (the circle is the set the paths wind onto). */
export const UNIT = abs(TARGET)

/**
 * The unit circle as the engine's e^{iθ} at evenly spaced θ (a closed polygon, not a Circle node: a node's size goes
 * through Motion Canvas's DOM layout and comes back rounded to ~1/64 px, which check_manifest caught as a radius of
 * 0.99999). At 256 corners and this scale the chord sits < 0.02 px inside the true circle.
 */
export const CIRCLE_SAMPLES = 256
export const UNIT_CIRCLE: C[] = Array.from({ length: CIRCLE_SAMPLES }, (_, k) => expi((2 * Math.PI * k) / CIRCLE_SAMPLES))

// ── Layout: fit every drawn point (all corners, the unit circle, the target) into the frame ──────────────────
const MARGIN = { side: 90, top: 190, bottom: 110 } // px; the top band holds the one label

function bounds(): { x0: number; x1: number; y0: number; y1: number } {
  const pts: C[] = [...STAGES.flatMap((s) => s.path), TARGET]
  const xs = pts.map((p) => p.re).concat([-UNIT, UNIT])
  const ys = pts.map((p) => p.im).concat([-UNIT, UNIT])
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}

/** px per unit and where the origin sits, in Motion Canvas's frame (origin at the canvas centre, y down). */
export const LAYOUT = (() => {
  const b = bounds()
  const w = FORMAT.width - 2 * MARGIN.side
  const h = FORMAT.height - MARGIN.top - MARGIN.bottom
  const scale = Math.min(w / (b.x1 - b.x0), h / (b.y1 - b.y0))
  // centre the bounding box in the drawable area
  const cx = -FORMAT.width / 2 + MARGIN.side + w / 2
  const cy = -FORMAT.height / 2 + MARGIN.top + h / 2
  const ox = cx - (scale * (b.x0 + b.x1)) / 2
  const oy = cy + (scale * (b.y0 + b.y1)) / 2
  return { scale, ox, oy, labelY: -FORMAT.height / 2 + MARGIN.top / 2, labelX: -FORMAT.width / 2 + MARGIN.side }
})()

/** complex → canvas px (y flips: +im is up on screen) */
export const toPx = (z: C): [number, number] => [LAYOUT.ox + LAYOUT.scale * z.re, LAYOUT.oy - LAYOUT.scale * z.im]
/** canvas px → complex (used to record what was actually drawn) */
export const fromPx = (x: number, y: number): C => ({ re: (x - LAYOUT.ox) / LAYOUT.scale, im: (LAYOUT.oy - y) / LAYOUT.scale })
