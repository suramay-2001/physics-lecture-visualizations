/**
 * Chapter Q12 review cards: the exam layer in both tracks (P-Q12-story §6). Ground-up ≤ 25 words per sentence,
 * Formal ≤ 40; ≤ 5 points each. Every displayed number comes from Q12.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close } from './Q12.values'

export const Q12_REVIEW: Record<string, ReviewCard> = {
  'q12-ppt': {
    points: [
      'Separable means a mixture of product states.',
      'The partial transpose flips one party’s indices.',
      'A negative eigenvalue after the flip proves entanglement.',
      'For two qubits the test is exact, and sharper than CHSH.',
    ],
    equations: '(\\rho^{T_B})_{m\\mu,n\\nu} = \\rho_{m\\nu,n\\mu};\\quad \\lambda_{\\min} = \\tfrac12[(1-p) - \\sqrt{(1-p)^2 + p^2}] < 0',
    trap: 'Reading "no Bell violation" as "separable": CHSH misses entangled states that PPT catches.',
    claims: [claim('q12BergLamMinAt05', 'the review’s running state at p = 0.5 has $\\lambda_{\\min}(\\rho^{T_B}) = -0.104$', () => close(V.q12BergLamMinAt05, -0.1035533905932738, 1e-6))],
    formal: {
      points: [
        '$\\rho^{T_B}\\ge 0$ for every separable state.',
        'For $2\\otimes2$ and $2\\otimes3$ the converse holds (Peres–Horodecki).',
        'The running state is entangled for all $p > 0$, below the CHSH threshold $1/\\sqrt2$.',
      ],
      trap: 'Thinking the Peres criterion is only sufficient in every dimension: it is also necessary for $2\\otimes2$ and $2\\otimes3$.',
    },
  },
  'q12-witness': {
    points: [
      'A witness is one observable, $\\langle W\\rangle \\ge 0$ on separable, $< 0$ on some entangled.',
      'Build it from the negative eigenvector of $\\rho^{T_B}$.',
      'Its average on the running state is that eigenvalue.',
      'No full tomography is needed.',
    ],
    equations: '\\mathrm{Tr}(\\rho W) = \\mathrm{Tr}(\\rho^{T_B}|\\eta\\rangle\\langle\\eta|) = \\lambda_-',
    trap: 'Thinking $W\\ge 0$: the witness is not positive; only $\\rho_s^{T_B}$ is.',
    claims: [claim('q12WitnessVal', 'the review’s witness value is $-0.104$', () => close(V.q12WitnessVal, -0.1035533905932738, 1e-6))],
    formal: {
      points: ['$W = (|\\eta\\rangle\\langle\\eta|)^{T_B}$.', '$\\mathrm{Tr}(\\rho W) = \\lambda_- < 0$ by the transpose-swap identity.', '$\\mathrm{Tr}(\\rho_sW)\\ge 0$ because separable states are PPT.'],
      trap: 'Forgetting the transpose-swap identity $\\mathrm{Tr}(X^{T_B}Y) = \\mathrm{Tr}(XY^{T_B})$: it is what moves the flip from $\\rho$ onto $W$.',
    },
  },
  'q12-locc': {
    points: [
      'LOCC is local gates, measurements and a classical call — no mailing qubits.',
      'One Bell pair is one ebit.',
      'Weak copies distil to fewer strong pairs; the rate is $E = S(\\rho_A)$.',
      'Procrustean distillation succeeds with chance $2\\sin^2\\theta$.',
    ],
    equations: 'p_s = 2\\sin^2\\theta = 1 - \\cos2\\theta',
    trap: '"Local operations can boost entanglement": they can only redistribute or spend it.',
    claims: [claim('q12ProcPs30', 'the review’s Procrustean step at $\\theta = 30°$ succeeds with chance 0.5', () => close(V.q12ProcPs30, 0.5, 1e-6))],
    formal: {
      points: ['LOCC cannot create entanglement from a product state.', 'Distillation and dilution both run at rate $S(\\rho_A)$ (N&C).', 'Procrustean: success $\\to \\Phi^+$, failure $\\to |1\\rangle_{A\'}|00\\rangle$.'],
      trap: 'Forgetting the failure branch is $|1\\rangle_{A\'}|00\\rangle$, not $|10\\rangle_{AB}$ (erratum B9).',
    },
  },
  'q12-entropy': {
    points: ['A pure pair’s entanglement is $E = S(\\rho_A)$.', 'Local turns leave $E$ unchanged.', '$E$ is additive and never grows under LOCC.', 'Mixed pairs use the entanglement of formation.'],
    equations: 'E = S(\\rho_A) = h(\\cos^2\\theta);\\quad E_F(\\rho) = \\inf\\sum_kp_kE(|\\psi^{(k)}\\rangle)',
    trap: 'Using $S(\\rho_A)$ for a mixed pair: a separable mixed state can have a fully mixed marginal.',
    claims: [claim('q12E30', 'the review’s tilted pair at $\\theta = 30°$ has $E = 0.811$ bit', () => close(V.q12E30, 0.8112781244591328, 1e-6))],
    formal: {
      points: ['$E(|\\psi\\rangle) = S(\\rho_A) = S(\\rho_B)$.', '$S(U_A\\rho_AU_A^\\dagger) = S(\\rho_A)$; additive; $\\overline E$ non-increasing (Eq. 3.58; N&C majorization).', '$E_F(\\rho) = \\inf\\sum_kp_kE(|\\psi^{(k)}\\rangle)$.'],
      trap: 'Reading the Werner state’s $S(\\rho_A) = 1$ bit as its entanglement: it is mixed, so $S(\\rho_A)$ does not apply.',
    },
  },
  'q12-concurrence': {
    points: [
      'Flip the state with $\\sigma_y\\otimes\\sigma_y$ and overlap it with the original: that is the concurrence.',
      'Pure: $C = 2\\sqrt{\\lambda_1\\lambda_2} = \\sin2\\theta = 2|\\det A|$.',
      '$E$ is a fixed increasing function of $C$.',
      'Wootters gives $C$ for any mixed two-qubit state.',
    ],
    equations: 'C = 2\\sqrt{\\lambda_1\\lambda_2};\\quad C(\\rho) = \\max(0, \\lambda_1 - \\lambda_2 - \\lambda_3 - \\lambda_4)',
    trap: 'Reading the Wootters $\\lambda_i$ as Schmidt weights: they are square-root eigenvalues of $\\rho\\tilde\\rho$, a different list.',
    claims: [claim('q12ConcPure30', 'the review’s tilted pair has concurrence 0.866', () => close(V.q12ConcPure30, Math.sqrt(3) / 2, 1e-6))],
    formal: {
      points: ['$C = |\\langle\\psi|\\tilde\\psi\\rangle|$, $|\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle$.', '$E(C) = h\\big(\\tfrac{1 + \\sqrt{1 - C^2}}2\\big)$.', '$C(\\rho) = \\max(0, \\lambda_1 - \\lambda_2 - \\lambda_3 - \\lambda_4)$; negativity sums $|\\lambda_j^-|$.'],
      trap: 'Computing $2|\\det A|$ for a mixed state: that formula is pure-state only; use Wootters instead.',
    },
  },
  'q12-multipartite': {
    points: [
      'Three qubits: product, one-plus-pair, or genuinely three-way.',
      'GHZ’s reduced pair is separable; W’s keeps $C = \\tfrac23$.',
      'Monogamy: a qubit cannot be strongly entangled with two partners at once.',
      'GHZ and W are different SLOCC families.',
    ],
    equations: 'C_{A:B}^2 + C_{A:C}^2 \\le C_{A:BC}^2;\\quad \\text{W: } \\tfrac89 = \\tfrac89',
    trap: '"More parties, more sharing": monogamy limits it; GHZ holds no pairwise entanglement at all.',
    claims: [claim('q12WpairConc', 'the review’s W-state pair has concurrence 0.667', () => close(V.q12WpairConc, 2 / 3, 1e-6))],
    formal: {
      points: ['GHZ reduced pair separable; $|W\\rangle$ reduced pair $C_{AB} = \\tfrac23$.', 'CKW: $C_{A:B}^2 + C_{A:C}^2\\le C_{A:BC}^2$, equality for W ($\\tfrac89$).', 'GHZ-class and W-class are inequivalent under SLOCC.'],
      trap: 'Assuming every genuinely tripartite state meets the CKW bound with equality: W does; most states satisfy it only as an inequality.',
    },
  },
}
