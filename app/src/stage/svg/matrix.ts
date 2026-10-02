/**
 * `matrix` (709; SVG): a labelled complex matrix — operators as ⟨i|A|j⟩, outer products |ψ⟩⟨φ|, a density matrix ρ
 * (pure or a mixture), A ⊗ B as a block matrix, a two-qubit state's 2×2 coefficient matrix and its Schmidt (SVD)
 * weights, Tr / Tr_B overlays, a chosen basis (B†AB), eigenvalue bars (+ von Neumann entropy), a partial transpose,
 * and — a second view of the same kind — a Pauli-string tableau. Content names the source only; every entry, trace,
 * reduced matrix, singular value, eigenvalue, basis change, transpose and Pauli product comes from the engine
 * (physics/qc/gates.ts, state.ts, cmat.ts, density.ts, linalg.ts). Kets reuse the `amplitudes` kind's own source
 * vocabulary (`AmpSource`, stage/svg/amplitudes.ts `sourceAt`), so a bell/dir/circuit ket means exactly what it
 * means there. Lazy chunk (stage/svg/kinds.ts).
 *
 * v2 (W-709 #15, docs/roles/decisions/qc709-Q6Q7.md rulings 4–5): `MatrixSource` gains `product`, `adjoint`, `lin`
 * (a fixed exact coefficient set) and multi-letter `pauli` strings; `MatrixGridState` gains `partialTrace: {keep}`,
 * `basis`, `spectrum` and `ptranspose`; `MatrixTableauState` is a new, separate view of the same kind.
 */
import type { AmpSource, MatrixBasis, MatrixCoef, MatrixGateSpec, MatrixGridState, MatrixSource, MatrixState, MatrixTableauState, Scrub } from '../../content/stage'
import { c, mul } from '../../physics/complex'
import { type Mat, dagger, fromColumns, madd, matmul, mscale, outer as linalgOuter } from '../../physics/linalg'
import { eigh, kronM, svd as svdOf, traceN } from '../../physics/qc/cmat'
import { densityOf, mixtureN, partialTrace as enginePartialTrace, ptranspose as enginePtranspose, vonNeumann } from '../../physics/qc/density'
import { GATES_1P, GATES_1Q, cnot, cswap, cz, pauliEigenvalue, pauliMul, pauliString, swap, toffoli } from '../../physics/qc/gates'
import { BELL_BASIS, bitsOfIndex, coefMatrix, embed, nQubits, qubitMask, subsetOffsets } from '../../physics/qc/state'
import { DEG, scrub } from '../resolve'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedMatrix, ResolvedMatrixGrid, ResolvedMatrixReduced, ResolvedMatrixTableau, ResolvedMatrixTableauRow } from '../types'
import { sourceAt, stageCircuitProblems } from './amplitudes'
import { fix, fmtC } from './draw'

/** The stage's caps: a side of 2–8 (1–3 qubits) so cells stay legible; per-cell numbers stop above 4×4 (16 cells). */
export const MATRIX_LIMITS = { maxN: 8, valuesMaxN: 4 } as const

const GATE_1Q_NAMES = new Set(['I', 'X', 'Y', 'Z', 'H', 'S', 'Sdg', 'T', 'Tdg'])
const GATE_1P_NAMES = new Set(['P', 'Rx', 'Ry', 'Rz'])

function baseGateMatrix(gate: MatrixGateSpec, s: number): Mat {
  const { name, params } = gate
  if (GATE_1Q_NAMES.has(name)) return GATES_1Q[name]
  if (GATE_1P_NAMES.has(name)) return GATES_1P[name as 'P' | 'Rx' | 'Ry' | 'Rz'](scrub(params?.[0] ?? 0, s) * DEG)
  switch (name) {
    case 'CNOT':
      return cnot()
    case 'CZ':
      return cz()
    case 'SWAP':
      return swap()
    case 'Toffoli':
      return toffoli()
    case 'Fredkin':
      return cswap()
    default:
      throw new Error(`matrix gate: unknown gate "${name}"`)
  }
}

function gateMatrix(src: Extract<MatrixSource, { gate: MatrixGateSpec }>, s: number): Mat {
  const base = baseGateMatrix(src.gate, s)
  if (src.qubits === undefined) return base
  const baseQ = nQubits(base.length)
  const targets = src.targets ?? Array.from({ length: baseQ }, (_, k) => k)
  return embed(base, src.qubits, targets, src.controls ?? [])
}

