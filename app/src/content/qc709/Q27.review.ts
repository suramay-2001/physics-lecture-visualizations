/**
 * Chapter Q27 review cards (Physics 709; P-Q27-story §6), one per unit, in both tracks. Every number on a card is backed by a claim of its unit (content/claims.test.ts); the Formal block
 * has its own points, equations and trap.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d } from './Q27.values'

export const Q27_REVIEW: Record<string, ReviewCard> = {
  'q27-lc': {
    points: [
      'A capacitor and an inductor swap energy like a mass on a spring: an oscillator.',
      'Its rungs are all the same height.',
      `One rung is ${d(V.q27HfOverK, 3)} K of heat, so the circuit needs millikelvin temperatures.`,
      'A pulse for the first step also fits the second and drives it harder, so the rungs make no qubit.',
    ],
    equations: '\\omega = 1/\\sqrt{LC}',
    trap: 'Thinking that equal rungs make a good qubit.',
    claims: [claim('q27HfOverK', 'one rung of the model circuit is 0.2546 K', () => close(V.q27HfOverK, 0.2546, 5e-5))],
    formal: {
      points: [
        'The table on p. 272 pairs flux with position and charge with momentum, so $[\\hat\\Phi, \\hat Q] = i\\hbar$.',
        'The levels are $\\hbar\\omega(n + \\tfrac12)$ with $\\omega = 1/\\sqrt{LC}$.',
        `The condition is $T \\ll hf/k_{\\rm B} = ${d(V.q27HfOverK, 3)}$ K.`,
      ],
      trap: 'Calling the two lowest levels of an LC circuit a qubit: the matrix elements give $|Q_{12}|/|Q_{01}| = \\sqrt2$.',
    },
  },
  'q27-superconductivity': {
    points: [
      'A weak attraction binds two electrons into a pair of charge $2e$.',
      'Pairs share one wave function and push a magnetic field out of the metal.',
      'Around a ring the phase must come back to itself, so the flux is a whole number of flux quanta.',
      `One flux quantum is ${d(V.q27Phi0, 3)}$\\times10^{-15}$ Wb.`,
    ],
    equations: '\\Phi = p\\,\\frac{h}{2e}',
    trap: 'Writing the flux quantum as $h/e$.',
    claims: [claim('q27Phi0', 'the flux quantum h/2e is 2.0678e-15 Wb', () => close(V.q27Phi0, 2.0678, 5e-5))],
    formal: {
      points: [
        'Eqs. 15.2–15.6: a bound pair of charge $2e$, the London equation and the pair current.',
        'Single-valuedness of the phase gives $\\Phi = p\\Phi_0$ for a ring with no current.',
        `The flux quantum is $\\Phi_0 = h/2e = ${d(V.q27Phi0, 4)}\\times10^{-15}$ Wb.`,
      ],
      trap: 'Using $\\Phi_0 = h/e$, which forgets that the carriers have charge $2e$.',
    },
  },
  'q27-josephson': {
    points: [
      'A junction carries the current $I_0\\sin\\theta$, set by the phase difference.',
      'It acts as an inductor that depends on the phase.',
      'The energy is a cosine well, not a parabola.',
      'A SQUID tunes $E_J$ by the flux through its ring.',
    ],
    equations: 'L_J = \\frac{\\Phi_0}{2\\pi I_0\\cos\\theta}',
    trap: 'Thinking the current depends on the voltage.',
    formal: {
      points: [
        '$I = I_0\\sin\\theta$ and $\\dot\\theta = 2eV/\\hbar$ (p. 278).',
        '$L_J(\\theta) = \\frac{\\Phi_0}{2\\pi I_0\\cos\\theta}$ and $E_J = \\frac{\\Phi_0I_0}{2\\pi}$ (p. 279).',
        'Eq. 15.7: a SQUID has $E_J \\to 2E_J|\\cos(\\pi\\Phi/\\Phi_0)|$.',
      ],
      trap: 'Reading $I = I_0\\sin\\theta$ as a relation between current and voltage: the voltage sets the rate of the phase.',
    },
  },
  'q27-transmon': {
    points: [
      'A tiny island of Cooper pairs with a gate voltage is a charge qubit.',
      'At the sweet spot the qubit frequency does not move to first order with charge noise.',
      'A large $E_J/E_C$ flattens the band exponentially, and the rungs stay a little uneven.',
      `The anharmonicity falls only from ${d(V.q27Anh10, 3)} to ${d(V.q27Anh20, 3)} between ratios 10 and 20.`,
    ],
    equations: '\\alpha \\simeq -\\frac{1}{\\sqrt{32E_J/E_C}}',
    trap: 'Thinking a transmon needs a large anharmonicity.',
    claims: [
      claim('q27Anh10', 'at ratio 10 alpha = -0.0696', () => close(V.q27Anh10, 0.0696, 5e-5)),
      claim('q27Anh20', 'at ratio 20 alpha = -0.0457', () => close(V.q27Anh20, 0.0457, 5e-5)),
    ],
    formal: {
      points: [
        'Eq. 15.8: $\\hat H = E_C(\\hat n - n_g)^2 - E_J\\cos\\hat\\theta$, with Mathieu levels.',
        'Eq. 15.9, with our sign: $-E_C(n_g - \\tfrac12)\\sigma_z - \\frac{E_J}{2}\\sigma_x$.',
        'The charge dispersion falls as $e^{-\\sqrt{32E_J/E_C}}$ (Correction K2) and the anharmonicity as a power of the ratio.',
      ],
      trap: 'Using the printed exponent $\\sqrt{2E_J/E_C}$ for the charge dispersion.',
    },
  },
  'q27-cqed': {
    points: [
      'A qubit coupled to a resonator is a two-level system and one light mode.',
      'Far from resonance the qubit shifts the resonator a little, up or down with its state.',
      'Reading that shift reads the qubit without destroying it.',
      'Two qubits on one resonator swap their excitations through virtual photons.',
    ],
    equations: '\\chi = \\frac{g^2}{\\Delta}',
    trap: 'Thinking that readout needs the qubit to emit a photon.',
    formal: {
      points: [
        'Eq. 15.11: dropping the counter-rotating terms leaves the Jaynes–Cummings block.',
        'The dispersive shift $\\chi = g^2/\\Delta$ moves the line by $\\pm\\chi$.',
        'The exchange gate is an iSWAP at $g^2t/\\Delta = \\pi/2$.',
      ],
      trap: 'Taking the sign of $\\Delta$ for granted: the page assumes the sign for which the first dressed state is mostly the excited qubit.',
    },
  },
  'q27-dots': {
    points: [
      'A spin in a field has two energies, so it is a qubit at the Zeeman frequency.',
      'Exchange between neighbouring spins gives SWAP, and half the pulse gives half a SWAP.',
      'Half a swap is entangling, and two of them with one-qubit turns give CZ.',
    ],
    equations: 'U = e^{i\\frac{\\pi}{4}\\boldsymbol\\sigma_1\\cdot\\boldsymbol\\sigma_2} = e^{i\\pi/4}\\,{\\rm SWAP}',
    trap: 'Thinking the spins couple through their magnetic fields.',
    formal: {
      points: [
        'Eq. 15.12: $\\hat H_{\\rm ex} = -2K\\,\\mathbf s_1\\cdot\\mathbf s_2$.',
        'Eq. 15.13: the full pulse is $e^{i\\pi/4}\\,{\\rm SWAP}$.',
        'Eq. 15.14 builds CZ from two $\\sqrt{\\rm SWAP}$ and $Z$ turns, with the page’s phase kept.',
      ],
      trap: 'Reading the exchange as a dipole coupling: it is the difference of Coulomb energies of the singlet and the triplet.',
    },
  },
}
