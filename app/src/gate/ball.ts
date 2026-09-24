/** Bloch-ball helpers for the gate (pure; tested against the engine in ball.test.ts). */

/** Tr ρ² for ρ = (I + r·σ)/2 with |r| = rmag. */
export const purity = (rmag: number) => (1 + rmag * rmag) / 2

/** |r| of the gate's Bloch-ball story as a function of beat position u ∈ [0, 5]: 1 on beats 0–1, 0 from beat 3 on. */
export function rOfBeat(u: number) {
  const x = Math.min(1, Math.max(0, (u - 1.2) / 2.2))
  return 1 - x * x * (3 - 2 * x)
}

/** Weights of the ±n̂ recipe that realizes |r|: w± = (1 ± |r|)/2. */
export const recipeWeights = (rmag: number): [number, number] => [(1 + rmag) / 2, (1 - rmag) / 2]