/** A `lin` coefficient's exact complex value (content/stage.ts `MATRIX_COEF_EXACT`, or cos/sin of a named angle). */
const COEF_EXACT: Record<string, { re: number; im: number }> = {
  '+1': { re: 1, im: 0 },
  '-1': { re: -1, im: 0 },
  '+1/2': { re: 0.5, im: 0 },
  '-1/2': { re: -0.5, im: 0 },
  '+i': { re: 0, im: 1 },
  '-i': { re: 0, im: -1 },
  '+1/sqrt2': { re: Math.SQRT1_2, im: 0 },
  '-1/sqrt2': { re: -Math.SQRT1_2, im: 0 },
}
export function coefValue(coef: MatrixCoef, s: number) {
  if (typeof coef === 'string') {
    const v = COEF_EXACT[coef]
    return c(v.re, v.im)
  }
  const theta = scrub(coef.angleDeg, s) * DEG
  return c(coef.trig === 'cos' ? Math.cos(theta) : Math.sin(theta), 0)
}

/** The resolved matrix of a source at hold progress s (recursive for `kron`/`product`/`adjoint`/`lin`): content's
 *  inputs, the engine's numbers. */
export function matrixOf(src: MatrixSource, s: number): Mat {
  if ('gate' in src) return gateMatrix(src, s)
  if ('outer' in src) {
    const [a, b] = src.outer
    const psiA = sourceAt(a, s).psi
    const psiB = b ? sourceAt(b, s).psi : psiA
    return linalgOuter(psiA, psiB)
  }
  if ('rho' in src) {
    if ('ket' in src.rho) return densityOf(sourceAt(src.rho.ket, s).psi)
    return mixtureN(src.rho.mixture.map((m) => ({ w: scrub(m.w, s), psi: sourceAt(m.ket, s).psi })))
  }
  if ('kron' in src) return kronM(matrixOf(src.kron[0], s), matrixOf(src.kron[1], s))
  if ('coef' in src) return coefMatrix(sourceAt(src.coef, s).psi, 1)
  if ('product' in src) return src.product.map((x) => matrixOf(x, s)).reduce((acc, M) => matmul(acc, M))
  if ('adjoint' in src) return dagger(matrixOf(src.adjoint, s))
  if ('lin' in src) return src.lin.map((term) => mscale(matrixOf(term.src, s), coefValue(term.c, s))).reduce((acc, M) => madd(acc, M))
  return pauliString(src.pauli)
}

/* ------------------------------------------------ labels, trace, partial trace, svd, basis, spectrum, ptranspose ------------------------------------------------ */

function ketLabels(n: number, style: NonNullable<MatrixGridState['labels']>, bra: boolean): string[] {
  if (style === 'none') return Array.from({ length: n }, () => '')
  if (style === 'indices') return Array.from({ length: n }, (_, k) => String(k))
  const q = Math.round(Math.log2(n))
  return Array.from({ length: n }, (_, k) => (bra ? `⟨${bitsOfIndex(k, q)}|` : `|${bitsOfIndex(k, q)}⟩`))
}

const toCells = (M: Mat): { re: number; im: number }[][] => M.map((row) => row.map((z) => ({ re: z.re, im: z.im })))
const toMat = (cells: { re: number; im: number }[][]): Mat => cells.map((row) => row.map((z) => c(z.re, z.im)))

function resolveTrace(M: Mat): { re: number; im: number } {
  const t = traceN(M)
  return { re: t.re, im: t.im }
}

/** A ket's short display name, for a custom `basis` row/column label: the content it was asked for, not a computed
 *  one. `bell` is matched against the four standard names when it is one of them. */
function ketSourceLabel(src: AmpSource, s: number): string {
  if ('ket' in src) return src.ket
  if ('bell' in src) {
    const known = BELL_BASIS.find((b) => b.content === src.bell || b.name === src.bell)
    return known ? known.name : src.bell
  }
  if ('dir' in src) {
    if (typeof src.dir === 'string') return src.dir
    const theta = scrub(src.dir.thetaDeg, s)
    const phi = scrub(src.dir.phiDeg, s)
    return `θ${fix(theta, 0)}°,φ${fix(phi, 0)}°`
  }
  return 'ψ'
}

