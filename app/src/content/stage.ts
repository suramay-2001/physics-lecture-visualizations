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
 */
import type { Axis, Sign } from '../physics/sg'
import type { NamedKet } from '../physics/spin'
import type { Claim, Ref } from './schema'
import type { Anchor, BallShot, BlochShot, HopfShot, LabShot, OperatorShot, PlaneShot } from './stageVocab'

/* ------------------------------------------------------------------------------------------------ */
/* Kinds and shared value types                                                                      */
/* ------------------------------------------------------------------------------------------------ */

export const STAGE_KINDS = ['lab-r3', 'hilbert-plane', 'bloch', 'bloch-ball', 'hopf', 'operator-space'] as const
export type StageKind = (typeof STAGE_KINDS)[number]

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
   * allowed). `label` is the arrow's TeX chip (default Â|ψ⟩).
   */
  image?: PlaneOp & { label?: string }
  /**
   * Lecture 3's Rule 3 as a picture: draw P̂ᵢ|ψ⟩, the part of ψ along frame vector i (1 or 2), as a vector of length
   * |cᵢ|. With `renormalize` it grows to length 1 across the beat's hold: the state after that outcome.
   */
  project?: 1 | 2
  renormalize?: boolean
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

export type StageState = LabState | HilbertPlaneState | BlochState | BallState | HopfState | OperatorState
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
}

/** One line of a derivation: where the algebra arrives, and why the step is allowed. */
export interface DerivStep {
  /** The line itself: display TeX. */
  tex: string
  /** Why this step holds (rich text; the track's sentence cap applies). */
  why: string
  /** Numbers this line shows (the claim ledger reads the step's `why` and `tex`). */
  claims?: Claim[]
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
}

/* ------------------------------------------------------------------------------------------------ */
/* Passports: derived from the kind, never authored per beat                                         */
/* ------------------------------------------------------------------------------------------------ */

export type FidelityKey = StageKind | 'optical' | 'poincare'
export interface Passport {
  /** Title line (Martian Mono 12/500): the space's class in caps. Rich inline. */
  title: string
  /** Note line (11/400): always starts with the honesty claim ("schematic" / "not a place"). */
  note: string
  /** Axis labels in that space's units (rich inline). An axis is never x/y/z outside lab-r3 (D §2.3). */
  axes: readonly string[]
  /** Key into FIDELITY / FIDELITY_VARIANT (content/fidelity.ts): the drawer one click from the passport. */
  fidelityKey: FidelityKey
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
}

/** Variants that change what the space IS (L6 §6.3: light is not spin). */
export const PASSPORT_VARIANT: { readonly optical: Passport; readonly poincare: Passport; readonly operatorPlain: Passport } = {
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
}

/** Kind + variant → passport. The only way a stage gets its label. */
export function passportOf(s: StageState): Passport {
  if (s.kind === 'lab-r3' && s.variant === 'optical') return PASSPORT_VARIANT.optical
  if (s.kind === 'bloch' && s.labels === 'poincare') return PASSPORT_VARIANT.poincare
  if (s.kind === 'operator-space' && s.labels === 'plain') return PASSPORT_VARIANT.operatorPlain
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
