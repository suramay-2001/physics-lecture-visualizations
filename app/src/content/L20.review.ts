/**
 * Lecture 20 review cards: the exam layer (owner: P; P-L20-story §6).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L20.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d } from './L20.values'

export const L20_REVIEW: Record<string, ReviewCard> = {
  'l20-reverse': {
    points: [
      'A scattering state is chosen at a given energy and cannot be normalised. A bound state is normalisable, so its tails decay on both sides.',
      'A bound state has no incoming beam, and its energy is not free: only special values join a decaying tail at each end.',
      `In the lowest state of the well in the picture, a chance of ${d(V.l20TailGround, 4)} lies outside the walls.`,
    ],
    equations: '\\int_{-\\infty}^{\\infty}|\\varphi|^2dx < \\infty',
    trap: 'Saying that any energy fits, because a sine fits inside the well.',
    claims: [claim('l20TailGround', 'the chance outside is 0.0204', () => close(V.l20TailGround, 0.0204264, 5e-5))],
  },
  'l20-infinite': {
    points: [
      'The walls force $\\varphi(0) = \\varphi(a) = 0$, so $k_n = n\\pi/a$ and the energies go as $n^2$.',
      `Level $n$ has $n$ half-waves and $n - 1$ nodes. For $a = 4$ the amplitude is ${d(V.l20BoxAmpL4, 4)} and level 3 is ${d(V.l20BoxE3overE1, 0)} times higher than level 1.`,
      'At an infinite wall the function vanishes and its slope jumps. The finite-step rule must not be imposed there.',
    ],
    equations: 'E_n = \\dfrac{n^2\\pi^2\\hbar^2}{2ma^2}',
    trap: 'Imposing continuity of the slope at an infinitely high wall.',
    claims: [
      claim('l20BoxAmpL4', 'the amplitude for a = 4 is 0.7071', () => close(V.l20BoxAmpL4, 0.707107, 5e-5)),
      claim('l20BoxE3overE1', 'level 3 is 9 times level 1', () => close(V.l20BoxE3overE1, 9, 1e-9)),
    ],
  },
  'l20-finite': {
    points: [
      'The state is even or odd. The mirror image of a bound level is a constant multiple of it, and that constant is plus or minus 1.',
      'For even states value and slope at the wall give $k\\tan\\tfrac{ka}{2} = \\kappa$; for odd ones $-k\\cot\\tfrac{ka}{2} = \\kappa$.',
      `With $k^2 + \\kappa^2 = 2mV_0/\\hbar^2$ these fix finitely many levels: ${d(V.l20E1Fin, 3)}, ${d(V.l20E2Fin, 3)} and ${d(V.l20E3Fin, 3)} for $V_0 = 8$ and $a = 2$.`,
    ],
    equations: 'k\\tan\\tfrac{ka}{2} = \\kappa',
    trap: 'Reading a tail as particles leaving: a bound state is real, and its tails carry no current.',
    claims: [
      claim('l20E1Fin', 'the lowest level is 0.784', () => close(V.l20E1Fin, 0.784194, 5e-4)),
      claim('l20E2Fin', 'the next is 3.062', () => close(V.l20E2Fin, 3.06177, 5e-4)),
      claim('l20E3Fin', 'and the third is 6.463', () => close(V.l20E3Fin, 6.46311, 5e-4)),
    ],
  },
  'l20-compare': {
    points: [
      `Finite levels lie below their infinite twins: ${d(V.l20E1Ratio, 3)} of it for the lowest level of the well in the picture. Raising the walls pushes the ratio toward 1.`,
      'A single bound state has a fixed density. A mix of two levels moves at the angular frequency $(E_2 - E_1)/\\hbar$.',
      `For a box of width 6 the density repeats every ${d(V.l20SloshPeriodL6, 2)}.`,
    ],
    equations: '|\\Psi|^2 = \\dfrac{\\varphi_1^2 + \\varphi_2^2}{2} + \\varphi_1\\varphi_2\\cos\\dfrac{(E_2 - E_1)t}{\\hbar}',
    trap: 'Calling a bound state motionless: a mix of two levels moves.',
    claims: [
      claim('l20E1Ratio', 'the ratio for level 1 is 0.636', () => close(V.l20E1Ratio, 0.635644, 5e-4)),
      claim('l20SloshPeriodL6', 'the period is 15.28', () => close(V.l20SloshPeriodL6, 15.2789, 5e-3)),
    ],
  },
  'l20-oscillator': {
    points: [
      'Near a smooth minimum the potential is an oscillator to first order, with $m\\omega^2 = V\'\'(0)$.',
      `Uncertainty alone puts the lowest energy of a Gaussian at ${d(V.l20HEstimate, 3)} in units of $\\hbar\\omega$.`,
      'The operators $X$ and $P$ fail to commute, so $\\hat a^\\dagger\\hat a$ differs from $(X^2 + P^2)/2$ by a constant.',
    ],
    equations: 'H = \\hbar\\omega(\\hat a^\\dagger\\hat a + \\tfrac{1}{2})',
    trap: 'Dropping the commutator.',
    claims: [claim('l20HEstimate', 'the estimate is 0.5', () => close(V.l20HEstimate, 0.5, 1e-9))],
  },
}
