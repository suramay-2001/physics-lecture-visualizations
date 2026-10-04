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
 * - `two-qubit`'s `readouts` rejects `'concurrence'`/`'chsh'` (still not merged for that kind, confirmed in
 *   `stage/svg/twoQubit.ts`). No beat below uses them; a concurrence number is always read off a `matrix` view
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
import { C_PROC30, C_PROC45, C_WSTATE, psiPrep, V, claim, close } from './Q12.values'

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

/* Reusable claims. */
const cHalf = claim('q12Half', 'a weight or component of one half', () => close(V.q12Half, 0.5))
const cThird = claim('q12Third', 'a weight or threshold of one third', () => close(V.q12Third, 1 / 3))

/* ---------------------------------------------------------------------------------------------- */
/* q12-ppt — The partial transpose test                                                             */
/* ---------------------------------------------------------------------------------------------- */

const pptUnit: Beat[] = [
  {
    id: 'q12-ppt:b1',
    phase: 'books',
    text:
      'Chapter Q10 called a pair *separable* when it is a chance-mixture of product states. But handed one density matrix, how do we tell? Chapter Q10’s $S \\le 2$ test misses some entangled states. We want a sharper one.',
    formal:
      'A bipartite state is *separable* if $\\rho = \\sum_kp_k\\,\\rho_{A,k}\\otimes\\rho_{B,k}$ (Chapter Q10). Deciding separability from a given $\\rho$ is hard in general; the CHSH test of Chapter Q10 is only sufficient and misses entangled states that break no Bell inequality. We build a stronger, purely algebraic test.',
    caption: 'separable = a mixture of products; we want a test',
    captionFormal: 'separability from $\\rho$ alone: a sharper criterion than CHSH',
    stage: tq({ rho: PB(0.5) }),
  },
  {
    id: 'q12-ppt:b2',
    phase: 'books',
    introduces: ['qc-partial-transpose'],
    text:
      'Here is the trick. Write $\\rho$ in blocks, one per value of Bob’s bit. The [[qc-partial-transpose|partial transpose]] $\\rho^{T_B}$ transposes inside each block — it flips Bob’s two indices but leaves Alice’s alone. The matrix changes; its row-sums do not.',
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
    id: 'q12-ppt:b3',
    phase: 'books',
    text:
      'Now take eigenvalues. A separable $\\rho$ always gives a non-negative $\\rho^{T_B}$: a sum of products stays a valid state under the flip. So **one negative eigenvalue proves entanglement.** Our running state has a negative one for every $p$ above 0.',
    formal:
      'If $\\rho$ is separable then $\\rho^{T_B} = \\sum_kp_k\\,\\rho_{A,k}\\otimes\\rho_{B,k}^T\\ge 0$, since a transposed state is still a state. So a **negative** eigenvalue of $\\rho^{T_B}$ is sufficient for entanglement (Peres). For $\\rho(p) = p|\\Psi^-\\rangle\\langle\\Psi^-| + (1-p)|00\\rangle\\langle00|$ the smallest eigenvalue is $\\tfrac12\\big[(1-p) - \\sqrt{(1-p)^2 + p^2}\\big] < 0$ for all $p > 0$ (Eq. 3.26).',
    caption: 'one negative eigenvalue after the flip ⇒ entangled',
    captionFormal: '$\\lambda_{\\min}(\\rho^{T_B}) < 0$ for all $p > 0$: entangled',
    stage: split(mx(rhoOf(PB({ from: 0, to: 1 })), { ptranspose: 'B', spectrum: 'bars' }), tq({ rho: PB({ from: 0, to: 1 }) })),
    derivation: {
      result: '\\lambda_{\\min}(\\rho^{T_B}) < 0 \\text{ for all } p > 0 \\Rightarrow \\text{entangled}',
      ground: [
        { tex: '\\rho(p) = p|\\Psi^-\\rangle\\langle\\Psi^-| + (1-p)|00\\rangle\\langle00|', why: 'The running state, in blocks by Bob’s bit.', view: mx(rhoOf(PB(0.5)), { blocks: 2 }), viewCaption: '$\\rho$ in $2\\times2$ blocks' },
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
          why: 'Negative for every $p$ above $0$, and the correlations keep strengthening alongside it.',
          view: tq({ rho: PB({ from: 0, to: 1 }) }),
          viewCaption: 'the correlations grow as $p$ increases',
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
    id: 'q12-ppt:b4',
    phase: 'books',
    text:
      'For two qubits (and qubit–qutrit) the test is perfect: a negative eigenvalue appears **exactly** when the state is entangled. And it is sharper than Chapter Q10’s Bell test. Our state breaks no CHSH bound until $p$ passes $0.707$, yet it is entangled all the way down.',
    formal:
      'For $2\\otimes2$ and $2\\otimes3$ systems the Peres criterion is also necessary (Horodecki): $\\rho^{T_B}\\ge 0 \\iff$ separable. The running state satisfies every Bell inequality for $p \\le 1/\\sqrt2 \\approx 0.707$, yet its partial transpose is negative for all $p > 0$, so PPT detects entanglement that CHSH cannot.',
    caption: 'two qubits: negative ⇔ entangled; sharper than the Bell test',
    captionFormal: '$2\\otimes2$: PPT is necessary and sufficient; strictly stronger than CHSH',
    stage: split(mx(rhoOf(PB(V.q12ChshThresh)), { ptranspose: 'B', spectrum: 'bars' }), tq({ rho: PB(V.q12ChshThresh) })),
    claims: [
      claim('q12ChshThresh', 'the CHSH threshold is $1/\\sqrt2 = 0.707$', () => close(V.q12ChshThresh, Math.SQRT1_2)),
      claim('q12BergLamMinAtChsh', 'already at that $p$, $\\lambda_{\\min}(\\rho^{T_B}) = -0.236$', () => {
        const p = V.q12ChshThresh
        return close(V.q12BergLamMinAtChsh, 0.5 * (1 - p - Math.sqrt((1 - p) ** 2 + p ** 2)), 1e-6)
      }),
    ],
  },
  {
    id: 'q12-ppt:b5',
    phase: 'clue',
    text: 'Take the Werner state: a singlet mixed with pure noise, $w|\\Psi^-\\rangle\\langle\\Psi^-| + (1-w)\\tfrac14 I$. For which $w$ does the flip give a negative eigenvalue?',
    formal: 'Apply the Peres test to the Werner state $\\rho(w) = w|\\Psi^-\\rangle\\langle\\Psi^-| + (1-w)\\tfrac14 I$. For which $w$ is $\\lambda_{\\min}(\\rho^{T_B}) < 0$?',
    stage: tq({ rho: WER(0.5) }),
    reveal: {
      text: 'The smallest eigenvalue is $(1-3w)/4$: negative exactly when $w$ is above $\\tfrac13$. So the Werner state is entangled precisely for $w > \\tfrac13$.',
      formal: '$\\lambda_{\\min}(\\rho^{T_B}) = (1-3w)/4$, negative for $w > \\tfrac13$. Since PPT is exact for two qubits, the Werner state is entangled exactly for $w > \\tfrac13$ — the same threshold the concurrence will give in Unit 12.5.',
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
      'An [[qc-entanglement-witness|entanglement witness]] $W$ is a Hermitian operator with $\\mathrm{Tr}(\\rho_sW)\\ge 0$ for every separable $\\rho_s$, and $\\mathrm{Tr}(\\rho_eW) < 0$ for at least one entangled $\\rho_e$. Because $W$ is Hermitian it is in principle an observable, so a single expectation value can certify entanglement.',
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
        { tex: 'W = (|\\eta\\rangle\\langle\\eta|)^{T_B}', why: 'Flip the projector onto $|\\eta\\rangle$: build $W$ from $\\rho$’s own blocks.', view: mx(rhoOf(PB(0.5)), { blocks: 2 }), viewCaption: '$\\rho$’s own blocks, where $W$ is built from' },
        { tex: '\\mathrm{Tr}(\\rho W) = \\mathrm{Tr}(\\rho^{T_B}|\\eta\\rangle\\langle\\eta|) = \\lambda_- < 0', why: 'Its average on $\\rho$ is the negative eigenvalue.', view: mx(rhoOf(PB(0.5)), { trace: true }), viewCaption: '$\\mathrm{Tr}(\\rho W) = -0.104$', claims: [claim('q12WitnessVal', 'the trace reads $-0.104$', () => close(V.q12WitnessVal, -0.1035533905932738, 1e-6))] },
        { tex: '\\mathrm{Tr}(\\rho W) = \\lambda_- < 0,\\quad \\mathrm{Tr}(\\rho_sW) \\ge 0', why: 'Negative here, non-negative on every separable state: a witness.' },
      ],
      formal: [
        { tex: '\\mathrm{Tr}(X^{T_B}Y) = \\mathrm{Tr}(X\\,Y^{T_B}) \\Rightarrow \\mathrm{Tr}(\\rho W) = \\lambda_-', why: 'The transpose-swap identity with $W = (|\\eta\\rangle\\langle\\eta|)^{T_B}$ (Eq. 3.27).', view: mx(rhoOf(PB(0.5)), { blocks: 2 }) },
        { tex: '\\mathrm{Tr}(\\rho W) = \\lambda_- < 0,\\quad \\mathrm{Tr}(\\rho_sW) \\ge 0', why: 'Separable states are PPT (Eq. 3.28), so the sign is negative only here.', view: mx(rhoOf(PB(0.5)), { trace: true }) },
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
      '[[qc-locc|Local operations and classical communication]] (LOCC): each party may append an ancilla, apply unitaries, make orthogonal measurements, and discard subsystems, coordinating by classical messages (Bergou §3.6.1). Exchanging quantum systems is excluded. LOCC cannot create entanglement from a product state.',
    caption: 'LOCC: local gates, local readings, a phone call — no mailing qubits',
    captionFormal: 'LOCC: append, unitary, measure, discard, plus classical messages',
    stage: circ(C_PROC30, 0, {}),
  },
  {
    id: 'q12-locc:b2',
    phase: 'books',
    text:
      'One Bell pair is the unit of shared entanglement: one **ebit**. From many weakly entangled copies, LOCC can distill fewer near-perfect Bell pairs; and from Bell pairs it can build weaker states. The exchange rate, per copy, is the entanglement of the next unit.',
    formal:
      'A maximally entangled pair is one **ebit**. Entanglement distillation turns $n$ copies of $|\\psi\\rangle$ into $m$ near-perfect Bell pairs by LOCC; dilution runs the reverse. For pure states the limiting ratio $m/n$ in both directions is $E(|\\psi\\rangle) = S(\\rho_A)$ (N&C §12.5.2), tying the measure of Unit 12.4 to a physical rate.',
    caption: 'one Bell pair = one ebit; weak copies distil to fewer strong ones',
    captionFormal: 'ebit; distillation/dilution rate $\\to S(\\rho_A)$ (N&C)',
    stage: amp({ bell: '00+11' }, { mode: 'probability' }),
  },
  {
    id: 'q12-locc:b3',
    phase: 'books',
    text:
      'Here is a concrete LOCC move. Alice holds a tilted pair $\\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$. She adds a blank qubit, runs one gate, and reads it. On a $0$ — chance $0.5$ at $\\theta = 30°$ — the pair is now a perfect Bell state. On a $1$, it collapses to $|1\\rangle|00\\rangle$ and she retries.',
    formal:
      'Procrustean distillation (Bergou §3.6.2): for $|\\psi\\rangle = \\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$ ($0\\le\\theta\\le\\tfrac\\pi4$) Alice appends $|0\\rangle_{A\'}$, applies a unitary $U_A$, and measures $A\'$. Outcome $0$ (probability $p_s = 2\\sin^2\\theta = 1 - \\cos2\\theta$) leaves $\\Phi^+$; outcome $1$ leaves $|1\\rangle_{A\'}|00\\rangle_{AB}$ (erratum B9). At $\\theta = 30°$, $p_s = 0.5$.',
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
          why: 'Outcome $0$ (chance $2\\sin^2\\theta = 1 - \\cos2\\theta$) keeps $\\Phi^+$; outcome $1$ leaves $|1\\rangle_{A\'}|00\\rangle$ (erratum B9).',
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
    phase: 'books',
    text:
      'Chapter Q9 measured a pure pair’s entanglement by the [[qc-entanglement-entropy|entropy]] of one half, $E = S(\\rho_A)$. For $\\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$ the reduced state is $\\mathrm{diag}(\\cos^2\\theta, \\sin^2\\theta)$, so $E = h(\\cos^2\\theta)$. At $\\theta = 30°$ that is $0.811$ bit.',
    formal:
      'For a pure bipartite state, the entanglement is $E(|\\psi\\rangle_{AB}) = S(\\rho_A) = S(\\rho_B)$ (Chapter Q9; Bergou Eq. 3.41). For $|\\psi(\\theta)\\rangle = \\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$, $\\rho_A = \\mathrm{diag}(\\cos^2\\theta, \\sin^2\\theta)$ and $E = h(\\cos^2\\theta)$, the binary entropy; at $\\theta = 30°$, $E = 0.811$ bit.',
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
    id: 'q12-entropy:b2',
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
    id: 'q12-entropy:b3',
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
    id: 'q12-entropy:b4',
    phase: 'books',
    text:
      'For a mixed pair, $E = S(\\rho_A)$ fails: a classical mixture of products has a mixed $\\rho_A$ but no entanglement. The fix is the **entanglement of formation**: the smallest average entanglement over all ways to write $\\rho$ as a mixture of pure states.',
    formal:
      'For mixed $\\rho_{AB}$, $S(\\rho_A)$ is not a valid measure (a separable $\\rho$ can have mixed marginals). The [[qc-entanglement-of-formation|entanglement of formation]] takes the infimum over pure-state decompositions, $E_F(\\rho) = \\inf\\sum_kp_kE(|\\psi^{(k)}\\rangle)$ (Bergou Eq. 3.60, erratum B11 restores $p_k$). It is generally hard to compute — but for two qubits Unit 12.5 gives it in closed form.',
    caption: 'mixed pairs: the entanglement of formation, the cheapest recipe',
    captionFormal: '$E_F(\\rho) = \\inf\\sum_kp_kE(|\\psi^{(k)}\\rangle)$ (Eq. 3.60)',
    stage: split(tq({ rho: WER(0.5) }), mx(rhoOf(WER(0.5)), { partialTrace: 'B', spectrum: 'entropy' })),
    claims: [claim('q12WernerSA', 'the Werner state’s reduced state has $S(\\rho_A) = 1$ bit, yet it is entangled', () => close(V.q12WernerSA, 1, 1e-6))],
  },
  {
    id: 'q12-entropy:b5',
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
    phase: 'books',
    introduces: ['qc-concurrence'],
    text:
      'For two qubits there is a shortcut. Flip the state: conjugate every amplitude, then apply $\\sigma_y$ to each qubit, giving the [[qc-concurrence|tilde state]] $\\tilde\\psi$. The **concurrence** is how much the state overlaps its own flip, $C = |\\langle\\psi|\\tilde\\psi\\rangle|$.',
    formal:
      'Define the spin-flipped state $|\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle$, the complex conjugate taken in the standard basis (Bergou Eq. 3.65). The [[qc-concurrence|concurrence]] of a pure two-qubit state is $C(|\\psi\\rangle) = |\\langle\\psi|\\tilde\\psi\\rangle|$ (Eq. 3.66). A single qubit is orthogonal to its own flip, which is why this measures a two-body property.',
    caption: 'flip the state with $\\sigma_y\\otimes\\sigma_y$; $C = |\\langle\\psi|\\tilde\\psi\\rangle|$',
    captionFormal: '$|\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle$; $C = |\\langle\\psi|\\tilde\\psi\\rangle|$',
    stage: split(mx({ pauli: 'YY' }, {}), tq(PSI_FAMILY(30))),
    claims: [claim('q12ConcPure30', 'the tilted pair has concurrence $0.866$', () => close(V.q12ConcPure30, Math.sqrt(3) / 2, 1e-6))],
  },
  {
    id: 'q12-concurrence:b2',
    phase: 'books',
    text:
      'For a pure pair this comes out beautifully: $C = 2\\sqrt{\\lambda_1\\lambda_2}$, twice the geometric mean of the Schmidt weights. For $\\cos\\theta|00\\rangle + \\sin\\theta|11\\rangle$ that is $\\sin2\\theta$ — $0.866$ at $\\theta = 30°$. It is also $2|\\det A|$, with $A$ the state’s coefficient matrix.',
    formal:
      'With Schmidt weights $\\lambda_1, \\lambda_2$ ($\\lambda_1 + \\lambda_2 = 1$), $C = 2\\sqrt{\\lambda_1\\lambda_2}$ (Bergou Eq. 3.68): $0$ for a product, $1$ when $\\lambda_1 = \\lambda_2 = \\tfrac12$. For $|\\psi(\\theta)\\rangle$ this is $\\sin2\\theta = 0.866$ at $\\theta = 30°$. Equivalently $C = 2|\\det A|$ with $A_{jk}$ the coefficient matrix (⚑ Problem 3.6, cited).',
    caption: '$C = 2\\sqrt{\\lambda_1\\lambda_2} = \\sin2\\theta = 0.866$ here',
    captionFormal: '$C = 2\\sqrt{\\lambda_1\\lambda_2} = \\sin2\\theta = 2|\\det A| = 0.866$',
    stage: split(mx({ coef: PSI(30) }, { svd: true }), tq(PSI_FAMILY(30))),
    derivation: {
      result: 'C = 2\\sqrt{\\lambda_1\\lambda_2} = \\sin2\\theta = 2|\\det A|',
      ground: [
        { tex: '|\\tilde\\psi\\rangle = (\\sigma_y\\otimes\\sigma_y)|\\psi^*\\rangle', why: 'The spin-flipped state.', view: mx({ pauli: 'YY' }, {}), viewCaption: 'the flip operator $\\sigma_y\\otimes\\sigma_y$' },
        { tex: 'C = |\\langle\\psi|\\tilde\\psi\\rangle| = 2\\sqrt{\\lambda_1\\lambda_2}', why: 'The overlap with the flip is twice the geometric mean of the Schmidt weights.', view: mx({ coef: PSI(30) }, { svd: true }), viewCaption: 'Schmidt bars $0.75,\\ 0.25$' },
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
    id: 'q12-concurrence:b3',
    phase: 'books',
    text:
      'Concurrence and entropy carry the same information. A fixed, increasing function turns one into the other: $E = h\\!\\big((1 + \\sqrt{1 - C^2})/2\\big)$. At $C = 0.866$ it returns $0.811$ bit — exactly the entanglement entropy of Unit 12.4 for this same pair.',
    formal:
      'The entanglement is a monotone function of $C$: $E(C) = h\\!\\big(\\tfrac{1 + \\sqrt{1 - C^2}}2\\big)$ with $h$ the binary entropy (Bergou Eqs. 3.69–3.71). At $C = 0.866$, $E(C) = 0.811$ bit, matching $S(\\rho_A)$ from Unit 12.4 — concurrence and entropy are two faces of one quantity for pure states.',
    caption: '$E(C) = 0.811$ bit at $C = 0.866$: same as the entropy',
    captionFormal: '$E(C) = h\\!\\big(\\tfrac{1+\\sqrt{1-C^2}}2\\big) = 0.811$ bit',
    stage: split(mx({ coef: PSI(30) }, { svd: true }), tq(PSI_FAMILY(30), { readouts: ['entropy'] })),
    claims: [claim('q12EofC30', '$E(C) = 0.811$ bit, matching $E$', () => close(V.q12EofC30, V.q12E30, 1e-6))],
    fidelity: ['qc-matrix-trace-engine'],
  },
  {
    id: 'q12-concurrence:b4',
    phase: 'books',
    text:
      'For a mixed two-qubit state there is still a formula. Wootters: list the square-root eigenvalues of $\\rho\\tilde\\rho$ in order, then $C = \\max(0,\\ \\lambda_1 - \\lambda_2 - \\lambda_3 - \\lambda_4)$. For the Werner state this gives $0.25$ at $w = \\tfrac12$ — matching the PPT verdict.',
    formal:
      'For mixed $\\rho$, let $\\lambda_1\\ge\\dots\\ge\\lambda_4$ be the square roots of the eigenvalues of $\\rho\\tilde\\rho$, $\\tilde\\rho = (\\sigma_y\\otimes\\sigma_y)\\rho^*(\\sigma_y\\otimes\\sigma_y)$. Then $C(\\rho) = \\max(0, \\lambda_1 - \\lambda_2 - \\lambda_3 - \\lambda_4)$ (Eq. 3.76). The [[qc-negativity|negativity]] $N(\\rho) = \\sum_j|\\lambda_j^-|$ sums the negative eigenvalues of $\\rho^{T_B}$ (Eqs. 3.77–3.79). For the Werner state $C = (3w-1)/2 = 0.25$ at $w = \\tfrac12$.',
    caption: 'Wootters: $C = \\max(0, \\lambda_1 - \\lambda_2 - \\lambda_3 - \\lambda_4) = 0.25$ for Werner',
    captionFormal: 'negativity sums $|\\lambda_j^-|$ of $\\rho^{T_B}$; Wootters gives $C = 0.25$ for Werner at $w=\\tfrac12$',
    stage: split(tq({ rho: WER(0.5) }), mx(rhoOf(WER(0.5)), { ptranspose: 'B', spectrum: 'bars' })),
    claims: [
      claim('q12WerConcAtHalf', 'the Werner state at $w = \\tfrac12$ has concurrence $0.25$', () => close(V.q12WerConcAtHalf, 0.25, 1e-6)),
      claim('q12WerPptAtHalf', 'and $\\lambda_{\\min}(\\rho^{T_B}) = -0.125$', () => close(V.q12WerPptAtHalf, -0.125, 1e-6)),
      cHalf,
    ],
    fidelity: ['qc-tq-not-two-places'],
  },
  {
    id: 'q12-concurrence:b5',
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
/* q12-multipartite — Three qubits: GHZ, W and monogamy                                             */
/* ---------------------------------------------------------------------------------------------- */

const multipartiteUnit: Beat[] = [
  {
    id: 'q12-multipartite:b1',
    phase: 'books',
    text:
      'With three qubits, entanglement comes in kinds. A state can be a full product, or split as one qubit times an entangled pair, or **genuinely three-way**. Chapter Q7’s [[qc-ghz|GHZ]] state and the [[qc-w-state|W state]] $(|100\\rangle + |010\\rangle + |001\\rangle)/\\sqrt3$ are both genuinely three-way, but differ. (The W state is always this ket, $|W\\rangle$; Unit 12.2’s witness $W$ is always a bare operator — the two never collide.)',
    formal:
      'A pure three-qubit state is fully separable, biseparable (one qubit times a possibly-entangled pair across some cut), or genuinely tripartite entangled (Bergou §3.9). Two genuinely-tripartite examples are $|\\mathrm{GHZ}\\rangle = (|000\\rangle + |111\\rangle)/\\sqrt2$ (Chapter Q7; [[qc-ghz|link]]) and $[[qc-w-state|the W state]] |W\\rangle = (|100\\rangle + |010\\rangle + |001\\rangle)/\\sqrt3$. (Unit 12.2’s witness operator $W$ and this ket $|W\\rangle$ are unrelated; one is always bare, the other always a ket.)',
    caption: 'three qubits: product, one-plus-pair, or genuinely three-way — GHZ and W',
    captionFormal: 'fully separable / biseparable / genuinely tripartite; GHZ and W',
    stage: split(amp(GHZ3, { mode: 'probability' }), tqX(W3, [0, 1])),
    claims: [claim('q12WCircuitFid', 'the drawn W-state circuit is exactly $|W\\rangle$', () => close(V.q12WCircuitFid, 1, 1e-6))],
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
      'Entanglement is **monogamous**: if $A$ is strongly entangled with $B$, it can be only weakly entangled with $C$. The Coffman–Kundu–Wootters bound makes it exact: $C_{A:B}^2 + C_{A:C}^2 \\le C_{A:BC}^2$. The W state saturates it — both sides equal $\\tfrac89$.',
    formal:
      'Monogamy is the CKW inequality $C_{A:B}^2 + C_{A:C}^2\\le C_{A:BC}^2$ (Bergou Eq. 3.84), where $C_{A:BC}$ treats $BC$ as one effective qubit. For $|W\\rangle$: $C_{A:B} = C_{A:C} = \\tfrac23$ and $C_{A:BC} = \\tfrac{2\\sqrt2}3$, so both sides are $\\tfrac89$ — the W state meets the bound with equality (erratum B12 fixes $|v_1\\rangle$).',
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
    text: 'Can local moves (with a shared coin, and allowed to fail) ever turn a W state into a GHZ state?',
    formal: 'Are $|W\\rangle$ and $|\\mathrm{GHZ}\\rangle$ interconvertible by stochastic LOCC ([[qc-sloc|SLOCC]])?',
    stage: amp(W3, { mode: 'probability' }),
    reveal: {
      text: 'No. They are different families. No local operations, even allowed to succeed only sometimes, can convert one into the other. Their three-way entanglement has different shapes.',
      formal:
        'No: GHZ-class and W-class are the two inequivalent [[qc-sloc|SLOCC]] classes of genuinely tripartite states (Bergou §3.9). $|\\psi\\rangle\\to|\\varphi\\rangle$ by SLOCC iff $|\\varphi\\rangle = A\\otimes B\\otimes C|\\psi\\rangle$ with invertible local operators, which cannot map one class to the other. A related but distinct idea is [[qc-bound-entanglement|bound entanglement]]: PPT entangled states — Unit 12.1’s own test returns non-negative — from which no Bell pair can ever be distilled; the known two-qutrit examples are not drawn here, since no stage here holds qutrits.',
      caption: 'no: GHZ-class and W-class are distinct under SLOCC',
      captionFormal: 'no: GHZ-class and W-class are distinct under SLOCC',
      stage: split(amp(GHZ3, { mode: 'probability' }), tqX(W3, [0, 1])),
    },
  },
]

export const Q12_STORY: Record<string, Beat[]> = {
  'q12-ppt': pptUnit,
  'q12-witness': witnessUnit,
  'q12-locc': loccUnit,
  'q12-entropy': entropyUnit,
  'q12-concurrence': concurrenceUnit,
  'q12-multipartite': multipartiteUnit,
}

/** Every unit's claims, gathered from its beats and reveals (for `Unit.claims`, as Q9.ts does). */
function claimsOf(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.derivation ? [...b.derivation.ground, ...b.derivation.formal].flatMap((s) => s.claims ?? []) : []), ...(b.reveal?.claims ?? [])])
}
export const Q12_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof claimsOf>> = Object.fromEntries(Object.entries(Q12_STORY).map(([id, beats]) => [id, claimsOf(beats)]))
export { cHalf }
