/**
 * The arithmetic of the GANDALF paper lecture P2 (arXiv:2510.25982v2; P-P2-story §9.1; rulings gandalf-batch.md G1–G4). Pure; lazy-only. Every number a page shows from here has a numpy twin
 * (pipeline/claims_papers/p2.py). The schedules WRAP physics/qec/timing.ts (the paper's Eq. 4 is `unpipelinedTotal`, its Eq. 5 is `pipelinedTotal` with the classical work c = t_den + t_c); this
 * module never copies their formulas. What it adds: reading the paper's printed bars back into times, the η factor, throughput against latency, the boxes of the timeline kind, a toy post-selection
 * of two overlapping score clouds, and a toy trade-off between reading error and idle error (our inputs, labelled; never fitted to the paper's Fig. 14). Times are in ms unless a name says µs.
 */
import { normalTail, poissonCdf } from '../optics/imaging'
import { pauliTwirl, pipelinedTotal, readoutFraction, unpipelinedTotal } from '../qec/timing'

const pos = (x: number, what: string): void => {
  if (!(Number.isFinite(x) && x >= 0)) throw new RangeError(`${what}: a finite number >= 0`)
}

/** The paper's Eq. 4: d rounds of gates, acquisition and classification in a row. */
export const cycleUnpipelined = (d: number, tg: number, tr: number, tc: number): number => unpipelinedTotal(d, tg, tr, tc)
/** Eq. 5: the classical work of a round (denoise, then classify) is c = t_den + t_c, hidden behind the next acquisition (the generic total; equals d(t_r + t_g) + c while c <= t_g + t_r). */
export const cyclePipelined = (d: number, tg: number, tr: number, tden: number, tc: number): number => pipelinedTotal(d, tg, tr, tden + tc)
/** Does the classical work of one round fit inside the next gates and acquisition (the condition Eq. 5 needs and the paper does not state)? */
export const hidesCleanly = (tg: number, tr: number, tden: number, tc: number): boolean => tden + tc <= tg + tr
/** What Eq. 5 saves over Eq. 4 for the same times: T_unp − T_pip (= (d − 1) t_c − t_den while the classical work hides). */
export const pipelineGain = (d: number, tg: number, tr: number, tden: number, tc: number): number => cycleUnpipelined(d, tg, tr, tc) - cyclePipelined(d, tg, tr, tden, tc)

/** The classification time that makes a pipelined baseline (t_den = 0) save `unp − pip` over d rounds: (unp − pip)/(d − 1). */
export function impliedClassTime(unp: number, pip: number, d: number): number {
  if (!(Number.isInteger(d) && d >= 2)) throw new RangeError('impliedClassTime: d >= 2 whole rounds')
  return (unp - pip) / (d - 1)
}
/** From an unpipelined total d(t_g + t_r + t_c): t_g + t_r = unp/d − t_c. */
export const impliedReadGate = (unp: number, d: number, tc: number): number => unp / d - tc
/** From a pipelined total d(t_g + t_r) + c: t_g + t_r = (total − c)/d. */
export const impliedReadGatePipelined = (total: number, d: number, c: number): number => (total - c) / d

/** The share of a round the readout takes when the round is one gate and one acquisition (Table 1's reading): t_r/(t_g + t_r), by `readoutFraction` of the two parts. */
export const gateReadShare = (tg: number, tr: number): number =>
  readoutFraction(
    [
      { kind: 'gate', ms: tg },
      { kind: 'acquire', ms: tr },
    ],
    ['acquire'],
  )
/** a over b (b > 0). */
export function ratio(a: number, b: number): number {
  if (!(b > 0)) throw new RangeError('ratio: a positive denominator')
  return a / b
}
/** Eq. 1 (the run time is T-gates × d rounds × cycle time): a cycle `slower` times longer makes a run `slower` times longer. */
export const runtimeScale = (slower: number, tGates = 1, d = 1, cycle = 1): number => (tGates * d * (cycle * slower)) / (tGates * d * cycle)
/** The signal-to-noise ratio √N of a Poisson count with mean N = n0·τ: SNR(k·τ)/SNR(τ). */
export const snrRatio = (k: number, n0 = 1): number => Math.sqrt(n0 * k) / Math.sqrt(n0)

