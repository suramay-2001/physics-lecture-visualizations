/**
 * Chapter F1 scroll story, both tracks over one stage (plan: docs/roles/proposals/P-F1-story.md §1–§2; rulings
 * docs/roles/decisions/qc709-pilots.md and qc709-nc.md, whose Nielsen & Chuang addendum is folded in).
 *
 * Rules kept here:
 * - An F chapter has no lecture notes: its own line is phase 'core' ("The foundation"), then 'books', then the clue.
 * - `text` is the Ground-up track (9th-grade start, ≤ 25 words per sentence), `formal` the Formal track (≤ 40).
 * - Stage states carry inputs only (numbers as parts or size and angle, phases in degrees, a named direction); the
 *   `complex-plane` and `amplitudes` resolvers compute every mark and readout with the engine.
 * - Every number in the prose comes from F1.values.ts through a keyed claim of its beat or unit.
 * - Citations in the text name the page (Axler printed = PDF − 14; N&C printed = PDF − 28); item numbers live in
 *   `refs`, because the ledger would read "4.12" as a number.
 * - Ruling 1: Euler's power-series proof is 448's homework (L2 p. 7); no beat or derivation here walks through it.
 * - f1-phase follows the addendum's order (§3.5), renumbered: old b1 b2 b4 b5 b3 b6 b7 → new b1 … b7.
 */
import type { AmplitudesState, Beat, ComplexPlaneState, Ref } from '../schema'
import { V, claim, close, d, limitMatches, pct, realLimitMatches } from './F1.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const cp = (s: Omit<ComplexPlaneState, 'kind' | 'shot'>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...s })
const amp = (s: Omit<AmplitudesState, 'kind' | 'shot'>): AmplitudesState => ({ kind: 'amplitudes', shot: 'A-BARS', ...s })
const sweep = (from: number, to: number) => ({ from, to })

