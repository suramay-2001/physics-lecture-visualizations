/**
 * Stage contracts: what a story beat puts on the dark stage (W-L1 §1; frozen at tag `l1-freeze`).
 *
 * Rules
 *  (a) Everything here is optional on `Unit`/`Lecture`, so lectures without a story type-check unchanged.
 *  (b) Stage state is physics-level and serializable: named kets, degrees, weights. No three.js, no colours,
 *      no functions. `content.test.tsx` round-trips every beat's stage through JSON.
 *  (c) Content never writes observables (P(+), |r|, eigenvalues). `stage/resolve.ts` recomputes them with
 *      the engine (`app/src/physics/`), so prose, stage and claims cannot drift.
 *  (d) Passport text cannot be authored per beat: it is derived from the kind (`passportOf`), so it cannot
 *      be forgotten. Its wording lives in one table below (P and D may reword it; not an interface change).
 *
 * Changing anything exported here after the freeze is an interface change: write a note in
 * `docs/roles/interface-changes.md`; W applies it on main. Additive optional fields go through W.
 *
 * Interface change W-709 #1 (2026-09-28, W-709-platform §B "Two tracks"; additive, optional): a Physics 709 chapter
 * is written twice over ONE stage. `Beat.formal`, `Beat.captionFormal`, `BeatReveal.formal`,
 * `BeatReveal.captionFormal`, `Beat.derivation` (`Derivation`, `DerivStep`), `ReviewCard.formal`,
 * `GlossEntry.formal` hold the Formal track; the existing fields are the Ground-up track (448 is Ground-up only and
 * unchanged). Beat ids, stages, terms, fidelity and claims are shared by both tracks, so a reading position or a
 * bridge target holds in either. `content/track.ts` `pickTrack` is the only reader of the pairs.
 * Interface change W-709 #2 (2026-09-28, judge's ruling on the pilot plans): beat phase `'core'` ("The foundation")
 * for the Foundations chapters F1–F8, which have no lecture notes; `'core'` only in F chapters, `'lecture'` never in
 * them (content.test.tsx `phaseProblems`).
 * Interface change W-709 #3 (2026-09-28, §C "Bridges"; additive): `GlossEntry.bridge` names a bridge
 * (content/qc709/bridges.ts) that the gloss popover offers; prose bridges use `<<id|shown>>` (content/walk.ts).
 * Interface change W-709 #4 (2026-09-28, §E "Stage kinds"; additive): `KIND_RENDER` says whether a kind draws on the
 * WebGL canvas or as SVG in the stage box (every 448 kind: 'gl').
 * Interface change W-709 #11 (2026-10-02, "derivations drive the stage"; additive): `DerivStep.view?: StageState` and
 * `.viewCaption?: string`. A step without `view` inherits the latest earlier view in its own track's list; before any
 * view, the beat's own `stage` applies. `content/track.ts` `derivViewAt`/`derivFigureGroups` read this; the live story
 * (`components/Derivation.tsx`, `stage/store.ts` `setDerivOverride`) drives the beat's stage to it, and the reading
 * version (`stage/StaticStory.tsx`) prints one `FigureFor` per distinct view after the derivation.
 * Interface change W-709 #12 (2026-10-02, "notation beats"; additive): `GlossEntry.introduces?: 'space' | 'notation'`
 * and `Beat.introduces?: string[]` (gloss ids this beat introduces). `content/glossRegistry.ts` `introducesLabel`
 * reads it for the "New notation" / "New space" eyebrow (both tracks, story and Read mode).
 * Interface change W-709 #15 (2026-10-03, `matrix` v2; additive): `MatrixSource` gains `product`, `adjoint`, `lin`
 * (a fixed exact coefficient set `MatrixCoef`) and a multi-letter `pauli` string (n ≤ 3); `MatrixGridState` (the v1
 * `MatrixState`, renamed) gains `partialTrace: 'A' | 'B' | {keep}`, `basis: 'bell' | AmpSource[]` (draws B†MB),
 * `spectrum: 'bars' | 'entropy'` and `ptranspose: 'B'`. A new `MatrixTableauState` (`tableau`, `product`, `values`,
 * `state`) shares the kind; `MatrixState` is now their union, read by `'tableau' in st`. `CircuitStageState` gains
 * `observable?: {pauli, at}`. See `stage/svg/matrix.ts`, `stage/types.ts`, `docs/specs/stage-kinds.md`.
 */
import type { Axis, Sign } from '../physics/sg'
import type { NamedKet } from '../physics/spin'
import type { CourseId } from './courses'
import type { Claim, Ref } from './schema'
import type { Anchor, AmpShot, BallShot, BlochShot, CircuitShot, ComplexShot, HopfShot, LabShot, MatrixShot, OperatorShot, PlaneShot, TwoQubitShot } from './stageVocab'
import type { Circuit, GateName } from '../physics/qc/circuit'

/* ------------------------------------------------------------------------------------------------ */
/* Kinds and shared value types                                                                      */
/* ------------------------------------------------------------------------------------------------ */

/** Physics 448's kinds (its fidelity table, content/fidelity.ts FIDELITY, covers exactly these). */
export const STAGE_KINDS_448 = ['lab-r3', 'hilbert-plane', 'bloch', 'bloch-ball', 'hopf', 'operator-space'] as const
export type StageKind448 = (typeof STAGE_KINDS_448)[number]
/** Physics 709's own kinds (their fidelity lives in content/qc709/fidelity.ts, registered with the course pack). */
export const STAGE_KINDS_709 = ['complex-plane', 'amplitudes', 'circuit', 'matrix', 'two-qubit'] as const
export type StageKind709 = (typeof STAGE_KINDS_709)[number]
export const STAGE_KINDS = [...STAGE_KINDS_448, ...STAGE_KINDS_709] as const
export type StageKind = (typeof STAGE_KINDS)[number]

/**
 * How a kind is drawn (W-709-platform §E "Stage kinds"; interface change W-709 #4). 'gl': a scene on the one shared
 * WebGL canvas (stage/StageHost.tsx, lazy three chunk). 'svg': DOM in the stage box's slot (stage/svg/SvgStage.tsx,
 * lazy), driven by the same resolve → interp → store pipeline, so scrubs, beat transitions, reveals, passports,
 * readouts and captions behave the same; it needs no WebGL. An SVG kind's ONE scene component also draws its print
 * figure (stage/figures/FigureFor.tsx, mode 'print').
 */
export const KIND_RENDER: { readonly [K in StageKind]: 'gl' | 'svg' } = {
  'lab-r3': 'gl',
  'hilbert-plane': 'gl',
  bloch: 'gl',
  'bloch-ball': 'gl',
  hopf: 'gl',
  'operator-space': 'gl',
  'complex-plane': 'svg',
  amplitudes: 'svg',
  circuit: 'svg',
  matrix: 'svg',
  'two-qubit': 'svg',
}
export const isSvgKind = (k: StageKind): boolean => KIND_RENDER[k] === 'svg'
/** The kinds of a list drawn on the WebGL canvas / as SVG (order kept). */
export const glKinds = (ks: readonly StageKind[]): StageKind[] => ks.filter((k) => KIND_RENDER[k] === 'gl')
export const svgKinds = (ks: readonly StageKind[]): StageKind[] => ks.filter((k) => KIND_RENDER[k] === 'svg')

/** Authors think in degrees. The resolver converts to radians once. */
export type Deg = number

/**
 * A value swept across the beat's hold window as the reader scrolls (hold progress s: 0 → 1, `stage/sample.ts`).
 * `ease` defaults to 'linear' (scroll ∝ value, D §4.0). Under reduced motion s snaps to {0, ½, 1} (decision #18).
 */
