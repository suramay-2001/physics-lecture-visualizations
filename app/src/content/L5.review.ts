/**
 * Lecture 5 review cards: the exam layer (owner: P; P-L5-story §5).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L5.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d, tf } from './L5.values'

export const L5_REVIEW: Record<string, ReviewCard> = {
  'l5-averages': {
    points: [
      'One rule gives every average: $\\langle S_k\\rangle = \\langle\\psi|S_k|\\psi\\rangle$ for $k = x, y, z$, one matrix product each.',
      '$\\langle S_z\\rangle$ depends only on the populations; $\\langle S_x\\rangle$ and $\\langle S_y\\rangle$ depend on the coherence $\\alpha^*\\beta$.',
      `For $c_z = (\\tfrac{\\sqrt3}{2}, \\tfrac{i}{2})$: $\\langle S_z\\rangle = \\tfrac{\\hbar}{4}$, $\\langle S_x\\rangle = 0$ and $\\langle S_y\\rangle \\approx ${d(V.l5MeanSy)}\\,\\hbar$.`,
      'Each average is taken over its own ensemble; no single atom has all three values.',
    ],
    equations: '\\langle S_z\\rangle = \\tfrac{\\hbar}{2}(\\lvert\\alpha\\rvert^2 - \\lvert\\beta\\rvert^2),\\qquad \\langle S_x\\rangle = \\hbar\\,\\mathrm{Re}(\\alpha^*\\beta),\\qquad \\langle S_y\\rangle = \\hbar\\,\\mathrm{Im}(\\alpha^*\\beta)',
    trap: 'Forgetting to conjugate in the bra. Written as $(\\alpha, \\beta)$ instead of $(\\alpha^*, \\beta^*)$, the notes’ state would give $\\langle S_y\\rangle = 0$. A real observable always has a real average.',
    claims: [
      claim('l5MeanSy', '⟨Sy⟩ ≈ 0.433ħ', () => close(V.l5MeanSy, Math.sqrt(3) / 4)),
      claim('l5MeanSz', '⟨Sz⟩ = ħ/4', () => close(V.l5MeanSz, 0.25)),
      claim('l5MeanSx', '⟨Sx⟩ = 0', () => close(V.l5MeanSx, 0)),
      claim('l5CohRuleY', '⟨Sy⟩ = ħ Im(α*β)', () => close(V.l5CohRuleY, 0)),
      claim('l5SyReal', 'the conjugated sandwich of Sy is real', () => close(V.l5SyReal, 0)),
    ],
  },
  'l5-inverse': {
    points: [
      'Eigenvalues are the possible readings; normalized eigenvectors are the states that give each reading for sure.',
      'Recipe: $\\det(A - \\lambda I) = 0$, then $(A - \\lambda I)\\binom{c_1}{c_2} = 0$, then length 1 and a phase choice.',
      'A Hermitian matrix, even with complex entries, gives real readings and orthogonal eigenvectors.',
      'Those eigenvectors form an orthonormal basis: the natural coordinates for that observable.',
    ],
    equations: '\\det(S_x - \\lambda I) = \\lambda^2 - \\tfrac{\\hbar^2}{4} = 0 \\;\\Rightarrow\\; \\lambda = \\pm\\tfrac{\\hbar}{2},\\qquad |{\\pm x}\\rangle = \\tfrac{1}{\\sqrt2}\\binom{1}{\\pm1}',
    trap: 'Thinking $-\\tfrac{1}{\\sqrt2}\\binom11$ is a different answer from $\\tfrac{1}{\\sqrt2}\\binom11$. It is the same state; the course only fixes the phase, first entry real and positive.',
    claims: [
      claim('l5CharPolyDet', 'det(Sx − λI) = λ² − ¼', () => close(V.l5CharPolyDet, -0.25) && close(V.l5CharPolyLin, 0)),
      claim('l5SxBackSub', 'back-substitution gives |±x⟩', () => V.l5SxBackSub === 1),
      claim('l5MinusXNegSame', 'a sign changes no state', () => V.l5MinusXNegSame === 1),
      claim('l5DirOrth', 'eigenvectors are orthogonal', () => close(V.l5DirOrth, 0)),
    ],
  },
  'l5-coordinates': {
    points: [
      'A column means nothing until its basis is named: $(1, 0)$ is $|{+z}\\rangle$ in $z$ coordinates and $|{+x}\\rangle$ in $x$ coordinates.',
      '$B_{z\\leftarrow x}$ has the new basis vectors, in old coordinates, as columns; it turns $x$ coordinates into $z$ coordinates.',
      'Orthonormal columns make it unitary, so the way back is its conjugate transpose, $B_{x\\leftarrow z} = B_{z\\leftarrow x}^\\dagger$.',
      `The new coordinates are amplitudes: $c_x = (\\langle{+x}|\\psi\\rangle, \\langle{-x}|\\psi\\rangle)$, here $(${d(V.l5Psi30U)}, ${d(V.l5Psi30V)})$ for the state of Unit 4.3.`,
      'Nothing physical happens; only the description changes.',
    ],
    equations: 'c_z = B_{z\\leftarrow x}\\,c_x,\\qquad c_x = B_{z\\leftarrow x}^\\dagger\\,c_z,\\qquad B^\\dagger B = I,\\qquad B_{z\\leftarrow x} = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}',
    trap: 'Trusting that $B = B^\\dagger$. It holds for the $x$ basis by luck; for the $y$ basis the two differ, so always keep track of the arrow’s direction.',
    claims: [
      claim('l5Psi30U', 'c_x = (0.966, …', () => close(V.l5Psi30U, Math.cos(Math.PI / 12))),
      claim('l5Psi30V', '… 0.259)', () => close(V.l5Psi30V, Math.sin(Math.PI / 12))),
      claim('l5XinX', '|+x⟩ is (1, 0) in x coordinates', () => V.l5XinX === 1),
      claim('l5BzxUnitary', 'B_{z←x} is unitary', () => V.l5BzxUnitary === 1),
      claim('l5BySym', 'for y the two arrows differ', () => V.l5BySym === 0),
    ],
  },
  'l5-operators': {
    points: [
      'An operator’s matrix changes with the basis; the operator itself does not.',
      'Read $B_{x\\leftarrow z}A^{(z)}B_{z\\leftarrow x}$ from right to left: into $z$, act, back to $x$.',
      'Written in its own eigenbasis, an operator’s matrix keeps only its eigenvalues, down the diagonal, because $AB = BD$.',
      `Townsend’s opposite sign for $|{-x}\\rangle$ turns the off-diagonal entries of $S_z^{(x)}$ from $${tf(V.l5SzInXOff)}$ to $-${tf(-V.l5SzInXTOff)}$ (ħ = 1), but changes no prediction.`,
    ],
    equations: 'A^{(x)} = B_{x\\leftarrow z}\\,A^{(z)}\\,B_{z\\leftarrow x},\\qquad S_x^{(x)} = \\tfrac{\\hbar}{2}\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix},\\qquad S_z^{(x)} = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}',
    trap: 'Reading $S_z^{(x)}$ as “the $x$ spin” because its numbers match $S_x^{(z)}$. The subscript names the component measured; the superscript names the coordinates.',
    claims: [
      claim('l5SzInXOff', 'Sz⁽ˣ⁾ off-diagonal ½ …', () => close(V.l5SzInXOff, 0.5)),
      claim('l5SzInXTOff', '… −½ with Townsend’s phase', () => close(V.l5SzInXTOff, -0.5)),
      claim('l5SzInXIsSx', 'Sz⁽ˣ⁾ has the numbers of Sx⁽ᶻ⁾', () => V.l5SzInXIsSx === 1),
      claim('l5SxInXDiag', 'Sx⁽ˣ⁾ = diag(½, −½)', () => V.l5SxInXDiag === 1),
      claim('l5TownsendMean', 'no prediction changes', () => close(V.l5TownsendMean, V.l5OurMean)),
    ],
  },
  'l5-invariance': {
    points: [
      'Convert the state and the operator together, and every average is unchanged: $|{+z}\\rangle$ gives $\\langle S_z\\rangle = \\tfrac{\\hbar}{2}$ in $x$ coordinates too.',
      'Two nonzero entries in $c_x$ are $x$ amplitudes; they say nothing about uncertainty in $z$.',
      'Probabilities survive too, with the converted projector $B^\\dagger P B$.',
      'A basis change relabels; a rotation (Lecture 6) changes the state.',
    ],
    equations: 'c_{\\text{new}}^\\dagger A^{(\\text{new})}c_{\\text{new}} = (c_{\\text{old}}^\\dagger B)(B^\\dagger A^{(\\text{old})}B)(B^\\dagger c_{\\text{old}}) = c_{\\text{old}}^\\dagger A^{(\\text{old})}c_{\\text{old}}',
    trap: `Mixing bases. A column in $x$ coordinates with a matrix in $z$ coordinates gives $\\langle S_z\\rangle = ${d(V.l5MixedWrong, 0)}$ for $|{+z}\\rangle$, instead of $\\tfrac{\\hbar}{2}$.`,
    claims: [
      claim('l5ZMeanInX', '⟨Sz⟩ = ħ/2 in x coordinates', () => close(V.l5ZMeanInX, 0.5)),
      claim('l5MixedWrong', 'the mixed-up product gives 0', () => close(V.l5MixedWrong, 0)),
      claim('l5PzInXProb', 'the converted projector gives probability 1', () => close(V.l5PzInXProb, 1)),
      claim('l5InvarAll', 'averages agree in every basis tried', () => close(V.l5InvarAll, 0)),
    ],
  },
}
