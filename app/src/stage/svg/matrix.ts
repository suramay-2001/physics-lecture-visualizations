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
import { type AmpSource, type Dir, type MatrixBasis, type MatrixCoef, type MatrixGateSpec, type MatrixGridState, type MatrixSource, type MatrixState, type MatrixTableauState, type PairReadout, type PairSource, type PairTable, type Scrub, PAIR_READOUTS, isPairState } from '../../content/stage'
import { c, mul } from '../../physics/complex'
import { type Mat, type Vec, dagger, fromColumns, madd, matmul, mscale, outer as linalgOuter } from '../../physics/linalg'
import { eigh, isHermitian, kronM, svd as svdOf, traceN } from '../../physics/qc/cmat'
import { densityOf, mixtureN, partialTrace as enginePartialTrace, ptranspose as enginePtranspose, vonNeumann } from '../../physics/qc/density'
import { GATES_1P, GATES_1Q, cnot, cswap, cz, pauliEigenvalue, pauliMul, pauliString, swap, toffoli } from '../../physics/qc/gates'
import { classicalPair, correlatorC, covariancePM, marginals as tableMarginals, mean as weightedMean } from '../../physics/qc/info'
import { marginal } from '../../physics/qc/measure'
import { BELL_BASIS, bitsOfIndex, coefMatrix, embed, isProduct, kron, namedPair, nQubits, pairDet, paramCount, qubitMask, subsetOffsets, udFamily } from '../../physics/qc/state'
import { KET } from '../../physics/spin'
import { DEG, dirKet, scrub } from '../resolve'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedMatrix, ResolvedMatrixGrid, ResolvedMatrixPair, ResolvedMatrixPairStats, ResolvedMatrixReduced, ResolvedMatrixSpectrum, ResolvedMatrixTableau, ResolvedMatrixTableauRow } from '../types'
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
  if ('coef' in src) return coefMatrix(pairVec(src.coef, s), 1)
  if ('table' in src) return tableMatrix(src.table, s)
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

/** The negative-eigenvalue flag's KIND (P-Q9-story.md §9.2(b); qc709-Q8Q9 ruling 4), from the matrix source alone —
 *  not from whether an eigenvalue is actually negative, so it survives a lerp/pick unchanged: 'negative' for a
 *  `lin` difference of matrices; 'not a state' when the source claims to be a density matrix (a `rho` source, or
 *  any source once `ptranspose` has been applied — the Peres-test target, e.g. Q8's `q8-ball:b6`); null otherwise
 *  (an operator's own spectrum, e.g. a raw Pauli string, may be negative without claiming to be a state). */
function spectrumFlagKind(source: MatrixSource, ptransposed: boolean): ResolvedMatrixSpectrum['flag'] {
  if ('lin' in source) return 'negative'
  if ('rho' in source || ptransposed) return 'not a state'
  return null
}

/** Eigenvalue bars (qc/cmat.ts `eigh`, UNCLAMPED — a negative value after `ptranspose` is real, for the Peres test,
 *  and must be flagged, not hidden); 'entropy' adds S (qc/density.ts `vonNeumann`). With `partialTrace` also set,
 *  M is already the REDUCED matrix (the caller passes it in), so this shows the reduced spectrum, not the full ρ's
 *  (P-Q9-story.md §9.2(a); qc709-Q8Q9 ruling 4). Throws on a non-Hermitian M (caught by `validateMatrixStage`). */
export function resolveSpectrum(M: Mat, mode: NonNullable<MatrixGridState['spectrum']> | undefined, flag: ResolvedMatrixSpectrum['flag'] = null): ResolvedMatrixGrid['spectrum'] {
  if (!mode) return null
  const values = [...eigh(M).values].reverse()
  return { mode, values, entropy: mode === 'entropy' ? vonNeumann(M) : null, flag }
}

/* ------------------------------------------------ v3: the pair view (W-448 L9-A) ------------------------------------------------ */

/**
 * The two-spin vector a `coef` source names at hold progress s: Alice's direction ⊗ Bob's (`pair`), the ud-du family
 * (qc/state.ts `udFamily`, t in degrees), a named pair (`namedPair`), or any `amplitudes` source (a bell, a ket, a circuit's state).
 * Alice is the first letter and the first qubit: |ud⟩ = ket('01'), the row of the coefficient matrix.
 */
