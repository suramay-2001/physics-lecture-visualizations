/**
 * Background chapter B2 glossary (the Papers section; docs/specs/papers-platform.md), merged into the lazy papers pack by file name
 * (pack.ts). DATA ONLY, like the spec beside it (papers/specData.test.ts): one `export const GLOSSARY` literal. Ids start `pp-`;
 * every entry has a Ground-up sentence (`gloss`, at most 25 words) and a Formal one (`formal`, at most 40), paraphrased, and a
 * first use that carries its tag in both tracks. The entries marked `introduces` are the notation beats of the chapter.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'pp-qldpc-code',
    term: 'quantum LDPC code',
    gloss: 'A code whose checks touch few qubits and whose qubits sit in few checks, at any size.',
    formal: 'A code family with check weight and qubit degree bounded as $n \\to \\infty$ (BE21 §II.1.2).',
    first: 'b2-ldpc:b1',
    introduces: 'notation',
  },
  {
    id: 'pp-code-rate',
    term: 'rate',
    gloss: 'The share of the qubits that carry data.',
    formal: 'The ratio $k/n$ of logical to physical qubits, or $k/2n$ when the check qubits are counted too.',
    first: 'b2-ldpc:b2',
    introduces: 'notation',
  },
  {
    id: 'pp-gross-code',
    term: 'gross code',
    gloss: 'The code on a 12-by-6 torus with 12 logical qubits and distance 12.',
    formal: 'The bivariate bicycle code with $\\ell = 12$, $m = 6$ and parameters $[\\![144,12,12]\\!]$.',
    first: 'b2-ldpc:b3',
  },
  {
    id: 'pp-bpt-bound',
    term: 'Bravyi–Poulin–Terhal bound',
    gloss: 'A flat layout with short checks cannot beat a fixed multiple of $n$ for the product of $k$ and $d$ squared.',
    formal: 'For commuting local checks on a 2D lattice, $kd^2 = O(n)$ (BPT10).',
    first: 'b2-bpt:b1',
    introduces: 'notation',
  },
  {
    id: 'pp-bb-code',
    term: 'BB code',
    gloss: 'A code whose X checks come from two patterns on a torus, and whose Z checks come from their transposes.',
    formal: 'A bivariate bicycle code with $H_X = [A \\mid B]$ and $H_Z = [B^T \\mid A^T]$ (Bra+24 Eqs. 1–2).',
    first: 'b2-bpt:b2',
  },
  {
    id: 'pp-torus-polynomial',
    term: 'polynomial',
    gloss: 'A sum of monomials, which is a set of cells on a wrapped grid.',
    formal: 'An element of $\\mathrm{GF}(2)[x,y]/(x^\\ell-1,\\ y^m-1)$, a 0/1 pattern on $\\ell m$ cells.',
    first: 'b2-polynomials:b1',
    introduces: 'notation',
  },
  {
    id: 'pp-code-automorphism',
    term: 'code automorphism',
    gloss: 'A reshuffling of the qubits that sends every check to a check of the same kind.',
    formal: 'A permutation of the qubits that permutes the rows of $H_X$ and the rows of $H_Z$ among themselves.',
    first: 'b2-automorphisms:b1',
    introduces: 'notation',
  },
  {
    id: 'pp-bp-decoding',
    term: 'belief propagation',
    gloss: 'Checks and bits pass beliefs to each other until each bit decides whether it is flipped.',
    formal: 'Min-sum message passing on the Tanner graph, started at $\\lambda = \\ln\\frac{1-p}{p}$ (Rof+20 §V).',
    first: 'b2-decoding:b1',
    introduces: 'notation',
  },
  {
    id: 'pp-osd',
    term: 'ordered-statistics decoding',
    gloss: 'Solve exactly on the most suspected independent bits and take the rest to be fine.',
    formal: 'Decoding on an information set chosen by the order of the BP totals: OSD-0 solves on that set and sets the other bits to 0.',
    first: 'b2-decoding:b3',
    introduces: 'notation',
  },
]
