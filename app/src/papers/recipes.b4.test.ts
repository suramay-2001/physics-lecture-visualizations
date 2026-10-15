/**
 * The eleven magic-state and Pauli-based recipes of the background chapter B4 (papers/recipes.qec.ts): every claim and challenge value the chapter prints (the numpy twins of
 * pipeline/claims_papers/b4.py check the same values to 1e-12; here each is pinned to the digits the page shows), the pictures they return pass the stage kinds' own validators,
 * and bad parameters are refused with a path.
 */
import { describe, expect, it, vi } from 'vitest'
import { validateLayout } from '../stage/resolve'
import '../stage/svg/kinds'
import { runRecipe, type RecipeRef } from './recipes'

vi.setConfig({ testTimeout: 120_000 })

const co = (extra = {}): RecipeRef => ({ recipe: 'clifford-orbit', params: { state: 't-plus', ...extra } }) as RecipeRef
const ht: RecipeRef = { recipe: 'ht-powers', params: { nmax: 1000 } }
const pc = (preset: string, upTo: number): RecipeRef => ({ recipe: 'pauli-compile', params: { preset, upTo } }) as RecipeRef
const mr = (extra = {}): RecipeRef => ({ recipe: 'measure-then-rotate', params: { wires: 2, p: 'XX', q: 'ZI', outcome: 0, ...extra } }) as RecipeRef
const ti = (extra = {}): RecipeRef => ({ recipe: 't-injection', params: { psi: 'real', branch: 0, ...extra } }) as RecipeRef
const ip = (extra: object): RecipeRef => ({ recipe: 'inject-program', params: extra }) as RecipeRef
const fc = (extra = {}): RecipeRef => ({ recipe: 'fifteen-code', params: extra }) as RecipeRef
const d15 = (eps: number, extra = {}): RecipeRef => ({ recipe: 'distill-15', params: { eps, show: 'curve', ...extra } }) as RecipeRef
const pt = (extra: object): RecipeRef => ({ recipe: 'postselect-time', params: extra }) as RecipeRef
const gc = (cut: number, extra = {}): RecipeRef => ({ recipe: 'gap-cutoff', params: { n: 7, p: 0.1, cut, ...extra } }) as RecipeRef
const tc = (extra: object): RecipeRef => ({ recipe: 't-count-law', params: extra }) as RecipeRef
const REPORTED = { d3: [0.35, 0.8], d5: [0.85, 0.99] }