export function pairVec(src: PairSource, s: number): Vec {
  if ('pair' in src) return kron(dirKet(src.pair[0], s), dirKet(src.pair[1], s))
  if ('family' in src) return udFamily(scrub(src.tDeg, s) * DEG)
  if ('named' in src) return namedPair(src.named)
  return sourceAt(src, s).psi
}

/** The boxes of a `table` source as a matrix: one `1` per basis state of a frame table, or the classical chances P(a, b). */
function tableMatrix(t: PairTable, s: number): Mat {
  if ('frame' in t) {
    const cols = t.frame === 'photon-die' ? 6 : 2
    return Array.from({ length: 2 }, () => Array.from({ length: cols }, () => c(1)))
  }
  const table = t.classical === 'dealer' ? classicalPair('dealer') : classicalPair({ pA: scrub(t.pA, s), pB: scrub(t.pB, s) })
  return table.map((row) => row.map((x) => c(x)))
}

interface PairLayout {
  frame: 'spins' | 'photon-die' | 'chances'
  rowLabels: string[]
  colLabels: string[]
  /** Each box's basis name ('uu', 'H4'). */
  names: string[][]
  rowTitle: string
  colTitle: string
}
const SPIN_KETS = ['|u⟩', '|d⟩']
const nameGrid = (rows: string[], cols: string[]): string[][] => rows.map((r) => cols.map((cl) => `${r}${cl}`))

/** Row and column labels, box names and axis titles of a pair view, from its source alone. */
export function pairLayout(src: MatrixSource): PairLayout {
  if ('table' in src) {
    const t = src.table
    if ('classical' in t) return { frame: 'chances', rowLabels: ['+1', '−1'], colLabels: ['+1', '−1'], names: nameGrid(['+', '−'], ['+', '−']), rowTitle: 'σ_A', colTitle: 'σ_B' }
    if (t.frame === 'photon-die') {
      const faces = ['1', '2', '3', '4', '5', '6']
      return { frame: 'photon-die', rowLabels: ['|H⟩', '|V⟩'], colLabels: faces.map((f) => `|${f}⟩`), names: nameGrid(['H', 'V'], faces), rowTitle: 'photon', colTitle: 'die' }
    }
  }
  return { frame: 'spins', rowLabels: SPIN_KETS, colLabels: SPIN_KETS, names: nameGrid(['u', 'd'], ['u', 'd']), rowTitle: 'Alice', colTitle: 'Bob' }
}

const cellsOfVec = (xs: Vec) => xs.map((z) => ({ re: z.re, im: z.im }))

/** The statistics a pair view's readouts ask for, each by the engine (qc/state.ts, qc/measure.ts, qc/info.ts). Only the requested ones are computed. */
function pairStats(readouts: readonly PairReadout[], M: Mat, psi: Vec | null, classical: boolean): ResolvedMatrixPairStats {
  const rows = M.length
  const cols = M[0].length
  const stats: ResolvedMatrixPairStats = { dims: null, norm: null, params: null, marginals: null, means: null, det: null, product: null }
  const chances = M.map((row) => row.map((z) => z.re))
  for (const r of readouts) {
    switch (r) {
      case 'dims':
        stats.dims = { rows, cols, total: rows * cols }
        break
      case 'norm':
        stats.norm = classical ? chances.flat().reduce((a, b) => a + b, 0) : psi!.reduce((a, z) => a + z.re * z.re + z.im * z.im, 0)
        break
      case 'params':
        stats.params = paramCount(2)
        break
      case 'marginals':
        if (classical) {
          const m = tableMarginals(chances)
          stats.marginals = { rows: m.px, cols: m.py }
        } else stats.marginals = { rows: marginal(psi!, [0]), cols: marginal(psi!, [1]) }
        break
      case 'means': {
        const m = tableMarginals(chances)
        stats.means = { a: weightedMean([1, -1], m.px), b: weightedMean([1, -1], m.py), ab: correlatorC(chances), corr: covariancePM(chances) }
        break
      }
      case 'det': {
        const d = pairDet(psi!)
        stats.det = { re: d.re, im: d.im }
        break
      }
      case 'product':
        stats.product = isProduct(psi!, [0])
        break
    }
  }
  return stats
}

