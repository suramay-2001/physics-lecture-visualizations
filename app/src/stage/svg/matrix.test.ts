/**
 * `matrix` (P-709-map §(b) "matrix"; the stage-kind batch): content names a gate/outer/rho/kron/coef/pauli source
 * (kets reuse `amplitudes`' AmpSource vocabulary); the engine makes every cell, the trace, the Tr_B reduced matrix
 * and the Schmidt (SVD) coefficients. The stage's caps (a side 2–8); one scene in two modes.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MatrixGridState, MatrixSource, MatrixTableauState } from '../../content/stage'
import { KIND_RENDER, passportOf } from '../../content/stage'
import { dagger, fromColumns, identity, matmul, outer as linalgOuter } from '../../physics/linalg'
import { eigh, kronM } from '../../physics/qc/cmat'
import { densityOf, mixtureN, partialTrace, ptranspose as enginePtranspose, schmidt, vonNeumann } from '../../physics/qc/density'
import { H as HGate, Sdg, S as SGate, cnot, pauliEigenvalue, pauliMul, pauliString } from '../../physics/qc/gates'
import { BELL_BASIS, bell, coefMatrix, ket } from '../../physics/qc/state'
import { SIGMA_X, SIGMA_Y, SIGMA_Z } from '../../physics/spin'
import { interpolate } from '../interp'
import { resolve, validateLayout } from '../resolve'
import type { ResolvedMatrixGrid, ResolvedMatrixTableau } from '../types'
import { MatrixScene } from './MatrixScene'
import { applyBasis, applyPtranspose, coefValue, exactLabel, matrixReadouts, resolveMatrixStage, validateMatrixStage } from './matrix'
import './kinds'

const mat = (source: MatrixSource, rest: Partial<Omit<MatrixGridState, 'kind' | 'source'>> = {}): MatrixGridState => ({ kind: 'matrix', source, ...rest })
const tab = (rest: Omit<MatrixTableauState, 'kind'>): MatrixTableauState => ({ kind: 'matrix', ...rest })
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

describe('matrix: trace, partial trace, Schmidt coefficients', () => {
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

  it('Schmidt coefficients: 1, 0 for a product state; 1/√2, 1/√2 for a Bell state (cross-checked against qc/density.ts schmidt)', () => {
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
    expect(validateMatrixStage(mat({ pauli: 'Q' as never }))[0]).toMatch(/letters of I, X, Y, Z/)
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
    const mid = interpolate(A, B, 0.5) as ResolvedMatrixGrid
    expect(mid.cells[0][0].re).toBeCloseTo(1, 12) // (1+1)/2
    expect(mid.cells[1][1].re).toBeCloseTo(0, 12) // (1 + −1)/2
    expect(mid.trace).toEqual({ re: 1, im: 0 }) // Tr = 1 + 0 at the midpoint
  })

  it('a different side crossfades (hard switch at t < 0.5 ? a : b)', () => {
    const A = resolveMatrixStage(mat({ pauli: 'X' }), 1)
    const B = resolveMatrixStage(mat({ gate: { name: 'CNOT' } }), 0)
    expect((interpolate(A, B, 0.3) as ResolvedMatrixGrid).n).toBe(2)
    expect((interpolate(A, B, 0.7) as ResolvedMatrixGrid).n).toBe(4)
  })
})

describe('matrix: readouts', () => {
  it('names the trace, the reduced matrix and the Schmidt coefficients as plain text', () => {
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { trace: true, partialTrace: 'B' }), 1)
    const texts = matrixReadouts(r).map((x) => x.text)
    expect(texts.some((t) => t.startsWith('Tr = 1'))).toBe(true)
    expect(texts.some((t) => t.startsWith('Tr_B →'))).toBe(true)
    const svdTexts = matrixReadouts(resolveMatrixStage(mat({ coef: { bell: '00+11' } }, { svd: true }), 1)).map((x) => x.text)
    expect(svdTexts[0]).toMatch(/^Schmidt coefficients/)
  })
})

describe('matrix: one scene, two modes', () => {
  it('draws n² cells in stage and print mode with no NaN; resolve and validateLayout reach the kind', () => {
    const states: MatrixGridState[] = [
      mat({ pauli: 'X' }),
      mat({ gate: { name: 'H' } }, { values: 'exact', trace: true }),
      mat({ gate: { name: 'CNOT' } }, { blocks: 2, highlight: [[1, 2]] }),
      mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: 'B' }),
      mat({ coef: { bell: '00+11' } }, { svd: true }),
    ]
    for (const st of states) {
      expect(validateLayout(st), JSON.stringify(st.source)).toEqual([])
      const r = resolve(st, 1) as ResolvedMatrixGrid
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

/* ================================================== v2 (W-709 #15) ================================================== */

