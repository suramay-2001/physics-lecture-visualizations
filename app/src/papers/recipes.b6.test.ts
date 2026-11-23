/**
 * The seven B6 recipes (papers/recipes.b6.ts): every output the chapter prints agrees with the numpy twin (pipeline/claims_papers/b6.py) at 1e-12, every challenge answer is the
 * independent value, every stage a recipe returns passes its kind's validator, bad parameters are refused with a path, and the toy optimum does not depend on d.
 */
import { describe, expect, it, vi } from 'vitest'
import claims from '../physics/__fixtures__/claims-papers/b6.json'
import checks from '../physics/__fixtures__/timing-b6.json'
import { validateLayout } from '../stage/resolve'
import '../stage/svg/kinds'
import { RECIPE_IDS, runRecipe, type RecipeRef } from './recipes'

vi.setConfig({ testTimeout: 60_000 })

const K = claims.values as Record<string, number>
const X = checks.values as Record<string, number>
const R = (recipe: string, params: object = {}): RecipeRef => ({ recipe, params }) as RecipeRef
const out = (ref: RecipeRef, name: string): number => {
  const r = runRecipe(ref)
  if (!r.ok) throw new Error(r.problems.join('\n'))
  return r.values[name]
}
const near = (got: number, want: number, tol = 1e-12): void => expect(Math.abs(got - want), `${got} vs ${want}`).toBeLessThan(tol)

