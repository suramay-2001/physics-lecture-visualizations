/**
 * Lecture 18 review cards: the exam layer (owner: P; P-L18-story §6).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L18.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d, tf } from './L18.values'

export const L18_REVIEW: Record<string, ReviewCard> = {
  'l18-packet': {
    points: [
      'A packet that meets the step splits into two packets. $R$ and $T$ are the areas under the reflected and the transmitted one, so they add to 1.',
      'For a narrow range of energies the outgoing packets are about $r$ and $\\tau$ times the incoming envelope, and the different speeds fix the areas.',
      `A broad packet needs the average of $R(E)$ over its energies: ${d(V.l18StepWeightedR, 4)} for $\\sigma = 2$, falling toward $${tf(V.l18StepR43)}$ for a very wide packet.`,
    ],
    equations: 'R + T = 1',
    trap: 'Mixing the amplitude identity $1 + r = \\tau$ with the probability identity $R + T = 1$.',
    claims: [
      claim('l18StepWeightedR', 'the energy-weighted R for σ = 2 is 0.1489', () => close(V.l18StepWeightedR, 0.148892, 5e-5)),
      claim('l18StepR43', 'the plane-wave R is 1/9', () => close(V.l18StepR43, 1 / 9, 1e-12)),
    ],
  },
  'l18-detector': {
    points: [
      'The probability flux of a travelling packet is $j \\simeq v\\rho$: density times speed, positive to the right and negative to the left.',
      `Over the whole passage past a detector the flux adds up to ${d(V.l18DetTotal, 0)}: the whole packet goes by once.`,
      'The shares are ratios of fluxes: $R = |r|^2$ and $T = \\tfrac{k_2}{k_1}|\\tau|^2$.',
    ],
    equations: 'j = v\\rho',
    trap: 'Giving $R$ a speed factor. The reflected packet has the incident speed, so only $T$ carries one.',
    claims: [claim('l18DetTotal', 'the whole passage carries 1', () => close(V.l18DetTotal, 1, 1e-9))],
  },
  'l18-below': {
    points: [
      'Below the step the wave on the right is $Ce^{-\\kappa x}$, with $\\kappa = \\sqrt{2m(V_0 - E)}/\\hbar$.',
      'Matching gives $r = \\tfrac{k - i\\kappa}{k + i\\kappa}$, a number of size 1, so $R = 1$ and every particle comes back.',
      `The density on the right falls over $1/2\\kappa$, ${d(V.l18DecayLenDensity, 2)} for $\\kappa = 2$, but no current flows: a tail is not transmission.`,
    ],
    equations: 'r = \\tfrac{k-i\\kappa}{k+i\\kappa}',
    trap: 'Believing that a density inside the step means a particle gets through. A real exponential carries no current.',
    claims: [claim('l18DecayLenDensity', 'the density falls by e over 1/2κ = 0.25 for κ = 2', () => close(V.l18DecayLenDensity, 0.25, 1e-12))],
  },
  'l18-tunnel': {
    points: [
      'A finite barrier has two exponentials inside and a travelling wave beyond, so a particle can get through with $E < V_0$.',
      'Matching at both edges gives $T = \\left[1 + \\tfrac{V_0^2}{4E(V_0 - E)}\\sinh^2\\kappa a\\right]^{-1}$.',
      'For a thick barrier $T \\simeq 16\\,\\tfrac{E(V_0 - E)}{V_0^2}\\,e^{-2\\kappa a}$: an exponential in the width.',
      `For $E = \\tfrac{V_0}{2}$ and $\\kappa a = 1$ the exact value is ${d(V.l18BarrierT1, 4)}.`,
    ],
    equations: 'T\\simeq 16\\,\\tfrac{E(V_0-E)}{V_0^2}\\,e^{-2\\kappa a}',
    trap: 'Using the thick-barrier form for a thin barrier: as $a \\to 0$ it does not tend to 1.',
    claims: [claim('l18BarrierT1', 'for E = V₀/2 and κa = 1 the exact transmission is 0.4200', () => close(V.l18BarrierT1, 0.419974, 5e-5))],
  },
}
