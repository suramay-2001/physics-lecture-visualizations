/**
 * Lecture 2 review cards: the exam layer (owner: P; P-L2-story §5).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L2.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d, pct } from './L2.values'

export const L2_REVIEW: Record<string, ReviewCard> = {
  'l2-vector-space': {
    points: [
      'Kets add, and they scale by numbers; sums and multiples are again kets. Seven rules fix how.',
      'The numbers may be complex. That is the one rule that differs from ordinary arrows.',
      'Every ket has a bra. The bra of $\\lambda|A\\rangle$ is $\\lambda^*\\langle A|$.',
      'Many vectors, one state: $2|{+z}\\rangle$ and $-|{+z}\\rangle$ describe the same spin as $|{+z}\\rangle$.',
    ],
    equations: '|A\\rangle + |B\\rangle = |C\\rangle,\\qquad \\lambda(|A\\rangle + |B\\rangle) = \\lambda|A\\rangle + \\lambda|B\\rangle,\\qquad \\lambda|A\\rangle \\;\\Leftrightarrow\\; \\lambda^*\\langle A|',
    trap: 'Writing the bra of $\\lambda|A\\rangle$ as $\\lambda\\langle A|$. Conjugate the number: the bra of $i|{+z}\\rangle$ is $-i\\langle{+z}|$.',
    claims: [
      claim('l2TwoZ', '2|+z⟩ is the same state as |+z⟩', () => V.l2TwoZ === 1),
      claim('l2MinusZ', '−|+z⟩ is the same state as |+z⟩', () => V.l2MinusZ === 1),
      claim('l2BraConjIm', 'the bra of i|+z⟩ gives −i on |+z⟩', () => close(V.l2BraConjIm, -1)),
    ],
  },
  'l2-inner-product': {
    points: [
      '$\\langle B|A\\rangle = b_1^*a_1 + b_2^*a_2$: multiply matching entries, conjugating the bra’s side.',
      'Swapping sides conjugates the result, so $\\langle A|A\\rangle$ is real, and it is never negative.',
      'Coordinates are overlaps. With $\\alpha = \\langle{+z}|\\psi\\rangle$ and $\\beta = \\langle{-z}|\\psi\\rangle$, the $x$ coordinates are $\\delta = (\\alpha+\\beta)/\\sqrt2$ and $\\varepsilon = (\\alpha-\\beta)/\\sqrt2$.',
      `Values: $\\langle{+z}|{+x}\\rangle$ = ${d(V.l2RowCol)}. For ψ at 30°, δ = ${d(V.l2Delta30)} and ε = ${d(V.l2Eps30)}, and their squares add to 1 in either basis.`,
    ],
    equations: '\\langle B|A\\rangle = b_1^*a_1 + b_2^*a_2,\\qquad \\langle B|A\\rangle = \\langle A|B\\rangle^*,\\qquad \\delta = \\tfrac{\\alpha+\\beta}{\\sqrt2},\\ \\ \\varepsilon = \\tfrac{\\alpha-\\beta}{\\sqrt2}',
    trap: 'Mixing conventions. Axler’s product is linear in the first slot, so it gives the conjugate of ours. In this course, the bra is the one that gets conjugated.',
    claims: [
      claim('l2RowCol', '⟨+z|+x⟩ = 0.707', () => close(V.l2RowCol, Math.SQRT1_2)),
      claim('l2Delta30', 'δ = 0.966 for ψ at 30°', () => close(V.l2Delta30, 0.9659258262890683)),
      claim('l2Eps30', 'ε = 0.259 for ψ at 30°', () => close(V.l2Eps30, 0.25881904510252074)),
      claim('l2DeltaSq', 'δ² + ε² = 1', () => close(V.l2DeltaSq + V.l2EpsSq, 1)),
    ],
  },
  'l2-complex': {
    points: [
      '$i^2 = -1$. Multiplying by $i$ is a quarter turn, and multiplying by $-1$ a half turn.',
      '$z = a + ib = re^{i\\varphi}$, with size $r = \\sqrt{a^2+b^2}$. For example, $|3 + 4i| = 5$.',
      'To multiply, multiply the sizes and add the phases. $z^*z = r^2$ is real and never negative.',
      'Four quarter turns: $1 \\to i \\to -1 \\to -i \\to 1$, so $i^4 = 1$.',
    ],
    equations: 'z = a + ib = re^{i\\varphi},\\qquad e^{i\\varphi} = \\cos\\varphi + i\\sin\\varphi,\\qquad z^*z = r^2 = a^2 + b^2',
    trap: '$|z|^2$ is $z^*z$, not $z^2$. For $z = 1 + i$, $z^*z = 2$ but $z^2 = 2i$.',
    claims: [
      claim('l2ISquared', 'i² = −1', () => close(V.l2ISquared, -1)),
      claim('l2Abs34', '|3 + 4i| = 5', () => close(V.l2Abs34, 5)),
      claim('l2IFourth', 'i⁴ = 1', () => close(V.l2IFourth, 1)),
      claim('l2ModSq1i', 'z*z = 2 for z = 1 + i', () => close(V.l2ModSq1i, 2)),
      claim('l2Sq1i', 'z² = 2i for z = 1 + i', () => close(V.l2Sq1i, 2)),
    ],
  },
  'l2-plus-y': {
    points: [
      'A $+y$ spin must be 50/50 along $z$, which forces $|c| = 1$. It must also be 50/50 along $x$, which forces $c + c^* = 0$.',
      `A real $c = \\pm1$ gives $|{\\pm x}\\rangle$, which reads ${pct(V.l2RealFailPlus)} or ${pct(V.l2RealFailMinus)} along $x$. So it fails.`,
      'So $c = \\pm i$, and $|{\\pm y}\\rangle = (|{+z}\\rangle \\pm i|{-z}\\rangle)/\\sqrt2$. Right-handed axes pick $+i$ for $+y$.',
      'A real Hilbert space is too small for spin: its amplitudes must be complex.',
    ],
    equations: '|{\\pm y}\\rangle = \\tfrac{1}{\\sqrt2}\\big(|{+z}\\rangle \\pm i|{-z}\\rangle\\big),\\qquad |c|^2 = 1,\\ \\ c + c^* = 0\\ \\Rightarrow\\ c = \\pm i',
    trap: 'Forgetting to conjugate the bra of $|{+y}\\rangle$. The row $(1, i)/\\sqrt2$ gives length 0; the correct row $(1, -i)/\\sqrt2$ gives 1.',
    claims: [
      claim('l2YOnZ', '+y is 50/50 along z', () => close(V.l2YOnZ, 0.5)),
      claim('l2YOnX', '+y is 50/50 along x', () => close(V.l2YOnX, 0.5)),
      claim('l2RealFailPlus', 'c = 1: 100 % along +x', () => close(V.l2RealFailPlus, 1)),
      claim('l2RealFailMinus', 'c = −1: 0 % along +x', () => close(V.l2RealFailMinus, 0)),
      claim('l2YNorm', 'the conjugated row gives length 1', () => close(V.l2YNorm, 1)),
      claim('l2YBilinear', 'the unconjugated row gives 0', () => close(V.l2YBilinear, 0)),
    ],
  },
  'l2-three-bases': {
    points: [
      'There are three bases, $z$, $x$ and $y$, and within each pair the states are orthogonal.',
      'They are mutually unbiased: every cross-basis measurement is 50/50, as all 24 ordered checks confirm.',
      '$c = 1, i, -1, -i$ gives $|{+x}\\rangle, |{+y}\\rangle, |{-x}\\rangle, |{-y}\\rangle$: quarter turns of $c$ are quarter turns in the lab.',
      'A spin state is a unit vector in a complex 2D space. That leaves two real parameters once the overall phase is dropped: the two angles of a direction.',
    ],
    equations: '|\\langle a|b\\rangle|^2 = \\tfrac12\\ \\ (a, b \\text{ from different bases}),\\qquad |\\psi\\rangle = \\alpha|{+z}\\rangle + \\beta|{-z}\\rangle,\\ \\ \\langle\\psi|\\psi\\rangle = 1',
    trap: 'Reading “two-dimensional” as “two directions”. The space has two dimensions, yet a spin can be prepared along any direction, including three perpendicular axes, whose bases are mutually unbiased.',
    claims: [
      claim('l2Mub', 'every cross-basis probability is 1/2', () => close(V.l2Mub, 0.5) && V.l2MubAll === 1),
      claim('l2PairsOrth', 'each pair is orthogonal', () => close(V.l2PairsOrth, 0)),
      claim('l2Cycle', 'c = 1, i, −1, −i ↔ +x, +y, −x, −y', () => V.l2Cycle === 1),
      claim('l2MubCount', 'two real parameters remain', () => V.l2MubCount === 2),
    ],
  },
}
