/**
 * The `optics-bench` presets of the Papers background chapter B6, "Readout in the error-correction cycle" (P-B6-story §3; ruling G2): their own file, merged into the table by `presets.ts`
 * (one spread), so the other chapters' presets and these never share a line. THE RULE of presets.ts holds: no result is typed; every curve, marker and readout calls the engine
 * (physics/qec/timing.ts, which B6 owns, with the track's physics/optics/imaging.ts). Our toy inputs throughout (T1, T2, the photon rates, the gate error and the distance are ours,
 * "model, not data", ruling G3): the paper prints none of them. The bench has no log axes, so a chance that spans decades is drawn as its base-10 logarithm, said in the axis label.
 * Helpers sit above the presets: the source lint reads each preset from its `curves:` on, and its numbers must come from the engine or the sliders.
 */
import { patchQubits } from '../../physics/qec/curves'
import {
  argminTime,
  idleTotal,
  logicalToy,
  lossPerRound,
  minFaults,
  noLossChance,
  pipelinedTotal,
  readoutError,
  readoutFraction,
  roundsPerLoss,
  roundTime,
  unpipelinedTotal,
  type RoundPart,
} from '../../physics/qec/timing'
import type { OpticsParams, OpticsPreset } from './presets'

/** Unit conversions and the published-fit constants the toy borrows from B1 (`bev22`: A = 0.03, p_th = 0.01): helpers, not results. */
const US_PER_MS = 1000
const PER_E5 = 1e-5
const MS_PER_S = 1000
const PREFACTOR = 0.03
const THRESHOLD = 0.01
const FLOOR = 1e-30
const GRID = { lo: 0.05, hi: 20, step: 0.05 } as const

/** The round of a row of sliders: gate layers, the move, the exposure, the reset (ms). */
const partsOf = (p: OpticsParams, tRead: number): RoundPart[] => [
  { kind: 'gate', ms: (p.layers * p.tGateUs) / US_PER_MS },
  { kind: 'move', ms: p.tMove },
  { kind: 'acquire', ms: tRead },
  { kind: 'reset', ms: p.tReset },
]
const shareAt = (p: OpticsParams, tRead: number): number => readoutFraction(partsOf(p, tRead), ['acquire'])
const shareFree = (p: OpticsParams, tRead: number): number => readoutFraction(partsOf({ ...p, tMove: 0, tReset: 0 }, tRead), ['acquire'])

/** The toy's parameters kept inside the physical range: a dark rate below the bright rate, T2 at most 2 T1. */
const rgOf = (p: OpticsParams): number => Math.min(p.rg, p.rb / 2)
const t2Of = (p: OpticsParams): number => Math.min(p.T2, 2 * p.T1)
const log10 = (x: number): number => Math.log10(Math.max(x, FLOOR))
/** The reading error is the dear step (a scan of cutoffs): memoised by its inputs. */
const pmCache = new Map<string, number>()
const pm = (p: OpticsParams, t: number): number => {
  const key = `${p.rb}|${rgOf(p)}|${t}`
  let v = pmCache.get(key)
  if (v === undefined) {
    v = readoutError(p.rb, rgOf(p), t)
    pmCache.set(key, v)
  }
  return v
}
const idle = (p: OpticsParams, t: number): number => idleTotal(t / MS_PER_S, p.T1, t2Of(p))
const peff = (p: OpticsParams, t: number): number => p.pg + idle(p, t) + pm(p, t)
const optimum = (p: OpticsParams): { t: number; value: number } => argminTime((t) => peff(p, t), GRID.lo, GRID.hi, GRID.step)
const pL = (p: OpticsParams, t: number): number => logicalToy(peff(p, t), PREFACTOR, THRESHOLD, p.d)
/** Atoms of a distance-d patch (B1's count) and the survival chance of one image from the loss slider (units of 1e-5). */
const atomsOf = (p: OpticsParams): number => patchQubits(p.d)
const survival = (p: OpticsParams): number => 1 - p.lossE5 * PER_E5