export interface Sweep {
  from: number
  to: number
  ease?: 'linear' | 'smooth'
}
export type Scrub = number | Sweep

/** A pure state / direction on S²: a named ket, or Bloch polar angles (θ from +z, φ from +x toward +y). */
export type Dir = NamedKet | { thetaDeg: Scrub; phiDeg: Scrub }

/** A measurement axis n̂: sg.ts `Axis` ('x' | 'y' | 'z' | tilt°), a scrubbed x–z tilt, or any direction. */
export type MeasureAxis = Axis | { tiltDeg: Scrub } | { thetaDeg: Scrub; phiDeg: Scrub }

/* ------------------------------------------------------------------------------------------------ */
/* Per-kind states                                                                                   */
/* ------------------------------------------------------------------------------------------------ */

/* ---- lab-r3: the Stern–Gerlach bench (physics coordinates: beam along +y, z up) ---- */
export interface LabDevice {
  /**
   * Measurement axis in the x–z plane. 'x' | 'z' | a tilt in degrees from +z toward +x (sg.ts `tiltXZ`).
   * 'y' is a validation error: the beam flies along y (fidelity "lab-beam-along-y").
   */
  axis: Axis | { tiltDeg: Scrub }
  /** Which output continues. Required on every device but the last (validated). */
  keep?: Sign
  /** The non-kept output lands on its own plate instead of a beam stop (l1-logic bench `x-first`). */
  openOther?: boolean
}
export interface LabBench {
  /** 'main' for one bench; two benches ('A' top pane = `z-first`, 'B' bottom pane = `x-first`, D §4.4). */
  id: 'main' | 'A' | 'B'
  /** 'oven' = unpolarized: no state chip (P2 §1). */
  source: 'oven' | NamedKet
  /** 1..4 devices. */
  devices: LabDevice[]
  /** Draw the upstream preparation greyed (source '+z' ⇒ SG_z with − blocked). */
  showPrep?: boolean
  /**
   * Default true. `false` ⇒ this bench emits no atoms (its magnets and plates still stand), so one of two
   * benches can fire at a time (l1-logic b2/b3, D §4.4). The stage-level `flow` still applies to the benches
   * that fire. Interface change #2 (2026-09-25, additive).
   */
  fires?: boolean
}
export type LabModel = 'quantum' | 'classical' | 'hidden-label' | 'black-box'
export type LabReadout =
  | 'fractions' // segment fractions 1 → ½ → ¼ …
  | 'blocked' // blocked fraction at each stop
  | 'centroid' // m̂/n̂ arrows + centroid tick ⟨σₙ⟩ (l1-average:b2)
  | 'fill-bar' // P(+) fill bar (l1-average:b3)
  | 'sigma-band' // ±1σ finite-sample band of the MEAN (l1-average:b4)
  | 'spread' // ±Δσ of SINGLE readings around the centroid, √(1 − ⟨σₙ⟩²) (Lecture 3 §7); needs 'centroid'
  | 'truth-table' // true/false tallies per bench (l1-logic)
  | 'tally-bars' // tallies grown into two bars (l1-logic:b4)
export interface LabState {
  kind: 'lab-r3'
  benches: [LabBench] | [LabBench, LabBench]
  /** Default 'gradient'. 'uniform' ⇒ no split, precession glint (l1-quantized:b5a). */
  field?: 'gradient' | 'uniform'
  /** Labelled overlays; default 'quantum'. */
  model?: LabModel
  /** Atom flow. 'single' = one tracked atom (l1-sequential:b5, l1-logic:b5). Default 'stream'. */
  flow?: 'off' | 'stream' | 'single'
  /** Default 'build'. */
  deposit?: 'build' | 'hold' | 'clear'
  /** Finite-sample batches (l1-average:b4): the deposit resets and N atoms fire per batch; the batch index
   *  advances with the hold progress s in equal parts. */
  batches?: number[]
  /** Dashed classical-prediction band on the plate (l1-quantized:b2, b3). */
  ghostBand?: boolean
  readouts?: LabReadout[]
  /** Dim the 3D benches to 50 % so DOM readouts carry the beat (l1-logic:b4). */
  dim?: boolean
  /** 'optical' = polarizer bench (L6 §6.3): changes passport and fidelity. Default 'sg'. */
  variant?: 'sg' | 'optical'
  shot?: LabShot
  /**
   * Where the beam ends. Default 'plate'. 'gap' = the atoms stream into the magnet gap and stop at the last
   * magnet's exit, so the plate is not seen yet (l1-quantized:b1, "atoms stream into the gap"). A 'gap' beat
   * cannot carry plate readouts or batches (validated). Interface change D5 (2026-09-25, additive).
   */
  beamTo?: 'gap' | 'plate'
  /**
   * P-Q1-story §9.2 S4 (schematic): multiplies the DRAWN split at the plate (the last magnet's push, the spots, the
   * deposit) by this factor; the readouts and fractions are unchanged. Default 1; at most 1.25 (the spots stay on the
   * plate), so "twice as far apart" is written 0.5 → 1.
   */
  gradientScale?: number
}

/* ---- hilbert-plane: the real slice of ℂ² (decision L1 #5) ---- */
export type PlaneKet =
  | '+z' | '-z' | '+x' | '-x' // real kets only; '+y' is a type error by construction
  | { planeDeg: Scrub } // angle in the plane; 0° = |+z⟩ (horizontal), 90° = |−z⟩ (vertical)
  | { blochDeg: Scrub } // |+n⟩ = ketFromBloch(θ, 0), drawn at θ/2: the half-angle is computed, never authored
  | { neg: PlaneKet } // −|ψ⟩: another arrow, the same physical state
export interface HilbertPlaneState {
  kind: 'hilbert-plane'
  psi?: PlaneKet
  others?: { ket: PlaneKet; role: 'basis' | 'second' | 'ghost'; badge?: string }[]
  /** Measurement frame: 'z' = {|+z⟩, |−z⟩} (amber, cobalt); 'x' = {|+x⟩, |−x⟩}, the frame rotated 45°. */
  basis?: 'z' | 'x'
  /** Projections + squared-shadow bars (probabilities from `prob()`). */
  shadows?: boolean
  rightAngle?: boolean
  /** Silver angle arc from the first basis arrow to ψ, labelled θ/2 (split rig, D §3.2). */
  arc?: boolean
  /** 1/√2 ticks on both axes (l1-vectors:b3). */
  ticks?: boolean
  /**
   * Lecture 3: draw Â|ψ⟩ as a second arrow at its TRUE length (the plane zooms out when it is longer than 1). Real
   * matrices only (a complex entry would leave this slice; validated); need not be Hermitian (a quarter-turn R is
   * allowed). `label` is the arrow's TeX chip (default Â|ψ⟩). `readout: false` (additive, P-Q1 review item 10) drops
   * the "image = … × ψ · eigenvector" / "|image| = …" line from the readout column, for a beat whose caption already
   * says what the arrow is (q1-vector-space:b4, where the line covered the passport). Default true.
   */
  image?: PlaneOp & { label?: string; readout?: boolean }
  /**
   * Lecture 3's Rule 3 as a picture: draw P̂ᵢ|ψ⟩, the part of ψ along frame vector i (1 or 2), as a vector of length
   * |cᵢ|. With `renormalize` it grows to length 1 across the beat's hold: the state after that outcome.
   */
  project?: 1 | 2
  renormalize?: boolean
  /**
   * P-Q1-story §9.2 S1 (notes Fig. 2): two vectors of the plane and their SUM, drawn at its true length (the plane
   * zooms out as for `image`), with the dashed translated sides of the parallelogram. The sum is a vector, not a state:
   * its length is the engine's (linalg `vadd`, `norm`), usually not 1.
   */
  sumOf?: [PlaneKet, PlaneKet]
  /** P-Q1-story §9.2 S2: the label of the `arc` (default θ/2, the Bloch half-angle), e.g. '$\theta$' for Fig. 3's angle. */
  arcLabel?: string
  /**
   * P-Q2-story §9.2 S1 (additive): 'photon' names the axes and the shadow/bar readouts |x⟩, |y⟩ (no ± sign) instead
   * of the spin frame's |+z⟩/|−z⟩ (or 709's |0⟩/|1⟩), for the photon-polarization unit. Default 'spin' (unchanged).
   */
  labels?: 'spin' | 'photon'
  shot?: PlaneShot
}

