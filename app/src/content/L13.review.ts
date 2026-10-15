/**
 * Lecture 13 review cards: the exam layer (owner: P; P-L13-story §6).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L13.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d } from './L13.values'

export const L13_REVIEW: Record<string, ReviewCard> = {
  'l13-delta': {
    points: [
      'The equation $\\hat x|x_0\\rangle = x_0|x_0\\rangle$ forces $(x - x_0)\\psi_{x_0}(x) = 0$, so the amplitude lives at $x_0$ alone: $\\langle x|x_0\\rangle = \\delta(x - x_0)$.',
      'Exact position is an idealisation. A real state is a narrow packet near $x_0$.',
      `The narrower the packet, the taller its peak: ${d(V.l13Peak05, 3)} per $\\ell$ at half the unit width and ${d(V.l13Peak0125, 2)} at one eighth. Each packet is still normalised.`,
    ],
    equations: '\\langle x|x_0\\rangle = \\delta(x - x_0)',
    trap: 'Squaring a delta. It is a distribution used inside integrals, and its square makes no sense.',
    claims: [claim('l13Peak05', 'the packet of half the unit width peaks at 0.798 per ℓ', () => close(V.l13Peak05, 1 / (0.5 * Math.sqrt(2 * Math.PI)), 1e-12))],
  },
  'l13-generator': {
    points: [
      'The shift has a Hermitian generator. In the position basis it is $\\hat p = -i\\hbar\\,d/dx$.',
      'Calling it momentum rests on experiment and on the quantum–classical link: $e^{ikx}$ carries the momentum $\\hbar k$.',
      'The factor $i$ makes $\\hat p$ Hermitian, shown by parts. A real wavefunction has $\\langle p\\rangle = 0$, so a moving packet needs a phase.',
    ],
    equations: '\\hat p = -i\\hbar\\,\\tfrac{d}{dx}',
    trap: 'Believing that unitarity alone names the observable. It gives a Hermitian generator; the name comes from experiment.',
  },
  'l13-plane-wave': {
    points: [
      'Solving $\\hat p|p\\rangle = p|p\\rangle$ in the position basis gives $\\langle x|p\\rangle = e^{ipx/\\hbar}/\\sqrt{2\\pi\\hbar}$, a plane wave with $p = \\hbar k$.',
      'Its wavelength is $\\lambda = 2\\pi\\hbar/p$ (de Broglie), and its density is the same at every $x$: one exact momentum, no position at all.',
      `Its square integral is infinite, so it is a generalised eigenstate. A very broad packet is close to it: for $\\sigma = 4\\ell$, $\\Delta p = ${d(V.l13Dp4, 3)}\\,\\hbar/\\ell$.`,
    ],
    equations: '\\langle x|p\\rangle = \\tfrac{e^{ipx/\\hbar}}{\\sqrt{2\\pi\\hbar}}',
    trap: 'Normalising a plane wave to 1. Its square integral is infinite.',
    claims: [claim('l13Dp4', 'a packet with σ = 4 ℓ has Δp = 0.125 ħ/ℓ', () => close(V.l13Dp4, 0.125, 1e-9))],
  },
  'l13-momentum-space': {
    points: [
      'The same ket has components $\\psi(x) = \\langle x|\\psi\\rangle$ and $\\tilde\\psi(p) = \\langle p|\\psi\\rangle$. They are a Fourier pair, and both are normalised.',
      'Both $|\\psi|^2dx$ and $|\\tilde\\psi|^2dp$ are chances, each from its own measurement.',
      'For a Gaussian packet $\\Delta x = \\sigma$ and $\\Delta p = \\hbar/2\\sigma$, so $\\Delta x\\,\\Delta p = \\hbar/2$: squeezing in $x$ widens $p$.',
    ],
    equations: '\\Delta x\\,\\Delta p = \\hbar/2',
    trap: 'Treating $\\tilde\\psi$ as another state. It is the same ket in another basis.',
  },
  'l13-two-bases': {
    points: [
      'In the momentum basis $\\hat p$ multiplies by $p$ and $\\hat x = i\\hbar\\,\\partial/\\partial p$. Neither operator changed; the basis did.',
      'In the position basis $[\\hat x,\\hat p]\\psi = -i\\hbar x\\psi\' + i\\hbar(x\\psi)\' = i\\hbar\\psi$. In the momentum basis the same step gives the same result.',
      `So $[\\hat x,\\hat p] = i\\hbar\\,I$ in every basis, and Gaussians sit on the floor $\\Delta x\\,\\Delta p = \\hbar/2$. For $\\sigma = 2\\ell$ the product is ${d(V.l13DxDp2, 2)} $\\hbar$.`,
    ],
    equations: '[\\hat x,\\hat p] = i\\hbar',
    trap: 'Forgetting the product rule. The derivative also acts on the multiplying variable.',
    claims: [claim('l13DxDp2', 'ΔxΔp = ½ ħ for σ = 2', () => close(V.l13DxDp2, 0.5, 1e-9))],
  },
  'l13-schrodinger': {
    points: [
      'With $H = \\hat p^2/(2m) + V(\\hat x,t)$ the abstract law becomes $i\\hbar\\,\\partial_t\\psi = -\\tfrac{\\hbar^2}{2m}\\partial_x^2\\psi + V\\psi$.',
      'A plane wave solves it for $V = 0$, with $E = \\hbar\\omega = \\hbar^2k^2/2m$. Superpositions of plane waves also solve it.',
      `A free packet moves at $p_0/m$ and spreads, while $\\Delta p$ never changes: $\\Delta x$ grows from 1 to ${d(V.l13FreeSd4, 2)} $\\ell$ by $t = 4$.`,
    ],
    equations: 'i\\hbar\\,\\partial_t\\psi = -\\tfrac{\\hbar^2}{2m}\\,\\partial_x^2\\psi + V\\psi',
    trap: 'Reading $\\psi$ as a displacement. It is an amplitude, not something you can see in space.',
    claims: [claim('l13FreeSd4', 'Δx = 2.24 ℓ at t = 4', () => close(V.l13FreeSd4, Math.sqrt(5), 1e-9))],
  },
  'l13-time': {
    points: [
      'Time labels the state: the experimenter chooses it with a clock, and the wavefunction gives the chances of positions at that time.',
      'A generator’s parameter need not be an observable. $H$ generates time shifts without a time operator.',
      'A time operator with $[\\hat t,H] = i\\hbar$ would shift every energy by any $\\epsilon$, but energies have a lowest value.',
    ],
    equations: 'VHV^\\dagger = H + \\epsilon',
    trap: 'Saying that time is a parameter because it cannot be measured. Clocks measure it; it labels the state.',
  },
}
