/**
 * Chapter F7's glossary (plan: docs/roles/proposals/P-F7-story.md §5), in both tracks: `gloss` is one Ground-up sentence (≤ 25 words), `formal` one
 * Formal sentence (≤ 40), paraphrased. Ids start `qc-` (709's namespace); the "gloss at first use" lint (content/symbols.test.ts) reads them.
 *
 * Reuse, not redefinition: Chapter Q4 owns `qc-xor` and `qc-cnot`; Q5 owns `qc-constant`, `qc-balanced`, `qc-toffoli` and `qc-query`; Q16 owns
 * `qc-bit-dot` and `qc-query-cost`. F7 is the canonical owner of the math behind `qc-xor` (boolean:b4, the half-adder) and `qc-bit-dot` (xor:b4), so those
 * two beats set `Beat.introduces` on the existing ids (the F6 precedent; the introduces-once lint is per chapter, so Q4 and Q16 keep theirs). F7 defines
 * twelve new ids. `introduces` marks the notation or space each introducing beat brings (interface change W-709 #12).
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-boolean-function',
    term: 'Boolean function',
    gloss: 'A rule that reads some bits and returns one bit.',
    formal: '$f : \\{0,1\\}^n \\to \\{0,1\\}$.',
    first: 'f7-boolean:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-truth-table',
    term: 'truth table',
    gloss: 'A list of every input of a bit rule with its output.',
    formal: 'The $2^n$ pairs $(x, f(x))$ that fix a Boolean function (N&C p. 129).',
    first: 'f7-boolean:b1',
  },
  {
    id: 'qc-reversible-gate',
    term: 'reversible gate',
    gloss: 'A gate whose output always tells you its input.',
    formal: 'A bijection of $\\{0,1\\}^n$ (N&C p. 153).',
    first: 'f7-reversible:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-permutation-matrix',
    term: 'permutation matrix',
    gloss: 'A table of 0s and 1s with one 1 in each row and each column.',
    formal: '$P_{\\pi(j)j} = 1$ and 0 elsewhere, so $P^{\\top}P = I$.',
    first: 'f7-reversible:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-landauer',
    term: 'Landauer’s principle',
    gloss: 'Erasing one bit releases at least a tiny, fixed amount of heat.',
    formal: 'Erasure dissipates at least $k_BT\\ln 2$ per bit (N&C p. 153).',
    first: 'f7-reversible:b4',
  },
  {
    id: 'qc-uncompute',
    term: 'uncomputation',
    gloss: 'Running a circuit backwards to wipe its scrap bits.',
    formal: '$(x, 0, 0, y) \\to (x, 0, 0, y \\oplus f(x))$ by running the circuit backwards (N&C p. 158).',
    first: 'f7-reversible:b5',
  },
  {
    id: 'qc-gf2',
    term: 'GF(2), the bit-string space',
    gloss: 'Bit strings added with XOR and scaled by 0 or 1.',
    formal: 'The vector space $\\mathrm{GF}(2)^n$ over the field with elements 0 and 1.',
    first: 'f7-gf2:b1',
    introduces: 'space',
  },
  {
    id: 'qc-hamming-weight',
    term: 'Hamming weight',
    gloss: 'The number of 1s in a string.',
    formal: '$\\mathrm{wt}(x) = \\#\\{j : x_j = 1\\}$.',
    first: 'f7-gf2:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-hamming-distance',
    term: 'Hamming distance',
    gloss: 'How many places two strings differ in.',
    formal: '$d(x, z) = \\mathrm{wt}(x \\oplus z)$.',
    first: 'f7-gf2:b2',
  },
  {
    id: 'qc-parity-check',
    term: 'parity check',
    gloss: 'A rule saying that some bits must XOR to 0.',
    formal: 'A row of a check matrix $M$; a word $c$ passes if and only if $Mc = 0$.',
    first: 'f7-gf2:b3',
    introduces: 'notation',
  },
  {
    id: 'qc-big-o',
    term: 'big-O',
    gloss: 'A way to say how fast a cost grows, ignoring constants.',
    formal: '$f = O(g)$ means $f(n) \\le c\\,g(n)$ for all $n > n_0$.',
    first: 'f7-cost:b2',
    introduces: 'notation',
  },
  {
    id: 'qc-exponential-cost',
    term: 'exponential cost',
    gloss: 'A cost that doubles each time the input gains a fixed number of bits.',
    formal: 'Cost growing as $2^{\\Theta(n)}$, against a polynomial $O(n^k)$ (N&C pp. 138–139).',
    first: 'f7-cost:b3',
  },
]
