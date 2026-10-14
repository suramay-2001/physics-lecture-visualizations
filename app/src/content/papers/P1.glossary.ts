/**
 * Paper P1 glossary (the Papers section; docs/specs/papers-platform.md), merged into the lazy papers pack by file name
 * (pack.ts). DATA ONLY, like the spec beside it (papers/specData.test.ts): one `export const GLOSSARY` literal. Ids start
 * `pp-`; every entry has a Ground-up sentence (`gloss`, ≤ 25 words) and a Formal one (`formal`, ≤ 40), paraphrased.
 * Placeholder stub until the lecture is written.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'pp-check',
    term: 'check',
    gloss: 'A measurement whose only answers are +1 and −1; a code state answers +1 to every one of its checks.',
    formal: 'A Pauli-product observable with eigenvalues ±1; the code space is the joint +1 eigenspace of all the checks.',
    first: 'p1-checks:b2',
  },
]
