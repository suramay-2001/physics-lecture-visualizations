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
 * Interface change W-448 #1 (2026-10-09, rulings 448-L8L11 P1; additive): `Beat.classMark?: ClassMark` (`{class, from?}`),
 * a small "Class N starts here" rule above the beat in Story, Read and print (components/ClassMark.tsx). A chapter is
 * cut by topic, not by class time; the rule shows where a class of the notes begins or resumes inside it.
 * Interface change W-448 #2 (2026-10-09, rulings 448-L8L11 P2; additive): beat phase `'deeper'`, a fourth phase after
 * the clues, labelled "Go deeper · beyond the notes" and boxed apart. It carries material the notes do not (a derivation
 * they skip, a live demonstration of something they only state) and is kept out of the notes' own line by
 * content.test.tsx `deeperProblems`.
 * Interface change W-448 #3 (2026-10-09, rulings 448-L8L11 P3; type-level, loosening): `Derivation.formal` is optional. A
 * one-track course (448) writes `{result, ground}`; a two-track course (709) still must give both lists (the 709 lints are
 * unchanged), and the per-track view lint (>= 2 distinct views) now runs over every chapter's own tracks.
 * Interface change W-448 #5 (2026-10-09, rulings 448-L8L11 P6 and L10 R6; no type change): the SVG kinds (STAGE_KINDS_709)
 * and the engine they call (physics/qc/) are SHARED code a 448 lecture may use; their fidelity notes moved to
 * content/fidelity.svg.ts (`registerSharedFidelity`); build/chunks.test.ts rules (h), (i), (m) keep course CONTENT apart.
 * Interface change W-448 L9-A (2026-10-09, rulings 448-L8L11 L9 R1; additive): `matrix` v3, the pair view. A `coef` source takes
 * `PairSource` (two 448 directions, the ud-du family, two named pairs) and a new `table` source (`PairTable`: the labelled boxes
 * of H_A ⊗ H_B, a 2 × 2 or the 2 × 6 photon-die, or a classical table of CHANCES); the grid state gains `labels: 'ud'`, `cells`,
 * `factors` and `readouts` (`PairReadout`). The kind stays one `matrix`; its existing states resolve unchanged.
 */
import type { OpticsCurveName, OpticsSeriesFn, OpticsSeriesParams } from '../stage/svg/plotOptics'
import type { Axis, Sign } from '../physics/sg'
import type { NamedKet } from '../physics/spin'
import type { CourseId } from './courses'
import type { Claim, Ref, WidgetSpec } from './schema'
import type { Anchor, AmpShot, BallShot, BitsShot, BlochShot, Bb84Shot, CircuitShot, ClocksShot, CodeShot, ComplexShot, GroverPlaneShot, HopfShot, LabShot, MatrixShot, ModuleMapShot, OperatorShot, PauliProgramShot, PlaneShot, PlotShot, SpacetimeShot, SpinLadderShot, SurgeryGraphShot, TwoQubitShot, WalkGraphShot, WavefunctionShot } from './stageVocab'
import type { AxisSpec, JValue } from '../physics/angmom'
import type { BitsGate } from '../physics/qc/bits'
import type { Circuit, GateName } from '../physics/qc/circuit'

/* ------------------------------------------------------------------------------------------------ */
/* Kinds and shared value types                                                                      */
/* ------------------------------------------------------------------------------------------------ */

/** Physics 448's own six WebGL kinds (its fidelity table, content/fidelity.ts FIDELITY, covers exactly these). */
export const STAGE_KINDS_448 = ['lab-r3', 'hilbert-plane', 'bloch', 'bloch-ball', 'hopf', 'operator-space'] as const
export type StageKind448 = (typeof STAGE_KINDS_448)[number]
/**
 * The SVG kinds, built for Physics 709 and SHARED stage code since W-448 #5 (rulings 448-L8L11 P6): a 448 lecture may use
 * any of them; a new SVG kind joins this list, whichever course needs it. Their fidelity notes are shared too
 * (content/fidelity.svg.ts, registered with the kinds' lazy chunk).
 */
export const STAGE_KINDS_709 = ['complex-plane', 'amplitudes', 'circuit', 'matrix', 'two-qubit', 'plot', 'bb84', 'clocks', 'grover-plane', 'bits', 'code', 'spacetime', 'pauli-program', 'surgery-graph', 'module-map', 'wavefunction', 'spin-ladder', 'walk-graph'] as const
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
  plot: 'svg',
  bb84: 'svg',
  clocks: 'svg',
  'grover-plane': 'svg',
  bits: 'svg',
  code: 'svg',
  spacetime: 'svg',
  'pauli-program': 'svg',
  'surgery-graph': 'svg',
  'module-map': 'svg',
  wavefunction: 'svg',
  'spin-ladder': 'svg',
  'walk-graph': 'svg',
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
  /**
   * Townsend's recombining device (Fig. 1.4, 448 Townsend pass): both beams are joined again and nothing records the path, so the
   * atom keeps the state it came in with (engine: the identity; sg.ts `Bench.merge`). Excludes `keep` and `openOther`, is not allowed on
   * the last device, at most one per bench. Drawn schematically (fidelity `lab-merge-schematic`): the atoms split inside the magnet and rejoin.
   */
  merge?: true
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
  | 'sigma-band' // ±1σ finite-sample band of the MEAN (l1-average:b4a)
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
  /** Atom flow. 'single' = one tracked atom (l1-sequential:b5a, l1-logic:b5). Default 'stream'. */
  flow?: 'off' | 'stream' | 'single'
  /** Default 'build'. */
  deposit?: 'build' | 'hold' | 'clear'
  /** Finite-sample batches (l1-average:b4a): the deposit resets and N atoms fire per batch; the batch index
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
   * W-448 L8-A (additive): 'polarization' is Lecture 8's naming: the 0°/90° arrows read |H⟩/|V⟩ and the 45° frame
   * |D⟩/|A⟩, the passport says the arrow's angle IS the polarizer's angle (no halving), and the fidelity drawer is
   * 'plane-polarization'.
   */
  labels?: 'spin' | 'photon' | 'polarization'
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
  /**
   * 'poincare' = light (L6 §6.3): changes passport and axis labels. W-448 L8-A: the poles read |H⟩/|V⟩ (±z), |D⟩/|A⟩ (±x)
   * and |C₊⟩/|C₋⟩ (±y), the axes stay the ⟨σ⟩ averages "in the H/V basis" (no Stokes S₁–S₃), and the fidelity drawer is
   * the revised 'poincare' one.
   */
  labels?: 'spin' | 'poincare'
  /**
   * W-448 L8-A: turn the LIGHT by this lab angle about the beam. The resolver applies physics/polarization.ts `photonTurn(φ)`
   * (the Bloch point turns about y by `photonSphereAngle(φ)`: the doubling is the engine's, never authored) and reads out
   * "lab turn φ · sphere turn 2φ". Needs `labels: 'poincare'`; exclusive with `rotate`.
   */
  photonTurnDeg?: Scrub
  /** Dashed segments from the point to these axes: the segment to axis j has length 2ΔS_j/ħ (Lecture 7 §7.7). */
  dropLines?: ('x' | 'y' | 'z')[]
  /** DOM readouts from the engine: ⟨S_j⟩ (averages), ΔS_j (spreads), ΔS_xΔS_y vs ½|⟨S_z⟩| (bound; Lecture 7). */
  readouts?: ('averages' | 'spreads' | 'bound' | 'budget')[]
  /**
   * Papers B4 (additive; ruling R4 of papers-B3B4): up to 24 marked points on the sphere, small spheres at positions the engine supplied (the Clifford orbit of a state): each a unit vector
   * (|v| = 1 within 1e-6, finite). `index` numbers them 1 … n beside the sphere. Content never computes a position; a recipe passes engine values.
   */
  marks?: { points: { x: number; y: number; z: number }[]; index?: boolean }
  /** Papers B4: draw the octahedron of the six stabilizer states (corners ±x, ±y, ±z) as a wireframe, and read out |x| + |y| + |z| of the arrow with "inside" / "outside". */
  hull?: boolean
  /** Papers B4: a flip chance ε in 0 … 0.5; the arrow is shortened to 1 − 2ε of its length (a depolarized state). */
  eps?: number
  shot?: BlochShot
}

/* ---- bloch-ball: pure + mixed states ---- */
export type BallPoint =
  | Dir // pure: on the surface
  | 'oven' // maximally mixed: r = 0
  | { mix: { of: Dir; w: number }[] } // Σw = 1 (validated); r = Σ w·r(of)
  | { r: [Scrub, Scrub, Scrub] } // explicit Bloch vector, |r| ≤ 1 (validated at s = 0, ½ and 1; may sweep, W-448 L8-A)
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
  /**
   * W-448 L8-A: 'budget' draws the VARIANCE BUDGET, three bars (Δσ_i)² = 1 − r_i² stacked into a total bar with ticks at 2 and
   * 3 and the text "total = 3 − r² = …" (physics/density.ts `pauliVariances`, `varianceTotal`): 2 on the sphere, 3 at the centre.
   */
  readouts?: 'budget'[]
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
   * (1 + x/n)^k on the line, closing on e^x. n is a whole number 1–1000 (rounded when swept). `size` (W-448 L11 fix, additive, default true):
   * `false` drops the "end …" and "size …" readouts, so a beat can draw the polygon without printing how far the n-step end point overshoots.
   */
  euler?: { rate: 'imag'; phiDeg: Scrub; n: Scrub; size?: boolean } | { rate: 'real'; x: number; n: Scrub; size?: boolean }
  /** Arrows tip to tail and their resultant (phasorPath / phasorSum); sizes default to 1. At most 12 arrows. */
  chain?: { phasesDeg: Scrub[]; sizes?: number[] }
  /** Arrows from 0, not chained (no sum is drawn or read out: a question picture). At most 12 arrows. */
  spokes?: { phasesDeg: Scrub[]; sizes?: number[] }
  /**
   * W-709 F8-A (additive): the marks of a clock face, a whole number N from 2 to 60: N ticks on the unit circle, 360°/N apart, mark 0 at the arrow 1.
   * With N ≤ 12 every mark is numbered 0 … N − 1; on a bigger clock the number of a mark sits at the tip of every `spokes` arrow of size 1 that points
   * exactly at it. The kind draws no readout for it: a number on a clock is its place, read as an angle. First user: Chapter F8's clocks mod 12, 21 and 36.
   */
  clock?: number
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
 * (qc/state.ts `bell`: '00+11', 'Phi+'); `terms` (W-448 L10-A, additive): an equal-weight signed sum of two or more distinct basis strings
 * (qc/state.ts `superpose`: '000-011-101-110' is the GHZ-game state ½(|000⟩ − |011⟩ − |101⟩ − |110⟩)); `dir`: one qubit along a direction of 448's sphere (a named ket such as '+y',
 * or Bloch angles, which may sweep); `circuit`: the state after column `upTo` of a circuit (qc/circuit.ts `runCircuit`).
 */
export type AmpSource = { ket: string } | { bell: string } | { terms: string } | { dir: Dir } | { circuit: Circuit; upTo?: Scrub; outcomes?: string }
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
  /**
   * Bar labels: 'bits' |00⟩ … (default); 'spin' |0⟩ = |+z⟩, |1⟩ = |−z⟩ (one qubit; the 709 lock); 'index' (W-709 F8-A, additive) the place
   * as a plain number 0 … 2ⁿ − 1 under each bar, and the readouts call the entries c_j (c-hat_k in the Fourier view): a list of N numbers, not a register.
   */
  labels?: 'bits' | 'spin' | 'index'
  /**
   * P-Q2-story §9.2 S2 (additive): multiplies every amplitude by e^{iγ} before drawing (γ in degrees). Dials turn
   * together; bar lengths and chances are unchanged (a phase). Readout: "phase γ° · same state".
   */
  globalPhaseDeg?: Scrub
  /**
   * Read the state in another basis (additive; two qubits only). `'bell'`: one bar per Bell state Φ+, Φ−, Ψ+, Ψ− (qc/state.ts
   * `BELL_BASIS`, that order), whose amplitude is the engine's overlap ⟨Bell|ψ⟩. The state itself is unchanged: only the list
   * of bars is, and the chances still add to 1. Not with `mode: 'signed'` (a mean over Bell bars is no inversion) or `sum`.
   * Townsend pass G3 (additive; ruling T2): `{ local: 'xx' }` reads each wire along its own axis, one letter `x | y | z` per wire (two or three
   * wires; `z` leaves a wire alone). Bar k is the engine's overlap ⟨b_k|ψ⟩ with the product ket of per-wire eigenstates (qc/measure.ts
   * `localBasisAmplitudes`), labelled by one sign and axis letter per wire (`+x −x`); the chances still add to 1 and the readout says "read
   * along x, x". The letters must match the register's wires. Not with `dft`, `sum`, `keep`, `labels` or mode 'signed'.
   */
  inBasis?: 'bell' | { local: string }
  /**
   * W-709 F8-A (additive): draw the discrete Fourier transform of the state instead of the state (qc/fourier.ts `dft`: ĉ_k = (1/√N) Σ_j c_j ω^{jk},
   * ω = e^{2πi/N}, N = 2ⁿ bars; the sign of N&C Eq. 5.1). The resolver applies it to ANY source, after `globalPhaseDeg`; the readout says "Fourier
   * view" and names the four tallest bars. Not with `inBasis`, `sum` or mode 'signed'. Serves Chapter F8's combs and Q18's quantum Fourier transform.
   */
  dft?: true
  /**
   * W-709 Q18-B (additive): draw only the chances of the FIRST `keep` wires (q0 …), summed over the rest, as 2^keep bars labelled by those wires' bits
   * (physics/qc/measure.ts `marginal`). It is how a reading of the counting wires of a phase-estimation circuit is drawn without the target wire. Only mode
   * 'probability'; `keep` is a whole number from 1 to n − 1 of the source's n wires; not with `dft`, `inBasis`, `sum`, `dials` or labels 'spin' / 'index'. The
   * readout says "first k wires".
   * Stage-code agent S2 (P-Q21-story §9.2, additive): `keep` may also be a LIST of wires, counted from 0 at the top as in the circuit format (`[3, 4]` = the two helper
   * wires below three data wires): the marginal over exactly those wires (`marginal`, the first listed the most significant bit), each bar labelled by the bits of the
   * listed wires in that order. A list is 1 … n − 1 distinct wires of the register; `keep: [0, 1]` is `keep: 2`. The readout says "wires 3, 4 (from 0)".
   */
  keep?: number | number[]
  /**
   * W-448 L10 fix (additive; default true, so every 709 stage stays byte-identical): `false` drops the "after column k" readout of a
   * `circuit` source. Use it when the circuit itself is not drawn beside the bars, so the line would name a step the learner never sees.
   */
  showColumn?: boolean
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
  /**
   * B1 (additive): up to 24 fault places. A marker on each listed wire in the slot just BEFORE column `col` (`col` = the number of columns: after the last one), joined by a thin
   * line when several wires, with an optional short label (at most 6 characters). A marker is a place a fault can happen, not a computed fault.
   */
  faults?: { col: number; wires: number[]; label?: string }[]
  /**
   * B1 (additive): the "hook". A fault on the CONTROL wire of the circuit's leading CNOT columns (the check qubit) after `after` of them (0 … 3, and fewer than the circuit has) is highlighted, with the
   * target wires still to be reached by the CNOT columns after it: a single fault on the check qubit that spreads to those data wires.
   */
  hook?: { after: 0 | 1 | 2 | 3 }
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
  | { coef: PairSource }
  | { pauli: string }
  | { product: MatrixSource[] }
  | { adjoint: MatrixSource }
  | { lin: { c: MatrixCoef; src: MatrixSource }[] }
  | { table: PairTable }
  /** W-709 F8-A (additive): the N-point Fourier matrix (F_N)_{kj} = ω^{jk}/√N (qc/fourier.ts `dftMatrix`), a whole N from 2 to 16 (the grid draws sides 2, 4, 8). */
  | { dft: number }