type Row = [ref: RecipeRef, output: string, key: string]
/** every computed claim of the chapter: the recipe reference, the output it cites, and the twin's key */
const ROWS: Row[] = [
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'amp2', 'b6Amp2tstarD11'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 3}), 'amp2', 'b6Amp2tstarD3'],
  [R('loss-budget', {"d": 11, "loss": 0.0001048, "rounds": 11}), 'atoms', 'b6AtomsD11'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 2, "c": 0.5}), 'breakEven', 'b6BreakEvenC'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 0.3, "c": 0.5}), 'breakEven', 'b6BreakEvenSlow'],
  [R('fault-counts', {"d": 5, "p": 0.001}), 'doubling', 'b6ClueAmp5'],
  [R('loss-budget', {"d": 5, "loss": 0.0002, "rounds": 50}), 'atoms', 'b6ClueAtoms5'],
  [R('pipeline-schedule', {"d": 7, "g": 0.02, "r": 0.5, "c": 0.2}), 'breakEven', 'b6ClueBreakEven'],
  [R('erasure-vs-error', {"d": 7, "e": 0.2, "p": 0.001}), 'erasureMicro', 'b6ClueErasure7'],
  [R('fault-counts', {"d": 9, "p": 0.001}), 'k', 'b6ClueExp9'],
  [R('cycle-budget', {"layers": 6, "tGateUs": 1, "tMove": 0.1, "tRead": 2}), 'readFrac', 'b6ClueFrac'],
  [R('cycle-budget', {"layers": 6, "tGateUs": 1, "tMove": 0.1, "tRead": 2}), 'gateMs', 'b6ClueGate'],
  [R('pipeline-schedule', {"d": 7, "g": 0.02, "r": 0.5, "c": 0.2}), 'c', 'b6ClueInC'],
  [R('erasure-vs-error', {"d": 7, "e": 0.2, "p": 0.001}), 'e', 'b6ClueInE'],
  [R('cycle-budget', {"layers": 6, "tGateUs": 1, "tMove": 0.1, "tRead": 2}), 'tMove', 'b6ClueInMove'],
  [R('fault-counts', {"d": 3, "p": 0.2}), 'p', 'b6ClueInP'],
  [R('pipeline-schedule', {"d": 7, "g": 0.02, "r": 0.5, "c": 0.2}), 'r', 'b6ClueInR'],
  [R('idle-twirl', {"T1": 2, "T2": 0.4, "tMs": 20}), 'T2', 'b6ClueInT2'],
  [R('loss-budget', {"d": 5, "loss": 0.0002, "rounds": 50}), 'lossOverRounds', 'b6ClueLoss'],
  [R('pipeline-schedule', {"d": 7, "g": 0.02, "r": 0.5, "c": 0.2}), 'pipe', 'b6CluePipe'],
  [R('pipeline-schedule', {"d": 7, "g": 0.02, "r": 0.5, "c": 1}), 'pipe', 'b6CluePipeSlow'],
  [R('cycle-budget', {"layers": 6, "tGateUs": 1, "tMove": 0.1, "tRead": 2}), 'ratio', 'b6ClueRatio'],
  [R('pipeline-schedule', {"d": 7, "g": 0.02, "r": 0.5, "c": 0.2}), 'serial', 'b6ClueSerial'],
  [R('idle-twirl', {"T1": 1000000000000, "T2": 1, "tMs": 10}), 'total', 'b6ClueTwInf'],
  [R('idle-twirl', {"T1": 2, "T2": 0.4, "tMs": 20}), 'pZ', 'b6ClueTwPz'],
  [R('fault-counts', {"d": 3, "p": 0.2}), 'exact', 'b6ClueVote'],
  [R('fault-counts', {"d": 11, "p": 0.001, "view": "mixed", "mixed": {"n1": 5, "p1": 0.001, "n2": 6, "p2": 0.005}}), 'eKE', 'b6E6E'],
  [R('fault-counts', {"d": 11, "p": 0.001, "view": "mixed", "mixed": {"n1": 5, "p1": 0.001, "n2": 6, "p2": 0.005}}), 'eKM', 'b6E6M'],
  [R('erasure-vs-error', {"d": 5, "e": 0.01, "p": 0.001}), 'erasureE', 'b6ErasureRep5E'],
  [R('erasure-vs-error', {"d": 5, "e": 0.01, "p": 0.001}), 'erasureM', 'b6ErasureRep5M'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 0.4, "tRead": 1}), 'gateMs', 'b6GateTimeMs'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'smallRatio', 'b6IdleSmallRatio'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'smallT', 'b6IdleSmallT'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'totalE', 'b6IdleTotal4msE'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'totalM', 'b6IdleTotal4msM'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'A', 'b6InA'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 2, "c": 0.5}), 'c', 'b6InC'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 2, "c": 0.5}), 'd', 'b6InD11'],
  [R('erasure-vs-error', {"d": 5, "e": 0.01, "p": 0.001}), 'e', 'b6InE'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 2, "c": 0.5}), 'g', 'b6InG'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 0.4, "tRead": 1}), 'layers', 'b6InLayers'],
  [R('loss-budget', {"d": 11, "loss": 0.0001048, "rounds": 11}), 'lossE', 'b6InLossE'],
  [R('loss-budget', {"d": 11, "loss": 0.0001048, "rounds": 11}), 'lossM', 'b6InLossM'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 0.4, "tRead": 1, "tMove": 0.2}), 'tMove', 'b6InMove'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 0.4, "tRead": 1, "tMove": 0.2, "tReset": 1}), 'tMove', 'b6InMoveReload'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 2, "tMove": 0.3, "tRead": 3}), 'tMove', 'b6InMoveTyp'],
  [R('fault-counts', {"d": 11, "p": 0.001}), 'p', 'b6InP'],
  [R('fault-counts', {"d": 11, "p": 0.001, "view": "mixed", "mixed": {"n1": 5, "p1": 0.001, "n2": 6, "p2": 0.005}}), 'p2', 'b6InP2'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'pg', 'b6InPg'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'pth', 'b6InPth'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 2, "c": 0.5}), 'r', 'b6InR'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 0.3, "c": 0.5}), 'r', 'b6InRSlow'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'rb', 'b6InRb'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'rg', 'b6InRg'],
  [R('loss-budget', {"d": 11, "loss": 0.0001048, "rounds": 11}), 'survival', 'b6InSurv'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'T1', 'b6InT1'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'T2', 'b6InT2'],
  [R('loss-budget', {"d": 11, "loss": 0.0001048, "rounds": 11}), 'lossOverRounds', 'b6LossPer11Rounds'],
  [R('loss-budget', {"d": 11, "loss": 0.0001048, "rounds": 11}), 'lossPerRound', 'b6LossPerRound'],
  [R('fault-counts', {"d": 11, "p": 0.001, "view": "mixed", "mixed": {"n1": 5, "p1": 0.001, "n2": 6, "p2": 0.005}}), 'boundE', 'b6MaclaurinBoundE'],
  [R('fault-counts', {"d": 11, "p": 0.001, "view": "mixed", "mixed": {"n1": 5, "p1": 0.001, "n2": 6, "p2": 0.005}}), 'boundM', 'b6MaclaurinBoundM'],
  [R('fault-counts', {"d": 11, "p": 0.001, "view": "mixed", "mixed": {"n1": 5, "p1": 0.001, "n2": 6, "p2": 0.005}}), 'boundRatio', 'b6MaclaurinRatio'],
  [R('erasure-vs-error', {"d": 11, "e": 0.01, "p": 0.001}), 'minErasure', 'b6MinFaultsErasure11'],
  [R('erasure-vs-error', {"d": 11, "e": 0.01, "p": 0.001}), 'minFlip', 'b6MinFaultsUnknown11'],
  [R('fault-counts', {"d": 11, "p": 0.001, "view": "mixed", "mixed": {"n1": 5, "p1": 0.001, "n2": 6, "p2": 0.005}}), 'mixedExactE', 'b6MixedExactE'],
  [R('fault-counts', {"d": 11, "p": 0.001, "view": "mixed", "mixed": {"n1": 5, "p1": 0.001, "n2": 6, "p2": 0.005}}), 'mixedExactM', 'b6MixedExactM'],
  [R('loss-budget', {"d": 11, "loss": 0.0001048, "rounds": 11}), 'noLoss', 'b6NoLoss11Rounds'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'pLAt10E', 'b6PLAt10msD11E'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'pLAt10M', 'b6PLAt10msD11M'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'pLStarE', 'b6PLStarD11E'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'pLStarM', 'b6PLStarD11M'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'peff1OverPth', 'b6Peff1OverPth'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'peff10', 'b6PeffAt10'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'peff2', 'b6PeffAt2'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'peff4', 'b6PeffAt4'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'peffStar', 'b6PeffStar'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 2, "c": 0.5}), 'pipe', 'b6Pipe'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 0.3, "c": 0.5}), 'pipe', 'b6PipeSlowClassifier'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'pm1', 'b6PmAt1ms'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'pm2', 'b6PmAt2ms'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'pm4E', 'b6PmAt4msE'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'pm4M', 'b6PmAt4msM'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'pXE', 'b6PxPyE'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'pXM', 'b6PxPyM'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'pZE', 'b6PzE'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'pZM', 'b6PzM'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'pzOverPx', 'b6PzOverPx'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 0.4, "tRead": 1}), 'ratio', 'b6RatioAtom'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 0.034, "tRead": 0.0005}), 'ratio', 'b6RatioSC'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 0.4, "tRead": 1}), 'readFrac', 'b6ReadFrac'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 0.4, "tRead": 1, "tMove": 0.2}), 'readFrac', 'b6ReadFracMove'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 0.4, "tRead": 1, "tMove": 0.2, "tReset": 1}), 'readFrac', 'b6ReadFracReload'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 0.034, "tRead": 0.0005}), 'readFrac', 'b6ReadFracSC'],
  [R('fault-counts', {"d": 11, "p": 0.001}), 'exactE', 'b6Rep11E'],
  [R('fault-counts', {"d": 11, "p": 0.001}), 'exactM', 'b6Rep11M'],
  [R('fault-counts', {"d": 13, "p": 0.001}), 'exactE', 'b6Rep13E'],
  [R('fault-counts', {"d": 13, "p": 0.001}), 'exactM', 'b6Rep13M'],
  [R('fault-counts', {"d": 3, "p": 0.001}), 'exactE', 'b6Rep3E'],
  [R('fault-counts', {"d": 3, "p": 0.001}), 'exactM', 'b6Rep3M'],
  [R('fault-counts', {"d": 5, "p": 0.001}), 'exactE', 'b6Rep5E'],
  [R('fault-counts', {"d": 5, "p": 0.001}), 'exactM', 'b6Rep5M'],
  [R('fault-counts', {"d": 7, "p": 0.001}), 'exactE', 'b6Rep7E'],
  [R('fault-counts', {"d": 7, "p": 0.001}), 'exactM', 'b6Rep7M'],
  [R('fault-counts', {"d": 11, "p": 0.001}), 'ratio', 'b6RepRatio11'],
  [R('fault-counts', {"d": 13, "p": 0.001}), 'ratio', 'b6RepRatio13'],
  [R('fault-counts', {"d": 3, "p": 0.001}), 'ratio', 'b6RepRatio3'],
  [R('fault-counts', {"d": 5, "p": 0.001}), 'ratio', 'b6RepRatio5'],
  [R('fault-counts', {"d": 7, "p": 0.001}), 'ratio', 'b6RepRatio7'],
  [R('loss-budget', {"d": 11, "loss": 0.0001048, "rounds": 11}), 'roundsToLoss', 'b6RoundsToOneLoss'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 2, "c": 0.5}), 'saving', 'b6Saving'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 2, "c": 0.5}), 'serial', 'b6Serial'],
  [R('pipeline-schedule', {"d": 11, "g": 0.02, "r": 0.3, "c": 0.5}), 'serial', 'b6SerialSlow'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'shrinkXY', 'b6ShrinkXY'],
  [R('idle-twirl', {"T1": 10, "T2": 1, "tMs": 4}), 'shrinkZ', 'b6ShrinkZ'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'tStar', 'b6TStar'],
  [R('readout-ucurve', {"rb": 6, "rg": 0.3, "pg": 0.002, "T1": 10, "T2": 1, "pth": 0.01, "A": 0.03, "d": 11}), 'tStarD', 'b6TStarD11'],
  [R('cycle-budget', {"layers": 4, "tGateUs": 2, "tMove": 0.3, "tRead": 3}), 'readFrac', 'b6TypFrac'],
]

