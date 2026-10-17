/**
 * Physics 709 Lecture 2 notes (N2), a short companion: sections I.C (bases, Gram–Schmidt, the spin-½ space, change of basis, photon
 * polarization) and I.D.1 (matrix representation of an operator), printed pages 8 to 12 of the new edition, Eqs. 1.1 to 1.3. The prose
 * paraphrases the notes and links the Chapter Q2 unit that teaches each section; the one number is Chapter Q2's own (q2ZXOverlap).
 */
import type { Lecture } from '../../schema'
import { notesLecture } from './kit'
import { V, claim, close, d } from '../Q2.values'

export const N2: Lecture = notesLecture({
  number: 2,
  title: 'Bases, change of basis and operators',
  date: '2026-09-09',
  topics: [
    'bases and components',
    'the Gram–Schmidt procedure',
    'the spin-½ space and the x basis',
    'change of basis by a unitary matrix',
    'photon polarization',
    'operators as matrices',
  ],
  length: 'short',
  symbols: {
    '\\langle\\cdot|\\cdot\\rangle': 'n2-basis:b1',
    '|e_i\\rangle': 'n2-basis:b1',
    '|\\psi\\rangle': 'n2-basis:b1',
    'c_i': 'n2-basis:b1',
    '|\\cdot\\rangle': 'n2-spin-space:b1',
    '|+z\\rangle': 'n2-spin-space:b1',
    '|-z\\rangle': 'n2-spin-space:b1',
    '|+x\\rangle': 'n2-spin-space:b1',
    '|-x\\rangle': 'n2-spin-space:b1',
    'c': 'n2-change:b1',
    'U': 'n2-change:b1',
    '|\\alpha\'_i\\rangle': 'n2-change:b1',
    '|\\alpha_k\\rangle': 'n2-change:b1',
    'U_ik': 'n2-change:b1',
    '\\varphi': 'n2-photon:b1',
    '|R\\rangle': 'n2-photon:b1',
    '|L\\rangle': 'n2-photon:b1',
    'e': 'n2-photon:b1',
    'i': 'n2-photon:b1',
    'A': 'n2-operators:b1',
    'A_ij': 'n2-operators:b1',
    '|\\alpha\\rangle': 'n2-operators:b1',
    '\\langle\\cdot|': 'n2-operators:b1',
    '|\\beta\\rangle': 'n2-operators:b1',
  },
  sections: [
    {
      id: 'n2-basis',
      label: '§I.C.1–C.2',
      title: 'Basis and Gram–Schmidt',
      pages: 'p. 8',
      summary: 'A basis reaches every vector with unique components, and Gram–Schmidt builds a right-angled basis out of any independent set.',
      body: [
        {
          text: 'A [[qc-basis|basis]] is an independent set that reaches every vector with unique components. In an [[qc-orthonormal-basis|orthonormal basis]] the component is $c_i = \\langle e_i|\\psi\\rangle$, and the Gram–Schmidt procedure builds such a basis from any independent set by subtracting projections and rescaling (<<qc-q2-basis|Unit 2.1>>, <<qc-q2-gram-schmidt|Unit 2.2>>).',
        },
      ],
    },
    {
      id: 'n2-spin-space',
      label: '§I.C.3',
      title: 'The spin-½ space',
      pages: 'pp. 8–10',
      summary: 'Spin states live in a two-dimensional space, and the x states are fixed by the signs chosen for their two components.',
      body: [
        {
          text: `The spin states form a two-dimensional space with basis $|{+z}\\rangle$ and $|{-z}\\rangle$. With the notes' phases, $|{+x}\\rangle = (|{+z}\\rangle + |{-z}\\rangle)/\\sqrt2$ and $|{-x}\\rangle = (|{+z}\\rangle - |{-z}\\rangle)/\\sqrt2$ (Eqs. 1.1–1.2), so each x state overlaps $|{+z}\\rangle$ by ${d(V.q2ZXOverlap, 4)}, the two components having equal size because the z outcomes are equally likely (<<qc-q2-spin-space|Unit 2.3>>).`,
          claims: [claim('q2ZXOverlap', 'the overlap of the z and x states has size 0.7071', () => close(V.q2ZXOverlap, Math.SQRT1_2, 1e-9))],
        },
      ],
    },
    {
      id: 'n2-change',
      label: '§I.C.4',
      title: 'Change of basis',
      pages: 'pp. 10–11',
      summary: 'Components in a new basis follow from the old ones through a matrix of overlaps, and that matrix is unitary.',
      body: [
        {
          text: 'The components in a new basis are $c\' = U c$, where $U$ has the entries $U_{ik} = \\langle\\alpha\'_i|\\alpha_k\\rangle$ (Eq. 1.3). The matrix $U$ is [[qc-unitary|unitary]], and for the change from $z$ to $x$ it is the Hadamard matrix (<<qc-q2-change|Unit 2.5>>).',
        },
      ],
    },
    {
      id: 'n2-photon',
      label: '§I.C.5',
      title: 'Photon polarization',
      pages: 'p. 11',
      summary: 'Light polarization is another two-dimensional space, where rotating the axes turns linear states into each other and only multiplies circular ones by phases.',
      body: [
        {
          text: 'Photon polarization is also a two-dimensional space. Rotating the axes by $\\varphi$ turns the linear states into each other, while the circular states $|R\\rangle$ and $|L\\rangle$ only pick up the phases $e^{\\mp i\\varphi}$ (<<qc-q2-photon|Unit 2.6>>).',
        },
      ],
    },
    {
      id: 'n2-operators',
      label: '§I.D.1',
      title: 'Matrix representation',
      pages: 'p. 12',
      summary: 'A linear operator is fixed by its matrix elements in a basis, and outer products build operators out of kets and bras.',
      body: [
        {
          text: 'A linear operator $A$ is fixed by its matrix elements $A_{ij}$, and the outer product $|\\alpha\\rangle\\langle\\beta|$ builds operators from a ket and a bra. In a fixed basis, applying $A$ to a vector multiplies its column of components by this matrix (<<qc-q2-operators|Unit 2.4>>).',
        },
      ],
    },
  ],
})