/**
 * `matrix` v3 (interface change W-448 L9-A; rulings 448-L8L11 L9 R1, which REJECTED a separate `pair-grid` kind): the sources a
 * `coef` matrix may take beyond `AmpSource`, all two-spin states of Physics 448 Lecture 9. `pair`: Alice's state ⊗ Bob's, each a
 * 448 direction (a named ket or Bloch angles, which may sweep); `family 'ud-du'`: cos t|ud⟩ − sin t|du⟩ (qc/state.ts `udFamily`;
 * t = 45° is the singlet), t in degrees, sweepable; `named`: ½(|uu⟩ + |ud⟩ + |du⟩ ± |dd⟩) ('uniform' = +, 'flip' = −).
 */
export type PairSource = AmpSource | { pair: [Dir, Dir] } | { family: 'ud-du'; tDeg: Scrub } | { named: 'uniform' | 'flip' }
/**
 * `matrix` v3: a table that is not a state. `frame`: only the boxes of H_A ⊗ H_B with their labels, 'spins' (2 × 2: |u⟩, |d⟩
 * for each spin) or 'photon-die' (2 × 6: Alice's photon |H⟩, |V⟩ down the side, Bob's quantum die |1⟩ … |6⟩ across the top).
 * `classical`: the joint CHANCES P(a, b) of two coins scored ±1 (qc/info.ts `classicalPair`): 'dealer' hands a penny (+1) and a
 * dime (−1) to two people at random; 'independent' is two separate coins with P(+1) = pA and pB (each may sweep). Chances, not
 * amplitudes: no phases, nothing quantum.
 */
export type PairTable = { frame: 'spins' | 'photon-die' } | { classical: 'dealer' } | { classical: 'independent'; pA: Scrub; pB: Scrub }
/** `matrix` v3: what a pair's readout column may name (stage/svg/matrix.ts `pairReadouts` gives each one's text). */
export const PAIR_READOUTS = ['dims', 'norm', 'params', 'marginals', 'means', 'det', 'product'] as const
export type PairReadout = (typeof PAIR_READOUTS)[number]
export interface MatrixGridState {
  kind: 'matrix'
  source: MatrixSource
  /** Row/column labels: kets (⟨00| rows, |00⟩ … columns), plain indices, or none. Default 'kets'. With `basis` set,
   *  'kets'/'indices' both show the basis's own ket names instead (a chosen basis has no index order worth naming).
   *  `'ud'` (v3, a `coef` source of two spins): the pair's own letters, |u⟩ and |d⟩ for Alice (rows) and for Bob (columns).
   *  A `table` source always carries its own labels ('none' hides them).
   *  `'spin'` (448 Townsend pass, S2): a ONE-spin (2 × 2) matrix names its rows ⟨+z|, ⟨−z| and its columns |+z⟩, |−z⟩ instead of the
   *  qubit labels |0⟩, |1⟩ (709 keeps |0⟩ = |+z⟩ in its own lock; 448 writes the spin names). With a `basis` it changes nothing (the basis's own names win). */
  labels?: 'kets' | 'indices' | 'none' | 'ud' | 'spin'
  /**
   * `matrix` v3 (the pair view; needs a `coef` or `table` source): what each box shows. 'amplitudes' (the default for a
   * `coef` source): size |ψ_ab|, hue the phase. 'chances': size from the Born chance |ψ_ab|² (no hue). 'labels': empty boxes
   * naming their basis state (|uu⟩, |H4⟩) — the only choice for a `frame` table. A `classical` table is always chances.
   */
  cells?: 'amplitudes' | 'chances' | 'labels'
  /** v3 (only a `coef` source of `{pair}`): the two factors beside the boxes, Alice's α_u, α_d down the left and Bob's β_u, β_d
   *  across the top, so a product's grid reads as a column times a row. */
  factors?: true
  /** v3: lines for the readout column, each computed by the engine from the table on stage (`dims` needs a pair or table,
   *  `means` a classical table; `det`, `product` and `params` a state): the sum of the chances, the row and column totals,
   *  the determinant ψ_uuψ_dd − ψ_udψ_du and whether the pair is a product. */
  readouts?: PairReadout[]
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
  /** Pauli strings (I/X/Y/Z, q0 first), one per row, all the same length (1–4 qubits; B3 widened it from 3). */
  tableau: string[]
  product?: true
  values?: Record<string, 1 | -1>
  state?: AmpSource
  /**
   * W-448 L10-A (additive): a "needed" column, the ±1 each row's product should have (the GHZ game's ZZZ → +1, ZXX, XZX, XXZ → −1).
   * With `values` each row gets a ✓ or ✗ (the card's product meets its target) and the header reads "wins k of n"; with `state` a row
   * gets ✓ when the state's eigenvalue equals the target. Keys must be rows of the table.
   */
  targets?: Record<string, 1 | -1>
  /**
   * W-448 L10-A (additive): one name per column (Alice, Bob, Charlie), drawn as a header row, and the table drawn large and centred as
   * columns: the players' letters, then the card's product, the state's eigenvalue, the need and the verdict, each under its own heading.
   * One plain name (1–12 letters) per qubit of the tableau. Without it the live stage still uses the large layout; print keeps its text badges.
   */
  players?: string[]
  /**
   * Papers B3 (additive): the stabilizer UPDATE picture. The generators of a state (signs allowed: `-ZZ`) BEFORE a measurement, the measured Pauli P (letters only), a clash mark on every generator
   * that anticommutes with P, and the generators AFTER, with the case of the engine's update rule (physics/qec/update.ts `updateRule`: `replaced` / `fixed` / `added`) and the stored qubits before and
   * after. `outcome` (0 = +1, 1 = −1) is the coin when the outcome is not fixed by the state (default 0); a fixed outcome ignores it. 1–4 independent, commuting generators of 1–4 letters. Write
   * `tableau: []` (or the generators' letters without their signs): the rows come from `generators`. Not with `product`, `values`, `state`, `targets` or `players`.
   */
  update?: { generators: string[]; measure: string; outcome?: 0 | 1 }
  shot?: MatrixShot
}
export type MatrixState = MatrixGridState | MatrixTableauState

/* ---- two-qubit (709; SVG): two Bloch balls (A, B) and a 3×3 ⟨σᵢ⊗σⱼ⟩ correlation grid ---- */
/**
 * Where the pair's state comes from; content never writes a Bloch vector or a correlation. `ket`: any two-qubit ket
 * `amplitudes` accepts (reuses its `AmpSource` vocabulary: `ket`, `bell`, a circuit's state at `upTo`). `family`:
 * cos θ|00⟩ + sin θ|11⟩, sweepable (a product state at θ = 0° opening into the maximally entangled Φ+-like state at
 * θ = 45°); `pair: '01-10'` (W-448 L10-A, additive) turns it into cos θ|ud⟩ − sin θ|du⟩ with the same sweep: |ud⟩ at θ = 0°, the singlet at
 * θ = 45° (where both arrows have shrunk to the centre). `rho`: the `matrix` kind's own ρ sources, a pure state's density matrix or a mixture (qc/density.ts
 * `densityOf`/`mixtureN`). `reduce`: a THREE-qubit ket with one qubit traced out, keeping the two named `keep`
 * (q0-indexed into that ket, `keep[0]` drawn as A); `physics/qc/density.ts reducedBloch`/`reducedDensity` read the
 * kept qubits straight off the original ket, so the grid and the arrows are exact even though the pair's own state
 * is generally mixed.
 */
export type TwoQubitSource =
  | { ket: AmpSource }
  | { family: 'cos-sin'; thetaDeg: Scrub; pair?: '00+11' | '01-10' }
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
  /** Up to 2 measurement directions drawn on each ball (CHSH settings); with exactly two on each, the `chsh` readout also
   *  scores the state at those settings. */
  axes?: { a?: Dir[]; b?: Dir[] }
  /**
   * 'concurrence': Wootters' C of the pair (qc/entangle.ts `concurrence`; the pure-ket form for a two-qubit ket) · 'chsh': the
   * largest CHSH score any settings reach, Horodecki's 2√(t₁ + t₂) (`chshMaxHorodecki`: 2 for a product state, 2√2 for a Bell
   * state), plus the score at the drawn `axes` when both balls carry two (`chshFromAxes`).
   */
  readouts?: ('purity' | 'rLength' | 'entropy' | 'concurrence' | 'chsh')[]
  /** 'A-B' (Alice/Bob, default) or 'q1-q2' (the notes' own qubit numbering). */
  labels?: 'A-B' | 'q1-q2'
  shot?: TwoQubitShot
}

/* ---- plot (709; SVG; P-Q10-story §9.2): a labelled 2-D curve for a derivation that sweeps a parameter ---- */
/** The named engine curves a `plot` beat may draw (stage/svg/plot.ts owns the function each name resolves to, built
 *  on physics/qc/entangle.ts `chshCurve`/`lhvChsh`); content never writes a y-value, only the name and the range. */
/** W-709 Q18-A (additive): `peBest3` is the chance of phase estimation's best reading on three wires, max_x P(x), for an eigenphase tau (a fraction of a turn) from 0 to 1 (physics/qc/qft.ts `peBest`): 1 at each eighth, 0.4105 midway. */
/**
 * Stage-code agent S3 (P-Q21-story §9.2, P-Q22-story §9.2; additive): the error-correction curves, all from physics/qec/rates.ts. `repFail3` and `repFail5`: the chance
 * that a majority vote over 3 / 5 copies of a bit is wrong when each copy flips with chance p, p from 0 to 1 (p²(3 − 2p) and p³(10 − 15p + 6p²)); `identityP`: the
 * chance a lone bit is wrong, y = p; `qhbNeed1`: the rooms a code that holds one qubit and fixes one error needs, 2(1 + 3n) (the quantum Hamming bound's left side),
 * n from 1 to 10, to be drawn beside `twoToN`; `steaneFailX`: the exact logical failure chance of the Steane code against independent X flips of chance p under its
 * lookup decoder, p from 0 to 0.2 (found by listing all 128 patterns).
 */
/**
 * Townsend pass G4a (additive; ruling T2; physics/dynamics.ts): `ammoniaLevel` (x = μ|E|/A from 0 to 3; the upper level (E − E₀)/A = √(1 + x²), Eq. 4.58b) and `ammoniaLevelWeak` (1 + x²/2, Eq. 4.59);
 * `spinFringe` and `spinFringeOther` (x = φ/π from 0 to 12; the two ports (1 ± cos(φ/2))/2 of the neutron interferometer, Fig. 4.4b); `rabiFlip` and `rabiFlipOff` (x = ω₁t/2π from 0 to 3; the chance
 * of the lower state, Eq. 4.45, on resonance and one ω₁ off it) and `rabiPeak` (x = (ω₀ − ω)/ω₁ from −3 to 3; the ceiling (ω₁²/4)/((ω₀ − ω)² + ω₁²/4), Fig. 4.6).
 */
/** Townsend pass G3 (additive; ruling T2): `bellBisectGap`, x = Θ in degrees (default 0 … 180): P(+a;+b) − P(+a;+c) − P(+c;+b) for the singlet with the middle axis c halfway between a and b, Θ from each (physics/qc/entangle.ts `bellBisectGap`); above 0 means Bell's inequality (Townsend Eq. 5.54) fails there: largest 1/8 at 60°, 0 at 90°. */
/**
 * Townsend pass G4b (additive; ruling T2; physics/scatter.ts): `stepR` and `stepT` (x = E/V₀ from 0.2 to 4: the reflected and transmitted CURRENT ratios of a potential step, Eq. 6.135; R = 1 and T = 0 below the step, Eqs. 6.139–6.140);
 * `barrierT` (x = qa from 0 to 4 for E/V₀ = ½: T = 1/[1 + ((k² + q²)/2kq)² sinh² qa], Eq. 6.144, here 1/cosh² qa) and `barrierThick` (the thick-barrier form of Eq. 6.146 for the same barrier, 4e^{−2qa}; it is only valid for qa ≫ 1 and exceeds 1 for a thin barrier).
 */