/** The kets of a basis (content/stage.ts `MatrixBasis`), in order: the standard Bell basis, or a custom list. */
function basisKetsOf(basis: MatrixBasis, s: number): { name: string; ket: ReturnType<typeof sourceAt>['psi'] }[] {
  if (basis === 'bell') return BELL_BASIS.map((b) => ({ name: b.name, ket: b.ket }))
  return basis.map((k) => ({ name: ketSourceLabel(k, s), ket: sourceAt(k, s).psi }))
}

/** View M in another basis, B†MB (content/stage.ts `MatrixGridState.basis`): the transformed grid and the basis's
 *  own ket names (for the row/column labels), or null when no basis is set. */
export function applyBasis(M: Mat, basis: MatrixBasis | undefined, s: number): { M: Mat; names: string[] } | null {
  if (!basis) return null
  const kets = basisKetsOf(basis, s)
  const B = fromColumns(kets.map((k) => k.ket))
  return { M: matmul(matmul(dagger(B), M), B), names: kets.map((k) => k.name) }
}

/** The ascending qubit list a partial-trace spec keeps: 'A' keeps the second half, 'B' keeps the first half (v1's
 *  convention — "'B'" names the traced-out half, the common Tr_B case), `{keep}` keeps exactly those qubits. */
function keepQubitsOf(spec: NonNullable<MatrixGridState['partialTrace']>, nq: number): number[] {
  if (spec === 'A' || spec === 'B') {
    const half = Math.floor(nq / 2)
    const A = Array.from({ length: half }, (_, k) => k)
    const B = Array.from({ length: nq - half }, (_, k) => half + k)
    return spec === 'A' ? B : A
  }
  return [...spec.keep].sort((a, b) => a - b)
}

/** The reduced matrix and its exact arrows (every original diagonal cell that feeds a reduced diagonal cell, from
 *  the SAME index math `physics/qc/density.ts partialTrace` itself uses — exact for any `keep` subset, so 'A' is no
 *  longer the schematic v1 case). */
function reducedMatrix(M: Mat, keep: readonly number[], which: ResolvedMatrixReduced['which']): ResolvedMatrixReduced {
  const nq = nQubits(M.length)
  const traceOut = Array.from({ length: nq }, (_, k) => k).filter((q) => !keep.includes(q))
  const offK = subsetOffsets(keep, nq)
  const offT = subsetOffsets(traceOut, nq)
  const reduced = enginePartialTrace(M, traceOut)
  const arrows = offK.flatMap((ka, a) => offT.map((t) => ({ from: ka | t, to: a })))
  return { which, keep: [...keep], n: reduced.length, cells: toCells(reduced), arrows }
}

/**
 * The reduced matrix (qc/density.ts `partialTrace`): 'A' traces out the register's first half (keeping B); 'B'
 * traces out the second half (keeping A); `{keep}` (v2) keeps exactly the listed qubits, tracing out every other
 * one (the engine already takes any qubit set — e.g. Tr₃ of a GHZ state). Null when the register is fewer than two
 * qubits, or `keep` is not a proper non-empty subset.
 */
export function resolvePartialTrace(M: Mat, spec: NonNullable<MatrixGridState['partialTrace']>): ResolvedMatrixReduced | null {
  const nq = nQubits(M.length)
  if (nq < 2) return null
  const keep = keepQubitsOf(spec, nq)
  if (!keep.length || keep.length >= nq) return null
  const which = spec === 'A' || spec === 'B' ? spec : 'keep'
  return reducedMatrix(M, keep, which)
}

function resolveSvd(M: Mat): number[] {
  return svdOf(M).s
}

/** The qubits a `ptranspose: 'B'` acts on: the register's second half (v1's "'B'" convention, the common ρ^{T_B}). */
function ptransposeQubits(nq: number): number[] {
  const half = Math.floor(nq / 2)
  return Array.from({ length: nq - half }, (_, k) => half + k)
}

/** ρ^{T_B} (qc/density.ts `ptranspose`) and the cells it moves: (i, j) moves exactly when its row and column carry
 *  different bits on the transposed qubits — the same test the engine's index arithmetic makes, so "moved" needs no
 *  separate tolerance or cross-check. */
export function applyPtranspose(M: Mat, spec: MatrixGridState['ptranspose']): { M: Mat; qubits: number[]; moved: [number, number][] } | null {
  if (!spec) return null
  const n = M.length
  const nq = nQubits(n)
  const qubits = ptransposeQubits(nq)
  const mask = qubits.reduce((acc, q) => acc | qubitMask(q, nq), 0)
  const moved: [number, number][] = []
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i & mask) !== (j & mask)) moved.push([i, j])
  return { M: enginePtranspose(M, qubits), qubits, moved }
}

