/**
 * Chapter F6 scroll story, both tracks over one stage (plan: docs/roles/proposals/P-F6-story.md §1–§2; rulings
 * docs/roles/decisions/qc709-foundations.md, qc709-foundations-rulings.md). F6 is the ground-up owner of the tensor
 * (Kronecker) product: the joint space, ⊗ on vectors and on operators, and the product-vs-entangled test.
 *
 * Rules kept here:
 * - An F chapter has no lecture notes: its own line is phase 'core' ("The foundation"), then 'books', then the clue.
 * - `text` is the Ground-up track (9th-grade start, ≤ 25 words per sentence), `formal` the Formal track (≤ 40).
 * - Qubit order (engine C2, state.ts): q0 is the leftmost factor, the most significant bit, big-endian; |0⟩ = |+z⟩.
 * - Every number in the prose comes from F6.values.ts through a keyed claim.
 *
 * Glossary reuse, not redefinition (build note; the brief flagged this directly): the plan's own notation beats named
 * `qc-joint-space`, `qc-tensor-product`, `qc-product-state`, `qc-entangled` and `qc-register` as F6's new ids, but
 * Chapter Q4 already owns `qc-tensor-product` and `qc-register`, and Chapter Q6 already owns `qc-composite-space`
 * ("joint space"), `qc-product-state` and `qc-entangled` — `registerGloss` throws on a duplicate id. This chapter's
 * prose reuses the existing entries with `[[id|shown text]]`. F6 owns the joint space and ⊗ on vectors, so its notation
 * beats set `Beat.introduces` on Q6's `qc-composite-space` (f6-pairs:b1) and Q4's `qc-tensor-product` (f6-kron:b1); the
 * introduces-once lint is per chapter, so Q4 and Q6 keep theirs (P-F6-review item 7). F6 defines one new id, the notion
 * neither Q4 nor Q6 names: `qc-kronecker-product` (the matrix-index form, introduced at f6-operator:b1). The old
 * `qc-local-operator` was dropped (item 6): a local operator A⊗I is Q4's `qc-tensor-operator`, linked at f6-operator:b2
 * and b3 beside Q4's `qc-coefficient-matrix` and Q6's `qc-factoring-test` at f6-product-or-not:b1.
 *
 * F2 and F3 are MERGED: f6-pairs and f6-kron bridge to F2's `f2-vectors` unit (states as amplitude lists in ℂⁿ,
 * new bridge id `qc-f2-vectors`); f6-operator bridges to F3's `f3-matrix-of-map` unit (new id `qc-f3-matrix-of-map`)
 * and reuses 448's existing `qc-l4-matrices`; f6-product-or-not has no bridge (the old `qc-l7-order` one landed on an
 * unrelated unit, item 10). F4's spectral theorem and F5's Shannon entropy are named in words only, no bridge tokens.
 */
import type { AmpSource, AmplitudesState, Beat, MatrixGridState, MatrixSource, Ref, StageLayout, StageState, TwoQubitSource, TwoQubitState } from '../schema'
import { V, claim, close } from './F6.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan §0 "Stage shorthand"), as plain builder functions                          */
/* ---------------------------------------------------------------------------------------------- */

const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({
  kind: 'matrix',
  source,
  labels: 'kets',
  values: 'exact',
  shot: 'M-GRID',
  ...extra,
})
const K = (label: string): AmpSource => ({ ket: label })
const Bk = (content: string): AmpSource => ({ bell: content })
const kronSrc = (a: MatrixSource, b: MatrixSource): MatrixSource => ({ kron: [a, b] })
const pa = (letters: string): MatrixSource => kronSrc({ pauli: letters[0] }, { pauli: letters[1] })
const coefSrc = (s: AmpSource): MatrixSource => ({ coef: s })
const amp = (state: AmpSource, extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => ({ kind: 'amplitudes', state, shot: 'A-BARS', ...extra })
const twoQubit = (source: TwoQubitSource, extra: Partial<Omit<TwoQubitState, 'kind' | 'source'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source,
  labels: 'q1-q2',
  arrows: 'reduced',
  shot: 'TQ-PAIR',
  ...extra,
})
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

