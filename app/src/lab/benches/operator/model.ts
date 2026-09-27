/**
 * Operator Lab model (D-lab §2.2; decisions/lab.md; the user's Q2 answer (a)). PURE: parameters in, the picture and
 * every readout out. Every number comes from the engine (app/src/physics): `decompose`, `classify`, `eigen2`,
 * `unitaryAction` (U = e^{−iτA}, axis â, angle 2|a⃗|τ, phase −a₀τ), `blochVector`, `rotateBloch`, `dot`, `cross`,
 * `probUpAlong`, `operatorInBasis`, `commutator`, the cell parser (`parse`/`evalComplex`, as `parseMatrix2`).
 * ⟨A⟩, ΔA and P(λ₊) are read off the Bloch vector (P review item 1: `expectation` throws on round-off for large typed
 * entries), and checked against the engine's `expectation`, `spread` and `prob` in model.test.ts. ħ = 1 inside; the
 * readouts append ħ only while a spin preset is the operator (`unitOf`); every other A is a plain number.
 *
 * Two views share one camera orientation: OPERATOR SPACE (A = a₀I + a⃗·σ⃗: the arrow a⃗, the eigen-axis ±â through a
 * ghost Bloch sphere, a₀ on a gauge) and STATE SPACE (the Bloch sphere: ψ₀, its orbit about â, the bead U(τ)ψ₀).
 * The canvas draws `view` and nothing else; drags come back as points (physics coordinates) and are turned into
 * parameters here (`aFromTip`, `psi0FromPoint`, `tauFromBead`).
 */
import { type C, abs, arg, c, snap } from '../../../physics/complex'
import { apply, commutator, dagger, identity, madd, matmul, mscale, type Mat, type Vec } from '../../../physics/linalg'
import { classify, decompose, decomposeHermitian, eigen2, type Decomp, type Eigen2, type OpClass, unitaryAction, type UnitaryAction } from '../../../physics/operators'
import { LIMITS, MAX_CELL_ABS, evalComplex, parse, type ParseError } from '../../../physics/expr'
import {
  basisMatrix,
  blochVector,
  cross,
  dot,
  KET,
  ketFromBloch,
  type NamedKet,
  nDotSigma,
  operatorInBasis,
  probUpAlong,
  projector,
  relativeSign,
  rotateBloch,
  samePhysicalState,
  SIGMA_X,
  SIGMA_Z,
  spinAlong,
  SX,
  SY,
  SZ,
  toBasis,
  type Vec3,
} from '../../../physics/spin'
import { cnum, cnumSig, commaChunks, degText, ketText, matRows, short2, sig, signed, turnText, type Unit, vec3, withHbarPow, withUnit } from '../../format'
import type { OperatorHandle, OperatorLabView, Orbit } from '../../handle'
import { presetTable } from '../../presets'

/* ------------------------------------------------------------------------------------------------ */
/* Ranges and presets                                                                                */
/* ------------------------------------------------------------------------------------------------ */

/** |a⃗| ≤ 3 for dragged and slider values (D-lab §2.2); typed matrices are only capped by the parser (10⁶). */
export const A_MAX = 3
/** a₀ slider range ±3. */
export const A0_MAX = 3
/** τ ∈ [0, 4π]: two full turns of S_z (the sign after one lap, the ket back after two). */
export const TAU_MAX = 4 * Math.PI
/** Arrows are drawn at scale 1 up to this length, then scaled down (and the readout says so). */
export const DRAW_LIMIT = 1.5
/** A dragged ψ₀ within this angle of a named ket snaps onto it (so |+x⟩ is reachable by hand). */
export const SNAP_RAD = (4 * Math.PI) / 180

export type Basis = 'z' | 'x' | 'y'
export type Cells = readonly [readonly [string, string], readonly [string, string]]
export type OpPresetId = 'sx' | 'sy' | 'sz' | 'sn' | 'proj-z' | 'hadamard' | 'identity'
export type HandleId = OperatorHandle

export interface OpPreset {
  id: OpPresetId
  /** Button text (rich inline TeX). */
  label: string
  /** Plain name for screen readers and readouts. */
  name: string
  unit: Unit
}
export const OP_PRESETS: readonly OpPreset[] = [
  { id: 'sx', label: '$S_x$', name: 'S_x', unit: 'hbar' },
  { id: 'sy', label: '$S_y$', name: 'S_y', unit: 'hbar' },
  { id: 'sz', label: '$S_z$', name: 'S_z', unit: 'hbar' },
  { id: 'sn', label: '$S_n(\\theta, \\varphi)$', name: 'S_n', unit: 'hbar' },
  { id: 'proj-z', label: '$|{+z}\\rangle\\langle{+z}|$', name: '|+z⟩⟨+z|', unit: 'none' },
  { id: 'hadamard', label: '$(\\sigma_x + \\sigma_z)/\\sqrt2$', name: '(σx + σz)/√2', unit: 'none' },
  { id: 'identity', label: '$I$', name: 'I', unit: 'none' },
]
export const opPreset = (id: OpPresetId): OpPreset => OP_PRESETS.find((p) => p.id === id)!
/**
 * The unit of A's readouts (P review item 7): ħ while a spin preset (S_x, S_y, S_z, S_n) is the operator, plain
 * numbers for every other A, including one dragged, slid or typed from a spin preset (the panel says so).
 */
