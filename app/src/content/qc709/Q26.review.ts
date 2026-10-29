/**
 * Chapter Q26 review cards (Physics 709; P-Q26-story §6), one per unit, in both tracks. Every number on a card is backed by a claim of its unit (content/claims.test.ts); the Formal block
 * has its own points, equations and trap.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d } from './Q26.values'

export const Q26_REVIEW: Record<string, ReviewCard> = {
  'q26-encodings': {
    points: [
      'A photon qubit is stored in polarization or in path.',
      `A plate pair turns $|0\\rangle$ by the table $U$, so the chance of $|1\\rangle$ is $\\sin^2\\theta$: ${d(V.q26WaveP1, 2)} at $\\theta = 30^\\circ$.`,
      'The Bloch polar angle is twice the plate angle.',
    ],
    equations: '\\cos\\theta|0\\rangle + \\sin\\theta\\,e^{i\\phi}|1\\rangle\\quad\\text{at polar angle } 2\\theta',
    trap: `Believing that $U|0\\rangle$ has phase $\\varphi$: it has $\\varphi + 90^\\circ$.`,
    claims: [claim('q26WaveP1', 'wave plates at theta 30 degrees give the chance of |1> as 0.25', () => close(V.q26WaveP1, 0.25, 1e-12))],
    formal: {
      points: [
        '$U(\\theta,\\varphi)|0\\rangle = \\cos\\theta|0\\rangle + ie^{i\\varphi}\\sin\\theta|1\\rangle$ (Bergou p. 257), unitary.',
        'Polar angle $2\\theta$ and azimuth $\\varphi + 90^\\circ$; the dual-rail state has azimuth $\\phi$ itself (Fig. 14.3).',
      ],
      trap: 'Reading the page\'s $U|0\\rangle$ without the factor $i$: the relative phase is $\\varphi + 90^\\circ$.',
    },
  },
  'q26-beamsplitter': {
    points: [
      `A splitter has four numbers, $t$, $r$, $t'$ and $r'$, in a unitary table $S$.`,
      'No light is lost, and two different inputs stay different.',
      `One photon in port 0 leaves entangled: chances ${d(V.q26T270, 1)} and ${d(V.q26R70, 1)} at 70:30.`,
    ],
    equations: "rt'^* + r'^*t = 0,\\quad |r|^2 + |t|^2 = 1",
    trap: 'Taking $r = 1 - t$: it is the squares that add to 1, not the amplitudes.',
    formal: {
      points: [
        "$S = \\begin{pmatrix}t' & r\\\\ r' & t\\end{pmatrix}$ with $SS^\\dagger = S^\\dagger S = I$ gives the Stokes relations (Eq. 14.1).",
        `One photon in port 0 gives $t'|10\\rangle + r'|01\\rangle$ (Eq. 14.2): entropy ${d(V.q26Entropy70, 4)} bits at 70:30.`,
      ],
      equations: "rt'^* + r'^*t = 0",
      trap: 'Treating a Fock label $|10\\rangle$ as two qubits: it names occupations of two modes.',
    },
  },
  'q26-hom': {
    points: [
      'Identical photons, one per port, leave together at 50:50.',
      "The two ways to leave one by each exit have equal and opposite amplitudes and cancel.",
      `Off 50:50 the chance of one per exit is $(1 - 2R)^2$: ${d(V.q26HomR20, 2)} at $R = ${d(V.q26R20, 1)}$.`,
    ],
    equations: "t't + r'r = 0,\\quad (1 - 2R)^2",
    trap: 'Adding chances for the two ways: that is what photons that can be told apart do.',
    formal: {
      points: [
        "$a_0^\\dagger a_1^\\dagger \\to \\sqrt2\\,t'r|20\\rangle + (t't + r'r)|11\\rangle + \\sqrt2\\,r't|02\\rangle$ (pp. 256–257).",
        `The chance of $|11\\rangle$ is $(1 - 2R)^2$, against $(1-R)^2 + R^2$ for photons that can be told apart.`,
      ],
      equations: "t't + r'r = 0",
      trap: 'Squaring each way and then adding: the amplitudes add first.',
    },
  },
  'q26-ns-cz': {
    points: [
      'A heralded ancilla turns two photons into a sign flip on the two-photon part.',
      'Two sign gates make a CZ between dual-rail qubits.',
      `Each sign gate works with chance ${d(V.q26NsSuccess, 4)}, so a CZ works with ${d(V.q26CzSuccess, 4)}.`,
    ],
    equations: 'P_{CZ} = P_{\\mathrm{NS}}^2',
    trap: `Reading ${d(V.q26NsSuccess, 4)} as an average over inputs: it is the same for every input of at most two photons.`,
    formal: {
      points: [
        'The amplitudes are $A_n = \\cos^n\\theta\\cos^{n-1}\\varphi\\,(\\cos^2\\varphi - n\\sin^2\\varphi)$; the conditions give $x = (3 - \\sqrt2)/7$.',
        `$P_{CZ} = P_{\\mathrm{NS}}^2 = ${d(V.q26CzSuccess, 4)}$, below the cited ceiling $2/27$.`,
      ],
      equations: 'P_{CZ} = P_{\\mathrm{NS}}^2',
      trap: 'Expecting the gate to fail more on some inputs: for at most two photons the chance is state independent.',
    },
  },
  'q26-teleport-gate': {
    points: [
      'Make the resource state off line; use it once it works.',
      'KLM adds photons so that success approaches 1 as $(n/(n+1))^2$.',
      `Ten gates at ${d(V.q26Target99, 2)} need ${V.q26KlmPhotons10} photons at once.`,
    ],
    equations: 'P_n = (n/(n+1))^2',
    trap: 'Repeating a failed gate inside the program until it works: only the resource can be repeated.',
    formal: {
      points: [
        '$|r\\rangle = (I \\otimes \\mathrm{CNOT})(|\\Phi^+\\rangle|\\Phi^+\\rangle)$ and one Pauli per output fixes every Bell outcome (Fig. 14.6 to Fig. 14.8).',
        `$P_n = (n/(n+1))^2$; $F \\ge ${d(V.q26Target99, 2)}$ needs $n = ${V.q26KlmN99}$.`,
      ],
      equations: 'P_n = (n/(n+1))^2',
      trap: 'Thinking the Bell measurement of linear optics is complete: it identifies at most one half of the states.',
    },
  },
  'q26-nonlinear': {
    points: [
      'A detuned atom gives each photon a small energy shift, which makes a Kerr phase.',
      `The shift is $\\chi = \\frac{\\Omega_0^2}{4\\Delta}$: ${d(V.q26Chi, 3)} of $\\Omega_0$ at $\\Delta = 10\\Omega_0$.`,
      'The sum and difference of two opposite coherent states, cat states, are exactly orthogonal.',
    ],
    equations: 'U_{\\mathrm{Kerr}} = e^{i\\chi\\hat a^\\dagger\\hat a t}',
    trap: 'Assuming any two coherent states are orthogonal: they are only nearly so when far apart.',
    formal: {
      points: [
        'Apart from the bare $n\\hbar\\omega$, $E_-(n) - E_-(0) \\simeq -\\hbar\\chi n$ with $\\chi = \\frac{\\Omega_0^2}{4\\Delta}$ for $|\\Delta| \\gg \\Omega_n$ (p. 265).',
        `$|\\langle -\\alpha|\\alpha\\rangle|^2 = e^{-4\\alpha^2}$: ${d(V.q26Overlap1, 4)} at $\\alpha = 1$; the even cat has no odd photon numbers.`,
      ],
      equations: 'U_{\\mathrm{Kerr}} = e^{i\\chi\\hat a^\\dagger\\hat a t}',
      trap: 'Treating $|\\alpha\\rangle$ and $|-\\alpha\\rangle$ as orthogonal for small $\\alpha$.',
    },
  },
}
