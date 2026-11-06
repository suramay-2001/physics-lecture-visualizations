/**
 * Lecture 17 review cards: the exam layer (owner: P; P-L17-story §6).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L17.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d, tf } from './L17.values'

export const L17_REVIEW: Record<string, ReviewCard> = {
  'l17-mean-force': {
    points: [
      'Ehrenfest’s equation says the mean position accelerates under the mean force $\\langle F\\rangle$, not under $F(\\langle x\\rangle)$.',
      'The two agree exactly for a linear force $F = \\alpha + \\beta x$, whatever the width or the shape of the state.',
      `For $F = \\gamma x^2$ and a Gaussian at 2 with $\\sigma = 1$, the force at the mean is $${d(V.l17GaussForceAtMean, 0)}\\gamma$ and the mean force is $${d(V.l17GaussMeanF, 0)}\\gamma$.`,
      'A narrow packet in a slowly varying force obeys $m\\ddot\\mu \\approx F(\\mu)$, an approximation and no new law.',
    ],
    equations: `m\\ddot\\mu = F(\\mu) + \\tfrac{F''(\\mu)}{2}(\\Delta x)^2 + \\dots`,
    trap: 'Replacing the mean force by the force at the mean position when the force is not linear.',
    claims: [
      claim('l17GaussForceAtMean', 'the force at the mean of a Gaussian at 2 is 4γ', () => close(V.l17GaussForceAtMean, 4, 1e-9)),
      claim('l17GaussMeanF', 'the mean force is 5γ', () => close(V.l17GaussMeanF, 5, 1e-9)),
    ],
  },
  'l17-step': {
    points: [
      'Match the function and its slope at the step. The incident, reflected and transmitted waves then fix the ratios $r$ and $\\tau$.',
      `With $k_2/k_1 = ${d(V.l17StepRatio43, 1)}$ the amplitudes are $r = ${tf(V.l17StepRAmp43)}$ and $\\tau = ${tf(V.l17StepTau43)}$.`,
      'A wave reflects above the step because one incident and one transmitted wave of different wavelengths cannot match both conditions.',
      'These are amplitudes. A value $\\tau > 1$ only says the transmitted wave is denser, because it is slower.',
    ],
    equations: `r = \\tfrac{k_1 - k_2}{k_1 + k_2},\\quad \\tau = \\tfrac{2k_1}{k_1 + k_2} = 1 + r`,
    trap: 'Reading $\\tau > 1$ as a probability above 1.',
    claims: [
      claim('l17StepRatio43', 'for E = 4V₀/3 the ratio k₂/k₁ is 0.5', () => close(V.l17StepRatio43, 0.5, 1e-12)),
      claim('l17StepRAmp43', 'so r = 1/3', () => close(V.l17StepRAmp43, 1 / 3, 1e-12)),
      claim('l17StepTau43', 'and τ = 4/3', () => close(V.l17StepTau43, 4 / 3, 1e-12)),
    ],
  },
  'l17-current': {
    points: [
      'Probability is conserved locally: $\\partial_t\\rho + \\partial_xj = 0$, with $j = \\tfrac{\\hbar}{m}\\mathrm{Im}\\left(\\psi^*\\psi\'\\right)$.',
      'For a stationary state the current has one value everywhere. For a single wave it is $v|D|^2$.',
      'The shares are ratios of currents: $R = |r|^2$ and $T = \\tfrac{k_2}{k_1}|\\tau|^2$. They add to 1.',
      `At $E = \\tfrac{4V_0}{3}$ the step reflects $${tf(V.l17StepR43)}$ and transmits $${tf(V.l17StepT43)}$.`,
    ],
    equations: `R + T = 1,\\quad T = \\tfrac{k_2}{k_1}|\\tau|^2`,
    trap: 'Taking $T = |C|^2/|A|^2$. It leaves out the ratio of the speeds.',
    claims: [
      claim('l17StepR43', 'at E = 4V₀/3 the step reflects 1/9', () => close(V.l17StepR43, 1 / 9, 1e-12)),
      claim('l17StepT43', 'and transmits 8/9', () => close(V.l17StepT43, 8 / 9, 1e-12)),
    ],
  },
}
