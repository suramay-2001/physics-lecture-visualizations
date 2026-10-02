/**
 * `matrix` (709; SVG): a labelled complex matrix — operators as ⟨i|A|j⟩, outer products |ψ⟩⟨φ|, a density matrix ρ
 * (pure or a mixture), A ⊗ B as a block matrix, a two-qubit state's 2×2 coefficient matrix and its Schmidt (SVD)
 * weights, and Tr / Tr_B overlays. Content names the source only; every entry, trace, reduced matrix and singular
 * value comes from the engine (physics/qc/gates.ts, state.ts, cmat.ts, density.ts). Kets reuse the `amplitudes`
 * kind's own source vocabulary (`AmpSource`, stage/svg/amplitudes.ts `sourceAt`), so a bell/dir/circuit ket means
 * exactly what it means there. Lazy chunk (stage/svg/kinds.ts).
 */
import type { MatrixGateSpec, MatrixSource, MatrixState, Scrub } from '../../content/stage'
import type { AmpSource } from '../../content/stage'
import { c } from '../../physics/complex'
import { type Mat, identity, outer as linalgOuter } from '../../physics/linalg'
import { kronM, svd as svdOf, traceN } from '../../physics/qc/cmat'
import { densityOf, mixtureN, partialTrace as enginePartialTrace } from '../../physics/qc/density'
import { GATES_1P, GATES_1Q, cnot, cswap, cz, swap, toffoli } from '../../physics/qc/gates'
import { bitsOfIndex, coefMatrix, embed, nQubits } from '../../physics/qc/state'
import { SIGMA_X, SIGMA_Y, SIGMA_Z } from '../../physics/spin'
import { DEG, scrub } from '../resolve'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedMatrix, ResolvedMatrixReduced } from '../types'
import { sourceAt, stageCircuitProblems } from './amplitudes'
import { fix, fmtC } from './draw'

/** The stage's caps: a side of 2–8 (1–3 qubits) so cells stay legible; per-cell numbers stop above 4×4 (16 cells). */
export const MATRIX_LIMITS = { maxN: 8, valuesMaxN: 4 } as const

const GATE_1Q_NAMES = new Set(['I', 'X', 'Y', 'Z', 'H', 'S', 'Sdg', 'T', 'Tdg'])
const GATE_1P_NAMES = new Set(['P', 'Rx', 'Ry', 'Rz'])
const PAULI_MATS: Record<'I' | 'X' | 'Y' | 'Z', Mat> = { I: identity(2), X: SIGMA_X, Y: SIGMA_Y, Z: SIGMA_Z }

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

/** The resolved matrix of a source at hold progress s (recursive for `kron`): content's inputs, the engine's numbers. */
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
  return PAULI_MATS[src.pauli]
}

/* ------------------------------------------------ labels, trace, partial trace, svd ------------------------------------------------ */