/** A 2×2 operator on the plane: a named spin matrix or authored real entries (physics/expr.ts, no eval). */
export type PlaneOp = { named: 'I' | 'sx' | 'sz' | 'Sx' | 'Sz' } | { matrix: [[string, string], [string, string]] }

/* ---- bloch: pure states on S² ---- */
export interface BlochState {
  kind: 'bloch'
  state: Dir
  /** Apply R_n(φ) (spin.ts `rotation`); interpolated by angle, so R_z(360°) is a full lap, not a no-op. The axis is
   *  x, y, z or any direction (Lecture 6: a half turn about (x̂ + ẑ)/√2). */
  rotate?: { axis: 'x' | 'y' | 'z' | { thetaDeg: number; phiDeg: number }; angleDeg: Scrub }
  /** Multiplies the ket by e^{iγ}; the point must not move (readout only). */
  globalPhaseDeg?: Scrub
  measure?: MeasureAxis
  /** How to arrive from the previous beat (stage/interp.ts). Default: geodesic. */
  path?: 'geodesic' | { about: 'x' | 'y' | 'z' }
  trail?: boolean
  /** 'poincare' = light (L6 §6.3): changes passport and axis labels. */
  labels?: 'spin' | 'poincare'
  /** Dashed segments from the point to these axes: the segment to axis j has length 2ΔS_j/ħ (Lecture 7 §7.7). */
  dropLines?: ('x' | 'y' | 'z')[]
  /** DOM readouts from the engine: ⟨S_j⟩ (averages), ΔS_j (spreads), ΔS_xΔS_y vs ½|⟨S_z⟩| (bound; Lecture 7). */
  readouts?: ('averages' | 'spreads' | 'bound')[]
  shot?: BlochShot
}

/* ---- bloch-ball: pure + mixed states ---- */
export type BallPoint =
  | Dir // pure: on the surface
  | 'oven' // maximally mixed: r = 0
  | { mix: { of: Dir; w: number }[] } // Σw = 1 (validated); r = Σ w·r(of)
  | { r: [number, number, number] } // explicit Bloch vector, |r| ≤ 1 (validated)
export interface BallState {
  kind: 'bloch-ball'
  point: BallPoint
  /** Second marker (superposition vs mixture of the same ingredients). */
  compare?: BallPoint
  /** Draw the mix ingredients with their weights. */
  recipe?: boolean
  measure?: MeasureAxis
  /** How the NEXT beat is reached (stage/interp.ts): 'selective' = cut; 'non-selective' = straight chord. */
  update?: 'none' | 'selective' | 'non-selective'
  /** DOM readout |r|, Tr ρ². */
  purity?: boolean
  shot?: BallShot
}

/* ---- hopf: S³ → S² ---- */
/** Fiber sets, in reveal order (D §3.5 counts): none · pair (+z circle, −z line) · one (state + bead) ·
 *  ring (one latitude torus) · nested (two tori) · all (overview, `count` fibers). */
export const HOPF_FIBER_SETS = ['none', 'pair', 'one', 'ring', 'nested', 'all'] as const
export type HopfFibers = (typeof HOPF_FIBER_SETS)[number]
export interface HopfState {
  kind: 'hopf'
  fibers: HopfFibers
  /** Default 64 (gate: p95 5.4 ms). 128 only in the Blender opener (D §3.5). */
  count?: 64 | 128
  /** Highlight two fibers to show linking. */
  linking?: boolean
  /**
   * The marked state and its bead. `globalPhaseDeg` = χ, the position of the bead along its fiber.
   * χ = 0° and χ = 720° (or 360°) are the SAME state: the bead is back where it started. Scrubbing χ from
   * 0° to 720° draws two laps only because the animation path is not wrapped (stage/interp.ts, decision #15).
   * The "720° to return" fact belongs to the ROTATION angle φ of `rotate`:
   * R_z(φ)|ψ⟩ = e^{−iφ/2}(…), so φ = 360° gives −|ψ⟩ (χ − 180°) and φ = 720° gives |ψ⟩ back.
   */
  marked?: { state: Dir; globalPhaseDeg?: Scrub; rotate?: { axis: 'z'; angleDeg: Scrub } }
  /** Linked mini Bloch sphere. Default true. */
  mini?: boolean
  shot?: HopfShot
}

/* ---- operator-space: A = a₀I + a⃗·σ⃗ ---- */
export type OperatorSpec =
  | { a0: Scrub; a: [Scrub, Scrub, Scrub] }
  | { named: 'I' | 'sx' | 'sy' | 'sz' | 'Sx' | 'Sy' | 'Sz'; scale?: Scrub }
  /** Authored entries, compiled by physics/expr.ts `parseMatrix2` (no eval; complex mode, cell limits).
   *  `validateStage` flags a cell that does not compile or a matrix that is not Hermitian. */
  | { matrix: [[string, string], [string, string]] }
export interface OperatorState {
  kind: 'operator-space'
  /** Must be Hermitian (validated). */
  op: OperatorSpec
  /** Second arrow + sum. */
  add?: OperatorSpec
  /** ±â axis through the ghost Bloch sphere. */
  eigen?: boolean
  /** a₀ gauge; default true. */
  gauge?: boolean
  /**
   * 'plain' = the passport before the Pauli matrices exist (Lecture 3): "2×2 Hermitian", arrow = half the eigenvalue
   * gap, gauge = their midpoint; no σ in the label. Default 'sigma' (A = a₀I + a·σ, from Lecture 4 on).
   */
  labels?: 'sigma' | 'plain'
  shot?: OperatorShot
}

/* ---- complex-plane (709; SVG): numbers as points and arrows (P-F1-story §9.2 S1, S3, S4) ---- */
/** A complex number as authored: its parts, or its size and angle in degrees (an angle sweep turns the arrow). */
export type CNum = { re: Scrub; im: Scrub } | { r: Scrub; phiDeg: Scrub }
/**
 * Derived marks, every one computed by the resolver (content never writes them): 'sum' z + w tip to tail · 'product'
 * zw with the angle arcs of z, w and zw · 'conj' the mirror z* · 'parts' drop lines to both axes · 'modulus' the size
 * of every drawn number · 'arg' the angle arc of z (and of w, zw) · 'arc' the turn z has made (from 0, or from z to zw
 * with 'product') · 'velocity' the velocity iz of e^{iφ} at z (f' = if).
 */
