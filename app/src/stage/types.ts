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
  ComplexMark,
  HopfFibers,
  LabBench,
  LabModel,
  LabReadout,
  LabState,
  BallState,
  BlochState,
  HilbertPlaneState,
  MatrixGridState,
  PlotCurveName,
  StageKind,
  StateOf,
  TwoQubitState,
  ViewSlot,
} from '../content/stage'
import type { Anchor, AmpShot, BallShot, BlochShot, CircuitShot, ComplexShot, HopfShot, LabShot, MatrixShot, OperatorShot, PlaneShot, PlotShot, TwoQubitShot } from '../content/stageVocab'
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
  /**
   * Where the beam ends (`LabState.beamTo`, default 'plate'): 'gap' = atoms stream into the magnet gap and stop
   * at the last magnet's exit (l1-quantized:b1). Always set by resolve (optional only for merge safety; read it
   * as `beamTo ?? 'plate'`). Interface change D5, additive.
   */
  beamTo?: 'gap' | 'plate'
  /**
   * P-Q1-story S4 (schematic): the drawn split at the plate is multiplied by this (the last magnet's push, the spots,
   * the deposit, the SPOT-scaled marks); readouts unchanged. Always set by resolve (read it as `gradientScale ?? 1`).
   */
  gradientScale?: number
  /*
   * Engine statistics the lab draws (interface change D4, additive; computed ONLY in stage/resolve.ts `labStats`
   * from the exact Born fractions, and recomputed for every in-between frame by stage/interp.ts).
   * All refer to bench 0's LAST device and to the atoms that reach its plate: p = plus / (plus + minus).
   */
  /** The average reading ⟨σₙ⟩ = (plus − minus) / (plus + minus) ∈ [−1, 1]: the centroid tick. Absent when no atom
   *  reaches the plate. */
  centroid?: number
  /** ±1σ half-width of the MEAN reading of N = batches[batch] atoms, in ⟨σₙ⟩ units (same axis as `centroid`):
   *  √(Var σₙ / N) = 2·√(p(1−p)/N). l1-average:b4 at 45°: 0.2236, 0.0707, 0.0224 for N = 10, 100, 1000
   *  (the caption's "band ±…"). Present only with batches. Draw the band as centroid ± sigmaBand. */
  sigmaBand?: number
  /** The same scatter for the FRACTION P(+) = p (fill-bar units): √(p(1−p)/N) = sigmaBand / 2. Present only with batches. */
  sigmaFraction?: number
  /** Spread of SINGLE ±1 readings, Δσ = √(1 − ⟨σₙ⟩²) = 2√(p(1 − p)) (Lecture 3 §7; readout 'spread'). Not the
   *  scatter of the mean (`sigmaBand`): one atom's reading is always ±1, so this never shrinks with N. */
  spread?: number
  /**
   * Per bench (same order as `benches`): the fractions of the atoms fired for which the proposition "some device
   * reads +" is true / false (l1-logic: z, x in bench order = "up OR right"). false = P(every device reads −), the
   * engine's `benchTheory` with every device keeping '−'; true = 1 − false. Fractions (sum 1), not sample counts:
   * a count of n atoms is n·true / n·false. Present only with the readouts 'truth-table' or 'tally-bars'.
   */
  tallies?: { true: number; false: number }[]
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
  /** Â|ψ⟩ in plane coordinates (x on |+z⟩, y on |−z⟩; true length, ħ = 1), its presence and chip; null = none. */
  image: { x: number; y: number; alpha: number; label: string; readout: boolean } | null
  /** Half-size of the drawn content in units of the unit circle (≥ 1): the plane zooms out for a long image. */
  extent: number
  /** P̂ᵢ|ψ⟩ along frame vector `index` (0 or 1): signed length (|cᵢ| → 1 while renormalizing), presence, and how
   *  far the rescaling has gone (0 = the bare projection, 1 = the normalized state). */
  project: { index: 0 | 1; len: number; alpha: number; renorm: number } | null
  /**
   * P-Q1-story S1: two plane vectors `a`, `b` (unit, plane coordinates) and their sum a + b by the engine (linalg
   * `vadd`, `norm`), at its true length; `alpha` fades it. Always set by resolve (optional only for merge safety).
   */
  sum?: { a: { x: number; y: number }; b: { x: number; y: number }; total: { x: number; y: number }; len: number; alpha: number } | null
  /** P-Q1-story S2: the arc's label (null = the default θ/2). */
  arcLabel?: string | null
  /** P-Q2-story S1: 'photon' names axes and shadows |x⟩, |y⟩ instead of the spin frame. Default 'spin'. */
  labels: NonNullable<HilbertPlaneState['labels']>
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
  /** Axes that get a drop-line from the point (Lecture 7). */
  dropLines: ('x' | 'y' | 'z')[]
  readouts: ('averages' | 'spreads' | 'bound')[]
  /** Engine statistics of the state (ħ = 1): ⟨S⟩ = r/2 and ΔS_j = ½√(1 − r_j²) (spin.ts spreadsFromBloch). */
  avg: V3
  spreads: V3
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
  /** The comparison point's ingredients (drawn with `recipe`: two recipes can land on one point, L6). */
  compareRecipe: { w: number; r: V3 }[] | null
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

