/**
 * bloch-ball wording (D-L1-scenes §3.4, decision #6). Pure helpers so the scene never decides physics:
 * it only reads the engine's |r| and Tr ρ² from `f.state` and names what they mean.
 */

/** |r| within this of 1 counts as pure (the resolver's floating-point noise is far smaller). */
export const PURE_TOL = 1e-6

export type BallPointKind = 'pure' | 'mixture'

export const pointKind = (rNorm: number): BallPointKind => (rNorm > 1 - PURE_TOL ? 'pure' : 'mixture')

/**
 * Words first: a mixture is not "partly up" (fidelity note), so the readout says where the point lives.
 * Compact (it shares the top edge with the passport in split stages). Tr ρ² appears only when the beat
 * shows purity (`purityShown`, from the resolver).
 */
export function ballReadout(rNorm: number, purity: number, showPurity = true): string {
  const where = pointKind(rNorm) === 'pure' ? 'pure: surface' : rNorm < PURE_TOL ? 'mixture: centre' : 'mixture: inside'
  return showPurity ? `${where} · Tr ρ² ${purity.toFixed(2)}` : `${where} · |r| ${rNorm.toFixed(2)}`
}

/** Label for the comparison ring: the oven beam is the r = 0 mixture in L1 (l1-vectors:b7). */
export const compareLabel = (compare: readonly number[]): string =>
  Math.hypot(compare[0], compare[1], compare[2]) < PURE_TOL ? 'oven: mixture' : 'mixture'

/** Axis labels name expectation values: this is state space, not the lab's x, y, z. */
export const BALL_AXES = ['⟨σx⟩', '⟨σy⟩', '⟨σz⟩'] as const