/**
 * Chapter Q19 (additive; P-Q19-story §9.2 S2; physics/qc/walk.ts, trotter.ts, variational.ts). Curves of a WHOLE number only (a walk takes whole steps, a Trotter product whole pieces): the plot draws a
 * point at every whole x of the range (`curve.samples` is ignored), on a linear or a log x axis; the range and every marker are whole numbers inside the stated domain. `randomWalkSigma`: the spread
 * sigma(n) = sqrt(n) of n fair steps, summed from the exact binomial chances (x = n, 0-400); `coinWalkSigma`: the spread of the Hadamard-coin walk (beyond the book), about 0.5412 n (x = n, 0-400);
 * `starWalkMarked8`: the chance on the marked spoke of the 8-spoke star after n steps from the outgoing start (x = n, 0-40; 0.9453 at n = 4); `extraWalk64` and `extraWalk64Plus`: the chance on spokes 1
 * and 2 of the 64-spoke star with the extra edge {1,2} after n steps, from the minus start (Eq. 7.67; peak 0.7002 at n = 11) and from the plus start (which fails), x = n, 0-40;
 * `trotterErr1` and `trotterErr2`: the operator-norm error of the first- and second-order Trotter product for the 3-spin Heisenberg chain at J = 1, t = 2, against the number of pieces M
 * (x = M, 1-60; 0.7327 at M = 1 and 0.0486 at M = 15 for order 1; for log-log axes). Smooth in a real argument: `qaoaGammaSlice`, F(gamma, beta = 22.5 degrees) and `qaoaBetaSlice`, F(gamma = 45 degrees, beta)
 * for the MaxCut QAOA state on the 4-cycle, x in degrees (default 0-180); both peak at 3.
 */
/**
 * Chapter Q20 (additive; P-Q20-story §9.2 S2; physics/qc/machines.ts). All smooth in their x. `clonerF1` and `clonerF2`: the copy fidelity F_c of wire 1 and of wire 2 of the four-CNOT cloner against the program
 * angle u in degrees (x = u, 0-60; the program is c0 Xi00 + c1 Xi0x with c0 = cos u - sin u/sqrt3, c1 = 2 sin u/sqrt3; wire 1 falls from 1 to 1/2 while wire 2 rises from 1/2 to 1, and both are 5/6 at u = 30), for the input at
 Bloch angles (60, 90) degrees; every point is the engine's circuit-free matrix route. `usdProgrammable`: the programmable discriminator's success chance 1/3 (1 - s^2), computed from the 8 x 8 operators at c1 = c2 = 2/3, against the
 overlap s of the two states (x = s, 0-1); `usdKnown`: the known-state chance 1 - s of Chapter Q14's `usd` for the same pair. Chances: the axis is never padded past 0 or 1.
 */
/** Townsend pass G2b (additive; ruling T2): `polChain`, x = N (default 1 … 60, drawn as a smooth curve through real N), y = the chance that a photon passes a chain of N polarizers whose total turn is 90°, each turned 90°/N from the one before: cos^{2N}(90°/N) (physics/polarization.ts `chainTransmission`); the curve between whole N is the same formula at a fractional N, exact only at whole N (fidelity `plot-chain-interpolated`). */
export type PlotCurveName = 'chshVsPhase' | 'chshClassicalBound' | 'bb84Miss' | 'nSquared' | 'twoToN' | 'sqrtTwoToN' | 'bigORatio' | 'dirichlet8' | 'peBest3' | 'repFail3' | 'repFail5' | 'identityP' | 'qhbNeed1' | 'steaneFailX' | 'bellBisectGap' | 'ammoniaLevel' | 'ammoniaLevelWeak' | 'spinFringe' | 'spinFringeOther' | 'rabiFlip' | 'rabiFlipOff' | 'rabiPeak' | 'stepR' | 'stepT' | 'barrierT' | 'barrierThick' | 'polChain' | 'randomWalkSigma' | 'coinWalkSigma' | 'starWalkMarked8' | 'extraWalk64' | 'extraWalk64Plus' | 'trotterErr1' | 'trotterErr2' | 'qaoaGammaSlice' | 'qaoaBetaSlice' | 'clonerF1' | 'clonerF2' | 'usdProgrammable' | 'usdKnown' | OpticsCurveName
/**
 * B1 (additive): the named functions of `series` (physics/qec/curves.ts): `cleanRun` (x = the number of steps N, params p), `repLogicalVsD` (x = d, params p), `repLogicalVsP` (x = p, params d),
 * `surfaceVsP` (x = p, params d and preset), `surfaceVsD` (x = d, params p and preset).
 * B3 (additive): `voteFail` (x = the rounds R, odd; params q and m): the chance that the majority vote of R repeated readings of the product of m checks, each reading wrong with chance q, is wrong
 * (physics/qec/timelike.ts `voteFail(R, productFlip(q, m))`). A function of d or of R is drawn at odd whole numbers, or at the authored `xs`.
 */
export const PLOT_SERIES_FNS = ['cleanRun', 'repLogicalVsD', 'repLogicalVsP', 'surfaceVsP', 'surfaceVsD', 'voteFail'] as const
/**
 * Optics Lab (additive): six more named curves (`slowerField`, `dopplerTVsDetuning`, `dressedOmega`, `vaporFraction`, `deBroglieVsT`, `partialWaveCount`) and twelve more series functions
 * (`scatterVsDetuning`, `molassesForceVsV`, `sisyphusPotential`, `vsrForce`, `quadrupoleU`, `airyLevels`, `heuristicLevels`, `dipoleDepth`, `dipoleScatter`, `motForceVsZ`, `ramseyFringe`, `langevinPotential`),
 * every y value from physics/optics/; their tables live in stage/svg/plotOptics.ts (lazy), so only these TYPES are here (erased: no cost in the entry).
 */
export type SeriesFn = (typeof PLOT_SERIES_FNS)[number] | OpticsSeriesFn
export const PLOT_PRESETS = ['tdg-2.6', 'tdg-A10', 'bev22'] as const
export type PlotPreset = (typeof PLOT_PRESETS)[number]
export interface PlotSeries {
  fn: SeriesFn
  /** d: an odd whole number (a vote of d copies / a surface code of distance d) · p: a chance · preset: the published fit of the surface code · vote: reserved (a vote of this many copies) · B3 (voteFail): q a chance, m the checks 1 … 8. */
  params?: { d?: number; p?: number; preset?: PlotPreset; vote?: number; q?: number; m?: number } & OpticsSeriesParams
  /** The name the series carries in the legend (at most 24 characters); default the function's own. */
  label?: string
}
/**
 * The one NAMED curve (every beat before B1). `PlotState` and `PlotSeriesState` are the two members of the `plot` union; each lists every field itself (the tooling that lists a kind's
 * fields reads one interface at a time), so the fields they share are written twice.
 */
export interface PlotState {
  kind: 'plot'
  curve: {
    fn: PlotCurveName
    /** The swept parameter's range; default the named curve's own. */
    x?: { from: number; to: number }
    /** Default 64. */
    samples?: number
    /**
     * W-709 F7-A (additive): a second named curve drawn on the same axes (dashed, in the operation colour), so two growths can be seen
     * together (n² beside 2ⁿ). Each curve's end is labelled with its name. Markers sit on both curves. Needs a different curve from `fn`.
     */
    vs?: PlotCurveName
  }
  series?: undefined
  xs?: undefined
  /** Points on the curve, e.g. { x: 45, label: '2√2' }; the y-value is computed, never authored. At most 8. */
  markers?: { x: number; label?: string }[]
  /** B1 (additive): vertical marks printed in a paper at an x (hollow, with an "as printed" legend). At most 6; the recipe passes them from reported claims, never typed here. */
  reportedMarks?: { x: number; label: string; source: string }[]
  /** A shaded y-region (e.g. the classical |S| ≤ 2 band). At most 4. */
  bands?: { yFrom: number; yTo: number; label?: string }[]
  /** Horizontal reference lines (e.g. 2, 2√2, 4). At most 4. */
  yLines?: { y: number; label?: string }[]
  /**
   * W-448 L8-B (additive): 'log' draws the y axis on a base-10 log scale (every curve value, marker and line must be positive),
   * labelled by decades. Default 'linear' (unchanged).
   */
  yScale?: 'linear' | 'log'
  /** B1 (additive): 'log' draws the x axis on a base-10 log scale (needs a positive range); default 'linear'. */
  xScale?: 'linear' | 'log'
  shot?: PlotShot
}
/** B1 (additive): up to 6 named series (physics/qec/curves.ts) instead of `curve`, each drawn as a line (as points joined when x is the distance d: only odd whole d). */
export interface PlotSeriesState {
  kind: 'plot'
  series: PlotSeries[]
  curve?: undefined
  /** The drawn x range (default per function: N 1 … 1000, d 3 … 25, p 0.0001 … 0.01). For a function of d the points are the odd whole numbers in the range. */
  xRange?: { from: number; to: number }
  /** B3 (additive): the whole numbers a function of d or of the rounds R is evaluated at (increasing, odd; 2 or more; for R: 1 … 11), drawn as points joined by a line. Default: every odd whole number in the range. */
  xs?: number[]
  /** Samples along a continuous x (default 64; ignored when x is d). */
  samples?: number
  /** The marker sits on the FIRST series (label optional). At most 8. */
  markers?: { x: number; label?: string }[]
  /** Vertical marks printed in a paper (hollow, "as printed"). At most 6. */
  reportedMarks?: { x: number; label: string; source: string }[]
  bands?: { yFrom: number; yTo: number; label?: string }[]
  yLines?: { y: number; label?: string }[]
  yScale?: 'linear' | 'log'
  xScale?: 'linear' | 'log'
  shot?: PlotShot
}

/**
 * B2 (additive): a scatter of POINTS whose positions the recipe took from the engine (never typed in a beat): the third member of the `plot` union, with neither `curve` nor `series`.
 * `status` says how the y value is known: 'computed' (the page's engine; a filled dot), 'reported' (a reference's number used in the arithmetic; a hollow dot, "as printed") or 'bound' (printed as an
 * upper bound, written ≤; a hollow dot with a tick). Points of one `group` share a mark and a legend entry (at most 4 groups, 24 points).
 */
export interface PlotPoint {
  x: number
  y: number
  /** At most 24 characters, written beside the dot. */
  label?: string
  status?: 'computed' | 'reported' | 'bound'
  group?: string
}
export interface PlotPointsState {
  kind: 'plot'
  points: PlotPoint[]
  curve?: undefined
  series?: undefined
  xLabel?: string
  yLabel?: string
  xScale?: 'linear' | 'log'
  yScale?: 'linear' | 'log'
  /** Horizontal reference lines (the planar line at 1). At most 4. */
  yLines?: { y: number; label?: string }[]
  shot?: PlotShot
}

/* ---- bb84 (SVG; W-448 L8-B): the protocol ledger of Lecture 8, one row per photon ---- */
/**
 * Where the rounds come from. `board`: the eight-photon example worked on the board in the notes (physics/bb84.ts `BOARD_P8`,
 * no Eve). `seed` + `count`: the first `count` rounds (a whole number 1–4000, may sweep) of the seeded run
 * (`bb84Rounds`): the same seed always draws the same rounds, a longer count only appends.
 */
export type Bb84Rounds = { board: 'notes-p8' } | { seed: number; count: Scrub }
/**
 * Eve's strategy. BB84 (the default protocol): absent (`'off'`), every photon (`'all'`, the notes' intercept–resend), or a fraction of them (may sweep).
 * B92 (`protocol: 'b92'`, W-709 Q15): absent (`'off'`) or one of the two attacks Chapter Q15's B92 unit describes on every qubit, `'usd'` (she reads with the
 * never-wrong measurement and guesses what to resend when it fails) or `'minerr'` (she reads along Helstrom's best axis, which always answers).
 */
export type Bb84Eve = 'off' | 'all' | { fraction: Scrub } | 'usd' | 'minerr'
/** The key-distribution protocol the ledger draws: BB84 (default; photons, two bases) or B92 (W-709 Q15; two overlapping states, a never-wrong receiver). */
export type Bb84Protocol = 'bb84' | 'b92'
export type Bb84Party = 'alice' | 'eve' | 'bob'
/** `kept`: how many rounds survive sifting · `qber`: Q̂ of the sifted key with its ±1σ band against the exact Q (`bb84Q`) · `eve-knows`: the sifted bits Eve read for certain. */
export const BB84_READOUTS = ['kept', 'qber', 'eve-knows'] as const
export type Bb84Readout = (typeof BB84_READOUTS)[number]
export interface Bb84State {
  kind: 'bb84'
  /**
   * W-709 Q15 (additive): `'b92'` draws the seeded B92 ledger (`physics/qc/crypto.ts` `b92Rounds`) instead of BB84's: one row per qubit, Alice's bit and the
   * state it sends (|0⟩ or |+⟩), Eve's reading when `eve` is on, Bob's detector (E₀ or E₁) or a blank when his never-wrong reading does not answer, and the
   * kept mark. Needs seeded `rounds` (no `board`), `eve` off, `'usd'` or `'minerr'`, and no `test`. Readouts: `kept` (with the exact share 1 − s), `qber`
   * (the share of kept bits that are wrong, with its 1σ band, beside the exact key error rate: B92 defines the same Q as BB84) and `eve-knows` (read here as the
   * kept bits on which Eve holds the right bit, a lucky guess included, beside the exact share). Default `'bb84'`: every existing state is unchanged.
   */
  protocol?: Bb84Protocol
  rounds: Bb84Rounds
  /**
   * W-709 Q15 (additive, both protocols): how many of the latest rounds are drawn as rows, a whole number 3-12 (default 12). A ledger in half of a split
   * stage draws fewer rows; every tally and the exact rates still cover all the rounds.
   */
  last?: number
  eve?: Bb84Eve
  /** Which columns are drawn (default Alice and Bob; Eve's only with an eavesdropper). */
  show?: Bb84Party[]
  /** After the bases are announced: keep the matched rounds (a mark), dim the rest. */
  sift?: boolean
  /**
   * The public test sample, taken from the KEPT rounds (needs `sift`). `rounds`: exactly these round numbers · `size`: the
   * first m kept rounds · `fraction`: each kept round with that chance (seeded). Tested rounds are marked and leave the key.
   */
  test?: { rounds: number[] } | { size: number } | { fraction: number }
  /** Round numbers outlined in the ledger (a beat points at them). */
  highlight?: number[]
  readouts?: Bb84Readout[]
  shot?: Bb84Shot
}

/* ---- clocks (SVG; W-448 L11): the two phase clocks of a two-level system ---- */
/**
 * The panels of the scene: `levels` the energy ladder (E₊, E₋, Ē dashed, a ħω arrow) · `clocks` one dial per energy level,
 * its hand the phase of that energy component, turning clockwise at E/ħ · `gap` the angle between the hands as a dial (the
 * relative phase, which is the Bloch azimuth) · `top` the equator seen from +z, with the arrow at φ = ωt. Default: all four.
 */