/** Eigenvalue bars (qc/cmat.ts `eigh`, UNCLAMPED — a negative value after `ptranspose` is real, for the Peres test,
 *  and must be flagged, not hidden); 'entropy' adds S (qc/density.ts `vonNeumann`). Throws on a non-Hermitian M
 *  (caught by `validateMatrixStage`). */
export function resolveSpectrum(M: Mat, mode: NonNullable<MatrixGridState['spectrum']> | undefined): ResolvedMatrixGrid['spectrum'] {
  if (!mode) return null
  const values = [...eigh(M).values].reverse()
  return { mode, values, entropy: mode === 'entropy' ? vonNeumann(M) : null }
}

/* ------------------------------------------------ resolve / interpolate: grid ------------------------------------------------ */

function resolveGrid(st: MatrixGridState, s: number): ResolvedMatrixGrid {
  let M = matrixOf(st.source, s)
  const n = M.length
  const labels = st.labels ?? 'kets'
  let rowLabels = ketLabels(n, labels, true)
  let colLabels = ketLabels(n, labels, false)
  const basis = applyBasis(M, st.basis, s)
  if (basis) {
    M = basis.M
    if (labels !== 'none') {
      rowLabels = basis.names.map((nm) => `⟨${nm}|`)
      colLabels = basis.names.map((nm) => `|${nm}⟩`)
    }
  }
  const pt = applyPtranspose(M, st.ptranspose)
  if (pt) M = pt.M
  return {
    kind: 'matrix',
    view: 'grid',
    n,
    cells: toCells(M),
    labels,
    rowLabels,
    colLabels,
    values: st.values ?? 'decimal',
    blocks: st.blocks ?? null,
    highlight: st.highlight ?? [],
    highlightRow: st.highlightRow ?? null,
    highlightCol: st.highlightCol ?? null,
    trace: st.trace ? resolveTrace(M) : null,
    partialTrace: st.partialTrace ? resolvePartialTrace(M, st.partialTrace) : null,
    svd: st.svd ? resolveSvd(M) : null,
    spectrum: resolveSpectrum(M, st.spectrum),
    ptranspose: pt ? { qubits: pt.qubits, moved: pt.moved } : null,
    shot: st.shot,
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pick = <T,>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

/** A scrub (within a beat) or a transition (between beats) of the same size lerps every entry (the final grid, after
 *  `basis`/`ptranspose`); a structural change (a different matrix side) crossfades — the same rule as
 *  `circuit`/`amplitudes`. `ptranspose`'s moved cells and `basis`'s row/column names depend only on structure (not
 *  values), so they carry over unchanged; `trace`/`partialTrace`/`svd`/`spectrum` are recomputed from the lerped grid. */
function interpGrid(a: ResolvedMatrixGrid, b: ResolvedMatrixGrid, t: number): ResolvedMatrixGrid {
  const d = pick(a, b, t)
  if (a.n !== b.n) return d
  const cells = a.cells.map((row, i) => row.map((z, j) => ({ re: lerp(z.re, b.cells[i][j].re, t), im: lerp(z.im, b.cells[i][j].im, t) })))
  const M = toMat(cells)
  return {
    ...d,
    cells,
    trace: d.trace ? resolveTrace(M) : null,
    partialTrace: d.partialTrace ? reducedMatrix(M, d.partialTrace.keep, d.partialTrace.which) : null,
    svd: d.svd ? resolveSvd(M) : null,
    spectrum: d.spectrum ? resolveSpectrum(M, d.spectrum.mode) : null,
  }
}

/* ------------------------------------------------ resolve / interpolate: tableau ------------------------------------------------ */

function resolveTableau(st: MatrixTableauState, s: number): ResolvedMatrixTableau {
  const qubits = st.tableau[0]?.length ?? 0
  const psi = st.state ? sourceAt(st.state, s).psi : null
  const rows: ResolvedMatrixTableauRow[] = st.tableau.map((p) => {
    const card = st.values?.[p] ?? null
    const eigen = psi ? pauliEigenvalue(psi, p) : null
    return { pauli: p, letters: [...p], card, eigen, matches: card !== null && eigen !== null ? card === eigen : null }
  })
  let product: ResolvedMatrixTableau['product'] = null
  if (st.product && st.tableau.length) {
    let acc = { string: st.tableau[0], phase: c(1) }
    for (let k = 1; k < st.tableau.length; k++) {
      const m = pauliMul(acc.string, st.tableau[k])
      acc = { string: m.string, phase: mul(acc.phase, m.phase) }
    }
    product = { pauli: acc.string, phase: { re: acc.phase.re, im: acc.phase.im } }
  }
  return { kind: 'matrix', view: 'tableau', qubits, rows, product, shot: st.shot }
}

/* ------------------------------------------------ resolve / interpolate: dispatch ------------------------------------------------ */

/** Overloaded so a caller holding a concrete `MatrixGridState`/`MatrixTableauState` (e.g. a test building one with
 *  `mat(...)`) gets the matching concrete resolved type back, with no cast. */
export function resolveMatrixStage(st: MatrixGridState, s: number): ResolvedMatrixGrid
export function resolveMatrixStage(st: MatrixTableauState, s: number): ResolvedMatrixTableau
export function resolveMatrixStage(st: MatrixState, s: number): ResolvedMatrix
export function resolveMatrixStage(st: MatrixState, s: number): ResolvedMatrix {
  return 'tableau' in st ? resolveTableau(st, s) : resolveGrid(st, s)
}

/** The per-row ±1 cards and eigenvalues are discrete (no meaningful midpoint), so a tableau-to-tableau transition
 *  is a hard switch at t < 0.5 ? a : b — the same rule other discrete states (a different circuit) use. */
export function interpMatrixStage(a: ResolvedMatrix, b: ResolvedMatrix, t: number): ResolvedMatrix {
  if (t <= 0) return a
  if (t >= 1) return b
  if (a.view !== b.view) return pick(a, b, t)
  if (a.view === 'tableau') return pick(a, b as ResolvedMatrixTableau, t)
  return interpGrid(a, b as ResolvedMatrixGrid, t)
}

/* ------------------------------------------------ validation ------------------------------------------------ */

const finiteScrub = (v: Scrub | undefined): boolean => v === undefined || (typeof v === 'number' ? Number.isFinite(v) : Number.isFinite(v.from) && Number.isFinite(v.to))

function ketSourceProblems(src: AmpSource, where: string): string[] {
  if ('circuit' in src) return stageCircuitProblems(src.circuit, src.upTo, src.outcomes, where)
  try {
    sourceAt(src, 0)
    return []
  } catch (e) {
    return [`${where}: ${e instanceof Error ? e.message : 'not a valid state source'}`]
  }
}

function coefProblems(coef: MatrixCoef, where: string): string[] {
  if (typeof coef === 'string') return coef in COEF_EXACT ? [] : [`${where}: must be a fixed exact value (±1, ±1/2, ±i, ±1/sqrt2) or {trig, angleDeg}`]
  if (coef.trig !== 'cos' && coef.trig !== 'sin') return [`${where}.trig: 'cos' or 'sin'`]
  if (!finiteScrub(coef.angleDeg)) return [`${where}.angleDeg: a finite angle (degrees; a sweep too)`]
  return []
}

function sourceProblems(src: MatrixSource, where: string): string[] {
  if (!src || typeof src !== 'object') return [`${where}: a source ({gate}, {outer}, {rho}, {kron}, {coef}, {pauli}, {product}, {adjoint} or {lin})`]
  if ('gate' in src) {
    const errs: string[] = []
    if (!GATE_1Q_NAMES.has(src.gate.name) && !GATE_1P_NAMES.has(src.gate.name) && !['CNOT', 'CZ', 'SWAP', 'Toffoli', 'Fredkin'].includes(src.gate.name))
      errs.push(`${where}.gate: unknown gate "${src.gate.name}"`)
    if (src.gate.params && !src.gate.params.every(finiteScrub)) errs.push(`${where}.gate: non-finite parameter`)
    if (src.qubits !== undefined && (!Number.isInteger(src.qubits) || src.qubits < 1 || src.qubits > 3)) errs.push(`${where}: qubits must be a whole number 1–3`)
    return errs
  }
  if ('outer' in src) {
    const [a, b] = src.outer
    return [...ketSourceProblems(a, `${where}.outer[0]`), ...(b ? ketSourceProblems(b, `${where}.outer[1]`) : [])]
  }
  if ('rho' in src) {
    if ('ket' in src.rho) return ketSourceProblems(src.rho.ket, `${where}.rho.ket`)
    const parts = src.rho.mixture
    const errs: string[] = []
    if (!parts.length) errs.push(`${where}.rho.mixture: empty`)
    parts.forEach((p, i) => errs.push(...ketSourceProblems(p.ket, `${where}.rho.mixture[${i}].ket`)))
    if (!errs.length)
      for (const s of [0, 0.5, 1]) {
        const sum = parts.reduce((acc, p) => acc + scrub(p.w, s), 0)
        if (Math.abs(sum - 1) > 1e-9) {
          errs.push(`${where}.rho.mixture: weights sum to ${sum} at s=${s}, not 1`)
          break
        }
      }
    return errs
  }
  if ('kron' in src) return [...sourceProblems(src.kron[0], `${where}.kron[0]`), ...sourceProblems(src.kron[1], `${where}.kron[1]`)]
  if ('coef' in src) {
    const errs = ketSourceProblems(src.coef, `${where}.coef`)
    if (errs.length) return errs
    const n = nQubits(sourceAt(src.coef, 0).psi.length)
    if (n !== 2) errs.push(`${where}.coef: needs a two-qubit state (got ${n} qubits)`)
    return errs
  }
  if ('pauli' in src) return typeof src.pauli === 'string' && /^[IXYZ]{1,3}$/.test(src.pauli) ? [] : [`${where}.pauli: 1–3 letters of I, X, Y, Z`]
  if ('product' in src) {
    if (!src.product.length) return [`${where}.product: at least one source`]
    const errs = src.product.flatMap((x, i) => sourceProblems(x, `${where}.product[${i}]`))
    if (errs.length) return errs
    let sides: number[]
    try {
      sides = src.product.map((x) => matrixOf(x, 0).length)
    } catch (e) {
      return [`${where}.product: ${e instanceof Error ? e.message : 'could not be resolved'}`]
    }
    return sides.every((x) => x === sides[0]) ? [] : [`${where}.product: every factor must have the same side (got ${sides.join(', ')})`]
  }
  if ('adjoint' in src) return sourceProblems(src.adjoint, `${where}.adjoint`)
  if ('lin' in src) {
    if (!src.lin.length) return [`${where}.lin: at least one term`]
    const errs = src.lin.flatMap((term, i) => [...coefProblems(term.c, `${where}.lin[${i}].c`), ...sourceProblems(term.src, `${where}.lin[${i}].src`)])
    if (errs.length) return errs
    let sides: number[]
    try {
      sides = src.lin.map((term) => matrixOf(term.src, 0).length)
    } catch (e) {
      return [`${where}.lin: ${e instanceof Error ? e.message : 'could not be resolved'}`]
    }
    return sides.every((x) => x === sides[0]) ? [] : [`${where}.lin: every term must have the same side (got ${sides.join(', ')})`]
  }
  return [`${where}: exactly one of gate, outer, rho, kron, coef, pauli, product, adjoint, lin`]
}

function basisProblems(basis: MatrixBasis, n: number): string[] {
  if (basis === 'bell') return n === 4 ? [] : [`matrix basis 'bell': needs a side of 4 (two qubits), got ${n}`]
  if (!basis.length) return ['matrix basis: at least one ket']
  if (basis.length !== n) return [`matrix basis: ${basis.length} kets, but the matrix side is ${n}`]
  const errs = basis.flatMap((k, i) => ketSourceProblems(k, `matrix basis[${i}]`))
  if (errs.length) return errs
  const dims = basis.map((k) => sourceAt(k, 0).psi.length)
  return dims.every((d) => d === n) ? [] : [`matrix basis: every ket must have dimension ${n} (got ${dims.join(', ')})`]
}

function partialTraceProblems(spec: NonNullable<MatrixGridState['partialTrace']>, n: number): string[] {
  const nq = nQubits(n)
  if (spec === 'A' || spec === 'B') return nq >= 2 ? [] : ['matrix partialTrace: needs at least two qubits (a side of 4 or more)']
  const keep = spec.keep
  if (!Array.isArray(keep) || !keep.length) return ['matrix partialTrace: keep must list at least one qubit']
  if (new Set(keep).size !== keep.length) return ['matrix partialTrace: keep lists a qubit twice']
  if (keep.some((q) => !Number.isInteger(q) || q < 0 || q >= nq)) return [`matrix partialTrace: keep must list qubits 0–${nq - 1}`]
  if (keep.length >= nq) return ['matrix partialTrace: keep must leave at least one qubit traced out']
  return []
}

function validateGrid(st: MatrixGridState): string[] {
  const errs = sourceProblems(st.source, 'matrix source')
  if (errs.length) return errs
  let M: Mat
  try {
    M = matrixOf(st.source, 0)
  } catch (e) {
    return [`matrix source: ${e instanceof Error ? e.message : 'could not be resolved'}`]
  }
  const n = M.length
  const log2n = Math.log2(n)
  if (!Number.isInteger(log2n) || n < 2 || n > MATRIX_LIMITS.maxN) errs.push(`matrix: side ${n} must be a power of two from 2 to ${MATRIX_LIMITS.maxN} (1–3 qubits)`)
  if (M.some((row) => row.length !== n)) errs.push('matrix: not square')
  if (errs.length) return errs
  if (st.blocks !== undefined && n % st.blocks !== 0) errs.push(`matrix blocks: ${st.blocks} does not divide the side ${n}`)
  for (const [i, j] of st.highlight ?? [])
    if (i < 0 || i >= n || j < 0 || j >= n) errs.push(`matrix highlight: (${i}, ${j}) is outside the ${n}×${n} grid`)
  if (st.highlightRow !== undefined && (st.highlightRow < 0 || st.highlightRow >= n)) errs.push(`matrix highlightRow: ${st.highlightRow} is outside 0–${n - 1}`)
  if (st.highlightCol !== undefined && (st.highlightCol < 0 || st.highlightCol >= n)) errs.push(`matrix highlightCol: ${st.highlightCol} is outside 0–${n - 1}`)
  if (st.basis !== undefined) errs.push(...basisProblems(st.basis, n))
  if (st.partialTrace !== undefined) errs.push(...partialTraceProblems(st.partialTrace, n))
  if (st.svd && !('coef' in st.source)) errs.push('matrix svd: only beside a coef source (the Schmidt weights of a two-qubit state)')
  if (st.ptranspose !== undefined && nQubits(n) < 2) errs.push('matrix ptranspose: needs at least two qubits (a side of 4 or more)')
  if (errs.length) return errs
  if (st.spectrum !== undefined) {
    let M2 = M
    const basis = st.basis !== undefined ? applyBasis(M2, st.basis, 0) : null
    if (basis) M2 = basis.M
    const pt = applyPtranspose(M2, st.ptranspose)
    if (pt) M2 = pt.M
    try {
      eigh(M2)
    } catch (e) {
      errs.push(`matrix spectrum: ${e instanceof Error ? e.message : 'the matrix is not Hermitian'}`)
    }
  }
  return errs
}

function validateTableau(st: MatrixTableauState): string[] {
  if (!Array.isArray(st.tableau) || !st.tableau.length) return ['matrix tableau: at least one Pauli string']
  const qubits = st.tableau[0].length
  if (!Number.isInteger(qubits) || qubits < 1 || qubits > 3) return [`matrix tableau: each row must be 1–3 letters (I, X, Y, Z)`]
  const errs: string[] = []
  st.tableau.forEach((p, i) => {
    if (typeof p !== 'string' || p.length !== qubits || !/^[IXYZ]+$/.test(p)) errs.push(`matrix tableau[${i}]: "${p}" must be ${qubits} letters of I, X, Y, Z`)
  })
  if (errs.length) return errs
  if (st.values) {
    const known = new Set(st.tableau)
    for (const key of Object.keys(st.values)) if (!known.has(key)) errs.push(`matrix tableau values: "${key}" is not one of the tableau's own rows`)
  }
  if (st.state) errs.push(...ketSourceProblems(st.state, 'matrix tableau state'))
  if (errs.length) return errs
  if (st.state) {
    const n = nQubits(sourceAt(st.state, 0).psi.length)
    if (n !== qubits) errs.push(`matrix tableau state: needs ${qubits} qubits (got ${n})`)
  }
  return errs
}

export function validateMatrixStage(st: MatrixState): string[] {
  return 'tableau' in st ? validateTableau(st) : validateGrid(st)
}

/* ------------------------------------------------ exact values ------------------------------------------------ */

const EXACT_MAGS: readonly [number, string][] = [
  [0, '0'],
  [0.5, '1/2'],
  [Math.SQRT1_2, '1/√2'],
  [1, '1'],
]
function exactMag(x: number): string | null {
  for (const [mag, label] of EXACT_MAGS) if (Math.abs(Math.abs(x) - mag) < 1e-9) return label === '0' ? '0' : x < 0 ? `−${label}` : label
  return null
}
/** A cell's label from a small fixed table of known exact values (0, ±½, ±1/√2, ±1 on each part), or null. */
export function exactLabel(z: { re: number; im: number }): string | null {
  const re = exactMag(z.re)
  const im = exactMag(z.im)
  if (re === null || im === null) return null
  if (z.im === 0) return re
  const imagAbs = im.replace('−', '')
  const imagPart = imagAbs === '1' ? 'i' : `${imagAbs}i`
  if (z.re === 0) return z.im < 0 ? `−${imagPart}` : imagPart
  return `${re} ${z.im < 0 ? '−' : '+'} ${imagPart}`
}

/** A cell's display text in `values` mode ('exact' falls back to a decimal when the entry is not in the fixed table). */
export function cellLabel(z: { re: number; im: number }, values: NonNullable<MatrixGridState['values']>): string | null {
  if (values === 'none') return null
  if (values === 'exact') return exactLabel(z) ?? fmtC(z, 2)
  return fmtC(z, 2)
}

/* ------------------------------------------------ readouts ------------------------------------------------ */

function gridReadouts(r: ResolvedMatrixGrid): SvgReadout[] {
  const out: SvgReadout[] = []
  if (r.trace) out.push({ name: 'trace', text: `Tr = ${fmtC(r.trace)}` })
  if (r.partialTrace) {
    const { which, keep, n, cells } = r.partialTrace
    const diag = cells.map((row, i) => fmtC(row[i]))
    const label = which === 'keep' ? `keep q${keep.join(', q')}` : which
    out.push({ name: 'partial-trace', text: `Tr_${label} → ${n}×${n}; diagonal ${diag.join(', ')}` })
  }
  if (r.svd) out.push({ name: 'svd', text: `Schmidt weights ${r.svd.map((x) => fix(x)).join(', ')}` })
  if (r.spectrum) {
    out.push({ name: 'spectrum', text: `eigenvalues ${r.spectrum.values.map((x) => fix(x, 3)).join(', ')}` })
    if (r.spectrum.entropy !== null) out.push({ name: 'entropy', text: `S = ${fix(r.spectrum.entropy, 3)} bits` })
  }
  if (r.ptranspose) out.push({ name: 'ptranspose', text: `partial transpose: ${r.ptranspose.moved.length} of ${r.n * r.n} cells moved` })
  if (r.highlight.length === 1) {
    const [i, j] = r.highlight[0]
    out.push({ name: 'cell', text: `(${i}, ${j}) = ${fmtC(r.cells[i][j])}` })
  }
  if (r.highlightRow !== null) out.push({ name: 'row', text: `row ${r.highlightRow}: ${r.cells[r.highlightRow].map((z) => fmtC(z)).join(', ')}` })
  if (r.highlightCol !== null) out.push({ name: 'col', text: `column ${r.highlightCol}: ${r.cells.map((row) => row[r.highlightCol!]).map((z) => fmtC(z)).join(', ')}` })
  return out
}

function tableauReadouts(r: ResolvedMatrixTableau): SvgReadout[] {
  const out: SvgReadout[] = []
  if (r.product) out.push({ name: 'product', text: `product = ${r.product.pauli} (phase ${fmtC(r.product.phase)})` })
  const withEigen = r.rows.filter((row) => row.eigen !== null)
  if (withEigen.length) out.push({ name: 'eigen', text: withEigen.map((row) => `${row.pauli}: ${row.eigen === 1 ? '+1' : '−1'}`).join(', ') })
  const checked = r.rows.filter((row) => row.matches !== null)
  if (checked.length) {
    const mismatches = checked.filter((row) => row.matches === false)
    out.push({ name: 'card', text: mismatches.length === 0 ? `the card matches every row's eigenvalue` : `${mismatches.length} of ${checked.length} row(s) do not match the card` })
  }
  return out
}

export function matrixReadouts(r: ResolvedMatrix): SvgReadout[] {
  return r.view === 'tableau' ? tableauReadouts(r) : gridReadouts(r)
}
