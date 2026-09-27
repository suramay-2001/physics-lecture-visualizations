/**
 * Lecture 7 review cards: the exam layer (owner: P; P-L7-story §5).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L7.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d, tf, uf } from './L7.values'

export const L7_REVIEW: Record<string, ReviewCard> = {
  'l7-two-angles': {
    points: [
      'On the equator the relative phase $\\varphi$ is the azimuth of the Bloch arrow: $\\vec r = (\\cos\\varphi, \\sin\\varphi, 0)$.',
      'Two states whose arrows are $\\Delta\\varphi$ apart overlap with probability $\\cos^2\\tfrac{\\Delta\\varphi}{2}$.',
      'The ray angle is half the Bloch angle, $\\eta = \\Delta\\varphi/2$. Opposite arrows are orthogonal states; perpendicular arrows overlap with probability ½.',
      `Always take the smaller separation, from 0° to 180°: 10° and 350° are 20° apart, so $\\eta = 10^\\circ$ and the probability is ${d(V.l7PShort)}.`,
    ],
    equations: '|\\langle\\psi_1|\\psi_2\\rangle|^2 = \\cos^2\\tfrac{\\Delta\\varphi}{2},\\qquad \\eta = \\arccos|\\langle\\psi_1|\\psi_2\\rangle| = \\tfrac{\\Delta\\varphi}{2}',
    trap: 'Reading the notes’ θ as our polar angle. On the equator the notes’ θ is our azimuth $\\varphi$.',
    claims: [
      claim('l7HalfRule', 'η = Δφ/2 for every sampled pair', () => close(V.l7HalfRule, 0)),
      claim('l7PXY', 'perpendicular arrows overlap with probability ½', () => close(V.l7PXY, 0.5)),
      claim('l7EtaShort', '10° and 350°: η = 10°', () => close(V.l7EtaShort, 10)),
      claim('l7PShort', 'probability 0.970', () => close(V.l7PShort, Math.cos(10 * (Math.PI / 180)) ** 2)),
    ],
  },
  'l7-full-turn': {
    points: [
      '$R_z(\\varphi)$ moves the arrow by $\\varphi$ about $z$ and adds a common phase $e^{-i\\varphi/2}$.',
      'At 360°, $R_z(2\\pi) = -I$: the arrow and every probability return, but the ket is $-|\\psi\\rangle$.',
      'At 720°, $R_z(4\\pi) = +I$: only then is the ket itself back.',
      '$S_z$ generates the turn, $R_z(\\varphi) = e^{-i\\varphi S_z/\\hbar}$ (Unit 6.4).',
    ],
    equations: 'R_z(2\\pi) = -I,\\qquad R_z(4\\pi) = I,\\qquad R_z(\\varphi) = e^{-i\\varphi S_z/\\hbar}',
    trap: 'Putting the turn into the half-angle rule. After 360° the two rays coincide, so $\\eta = 0$, not 180°.',
    claims: [
      claim('l7Rz2piNeg', 'Rz(2π) = −I', () => V.l7Rz2piNeg === 1),
      claim('l7Rz4piId', 'Rz(4π) = I', () => V.l7Rz4piId === 1),
      claim('l7ExpRz', 'Rz(φ) = e^{−iφSz}', () => V.l7ExpRz === 1),
      claim('l7OvFull', 'after 360° the rays coincide: η = 0', () => close(V.l7OvFull, 1)),
    ],
  },
  'l7-order': {
    points: [
      'Recall Unit 3.4 and Unit 4.2: an outcome $a$ has probability $p(a) = \\langle\\psi|P_a|\\psi\\rangle$ and leaves $P_a|\\psi\\rangle/\\sqrt{p(a)}$.',
      `From $|{+z}\\rangle$: with $z$ first, + is certain; with $x$ first, $p(-z) = ${tf(V.l7XzPMinusZ)}$.`,
      'A repeated $z$ measurement repeats its result. The first $z$ reading left a $z$ eigenstate, which gives its own value every time.',
      'Randomness alone does not make order matter; disturbing the other observable’s states does.',
    ],
    equations: 'p(a) = \\langle\\psi|P_a|\\psi\\rangle,\\qquad |\\psi\\rangle \\to \\frac{P_a|\\psi\\rangle}{\\sqrt{p(a)}},\\qquad p(-z) = \\tfrac12\\cdot\\tfrac12 + \\tfrac12\\cdot\\tfrac12 = \\tfrac12',
    trap: 'Blaming randomness. A $|{+x}\\rangle$ beam through two $z$ magnets is random, yet their order cannot matter.',
    claims: [
      claim('l7XzPMinusZ', 'x first: p(−z) = ½', () => close(V.l7XzPMinusZ, 0.5)),
      claim('l7ZzFirstMinus', 'z first: p(−z) = 0', () => close(V.l7ZzFirstMinus, 0)),
      claim('l7XzzMinus', 'a repeated z reading never flips', () => close(V.l7XzzMinus, 0)),
    ],
  },
  'l7-compatible': {
    points: [
      'A complete shared eigenbasis holds exactly when $[A, B] = 0$, for Hermitian matrices.',
      'Measurement order is set by projectors: the joint probabilities are $\\|Q_bP_a|\\psi\\rangle\\|^2$ and $\\|P_aQ_b|\\psi\\rangle\\|^2$.',
      '$[S_x, S_y] = i\\hbar S_z$ and its cyclic partners. Two spin components commute only for parallel or opposite axes.',
      `A nonzero commutator says order *can* matter: from $|{+y}\\rangle$ both orders give ${uf(V.l7JointYZX)} for + then +, yet the final states differ.`,
    ],
    equations: '[A, B] = AB - BA,\\qquad [S_x, S_y] = i\\hbar S_z,\\quad [S_y, S_z] = i\\hbar S_x,\\quad [S_z, S_x] = i\\hbar S_y',
    trap: 'Thinking $[A, B] = 0$ makes every outcome certain. Commuting observables can still be random in a [[superposition]] of their shared eigenstates.',
    claims: [
      claim('l7CommSzB', '[Sz, I + 4Sz] = 0', () => close(V.l7CommSzB, 0)),
      claim('l7CommXY', '[Sx, Sy] = iSz', () => V.l7CommXY === 1),
      claim('l7CrossRule', 'the cross-product rule for tilted components', () => V.l7CrossRule === 1),
      claim('l7JointYZX', 'from |+y⟩: ¼ in both orders', () => close(V.l7JointYZX, 0.25)),
    ],
  },
  'l7-spreads': {
    points: [
      'Recall Unit 3.6: $(\\Delta A)^2 = \\langle A^2\\rangle - \\langle A\\rangle^2$, measured on fresh copies of one state.',
      'For spin, $(\\Delta S_j)^2 = \\tfrac{\\hbar^2}{4}(1 - r_j^2)$: $\\Delta S_j$ is $\\hbar/2$ times the distance from the Bloch point to the $j$ axis.',
      'In $|{+z}\\rangle$, $\\Delta S_z = 0$ and $\\Delta S_x = \\Delta S_y = \\hbar/2$.',
      `The three squared spreads always add to ${d(V.l7SumSq, 1)}ħ².`,
    ],
    equations: '(\\Delta S_j)^2 = \\tfrac{\\hbar^2}{4}\\,(1 - r_j^2),\\qquad p_\\pm = \\tfrac12 \\pm \\frac{\\langle S_{\\hat n}\\rangle}{\\hbar}',
    trap: 'Confusing the spread with the error of an average. The average’s error shrinks like $1/\\sqrt N$; the spread of single readings does not.',
    claims: [
      claim('l7SpreadFormula', '(ΔS_j)² = (1 − r_j²)/4', () => close(V.l7SpreadFormula, 0)),
      claim('l7SumSq', 'the three variances add to 0.5', () => close(V.l7SumSq, 0.5)),
      claim('l7SdZx', 'ΔSx = ħ/2 in |+z⟩', () => close(V.l7SdZx, 0.5)),
      claim('l7PzX', 'the ½ in p± is p₊ when ⟨Sₙ⟩ = 0', () => close(V.l7PzX, 0.5)),
    ],
  },
  'l7-uncertainty': {
    points: [
      'For spin, $\\Delta S_x\\Delta S_y \\ge \\tfrac{\\hbar}{2}\\lvert\\langle S_z\\rangle\\rvert = \\tfrac12\\lvert\\langle[S_x, S_y]\\rangle\\rvert$, from $|\\vec r| = 1$ alone.',
      `The bound is met exactly when $r_xr_y = 0$; the largest gap, ${d(V.l7MaxGap)}ħ², sits on the equator, midway between the $x$ and $y$ axes.`,
      'In general $\\Delta A\\,\\Delta B \\ge \\tfrac12\\lvert\\langle[A, B]\\rangle\\rvert$ (Robertson); $[x, p_x] = i\\hbar I$ will give $\\Delta x\\,\\Delta p_x \\ge \\hbar/2$.',
      'Both spreads belong to one preparation. The bound is not a statement about one measurement disturbing the next.',
    ],
    equations: '(\\Delta S_x\\Delta S_y)^2 = \\tfrac{\\hbar^4}{16}\\,(r_z^2 + r_x^2r_y^2) \\;\\ge\\; \\tfrac{\\hbar^2}{4}\\langle S_z\\rangle^2',
    trap: 'Reading a zero floor as “they commute”. In $|{+x}\\rangle$ the floor is 0, but $[S_x, S_y] = i\\hbar S_z \\ne 0$.',
    claims: [
      claim('l7MaxGap', 'largest gap 0.125ħ²', () => close(V.l7MaxGap, 0.125)),
      claim('l7ExactEq', 'the line before the ≥ is exact', () => close(V.l7ExactEq, 0)),
      claim('l7CommAvgX', 'at |+x⟩ the average commutator is 0', () => close(V.l7CommAvgX, 0)),
      claim('l7BoundSharp', 'the ½ in the bound: at |+z⟩, ΔSxΔSy = ½|⟨[Sx, Sy]⟩|', () => close(V.l7BoundSharp, 0.5)),
    ],
  },
}
