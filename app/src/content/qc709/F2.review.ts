/**
 * Chapter F2 review cards, both tracks (plan: docs/roles/proposals/P-F2-story.md §6).
 * ≤ 5 points; Ground-up sentences ≤ 25 words, Formal ≤ 40; every number comes from F2.values.ts through a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { claim, close, V } from './F2.values'

export const F2_REVIEW: Record<string, ReviewCard> = {
  'f2-vectors': {
    points: [
      'A state is a ket: a list of complex numbers.',
      'Add lists entry by entry; scale by one number.',
      'A spin lives in $\\mathbb C^2$: $\\alpha|0\\rangle + \\beta|1\\rangle$.',
      'Three vectors in a 2-D space are always dependent.',
    ],
    equations: '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle,\\qquad |{+}x\\rangle = (|{+}z\\rangle + |{-}z\\rangle)/\\sqrt2',
    trap: 'Thinking more arrows mean more directions. $(1,1) = (1,0) + (0,1)$: the third adds nothing.',
    claims: [claim('f2DepThree', '(1,0),(0,1),(1,1) dependent (review)', () => V.f2DepThree === 0)],
    formal: {
      points: [
        '$\\mathbb C^n$ is a vector space (Axler 1.20).',
        'A spanning set builds every vector; an independent spanning set is a basis.',
        '$\\dim \\mathbb C^2 = 2$.',
      ],
      trap: '"More arrows means more directions" is false: $(1,1) = (1,0) + (0,1)$, so three vectors in a 2-D space are always dependent.',
    },
  },
  'f2-inner-product': {
    points: [
      'A bra against a ket gives one number.',
      'Mirror the bra: $\\langle\\alpha|\\beta\\rangle = \\sum a_i^* b_i$.',
      'Swapping the two states conjugates the answer.',
      'Without the mirror, $|{+}y\\rangle$ would have length zero.',
    ],
    equations: '\\langle\\alpha|\\beta\\rangle = \\sum_i a_i^* b_i,\\qquad \\langle\\beta|\\alpha\\rangle = \\langle\\alpha|\\beta\\rangle^*',
    trap: 'Forgetting the conjugate. For $|{+}y\\rangle$, $\\sum a_i^2 = 0$ while $\\langle{+}y|{+}y\\rangle = 1$.',
    claims: [
      claim('f2InnerYY', '⟨+y|+y⟩ (review)', () => close(V.f2InnerYY, 1, 5e-5)),
      claim('f2BilinearYY', 'the bilinear form on +y (review)', () => close(V.f2BilinearYY, 0)),
    ],
    formal: {
      points: [
        'Positivity, conjugate symmetry, linearity in the ket.',
        '$\\langle{+}y|{+}y\\rangle = 1$ but the bilinear sum is $0$.',
        'A weighted $\\langle\\cdot|\\cdot\\rangle_M$ with Hermitian positive-definite $M$ is also an inner product.',
      ],
      trap: 'Dropping the conjugate on the bra side turns an honest squared length into a number that can vanish on a nonzero state.',
    },
  },
  'f2-norm-angle': {
    points: [
      'Length is $\\sqrt{\\langle\\psi|\\psi\\rangle}$.',
      'Orthogonal means the inner product is zero.',
      'Orthogonal lengths² add (Pythagoras).',
      '$\\langle\\alpha|\\beta\\rangle = \\|\\alpha\\|\\|\\beta\\|\\cos\\theta$ for real arrows.',
    ],
    equations: '\\|\\psi\\| = \\sqrt{\\langle\\psi|\\psi\\rangle},\\qquad \\cos\\theta = \\operatorname{Re}\\langle\\alpha|\\beta\\rangle / \\|\\alpha\\|\\|\\beta\\|',
    trap: 'Reading the state-space angle as a lab angle. $|{+}x\\rangle \\perp |{-}x\\rangle$ at $90°$ in the slice, yet they are opposite spins.',
    claims: [
      claim('f2AngleZX', 'the angle between |+z⟩ and |+x⟩ (review)', () => close(V.f2AngleZX, 45, 5e-3)),
      claim('f2OrthXmX', '⟨+x|-x⟩ (review)', () => close(V.f2OrthXmX, 0)),
    ],
    formal: {
      points: [
        '$\\|\\lambda\\psi\\| = |\\lambda|\\|\\psi\\|$.',
        'Cauchy–Schwarz $|\\langle\\alpha|\\beta\\rangle| \\le \\|\\alpha\\|\\|\\beta\\|$.',
        'Triangle $\\|\\alpha + \\beta\\| \\le \\|\\alpha\\| + \\|\\beta\\|$, equal iff parallel.',
      ],
      trap: 'The state-space angle between orthogonal real states is the full $90°$: it is not the lab’s half-angle convention in reverse.',
    },
  },
  'f2-orthonormal': {
    points: [
      'Independent + spanning = a basis; its size is the dimension.',
      'An orthonormal frame has unit, right-angled vectors.',
      'Coordinates are inner products: $c_i = \\langle e_i|\\psi\\rangle$.',
      'The length is the same in every frame.',
    ],
    equations: 'c_i = \\langle e_i|\\psi\\rangle,\\qquad \\sum_i|e_i\\rangle\\langle e_i| = I',
    trap: 'Thinking coordinates are a property of the state. They change with the frame; the length does not.',
    claims: [claim('f2ParsevalX', 'the x-frame coordinate squares (review)', () => close(V.f2ParsevalX, 1, 5e-4))],
    formal: {
      points: [
        '$\\langle e_i|e_j\\rangle = \\delta_{ij}$.',
        '$|\\psi\\rangle = \\sum_i\\langle e_i|\\psi\\rangle|e_i\\rangle$.',
        'Parseval $\\|\\psi\\|^2 = \\sum_i|c_i|^2$; completeness $\\sum_i|e_i\\rangle\\langle e_i| = I$.',
      ],
      trap: 'Coordinates are frame-dependent bookkeeping, not an attribute of the state itself; only the norm survives every change of frame.',
    },
  },
  'f2-gram-schmidt': {
    points: [
      'Keep the first vector, normalize it.',
      'Subtract each later vector’s shadow on the ones kept.',
      'Normalize the leftover.',
      'A dependent vector leaves a zero leftover and is dropped.',
    ],
    equations: 'e_1 = v_1/\\|v_1\\|,\\quad w = v_2 - e_1\\langle e_1|v_2\\rangle,\\quad e_2 = w/\\|w\\|',
    trap: 'Using the bare product $\\sum f_j v_k$ instead of $\\langle f_j|v_k\\rangle$: the shadow comes out wrong for complex vectors.',
    claims: [claim('f2GsUnitShadow', '⟨+x|+z⟩, the shadow coefficient (review)', () => close(V.f2GsUnitShadow, 0.7071, 5e-5))],
    formal: {
      points: [
        '$f_k = v_k - \\sum_{j<k}\\langle f_j|v_k\\rangle f_j/\\|f_j\\|^2$, $e_k = f_k/\\|f_k\\|$.',
        'The result is orthonormal with the same span (Axler 6.32).',
        'It works over $\\mathbb C$ because $\\langle f_j|v_k\\rangle$ conjugates.',
      ],
      trap: 'Skipping the conjugate in the shadow coefficient breaks orthogonality the moment any entry is complex.',
    },
  },
}