export const unitOf = (p: Pick<OperatorParams, 'source' | 'preset'>): Unit => (p.source === 'params' && p.preset ? opPreset(p.preset).unit : 'none')

/** The unit vector of S_n at polar angle θ and azimuth φ (degrees). */
export function nOf(sn: { theta: number; phi: number }): Vec3 {
  const t = (sn.theta * Math.PI) / 180
  const p = (sn.phi * Math.PI) / 180
  return [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)]
}

/** A preset's matrix (z basis), built by the engine. */
export function presetMatrix(id: OpPresetId, sn: { theta: number; phi: number } = SN_DEFAULT): Mat {
  switch (id) {
    case 'sx':
      return SX
    case 'sy':
      return SY
    case 'sz':
      return SZ
    case 'sn':
      return spinAlong(nOf(sn))
    case 'proj-z':
      return projector(KET['+z'])
    case 'hadamard':
      return mscale(madd(SIGMA_X, SIGMA_Z), Math.SQRT1_2)
    case 'identity':
      return identity(2)
  }
}
export const SN_DEFAULT: Readonly<{ theta: number; phi: number }> = { theta: 60, phi: 0 }

/** The three display bases (z | x | y): the matrix changes, the picture does not. */
export const BASIS_KETS: Record<Basis, [Vec, Vec]> = { z: [KET['+z'], KET['-z']], x: [KET['+x'], KET['-x']], y: [KET['+y'], KET['-y']] }
/** A (z basis) → its matrix in `basis`: B†AB (Lecture 5). */
export const inBasis = (M: Mat, basis: Basis): Mat => operatorInBasis(M, BASIS_KETS[basis])
/** A matrix written in `basis` → the z basis: B A B†. */
export function fromBasis(M: Mat, basis: Basis): Mat {
  const B = basisMatrix(BASIS_KETS[basis])
  return matmul(matmul(B, M), dagger(B))
}

/* ------------------------------------------------------------------------------------------------ */
/* Parameters                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

export interface Psi0 {
  /** A named ket (exact amplitudes from the engine), or null for (θ, φ). */
  named: NamedKet | null
  /** Bloch angles in radians (kept in step with `named`). */
  theta: number
  phi: number
}
export interface CellError {
  cell: [0 | 1, 0 | 1]
  pos: number
  reason: ParseError | 'non-finite' | 'too-large'
}

export interface OperatorParams {
  /** A from the parameters (a₀ and a⃗ real: Hermitian) or from typed cells (any 2×2, in the display basis). */
  source: 'params' | 'cells'
  a0: number
  a: Vec3
  /** Typed cell text (display basis) while `source` is 'cells'. */
  cells: Cells
  /**
   * The value behind each cell (display basis), kept at full precision: an edit re-reads only the edited cell, so the
   * other three keep their exact values (P review item 10: rounded text lost "unitary · squares to I").
   */
  cellVals: Mat | null
  /** The z-basis matrix of the last cells that parsed. */
  typed: Mat | null
  cellError: CellError | null
  basis: Basis
  preset: OpPresetId | null
  sn: { theta: number; phi: number }
  psi0: Psi0
  tau: number
  /** Operator B for commutator mode (a preset), or null. */
  B: OpPresetId | null
  /** "Predict first" (off by default): results stay hidden until the student checks a prediction. */
  predict: boolean
  revealed: boolean
  guess: [string, string]
  /** The arrow scale frozen for the length of an a⃗ drag (null: follows the lengths). */
  frozenScale: number | null
  /** Split of the two views: left/right on a wide stage, top/bottom on a squarer one. */
  split: 'lr' | 'tb'
  /** The DOM twin that has focus (the scene highlights its handle). */
  focus: HandleId | null
}

const psiNamed = (k: NamedKet): Psi0 => {
  const r = blochVector(KET[k])
  return { named: k, theta: Math.acos(Math.max(-1, Math.min(1, r[2]))), phi: Math.atan2(r[1], r[0]) }
}
export const PSI_NAMED = psiNamed

export const INITIAL_PARAMS: OperatorParams = {
  source: 'params',
  a0: 0,
  a: [0.5, 0, 0],
  cells: [
    ['0', '0.5'],
    ['0.5', '0'],
  ],
  cellVals: null,
  typed: null,
  cellError: null,
  basis: 'z',
  preset: 'sx',
  sn: { ...SN_DEFAULT },
  psi0: psiNamed('+z'),
  tau: Math.PI / 2,
  B: null,
  predict: false,
  revealed: false,
  guess: ['', ''],
  frozenScale: null,
  split: 'lr',
  focus: null,
}

/** The operator A in the z basis. */
export function matrixOf(p: Pick<OperatorParams, 'source' | 'a0' | 'a' | 'typed'>): Mat {
  if (p.source === 'cells' && p.typed) return p.typed
  return madd(mscale(identity(2), p.a0), nDotSigma(p.a))
}

/** Real (a₀, a⃗) of a Hermitian preset (engine decomposition). */
export function presetParams(id: OpPresetId, sn: { theta: number; phi: number } = SN_DEFAULT): { a0: number; a: Vec3 } {
  const d = decomposeHermitian(presetMatrix(id, sn))!
  return { a0: d.a0, a: d.a }
}

