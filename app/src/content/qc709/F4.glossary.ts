/**
 * Chapter F4's glossary (plan: docs/roles/proposals/P-F4-story.md §5), in both tracks: `gloss` is one Ground-up
 * sentence (≤ 25 words), `formal` one Formal sentence (≤ 40). Ids start `qc-` (709's namespace).
 *
 * Reuse, not redefinition (build note, not in the plan): F4 is the canonical owner of eigenvalues, Hermitian and
 * unitary operators and the spectral theorem (`decisions/qc709-foundations.md`), but several of the plan's §5 terms
 * are ids Chapter Q1/Q2/Q3/Q8 already registered — `registerGloss` throws on a duplicate id. F4's prose reuses those
 * entries with `[[id|shown text]]` and adds no new `GlossEntry` for them: `qc-eigenvalue`, `qc-eigenvector`,
 * `qc-degenerate` (Q3), `qc-unitary` (Q2) and `qc-hermitian-matrix` (Q1, "Hermitian matrix"; F4 has no `qc-hermitian`
 * of its own). F4's beats still list `qc-eigenvalue`, `qc-eigenvector`, `qc-degenerate` and `qc-unitary` in
 * `Beat.introduces`, but the shared entries are not marked `introduces`, so no "New notation" eyebrow shows for them
 * (showing one would mean editing the Q chapters, out of scope here). `qc-characteristic-equation`,
 * `qc-spectral-representation` (Q3) and `qc-positive-operator` (Q8) DO carry `introduces: 'notation'` on the shared
 * entry, so F4 ALSO marks its own `Beat.introduces` for them (the lint is per chapter: `qc709-foundations.md` "a Q
 * chapter that also shows it keeps its beat but is not the owner").
 *
 * Genuinely new here: `qc-diagonalize`, `qc-function-of-operator`, `qc-unitary-eigenvalue`,
 * `qc-simultaneous-eigenbasis`, `qc-operator-square-root`, `qc-svd`, `qc-polar-decomposition`, `qc-normal-operator`.
 */
import type { GlossEntry } from '../schema'

export const GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-diagonalize',
    term: 'diagonalize',
    gloss: 'Change to the eigenbasis so a table becomes diagonal, its eigenvalues down the middle.',
    formal: '$B^\\dagger A B = \\operatorname{diag}(\\lambda_i)$, $B$’s columns the eigenvectors (Axler 7.31).',
    first: 'f4-spectral:b2',
  },
  {
    id: 'qc-function-of-operator',
    term: 'function of an operator',
    gloss: 'Applying a function to a table by applying it to each eigenvalue, same directions kept.',
    formal: '$f(A) = \\sum_i f(\\lambda_i)|a_i\\rangle\\langle a_i|$, the functional calculus (N&C §2.1.8, p. 75).',
    first: 'f4-spectral:b3',
    introduces: 'notation',
  },
  {
    id: 'qc-unitary-eigenvalue',
    term: 'eigenvalues on the unit circle',
    gloss: 'A length-keeping table’s stretches all have size 1, so they sit on the unit circle.',
    formal: '$U$ unitary $\\Rightarrow$ every eigenvalue $\\lambda = e^{i\\theta}$, $|\\lambda| = 1$ (Axler 7D).',
    first: 'f4-unitary:b3',
    introduces: 'notation',
  },
  {
    id: 'qc-simultaneous-eigenbasis',
    term: 'simultaneous eigenbasis',
    gloss: 'One set of arrows that are eigenvectors of two tables at once.',
    formal: 'An orthonormal basis of common eigenvectors of $A$ and $B$; exists iff $[A, B] = 0$ (Axler 5E).',
    first: 'f4-commuting:b1',
    introduces: 'notation',
  },
  {
    id: 'qc-operator-square-root',
    term: 'square root of a matrix',
    gloss: 'The positive table whose square is a given positive table.',
    formal: 'For $A \\ge 0$, the unique $\\sqrt A \\ge 0$ with $(\\sqrt A)^2 = A$ (Axler 7.36, 7.39, pp. 251–253).',
    first: 'f4-positive:b2',
  },
  {
    id: 'qc-svd',
    term: 'singular-value decomposition',
    gloss: 'Any table as a turn, then a positive stretch, then a turn; the amounts of that stretch are the singular values.',
    formal: '$A = U\\Sigma V^\\dagger$, $\\Sigma \\ge 0$ diagonal (Axler 7.70, p. 273).',
    first: 'f4-positive:b3',
  },
  {
    id: 'qc-polar-decomposition',
    term: 'polar decomposition',
    gloss: 'Any table as a rotation times a positive stretch.',
    formal: '$A = U|A|$, $U$ unitary, $|A| = \\sqrt{A^\\dagger A} \\ge 0$ (Axler 7.93, p. 286).',
    first: 'f4-positive:b3',
  },
  {
    id: 'qc-normal-operator',
    term: 'normal operator',
    gloss: 'A table that commutes with its own mirror image.',
    formal: '$AA^\\dagger = A^\\dagger A$, exactly the operators with an orthonormal eigenbasis (Axler 7.18, p. 235; the complex spectral theorem’s hypothesis).',
    first: 'f4-spectral:b4',
  },
]