/* ------------------------------------- complex-plane (709; SVG) ------------------------------------- */
/**
 * A drawn complex number: its parts, and its size and angle computed by physics/complex.ts (`abs`, `arg`). `phi` is
 * the angle the arrow is drawn and turned by: the authored angle (not wrapped) for a number written in polar form, so a
 * sweep 0° → 360° is a full turn, else the principal `arg` in (−π, π].
 */
export interface CNumber {
  re: number
  im: number
  r: number
  phi: number
  /** written as { r, phiDeg } (turns interpolate by angle) */
  polar: boolean
}
export interface ResolvedComplexPlane {
  kind: 'complex-plane'
  z: CNumber | null
  w: CNumber | null
  /** The derived marks shown (discrete; switch at t = ½). */
  show: readonly ComplexMark[]
  /** z + w, zw, z* (engine: add, mul, conj), each with its size and angle; null unless shown (and defined). */
  sum: CNumber | null
  product: CNumber | null
  conj: CNumber | null
  /** iz, the velocity of e^{iφ} at z ('velocity'). */
  velocity: CNumber | null
  /** 1, z, …, z^upTo (cpow). */
  powers: { of: CNumber; upTo: number; points: CNumber[] } | null
  /** The Euler polygon (1 + iφ/n)^k or the points (1 + x/n)^k, k = 0…n; `end` is the n-th. */
  euler: { rate: 'imag' | 'real'; param: number; n: number; points: CNumber[]; end: CNumber; limit: CNumber } | null
  /** Arrows tip to tail (phasorPath) and the resultant (phasorSum). */
  chain: { phases: number[]; sizes: number[]; path: CNumber[]; sum: CNumber; sumAbs2: number } | null
  /** Arrows from 0 (no sum). */
  spokes: { phases: number[]; sizes: number[]; tips: CNumber[] } | null
  /** The path of z's tip over the hold so far (trail: true). */
  trail: { re: number; im: number }[] | null
  circle: boolean
  line: boolean
  /** Half-size of the drawing in units of the unit circle (≥ 1.25), fixed over the beat's hold so a sweep never rescales. */
  extent: number
  shot?: ComplexShot
}

/* --------------------------------------- amplitudes (709; SVG) --------------------------------------- */
export interface ResolvedAmplitudes {
  kind: 'amplitudes'
  /** Qubits (bars = 2ⁿ). */
  n: number
  /** The amplitudes, q0 the most significant bit (qc/state.ts); from the engine, never from content. */
  amps: { re: number; im: number }[]
  /** Per bar: |a| (complex.ts abs), its phase (arg; 0 for a zero amplitude) and the chance |a|² (abs2). */
  sizes: number[]
  phases: number[]
  probs: number[]
  mode: 'amplitude' | 'probability' | 'signed'
  dials: boolean
  labels: 'bits' | 'spin'
  /** Bars i and j tip to tail and their resultant a_i + a_j (engine add), with |·| and |·|². */
  sum: { i: number; j: number; total: { re: number; im: number }; size: number; size2: number } | null
  /** The mean amplitude (qc/state.ts meanAmplitude; real part drawn in 'signed' mode). */
  mean: { re: number; im: number }
  /** A one-qubit direction source's Bloch angles (radians): transitions then turn on the sphere, as `bloch` does. */
  dir: { theta: number; phi: number } | null
  /** The circuit cursor (after column k) when the state is read from a circuit. */
  upTo: number | null
  /** P-Q2-story S2: γ in radians, already baked into `amps`/`phases` (readout only; bar lengths/chances unchanged). */
  globalPhase: number
  shot?: AmpShot
}

