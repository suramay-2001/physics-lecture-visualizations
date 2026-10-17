/**
 * Physics 709 Lecture 1 notes (N1), a short companion: sections I.A (the Stern–Gerlach experiment) and I.B.1 to I.B.3 (superposition,
 * vector spaces, the inner product), printed pages 4 to 7 of the new edition of the notes. The prose paraphrases the notes in their
 * Formal register and links the Chapter Q1 unit that teaches each section. The one number is the sequence result of the platform
 * seed (`n1UpAfterX`, twin pipeline/claims_notes/n1.py): the platform's mutation tests (notes.test.ts) name that key.
 */
import type { Lecture } from '../../schema'
import { notesLecture } from './kit'
import { V, claim, close, tf } from './N1.values'

export const N1: Lecture = notesLecture({
  number: 1,
  title: 'From Stern–Gerlach to kets',
  date: '2026-09-02',
  topics: [
    'the Stern–Gerlach experiment and two spots',
    'a second magnet erasing the first',
    'states as kets and the superposition principle',
    'the rules of a vector space',
    'the inner product, length and right angles',
  ],
  length: 'short',
  symbols: {
    '\\mu_z': 'n1-stern-gerlach:b1',
    S_z: 'n1-stern-gerlach:b1',
    '\\hbar': 'n1-stern-gerlach:b1',
    '|\\cdot\\rangle': 'n1-stern-gerlach:b2',
    '|+z\\rangle': 'n1-stern-gerlach:b2',
    '|+x\\rangle': 'n1-stern-gerlach:b2',
    '|\\psi\\rangle': 'n1-superposition:b1',
    '|\\psi_1\\rangle': 'n1-superposition:b1',
    '|\\psi_2\\rangle': 'n1-superposition:b1',
    c_1: 'n1-superposition:b1',
    c_2: 'n1-superposition:b1',
    n: 'n1-vector-space:b1',
    '\\langle\\cdot|\\cdot\\rangle': 'n1-inner-product:b1',
    '\\alpha': 'n1-inner-product:b1',
    '|\\alpha\\rangle': 'n1-inner-product:b1',
    '|\\beta\\rangle': 'n1-inner-product:b1',
    M: 'n1-inner-product:b1',
  },
  sections: [
    {
      id: 'n1-stern-gerlach',
      label: '§I.A',
      title: 'The Stern–Gerlach experiment',
      pages: 'pp. 4–5',
      summary: 'Silver atoms in a field that changes along one axis land in two narrow beams, and a second magnet along another axis erases what the first one prepared.',
      body: [
        {
          text: 'The [[qc-stern-gerlach|Stern–Gerlach experiment]] sends silver atoms through a magnetic field that changes along $z$, so each atom is pushed according to its moment $\\mu_z$. The screen shows two narrow beams, not a smear: the moment is [[qc-quantized|quantized]], and the spin component takes only the values $S_z = \\pm\\hbar/2$ (p. 4; <<qc-q1-two-spots|Unit 1.1>>).',
        },
        {
          text: `Call the atoms of the upper beam $|{+z}\\rangle$ and send them through a magnet along $x$. Keep the $|{+x}\\rangle$ beam and test it with a last $z$ magnet: both outcomes appear, and the up atoms pass with chance $${tf(V.n1UpAfterX)}$. A later measurement can destroy what an earlier one prepared (p. 5; <<qc-q1-sequences|Unit 1.2>>).`,
          figure: { stage: { kind: 'amplitudes', state: { dir: '+x' }, mode: 'probability', labels: 'spin' }, caption: 'The state $|{+x}\\rangle$ drawn along $z$: both outcomes get an equal bar.' },
          claims: [claim('n1UpAfterX', 'after z up then x up, the last z magnet passes up atoms with chance one half', () => close(V.n1UpAfterX, 0.5, 1e-9))],
        },
      ],
    },
    {
      id: 'n1-superposition',
      label: '§I.B.1',
      title: 'Superposition',
      pages: 'p. 5',
      summary: 'Any complex combination of two allowed states is again an allowed state.',
      body: [
        {
          text: 'A system is described by a ket $|\\psi\\rangle$ in a [[qc-hilbert-space|Hilbert space]]. The [[qc-superposition|superposition principle]] says that if $|\\psi_1\\rangle$ and $|\\psi_2\\rangle$ are allowed, so is $c_1|\\psi_1\\rangle + c_2|\\psi_2\\rangle$ for complex $c_1$ and $c_2$ (<<qc-q1-superposition|Unit 1.3>>).',
        },
      ],
    },
    {
      id: 'n1-vector-space',
      label: '§I.B.2',
      title: 'Linear vector spaces',
      pages: 'pp. 5–6',
      summary: 'A vector space is a set that is closed under addition and scaling and obeys a short list of rules, which arrows, complex columns and polynomials all satisfy.',
      body: [
        {
          text: 'A [[qc-vector-space|vector space]] is a set with addition and scaling that never leave the set. Addition commutes and associates, a zero vector and additive inverses exist, and scalars distribute. Columns of $n$ numbers and polynomials of bounded degree are examples (<<qc-q1-vector-space|Unit 1.4>>).',
        },
      ],
    },
    {
      id: 'n1-inner-product',
      label: '§I.B.3',
      title: 'The inner product',
      pages: 'pp. 6–7',
      summary: 'The inner product pairs a bra with a ket and supplies lengths and angles, with right angles pairing to zero.',
      body: [
        {
          text: 'The [[qc-inner-product|inner product]] $\\langle\\alpha|\\beta\\rangle$ pairs a bra with a ket. A ket paired with itself gives a real number that is never negative, swapping the slots conjugates the result, and the length of $\\alpha$ is the square root of that self-pairing. A Hermitian matrix $M$ with positive eigenvalues gives other valid pairings on p. 7 (<<qc-q1-inner-product|Unit 1.5>>).',
        },
      ],
    },
  ],
})
