/**
 * The eight surface-code recipes of the background chapter B1 (papers/recipes.qec.ts): every claim value the chapter's plan prints (the numpy ledger of
 * docs/roles/proposals/P-B1-story.md §1.7, checked there by an independent script and here against the recipes), the pictures they return pass the
 * stage kinds' own validators, and bad parameters are refused with a path.
 */
import { describe, expect, it } from 'vitest'
import { validateLayout } from '../stage/resolve'
import '../stage/svg/kinds'
import { runRecipe, type RecipeRef } from './recipes'

const G = 0.6666666666666666 // success 2/3, the chapter's target
const TARGET = { N: 1e9, success: G }
const edge = (i: number, j: number) => ({ dir: 'h' as const, i, j })

type Row = [key: string, ref: RecipeRef, out: string, want: number, digits?: number]
const ROWS: Row[] = [
  // ---- toric
  ['b1ToricN3', { recipe: 'toric-code', params: { L: 3 } }, 'n', 18],
  ['b1ToricStars3', { recipe: 'toric-code', params: { L: 3 } }, 'stars', 9],
  ['b1ToricMaxOverlap', { recipe: 'toric-code', params: { L: 3 } }, 'maxOverlap', 2],
  ['b1ToricRank3', { recipe: 'toric-code', params: { L: 3 } }, 'rankX', 8],
  ['b1ToricK3', { recipe: 'toric-code', params: { L: 3 } }, 'k', 2],
  ['b1ToricN6', { recipe: 'toric-code', params: { L: 6 } }, 'n', 72],
  ['b1ToricRank6', { recipe: 'toric-code', params: { L: 6 } }, 'rankX', 35],
  ['b1ToricK6', { recipe: 'toric-code', params: { L: 6 } }, 'k', 2],
  ['b1ChainLit', { recipe: 'toric-code', params: { L: 4, error: { type: 'Z', edges: [edge(0, 0), edge(1, 0), edge(2, 0)] } } }, 'lit', 2],
  ['b1LoopLit', { recipe: 'toric-code', params: { L: 4, operator: 'z-loop-h', at: 0 } }, 'operatorLit', 0],
  ['b1PlaqStabilizer', { recipe: 'toric-code', params: { L: 4, operator: 'plaquette', at: 1 } }, 'operatorStabilizer', 1],
  ['b1LoopClassSame', { recipe: 'toric-code', params: { L: 4, operator: 'z-loop-h', at: 0, at2: 2 } }, 'sameClass', 1],
  ['b1CutOverlap', { recipe: 'toric-code', params: { L: 4, operator: 'z-loop-h', operator2: 'x-cut-v', at: 0 } }, 'overlap', 1],
  ['b1ToricD3', { recipe: 'toric-code', params: { L: 3, distance: true } }, 'd', 3],
  ['b1ToricD4', { recipe: 'toric-code', params: { L: 4, distance: true } }, 'd', 4],
  ['b1ToricPerLogical5', { recipe: 'toric-code', params: { L: 5 } }, 'perLogical', 25],
  ['b1-t-n', { recipe: 'toric-code', params: { L: 7 } }, 'n', 98],
  ['b1-t-rank', { recipe: 'toric-code', params: { L: 5 } }, 'rankX', 24],
  // ---- patches
  ['b1Rot3Data', { recipe: 'rotated-patch', params: { d: 3 } }, 'data', 9],
  ['b1Rot5Data', { recipe: 'rotated-patch', params: { d: 5 } }, 'data', 25],
  ['b1Rot7Data', { recipe: 'rotated-patch', params: { d: 7 } }, 'data', 49],
  ['b1Rot3Checks', { recipe: 'rotated-patch', params: { d: 3 } }, 'checks', 8],
  ['b1Rot5Checks', { recipe: 'rotated-patch', params: { d: 5 } }, 'checks', 24],
  ['b1Rot7Checks', { recipe: 'rotated-patch', params: { d: 7 } }, 'checks', 48],
  ['b1Rot3Total', { recipe: 'rotated-patch', params: { d: 3 } }, 'total', 17],
  ['b1Rot5Total', { recipe: 'rotated-patch', params: { d: 5 } }, 'total', 49],
  ['b1Rot7Total', { recipe: 'rotated-patch', params: { d: 7 } }, 'total', 97],
  ['b1Rot3W4', { recipe: 'rotated-patch', params: { d: 3 } }, 'w4', 4],
  ['b1Rot5W4', { recipe: 'rotated-patch', params: { d: 5 } }, 'w4', 16],
  ['b1Rot7W4', { recipe: 'rotated-patch', params: { d: 7 } }, 'w4', 36],
  ['b1Rot3W2', { recipe: 'rotated-patch', params: { d: 3 } }, 'w2', 4],
  ['b1Rot5W2', { recipe: 'rotated-patch', params: { d: 5 } }, 'w2', 8],
  ['b1Rot7W2', { recipe: 'rotated-patch', params: { d: 7 } }, 'w2', 12],
  ['b1Rot3K', { recipe: 'rotated-patch', params: { d: 3 } }, 'k', 1],
  ['b1RotD3', { recipe: 'rotated-patch', params: { d: 3, distance: true } }, 'd', 3],
  ['b1RotD5', { recipe: 'rotated-patch', params: { d: 5, distance: true } }, 'd', 5],
  ['b1RotOverlap', { recipe: 'rotated-patch', params: { d: 5, operator: 'xbar' } }, 'overlap', 1],
  ['b1Rot3Lit1', { recipe: 'rotated-patch', params: { d: 3 } }, 'litOne', 6],
  ['b1Rot3Lit2', { recipe: 'rotated-patch', params: { d: 3 } }, 'litTwo', 3],
  ['b1Rot5Lit1', { recipe: 'rotated-patch', params: { d: 5 } }, 'litOne', 10],
  ['b1Rot5Lit2', { recipe: 'rotated-patch', params: { d: 5 } }, 'litTwo', 15],
  ['b1Unrot3Data', { recipe: 'rotated-patch', params: { d: 3, layout: 'planar' } }, 'data', 13],
  ['b1Unrot5Data', { recipe: 'rotated-patch', params: { d: 5, layout: 'planar' } }, 'data', 41],
  ['b1Unrot7Data', { recipe: 'rotated-patch', params: { d: 7, layout: 'planar' } }, 'data', 85],
  ['b1Unrot3Total', { recipe: 'rotated-patch', params: { d: 3, layout: 'planar' } }, 'total', 25],
  ['b1Unrot5Total', { recipe: 'rotated-patch', params: { d: 5, layout: 'planar' } }, 'total', 81],
  ['b1Unrot7Total', { recipe: 'rotated-patch', params: { d: 7, layout: 'planar' } }, 'total', 169],
  ['b1UnrotD3', { recipe: 'rotated-patch', params: { d: 3, layout: 'planar', distance: true } }, 'd', 3],
  ['b1UnrotD5', { recipe: 'rotated-patch', params: { d: 5, layout: 'planar', distance: true } }, 'd', 5],
  ['b1TotalRatio3', { recipe: 'rotated-patch', params: { d: 3 } }, 'ratio', 25 / 17],
  ['b1TotalRatio17', { recipe: 'rotated-patch', params: { d: 3, sizesAt: 17 } }, 'sizesRatio', 1089 / 577],
  ['b1PatchCheckWeight', { recipe: 'rotated-patch', params: { d: 3 } }, 'checkWeight', 4],
  ['b1PatchQubitDegree', { recipe: 'rotated-patch', params: { d: 3 } }, 'qubitDegree', 4],
  ['b1RotPerLogical5', { recipe: 'rotated-patch', params: { d: 5 } }, 'data', 25],
  ['b1-p-total', { recipe: 'rotated-patch', params: { d: 9 } }, 'total', 161],
  ['b1-p-unrot', { recipe: 'rotated-patch', params: { d: 7, layout: 'planar' } }, 'data', 85],
  ['b1-p-w2', { recipe: 'rotated-patch', params: { d: 9 } }, 'w2', 16],
  // ---- small codes
  ['b1TannerNodes', { recipe: 'qec-small-code', params: { code: 'steane7' } }, 'nodes', 13],
  ['b1TannerEdges', { recipe: 'qec-small-code', params: { code: 'steane7' } }, 'edges', 24],
  ['b1ShorCheckWeight', { recipe: 'qec-small-code', params: { code: 'shor9' } }, 'checkWeight', 6],
  ['b1SteaneQubitDegree', { recipe: 'qec-small-code', params: { code: 'steane7' } }, 'qubitDegree', 6],
  // ---- schedules
  ['b1SchedPairs', { recipe: 'check-schedule', params: { d: 3, xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['TL', 'BL', 'TR', 'BR'] } }, 'pairs', 576],
  ['b1SchedConflictFree', { recipe: 'check-schedule', params: { d: 3, xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['TL', 'BL', 'TR', 'BR'] } }, 'pairsConflictFree', 96],
  ['b1SchedValid', { recipe: 'check-schedule', params: { d: 3, xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['TL', 'BL', 'TR', 'BR'] } }, 'pairsValid', 16],
  ['b1SchedBadPairs', { recipe: 'check-schedule', params: { d: 3, xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['BR', 'TR', 'BL', 'TL'] } }, 'badPairs', 8],
  ['b1DcircGood', { recipe: 'check-schedule', params: { d: 3, xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['TL', 'BL', 'TR', 'BR'], distance: true } }, 'dCirc', 3],
  ['b1FaultEvents', { recipe: 'check-schedule', params: { d: 3, xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['TL', 'BL', 'TR', 'BR'], distance: true } }, 'faultEvents', 1470],
  ['b1SigGood', { recipe: 'check-schedule', params: { d: 3, xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['TL', 'BL', 'TR', 'BR'], distance: true } }, 'signatures', 221],
  ['b1DcircBad', { recipe: 'check-schedule', params: { d: 3, xOrder: ['TL', 'BL', 'TR', 'BR'], zOrder: ['TL', 'TR', 'BL', 'BR'], distance: true } }, 'dCirc', 2],
  ['b1SigBad', { recipe: 'check-schedule', params: { d: 3, xOrder: ['TL', 'BL', 'TR', 'BR'], zOrder: ['TL', 'TR', 'BL', 'BR'], distance: true } }, 'signatures', 197],
  // ---- check circuit
  ['b1CheckLocations', { recipe: 'check-circuit', params: { type: 'X' } }, 'locations', 14],
  ['b1CheckN', { recipe: 'check-circuit', params: { type: 'X' } }, 'n', 210],
  ['b1CheckExpected', { recipe: 'check-circuit', params: { type: 'X' } }, 'expected', 14],
  ['b1CheckEvents', { recipe: 'check-circuit', params: { type: 'X' } }, 'events', 86],
  ['b1HookAfter2', { recipe: 'check-circuit', params: { type: 'X' } }, 'hookData2', 2],
  ['b1HookEffMax', { recipe: 'check-circuit', params: { type: 'X' } }, 'hookEffMax', 2],
  // ---- space-time
  ['b1StLitData', { recipe: 'repetition-history', params: { n: 5, rounds: 4, faults: [{ kind: 'data', at: 2, t: 2 }] } }, 'lit', 2],
  ['b1StLitMeas', { recipe: 'repetition-history', params: { n: 5, rounds: 4, faults: [{ kind: 'meas', at: 1, t: 2 }] } }, 'lit', 2],
  ['b1StLitEdge', { recipe: 'repetition-history', params: { n: 5, rounds: 4, faults: [{ kind: 'data', at: 0, t: 2 }] } }, 'lit', 1],
  ['b1StMatchWeight', { recipe: 'repetition-history', params: { n: 5, rounds: 4, faults: [{ kind: 'data', at: 2, t: 2 }, { kind: 'meas', at: 0, t: 3 }], decode: true } }, 'matchWeight', 2],
  ['b1StFail3', { recipe: 'repetition-history', params: { n: 3, rounds: 3, faults: [{ kind: 'data', at: 0, t: 2 }, { kind: 'data', at: 1, t: 2 }], decode: true } }, 'failed', 1],
  ['b1StFail5', { recipe: 'repetition-history', params: { n: 5, rounds: 3, faults: [{ kind: 'data', at: 0, t: 2 }, { kind: 'data', at: 1, t: 2 }], decode: true } }, 'failed', 0],
  ['b1Rep3Edges', { recipe: 'repetition-history', params: { n: 3, rounds: 3, spectrum: true, maxW: 2 } }, 'edges', 15],
  ['b1Rep3W1Bad', { recipe: 'repetition-history', params: { n: 3, rounds: 3, spectrum: true, maxW: 2 } }, 'w1Bad', 0],
  ['b1Rep3W2Total', { recipe: 'repetition-history', params: { n: 3, rounds: 3, spectrum: true, maxW: 2 } }, 'w2Total', 105],
  ['b1Rep3W2Fail', { recipe: 'repetition-history', params: { n: 3, rounds: 3, spectrum: true, maxW: 2 } }, 'w2Fail', 9],
  ['b1Rep3W2Tie', { recipe: 'repetition-history', params: { n: 3, rounds: 3, spectrum: true, maxW: 2 } }, 'w2Tie', 28],
  ['b1Rep3PL', { recipe: 'repetition-history', params: { n: 3, rounds: 3, spectrum: true, maxW: 1, full: true, pAt: 0.01 } }, 'pL', 0.002207511366157851],
  ['b1Rep5Edges', { recipe: 'repetition-history', params: { n: 5, rounds: 5, spectrum: true, maxW: 3 } }, 'edges', 45],
  ['b1Rep5W2Bad', { recipe: 'repetition-history', params: { n: 5, rounds: 5, spectrum: true, maxW: 3 } }, 'w2Bad', 0],
  ['b1Rep5W3Total', { recipe: 'repetition-history', params: { n: 5, rounds: 5, spectrum: true, maxW: 3 } }, 'w3Total', 14190],
  ['b1Rep5W3Fail', { recipe: 'repetition-history', params: { n: 5, rounds: 5, spectrum: true, maxW: 3 } }, 'w3Fail', 50],
  ['b1Rep5W3Tie', { recipe: 'repetition-history', params: { n: 5, rounds: 5, spectrum: true, maxW: 3 } }, 'w3Tie', 400],
  ['b1-s-w2', { recipe: 'repetition-history', params: { n: 3, rounds: 3, spectrum: true, maxW: 2 } }, 'w2Bad', 37],
  // ---- curves
  ['b1CleanRun1000', { recipe: 'logical-error-curves', params: { family: 'clean-run', p: 0.001, markers: [1000, 10000] } }, 'cleanRun1000', 0.36769542477096373],
  ['b1CleanRun10000', { recipe: 'logical-error-curves', params: { family: 'clean-run', p: 0.001, markers: [1000, 10000] } }, 'cleanRun10000', 4.517335e-5, 6],
  ['b1Budget', { recipe: 'logical-error-curves', params: { family: 'budget', target: TARGET } }, 'budget', 4.05465108e-10, 8],
  ['b1ExpFaults', { recipe: 'logical-error-curves', params: { family: 'clean-run', p: 0.001, target: TARGET } }, 'expFaults', 1e6],
  ['b1RepD3', { recipe: 'logical-error-curves', params: { family: 'repetition', p: 0.01, d: [3, 5, 7, 9, 11, 13] } }, 'repD3', 2.9800e-4, 6],
  ['b1RepD5', { recipe: 'logical-error-curves', params: { family: 'repetition', p: 0.01, d: [3, 5, 7, 9, 11, 13] } }, 'repD5', 9.8506e-6, 8],
  ['b1RepD7', { recipe: 'logical-error-curves', params: { family: 'repetition', p: 0.01, d: [3, 5, 7, 9, 11, 13] } }, 'repD7', 3.4167e-7, 10],
  ['b1RepD13', { recipe: 'logical-error-curves', params: { family: 'repetition', p: 0.01, d: [3, 5, 7, 9, 11, 13] } }, 'repD13', 1.6279e-11, 14],
  ['b1RepDneeded', { recipe: 'logical-error-curves', params: { family: 'repetition', p: 0.01, target: TARGET } }, 'repDNeeded', 13],
  ['b1RepDneeded01', { recipe: 'logical-error-curves', params: { family: 'repetition', p: 0.1, target: TARGET } }, 'repDNeeded', 37],
  ['b1FitA10D7', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', p: 0.001, d: [7, 11, 17] } }, 'fitA10D7', 9.4868e-6, 9],
  ['b1FitA10D11', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', p: 0.001, d: [7, 11, 17] } }, 'fitA10D11', 9.4868e-8, 11],
  ['b1FitA10D17', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', p: 0.001, d: [7, 11, 17] } }, 'fitA10D17', 9.4868e-11, 14],
  ['b1Fit26D17', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-2.6', p: 0.001, d: [17] } }, 'fit26D17', 3.16228e-10, 13],
  ['b1FitBev22D17', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'bev22', p: 0.001, d: [17] } }, 'fitBev22D17', 3.0e-11, 14],
  ['b1FitRatio', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'all', p: 0.001, d: [17] } }, 'fitRatio', Math.sqrt(10), 12],
  ['b1Lambda', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', p: 0.001 } }, 'lambdaA10', 10, 10],
  ['b1LambdaP5e3', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', p: 0.005 } }, 'lambdaA10', 2, 10],
  ['b1DneedA10', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'all', p: 0.001, target: TARGET } }, 'dNeededA10', 17],
  ['b1Dneed26', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'all', p: 0.001, target: TARGET } }, 'dNeeded26', 17],
  ['b1DneedBev22', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'all', p: 0.001, target: TARGET } }, 'dNeededBev22', 15],
  ['b1QubitsD17', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', d: [17] } }, 'qubitsD17', 577],
  ['b1QubitsD15', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', d: [15] } }, 'qubitsD15', 449],
  ['b1Steps1000P1e3', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', p: 0.001, suppress: 1000 } }, 'stepsA10', 3],
  ['b1Steps1000P5e3', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', p: 0.005, suppress: 1000 } }, 'stepsA10', 10],
  ['b1-c-clean', { recipe: 'logical-error-curves', params: { family: 'clean-run', p: 0.002, markers: [500] } }, 'cleanRun500', 0.998 ** 500, 12],
  ['b1-c-budget', { recipe: 'logical-error-curves', params: { family: 'budget', target: { N: 1e6, success: 0.5 } } }, 'budget', 6.931469e-7, 9],
  ['b1-h-d17', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', p: 0.001, d: [17] } }, 'fitA10D17', 9.4868e-11, 14],
  ['b1-h-lambda', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', p: 0.002 } }, 'lambdaA10', 5, 10],
  ['b1-h-qubits', { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', d: [15] } }, 'qubitsD15', 449],
  // ---- frames
  ['b1FrameWeightX', { recipe: 'pauli-frame', params: { qubits: 2, gates: [{ gate: 'CNOT', control: 0, target: 1 }], frame: 'XI' } }, 'weight1', 2],
  ['b1FrameWeightZ', { recipe: 'pauli-frame', params: { qubits: 2, gates: [{ gate: 'CNOT', control: 0, target: 1 }], frame: 'IZ' } }, 'weight1', 2],
]

describe('the plan’s claim ledger, through the recipes', () => {
  it.each(ROWS.map((r) => [r[0], r] as const))('%s', (_, [, ref, out, want, digits]) => {
    const r = runRecipe(ref, out)
    if (!r.ok) throw new Error(r.problems.join('\n'))
    expect(r.values[out], `${ref.recipe}.${out}`).toBeDefined()
    // integers must be exact; a decimal is compared to the plan's printed figure (4–5 significant digits); the numpy twins hold the 1e-12 comparison
    const rel = Math.abs(r.values[out] - want) / Math.max(Math.abs(want), 1e-300)
    expect(rel, `${ref.recipe}.${out} = ${r.values[out]}, plan ${want}`).toBeLessThan(Number.isInteger(want) ? 1e-12 : digits === undefined ? 1e-9 : 6e-4)
  })
})

describe('each recipe’s picture is a state its stage kind accepts', () => {
  const PICTURES: RecipeRef[] = [
    { recipe: 'toric-code', params: { L: 3, view: 'torus' } },
    { recipe: 'toric-code', params: { L: 3, view: 'tanner' } },
    { recipe: 'toric-code', params: { L: 4, error: { type: 'Z', edges: [edge(0, 0), edge(1, 0), edge(2, 0)] }, show: ['syndrome'] } },
    { recipe: 'toric-code', params: { L: 4, operator: 'z-loop-h', operator2: 'x-cut-v', at: 0, show: ['logical'] } },
    { recipe: 'toric-code', params: { L: 6, show: ['stars'] } },
    { recipe: 'rotated-patch', params: { d: 3, show: ['weights'] } },
    { recipe: 'rotated-patch', params: { d: 5, operator: 'xbar', show: ['logical'] } },
    { recipe: 'rotated-patch', params: { d: 3, layout: 'planar' } },
    { recipe: 'rotated-patch', params: { d: 5, error: { type: 'X', qubits: [7] }, show: ['syndrome'] } },
    { recipe: 'qec-small-code', params: { code: 'steane7', view: 'tanner' } },
    { recipe: 'qec-small-code', params: { code: 'shor9', view: 'checks' } },
    { recipe: 'check-schedule', params: { d: 3, xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['BR', 'TR', 'BL', 'TL'] } },
    { recipe: 'check-circuit', params: { type: 'X' } },
    { recipe: 'check-circuit', params: { type: 'X', show: ['faults'] } },
    { recipe: 'check-circuit', params: { type: 'X', show: ['hook'], hookAfter: 2 } },
    { recipe: 'check-circuit', params: { type: 'Z', weight: 2, show: ['faults', 'hook'], hookAfter: 1 } },
    { recipe: 'repetition-history', params: { n: 5, rounds: 4, faults: [{ kind: 'data', at: 2, t: 2 }] } },
    { recipe: 'repetition-history', params: { n: 3, rounds: 3, faults: [{ kind: 'data', at: 0, t: 2 }, { kind: 'data', at: 1, t: 2 }], decode: true } },
    { recipe: 'repetition-history', params: { n: 5, rounds: 5, spectrum: true, maxW: 3 } },
    { recipe: 'repetition-history', params: { n: 5, rounds: 4, sample: { p: 0.05, q: 0.05, seed: 3 } } },
    { recipe: 'logical-error-curves', params: { family: 'clean-run', p: 0.001, markers: [1000, 10000] } },
    { recipe: 'logical-error-curves', params: { family: 'clean-run', target: TARGET } },
    { recipe: 'logical-error-curves', params: { family: 'repetition', p: 0.01, x: 'd', d: [3, 5, 7, 9, 11, 13], target: TARGET } },
    { recipe: 'logical-error-curves', params: { family: 'repetition', x: 'p', d: [3, 5, 7], reportedMarks: [{ id: 'den02-pc', x: 0.1094, label: 'p_c' }] } },
    { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'tdg-A10', x: 'p', d: [7, 9, 11, 17] } },
    { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'all', x: 'p', d: [17] } },
    { recipe: 'logical-error-curves', params: { family: 'surface', preset: 'all', x: 'd', p: 0.001, target: TARGET } },
    { recipe: 'pauli-frame', params: { qubits: 2, gates: [{ gate: 'CNOT', control: 0, target: 1 }], frame: 'XI', upTo: 1 } },
  ]
  it.each(PICTURES.map((r) => [`${r.recipe} ${JSON.stringify(r.params).slice(0, 90)}`, r] as const))('%s', (_, ref) => {
    const r = runRecipe(ref)
    if (!r.ok) throw new Error(r.problems.join('\n'))
    expect(validateLayout(r.stage)).toEqual([])
    for (const v of Object.values(r.values)) expect(Number.isFinite(v)).toBe(true)
    expect(runRecipe(JSON.parse(JSON.stringify(ref)))).toEqual(r) // pure
  })
})

describe('bad parameters are refused with a path', () => {
  const bad = (ref: unknown) => {
    const r = runRecipe(ref, 'here')
    return r.ok ? [] : r.problems
  }
  it.each<[string, unknown, RegExp]>([
    ['a toric edge outside the torus', { recipe: 'toric-code', params: { L: 3, error: { type: 'Z', edges: [{ dir: 'h', i: 3, j: 0 }] } } }, /params\.error\.edges\[0\]: vertex \(3, 0\) is outside the 3 × 3 torus/],
    ['syndrome without an error', { recipe: 'toric-code', params: { L: 3, show: ['syndrome'] } }, /'syndrome' needs params\.error/],
    ['a Tanner picture of a big torus', { recipe: 'toric-code', params: { L: 6, view: 'tanner' } }, /at most 25 qubits/],
    ['an even patch distance', { recipe: 'rotated-patch', params: { d: 4 } }, /expected an odd distance/],
    ['a planar patch past d = 7', { recipe: 'rotated-patch', params: { d: 9, layout: 'planar' } }, /d = 3, 5, 7/],
    ['a distance search past d = 5', { recipe: 'rotated-patch', params: { d: 7, distance: true } }, /limited to d ≤ 5/],
    ['a schedule that repeats a corner', { recipe: 'check-schedule', params: { d: 3, xOrder: ['TL', 'TL', 'BL', 'BR'], zOrder: ['TL', 'TR', 'BL', 'BR'] } }, /params\.xOrder: lists a corner twice/],
    ['a circuit distance for d = 5', { recipe: 'check-schedule', params: { d: 5, xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['TL', 'BL', 'TR', 'BR'], distance: true } }, /d = 3 only/],
    ['a check of weight 3', { recipe: 'check-circuit', params: { type: 'X', weight: 3 } }, /weight 2 or 4/],
    ['a hook without its position', { recipe: 'check-circuit', params: { type: 'X', show: ['hook'] } }, /needs params\.hookAfter/],
    ['a fault outside the history', { recipe: 'repetition-history', params: { n: 3, rounds: 2, faults: [{ kind: 'meas', at: 2, t: 1 }] } }, /expected a check below 2/],
    ['faults and a spectrum together', { recipe: 'repetition-history', params: { n: 3, rounds: 2, spectrum: true, faults: [{ kind: 'data', at: 0, t: 1 }] } }, /draw no single history/],
    ['a spectrum too big for weight 3', { recipe: 'repetition-history', params: { n: 9, rounds: 6, spectrum: true, maxW: 3 } }, /limited to 45 fault places/],
    ['a full enumeration of 45 fault places', { recipe: 'repetition-history', params: { n: 5, rounds: 5, spectrum: true, full: true } }, /limited to 15 fault places/],
    ['more than 14 lit detectors to match', { recipe: 'repetition-history', params: { n: 9, rounds: 6, decode: true, sample: { p: 0.5, q: 0.5, seed: 1 } } }, /the engine refused these parameters .*14/],
    ['a clean run without p', { recipe: 'logical-error-curves', params: { family: 'clean-run' } }, /needs the per-step chance p/],
    ['an even vote size', { recipe: 'logical-error-curves', params: { family: 'repetition', p: 0.01, d: [4] } }, /expected odd distances/],
    ['a preset on the wrong family', { recipe: 'logical-error-curves', params: { family: 'repetition', p: 0.01, preset: 'bev22' } }, /only with family 'surface'/],
    ['a frame of the wrong length', { recipe: 'pauli-frame', params: { qubits: 2, gates: [{ gate: 'H', target: 0 }], frame: 'XXX' } }, /expected 2 letters/],
    ['a CNOT without its control', { recipe: 'pauli-frame', params: { qubits: 2, gates: [{ gate: 'CNOT', target: 1 }], frame: 'XI' } }, /CNOT needs a control wire/],
  ])('%s', (_, ref, re) => {
    expect(bad(ref).join('\n')).toMatch(re)
  })
})
