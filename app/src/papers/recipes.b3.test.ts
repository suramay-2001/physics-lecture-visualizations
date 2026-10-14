/**
 * The eight measurement recipes of the background chapter B3 (papers/recipes.qec.ts): every claim and challenge value the chapter's plan prints
 * (docs/roles/proposals/P-B3-story.md §1.7; checked there and in pipeline/b3_numpy.py by independent routes, and here against the recipes), the
 * pictures they return pass the stage kinds' own validators, and bad parameters are refused with a path.
 */
import { describe, expect, it } from 'vitest'
import { validateLayout } from '../stage/resolve'
import '../stage/svg/kinds'
import { runRecipe, type RecipeRef } from './recipes'

const SQ = Math.SQRT1_2
const P3 = 0.07532671999999999 // (1 - 0.96^4) / 2
const pm = (product: 'ZZ' | 'XX', mode: 'product' | 'separate', extra = {}): RecipeRef => ({ recipe: 'product-measure', params: { product, mode, ...extra } })
const su = (generators: string[], measure: string, extra = {}): RecipeRef => ({ recipe: 'stab-update', params: { generators, measure, ...extra } })
const sg = (d: number, step: 'separate' | 'merged' | 'split', extra = {}): RecipeRef => ({ recipe: 'surgery-merge-split', params: { d, step, ...extra } })
const cn = (upTo: number, extra = {}): RecipeRef => ({ recipe: 'cnot-by-measurement', params: { upTo, ...extra } })
const gg = (host: 'patch3-x' | 'patches3-xx' | 'patch3-steane' | 'seam3', extra = {}): RecipeRef => ({ recipe: 'gauge-graph', params: { host, ...extra } }) as RecipeRef
const pr = (extra = {}): RecipeRef => ({ recipe: 'product-repeat', params: { checks: 4, rounds: 7, q: 0.02, ...extra } })
const bj = (w: number, extra = {}): RecipeRef => ({ recipe: 'bridge-join', params: { w, ...extra } }) as RecipeRef

