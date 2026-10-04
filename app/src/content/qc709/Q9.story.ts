/**
 * Chapter Q9 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q9-story.md §1, in both
 * tracks, with the rulings of docs/roles/decisions/qc709-Q8Q9.md: the running pair P is built with a controlled H
 * (ruling 3); the letters are renamed O, Pi and p+ (plan §12 Q2); Bergou's P2.5 is a cited derivation, not a
 * challenge (ruling 5); an entropy sweep replaces the deferred `plot` view (ruling 6); E gets its own notation beat
 * (ruling 7); Unit 9.6 is Bergou-only, so it carries no [L] beat (ruling 8, qc709-remap.md #11).
 *
 * Standing rules kept here:
 * - Every derivation list (both tracks) carries `view`/`viewCaption` on at least two distinct `StageState`s drawn
 *   from kinds already shown elsewhere in the SAME unit (W-709 #7/#11; docs/patterns/derivation.md).
 * - Every new space or notation has exactly one notation beat (`Beat.introduces`), at or before its glossary
 *   entry's `first` use, with a caption in both tracks (W-709 #8/#12).
 * - No TeX command outside `$...$` in learner-visible text (ruling, qc709-remap.md).
 * - Every number comes from Q9.values.ts (an engine call), never a typed literal.
 */
import type {
  AmpSource,
  AmplitudesState,
  BallPoint,
  BallState,
  Beat,
  HilbertPlaneState,
  MatrixCoef,
  MatrixGateName,
  MatrixGridState,
  MatrixSource,
  Scrub,
  StageLayout,
  StageState,
  TwoQubitState,
} from '../schema'
import { C_COPY, C_PROD } from './Q6.values'
import { C_PUR, V, claim, close } from './Q9.values'

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
/** In Q9, `tq`/`tqR` default to `labels: 'A-B'` (Q8's own default was `'q1-q2'`), per plan §0. */
const tq = (ketSource: AmpSource, extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'labels' | 'arrows' | 'grid'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { ket: ketSource },
  labels: 'A-B',
  arrows: 'reduced',
  grid: 'T',
  shot: 'TQ-PAIR',
  ...extra,
})
const tqR = (rho: RhoSrc, extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'labels' | 'arrows'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { rho },
  labels: 'A-B',
  arrows: 'reduced',
  grid: 'T',
  shot: 'TQ-PAIR',
  ...extra,
})
const tqX = (ket: AmpSource, keep: [number, number], extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'arrows' | 'grid'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { reduce: { ket, keep } },
  arrows: 'reduced',
  grid: 'T',
  shot: 'TQ-PAIR',
  ...extra,
})
const tqF = (thetaDeg: Scrub, extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'arrows' | 'grid' | 'labels'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { family: 'cos-sin', thetaDeg },
  arrows: 'reduced',
  grid: 'T',
  labels: 'A-B',
  shot: 'TQ-PAIR',
  ...extra,
})
const ball = (point: BallPoint, extra: Partial<Omit<BallState, 'kind' | 'point'>> = {}): BallState => ({ kind: 'bloch-ball', point, purity: true, shot: 'B-STD', ...extra })
const hp = (extra: Partial<Omit<HilbertPlaneState, 'kind'>> = {}): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...extra })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

const out = (k: AmpSource): MatrixSource => ({ outer: [k] })
const mixSrc = (...parts: [Scrub, AmpSource][]): RhoSrc => ({ mixture: parts.map(([w, ket]) => ({ w, ket })) })
const lin = (...terms: [MatrixCoef, MatrixSource][]): MatrixSource => ({ lin: terms.map(([c, src]) => ({ c, src })) })
const gateSrc = (name: MatrixGateName): MatrixSource => ({ gate: { name } })

/* Running states (plan §0 "Name / Source / Value") */
const PROD: AmpSource = { circuit: C_PROD, upTo: 1 }
const PSI2: AmpSource = { circuit: C_COPY, upTo: 2 }
const PP: AmpSource = { circuit: C_PUR, upTo: 2 }
const SING: AmpSource = { bell: 'Psi-' }
const GHZ: AmpSource = { bell: '000+111' }
const COIN: RhoSrc = mixSrc([0.5, { ket: '01' }], [0.5, { ket: '10' }])
const ZX_MIX: RhoSrc = mixSrc([0.5, { ket: '0' }], [0.5, { ket: '+' }])
const HALF4_MIX: RhoSrc = mixSrc([0.25, { ket: '00' }], [0.25, { ket: '01' }], [0.25, { ket: '10' }], [0.25, { ket: '11' }])
const bZX: BallPoint = { mix: [{ of: '+z', w: 0.5 }, { of: '+x', w: 0.5 }] }
const bU: BallPoint = { mix: [{ of: { thetaDeg: 45, phiDeg: 0 }, w: V.q9ZXEigLarge }, { of: { thetaDeg: 135, phiDeg: 180 }, w: V.q9ZXEigSmall }] }
/* Reusable claims (fractions recurring across many beats). */
const cHalf = claim('q9Half', 'a chance, coherence or Bloch component of size one half', () => close(V.q9Half, 0.5))
const cQuarter = claim('q9Quarter', 'a chance or component of one quarter', () => close(V.q9Quarter, 0.25))
const cThreeQuarter = claim('q9ThreeQuarter', 'a chance or component of three quarters', () => close(V.q9ThreeQuarter, 0.75))
const cR2 = claim('q9R2', 'a length of 0.707', () => close(V.q9R2, Math.SQRT1_2))

/* ---------------------------------------------------------------------------------------------- */
/* q9-partial-trace — Looking at one part: the partial trace                                        */
/* ---------------------------------------------------------------------------------------------- */

