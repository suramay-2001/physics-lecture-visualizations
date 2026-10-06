/**
 * Chapter F6's glossary (plan: docs/roles/proposals/P-F6-story.md §1), in both tracks: `gloss` is one Ground-up
 * sentence (≤ 25 words), `formal` one Formal sentence (≤ 40). Ids start `qc-` (709's namespace).
 *
 * Reuse, not redefinition (build note; the brief flagged this directly): Chapter Q4 already owns `qc-tensor-product`,
 * `qc-tensor-operator`, `qc-register` and `qc-coefficient-matrix`; Chapter Q6 already owns `qc-composite-space`,
 * `qc-product-state`, `qc-entangled` and `qc-factoring-test` — the exact ids the plan's beats named for F6's own
 * notation beats. (Q6 briefly duplicated `qc-tensor-operator` under a second id, `qc-operator-tensor`;
 * P-Q6-review.md should-fix item 5 removed that duplicate, so only Q4's id exists now — F6.story.ts never
 * referenced the duplicate.) `registerGloss` throws on a duplicate id, so F6's prose reuses every one of these
 * EIGHT existing entries with `[[id|shown text]]` (no new GlossEntry here, no `Beat.introduces` claim on them:
 * they are not new to the course, Q4 and Q6 having taught them first). F6 defines its own new ids below for the two
 * terms that do not collide: `qc-kronecker-product` (the matrix-index form (A⊗B)_(aa')(bb') = A_ab B_a'b', which
 * neither Q4 nor Q6 spells out) and `qc-local-operator` (A⊗I touching one part alone).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-kronecker-product',
    term: 'Kronecker product $A \\otimes B$',
    gloss: 'A table built by copying $B$, scaled, into every slot of $A$: a block table.',
    formal: '$(A \\otimes B)_{(aa\'),(bb\')} = A_{ab}B_{a\'b\'}$ (N&C §2.1.7, p. 73): an $m{\\times}m$ by $n{\\times}n$ pair makes an $mn \\times mn$ block matrix.',
    first: 'f6-operator:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-local-operator',
    term: 'local operator $A \\otimes I$',
    gloss: 'A machine that changes only one system of a pair and leaves the other alone.',
    formal: '$A \\otimes I$ acts on system A alone (Bergou §2.1, p. 16); $\\langle ab|(A \\otimes I)|a\'b\'\\rangle = A_{aa\'}\\delta_{bb\'}$.',
    first: 'f6-operator:b3',
  },
]
