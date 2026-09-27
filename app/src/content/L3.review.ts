/**
 * Lecture 3 review cards: the exam layer (owner: P; P-L3-story §5).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L3.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d, uf } from './L3.values'

export const L3_REVIEW: Record<string, ReviewCard> = {
  'l3-operators': {
    points: [
      'A linear operator turns states into states and respects sums and multiples.',
      'Its action on the two basis states fixes its action on every state.',
      'In a basis the operator becomes a matrix: $A_{ij} = \\langle i|\\hat A|j\\rangle$, and column $j$ is the image of $|j\\rangle$.',
      `A column is a state’s coordinates in one basis, not the state itself: $|{+x}\\rangle$ has parts ${d(V.l3ZXOverlap)}, ${d(V.l3MZXOverlap)} in $z$ but 1, 0 in $x$.`,
    ],
    equations: '\\hat A|\\psi\\rangle = |\\phi\\rangle,\\qquad \\hat A(c_1|\\psi_1\\rangle + c_2|\\psi_2\\rangle) = c_1\\hat A|\\psi_1\\rangle + c_2\\hat A|\\psi_2\\rangle,\\qquad A_{ij} = \\langle i|\\hat A|j\\rangle',
    trap: 'Writing the images of the basis states as the matrix’s rows. They are its columns; rows give the transpose.',
    claims: [
      claim('l3ZXOverlap', '|+x⟩ has z parts 0.707 …', () => close(V.l3ZXOverlap, Math.SQRT1_2)),
      claim('l3MZXOverlap', '… and 0.707', () => close(V.l3MZXOverlap, Math.SQRT1_2)),
      claim('l3XinX1', 'and x parts 1 …', () => close(V.l3XinX1, 1)),
      claim('l3XinX2', '… and 0', () => close(V.l3XinX2, 0)),
    ],
  },
  'l3-eigen': {
    points: [
      'An eigenvector stays on its own line: $\\hat A|a\\rangle = a|a\\rangle$.',
      '$\\hat S_z$ has eigenvectors $|{\\pm z}\\rangle$ and eigenvalues $\\pm\\tfrac{\\hbar}{2}$: the states of the two beams and the two readings of SG$_z$.',
      'Hermitian means $\\hat A^\\dagger = \\hat A$ (conjugate, then transpose). Then the eigenvalues are real, and the eigenvectors can form an orthonormal basis.',
      `Complex entries are allowed: $H$ is Hermitian, with eigenvalues $\\pm\\sqrt5 \\approx \\pm${d(V.l3HEigPlus)}$.`,
      'A measurement theory must answer three questions: which results, with what odds, and which state afterward.',
    ],
    equations: '\\hat A|a\\rangle = a|a\\rangle,\\qquad \\hat S_z|{\\pm z}\\rangle = \\pm\\tfrac{\\hbar}{2}|{\\pm z}\\rangle,\\qquad (A^\\dagger)_{ij} = A_{ji}^*,\\qquad \\hat A^\\dagger = \\hat A',
    trap: 'Thinking every operator could be an observable. $R = \\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}$ has eigenvalues $\\pm i$, which no meter can show.',
    claims: [
      claim('l3SzEigUp', 'Ŝz: +ħ/2 …', () => close(V.l3SzEigUp, 0.5)),
      claim('l3SzEigDown', '… and −ħ/2', () => close(V.l3SzEigDown, -0.5)),
      claim('l3HEigPlus', 'H: ±√5 = ±2.236', () => close(V.l3HEigPlus, Math.sqrt(5)) && close(V.l3HEigMinus, -Math.sqrt(5))),
      claim('l3REigIm', 'R: ±i', () => close(V.l3REigIm, 1) && close(V.l3REigRe, 0)),
    ],
  },
  'l3-projectors': {
    points: [
      'A projector keeps one part of a state: $\\hat P_{+z}|\\psi\\rangle = c_+|{+z}\\rangle$, with $c_+ = \\langle{+z}|\\psi\\rangle$.',
      'Projecting twice changes nothing: $\\hat P_{+z}^2 = \\hat P_{+z}$.',
      'For a complete orthonormal basis the projectors add up to $\\hat 1$. That is why $|\\psi\\rangle = \\sum_i c_i|a_i\\rangle$ with $c_i = \\langle a_i|\\psi\\rangle$.',
      'An observable is its outcomes times its projectors: $\\hat S_z = \\tfrac{\\hbar}{2}\\hat P_{+z} - \\tfrac{\\hbar}{2}\\hat P_{-z}$.',
    ],
    equations: '\\hat P_{+z} = |{+z}\\rangle\\langle{+z}|,\\quad \\hat P_{+z}^2 = \\hat P_{+z},\\quad \\sum_i|a_i\\rangle\\langle a_i| = \\hat 1,\\quad \\hat A = \\sum_i a_i|a_i\\rangle\\langle a_i|',
    trap: `Treating a projected vector as a state. It must be rescaled: $\\hat P_{+z}|\\psi_{60}\\rangle$ has length ${uf(V.l3PuP60Len)}, not 1.`,
    claims: [
      claim('l3PuP60Len', '|P̂₊z ψ₆₀| = ½', () => close(V.l3PuP60Len, 0.5)),
      claim('l3PuIdem', 'P̂₊z² = P̂₊z', () => V.l3PuIdem === 1),
      claim('l3ComplZ', 'P̂₊z + P̂₋z = 1̂', () => V.l3ComplZ === 1 && V.l3ComplX === 1),
      claim('l3SpecSz', 'Ŝz = (ħ/2)P̂₊z − (ħ/2)P̂₋z', () => V.l3SpecSz === 1),
    ],
  },
  'l3-postulates': {
    points: [
      'Rule 1: the result is one eigenvalue $a_i$, even when the state is a superposition.',
      'Rule 2 (Born): $P(a_i) = |\\langle a_i|\\psi\\rangle|^2 = \\langle\\psi|\\hat P_i|\\psi\\rangle$, and for a normalized state completeness makes the odds sum to 1.',
      'Rule 3: for a nondegenerate $a_i$ the state becomes $\\hat P_i|\\psi\\rangle/\\sqrt{\\langle\\psi|\\hat P_i|\\psi\\rangle}$, which is $|a_i\\rangle$ up to an overall phase.',
      `Values: for $|\\psi_{60}\\rangle$ along $z$, ${uf(V.l3P60Up)} and ${uf(V.l3P60Down)}; along $x$, ${d(V.l3P60PlusX)} and ${d(V.l3P60MinusX)}.`,
    ],
    equations: 'P(a_i) = |\\langle a_i|\\psi\\rangle|^2 = \\langle\\psi|\\hat P_i|\\psi\\rangle,\\qquad |\\psi\\rangle \\to \\frac{\\hat P_i|\\psi\\rangle}{\\sqrt{\\langle\\psi|\\hat P_i|\\psi\\rangle}}',
    trap: 'Measuring $A$ is not applying $\\hat A$. $\\hat S_z|{+x}\\rangle = \\tfrac{\\hbar}{2}|{-x}\\rangle$, but an $S_z$ measurement leaves $|{+z}\\rangle$ or $|{-z}\\rangle$.',
    claims: [
      claim('l3P60Up', 'ψ₆₀ along z: ¼ …', () => close(V.l3P60Up, 0.25)),
      claim('l3P60Down', '… and ¾', () => close(V.l3P60Down, 0.75)),
      claim('l3P60PlusX', 'along x: 0.933 …', () => close(V.l3P60PlusX, (2 + Math.sqrt(3)) / 4)),
      claim('l3P60MinusX', '… and 0.067', () => close(V.l3P60MinusX, (2 - Math.sqrt(3)) / 4)),
      claim('l3SzOnXIsMinusX', 'Ŝz|+x⟩ = (ħ/2)|−x⟩', () => V.l3SzOnXIsMinusX === 1),
    ],
  },
  'l3-spin-example': {
    points: [
      `$|{+x}\\rangle$ along $z$: $\\pm\\tfrac{\\hbar}{2}$, with probability ${uf(V.l3ProbZX)} each.`,
      'After a + result the state is $|{+z}\\rangle$, so a repeat $S_z$ gives + with certainty.',
      `An $S_x$ magnet in between leaves $|{\\pm x}\\rangle$, and a final $S_z$ is 50/50 again: ${uf(V.l3ZxzPlus)} of the source lands in the final + spot.`,
      'A measurement leaves a state alone only if the state is one of its eigenvectors.',
    ],
    equations: 'P(\\pm\\tfrac{\\hbar}{2}) = |\\langle{\\pm z}|{+x}\\rangle|^2 = \\tfrac12,\\qquad |{+z}\\rangle = \\tfrac{1}{\\sqrt2}\\big(|{+x}\\rangle + |{-x}\\rangle\\big)',
    trap: `Dividing by the wrong total. ${uf(V.l3ZxzPlus)} is the share of the source; ${uf(V.l3ProbZX)} is the share of the atoms that reach the last magnet.`,
    claims: [
      claim('l3ProbZX', 'P(+z | +x) = ½', () => close(V.l3ProbZX, 0.5)),
      claim('l3ZxzPlus', '⅛ of the source lands in the final + spot', () => close(V.l3ZxzPlus, 0.125)),
      claim('l3RepeatCertain', 'a repeat is certain', () => close(V.l3RepeatCertain, 1)),
      claim('l3ProbXZ', 'P(+x | +z) = ½', () => close(V.l3ProbXZ, 0.5)),
    ],
  },
  'l3-spread': {
    points: [
      '$\\langle A\\rangle = \\sum_i a_i P(a_i) = \\langle\\psi|\\hat A|\\psi\\rangle$: a mean over many identical runs.',
      '$|{+x}\\rangle$ has $\\langle S_z\\rangle = 0$, yet no atom reads 0.',
      '$(\\Delta A)^2 = \\langle A^2\\rangle - \\langle A\\rangle^2$. For a spin ½, $\\langle S_z^2\\rangle = \\tfrac{\\hbar^2}{4}$ always, so $\\Delta S_z = \\tfrac{\\hbar}{2}$ for $|{+x}\\rangle$ and 0 for $|{+z}\\rangle$.',
      `For $|\\psi_{60}\\rangle$: $\\langle S_z\\rangle = -\\tfrac{\\hbar}{4}$ and $\\Delta S_z \\approx ${d(V.l3SpreadP60)}\\hbar$.`,
    ],
    equations: '\\langle A\\rangle = \\langle\\psi|\\hat A|\\psi\\rangle,\\qquad (\\Delta A)^2 = \\langle A^2\\rangle - \\langle A\\rangle^2,\\qquad \\Delta A = 0 \\;\\Leftrightarrow\\; \\hat A|\\psi\\rangle \\propto |\\psi\\rangle',
    trap: 'Reading $\\langle S_z\\rangle = 0$ as “the spin has no $z$ part”. Each atom reads $\\pm\\tfrac{\\hbar}{2}$; zero is only the mean, and the spread is as large as it gets.',
    claims: [
      claim('l3MeanSzX', '⟨Sz⟩ = 0 for |+x⟩', () => close(V.l3MeanSzX, 0)),
      claim('l3SpreadX', 'ΔSz = ħ/2 for |+x⟩', () => close(V.l3SpreadX, 0.5)),
      claim('l3VarSzUp', 'ΔSz = 0 for |+z⟩', () => close(V.l3VarSzUp, 0)),
      claim('l3SpreadP60', 'ΔSz = 0.433ħ for ψ₆₀', () => close(V.l3SpreadP60, Math.sqrt(3) / 4)),
      claim('l3MeanSzP60', '⟨Sz⟩ = −ħ/4 for ψ₆₀', () => close(V.l3MeanSzP60, -0.25)),
      claim('l3ZeroSpreadIffEigen', 'ΔA = 0 exactly for eigenvectors (Ŝz, Ŝx, M/4 on sampled states)', () => V.l3ZeroSpreadIffEigen === 1),
    ],
  },
}