/* ------------------------------------------------------------------------------------------------ */
/* Typed cells                                                                                       */
/* ------------------------------------------------------------------------------------------------ */

const round4 = (x: number) => {
  const r = Math.round(x * 1e4) / 1e4
  return r === 0 ? 0 : r
}
/** Exact decimals the engine's snap writes as fractions. */
const DECIMAL: Record<string, string> = { '1/2': '0.5', '1/4': '0.25', '3/4': '0.75' }
/**
 * One real part in a form the parser reads back EXACTLY where the engine's `snap` finds one (P review item 10):
 * integers, 0.5, 0.25, 0.75, 1/sqrt(2), sqrt(3)/2, sqrt(3)/4; else 4 decimals ("0.433"). Sign separate.
 */
function partText(x: number): string {
  const s = snap(Math.abs(x), 4)
  if (s.includes('.')) return String(round4(Math.abs(x)))
  return DECIMAL[s] ?? s.replace(/√(\d)/g, 'sqrt($1)')
}
/** A cell's text for a complex entry, in a form the cell parser reads back ("0.5", "-0.5i", "1/sqrt(2)", "0.25 - 0.433i"). */
export function cellText(z: C): string {
  const re = partText(z.re)
  const im = partText(z.im)
  const reNeg = z.re < 0 && re !== '0'
  const imNeg = z.im < 0
  if (im === '0') return reNeg ? `-${re}` : re
  const mag = im === '1' ? 'i' : im.startsWith('1/') ? `i${im.slice(1)}` : im.includes('sqrt') ? `i*${im}` : `${im}i`
  if (re === '0') return imNeg ? `-${mag}` : mag
  return `${reNeg ? '-' : ''}${re} ${imNeg ? '-' : '+'} ${mag}`
}
/** The four cells of M (z basis) written in `basis`. */
export function cellsOf(M: Mat, basis: Basis): Cells {
  const S = inBasis(M, basis)
  return [
    [cellText(S[0][0]), cellText(S[0][1])],
    [cellText(S[1][0]), cellText(S[1][1])],
  ]
}
const CELL_ORDER: [0 | 1, 0 | 1][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
]
/** One cell's text → its value, with the rules of the engine's `parseMatrix2` (cell limits, finite, |z| ≤ 10⁶). */
export function parseCell(text: string): { ok: true; z: C } | { ok: false; pos: number; reason: CellError['reason'] } {
  const res = parse(text, { mode: 'complex', limits: LIMITS.cell })
  if (!res.ok) return { ok: false, pos: res.pos, reason: res.reason }
  const z = evalComplex(res.ast)
  if (!z) return { ok: false, pos: 0, reason: 'non-finite' }
  if (Math.hypot(z.re, z.im) > MAX_CELL_ABS) return { ok: false, pos: 0, reason: 'too-large' }
  return { ok: true, z }
}
/**
 * Typed cells (display basis) → the z-basis matrix `M` and the display-basis values `D`, or the first cell that
 * fails (caret position, plain reason). Reads all four (a setup, a test); an edit uses `editCell`.
 */
export function parseCells(cells: Cells, basis: Basis): { ok: true; M: Mat; D: Mat } | { ok: false; error: CellError } {
  const D: Mat = [
    [c(0), c(0)],
    [c(0), c(0)],
  ]
  for (const [r, k] of CELL_ORDER) {
    const res = parseCell(cells[r][k])
    if (!res.ok) return { ok: false, error: { cell: [r, k], pos: res.pos, reason: res.reason } }
    D[r][k] = res.z
  }
  return { ok: true, M: fromBasis(D, basis), D }
}
/**
 * One edited cell (P review item 10): only that cell is read again; the other three keep the values they stand for
 * (`vals`, full precision: a preset's exact entries, or what the student typed), so an edit of one cell never rounds
 * the others. `M` (z basis) is null while any cell does not read; `error` names the first such cell, the edited
 * one first.
 */
export function editCell(cells: Cells, vals: Mat, r: 0 | 1, k: 0 | 1, text: string, basis: Basis): { cells: Cells; vals: Mat; M: Mat | null; error: CellError | null } {
  const next = cells.map((row, i) => row.map((t, j) => (i === r && j === k ? text : t))) as unknown as Cells
  const v = vals.map((row) => [...row]) as Mat
  const own = parseCell(text)
  if (own.ok) v[r][k] = own.z
  const order = [[r, k] as [0 | 1, 0 | 1], ...CELL_ORDER.filter(([i, j]) => i !== r || j !== k)]
  for (const [i, j] of order) {
    const res = i === r && j === k ? own : parseCell(next[i][j])
    if (!res.ok) return { cells: next, vals: v, M: null, error: { cell: [i, j], pos: res.pos, reason: res.reason } }
  }
  return { cells: next, vals: v, M: fromBasis(v, basis), error: null }
}