describe('matrix v2: multi-letter pauli, product, adjoint, lin', () => {
  it('pauli: a string of 1–3 letters is qc/gates.ts pauliString (q0 first)', () => {
    const r = resolveMatrixStage(mat({ pauli: 'XYZ' }), 1)
    expect(gap(r.cells, cellsOf(pauliString('XYZ')))).toBeLessThan(1e-12)
    expect(r.n).toBe(8)
  })

  it('product: the ordinary matrix product, left to right (Q4 retrofit ruling 3: X·Z in this course’s notation)', () => {
    const r = resolveMatrixStage(mat({ product: [{ pauli: 'X' }, { pauli: 'Z' }] }), 1)
    expect(gap(r.cells, cellsOf(matmul(SIGMA_X, SIGMA_Z)))).toBeLessThan(1e-12)
    const chained = resolveMatrixStage(mat({ product: [{ pauli: 'X' }, { pauli: 'Y' }, { pauli: 'Z' }] }), 1)
    expect(gap(chained.cells, cellsOf(matmul(matmul(SIGMA_X, SIGMA_Y), SIGMA_Z)))).toBeLessThan(1e-12)
  })

  it('adjoint: A† (qc/linalg.ts dagger) — S† is Sdg', () => {
    const r = resolveMatrixStage(mat({ adjoint: { gate: { name: 'S' } } }), 1)
    expect(gap(r.cells, cellsOf(dagger(SGate)))).toBeLessThan(1e-12)
    expect(gap(r.cells, cellsOf(Sdg))).toBeLessThan(1e-12)
  })

  it('U†(Z⊗I)U for U = H⊗I: product + adjoint + kron compose (U is its own inverse, so this is Z⊗I conjugated by H⊗I)', () => {
    const U: MatrixSource = { kron: [{ gate: { name: 'H' } }, { pauli: 'I' }] }
    const r = resolveMatrixStage(mat({ product: [{ adjoint: U }, { kron: [{ pauli: 'Z' }, { pauli: 'I' }] }, U] }), 1)
    const UM = kronM(HGate, identity(2))
    const want = matmul(matmul(dagger(UM), kronM(SIGMA_Z, identity(2))), UM)
    expect(gap(r.cells, cellsOf(want))).toBeLessThan(1e-12)
    // H Z H = X, so this is X⊗I
    expect(gap(r.cells, cellsOf(kronM(SIGMA_X, identity(2))))).toBeLessThan(1e-9)
  })

  it('coefValue: the fixed exact set, and cos/sin of a named angle', () => {
    expect(coefValue('+1', 0)).toEqual({ re: 1, im: 0 })
    expect(coefValue('-1', 0)).toEqual({ re: -1, im: 0 })
    expect(coefValue('+1/2', 0)).toEqual({ re: 0.5, im: 0 })
    expect(coefValue('-1/2', 0)).toEqual({ re: -0.5, im: 0 })
    expect(coefValue('+i', 0)).toEqual({ re: 0, im: 1 })
    expect(coefValue('-i', 0)).toEqual({ re: 0, im: -1 })
    expect(coefValue('+1/sqrt2', 0).re).toBeCloseTo(Math.SQRT1_2, 12)
    expect(coefValue('-1/sqrt2', 0).re).toBeCloseTo(-Math.SQRT1_2, 12)
    expect(coefValue({ trig: 'cos', angleDeg: 0 }, 0).re).toBeCloseTo(1, 12)
    expect(coefValue({ trig: 'sin', angleDeg: 90 }, 0).re).toBeCloseTo(1, 12)
    expect(coefValue({ trig: 'cos', angleDeg: { from: 0, to: 180 } }, 1).re).toBeCloseTo(-1, 12)
  })

  it('lin: r·σ/2 at r = ẑ is Sz = ½Z (a sum of exact-coefficient terms, cos/sin of the polar angle)', () => {
    const r = resolveMatrixStage(
      mat({
        lin: [
          { c: { trig: 'cos', angleDeg: 0 }, src: { pauli: 'Z' } },
          { c: { trig: 'sin', angleDeg: 0 }, src: { pauli: 'X' } },
          { c: '+1/2', src: { pauli: 'I' } }, // a second, harmless term exercising a second lin entry
        ],
      }),
      1,
    )
    // cos0·Z + sin0·X = Z; plus ½I is not Sz, but every number is still the engine’s — cross-check directly instead
    const direct = resolveMatrixStage(mat({ lin: [{ c: '+1/2', src: { pauli: 'Z' } }] }), 1)
    expect(gap(direct.cells, cellsOf([[{ re: 0.5, im: 0 }, { re: 0, im: 0 }], [{ re: 0, im: 0 }, { re: -0.5, im: 0 }]]))).toBeLessThan(1e-12)
    expect(r.n).toBe(2)
  })

  it('validation: product/lin need matching sides; an unknown lin coefficient is rejected', () => {
    expect(validateMatrixStage(mat({ product: [{ pauli: 'X' }, { kron: [{ pauli: 'X' }, { pauli: 'X' }] }] }))[0]).toMatch(/product: every factor must have the same side/)
    expect(validateMatrixStage(mat({ lin: [{ c: '+2' as never, src: { pauli: 'X' } }] }))[0]).toMatch(/lin\[0\].c: must be a fixed exact value/)
    expect(validateMatrixStage(mat({ lin: [{ c: { trig: 'tan' as never, angleDeg: 0 }, src: { pauli: 'X' } }] }))[0]).toMatch(/trig: 'cos' or 'sin'/)
    expect(validateMatrixStage(mat({ product: [] }))[0]).toMatch(/product: at least one source/)
    expect(validateMatrixStage(mat({ lin: [] }))[0]).toMatch(/lin: at least one term/)
    expect(validateMatrixStage(mat({ adjoint: { pauli: 'XYZW' as never } }))[0]).toMatch(/letters of I, X, Y, Z/)
  })
})

