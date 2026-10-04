/**
 * Chapter Q9 review cards: the exam layer in both tracks (P-Q9-story §6). Ground-up <= 25 words per sentence, Formal
 * <= 40; <= 5 points each. Every displayed number comes from Q9.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close } from './Q9.values'

export const Q9_REVIEW: Record<string, ReviewCard> = {
  'q9-partial-trace': {
    points: [
      '$\\rho_A = \\mathrm{Tr}_B\\,\\rho$ gives every average of a reading on A alone.',
      "Each entry is a block's trace.",
      'Every Bell state leaves $\\tfrac12I$.',
      "GHZ minus one qubit is Unit 8.1's box.",
    ],
    equations: '\\rho_A = \\mathrm{Tr}_B\\,\\rho = \\sum_b\\langle b|\\rho|b\\rangle,\\quad (\\rho_A)_{aa\'} = \\sum_b\\rho_{ab,a\'b}',
    trap: 'Keeping the corner coherences: entries with different B labels never reach $\\rho_A$.',
    claims: [claim('q9ProdRA00', "the review's product pair has $(\\rho_A)_{00} = 0.75$", () => close(V.q9ProdRA00, 0.75))],
    formal: {
      points: [
        '$\\langle O\\otimes I\\rangle = \\mathrm{Tr}(\\rho_AO)$.',
        'HW2 P2(d): local readings cannot tell Bell states apart.',
        'HW2 P7(e): $\\mathrm{Tr}_3$ of GHZ is a mixture of products.',
      ],
      trap: 'Thinking a joint reading could be replaced by two local ones: the Bell measurement reads parities, not single-qubit values.',
    },
  },
  'q9-same-part': {
    points: [
      'The singlet and the coin pair give the same $\\rho_A$ and $\\rho_B$.',
      'Their grids differ: −1, −1, −1 against 0, 0, −1.',
      'Only joint readings see the difference.',
    ],
    equations: "\\mathrm{Tr}_2\\big(|i_1\\rangle\\langle j_1|\\otimes|i_2\\rangle\\langle j_2|\\big) = \\delta_{i_2j_2}|i_1\\rangle\\langle j_1|",
    trap: 'Thinking "same parts" means "same whole": the correlations live only in the whole.',
    claims: [claim('q9SingXX', "the review's singlet gives $\\langle X_AX_B\\rangle = -1$", () => close(V.q9SingXX, -1))],
    formal: {
      points: ['Reduced states do not determine the whole.', 'Notes Eq. 2.22 and the general partial trace.', "Bergou's Eq. 2.9 is $\\mathrm{Tr}_B$."],
      trap: 'Assuming matching one-qubit statistics force a matching two-qubit state.',
    },
  },
  'q9-entropy': {
    points: [
      '$S = -\\sum\\lambda\\log_2\\lambda$ from $\\rho$\'s eigenvalues.',
      'Pure 0, fair coin 1 bit, at most $\\log_2d$.',
      'For a qubit S depends only on the arrow\'s length.',
      '$E = S(\\rho_A)$ measures a pure pair\'s entanglement.',
    ],
    equations: 'S(\\rho) = -\\mathrm{Tr}(\\rho\\log_2\\rho)',
    trap: "Computing S from a recipe's weights: Unit 8.4's mixture has weights ½, ½ but S = 0.601, not 1.",
    claims: [claim('q9SZX', "the review's mixture has entropy 0.601, not its recipe weight of 1", () => close(V.q9SZX, 0.6009482375357762, 1e-6))],
    formal: {
      points: ['Notes Eq. 2.23.', 'S = h\\big(\\tfrac12(1 + |\\mathbf r|)\\big).', 'Bergou Eq. 3.41.'],
      trap: "Confusing the ensemble's Shannon entropy with the von Neumann entropy of $\\rho$: they agree only for orthogonal members.",
    },
  },
  'q9-schmidt': {
    points: [
      "Grouping by A's eigenvectors makes the partners orthogonal.",
      'The weights are $\\sqrt\\lambda$.',
      'Rank 1 means a product.',
      'Both halves share their eigenvalues.',
    ],
    equations: '|\\psi\\rangle = \\sum_k\\sqrt{\\lambda_k}|u_k\\rangle|w_k\\rangle',
    trap: "Taking the 0/1 rows of the grid as the Schmidt terms: they overlap unless the basis is $\\rho_A$'s eigenbasis.",
    claims: [claim('q9PSchmidtLarge', "the review's pair has a Schmidt weight of 0.924", () => close(V.q9PSchmidtLarge, Math.sqrt((2 + Math.SQRT2) / 4)))],
    formal: {
      points: ['Notes Eqs. 2.24–2.28.', 'Schmidt = SVD of C (N&C Theorem 2.7).', '$S(\\rho_A) = S(\\rho_B)$.'],
      trap: 'Forgetting that the Schmidt basis is basis-dependent on neither side alone: it is forced by $\\rho_A$ (equivalently $\\rho_B$).',
    },
  },
  'q9-purification': {
    points: [
      'Every mixture is one half of a pure pair.',
      'Tag each member with an orthogonal partner state.',
      'Two purifications differ by a gate on the partner.',
      "A reading on the partner picks a recipe for A.",
    ],
    equations: '|\\Psi\\rangle = \\sum_i\\sqrt{p_i}|\\psi_i\\rangle|i\\rangle',
    trap: 'Forgetting the square root: $\\sum_ip_i|\\psi_i\\rangle|i\\rangle$ is not normalized and traces to the wrong $\\rho$.',
    claims: [claim('q9PurGap', "the review's purification traces to Unit 8.4's mixture", () => close(V.q9PurGap, 0, 1e-9))],
    formal: {
      points: ['Bergou Eqs. 2.53–2.55.', 'Eq. 2.56, corrected: $U_B|v_k\\rangle = |w_k\\rangle$.', "The partner's unitary is the recipe unitary of Unit 8.6."],
      trap: 'Treating one purification as THE purification: any orthonormal tagging of the ancilla works.',
    },
  },
  'q9-distance': {
    points: [
      'D is half the sum of the eigenvalue sizes of $\\rho_1 - \\rho_2$.',
      'For qubits, half the straight distance in the ball.',
      'For pure states F is the overlap\'s size.',
      'Pure: $D = \\sqrt{1 - F^2}$.',
    ],
    equations: 'D = \\tfrac12\\|\\rho_1 - \\rho_2\\|_1,\\quad F = \\mathrm{Tr}\\sqrt{\\rho_1^{1/2}\\rho_2\\rho_1^{1/2}}',
    trap: 'Mixing the two fidelity conventions: Bergou and N&C use the root; some texts square it.',
    claims: [claim('q9D0P', "the review's $|0\\rangle$, $|+\\rangle$ pair has D = 0.707", () => close(V.q9D0P, Math.SQRT1_2, 1e-6))],
    formal: {
      points: ['$D = \\max_\\Pi\\mathrm{Tr}\\,\\Pi(\\rho_1 - \\rho_2)$ (Bergou Eq. 2.58).', 'N&C Eq. 9.20.', '$1 - F \\le D \\le \\sqrt{1 - F^2}$ (Bergou Eq. 2.62).'],
      trap: 'Assuming the mixed-state bounds are tight: only pure states pin D from F exactly.',
    },
  },
}
