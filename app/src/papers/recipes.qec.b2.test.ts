/**
 * The six quantum-LDPC recipes of the background chapter B2 (papers/recipes.qec.b2.ts): every claim value the chapter prints (the numpy ledger of docs/roles/proposals/P-B2-story.md §1.7,
 * checked there by an independent script and in pipeline/claims_papers/b2.py), the pictures they return pass the stage kinds' own validators, and bad parameters are refused with a path.
 * Two values differ from the plan, on purpose: the ones of the shift x are counted in the paper's logical basis (34, the basis the stage draws), not in a null-space basis (32), and the
 * tableau check gives a flag, not a detector count (the count depends on the random outcomes).
 */
import { describe, expect, it } from 'vitest'
import { validateLayout } from '../stage/resolve'
import '../stage/svg/kinds'
import { runRecipe, type RecipeRef } from './recipes'

const FAM: RecipeRef = { recipe: 'qldpc-family', params: { view: 'check-weight', hammingR: [3, 4, 5, 6, 7], toricL: [3, 4, 5, 6, 8] } }
const GROSS: RecipeRef = { recipe: 'bb-code', params: { preset: 'gross' } }
const TORIC3: RecipeRef = { recipe: 'bb-code', params: { preset: 'toric-3x3' } }
const TOY: RecipeRef = { recipe: 'bb-code', params: { preset: 'toy-24', distance: true } }
const TORIC34: RecipeRef = { recipe: 'bb-code', params: { spec: { l: 3, m: 4, A: [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }], B: [{ dx: 0, dy: 0 }, { dx: 0, dy: 1 }] }, distance: true } }
const SCHED = (variant: 'printed' | 'swap-z-reads', extra: Record<string, unknown> = {}): RecipeRef => ({ recipe: 'bb-schedule', params: { preset: 'gross', variant, ...extra } as never })
const SHIFT = (a: number, b: number, extra: Record<string, unknown> = {}): RecipeRef => ({ recipe: 'bb-shift', params: { preset: 'gross', shift: { a, b }, ...extra } as never })
const STAR = [0, 9] // h(0, 0) and v(0, 0) of the 3 x 3 torus
const BP = (iter: number, extra: Record<string, unknown> = {}): RecipeRef => ({ recipe: 'bp-decode', params: { code: 'toric3', error: STAR, p: 0.05, iter, ...extra } as never })