export type ComplexMark = 'sum' | 'product' | 'conj' | 'parts' | 'modulus' | 'arg' | 'arc' | 'velocity'
export interface ComplexPlaneState {
  kind: 'complex-plane'
  z?: CNum
  w?: CNum
  show?: ComplexMark[]
  /** 1, z, z², …, z^upTo (complex.ts cpow): de Moivre's spiral. upTo is a whole number 0–64 (rounded when swept). */
  powers?: { of: CNum; upTo: Scrub }
  /**
   * 'imag': the polygon (1 + iφ/n)^k, k = 0…n (qc/complexExtra.ts eulerPath), closing on e^{iφ}; 'real': the points
   * (1 + x/n)^k on the line, closing on e^x. n is a whole number 1–1000 (rounded when swept).
   */
  euler?: { rate: 'imag'; phiDeg: Scrub; n: Scrub } | { rate: 'real'; x: number; n: Scrub }
  /** Arrows tip to tail and their resultant (phasorPath / phasorSum); sizes default to 1. At most 12 arrows. */
  chain?: { phasesDeg: Scrub[]; sizes?: number[] }
  /** Arrows from 0, not chained (no sum is drawn or read out: a question picture). At most 12 arrows. */
  spokes?: { phasesDeg: Scrub[]; sizes?: number[] }
  /** The unit circle; default true (off on the number line). */
  circle?: boolean
  /** Number-line mode: only the real axis is drawn, and every drawn number must be real (validated). */
  line?: boolean
  /** The path z's tip has swept during the hold so far. */
  trail?: boolean
  shot?: ComplexShot
}

/* ---- amplitudes (709; SVG): one bar per basis state (P-F1-story §9.2 S2, P-Q1-story §9.2 S5) ---- */
/**
 * Where the amplitudes come from; content never writes an amplitude. `ket`: a product state by label, one character per
 * qubit, q0 first (qc/state.ts `ket`: 0, 1, +, −); `bell`: a two-term state by content or standard name
 * (qc/state.ts `bell`: '00+11', 'Phi+'); `dir`: one qubit along a direction of 448's sphere (a named ket such as '+y',
 * or Bloch angles, which may sweep); `circuit`: the state after column `upTo` of a circuit (qc/circuit.ts `runCircuit`).
 */
export type AmpSource = { ket: string } | { bell: string } | { dir: Dir } | { circuit: Circuit; upTo?: Scrub; outcomes?: string }
export interface AmplitudesState {
  kind: 'amplitudes'
  state: AmpSource
  /**
   * 'amplitude' (default): a bar's length is |a| and its hue the phase of a · 'probability': length |a|², labelled as
   * chances · 'signed': real amplitudes above and below the axis, with their mean (Grover's inversion about the mean).
   */
  mode?: 'amplitude' | 'probability' | 'signed'
  /** A phase dial beside each bar (its hand turns to the phase; its length is |a|). */
  dials?: boolean
  /** Two bars' amplitudes drawn tip to tail with their resultant (computed), e.g. [0, 1]. */
  sum?: [number, number]
  /** Bar labels: 'bits' |00⟩ … (default); 'spin' |0⟩ = |+z⟩, |1⟩ = |−z⟩ (one qubit; the 709 lock). */
  labels?: 'bits' | 'spin'
  /**
   * P-Q2-story §9.2 S2 (additive): multiplies every amplitude by e^{iγ} before drawing (γ in degrees). Dials turn
   * together; bar lengths and chances are unchanged (a phase). Readout: "phase γ° · same state".
   */
  globalPhaseDeg?: Scrub
  shot?: AmpShot
}

/* ---- circuit (709; SVG): a physics/qc/circuit.ts Circuit, q0 the top wire, with a cursor between columns ---- */
export interface CircuitStageState {
  kind: 'circuit'
  /** THE circuit format (qc/circuit.ts): validated by its own validator; the stage draws at most 5 qubits, 24 columns. */
  circuit: Circuit
  /** The cursor sits after column `upTo` (0 = before the first … K = after the last; default K); whole columns, may sweep. */
  upTo?: Scrub
  /** One bit per measurement for a circuit that measures mid-way (qc/circuit `runCircuit` outcomes). */
  outcomes?: string
  /**
   * `matrix` v2 (W-709 #15; qc709-Q6Q7.md ruling 5): the Pauli string measured after column `at`, drawn as a
   * bracket across the wires plus its label. `pauli` is one letter (I/X/Y/Z) per wire of the circuit.
   */
  observable?: { pauli: string; at: number }
  shot?: CircuitShot
}

/* ---- matrix (709; SVG): a labelled complex matrix — operators, outer products, ρ, A⊗B, a 2-qubit coefficient matrix ---- */
/** A built-in gate's own matrix (physics/qc/gates.ts), before any embedding: one qubit, or a named multi-qubit shorthand. */
export const MATRIX_GATE_NAMES = ['I', 'X', 'Y', 'Z', 'H', 'S', 'Sdg', 'T', 'Tdg', 'P', 'Rx', 'Ry', 'Rz', 'CNOT', 'CZ', 'SWAP', 'Toffoli', 'Fredkin'] as const
export type MatrixGateName = (typeof MATRIX_GATE_NAMES)[number]
export interface MatrixGateSpec {
  name: MatrixGateName
  /** P, Rx, Ry, Rz take one angle in degrees (may sweep); the other names ignore it. */
  params?: Scrub[]
}
/**
 * `matrix` v2 (W-709 #15): a coefficient in a `lin` combination, from a FIXED exact set — content picks a token or
 * names an angle, never types a decimal. `MATRIX_COEF_EXACT`: ±1, ±½, ±i, ±1/√2. `{trig, angleDeg}`: cos or sin of
 * a named angle in degrees (may sweep; `name` is display-only, e.g. "θ" in a readout).
 */
export const MATRIX_COEF_EXACT = ['+1', '-1', '+1/2', '-1/2', '+i', '-i', '+1/sqrt2', '-1/sqrt2'] as const
export type MatrixCoefExact = (typeof MATRIX_COEF_EXACT)[number]
export type MatrixCoef = MatrixCoefExact | { trig: 'cos' | 'sin'; angleDeg: Scrub; name?: string }
/**
 * `matrix` v2: a basis to view an operator in, B†AB. `'bell'`: the standard Bell basis Φ+, Φ−, Ψ+, Ψ− (qc/state.ts
 * `BELL_BASIS`; a side of 4 only). A custom basis is a list of kets (the `amplitudes` kind's own `AmpSource`
 * vocabulary), one per row/column, read off in order; its length must match the matrix's side.
 */
export type MatrixBasis = 'bell' | AmpSource[]
/**
 * Where the matrix comes from; content never writes an entry, only the inputs. `gate`: a built-in gate's own dense
 * matrix, or — with `qubits` (the register size) — that gate embedded on `targets` (default its own wires in order,
 * e.g. [0] for a one-qubit gate) with `controls` (qc/state.ts `embed`). `outer`: |ψ⟩⟨φ| (φ defaults to ψ).
 * `rho`: a pure state's density matrix, or a mixture Σ w_k|ψ_k⟩⟨ψ_k| (qc/density.ts `densityOf`/`mixtureN`; weights
 * are engine values or exact fractions computed in code, never a decimal typed into prose, and must sum to 1).
 * `kron`: A ⊗ B of two matrix sources (qc/cmat.ts `kronM`). `coef`: a two-qubit state's 2×2 coefficient matrix
 * C_{ab} = ⟨a_0 b_1|ψ⟩ (qc/state.ts `coefMatrix`). `pauli`: a Pauli string of 1–3 letters (I/X/Y/Z; q0 first,
 * qc/gates.ts `pauliString`) — a single letter is the raw 2×2 matrix, as in v1. Kets reuse the `amplitudes` kind's
 * own source vocabulary (`AmpSource`): `ket`, `bell`, a 448 `dir`, or a circuit's state at `upTo`.
 *
 * `matrix` v2 (W-709 #15): `product` is the ordinary matrix product of same-side sources, left to right
 * (U†(Z⊗I)U is `{product: [{adjoint: U}, {kron: [...]}, U]}`). `adjoint` is A† (qc/linalg.ts `dagger`). `lin` is a
 * linear combination Σ c_k·A_k with each coefficient from the fixed exact set `MatrixCoef` (r·σ/2 is a `lin` of the
 * three Paulis; Π_xy and Tr(Aρ)'s `A` are built the same way; Σ A†A chains `adjoint` + `product` + `lin`).
 */