describe('matrix v2: partialTrace {keep} (any qubit subset; exact arrows, including the v1-schematic ’A’ case)', () => {
  it('Tr₃ of a GHZ-like 3-qubit state, keeping q0 and q1, matches the engine’s partialTrace directly', () => {
    // (|000⟩ + |111⟩)/√2 as an outer product source built from a ket, kept simple with {kron} of two Bell-ish halves
    const psi = bell('000+111')
    const rho = densityOf(psi)
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: '000+111' } } }, { partialTrace: { keep: [0, 1] } }), 1)
    expect(r.partialTrace!.which).toBe('keep')
    expect(r.partialTrace!.keep).toEqual([0, 1])
    expect(r.partialTrace!.n).toBe(4)
    expect(gap(r.partialTrace!.cells, cellsOf(partialTrace(rho, [2])))).toBeLessThan(1e-12)
  })

  it('exact arrows for the v1-schematic ’A’ case: each reduced diagonal cell is fed by the strided set the engine actually sums', () => {
    // 2 qubits, which: 'A' traces out q0 (first half), keeping q1 (the second half) — contributing indices are
    // STRIDED (0,2 → keep 0; 1,3 → keep 1), not a contiguous block (v1 drew a schematic set for exactly this case)
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: 'A' }), 1)
    const byTo = (to: number) => r.partialTrace!.arrows.filter((a) => a.to === to).map((a) => a.from).sort()
    expect(byTo(0)).toEqual([0, 2])
    expect(byTo(1)).toEqual([1, 3])
    expect(r.partialTrace!.arrows.length).toBe(4)
  })

  it('exact arrows for ’B’ stay the contiguous-block case (unchanged from v1)', () => {
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: 'B' }), 1)
    const byTo = (to: number) => r.partialTrace!.arrows.filter((a) => a.to === to).map((a) => a.from).sort()
    expect(byTo(0)).toEqual([0, 1])
    expect(byTo(1)).toEqual([2, 3])
  })

  it('validation: keep must be a proper, non-empty, duplicate-free subset of the qubits', () => {
    expect(validateMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: { keep: [] } }))[0]).toMatch(/keep must list at least one qubit/)
    expect(validateMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: { keep: [0, 0] } }))[0]).toMatch(/keep lists a qubit twice/)
    expect(validateMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: { keep: [5] } }))[0]).toMatch(/keep must list qubits 0–1/)
    expect(validateMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: { keep: [0, 1] } }))[0]).toMatch(/leave at least one qubit traced out/)
    expect(validateMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: { keep: [0] } }))).toEqual([])
  })
})

