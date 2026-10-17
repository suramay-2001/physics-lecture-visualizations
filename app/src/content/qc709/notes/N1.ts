/**
 * Physics 709 Lecture 1 notes (N1): the SEED lecture of the "Lecture notes" section (ruling W5), so the platform has a real
 * subject. Section I.A (the Stern–Gerlach experiment) and I.B (the formalism: superposition, vector spaces, the inner
 * product), printed pages 4 to 7 of the new edition of the notes. The prose is a paraphrase in the Formal register of the
 * notes (the content builder replaces it with the final text); every number is computed in N1.values.ts and backed by a
 * keyed claim (twin: pipeline/claims_notes/n1.py); the section links lead to the built Chapter Q1.
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
    'states as kets in a Hilbert space',
    'the superposition principle',
    'vector spaces and the inner product',
  ],
  length: 'short',
  symbols: {
    '\\mu_z': 'n1-stern-gerlach:b1',
    S_z: 'n1-stern-gerlach:b1',
    '\\hbar': 'n1-stern-gerlach:b1',
    '|\\cdot\\rangle': 'n1-stern-gerlach:b2',
    '|+z\\rangle': 'n1-stern-gerlach:b2',
    '|-z\\rangle': 'n1-stern-gerlach:b2',
    '|+x\\rangle': 'n1-stern-gerlach:b2',
    '|-x\\rangle': 'n1-stern-gerlach:b2',
    '|\\psi\\rangle': 'n1-formalism:b1',
    c_1: 'n1-formalism:b1',
    c_2: 'n1-formalism:b1',
    '|\\psi_1\\rangle': 'n1-formalism:b1',
    '|\\psi_2\\rangle': 'n1-formalism:b1',
  },
  sections: [
    {
      id: 'n1-stern-gerlach',
      label: '§I.A',
      title: 'The Stern–Gerlach experiment',
      pages: 'pp. 4–5',
      summary: 'Silver atoms sent through a magnet that varies in space land in two narrow beams, so the moment along the field takes only two values.',
      body: [
        {
          text: 'In the [[qc-stern-gerlach|Stern–Gerlach experiment]], silver atoms fly through a magnetic field that changes along $z$. The force on an atom depends on its moment, so where it lands records the moment’s $z$ component $\\mu_z$. A classical moment would smear the beam. We see two narrow beams, so $\\mu_z$ is [[qc-quantized|quantized]] and the spin component is $S_z = \\pm\\hbar/2$.',
        },
        {
          text: `We write $|{+z}\\rangle$ and $|{-z}\\rangle$ for the atoms with the moment up and down. A beam kept by one $z$ magnet passes a second $z$ magnet unchanged. Turn the second magnet to $x$ and the atoms leave in $|{\\pm x}\\rangle$; a last $z$ magnet then passes the up atoms with chance $${tf(V.n1UpAfterX)}$. The second measurement erased what the first prepared (<<qc-q1-sequences|Unit 1.2>>).`,
          figure: { stage: { kind: 'amplitudes', state: { dir: '+x' }, mode: 'probability', labels: 'spin' }, caption: 'The state $|{+x}\\rangle$ drawn along $z$: both outcomes get an equal bar.' },
          claims: [claim('n1UpAfterX', 'after z up then x up, the last z magnet passes up atoms with chance one half', () => close(V.n1UpAfterX, 0.5, 1e-9))],
        },
      ],
    },
    {
      id: 'n1-formalism',
      label: '§I.B',
      title: 'The formalism',
      pages: 'pp. 5–7',
      summary: 'States are kets in a vector space with an inner product, and any complex combination of allowed states is again an allowed state.',
      body: [
        {
          text: 'A system is described by a state, a ket $|\\psi\\rangle$. Kets live in a [[qc-vector-space|vector space]] with an [[qc-inner-product|inner product]], which supplies lengths and angles; such a space is a [[qc-hilbert-space|Hilbert space]]. The [[qc-superposition|superposition principle]] says that if two states are allowed, so is $c_1|\\psi_1\\rangle + c_2|\\psi_2\\rangle$ for complex $c_1$ and $c_2$ (<<qc-q1-superposition|Unit 1.3>>).',
        },
        {
          text: 'The rules of a vector space ask that sums and scalar multiples stay in the space, that addition commutes and associates, that a zero vector and inverses exist, and that scalars distribute over sums. Lists of numbers and polynomials are examples.',
        },
        {
          text: 'The inner product pairs a bra with a ket and returns a number. A ket paired with itself gives a real number that is never negative. Exchanging the slots conjugates the result. The square root of that self-pairing is the length, and two vectors at right angles pair to zero (<<qc-q1-inner-product|Unit 1.5>>).',
        },
      ],
    },
  ],
})