describe('B6 recipes: every printed output agrees with the numpy twin', () => {
  it.each(ROWS.map((r) => [r[2], r] as const))('%s', (_, [ref, name, key]) => near(out(ref, name), K[key]))
  it('every twin key is cited by a row (no stale key)', () => {
    expect(ROWS.map((r) => r[2]).sort()).toEqual(Object.keys(K).sort())
  })
})

const UC = { rb: 6, rg: 0.3, pg: 0.002, T1: 10, T2: 1, pth: 0.01, A: 0.03 }
describe('B6 recipes: challenge answers are the independent values', () => {
  it('cycle', () => {
    near(out(R('cycle-budget', { layers: 4, tGateUs: 0.5, tMove: 0.3, tRead: 3 }), 'readFrac'), X['ch.cycle.frac'])
    near(out(R('cycle-budget', { layers: 1, tGateUs: 2, tRead: 3 }), 'ratio'), X['ch.cycle.ratio'])
  })
  it('twirl', () => {
    near(out(R('idle-twirl', { T1: 5, T2: 0.5, tMs: 50 }), 'pZPct'), X['ch.twirl.pzPct'], 1e-10)
    near(out(R('idle-twirl', { T1: 1e12, T2: 0.25, tMs: 10 }), 'totalPct'), X['ch.twirl.infPct'], 1e-10)
  })
  it('fault counts', () => {
    expect(out(R('fault-counts', { d: 15, p: 0.001 }), 'k')).toBe(X['ch.fault.exp15'])
    expect(out(R('fault-counts', { d: 7, p: 0.001 }), 'doubling')).toBe(X['ch.fault.amp7'])
    near(out(R('fault-counts', { d: 3, p: 0.1 }), 'exact'), X['ch.fault.vote3.0.1'], 1e-14)
  })
  it('pipeline', () => {
    const p = { d: 9, g: 0.01, r: 1, c: 0.4 }
    near(out(R('pipeline-schedule', p), 'serial'), X['ch.pipe.serial'], 1e-12)
    near(out(R('pipeline-schedule', p), 'pipe'), X['ch.pipe.pipe'], 1e-12)
    near(out(R('pipeline-schedule', { ...p, c: 1.5 }), 'pipe'), X['ch.pipe.slow'], 1e-12)
  })
  it('loss and erasure', () => {
    near(out(R('loss-budget', { d: 7, loss: 1e-4, rounds: 100 }), 'lossOverRounds'), X['ch.loss.per100'], 1e-10)
    expect(out(R('loss-budget', { d: 7, loss: 1e-4, rounds: 100 }), 'atoms')).toBe(X['ch.loss.atoms7'])
    near(out(R('erasure-vs-error', { d: 5, e: 0.1, p: 0.001 }), 'erasureMicro'), X['ch.erase.micro'], 1e-9)
    expect(out(R('erasure-vs-error', { d: 7, e: 0.1, p: 0.001 }), 'minErasure')).toBe(X['ch.erase.min7'])
  })
})

