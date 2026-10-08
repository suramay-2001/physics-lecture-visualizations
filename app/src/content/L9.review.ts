/**
 * Lecture 9 review cards: the exam layer (owner: P; P-L9-story §6).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L9.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d } from './L9.values'

export const L9_REVIEW: Record<string, ReviewCard> = {
  'l9-tensor': {
    points: [
      'Two systems have one state space between them, $\\mathcal H_{AB} = \\mathcal H_A \\otimes \\mathcal H_B$, not two spaces side by side.',
      'It has one basis state for each pair of labels, drawn as one box in a table.',
      'Dimensions multiply: a photon polarization (two states) with a die (six states) gives 12 basis states.',
      'The label $|H4\\rangle$ names one state of the pair. It is not two states, and not a number.',
    ],
    equations: '\\dim(\\mathcal H_A \\otimes \\mathcal H_B) = N_A N_B,\\qquad 2 \\times 6 = 12',
    trap: 'Adding the dimensions. Two plus six would be 8; the pair has 12.',
    claims: [claim('l9DimCoinDie', '2 · 6 = 12', () => V.l9DimCoinDie === 12)],
  },
  'l9-classical': {
    points: [
      'Two systems can be correlated with nothing quantum going on: a dealer hands out a penny and a dime.',
      'Each average is 0, yet the coins always differ, so $\\langle\\sigma_A\\sigma_B\\rangle = -1$ and the correlation is $-1$.',
      'Independence means the joint chances factor, $P(a,b) = P_A(a)P_B(b)$. Then $\\langle ab\\rangle = \\langle a\\rangle\\langle b\\rangle$ and the correlation is 0.',
      `For $P_A(+1) = ${d(V.l9BiasedPA, 1)}$ and $P_B(+1) = ${d(V.l9BiasedPB, 1)}$: $\\langle ab\\rangle = ${d(V.l9BiasedA, 1)} \\cdot (-${d(V.l9BiasedBSize, 1)}) = -${d(V.l9BiasedABSize, 2)}$.`,
    ],
    equations: 'P(a,b) = P_A(a)P_B(b) \\;\\Rightarrow\\; \\langle ab\\rangle - \\langle a\\rangle\\langle b\\rangle = 0',
    trap: 'Reading “correlated” as “quantum”. The dealer’s coins are perfectly anticorrelated and fully classical.',
    claims: [
      claim('l9CoinCorr', 'the dealer’s correlation is −1', () => close(V.l9CoinCorr, -1)),
      claim('l9BiasedPA', 'P_A(+1) = 0.7', () => close(V.l9BiasedPA, 0.7)),
      claim('l9BiasedPB', 'P_B(+1) = 0.4', () => close(V.l9BiasedPB, 0.4)),
      claim('l9BiasedA', '⟨a⟩ = 0.4', () => close(V.l9BiasedA, 0.4)),
      claim('l9BiasedBSize', '⟨b⟩ = −0.2', () => close(V.l9BiasedBSize, 0.2)),
      claim('l9BiasedABSize', '⟨ab⟩ = −0.08', () => close(V.l9BiasedABSize, 0.08)),
    ],
  },
  'l9-two-spins': {
    points: [
      'Write $|u\\rangle = |{+z}\\rangle$ and $|d\\rangle = |{-z}\\rangle$. Two spins have the basis $|uu\\rangle$, $|ud\\rangle$, $|du\\rangle$, $|dd\\rangle$.',
      'The first letter is always Alice’s and the second Bob’s.',
      'The four are orthonormal: $\\langle ab|a\'b\'\\rangle = \\delta_{aa\'}\\delta_{bb\'}$, so $\\langle ud|du\\rangle = 0$.',
      'Any combination is a state of the pair: one four-dimensional vector, not two kets.',
    ],
    equations: '|\\Psi\\rangle = \\psi_{uu}|uu\\rangle + \\psi_{ud}|ud\\rangle + \\psi_{du}|du\\rangle + \\psi_{dd}|dd\\rangle',
    trap: 'Treating $|ud\\rangle$ and $|du\\rangle$ as the same state because they hold the same letters.',
    claims: [claim('l9UdDu', '⟨ud|du⟩ = 0', () => close(V.l9UdDu, 0))],
  },
  'l9-product': {
    points: [
      'Independent preparations give a product state, $|\\psi_A\\rangle \\otimes |\\psi_B\\rangle$, with $\\psi_{ab} = \\alpha_a\\beta_b$.',
      'Its four amplitudes come from only two small states: the grid is Alice’s column times Bob’s row.',
      'Normalization is automatic, because the four chances add to a product of two brackets that are each 1.',
      'Bob’s predictions are those of $|\\psi_B\\rangle$, whatever Alice prepared.',
    ],
    equations: '\\psi_{ab} = \\alpha_a\\beta_b,\\qquad \\langle\\Psi|\\Psi\\rangle = (|\\alpha_u|^2 + |\\alpha_d|^2)(|\\beta_u|^2 + |\\beta_d|^2) = 1',
    trap: 'Mixing up two meanings of product: the tensor-product space holds every pair state, a product state is one special vector in it.',
    claims: [claim('l9ProdNorm', 'the chances add to 1', () => close(V.l9ProdNorm, 1))],
  },
  'l9-counting': {
    points: [
      'The rules allow every normalized vector of the four-dimensional space, not only products.',
      'One spin has 2 real parameters, so two separate spins have $2 + 2 = 4$.',
      'A general pair has eight reals, minus normalization and the overall phase: $8 - 1 - 1 = 6$.',
      'Six is more than four, so some pair states are not products. They are called entangled.',
    ],
    equations: '8 - 1 - 1 = 6 > 2 + 2',
    trap: 'Reading “four amplitudes either way” as “the same states”. A product’s four are tied together; the general four are free.',
    claims: [
      claim('l9ParamsProduct', '2 + 2 = 4', () => V.l9ParamsProduct === 4),
      claim('l9ParamsGeneral', '8 − 1 − 1 = 6', () => V.l9ParamsGeneral === 6),
    ],
  },
  'l9-singlet': {
    points: [
      `The singlet $(|ud\\rangle - |du\\rangle)/\\sqrt2$ is normalized, with two boxes of size ${d(V.l9SingUd)}.`,
      'It does not factor. Assume it does and match amplitudes: $\\alpha_u\\beta_d \\ne 0$ forces $\\alpha_u \\ne 0$, then $\\alpha_u\\beta_u = 0$ forces $\\beta_u = 0$, and $\\alpha_d\\beta_u$ would be 0.',
      'So the pair has a state while the two spins have none of their own.',
      'Do not count terms: $\\tfrac12(|uu\\rangle + |ud\\rangle + |du\\rangle + |dd\\rangle)$ factors as $|{+x}\\rangle \\otimes |{+x}\\rangle$.',
    ],
    equations: '|\\mathrm{sing}\\rangle = \\tfrac{1}{\\sqrt2}(|ud\\rangle - |du\\rangle) \\ne |\\psi_A\\rangle \\otimes |\\psi_B\\rangle',
    trap: 'Counting terms. Four terms can still be a product; one flipped sign can make four terms entangled.',
    claims: [
      claim('l9SingUd', 'the singlet’s boxes have size 0.707', () => close(V.l9SingUd, Math.SQRT1_2)),
      claim('l9ExitPlusPlus', 'the four-term state is |+x⟩ ⊗ |+x⟩', () => V.l9ExitPlusPlus === 1),
      claim('l9UniAmp', 'ψ_ab = ½ for the four-term state', () => close(V.l9UniAmp, 0.5)),
    ],
  },
}