/** The default cell mode of a pair view: labels for a frame table, chances for a classical one, amplitudes for a state. */
function pairCellMode(st: MatrixGridState): NonNullable<MatrixGridState['cells']> {
  if (st.cells) return st.cells
  if ('table' in st.source) return 'frame' in st.source.table ? 'labels' : 'chances'
  return 'amplitudes'
}

function resolvePairGrid(st: MatrixGridState, s: number): ResolvedMatrixGrid {
  const M = matrixOf(st.source, s)
  const rows = M.length
  const cols = M[0].length
  const layout = pairLayout(st.source)
  const classical = 'table' in st.source && 'classical' in st.source.table
  const psi = 'coef' in st.source ? pairVec(st.source.coef, s) : null
  const labels = st.labels ?? 'ud'
  const hide = labels === 'none'
  const readouts = st.readouts ?? []
  const factors =
    st.factors && 'coef' in st.source && 'pair' in st.source.coef
      ? { a: cellsOfVec(dirKet(st.source.coef.pair[0], s)), b: cellsOfVec(dirKet(st.source.coef.pair[1], s)) }
      : null
  const pair: ResolvedMatrixPair = {
    cells: pairCellMode(st),
    classical,
    rowTitle: layout.rowTitle,
    colTitle: layout.colTitle,
    names: layout.names,
    factors,
    readouts: [...readouts],
    stats: pairStats(readouts, M, psi, classical),
  }
  return {
    kind: 'matrix',
    view: 'grid',
    n: rows,
    ...(cols !== rows ? { cols } : {}),
    pair,
    cells: toCells(M),
    labels,
    rowLabels: hide ? layout.rowLabels.map(() => '') : layout.rowLabels,
    colLabels: hide ? layout.colLabels.map(() => '') : layout.colLabels,
    values: st.values ?? 'exact',
    blocks: null,
    highlight: st.highlight ?? [],
    highlightRow: st.highlightRow ?? null,
    highlightCol: st.highlightCol ?? null,
    trace: null,
    partialTrace: null,
    svd: null,
    spectrum: null,
    ptranspose: null,
    shot: st.shot,
  }
}

/* ------------------------------------------------ resolve / interpolate: grid ------------------------------------------------ */

