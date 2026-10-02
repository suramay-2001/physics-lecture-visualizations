/**
 * `matrix` (P-709-map §(b) "matrix"; the stage-kind batch): content names a gate/outer/rho/kron/coef/pauli source
 * (kets reuse `amplitudes`' AmpSource vocabulary); the engine makes every cell, the trace, the Tr_B reduced matrix
 * and the Schmidt (SVD) weights. The stage's caps (a side 2–8); one scene in two modes.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MatrixSource, MatrixState } from '../../content/stage'
import { KIND_RENDER, passportOf } from '../../content/stage'
import { identity, outer as linalgOuter } from '../../physics/linalg'
import { kronM } from '../../physics/qc/cmat'
import { densityOf, mixtureN, partialTrace, schmidt } from '../../physics/qc/density'
import { H as HGate, cnot } from '../../physics/qc/gates'
import { bell, coefMatrix, ket } from '../../physics/qc/state'
import { SIGMA_X, SIGMA_Y, SIGMA_Z } from '../../physics/spin'
import { interpolate } from '../interp'
import { resolve, validateLayout } from '../resolve'
import type { ResolvedMatrix } from '../types'
import { MatrixScene } from './MatrixScene'
import { exactLabel, matrixReadouts, resolveMatrixStage, validateMatrixStage } from './matrix'
import './kinds'

const mat = (source: MatrixSource, rest: Partial<Omit<MatrixState, 'kind' | 'source'>> = {}): MatrixState => ({ kind: 'matrix', source, ...rest })
type Cell = { re: number; im: number }
const cellsOf = (M: readonly (readonly Cell[])[]): Cell[][] => M.map((row) => row.map((z) => ({ re: z.re, im: z.im })))
const gap = (a: readonly (readonly Cell[])[], b: readonly (readonly Cell[])[]) => Math.max(...a.flatMap((row, i) => row.map((z, j) => Math.hypot(z.re - b[i][j].re, z.im - b[i][j].im))))

describe('matrix: every entry comes from the engine', () => {
  it('is an SVG kind', () => {
    expect(KIND_RENDER.matrix).toBe('svg')
  })

  it('pauli and gate: raw σ matrices, a built-in gate, and an embedded gate on a bigger register', () => {
    expect(gap(resolveMatrixStage(mat({ pauli: 'X' }), 1).cells, cellsOf(SIGMA_X))).toBe(0)
    expect(gap(resolveMatrixStage(mat({ pauli: 'Y' }), 1).cells, cellsOf(SIGMA_Y))).toBe(0)
    expect(gap(resolveMatrixStage(mat({ pauli: 'Z' }), 1).cells, cellsOf(SIGMA_Z))).toBe(0)
    expect(gap(resolveMatrixStage(mat({ gate: { name: 'H' } }), 1).cells, cellsOf(HGate))).toBe(0)
    expect(gap(resolveMatrixStage(mat({ gate: { name: 'CNOT' } }), 1).cells, cellsOf(cnot()))).toBe(0)
    // X embedded on qubit 1 of a 2-qubit register: I ⊗ X
    const embedded = resolveMatrixStage(mat({ gate: { name: 'X' }, qubits: 2, targets: [1] }), 1)
    expect(gap(embedded.cells, cellsOf(kronM(identity(2), SIGMA_X)))).toBeLessThan(1e-12)
  })

  it('outer: |ψ⟩⟨φ| (φ defaults to ψ)', () => {
    const r1 = resolveMatrixStage(mat({ outer: [{ ket: '0' }] }), 1)
    expect(gap(r1.cells, cellsOf(densityOf(ket('0'))))).toBeLessThan(1e-12)
    const r2 = resolveMatrixStage(mat({ outer: [{ ket: '0' }, { ket: '1' }] }), 1)
    expect(gap(r2.cells, cellsOf(linalgOuter(ket('0'), ket('1'))))).toBeLessThan(1e-12)
  })

  it('rho: |Φ⁺⟩⟨Φ⁺| and a 50/50 mixture of |0⟩, |1⟩', () => {
    const phi = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }), 1)
    expect(gap(phi.cells, cellsOf(densityOf(bell('00+11'))))).toBeLessThan(1e-12)
    const mix = resolveMatrixStage(mat({ rho: { mixture: [{ w: 0.5, ket: { ket: '0' } }, { w: 0.5, ket: { ket: '1' } }] } }), 1)
    expect(gap(mix.cells, cellsOf(mixtureN([{ w: 0.5, psi: ket('0') }, { w: 0.5, psi: ket('1') }])))).toBeLessThan(1e-12)
    // a maximally mixed qubit: ½I, off-diagonal exactly 0
    expect(mix.cells).toEqual([
      [{ re: 0.5, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0.5, im: 0 }],
    ])
  })

  it('kron: A ⊗ B as a block matrix', () => {
    const r = resolveMatrixStage(mat({ kron: [{ pauli: 'X' }, { pauli: 'Z' }] }), 1)
    expect(gap(r.cells, cellsOf(kronM(SIGMA_X, SIGMA_Z)))).toBeLessThan(1e-12)
    expect(r.n).toBe(4)
  })

  it('coef: a two-qubit state’s 2×2 coefficient matrix', () => {
    const r = resolveMatrixStage(mat({ coef: { bell: '00+11' } }), 1)
    expect(gap(r.cells, cellsOf(coefMatrix(bell('00+11'), 1)))).toBeLessThan(1e-12)
  })

  it('labels: kets (bra rows, ket columns), indices, or none', () => {
    const kets = resolveMatrixStage(mat({ pauli: 'X' }, { labels: 'kets' }), 1)
    expect(kets.rowLabels).toEqual(['⟨0|', '⟨1|'])
    expect(kets.colLabels).toEqual(['|0⟩', '|1⟩'])
    const idx = resolveMatrixStage(mat({ gate: { name: 'CNOT' } }, { labels: 'indices' }), 1)
    expect(idx.rowLabels).toEqual(['0', '1', '2', '3'])
    const none = resolveMatrixStage(mat({ pauli: 'I' }, { labels: 'none' }), 1)
    expect(none.rowLabels).toEqual(['', ''])
  })

  it('exactLabel: a small fixed table of known values, else null', () => {
    expect(exactLabel({ re: 0, im: 0 })).toBe('0')
    expect(exactLabel({ re: 1, im: 0 })).toBe('1')
    expect(exactLabel({ re: -1, im: 0 })).toBe('−1')
    expect(exactLabel({ re: 0, im: 1 })).toBe('i')
    expect(exactLabel({ re: 0, im: -1 })).toBe('−i')
    expect(exactLabel({ re: 0.5, im: 0 })).toBe('1/2')
    expect(exactLabel({ re: Math.SQRT1_2, im: 0 })).toBe('1/√2')
    expect(exactLabel({ re: 0, im: -Math.SQRT1_2 })).toBe('−1/√2i')
    expect(exactLabel({ re: 0.314159, im: 0 })).toBeNull()
  })
})

describe('matrix: trace, partial trace, Schmidt weights', () => {
  it('trace: Tr of a Pauli is 0; Tr of |Φ⁺⟩⟨Φ⁺| is 1', () => {
    expect(resolveMatrixStage(mat({ pauli: 'X' }, { trace: true }), 1).trace).toEqual({ re: 0, im: 0 })
    const tr = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { trace: true }), 1).trace!
    expect(tr.re).toBeCloseTo(1, 12)
    expect(tr.im).toBeCloseTo(0, 12)
  })

  it('Tr_B of |Φ⁺⟩⟨Φ⁺| = 𝟙/2 (the engine’s partialTrace, cross-checked against qc/density.ts directly)', () => {
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: 'B' }), 1)
    expect(r.partialTrace).not.toBeNull()
    expect(r.partialTrace!.n).toBe(2)
    const expected = cellsOf(partialTrace(densityOf(bell('00+11')), [1]))
    expect(gap(r.partialTrace!.cells, expected)).toBeLessThan(1e-12)
    for (const row of r.partialTrace!.cells) for (const z of row) expect(Math.abs(z.im)).toBeLessThan(1e-12)
    expect(r.partialTrace!.cells[0][0].re).toBeCloseTo(0.5, 12)
    expect(r.partialTrace!.cells[1][1].re).toBeCloseTo(0.5, 12)
    expect(r.partialTrace!.cells[0][1].re).toBeCloseTo(0, 12)
    // Tr_A gives the same answer for this maximally symmetric state
    const a = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: 'A' }), 1)
    expect(gap(a.partialTrace!.cells, r.partialTrace!.cells)).toBeLessThan(1e-12)
  })

  it('Schmidt weights: 1, 0 for a product state; 1/√2, 1/√2 for a Bell state (cross-checked against qc/density.ts schmidt)', () => {
    const prod = resolveMatrixStage(mat({ coef: { ket: '00' } }, { svd: true }), 1)
    expect(prod.svd).not.toBeNull()
    expect(prod.svd![0]).toBeCloseTo(1, 12)
    expect(prod.svd![1]).toBeCloseTo(0, 12)
    const bellR = resolveMatrixStage(mat({ coef: { bell: '00+11' } }, { svd: true }), 1)
    expect(bellR.svd![0]).toBeCloseTo(Math.SQRT1_2, 12)
    expect(bellR.svd![1]).toBeCloseTo(Math.SQRT1_2, 12)
    const direct = schmidt(bell('00+11'), [0]).coeffs
    expect(bellR.svd).toEqual(direct)
  })
})

describe('matrix: validation', () => {
  it('rejects bad sources and gate names', () => {
    expect(validateMatrixStage(mat({ gate: { name: 'Nope' as never } }))[0]).toMatch(/unknown gate/)
    expect(validateMatrixStage(mat({ gate: { name: 'X' }, qubits: 0 }))[0]).toMatch(/qubits must be/)
    expect(validateMatrixStage(mat({ gate: { name: 'X' }, qubits: 4 }))[0]).toMatch(/qubits must be/)
    expect(validateMatrixStage(mat({ pauli: 'Q' as never }))[0]).toMatch(/must be I, X, Y or Z/)
    expect(validateMatrixStage(mat({} as never))[0]).toMatch(/exactly one of/)
  })

  it('rejects a side outside 2–8 (kron of two 4×4 gates is 16×16)', () => {
    const big: MatrixSource = { kron: [{ gate: { name: 'CNOT' } }, { gate: { name: 'CNOT' } }] }
    expect(validateMatrixStage(mat(big))[0]).toMatch(/side 16 must be a power of two from 2 to 8/)
  })

  it('coef needs a two-qubit state', () => {
    expect(validateMatrixStage(mat({ coef: { ket: '0' } }))[0]).toMatch(/needs a two-qubit state/)
    expect(validateMatrixStage(mat({ coef: { ket: '000' } }))[0]).toMatch(/needs a two-qubit state/)
    expect(validateMatrixStage(mat({ coef: { ket: '00' } }))).toEqual([])
  })

  it('partialTrace needs at least two qubits; svd needs a coef source', () => {
    expect(validateMatrixStage(mat({ pauli: 'X' }, { partialTrace: 'A' }))[0]).toMatch(/needs at least two qubits/)
    expect(validateMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: 'B' }))).toEqual([])
    expect(validateMatrixStage(mat({ pauli: 'X' }, { svd: true }))[0]).toMatch(/only beside a coef source/)
    expect(validateMatrixStage(mat({ coef: { ket: '00' } }, { svd: true }))).toEqual([])
  })

  it('highlight/highlightRow/highlightCol/blocks are bounds-checked', () => {
    expect(validateMatrixStage(mat({ gate: { name: 'CNOT' } }, { highlight: [[9, 0]] }))[0]).toMatch(/outside the 4×4 grid/)
    expect(validateMatrixStage(mat({ gate: { name: 'CNOT' } }, { highlightRow: 9 }))[0]).toMatch(/highlightRow/)
    expect(validateMatrixStage(mat({ gate: { name: 'CNOT' } }, { highlightCol: -1 }))[0]).toMatch(/highlightCol/)
    expect(validateMatrixStage(mat({ pauli: 'X' }, { blocks: 4 }))[0]).toMatch(/does not divide the side/)
    expect(validateMatrixStage(mat({ gate: { name: 'CNOT' } }, { blocks: 2 }))).toEqual([])
    expect(validateMatrixStage(mat({ gate: { name: 'CNOT' } }, { blocks: 4 }))).toEqual([])
  })

  it('a mixture whose weights do not sum to 1 is rejected', () => {
    expect(validateMatrixStage(mat({ rho: { mixture: [{ w: 0.5, ket: { ket: '0' } }, { w: 0.6, ket: { ket: '1' } }] } }))[0]).toMatch(/weights sum to/)
  })
})

describe('matrix: interpolation', () => {
  it('two matrices of the same side lerp cell by cell, and the trace/svd are recomputed at the midpoint', () => {
    const A = resolveMatrixStage(mat({ pauli: 'I' }, { trace: true }), 1)
    const B = resolveMatrixStage(mat({ pauli: 'Z' }, { trace: true }), 0)
    const mid = interpolate(A, B, 0.5) as ResolvedMatrix
    expect(mid.cells[0][0].re).toBeCloseTo(1, 12) // (1+1)/2
    expect(mid.cells[1][1].re).toBeCloseTo(0, 12) // (1 + −1)/2
    expect(mid.trace).toEqual({ re: 1, im: 0 }) // Tr = 1 + 0 at the midpoint
  })

  it('a different side crossfades (hard switch at t < 0.5 ? a : b)', () => {
    const A = resolveMatrixStage(mat({ pauli: 'X' }), 1)
    const B = resolveMatrixStage(mat({ gate: { name: 'CNOT' } }), 0)
    expect((interpolate(A, B, 0.3) as ResolvedMatrix).n).toBe(2)
    expect((interpolate(A, B, 0.7) as ResolvedMatrix).n).toBe(4)
  })
})

describe('matrix: readouts', () => {
  it('names the trace, the reduced matrix and the Schmidt weights as plain text', () => {
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { trace: true, partialTrace: 'B' }), 1)
    const texts = matrixReadouts(r).map((x) => x.text)
    expect(texts.some((t) => t.startsWith('Tr = 1'))).toBe(true)
    expect(texts.some((t) => t.startsWith('Tr_B →'))).toBe(true)
    const svdTexts = matrixReadouts(resolveMatrixStage(mat({ coef: { bell: '00+11' } }, { svd: true }), 1)).map((x) => x.text)
    expect(svdTexts[0]).toMatch(/^Schmidt weights/)
  })
})

describe('matrix: one scene, two modes', () => {
  it('draws n² cells in stage and print mode with no NaN; resolve and validateLayout reach the kind', () => {
    const states: MatrixState[] = [
      mat({ pauli: 'X' }),
      mat({ gate: { name: 'H' } }, { values: 'exact', trace: true }),
      mat({ gate: { name: 'CNOT' } }, { blocks: 2, highlight: [[1, 2]] }),
      mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: 'B' }),
      mat({ coef: { bell: '00+11' } }, { svd: true }),
    ]
    for (const st of states) {
      expect(validateLayout(st), JSON.stringify(st.source)).toEqual([])
      const r = resolve(st, 1) as ResolvedMatrix
      // a partial-trace panel draws its own (smaller) grid of cells beside the main one
      const expectedCells = r.n * r.n + (r.partialTrace ? r.partialTrace.n * r.partialTrace.n : 0)
      for (const mode of ['stage', 'print'] as const) {
        const html = renderToString(createElement('svg', null, createElement(MatrixScene, { state: r, mode, width: 320, height: 260 })))
        expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
        expect((html.match(/data-anchor="cell-\d+-\d+"/g) ?? []).length, mode).toBe(expectedCells)
      }
    }
  })

  it('the passport names the space and carries the phase legend', () => {
    expect(passportOf(mat({ pauli: 'X' })).title).toBe('MATRIX · ⟨i|A|j⟩')
    expect(passportOf(mat({ pauli: 'X' })).legend).toBe('phase')
  })
})
