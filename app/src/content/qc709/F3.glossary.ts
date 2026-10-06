/**
 * Chapter F3's glossary (plan: docs/roles/proposals/P-F3-story.md §5), in both tracks: `gloss` is one Ground-up
 * sentence (≤ 25 words), `formal` one Formal sentence (≤ 40). Ids start `qc-` (709's namespace). A `bridge` offers the
 * Spin Lab unit that teaches the same idea (content/qc709/bridges.ts). Rides in the lazy course pack (pack.ts).
 *
 * Reuse, not redefinition (P-F3 review item 9, the F2 precedent): the plan's §5 terms `qc-linear-operator`,
 * `qc-outer-product`, `qc-unitary` (Q2) and `qc-adjoint` (Q3) were already reused, and three more collided with a
 * Q1/Q2 headword and are now dropped in favour of the owners' entries: `qc-matrix-element` (Q2, "matrix element
 * $A_{ij}$"), `qc-change-of-basis-matrix` (Q2, "change-of-basis matrix $U$") and `qc-hermitian-matrix` (Q1,
 * "Hermitian matrix"). F3's prose tags those ids with `[[id|shown text]]` and does not mark them `Beat.introduces`
 * (they are not new to the course here). Only `qc-matrix-product` is F3's own headword.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-matrix-product',
    term: 'matrix product',
    gloss: 'The table of two maps done in turn: row of the first against column of the second.',
    formal: '$(AB)_{jk} = \\sum_r A_{jr}B_{rk}$, chosen so $\\mathcal M(AB) = \\mathcal M(A)\\mathcal M(B)$ (Axler 3.41).',
    first: 'f3-products:b1',
    bridge: 'qc-l4-matrices',
    introduces: 'notation',
  },
]