type Row = [key: string, ref: RecipeRef, out: string, want: number, digits?: number]
const ROWS: Row[] = [
  // ---- b3-logical-measure
  ['b3EvenProb', pm('ZZ', 'product'), 'pEven', 0.5],
  ['b3BellAmp', pm('ZZ', 'product'), 'ampSame', SQ, 12],
  ['b3SepProb', pm('ZZ', 'separate'), 'pSep', 0.25],
  ['b3Concurrence', pm('ZZ', 'product'), 'concurrence', 1],
  ['xx product', pm('XX', 'product'), 'pEven', 0.5],
  ['xx product amplitude', pm('XX', 'product', { outcome: 1 }), 'ampSame', SQ, 12],
  ['b3KeptXX', su(['XI', 'IX'], 'ZZ'), 'kept', 1],
  ['update replaced', su(['XI', 'IX'], 'ZZ'), 'replaced', 1],
  ['b3BellFixed', su(['XX', 'ZZ'], 'ZZ'), 'censusFixed', 3],
  ['b3BellRandom', su(['XX', 'ZZ'], 'ZZ'), 'censusRandom', 12],
  ['update fixed', su(['XX', 'ZZ'], 'ZZ'), 'fixed', 1],
  ['bit-flip fixed', su(['ZZI', 'IZZ'], 'ZZI'), 'censusFixed', 3],
  ['b3-m-logical', su(['ZZI', 'IZZ'], 'ZZI'), 'censusLogical', 12],
  ['bit-flip clashing', su(['ZZI', 'IZZ'], 'ZZI'), 'censusClashing', 48],
  ['b3Clash12', su(['IXXI'], 'IZZI'), 'clashes', 2],
  ['b3Clash1', su(['XXII'], 'IZZI'), 'clashes', 1],
  ['added k', su(['XXXX', 'ZZZZ'], 'IZZI'), 'kAfter', 1],
  ['b3LogicalK1', { recipe: 'code-measure-logical', params: { code: 'c422', measure: 'IZZI' } }, 'kBefore', 2],
  ['b3LogicalK2', { recipe: 'code-measure-logical', params: { code: 'c422', measure: 'IZZI' } }, 'kAfter', 1],
  ['b3ProductWeight', { recipe: 'code-measure-logical', params: { code: 'c422', measure: 'IZZI' } }, 'weight', 2],
  ['commutes', { recipe: 'code-measure-logical', params: { code: 'c422', measure: 'IZZI' } }, 'commutes', 1],
  ['in group', { recipe: 'code-measure-logical', params: { code: 'c422', measure: 'XXXX' } }, 'inGroup', 1],
  ['steane logical', { recipe: 'code-measure-logical', params: { code: 'steane7', measure: 'XXXXXXX' } }, 'kAfter', 0],
  // ---- b3-surgery
  ['b3SeamQubits', sg(3, 'merged'), 'seam', 3],
  ['b3MergedN', sg(3, 'merged'), 'n', 21],
  ['b3NewXChecks', sg(3, 'merged'), 'newChecks', 4],
  ['b3WidenZ', sg(3, 'merged'), 'widened', 2],
  ['b3PatternProb', sg(3, 'merged'), 'pPattern', 0.0625],
  ['b3MeasProb', sg(3, 'merged'), 'pProduct', 0.5],
  ['b3PlusPlusProb', sg(3, 'merged', { prep: 'plus' }), 'pProduct', 1],
  ['b3SplitProb', sg(3, 'split'), 'pSplit', 0.125],
  ['b3FrameSign', sg(3, 'split'), 'frameSigns', 4],
  ['b3MergeN5', sg(5, 'merged'), 'n', 55],
  ['b3NewX5', sg(5, 'merged'), 'newChecks', 6],
  ['b3WidenZ5', sg(5, 'merged'), 'widened', 4],
  ['b3-s-seam', sg(5, 'separate'), 'seam', 5],
  ['d7 n', sg(5, 'merged', { product: 'ZZ' }), 'n', 55],
  ['zz merge', sg(3, 'merged', { product: 'ZZ' }), 'pProduct', 0.5],
  ['b3CnotProb', cn(3), 'pTriple', 0.125],
  ['b3CnotNoFix', cn(3), 'noFix', 2],
  ['b3CnotZFix', cn(3), 'zFix', 4],
  ['b3CnotXFix', cn(3), 'xFix', 4],
  ['fix rule 110 z', cn(3, { outcomes: '110' }), 'zNow', 1],
  ['fix rule 110 x', cn(3, { outcomes: '110' }), 'xNow', 1],
  ['fix rule 101 x', cn(3, { outcomes: '101' }), 'xNow', 0],
  ['branch agrees', cn(3, { outcomes: '011' }), 'agree', 1],
  // ---- b3-gauging
  ['b3GaugeV', gg('patch3-x'), 'V', 3],
  ['b3GaugeE', gg('patch3-x'), 'E', 2],
  ['patch k', gg('patch3-x'), 'k', 0],
  ['b3ProdGauss', gg('patch3-x'), 'productOk', 1],
  ['b3CycleRank', gg('patches3-xx', { rungs: 3 }), 'cycles', 2],
  ['b3GaugedN', gg('patches3-xx', { rungs: 3 }), 'n', 25],
  ['b3GaugedK', gg('patches3-xx', { rungs: 3 }), 'k', 1],
  ['b3EdgeQubits1', gg('seam3'), 'E', 3],
  ['b3EdgeQubits2', gg('patches3-xx', { rungs: 3 }), 'E', 7],
  ['b3MergedDist1', gg('seam3'), 'dX', 3],
  ['b3MergedDist2', gg('seam3'), 'dZ', 7],
  ['b3LadderDist1', gg('patches3-xx', { rungs: 3 }), 'dX', 3],
  ['b3LadderDist2', gg('patches3-xx', { rungs: 3 }), 'dZ', 7],
  ['b3GaugeGrowth', gg('patches3-xx', { rungs: 3 }), 'growth', 7 / 18, 12],
  ['seam growth', gg('seam3'), 'growth', 3 / 18, 12],
  ['b3-g-ladder', gg('patches3-xx', { rungs: 2 }), 'cycles', 1],
  // ---- b3-distance
  ['b3DistTable1', gg('patches3-xx', { rungs: 1 }), 'dX', 1],
  ['b3DistTable2', gg('patches3-xx', { rungs: 2 }), 'dX', 2],
  ['b3DistTable3', gg('patches3-xx', { rungs: 3 }), 'dX', 3],
  ['b3Cycles1', gg('patches3-xx', { rungs: 1 }), 'cycles', 0],
  ['b3Cycles2', gg('patches3-xx', { rungs: 2 }), 'cycles', 1],
  ['b3Cycles3', gg('patches3-xx', { rungs: 3 }), 'cycles', 2],
  ['b3Cheeger1', gg('patches3-xx', { rungs: 1 }), 'h', 1 / 3, 12],
  ['b3Cheeger2', gg('patches3-xx', { rungs: 2 }), 'h', 2 / 3, 12],
  ['b3Cheeger3', gg('patches3-xx', { rungs: 3 }), 'h', 1, 12],
  ['b3GaugeQubits1', gg('patches3-xx', { rungs: 3, drop: 0 }), 'gaugeQubits', 0],
  ['b3GaugeQubits2', gg('patches3-xx', { rungs: 3, drop: 1 }), 'gaugeQubits', 1],
  ['b3GaugeQubits3', gg('patches3-xx', { rungs: 3, drop: 2 }), 'gaugeQubits', 2],
  ['b3ProdFlip', pr(), 'pProd', P3, 12],
  ['b3RoundsFail1', pr(), 'fail1', 0.07532672, 8],
  ['b3RoundsFail2', pr(), 'fail2', 0.0161675, 7],
  ['b3RoundsFail3', pr(), 'fail3', 0.0038057, 7],
  ['b3RoundsFail4', pr(), 'fail4', 0.00093564, 8],
  ['b3RoundsFail5', pr(), 'fail5', 0.00023596, 8],
  ['b3RoundsFail6', pr(), 'fail6', 0.0000605117, 9],
  ['b3VoteRatio', pr(), 'ratio', 4 * P3 * (1 - P3), 12],
  ['b3RoundsFor1e3', pr(), 'roundsFor1e3', 7],
  // ---- b3-bridges
  ['b3BridgeCycles1', bj(1), 'cycles', 0],
  ['b3BridgeCycles2', bj(2), 'cycles', 1],
  ['b3BridgeCycles3', bj(3), 'cycles', 2],
  ['b3BridgeChecks', bj(3), 'checks', 2],
  ['b3BridgeDist1', bj(1), 'dist', 1],
  ['b3BridgeDist2', bj(2), 'dist', 2],
  ['b3BridgeDist3', bj(3), 'dist', 3],
  ['b3AdapterN', bj(3, { host: 'patch3-steane' }), 'n', 23],
  ['b3AdapterK', bj(3, { host: 'patch3-steane' }), 'k', 1],
  ['b3AdapterCycles', bj(3, { host: 'patch3-steane' }), 'cycles', 2],
  ['b3AdapterDist', bj(3, { host: 'patch3-steane' }), 'dist', 3],
  ['b3AdapterSize1', bj(1, { host: 'patch3-steane' }), 'dist', 1],
  ['b3AdapterSize2', bj(2, { host: 'patch3-steane' }), 'dist', 2],
  ['b3AdapterH2', bj(2, { host: 'patch3-steane' }), 'h', 2 / 3, 12],
  ['b3AdapterOrders', bj(3, { host: 'patch3-steane' }), 'orders', 6],
]

