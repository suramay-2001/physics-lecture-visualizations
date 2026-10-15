/**
 * Lecture 12 review cards: the exam layer (owner: P; P-L12-story §6).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L12.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d } from './L12.values'

export const L12_REVIEW: Record<string, ReviewCard> = {
  'l12-law': {
    points: [
      'The state changes by $i\\hbar\\,d|\\psi\\rangle/dt = H|\\psi\\rangle$, the time-dependent Schrödinger equation. It holds whether or not $H$ depends on time.',
      'For a constant $H$, $U(t) = e^{-itH/\\hbar}$, and a superposition of energies becomes $\\sum_n c_n e^{-iE_nt/\\hbar}|E_n\\rangle$.',
      'Each energy keeps its chance. Only the [[relative-phase|relative phases]] move, so the chance of finding the start state can fall.',
    ],
    equations: '|\\psi(t)\\rangle = \\sum_n c_n e^{-iE_nt/\\hbar}|E_n\\rangle',
    trap: 'Reading “time-dependent equation” as “time-dependent $H$”. The state depends on time; $H$ may not.',
  },
  'l12-motion': {
    points: [
      'The amplitude for $+x$ is $\\langle{+x}|\\psi(t)\\rangle = \\tfrac12(1 + e^{i\\omega t})$: two arrows laid tip to tail.',
      'Squaring gives $P(+x;t) = \\cos^2(\\omega t/2)$, and the chance of $-x$ is $\\sin^2(\\omega t/2)$.',
      'The chain is: energy splitting, growing relative phase, turning arrow, oscillating chance. After one period the chance is back to 1.',
    ],
    equations: 'P(+x;t) = \\cos^2(\\omega t/2)',
    trap: 'Confusing $\\omega t$ with $\\omega t/2$. The chance depends on half the angle the arrow has turned.',
    claims: [claim('l12Px90', 'P(+x) at ωt = 90° is ½, and the amplitude is ½ (1 + e^{iωt})', () => close(V.l12Px90, 0.5))],
  },
  'l12-continuum': {
    points: [
      'A position measurement can return any real $x$, so the position basis is continuous.',
      'Sums over the basis become integrals: $I = \\int dx\\,|x\\rangle\\langle x|$, and $\\delta_{nm}$ becomes $\\delta(x - x\')$.',
      'A single exact position has no chance. Only stretches of the line do.',
    ],
    equations: '\\int dx\\,|x\\rangle\\langle x| = I',
    trap: 'Reading $|\\psi(x)|^2$ as the chance of one point. It is a density, a chance per length.',
  },
  'l12-wavefunction': {
    points: [
      'The wavefunction is the ket in the position basis: $\\psi(x) = \\langle x|\\psi\\rangle$.',
      'Its square $|\\psi(x)|^2$ is a density, and the chance in a stretch is $\\int_a^b|\\psi|^2dx$.',
      `A density can exceed 1. A packet four times narrower peaks at ${d(V.l12PeakQuarter, 2)} per $\\ell$ and every chance is still at most 1.`,
    ],
    equations: 'P(a<x<b) = \\int_a^b|\\psi(x)|^2dx',
    trap: 'Calling a density above 1 an error. Only a chance above 1 would be one.',
    claims: [claim('l12PeakQuarter', 'a packet four times narrower peaks at 1.60 per ℓ', () => close(V.l12PeakQuarter, 1 / (0.25 * Math.sqrt(2 * Math.PI)), 1e-12))],
  },
  'l12-position-op': {
    points: [
      'In the position representation $\\hat x$ is multiplication by $x$: $\\langle x|\\hat x|\\psi\\rangle = x\\,\\psi(x)$.',
      'The average $\\langle\\hat x\\rangle$ is the mean of the probability density $|\\psi|^2$.',
      'It is still Hermitian, with real eigenvalues. Only the basis has changed.',
    ],
    equations: '\\langle x|\\hat x|\\psi\\rangle = x\\,\\psi(x)',
    trap: 'Thinking $\\hat x$ shifts the graph. It stretches each value by the number $x$ and does not move the picture.',
  },
  'l12-translations': {
    points: [
      'The translation $T(a) = e^{-ia\\hat p/\\hbar}$ shifts a state right by $a$, so $\\psi_a(x) = \\psi(x - a)$.',
      'Comparing a tiny shift two ways gives $\\hat p = -i\\hbar\\,d/dx$ in the position representation.',
      'Three generators, one shape: $S_z$ for turns, $H$ for waiting and $\\hat p$ for shifts.',
    ],
    equations: '\\hat p = -i\\hbar\\,\\tfrac{d}{dx}',
    trap: 'Getting the sign of the shift wrong. Moving right by $a$ means $\\psi(x - a)$, not $\\psi(x + a)$.',
  },
}