export const CLOCKS_PANELS = ['levels', 'clocks', 'gap', 'top'] as const
export type ClocksPanel = (typeof CLOCKS_PANELS)[number]
/** `phases`: where the two hands point (wrapped to ±180°) · `gap`: the angle between them (the azimuth) · `px`: P(+x; t), what an x magnet would see. */
export const CLOCKS_READOUTS = ['phases', 'gap', 'px'] as const
export type ClocksReadout = (typeof CLOCKS_READOUTS)[number]
export interface ClocksState {
  kind: 'clocks'
  /**
   * The two energies in units of ε, small exact numbers (0 ≤ lower < upper ≤ 12, a gap of at least ¼). The mean Ē = (E₊ + E₋)/2
   * and the splitting ħω = E₊ − E₋ are derived by physics/dynamics.ts, never authored.
   */
  levels: { upper: number; lower: number }
  /** The state the clocks start from (default '+x'): its |+z⟩ and |−z⟩ amplitudes set the hand lengths and starting angles. */
  start?: Dir
  /** Elapsed time as εt/ħ in degrees (may sweep). A hand points at arg(start amplitude) − E·timeDeg, so the gap is (E₊ − E₋)·timeDeg. */
  timeDeg: Scrub
  show?: ClocksPanel[]
  readouts?: ClocksReadout[]
  shot?: ClocksShot
}

/* ---- grover-plane (SVG; P-Q17-story §9.2): the real plane Grover's search lives in ---- */
/**
 * Grover's search keeps the whole 2ⁿ-dimensional state inside ONE real plane: the horizontal axis is |x₀⊥⟩ (the unmarked strings,
 * evenly), the vertical axis is |x₀⟩ (the marked string(s), evenly). The start |w₀⟩ sits at α = arcsin √(M/N) above the horizontal and
 * every Grover step turns the arrow by 2α, so after k steps it points at (2k+1)α and its vertical shadow squared is the chance of
 * reading a marked string. Content writes only INPUTS (the register size, how many strings are marked, the number of steps, what to
 * draw); the resolver takes α, every angle and every chance from physics/qc/grover.ts, never from content.
 */
export const GROVER_MIRRORS = ['x0perp', 'w0'] as const
export type GroverMirror = (typeof GROVER_MIRRORS)[number]
export const GROVER_ARCS = ['alpha', 'step'] as const
export type GroverArc = (typeof GROVER_ARCS)[number]
/** `angle`: (2k+1)α in degrees · `success`: the chance of a marked string, sin² of it · `kopt`: the best whole number of steps and its chance. */
export const GROVER_READOUTS = ['angle', 'success', 'kopt'] as const
export type GroverReadout = (typeof GROVER_READOUTS)[number]
export interface GroverPlaneState {
  kind: 'grover-plane'
  /**
   * The register: n qubits, so N = 2ⁿ strings, 1 ≤ n ≤ 10; `marked` is how many of them the oracle marks, M with 1 ≤ M < N (default 1).
   * α = arcsin √(M/N) is derived by physics/qc/grover.ts, never authored.
   */
  search: { n: number; marked?: number }
  /**
   * Grover steps applied to |w₀⟩: a whole number 0–64 at its ends. A sweep turns the arrow continuously by 2α per step (the drawn
   * state is a true Grover state only at whole steps).
   */
  k: Scrub
  /** 'oracle': also draw the next step's marking image (the arrow mirrored in the horizontal axis) as a dashed ghost. */
  half?: 'oracle'
  /** Mirror lines through the origin: 'x0perp' the horizontal axis (the marking oracle U_f), 'w0' the line through |w₀⟩ at α (the diffusion). */
  mirrors?: GroverMirror[]
  /** Faint arrows of steps 0 … k−1 behind the arrow (needs k ≤ 24 at both ends). */
  trail?: boolean
  /** 'alpha': the arc from |x₀⊥⟩ to |w₀⟩, labelled α · 'step': the arc of the last step, labelled 2α (k at least 1). */
  arcs?: GroverArc[]
  /** Theorem 1's picture proof, M₁ the horizontal axis and M₂ the line through |w₀⟩: a test vector on M₁ ('v1') or on M₂ ('v2') and its two reflections (needs k = 0 and no `half`). */
  proof?: 'v1' | 'v2'
  readouts?: GroverReadout[]
  shot?: GroverPlaneShot
}

/* ---- bits (SVG; P-F7-story §9.2): classical bits as truth tables, maps of strings, rows of strings and row reduction mod 2 ---- */
/**
 * Classical logic with no amplitudes: a gate or an authored table drawn as a truth table or as arrows from inputs to outputs, strings of
 * bits added with XOR or dotted, and Gauss–Jordan elimination over GF(2) one move at a time. Content writes only INPUTS (a gate name or
 * a table, the strings, the number of moves done); the resolver computes every output, every sum, every syndrome and every reduced
 * matrix from physics/qc/bits.ts. A state draws exactly ONE of `fn`, `rows` and `reduce` (a layout never repeats a kind, so one `bits`
 * state holds one picture).
 */
export const BITS_VIEWS = ['table', 'map'] as const
export type BitsView = (typeof BITS_VIEWS)[number]
/** A named gate, or an authored table of 2ⁿ rows (n = 1 … 3 input bits) whose outputs are m-bit numbers (m = 1 … 3), first bit most significant. */
export type BitsSource = { gate: BitsGate } | { table: number[]; n: number; m: number }
export interface BitsFnState {
  source: BitsSource
  /** 'table': every input with its output as filled (1) and empty (0) cells · 'map': inputs at the left, outputs at the right, one arrow per input; outputs that receive more than one arrow are marked. */
  view: BitsView
  /** A second source drawn beside the first in the same view (AND's arrows beside CNOT's). */
  versus?: BitsSource
  /** Inputs (bit strings of the first source's n places) to outline, with their arrows in the map view. */
  mark?: string[]
}
export const BITS_COMBINE = ['xor', 'dot'] as const
export type BitsCombine = (typeof BITS_COMBINE)[number]
export interface BitsRowsState {
  /** One to four rows of the same width (1 … 8 bits), each a string of 0s and 1s, drawn as filled (1) and empty (0) cells. */
  strings: string[]
  /** Needs exactly two rows. 'xor': a computed last row, the places where the rows differ · 'dot': a computed last row, the places where both have a 1, and the parity of its 1s (a·b). */
  combine?: BitsCombine
  /** A word of the rows' width: each row's dot product with it is written at the row's end (the syndrome of a check matrix), and the word is drawn as a last row. Not with `combine`. */
  against?: string
  /** Row labels (1 … 6 plain characters each); default a, b, c, d (check 1, 2, … with `against`). */
  names?: string[]
}
export interface BitsReduceState {
  /** One to four rows of the same width (1 … 8 bits): a matrix over GF(2). */
  strings: string[]
  /** How many moves (a row swap or a row XOR, in the order gf2RowReduceSteps makes them) are done: 0 … the total, whole at its ends; may sweep. */
  upTo: Scrub
}
/**
 * `bits` bitmap (P-B2-story §9.2 K-B): a bivariate bicycle code's check matrix drawn as pixels (a 1 is a filled cell), straight from physics/qec/bb.ts `bbCode`.
 * `which`: 'HX' (the X checks), 'HZ' (the Z checks) or 'both' (H_X above H_Z); the columns are the L qubits, then the R qubits (a separator between the halves,
 * another between X and Z checks). `bands` outlines up to 4 ranges of rows and/or columns (0-based, inclusive: [from, to]) in the rows and columns of the matrix drawn.
 */
export const BITMAP_CODES = ['gross', 'two-gross'] as const
export type BitmapCode = (typeof BITMAP_CODES)[number]
export const BITMAP_WHICH = ['HX', 'HZ', 'both'] as const
export type BitmapWhich = (typeof BITMAP_WHICH)[number]
export interface BitsBitmapState {
  /** `fifteen` (Papers B4): the 4 x 15 X-check matrix (and, for 'HZ' or 'both', the 10 Z checks) of the 15-qubit Reed-Muller code, from physics/qec/magic.ts. */
  matrix: { bb: BitmapCode | 'fifteen'; which: BitmapWhich }
  bands?: { rows?: [number, number]; cols?: [number, number] }[]
}
/**
 * `bits` grid (P-B2-story §9.2 K-B): a small labelled table of 0s and 1s, at most 12 × 12. `shiftAction`: the logical action (physics/qec/bb.ts `logicalXAction`, on the
 * paper's X logical basis) of the qubit shift x^a y^b on the 12 logical qubits of the gross or two-gross code, a 12 × 12 matrix over GF(2): row i, column j is 1 when the image
 * of X̄ⱼ contains X̄ᵢ. `rows`: a table of authored strings of 0s and 1s (the same width, at most 12 rows), labelled from 1.
 */
export type BitsGridState = { shiftAction: { code: BitmapCode; shift: [number, number] } } | { rows: string[] }
export interface BitsState {
  kind: 'bits'
  fn?: BitsFnState
  rows?: BitsRowsState
  reduce?: BitsReduceState
  /** B2 (additive): exactly one of fn, rows, reduce, bitmap, grid. */
  bitmap?: BitsBitmapState
  grid?: BitsGridState
  shot?: BitsShot
}

/* ---- code (SVG; P-Q21-story §9.2 K1, P-Q22-story §9.2, decisions/qc709-Q21Q22.md R4): one error-correcting code, from physics/qec ---- */
/**
 * One small stabilizer code as qubits and checks: discs are data qubits, squares are checks (the generators), and an edge joins a check to every qubit
 * it acts on (the Tanner graph). A code is named by a REGISTRY id (physics/qec/registry.ts), never by coordinates: where each disc and square sits is the
 * engine's (a drawing choice for the small codes, the engine's own geometry for the rotated surface code and for the bivariate bicycle codes). Content
 * writes only INPUTS (the id, the view, an error as a Pauli string, an authored correction); the resolver takes every syndrome, correction, residual,
 * logical operator, code word and distance from the engine. The two bicycle codes are drawn as their ℓ × m torus tile (both data families L and R, both
 * check families X and Z) with the edges of only the focused check(s): local edges as lines, long-range edges as labelled stubs that wrap off the tile.
 */
export const CODE_IDS = ['rep3', 'rep3x', 'shor9', 'steane7', 'five5', 'surface3', 'surface5', 'gross', 'two-gross', 'c422'] as const
export type CodeId = (typeof CODE_IDS)[number]
/**
 * B2 (additive; `bb` and `bp` sources only): 'cells' (the ℓ × m torus of 2 × 2 cell blocks, R top-left, X top-right, Z bottom-left, L bottom-right) · 'layers' (one X and one Z check of cell (0, 0) with
 * their edges coloured by thickness-2 layer) · 'cycle' (the edges of the depth-8 syndrome cycle active in one round) · 'beliefs' (belief propagation and OSD-0 on the Tanner graph of a small code).
 * 'layout': qubits, checks and edges (the Tanner graph) · 'checks': the generators as a table of Pauli letters (n ≤ 9) with error rows and their syndromes · 'words': |0̄⟩, |1̄⟩ or |+̄⟩ as
 * basis strings (n ≤ 9, k = 1, at most 16 strings) · 'torus' (B1; a `toric` source only): edge qubits on a wrapped L × M grid · 'patch' (B1; a `rotated` or `planar` source only): data qubits on a grid
 * with the checks as faces (rotated) or as squares on the staggered grid (unrotated).
 */
export const CODE_VIEWS = ['layout', 'checks', 'words', 'torus', 'patch', 'cells', 'layers', 'cycle', 'beliefs'] as const
export type CodeView = (typeof CODE_VIEWS)[number]
/**
 * What to draw over the layout: 'syndrome' lights the checks that read −1 · 'correction' the lookup decoder's Pauli (or the authored one) as outlined letters · 'residual' error × correction, named by the engine · 'logical'
 * a minimum-weight logical operator's support (for the toric / rotated / planar sources: the `operator`). B1, new sources only: 'weights' writes each check's weight in its square · 'stars' / 'plaquettes' (torus) highlight one family.
 */
export const CODE_SHOW = ['syndrome', 'correction', 'residual', 'logical', 'weights', 'stars', 'plaquettes'] as const
export type CodeShow = (typeof CODE_SHOW)[number]
export type CodeWord = 0 | 1 | 'plus'
/** B2: the presets of physics/qec/bbfamily.ts (gross and two-gross in the paper-tdg form; b72 … b756 are the rows of Table 3 of Bravyi et al.; two small examples of our own). */
export const BB_PRESET_IDS = ['gross', 'two-gross', 'b72', 'b90', 'b108', 'b144', 'b288', 'b360', 'b756', 'toy-24', 'toric-3x3'] as const
export type BBPresetId = (typeof BB_PRESET_IDS)[number]
export interface BBSpecState {
  l: number
  m: number
  /** up to 4 monomials x^i y^j each, as exponent pairs [i, j] */
  A: [number, number][]
  B: [number, number][]
}
/** Exactly one of `preset`, `spec`. `form` ('toric' = paper-tdg, 'bravyi' = Bravyi et al.) only changes the gross and two-gross presets. */
export interface BBSource {
  preset?: BBPresetId
  spec?: BBSpecState
  form?: 'toric' | 'bravyi'
}
export const BP_CODES = ['rep7', 'toric3'] as const
export type BPCodeId = (typeof BP_CODES)[number]
/**
 * Min-sum belief propagation (physics/qec/bp.ts) for X errors on `code`: `rep7` the 7-bit repetition code (checks on neighbouring bits), `toric3` the 3 × 3 toric code decoded with its plaquette checks (bit = edge).
 * `error`: the flipped bits (whole numbers from 0); `p` the flip chance; `iter` the rounds drawn (1 … 18; stops early when the syndrome is met); `osd` adds OSD-0 after those rounds, `tie` the order among equal beliefs.
 */
