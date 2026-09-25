/**
 * Scene contract (W-L1 §2.4, §2.6; frozen at `l1-freeze`). D builds scenes against these types.
 *
 * `Resolved<K>` is what a scene reads: the content state after `resolve` (degrees → radians, named kets →
 * vectors) with every observable RECOMPUTED by the engine (`app/src/physics/`). Interpolation acts on the
 * inputs and recomputes the outputs (stage/interp.ts), so an in-between frame never shows a number that is
 * false for the geometry on screen. Rule for scenes: never call engine functions to decide what is true —
 * read `f.state`. Pure geometry helpers (physics/hopf.ts polylines, physics/field.ts streamlines) are fine.
 *
 * Coordinates in Resolved* are PHYSICS coordinates (z up, lab beam along +y). Scenes map them to three.js
 * with `PHYSICS_TO_THREE` / `physToThree` (stage/hooks.ts).
 */
import type { ComponentType, LazyExoticComponent } from 'react'
import type {
  HopfFibers,
  LabBench,
  LabModel,
  LabReadout,
  LabState,
  BallState,
  BlochState,
  HilbertPlaneState,
  StageKind,
  StateOf,
  ViewSlot,
} from '../content/stage'
import type { Anchor, BallShot, BlochShot, HopfShot, LabShot, OperatorShot, PlaneShot } from '../content/stageVocab'
import type { Vec } from '../physics/linalg'
import type { OpClass } from '../physics/operators'
import type { BenchTheory, Sign } from '../physics/sg'
import type { NamedKet } from '../physics/spin'

export type V3 = [number, number, number]

/* ---------------------------------------- lab-r3 ---------------------------------------- */
/** The state of the atoms in one beam segment: 'oven' (no ket, no chip) or ±n̂ (named when n̂ is ±x/±z/±y). */
export type Chip = 'oven' | { axis: V3; sign: Sign; named: NamedKet | null }
export interface ResolvedBench {
  id: LabBench['id']
  source: LabBench['source']
  /** Per device: tilt in radians from +z toward +x (the magnet rotates about the beam by this angle). */
  tilts: number[]
  /** Per device: unit n̂ in physics coordinates (x–z plane). */
  axes: V3[]
  /** Per device but the last: which output continues. */
  keep: Sign[]
  /** Per device: the non-kept output lands on its own plate. */
  openOther: boolean[]
  /** Exact Born fractions at these tilts (sg.ts `benchTheory`): plus, minus, blocked[k]. */
  theory: BenchTheory
  /** chips[0] = the source segment; chips[k] = the segment after device k−1 (kept beam). Length = devices. */
  chips: Chip[]
  showPrep: boolean
  /**
   * 0…1 emission weight: 1 = this bench fires (default), 0 = it emits no atoms (`LabBench.fires: false`).
   * Lerped across a transition so a stream can fade. Always set by resolve (optional only for merge safety;
   * read it as `fires ?? 1`). Interface change #2, additive.
   */
  fires?: number
}
export interface ResolvedLab {
  kind: 'lab-r3'
  benches: ResolvedBench[]
  /** 1 = gradient field (split), 0 = uniform field (no split); fractional while morphing. */
  gradient: number
  /** 0…1 presence of the dashed classical ghost band. */
  ghostBand: number
  /** 0…1 dimming of the 3D benches (l1-logic:b4). */
  dim: number
  model: LabModel
  flow: NonNullable<LabState['flow']>
  deposit: NonNullable<LabState['deposit']>
  readouts: readonly LabReadout[]
  variant: 'sg' | 'optical'
  /** Finite-sample batches and the current batch index (from the hold progress). null = no batches. */
  batches: readonly number[] | null
  batch: number
  shot?: LabShot
}

/* ------------------------------------- hilbert-plane ------------------------------------- */
export interface ResolvedPlane {
  kind: 'hilbert-plane'
  /** ψ's angle in the plane (radians; 0 = |+z⟩ horizontal, π/2 = |−z⟩ vertical); null = no ψ. */
  psi: number | null
  /** 0…1 presence of ψ (appear/disappear). */
  psiAlpha: number
  others: { angle: number; role: 'basis' | 'second' | 'ghost'; badge?: string; alpha: number }[]
  /** Measurement-frame angle (radians): first basis arrow at `basis`, second at `basis + π/2`. z → 0, x → π/4. */
  basis: number
  /** [P(first), P(second)] = squared shadows, from the engine's `prob()`; null without ψ. */
  probs: [number, number] | null
  shadows: number
  rightAngle: number
  arc: number
  ticks: number
  shot?: PlaneShot
}

/* ----------------------------------------- bloch ----------------------------------------- */
export interface ResolvedBloch {
  kind: 'bloch'
  /** Bloch vector of the state (unit length). */
  r: V3
  /** The ket, including global phase and the sign a rotation picks up (R(2π) = −I). */
  ket: Vec
  /** γ in radians (readout only; the point does not move). */
  globalPhase: number
  /** Measurement axis n̂, or null. */
  axis: V3 | null
  /** P(+ along n̂) = (1 + n̂·r)/2, or null without an axis. */
  pPlus: number | null
  trail: boolean
  labels: NonNullable<BlochState['labels']>
  /** How this state is reached from the previous beat. */
  path: 'geodesic' | { about: V3 }
  /** Bloch vector before `rotate`, and the rotation (axis, angle in radians), for angle interpolation. */
  base: V3
  rot: { axis: V3; angle: number } | null
  shot?: BlochShot
}