function resolveGrid(st: MatrixGridState, s: number): ResolvedMatrixGrid {
  if (isPairState(st)) return resolvePairGrid(st, s)
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
  const partialTrace = st.partialTrace ? resolvePartialTrace(M, st.partialTrace) : null
  // spectrum + partialTrace together (P-Q9-story.md §9.2(a); qc709-Q8Q9 ruling 4): the REDUCED matrix's spectrum,
  // not the full (pre-trace) M's.
  const spectrumSource = partialTrace ? toMat(partialTrace.cells) : M
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
    partialTrace,
    svd: st.svd ? resolveSvd(M) : null,
    spectrum: resolveSpectrum(spectrumSource, st.spectrum, spectrumFlagKind(st.source, !!pt)),
    ptranspose: pt ? { qubits: pt.qubits, moved: pt.moved } : null,
    shot: st.shot,
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pick = <T,>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

/** True when `eigh` would accept M (its own tolerance, held a little tighter so nothing accepted here can throw). */
function hermitianForEigh(M: Mat): boolean {
  const scale = Math.max(1, ...M.flatMap((row) => row.map((z) => Math.hypot(z.re, z.im))))
  return isHermitian(M, 0.5e-8 * scale)
}

/** A scrub (within a beat) or a transition (between beats) of the same size lerps every entry (the final grid, after
 *  `basis`/`ptranspose`); a structural change (a different matrix side) crossfades — the same rule as
 *  `circuit`/`amplitudes`. `ptranspose`'s moved cells and `basis`'s row/column names depend only on structure (not
 *  values), so they carry over unchanged; `trace`/`partialTrace`/`svd` are recomputed from the lerped grid.
 *  The spectrum is recomputed from the lerped grid only while that grid is Hermitian (a blend of two Hermitian
 *  matrices always is, and so is ρ^{T_B} of a state). A blend that touches a non-Hermitian endpoint (a gate such as S,
 *  or `adjoint` products) has no real spectrum, and `eigh` would throw; there the panel snaps with the nearer
 *  endpoint, showing that endpoint's own engine eigenvalues (or no panel, when that endpoint has none) — never a
 *  number computed from a matrix that has no eigenvalue bars. */
function interpGrid(a: ResolvedMatrixGrid, b: ResolvedMatrixGrid, t: number): ResolvedMatrixGrid {
  const d = pick(a, b, t)
  if (a.n !== b.n || (a.cols ?? a.n) !== (b.cols ?? b.n) || !a.pair !== !b.pair) return d
  const cells = a.cells.map((row, i) => row.map((z, j) => ({ re: lerp(z.re, b.cells[i][j].re, t), im: lerp(z.im, b.cells[i][j].im, t) })))
  if (a.pair && b.pair && d.pair) {
    // the boxes and the two factors blend; every statistic (norm, determinant, totals ...) snaps with the nearer endpoint, so none
    // is ever computed from a half-way blend of two normalized states
    const lerpZ = (xs: { re: number; im: number }[], ys: { re: number; im: number }[]) => xs.map((z, k) => ({ re: lerp(z.re, ys[k].re, t), im: lerp(z.im, ys[k].im, t) }))
    const factors = a.pair.factors && b.pair.factors ? { a: lerpZ(a.pair.factors.a, b.pair.factors.a), b: lerpZ(a.pair.factors.b, b.pair.factors.b) } : d.pair.factors
    return { ...d, cells, pair: { ...d.pair, factors } }
  }
  const M = toMat(cells)
  const partialTrace = d.partialTrace ? reducedMatrix(M, d.partialTrace.keep, d.partialTrace.which) : null
  const spectrumSource = partialTrace ? toMat(partialTrace.cells) : M
  return {
    ...d,
    cells,
    trace: d.trace ? resolveTrace(M) : null,
    partialTrace,
    svd: d.svd ? resolveSvd(M) : null,
    spectrum: d.spectrum && hermitianForEigh(spectrumSource) ? resolveSpectrum(spectrumSource, d.spectrum.mode, d.spectrum.flag) : d.spectrum,
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

const dirOk = (d: Dir, where: string): string[] => {
  if (typeof d === 'string') return d in KET ? [] : [`${where}: "${d}" is not a named ket (+z, -z, +x, -x, +y, -y)`]
  if (typeof d !== 'object' || d === null || !('thetaDeg' in d)) return [`${where}: not a direction`]
  return finiteScrub(d.thetaDeg) && finiteScrub(d.phiDeg) ? [] : [`${where}: non-finite angle`]
}

/** A v3 `coef` source: a pair of directions, the ud-du family, a named pair, or any `amplitudes` source. */
function pairSourceProblems(src: PairSource, where: string): string[] {
  if (!src || typeof src !== 'object') return [`${where}: not a state source`]
  if ('pair' in src) return !Array.isArray(src.pair) || src.pair.length !== 2 ? [`${where}.pair: two directions, Alice's then Bob's`] : src.pair.flatMap((d, i) => dirOk(d, `${where}.pair[${i}]`))
  if ('family' in src) return src.family === 'ud-du' && finiteScrub(src.tDeg) && src.tDeg !== undefined ? [] : [`${where}.family: 'ud-du' with a finite tDeg (degrees; a sweep too)`]
  if ('named' in src) return src.named === 'uniform' || src.named === 'flip' ? [] : [`${where}.named: 'uniform' or 'flip'`]
  return ketSourceProblems(src, where)
}

/** A v3 `table` source: a frame, or classical chances (the independent coins' chances must stay inside 0…1 along a sweep). */
function tableProblems(t: PairTable, where: string): string[] {
  if (!t || typeof t !== 'object') return [`${where}: a table ({frame} or {classical})`]
  if ('frame' in t) return t.frame === 'spins' || t.frame === 'photon-die' ? [] : [`${where}.frame: 'spins' or 'photon-die'`]
  if (!('classical' in t)) return [`${where}: a table ({frame} or {classical})`]
  if (t.classical === 'dealer') return []
  if (t.classical !== 'independent') return [`${where}.classical: 'dealer' or 'independent'`]
  const errs: string[] = []
  for (const [name, v] of [['pA', t.pA], ['pB', t.pB]] as const) {
    if (v === undefined || !finiteScrub(v)) errs.push(`${where}.${name}: a finite chance (a sweep too)`)
    else for (const s of [0, 0.5, 1]) if (scrub(v, s) < 0 || scrub(v, s) > 1) errs.push(`${where}.${name}: ${scrub(v, s)} at s=${s} is outside 0…1`)
  }
  return errs
}

function sourceProblems(src: MatrixSource, where: string): string[] {
  if (!src || typeof src !== 'object') return [`${where}: a source ({gate}, {outer}, {rho}, {kron}, {coef}, {pauli}, {product}, {adjoint}, {lin} or {table})`]
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
    const errs = pairSourceProblems(src.coef, `${where}.coef`)
    if (errs.length) return errs
    const n = nQubits(pairVec(src.coef, 0).length)
    if (n !== 2) errs.push(`${where}.coef: needs a two-qubit state (got ${n} qubits)`)
    return errs
  }
  if ('table' in src) return tableProblems(src.table, `${where}.table`)
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
  return [`${where}: exactly one of gate, outer, rho, kron, coef, pauli, product, adjoint, lin, table`]
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

/** The v3 pair view: its source, cell mode, labels, factors, readouts and highlights must fit together (and none of the operator
 *  features, which belong to a square operator, may be asked of it). */
function validatePairGrid(st: MatrixGridState): string[] {
  const errs: string[] = []
  const src = st.source
  const frame = 'table' in src && 'frame' in src.table
  const classical = 'table' in src && 'classical' in src.table
  const coef = 'coef' in src
  if (!frame && !classical && !coef) return ['matrix pair view: needs a coef or table source']
  const fixed: [string, boolean][] = [
    ['trace', !!st.trace],
    ['partialTrace', st.partialTrace !== undefined],
    ['svd', !!st.svd],
    ['basis', st.basis !== undefined],
    ['spectrum', st.spectrum !== undefined],
    ['ptranspose', st.ptranspose !== undefined],
    ['blocks', st.blocks !== undefined],
  ]
  for (const [name, on] of fixed) if (on) errs.push(`matrix ${name}: not in the pair view (a table of boxes, not an operator)`)
  const cells = pairCellMode(st)
  if (frame && cells !== 'labels') errs.push(`matrix cells: a frame table has only labels (got '${cells}')`)
  if (classical && cells !== 'chances') errs.push(`matrix cells: a classical table is chances (got '${cells}')`)
  if (st.labels !== undefined && st.labels !== 'ud' && st.labels !== 'none') errs.push(`matrix labels: a pair view takes 'ud' or 'none' (got '${st.labels}')`)
  if (st.factors && !(coef && 'pair' in (src as { coef: PairSource }).coef)) errs.push('matrix factors: only beside a coef source of {pair: [Alice, Bob]}')
  for (const r of st.readouts ?? []) {
    if (!(PAIR_READOUTS as readonly string[]).includes(r)) errs.push(`matrix readouts: unknown "${r}"`)
    else if ((r === 'det' || r === 'product' || r === 'params') && !coef) errs.push(`matrix readouts '${r}': needs a coef source (a state)`)
    else if (r === 'means' && !classical) errs.push("matrix readouts 'means': needs a classical table")
    else if ((r === 'norm' || r === 'marginals') && frame) errs.push(`matrix readouts '${r}': a frame table holds labels, not chances`)
  }
  if (errs.length) return errs
  const M = matrixOf(src, 0)
  const rows = M.length
  const cols = M[0].length
  for (const [i, j] of st.highlight ?? []) if (i < 0 || i >= rows || j < 0 || j >= cols) errs.push(`matrix highlight: (${i}, ${j}) is outside the ${rows}×${cols} table`)
  if (st.highlightRow !== undefined && (st.highlightRow < 0 || st.highlightRow >= rows)) errs.push(`matrix highlightRow: ${st.highlightRow} is outside 0–${rows - 1}`)
  if (st.highlightCol !== undefined && (st.highlightCol < 0 || st.highlightCol >= cols)) errs.push(`matrix highlightCol: ${st.highlightCol} is outside 0–${cols - 1}`)
  return errs
}

function validateGrid(st: MatrixGridState): string[] {
  const errs = sourceProblems(st.source, 'matrix source')
  if (errs.length) return errs
  if (isPairState(st)) return validatePairGrid(st)
  if (st.labels === 'ud') return ["matrix labels 'ud': needs a coef or table source (two spins)"]
  if (st.cells !== undefined || st.factors !== undefined || st.readouts !== undefined) return ['matrix cells / factors / readouts: need a coef or table source (the pair view)']
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
  if (st.svd && !('coef' in st.source)) errs.push('matrix svd: only beside a coef source (the Schmidt coefficients of a two-qubit state)')
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

const sgn = (x: number) => fix(x, 3)

/** The pair view's readout lines, each from the engine's statistics held on the resolved grid (never recomputed here). Short
 *  lines (the overlay's readout column is about 220 px wide), one fact each. */
function pairReadouts(r: ResolvedMatrixGrid): SvgReadout[] {
  const p = r.pair!
  const st = p.stats
  const out: SvgReadout[] = []
  for (const name of p.readouts) {
    if (name === 'dims' && st.dims) out.push({ name, text: `dim = ${st.dims.rows} × ${st.dims.cols} = ${st.dims.total}` })
    else if (name === 'norm' && st.norm !== null) out.push({ name, text: `chances add to ${sgn(st.norm)}` })
    else if (name === 'params' && st.params) out.push({ name, text: `parameters: product ${st.params.product}, pair ${st.params.general}` })
    else if (name === 'marginals' && st.marginals) {
      const [a, b] = p.classical ? ['+1', '−1'] : ['u', 'd']
      const who = p.classical ? ['coin A', 'coin B'] : ['Alice', 'Bob']
      out.push({ name: 'marginal-a', text: `${who[0]}: ${a} ${sgn(st.marginals.rows[0])}, ${b} ${sgn(st.marginals.rows[1])}` })
      out.push({ name: 'marginal-b', text: `${who[1]}: ${a} ${sgn(st.marginals.cols[0])}, ${b} ${sgn(st.marginals.cols[1])}` })
    } else if (name === 'means' && st.means) {
      out.push({ name: 'means', text: `⟨a⟩ = ${sgn(st.means.a)}, ⟨b⟩ = ${sgn(st.means.b)}` })
      out.push({ name: 'ab', text: `⟨ab⟩ = ${sgn(st.means.ab)}` })
      out.push({ name: 'correlation', text: `correlation = ${sgn(st.means.corr)}` })
    } else if (name === 'det' && st.det) out.push({ name, text: `ψuuψdd − ψudψdu = ${fmtC(st.det)}` })
    else if (name === 'product' && st.product !== null) out.push({ name, text: st.product ? 'product' : 'not a product', tone: st.product ? 'plus' : 'minus' })
  }
  if (r.highlight.length === 1 && p.cells !== 'labels') {
    const [i, j] = r.highlight[0]
    out.push({ name: 'cell', text: `${p.names[i][j]} = ${fmtC(r.cells[i][j])}` })
  }
  return out
}

function gridReadouts(r: ResolvedMatrixGrid): SvgReadout[] {
  if (r.pair) return pairReadouts(r)
  const out: SvgReadout[] = []
  if (r.trace) out.push({ name: 'trace', text: `Tr = ${fmtC(r.trace)}` })
  if (r.partialTrace) {
    const { which, keep, n, cells } = r.partialTrace
    const diag = cells.map((row, i) => fmtC(row[i]))
    const label = which === 'keep' ? `keep q${keep.join(', q')}` : which
    out.push({ name: 'partial-trace', text: `Tr_${label} → ${n}×${n}; diagonal ${diag.join(', ')}` })
  }
  if (r.svd) out.push({ name: 'svd', text: `Schmidt coefficients ${r.svd.map((x) => fix(x)).join(', ')}` })
  if (r.spectrum) {
    out.push({ name: 'spectrum', text: `eigenvalues ${r.spectrum.values.map((x) => fix(x, 3)).join(', ')}` })
    if (r.spectrum.flag && r.spectrum.values.some((x) => x < -1e-9)) out.push({ name: 'spectrum-flag', text: r.spectrum.flag })
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