const run = (ref: RecipeRef) => {
  const r = runRecipe(ref, 'here')
  if (!r.ok) throw new Error(r.problems.join('\n'))
  return r
}

describe('B3 recipes: every value of the plan ledger', () => {
  it.each(ROWS)('%s', (key, ref, out, want, digits = 9) => {
    const got = run(ref).values[out]
    expect(got, `${key} ${out}`).toBeDefined()
    expect(got).toBeCloseTo(want, digits)
  })
})

describe('B3 recipes: every stage they return passes its kind validator', () => {
  const refs: RecipeRef[] = [
    pm('ZZ', 'product', { upTo: 1 }), pm('ZZ', 'separate'), pm('XX', 'product'), pm('XX', 'separate'),
    su(['XI', 'IX'], 'ZZ'), su(['XX', 'ZZ'], 'ZZ'), su(['XXXX', 'ZZZZ'], 'IZZI'),
    { recipe: 'code-measure-logical', params: { code: 'c422', measure: 'IZZI' } },
    sg(3, 'separate'), sg(3, 'merged', { show: ['new', 'widened', 'seam'] }), sg(3, 'split', { show: ['seam'] }), sg(5, 'merged', { show: ['new', 'product'] }), sg(3, 'merged', { product: 'ZZ' }),
    cn(0), cn(1), cn(2), cn(3), cn(3, { fixed: true }), cn(3, { outcomes: '101', only: 'program' }), cn(2, { only: 'amplitudes' }),
    gg('patch3-x', { show: ['vertices', 'edges'], focus: { vertex: 1 } }), gg('patch3-x', { product: true }), gg('seam3'), gg('patches3-xx', { rungs: 3, show: ['cycles'], drop: 1 }),
    gg('patches3-xx', { rungs: 1, subset: 'worst', readouts: ['cheeger', 'distance'] }), gg('patch3-steane', { w: 2, readouts: ['n', 'k'] }),
    pr(), pr({ plot: true }), pr({ only: 'plot' }), pr({ only: 'readout', faults: [{ round: 2, check: 3 }] }), pr({ seed: 4, show: ['readings'] }),
    bj(2), bj(3, { host: 'patch3-steane' }),
  ]
  it.each(refs.map((r, i) => [i, JSON.stringify(r).slice(0, 90), r] as const))('%s %s', (_i, _label, ref) => {
    const r = run(ref)
    expect(validateLayout(r.stage)).toEqual([])
  })
})