type Row = [key: string, ref: RecipeRef, out: string, want: number, digits?: number]
const ROWS: Row[] = [
  // ---- b4-beyond-clifford
  ['b4CliffordCount', co(), 'count', 24],
  ['b4OrbitStab', co(), 'orbitStab', 6],
  ['b4L1Magic', co(), 'l1Magic', Math.SQRT2, 12],
  ['b4OrbitH', co({ marks: ['orbit'] }), 'orbitH', 12],
  ['b4OrbitT', co({ state: 't-type', marks: ['orbit'] }), 'orbitT', 8],
  ['b4L1TType', co({ state: 't-type' }), 'l1TType', Math.sqrt(3), 12],
  ['b4OctaEdge', co(), 'edge', 0.5 * (1 - Math.SQRT1_2), 12],
  ['b4EdgeLen', co(), 'edgeLen', Math.SQRT1_2, 12],
  ['b4Len07', co({ hull: true, eps: 0.15 }), 'length', 0.7, 12],
  ['b4Len075', co({ hull: true, eps: 0.125 }), 'length', 0.75, 12],
  ['b4DepolInside', co({ hull: true, eps: 0.15 }), 'l1Shown', 0.7 * Math.SQRT2, 12],
  ['b4DepolInside inside', co({ hull: true, eps: 0.15 }), 'inside', 1],
  ['b4L1Out', co({ hull: true, eps: 0.125 }), 'l1Shown', 0.75 * Math.SQRT2, 12],
  ['b4L1Out outside', co({ hull: true, eps: 0.125 }), 'inside', 0],
  ['b4HTAngleDeg', ht, 'angleDeg', 148.6003, 3],
  ['b4HTTurns', ht, 'turns', 0.4128, 3],
  ['b4HTClose1', ht, 'close1', 0.2004, 3],
  ['b4HTClose2', ht, 'close2', 0.01586, 4],
  ['b4HTClose3', ht, 'close3', 0.0010367, 6],
  // ---- b4-pbc
  ['b4ConjChanged', pc('z-then-x', 1), 'conjChanged', 2],
  ['b4TextbookGates', pc('toffoli-textbook', 0), 'gates', 15],
  ['b4ToffoliRots', pc('toffoli-textbook', 15), 'rotations', 7],
  ['b4FinalIdentity', pc('toffoli-textbook', 15), 'finalIdentity', 1],
  ['b4ToffoliDepth', pc('toffoli-textbook', 15), 'layers', 1],
  ['b4ToffoliSame', pc('toffoli-phase', 9), 'sameSet', 1],
  ['b4HChanged', pc('toffoli-phase', 9), 'changed', 4],
  ['phase form is the Toffoli', pc('toffoli-phase', 9), 'isToffoli', 1],
  ['textbook is the Toffoli', pc('toffoli-textbook', 3), 'isToffoli', 1],
  ['dense product equals the circuit', pc('toffoli-textbook', 15), 'equivalent', 1],
  ['b4CnotRotations', pc('cnot', 3), 'gates', 3],
  ['b4CnotMatches', pc('cnot', 3), 'matchesCnot', 1],
  ['textbook changed', pc('toffoli-textbook', 15), 'changed', 5],
  ['b4AbsorbBad', mr(), 'sweepBad', 0],
  ['b4AbsorbCases', mr(), 'cases', 240],
  ['absorb bad flag', mr({ p: 'ZZ', q: 'XI', outcome: 1 }), 'bad', 0],
  ['absorb clash', mr(), 'clash', 1],
  ['b4AbsorbHalf', mr(), 'pOutcome', 0.5, 12],
  // ---- b4-injection
  ['b4InjectProb', ti(), 'prob', 0.5, 12],
  ['b4InjectPhase', ti(), 'phase', 45, 6],
  ['reading 1 gives T†', ti({ branch: 1 }), 'phase', -45, 6],
  ['b4InjectFid', ti({ branch: 1, fix: true }), 'fidelity', 1, 12],
  ['plus input prob', ti({ psi: 'plus', branch: 1 }), 'prob', 0.5, 12],
  ['b4InjectProbs', ip({ pauli: 'XZ', s: 0, t: 0 }), 'prob', 0.25, 12],
  ['injection post-state', ip({ pauli: 'ZYX' }), 'sweepDev', 0, 9],
  ['injection sweep paulis', ip({ pauli: 'Z' }), 'sweepPaulis', 11],
  ['b4AxisSwap', ip({ axes: ['Z', 'X'], outcomes: '10' }), 'swap', 1],
  ['b4AxisHistories', ip({ axes: ['Z', 'X', 'Z', 'X'], outcomes: '1000' }), 'histories', 8],
  ['16 histories', ip({ axes: ['Z', 'X', 'Z', 'X'], outcomes: '1000' }), 'total', 16],
  ['b4AxisSame', ip({ axes: ['Z', 'Z', 'Z'], outcomes: '111' }), 'histories', 1],
  // ---- b4-distill
  ['b4BlochLen', d15(0.01), 'blochLen', 0.98, 12],
  ['b4XChecks', fc(), 'xChecks', 4],
  ['b4XWeight', fc(), 'xWeight', 8],
  ['b4ZChecks', fc(), 'zChecks', 10],
  ['b4D15X', fc(), 'dX', 7],
  ['b4D15Z', fc(), 'dZ', 3],
  ['b4TransPhase', fc(), 'phase', -45],
  ['b4Weight3', fc(), 'a3', 35],
  ['b4Weight4', fc(), 'a4', 105],
  ['2048 patterns pass', fc(), 'accepted', 2048],
  ['b4Lead35', d15(1e-3), 'lead', 1.003, 3],
  ['b4Accept1e2', d15(0.01), 'accept', 0.8601, 4],
  ['b4Out1e2M', d15(0.01), 'outM', 3.6088, 3],
  ['b4Out1e2E', d15(0.01), 'outE', -5],
  ['b4Accept1e3', d15(1e-3), 'accept', 0.9851, 4],
  ['b4Out1e3M', d15(1e-3), 'outM', 3.5105, 3],
  ['b4Level2M', d15(1e-3, { rounds: 2 }), 'level2M', 1.5142, 3],
  ['b4Level2E', d15(1e-3, { rounds: 2 }), 'level2E', -21],
  ['b4Threshold', d15(0.01), 'threshold', 0.14148, 4],
  ['b4InputsPer', d15(1e-3), 'inputsPer', 15.2268, 3],
  ['b4Lead35p4M', d15(1e-4), 'lead35M', 3.5, 9],
  ['b4Lead35p4E', d15(1e-4), 'lead35E', -11],
  ['accept curve', d15(0.01, { show: 'accept' }), 'accept', 0.8601, 4],
  ['pattern view', d15(0.01, { show: 'pattern' }), 'a3', 35],
  // ---- b4-cultivate
  ['b4Mean5', pt({ mode: 'tries', keep: 0.2 }), 'mean', 5, 9],
  ['series agrees', pt({ mode: 'tries', keep: 0.2 }), 'series', 5, 6],
  ['b4S1', pt({ mode: 'staged', keep: 0.2, s1: 0.5, t: [10, 4] }), 's1', 0.5, 12],
  ['b4S2', pt({ mode: 'staged', keep: 0.2, s1: 0.5, t: [10, 4] }), 's2', 0.4, 9],
  ['b4StagedTime', pt({ mode: 'staged', keep: 0.2, s1: 0.5, t: [10, 4] }), 'time', 60, 9],
  ['b4StagedNoAbort', pt({ mode: 'staged', keep: 0.2, s1: 0.5, t: [10, 4] }), 'timeNoAbort', 70, 9],
  ['early drop saves 10', pt({ mode: 'staged', keep: 0.2, s1: 0.5, t: [10, 4] }), 'saved', 10, 9],
  ['b4Esc3', pt({ mode: 'reported', ...REPORTED }), 'esc3', 0.6923077, 6],
  ['b4Esc5', pt({ mode: 'reported', ...REPORTED }), 'esc5', 0.9333333, 6],
  ['b4Keep3', pt({ mode: 'reported', ...REPORTED }), 'keep3', 0.2, 12],
  ['b4Keep5', pt({ mode: 'reported', ...REPORTED }), 'keep5', 0.01, 12],
  ['b4Tries3', pt({ mode: 'reported', ...REPORTED }), 'tries3', 5, 9],
  ['b4Tries5', pt({ mode: 'reported', ...REPORTED }), 'tries5', 100, 9],
  ['b4AttemptRatio', pt({ mode: 'reported', ...REPORTED }), 'ratio', 20, 9],
  ['b4GapNoCutM', gc(3), 'noCutM', 2.728, 3],
  ['b4GapKeep3', gc(3), 'keep', 0.974485, 6],
  ['b4GapErr3M', gc(3), 'errM', 1.8112, 3],
  ['b4GapErr3E', gc(3), 'errE', -4],
  ['b4GapKeep5', gc(5), 'keep', 0.850312, 6],
  ['b4GapErr5M', gc(5), 'errM', 7.5266, 3],
  ['b4GapKeep7', gc(7), 'keep', 0.478297, 6],
  ['b4GapErr7M', gc(7), 'errM', 2.0908, 3],
  ['no cut: error equals the plain failure chance', gc(1), 'err', 0.002728, 9],
  // ---- b4-synthesis
  ['b4TCountSets0', tc({ show: 'counts' }), 'sets0', 24],
  ['b4TCountSets1', tc({ show: 'counts' }), 'sets1', 96],
  ['b4TCountSets2', tc({ show: 'counts' }), 'sets2', 240],
  ['b4TCountSets3', tc({ show: 'counts' }), 'sets3', 528],
  ['b4TCountSets4', tc({ show: 'counts' }), 'sets4', 1104],
  ['b4TCountSets5', tc({ show: 'counts' }), 'sets5', 2256],
  ['b4TCountSets6', tc({ show: 'counts' }), 'sets6', 4560],
  ['b4TCountSlope', tc({ show: 'error', phi: 1, kmax: 11 }), 'slope', 0.2683, 3],
  ['best error of Rz(1) at k=11', tc({ show: 'error', phi: 1, kmax: 11 }), 'err', 0.0216, 3],
  ['b4TExact', tc({ show: 'error', phi: Math.PI / 4, kmax: 3 }), 'exact', 1],
  ['b4Pi8Err', tc({ show: 'error', phi: Math.PI / 8, kmax: 3 }), 'err', 0.196, 3],
  ['Rz(pi/8) is not exact', tc({ show: 'error', phi: Math.PI / 8, kmax: 3 }), 'exact', 0],
  ['b4LawEps3', tc({ show: 'law' }), 'law3', 29.897, 3],
  ['b4LawEps6', tc({ show: 'law' }), 'law6', 59.7947, 3],
  ['b4LawEps10', tc({ show: 'law' }), 'law10', 99.658, 3],
  ['b4LawDecade', tc({ show: 'law' }), 'decade', 9.9658, 3],
]