/* --------------------------------------- bloch-ball --------------------------------------- */
export interface ResolvedBall {
  kind: 'bloch-ball'
  r: V3
  rNorm: number
  /** Tr ρ² = (1 + |r|²)/2 */
  purity: number
  compare: V3 | null
  recipe: { w: number; r: V3 }[] | null
  axis: V3 | null
  pPlus: number | null
  /** How the NEXT beat is reached from this one. */
  update: NonNullable<BallState['update']>
  /** 0…1 presence of the purity readout. */
  purityShown: number
  shot?: BallShot
}

/* ------------------------------------------ hopf ------------------------------------------ */
export interface ResolvedHopfMarked {
  /** Base point on S² after the rotation (radians). */
  theta: number
  phi: number
  /** Position along the fiber (radians). NOT wrapped: 0 and 4π are the same state (decision #15). */
  chi: number
  r: V3
  /** Before rotation: base point, phase, and the R_z angle α (φ = φ₀ + α, χ = χ₀ − α/2). */
  base: { theta: number; phi: number; chi: number }
  rotAngle: number
}
export interface ResolvedHopf {
  kind: 'hopf'
  fibers: HopfFibers
  /** Continuous index into HOPF_FIBER_SETS (0 = none … 5 = all): fractional while revealing. */
  reveal: number
  count: 64 | 128
  linking: number
  marked: ResolvedHopfMarked | null
  mini: boolean
  shot?: HopfShot
}

/* ------------------------------------- operator-space ------------------------------------- */
export interface ResolvedOperator {
  kind: 'operator-space'
  a0: number
  a: V3
  /** a₀ + |a⃗|, a₀ − |a⃗| */
  eig: [number, number]
  /** â, or null when a⃗ = 0 (scalar operator). */
  ahat: V3 | null
  cls: OpClass
  add: { a0: number; a: V3 } | null
  sum: { a0: number; a: V3; eig: [number, number] } | null
  eigen: number
  gauge: number
  /** false when the spec could not be resolved (e.g. a `matrix` spec before physics/expr.ts lands). */
  valid: boolean
  shot?: OperatorShot
}

export type AnyResolved = ResolvedLab | ResolvedPlane | ResolvedBloch | ResolvedBall | ResolvedHopf | ResolvedOperator
export type Resolved<K extends StageKind> = Extract<AnyResolved, { kind: K }>

/* ---------------------------------------- frames ---------------------------------------- */

/** What a scene receives each frame (stage/hooks.ts `useStageFrame`). */
export interface StageFrame<K extends StageKind> {
  readonly unitId: string
  readonly kind: K
  /** Where this kind sits now (the destination side while changing); null when absent (weight 0). */
  readonly slot: ViewSlot | null
  /** Interpolated AND physics-consistent (observables recomputed). */
  readonly state: Resolved<K>
  /** The beat being left, or the question picture while a reveal plays; null while holding or entering. */
  readonly from: Resolved<K> | null
  readonly to: Resolved<K>
  /** Transition 0…1 (0 while holding; a cut under reduced motion). */
  readonly t: number
  /** The beat whose text is at the centre line. */
  readonly beat: number
  /** Hold progress s of that beat, 0…1 (sweeps and counts; {0, ½, 1} under reduced motion). */
  readonly hold: number
  /** The current beat is a clue whose answer is shown (decision #17). */
  readonly revealed: boolean
  readonly u: number
  /**
   * Reader-driven seconds (decision #22: lecture stages move only on scroll/click). Advances in real time
   * only while the reader scrolls, a click-triggered change plays, or within SETTLE_SECONDS after either;
   * otherwise it stands still. Constant when !motion (decision #18).
   */
  readonly clock: number
  readonly delta: number
  readonly motion: boolean
  /** beat.terms[stage.focusTerm].anchor when that term targets this kind. */
  readonly focus: Anchor | null
  /** 0…1 presence (0 ⇒ not rendered; callbacks are skipped). */
  readonly weight: number
  /** This view's CSS px. */
  readonly size: { w: number; h: number }
}

export interface SceneProps<K extends StageKind> {
  unitId: string
  kind: K
  /** Per beat, the question/plain state of this kind; null where the kind is absent. Build geometry once. */
  keyframes: readonly (StateOf<K> | null)[]
  /** Per beat, the revealed state of this kind (clue beats with a reveal picture); null otherwise. */
  reveals: readonly (StateOf<K> | null)[]
}
export type SceneComponent<K extends StageKind> = ComponentType<SceneProps<K>>
export type SceneRegistry = { [K in StageKind]?: LazyExoticComponent<SceneComponent<K>> }

// Re-exported so scenes import every state type from one place.
export type { HilbertPlaneState, LabState, BlochState, BallState }