export const axler = (where: string, adds: string): Ref => ({ source: 'axler', where, adds })
export const nc = (where: string, adds: string): Ref => ({ source: 'nc', where, adds })
export const bergou = (where: string, adds: string): Ref => ({ source: 'bergou', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* Claims (keyed to F6.values.ts; see that file for the engine call behind each key)                */
/* ---------------------------------------------------------------------------------------------- */

export const C = {
  twoQDim: claim('f6TwoQDim', 'two qubits: $2 \\times 2 = 4$ joint states', () => V.f6TwoQDim === 4),
  dimRule: claim('f6DimRule', '$\\dim(V \\otimes W) = \\dim V \\cdot \\dim W$: $2 \\times 2 = 4$', () => V.f6DimRule === 4),
  idx10: claim('f6Idx10', '$|10\\rangle$ is index 2 (big-endian)', () => V.f6Idx10 === 2),
  bits3: claim('f6Bits3', 'index 3 of two qubits is $|11\\rangle$', () => V.f6Bits3 === 11),
  strings: claim('f6Strings', '3 bits give $2^3 = 8$ strings', () => V.f6Strings === 8),
  regLen: claim('f6RegLen', 'a two-qubit register has 4 amplitudes', () => V.f6RegLen === 4),
  regAmp: claim('f6RegAmp', 'the two-atom register’s nonzero amplitude is 0.707', () => close(V.f6RegAmp, Math.SQRT1_2)),
  tenDim: claim('f6TenDim', 'ten qubits: $2^{10} = 1024$ amplitudes', () => V.f6TenDim === 1024),
  addWrong: claim('f6AddWrong', 'adding (wrongly) would give $2 \\times 10 = 20$', () => V.f6AddWrong === 20),
  plusZero: claim('f6PlusZero', '$|{+}0\\rangle$’s two nonzero amplitudes are equal', () => V.f6PlusZero === 1),
  plusZeroRe: claim('f6PlusZeroRe', '$|{+}0\\rangle$’s first amplitude is 0.707', () => close(V.f6PlusZeroRe, Math.SQRT1_2)),
  plusMinus: claim('f6PlusMinus', '$|{+}{-}\\rangle$’s second amplitude is negative', () => V.f6PlusMinus === 1),
  plusMinusRe: claim('f6PlusMinusRe', '$|{+}{-}\\rangle$’s first amplitude is 0.5', () => close(V.f6PlusMinusRe, 0.5)),
  idx01: claim('f6Idx01', '$|01\\rangle$ is index 1', () => V.f6Idx01 === 1),
  xi: claim('f6XI', '$X \\otimes I$ matches its block table', () => V.f6XI === 1),
  xiDim: claim('f6XIdim', '$X \\otimes I$ is $4 \\times 4$', () => V.f6XIdim === 4),
  xiNonzeroFrac: claim('f6XInonzeroFrac', '$X \\otimes I$ has 4 of 16 entries nonzero (25%)', () => close(V.f6XInonzeroFrac, 0.25)),
  xiOn01: claim('f6XIon01', '$(X \\otimes I)|01\\rangle = |11\\rangle$', () => V.f6XIon01 === 1),
  idx11: claim('f6Idx11', '$|11\\rangle$ is index 3', () => V.f6Idx11 === 3),
  localCommute: claim('f6LocalCommute', 'local operators on different parts commute', () => close(V.f6LocalCommute, 0, 1e-6)),
  xiiXcommute: claim('f6XIIXcommute', '$X \\otimes I$ and $I \\otimes X$ commute', () => close(V.f6XIIXcommute, 0, 1e-6)),
  xiEqIX: claim('f6XIeqIX', '$X \\otimes I \\ne I \\otimes X$', () => V.f6XIeqIX === 0),
  ixOn01: claim('f6IXon01', '$(I \\otimes X)|01\\rangle = |00\\rangle$, index 0', () => V.f6IXon01 === 1),
  prodDet: claim('f6ProdDet', '$|{+}{+}\\rangle$: $\\det C = 0$, a product', () => close(V.f6ProdDet, 0)),
  prodEntry: claim('f6ProdEntry', 'every entry of $|{+}{+}\\rangle$’s table is 0.5', () => close(V.f6ProdEntry, 0.5)),
  prodIsProduct: claim('f6ProdIsProduct', '$|{+}{+}\\rangle$ is a product state', () => V.f6ProdIsProduct === 1),
  bellDet: claim('f6BellDet', 'the Bell state: $\\det C = \\tfrac12$', () => close(V.f6BellDet, 0.5)),
  bellSchmidt: claim('f6BellSchmidt', 'the Bell state has Schmidt rank 2', () => V.f6BellSchmidt === 2),
  bellEntangled: claim('f6BellEntangled', 'the Bell state is NOT a product', () => V.f6BellEntangled === 0),
  bellSchmidtX: claim('f6BellSchmidtX', 'Schmidt rank 2 in the x basis too', () => V.f6BellSchmidtX === 2),
  psi01isProduct: claim('f6Psi01isProduct', '$(|01\\rangle + |10\\rangle)/\\sqrt2$ is entangled', () => V.f6Psi01isProduct === 0),
  prodNorm: claim('f6ProdNorm', '$\\||{+}\\rangle \\otimes |{-}\\rangle\\| = 1$', () => close(V.f6ProdNorm, 1)),
  innerFactor: claim('f6InnerFactor', '$\\langle a{\\otimes}b|c{\\otimes}d\\rangle = \\langle a|c\\rangle\\langle b|d\\rangle$', () => V.f6InnerFactor === 1),
  basisCount: claim('f6BasisCount', 'three qubits: $2^3 = 8$ basis states', () => V.f6BasisCount === 8),
  mem30Bytes: claim('f6Mem30Bytes', '30 qubits: $16 \\times 2^{30}$ bytes, about 17 billion', () => V.f6Mem30Bytes === 16 * 2 ** 30 && Math.round(V.f6Mem30Bytes / 1e9) === 17),
  mem30: claim('f6Mem30', '30 qubits: 16 GiB', () => close(V.f6Mem30, 16)),
  mem50: claim('f6Mem50', '50 qubits: 16 PiB', () => close(V.f6Mem50, 16)),
  params10General: claim('f6Params10General', 'a general 10-qubit state: 2046 real parameters', () => V.f6Params10General === 2046),
  params10Product: claim('f6Params10Product', 'a product 10-qubit state: 20 real parameters', () => V.f6Params10Product === 20),
  prodFrac: claim('f6ProdFrac', '$20/2046 \\approx 1\\%$', () => close(V.f6ProdFrac, 20 / 2046)),
}

/* ---------------------------------------------------------------------------------------------- */
/* f6-pairs — Two systems, one joint space                                                          */
/* ---------------------------------------------------------------------------------------------- */

const pairs: Beat[] = [
  {
    id: 'f6-pairs:b1',
    phase: 'core',
    introduces: ['qc-composite-space'],
    text:
      'Put two systems together. If the first has $m$ states and the second has $n$, the pair has $m \\times n$ joint states — every first state paired with every second. That pairing lives in the [[qc-composite-space|joint space]] $\\text{\u2102}^m \\otimes \\text{\u2102}^n$. For any two spaces $V$ and $W$ it is written $V \\otimes W$, where $\\dim V$ counts the basis states of $V$. Two [[qubit|qubits]] give $2 \\times 2 = 4$ states.',
    formal:
      'The [[qc-composite-space|joint space]] of systems with spaces $V$ (dim $m$) and $W$ (dim $n$) is $V \\otimes W$, of dimension $mn$ (Axler Eq. 9.72, p. 372; N&C §2.1.7). Two [[qubit|qubits]]: $\\text{\u2102}^2 \\otimes \\text{\u2102}^2 = \\text{\u2102}^4$. $n$ qubits: $\\text{\u2102}^{2^n}$.',
    caption: 'two qubits: $2 \\times 2 = 4$ joint states',
    captionFormal: '$\\dim(V \\otimes W) = \\dim V \\cdot \\dim W$',
    stage: amp(K('00')),
    refs: [axler('9.72, p. 372', 'The tensor product $V \\otimes W$ of two [[qc-vector-space|vector spaces]] and its dimension.'), nc('§2.1.7, p. 71', 'The tensor product of state spaces.')],
    claims: [C.twoQDim],
  },
  {
    id: 'f6-pairs:b2',
    phase: 'core',
    text:
      'Name the joint basis states by both labels at once: $|00\\rangle$, $|01\\rangle$, $|10\\rangle$, $|11\\rangle$. Read left to right, the first symbol is the first qubit. As a number, $|10\\rangle$ is index 2. In general $n$ bits give $2^n$ strings.',
    formal:
      'The joint basis is $\\{|a\\rangle \\otimes |b\\rangle\\} = \\{|ab\\rangle\\}$; the index of $|b_0 \\ldots b_{n-1}\\rangle$ is $\\sum_k b_k 2^{n-1-k}$ (big-endian, engine C2; N&C §2.1.7; Bergou Eq. 1.3, p. 2). $n$ bits give $2^n$ strings. $|10\\rangle \\mapsto 2$, $|11\\rangle \\mapsto 3$.',
    caption: '$|00\\rangle, |01\\rangle, |10\\rangle, |11\\rangle$: the four labels',
    captionFormal: '$|10\\rangle$ is index 2 (big-endian)',
    stage: amp(K('10')),
    refs: [bergou('Eq. 1.3, p. 2', 'The basis states of a register of several qubits, labelled by a binary string.')],
    derivation: {
      result: 'n \\text{ bits} \\to 2^n \\text{ strings}',
      ground: [
        { tex: '1 \\text{ bit} \\to 2 \\text{ strings: } 0, 1', why: 'One bit has two values.', view: amp(K('0')), viewCaption: 'one qubit: 2 bars' },
        { tex: '\\text{add a bit} \\to \\text{each string gains a } 0 \\text{ or a } 1', why: 'A new bit doubles the list.' },
        { tex: 'n \\text{ bits} \\to 2^n \\text{ strings}', why: 'Doubling $n$ times.', view: amp(K('00')), viewCaption: 'two qubits: 4 bars' },
      ],
      formal: [
        { tex: '|\\{0, 1\\}^n| = 2^n', why: 'The strings are the functions $\\{0,\\ldots,n-1\\} \\to \\{0, 1\\}$ (N&C §2.1.7).', view: amp(K('0')) },
        { tex: 'n \\text{ bits} \\to 2^n \\text{ strings}', why: 'One amplitude per string.', view: amp(K('00')) },
      ],
    },
    claims: [C.idx10, C.bits3, C.strings],
  },
  {
    id: 'f6-pairs:b3',
    phase: 'books',
    text:
      'Two spin-½ atoms form one four-state system. The register’s state is a list of four amplitudes, one per joint basis state: $c_{ab}$ is the amplitude of $|ab\\rangle$, so the four are $c_{00}, c_{01}, c_{10}, c_{11}$. You need all four numbers to describe the pair, whatever its state. Here two of them are $0.707$. <<qc-f2-vectors|states as lists of amplitudes>>',
    formal:
      'A two-qubit register is a unit vector in $\\text{\u2102}^4$, $\\sum_{a,b} c_{ab}|ab\\rangle$ (Bergou Eq. 1.4, p. 2). The four amplitudes $c_{00}, c_{01}, c_{10}, c_{11}$ are the register’s full description; later units ask which of them factor. Here $c_{00} = c_{11} \\approx 0.707$. <<qc-f2-vectors|states as lists of amplitudes>>',
    caption: 'a two-qubit register: four amplitudes $c_{ab}$',
    stage: amp(Bk('00+11')),
    refs: [bergou('Eq. 1.4, p. 2', 'A register state written as a sum over its basis labels, one amplitude per label.')],
    claims: [C.regLen, C.regAmp],
  },
  {
    id: 'f6-pairs:b4',
    phase: 'clue',
    text: 'One qubit needs 2 numbers. Ten qubits — do they need $2 + 2 + \\cdots = 20$ numbers, or something else?',
    formal: 'Does the dimension of a joint space add or multiply over the parts?',
    stage: amp(K('0')),
    reveal: {
      text:
        'It multiplies. Ten qubits need $2^{10} = 1024$ amplitudes, not $20$. Each qubit doubles the count, because every new choice pairs with all the old ones. Multiplying, not adding, is what makes quantum systems large.',
      formal:
        '$\\dim$ multiplies: $\\dim(V_1 \\otimes \\cdots \\otimes V_n) = \\prod_i \\dim V_i$ (Axler Eq. 9.89, p. 379). Ten qubits: $2^{10} = 1024$. Adding would give $20$ — the difference is the whole story of Unit F6.5.',
      caption: 'ten qubits: $2^{10} = 1024$, not $20$ (five qubits shown: 32 bars)',
      stage: amp(K('00000')), // the stage caps at 5 qubits (32 bars); the caption carries the true $2^{10}=1024$ count and says so
      claims: [C.tenDim, C.addWrong],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f6-kron — Every amplitude times every amplitude                                                  */
/* ---------------------------------------------------------------------------------------------- */

const kronUnit: Beat[] = [
  {
    id: 'f6-kron:b1',
    phase: 'core',
    introduces: ['qc-tensor-product'],
    text:
      'Build the joint state of two independent systems with the [[qc-tensor-product|tensor product]] $\\otimes$. It multiplies every amplitude of the first by every amplitude of the second. For $(a_0, a_1) \\otimes (b_0, b_1)$ the result is $(a_0 b_0, a_0 b_1, a_1 b_0, a_1 b_1)$.',
    formal:
      'The [[qc-tensor-product|tensor product]] $|\\psi\\rangle \\otimes |\\varphi\\rangle$ has amplitudes $(\\psi \\otimes \\varphi)_{ab} = \\psi_a \\varphi_b$ (Axler Eq. 9.76, p. 374; N&C §2.1.7). For $(a_0|0\\rangle + a_1|1\\rangle) \\otimes (b_0|0\\rangle + b_1|1\\rangle)$ the distributive law gives $a_0 b_0|00\\rangle + a_0 b_1|01\\rangle + a_1 b_0|10\\rangle + a_1 b_1|11\\rangle$.',
    caption: '$(a_0, a_1) \\otimes (b_0, b_1) = (a_0 b_0, a_0 b_1, a_1 b_0, a_1 b_1)$',
    captionFormal: 'Rosetta: $\\otimes$ is the tensor product; $|ab\\rangle = |a\\rangle \\otimes |b\\rangle$',
    stage: amp(K('+0')),
    derivation: {
      result: '(\\psi \\otimes \\varphi)_{ab} = \\psi_a \\varphi_b',
      ground: [
        { tex: '(a_0|0\\rangle + a_1|1\\rangle) \\otimes (b_0|0\\rangle + b_1|1\\rangle)', why: 'Two single-qubit lists to combine.', view: amp(K('+')), viewCaption: 'the first factor, $|{+}\\rangle$' },
        { tex: '= a_0|0\\rangle \\otimes (b_0|0\\rangle + b_1|1\\rangle) + a_1|1\\rangle \\otimes (\\ldots)', why: 'Distribute the first bracket over the second.' },
        { tex: '= a_0 b_0|00\\rangle + a_0 b_1|01\\rangle + a_1 b_0|10\\rangle + a_1 b_1|11\\rangle', why: '$\\otimes$ is bilinear: pull scalars out, $|a\\rangle \\otimes |b\\rangle = |ab\\rangle$.', view: amp(K('+0')), viewCaption: '$|{+}0\\rangle$: four product amplitudes' },
        { tex: '(\\psi \\otimes \\varphi)_{ab} = \\psi_a \\varphi_b', why: 'Every amplitude is such a product: the first factor’s amplitude for label $a$ times the second’s for label $b$.' },
      ],
      formal: [
        { tex: '|{+}\\rangle \\otimes |0\\rangle = \\tfrac1{\\sqrt2}(|00\\rangle + |10\\rangle)', why: 'The worked case.', view: amp(K('+0')) },
        { tex: '(\\psi \\otimes \\varphi)_{ab} = \\psi_a \\varphi_b', why: 'In general, bilinearity of $\\otimes$ (Axler Eq. 9.73, p. 372) makes the coordinates products (Eq. 9.76, p. 374).', view: amp(K('+')) },
      ],
    },
    claims: [C.plusZero, C.plusZeroRe],
  },
  {
    id: 'f6-kron:b2',
    phase: 'core',
    text:
      'Take $|{+}\\rangle \\otimes |0\\rangle$. The first list is $(0.707, 0.707)$, the second $(1, 0)$. Multiply every pair: $(0.707, 0, 0.707, 0)$. So $|{+}0\\rangle = (|00\\rangle + |10\\rangle)/\\sqrt2$: the first qubit is split, the second is $0$.',
    formal:
      '$|{+}\\rangle \\otimes |0\\rangle = \\tfrac1{\\sqrt2}(|0\\rangle + |1\\rangle) \\otimes |0\\rangle = \\tfrac1{\\sqrt2}(|00\\rangle + |10\\rangle)$, amplitudes $(0.707, 0, 0.707, 0)$. The second factor $|0\\rangle$ zeroes every $b = 1$ amplitude.',
    caption: '$|{+}0\\rangle = (|00\\rangle + |10\\rangle)/\\sqrt2$',
    stage: amp(K('+0')),
    claims: [C.plusZeroRe],
  },
  {
    id: 'f6-kron:b3',
    phase: 'books',
    text:
      'Each joint amplitude is a product of two single amplitudes. For $|{+}\\rangle \\otimes |{-}\\rangle$ the four are $0.5, -0.5, 0.5, -0.5$: each is $\\pm0.5$ because $0.707 \\times 0.707 = 0.5$. A sign comes only from the $|{-}\\rangle$ factor’s minus.',
    formal:
      '$|{+}\\rangle \\otimes |{-}\\rangle$ has $c_{ab} = (\\pm1/\\sqrt2)(\\pm1/\\sqrt2)$, giving $(0.5, -0.5, 0.5, -0.5)$ (Axler Eq. 9.76, p. 374). The sign structure factors: the $b = 1$ column inherits $|{-}\\rangle$’s minus, so the pair is still a product.',
    caption: '$|{+}{-}\\rangle = (0.5, -0.5, 0.5, -0.5)$',
    stage: amp(K('+-')),
    refs: [axler('9.76, p. 374', 'The coordinates of $\\psi \\otimes \\varphi$ as products of coordinates.')],
    claims: [C.plusMinus, C.plusMinusRe, C.plusZeroRe],
  },
  {
    id: 'f6-kron:b4',
    phase: 'clue',
    text: 'Is $|0\\rangle \\otimes |1\\rangle$ the same joint state as $|1\\rangle \\otimes |0\\rangle$?',
    formal: 'Does $|0\\rangle \\otimes |1\\rangle = |1\\rangle \\otimes |0\\rangle$?',
    stage: amp(K('01')),
    reveal: {
      text:
        'No. $|0\\rangle \\otimes |1\\rangle = |01\\rangle$ is index 1; $|1\\rangle \\otimes |0\\rangle = |10\\rangle$ is index 2. They are different basis states — qubit 1 up, qubit 2 down, versus the reverse. The order names which qubit is which.',
      formal:
        'No: $|01\\rangle \\ne |10\\rangle$ — different basis vectors ($\\otimes$ is not commutative on labelled factors). The order fixes which system each factor describes; swapping is the [[qc-swap-gate|SWAP gate]], a real operation (Chapter Q4).',
      caption: '$|01\\rangle$ (index 1) $\\ne$ $|10\\rangle$ (index 2)',
      stage: amp(K('10')),
      claims: [C.idx01, C.idx10],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f6-operator — Machines acting on one part                                                        */
/* ---------------------------------------------------------------------------------------------- */

const operatorUnit: Beat[] = [
  {
    id: 'f6-operator:b1',
    phase: 'core',
    introduces: ['qc-kronecker-product'],
    text:
      'Two machines, one on each system, combine the same way: the [[qc-kronecker-product|Kronecker product]] $A \\otimes B$. As a table it is $B$ copied into each slot of $A$, scaled by that slot’s entry — a block table. For two qubits $A \\otimes B$ is $4 \\times 4$; $X \\otimes I$ on the stage has 4 of its 16 entries nonzero ($25\\%$). <<qc-f3-matrix-of-map|a map written as a table of numbers>>',
    formal:
      'The [[qc-kronecker-product|Kronecker product]] $(A \\otimes B)_{(ab),(a\'b\')} = A_{aa\'}B_{bb\'}$ (N&C Eq. 2.50, p. 74): an $m{\\times}m$ by $n{\\times}n$ pair makes an $mn \\times mn$ block matrix, block $(a, a\')$ equal to $A_{aa\'}B$. $X \\otimes I$ is $4 \\times 4$, with 4 of its 16 entries nonzero (25%). <<qc-f3-matrix-of-map|a map written as a table of numbers>>',
    caption: '$A \\otimes B$: $B$ in each slot of $A$',
    captionFormal: '$(A \\otimes B)_{(ab),(a\'b\')} = A_{aa\'}B_{bb\'}$',
    stage: mx(pa('XI'), { blocks: 2 }),
    refs: [
      nc('Eq. 2.50, p. 74', 'The Kronecker product of operators as a block matrix.'),
      { source: 'lecture', where: 'notes p. 23', adds: 'The product basis kets, a one-system operator lifted to the pair as $A \\otimes I$, and the Kronecker block matrix.' },
    ],
    claims: [C.xi, C.xiDim, C.xiNonzeroFrac],
  },
  {
    id: 'f6-operator:b2',
    phase: 'core',
    text:
      'A [[qc-tensor-operator|combined machine]] acts factor by factor: for any states $u$ and $v$, $(A \\otimes B)(u \\otimes v) = Au \\otimes Bv$. Each machine works on its own system, then the results are tensored. So $X \\otimes I$ on $|0\\rangle \\otimes |1\\rangle$ gives $X|0\\rangle \\otimes I|1\\rangle = |1\\rangle \\otimes |1\\rangle = |11\\rangle$.',
    formal:
      '$(A \\otimes B)(|u\\rangle \\otimes |v\\rangle) = A|u\\rangle \\otimes B|v\\rangle$, the [[qc-tensor-operator|tensor operator]] rule (Axler §9D Ex. 9, p. 381; N&C Eq. 2.45, p. 73). Linearity extends it to sums. $(X \\otimes I)|01\\rangle = |11\\rangle$: $X$ flips the first qubit, $I$ leaves the second.',
    caption: '$(X \\otimes I)|01\\rangle = |11\\rangle$',
    stage: split(mx(pa('XI'), { blocks: 2 }), amp(K('11'))),
    derivation: {
      result: '(A \\otimes B)(u \\otimes v) = Au \\otimes Bv',
      ground: [
        { tex: '(A \\otimes B)|e_k \\otimes e_l\\rangle', why: 'The combined table acts on a joint frame vector.', view: mx(pa('XI'), { blocks: 2 }), viewCaption: '$X \\otimes I$ as blocks' },
        { tex: '(X \\otimes I)|01\\rangle', why: '$X$ flips the first qubit’s slot, $I$ leaves the second alone.', view: mx(pa('XI'), { blocks: 2, highlight: [[3, 1]] }), viewCaption: 'the entry that sends $|01\\rangle$ to $|11\\rangle$' },
        { tex: '= X|0\\rangle \\otimes I|1\\rangle', why: 'Each factor machine acts on its own system.', view: amp(K('11')), viewCaption: '$(X \\otimes I)|01\\rangle = |11\\rangle$' },
        { tex: '= |1\\rangle \\otimes |1\\rangle', why: '$X|0\\rangle = |1\\rangle$, $I|1\\rangle = |1\\rangle$.' },
        { tex: '(A \\otimes B)(u \\otimes v) = Au \\otimes Bv', why: 'So the combined machine acts factor by factor.' },
      ],
      formal: [
        { tex: '[(A \\otimes B)(u \\otimes v)]_{aa\'} = (Au)_a(Bv)_{a\'}', why: 'The double sum over the Kronecker entries factors (Axler §9D Ex. 9, p. 381).', view: mx(pa('XI'), { blocks: 2 }) },
        { tex: '(A \\otimes B)(u \\otimes v) = Au \\otimes Bv', why: 'Extended bilinearly to all states.', view: amp(K('11')) },
      ],
    },
    claims: [C.xiOn01, C.idx11],
  },
  {
    id: 'f6-operator:b3',
    phase: 'books',
    text:
      'The [[qc-tensor-operator|operator product]] $X \\otimes I$ is local: it changes only the first system and leaves the second alone. Local machines are how we describe acting on one atom of a pair. The $I$ factor is the promise to do nothing to the other. <<qc-l4-matrices|spin matrices built from their outcomes>>',
    formal:
      'A local operator $A \\otimes I$, a [[qc-tensor-operator|tensor operator]] on one wire, acts on system A alone (Bergou §2.1, p. 16, $X_A \\otimes I_B$). $\\langle ab|(A \\otimes I)|a\'b\'\\rangle = A_{aa\'}\\delta_{bb\'}$: the second index is untouched. Products of local operators, $A \\otimes B = (A \\otimes I)(I \\otimes B)$, commute across the two systems. <<qc-l4-matrices|spin matrices built from their outcomes>>',
    caption: '$X \\otimes I$: flip qubit 1, leave qubit 2',
    captionFormal: '$A \\otimes I$ acts on system A alone',
    stage: mx(pa('XI'), { blocks: 2, highlight: [[0, 2], [1, 3], [2, 0], [3, 1]] }),
    refs: [
      bergou('§2.1, p. 16', 'A local operator $X_A \\otimes I_B$ acting on one system of a pair.'),
      { source: 'lecture', where: 'notes p. 23', adds: 'Lifting a one-system operator to the pair as $A \\otimes I$.' },
    ],
    claims: [C.xi, C.localCommute],
  },
  {
    id: 'f6-operator:b4',
    phase: 'clue',
    text: 'Is $X \\otimes I$ the same table as $I \\otimes X$?',
    formal: 'Does $X \\otimes I = I \\otimes X$?',
    stage: mx(pa('XI'), { blocks: 2 }),
    reveal: {
      text:
        'No. $X \\otimes I$ flips the first qubit; $I \\otimes X$ flips the second. Their tables differ: $X \\otimes I$ flips the first label of each pair, $I \\otimes X$ the second. Which system a machine touches depends on its place in the product.',
      formal:
        'No: $X \\otimes I \\ne I \\otimes X$ as $4 \\times 4$ tables ($\\otimes$ is not commutative on operators). $(X \\otimes I)|01\\rangle = |11\\rangle$ but $(I \\otimes X)|01\\rangle = |00\\rangle$. They do commute as operators, but they are not equal.',
      caption: '$X \\otimes I \\ne I \\otimes X$',
      stage: mx(pa('IX'), { blocks: 2 }),
      claims: [C.xiEqIX, C.ixOn01, C.xiiXcommute],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f6-product-or-not — When a joint state splits, and when it does not                              */
/* ---------------------------------------------------------------------------------------------- */

const productOrNot: Beat[] = [
  {
    id: 'f6-product-or-not:b1',
    phase: 'core',
    text:
      'Some joint states split back into two single ones, $|\\psi\\rangle \\otimes |\\varphi\\rangle$: a [[qc-product-state|product state]]. Others cannot be split: they are [[qc-entangled|entangled]]. For two qubits, write the four amplitudes as a $2 \\times 2$ [[qc-coefficient-matrix|table]] $C$: $c_{ab}$, the amplitude of $|ab\\rangle$, sits in row $a$ and column $b$. The [[qc-factoring-test|test]]: the state is a product exactly when $\\det C = c_{00}c_{11} - c_{01}c_{10} = 0$.',
    formal:
      'A two-qubit $\\sum c_{ab}|ab\\rangle$ is a [[qc-product-state|product]] iff its [[qc-coefficient-matrix|coefficient matrix]] $C = [c_{ab}]$ has rank 1, i.e. the [[qc-factoring-test|test]] $\\det C = c_{00}c_{11} - c_{01}c_{10} = 0$ holds; otherwise it is [[qc-entangled|entangled]] (N&C §2.2.8, pp. 95–96; Bergou Eq. 3.1, p. 31). The Schmidt rank is $\\mathrm{rank}\\,C$.',
    caption: 'product $\\Leftrightarrow \\det C = 0$',
    captionFormal: '$C = [c_{ab}]$; product $\\Leftrightarrow \\mathrm{rank}\\,C = 1$',
    stage: mx(coefSrc(K('++')), { svd: true }),
    refs: [
      nc('§2.2.8, pp. 95–96', 'An entangled state is one that cannot be written as a product of two single states.'),
      bergou('§3.1, p. 31, Eq. 3.1', 'Entanglement: a two-qubit state that is not of product form.'),
      { source: 'lecture', where: 'notes p. 22', adds: 'How a product state factorizes an average of a two-part measurement, and the argument that a Bell-type state cannot be a product.' },
    ],
    derivation: {
      result: '\\text{product} \\Leftrightarrow \\det C = 0',
      ground: [
        { tex: '\\text{product} \\Rightarrow c_{ab} = \\psi_a \\varphi_b', why: 'If $|\\psi\\rangle \\otimes |\\varphi\\rangle$, each amplitude factors.', view: mx(coefSrc(K('++')), { svd: true }), viewCaption: 'a product: one Schmidt bar' },
        { tex: '\\det C = \\psi_0\\varphi_0 \\cdot \\psi_1\\varphi_1 - \\psi_0\\varphi_1 \\cdot \\psi_1\\varphi_0 = 0', why: 'Write out the determinant; the two terms are equal.' },
        { tex: '\\det C = 0 \\Rightarrow \\text{product}', why: 'Conversely, if $\\det C = 0$ the rows are proportional, so $c_{ab} = \\psi_a\\varphi_b$ for some $\\psi, \\varphi$.', view: mx(coefSrc(Bk('00+11')), { svd: true }), viewCaption: 'entangled: two bars, $\\det C \\ne 0$' },
        { tex: '\\text{product} \\Leftrightarrow \\det C = 0', why: 'Both directions; otherwise the state is entangled.' },
      ],
      formal: [
        { tex: 'C = [c_{ab}];\\ \\text{rank-1} \\Leftrightarrow C = \\psi\\varphi^\\top \\Leftrightarrow \\det C = 0', why: 'A $2{\\times}2$ matrix is rank 1 iff its determinant vanishes.', view: mx(coefSrc(K('++')), { svd: true }) },
        { tex: '\\text{product} \\Leftrightarrow \\det C = 0', why: 'The Schmidt rank $\\mathrm{rank}\\,C$; rank 2 is entangled.', view: mx(coefSrc(Bk('00+11')), { svd: true }) },
      ],
    },
    claims: [C.prodDet, C.bellDet],
  },
  {
    id: 'f6-product-or-not:b2',
    phase: 'core',
    text:
      'Take $|{+}{+}\\rangle = (1, 1, 1, 1)/2$. Its table $C$ has every entry 0.5, so $\\det C = 0$ (the two cross terms cancel): a product. Indeed $|{+}{+}\\rangle = |{+}\\rangle \\otimes |{+}\\rangle$. Its two qubits are independent — each is a sharp $|{+}\\rangle$.',
    formal:
      '$|{+}{+}\\rangle$ has $C = \\tfrac12\\begin{pmatrix}1 & 1\\\\ 1 & 1\\end{pmatrix}$, $\\det C = 0$, rank 1: a product, $|{+}\\rangle \\otimes |{+}\\rangle$. Each qubit’s reduced state is pure ($|{+}\\rangle$), so the reduced Bloch arrows have length 1 (Chapter Q8’s language).',
    caption: '$|{+}{+}\\rangle$: $\\det C = 0$, a product',
    stage: twoQubit({ ket: K('++') }),
    claims: [C.prodDet, C.prodEntry, C.prodIsProduct],
  },
  {
    id: 'f6-product-or-not:b3',
    phase: 'books',
    text:
      'Now $(|00\\rangle + |11\\rangle)/\\sqrt2$. Its table is $\\tfrac1{\\sqrt2}\\begin{pmatrix}1 & 0\\\\ 0 & 1\\end{pmatrix}$, with $\\det C = \\tfrac12 \\ne 0$: entangled. No two single states multiply to it. Each qubit alone looks like a coin — its reduced arrow has shrunk to zero length.',
    formal:
      '$\\Phi^+ = (|00\\rangle + |11\\rangle)/\\sqrt2$ (Q6’s Bell state) has $C = \\tfrac1{\\sqrt2}I$, $\\det C = \\tfrac12$, rank 2: entangled. Its reduced states are maximally mixed ($\\tfrac12 I$), so $|\\mathbf r_A| = |\\mathbf r_B| = 0$ (Chapter Q8). Entanglement is exactly a non-factoring joint state.',
    caption: 'Bell state: $\\det C = \\tfrac12$, entangled; reduced arrows vanish',
    captionFormal: '$\\Phi^+$: $\\mathrm{rank}\\,C = 2$, $|\\mathbf r| = 0$',
    stage: split(mx(coefSrc(Bk('00+11')), { svd: true }), twoQubit({ ket: Bk('00+11') })),
    refs: [nc('§2.2.8, pp. 95–96', 'The Bell state, the standard example of a state that cannot be written as a product (Eq. 2.132, Ex. 2.68).')],
    claims: [C.bellDet, C.bellSchmidt, C.bellEntangled],
  },
  {
    id: 'f6-product-or-not:b4',
    phase: 'clue',
    text: 'The Bell state looks entangled in the $|0\\rangle/|1\\rangle$ basis. Could choosing a different basis for each qubit make it a product?',
    formal: 'Is entanglement a property of the chosen basis, or of the state?',
    stage: mx(coefSrc(Bk('00+11')), { svd: true }),
    reveal: {
      text:
        'No. No choice of single-qubit bases turns the Bell state into a product. The Schmidt rank — the number of terms you truly need — is 2 in every basis. Entanglement belongs to the state, not to how you label it.',
      formal:
        'No: the Schmidt rank $\\mathrm{rank}\\,C$ is invariant under local basis changes $C \\to UCV^\\top$ (both unitary), which cannot change a rank. The Bell state has rank 2 in every local basis — genuinely entangled (N&C §2.5, pp. 109–110).',
      caption: 'Schmidt rank 2 in every local basis',
      stage: mx(coefSrc(Bk('00+11')), { svd: true, basis: [K('+'), K('-')] }),
      claims: [C.bellSchmidt, C.bellSchmidtX],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f6-growth — Inner products factor; the memory wall                                               */
/* ---------------------------------------------------------------------------------------------- */

const growth: Beat[] = [
  {
    id: 'f6-growth:b1',
    phase: 'core',
    text:
      'Overlaps of product states factor too: $\\langle a {\\otimes} b|c {\\otimes} d\\rangle = \\langle a|c\\rangle\\langle b|d\\rangle$. So a product of two unit-length states is itself unit length. The joint [[qc-inner-product|inner product]] is just the two separate overlaps multiplied.',
    formal:
      'On $V \\otimes W$ the [[qc-inner-product|inner product]] is $\\langle a {\\otimes} b|c {\\otimes} d\\rangle = \\langle a|c\\rangle\\langle b|d\\rangle$, extended bilinearly (Axler 9D, p. 376). Hence $\\||a\\rangle \\otimes |b\\rangle\\| = \\||a\\rangle\\|\\,\\||b\\rangle\\|$: a product of [[qc-normalized|normalized]] states is normalized.',
    caption: '$\\langle a{\\otimes}b|c{\\otimes}d\\rangle = \\langle a|c\\rangle\\langle b|d\\rangle$',
    captionFormal: '$\\||a\\rangle \\otimes |b\\rangle\\| = \\||a\\rangle\\|\\,\\||b\\rangle\\|$',
    stage: amp(K('+0')),
    derivation: {
      result: '\\langle a \\otimes b | c \\otimes d\\rangle = \\langle a|c\\rangle\\langle b|d\\rangle',
      ground: [
        { tex: '\\langle a {\\otimes} b|c {\\otimes} d\\rangle = \\sum_{jk}(a_j b_k)^*(c_j d_k)', why: 'Write the joint overlap over the product basis.', view: amp(K('+0')), viewCaption: 'the product state’s amplitudes' },
        { tex: '= \\Big(\\sum_j a_j^* c_j\\Big)\\Big(\\sum_k b_k^* d_k\\Big)', why: 'The double sum splits into two separate sums, one for each factor.' },
        { tex: '\\langle a {\\otimes} b|c {\\otimes} d\\rangle = \\langle a|c\\rangle\\langle b|d\\rangle', why: 'Each sum is one overlap. Setting $c = a$, $d = b$ makes a product of unit states unit length.', view: amp(K('+')), viewCaption: 'the factor $|{+}\\rangle$, unit length' },
      ],
      formal: [
        { tex: '\\langle a {\\otimes} b|c {\\otimes} d\\rangle = \\sum_{jk}(a_j b_k)^*(c_j d_k) = \\Big(\\sum_j a_j^* c_j\\Big)\\Big(\\sum_k b_k^* d_k\\Big)', why: 'The double sum over the product basis factors into two sums.', view: amp(K('+0')) },
        { tex: '\\langle a {\\otimes} b|c {\\otimes} d\\rangle = \\langle a|c\\rangle\\langle b|d\\rangle', why: 'The inner product on $V \\otimes W$ (Axler 9D, p. 376); $c = a$, $d = b$ gives $\\|a \\otimes b\\| = \\|a\\|\\,\\|b\\|$.', view: amp(K('+')) },
      ],
    },
    claims: [C.prodNorm, C.innerFactor],
  },
  {
    id: 'f6-growth:b2',
    phase: 'core',
    text:
      'Because each joint basis state pairs one from each system, the dimensions multiply: $\\dim(V \\otimes W) = \\dim V \\cdot \\dim W$. A basis of the pair is every first basis vector tensored with every second. Two qubits: $2 \\times 2 = 4$ basis states.',
    formal:
      '$\\{e_j \\otimes f_k\\}$ is a basis of $V \\otimes W$, so $\\dim(V \\otimes W) = \\dim V \\cdot \\dim W$ (Axler Eq. 9.72, p. 372; the basis, Eq. 9.74(b), p. 373). For $n$ qubits, $\\dim = 2^n$: the register’s amplitude count.',
    caption: 'two qubits: $2 \\times 2 = 4$ basis states',
    captionFormal: '$\\{e_j \\otimes f_k\\}$, $\\dim = mn$',
    stage: amp(K('00')),
    claims: [C.dimRule, C.basisCount],
  },
  {
    id: 'f6-growth:b3',
    phase: 'books',
    text:
      'A [[qc-register|register]] of $n$ qubits needs $2^n$ amplitudes. That grows fast. At 16 bytes each, 30 qubits need $16 \\times 2^{30}$ bytes: 16 GiB, about 17 billion bytes. And 50 qubits need $16 \\times 2^{50}$ bytes: 16 PiB, more than any computer’s memory. This wall is why quantum systems are hard to simulate.',
    formal:
      'An $n$-qubit [[qc-register|register]] is a unit vector in $\\text{\u2102}^{2^n}$; storing it is $2^n \\times 16$ bytes. $n = 30 \\Rightarrow 16$ GiB (about 17 billion bytes); $n = 50 \\Rightarrow 16$ PiB (Bergou Eq. 1.4, p. 2: one amplitude per label). A general state needs $2 \\cdot 2^n - 2$ real parameters, against $2n$ for a product (engine `paramCount`).',
    caption: '30 qubits: 16 GiB; 50 qubits: 16 PiB (five qubits shown: 32 bars)',
    captionFormal: 'general $2\\cdot2^n - 2$ vs product $2n$ parameters (five qubits shown: 32 bars)',
    stage: amp(K('00000')),
    refs: [
      bergou('Eq. 1.4, p. 2', 'A register of $n$ qubits needs one amplitude per basis label, $2^n$ in all.'),
      { source: 'lecture', where: 'notes p. 22', adds: 'The parameter count $2\\cdot2^n - 2$ for a general state against $2n$ for a product state.' },
    ],
    claims: [C.mem30, C.mem30Bytes, C.mem50, C.params10General, C.params10Product],
  },
  {
    id: 'f6-growth:b4',
    phase: 'clue',
    text: 'At ten qubits, a general state needs about 2000 numbers, a product only 20. Are most states products?',
    formal: 'What fraction of the parameter count of an $n$-qubit state does a product state use?',
    stage: twoQubit({ ket: K('++') }),
    refs: [{ source: 'lecture', where: 'notes p. 22', adds: 'The parameter count $2\\cdot2^n - 2$ for a general state against $2n$ for a product state.' }],
    reveal: {
      text:
        'No — almost none are. A product uses 20 parameters out of 2046: about 1%. Nearly every state of ten qubits is entangled. Product states are a vanishing sliver of the whole space, which is where quantum power lives.',
      formal:
        'A product uses $2n$ real parameters, a general state $2\\cdot2^n - 2$ (engine `paramCount`); the ratio $2n/(2\\cdot2^n - 2) \\to 0$. At $n = 10$: $20/2046 \\approx 1\\%$. Entanglement is generic, not exceptional.',
      caption: '$n = 10$: product 20 of 2046 parameters ($\\approx 1\\%$)',
      stage: twoQubit({ ket: Bk('00+11') }),
      claims: [C.params10Product, C.params10General, C.prodFrac],
    },
  },
]

export const F6_STORY: Record<string, Beat[]> = {
  'f6-pairs': pairs,
  'f6-kron': kronUnit,
  'f6-operator': operatorUnit,
  'f6-product-or-not': productOrNot,
  'f6-growth': growth,
}
