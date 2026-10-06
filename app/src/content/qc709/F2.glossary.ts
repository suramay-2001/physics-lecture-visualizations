/**
 * Chapter F2's glossary (plan: docs/roles/proposals/P-F2-story.md §5), in both tracks: `gloss` is one Ground-up
 * sentence (≤ 25 words), `formal` one Formal sentence (≤ 40). Ids start `qc-` (709's namespace). A `bridge` offers
 * the Spin Lab unit that teaches the same idea (content/qc709/bridges.ts). Rides in the lazy course pack (pack.ts).
 *
 * **Seven of the plan's ids are Q1's or Q2's or Q6's own glosses instead** (`qc-ket`, `qc-bra`, `qc-inner-product`,
 * `qc-norm`, `qc-basis`, `qc-dimension`, `qc-orthonormal-basis` — Q1/Q2 built before the Foundations split and already
 * own these ids): `registerGloss` throws on a second entry with the same id, and the ownership rule gives the concept
 * to the chapter that taught it first. F2's beats tag `[[qc-ket]]`, `[[qc-bra]]`, `[[qc-inner-product]]`,
 * `[[qc-norm]]`, `[[qc-basis]]`, `[[qc-dimension]]`, `[[qc-orthonormal-basis]]` — the SAME ids, resolving to
 * Q1's/Q2's entries — rather than redefining a new GlossEntry under the colliding id, and no F2 beat claims those ids
 * via `Beat.introduces` (Q1/Q2 already did, in their own chapters). `qc-projection` (Q1) is the shadow: F2 tags `[[qc-projection|shadow]]` at its first use and adds no entry of its own
 * (a duplicate headword `projection (shadow)` was removed in the P-F2 fix pass). `qc-outer-product` (Q2's own id, "the ket-bra") is named in
 * `f2-orthonormal:b5` the same way: a `[[qc-outer-product]]` tag with no new entry, reused until F3 defines the outer
 * product in full (the plan's own note on that beat).
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
    id: 'qc-state-space',
    term: 'state space',
    gloss: 'The space holding every state a system could be in: here, the complex vector space itself.',
    formal: 'The Hilbert space a system’s states live in; for a finite-dimensional system, a complex inner-product space.',
    first: 'f2-norm-angle:b2',
  },
]