const roundBench: OpticsPreset = {
  title: 'Round bench: what one round is made of',
  question: 'How big a share of a round is the camera, and what do a slower gate or a longer move do to it?',
  sliders: [
    { key: 'layers', label: 'Gate layers per round', min: 1, max: 8, step: 1, default: 4, unit: '' },
    { key: 'tGateUs', label: 'Time of one gate layer (our input)', min: 0.01, max: 2, step: 0.01, default: 0.4, unit: 'µs' },
    { key: 'tMove', label: 'Atom move (our slot, not in the paper)', min: 0, max: 1, step: 0.05, default: 0, unit: 'ms' },
    { key: 'tRead', label: 'Camera exposure', min: 0.05, max: 10, step: 0.05, default: 1, unit: 'ms' },
    { key: 'tReset', label: 'Reset or reload', min: 0, max: 1, step: 0.05, default: 0, unit: 'ms' },
  ],
  x: { label: 'Camera exposure', unit: 'ms', from: 0.05, to: 10 },
  y: { label: 'Readout fraction of the round', unit: '', from: 0, to: 1 },
  curves: (p) => [
    { label: 'with these gates, move and reset', f: (x) => shareAt(p, x) },
    { label: 'gates only (no move, no reset)', f: (x) => shareFree(p, x) },
  ],
  markers: (p) => [{ x: p.tRead, label: 'exposure' }],
  readouts: (p) => [
    { label: 'Time of one round', value: roundTime(partsOf(p, p.tRead)), unit: 'ms', digits: 4 },
    { label: 'Readout fraction', value: shareAt(p, p.tRead), unit: '', digits: 4 },
    { label: 'Exposure over one gate', value: (p.tRead * US_PER_MS) / p.tGateUs, unit: '×', digits: 1 },
  ],
}

const ucurveLab: OpticsPreset = {
  title: 'U-curve lab: reading error against waiting error (our toy)',
  question: 'Where is the lowest total error, and how much does missing it cost at each distance?',
  sliders: [
    { key: 'rb', label: 'Bright atom: photons per ms (our input)', min: 1, max: 20, step: 1, default: 6, unit: '' },
    { key: 'rg', label: 'Dark site: photons per ms (our input)', min: 0.05, max: 2, step: 0.05, default: 0.3, unit: '' },
    { key: 'pg', label: 'Gate and move error per round (our input)', min: 0.0005, max: 0.005, step: 0.0005, default: 0.002, unit: '' },
    { key: 'T1', label: 'Relaxation time T₁ (our input)', min: 0.5, max: 100, step: 0.5, default: 10, unit: 's' },
    { key: 'T2', label: 'Dephasing time T₂ (our input; at most 2 T₁)', min: 0.1, max: 10, step: 0.1, default: 1, unit: 's' },
    { key: 'd', label: 'Code distance d', min: 3, max: 25, step: 2, default: 11, unit: '' },
  ],
  x: { label: 'Camera exposure', unit: 'ms', from: 0.2, to: 12 },
  y: { label: 'log₁₀ of the chance', unit: '' },
  curves: (p) => [
    { label: 'reading error', f: (x) => log10(pm(p, x)) },
    { label: 'waiting error', f: (x) => log10(idle(p, x)) },
    { label: 'total p_eff', f: (x) => log10(peff(p, x)) },
    { label: 'logical error p_L', f: (x) => log10(pL(p, x)) },
  ],
  markers: (p) => [{ x: optimum(p).t, label: 'best t*' }],
  readouts: (p) => {
    const best = optimum(p)
    return [
      { label: 'Best exposure t* (grid of 0.05 ms)', value: best.t, unit: 'ms', digits: 2 },
      { label: 'Total error p_eff at t*', value: best.value, unit: '', digits: 5 },
      { label: 'Logical error at t*', value: pL(p, best.t), unit: '', digits: 8 },
      { label: 'Cost of missing t* by a factor of two', value: pL(p, best.t + best.t) / pL(p, best.t), unit: '×', digits: 2 },
      { label: 'p_eff at t* over the threshold', value: best.value / THRESHOLD, unit: '', digits: 3 },
    ]
  },
}