/** Plain reasons for a cell that does not parse (shown under the matrix, with a caret at the position). */
export const CELL_REASON: Record<CellError['reason'], string> = {
  empty: 'This cell is empty.',
  'too-long': 'Too long: a cell takes at most 64 characters.',
  'bad-char': 'This character is not allowed here.',
  'unknown-identifier': 'Unknown name. Use numbers, i, pi, e, sqrt(…), exp(…), sin(…), cos(…).',
  'too-many-tokens': 'Too many pieces: write it more simply.',
  'too-deep': 'Too many brackets inside brackets.',
  syntax: 'Something is missing or out of place here.',
  'unexpected-end': 'The entry stops too early.',
  // the Grapher's grammar only (physics/expr.ts `grammar: 'grapher'`): a matrix cell never returns these
  'spaced-numbers': 'Put * between the two numbers.',
  'bare-argument': 'Put the function’s argument in brackets.',
  'name-digit': 'Put * between the name and the number.',
  'bare-exponent': 'Put the exponent in brackets.',
  'non-finite': 'This entry is not a finite number.',
  'too-large': 'Too large: keep every entry at most 10⁶ in size.',
}

/* ------------------------------------------------------------------------------------------------ */
/* The model                                                                                         */
/* ------------------------------------------------------------------------------------------------ */

/** What the canvas draws (the page ↔ Babylon contract, lab/handle.ts). */
export type OperatorView = OperatorLabView
export type { Orbit }

export type Tone = 'text' | 'op' | 'plus' | 'minus' | 'state' | 'silver'
export interface Readout {
  key: string
  text: string
  tone: Tone
  /** Pieces that must not wrap inside (kets and vectors: one per amplitude or component); `chunks.join(' ') === text`. */
  chunks?: string[]
}
/** A handle's DOM twin: its value in words, whether it can move, and why not (P review items 2 and 6). */
export interface TwinText {
  value: string
  disabled: boolean
  disabledText: string
}

export interface OperatorModel {
  /** A in the z basis and in the display basis. */
  M: Mat
  shown: Mat
  hermitian: boolean
  d: Decomp
  /** Real parts of a₀ and a⃗ (the drawn arrow). */
  a0: number
  a: Vec3
  imag: { a0: boolean; a: boolean }
  /** |a⃗| (of the real part). */
  len: number
  /** â, for a Hermitian A with a⃗ ≠ 0. */
  axis: Vec3 | null
  eig: Eigen2
  cls: OpClass
  psi0: Vec
  r0: Vec3
  act: UnitaryAction | null
  /** U(τ)ψ₀ and its Bloch vector. */
  psi: Vec
  r: Vec3
  /** ψ₀ is an eigenstate of a HERMITIAN A (its orbit is a point): only the phase changes. Never for a non-Hermitian A. */
  eigenstate: boolean
  orbit: Orbit | null
  /** ⟨A⟩, P(λ₊), ΔA on U(τ)ψ₀ (Hermitian A only). */
  stats: { mean: number; pPlus: number; spread: number } | null
  /** The ket after, relative to ψ₀ when both are the same point: the phase χ in ket = e^{iχ}ψ₀. */
  relation: number | null
  /** Commutator mode: B, its arrow b⃗, the arrow a⃗ × b⃗ of [A, B]/2i (Hermitian A only), and [A, B] = 0. */
  comm: { B: Mat; name: string; b: Vec3; cross: Vec3 | null; compatible: boolean } | null
  scale: number
  pending: boolean
  /** ħ for a spin preset, else plain numbers (`unitOf`). */
  unit: Unit
  readouts: { op: Readout[]; state: Readout[] }
  /** The keyboard twins of the three drag handles (the page renders these words as they are). */
  twins: { tip: TwinText; psi0: TwinText; bead: TwinText }
  view: OperatorView
}

const EPS = 1e-9

/**
 * ⟨A⟩, P(λ₊) and ΔA of a Hermitian A = a₀I + a⃗·σ⃗ on the pure state with Bloch vector r (|r| = 1), P review item 1:
 * ⟨A⟩ = a₀ + a⃗·r, P(λ₊) = (1 + â·r)/2 (engine `probUpAlong`), ΔA = |a⃗ × r| = √(|a⃗|² − (a⃗·r)²). Nothing here can throw
 * or lose the answer to round-off (the engine's `expectation` throws when ⟨ψ|A²|ψ⟩ picks up an imaginary part
 * above 1e-9, which rounding does for entries ≥ 10⁴). Equal to the engine's `expectation`, `spread` and `prob`
 * (model.test.ts, every preset and random Hermitian A).
 */
export function statsFromBloch(a0: number, a: Vec3, r: Vec3): { mean: number; pPlus: number; spread: number } {
  const len = len3(a)
  return { mean: a0 + dot(a, r), pPlus: len > EPS ? probUpAlong(a, r) : 1, spread: len3(cross(a, r)) }
}
/**
 * The class flags that are true, in the lecture scene's teaching order (the same words as `classReadout` in
 * stage/scenes/operator/opLabels, pinned equal in review.test.ts; written here so the bench chunk does not pull that
 * module in: the lab byte budget). Null when no flag holds and A is not normal: the "not normal" line says it (item 9).
 */