describe('B6 recipes: the toy optimum, the pipeline and the twirl keep their promises', () => {
  it('the best exposure is the same for d = 3, 11 and 25 (argmin of a monotone map of p_eff)', () => {
    for (const d of [3, 11, 25]) near(out(R('readout-ucurve', { ...UC, d }), 'tStarD'), X['ch.ucurve.argmin.d3.d11.d25'], 1e-9)
  })
  it('the golden-section refinement stays within one grid step of the grid minimum', () => {
    const r = out(R('readout-ucurve', { ...UC, d: 11 }), 'tStarRefined')
    near(r, X['eng.refine.tstar'], 1e-4)
    expect(Math.abs(r - K.b6TStar)).toBeLessThan(0.05)
  })
  it('the closed form of the pipelined total equals the event simulation, over a sweep', () => {
    for (const [d, g, r, c] of [[11, 0.02, 2, 0.5], [11, 0.02, 0.3, 0.5], [7, 0.02, 0.5, 0.2], [25, 0.0016, 1, 2], [1, 1, 1, 1]]) {
      const ref = R('pipeline-schedule', { d, g, r, c })
      near(out(ref, 'pipe'), out(ref, 'sim'), 1e-12)
    }
  })
  it('the chances sum to the total and the Bloch factors are the damping factors', () => {
    const ref = R('idle-twirl', { T1: 10, T2: 1, tMs: 4 })
    near(out(ref, 'pX') + out(ref, 'pY') + out(ref, 'pZ'), out(ref, 'total'), 1e-15)
    near(out(ref, 'shrinkZ'), Math.exp(-0.004 / 10), 1e-15)
    near(out(ref, 'shrinkXY'), Math.exp(-0.004 / 1), 1e-15)
  })
})