export type MatrixSource =
  | { gate: MatrixGateSpec; qubits?: number; targets?: number[]; controls?: number[] }
  | { outer: [AmpSource, AmpSource?] }
  | { rho: { ket: AmpSource } | { mixture: { w: Scrub; ket: AmpSource }[] } }
  | { kron: [MatrixSource, MatrixSource] }
  | { coef: AmpSource }
  | { pauli: string }
  | { product: MatrixSource[] }
  | { adjoint: MatrixSource }
  | { lin: { c: MatrixCoef; src: MatrixSource }[] }
export interface MatrixGridState {
  kind: 'matrix'
  source: MatrixSource
  /** Row/column labels: kets (⟨00| rows, |00⟩ … columns), plain indices, or none. Default 'kets'. With `basis` set,
   *  'kets'/'indices' both show the basis's own ket names instead (a chosen basis has no index order worth naming). */
  labels?: 'kets' | 'indices' | 'none'
  /** Cell numbers: 'none' (colour only), 'exact' (an engine helper or a fixed table of known exact values, else
   *  falls back to a decimal), or 'decimal' (the existing `d()` formatting). Default 'decimal'. */
  values?: 'none' | 'exact' | 'decimal'
  /** A tensor-structure grid: gridlines dividing the matrix into a 2×2 or 4×4 arrangement of equal blocks. */
  blocks?: 2 | 4
  /** Individually highlighted cells [row, col]. */
  highlight?: [number, number][]
  /** Outline one whole row / column (e.g. reading off ⟨i|A|j⟩ for a fixed i or j). */
  highlightRow?: number
  highlightCol?: number
  /** The diagonal sum, read out as "Tr = …". */
  trace?: true
  /**
   * Overlay arrows from the matrix's blocks to a reduced matrix drawn beside it (qc/density.ts `partialTrace`):
   * 'A' traces out the first half of the register (keeping B); 'B' traces out the second half (keeping A), the
   * common case (e.g. Tr_B of a Bell pair's ρ); `{keep}` (v2, W-709 #15) traces out every OTHER qubit, keeping
   * exactly the listed ones (e.g. Tr₃ of a GHZ state's ρ is `{keep: [0, 1]}`) — the engine already takes any qubit
   * set. Needs an even qubit count for 'A'/'B', or a `keep` that is a proper, non-empty subset for `{keep}`.
   */
  partialTrace?: 'A' | 'B' | { keep: number[] }
  /** Schmidt-weight bars beside a `coef` matrix (its singular values, qc/cmat.ts `svd`; only valid with `coef`). */
  svd?: true
  /** `matrix` v2 (W-709 #15): view the operator in another basis, B†AB (qc/linalg.ts `dagger`/`matmul`; built from
   *  `MatrixBasis`). Applied before `ptranspose`, `trace`, `partialTrace` and `svd`, which then read the new grid. */
  basis?: MatrixBasis
  /**
   * `matrix` v2: eigenvalue bars beside the grid (qc/cmat.ts `eigh`, unclamped — a negative eigenvalue is flagged,
   * not hidden, e.g. after `ptranspose` for the Peres test). 'entropy' adds the −λlog₂λ terms and an S readout
   * (qc/density.ts `vonNeumann`). Only valid on a Hermitian matrix (checked by resolving it).
   */
  spectrum?: 'bars' | 'entropy'
  /**
   * `matrix` v2: the partial transpose on the register's second half (qc/density.ts `ptranspose`; the Peres
   * criterion, Q10/Q12), with the cells it moves highlighted. The grid then shows ρ^{T_B}, not ρ.
   */
  ptranspose?: 'B'
  shot?: MatrixShot
}
/**
 * `matrix` v2 (W-709 #15; qc709-Q6Q7.md ruling 4): a Pauli-string table — one row per string, one coloured letter
 * per qubit — instead of a numeric grid. `product`: an extra row with the sequential product of every row (qc/gates.ts
 * `pauliMul`, chained left to right) and its phase. `values`: a "card" of assigned ±1 outcomes, keyed by the exact
 * row string (e.g. Mermin's four instruction settings XXX/XYY/YXY/YYX). `state`: a ket (the `amplitudes` kind's
 * `AmpSource` vocabulary) whose actual eigenvalue (qc/gates.ts `pauliEigenvalue`) is shown per row and checked
 * against `values`' card for that row ("the card matches").
 */
export interface MatrixTableauState {
  kind: 'matrix'
  /** Pauli strings (I/X/Y/Z, q0 first), one per row, all the same length (1–3 qubits). */
  tableau: string[]
  product?: true
  values?: Record<string, 1 | -1>
  state?: AmpSource
  shot?: MatrixShot
}
export type MatrixState = MatrixGridState | MatrixTableauState

/* ---- two-qubit (709; SVG): two Bloch balls (A, B) and a 3×3 ⟨σᵢ⊗σⱼ⟩ correlation grid ---- */
/**
 * Where the pair's state comes from; content never writes a Bloch vector or a correlation. `ket`: any two-qubit ket
 * `amplitudes` accepts (reuses its `AmpSource` vocabulary: `ket`, `bell`, a circuit's state at `upTo`). `family`:
 * cos θ|00⟩ + sin θ|11⟩, sweepable (a product state at θ = 0° opening into the maximally entangled Φ+-like state at
 * θ = 45°). `rho`: the `matrix` kind's own ρ sources, a pure state's density matrix or a mixture (qc/density.ts
 * `densityOf`/`mixtureN`). `reduce`: a THREE-qubit ket with one qubit traced out, keeping the two named `keep`
 * (q0-indexed into that ket, `keep[0]` drawn as A); `physics/qc/density.ts reducedBloch`/`reducedDensity` read the
 * kept qubits straight off the original ket, so the grid and the arrows are exact even though the pair's own state
 * is generally mixed.
 */
export type TwoQubitSource =
  | { ket: AmpSource }
  | { family: 'cos-sin'; thetaDeg: Scrub }
  | { rho: { ket: AmpSource } | { mixture: { w: Scrub; ket: AmpSource }[] } }
  | { reduce: { ket: AmpSource; keep: [number, number] } }
