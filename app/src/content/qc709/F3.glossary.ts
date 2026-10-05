/**
 * Chapter F3's glossary (plan: docs/roles/proposals/P-F3-story.md §5), in both tracks: `gloss` is one Ground-up
 * sentence (≤ 25 words), `formal` one Formal sentence (≤ 40). Ids start `qc-` (709's namespace). A `bridge` offers the
 * Spin Lab unit that teaches the same idea (content/qc709/bridges.ts). Rides in the lazy course pack (pack.ts).
 *
 * Reuse, not redefinition (build note, not in the plan): four of the plan's §5 terms collide with ids ALREADY
 * registered by Chapter Q2 (`qc-linear-operator`, `qc-outer-product`, `qc-unitary`) and Chapter Q3 (`qc-adjoint`) —
 * `registerGloss` throws on a duplicate id, and the brief flagged exactly this. F3's prose reuses those existing
 * entries with `[[qc-linear-operator|linear map]]` etc. (no new GlossEntry here, no `Beat.introduces` claim on them:
 * they are not new to the course). F3 defines its own new ids below for the four terms that do not collide:
 * `qc-matrix-of-map`, `qc-matrix-product`, `qc-hermitian`, `qc-change-of-basis` (Q2 has its own, differently-named
 * takes on two of these — `qc-matrix-element`, `qc-change-of-basis-matrix` — which is fine: the ownership ruling
 * (qc709-foundations.md) has F3 as the canonical owner GOING FORWARD, while Q2's own entries are not re-cut).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-matrix-of-map',
    term: 'matrix element $A_{ij}$',
    gloss: 'The grid of a map: entry $A_{ij} = \\langle i|A|j\\rangle$, column $j$ is $A$ on frame vector $j$.',
    formal: 'In an orthonormal basis, $A_{ij} = \\langle e_i|A|e_j\\rangle$ (Axler 3.31; notes n2 §I.D.1).',
    first: 'f3-matrix-of-map:b1',
    bridge: 'qc-l4-matrices',
    introduces: 'notation',
  },
  {
    id: 'qc-matrix-product',
    term: 'matrix product',
    gloss: 'The table of two maps done in turn: row of the first against column of the second.',
    formal: '$(ST)_{jk} = \\sum_r S_{jr}T_{rk}$, chosen so $\\mathcal M(ST) = \\mathcal M(S)\\mathcal M(T)$ (Axler 3.41).',
    first: 'f3-products:b1',
    bridge: 'qc-l4-matrices',
    introduces: 'notation',
  },
  {
    id: 'qc-hermitian',
    term: 'Hermitian (self-adjoint)',
    gloss: 'A map that equals its own mirror.',
    formal: '$A^\\dagger = A$; $X, Y, Z, H$ are Hermitian (N&C §2.1.6).',
    first: 'f3-adjoint:b3',
    bridge: 'qc-l3-eigen',
  },
  {
    id: 'qc-change-of-basis',
    term: 'change-of-basis matrix $U$',
    gloss: 'The table that rewrites coordinates and maps in a new frame.',
    formal: '$U_{ij} = \\langle\\alpha\'_i|\\alpha_j\\rangle$; $d = Uc$, $A\' = UAU^\\dagger$ (notes n2 §I.C.4).',
    first: 'f3-change-of-basis:b1',
    bridge: 'qc-l5-coordinates',
    introduces: 'notation',
  },
]