export interface BPSource {
  code: BPCodeId
  error: number[]
  p: number
  iter: number
  osd?: boolean
  tie?: 'low' | 'high'
}
/** A bicycle check by its index into the list of checks (the X checks first, then the Z checks), or by its Tanner name "X12" / "Z5" (the cell's index). */
export type CodeFocus = number | string
/** B1 (additive): the corner names of a rotated patch's face, for the order a check circuit touches its qubits (physics/qec/schedule.ts `Corner`). */
export const CODE_CORNERS = ['TL', 'TR', 'BL', 'BR'] as const
export type CodeCorner = (typeof CODE_CORNERS)[number]
/** B1: the operators a toric source can draw (physics/qec/toric.ts `toricOperator`) and those of a rotated / planar patch (the logical X̄ and Z̄ of the engine). */
export const CODE_TORIC_OPERATORS = ['z-loop-h', 'z-loop-v', 'x-cut-h', 'x-cut-v', 'plaquette'] as const
export const CODE_PATCH_OPERATORS = ['xbar', 'zbar'] as const
export type CodeOperatorName = (typeof CODE_TORIC_OPERATORS)[number] | (typeof CODE_PATCH_OPERATORS)[number]
/** B1: the Pauli of a fault on a list of qubits (0-based engine indices). */
export interface CodeFault {
  type: 'X' | 'Y' | 'Z'
  qubits: number[]
}
/** B3 (additive): the three steps of lattice surgery (physics/qec/surgery.ts) and what the picture of a step can mark. */
export const CODE_SURGERY_STEPS = ['separate', 'merged', 'split'] as const
export type CodeSurgeryStep = (typeof CODE_SURGERY_STEPS)[number]
export const CODE_SURGERY_SHOW = ['new', 'widened', 'seam', 'product'] as const
export type CodeSurgeryShow = (typeof CODE_SURGERY_SHOW)[number]
export interface CodeSurgery {
  /** The distance of each patch: 3 or 5. */
  d: 3 | 5
  /** XX: the patches sit side by side and X̄_A X̄_B is measured · ZZ: stacked, Z̄_A Z̄_B. */
  product: 'XX' | 'ZZ'
  /** 'separate': two patches and the empty seam · 'merged': one big patch (the new checks are measured) · 'split': the seam qubits are read out and the patches are alone again. */
  step: CodeSurgeryStep
  /** 'new' lights the new checks, 'widened' outlines the old boundary checks that grew (both: merged step only) · 'seam' rings the seam qubits · 'product' outlines the new checks and writes what their product is (merged step only). Each name once. */
  show?: CodeSurgeryShow[]
}
/**
 * Which code is drawn: exactly one of `code` (a registry id), `toric` (Kitaev's toric code, L × M with 2 ≤ L, M ≤ 8, one qubit on each edge of a wrapped grid, ≤ 128 qubits),
 * `rotated` (the rotated surface-code patch, odd d from 3 to 9), `planar` (the unrotated planar code, odd d from 3 to 7) or (B3) `surgery` (two rotated patches and the seam of a lattice
 * surgery, d = 3 or 5). The engine builds the last four (physics/qec/toric.ts, codes.ts rotatedSurfaceCode, planar.ts, surgery.ts); qubit numbers are the engine's, counted from 0.
 */
export interface CodeState {
  kind: 'code'
  code?: CodeId
  toric?: { L: number; M?: number }
  rotated?: { d: number }
  planar?: { d: number }
  /** B3 (additive): two distance-d patches and the seam between them, the view is the patch drawing (default 'patch'). */
  surgery?: CodeSurgery
  /** Default 'layout' ('torus' for a toric source, 'patch' for a rotated, planar or surgery source). */
  view?: CodeView
  /**
   * layout only. A Pauli error: one letter per qubit ("IXIIIII") or just the hit qubits, counted from 1 ("X2", "X1Z4"). Letters are written on the hit discs.
   */
  error?: string
  /** layout only; with `show: ['correction']` the Pauli to apply instead of the lookup decoder's. It must have the error's syndrome. Same two forms as `error`. */
  correction?: string
  /** layout only; each name once. 'syndrome', 'correction' and 'residual' need an `error`. */
  show?: CodeShow[]
  /** checks view only: up to 8 Pauli errors (same two forms), each listed with its syndrome beside the generators. */
  errors?: string[]
  /**
   * B3 (additive; checks view of a registry code only): a Pauli string of length n (letters I X Y Z, no sign, not all I) to be measured next. It is drawn as an extra row in the measured hue, and the
   * engine says whether it commutes with every check, is already in the group (the outcome is fixed) or would join the checks (then k drops by one).
   */
  measure?: string
  /** words view only, default 0. */
  word?: CodeWord
  /** bicycle codes, layout only: draw the edges of this check (at most two checks). Local edges are lines; long-range edges are labelled stubs with their target. */
  focus?: CodeFocus | CodeFocus[]
  /** bicycle codes, layout only: the shift automorphism x^a y^b (whole a, b with |a| ≤ ℓ, |b| ≤ m) as an arrow field on the L qubits, with whether it preserves both check families. */
  shift?: [number, number]
  /**
   * B1 (toric / rotated / planar sources only; layout, torus and patch views): a Pauli fault on up to 24 qubits (0-based): letters on the hit qubits; with show: ['syndrome'] the checks that
   * read −1 are lit (a Z fault lights the stars / X checks, an X fault the plaquettes / Z checks, a Y fault both), counted in the readout.
   */
  fault?: CodeFault
  /** B1: the support of a named operator drawn as letters (toric: with `at`, the row / column / plaquette; patch: 'xbar' or 'zbar'), with its weight, the checks it lights and what it is (a stabilizer or a logical operator). */
  operator?: CodeOperatorName
  /** B2: a bivariate bicycle code by preset or by (ℓ, m, A, B); drawn in the 'cells', 'layers' and 'cycle' views (physics/qec/bbfamily.ts). Exactly one source. */
  bb?: BBSource
  /** B2: belief propagation (and OSD-0) on the Tanner graph of a small code, view 'beliefs'. */
  bp?: BPSource
  /** B2 (bb source, 'cells'): the six edges of one check, four near and two long for the gross code in its torus form. */
  check?: { kind: 'X' | 'Z'; cell: [number, number] }
  /** B2 (bb source, with `check`): label the long edges with their offsets and draw them in a second hue. */
  longEdges?: boolean
  /** B2 (bb source, 'cells'): the cells of the polynomial α·A, α·B (or the transposes) as ringed blocks, α the monomial of the anchor cell. */
  pattern?: { poly: 'A' | 'B' | 'At' | 'Bt'; anchor: [number, number] }
  /** B2 (bb source, 'cycle'): the depth-8 syndrome cycle of Bravyi et al. Table 5 (or the variant with two Z reads swapped) in one round 1 … 8. */
  cycle?: { variant: 'printed' | 'swap-z-reads'; round: number }
  /** B1: a second operator, drawn in a second hue; qubits in both are ringed and their overlap counted (an odd overlap of an X-type and a Z-type operator is why they anticommute). */
  operator2?: CodeOperatorName
  /** B1 (toric): the row, column or plaquette number of `operator` / `operator2` (whole, from 0; default 0). */
  at?: number
  /** B1 (patch view of a rotated source): the order in which the check circuits of the X checks and of the Z checks touch the corners of their faces; spokes numbered 1–4, clashing pairs outlined. */
  schedule?: { xOrder: CodeCorner[]; zOrder: CodeCorner[] }
  /**
   * P1 (additive; a `bb` source whose preset is 'gross' or 'two-gross' in its default 'toric' form, 'cells' view): the L and R qubits in the support of 1-4 distinct logical operators of the paper's
   * basis of the code (physics/qec/bb.ts `paperLogicalBasis`; X-bar i = `ops` 'Xi', Z-bar i = 'Zi', i = 1 … 12). X-type operators are marked in the X hue, Z-type in the Z hue, a qubit in both is ringed
   * (it is a Y there). `shift: [a, b]` first translates every operator by the monomial x^a y^b (|a| ≤ l, |b| ≤ m), the same shift the code's automorphism makes. Readouts: each operator's weight
   * and, for every pair, the number of qubits the two share. Which operator is called X-bar 1 is the paper's choice of basis (fidelity `qc-code-paper-ops-basis`).
   */
  paperOps?: { ops: string[]; shift?: [number, number] }
  shot?: CodeShot
}
/** The names `paperOps.ops` may take (the validator refuses the rest): the paper's logical operators X-bar 1 … 12 and Z-bar 1 … 12 (App. A.1, Eqs. 30-36). */
export const CODE_PAPER_OPS = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9', 'X10', 'X11', 'X12', 'Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7', 'Z8', 'Z9', 'Z10', 'Z11', 'Z12'] as const
export type CodePaperOp = (typeof CODE_PAPER_OPS)[number]

/* ---- spacetime (SVG; P-B1-story §9.2 K-ST): the detector history of the repetition code under noise, from physics/qec/spacetime.ts ---- */
/**
 * Space-time histories of the repetition code: columns are the n − 1 checks (with a boundary column at each side), rows are the rounds 1 … rounds + 1 (the last, ideal one included), a data fault is a
 * horizontal edge, a readout fault a vertical one. Content writes INPUTS only: n, the number of rounds, authored faults or a seeded sample; the resolver lights the detectors, decodes by minimum-weight
 * matching and says whether the logical bit ended up flipped (all from physics/qec/spacetime.ts). With `spectrum` it draws no history at all, but a bar for each fault weight w (how many fault sets of
 * that weight there are, how many make the decoder fail, how many make it a tie), counted by the engine over every set. Not a place: the repetition code has one space dimension; a surface code has two.
 */
export const SPACETIME_SHOW = ['faults', 'detectors', 'matching', 'verdict'] as const
export type SpacetimeShow = (typeof SPACETIME_SHOW)[number]
/**
 * B3 (additive): the second mode of the kind, a repeated READOUT (`history.mode: 'readout'`, physics/qec/timelike.ts): m seam checks are read in each of R rounds, a reading flips with chance q, the
 * logical product of a round is the product of its m readings (wrong when an odd number flipped) and a majority vote over the R rounds gives the verdict. `show` then takes these names (the
 * repetition-code names above are for the other mode): 'readings' the flipped readings as dots · 'product' each round's product reading in a right-hand column · 'vote' the majority-vote row.
 */
export const SPACETIME_READOUT_SHOW = ['readings', 'product', 'vote'] as const
export type SpacetimeReadoutShow = (typeof SPACETIME_READOUT_SHOW)[number]
export interface SpacetimeFault {
  /** 'data': a bit flip of qubit `at` (0 … n − 1) between rounds t − 1 and t · 'meas': a wrong reading of check `at` (0 … n − 2) in round t. */
  kind: 'data' | 'meas'
  at: number
  /** The round 1 … rounds. */
  t: number
}
export interface SpacetimeState {
  kind: 'spacetime'
  history:
    | {
        code: 'rep'
        /** Data qubits, 3 … 9. */
        n: number
        /** Noisy rounds, 1 … 6 (one ideal round follows). */
        rounds: number
        /** At most 12 authored faults, each place once. */
        faults?: SpacetimeFault[]
        /** A seeded random history: every data place fails with chance p, every readout place with chance q (a whole seed). */
        sample?: { p: number; q: number; seed: number }
      }
    | {
        /** B3 (additive): the repeated product readout. Columns are the m seam checks, rows the R rounds (going down). */
        mode: 'readout'
        /** Seam checks m, 1 … 8. */
        checks: number
        /** Rounds R, an ODD whole number 1 … 11. */
        rounds: number
        /** The chance a single reading is wrong, 0 … 1: the engine then prints p (the product reading is wrong) and the vote's failure chance. With `seed` it also draws the flips. */
        q?: number
        /** A whole seed: the flips are drawn by the engine's generator (needs `q`; not with `faults`). */
        seed?: number
        /** At most 24 authored flipped readings, each `{round, check}` counted from 1, each place once (no `seed`). With neither `faults` nor `seed` nothing flips. */
        faults?: { round: number; check: number }[]
      }
  /** Default ['faults', 'detectors'] (repetition mode) or ['readings'] (readout mode). 'matching' and 'verdict' need at most 14 lit detectors. Readout mode takes 'readings', 'product', 'vote'. */
  show?: (SpacetimeShow | SpacetimeReadoutShow)[]
  /** Repetition mode only. 0 … rounds + 1 (whole): rows later than the cursor are dimmed. Default: all drawn plainly. */
  cursor?: number
  /** Repetition mode only. Draw no history: a bar for each weight 1 … maxW (1 … 4; weight 3 needs at most 45 fault places, weight 4 at most 15). Not with `faults`, `sample`, `show` or `cursor`. */
  spectrum?: { maxW: number }
  shot?: SpacetimeShot
}

/* ---- pauli-program (SVG; P-B4-story §9.2 S-a, built in B3): a program of Pauli operations on wires, read left to right ---- */
/**
 * A program in the Pauli-based picture: wires are horizontal lines; a COLUMN is one operation drawn as the Pauli letters it puts on the wires it touches (I = untouched).
 * `rot` a rotation by a quarter turn of the Pauli: `c+` / `c-` = ±π/2 (Clifford, outlined chip), `t+` / `t-` = ±π/4 (T-like, filled chip), the paper's convention.
 * `meas` a measurement of the Pauli (a meter box; `outcome` 0 = +, 1 = − when the picture should show one). `inject` a magic-state injection: a P⊗Z measurement (outcome `s`)
 * and an X measurement (outcome `t`) on a magic lane drawn below the wires (for reading, not a wire). Content writes only this data; the readouts are counts of the authored columns.
 * Three mutually exclusive modes: `program` (B3), `compile` and `branch` (B4, physics/qec/pbc.ts and inject.ts).
 */
export const PAULI_PROGRAM_ANGLES = ['c+', 'c-', 't+', 't-'] as const
export type PauliProgramAngle = (typeof PAULI_PROGRAM_ANGLES)[number]
export const PAULI_PROGRAM_PRESETS = ['toffoli-textbook', 'toffoli-phase', 'cnot', 'z-then-x'] as const
export type PauliProgramPreset = (typeof PAULI_PROGRAM_PRESETS)[number]
export type PauliProgramColumn =
  | { rot: { pauli: string; angle: PauliProgramAngle } }
  | { meas: { pauli: string; outcome?: 0 | 1 } }
  | { inject: { pauli: string; s?: 0 | 1; t?: 0 | 1 } }