describe('matrix v2: basis — B†AB, row/column labels from the kets', () => {
  it('the standard Bell basis diagonalizes Z⊗Z: +1 for Φ±, −1 for Ψ± (an exact, not approximate, fact)', () => {
    const r = resolveMatrixStage(mat({ kron: [{ pauli: 'Z' }, { pauli: 'Z' }] }, { basis: 'bell', labels: 'kets' }), 1)
    expect(r.rowLabels).toEqual(['⟨Φ+|', '⟨Φ−|', '⟨Ψ+|', '⟨Ψ−|'])
    expect(r.colLabels).toEqual(['|Φ+⟩', '|Φ−⟩', '|Ψ+⟩', '|Ψ−⟩'])
    const want = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, -1, 0],
      [0, 0, 0, -1],
    ].map((row) => row.map((x) => ({ re: x, im: 0 })))
    expect(gap(r.cells, want)).toBeLessThan(1e-9)
  })

  it('a custom basis equal to the computational basis leaves the grid unchanged (B = I)', () => {
    const custom = resolveMatrixStage(mat({ pauli: 'X' }, { basis: [{ ket: '0' }, { ket: '1' }] }), 1)
    expect(gap(custom.cells, cellsOf(SIGMA_X))).toBeLessThan(1e-12)
    expect(custom.rowLabels).toEqual(['⟨0|', '⟨1|'])
  })

  it('applyBasis is the resolver’s own helper: null with no basis, B†AB and the basis’s names with one', () => {
    expect(applyBasis(SIGMA_Z, undefined, 1)).toBeNull()
    const out = applyBasis(kronM(SIGMA_Z, SIGMA_Z), 'bell', 1)!
    expect(out.names).toEqual(['Φ+', 'Φ−', 'Ψ+', 'Ψ−'])
    expect(gap(cellsOf(out.M), cellsOf(matmul(matmul(dagger(fromColumns(BELL_BASIS.map((b) => b.ket))), kronM(SIGMA_Z, SIGMA_Z)), fromColumns(BELL_BASIS.map((b) => b.ket)))))).toBeLessThan(1e-9)
  })

  it('validation: ’bell’ needs a side of 4; a custom basis must match the matrix’s side and dimension', () => {
    expect(validateMatrixStage(mat({ pauli: 'X' }, { basis: 'bell' }))[0]).toMatch(/needs a side of 4/)
    expect(validateMatrixStage(mat({ pauli: 'X' }, { basis: [{ ket: '0' }] }))[0]).toMatch(/1 kets, but the matrix side is 2/)
    expect(validateMatrixStage(mat({ pauli: 'X' }, { basis: [{ ket: '00' }, { ket: '01' }] }))[0]).toMatch(/every ket must have dimension 2/)
    expect(validateMatrixStage(mat({ kron: [{ pauli: 'Z' }, { pauli: 'Z' }] }, { basis: 'bell' }))).toEqual([])
  })
})

describe('matrix v2: spectrum (eigenvalue bars + entropy, unclamped — a negative value is real, not hidden)', () => {
  it('bars: a pure state’s full density matrix has spectrum 1, 0, 0, 0', () => {
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { spectrum: 'bars' }), 1)
    expect(r.spectrum!.mode).toBe('bars')
    expect(r.spectrum!.values[0]).toBeCloseTo(1, 9)
    expect(r.spectrum!.values.slice(1).every((x) => Math.abs(x) < 1e-9)).toBe(true)
    expect(r.spectrum!.entropy).toBeNull()
  })

  it('entropy: the maximally mixed qubit has spectrum ½, ½ and S = 1 bit (qc/density.ts vonNeumann, cross-checked)', () => {
    const mixSrc: MatrixSource = { rho: { mixture: [{ w: 0.5, ket: { ket: '0' } }, { w: 0.5, ket: { ket: '1' } }] } }
    const r = resolveMatrixStage(mat(mixSrc, { spectrum: 'entropy' }), 1)
    expect(r.spectrum!.values.map((x) => Math.round(x * 1000) / 1000)).toEqual([0.5, 0.5])
    expect(r.spectrum!.entropy).toBeCloseTo(1, 9)
    expect(r.spectrum!.entropy).toBeCloseTo(vonNeumann(mixtureN([{ w: 0.5, psi: ket('0') }, { w: 0.5, psi: ket('1') }])), 12)
  })

  it('a negative eigenvalue after ptranspose is flagged, not clamped (the Peres test on a Bell pair’s ρ)', () => {
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { spectrum: 'bars', ptranspose: 'B' }), 1)
    expect(r.spectrum!.values.some((x) => x < -0.1)).toBe(true)
    expect(Math.min(...r.spectrum!.values)).toBeCloseTo(-0.5, 9)
  })

  it('validation: spectrum on a non-Hermitian matrix is rejected (S is not Hermitian; Sdg is not either)', () => {
    expect(validateMatrixStage(mat({ gate: { name: 'S' } }, { spectrum: 'bars' }))[0]).toMatch(/not Hermitian/)
    expect(validateMatrixStage(mat({ pauli: 'Z' }, { spectrum: 'entropy' }))).toEqual([])
  })

  it('readouts: eigenvalues and, with entropy, an S line', () => {
    const r = resolveMatrixStage(mat({ pauli: 'Z' }, { spectrum: 'entropy' }), 1)
    const texts = matrixReadouts(r).map((x) => x.text)
    expect(texts.some((t) => t.startsWith('eigenvalues'))).toBe(true)
    expect(texts.some((t) => t.startsWith('S ='))).toBe(true)
  })
})

