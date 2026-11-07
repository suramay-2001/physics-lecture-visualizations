/**
 * Lecture 16 review cards: the exam layer (owner: P; P-L16-story §6). ≤ 5 points, ≤ 25 words per sentence; every number comes from L16.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d } from './L16.values'

export const L16_REVIEW: Record<string, ReviewCard> = {
  'l16-start': {
    points: [
      'The packet is fixed by its centre $x_0$, its mean momentum $p_0$ and its width $\\sigma$. Then $\\Delta x = \\sigma$ and $\\Delta p = \\hbar/2\\sigma$.',
      `A free Gaussian meets the uncertainty bound at the start: for $\\sigma = 1\\,\\ell$, $\\Delta x\\,\\Delta p = ${d(V.l16Product0, 1)}\\,\\hbar$.`,
      'Free evolution multiplies each momentum amplitude by a phase, so the momentum chances, $p_0$ and $\\Delta p$ never change.',
    ],
    equations: '\\Delta x\\,\\Delta p = \\tfrac{\\hbar}{2}',
    trap: 'Thinking that a phase changes the momentum chances. It changes only how the momenta interfere in position space.',
    claims: [claim('l16Product0', 'ΔxΔp = 0.5 ħ at t = 0', () => close(V.l16Product0, 0.5, 1e-9))],
  },
  'l16-evolve': {
    points: [
      'Sum the phased momentum components and use the Gaussian identity. The result carries the complex factor $1 + i\\tau$, with $\\tau = t/t_s$ and $t_s = 2m\\sigma^2/\\hbar$.',
      'The centre variable is $X = x - x_0 - p_0t/m$, so the density is centred on $x_0 + p_0t/m$.',
      'Check the formula at $t = 0$: $\\tau = 0$ returns the starting packet.',
    ],
    equations: '\\psi(x,t) = \\frac{1}{\\sqrt[4]{2\\pi\\sigma^2}}\\,\\frac{1}{\\sqrt{1+i\\tau}}\\,e^{-\\frac{X^2}{4\\sigma^2(1+i\\tau)}}\\,e^{i\\left[p_0(x-x_0) - p_0^2t/2m\\right]/\\hbar}',
    trap: 'Dropping the factor $1 + i\\tau$ in the width, so that the packet only slides.',
  },
  'l16-spread': {
    points: [
      'The density is a bell curve at every time, centred at $x_0 + p_0t/m$ with width $\\Delta x(t) = \\sigma\\sqrt{1 + (t/t_s)^2}$.',
      `At $t = t_s$ the width is $\\sqrt2\\,\\sigma$. For $\\sigma = 1\\,\\ell$ it is ${d(V.l16FreeSd2, 3)} $\\ell$.`,
      'Narrower packets have a shorter $t_s$, because $t_s$ goes as $\\sigma^2$.',
      `$\\Delta p$ stays fixed, so $\\Delta x\\,\\Delta p$ grows and stays above $\\hbar/2$: $${d(V.l16Product4, 3)}\\,\\hbar$ at $t = 4$ for $\\sigma = 1\\,\\ell$.`,
    ],
    equations: '\\Delta x(t) = \\sigma\\sqrt{1+(t/t_s)^2}',
    trap: 'Saying that the uncertainty principle makes the packet spread. It limits the starting state; the Hamiltonian does the spreading.',
    claims: [
      claim('l16FreeSd2', 'Δx = 1.414 ℓ for σ = 1 at t = 2', () => close(V.l16FreeSd2, Math.SQRT2, 1e-9)),
      claim('l16Product4', 'ΔxΔp = 1.118 ħ at t = 4', () => close(V.l16Product4, Math.sqrt(5) / 2, 1e-9)),
    ],
  },
  'l16-ehrenfest': {
    points: [
      'The rate law with $\\hat x$ and $\\hat p$ gives Newton-like laws for the averages. First, $\\frac{d}{dt}\\langle x\\rangle = \\langle p\\rangle/m$. Second, $\\frac{d}{dt}\\langle p\\rangle = -\\langle V\'\\rangle$.',
      'The first comes from $[\\hat p^2,\\hat x] = -2i\\hbar\\,\\hat p$. The second comes from $[V,\\hat p] = i\\hbar V\'$.',
      `Both hold for any state, not only a Gaussian. For $V = \\tfrac{x^2}{2}$ and a packet at 2, $d\\langle p\\rangle/dt$ is $-${d(Math.abs(V.l16EhrenfestDpDt), 0)}$.`,
      'With $V = 0$ the mean momentum is constant, and the widening of the packet changes nothing about it.',
    ],
    equations: '\\frac{d\\langle x\\rangle}{dt} = \\frac{\\langle p\\rangle}{m},\\quad -\\langle V\'\\rangle = \\frac{d\\langle p\\rangle}{dt}',
    trap: 'Replacing the average force $\\langle V\'\\rangle$ by the force at the average position, $V\'(\\langle x\\rangle)$. Lecture 17 says when that is allowed.',
    claims: [claim('l16EhrenfestDpDt', 'd⟨p⟩/dt = −2 for V = x²/2 and a packet at 2', () => close(V.l16EhrenfestDpDt, -2, 1e-9))],
  },
}
