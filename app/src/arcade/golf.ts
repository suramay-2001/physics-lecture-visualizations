/**
 * Bloch golf's physics (pure): quarter turns are the spin rotations of physics/spin.ts, applied to the ket — so
 * the game keeps the sign a Bloch arrow forgets (four quarter turns about one axis give −|ψ⟩).
 */
import { c, type C } from '../physics/complex'
import { apply, inner, type Vec } from '../physics/linalg'
import { AXIS, KET, rotation, samePhysicalState, type NamedKet } from '../physics/spin'
import type { Move } from './games'

export const QUARTER = Math.PI / 2

export function applyMoves(start: NamedKet | Vec, moves: readonly Move[]): Vec {
  let psi = typeof start === 'string' ? KET[start] : start
  for (const m of moves) psi = apply(rotation(AXIS[m.axis], m.sign * QUARTER), psi)
  return psi
}

export const reached = (psi: Vec, target: NamedKet): boolean => samePhysicalState(psi, KET[target])

/** ⟨target|ψ⟩ when ψ is the target state up to a phase: that phase (±1 for the full-turn level). */
export function phaseOf(psi: Vec, target: NamedKet): C {
  const z = inner(KET[target], psi)
  return c(Math.round(z.re * 1e9) / 1e9, Math.round(z.im * 1e9) / 1e9)
}

/** All move sequences of exactly n quarter turns (6ⁿ of them). */
export function* sequences(n: number): Generator<Move[]> {
  const moves: Move[] = (['x', 'y', 'z'] as const).flatMap((axis) => [
    { axis, sign: 1 as const },
    { axis, sign: -1 as const },
  ])
  if (n === 0) {
    yield []
    return
  }
  for (const rest of sequences(n - 1)) for (const m of moves) yield [...rest, m]
}
