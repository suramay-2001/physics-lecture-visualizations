/**
 * Chapter F3 review cards, both tracks (plan: docs/roles/proposals/P-F3-story.md §6).
 * ≤ 5 points; Ground-up sentences ≤ 25 words, Formal ≤ 40; every number is an F3 claim already used in §1/§4.
 */
import type { ReviewCard } from '../schema'
import { C } from './F3.story'

export const F3_REVIEW: Record<string, ReviewCard> = {
  'f3-linear-maps': {
    points: [
      'A linear map respects sums and scaling: $A(a\\psi_1 + b\\psi_2) = aA\\psi_1 + bA\\psi_2$.',
      'It is fixed by its action on a frame: $A|\\psi\\rangle = \\sum_j c_j A|e_j\\rangle$.',
      'Gates, projections and rotations are linear; the identity and zero map too.',
      'Squaring the amplitudes is not linear: it quadruples on doubling, not doubles.',
    ],
    equations: 'A(a|\\psi_1\\rangle + b|\\psi_2\\rangle) = aA|\\psi_1\\rangle + bA|\\psi_2\\rangle',
    trap: 'Calling the Born rule $|c_i|^2$ a linear map. Squaring fails homogeneity; probabilities are read off, not applied.',
    claims: [C.squareNonlinear],
    formal: {
      points: [
        '$A(a\\psi_1 + b\\psi_2) = aA\\psi_1 + bA\\psi_2$ (Axler §3A; N&C §2.1.2).',
        '$A|\\psi\\rangle = \\sum_j c_j A|e_j\\rangle$: a linear map is fixed by a basis.',
        'The identity $I$ and the zero map are linear; composition $BA$ is $A$ first, then $B$.',
      ],
      trap: 'Squaring fails homogeneity: $A(2\\psi) = 4A\\psi \\ne 2A\\psi$, so it has no matrix.',
    },
  },
  'f3-matrix-of-map': {
    points: [
      'Column $j$ of a map’s table is $A$ applied to frame vector $j$.',
      'The matrix element is $A_{ij} = \\langle i|A|j\\rangle$.',
      'Acting on a state is $\\bar f = A\\bar c$: matrix times column.',
      'A table is a sum of ket-bras, $A = \\sum_{ij}A_{ij}|i\\rangle\\langle j|$.',
    ],
    equations: 'A_{ij} = \\langle e_i|A|e_j\\rangle,\\quad \\bar f = A\\bar c',
    trap: 'Reading rows as images. The $k$th *column*, not row, is $A|e_k\\rangle$.',
    claims: [C.matH, C.actionHc],
    formal: {
      points: [
        '$A_{ij} = \\langle e_i|A|e_j\\rangle$ in an orthonormal basis (Axler 3.31).',
        '$A = \\sum_{ij} A_{ij}|e_i\\rangle\\langle e_j|$; $X = |0\\rangle\\langle 1| + |1\\rangle\\langle 0|$.',
        '$\\bar f = A\\bar c$ follows from inserting completeness between $A$ and $|\\psi\\rangle$.',
      ],
      trap: 'The $k$th column, not row, is $A|e_k\\rangle$; a row mixes entries from every column.',
    },
  },
  'f3-products': {
    points: [
      '$ST$ means “do $T$, then $S$”: $(ST)_{jk} = \\sum_r S_{jr}T_{rk}$.',
      'Order matters: $XZ = -ZX$, not $XZ = ZX$.',
      '$X^2 = H^2 = I$: both $X$ and $H$ undo themselves.',
      '$HXH = Z$ and $HZH = X$: the Hadamard trades the two gates.',
    ],
    equations: '(ST)_{jk} = \\sum_r S_{jr}T_{rk},\\quad HXH = Z',
    trap: 'Assuming $AB = BA$. For $X, Z$ they differ by a sign.',
    claims: [C.xzEqNegZx, C.hxh],
    formal: {
      points: [
        'Multiplication is defined to give $\\mathcal M(ST) = \\mathcal M(S)\\mathcal M(T)$ (Axler 3.41, 3.81).',
        '$HXH = Z$, and $HZH = X$ since $H^2 = I$.',
        '$AA^{-1} = I$; $(AC)^{-1} = C^{-1}A^{-1}$ for invertible maps (Axler 3.79–3.80).',
      ],
      trap: 'Matrix multiplication is not commutative: $XZ = -ZX$, not $ZX$.',
    },
  },
  'f3-adjoint': {
    points: [
      '$A^\\dagger$: swap rows/columns, then conjugate.',
      '$(AB)^\\dagger = B^\\dagger A^\\dagger$; $(A^\\dagger)^\\dagger = A$.',
      'Hermitian means $A^\\dagger = A$; unitary means $U^\\dagger = U^{-1}$, keeping lengths.',
      '$S$ is unitary but $S^\\dagger \\ne S$: unitary does not mean self-mirror.',
    ],
    equations: 'A^\\dagger = (A^*)^{\\mathsf T},\\quad A^\\dagger = A\\ (\\text{Hermitian}),\\quad U^\\dagger U = I\\ (\\text{unitary})',
    trap: 'Thinking unitary means self-mirror. $S$ is unitary but $S^\\dagger \\ne S$.',
    claims: [C.sdag, C.sdagS, C.sHermGap],
    formal: {
      points: [
        '$\\langle\\varphi|A\\psi\\rangle = \\langle A^\\dagger\\varphi|\\psi\\rangle$; $A^\\dagger = (A^*)^{\\mathsf T}$ in an orthonormal basis.',
        '$X, Y, Z, H$ are Hermitian; every gate is unitary.',
        'In a non-orthonormal frame the conjugate-transpose recipe for the adjoint fails (Axler 7.9).',
      ],
      trap: 'Unitary ($U^\\dagger = U^{-1}$) does not imply Hermitian ($A^\\dagger = A$): $S^\\dagger S = I$ yet $S^\\dagger \\ne S$.',
    },
  },
  'f3-change-of-basis': {
    points: [
      'New coordinates $d = Uc$, with $U_{ij} = \\langle\\text{new}_i|\\text{old}_j\\rangle$.',
      'A map’s table becomes $UAU^\\dagger$ in the new frame.',
      '$Z$ in the x frame is $X$; $U$ = the Hadamard $H$ for z→x.',
      '$U$ is always unitary, $U^\\dagger U = I$, so a change of frame keeps every length.',
    ],
    equations: 'd = Uc,\\quad A\' = UAU^\\dagger,\\quad U^\\dagger U = I',
    trap: 'Thinking the map changed. Only its table changed; the map, its lengths, its trace and its determinant are the same.',
    claims: [C.ux, C.zInX, C.uUnitary],
    formal: {
      points: [
        '$A\' = UAU^\\dagger$, drawn by the stage as $B^\\dagger A B$ with $U = B^\\dagger$.',
        '$UZU^\\dagger = HZH = X$; consistently $UXU^\\dagger = HXH = Z$.',
        '$U^\\dagger U = I$; the two change-of-basis matrices between a pair of frames are inverses (Axler 3.82).',
      ],
      trap: 'A rewritten table is not a new map: lengths, trace and determinant are all unchanged by $UAU^\\dagger$.',
    },
  },
}
