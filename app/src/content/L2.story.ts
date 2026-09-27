/**
 * Lecture 2 scroll story (owner: P). Beats per docs/roles/proposals/P-L2-story.md §1, with the judge's rulings:
 * Q1 the complex-numbers unit uses the Bloch top view (B-POLE) as its complex plane (exact for numbers of size 1);
 * Q2 only Euler's formula is homework (hints only); the p.8 "??" exercises keep their walkthroughs; Q3 the pasted
 * blocks of pp. 8–11 are lecture content. The notes' |up⟩… are written |+z⟩… throughout (Rosetta in l2-inner-product:b5).
 *
 * Rules kept here (as in L1.story.ts):
 * - Stage states carry physics inputs only; the resolver computes every probability. Numbers in the prose come
 *   from L2.values.ts and are backed by keyed claims.
 * - Clue beats are click-to-reveal: `text` is the question, `reveal` the reasoning.
 * - Core text: ≤ 25 words per sentence, symbols defined before use (content/symbols.test.ts).
 * - Lab benches for ±x and +y sources keep `showPrep` off: the prep module is a z magnet (validated).
 */
import type { Beat, BlochState, HilbertPlaneState, LabBench, LabState, Ref, StageKind, TermTarget } from './schema'
import type { Anchor } from './stageVocab'
import { V, claim, close, d, pct } from './L2.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const t = (kind: StageKind, anchor: Anchor): TermTarget => ({ kind, anchor })
const plane = (s: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })
const bloch = (s: Omit<BlochState, 'kind'>): BlochState => ({ kind: 'bloch', ...s })
const lab = (benches: LabState['benches'], extra: Omit<LabState, 'kind' | 'benches'> = {}): LabState => ({ kind: 'lab-r3', benches, ...extra })
const bench = (id: LabBench['id'], source: LabBench['source'], axis: 'x' | 'z'): LabBench => ({ id, source, devices: [{ axis }] })
const sweep = (from: number, to: number) => ({ from, to })
const top = (phiDeg: number | { from: number; to: number }, extra: Omit<BlochState, 'kind' | 'state' | 'shot'> = {}): BlochState =>
  bloch({ state: { thetaDeg: 90, phiDeg }, shot: 'B-POLE', ...extra })

const zBasis = [
  { ket: '+z' as const, role: 'basis' as const },
  { ket: '-z' as const, role: 'basis' as const },
]

