/**
 * Chapter F2's glossary (plan: docs/roles/proposals/P-F2-story.md §5), in both tracks: `gloss` is one Ground-up
 * sentence (≤ 25 words), `formal` one Formal sentence (≤ 40). Ids start `qc-` (709's namespace). A `bridge` offers
 * the Spin Lab unit that teaches the same idea (content/qc709/bridges.ts). Rides in the lazy course pack (pack.ts).
 *
 * **Five of the plan's twelve terms are Q1's or Q2's own glosses instead** (`qc-ket`, `qc-bra`, `qc-inner-product`,
 * `qc-norm`, `qc-basis`, `qc-dimension` — six, not five; Q1/Q2 built before the Foundations split and already own
 * these ids): `registerGloss` throws on a second entry with the same id, and the ownership rule gives the concept to
 * the chapter that taught it first. F2's beats tag `[[qc-ket]]`, `[[qc-bra]]`, `[[qc-inner-product]]`, `[[qc-norm]]`,
 * `[[qc-basis]]`, `[[qc-dimension]]` — the SAME ids, resolving to Q1's/Q2's entries — rather than redefining a new
 * GlossEntry under the colliding id, and no F2 beat claims those ids via `Beat.introduces` (Q1/Q2 already did, in
 * their own chapters). Likewise `qc-orthonormal-basis` (Q2) and `qc-projection` (Q1) already exist: this chapter's
 * own, more formal takes on "a right-angled frame" and "a shadow" are new entries under `qc-orthonormal-frame` and
 * `qc-shadow` instead, each marked `introduces` (W-709 #8) since F2 is the first chapter to badge them as new.
 * `qc-outer-product` (Q6's own id, "the ket-bra") is named in `f2-orthonormal:b5` the same way: a `[[qc-outer-product]]`
 * tag with no new entry, reused until F3 defines the outer product in full (the plan's own note on that beat).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-complex-vector-space',
    term: 'complex vector space $\\mathbb C^n$',
    gloss: 'The space of length-$n$ lists of complex numbers you can add and scale.',
    formal: '$\\mathbb C^n$ with componentwise $+$ and scalar $\\cdot$ (Axler 1.20); $\\dim \\mathbb C^n = n$.',
    first: 'f2-vectors:b1',
    bridge: 'qc-l2-vector-space',
    introduces: 'space',
  },
  {
    id: 'qc-orthogonal',
    term: 'orthogonal',
    gloss: 'Two states whose inner product is zero; for real arrows, a right angle.',
    formal: '$|\\alpha\\rangle \\perp |\\beta\\rangle$ iff $\\langle\\alpha|\\beta\\rangle = 0$ (Axler 6.10).',
    first: 'f2-norm-angle:b2',
  },
  {
    id: 'qc-linear-independence',
    term: 'linear independence',
    gloss: 'A set where no state is a combination of the others.',
    formal: '$\\sum_i c_i|\\alpha_i\\rangle = 0 \\Rightarrow$ every $c_i = 0$ (notes n2; N&C).',
    first: 'f2-orthonormal:b1',
  },
  {
    id: 'qc-orthonormal-frame',
    term: 'orthonormal basis',
    gloss: 'A basis of unit states, each at right angles to the others: a right-angled frame.',
    formal: '$\\langle e_i|e_j\\rangle = \\delta_{ij}$ and spanning (Axler 6.27); coordinates $c_i = \\langle e_i|\\psi\\rangle$.',
    first: 'f2-orthonormal:b2',
    bridge: 'qc-l1-vectors',
    introduces: 'space',
  },
  {
    id: 'qc-shadow',
    term: 'projection (shadow)',
    gloss: 'The part of one state that lies along another: its shadow.',
    formal: '$|e\\rangle\\langle e|\\psi\\rangle$ onto a unit $|e\\rangle$ (engine `projectOnto`).',
    first: 'f2-gram-schmidt:b2',
    introduces: 'notation',
  },
]