export function classLine(k: OpClass): string | null {
  const out = [k.hermitian && 'Hermitian', k.unitary && 'unitary', k.projector && 'projector', k.involution && 'squares to I', k.scalar && 'a multiple of I'].filter(Boolean)
  return out.length ? out.join(' · ') : k.normal ? 'normal' : null
}
/** (M + M†)/2: exactly Hermitian, for a matrix the engine already calls Hermitian (within 1e-9). */
const hermitianPart = (M: Mat): Mat => mscale(madd(M, dagger(M)), 0.5)
/** The largest entry size of M (the residue cut-off for the non-Hermitian readouts scales with it). */
const maxAbs = (M: Mat): number => Math.max(...M.flat().map((z) => abs(z)))
const len3 = (v: Vec3) => Math.hypot(v[0], v[1], v[2])
const scale3 = (v: Vec3, k: number): Vec3 => [v[0] * k, v[1] * k, v[2] * k]

/** Draw scale for the longest arrow: 1 up to DRAW_LIMIT, ½ up to 2·DRAW_LIMIT, else DRAW_LIMIT/longest. */
export function drawScaleFor(lens: number[]): number {
  const m = Math.max(0, ...lens)
  if (m <= DRAW_LIMIT) return 1
  if (m <= 2 * DRAW_LIMIT) return 0.5
  return DRAW_LIMIT / m
}

/** ψ₀ as a ket: the engine's named ket, or the ket at Bloch angles (θ, φ). */
export const psi0Ket = (p: Psi0): Vec => (p.named ? KET[p.named] : ketFromBloch(p.theta, p.phi))

/** The arc from r₀ turned about `axis` by `angle` (≤ one lap), sampled every ~5°. */
export function arcPoints(axis: Vec3, angle: number, r0: Vec3): Vec3[] {
  const a = Math.min(Math.abs(angle), 2 * Math.PI) * Math.sign(angle || 1)
  const n = Math.max(1, Math.ceil(Math.abs(a) / ((5 * Math.PI) / 180)))
  return Array.from({ length: n + 1 }, (_, i) => rotateBloch(axis, (a * i) / n, r0))
}