describe('matrix v2: spectrum + partialTrace together shows the REDUCED matrix’s eigenvalues, not the full ρ’s (P-Q9-story.md §9.2(a); qc709-Q8Q9 ruling 4)', () => {
  it('Tr₃ of a GHZ-like 3-qubit pure state: the full ρ has spectrum 1,0,…,0 (8 values), but with partialTrace the spectrum is the 4×4 reduced matrix’s ½, ½, 0, 0', () => {
    const psi = bell('000+111')
    const reduced = partialTrace(densityOf(psi), [2])
    const full = resolveMatrixStage(mat({ rho: { ket: { bell: '000+111' } } }, { spectrum: 'bars' }), 1)
    expect(full.spectrum!.values.length).toBe(8)
    expect(full.spectrum!.values[0]).toBeCloseTo(1, 9)

    const r = resolveMatrixStage(mat({ rho: { ket: { bell: '000+111' } } }, { partialTrace: { keep: [0, 1] }, spectrum: 'bars' }), 1)
    expect(r.spectrum!.values.length).toBe(4) // the REDUCED matrix's side, not the full 8×8 one's
    expect(r.spectrum!.values[0]).toBeCloseTo(0.5, 9)
    expect(r.spectrum!.values[1]).toBeCloseTo(0.5, 9)
    expect(r.spectrum!.values.slice(2).every((x) => Math.abs(x) < 1e-9)).toBe(true)
    // cross-checked against the engine's own eigh of the reduced matrix directly
    const want = [...eigh(reduced).values].reverse()
    r.spectrum!.values.forEach((x, i) => expect(x).toBeCloseTo(want[i], 9))
  })

  it('entropy mode with partialTrace: S comes from the reduced matrix too (1 bit for a maximally-entangled reduced pair)', () => {
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: '000+111' } } }, { partialTrace: { keep: [0, 1] }, spectrum: 'entropy' }), 1)
    expect(r.spectrum!.entropy).toBeCloseTo(1, 9) // S(½|00⟩⟨00| + ½|11⟩⟨11|) = 1 bit, not S(pure GHZ ρ) = 0
  })

  it('interpolating within a beat (same n) keeps recomputing the spectrum from the reduced matrix, not the full one', () => {
    const st = mat({ rho: { ket: { bell: '000+111' } } }, { partialTrace: { keep: [0, 1] }, spectrum: 'bars' })
    const a = resolveMatrixStage(st, 0)
    const b = resolveMatrixStage(st, 1)
    const mid = interpolate(a, b, 0.5) as ResolvedMatrixGrid
    expect(mid.spectrum!.values.length).toBe(4)
  })
})

