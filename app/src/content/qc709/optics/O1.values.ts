/**
 * Optics Lab page O1 numbers, computed with the engine. Every number a reader sees in O1 comes from `V` and is backed by a keyed claim;
 * the numpy twin of each key (computed by another route) is physics/__fixtures__/claims-optics/o1.json (pipeline/claims_optics/o1.py).
 * Keys start with `o1`, unique across all courses (content/values.ts refuses a duplicate).
 */
import { rabiPeak } from '../../../physics/dynamics'
import { keyedClaim } from '../../claimKit'

export { close, d, pct, tf, uf } from '../../claimKit'

export const V = {
  /* o1-line-width */
  o1PeakAtTwoOmega: rabiPeak(1, 1), // 1/5: the resonance curve's height when the detuning equals the drive strength (δ = ω1 = 1, so δ = 2Ω)
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
