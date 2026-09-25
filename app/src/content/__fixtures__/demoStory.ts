/**
 * DEV fixture: a demo story that exercises every stage seam (W-L1 §7.1 item 7):
 *   b1 lab-r3 (full)  →  b2 split lab-r3 | hilbert-plane (θ ↔ θ/2 sweep)  →  b3 plane with a lab inset
 *   →  b4 hilbert-plane clue whose click-to-reveal answer picture is a split lab | plane (decision #17).
 * It goes through validateStage, resolve, interpolate (content.test.tsx), the DEV Workbench
 * (`#/dev/stage/demo/demo-story`) and StaticStory. Not shipped: only DEV code and tests import it.
 * Wording is W's placeholder, not course content.
 * W1 adds what P's real L1 story uses: an inset beat (plane main + lab inset, nested \htmlClass terms, a gloss
 * in the caption, book refs), a clue whose reveal CHANGES the layout (full plane → split lab | plane), so
 * lab-r3 appears full, split and inset in one unit; a gloss in a review point; a plain unit (no story); and
 * a second story unit (`demo-ball`) with the "beyond the lecture" badge on the unit and on a beat.
 * The whole lecture renders through the real LecturePage at `#/dev/lecture/demo` (e2e/story.spec.ts).
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
        points: ['A tilt of θ in the lab is a turn of θ/2 in state space: the [[half-angle|half angle]].', 'Clue beats hold their question until you ask for the answer.'],
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
          refs: [{ source: 'townsend', where: '§1.2', adds: 'Spin states as vectors; the tilted-magnet probabilities.' }],
        },
        {
          id: 'demo-story:b3',
          phase: 'books',
          text: 'In the plane, $\\htmlClass{term-psi-state}{|\\psi\\rangle = \\htmlClass{term-amp}{\\cos\\tfrac{\\theta}{2}}\\,|{+z}\\rangle + \\sin\\tfrac{\\theta}{2}\\,|{-z}\\rangle}$ while {{inset-magnet|the magnet}} in the corner stays tilted by $\\theta = 90^\\circ$.',
          caption: 'the [[plate]] in the corner still counts atoms',
          stage: {
            layout: 'inset',
            main: { kind: 'hilbert-plane', psi: { blochDeg: 90 }, basis: 'z', arc: true, shot: 'H-FLAT' },
            inset: { kind: 'lab-r3', benches: [{ id: 'main', source: '+z', devices: [{ axis: { tiltDeg: 90 } }], showPrep: true }], shot: 'L-SIDE' },
          },
          terms: {
            'psi-state': { kind: 'hilbert-plane', anchor: 'psi' },
            amp: { kind: 'hilbert-plane', anchor: 'shadow-1' },
            'inset-magnet': { kind: 'lab-r3', anchor: 'magnet-1' },
          },
          refs: [{ source: 'townsend', where: '§1.4', adds: 'The half angle: a magnet tilted by θ measures along a state turned by θ/2.' }],
        },
        {
          id: 'demo-story:b4',
          phase: 'clue',
          text: 'The arrow $\\htmlClass{term-psi}{|\\psi\\rangle}$ sits at 45° in the plane. What fraction lands in the + spot?',
          caption: 'the question picture',
          stage: { kind: 'hilbert-plane', psi: { blochDeg: 90 }, basis: 'z', rightAngle: true, shot: 'H-FLAT' },
          terms: { psi: { kind: 'hilbert-plane', anchor: 'psi' } },
          reveal: {
            // the answer picture changes the layout: full plane → split lab | plane
            text: 'Drop the arrow onto each axis. Each {{shadow|shadow}} has length $1/\\sqrt2$, and its square is the probability: one half each.',
            caption: 'shadows squared = [[probability|probabilities]]',
            stage: {
              layout: 'split',
              top: { kind: 'lab-r3', benches: [{ id: 'main', source: '+z', devices: [{ axis: { tiltDeg: 90 } }], showPrep: true }], shot: 'L-END' },
              bottom: { kind: 'hilbert-plane', psi: { blochDeg: 90 }, basis: 'z', rightAngle: true, shadows: true, ticks: true, shot: 'H-FLAT' },
            },
            terms: { shadow: { kind: 'hilbert-plane', anchor: 'shadow-1' } },
            claims: [{ text: '(1/√2)² = 1/2', holds: () => Math.abs(Math.SQRT1_2 ** 2 - 0.5) < 1e-15 }],
          },
        },
      ],
    },
    // W1: a unit WITHOUT a story next to story units (its blocks render unchanged; 2D widget only, so the
    // < 900 px page has 0 canvases).
    {
      id: 'demo-plain',
      title: 'A unit without a story',
      question: 'Do the old blocks still render next to a story?',
      lecture: { summary: 'A unit without a story keeps the lecture, books, see-it and clues blocks.', pages: 'demo' },
      books: [],
      visual: { kind: 'projector', props: { state: 30, basis: 0 }, tryThis: ['Turn the state arrow.'] },
      clues: [{ ask: 'What is the shadow of the arrow on an axis?', reveal: 'Its amplitude; squared, the probability.' }],
      insight: 'Squared shadows add up to one.',
      play: [],
    },
    // W1: a second story unit (trigger hygiene counts one ScrollTrigger per story unit) on the bloch-ball kind.
    {
      id: 'demo-ball',
      title: 'An oven beam inside the ball',
      question: 'Where does an unpolarized beam sit?',
      lecture: { summary: 'Demo unit: the story replaces this block.', pages: 'demo' },
      books: [],
      visual: { kind: 'sg-lab', props: { source: 'oven', axes: ['x'] }, tryThis: ['Fire a few atoms at an x magnet.'] },
      clues: [],
      insight: 'A mixture sits inside the ball; only pure states reach the surface.',
      play: [],
      beyondLecture: {
        why: 'Mixed states are Lecture 6 material; the ball shows where they live.',
        source: { source: 'townsend', where: '§5.7', adds: 'The density operator and the ball of mixed states.' },
      },
      story: [
        {
          id: 'demo-ball:b1',
          phase: 'lecture',
          text: 'An [[unpolarized]] beam from the [[oven]] has no preferred axis. Its point sits at the {{ball-centre|centre}} of the ball.',
          caption: 'the oven beam: r = 0',
          stage: { kind: 'bloch-ball', point: 'oven', purity: true, shot: 'B-STD' },
          terms: { 'ball-centre': { kind: 'bloch-ball', anchor: 'center' } },
          fidelity: ['ball-inside-not-partly-up'],
          beyondLecture: true,
        },
        {
          id: 'demo-ball:b2',
          phase: 'clue',
          text: 'Mix equal parts $|{+z}\\rangle$ and $|{+x}\\rangle$. Can any single measurement be certain about the mixture?',
          caption: 'the question picture',
          stage: { kind: 'bloch-ball', point: { mix: [{ of: '+z', w: 0.5 }, { of: '+x', w: 0.5 }] }, purity: true, shot: 'B-STD' },
          reveal: {
            text: 'No. Its point sits inside the ball, so the best axis still gives a + with probability below one.',
            caption: 'inside the ball: never certain',
            stage: { kind: 'bloch-ball', point: { mix: [{ of: '+z', w: 0.5 }, { of: '+x', w: 0.5 }] }, recipe: true, purity: true, shot: 'B-STD' },
          },
        },
      ],
    },
  ],
}

/**
 * DEV fixture for widget islands (W-L1 §2.9): the demo story units plus a unit whose "See it" is the 3D
 * Bloch widget. With the stage host present it must draw on the shared canvas (1 WebGL context per page).
 * Served at `#/dev/lecture/demo-island`.
 */
export const DEMO_ISLAND: Lecture = {
  ...DEMO,
  id: 'demo-island',
  title: 'Stage demo with a 3D widget (DEV fixture)',
  units: [
    DEMO.units[0],
    {
      id: 'demo-bloch',
      title: 'A 3D widget next to a story',
      question: 'Does a 3D widget share the one stage canvas?',
      lecture: { summary: 'A 3D widget next to a story keeps the lecture, books, see-it and clues blocks.', pages: 'demo' },
      books: [],
      visual: { kind: 'bloch', props: { theta: 60, phi: 30, measure: 'z', editable: true }, tryThis: ['Drag to orbit the sphere.'] },
      clues: [{ ask: 'Where do orthogonal states sit on this sphere?', reveal: 'At opposite points.' }],
      insight: 'Angles on the Bloch sphere are twice the angles between state vectors.',
      play: [],
    },
  ],
}