export interface TwoQubitState {
  kind: 'two-qubit'
  source: TwoQubitSource
  /** One-qubit gates (no angle: I, X, Y, Z, H, S, Sdg, T, Tdg only) applied to A or B before anything else is read off. */
  local?: { qubit: 0 | 1; gate: GateName }[]
  /** A's or B's own arrow becomes the ±`basis` eigenstate of `outcome`, and the OTHER ball's arrow becomes its exact
   *  post-measurement reduced state (physics/qc/measure.ts `measureInBasis` + `reducedBloch`). Only on a `ket` source. */
  condition?: { qubit: 0 | 1; basis: 'x' | 'y' | 'z'; outcome: 0 | 1 }
  /** The reduced Bloch vectors r_A, r_B (default 'reduced'); an arrow shorter than 1 reads visibly as mixed. */
  arrows?: 'reduced' | 'none'
  /** 'T': ⟨σᵢ⊗σⱼ⟩; 'T-minus-rr': the connected correlation T − r_A r_Bᵀ (the part no local average explains). Default 'none'. */
  grid?: 'none' | 'T' | 'T-minus-rr'
  /** Individually outlined cells of the grid, e.g. ['xx', 'zz'] (the Bell state's stabilizers). */
  highlight?: Array<`${'x' | 'y' | 'z'}${'x' | 'y' | 'z'}`>
  /** Up to 2 measurement directions drawn on each ball (CHSH settings); purely structural until chsh lands. */
  axes?: { a?: Dir[]; b?: Dir[] }
  /** Readouts whose engine function has not landed (concurrence, chsh) are rejected by the validator. */
  readouts?: ('purity' | 'rLength' | 'entropy' | 'concurrence' | 'chsh')[]
  /** 'A-B' (Alice/Bob, default) or 'q1-q2' (the notes' own qubit numbering). */
  labels?: 'A-B' | 'q1-q2'
  shot?: TwoQubitShot
}

export type StageState =
  | LabState
  | HilbertPlaneState
  | BlochState
  | BallState
  | HopfState
  | OperatorState
  | ComplexPlaneState
  | AmplitudesState
  | CircuitStageState
  | MatrixState
  | TwoQubitState
export type StateOf<K extends StageKind> = Extract<StageState, { kind: K }>

/* ------------------------------------------------------------------------------------------------ */
/* Layout: one stage per unit; a beat shows one kind, two kinds stacked, or a small inset            */
/* ------------------------------------------------------------------------------------------------ */

/**
 * `split` stacks two panes top/bottom (the portrait stage is too narrow for columns, D §3.2 split rig).
 * `inset` puts a small view in the stage corner (D §6.3: 220 × 248 px, title outside the 3D view).
 * The two kinds of a layout must differ (validated): a kind keeps ONE view per unit, and going from
 * full to a split pane resizes the same scene (no remount).
 */
export type StageLayout =
  | StageState
  | { layout: 'split'; top: StageState; bottom: StageState }
  | { layout: 'inset'; main: StageState; inset: StageState }

export type ViewSlot = 'full' | 'top' | 'bottom' | 'main' | 'inset'

/** Every (slot, state) of a layout, main first. */
export function layoutSlots(l: StageLayout): { slot: ViewSlot; state: StageState }[] {
  if ('layout' in l) {
    return l.layout === 'split'
      ? [
          { slot: 'top', state: l.top },
          { slot: 'bottom', state: l.bottom },
        ]
      : [
          { slot: 'main', state: l.main },
          { slot: 'inset', state: l.inset },
        ]
  }
  return [{ slot: 'full', state: l }]
}

/** The states of a layout, main first. */
export function layoutStates(l: StageLayout): StageState[] {
  return layoutSlots(l).map((s) => s.state)
}

/** The kind whose background and passport lead the stage box (full → it; split → top; inset → main). */
export function mainKind(l: StageLayout): StageKind {
  return layoutStates(l)[0].kind
}

/** The state of `kind` in a layout, or null when the kind is absent. */
export function stateOfKind<K extends StageKind>(l: StageLayout, kind: K): StateOf<K> | null {
  for (const s of layoutStates(l)) if (s.kind === kind) return s as StateOf<K>
  return null
}

/* ------------------------------------------------------------------------------------------------ */
/* Beats, terms, fidelity, review, glossary                                                          */
/* ------------------------------------------------------------------------------------------------ */

/**
 * P2's [L] lecture says · [B] books add · [C] clues. Order within a unit is always L → B → C. Physics 709's Foundations
 * chapters (F1–F8) have no lecture notes: their first phase is `'core'` ("The foundation"), in the lecture's place
 * (core → books → clue). `'core'` appears only in F chapters and `'lecture'` never does (content.test.tsx).
 */
export type BeatPhase = 'lecture' | 'core' | 'books' | 'clue'

/** Ids of terms, glosses and fidelity items. Rendered into class names, so the alphabet is closed. */
export const ID_RE = /^[a-z0-9-]+$/
/** `/^[a-z0-9-]+$/`, rendered as the class `term-${id}`. */
export type TermId = string
export interface TermTarget {
  kind: StageKind
  /** ∈ ANCHORS[kind] (content/stageVocab.ts, D-owned). */
  anchor: Anchor
}

/**
 * Beat id: `${unitId}:b${n}` with an optional letter for split beats (decision #24: `l1-quantized:b5a`,
 * `b5b`). Numbers run 1, 2, 3 … without gaps; a lettered number uses a, b, c … in order (checkBeatIds).
 */
export const BEAT_ID_RE = /^([a-z0-9-]+):b([1-9]\d*)([a-z]?)$/

/**
 * Clue beats are click-to-reveal inside the story (decision #17). Until the reader presses "Show me" the
 * stage holds the beat's own `stage` (the question picture) and the prose shows `Beat.text` (the question).
 * After it: `reveal.text` appears under the question and the stage moves to `reveal.stage` (a click-driven
 * transition; a cut under reduced motion). `reveal.stage` absent ⇒ the picture stays.
 * The runtime keeps "revealed" per beat (`stage/store.ts` `setRevealed` / `useRevealed`).
 */
export interface BeatReveal {
  /** The step of reasoning (rich), never just "the answer is X". */
  text: string
  caption?: string
  /** The Formal track's reveal (709: required on every reveal; sentences ≤ 40 words). */
  formal?: string
  /** The Formal track's caption of the revealed picture (defaults to `caption`). */
  captionFormal?: string
  stage?: StageLayout
  /** Terms used in `text`/`caption` of the reveal; their kinds must be in the revealed layout. */
  terms?: Record<TermId, TermTarget>
  fidelity?: string[]
  claims?: Claim[]
}

export interface Beat {
  /** `${unitId}:b${n}` or `…:b${n}${letter}` (BEAT_ID_RE); unique per lecture. */
  id: string
  phase: BeatPhase
  /** Core text; for a clue beat, the question. Rich: $tex$, [[gloss]], {{term|…}}, \htmlClass{term-…}{…}. */
  text: string
  /** Stage caption (DOM, rich inline). */
  caption?: string
  /**
   * The Formal track's text (709: required on every beat; full notation, sentences ≤ 40 words). `text` is the
   * Ground-up track (sentences ≤ 25 words). Same syntax, same terms (listed once in `terms`), same claims.
   */
  formal?: string
  /** The Formal track's stage caption (defaults to `caption`: the picture is the same). */
  captionFormal?: string
  /**
   * A derivation shown under the text, stepped by `components/Derivation.tsx`: all lines at rest, one at a time on
   * request. Both lists END ON `result` (the last step's TeX ends with the result's right-hand side) and Ground-up has
   * at least as many steps as Formal (content.test.tsx).
   */
  derivation?: Derivation
  /** The picture while this beat's text is at the centre line (for a clue: the question picture). */
  stage: StageLayout
  /** Required on clue beats, forbidden on the others (content test, decision #17). */
  reveal?: BeatReveal
  /** Every term used in text/caption must be listed; every listed term must be used (content test). */
  terms?: Record<TermId, TermTarget>
  /** FidelityItem ids to flag as "relevant now" on this beat (e.g. 'lab-both-paths'). */
  fidelity?: string[]
  /** Badge "beyond the lecture" (decision L1 #6). */
  beyondLecture?: true
  /** Books beats cite here. */
  refs?: Ref[]
  /** Every number in text/caption. */
  claims?: Claim[]
  /**
   * Gloss ids (`GlossEntry.introduces`) this beat introduces (interface change W-709 #12; additive): shows a small
   * "New space" / "New notation" eyebrow above the beat's text, in both tracks and in Read mode.
   */
  introduces?: string[]
}

