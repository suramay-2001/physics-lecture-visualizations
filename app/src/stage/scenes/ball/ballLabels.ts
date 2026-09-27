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

/**
 * Label for the comparison marker, named by where it lives: the oven beam is the r = 0 mixture (L1, l1-vectors:b7);
 * a comparison on the surface is a pure state (L6: the superposition next to the mixture of the same ingredients).
 */
export function compareLabel(compare: readonly number[]): string {
  const n = Math.hypot(compare[0], compare[1], compare[2])
  return n < PURE_TOL ? 'oven: mixture' : pointKind(n) === 'pure' ? 'pure state' : 'mixture'
}

/** Readout for a magnet axis on the ball: P(+) = (1 + n̂·r)/2 comes from the resolver (physics/density.ts). */
export const ballAxisReadout = (pPlus: number | null): string => (pPlus === null ? '' : `P(+) along n̂ = ${pPlus.toFixed(3)}`)

/** Axis labels name expectation values: this is state space, not the lab's x, y, z. */
export const BALL_AXES = ['⟨σx⟩', '⟨σy⟩', '⟨σz⟩'] as const