export function operatorModel(p: OperatorParams): OperatorModel {
  const M0 = matrixOf(p)
  const cls0 = classify(M0)
  // a matrix the engine calls Hermitian (within 1e-9) is used as its Hermitian part, which is exactly Hermitian
  // (a typed 2+9e-10i, or round-off from a basis change): the turn is then exactly unitary
  const M = cls0.hermitian ? hermitianPart(M0) : M0
  const cls = cls0.hermitian ? classify(M) : cls0
  const shown = inBasis(M, p.basis)
  const hermitian = cls.hermitian
  const d = decompose(M)
  const a0 = d.a0.re
  const a: Vec3 = [d.a[0].re, d.a[1].re, d.a[2].re]
  const imag = { a0: Math.abs(d.a0.im) > EPS, a: d.a.some((z) => Math.abs(z.im) > EPS) }
  const len = len3(a)
  const axis: Vec3 | null = hermitian && len > EPS ? scale3(a, 1 / len) : null
  const eig = eigen2(M)
  const unit = unitOf(p)
  const pending = p.predict && !p.revealed

  // the state: ψ₀, U(τ)ψ₀ (engine), its orbit about â
  const psi0 = psi0Ket(p.psi0)
  const r0 = blochVector(psi0)
  const act = hermitian ? unitaryAction(M, p.tau) : null
  const psi = act ? apply(act.U, psi0) : psi0
  const r = blochVector(psi)
  const along = axis ? dot(axis, r0) : 1
  // P review item 2: only a Hermitian A has eigenstates whose orbit is a point (for a non-Hermitian A nothing turns,
  // and even a true eigenvector with a complex λ changes its norm)
  const eigenstate = hermitian && (!axis || Math.abs(along) > 1 - 1e-9)
  const orbit: Orbit | null = axis && !eigenstate ? { center: scale3(axis, along), axis, radius: Math.sqrt(Math.max(0, 1 - along * along)) } : null
  const stats = hermitian ? statsFromBloch(a0, a, r) : null
  const relation = samePhysicalState(psi0, psi) ? arg(relativeSign(psi0, psi)) : null

  // commutator mode: [A, B] = 2i (a⃗ × b⃗)·σ⃗ for the traceless parts, so [A, B]/2i has the arrow a⃗ × b⃗
  let comm: OperatorModel['comm'] = null
  const bUnit: Unit = p.B ? opPreset(p.B).unit : 'none'
  if (p.B) {
    const B = presetMatrix(p.B, p.sn)
    const dB = decomposeHermitian(B)!
    const K = commutator(M, B)
    const C = decompose(K)
    // [A, B]/2i = (C.a / 2i)·σ⃗: the arrow a⃗ × b⃗ (real when A and B are Hermitian)
    const crossV: Vec3 = [C.a[0].im / 2, C.a[1].im / 2, C.a[2].im / 2]
    const compatible = K.every((row) => row.every((z) => abs(z) < 1e-9))
    comm = { B, name: opPreset(p.B).name, b: dB.a, cross: hermitian ? crossV : null, compatible }
  }

  const scale = p.frozenScale ?? drawScaleFor([len, ...(comm ? [len3(comm.b), comm.cross ? len3(comm.cross) : 0] : [])])

  /* ---------------- readouts (engine values, formatted) ---------------- */
  // units (P review item 7): a quantity of A carries ħ while A is a spin preset; b⃗ carries B's unit; a⃗ × b⃗ both
  const u = (s: string) => withUnit(s, unit)
  const hA = unit === 'hbar' ? 1 : 0
  const hB = bUnit === 'hbar' ? 1 : 0
  const perH = unit === 'hbar' ? '/ħ' : ''
  // a non-Hermitian A is read to 4 significant figures, so the part that makes it so is never rounded away (item 11)
  const tol = 1e-12 * Math.max(1, maxAbs(M))
  const fmt = hermitian ? cnum : (z: C) => cnumSig(z, tol)
  const op: Readout[] = []
  const st: Readout[] = []
  const nw = (key: string, text: string, tone: Tone): Readout => ({ key, text, tone, chunks: commaChunks(text) })
  const [row0, row1] = matRows(shown, fmt)
  op.push({ key: 'A-head', text: `A in the ${p.basis} basis${unit === 'hbar' ? ' (units of ħ)' : ''}`, tone: 'text' })
  op.push({ key: 'A-0', text: row0, tone: 'text' }, { key: 'A-1', text: row1, tone: 'text' })
  if (!pending) {
    if (!hermitian) {
      const which = imag.a && imag.a0 ? 'a₀ and a have' : imag.a ? 'a has' : imag.a0 ? 'a₀ has' : 'the matrix has'
      op.push({ key: 'nonherm', text: `${which} imaginary parts: not Hermitian`, tone: 'silver' })
    }
    op.push({ key: 'a0', text: `a₀ = ${hermitian ? u(short2(a0)) : fmt(d.a0)}`, tone: 'op' })
    op.push(nw('a', hermitian ? `a = ${u(vec3(a))}` : `a = (${d.a.map(fmt).join(', ')})`, 'op'))
    if (hermitian) op.push({ key: 'len', text: `|a| = ${u(short2(len))}`, tone: 'text' })
    if (axis) op.push(nw('ahat', `â = ${vec3(axis)}`, 'text'))
    const [l1, l2] = eig.values
    if (hermitian && !axis) op.push({ key: 'lam', text: `λ = ${u(signed(l1.re))} for every state`, tone: 'text' })
    else if (hermitian) {
      op.push({ key: 'lam+', text: `λ₊ = ${u(signed(l1.re))}`, tone: 'plus' }, { key: 'lam-', text: `λ₋ = ${u(signed(l2.re))}`, tone: 'minus' })
    } else op.push({ key: 'lam+', text: `λ₁ = ${fmt(l1)}`, tone: 'text' }, { key: 'lam-', text: `λ₂ = ${fmt(l2)}`, tone: 'text' })
    if (axis || !hermitian) {
      const vs = eig.vectors.map((v) => toBasis(v, BASIS_KETS[p.basis]))
      const names = hermitian ? ['|λ₊⟩', '|λ₋⟩'] : ['|λ₁⟩', '|λ₂⟩']
      vs.forEach((v, i) => op.push(nw(`vec${i}`, `${names[i]} = ${ketText(v, fmt)}`, 'text')))
      if (eig.defective) op.push({ key: 'defective', text: 'one eigenvector only (defective)', tone: 'silver' })
    }
    const klass = classLine(cls)
    if (klass) op.push({ key: 'class', text: klass, tone: 'text' })
    // item 9: the passport's "opposite points are orthogonal" holds for a normal A only
    if (!hermitian && !cls.normal) op.push({ key: 'normal', text: eig.defective ? 'A not normal' : 'eigenvectors not orthogonal (A not normal)', tone: 'silver' })
    // item 13: two significant figures (a huge typed |a⃗| used to read "scale 0")
    if (scale < 1) op.push({ key: 'scale', text: `arrows drawn at scale ${scale === 0.5 ? '½' : sig(scale, 2)}`, tone: 'silver' })
  } else op.push({ key: 'pending', text: 'results hidden: check your prediction', tone: 'silver' })
  if (comm) {
    op.push(nw('b', `B = ${comm.name} · b = ${withUnit(vec3(comm.b), bUnit)}`, 'text'))
    if (!pending) {
      if (comm.cross) op.push(nw('comm', `[A,B]/2i: a×b = ${withHbarPow(vec3(comm.cross), hA + hB)}`, 'op'))
      // item 14: no ∥ (the mono font has no glyph for it); "compatible" is for observables, so a non-Hermitian A "commutes"
      const verdict = comm.compatible ? 'yes' : 'no'
      op.push({ key: 'compat', text: comm.cross ? `compatible ([A,B] = 0 ⇔ a × b = 0): ${verdict}` : `commute ([A,B] = 0): ${verdict}`, tone: 'text' })
    }
  }

  st.push({ key: 'psi0', text: p.psi0.named ? `ψ₀ = |${p.psi0.named}⟩` : `ψ₀ at θ ${degText(p.psi0.theta)}, φ ${degText(p.psi0.phi)}`, tone: 'state' })
  st.push({ key: 'basis', text: `kets in the ${p.basis} basis`, tone: 'text' })
  st.push(nw('before', `before: ${ketText(toBasis(psi0, BASIS_KETS[p.basis]))}`, 'text'))
  if (!pending && !hermitian) {
    // item 5: A = H + icI is a turn times a growth factor, so "not a turn" was false in general
    st.push({ key: 'nounitary', text: 'A is not Hermitian: exp(−iτA) is not unitary in general, so no turn is drawn', tone: 'silver' })
  } else if (!pending && act) {
    const [u0, u1] = matRows(inBasis(act.U, p.basis))
    st.push(nw('after', `after: ${ketText(toBasis(psi, BASIS_KETS[p.basis]))}`, 'state'))
    st.push({ key: 'U-head', text: `U = exp(−iτA${perH}) · τ = ${tauText(p.tau)}`, tone: 'text' })
    st.push({ key: 'U-0', text: u0, tone: 'text' }, { key: 'U-1', text: u1, tone: 'text' })
    st.push({ key: 'turn', text: axis ? `turn ${turnText(act.angle)} about â` : 'no turn (A = a₀I)', tone: 'text' })
    // item 8: the factor a₀ gives every ket, not the phase an eigenstate picks up (that is χ, on the "same point" line)
    st.push(nw('phase', `overall factor exp(−ia₀τ${perH}), −a₀τ${perH} = ${degText(act.phase)}`, 'text'))
    if (eigenstate) st.push({ key: 'eigen', text: 'ψ₀ is an eigenstate: only the phase changes', tone: 'silver' })
    if (relation !== null) {
      const deg = Math.round((relation * 180) / Math.PI)
      const rel = Math.abs(deg) === 180 ? '−ψ₀' : deg === 0 ? '+ψ₀' : `exp(iχ)·ψ₀, χ = ${degText(relation)}`
      st.push({ key: 'home', text: `same point as ψ₀ · ket = ${rel}`, tone: 'state' })
    }
    if (stats) {
      st.push({ key: 'mean', text: `⟨A⟩ = ${u(short2(stats.mean))} · ΔA = ${u(short2(stats.spread))}`, tone: 'text' })
      st.push({ key: 'pplus', text: axis ? `P(λ₊) = ${stats.pPlus.toFixed(3)}` : 'P(λ) = 1 (every state)', tone: 'text' })
    }
  }

  const view: OperatorView = {
    bench: 'operator',
    split: p.split,
    scale,
    a,
    outline: !hermitian && !pending,
    showArrow: !pending,
    axis: pending ? null : axis,
    gauge: pending ? { a0: null, plus: null, minus: null } : { a0, plus: hermitian ? eig.values[0].re : null, minus: hermitian ? eig.values[1].re : null },
    b: comm ? comm.b : null,
    cross: comm?.cross && !pending ? comm.cross : null,
    psi0: r0,
    bead: pending ? r0 : r,
    showBead: hermitian && !pending,
    orbit: pending ? null : orbit,
    arc: orbit && act && !pending ? arcPoints(orbit.axis, act.angle, r0) : [],
    focus: p.focus,
    draggable: { tip: !pending, psi0: true, bead: !!orbit && !pending },
  }

  /* ---------------- the handles' keyboard twins (items 2 and 6: nothing hidden leaks, nothing false is said) ---------------- */
  const hidden = 'hidden until you check'
  const twins: OperatorModel['twins'] = {
    tip: { value: `a = ${u(vec3(a))}${hermitian ? '' : ' (real part)'}`, disabled: pending, disabledText: hidden },
    psi0: { value: p.psi0.named ? `|${p.psi0.named}⟩` : `θ ${degText(p.psi0.theta)}, φ ${degText(p.psi0.phi)}`, disabled: false, disabledText: '' },
    bead: {
      // the turn angle is 2|a⃗|τ, i.e. the eigenvalue gap times τ: not while the results are hidden
      value: !pending && act ? `τ = ${tauText(p.tau)}, turn ${turnText(act.angle)}` : `τ = ${tauText(p.tau)}`,
      disabled: !view.draggable.bead,
      disabledText: pending ? hidden : !hermitian ? 'no turn: A is not Hermitian' : eigenstate ? 'ψ₀ is an eigenstate: only the phase changes' : '',
    },
  }
  return { M, shown, hermitian, d, a0, a, imag, len, axis, eig, cls, psi0, r0, act, psi, r, eigenstate, orbit, stats, relation, comm, scale, pending, unit, readouts: { op, state: st }, twins, view }
}