type Row = [key: string, ref: RecipeRef, out: string, want: number]
const ROWS: Row[] = [
  // ---- b2-ldpc
  ['b2ToricWeight', FAM, 'toricW', 4],
  ['b2HammingW7', FAM, 'hammingW7', 4],
  ['b2HammingW15', FAM, 'hammingW15', 8],
  ['b2HammingW31', FAM, 'hammingW31', 16],
  ['b2HammingW63', FAM, 'hammingW63', 32],
  ['b2HammingK63', FAM, 'hammingK63', 51],
  ['b2HammingRate63', FAM, 'hammingRate63', 51 / 63],
  ['b2-l-w', FAM, 'hammingW127', 64],
  ['b2SurfaceRate3', FAM, 'surfaceRate3', 1 / 9],
  ['b2SurfaceRate17', FAM, 'surfaceRate17', 1 / 289],
  ['b2SurfaceData17', FAM, 'surfaceData17', 289],
  ['b2SurfaceData13', FAM, 'surfaceData13', 169],
  ['b2SurfaceDataFor12', FAM, 'surfaceDataFor12', 2028],
  ['b2SurfaceRatio13', FAM, 'surfaceRatio13', 2028 / 144],
  ['b2K144', GROSS, 'k', 12],
  ['b2N144', GROSS, 'n', 144],
  // ---- b2-bpt
  ['b2Kd2nSurface', FAM, 'kd2nSurface', 1],
  ['b2Kd2nToric', FAM, 'kd2nToric', 1],
  ['b2Kd2n72', FAM, 'kd2n72', 6],
  ['b2Kd2n90', FAM, 'kd2n90', 8.88888888888889],
  ['b2Kd2n108', FAM, 'kd2n108', 7.407407407407407],
  ['b2Kd2n144', FAM, 'kd2n144', 12],
  ['b2Kd2n288', FAM, 'kd2n288', 13.5],
  ['b2LayerDegree', { recipe: 'bb-code', params: { preset: 'gross', view: 'layers' } }, 'layerDegree', 3],
  ['b2LayerEdges', { recipe: 'bb-code', params: { preset: 'gross', view: 'layers' } }, 'layerEdges', 864],
  ['b2-b-layers', { recipe: 'bb-code', params: { preset: 'gross', view: 'layers' } }, 'layerEdgesEach', 432],
  ['b2QubitDegree', GROSS, 'qubitDegree', 6],
  ['b2CheckWeight', GROSS, 'checkWeight', 6],
  // ---- b2-polynomials
  ['b2AWeight', GROSS, 'aWeight', 3],
  ['b2ABweight', GROSS, 'abWeight', 9],
  ['b2ABcommute', GROSS, 'abCommute', 1],
  ['b2GrossRankX', GROSS, 'rankX', 66],
  ['b2OverlapChecks', GROSS, 'overlap2', 9],
  ['b2ZeroOverlapChecks', GROSS, 'overlap0', 63],
  ['b2GrossKer', GROSS, 'ker', 6],
  ['b2ToricKer', TORIC3, 'ker', 1],
  ['b2-p-ker', GROSS, 'ker', 6],
  ['b2-p-k', TORIC3, 'k', 2],
  ['b2N72', FAM, 'n72', 72],
  ['b2N90', FAM, 'n90', 90],
  ['b2N108', FAM, 'n108', 108],
  ['b2N288', FAM, 'n288', 288],
  ['b2N360', FAM, 'n360', 360],
  ['b2N756', FAM, 'n756', 756],
  ['b2K72', FAM, 'k72', 12],
  ['b2K90', FAM, 'k90', 8],
  ['b2K108', FAM, 'k108', 8],
  ['b2K288', FAM, 'k288', 12],
  ['b2K360', FAM, 'k360', 12],
  ['b2K756', FAM, 'k756', 16],
  ['b2D72', FAM, 'd72', 6],
  ['b2D72Z', FAM, 'd72Z', 6],
  ['b2ToyN', TOY, 'n', 24],
  ['b2ToyK', TOY, 'k', 4],
  ['b2ToyD', TOY, 'd', 4],
  ['b2ToyKd2n', TOY, 'kd2n', 8 / 3],
  ['b2ToricSameK', TORIC34, 'k', 2],
  ['b2ToricSameD', TORIC34, 'd', 3],
  ['b2ToricSameKd2n', TORIC34, 'kd2n', 0.75],
  ['b2Rate144', GROSS, 'rate', 12 / 288],
  // ---- b2-gross
  ['b2ToricIsBB', TORIC3, 'toricIsBB', 1],
  ['b2LocalEdges', GROSS, 'localEdges', 4],
  ['b2LongEdges', GROSS, 'longEdges', 2],
  ['b2LongTotal', GROSS, 'longTotal', 288],
  ['b2EdgeTotal', GROSS, 'edgeTotal', 864],
  ['b2IsoGross', { recipe: 'bb-presentations', params: { code: 'gross' } }, 'iso', 1],
  ['b2IsoGrossNoShift', { recipe: 'bb-presentations', params: { code: 'gross' } }, 'isoNoShift', 0],
  ['b2IsoTwoGross', { recipe: 'bb-presentations', params: { code: 'two-gross' } }, 'iso', 1],
  ['b2IsoTwoGrossNoMap', { recipe: 'bb-presentations', params: { code: 'two-gross' } }, 'isoNoMap', 0],
  ['b2T5Conflict', SCHED('printed'), 'conflict', 0],
  ['b2T5BadPairs', SCHED('printed'), 'badPairs', 0],
  ['b2T5Pairs', SCHED('printed'), 'pairs', 5184],
  ['b2T5MaxOverlap', SCHED('printed'), 'maxOverlap', 2],
  ['b2T5SwapBad', SCHED('swap-z-reads'), 'badPairs', 432],
  ['b2T5TableauClean', SCHED('printed', { tableau: true }), 'tableauClean', 1],
  ['b2T5SwapTableauBad', SCHED('swap-z-reads', { tableau: true }), 'tableauBad', 1],
  ['b2Cycles1', SCHED('printed', { cycles: 1 }), 'steps', 9],
  ['b2Cycles10', SCHED('printed', { cycles: 10 }), 'steps', 81],
  ['b2Cycles12', SCHED('printed', { cycles: 12 }), 'steps', 97],
  ['b2-g-steps', SCHED('printed', { cycles: 10 }), 'steps', 81],
  ['b2-g-edges', GROSS, 'checkWeight', 6],
  // ---- b2-automorphisms
  ['b2ShiftsPreserve', SHIFT(1, 0), 'preservedAll', 72],
  ['b2SwapPreserves', SHIFT(1, 0), 'swapPreserves', 0],
  ['b2OrderMx', SHIFT(1, 0), 'orderMx', 6],
  ['b2OrderMy', SHIFT(1, 0), 'orderMy', 6],
  ['b2MxOnes', SHIFT(1, 0), 'onesX', 34],
  ['b2DistinctShifts', SHIFT(1, 0), 'distinct', 36],
  ['b2TrivialShifts', SHIFT(6, 0, { matrix: true }), 'trivial', 2],
  ['b2GroupOrder', SHIFT(1, 0), 'groupOrder', 36],
  ['b2-a-count', SHIFT(1, 0), 'preservedAll', 72],
  ['b2-a-order', SHIFT(1, 0), 'orderMx', 6],
  ['b2-a-group', SHIFT(1, 0), 'groupOrder', 36],
  // ---- b2-decoding
  ['b2Llr', { recipe: 'bp-decode', params: { code: 'rep7', error: [3], p: 0.05, iter: 1 } }, 'llr', Math.log(0.95 / 0.05)],
  ['b2Llr001', { recipe: 'bp-decode', params: { code: 'rep7', error: [3], p: 0.01, iter: 1 } }, 'llr', Math.log(0.99 / 0.01)],
  ['b2-d-llr', { recipe: 'bp-decode', params: { code: 'rep7', error: [3], p: 0.01, iter: 1 } }, 'llr', Math.log(0.99 / 0.01)],
  ['b2BpRepIters', { recipe: 'bp-decode', params: { code: 'rep7', error: [3], p: 0.05, iter: 7 } }, 'iterations', 1],
  ['b2BpSingleIters', { recipe: 'bp-decode', params: { code: 'toric3', error: [4], p: 0.05, iter: 18 } }, 'iterations', 1],
  ['b2BpToricConverged', BP(18), 'converged', 0],
  ['b2BpToricHardWeight', BP(2), 'hardWeight', 4],
  ['b2BpStarLlr', BP(18), 'starLlr', -Math.log(0.95 / 0.05)],
  ['b2AltWeight', BP(2), 'altWeight', 2],
  ['b2FourCycles', BP(2), 'fourCycles', 0],
  ['b2OsdWeight', BP(18, { osd: true }), 'osdWeight', 2],
  ['b2OsdValid', BP(18, { osd: true }), 'osdValid', 1],
  ['b2OsdHighStab', BP(18, { osd: true, tie: 'high' }), 'osdDiffStabilizer', 1],
  ['b2-d-osd', BP(18, { osd: true }), 'osdWeight', 2],
]