export const axler = (where: string, adds: string): Ref => ({ source: 'axler', where, adds })
export const bergou = (where: string, adds: string): Ref => ({ source: 'bergou', where, adds })
export const nc = (where: string, adds: string): Ref => ({ source: 'nc', where, adds })
export const notes = (where: string, adds: string): Ref => ({ source: 'lecture', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* Claims shared by several beats                                                                  */
/* ---------------------------------------------------------------------------------------------- */

export const C = {
  sqrt2: claim('f1Sqrt2', '√2 = 1.414', () => close(V.f1Sqrt2, Math.SQRT2)),
  iSquared: claim('f1ISquared', 'i² = −1', () => close(V.f1ISquared, -1)),
  negISquared: claim('f1NegISquared', '(−i)² = −1', () => close(V.f1NegISquared, -1)),
  abs34: claim('f1Abs34', '|3 + 4i| = 5', () => close(V.f1Abs34, 5)),
  zzStar: claim('f1ZZstar', '(3 + 4i)(3 − 4i) = 25, with no imaginary part', () => close(V.f1ZZstar, 25) && close(V.f1ZZstarIm, 0)),
  abs21: claim('f1Abs21', '|2 + i| = 2.236', () => close(V.f1Abs21, Math.sqrt(5))),
  abs13: claim('f1Abs13', '|1 + 3i| = 3.162', () => close(V.f1Abs13, Math.sqrt(10))),
  absProd: claim('f1AbsProd', '|(2 + i)(1 + 3i)| = |−1 + 7i| = √50 = 7.071', () => close(V.f1AbsProd, Math.sqrt(50))),
  arg21: claim('f1Arg21Deg', 'arg(2 + i) = 26.565°', () => close(V.f1Arg21Deg, (Math.atan2(1, 2) * 180) / Math.PI)),
  arg13: claim('f1Arg13Deg', 'arg(1 + 3i) = 71.565°', () => close(V.f1Arg13Deg, (Math.atan2(3, 1) * 180) / Math.PI)),
  argProd: claim('f1ArgProdDeg', 'arg((2 + i)(1 + 3i)) = 98.130° = 26.565° + 71.565°', () => close(V.f1ArgProdDeg, V.f1Arg21Deg + V.f1Arg13Deg)),
  abs11: claim('f1Abs11', '|1 + i| = √2 = 1.414', () => close(V.f1Abs11, Math.SQRT2)),
  pi: claim('f1Pi', 'half a turn is π = 3.14159 radians', () => close(V.f1Pi, Math.PI)),
  expiPi: claim('f1ExpiPiRe', 'e^{iπ} = −1, and (1 + iπ/n)ⁿ is within 10⁻⁴ of it at n = 10⁵', () => close(V.f1ExpiPiRe, -1) && limitMatches()),
  e: claim('f1E', 'e = 2.71828', () => close(V.f1E, Math.E, 1e-15)),
  euler64: claim('f1Euler64Abs', '|(1 + iπ/64)⁶⁴| = 1.080', () => close(V.f1Euler64Abs, (1 + Math.PI ** 2 / 64 ** 2) ** 32)),
  euler1000: claim('f1Euler1000Abs', '|(1 + iπ/1000)¹⁰⁰⁰| = 1.005', () => close(V.f1Euler1000Abs, (1 + Math.PI ** 2 / 1e6) ** 500)),
  relProb: claim('f1RelProb', 'the amplitudes 1/√2 and e^{iφ}/√2 give chances ½ and ½ for every φ', () => close(V.f1RelProb, 0.5)),
  globalAbs: claim('f1GlobalAbs', 'turning both arrows by γ keeps |½e^{iγ} + ½e^{i(γ+π/3)}| = 0.866', () => close(V.f1GlobalAbs, Math.sqrt(3) / 2)),
  interf0: claim('f1Interf0', '|1 + e^{i0}|² = 4', () => close(V.f1Interf0, 4)),
  interf180: claim('f1Interf180', '|1 + e^{iπ}|² = 0', () => close(V.f1Interf180, 0)),
}

/* ---------------------------------------------------------------------------------------------- */
/* f1-number-line — The gap that x² = −1 leaves                                                    */
/* ---------------------------------------------------------------------------------------------- */

const numberLine: Beat[] = [
  {
    id: 'f1-number-line:b1',
    phase: 'core',
    text: 'Start with the counting numbers 1, 2, 3 and so on. Let $x$ stand for an unknown number. The equation $x + 5 = 3$ has no counting-number answer, so negative numbers were invented: $x = -2$. On the [[qc-number-line|number line]] they sit to the left of zero. The equation $2x = 3$ needs fractions: $x = 3/2$.',
    formal:
      'Each extension ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ (the counting numbers, the integers, the fractions, the [[qc-number-line|real line]]) makes one more operation always possible: subtraction, then division by a nonzero number, then limits of Cauchy sequences.',
    caption: 'the number line: −2 sits two steps left of zero',
    captionFormal: 'the root of $x + 5 = 3$ lies in ℤ',
    stage: cp({ line: true, z: { re: -2, im: 0 } }),
    claims: [
      claim('f1NegRoot', '−2 + 5 = 3', () => close(V.f1NegRoot, 3)),
      claim('f1Half3', '2x = 3 needs x = 3/2 = 1.5', () => close(V.f1Half3, 1.5)),
    ],
  },
  {
    id: 'f1-number-line:b2',
    phase: 'core',
    text: `Squares open the next gap; $x^2$ means $x$ times $x$. The equation $x^2 = 2$ needs $\\sqrt2 \\approx ${d(V.f1Sqrt2)}$, a [[qc-real-number|real number]] that no fraction equals. Worse, a square is never negative: $3^2 = 9$ and $(-3)^2 = 9$. So $x^2 = -1$ has no answer on the line.`,
    formal:
      'For real $x$, $x^2 \\ge 0$, with equality only at 0, since $(-x)^2 = x^2$. So $x^2 = 2$ forces the step to ℝ, while $x^2 + 1 = 0$ has no [[qc-real-number|real]] root and needs a new number.',
    caption: '3 and −3 both square to 9: no point on the line squares to −1',
    captionFormal: '$x \\mapsto x^2$ maps ℝ onto $[0, \\infty)$',
    stage: cp({ line: true, z: { re: 3, im: 0 }, w: { re: -3, im: 0 } }),
    claims: [C.sqrt2, claim('f1SqNeg3', '(−3)² = 9', () => close(V.f1SqNeg3, 9))],
  },
  {
    id: 'f1-number-line:b3',
    phase: 'core',
    text: 'Multiplying by $-1$ moves 2 to $-2$, the mirror spot across zero. Picture it as swinging the arrow from zero to 2 through half a circle. Two half turns make a full turn, so $(-1)(-1) = 1$.',
    formal: 'On the line, multiplication by $-1$ is the reflection $x \\mapsto -x$. Seen inside a plane, it is the rotation by 180° about 0, whose square is the identity.',
    caption: '×(−1): the arrow to 2 swings half a turn to −2',
    captionFormal: 'multiplication by −1 = rotation by 180° about 0',
    stage: cp({ z: { r: 2, phiDeg: sweep(0, 180) }, trail: true }),
    claims: [
      claim('f1HalfTurn', '(−1) · 2 = −2', () => close(V.f1HalfTurn, -2)),
      claim('f1TwoHalf', '(−1)(−1) = 1', () => close(V.f1TwoHalf, 1)),
    ],
  },
  {
    id: 'f1-number-line:b4',
    phase: 'core',
    text: 'Look for a number whose square is $-1$, and call it [[qc-imaginary-unit|$i$]]. Multiplying by $i$ twice must equal one half turn. So multiplying by $i$ is a quarter turn, and $i$ sits one step straight up from zero, off the line. Spin Lab tells the same story: <<qc-l2-complex|numbers that turn>>.',
    formal:
      'Adjoin a number [[qc-imaginary-unit|$i$]] with $i^2 = -1$ (Axler, p. 2). The numbers $a + bi$ with real $a$ and $b$ form ℂ, identified with the plane by $a + bi \\mapsto (a, b)$: the [[qc-complex-plane|complex plane]]. Multiplication by $i$ is the rotation by 90°, whose square is the rotation by 180°, that is $-1$.',
    caption: '×$i$ turns 1 a quarter turn to $i$; ×$i$ again turns $i$ to −1',
    captionFormal: 'multiplication by $i$ = rotation by 90°',
    stage: cp({ z: { r: 1, phiDeg: sweep(0, 180) }, trail: true, show: ['arc'] }),
    introduces: ['qc-complex-plane'],
    claims: [claim('f1ITimesOne', 'i · 1 = i', () => close(V.f1ITimesOne, 1)), C.iSquared],
  },
  {
    id: 'f1-number-line:b5',
    phase: 'core',
    text: 'The opposite quarter turn, $-i$, also squares to $-1$, because $(-i)(-i) = i^2$. So $x^2 = -1$ has exactly two answers, $i$ and $-i$. In the same way, $x^2 = -9$ has the answers $3i$ and $-3i$.',
    formal:
      'Since $x^2 + 1 = (x - i)(x + i)$, the roots are $\\pm i$; likewise $x^2 + 9 = 0$ has the roots $\\pm 3i$. The principal square root halves the angle: $\\sqrt{-9} = 3i$.',
    caption: '$i$ and $-i$: the two square roots of −1',
    captionFormal: 'the zeros of $x^2 + 1$ in ℂ',
    stage: cp({ z: { re: 0, im: 1 }, w: { re: 0, im: -1 } }),
    claims: [C.negISquared, claim('f1SqrtM9', '√−9 = 3i', () => close(V.f1SqrtM9, 3))],
  },
  {
    id: 'f1-number-line:b6',
    phase: 'books',
    text: 'Why should a physicist care? Bergou describes a [[qubit|qubit]], the quantum version of a bit, by two numbers $\\alpha$ and $\\beta$ (alpha and beta). They belong to its two basic states, written $|0\\rangle$ and $|1\\rangle$ like the bit values 0 and 1. They are allowed to be complex. The qubit state pointing along $y$ even needs $i$ itself: its second number is $i/\\sqrt2$.',
    formal:
      'Bergou’s [[qubit|qubit]] is $\\alpha|0\\rangle + \\beta|1\\rangle$ with basis states $|0\\rangle$, $|1\\rangle$ and complex $\\alpha$, $\\beta$ (§1.1, eq. 1.1, p. 1). Real amplitudes cannot describe a spin along $y$: $|{+y}\\rangle$ has $\\beta = i/\\sqrt2$, as <<qc-l2-plus-y|real numbers cannot make +y>> shows.',
    caption: `a qubit’s two numbers: ${d(V.f1YAmp)} and ${d(V.f1YAmp)}$i$`,
    captionFormal: `$|{+y}\\rangle$: amplitudes $(${d(V.f1YAmp)},\\ ${d(V.f1YAmp)}i)$`,
    stage: amp({ state: { dir: '+y' }, labels: 'bits', dials: true }),
    fidelity: ['qc-amp-zero-is-up'],
    refs: [
      bergou('§1.1, p. 1 (eq. 1.1)', 'A qubit is described by two complex amplitudes, one for each of its two basis states.'),
      nc('§1.2, p. 13 (eq. 1.1)', 'The same two-amplitude qubit, with the chances of the two outcomes as the squared sizes of the amplitudes.'),
    ],
    claims: [claim('f1YAmp', 'the second amplitude of |+y⟩ is 0.707i (and the first is 0.707)', () => close(V.f1YAmp, Math.SQRT1_2))],
  },
  {
    id: 'f1-number-line:b7',
    phase: 'clue',
    text: 'We invented $i$ to take a square root of $-1$. Will we need yet another new number to take a square root of $i$?',
    formal: 'Is ℂ closed under square roots, or must $\\sqrt i$ be adjoined as well?',
    stage: cp({ z: { re: 0, im: 1 } }),
    reveal: {
      text: `No new number is needed. Try $(1 + i)/\\sqrt2$, about $${d(V.f1SqrtIRe)} + ${d(V.f1SqrtIIm)}i$. Multiply out: $(1 + i)^2 = 1 + 2i + i^2 = 2i$, and dividing by $(\\sqrt2)^2 = 2$ leaves exactly $i$.`,
      formal:
        'ℂ is [[qc-algebraically-closed|algebraically closed]]: a polynomial that is not constant and whose coefficients lie in ℂ always has a root in ℂ (Axler, p. 125). Here $x^2 - i = 0$ has the roots $\\pm(1 + i)/\\sqrt2$, and by that theorem the ladder of extensions stops at ℂ. Chapter Q4’s phase gates multiply the $|1\\rangle$ amplitude by a number of size 1: $Z$ by $-1$, $S$ by $i$, and $T$ (N&C: π/8 gate) by $(1 + i)/\\sqrt2$. So $T^2 = S$ and $S^2 = Z$ (N&C, front matter, p. xxx).',
      caption: '$(1 + i)/\\sqrt2$ squared lands on $i$',
      captionFormal: '$\\pm(1 + i)/\\sqrt2$ solve $x^2 = i$',
      stage: cp({ powers: { of: { r: 1, phiDeg: 45 }, upTo: 2 } }),
      claims: [
        claim('f1SqrtIRe', '√i = 0.707 + 0.707i (real part)', () => close(V.f1SqrtIRe, Math.SQRT1_2)),
        claim('f1SqrtIIm', '√i = 0.707 + 0.707i (imaginary part)', () => close(V.f1SqrtIIm, Math.SQRT1_2)),
        claim('f1SqrtISq', '(√i)² = i', () => close(V.f1SqrtISq, 1)),
        claim('f1TSqS', 'T² = S (qc/gates.ts)', () => V.f1TSqS === 1),
        claim('f1SSqZ', 'S² = Z (qc/gates.ts)', () => V.f1SSqZ === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f1-plane — Numbers as points and arrows                                                         */
/* ---------------------------------------------------------------------------------------------- */

const plane: Beat[] = [
  {
    id: 'f1-plane:b1',
    phase: 'core',
    text: 'Every [[qc-complex-number|complex number]] can be written $z = a + bi$, where $a$ and $b$ are ordinary numbers. Draw it as the point $a$ steps across and $b$ steps up. The across part $a$ is the [[qc-real-part|real part]], written $\\operatorname{Re} z$; the up part $b$ is the [[qc-imaginary-part|imaginary part]], $\\operatorname{Im} z$.',
    formal:
      'Write a [[qc-complex-number|complex number]] as $z = a + bi$, with [[qc-real-part|real part]] $\\operatorname{Re} z = a$ and [[qc-imaginary-part|imaginary part]] $\\operatorname{Im} z = b$ (Axler, p. 120). The map $z \\mapsto (\\operatorname{Re} z, \\operatorname{Im} z)$ identifies ℂ with the plane ℝ², whose horizontal axis is ℝ.',
    caption: '$z = 3 + 4i$: 3 across, 4 up',
    captionFormal: '$\\operatorname{Re} z = 3$, $\\operatorname{Im} z = 4$',
    stage: cp({ z: { re: 3, im: 4 }, show: ['parts'] }),
    claims: [
      claim('f1Re34', 'Re(3 + 4i) = 3', () => close(V.f1Re34, 3)),
      claim('f1Im34', 'Im(3 + 4i) = 4', () => close(V.f1Im34, 4)),
    ],
  },
  {
    id: 'f1-plane:b2',
    phase: 'core',
    text: 'Add complex numbers part by part: $(3 + 4i) + (1 - 2i) = 4 + 2i$. In the picture, put the second arrow’s tail at the first arrow’s tip. The sum is the arrow from zero to the new tip.',
    formal:
      'Addition is componentwise, $(a + bi) + (c + di) = (a + c) + (b + d)i$ (Axler, p. 2): vector addition in ℝ², the parallelogram rule. It is commutative and associative, with identity 0 and inverse $-z$.',
    caption: '$(3 + 4i) + (1 - 2i) = 4 + 2i$, tip to tail',
    stage: cp({ z: { re: 3, im: 4 }, w: { re: 1, im: -2 }, show: ['sum'] }),
    claims: [
      claim('f1SumRe', '(3 + 4i) + (1 − 2i) has real part 4', () => close(V.f1SumRe, 4)),
      claim('f1SumIm', '(3 + 4i) + (1 − 2i) has imaginary part 2', () => close(V.f1SumIm, 2)),
    ],
  },
  {
    id: 'f1-plane:b3',
    phase: 'core',
    text: 'The [[qc-modulus|size]] of $z$, written $|z|$, is its distance from zero. The two parts are the legs of a right triangle, so Pythagoras gives $|z| = \\sqrt{a^2 + b^2}$. For $3 + 4i$ that is $\\sqrt{9 + 16} = 5$.',
    formal:
      'The [[qc-modulus|modulus]] $|z| = \\sqrt{(\\operatorname{Re} z)^2 + (\\operatorname{Im} z)^2}$ (Axler, p. 120) is the Euclidean length of $(a, b)$. It vanishes only at $z = 0$, and neither $|\\operatorname{Re} z|$ nor $|\\operatorname{Im} z|$ exceeds $|z|$ (Axler, p. 121).',
    caption: 'the right triangle 3, 4, 5',
    captionFormal: '$|3 + 4i| = 5$',
    stage: cp({ z: { re: 3, im: 4 }, show: ['parts', 'modulus'] }),
    introduces: ['qc-modulus'],
    claims: [C.abs34],
  },
  {
    id: 'f1-plane:b4',
    phase: 'core',
    text: 'The [[qc-conjugate|conjugate]] $z^*$ flips the sign of the imaginary part: $(3 + 4i)^* = 3 - 4i$. In the picture it is the mirror image of $z$ in the across axis. Mirroring keeps the size, so $|z^*| = |z|$.',
    formal:
      'The [[qc-conjugate|conjugate]] $z^* = \\operatorname{Re} z - i\\operatorname{Im} z$ is reflection in the real axis (Axler, p. 120, writes $\\bar z$). For any second number $w$ it satisfies $|z^*| = |z|$, $(z^*)^* = z$, $(z + w)^* = z^* + w^*$ and $(zw)^* = z^*w^*$ (Axler, p. 121).',
    caption: '$z$ and its mirror $z^*$',
    captionFormal: 'Rosetta: Axler’s $\\bar z$ is the physicists’ $z^*$, and Axler’s absolute value is the modulus',
    stage: cp({ z: { re: 3, im: 4 }, show: ['conj'] }),
    introduces: ['qc-conjugate'],
    claims: [
      claim('f1Conj34Im', '(3 + 4i)* = 3 − 4i', () => close(V.f1Conj34Im, -4)),
      claim('f1AbsConj34', '|(3 + 4i)*| = 5 = |3 + 4i|', () => close(V.f1AbsConj34, V.f1Abs34)),
    ],
  },
  {
    id: 'f1-plane:b5',
    phase: 'core',
    text: 'Multiply $z$ by its mirror, treating $i$ as a letter with $i^2 = -1$. $(3 + 4i)(3 - 4i) = 9 - 12i + 12i - 16i^2 = 9 + 16 = 25$. That is $|z|^2$ exactly, with no $i$ left.',
    formal:
      'For $z = a + bi$, $zz^* = a^2 + b^2 = |z|^2 \\ge 0$ (Axler, p. 121). Hence $\\operatorname{Re} z = (z + z^*)/2$, $\\operatorname{Im} z = (z - z^*)/(2i)$, and $z^{-1} = z^*/|z|^2$ for $z \\ne 0$.',
    caption: '$z$ times its mirror: 25, a plain positive number',
    captionFormal: '$zz^* = |z|^2 = 25$',
    derivation: {
      result: 'zz^* = |z|^2',
      ground: [
        {
          tex: '(a + bi)(a - bi) = a\\cdot a - a\\cdot bi + bi\\cdot a - bi\\cdot bi',
          why: 'Multiply each part of the first bracket by each part of the second.',
          view: cp({ z: { re: 3, im: 4 }, show: ['conj'] }),
          viewCaption: '$z$ and its mirror $z^*$, the two factors being multiplied.',
        },
        { tex: '= a^2 - abi + abi - b^2 i^2', why: 'Tidy each product; $a$ and $b$ are ordinary numbers, so their order does not matter.' },
        { tex: '= a^2 - b^2 i^2', why: 'The two middle terms are equal and opposite, so they cancel.' },
        { tex: '= a^2 + b^2', why: 'Replace $i^2$ by $-1$, which turns $-b^2 i^2$ into $+b^2$.' },
        {
          tex: 'zz^* = |z|^2',
          why: 'By Pythagoras, $a^2 + b^2$ is the squared distance of $z$ from zero.',
          view: cp({ z: { re: 3, im: 4 }, show: ['conj', 'modulus'] }),
          viewCaption: 'The product equals $|z|^2$, the squared size.',
        },
      ],
      formal: [
        {
          tex: 'zz^* = (a + bi)(a - bi) = a^2 + b^2',
          why: 'Distributivity and $i^2 = -1$.',
          view: cp({ z: { re: 3, im: 4 }, show: ['conj'] }),
          viewCaption: '$z$ and its mirror $z^*$.',
        },
        {
          tex: 'a^2 + b^2 = |z|^2',
          why: 'The squared modulus (Axler, p. 121); so $zz^*$ is real and never negative.',
          view: cp({ z: { re: 3, im: 4 }, show: ['conj', 'modulus'] }),
          viewCaption: 'The product equals $|z|^2$.',
        },
      ],
    },
    stage: cp({ z: { re: 3, im: 4 }, show: ['conj', 'modulus'] }),
    claims: [C.zzStar],
  },
  {
    id: 'f1-plane:b6',
    phase: 'books',
    text: `Axler proves a rule you can see in the picture. Call the second number $w = 1 - 2i$. Two arrows tip to tail never reach farther than their two lengths added, the [[qc-triangle-inequality|triangle inequality]]: $|z + w| \\le |z| + |w|$. Here $|4 + 2i| = ${d(V.f1AbsSum, 2)}$, while $5 + ${d(V.f1Abs1m2, 2)} = ${d(V.f1TwoSides, 2)}$.`,
    formal:
      'The [[qc-triangle-inequality|triangle inequality]] (Axler, p. 121): $|w + z|^2 = |w|^2 + |z|^2 + 2\\operatorname{Re}(wz^*) \\le (|w| + |z|)^2$, because $\\operatorname{Re}(wz^*) \\le |w||z|$. Equality holds exactly when one number is a nonnegative real multiple of the other.',
    caption: 'the sum’s arrow is shorter than the two arrows laid end to end',
    captionFormal: `$${d(V.f1AbsSum)} \\le ${d(V.f1TwoSides)}$`,
    stage: cp({ z: { re: 3, im: 4 }, w: { re: 1, im: -2 }, show: ['sum', 'modulus'] }),
    refs: [axler('Ch. 4, 4.4, p. 121', 'The list of rules for conjugates and absolute values, with a short proof of the triangle inequality.')],
    claims: [
      claim('f1AbsSum', '|(3 + 4i) + (1 − 2i)| = |4 + 2i| = 4.472', () => close(V.f1AbsSum, Math.sqrt(20))),
      claim('f1Abs1m2', '|1 − 2i| = 2.236', () => close(V.f1Abs1m2, Math.sqrt(5))),
      claim('f1TwoSides', '|3 + 4i| + |1 − 2i| = 7.236', () => close(V.f1TwoSides, 5 + Math.sqrt(5)) && V.f1AbsSum <= V.f1TwoSides),
      C.abs34,
    ],
  },
  {
    id: 'f1-plane:b7',
    phase: 'clue',
    text: 'Which numbers equal their own mirror, $z^* = z$? And which are the negative of their mirror, $z^* = -z$?',
    formal: 'Characterise the numbers with $z^* = z$ and those with $z^* = -z$.',
    stage: cp({ z: { re: 2, im: 1 }, show: ['conj'] }),
    reveal: {
      text: '$z^* = z$ means $b = -b$, so $b = 0$: exactly the ordinary numbers on the across axis. $z^* = -z$ means $a = -a$, so $a = 0$: the purely imaginary numbers on the up axis, such as $3i$.',
      formal:
        '$z^* = z$ exactly when $\\operatorname{Im} z = 0$, that is when $z$ is real: ℝ is the fixed line of the reflection. $z^* = -z$ exactly when $\\operatorname{Re} z = 0$. Self-conjugate numbers return in Chapter Q3 as the eigenvalues of Hermitian matrices.',
      caption: 'the across axis stays put; the up axis flips',
      captionFormal: 'the real axis is fixed; the imaginary axis is negated',
      stage: cp({ z: { re: 0, im: 3 }, show: ['conj'] }),
      claims: [
        claim('f1ConjRealIm', 'the mirror of 2 is 2', () => close(V.f1ConjRealIm, 0)),
        claim('f1ConjImag', 'the mirror of 3i is −3i', () => close(V.f1ConjImag, -3)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f1-multiply — Multiplying stretches and turns                                                   */
/* ---------------------------------------------------------------------------------------------- */

const PHI_SUM = '\\cos(\\varphi_z + \\varphi_w) + i\\sin(\\varphi_z + \\varphi_w)'

const multiply: Beat[] = [
  {
    id: 'f1-multiply:b1',
    phase: 'core',
    text: 'Multiply complex numbers like brackets in algebra, then replace every $i^2$ by $-1$. So $(2 + i)(1 + 3i) = 2 + 6i + i + 3i^2 = -1 + 7i$.',
    formal:
      '$(a + bi)(c + di) = (ac - bd) + (ad + bc)i$, forced by distributivity and $i^2 = -1$ (Axler, pp. 2–3). With it ℂ is a [[qc-field|field]]: every nonzero $z$ has an inverse (Axler, p. 4).',
    caption: '$(2 + i)(1 + 3i) = -1 + 7i$',
    derivation: {
      result: 'zw = (ac - bd) + (ad + bc)i',
      ground: [
        {
          tex: '(a + bi)(c + di) = a(c + di) + bi(c + di)',
          why: 'Write $z = a + bi$ and $w = c + di$, then multiply the second bracket by each part of the first.',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 } }),
          viewCaption: 'The two numbers being multiplied, before any product is drawn.',
        },
        { tex: '= ac + adi + bci + bd\\,i^2', why: 'Multiply out again, keeping $i$ as a letter.' },
        { tex: '= ac + adi + bci - bd', why: 'Replace $i^2$ by $-1$, the one new rule.' },
        {
          tex: '= (ac - bd) + (ad + bc)i',
          why: 'Collect the parts without $i$ and the parts with $i$.',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['product'] }),
          viewCaption: 'The finished product, as an arrow.',
        },
      ],
      formal: [
        {
          tex: 'zw = (a + bi)(c + di) = ac + (ad + bc)i + bd\\,i^2',
          why: 'For $z = a + bi$ and $w = c + di$, by distributivity and commutativity in ℂ (Axler, p. 3).',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 } }),
          viewCaption: 'The two factors, before the product.',
        },
        {
          tex: '= (ac - bd) + (ad + bc)i',
          why: 'Since $i^2 = -1$ (Axler, p. 2).',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['product'] }),
          viewCaption: 'The product $zw$.',
        },
      ],
    },
    stage: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['product'] }),
    claims: [
      claim('f1ProdRe', '(2 + i)(1 + 3i) has real part −1', () => close(V.f1ProdRe, -1)),
      claim('f1ProdIm', '(2 + i)(1 + 3i) has imaginary part 7', () => close(V.f1ProdIm, 7)),
    ],
  },
  {
    id: 'f1-multiply:b2',
    phase: 'core',
    text: 'Multiply any number $a + bi$ by $i$: $i(a + bi) = -b + ai$. So the point $(a, b)$ moves to $(-b, a)$. That is the same point turned a quarter turn about zero, at the same distance.',
    formal:
      'Multiplication by $i$ is the real-linear map $(a, b) \\mapsto (-b, a)$, with matrix $\\begin{pmatrix}0 & -1\\\\ 1 & 0\\end{pmatrix}$: the rotation by 90°, which keeps every length, so $|iz| = |z|$.',
    caption: '$i \\times (3 + 4i) = -4 + 3i$: same size 5, turned 90°',
    captionFormal: '$(3, 4) \\mapsto (-4, 3)$',
    derivation: {
      result: 'i(a + bi) = -b + ai,\\qquad |{-b + ai}| = |a + bi|',
      ground: [
        {
          tex: 'i(a + bi) = ai + b\\,i^2',
          why: 'Multiply both parts by $i$.',
          view: cp({ z: { re: 3, im: 4 }, w: { re: 0, im: 1 }, show: ['product'] }),
          viewCaption: 'The product $i(3 + 4i)$, before its turn is marked.',
        },
        { tex: '= -b + ai', why: 'Replace $i^2$ by $-1$ and put the part without $i$ first.' },
        { tex: '(a, b) \\mapsto (-b, a)', why: 'Read off the new across and up parts.' },
        {
          tex: '\\text{legs } a \\text{ (across)}, b \\text{ (up)} \\;\\to\\; b \\text{ (left)}, a \\text{ (up)}',
          why: 'Turn the right triangle from 0 to $(a, b)$ a quarter turn counterclockwise: the across leg now points up and the up leg points left.',
        },
        {
          tex: '|{-b + ai}| = \\sqrt{b^2 + a^2} = |a + bi|',
          why: 'The turned triangle has the same legs, so the same size.',
          view: cp({ z: { re: 3, im: 4 }, w: { re: 0, im: 1 }, show: ['product', 'arc', 'modulus'] }),
          viewCaption: 'The quarter-turn arc, with both sizes marked equal.',
        },
      ],
      formal: [
        {
          tex: 'i(a + bi) = -b + ai',
          why: 'The product rule with $c = 0$ and $d = 1$.',
          view: cp({ z: { re: 3, im: 4 }, w: { re: 0, im: 1 }, show: ['product'] }),
          viewCaption: 'The product $i(3 + 4i)$.',
        },
        { tex: '\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}\\begin{pmatrix}a\\\\b\\end{pmatrix} = \\begin{pmatrix}-b\\\\a\\end{pmatrix}', why: 'The rotation by 90°, with determinant 1.' },
        {
          tex: '|{-b + ai}| = |a + bi|',
          why: 'A rotation keeps lengths.',
          view: cp({ z: { re: 3, im: 4 }, w: { re: 0, im: 1 }, show: ['product', 'arc', 'modulus'] }),
          viewCaption: 'Both arrows keep the same size.',
        },
      ],
    },
    stage: cp({ z: { re: 3, im: 4 }, w: { re: 0, im: 1 }, show: ['product', 'arc'] }),
    claims: [
      claim('f1I34Re', 'i(3 + 4i) = −4 + 3i (real part)', () => close(V.f1I34Re, -4)),
      claim('f1I34Im', 'i(3 + 4i) = −4 + 3i (imaginary part)', () => close(V.f1I34Im, 3)),
      claim('f1AbsI34', '|i(3 + 4i)| = 5', () => close(V.f1AbsI34, 5)),
    ],
  },
  {
    id: 'f1-multiply:b3',
    phase: 'core',
    text: `Sizes multiply: $|zw| = |z| \\times |w|$. Check it on $z = 2 + i$ and $w = 1 + 3i$. $|2 + i| = ${d(V.f1Abs21)}$ and $|1 + 3i| = ${d(V.f1Abs13)}$, whose product is ${d(V.f1AbsTimes)}, and $|-1 + 7i| = \\sqrt{50} = ${d(V.f1AbsProd)}$ as well.`,
    formal:
      '$|zw| = |z||w|$ (Axler, p. 121): $|zw|^2 = (ac - bd)^2 + (ad + bc)^2 = (a^2 + b^2)(c^2 + d^2)$ once the cross terms cancel. Equivalently $|zw|^2 = zw\\,(zw)^* = zz^*\\,ww^*$.',
    caption: `$${d(V.f1Abs21)} \\times ${d(V.f1Abs13)} = ${d(V.f1AbsTimes)} = |-1 + 7i|$`,
    derivation: {
      result: '|zw| = |z||w|',
      ground: [
        {
          tex: 'zw = (ac - bd) + (ad + bc)i',
          why: 'The product rule, with $z = a + bi$ and $w = c + di$.',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['modulus'] }),
          viewCaption: 'The two sizes $|z|$ and $|w|$, before any product.',
        },
        { tex: '|zw|^2 = (ac - bd)^2 + (ad + bc)^2', why: 'Pythagoras on the product’s two parts.' },
        { tex: '= a^2c^2 - 2abcd + b^2d^2 + a^2d^2 + 2abcd + b^2c^2', why: 'Square each bracket.' },
        { tex: '= a^2c^2 + a^2d^2 + b^2c^2 + b^2d^2', why: 'The two cross terms cancel.' },
        { tex: '= (a^2 + b^2)(c^2 + d^2)', why: 'Factor: multiplying out the right side gives the same four terms.' },
        { tex: '= |z|^2|w|^2', why: 'Pythagoras for $z$ and for $w$.' },
        {
          tex: '|zw| = |z||w|',
          why: 'Take square roots; sizes are never negative.',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['product', 'modulus'] }),
          viewCaption: 'The product’s size equals $|z||w|$.',
        },
      ],
      formal: [
        {
          tex: '|zw|^2 = zw\\,(zw)^* = zz^*\\,ww^*',
          why: 'A squared modulus is the number times its conjugate, and $(zw)^* = z^*w^*$ (Axler, p. 121).',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['modulus'] }),
          viewCaption: 'The two sizes $|z|$, $|w|$.',
        },
        {
          tex: '|zw| = |z||w|',
          why: 'Again $zz^* = |z|^2$ and $ww^* = |w|^2$; take nonnegative roots.',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['product', 'modulus'] }),
          viewCaption: 'The product and its size.',
        },
      ],
    },
    stage: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['product', 'modulus'] }),
    claims: [C.abs21, C.abs13, C.absProd, claim('f1AbsTimes', '|2 + i| × |1 + 3i| = 7.071', () => close(V.f1AbsTimes, V.f1AbsProd))],
  },
  {
    id: 'f1-multiply:b4',
    phase: 'core',
    text: 'A point can also be named by its size $r$ and its [[qc-argument|angle]] $\\varphi$ (the Greek letter phi), written $\\arg z$. The angle is measured counterclockwise from the across axis. $\\cos\\varphi$ and $\\sin\\varphi$ (cosine and sine) are the across and up coordinates of the point at angle $\\varphi$ on the circle of radius 1. Then $a = r\\cos\\varphi$ and $b = r\\sin\\varphi$. So $z = r(\\cos\\varphi + i\\sin\\varphi)$, the [[qc-polar-form|polar form]]. Dividing $3 + 4i$ by its size 5 gives ' +
      `$${d(V.f1Dir34Re, 1)} + ${d(V.f1Dir34Im, 1)}i$, an arrow of size 1 pointing the same way. So every number is its size times a pure direction.`,
    formal:
      'The [[qc-polar-form|polar form]] is $z = r(\\cos\\varphi + i\\sin\\varphi)$ with $r = |z|$ and $\\varphi = \\arg z$, the [[qc-argument|argument]]. Its principal value lies in (−180°, 180°]; the argument is defined only up to multiples of 360°, and not at all for $z = 0$. Every $z \\ne 0$ factors as $|z| \\cdot (z/|z|)$ with $|z/|z|| = 1$: a size times a pure phase (N&C, p. 85).',
    caption: `$2 + i$: size ${d(V.f1Abs21)} at ${d(V.f1Arg21Deg, 3)}°`,
    captionFormal: `$\\arg(2 + i) = ${d(V.f1Arg21Deg, 3)}^\\circ$, $\\arg(1 + 3i) = ${d(V.f1Arg13Deg, 3)}^\\circ$`,
    stage: cp({ z: { re: 2, im: 1 }, show: ['modulus', 'arg'] }),
    claims: [
      C.abs21,
      C.arg21,
      C.arg13,
      claim('f1Dir34Re', '(3 + 4i)/5 = 0.6 + 0.8i (real part)', () => close(V.f1Dir34Re, 0.6)),
      claim('f1Dir34Im', '(3 + 4i)/5 = 0.6 + 0.8i (imaginary part)', () => close(V.f1Dir34Im, 0.8)),
      claim('f1Dir34Abs', '|(3 + 4i)/5| = 1', () => close(V.f1Dir34Abs, 1)),
    ],
  },
  {
    id: 'f1-multiply:b5',
    phase: 'core',
    text: `Now the key fact: when you multiply, the angles add. The product of $2 + i$ (at ${d(V.f1Arg21Deg, 3)}°) and $1 + 3i$ (at ${d(V.f1Arg13Deg, 3)}°) sits at ${d(V.f1ArgProdDeg, 3)}°. The proof below turns the axes through the first angle.`,
    formal: `Write $\\varphi_z = \\arg z$ and $\\varphi_w = \\arg w$. By the angle-addition identities, $(\\cos\\varphi_z + i\\sin\\varphi_z)(\\cos\\varphi_w + i\\sin\\varphi_w) = ${PHI_SUM}$. Hence moduli multiply and arguments add modulo 360°.`,
    caption: `${d(V.f1Arg21Deg, 3)}° + ${d(V.f1Arg13Deg, 3)}° = ${d(V.f1ArgProdDeg, 3)}°: the product’s angle`,
    captionFormal: '$\\arg(zw) = \\arg z + \\arg w$ (mod 360°)',
    derivation: {
      result: `zw = |z||w|\\,[${PHI_SUM}]`,
      ground: [
        {
          tex: 'u = \\cos\\varphi_z + i\\sin\\varphi_z',
          why: 'Call $u$ the point of size 1 at angle $\\varphi_z$; by the meaning of cosine and sine, its coordinates are $\\cos\\varphi_z$ and $\\sin\\varphi_z$.',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['arg'] }),
          viewCaption: 'Each number’s own angle, named before they are multiplied.',
        },
        { tex: 'v = iu = -\\sin\\varphi_z + i\\cos\\varphi_z', why: 'Turn $u$ a quarter turn to get $v$: two perpendicular arrows of size 1, the axes turned through $\\varphi_z$.' },
        { tex: 'q = \\cos\\varphi_w\\,u + \\sin\\varphi_w\\,v', why: 'In the turned axes, the point $q$ at angle $\\varphi_w$ goes $\\cos\\varphi_w$ along $u$ and $\\sin\\varphi_w$ along $v$.' },
        { tex: `q = ${PHI_SUM}`, why: 'The point $q$ lies $\\varphi_w$ past $u$, so at $\\varphi_z + \\varphi_w$ from the across axis, and its size is 1.' },
        {
          tex: 'q = (\\cos\\varphi_z\\cos\\varphi_w - \\sin\\varphi_z\\sin\\varphi_w) + i(\\sin\\varphi_z\\cos\\varphi_w + \\cos\\varphi_z\\sin\\varphi_w)',
          why: 'Put $u$ and $v$ from the first two steps into the third, and collect the parts.',
        },
        {
          tex: '\\cos(\\varphi_z + \\varphi_w) = \\cos\\varphi_z\\cos\\varphi_w - \\sin\\varphi_z\\sin\\varphi_w,\\ \\ \\sin(\\varphi_z + \\varphi_w) = \\sin\\varphi_z\\cos\\varphi_w + \\cos\\varphi_z\\sin\\varphi_w',
          why: 'Compare the parts of the last two lines: these are the angle-addition rules.',
        },
        { tex: `(\\cos\\varphi_z + i\\sin\\varphi_z)(\\cos\\varphi_w + i\\sin\\varphi_w) = ${PHI_SUM}`, why: 'Multiply out with the product rule; its parts are exactly those of the line above.' },
        {
          tex: `zw = |z||w|\\,[${PHI_SUM}]`,
          why: 'Put the sizes back: sizes multiply.',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['product', 'arg'] }),
          viewCaption: 'The product’s own angle is the sum of the two.',
        },
      ],
      formal: [
        {
          tex: 'R(\\varphi_z)R(\\varphi_w) = R(\\varphi_z + \\varphi_w)',
          why: 'Write $R(\\varphi)$ for the rotation of the plane by $\\varphi$; rotations compose by adding angles, which is the angle-addition identity.',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['arg'] }),
          viewCaption: 'The two angles, before composing the rotations.',
        },
        { tex: `(\\cos\\varphi_z + i\\sin\\varphi_z)(\\cos\\varphi_w + i\\sin\\varphi_w) = ${PHI_SUM}`, why: 'The product rule reproduces the product of the two rotation matrices.' },
        {
          tex: `zw = |z||w|\\,[${PHI_SUM}]`,
          why: 'With $|zw| = |z||w|$ for the moduli.',
          view: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['product', 'arg'] }),
          viewCaption: 'The product and its angle $\\varphi_z + \\varphi_w$.',
        },
      ],
    },
    stage: cp({ z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['product', 'arg'] }),
    claims: [C.arg21, C.arg13, C.argProd],
  },
  {
    id: 'f1-multiply:b6',
    phase: 'books',
    text: `Dividing undoes multiplying: divide the sizes and subtract the angles. So $1/(3 + 4i)$ has size 1/5 and the opposite angle: it is $${d(V.f1Inv34Re, 2)} - ${d(V.f1Inv34ImNeg, 2)}i$. Also, three turns of 30° make one turn of 90°, which lands on $i$.`,
    formal:
      'For $w \\ne 0$, $z/w = (|z|/|w|)[\\cos(\\varphi_z - \\varphi_w) + i\\sin(\\varphi_z - \\varphi_w)]$. Every $z \\ne 0$ has an inverse $1/z$ (Axler, p. 4), and $zz^* = |z|^2$ (Axler, p. 121) gives it: $z^{-1} = z^*/|z|^2$. Induction, with inverses for negative powers, gives [[qc-de-moivre|de Moivre’s rule]]: $(\\cos\\varphi + i\\sin\\varphi)^n = \\cos n\\varphi + i\\sin n\\varphi$ for every integer $n$.',
    caption: '$(\\cos 30^\\circ + i\\sin 30^\\circ)^3 = i$',
    captionFormal: '$(\\cos 30^\\circ + i\\sin 30^\\circ)^3 = \\cos 90^\\circ + i\\sin 90^\\circ = i$',
    stage: cp({ powers: { of: { r: 1, phiDeg: 30 }, upTo: 3 } }),
    refs: [
      axler('§1A, 1.5, p. 4', 'The inverse of a nonzero complex number, and division defined by it.'),
      axler('Ch. 4, 4.4, p. 121', 'A number times its conjugate is its absolute value squared, from which the inverse follows as the conjugate over that square.'),
    ],
    claims: [
      claim('f1Inv34Re', '1/(3 + 4i) = 0.12 − 0.16i (real part)', () => close(V.f1Inv34Re, 0.12)),
      claim('f1Inv34ImNeg', '1/(3 + 4i) = 0.12 − 0.16i (the 0.16)', () => close(V.f1Inv34ImNeg, 0.16)),
      claim('f1InvAbs', '|1/(3 + 4i)| = 1/5', () => close(V.f1InvAbs, 0.2)),
      claim('f1DeMoivre', '(cos 30° + i sin 30°)³ = i', () => close(V.f1DeMoivre, 1)),
    ],
  },
  {
    id: 'f1-multiply:b7',
    phase: 'clue',
    text: 'Without multiplying out eight brackets, what is $(1 + i)^8$?',
    formal: 'Evaluate $(1 + i)^8$ in polar form.',
    stage: cp({ z: { re: 1, im: 1 } }),
    reveal: {
      text: `$1 + i$ has size $\\sqrt2 = ${d(V.f1Abs11)}$ and angle 45°. Eight copies multiply the sizes to $(\\sqrt2)^8 = 16$. They add the angles to 360°, one full turn, so $(1 + i)^8 = 16$.`,
      formal:
        '$1 + i = \\sqrt2(\\cos 45^\\circ + i\\sin 45^\\circ)$, so by de Moivre $(1 + i)^8 = 2^4(\\cos 360^\\circ + i\\sin 360^\\circ) = 16$. The successive powers spiral outward by a factor $\\sqrt2$ and 45° per step.',
      caption: 'powers of $1 + i$: 1, ${1 + i}$, $2i$, ${-2 + 2i}$, $-4$, …, 16',
      stage: cp({ powers: { of: { re: 1, im: 1 }, upTo: 8 } }),
      claims: [
        C.abs11,
        claim('f1OnePlusI8', '(1 + i)⁸ = 16', () => close(V.f1OnePlusI8, 16)),
        claim('f1OnePlusI4', '(1 + i)⁴ = −4, halfway along the spiral', () => close(V.f1OnePlusI4, -4)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f1-euler — e^{iφ}: walking round the unit circle                                                */
/* ---------------------------------------------------------------------------------------------- */

const euler: Beat[] = [
  {
    id: 'f1-euler:b1',
    phase: 'core',
    text: `Measure an angle by the length of arc it cuts from a circle of radius 1: that unit is the [[qc-radian|radian]]. A full turn is the whole circumference, $2\\pi \\approx ${d(V.f1TwoPi)}$, where $\\pi \\approx ${d(V.f1Pi, 5)}$. So 180° is $\\pi$ radians and 90° is $\\pi/2 \\approx ${d(V.f1HalfPi)}$.`,
    formal: 'In [[qc-radian|radian]] measure an angle equals the arc length it cuts on the circle of radius 1, so 360° is $2\\pi$. From here on, angles are in radians unless marked with °.',
    caption: `half a turn: an arc of length $\\pi$ = ${d(V.f1Pi, 5)}`,
    captionFormal: '$\\arg(-1) = \\pi$, $\\arg i = \\pi/2$',
    stage: cp({ z: { r: 1, phiDeg: sweep(0, 180) }, trail: true, show: ['arc'] }),
    claims: [
      C.pi,
      claim('f1HalfPi', 'a quarter turn is π/2 = 1.571 radians', () => close(V.f1HalfPi, Math.PI / 2)),
      claim('f1TwoPi', 'a full turn is 2π = 6.283 radians', () => close(V.f1TwoPi, 2 * Math.PI)),
    ],
  },
  {
    id: 'f1-euler:b2',
    phase: 'core',
    text: 'The numbers of size 1 form the [[qc-unit-circle|unit circle]]. The one at angle $\\varphi$ is $\\cos\\varphi + i\\sin\\varphi$. Multiplying by it turns a number by $\\varphi$ and never stretches it, because its size is 1.',
    formal:
      'The [[qc-unit-circle|unit circle]], the set of $z$ with $|z| = 1$, is $\\{\\cos\\varphi + i\\sin\\varphi\\}$ over all real $\\varphi$. Since sizes multiply and angles add, it is closed under products and inverses, the group U(1), and multiplying by one of its elements rotates ℂ.',
    caption: 'every point here has size exactly 1',
    captionFormal: 'the unit circle is the group U(1)',
    stage: cp({ z: { r: 1, phiDeg: sweep(0, 360) }, circle: true, trail: true }),
    claims: [claim('f1UnitSize', '|cos 1 + i sin 1| = 1', () => close(V.f1UnitSize, 1))],
  },
  {
    id: 'f1-euler:b3',
    phase: 'core',
    text: `Grow 1 by ${pct(V.f1Rate1)} in one step: 2. By ${pct(V.f1Rate2)} twice: $${d(V.f1Step2, 1)}^2 = ${d(V.f1Grow2, 2)}$. With $n$ steps of $1/n$ each, $(1 + 1/n)^n$ settles near [[qc-e|$e$]] $\\approx ${d(V.f1E)}$ as $n$ grows. Growing at a rate $x$ instead, $(1 + x/n)^n$ settles near $e^x$: for $x = 2$, near $e^2 \\approx ${d(V.f1E2)}$. We write the value it settles on with $\\lim_{n\\to\\infty}$, “the limit as $n$ grows without end”: $e^x = \\lim_{n\\to\\infty}(1 + x/n)^n$.`,
    formal: `Define [[qc-e|$e$]] $= \\lim_{n\\to\\infty}(1 + 1/n)^n \\approx ${d(V.f1E, 5)}$, and more generally $e^x = \\lim_{n\\to\\infty}(1 + x/n)^n$. This definition uses only products, so it makes sense for complex $x$.`,
    caption: `$(1 + 1/n)^n$: 2, ${d(V.f1Grow2, 2)}, …, ${d(V.f1E1000)} at $n$ = 1000`,
    captionFormal: `$n = 1000$: ${d(V.f1E1000, 4)}; the limit is ${d(V.f1E, 5)}`,
    stage: cp({ line: true, euler: { rate: 'real', x: 1, n: sweep(1, 64) } }),
    claims: [
      claim('f1Rate1', 'one step of 1/1 grows by 100 %', () => close(V.f1Rate1, 1)),
      claim('f1Rate2', 'each of two half steps grows by 1/2 = 50 %', () => close(V.f1Rate2, 0.5)),
      claim('f1Step2', 'one of two half steps: 1 + 1/2 = 1.5', () => close(V.f1Step2, 1.5)),
      claim('f1Grow2', '1.5² = 2.25', () => close(V.f1Grow2, 2.25)),
      claim('f1E1000', '(1 + 1/1000)¹⁰⁰⁰ = 2.7169', () => close(V.f1E1000, 1.001 ** 1000, 1e-12)),
      C.e,
      claim('f1E2', '(1 + 2/n)ⁿ settles near e² = 7.389 (within 10⁻⁴ at n = 10⁶)', () => close(V.f1E2, Math.exp(2)) && realLimitMatches()),
    ],
  },
  {
    id: 'f1-euler:b4',
    phase: 'core',
    text: 'Now grow at an imaginary rate: multiply 1 by $(1 + i\\varphi/n)$, $n$ times over. The rule above with $x = i\\varphi$ names the result: $e^{i\\varphi} = \\lim_{n\\to\\infty}(1 + i\\varphi/n)^n$. Each step is a tiny turn of about $\\varphi/n$ with almost no stretch. After $n$ steps the point has turned by about $\\varphi$ and sits near the unit circle.',
    formal:
      'Define $e^{i\\varphi} = \\lim_{n\\to\\infty}(1 + i\\varphi/n)^n$. Each factor has modulus $\\sqrt{1 + \\varphi^2/n^2}$ and argument $\\tan^{-1}(\\varphi/n)$, so the product has modulus $(1 + \\varphi^2/n^2)^{n/2} \\to 1$ and argument $n\\tan^{-1}(\\varphi/n) \\to \\varphi$. The same many-small-steps limit returns in Chapter Q19 as the Trotter formula (N&C, p. 207).',
    caption: '$(1 + i\\pi/n)^n$ for $n$ = 1 … 64: the end point closes in on −1',
    captionFormal: `modulus ${d(V.f1Euler1Abs)} at $n = 1$, ${d(V.f1Euler64Abs)} at $n = 64$, ${d(V.f1Euler1000Abs)} at $n = 1000$`,
    derivation: {
      result: 'e^{i\\varphi} = \\lim_{n\\to\\infty}(1 + i\\varphi/n)^n = \\cos\\varphi + i\\sin\\varphi',
      ground: [
        {
          tex: 'w = 1 + i\\varphi/n',
          why: 'One small step $w$: one across, $\\varphi/n$ up.',
          view: cp({ euler: { rate: 'imag', phiDeg: 180, n: 4 } }),
          viewCaption: 'A few big steps: the polygon overshoots the circle.',
        },
        { tex: '|w|^2 = 1 + \\varphi^2/n^2', why: 'Pythagoras on the step.' },
        { tex: '\\tan\\delta = \\varphi/n', why: 'The step’s angle $\\delta$ has opposite side $\\varphi/n$ over adjacent side 1.' },
        { tex: '\\delta \\approx \\varphi/n', why: 'For a tiny angle in radians, the arc and the tangent are almost equal.' },
        { tex: '\\arg(w^n) = n\\delta \\approx \\varphi', why: 'The $n$ steps add their angles.' },
        { tex: '|w^n| = (1 + \\varphi^2/n^2)^{n/2}', why: 'The $n$ steps multiply their sizes.' },
        {
          tex: `(1 + \\pi^2/n^2)^{n/2}:\\ ${d(V.f1Euler10Abs)}\\ (n = 10),\\ ${d(V.f1Euler100Abs)}\\ (n = 100),\\ ${d(V.f1Euler1000Abs)}\\ (n = 1000)`,
          why: 'With $\\varphi = \\pi$: each step stretches by only about $\\tfrac{\\varphi^2}{2n^2}$, so all $n$ steps together stretch by about $\\tfrac{\\varphi^2}{2n}$, which fades as $n$ grows.',
          claims: [
            claim('f1Euler10Abs', '|(1 + iπ/10)¹⁰| = 1.601', () => close(V.f1Euler10Abs, (1 + Math.PI ** 2 / 100) ** 5)),
            claim('f1Euler100Abs', '|(1 + iπ/100)¹⁰⁰| = 1.051', () => close(V.f1Euler100Abs, (1 + Math.PI ** 2 / 1e4) ** 50)),
            C.euler1000,
          ],
        },
        {
          tex: 'w^n \\to \\cos\\varphi + i\\sin\\varphi',
          why: 'Size tending to 1 and angle tending to $\\varphi$: the unit-circle point at angle $\\varphi$.',
          view: cp({ euler: { rate: 'imag', phiDeg: 180, n: 64 } }),
          viewCaption: 'Many small steps: the polygon closes in on $e^{i\\varphi}$.',
        },
      ],
      formal: [
        {
          tex: '|1 + i\\varphi/n|^n = \\exp\\big[\\tfrac n2\\ln(1 + \\varphi^2/n^2)\\big] \\to 1',
          why: 'Since $\\tfrac n2\\ln(1 + \\varphi^2/n^2) \\le \\tfrac{\\varphi^2}{2n} \\to 0$.',
          view: cp({ euler: { rate: 'imag', phiDeg: 180, n: 4 } }),
          viewCaption: 'A coarse polygon, $n = 4$.',
        },
        { tex: 'n\\tan^{-1}(\\varphi/n) \\to \\varphi', why: 'Since $\\tan^{-1}x$ differs from $x$ by less than $|x|^3$ for small $x$.' },
        {
          tex: 'e^{i\\varphi} = \\cos\\varphi + i\\sin\\varphi',
          why: 'Modulus and argument converge to 1 and $\\varphi$.',
          view: cp({ euler: { rate: 'imag', phiDeg: 180, n: 64 } }),
          viewCaption: 'A fine polygon, $n = 64$, nearly on the circle.',
        },
      ],
    },
    stage: cp({ euler: { rate: 'imag', phiDeg: 180, n: sweep(1, 64) } }),
    claims: [claim('f1Euler1Abs', '|1 + iπ| = 3.297', () => close(V.f1Euler1Abs, Math.hypot(1, Math.PI))), C.euler64, C.euler1000, C.expiPi],
  },
  {
    id: 'f1-euler:b5',
    phase: 'core',
    text: 'So $e^{i\\varphi} = \\cos\\varphi + i\\sin\\varphi$: this is [[qc-euler-formula|Euler’s formula]]. It names the point of the unit circle at angle $\\varphi$. Halfway round, $e^{i\\pi} = -1$; a quarter of the way, $e^{i\\pi/2} = i$. Spin Lab meets it too: <<qc-l2-complex|numbers that turn>>.',
    formal:
      '[[qc-euler-formula|Euler’s formula]] $e^{i\\varphi} = \\cos\\varphi + i\\sin\\varphi$ gives the exponential form $z = re^{i\\varphi}$, and the angle addition of the multiplication unit becomes $e^{i\\varphi_z}e^{i\\varphi_w} = e^{i(\\varphi_z + \\varphi_w)}$. In particular $e^{i\\pi} + 1 = 0$; Spin Lab reads $e^{i\\pi} = -1$ as a sign: <<qc-l7-full-turn|a full turn flips the sign>>.',
    caption: '$e^{i\\varphi}$ for $\\varphi$ from 0 to $2\\pi$; at $\\pi$ it is −1',
    captionFormal: '$e^{i\\pi} = -1$, $e^{i\\pi/2} = i$',
    stage: cp({ z: { r: 1, phiDeg: sweep(0, 360) }, trail: true }),
    introduces: ['qc-euler-formula'],
    claims: [C.expiPi, claim('f1ExpiHalfPiIm', 'e^{iπ/2} = i', () => close(V.f1ExpiHalfPiIm, 1))],
  },
  {
    id: 'f1-euler:b6',
    phase: 'books',
    text: 'A second reason it is a circle. As $\\varphi$ grows, the point $e^{i\\varphi}$ moves at speed 1, always at right angles to its arrow from zero. Moving always sideways to the arrow keeps the distance fixed, like a stone whirled on a string.',
    formal:
      '$f(\\varphi) = e^{i\\varphi}$ solves $f\' = if$ with $f(0) = 1$: the velocity is the position turned by 90°. Hence $(|f|^2)\' = 2\\operatorname{Re}(f^*f\') = 0$ and $|f\'| = 1$, so $f$ runs round the unit circle at unit speed. Bergou (eq. 1.2, p. 2), the notes (eq. 1.4, p. 12) and N&C (eqs. 1.3–1.4, p. 15) use this $e^{i\\varphi}$ for a qubit’s azimuth.',
    caption: 'the velocity arrow always points along the circle',
    captionFormal: '$f\' = if$: the velocity is at right angles to the position',
    stage: cp({ z: { r: 1, phiDeg: sweep(0, 360) }, show: ['velocity'] }),
    refs: [
      bergou('§1.1, p. 2 (eq. 1.2)', 'The Bloch form of a qubit uses $e^{i\\varphi}$ for the angle round the equator.'),
      notes('709 notes p. 12 (eq. 1.4)', 'The state along a general direction carries the same $e^{i\\varphi}$ on its second amplitude.'),
      nc('§1.2, p. 15 (eqs. 1.3–1.4)', 'The same $e^{i\\varphi}$ as the azimuth; the overall factor is written out first and then dropped, because nothing can observe it.'),
    ],
    claims: [
      claim('f1VelDot', 'the velocity i·e^{iφ} is at right angles to e^{iφ} (φ = 0.7)', () => close(V.f1VelDot, 0)),
      claim('f1VelSize', 'the velocity of e^{iφ} has size 1 (φ = 0.7)', () => close(V.f1VelSize, 1)),
    ],
  },
  {
    id: 'f1-euler:b7',
    phase: 'clue',
    text: 'Try a small $n$. Where does $(1 + i\\pi/2)^2$ land? Is it on the unit circle?',
    formal: 'Compute $(1 + i\\pi/2)^2$ and its modulus. Why does the definition need $n \\to \\infty$?',
    stage: cp({ euler: { rate: 'imag', phiDeg: 180, n: 2 } }),
    reveal: {
      text: `$(1 + i\\pi/2)^2 = 1 - \\tfrac{\\pi^2}{4} + i\\pi \\approx -${d(V.f1Euler2ReNeg)} + ${d(V.f1Euler2Im)}i$. Its size is ${d(V.f1Euler2Abs)}, far off the circle. Each big step stretches as well as turns; only tiny steps make the stretching fade.`,
      formal: `$(1 + i\\pi/2)^2 = (1 - \\tfrac{\\pi^2}{4}) + i\\pi$, with modulus $1 + \\tfrac{\\pi^2}{4} \\approx ${d(V.f1Euler2Abs)}$. The stretch compounds to $(1 + \\varphi^2/n^2)^{n/2} \\approx e^{\\varphi^2/(2n)}$, which tends to 1 only as $n \\to \\infty$.`,
      caption: 'two big steps overshoot; 64 small steps nearly close on −1',
      captionFormal: `modulus ${d(V.f1Euler2Abs)} at $n = 2$, ${d(V.f1Euler64Abs)} at $n = 64$`,
      stage: cp({ euler: { rate: 'imag', phiDeg: 180, n: sweep(2, 64) } }),
      claims: [
        claim('f1Euler2ReNeg', '(1 + iπ/2)² has real part −1.467', () => close(V.f1Euler2ReNeg, Math.PI ** 2 / 4 - 1)),
        claim('f1Euler2Im', '(1 + iπ/2)² has imaginary part π = 3.142', () => close(V.f1Euler2Im, Math.PI)),
        claim('f1Euler2Abs', '|(1 + iπ/2)²| = 1 + π²/4 = 3.467', () => close(V.f1Euler2Abs, 1 + Math.PI ** 2 / 4)),
        C.euler64,
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f1-phase — Phases you can and cannot see (order of the N&C addendum §3.5, renumbered)           */
/* ---------------------------------------------------------------------------------------------- */

/** The relative-phase state of b4 and b6: (1, e^{iφ})/√2, a 448 direction on the equator (content writes no amplitude). */
const equator = (phiDeg: number | { from: number; to: number }) => ({ dir: { thetaDeg: 90, phiDeg } })

const phase: Beat[] = [
  {
    id: 'f1-phase:b1',
    phase: 'core',
    text: 'A [[qc-phasor|phasor]] is a complex number drawn as an arrow; its angle is called its [[qc-phase|phase]]. Waves use them: the size says how strong, the phase says where the wave is in its cycle. To combine two waves, add their arrows tip to tail.',
    formal:
      'A [[qc-phasor|phasor]] is a complex amplitude $A = |A|e^{i\\varphi}$ with [[qc-phase|phase]] $\\varphi$. Contributions that meet add as complex numbers, and the detected intensity is $|\\sum_k A_k|^2$, not $\\sum_k |A_k|^2$.',
    caption: `two arrows of size 1 at 0° and 60°, tip to tail: size ${d(V.f1Phasor60Abs)}`,
    captionFormal: `$1 + e^{i\\pi/3} = ${d(V.f1Phasor60Re, 1)} + ${d(V.f1Phasor60Im)}i$`,
    stage: cp({ chain: { phasesDeg: [0, 60] } }),
    fidelity: ['qc-cplane-arrows-not-forces'],
    claims: [
      claim('f1Phasor60Abs', '|1 + e^{iπ/3}| = √3 = 1.732', () => close(V.f1Phasor60Abs, Math.sqrt(3))),
      claim('f1Phasor60Re', '1 + e^{iπ/3} = 1.5 + 0.866i (real part)', () => close(V.f1Phasor60Re, 1.5)),
      claim('f1Phasor60Im', '1 + e^{iπ/3} = 1.5 + 0.866i (imaginary part)', () => close(V.f1Phasor60Im, Math.sqrt(3) / 2)),
    ],
  },
  {
    id: 'f1-phase:b2',
    phase: 'core',
    text: 'Add two arrows of size 1 whose angles differ by $\\varphi$: $1 + e^{i\\varphi}$. Its size squared is $2 + 2\\cos\\varphi$. At $\\varphi = 0$ that is 4, with the arrows lined up; at $\\varphi = \\pi$ it is 0, and they cancel. This is [[qc-interference|interference]].',
    formal:
      '$|1 + e^{i\\varphi}|^2 = (1 + e^{i\\varphi})(1 + e^{-i\\varphi}) = 2 + 2\\cos\\varphi = 4\\cos^2(\\varphi/2)$: constructive [[qc-interference|interference]] at $\\varphi = 0$, destructive at $\\varphi = \\pi$.',
    caption: 'turn the second arrow from 0 to 180°: the sum shrinks from 2 to 0',
    captionFormal: '$|1 + e^{i\\varphi}|^2$ = 4, 3, 2, 1, 0 at 0°, 60°, 90°, 120°, 180°',
    derivation: {
      result: '|1 + e^{i\\varphi}|^2 = 2 + 2\\cos\\varphi',
      ground: [
        {
          tex: '1 + e^{i\\varphi} = (1 + \\cos\\varphi) + i\\sin\\varphi',
          why: 'Use Euler’s formula, then add the across parts.',
          view: cp({ chain: { phasesDeg: [0, 0] } }),
          viewCaption: 'Lined up, $\\varphi = 0$: the arrows reinforce.',
        },
        { tex: '|1 + e^{i\\varphi}|^2 = (1 + \\cos\\varphi)^2 + \\sin^2\\varphi', why: 'Pythagoras on the two parts.' },
        { tex: '= 1 + 2\\cos\\varphi + \\cos^2\\varphi + \\sin^2\\varphi', why: 'Square the bracket.' },
        { tex: '\\cos^2\\varphi + \\sin^2\\varphi = 1', why: 'A point of the unit circle is at distance 1 from zero.' },
        {
          tex: '|1 + e^{i\\varphi}|^2 = 2 + 2\\cos\\varphi',
          why: 'Put the last line into the line before it: lined-up arrows give 4, opposite arrows give 0.',
          view: cp({ chain: { phasesDeg: [0, 180] } }),
          viewCaption: 'Opposite, $\\varphi = 180°$: the arrows cancel.',
        },
      ],
      formal: [
        {
          tex: '|1 + e^{i\\varphi}|^2 = (1 + e^{i\\varphi})(1 + e^{-i\\varphi})',
          why: 'A squared modulus is the number times its conjugate, and $(e^{i\\varphi})^* = e^{-i\\varphi}$.',
          view: cp({ chain: { phasesDeg: [0, 0] } }),
          viewCaption: '$\\varphi = 0$: constructive interference.',
        },
        {
          tex: '= 2 + e^{i\\varphi} + e^{-i\\varphi} = 2 + 2\\cos\\varphi',
          why: 'Multiply out, and $e^{i\\varphi} + e^{-i\\varphi} = 2\\cos\\varphi$; by the double-angle identity this also equals $4\\cos^2(\\varphi/2)$.',
          view: cp({ chain: { phasesDeg: [0, 180] } }),
          viewCaption: '$\\varphi = 180°$: destructive interference.',
        },
      ],
    },
    stage: cp({ chain: { phasesDeg: [0, sweep(0, 180)] } }),
    claims: [
      C.interf0,
      claim('f1Interf60', '|1 + e^{iπ/3}|² = 3', () => close(V.f1Interf60, 3)),
      claim('f1Interf90', '|1 + e^{iπ/2}|² = 2', () => close(V.f1Interf90, 2)),
      claim('f1Interf120', '|1 + e^{i2π/3}|² = 1', () => close(V.f1Interf120, 1)),
      C.interf180,
    ],
  },
  {
    id: 'f1-phase:b3',
    phase: 'core',
    text: 'Turn every arrow by the same angle $\\gamma$ (gamma). The whole picture turns, but no size changes and no angle between arrows changes. So a common turn, a [[global-phase|global phase]], can never be detected.',
    formal:
      'For every real $\\gamma$, $|\\sum_k e^{i\\gamma}A_k|^2 = |\\sum_k A_k|^2$: a [[global-phase|global phase]] factor $e^{i\\gamma}$ leaves every intensity and probability unchanged. Quantum states are therefore [[qc-ray|rays]], vectors defined only up to such a factor.',
    caption: `both arrows turn together: their sum keeps size ${d(V.f1GlobalAbs)}`,
    captionFormal: `$\\gamma$ from 0 to $2\\pi$: the sum’s modulus stays ${d(V.f1GlobalAbs)}`,
    derivation: {
      result: '|e^{i\\gamma}(A + B)|^2 = |A + B|^2',
      ground: [
        {
          tex: 'e^{i\\gamma}A + e^{i\\gamma}B = e^{i\\gamma}(A + B)',
          why: 'Call the two arrows $A$ and $B$; turning both by $\\gamma$ turns their sum by $\\gamma$.',
          view: cp({ chain: { phasesDeg: [0, 60], sizes: [0.5, 0.5] } }),
          viewCaption: '$A$ and $B$, before any common turn.',
        },
        { tex: '|e^{i\\gamma}| = 1', why: 'A pure turn sits on the unit circle.' },
        { tex: '|e^{i\\gamma}(A + B)| = |e^{i\\gamma}|\\,|A + B|', why: 'Sizes multiply.' },
        { tex: '= |A + B|', why: 'Multiplying a size by 1 changes nothing.' },
        {
          tex: '|e^{i\\gamma}(A + B)|^2 = |A + B|^2',
          why: 'What a detector reads, such as a wave’s brightness, is a size squared, so it does not change either.',
          view: cp({ chain: { phasesDeg: [90, 150], sizes: [0.5, 0.5] } }),
          viewCaption: 'Both turned by $\\gamma = 90°$: the same 60° apart, the same resultant size.',
        },
      ],
      formal: [
        {
          tex: '\\langle\\psi|e^{-i\\gamma}M^\\dagger M e^{i\\gamma}|\\psi\\rangle = \\langle\\psi|M^\\dagger M|\\psi\\rangle',
          why: 'For any state $|\\psi\\rangle$ and any measurement operator $M$ with adjoint $M^\\dagger$, the scalars $e^{\\mp i\\gamma}$ move out and multiply to 1 (N&C, p. 93).',
          view: cp({ chain: { phasesDeg: [0, 60], sizes: [0.5, 0.5] } }),
          viewCaption: '$A$ and $B$, before the common turn $\\gamma$.',
        },
        {
          tex: '|e^{i\\gamma}(A + B)|^2 = |A + B|^2',
          why: 'In particular for the amplitude $A + B$ of any single outcome.',
          view: cp({ chain: { phasesDeg: [90, 150], sizes: [0.5, 0.5] } }),
          viewCaption: 'After $\\gamma = 90°$: the same geometry, so the same $|A+B|$.',
        },
      ],
    },
    stage: cp({ chain: { phasesDeg: [sweep(0, 360), sweep(60, 420)], sizes: [0.5, 0.5] } }),
    claims: [C.globalAbs, claim('f1Global', 'and its square stays 0.75 for every γ', () => close(V.f1Global, 0.75))],
  },
  {
    id: 'f1-phase:b4',
    phase: 'core',
    text: 'In quantum physics a state is a list of complex numbers called [[qc-amplitude|amplitudes]], and each chance is an amplitude’s size squared. Take the amplitudes $a_0 = 1/\\sqrt2$ and $a_1 = e^{i\\varphi}/\\sqrt2$ (Bergou’s $\\alpha$ and $\\beta$). The chances are ½ and ½ for every $\\varphi$. Yet $\\varphi$ changes how the two arrows add, so this [[relative-phase|relative phase]] is real physics.',
    formal:
      'In $a_0|0\\rangle + a_1|1\\rangle = (|0\\rangle + e^{i\\varphi}|1\\rangle)/\\sqrt2$ the [[relative-phase|relative phase]] $\\varphi$ leaves both probabilities at ½ but fixes the state’s longitude on the [[bloch-sphere|Bloch sphere]]: <<qc-l6-equator|relative phase sets the longitude>>. The notes’ $e^{i\\phi}$ in $|{+n}\\rangle$ (eq. 1.4, p. 12) is this phase.',
    caption: 'turn one arrow: the chances stay ½ and ½, the sum of the arrows shrinks',
    captionFormal: `$|a_0|^2 = |a_1|^2 = \\tfrac12$ for every $\\varphi$; $|a_0 + a_1|^2$ = 2, ${d(V.f1RelSum60, 1)}, 1, 0 at 0°, 60°, 90°, 180°`,
    stage: amp({ state: equator(sweep(0, 180)), dials: true, sum: [0, 1] }),
    fidelity: ['qc-amp-hue-is-phase'],
    claims: [
      C.relProb,
      claim('f1RelSum0', '|a₀ + a₁|² = 2 at φ = 0', () => close(V.f1RelSum0, 2)),
      claim('f1RelSum60', '|a₀ + a₁|² = 1.5 at φ = 60°', () => close(V.f1RelSum60, 1.5)),
      claim('f1RelSum90', '|a₀ + a₁|² = 1 at φ = 90°', () => close(V.f1RelSum90, 1)),
      claim('f1RelSum180', '|a₀ + a₁|² = 0 at φ = 180°', () => close(V.f1RelSum180, 0)),
    ],
  },
  {
    id: 'f1-phase:b5',
    phase: 'books',
    text: 'Bergou sends one photon along two paths and joins them again. One exit collects the number $(e^{i\\varphi_0} + e^{i\\varphi_1})/2$, where $\\varphi_0$ and $\\varphi_1$ are the phases picked up on the two paths. The chance the photon leaves there is that number’s size squared.',
    formal:
      'In Bergou’s Mach–Zehnder interferometer (§1.5, eq. 1.18, p. 8) one output amplitude is $(e^{i\\varphi_0} + e^{i\\varphi_1})/2$, so $P = [1 + \\cos(\\varphi_1 - \\varphi_0)]/2$. Only the phase difference matters: equal phases give 1, a difference of $\\pi$ gives 0. Chapter Q5 builds the device.',
    caption: `$\\varphi_0 = 0$, $\\varphi_1 = 60^\\circ$: probability ${d(V.f1Mz60, 2)} at this exit`,
    stage: cp({ chain: { phasesDeg: [0, 60], sizes: [0.5, 0.5] } }),
    refs: [bergou('§1.5, pp. 7–8 (eq. 1.18, Fig. 1.7)', 'A phase shifter between two beam splitters: the output chances depend only on the difference of the two path phases.')],
    claims: [
      claim('f1Mz60', '|(1 + e^{iπ/3})/2|² = 0.75', () => close(V.f1Mz60, 0.75)),
      claim('f1MzEqual', 'equal phases give probability 1', () => close(V.f1MzEqual, 1)),
      claim('f1MzPi', 'a phase difference of π gives probability 0', () => close(V.f1MzPi, 0)),
    ],
  },
  {
    id: 'f1-phase:b6',
    phase: 'books',
    text: 'The notes build two states from one recipe, with a phase $\\delta$ (delta) on the second amplitude. Giving the first state $\\delta = 0$ is a free choice: $(1/\\sqrt2, 1/\\sqrt2)$. The second must be fully distinct, so that a suitable measurement always tells the two apart. That needs $1 + e^{i\\delta} = 0$, two arrows that cancel, so $\\delta = \\pi$: $(1/\\sqrt2, -1/\\sqrt2)$. A minus sign is simply the phase $e^{i\\pi} = -1$.',
    formal:
      'The notes (p. 7) write the states along $\\pm x$ as $\\alpha|{+z}\\rangle + e^{i\\delta_\\pm}\\beta|{-z}\\rangle$ with $|\\alpha| = |\\beta|$. They fix $\\delta_+ = 0$, a convention; [[orthogonal|orthogonality]] of $|{+x}\\rangle$ and $|{-x}\\rangle$ then forces $\\delta_- = \\pi$, whereas a global $-1$ changes nothing: <<qc-l7-full-turn|a full turn flips the sign>>. Relative phase depends on the basis: in the basis $|{\\pm x}\\rangle$ this pair reads $(1, 0)$ and $(0, 1)$, no longer a phase apart (N&C ⚑, p. 93). A global phase survives every change of basis.',
    caption: 'a relative phase of $\\pi$ makes a different state',
    captionFormal: '$\\langle{+x}|{-x}\\rangle = 0$, but $-|{+x}\\rangle$ is the state $|{+x}\\rangle$',
    stage: amp({ state: equator(sweep(0, 180)), dials: true }),
    refs: [
      notes('709 notes p. 7', 'The two states along $\\pm x$ differ only in the phase of the second amplitude: 0 by convention for the first, and then $\\pi$ for the second.'),
      nc('§2.2.7, p. 93 (eq. 2.121; Ex. 2.65)', 'N&C ⚑ Ex. 2.65: the same pair $(|0\\rangle \\pm |1\\rangle)/\\sqrt2$, rewritten in the basis they form, where no relative phase is left. A global phase is invisible, a relative phase is not, and which is which depends on the basis. No course sheet assigns it.'),
    ],
    claims: [
      C.expiPi,
      claim('f1XOrth', '⟨+x|−x⟩ = 0', () => close(V.f1XOrth, 0)),
      claim('f1XinX', '⟨+x|+x⟩ = 1: in its own basis |+x⟩ reads (1, 0)', () => close(V.f1XinX, 1)),
      claim('f1GlobalMinus', '−|+x⟩ is the same physical state as |+x⟩', () => V.f1GlobalMinus === 1),
    ],
  },
  {
    id: 'f1-phase:b7',
    phase: 'clue',
    text: 'Three arrows of size 1 point at 0°, 120° and 240°. What is their sum?',
    formal: 'Evaluate the sum $1 + e^{2\\pi i/3} + e^{4\\pi i/3}$ without computing a cosine.',
    stage: cp({ spokes: { phasesDeg: [0, 120, 240] } }),
    reveal: {
      text: 'Zero. Placed tip to tail, they close an equal-sided triangle and return to the start. Also, turning the set by 120° gives the same set, so the sum equals itself turned; only zero does that.',
      formal:
        'With $\\omega = e^{2\\pi i/3}$ and $s = 1 + \\omega + \\omega^2$, $\\omega s = \\omega + \\omega^2 + \\omega^3 = s$ because $\\omega^3 = 1$; since $\\omega \\ne 1$, $s = 0$. For every $N \\ge 2$ the full set of $N$-th roots of unity sums to zero the same way; Chapter F4 builds this.',
      caption: 'tip to tail, the three arrows close a triangle',
      captionFormal: '$1 + \\omega + \\omega^2 = 0$',
      stage: cp({ chain: { phasesDeg: [0, 120, 240] } }),
      claims: [claim('f1Three', '1 + e^{2πi/3} + e^{4πi/3} = 0', () => close(V.f1Three, 0))],
    },
  },
]

export const F1_STORY: Record<string, Beat[]> = {
  'f1-number-line': numberLine,
  'f1-plane': plane,
  'f1-multiply': multiply,
  'f1-euler': euler,
  'f1-phase': phase,
}
