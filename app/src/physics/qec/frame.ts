/**
 * A Pauli frame (P-B1-story §9.1, b1-spacetime:b5): the correction a decoder has decided on but not applied is kept as a classical Pauli P. A later
 * Clifford gate U acts on it by conjugation, P ↦ U P U†, so the frame always says what must be applied (or what flips a readout) at the end. Signs are
 * dropped: a frame is a Pauli up to sign. Uses the engine's exact Pauli conjugation (pauli.ts).
 */
import { Pauli } from './pauli'

export interface FrameGate {
  gate: 'H' | 'S' | 'CNOT'
  target: number
  /** CNOT only */
  control?: number
}

export interface FrameRun {
  /** the frame as letters: before any gate, then after each gate */
  frames: string[]
  /** its weight (non-identity letters) at each of those moments */
  weights: number[]
}

export function frameThrough(frame: string, gates: readonly FrameGate[]): FrameRun {
  let p = Pauli.parse(frame)
  const lettersOf = (q: Pauli): string => q.letters().join('')
  const frames = [lettersOf(p)]
  for (const g of gates) {
    if (g.gate === 'CNOT') {
      if (g.control === undefined) throw new Error('frameThrough: a CNOT needs a control')
      p = p.conjugate('CNOT', g.control, g.target)
    } else p = p.conjugate(g.gate, g.target)
    frames.push(lettersOf(p))
  }
  return { frames, weights: frames.map((f) => [...f].filter((ch) => ch !== 'I').length) }
}
