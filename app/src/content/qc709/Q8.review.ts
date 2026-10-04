/**
 * Chapter Q8 review cards: the exam layer in both tracks (P-Q8-story §6). Ground-up ≤ 25 words per sentence, Formal
 * ≤ 40; ≤ 5 points each. Every displayed number comes from Q8.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close } from './Q8.values'

export const Q8_REVIEW: Record<string, ReviewCard> = {
  'q8-why': {
    points: [
      'Reading one GHZ qubit and losing the record leaves a coin’s choice of $|00\\rangle$ or $|11\\rangle$.',
      'In z the box looks exactly like $\\Phi^+$.',
      'An x reading on both qubits tells them apart: 0 against +1.',
      'The box holds no entanglement.',
    ],
    equations: '\\langle X_1X_2\\rangle_{\\mathrm{box}} = \\tfrac12\\langle00|XX|00\\rangle + \\tfrac12\\langle11|XX|11\\rangle = 0',
    trap: 'Thinking the same z chances mean the same state: a superposition and a mixture can share every z statistic.',
    formal: {
      points: [
        'No ket reproduces both the z and the x statistics: the pair is mixed.',
        '$\\langle X_1X_2\\rangle_{\\mathrm{box}} = 0$, $\\langle X_1X_2\\rangle_{\\Phi^+} = 1$.',
        'GHZ entanglement does not survive the loss of one qubit.',
      ],
      trap: 'Assuming matching z statistics force a matching state.',
    },
  },
  'q8-pure-rho': {
    points: [
      '$\\rho = |\\psi\\rangle\\langle\\psi|$ writes a pure state as a table.',
      'The diagonal holds the chances; the corners, the coherences, hold the relative phase.',
      '$\\mathrm{Tr}\\,\\rho = 1$, and a pure $\\rho$ squares to itself.',
      'An overall phase on $|\\psi\\rangle$ leaves $\\rho$ unchanged.',
    ],
    equations: '\\rho = |\\psi\\rangle\\langle\\psi|,\\quad \\rho_{ij} = c_ic_j^*,\\quad \\mathrm{Tr}\\,\\rho = 1',
    trap: 'Reading a coherence as a chance: the corners can be complex and even negative.',
    formal: {
      points: ['$\\rho_{ij} = c_ic_j^*$, so $\\rho_{ii} = |c_i|^2$.', '$\\rho$ is Hermitian with unit trace; $\\rho^2 = \\rho$ iff pure.', 'A global phase drops out of $\\rho$: it is the physical state itself.'],
      trap: 'Forgetting that $\\rho$ already discards the global phase a ket still carries.',
    },
  },
  'q8-trace-rule': {
    points: [
      'An average is a trace: $\\langle A\\rangle = \\mathrm{Tr}(A\\rho)$, needing no ket.',
      'A reading with no record erases the corners.',
      '$\\rho$ moves in time by $i\\hbar\\dot\\rho = [\\hat H, \\rho]$.',
      'Under $\\tfrac{\\hbar\\omega}2Z$ the corners turn and the diagonal stays.',
    ],
    equations: '\\langle A\\rangle = \\mathrm{Tr}(A\\rho),\\quad i\\hbar\\dot\\rho = [\\hat H, \\rho]',
    trap: 'Using Heisenberg’s sign for ρ: $i\\hbar\\dot\\rho = [\\rho, \\hat H]$ runs time backwards.',
    formal: {
      points: [
        '$\\mathrm{Tr}(A\\rho) = \\mathrm{Tr}(\\rho A)$ holds even where no ket exists.',
        'Postulates 4a–6a: $p_j = \\mathrm{Tr}(P_j\\rho)$, post-state $P_j\\rho P_j/p_j$, unrecorded $\\sum_jP_j\\rho P_j$.',
        'The von Neumann sign is opposite to Heisenberg’s, since ρ is the state, not an observable.',
      ],
      trap: 'Writing $i\\hbar\\dot\\rho = [\\rho, \\hat H]$, the Heisenberg sign, for the state itself.',
    },
  },
  'q8-mixed': {
    points: [
      'A mixture weights each member’s $\\rho$ by its chance and adds them.',
      'Purity $\\mathrm{Tr}\\,\\rho^2$ equals 1 only for pure states.',
      'A qubit mixture’s arrow is the weighted average of its members’ arrows, inside the sphere.',
      'A thermal box has $\\langle S_z\\rangle = \\tfrac\\hbar2\\tanh(E_Z/2k_BT)$.',
    ],
    equations: '\\rho = \\sum_np_n|\\psi_n\\rangle\\langle\\psi_n|,\\quad \\mathrm{Tr}\\,\\rho^2 \\le 1',
    trap: 'Adding amplitudes instead of matrices: a mixture of $|0\\rangle$ and $|+\\rangle$ is not the ket $(|0\\rangle + |+\\rangle)/\\text{norm}$.',
    claims: [claim('q8ZXPur', 'the review’s $|0\\rangle$–$|+\\rangle$ mixture has purity 0.75, below the pure ket’s 1', () => close(V.q8ZXPur, 0.75))],
    formal: {
      points: [
        '$\\rho = \\sum_np_n|\\psi_n\\rangle\\langle\\psi_n|$, $\\langle A\\rangle = \\mathrm{Tr}(\\rho A)$.',
        'The notes’ $|0\\rangle$–$|+\\rangle$ mixture: $\\mathrm{Tr}\\,\\rho^2 = \\tfrac34$, $\\langle S_z\\rangle = \\langle S_x\\rangle = \\tfrac\\hbar4$.',
        'HW2 P4: $\\mathrm{Tr}\\,\\rho^2 = 1 - p + p^2$, below 1 for $0 < p < 1$.',
      ],
      trap: 'Mixing a ket sum where the recipe calls for a matrix sum.',
    },
  },
  'q8-ball': {
    points: [
      '$\\rho = \\tfrac12(I + \\mathbf r\\cdot\\boldsymbol\\sigma)$: one arrow per $\\rho$.',
      'Positivity means $|\\mathbf r| \\le 1$; trace and Hermiticity alone are not enough.',
      'The surface of the ball is exactly the pure states.',
      '$r_j = \\mathrm{Tr}(\\rho\\sigma_j)$: the ball’s coordinates are three averages.',
    ],
    equations: '\\rho = \\tfrac12(I + \\mathbf r\\cdot\\boldsymbol\\sigma),\\quad r_j = \\mathrm{Tr}(\\rho\\sigma_j)',
    trap: 'Reading a short arrow as "partly up": it is a mixture whose every reading is less certain, not a weaker spin.',
    formal: {
      points: ['$\\det\\rho = \\tfrac14(1 - |\\mathbf r|^2) \\ge 0 \\Rightarrow |\\mathbf r| \\le 1$.', '$\\mathrm{Tr}\\,\\rho^2 = \\tfrac12(1 + |\\mathbf r|^2)$, 1 iff $|\\mathbf r| = 1$.', 'Unit trace and Hermiticity fix only three of the four conditions; positivity is the fourth.'],
      trap: 'Treating trace 1 and Hermiticity as sufficient for a density matrix.',
    },
  },
  'q8-recipes': {
    points: [
      'One $\\rho$ can have many recipes; no experiment tells them apart.',
      '$\\rho$’s own eigenvalues and eigenvectors give one particular recipe.',
      'Mixing two density matrices keeps the result inside the ball: the set is convex.',
      'A pure state has exactly one recipe.',
    ],
    equations: '\\sqrt{p_i}|\\psi_i\\rangle = \\sum_jU_{ij}\\sqrt{q_j}|\\varphi_j\\rangle',
    trap: 'Treating the ensemble as part of the state: the same $\\rho$ hides every recipe equally well.',
    formal: {
      points: ['Two poles-recipes for $\\tfrac12I$ (z poles, x poles) and the eigen-recipe of a mixed $\\rho$ (notes Eqs. 2.18–2.20).', 'Convexity: a mixture’s point lies on the chord; extreme points are pure.', 'Unitary freedom links any two recipes of one ρ, padding the shorter list (Bergou; N&C’s unitary-freedom theorem).'],
      trap: 'Forgetting the padding when the two recipes have different numbers of members.',
    },
  },
}
