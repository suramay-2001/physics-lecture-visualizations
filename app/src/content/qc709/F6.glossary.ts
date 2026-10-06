/**
 * Chapter F6's glossary (plan: docs/roles/proposals/P-F6-story.md §1), in both tracks: `gloss` is one Ground-up
 * sentence (≤ 25 words), `formal` one Formal sentence (≤ 40). Ids start `qc-` (709's namespace).
 *
 * Reuse, not redefinition (build note; the brief flagged this directly): Chapter Q4 already owns `qc-tensor-product`,
 * `qc-tensor-operator`, `qc-register` and `qc-coefficient-matrix`; Chapter Q6 already owns `qc-composite-space`,
 * `qc-product-state`, `qc-entangled` and `qc-factoring-test` — the exact ids the plan's beats named for F6's own
 * notation beats. (Q6 briefly duplicated `qc-tensor-operator` under a second id, `qc-operator-tensor`;
 * P-Q6-review.md should-fix item 5 removed that duplicate, so only Q4's id exists now.) `registerGloss` throws on a
 * duplicate id, so F6's prose reuses these EIGHT existing entries with `[[id|shown text]]` and every one is linked
 * somewhere in F6 (P-F6-review item 6): `qc-tensor-operator` at f6-operator:b2 and b3 (it covers a local operator
 * A⊗I, so F6's own `qc-local-operator` was dropped), `qc-coefficient-matrix` and `qc-factoring-test` at
 * f6-product-or-not:b1. F6 owns the joint space and ⊗, so its notation beats set `Beat.introduces` on
 * `qc-composite-space` (f6-pairs:b1) and `qc-tensor-product` (f6-kron:b1); the introduces-once lint is per chapter, so
 * Q4 and Q6 keep theirs (item 7). F6 defines one new id: `qc-kronecker-product` (the matrix-index form
 * (A⊗B)_(ab)(a'b') = A_aa' B_bb', which neither Q4 nor Q6 spells out; N&C Eq. 2.50, p. 74).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-kronecker-product',
    term: 'Kronecker product $A \\otimes B$',
    gloss: 'A table built by copying $B$, scaled, into every slot of $A$: a block table.',
    formal: '$(A \\otimes B)_{(ab),(a\'b\')} = A_{aa\'}B_{bb\'}$ (N&C §2.1.7, p. 74): an $m{\\times}m$ by $n{\\times}n$ pair makes an $mn \\times mn$ block matrix.',
    first: 'f6-operator:b1',
    introduces: 'notation',
  },
]
