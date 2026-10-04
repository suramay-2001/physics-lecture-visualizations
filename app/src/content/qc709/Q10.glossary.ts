/**
 * Chapter Q10 glossary (Physics 709; P-Q10-story §5), merged into the lazy course pack by file name (pack.ts). Every
 * entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased. Ids start
 * `qc-` (the "gloss at first use" lint, content/symbols.test.ts). `introduces` marks the notation beats (interface
 * change W-709 #12): each such entry is introduced by exactly one beat of this chapter (content.test.tsx).
 *
 * Reused without a new entry here: qc-mixture (Q1), qc-pauli-string, qc-correlation-grid, qc-entangled,
 * qc-product-state, qc-factoring-test, qc-bell-basis, qc-singlet (Q6), qc-ghz, qc-local-realism, qc-hidden-values,
 * qc-mermin-argument (Q7), qc-density-matrix, qc-ensemble, qc-maximally-mixed, qc-selective-measurement (Q8/Q3),
 * qc-pauli-matrices, qc-commutator, qc-expectation (Q3).
 *
 * Q9 ("parts of a whole": the reduced density matrix, the partial trace) is not built yet on this branch, so the
 * ownership ruling for an unbuilt chapter applies (qc709-Q6Q7.md ruling 8, "define in place"): Q10 names "the
 * reduced state" and "Chapter Q9" in words wherever it would otherwise link `[[qc-reduced-density-matrix]]`, rather
 * than adding a gloss entry that claims a concept Q9 will own.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-separable-state',
    term: 'separable state',
    gloss: 'A state a coin could make: Alice and Bob each prepare their own qubit, and chance alone picks which pair.',
    formal: 'A density matrix $\\rho_{AB} = \\sum_kp_k\\,\\rho_A^k\\otimes\\rho_B^k$, $p_k \\ge 0$, $\\sum_kp_k = 1$ (Bergou Eq. 3.2); built by local operations and classical communication (LOCC), never entanglement.',
    first: 'q10-separable:b1',
    introduces: 'notation',
    bridge: 'qc-l6-mixture',
  },
  {
    id: 'qc-maximally-entangled',
    term: 'maximally entangled',
    gloss: 'An entangled pair whose each half, alone, is the most mixed it can be: the centre of its own ball.',
    formal: 'An entangled state with $\\rho_A = \\rho_B = \\tfrac12I$ (Bergou p. 32); every Bell state is maximally entangled.',
    first: 'q10-separable:b2',
  },
  {
    id: 'qc-ppt',
    term: 'PPT criterion',
    gloss: 'A quick test: flip the direction of one party’s part only. A negative chance afterwards means entangled.',
    formal: 'The Peres criterion: a separable state stays positive under the partial transpose, $\\rho^{T_B} \\ge 0$; for two qubits this is also sufficient (Bergou §3.5 p. 41).',
    first: 'q10-separable:b3',
  },
  {
    id: 'qc-no-signalling',
    term: 'no signalling',
    gloss: 'A measurement Alice makes on her half cannot change what Bob sees, however she chooses to measure.',
    formal: 'The reduced state $\\rho_B = \\mathrm{Tr}_A\\rho$ is unchanged by any local operation on A; shared entanglement alone carries no faster-than-light message.',
    first: 'q10-no-signal:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-lhv-model',
    term: 'local hidden-variable model',
    gloss: 'The idea that each particle carries answers to every possible reading, fixed in advance with some set chances.',
    formal: 'A model assigning definite values $a_1, a_2, b_1, b_2 = \\pm1$ from a joint distribution $P(a_1, a_2, b_1, b_2)$, local in the sense that Alice’s values do not depend on Bob’s choice (Bergou §3.3; N&C §2.6).',
    first: 'q10-hidden:b1',
    introduces: 'notation',
    bridge: 'qc-l1-logic',
  },
  {
    id: 'qc-correlator',
    term: 'correlator',
    gloss: 'The average, over many runs, of the product of two $\\pm1$ readings: $+1$ if they always agree, $-1$ if they always disagree.',
    formal: 'For $\\pm1$-valued readings, $\\langle ab\\rangle = \\sum_{a,b}ab\\,P(a, b)$ classically, or $\\langle a\\otimes b\\rangle = \\mathrm{Tr}(\\rho\\,a\\otimes b)$ for a quantum state — the correlation-grid entries of Chapter Q6, and the classical correlator a later Foundations chapter will name again.',
    first: 'q10-chsh:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-chsh',
    term: 'CHSH value',
    gloss: 'A score built from four correlators in a set pattern; no classical story can push it past 2.',
    formal: 'The quantity $S = \\langle a_1b_1\\rangle + \\langle a_1b_2\\rangle + \\langle a_2b_1\\rangle - \\langle a_2b_2\\rangle$ (Clauser–Horne–Shimony–Holt); the Bell inequality $|S| \\le 2$ bounds every local hidden-variable model (Bergou Eq. 3.10).',
    first: 'q10-chsh:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-tsirelson',
    term: 'Tsirelson bound',
    gloss: 'The ceiling quantum mechanics itself obeys: $2\\sqrt2$, well below the largest conceivable score of 4.',
    formal: 'The bound $\\|C\\| \\le 2\\sqrt2$ on the CHSH operator $C = a_1b_1 + a_1b_2 + a_2b_1 - a_2b_2$, from $C^2 = 4I + [a_1,a_2]\\otimes[b_1,b_2] \\le 8I$ (Bergou Eq. 3.17, erratum-corrected).',
    first: 'q10-violation:b4',
  },
  {
    id: 'qc-pr-box',
    term: 'PR box',
    gloss: 'A hypothetical link that scores the full 4 and still sends no signal — nature has never produced one.',
    formal: 'A Popescu–Rohrlich box: a no-signalling correlation reaching the algebraic maximum $S = 4$, strictly above the quantum Tsirelson bound (Bergou p. 36).',
    first: 'q10-violation:b6',
  },
]