/* ---------------------------------------- circuit (709; SVG) ---------------------------------------- */
/** One operation as drawn: a box (gate, oracle, unitary) on its targets, control dots, a SWAP, or a meter. */
export interface CircuitGlyph {
  type: 'gate' | 'not' | 'swap' | 'measure' | 'oracle' | 'unitary'
  /** Box text: H, S†, P(90°), Rz(45°), U_f … ('not' = ⊕ on a controlled X; 'measure' = the classical bit). */
  label: string
  targets: number[]
  controls: number[]
  /** Classical control, shown as "if c0 = 1". */
  cond: string | null
}
export interface ResolvedCircuit {
  kind: 'circuit'
  n: number
  /** Wire labels (q0 … or the circuit's own) and each wire's starting ket label (0, 1, +, −). */
  wires: string[]
  init: string[]
  columns: CircuitGlyph[][]
  /** After which column the cursor sits: continuous while moving between beats, whole while holding. */
  cursor: number
  /** The circuit's identity (its JSON): two beats show the same circuit exactly when these agree. */
  key: string
  title: string | null
  /** `matrix` v2 (W-709 #15, qc709-Q6Q7.md ruling 5): the Pauli string measured after column `at`, drawn as a
   *  bracket across the wires plus its label. */
  observable: { pauli: string; at: number } | null
  shot?: CircuitShot
}

/* ----------------------------------------- matrix (709; SVG) ----------------------------------------- */
/**
 * A reduced matrix beside the main one (qc/density.ts `partialTrace`): which qubits were kept (ascending), and its
 * cells. `arrows` (v2, W-709 #15): one entry per contributing diagonal cell of the BIG matrix, `from` its index and
 * `to` the reduced matrix's diagonal index it feeds — exact for any `keep` subset (not just a contiguous half), so
 * 'A' draws exact arrows too (v1 drew a schematic set for 'A').
 */
export interface ResolvedMatrixReduced {
  which: 'A' | 'B' | 'keep'
  keep: number[]
  n: number
  cells: { re: number; im: number }[][]
  arrows: readonly { from: number; to: number }[]
}
/** `matrix` v2: eigenvalue bars (qc/cmat.ts `eigh`, unclamped — a negative value is real, not an error). */
export interface ResolvedMatrixSpectrum {
  mode: 'bars' | 'entropy'
  /** Descending. */
  values: number[]
  /** S = −Σ λ log₂ λ (qc/density.ts `vonNeumann`), only when `mode` is 'entropy'. */
  entropy: number | null
  /** The negative-eigenvalue flag's wording (P-Q9-story.md §9.2(b); qc709-Q8Q9 ruling 4), from the SOURCE, not from
   *  whether a value is currently negative: 'negative' for a `lin` difference source (an expected, non-state
   *  quantity); 'not a state' when the source claims to be a density matrix (a `rho` source, or any source after
   *  `ptranspose` — the Peres-test target); null for every other source. Show it only alongside an actually
   *  negative value. */
  flag: 'negative' | 'not a state' | null
}
export interface ResolvedMatrixGrid {
  kind: 'matrix'
  view: 'grid'
  /** Matrix side (a power of two, 2–8: 1–3 qubits). */
  n: number
  /** Row i, column j — from the engine, never from content. With `basis` set, this is B†AB, not A. */
  cells: { re: number; im: number }[][]
  labels: NonNullable<MatrixGridState['labels']>
  /** Precomputed row (bra) / column (ket) label text, empty strings when `labels` is 'none'. With `basis` set,
   *  these name the basis kets instead of the computational basis. */
  rowLabels: string[]
  colLabels: string[]
  values: NonNullable<MatrixGridState['values']>
  blocks: 2 | 4 | null
  highlight: readonly [number, number][]
  highlightRow: number | null
  highlightCol: number | null
  /** Σ_i cells[i][i], when `trace` is set (of the final grid, after `basis`/`ptranspose`). */
  trace: { re: number; im: number } | null
  partialTrace: ResolvedMatrixReduced | null
  /** Descending singular values (the Schmidt coefficients for a `coef` source; their squares are the Schmidt weights, the probabilities), when `svd` is set. */
  svd: number[] | null
  spectrum: ResolvedMatrixSpectrum | null
  /** `ptranspose` (v2): the moved cells [row, col], and the qubits the transpose was taken on. */
  ptranspose: { qubits: number[]; moved: readonly [number, number][] } | null
  shot?: MatrixShot
}
/** `matrix` v2: a Pauli-string table row — one coloured letter per qubit, its "card" (`values`) and its actual
 *  eigenvalue on a given `state` (qc/gates.ts `pauliEigenvalue`); `matches` is their agreement, when both are given. */
