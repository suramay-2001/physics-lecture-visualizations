/**
 * Lecture 4 review cards: the exam layer (owner: P; P-L4-story §5).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L4.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d, tf, uf } from './L4.values'

export const L4_REVIEW: Record<string, ReviewCard> = {
  'l4-basis': {
    points: [
      'An observable is a Hermitian operator. Its eigenvalues are the only results, and each eigenstate gives its result for certain.',
      'Its eigenvectors can be chosen **orthonormal** (no overlap), and they are **complete** (every state is a sum of them). These are two separate facts.',
      `Perfectly distinguishable states are orthogonal: $\\langle{+z}|{-z}\\rangle = 0$, but $\\langle{+z}|{+x}\\rangle \\approx ${d(V.l4ZXOverlap)}$.`,
      'A repeated eigenvalue allows eigenvectors that overlap; Gram–Schmidt replaces them by orthonormal ones.',
    ],
    equations: '\\hat A^\\dagger = \\hat A,\\quad \\hat A|a_i\\rangle = a_i|a_i\\rangle,\\quad \\langle a_i|a_j\\rangle = \\delta_{ij},\\quad \\sum_i \\hat P_i = I',
    trap: 'Thinking a superposition such as $|{+x}\\rangle$ falls outside an $S_z$ measurement. Complete means every state is a sum over the basis, not that every state is a basis state.',
    claims: [
      claim('l4ZXOverlap', '⟨+z|+x⟩ = 0.707', () => close(V.l4ZXOverlap, Math.SQRT1_2)),
      claim('l4ZMinusZ', '⟨+z|−z⟩ = 0', () => close(V.l4ZMinusZ, 0)),
      claim('l4ComplZ', 'P̂₊z + P̂₋z = I', () => V.l4ComplZ === 1),
      claim('l4GsE2IsDown', 'Gram–Schmidt turns (|+z⟩, |+x⟩) into (|+z⟩, |−z⟩)', () => V.l4GsE2IsDown === 1),
    ],
  },
  'l4-projectors': {
    points: [
      'Measured itself, $\\hat P_{+z}$ is a yes/no question: 1 (yes, state $|{+z}\\rangle$) or 0 (no, state $|{-z}\\rangle$).',
      'Its range is the up line, but its eigenbasis spans both directions.',
      'One projector gives one outcome’s share; the complete family sums to $I$; $\\hat A = \\sum_i a_i\\hat P_i$ adds the result labels.',
      'As filters, the same filter twice loses nothing and opposite filters pass nothing. Measurement projectors also need $\\hat P^\\dagger = \\hat P$.',
      `For $|{+x}\\rangle$, “yes” has probability ${uf(V.l4PuMeanX)}.`,
    ],
    equations: '\\hat P_{+z} = \\begin{pmatrix}1&0\\\\0&0\\end{pmatrix},\\quad \\hat P_{-z} = I - \\hat P_{+z},\\quad \\hat P_{+z}^2 = \\hat P_{+z},\\quad \\hat P_{+z}\\hat P_{-z} = 0',
    trap: 'Writing the state after a “no” as $\\hat P_{+z}|\\psi\\rangle$, or as the zero vector. A “no” leaves $|{-z}\\rangle$; the zero vector is not a state.',
    claims: [
      claim('l4PuEigTop', 'P̂₊z: results 1 …', () => close(V.l4PuEigTop, 1)),
      claim('l4PuEigLow', '… and 0', () => close(V.l4PuEigLow, 0)),
      claim('l4PuMeanX', 'P(yes) = ½ for |+x⟩', () => close(V.l4PuMeanX, 0.5)),
      claim('l4PuIdem', 'P̂₊z² = P̂₊z', () => V.l4PuIdem === 1),
      claim('l4PuPdZero', 'P̂₊zP̂₋z = 0', () => close(V.l4PuPdZero, 0)),
      claim('l4PdIsIMinusPu', 'P̂₋z = I − P̂₊z', () => V.l4PdIsIMinusPu === 1),
    ],
  },
  'l4-example': {
    points: [
      '$|\\psi\\rangle = \\tfrac{\\sqrt3}{2}|{+z}\\rangle + \\tfrac12|{-z}\\rangle$ is normalized: $\\tfrac34 + \\tfrac14 = 1$.',
      'Measuring $S_z$ gives $+\\tfrac{\\hbar}{2}$ with probability $\\tfrac34$, then $|{+z}\\rangle$; or $-\\tfrac{\\hbar}{2}$ with probability $\\tfrac14$, then $|{-z}\\rangle$.',
      'Repeating the measurement at once repeats the result with probability 1.',
      'The amplitude $\\tfrac{\\sqrt3}{2}$, the probability $\\tfrac34$, the result $+\\tfrac{\\hbar}{2}$ and the state $|{+z}\\rangle$ are four different things.',
    ],
    equations: 'P(\\pm\\tfrac{\\hbar}{2}) = |\\langle{\\pm z}|\\psi\\rangle|^2 = \\tfrac34,\\ \\tfrac14,\\qquad |\\psi\\rangle \\to \\frac{\\hat P_{+z}|\\psi\\rangle}{\\sqrt{3/4}} = |{+z}\\rangle',
    trap: `Reporting the amplitude $\\tfrac{\\sqrt3}{2} \\approx ${d(V.l4PsiAmpUp)}$ as the probability. The probability is its square, ${d(V.l4PsiUp, 2)}.`,
    claims: [
      claim('l4PsiUp', 'P(+ħ/2) = ¾', () => close(V.l4PsiUp, 0.75)),
      claim('l4PsiDown', 'P(−ħ/2) = ¼', () => close(V.l4PsiDown, 0.25)),
      claim('l4PsiAmpDown', 'the |−z⟩ amplitude is ½', () => close(V.l4PsiAmpDown, 0.5)),
      claim('l4PsiAmpUp', 'the |+z⟩ amplitude is 0.866', () => close(V.l4PsiAmpUp, Math.sqrt(3) / 2)),
      claim('l4RepeatUp', 'a repeat is certain', () => close(V.l4RepeatUp, 1)),
      claim('l4PsiNorm', 'ψ is normalized', () => close(V.l4PsiNorm, 1)),
    ],
  },
  'l4-average': {
    points: [
      'For this state, $\\langle S_z\\rangle = \\tfrac{\\hbar}{4}$, yet every single reading is $\\pm\\tfrac{\\hbar}{2}$.',
      '“Repeat” has two meanings: fresh preparations give the 3 : 1 mix, and re-measuring one atom repeats its first answer.',
      'The sandwich gives the same $\\tfrac{\\hbar}{4}$, in ket form or as row × matrix × column, in any basis.',
      '$\\hat A|\\psi\\rangle$ is **not** the state after a measurement; it is only a step inside the sandwich.',
    ],
    equations: '\\langle A\\rangle = \\sum_i a_i P(a_i) = \\langle\\psi|\\hat A|\\psi\\rangle,\\qquad \\langle S_z\\rangle = \\tfrac{\\hbar}{2}\\cdot\\tfrac34 - \\tfrac{\\hbar}{2}\\cdot\\tfrac14 = \\tfrac{\\hbar}{4}',
    trap: 'The notes’ own slip: “the mean is zero” for this state. Zero is the mean for $|{+x}\\rangle$; here it is $\\tfrac{\\hbar}{4}$.',
    claims: [
      claim('l4MeanSz', '⟨Sz⟩ = ħ/4', () => close(V.l4MeanSz, 0.25)),
      claim('l4MeanSzX', 'zero is the mean for |+x⟩', () => close(V.l4MeanSzX, 0)),
      claim('l4MeanSzInX', 'the same ħ/4 in the x basis', () => close(V.l4MeanSzInX, 0.25)),
      claim('l4PsiUp', '¾ …', () => close(V.l4PsiUp, 0.75)),
      claim('l4PsiDown', '… and ¼', () => close(V.l4PsiDown, 0.25)),
    ],
  },
  'l4-matrices': {
    points: [
      'Column $j$ of a matrix is where the operator sends basis vector $j$; the eigen-conditions fix $S_z$ at once.',
      '$S_x$ and $S_y$ come from weighting the outcome projectors by $\\pm\\tfrac{\\hbar}{2}$.',
      `For $|{+y}\\rangle$ the bra conjugates the $i$. Without it, the corner of $P_{+y}$ reads $-${tf(-V.l4ChNoConj11)}$ instead of $${tf(V.l4PyEntry11)}$, and the matrix squares to zero.`,
      'All three are Hermitian. The subscript names what is measured; the basis names the coordinates, here always $z$.',
    ],
    equations: 'S_x = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix},\\quad S_y = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&-i\\\\i&0\\end{pmatrix},\\quad S_z = \\tfrac{\\hbar}{2}\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix},\\quad S_i = \\tfrac{\\hbar}{2}\\sigma_i',
    trap: 'Believing a matrix with an $i$ cannot be Hermitian. Hermitian means $A_{ij} = A_{ji}^*$, and $S_y$ satisfies it.',
    claims: [
      claim('l4PyEntry11', 'P₊y has ½ in its lower-right corner', () => close(V.l4PyEntry11, 0.5)),
      claim('l4ChNoConj11', 'without the conjugate it reads −½', () => close(V.l4ChNoConj11, -0.5)),
      claim('l4ChNoConjSquare', 'and that matrix squares to zero', () => close(V.l4ChNoConjSquare, 0)),
      claim('l4SpinHerm', 'Sx, Sy, Sz are Hermitian', () => V.l4SpinHerm === 1),
      claim('l4SigmaHalf', 'Sᵢ = (ħ/2)σᵢ', () => V.l4SigmaHalf === 1),
    ],
  },
  'l4-eigen': {
    points: [
      'Nonzero solutions of $(A - \\lambda I)\\binom{c_1}{c_2} = 0$ need $\\det(A - \\lambda I) = 0$; its roots are the possible results.',
      'Put each root back, solve for the ratio of the components, normalize, and fix the phase: first nonzero component real and positive.',
      'For $S_x$: $\\pm\\tfrac{\\hbar}{2}$, with $|{\\pm x}\\rangle = \\tfrac{1}{\\sqrt2}\\binom{1}{\\pm1}$, orthogonal and complete.',
      `For any $\\alpha|{+z}\\rangle + \\beta|{-z}\\rangle$, $P(\\pm\\tfrac{\\hbar}{2}) = \\tfrac12|\\alpha\\pm\\beta|^2$. For the state of Unit 4.3 that is ${d(V.l4PsiXPlus)} and ${d(V.l4PsiXMinus)}.`,
    ],
    equations: '\\det(S_x - \\lambda I) = \\lambda^2 - \\tfrac{\\hbar^2}{4} = 0,\\qquad \\langle{\\pm x}|\\psi\\rangle = \\frac{\\alpha\\pm\\beta}{\\sqrt2},\\qquad \\langle S_x\\rangle = \\langle\\psi|\\hat S_x|\\psi\\rangle',
    trap: 'Normalizing $\\binom11$ to $\\tfrac12\\binom11$. The squared components must add to 1, so each component is $1/\\sqrt2$.',
    claims: [
      claim('l4PsiXPlus', 'ψ along x: 0.933 …', () => close(V.l4PsiXPlus, (2 + Math.sqrt(3)) / 4)),
      claim('l4PsiXMinus', '… and 0.067', () => close(V.l4PsiXMinus, (2 - Math.sqrt(3)) / 4)),
      claim('l4HalfFactor', 'the ½ of ½|α ± β|², and the wrong ½ of the trap', () => close(V.l4HalfFactor, 0.5)),
      claim('l4CharPolyDet', 'det(Sx − λI) = λ² − ¼', () => close(V.l4CharPolyDet, -0.25) && close(V.l4CharPolyLin, 0)),
      claim('l4SxEigUp', 'roots ±½', () => close(V.l4SxEigUp, 0.5) && close(V.l4SxEigDown, -0.5)),
      claim('l4EigForAgree', 'back-substitution gives |±x⟩', () => V.l4EigForAgree === 1),
    ],
  },
}