/** η = 1 − δ_method/δ_baseline as a fraction (the paper writes percent): the factor by which the error is divided, 1/(1 − η). */
export function etaFactor(eta: number): number {
  if (!(eta >= 0 && eta < 1)) throw new RangeError('etaFactor: 0 <= eta < 1')
  return 1 / (1 - eta)
}
/** The error left when a baseline error `base` is cut by η: base × (1 − η). */
export const errorAfter = (base: number, eta: number): number => base * (1 - eta)

/** Throughput (images per second) to latency per image in ms: 1000/TP. */
export function latencyFromThroughput(tp: number): number {
  if (!(tp > 0)) throw new RangeError('latencyFromThroughput: tp > 0')
  return 1000 / tp
}
/** Time to push a batch of `b` images through at throughput `tp` (images per second), in ms. */
export const batchTime = (b: number, tp: number): number => (b * 1000) / tp
/** Latency per site in µs for a latency in ms on an n × n array. */
export const perSiteMicros = (latencyMs: number, n: number): number => (latencyMs * 1000) / (n * n)

/* ---------------------------------------------------------------- the timeline kind's boxes ---------------------------------------------------------------- */
export type TlKind = 'gate' | 'acquire' | 'classify' | 'denoise' | 'reset'
export interface TlRow {
  label: string
  group?: string
  segments: { kind: TlKind; from: number; to: number; label?: string }[]
}
export interface TlInputs {
  /** rounds drawn (the boxes), 1–8 */
  drawn: number
  tg: number
  tr: number
  tden: number
  tc: number
  treset?: number
}
const seg = (kind: TlKind, from: number, dur: number): { kind: TlKind; from: number; to: number } => ({ kind, from, to: from + dur })
/**
 * The rows of Fig. 11. 'a': baseline, every round gate · acquire · classify in a row. 'b': unpipelined with the denoiser, gate · acquire · denoise · classify (Eq. 4 leaves the denoising out; the
 * picture adds it). 'c': pipelined, one row of gates and acquisitions back to back and one classical row where round k's denoise and classify start when its acquisition ends and the classical row is
 * free (the schedule `pipelinedTotal` totals). 'cycle': one QEC cycle, syndrome gates · readout · reset (Eq. 2).
 */
export function timelineSegments(mode: 'a' | 'b' | 'c' | 'cycle', o: TlInputs): TlRow[] {
  for (const [k, v] of Object.entries({ tg: o.tg, tr: o.tr, tden: o.tden, tc: o.tc, treset: o.treset ?? 0 })) pos(v, k)
  if (!(Number.isInteger(o.drawn) && o.drawn >= 1 && o.drawn <= 8)) throw new RangeError('timelineSegments: 1 to 8 rounds drawn')
  if (!(o.tg > 0 && o.tr > 0)) throw new RangeError('timelineSegments: t_g and t_r > 0')
  if (mode === 'cycle') {
    const rs = o.treset ?? 0
    if (!(rs > 0)) throw new RangeError('timelineSegments: a cycle needs a reset time > 0')
    return [{ label: 'one cycle', segments: [seg('gate', 0, o.tg), seg('acquire', o.tg, o.tr), seg('reset', o.tg + o.tr, rs)] }]
  }
  if (mode === 'a' || mode === 'b') {
    const parts: [TlKind, number][] = [
      ['gate', o.tg],
      ['acquire', o.tr],
    ]
    if (mode === 'b' && o.tden > 0) parts.push(['denoise', o.tden])
    if (o.tc > 0) parts.push(['classify', o.tc])
    const segments: TlRow['segments'] = []
    let t = 0
    for (let k = 0; k < o.drawn; k++)
      for (const [kind, dur] of parts) {
        segments.push(seg(kind, t, dur))
        t += dur
      }
    return [{ label: mode === 'a' ? 'baseline' : 'unpipelined', segments }]
  }
  const quantum: TlRow['segments'] = []
  const classical: TlRow['segments'] = []
  let acqEnd = 0
  let free = 0
  for (let k = 0; k < o.drawn; k++) {
    quantum.push(seg('gate', acqEnd, o.tg), seg('acquire', acqEnd + o.tg, o.tr))
    acqEnd += o.tg + o.tr
    let t = Math.max(acqEnd, free)
    if (o.tden > 0) {
      classical.push(seg('denoise', t, o.tden))
      t += o.tden
    }
    if (o.tc > 0) {
      classical.push(seg('classify', t, o.tc))
      t += o.tc
    }
    free = t
  }
  return [
    { label: 'gates, acquire', group: 'pipelined', segments: quantum },
    { label: 'classical', group: 'pipelined', segments: classical },
  ]
}

