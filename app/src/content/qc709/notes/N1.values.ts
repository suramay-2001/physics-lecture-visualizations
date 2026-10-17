/**
 * Lecture 1 notes (N1) numbers, computed with the engine. Every number a reader sees in N1 comes from `V` and is backed by a
 * keyed claim; the numpy twin of each key (computed by another route) is physics/__fixtures__/claims-notes/n1.json
 * (pipeline/claims_notes/n1.py). Keys start with `n1`, unique across all courses (content/values.ts refuses a duplicate).
 */
import { KET, prob } from '../../../physics/spin'
import { keyedClaim } from '../../claimKit'

export { close, d, pct, tf, uf } from '../../claimKit'

export const V = {
  /* n1-stern-gerlach */
  n1UpAfterX: prob(KET['+z'], KET['+x']), // 0.5: z+ → x+ → z: the chance the last z magnet passes an up atom
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
