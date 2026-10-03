/**
 * Chapter Q7 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q7-story.md §1, in both
 * tracks, with the rulings in docs/roles/decisions/qc709-remap.md and qc709-Q6Q7.md.
 *
 * Stage note: the plan's `ab(bases, …)` and `amp(…, {bases, parity, stats})` shorthand assumed `amplitudes` gained
 * `bases`/`parity`/`stats` fields in the matrix-v2 batch (P-Q7-story.md §9.2). The MERGED batch (W-709 #15,
 * `docs/roles/interface-changes.md`) only touched `matrix` (tableau, product, values, state, spectrum, ptranspose,
 * basis, partialTrace keep) and `CircuitStageState.observable` — `AmplitudesState` itself is unchanged. Every beat
 * the plan tagged "needs: matrix-v2" for an `ab()` bar chart therefore uses the plan's OWN v1 fallback (§9.2
 * "Fallbacks"): `{circuit: C_RUN(bases)}` in `probability` mode, with the even/odd split and the stats named in
 * words in the caption rather than drawn in colour. Every `tab(...)` call (the Pauli tableau) uses the REAL
 * `matrix` v2 fields, since those were built.
 *
 * Rules kept here (as in Q4/Q5's story files): stage states carry physics inputs only, the resolver computes every
 * probability; numbers in the prose come from Q7.values.ts, printed with d / uf / pct, backed by keyed claims; a
 * caption marked "(shared)" below is set only on `caption` (never `captionFormal`), so both tracks read it, per
 * `content/track.ts` `pickTrack`'s fallback.
 */
import type { AmpSource, AmplitudesState, Beat, CircuitStageState, ComplexPlaneState, MatrixGridState, MatrixTableauState } from '../schema'
import type { Circuit } from '../../physics/qc/circuit'
import { C_GHZ, C_GHZM, C_GHZ_SW, C_GHZ_XXX, C_GHZ_YYX, C_RUN, V, claim, close, d } from './Q7.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out; the resolver computes every number drawn)                        */
/* ---------------------------------------------------------------------------------------------- */

const circ = (circuit: Circuit, upTo: number, extra: Partial<Omit<CircuitStageState, 'kind' | 'circuit' | 'upTo'>> = {}): CircuitStageState => ({
  kind: 'circuit',
  circuit,
  upTo,
  shot: 'Q-WIRES',
  ...extra,
})
const amp = (state: AmpSource, extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => ({ kind: 'amplitudes', state, shot: 'A-BARS', ...extra })
const mxGrid = (source: MatrixGridState['source'], extra: Partial<Omit<MatrixGridState, 'kind' | 'source'>> = {}): MatrixGridState => ({
  kind: 'matrix',
  source,
  shot: 'M-GRID',
  ...extra,
})
const mxTab = (tableau: string[], extra: Partial<Omit<MatrixTableauState, 'kind' | 'tableau'>> = {}): MatrixTableauState => ({ kind: 'matrix', tableau, shot: 'M-GRID', ...extra })
const cplane = (extra: Partial<Omit<ComplexPlaneState, 'kind'>>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...extra })
const split = <A, B>(top: A, bottom: B) => ({ layout: 'split' as const, top, bottom })

/** The GHZ state as an amplitude source (the engine's `bell`, which takes any two-term content). */
const G3: AmpSource = { bell: '000+111' }
/** The run's own outcome amplitudes (v1 fallback for the plan's `ab(bases)`; identical bars to `localBasisProbs`,
 * verified by `q7RunCircMatchXxx` / `q7RunCircMatchYyx`), with the final column's state shown. */