/** One line of a derivation: where the algebra arrives, and why the step is allowed. */
export interface DerivStep {
  /** The line itself: display TeX. */
  tex: string
  /** Why this step holds (rich text; the track's sentence cap applies). */
  why: string
  /** Numbers this line shows (the claim ledger reads the step's `why` and `tex`). */
  claims?: Claim[]
  /**
   * The stage while this line is active (interface change W-709 #11; additive): a single state, using a kind already
   * shown elsewhere in this unit's stage (content/content.test.tsx checks both). A step without `view` inherits the
   * latest earlier step's (within the SAME track's list — ground and formal carry their own); before any view the
   * beat's own `stage` applies. Story mode moves the stage to it on step/select (`stage/drive.ts` `driveUnit`); Read
   * mode and print draw it as a `FigureFor` figure after the derivation, one per distinct view.
   */
  view?: StageState
  /** The stage caption while this line's view is the one showing (defaults to the beat's own `caption`). */
  viewCaption?: string
}

/**
 * A derivation in both tracks over one result. Ground-up explains every move (9th-grade algebra, no step skipped);
 * Formal is the same argument in full notation. Both lists end on `result`; Ground-up never has fewer steps.
 */
export interface Derivation {
  /** What is derived (display TeX), shown in the derivation's head. */
  result: string
  ground: DerivStep[]
  formal: DerivStep[]
}

export interface FidelityItem {
  /** /^[a-z0-9-]+$/, globally unique. */
  id: string
  /** Student-facing sentence (rich). */
  text: string
}
export interface Fidelity {
  exact: FidelityItem[]
  schematic: FidelityItem[]
  misleading: FidelityItem[]
}

export interface ReviewCard {
  /** ≤ 5 sentences, each ≤ 25 words (lint). */
  points: string[]
  /** One display-TeX line. */
  equations: string
  /** "The one trap". */
  trap: string
  claims?: Claim[]
  /** The Formal track's card (points ≤ 40 words per sentence); `equations` defaults to the Ground-up line. */
  formal?: { points: string[]; equations?: string; trap: string }
}

export interface BeyondLecture {
  why: string
  source: Ref
}

export interface GlossEntry {
  /** /^[a-z0-9-]+$/ */
  id: string
  /** Rich inline, e.g. 'magnetic moment $\\vec\\mu$'. */
  term: string
  /** One plain sentence (≤ 25 words, lint). */
  gloss: string
  /** Unit id or beat id of first use. */
  first: string
  /** Gloss ids used inside this gloss (closure test: all exist). */
  uses?: string[]
  /** TeX symbols this entry defines, for the symbol-before-use lint. */
  symbols?: string[]
  /** The Formal track's sentence (one sentence ≤ 40 words); `gloss` is the Ground-up one. */
  formal?: string
  /**
   * A bridge id (content/qc709/bridges.ts): the popover offers "Learn it in Spin Lab 2.3" with a way back.
   * Interface change W-709 #3.
   */
  bridge?: string
  /**
   * This entry names a new space or a new piece of notation (interface change W-709 #12; additive). The beat that
   * introduces it (`Beat.introduces`) gets a "New space" / "New notation" eyebrow; `content.test.tsx` checks that
   * exactly one beat of the owning chapter claims it, with a stage view and captions in both tracks, at or before
   * `first`.
   */
  introduces?: 'space' | 'notation'
}

/* ------------------------------------------------------------------------------------------------ */
/* Passports: derived from the kind, never authored per beat                                         */
/* ------------------------------------------------------------------------------------------------ */

export type FidelityKey = StageKind | 'optical' | 'poincare' | 'plane-photon'
export interface Passport {
  /** Title line (Martian Mono 12/500): the space's class in caps. Rich inline. */
  title: string
  /** Note line (11/400): always starts with the honesty claim ("schematic" / "not a place"). */
  note: string
  /** Axis labels in that space's units (rich inline). An axis is never x/y/z outside lab-r3 (D §2.3). */
  axes: readonly string[]
  /** Key into FIDELITY / FIDELITY_VARIANT (content/fidelity.ts): the drawer one click from the passport. */
  fidelityKey: FidelityKey
  /** A legend drawn on the passport: 'phase' = the hue wheel that colours a complex number by its angle (709 kinds). */
  legend?: 'phase'
}

/** Wording from D §2.1 (decision #20); axis labels from D §2.3. */
export const PASSPORT: { readonly [K in StageKind]: Passport } = {
  'lab-r3': {
    title: 'PHYSICAL SPACE ℝ³ · metres',
    note: 'schematic · not to scale',
    axes: ['x', 'y · beam', 'z · field gradient'],
    fidelityKey: 'lab-r3',
  },
  'hilbert-plane': {
    title: 'STATE SPACE · real slice of ℂ²',
    note: 'not a place · angles are half of lab angles',
    axes: ['$|{\\uparrow}\\rangle = |{+z}\\rangle$', '$|{\\downarrow}\\rangle = |{-z}\\rangle$'],
    fidelityKey: 'hilbert-plane',
  },
  bloch: {
    title: 'STATE SPACE · Bloch sphere',
    note: 'not a place · opposite points = orthogonal states',
    axes: ['⟨σx⟩', '⟨σy⟩', '⟨σz⟩'],
    fidelityKey: 'bloch',
  },
  'bloch-ball': {
    title: 'STATE SPACE · Bloch ball',
    note: 'not a place · surface = pure · inside = mixed',
    axes: ['⟨σx⟩', '⟨σy⟩', '⟨σz⟩'],
    fidelityKey: 'bloch-ball',
  },
  hopf: {
    title: 'STATE SPACE S³ · stereographic view',
    note: 'not a place · circles kept · distances distorted',
    axes: ['p₁', 'p₂', 'p₃'],
    fidelityKey: 'hopf',
  },
  'operator-space': {
    // plain "a" and "σ" (no combining arrow U+20D7): the mono chrome font has no glyph for it and draws a box
    title: 'OPERATOR SPACE · A = a₀I + a·σ',
    note: 'not a place · a in 3D · a₀ on the gauge (4th axis)',
    axes: ['$a_x$', '$a_y$', '$a_z$', '$a_0$'],
    fidelityKey: 'operator-space',
  },
  // P-F1-story §9.2 S1: a picture of numbers, not of the lab; an arrow's hue is its phase (the legend, stage/phaseHue.ts)
  'complex-plane': {
    title: 'NUMBER PLANE ℂ',
    note: 'not a place · a picture of numbers',
    axes: ['Re', 'Im'],
    fidelityKey: 'complex-plane',
    legend: 'phase',
  },
  // one bar per basis state; length = size, hue = phase (the modes below change what the length means)
  amplitudes: {
    title: 'STATE · amplitudes',
    note: 'not a place · length = size',
    axes: ['basis states'],
    fidelityKey: 'amplitudes',
    legend: 'phase',
  },
  // a wire is a qubit and left to right is time (the 709 fidelity item qc-circuit-wires-are-time)
  circuit: {
    title: 'CIRCUIT · time runs →',
    note: 'not a place · a wire is a qubit',
    axes: ['time →'],
    fidelityKey: 'circuit',
  },
  // a grid of cells; colour encodes the entry's phase (the shared hue wheel) and size encodes |entry|
  matrix: {
    title: 'MATRIX · ⟨i|A|j⟩',
    note: 'not a place · a table of numbers',
    axes: ['row i', 'column j'],
    fidelityKey: 'matrix',
    legend: 'phase',
  },
  // two Bloch balls (reduced, local averages) plus a 3×3 grid of correlations; signed colour, not a phase
  'two-qubit': {
    title: 'STATE · two qubits',
    note: 'not a place · arrows are local averages · cells are correlations',
    axes: ['⟨σx⟩', '⟨σy⟩', '⟨σz⟩'],
    fidelityKey: 'two-qubit',
  },
}