const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })
const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })
const axler = (where: string, adds: string): Ref => ({ source: 'axler', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l2-vector-space — Kets add and scale like vectors                                              */
/* ---------------------------------------------------------------------------------------------- */

const vectorSpace: Beat[] = [
  {
    id: 'l2-vector-space:b1',
    phase: 'lecture',
    text: 'A [[hilbert-space|Hilbert space]] carries the geometry of flat 2D and 3D space into any number of dimensions. Quantum states live in one. It is a [[vector-space|vector space]] whose numbers may be complex, with an [[inner-product|inner product]] added (next unit).',
    caption: 'the $\\htmlClass{term-up}{|{+z}\\rangle}$, $\\htmlClass{term-down}{|{-z}\\rangle}$ arrows of Lecture 1: two dimensions hold every spin state',
    stage: plane({ others: zBasis, rightAngle: true }),
    terms: { up: t('hilbert-plane', 'basis-1'), down: t('hilbert-plane', 'basis-2') },
    claims: [claim('l2ZzOrth', 'the two basis arrows are at right angles: ⟨+z|−z⟩ = 0', () => close(V.l2ZzOrth, 0))],
  },
  {
    id: 'l2-vector-space:b2',
    phase: 'lecture',
    text: 'Kets can be added, and $|A\\rangle + |B\\rangle$ is again a [[ket]]. Order and grouping do not matter, and a [[zero-ket|zero ket]] changes nothing when added. Every ket $|A\\rangle$ has an [[additive-inverse|opposite]] $\\htmlClass{term-opp}{-|A\\rangle}$, and the two add to zero.',
    caption: `$|{+z}\\rangle + |{-z}\\rangle$ has length $\\sqrt2$ = ${d(V.l2SumLen)}; shrunk to length 1, it is $\\htmlClass{term-sum}{|{+x}\\rangle}$. Its opposite $-|{+x}\\rangle$ points the other way.`,
    stage: plane({ psi: '+x', others: [...zBasis, { ket: { neg: '+x' }, role: 'ghost', badge: '−|+x⟩' }] }),
    terms: { opp: t('hilbert-plane', 'ghost'), sum: t('hilbert-plane', 'psi') },
    fidelity: ['plane-sign-twice'],
    claims: [
      claim('l2SumLen', '|+z⟩ + |−z⟩ has length √2 = 1.414', () => close(V.l2SumLen, Math.SQRT2)),
      claim('l2SumIsX', 'the rescaled sum of |+z⟩ and |−z⟩ is |+x⟩', () => V.l2SumIsX === 1),
      claim('l2Inverse', 'a ket plus its opposite is the zero ket', () => close(V.l2Inverse, 0)),
    ],
  },
  {
    id: 'l2-vector-space:b3',
    phase: 'lecture',
    text: 'Any ket times any [[scalar|number]] $\\lambda$ is a ket, and scaling spreads over sums: $\\lambda(|A\\rangle + |B\\rangle) = \\lambda|A\\rangle + \\lambda|B\\rangle$. Arrows in 3D allow only real $\\lambda$. For kets, $\\lambda$ may be [[complex-number|complex]].',
    caption: 'a real λ only stretches or {{flip|flips}} an arrow; a complex λ such as $i$ leaves this flat slice',
    stage: plane({ psi: '+x', others: [{ ket: { neg: '+x' }, role: 'ghost', badge: 'λ = −1' }] }),
    terms: { flip: t('hilbert-plane', 'ghost') },
    fidelity: ['plane-real-slice', 'plane-no-complex-scalars'],
    claims: [claim('l2IxUnit', 'i|+x⟩ still has length 1', () => close(V.l2IxUnit, 1))],
  },
  {
    id: 'l2-vector-space:b4',
    phase: 'lecture',
    text: 'Each ket $|A\\rangle$ has a partner, the [[bra]] $\\langle A|$. Bras obey the same seven rules as kets. The bra of $|A\\rangle + |B\\rangle$ is $\\langle A| + \\langle B|$.',
    caption: 'kets and bras come in pairs. Next unit: a ket is a column, its bra a row.',
    stage: plane({ psi: '+x', others: zBasis }),
  },
  {
    id: 'l2-vector-space:b5',
    phase: 'books',
    text: 'Susskind adds a rule the notes leave out: the bra of $\\lambda|A\\rangle$ is $\\lambda^*\\langle A|$. Here $\\lambda^*$, the [[complex-conjugate|complex conjugate]], is $\\lambda$ with the sign of its imaginary part flipped. So the bra of $i|{+z}\\rangle$ is $-i\\langle{+z}|$.',
    caption: 'the bra of $i|{+z}\\rangle$, applied to $|{+z}\\rangle$, gives $-i$',
    stage: plane({ psi: '+z', others: [{ ket: '-z', role: 'basis' }] }),
    refs: [susskind('§1.9.3', 'Two cautions about bras: a ket and its bra are different kinds of object, and a number multiplying a ket turns into its complex conjugate on the bra.')],
    claims: [claim('l2BraConjIm', 'the bra of i|+z⟩ applied to |+z⟩ gives −i', () => close(V.l2BraConjIm, -1))],
  },
  {
    id: 'l2-vector-space:b6',
    phase: 'books',
    text: 'Susskind’s vector spaces include columns of complex numbers and even continuous functions, so “vector” does not mean “arrow”. Townsend writes a state through its two [[amplitude|coefficients]] on $|{+z}\\rangle$ and $|{-z}\\rangle$ (our $\\alpha$, $\\beta$), as one writes a field by its components. The coefficients are coordinates, but the space is not the lab.',
    caption: 'the two {{shadow|shadows}} are coordinates; their squares add to 1 at every angle',
    stage: plane({ psi: { planeDeg: sweep(0, 90) }, shadows: true }),
    terms: { shadow: t('hilbert-plane', 'shadow-1') },
    fidelity: ['plane-shadow-born', 'plane-half-angles'],
    refs: [
      susskind('§1.9.2', 'Column vectors of complex numbers, and continuous functions, obey the same rules, so a vector need not be an arrow.'),
      townsend('§1.3, pp. 10–11 (Fig. 1.7, eq. 1.5)', 'A state written through its components in the $|{\\pm z}\\rangle$ basis, like an electric field written through its $x$ and $y$ components.'),
    ],
    claims: [claim('l2ShadowsSum', 'the squared shadows add to 1 at every angle', () => close(V.l2ShadowsSum, 1))],
  },
  {
    id: 'l2-vector-space:b7',
    phase: 'clue',
    text: 'Is $2|{+z}\\rangle$ a different spin state from $|{+z}\\rangle$? What about $-|{+z}\\rangle$?',
    stage: plane({ psi: '+z' }),
    reveal: {
      text: 'Both are different vectors but the same state. A state is rescaled to length 1, which turns $2|{+z}\\rangle$ back into $|{+z}\\rangle$. And $-|{+z}\\rangle$ gives the same probabilities for every measurement, so the space holds more vectors than there are states.',
      caption: 'one state, {{two|two arrows}}',
      stage: plane({ psi: '+z', others: [{ ket: { neg: '+z' }, role: 'ghost', badge: 'same state' }] }),
      terms: { two: t('hilbert-plane', 'ghost') },
      fidelity: ['plane-sign-twice'],
      claims: [
        claim('l2TwoZ', '2|+z⟩ is the same state as |+z⟩', () => V.l2TwoZ === 1),
        claim('l2MinusZ', '−|+z⟩ is the same state as |+z⟩', () => V.l2MinusZ === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l2-inner-product — Overlap: the inner product gives coordinates                                */
/* ---------------------------------------------------------------------------------------------- */

const at30 = { planeDeg: 30 }

const innerProduct: Beat[] = [
  {
    id: 'l2-inner-product:b1',
    phase: 'lecture',
    text: 'The [[inner-product|inner product]] $\\langle A|B\\rangle$ joins a bra and a ket into one number, which may be complex. It extends the dot product to any dimension. It measures length, angle and overlap.',
    caption: `the {{shadow|shadow}} of ψ on $|{+z}\\rangle$ is $\\langle{+z}|\\psi\\rangle$ = ${d(V.l2Overlap30)}`,
    stage: plane({ psi: at30, basis: 'z', shadows: true }),
    terms: { shadow: t('hilbert-plane', 'shadow-1') },
    claims: [claim('l2Overlap30', 'ψ at 30° has overlap 0.866 with |+z⟩', () => close(V.l2Overlap30, Math.sqrt(3) / 2))],
  },
  {
    id: 'l2-inner-product:b2',
    phase: 'lecture',
    text: 'It is [[linearity|linear]] in the ket: $\\langle C|(|A\\rangle + |B\\rangle) = \\langle C|A\\rangle + \\langle C|B\\rangle$. Swapping bra and ket conjugates it: $\\langle B|A\\rangle = \\langle A|B\\rangle^*$, the [[conjugate-symmetry|conjugate symmetry]]. And $\\langle A|A\\rangle \\ge 0$.',
    caption: `a complex example (not drawable here): for $|\\psi\\rangle = \\tfrac12|{+z}\\rangle + \\tfrac{\\sqrt3}{2}i|{-z}\\rangle$, $\\langle{-z}|\\psi\\rangle = ${d(V.l2SwapA)}i$ but $\\langle\\psi|{-z}\\rangle = -${d(-V.l2SwapB)}i$`,
    stage: plane({ psi: at30, basis: 'z', shadows: true }),
    fidelity: ['plane-real-slice'],
    claims: [
      claim('l2SwapA', '⟨−z|ψ⟩ = 0.866 i for Townsend’s state', () => close(V.l2SwapA, Math.sqrt(3) / 2)),
      claim('l2SwapB', '⟨ψ|−z⟩ = −0.866 i: swapping conjugates', () => close(V.l2SwapB, -Math.sqrt(3) / 2)),
      claim('l2PsiTAlpha', 'the ½ in the example: |⟨+z|ψ⟩| = ½', () => close(V.l2PsiTAlpha, 0.5)),
    ],
  },
  {
    id: 'l2-inner-product:b3',
    phase: 'lecture',
    text: 'Write $|A\\rangle$ as a [[column-vector|column]] of [[component|components]] $(a_1, a_2)$, and $|B\\rangle$ as $(b_1, b_2)$. The bra $\\langle B|$ is the [[row-vector|row]] $(b_1^*, b_2^*)$. Then $\\langle B|A\\rangle = b_1^*a_1 + b_2^*a_2$.',
    caption: `$\\langle{+z}|{+x}\\rangle = 1\\cdot\\tfrac{1}{\\sqrt2} + 0\\cdot\\tfrac{1}{\\sqrt2}$ = ${d(V.l2RowCol)}`,
    stage: plane({ psi: '+x', others: zBasis, shadows: true }),
    claims: [claim('l2RowCol', '⟨+z|+x⟩ = 1/√2 = 0.707', () => close(V.l2RowCol, Math.SQRT1_2))],
  },
  {
    id: 'l2-inner-product:b4',
    phase: 'lecture',
    text: 'A state has unit length, $\\langle\\psi|\\psi\\rangle = 1$. Two states are [[orthogonal]] when $\\htmlClass{term-ra}{\\langle A|B\\rangle = 0}$. That is the new meaning of “at right angles”.',
    caption: '$\\langle{+x}|{+x}\\rangle = 1$ and $\\langle{+x}|{-x}\\rangle = 0$',
    stage: plane({ psi: '+x', others: [{ ket: '-x', role: 'second' }], rightAngle: true }),
    terms: { ra: t('hilbert-plane', 'right-angle') },
    claims: [
      claim('l2UnitX', '⟨+x|+x⟩ = 1', () => close(V.l2UnitX, 1)),
      claim('l2OrthX', '⟨+x|−x⟩ = 0', () => close(V.l2OrthX, 0)),
    ],
  },
  {
    id: 'l2-inner-product:b5',
    phase: 'lecture',
    text: 'The notes’ up, down, right and left are our $|{+z}\\rangle, |{-z}\\rangle, |{+x}\\rangle, |{-x}\\rangle$, with $|{\\pm x}\\rangle = (|{+z}\\rangle \\pm |{-z}\\rangle)/\\sqrt2$ from Lecture 1. Adding and subtracting runs those formulas backwards: $|{\\pm z}\\rangle = (|{+x}\\rangle \\pm |{-x}\\rangle)/\\sqrt2$. Either pair can serve as the [[basis]].',
    caption: '$|{+z}\\rangle$ casts equal shadows, $1/\\sqrt2$, on $|{+x}\\rangle$ and $|{-x}\\rangle$',
    stage: plane({ psi: '+z', basis: 'x', shadows: true, ticks: true }),
    claims: [
      claim('l2ZinX', '|+z⟩ has x coordinates (1/√2, 1/√2)', () => close(V.l2ZinX, Math.SQRT1_2)),
      claim('l2MzInX', '|−z⟩ has x coordinates (1/√2, −1/√2)', () => close(V.l2MzInX, -Math.SQRT1_2)),
    ],
  },
  {
    id: 'l2-inner-product:b6',
    phase: 'lecture',
    text: 'One state, two sets of coordinates: $|\\psi\\rangle = \\alpha|{+z}\\rangle + \\beta|{-z}\\rangle = \\delta|{+x}\\rangle + \\varepsilon|{-x}\\rangle$. Applying $\\langle{+x}|$ and $\\langle{-x}|$ to both sides gives $\\htmlClass{term-dl}{\\delta} = (\\alpha+\\beta)/\\sqrt2$ and $\\htmlClass{term-ep}{\\varepsilon} = (\\alpha-\\beta)/\\sqrt2$. The state stays put; only its numbers change with the basis, a [[change-of-basis|change of basis]].',
    caption: `ψ at 30°: δ = ${d(V.l2Delta30)}, ε = ${d(V.l2Eps30)}, and $\\delta^2 + \\varepsilon^2 = 1$`,
    stage: plane({ psi: at30, basis: 'x', shadows: true }),
    terms: { dl: t('hilbert-plane', 'shadow-1'), ep: t('hilbert-plane', 'shadow-2') },
    claims: [
      claim('l2Delta30', 'δ = (α + β)/√2 = 0.966 for ψ at 30°', () => close(V.l2Delta30, (Math.sqrt(3) / 2 + 0.5) / Math.SQRT2)),
      claim('l2Eps30', 'ε = (α − β)/√2 = 0.259 for ψ at 30°', () => close(V.l2Eps30, (Math.sqrt(3) / 2 - 0.5) / Math.SQRT2)),
      claim('l2DeltaSq', 'δ² + ε² = 1', () => close(V.l2DeltaSq + V.l2EpsSq, 1)),
    ],
  },
  {
    id: 'l2-inner-product:b7',
    phase: 'books',
    text: 'Axler builds the same inner product but makes it linear in the first slot, the bra’s side. The notes, Susskind, Townsend and this app conjugate that slot instead. The two conventions differ by a conjugate, never in size.',
    caption: 'physics: bra of $i|{+z}\\rangle$ on $|{+z}\\rangle$ gives $-i$; Axler’s first-slot rule gives $+i$',
    stage: plane({ psi: '+z', others: [{ ket: '-z', role: 'basis' }] }),
    refs: [
      axler('§6A Def. 6.2, p. 183; margin note, p. 184', 'The full list of rules: positivity, definiteness (length 0 only for the zero vector), linearity in the first slot, and conjugate symmetry. The margin note warns that physicists pick the other slot.'),
      townsend('§2.1, pp. 30–31 (eqs. 2.10–2.11)', 'A bra’s row is the conjugate transpose of the ket’s column.'),
    ],
    claims: [
      claim('l2BraConjIm', 'physics convention: −i', () => close(V.l2BraConjIm, -1)),
      claim('l2AxlerIm', 'Axler’s convention: +i, the same size', () => close(V.l2AxlerIm, 1) && close(Math.abs(V.l2AxlerIm), Math.abs(V.l2BraConjIm))),
    ],
  },
  {
    id: 'l2-inner-product:b8',
    phase: 'clue',
    text: 'In the $x$ basis the probabilities are $|\\delta|^2$ and $|\\varepsilon|^2$. Must they add to 1 for every $\\alpha$ and $\\beta$, complex ones included?',
    stage: plane({ psi: at30, basis: 'z', shadows: true }),
    reveal: {
      text: 'Yes. Expanding $\\tfrac{1}{2}(|\\alpha+\\beta|^2 + |\\alpha-\\beta|^2)$, the cross terms cancel and leave $|\\alpha|^2 + |\\beta|^2 = 1$. A state’s length does not depend on the basis you measure in.',
      caption: `same arrow, frame turned: the {{bars|bars}} still add to 1 (${d(V.l2DeltaSq)} + ${d(V.l2EpsSq)})`,
      stage: plane({ psi: at30, basis: 'x', shadows: true }),
      terms: { bars: t('hilbert-plane', 'bar-1') },
      claims: [
        claim('l2DeltaSq', '|δ|² = 0.933 for ψ at 30°', () => close(V.l2DeltaSq, 0.9330127018922193)),
        claim('l2EpsSq', '|ε|² = 0.067 for ψ at 30°', () => close(V.l2EpsSq, 1 - V.l2DeltaSq)),
        claim('l2PsiTx', 'Townsend’s complex state: squared x coordinates ½ and ½', () => close(V.l2PsiTx, 0.5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l2-complex — Numbers that turn (the Bloch top view is the unit circle; judge Q1)               */
/* ---------------------------------------------------------------------------------------------- */

const complex: Beat[] = [
  {
    id: 'l2-complex:b1',
    phase: 'lecture',
    text: 'Should amplitudes be real or complex? In electromagnetism complex numbers are only a calculating aid, because the fields themselves are real. In quantum mechanics they are built in: even the equation for how a state changes in time contains $i$.',
    caption: 'with real amplitudes, every spin state lies on this one circle',
    stage: plane({ psi: '+x', others: [...zBasis, { ket: '-x', role: 'second' }] }),
    fidelity: ['plane-real-slice'],
  },
  {
    id: 'l2-complex:b2',
    phase: 'lecture',
    text: 'New operations keep forcing new numbers. Subtraction needs negatives, division needs fractions, and the diagonal of a unit square, $\\sqrt2$, is not a fraction. Square roots open a worse gap: $\\sqrt{-1}$ is nowhere on the [[real-number|real]] line.',
    caption: 'seen from above, this {{circle|circle}} is the [[unit-circle|unit circle]] of complex numbers; the dot is the number 1. Unit 5 shows why it is also a circle of spin states.',
    stage: top(0),
    terms: { circle: t('bloch', 'equator') },
    fidelity: ['bloch-equator-unit-circle'],
  },
  {
    id: 'l2-complex:b3',
    phase: 'lecture',
    text: 'On the real line, multiplying by $-1$ is a half turn about zero. The number that makes a half turn when applied twice is a quarter turn, called [[imaginary-unit|$i$]], so $i^2 = -1$. A quarter turn leaves the line, so $i$ lives off it, in the [[complex-plane|complex plane]].',
    caption: 'multiplying by $i$: the {{dot|number 1}} turns a quarter, to $i$',
    stage: top(sweep(0, 90), { trail: true }),
    terms: { dot: t('bloch', 'point') },
    fidelity: ['bloch-equator-unit-circle'],
    claims: [
      claim('l2ISquared', 'i² = −1', () => close(V.l2ISquared, -1)),
      claim('l2TimesITurn', '× i turns 1 by 90°', () => close(V.l2TimesITurn, 90)),
    ],
  },
  {
    id: 'l2-complex:b4',
    phase: 'lecture',
    text: 'A [[complex-number|complex number]] is a point $z = a + ib$, with [[real-part|real part]] $a$ and [[imaginary-part|imaginary part]] $b$, both ordinary numbers. In [[polar-form|polar form]] $z = r(\\cos\\varphi + i\\sin\\varphi)$, where $r = |z| = \\sqrt{a^2+b^2}$ is its [[magnitude|size]]. The angle $\\varphi$ is its [[argument|phase]].',
    caption: `the size-1 number at φ = 45° is $(1+i)/\\sqrt2$; $1+i$ itself has size $\\sqrt2$ = ${d(V.l2Abs1i)}`,
    stage: top(45),
    claims: [
      claim('l2Abs1i', '|1 + i| = √2 = 1.414', () => close(V.l2Abs1i, Math.SQRT2)),
      claim('l2Arg1i', 'arg(1 + i) = 45°', () => close(V.l2Arg1i, 45)),
      claim('l2Abs34', '|3 + 4i| = 5', () => close(V.l2Abs34, 5)),
    ],
  },
  {
    id: 'l2-complex:b5',
    phase: 'lecture',
    text: '[[euler-formula|Euler’s formula]], $\\cos\\varphi + i\\sin\\varphi = e^{i\\varphi}$, shortens the polar form to $z = re^{i\\varphi}$. Proving it, treating $i$ as an unknown whose square is $-1$, is homework. As $\\varphi$ runs from 0 to 360°, $e^{i\\varphi}$ walks once round the unit circle.',
    caption: '$e^{i\\varphi}$ for φ from 0 to 360°; halfway round, $e^{i\\pi} = -1$',
    stage: top(sweep(0, 360), { trail: true }),
    claims: [
      claim('l2EulerPi', 'e^{iπ} = −1', () => close(V.l2EulerPi, -1)),
      claim('l2EulerHalfPi', 'e^{iπ/2} = i', () => close(V.l2EulerHalfPi, 1)),
    ],
  },
  {
    id: 'l2-complex:b6',
    phase: 'lecture',
    text: 'The [[complex-conjugate|complex conjugate]] $z^* = a - ib$ flips the sign of the imaginary part: a mirror in the real axis, taking $re^{i\\varphi}$ to $re^{-i\\varphi}$. So $z^*z = r^2$ is always real and never negative.',
    caption: '$e^{i60^\\circ}$ and its mirror $e^{-i60^\\circ}$; for $z = 3 + 4i$, $z^*z$ = 25',
    stage: top(sweep(60, -60), { trail: true }),
    claims: [
      claim('l2Conj34', '(3 + 4i)* = 3 − 4i', () => close(V.l2Conj34, -4)),
      claim('l2ZstarZ', 'z*z = 25 for z = 3 + 4i', () => close(V.l2ZstarZ, 25)),
    ],
  },
  {
    id: 'l2-complex:b7',
    phase: 'books',
    text: 'Susskind’s shortcut: add complex numbers in components, but multiply them in polar form, multiplying sizes and adding angles. He calls a number of size 1, $e^{i\\varphi}$, a [[phase-factor|phase factor]]. Multiplying by one only turns.',
    caption: '$2e^{i30^\\circ}\\times 3e^{i60^\\circ} = 6e^{i90^\\circ} = 6i$; on the circle only the turn shows',
    stage: top(sweep(30, 90), { trail: true }),
    refs: [
      susskind('§1.8', 'Complex numbers in components and in polar form, the conjugate, and the phase factor $e^{i\\varphi}$ of size 1.'),
      townsend('§1.4, footnote 8, p. 15', 'The polar form and $z^*z = r^2$, in two lines.'),
    ],
    claims: [claim('l2PolarProduct', '2e^{i30°} × 3e^{i60°} = 6i', () => close(V.l2PolarProduct, 6))],
  },
  {
    id: 'l2-complex:b8',
    phase: 'clue',
    text: 'The notes’ last tip: when stuck, treat $i$ like any unknown and replace $i^2$ by $-1$. Using it, what are $i^3$ and $i^4$?',
    stage: top(90),
    reveal: {
      text: '$i^3 = i^2\\cdot i = -i$ and $i^4 = (i^2)^2 = 1$. Four quarter turns make a full turn: $1 \\to i \\to -1 \\to -i \\to 1$. Unit 5 finds this same cycle among spin states.',
      caption: 'four quarter turns: 1, $i$, −1, $-i$, and back to 1',
      stage: top(sweep(0, 360), { trail: true }),
      claims: [
        claim('l2ICubed', 'i³ = −i', () => close(V.l2ICubed, -1)),
        claim('l2IFourth', 'i⁴ = 1', () => close(V.l2IFourth, 1)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l2-plus-y — Real numbers cannot make +y                                                        */
/* ---------------------------------------------------------------------------------------------- */

const yTests = lab([bench('A', '+y', 'z'), bench('B', '+y', 'x')], { readouts: ['fractions'], shot: 'L-3Q' })

const plusY: Beat[] = [
  {
    id: 'l2-plus-y:b1',
    phase: 'lecture',
    text: 'Lecture 1 built $|{\\pm z}\\rangle$ and $|{\\pm x}\\rangle$ from real amplitudes, but a spin can also be prepared along $\\pm y$. The $y$ axis is at right angles to $z$. So a $+y$ spin measured along $z$ must split 50/50, just as $|{+x}\\rangle$ does.',
    caption: 'a beam prepared along $+y$, by a magnet off this bench, meets SG$_z$: half in {{plus|each spot}}',
    stage: lab([bench('main', '+y', 'z')], { readouts: ['fractions'], shot: 'L-PLATE' }),
    terms: { plus: t('lab-r3', 'spot-plus') },
    fidelity: ['lab-beam-along-y', 'lab-prepared-offstage'],
    claims: [claim('l2YOnZ', 'a +y beam splits 50/50 along z', () => close(V.l2YOnZ, 0.5))],
  },
  {
    id: 'l2-plus-y:b2',
    phase: 'lecture',
    text: 'So try the most general equal-weight state, $|{+y}\\rangle = (|{+z}\\rangle + c\\,|{-z}\\rangle)/\\sqrt2$, with an unknown number $c$. The 50/50 split along $z$ needs $|c/\\sqrt2|^2 = \\tfrac12$. So $|c|^2 = 1$.',
    caption: 'shown for $c = 1$: when $|c| = 1$, both $z$ {{shadows|shadows}} have size $1/\\sqrt2$',
    stage: plane({ psi: '+x', basis: 'z', shadows: true, ticks: true }),
    terms: { shadows: t('hilbert-plane', 'shadow-1') },
    claims: [claim('l2CUnit5050', 'every c of size 1 gives 50/50 along z', () => close(V.l2CUnit5050, 0.5))],
  },
  {
    id: 'l2-plus-y:b3',
    phase: 'lecture',
    text: 'If $c$ were real, $|c| = 1$ would leave only $c = +1$ or $c = -1$. But $c = +1$ gives $|{+x}\\rangle$ and $c = -1$ gives $|{-x}\\rangle$. Those are right and left, not the missing $y$ direction.',
    caption: 'a real $c$ reaches only $\\htmlClass{term-px}{|{+x}\\rangle}$ or $|{-x}\\rangle$',
    stage: plane({ psi: '+x', others: [{ ket: '-x', role: 'second' }, ...zBasis], rightAngle: true }),
    terms: { px: t('hilbert-plane', 'psi') },
    fidelity: ['plane-real-slice'],
    claims: [claim('l2RealCIsX', 'c = ±1 gives |±x⟩', () => V.l2RealCIsX === 1)],
  },
  {
    id: 'l2-plus-y:b4',
    phase: 'lecture',
    text: 'A $+y$ spin must also split 50/50 along $x$. In the $x$ basis the trial state is $\\tfrac{1+c}{2}|{+x}\\rangle + \\tfrac{1-c}{2}|{-x}\\rangle$. Equal odds need $|1+c|^2 = |1-c|^2$, and both real choices fail completely.',
    caption: `the real candidates along $x$: $c = 1$ puts ${pct(V.l2RealFailPlus)} in +, $c = -1$ puts ${pct(V.l2RealFailMinus)}`,
    stage: lab([bench('A', '+x', 'x'), bench('B', '-x', 'x')], { readouts: ['fractions'], shot: 'L-3Q' }),
    fidelity: ['lab-prepared-offstage'],
    claims: [
      claim('l2YOnZ', 'the target: 50/50', () => close(V.l2YOnZ, 0.5)),
      claim('l2XCoeffRe', 'x coordinates of the trial state are (1 ± c)/2: at c = e^{iπ/4} the first has real part 0.854', () => close(V.l2XCoeffRe, (1 + Math.SQRT1_2) / 2)),
      claim('l2RealFailPlus', 'c = 1 (|+x⟩): all + along x', () => close(V.l2RealFailPlus, 1)),
      claim('l2RealFailMinus', 'c = −1 (|−x⟩): no + along x', () => close(V.l2RealFailMinus, 0)),
    ],
  },
  {
    id: 'l2-plus-y:b5',
    phase: 'lecture',
    text: 'Write each size squared as a number times its conjugate: $(1+c)(1+c^*) = (1-c)(1-c^*)$. This leaves $c + c^* = 0$, so $c^* = -c$. With $cc^* = 1$ that gives $-c^2 = 1$, so $c^2 = -1$ and $c = \\pm i$.',
    caption: `slide $c$ round the unit circle: the $x$ split falls from ${pct(V.l2XSplit0)} to ${pct(V.l2XSplit90)} at $c = i$`,
    stage: top(sweep(0, 90), { measure: 'x', trail: true }),
    fidelity: ['bloch-equator-unit-circle'],
    claims: [
      claim('l2XSplit0', 'at c = 1 the x split is 100/0', () => close(V.l2XSplit0, 1)),
      claim('l2XSplit90', 'at c = i the x split is 50/50', () => close(V.l2XSplit90, 0.5)),
      claim('l2IConjSum', 'i + i* = 0', () => close(V.l2IConjSum, 0)),
      claim('l2IConjProd', 'i·i* = 1', () => close(V.l2IConjProd, 1)),
    ],
  },
  {
    id: 'l2-plus-y:b6',
    phase: 'lecture',
    text: 'Taking $c = +i$ gives $|{+y}\\rangle = (|{+z}\\rangle + i|{-z}\\rangle)/\\sqrt2$, and $c = -i$ gives its orthogonal partner $|{-y}\\rangle = (|{+z}\\rangle - i|{-z}\\rangle)/\\sqrt2$. No real $c$ passes both tests. Spin states need complex [[amplitude|amplitudes]].',
    caption: '$|{+y}\\rangle$: 50/50 along $z$ and 50/50 along $x$',
    stage: yTests,
    fidelity: ['lab-prepared-offstage'],
    claims: [
      claim('l2YOnZ', '+y: 50/50 along z', () => close(V.l2YOnZ, 0.5)),
      claim('l2YOnX', '+y: 50/50 along x', () => close(V.l2YOnX, 0.5)),
      claim('l2YOrth', '⟨+y|−y⟩ = 0', () => close(V.l2YOrth, 0)),
    ],
  },
  {
    id: 'l2-plus-y:b7',
    phase: 'books',
    text: 'Townsend reaches the same answer from his Experiment 5, which ends with an SG$_y$ magnet. He also explains the sign: with [[right-handed|right-handed axes]], $c = +i$ is spin up along $+y$. In a mirror-image, left-handed frame, the two answers swap.',
    caption: 'right-handed axes: $+i$ sits a quarter turn counterclockwise from $+x$, seen from $+z$',
    stage: bloch({ state: '+y', shot: 'B-POLE' }),
    refs: [
      townsend('§1.5, pp. 18–20 (eqs. 1.23–1.31, Fig. 1.10)', 'The probability that a $+x$ spin passes an SG$_y$ magnet depends only on the difference of two [[relative-phase|relative phases]] (eq. 1.28). Requiring 50/50 fixes that difference at 90°; Fig. 1.10 shows why right-handed axes pick $+i$.'),
      susskind('§2.3–2.4 (Ex. 2.2, 2.3)', 'His “in” and “out” states are our $|{\\pm y}\\rangle$. Exercise 2.3 shows that the product of one coefficient’s conjugate with the other must be [[pure-imaginary|purely imaginary]].'),
    ],
    claims: [
      claim('l2YBloch', '|+y⟩ sits at (0, 1, 0)', () => close(V.l2YBloch, 1)),
      claim('l2T128', 'Townsend eq. 1.28 at a 90° phase difference gives 50/50', () => close(V.l2T128, 0.5) && close(V.l2T128, V.l2XOnY)),
    ],
  },
  {
    id: 'l2-plus-y:b8',
    phase: 'clue',
    text: 'Someone finds the length of $|{+y}\\rangle$ using the row $(1, i)/\\sqrt2$, and gets $(1 + i^2)/2 = 0$. Is $|{+y}\\rangle$ the zero vector?',
    stage: yTests,
    reveal: {
      text: 'No: a bra conjugates the entries, so the row is $(1, -i)/\\sqrt2$ and $\\langle{+y}|{+y}\\rangle = (1 - i^2)/2 = 1$. Without the conjugate, a nonzero complex vector can seem to have no length. Probabilities would then stop adding to 1.',
      caption: 'conjugate the bra: length 1, not 0',
      claims: [
        claim('l2YNorm', '⟨+y|+y⟩ = 1', () => close(V.l2YNorm, 1)),
        claim('l2YBilinear', 'the unconjugated row gives 0', () => close(V.l2YBilinear, 0)),
      ],
    },
    refs: [townsend('§2.1, pp. 31–32 (eqs. 2.17–2.18)', 'The bra of $|{+y}\\rangle$ carries $-i$; forgetting it gives an inner product of zero for a state of length 1.')],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l2-three-bases — Three bases, each blind to the others                                         */
/* ---------------------------------------------------------------------------------------------- */

const threeBases: Beat[] = [
  {
    id: 'l2-three-bases:b1',
    phase: 'lecture',
    text: 'Here the complex plane pays off. As $c$ steps $1 \\to i \\to -1 \\to -i$, the state $(|{+z}\\rangle + c|{-z}\\rangle)/\\sqrt2$ steps $|{+x}\\rangle \\to |{+y}\\rangle \\to |{-x}\\rangle \\to |{-y}\\rangle$. Each quarter turn of $c$ is a quarter turn around the lab’s $x$–$y$ plane.',
    caption: '$c = 1, i, -1, -i$ ↔ {{x|$+x$}}, {{y|$+y$}}, $-x$, $-y$',
    stage: top(sweep(0, 270), { trail: true }),
    terms: { x: t('bloch', 'x'), y: t('bloch', 'y') },
    claims: [claim('l2Cycle', 'c = 1, i, −1, −i gives |+x⟩, |+y⟩, |−x⟩, |−y⟩', () => V.l2Cycle === 1)],
  },
  {
    id: 'l2-three-bases:b2',
    phase: 'lecture',
    text: 'That gives three [[basis|bases]], each a pair of orthogonal states. {{z|$z$}} is $|{\\pm z}\\rangle$, {{x|$x$}} is $|{\\pm x}\\rangle = (|{+z}\\rangle \\pm |{-z}\\rangle)/\\sqrt2$, and {{y|$y$}} is $|{\\pm y}\\rangle = (|{+z}\\rangle \\pm i|{-z}\\rangle)/\\sqrt2$.',
    caption: 'tilt the view: the $z$ pair sits at the poles, the $x$ and $y$ pairs on the equator',
    stage: bloch({ state: { thetaDeg: sweep(90, 0), phiDeg: 270 }, trail: true, shot: 'B-STD' }),
    terms: { z: t('bloch', 'z'), x: t('bloch', 'x'), y: t('bloch', 'y') },
    fidelity: ['bloch-double-angle'],
    claims: [claim('l2PairsOrth', 'each pair is orthogonal', () => close(V.l2PairsOrth, 0))],
  },
  {
    id: 'l2-three-bases:b3',
    phase: 'lecture',
    text: 'Prepare any state of one basis and measure in another: the two outcomes are always 50/50. Such bases are [[mutually-unbiased|mutually unbiased]]. Knowing the answer along one axis tells you nothing about the other two.',
    caption: `$|{+x}\\rangle$ measured along {{n|$y$}}: ${pct(V.l2XOnY)} each`,
    stage: bloch({ state: '+x', measure: 'y', shot: 'B-STD' }),
    terms: { n: t('bloch', 'axis-n') },
    fidelity: ['bloch-born'],
    claims: [
      claim('l2Mub', 'all 24 ordered cross-basis probabilities are 0.5', () => close(V.l2Mub, 0.5) && V.l2MubAll === 1),
      claim('l2XOnY', 'P(+y | +x) = 0.5', () => close(V.l2XOnY, 0.5)),
    ],
  },
  {
    id: 'l2-three-bases:b4',
    phase: 'lecture',
    text: 'The space is only two-dimensional, yet it holds three mutually unbiased bases. So a spin state is a unit vector $|\\psi\\rangle = \\alpha|{+z}\\rangle + \\beta|{-z}\\rangle$, with complex $\\alpha, \\beta$ and $\\langle\\psi|\\psi\\rangle = 1$. In one phrase: a vector in a complex Hilbert space.',
    caption: 'a general {{pt|state}}: complex α, β with $|\\alpha|^2 + |\\beta|^2 = 1$',
    stage: bloch({ state: { thetaDeg: 60, phiDeg: 45 }, shot: 'B-STD' }),
    terms: { pt: t('bloch', 'point') },
    claims: [claim('l2GeneralUnit', 'the state at θ = 60°, φ = 45° has length 1', () => close(V.l2GeneralUnit, 1))],
  },
  {
    id: 'l2-three-bases:b5',
    phase: 'lecture',
    text: 'The notes close with a picture: a sphere with the six states at its six poles, $\\pm z$, $\\pm x$ and $\\pm y$. It is the [[bloch-sphere|Bloch sphere]]. It returns in Lecture 6, once measurement has been made precise.',
    caption: 'preview: six states, six directions. Opposite points are orthogonal states.',
    stage: bloch({ state: '+z', shot: 'B-STD' }),
    fidelity: ['bloch-double-angle', 'bloch-not-lab-space'],
    claims: [claim('l2SixPoints', 'the six named states sit on the ± unit axes', () => V.l2SixPoints === 1)],
  },
  {
    id: 'l2-three-bases:b6',
    phase: 'books',
    text: 'Susskind counts. Two complex numbers hold four real ones; normalizing removes one, and the unobservable [[global-phase|overall phase]] removes another. Two remain, exactly the two angles that fix a direction in space.',
    caption: 'two angles, polar and azimuth, pin one {{pt|point}} per state',
    stage: bloch({ state: { thetaDeg: sweep(0, 120), phiDeg: sweep(0, 60) }, trail: true, shot: 'B-STD' }),
    terms: { pt: t('bloch', 'point') },
    refs: [
      susskind('§2.5, §2.7', 'Counting parameters: of the four real numbers in two complex coefficients, normalization and the unobservable overall phase remove one each.'),
      townsend('§1.3, p. 11', 'Two basis kets span the whole space of spin states.'),
    ],
    claims: [
      claim('l2TwoParamsTheta', 'the two angles give back the state: θ = 120°', () => close(V.l2TwoParamsTheta, 120)),
      claim('l2TwoParamsPhi', 'the two angles give back the state: φ = 60°', () => close(V.l2TwoParamsPhi, 60)),
    ],
  },
  {
    id: 'l2-three-bases:b7',
    phase: 'clue',
    text: 'Could a fourth basis be unbiased with respect to $z$, $x$ and $y$ all at once?',
    stage: bloch({ state: '+y', shot: 'B-STD' }),
    beyondLecture: true,
    reveal: {
      text: 'No. For [[unit-vector|unit vectors]] $\\hat n$ and $\\hat m$ along two axes, Lecture 1’s [[probability]] rule $P(+) = (1 + \\hat n\\cdot\\hat m)/2$ gives 50/50 exactly at right angles. No direction is at right angles to $x$, $y$ and $z$ at once, so a spin ½ has at most three.',
      caption: 'every point on the {{eq|equator}} is 50/50 along $z$',
      stage: bloch({ state: { thetaDeg: 90, phiDeg: sweep(0, 360) }, measure: 'z', trail: true, shot: 'B-STD' }),
      terms: { eq: t('bloch', 'equator') },
      claims: [claim('l2Perp5050', 'every equator direction is 50/50 along z', () => close(V.l2Perp5050, 0.5))],
    },
  },
]

export const L2_STORY: Record<string, Beat[]> = {
  'l2-vector-space': vectorSpace,
  'l2-inner-product': innerProduct,
  'l2-complex': complex,
  'l2-plus-y': plusY,
  'l2-three-bases': threeBases,
}