const partialTraceUnit: Beat[] = [
  {
    id: 'q9-partial-trace:b1',
    phase: 'lecture',
    introduces: ['qc-reduced-density-matrix', 'qc-partial-trace'],
    text:
      "Two [[qubit|qubits]], A and B, share a state $\\rho$. We want the averages of readings on A alone: an operator O on A, with nothing done to B. Adding up over B's two basis states leaves a 2 × 2 matrix, $\\rho_A = \\mathrm{Tr}_B\\,\\rho$. This sum is the [[qc-partial-trace|partial trace]], and $\\rho_A$ is A's [[qc-reduced-density-matrix|reduced density matrix]].",
    formal:
      'For an operator O on A alone, $\\langle O\\otimes I\\rangle = \\mathrm{Tr}\\big(\\rho\\,(O\\otimes I)\\big) = \\sum_a\\langle a|\\big(\\sum_b\\langle b|_B\\,\\rho\\,|b\\rangle_B\\big)O|a\\rangle$ (notes p. 38; Bergou Eqs. 2.3–2.5). So $\\langle O\\otimes I\\rangle = \\mathrm{Tr}(\\rho_AO)$, with the [[qc-reduced-density-matrix|reduced density matrix]] $\\rho_A = \\mathrm{Tr}_B\\,\\rho$, the [[qc-partial-trace|partial trace]] over B. Rosetta: the notes write $\\rho(1) = \\mathrm{Tr}_2\\,\\rho$.',
    caption: 'a product pair: A alone is still $\\psi_1$',
    captionFormal: '$\\rho_A = |\\psi_1\\rangle\\langle\\psi_1|$ for $\\psi_1\\otimes|{+}\\rangle$',
    stage: split(mx(out(PROD), { blocks: 2, partialTrace: 'B' }), tq(PROD)),
    derivation: {
      result: '\\langle O\\otimes I\\rangle = \\mathrm{Tr}(\\rho_AO),\\quad \\rho_A = \\mathrm{Tr}_B\\,\\rho',
      ground: [
        { tex: '\\langle O\\otimes I\\rangle = \\mathrm{Tr}\\big(\\rho\\,(O\\otimes I)\\big)', why: "Unit 8.3's trace rule, for an operator O on A alone.", view: mx(out(PROD), { blocks: 2 }), viewCaption: '$\\rho$ of the product pair, in blocks' },
        { tex: '= \\sum_{a,b}\\langle a|\\langle b|\\,\\rho\\,(O\\otimes I)\\,|a\\rangle|b\\rangle', why: 'Write the trace in the basis $|a\\rangle|b\\rangle$.' },
        { tex: '= \\sum_a\\langle a|\\Big(\\sum_b\\langle b|\\rho|b\\rangle\\Big)O|a\\rangle', why: 'I leaves B alone, so the sum over b acts on $\\rho$ only.' },
        { tex: '\\rho_A = \\sum_b\\langle b|_B\\,\\rho\\,|b\\rangle_B = \\mathrm{Tr}_B\\,\\rho', why: 'The inner sum is a 2 × 2 matrix: the partial trace.', view: mx(out(PROD), { blocks: 2, partialTrace: 'B' }), viewCaption: 'block traces give $\\rho_A$' },
        { tex: '\\langle Z_A\\rangle = \\mathrm{Tr}(\\rho_AZ) = 0.5', why: "For the product pair, A's average is $\\psi_1$'s, as it must be.", view: tq(PROD), viewCaption: 'arrow A: z part 0.5' },
        { tex: '\\langle O\\otimes I\\rangle = \\mathrm{Tr}(\\rho_AO),\\quad \\rho_A = \\mathrm{Tr}_B\\,\\rho', why: 'Every reading on A alone needs only $\\rho_A$.' },
      ],
      formal: [
        { tex: '\\mathrm{Tr}\\big(\\rho\\,(O\\otimes I)\\big) = \\sum_a\\langle a|\\Big(\\sum_b\\langle b|_B\\,\\rho\\,|b\\rangle_B\\Big)O|a\\rangle', why: 'notes p. 38; Bergou Eq. 2.3.', view: mx(out(PROD), { blocks: 2 }) },
        { tex: '\\langle O\\otimes I\\rangle = \\mathrm{Tr}(\\rho_AO),\\quad \\rho_A = \\mathrm{Tr}_B\\,\\rho', why: 'Bergou Eqs. 2.4–2.5.', view: mx(out(PROD), { blocks: 2, partialTrace: 'B' }) },
      ],
    },
    claims: [
      claim('q9ProdRA00', "the product pair's $\\rho_A$ diagonal is 0.75", () => close(V.q9ProdRA00, 0.75)),
      claim('q9ProdRA01Abs', 'its coherence has size 0.433', () => close(V.q9ProdRA01Abs, Math.sqrt(3) / 4)),
      claim('q9ProdRA11', 'its other diagonal entry is 0.25', () => close(V.q9ProdRA11, 0.25)),
      claim('q9ProdExpZ1', "A's z average is 0.5", () => close(V.q9ProdExpZ1, 0.5)),
    ],
  },
  {
    id: 'q9-partial-trace:b2',
    phase: 'lecture',
    text:
      "Picture $\\rho$ as a 2 × 2 grid of blocks, one block for each pair of A's labels. Each entry of $\\rho_A$ is the trace of one block. Try $(\\sqrt3|00\\rangle + |11\\rangle)/2$ from Chapter Q6. Its corners of 0.433 sit off their blocks' diagonals and drop out, so $\\rho_A = \\mathrm{diag}(0.75, 0.25)$.",
    formal:
      '$(\\rho_A)_{aa\'} = \\sum_b\\rho_{ab,a\'b}$: each entry is the trace of the $(a, a\')$ block (notes p. 38; Bergou Eq. 2.4). For $\\Psi_2 = (\\sqrt3|00\\rangle + |11\\rangle)/2$ the coherence $\\rho_{00,11} = 0.433$ lies off its block\'s diagonal, so $\\rho_A = \\mathrm{diag}(0.75, 0.25)$: mixed, though $\\Psi_2$ is pure.',
    caption: "block traces 0.75 and 0.25; the 0.433 corners drop out",
    captionFormal: '$\\rho_A = \\mathrm{diag}(0.75, 0.25)$',
    stage: mx(out(PSI2), { blocks: 2, partialTrace: 'B', highlight: [[0, 3], [3, 0]] }),
    claims: [
      claim('q9Psi2Coh', "$\\Psi_2$'s coherence is 0.433", () => close(V.q9Psi2Coh, Math.sqrt(3) / 4)),
      claim('q9Psi2RA00', 'its $\\rho_A$ diagonal is 0.75', () => close(V.q9Psi2RA00, 0.75)),
      claim('q9Psi2RA11', 'and 0.25', () => close(V.q9Psi2RA11, 0.25)),
    ],
  },
  {
    id: 'q9-partial-trace:b3',
    phase: 'lecture',
    text:
      "Now the singlet, $\\Psi^- = (|01\\rangle - |10\\rangle)/\\sqrt2$, which the notes call $\\beta_{11}$. Its $\\rho$ has ½ in two diagonal places and −½ in two corners. The diagonal blocks each have trace ½, and the corners drop out. So $\\rho_A = \\tfrac12I$: qubit A alone is a fair coin along every axis, though the pair is pure.",
    formal:
      'For $\\Psi^-$ (notes, N&C: $\\beta_{11}$; Bergou: $\\Phi_-$), $\\rho$ has ½ at (01, 01) and (10, 10) and −½ at (01, 10) and (10, 01) (notes p. 38). Tracing out B gives $\\rho_A = \\tfrac12I$ (notes p. 39): particle A is [[unpolarized|unpolarized]], $\\mathbf r_A = 0$, though the pair is in a definite pure state.',
    caption: 'the singlet: both arrows zero; grid −1, −1, −1',
    captionFormal: '$\\rho_A = \\tfrac12I$, $T = -I_3$',
    stage: split(mx(out(SING), { blocks: 2, partialTrace: 'B' }), tq(SING)),
    derivation: {
      result: '\\mathrm{Tr}_B|\\Psi^-\\rangle\\langle\\Psi^-| = \\tfrac12I',
      ground: [
        { tex: '\\Psi^- = \\tfrac1{\\sqrt2}(|01\\rangle - |10\\rangle)', why: 'The singlet: the two qubits always differ.', view: mx(out(SING)), viewCaption: 'amplitude grid: 0.707 and −0.707' },
        { tex: '\\rho = \\tfrac12\\big(|01\\rangle\\langle01| - |01\\rangle\\langle10| - |10\\rangle\\langle01| + |10\\rangle\\langle10|\\big)', why: 'Four terms: two on the diagonal, two corners of −½.', view: mx(out(SING), { blocks: 2 }), viewCaption: '$\\rho$ in blocks' },
        { tex: "(\\rho_A)_{00} = \\rho_{00,00} + \\rho_{01,01} = \\tfrac12", why: 'The trace of the top-left block.' },
        { tex: "(\\rho_A)_{01} = \\rho_{00,10} + \\rho_{01,11} = 0", why: "The off-diagonal block has zeros on its own diagonal; the −½ sits off it." },
        { tex: "(\\rho_A)_{11} = \\rho_{10,10} + \\rho_{11,11} = \\tfrac12", why: 'The bottom-right block.', view: mx(out(SING), { blocks: 2, partialTrace: 'B' }), viewCaption: '$\\rho_A = \\tfrac12I$' },
        { tex: '\\mathrm{Tr}_B|\\Psi^-\\rangle\\langle\\Psi^-| = \\tfrac12I', why: 'A alone is a fair coin: its arrow has length 0.', view: tq(SING), viewCaption: 'both arrows zero' },
      ],
      formal: [
        { tex: '|\\Psi^-\\rangle\\langle\\Psi^-| = \\tfrac12\\begin{pmatrix}0&0&0&0\\\\0&1&-1&0\\\\0&-1&1&0\\\\0&0&0&0\\end{pmatrix}', why: 'notes p. 38.', view: mx(out(SING), { blocks: 2 }) },
        { tex: '\\mathrm{Tr}_B|\\Psi^-\\rangle\\langle\\Psi^-| = \\tfrac12I', why: 'notes p. 39; $\\mathbf r_A = 0$.', view: mx(out(SING), { blocks: 2, partialTrace: 'B' }) },
      ],
    },
    claims: [cHalf],
  },
  {
    id: 'q9-partial-trace:b4',
    phase: 'books',
    text:
      "Homework 2, Problem 2(d) asks for $\\rho_A$ of each Bell state $\\beta_{xy}$. All four give $\\tfrac12I$. So no reading of qubit A alone can tell them apart. Yet Unit 6.5's circuit tells them apart perfectly. There is no conflict: that circuit acts on both qubits, and the four states differ only in their grids.",
    formal:
      'HW2 P2(d): $\\mathrm{Tr}_2|\\beta_{xy}\\rangle\\langle\\beta_{xy}| = \\tfrac12I$ for all four, so every one-[[qubit|qubit]] statistic $\\mathrm{Tr}(\\rho_AO)$ is the same. The Bell measurement is a joint measurement; the states differ only in $T = \\mathrm{diag}\\big((-1)^x, -(-1)^{x+y}, (-1)^y\\big)$, which no local reading sees.',
    caption: 'four Bell states: the same zero arrows, four different grids',
    captionFormal: '$\\rho_A = \\tfrac12I$ for every $\\beta_{xy}$',
    stage: tq({ bell: 'Phi-' }),
    derivation: {
      result: '\\mathrm{Tr}_2|\\beta_{xy}\\rangle\\langle\\beta_{xy}| = \\tfrac12I\\ \\text{for all}\\ x, y',
      ground: [
        { tex: '|\\beta_{xy}\\rangle = \\tfrac1{\\sqrt2}\\big(|0, y\\rangle + (-1)^x|1, 1\\oplus y\\rangle\\big)', why: "Unit 6.4's two-bit names.", view: tq({ bell: 'Phi+' }), viewCaption: '$\\beta_{00} = \\Phi^+$' },
        { tex: '\\mathrm{Tr}_2|\\beta_{xy}\\rangle\\langle\\beta_{xy}| = \\tfrac12|0\\rangle\\langle0| + \\tfrac12|1\\rangle\\langle1|', why: 'The two terms carry different labels on qubit 2, y and $1\\oplus y$, so their cross terms drop out, and the sign $(-1)^x$ goes with them.', view: mx(out({ bell: 'Phi+' }), { blocks: 2, partialTrace: 'B' }), viewCaption: '$\\Phi^+$: $\\tfrac12I$' },
        { tex: '= \\tfrac12I', why: 'The same for every x and y.', view: tq({ bell: 'Psi-' }), viewCaption: '$\\beta_{11} = \\Psi^-$: zero arrows, a different grid' },
        { tex: 'T_{\\beta_{xy}} = \\mathrm{diag}\\big((-1)^x, -(-1)^{x+y}, (-1)^y\\big)', why: 'What differs is the grid, which only joint readings see.', view: tq({ bell: 'Phi-' }), viewCaption: '$\\beta_{10} = \\Phi^-$' },
        { tex: '\\mathrm{Tr}_2|\\beta_{xy}\\rangle\\langle\\beta_{xy}| = \\tfrac12I\\ \\text{for all}\\ x, y', why: 'No reading of qubit 1 alone tells the four apart.' },
      ],
      formal: [
        { tex: '\\mathrm{Tr}_2|\\beta_{xy}\\rangle\\langle\\beta_{xy}| = \\tfrac12\\big(|0\\rangle\\langle0| + |1\\rangle\\langle1|\\big)', why: '$\\langle y|1\\oplus y\\rangle = 0$ removes the cross terms.', view: mx(out({ bell: 'Phi+' }), { blocks: 2, partialTrace: 'B' }) },
        { tex: '\\mathrm{Tr}_2|\\beta_{xy}\\rangle\\langle\\beta_{xy}| = \\tfrac12I\\ \\text{for all}\\ x, y', why: 'The Bell measurement is joint, so there is no contradiction (HW2 P2(d)).', view: tq({ bell: 'Psi-' }) },
      ],
    },
    claims: [cHalf, claim('q9BellRAGapMax', 'every Bell state leaves $\\rho_A = \\tfrac12I$', () => close(V.q9BellRAGapMax, 0, 1e-9))],
  },
  {
    id: 'q9-partial-trace:b5',
    phase: 'books',
    text:
      "Homework 2, Problem 7(e) traces qubit 3 out of GHZ. Only the terms that agree on qubit 3 survive. The result is $\\tfrac12(|00\\rangle\\langle00| + |11\\rangle\\langle11|)$: the box of Unit 8.1, now obtained without any reading. It is a [[qc-mixture|mixture]] of two products, so qubits 1 and 2 share no entanglement.",
    formal:
      'HW2 P7(e): $\\rho_{12} = \\mathrm{Tr}_3|\\mathrm{GHZ}\\rangle\\langle\\mathrm{GHZ}| = \\tfrac12(|00\\rangle\\langle00| + |11\\rangle\\langle11|)$, the box of Unit 8.1 (notes p. 35). It is a convex [[qc-mixture|mixture]] of products, so the remaining pair is not entangled (Chapter Q10 names such states): GHZ entanglement does not survive the loss of one qubit.',
    caption: 'trace out qubit 3: the GHZ box again',
    captionFormal: '$T_{zz} = 1$, $T_{xx} = T_{yy} = 0$',
    stage: split(mx(out(GHZ), { blocks: 4, partialTrace: { keep: [0, 1] } }), tqX(GHZ, [0, 1], { labels: 'q1-q2' })),
    derivation: {
      result: '\\mathrm{Tr}_3|\\mathrm{GHZ}\\rangle\\langle\\mathrm{GHZ}| = \\tfrac12(|00\\rangle\\langle00| + |11\\rangle\\langle11|)',
      ground: [
        { tex: '|\\mathrm{GHZ}\\rangle\\langle\\mathrm{GHZ}| = \\tfrac12\\big(|000\\rangle\\langle000| + |000\\rangle\\langle111| + |111\\rangle\\langle000| + |111\\rangle\\langle111|\\big)', why: 'Four terms: two on the diagonal, two in the far corners.', view: mx(out(GHZ), { blocks: 4 }), viewCaption: '8 × 8, four filled cells' },
        { tex: "\\mathrm{Tr}_3\\,|x\\,c\\rangle\\langle x'\\,c'| = \\delta_{cc'}\\,|x\\rangle\\langle x'|", why: "Here x, x' label qubits 1 and 2, and c, c' label qubit 3. A term survives only if its qubit-3 labels agree." },
        { tex: '|000\\rangle\\langle111| \\mapsto 0,\\quad |111\\rangle\\langle000| \\mapsto 0', why: "The corner terms have c = 0 and c' = 1: they vanish." },
        { tex: '\\tfrac12|000\\rangle\\langle000| + \\tfrac12|111\\rangle\\langle111| \\mapsto \\tfrac12|00\\rangle\\langle00| + \\tfrac12|11\\rangle\\langle11|', why: 'The diagonal terms survive.', view: mx(out(GHZ), { blocks: 4, partialTrace: { keep: [0, 1] } }), viewCaption: 'keep qubits 1 and 2' },
        { tex: 'T_{zz} = 1,\\quad T_{xx} = T_{yy} = 0', why: "The grid of Unit 8.1's box.", view: tqX(GHZ, [0, 1], { labels: 'q1-q2' }), viewCaption: 'the GHZ box' },
        { tex: '\\mathrm{Tr}_3|\\mathrm{GHZ}\\rangle\\langle\\mathrm{GHZ}| = \\tfrac12(|00\\rangle\\langle00| + |11\\rangle\\langle11|)', why: 'A mixture of two products.' },
      ],
      formal: [
        { tex: "\\mathrm{Tr}_3\\,|x c\\rangle\\langle x'c'| = \\delta_{cc'}|x\\rangle\\langle x'|", why: 'HW2 P7(e).', view: mx(out(GHZ), { blocks: 4 }) },
        { tex: '\\mathrm{Tr}_3|\\mathrm{GHZ}\\rangle\\langle\\mathrm{GHZ}| = \\tfrac12(|00\\rangle\\langle00| + |11\\rangle\\langle11|)', why: "Not entangled; Unit 8.1's box.", view: tqX(GHZ, [0, 1], { labels: 'q1-q2' }) },
      ],
    },
    claims: [cHalf, claim('q9GhzR1200', "GHZ's reduced pair has diagonal 0.5", () => close(V.q9GhzR1200, 0.5))],
  },
  {
    id: 'q9-partial-trace:b6',
    phase: 'clue',
    text: 'The product $\\psi_1\\otimes|+\\rangle$ and the pair $(\\sqrt3|00\\rangle + |11\\rangle)/2$ both give $\\langle Z_A\\rangle = 0.5$. Do they leave qubit A in the same state?',
    formal: 'Compare $\\rho_A$ for $\\psi_1\\otimes|{+}\\rangle$ and for $\\Psi_2 = (\\sqrt3|00\\rangle + |11\\rangle)/2$.',
    stage: amp(PSI2, { mode: 'probability' }),
    reveal: {
      text: 'No. The product leaves A pure, with corners of 0.433. The entangled pair leaves A mixed, with no corners. An x reading on A tells them apart: 0.866 against 0.',
      formal: '$\\rho_A = |\\psi_1\\rangle\\langle\\psi_1|$ (purity 1) against $\\mathrm{diag}(0.75, 0.25)$ (purity 0.625): equal diagonals, different coherences, so $\\langle X_A\\rangle$ is 0.866 against 0.',
      caption: "A's corners: 0.433 against 0",
      captionFormal: "A's corners: 0.433 against 0",
      stage: mx(out(PSI2), { blocks: 2, partialTrace: 'B' }),
      claims: [
        claim('q9ProdExpX1', "the product's $\\langle X_A\\rangle$ is 0.866", () => close(V.q9ProdExpX1, Math.sqrt(3) / 2)),
        claim('q9Psi2ExpX1', "$\\Psi_2$'s $\\langle X_A\\rangle$ is 0", () => close(V.q9Psi2ExpX1, 0, 1e-9)),
        claim('q9ProdRA01Abs', "the product's corner has size 0.433", () => close(V.q9ProdRA01Abs, Math.sqrt(3) / 4)),
        claim('q9Psi2Pur', "$\\Psi_2$'s $\\rho_A$ has purity 0.625", () => close(V.q9Psi2Pur, 0.625)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q9-same-part — Same part, different whole                                                       */
/* ---------------------------------------------------------------------------------------------- */

const samePartUnit: Beat[] = [
  {
    id: 'q9-same-part:b1',
    phase: 'lecture',
    text:
      "Here is a classical copy of the singlet: a coin chooses $|01\\rangle$ or $|10\\rangle$, half each. The two spins always point opposite ways along z. Trace out B and you get $\\rho_A = \\tfrac12I$, exactly as for the singlet. Qubit A alone cannot tell the two pairs apart, and neither can B.",
    formal:
      'The mixture $\\rho_c = \\tfrac12(|01\\rangle\\langle01| + |10\\rangle\\langle10|)$ (notes p. 39) has $\\mathrm{Tr}_B\\,\\rho_c = \\tfrac12I$, the singlet\'s $\\rho_A$, and likewise for B. Looking at one particle can never distinguish the entangled pure state from this classical mixture.',
    caption: 'the coin pair: $\\rho_A = \\tfrac12I$ again',
    captionFormal: '$\\mathrm{Tr}_B\\,\\rho_c = \\mathrm{Tr}_B|\\Psi^-\\rangle\\langle\\Psi^-| = \\tfrac12I$',
    stage: split(mx({ rho: COIN }, { blocks: 2, partialTrace: 'B' }), tqR(COIN)),
    claims: [cHalf, claim('q9CoinRAGap', "the coin pair's $\\rho_A$ is $\\tfrac12I$", () => close(V.q9CoinRAGap, 0, 1e-9))],
    fidelity: ['qc-tq-not-two-places'],
  },
  {
    id: 'q9-same-part:b2',
    phase: 'lecture',
    text:
      "The difference lives in the grid. The coin pair fills one cell: $zz = -1$. The singlet has −1 in all three diagonal cells, so its x and y readings disagree too. Only readings on both qubits can see this. Chapter Q10's Bell inequality is built on exactly that.",
    formal:
      '$T_c = \\mathrm{diag}(0, 0, -1)$ against $T_{\\Psi^-} = \\mathrm{diag}(-1, -1, -1)$: the parts agree and the wholes differ. The difference lies entirely in the correlations, which only joint measurements reveal (notes p. 39). For example $\\langle X_AX_B\\rangle$ is 0 for $\\rho_c$ and −1 for $\\Psi^-$.',
    caption: '$xx$: 0 for the coin pair, −1 for the singlet',
    captionFormal: '$T_c = \\mathrm{diag}(0, 0, -1)$, $T_{\\Psi^-} = -I_3$',
    stage: tq(SING, { highlight: ['xx', 'yy'] }),
    claims: [claim('q9CoinXX', "the coin pair's $\\langle X_AX_B\\rangle$ is 0", () => close(V.q9CoinXX, 0, 1e-9)), claim('q9SingXX', "the singlet's is −1", () => close(V.q9SingXX, -1))],
    fidelity: ['qc-tq-grid-signed'],
  },
  {
    id: 'q9-same-part:b3',
    phase: 'lecture',
    text:
      "A two-qubit $\\rho$ has 16 entries, one for each row label $ab$ and column label $a'b'$. Write them $\\rho_{ab,a'b'}$. The partial trace keeps the entries whose B labels agree, $b = b'$, and adds over b. The rule works for any $\\rho$, pure or mixed.",
    formal:
      "In general $\\rho = \\sum p_{i_1i_2,j_1j_2}|i_1\\rangle\\langle j_1|\\otimes|i_2\\rangle\\langle j_2|$ (notes Eq. 2.22), and $\\mathrm{Tr}_2\\,\\rho = \\sum p_{i_1k,j_1k}|i_1\\rangle\\langle j_1|$ since $\\mathrm{Tr}|i_2\\rangle\\langle j_2| = \\delta_{i_2j_2}$. Bergou's example (Eqs. 2.8–2.10, with Eq. 2.9's Tr read as $\\mathrm{Tr}_B$) is $\\Psi^+ \\mapsto \\tfrac12I$.",
    caption: 'keep $b = b\'$, add over b',
    captionFormal: "$\\mathrm{Tr}_2\\big(|i_1\\rangle\\langle j_1|\\otimes|i_2\\rangle\\langle j_2|\\big) = \\delta_{i_2j_2}|i_1\\rangle\\langle j_1|$",
    stage: mx(out({ bell: 'Psi+' }), { blocks: 2, partialTrace: 'B' }),
    claims: [cHalf, claim('q9BellPlusRAGap', "$\\Psi^+$'s $\\rho_A$ is $\\tfrac12I$", () => close(V.q9BellPlusRAGap, 0, 1e-9))],
  },
  {
    id: 'q9-same-part:b4',
    phase: 'clue',
    text: 'You may read both qubits along x and multiply the results. Can this tell the singlet from the coin pair?',
    formal: 'Does $\\langle X_AX_B\\rangle$ distinguish $\\Psi^-$ from $\\rho_c$?',
    stage: tqR(COIN, { grid: 'none' }),
    reveal: {
      text: 'Yes. The singlet gives −1 every time; the coin pair averages 0. One joint reading does what no reading of a single qubit can.',
      formal: '$\\langle XX\\rangle_{\\Psi^-} = -1$ and $\\mathrm{Tr}(\\rho_c\\,XX) = 0$: a joint observable separates two states whose reduced states coincide.',
      caption: '$xx$: −1 against 0',
      captionFormal: '$xx$: −1 against 0',
      stage: tq(SING, { highlight: ['xx'] }),
      claims: [claim('q9SingXX', 'the singlet gives −1', () => close(V.q9SingXX, -1)), claim('q9CoinXX', 'the coin pair gives 0', () => close(V.q9CoinXX, 0, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q9-entropy — Entropy: how mixed is a state?                                                      */
/* ---------------------------------------------------------------------------------------------- */

const entropyUnit: Beat[] = [
  {
    id: 'q9-entropy:b1',
    phase: 'lecture',
    introduces: ['qc-von-neumann-entropy'],
    text:
      "How much is unknown about a state? Take $\\rho$'s eigenvalues $\\lambda$, which act as chances. The [[qc-von-neumann-entropy|entropy]] is $S(\\rho) = -\\sum\\lambda\\log_2\\lambda$, counted in bits. Here $\\log_2x$ is the power of 2 that gives x, so $\\log_2\\tfrac12 = -1$, and a zero eigenvalue adds nothing. Unit 8.4's mixture has $S = 0.601$ bit.",
    formal:
      'The [[qc-von-neumann-entropy|von Neumann entropy]] is $S(\\rho) = -\\mathrm{Tr}(\\rho\\log_2\\rho) = -\\sum_i\\lambda_i\\log_2\\lambda_i$, with $0\\log_20 = 0$ (notes Eq. 2.23; N&C §11.3 p. 510): the Shannon entropy of $\\rho$\'s spectrum, basis-independent and ≥ 0. Unit 8.4\'s mixture, with eigenvalues 0.854 and 0.146, has $S = 0.601$ bit.',
    caption: "Unit 8.4's mixture: 0.601 bit",
    captionFormal: '$S = -\\sum\\lambda\\log_2\\lambda = 0.601$',
    stage: mx({ rho: ZX_MIX }, { spectrum: 'entropy' }),
    claims: [
      claim('q9SZX', "Unit 8.4's mixture has entropy 0.601", () => close(V.q9SZX, 0.6008760366928562, 1e-6)),
      claim('q9ZXEigLarge', 'its larger eigenvalue is 0.854', () => close(V.q9ZXEigLarge, (2 + Math.SQRT2) / 4)),
      claim('q9ZXEigSmall', 'its smaller is 0.146', () => close(V.q9ZXEigSmall, (2 - Math.SQRT2) / 4)),
    ],
  },
  {
    id: 'q9-entropy:b2',
    phase: 'lecture',
    text:
      'A pure state has eigenvalues 1 and 0, so $S = 0$: nothing is unknown. The fair coin $\\tfrac12I$ has two eigenvalues of ½, so $S = 1$ bit. Two qubits in $\\tfrac14I$ give 2 bits. In d dimensions the most is $\\log_2d$, reached only by $I/d$.',
    formal:
      'Pure states have $\\lambda \\in \\{0, 1\\}$ and $S = 0$. $\\tfrac12I$ has $S = -2\\cdot\\tfrac12\\log_2\\tfrac12 = 1$ bit, and $I/d$ has $S = \\log_2d$, the maximum (notes p. 39). For two qubits $\\tfrac14I_4$ has $S = 2$.',
    caption: 'S: 0, 1 and 2 bits',
    captionFormal: '$0 \\le S \\le \\log_2d$',
    stage: mx({ rho: HALF4_MIX }, { spectrum: 'entropy' }),
    derivation: {
      result: 'S = 0\\ \\text{(pure)},\\quad S(\\tfrac12I) = 1,\\quad S(I/d) = \\log_2d',
      ground: [
        { tex: 'S(\\rho) = -\\sum_i\\lambda_i\\log_2\\lambda_i', why: 'Entropy from the eigenvalues.', view: mx({ rho: ZX_MIX }, { spectrum: 'entropy' }), viewCaption: "Unit 8.4's mixture: 0.601 bit" },
        { tex: '\\lambda \\in \\{1, 0\\} \\Rightarrow S = -1\\cdot\\log_21 - 0 = 0', why: 'Pure: $\\log_21 = 0$, and the zero eigenvalue adds nothing.', view: mx(out({ ket: '0' }), { spectrum: 'entropy' }), viewCaption: 'a pure state: S = 0' },
        { tex: '\\lambda = \\tfrac12, \\tfrac12 \\Rightarrow S = -2\\cdot\\tfrac12\\log_2\\tfrac12 = 1', why: 'The fair coin: one bit.', view: mx({ rho: mixSrc([0.5, { ket: '0' }], [0.5, { ket: '1' }]) }, { spectrum: 'entropy' }), viewCaption: '$\\tfrac12I$: 1 bit' },
        { tex: '\\lambda_i = \\tfrac1d \\Rightarrow S = d\\cdot\\tfrac1d\\log_2d = \\log_2d', why: 'd equal eigenvalues.', view: mx({ rho: HALF4_MIX }, { spectrum: 'entropy' }), viewCaption: '$\\tfrac14I_4$: 2 bits' },
        { tex: 'S = 0\\ \\text{(pure)},\\quad S(\\tfrac12I) = 1,\\quad S(I/d) = \\log_2d', why: 'No state in d dimensions has more.' },
      ],
      formal: [
        { tex: 'S(\\rho) = -\\mathrm{Tr}(\\rho\\log_2\\rho) = -\\sum_i\\lambda_i\\log_2\\lambda_i', why: 'notes Eq. 2.23.', view: mx({ rho: ZX_MIX }, { spectrum: 'entropy' }) },
        { tex: 'S = 0\\ \\text{(pure)},\\quad S(\\tfrac12I) = 1,\\quad S(I/d) = \\log_2d', why: 'The Shannon bound for d outcomes (N&C §11.3).', view: mx({ rho: HALF4_MIX }, { spectrum: 'entropy' }) },
      ],
    },
    claims: [claim('q9SPure', 'a pure state has entropy 0', () => close(V.q9SPure, 0, 1e-9)), claim('q9SHalf', '$\\tfrac12I$ has entropy 1', () => close(V.q9SHalf, 1, 1e-6)), claim('q9SQuarter4', '$\\tfrac14I_4$ has entropy 2', () => close(V.q9SQuarter4, 2, 1e-6)), cHalf],
  },
  {
    id: 'q9-entropy:b3',
    phase: 'lecture',
    text:
      'For one qubit the eigenvalues are $(1 + |\\mathbf r|)/2$ and $(1 - |\\mathbf r|)/2$. So S depends only on the arrow\'s length. It is 1 bit at the centre and 0 on the surface. At length 0.5 it is 0.811 bit, and Unit 8.4\'s mixture, at length 0.707, has 0.601.',
    formal:
      '$\\lambda_\\pm = \\tfrac12(1 \\pm |\\mathbf r|)$, so $S = h\\big(\\tfrac12(1 + |\\mathbf r|)\\big)$ with $h(p) = -p\\log_2p - (1 - p)\\log_2(1 - p)$. It falls from 1 at the centre to 0 on the surface: 0.811 at $|\\mathbf r| = 0.5$, 0.601 at 0.707.',
    caption: 'length 0.5: S = 0.811 bit',
    captionFormal: '$S = h\\big(\\tfrac12(1 + |\\mathbf r|)\\big)$',
    stage: split(ball({ r: [0, 0, 0.5] }), mx({ rho: rHalfRho(0.75, 0.25) }, { spectrum: 'entropy' })),
    derivation: {
      result: 'S = h\\big(\\tfrac12(1 + |\\mathbf r|)\\big)',
      ground: [
        { tex: '\\rho = \\tfrac12(I + \\mathbf r\\cdot\\boldsymbol\\sigma)', why: "Unit 8.5's form.", view: ball('oven'), viewCaption: 'length 0: the centre' },
        { tex: '\\lambda_\\pm = \\tfrac12(1 \\pm |\\mathbf r|)', why: 'The eigenvalues add to 1 and multiply to $\\det\\rho = \\tfrac14(1 - |\\mathbf r|^2)$.' },
        { tex: 'S = -\\lambda_+\\log_2\\lambda_+ - \\lambda_-\\log_2\\lambda_-', why: "Only the arrow's length enters.", view: mx({ rho: rHalfRho(0.75, 0.25) }, { spectrum: 'entropy' }), viewCaption: 'length 0.5: S = 0.811' },
        { tex: 'S(0) = 1,\\ S(0.5) = 0.811,\\ S(0.707) = 0.601,\\ S(1) = 0', why: 'Four lengths.', view: ball({ r: [0, 0, 0.5] }), viewCaption: 'length 0.5: S = 0.811' },
        { tex: 'S = h\\big(\\tfrac12(1 + |\\mathbf r|)\\big)', why: 'with $h(p) = -p\\log_2p - (1 - p)\\log_2(1 - p)$.' },
      ],
      formal: [
        { tex: '\\lambda_\\pm = \\tfrac12(1 \\pm |\\mathbf r|)', why: 'From the trace and the determinant.', view: ball({ r: [0, 0, 0.5] }) },
        { tex: 'S = h\\big(\\tfrac12(1 + |\\mathbf r|)\\big)', why: 'Monotone in $|\\mathbf r|$, from 1 to 0.', view: mx({ rho: rHalfRho(0.75, 0.25) }, { spectrum: 'entropy' }) },
      ],
    },
    claims: [
      claim('q9S0', 'at the centre, S = 1', () => close(V.q9S0, 1, 1e-6)),
      claim('q9S05', 'at length 0.5, S = 0.811', () => close(V.q9S05, 0.8112781244591328, 1e-6)),
      claim('q9S0707', 'at length 0.707, S = 0.601', () => close(V.q9S0707, 0.6008760366928562, 1e-6)),
      claim('q9S1', 'on the surface, S = 0', () => close(V.q9S1, 0, 1e-9)),
      cHalf,
      cThreeQuarter,
      cQuarter,
    ],
  },
  {
    id: 'q9-entropy:b4',
    phase: 'lecture',
    introduces: ['qc-entanglement-entropy'],
    text:
      'For a pure pair, the entropy of one half measures how entangled the pair is. It is the [[qc-entanglement-entropy|entanglement entropy]], $E = S(\\rho_A)$. A product gives 0 and each Bell state 1 bit. $(\\sqrt3|00\\rangle + |11\\rangle)/2$ gives 0.811 bit: entangled, but less than a Bell pair.',
    formal:
      'For a pure $|\\psi\\rangle_{AB}$ the [[qc-entanglement-entropy|entanglement entropy]] is $E = S(\\rho_A) = S(\\rho_B)$ (Bergou §3.7.1 p. 47, Eq. 3.41; Unit 9.4 proves the equality). Products give 0, Bell states 1 bit, $\\Psi_2$ 0.811. Chapter Q12 develops E as a measure of entanglement.',
    caption: 'E: 0, 0.811 and 1 bit',
    captionFormal: '$E(\\Psi_2) = h(0.75) = 0.811$',
    stage: tq(PSI2, { readouts: ['entropy', 'rLength'] }),
    claims: [
      claim('q9EProd', 'a product pair has E = 0', () => close(V.q9EProd, 0, 1e-9)),
      claim('q9EBell', 'a Bell state has E = 1', () => close(V.q9EBell, 1, 1e-6)),
      claim('q9EPsi2', '$\\Psi_2$ has E = 0.811', () => close(V.q9EPsi2, 0.8112781244591328, 1e-6)),
    ],
  },
  {
    id: 'q9-entropy:b5',
    phase: 'clue',
    text: 'Which has more entropy: the GHZ box of Unit 8.1, or Unit 8.4\'s one-qubit mixture?',
    formal: 'Compare $S(\\rho_{12})$ for the GHZ box with S of $\\tfrac12(|0\\rangle\\langle0| + |{+}\\rangle\\langle{+}|)$.',
    stage: mx(out(GHZ), { blocks: 4, partialTrace: { keep: [0, 1] } }),
    reveal: {
      text: "The box: 1 bit, against 0.601. The box is a fair coin between two [[orthogonal|orthogonal]] states. The mixture's two members overlap, so less is unknown.",
      formal: '$S(\\rho_{12}) = 1$ (eigenvalues ½, ½, 0, 0) against 0.601: mixing non-[[orthogonal|orthogonal]] states gives less entropy than the Shannon entropy of the weights.',
      caption: '1 bit against 0.601',
      captionFormal: '1 bit against 0.601',
      stage: mx(out(GHZ), { blocks: 4, partialTrace: { keep: [0, 1] }, spectrum: 'entropy' }),
      claims: [claim('q9SBox', 'the GHZ box has entropy 1', () => close(V.q9SBox, 1, 1e-6)), claim('q9SZX', "Unit 8.4's mixture has entropy 0.601", () => close(V.q9SZX, 0.6008760366928562, 1e-6)), cHalf],
    },
  },
]

/** rho(r) = diag((1+r)/2, (1-r)/2), as a RhoSrc for the `matrix` stage. */
function rHalfRho(p0: number, p1: number): RhoSrc {
  return mixSrc([p0, { ket: '0' }], [p1, { ket: '1' }])
}

/* ---------------------------------------------------------------------------------------------- */
/* q9-schmidt — The Schmidt form of a pair                                                          */
/* ---------------------------------------------------------------------------------------------- */

const schmidtUnit: Beat[] = [
  {
    id: 'q9-schmidt:b1',
    phase: 'lecture',
    text:
      "Take the pair $P = (|00\\rangle + |{+}\\rangle|1\\rangle)/\\sqrt2$. Group its terms by A's state. After $|0\\rangle$ comes $\\tilde v_0 = 0.707|0\\rangle + 0.5|1\\rangle$, and after $|1\\rangle$ comes $\\tilde v_1 = 0.5|1\\rangle$. Every pair can be grouped this way. But here the partners overlap: $\\langle\\tilde v_0|\\tilde v_1\\rangle = 0.25$.",
    formal:
      'Any $|\\psi\\rangle_{AB} = \\sum_{i_1i_2}c_{i_1i_2}|u_{i_1}\\rangle|v_{i_2}\\rangle = \\sum_{i_1}|u_{i_1}\\rangle|\\tilde v_{i_1}\\rangle$ with $|\\tilde v_{i_1}\\rangle = \\sum_{i_2}c_{i_1i_2}|v_{i_2}\\rangle$ (notes Eq. 2.24; Bergou Eqs. 2.47–2.48). The $|\\tilde v\\rangle$ are the rows of C and are not orthogonal in general: for P, $\\langle\\tilde v_0|\\tilde v_1\\rangle = 0.25$.',
    caption: "the grid's rows: $\\tilde v_0$ and $\\tilde v_1$, overlap 0.25",
    captionFormal: '$\\tilde v_{i_1}$ = row $i_1$ of C',
    stage: split(amp(PP), mx({ coef: PP }, { highlightRow: 0 })),
    claims: [
      claim('q9P00', "P's 00 amplitude is 0.707", () => close(V.q9P00, Math.SQRT1_2)),
      claim('q9P01', "its 01 and 11 amplitudes are 0.5", () => close(V.q9P01, 0.5)),
      claim('q9PVtOverlap', "the grid's row overlap is 0.25", () => close(V.q9PVtOverlap, 0.25)),
    ],
  },
  {
    id: 'q9-schmidt:b2',
    phase: 'lecture',
    introduces: ['qc-schmidt-decomposition'],
    text:
      "Group by a better basis for A: the eigenvectors of $\\rho_A$. Here $\\rho_A$ is Unit 8.4's mixture, so they are Unit 8.6's $|u_\\pm\\rangle$. Now the partners come out orthogonal, with squared lengths 0.854 and 0.146. Scaled to length 1, they are $|{+}\\rangle$ and $|{-}\\rangle$: $P = 0.924|u_+\\rangle|{+}\\rangle + 0.383|u_-\\rangle|{-}\\rangle$. This is the [[qc-schmidt-decomposition|Schmidt form]].",
    formal:
      "Choose $\\{|u_{i_1}\\rangle\\}$ to diagonalize $\\rho_A = \\sum\\lambda_{i_1}|u_{i_1}\\rangle\\langle u_{i_1}|$. Comparing with $\\rho_A = \\sum\\langle\\tilde v_{i_1'}|\\tilde v_{i_1}\\rangle|u_{i_1}\\rangle\\langle u_{i_1'}|$ forces $\\langle\\tilde v_{i_1'}|\\tilde v_{i_1}\\rangle = \\delta_{i_1i_1'}\\lambda_{i_1}$ (notes Eqs. 2.25–2.26). With $|w_{i_1}\\rangle = |\\tilde v_{i_1}\\rangle/\\sqrt{\\lambda_{i_1}}$ this is the [[qc-schmidt-decomposition|Schmidt decomposition]] $|\\psi\\rangle = \\sum_{i_1}\\sqrt{\\lambda_{i_1}}|u_{i_1}\\rangle|w_{i_1}\\rangle$ (Eq. 2.27); for P, $|w_\\pm\\rangle = |{\\pm}\\rangle$.",
    caption: 'Schmidt weights 0.924 and 0.383',
    captionFormal: '$P = \\sqrt{\\lambda_+}|u_+\\rangle|{+}\\rangle + \\sqrt{\\lambda_-}|u_-\\rangle|{-}\\rangle$',
    stage: split(mx({ coef: PP }, { svd: true }), tq(PP)),
    derivation: {
      result: '|\\psi\\rangle_{AB} = \\sum_{i_1}\\sqrt{\\lambda_{i_1}}|u_{i_1}\\rangle_A|w_{i_1}\\rangle_B',
      ground: [
        { tex: '|\\psi\\rangle = \\sum_{i_1}|u_{i_1}\\rangle|\\tilde v_{i_1}\\rangle', why: "Group the terms by A's basis states.", view: mx({ coef: PP }, { highlightRow: 0 }), viewCaption: 'row 0 of the grid: $\\tilde v_0$' },
        { tex: "\\rho_A = \\sum_{i_1, i_1'}\\langle\\tilde v_{i_1'}|\\tilde v_{i_1}\\rangle\\,|u_{i_1}\\rangle\\langle u_{i_1'}|", why: "Trace out B: the partners' overlaps become the entries.", view: mx(out(PP), { blocks: 2, partialTrace: 'B' }), viewCaption: "$\\rho_A$: Unit 8.4's mixture" },
        { tex: '\\rho_A = \\sum_{i_1}\\lambda_{i_1}|u_{i_1}\\rangle\\langle u_{i_1}|', why: 'Now let A\'s basis be the eigenvectors of $\\rho_A$.' },
        { tex: "\\langle\\tilde v_{i_1'}|\\tilde v_{i_1}\\rangle = \\delta_{i_1i_1'}\\lambda_{i_1}", why: 'Matching the two forms: the partners are orthogonal, with squared lengths $\\lambda$.', view: mx({ coef: PP }, { svd: true }), viewCaption: 'the weights 0.924 and 0.383' },
        { tex: '|w_{i_1}\\rangle = |\\tilde v_{i_1}\\rangle/\\sqrt{\\lambda_{i_1}}', why: 'Scale each partner to length 1.' },
        { tex: '|\\psi\\rangle_{AB} = \\sum_{i_1}\\sqrt{\\lambda_{i_1}}|u_{i_1}\\rangle_A|w_{i_1}\\rangle_B', why: 'One term per eigenvalue.', view: tq(PP), viewCaption: 'P: two arrows, each 0.707 long' },
      ],
      formal: [
        { tex: "\\langle\\tilde v_{i_1'}|\\tilde v_{i_1}\\rangle = \\delta_{i_1i_1'}\\lambda_{i_1}", why: 'Compare notes Eqs. 2.25 and 2.26.', view: mx(out(PP), { blocks: 2, partialTrace: 'B' }) },
        { tex: '|\\psi\\rangle_{AB} = \\sum_{i_1}\\sqrt{\\lambda_{i_1}}|u_{i_1}\\rangle_A|w_{i_1}\\rangle_B', why: 'For P: $0.924|u_+\\rangle|{+}\\rangle + 0.383|u_-\\rangle|{-}\\rangle$.', view: mx({ coef: PP }, { svd: true }) },
      ],
    },
    claims: [
      claim('q9PVtOverlap', 'the overlap 0.25', () => close(V.q9PVtOverlap, 0.25)),
      claim('q9PVtEigOverlap', "in the eigenbasis the partners are orthogonal", () => close(V.q9PVtEigOverlap, 0, 1e-9)),
      claim('q9PVtEigNorm2Large', 'squared length 0.854', () => close(V.q9PVtEigNorm2Large, (2 + Math.SQRT2) / 4)),
      claim('q9PVtEigNorm2Small', 'and 0.146', () => close(V.q9PVtEigNorm2Small, (2 - Math.SQRT2) / 4)),
      claim('q9PSchmidtLarge', 'the Schmidt weight 0.924', () => close(V.q9PSchmidtLarge, Math.sqrt((2 + Math.SQRT2) / 4))),
      claim('q9PSchmidtSmall', 'and 0.383', () => close(V.q9PSchmidtSmall, Math.sqrt((2 - Math.SQRT2) / 4))),
    ],
  },
  {
    id: 'q9-schmidt:b3',
    phase: 'lecture',
    text:
      "The number of terms is the [[qc-schmidt-rank|Schmidt rank]]. For two qubits it is 1 or 2. Rank 1 means a single term $|u\\rangle|w\\rangle$: a product. So a pure pair is entangled exactly when its rank is 2. That is Unit 6.3's product test again.",
    formal:
      'The [[qc-schmidt-rank|Schmidt rank]] $N \\le \\min(\\dim\\mathcal H_A, \\dim\\mathcal H_B)$ counts the nonzero $\\lambda$ (notes p. 40); $N = 1$ iff $|\\psi\\rangle$ is a product. It is the rank of the coefficient matrix C, which is what Unit 6.3\'s test $\\det C = 0$ detects for two qubits.',
    caption: 'the product: one bar; P and $\\Phi^+$: two',
    captionFormal: 'N = rank C',
    stage: mx({ coef: PROD }, { svd: true }),
    claims: [
      claim('q9RankProd', 'a product has rank 1', () => close(V.q9RankProd, 1, 1e-9)),
      claim('q9RankP', 'P has rank 2', () => close(V.q9RankP, 2, 1e-9)),
      claim('q9RankBell', 'a Bell state has rank 2', () => close(V.q9RankBell, 2, 1e-9)),
    ],
  },
  {
    id: 'q9-schmidt:b4',
    phase: 'lecture',
    text:
      "B gets the same treatment: $\\rho_B = 0.854|{+}\\rangle\\langle{+}| + 0.146|{-}\\rangle\\langle{-}|$. Its eigenvalues are A's, though its eigenvectors differ. On the two-qubit picture, both arrows have the same length, 0.707, pointing different ways.",
    formal:
      'Tracing A out of the Schmidt form gives $\\rho_B = \\sum_{i_1}\\lambda_{i_1}|w_{i_1}\\rangle\\langle w_{i_1}|$ (notes Eq. 2.28; Bergou Eq. 2.52): $\\rho_A$ and $\\rho_B$ share their nonzero eigenvalues, so $S(\\rho_A) = S(\\rho_B)$ and, for qubits, $|\\mathbf r_A| = |\\mathbf r_B|$. For P, $\\mathbf r_A = (0.5, 0, 0.5)$ and $\\mathbf r_B = (0.707, 0, 0)$.',
    caption: 'two arrows of the same length, 0.707',
    captionFormal: '$\\mathrm{spec}\\,\\rho_A = \\mathrm{spec}\\,\\rho_B = \\{0.854, 0.146\\}$',
    stage: split(mx(out(PP), { blocks: 2, partialTrace: 'A', spectrum: 'bars' }), tq(PP, { readouts: ['rLength'] })),
    derivation: {
      result: '\\rho_B = \\sum_{i_1}\\lambda_{i_1}|w_{i_1}\\rangle\\langle w_{i_1}|,\\quad \\mathrm{spec}\\,\\rho_A = \\mathrm{spec}\\,\\rho_B',
      ground: [
        { tex: '|\\psi\\rangle = \\sum_{i_1}\\sqrt{\\lambda_{i_1}}|u_{i_1}\\rangle|w_{i_1}\\rangle', why: 'Start from the Schmidt form.', view: mx({ coef: PP }, { svd: true }), viewCaption: 'weights 0.924 and 0.383' },
        { tex: '\\rho_B = \\mathrm{Tr}_A|\\psi\\rangle\\langle\\psi| = \\sum_{i_1}\\lambda_{i_1}|w_{i_1}\\rangle\\langle w_{i_1}|', why: 'The $|u\\rangle$ are [[qc-orthonormal-basis|orthonormal]], so only matching terms survive.', view: mx(out(PP), { blocks: 2, partialTrace: 'A', spectrum: 'bars' }), viewCaption: '$\\rho_B$: eigenvalues 0.854 and 0.146' },
        { tex: '\\rho_A = \\sum_{i_1}\\lambda_{i_1}|u_{i_1}\\rangle\\langle u_{i_1}|', why: "The same weights, with A's states.", view: mx(out(PP), { blocks: 2, partialTrace: 'B', spectrum: 'bars' }), viewCaption: '$\\rho_A$: the same eigenvalues' },
        { tex: '|\\mathbf r_A| = |\\mathbf r_B|', why: 'For qubits, equal eigenvalues mean arrows of equal length.', view: tq(PP, { readouts: ['rLength'] }), viewCaption: 'both arrows 0.707 long' },
        { tex: '\\rho_B = \\sum_{i_1}\\lambda_{i_1}|w_{i_1}\\rangle\\langle w_{i_1}|,\\quad \\mathrm{spec}\\,\\rho_A = \\mathrm{spec}\\,\\rho_B', why: 'The two halves share their chances.' },
      ],
      formal: [
        { tex: '\\rho_B = \\sum_{i_1}\\lambda_{i_1}|w_{i_1}\\rangle\\langle w_{i_1}|', why: 'notes Eq. 2.28; Bergou Eq. 2.52.', view: mx(out(PP), { blocks: 2, partialTrace: 'A', spectrum: 'bars' }) },
        { tex: '\\rho_B = \\sum_{i_1}\\lambda_{i_1}|w_{i_1}\\rangle\\langle w_{i_1}|,\\quad \\mathrm{spec}\\,\\rho_A = \\mathrm{spec}\\,\\rho_B', why: 'Hence $S(\\rho_A) = S(\\rho_B)$.', view: tq(PP, { readouts: ['rLength'] }) },
      ],
    },
    claims: [
      claim('q9SpecALarge', "$\\rho_A$'s larger eigenvalue is 0.854", () => close(V.q9SpecALarge, (2 + Math.SQRT2) / 4)),
      claim('q9SpecASmall', 'and 0.146', () => close(V.q9SpecASmall, (2 - Math.SQRT2) / 4)),
      claim('q9RALen', "A's arrow has length 0.707", () => close(V.q9RALen, Math.SQRT1_2)),
      claim('q9RBLen', "B's arrow has length 0.707", () => close(V.q9RBLen, Math.SQRT1_2)),
      claim('q9RA0', "A's arrow has x part 0.5", () => close(V.q9RA0, 0.5)),
      claim('q9RB0', "B's arrow has x part 0.707", () => close(V.q9RB0, Math.SQRT1_2)),
    ],
  },
  {
    id: 'q9-schmidt:b5',
    phase: 'books',
    text:
      "There is a shortcut. Put the four amplitudes in Unit 6.3's 2 × 2 grid. Its singular values are the Schmidt weights, 0.924 and 0.383. They are the bars Chapter Q6 drew beside the grid.",
    formal:
      'With the singular value decomposition $C = U\\,\\mathrm{diag}(s_1, s_2)\\,V^\\dagger$ (Axler 7E p. 270), $|\\psi\\rangle = \\sum_ks_k|u_k\\rangle|w_k\\rangle$, with $|u_k\\rangle$ the columns of U, $|w_k\\rangle$ the conjugated columns of V, and $s_k = \\sqrt{\\lambda_k}$ (N&C Theorem 2.7 p. 109).',
    caption: "the grid's singular values: the Schmidt weights",
    captionFormal: '$C = U\\,\\mathrm{diag}(s)\\,V^\\dagger$',
    refs: [{ source: 'axler', where: '7E p. 270', adds: 'the singular value decomposition of a general matrix.' }],
    stage: mx({ coef: PP }, { svd: true }),
    claims: [claim('q9SvdLarge', 'the larger singular value is 0.924', () => close(V.q9SvdLarge, Math.sqrt((2 + Math.SQRT2) / 4))), claim('q9SvdSmall', 'the smaller is 0.383', () => close(V.q9SvdSmall, Math.sqrt((2 - Math.SQRT2) / 4)))],
  },
  {
    id: 'q9-schmidt:b6',
    phase: 'clue',
    text: 'Compare P with $\\cos22.5^\\circ|00\\rangle + \\sin22.5^\\circ|11\\rangle$. Which pair is more entangled?',
    formal: 'Compare the Schmidt coefficients and E of P and of $\\cos\\alpha|00\\rangle + \\sin\\alpha|11\\rangle$ at α = 22.5°.',
    stage: tq(PP, { readouts: ['rLength'] }),
    reveal: {
      text: 'Neither. The second is already in Schmidt form, with weights 0.924 and 0.383, the same as P\'s. So both have $E = 0.601$ bit. A turn of each qubit on its own carries one into the other.',
      formal: 'Both have Schmidt coefficients (0.924, 0.383) and $E = 0.601$. Equal coefficients mean the states differ by a local unitary $U_A\\otimes U_B$: here $|u_\\pm\\rangle \\mapsto |0\\rangle, |1\\rangle$ on A and $|{\\pm}\\rangle \\mapsto |0\\rangle, |1\\rangle$ on B.',
      caption: 'the same weights, 0.924 and 0.383',
      captionFormal: 'the same weights, 0.924 and 0.383',
      stage: tqF(22.5, { readouts: ['rLength', 'entropy'] }),
      claims: [
        claim('q9CS225SchmidtLarge', 'its larger Schmidt weight is 0.924', () => close(V.q9CS225SchmidtLarge, Math.sqrt((2 + Math.SQRT2) / 4))),
        claim('q9CS225SchmidtSmall', 'its smaller is 0.383', () => close(V.q9CS225SchmidtSmall, Math.sqrt((2 - Math.SQRT2) / 4))),
        claim('q9CS225E', 'its E is 0.601', () => close(V.q9CS225E, 0.6008760366928562, 1e-6)),
        claim('q9EP', "P's E is 0.601", () => close(V.q9EP, 0.6008760366928562, 1e-6)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q9-purification — Every mixture is part of something pure                                        */
/* ---------------------------------------------------------------------------------------------- */

const purificationUnit: Beat[] = [
  {
    id: 'q9-purification:b1',
    phase: 'lecture',
    introduces: ['qc-purification'],
    text:
      "Turn the question around. Given a mixed $\\rho$, is there a pure pair whose part is $\\rho$? Always. For Unit 8.4's mixture, tag each member with its own orthogonal state of a partner B: $\\tfrac1{\\sqrt2}\\big(|0\\rangle|0\\rangle + |{+}\\rangle|1\\rangle\\big)$. Trace out B and the mixture comes back. This pure pair, our P, is a [[qc-purification|purification]].",
    formal:
      'Every $\\rho_A = \\sum_ip_i|\\psi_i\\rangle\\langle\\psi_i|$ is the reduced state of the pure $|\\Psi\\rangle_{AB} = \\sum_i\\sqrt{p_i}|\\psi_i\\rangle_A|i\\rangle_B$, a [[qc-purification|purification]] (notes p. 40; Bergou Eqs. 2.53–2.55); $\\mathrm{Tr}_B|\\Psi\\rangle\\langle\\Psi| = \\rho_A$ because the $|i\\rangle_B$ are [[qc-orthonormal-basis|orthonormal]]. For Unit 8.4\'s mixture this is P.',
    caption: "trace out B: Unit 8.4's mixture returns",
    captionFormal: '$\\mathrm{Tr}_B|P\\rangle\\langle P| = \\tfrac12(|0\\rangle\\langle0| + |{+}\\rangle\\langle{+}|)$',
    stage: split(mx(out(PP), { blocks: 2, partialTrace: 'B' }), ball(bZX, { recipe: true })),
    derivation: {
      result: '\\mathrm{Tr}_B|\\Psi\\rangle\\langle\\Psi| = \\rho_A,\\quad |\\Psi\\rangle = \\sum_i\\sqrt{p_i}|\\psi_i\\rangle_A|i\\rangle_B',
      ground: [
        { tex: '\\rho_A = \\tfrac12|0\\rangle\\langle0| + \\tfrac12|{+}\\rangle\\langle{+}|', why: "Unit 8.4's mixture.", view: ball(bZX, { recipe: true }), viewCaption: 'the mixture' },
        { tex: '|\\Psi\\rangle = \\sqrt{\\tfrac12}|0\\rangle|0\\rangle_B + \\sqrt{\\tfrac12}|{+}\\rangle|1\\rangle_B', why: "Tag each member with its own orthogonal state of B, weighted by the square root of its chance.", view: amp(PP), viewCaption: 'P: bars at 00, 01 and 11' },
        { tex: '\\mathrm{Tr}_B\\big(|\\psi_i\\rangle\\langle\\psi_j|\\otimes|i\\rangle\\langle j|\\big) = \\delta_{ij}|\\psi_i\\rangle\\langle\\psi_i|', why: 'Different tags are orthogonal, so the cross terms vanish.' },
        { tex: '\\mathrm{Tr}_B|\\Psi\\rangle\\langle\\Psi| = \\sum_ip_i|\\psi_i\\rangle\\langle\\psi_i| = \\rho_A', why: 'Only the matching terms survive.', view: mx(out(PP), { blocks: 2, partialTrace: 'B' }), viewCaption: '$\\rho_A$ returns' },
        { tex: '\\mathrm{Tr}_B|\\Psi\\rangle\\langle\\Psi| = \\rho_A,\\quad |\\Psi\\rangle = \\sum_i\\sqrt{p_i}|\\psi_i\\rangle_A|i\\rangle_B', why: 'Every mixture has a purification.' },
      ],
      formal: [
        { tex: '|\\Psi\\rangle_{AB} = \\sum_i\\sqrt{p_i}|\\psi_i\\rangle_A|i\\rangle_B', why: 'Bergou Eq. 2.55, with $\\dim\\mathcal H_B$ at least the number of members.', view: amp(PP) },
        { tex: '\\mathrm{Tr}_B|\\Psi\\rangle\\langle\\Psi| = \\rho_A,\\quad |\\Psi\\rangle = \\sum_i\\sqrt{p_i}|\\psi_i\\rangle_A|i\\rangle_B', why: '$\\langle i|j\\rangle = \\delta_{ij}$.', view: mx(out(PP), { blocks: 2, partialTrace: 'B' }) },
      ],
    },
    claims: [cHalf, claim('q9PurGap', "P's $\\rho_A$ is Unit 8.4's mixture", () => close(V.q9PurGap, 0, 1e-9))],
  },
  {
    id: 'q9-purification:b2',
    phase: 'lecture',
    text:
      "Unit 8.6's eigen-recipe gives another purification: $0.924|u_+\\rangle|0\\rangle + 0.383|u_-\\rangle|1\\rangle$. It looks different, but an H gate on B alone turns it into P. All purifications of one $\\rho$ with the same partner differ only by a gate on the partner. Here that gate is Unit 8.6's recipe table, H.",
    formal:
      "Purifications in one $\\mathcal H_A\\otimes\\mathcal H_B$ differ by a unitary on B: $|\\Psi'\\rangle = (I_A\\otimes U_B)|\\Psi\\rangle$ (Bergou Eq. 2.56, reading $U_B|v_k\\rangle$ for the printed $U_B|u_k\\rangle$). Here $(I\\otimes H)\\big(\\sqrt{\\lambda_+}|u_+\\rangle|0\\rangle + \\sqrt{\\lambda_-}|u_-\\rangle|1\\rangle\\big) = P$: $U_B$ is the recipe unitary of Unit 8.6.",
    caption: 'H on B turns one purification into the other',
    captionFormal: '$(I\\otimes H)|\\Psi_{\\rm eig}\\rangle = |P\\rangle$',
    stage: split(amp(PP), mx(gateSrc('H'))),
    derivation: {
      result: "|\\Psi'\\rangle = (I_A\\otimes U_B)|\\Psi\\rangle",
      ground: [
        { tex: '|\\Psi_{\\rm eig}\\rangle = \\sqrt{\\lambda_+}|u_+\\rangle|0\\rangle + \\sqrt{\\lambda_-}|u_-\\rangle|1\\rangle', why: 'The purification built from the eigen-recipe.', view: ball(bU, { recipe: true }), viewCaption: 'the eigen-recipe' },
        { tex: '|P\\rangle = \\sqrt{\\tfrac12}|0\\rangle|0\\rangle + \\sqrt{\\tfrac12}|{+}\\rangle|1\\rangle', why: 'The one built from the $|0\\rangle$, $|+\\rangle$ recipe.', view: ball(bZX, { recipe: true }), viewCaption: 'the $|0\\rangle$, $|+\\rangle$ recipe' },
        { tex: '|P\\rangle = \\sqrt{\\lambda_+}|u_+\\rangle|{+}\\rangle + \\sqrt{\\lambda_-}|u_-\\rangle|{-}\\rangle', why: "Unit 8.6's table: each weighted $|0\\rangle$, $|+\\rangle$ is a sum or difference of the weighted $|u_\\pm\\rangle$.", view: mx(gateSrc('H')), viewCaption: 'the table: H' },
        { tex: '|{+}\\rangle = H|0\\rangle,\\quad |{-}\\rangle = H|1\\rangle', why: 'On B, the two forms differ by an H.' },
        { tex: '|P\\rangle = (I\\otimes H)|\\Psi_{\\rm eig}\\rangle', why: 'One gate on B alone.', view: amp(PP), viewCaption: 'P' },
        { tex: "|\\Psi'\\rangle = (I_A\\otimes U_B)|\\Psi\\rangle", why: 'In general, two purifications with the same partner differ by a gate on the partner.' },
      ],
      formal: [
        { tex: "|\\Psi\\rangle = \\sum_k\\sqrt{\\lambda_k}|u_k\\rangle|v_k\\rangle,\\ |\\Psi'\\rangle = \\sum_k\\sqrt{\\lambda_k}|u_k\\rangle|w_k\\rangle \\Rightarrow U_B|v_k\\rangle = |w_k\\rangle", why: "Both Schmidt forms share $\\rho_A$'s eigenvalues and eigenvectors (Bergou Eq. 2.56, with $U_B|v_k\\rangle$ for the printed $U_B|u_k\\rangle$).", view: mx(gateSrc('H')) },
        { tex: "|\\Psi'\\rangle = (I_A\\otimes U_B)|\\Psi\\rangle", why: 'Here $U_B = H$.', view: amp(PP) },
      ],
    },
    claims: [
      claim('q9ZXEigLarge', 'the weight 0.924 comes from 0.854', () => close(Math.sqrt(V.q9ZXEigLarge), 0.9238795325112867)),
      claim('q9ZXEigSmall', 'and 0.383 from 0.146', () => close(Math.sqrt(V.q9ZXEigSmall), 0.3826834323650898)),
      claim('q9PurUGap', 'the recipe table is H', () => close(V.q9PurUGap, 0, 1e-6)),
      claim('q9PurHGap', 'H on B turns one purification into the other', () => close(V.q9PurHGap, 0, 1e-6)),
      cHalf,
    ],
  },
  {
    id: 'q9-purification:b3',
    phase: 'clue',
    text: 'Read qubit B of P along x. What is the chance of +, and what state is A left in?',
    formal: "Measure B of P in the $|{\\pm}\\rangle$ basis. Give the chance $p_+$ of + and A's state afterwards.",
    stage: amp(PP),
    reveal: {
      text: "Chance 0.854, leaving A in $|u_+\\rangle$; a − leaves $|u_-\\rangle$, with chance 0.146. Reading B along z instead leaves $|0\\rangle$ or $|+\\rangle$, half each. The reading on B picks which recipe of A you get, but A's $\\rho$ is the same.",
      formal: '$p_+ = \\lambda_+ = 0.854$, leaving $|u_+\\rangle$; $p_- = 0.146$, leaving $|u_-\\rangle$. A z reading of B yields the recipe $\\{|0\\rangle, |{+}\\rangle\\}$ with ½ each. Different readings of B realize different ensembles of one $\\rho_A$.',
      caption: 'x on B: 0.854 → $|u_+\\rangle$; z on B: 0.5 → $|0\\rangle$',
      captionFormal: 'x on B: 0.854 → $|u_+\\rangle$; z on B: 0.5 → $|0\\rangle$',
      stage: ball(bU, { recipe: true }),
      claims: [
        claim('q9SteerX0', 'reading + on B has chance 0.854', () => close(V.q9SteerX0, (2 + Math.SQRT2) / 4)),
        claim('q9SteerX1', 'reading − has chance 0.146', () => close(V.q9SteerX1, (2 - Math.SQRT2) / 4)),
        claim('q9SteerXF0', "A's post-state matches $u_+$", () => close(V.q9SteerXF0, 1, 1e-6)),
        claim('q9SteerZ0', 'reading 0 on B has chance 0.5', () => close(V.q9SteerZ0, 0.5)),
        cHalf,
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q9-distance [B] — How far apart are two states?                                                  */
/* ---------------------------------------------------------------------------------------------- */

const distanceUnit: Beat[] = [
  {
    id: 'q9-distance:b1',
    phase: 'books',
    introduces: ['qc-trace-norm', 'qc-trace-distance'],
    text:
      "How different are two states? Subtract their density matrices and find the eigenvalues of the difference. Half the sum of their sizes is the [[qc-trace-distance|trace distance]] D. For $|0\\rangle$ and $|+\\rangle$ they are ±0.707, so $D = 0.707$. D is the largest gap any single yes-or-no reading can open between the two states' chances.",
    formal:
      'With the [[qc-trace-norm|trace norm]] $\\|A\\|_1 = \\mathrm{Tr}\\sqrt{A^\\dagger A}$, the sum of A\'s singular values, the [[qc-trace-distance|trace distance]] is $D(\\rho_1, \\rho_2) = \\tfrac12\\|\\rho_1 - \\rho_2\\|_1 = \\max_\\Pi\\mathrm{Tr}\\big(\\Pi(\\rho_1 - \\rho_2)\\big)$ over projectors Π (Bergou Eqs. 2.57–2.60). For $|0\\rangle$ and $|+\\rangle$ the difference has eigenvalues ±0.707, so D = 0.707.',
    caption: '$\\rho_0 - \\rho_+$: eigenvalues ±0.707; D = 0.707',
    captionFormal: '$D = \\tfrac12\\|\\rho_1 - \\rho_2\\|_1$',
    stage: split(ball('+z', { compare: '+x', purity: false }), mx(lin(['+1', out({ ket: '0' })], ['-1', out({ ket: '+' })]), { spectrum: 'bars' })),
    claims: [claim('q9D0P', 'D between $|0\\rangle$ and $|+\\rangle$ is 0.707', () => close(V.q9D0P, Math.SQRT1_2, 1e-6)), claim('q9D0PEig', 'the eigenvalues are ±0.707', () => close(V.q9D0PEig, Math.SQRT1_2, 1e-6))],
  },
  {
    id: 'q9-distance:b2',
    phase: 'books',
    text:
      "For one qubit there is a picture. D is half the straight distance between the two points in the ball. $|0\\rangle$ and $|+\\rangle$ sit a quarter circle apart, so D = 0.707. Unit 8.4's mixture sits 0.707 from the centre, so its distance from $\\tfrac12I$ is 0.354.",
    formal:
      'For qubits $\\rho_1 - \\rho_2 = \\tfrac12(\\mathbf r_1 - \\mathbf r_2)\\cdot\\boldsymbol\\sigma$ has eigenvalues $\\pm\\tfrac12|\\mathbf r_1 - \\mathbf r_2|$, so $D = \\tfrac12|\\mathbf r_1 - \\mathbf r_2|$ (N&C Eq. 9.20 p. 404): half the Euclidean distance in the ball. Unit 8.4\'s mixture is D = 0.354 from $\\tfrac12I$.',
    caption: 'half the straight distance: 0.707 and 0.354',
    captionFormal: '$D = \\tfrac12|\\mathbf r_1 - \\mathbf r_2|$',
    stage: ball(bZX, { compare: 'oven' }),
    derivation: {
      result: 'D(\\rho_1, \\rho_2) = \\tfrac12|\\mathbf r_1 - \\mathbf r_2|',
      ground: [
        { tex: '\\rho_1 - \\rho_2 = \\tfrac12(\\mathbf r_1 - \\mathbf r_2)\\cdot\\boldsymbol\\sigma', why: 'The identity parts cancel.', view: ball('+z', { compare: '+x', purity: false }), viewCaption: '$|0\\rangle$ and $|+\\rangle$' },
        { tex: '(\\mathbf a\\cdot\\boldsymbol\\sigma)\\ \\text{has eigenvalues}\\ \\pm|\\mathbf a|', why: "Unit 3.3: a Pauli arrow's eigenvalues are plus and minus its length." },
        { tex: '\\text{eigenvalues of}\\ \\rho_1 - \\rho_2 = \\pm\\tfrac12|\\mathbf r_1 - \\mathbf r_2|', why: 'Here ±0.707.', view: mx(lin(['+1', out({ ket: '0' })], ['-1', out({ ket: '+' })]), { spectrum: 'bars' }), viewCaption: '±0.707' },
        { tex: 'D = \\tfrac12\\Big(\\tfrac12|\\mathbf r_1 - \\mathbf r_2| + \\tfrac12|\\mathbf r_1 - \\mathbf r_2|\\Big)', why: 'Half the sum of their sizes.' },
        { tex: 'D(\\rho_1, \\rho_2) = \\tfrac12|\\mathbf r_1 - \\mathbf r_2|', why: 'Half the straight distance in the ball.', view: ball(bZX, { compare: 'oven' }), viewCaption: 'the mixture and the centre: D = 0.354' },
      ],
      formal: [
        { tex: '\\rho_1 - \\rho_2 = \\tfrac12(\\mathbf r_1 - \\mathbf r_2)\\cdot\\boldsymbol\\sigma,\\ \\text{eigenvalues}\\ \\pm\\tfrac12|\\mathbf r_1 - \\mathbf r_2|', why: 'N&C p. 404.', view: mx(lin(['+1', out({ ket: '0' })], ['-1', out({ ket: '+' })]), { spectrum: 'bars' }) },
        { tex: 'D(\\rho_1, \\rho_2) = \\tfrac12|\\mathbf r_1 - \\mathbf r_2|', why: 'N&C Eq. 9.20.', view: ball(bZX, { compare: 'oven' }) },
      ],
    },
    claims: [claim('q9D0P', '0.707', () => close(V.q9D0P, Math.SQRT1_2, 1e-6)), claim('q9DZXHalf', "Unit 8.4's mixture is 0.354 from the centre", () => close(V.q9DZXHalf, 0.35355339059327373, 1e-6)), cHalf],
  },
  {
    id: 'q9-distance:b3',
    phase: 'books',
    introduces: ['qc-fidelity'],
    text:
      "A second measure asks how much two states overlap. For two pure states the [[qc-fidelity|fidelity]] is the size of their overlap, $F = |\\langle\\psi_1|\\psi_2\\rangle|$. For $|0\\rangle$ and $|+\\rangle$ it is 0.707: the shadow of one on the other, as in Chapter Q1. Identical states have $F = 1$ and orthogonal ones $F = 0$.",
    formal:
      'The [[qc-fidelity|fidelity]] is $F(\\rho_1, \\rho_2) = \\mathrm{Tr}\\sqrt{\\rho_1^{1/2}\\rho_2\\,\\rho_1^{1/2}}$, with $\\rho^{1/2}$ the positive square root (same eigenvectors, square-rooted eigenvalues) (Bergou Eq. 2.61; N&C Eq. 9.53 p. 409). It is symmetric and lies in [0, 1]. For a pure $\\rho_1$ it is $\\sqrt{\\langle\\psi_1|\\rho_2|\\psi_1\\rangle}$, and for two pure states $|\\langle\\psi_1|\\psi_2\\rangle|$, here 0.707. Some texts call $F^2$ the fidelity; we keep the root.',
    caption: 'the shadow of $|+\\rangle$ on $|0\\rangle$: F = 0.707',
    captionFormal: '$F = |\\langle\\psi_1|\\psi_2\\rangle| = 0.707$',
    stage: hp({ psi: '+x', basis: 'z', shadows: true }),
    claims: [claim('q9F0P', 'the fidelity of $|0\\rangle$ and $|+\\rangle$ is 0.707', () => close(V.q9F0P, Math.SQRT1_2, 1e-6))],
    fidelity: ['plane-shadow-born', 'plane-real-slice'],
  },
  {
    id: 'q9-distance:b4',
    phase: 'books',
    text:
      'For pure states the two measures are tied: $D = \\sqrt{1 - F^2}$. For $|0\\rangle$ and $|+\\rangle$ that gives 0.707, matching D. For mixed states only bounds remain: $1 - F \\le D \\le \\sqrt{1 - F^2}$. Unit 8.4\'s mixture against $\\tfrac12I$ has $F = 0.924$ and $D = 0.354$, between 0.076 and 0.383.',
    formal:
      'Writing $|\\psi_2\\rangle = \\cos\\alpha|\\psi_1\\rangle + \\sin\\alpha|\\psi_1^\\perp\\rangle$ gives $D = |\\sin\\alpha|$ and $F = |\\cos\\alpha|$, so $D = \\sqrt{1 - F^2}$ (N&C Eqs. 9.97–9.99 p. 415; Bergou Problem 2.5 asks for it). In general $1 - F \\le D \\le \\sqrt{1 - F^2}$ (Bergou Eq. 2.62): for Unit 8.4\'s mixture against $\\tfrac12I$, $0.076 \\le 0.354 \\le 0.383$.',
    caption: '$\\text{pure: } D = \\sqrt{1 - F^2} = 0.707$',
    captionFormal: '$1 - F \\le D \\le \\sqrt{1 - F^2}$',
    stage: split(hp({ psi: '+x', basis: 'z', shadows: true }), ball('+z', { compare: '+x', purity: false })),
    derivation: {
      result: 'D = \\sqrt{1 - F^2}\\ \\text{for pure states}',
      ground: [
        { tex: '|\\psi_2\\rangle = \\cos\\alpha|\\psi_1\\rangle + \\sin\\alpha|\\psi_1^\\perp\\rangle', why: 'Write the second state against the first, at an angle α; $|\\psi_1^\\perp\\rangle$ is orthogonal to $|\\psi_1\\rangle$, and a phase can be dropped.', view: hp({ psi: '+x', basis: 'z', shadows: true }), viewCaption: '$|+\\rangle$ against $|0\\rangle$: α = 45°' },
        { tex: 'F = |\\langle\\psi_1|\\psi_2\\rangle| = |\\cos\\alpha|', why: 'The fidelity is the shadow.' },
        { tex: '\\rho_1 - \\rho_2 = \\begin{pmatrix}\\sin^2\\alpha & -\\sin\\alpha\\cos\\alpha\\\\ -\\sin\\alpha\\cos\\alpha & -\\sin^2\\alpha\\end{pmatrix}', why: 'In the basis $|\\psi_1\\rangle, |\\psi_1^\\perp\\rangle$.', view: mx(lin(['+1', out({ ket: '0' })], ['-1', out({ ket: '+' })])), viewCaption: 'the difference' },
        { tex: '\\text{eigenvalues}\\ \\pm|\\sin\\alpha| \\Rightarrow D = |\\sin\\alpha|', why: 'The trace is 0 and the determinant is $-\\sin^2\\alpha$.' },
        { tex: 'D = \\sqrt{1 - \\cos^2\\alpha} = \\sqrt{1 - F^2}', why: 'Put the two together.', view: ball('+z', { compare: '+x', purity: false }), viewCaption: 'on the ball: a quarter circle apart, D = 0.707' },
        { tex: 'D = \\sqrt{1 - F^2}\\ \\text{for pure states}', why: 'For mixed states only the bounds of Unit 9.6 remain.' },
      ],
      formal: [
        { tex: 'D = |\\sin\\alpha|,\\quad F = |\\cos\\alpha|', why: 'N&C Eqs. 9.97–9.98.', view: hp({ psi: '+x', basis: 'z', shadows: true }) },
        { tex: 'D = \\sqrt{1 - F^2}\\ \\text{for pure states}', why: 'N&C Eq. 9.99; for mixed states $1 - F \\le D \\le \\sqrt{1 - F^2}$ (Bergou Eq. 2.62).', view: ball('+z', { compare: '+x', purity: false }) },
      ],
    },
    claims: [
      claim('q9Sq0P', '0.707', () => close(V.q9Sq0P, Math.SQRT1_2, 1e-6)),
      claim('q9D0P', '0.707', () => close(V.q9D0P, Math.SQRT1_2, 1e-6)),
      claim('q9FZXHalf', 'F = 0.924', () => close(V.q9FZXHalf, 0.9238795325112868, 1e-6)),
      claim('q9DZXHalf', 'D = 0.354', () => close(V.q9DZXHalf, 0.35355339059327373, 1e-6)),
      claim('q9FvdgLower', '0.076', () => close(V.q9FvdgLower, 1 - V.q9FZXHalf, 1e-9)),
      claim('q9FvdgUpper', '0.383', () => close(V.q9FvdgUpper, Math.sqrt(1 - V.q9FZXHalf ** 2), 1e-9)),
    ],
  },
  {
    id: 'q9-distance:b5',
    phase: 'clue',
    text: 'Two pure states overlap with size 0.6. What is the trace distance between them?',
    formal: 'For pure states with $|\\langle\\psi_1|\\psi_2\\rangle| = 0.6$, find D.',
    stage: hp({ psi: { planeDeg: V.q9Ang06 }, basis: 'z', shadows: true }),
    reveal: {
      text: '0.8, since $\\sqrt{1 - 0.36} = 0.8$. One well-chosen yes-or-no reading opens a gap of 0.8 between their chances.',
      formal: '$D = \\sqrt{1 - F^2} = 0.8$, attained by the projector onto the positive eigenvector of $\\rho_1 - \\rho_2$.',
      caption: 'F = 0.6 → D = 0.8',
      captionFormal: 'F = 0.6 → D = 0.8',
      stage: ball('+z', { compare: { thetaDeg: V.q9Theta06, phiDeg: 0 }, purity: false }),
      claims: [
        claim('q9F06', 'the overlap is 0.6', () => close(V.q9F06, 0.6)),
        claim('q9F06Sq', 'its square is 0.36', () => close(V.q9F06Sq, 0.36)),
        claim('q9D06', 'the trace distance is 0.8', () => close(V.q9D06, 0.8)),
      ],
    },
  },
]

export const Q9_STORY: Record<string, Beat[]> = {
  'q9-partial-trace': partialTraceUnit,
  'q9-same-part': samePartUnit,
  'q9-entropy': entropyUnit,
  'q9-schmidt': schmidtUnit,
  'q9-purification': purificationUnit,
  'q9-distance': distanceUnit,
}

/** Generic reusable claims, attached at the Unit level so they back any occurrence within that unit's scope. */
export const Q9_UNIT_CLAIMS = [cHalf, cQuarter, cThreeQuarter, cR2]
export const Q9_UNIT_CLAIMS_BY_ID: Record<string, typeof Q9_UNIT_CLAIMS> = {
  'q9-partial-trace': Q9_UNIT_CLAIMS,
  'q9-same-part': Q9_UNIT_CLAIMS,
  'q9-entropy': Q9_UNIT_CLAIMS,
  'q9-schmidt': Q9_UNIT_CLAIMS,
  'q9-purification': Q9_UNIT_CLAIMS,
  'q9-distance': Q9_UNIT_CLAIMS,
}

export { PP, PROD, PSI2, SING, GHZ, COIN, bZX, bU, ZX_MIX }
