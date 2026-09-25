/**
 * Truth guard for overlay text (Round 3 #5; THREE-free, pure). A lab beat whose model is 'classical' draws the
 * classical prediction (one continuous band), so the overlay must not show a quantum ± outcome for it: the
 * judge saw "+ 50.0% · − 50.0%" on l1-quantized:b2 while the text and caption described the band.
 *
 * The runtime enforces it in two places, whatever a scene writes:
 *   - `writeReadout` (stage/store.ts) blanks outcome text in a readout node marked `data-outcomes="off"`;
 *   - the overlay (components/StageOverlay.tsx) marks those nodes, drops outcome labels of that view, and shows
 *     CLASSICAL_NOTE in the readout column instead.
 */
import type { StageState } from '../content/stage'

/** What the readout column says on a classical-model lab beat. */
export const CLASSICAL_NOTE = 'classical: continuous band, no ± split'

/**
 * Quantum outcome text: a signed count, fraction or ħ value ("+ 50", "− 1/2", "+ħ/2"), a percentage, "Born",
 * P(±), an average reading ⟨σ…⟩, or a signed TeX ħ. A tilt readout ("θ = −30°") is not an outcome.
 */
const OUTCOME_RE = /[+−±-]\s*(?:\d|ħ|\\hbar|\\t?frac)|\d\s*%|\bBorn\b|P\(\s*[+−±-]\s*\)|⟨σ|\\langle\s*\\sigma/
const TILT_RE = /^\s*θ\s*=/

export function isOutcomeText(text: string | null | undefined): boolean {
  return !!text && !TILT_RE.test(text) && OUTCOME_RE.test(text)
}

/** false when this state claims no quantum outcomes: a lab bench drawn under the classical model. */
export function outcomesAllowed(state: StageState): boolean {
  return !(state.kind === 'lab-r3' && state.model === 'classical')
}
