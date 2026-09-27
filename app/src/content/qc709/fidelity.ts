/**
 * Physics 709's fidelity notes (W-709-platform §E: "fidelity (content/fidelity.qc.ts)"; kept under content/qc709/ so
 * chunk rule (h) keeps them out of 448's first paint). Registered with content/fidelity.ts by the lazy course pack
 * (pack.ts), so a 709 passport's drawer shows them; 448's drawers never change.
 *   kinds      the whole drawer of a kind only 709 uses (complex-plane, amplitudes, circuit);
 *   additions  items a 709 chapter adds to a shared kind's drawer (hilbert-plane: Q1's vectors that are not states).
 * Ids start `qc-` (the 709 namespace, content/courses.test.ts); every sentence ≤ 25 words (content/symbols.test.ts).
 */
import { registerCourseFidelity, type CourseFidelity } from '../fidelity'

export const QC_FIDELITY: CourseFidelity = {
  kinds: {
    // P-F1-story §9.2 S3
    'complex-plane': {
      exact: [
        {
          id: 'qc-cplane-arithmetic',
          text: 'Positions, sizes and angles are the numbers themselves. A sum is drawn tip to tail, and a product multiplies the sizes and adds the angles, exactly.',
        },
      ],
      schematic: [
        {
          id: 'qc-cplane-not-space',
          text: 'This plane is a picture of numbers, not of the lab. Across is the real part and up is the imaginary part.',
        },
        {
          id: 'qc-cplane-hue-is-angle',
          text: 'An arrow’s colour shows its angle on a wheel of hues. The colour is a code for the angle, never a colour of light or an outcome.',
        },
      ],
      misleading: [
        {
          id: 'qc-cplane-arrows-not-forces',
          text: 'An arrow here is a number, not a push. Adding two arrows adds two numbers; nothing in the lab moves.',
        },
      ],
    },
  },
  additions: {},
}

registerCourseFidelity('qc709', QC_FIDELITY)

/** Every 709 fidelity item id (the namespace test, content/courses.test.ts). */
export const QC_FIDELITY_IDS: readonly string[] = [...Object.values(QC_FIDELITY.kinds), ...Object.values(QC_FIDELITY.additions)].flatMap((f) => [
  ...(f?.exact ?? []),
  ...(f?.schematic ?? []),
  ...(f?.misleading ?? []),
]).map((i) => i.id)
