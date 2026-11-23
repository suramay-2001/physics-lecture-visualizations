/**
 * The timing of an error-correction cycle (Physics 709, Papers B6; owned by B6, wrapped by P2's physics/readout/gandalf.ts, never copied). Pure, lazy-only.
 * A round is a list of timed parts (gates, moves, acquisition, reset, classification, denoising); d rounds run one after the other (`unpipelinedTotal`, the paper's
 * Eq. 4 in generic form) or with the classical work of a round hidden behind the next round's gates and acquisition (`pipelinedTotal`, Eq. 5 in generic form).
 * Times are in one unit of the caller's choosing (the pages use ms). The numpy twin is pipeline/make_gandalf_platform_fixtures.py (an event simulation for the
 * pipelined total). B6's builder adds the remaining functions of P-B6-story §9.1 (idle twirl, effective rate, loss) to this module.
 */

export type RoundPartKind = 'gate' | 'move' | 'acquire' | 'reset' | 'classify' | 'denoise'
export const ROUND_PART_KINDS: readonly RoundPartKind[] = ['gate', 'move', 'acquire', 'reset', 'classify', 'denoise']
export interface RoundPart {
  kind: RoundPartKind
  /** Duration, ≥ 0 and finite. */
  ms: number
}

function checkParts(parts: readonly RoundPart[]): void {
  for (const p of parts) if (!(ROUND_PART_KINDS as readonly string[]).includes(p.kind) || !(Number.isFinite(p.ms) && p.ms >= 0)) throw new RangeError('round part: a known kind and a duration >= 0')
}
/** The time of one round done in order: the sum of every part's duration. */
export function roundTime(parts: readonly RoundPart[]): number {
  checkParts(parts)
  let s = 0
  for (const p of parts) s += p.ms
  return s
}
/** The share of a round taken by the readout chain: acquisition, classification and denoising by default (pass `kinds` to count other parts). */
export function readoutFraction(parts: readonly RoundPart[], kinds: readonly RoundPartKind[] = ['acquire', 'classify', 'denoise']): number {
  const total = roundTime(parts)
  if (total === 0) throw new RangeError('readoutFraction: a round of zero length')
  let s = 0
  for (const p of parts) if (kinds.includes(p.kind)) s += p.ms
  return s / total
}

function checkRounds(d: number, g: number, r: number, c: number): void {
  if (!(Number.isInteger(d) && d >= 1 && [g, r, c].every((x) => Number.isFinite(x) && x >= 0))) throw new RangeError('rounds: a whole number d >= 1 and times g, r, c >= 0')
}
/** d rounds, each waiting for the one before: T = d (g + r + c) for gates g, acquisition r and classification c. */
export function unpipelinedTotal(d: number, g: number, r: number, c: number): number {
  checkRounds(d, g, r, c)
  return d * (g + r + c)
}
/**
 * d rounds with the classification of round k running while round k + 1 is gated and photographed (the next round's gates must not wait for it):
 * T = (g + r) + c + (d − 1) max(g + r, c). When c ≤ g + r this is d (g + r) + c; when c is larger the classifier is the bottleneck, T = (g + r) + d c.
 */
export function pipelinedTotal(d: number, g: number, r: number, c: number): number {
  checkRounds(d, g, r, c)
  return g + r + c + (d - 1) * Math.max(g + r, c)
}
/** The time pipelining saves: unpipelined minus pipelined (= (d − 1) min(c, g + r)). */
export const pipelineSaving = (d: number, g: number, r: number, c: number): number => unpipelinedTotal(d, g, r, c) - pipelinedTotal(d, g, r, c)
/** B6's names for the same two totals (P-B6-story §9.1). */
export const serialTime = unpipelinedTotal
export const pipelinedTime = pipelinedTotal
/**
 * An event simulation of the pipeline (a test oracle, not for pages): one acquisition chain (gates then acquisition of round k + 1 start when round k's acquisition is
 * done) and one classifier that takes rounds in order, each only after its acquisition and after the previous classification. Returns the time the last classification ends.
 */
export function pipelineSim(d: number, g: number, r: number, c: number): number {
  checkRounds(d, g, r, c)
  let acqEnd = 0
  let classEnd = 0
  for (let k = 0; k < d; k++) {
    acqEnd += g + r
    classEnd = Math.max(classEnd, acqEnd) + c
  }
  return classEnd
}
