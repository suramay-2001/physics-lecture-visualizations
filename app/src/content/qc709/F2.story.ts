/**
 * Chapter F2 story beats, both tracks (plan: docs/roles/proposals/P-F2-story.md §1–2). Ids `<unit>:b<n>`. Phases:
 * `'core'` [L] the ramp, `'books'` [B] a second source, `'clue'` [C]. F2 is a Foundations chapter (no lecture notes),
 * so it never uses `'lecture'` (interface change W-709 #2).
 *
 * Glossary-id notes (see F2.glossary.ts header): `[[qc-ket]]`, `[[qc-bra]]`, `[[qc-inner-product]]`, `[[qc-norm]]`,
 * `[[qc-basis]]`, `[[qc-dimension]]` and `[[qc-outer-product]]` resolve to Q1's/Q2's/Q6's existing entries (this
 * chapter does not redefine them, and no beat here lists them in `introduces`). `qc-complex-vector-space`,
 * `qc-orthogonal`, `qc-linear-independence`, `qc-orthonormal-frame` and `qc-shadow` are this chapter's own new ids.
 * The plan's forward bridge to F3 (`f2-orthonormal:b4`, "the same map in a new frame") is written as plain prose
 * instead of a `<<bridge>>` tag: F3 is being built in a parallel worktree, so a bridge to it would dangle.
 */
import type { Beat } from '../schema'
import { claim, close, V } from './F2.values'