const run = (ref: RecipeRef) => {
  const r = runRecipe(ref, 'here')
  if (!r.ok) throw new Error(r.problems.join('\n'))
  return r
}

describe('B4 recipes: every value of the plan ledger', () => {
  it.each(ROWS)('%s', (key, ref, out, want, digits = 9) => {
    const got = run(ref).values[out]
    expect(got, `${key} ${out}`).toBeDefined()
    expect(got).toBeCloseTo(want, digits)
  })
})

describe('B4 recipes: every stage they return passes its kind validator', () => {
  const refs: RecipeRef[] = [
    co(), co({ marks: ['stabilizer6', 'orbit'], hull: true }), co({ state: 't-type', marks: ['orbit'] }), co({ state: 'zero', marks: ['stabilizer6'] }), co({ hull: true, eps: 0.15 }),
    ht, { recipe: 'ht-powers', params: { nmax: 100 } } as RecipeRef,
    pc('toffoli-textbook', 0), pc('toffoli-textbook', 5), pc('toffoli-textbook', 15), pc('toffoli-phase', 0), pc('toffoli-phase', 9), pc('cnot', 3), pc('z-then-x', 1), pc('z-then-x', 2),
    mr(), mr({ wires: 3, p: 'XXI', q: 'IZI', outcome: 1 }),
    ti(), ti({ branch: 1, fix: true }), ti({ psi: 'plus', cursor: 2 }), ti({ only: 'circuit' }), ti({ only: 'amplitudes', cursor: 3 }),
    ip({ pauli: 'ZX', s: 0, t: 0 }), ip({ pauli: 'XZ' }), ip({ axes: ['Z', 'X', 'Z', 'X'], outcomes: '1000' }), ip({ axes: ['Z', 'Z', 'Z'], outcomes: '000' }),
    fc(), fc({ show: 'HZ' }), fc({ show: 'both', row: 5 }), fc({ row: 2 }),
    d15(0.01), d15(1e-3, { rounds: 2 }), d15(0.01, { show: 'accept' }), d15(0.01, { show: 'pattern' }),
    pt({ mode: 'tries', keep: 0.2 }), pt({ mode: 'staged', keep: 0.2, s1: 0.5, t: [10, 4] }), pt({ mode: 'reported', ...REPORTED }),
    gc(3), gc(7), gc(1), tc({ show: 'counts' }), tc({ show: 'law' }), tc({ show: 'error', phi: 1, kmax: 11 }), tc({ show: 'error', phi: Math.PI / 8, kmax: 3 }),
  ]
  it.each(refs.map((r, i) => [i, JSON.stringify(r).slice(0, 100), r] as const))('%s %s', (_i, _label, ref) => {
    const r = run(ref)
    expect(validateLayout(r.stage)).toEqual([])
  })
  it('every output is a finite number', () => {
    for (const ref of refs) for (const [k, v] of Object.entries(run(ref).values)) expect(Number.isFinite(v), `${JSON.stringify(ref).slice(0, 60)} ${k}`).toBe(true)
  })
})

