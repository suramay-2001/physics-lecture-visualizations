/**
 * Chapter Q1 review cards: the exam layer in both tracks (P-Q1-story §6). Ground-up ≤ 25 words per sentence, Formal
 * ≤ 40; ≤ 5 points each. Every number comes from Q1.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d, tf, uf } from './Q1.values'

export const Q1_REVIEW: Record<string, ReviewCard> = {
  'q1-two-spots': {
    points: [
      'A tiny magnet in a lopsided field is pushed along the slope of its energy: $F_z = \\mu_z G$.',
      'The landing height is proportional to $\\mu_z$.',
      'Classical magnets would paint a smear; the plate shows two spots.',
      'So $\\mu_z$ is quantized, and so is the spin’s up–down part, $S_z = \\pm\\hbar/2$.',
    ],
    equations: 'E = -\\mu_z B_z,\\qquad F_z = \\mu_z G,\\qquad \\Delta z = \\tfrac12\\,\\frac{\\mu_z G}{m}\\left(\\frac{L}{v}\\right)^2',
    trap: `Thinking a stronger gradient makes more spots. It only moves the two spots apart (${d(V.q1Defl)} → ${d(V.q1DeflG2)} mm).`,
    formal: {
      points: [
        '$F_z = \\mu_z\\,\\partial B_z/\\partial z$ follows from $E = -\\vec\\mu\\cdot\\vec B$.',
        '$\\Delta z \\propto \\mu_z$, so the number of lines is the number of eigenvalues of $\\mu_z$.',
        `$\\mu_z = -g\\mu_B S_z/\\hbar$, with $\\mu_B = e\\hbar/2m_e = ${d(V.q1MuB)} \\times 10^{-24}$ J/T in SI units.`,
      ],
      equations: 'E = -\\vec\\mu\\cdot\\vec B,\\qquad F_z = \\mu_z\\frac{\\partial B_z}{\\partial z},\\qquad \\Delta z = \\frac{\\mu_z}{2m}\\frac{\\partial B_z}{\\partial z}\\left(\\frac{L}{v}\\right)^2',
      trap: `Reading a steeper gradient as more eigenvalues: $\\Delta z$ is linear in $\\partial B_z/\\partial z$ (${d(V.q1Defl)} → ${d(V.q1DeflG2)} mm), while the number of lines is fixed by the atom.`,
    },
    claims: [
      claim('q1Defl', 'Δz at the magnet’s exit = 0.105 mm', () => close(V.q1Defl, 0.5 * V.q1Accel * 1e4 * (V.q1Flight * 1e-6) ** 2 * 1000, 1e-12)),
      claim('q1DeflG2', 'doubling the gradient: Δz = 0.210 mm', () => close(V.q1DeflG2, 2 * V.q1Defl, 1e-12)),
      claim('q1DeflHalf', 'Δz carries the ½ of ½at²: halving μ_z halves it', () => close(V.q1DeflHalf, 0.5)),
      claim('q1MuB', 'μ_B = 9.274 × 10⁻²⁴ J/T', () => close(V.q1MuB, 9.2740100783, 1e-9)),
    ],
  },
  'q1-sequences': {
    points: [
      'A kept beam is in a definite state, such as $|{+z}\\rangle$.',
      'Repeating the same measurement repeats the answer.',
      'A magnet along a new axis splits the beam half and half.',
      `After an $x$ magnet the $z$ answer is gone: ${uf(V.q1Zxz)} of the furnace’s atoms reach each final spot.`,
    ],
    equations: `\\widehat{\\mathrm{SG}}_{z\\pm}|{\\pm z}\\rangle = |{\\pm z}\\rangle,\\qquad \\text{z, then x, then z: } ${tf(V.q1Zxz)} \\text{ of the furnace per spot}`,
    trap: '“The atoms remember they were $+z$.” The plate shows both spots after the $x$ magnet.',
    formal: {
      points: [
        '$\\widehat{\\mathrm{SG}}_{z\\pm}$ acts as a projector: $P^2 = P$.',
        'Each measurement leaves the eigenstate of its outcome.',
        '$[S_z, S_x] \\ne 0$: there are no joint labels for $S_z$ and $S_x$.',
      ],
      equations: `\\widehat{\\mathrm{SG}}_{z\\pm}|{\\pm z}\\rangle = |{\\pm z}\\rangle,\\qquad P(\\pm x \\mid {+z}) = ${tf(V.q1ZthenX)},\\qquad P(+, +, \\pm) = ${tf(V.q1Zxz)}`,
      trap: 'Treating a measurement as reading a stored value: after SG$_x$ the state is $|{\\pm x}\\rangle$, and SG$_z$ splits it 50/50.',
    },
    claims: [
      claim('q1Zxz', 'oven → z(+) → x(+) → z: ⅛ per spot', () => close(V.q1Zxz, 1 / 8)),
      claim('q1ZthenX', '|+z⟩ into an x magnet: ½ each way', () => close(V.q1ZthenX, 0.5)),
    ],
  },
  'q1-superposition': {
    points: [
      'A state is a ket, such as $|\\psi\\rangle$.',
      'Any mix $c_1|\\psi_1\\rangle + c_2|\\psi_2\\rangle$ of two states is a state, once rescaled to length 1.',
      'A chance is a number’s size, squared.',
      'A superposition is not a half-and-half beam: along $x$, every $|{+x}\\rangle$ atom goes up.',
    ],
    equations: '|\\psi\\rangle = c_1|\\psi_1\\rangle + c_2|\\psi_2\\rangle,\\qquad |{+x}\\rangle = \\tfrac{1}{\\sqrt2}\\left(|{+z}\\rangle + |{-z}\\rangle\\right),\\qquad P = |c_1|^2',
    trap: `Forgetting to rescale: $|{+z}\\rangle + |{-z}\\rangle$ has length ${d(V.q1LenSqrt2)}, so its “chances” would be 1 and 1.`,
    formal: {
      points: [
        'Kets form a complex Hilbert space; states are its normalized vectors.',
        'Coefficients are complex, and the relative phase matters: $|{+y}\\rangle \\ne |{+x}\\rangle$.',
        'The course locks $|0\\rangle \\equiv |{+z}\\rangle$ and $|1\\rangle \\equiv |{-z}\\rangle$.',
      ],
      equations: '|\\Psi\\rangle = c_1|\\psi_1\\rangle + c_2|\\psi_2\\rangle,\\qquad |{+x}\\rangle = \\tfrac{1}{\\sqrt2}\\left(|{+z}\\rangle + |{-z}\\rangle\\right),\\qquad P(\\pm z) = |\\langle{\\pm z}|\\psi\\rangle|^2',
      trap: `A combination with $|c_1|^2 + |c_2|^2 = 1$ need not be normalized: $(|{+z}\\rangle + |{+x}\\rangle)/\\sqrt2$ has length ${d(V.q1PNotUnit, 4)}, because the two are not [[orthogonal|orthogonal]].`,
    },
    claims: [
      claim('q1LenSqrt2', '|+z⟩ + |−z⟩ has length 1.414', () => close(V.q1LenSqrt2, Math.SQRT2)),
      claim('q1PX', 'P(±z) = ½ for |+x⟩', () => close(V.q1PX, 0.5)),
      claim('q1PNotUnit', '(|+z⟩ + |+x⟩)/√2 has length 1.3066', () => close(V.q1PNotUnit, Math.sqrt(1 + Math.SQRT1_2))),
    ],
  },
  'q1-vector-space': {
    points: [
      'Vectors can be added and scaled, and the results stay in the set.',
      'The order and the grouping of a sum do not matter.',
      'There is a zero vector, and every vector has an opposite.',
      'Scaling spreads over sums, and $1|\\alpha\\rangle = |\\alpha\\rangle$.',
    ],
    equations:
      '|\\alpha\\rangle + |\\beta\\rangle = |\\beta\\rangle + |\\alpha\\rangle,\\qquad |\\alpha\\rangle + 0 = |\\alpha\\rangle,\\qquad (c_1 + c_2)|\\alpha\\rangle = c_1|\\alpha\\rangle + c_2|\\alpha\\rangle,\\qquad 1|\\alpha\\rangle = |\\alpha\\rangle',
    trap: 'Confusing the zero vector 0 with the qubit state $|0\\rangle$. The first has length 0; the second is $|{+z}\\rangle$, of length 1.',
    formal: {
      points: [
        'A vector space $V(F)$ over $F$ = ℝ or ℂ obeys Axler’s list of rules, which includes $1|\\alpha\\rangle = |\\alpha\\rangle$.',
        'Examples: $\\text{ℝ}^n$, $\\text{ℂ}^n$ and $\\mathcal P_n(\\text{ℝ})$, the polynomials of degree at most $n$.',
        'The states are the unit vectors of $V^2(\\text{ℂ})$; they do not form a subspace.',
      ],
      trap: 'Writing the zero vector as $|0\\rangle$: in this course $|0\\rangle \\equiv |{+z}\\rangle$ has norm 1, while the zero vector 0 has norm 0.',
    },
    claims: [
      claim('q1KetZeroNotZero', 'the qubit state |0⟩ has length 1', () => close(V.q1KetZeroNotZero, 1)),
      claim('q1ZeroVec', 'the zero vector (0, 0) has length 0', () => close(V.q1ZeroVec, 0)),
    ],
  },
  'q1-inner-product': {
    points: [
      'A bra is the ket’s row, with every number conjugated.',
      '$\\langle\\beta|\\alpha\\rangle = b_1^*a_1 + b_2^*a_2$.',
      `A length is $\\sqrt{\\langle\\alpha|\\alpha\\rangle}$; $(3, 4i)$ has length ${d(V.q1Len34i, 0)}.`,
      'A table $M$ gives another inner product only if it passes the positivity test.',
    ],
    equations: '\\langle\\beta|\\alpha\\rangle = \\beta^\\dagger\\alpha,\\qquad \\langle\\alpha|\\beta\\rangle = \\langle\\beta|\\alpha\\rangle^*,\\qquad |\\alpha| = \\sqrt{\\langle\\alpha|\\alpha\\rangle}',
    trap: `Leaving the bra unconjugated: $(3, 4i)$ would get the “length squared” $${d(V.q1Bilinear34i, 0)}$.`,
    formal: {
      points: [
        'The inner product is sesquilinear, conjugate-symmetric and positive definite.',
        'Conjugate-linearity in the bra, $\\langle c\\beta|\\alpha\\rangle = c^*\\langle\\beta|\\alpha\\rangle$, follows from the other rules.',
        '$\\beta^\\dagger M\\alpha$ is an inner product exactly for Hermitian $M$ with positive eigenvalues.',
        'Axler’s $\\langle\\alpha, \\beta\\rangle$ is our $\\langle\\beta|\\alpha\\rangle$.',
      ],
      trap: `Calling the product bilinear: over ℂ a bilinear form gives $(3, 4i)$ the value $${d(V.q1Bilinear34i, 0)}$, so it cannot define a norm.`,
    },
    claims: [
      claim('q1Len34i', '(3, 4i) has length 5', () => close(V.q1Len34i, 5)),
      claim('q1Bilinear34i', 'without the conjugate, (3, 4i) gives −7', () => close(V.q1Bilinear34i, -7)),
    ],
  },
}
