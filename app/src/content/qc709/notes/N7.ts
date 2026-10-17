/**
 * Physics 709 Lecture 7 notes (N7), a short companion: section II.F.3 (the four Pauli-product observables and Mermin's contradiction,
 * Eqs. 2.11 to 2.13) and II.G (the box that forces the density matrix), printed pages 35 to 37 of the new edition. The prose paraphrases
 * the notes and links the Chapter Q7 and Q8 units that teach each section; the one number is Chapter Q8's own (q8BoxPur).
 */
import type { Lecture } from '../../schema'
import { notesLecture } from './kit'
import { V, claim, close, d } from '../Q8.values'

export const N7: Lecture = notesLecture({
  number: 7,
  title: 'GHZ observables, Mermin and the density matrix',
  date: '2026-09-28',
  topics: [
    'four commuting Pauli-product observables',
    'Mermin contradiction with predetermined values',
    'where quantum mechanics escapes it',
    'the box that forces a density matrix',
  ],
  length: 'short',
  symbols: {
    'O_XXX': 'n7-observables:b1',
    'O_YYX': 'n7-observables:b1',
    'O_YXY': 'n7-observables:b1',
    'O_XYY': 'n7-observables:b1',
    'x_i': 'n7-mermin:b1',
    'y_i': 'n7-mermin:b1',
    'x_1': 'n7-mermin:b1',
    'x_2': 'n7-mermin:b1',
    'x_3': 'n7-mermin:b1',
    '\\sigma_y': 'n7-mermin:b1',
    '\\sigma_x': 'n7-mermin:b1',
    '|\\cdot\\rangle': 'n7-density:b1',
    '|00\\rangle': 'n7-density:b1',
    '|11\\rangle': 'n7-density:b1',
    '|\\psi\\rangle': 'n7-density:b1',
    '\\langle\\cdot|': 'n7-density:b1',
    '\\rho': 'n7-density:b1',
  },
  sections: [
    {
      id: 'n7-observables',
      label: '§II.F.3',
      title: 'Four Pauli-product observables',
      pages: 'p. 35',
      summary: 'Four products of Pauli matrices on the three qubits commute, and the GHZ state is an eigenstate of each, so every run returns the same product.',
      body: [
        {
          text: 'The products $O_{XXX}$, $O_{YYX}$, $O_{YXY}$ and $O_{XYY}$ of Pauli matrices on three [[qubit|qubits]] square to the identity. Two different products disagree on a pair of qubits, so their two minus signs cancel and the four operators commute. The GHZ state is their joint eigenstate, with eigenvalue $+1$ for the first and $-1$ for the other three (Eqs. 2.11–2.12), so the dispersion vanishes and every run returns the same product (<<qc-q7-observables|Unit 7.5>>).',
        },
      ],
    },
    {
      id: 'n7-mermin',
      label: '§II.F.3',
      title: 'Mermin’s contradiction',
      pages: 'pp. 35–36',
      summary: 'Predetermined values cannot reproduce the four product results, while the operator product keeps the sign that makes quantum mechanics consistent.',
      body: [
        {
          text: 'Suppose each qubit carried predetermined values $x_i$ and $y_i$. Multiplying the three relations with result $-1$ would force $x_1x_2x_3 = -1$, against the measured $+1$. Quantum mechanics escapes because on qubit 2 the operators multiply as $\\sigma_y\\sigma_x\\sigma_y = -\\sigma_x$ (Eq. 2.13), a sign that numbers lack (<<qc-q7-mermin|Unit 7.6>>).',
        },
      ],
    },
    {
      id: 'n7-density',
      label: '§II.G',
      title: 'The box that forces a density matrix',
      pages: 'pp. 36–37',
      summary: 'Forgetting the result of a measurement on one GHZ qubit leaves the other two in a classical coin-toss ensemble that no single ket describes.',
      body: [
        {
          text: `Measure the first GHZ qubit and forget the result. The other two are then in $|00\\rangle$ or $|11\\rangle$ with equal chance, a [[qc-mixture|mixture]] and not the [[qc-superposition|superposition]], since the mean of $\\sigma_x\\sigma_x$ is 0 and not 1. The density operator $\\rho = |\\psi\\rangle\\langle\\psi|$ has unit trace, and for the box $\\mathrm{Tr}\\,\\rho^2$ is ${d(V.q8BoxPur, 1)}, below one. That mixture of two product states has no entanglement, so losing one GHZ qubit leaves the other two unentangled (<<qc-q8-why|Unit 8.1>>, <<qc-q8-pure-rho|Unit 8.2>>).`,
          claims: [claim('q8BoxPur', 'the box ensemble has purity one half', () => close(V.q8BoxPur, 0.5, 1e-9))],
        },
      ],
    },
  ],
})