export interface ResolvedMatrixTableauRow {
  pauli: string
  letters: string[]
  card: 1 | -1 | null
  eigen: 1 | -1 | null
  matches: boolean | null
}
export interface ResolvedMatrixTableau {
  kind: 'matrix'
  view: 'tableau'
  qubits: number
  rows: ResolvedMatrixTableauRow[]
  /** The sequential product of every row (qc/gates.ts `pauliMul`, chained), when `product` is set. */
  product: { pauli: string; phase: { re: number; im: number } } | null
  shot?: MatrixShot
}
export type ResolvedMatrix = ResolvedMatrixGrid | ResolvedMatrixTableau

/* ----------------------------------------- two-qubit (709; SVG) ----------------------------------------- */
export interface ResolvedTwoQubit {
  kind: 'two-qubit'
  labels: NonNullable<TwoQubitState['labels']>
  local: NonNullable<TwoQubitState['local']>
  condition: Exclude<TwoQubitState['condition'], undefined> | null
  /** Reduced Bloch vectors r_A, r_B — from the engine (`reducedBloch`), never authored. */
  rA: V3
  rB: V3
  arrows: NonNullable<TwoQubitState['arrows']>
  grid: NonNullable<TwoQubitState['grid']>
  /** The 3×3 ⟨σᵢ⊗σⱼ⟩ (or T − r_A r_Bᵀ) grid, row i = A's axis, column j = B's axis; null when `grid` is 'none'. */
  T: readonly (readonly number[])[] | null
  highlight: readonly string[]
  axesA: readonly { theta: number; phi: number }[]
  axesB: readonly { theta: number; phi: number }[]
  /** Tr ρ² of the (possibly reduced) two-qubit density matrix. */
  purity: number
  /** S(ρ_A), the von Neumann entropy of A's own reduced state (= the entanglement entropy when the pair is pure). */
  entropy: number
  readouts: readonly string[]
  /** Present only for a `family: 'cos-sin'` source: lets a beat-to-beat transition lerp the angle and rebuild
   *  (stage/svg/twoQubit.ts `interpTwoQubitStage`), as `amplitudes` does for a swept direction. */
  sweep: { thetaDeg: number } | null
  /** Structural identity (source shape plus every non-numeric field): a different one hard-switches on transition. */
  key: string
  shot?: TwoQubitShot
}

/* --------------------------------------------- plot (709; SVG) --------------------------------------------- */
export interface ResolvedPlot {
  kind: 'plot'
  fn: PlotCurveName
  range: { from: number; to: number }
  /** Samples along the curve, x ascending; y from the named engine function, never authored. */
  points: { x: number; y: number }[]
  /** Points on the curve at an authored x; y computed the same way as `points`. */
  markers: { x: number; y: number; label?: string }[]
  bands: { yFrom: number; yTo: number; label?: string }[]
  yLines: { y: number; label?: string }[]
  /** The drawn y-range: the curve's own min/max, widened to cover every band and yLine too. */
  yMin: number
  yMax: number
  shot?: PlotShot
}

export type AnyResolved =
  | ResolvedLab
  | ResolvedPlane
  | ResolvedBloch
  | ResolvedBall
  | ResolvedHopf
  | ResolvedOperator
  | ResolvedComplexPlane
  | ResolvedAmplitudes
  | ResolvedCircuit
  | ResolvedMatrix
  | ResolvedTwoQubit
  | ResolvedPlot
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
