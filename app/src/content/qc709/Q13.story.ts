/**
 * Chapter Q13 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q13-story.md §1, in both
 * tracks, following the rulings of docs/roles/decisions/qc709-Q10Q13.md and qc709-remap.md.
 *
 * Build notes against the plan (reported to the orchestrator; see Q13.values.ts's header for the engine/stage
 * reasoning):
 * - The plan's single running circuit `C_DEPOL` (a 2-environment-qubit dilation of the full depolarizing channel,
 *   drawn as a `unitary` op) is replaced by `C_DEPH`: one CNOT dilating the simpler DEPHASING channel at p = ½
 *   exactly (a standard textbook realization, N&C §8.3.3), reusing only named gates the `circuit` kind already
 *   simulates. The depolarizing channel stays the chapter's running example in PROSE and in the Bloch-ball unit
 *   (13.4); the circuit/matrix derivations (13.1, 13.3) use the dephasing instance as a concrete, exactly-drawable
 *   worked case of the SAME completeness relation.
 * - The plan's `mx('krausList'/'krausSumAA'/'isometryVdagV', …)` shorthand assumed a new `matrix` source for a
 *   channel's Kraus operators (plan §9.2 Q2); it was not built (no stage-kind change was made here — `stage/**`
 *   is off limits for this build). Every matrix view below is built from EXISTING `matrix` v2 sources only
 *   (`lin`/`product`/`adjoint`/`pauli`/`outer`), exact wherever used: dephasing(½) and amplitude damping(½) both
 *   have Kraus coefficients of exactly 1/√2, inside `MATRIX_COEF_EXACT`.
 * - The plan's `ballE(channel, {at})` (a new `bloch-ball` `ellipsoid` field, plan §9.2 Q3) was not built either. Every
 *   depolarizing/amplitude-damping picture below uses the EXISTING `BallPoint` `{r: [...]}` (an explicit Bloch
 *   vector), computed by applying the channel to a specific input and reading its image off with `reducedBloch` —
 *   already a snapshot per p, not a swept ellipsoid, but still an engine-exact picture with no stage change.
 * - The plan's `plot('depolRadius', …)` curve was not built (the merged `plot` kind only has `chshVsPhase` and
 *   `chshClassicalBound`, P-Q10-story's own names). Dropped; `q13-depolarizing`'s two kinds are `bloch-ball` and
 *   `matrix` only (the view-count lint only requires ≥ 2 DISTINCT views per track, not a particular kind).
 * - Several of the plan's own `split(...)` beat stages paired the SAME kind on both panes (`matrix` + `matrix` in
 *   `q13-properties:b3`; `bloch-ball` + `bloch-ball` in `q13-depolarizing:b3`; `amplitudes` + `amplitudes` in
 *   `q13-no-cloning:b2`; `two-qubit` + `two-qubit` in `q13-herbert:b2`'s first draft) — `stage/resolve.ts`
 *   `validateLayout` rejects a layout that repeats a kind. Every split below pairs two DIFFERENT kinds; the second
 *   picture a repeat-kind beat wanted instead appears as a single view, or inside that beat's own derivation (a
 *   `DerivStep.view` is not a layout, so two same-kind steps are fine there).
 *
 * Standing rules kept here: every derivation (both tracks) carries `view` on at least two steps, from kinds already
 * shown elsewhere in the SAME unit (W-709 #7/#11); exactly one notation beat per new space/notation (W-709 #8/#12);
 * no TeX command outside `$…$`; every number comes from Q13.values.ts (an engine call), never a typed literal;
 * cross-chapter references (Q8, Q9, Q10, Q12) are named in WORDS, never `[[gloss]]` links to chapters not yet built
 * in this worktree (Q10, Q12 build in parallel) nor plan ids.
 */
import type { AmpSource, AmplitudesState, BallPoint, BallState, Beat, CircuitStageState, MatrixCoef, MatrixGateName, MatrixGridState, MatrixSource, Scrub, StageLayout, StageState, TwoQubitState } from '../schema'
import type { Circuit } from '../../physics/qc/circuit'
import { C_CLONE, C_DEPH, MX_RHO, MZ_RHO, V, claim, close } from './Q13.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan §0 "Stage shorthand"), as plain builder functions                          */
/* ---------------------------------------------------------------------------------------------- */
const amp = (state: AmpSource, extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => ({ kind: 'amplitudes', state, shot: 'A-BARS', ...extra })
const circ = (circuit: Circuit, upTo?: Scrub, extra: Partial<Omit<CircuitStageState, 'kind' | 'circuit' | 'upTo'>> = {}): CircuitStageState => ({
  kind: 'circuit',
  circuit,
  shot: 'Q-WIRES',
  ...(upTo !== undefined ? { upTo } : {}),
  ...extra,
})
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({
  kind: 'matrix',
  source,
  labels: 'kets',
  values: 'exact',
  shot: 'M-GRID',
  ...extra,
})
const tq = (ketSource: AmpSource, extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'labels' | 'arrows' | 'grid'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { ket: ketSource },
  labels: 'A-B',
  arrows: 'reduced',
  grid: 'T',
  shot: 'TQ-PAIR',
  ...extra,
})
/** A two-qubit view of a MIXTURE (Herbert's non-selective readings), not a pure ket. */
const tqRho = (mixture: { w: Scrub; ket: AmpSource }[], extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'labels' | 'arrows' | 'grid'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { rho: { mixture } },
  labels: 'A-B',
  arrows: 'reduced',
  grid: 'none',
  shot: 'TQ-PAIR',
  ...extra,
})
const ball = (point: BallPoint, extra: Partial<Omit<BallState, 'kind' | 'point'>> = {}): BallState => ({ kind: 'bloch-ball', point, purity: true, shot: 'B-STD', ...extra })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

const out = (k: AmpSource): MatrixSource => ({ outer: [k] })
const lin = (terms: { c: MatrixCoef; src: MatrixSource }[]): MatrixSource => ({ lin: terms })
void (null as unknown as MatrixGateName) // (no named-gate matrices used this chapter; kept for parity with Q11's shorthand)

