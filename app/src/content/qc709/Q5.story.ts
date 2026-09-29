/**
 * Chapter Q5 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q5-story.md §1, in both
 * tracks, with the judge's rulings (docs/roles/decisions/qc709-Q4Q5.md): `q5-one-value` before `q5-deutsch`
 * (N&C's order); the p. 8 (B1) and p. 10 (B-new-1) errata are boxed; the adiabatic example is labelled ours;
 * Bergou §1.6 is taught in both tracks; `circuit-lab` is deferred.
 *
 * Rules kept here (as in Q3's story file):
 * - Beat text and formal text use plain Unicode math (⟨ψ|, ħ, ², ⊕, √, θ, φ, …), never raw LaTeX backslash
 *   commands, so nothing renders as literal escapes; genuine LaTeX lives only in `derivation` blocks and in
 *   `lecture.equations` / review `equations` (both always display TeX, per content/walk.ts readingOrder), where
 *   every symbol is tracked in Q5.ts's `symbols` / `symbolsFormal`.
 * - Stage states carry physics inputs only; the resolver computes every probability. Numbers in the prose come
 *   from Q5.values.ts, printed with d / uf / pct, and are backed by keyed claims (often at the beat level, since
 *   the same handful of amplitudes — 0.5, 0.707, ¼ — recur across many beats of this chapter).
 * - Clue beats are click-to-reveal: `text` is the question, `reveal` the reasoning.
 * - Bridges go only to built Spin Lab units (`qc-l1-sequential`, `qc-l3-postulates`, `qc-l6-generator`); Q5's own
 *   future bridges (F7, Q14, Q15, Q22, Q24, Q8) are named in words, listed as TODO in the build report.
 * - No `{{term|…}}` prose terms in this chapter (as Q3): every anchor a reader might want is already a gloss tag.
 */
