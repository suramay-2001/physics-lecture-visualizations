/**
 * Chapter Q13 review cards: the exam layer in both tracks (P-Q13-story §6). Ground-up ≤ 25 words per sentence,
 * Formal ≤ 40; ≤ 5 points each. Every displayed number comes from Q13.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close } from './Q13.values'

export const Q13_REVIEW: Record<string, ReviewCard> = {
  'q13-from-unitary': {
    points: [
      'Open evolution: couple to an environment, evolve, then forget it.',
      '$\\mathcal E(\\rho) = \\sum_m A_m\\rho A_m^\\dagger$: a weighted spread, one term per outcome.',
      'Each $A_m$ reads one environment outcome.',
      '$\\sum_m A_m^\\dagger A_m = I$ keeps the chances adding to one.',
    ],
    equations: '\\mathcal E(\\rho) = \\sum_m A_m\\rho A_m^\\dagger,\\quad \\sum_m A_m^\\dagger A_m = I',
    trap: 'Thinking open evolution must be unitary: tracing out an entangled environment makes it non-unitary.',
    claims: [claim('q13DepolSumGap', 'the depolarizing completeness relation holds exactly', () => close(V.q13DepolSumGap, 0, 1e-9))],
    formal: {
      points: [
        '$\\mathcal E(\\rho) = \\mathrm{Tr}_E[U_{SE}(\\rho\\otimes|0\\rangle\\langle0|)U_{SE}^\\dagger] = \\sum_m A_m\\rho A_m^\\dagger$.',
        '$A_m = \\langle m|U_{SE}|0\\rangle_E$.',
        '$\\sum_m A_m^\\dagger A_m = I \\Leftrightarrow$ trace-preserving.',
      ],
      trap: 'Writing the completeness relation only for the worked dephasing instance: it holds for every channel, including depolarizing.',
    },
  },
  'q13-properties': {
    points: [
      'A channel keeps Hermitian matrices Hermitian, keeps $\\mathrm{Tr} = 1$, keeps positivity.',
      'Positivity alone is too weak.',
      'Complete positivity: positive even acting on half of an entangled pair.',
      'The plain transpose fails this test.',
    ],
    equations: '\\text{spec}\\big((T\\otimes I)|\\Phi^+\\rangle\\langle\\Phi^+|\\big) = \\{\\tfrac12,\\tfrac12,\\tfrac12,-\\tfrac12\\}',
    trap: '"Positive is enough": the transpose is positive yet not a channel.',
    claims: [claim('q13TransposeSpecMin', "the transpose's Choi matrix has a negative eigenvalue, $-\\tfrac12$", () => close(V.q13TransposeSpecMin, -0.5, 1e-9))],
    formal: {
      points: [
        '$\\mathcal E$ is Hermiticity-, trace- and positivity-preserving.',
        'Complete positivity: $\\mathcal E\\otimes I_B \\ge 0$ for an ancilla $B$ of any size.',
        '$(T\\otimes I)\\Phi^+$ has eigenvalue $-\\tfrac12$, so $T$ is not completely positive.',
      ],
      trap: 'Confusing the Choi matrix with the state it is built from: it is $(\\mathcal E\\otimes I)|\\Phi^+\\rangle\\langle\\Phi^+|$, not $\\rho_{\\Phi^+}$ itself.',
    },
  },
  'q13-stinespring': {
    points: [
      'Every channel is a unitary on qubit + environment, environment forgotten.',
      'The isometry $V = \\sum_m A_m\\otimes|m\\rangle$ has $V^\\dagger V = I$.',
      'Worked for dephasing: each of its two terms squares to $\\tfrac12I$, and the two add to $I$.',
      'A qubit channel needs at most four Kraus operators.',
    ],
    equations: 'V^\\dagger V = \\sum_m A_m^\\dagger A_m = I;\\quad D_\\nu = \\sum_\\mu U_{\\nu\\mu}A_\\mu',
    trap: 'Thinking the environment is unique: any unitary-related Kraus set gives the same channel.',
    claims: [claim('q13MaxKraus2', 'a one-qubit channel needs at most four Kraus operators', () => close(V.q13MaxKraus2, 4))],
    formal: {
      points: [
        '$A_m|\\psi\\rangle = \\langle m|U_{SE}(|\\psi\\rangle|0\\rangle)$.',
        'Kraus freedom $D_\\nu = \\sum_\\mu U_{\\nu\\mu}A_\\mu$.',
        'Dephasing: $\\tfrac12(I^\\dagger I) + \\tfrac12(Z^\\dagger Z) = I$; at most $N^2 = 4$ operators for a qubit.',
      ],
      trap: 'Expecting the dilating environment to be the SAME size for every channel: amplitude damping needs only one qubit of environment, depolarizing needs two.',
    },
  },
  'q13-depolarizing': {
    points: [
      'With chance $p$ the qubit is scrambled to the centre.',
      'The whole ball shrinks by one common factor, $1 - \\tfrac{4p}3$.',
      'At $p = 0.75$ the ball is a single point.',
      'Other channels make off-centre eggs, not smaller balls.',
    ],
    equations: '\\mathbf r \\to (1 - \\tfrac{4p}3)\\mathbf r',
    trap: 'Reading $p = 1$ as fully mixed: the factor is $-\\tfrac13$ there; full mixing is at $p = 0.75$.',
    claims: [
      claim('q13DepolFactorP75', 'the ball collapses to the centre at $p=0.75$', () => close(V.q13DepolFactorP75, 0, 1e-9)),
      claim('q13DepolFactorP100', 'at $p=1$ the factor is $-\\tfrac13$, not $0$', () => close(V.q13DepolFactorP100, -1 / 3, 1e-9)),
    ],
    formal: {
      points: [
        '$\\mathcal E(\\rho) = (1-p)\\rho + \\tfrac p3(X\\rho X + Y\\rho Y + Z\\rho Z)$.',
        '$\\mathbf r \\to (1 - \\tfrac{4p}3)\\mathbf r$.',
        'A general channel is an affine map $\\mathbf r \\to M\\mathbf r + \\mathbf c$; depolarizing has $\\mathbf c = 0$.',
      ],
      trap: "Amplitude damping's shifted centre ($\\mathbf c \\ne 0$) is sometimes mistaken for a drawing error: it is the engine's own affine map.",
    },
  },
  'q13-no-cloning': {
    points: [
      'A copier would map $|\\psi\\rangle|0\\rangle$ to $|\\psi\\rangle|\\psi\\rangle$.',
      'A CNOT copies the basis but entangles a superposition.',
      '$U|+\\rangle|0\\rangle$ is a Bell pair, not two copies.',
      'Only mutually orthogonal states are clonable.',
    ],
    equations: 'U|+\\rangle|0\\rangle = \\Phi^+ \\ne |+\\rangle|+\\rangle;\\quad \\langle\\psi|\\varphi\\rangle = \\langle\\psi|\\varphi\\rangle^2',
    trap: '"The CNOT is a copier": it copies only computational-basis states, never an unknown superposition.',
    claims: [claim('q13CloneSupFid', 'CNOT on a superposition gives an entangled pair, not two copies', () => close(V.q13CloneSupFid, 1))],
    formal: {
      points: [
        'By linearity $U|+\\rangle|0\\rangle = \\Phi^+$.',
        'Cloning forces $\\langle\\psi|\\varphi\\rangle = \\langle\\psi|\\varphi\\rangle^2$.',
        'So the states must be equal or orthogonal; an unknown qubit is uncopyable.',
      ],
      trap: 'Thinking the no-cloning proof needs the full depolarizing machinery: it follows from linearity alone.',
    },
  },
  'q13-herbert': {
    points: [
      'Cloning would allow faster-than-light signalling.',
      "Alice's basis choice is her message.",
      "Bob's qubit is the centre whatever she does.",
      'A cloner would let him read it — so it is forbidden.',
    ],
    equations: '\\rho_B = \\mathrm{Tr}_A(\\rho) = \\tfrac12I \\text{ (both bases)}',
    trap: 'Separating no-cloning from no-signalling: they are two faces of one wall.',
    claims: [claim('q13HerbertRbZLen', "Bob's reduced state has $|\\mathbf r| = 0$ for either Alice basis", () => close(V.q13HerbertRbZLen, 0, 1e-9))],
    formal: {
      points: [
        '$\\rho_B = \\tfrac12I$ for either Alice basis (no-signalling).',
        'A cloner would extract Alice\'s basis from many copies.',
        'No-cloning is the dynamical guarantee of no-signalling.',
      ],
      trap: "Thinking Herbert's scheme fails only for a technical reason: it fails because no-cloning and no-signalling are logically tied together.",
    },
  },
}
