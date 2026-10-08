/**
 * `matrix` v3, the pair view (W-448 L9-A; rulings 448-L8L11 L9 R1: extend `matrix`, no `pair-grid` kind). A `coef` source takes
 * two 448 directions, the ud-du family or a named pair; a `table` source is the labelled boxes of H_A ⊗ H_B (2 × 2 or the 2 × 6
 * photon-die) or a classical table of CHANCES. Every number is the engine's: the boxes are `coefMatrix`, the totals
 * `measure.marginal`, the determinant `pairDet`, the verdict `isProduct`, the means `info.ts`. The 709 states resolve unchanged.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MatrixGridState, MatrixSource } from '../../content/stage'
import { passportOf } from '../../content/stage'
import { abs, c } from '../../physics/complex'
import { classicalPair, correlatorC, covariancePM } from '../../physics/qc/info'
import { marginal } from '../../physics/qc/measure'
import { bell, coefMatrix, isProduct, ket, kron, namedPair, pairDet, udFamily } from '../../physics/qc/state'
import { KET, ketFromBloch } from '../../physics/spin'
import { interpolate } from '../interp'
import { resolve, validateLayout } from '../resolve'
import type { ResolvedMatrixGrid } from '../types'
import { MatrixScene } from './MatrixScene'
import { matrixReadouts, pairVec, resolveMatrixStage, validateMatrixStage } from './matrix'
import './kinds'

const mat = (source: MatrixSource, rest: Partial<Omit<MatrixGridState, 'kind' | 'source'>> = {}): MatrixGridState => ({ kind: 'matrix', source, ...rest })
const DEG = Math.PI / 180
const P60 = { thetaDeg: 60, phiDeg: 0 }
const texts = (st: MatrixGridState, s = 1) => matrixReadouts(resolveMatrixStage(st, s)).map((x) => x.text)
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('pair view: a coef source of two directions (a column times a row)', () => {
  it('the boxes are coefMatrix(kron(Alice, Bob)) from the engine, and ψ_ab = α_a β_b with the factors beside them', () => {
    const r = resolveMatrixStage(mat({ coef: { pair: [P60, '+x'] } }, { cells: 'amplitudes', factors: true, labels: 'ud' }), 1)
    const psi = kron(ketFromBloch(60 * DEG, 0), KET['+x'])
    const C = coefMatrix(psi, 1)
    r.cells.forEach((row, i) => row.forEach((z, j) => { close(z.re, C[i][j].re); close(z.im, C[i][j].im) }))
    const f = r.pair!.factors!
    expect(f.a.map((z) => z.re)).toEqual([ketFromBloch(60 * DEG, 0)[0].re, ketFromBloch(60 * DEG, 0)[1].re])
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) close(r.cells[i][j].re, f.a[i].re * f.b[j].re - f.a[i].im * f.b[j].im)
    // the learner's numbers: 0.612, 0.612, 0.354, 0.354
    expect(r.cells.flat().map((z) => Math.round(z.re * 1000) / 1000)).toEqual([0.612, 0.612, 0.354, 0.354])
    expect(r.pair!.names).toEqual([['uu', 'ud'], ['du', 'dd']])
    expect(r.rowLabels).toEqual(['|u⟩', '|d⟩'])
    expect(r.n).toBe(2)
    expect(r.cols).toBeUndefined()
  })

  it('Bob’s column totals are |β_u|², |β_d|² whatever Alice does (swept θ_A: 0°, 60°, 120°, 180°)', () => {
    for (const th of [0, 60, 120, 180]) {
      const st = mat({ coef: { pair: [{ thetaDeg: th, phiDeg: 0 }, '+x'] } }, { cells: 'chances', readouts: ['marginals', 'norm'] })
      const r = resolveMatrixStage(st, 1)
      const m = r.pair!.stats.marginals!
      close(m.cols[0], 0.5)
      close(m.cols[1], 0.5)
      close(m.rows[0] + m.rows[1], 1)
      close(r.pair!.stats.norm!, 1)
      const direct = marginal(kron(ketFromBloch(th * DEG, 0), KET['+x']), [1])
      close(m.cols[0], direct[0])
    }
  })

  it('a sweep of Alice’s angle moves the boxes with the hold progress; the state stays a product', () => {
    const st = mat({ coef: { pair: [{ thetaDeg: { from: 0, to: 180 }, phiDeg: 0 }, '+x'] } }, { readouts: ['product'] })
    expect(texts(st, 0)).toEqual(['product'])
    expect(texts(st, 0.5)).toEqual(['product'])
    expect(resolveMatrixStage(st, 0).cells[0][0].re).toBeCloseTo(Math.SQRT1_2, 12) // Alice |+z⟩, Bob |+x⟩
    expect(resolveMatrixStage(st, 1).cells[0][0].re).toBeCloseTo(0, 12) // Alice |−z⟩
  })
})

describe('pair view: the ud-du family, named pairs, a bell source', () => {
  it('the family is udFamily(t): |ud⟩ at 0°, the singlet at 45°, with the determinant ½ sin 2t and the verdict from isProduct', () => {
    const st = (t: number) => mat({ coef: { family: 'ud-du', tDeg: t } }, { cells: 'amplitudes', readouts: ['det', 'product'] })
    for (const t of [0, 15, 30, 45]) {
      const r = resolveMatrixStage(st(t), 1)
      const want = coefMatrix(udFamily(t * DEG), 1)
      r.cells.forEach((row, i) => row.forEach((z, j) => close(z.re, want[i][j].re)))
      close(r.pair!.stats.det!.re, 0.5 * Math.sin(2 * t * DEG))
      expect(r.pair!.stats.product).toBe(t === 0)
    }
    const singlet = resolveMatrixStage(st(45), 1)
    const ref = coefMatrix(bell('01-10'), 1)
    singlet.cells.forEach((row, i) => row.forEach((z, j) => close(z.re, ref[i][j].re)))
    expect(texts(st(30))).toEqual(['ψuuψdd − ψudψdu = 0.433', 'not a product'])
    expect(texts(st(0))).toEqual(['ψuuψdd − ψudψdu = 0', 'product'])
  })

  it('a sweep of t runs 0 → 45°: the determinant grows from 0 to ½ along the hold, and pairVec agrees with the engine', () => {
    const st = mat({ coef: { family: 'ud-du', tDeg: { from: 0, to: 45 } } }, { readouts: ['det'] })
    close(resolveMatrixStage(st, 0).pair!.stats.det!.re, 0)
    close(resolveMatrixStage(st, 1).pair!.stats.det!.re, 0.5)
    close(abs(pairDet(pairVec({ family: 'ud-du', tDeg: { from: 0, to: 45 } }, 0.5))), 0.5 * Math.sin(2 * 22.5 * DEG))
  })

  it('named pairs: uniform is |+x⟩|+x⟩ (a product), flip is not (determinant −½)', () => {
    const u = resolveMatrixStage(mat({ coef: { named: 'uniform' } }, { cells: 'amplitudes', readouts: ['product', 'det'] }), 1)
    const f = resolveMatrixStage(mat({ coef: { named: 'flip' } }, { cells: 'amplitudes', readouts: ['product', 'det'] }), 1)
    expect(u.pair!.stats.product).toBe(true)
    expect(f.pair!.stats.product).toBe(false)
    expect(isProduct(namedPair('flip'), [0])).toBe(false)
    close(u.pair!.stats.det!.re, 0)
    close(f.pair!.stats.det!.re, -0.5)
    expect(u.cells.flat().map((z) => z.re)).toEqual([0.5, 0.5, 0.5, 0.5])
    expect(f.cells.flat().map((z) => z.re)).toEqual([0.5, 0.5, 0.5, -0.5])
    // the exit check: the uniform pair equals ket('++') up to a global phase (here exactly)
    const pp = coefMatrix(ket('++'), 1)
    u.cells.forEach((row, i) => row.forEach((z, j) => close(z.re, pp[i][j].re)))
  })

  it('a bell source with the pair labels reads Ψ⁻ as the singlet: boxes ud = +1/√2, du = −1/√2', () => {
    const r = resolveMatrixStage(mat({ coef: { bell: '01-10' } }, { labels: 'ud', cells: 'amplitudes' }), 1)
    close(r.cells[0][1].re, Math.SQRT1_2)
    close(r.cells[1][0].re, -Math.SQRT1_2)
    expect(r.cells[0][0]).toEqual({ re: 0, im: 0 })
    expect(r.pair!.factors).toBeNull()
  })
})

describe('pair view: tables that are not states', () => {
  it('a frame table: 2 × 6 photon-die and 2 × 2 spins, labelled, with the dimension from the shape', () => {
    const die = resolveMatrixStage(mat({ table: { frame: 'photon-die' } }, { readouts: ['dims'], highlight: [[0, 3]] }), 1)
    expect([die.n, die.cols]).toEqual([2, 6])
    expect(die.rowLabels).toEqual(['|H⟩', '|V⟩'])
    expect(die.colLabels).toEqual(['|1⟩', '|2⟩', '|3⟩', '|4⟩', '|5⟩', '|6⟩'])
    expect(die.pair!.names[0][3]).toBe('H4')
    expect(die.pair!.cells).toBe('labels')
    expect(die.pair!.stats.dims).toEqual({ rows: 2, cols: 6, total: 12 })
    expect(matrixReadouts(die).map((x) => x.text)).toEqual(['dim = 2 × 6 = 12'])
    const spins = resolveMatrixStage(mat({ table: { frame: 'spins' } }, { readouts: ['dims'] }), 1)
    expect(spins.pair!.stats.dims).toEqual({ rows: 2, cols: 2, total: 4 })
    expect(spins.pair!.names).toEqual([['uu', 'ud'], ['du', 'dd']])
  })

  it('the dealer’s table is classicalPair("dealer"): chances ½ off the diagonal, ⟨a⟩ = ⟨b⟩ = 0, ⟨ab⟩ = −1, correlation −1', () => {
    const r = resolveMatrixStage(mat({ table: { classical: 'dealer' } }, { readouts: ['marginals', 'means', 'norm'] }), 1)
    expect(r.cells.map((row) => row.map((z) => z.re))).toEqual(classicalPair('dealer'))
    expect(r.pair!.classical).toBe(true)
    expect(r.pair!.cells).toBe('chances')
    expect(r.rowLabels).toEqual(['+1', '−1'])
    expect(r.pair!.stats.means).toEqual({ a: 0, b: 0, ab: -1, corr: -1 })
    expect(r.pair!.stats.norm).toBe(1)
    expect(matrixReadouts(r).map((x) => x.text)).toEqual([
      'coin A: +1 0.5, −1 0.5',
      'coin B: +1 0.5, −1 0.5',
      '⟨a⟩ = 0, ⟨b⟩ = 0',
      '⟨ab⟩ = −1',
      'correlation = −1',
      'chances add to 1',
    ])
  })

  it('independent coins P_A(+1) = 0.7, P_B(+1) = 0.4: the table factors, ⟨ab⟩ = ⟨a⟩⟨b⟩ = −0.08 and the correlation is zero', () => {
    const r = resolveMatrixStage(mat({ table: { classical: 'independent', pA: 0.7, pB: 0.4 } }, { readouts: ['means'] }), 1)
    const m = r.pair!.stats.means!
    close(m.a, 0.4)
    close(m.b, -0.2)
    close(m.ab, -0.08)
    close(m.corr, 0)
    close(m.ab, correlatorC(classicalPair({ pA: 0.7, pB: 0.4 })))
    close(m.corr, covariancePM(classicalPair({ pA: 0.7, pB: 0.4 })))
    // two fair coins: every box ¼
    const fair = resolveMatrixStage(mat({ table: { classical: 'independent', pA: 0.5, pB: 0.5 } }, { readouts: ['means'] }), 1)
    expect(fair.cells.flat().map((z) => z.re)).toEqual([0.25, 0.25, 0.25, 0.25])
    expect(fair.pair!.stats.means).toEqual({ a: 0, b: 0, ab: 0, corr: 0 })
  })
})

describe('pair view: passport, transitions, drawing', () => {
  it('passports: spins, chances of a state, the label frame, the classical table; fidelity keys are the pair keys', () => {
    expect(passportOf(mat({ coef: { named: 'uniform' } }, { cells: 'amplitudes' })).title).toBe('STATE SPACE · two spins')
    expect(passportOf(mat({ coef: { named: 'uniform' } }, { cells: 'amplitudes' })).legend).toBe('phase')
    expect(passportOf(mat({ coef: { named: 'uniform' } }, { cells: 'chances' })).title).toBe('CHANCES · two spins')
    expect(passportOf(mat({ coef: { named: 'uniform' } }, { cells: 'chances' })).legend).toBeUndefined()
    expect(passportOf(mat({ table: { frame: 'photon-die' } })).title).toBe('BASIS LABELS · H_A ⊗ H_B')
    expect(passportOf(mat({ table: { classical: 'dealer' } })).title).toBe('CHANCES · two coins')
    expect(passportOf(mat({ table: { classical: 'dealer' } })).fidelityKey).toBe('matrix-chances')
    expect(passportOf(mat({ coef: { bell: '00+11' } })).title).toBe('MATRIX · ⟨i|A|j⟩') // 709’s coef states keep the matrix passport
  })

  it('a transition between two pair views blends the boxes and the factors, and snaps every statistic with the nearer endpoint', () => {
    const A = resolveMatrixStage(mat({ coef: { pair: ['+z', '+x'] } }, { factors: true, cells: 'amplitudes', readouts: ['norm', 'product'] }), 1)
    const B = resolveMatrixStage(mat({ coef: { pair: ['-z', '+x'] } }, { factors: true, cells: 'amplitudes', readouts: ['norm', 'product'] }), 1)
    const mid = interpolate(A, B, 0.5) as ResolvedMatrixGrid
    expect(mid.cells[0][0].re).toBeCloseTo(Math.SQRT1_2 / 2, 12)
    expect(mid.pair!.factors!.a[0].re).toBeCloseTo(0.5, 12)
    // the blend of |ud⟩-like states has norm < 1, but the readout is the endpoint's own
    expect(mid.pair!.stats.norm).toBe(B.pair!.stats.norm)
    expect((interpolate(A, B, 0.2) as ResolvedMatrixGrid).pair!.stats).toEqual(A.pair!.stats)
    // a different shape (2 × 2 to 2 × 6) crossfades
    const six = resolveMatrixStage(mat({ table: { frame: 'photon-die' } }), 1)
    const four = resolveMatrixStage(mat({ table: { frame: 'spins' } }), 1)
    expect((interpolate(four, six, 0.3) as ResolvedMatrixGrid).cols).toBeUndefined()
    expect((interpolate(four, six, 0.7) as ResolvedMatrixGrid).cols).toBe(6)
  })

  it('draws rows × cols boxes in stage, print and bare modes, with no NaN, for every kind of pair view', () => {
    const states: MatrixGridState[] = [
      mat({ table: { frame: 'photon-die' } }, { readouts: ['dims'], highlight: [[0, 3]] }),
      mat({ table: { frame: 'spins' } }, { highlight: [[0, 1], [1, 0]] }),
      mat({ table: { classical: 'dealer' } }, { readouts: ['means'] }),
      mat({ table: { classical: 'independent', pA: 0.7, pB: 0.4 } }, { readouts: ['means'] }),
      mat({ coef: { pair: [P60, '+x'] } }, { cells: 'amplitudes', factors: true, readouts: ['norm'] }),
      mat({ coef: { pair: [P60, '+x'] } }, { cells: 'chances', factors: true, readouts: ['marginals'] }),
      mat({ coef: { family: 'ud-du', tDeg: 45 } }, { cells: 'amplitudes', readouts: ['det', 'product'], values: 'none' }),
      mat({ coef: { bell: '01-10' } }, { labels: 'none', cells: 'amplitudes' }),
    ]
    for (const st of states) {
      expect(validateLayout(st), JSON.stringify(st.source)).toEqual([])
      const r = resolve(st, 1) as ResolvedMatrixGrid
      for (const mode of ['stage', 'print'] as const)
        for (const bare of [false, true]) {
          const html = renderToString(createElement('svg', null, createElement(MatrixScene, { state: r, mode, width: 360, height: 300, bare })))
          expect(html, `${mode} ${bare}`).not.toMatch(/NaN|Infinity|undefined/)
          expect((html.match(/data-anchor="cell-\d+-\d+"/g) ?? []).length, `${mode} ${bare}`).toBe(r.n * (r.cols ?? r.n))
          if (st.factors) expect(html).toContain('data-anchor="factor-a"')
        }
      // JSON round trip (content rule (b))
      expect(JSON.parse(JSON.stringify(st))).toEqual(st)
    }
  })

  it('labels mode prints each box’s ket, number mode prints the exact value where there is one', () => {
    const labels = renderToString(createElement('svg', null, createElement(MatrixScene, { state: resolve(mat({ table: { frame: 'photon-die' } }), 1) as ResolvedMatrixGrid, mode: 'stage', width: 600, height: 300 })))
    expect(labels).toContain('|H4⟩')
    expect(labels).toContain('|V6⟩')
    const nums = renderToString(createElement('svg', null, createElement(MatrixScene, { state: resolve(mat({ coef: { named: 'uniform' } }, { cells: 'chances' }), 1) as ResolvedMatrixGrid, mode: 'stage', width: 360, height: 300 })))
    expect(nums).toContain('1/4')
  })
})

describe('pair view: validation', () => {
  const bad = (st: MatrixGridState) => validateMatrixStage(st).join(' | ')
  it('factors need a {pair} source; a frame table has only labels; a classical table is chances', () => {
    expect(bad(mat({ coef: { named: 'uniform' } }, { factors: true }))).toMatch(/factors: only beside a coef source of \{pair/)
    expect(bad(mat({ table: { frame: 'spins' } }, { cells: 'amplitudes' }))).toMatch(/only labels/)
    expect(bad(mat({ table: { classical: 'dealer' } }, { cells: 'amplitudes' }))).toMatch(/chances/)
    expect(bad(mat({ table: { classical: 'dealer' } }, { factors: true }))).toMatch(/factors/)
  })
  it('readouts match their source: det/product/params need a state, means a classical table, norm/marginals not a frame', () => {
    expect(bad(mat({ table: { classical: 'dealer' } }, { readouts: ['det'] }))).toMatch(/needs a coef source/)
    expect(bad(mat({ table: { frame: 'spins' } }, { readouts: ['product'] }))).toMatch(/needs a coef source/)
    expect(bad(mat({ coef: { named: 'flip' } }, { readouts: ['means'] }))).toMatch(/classical table/)
    expect(bad(mat({ table: { frame: 'photon-die' } }, { readouts: ['marginals'] }))).toMatch(/holds labels/)
    expect(bad(mat({ coef: { named: 'flip' } }, { readouts: ['nope' as never] }))).toMatch(/unknown/)
  })
  it('no operator features in the pair view; highlights stay inside the table; labels are ud or none', () => {
    expect(bad(mat({ coef: { named: 'flip' } }, { cells: 'amplitudes', svd: true }))).toMatch(/svd: not in the pair view/)
    expect(bad(mat({ coef: { named: 'flip' } }, { cells: 'amplitudes', trace: true }))).toMatch(/trace: not in the pair view/)
    expect(bad(mat({ table: { frame: 'photon-die' } }, { highlight: [[0, 6]] }))).toMatch(/outside the 2×6 table/)
    expect(bad(mat({ table: { frame: 'photon-die' } }, { highlight: [[1, 5]] }))).toBe('')
    expect(bad(mat({ coef: { named: 'flip' } }, { labels: 'kets', cells: 'amplitudes' }))).toMatch(/'ud' or 'none'/)
  })
  it('sources: bad kets, an out-of-range chance along a sweep, a non-two-qubit state, labels ud on an operator', () => {
    expect(bad(mat({ coef: { pair: ['+q' as never, '+x'] } }))).toMatch(/not a named ket/)
    expect(bad(mat({ coef: { family: 'ud-du', tDeg: Number.NaN } }))).toMatch(/finite tDeg/)
    expect(bad(mat({ table: { classical: 'independent', pA: { from: 0.5, to: 1.4 }, pB: 0.5 } }))).toMatch(/outside 0…1/)
    expect(bad(mat({ coef: { ket: '000' } }, { cells: 'amplitudes' }))).toMatch(/needs a two-qubit state/)
    expect(bad(mat({ pauli: 'X' }, { labels: 'ud' }))).toMatch(/needs a coef or table source/)
    expect(bad(mat({ pauli: 'X' }, { cells: 'amplitudes' }))).toMatch(/need a coef or table source/)
    expect(validateMatrixStage(mat({ coef: { pair: [P60, '+x'] } }, { cells: 'amplitudes', factors: true, readouts: ['norm', 'params', 'marginals', 'det', 'product'] }))).toEqual([])
  })
})

describe('the 709 matrix states are untouched by v3', () => {
  it('a coef bell state resolves with no pair field and no cols, and keeps the matrix readouts', () => {
    const r = resolveMatrixStage(mat({ coef: { bell: '00+11' } }, { svd: true }), 1)
    expect('pair' in r).toBe(false)
    expect('cols' in r).toBe(false)
    expect(r.labels).toBe('kets')
    expect(matrixReadouts(r)[0].text).toMatch(/^Schmidt coefficients/)
    expect(c(1, 0)).toEqual({ re: 1, im: 0 })
  })
})