import type { AmplitudesState, Beat, BlochState, CircuitStageState, OperatorState, Scrub } from '../schema'
import type { Circuit } from '../../physics/qc/circuit'
import { C_KICK, C_KICK2, C_MB, C_MZW, C_PARM, C_H2, C_TOF, ID, NOT, ONE, V, ZERO, cD, cDM, cDNC, cHOH, cMZ, cMZF, cOr, cPar, cQ, claim, close, d, pct } from './Q5.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const circuitState = (circuit: Circuit, extra: Partial<Omit<CircuitStageState, 'kind' | 'circuit'>> = {}): CircuitStageState => ({ kind: 'circuit', circuit, shot: 'Q-WIRES', ...extra })
const ampState = (state: AmplitudesState['state'], extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => ({ kind: 'amplitudes', state, shot: 'A-BARS', ...extra })
const bloch = (s: Omit<BlochState, 'kind'>): BlochState => ({ kind: 'bloch', shot: 'B-STD', ...s })
const opSpace = (s: Omit<OperatorState, 'kind'>): OperatorState => ({ kind: 'operator-space', shot: 'O-STD', ...s })

/** split(circ / amp{same}) shorthand from the plan: the bars read the SAME circuit, cursor and outcomes. */
function stage(circuit: Circuit, opts: { upTo?: Scrub; outcomes?: string; mode?: AmplitudesState['mode']; dials?: boolean } = {}) {
  const top = circuitState(circuit, { ...(opts.upTo !== undefined ? { upTo: opts.upTo } : {}), ...(opts.outcomes !== undefined ? { outcomes: opts.outcomes } : {}) })
  const bottom = ampState(
    { circuit, ...(opts.upTo !== undefined ? { upTo: opts.upTo } : {}), ...(opts.outcomes !== undefined ? { outcomes: opts.outcomes } : {}) },
    { ...(opts.mode !== undefined ? { mode: opts.mode } : {}), ...(opts.dials !== undefined ? { dials: opts.dials } : {}) },
  )
  return { layout: 'split' as const, top, bottom }
}

/* ---------------------------------------------------------------------------------------------- */
/* q5-problem — Constant or balanced: Deutsch's question                                           */
/* ---------------------------------------------------------------------------------------------- */

const problem: Beat[] = [
  {
    id: 'q5-problem:b1',
    phase: 'lecture',
    text: 'Take a function f that turns one bit into one bit. There are only four: always 0, always 1, copy (f(x) = x) and flip (f(x) = 1 − x). The first two are [[qc-constant|constant]]. The last two give 0 once and 1 once: they are [[qc-balanced|balanced]].',
    formal:
      'f : {0,1} → {0,1} is [[qc-constant|constant]] if f(0) = f(1) and [[qc-balanced|balanced]] if f(0) ≠ f(1) (Bergou p. 5). The four, f ≡ 0, f ≡ 1, id and x̄ = 1 − x, are tabulated in Bergou ⚑ Problem 1.3(a). The box computes f; Unit 5.2 opens it.',
    caption: 'copy, asked about 1: the bottom wire reads 1',
    captionFormal: 'copy: f(0) = 0, f(1) = 1: balanced',
    stage: stage(cQ(ID, '1'), { upTo: { from: 0, to: 1 } }),
  },
  {
    id: 'q5-problem:b2',
    phase: 'lecture',
    text: "[[qc-deutsch-problem|Deutsch's problem]]: f is hidden in a box; is it constant or balanced? One look cannot tell. If f(0) = 1, f could be always 1, which is constant, or flip, which is balanced. A classical computer must look twice.",
    formal:
      "Given f as a black box, decide constant versus balanced ([[qc-deutsch-problem|Deutsch's problem]]; Bergou p. 5). Each classical query returns one value, and each value of f(0) fits one constant and one balanced f, so two queries are necessary and sufficient.",
    caption: 'flip, asked about 0: f(0) = 1',
    stage: stage(cOr(NOT, '0')),
  },
  {
    id: 'q5-problem:b3',
    phase: 'lecture',
    text: "Constant means f(0) and f(1) agree. So the whole question is one bit, f(0) ⊕ f(1) with Unit 4.4's XOR: 0 for constant f, 1 for balanced f.",
    formal: "f is constant exactly when f(0) ⊕ f(1) = 0 (N&C p. 33). Deutsch's problem asks for one bit of global information about f, never for its values.",
    caption: 'f(0) ⊕ f(1): 0, 0, 1, 1 for always 0, always 1, copy, flip',
    stage: stage(cOr(NOT, '0')),
  },
  {
    id: 'q5-problem:b4',
    phase: 'clue',
    text: 'You looked once and found f(1) = 1. Can you now say whether f is balanced?',
    formal: "Does f(1) = 1 decide Deutsch's problem?",
    stage: stage(cOr(ONE, '1')),
    reveal: {
      text: 'No. Always 1 and copy both give f(1) = 1, and one is constant while the other is balanced. You still need f(0).',
      formal: 'No: f(1) = 1 leaves f equal to always 1 or to copy, one constant and one balanced; classically f(0) ⊕ f(1) needs both values.',
      caption: 'always 1 and copy: both read 1 at x = 1',
      stage: stage(cOr(ID, '1')),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q5-oracle — The f-CNOT and the phase kickback                                                   */
/* ---------------------------------------------------------------------------------------------- */

const kickInClaim = claim('q5R2', `each part of |−⟩ has size ${d(V.q5R2, 3)}`, () => close(V.q5R2, Math.SQRT1_2, 1e-3))
const kickOutClaim = claim('q5NegR2', `a kicked-back sign turns ${d(V.q5R2, 3)} into ${d(V.q5NegR2, 3)}`, () => close(V.q5NegR2, -Math.SQRT1_2, 1e-3))

const oracle: Beat[] = [
  {
    id: 'q5-oracle:b1',
    phase: 'lecture',
    text: 'On a quantum computer f comes as a gate on two [[qubit|qubits]], U_f, the f-CNOT. It keeps the top qubit x and adds f(x) to the bottom qubit y with XOR: |x⟩|y⟩ becomes |x⟩|y ⊕ f(x)⟩. With y = 0 the bottom qubit ends holding f(x).',
    formal:
      'U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩ acts on two [[qubit|qubits]] (Bergou p. 5; N&C p. 31, the "data" and "target" registers). We may use U_f but never look inside it: an [[qc-oracle|oracle]], and each use is one [[qc-query|query]].',
    caption: 'flip: |0⟩|0⟩ → |0⟩|1⟩',
    captionFormal: "Rosetta: Bergou's |y + f(x)⟩ is the sum mod 2",
    stage: stage(cOr(NOT, '0'), { upTo: { from: 0, to: 1 } }),
  },
  {
    id: 'q5-oracle:b2',
    phase: 'lecture',
    text: 'Apply U_f twice: y ⊕ f(x) ⊕ f(x) = y, so U_f undoes itself. It only reshuffles the four basis states, so it is unitary, a legal gate. For copy U_f is exactly CNOT; for always 1 it is X on the bottom wire.',
    formal:
      'U_f squares to I, and U_f is a permutation matrix, hence unitary (Bergou ⚑ Problem 1.3(b)–(c)): U_id = CNOT, U_(f≡1) = I ⊗ X, U_(f≡0) = I, U_x̄ = (I ⊗ X)·CNOT.',
    caption: 'all four U_f are unitary and square to I',
    stage: stage(cOr(NOT, '0'), { upTo: { from: 0, to: 1 } }),
    claims: [
      claim('q5UfUnitary', 'every U_f is unitary', () => V.q5UfUnitary === 1),
      claim('q5UfSquare', 'every U_f squares to I', () => V.q5UfSquare === 1),
      claim('q5UfId', 'U_id is exactly CNOT', () => V.q5UfId === 1),
      claim('q5UfOne', 'U_(f≡1) is unitary', () => V.q5UfOne === 1),
      claim('q5UfZero', 'U_(f≡0) is unitary', () => V.q5UfZero === 1),
      claim('q5UfNot', 'U_x̄ is unitary', () => V.q5UfNot === 1),
    ],
  },
  {
    id: 'q5-oracle:b3',
    phase: 'lecture',
    text: 'Now set the bottom qubit to |−⟩ = (|0⟩ − |1⟩)/√2. If f(x) = 0 nothing changes. If f(x) = 1 its two parts swap, and |1⟩ − |0⟩ = −(|0⟩ − |1⟩). Either way the bottom stays |−⟩, and a sign (−1)^{f(x)} comes out in front.',
    formal:
      "|0 ⊕ f(x)⟩ − |1 ⊕ f(x)⟩ = (−1)^{f(x)}(|0⟩ − |1⟩) (Bergou eq. 1.13, p. 6; D1), so U_f|x⟩|−⟩ = (−1)^{f(x)}|x⟩|−⟩: [[qc-phase-kickback|phase kickback]].",
    caption: `copy on |1⟩|−⟩: both bars change sign (${d(V.q5R2, 3)} → ${d(V.q5NegR2, 3)})`,
    stage: stage(C_KICK, { upTo: { from: 0, to: 1 } }),
    fidelity: ['qc-amp-hue-is-phase'],
    derivation: {
      result: 'U_f|x\\rangle|-\\rangle = (-1)^{f(x)}|x\\rangle|-\\rangle',
      ground: [
        { tex: 'U_f|x\\rangle|y\\rangle = |x\\rangle|y \\oplus f(x)\\rangle', why: "The f-CNOT's own rule." },
        {
          tex: 'U_f|x\\rangle(|0\\rangle - |1\\rangle) = |x\\rangle(|0 \\oplus f(x)\\rangle - |1 \\oplus f(x)\\rangle)',
          why: 'A gate is linear: apply the rule to each part of |−⟩, leaving out the shared 1/√2.',
        },
        { tex: 'f(x) = 0:\\ |0\\rangle - |1\\rangle', why: 'XOR with 0 changes nothing.' },
        { tex: 'f(x) = 1:\\ |1\\rangle - |0\\rangle = -(|0\\rangle - |1\\rangle)', why: 'XOR with 1 flips each bit, so the two parts trade places.' },
        {
          tex: '|0 \\oplus f(x)\\rangle - |1 \\oplus f(x)\\rangle = (-1)^{f(x)}(|0\\rangle - |1\\rangle)',
          why: 'Both cases in one line, since (−1)⁰ = 1 and (−1)¹ = −1.',
        },
        { tex: 'U_f|x\\rangle|-\\rangle = (-1)^{f(x)}|x\\rangle|-\\rangle', why: 'Put the 1/√2 back; a number in front of every term can be written in front of the ket.' },
      ],
      formal: [
        { tex: 'U_f|x\\rangle|-\\rangle = |x\\rangle \\otimes X^{f(x)}|-\\rangle', why: 'y ↦ y ⊕ f(x) is X^{f(x)} acting on the target.' },
        { tex: 'X|-\\rangle = -|-\\rangle \\Rightarrow U_f|x\\rangle|-\\rangle = (-1)^{f(x)}|x\\rangle|-\\rangle', why: '|−⟩ is an eigenvector of X.' },
      ],
    },
    claims: [kickInClaim, kickOutClaim],
  },
  {
    id: 'q5-oracle:b4',
    phase: 'lecture',
    text: 'So with |−⟩ below, U_f leaves the bottom qubit alone and multiplies |x⟩ by (−1)^{f(x)}. On the top qubit alone, f now acts as a sign: a [[qc-phase-oracle|phase oracle]]. For copy that sign gate is Z.',
    formal:
      'U_f(|x⟩ ⊗ |−⟩) = (O_f|x⟩) ⊗ |−⟩ with O_f = diag((−1)^{f(0)}, (−1)^{f(1)}) (N&C p. 33): O_id = Z, O_x̄ = −Z, O_(f≡0) = I, O_(f≡1) = −I. On |+⟩|−⟩, copy gives |−⟩|−⟩.',
    caption: 'copy on |+⟩|−⟩: the top turns to |−⟩, the bottom stays |−⟩',
    stage: stage(C_KICK2, { upTo: { from: 0, to: 1 } }),
    claims: [claim('q5ChPhase', 'the phase oracle of copy is exactly Z', () => V.q5ChPhase === 1)],
  },
  {
    id: 'q5-oracle:b5',
    phase: 'books',
    text: 'Where does U_f come from? Nielsen and Chuang show that any classical circuit can be rebuilt from [[qc-toffoli|Toffoli gates]]. A Toffoli flips its third bit only when the first two are both 1, and doing it twice undoes it.',
    formal:
      'Toffoli: (a, b, c) ↦ (a, b, c ⊕ ab), its own inverse (N&C Fig. 1.14, p. 29); with ancillas it simulates NAND and FANOUT, so every classical f has a reversible U_f of comparable size (N&C pp. 29–31).',
    caption: 'Toffoli: |110⟩ → |111⟩',
    stage: { kind: 'circuit', circuit: C_TOF, shot: 'Q-WIRES' },
    claims: [claim('q5Toffoli110', 'a Toffoli sends |110⟩ to |111⟩', () => V.q5Toffoli110 === 7), claim('q5Toffoli2', 'a Toffoli squares to I', () => V.q5Toffoli2 === 1)],
  },
  {
    id: 'q5-oracle:b6',
    phase: 'clue',
    text: 'U_f writes f(x) into the bottom qubit. With the bottom qubit in |−⟩, does the bottom qubit change?',
    formal: "Under U_f with target |−⟩, is the target's own state changed?",
    stage: stage(C_KICK2, { upTo: 0 }),
    reveal: {
      text: "No. It stays |−⟩ every time. The only change is a sign on the top qubit's part: the answer is kicked back to the control.",
      formal: "No: X|−⟩ = −|−⟩, so |−⟩ is an eigenvector of every U_f's action on the target; the f-dependence appears only as (−1)^{f(x)} on |x⟩.",
      caption: 'bottom qubit before and after: |−⟩',
      stage: stage(C_KICK2, { upTo: 1 }),
      claims: [claim('q5XMinus', '|−⟩ is an eigenvector of X', () => V.q5XMinus === 1), claim('q5KickTarget', "the target's own state is unchanged by every U_f", () => V.q5KickTarget === 1)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q5-one-value — Both values in, only one out                                                    */
/* ---------------------------------------------------------------------------------------------- */

const oneValue: Beat[] = [
  {
    id: 'q5-one-value:b1',
    phase: 'lecture',
    text: 'Feed U_f a top qubit in |+⟩ and a bottom qubit in |0⟩. By linearity it works out both cases at once: (|0⟩|f(0)⟩ + |1⟩|f(1)⟩)/√2. Both values of f sit in one state: [[qc-quantum-parallelism|quantum parallelism]].',
    formal:
      "U_f[(|0⟩ + |1⟩)/√2 ⊗ |0⟩] = (|0, f(0)⟩ + |1, f(1)⟩)/√2 (Bergou eq. 1.16, p. 6; N&C eq. 1.37, Fig. 1.17, p. 31): [[qc-quantum-parallelism|quantum parallelism]].",
    caption: 'copy: bars at |00⟩ and |11⟩',
    captionFormal: `U_id: (${d(V.q5ParRe, 3)}, 0, 0, ${d(V.q5ParRe, 3)})`,
    stage: stage(cPar(ID), { upTo: { from: 0, to: 2 } }),
    claims: [claim('q5R2', `each nonzero amplitude has size ${d(V.q5R2, 3)}`, () => close(V.q5R2, Math.SQRT1_2, 1e-3))],
  },
  {
    id: 'q5-one-value:b2',
    phase: 'lecture',
    text: 'Now read both qubits. You get |0, f(0)⟩ or |1, f(1)⟩, each half the time. That is one value of f at a random x, and the other value is gone.',
    formal:
      'A computational-basis reading yields (x, f(x)) with x uniform, and the post-state is |x, f(x)⟩ (Bergou p. 6; N&C p. 32): one query still yields one value (D5) <<qc-l3-postulates|the reading rule and the state after a measurement>>.',
    caption: `copy read: 00 or 11, chance ${pct(V.q5ParPHalf)} each`,
    stage: stage(C_PARM, { mode: 'probability' }),
    derivation: {
      result: 'P(0, f(0)) = P(1, f(1)) = \\tfrac12',
      ground: [
        { tex: '\\tfrac1{\\sqrt2}\\big(|0, f(0)\\rangle + |1, f(1)\\rangle\\big)', why: 'The state after one query (eq. 1.16).' },
        { tex: '\\text{read } (x, f(x)) \\Rightarrow |x, f(x)\\rangle', why: 'After the reading, only the matching term is left.' },
        { tex: '\\text{one reading} \\to \\text{one pair } (x, f(x))', why: 'The other value has left no trace in the state.' },
        { tex: 'P\\big(0, f(0)\\big) = P\\big(1, f(1)\\big) = \\tfrac12', why: 'Each term has amplitude 1/√2, so its chance is one half.' },
      ],
      formal: [
        { tex: '2^{-n/2}\\textstyle\\sum_x |x, f(x)\\rangle \\to |x, f(x)\\rangle,\\ \\Pr[x] = 2^{-n}', why: 'N&C eq. 1.40, read in the computational basis.' },
        { tex: '\\text{one query yields one } f(x);\\ n=1:\\ \\Pr[x] = \\tfrac12', why: 'The post-state holds a single value, here with n = 1 input qubit.' },
      ],
    },
    claims: [claim('q5ParPHalf', 'each reading has chance one half', () => close(V.q5ParPHalf, 0.5))],
  },
  {
    id: 'q5-one-value:b3',
    phase: 'books',
    text: 'With n input qubits, an H on each turns |0…0⟩ into an even mix of all 2ⁿ strings. Two qubits give four bars of one half. U_f then holds f(x) for every x at once, yet a reading still returns one.',
    formal:
      "H^{⊗n}|0⟩^{⊗n} = 2^{−n/2}Σ_x|x⟩, the [[qc-walsh-hadamard|Walsh–Hadamard transform]] (N&C eqs. 1.38–1.39, p. 32), and U_f gives 2^{−n/2}Σ_x|x, f(x)⟩ (eq. 1.40). A later chapter builds on this.",
    caption: `H ⊗ H on |00⟩: four bars of ${d(V.q5WH2Half, 1)}`,
    stage: circuitState(C_H2),
    claims: [claim('q5WH2Half', 'each of the four bars is one half', () => close(V.q5WH2Half, 0.5))],
  },
  {
    id: 'q5-one-value:b4',
    phase: 'clue',
    text: 'A classical computer could pick x at random and report f(x), with the same chances. Is quantum parallelism just that coin toss?',
    formal: 'Is (|0, f(0)⟩ + |1, f(1)⟩)/√2 equivalent to a classical random choice of x?',
    stage: stage(C_PARM, { mode: 'probability' }),
    reveal: {
      text: "No. A coin's two outcomes exclude each other. The two parts of the quantum state can still be combined again: one more H makes them interfere, which is Deutsch's trick in Unit 5.4.",
      formal: 'No: the reading statistics agree, but the branches stay coherent; a further unitary can make them interfere and expose f(0) ⊕ f(1) (N&C pp. 33–34).',
      caption: `copy after Deutsch's last H: the top qubit is |1⟩ (${d(V.q5D3R2, 3)})`,
      stage: stage(cD(ID)),
      claims: [claim('q5D3R2', 'the nonzero amplitude has size 0.707', () => close(V.q5D3R2, Math.SQRT1_2, 1e-3))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q5-deutsch — Deutsch's circuit: one query, a global answer                                      */
/* ---------------------------------------------------------------------------------------------- */

const deutsch: Beat[] = [
  {
    id: 'q5-deutsch:b1',
    phase: 'lecture',
    text: "Deutsch's circuit: |0⟩ on top and |−⟩ below; H on the top, then U_f, then H on the top again; then read the top qubit. After the first H the state is ½(|0⟩ + |1⟩)(|0⟩ − |1⟩): four bars of one half, signs +, −, +, −.",
    formal: "|ψ₀⟩ = |0⟩₁|−⟩₂ (eq. 1.10) and |ψ₁⟩ = ½(|0⟩₁ + |1⟩₁)(|0⟩₂ − |1⟩₂) (Bergou Fig. 1.5, p. 5; eq. 1.11). Bergou's qubit 1 is our top wire x.",
    caption: `|ψ₁⟩ = (${d(V.q5D1Re, 1)}, −${d(V.q5D1Re, 1)}, ${d(V.q5D1Re, 1)}, −${d(V.q5D1Re, 1)})`,
    stage: stage(cD(ID), { upTo: { from: 0, to: 1 } }),
    claims: [claim('q5D1Re', 'every part of |ψ₁⟩ has size one half', () => close(V.q5D1Re, 0.5))],
  },
  {
    id: 'q5-deutsch:b2',
    phase: 'lecture',
    text: 'U_f kicks (−1)^{f(x)} onto each top part, as in Unit 5.2: ½[(−1)^{f(0)}|0⟩ + (−1)^{f(1)}|1⟩](|0⟩ − |1⟩). For copy the |1⟩ part changes sign; the bottom stays |−⟩.',
    formal:
      '|ψ₂⟩ = ½[|0⟩(|0⊕f(0)⟩ − |1⊕f(0)⟩) + |1⟩(|0⊕f(1)⟩ − |1⊕f(1)⟩)] (eq. 1.12) = ½[(−1)^{f(0)}|0⟩ + (−1)^{f(1)}|1⟩](|0⟩ − |1⟩) (eq. 1.14, by eq. 1.13; D2).',
    caption: `copy: (${d(V.q5D1Re, 1)}, −${d(V.q5D1Re, 1)}, −${d(V.q5D1Re, 1)}, ${d(V.q5D1Re, 1)})`,
    captionFormal: `always 1: (−${d(V.q5D1Re, 1)}, ${d(V.q5D1Re, 1)}, −${d(V.q5D1Re, 1)}, ${d(V.q5D1Re, 1)})`,
    stage: stage(cD(ID), { upTo: { from: 1, to: 2 } }),
    derivation: {
      result: '|\\psi_2\\rangle = \\tfrac12\\big[(-1)^{f(0)}|0\\rangle + (-1)^{f(1)}|1\\rangle\\big](|0\\rangle - |1\\rangle)',
      ground: [
        { tex: '|\\psi_0\\rangle = |0\\rangle\\,\\tfrac1{\\sqrt2}(|0\\rangle - |1\\rangle)', why: 'The input: |0⟩ on top, |−⟩ below.' },
        { tex: '|\\psi_1\\rangle = \\tfrac12(|0\\rangle + |1\\rangle)(|0\\rangle - |1\\rangle)', why: 'H on the top qubit gives |+⟩, and the two 1/√2 factors make a half.' },
        { tex: '|\\psi_1\\rangle = \\tfrac12\\big[|0\\rangle(|0\\rangle - |1\\rangle) + |1\\rangle(|0\\rangle - |1\\rangle)\\big]', why: 'Multiply out the top qubit.' },
        { tex: 'U_f|x\\rangle(|0\\rangle - |1\\rangle) = (-1)^{f(x)}|x\\rangle(|0\\rangle - |1\\rangle)', why: "Unit 5.2's kickback, once with x = 0 and once with x = 1." },
        { tex: '|\\psi_2\\rangle = \\tfrac12\\big[(-1)^{f(0)}|0\\rangle + (-1)^{f(1)}|1\\rangle\\big](|0\\rangle - |1\\rangle)', why: 'Apply the sign to each term, then take out the shared bottom factor.' },
      ],
      formal: [
        { tex: '|\\psi_1\\rangle = |+\\rangle|-\\rangle = \\tfrac1{\\sqrt2}\\textstyle\\sum_x |x\\rangle|-\\rangle', why: 'eqs. 1.10–1.11.' },
        { tex: '|\\psi_2\\rangle = \\tfrac1{\\sqrt2}\\textstyle\\sum_x (-1)^{f(x)}|x\\rangle|-\\rangle', why: "Unit 5.2's kickback, term by term (eqs. 1.12–1.14)." },
        {
          tex: '|\\psi_2\\rangle = \\tfrac12\\big[(-1)^{f(0)}|0\\rangle + (-1)^{f(1)}|1\\rangle\\big](|0\\rangle - |1\\rangle)',
          why: 'Writing out the sum over x = 0, 1 gives eq. 1.14 explicitly.',
        },
      ],
    },
    claims: [claim('q5D1Re', 'every part of |ψ₁⟩ has size one half', () => close(V.q5D1Re, 0.5))],
  },
  {
    id: 'q5-deutsch:b3',
    phase: 'lecture',
    text: 'The last H turns (|0⟩ + |1⟩)/√2 into |0⟩ and (|0⟩ − |1⟩)/√2 into |1⟩. If f is constant the two signs agree, and the top qubit ends in |0⟩. If f is balanced they differ, and it ends in |1⟩. One reading answers the question, and f was used once.',
    formal:
      "|ψ₃⟩ = (1/2√2){|0⟩[(−1)^{f(0)} + (−1)^{f(1)}] + |1⟩[(−1)^{f(0)} − (−1)^{f(1)}]}(|0⟩ − |1⟩) (eq. 1.15; D3), so P(top reads 1) is 0, 0, 1, 1 for always 0, always 1, copy, flip.",
    caption: 'the top qubit reads 1: never for constant f, always for balanced f',
    stage: stage(cDM(ID), { upTo: { from: 2, to: 4 }, mode: 'probability' }),
    derivation: {
      result: '|\\psi_3\\rangle = \\pm|f(0) \\oplus f(1)\\rangle|-\\rangle',
      ground: [
        { tex: 'H|0\\rangle = \\tfrac1{\\sqrt2}(|0\\rangle + |1\\rangle),\\quad H|1\\rangle = \\tfrac1{\\sqrt2}(|0\\rangle - |1\\rangle)', why: "Unit 4.2's Hadamard rule." },
        {
          tex: 'H\\big[(-1)^{f(0)}|0\\rangle + (-1)^{f(1)}|1\\rangle\\big] = \\tfrac1{\\sqrt2}\\big\\{[(-1)^{f(0)} + (-1)^{f(1)}]|0\\rangle + [(-1)^{f(0)} - (-1)^{f(1)}]|1\\rangle\\big\\}',
          why: 'Apply H to each term and collect the |0⟩ and |1⟩ parts.',
        },
        { tex: 'f(0) = f(1):\\ \\text{the } |1\\rangle \\text{ part is } 0,\\ \\text{the } |0\\rangle \\text{ part } \\pm2', why: 'Equal signs add at |0⟩ and cancel at |1⟩.' },
        { tex: 'f(0) \\ne f(1):\\ \\text{the } |0\\rangle \\text{ part is } 0,\\ \\text{the } |1\\rangle \\text{ part } \\pm2', why: 'Opposite signs cancel at |0⟩ and add at |1⟩.' },
        { tex: '\\text{top qubit} = \\pm|f(0) \\oplus f(1)\\rangle', why: 'Constant f leaves |0⟩ and balanced f leaves |1⟩; the ± is an overall factor on the whole state.' },
        { tex: '|\\psi_3\\rangle = \\pm|f(0) \\oplus f(1)\\rangle|-\\rangle', why: 'The bottom qubit was never touched by the last H, so it is still |−⟩.' },
      ],
      formal: [
        { tex: '|\\psi_3\\rangle = \\tfrac1{2\\sqrt2}\\textstyle\\sum_y \\big[(-1)^{f(0)} + (-1)^{f(1) + y}\\big]|y\\rangle(|0\\rangle - |1\\rangle)', why: 'eq. 1.15, from H|x⟩ expanded in the y basis.' },
        { tex: '|\\psi_3\\rangle = \\pm|f(0) \\oplus f(1)\\rangle|-\\rangle', why: 'N&C eq. 1.45.' },
      ],
    },
    claims: [
      claim('q5DTop1Zero', 'always 0 reads the top qubit as 0', () => close(V.q5DTop1Zero, 0)),
      claim('q5DTop1One', 'always 1 also reads the top qubit as 0', () => close(V.q5DTop1One, 0)),
      claim('q5DTop1Id', 'copy reads the top qubit as 1', () => close(V.q5DTop1Id, 1)),
      claim('q5DTop1Not', 'flip also reads the top qubit as 1', () => close(V.q5DTop1Not, 1)),
      claim('q5DTopIsXor', 'the top qubit reads f(0) ⊕ f(1)', () => V.q5DTopIsXor === 1),
      claim('q5Half', 'the normalizing factor here is one over two root two', () => close(V.q5Half, 0.5)),
    ],
  },
  {
    id: 'q5-deutsch:b4',
    phase: 'books',
    text: "Nielsen and Chuang start from |0⟩|1⟩ and put H on both wires first, which makes the same |+⟩|−⟩. They write the result as ±|f(0) ⊕ f(1)⟩|−⟩: the top qubit holds Unit 5.1's one-bit answer.",
    formal:
      'N&C Fig. 1.19 and eqs. 1.41–1.45 (pp. 32–33): |ψ₃⟩ = ±|f(0) ⊕ f(1)⟩|−⟩, the ± a [[global-phase|global phase]]. The circuit combines parallelism with [[qc-interference|interference]]: H recombines the two kicked-back branches (p. 34).',
    caption: `always 1: −|0⟩|−⟩ = (−${d(V.q5D1Re, 3)}, ${d(V.q5D1Re, 3)}, 0, 0)`,
    stage: stage(cDNC(ONE)),
    claims: [claim('q5NCSame', "N&C's two Hadamards reach the same state as Bergou's ψ₁", () => V.q5NCSame === 1), claim('q5D1Re', 'every part of |ψ₁⟩ has size one half', () => close(V.q5D1Re, 0.5))],
  },
  {
    id: 'q5-deutsch:b5',
    phase: 'clue',
    text: "Deutsch's circuit told you whether f is constant. Did it also tell you f(0)?",
    formal: "Does the circuit's output determine f(0)?",
    stage: stage(cD(ONE)),
    reveal: {
      text: 'No. Always 0 and always 1 end in the same state up to a sign, so both read 0. The circuit learns the one bit f(0) ⊕ f(1) and nothing more.',
      formal: 'No: |ψ₃⟩ for always 0 and always 1 differ by the global phase −1, and so do copy and flip; only f(0) ⊕ f(1) is measurable (N&C eq. 1.45).',
      caption: 'always 0 and always 1: the same state, opposite sign',
      stage: stage(cD(ZERO)),
      claims: [
        claim('q5ConstSame', 'always 0 and always 1 give the same state up to a sign', () => V.q5ConstSame === 1),
        claim('q5ConstEqual', 'always 0 and always 1 are not exactly the same state', () => V.q5ConstEqual === 0),
        claim('q5BalSame', 'copy and flip give the same state up to a sign', () => V.q5BalSame === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q5-interferometer — Two paths, one photon: Deutsch in glass                                     */
/* ---------------------------------------------------------------------------------------------- */

const interferometer: Beat[] = [
  {
    id: 'q5-interferometer:b1',
    phase: 'lecture',
    text: "A [[qc-beam-splitter|beam splitter]] sends a photon on in two directions at once. Call the paths a and b, and treat 'in a' and 'in b' as |0⟩ and |1⟩. A photon entering along a leaves as (|a⟩ + |b⟩)/√2: amplitudes 0.707 and 0.707.",
    formal:
      "Bergou eq. 1.17 (p. 7): a† ↦ (a† + b†)/√2, b† ↦ (b† − a†)/√2 for a 50–50 splitter. On one-photon states, a†|vac⟩ ≡ |0⟩ and b†|vac⟩ ≡ |1⟩; this is the quarter-turn matrix (1/√2)[[1, −1], [1, 1]].",
    caption: `after the first splitter: ${d(V.q5R2, 3)} in each arm`,
    captionFormal: "Rosetta: Bergou's |0⟩ in §1.5 is the vacuum, |vac⟩ here",
    stage: stage(cMZ(0), { upTo: { from: 0, to: 1 }, dials: true }),
    claims: [claim('q5R2', `each arm gets amplitude ${d(V.q5R2, 3)}`, () => close(V.q5R2, Math.SQRT1_2, 1e-3))],
  },
  {
    id: 'q5-interferometer:b2',
    phase: 'lecture',
    text: 'Mirrors steer both arms into a second splitter, with a [[qc-phase-shifter|phase shifter]] on each arm: a [[qc-mach-zehnder|Mach–Zehnder interferometer]]. The photon leaves output 1 with amplitude ½(e^{iφ₀} + e^{iφ₁}) and output 2 with ½(e^{iφ₁} − e^{iφ₀}). With φ₀ = 0 and φ₁ = 90°, each output gets chance one half.',
    formal:
      "Two splitters, a phase shift on each arm, applied to a†|vac⟩, give ½(e^{iφ₀} + e^{iφ₁})a†|vac⟩ + ½(e^{iφ₁} − e^{iφ₀})b†|vac⟩ (eq. 1.18, Fig. 1.7, p. 8). With Fig. 1.7's mirrors this is the reverse quarter-turn, the phases, then the quarter-turn (D4; erratum B1).",
    caption: `φ₁ = 90°: output 1 gets ½(1 + i), chance ${pct(V.q5MzHalfP)}`,
    captionFormal: `P(output 1) = cos²((φ₁ − φ₀)/2): ${pct(V.q5MzSweep0)}, ${pct(V.q5MzSweep45)}, ${pct(V.q5MzSweep90)}, ${pct(V.q5MzSweep135)}, ${pct(V.q5MzSweep180)}`,
    stage: stage(cMZ(Math.PI / 2), { upTo: { from: 0, to: 3 }, dials: true }),
    derivation: {
      result: 'P_1 = \\cos^2\\tfrac{\\varphi_1 - \\varphi_0}2',
      ground: [
        { tex: '|0\\rangle \\to \\tfrac1{\\sqrt2}(|0\\rangle + |1\\rangle)', why: 'The first splitter, for a photon entering along arm a (eq. 1.17).' },
        { tex: '\\to \\tfrac1{\\sqrt2}(e^{i\\varphi_0}|0\\rangle + e^{i\\varphi_1}|1\\rangle)', why: "Each shifter multiplies its own arm's amplitude by its phase." },
        {
          tex: '|0\\rangle \\to \\tfrac1{\\sqrt2}(|0\\rangle - |1\\rangle),\\quad |1\\rangle \\to \\tfrac1{\\sqrt2}(|0\\rangle + |1\\rangle)',
          why: "Fig. 1.7's mirrors bring each arm into the second splitter through the other port (erratum B1).",
        },
        { tex: '\\tfrac12e^{i\\varphi_0}(|0\\rangle - |1\\rangle) + \\tfrac12e^{i\\varphi_1}(|0\\rangle + |1\\rangle)', why: 'Apply the previous step to each term.' },
        { tex: '\\tfrac12(e^{i\\varphi_0} + e^{i\\varphi_1})|0\\rangle + \\tfrac12(e^{i\\varphi_1} - e^{i\\varphi_0})|1\\rangle', why: 'Collect output 1 (|0⟩) and output 2 (|1⟩): eq. 1.18.' },
        { tex: 'P_1 = \\tfrac14|e^{i\\varphi_0} + e^{i\\varphi_1}|^2 = \\cos^2\\tfrac{\\varphi_1 - \\varphi_0}2', why: 'The size squared of two unit arrows added (Chapter F1).' },
      ],
      formal: [
        { tex: 'U_{BS} = R_y(\\tfrac\\pi2),\\quad XU_{BS}X = R_y(-\\tfrac\\pi2)', why: "eq. 1.17 on one-photon states; the mirrors and Fig. 1.7's labels conjugate BS2 by X." },
        { tex: 'U_{MZ}|0\\rangle = R_y(-\\tfrac\\pi2)\\,\\mathrm{diag}(e^{i\\varphi_0}, e^{i\\varphi_1})\\,R_y(\\tfrac\\pi2)|0\\rangle', why: 'This is eq. 1.18 (B1).' },
        { tex: 'P_1 = \\cos^2\\tfrac{\\varphi_1 - \\varphi_0}2', why: 'U_{MZ} is unitary, so the same modulus-squared calculation as the Ground-up route applies.' },
      ],
    },
    claims: [
      claim('q5MzHalfP', 'φ₁ = 90°: each output has chance one half', () => close(V.q5MzHalfP, 0.5)),
      claim('q5Quarter', 'the size squared of two unit arrows starts from a factor of one quarter', () => close(V.q5Quarter, 0.25)),
      claim('q5MzSweep0', 'φ₁ = 0°: output 1 always', () => close(V.q5MzSweep0, 1)),
      claim('q5MzSweep45', 'φ₁ = 45°: output 1 has chance 0.8536', () => close(V.q5MzSweep45, Math.cos(Math.PI / 8) ** 2, 1e-3)),
      claim('q5MzSweep90', 'φ₁ = 90°: output 1 has chance one half', () => close(V.q5MzSweep90, 0.5)),
      claim('q5MzSweep135', 'φ₁ = 135°: output 1 has chance 0.1464', () => close(V.q5MzSweep135, Math.sin(Math.PI / 8) ** 2, 1e-3)),
      claim('q5MzSweep180', 'φ₁ = 180°: output 1 never', () => close(V.q5MzSweep180, 0, 1e-6)),
      claim('q5Mz118', 'the mirrored interferometer sends equal phases to output 1', () => close(V.q5Mz118, 1)),
      claim('q5MzNaiveOut2', 'the naive (unmirrored) reading sends equal phases to output 2 instead', () => close(V.q5MzNaiveOut2, 1)),
      claim('q5MirrorBS', "Fig. 1.7's mirrors turn the splitter into its own inverse", () => V.q5MirrorBS === 1),
      claim('q5BSmatches117', "the splitter's matrix is exactly eq. 1.17", () => V.q5BSmatches117 === 1),
      claim('q5MzCos2', 'the port chance follows cos²((φ₁−φ₀)/2)', () => V.q5MzCos2 === 1),
    ],
  },
  {
    id: 'q5-interferometer:b3',
    phase: 'lecture',
    text: 'Now allow only phase shifts of 0 or 180°, standing for f(0) and f(1). Equal phases send the photon out of output 1 every time; unequal phases send it out of output 2. One photon tells whether f is constant, and interference does it.',
    formal:
      "With each arm's phase equal to π times f of that arm, the two-arm phase gate becomes O_f, Unit 5.2's phase oracle (Bergou p. 8). P(output 2) is 0, 0, 1, 1 for always 0, always 1, copy, flip: constructive at one port, destructive at the other.",
    caption: 'copy (0° and 180°): output 2, amplitude −1',
    stage: stage(cMZF(ID)),
    claims: [claim('q5MzF', 'output 2 is certain exactly for balanced f', () => V.q5MzF === 1)],
  },
  {
    id: 'q5-interferometer:b4',
    phase: 'lecture',
    text: "Compare Unit 5.4. After the kickback, Deutsch's top qubit meets H, a sign gate, then H. The interferometer is splitter, phases, splitter. Both send one qubit two ways and recombine it, so interference is the resource.",
    formal:
      "Deutsch's top qubit alone is H, then O_f, then H, with the target |−⟩ a spectator, and the interferometer's reverse-splitter, phase, splitter gives the same port chances for every phase pair (Bergou p. 8).",
    caption: "Deutsch's top wire alone: H, O_f, H; copy ends in |1⟩",
    stage: stage(cHOH(ID)),
    claims: [claim('q5DeutschTopMatches', "the interferometer and Deutsch's top wire agree exactly for f = id", () => V.q5DeutschTopMatches === 1)],
  },
  {
    id: 'q5-interferometer:b5',
    phase: 'clue',
    text: 'Put a detector between the splitters that reads which arm the photon took. With equal phases, does the photon still always leave by output 1?',
    formal: 'With a which-path measurement between the splitters and equal phases, is P(output 1) still 1?',
    stage: stage(cMZ(0)),
    reveal: {
      text: "No. It leaves each output half the time, whatever the phases. With the arm known, each output gets one amplitude and nothing interferes, as 448's middle magnet erased the first answer.",
      formal:
        'No: the reading collapses the photon to |0⟩ or |1⟩, and the second splitter then gives one half, one half for every phase; interference needs both amplitudes to reach one output <<qc-l1-sequential|a new axis erases the old answer>>.',
      caption: 'arm read: output 1 half the time; arm unread: every time',
      stage: stage(C_MZW, { outcomes: '0', mode: 'probability' }),
      claims: [
        claim('q5NoWhichPathOut1', 'unread, the photon leaves output 1 every time', () => close(V.q5NoWhichPathOut1, 1)),
        claim('q5WhichPathOut1', 'read, it leaves output 1 half the time', () => close(V.q5WhichPathOut1, 0.5)),
        claim('q5WhichPathOut2', 'read, it leaves output 2 half the time', () => close(V.q5WhichPathOut2, 0.5)),
        claim('q5WhichPathBranch', 'the which-arm reading itself splits half and half', () => close(V.q5WhichPathBranch, 0.5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q5-other-models — Two other ways to compute                                                    */
/* ---------------------------------------------------------------------------------------------- */

const otherModels: Beat[] = [
  {
    id: 'q5-other-models:b1',
    phase: 'lecture',
    text: 'Bergou names two other models. In [[qc-adiabatic-computing|adiabatic computing]] you slowly change a simple energy operator ℋ₀ into ℋ₁, whose lowest state holds the answer. Go slowly, and the system stays lowest.',
    formal:
      "ℋ(s) = (1 − s)ℋ₀ + sℋ₁ with s = t/t_f, under iħ d|ψ⟩/dt = ℋ(t)|ψ⟩ (Bergou eq. 1.19, p. 9) <<qc-l6-generator|S_z generates the turn>>. The adiabatic theorem keeps the ground state; the smallest [[qc-spectral-gap|gap]] over s sets how slowly to go. Rosetta: Bergou's H_0, H_1 are ℋ₀, ℋ₁.",
    caption: `halfway, s = ½: the arrow is half the gap, ${d(V.q5HHalfALen, 3)}`,
    captionFormal: `ℋ(½) = [[−½, −½], [−½, ½]]: gap ${d(V.q5Gap50, 3)}`,
    stage: opSpace({ op: { matrix: [['-1/2', '-1/2'], ['-1/2', '1/2']] }, eigen: true, labels: 'plain' }),
    claims: [
      claim('q5HHalfALen', "at s = ½ the arrow's length is 0.707", () => close(V.q5HHalfALen, Math.SQRT1_2, 1e-3)),
      claim('q5Gap50', 'the gap at s = ½ is 1.414', () => close(V.q5Gap50, Math.SQRT2, 1e-3)),
      claim('q5HHalfA0', 'at s = ½ the gauge a₀ is 0', () => close(V.q5HHalfA0, 0)),
      claim('q5Half', 's = ½ is the midpoint of the change', () => close(V.q5Half, 0.5)),
    ],
  },
  {
    id: 'q5-other-models:b2',
    phase: 'lecture',
    text: 'A small example of our own: ℋ₀ = −X, whose lowest state is |+⟩, and ℋ₁ = −Z, whose lowest state is |0⟩. The gap dips from 2 at both ends to 1.414 halfway, while the lowest state climbs from |+⟩ to |0⟩.',
    formal:
      'ℋ(s) = −(1 − s)X − sZ has eigenvalues ±√((1 − s)² + s²), so the gap is 2√((1 − s)² + s²), smallest at s = ½ where it is √2 (our example; Bergou gives none). Its ground state has Bloch vector proportional to (1 − s, 0, s).',
    caption: 'the lowest state at s = ½: 45° from the north pole',
    captionFormal: `ground states (1, 0, 0) → (${d(V.q5GroundHalfR2, 3)}, 0, ${d(V.q5GroundHalfR2, 3)}) → (0, 0, 1)`,
    stage: bloch({ state: { thetaDeg: { from: 90, to: 0 }, phiDeg: 0 } }),
    claims: [
      claim('q5Gap0', 'the gap at s = 0 is 2', () => close(V.q5Gap0, 2)),
      claim('q5Gap25', 'the gap at s = 0.25 is 1.5811', () => close(V.q5Gap25, Math.sqrt(2.5), 1e-3)),
      claim('q5Gap50', 'the gap at s = ½ is 1.414', () => close(V.q5Gap50, Math.SQRT2, 1e-3)),
      claim('q5Gap75', 'the gap at s = 0.75 is 1.5811', () => close(V.q5Gap75, Math.sqrt(2.5), 1e-3)),
      claim('q5Gap100', 'the gap at s = 1 is 2', () => close(V.q5Gap100, 2)),
      claim('q5GroundHalfR2', "the ground state's x and z parts at s = ½ are each 0.707", () => close(V.q5GroundHalfR2, Math.SQRT1_2, 1e-3)),
      claim('q5Half', 's = ½ is the midpoint of the change', () => close(V.q5Half, 0.5)),
    ],
  },
  {
    id: 'q5-other-models:b3',
    phase: 'lecture',
    text: 'In [[qc-measurement-based|measurement-based]] computing, measurements do the gates. To apply W(θ) = H·P(θ) to ψ, add a qubit in |+⟩, apply CZ, and read the first qubit in the basis |±θ⟩ = (|0⟩ ± e^{−iθ}|1⟩)/√2. The second qubit is then W(θ)ψ or XW(θ)ψ, each half the time.',
    formal:
      "W(θ)|0⟩ = |+⟩, W(θ)|1⟩ = e^{iθ}|−⟩ (eq. 1.20), so W(θ) = HP(θ). CZ|ψ⟩|+⟩ = (|+θ⟩₁W(θ)|ψ⟩₂ + |−θ⟩₁XW(θ)|ψ⟩₂)/√2 (eq. 1.21; CPHASE = CZ, Unit 4.4), a two-qubit [[qc-cluster-state|cluster state]]; reading in |±θ⟩ is P(θ), H, then a reading (D6).",
    caption: `θ = 45°: each reading has chance ${pct(V.q5MbBasisP)}`,
    captionFormal: `after '+θ': qubit 2 = W(θ)ψ = (${d(V.q5WPsiRe0, 3)} + ${d(V.q5WPsiIm0, 3)}i, ${d(V.q5WPsiRe1, 3)} − ${d(-V.q5WPsiIm1, 3)}i)`,
    stage: stage(C_MB, { outcomes: '0' }),
    derivation: {
      result: '\\mathrm{CZ}|\\psi\\rangle|+\\rangle = \\tfrac1{\\sqrt2}\\big(|{+\\theta}\\rangle W(\\theta)|\\psi\\rangle + |{-\\theta}\\rangle XW(\\theta)|\\psi\\rangle\\big)',
      ground: [
        { tex: '|\\psi\\rangle|+\\rangle = \\alpha|0\\rangle|+\\rangle + \\beta|1\\rangle|+\\rangle', why: 'ψ = α|0⟩ + β|1⟩ beside |+⟩.' },
        { tex: '\\mathrm{CZ}:\\ \\alpha|0\\rangle|+\\rangle + \\beta|1\\rangle|-\\rangle', why: "CZ flips the sign of |11⟩, turning the second qubit's |+⟩ into |−⟩ when the first is 1." },
        { tex: '\\langle{+\\theta}| = \\tfrac1{\\sqrt2}(\\langle0| + e^{i\\theta}\\langle1|)', why: 'The bra of |+θ⟩: conjugate its amplitudes (Unit 1.5).' },
        { tex: '\\langle{+\\theta}|_1(\\ldots) = \\tfrac1{\\sqrt2}(\\alpha|+\\rangle + e^{i\\theta}\\beta|-\\rangle)', why: 'Keep what matches |+θ⟩ on the first qubit.' },
        { tex: 'W(\\theta)|\\psi\\rangle = \\alpha|+\\rangle + e^{i\\theta}\\beta|-\\rangle', why: 'By eq. 1.20, W(θ) sends |0⟩ to |+⟩ and |1⟩ to e^{iθ}|−⟩: this is W(θ)ψ/√2.' },
        { tex: '\\langle{-\\theta}|_1(\\ldots) = \\tfrac1{\\sqrt2}(\\alpha|+\\rangle - e^{i\\theta}\\beta|-\\rangle) = \\tfrac1{\\sqrt2}XW(\\theta)|\\psi\\rangle', why: 'X keeps |+⟩ and flips the sign of |−⟩.' },
        { tex: '\\tfrac1{\\sqrt2}\\big(|{+\\theta}\\rangle W(\\theta)|\\psi\\rangle + |{-\\theta}\\rangle XW(\\theta)|\\psi\\rangle\\big)', why: 'Put the two parts together: eq. 1.21, each reading with chance one half.' },
      ],
      formal: [
        { tex: '\\mathrm{CZ}|\\psi\\rangle|+\\rangle = \\alpha|0, +\\rangle + \\beta|1, -\\rangle', why: 'CZ acts as I when the first qubit is 0 and as Z on the second when it is 1.' },
        { tex: '\\tfrac1{\\sqrt2}\\big(|{+\\theta}\\rangle W(\\theta)|\\psi\\rangle + |{-\\theta}\\rangle XW(\\theta)|\\psi\\rangle\\big)', why: 'Expand |0⟩, |1⟩ in the |±θ⟩ basis; eq. 1.21.' },
      ],
    },
    claims: [
      claim('q5MbBasisP', 'each of the two readings has chance one half', () => close(V.q5MbBasisP, 0.5)),
      claim('q5MbBranch0', 'the |+θ⟩ branch has probability one half', () => V.q5MbBranch0 === 1),
      claim('q5MbBranch1', 'the |−θ⟩ branch has probability one half', () => V.q5MbBranch1 === 1),
      claim('q5W0IsPlus', 'W(θ)|0⟩ = |+⟩', () => V.q5W0IsPlus === 1),
      claim('q5W1IsMinusPhase', 'W(θ)|1⟩ = e^{iθ}|−⟩', () => V.q5W1IsMinusPhase === 1),
      claim('q5WPsiRe0', "W(θ)ψ's |0⟩ amplitude has real part 0.862", () => close(V.q5WPsiRe0, 0.8624, 1e-3)),
      claim('q5WPsiIm0', "W(θ)ψ's |0⟩ amplitude has imaginary part 0.25", () => close(V.q5WPsiIm0, 0.25, 1e-3)),
      claim('q5WPsiRe1', "W(θ)ψ's |1⟩ amplitude has real part 0.362", () => close(V.q5WPsiRe1, 0.3624, 1e-3)),
    ],
  },
  {
    id: 'q5-other-models:b4',
    phase: 'lecture',
    text: 'If the reading gives −θ, the second qubit carries an extra X. At the end that only swaps the final 0 and 1, so relabel the results. For ψ and θ = 45°, W(θ)ψ reads 0 with chance 0.806, and XW(θ)ψ reads 1 with the same chance.',
    formal:
      "The [[qc-byproduct|byproduct]] X is known from the outcome, and a final reading of XW(θ)|ψ⟩ is that of W(θ)|ψ⟩ with 0 and 1 swapped (Bergou p. 10). To chain steps, W(θ)X = e^{iθ}ZW(−θ): Bergou's W(θ)σ_x = σ_zW(−θ) holds up to this global phase (§8.1).",
    caption: `W(θ)ψ: ${pct(V.q5WPsiPZero)}, ${pct(V.q5WPsiPOne)}; XW(θ)ψ: ${pct(V.q5XWPsiPZero)}, ${pct(V.q5XWPsiPOne)}`,
    stage: stage(C_MB, { outcomes: '1' }),
    claims: [
      claim('q5WPsiPZero', 'W(θ)ψ reads 0 with chance 0.806', () => close(V.q5WPsiPZero, 0.8062, 1e-3)),
      claim('q5WPsiPOne', 'W(θ)ψ reads 1 with chance 0.194', () => close(V.q5WPsiPOne, 0.1938, 1e-3)),
      claim('q5XWPsiPZero', 'XW(θ)ψ reads 0 with chance 0.194', () => close(V.q5XWPsiPZero, 0.1938, 1e-3)),
      claim('q5XWPsiPOne', 'XW(θ)ψ reads 1 with chance 0.806', () => close(V.q5XWPsiPOne, 0.8062, 1e-3)),
      claim('q5WIdentPhase', "Bergou's identity holds up to the global phase e^{iθ}", () => V.q5WIdentPhase === 1),
      claim('q5WIdentBare', 'the identity does not hold with no phase at all', () => V.q5WIdentBare === 0),
    ],
  },
  {
    id: 'q5-other-models:b5',
    phase: 'lecture',
    text: "Bergou closes Chapter 1 with three lessons from Deutsch's problem. Quantum states can beat classical ones. Finding such gains is hard. And every algorithm ends by reading out its final state.",
    formal: '§1.7 (p. 10): quantum gains exist, they are hard to find, and the final step is always a reading; any circuit computation can also be run measurement-based (p. 10).',
    caption: 'one query instead of two: the top qubit reads f(0) ⊕ f(1)',
    stage: stage(cDM(NOT), { mode: 'probability' }),
    claims: [claim('q5DTop1Not', 'flip reads the top qubit as 1', () => close(V.q5DTop1Not, 1))],
  },
  {
    id: 'q5-other-models:b6',
    phase: 'clue',
    text: 'In the measurement-based step, the first reading is random. Does that randomness spoil the computation?',
    formal: 'Does the random outcome of the |±θ⟩ reading destroy the intended W(θ)ψ?',
    stage: stage(C_MB, { outcomes: '0' }),
    reveal: {
      text: 'No. Each reading leaves W(θ)ψ or XW(θ)ψ, and you know which. The known X can be undone, or simply swapped out of the final results.',
      formal: 'No: both branches have probability one half and differ by a known Pauli byproduct, corrected by relabelling or absorbed into later measurement bases (Bergou p. 10).',
      caption: 'both readings: chance one half, each a known version of W(θ)ψ',
      stage: stage(C_MB, { outcomes: '1' }),
      claims: [
        claim('q5MbBranch0', 'the first branch has probability one half', () => V.q5MbBranch0 === 1),
        claim('q5MbBranch1', 'the second branch has probability one half', () => V.q5MbBranch1 === 1),
      ],
    },
  },
]

export const Q5_STORY: Record<string, Beat[]> = {
  'q5-problem': problem,
  'q5-oracle': oracle,
  'q5-one-value': oneValue,
  'q5-deutsch': deutsch,
  'q5-interferometer': interferometer,
  'q5-other-models': otherModels,
}
