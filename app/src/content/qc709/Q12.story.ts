/**
 * Chapter Q12 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q12-story.md §1, in both
 * tracks, with the rulings of docs/roles/decisions/qc709-Q10Q13.md (Bergou ⚑ P3.4–P3.8 as cited asides only; the
 * `plot` kind's fallback when it does not cover a curve; the W/|W⟩ clash stated once; bound entanglement a
 * glossary-only Formal aside) and qc709-remap.md (no raw TeX outside `$…$`; engine-backed answers).
 *
 * Two platform gaps this build works around WITHOUT touching app/src/physics/** or app/src/stage/**:
 * - `plot`'s merged `CURVE_FNS` only has `chshVsPhase`/`chshClassicalBound` (Q10's curves; W-709 #16). None of this
 *   plan's four curves (pptLambdaMin, eofOfC, entropyOfTheta, wernerConcurrence) landed, so — per the ruling's own
 *   fallback — every beat that named one uses a `matrix{spectrum}`/`two-qubit{grid}` PARAMETER SWEEP instead, with
 *   the value in the caption; every derivation still keeps ≥ 2 distinct non-plot views.
 * - `two-qubit`'s `readouts: ['concurrence']` is merged (W-709 platform) and used on `q12-concurrence:b6` only, the beat
 *   whose caption states the Werner value; every other concurrence number is still read off a `matrix` view
 *   (`coef`+`svd`, or the Wootters/PPT spectrum bars) or stated in the caption, backed by its own claim.
 * - `MatrixSource`/`AmpSource` have no "literal vector" variant, so two states this plan treats as given — the
 *   witness operator W, and the W state |W⟩ (not a two-term `bell(...)` content) — are drawn by CONSTRUCTING them:
 *   W's beat reuses ρ/ρ^{T_B} views (its value is read off the caption, which is exactly the eigenvalue already on
 *   screen); |W⟩ is drawn as a tiny one-op `unitary` circuit (`Q12.values.ts` `C_WSTATE`, a Householder reflection
 *   |000⟩ → |W⟩) so `amplitudes`/`two-qubit{reduce}` can read it like any other circuit output. A claim
 *   (`q12WCircuitFid`) checks the circuit really gives |W⟩.
 *
 * Standing rules kept here (as Q9.story.ts): ≥ 2 distinct `view`/`viewCaption` states per derivation track (W-709
 * #7/#11); exactly one notation beat per new space/notation (W-709 #8/#12); no raw TeX outside `$…$`; every number
 * from Q12.values.ts.
 */
import type { AmpSource, AmplitudesState, Beat, CircuitStageState, MatrixGridState, MatrixSource, Scrub, StageLayout, StageState, TwoQubitState } from '../schema'
import type { Circuit } from '../../physics/qc/circuit'
import { C_CONJ, C_PROC30, C_PROC45, C_PRODA, C_WSTATE, TILT_DEG, psiPrep, V, claim, close, d } from './Q12.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan §0 "Stage shorthand"), as plain builder functions                          */
/* ---------------------------------------------------------------------------------------------- */
const amp = (state: AmpSource, extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => ({ kind: 'amplitudes', state, shot: 'A-BARS', ...extra })
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({
  kind: 'matrix',
  source,
  labels: 'kets',
  values: 'exact',
  shot: 'M-GRID',
  ...extra,
})
type RhoSrc = { ket: AmpSource } | { mixture: { w: Scrub; ket: AmpSource }[] }
const tq = (source: TwoQubitState['source'], extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'labels' | 'arrows' | 'grid'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source,
  labels: 'A-B',
  arrows: 'reduced',
  grid: 'T',
  shot: 'TQ-PAIR',
  ...extra,
})
const tqX = (ket: AmpSource, keep: [number, number], extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'arrows' | 'grid' | 'labels'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { reduce: { ket, keep } },
  arrows: 'reduced',
  grid: 'T',
  labels: 'A-B',
  shot: 'TQ-PAIR',
  ...extra,
})
const circ = (circuit: Circuit, upTo: Scrub, extra: Partial<Omit<CircuitStageState, 'kind' | 'circuit' | 'upTo'>> = {}): CircuitStageState => ({ kind: 'circuit', circuit, upTo, shot: 'Q-WIRES', ...extra })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

const mixSrc = (...parts: [Scrub, AmpSource][]): RhoSrc => ({ mixture: parts.map(([w, ket]) => ({ w, ket })) })
const rhoOf = (src: RhoSrc): MatrixSource => ({ rho: src })

/* ---------------------------------------------------------------------------------------------- */
/* Running families (plan §0's PB(p), W(w), PSI(θ), GHZ, W3; shorthand only — the numbers live in    */
/* Q12.values.ts, independently verified there and against the numpy twin)                          */
/* ---------------------------------------------------------------------------------------------- */

/** PB(p) = p|Ψ⁻⟩⟨Ψ⁻| + (1−p)|00⟩⟨00| (Bergou Eq. 3.23), as a matrix/two-qubit `rho` source. */
const PB = (p: Scrub): RhoSrc => mixSrc([p, { bell: 'Psi-' }], [complement(p), { ket: '00' }])
/** The Werner state w|Ψ⁻⟩⟨Ψ⁻| + (1−w)¼I, as a mixture of five pure terms (the weights always sum to 1). */
const WER = (w: Scrub): RhoSrc => mixSrc([w, { bell: 'Psi-' }], [quarterOf(w), { ket: '00' }], [quarterOf(w), { ket: '01' }], [quarterOf(w), { ket: '10' }], [quarterOf(w), { ket: '11' }])
/** 1 − p, for a plain number or a sweep (the complement always has the OTHER endpoint, so Σw = 1 at every s). */
function complement(p: Scrub): Scrub {
  return typeof p === 'number' ? 1 - p : { from: 1 - p.from, to: 1 - p.to, ease: p.ease }
}
function quarterOf(w: Scrub): Scrub {
  return typeof w === 'number' ? (1 - w) / 4 : { from: (1 - w.from) / 4, to: (1 - w.to) / 4, ease: w.ease }
}
/** cosθ|00⟩ + sinθ|11⟩ (θ in degrees), as an `AmpSource`: a tiny 2-qubit circuit (Ry on A, CNOT A → B) — `matrix`
 *  and `amplitudes` have no `family: 'cos-sin'` shorthand of their own (only `two-qubit` does). */
const PSI = (thetaDeg: number): AmpSource => ({ circuit: psiPrep(thetaDeg), upTo: 2 })
/** The same family, for the `two-qubit` kind's own sweepable shorthand. */
const PSI_FAMILY = (thetaDeg: Scrub): TwoQubitState['source'] => ({ family: 'cos-sin', thetaDeg })
const GHZ3: AmpSource = { bell: '000+111' }
/** |W⟩, drawn by its one-op Householder circuit (`Q12.values.ts` `C_WSTATE`); `q12WCircuitFid` checks it is exact. */
const W3: AmpSource = { circuit: C_WSTATE, upTo: 1 }
/** ρ_A(30°) = diag(0.75, 0.25) is already diagonal (no coherence), so it is a literal classical mixture of |0⟩, |1⟩
 *  — the engine's own weights (`Q12.values.ts`), not a typed 0.75/0.25 — rather than a `partialTrace` overlay, which
 *  `kron` (needed for the additivity beat) cannot take as an input. */
const RHO_A_30: MatrixSource = rhoOf(mixSrc([V.q12SchmidtLam30Large, { ket: '0' }], [V.q12SchmidtLam30Small, { ket: '1' }]))

/* Notes L10 pp. 47-55 (new edition) stage inputs. */
/** |0⟩ ⊗ (0.6|0⟩ + 0.8|1⟩): a product pair; (|01⟩ − i|10⟩)/√2; cosθ|00⟩ + sinθ|11⟩ with Λ = diag(0.6, 0.8). */
const PRODA: AmpSource = { circuit: C_PRODA, upTo: 1 }
const CONJ: AmpSource = { circuit: C_CONJ, upTo: 4 }
const PSI_L: AmpSource = { circuit: psiPrep(TILT_DEG), upTo: 2 }
/** The middle block of a 4 × 4 ρ: the cells for |01⟩ and |10⟩. */
const MID_BLOCK: [number, number][] = [
  [1, 1],
  [1, 2],
  [2, 1],
  [2, 2],
]
/** ρ(α) = α|S⟩⟨S| + ((1−α)/2)(|00⟩⟨00| + |11⟩⟨11|), |S⟩ = Ψ⁻ (notes Eq. 3.12), as a `rho` source. */
const halfRest = (a: Scrub): Scrub => (typeof a === 'number' ? (1 - a) / 2 : { from: (1 - a.from) / 2, to: (1 - a.to) / 2, ease: a.ease })
const FAM = (a: Scrub): RhoSrc => mixSrc([a, { bell: 'Psi-' }], [halfRest(a), { ket: '00' }], [halfRest(a), { ket: '11' }])
const POP: RhoSrc = mixSrc([0.5, { ket: '01' }], [0.5, { ket: '10' }])

/* Reusable claims. */
const cHalf = claim('q12Half', 'a weight or component of one half', () => close(V.q12Half, 0.5))
const cThird = claim('q12Third', 'a weight or threshold of one third', () => close(V.q12Third, 1 / 3))

/* ---------------------------------------------------------------------------------------------- */
/* q12-coherence — Two numbers that betray entanglement (notes L10 pp. 48-50, Eqs. 3.4-3.15)        */
/* ---------------------------------------------------------------------------------------------- */