describe('matrix v2: a transition never asks eigh for the spectrum of a non-Hermitian blend', () => {
  const Z = () => resolveMatrixStage(mat({ pauli: 'Z' }, { spectrum: 'bars' }), 1)
  const X = () => resolveMatrixStage(mat({ pauli: 'X' }, { spectrum: 'bars' }), 0)
  const S = () => resolveMatrixStage(mat({ gate: { name: 'S' } }), 0)
  const finite = (v: number[]) => v.every((x) => Number.isFinite(x))

  it('Hermitian → non-Hermitian (Z with bars → S): at every mid-progress it does not throw, and the panel is the nearer endpoint’s own eigenvalues or absent', () => {
    for (const t of [0.1, 0.3, 0.49, 0.5, 0.7, 0.9]) {
      const mid = interpolate(Z(), S(), t) as ResolvedMatrixGrid
      if (t < 0.5) {
        expect(mid.spectrum!.values).toEqual(Z().spectrum!.values) // 1, −1: Z's real spectrum, snapped
        expect(finite(mid.spectrum!.values)).toBe(true)
      } else {
        expect(mid.spectrum).toBeNull() // S has no spectrum panel, so nothing is drawn from the non-Hermitian blend
      }
      // the grid itself is still the honest lerp (the S entry i·t appears), only the spectrum panel is held
      expect(mid.cells[1][1].im).toBeCloseTo(t, 12)
    }
  })

  it('non-Hermitian → Hermitian (S → X with bars): same rule from the other side', () => {
    const early = interpolate(S(), X(), 0.3) as ResolvedMatrixGrid
    expect(early.spectrum).toBeNull()
    const late = interpolate(S(), X(), 0.7) as ResolvedMatrixGrid
    expect(late.spectrum!.values.map((x) => Math.round(x * 1e9) / 1e9)).toEqual([1, -1]) // X's own spectrum, not eigh of a blend
  })

  it('Hermitian → Hermitian still recomputes the spectrum from the blended grid (Z → X at ½ is (Z + X)/2, eigenvalues ±1/√2)', () => {
    const mid = interpolate(Z(), X(), 0.5) as ResolvedMatrixGrid
    expect(mid.spectrum!.values[0]).toBeCloseTo(Math.SQRT1_2, 12)
    expect(mid.spectrum!.values[1]).toBeCloseTo(-Math.SQRT1_2, 12)
  })

  it('ρ^{T_B} (Hermitian, with a negative eigenvalue) blended with ρ: the spectrum follows the blend and never throws', () => {
    const rho = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { spectrum: 'bars' }), 1)
    const pt = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { spectrum: 'bars', ptranspose: 'B' }), 1)
    for (const t of [0.25, 0.5, 0.75]) {
      const mid = interpolate(rho, pt, t) as ResolvedMatrixGrid
      expect(finite(mid.spectrum!.values)).toBe(true)
      const want = eigh(mid.cells.map((row) => row.map((z) => ({ re: z.re, im: z.im })))).values
      expect([...mid.spectrum!.values].reverse().every((x, i) => Math.abs(x - want[i]) < 1e-9)).toBe(true)
    }
  })
})

describe('matrix v2: the negative-eigenvalue flag’s wording (P-Q9-story.md §9.2(b); qc709-Q8Q9 ruling 4)', () => {
  it('a `lin` difference of two density matrices: a negative eigenvalue is flagged "negative"', () => {
    const r = resolveMatrixStage(
      mat(
        {
          lin: [
            { c: '+1', src: { rho: { ket: { ket: '0' } } } },
            { c: '-1', src: { rho: { ket: { ket: '1' } } } },
          ],
        },
        { spectrum: 'bars' },
      ),
      1,
    )
    expect(r.spectrum!.values).toEqual([expect.closeTo(1, 9), expect.closeTo(-1, 9)])
    expect(r.spectrum!.flag).toBe('negative')
    expect(matrixReadouts(r).some((x) => x.text === 'negative')).toBe(true)
  })

  it('a `rho` source with a non-physical (negative-weight) mixture: a negative eigenvalue is flagged "not a state"', () => {
    // weights still sum to 1 (passes the content-validation check), but one is negative — not a real ensemble
    const r = resolveMatrixStage(
      mat({ rho: { mixture: [{ w: 1.5, ket: { ket: '0' } }, { w: -0.5, ket: { ket: '1' } }] } }, { spectrum: 'bars' }),
      1,
    )
    expect(r.spectrum!.values.some((x) => x < -1e-9)).toBe(true)
    expect(r.spectrum!.flag).toBe('not a state')
    expect(matrixReadouts(r).some((x) => x.text === 'not a state')).toBe(true)
  })

  it('a `rho` source after `ptranspose`: a negative eigenvalue (the Peres test) is flagged "not a state", not "negative"', () => {
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { spectrum: 'bars', ptranspose: 'B' }), 1)
    expect(r.spectrum!.values.some((x) => x < -0.1)).toBe(true)
    expect(r.spectrum!.flag).toBe('not a state')
    expect(matrixReadouts(r).some((x) => x.text === 'not a state')).toBe(true)
  })

  it('a bare operator spectrum (a raw Pauli string) is never flagged, even though its own spectrum is negative: it never claimed to be a state', () => {
    const r = resolveMatrixStage(mat({ pauli: 'Z' }, { spectrum: 'bars' }), 1)
    expect(r.spectrum!.values).toEqual([expect.closeTo(1, 9), expect.closeTo(-1, 9)])
    expect(r.spectrum!.flag).toBeNull()
    expect(matrixReadouts(r).some((x) => x.text === 'negative' || x.text === 'not a state')).toBe(false)
  })

  it('no flag text at all when no eigenvalue is actually negative, even for a `rho` source', () => {
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { spectrum: 'bars' }), 1)
    expect(r.spectrum!.values.every((x) => x >= -1e-9)).toBe(true)
    expect(matrixReadouts(r).some((x) => x.text === 'not a state')).toBe(false)
  })
})