function ketLabels(n: number, style: NonNullable<MatrixState['labels']>, bra: boolean): string[] {
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

/**
 * The reduced matrix (qc/density.ts `partialTrace`): 'A' traces out the first half of the register (keeping B);
 * 'B' traces out the second half (keeping A). Null when the register is fewer than two qubits.
 */
export function resolvePartialTrace(M: Mat, which: 'A' | 'B'): ResolvedMatrixReduced | null {
  const nq = nQubits(M.length)
  if (nq < 2) return null
  const half = Math.floor(nq / 2)
  const A = Array.from({ length: half }, (_, k) => k)
  const B = Array.from({ length: nq - half }, (_, k) => half + k)
  const reduced = enginePartialTrace(M, which === 'A' ? A : B)
  return { which, n: reduced.length, cells: toCells(reduced) }
}

function resolveSvd(M: Mat): number[] {
  return svdOf(M).s
}

/* ------------------------------------------------ resolve / interpolate ------------------------------------------------ */

export function resolveMatrixStage(st: MatrixState, s: number): ResolvedMatrix {
  const M = matrixOf(st.source, s)
  const n = M.length
  const labels = st.labels ?? 'kets'
  return {
    kind: 'matrix',
    n,
    cells: toCells(M),
    labels,
    rowLabels: ketLabels(n, labels, true),
    colLabels: ketLabels(n, labels, false),
    values: st.values ?? 'decimal',
    blocks: st.blocks ?? null,
    highlight: st.highlight ?? [],
    highlightRow: st.highlightRow ?? null,
    highlightCol: st.highlightCol ?? null,
    trace: st.trace ? resolveTrace(M) : null,
    partialTrace: st.partialTrace ? resolvePartialTrace(M, st.partialTrace) : null,
    svd: st.svd ? resolveSvd(M) : null,
    shot: st.shot,
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pick = <T,>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

/** A scrub (within a beat) or a transition (between beats) of the same size lerps every entry; a structural change
 *  (a different matrix side) crossfades — the same rule as `circuit`/`amplitudes`. */
export function interpMatrixStage(a: ResolvedMatrix, b: ResolvedMatrix, t: number): ResolvedMatrix {
  if (t <= 0) return a
  if (t >= 1) return b
  const d = pick(a, b, t)
  if (a.n !== b.n) return d
  const cells = a.cells.map((row, i) => row.map((z, j) => ({ re: lerp(z.re, b.cells[i][j].re, t), im: lerp(z.im, b.cells[i][j].im, t) })))
  const M = toMat(cells)
  return {
    ...d,
    cells,
    trace: d.trace ? resolveTrace(M) : null,
    partialTrace: d.partialTrace ? resolvePartialTrace(M, d.partialTrace.which) : null,
    svd: d.svd ? resolveSvd(M) : null,
  }
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

function sourceProblems(src: MatrixSource, where: string): string[] {
  if (!src || typeof src !== 'object') return [`${where}: a source ({gate}, {outer}, {rho}, {kron}, {coef} or {pauli})`]
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
  if ('pauli' in src) return ['I', 'X', 'Y', 'Z'].includes(src.pauli) ? [] : [`${where}.pauli: must be I, X, Y or Z`]
  return [`${where}: exactly one of gate, outer, rho, kron, coef, pauli`]
}

export function validateMatrixStage(st: MatrixState): string[] {
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
  if (st.partialTrace && log2n < 2) errs.push('matrix partialTrace: needs at least two qubits (a side of 4 or more)')
  if (st.svd && !('coef' in st.source)) errs.push('matrix svd: only beside a coef source (the Schmidt weights of a two-qubit state)')
  return errs
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
export function cellLabel(z: { re: number; im: number }, values: NonNullable<MatrixState['values']>): string | null {
  if (values === 'none') return null
  if (values === 'exact') return exactLabel(z) ?? fmtC(z, 2)
  return fmtC(z, 2)
}

/* ------------------------------------------------ readouts ------------------------------------------------ */

export function matrixReadouts(r: ResolvedMatrix): SvgReadout[] {
  const out: SvgReadout[] = []
  if (r.trace) out.push({ name: 'trace', text: `Tr = ${fmtC(r.trace)}` })
  if (r.partialTrace) {
    const { which, n, cells } = r.partialTrace
    const diag = cells.map((row, i) => fmtC(row[i]))
    out.push({ name: 'partial-trace', text: `Tr_${which} → ${n}×${n}; diagonal ${diag.join(', ')}` })
  }
  if (r.svd) out.push({ name: 'svd', text: `Schmidt weights ${r.svd.map((x) => fix(x)).join(', ')}` })
  if (r.highlight.length === 1) {
    const [i, j] = r.highlight[0]
    out.push({ name: 'cell', text: `(${i}, ${j}) = ${fmtC(r.cells[i][j])}` })
  }
  if (r.highlightRow !== null) out.push({ name: 'row', text: `row ${r.highlightRow}: ${r.cells[r.highlightRow].map((z) => fmtC(z)).join(', ')}` })
  if (r.highlightCol !== null) out.push({ name: 'col', text: `column ${r.highlightCol}: ${r.cells.map((row) => row[r.highlightCol!]).map((z) => fmtC(z)).join(', ')}` })
  return out
}
