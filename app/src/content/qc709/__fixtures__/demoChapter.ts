/**
 * DEV fixture: a demo Physics 709 chapter ("Q0") that exercises the platform before any real chapter is written:
 * per-course meta generation (content/meta.test.ts), the id namespaces (content/courses.test.ts), and the 709 chapter
 * page at the DEV-only route `#/709/ch/Q0` (pages/Chapter709Page.tsx). Part B grows it into the two-track and
 * bridge demo (W-709-platform §C "Tests").
 *
 * NEVER SHIPS: it lives under `__fixtures__/` (outside the chapter glob `qc709/[QF]*.ts`), and the only app import is
 * behind `import.meta.env.DEV`; build/chunks.test.ts fails if any chunk of a production build holds it.
 * Wording is W's placeholder, not course content; numbers come from the engine.
 */
import { KET, prob } from '../../../physics/spin'
import type { Lecture } from '../../schema'

export const DEMO_CHAPTER_ID = 'Q0'

const half = prob(KET['+z'], KET['+x'])

export const Q0: Lecture = {
  id: 'Q0',
  number: 0,
  title: 'Demo chapter (DEV fixture)',
  outcomes: ['See a 709 chapter render through the shared lecture page.'],
  prerequisites: [],
  units: [
    {
      id: 'q0-demo-sphere',
      title: 'One qubit on the sphere',
      question: 'Does a 709 chapter drive the same stage as a 448 lecture?',
      lecture: { summary: 'Demo unit: the story replaces this block.', pages: 'demo' },
      books: [],
      visual: { kind: 'bloch', props: { theta: 90, phi: 0, measure: 'z', editable: true }, tryThis: ['Drag the state to a pole.'] },
      clues: [],
      insight: 'The qubit state |0⟩ is the north pole, the same point as |+z⟩ in Spin Lab.',
      play: [],
      claims: [{ text: 'An equator state reads 0 or 1 with even odds.', holds: () => Math.abs(half - 0.5) < 1e-12 }],
      story: [
        { id: 'q0-demo-sphere:b1', phase: 'lecture', text: 'The state $|0\\rangle$ sits at the north pole.', stage: { kind: 'bloch', state: '+z', shot: 'B-STD' } },
        {
          id: 'q0-demo-sphere:b2',
          phase: 'lecture',
          text: 'A quarter turn about $y$ carries it to the equator.',
          stage: { kind: 'bloch', state: '+z', rotate: { axis: 'y', angleDeg: { from: 0, to: 90 } }, trail: true, shot: 'B-STD' },
        },
        { id: 'q0-demo-sphere:b3', phase: 'books', text: 'On the equator the two outcomes are equally likely.', stage: { kind: 'bloch', state: '+x', measure: 'z', shot: 'B-STD' } },
      ],
    },
    {
      id: 'q0-demo-plain',
      title: 'A plain unit',
      question: 'Does a unit without a story still render?',
      lecture: { summary: 'A unit with no story shows the lecture, books and clue blocks.', pages: 'demo' },
      books: [],
      visual: { kind: 'bloch', props: { theta: 0, phi: 0 }, tryThis: ['Turn the state.'] },
      clues: [{ ask: 'Where is |1⟩?', reveal: 'At the south pole, opposite |0⟩.' }],
      insight: 'Every unit of a 709 chapter uses the same parts as a 448 unit.',
      play: [
        {
          id: 'q0-demo-plain-c1',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Even odds',
          prompt: 'A qubit on the equator is measured in the computational basis. What is the probability of 0?',
          answer: half,
          tolerance: 0.001,
          unit: 'probability',
          hints: [{ text: 'Where is the equator relative to the poles?' }, { text: 'Halfway between |0⟩ and |1⟩.' }, { text: 'So neither outcome is favoured.' }],
          walkthrough: [{ text: 'The equator is equidistant from both poles, so the two outcomes share the probability equally.' }],
        },
      ],
    },
  ],
}