describe('B3 recipes: bad parameters are refused with a path', () => {
  const bad = (ref: unknown): string => {
    const r = runRecipe(ref, 'here')
    return r.ok ? '' : r.problems.join(' | ')
  }
  it('rules between parameters', () => {
    expect(bad(gg('patch3-x', { rungs: 2 }))).toMatch(/params\.rungs/)
    expect(bad(gg('patch3-x', { w: 2 }))).toMatch(/params\.w/)
    expect(bad(gg('patches3-xx', { rungs: 0 }))).toMatch(/params\.rungs/)
    expect(bad(gg('patches3-xx', { order: [0, 0, 1] }))).toMatch(/params\.order/)
    expect(bad(gg('patches3-xx', { drop: 3 }))).toMatch(/drop|range|expected/)
    expect(bad(pr({ rounds: 6 }))).toMatch(/params\.rounds/)
    expect(bad(pr({ faults: [{ round: 9, check: 1 }] }))).toMatch(/params\.faults\[0\]\.round/)
    expect(bad(pr({ faults: [{ round: 1, check: 1 }], seed: 3 }))).toMatch(/params\.seed/)
    expect(bad(su(['XI', 'ZI'], 'ZZ'))).toMatch(/anticommute/)
    expect(bad(su(['XI', 'IXX'], 'ZZ'))).toMatch(/params\.generators/)
    expect(bad(sg(4, 'merged'))).toMatch(/params\.d/)
    expect(bad(cn(2, { fixed: true }))).toMatch(/params\.fixed/)
    expect(bad(pm('ZZ', 'product', { upTo: 5 }))).toMatch(/params\.upTo/)
    expect(bad({ recipe: 'code-measure-logical', params: { code: 'c422', measure: 'IZZ' } })).toMatch(/params\.measure/)
  })
  it('unknown fields and values never reach the engine', () => {
    expect(bad({ recipe: 'gauge-graph', params: { host: 'patch9', rungs: 1 } })).toMatch(/params\.host/)
    expect(bad({ recipe: 'cnot-by-measurement', params: { upTo: 2, outcomes: '12x' } })).toMatch(/params\.outcomes/)
    expect(bad({ recipe: 'bridge-join', params: { w: 4 } })).toMatch(/params\.w/)
    expect(bad({ recipe: 'product-measure', params: { product: 'YY', mode: 'product' } })).toMatch(/params\.product/)
  })
})
