/**
 * Chapter F5's glossary (plan: docs/roles/proposals/P-F5-story.md §5), in both tracks: `gloss` is one Ground-up
 * sentence (≤ 25 words), `formal` one Formal sentence (≤ 40). Ids start `qc-` (709's namespace).
 *
 * F5 is the ground-up owner of classical probability, expectation and variance. `qc-expectation` already exists
 * (Chapter Q3, `Q3.glossary.ts`): `registerGloss` throws on a duplicate id, so F5's prose reuses it with
 * `[[qc-expectation|…]]` (no new entry here; `average:b1` sets `introduces` on it, which the ruling allows, and Q3's
 * Ground gloss is worded to fit a classical die too, P-F5-review builder's question 1). F5 defines its
 * own new ids for the six terms Q3 does not own: `qc-sample-space`, `qc-probability`, `qc-independent`,
 * `qc-variance` (the same quantity as Q3's `qc-dispersion`, under F5's own ground-up id per rulings F5-E2 — a later
 * wiring pass links them), `qc-standard-deviation`, `qc-shannon-entropy`, `qc-binary-entropy`.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-sample-space',
    term: 'sample space $\\Omega$',
    gloss: 'The list of everything that can happen once, such as a die’s six faces.',
    formal: 'The set $\\Omega$ of possible outcomes of a random trial.',
    first: 'f5-probability:b1',
    introduces: 'space',
  },
  {
    id: 'qc-probability',
    term: 'probability $P(x)$',
    gloss: 'A number from 0 to 1 saying how likely an outcome is.',
    formal: '$P: \\Omega \\to [0, 1]$ with $\\sum_{x \\in \\Omega} P(x) = 1$.',
    first: 'f5-probability:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-independent',
    term: 'independent events',
    gloss: 'Two events where one tells you nothing about the other; their chances multiply.',
    formal: '$A$ and $B$ are independent iff $P(A \\cap B) = P(A)P(B)$.',
    first: 'f5-probability:b3',
  },
  {
    id: 'qc-variance',
    term: 'variance $(\\Delta X)^2$',
    gloss: 'The average squared distance of a reading from its mean: how much it scatters.',
    formal: '$(\\Delta X)^2 = \\mathrm{Var}(X) = \\langle(X-\\mu)^2\\rangle = \\langle X^2\\rangle - \\langle X\\rangle^2 \\ge 0$ (Bergou §5.2, p. 81; the notes’ dispersion, pp. 18–19).',
    first: 'f5-spread:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-standard-deviation',
    term: 'standard deviation $\\sigma$',
    gloss: 'The square root of the variance: a typical distance from the mean, in the reading’s own units.',
    formal: '$\\sigma = \\Delta X = \\sqrt{\\mathrm{Var}(X)}$.',
    first: 'f5-spread:b2',
  },
  {
    id: 'qc-shannon-entropy',
    term: 'Shannon entropy $H$',
    gloss: 'The information in a reading, in bits: about how many yes/no questions it answers, averaged over many readings.',
    formal: '$H = -\\sum_x P(x)\\log_2 P(x)$ bits, the fewest yes/no questions per outcome on average over long runs; $0 \\le H \\le \\log_2|\\Omega|$ (Bergou §11.1, pp. 190–191).',
    first: 'f5-surprise:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-binary-entropy',
    term: 'binary entropy $h(p)$',
    gloss: 'The information in a two-outcome reading, as a function of how biased it is.',
    formal: '$h(p) = -p\\log_2 p - (1-p)\\log_2(1-p)$; maximal 1 bit at $p = \\tfrac12$ (Bergou §3.8, p. 55).',
    first: 'f5-surprise:b2',
  },
]
