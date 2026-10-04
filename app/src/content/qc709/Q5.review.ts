/**
 * Chapter Q5 review cards: the exam layer in both tracks (P-Q5-story §6). Ground-up ≤ 25 words per sentence, Formal ≤
 * 40; ≤ 5 points each. Every number comes from Q5.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close } from './Q5.values'

const cHalf = claim('q5Half', 'exactly half of the four one-bit functions are balanced', () => close(V.q5Half, 0.5))

export const Q5_REVIEW: Record<string, ReviewCard> = {
  'q5-problem': {
    points: [
      'Four one-bit functions exist: two constant, two balanced ($\\tfrac12$ each).',
      'The whole question is one bit, f(0) ⊕ f(1).',
      'A classical computer must look at f twice, in the worst case.',
    ],
    equations: 'f\\ \\text{constant} \\Leftrightarrow f(0) \\oplus f(1) = 0',
    trap: 'Deciding from one value: always 1 and copy both give f(1) = 1.',
    claims: [cHalf],
    formal: {
      points: [
        "Deutsch's problem: decide constant vs. balanced with oracle access to f alone.",
        'Exactly $\\tfrac12$ of the four one-bit functions are balanced (Bergou ⚑ Problem 1.3(a)).',
        'Each value of f(0) fits one constant and one balanced f, so classically two queries are needed.',
      ],
      trap: 'Reading f(0) alone as deciding the problem: it never does.',
    },
  },
  'q5-oracle': {
    points: [
      'U_f adds f(x) to y by XOR, and it undoes itself.',
      'Any classical f can be made reversible with Toffoli gates.',
      'With y = |−⟩, the oracle leaves y alone and multiplies x by (−1)^{f(x)}.',
      'On the input qubit alone, f then acts as a sign gate, O_f.',
    ],
    equations: 'U_f|x\\rangle|y\\rangle = |x\\rangle|y \\oplus f(x)\\rangle,\\quad U_f|x\\rangle|-\\rangle = (-1)^{f(x)}|x\\rangle|-\\rangle',
    trap: 'Thinking the target changes under the kickback: |−⟩ stays |−⟩ every time.',
    formal: {
      points: [
        'U_f is a permutation matrix on the register, hence unitary.',
        'With the target |−⟩, U_f acts as O_f = diag((−1)^{f(0)}, (−1)^{f(1)}) on x alone.',
        'A Toffoli gate makes any classical circuit reversible, with ancillas (N&C §1.4.1).',
      ],
      trap: 'Thinking the target changes under the kickback: X|−⟩ = −|−⟩, the same ray.',
    },
  },
  'q5-one-value': {
    points: [
      'A superposed query holds f(0) and f(1) in one state at once.',
      'A reading still returns only one pair (x, f(x)).',
      'H on each of n qubits spreads a register over all 2ⁿ inputs.',
    ],
    equations: 'U_f\\,\\tfrac1{\\sqrt2}(|0\\rangle+|1\\rangle)|0\\rangle = \\tfrac1{\\sqrt2}\\big(|0,f(0)\\rangle+|1,f(1)\\rangle\\big)',
    trap: 'Thinking parallelism reads out every value of f: one reading still gives one.',
    formal: {
      points: [
        "eq. 1.16 is N&C's eq. 1.37: a query on |+⟩|0⟩ gives (|0,f(0)⟩+|1,f(1)⟩)/√2.",
        'A computational-basis reading yields one pair (x, f(x)), with x uniform.',
        'Coherent branches differ from a classical random choice: they can still interfere.',
      ],
      trap: 'Treating the parallel query as a classical random pick: the branches stay coherent, not exclusive.',
    },
  },
  'q5-deutsch': {
    points: [
      'Start from |0⟩|−⟩; put H, then U_f, then H on the top qubit.',
      "The kickback writes (−1)^{f(x)} onto each of the top qubit's two branches.",
      'The last H makes those branches interfere.',
      'Constant f reads 0 and balanced f reads 1, from one query.',
    ],
    equations: '|\\psi_3\\rangle = \\pm|f(0) \\oplus f(1)\\rangle|-\\rangle',
    trap: 'Reading the ± sign as information about f(0): it is an overall factor, invisible to any reading.',
    formal: {
      points: [
        'eqs. 1.10–1.15 give the state at each of Deutsch’s four steps.',
        'The final state is ±|f(0) ⊕ f(1)⟩|−⟩ (N&C eq. 1.45), the ± a global phase.',
        'Only the one bit f(0) ⊕ f(1) is learned; nothing else about f is.',
      ],
      trap: 'Reading the ± as information about f(0): it is unmeasurable on its own.',
    },
  },
  'q5-interferometer': {
    points: [
      'A beam splitter puts one photon into two arms at once.',
      "The output chances depend only on the two arms' phase difference.",
      'Phases of 0 or 180° stand for f: equal phases send the photon out port 1.',
      'Reading which arm the photon took destroys the effect.',
    ],
    equations: 'P_1 = \\cos^2\\tfrac{\\varphi_1-\\varphi_0}2',
    trap: 'Applying the splitter rule twice with the same arm labels: with Fig. 1.7’s mirrors it sends equal phases the other way.',
    formal: {
      points: [
        'eqs. 1.17–1.18, read with Fig. 1.7’s mirrors (see the corrections box).',
        'R_y(−90°)ΦR_y(90°) = Z(HΦH)Z: the same port chances as Deutsch’s circuit.',
        'P(output 1) = cos²((φ₁ − φ₀)/2).',
      ],
      trap: 'Applying eq. 1.17 at both splitters with the same labels: Fig. 1.7’s mirrors invert it instead.',
    },
  },
  'q5-other-models': {
    points: [
      'Adiabatic computing changes an energy operator slowly and stays in the lowest state.',
      'The smallest gap over the whole change sets how slowly to go.',
      'Measurement-based computing applies a gate by a CZ and a reading in |±θ⟩.',
      'A random outcome leaves a known Pauli gate, fixed by relabelling.',
    ],
    equations: '\\mathcal H(s) = (1-s)\\mathcal H_0 + s\\mathcal H_1,\\quad W(\\theta) = HP(\\theta)',
    trap: 'Thinking a random measurement result spoils the computation: it only leaves a known byproduct.',
    formal: {
      points: [
        'ℋ(s) = (1 − s)ℋ₀ + sℋ₁, under iħ d|ψ⟩/dt = ℋ(t)|ψ⟩ (eq. 1.19).',
        'CZ|ψ⟩|+⟩ = (|+θ⟩W(θ)|ψ⟩ + |−θ⟩XW(θ)|ψ⟩)/√2 (eq. 1.21).',
        'W(θ)X = e^{iθ}ZW(−θ): Bergou’s identity holds up to a global phase.',
      ],
      trap: 'Treating the byproduct as a failure: it is a known, correctable Pauli gate.',
    },
  },
}