/* ---------------------------------------------------------------------------------------------- */
/* Running matrix sources (exact: dephasing(½) and amplitude damping(½) both have 1/√2 coefficients) */
/* ---------------------------------------------------------------------------------------------- */
/** One Kraus operator of dephasing(½): $A_1 = \tfrac1{\sqrt2}Z$. */
const DEPH_K1: MatrixSource = lin([{ c: '+1/sqrt2', src: { pauli: 'Z' } }])
/** $\sum_m A_m^\dagger A_m$ for dephasing(½): $\tfrac12(I^\dagger I) + \tfrac12(Z^\dagger Z) = I$. */
const DEPH_SUM: MatrixSource = lin([
  { c: '+1/2', src: { product: [{ adjoint: { pauli: 'I' } }, { pauli: 'I' }] } },
  { c: '+1/2', src: { product: [{ adjoint: { pauli: 'Z' } }, { pauli: 'Z' }] } },
])
/** $\sigma_x\sigma_z\sigma_x = -\sigma_z$: the Pauli-conjugation fact behind the depolarizing shrink (D4). */
const XZX: MatrixSource = { product: [{ pauli: 'X' }, { pauli: 'Z' }, { pauli: 'X' }] }
/** The decay operator of amplitude damping(½): $A_1 = \tfrac1{\sqrt2}|0\rangle\langle1|$. */
const AMPDAMP_K1: MatrixSource = lin([{ c: '+1/sqrt2', src: out({ ket: '0' } as AmpSource) }])
// (AMPDAMP_K1's |0⟩⟨1| needs a two-ket outer; built directly below instead of through `out`, which defaults φ = ψ.)
const AMPDAMP_DECAY: MatrixSource = { lin: [{ c: '+1/sqrt2', src: { outer: [{ ket: '0' }, { ket: '1' }] } }] }
void AMPDAMP_K1

/** Bob's non-selective readings of Φ+ (q13-herbert), as mixtures for `two-qubit`/`matrix` rho sources. */
const MZ_PARTS: { w: Scrub; ket: AmpSource }[] = [{ w: 0.5, ket: { ket: '00' } }, { w: 0.5, ket: { ket: '11' } }]
const MX_PARTS: { w: Scrub; ket: AmpSource }[] = [{ w: 0.5, ket: { ket: '++' } }, { w: 0.5, ket: { ket: '--' } }]
void MZ_RHO
void MX_RHO

/** Reusable claims (the recurring $\tfrac12$ / $\tfrac14$ that show up across many beats). */
const cHalf = claim('q13Half', 'a chance, Bloch component or completeness value of size one half', () => close(V.q13Half, 0.5))
const cQuarter = claim('q13Quarter', 'a chance of size one quarter', () => close(V.q13Quarter, 0.25))
const cThreeQuarters = claim('q13PThreeQuarters', 'the depolarizing parameter $p = 0.75$, the full-mixing point', () => close(V.q13PThreeQuarters, 0.75))
const cOverlap = claim('q13Overlap0Plus', 'the overlap $\\langle0|+\\rangle = 0.7071$', () => close(V.q13Overlap0Plus, Math.SQRT1_2, 1e-9))
const cDepolThird = claim('q13DepolFactorP50', 'the depolarizing shrink factor is $\\tfrac13$ in size, at $p=0.5$ or (negated) at $p=1$', () => close(Math.abs(V.q13DepolFactorP50), 1 / 3, 1e-9))

/* ---------------------------------------------------------------------------------------------- */
/* q13-from-unitary — Where channels come from                                                      */
/* ---------------------------------------------------------------------------------------------- */

