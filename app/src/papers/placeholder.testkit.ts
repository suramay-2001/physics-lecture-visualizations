/**
 * Paper P1: Yoder et al., Tour de gross (IBM, arXiv:2506.03094v1, 2025), source id `paper-tdg` (git-ignored PDF).
 * PLACEHOLDER STUB (docs/specs/papers-platform.md §6): metadata, one unit drawn by a demo recipe, one reported claim and
 * one trail entry, so the routes, styles and tests exist. The real lecture comes later, from the reference crawl and plans.
 *
 * DATA ONLY: this file is what the offline pipeline (and later a smart tool) emits. papers/specData.test.ts proves it holds
 * nothing but literals; papers/validate.ts checks it; papers/compile.ts turns it into a Lecture.
 */
import type { PaperSpec } from './spec'

export const PLACEHOLDER: PaperSpec = {
  specVersion: 1,
  id: 'P1',
  kind: 'paper',
  title: 'Tour de gross: a quantum computer built from code modules',
  paper: {
    shortTitle: 'Tour de gross',
    authors: ['Yoder', 'Schoute', 'Rall', 'Pritchett', 'Gambetta', 'Cross', 'Carroll', 'Beverland'],
    arxiv: { id: '2506.03094', version: 1 },
    date: '2025-06',
    institution: 'IBM Quantum',
    source: 'paper-tdg',
    licence:
      'arXiv non-exclusive distribution licence 1.0. This lecture paraphrases and cites the paper by section, page, figure or table; it never reproduces its text or figures.',
  },
  outcomes: [
    'Say what a check is, and why a code state answers +1 to every one of its checks.',
    'Find the size of the gross code where the paper prints it, and tell a reported number from one this site computes.',
  ],
  references: [
    {
      id: 'bra24',
      label: 'Bravyi et al. 2024',
      arxiv: { id: '2308.07915' },
      doi: '10.1038/s41586-024-07107-7',
      depth: 1,
      status: 'cited',
      why: 'The paper takes its two codes, the gross code among them, from this earlier search for bivariate bicycle codes.',
      taughtIn: { course: 'qc709', chapter: 'Q22', unit: 'q22-stabilizer' },
    },
  ],
  prerequisites: [
    { id: 'qubit', label: 'A qubit and its two kets', teach: { course: 'qc709', chapter: 'Q4', unit: 'q4-qubit' }, needs: [] },
    { id: 'register', label: 'Registers of several qubits', teach: { course: 'qc709', chapter: 'Q4', unit: 'q4-registers' }, needs: ['qubit'] },
    { id: 'eigen', label: 'A measurement and its eigenvalues', teach: { course: 'sl448', chapter: 'L3', unit: 'l3-eigen' }, needs: [] },
    { id: 'bell', label: 'The four Bell states', teach: { course: 'qc709', chapter: 'Q6', unit: 'q6-bell-basis' }, needs: ['register'] },
    { id: 'stabilizer', label: 'Stabilizer codes', teach: { course: 'qc709', chapter: 'Q22', unit: 'q22-stabilizer' }, needs: ['bell', 'eigen'], ref: 'bra24' },
    { id: 'checks', label: 'Checks a code state passes', teach: { course: 'papers', chapter: 'P1', unit: 'p1-criteria' }, needs: ['stabilizer'] },
  ],
  symbols: {
    '|\\cdot\\rangle': 'p1-checks:b2',
    '|00\\rangle': 'p1-checks:b2',
    '|11\\rangle': 'p1-checks:b2',
  },
  symbolsFormal: {
    X: 'p1-checks:b2',
    Z: 'p1-checks:b2',
    '\\otimes': 'p1-checks:b2',
    '|\\Phi^+\\rangle': 'p1-checks:b2',
  },
  units: [
    {
      id: 'p1-checks',
      title: 'Checks that a code state passes',
      question: 'What does it mean for a state to pass the checks of a code?',
      source: {
        summary: 'Each module of the paper’s computer runs one bivariate bicycle code; its first example is the gross code.',
        where: '§2.1, p. 9',
      },
      tryIt: {
        kind: 'pair-grid',
        props: { preset: 'family', t: 45 },
        tryThis: ['Slide the angle back to zero and watch the table split into a column times a row.', 'Return to the start: the two spins of this pair always give opposite answers.'],
      },
      insight: 'A code state is one that every check leaves alone: each check answers +1 on it.',
      insightFormal: 'The code space is the joint +1 eigenspace of commuting Pauli checks; a Bell pair is the two-qubit case, fixed by both of its checks.',
      story: [
        {
          id: 'p1-checks:b1',
          phase: 'lecture',
          text: 'The paper builds a quantum computer out of modules. Each module stores its [[qubit|qubits]] in one code, called the gross code. The paper prints the size of that code as three numbers.',
          formal:
            'The bicycle architecture is modular: every module encodes its [[qubit|qubits]] in one bivariate bicycle code, and the paper’s first worked example is the gross code, whose parameters it reports in the usual double-bracket form.',
          stage: { recipe: 'bell-amplitudes', params: { state: 'Phi+', show: 'probability' } },
          caption: 'The smallest state a check can fix: two qubits, two equal chances.',
          captionFormal: 'The chances of the Bell pair: the two kets the checks allow, equally likely.',
          reported: [
            {
              id: 'gross-params',
              text: 'the gross code: physical qubits, logical qubits and distance',
              value: '[[144, 12, 12]]',
              source: 'paper-tdg',
              at: { kind: 'figure', label: '3b', page: 9 },
            },
          ],
        },
        {
          id: 'p1-checks:b2',
          phase: 'books',
          text: 'A [[pp-check|check]] is <<pp-l3-eigen|a measurement with answers +1 and −1>>. The Bell pair, $|00\\rangle$ and $|11\\rangle$ in equal parts, passes two checks at once. Turning every 0 into 1 on both qubits changes nothing. A minus sign on each 1 changes nothing either, because the two signs cancel. It is one of <<pp-q6-bell-basis|the four Bell states>>.',
          formal:
            'A [[pp-check|check]] is a Pauli product with eigenvalues ±1, <<pp-l3-eigen|an observable and its eigenvalues>>. The state $|\\Phi^+\\rangle$ is fixed by both $X\\otimes X$ and $Z\\otimes Z$, the smallest code space; it is one of <<pp-q6-bell-basis|the four Bell states>>.',
          stage: { recipe: 'bell-amplitudes', params: { state: 'Phi+' } },
          caption: 'Two bars of size 0.707: the state the two checks leave alone.',
          captionFormal: 'Amplitudes 0.707 on $|00\\rangle$ and $|11\\rangle$: the joint +1 eigenstate of both checks.',
          claims: [{ key: 'p1BellAmp', text: 'each nonzero amplitude of the Bell pair has size 1/√2', from: { recipe: 'bell-amplitudes', params: { state: 'Phi+' } }, value: 'a00' }],
          trail: [
            {
              ref: 'bra24',
              at: 'the codes it found, cited in §2.1 (p. 9)',
              why: 'The gross code comes from that search, and its checks follow the same rule as these two: every code state answers +1.',
            },
          ],
        },
      ],
    },
  ],
}
