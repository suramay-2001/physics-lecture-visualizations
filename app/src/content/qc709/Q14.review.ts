/**
 * Chapter Q14 review cards: the exam layer in both tracks (P-Q14-story §6). Ground-up ≤ 25 words per sentence,
 * Formal ≤ 40; ≤ 5 points each. Every displayed number comes from Q14.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close } from './Q14.values'

export const Q14_REVIEW: Record<string, ReviewCard> = {
  'q14-pointer': {
    points: [
      'A measurement couples the system to a meter, then reads the meter.',
      'A sharp meter gives the usual projective outcomes.',
      'A blurry meter gives soft outcomes $E_\\pm = \\tfrac12(I \\pm \\eta Z)$.',
      'The chance is $\\mathrm{Tr}(E_\\pm\\rho)$, the Born rule made general.',
    ],
    equations: 'p_\\pm = \\mathrm{Tr}(E_\\pm\\rho),\\quad E_\\pm = \\tfrac12(I \\pm \\eta Z)',
    trap: 'Thinking every measurement must be sharp — a meter can be blurred, giving positive outcomes that are not projectors.',
    claims: [claim('q14UnsharpP0Plus', 'the soft meter at $\\eta=\\tfrac12$ reads up with chance $0.75$ on $|0\\rangle$', () => close(V.q14UnsharpP0Plus, 0.75))],
    formal: {
      points: ['$H \\supset \\hbar gXP$, $U = e^{-igtXP}$: the pointer shifts by $gt\\lambda_j$.', '$E_\\pm = \\tfrac12(I \\pm \\eta Z)$, $p_\\pm = \\mathrm{Tr}(E_\\pm\\rho)$.', 'On $|0\\rangle$ at $\\eta = \\tfrac12$: $(0.75, 0.25)$.'],
      trap: 'Expecting a displayed number from the pointer-shift formula itself: every number here comes from $\\mathrm{Tr}(E_\\pm\\rho)$, not from $x_j = gt\\lambda_j$.',
    },
  },
  'q14-povm': {
    points: [
      'Drop orthogonality; keep positive operators summing to $I$.',
      'A POVM is $E_i \\ge 0$ with $\\sum_i E_i = I$.',
      'Outcome $i$ has chance $\\mathrm{Tr}(E_i\\rho)$.',
      'The trine gives three outcomes on a qubit.',
    ],
    equations: '\\sum_i E_i = I,\\quad E_i \\ge 0,\\quad p_i = \\mathrm{Tr}(E_i\\rho)',
    trap: 'Thinking a qubit allows at most two outcomes — that is projective; a POVM can have any number.',
    claims: [claim('q14TrineCorrect', 'the trine reads its own state correctly with chance $0.667$', () => close(V.q14TrineCorrect, 2 / 3, 1e-9))],
    formal: {
      points: ['$\\sum_i E_i = I$, $E_i = A_i^\\dagger A_i$, $A_i = U_i\\sqrt{E_i}$ (polar).', '$p_i = \\mathrm{Tr}(E_i\\rho)$.', 'Trine $E_j = \\tfrac23|\\psi_j\\rangle\\langle\\psi_j|$, $p_{\\text{correct}} = \\tfrac23$, $p_{\\text{error}} = \\tfrac16$.'],
      trap: 'Drawing a POVM element as if its coefficient were exact ($\\tfrac23$, here): the direction is exact, the scale is a stated number, not a drawn one.',
    },
  },
  'q14-neumark': {
    points: [
      'A POVM is a real measurement, not just arithmetic.',
      'Add an ancilla, couple, measure it sharply.',
      'The isometry $V = \\sum_m A_m\\otimes|m\\rangle$ has $V^\\dagger V = I$.',
      'So it extends to a unitary; the trine needs a qutrit ancilla.',
    ],
    equations: 'V^\\dagger V = \\sum_m A_m^\\dagger A_m = I',
    trap: 'Thinking the POVM and its dilation give different chances — they agree by construction (that is the theorem).',
    claims: [claim('q14NeumarkAncillaDim', 'the trine’s dilation needs a three-level ancilla', () => close(V.q14NeumarkAncillaDim, 3))],
    formal: {
      points: ['$A_m|\\psi\\rangle = \\langle m|U_{AB}(|\\psi\\rangle|\\psi_B\\rangle)$, $\\sum_m A_m^\\dagger A_m = I$.', '$V^\\dagger V = I \\Rightarrow$ extends to $U_{AB}$.', 'The dilated sharp measurement reproduces $\\mathrm{Tr}(E_j\\rho)$ exactly.'],
      trap: 'Expecting the dilating ancilla to have a fixed size: a qubit meter and a qutrit trine ancilla are both valid, sized by the POVM’s own outcome count.',
    },
  },
  'q14-usd': {
    points: [
      'Non-orthogonal states cannot be sorted with no mistakes.',
      'Perfect sorting would force $\\langle\\psi_1|\\psi_2\\rangle = 0$.',
      "Add a don't-know outcome $E_0$.",
      'Success $1 - |\\langle\\psi_1|\\psi_2\\rangle|$ at even odds.',
    ],
    equations: 'E_1 + E_2 + E_0 = I;\\quad P_{\\mathrm{succ}} = 1 - |\\langle\\psi_1|\\psi_2\\rangle|',
    trap: 'Thinking the inconclusive outcome is an error — it is a refusal to answer, never a wrong answer.',
    claims: [claim('q14UsdSucc', 'Bob’s success rate for $|0\\rangle, |+\\rangle$ is $0.293$', () => close(V.q14UsdSucc, 1 - Math.SQRT1_2, 1e-9))],
    formal: {
      points: ['$E_1|\\psi_2\\rangle = E_2|\\psi_1\\rangle = 0$, $E_1 + E_2 + E_0 = I$.', 'Perfect USD $\\Rightarrow$ orthogonality.', 'Equal-prior success $1 - |\\langle\\psi_1|\\psi_2\\rangle| = 0.293$ for $|0\\rangle, |+\\rangle$.'],
      trap: 'Forgetting USD needs non-orthogonal pure states at a KNOWN pair: it never applies to an unknown single copy of an unknown state.',
    },
  },
  'q14-min-error': {
    points: [
      'You must answer every time, so errors are unavoidable.',
      'Form $\\Gamma = \\eta_2\\rho_2 - \\eta_1\\rho_1$ and guess by its sign.',
      'The least error is the Helstrom bound.',
      'For $|0\\rangle, |+\\rangle$: wrong $0.146$.',
    ],
    equations: 'P_E = \\tfrac12(1 - \\lVert\\eta_2\\rho_2 - \\eta_1\\rho_1\\rVert_1)',
    trap: 'Thinking a measurement always helps — if $\\Gamma$ has no negative eigenvalue, always guessing the likelier state is optimal.',
    claims: [claim('q14HelstromErr', 'the minimum error for $|0\\rangle, |+\\rangle$ is $0.146$', () => close(V.q14HelstromErr, 0.5 * (1 - Math.SQRT1_2), 1e-9))],
    formal: {
      points: ['$E_1 + E_2 = I$; minimise $P_{\\mathrm{err}} = \\eta_1\\mathrm{Tr}(\\rho_1E_2) + \\eta_2\\mathrm{Tr}(\\rho_2E_1)$.', 'Pure form $\\tfrac12(1 - \\sqrt{1 - 4\\eta_1\\eta_2|\\langle\\psi_1|\\psi_2\\rangle|^2})$.', 'If $\\Gamma$ has one sign, guess always.'],
      trap: 'Confusing $\\Gamma$’s eigenVECTORS with the optimal states to guess: the sign of the eigenVALUE decides which state to name, not the eigenvector’s own direction.',
    },
  },
  'q14-compare': {
    points: [
      'Unambiguous never errs but often fails; minimum-error always answers but sometimes errs.',
      'Minimum-error succeeds more often per trial.',
      'The overlap prices both.',
      'The error is at most half the inconclusive rate.',
    ],
    equations: 'P_E \\le \\tfrac12 Q_{\\mathrm{opt}}',
    trap: 'Thinking one strategy is simply "better" — they optimise different things (never-wrong vs fewest-wrong).',
    claims: [claim('q14HelstromSucc', 'minimum-error’s success, $0.854$, beats unambiguous’s, $0.293$', () => close(V.q14HelstromSucc, 0.5 * (1 + Math.SQRT1_2), 1e-9))],
    formal: {
      points: ['Minimum-error success $\\tfrac12(1 + \\sqrt{1 - c^2}) \\ge$ unambiguous success $1 - c$.', 'Equal only at $c = 0$ (orthogonal).', '$P_E \\le \\tfrac12 Q_{\\mathrm{opt}}$ (Eq. 5.61).'],
      trap: 'Expecting the two curves to cross: minimum-error dominates throughout $(0,1)$, meeting USD only at the endpoint $c=0$.',
    },
  },
}
