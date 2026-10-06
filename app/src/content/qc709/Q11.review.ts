/**
 * Chapter Q11 review cards: the exam layer in both tracks (P-Q11-story §6). Ground-up ≤ 25 words per sentence,
 * Formal ≤ 40; ≤ 5 points each. Every displayed number comes from Q11.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close } from './Q11.values'

export const Q11_REVIEW: Record<string, ReviewCard> = {
  'q11-bell-tools': {
    points: [
      'A local Pauli on one half of $\\Phi^+$ gives another Bell state.',
      '$I, Z, X, Y$ on Alice’s qubit reach all four Bell states.',
      'Each image is orthogonal, so a Bell reading tells them apart.',
      'Bob’s half stays $\\tfrac12I$ the whole time.',
    ],
    equations: '\\{I, Z, X, Y\\}\\otimes I\\,|\\Phi^+\\rangle = \\{\\Phi^+, \\Phi^-, \\Psi^+, \\Psi^-\\}',
    trap: 'Thinking the phase in $Y$’s image matters: it is global, invisible to a Bell measurement.',
    claims: [claim('q11CycleOrtho', 'the four Bell-cycle images are mutually orthogonal', () => close(V.q11CycleOrtho, 0, 1e-6))],
    formal: {
      points: [
        '$(P\\otimes I)\\Phi^+$ walks the Bell basis for $P \\in \\{I, Z, X, Y\\}$.',
        '$Z \\to \\Phi^-$, $X \\to \\Psi^+$, $Y \\to \\Psi^-$, each with fidelity 1.',
        'The four images are orthonormal, so one Bell measurement distinguishes which Pauli acted.',
      ],
      trap: 'Writing $iY$ for the fourth gate: the phase is global, so $Y$ alone suffices.',
    },
  },
  'q11-dense-coding': {
    points: [
      'A shared Bell pair — an ebit — is set up before any message.',
      'Alice’s one gate sends two bits by picking one of four Bell states.',
      'She sends one qubit; Bob, holding both, reads the Bell state.',
      'One qubit alone is $\\tfrac12I$, so an eavesdropper learns nothing.',
    ],
    equations: '\\Phi^+ \\xrightarrow{\\{I,Z,X,Y\\}}\\text{the Bell basis};\\quad 1\\text{ qubit} + 1\\text{ ebit} \\to 2\\text{ bits}',
    trap: 'Thinking the sent qubit holds the bits: alone it is $\\tfrac12I$; the bits live in the correlation.',
    claims: [claim('q11DCprob', 'every dense-coding readout is certain', () => close(V.q11DCprob, 1))],
    formal: {
      points: [
        'The four Pauli encodings give the four orthogonal Bell states.',
        'A Bell measurement resolves them with certainty, so one transmitted qubit carries two classical bits.',
        'The information lives in the joint state, not in either qubit alone.',
      ],
      trap: 'Treating the sent qubit as the carrier: its reduced state never depends on the encoded bits.',
    },
  },
  'q11-teleport-algebra': {
    points: [
      'Start with an unknown $|\\psi\\rangle$ and a shared Bell pair.',
      'Regroup: four equal parts, Bob’s qubit twisted by a Pauli in each.',
      'Alice reads 00, 01, 10 or 11, each a quarter of the time.',
      'Bob undoes the twist and holds $|\\psi\\rangle$ exactly.',
    ],
    equations: '|\\psi\\rangle_{A_1}|\\Phi^+\\rangle_{A_2B} = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle(\\sigma_{xy}|\\psi\\rangle)',
    trap: 'Thinking Alice must know $|\\psi\\rangle$: she never learns it, and the protocol needs her not to.',
    claims: [claim('q11TeleFid', 'the corrected state matches $|\\psi\\rangle$ exactly, fidelity 1', () => close(V.q11TeleFid, 1))],
    formal: {
      points: [
        '$|\\psi\\rangle_{A_1}|\\Phi^+\\rangle_{A_2B} = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle_{A_1A_2}(\\sigma_{xy}|\\psi\\rangle)_B$.',
        '$\\sigma_{xy} \\in \\{I, X, Z, XZ\\}$, one per Bell outcome.',
        'The correction gives fidelity 1 in every branch, never approximate.',
      ],
      trap: 'Measuring $|\\psi\\rangle$ to find it: the protocol never measures the unknown state itself.',
    },
  },
  'q11-teleport-circuit': {
    points: [
      'The circuit: CNOT, Hadamard, measure both, then switched $X$ and $Z$.',
      'The correction is $Z^{M_1}X^{M_2}$, the two bits as exponents.',
      'Before the call Bob’s qubit is $\\tfrac12I$: no signal arrived yet.',
      'Alice’s qubit collapses to a plain bit, so nothing is copied.',
    ],
    equations: 'Z^{M_1}X^{M_2},\\quad \\rho_B^{\\mathrm{pre}} = \\tfrac12I',
    trap: 'Thinking teleportation beats light speed: the classical bits, bounded by $c$, are indispensable.',
    claims: [claim('q11BobPre', 'Bob’s pre-correction state has $|\\mathbf r| = 0$, the centre', () => close(V.q11BobPre, 0, 1e-9))],
    formal: {
      points: [
        'The pre-measurement rotation is the Bell measurement of Chapter Q6, run as CNOT + H + readout.',
        '$\\rho_B^{\\mathrm{pre}} = \\tfrac12I$, independent of $|\\psi\\rangle$, averaged over Alice’s outcomes.',
        'Exactly one copy of $|\\psi\\rangle$ exists after the protocol, on Bob’s qubit: no-cloning holds.',
      ],
      trap: 'Forgetting the classical channel: it is what turns the twist into $|\\psi\\rangle$ itself.',
    },
  },
  'q11-swapping': {
    points: [
      'Two Bell pairs meet at Bob, who holds one qubit from each.',
      'His own Bell measurement links Alice and Charlie’s particles.',
      'They end up sharing his Bell state, though they never met.',
      'Repeaters chain swaps to carry entanglement past one fibre’s own reach.',
    ],
    equations: '|\\Phi^+\\rangle_{AB_1}|\\Phi^+\\rangle_{B_2C} = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle_{B_1B_2}|\\beta_{xy}\\rangle_{AC}',
    trap: 'Thinking A and C are usably entangled before Bob’s call: the pair is definite but unknown until then.',
    claims: [claim('q11SwapP', 'each of Bob’s four outcomes has probability a quarter', () => close(V.q11SwapP, 0.25))],
    formal: {
      points: [
        '$|\\Phi^+\\rangle_{AB_1}|\\Phi^+\\rangle_{B_2C} = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle_{B_1B_2}|\\beta_{xy}\\rangle_{AC}$.',
        'Each of Bob’s four outcomes carries probability $\\tfrac14$.',
        'The announcement is itself a classical channel, consistent with no-signalling.',
      ],
      trap: 'Treating the swap as instantaneous communication: A, C’s marginals stay $\\tfrac12I$ until Bob’s call.',
    },
  },
  'q11-qudit': {
    points: [
      'These tricks are not only for two-level qubits.',
      'A $d$-level qudit has its own full basis of entangled states.',
      'For $d = 2$ that basis is exactly the four Bell states, cross overlaps 0.00 exactly.',
      'Larger alphabets carry more bits per transmitted system.',
    ],
    equations: '|\\chi_{n,m}\\rangle = \\tfrac1{\\sqrt N}\\sum_je^{2\\pi ijn/N}|j\\rangle|j\\oplus m\\rangle',
    trap: 'Expecting $N$ generalized Bell states: there are $N^2$, one per $(n, m)$.',
    claims: [
      claim('q11WeylOrtho3', 'the nine generalized Bell states at $N = 3$ are orthonormal', () => close(V.q11WeylOrtho3, 0, 1e-9)),
      claim('q11WeylOrtho2', 'the four generalized Bell states at $N = 2$ are orthonormal', () => close(V.q11WeylOrtho2, 0, 1e-9)),
    ],
    formal: {
      points: [
        '$|\\chi_{n,m}\\rangle = \\tfrac1{\\sqrt N}\\sum_je^{2\\pi ijn/N}|j\\rangle|j\\oplus m\\rangle$, $N^2$ orthonormal states.',
        'For $N = 2$ this is exactly the ordinary Bell basis, cross overlaps 0.00 exactly.',
        'Dense coding and teleportation generalize to any $d$-level system.',
      ],
      trap: 'Reading $j\\oplus m$ as plain addition: it is addition mod $N$.',
    },
  },
}