/* ------------------------------------------------------------------------------------------------ */
/* Drags and nudges → parameters                                                                     */
/* ------------------------------------------------------------------------------------------------ */

/** τ for a readout: a multiple of π/4 in π form ("π/2", "2π", "3π/4"), else 2 decimals. */
export function tauText(tau: number): string {
  const q = tau / (Math.PI / 4)
  const k = Math.round(q)
  if (Math.abs(q - k) > 1e-9) return short2(tau)
  if (k === 0) return '0'
  const g = k % 4 === 0 ? 4 : k % 2 === 0 ? 2 : 1
  const num = k / g
  const den = 4 / g
  return `${num === 1 ? '' : num}π${den === 1 ? '' : `/${den}`}`
}

/** The a⃗ tip dragged to p (drawn at `scale`): a⃗ = p/scale, capped at |a⃗| = A_MAX. */
export function aFromTip(p: Vec3, scale: number): Vec3 {
  const a = scale3(p, 1 / scale)
  const l = len3(a)
  return l > A_MAX ? scale3(a, A_MAX / l) : a
}

/** ψ₀ dragged to a point of the sphere: its Bloch angles, snapped onto a named ket within SNAP_RAD. */
export function psi0FromPoint(p: Vec3): Psi0 {
  const l = len3(p) || 1
  const n = scale3(p, 1 / l)
  for (const k of Object.keys(KET) as NamedKet[]) {
    const rk = blochVector(KET[k])
    if (Math.acos(Math.max(-1, Math.min(1, dot(rk, n)))) < SNAP_RAD) return psiNamed(k)
  }
  return { named: null, theta: Math.acos(Math.max(-1, Math.min(1, n[2]))), phi: Math.atan2(n[1], n[0]) }
}

