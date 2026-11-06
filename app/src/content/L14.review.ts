/**
 * Lecture 14 review cards: the exam layer (owner: P; P-L14-story §6). ≤ 5 points, ≤ 25 words per sentence; every number comes from L14.values.ts and is backed by a keyed claim.
 * The books-only unit `l14-box` has no card, as the Townsend units of Lecture 13 had none.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d } from './L14.values'

export const L14_REVIEW: Record<string, ReviewCard> = {
  'l14-components': {
    points: [
      'The numbers $\\psi(a) = \\langle a|\\psi\\rangle$ and $\\psi(x) = \\langle x|\\psi\\rangle$ are both components of one ket. The label takes separate values for a spin and runs over a whole line for a position, so the sum becomes an integral.',
      'A chance is $|\\psi(a)|^2$. Along a line, $|\\psi(x)|^2$ is a density, and only an interval has a chance: $|\\psi(x_0)|^2\\,dx$ for a thin stretch.',
      `With 16 cells of the unit packet, the cell from 0 to 1 holds ${d(V.l14Cell16, 3)}, and all the cells add to ${d(V.l14CellsSum, 0)}.`,
    ],
    equations: '|\\psi(x)|^2\\,dx',
    trap: 'Reading $|\\psi(x_0)|^2$ as the chance of finding the particle at the point $x_0$. A point has zero width, so its chance is zero.',
    claims: [claim('l14Cell16', 'the cell [0, 1) of sixteen holds 0.341', () => close(V.l14Cell16, 0.3413, 5e-4))],
  },
  'l14-schrodinger': {
    points: [
      'Writing $H = \\tfrac{\\hat p^2}{2m} + V(\\hat x)$ is an assumption. The classical energy suggests the operators; it does not prove them.',
      'The potential acts by multiplication because $|x\\rangle$ is an eigenket of every function of $\\hat x$ and $V$ is real. The bra cannot pass through all of $H$.',
      'The position-space equation is the law $i\\hbar\\,d|\\psi\\rangle/dt = H|\\psi\\rangle$ written in one basis, not a second law.',
    ],
    equations: 'i\\hbar\\,\\partial_t\\psi = -\\tfrac{\\hbar^2}{2m}\\,\\partial_x^2\\psi + V\\psi',
    trap: 'Calling the Schrödinger equation a second law, separate from the Hamiltonian law, or reading $\\psi$ as a displacement.',
  },
  'l14-dispersion': {
    points: [
      'Combining $p = \\hbar k$, $E = \\hbar\\omega$ and $E = \\tfrac{p^2}{2m}$ gives $\\omega(k) = \\tfrac{\\hbar k^2}{2m}$.',
      'One time derivative gives $\\omega$ and two space derivatives give $k^2$, so the simplest linear local equation is the free Schrödinger equation.',
      'The equation is linear, so it holds for every packet, a sum of plane waves. Doubling $k$ multiplies $\\omega$ by four for matter and by two for light.',
    ],
    equations: '\\omega(k) = \\tfrac{\\hbar k^2}{2m}',
    trap: 'Saying that a linear dispersion relation forces a second-order equation. Light with one direction of travel obeys a first-order one.',
  },
  'l14-time': {
    points: [
      'A transformation can have a parameter that is not an observable: the distance for $\\hat p$ and the duration for $H$.',
      'A time-dependent Hamiltonian need not conserve energy, yet it still generates the evolution.',
      'A time operator with $[\\hat t,H] = i\\hbar$ would shift every energy, but a Hamiltonian has a lowest energy. Time evolution only turns phases.',
    ],
    equations: 'W\\,H\\,W^\\dagger = H + \\epsilon',
    trap: 'Concluding that no clock exists. Only an unrestricted self-adjoint operator conjugate to $H$ is ruled out.',
  },
  'l14-stationary': {
    points: [
      'Projecting $H|E\\rangle = E|E\\rangle$ on $\\langle x|$ gives the time-independent equation for $\\varphi_E(x)$.',
      'In a stationary state the phase turns as $e^{-iEt/\\hbar}$ but $|\\psi|^2$ does not change. The particle is not at rest.',
      `A superposition of two energies has a cross term that turns at $(E_2 - E_1)/\\hbar$. For levels 1 and 2 of the box of width 4, the density at $x = 1$ repeats every ${d(V.l14SloshPeriod, 2)}.`,
    ],
    equations: '\\left[-\\tfrac{\\hbar^2}{2m}\\tfrac{d^2}{dx^2} + V\\right]\\varphi_E = E\\varphi_E',
    trap: 'Taking "stationary" to mean at rest. A stationary state has a fixed density; its phase still turns.',
    claims: [claim('l14SloshPeriod', 'the period of the pair 1 and 2 in a box of width 4 is 6.79', () => close(V.l14SloshPeriod, 6.79, 5e-3))],
  },
}