/** Variants that change what the space IS (L6 §6.3: light is not spin), or what a bar's length means (amplitudes). */
export const PASSPORT_VARIANT: {
  readonly optical: Passport
  readonly poincare: Passport
  readonly operatorPlain: Passport
  readonly ampProbability: Passport
  readonly ampSigned: Passport
  readonly plane709: Passport
  readonly bloch709: Passport
  readonly planePhoton: Passport
  readonly matrixTableau: Passport
} = {
  optical: {
    title: 'PHYSICAL SPACE ℝ³ · optical bench',
    note: 'schematic · this glow IS light',
    axes: ['x', 'y · beam', 'z'],
    fidelityKey: 'optical',
  },
  poincare: {
    title: 'STATE SPACE · Poincaré sphere (light)',
    note: 'not a place · its axes are not lab directions',
    axes: ['$S_1$', '$S_2$', '$S_3$'],
    fidelityKey: 'poincare',
  },
  // Lecture 3 meets operator space before σ is defined (judge ruling 2026-09-27): same space, no σ in the label
  operatorPlain: {
    title: 'OPERATOR SPACE · 2×2 Hermitian',
    note: 'not a place · arrow = half the eigenvalue gap · gauge = midpoint',
    axes: ['$a_x$', '$a_y$', '$a_z$', '$a_0$'],
    fidelityKey: 'operator-space',
  },
  // amplitudes, mode 'probability': the bars are chances |a|², so no phase is drawn
  ampProbability: {
    title: 'STATE · chances',
    note: 'not a place · length = chance |a|²',
    axes: ['basis states'],
    fidelityKey: 'amplitudes',
  },
  // Physics 709 (P-Q1-story §9.2 S3; ruling C1: |0⟩ ≡ |+z⟩ for the whole course): the same spaces, the qubit names
  plane709: {
    title: 'STATE SPACE · real slice of ℂ²',
    note: 'not a place · angles are half of lab angles',
    axes: ['$|0\\rangle = |{+z}\\rangle$', '$|1\\rangle = |{-z}\\rangle$'],
    fidelityKey: 'hilbert-plane',
  },
  bloch709: {
    title: 'STATE SPACE · Bloch sphere',
    note: 'not a place · north pole |0⟩ = |+z⟩',
    axes: ['⟨σx⟩', '⟨σy⟩', '⟨σz⟩'],
    fidelityKey: 'bloch',
  },
  // amplitudes, mode 'signed': real amplitudes above and below the axis, and their mean
  ampSigned: {
    title: 'STATE · real amplitudes',
    note: 'not a place · dashed = mean',
    axes: ['basis states'],
    fidelityKey: 'amplitudes',
    legend: 'phase',
  },
  // P-Q2-story §9.2 S1: the photon-polarization unit's real slice, named by |x⟩, |y⟩ instead of the spin frame
  planePhoton: {
    title: 'STATE SPACE · photon polarization (real slice)',
    note: 'not a place · turns by the filter’s own angle, no halving',
    axes: ['$|x\\rangle$', '$|y\\rangle$'],
    fidelityKey: 'plane-photon',
  },
  // matrix v2 (W-709 #15): the tableau view is a table of Pauli strings, not a numeric grid
  matrixTableau: {
    title: 'PAULI TABLE',
    note: 'not a place · a table of operators',
    axes: ['row', 'qubit'],
    fidelityKey: 'matrix',
  },
}

/**
 * Kind + variant (+ course) → passport. The only way a stage gets its label. Physics 709 names the computational basis
 * on the shared spaces (P-Q1-story §9.2 S3): the plane's axes read |0⟩ = |+z⟩, |1⟩ = |−z⟩ and the sphere's north pole
 * is |0⟩ = |+z⟩. 448 (the default) is unchanged.
 */
export function passportOf(s: StageState, course: CourseId = 'sl448'): Passport {
  if (s.kind === 'lab-r3' && s.variant === 'optical') return PASSPORT_VARIANT.optical
  if (s.kind === 'bloch' && s.labels === 'poincare') return PASSPORT_VARIANT.poincare
  if (s.kind === 'hilbert-plane' && s.labels === 'photon') return PASSPORT_VARIANT.planePhoton
  if (course === 'qc709' && s.kind === 'hilbert-plane') return PASSPORT_VARIANT.plane709
  if (course === 'qc709' && s.kind === 'bloch') return PASSPORT_VARIANT.bloch709
  if (s.kind === 'operator-space' && s.labels === 'plain') return PASSPORT_VARIANT.operatorPlain
  if (s.kind === 'amplitudes' && s.mode === 'probability') return PASSPORT_VARIANT.ampProbability
  if (s.kind === 'amplitudes' && s.mode === 'signed') return PASSPORT_VARIANT.ampSigned
  if (s.kind === 'matrix' && 'tableau' in s) return PASSPORT_VARIANT.matrixTableau
  return PASSPORT[s.kind]
}

/* ------------------------------------------------------------------------------------------------ */
/* Id helpers (pure; used by the content test and the runtime)                                       */
/* ------------------------------------------------------------------------------------------------ */

/** Problems with a unit's beat ids ([] = fine): pattern, unit prefix, numbering 1…n, letters a, b, … in order. */
export function checkBeatIds(unitId: string, ids: readonly string[]): string[] {
  const errs: string[] = []
  let expectNum = 1
  let curNum = 0
  let curLetter = ''
  for (const id of ids) {
    const m = BEAT_ID_RE.exec(id)
    if (!m) {
      errs.push(`${id}: does not match ${BEAT_ID_RE}`)
      continue
    }
    if (m[1] !== unitId) errs.push(`${id}: prefix must be the unit id "${unitId}"`)
    const n = Number(m[2])
    const letter = m[3]
    if (n === curNum) {
      // continuing a lettered group: b5a → b5b
      if (!curLetter || !letter || letter.charCodeAt(0) !== curLetter.charCodeAt(0) + 1)
        errs.push(`${id}: repeats b${n}; split beats must be lettered a, b, … in order`)
      curLetter = letter
      continue
    }
    if (n !== expectNum) errs.push(`${id}: expected b${expectNum}`)
    if (letter && letter !== 'a') errs.push(`${id}: a lettered group starts at 'a'`)
    curNum = n
    curLetter = letter
    expectNum = n + 1
  }
  // a lone 'a' (b5a without b5b) is pointless
  for (const id of ids) {
    const m = BEAT_ID_RE.exec(id)
    if (m && m[3] === 'a' && !ids.includes(`${m[1]}:b${m[2]}b`)) errs.push(`${id}: lettered beat without a sibling`)
  }
  return errs
}

/** The layout a beat shows: the reveal's picture once revealed (decision #17), else the beat's own. */
export function beatLayout(b: Beat, revealed: boolean): StageLayout {
  return revealed && b.reveal?.stage ? b.reveal.stage : b.stage
}
