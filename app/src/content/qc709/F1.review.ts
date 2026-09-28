/**
 * Chapter F1 review cards, both tracks (plan: docs/roles/proposals/P-F1-story.md §6).
 * ≤ 5 points; Ground-up sentences ≤ 25 words, Formal ≤ 40; every number comes from F1.values.ts through a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { C } from './F1.story'
import { V, claim, close, d } from './F1.values'

export const F1_REVIEW: Record<string, ReviewCard> = {
  'f1-number-line': {
    points: [
      'Each new kind of equation forced new numbers: negatives, then fractions, then numbers like $\\sqrt2$.',
      'No ordinary number squares to $-1$, because a square is never negative.',
      'Multiplying by $-1$ is a half turn, so $i$ is a quarter turn.',
      '$i^2 = -1$ and $(-i)^2 = -1$: the number $-1$ has two square roots.',
    ],
    equations: 'i^2 = -1,\\qquad x^2 + 1 = (x - i)(x + i),\\qquad \\sqrt i = \\pm\\frac{1 + i}{\\sqrt2}',
    trap: 'Writing $\\sqrt{-4} = -2$. A real square is never negative: $(-2)^2 = +4$, and the square roots of $-4$ are $\\pm 2i$.',
    claims: [C.iSquared, C.negISquared, claim('f1Roots4', '(2i)² = −4', () => close(V.f1Roots4, -4))],
    formal: {
      points: [
        'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ: each extension makes one more operation always possible.',
        'ℂ is the set of $a + bi$ with $i^2 = -1$ (Axler, p. 2), and multiplication by $i$ is the rotation by 90°.',
        'ℂ is algebraically closed (Axler, p. 125), so $\\sqrt i = \\pm(1 + i)/\\sqrt2$ needs no further extension.',
      ],
      trap: '$\\sqrt{-4} = -2$ is false: $(-2)^2 = 4$, and the zeros of $x^2 + 4$ are $\\pm 2i$.',
    },
  },
  'f1-plane': {
    points: [
      '$z = a + bi$ is the point $a$ across and $b$ up.',
      'Add part by part; in the picture, arrows go tip to tail.',
      'The size is $|z| = \\sqrt{a^2 + b^2}$, so $|3 + 4i| = 5$.',
      'The mirror is $z^* = a - bi$, and $zz^* = |z|^2$, which is 25 for $3 + 4i$.',
    ],
    equations: '|z| = \\sqrt{a^2 + b^2},\\qquad z^* = a - bi,\\qquad zz^* = |z|^2',
    trap: '$|z|^2$ is $zz^*$, not $z^2$. For $z = 1 + i$, $zz^* = 2$ but $z^2 = 2i$.',
    claims: [
      C.abs34,
      C.zzStar,
      claim('f1TrapZZ', 'zz* = 2 for z = 1 + i', () => close(V.f1TrapZZ, 2)),
      claim('f1TrapZ2', 'z² = 2i for z = 1 + i', () => close(V.f1TrapZ2, 2)),
    ],
    formal: {
      points: [
        'ℂ is the plane ℝ² with componentwise addition and a multiplication added.',
        'Conjugation is reflection in the real axis, and $(zw)^* = z^*w^*$.',
        'The modulus obeys $zz^* = |z|^2$ and the triangle inequality $|z + w| \\le |z| + |w|$.',
      ],
      trap: '$|z|^2 = zz^*$, never $z^2$: for $z = 1 + i$ they are 2 and $2i$.',
    },
  },
  'f1-multiply': {
    points: [
      'Multiply like brackets, then use $i^2 = -1$.',
      'Multiplying by $i$ turns a point 90° and keeps its size.',
      `Sizes multiply: ${d(V.f1Abs21)} × ${d(V.f1Abs13)} = ${d(V.f1AbsTimes)}.`,
      'Angles add: 26.6° + 71.6° = 98.1°.',
      'Dividing divides the sizes and subtracts the angles.',
    ],
    equations: '|zw| = |z||w|,\\qquad \\arg(zw) = \\arg z + \\arg w,\\qquad z^{-1} = \\frac{z^*}{|z|^2}',
    trap: `Adding sizes when multiplying: $|(2 + i)(1 + 3i)| = ${d(V.f1AbsProd)}$, not $${d(V.f1Abs21)} + ${d(V.f1Abs13)} = ${d(V.f1SizesAdded)}$.`,
    claims: [
      C.abs21,
      C.abs13,
      C.absProd,
      claim('f1AbsTimes', '|2 + i| × |1 + 3i| = 7.071', () => close(V.f1AbsTimes, V.f1AbsProd)),
      claim('f1SizesAdded', '|2 + i| + |1 + 3i| = 5.398, not the size of the product', () => close(V.f1SizesAdded, Math.sqrt(5) + Math.sqrt(10))),
    ],
    formal: {
      points: [
        '$zw = |z||w|[\\cos(\\arg z + \\arg w) + i\\sin(\\arg z + \\arg w)]$: moduli multiply and arguments add.',
        'De Moivre: $(\\cos\\varphi + i\\sin\\varphi)^n = \\cos n\\varphi + i\\sin n\\varphi$ for every whole number $n$.',
        '$z^{-1} = z^*/|z|^2$ for $z \\ne 0$.',
      ],
      trap: `The modulus of a product is the product of the moduli: ${d(V.f1AbsProd)} here, never the sum ${d(V.f1SizesAdded)}.`,
    },
  },
  'f1-euler': {
    points: [
      'A radian measures an angle by arc length on a circle of radius 1; 180° is $\\pi$.',
      `$(1 + 1/n)^n$ settles on $e \\approx ${d(V.f1E)}$ as $n$ grows.`,
      '$(1 + i\\varphi/n)^n$ turns without stretching once $n$ is large.',
      '$e^{i\\varphi} = \\cos\\varphi + i\\sin\\varphi$, and $e^{i\\pi} = -1$.',
    ],
    equations: 'e^{i\\varphi} = \\cos\\varphi + i\\sin\\varphi,\\qquad e^{i\\pi} + 1 = 0,\\qquad z = re^{i\\varphi}',
    trap: `Putting degrees into $e^{i\\varphi}$. $e^{180i}$ is not $-1$: it is $-${d(V.f1Deg180ReNeg)} - ${d(V.f1Deg180ImNeg)}i$. Half a turn is $e^{i\\pi}$.`,
    claims: [
      C.e,
      C.expiPi,
      claim('f1Deg180ReNeg', 'e^{180i} = −0.598 − 0.801i (real part)', () => close(V.f1Deg180ReNeg, -Math.cos(180))),
      claim('f1Deg180ImNeg', 'e^{180i} = −0.598 − 0.801i (imaginary part)', () => close(V.f1Deg180ImNeg, -Math.sin(180))),
    ],
    formal: {
      points: [
        '$e^{i\\varphi} = \\lim_{n\\to\\infty}(1 + i\\varphi/n)^n$, whose modulus $(1 + \\varphi^2/n^2)^{n/2}$ tends to 1.',
        '$f(\\varphi) = e^{i\\varphi}$ solves $f\' = if$: unit speed round the unit circle.',
        '$e^{i\\alpha}e^{i\\beta} = e^{i(\\alpha + \\beta)}$: angle addition in one line.',
      ],
      trap: `$\\varphi$ is in radians: $e^{180i} = -${d(V.f1Deg180ReNeg)} - ${d(V.f1Deg180ImNeg)}i$, while half a turn is $e^{i\\pi} = -1$.`,
    },
  },
  'f1-phase': {
    points: [
      'Arrows add tip to tail; the result depends on the angle between them.',
      '$|1 + e^{i\\varphi}|^2 = 2 + 2\\cos\\varphi$: 4 when lined up, 0 when opposite.',
      'A common turn of all arrows, a global phase, changes nothing measurable.',
      'A turn of one amplitude, a relative phase, changes interference.',
    ],
    equations: '|1 + e^{i\\varphi}|^2 = 4\\cos^2\\frac{\\varphi}{2},\\qquad |e^{i\\gamma}(A + B)|^2 = |A + B|^2',
    trap: `Calling a global phase “a phase you can measure later”. Turning every arrow together keeps every sum’s size, ${d(V.f1GlobalAbs)} in the chapter’s example, so no chance changes.`,
    claims: [C.interf0, C.interf180, C.globalAbs, C.relProb],
    formal: {
      points: [
        'Intensities are $|\\sum_k A_k|^2$: the cross terms are the interference.',
        'A global phase $e^{i\\gamma}$ changes no probability, so states are rays.',
        'A relative phase is the Bloch longitude; $\\delta = \\pi$ separates $|{+x}\\rangle$ from $|{-x}\\rangle$.',
      ],
      trap: 'A global phase is not a hidden quantity to be measured later: every probability is unchanged by it, before and after any change of basis.',
    },
  },
}