describe('matrix v2: ptranspose (ρ^{T_B}; the moved cells are an index fact, not a tolerance)', () => {
  it('the grid becomes ρ^{T_B} (qc/density.ts ptranspose, cross-checked directly)', () => {
    const rho = densityOf(bell('00+11'))
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { ptranspose: 'B' }), 1)
    expect(gap(r.cells, cellsOf(enginePtranspose(rho, [1])))).toBeLessThan(1e-12)
  })

  it('moved cells: exactly the (i, j) pairs that disagree on the transposed qubit’s bit — 8 of 16 for 2 qubits', () => {
    const out = applyPtranspose(densityOf(bell('00+11')), 'B')!
    expect(out.qubits).toEqual([1])
    expect(out.moved.length).toBe(8)
    expect(out.moved.every(([i, j]) => (i & 1) !== (j & 1))).toBe(true)
  })

  it('validation: needs at least two qubits', () => {
    expect(validateMatrixStage(mat({ pauli: 'X' }, { ptranspose: 'B' }))[0]).toMatch(/needs at least two qubits/)
    expect(validateMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { ptranspose: 'B' }))).toEqual([])
  })

  it('draws a dashed outline on the moved cells, in both modes', () => {
    const r = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { ptranspose: 'B' }), 1)
    for (const mode of ['stage', 'print'] as const) {
      const html = renderToString(createElement('svg', null, createElement(MatrixScene, { state: r, mode, width: 320, height: 260 })))
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      expect(html, mode).toContain('data-anchor="moved"')
    }
  })
})

