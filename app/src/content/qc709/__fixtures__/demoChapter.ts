/**
 * DEV fixture: a demo Physics 709 chapter ("Q0") that exercises the platform before any real chapter is written:
 * per-course meta generation (content/meta.test.ts), the id namespaces (content/courses.test.ts), the 709 chapter
 * page at the DEV-only route `#/709/ch/Q0` (pages/Chapter709Page.tsx), and part B: both tracks on every beat and
 * reveal, one derivation, the per-track lints (symbols, claims, sentence caps), the track toggle
 * (e2e/bridge.spec.ts), print notes and figures (figures.test.tsx, e2e/print.spec.ts).
 *
 * NEVER SHIPS: it lives under `__fixtures__/` (outside the chapter glob `qc709/[QF]*.ts`), and the only app imports
 * are behind `import.meta.env.DEV`; build/chunks.test.ts fails if any chunk of a production build holds it.
 * Wording is W's placeholder, not course content; every number comes from the engine (claims keyed `q0…`, their
 * analytic twins in content/claims.test.ts).
 */
import { keyedClaim, pct, d } from '../../claimKit'
import { KET, prob } from '../../../physics/spin'
import type { Lecture } from '../../schema'

export const DEMO_CHAPTER_ID = 'Q0'

/** The fixture's engine values: P(0) on the equator, and the size of each amplitude of |+x⟩. */
export const V = {
  q0Half: prob(KET['+z'], KET['+x']),
  q0Amp: Math.sqrt(prob(KET['+z'], KET['+x'])),
} as const
const claim = keyedClaim<keyof typeof V>()
const half = claim('q0Half', 'an equator state reads 0 half the time', () => Math.abs(V.q0Half - 0.5) < 1e-12)
const amp = claim('q0Amp', 'each amplitude of |+x⟩ has size 1/√2', () => Math.abs(V.q0Amp - Math.SQRT1_2) < 1e-12)