const wrapPi = (x: number) => {
  const t = (x + Math.PI) % (2 * Math.PI)
  return (t < 0 ? t + 2 * Math.PI : t) - Math.PI
}

/**
 * The bead dragged to p (a point of the orbit's plane): the turn angle of p about â, measured from ψ₀ and unwrapped
 * against the current τ (so dragging on past a full lap keeps counting), then τ = angle / 2|a⃗|, kept in [0, TAU_MAX].
 */
export function tauFromBead(m: Pick<OperatorModel, 'orbit' | 'r0' | 'len' | 'act'>, p: Vec3, tauNow: number): number {
  if (!m.orbit || m.len < EPS) return tauNow
  const { center, axis } = m.orbit
  const u: Vec3 = [m.r0[0] - center[0], m.r0[1] - center[1], m.r0[2] - center[2]]
  const w: Vec3 = [p[0] - center[0], p[1] - center[1], p[2] - center[2]]
  const target = Math.atan2(dot(axis, cross(u, w)), dot(u, w))
  const now = 2 * m.len * tauNow
  let next = now + wrapPi(target - now)
  // a quarter turn within 3° snaps onto it, so a hand drag can land exactly on a lap (the Try this) or a quarter
  const q = Math.round(next / (Math.PI / 2)) * (Math.PI / 2)
  if (Math.abs(next - q) < BEAD_SNAP_RAD) next = q
  return Math.max(0, Math.min(TAU_MAX, next / (2 * m.len)))
}
/** The bead snaps onto whole quarter turns within this angle. */
export const BEAD_SNAP_RAD = (3 * Math.PI) / 180

/** Nudge steps of the DOM twins (coarse, fine). */
export const NUDGE = { tip: [0.05, 0.01], psi0Deg: [5, 1], beadDeg: [5, 1] } as const

/** Check a prediction of the two eigenvalues (typed like cells, any order) against the engine's, within 0.01. */
export function checkGuess(guess: readonly [string, string], eig: Eigen2): { parsed: (C | null)[]; ok: [boolean, boolean] } {
  const parsed = guess.map((g) => {
    const r = parse(g, { mode: 'complex', limits: LIMITS.answer })
    return r.ok ? evalComplex(r.ast) : null
  })
  const near = (z: C | null, w: C) => !!z && abs(c(z.re - w.re, z.im - w.im)) < 0.01
  const [l1, l2] = eig.values
  const straight = near(parsed[0], l1) && near(parsed[1], l2)
  const swapped = near(parsed[0], l2) && near(parsed[1], l1)
  if (straight || swapped) return { parsed, ok: [true, true] }
  return { parsed, ok: [near(parsed[0], l1) || near(parsed[0], l2), near(parsed[1], l1) || near(parsed[1], l2)] }
}

/* ------------------------------------------------------------------------------------------------ */
/* Deep-link setups (the preset allowlist, ruling 7)                                                 */
/* ------------------------------------------------------------------------------------------------ */

export interface Setup {
  /** A preset, or typed cells (z basis). */
  A: OpPresetId | { cells: Cells }
  psi0?: NamedKet
  tau?: number
  B?: OpPresetId
  /** Shown on the page (from where the link came). */
  note?: string
}
export const SETUPS = presetTable<Setup>({
  sx: { A: 'sx' },
  sy: { A: 'sy' },
  sz: { A: 'sz' },
  sn: { A: 'sn' },
  'proj-z': { A: 'proj-z' },
  hadamard: { A: 'hadamard' },
  identity: { A: 'identity' },
  'sz-lap': { A: 'sz', psi0: '+x', tau: 0, note: 'Try this: S_z from |+x⟩.' },
  'commute-xy': { A: 'sx', B: 'sy', psi0: '+z', note: 'Commutator mode: A = S_x, B = S_y.' },
  'non-hermitian': {
    A: {
      cells: [
        ['1', '2'],
        ['0', '-1'],
      ],
    },
    note: 'A typed non-Hermitian matrix: its eigenvalues are real, but a has an imaginary part, so no arrow is exact.',
  },
})

/** The Try-this prompt (D-lab §2.2), worded so it is true: for A = S_z the turn angle is τ, so one lap is τ = 2π. */
export const TRY_THIS =
  'Choose $S_z$, start at $|{+x}\\rangle$ and drag the bead once round, to $\\tau = 2\\pi$. It looks home: read the ket. Then go round again, to $\\tau = 4\\pi$.'
