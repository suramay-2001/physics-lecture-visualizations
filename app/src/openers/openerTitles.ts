/**
 * The names and titles of the chapter openers, apart from their captions (openers/openerCopy.ts). A unit that opens with a
 * film (components/UnitOpener.tsx) needs only the title for its section's accessible name before the film loads; the captions,
 * the fidelity lists and the frame table ride with the lazy player (openers/OpenerByName.tsx), not with the first paint.
 * openerCopy.ts takes each `title` from here, so the words live in one place.
 */
export type OpenerName = 'hopf' | 'belt' | 'grover' | 'qc-q16-cancel' | 'qc-q17-mean'

export const OPENER_TITLES: Record<OpenerName, string> = {
  hopf: 'Every point of the Bloch sphere is a circle',
  belt: 'Why spin ½ needs 720°',
  grover: 'Grover’s search turns a state, step by step',
  'qc-q16-cancel': 'Balanced functions cancel the all-zeros bar',
  'qc-q17-mean': 'Inversion about the mean, one step at a time',
}
