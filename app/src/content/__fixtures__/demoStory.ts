/**
 * DEV fixture: a 3-beat demo story that exercises every W0 seam (W-L1 §7.1 item 7):
 *   b1 lab-r3 (full)  →  b2 split lab-r3 | hilbert-plane (θ ↔ θ/2 sweep)  →  b3 hilbert-plane clue
 *   with a click-to-reveal answer picture (decision #17).
 * It goes through validateStage, resolve, interpolate (content.test.tsx), the DEV Workbench
 * (`#/dev/stage/demo/demo-story`) and StaticStory. Not shipped: only DEV code and tests import it.
 * Wording is W's placeholder, not course content.
 */
import { benchTheory } from '../../physics/sg'
import type { Lecture } from '../schema'

export const DEMO: Lecture = {
  id: 'demo',
  number: 0,
  title: 'Stage demo (DEV fixture)',
  outcomes: ['See the stage contracts work end to end.'],
  prerequisites: [],
  units: [
    {
      id: 'demo-story',
      title: 'Two spots, then a half angle',
      question: 'Does the stage follow the text, beat by beat?',
      lecture: { summary: 'Demo unit: the story replaces this block.', pages: 'demo' },
      books: [],
      visual: { kind: 'sg-lab', props: { source: 'oven', axes: ['z'] }, tryThis: ['Fire a few atoms.'] },
      clues: [],
      insight: 'Every picture on the stage is computed from the state, never drawn by hand.',
      play: [],
      claims: [
        {
          text: 'An oven beam splits 50/50 at a z magnet.',
          holds: () => benchTheory({ source: 'oven', axes: ['z'], keep: [] }).plus === 0.5,
        },
      ],
      review: {
        points: ['A tilt of θ in the lab is a turn of θ/2 in state space.', 'Clue beats hold their question until you ask for the answer.'],
        equations: 'P(+) = \\cos^2\\tfrac{\\theta}{2}',
        trap: 'The arrow in the plane is not a direction in the lab.',
      },
      story: [
        {
          id: 'demo-story:b1',
          phase: 'lecture',
          text: 'Atoms leave a hot [[oven]] and cross one $z$ magnet. The [[plate]] shows {{plus-spot|two spots}}, never a smear.',
          caption: 'oven → SG$_z$ → plate',
          stage: {
            kind: 'lab-r3',
            benches: [{ id: 'main', source: 'oven', devices: [{ axis: 'z' }] }],
            shot: 'L-EST',
          },
          terms: { 'plus-spot': { kind: 'lab-r3', anchor: 'spot-plus' } },
          fidelity: ['lab-glow-not-light'],
        },
        {
          id: 'demo-story:b2',
          phase: 'books',
          text: 'Tilt a magnet by $\\theta$ and the state arrow turns by only $\\htmlClass{term-half}{\\theta/2}$. Scroll to sweep $\\theta$ from $0^\\circ$ to $180^\\circ$.',
          caption: 'top: lab angle θ · bottom: state angle θ/2',
          stage: {
            layout: 'split',
            top: {
              kind: 'lab-r3',
              benches: [{ id: 'main', source: '+z', devices: [{ axis: { tiltDeg: { from: 0, to: 180 } } }], showPrep: true }],
              shot: 'L-END',
            },
            bottom: { kind: 'hilbert-plane', psi: { blochDeg: { from: 0, to: 180 } }, basis: 'z', arc: true, shot: 'H-FLAT' },
          },
          terms: { half: { kind: 'hilbert-plane', anchor: 'angle-arc' } },
        },
        {
          id: 'demo-story:b3',
          phase: 'clue',
          text: 'The arrow $\\htmlClass{term-psi}{|\\psi\\rangle}$ sits at 45° in the plane. What fraction lands in the + spot?',
          caption: 'the question picture',
          stage: { kind: 'hilbert-plane', psi: { blochDeg: 90 }, basis: 'z', rightAngle: true, shot: 'H-FLAT' },
          terms: { psi: { kind: 'hilbert-plane', anchor: 'psi' } },
          reveal: {
            text: 'Drop the arrow onto each axis. Each {{shadow|shadow}} has length $1/\\sqrt2$, and its square is the probability: one half each.',
            caption: 'shadows squared = probabilities',
            stage: { kind: 'hilbert-plane', psi: { blochDeg: 90 }, basis: 'z', rightAngle: true, shadows: true, ticks: true, shot: 'H-FLAT' },
            terms: { shadow: { kind: 'hilbert-plane', anchor: 'shadow-1' } },
            claims: [{ text: '(1/√2)² = 1/2', holds: () => Math.abs(Math.SQRT1_2 ** 2 - 0.5) < 1e-15 }],
          },
        },
      ],
    },
  ],
}