describe('every value the B2 plan prints is the recipe’s output', () => {
  it.each(ROWS.map((r) => [r[0], r] as const))('%s', (_, [, ref, out, want]) => {
    const r = runRecipe(ref)
    if (!r.ok) throw new Error(r.problems.join('\n'))
    expect(r.values[out], out).toBeCloseTo(want, 9)
  })
})

describe('the pictures pass the stage kinds’ validators and are pure', () => {
  const PICTURES: RecipeRef[] = [
    FAM,
    { recipe: 'qldpc-family', params: { view: 'rate', d: [3, 5, 7, 9, 11, 13, 15, 17] } },
    { recipe: 'qldpc-family', params: { view: 'kd2n', codes: ['surface-d3', 'surface-d5', 'surface-d7', 'toric-L4'] } },
    { recipe: 'qldpc-family', params: { view: 'kd2n', codes: ['b72', 'b90', 'b108', 'gross', 'two-gross'], logX: true } },
    { recipe: 'qldpc-family', params: { view: 'kd2n', codes: ['surface-d13', 'gross'] } },
    { recipe: 'qldpc-family', params: { view: 'table3' } },
    GROSS,
    { recipe: 'bb-code', params: { preset: 'gross', check: { kind: 'X', cell: { i: 0, j: 0 } }, longEdges: true } },
    { recipe: 'bb-code', params: { preset: 'gross', pattern: { poly: 'A', anchor: { i: 0, j: 0 } } } },
    { recipe: 'bb-code', params: { preset: 'gross', view: 'matrix', which: 'both' } },
    { recipe: 'bb-code', params: { preset: 'two-gross', view: 'matrix', which: 'HX', show: ['bands'] } },
    { recipe: 'bb-code', params: { preset: 'gross', view: 'layers' } },
    TOY,
    TORIC34,
    { recipe: 'bb-presentations', params: { code: 'gross', step: 1 } },
    { recipe: 'bb-presentations', params: { code: 'gross', step: 2 } },
    { recipe: 'bb-presentations', params: { code: 'two-gross' } },
    SCHED('printed', { round: 3 }),
    SCHED('swap-z-reads', { round: 1 }),
    { recipe: 'bb-schedule', params: { preset: 'b72', variant: 'swap-z-reads', tableau: true } },
    SHIFT(1, 0),
    SHIFT(1, 0, { matrix: true }),
    SHIFT(6, 0, { matrix: true }),
    SHIFT(0, 1, { group: true }),
    { recipe: 'bb-shift', params: { preset: 'two-gross', shift: { a: 3, b: -1 }, matrix: true } },
    { recipe: 'bp-decode', params: { code: 'rep7', error: [3], p: 0.05, iter: 1 } },
    BP(1),
    BP(2),
    BP(3),
    BP(18, { osd: true }),
  ]
  it.each(PICTURES.map((r) => [`${r.recipe} ${JSON.stringify(r.params).slice(0, 90)}`, r] as const))('%s', (_, ref) => {
    const r = runRecipe(ref)
    if (!r.ok) throw new Error(r.problems.join('\n'))
    expect(validateLayout(r.stage)).toEqual([])
    for (const v of Object.values(r.values)) expect(Number.isFinite(v)).toBe(true)
    expect(runRecipe(JSON.parse(JSON.stringify(ref)))).toEqual(r)
  })
})

