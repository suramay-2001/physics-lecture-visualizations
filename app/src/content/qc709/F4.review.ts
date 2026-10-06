/**
 * Chapter F4 review cards, both tracks (plan: docs/roles/proposals/P-F4-story.md §6).
 * ≤ 5 points; Ground-up sentences ≤ 25 words, Formal ≤ 40; every number is an F4 claim already used in §1/§4.
 */
import type { ReviewCard } from '../schema'
import { C } from './F4.story'

export const F4_REVIEW: Record<string, ReviewCard> = {
  'f4-eigen': {
    points: [
      'An eigenvector is an arrow a matrix only stretches; the stretch is its eigenvalue.',
      'The eigenvalues solve $\\det(A - \\lambda I) = 0$.',
      'For 2×2, $\\lambda^2 - (\\operatorname{tr}\\,A)\\lambda + \\det A = 0$.',
      'Eigenvalues can be complex ($\\pm i$ for a turn); a stretch can repeat (degenerate), and a defective table runs short of eigenvectors.',
    ],
    equations: 'A|a\\rangle = \\lambda|a\\rangle,\\quad \\lambda^2 - (\\operatorname{tr}\\,A)\\lambda + \\det A = 0',
    trap: '"A real matrix has real eigenvalues." The real quarter-turn has $\\pm i$.',
    claims: [C.rVal],
    formal: {
      points: [
        '$A|a\\rangle = \\lambda|a\\rangle$, $|a\\rangle \\ne 0$ (Axler Eq. 5.5).',
        '$\\det(A - \\lambda I)$ is the characteristic polynomial (Axler Ex. 5B.11).',
        'Over the complex numbers every square matrix has an eigenvalue (the fundamental theorem of algebra).',
      ],
      trap: 'Real entries do not force real eigenvalues: the quarter-turn’s characteristic equation $\\lambda^2 + 1 = 0$ has no real root.',
    },
  },
  'f4-hermitian': {
    points: [
      'Hermitian means $A = A^\\dagger$: the table is its own mirror.',
      'A Hermitian table’s eigenvalues are real, in any dimension (the notes prove this at n4 p. 17).',
      'Its eigenvectors with different eigenvalues are orthogonal: overlap zero, yet opposite points on the Bloch sphere.',
      'With repeats, Gram–Schmidt still gives a right-angle set.',
    ],
    equations: 'A = A^\\dagger,\\quad \\lambda\\ \\text{real},\\quad \\langle a_2|a_1\\rangle = 0\\ (\\lambda_1 \\ne \\lambda_2)',
    trap: 'Real eigenvalues do not need real entries: $\\begin{pmatrix}2 & i\\\\ -i & 2\\end{pmatrix}$ has eigenvalues $1, 3$.',
    claims: [C.hermEx1Max],
    formal: {
      points: [
        '$A_{ij} = A_{ji}^*$, diagonal real.',
        '$\\lambda = \\lambda^*$ in any dimension (notes n4 p. 17; Axler Eq. 7.12 for the general statement).',
        'Orthonormal eigenbasis exists (Axler 7A, p. 238).',
      ],
      trap: 'Hermiticity is about the whole table ($A_{ij} = A_{ji}^*$), not about every entry being real.',
    },
  },
  'f4-spectral': {
    points: [
      '$A = \\sum_i \\lambda_i|a_i\\rangle\\langle a_i|$: eigenvalue times projector.',
      'In its own basis a Hermitian table is diagonal, $B^\\dagger A B = \\operatorname{diag}(\\lambda_i)$.',
      '$f(A) = \\sum_i f(\\lambda_i)|a_i\\rangle\\langle a_i|$: a function acts on the eigenvalues.',
      'It works in any dimension.',
    ],
    equations: 'A = \\sum_i \\lambda_i|a_i\\rangle\\langle a_i|,\\quad f(A) = \\sum_i f(\\lambda_i)|a_i\\rangle\\langle a_i|',
    trap: 'Squaring forgets the sign: $\\sigma_x^2 = \\sigma_z^2 = I$, so $\\sqrt{I}$ is not unique.',
    claims: [C.xsqIsI, C.zsqIsI],
    formal: {
      points: [
        'The spectral theorem (Axler Eq. 7.31).',
        '$A^n = BD^nB^\\dagger$.',
        'Functional calculus (N&C §2.1.8); a normal operator ($AA^\\dagger = A^\\dagger A$) is the general case this covers.',
      ],
      trap: 'Squaring is many-to-one: knowing $A^2$ does not recover the sign of each eigenvalue of $A$.',
    },
  },
  'f4-unitary': {
    points: [
      'A unitary keeps every length, $U^\\dagger U = I$.',
      '$\\|Uv\\| = \\|v\\|$: a rigid turn.',
      'Its eigenvalues have size 1, on the unit circle.',
      '$e^{-iKt}$ turns the Bloch sphere.',
    ],
    equations: 'U^\\dagger U = I,\\quad |\\lambda| = 1,\\quad e^{-iKt} = \\sum_i e^{-i\\lambda_i t}|a_i\\rangle\\langle a_i|',
    trap: 'Calling every length-keeping map a "stretch". A unitary never stretches; its singular values are all 1.',
    claims: [C.sAbsEig],
    formal: {
      points: [
        'Isometry $\\Leftrightarrow U^\\dagger U = I$ (Axler Eq. 7.53).',
        '$|\\lambda| = 1$ for every eigenvalue.',
        'Hermitian and unitary together $\\Rightarrow \\lambda = \\pm1$, $A^2 = I$.',
      ],
      trap: 'Unit-size eigenvalues do not make a table unitary: $\\begin{pmatrix}1 & 1\\\\ 0 & 1\\end{pmatrix}$ has the single eigenvalue $1$ yet stretches some arrows.',
    },
  },
  'f4-commuting': {
    points: [
      'Two tables share a set of directions exactly when they commute, $AB = BA$.',
      'Then each shared arrow is an eigenvector of both.',
      'If $AB \\ne BA$, no shared basis exists.',
      '$I$ commutes with everything.',
    ],
    equations: '[A, B] = AB - BA = 0 \\Leftrightarrow \\text{a shared eigenbasis}',
    trap: '"Same eigenvalues means they commute." $\\sigma_x$ and $\\sigma_z$ share the spectrum $\\{\\pm1\\}$ but do not commute.',
    claims: [C.xzComm],
    formal: {
      points: [
        '$[A, B] = 0 \\Leftrightarrow$ simultaneously diagonalizable (Axler 5E).',
        '$(\\lambda_i - \\lambda_j)\\langle a_i|B|a_j\\rangle = 0$ forces the off-diagonal entries to vanish.',
        'A fully degenerate operator commutes with everything; distinct eigenvalues pin a basis down.',
      ],
      trap: 'Equal spectra say nothing about a shared eigenbasis; only the commutator does.',
    },
  },
  'f4-positive': {
    points: [
      'Positive means no negative eigenvalue, $\\langle v|A|v\\rangle \\ge 0$.',
      'A positive table has a positive square root.',
      'Any table is a turn times a positive stretch (polar decomposition).',
      'Singular values are the eigenvalues of the positive part: the amounts it stretches by.',
    ],
    equations: 'A \\ge 0 \\Leftrightarrow \\text{spectrum} \\ge 0,\\quad A = U|A|',
    trap: 'A positive table need not be a projector: $I + \\tfrac12(X+Z)$ has eigenvalues between $0$ and $2$, not only $0$ or $1$.',
    claims: [C.posNotProj],
    formal: {
      points: [
        '$A \\ge 0 \\Leftrightarrow$ spectrum $\\ge 0$ (Axler Eq. 7.34 and Eq. 7.38).',
        '$\\sqrt A$ unique and positive (Axler Eq. 7.36).',
        '$A = U\\Sigma V^\\dagger$, $A = U|A|$ (Axler Eq. 7.70 and Eq. 7.93).',
      ],
      trap: 'A projector additionally needs $A^2 = A$ (eigenvalues in $\\{0,1\\}$); positivity alone only bars negative eigenvalues.',
    },
  },
}