export interface PauliProgram {
  /** Wires, 1 … 6. */
  wires: number
  /** 1 … 24 columns; each Pauli string has one letter (I, X, Y, Z) per wire and is not all I. */
  columns: PauliProgramColumn[]
  /** Optional wire labels, one of at most 3 characters per wire; default 1 … n. */
  labels?: string[]
}
export interface PauliProgramState {
  kind: 'pauli-program'
  /** Exactly one of `program`, `compile`, `branch`. */
  program?: PauliProgram
  /**
   * B4: a preset circuit (toffoli-textbook, toffoli-phase, cnot, z-then-x) with its first `upTo` gates (0 … the gate count) slid to the end by physics/qec/pbc.ts: the picture shows the
   * rotations collected so far with their current axes, then the gates not yet passed, and reads out the counts and the pending Clifford.
   */
  compile?: { preset: PauliProgramPreset; upTo: number }
  /** B4: planned axes (1 … 6 letters X, Y, Z, one injection each) against the executed ones, given the readings (one bit per injection; 1 = odd): physics/qec/inject.ts `axes`. */
  branch?: { axes: string[]; outcomes: (0 | 1)[] }
  /** Program mode: how many columns are drawn plainly (0 … columns.length); later ones are dimmed. Default: all. */
  upTo?: number
  shot?: PauliProgramShot
}

/* ---- surgery-graph (SVG; P-B3 S-a): the gauging graph of a logical operator, from physics/qec/gauge.ts ---- */
/**
 * To measure a logical operator L = X on a support of a CSS code, pick a connected graph on the support qubits (the DOTS), add one NEW qubit per link and measure a vertex check at every dot, a cycle check
 * around every independent loop, and the old checks deformed (physics/qec/gauge.ts; Williamson & Yoder 2024). The host is a registry id, never coordinates: `patch3-x` (a d = 3 patch, L = X-bar on a
 * column: a path of 3), `patches3-xx` (two patches, L = X-bar_A X-bar_B: the path edges forced by the Z checks plus `rungs` 1–3 bridge links between the facing columns), `patch3-steane` (a patch
 * and a Steane block, weight 3 + 3, `w` 1–3 matching links, `order` which partner each patch vertex meets) and `seam3` (lattice surgery's own graph: the four new checks are the dots, the three seam
 * qubits the links). Content writes only the host and options; every count, Cheeger constant, k and distance is the engine's (`gaugeSystem`). Where a dot is drawn is a drawing choice.
 */
export const SURGERY_GRAPH_HOSTS = ['patch3-x', 'patches3-xx', 'patch3-steane', 'seam3'] as const
export type SurgeryGraphHost = (typeof SURGERY_GRAPH_HOSTS)[number]
/** What to draw: the dots (labelled, with a tick to the code qubit each sits on) · the links (each a new qubit) · the independent cycles (tinted, numbered) · a summary of the checks measured. */
export const SURGERY_GRAPH_SHOW = ['vertices', 'edges', 'cycles', 'checks'] as const
export type SurgeryGraphShow = (typeof SURGERY_GRAPH_SHOW)[number]
/** Which engine numbers to print as readouts: dots V, links E, loops E − V + 1, the Cheeger constant h, the deformed code's qubits n, stored qubits k, the deformed distances. */
export const SURGERY_GRAPH_READOUTS = ['V', 'E', 'cycles', 'cheeger', 'n', 'k', 'distance'] as const
export type SurgeryGraphReadout = (typeof SURGERY_GRAPH_READOUTS)[number]
/**
 * P1 (additive): the SECOND source of the kind, the ancilla system of a logical processing unit (LPU) of the bicycle machine (paper-tdg App. A.3, physics/qec/tdg.ts `tdgLpuGraph`).
 * One half graph has a dot on each qubit of X-bar 1 (or X-bar 7) and a link for each Z check that meets it twice; the full graph has both halves, sharing one `bell` dot (it stands for two check
 * qubits), and the bridge links between them. Content writes the code, the mode and the operator to measure; every count is the engine's, except the cycles KEPT as checks, which are the paper's printed
 * numbers (reported). Which dots a bridge link joins, and where a dot is drawn, are a drawing's choice. A state names exactly one of `gauge` and `lpu`.
 */
export const SURGERY_LPU_CODES = ['gross', 'two-gross'] as const
export type SurgeryLpuCode = (typeof SURGERY_LPU_CODES)[number]
/** 'l': the left half graph (for X-bar 1 and Z-bar 7) · 'r': the right half graph (X-bar 7, Z-bar 1) · 'full': both halves, the bell dot and the bridge links (the Y products need all of it). */
export const SURGERY_LPU_MODES = ['l', 'r', 'full'] as const
export type SurgeryLpuMode = (typeof SURGERY_LPU_MODES)[number]
export const SURGERY_LPU_MEASURES = ['X1', 'Z1', 'Y1', 'X7', 'Z7', 'Y7'] as const
export type SurgeryLpuMeasure = (typeof SURGERY_LPU_MEASURES)[number]
/** The readouts of an lpu source: dots V (and the check qubits Vq of the full graph), links E, E − V + 1, the cycles kept as checks (reported), and (full graph only) u = Vq + E + kept. */
export const SURGERY_LPU_READOUTS = ['V', 'E', 'cycles', 'kept', 'u'] as const
export type SurgeryLpuReadout = (typeof SURGERY_LPU_READOUTS)[number]
export type SurgeryAnyReadout = SurgeryGraphReadout | SurgeryLpuReadout
export interface SurgeryLpuSource {
  code: SurgeryLpuCode
  mode: SurgeryLpuMode
  /** Light the part that measures this operator (engine: tdgLpuModeOf): the left half for X1 and Z7, the right half for X7 and Z1, the whole graph for Y1 and Y7. It must fit the drawn `mode`. */
  measure?: SurgeryLpuMeasure
}
export interface SurgeryGraphState {
  kind: 'surgery-graph'
  /** The gauging graph of a logical operator of a registry host. Exactly one of `gauge` and `lpu`. */
  gauge?: {
    host: SurgeryGraphHost
    /** patches3-xx only: bridge links between the facing columns, 1–3 (0 would be two separate paths, which the engine refuses). Default 3. */
    rungs?: number
    /** patch3-steane only: matching links of the adapter, 1–3. Default 3. */
    w?: number
    /** Cycle checks left out (the others stay measured), 0 … the number of independent cycles; the omitted ones become gauge qubits. Default 0. */
    drop?: number
    /** patches3-xx / patch3-steane: which partner each patch dot is matched to, a permutation of 0, 1, 2. Default the identity. */
    order?: number[]
  }
  /** P1 (additive): the LPU's ancilla graph (above). Exactly one of `gauge` and `lpu`; an lpu source refuses `show`, `focus`, `product` and `subset`. */
  lpu?: SurgeryLpuSource
  /** Default ['vertices', 'edges']. */
  show?: SurgeryGraphShow[]
  /** Outline one vertex check: the dot (a vertex id of the engine's graph, counted from 0) and the links it touches. */
  focus?: { vertex: number }
  /** Print each link's multiplicity in the product of ALL vertex checks (always 2, so it cancels) and say which X letters remain. */
  product?: boolean
  /** Shade a vertex set S and count its boundary (the links with exactly one end in S): 'worst' is the Cheeger set, or a list of at most half the vertices (at most 16 in all). */
  subset?: 'worst' | number[]
  /** Default none. A gauge source takes the SURGERY_GRAPH_READOUTS names, an lpu source the SURGERY_LPU_READOUTS names. */
  readouts?: SurgeryAnyReadout[]
  shot?: SurgeryGraphShot
}

/* ---- module-map (SVG; Papers P1): a drawing of the bicycle machine of paper-tdg, from physics/qec/tdg.ts ---- */
/**
 * The machine of Tour de gross: M modules in a line, each a bicycle code block (c qubits) and a logical processing unit (LPU, u qubits) joined by 12 logical wires, neighbouring modules joined by
 * an adapter (a qubits), and one T factory (f qubits) joined by its own adapter (a-prime qubits). Content writes the machine and what to highlight; every count is the engine's `tdgQubits`
 * (Eq. 25 of the paper: q = M (c + u + a) - a + a' + f). c, a and a-prime are computed; u and f are the paper's REPORTED Table 1 estimates, badged so on their blocks, so q "uses Table 1's u and f".
 * A block's area grows with the square root of the qubits it stands for; where a block sits is a drawing's choice. Not a place.
 */
export const MODULE_MAP_CODES = ['gross', 'two-gross'] as const
export type ModuleMapCode = (typeof MODULE_MAP_CODES)[number]
/** The factory's output error rate p: Table 3 gives its patch distance for 1e-3 and 1e-4. 'none' draws no factory (and the q readout, which adds it, is refused). */
export const MODULE_MAP_FACTORIES = ['1e-3', '1e-4', 'none'] as const
export type ModuleMapFactory = (typeof MODULE_MAP_FACTORIES)[number]
/** 'linear': the factory at the end of the line · 'triangular': the factory in a second row beside module 1 with its own adapter column (Fig. 2b of the paper; at most 6 modules). */
export const MODULE_MAP_LAYOUTS = ['linear', 'triangular'] as const
export type ModuleMapLayout = (typeof MODULE_MAP_LAYOUTS)[number]
/**
 * What an instruction uses, lit while the rest dims. 'none' lights nothing · 'code' every code block · 'lpu' every LPU block · 'pivot' every pivot wire (logical qubit 1) · 'in-module' the LPU of module
 * `focus` and its pivot · 'inter-module' the LPUs of modules `focus` and `focus + 1` and the adapter between them · 't-injection' the factory, its adapter, the LPU beside it and its pivot · 'ghz' every pivot and every adapter.
 */
export const MODULE_MAP_HIGHLIGHTS = ['none', 'code', 'lpu', 'pivot', 'in-module', 'inter-module', 't-injection', 'ghz'] as const
export type ModuleMapHighlight = (typeof MODULE_MAP_HIGHLIGHTS)[number]
/** Text rows from the engine: q (Eq. 25; needs a factory) · n = 11 M data qubits · parts c, u, a, a', f · physical qubits per logical qubit (c + u)/12 · chip yield y^J (two couplers per qubit is OUR assumption). At most 5, each once. */
export const MODULE_MAP_READOUTS = ['q', 'n', 'parts', 'perLogical', 'yield'] as const
export type ModuleMapReadout = (typeof MODULE_MAP_READOUTS)[number]
export interface ModuleMapState {
  kind: 'module-map'
  machine: {
    code: ModuleMapCode
    factory: ModuleMapFactory
    /** Modules, a whole number 1 … 1000. More than 12 are drawn as modules 1-3, a "… k more …" marker and the last two. */
    M: number
    /** Default 'linear'. 'triangular' needs M ≤ 6. */
    layout?: ModuleMapLayout
  }
  /** Default 'none'. */
  highlight?: ModuleMapHighlight
  /** Module counted from 0: 'in-module' lights module `focus` (default 0, 0 … M − 1); 'inter-module' lights `focus` and `focus + 1` (default 0, 0 … M − 2). */
  focus?: number
  /** Default none. */
  readouts?: ModuleMapReadout[]
  shot?: ModuleMapShot
}

/* ---- wavefunction (SVG; W-448 L12): a complex function along a line, drawn from physics/wave.ts ---- */
/**
 * A particle on a line, ħ = m = 1 (lengths in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ; the UI appends the units). Content writes INPUTS only: the
 * source and how it is moved, which curves to draw, which readouts; the resolver draws every sample from the engine (physics/wave.ts for a
 * packet on its grid, `planeSamples` for the analytic plane waves), so the picture and the Try-it cannot disagree. Re ψ and Im ψ share one
 * amplitude scale and the density has its own; ψ is an amplitude along a line, not a wave in space (fidelity `wavefunction-not-a-wave`).
 *
 * Sources (exactly one). `packet`: the Gaussian ψ = (2πσ²)^{-1/4} e^{-(x-x₀)²/4σ²} e^{ip₀x}, ⟨x⟩ = x₀, Δx = σ, ⟨p⟩ = p₀ (default 0), Δp = ħ/2σ ·
 * `plane`: e^{ipx}, |ψ| flat over the window, not normalisable (a generalised eigenstate: no norm, mean or spread of x is shown) ·
 * `twoWaves`: (e^{ip₁x} + e^{ip₂x})/√2 ·
 * `box` (Townsend pass G4b, ruling T2): a particle between infinite walls at x = 0 and x = L (2 ≤ L ≤ 16): level n (1 … 8), ψ_n = √(2/L) sin(nπx/L), E_n = n²π²/2L², or the equal superposition of two
 * different levels `[n1, n2]` (its density sloshes with period 2π/(E₂ − E₁)). ψ = 0 outside the walls, which are drawn as vertical rules; the default window is [−1, L + 1]. `time` multiplies each level by its own e^{−iE_n t}
 * (the free-particle spreading would be wrong in a box); `boost`, `shift`, `cells`, `interval` and `overlay` are refused. Readouts `norm xmean xspread pmean pspread product peak energy`.
 */
export type WavefunctionSource = { packet: { x0: Scrub; sigma: Scrub; p0?: Scrub } } | { plane: { p: number } } | { twoWaves: { p1: number; p2: number } } | { box: { L: number; n: number | [number, number] } }
export const WAVEFUNCTION_PANELS = ['position', 'momentum'] as const
export type WavefunctionPanel = (typeof WAVEFUNCTION_PANELS)[number]
/** re, im: thin lines (one amplitude scale) · density: |ψ|² filled (its own scale) · phase: a hue band under the density (the hue is the phase, a code for an angle). */
export const WAVEFUNCTION_SHOW = ['re', 'im', 'density', 'phase'] as const
export type WavefunctionShow = (typeof WAVEFUNCTION_SHOW)[number]
/** original: the state before boost, shift and time (dashed grey) · xpsi: (x̂ψ)(x) = xψ · ppsi: (p̂ψ)(x) = -iψ′ (re and im, dashed). Position panel only. */
export const WAVEFUNCTION_OVERLAYS = ['original', 'xpsi', 'ppsi'] as const
export type WavefunctionOverlay = (typeof WAVEFUNCTION_OVERLAYS)[number]
/** The numbers of cells the window may be chopped into. */
export const WAVEFUNCTION_CELLS = [4, 8, 16, 64, 512] as const
/**
 * norm ∫|ψ|²dx · xmean, xspread (Δx) · pmean, pspread (Δp) · product ΔxΔp (in ħ) · interval P(a<x<b) · peak max |ψ|² (per ℓ) · cell the cell [0, w):
 * its chance and chance ÷ w · wavelength 2π/p (a plane wave only) · energy E_n (or the mean energy of a pair), a `box` source only.
 */
