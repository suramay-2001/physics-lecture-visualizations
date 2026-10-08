/**
 * DEV fixture for the 448 platform pass (interface changes W-448 #1–#4; rulings 448-L8L11 P1–P4), served at
 * `#/dev/lecture/demo-platform` through the real LecturePage (e2e/story.spec.ts). It is a ONE-TRACK lecture, as 448's
 * are, and walks each new seam once:
 *   demo-platform       a class marker with no `from` (b2), a one-track derivation with two views (b3, no `formal` list), a clue (b4) and a "Go deeper" beat after the clues (b5, phase `'deeper'`);
 *   demo-platform-late  a class marker with `from` ("Class 3 · from minute 23") on the first beat of a later unit.
 * Wording is W's placeholder, not course content. NEVER SHIPS: under `__fixtures__/`, imported only by DEV code and
 * tests (build/chunks.test.ts (k) fails if a production chunk holds it).
 */
import { KET, prob } from '../../physics/spin'
import type { Lecture } from '../schema'

export const DEMO_PLATFORM: Lecture = {
  id: 'demo-platform',
  number: 0,
  title: 'Platform demo (DEV fixture)',
  outcomes: ['See a class marker, a Go-deeper beat and a one-track derivation.'],
  prerequisites: [],
  units: [
    {
      id: 'demo-platform',
      title: 'A class starts mid-chapter',
      question: 'Does the page show where a class begins, and keep Go-deeper material apart?',
      lecture: { summary: 'Demo unit: the story replaces this block.', pages: 'demo' },
      books: [],
      visual: { kind: 'sg-lab', props: { source: '+x', axes: ['z'] }, tryThis: ['Fire a few atoms.'] },
      clues: [],
      insight: 'A chapter is cut by topic, so a class can begin in the middle of it.',
      play: [],
      story: [
        {
          id: 'demo-platform:b1',
          phase: 'lecture',
          text: 'The state $|{+z}\\rangle$ sits at the north pole of the sphere.',
          stage: { kind: 'bloch', state: '+z', shot: 'B-STD' },
        },
        {
          id: 'demo-platform:b2',
          phase: 'lecture',
          classMark: { class: 2 },
          text: 'A quarter turn about the $y$ axis carries it down to the equator, where it becomes $|{+x}\\rangle$.',
          stage: { kind: 'bloch', state: '+z', rotate: { axis: 'y', angleDeg: { from: 0, to: 90 } }, trail: true, shot: 'B-STD' },
        },
        {
          id: 'demo-platform:b3',
          phase: 'books',
          text: 'Measure the $z$ state along $x$: both outcomes are equally likely.',
          // a one-track derivation (W-448 #3): `{result, ground}`, no `formal` list; two distinct views, the last
          // matching this beat's own resting stage
          derivation: {
            result: 'P(+x) = \\tfrac12',
            ground: [
              {
                why: 'Write the state as a column of two numbers.',
                tex: '|{+z}\\rangle = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}',
                view: { kind: 'bloch', state: '+z', shot: 'B-STD' },
                viewCaption: 'The state, before any measurement axis is drawn.',
              },
              {
                why: 'The overlap with the $x$ state has size one over root two, and its square is one half.',
                tex: 'P(+x) = \\left|\\tfrac{1}{\\sqrt2}\\right|^2 = \\tfrac12',
                claims: [{ text: 'P(+x) for a state along z is 1/2', holds: () => Math.abs(prob(KET['+z'], KET['+x']) - 0.5) < 1e-12 }],
                view: { kind: 'bloch', state: '+z', measure: 'x', shot: 'B-STD' },
                viewCaption: 'Measuring along $x$.',
              },
            ],
          },
          stage: { kind: 'bloch', state: '+z', measure: 'x', shot: 'B-STD' },
        },
        {
          id: 'demo-platform:b4',
          phase: 'clue',
          text: 'Where on the sphere is $|{-z}\\rangle$?',
          stage: { kind: 'bloch', state: '+z', shot: 'B-STD' },
          reveal: {
            text: 'At the south pole, opposite $|{+z}\\rangle$.',
            stage: { kind: 'bloch', state: '-z', path: { about: 'y' }, shot: 'B-STD' },
          },
        },
        {
          // W-448 #2: after the clues, boxed apart, labelled "Go deeper · beyond the notes"
          id: 'demo-platform:b5',
          phase: 'deeper',
          text: 'Beyond the notes: turn the equator state about the $z$ axis by a half turn, and watch the point travel round the equator.',
          stage: { kind: 'bloch', state: '+x', rotate: { axis: 'z', angleDeg: { from: 0, to: 180 } }, trail: true, shot: 'B-STD' },
        },
      ],
    },
    {
      id: 'demo-platform-late',
      title: 'A class resumes part-way through',
      question: 'Does a marker with a minute read as a class that has already begun?',
      lecture: { summary: 'Demo unit: the story replaces this block.', pages: 'demo' },
      books: [],
      visual: { kind: 'sg-lab', props: { source: '+x', axes: ['z'] }, tryThis: ['Fire a few atoms.'] },
      clues: [],
      insight: 'The marker names the class, and the minute when this chapter takes it up.',
      play: [],
      story: [
        {
          id: 'demo-platform-late:b1',
          phase: 'lecture',
          classMark: { class: 3, from: 'minute 23' },
          text: 'The state $|{+x}\\rangle$ lies on the equator of the sphere.',
          stage: { kind: 'bloch', state: '+x', shot: 'B-STD' },
        },
        {
          id: 'demo-platform-late:b2',
          phase: 'lecture',
          text: 'A half turn about the $z$ axis carries it to $|{-x}\\rangle$.',
          stage: { kind: 'bloch', state: '+x', rotate: { axis: 'z', angleDeg: { from: 0, to: 180 } }, trail: true, shot: 'B-STD' },
        },
      ],
    },
  ],
}