const fromUnitary: Beat[] = [
  {
    id: 'q13-from-unitary:b1',
    phase: 'books',
    text:
      "Chapter Q8 moved $\\rho$ by a unitary alone — the whole story for a [[qc-density-matrix|closed]] system. A real [[qubit|qubit]] touches its surroundings. Couple it to an environment, let the pair evolve, then ignore the environment. What is left is no longer unitary.",
    formal:
      "Closed evolution is $\\rho\\to U\\rho U^\\dagger$ with $U = e^{-i\\hat Ht}$ ([[qc-von-neumann-equation|Chapter Q8]]). The general case couples the system to a fresh environment $E$, applies one joint unitary $U_{SE}$, and traces $E$ out ([[qc-partial-trace|Chapter Q9]]'s partial trace). The map left on the system alone is non-unitary in general: a quantum channel.",
    caption: 'prepare the system, a fresh environment waits, not yet coupled',
    captionFormal: '$\\rho\\to U_{SE}(\\cdot)U_{SE}^\\dagger$, then $\\mathrm{Tr}_E$: non-unitary in general',
    stage: circ(C_DEPH, 1),
  },
  {
    id: 'q13-from-unitary:b2',
    phase: 'books',
    introduces: ['qc-quantum-channel'],
    text:
      "Couple, evolve, trace out: collapse that recipe into operators on the qubit alone. The result is the [[qc-quantum-channel|channel]] $\\mathcal E(\\rho) = \\sum_m A_m\\rho A_m^\\dagger$, a weighted spread of the state. Each $A_m$ reads off one environment outcome. (The book also writes $T(\\rho)$.)",
    formal:
      "Inserting the environment's completeness $\\sum_m|m\\rangle\\langle m| = I_E$ gives the operator-sum (Kraus) form $\\mathcal E(\\rho) = \\sum_m A_m\\rho A_m^\\dagger$, $A_m = \\langle m|U_{SE}|0\\rangle_E$ (Bergou Eqs. 4.1–4.5; N&C Eq. 8.10). The [[qc-kraus-operator|Kraus operators]] $A_m$ are central to everything that follows; N&C's own letter for them is $E_k$.",
    caption: "$\\mathcal E(\\rho) = \\sum_m A_m\\rho A_m^\\dagger$: one term per environment outcome",
    captionFormal: '$\\mathcal E(\\rho) = \\sum_m A_m\\rho A_m^\\dagger,\\ A_m = \\langle m|U_{SE}|0\\rangle_E$',
    stage: split(circ(C_DEPH, 2), mx(DEPH_K1)),
    terms: {},
  },
  {
    id: 'q13-from-unitary:b3',
    phase: 'books',
    text:
      "One rule ties the operators together: $\\sum_m A_m^\\dagger A_m = I$. It follows from the coupling being unitary, and it is exactly what keeps the chances adding to one.",
    formal:
      "Unitarity of $U_{SE}$ forces the completeness relation $\\sum_m A_m^\\dagger A_m = I$ (Bergou Eq. 4.4; N&C Eq. 8.14), equivalently that $\\mathcal E$ is trace-preserving: $\\mathrm{Tr}\\,\\mathcal E(\\rho) = \\mathrm{Tr}(\\sum_m A_m^\\dagger A_m\\,\\rho) = \\mathrm{Tr}\\,\\rho$ for every $\\rho$.",
    caption: 'worked for dephasing ($p=\\tfrac12$): $\\sum_m A_m^\\dagger A_m = I$',
    captionFormal: '$\\sum_m A_m^\\dagger A_m = I$, by direct sum (dephasing, $p=\\tfrac12$)',
    stage: mx(DEPH_SUM, { trace: true }),
    claims: [
      claim('q13DephSumGap', 'the worked instance (dephasing, $p=\\tfrac12$) sums its $A_m^\\dagger A_m$ to $I$ exactly', () => close(V.q13DephSumGap, 0, 1e-9)),
      claim('q13DepolSumGap', 'the depolarizing channel at $p=\\tfrac12$ sums its $A_m^\\dagger A_m$ to $I$ exactly, the same relation', () => close(V.q13DepolSumGap, 0, 1e-9)),
    ],
    fidelity: ['qc-matrix-trace-engine'],
    derivation: {
      result: '\\sum_m A_m^\\dagger A_m = I \\Leftrightarrow \\text{trace-preserving}',
      ground: [
        {
          tex: '\\mathcal E(\\rho) = \\mathrm{Tr}_E[U_{SE}(\\rho\\otimes|0\\rangle\\langle0|_E)U_{SE}^\\dagger] = \\sum_m A_m\\rho A_m^\\dagger',
          why: 'Couple to the environment, evolve, then trace the environment out.',
          view: circ(C_DEPH, 2),
          viewCaption: 'the coupling: $H$ then a CNOT, $S$ and a fresh qubit $E$',
        },
        {
          tex: '\\sum_m A_m^\\dagger A_m = \\langle0|U_{SE}^\\dagger\\Big(\\sum_m|m\\rangle\\langle m|\\Big)U_{SE}|0\\rangle = \\langle0|U_{SE}^\\dagger U_{SE}|0\\rangle',
          why: "Collect the operators; the environment's own completeness appears.",
          view: mx(DEPH_SUM),
          viewCaption: 'worked for dephasing: $\\sum_m A_m^\\dagger A_m$ assembled',
        },
        {
          tex: '= \\langle0|0\\rangle\\,I = I',
          why: 'Unitarity gives $I$; the chances stay [[normalized|normalized]].',
          view: mx(DEPH_SUM, { trace: true }),
          viewCaption: '$=I$, trace $2$',
        },
        {
          tex: '\\sum_m A_m^\\dagger A_m = I \\Leftrightarrow \\text{trace-preserving}',
          why: 'The completeness relation is exactly trace preservation — for depolarizing too.',
        },
      ],
      formal: [
        {
          tex: '\\sum_m A_m^\\dagger A_m = \\langle0|U_{SE}^\\dagger U_{SE}|0\\rangle = I',
          why: 'From $U_{SE}^\\dagger U_{SE} = I$ and $\\langle0|0\\rangle = 1$ (Bergou Eq. 4.4).',
          view: circ(C_DEPH, 2),
        },
        {
          tex: '\\sum_m A_m^\\dagger A_m = I \\Leftrightarrow \\text{trace-preserving}',
          why: '$\\mathrm{Tr}\\,\\mathcal E(\\rho) = \\mathrm{Tr}(\\sum_m A_m^\\dagger A_m\\,\\rho)$, for dephasing and depolarizing alike.',
          view: mx(DEPH_SUM, { trace: true }),
        },
      ],
    },
  },
  {
    id: 'q13-from-unitary:b4',
    phase: 'clue',
    text: 'We built $\\mathcal E$ from a unitary and found $\\sum_m A_m^\\dagger A_m = I$. Does $\\mathrm{Tr}\\,\\mathcal E(\\rho) = \\mathrm{Tr}\\,\\rho$ hold for every input $\\rho$?',
    formal: 'Given $\\sum_m A_m^\\dagger A_m = I$, is $\\mathcal E$ trace-preserving for every $\\rho$, or only for some?',
    stage: mx(DEPH_SUM),
    reveal: {
      text: 'Every one. The completeness relation is an operator identity, so it holds no matter what goes in. A trace-preserving channel never loses or gains probability.',
      formal:
        'For all $\\rho$: $\\mathrm{Tr}\\,\\mathcal E(\\rho) = \\mathrm{Tr}(\\sum_m A_m^\\dagger A_m\\,\\rho) = \\mathrm{Tr}\\,\\rho$, since $\\sum_m A_m^\\dagger A_m = I$ holds as an operator identity, not for one $\\rho$.',
      caption: 'trace-preserving for every $\\rho$',
      stage: mx(DEPH_SUM, { trace: true }),
      claims: [claim('q13DephSumGap', 'the completeness relation holds as an exact operator identity', () => close(V.q13DephSumGap, 0, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q13-properties — What a channel preserves — and the catch                                        */
/* ---------------------------------------------------------------------------------------------- */

const properties: Beat[] = [
  {
    id: 'q13-properties:b1',
    phase: 'books',
    text:
      'A channel is tame in three ways. It keeps a Hermitian matrix Hermitian, it keeps the trace at one, and it maps states to states — no negative chances come out.',
    formal:
      'From $\\mathcal E(\\rho) = \\sum_m A_m\\rho A_m^\\dagger$: $\\mathcal E$ is Hermiticity-preserving, trace-preserving (Unit 13.1), and [[qc-positive-operator|positive]] — it maps positive operators to positive operators (Bergou §4.1.2). A density matrix in gives a density matrix out.',
    caption: 'a state in, trace kept at one',
    captionFormal: 'Hermiticity-, trace- and positivity-preserving',
    stage: mx({ rho: { ket: { ket: '+' } } }, { trace: true }),
    terms: {},
  },
  {
    id: 'q13-properties:b2',
    phase: 'books',
    text:
      'But positivity alone is too weak. The channel must stay positive even acting on **half** of a bigger entangled pair, with the other half left untouched. That is complete positivity.',
    formal:
      'Positivity must be strengthened to **complete positivity**: $\\mathcal E\\otimes I_B$ must be positive for an ancilla $B$ of any size (Bergou §4.1.2; N&C Box 8.2). If $\\mathcal E$ acts on $A$ while $B$ sits idle, $\\rho_{AB}\\to(\\mathcal E\\otimes I_B)(\\rho_{AB})$ must still be a valid state.',
    caption: 'the stronger rule: positive even acting on half an entangled pair',
    captionFormal: 'complete positivity: $\\mathcal E\\otimes I_B \\ge 0$ for an ancilla $B$ of any size',
    stage: tq({ bell: '00+11' }),
  },
  {
    id: 'q13-properties:b3',
    phase: 'books',
    introduces: ['qc-choi-matrix'],
    text:
      "Here is a map that passes the weaker test and fails the stronger one: the plain transpose. Run it on one half of $\\Phi^+$. The result — the [[qc-choi-matrix|Choi matrix]] — has a negative eigenvalue. That means it is not a channel.",
    formal:
      'The transpose $T$ is positive (it keeps eigenvalues). But $(T\\otimes I)|\\Phi^+\\rangle\\langle\\Phi^+|$ — the [[qc-choi-matrix|Choi matrix]] of $T$ — has spectrum $\\{\\tfrac12,\\tfrac12,\\tfrac12,-\\tfrac12\\}$ (N&C Box 8.2). A negative Choi eigenvalue means $T$ is not completely positive, so the transpose is **not** a physical channel — this is the partial transpose used elsewhere in this course, now read as a non-channel.',
    caption: 'transpose one half of $\\Phi^+$: a negative eigenvalue appears',
    captionFormal: 'Choi matrix of $T$: spectrum $\\{\\tfrac12,\\tfrac12,\\tfrac12,-\\tfrac12\\}$ $\\Rightarrow$ not CP',
    stage: mx(out({ bell: '00+11' }), { ptranspose: 'B', spectrum: 'bars' }),
    claims: [
      claim('q13TransposeSpecMin', "the transpose's Choi matrix has smallest eigenvalue $-\\tfrac12$", () => close(V.q13TransposeSpecMin, -0.5, 1e-9)),
      claim('q13TransposeSpecMax', 'its other three eigenvalues are each $\\tfrac12$', () => close(V.q13TransposeSpecMax, 0.5, 1e-9)),
    ],
    fidelity: ['qc-matrix-spectrum-engine', 'qc-matrix-ptranspose-not-physical'],
    derivation: {
      result: '\\text{spec}\\big((T\\otimes I)|\\Phi^+\\rangle\\langle\\Phi^+|\\big) = \\{\\tfrac12,\\tfrac12,\\tfrac12,-\\tfrac12\\} \\Rightarrow T \\text{ not CP}',
      ground: [
        {
          tex: '\\rho_{\\Phi^+} = \\tfrac12(|00\\rangle + |11\\rangle)(\\langle00| + \\langle11|)',
          why: 'The maximally entangled test state, written in blocks.',
          view: mx(out({ bell: '00+11' }), { blocks: 2 }),
          viewCaption: '$\\rho_{\\Phi^+}$: four corners',
        },
        {
          tex: '(T\\otimes I)\\rho_{\\Phi^+}',
          why: "Transpose Alice's half only; this is the Choi matrix of $T$.",
          view: mx(out({ bell: '00+11' }), { ptranspose: 'B' }),
          viewCaption: 'the Choi matrix of $T$',
        },
        {
          tex: '\\lambda = \\{\\tfrac12, \\tfrac12, \\tfrac12, -\\tfrac12\\}',
          why: 'Its eigenvalues: one of them is negative.',
          view: mx(out({ bell: '00+11' }), { ptranspose: 'B', spectrum: 'bars' }),
          viewCaption: 'a bar at $-\\tfrac12$',
        },
        {
          tex: '\\text{spec}\\big((T\\otimes I)|\\Phi^+\\rangle\\langle\\Phi^+|\\big) = \\{\\tfrac12,\\tfrac12,\\tfrac12,-\\tfrac12\\} \\Rightarrow T \\text{ not CP}',
          why: 'A negative Choi eigenvalue means $T$ is not a channel.',
        },
      ],
      formal: [
        {
          tex: '(T\\otimes I)|\\Phi^+\\rangle\\langle\\Phi^+| = \\tfrac12\\,\\mathrm{SWAP}',
          why: 'The Choi matrix of the transpose is half the swap operator.',
          view: mx(out({ bell: '00+11' }), { ptranspose: 'B' }),
        },
        {
          tex: '\\text{spec} = \\{\\tfrac12,\\tfrac12,\\tfrac12,-\\tfrac12\\} \\Rightarrow T \\text{ not CP}',
          why: "The swap's $-1$ eigenspace survives: the Choi–Jamiołkowski correspondence.",
          view: mx(out({ bell: '00+11' }), { ptranspose: 'B', spectrum: 'bars' }),
        },
      ],
    },
  },
  {
    id: 'q13-properties:b4',
    phase: 'clue',
    text: 'Elsewhere in this course, this same one-sided transpose spots entanglement. Why does the same operation now decide whether a map is a channel?',
    formal: 'The partial transpose detects entanglement elsewhere in this course; here it decides complete positivity. What single fact connects the two uses?',
    stage: mx(out({ bell: '00+11' }), { blocks: 2 }),
    reveal: {
      text: 'They are the same object. A map is a channel exactly when its Choi matrix is a valid state. The transpose fails because its Choi matrix turns negative.',
      formal:
        'The Choi–Jamiołkowski correspondence: $\\mathcal E$ is completely positive iff its Choi matrix $(\\mathcal E\\otimes I)|\\Phi^+\\rangle\\langle\\Phi^+| \\ge 0$. The transpose fails precisely because $(T\\otimes I)$ IS the partial transpose, turning $\\Phi^+$ negative — the same negativity used elsewhere as an entanglement flag.',
      caption: "same operation: a channel's Choi matrix must be positive, as an entangled state's partial transpose is not",
      stage: mx(out({ bell: '00+11' }), { ptranspose: 'B', spectrum: 'bars' }),
      claims: [claim('q13TransposeSpecMin', 'the negative eigenvalue is exactly $-\\tfrac12$', () => close(V.q13TransposeSpecMin, -0.5, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q13-stinespring — Every channel is a unitary in disguise                                         */
/* ---------------------------------------------------------------------------------------------- */

const stinespring: Beat[] = [
  {
    id: 'q13-stinespring:b1',
    phase: 'books',
    text:
      'Unit 13.1 built a channel by starting from a unitary. The converse holds too. Any channel, however noisy, can be realised as one unitary on the qubit plus a fresh environment, the environment then traced away.',
    formal:
      'The Stinespring dilation: given any Kraus set $\\{A_m\\}$, there is an environment $E$ (state $|0\\rangle_E$) and a unitary $U_{SE}$ with $A_m|\\psi\\rangle = \\langle m|U_{SE}(|\\psi\\rangle\\otimes|0\\rangle_E)$ (Bergou Eqs. 4.6–4.8). Every channel is a unitary on a larger space — openness is entanglement with an ignored environment.',
    caption: 'any channel = one unitary on qubit + environment, environment forgotten',
    captionFormal: 'Stinespring: $A_m|\\psi\\rangle = \\langle m|U_{SE}(|\\psi\\rangle|0\\rangle_E)$, $U_{SE}$ unitary',
    stage: circ(C_DEPH, 2),
  },
  {
    id: 'q13-stinespring:b2',
    phase: 'books',
    text:
      "Why does the unitary exist? Define $V|\\psi\\rangle = \\sum_m A_m|\\psi\\rangle\\otimes|m\\rangle_E$. Because $\\sum_m A_m^\\dagger A_m = I$, this $V$ keeps every [[inner-product|inner product]]. A map that preserves inner products always extends to a full unitary.",
    formal:
      "Define the isometry $V|\\psi\\rangle = \\sum_m A_m|\\psi\\rangle\\otimes|m\\rangle_E$. Then $V^\\dagger V = \\sum_m A_m^\\dagger A_m = I$, so $V$ preserves [[inner-product|inner products]] on the system subspace and extends to a unitary $U_{SE}$ on $H_S\\otimes H_E$ (identity on the [[orthogonal|orthogonal]] complement; Bergou Eq. 4.8).",
    caption: '$V = \\sum_m A_m\\otimes|m\\rangle$ keeps inner products, so it extends to a unitary',
    captionFormal: '$V^\\dagger V = \\sum_m A_m^\\dagger A_m = I$: an isometry, extended to $U_{SE}$',
    stage: split(circ(C_DEPH, 2), mx(DEPH_SUM)),
    claims: [claim('q13DephSumGap', '$V^\\dagger V = I$ exactly, for the worked dephasing instance', () => close(V.q13DephSumGap, 0, 1e-9))],
    fidelity: ['qc-matrix-trace-engine'],
    derivation: {
      result: 'V^\\dagger V = I \\Rightarrow V \\text{ extends to a unitary } U_{SE}',
      ground: [
        {
          tex: 'V|\\psi\\rangle = \\sum_m A_m|\\psi\\rangle\\otimes|m\\rangle_E',
          why: 'Build an operator that files each Kraus outcome into a fresh environment slot.',
          view: circ(C_DEPH, 2),
          viewCaption: '$V$: system into system + environment',
        },
        {
          tex: 'V^\\dagger V = \\sum_{m} A_m^\\dagger A_m',
          why: 'Its inner-product matrix is exactly the Kraus sum.',
          view: mx(DEPH_SUM),
          viewCaption: '$V^\\dagger V = \\sum_m A_m^\\dagger A_m$, worked for dephasing',
        },
        { tex: 'V^\\dagger V = I', why: 'So $V$ preserves every inner product: an isometry, which extends to a unitary.', view: mx(DEPH_SUM, { trace: true }), viewCaption: '$V^\\dagger V = I$' },
        { tex: 'V^\\dagger V = I \\Rightarrow V \\text{ extends to a unitary } U_{SE}', why: 'Every channel is a unitary on a bigger space.' },
      ],
      formal: [
        { tex: 'V^\\dagger V = \\sum_m A_m^\\dagger A_m = I', why: '$V$ is an isometry on $H_S$, by completeness (Unit 13.1).', view: mx(DEPH_SUM, { trace: true }) },
        { tex: 'V^\\dagger V = I \\Rightarrow V \\text{ extends to a unitary } U_{SE}', why: 'Extend $V$ by the identity on the orthogonal complement (Eq. 4.8).', view: circ(C_DEPH, 2) },
      ],
    },
  },
  {
    id: 'q13-stinespring:b3',
    phase: 'books',
    text:
      'The environment is not unique: two Kraus sets describe the same channel exactly when a unitary relates them. And a qubit channel never needs more than four Kraus operators.',
    formal:
      'Two Kraus sets give the same channel iff $D_\\nu = \\sum_\\mu U_{\\nu\\mu}A_\\mu$ for a unitary $U$ (Bergou Eq. 4.28) — the same unitary-freedom theorem as for density-matrix ensembles ([[qc-density-matrix|Chapter Q8]]). At most $N^2$ operators are ever needed ($4$ for a qubit), since the channel\'s Choi matrix has rank $\\le N^2$.',
    caption: 'same channel for a unitary-related set; a qubit needs at most $4$ operators',
    captionFormal: 'Kraus freedom $D_\\nu = \\sum_\\mu U_{\\nu\\mu}A_\\mu$; $\\le N^2 = 4$ operators for a qubit',
    stage: mx(AMPDAMP_DECAY),
    claims: [claim('q13MaxKraus2', 'a one-qubit channel never needs more than four Kraus operators', () => close(V.q13MaxKraus2, 4))],
  },
  {
    id: 'q13-stinespring:b4',
    phase: 'clue',
    text: 'What is the largest number of Kraus operators a one-qubit channel could ever need?',
    formal: 'For a single-qubit channel ($N = 2$), what is the maximum number of Kraus operators required?',
    stage: circ(C_DEPH, 2),
    reveal: {
      text: 'Four. For an $N$-level system it is $N^2$, and a qubit has $N = 2$. Dephasing above used only two; many channels use fewer than the maximum.',
      formal: '$N^2 = 4$. The bound is the rank of the Choi matrix, at most $N^2$; amplitude damping uses only two operators, dephasing two, depolarizing all four.',
      caption: 'at most $4$ for a qubit ($N^2$)',
      stage: mx(DEPH_K1),
      claims: [claim('q13MaxKraus2', 'the bound is $N^2=4$ for a qubit', () => close(V.q13MaxKraus2, 4))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q13-depolarizing — The shrinking Bloch ball                                                      */
/* ---------------------------------------------------------------------------------------------- */

const depolarizing: Beat[] = [
  {
    id: 'q13-depolarizing:b1',
    phase: 'books',
    text:
      'The depolarizing channel is the plainest noise. With chance $p$ the qubit is scrambled to the fully mixed centre, and with chance $1-p$ it is left alone. Watch this point on <<qc-l6-bloch|the ball from Spin Lab>> as $p$ grows.',
    formal:
      'The depolarizing channel replaces the qubit with the maximally mixed state $\\tfrac12I$ with probability $p$, leaving it alone otherwise: $\\mathcal E(\\rho) = (1-p)\\rho + \\tfrac p3(X\\rho X + Y\\rho Y + Z\\rho Z)$ (Bergou Eq. 4.30). Its Kraus operators are $\\{\\sqrt{1-p}\\,I,\\ \\sqrt{p/3}\\,X,\\ \\sqrt{p/3}\\,Y,\\ \\sqrt{p/3}\\,Z\\}$.',
    caption: 'depolarizing: scramble with chance $p$, or leave alone with chance $1-p$',
    captionFormal: '$\\mathcal E(\\rho) = (1-p)\\rho + \\tfrac p3(X\\rho X + Y\\rho Y + Z\\rho Z)$',
    stage: ball({ thetaDeg: 60, phiDeg: 30 }),
  },
  {
    id: 'q13-depolarizing:b2',
    phase: 'books',
    text:
      "Each Pauli flips the arrow a different way, and together they shrink it: the whole [[qc-bloch-ball|Bloch ball]] moves toward the centre by one common factor. At $p = 0.5$ it is a third of its size.",
    formal:
      'Using $\\sigma_j\\sigma_k\\sigma_j = -\\sigma_k$ for $j\\ne k$, the map sends $\\mathbf r\\to(1 - \\tfrac{4p}3)\\mathbf r$ (Bergou Eqs. 4.31–4.34): the whole [[qc-bloch-ball|Bloch ball]] contracts uniformly by $|1 - \\tfrac{4p}3|$. At $p = 0.5$ the factor is $\\tfrac13$. (The books write the arrow $\\mathbf n$ or $\\vec r$; this course keeps $\\mathbf r$.)',
    caption: 'the whole ball shrinks by one factor: a third at $p = 0.5$',
    captionFormal: '$\\mathbf r \\to (1 - \\tfrac{4p}3)\\mathbf r$; factor $\\tfrac13$ at $p = 0.5$',
    stage: split(ball({ r: [V.q13DepolFactorP50, 0, 0] }), mx(XZX)),
    claims: [claim('q13DepolFactorP50', 'at $p=0.5$ the Bloch ball shrinks to a third of its size', () => close(V.q13DepolFactorP50, 1 / 3, 1e-9))],
    fidelity: ['qc-matrix-entries'],
    derivation: {
      result: '\\mathbf r \\to (1 - \\tfrac{4p}3)\\mathbf r',
      ground: [
        {
          tex: '\\mathcal E(\\rho) = (1-p)\\rho + \\tfrac p3(X\\rho X + Y\\rho Y + Z\\rho Z)',
          why: 'The channel written as its Kraus action.',
        },
        { tex: '\\sigma_j\\sigma_k\\sigma_j = -\\sigma_k\\ (j\\ne k)', why: 'Each Pauli flips the other two components; for example $XZX = -Z$.', view: mx(XZX), viewCaption: '$XZX = -Z$' },
        {
          tex: 'T(\\sigma_k) = \\big[(1-p) + \\tfrac p3 - \\tfrac{2p}3\\big]\\sigma_k = (1 - \\tfrac{4p}3)\\sigma_k',
          why: 'Every Pauli component scales by the same factor; the ball contracts.',
          view: ball({ r: [V.q13DepolFactorP50, 0, 0] }),
          viewCaption: 'the ball at $p=0.5$: a third of its size',
        },
        {
          tex: '\\mathbf r \\to (1 - \\tfrac{4p}3)\\mathbf r',
          why: 'Every arrow shrinks toward the centre by one common factor.',
          view: ball({ r: [V.q13DepolFactorP75, 0, 0] }),
          viewCaption: 'further in, at $p=0.75$: the centre',
        },
      ],
      formal: [
        { tex: 'T(\\sigma_k) = (1 - \\tfrac{4p}3)\\sigma_k', why: 'From $\\sigma_j\\sigma_k\\sigma_j = -\\sigma_k$ summed over the three Paulis (Eq. 4.33).', view: mx(XZX) },
        { tex: '\\mathbf r \\to (1 - \\tfrac{4p}3)\\mathbf r', why: 'An isotropic contraction; factor $\\tfrac13$ at $p = 0.5$.', view: ball({ r: [V.q13DepolFactorP50, 0, 0] }) },
      ],
    },
  },
  {
    id: 'q13-depolarizing:b3',
    phase: 'books',
    text:
      'At $p = 0.75$ the shrink factor hits zero: every state lands on the centre, the fully mixed coin. Other channels squash the ball into an **egg** instead — amplitude damping is one.',
    formal:
      'At $p = \\tfrac34$ the factor is $0$: the channel maps every state to $\\tfrac12I$. A general trace-preserving qubit channel is instead an AFFINE map $\\mathbf r\\to M\\mathbf r + \\mathbf c$ (N&C Eq. 8.89); depolarizing is the isotropic case ($\\mathbf c = 0$). Amplitude damping shifts the centre to $\\mathbf c = (0,0,0.5)$ at $\\gamma = 0.5$ (⚑ Problem 4.5, cited): an off-centre egg, not a smaller ball.',
    caption: 'at $p = 0.75$ the ball is a single point; other channels make off-centre eggs',
    captionFormal: '$\\mathbf r\\to M\\mathbf r + \\mathbf c$: an ellipsoid; depolarizing is the isotropic case ($\\mathbf c = 0$)',
    stage: split(ball({ r: [V.q13DepolFactorP75, 0, 0] }), mx(AMPDAMP_DECAY)),
    claims: [
      claim('q13DepolFactorP75', 'at $p=0.75$ the shrink factor is exactly $0$', () => close(V.q13DepolFactorP75, 0, 1e-9)),
      claim('q13AmpDampCz', "amplitude damping shifts the ball's centre to $(0,0,0.5)$ at $\\gamma=0.5$", () => close(V.q13AmpDampCz, 0.5, 1e-9)),
      claim('q13AmpDampMxx', 'its $x$-axis shrinks to $0.7071$ at $\\gamma=0.5$', () => close(V.q13AmpDampMxx, Math.SQRT1_2, 1e-9)),
      claim('q13AmpDampMzz', 'its $z$-axis shrinks to $0.5$ at $\\gamma=0.5$', () => close(V.q13AmpDampMzz, 0.5, 1e-9)),
    ],
  },
  {
    id: 'q13-depolarizing:b4',
    phase: 'clue',
    text: 'Push the depolarizing channel all the way to $p = 1$. What does the shrink factor become, and what does the ball look like?',
    formal: 'Evaluate the depolarizing factor $1 - \\tfrac{4p}3$ at $p = 1$, and interpret its sign.',
    stage: ball({ r: [V.q13DepolFactorP75, 0, 0] }),
    reveal: {
      text: 'A third, but NEGATIVE: the ball is turned inside out and shrunk to a third. Full depolarizing is at $p = 0.75$, where the factor is zero, not at $p = 1$.',
      formal: 'The factor turns negative, $-\\tfrac13$: a point reflection through the centre composed with a shrink by $\\tfrac13$. The fully mixing point is $p = \\tfrac34$, not $p = 1$ — a common surprise.',
      caption: '$p = 1$: the factor is negative, a third — the ball inverted and shrunk',
      stage: ball({ r: [V.q13DepolFactorP100, 0, 0] }),
      claims: [claim('q13DepolFactorP100', 'at $p=1$ the factor is $-\\tfrac13$, negative', () => close(V.q13DepolFactorP100, -1 / 3, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q13-no-cloning — Why you cannot copy a qubit                                                     */
/* ---------------------------------------------------------------------------------------------- */

const noCloning: Beat[] = [
  {
    id: 'q13-no-cloning:b1',
    phase: 'books',
    text:
      "Suppose we wanted a copier: feed in an unknown $|\\psi\\rangle$ and a blank, get two copies out. A [[qc-cnot|CNOT]] looks promising — it copies $|0\\rangle$ to $|00\\rangle$ and $|1\\rangle$ to $|11\\rangle$ perfectly.",
    formal:
      'A cloning unitary would act as $U(|\\psi\\rangle\\otimes|0\\rangle) = |\\psi\\rangle\\otimes|\\psi\\rangle$ for every $|\\psi\\rangle$ (Bergou Eq. 4.35). A CNOT (control = data) does this on the basis: $U|00\\rangle = |00\\rangle$, $U|10\\rangle = |11\\rangle$. The question is whether it works on a [[superposition|superposition]] too.',
    caption: 'a copier would send $|\\psi\\rangle|0\\rangle$ to $|\\psi\\rangle|\\psi\\rangle$; a CNOT copies $|0\\rangle$, $|1\\rangle$',
    captionFormal: '$U(|\\psi\\rangle|0\\rangle) = |\\psi\\rangle|\\psi\\rangle$; CNOT: $|00\\rangle\\to|00\\rangle$, $|10\\rangle\\to|11\\rangle$',
    stage: split(circ(C_CLONE, 1), amp({ circuit: C_CLONE, upTo: 1 }, { mode: 'probability' })),
    claims: [claim('q13CloneBasisFid', 'the CNOT copies both basis states exactly, fidelity 1', () => close(V.q13CloneBasisFid, 1))],
    fidelity: ['qc-circuit-engine-state'],
  },
  {
    id: 'q13-no-cloning:b2',
    phase: 'books',
    text:
      "Now feed the CNOT a [[superposition|superposition]] $|+\\rangle|0\\rangle$. Linearity forces the output to be an entangled Bell pair, **not** the two copies $|+\\rangle|+\\rangle$. No unitary can clone an unknown qubit.",
    formal:
      "By linearity $U(|+\\rangle|0\\rangle) = \\tfrac1{\\sqrt2}(U|00\\rangle + U|10\\rangle) = \\tfrac1{\\sqrt2}(|00\\rangle + |11\\rangle) = \\Phi^+$, which is NOT $|+\\rangle|+\\rangle = \\tfrac12(|00\\rangle + |01\\rangle + |10\\rangle + |11\\rangle)$ (Bergou Eqs. 4.36–4.37). Equivalently (N&C Box 12.1) cloning two states forces $\\langle\\psi|\\varphi\\rangle = \\langle\\psi|\\varphi\\rangle^2$, so they must be equal or orthogonal: no unitary clones an unknown state.",
    caption: '$|+\\rangle|0\\rangle \\to \\Phi^+$, an entangled pair — not $|+\\rangle|+\\rangle$',
    captionFormal: 'linearity $\\Rightarrow U|+\\rangle|0\\rangle = \\Phi^+ \\ne |+\\rangle|+\\rangle$',
    stage: amp({ bell: '00+11' }, { mode: 'probability' }),
    claims: [claim('q13CloneSupFid', 'CNOT on $|+\\rangle|0\\rangle$ gives $\\Phi^+$ exactly, fidelity 1', () => close(V.q13CloneSupFid, 1))],
    fidelity: ['qc-amp-engine'],
    derivation: {
      result: 'U|+\\rangle|0\\rangle = \\Phi^+ \\ne |+\\rangle|+\\rangle',
      ground: [
        {
          tex: 'U|0\\rangle|0\\rangle = |00\\rangle,\\quad U|1\\rangle|0\\rangle = |11\\rangle',
          why: 'The CNOT copies the two basis states.',
          view: circ(C_CLONE, 1),
          viewCaption: '$|10\\rangle \\to |11\\rangle$',
        },
        {
          tex: 'U|+\\rangle|0\\rangle = \\tfrac1{\\sqrt2}(U|00\\rangle + U|10\\rangle) = \\tfrac1{\\sqrt2}(|00\\rangle + |11\\rangle) = \\Phi^+',
          why: "Linearity fixes the superposition's image.",
          view: amp({ bell: '00+11' }, { mode: 'probability' }),
          viewCaption: 'the output: $\\Phi^+$',
        },
        {
          tex: '|+\\rangle|+\\rangle = \\tfrac12(|00\\rangle + |01\\rangle + |10\\rangle + |11\\rangle)',
          why: 'But a true copy would look like this instead.',
          view: amp({ ket: '++' }, { mode: 'probability' }),
          viewCaption: 'the wanted $|+\\rangle|+\\rangle$',
        },
        { tex: 'U|+\\rangle|0\\rangle = \\Phi^+ \\ne |+\\rangle|+\\rangle', why: 'The entangled output is not two copies: no unitary clones an unknown qubit.' },
      ],
      formal: [
        {
          tex: 'U|+\\rangle|0\\rangle = \\tfrac1{\\sqrt2}(|00\\rangle + |11\\rangle) = \\Phi^+',
          why: 'By linearity on the basis images (Eqs. 4.36–4.37).',
          view: amp({ bell: '00+11' }, { mode: 'probability' }),
        },
        {
          tex: '\\langle\\psi|\\varphi\\rangle = \\langle\\psi|\\varphi\\rangle^2 \\Rightarrow \\langle\\psi|\\varphi\\rangle \\in \\{0, 1\\}',
          why: 'Cloning forces this; $|0\\rangle,|+\\rangle$ overlap $0.7071 \\ne 0.5$, so they cannot both be cloned (N&C Box 12.1).',
          view: amp({ ket: '++' }, { mode: 'probability' }),
        },
        {
          tex: 'U|+\\rangle|0\\rangle = \\Phi^+ \\ne |+\\rangle|+\\rangle',
          why: 'Both arguments agree: the superposition is entangled, not copied.',
        },
      ],
    },
  },
  {
    id: 'q13-no-cloning:b3',
    phase: 'clue',
    text: 'The CNOT copied $|0\\rangle$ and $|1\\rangle$ fine. So what class of states *can* a machine clone?',
    formal: 'The no-cloning proof allows $\\langle\\psi|\\varphi\\rangle = 0$ or $1$. Which states can therefore be cloned?',
    stage: amp({ circuit: C_CLONE, upTo: 1 }, { mode: 'probability' }),
    reveal: {
      text: 'Only mutually [[orthogonal|orthogonal]] states, like $|0\\rangle$ and $|1\\rangle$ — the classical bits. Ordinary data copies fine; an unknown quantum state does not.',
      formal:
        'Mutually orthogonal states ($\\langle\\psi|\\varphi\\rangle = 0$): a fixed [[orthonormal-basis|orthonormal]] set can be cloned, which is exactly classical information. Non-orthogonal states ($0 < |\\langle\\psi|\\varphi\\rangle| < 1$) cannot, so an unknown qubit drawn from a continuum is uncopyable.',
      caption: 'only mutually orthogonal states — classical bits',
      stage: amp({ bell: '00+11' }, { mode: 'probability' }),
      claims: [claim('q13Overlap0Plus', 'the non-orthogonal pair $|0\\rangle,|+\\rangle$ overlaps $0.7071$, neither $0$ nor $1$', () => close(V.q13Overlap0Plus, Math.SQRT1_2, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q13-herbert — Cloning would break relativity                                                     */
/* ---------------------------------------------------------------------------------------------- */

const herbert: Beat[] = [
  {
    id: 'q13-herbert:b1',
    phase: 'books',
    text:
      'No-cloning is not a mere technical limit — it guards relativity. Nick Herbert once proposed a faster-than-light telephone that relied on copying. If a perfect copier existed, his scheme would work.',
    formal:
      "The no-cloning theorem was discovered by chasing a flaw in Nick Herbert's proposed superluminal signalling scheme (Bergou §4.3.2). If a perfect cloner existed, Herbert's scheme would send information faster than light; relativity forbids that, so the cloner cannot exist.",
    caption: 'cloning would allow a faster-than-light telephone — so it is forbidden',
    captionFormal: "Herbert's FTL scheme works iff a perfect cloner exists; relativity forbids both",
    stage: tq({ bell: '00+11' }),
  },
  {
    id: 'q13-herbert:b2',
    phase: 'books',
    text:
      "Alice and Bob share a Bell pair. Alice measures hers in the $z$ or the $x$ basis — her choice is the message. But Bob's qubit alone is the fully mixed centre either way, so one copy tells him nothing.",
    formal:
      "Alice and Bob share $\\Phi^+$. Alice measures in the $z$ or $x$ basis; her basis is the bit she wants to send. Bob's reduced state is $\\tfrac12I$ regardless, so one copy tells him nothing. A cloner would let him make many copies of his single qubit and read Alice's basis — faster than light.",
    caption: "Bob's qubit is the centre whatever Alice does — one copy tells him nothing",
    captionFormal: '$\\rho_B = \\tfrac12I$ for either Alice basis; a cloner would reveal it, allowing a signal',
    stage: split(tqRho(MZ_PARTS), mx({ rho: { mixture: MX_PARTS } }, { partialTrace: 'A' })),
    claims: [
      claim('q13HerbertRbZLen', "Bob's reduced arrow has length $0$ after Alice's $z$-basis reading", () => close(V.q13HerbertRbZLen, 0, 1e-9)),
      claim('q13HerbertRbXLen', "Bob's reduced arrow has length $0$ after Alice's $x$-basis reading too, the same centre", () => close(V.q13HerbertRbXLen, 0, 1e-9)),
    ],
    fidelity: ['qc-tq-local-arrows', 'qc-matrix-trace-engine'],
    derivation: {
      result: '\\rho_B = \\tfrac12I \\text{ for either Alice basis} \\Rightarrow \\text{no signal}',
      ground: [
        {
          tex: '\\text{Alice measures } z:\\ \\rho = \\tfrac12(|00\\rangle\\langle00| + |11\\rangle\\langle11|)',
          why: "Her non-selective $z$ reading of $\\Phi^+$.",
          view: tqRho(MZ_PARTS),
          viewCaption: "Bob's arrow: the centre",
        },
        {
          tex: "\\text{Alice measures } x:\\ \\rho = \\tfrac12(|{+}{+}\\rangle\\langle{+}{+}| + |{-}{-}\\rangle\\langle{-}{-}|),\\ \\rho_B = \\tfrac12I",
          why: 'Her $x$ reading leaves Bob the same centre.',
          view: mx({ rho: { mixture: MX_PARTS } }, { partialTrace: 'A' }),
          viewCaption: "Bob's reduced $\\rho_B = \\tfrac12I$",
        },
        {
          tex: '\\rho_B = \\tfrac12I \\text{ for either Alice basis} \\Rightarrow \\text{no signal}',
          why: "A cloner would let Bob read Alice's basis, signalling; so the cloner is forbidden.",
        },
      ],
      formal: [
        {
          tex: "\\rho_B = \\mathrm{Tr}_A(\\rho) = \\tfrac12I \\text{ for Alice's }z\\text{- and }x\\text{-basis readings alike}",
          why: "Bob's reduced state does not depend on Alice's choice of basis.",
          view: tqRho(MZ_PARTS),
        },
        {
          tex: '\\rho_B = \\tfrac12I \\text{ for either Alice basis} \\Rightarrow \\text{no signal}',
          why: 'A cloner would break this; so no-cloning must hold.',
          view: mx({ rho: { mixture: MX_PARTS } }, { partialTrace: 'A' }),
        },
      ],
    },
  },
  {
    id: 'q13-herbert:b3',
    phase: 'clue',
    text: "In Herbert's scheme, which law does the signal run into first — no-cloning, or no-signalling?",
    formal: "Is Herbert's scheme blocked by the no-cloning theorem or by the no-signalling principle?",
    stage: tqRho(MZ_PARTS),
    reveal: {
      text: "Both — two faces of one wall. Bob cannot signal because his qubit is the same mixed state whatever Alice does. A cloner would give him the one tool to break that.",
      formal:
        "Both: no-signalling says Bob's $\\rho_B = \\tfrac12I$ carries no information about Alice's basis; a perfect cloner is precisely the device that would extract it, so no-cloning is the dynamical guarantee of no-signalling.",
      caption: 'two faces of one wall: no-cloning protects no-signalling',
      stage: mx({ rho: { mixture: MX_PARTS } }, { partialTrace: 'A' }),
      claims: [claim('q13HerbertRbXLen', "Bob's reduced state is the centre for the $x$ reading too", () => close(V.q13HerbertRbXLen, 0, 1e-9))],
    },
  },
]

export const Q13_STORY: Record<string, Beat[]> = {
  'q13-from-unitary': fromUnitary,
  'q13-properties': properties,
  'q13-stinespring': stinespring,
  'q13-depolarizing': depolarizing,
  'q13-no-cloning': noCloning,
  'q13-herbert': herbert,
}

/** Every unit's story beats also carry the reusable claims some beats reference by key alone. */
export const Q13_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof claim>[]> = {
  'q13-from-unitary': [cHalf],
  'q13-properties': [cHalf],
  'q13-stinespring': [cHalf],
  'q13-depolarizing': [cHalf, cQuarter, cThreeQuarters, cDepolThird],
  'q13-no-cloning': [cHalf, cQuarter, cOverlap],
  'q13-herbert': [cHalf],
}