const coherenceUnit: Beat[] = [
  {
    id: 'q12-coherence:b1',
    phase: 'lecture',
    text: 'Write a product pair as a state of A times a state of B, with amplitudes $a_0, a_1$ for A and $b_0, b_1$ for B. Look at the middle block of its density matrix, the rows and columns for $|01\\rangle$ and $|10\\rangle$. The two diagonal entries are chances, $P_{01} = |a_0|^2|b_1|^2$ and $P_{10} = |a_1|^2|b_0|^2$. The off-diagonal entry is $Q = a_0b_1a_1^*b_0^*$, and its size is a product of four moduli.',
    formal:
      'For a product pure state $|a\\rangle\\otimes|b\\rangle$, the $\\{|01\\rangle, |10\\rangle\\}$ block of $\\rho$ has populations $P_{01} = |a_0|^2|b_1|^2$ and $P_{10} = |a_1|^2|b_0|^2$ and coherence $Q = \\rho_{01,10} = a_0b_1a_1^*b_0^*$, so $|Q| = |a_0||b_1||a_1||b_0|$ (notes Eqs. 3.4–3.6). The other entries of $\\rho$ play no part in what follows.',
    caption: 'the middle block: two chances $P_{01}$, $P_{10}$ and a coherence $Q$',
    captionFormal: '$\\{|01\\rangle, |10\\rangle\\}$ block: $P_{01}$, $P_{10}$, $Q$',
    stage: mx(rhoOf({ ket: PRODA }), { blocks: 2, highlight: MID_BLOCK }),
  },
  {
    id: 'q12-coherence:b2',
    phase: 'lecture',
    text: `Why can a product never beat one half? Expand the squares, using that each state's two chances add to 1: $(|a_0| - |b_1|)^2 + (|a_1| - |b_0|)^2 + 2|a_0||b_1| + 2|a_1||b_0| = 2$. Squares are never negative, so $|a_0||b_1| + |a_1||b_0| \\le 1$. Square that: $P_{01} + P_{10} + 2|Q| \\le 1$. Halve it. The [[qc-coherence-criterion|coherence figure]] $F_{\\text{coh}} = \\tfrac12(P_{01} + P_{10}) + |Q|$ is at most ½ for every product pair. The product $|0\\rangle\\otimes(0.6|0\\rangle + 0.8|1\\rangle)$ scores ${d(V.q12CohProdA, 2)}, and two equal equatorial states reach exactly ½.`,
    formal: `For a product pair, $(|a_0| - |b_1|)^2 + (|a_1| - |b_0|)^2 + 2|a_0||b_1| + 2|a_1||b_0| = 2$ (notes Eq. 3.7) gives $|a_0||b_1| + |a_1||b_0| \\le 1$, hence $P_{01} + P_{10} + 2|Q| \\le 1$ and $F_{\\text{coh}} = \\tfrac12(P_{01} + P_{10}) + |Q| \\le \\tfrac12$ (Eqs. 3.8–3.10). Equality needs $|a_0| = |b_1|$ and $|a_1| = |b_0|$, as for two equal equatorial states, value ½; the product $|0\\rangle\\otimes(0.6|0\\rangle + 0.8|1\\rangle)$ scores ${d(V.q12CohProdA, 2)}. Rosetta: the notes call this figure $F$; here it is $F_{\\text{coh}}$, because $F$ is Chapter Q9's fidelity.`,
    caption: `$F_{\\text{coh}} \\le \\tfrac12$ for a product; the tilted product scores ${d(V.q12CohProdA, 2)}`,
    captionFormal: '$P_{01} + P_{10} + 2|Q| \\le 1 \\Rightarrow F_{\\text{coh}} \\le \\tfrac12$',
    stage: split(amp(PRODA), mx(rhoOf({ ket: PRODA }), { blocks: 2, highlight: MID_BLOCK })),
    derivation: {
      result: '\\tfrac12(P_{01} + P_{10}) + |Q| \\le \\tfrac12',
      ground: [
        {
          tex: '(|a_0| - |b_1|)^2 + (|a_1| - |b_0|)^2 + 2|a_0||b_1| + 2|a_1||b_0| = 2',
          why: 'Expand the squares and use that each state has chances adding to 1.',
          view: amp(PRODA),
          viewCaption: 'a product pair: four basis states, two of them non-zero',
        },
        { tex: '|a_0||b_1| + |a_1||b_0| \\le 1', why: 'The two squares are never negative, so the other two terms add to at most 2.' },
        {
          tex: '\\big(|a_0||b_1| + |a_1||b_0|\\big)^2 = P_{01} + P_{10} + 2|Q|',
          why: 'Square the sum and read off the two chances and the coherence.',
          view: mx(rhoOf({ ket: PRODA }), { blocks: 2, highlight: MID_BLOCK }),
          viewCaption: 'the middle block of $\\rho$',
        },
        { tex: 'P_{01} + P_{10} + 2|Q| \\le 1', why: 'A non-negative number that is at most 1 has a square that is at most 1.' },
        { tex: '\\tfrac12(P_{01} + P_{10}) + |Q| \\le \\tfrac12', why: 'Divide both sides by two.' },
      ],
      formal: [
        { tex: 'P_{01} + P_{10} + 2|Q| = \\big(|a_0||b_1| + |a_1||b_0|\\big)^2 \\le 1', why: 'The identity of Eq. 3.7 bounds the sum by 1.', view: amp(PRODA) },
        { tex: '\\tfrac12(P_{01} + P_{10}) + |Q| \\le \\tfrac12', why: 'Halve it; equality holds when $|a_0| = |b_1|$ and $|a_1| = |b_0|$.', view: mx(rhoOf({ ket: PRODA }), { blocks: 2, highlight: MID_BLOCK }) },
      ],
    },
    claims: [
      claim('q12CohProdA', 'the product $|0\\rangle\\otimes(0.6|0\\rangle + 0.8|1\\rangle)$ has $F_{\\text{coh}} = 0.32$', () => close(V.q12CohProdA, 0.32)),
      claim('q12ProdAAmp0', 'B’s first amplitude in that product is $0.6$', () => close(V.q12ProdAAmp0, 0.6, 1e-9)),
      claim('q12ProdAAmp1', 'B’s second amplitude in that product is $0.8$', () => close(V.q12ProdAAmp1, 0.8, 1e-9)),
      claim('q12CohProdEq', 'two equal equatorial states reach $F_{\\text{coh}} = \\tfrac12$ exactly', () => close(V.q12CohProdEq, 0.5, 1e-9)),
      cHalf,
    ],
  },
  {
    id: 'q12-coherence:b3',
    phase: 'lecture',
    text: 'A separable state is a [[qc-mixture|mixture]] of products. In a mixture the chances average, and the size of an average coherence is at most the average of the sizes. So $F_{\\text{coh}} \\le \\tfrac12$ for every separable state. Hence $F_{\\text{coh}} > \\tfrac12$ proves entanglement, while $F_{\\text{coh}} \\le \\tfrac12$ proves nothing. The chances alone never show it, since $P_{01} + P_{10} \\le 1$ keeps their part at most ½. The singlet reaches 1.',
    formal:
      'For a [[qc-mixture|mixture]] $\\rho = \\sum_kp_k\\rho_k$ the populations average and, by the triangle inequality, $|Q| \\le \\sum_kp_k|Q_k|$, so $F_{\\text{coh}}(\\rho) \\le \\tfrac12$ for every separable $\\rho$ (notes Eq. 3.11). Thus $F_{\\text{coh}} > \\tfrac12$ is sufficient for entanglement but not necessary. Populations alone give at most ½, since $P_{01} + P_{10} \\le 1$; the singlet has $F_{\\text{coh}} = 1$.',
    caption: 'separable: $F_{\\text{coh}} \\le \\tfrac12$; the singlet: 1',
    captionFormal: '$F_{\\text{coh}} > \\tfrac12 \\Rightarrow$ entangled; $\\le \\tfrac12$ proves nothing',
    stage: split(mx(rhoOf({ ket: { bell: 'Psi-' } }), { blocks: 2, highlight: MID_BLOCK }), tq({ rho: POP })),
    claims: [
      claim('q12CohPopMax', 'a coin pair on $|01\\rangle, |10\\rangle$ has populations only: $F_{\\text{coh}} = \\tfrac12$', () => close(V.q12CohPopMax, 0.5, 1e-9)),
      claim('q12CohSinglet', 'the singlet has $F_{\\text{coh}} = 1$', () => close(V.q12CohSinglet, 1, 1e-9)),
      cHalf,
    ],
  },
  {
    id: 'q12-coherence:b4',
    phase: 'clue',
    text: 'The Bell state $\\Phi^+$ is maximally entangled. What does the coherence figure say about it?',
    formal: 'Evaluate $F_{\\text{coh}}$ for $\\Phi^+ = (|00\\rangle + |11\\rangle)/\\sqrt2$. Is it caught? What does a local flip on B do?',
    stage: mx(rhoOf({ ket: { bell: 'Phi+' } }), { blocks: 2, highlight: MID_BLOCK }),
    reveal: {
      text: 'It says 0. The pair is entangled, but its coherence sits in the corner for $|00\\rangle$ and $|11\\rangle$, outside the middle block. Flip B with $X$ and the pair becomes $\\Psi^+$, where the figure reads 1.',
      formal: '$F_{\\text{coh}}(\\Phi^+) = 0$: the test is silent although $\\Phi^+$ is maximally entangled, because the coherence $\\rho_{00,11}$ lies outside the $\\{|01\\rangle, |10\\rangle\\}$ block. A local $X$ on B maps $\\Phi^+$ to $\\Psi^+$, with $F_{\\text{coh}} = 1$. The criterion proves entanglement when it exceeds ½ and is silent otherwise. This $\\Phi^+$ example is ours; the notes do not work it.',
      caption: '$F_{\\text{coh}}(\\Phi^+) = 0$; after a local $X$ on B it is 1',
      captionFormal: '$\\Phi^+$: $F_{\\text{coh}} = 0$; $(I\\otimes X)\\Phi^+ = \\Psi^+$: $F_{\\text{coh}} = 1$',
      stage: tq({ ket: { bell: 'Phi+' } }, { local: [{ qubit: 1, gate: 'X' }] }),
      claims: [claim('q12CohPhiPlus', 'the coherence figure of $\\Phi^+$ is 0', () => close(V.q12CohPhiPlus, 0, 1e-9)), claim('q12CohFlip', 'after a local $X$ on B it is 1', () => close(V.q12CohFlip, 1, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q12-ppt — The partial transpose test                                                             */
/* ---------------------------------------------------------------------------------------------- */

const pptUnit: Beat[] = [
  {
    id: 'q12-ppt:b1',
    phase: 'lecture',
    introduces: ['qc-partial-transpose'],
    text: "The lecture notes call the [[qc-partial-transpose|partial transpose]] $\\sigma$: transpose one half's indices of $\\rho$ and leave the other half alone. Now turn Alice's [[qubit|qubit]] by any gate $U_A$ and Bob's by any gate $U_B$. The matrix $\\sigma$ becomes a rotated copy of itself, and its eigenvalues do not move. So local gates cannot turn a negative eigenvalue into a positive one. For two qubits, and for a qubit with a qutrit, the test is also sufficient.",
    formal:
      'Under $\\rho \\to (U_A\\otimes U_B)\\rho(U_A\\otimes U_B)^\\dagger$ the [[qc-partial-transpose|partial transpose]] $\\sigma$ becomes $(U_A^*\\otimes U_B)\\,\\sigma\\,(U_A^*\\otimes U_B)^\\dagger$ (notes Eqs. 3.23–3.26), so its spectrum is a local-unitary invariant: for fixed gates the largest shift of an eigenvalue is 0. The test is sufficient only for $2\\otimes2$ and $2\\otimes3$. Rosetta: $\\sigma$ is the partial transpose of the A indices, not a Pauli matrix; this chapter writes $\\rho^{T_B}$, with the same eigenvalues since $(\\rho^{T_A})^T = \\rho^{T_B}$.',
    caption: 'local gates turn $\\sigma$ but leave its eigenvalues alone',
    captionFormal: '$\\sigma \\to (U_A^*\\otimes U_B)\\,\\sigma\\,(\\cdot)^\\dagger$: the spectrum is invariant',
    stage: mx(rhoOf(PB(0.5)), { ptranspose: 'B', spectrum: 'bars' }),
    claims: [claim('q12PtLuGap', 'fixed local gates leave the eigenvalues of $\\rho^{T_B}$ unchanged', () => close(V.q12PtLuGap, 0, 1e-9))],
  },
  {
    id: 'q12-ppt:b2',
    phase: 'books',
    text:
      'Chapter Q10 called a pair [[qc-separable-state|separable]] when it is a chance-[[mixture|mixture]] of product states. But handed one density matrix, how do we tell? Chapter Q10’s CHSH test ($S \\le 2$) misses some entangled states. We want a sharper one.',
    formal:
      'A bipartite state is [[qc-separable-state|separable]] if $\\rho = \\sum_kp_k\\,\\rho_{A,k}\\otimes\\rho_{B,k}$ (Chapter Q10). Deciding separability from a given $\\rho$ is hard in general; the CHSH test of Chapter Q10 is only sufficient and misses entangled states that break no Bell inequality. We build a stronger, purely algebraic test.',
    caption: 'separable = a mixture of products; we want a test',
    captionFormal: 'separability from $\\rho$ alone: a sharper criterion than CHSH',
    stage: tq({ rho: PB(0.5) }),
  },
  {
    id: 'q12-ppt:b3',
    phase: 'books',
    text:
      'Chapter Q10 used this flip as a quick test; here is why it works. Write $\\rho$ as a grid of blocks, one per pair of Alice’s indices. The [[qc-partial-transpose|partial transpose]] $\\rho^{T_B}$ transposes inside each block — it flips Bob’s two indices but leaves Alice’s alone. The matrix changes; its trace does not.',
    formal:
      'In a product basis $\\rho_{m\\mu,n\\nu} = \\langle m\\mu|\\rho|n\\nu\\rangle$. The [[qc-partial-transpose|partial transpose]] on $B$ is $(\\rho^{T_B})_{m\\mu,n\\nu} = \\rho_{m\\nu,n\\mu}$ (Bergou Eq. 3.22): it transposes the $B$ indices only. It depends on the basis, but its eigenvalues do not.',
    caption: '$\\rho^{T_B}$: transpose each block; four cells swap',
    captionFormal: '$(\\rho^{T_B})_{m\\mu,n\\nu} = \\rho_{m\\nu,n\\mu}$: the $B$ index transposed',
    stage: mx(rhoOf(PB(0.5)), { blocks: 2, ptranspose: 'B' }),
    claims: [
      claim('q12BergRho0500', 'the running state’s (00, 00) block has trace one half', () => close(V.q12BergRho0500, 0.5)),
      claim('q12BergRho0511', 'its (01, 01) entry is one quarter', () => close(V.q12BergRho0511, 0.25)),
      claim('q12BergRho0512Abs', 'the moved cell has size one quarter', () => close(V.q12BergRho0512Abs, 0.25)),
    ],
  },
  {
    id: 'q12-ppt:b4',
    phase: 'books',
    text:
      'Now take eigenvalues. A separable $\\rho$ always gives a non-negative $\\rho^{T_B}$: a sum of products stays a valid state under the flip. So **one negative eigenvalue proves entanglement** — Chapter Q10’s own [[qc-ppt|PPT criterion]], now derived. Our running state has a negative one for every $p$ above 0.',
    formal:
      'If $\\rho$ is separable then $\\rho^{T_B} = \\sum_kp_k\\,\\rho_{A,k}\\otimes\\rho_{B,k}^T\\ge 0$, since a transposed state is still a state. So a **negative** eigenvalue of $\\rho^{T_B}$ is sufficient for entanglement (Peres). For $\\rho(p) = p|\\Psi^-\\rangle\\langle\\Psi^-| + (1-p)|00\\rangle\\langle00|$ the smallest eigenvalue is $\\tfrac12\\big[(1-p) - \\sqrt{(1-p)^2 + p^2}\\big] < 0$ for all $p > 0$ (Eq. 3.26).',
    caption: 'one negative eigenvalue after the flip ⇒ entangled',
    captionFormal: '$\\lambda_{\\min}(\\rho^{T_B}) < 0$ for all $p > 0$: entangled',
    stage: split(mx(rhoOf(PB({ from: 0, to: 1 })), { ptranspose: 'B', spectrum: 'bars' }), tq({ rho: PB({ from: 0, to: 1 }) })),
    derivation: {
      result: '\\lambda_{\\min}(\\rho^{T_B}) < 0 \\text{ for all } p > 0 \\Rightarrow \\text{entangled}',
      ground: [
        { tex: '\\rho(p) = p|\\Psi^-\\rangle\\langle\\Psi^-| + (1-p)|00\\rangle\\langle00|', why: 'The running state, in blocks by Alice’s index pair.', view: mx(rhoOf(PB(0.5)), { blocks: 2 }), viewCaption: '$\\rho$ in $2\\times2$ blocks' },
        { tex: '(\\rho^{T_B})_{m\\mu,n\\nu} = \\rho_{m\\nu,n\\mu}', why: 'Transpose inside each block; four off-diagonal cells swap.', view: mx(rhoOf(PB(0.5)), { blocks: 2, ptranspose: 'B' }), viewCaption: '$\\rho^{T_B}$: the moved cells dashed' },
        {
          tex: '\\lambda(\\rho^{T_B}) = \\big\\{\\tfrac p2, \\tfrac p2, \\tfrac12[(1-p)\\pm\\sqrt{(1-p)^2+p^2}]\\big\\}',
          why: 'Its eigenvalues; the last one dips below zero.',
          view: mx(rhoOf(PB({ from: 0, to: 1 })), { ptranspose: 'B', spectrum: 'bars' }),
          viewCaption: 'a bar turns negative as $p$ grows',
          claims: [
            claim('q12BergPptSpec05Min', 'at $p=0.5$ the smallest eigenvalue is $-0.104$', () => close(V.q12BergPptSpec05Min, -0.1035533905932738, 1e-6)),
            claim('q12BergPptSpec05Max', 'the largest is $0.604$', () => close(V.q12BergPptSpec05Max, 0.6035533905932737, 1e-6)),
          ],
        },
        {
          tex: '\\lambda_{\\min}(\\rho^{T_B}) = \\tfrac12[(1-p) - \\sqrt{(1-p)^2+p^2}] < 0\\ (p>0)',
          why: 'Negative for every $p$ above $0$.',
          view: tq({ rho: PB({ from: 0, to: 1 }) }),
          viewCaption: '$xx, yy$ correlations grow as $-p$; $zz$ passes $0$ at $p = \\tfrac12$',
        },
        { tex: '\\lambda_{\\min}(\\rho^{T_B}) < 0 \\text{ for all } p > 0 \\Rightarrow \\text{entangled}', why: 'A separable $\\rho$ would stay $\\ge 0$, so this state is entangled.' },
      ],
      formal: [
        { tex: '\\rho \\text{ separable} \\Rightarrow \\rho^{T_B} = \\sum_kp_k\\,\\rho_{A,k}\\otimes\\rho_{B,k}^T \\ge 0', why: 'A transposed state is still a state (Bergou Eq. 3.22).', view: mx(rhoOf(PB(0.5)), { blocks: 2, ptranspose: 'B' }) },
        { tex: '\\lambda_{\\min}(\\rho^{T_B}) < 0 \\text{ for all } p > 0 \\Rightarrow \\text{entangled}', why: 'Eq. 3.26; the Peres criterion, for every $p$ above $0$.', view: tq({ rho: PB({ from: 0, to: 1 }) }) },
      ],
    },
    claims: [claim('q12BergLamMinAt05', 'at $p = 0.5$, $\\lambda_{\\min}(\\rho^{T_B}) = -0.104$', () => close(V.q12BergLamMinAt05, -0.1035533905932738, 1e-6))],
  },
  {
    id: 'q12-ppt:b5',
    phase: 'books',
    text:
      'For two [[qubit|qubits]] (and qubit–qutrit) the test is perfect: a negative eigenvalue appears **exactly** when the state is entangled. And it is sharper than Chapter Q10’s Bell test. Our state breaks no CHSH bound until $p$ passes $0.707$, yet it is entangled all the way down.',
    formal:
      'For $2\\otimes2$ and $2\\otimes3$ systems the Peres criterion is also necessary (Horodecki): $\\rho^{T_B}\\ge 0 \\iff$ separable. The running state satisfies CHSH for $p \\le 1/\\sqrt2 \\approx 0.707$ (for $p \\ge \\tfrac13$ Horodecki’s best score is $2\\sqrt2\\,p$), yet its partial transpose is negative for all $p > 0$, so PPT detects entanglement that CHSH cannot.',
    caption: 'two qubits: negative ⇔ entangled; sharper than the Bell test',
    captionFormal: '$2\\otimes2$: PPT is necessary and sufficient; strictly stronger than CHSH',
    stage: split(mx(rhoOf(PB(V.q12ChshThresh)), { ptranspose: 'B', spectrum: 'bars' }), tq({ rho: PB(V.q12ChshThresh) })),
    claims: [
      claim('q12ChshThresh', 'the CHSH threshold is $0.707$: the best score there is exactly $2$', () => close(V.q12ChshThresh, Math.SQRT1_2) && close(V.q12ChshMaxAtThresh, 2, 1e-6)),
      claim('q12ChshMaxAt05', 'the best CHSH score at $p=0.5$ is $1.414$, below the classical bound $2$', () => close(V.q12ChshMaxAt05, 2 * Math.sqrt(2 * 0.5 ** 2), 1e-6)),
      claim('q12ChshMaxAtThresh', 'at $p = 1/\\sqrt2$ the best CHSH score reaches exactly $2$, the classical boundary', () => close(V.q12ChshMaxAtThresh, 2, 1e-6)),
      claim('q12BergLamMinAtChsh', 'already at that $p$, $\\lambda_{\\min}(\\rho^{T_B}) = -0.236$', () => {
        const p = V.q12ChshThresh
        return close(V.q12BergLamMinAtChsh, 0.5 * (1 - p - Math.sqrt((1 - p) ** 2 + p ** 2)), 1e-6)
      }),
    ],
  },
  {
    id: 'q12-ppt:b6',
    phase: 'clue',
    text: 'Take the Werner state: a singlet mixed with pure noise, $w|\\Psi^-\\rangle\\langle\\Psi^-| + (1-w)\\tfrac14 I$. For which $w$ does the flip give a negative eigenvalue?',
    formal: 'Apply the Peres test to the Werner state $\\rho(w) = w|\\Psi^-\\rangle\\langle\\Psi^-| + (1-w)\\tfrac14 I$. For which $w$ is $\\lambda_{\\min}(\\rho^{T_B}) < 0$?',
    stage: tq({ rho: WER(0.5) }),
    reveal: {
      text: 'The smallest eigenvalue is $(1-3w)/4$: negative exactly when $w$ is above $\\tfrac13$. So the Werner state is entangled precisely for $w > \\tfrac13$.',
      formal: '$\\lambda_{\\min}(\\rho^{T_B}) = (1-3w)/4$, negative for $w > \\tfrac13$. Since PPT is exact for two [[qubit|qubits]], the Werner state is entangled exactly for $w > \\tfrac13$ — the same threshold the concurrence will give in Unit 12.6.',
      caption: 'Werner: entangled for $w > \\tfrac13$',
      captionFormal: 'Werner: entangled for $w > \\tfrac13$',
      stage: mx(rhoOf(WER({ from: 0, to: 1 })), { ptranspose: 'B', spectrum: 'bars' }),
      claims: [
        claim('q12WerPptAtThird', 'at $w = \\tfrac13$, $\\lambda_{\\min} = 0$', () => close(V.q12WerPptAtThird, 0, 1e-9)),
        claim('q12WerPptAtHalf', 'at $w = \\tfrac12$, $\\lambda_{\\min} = -0.125$', () => close(V.q12WerPptAtHalf, -0.125, 1e-6)),
        claim('q12WerPptAt1', 'at $w = 1$, $\\lambda_{\\min} = -0.5$', () => close(V.q12WerPptAt1, -0.5, 1e-6)),
        cThird,
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q12-witness — One observable that spots entanglement                                             */
/* ---------------------------------------------------------------------------------------------- */

const witnessUnit: Beat[] = [
  {
    id: 'q12-witness:b1',
    phase: 'books',
    text:
      'A [[qc-entanglement-witness|witness]] is one Hermitian observable $W$ whose average is **never negative** on a separable state, but **is** negative on at least one entangled state. Measure $\\langle W\\rangle$; a negative reading proves entanglement, with no tomography.',
    formal:
      'An [[qc-entanglement-witness|entanglement witness]] $W$ is a Hermitian operator with $\\mathrm{Tr}(\\rho_sW)\\ge 0$ for every separable $\\rho_s$, and $\\mathrm{Tr}(\\rho_eW) < 0$ for at least one entangled $\\rho_e$. Because $W$ is Hermitian it is in principle an observable, so a single [[expectation|expectation value]] can certify entanglement.',
    caption: 'a witness $W$: $\\langle W\\rangle \\ge 0$ for separable, $< 0$ for some entangled',
    captionFormal: '$\\mathrm{Tr}(\\rho_sW)\\ge 0$ always; $\\mathrm{Tr}(\\rho_eW) < 0$ for some $\\rho_e$',
    stage: mx(rhoOf(PB(0.5)), { trace: true }),
  },
  {
    id: 'q12-witness:b2',
    phase: 'books',
    text:
      'Here is how to build one. Take the eigenvector $|\\eta\\rangle$ for the negative eigenvalue of $\\rho^{T_B}$. Then $W = (|\\eta\\rangle\\langle\\eta|)^{T_B}$ works: its average on our state equals that negative eigenvalue, $-0.104$.',
    formal:
      'Let $|\\eta\\rangle$ be the eigenvector of $\\rho^{T_B}$ with eigenvalue $\\lambda_- < 0$. Using $\\mathrm{Tr}(X^{T_B}Y) = \\mathrm{Tr}(X\\,Y^{T_B})$, set $W = (|\\eta\\rangle\\langle\\eta|)^{T_B}$. Then $\\mathrm{Tr}(\\rho W) = \\mathrm{Tr}(\\rho^{T_B}|\\eta\\rangle\\langle\\eta|) = \\lambda_- < 0$ (Eq. 3.27), while $\\mathrm{Tr}(\\rho_sW) = \\mathrm{Tr}(\\rho_s^{T_B}|\\eta\\rangle\\langle\\eta|)\\ge 0$ for separable $\\rho_s$ (Eq. 3.28).',
    caption: '$W = (|\\eta\\rangle\\langle\\eta|)^{T_B}$; $\\langle W\\rangle = -0.104$ here',
    captionFormal: '$\\mathrm{Tr}(\\rho W) = \\lambda_- = -0.104$; $\\ge 0$ on every separable state',
    stage: mx(rhoOf(PB(0.5)), { ptranspose: 'B', spectrum: 'bars', highlight: [[0, 0]] }),
    derivation: {
      result: '\\mathrm{Tr}(\\rho W) = \\lambda_- < 0,\\quad \\mathrm{Tr}(\\rho_sW) \\ge 0',
      ground: [
        {
          tex: '\\rho^{T_B}|\\eta\\rangle = \\lambda_-|\\eta\\rangle,\\quad \\lambda_- < 0',
          why: 'Take the eigenvector of the negative eigenvalue.',
          view: mx(rhoOf(PB(0.5)), { ptranspose: 'B', spectrum: 'bars', highlight: [[0, 0]] }),
          viewCaption: 'the negative bar; its eigenvector is $|\\eta\\rangle$',
        },
        { tex: 'W = (|\\eta\\rangle\\langle\\eta|)^{T_B}', why: 'Flip the projector onto $|\\eta\\rangle$.', view: mx(rhoOf(PB(0.5)), { ptranspose: 'B', spectrum: 'bars', highlight: [[0, 0]] }), viewCaption: 'the negative bar, where $W$ is built from' },
        { tex: '\\mathrm{Tr}(\\rho W) = \\mathrm{Tr}(\\rho^{T_B}|\\eta\\rangle\\langle\\eta|) = \\lambda_- < 0', why: 'Its average on $\\rho$ is the negative eigenvalue.', view: mx(rhoOf(PB(0.5)), { ptranspose: 'B', spectrum: 'bars', highlight: [[0, 0]] }), viewCaption: 'the negative bar, $-0.104$, is $\\mathrm{Tr}(\\rho W)$', claims: [claim('q12WitnessVal', 'the trace reads $-0.104$', () => close(V.q12WitnessVal, -0.1035533905932738, 1e-6))] },
        { tex: '\\mathrm{Tr}(\\rho W) = \\lambda_- < 0,\\quad \\mathrm{Tr}(\\rho_sW) \\ge 0', why: 'Negative here, non-negative on every separable state: a witness.' },
      ],
      formal: [
        { tex: '\\mathrm{Tr}(X^{T_B}Y) = \\mathrm{Tr}(X\\,Y^{T_B}) \\Rightarrow \\mathrm{Tr}(\\rho W) = \\lambda_-', why: 'The transpose-swap identity with $W = (|\\eta\\rangle\\langle\\eta|)^{T_B}$ (Eq. 3.27).', view: mx(rhoOf(PB(0.5)), { blocks: 2 }) },
        { tex: '\\mathrm{Tr}(\\rho W) = \\lambda_- < 0,\\quad \\mathrm{Tr}(\\rho_sW) \\ge 0', why: 'Separable states are PPT (Eq. 3.28), so the sign is negative only here.', view: mx(rhoOf(PB(0.5)), { ptranspose: 'B', spectrum: 'bars', highlight: [[0, 0]] }), viewCaption: 'the negative bar, $-0.104$, is $\\mathrm{Tr}(\\rho W)$' },
      ],
    },
    claims: [
      claim('q12WitnessLamMin', 'the witness’s eigenvalue is $-0.104$', () => close(V.q12WitnessLamMin, -0.1035533905932738, 1e-6)),
      claim('q12WitnessValAbs', 'the witness’s value has size $0.104$', () => close(V.q12WitnessValAbs, 0.1035533905932738, 1e-6)),
    ],
    fidelity: ['qc-matrix-not-a-space'],
  },
  {
    id: 'q12-witness:b3',
    phase: 'clue',
    text: 'Why is $\\langle W\\rangle$ never negative on a separable state?',
    formal: 'Which single fact forces $\\mathrm{Tr}(\\rho_sW)\\ge 0$ for every separable $\\rho_s$?',
    stage: mx(rhoOf(mixSrc([0.5, { ket: '00' }], [0.5, { ket: '+-' }])), {}),
    reveal: {
      text: 'Because a separable state stays positive under the one-sided flip: $\\rho_s^{T_B}\\ge 0$. Sandwiched between $|\\eta\\rangle$ and $\\langle\\eta|$, a positive operator can only give something $\\ge 0$.',
      formal: 'That $\\rho_s^{T_B}\\ge 0$ for separable $\\rho_s$ (the same fact behind PPT). Then $\\mathrm{Tr}(\\rho_sW) = \\langle\\eta|\\rho_s^{T_B}|\\eta\\rangle\\ge 0$. The witness works only because separable states are PPT.',
      caption: 'it rests on $\\rho_s^{T_B}\\ge 0$',
      captionFormal: 'it rests on $\\rho_s^{T_B}\\ge 0$',
      stage: mx(rhoOf(mixSrc([0.5, { ket: '00' }], [0.5, { ket: '+-' }])), { ptranspose: 'B', spectrum: 'bars' }),
      claims: [claim('q12SepPtSpecMin', 'a separable example’s smallest eigenvalue after the flip is still $\\ge 0$', () => V.q12SepPtSpecMin >= -1e-9)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q12-locc — Local moves and a shared coin                                                         */
/* ---------------------------------------------------------------------------------------------- */

const loccUnit: Beat[] = [
  {
    id: 'q12-locc:b1',
    phase: 'books',
    text:
      'Two distant labs, Alice and Bob, share a pair. [[qc-locc|LOCC]] is everything they can do apart, plus a phone line. Each lab may add a fresh qubit, run a gate, measure, or throw a qubit away — and phone the results. They may **not** mail qubits.',
    formal:
      '[[qc-locc|Local operations and classical communication]] (LOCC): each party may append an ancilla, apply unitaries, make [[orthogonal|orthogonal]] measurements, and discard subsystems, coordinating by classical messages (Bergou §3.6.1). Exchanging quantum systems is excluded. LOCC cannot create entanglement from a product state.',
    caption: 'LOCC: local gates, local readings, a phone call — no mailing qubits',
    captionFormal: 'LOCC: append, unitary, measure, discard, plus classical messages',
    stage: circ(C_PROC30, 0, {}),
  },
  {
    id: 'q12-locc:b2',
    phase: 'books',
    text:
      'One Bell pair is the unit of shared entanglement: one [[qc-ebit|ebit]]. From many weakly entangled copies, LOCC can distill fewer near-perfect Bell pairs; and from Bell pairs it can build weaker states. The exchange rate, per copy, is the entanglement of the next unit.',
    formal:
      'A maximally entangled pair is one **ebit**. Entanglement distillation turns $n$ copies of $|\\psi\\rangle$ into $m$ near-perfect Bell pairs by LOCC; dilution runs the reverse. For pure states the limiting ratio $m/n$ in both directions is $E(|\\psi\\rangle) = S(\\rho_A)$ (N&C §12.5.2), tying the measure of Unit 12.5 to a physical rate.',
    caption: 'one Bell pair = one ebit; weak copies distil to fewer strong ones',
    captionFormal: 'ebit; distillation/dilution rate $\\to S(\\rho_A)$ (N&C)',
    stage: amp({ bell: '00+11' }, { mode: 'probability' }),
  },
  {
    id: 'q12-locc:b3',
    phase: 'books',
    text:
      'Here is a concrete LOCC move. Alice holds a tilted pair $\\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$. She adds a blank qubit, runs one gate, and reads it. On a $0$ — chance $0.5$ at $\\theta = 30°$ — the pair is now a perfect Bell state. On a $1$, it collapses to the product $|1\\rangle|00\\rangle$, so she needs a fresh copy to try again.',
    formal:
      'Procrustean distillation (Bergou §3.6.2): for $|\\psi\\rangle = \\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$ ($0\\le\\theta\\le\\tfrac\\pi4$) Alice appends $|0\\rangle_{A\'}$, applies a unitary $U_A$, and measures $A\'$. Outcome $0$ (probability $p_s = 2\\sin^2\\theta = 1 - \\cos2\\theta$) leaves $\\Phi^+$; outcome $1$ leaves $|1\\rangle_{A\'}|00\\rangle_{AB}$ (see Corrections). At $\\theta = 30°$, $p_s = 0.5$.',
    caption: 'add a qubit, one gate, read it: a $0$ (chance $0.5$) gives a Bell pair',
    captionFormal: '$p_s = 2\\sin^2\\theta = 0.5$ at $\\theta = 30°$; success → $\\Phi^+$, failure → $|1\\rangle_{A\'}|00\\rangle$',
    stage: split(circ(C_PROC30, 4, { outcomes: '0' }), amp({ circuit: C_PROC30, upTo: 4, outcomes: '0' }, { mode: 'probability' })),
    derivation: {
      result: 'p_s = 2\\sin^2\\theta,\\ \\text{success} \\to \\Phi^+,\\ \\text{failure} \\to |1\\rangle_{A\'}|00\\rangle',
      ground: [
        {
          tex: '|\\psi\\rangle_{AB}\\otimes|0\\rangle_{A\'} = \\cos\\theta|00\\rangle|0\\rangle + \\sin\\theta|11\\rangle|0\\rangle',
          why: 'Alice adds a blank qubit.',
          view: amp({ circuit: C_PROC30, upTo: 2 }, { mode: 'probability' }),
          viewCaption: 'before $U_A$: two bars',
        },
        {
          tex: 'U_A|00\\rangle_{AA\'} = \\tan\\theta|00\\rangle + \\sqrt{1 - \\tan^2\\theta}\\,|01\\rangle,\\quad U_A|10\\rangle = |10\\rangle',
          why: 'One local gate, acting only when Alice’s bit is $0$.',
          view: circ(C_PROC30, 3, {}),
          viewCaption: '$U_A$ applied',
        },
        {
          tex: '= \\sqrt2\\sin\\theta\\,|0\\rangle_{A\'}\\,\\Phi^+ + \\sqrt{1-2\\sin^2\\theta}\\,|1\\rangle_{A\'}|00\\rangle_{AB}',
          why: 'Regroup: the $A\'$ bit now tags success from failure.',
          view: amp({ circuit: C_PROC30, upTo: 3 }, { mode: 'probability' }),
          viewCaption: 'two branches, tagged by $A\'$',
        },
        {
          tex: 'p(0) = 2\\sin^2\\theta = 0.5,\\quad \\text{leaves } \\Phi^+',
          why: 'Read $A\'$: a $0$ (chance $0.5$ at $\\theta = 30°$) leaves a Bell pair.',
          view: amp({ circuit: C_PROC30, upTo: 4, outcomes: '0' }, { mode: 'probability' }),
          viewCaption: 'the success branch: $\\Phi^+$',
          claims: [claim('q12ProcPs30', 'the success chance is $0.5$', () => close(V.q12ProcPs30, 0.5))],
        },
        { tex: 'p_s = 2\\sin^2\\theta,\\ \\text{success} \\to \\Phi^+,\\ \\text{failure} \\to |1\\rangle_{A\'}|00\\rangle', why: 'Succeed with chance $2\\sin^2\\theta$; otherwise retry.' },
      ],
      formal: [
        {
          tex: '(U_A\\otimes I)(|\\psi\\rangle_{AB}|0\\rangle_{A\'}) = \\sqrt2\\sin\\theta|0\\rangle_{A\'}\\Phi^+ + \\sqrt{1-2\\sin^2\\theta}|1\\rangle_{A\'}|00\\rangle',
          why: 'The protocol’s single step.',
          view: circ(C_PROC30, 3, {}),
        },
        {
          tex: 'p_s = 2\\sin^2\\theta,\\ \\text{success} \\to \\Phi^+,\\ \\text{failure} \\to |1\\rangle_{A\'}|00\\rangle',
          why: 'Outcome $0$ (chance $2\\sin^2\\theta = 1 - \\cos2\\theta$) keeps $\\Phi^+$; outcome $1$ leaves $|1\\rangle_{A\'}|00\\rangle$ (see Corrections).',
          view: amp({ circuit: C_PROC30, upTo: 4, outcomes: '0' }, { mode: 'probability' }),
        },
      ],
    },
    claims: [
      claim('q12ProcSuccessFidToPhiPlus', 'the success branch is exactly $\\Phi^+$', () => close(V.q12ProcSuccessFidToPhiPlus, 1, 1e-6)),
      claim('q12ProcFailFidToKet00', 'the failure branch is exactly $|00\\rangle$', () => close(V.q12ProcFailFidToKet00, 1, 1e-6)),
    ],
    fidelity: ['qc-circuit-engine-state'],
  },
  {
    id: 'q12-locc:b4',
    phase: 'clue',
    text: 'Run the Procrustean step on a pair that is already maximally entangled, $\\theta = 45°$. What is the success chance?',
    formal: 'Evaluate the Procrustean success probability $p_s = 2\\sin^2\\theta$ at $\\theta = 45°$.',
    stage: circ(C_PROC45, 2, {}),
    reveal: {
      text: 'It is $1$: the step always succeeds, because there is nothing left to distil. A Bell pair is the fixed point.',
      formal: '$p_s = 2\\sin^2 45° = 1$. The protocol keeps the pair with certainty: a maximally entangled state is already distilled, so no copies are thrown away.',
      caption: '$\\theta = 45°$: $p_s = 1$, always kept',
      captionFormal: '$\\theta = 45°$: $p_s = 1$, always kept',
      stage: amp({ circuit: C_PROC45, upTo: 4, outcomes: '0' }, { mode: 'probability' }),
      claims: [claim('q12ProcPs45', 'the success chance is $1$', () => close(V.q12ProcPs45, 1, 1e-6))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q12-entropy — Entanglement as a number                                                           */
/* ---------------------------------------------------------------------------------------------- */

const entropyUnit: Beat[] = [
  {
    id: 'q12-entropy:b1',
    phase: 'lecture',
    text: `Here is a new number for a pair. The [[qc-conditional-entropy|conditional entropy]] $S(A|B) = S(AB) - S(B)$ is the [[qc-von-neumann-entropy|entropy]] of the whole pair minus the entropy of Bob's half, <<qc-q9-entropy|the entropy of Chapter Q9>>. For a classical pair it is never negative. So a negative value proves entanglement, in this one direction only: zero or more proves nothing. For a pure pair it is $-S(B)$. A Bell pair gives $-1$ bit, and our tilted pair $\\cos30°|00\\rangle + \\sin30°|11\\rangle$ gives $-${d(Math.abs(V.q12CondPure30), 3)}$ bit. A coin pair, half $|00\\rangle$ and half $|11\\rangle$, gives 0.`,
    formal: `The conditional entropy is $S(A|B) = S(\\rho_{AB}) - S(\\rho_B)$ (notes Eq. 3.33). For a classical joint distribution $S(A|B) \\ge 0$, so $S(A|B) < 0$ certifies entanglement (Eq. 3.34), while $S(A|B) \\ge 0$ certifies nothing. For a pure pair $S(AB) = 0$, so $S(A|B) = -S(\\rho_B)$: $-1$ bit for a Bell state, $-${d(Math.abs(V.q12CondPure30), 3)}$ bit for the tilted pair $\\cos30°|00\\rangle + \\sin30°|11\\rangle$, and 0 for the coin pair. Rosetta: here $S$ is always the entropy with an argument; Chapter Q10 keeps $S$ for the CHSH score.`,
    caption: `pair minus Bob's half: Bell $-1$ bit, tilted $-${d(Math.abs(V.q12CondPure30), 3)}$ bit`,
    captionFormal: '$S(A|B) = S(AB) - S(B)$; negative only if entangled',
    stage: split(mx({ rho: { ket: PSI(30) } }, { partialTrace: 'B', spectrum: 'entropy' }), tq(PSI_FAMILY(30), { readouts: ['entropy'] })),
    claims: [
      claim('q12CondBell', 'a Bell pair has $S(A|B) = -1$ bit', () => close(V.q12CondBell, -1, 1e-9)),
      claim('q12CondPure30', 'the tilted pair has $S(A|B) = -S(\\rho_B) = -0.811$ bit', () => close(V.q12CondPure30, -V.q12E30, 1e-9)),
      claim('q12CondCoin', 'a coin pair has $S(A|B) = 0$', () => close(V.q12CondCoin, 0, 1e-9)),
    ],
  },
  {
    id: 'q12-entropy:b2',
    phase: 'books',
    text:
      'Chapter Q9 measured a pure pair’s entanglement by the [[qc-entanglement-entropy|entropy]] of one half, $E = S(\\rho_A)$. For $\\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$ the reduced state is $\\mathrm{diag}(\\cos^2\\theta, \\sin^2\\theta)$, so $E = h(\\cos^2\\theta)$, with $h(x) = -x\\log_2x - (1-x)\\log_2(1-x)$. At $\\theta = 30°$ that is $0.811$ bit.',
    formal:
      'For a pure bipartite state, the entanglement is $E(|\\psi\\rangle_{AB}) = S(\\rho_A) = S(\\rho_B)$ (Chapter Q9; Bergou Eq. 3.41). For $|\\psi(\\theta)\\rangle = \\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$, $\\rho_A = \\mathrm{diag}(\\cos^2\\theta, \\sin^2\\theta)$ and $E = h(\\cos^2\\theta)$, $h(x) = -x\\log_2x - (1-x)\\log_2(1-x)$ the binary entropy; at $\\theta = 30°$, $E = 0.811$ bit.',
    caption: '$E = S(\\rho_A) = 0.811$ bit at $\\theta = 30°$',
    captionFormal: '$E = h(\\cos^2\\theta) = 0.811$ bit, $\\theta = 30°$',
    stage: split(mx({ coef: PSI(30) }, { svd: true }), tq(PSI_FAMILY(30), { readouts: ['entropy'] })),
    claims: [
      claim('q12SchmidtLam30Large', 'its larger Schmidt weight is $0.75$', () => close(V.q12SchmidtLam30Large, 0.75)),
      claim('q12SchmidtLam30Small', 'the smaller is $0.25$', () => close(V.q12SchmidtLam30Small, 0.25)),
      claim('q12E30', '$E = 0.811$ bit', () => close(V.q12E30, 0.8112781244591328, 1e-6)),
    ],
  },
  {
    id: 'q12-entropy:b3',
    phase: 'books',
    text:
      'What makes $E$ a fair measure? First, local turns leave it alone. Rotate Alice’s qubit with any one-qubit gate: her reduced state’s eigenvalues do not move, so $E$ is unchanged. Entanglement is not something one lab owns.',
    formal:
      'Good entanglement measures are invariant under local unitaries: for $|\\psi\'\\rangle = (U_A\\otimes U_B)|\\psi\\rangle$, $\\rho_A\' = U_A\\rho_AU_A^\\dagger$, so by the cyclic property of the trace $S(\\rho_A\') = S(\\rho_A)$ (Bergou §3.7.1). A local change of basis cannot change how entangled the pair is.',
    caption: 'a local gate leaves $E$ unchanged: $0.811$ before and after',
    captionFormal: '$S(U_A\\rho_AU_A^\\dagger) = S(\\rho_A)$: $E$ is local-unitary invariant',
    stage: split(mx({ rho: { ket: PSI(30) } }, { partialTrace: 'B', spectrum: 'entropy' }), tq(PSI_FAMILY(30), { local: [{ qubit: 0, gate: 'H' }], readouts: ['entropy'] })),
    derivation: {
      result: 'S(U_A\\rho_AU_A^\\dagger) = S(\\rho_A)',
      ground: [
        { tex: 'E = S(\\rho_A),\\quad \\rho_A = \\mathrm{diag}(\\cos^2\\theta, \\sin^2\\theta)', why: 'The entanglement is the entropy of one half.', view: mx({ rho: { ket: PSI(30) } }, { partialTrace: 'B', spectrum: 'entropy' }), viewCaption: '$\\rho_A$: $S = 0.811$ bit' },
        { tex: '|\\psi\'\\rangle = (U_A\\otimes I)|\\psi\\rangle \\Rightarrow \\rho_A\' = U_A\\rho_AU_A^\\dagger', why: 'Turn Alice’s qubit with any one-qubit gate.', view: tq(PSI_FAMILY(30), { local: [{ qubit: 0, gate: 'H' }], readouts: ['entropy'] }), viewCaption: 'after $H$ on A: same $S$' },
        { tex: 'S(U_A\\rho_AU_A^\\dagger) = S(\\rho_A)', why: 'Conjugation leaves the eigenvalues, hence $S$, unchanged.', view: mx({ rho: { ket: PSI(30) } }, { partialTrace: 'B', spectrum: 'entropy' }), viewCaption: 'same bars: $0.811$ bit' },
      ],
      formal: [
        { tex: '\\rho_A\' = U_A\\rho_AU_A^\\dagger,\\quad S(\\rho) = -\\mathrm{Tr}(\\rho\\log_2\\rho)', why: 'A local unitary conjugates the reduced state.', view: tq(PSI_FAMILY(30), { local: [{ qubit: 0, gate: 'H' }], readouts: ['entropy'] }) },
        { tex: 'S(\\rho_A\') = S(\\rho_A)', why: 'The spectrum is conjugation-invariant (cyclic trace); $E$ is a local-unitary invariant.', view: mx({ rho: { ket: PSI(30) } }, { partialTrace: 'B', spectrum: 'entropy' }) },
      ],
    },
    claims: [claim('q12E30Local', 'after $H$ on A, $E$ is still $0.811$ bit', () => close(V.q12E30Local, 0.8112781244591328, 1e-6))],
    fidelity: ['qc-tq-local-arrows'],
  },
  {
    id: 'q12-entropy:b4',
    phase: 'books',
    text:
      'Two more properties. $E$ is additive: two independent pairs hold the sum. And the average $E$ can never grow under LOCC — local moves and a phone call cannot manufacture entanglement. That is why it is a true resource.',
    formal:
      'The entanglement is additive, $E(|\\psi\\rangle\\otimes|\\psi\'\\rangle) = E(|\\psi\\rangle) + E(|\\psi\'\\rangle)$ (Bergou §3.7.1). Its average cannot increase under LOCC, $\\sum_kp_kE(|\\psi^{(k)}\\rangle)\\le E(|\\psi\\rangle)$ (Eq. 3.58); N&C state this as majorization, $|\\psi\\rangle\\to|\\varphi\\rangle$ by LOCC iff $\\lambda_\\psi\\prec\\lambda_\\varphi$ (N&C, quoted, not proved here).',
    caption: 'additive; never grows under LOCC — a real resource',
    captionFormal: 'additive; $\\overline E$ non-increasing under LOCC (Eq. 3.58; N&C majorization)',
    stage: mx({ kron: [RHO_A_30, RHO_A_30] }, { spectrum: 'entropy' }),
    claims: [claim('q12Eadd', 'two independent copies hold $1.622$ bit, twice $E$', () => close(V.q12Eadd, 1.6225562489182656, 1e-6))],
  },
  {
    id: 'q12-entropy:b5',
    phase: 'books',
    text:
      'For a mixed pair, $E = S(\\rho_A)$ fails: a classical mixture of products has a mixed $\\rho_A$ but no entanglement. The fix is the **entanglement of formation**: the smallest average entanglement over all ways to write $\\rho$ as a mixture of pure states.',
    formal:
      'For mixed $\\rho_{AB}$, $S(\\rho_A)$ is not a valid measure (a separable $\\rho$ can have mixed marginals). The [[qc-entanglement-of-formation|entanglement of formation]] takes the infimum over pure-state decompositions, $E_F(\\rho) = \\inf\\sum_kp_kE(|\\psi^{(k)}\\rangle)$ (Bergou Eq. 3.60, corrected). It is generally hard to compute — but for two qubits Unit 12.6 gives it in closed form.',
    caption: 'mixed pairs: the entanglement of formation, the cheapest recipe',
    captionFormal: '$E_F(\\rho) = \\inf\\sum_kp_kE(|\\psi^{(k)}\\rangle)$ (Eq. 3.60)',
    stage: split(tq({ rho: WER(0.5) }), mx(rhoOf(WER(0.5)), { partialTrace: 'B', spectrum: 'entropy' })),
    claims: [claim('q12WernerSA', 'the Werner state’s reduced state has $S(\\rho_A) = 1$ bit, yet it is entangled', () => close(V.q12WernerSA, 1, 1e-6))],
  },
  {
    id: 'q12-entropy:b6',
    phase: 'clue',
    text: 'What is $E$ for a product state, and for a Bell state?',
    formal: 'Evaluate $E = S(\\rho_A)$ for a product state and for a Bell state.',
    stage: mx({ coef: { ket: '00' } }, { svd: true }),
    reveal: {
      text: 'A product state has $E = 0$: its half is pure. A Bell state has $E = 1$ bit: its half is the fully mixed coin. Those are the floor and the ceiling for a qubit pair.',
      formal: 'Product: $\\rho_A$ pure, $E = 0$. Bell: $\\rho_A = \\tfrac12I$, $E = \\log_22 = 1$ bit, the maximum for two qubits. Entanglement runs from $0$ to $\\log_2d$.',
      caption: 'product $E = 0$; Bell $E = 1$ bit',
      captionFormal: 'product $E = 0$; Bell $E = 1$ bit',
      stage: mx({ rho: { ket: { bell: 'Phi+' } } }, { partialTrace: 'B', spectrum: 'entropy' }),
      claims: [claim('q12Eprod', 'the product has $E = 0$', () => close(V.q12Eprod, 0, 1e-9)), claim('q12Ebell', 'the Bell state has $E = 1$', () => close(V.q12Ebell, 1, 1e-6)), cHalf],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q12-concurrence — Concurrence: one formula for two qubits                                        */
/* ---------------------------------------------------------------------------------------------- */

const concurrenceUnit: Beat[] = [
  {
    id: 'q12-concurrence:b1',
    phase: 'lecture',
    introduces: ['qc-concurrence'],
    text: 'For a pure pair, flip the state: conjugate every amplitude, then apply $\\sigma_y$ to each qubit. The result is the **tilde state** $\\tilde\\psi$. The [[qc-concurrence|concurrence]] is the overlap of the state with its own flip, $C = |\\langle\\psi|\\tilde\\psi\\rangle|$. The conjugation matters. Take $(|01\\rangle - i|10\\rangle)/\\sqrt2$, a maximally entangled pair. With the conjugation $C = 1$; without it $C = 0$. The mistake hides whenever the amplitudes are real.',
    formal:
      'Define $|\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle$, the complex conjugate taken in the standard basis, and $C(\\psi) = |\\langle\\psi|\\tilde\\psi\\rangle|$ (notes p. 50, just before Eq. 3.16; Bergou Eqs. 3.65–3.66). The conjugation is not optional. For $|\\psi\\rangle = (|01\\rangle - i|10\\rangle)/\\sqrt2$ the overlap with $(\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle$ is 1, while with $(\\sigma_y\\otimes\\sigma_y)|\\psi\\rangle$ it is 0. Real amplitudes cannot tell the two apart.',
    caption: '$C = |\\langle\\psi|\\tilde\\psi\\rangle|$: $(|01\\rangle - i|10\\rangle)/\\sqrt2$ has $C = 1$ with the conjugation, 0 without',
    captionFormal: '$|\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle$; without $*$ the overlap is 0',
    stage: split(amp(CONJ), tq({ ket: CONJ }, { readouts: ['concurrence'] })),
    claims: [
      claim('q12ConjC', 'with the conjugation $C = 1$', () => close(V.q12ConjC, 1, 1e-9)),
      claim('q12ConjCNo', 'without the conjugation the overlap is 0', () => close(V.q12ConjCNo, 0, 1e-9)),
    ],
  },
  {
    id: 'q12-concurrence:b2',
    phase: 'lecture',
    text: `Write a pure pair as $\\sum_{jk}\\Lambda_{jk}|jk\\rangle$ with $\\Lambda$ its table of four amplitudes. Flipping the state reshuffles the table, and the overlap with the flip comes out as $C = 2|\\Lambda_{00}\\Lambda_{11} - \\Lambda_{01}\\Lambda_{10}|$, twice the size of the determinant. A product has determinant 0. For the pair on stage, $\\Lambda = \\mathrm{diag}(0.6, 0.8)$, this gives ${d(V.q12ConcLambda, 2)}. Wootters' general recipe, later in this unit, gives the same number.`,
    formal: `With $|\\psi\\rangle = \\sum_{jk}\\Lambda_{jk}|jk\\rangle$ one finds $|\\tilde\\psi\\rangle = -\\Lambda_{11}^*|00\\rangle + \\Lambda_{10}^*|01\\rangle + \\Lambda_{01}^*|10\\rangle - \\Lambda_{00}^*|11\\rangle$ and $\\langle\\psi|\\tilde\\psi\\rangle = -2(\\Lambda_{00}\\Lambda_{11} - \\Lambda_{01}\\Lambda_{10})^*$ (notes Eq. 3.18 states the result; the calculation is ours, since the notes leave it to Homework 3). So $C = |\\langle\\psi|\\tilde\\psi\\rangle| = 2|\\det\\Lambda|$, and Wootters' general recipe, later in this unit, gives the same number. The stage's pair, $\\Lambda = \\mathrm{diag}(0.6, 0.8)$, gives ${d(V.q12ConcLambda, 2)}. Rosetta: the notes' $\\Lambda$ is this chapter's coefficient matrix $A_{jk}$.`,
    caption: `$C = 2|\\det\\Lambda| = ${d(V.q12ConcLambda, 2)}$ for the pair on stage`,
    captionFormal: '$C = |\\langle\\psi|\\tilde\\psi\\rangle| = 2|\\Lambda_{00}\\Lambda_{11} - \\Lambda_{01}\\Lambda_{10}|$',
    stage: split(amp(PSI_L), mx({ coef: PSI_L }, { svd: true })),
    derivation: {
      result: 'C = 2\\,|\\Lambda_{00}\\Lambda_{11} - \\Lambda_{01}\\Lambda_{10}|',
      ground: [
        { tex: '|\\psi\\rangle = \\sum_{jk}\\Lambda_{jk}|jk\\rangle,\\quad |\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle', why: 'Write the pair with its table of amplitudes, and flip it.', view: amp(PSI_L), viewCaption: 'the pair on stage' },
        {
          tex: '|\\tilde\\psi\\rangle = -\\Lambda_{11}^*|00\\rangle + \\Lambda_{10}^*|01\\rangle + \\Lambda_{01}^*|10\\rangle - \\Lambda_{00}^*|11\\rangle',
          why: 'Conjugate the amplitudes; then $\\sigma_y\\otimes\\sigma_y$ sends $|00\\rangle \\to -|11\\rangle$, $|01\\rangle \\to |10\\rangle$, $|10\\rangle \\to |01\\rangle$ and $|11\\rangle \\to -|00\\rangle$.',
        },
        {
          tex: '\\langle\\psi|\\tilde\\psi\\rangle = -2\\,(\\Lambda_{00}\\Lambda_{11} - \\Lambda_{01}\\Lambda_{10})^*',
          why: 'Multiply each amplitude of the state by the matching entry of the flip and add: two pairs of terms agree.',
          view: mx({ coef: PSI_L }, { svd: true }),
          viewCaption: 'the table $\\Lambda$ and its Schmidt weights',
        },
        { tex: 'C = |\\langle\\psi|\\tilde\\psi\\rangle| = 2\\,|\\Lambda_{00}\\Lambda_{11} - \\Lambda_{01}\\Lambda_{10}|', why: 'The concurrence is the size of this overlap, so it is twice the size of the determinant.' },
      ],
      formal: [
        {
          tex: '|\\tilde\\psi\\rangle = (-\\Lambda_{11}^*, \\Lambda_{10}^*, \\Lambda_{01}^*, -\\Lambda_{00}^*)',
          why: 'Conjugate, then apply $\\sigma_y\\otimes\\sigma_y$ (Bergou Eq. 3.65).',
          view: amp(PSI_L),
        },
        { tex: '\\langle\\psi|\\tilde\\psi\\rangle = -2\\,(\\Lambda_{00}\\Lambda_{11} - \\Lambda_{01}\\Lambda_{10})^*', why: 'Pair the terms of the overlap.', view: mx({ coef: PSI_L }, { svd: true }) },
        { tex: 'C = 2\\,|\\Lambda_{00}\\Lambda_{11} - \\Lambda_{01}\\Lambda_{10}|', why: 'By definition $C$ is the size of this overlap: twice the determinant.' },
      ],
    },
    claims: [
      claim('q12LamDiag0', 'the pair on stage has $\\Lambda_{00} = 0.6$', () => close(V.q12LamDiag0, 0.6, 1e-9)),
      claim('q12LamDiag1', 'and $\\Lambda_{11} = 0.8$', () => close(V.q12LamDiag1, 0.8, 1e-9)),
      claim('q12ConcLambda', 'for $\\Lambda = \\mathrm{diag}(0.6, 0.8)$, $C = 2|\\det\\Lambda| = 0.96$', () => close(V.q12ConcLambda, 0.96, 1e-9)),
    ],
  },
  {
    id: 'q12-concurrence:b3',
    phase: 'books',
    text:
      'Bergou reaches the same quantity by the same flip, in the book’s notation: the tilde state above and $C = |\\langle\\psi|\\tilde\\psi\\rangle|$. For our tilted pair this [[qc-concurrence|concurrence]] is $0.866$.',
    formal:
      'Bergou writes the same spin flip, $|\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle$ (Eq. 3.65), and the same [[qc-concurrence|concurrence]] $C(|\\psi\\rangle) = |\\langle\\psi|\\tilde\\psi\\rangle|$ (Eq. 3.66), as in the opening beat. A single qubit is orthogonal to its own flip, which is why this measures a two-body property. For our tilted pair $C = 0.866$.',
    caption: 'flip the state with $\\sigma_y\\otimes\\sigma_y$; $C = |\\langle\\psi|\\tilde\\psi\\rangle|$',
    captionFormal: '$|\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle$; $C = |\\langle\\psi|\\tilde\\psi\\rangle|$',
    stage: split(mx({ pauli: 'YY' }, {}), tq(PSI_FAMILY(30))),
    claims: [claim('q12ConcPure30', 'the tilted pair has concurrence $0.866$', () => close(V.q12ConcPure30, Math.sqrt(3) / 2, 1e-6))],
  },
  {
    id: 'q12-concurrence:b4',
    phase: 'books',
    text:
      'For a pure pair this comes out beautifully: $C = 2\\sqrt{\\lambda_1\\lambda_2}$, twice the geometric mean of the Schmidt weights, which are the squares of the Schmidt coefficients. For $\\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$ that is $\\sin2\\theta$ — $0.866$ at $\\theta = 30°$. It is also $2|\\det A_{jk}|$, with $A_{jk}$ the state’s coefficient matrix.',
    formal:
      'With Schmidt weights $\\lambda_1, \\lambda_2$ ($\\lambda_1 + \\lambda_2 = 1$), $C = 2\\sqrt{\\lambda_1\\lambda_2}$ (Bergou Eq. 3.68): $0$ for a product, $1$ when $\\lambda_1 = \\lambda_2 = \\tfrac12$. For $|\\psi(\\theta)\\rangle$ this is $\\sin2\\theta = 0.866$ at $\\theta = 30°$. Equivalently $C = 2|\\det A|$ with $A_{jk}$ the coefficient matrix (⚑ Problem 3.6, cited).',
    caption: '$C = 2\\sqrt{\\lambda_1\\lambda_2} = \\sin2\\theta = 0.866$ here',
    captionFormal: '$C = 2\\sqrt{\\lambda_1\\lambda_2} = \\sin2\\theta = 2|\\det A| = 0.866$',
    stage: split(mx({ coef: PSI(30) }, { svd: true }), tq(PSI_FAMILY(30))),
    derivation: {
      result: 'C = 2\\sqrt{\\lambda_1\\lambda_2} = \\sin2\\theta = 2|\\det A|',
      ground: [
        { tex: '|\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle', why: 'The spin-flipped state.', view: mx({ pauli: 'YY' }, {}), viewCaption: 'the flip operator $\\sigma_y\\otimes\\sigma_y$' },
        { tex: 'C = |\\langle\\psi|\\tilde\\psi\\rangle| = 2\\sqrt{\\lambda_1\\lambda_2}', why: 'The overlap with the flip is twice the geometric mean of the Schmidt weights.', view: mx({ coef: PSI(30) }, { svd: true }), viewCaption: 'Schmidt coefficients $0.866, 0.5$; squared, the weights $0.75, 0.25$' },
        { tex: '= \\sin2\\theta = 0.866\\ (\\theta = 30°)', why: 'For our tilted pair.', view: tq(PSI_FAMILY(30)), viewCaption: 'the tilted pair’s correlations' },
        { tex: 'C = 2\\sqrt{\\lambda_1\\lambda_2} = \\sin2\\theta = 2|\\det A|', why: 'And equals twice the determinant of the coefficient matrix.', view: mx({ coef: PSI(30) }, { highlight: [[0, 0], [1, 1]] }), viewCaption: '$2|\\det A| = 0.866$' },
      ],
      formal: [
        { tex: 'C = |\\langle\\psi|\\tilde\\psi\\rangle| = 2\\sqrt{\\lambda_1\\lambda_2}', why: 'From the Schmidt form (Eq. 3.68).', view: mx({ coef: PSI(30) }, { svd: true }) },
        { tex: 'C = 0.866 = \\sin2\\theta = 2|\\det A|', why: 'Equivalent to $2|\\det A|$, $A_{jk}$ the coefficient matrix (⚑ Problem 3.6, cited).', view: tq(PSI_FAMILY(30)) },
      ],
    },
    claims: [claim('q12TwoDetA', '$2|\\det A| = 0.866$', () => close(V.q12TwoDetA, Math.sqrt(3) / 2, 1e-6)), cHalf],
    fidelity: ['qc-tq-grid-signed'],
  },
  {
    id: 'q12-concurrence:b5',
    phase: 'books',
    text:
      'Concurrence and entropy carry the same information. A fixed, increasing function turns one into the other: $E = h\\!\\big((1 + \\sqrt{1 - C^2})/2\\big)$. At $C = 0.866$ it returns $0.811$ bit — exactly the entanglement entropy of Unit 12.5 for this same pair.',
    formal:
      'The entanglement is a monotone function of $C$: $E(C) = h\\!\\big(\\tfrac{1 + \\sqrt{1 - C^2}}2\\big)$ with $h$ the binary entropy (Bergou Eqs. 3.69–3.71). At $C = 0.866$, $E(C) = 0.811$ bit, matching $S(\\rho_A)$ from Unit 12.5 — concurrence and entropy are two faces of one quantity for pure states. Rosetta: the notes write $E(x)$ and $h(x)$ (Eq. 3.17); here $E(C)$ is the entanglement from the concurrence and $h$ is the binary entropy.',
    caption: '$E(C) = 0.811$ bit at $C = 0.866$: same as the entropy',
    captionFormal: '$E(C) = h\\!\\big(\\tfrac{1+\\sqrt{1-C^2}}2\\big) = 0.811$ bit',
    stage: split(mx({ coef: PSI(30) }, { svd: true }), tq(PSI_FAMILY(30), { readouts: ['entropy'] })),
    claims: [claim('q12EofC30', '$E(C) = 0.811$ bit, matching $E$', () => close(V.q12EofC30, V.q12E30, 1e-6))],
    fidelity: ['qc-matrix-trace-engine'],
  },
  {
    id: 'q12-concurrence:b6',
    phase: 'books',
    text:
      'For a mixed two-qubit state there is still a formula. Wootters: build $\\tilde\\rho$ by conjugating every entry of $\\rho$, then applying $\\sigma_y\\otimes\\sigma_y$ on both sides. List the square-root eigenvalues of $\\rho\\tilde\\rho$ in order, then $C = \\max(0,\\ \\lambda_1 - \\lambda_2 - \\lambda_3 - \\lambda_4)$. For the Werner state this gives $0.25$ at $w = \\tfrac12$ — matching the PPT verdict.',
    formal:
      'For mixed $\\rho$, let $\\lambda_1\\ge\\dots\\ge\\lambda_4$ (a different, four-entry list from Unit 12.6’s earlier Schmidt $\\lambda_1,\\lambda_2$) be the square roots of the eigenvalues of $\\rho\\tilde\\rho$, $\\tilde\\rho = (\\sigma_y\\otimes\\sigma_y)\\rho^*(\\sigma_y\\otimes\\sigma_y)$. Then $C(\\rho) = \\max(0, \\lambda_1 - \\lambda_2 - \\lambda_3 - \\lambda_4)$ (Eq. 3.76). The [[qc-negativity|negativity]] $N(\\rho) = \\sum_j|\\lambda_j^-|$ sums the negative eigenvalues of $\\rho^{T_B}$ (Eqs. 3.77–3.79). For the Werner state $C = (3w-1)/2 = 0.25$ at $w = \\tfrac12$.',
    caption: 'Wootters: $C = \\max(0, \\lambda_1 - \\lambda_2 - \\lambda_3 - \\lambda_4) = 0.25$ for Werner',
    captionFormal: 'negativity sums $|\\lambda_j^-|$ of $\\rho^{T_B}$; Wootters gives $C = 0.25$ for Werner at $w=\\tfrac12$',
    stage: split(tq({ rho: WER(0.5) }, { readouts: ['concurrence'] }), mx(rhoOf(WER(0.5)), { ptranspose: 'B', spectrum: 'bars' })),
    claims: [
      claim('q12WerConcAtHalf', 'the Werner state at $w = \\tfrac12$ has concurrence $0.25$', () => close(V.q12WerConcAtHalf, 0.25, 1e-6)),
      claim('q12WerPptAtHalf', 'and $\\lambda_{\\min}(\\rho^{T_B}) = -0.125$', () => close(V.q12WerPptAtHalf, -0.125, 1e-6)),
      cHalf,
    ],
    fidelity: ['qc-tq-not-two-places'],
  },
  {
    id: 'q12-concurrence:b7',
    phase: 'clue',
    text: 'The Werner state is entangled for $w > \\tfrac13$. What is its concurrence right at $w = \\tfrac13$?',
    formal: 'Evaluate the Werner concurrence $C = \\max(0, (3w-1)/2)$ at $w = \\tfrac13$.',
    stage: tq({ rho: WER(V.q12Third) }),
    reveal: {
      text: 'Zero. At $w = \\tfrac13$ the state sits exactly on the edge between separable and entangled, so there is no entanglement to measure. Above it, $C$ climbs.',
      formal: '$C = \\max(0, 0) = 0$: the concurrence vanishes at the separability threshold $w = \\tfrac13$, the same point where $\\lambda_{\\min}(\\rho^{T_B})$ changes sign. The two criteria agree exactly.',
      caption: '$w = \\tfrac13$: $C = 0$, the boundary',
      captionFormal: '$w = \\tfrac13$: $C = 0$, the boundary',
      stage: mx(rhoOf(WER(V.q12Third)), { ptranspose: 'B', spectrum: 'bars' }),
      claims: [claim('q12WerConcAtThird', 'at $w = \\tfrac13$, $C = 0$', () => close(V.q12WerConcAtThird, 0, 1e-9)), cThird],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q12-family — One family, four tests (notes L10 pp. 49-55, Eqs. 3.12-3.15, 3.19-3.21, 3.27, 3.35)  */
/* ---------------------------------------------------------------------------------------------- */

const familyUnit: Beat[] = [
  {
    id: 'q12-family:b1',
    phase: 'lecture',
    text: `Take the [[qc-alpha-family|family]] $\\rho(\\alpha) = \\alpha|S\\rangle\\langle S| + \\tfrac{1-\\alpha}2\\big(|00\\rangle\\langle00| + |11\\rangle\\langle11|\\big)$. It puts weight $\\alpha$ on the singlet $|S\\rangle$ (this chapter's $\\Psi^-$; N&C: $\\beta_{11}$) and spreads the rest over two aligned pairs. Whatever $\\alpha$ is, each half alone sits at the centre of its ball, <<qc-q8-ball|the point of complete ignorance>>. So single-qubit data cannot reveal $\\alpha$. Here $\\alpha$ is a weight; in Chapter Q10's first unit it was an amplitude.`,
    formal: `The [[qc-alpha-family|family]] $\\rho(\\alpha) = \\alpha|S\\rangle\\langle S| + \\tfrac{1-\\alpha}2(|00\\rangle\\langle00| + |11\\rangle\\langle11|)$, $0 \\le \\alpha \\le 1$, is real and has $\\rho_A = \\rho_B = \\tfrac12I$ for every $\\alpha$ (notes Eqs. 3.12–3.14), so local data are blind to $\\alpha$. Rosetta: $|S\\rangle$ is the singlet $\\Psi^-$ (N&C: $\\beta_{11}$), and $\\alpha$ is a mixing weight here, an amplitude in the notes' Eq. 3.1 and Chapter Q10.`,
    caption: 'weight $\\alpha$ on the singlet; both halves at the centre',
    captionFormal: '$\\rho_A = \\rho_B = \\tfrac12I$ for every $\\alpha$',
    stage: split(mx(rhoOf(FAM(0.6)), { blocks: 2 }), tq({ rho: FAM(0.6) })),
    claims: [claim('q12FamRA', 'each half of the family sits at the centre of the ball: $|\\vec r| = 0$', () => close(V.q12FamRA, 0, 1e-9))],
  },
  {
    id: 'q12-family:b2',
    phase: 'lecture',
    text: `Read the middle block: $F_{\\text{coh}} = \\alpha$, so the family passes ½ exactly when $\\alpha > \\tfrac12$. Now flip Bob's index and take eigenvalues. They are $\\alpha/2$, $\\alpha/2$, $\\tfrac12$ and $\\tfrac12 - \\alpha$. The last turns negative exactly when $\\alpha > \\tfrac12$. At $\\alpha = ${d(V.q12FamF06, 1)}$ the smallest is $-${d(V.q12FamSigMin06, 1)}$, and at ${d(V.q12FamF08, 1)} it is $-${d(V.q12FamSigMin08, 1)}$. The product of the four is negative, of size ${d(V.q12FamDet06, 4)}, at ${d(V.q12FamF06, 1)}.`,
    formal: `For the family $F_{\\text{coh}} = \\alpha$ and $\\rho^{T_B}$ has eigenvalues $\\alpha/2, \\alpha/2, \\tfrac12, \\tfrac12 - \\alpha$ (notes Eq. 3.15 and Eq. 3.27), so $\\det\\rho^{T_B} = \\alpha^2(1-2\\alpha)/16$. Both criteria flip at $\\alpha = \\tfrac12$. At $\\alpha = ${d(V.q12FamF06, 1)}$ the smallest eigenvalue is $-${d(V.q12FamSigMin06, 1)}$ and the determinant is negative, of size ${d(V.q12FamDet06, 4)}; at ${d(V.q12FamF08, 1)} the smallest is $-${d(V.q12FamSigMin08, 1)}$.`,
    caption: `$F_{\\text{coh}} = \\alpha$; $\\lambda_{\\min}(\\rho^{T_B}) = \\tfrac12 - \\alpha$: $-${d(V.q12FamSigMin06, 1)}$ at ${d(V.q12FamF06, 1)}`,
    captionFormal: '$F_{\\text{coh}} = \\alpha$ and $\\lambda_{\\min} = \\tfrac12 - \\alpha$ both change sign at $\\alpha = \\tfrac12$',
    stage: mx(rhoOf(FAM(0.6)), { ptranspose: 'B', spectrum: 'bars' }),
    claims: [
      claim('q12FamF06', 'at $\\alpha = 0.6$, $F_{\\text{coh}} = 0.6$', () => close(V.q12FamF06, 0.6, 1e-9)),
      claim('q12FamF08', 'at $\\alpha = 0.8$, $F_{\\text{coh}} = 0.8$', () => close(V.q12FamF08, 0.8, 1e-9)),
      claim('q12FamSigMin06', 'at $\\alpha = 0.6$ the smallest eigenvalue of $\\rho^{T_B}$ is $-0.1$ (size 0.1)', () => close(V.q12FamSigMin06, 0.1, 1e-9)),
      claim('q12FamSigMin08', 'at $\\alpha = 0.8$ the smallest is $-0.3$ (size 0.3)', () => close(V.q12FamSigMin08, 0.3, 1e-9)),
      claim('q12FamDet06', 'at $\\alpha = 0.6$, $\\det\\rho^{T_B} = \\alpha^2(1-2\\alpha)/16$ has size 0.0045', () => close(V.q12FamDet06, 0.0045, 1e-9)),
      cHalf,
    ],
  },
  {
    id: 'q12-family:b3',
    phase: 'lecture',
    text: `The family is real and unchanged by flipping both spins, so $\\tilde\\rho = \\rho$. The numbers $\\lambda$ are then the eigenvalues of $\\rho$ itself: $\\alpha$, 0 and $\\tfrac{1-\\alpha}2$ twice. The concurrence is the largest minus the other three, $C = 2\\lambda_{\\max} - 1$. For $\\alpha \\ge \\tfrac13$ the largest is $\\alpha$, so $C = \\max(0,\\ 2\\alpha - 1)$. The three largest tie at $\\alpha = \\tfrac13$. So $C = 0$ at and below ½, ${d(V.q12FamC06, 1)} at ${d(V.q12FamF06, 1)}, and ${d(V.q12FamC08, 1)} at ${d(V.q12FamF08, 1)}.`,
    formal: `Since $\\rho$ is real and invariant under the spin flip, $\\tilde\\rho = \\rho$ and $R = \\sqrt{\\sqrt\\rho\\,\\tilde\\rho\\,\\sqrt\\rho} = \\sqrt{\\rho^2} = \\rho$, so the Wootters numbers are the eigenvalues $\\{\\alpha, 0, \\tfrac{1-\\alpha}2, \\tfrac{1-\\alpha}2\\}$ (notes Eqs. 3.19–3.21). Then $C = 2\\lambda_{\\max} - 1$, with $\\lambda_{\\max} = \\alpha$ for $\\alpha \\ge \\tfrac13$ and $\\tfrac{1-\\alpha}2$ below, tying at $\\alpha = \\tfrac13$: $C = \\max(0, 2\\alpha - 1)$. Values: 0 for $\\alpha \\le \\tfrac12$, ${d(V.q12FamC06, 1)} at ${d(V.q12FamF06, 1)}, ${d(V.q12FamC08, 1)} at ${d(V.q12FamF08, 1)}.`,
    caption: `$C = \\max(0, 2\\alpha - 1)$: ${d(V.q12FamC06, 1)} at ${d(V.q12FamF06, 1)}, ${d(V.q12FamC08, 1)} at ${d(V.q12FamF08, 1)}`,
    captionFormal: '$C = 2\\lambda_{\\max} - 1$; $\\lambda_{\\max} = \\alpha$ for $\\alpha \\ge \\tfrac13$',
    stage: split(mx(rhoOf(FAM(0.6)), { spectrum: 'bars' }), tq({ rho: FAM(0.6) }, { readouts: ['concurrence'] })),
    derivation: {
      result: 'C = \\max(0,\\ 2\\alpha - 1)',
      ground: [
        { tex: '\\tilde\\rho = (\\sigma_y\\otimes\\sigma_y)\\rho^*(\\sigma_y\\otimes\\sigma_y) = \\rho', why: 'The family is real and unchanged by flipping both spins, so its flipped matrix is itself.', view: mx(rhoOf(FAM(0.6)), { spectrum: 'bars' }), viewCaption: 'the four eigenvalues at $\\alpha = 0.6$' },
        { tex: '\\lambda_j = \\text{eigenvalues of }\\rho', why: 'Then $\\sqrt\\rho\\,\\tilde\\rho\\,\\sqrt\\rho = \\rho^2$, whose square roots are the eigenvalues of $\\rho$.', view: mx(rhoOf(FAM(0.2)), { spectrum: 'bars' }), viewCaption: 'at $\\alpha = 0.2$ the largest is the aligned weight' },
        { tex: '\\{\\lambda_j\\} = \\{\\alpha,\\ 0,\\ \\tfrac{1-\\alpha}2,\\ \\tfrac{1-\\alpha}2\\}', why: 'These are the three weights of the family, plus a zero.', view: mx(rhoOf(FAM(1 / 3)), { spectrum: 'bars' }), viewCaption: 'at $\\alpha = \\tfrac13$ the three largest tie' },
        { tex: 'C = \\lambda_{\\max} - (1 - \\lambda_{\\max}) = 2\\lambda_{\\max} - 1', why: 'The four numbers add to 1, so the other three add to $1 - \\lambda_{\\max}$.' },
        { tex: 'C = \\max(0,\\ 2\\alpha - 1)', why: 'For $\\alpha \\ge \\tfrac13$ the largest is $\\alpha$; below that the result is negative and the concurrence is 0.', view: tq({ rho: FAM(0.6) }, { readouts: ['concurrence'] }), viewCaption: 'the pair at $\\alpha = 0.6$' },
      ],
      formal: [
        { tex: '\\tilde\\rho = \\rho,\\quad \\{\\lambda_j\\} = \\{\\alpha, 0, \\tfrac{1-\\alpha}2, \\tfrac{1-\\alpha}2\\}', why: 'Real and spin-flip invariant, so the Wootters numbers are the spectrum of $\\rho$.', view: mx(rhoOf(FAM(0.6)), { spectrum: 'bars' }) },
        { tex: 'C = 2\\lambda_{\\max} - 1', why: 'The numbers add to 1, so the largest minus the rest is $2\\lambda_{\\max} - 1$.', view: mx(rhoOf(FAM(1 / 3)), { spectrum: 'bars' }) },
        { tex: 'C = \\max(0,\\ 2\\alpha - 1)', why: '$\\lambda_{\\max} = \\alpha$ for $\\alpha \\ge \\tfrac13$, and the formula is negative below $\\alpha = \\tfrac12$.', view: tq({ rho: FAM(0.6) }, { readouts: ['concurrence'] }) },
      ],
    },
    claims: [
      claim('q12FamLamTie', 'at $\\alpha = \\tfrac13$ the three largest eigenvalues tie', () => close(V.q12FamLamTie, 0, 1e-9)),
      claim('q12FamC02', 'at $\\alpha = 0.2$, $C = 0$', () => close(V.q12FamC02, 0, 1e-9)),
      claim('q12FamC06', 'at $\\alpha = 0.6$, $C = 0.2$', () => close(V.q12FamC06, 0.2, 1e-9)),
      claim('q12FamC08', 'at $\\alpha = 0.8$, $C = 0.6$', () => close(V.q12FamC08, 0.6, 1e-9)),
      cThird,
    ],
  },
  {
    id: 'q12-family:b4',
    phase: 'lecture',
    text: `The conditional entropy of the family is $S(A|B) = -\\alpha\\log_2\\alpha - (1-\\alpha)\\log_2\\tfrac{1-\\alpha}2 - 1$ bits. It turns negative only above $\\alpha = ${d(V.q12FamSABThresh, 4)}$. At three quarters it is still ${d(V.q12FamSAB075, 4)} bit, and at ${d(V.q12FamF08, 1)} it is $-${d(V.q12FamSAB08, 4)}$ bit. So for $\\alpha$ between ½ and ${d(V.q12FamSABThresh, 4)} the pair is entangled and the entropy test misses it. At $\\alpha = 1$, the singlet, it reaches $-1$.`,
    formal: `For the family $S(A|B) = S(\\rho_{AB}) - S(\\rho_B) = -\\alpha\\log_2\\alpha - (1-\\alpha)\\log_2\\tfrac{1-\\alpha}2 - 1$ (notes Eq. 3.35), since $\\rho_B = \\tfrac12I$. It crosses zero at $\\alpha = ${d(V.q12FamSABThresh, 4)}$: ${d(V.q12FamSAB075, 4)} bit at three quarters, $-${d(V.q12FamSAB08, 4)}$ bit at ${d(V.q12FamF08, 1)}, and $-1$ at the singlet. The window $\\tfrac12 < \\alpha < ${d(V.q12FamSABThresh, 4)}$ is entangled (the flipped matrix and the coherence figure agree) but the conditional entropy is not negative there.`,
    caption: `$S(A|B)$ turns negative only above $\\alpha = ${d(V.q12FamSABThresh, 4)}$`,
    captionFormal: `$S(A|B) < 0$ iff $\\alpha > ${d(V.q12FamSABThresh, 4)}$: the window $\\tfrac12 < \\alpha < ${d(V.q12FamSABThresh, 4)}$ is missed`,
    stage: split(mx(rhoOf(FAM(0.8)), { spectrum: 'entropy' }), tq({ rho: FAM(0.8) }, { readouts: ['entropy'] })),
    claims: [
      claim('q12FamSAB075', 'at three quarters $S(A|B) = 0.0613$ bit', () => close(V.q12FamSAB075, 0.0613, 1e-4)),
      claim('q12FamSAB08', 'at $\\alpha = 0.8$, $S(A|B) = -0.0781$ bit (size 0.0781)', () => close(V.q12FamSAB08, 0.0781, 1e-4)),
      claim('q12FamSABThresh', '$S(A|B)$ crosses zero at $\\alpha = 0.7729$', () => close(V.q12FamSABThresh, 0.7729, 1e-4)),
      claim('q12FamSAB1', 'at the singlet $S(A|B) = -1$', () => close(V.q12FamSAB1, -1, 1e-9)),
      cHalf,
    ],
  },
  {
    id: 'q12-family:b5',
    phase: 'clue',
    text: 'Four tests meet on this one family: the coherence figure, the flipped matrix, the concurrence and the conditional entropy. Which is the strongest here?',
    formal: 'For $\\rho(\\alpha)$, compare the four detection thresholds: $F_{\\text{coh}} > \\tfrac12$, $\\lambda_{\\min}(\\rho^{T_B}) < 0$, $C > 0$ and $S(A|B) < 0$. Which test detects the widest range of $\\alpha$, and what is $E_F$ at $\\alpha = 0.8$?',
    stage: mx(rhoOf(FAM(0.8)), { ptranspose: 'B', spectrum: 'bars' }),
    reveal: {
      text: `The first three agree: each flags every $\\alpha$ above ½. Entropy is the weakest, needing more than ${d(V.q12FamSABThresh, 4)}. At $\\alpha = ${d(V.q12FamF08, 1)}$ the concurrence ${d(V.q12FamC08, 1)} gives an entanglement of formation of ${d(V.q12FamEf08, 3)} bit.`,
      formal: `The coherence figure, the flipped matrix and the concurrence all detect exactly $\\alpha > \\tfrac12$ (the three are equivalent on this family); the conditional entropy is sufficient only, detecting $\\alpha > ${d(V.q12FamSABThresh, 4)}$. At $\\alpha = ${d(V.q12FamF08, 1)}$, $C = ${d(V.q12FamC08, 1)}$ gives $E_F = E(C) = ${d(V.q12FamEf08, 3)}$ bit. This worked value is ours; the notes do not work it.`,
      caption: `three tests flag $\\alpha > \\tfrac12$; entropy only above ${d(V.q12FamSABThresh, 4)}; $E_F(${d(V.q12FamF08, 1)}) = ${d(V.q12FamEf08, 3)}$ bit`,
      captionFormal: `$E_F = E(C) = ${d(V.q12FamEf08, 3)}$ bit at $\\alpha = ${d(V.q12FamF08, 1)}$`,
      stage: tq({ rho: FAM(0.8) }, { readouts: ['concurrence'] }),
      claims: [claim('q12FamEf08', 'at $\\alpha = 0.8$ the entanglement of formation is $E(0.6) = 0.469$ bit', () => close(V.q12FamEf08, 0.469, 1e-3)), cHalf],
    },
  },
  {
    id: 'q12-family:b6',
    phase: 'deeper',
    text: `Bell's test is weaker than the first three, though it beats the entropy test. The best CHSH score of the family is $2\\sqrt2\\,\\alpha$, and it passes 2 only above $1/\\sqrt2 = ${d(V.q12FamChshThresh, 4)}$. So for $\\alpha$ between ½ and ${d(V.q12FamChshThresh, 4)} the pair is entangled yet obeys the CHSH bound of <<qc-q10-violation|Chapter Q10>>. At $\\alpha = ${d(V.q12FamF08, 1)}$ the best score is ${d(V.q12FamChshAt08, 4)}.`,
    formal: `The Horodecki maximum for the family is $2\\sqrt2\\,\\alpha$ when $\\alpha \\ge \\tfrac13$ (the correlation tensor is $\\mathrm{diag}(-\\alpha, -\\alpha, 1-2\\alpha)$), above 2 only for $\\alpha > 1/\\sqrt2 = ${d(V.q12FamChshThresh, 4)}$. For $\\tfrac12 < \\alpha \\le ${d(V.q12FamChshThresh, 4)}$ the state is entangled yet obeys every CHSH inequality, so the CHSH test is strictly weaker than the first three here, though it beats the entropy test. At $\\alpha = ${d(V.q12FamF08, 1)}$ the maximum is ${d(V.q12FamChshAt08, 4)}. This window is our example; the notes do not work it.`,
    caption: `CHSH needs $\\alpha > ${d(V.q12FamChshThresh, 4)}$; at ${d(V.q12FamF08, 1)} the best score is ${d(V.q12FamChshAt08, 4)}`,
    captionFormal: `best CHSH score $2\\sqrt2\\,\\alpha$: above 2 only for $\\alpha > 1/\\sqrt2$`,
    stage: tq({ rho: FAM(0.8) }, { readouts: ['chsh'] }),
    claims: [
      claim('q12FamChshThresh', 'the CHSH score of the family passes 2 at $\\alpha = 1/\\sqrt2 = 0.7071$', () => close(V.q12FamChshThresh, Math.SQRT1_2, 1e-9)),
      claim('q12FamChshAt08', 'at $\\alpha = 0.8$ the best score is $2\\sqrt2\\cdot0.8 = 2.2627$', () => close(V.q12FamChshAt08, 2 * Math.SQRT2 * 0.8, 1e-9)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q12-multipartite — Three qubits: GHZ, W and monogamy                                             */
/* ---------------------------------------------------------------------------------------------- */

const multipartiteUnit: Beat[] = [
  {
    id: 'q12-multipartite:b1',
    phase: 'books',
    text:
      'With three qubits, entanglement comes in kinds. A state can be a full product, or split as one qubit times an entangled pair, or **genuinely three-way**. Chapter Q7’s [[qc-ghz|GHZ]] state and the [[qc-w-state|W state]] $(|100\\rangle + |010\\rangle + |001\\rangle)/\\sqrt3$ are both genuinely three-way, but differ. (The W state is always this ket, $|W\\rangle$; Unit 12.3’s witness $W$ is always a bare operator — the two never collide.)',
    formal:
      'A pure three-qubit state is fully separable, biseparable (one qubit times a possibly-entangled pair across some cut), or genuinely tripartite entangled (Bergou §3.9). Two genuinely-tripartite examples are $|\\mathrm{GHZ}\\rangle = (|000\\rangle + |111\\rangle)/\\sqrt2$ (Chapter Q7; [[qc-ghz|link]]) and [[qc-w-state|the W state]] $|W\\rangle = (|100\\rangle + |010\\rangle + |001\\rangle)/\\sqrt3$. (Unit 12.3’s witness operator $W$ and this ket $|W\\rangle$ are unrelated; one is always bare, the other always a ket.)',
    caption: 'three qubits: product, one-plus-pair, or genuinely three-way — GHZ and W',
    captionFormal: 'fully separable / biseparable / genuinely tripartite; GHZ and W',
    stage: split(amp(GHZ3, { mode: 'probability' }), tqX(W3, [0, 1])),
    claims: [
      claim('q12WCircuitFid', 'the drawn W-state circuit is exactly $|W\\rangle$', () => close(V.q12WCircuitFid, 1, 1e-6)),
      claim('q12WQubitPUpZ', 'W’s own qubit is $\\tfrac23$ up along $z$, not axis-blind like GHZ’s', () => close(V.q12WQubitPUpZ, 2 / 3, 1e-6)),
    ],
  },
  {
    id: 'q12-multipartite:b2',
    phase: 'books',
    text:
      'Trace out the third qubit and look at the remaining pair. For GHZ the pair is a **separable** coin mixture — no entanglement, concurrence $0$. For W the pair keeps concurrence $\\tfrac23$. GHZ’s entanglement is all three-way; W’s is shared pairwise.',
    formal:
      'The two-qubit reduced state tells them apart. $\\mathrm{Tr}_C|\\mathrm{GHZ}\\rangle\\langle\\mathrm{GHZ}| = \\tfrac12(|00\\rangle\\langle00| + |11\\rangle\\langle11|)$ is separable, concurrence $0$ (Chapter Q8’s box). $\\mathrm{Tr}_C|W\\rangle\\langle W| = \\tfrac13[(|01\\rangle + |10\\rangle)(\\langle01| + \\langle10|) + |00\\rangle\\langle00|]$ has concurrence $C_{AB} = \\tfrac23$ (Eq. 3.85).',
    caption: 'lose qubit 3: GHZ pair $C = 0$, W pair $C = 0.667$',
    captionFormal: 'GHZ reduced pair separable ($C = 0$); W reduced pair $C_{AB} = \\tfrac23$',
    stage: split(tqX(GHZ3, [0, 1]), amp(W3, { mode: 'probability' })),
    claims: [
      claim('q12GhzPairConc', 'GHZ’s reduced pair has concurrence $0$', () => close(V.q12GhzPairConc, 0, 1e-9)),
      claim('q12GhzPairSpecMax', 'and eigenvalues $0.5, 0.5, 0, 0$', () => close(V.q12GhzPairSpecMax, 0.5, 1e-6)),
      claim('q12WpairConc', 'W’s reduced pair has concurrence $0.667$', () => close(V.q12WpairConc, 2 / 3, 1e-6)),
      cThird,
    ],
    fidelity: ['qc-tq-not-two-places'],
  },
  {
    id: 'q12-multipartite:b3',
    phase: 'books',
    text:
      'Entanglement is [[qc-monogamy|monogamous]]: if $A$ is strongly entangled with $B$, it can be only weakly entangled with $C$. The Coffman–Kundu–Wootters bound makes it exact: $C_{A:B}^2 + C_{A:C}^2 \\le C_{A:BC}^2$. The W state saturates it — both sides equal $\\tfrac89$.',
    formal:
      'Monogamy is the CKW inequality $C_{A:B}^2 + C_{A:C}^2\\le C_{A:BC}^2$ (Bergou Eq. 3.84), where $C_{A:BC}$ treats $BC$ as one effective qubit. For $|W\\rangle$: $C_{A:B} = C_{A:C} = \\tfrac23$ and $C_{A:BC} = \\tfrac{2\\sqrt2}3$, so both sides are $\\tfrac89$ — the W state meets the bound with equality (see Corrections, which fixes $|v_1\\rangle$).',
    caption: 'monogamy: $C_{AB}^2 + C_{AC}^2 \\le C_{A:BC}^2$; W gives $0.889 = 0.889$',
    captionFormal: 'CKW: $\\tfrac89 = \\tfrac89$ for W ($C_{A:B} = C_{A:C} = \\tfrac23$, $C_{A:BC} = \\tfrac{2\\sqrt2}3$)',
    stage: split(tqX(W3, [0, 1]), amp(W3, { mode: 'probability' })),
    derivation: {
      result: 'C_{A:B}^2 + C_{A:C}^2 = C_{A:BC}^2 = \\tfrac89',
      ground: [
        { tex: '\\rho_{AB} = \\tfrac13[(|01\\rangle + |10\\rangle)(\\langle01| + \\langle10|) + |00\\rangle\\langle00|],\\ C_{A:B} = \\tfrac23', why: 'Trace out $C$.', view: tqX(W3, [0, 1]), viewCaption: '$A{:}B$: $C = 0.667$' },
        { tex: 'C_{A:C} = \\tfrac23', why: 'By symmetry, tracing out $B$ gives the same.', view: tqX(W3, [0, 2]), viewCaption: '$A{:}C$: $C = 0.667$' },
        { tex: 'C_{A:BC} = 2\\sqrt{\\lambda_1\\lambda_2} = \\tfrac{2\\sqrt2}3,\\ \\lambda = (\\tfrac23, \\tfrac13)', why: 'Treat $BC$ as one qubit; use $A$’s Schmidt weights.', view: amp(W3, { mode: 'probability' }), viewCaption: '$|W\\rangle$: $A$ against $BC$' },
        { tex: 'C_{A:B}^2 + C_{A:C}^2 = C_{A:BC}^2 = \\tfrac89', why: 'Both sides are $\\tfrac89$: W meets the monogamy bound exactly.' },
      ],
      formal: [
        { tex: 'C_{A:B} = C_{A:C} = \\tfrac23,\\quad C_{A:BC} = \\tfrac{2\\sqrt2}3', why: 'The three pairwise and bipartite concurrences (Eqs. 3.85–3.86).', view: tqX(W3, [0, 1]) },
        { tex: 'C_{A:B}^2 + C_{A:C}^2 = C_{A:BC}^2 = \\tfrac89', why: 'The CKW inequality (Eq. 3.84) is an equality for W.', view: tqX(W3, [0, 2]) },
      ],
    },
    claims: [
      claim('q12WacConc', '$C_{A:C} = 0.667$ too', () => close(V.q12WacConc, 2 / 3, 1e-6)),
      claim('q12CAbc', '$C_{A:BC} = 0.943$', () => close(V.q12CAbc, (2 * Math.sqrt(2)) / 3, 1e-6)),
      claim('q12CkwLeft', 'the left side is $0.889$', () => close(V.q12CkwLeft, 8 / 9, 1e-6)),
      claim('q12CkwRight', 'the right side is $0.889$ too', () => close(V.q12CkwRight, 8 / 9, 1e-6)),
    ],
    fidelity: ['qc-tq-local-arrows'],
  },
  {
    id: 'q12-multipartite:b4',
    phase: 'clue',
    text: 'Can local moves (with a phone call, and allowed to fail) ever turn a W state into a GHZ state?',
    formal: 'Are $|W\\rangle$ and $|\\mathrm{GHZ}\\rangle$ interconvertible by stochastic LOCC ([[qc-sloc|SLOCC]])?',
    stage: amp(W3, { mode: 'probability' }),
    reveal: {
      text: 'No. They are different families. No local operations, even allowed to succeed only sometimes, can convert one into the other. Their three-way entanglement has different shapes.',
      formal:
        'No: GHZ-class and W-class are the two inequivalent [[qc-sloc|SLOCC]] classes of genuinely tripartite states (Bergou §3.9). $|\\psi\\rangle\\to|\\varphi\\rangle$ by SLOCC iff $|\\varphi\\rangle = A\\otimes B\\otimes C|\\psi\\rangle$ with invertible local operators, which cannot map one class to the other. A related but distinct idea is [[qc-bound-entanglement|bound entanglement]]: every PPT entangled state (Unit 12.2’s test returns non-negative) is bound, so no Bell pair can ever be distilled from it. The known two-qutrit examples are not drawn, since no stage here holds qutrits.',
      caption: 'no: GHZ-class and W-class are distinct under SLOCC',
      captionFormal: 'no: GHZ-class and W-class are distinct under SLOCC',
      stage: split(amp(GHZ3, { mode: 'probability' }), tqX(W3, [0, 1])),
    },
  },
]

export const Q12_STORY: Record<string, Beat[]> = {
  'q12-coherence': coherenceUnit,
  'q12-ppt': pptUnit,
  'q12-witness': witnessUnit,
  'q12-locc': loccUnit,
  'q12-entropy': entropyUnit,
  'q12-concurrence': concurrenceUnit,
  'q12-family': familyUnit,
  'q12-multipartite': multipartiteUnit,
}

/** Every unit's claims, gathered from its beats and reveals (for `Unit.claims`, as Q9.ts does). */
function claimsOf(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.derivation ? [...b.derivation.ground, ...(b.derivation.formal ?? [])].flatMap((s) => s.claims ?? []) : []), ...(b.reveal?.claims ?? [])])
}
export const Q12_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof claimsOf>> = Object.fromEntries(Object.entries(Q12_STORY).map(([id, beats]) => [id, claimsOf(beats)]))
export { cHalf }