describe('B6 recipes: pictures pass their kind’s validator, bad parameters are refused with a path', () => {
  const cb = { layers: 4, tGateUs: 0.4, tRead: 1 }
  const refs: RecipeRef[] = [
    R('cycle-budget', cb),
    R('cycle-budget', { ...cb, tMove: 0.2, tReset: 0.1 }),
    R('cycle-budget', { layers: 4, tGateUs: 0.034, tRead: 0.0005 }),
    R('cycle-budget', { ...cb, tMove: 0.2, view: 'share' }),
    ...(['chances', 'shrink', 'line', 'bars'] as const).map((view) => R('idle-twirl', { T1: 10, T2: 1, tMs: 4, view })),
    R('readout-ucurve', { ...UC, d: 11 }),
    R('readout-ucurve', { ...UC, d: 11, view: 'logical' }),
    R('fault-counts', { d: 11, p: 0.001 }),
    R('fault-counts', { d: 11, p: 0.001, view: 'ratio' }),
    R('fault-counts', { d: 11, p: 0.001, view: 'mixed', mixed: { n1: 5, p1: 0.001, n2: 6, p2: 0.005 } }),
    ...(['serial', 'pipelined', 'both', 'vsC'] as const).map((view) => R('pipeline-schedule', { d: 11, g: 0.02, r: 2, c: 0.5, view })),
    R('pipeline-schedule', { d: 25, g: 0.02, r: 2, c: 0.5, view: 'both' }),
    R('loss-budget', { d: 11, loss: 1.048e-4, rounds: 11 }),
    R('erasure-vs-error', { d: 5, e: 0.01, p: 0.001 }),
  ]
  it.each(refs.map((r, i) => [`${(r as { recipe: string }).recipe} #${i}`, r] as const))('%s', (_, ref) => {
    const r = runRecipe(ref)
    if (!r.ok) throw new Error(r.problems.join('\n'))
    expect(validateLayout(r.stage)).toEqual([])
  })
  it('refusals', () => {
    const bad = (ref: RecipeRef) => {
      const r = runRecipe(ref)
      return r.ok ? [] : r.problems.join('\n')
    }
    expect(bad(R('fault-counts', { d: 10, p: 0.001 }))).toContain('params.d')
    expect(bad(R('fault-counts', { d: 11, p: 0.001, view: 'mixed' }))).toContain('params.mixed')
    expect(bad(R('readout-ucurve', { ...UC, d: 11, T2: 30 }))).toContain('params.T2')
    expect(bad(R('readout-ucurve', { ...UC, d: 11, rb: 0.1 }))).toContain('params')
    expect(bad(R('idle-twirl', { T1: 1, T2: 5, tMs: 4 }))).toContain('params.T2')
    expect(bad(R('loss-budget', { d: 4, loss: 1e-4, rounds: 5 }))).toContain('params.d')
    expect(bad(R('erasure-vs-error', { d: 6, e: 0.1, p: 0.01 }))).toContain('params.d')
    expect(bad(R('pipeline-schedule', { d: 30, g: 0.02, r: 2, c: 0.5 }))).toContain('params.d')
    expect(bad(R('cycle-budget', { layers: 9, tGateUs: 1, tRead: 1 }))).toContain('params.layers')
    expect(RECIPE_IDS).toEqual(expect.arrayContaining(['cycle-budget', 'idle-twirl', 'readout-ucurve', 'fault-counts', 'pipeline-schedule', 'loss-budget', 'erasure-vs-error']))
  })
  it('the dear view (the toy optimum scans 400 exposures) stays cheap enough to run on every validation', () => {
    const t0 = performance.now()
    runRecipe(R('readout-ucurve', { ...UC, d: 25, view: 'logical' }))
    expect(performance.now() - t0).toBeLessThan(10_000)
  })
})