export const WAVEFUNCTION_READOUTS = ['norm', 'xmean', 'xspread', 'pmean', 'pspread', 'product', 'interval', 'peak', 'cell', 'wavelength', 'energy'] as const
export type WavefunctionReadout = (typeof WAVEFUNCTION_READOUTS)[number]
export interface WavefunctionState {
  kind: 'wavefunction'
  /** Exactly one source (above). */
  source: WavefunctionSource
  /** Applied in this order, each may sweep: `boost` ε multiplies by e^{iεx̂} (adds ε to every momentum) · `shift` a applies T(a) = e^{-iap̂}, ψ(x) → ψ(x − a) · `time` t applies free evolution e^{-ip̂²t/2}. */
  boost?: Scrub
  shift?: Scrub
  time?: Scrub
  /** Default ['position']; both = two stacked panels of the SAME state, in the same colours. */
  panels?: WavefunctionPanel[]
  /** Default ['re', 'im', 'density']. */
  show?: WavefunctionShow[]
  /** Position panel only. */
  overlay?: WavefunctionOverlay[]
  /** Chop the position window into this many equal cells: one bar per cell = its chance, the density curve dashed behind; many cells look like the curve. */
  cells?: (typeof WAVEFUNCTION_CELLS)[number]
  /** A shaded stretch [a, b] of the position window and its chance ∫|ψ|²dx. */
  interval?: [number, number]
  /** Default x: [−8, 8], p: [−8, 8]; bounds within ±16. */
  window?: { x?: [number, number]; p?: [number, number] }
  readouts?: WavefunctionReadout[]
  shot?: WavefunctionShot
}

/* ---- spin-ladder (SVG; Townsend pass G2b, Lecture 7): the m ladder of spin j, drawn from physics/angmom.ts ---- */
/**
 * The 2j + 1 levels of spin j (Townsend Figs. 3.5-3.6), drawn from the engine's J matrices (physics/angmom.ts, Eq. 3.59). Content writes INPUTS only:
 * the spin, which state sits on the ladder, which operator's matrix stands beside it, which readouts; the resolver computes every chance, coefficient,
 * matrix entry and length. Levels run from m = +j (top) to m = -j.
 *
 * `ket`: the state |j, m> along `axis` ('x' | 'y' | 'z', or {thetaDeg, phiDeg}), drawn as one bar per z level whose length is the chance an SGz finds that
 * level (Townsend Fig. 3.10); axis 'z' puts the whole bar on level m. `apply`: the arrow J+ or J- takes the level of a z ket one step, labelled with the
 * engine's coefficient sqrt(j(j+1) - m(m +- 1)); on the end level it ends in a stop with the number 0 (needs a `ket` with axis 'z'). `matrix`: the labelled
 * (2j+1) x (2j+1) grid of that operator beside the ladder, in the z basis, entries to the engine's exact forms. `readouts`: 'length' |J| = sqrt(j(j+1)) hbar,
 * 'cone' the angle arccos(m/|J|) of Townsend Fig. 3.4 for every level (also draws that picture beside the ladder when there is no matrix), 'levels' 2j + 1,
 * 'chances' the bar chances in order.
 */
export const SPIN_LADDER_MATRICES = ['Jx', 'Jy', 'Jz', 'J+', 'J-', 'J2'] as const
export type SpinLadderMatrix = (typeof SPIN_LADDER_MATRICES)[number]
export const SPIN_LADDER_READOUTS = ['length', 'cone', 'levels', 'chances'] as const
export type SpinLadderReadout = (typeof SPIN_LADDER_READOUTS)[number]
export interface SpinLadderState {
  kind: 'spin-ladder'
  j: JValue
  ket?: { axis: AxisSpec; m: number }
  apply?: 'J+' | 'J-'
  matrix?: SpinLadderMatrix
  readouts?: SpinLadderReadout[]
  shot?: SpinLadderShot
}

/* ---- walk-graph (SVG; 709 Q19): a walker on a star graph with a marked spoke or an extra edge, or a MaxCut ring, drawn from physics/qc/walk.ts and variational.ts ---- */
/**
 * The graph of Chapter Q19's walks (Bergou Figs. 7.7-7.8, §7.8). Content writes INPUTS only; the resolver takes every chance and cut from the engine.
 *
 * `graph`: exactly one of `{ star: { N, marked?, extra? } }` (N = 3-16 SPOKES around the centre 0; `marked` a spoke 1…N; `extra` two different spokes joined by an
 * extra edge; not both) or `{ ring: { n } }` (n = 3-8 vertices joined in a cycle). `walker` (a star with `marked` or `extra`): the scattering walk after `step` steps (0-40),
 * from the outgoing start, or `start: 'in'` (all arriving edges; only with `marked`), or with `extra` the starting sign `sign` (default -1 = Eq. 7.67; +1 is the start
 * that fails). Each spoke is drawn with a width and shade proportional to the chance on its two edge states (starSpokeChances); the marked vertex is ringed; the extra edge
 * is a chord whose width follows the chance on its two states. `cut` (a ring only): a string of n bits, one per vertex; vertices are filled by their bit and the cut edges
 * drawn thick. `show`: 'chances' (the widths and shades; default on exactly when there is a walker) and 'labels' (vertex numbers; default on). `readouts` (at most 3, each once):
 * 'step' "step 4", 'marked' "marked spoke 94.5 %", 'near' "spokes 1, 2: 62.5 %", 'edge' "extra edge 12.5 %", 'cut' "cut 4 of 4 sides"; omitted = the natural ones.
 */