describe('matrix v2: the Pauli-string tableau — a second view of the same kind', () => {
  it('resolves rows of coloured letters; no product, values or state ⇒ no card, eigen or product', () => {
    const r = resolveMatrixStage(tab({ tableau: ['XX', 'ZZ'] }), 1)
    expect(r.view).toBe('tableau')
    expect(r.qubits).toBe(2)
    expect(r.rows.map((row) => row.letters)).toEqual([['X', 'X'], ['Z', 'Z']])
    expect(r.rows.every((row) => row.card === null && row.eigen === null && row.matches === null)).toBe(true)
    expect(r.product).toBeNull()
  })

  it('product: the sequential pauliMul across every row, cross-checked directly (XX then ZZ: phase −1, string YY)', () => {
    const r = resolveMatrixStage(tab({ tableau: ['XX', 'ZZ'], product: true }), 1)
    const direct = pauliMul('XX', 'ZZ')
    expect(r.product!.pauli).toBe(direct.string)
    expect(r.product!.phase.re).toBeCloseTo(direct.phase.re, 12)
    expect(r.product!.phase.im).toBeCloseTo(direct.phase.im, 12)
    expect(r.product!.pauli).toBe('YY')
    expect(r.product!.phase.re).toBeCloseTo(-1, 12)
    expect(r.product!.phase.im).toBeCloseTo(0, 12)
  })

  it('state: each row’s actual eigenvalue (qc/gates.ts pauliEigenvalue), and whether it matches the card', () => {
    // Φ+ is a +1 eigenstate of both XX and ZZ (it stabilizes both)
    const r = resolveMatrixStage(tab({ tableau: ['XX', 'ZZ'], values: { XX: 1, ZZ: 1 }, state: { bell: '00+11' } }), 1)
    expect(r.rows[0].eigen).toBe(pauliEigenvalue(bell('00+11'), 'XX'))
    expect(r.rows[0].eigen).toBe(1)
    expect(r.rows[1].eigen).toBe(1)
    expect(r.rows.every((row) => row.matches === true)).toBe(true)
    // a wrong card is flagged, not silently accepted
    const wrong = resolveMatrixStage(tab({ tableau: ['XX', 'ZZ'], values: { XX: -1, ZZ: 1 }, state: { bell: '00+11' } }), 1)
    expect(wrong.rows[0].matches).toBe(false)
    expect(wrong.rows[1].matches).toBe(true)
  })

  it('a state that is not an eigenstate of a row gives eigen null (not a false ±1)', () => {
    const r = resolveMatrixStage(tab({ tableau: ['XZ'], state: { ket: '00' } }), 1)
    expect(r.rows[0].eigen).toBeNull()
  })

  it('validation: equal-length I/X/Y/Z rows, a values key must be one of the rows, state’s qubit count must match', () => {
    expect(validateMatrixStage(tab({ tableau: [] }))[0]).toMatch(/at least one Pauli string/)
    expect(validateMatrixStage(tab({ tableau: ['XX', 'Z'] }))[0]).toMatch(/must be 2 letters/)
    expect(validateMatrixStage(tab({ tableau: ['XQ'] }))[0]).toMatch(/must be 2 letters/)
    expect(validateMatrixStage(tab({ tableau: ['XX'], values: { ZZ: 1 } }))[0]).toMatch(/not one of the tableau.s own rows/)
    expect(validateMatrixStage(tab({ tableau: ['XX'], state: { ket: '000' } }))[0]).toMatch(/needs 2 qubits \(got 3\)/)
    expect(validateMatrixStage(tab({ tableau: ['XX', 'ZZ'], product: true, values: { XX: 1, ZZ: 1 }, state: { bell: '00+11' } }))).toEqual([])
  })

  it('readouts name the product, the eigenvalues and whether the card matches', () => {
    const ok = resolveMatrixStage(tab({ tableau: ['XX', 'ZZ'], product: true, values: { XX: 1, ZZ: 1 }, state: { bell: '00+11' } }), 1)
    const okTexts = matrixReadouts(ok).map((x) => x.text)
    expect(okTexts.some((t) => t.startsWith('product = YY'))).toBe(true)
    expect(okTexts.some((t) => /^the card matches every row.s eigenvalue$/.test(t))).toBe(true)
    const wrong = resolveMatrixStage(tab({ tableau: ['XX', 'ZZ'], values: { XX: -1, ZZ: 1 }, state: { bell: '00+11' } }), 1)
    expect(matrixReadouts(wrong).some((x) => x.text === '1 of 2 row(s) do not match the card')).toBe(true)
  })

  it('the passport is the dedicated "PAULI TABLE" variant, with no phase legend', () => {
    const p = passportOf(tab({ tableau: ['XX'] }))
    expect(p.title).toBe('PAULI TABLE')
    expect(p.legend).toBeUndefined()
  })

  it('draws one row per string, a product row when asked, with no NaN, in both modes', () => {
    const r = resolveMatrixStage(tab({ tableau: ['XX', 'ZZ'], product: true, values: { XX: 1, ZZ: 1 }, state: { bell: '00+11' } }), 1)
    for (const mode of ['stage', 'print'] as const) {
      const html = renderToString(createElement('svg', null, createElement(MatrixScene, { state: r, mode, width: 320, height: 260 })))
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      expect((html.match(/data-anchor="tableau-row-\d+"/g) ?? []).length, mode).toBe(2)
      expect(html, mode).toContain('data-anchor="tableau-product"')
    }
  })
})

describe('matrix v2: interpolation — tableau is a hard switch; grid carries ptranspose/basis structure through a lerp', () => {
  it('two tableaus: a hard pick at t < 0.5 ? a : b (the cards are discrete, with no meaningful midpoint)', () => {
    const a = resolveMatrixStage(tab({ tableau: ['XX'], values: { XX: 1 }, state: { bell: '00+11' } }), 1)
    const b = resolveMatrixStage(tab({ tableau: ['ZZ'], values: { ZZ: -1 }, state: { bell: '00+11' } }), 1)
    expect((interpolate(a, b, 0.3) as ResolvedMatrixTableau).rows[0].pauli).toBe('XX')
    expect((interpolate(a, b, 0.7) as ResolvedMatrixTableau).rows[0].pauli).toBe('ZZ')
  })

  it('a grid and a tableau: a structural change, so it crossfades (picked whole, never merged)', () => {
    const grid = resolveMatrixStage(mat({ pauli: 'X' }), 1)
    const tableau = resolveMatrixStage(tab({ tableau: ['XX'] }), 1)
    expect((interpolate(grid, tableau, 0.3) as ResolvedMatrixGrid).view).toBe('grid')
    expect((interpolate(grid, tableau, 0.7) as ResolvedMatrixTableau).view).toBe('tableau')
  })

  it('same-size grids with ptranspose: cells lerp and the moved set (structural) carries over unchanged', () => {
    const A = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi+' } } }, { ptranspose: 'B' }), 1)
    const B = resolveMatrixStage(mat({ rho: { ket: { bell: 'Phi-' } } }, { ptranspose: 'B' }), 0)
    const mid = interpolate(A, B, 0.5) as ResolvedMatrixGrid
    expect(mid.ptranspose!.moved.length).toBe(8)
  })
})