describe('B4 recipes: bad parameters are refused with a path', () => {
  const bad = (ref: unknown): string => {
    const r = runRecipe(ref, 'here')
    return r.ok ? '' : r.problems.join(' | ')
  }
  it('rules between parameters', () => {
    expect(bad(pc('cnot', 4))).toMatch(/params\.upTo/)
    expect(bad(pc('toffoli-textbook', 16))).toMatch(/params\.upTo|expected/)
    expect(bad(mr({ p: 'XXX' }))).toMatch(/params\.p/)
    expect(bad(mr({ p: 'ZZ', q: 'ZI' }))).toMatch(/params\.q: .* commutes/)
    expect(bad(ti({ branch: 0, fix: true }))).toMatch(/params\.fix/)
    expect(bad(ti({ cursor: 5 }))).toMatch(/params\.cursor/)
    expect(bad(ip({ pauli: 'ZX', axes: ['Z'], outcomes: '0' }))).toMatch(/params\.pauli/)
    expect(bad(ip({ axes: ['Z', 'X'], outcomes: '1' }))).toMatch(/params\.outcomes/)
    expect(bad(ip({}))).toMatch(/params\.pauli/)
    expect(bad(fc({ row: 4 }))).toMatch(/params\.row/)
    expect(bad(pt({ mode: 'tries' }))).toMatch(/params\.keep/)
    expect(bad(pt({ mode: 'staged', keep: 0.5, s1: 0.2, t: [10, 4] }))).toMatch(/params\.s1/)
    expect(bad(pt({ mode: 'reported', d3: [0.5, 0.2], d5: [0.1, 0.2] }))).toMatch(/params\.d3/)
    expect(bad(gc(4))).toMatch(/params\.cut/)
    expect(bad({ recipe: 'gap-cutoff', params: { n: 6, p: 0.1, cut: 3 } })).toMatch(/params\.n/)
  })
  it('unknown fields and values never reach the engine', () => {
    expect(bad({ recipe: 'clifford-orbit', params: { state: 'cat' } })).toMatch(/params\.state/)
    expect(bad({ recipe: 'pauli-compile', params: { preset: 'toffoli-big', upTo: 1 } })).toMatch(/params\.preset/)
    expect(bad({ recipe: 'distill-15', params: { eps: 0.9, show: 'curve' } })).toMatch(/params\.eps/)
    expect(bad({ recipe: 't-count-law', params: { show: 'error', kmax: 13 } })).toMatch(/params\.kmax/)
    expect(bad({ recipe: 'ht-powers', params: { nmax: 100000 } })).toMatch(/params\.nmax/)
    expect(bad({ recipe: 'inject-program', params: { axes: ['Q'], outcomes: '0' } })).toMatch(/params\.axes/)
  })
})