export const F2_STORY: Record<string, Beat[]> = {
  /* ============================================================ f2-vectors ============================================================ */
  'f2-vectors': [
    {
      id: 'f2-vectors:b1',
      phase: 'core',
      introduces: ['qc-complex-vector-space'],
      text: 'A quantum state is written as a [[qc-ket|ket]], $|\\psi\\rangle$. In the simplest case it is a short list of [[qc-complex-number|complex]] numbers from F1. A spin can point up or down, so its ket is a list of two: $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$. The two numbers $\\alpha$ and $\\beta$ are complex.',
      formal:
        'A ket $|\\psi\\rangle$ is a vector in [[qc-complex-vector-space|$\\mathbb C^n$]], the space of length-$n$ lists of complex numbers (Axler §1A; N&C Fig. 2.1). A qubit lives in $\\mathbb C^2$: $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ with $\\alpha, \\beta \\in \\mathbb C$ and basis kets $|0\\rangle = |{+}z\\rangle$, $|1\\rangle = |{-}z\\rangle$ (notes n1 §I.B).',
      caption: 'a qubit’s two numbers written as a column',
      captionFormal: '$|\\psi\\rangle \\in \\mathbb C^2$: a column $(\\alpha, \\beta)^{\\mathsf T}$',
      stage: { kind: 'amplitudes', state: { ket: '+x' }, labels: 'bits' },
      claims: [claim('f2PlusXAmps', 'the amplitudes of |+x⟩', () => close(V.f2PlusXAmps, 0.7071, 5e-5))],
      refs: [],
    },
    {
      id: 'f2-vectors:b2',
      phase: 'core',
      text: 'Two states add by adding their lists, number by number, and you scale a state by multiplying every number by one scalar. These moves obey the rules you expect: order does not matter, there is a zero state, and every state has a negative. A set with these rules is a [[qc-vector-space|vector space]].',
      formal:
        '$\\mathbb C^n$ with componentwise addition and scalar multiplication is a vector space (Axler 1.20; notes n1 §I.B.2): addition is commutative and associative, with identity $0$ and inverse $-|\\psi\\rangle$, and scaling distributes over both sums. A [[qc-superposition|superposition]] $c_1|\\psi_1\\rangle + c_2|\\psi_2\\rangle$ is again a state.',
      caption: 'tip to tail: $|\\alpha\\rangle + |\\beta\\rangle$ is the diagonal of the parallelogram',
      stage: { kind: 'hilbert-plane', sumOf: ['+z', '+x'], ticks: true },
      refs: [{ source: 'lecture', where: 'notes n1 p. 3, Fig. 2', adds: 'addition is the parallelogram diagonal' }],
      claims: [claim('f2SumZX', '|+z⟩ + |+x⟩ has length', () => close(V.f2SumZX, 1.8478, 5e-5))],
    },
    {
      id: 'f2-vectors:b3',
      phase: 'core',
      text: 'The course’s first space is the two complex numbers of a spin. In the z frame, $|{+}z\\rangle$ is the list $(1, 0)$ and $|{-}z\\rangle$ is $(0, 1)$. Then $|{+}x\\rangle = (|{+}z\\rangle + |{-}z\\rangle)/\\sqrt2$, the list $(1/\\sqrt2,\\ 1/\\sqrt2)$. <<qc-l1-vectors|Spin Lab 1 Vectors for spin>>',
      formal:
        'In the $\\{|{+}z\\rangle, |{-}z\\rangle\\}$ frame, $|{+}z\\rangle = (1, 0)$ and $|{-}z\\rangle = (0, 1)$; the notes fix $|{\\pm}x\\rangle = (|{+}z\\rangle \\pm |{-}z\\rangle)/\\sqrt2$ (n2 eqs. 1.1–1.2). Each component is the complex amplitude F1 introduced; its size squared is a probability (Chapter Q1 owns that reading).',
      caption: '$|{+}x\\rangle = 0.7071,\\ 0.7071$ in the z frame',
      captionFormal: '$|{+}x\\rangle = \\tfrac1{\\sqrt2}(|{+}z\\rangle + |{-}z\\rangle)$',
      stage: {
        layout: 'split',
        top: { kind: 'hilbert-plane', psi: '+x', others: [{ ket: '+z', role: 'basis' }, { ket: '-z', role: 'basis' }], basis: 'z' },
        bottom: { kind: 'amplitudes', state: { ket: '+x' }, labels: 'bits' },
      },
      claims: [
        claim('f2PlusXAmps', 'the amplitudes of |+x⟩ again', () => close(V.f2PlusXAmps, 0.7071, 5e-5)),
        claim('f2PlusZAmps', '|+z⟩', () => close(V.f2PlusZAmps, 1)),
      ],
    },
    {
      id: 'f2-vectors:b4',
      phase: 'books',
      text: 'A set of states spans the space if every state is some combination of them. N&C gives two spanning sets for the spin space: the z pair $(1, 0), (0, 1)$, and the x pair $(1/\\sqrt2, 1/\\sqrt2), (1/\\sqrt2, -1/\\sqrt2)$. Either pair builds any state.',
      formal:
        'A list spans $V$ if every vector is a linear combination of it (N&C §2.1.1). For $\\mathbb C^2$ both the computational pair and the $|{\\pm}x\\rangle$ pair span: any $(a_1, a_2) = a_1|0\\rangle + a_2|1\\rangle = \\tfrac{a_1 + a_2}{\\sqrt2}|{+}x\\rangle + \\tfrac{a_1 - a_2}{\\sqrt2}|{-}x\\rangle$ (N&C eq. 2.8).',
      caption: 'the same state built from the z pair or the x pair',
      stage: {
        layout: 'split',
        top: { kind: 'hilbert-plane', psi: { planeDeg: 30 }, others: [{ ket: '+z', role: 'basis' }, { ket: '-z', role: 'basis' }], basis: 'z' },
        bottom: { kind: 'hilbert-plane', psi: { planeDeg: 30 }, others: [{ ket: '+x', role: 'basis' }, { ket: '-x', role: 'basis' }], basis: 'x' },
      },
      refs: [{ source: 'nc', where: '§2.1.1 p. 62', adds: 'two spanning sets for $\\mathbb C^2$, eqs. 2.5–2.8' }],
      claims: [
        claim('f2PlusXAmps', '|+x⟩ amplitudes', () => close(V.f2PlusXAmps, 0.7071, 5e-5)),
        claim('f2MinusXAmps', '|-x⟩ amplitude size', () => close(V.f2MinusXAmps, 0.7071, 5e-5)),
      ],
    },
    {
      id: 'f2-vectors:b5',
      phase: 'clue',
      text: 'The three states $(1, 0)$, $(0, 1)$ and $(1, 1)$ all live in the spin space. Can all three be needed to build every state, or is one of them spare?',
      formal: 'Are $(1, 0)$, $(0, 1)$, $(1, 1)$ in $\\mathbb C^2$ linearly independent?',
      stage: {
        kind: 'hilbert-plane',
        others: [
          { ket: '+z', role: 'ghost', badge: '(1,0)' },
          { ket: '-z', role: 'ghost', badge: '(0,1)' },
          { ket: '+x', role: 'ghost', badge: '(1,1)' },
        ],
      },
      reveal: {
        text: 'One is spare. The third is the first plus the second, so two already build everything. A space where two is the most you can have is called two-dimensional, which is why a spin needs exactly two numbers.',
        formal:
          'They are dependent: $(1,1) = (1,0) + (0,1)$, so $1\\cdot(1,0) + 1\\cdot(0,1) - 1\\cdot(1,1) = 0$ with nonzero coefficients. The largest independent set in $\\mathbb C^2$ has length $2 = \\dim \\mathbb C^2$ (notes n2 §I.C.1); Chapter Q1’s qubit is this $\\dim = 2$.',
        caption: '$(1,1) = (1,0) + (0,1)$: three arrows, two directions',
        stage: { kind: 'hilbert-plane', sumOf: ['+z', '-z'] },
        claims: [claim('f2DepThree', '(1,0),(0,1),(1,1) are linearly dependent', () => V.f2DepThree === 0)],
      },
    },
  ],

  /* ========================================================= f2-inner-product ========================================================= */
  'f2-inner-product': [
    {
      id: 'f2-inner-product:b1',
      phase: 'core',
      text: 'To every ket $|\\alpha\\rangle$ belongs a [[qc-bra|bra]] $\\langle\\alpha|$, its partner. Put a bra against a ket and you get one complex number, the [[qc-inner-product|inner product]] $\\langle\\alpha|\\beta\\rangle$. For lists, multiply matching numbers and add, but first mirror ([[qc-conjugate|conjugate]]) the bra’s numbers: $\\langle\\alpha|\\beta\\rangle = a_1^* b_1 + a_2^* b_2$.',
      formal:
        'The inner product is a map $\\mathbb C^n \\times \\mathbb C^n \\to \\mathbb C$, $\\langle\\alpha|\\beta\\rangle = \\sum_i a_i^* b_i$ (notes n1 §I.B.3; N&C eq. 2.14). The bra $\\langle\\alpha|$ is the dual vector to $|\\alpha\\rangle$, a row of conjugated entries; $\\langle\\alpha|\\beta\\rangle = \\langle\\alpha|\\,|\\beta\\rangle$ is the row-times-column product.',
      caption: '$\\langle\\alpha|\\beta\\rangle$: mirror the bra, multiply, add',
      captionFormal: '$\\langle\\alpha|\\beta\\rangle = \\sum_i a_i^* b_i$',
      stage: {
        layout: 'split',
        top: { kind: 'amplitudes', state: { ket: '+x' }, dials: true },
        bottom: { kind: 'complex-plane', z: { re: 0.7071, im: 0 } },
      },
      claims: [claim('f2InnerZX', '⟨+z|+x⟩', () => close(V.f2InnerZX, 0.7071, 5e-5))],
    },
    {
      id: 'f2-inner-product:b2',
      phase: 'core',
      text: 'The inner product obeys four rules. A state with itself gives a number that is real and never negative; it is zero only for the zero state. Swapping the two states conjugates the answer: $\\langle\\beta|\\alpha\\rangle = \\langle\\alpha|\\beta\\rangle^*$. And it is linear in the ket on the right.',
      formal:
        'An inner product satisfies (Axler 6.2; N&C 2.13–2.15): positivity $\\langle\\alpha|\\alpha\\rangle \\ge 0$ with equality iff $\\alpha = 0$; conjugate symmetry $\\langle\\beta|\\alpha\\rangle = \\langle\\alpha|\\beta\\rangle^*$; linearity in the second slot $\\langle\\alpha|\\,c_1\\beta + c_2\\gamma\\rangle = c_1\\langle\\alpha|\\beta\\rangle + c_2\\langle\\alpha|\\gamma\\rangle$; hence conjugate-linearity in the first, $\\langle c_1\\beta + c_2\\gamma|\\alpha\\rangle = c_1^*\\langle\\beta|\\alpha\\rangle + c_2^*\\langle\\gamma|\\alpha\\rangle$.',
      caption: 'swap the two states and the answer conjugates',
      captionFormal:
        'Rosetta: Axler’s $\\langle u, v\\rangle$ is linear in the first slot, so Axler’s $\\langle u, v\\rangle$ = our $\\langle v|u\\rangle$; N&C’s $(\\cdot,\\cdot)$ = our $\\langle\\cdot|\\cdot\\rangle$',
      stage: {
        layout: 'split',
        top: { kind: 'complex-plane', z: { re: 0.5, im: 0.5 }, show: ['conj'] },
        bottom: { kind: 'complex-plane', z: { re: 0.5, im: -0.5 } },
      },
      refs: [
        { source: 'axler', where: '6.2 p. 183', adds: 'the definition and the first-slot convention' },
        { source: 'lecture', where: 'notes n1 p. 4', adds: 'the physics convention, conjugate-linear in the bra' },
      ],
      claims: [
        claim('f2InnerXY', '⟨+x|+y⟩ real part', () => close(V.f2InnerXY, 0.5, 5e-5)),
        claim('f2InnerYX', '⟨+y|+x⟩ real part', () => close(V.f2InnerYX, 0.5, 5e-5)),
      ],
    },
    {
      id: 'f2-inner-product:b3',
      phase: 'core',
      text: 'Why mirror the bra? So that a state with itself has an honest, non-negative size. Take $|{+}y\\rangle = (1/\\sqrt2,\\ i/\\sqrt2)$. With the mirror, $\\langle{+}y|{+}y\\rangle = 1$. Without it, the plain sum of squares is $\\tfrac12 + \\tfrac{i^2}2 = 0$: a nonzero state would have length zero.',
      formal:
        'Conjugation makes $\\langle\\alpha|\\alpha\\rangle = \\sum_i |a_i|^2 \\ge 0$ the squared length. The bare bilinear $\\sum_i a_i b_i$ fails: for $|{+}y\\rangle = (1/\\sqrt2, i/\\sqrt2)$ it gives $\\tfrac12 + \\tfrac{i^2}2 = 0$ (the engine’s `bilinear`, the “forgot to conjugate” product), while $\\langle{+}y|{+}y\\rangle = \\tfrac12 + \\left|\\tfrac{i}{\\sqrt2}\\right|^2 = 1$.',
      caption: '$|{+}y\\rangle$ with the mirror: 1; without: 0',
      captionFormal: '$\\langle{+}y|{+}y\\rangle = 1$, but $\\sum a_i^2 = 0$',
      stage: { kind: 'amplitudes', state: { ket: '+y' }, dials: true },
      derivation: {
        result: '\\langle{+}y|{+}y\\rangle = 1 \\ne \\textstyle\\sum_i a_i^2 = 0',
        ground: [
          {
            tex: '|{+}y\\rangle = (1/\\sqrt2,\\ i/\\sqrt2)',
            why: 'The y-up spin needs an $i$ (F1): second amplitude of size $1/\\sqrt2$ at $90°$.',
            view: { kind: 'amplitudes', state: { ket: '+y' }, dials: true },
            viewCaption: 'two bars; the second’s hue is $90°$',
          },
          {
            tex: '\\textstyle\\sum_i a_i a_i = \\tfrac12 + \\tfrac{i^2}2 = 0',
            why: 'Multiply matching numbers with no mirror: the second term is $i^2/2 = -\\tfrac12$.',
            view: { kind: 'complex-plane', z: { re: 0, im: 0 } },
            viewCaption: 'the bare product lands on $0$',
          },
          {
            tex: '\\langle{+}y|{+}y\\rangle = \\tfrac12 + \\left|\\tfrac{i}{\\sqrt2}\\right|^2 = 1',
            why: 'Mirror the bra first: each term is a size squared, never negative.',
            view: { kind: 'complex-plane', z: { re: 1, im: 0 } },
            viewCaption: 'with the mirror, the answer is $1$',
          },
          { tex: '\\langle{+}y|{+}y\\rangle = 1 \\ne \\textstyle\\sum_i a_i^2 = 0', why: 'Only the mirrored product gives an honest length.' },
        ],
        formal: [
          {
            tex: '\\textstyle\\sum_i a_i^2 = \\tfrac12 + \\tfrac{i^2}2 = 0',
            why: 'The bilinear form vanishes on $|{+}y\\rangle$ (engine `bilinear`).',
            view: { kind: 'complex-plane', z: { re: 0, im: 0 } },
          },
          { tex: '\\langle{+}y|{+}y\\rangle = \\sum_i |a_i|^2 = 1', why: 'Conjugation makes the self-product the squared norm.', view: { kind: 'complex-plane', z: { re: 1, im: 0 } } },
        ],
      },
      fidelity: ['qc-amp-hue-is-phase'],
      claims: [
        claim('f2InnerYY', '⟨+y|+y⟩', () => close(V.f2InnerYY, 1, 5e-5)),
        claim('f2BilinearYY', 'bilinear(+y,+y) with no conjugate', () => close(V.f2BilinearYY, 0)),
      ],
    },
    {
      id: 'f2-inner-product:b4',
      phase: 'books',
      text: 'There is more than one inner product. Give each direction a positive weight and you get another honest inner product. Physics uses this when the natural units differ along different axes. The plain one, with all weights 1, is the default.',
      formal:
        'Any Hermitian positive-definite $M$ gives an inner product $\\langle\\alpha|\\beta\\rangle_M = \\alpha^\\dagger M \\beta$ (Axler 6.3(b) for positive weights $c_i$; notes n1 p. 5 for $M$ Hermitian with positive eigenvalues; the engine’s `weightedInner`). With $M = I$ this is the Euclidean product, the default for $\\mathbb C^n$ (Axler 6.4).',
      caption: 'weights $(2, 1)$: $\\langle{+}x|{+}z\\rangle_M = 1.4142$',
      stage: { kind: 'amplitudes', state: { ket: '+x' }, labels: 'bits' },
      refs: [
        { source: 'axler', where: '6.3 p. 184', adds: 'a weighted inner product with positive weights' },
        { source: 'lecture', where: 'notes n1 p. 5', adds: 'the Hermitian positive-definite $M$ form' },
      ],
      claims: [claim('f2WeightedXZ', '⟨+x|+z⟩ weighted by diag(2,1)', () => close(V.f2WeightedXZ, 1.4142, 5e-5))],
    },
    {
      id: 'f2-inner-product:b5',
      phase: 'clue',
      text: 'The states $|{+}x\\rangle$ and $|{+}y\\rangle$ are both built from up and down in equal sizes. Is their inner product zero, or something else?',
      formal: 'Compute $\\langle{+}x|{+}y\\rangle$ and $|\\langle{+}x|{+}y\\rangle|^2$.',
      stage: {
        layout: 'split',
        top: { kind: 'amplitudes', state: { ket: '+x' }, dials: true },
        bottom: { kind: 'amplitudes', state: { ket: '+y' }, dials: true },
      },
      reveal: {
        text: 'Not zero. It is $0.5 + 0.5i$, of size $1/\\sqrt2$. Its size squared is $\\tfrac12$: the chance an x-up spin passes a y-up test. Equal sizes along up and down do not make two states the same, because the phases differ. <<qc-f1-phase|F1.5 Phases you can and cannot see>>',
        formal:
          '$\\langle{+}x|{+}y\\rangle = \\tfrac12 + \\tfrac{i}2$, so $|\\langle{+}x|{+}y\\rangle|^2 = \\tfrac12$ (Chapter Q1 reads this as a transition probability). The relative [[qc-phase|phase]] from F1, not just the sizes, fixes the overlap. <<qc-f1-phase|F1.5 Phases you can and cannot see>>',
        caption: '$|\\langle{+}x|{+}y\\rangle|^2 = 0.5$',
        stage: { kind: 'complex-plane', z: { re: 0.5, im: 0.5 }, show: ['modulus'] },
        claims: [
          claim('f2InnerXY', '⟨+x|+y⟩ real part again', () => close(V.f2InnerXY, 0.5, 5e-5)),
          claim('f2InnerXYabs2', '|⟨+x|+y⟩|²', () => close(V.f2InnerXYabs2, 0.5, 5e-5)),
        ],
      },
    },
  ],

  /* ========================================================== f2-norm-angle ============================================================ */
  'f2-norm-angle': [
    {
      id: 'f2-norm-angle:b1',
      phase: 'core',
      text: 'The length of a state, its [[qc-norm|norm]] $\\|\\psi\\|$, is the square root of its inner product with itself: $\\|\\psi\\| = \\sqrt{\\langle\\psi|\\psi\\rangle}$. For $(a, b)$ with real parts this is Pythagoras, $\\sqrt{a^2 + b^2}$. A state of length 1 is called a unit state; every physical spin is one.',
      formal:
        'The [[qc-modulus|norm]] is $\\|\\psi\\| = \\sqrt{\\langle\\psi|\\psi\\rangle} = \\sqrt{\\sum_i |c_i|^2}$ (Axler 6.7; N&C 2.16). It vanishes only at $\\psi = 0$ and scales as $\\|\\lambda\\psi\\| = |\\lambda|\\,\\|\\psi\\|$ (Axler 6.9). A normalized (unit) state has $\\|\\psi\\| = 1$; normalizing divides by the norm.',
      caption: '$\\|{+}x\\| = 1$, a unit state',
      captionFormal: '$\\|\\psi\\| = \\sqrt{\\langle\\psi|\\psi\\rangle}$',
      stage: { kind: 'hilbert-plane', psi: { planeDeg: 30 }, ticks: true },
      claims: [
        claim('f2NormZplusX', 'the length of |+z⟩ + |+x⟩', () => close(V.f2NormZplusX, 1.8478, 5e-5)),
        claim('f2NormPlusX', '‖+x‖', () => close(V.f2NormPlusX, 1)),
      ],
    },
    {
      id: 'f2-norm-angle:b2',
      phase: 'core',
      introduces: ['qc-orthogonal'],
      text: 'Two states are [[qc-orthogonal|orthogonal]] when their inner product is zero. For real arrows this means a right angle. Up and down are orthogonal: $\\langle{+}z|{-}z\\rangle = 0$. So are x-up and x-down: $\\langle{+}x|{-}x\\rangle = 0$, even though both mix up and down.',
      formal:
        '$|\\alpha\\rangle \\perp |\\beta\\rangle$ iff $\\langle\\alpha|\\beta\\rangle = 0$ (Axler 6.10); the order does not matter, by conjugate symmetry. The computational basis is orthogonal, $\\langle{+}z|{-}z\\rangle = 0$, as is the x basis, $\\langle{+}x|{-}x\\rangle = 0$. Orthogonal in state space is not opposite in the lab (notes n2 Fig. 5).',
      caption: '$|{+}x\\rangle \\perp |{-}x\\rangle$: a right angle in the plane',
      captionFormal: '$\\langle{+}x|{-}x\\rangle = 0$',
      stage: { kind: 'hilbert-plane', psi: '+x', others: [{ ket: '-x', role: 'second' }], rightAngle: true },
      fidelity: ['qc-plane-vectors-not-states'],
      claims: [
        claim('f2OrthXmX', '⟨+x|-x⟩', () => close(V.f2OrthXmX, 0)),
        claim('f2OrthZmZ', '⟨+z|-z⟩', () => close(V.f2OrthZmZ, 0)),
      ],
    },
    {
      id: 'f2-norm-angle:b3',
      phase: 'core',
      text: 'When two states are orthogonal, their lengths combine by Pythagoras. Add $|{+}x\\rangle$ and $|{-}x\\rangle$: the result has length squared $1 + 1 = 2$. Check it directly: the sum is $(\\sqrt2,\\ 0)$, whose length squared is 2.',
      formal:
        'For $\\langle\\alpha|\\beta\\rangle = 0$, $\\|\\alpha + \\beta\\|^2 = \\|\\alpha\\|^2 + \\|\\beta\\|^2$ (Pythagorean theorem, Axler 6.12). Here $\\||{+}x\\rangle + |{-}x\\rangle\\|^2 = 2 = \\||{+}x\\rangle\\|^2 + \\||{-}x\\rangle\\|^2$; the sum $(\\sqrt2, 0) = \\sqrt2\\,|{+}z\\rangle$.',
      caption: 'orthogonal: lengths² add, $1 + 1 = 2$',
      captionFormal: '$\\|\\alpha + \\beta\\|^2 = \\|\\alpha\\|^2 + \\|\\beta\\|^2$',
      stage: { kind: 'hilbert-plane', sumOf: ['+x', '-x'], rightAngle: true },
      claims: [claim('f2PythVal', '‖+x⟩ + |-x⟩‖2', () => close(V.f2PythVal, 2, 5e-5))],
    },
    {
      id: 'f2-norm-angle:b4',
      phase: 'core',
      text: 'For real states the inner product measures the angle. Drop a perpendicular from one arrow onto the other, as the notes’ Fig. 3 does: the shadow has length $\\|\\beta\\|\\cos\\theta$, and $\\langle\\alpha|\\beta\\rangle = \\|\\alpha\\|\\,\\|\\beta\\|\\cos\\theta$. For $|{+}z\\rangle$ and $|{+}x\\rangle$ this gives $\\cos\\theta = 1/\\sqrt2$, so $\\theta = 45°$. This $\\theta$ lives in state space, not the lab: a Bloch (lab) angle is twice as large.',
      formal:
        'For nonzero real vectors, $\\operatorname{Re}\\langle\\alpha|\\beta\\rangle = \\|\\alpha\\|\\,\\|\\beta\\|\\cos\\theta$ (Axler 6A Exercise 15; notes n1 Fig. 3), so $\\theta = \\arccos\\!\\big(\\operatorname{Re}\\langle\\alpha|\\beta\\rangle / \\|\\alpha\\|\\|\\beta\\|\\big) \\in [0, \\pi]$ (the engine’s `angleBetween`). $\\langle{+}z|{+}x\\rangle = 1/\\sqrt2 \\Rightarrow \\theta = 45°$, the notes’ $|{\\pm}x\\rangle$-frame tilt — a state-space angle, half its Bloch (lab) counterpart.',
      caption: '$|{+}z\\rangle$ to $|{+}x\\rangle$: $45°$',
      captionFormal: '$\\cos\\theta = \\langle{+}z|{+}x\\rangle = 1/\\sqrt2$, $\\theta = 45°$',
      stage: { kind: 'hilbert-plane', psi: '+x', others: [{ ket: '+z', role: 'basis' }], arc: true, arcLabel: '$\\theta$', shadows: true },
      derivation: {
        result: '\\operatorname{Re}\\langle\\alpha|\\beta\\rangle = \\|\\alpha\\|\\,\\|\\beta\\|\\cos\\theta',
        ground: [
          {
            tex: 'e = \\alpha/\\|\\alpha\\|',
            why: 'Point a unit arrow $e$ along $\\alpha$, so lengths are easy to read.',
            view: { kind: 'hilbert-plane', psi: '+z', others: [{ ket: '+x', role: 'second' }] },
            viewCaption: 'the two arrows from one origin',
          },
          {
            tex: '\\text{shadow of }\\beta\\text{ on }e = \\langle e|\\beta\\rangle',
            why: 'Drop a perpendicular from $\\beta$’s tip onto $e$ (notes’ Fig. 3); its signed length is $\\langle e|\\beta\\rangle$.',
            view: { kind: 'hilbert-plane', psi: '+x', others: [{ ket: '+z', role: 'basis' }], shadows: true },
            viewCaption: 'the shadow on $e$',
          },
          {
            tex: '\\langle e|\\beta\\rangle = \\|\\beta\\|\\cos\\theta',
            why: 'In the right triangle, the shadow is $\\|\\beta\\|$ times $\\cos$ of the angle $\\theta$ between them.',
            view: { kind: 'hilbert-plane', psi: '+x', others: [{ ket: '+z', role: 'basis' }], arc: true, arcLabel: '$\\theta$' },
            viewCaption: 'the angle $\\theta$',
          },
          { tex: '\\operatorname{Re}\\langle\\alpha|\\beta\\rangle = \\|\\alpha\\|\\,\\|\\beta\\|\\cos\\theta', why: 'Multiply back by $\\|\\alpha\\|$; the real part is all that survives for real arrows.' },
          {
            tex: '\\theta = 45°\\text{ for }|{+}z\\rangle, |{+}x\\rangle',
            why: 'Here $\\cos\\theta = \\langle{+}z|{+}x\\rangle = 1/\\sqrt2$.',
            view: { kind: 'hilbert-plane', psi: '+x', others: [{ ket: '+z', role: 'basis' }], arc: true, arcLabel: '$45°$' },
            viewCaption: '$\\theta = 45°$',
          },
        ],
        formal: [
          {
            tex: '\\operatorname{Re}\\langle\\alpha|\\beta\\rangle / (\\|\\alpha\\|\\|\\beta\\|) = \\cos\\theta',
            why: 'Axler 6A Ex. 15; `angleBetween` returns $\\arccos$ of this.',
            view: { kind: 'hilbert-plane', psi: '+x', others: [{ ket: '+z', role: 'basis' }], shadows: true },
          },
          {
            tex: '\\theta = \\arccos(1/\\sqrt2) = 45°',
            why: 'For $|{+}z\\rangle, |{+}x\\rangle$.',
            view: { kind: 'hilbert-plane', psi: '+x', others: [{ ket: '+z', role: 'basis' }], arc: true, arcLabel: '$45°$' },
          },
        ],
      },
      claims: [
        claim('f2AngleZX', 'angle between |+z⟩ and |+x⟩, in degrees', () => close(V.f2AngleZX, 45, 5e-3)),
        claim('f2InnerZX', '⟨+z|+x⟩ once more', () => close(V.f2InnerZX, 0.7071, 5e-5)),
      ],
    },
    {
      id: 'f2-norm-angle:b5',
      phase: 'books',
      text: 'A shadow is never longer than the arrow it came from. In symbols, $|\\langle\\alpha|\\beta\\rangle| \\le \\|\\alpha\\|\\,\\|\\beta\\|$. From it follows the triangle rule: two arrows laid end to end never reach farther than their lengths added, $\\|\\alpha + \\beta\\| \\le \\|\\alpha\\| + \\|\\beta\\|$, extending F1’s $|z+w|\\le|z|+|w|$ from numbers to states. <<qc-f1-plane|F1.2 Numbers as points and arrows>>',
      formal:
        'Cauchy–Schwarz: $|\\langle\\alpha|\\beta\\rangle| \\le \\|\\alpha\\|\\,\\|\\beta\\|$, equality iff one is a scalar multiple of the other (Axler 6.14, from the orthogonal decomposition 6.13). The [[qc-triangle-inequality|triangle inequality]] $\\|\\alpha + \\beta\\| \\le \\|\\alpha\\| + \\|\\beta\\|$ follows (Axler 6.17); it extends F1’s $|z + w| \\le |z| + |w|$ to vectors.',
      caption: 'the sum’s arrow is no longer than the two lengths added',
      captionFormal: '$\\|\\alpha + \\beta\\| \\le \\|\\alpha\\| + \\|\\beta\\|$',
      stage: { kind: 'hilbert-plane', sumOf: ['+z', '-z'] },
      derivation: {
        result: '\\|\\alpha + \\beta\\| \\le \\|\\alpha\\| + \\|\\beta\\|',
        ground: [
          {
            tex: '\\alpha = c\\beta + w,\\ \\ \\langle w|\\beta\\rangle = 0,\\ c = \\langle\\beta|\\alpha\\rangle/\\|\\beta\\|^2',
            why: 'Split $\\alpha$ into a part along $\\beta$ and a part at a right angle (the shadow and its leftover).',
            view: { kind: 'hilbert-plane', psi: '+z', others: [{ ket: '+x', role: 'basis' }], project: 1, shadows: true },
            viewCaption: 'shadow + leftover',
          },
          {
            tex: '\\|\\alpha\\|^2 = |c|^2\\|\\beta\\|^2 + \\|w\\|^2 \\ge |\\langle\\alpha|\\beta\\rangle|^2/\\|\\beta\\|^2',
            why: 'By Pythagoras the leftover only adds length, so dropping it can only shrink.',
            view: { kind: 'hilbert-plane', sumOf: ['+z', '-z'], rightAngle: true },
            viewCaption: 'Pythagoras on the split',
          },
          { tex: '|\\langle\\alpha|\\beta\\rangle| \\le \\|\\alpha\\|\\,\\|\\beta\\|', why: 'Rearrange: the shadow is never longer than the arrow (Cauchy–Schwarz).' },
          {
            tex: '\\|\\alpha + \\beta\\|^2 = \\|\\alpha\\|^2 + \\|\\beta\\|^2 + 2\\operatorname{Re}\\langle\\alpha|\\beta\\rangle \\le (\\|\\alpha\\| + \\|\\beta\\|)^2',
            why: 'Expand the squared length and bound the cross term by Cauchy–Schwarz.',
            view: { kind: 'hilbert-plane', sumOf: ['+z', '-z'] },
            viewCaption: 'the sum’s length vs the two lengths',
          },
          { tex: '\\|\\alpha + \\beta\\| \\le \\|\\alpha\\| + \\|\\beta\\|', why: 'Take square roots; lengths are never negative.' },
        ],
        formal: [
          {
            tex: '|\\langle\\alpha|\\beta\\rangle| \\le \\|\\alpha\\|\\,\\|\\beta\\|',
            why: 'Cauchy–Schwarz from the orthogonal decomposition (Axler 6.13–6.14).',
            view: { kind: 'hilbert-plane', psi: '+z', others: [{ ket: '+x', role: 'basis' }], project: 1, shadows: true },
          },
          { tex: '\\|\\alpha + \\beta\\| \\le \\|\\alpha\\| + \\|\\beta\\|', why: 'Expand $\\|\\alpha + \\beta\\|^2$ and apply it (Axler 6.17).', view: { kind: 'hilbert-plane', sumOf: ['+z', '-z'] } },
        ],
      },
      refs: [{ source: 'axler', where: '6.13–6.14 p. 188–189, 6.17 p. 190', adds: 'Cauchy–Schwarz and the triangle inequality' }],
      claims: [
        claim('f2CS', '|⟨+z|+x⟩|', () => close(V.f2CS, 0.7071, 5e-5)),
        claim('f2TriStrict', '‖+z⟩ + |-z⟩‖', () => close(V.f2TriStrict, 1.4142, 5e-5)),
        claim('f2TriEqual', '‖(1,0) + (2,0)‖', () => close(V.f2TriEqual, 3)),
      ],
    },
    {
      id: 'f2-norm-angle:b6',
      phase: 'clue',
      text: 'When do two arrows laid end to end reach exactly as far as their lengths added? Try $(1, 0)$ with $(2, 0)$, and $(1, 0)$ with $(0, 1)$.',
      formal: 'For which pairs is $\\|\\alpha + \\beta\\| = \\|\\alpha\\| + \\|\\beta\\|$?',
      stage: { kind: 'hilbert-plane', sumOf: ['+z', '-z'] },
      reveal: {
        text: 'Only when they point the same way. $(1, 0)$ and $(2, 0)$ give $3 = 1 + 2$. But $(1, 0)$ and $(0, 1)$ give $\\sqrt2 \\approx 1.414$, short of $2$, because they turn a corner.',
        formal: 'Equality holds iff one is a nonnegative real multiple of the other (Axler 6.17), the equality case of Cauchy–Schwarz. Parallel: $\\|(3, 0)\\| = 3 = 1 + 2$; orthogonal: $\\|(1, 1)\\| = \\sqrt2 < 2$.',
        caption: 'parallel: $3 = 1 + 2$; perpendicular: $1.414 < 2$',
        stage: { kind: 'hilbert-plane', sumOf: [{ planeDeg: 0 }, { planeDeg: 0 }] },
        claims: [
          claim('f2TriEqual', '‖(1,0) + (2,0)‖ once more', () => close(V.f2TriEqual, 3)),
          claim('f2TriStrict', '‖(1,0) + (0,1)‖', () => close(V.f2TriStrict, 1.4142, 5e-5)),
        ],
      },
    },
  ],

  /* ========================================================== f2-orthonormal =========================================================== */
  'f2-orthonormal': [
    {
      id: 'f2-orthonormal:b1',
      phase: 'core',
      introduces: ['qc-linear-independence'],
      text: 'A set is [[qc-linear-independence|independent]] when the only way to combine them into the zero state is to use all-zero scalars. An independent set that also spans the space is a [[qc-basis|basis]]; its size is the space’s [[qc-dimension|dimension]]. The spin space has dimension 2.',
      formal:
        '$\\{|\\alpha_i\\rangle\\}$ is linearly independent if $\\sum_i c_i|\\alpha_i\\rangle = 0$ forces every $c_i = 0$ (notes n2 §I.C.1; N&C §2.1.1). An independent spanning set is a basis; all bases share one length, the dimension (N&C: $\\dim \\mathbb C^n = n$). The engine’s `isIndependent` tests this by Gram–Schmidt residuals.',
      caption: 'two independent arrows: a basis for the plane',
      captionFormal: '$\\dim \\mathbb C^2 = 2$',
      stage: { kind: 'hilbert-plane', others: [{ ket: '+z', role: 'basis' }, { ket: '-z', role: 'basis' }], basis: 'z' },
      claims: [
        claim('f2DepThree', '(1,0),(0,1),(1,1) dependent once more', () => V.f2DepThree === 0),
        claim('f2IndepZmZ', '{|+z⟩, |-z⟩} independent', () => V.f2IndepZmZ === 1),
      ],
    },
    {
      id: 'f2-orthonormal:b2',
      phase: 'core',
      introduces: ['qc-orthonormal-frame'],
      text: 'The nicest basis is one where every vector has length 1 and any two are orthogonal: an [[qc-orthonormal-frame|orthonormal basis]], a right-angled frame. Written with the bracket, $\\langle e_i|e_j\\rangle = \\delta_{ij}$, which is 1 when $i = j$ and 0 otherwise. The z pair and the x pair are both orthonormal frames.',
      formal:
        'An orthonormal basis has $\\langle e_i|e_j\\rangle = \\delta_{ij}$ (Axler 6.27; N&C p. 66). Such a list is automatically independent (Axler 6.25), so any orthonormal list of length $\\dim V$ is a basis (Axler 6.28). The standard basis of $\\mathbb C^n$ is orthonormal; so is $\\{|{+}x\\rangle, |{-}x\\rangle\\}$.',
      caption: 'length 1, at right angles: $\\langle e_i|e_j\\rangle = \\delta_{ij}$',
      captionFormal: '$\\{|{+}x\\rangle, |{-}x\\rangle\\}$: an orthonormal basis',
      stage: { kind: 'hilbert-plane', others: [{ ket: '+x', role: 'basis' }, { ket: '-x', role: 'basis' }], basis: 'x', rightAngle: true },
      claims: [
        claim('f2OrthXmX', '⟨+x|-x⟩ once more', () => close(V.f2OrthXmX, 0)),
        claim('f2NormPlusX', 'each frame vector has length 1', () => close(V.f2NormPlusX, 1)),
      ],
    },
    {
      id: 'f2-orthonormal:b3',
      phase: 'core',
      text: 'On an orthonormal frame the coordinates are easy: the $i$th coordinate of a state is just $\\langle e_i|\\psi\\rangle$. No equations to solve. For $|\\psi\\rangle = 0.6|0\\rangle + 0.8|1\\rangle$, the z coordinates are $0.6$ and $0.8$, read straight off.',
      formal:
        'In an orthonormal basis, $|\\psi\\rangle = \\sum_i \\langle e_i|\\psi\\rangle\\,|e_i\\rangle$, so $c_i = \\langle e_i|\\psi\\rangle$ (Axler 6.30(a); notes n2 §I.C.1). For $|\\psi\\rangle = 0.6|0\\rangle + 0.8|1\\rangle$: $c_0 = 0.6$, $c_1 = 0.8$ (the engine’s `components`, which also handles a skew basis by inverting it).',
      caption: 'coordinates are inner products: $c_i = \\langle e_i|\\psi\\rangle$',
      captionFormal: '$c_0 = 0.6$, $c_1 = 0.8$',
      stage: {
        layout: 'split',
        top: { kind: 'hilbert-plane', psi: { planeDeg: 53.13 }, others: [{ ket: '+z', role: 'basis' }, { ket: '-z', role: 'basis' }], basis: 'z', shadows: true },
        bottom: { kind: 'amplitudes', state: { dir: { thetaDeg: 106.26, phiDeg: 0 } }, mode: 'amplitude' },
      },
      derivation: {
        result: 'c_i = \\langle e_i|\\psi\\rangle,\\ \\ \\|\\psi\\|^2 = \\textstyle\\sum_i |c_i|^2',
        ground: [
          {
            tex: '|\\psi\\rangle = c_0|e_0\\rangle + c_1|e_1\\rangle',
            why: 'Write $\\psi$ in the frame, with unknown coordinates $c_0, c_1$.',
            view: { kind: 'hilbert-plane', psi: { planeDeg: 53.13 }, others: [{ ket: '+z', role: 'basis' }, { ket: '-z', role: 'basis' }], basis: 'z' },
            viewCaption: '$\\psi$ and the z frame',
          },
          {
            tex: '\\langle e_i|\\psi\\rangle = c_0\\langle e_i|e_0\\rangle + c_1\\langle e_i|e_1\\rangle',
            why: 'Take the inner product of both sides with one frame vector.',
            view: { kind: 'hilbert-plane', psi: { planeDeg: 53.13 }, others: [{ ket: '+z', role: 'basis' }, { ket: '-z', role: 'basis' }], basis: 'z', shadows: true },
            viewCaption: 'the shadows on each axis',
          },
          { tex: '\\langle e_i|\\psi\\rangle = c_i', why: 'All cross terms vanish, since $\\langle e_i|e_j\\rangle = \\delta_{ij}$. So each coordinate is one inner product.' },
          {
            tex: 'c_0 = 0.6,\\ c_1 = 0.8',
            why: 'For $|\\psi\\rangle = 0.6|0\\rangle + 0.8|1\\rangle$.',
            view: { kind: 'amplitudes', state: { dir: { thetaDeg: 106.26, phiDeg: 0 } }, mode: 'amplitude' },
            viewCaption: 'the two amplitudes as bars',
          },
          {
            tex: '\\|\\psi\\|^2 = |c_0|^2 + |c_1|^2 = 1',
            why: 'The length squared is the sum of the coordinate sizes squared (Pythagoras again).',
            view: { kind: 'hilbert-plane', psi: { planeDeg: 53.13 }, others: [{ ket: '+x', role: 'basis' }, { ket: '-x', role: 'basis' }], basis: 'x', shadows: true },
            viewCaption: 'the same $\\psi$ in the x frame: $0.9899, -0.1414$, still length 1',
          },
          { tex: 'c_i = \\langle e_i|\\psi\\rangle,\\ \\ \\|\\psi\\|^2 = \\textstyle\\sum_i |c_i|^2', why: 'Coordinates are inner products; length is frame-free.' },
        ],
        formal: [
          {
            tex: '|\\psi\\rangle = \\sum_i\\langle e_i|\\psi\\rangle|e_i\\rangle',
            why: 'Take $\\langle e_i|\\cdot\\rangle$ of a general expansion; orthonormality collapses the sum (Axler 6.30(a)).',
            view: { kind: 'hilbert-plane', psi: { planeDeg: 53.13 }, others: [{ ket: '+z', role: 'basis' }, { ket: '-z', role: 'basis' }], basis: 'z', shadows: true },
          },
          {
            tex: '\\|\\psi\\|^2 = \\sum_i|\\langle e_i|\\psi\\rangle|^2',
            why: 'Parseval (Axler 6.30(b)); $0.6^2 + 0.8^2 = 0.9899^2 + 0.1414^2 = 1$.',
            view: { kind: 'hilbert-plane', psi: { planeDeg: 53.13 }, others: [{ ket: '+x', role: 'basis' }, { ket: '-x', role: 'basis' }], basis: 'x', shadows: true },
          },
        ],
      },
      claims: [
        claim('f2CompZ', 'the z-frame coordinates of ψ', () => close(V.f2CompZ, 0.6) && close(V.f2CompZ2, 0.8)),
      ],
    },
    {
      id: 'f2-orthonormal:b4',
      phase: 'core',
      text: 'Change to the x frame and the coordinates change, but the total length does not. The same state $0.6|0\\rangle + 0.8|1\\rangle$ has x coordinates $0.9899$ and $-0.1414$. Their sizes squared still add to 1, because length is the same in every right-angled frame. Later a chapter studies the matrix that turns one frame’s coordinates into another’s.',
      formal:
        '$c\'_i = \\langle e\'_i|\\psi\\rangle$ in a second orthonormal basis; here $d_+ = \\langle{+}x|\\psi\\rangle = 0.9899$, $d_- = \\langle{-}x|\\psi\\rangle = -0.1414$. Parseval’s identity $\\|\\psi\\|^2 = \\sum_i |c_i|^2$ (Axler 6.30(b)) holds in both: $0.6^2 + 0.8^2 = 0.9899^2 + 0.1414^2 = 1$. The components are frame-dependent; the length is not. A later chapter writes the two coordinate lists as one matrix times the other.',
      caption: 'x coordinates $0.9899$, $-0.1414$; lengths² still sum to 1',
      captionFormal: 'Parseval: $\\sum_i |c_i|^2 = 1$ in both frames',
      stage: {
        layout: 'split',
        top: { kind: 'hilbert-plane', psi: { planeDeg: 53.13 }, others: [{ ket: '+x', role: 'basis' }, { ket: '-x', role: 'basis' }], basis: 'x', shadows: true },
        bottom: { kind: 'hilbert-plane', psi: { planeDeg: 53.13 }, others: [{ ket: '+z', role: 'basis' }, { ket: '-z', role: 'basis' }], basis: 'z', shadows: true },
      },
      claims: [
        claim('f2CompX', 'the x-frame first coordinate', () => close(V.f2CompX, 0.9899, 5e-5)),
        claim('f2CompXNeg', 'the size of the x-frame second coordinate', () => close(V.f2CompXNeg, 0.1414, 5e-5)),
        claim('f2ParsevalX', 'sum of the x-frame coordinate squares', () => close(V.f2ParsevalX, 1, 5e-4)),
      ],
    },
    {
      id: 'f2-orthonormal:b5',
      phase: 'books',
      text: 'Add up, for each frame vector, its ket times its bra, and you get the do-nothing operation: $|e_1\\rangle\\langle e_1| + |e_2\\rangle\\langle e_2|$ leaves every state alone. This is why inserting the frame and reading off coordinates changes nothing.',
      formal:
        '[[qc-completeness|Completeness]]: $\\sum_i |e_i\\rangle\\langle e_i| = I$ for any orthonormal basis (notes n2 §I.C.4). For the z frame, $|0\\rangle\\langle 0| + |1\\rangle\\langle 1| = I$. Inserting $I = \\sum_i |e_i\\rangle\\langle e_i|$ is the move behind $c_i = \\langle e_i|\\psi\\rangle$ and behind every change of basis; a later chapter names it in full as the [[qc-outer-product|ket-bra]] $|e\\rangle\\langle e|$.',
      caption: '$|0\\rangle\\langle 0| + |1\\rangle\\langle 1| = I$',
      stage: { kind: 'hilbert-plane', others: [{ ket: '+z', role: 'basis' }, { ket: '-z', role: 'basis' }], basis: 'z', shadows: true },
      refs: [{ source: 'lecture', where: 'notes n2 p. 9', adds: 'completeness $\\sum_k |\\alpha_k\\rangle\\langle\\alpha_k| = 1$' }],
      claims: [claim('f2Completeness', '|0⟩⟨0| + |1⟩⟨1| = I', () => V.f2Completeness === 1)],
    },
  ],

  /* ========================================================= f2-gram-schmidt ============================================================ */
  'f2-gram-schmidt': [
    {
      id: 'f2-gram-schmidt:b1',
      phase: 'core',
      text: 'Suppose you have two independent states that are not at right angles, say $|{+}x\\rangle$ and $|{+}z\\rangle$. They span the plane, but they are a skew frame: coordinates on them are awkward. [[qc-gram-schmidt|Gram–Schmidt]] turns any such set into a right-angled frame with the same span.',
      formal:
        'Given a linearly independent list, the Gram–Schmidt procedure builds an orthonormal basis with the same span (Axler 6.32; notes n2 §I.C.2; N&C eq. 2.17). Start from $|{+}x\\rangle$ (at $45°$) and $|{+}z\\rangle$ (at $0°$): independent but not orthogonal, since $\\langle{+}x|{+}z\\rangle = 1/\\sqrt2 \\ne 0$.',
      caption: 'two independent arrows, not at a right angle',
      captionFormal: '$\\langle{+}x|{+}z\\rangle = 1/\\sqrt2 \\ne 0$: skew',
      stage: { kind: 'hilbert-plane', psi: '+x', others: [{ ket: '+z', role: 'second' }], arc: true, arcLabel: '$45°$' },
      claims: [
        claim('f2GsUnitShadow', '⟨+x|+z⟩ once more', () => close(V.f2GsUnitShadow, 0.7071, 5e-5)),
        claim('f2IndepXZb', '{|+x⟩, |+z⟩} independent', () => V.f2IndepXZb === 1),
      ],
    },
    {
      id: 'f2-gram-schmidt:b2',
      phase: 'core',
      introduces: ['qc-shadow'],
      text: 'Keep the first arrow and make it length 1: $e_1 = |{+}x\\rangle$. Now take the second arrow’s [[qc-shadow|shadow]] on $e_1$ — the part that lies along it — and subtract it. What is left points at a right angle to $e_1$. The shadow’s length here is $\\langle e_1|{+}z\\rangle = 0.7071$.',
      formal:
        'Set $e_1 = |{+}x\\rangle$. The projection (shadow) of $|{+}z\\rangle$ on $e_1$ is $|e_1\\rangle\\langle e_1|{+}z\\rangle$; subtract it, leaving the residual $|{+}z\\rangle - e_1\\langle e_1|{+}z\\rangle = (0.5, -0.5)$, orthogonal to $e_1$ (notes’ orthogonal decomposition; the engine’s `projectOnto`, “F2 shadow”). Here $\\langle e_1|{+}z\\rangle = 0.7071$.',
      caption: 'subtract the shadow; the leftover is at a right angle',
      captionFormal: 'residual $= |{+}z\\rangle - e_1\\langle e_1|{+}z\\rangle = (0.5, -0.5)$',
      stage: { kind: 'hilbert-plane', psi: '+z', others: [{ ket: '+x', role: 'basis' }], project: 1, shadows: true },
      derivation: {
        result: '\\{|{+}x\\rangle, |{+}z\\rangle\\} \\xrightarrow{\\text{GS}} \\{|{+}x\\rangle, |{-}x\\rangle\\}',
        ground: [
          {
            tex: 'e_1 = |{+}x\\rangle / \\||{+}x\\rangle\\| = |{+}x\\rangle',
            why: 'Keep the first vector, make it length 1 (it already is).',
            view: { kind: 'hilbert-plane', psi: '+x', others: [{ ket: '+z', role: 'second' }] },
            viewCaption: '$e_1$ and the skew $|{+}z\\rangle$',
          },
          {
            tex: '\\langle e_1|{+}z\\rangle = 1/\\sqrt2',
            why: 'Measure how much of $|{+}z\\rangle$ lies along $e_1$.',
            view: { kind: 'hilbert-plane', psi: '+z', others: [{ ket: '+x', role: 'basis' }], shadows: true },
            viewCaption: 'the shadow coefficient $0.7071$',
          },
          {
            tex: 'w = |{+}z\\rangle - e_1\\langle e_1|{+}z\\rangle = (0.5, -0.5)',
            why: 'Subtract that shadow; the leftover is at a right angle to $e_1$.',
            view: { kind: 'hilbert-plane', psi: '+z', others: [{ ket: '+x', role: 'basis' }], project: 1, shadows: true },
            viewCaption: 'shadow subtracted; residual at $90°$',
          },
          {
            tex: 'e_2 = w/\\|w\\| = |{-}x\\rangle',
            why: 'Normalize the leftover: the second frame vector.',
            view: { kind: 'hilbert-plane', others: [{ ket: '+x', role: 'basis' }, { ket: '-x', role: 'basis' }], basis: 'x', rightAngle: true },
            viewCaption: 'the finished x frame',
          },
          { tex: '\\{|{+}x\\rangle, |{+}z\\rangle\\} \\to \\{|{+}x\\rangle, |{-}x\\rangle\\}', why: 'A skew pair becomes an orthonormal frame with the same span.' },
        ],
        formal: [
          {
            tex: 'f_k = v_k - \\sum_{j<k}\\dfrac{\\langle f_j|v_k\\rangle}{\\|f_j\\|^2}f_j,\\quad e_k = f_k/\\|f_k\\|',
            why: 'The Gram–Schmidt formula (Axler 6.32; N&C 2.17); here $f_2 = |{+}z\\rangle - |{+}x\\rangle\\langle{+}x|{+}z\\rangle = (0.5, -0.5)$.',
            view: { kind: 'hilbert-plane', psi: '+z', others: [{ ket: '+x', role: 'basis' }], project: 1, shadows: true },
          },
          {
            tex: '\\{|{+}x\\rangle, |{+}z\\rangle\\} \\to \\{|{+}x\\rangle, |{-}x\\rangle\\}',
            why: 'Orthonormal, same span (engine `orthonormalize`).',
            view: { kind: 'hilbert-plane', others: [{ ket: '+x', role: 'basis' }, { ket: '-x', role: 'basis' }], basis: 'x', rightAngle: true },
          },
        ],
      },
      fidelity: ['hilbert-plane'],
      claims: [
        claim('f2GsUnitShadow', '⟨+x|+z⟩ shadow coefficient', () => close(V.f2GsUnitShadow, 0.7071, 5e-5)),
        claim('f2GsUnitResid', 'the residual’s first entry', () => close(V.f2GsUnitResid, 0.5, 5e-5)),
        claim('f2GsUnitResidNeg', 'the size of the residual’s second entry', () => close(V.f2GsUnitResidNeg, 0.5, 5e-5)),
      ],
    },
    {
      id: 'f2-gram-schmidt:b3',
      phase: 'core',
      text: 'Divide the leftover by its own length and you have the second frame vector, length 1 and at a right angle to the first. Starting from $|{+}x\\rangle$ and $|{+}z\\rangle$, Gram–Schmidt delivers exactly $|{+}x\\rangle$ and $|{-}x\\rangle$: the x frame, now right-angled.',
      formal:
        'Normalize the residual: $e_2 = (0.5, -0.5)/\\|(0.5,-0.5)\\| = |{-}x\\rangle$. So $\\{|{+}x\\rangle, |{+}z\\rangle\\} \\xrightarrow{\\text{GS}} \\{|{+}x\\rangle, |{-}x\\rangle\\}$, an orthonormal basis with the same span (Axler 6.32; the engine’s `orthonormalize` / `gramSchmidt`). Each new $e_k$ spans the same subspace as $v_1, \\dots, v_k$.',
      caption: 'normalize the leftover: the frame $|{+}x\\rangle$, $|{-}x\\rangle$',
      captionFormal: '$e_2 = |{-}x\\rangle$; $\\operatorname{span}$ preserved',
      stage: { kind: 'hilbert-plane', others: [{ ket: '+x', role: 'basis' }, { ket: '-x', role: 'basis' }], basis: 'x', rightAngle: true },
      claims: [
        claim('f2GsUnitE1', 'e1’s first entry', () => close(V.f2GsUnitE1, 0.7071, 5e-5)),
        claim('f2GsUnitE2', 'e2’s first entry', () => close(V.f2GsUnitE2, 0.7071, 5e-5)),
      ],
    },
    {
      id: 'f2-gram-schmidt:b4',
      phase: 'books',
      text: 'The same recipe works when the numbers are complex. Take $(1, i)$ and $(1, 0)$. The first normalizes to $(1/\\sqrt2,\\ i/\\sqrt2)$. Subtracting its shadow from the second and normalizing gives $(1/\\sqrt2,\\ -i/\\sqrt2)$, at a right angle to the first.',
      formal:
        'Over $\\mathbb C$: from $(1, i), (1, 0)$, Gram–Schmidt gives $e_1 = (1/\\sqrt2, i/\\sqrt2)$ and $e_2 = (1/\\sqrt2, -i/\\sqrt2)$, with $\\langle e_1|e_2\\rangle = 0$. The conjugation in $\\langle e_1|v\\rangle$ is exactly what keeps the shadow correct for complex entries (N&C eq. 2.17).',
      caption: 'complex input $(1, i), (1, 0) \\to (1/\\sqrt2, \\pm i/\\sqrt2)$',
      stage: {
        layout: 'split',
        top: { kind: 'amplitudes', state: { ket: '+y' }, dials: true },
        bottom: { kind: 'amplitudes', state: { ket: '-y' }, dials: true },
      },
      refs: [{ source: 'nc', where: 'eq. 2.17 p. 66', adds: 'the complex Gram–Schmidt formula' }],
      claims: [
        claim('f2GsCE1', 'e1’s second entry (imaginary part)', () => close(V.f2GsCE1, 0.7071, 5e-5)),
        claim('f2GsCE2Neg', 'the size of e2’s second entry', () => close(V.f2GsCE2Neg, 0.7071, 5e-5)),
        claim('f2GsCOrtho', 'e1 ⊥ e2', () => V.f2GsCOrtho === 1),
      ],
    },
    {
      id: 'f2-gram-schmidt:b5',
      phase: 'clue',
      text: 'You feed Gram–Schmidt two arrows pointing the same way, $(1, 1)$ and $(2, 2)$. What happens at the second step?',
      formal: 'Run Gram–Schmidt on the dependent pair $(1, 1), (2, 2)$. What is the residual at step 2?',
      stage: {
        kind: 'hilbert-plane',
        others: [
          { ket: { planeDeg: 45 }, role: 'ghost', badge: '(1,1)' },
          { ket: { planeDeg: 45 }, role: 'ghost', badge: '(2,2)' },
        ],
      },
      reveal: {
        text: 'The shadow of the second is the whole of it, so the leftover is zero. There is nothing to normalize. Gram–Schmidt reports only one frame vector: a dependent set cannot make a frame bigger than its span.',
        formal: '$(2, 2)$ is already a multiple of $(1, 1)$, so its residual after subtracting the shadow is $0$; the engine drops it (residual below tolerance). `orthonormalize` returns length 1, flagging dependence — this is the test behind `isIndependent`.',
        caption: 'dependent: residual $0$, one frame vector only',
        stage: { kind: 'hilbert-plane', others: [{ ket: { planeDeg: 45 }, role: 'basis' }] },
        claims: [
          claim('f2IndepFalse', '(1,1),(2,2) are dependent', () => V.f2IndepFalse === 0),
          claim('f2GsDepLen', 'Gram-Schmidt keeps one vector', () => V.f2GsDepLen === 1),
        ],
      },
    },
  ],
}