const runAmp = (bases: readonly ('x' | 'y')[], extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState =>
  amp({ circuit: C_RUN(bases), upTo: C_RUN(bases).columns.length }, extra)

/* ---------------------------------------------------------------------------------------------- */
/* Shared claims (the same handful of numbers recur across several beats)                          */
/* ---------------------------------------------------------------------------------------------- */

const half = claim('q7Half', 'a chance of ½', () => close(V.q7Half, 0.5))
const quarter = claim('q7Quarter', 'a chance of ¼', () => close(V.q7Quarter, 0.25))
const eighth = claim('q7Eighth', 'a chance of ⅛', () => close(V.q7Eighth, 0.125))
const threeEighths = claim('q7ThreeEighths', 'a chance of ⅜', () => close(V.q7ThreeEighths, 3 / 8))

/* ---------------------------------------------------------------------------------------------- */
/* q7-ghz — GHZ: three qubits, all or nothing                                                      */
/* ---------------------------------------------------------------------------------------------- */

const ghzAmpClaim = claim('q7GhzAmp', `each GHZ amplitude has size ${d(V.q7GhzAmp, 3)}`, () => close(V.q7GhzAmp, Math.SQRT1_2, 1e-4))
const ghzBarsClaim = claim('q7GhzBars', 'GHZ has 8 basis strings', () => close(V.q7GhzBars, 8))
const ghzFilledClaim = claim('q7GhzFilled', 'only 2 of the 8 are filled', () => close(V.q7GhzFilled, 2))
const ghzP000Claim = claim('q7GhzP000', 'P(000) = 0.5', () => close(V.q7GhzP000, 0.5))
const zerosMeanClaim = claim('q7ZerosMean', '⟨n⟩ = 1.5 for GHZ’s zero-count', () => close(V.q7ZerosMean, 1.5))
const zerosVarClaim = claim('q7ZerosVar', 'Var n = 2.25 for GHZ', () => close(V.q7ZerosVar, 2.25))
const zerosPlusMeanClaim = claim('q7ZerosPlusMean', '⟨n⟩ = 1.5 for three independent |+x⟩ qubits too', () => close(V.q7ZerosPlusMean, 1.5))
const zerosPlusVarClaim = claim('q7ZerosPlusVar', 'Var n = 0.75 for three independent |+x⟩ qubits', () => close(V.q7ZerosPlusVar, 0.75))
const nSquaredClaim = claim('q7ZerosSquareMean', '⟨n²⟩ = 4.5 for GHZ (½ of 0, ½ of 9)', () => close(V.q7ZerosSquareMean, 4.5))

const ghz: Beat[] = [
  {
    id: 'q7-ghz:b1',
    phase: 'lecture',
    text: 'Three [[qubit|qubits]] can share a state the way the Bell pairs of Chapter Q6 do. The [[qc-ghz|GHZ state]] is $(|000\\rangle + |111\\rangle)/\\sqrt2$: all three read 0 or all three read 1, in [[superposition|superposition]]. With $N$ qubits it is $(|0\\cdots0\\rangle + |1\\cdots1\\rangle)/\\sqrt2$. The name honours Greenberger, Horne and Zeilinger.',
    formal:
      '$|\\mathrm{GHZ}_N\\rangle = (|0\\cdots0\\rangle + |1\\cdots1\\rangle)/\\sqrt2$, and $|\\mathrm{GHZ}\\rangle = (|000\\rangle + |111\\rangle)/\\sqrt2$ for $N = 3$, the [[qc-ghz|GHZ state]] (notes p. 29; Bergou eq. 3.81). An H and two CNOTs make it from $|000\\rangle$. Bergou §3.9 sets it beside the W state as one of two kinds of genuine three-party entanglement.',
    caption: `GHZ: two bars of ${d(V.q7GhzAmp, 3)}, at 000 and 111`,
    captionFormal: `GHZ₃: ${d(V.q7GhzBars, 0)} bars, ${d(V.q7GhzFilled, 0)} filled`,
    introduces: ['qc-ghz'],
    stage: split(circ(C_GHZ, 3), amp({ circuit: C_GHZ, upTo: 3 })),
    claims: [ghzAmpClaim, ghzBarsClaim, ghzFilledClaim],
  },
  {
    id: 'q7-ghz:b2',
    phase: 'lecture',
    text: 'Read all three qubits in the computational basis. You get 000 or 111, each half the time, and nothing else. Read only qubit 1 and get 0: the other two are now certain to read 0 as well. One reading fixes the rest.',
    formal:
      '$P(000) = P(111) = |1/\\sqrt2|^2 = \\tfrac12$, and every other string has probability 0 (notes p. 29). Reading any one [[qubit|qubit]] fixes the others: after qubit 1 reads 0 the state is $|000\\rangle$. The notes add that losing one qubit leaves the other two unentangled; Chapter Q9 computes this.',
    caption: 'qubit 1 read 0: one bar left, at 000',
    stage: split(circ(C_GHZM(0), 4, { outcomes: '0' }), amp({ circuit: C_GHZM(0), upTo: 4, outcomes: '0' })),
    claims: [ghzP000Claim],
  },
  {
    id: 'q7-ghz:b3',
    phase: 'books',
    text: 'Count how many qubits read 0. For GHZ the count is 0 or 3, each half the time: average 1.5. Three independent $|{+x}\\rangle$ qubits also average 1.5, but counts of 1 and 2 are common. The spread differs: variance 2.25 for GHZ against 0.75.',
    formal:
      'Let $n$ be the number of zeros. For GHZ, $n \\in \\{0, 3\\}$ with probability $\\tfrac12$ each: $\\langle n\\rangle = \\tfrac32$, $\\mathrm{Var}\\,n = \\langle n^2\\rangle - \\langle n\\rangle^2 = \\tfrac94$. For $|{+x}\\rangle^{\\otimes3}$ the count is that of three fair coins: $\\langle n\\rangle = \\tfrac32$, $\\mathrm{Var}\\,n = \\tfrac34$ (HW2 P5(b)–(c)).',
    caption: `zeros: mean ${d(V.q7ZerosMean, 1)}, variance ${d(V.q7ZerosVar, 2)} (GHZ) against ${d(V.q7ZerosPlusVar, 2)} (three coins)`,
    refs: [{ source: 'lecture', where: '709 HW2, Problem 5(b)', adds: 'Counts the zeros of GHZ against three independent qubits, by mean and variance.' }],
    stage: amp(G3, { mode: 'probability' }),
    claims: [zerosMeanClaim, zerosVarClaim, zerosPlusMeanClaim, zerosPlusVarClaim],
    derivation: {
      result: '\\mathrm{Var}\\,n = \\tfrac94\\ (\\mathrm{GHZ})\\ \\text{against}\\ \\tfrac34\\ (|{+x}\\rangle^{\\otimes3})',
      ground: [
        {
          tex: 'n \\in \\{0, 3\\},\\quad P(0) = P(3) = \\tfrac12',
          why: 'GHZ reads 111 or 000, so the number of zeros is 0 or 3.',
          view: amp(G3, { mode: 'probability' }),
          viewCaption: 'GHZ: two bars of ½',
        },
        { tex: '\\langle n\\rangle = \\tfrac12\\cdot0 + \\tfrac12\\cdot3 = \\tfrac32', why: 'An average weighs each value by its chance.' },
        { tex: '\\langle n^2\\rangle = \\tfrac12\\cdot0 + \\tfrac12\\cdot9 = \\tfrac92', why: 'The same for the square of the count.', claims: [nSquaredClaim] },
        { tex: '\\mathrm{Var}\\,n = \\langle n^2\\rangle - \\langle n\\rangle^2 = \\tfrac92 - \\tfrac94 = \\tfrac94', why: 'The variance is the average square minus the squared average.', claims: [nSquaredClaim, zerosVarClaim] },
        {
          tex: '|{+x}\\rangle^{\\otimes3}:\\ P(n) = \\tfrac18, \\tfrac38, \\tfrac38, \\tfrac18',
          why: 'Three independent fair coins: one way to get 0 or 3 zeros, three ways to get 1 or 2.',
          view: amp({ ket: '+++' }, { mode: 'probability' }),
          viewCaption: 'three coins: eight bars of ⅛',
          claims: [eighth, threeEighths],
        },
        { tex: '\\langle n\\rangle = \\tfrac32,\\quad \\mathrm{Var}\\,n = 3\\cdot\\tfrac14 = \\tfrac34', why: 'For independent coins the variances add, a quarter each.', claims: [quarter, zerosPlusVarClaim] },
        {
          tex: '\\mathrm{Var}\\,n = \\tfrac94\\ (\\mathrm{GHZ})\\ \\text{against}\\ \\tfrac34\\ (|{+x}\\rangle^{\\otimes3})',
          why: 'The same mean, three times the spread: the zeros of GHZ come all together.',
        },
      ],
      formal: [
        {
          tex: 'P_{\\mathrm{GHZ}}(0) = P_{\\mathrm{GHZ}}(3) = \\tfrac12,\\ \\text{else } 0\\ \\Rightarrow\\ \\langle n\\rangle = \\tfrac32,\\ \\mathrm{Var}\\,n = \\tfrac94',
          why: 'Only 000 and 111 occur.',
          view: amp(G3, { mode: 'probability' }),
        },
        {
          tex: '\\mathrm{Var}\\,n = \\tfrac94\\ (\\mathrm{GHZ})\\ \\text{against}\\ \\tfrac34\\ (|{+x}\\rangle^{\\otimes3})',
          why: 'The product state’s count is binomial with $N = 3$, $p = \\tfrac12$: $Np(1 - p) = \\tfrac34$ (HW2 P5(b)–(c)).',
          view: amp({ ket: '+++' }, { mode: 'probability' }),
          claims: [zerosPlusVarClaim],
        },
      ],
    },
  },
  {
    id: 'q7-ghz:b4',
    phase: 'clue',
    text: 'Read qubit 2 of GHZ and get 1. What will qubits 1 and 3 read?',
    formal: 'After qubit 2 of GHZ reads 1, what is the state of the three qubits?',
    stage: amp(G3, { mode: 'probability' }),
    reveal: {
      text: '1 and 1, with certainty. Only the $|111\\rangle$ term had a 1 in the middle, so it is all that is left.',
      formal: '$|111\\rangle$, with probability 1 given the reading; the reading itself had probability $\\tfrac12$.',
      caption: 'one bar left, at 111',
      stage: amp({ circuit: C_GHZM(1), upTo: 4, outcomes: '1' }),
      claims: [half],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q7-brackets — Reading GHZ in the x and y bases                                                  */
/* ---------------------------------------------------------------------------------------------- */

const plusYClaim = claim('q7PlusYRe', `|{+y}⟩ has size ${d(V.q7R2, 3)} on each basis state`, () => close(V.q7PlusYRe, Math.SQRT1_2, 1e-4))
const braMinusYZeroClaim = claim('q7BraMinusYZeroRe', `⟨−y|0⟩ = ${d(V.q7BraMinusYZeroRe, 3)}`, () => close(V.q7BraMinusYZeroRe, Math.SQRT1_2, 1e-4))
const braPlusYOneImClaim = claim('q7BraPlusYOneIm', `Im⟨+y|1⟩ = ${d(V.q7BraPlusYOneIm, 3)}`, () => close(V.q7BraPlusYOneIm, -Math.SQRT1_2, 1e-4))
const zetaDegClaims = [
  claim('q7ZetaXPlusDeg', 'ζ for x, +1 sits at 0°', () => close(V.q7ZetaXPlusDeg, 0)),
  claim('q7ZetaXMinusDeg', 'ζ for x, −1 sits at 180°', () => close(V.q7ZetaXMinusDeg, 180)),
  claim('q7ZetaYPlusDeg', 'ζ for y, +1 sits at 270°', () => close(V.q7ZetaYPlusDeg, 270)),
  claim('q7ZetaYMinusDeg', 'ζ for y, −1 sits at 90°', () => close(V.q7ZetaYMinusDeg, 90)),
]
const zetaSpokes = () => ({ phasesDeg: [V.q7ZetaXPlusDeg, V.q7ZetaXMinusDeg, V.q7ZetaYPlusDeg, V.q7ZetaYMinusDeg] })

const brackets: Beat[] = [
  {
    id: 'q7-brackets:b1',
    phase: 'lecture',
    text: 'Now read each qubit in the x basis or the y basis instead. These are the states $|{\\pm x}\\rangle$ and $|{\\pm y}\\rangle$ of Chapter Q3. In $|{+y}\\rangle$ the $|1\\rangle$ amplitude carries a factor $i$. On its own, each qubit’s reading is a fair coin, +1 or −1. Their product is another matter.',
    formal:
      'Measure each qubit of GHZ in $\\{|{\\pm x}\\rangle\\}$ or $\\{|{\\pm y}\\rangle\\}$, $|{\\pm y}\\rangle = (|0\\rangle \\pm i|1\\rangle)/\\sqrt2$; H and the phase gates turn either basis into $|0\\rangle, |1\\rangle$ (notes p. 29; Unit 4.2). Each single outcome is $\\pm1$ with probability $\\tfrac12$, while for some choices of bases the product of the three is certain.',
    caption: `|{+y}⟩: ${d(V.q7PlusYRe, 3)} and ${d(V.q7PlusYRe, 3)}·i`,
    stage: amp({ dir: '+y' }, { dials: true }),
    claims: [plusYClaim, half],
  },
  {
    id: 'q7-brackets:b2',
    phase: 'lecture',
    text: 'One run of the experiment is fixed by two things for each qubit. $b_k$ is the basis chosen for qubit k, x or y. $\\varepsilon_k$ is the reading it gave, +1 or −1. So qubit k ends in $|\\varepsilon_kb_k\\rangle$, one of $|{+x}\\rangle$, $|{-x}\\rangle$, $|{+y}\\rangle$, $|{-y}\\rangle$. We name a run’s bases in capitals, like XYX.',
    formal:
      'A [[qc-ghz-run|run]] is $(b_k, \\varepsilon_k)_{k=1}^3$ with $b_k \\in \\{x, y\\}$ and $\\varepsilon_k = \\pm1$; qubit k is projected onto $|\\varepsilon_kb_k\\rangle$, so $|\\varepsilon_2b_2\\rangle = |{-y}\\rangle$ means qubit 2 was read in y and gave $-1$ (notes p. 30). Bases are named in capitals: XYX is $b_1 = x$, $b_2 = y$, $b_3 = x$.',
    caption: 'an XYX run: 8 outcome strings, bit 0 = +1',
    captionFormal: 'an XYX run: 8 outcome strings, bit 0 = +1',
    introduces: ['qc-ghz-run'],
    stage: runAmp(['x', 'y', 'x'], { mode: 'probability' }),
  },
  {
    id: 'q7-brackets:b3',
    phase: 'lecture',
    text: 'Every bracket we need is one of eight. All four brackets with $|0\\rangle$ equal $1/\\sqrt2$. A bracket with $|1\\rangle$ differs from $1/\\sqrt2$ only by a factor $\\zeta_k$ of size 1. In the x basis $\\zeta_k = \\varepsilon_k$; in the y basis $\\zeta_k = -i\\varepsilon_k$.',
    formal:
      '$\\langle\\varepsilon_kb_k|0\\rangle = 1/\\sqrt2$ and $\\langle\\varepsilon_kb_k|1\\rangle = \\zeta_k/\\sqrt2$, with [[qc-zeta|$\\zeta_k$]] $= \\varepsilon_k$ for $b_k = x$ and $-i\\varepsilon_k$ for $b_k = y$ (notes eq. 2.9). The basis decides whether $\\zeta_k$ is real or imaginary, the outcome its sign; $\\zeta_k$ is a number, unrelated to the Pauli matrices.',
    caption: 'the four ζ: 1, −1, −i, i',
    captionFormal: 'the four ζ: 1, −1, −i, i',
    introduces: ['qc-zeta'],
    stage: cplane({ spokes: zetaSpokes() }),
    claims: zetaDegClaims,
    derivation: {
      result: '\\langle\\varepsilon_kb_k|1\\rangle = \\zeta_k/\\sqrt2,\\quad \\zeta_k = \\varepsilon_k\\ \\text{(x basis)},\\ {-i\\varepsilon_k}\\ \\text{(y basis)}',
      ground: [
        {
          tex: '|{\\pm x}\\rangle = \\tfrac1{\\sqrt2}(|0\\rangle \\pm |1\\rangle),\\quad |{\\pm y}\\rangle = \\tfrac1{\\sqrt2}(|0\\rangle \\pm i|1\\rangle)',
          why: 'The four states of the two bases (Chapter Q3).',
          view: amp({ dir: '+y' }, { dials: true }),
          viewCaption: '|+y⟩: 0.707 and 0.707·i',
        },
        { tex: '\\langle{\\pm x}|0\\rangle = \\langle{\\pm y}|0\\rangle = \\tfrac1{\\sqrt2}', why: 'Every one of them has the real number $1/\\sqrt2$ on $|0\\rangle$.' },
        {
          tex: '\\langle{+x}|1\\rangle = \\tfrac1{\\sqrt2},\\quad \\langle{-x}|1\\rangle = -\\tfrac1{\\sqrt2}',
          why: 'In the x basis the $|1\\rangle$ part is real, with the outcome’s sign.',
          view: amp({ dir: '-x' }, { dials: true }),
          viewCaption: '|−x⟩: the second dial points backwards',
        },
        {
          tex: '\\langle{+y}|1\\rangle = \\tfrac{-i}{\\sqrt2},\\quad \\langle{-y}|1\\rangle = \\tfrac{i}{\\sqrt2}',
          why: 'A bra conjugates its ket’s numbers, so the $+i$ in $|{+y}\\rangle$ becomes $-i$ (Chapter Q1).',
          view: cplane({ z: { r: 1, phiDeg: 90 }, show: ['conj'] }),
          viewCaption: 'i and its mirror −i',
        },
        {
          tex: '\\langle\\varepsilon_kb_k|1\\rangle = \\zeta_k/\\sqrt2,\\quad \\zeta_k = \\varepsilon_k\\ \\text{(x basis)},\\ {-i\\varepsilon_k}\\ \\text{(y basis)}',
          why: 'Collect the four cases into one factor of size 1.',
          view: cplane({ spokes: zetaSpokes() }),
          viewCaption: 'the four ζ',
        },
      ],
      formal: [
        {
          tex: '|\\varepsilon x\\rangle = \\tfrac1{\\sqrt2}(|0\\rangle + \\varepsilon|1\\rangle),\\quad |\\varepsilon y\\rangle = \\tfrac1{\\sqrt2}(|0\\rangle + i\\varepsilon|1\\rangle)',
          why: 'Both bases in one line.',
          view: amp({ dir: '+y' }, { dials: true }),
        },
        {
          tex: '\\langle\\varepsilon_kb_k|1\\rangle = \\zeta_k/\\sqrt2,\\quad \\zeta_k = \\varepsilon_k\\ \\text{(x basis)},\\ {-i\\varepsilon_k}\\ \\text{(y basis)}',
          why: 'Conjugate; $|\\zeta_k| = 1$ (notes eq. 2.9).',
          view: cplane({ spokes: zetaSpokes() }),
        },
      ],
    },
  },
  {
    id: 'q7-brackets:b4',
    phase: 'clue',
    text: 'A qubit is read in the y basis and gives −1. What is its $\\zeta$?',
    formal: 'What is $\\zeta_k$ for $b_k = y$, $\\varepsilon_k = -1$, and which bracket does it come from?',
    stage: cplane({ spokes: zetaSpokes() }),
    reveal: {
      text: '$+i$, since $\\zeta = -i\\varepsilon = -i\\times(-1)$. It comes from $\\langle{-y}|1\\rangle = i/\\sqrt2$: the bra conjugates the $-i$ inside $|{-y}\\rangle$.',
      formal: '$\\zeta = +i$, from $\\langle{-y}|1\\rangle = +i/\\sqrt2$, the conjugate of the $|1\\rangle$ amplitude $-i/\\sqrt2$ of $|{-y}\\rangle$.',
      caption: 'ζ = i: a quarter turn',
      stage: cplane({ z: { r: 1, phiDeg: 90 }, show: ['arg'] }),
      claims: [braMinusYZeroClaim, braPlusYOneImClaim],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q7-parity-table — One formula for every run                                                     */
/* ---------------------------------------------------------------------------------------------- */

const s1 = () => ({ re: V.q7S1Re, im: V.q7S1Im })
const sNeg1 = () => ({ re: V.q7SNeg1Re, im: V.q7SNeg1Im })
const sNegI = () => ({ re: V.q7SNegIRe, im: V.q7SNegIIm })
const bracketXxxAllPlusClaim = claim('q7BracketXxxAllPlus', '⟨+x,+x,+x|GHZ⟩ = 0.5', () => close(V.q7BracketXxxAllPlus, 0.5))
const bracketXxxLastMinusClaim = claim('q7BracketXxxLastMinus', '⟨+x,+x,−x|GHZ⟩ = 0', () => close(V.q7BracketXxxLastMinus, 0))
const bracketYyxPiPlusClaim = claim('q7BracketYyxPiPlus', 'a YYX run with Π = +1 has bracket 0', () => close(V.q7BracketYyxPiPlus, 0))
const bracketYyxPiMinusClaim = claim('q7BracketYyxPiMinus', 'a YYX run with Π = −1 has bracket 0.5', () => close(V.q7BracketYyxPiMinus, 0.5))
const p1AtS1Claim = claim('q7P1AtS1', '|1+1|²/16 = 0.25', () => close(V.q7P1AtS1, 0.25))
const p1AtSNeg1Claim = claim('q7P1AtSNeg1', '|1−1|²/16 = 0', () => close(V.q7P1AtSNeg1, 0))
const p1AtSNegIClaim = claim('q7P1AtSNegI', '|1−i|²/16 = 0.125', () => close(V.q7P1AtSNegI, 0.125))
const absOnePlusSNegIClaim = claim('q7AbsOnePlusSNegI', '|1 − i| = 1.41421356', () => close(V.q7AbsOnePlusSNegI, Math.SQRT2, 1e-6))

const parityTable: Beat[] = [
  {
    id: 'q7-parity-table:b1',
    phase: 'lecture',
    text: 'A GHZ bracket has just two terms, one from $|000\\rangle$ and one from $|111\\rangle$. The first is always $\\tfrac1{2\\sqrt2}$. The second is the same times $s = \\zeta_1\\zeta_2\\zeta_3$. With GHZ’s own $1/\\sqrt2$ in front, the bracket is $(1 + s)/4$.',
    formal:
      '$\\langle\\varepsilon_1b_1, \\varepsilon_2b_2, \\varepsilon_3b_3|\\mathrm{GHZ}\\rangle = \\tfrac1{\\sqrt2}\\big[\\prod_k\\langle\\varepsilon_kb_k|0\\rangle + \\prod_k\\langle\\varepsilon_kb_k|1\\rangle\\big] = \\tfrac{1 + s}4$ with $s = \\zeta_1\\zeta_2\\zeta_3$ (notes p. 30). Every run differs from every other only through the single number $s$.',
    caption: 's = 1: the two terms add, (1 + 1)/4 = 0.5',
    stage: cplane({ z: { re: 1, im: 0 }, w: s1(), show: ['sum'] }),
    claims: [bracketXxxAllPlusClaim, half],
    derivation: {
      result: 'P = |1 + s|^2/16',
      ground: [
        { tex: '\\mathrm{GHZ} = \\tfrac1{\\sqrt2}\\big(|000\\rangle + |111\\rangle\\big)', why: 'Two terms.', view: amp(G3), viewCaption: 'two bars' },
        {
          tex: '\\langle\\varepsilon_1b_1, \\varepsilon_2b_2, \\varepsilon_3b_3|000\\rangle = \\big(\\tfrac1{\\sqrt2}\\big)^3 = \\tfrac1{2\\sqrt2}',
          why: 'The 000 term needs three brackets with $|0\\rangle$, each $1/\\sqrt2$.',
        },
        {
          tex: '\\langle\\varepsilon_1b_1, \\varepsilon_2b_2, \\varepsilon_3b_3|111\\rangle = \\tfrac{\\zeta_1\\zeta_2\\zeta_3}{2\\sqrt2} = \\tfrac{s}{2\\sqrt2}',
          why: 'The 111 term needs three brackets with $|1\\rangle$.',
          view: cplane({ z: { re: 1, im: 0 }, w: s1(), show: ['sum'] }),
          viewCaption: 's = 1: the terms add',
        },
        { tex: '\\langle\\ldots|\\mathrm{GHZ}\\rangle = \\tfrac1{\\sqrt2}\\cdot\\tfrac{1 + s}{2\\sqrt2} = \\tfrac{1 + s}4', why: 'Add the two terms and keep GHZ’s own $1/\\sqrt2$.' },
        {
          tex: 's = (-i)^{n_y}\\,\\Pi',
          why: 'Each y-basis qubit brings $-i$, and every qubit brings its sign $\\varepsilon_k$.',
          view: cplane({ powers: { of: { re: 0, im: -1 }, upTo: 3 } }),
          viewCaption: '$(-i)^{n_y}$ for $n_y$ = 0–3',
        },
        {
          tex: 'P = |1 + s|^2/16',
          why: 'The chance is the size squared: ¼, 0 or ⅛.',
          view: cplane({ z: { re: 1, im: 0 }, w: sNegI(), show: ['sum', 'modulus'] }),
          viewCaption: 's = −i: |1 − i| = 1.414',
        },
      ],
      formal: [
        {
          tex: '\\langle\\varepsilon_kb_k|\\mathrm{GHZ}\\rangle = \\tfrac1{\\sqrt2}\\Big[\\prod_k\\tfrac1{\\sqrt2} + \\prod_k\\tfrac{\\zeta_k}{\\sqrt2}\\Big] = \\tfrac{1 + s}4',
          why: 'eq. 2.9 in each factor.',
          view: cplane({ z: { re: 1, im: 0 }, w: s1(), show: ['sum'] }),
        },
        { tex: 's = (-i)^{n_y}\\Pi,\\quad P = |1 + s|^2/16', why: 'eq. 2.10.', view: cplane({ powers: { of: { re: 0, im: -1 }, upTo: 3 } }) },
      ],
    },
  },
  {
    id: 'q7-parity-table:b2',
    phase: 'lecture',
    text: 'Split $s$ into two parts. Each qubit read in y brings a factor $-i$, so the bases give $(-i)^{n_y}$, where $n_y$ counts the y’s. The readings give $\\Pi = \\varepsilon_1\\varepsilon_2\\varepsilon_3$, which is +1 or −1. So $s = (-i)^{n_y}\\Pi$.',
    formal:
      '$s = \\zeta_1\\zeta_2\\zeta_3 = (-i)^{n_y}\\Pi$, with [[qc-ny-pi|$n_y$]] the number of qubits read in y and $\\Pi = \\varepsilon_1\\varepsilon_2\\varepsilon_3$ (notes eq. 2.10). The bases fix $(-i)^{n_y}$; the outcomes fix $\\Pi = \\pm1$. Runs with the same $n_y$ differ only in $\\Pi$.',
    caption: '$(-i)^{n_y}$ for $n_y$ = 0, 1, 2, 3: 1, −i, −1, i',
    captionFormal: '$(-i)^{n_y}$ for $n_y$ = 0, 1, 2, 3: 1, −i, −1, i',
    introduces: ['qc-ny-pi'],
    stage: cplane({ powers: { of: { re: 0, im: -1 }, upTo: 3 } }),
  },
  {
    id: 'q7-parity-table:b3',
    phase: 'lecture',
    text: 'The chance of an outcome is the bracket’s size squared, $|1 + s|^2/16$. If s = 1 it is $\\tfrac14$. If s = −1 the two terms cancel: chance 0. If s = i or −i the chance is $\\tfrac18$.',
    formal: '$P = |1 + s|^2/16$: $\\tfrac14$ for $s = 1$, 0 for $s = -1$ and $\\tfrac18$ for $s = \\pm i$ (notes p. 31). An even $n_y$ makes $s$ real, so half the outcomes are forbidden; an odd $n_y$ makes every outcome equally likely.',
    caption: `s = −i: |1 − i| = ${d(V.q7AbsOnePlusSNegI, 3)}, chance ${d(V.q7P1AtSNegI, 3)}`,
    stage: cplane({ z: { re: 1, im: 0 }, w: sNegI(), show: ['sum', 'modulus'] }),
    claims: [p1AtS1Claim, p1AtSNeg1Claim, p1AtSNegIClaim, absOnePlusSNegIClaim, quarter, eighth],
  },
  {
    id: 'q7-parity-table:b4',
    phase: 'lecture',
    text: 'The notes collect every case in one table, by $n_y$ and $\\Pi$. With no y’s, $\\Pi = +1$ has chance $\\tfrac14$ and $\\Pi = -1$ never happens. Two y’s swap that rule. One or three y’s give $\\tfrac18$ to every outcome.',
    formal:
      'The p. 31 table: $n_y = 0$ gives $s = \\Pi$, so $\\Pi = +1$ outcomes have $\\tfrac14$ and $\\Pi = -1$ ones are forbidden; $n_y = 2$ gives $s = -\\Pi$, the reverse; $n_y = 1, 3$ give $s = \\mp i\\Pi, \\pm i\\Pi$ and $\\tfrac18$ for all, with no correlation (notes p. 31).',
    caption: 'XXX: four bars of 0.25, four empty',
    stage: runAmp(['x', 'x', 'x'], { mode: 'probability' }),
    claims: [quarter],
  },
  {
    id: 'q7-parity-table:b5',
    phase: 'books',
    text: 'Check two outcomes by hand. All three read in x, all giving +1: the bracket is $\\tfrac12$, so the chance is $\\tfrac14$. Change the last reading to −1 and the bracket is 0: that outcome never happens.',
    formal:
      '$\\langle{+x},{+x},{+x}|\\mathrm{GHZ}\\rangle = \\tfrac12$ and $\\langle{+x},{+x},{-x}|\\mathrm{GHZ}\\rangle = 0$, as $(1 + s)/4$ with $s = \\Pi = \\pm1$ predicts (HW2 P7(d)). In a YYX run the outcomes that survive are those with $\\Pi = -1$.',
    caption: 's = −1: the two terms cancel',
    refs: [{ source: 'lecture', where: '709 HW2, Problem 7(d)', adds: 'Checks two GHZ brackets by hand against $(1+s)/4$.' }],
    stage: cplane({ z: { re: 1, im: 0 }, w: sNeg1(), show: ['sum'] }),
    claims: [bracketXxxAllPlusClaim, bracketXxxLastMinusClaim, bracketYyxPiPlusClaim, bracketYyxPiMinusClaim, quarter],
  },
  {
    id: 'q7-parity-table:b6',
    phase: 'clue',
    text: 'In an XXY run, which outcomes can occur, and how often?',
    formal: 'Give the outcome distribution of an XXY run on GHZ.',
    stage: cplane({ powers: { of: { re: 0, im: -1 }, upTo: 3 } }),
    reveal: {
      text: 'All eight, each $\\tfrac18$ of the time. One y makes s equal to i or −i, and then $|1 + s|^2/16 = \\tfrac18$ for every outcome.',
      formal: 'Uniform: $n_y = 1$ gives $s = \\mp i$, so $P = |1 \\mp i|^2/16 = \\tfrac18$ for all eight strings.',
      caption: 'eight bars of 0.125',
      stage: runAmp(['x', 'x', 'y'], { mode: 'probability' }),
      claims: [eighth],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q7-bit-strings — Surviving strings carry the parity                                              */
/* ---------------------------------------------------------------------------------------------- */

const table011Claim = claim('q7Table011', 'P(011) = 0.25 in an XXX run', () => close(V.q7Table011, 0.25))
const table010Claim = claim('q7Table010', 'P(010) = 0 in an XXX run', () => close(V.q7Table010, 0))
const tableXxy101Claim = claim('q7TableXxy101', 'P(101) = 0.125 in an XXY run', () => close(V.q7TableXxy101, 0.125))
const singleXClaim = claim('q7SingleXProb', 'qubit 1 alone reads +1 half the time in an XXX run', () => close(V.q7SingleXProb, 0.5))

const bitStrings: Beat[] = [
  {
    id: 'q7-bit-strings:b1',
    phase: 'lecture',
    text: 'Record each reading as a bit: +1 becomes 0 and −1 becomes 1. Then $\\Pi = +1$ means an even number of 1s. In an XXX run only the even strings 000, 011, 101 and 110 occur, each a quarter of the time. The odd strings never appear.',
    formal:
      'Write $\\varepsilon_k = +1 \\to 0$ and $-1 \\to 1$; then $\\Pi = +1$ ⇔ the string has an even number of 1s, its parity. For XXX, $n_y = 0$ and $s = \\Pi$: 000, 011, 101, 110 occur with $P = \\tfrac14$ each, and 001, 010, 100, 111 never (notes p. 31).',
    caption: 'XXX: even strings 0.25 each, odd strings empty',
    stage: runAmp(['x', 'x', 'x'], { mode: 'probability' }),
    claims: [quarter],
    derivation: {
      result: 'P_{XXX}(\\text{even}) = \\tfrac14,\\quad P_{YYX}(\\text{odd}) = \\tfrac14,\\quad P_{n_y\\ \\text{odd}} = \\tfrac18',
      ground: [
        { tex: '\\varepsilon = +1 \\to 0,\\quad \\varepsilon = -1 \\to 1', why: 'Write each reading as a bit.', view: runAmp(['x', 'x', 'x'], { mode: 'probability' }), viewCaption: 'XXX: eight outcome strings' },
        { tex: '\\Pi = +1 \\iff \\text{an even number of 1s}', why: 'Each 1 is a factor −1 in $\\Pi$.' },
        { tex: 'n_y = 0:\\ s = \\Pi', why: 'XXX has no y.' },
        {
          tex: 'P_{XXX}(\\text{even}) = \\tfrac14,\\quad P_{XXX}(\\text{odd}) = 0',
          why: 'Even strings have $s = 1$, odd ones $s = -1$.',
          view: runAmp(['x', 'x', 'x'], { mode: 'probability' }),
          viewCaption: 'even bars 0.25, odd bars empty',
          claims: [table011Claim, table010Claim],
        },
        { tex: 'n_y = 2:\\ s = -\\Pi', why: 'Two factors $-i$ multiply to $-1$.', view: runAmp(['y', 'y', 'x'], { mode: 'probability' }), viewCaption: 'YYX: odd bars 0.25' },
        {
          tex: 'P_{XXX}(\\text{even}) = \\tfrac14,\\quad P_{YYX}(\\text{odd}) = \\tfrac14,\\quad P_{n_y\\ \\text{odd}} = \\tfrac18',
          why: 'An odd $n_y$ makes $s = \\pm i$: an eighth for every string.',
          view: runAmp(['x', 'x', 'y'], { mode: 'probability' }),
          viewCaption: 'XXY: all 0.125',
        },
      ],
      formal: [
        { tex: 'P(\\varepsilon) = |1 + (-i)^{n_y}\\Pi(\\varepsilon)|^2/16', why: 'eq. 2.10 for each string.', view: runAmp(['x', 'x', 'x'], { mode: 'probability' }) },
        {
          tex: 'P_{XXX}(\\text{even}) = \\tfrac14,\\quad P_{YYX}(\\text{odd}) = \\tfrac14,\\quad P_{n_y\\ \\text{odd}} = \\tfrac18',
          why: 'Which parity of string survives sets that sign directly (notes p. 31).',
          view: runAmp(['y', 'y', 'x'], { mode: 'probability' }),
        },
      ],
    },
  },
  {
    id: 'q7-bit-strings:b2',
    phase: 'lecture',
    text: 'For YYX, YXY and XYY the rule flips: only the odd strings 001, 010, 100 and 111 occur. Two factors of $-i$ make $-1$, and that turns even into odd. Whichever strings survive, their shared parity gives the correlation its sign.',
    formal:
      'For YYX, YXY and XYY, $n_y = 2$ and $s = -\\Pi$: the odd strings survive with $\\tfrac14$ each and the even ones are forbidden. The surviving strings all carry one parity, flipped from XXX’s by the two factors of $-i$, and that parity is the sign (notes p. 31).',
    caption: 'YYX: odd strings 0.25 each',
    stage: runAmp(['y', 'y', 'x'], { mode: 'probability' }),
    claims: [quarter],
  },
  {
    id: 'q7-bit-strings:b3',
    phase: 'lecture',
    text: 'With one or three y’s nothing is selected. All eight strings come up, each an eighth of the time. These runs show no correlation at all.',
    formal: 'An odd $n_y$ gives $s = \\pm i$ and $P = \\tfrac18$ for every string: no parity is selected and no correlation is visible (notes p. 31).',
    caption: 'XXY: all eight at 0.125',
    stage: runAmp(['x', 'x', 'y'], { mode: 'probability' }),
    claims: [eighth, tableXxy101Claim],
  },
  {
    id: 'q7-bit-strings:b4',
    phase: 'lecture',
    text: 'In an XXX run each $\\varepsilon_k$ is a reading of X on qubit k. So $\\Pi$ is a reading of $X_1X_2X_3$. Writing down the string 011 already records $\\Pi = +1$. The single readings scatter at random, yet the product comes out the same every time.',
    formal:
      'In an XXX run $\\varepsilon_k$ is the measured value of $\\sigma_{xk}$, so $\\Pi$ is a measured value of $\\sigma_{x1}\\sigma_{x2}\\sigma_{x3}$: recording 011 and recording $\\Pi = +1$ are one act (notes pp. 31–32). A quantity the state fixes while its factors stay random is an observable with a definite value, the subject of Unit 7.5.',
    caption: 'XXX: each qubit 50/50; the product +1 every run',
    stage: runAmp(['x', 'x', 'x'], { mode: 'probability' }),
    claims: [singleXClaim],
  },
  {
    id: 'q7-bit-strings:b5',
    phase: 'clue',
    text: 'An XXX run reads 0 on qubit 1 and 1 on qubit 2. What must qubit 3 read?',
    formal: 'An XXX run gives $\\varepsilon_1 = +1$, $\\varepsilon_2 = -1$. What is $\\varepsilon_3$?',
    stage: amp(G3, { mode: 'probability' }),
    reveal: {
      text: '1, that is −1. Only even strings occur in XXX, so 01? must be 011.',
      formal: '$\\varepsilon_3 = -1$: $\\Pi = +1$ with certainty, so the string is 011; 010 has probability 0.',
      caption: '011: 0.25; 010: 0',
      stage: runAmp(['x', 'x', 'x'], { mode: 'probability' }),
      claims: [table011Claim, table010Claim],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q7-observables — Four products with certain values                                               */
/* ---------------------------------------------------------------------------------------------- */

const eigXxxClaim = claim('q7EigXxx', 'XXX has eigenvalue +1 on GHZ', () => close(V.q7EigXxx, 1))
const eigYyxClaim = claim('q7EigYyx', 'YYX has eigenvalue −1 on GHZ', () => close(V.q7EigYyx, -1))
const eigYxyClaim = claim('q7EigYxy', 'YXY has eigenvalue −1 on GHZ', () => close(V.q7EigYxy, -1))
const eigXyyClaim = claim('q7EigXyy', 'XYY has eigenvalue −1 on GHZ', () => close(V.q7EigXyy, -1))
const commClaim = claim('q7Comm', 'the four Mermin observables pairwise commute', () => close(V.q7Comm, 0))
const squareClaim = claim('q7Square', 'each of the four squares to the identity', () => close(V.q7Square, 0))
const ghzXxxMatchClaim = claim('q7GhzXxxMatch', 'XXX·GHZ = GHZ exactly', () => close(V.q7GhzXxxMatch, 0))
const ghzYyxMatchClaim = claim('q7GhzYyxMatch', 'YYX·GHZ = −GHZ exactly', () => close(V.q7GhzYyxMatch, 0))
const ghzSwMatchClaim = claim('q7GhzSwMatch', 'swapping qubits 2, 3 leaves GHZ unchanged', () => close(V.q7GhzSwMatch, 0))
const meanVarClaims = [
  claim('q7MeanXxx', '⟨XXX⟩ = 1', () => close(V.q7MeanXxx, 1)),
  claim('q7MeanYyx', '⟨YYX⟩ = −1', () => close(V.q7MeanYyx, -1)),
  claim('q7MeanYxy', '⟨YXY⟩ = −1', () => close(V.q7MeanYxy, -1)),
  claim('q7MeanXyy', '⟨XYY⟩ = −1', () => close(V.q7MeanXyy, -1)),
  claim('q7VarXxx', 'Var(XXX) = 0', () => close(V.q7VarXxx, 0)),
  claim('q7VarYyx', 'Var(YYX) = 0', () => close(V.q7VarYyx, 0)),
  claim('q7VarYxy', 'Var(YXY) = 0', () => close(V.q7VarYxy, 0)),
  claim('q7VarXyy', 'Var(XYY) = 0', () => close(V.q7VarXyy, 0)),
]
const meanX1Claim = claim('q7MeanX1', '⟨σ_x1⟩ = 0 on GHZ', () => close(V.q7MeanX1, 0))
const varX1Claim = claim('q7VarX1', 'Var(σ_x1) = 1 on GHZ, the largest a ±1 observable allows', () => close(V.q7VarX1, 1))

const observables: Beat[] = [
  {
    id: 'q7-observables:b1',
    phase: 'lecture',
    text: 'The four products are observables in their own right: $X_1X_2X_3$, $Y_1Y_2X_3$, $Y_1X_2Y_3$ and $X_1Y_2Y_3$. As Pauli strings (Unit 6.2) they are XXX, YYX, YXY and XYY. Each squares to the identity, so its values are +1 and −1. Measuring one means reading the three qubits and multiplying.',
    formal:
      'The [[qc-mermin-observables|Mermin observables]] $\\hat O_{XXX} = \\sigma_{x1}\\sigma_{x2}\\sigma_{x3}$, $\\hat O_{YYX} = \\sigma_{y1}\\sigma_{y2}\\sigma_{x3}$, $\\hat O_{YXY}$, $\\hat O_{XYY}$ (notes eq. 2.11) are Pauli strings with $\\hat O^2 = I$ and eigenvalues $\\pm1$. Measuring one means measuring its three factors and multiplying: its value is the $\\Pi$ of the runs just tabulated.',
    caption: 'XXX: 1s on the anti-diagonal',
    captionFormal: '$\\hat O_{XXX}$, an 8×8 matrix',
    introduces: ['qc-mermin-observables'],
    stage: mxGrid({ pauli: 'XXX' }, { values: 'none' }),
    claims: [squareClaim],
  },
  {
    id: 'q7-observables:b2',
    phase: 'lecture',
    text: 'Pick any two of the four: they disagree on exactly two qubits. On each of those two, X and Y anticommute, which costs a minus sign. Two signs cancel. So all four commute, and all four can have sure values together.',
    formal: 'Any two of the four differ in exactly two slots, where $\\sigma_x$ and $\\sigma_y$ anticommute; the two signs cancel, so all four commute and are [[qc-compatible|compatible]] (notes p. 33), as XX and ZZ were in Unit 6.6.',
    caption: 'each pair of rows differs in two columns',
    stage: mxTab(['XXX', 'YYX', 'YXY', 'XYY']),
    claims: [commClaim],
  },
  {
    id: 'q7-observables:b3',
    phase: 'lecture',
    text: 'Apply XXX to GHZ. It flips all three bits, so $|000\\rangle$ and $|111\\rangle$ trade places and GHZ comes back unchanged: eigenvalue +1. YYX also trades the two terms, but each Y adds a factor $i$ or $-i$. The factors multiply to $-1$, so GHZ comes back as $-\\mathrm{GHZ}$.',
    formal:
      '$\\hat O_{XXX}|\\mathrm{GHZ}\\rangle = +|\\mathrm{GHZ}\\rangle$ and $\\hat O_{YYX}|\\mathrm{GHZ}\\rangle = \\hat O_{YXY}|\\mathrm{GHZ}\\rangle = \\hat O_{XYY}|\\mathrm{GHZ}\\rangle = -|\\mathrm{GHZ}\\rangle$ (notes eq. 2.12). With $\\sigma_y|0\\rangle = i|1\\rangle$ and $\\sigma_y|1\\rangle = -i|0\\rangle$: $YYX|000\\rangle = i^2|111\\rangle$ and $YYX|111\\rangle = (-i)^2|000\\rangle$ (HW2 P7(a)).',
    caption: 'after YYX: both bars below the axis. The −1 is the eigenvalue; as a state, −GHZ is GHZ.',
    captionFormal: '$\\hat O_{YYX}|\\mathrm{GHZ}\\rangle = -|\\mathrm{GHZ}\\rangle$; the sign is the eigenvalue, not a new state',
    stage: split(circ(C_GHZ_YYX, 4), amp({ circuit: C_GHZ_YYX, upTo: 4 }, { mode: 'signed' })),
    claims: [eigXxxClaim, eigYyxClaim, ghzXxxMatchClaim, ghzYyxMatchClaim],
    derivation: {
      result: '\\langle\\hat O\\rangle = \\pm1,\\quad \\langle(\\Delta\\hat O)^2\\rangle = 0',
      ground: [
        { tex: 'X|0\\rangle = |1\\rangle,\\quad X|1\\rangle = |0\\rangle', why: 'X flips a bit.', view: mxGrid({ pauli: 'XXX' }, { values: 'none' }), viewCaption: 'XXX: 1s on the anti-diagonal' },
        {
          tex: 'XXX|000\\rangle = |111\\rangle,\\quad XXX|111\\rangle = |000\\rangle',
          why: 'Flipping all three bits swaps GHZ’s two terms.',
          view: amp({ circuit: C_GHZ_XXX, upTo: 4 }, { mode: 'signed' }),
          viewCaption: 'after XXX: the same two bars',
        },
        { tex: 'XXX|\\mathrm{GHZ}\\rangle = +|\\mathrm{GHZ}\\rangle', why: 'Swapping the two terms of a sum leaves the sum unchanged.', claims: [ghzXxxMatchClaim] },
        { tex: 'Y|0\\rangle = i|1\\rangle,\\quad Y|1\\rangle = -i|0\\rangle', why: 'Y flips a bit too, but adds a factor $i$ or $-i$.' },
        {
          tex: 'YYX|000\\rangle = i\\cdot i\\,|111\\rangle = -|111\\rangle,\\quad YYX|111\\rangle = (-i)(-i)\\,|000\\rangle = -|000\\rangle',
          why: 'Two Y’s on each term multiply it by $-1$.',
          view: amp({ circuit: C_GHZ_YYX, upTo: 4 }, { mode: 'signed' }),
          viewCaption: 'after YYX: both bars below the axis',
        },
        { tex: 'YYX|\\mathrm{GHZ}\\rangle = -|\\mathrm{GHZ}\\rangle', why: 'So GHZ is an eigenstate of YYX with eigenvalue $-1$.', claims: [ghzYyxMatchClaim] },
        {
          tex: '\\langle\\hat O\\rangle = \\pm1,\\quad \\langle(\\Delta\\hat O)^2\\rangle = 0',
          why: 'In an eigenstate every run gives the eigenvalue: average $\\pm1$, spread $1 - 1 = 0$.',
          view: runAmp(['x', 'x', 'x'], { mode: 'probability' }),
          viewCaption: 'product: +1 every run',
        },
      ],
      formal: [
        {
          tex: '\\hat O_{XXX}|\\mathrm{GHZ}\\rangle = +|\\mathrm{GHZ}\\rangle,\\quad \\hat O_{YYX}|\\mathrm{GHZ}\\rangle = \\hat O_{YXY}|\\mathrm{GHZ}\\rangle = \\hat O_{XYY}|\\mathrm{GHZ}\\rangle = -|\\mathrm{GHZ}\\rangle',
          why: 'By $\\sigma_y|0\\rangle = i|1\\rangle$, $\\sigma_y|1\\rangle = -i|0\\rangle$ and the permutation symmetry of GHZ.',
          view: amp({ circuit: C_GHZ_YYX, upTo: 4 }, { mode: 'signed' }),
        },
        {
          tex: '\\langle\\hat O\\rangle = \\pm1,\\quad \\langle(\\Delta\\hat O)^2\\rangle = 0',
          why: '$\\hat O^2 = I$; compare $\\langle(\\Delta\\sigma_{x1})^2\\rangle = 1$.',
          view: runAmp(['x', 'x', 'x'], { mode: 'probability' }),
          claims: [varX1Claim],
        },
      ],
    },
  },
  {
    id: 'q7-observables:b4',
    phase: 'lecture',
    text: 'These are eigenvalue statements, which say more than averages. The average of XXX is +1 and its spread is 0: every single run gives +1. One qubit’s X reading is the opposite: average 0 and spread 1, as random as a ±1 reading can be.',
    formal:
      'As eigenvalue equations, eq. 2.12 gives $\\langle\\hat O\\rangle = \\pm1$ and $\\langle(\\Delta\\hat O)^2\\rangle = \\langle\\hat O^2\\rangle - \\langle\\hat O\\rangle^2 = 0$, while $\\langle\\sigma_{x1}\\rangle = 0$ with $\\langle(\\Delta\\sigma_{x1})^2\\rangle = 1$, the largest a $\\pm1$ observable allows (notes p. 33; 448’s <<qc-l3-spread|spread of single readings>>).',
    caption: 'product: mean +1, spread 0; one qubit: 50% each way',
    stage: runAmp(['x', 'x', 'x'], { mode: 'probability' }),
    claims: [...meanVarClaims, meanX1Claim, varX1Claim, half],
  },
  {
    id: 'q7-observables:b5',
    phase: 'books',
    text: 'GHZ looks the same whichever way you number its qubits. YXY and XYY are just YYX with the qubits renumbered. So they share its eigenvalue, −1, with no new calculation.',
    formal:
      '$|\\mathrm{GHZ}\\rangle$ is invariant under every permutation of the three qubits, and YXY, XYY are permutations of YYX, so they share the eigenvalue $-1$ (HW2 P7(b)). A SWAP of qubits 2 and 3 leaves GHZ unchanged and turns YYX into YXY.',
    caption: 'after swapping qubits 2 and 3: the same GHZ',
    refs: [{ source: 'lecture', where: '709 HW2, Problem 7(b)', adds: 'GHZ’s permutation symmetry carries YYX’s eigenvalue to YXY and XYY.' }],
    stage: split(circ(C_GHZ_SW, 4), amp({ circuit: C_GHZ_SW, upTo: 4 })),
    claims: [eigYxyClaim, eigXyyClaim, ghzSwMatchClaim],
  },
  {
    id: 'q7-observables:b6',
    phase: 'clue',
    text: 'Measure XXX on GHZ a thousand times. How many runs give −1?',
    formal: 'In $N$ runs of $\\hat O_{XXX}$ on GHZ, how many give $-1$?',
    stage: amp(G3),
    reveal: {
      text: 'None. The spread of XXX is 0, so every run gives +1, even though each qubit’s own reading is a coin toss.',
      formal: 'Zero: GHZ is an eigenstate with eigenvalue +1 and $\\langle(\\Delta\\hat O_{XXX})^2\\rangle = 0$.',
      caption: 'product +1, every run',
      stage: runAmp(['x', 'x', 'x'], { mode: 'probability' }),
      claims: [eigXxxClaim],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q7-mermin — No instruction set can do it                                                        */
/* ---------------------------------------------------------------------------------------------- */

const card1Values = { YYX: V.q7Card1Yyx, YXY: V.q7Card1Yxy, XYY: V.q7Card1Xyy, XXX: V.q7Card1Xxx }
const card2Values = { YYX: V.q7Card2Yyx, YXY: V.q7Card2Yxy, XYY: V.q7Card2Xyy, XXX: V.q7Forced }
const card1Claims = [
  claim('q7Card1Yyx', 'a card x = (1,1,1), y = (1,1,−1) predicts YYX = +1', () => close(V.q7Card1Yyx, 1)),
  claim('q7Card1Yxy', 'the same card predicts YXY = −1', () => close(V.q7Card1Yxy, -1)),
  claim('q7Card1Xyy', 'the same card predicts XYY = −1', () => close(V.q7Card1Xyy, -1)),
  claim('q7Card1Xxx', 'the same card predicts XXX = +1', () => close(V.q7Card1Xxx, 1)),
]
const card2Claims = [
  claim('q7Card2Yyx', 'a card x = (1,1,−1), y = (1,1,−1) predicts YYX = −1', () => close(V.q7Card2Yyx, -1)),
  claim('q7Card2Yxy', 'the same card predicts YXY = −1', () => close(V.q7Card2Yxy, -1)),
  claim('q7Card2Xyy', 'the same card predicts XYY = −1', () => close(V.q7Card2Xyy, -1)),
]
const forcedClaim = claim('q7Forced', 'the three y-relations force x₁x₂x₃ = −1', () => close(V.q7Forced, -1))
const totalClaim = claim('q7MerminTotal', '64 cards in all', () => close(V.q7MerminTotal, 64))
const hist1Claim = claim('q7MerminHist1', '32 cards match exactly one of the four results', () => close(V.q7MerminHist1, 32))
const hist3Claim = claim('q7MerminHist3', '32 cards match exactly three', () => close(V.q7MerminHist3, 32))
const bestClaim = claim('q7MerminBest', 'the best card matches three of the four', () => close(V.q7MerminBest, 3))
const eigZziClaim = claim('q7EigZzi', 'ZZI has eigenvalue +1 on GHZ', () => close(V.q7EigZzi, 1))
const eigIzzClaim = claim('q7EigIzz', 'IZZ has eigenvalue +1 on GHZ', () => close(V.q7EigIzz, 1))
const prodPlusXxxClaim = claim('q7ProdPlusXxx', '(YYX)(YXY)(XYY) + XXX = 0 as matrices', () => close(V.q7ProdPlusXxx, 0))
const prodPhaseClaim = claim('q7ProdPhaseRe', '(YYX)(YXY)(XYY) carries phase −1', () => close(V.q7ProdPhaseRe, -1))
const qubitIdentityClaims = [
  claim('q7Qubit1Identity', 'Y·Y·X = X', () => close(V.q7Qubit1Identity, 0)),
  claim('q7Qubit2Identity', 'Y·X·Y = −X', () => close(V.q7Qubit2Identity, 0)),
  claim('q7Qubit3Identity', 'X·Y·Y = X', () => close(V.q7Qubit3Identity, 0)),
]

const mermin: Beat[] = [
  {
    id: 'q7-mermin:b1',
    phase: 'lecture',
    text: 'Suppose each qubit carried a card with two answers fixed in advance. $x_i$ answers an X reading and $y_i$ a Y reading, each $\\pm1$. A reading would simply reveal the answer on the card. A run shows only one of the two, but the card would hold both. Chapter Q1’s hidden-label model had the same idea.',
    formal:
      '[[qc-local-realism|Local realism]] assigns [[qc-hidden-values|predetermined values]] $x_i, y_i = \\pm1$ to both measurements on each qubit at once; a run reveals $\\varepsilon_k = x_k$ if $b_k = x$ and $\\varepsilon_k = y_k$ if $b_k = y$ (notes p. 33; HW2 P7). The four quantum results to match: YYX, YXY, XYY give $-1$ and XXX gives $+1$.',
    caption: 'one card: it matches three results and fails YYX',
    captionFormal: 'one card: it matches three results and fails YYX',
    introduces: ['qc-hidden-values'],
    stage: mxTab(['YYX', 'YXY', 'XYY', 'XXX'], { values: card1Values, state: G3 }),
    claims: card1Claims,
  },
  {
    id: 'q7-mermin:b2',
    phase: 'lecture',
    text: 'Multiply a card’s answers for YYX, YXY and XYY. Each $y_i$ appears twice, and $y_i^2 = 1$, so what is left is $x_1x_2x_3$. The three quantum results force it to be $(-1)^3 = -1$. But the XXX result is +1. No card can do both.',
    formal:
      '$(y_1y_2x_3)(y_1x_2y_3)(x_1y_2y_3) = x_1x_2x_3(y_1y_2y_3)^2 = x_1x_2x_3$, so the three results $-1$ force $x_1x_2x_3 = -1$, against $+1$ for XXX (notes p. 34): no predetermined values reproduce all four. This is [[qc-mermin-argument|Mermin’s argument]]; one run of each setting suffices, with no statistics.',
    caption: 'another card: it matches the three y results and fails XXX',
    refs: [{ source: 'lecture', where: '709 HW2, Problem 7(c)', adds: 'The three y-relations force x₁x₂x₃ = −1, against +1 for XXX.' }],
    stage: mxTab(['YYX', 'YXY', 'XYY', 'XXX'], { values: card2Values, state: G3 }),
    claims: [...card2Claims, forcedClaim, eigXxxClaim],
    derivation: {
      result: 'x_1x_2x_3 = -1\\ \\text{(forced)}\\ \\text{against}\\ +1\\ \\text{(XXX)}',
      ground: [
        {
          tex: 'y_1y_2x_3 = -1,\\quad y_1x_2y_3 = -1,\\quad x_1y_2y_3 = -1,\\quad x_1x_2x_3 = +1',
          why: 'The four quantum results, written for a card’s answers.',
          view: mxTab(['YYX', 'YXY', 'XYY', 'XXX'], { values: card1Values, state: G3 }),
          viewCaption: 'one card: it fails YYX',
        },
        { tex: '(y_1y_2x_3)(y_1x_2y_3)(x_1y_2y_3) = (-1)^3 = -1', why: 'Multiply the first three results.' },
        { tex: '(y_1y_2x_3)(y_1x_2y_3)(x_1y_2y_3) = x_1x_2x_3\\,(y_1y_2y_3)^2', why: 'Every y appears exactly twice; the order of numbers does not matter.' },
        {
          tex: 'y_i^2 = 1 \\Rightarrow x_1x_2x_3 = -1',
          why: 'A $\\pm1$ squared is 1.',
          view: mxTab(['YYX', 'YXY', 'XYY', 'XXX'], { values: card2Values, state: G3 }),
          viewCaption: 'a card built to pass the three: it fails XXX',
        },
        {
          tex: 'x_1x_2x_3 = -1\\ \\text{(forced)}\\ \\text{against}\\ +1\\ \\text{(XXX)}',
          why: 'The fourth result says $+1$: no card passes all four.',
          view: mxTab(['YYX', 'YXY', 'XYY', 'XXX'], { state: G3 }),
          viewCaption: 'the quantum values: −1, −1, −1, +1',
          claims: [forcedClaim, eigXxxClaim],
        },
      ],
      formal: [
        {
          tex: '(y_1y_2x_3)(y_1x_2y_3)(x_1y_2y_3) = x_1x_2x_3(y_1y_2y_3)^2 = x_1x_2x_3',
          why: 'For commuting numbers (notes p. 34).',
          view: mxTab(['YYX', 'YXY', 'XYY', 'XXX'], { values: card1Values, state: G3 }),
        },
        {
          tex: 'x_1x_2x_3 = -1\\ \\text{(forced)}\\ \\text{against}\\ +1\\ \\text{(XXX)}',
          why: 'One run per setting suffices, since each prediction has zero dispersion.',
          view: mxTab(['YYX', 'YXY', 'XYY', 'XXX'], { values: card2Values, state: G3 }),
        },
      ],
    },
  },
  {
    id: 'q7-mermin:b3',
    phase: 'lecture',
    text: 'Try every card: two choices for each of six answers, 64 cards. The 64 cards split exactly 50/50: 32 match three of the four results, 32 match only one. None matches all four. The four products of a card always multiply to +1, while the quantum results multiply to −1.',
    formal:
      'Over all $2^6 = 64$ assignments, 32 satisfy three of the four relations and 32 satisfy one; none satisfies all four. The product of the four left-hand sides is $\\prod_i x_i^2y_i^2 = +1$, while the quantum values multiply to $(-1)^3(+1) = -1$, so an odd number of relations must fail.',
    caption: '64 cards split exactly 50/50: 32 score three, 32 score one, none scores four',
    stage: mxTab(['YYX', 'YXY', 'XYY', 'XXX'], { values: card2Values, state: G3 }),
    claims: [totalClaim, hist1Claim, hist3Claim, bestClaim, half],
  },
  {
    id: 'q7-mermin:b4',
    phase: 'lecture',
    text: 'Quantum mechanics has no such clash, and the reason is order. Multiply the three operators: qubit 2 receives Y, then X, then Y. Since X and Y anticommute, $Y\\cdot X\\cdot Y = -X$. For numbers $y\\,x\\,y = x$, with no sign. That lost minus sign is exactly the one the cards cannot supply.',
    formal:
      'As operators, $(Y_1Y_2X_3)(Y_1X_2Y_3)(X_1Y_2Y_3) = -X_1X_2X_3$ (notes eq. 2.13): qubits 1 and 3 receive $Y\\cdot Y\\cdot X = X$ and $X\\cdot Y\\cdot Y = X$, but qubit 2 receives $Y\\cdot X\\cdot Y = -X$. On GHZ both sides give $-1$, consistently. Replacing operators by numbers throws away the anticommutation that supplies the sign.',
    caption: 'column products X, −X, X: the product is −XXX',
    stage: mxTab(['YYX', 'YXY', 'XYY'], { product: true }),
    claims: [...qubitIdentityClaims, prodPlusXxxClaim, prodPhaseClaim],
    derivation: {
      result: '(Y_1Y_2X_3)(Y_1X_2Y_3)(X_1Y_2Y_3) = -X_1X_2X_3',
      ground: [
        { tex: 'X\\cdot Y = -Y\\cdot X', why: 'On one qubit X and Y anticommute (Chapter Q3).', view: mxTab(['YYX', 'YXY', 'XYY']), viewCaption: 'qubit 2’s column reads Y, X, Y' },
        { tex: '\\text{qubit 1: } Y\\cdot Y\\cdot X = X,\\quad \\text{qubit 3: } X\\cdot Y\\cdot Y = X', why: 'Equal factors side by side multiply to I.', claims: qubitIdentityClaims },
        {
          tex: '\\text{qubit 2: } Y\\cdot X\\cdot Y = -X\\cdot Y\\cdot Y = -X',
          why: 'Move X past one Y: one minus sign.',
          view: mxGrid({ product: [{ pauli: 'Y' }, { pauli: 'X' }, { pauli: 'Y' }] }, { values: 'exact' }),
          viewCaption: 'Y·X·Y = −X',
        },
        {
          tex: '(Y_1Y_2X_3)(Y_1X_2Y_3)(X_1Y_2Y_3) = -X_1X_2X_3',
          why: 'Collect the three qubits.',
          view: mxTab(['YYX', 'YXY', 'XYY'], { product: true }),
          viewCaption: 'column products X, −X, X: −XXX',
          claims: [prodPlusXxxClaim],
        },
      ],
      formal: [
        {
          tex: '\\sigma_y\\sigma_x\\sigma_y = -\\sigma_x,\\quad \\sigma_x\\sigma_y\\sigma_x = -\\sigma_y',
          why: 'Anticommutation.',
          view: mxGrid({ product: [{ pauli: 'Y' }, { pauli: 'X' }, { pauli: 'Y' }] }, { values: 'exact' }),
        },
        {
          tex: '(Y_1Y_2X_3)(Y_1X_2Y_3)(X_1Y_2Y_3) = -X_1X_2X_3',
          why: 'On GHZ both sides give $-1$; numbers, with $yxy = x$, lose the sign (notes eq. 2.13).',
          view: mxTab(['YYX', 'YXY', 'XYY'], { product: true }),
          claims: [prodPhaseClaim],
        },
      ],
    },
  },
  {
    id: 'q7-mermin:b5',
    phase: 'books',
    text: 'GHZ, like $\\Phi^+$ in Unit 6.6, is pinned down by stabilizers. XXX is one. $Z_1Z_2$ and $Z_2Z_3$ are two more: they check that neighbouring bits agree. Bergou’s Problem 10.1 asks for such a set.',
    formal:
      'Aside (Bergou ⚑ Problem 10.1(a), p. 186): XXX, ZZI and IZZ each satisfy $g|\\mathrm{GHZ}\\rangle = +|\\mathrm{GHZ}\\rangle$ and together generate GHZ’s stabilizer group, as XX and ZZ do for $\\Phi^+$ (Unit 6.6). Part IX develops the formalism.',
    caption: 'three stabilizers of GHZ: XXX, ZZI, IZZ',
    refs: [{ source: 'bergou', where: '⚑ Problem 10.1(a), p. 186', adds: 'Names GHZ’s stabilizer generators; shown here, not worked in full (ruling qc709-remap.md #13).' }],
    stage: mxTab(['XXX', 'ZZI', 'IZZ'], { state: G3 }),
    claims: [eigXxxClaim, eigZziClaim, eigIzzClaim],
  },
  {
    id: 'q7-mermin:b6',
    phase: 'clue',
    text: 'Most tests of hidden answers need many runs and averages. Why does this argument need only one run of each setting?',
    formal: 'Why does Mermin’s GHZ argument need no statistics at all, unlike a Bell-inequality test of local realism (HW2 P7(c))?',
    stage: mxTab(['YYX', 'YXY', 'XYY', 'XXX'], { values: card1Values, state: G3 }),
    reveal: {
      text: 'Each of the four quantum predictions is certain, with spread 0. So a single run of each setting shows the clash, and one YYX run giving +1 would refute quantum mechanics. Chapter Q10’s CHSH test, in contrast, bounds averages of uncertain readings.',
      formal:
        'The four predictions are eigenvalues with zero dispersion, so the contradiction is between definite values in single runs, not between averages; Bell’s inequality, Chapter Q10, needs statistics over many runs (notes p. 34).',
      caption: 'four products, each certain',
      stage: runAmp(['y', 'y', 'x'], { mode: 'probability' }),
      claims: meanVarClaims,
    },
  },
]

export const Q7_STORY: Record<string, Beat[]> = {
  'q7-ghz': ghz,
  'q7-brackets': brackets,
  'q7-parity-table': parityTable,
  'q7-bit-strings': bitStrings,
  'q7-observables': observables,
  'q7-mermin': mermin,
}