const pipelineBench: OpticsPreset = {
  title: 'Pipeline bench: hiding the classification',
  question: 'When does classifying one round while the next is photographed shorten a run, and when is the classifier the bottleneck?',
  sliders: [
    { key: 'd', label: 'Rounds d', min: 1, max: 25, step: 1, default: 11, unit: '' },
    { key: 'g', label: 'Gates g per round (our input)', min: 0.01, max: 0.2, step: 0.01, default: 0.02, unit: 'ms' },
    { key: 'r', label: 'Camera exposure r (our input)', min: 0.1, max: 5, step: 0.1, default: 2, unit: 'ms' },
    { key: 'c', label: 'Classification c (our input)', min: 0.05, max: 3, step: 0.05, default: 0.5, unit: 'ms' },
  ],
  x: { label: 'Classification time c', unit: 'ms', from: 0.05, to: 3 },
  y: { label: 'Time of the run', unit: 'ms' },
  curves: (p) => [
    { label: 'one after another', f: (x) => unpipelinedTotal(p.d, p.g, p.r, x) },
    { label: 'overlapped', f: (x) => pipelinedTotal(p.d, p.g, p.r, x) },
  ],
  markers: (p) => [{ x: p.c, label: 'c' }],
  readouts: (p) => [
    { label: 'One after another', value: unpipelinedTotal(p.d, p.g, p.r, p.c), unit: 'ms', digits: 3 },
    { label: 'Overlapped', value: pipelinedTotal(p.d, p.g, p.r, p.c), unit: 'ms', digits: 3 },
    { label: 'Saving', value: unpipelinedTotal(p.d, p.g, p.r, p.c) - pipelinedTotal(p.d, p.g, p.r, p.c), unit: 'ms', digits: 3 },
    { label: 'Saving stops growing at c = g + r', value: p.g + p.r, unit: 'ms', digits: 3 },
    { label: 'Classifier is the bottleneck (1 = yes)', value: Number(p.c > p.g + p.r), unit: '', digits: 0 },
  ],
}

const lossBench: OpticsPreset = {
  title: 'Loss bench: atoms that leave',
  question: 'How many atoms does a run lose, and how many losses does a vote need to fail when their place is known?',
  sliders: [
    { key: 'd', label: 'Code distance d (atoms 2d² − 1)', min: 3, max: 25, step: 2, default: 11, unit: '' },
    { key: 'lossE5', label: 'Loss per image and atom', min: 1, max: 100, step: 0.01, default: 10.48, unit: '× 10⁻⁵' },
    { key: 'rounds', label: 'Rounds', min: 1, max: 200, step: 1, default: 11, unit: '' },
  ],
  x: { label: 'Rounds', unit: '', from: 1, to: 200 },
  y: { label: 'Chance', unit: '', from: 0, to: 1 },
  curves: (p) => [
    { label: 'no atom lost', f: (x) => noLossChance(atomsOf(p), survival(p), Math.round(x)) },
    { label: 'at least one atom lost', f: (x) => 1 - noLossChance(atomsOf(p), survival(p), Math.round(x)) },
  ],
  markers: (p) => [{ x: p.rounds, label: 'rounds' }],
  readouts: (p) => [
    { label: 'Atoms in the patch', value: atomsOf(p), unit: '', digits: 0 },
    { label: 'Atoms lost per round', value: lossPerRound(atomsOf(p), survival(p)), unit: '', digits: 4 },
    { label: 'Atoms lost over the run', value: lossPerRound(atomsOf(p), survival(p)) * p.rounds, unit: '', digits: 3 },
    { label: 'Chance of no loss over the run', value: noLossChance(atomsOf(p), survival(p), p.rounds), unit: '', digits: 3 },
    { label: 'Rounds per lost atom', value: roundsPerLoss(atomsOf(p), survival(p)), unit: '', digits: 1 },
    { label: 'Unknown flips that fail a vote', value: minFaults(p.d, 'flip'), unit: '', digits: 0 },
    { label: 'Known-place losses that fail it', value: minFaults(p.d, 'erasure'), unit: '', digits: 0 },
  ],
}

export const B6_PRESETS: Readonly<Record<string, OpticsPreset>> = {
  'round-bench': roundBench,
  'ucurve-lab': ucurveLab,
  'pipeline-bench': pipelineBench,
  'loss-bench': lossBench,
}