export const WALK_GRAPH_SHOW = ['chances', 'labels'] as const
export type WalkGraphShow = (typeof WALK_GRAPH_SHOW)[number]
export const WALK_GRAPH_READOUTS = ['step', 'marked', 'near', 'edge', 'cut'] as const
export type WalkGraphReadout = (typeof WALK_GRAPH_READOUTS)[number]
export interface WalkGraphState {
  kind: 'walk-graph'
  graph: { star: { N: number; marked?: number; extra?: [number, number] } } | { ring: { n: number } }
  walker?: { step: number; start?: 'out' | 'in'; sign?: 1 | -1 }
  cut?: string
  show?: WalkGraphShow[]
  readouts?: WalkGraphReadout[]
  shot?: WalkGraphShot
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
  | PlotState
  | PlotSeriesState
  | PlotPointsState
  | Bb84State
  | ClocksState
  | GroverPlaneState
  | BitsState
  | CodeState
  | SpacetimeState
  | PauliProgramState
  | SurgeryGraphState
  | ModuleMapState
  | WavefunctionState
  | SpinLadderState
  | WalkGraphState
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
 * P2's [L] lecture says · [B] books add · [C] clues · [D] go deeper. Order within a unit is always L → B → C → D.
 * Physics 709's Foundations chapters (F1–F8) have no lecture notes: their first phase is `'core'` ("The foundation"), in
 * the lecture's place (core → books → clue). `'core'` appears only in F chapters and `'lecture'` never does
 * (content.test.tsx). `'deeper'` (interface change W-448 #2) is optional material BEYOND the notes, after the clues:
 * "Go deeper · beyond the notes", boxed apart. The notes' own line is every other phase; a reader who skips every
 * `'deeper'` beat loses nothing that line relies on (content.test.tsx `deeperProblems` defines the rule).
 */
export type BeatPhase = 'lecture' | 'core' | 'books' | 'clue' | 'deeper'

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
   * ONE interactive widget drawn in place under the paragraph (a notes or Optics Lab paragraph only: `NotesPara.widget`, content/qc709/notes/kit.ts).
   * The widget-spec gate (widgets/visualSpecs.test.tsx) validates its props; the chapters never set it.
   */
  widget?: WidgetSpec
  /**
   * Gloss ids (`GlossEntry.introduces`) this beat introduces (interface change W-709 #12; additive): shows a small
   * "New space" / "New notation" eyebrow above the beat's text, in both tracks and in Read mode.
   */
  introduces?: string[]
  /**
   * A class boundary of the course notes falls at this beat (interface change W-448 #1; rulings 448-L8L11 P1): a slim
   * rule "Class 9 starts here" (or "Class 9 · from minute 23") above the beat, in Story mode, Read mode and print.
   * Chapters are cut by topic, so a class can begin or resume in the middle of one. Not on a `'deeper'` beat.
   */
  classMark?: ClassMark
  /**
   * The reference trail (Papers, rulings papers.md R5; interface change W-papers #2, additive): the references this step
   * relies on, each with the section/page relied on and why. Drawn as a compact "This step relies on …" line whose link
   * opens the reference's entry on the paper's References page (components/BeatPaperNotes.tsx). Shared by both tracks.
   */
  trail?: TrailEntry[]
  /**
   * The paper's OWN numbers (Papers, R3; W-papers #2, additive): each value exactly as printed, with its source and exact
   * location. Drawn in a block of its own with a "Reported" badge, never mixed with `claims` (the engine's numbers).
   */
  reported?: ReportedClaim[]
}

/** One step of a reference trail (`Beat.trail`): which reference, the part relied on, and why the step needs it. */
export interface TrailEntry {
  /** A reference id of the paper's spec (papers/spec.ts `ReferenceSpec.id`). */
  ref: string
  /** The section / page of that reference the step relies on ('§3, p. 5'); plain text. */
  at: string
  /** One plain sentence: why the step needs it. */
  why: string
  /** The reference's short label ('Bravyi et al. 2024'), filled in from the spec by papers/compile.ts. */
  label?: string
}

/** Where a reported number is printed (`ReportedClaim.at`). */
export const REPORTED_AT_KINDS = ['table', 'figure', 'section', 'equation', 'text'] as const
export type ReportedAtKind = (typeof REPORTED_AT_KINDS)[number]

/**
 * A number the paper reports (its own simulations, tables or figures; rulings papers.md R3). Never computed here and never
 * fed into a displayed computation unless that computation says so (a recipe's `uses`). The review re-reads each one
 * against the page image.
 */
export interface ReportedClaim {
  /** Unique within the paper spec: /^[a-z0-9-]+$/. */
  id: string
  /** What the number is, in plain words ('the gross code’s parameters'). */
  text: string
  /** The value exactly as printed ('[[144, 12, 12]]', '1 × 10⁻⁷'). */
  value: string
  /**
   * The ingest source id of the paper ('paper-tdg') OR a reference key of the paper's reference list ('den02'; rulings papers-B3B4.md R1: a
   * reference's own number is reported with the REFERENCE's source and location). The validator rejects a key the list does not have.
   */
  source: string
  /**
   * The exact location: a table, figure, section, equation or running text, and the printed page. A reference read online has no printed pages
   * (papers-B1B2.md R2): its location is the section / table / figure / equation label alone, and `page` is left out.
   */
  at: { kind: ReportedAtKind; label?: string; page?: number }
  /** The reference's short label ('Dennis et al. 2002'), filled in from the spec by papers/compile.ts when `source` is a reference key. */
  sourceLabel?: string
}

/** "Figure 3b, p. 9" · "§2.1, p. 9" · "p. 9": a reported number's location in words. */
export function reportedWhere(at: ReportedClaim['at']): string {
  const page = at.page === undefined ? '' : `p. ${at.page}`
  const join = (head: string): string => (page ? `${head}, ${page}` : head)
  if (at.kind === 'text' || !at.label) return page || 'in the text'
  if (at.kind === 'section') return join(`§${at.label}`)
  return join(`${at.kind[0].toUpperCase()}${at.kind.slice(1)} ${at.label}`)
}

/**
 * Where a class of the lecture course begins or resumes inside a chapter (`Beat.classMark`). `class` is the class
 * number as the notes number it. `from` is the point INSIDE that class at which this chapter's material takes up, as
 * a short plain phrase ("minute 23"); without it the class simply starts here. Plain text: no TeX, no markup
 * (content.test.tsx `classMarkProblems`).
 */
export interface ClassMark {
  class: number
  from?: string
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
 * Formal is the same argument in full notation. Both lists end on `result`; Ground-up never has fewer steps. A
 * one-track course (448) writes the Ground-up list only.
 */
export interface Derivation {
  /** What is derived (display TeX), shown in the derivation's head. */
  result: string
  ground: DerivStep[]
  /**
   * The Formal track's lines. Required in a TWO-track course (709: content.test.tsx), absent in a one-track course
   * (448 has only Ground-up; interface change W-448 #3, rulings 448-L8L11 P3): a one-track derivation is `{result,
   * ground}` and the lint rejects a `formal` list there (it would never be shown). Read it through
   * `content/track.ts` `derivationSteps` / `derivSteps`, which fall back to `ground` when a track lacks its own list.
   */
  formal?: DerivStep[]
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

export type FidelityKey = StageKind | 'optical' | 'poincare' | 'plane-photon' | 'plane-polarization' | 'amplitudes-bell' | 'amplitudes-fourier' | 'matrix-pair' | 'matrix-chances' | 'bb84-b92' | 'spacetime-readout' | 'surgery-lpu' | 'code-paper-ops'
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
  // P-Q10-story §9.2: a 2-D curve sampled from a named engine function; content never writes a point
  plot: {
    title: 'CURVE · engine-sampled',
    note: 'not a place · the curve and its markers are computed, not drawn',
    axes: ['x', 'y'],
    fidelityKey: 'plot',
  },
  // W-448 L8-B: Lecture 8's protocol ledger; a row is one photon, the outcomes are Born draws from a seeded run
  bb84: {
    title: 'PROTOCOL LEDGER · BB84',
    note: 'not a place · each row is one photon; outcomes drawn from the Born rule (seeded)',
    axes: ['Alice', 'Eve', 'Bob'],
    fidelityKey: 'bb84',
  },
  // W-448 L11: Lecture 11's two phase clocks beside an energy ladder; the hue is the hand's own phase, a code for an angle
  clocks: {
    title: 'PHASE CLOCKS · two energy levels',
    note: 'schematic layout · hand angles, hand lengths and the gap are exact',
    axes: ['energy', 'phase'],
    fidelityKey: 'clocks',
    legend: 'phase',
  },
  // P-Q17-story §9.2: the real 2-D plane Grover's search lives in; an angle here is a STATE angle (not doubled, unlike a Bloch angle)
  'grover-plane': {
    title: 'THE GROVER PLANE · a real 2-D slice of ℂᴺ',
    note: 'not a place · angles are state angles, not doubled; only this plane is drawn',
    axes: ['$|x_0^\\perp\\rangle$ · the rest, evenly', '$|x_0\\rangle$ · marked'],
    fidelityKey: 'grover-plane',
  },
  // P-F7-story §9.2: classical bits; a filled cell is a 1, an empty cell a 0. Every output, sum and reduced row is computed
  bits: {
    title: 'BITS · 0 and 1 only',
    note: 'not a place · filled = 1, empty = 0',
    axes: ['inputs · left', 'outputs · right'],
    fidelityKey: 'bits',
  },
  // P-Q21-story §9.2 K1: an error-correcting code from the engine; where a disc or square is drawn is a drawing choice (the surface and bicycle codes use the engine's own geometry)
  code: {
    title: 'CODE · qubits and checks',
    note: 'not a place · discs are qubits, squares are checks; positions are a drawing choice',
    axes: ['qubits', 'checks'],
    fidelityKey: 'code',
  },
  // P-B1-story §9.2 K-ST: the detector history of the repetition code; one space dimension plus time (a surface code has two space dimensions)
  spacetime: {
    title: 'SPACE-TIME · detector history',
    note: 'not a place · the repetition code; a surface code has two space dimensions',
    axes: ['check', 'round'],
    fidelityKey: 'spacetime',
  },
  // P-B4-story §9.2 S-a: a program of Pauli operations on wires, read left to right (time runs along the wires; spacing is a drawing)
  'pauli-program': {
    title: 'PROGRAM · Pauli operations, time →',
    note: 'not a place · letters are Paulis on wires; spacing is a drawing',
    axes: ['wire', 'time'],
    fidelityKey: 'pauli-program',
  },
  // P-B3 S-a: the gauging graph of a logical operator (dots on its support, one new qubit per link)
  'surgery-graph': {
    title: 'GAUGING GRAPH · new qubits',
    note: 'not a place · dots are qubits, links are new qubits; a drawing',
    axes: ['support qubits', 'new qubits'],
    fidelityKey: 'surgery-graph',
  },
  // Papers P1: the bicycle machine of Tour de gross, drawn as modules in a line with adapters and a T factory; areas follow qubit counts, positions are a drawing
  'module-map': {
    title: 'ARCHITECTURE · modules (schematic)',
    note: 'schematic · block areas follow the qubit counts, positions are a drawing',
    axes: ['modules', 'adapters'],
    fidelityKey: 'module-map',
  },
  // W-448 L12: a complex function along a line (Lectures 12 and 13); the hue of the phase band is a code for an angle
  wavefunction: {
    title: 'WAVEFUNCTION · amplitude along a line',
    note: 'schematic scales · every sample is the engine’s',
    axes: ['position', 'amplitude'],
    fidelityKey: 'wavefunction',
    legend: 'phase',
  },
  // Townsend pass G2b (448 Lecture 7): the m ladder of spin j; the cone readout is a picture of |J| and J_z only
  'spin-ladder': {
    title: 'SPIN j · the m ladder',
    note: 'schematic heights · levels, chances and entries are the engine’s; |J| is a length, not a direction',
    axes: ['m', 'chance'],
    fidelityKey: 'spin-ladder',
  },
  // P-Q19-story §9.2 S1 (709 Q19): the star and ring graphs of the walks; widths are chances of the engine's edge states
  'walk-graph': {
    title: 'WALK GRAPH · edge chances',
    note: 'schematic layout · chances and counts are the engine’s; a width is where the walker may be found, not where a particle sits',
    axes: ['vertex', 'edge'],
    fidelityKey: 'walk-graph',
  },
}

/** Variants that change what the space IS (L6 §6.3: light is not spin), or what a bar's length means (amplitudes). */
export const PASSPORT_VARIANT: {
  readonly optical: Passport
  readonly poincare: Passport
  readonly operatorPlain: Passport
  readonly ampProbability: Passport
  readonly ampSigned: Passport
  readonly ampBell: Passport
  readonly ampBellProbability: Passport
  readonly ampFourier: Passport
  readonly ampFourierProbability: Passport
  readonly ampKeep: Passport
  readonly ampKeepWires: Passport
  readonly plane709: Passport
  readonly bloch709: Passport
  readonly planePhoton: Passport
  readonly planePolarization: Passport
  readonly matrixTableau: Passport
  readonly matrixPair: Passport
  readonly matrixPairChances: Passport
  readonly matrixLabels: Passport
  readonly matrixChances: Passport
  readonly bb84B92: Passport
  readonly spacetimeReadout: Passport
  readonly surgeryLpu: Passport
  readonly codePaperOps: Passport
} = {
  optical: {
    title: 'PHYSICAL SPACE ℝ³ · optical bench',
    note: 'schematic · this glow IS light',
    axes: ['x', 'y · beam', 'z'],
    fidelityKey: 'optical',
  },
  // W-448 L8-A (rulings 448-L8L11 L8 R4): the poles read H/V (z), D/A (x), C± (y); the axes are the ⟨σ⟩ averages in the H/V
  // basis, not Stokes S₁–S₃ (the notes put H/V on z; in Stokes naming H/V would be S₁)
  poincare: {
    title: 'STATE SPACE · polarization sphere (light)',
    note: 'not a place · averages in the H/V basis',
    axes: ['⟨σx⟩', '⟨σy⟩', '⟨σz⟩'],
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
  // amplitudes with inBasis 'bell': the same state read as overlaps with Φ+, Φ−, Ψ+, Ψ− (a fresh fidelityKey, so the
  // computational-basis drawer never changes)
  ampBell: {
    title: 'STATE · Bell-basis amplitudes',
    note: 'not a place · length = size · bars are Bell states',
    axes: ['Bell states'],
    fidelityKey: 'amplitudes-bell',
    legend: 'phase',
  },
  ampBellProbability: {
    title: 'STATE · Bell-basis chances',
    note: 'not a place · length = chance |a|² · bars are Bell states',
    axes: ['Bell states'],
    fidelityKey: 'amplitudes-bell',
  },
  // amplitudes with dft (W-709 F8-A): the Fourier transform of the state, bars numbered 0 … N − 1 (a fresh fidelityKey, so the
  // computational-basis drawer never changes)
  ampFourier: {
    title: 'LIST · Fourier view',
    note: 'not a place · length = size · bars are the places k',
    axes: ['places k'],
    fidelityKey: 'amplitudes-fourier',
    legend: 'phase',
  },
  ampFourierProbability: {
    title: 'LIST · Fourier chances',
    note: 'not a place · length = chance · bars are the places k',
    axes: ['places k'],
    fidelityKey: 'amplitudes-fourier',
  },
  // amplitudes with keep (W-709 Q18-B): the chances of the first wires only, the other wires summed over (the base 'amplitudes' drawer, one added line)
  ampKeep: {
    title: 'STATE · chances of the first wires',
    note: 'not a place · length = chance · the other wires summed over',
    axes: ['first wires’ strings'],
    fidelityKey: 'amplitudes',
  },
  // amplitudes with keep as a LIST of wires (stage-code agent S2): the chances of the named wires only, the others summed over
  ampKeepWires: {
    title: 'STATE · chances of chosen wires',
    note: 'not a place · length = chance · the other wires summed over',
    axes: ['chosen wires’ strings'],
    fidelityKey: 'amplitudes',
  },
  // P-Q2-story §9.2 S1: the photon-polarization unit's real slice, named by |x⟩, |y⟩ instead of the spin frame
  planePhoton: {
    title: 'STATE SPACE · photon polarization (real slice)',
    note: 'not a place · turns by the filter’s own angle, no halving',
    axes: ['$|x\\rangle$', '$|y\\rangle$'],
    fidelityKey: 'plane-photon',
  },
  // W-448 L8-A: Lecture 8's real slice: the arrow's angle IS the polarizer's angle (no halving), named H/V and D/A
  planePolarization: {
    title: 'STATE SPACE · linear polarizations (real slice)',
    note: 'not a place · the arrow’s angle is the polarizer’s angle',
    axes: ['$|H\\rangle$', '$|V\\rangle$'],
    fidelityKey: 'plane-polarization',
  },
  // matrix v2 (W-709 #15): the tableau view is a table of Pauli strings, not a numeric grid
  matrixTableau: {
    title: 'PAULI TABLE',
    note: 'not a place · a table of operators',
    axes: ['row', 'qubit'],
    fidelityKey: 'matrix',
  },
  // matrix v3 (W-448 L9-A): two systems as a table of boxes, one per pair of labels (Susskind's table of the pair's basis)
  matrixPair: {
    title: 'STATE SPACE · two spins',
    note: 'not a place · one box per label pair',
    axes: ['Alice: u, d', 'Bob: u, d'],
    fidelityKey: 'matrix-pair',
    legend: 'phase',
  },
  matrixPairChances: {
    title: 'CHANCES · two spins',
    note: 'not a place · box size = chance',
    axes: ['Alice: u, d', 'Bob: u, d'],
    fidelityKey: 'matrix-pair',
  },
  matrixLabels: {
    title: 'BASIS LABELS · Alice ⊗ Bob',
    note: 'not a place · one box per label pair',
    axes: ['Alice', 'Bob'],
    fidelityKey: 'matrix-pair',
  },
  matrixChances: {
    title: 'CHANCES · two coins',
    note: 'not a place · chances, not amplitudes',
    axes: ['coin A: +1, −1', 'coin B: +1, −1'],
    fidelityKey: 'matrix-chances',
  },
  // W-709 Q15: the seeded B92 ledger (`bb84` with protocol 'b92'): a row is one qubit, a reading is a Born draw of the engine's own POVMs
  bb84B92: {
    title: 'PROTOCOL LEDGER · B92',
    note: 'not a place · each row is one qubit; readings drawn from the Born rule (seeded)',
    axes: ['Alice', 'Eve', 'Bob'],
    fidelityKey: 'bb84-b92',
  },
  // P-B3 S-b: the repeated product readout of a seam (a toy model: independent flips, a majority vote)
  spacetimeReadout: {
    title: 'SPACE-TIME · repeated readout',
    note: 'not a place · a toy model: independent flips, a majority vote',
    axes: ['check', 'round'],
    fidelityKey: 'spacetime-readout',
  },
  // Papers P1: the ancilla graph of a logical processing unit (surgery-graph with an `lpu` source); the counts are the engine's, the cycles kept as checks are the paper's
  surgeryLpu: {
    title: 'LPU GRAPH · ancilla qubits',
    note: 'not a place · dots are qubits, links are qubits; positions are a drawing',
    axes: ['dots', 'links'],
    fidelityKey: 'surgery-lpu',
  },
  // Papers P1: the paper's logical operators drawn on the bicycle code's cells (code with `bb.paperOps`); the drawer adds the note about the choice of basis
  codePaperOps: {
    title: 'CODE · qubits and checks',
    note: 'not a place · discs are qubits, squares are checks; positions are a drawing choice',
    axes: ['qubits', 'checks'],
    fidelityKey: 'code-paper-ops',
  },
}

/**
 * Is a grid state a v3 PAIR view (W-448 L9-A): a `table` source, or a `coef` source that asks for the pair's own labels, cells,
 * factors or readouts? Only these draw the pair scene and take the pair passport; every earlier `matrix` state is untouched.
 */
export const isPairState = (s: MatrixGridState): boolean =>
  'table' in s.source || ('coef' in s.source && (s.labels === 'ud' || s.cells !== undefined || s.factors !== undefined || s.readouts !== undefined))
/** The passport of a pair view: its source and cell mode decide, never the beat. */
function pairPassport(s: MatrixGridState): Passport {
  if ('table' in s.source) return 'classical' in s.source.table ? PASSPORT_VARIANT.matrixChances : PASSPORT_VARIANT.matrixLabels
  return s.cells === 'chances' ? PASSPORT_VARIANT.matrixPairChances : s.cells === 'labels' ? PASSPORT_VARIANT.matrixLabels : PASSPORT_VARIANT.matrixPair
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
  if (s.kind === 'hilbert-plane' && s.labels === 'polarization') return PASSPORT_VARIANT.planePolarization
  // the Papers section reads like 709 (computational-basis labels on the shared WebGL kinds)
  if (course !== 'sl448' && s.kind === 'hilbert-plane') return PASSPORT_VARIANT.plane709
  if (course !== 'sl448' && s.kind === 'bloch') return PASSPORT_VARIANT.bloch709
  if (s.kind === 'operator-space' && s.labels === 'plain') return PASSPORT_VARIANT.operatorPlain
  if (s.kind === 'amplitudes' && s.inBasis === 'bell') return s.mode === 'probability' ? PASSPORT_VARIANT.ampBellProbability : PASSPORT_VARIANT.ampBell
  if (s.kind === 'amplitudes' && s.dft) return s.mode === 'probability' ? PASSPORT_VARIANT.ampFourierProbability : PASSPORT_VARIANT.ampFourier
  if (s.kind === 'amplitudes' && Array.isArray(s.keep)) return PASSPORT_VARIANT.ampKeepWires
  if (s.kind === 'amplitudes' && s.keep !== undefined) return PASSPORT_VARIANT.ampKeep
  if (s.kind === 'amplitudes' && s.mode === 'probability') return PASSPORT_VARIANT.ampProbability
  if (s.kind === 'amplitudes' && s.mode === 'signed') return PASSPORT_VARIANT.ampSigned
  if (s.kind === 'matrix' && 'tableau' in s) return PASSPORT_VARIANT.matrixTableau
  if (s.kind === 'matrix' && !('tableau' in s) && isPairState(s)) return pairPassport(s)
  if (s.kind === 'bb84' && s.protocol === 'b92') return PASSPORT_VARIANT.bb84B92
  if (s.kind === 'spacetime' && 'mode' in s.history) return PASSPORT_VARIANT.spacetimeReadout
  if (s.kind === 'surgery-graph' && s.lpu !== undefined) return PASSPORT_VARIANT.surgeryLpu
  if (s.kind === 'code' && s.paperOps !== undefined) return PASSPORT_VARIANT.codePaperOps
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
