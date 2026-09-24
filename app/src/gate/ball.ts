/** Bloch-ball helpers for the gate. The math moved to physics/density.ts (W-L1 §3.1); this is a re-export shim. */
export { purityOfNorm as purity, recipeWeights } from '../physics/density'

/** |r| of the gate's Bloch-ball story as a function of beat position u ∈ [0, 5]: 1 on beats 0–1, 0 from beat 3 on.
 *  Gate choreography, not physics: it stays here. */
export function rOfBeat(u: number) {
  const x = Math.min(1, Math.max(0, (u - 1.2) / 2.2))
  return 1 - x * x * (3 - 2 * x)
}