export const Q0: Lecture = {
  id: 'Q0',
  number: 0,
  title: 'Demo chapter (DEV fixture)',
  outcomes: ['See a 709 chapter render through the shared lecture page, in both tracks.'],
  prerequisites: [],
  symbols: {
    '|\\cdot\\rangle': 'q0-demo-sphere:b1',
    '|0\\rangle': 'q0-demo-sphere:b1',
    '|+z\\rangle': 'q0-demo-sphere:b1',
    '|+x\\rangle': 'q0-demo-sphere:b2',
    P: 'q0-demo-sphere:b3',
    '|1\\rangle': 'q0-demo-sphere:b4',
    // Ground-up meets a bracket only on the review card; Formal has it from the Born-rule gloss at b3
    '\\langle\\cdot|\\cdot\\rangle': 'q0-demo-sphere.review',
  },
  // the Formal track names the rotation (Ground-up says "a quarter turn")
  symbolsFormal: { R_y: 'q0-demo-sphere:b2', '\\pi': 'q0-demo-sphere:b2' },
  units: [
    {
      id: 'q0-demo-sphere',
      title: 'A state on the sphere',
      question: 'Does a 709 chapter drive the same stage as a 448 lecture, in either track?',
      lecture: { summary: 'Demo unit: the story replaces this block.', pages: 'demo' },
      books: [],
      visual: { kind: 'bloch', props: { theta: 90, phi: 0, measure: 'z', editable: true }, tryThis: ['Drag the state to a pole.'] },
      clues: [],
      insight: 'The state $|0\\rangle$ is the north pole, the same point as $|{+z}\\rangle$ in Spin Lab.',
      insightFormal: 'Under $|0\\rangle \\equiv |{+z}\\rangle$ the computational basis sits at the poles, and every equator state gives each outcome with equal probability.',
      play: [],
      claims: [half, amp],
      review: {
        points: ['The north pole is $|0\\rangle$ and the south pole is $|1\\rangle$.', `An equator state reads 0 or 1 with ${pct(V.q0Half)} each.`],
        equations: `P(0) = |\\langle 0|{+x}\\rangle|^2 = ${'\\tfrac12'}`,
        trap: 'Opposite points on the sphere are opposite states, not a right angle apart.',
        formal: {
          points: ['Antipodal points of the Bloch sphere are orthogonal states: $\\langle 0|1\\rangle = 0$.', `Every equator state has $P(0) = P(1) = ${'\\tfrac12'}$.`],
          trap: 'A half turn on the sphere is a right angle between the kets, so antipodal points never overlap.',
        },
      },
      story: [
        {
          id: 'q0-demo-sphere:b1',
          phase: 'lecture',
          text: 'The state $|0\\rangle$ sits at the north pole of the sphere.',
          formal:
            'The computational basis state $|0\\rangle$ is the north pole of the [[bloch-sphere|Bloch sphere]], the same point as Spin Lab’s $|{+z}\\rangle$, so both courses colour it amber.',
          stage: { kind: 'bloch', state: '+z', shot: 'B-STD' },
        },
        {
          id: 'q0-demo-sphere:b2',
          phase: 'lecture',
          text: 'A quarter turn about the $y$ axis carries it down to the equator, where it becomes $|{+x}\\rangle$.',
          formal: 'The rotation $R_y(\\pi/2)$ maps $|0\\rangle$ to $|{+x}\\rangle$, the point where the equator meets the $x$ axis.',
          stage: { kind: 'bloch', state: '+z', rotate: { axis: 'y', angleDeg: { from: 0, to: 90 } }, trail: true, shot: 'B-STD' },
        },
        {
          id: 'q0-demo-sphere:b3',
          phase: 'books',
          text: `On the equator the two outcomes are equally likely: ${pct(V.q0Half)} each.`,
          formal: `By the [[born-rule|Born rule]], $P(0) = |\\langle 0|{+x}\\rangle|^2 = ${'\\tfrac12'}$, and the same holds for every state on the equator.`,
          caption: `Amplitudes ${d(V.q0Amp)} and ${d(V.q0Amp)}: the chance of 0 is ${pct(V.q0Half)}.`,
          captionFormal: `Amplitudes ${d(V.q0Amp)} and ${d(V.q0Amp)}; $P(0) = ${'\\tfrac12'}$.`,
          derivation: {
            result: `P(0) = ${'\\tfrac12'}`,
            ground: [
              { why: 'Write the equator state as a column of two numbers. The top slot counts 0 and the bottom slot counts 1.', tex: '|{+x}\\rangle = \\begin{pmatrix} 1/\\sqrt2 \\\\ 1/\\sqrt2 \\end{pmatrix}' },
              { why: 'The chance of reading 0 is the top number, squared.', tex: 'P(0) = \\left(\\tfrac{1}{\\sqrt2}\\right)^2' },
              { why: 'A square root times itself gives back what was under it, so this is one over two.', tex: 'P(0) = \\tfrac{1}{\\sqrt2}\\cdot\\tfrac{1}{\\sqrt2} = \\tfrac12', claims: [half] },
            ],
            formal: [
              { why: 'The Born rule in the computational basis.', tex: 'P(0) = |\\langle 0|{+x}\\rangle|^2 = \\left|\\tfrac{1}{\\sqrt2}\\right|^2' },
              { why: 'Evaluate the modulus squared.', tex: 'P(0) = \\tfrac12', claims: [half] },
            ],
          },
          stage: { kind: 'bloch', state: '+x', measure: 'z', shot: 'B-STD' },
        },
        {
          id: 'q0-demo-sphere:b4',
          phase: 'clue',
          text: 'Where on the sphere is $|1\\rangle$?',
          formal: 'Which point of the sphere represents $|1\\rangle$?',
          stage: { kind: 'bloch', state: '+z', shot: 'B-STD' },
          reveal: {
            text: 'At the south pole, opposite $|0\\rangle$. Opposite points are states that never give the same reading.',
            formal: 'The south pole: antipodal points are [[orthogonal|orthogonal]] states, $\\langle 0|1\\rangle = 0$.',
            stage: { kind: 'bloch', state: '-z', path: { about: 'y' }, shot: 'B-STD' },
          },
        },
      ],
    },
    {
      id: 'q0-demo-plain',
      title: 'A plain unit',
      question: 'Does a unit without a story still render?',
      lecture: { summary: 'A unit with no story shows the lecture, books and clue blocks.', pages: 'demo' },
      books: [],
      visual: { kind: 'bloch', props: { theta: 0, phi: 0 }, tryThis: ['Turn the state.'] },
      clues: [{ ask: 'Where is $|1\\rangle$?', reveal: 'At the south pole, opposite $|0\\rangle$.' }],
      insight: 'Every unit of a 709 chapter uses the same parts as a 448 unit.',
      play: [
        {
          id: 'q0-demo-plain-c1',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Even odds',
          prompt: 'A state on the equator is measured in the computational basis. What is the probability of 0?',
          answer: V.q0Half,
          tolerance: 0.001,
          unit: 'probability',
          hints: [{ text: 'Where is the equator relative to the poles?' }, { text: 'Halfway between $|0\\rangle$ and $|1\\rangle$.' }, { text: 'So neither outcome is favoured.' }],
          walkthrough: [{ text: 'The equator is equidistant from both poles, so the two outcomes share the probability equally.' }],
        },
      ],
    },
  ],
}
