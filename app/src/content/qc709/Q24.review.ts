/**
 * Chapter Q24 review cards (Physics 709; P-Q24-story §6), one per unit, in both tracks. Every number on a card is backed by a claim of its unit (content/claims.test.ts); the Formal block
 * has its own points, equations and trap.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d } from './Q24.values'

export const Q24_REVIEW: Record<string, ReviewCard> = {
  'q24-divincenzo': {
    points: [
      'A quantum computer needs five things from its qubits, and a network needs two more.',
      'The key ratio is the phase time divided by the time of one gate.',
      `With a 1 microsecond gate and a 1 millisecond phase time, $${V.q24GatesPerT2}$ gates fit before the phase signal is down to $1/e$.`,
    ],
    equations: 'N = T_2/t_{\\rm gate}',
    trap: 'Taking the coherence time alone as the measure of a platform: what counts is its ratio to the gate time.',
    claims: [claim('q24GatesPerT2', 'a thousand gates fit in one phase time', () => V.q24GatesPerT2 === 1000)],
    formal: {
      points: ['Seven criteria: five for a computer and two for a network (Bergou p. 201).', `For the model values $N = T_2/t_{\\rm gate} = ${V.q24GatesPerT2}$, and the phase signal is $e^{-1}$ after $N$ gates.`],
      trap: 'Judging a platform by $T_2$ alone: the figure of merit is $T_2/t_{\\rm gate}$.',
    },
  },
  'q24-lindblad': {
    points: [
      'Jumps shorten the arrow of the state and tilt it toward the north pole.',
      'For pure decay the population time is $T_1 = 1/\\gamma$ and the phase time is $T_2 = 2/\\gamma$.',
      'Extra dephasing only shortens $T_2$.',
      `With $T_2 = 3T_1$ the smaller eigenvalue of the state goes to $-${d(V.q24MinEig3, 4)}$, so that case cannot occur.`,
    ],
    equations: 'T_1 = 1/\\gamma,\\quad T_2 = 2T_1',
    trap: 'Believing that $T_2$ can exceed $2T_1$: positivity of the state forbids it.',
    claims: [
      claim('q24T2OverT1', 'T2 is twice T1 for pure decay', () => close(V.q24T2OverT1, 2, 1e-9)),
      claim('q24MinEig3', 'with T2 = 3 T1 the smaller eigenvalue reaches 0.0096 in size', () => close(V.q24MinEig3, 0.0096, 5e-5)),
      claim('q24MinEig3Sign', 'and it is negative', () => V.q24MinEig3Sign === -1),
    ],
    formal: {
      points: [
        'Eq. 12.1 leads to the Lindblad form; Eq. 12.2 is the qubit that decays.',
        'The solved equation equals the Chapter Q13 damping and dephasing channels.',
        `Positivity of $\\rho$ gives $T_2 \\le 2T_1$; at $T_2 = 3T_1$ the smaller eigenvalue is $-${d(V.q24MinEig3, 4)}$.`,
      ],
      trap: 'Reading $T_2 = 3T_1$ as a long-lived qubit: the state would stop being a state.',
    },
  },
  'q24-bloch-eq': {
    points: [
      'Drive and decay balance, and the qubit settles.',
      `On resonance the excited share is $s/(2(1+s))$ with $s = T_1T_2\\Omega^2$: ${d(V.q24ReeRes1, 2)} at $s = 1$.`,
      'It never reaches one half, so steady light cannot invert a qubit.',
      'A stronger drive widens the resonance.',
    ],
    equations: '\\rho_{ee} = \\frac{s}{2(1+s)}',
    trap: 'Believing that a strong enough steady drive fully excites a decaying qubit.',
    claims: [
      claim('q24ReeRes1', 'on resonance the excited share is 0.25 at s = 1', () => close(V.q24ReeRes1, 0.25, 1e-9)),
      claim('q24ReeRes100', 'and it is below one half even at s = 100', () => V.q24ReeRes100 < 0.5),
    ],
    formal: {
      points: [
        'Eqs. 12.4 under the rotating-wave step, and the steady state of Eq. 12.5a.',
        'Eq. 12.5b has the sign of its imaginary part reversed (our calculation; see the Correction).',
        'The full width at half height is $2\\sqrt{1+s}/T_2$.',
      ],
      trap: 'Taking $s \\to \\infty$ for full inversion: $\\rho_{ee}$ approaches one half from below and never exceeds it.',
    },
  },
  'q24-rabi': {
    points: [
      'From the ground state the excited chance is a sine squared with a ceiling.',
      `The π pulse takes ${d(V.q24Tpi, 1)} at a drive of $2\\pi$.`,
      'The phase of the drive picks the axis; real positive $\\Omega$ turns about $x$ the way $R_x(-\\theta)$ does (our calculation).',
      'A composite pulse of four squares the size error.',
    ],
    equations: 't_\\pi = \\pi/|\\Omega|',
    trap: 'Taking a real positive drive for $R_x(+\\theta)$: it is $R_x(-\\theta)$.',
    claims: [claim('q24Tpi', 'the π pulse takes 0.5 at Ω = 2π', () => close(V.q24Tpi, 0.5, 1e-9))],
    formal: {
      points: ['Eq. 12.7 and Eq. 12.8, and the Correction on the sign of $R_x$ (p. 209).', `The four-pulse sequence equals $R_x(\\pi)$ and its error is $O(\\epsilon^2)$.`],
      trap: 'Copying the printed $R_x(\\theta)$ for a real positive $\\Omega$.',
    },
  },
  'q24-ramsey': {
    points: [
      'Half pulse, wait, half pulse: the chance of reading 1 is $\\cos^2(\\varphi/2)$.',
      'The arrow turns about the field like a compass needle.',
      `Noise along the field shrinks the sideways part by $e^{-\\frac{\\sigma^2}{2}}$, which is ${d(V.q24Gauss1, 3)} at $\\sigma = 1$.`,
      'Slow noise gives a bell-shaped decay and fast noise an exponential one.',
    ],
    equations: 'P(1) = \\cos^2(\\varphi/2)',
    trap: 'Believing that faster noise always decays the qubit faster: for noise that forgets quickly the decay time is longer.',
    claims: [claim('q24Gauss1', 'at σ = 1 the sideways part shrinks to 0.607', () => close(V.q24Gauss1, 0.607, 5e-4))],
    formal: {
      points: ['Eqs. 12.9–12.11: the field, the turning arrow and the Gaussian average.', 'Our Ornstein–Uhlenbeck model gives both limits of $T_2^*$ and the case in between.'],
      trap: 'Using Eq. 12.12 when the correlation time is not short.',
    },
  },
  'q24-decoupling': {
    points: ['A flip halfway through the wait makes a slow frequency error cancel.', 'Alternating the signs of the pulses cancels an area error.', 'It does not help against noise that changes within the wait.'],
    equations: '\\varphi(2\\tau) = 0',
    trap: 'Believing that the echo cancels any noise: it cancels only what stays the same between the two waits.',
    claims: [claim('q24EchoGap', 'the echo sequence equals minus the identity for every static error (max-abs gap)', () => close(V.q24EchoGap, 0, 1e-12))],
    formal: {
      points: ['The echo phase is the difference of two integrals of the frequency error (p. 216).', `With slow noise the echo keeps ${d(V.q24EchoCoh10, 3)} of the signal where Ramsey keeps ${d(V.q24RamseyCoh10, 3)}.`],
      trap: 'Applying the echo to noise whose correlation time is shorter than the wait.',
    },
  },
}
