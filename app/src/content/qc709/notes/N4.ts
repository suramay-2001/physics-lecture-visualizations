/**
 * Physics 709 Lecture 4 notes (N4), a short companion: sections I.G.2 and I.G.3 (eigenproblem and products of operators) and I.H
 * (commutators, compatible observables, the uncertainty relation, Eqs. 1.9 and 1.10), printed pages 19 to 22 of the new edition. The prose
 * paraphrases the notes and links the Chapter Q3 unit that teaches each section; both numbers are Chapter Q3's own (q3Quarter, q3RobZSq).
 */
import type { Lecture } from '../../schema'
import { notesLecture } from './kit'
import { V, claim, close } from '../Q3.values'

export const N4: Lecture = notesLecture({
  number: 4,
  title: 'Eigenvalues and uncertainty',
  date: '2026-09-16',
  topics: [
    'eigenvalues and eigenvectors of a Hermitian operator',
    'the spectral form of an operator',
    'commutators and compatible observables',
    'the uncertainty relation',
  ],
  length: 'short',
  symbols: {
    'A': 'n4-spectral:b1',
    '|\\cdot\\rangle': 'n4-spectral:b1',
    '|a_i\\rangle': 'n4-spectral:b1',
    'a_i': 'n4-spectral:b1',
    'a': 'n4-spectral:b1',
    'I': 'n4-spectral:b1',
    '\\langle\\cdot|': 'n4-spectral:b1',
    'f': 'n4-spectral:b1',
    '\\langle\\cdot\\rangle': 'n4-spectral:b1',
    'B': 'n4-commutator:b1',
    'S_i': 'n4-commutator:b1',
    'S_j': 'n4-commutator:b1',
    'i': 'n4-commutator:b1',
    '\\hbar': 'n4-commutator:b1',
    '\\epsilon_ijk': 'n4-commutator:b1',
    'S_k': 'n4-commutator:b1',
    'S': 'n4-commutator:b1',
    '|\\psi\\rangle': 'n4-uncertainty:b1',
    '\\Delta': 'n4-uncertainty:b1',
    '|\\langle[A,B]\\rangle': 'n4-uncertainty:b1',
    '|+z\\rangle': 'n4-uncertainty:b1',
    'S_x': 'n4-uncertainty:b1',
    'S_y': 'n4-uncertainty:b1',
    '|+x\\rangle': 'n4-uncertainty:b1',
    'S_z': 'n4-uncertainty:b1',
  },
  sections: [
    {
      id: 'n4-spectral',
      label: '§I.G.2–G.3',
      title: 'Eigenvalues and products of operators',
      pages: 'pp. 19–20',
      summary: 'A Hermitian operator has real eigenvalues and eigenvectors at right angles, which lets it be written as a sum of eigenvalues times projectors.',
      body: [
        {
          text: 'An eigenvector of $A$ satisfies $A|a_i\\rangle = a_i|a_i\\rangle$, and the eigenvalues solve $\\det(A - aI) = 0$. For a Hermitian operator they are real and eigenvectors of different eigenvalues meet at right angles, so $A = \\sum_i a_i|a_i\\rangle\\langle a_i|$, and a unitary change of basis diagonalizes it. Functions of an operator act on its eigenvalues, $f(A) = \\sum_i f(a_i)|a_i\\rangle\\langle a_i|$. The dispersion of $A$ in a state is $\\langle A^2\\rangle - \\langle A\\rangle^2$ (<<qc-q3-spectral|Unit 3.5>>).',
        },
      ],
    },
    {
      id: 'n4-commutator',
      label: '§I.H.1–H.2',
      title: 'Commutators and compatible observables',
      pages: 'pp. 20–21',
      summary: 'The commutator measures whether the order of two operators matters, and observables whose operators commute can be known together.',
      body: [
        {
          text: `The commutator $[A,B] = AB - BA$ vanishes exactly when the order does not matter. The spin operators obey $[S_i,S_j] = i\\hbar\\,\\epsilon_{ijk}S_k$ (Eq. 1.9), the anticommutator $\\{A,B\\} = AB + BA$ of two different components vanishes, and $S^2 = \\tfrac{3}{4}\\hbar^2$ commutes with each component. Observables whose operators commute are compatible: they share eigenvectors, and repeated measurements of both keep each value definite (<<qc-q3-uncertainty|Unit 3.6>>).`,
          claims: [claim('q3S2Val', 'the squared spin has the value three quarters (hbar = 1)', () => close(V.q3S2Val, 0.75, 1e-9))],
        },
      ],
    },
    {
      id: 'n4-uncertainty',
      label: '§I.H.3',
      title: 'The uncertainty relation',
      pages: 'pp. 21–22',
      summary: 'The Schwarz inequality bounds the product of two dispersions from below by the size of the mean commutator.',
      body: [
        {
          text: `The proof applies the Schwarz inequality to the shifted vectors $\\Delta A|\\psi\\rangle$ and $\\Delta B|\\psi\\rangle$ and gives $\\Delta A^2\\,\\Delta B^2 \\ge \\tfrac{1}{4}|\\langle[A,B]\\rangle|^2$ (Eq. 1.10). For the pair $S_x$, $S_y$ in $|{+z}\\rangle$ the product of the dispersions is $\\tfrac{1}{16}$ in units of $\\hbar^4$ and equals the bound, so this state saturates it. In $|{+x}\\rangle$ the left side is zero, yet $S_x$ and $S_y$ are not compatible: the bound is zero as well, because $\\langle S_z\\rangle = 0$ (<<qc-q3-uncertainty|Unit 3.6>>).`,
          claims: [
            claim('q3Quarter', 'the uncertainty relation carries the factor one quarter', () => close(V.q3Quarter, 0.25, 1e-9)),
            claim('q3RobZSq', 'for the z-up state the product of the S_x and S_y dispersions is one sixteenth (hbar = 1)', () => close(V.q3RobZSq, 1 / 16, 1e-9)),
          ],
        },
      ],
    },
  ],
})