describe('bad parameters are refused with a path', () => {
  const bad = (ref: unknown) => {
    const r = runRecipe(ref, 'here')
    return r.ok ? [] : r.problems
  }
  it.each<[string, unknown, RegExp]>([
    ['no view data', { recipe: 'qldpc-family', params: { view: 'rate' } }, /params\.d: the rate view needs params\.d/],
    ['an even distance', { recipe: 'qldpc-family', params: { view: 'rate', d: [4] } }, /expected an odd distance/],
    ['codes on the wrong view', { recipe: 'qldpc-family', params: { view: 'table3', codes: ['gross'] } }, /only the kd2n view takes codes/],
    ['neither preset nor spec', { recipe: 'bb-code', params: {} }, /exactly one of params\.preset and params\.spec/],
    ['both preset and spec', { recipe: 'bb-code', params: { preset: 'gross', spec: { l: 3, m: 3, A: [{ dx: 0, dy: 0 }], B: [{ dx: 0, dy: 0 }] } } }, /exactly one/],
    ['too many terms', { recipe: 'bb-code', params: { spec: { l: 3, m: 3, A: [1, 2, 3, 4, 5].map((dx) => ({ dx, dy: 0 })), B: [{ dx: 0, dy: 0 }] } } }, /params\.spec\.A: expected 1 to 4 items/],
    ['a torus too big', { recipe: 'bb-code', params: { spec: { l: 24, m: 24, A: [{ dx: 0, dy: 0 }], B: [{ dx: 0, dy: 0 }] } } }, /at most 400/],
    ['a cell outside the torus', { recipe: 'bb-code', params: { preset: 'gross', check: { kind: 'X', cell: { i: 12, j: 0 } } } }, /outside the 12 × 6 torus/],
    ['long edges without a check', { recipe: 'bb-code', params: { preset: 'gross', longEdges: true } }, /needs params\.check/],
    ['a matrix of a code that is not gross', { recipe: 'bb-code', params: { preset: 'b72', view: 'matrix' } }, /gross or two-gross/],
    ['layers of a two-term code', { recipe: 'bb-code', params: { preset: 'toric-3x3', view: 'layers' } }, /three monomials/],
    ['a distance search past 32 qubits', { recipe: 'bb-code', params: { spec: { l: 6, m: 6, A: [{ dx: 0, dy: 0 }], B: [{ dx: 1, dy: 0 }] }, distance: true } }, /limited to n ≤ 32/],
    ['an unknown preset', { recipe: 'bb-code', params: { preset: 'b999' } }, /expected one of/],
    ['a tableau on the big code', { recipe: 'bb-schedule', params: { preset: 'two-gross', variant: 'printed', tableau: true } }, /at most 72 cells/],
    ['a round past 8', { recipe: 'bb-schedule', params: { preset: 'gross', variant: 'printed', round: 9 } }, /params\.round/],
    ['a bit outside the code', { recipe: 'bp-decode', params: { code: 'rep7', error: [8], p: 0.05, iter: 1 } }, /expected a bit below 7/],
    ['a tie without OSD', { recipe: 'bp-decode', params: { code: 'rep7', error: [1], p: 0.05, iter: 1, tie: 'low' } }, /only with params\.osd/],
    ['a repeated bit', { recipe: 'bp-decode', params: { code: 'rep7', error: [1, 1], p: 0.05, iter: 1 } }, /each bit once/],
    ['a chance of one half', { recipe: 'bp-decode', params: { code: 'rep7', error: [1], p: 0.5, iter: 1 } }, /params\.p/],
    ['a group table of the big code', { recipe: 'bb-shift', params: { preset: 'two-gross', shift: { a: 1, b: 0 }, group: true } }, /'gross' code/],
    ['a shift past the torus', { recipe: 'bb-shift', params: { preset: 'gross', shift: { a: 1, b: 9 } } }, /\|b\| ≤ 6/],
  ])('%s', (_, ref, re) => {
    expect(bad(ref).join('\n')).toMatch(re)
  })
})