/* ---------------------------------------------------------------- a toy post-selection (two overlapping score clouds) ---------------------------------------------------------------- */
/** Dark scores ~ N(−sep, 1), bright ~ N(+sep, 1), equal priors, decide "bright" when the score is above 0; keep an image only when |score| >= cut. */
export function keepFraction(sep: number, cut: number): number {
  pos(sep, 'sep')
  pos(cut, 'cut')
  return normalTail(cut - sep) + normalTail(cut + sep)
}
/** The error rate of the kept images: the share of the kept ones on the wrong side of 0 (cut = 0 keeps everything and gives the plain error Q(sep)). */
export function keptError(sep: number, cut: number): number {
  return normalTail(cut + sep) / keepFraction(sep, cut)
}

/* ---------------------------------------------------------------- a toy trade-off: reading error against idle error ---------------------------------------------------------------- */
/** The smallest chance of a wrong bit of a count threshold between a bright mean `mb` and a dark mean `md` (equal priors): min over cutoffs k of ½[P(N_b < k) + P(N_d >= k)]. */
export function poissonOverlapError(mb: number, md: number): number {
  pos(mb, 'mb')
  pos(md, 'md')
  let best = 1
  const top = Math.ceil(mb + md + 12 * Math.sqrt(mb + md + 1)) + 2
  for (let k = 0; k <= top; k++) best = Math.min(best, 0.5 * (poissonCdf(k - 1, mb) + 1 - poissonCdf(k - 1, md)))
  return best
}
export interface TradeInputs {
  /** photons per ms from a bright atom / a dark one */
  rb: number
  rd: number
  /** gate error per cycle, T1 and T2 in ms */
  pg: number
  T1: number
  T2: number
  /** multiplies the reading error (a classifier that is worse by this factor), default 1 */
  mScale?: number
}
/** p_eff(t) = p_g + p_idle(t) + p_m(t): the effective chance of a fault on one data atom in a cycle whose readout takes t ms (our toy). */
export function effectiveRate(t: number, o: TradeInputs): { pg: number; idle: number; meas: number; total: number } {
  const idle = pauliTwirl(t, o.T1, o.T2).total
  const meas = Math.min(0.5, (o.mScale ?? 1) * poissonOverlapError(o.rb * t, o.rd * t))
  return { pg: o.pg, idle, meas, total: o.pg + idle + meas }
}
/** p_L = A (p_eff/p_th)^((d+1)/2) for an odd distance d. */
export function logicalToy(peff: number, A: number, pth: number, d: number): number {
  if (!(Number.isInteger(d) && d >= 3 && d % 2 === 1)) throw new RangeError('logicalToy: an odd distance d >= 3')
  return A * (peff / pth) ** ((d + 1) / 2)
}
/** The grid point where f is smallest on [lo, hi] with n steps (first minimum), and whether it is strictly inside the range. */
export function argminGrid(f: (t: number) => number, lo: number, hi: number, n: number): { t: number; interior: boolean } {
  let bt = lo
  let bf = Infinity
  for (let i = 0; i <= n; i++) {
    const t = lo + ((hi - lo) * i) / n
    const v = f(t)
    if (v < bf) {
      bf = v
      bt = t
    }
  }
  return { t: bt, interior: bt > lo && bt < hi }
}
