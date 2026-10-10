/**
 * The notation dictionary's entries (see content/notationKit.ts for what an entry is). Every example's numbers are
 * computed by the engine (physics/, ui/texfmt) when the card opens, never typed in; content/notation.test.ts checks each
 * against its hand value. Wording is the course's own: plain sentences, Ground-up ≤ 25 words, Formal ≤ 40.
 */
import { dagger, mat, norm2, type Mat } from '../physics/linalg'
import { I } from '../physics/complex'
import { KET, type NamedKet } from '../physics/spin'
import { texCol, texMat } from '../ui/texfmt'
import { cx, parseLimits, tx, type NotationEntry, type Seg } from './notationKit'

const clean = (s?: string) => (s ?? '').replace(/[{}\s]/g, '')

/** "Add the next part once for every i from 1 to n" and its product twin. */
function limitsSentence(verb: string, lo: string | undefined, hi: string | undefined, of: string | undefined, formal: boolean): Seg[] | null {
  const L = parseLimits(lo, hi)
  if (!L) return of ? [`${verb} the part `, cx(of), ' once for each case.'] : null
  const body: Seg[] = of ? (formal ? [' The term is ', cx(of), '.'] : [' The part is ', cx(of), '.']) : []
  if (L.cond) return [`${verb} over every case with `, cx(L.cond), '.', ...body]
  if (L.v && L.from !== undefined && L.to !== undefined) return [`${verb} the next part once for every `, cx(L.v), ' from ', cx(L.from), ' to ', cx(L.to), '.', ...body]
  if (L.v && L.from !== undefined) return [`${verb} the next part once for every `, cx(L.v), ' starting at ', cx(L.from), '.', ...body]
  if (L.v) return [`${verb} the next part once for every possible `, cx(L.v), '.', ...body]
  return [`${verb} the parts up to `, cx(L.to), '.', ...body]
}

const SUM_EXAMPLE_N = 4

export const ENTRIES: readonly NotationEntry[] = [
  {
    id: 'sum',
    tex: '\\sum',
    name: 'Sum sign (capital sigma)',
    say: 'the sum, over the counter, of',
    ground: 'Σ means: add these up. A counter sits under it and a stopping value above it. Write the part after the sign once for each counter value, then add them all.',
    formal: 'Σ over a finite set adds the terms that follow it. With limits, the index runs through the integers from the lower value to the upper one, and the order of adding does not matter. Without limits, the index runs through every value in play.',
    physics: 'A quantum state is a sum of basis states, each with its own amplitude. An average is a sum of every possible reading times its chance.',
    example: () => {
      const terms = Array.from({ length: SUM_EXAMPLE_N }, (_, k) => (k + 1) ** 2)
      const total = terms.reduce((a, b) => a + b, 0)
      return {
        tex: `\\sum_{i=1}^{${SUM_EXAMPLE_N}} i^2 = ${terms.join(' + ')} = ${total}`,
        says: `The counter i takes the values 1 to ${SUM_EXAMPLE_N}, so the parts are ${terms.join(', ')}. They add up to ${total}.`,
        values: { n: SUM_EXAMPLE_N, total, last: terms[terms.length - 1] },
      }
    },
    here: (cx_, track) => limitsSentence('Add', cx_.lo, cx_.hi, cx_.of, track === 'formal'),
    taught: { qc709: 'f5-average' },
  },
  {
    id: 'ket',
    tex: '|\\psi\\rangle',
    name: 'Ket',
    say: 'ket psi',
    ground: 'A ket is a quantum state written as a column of numbers. The symbol inside is only its name.',
    formal: 'A ket $|\\psi\\rangle$ is a vector in the space of states; the symbol inside only names it. In a chosen basis it is the column of its amplitudes.',
    physics: 'A ket holds everything a quantum system can be said to be doing. Squaring an amplitude gives the chance of the matching reading.',
    example: () => {
      const v = KET['+x']
      return {
        tex: `|{+x}\\rangle = ${texCol(v)}`,
        says: 'The state "spin up along x" is a column of two numbers, one for each of the two z-states. Their squares add up to 1.',
        values: { top: v[0].re, bottom: v[1].re, sumSquares: norm2(v) },
      }
    },
    here: (cx_) => {
      const key = clean(cx_.a)
      const named: Record<string, string> = { '+z': 'spin up along z', '-z': 'spin down along z', '+x': 'spin up along x', '-x': 'spin down along x', '+y': 'spin up along y', '-y': 'spin down along y' }
      if (key in KET) return ['This ket is the state ', cx(cx_.a), ': ', named[key], ', the column ', tx(texCol(KET[key as NamedKet])), '.']
      if (key === '0' || key === '1') return ['This ket is the qubit state for the bit ', cx(cx_.a), '.']
      return cx_.a ? ['This ket is a state named ', cx(cx_.a), '.'] : null
    },
    taught: { sl448: 'l1-vectors', qc709: 'f2-vectors' },
  },
  {
    id: 'dagger',
    tex: '^\\dagger',
    name: 'Dagger (adjoint)',
    say: 'dagger',
    ground: 'The dagger flips a table over its diagonal and turns every number into its complex conjugate. For a single number it just conjugates.',
    formal: 'The dagger takes the adjoint: the conjugate transpose of a matrix, the conjugate of a number. It reverses products, $(AB)^\\dagger = B^\\dagger A^\\dagger$, and turns a ket into the matching bra.',
    physics: 'Real measurements belong to operators equal to their own dagger. Allowed changes of a state are the ones whose dagger undoes them.',
    example: () => {
      const A: Mat = mat([[1, I], [0, 2]])
      const D = dagger(A)
      return {
        tex: `A = ${texMat(A)} \\;\\Rightarrow\\; A^\\dagger = ${texMat(D)}`,
        says: 'The i in the top right moves to the bottom left and becomes −i. The diagonal has no i, so it stays.',
        values: { upperRightIm: A[0][1].im, lowerLeftIm: D[1][0].im, diag: D[0][0].re },
      }
    },
    taught: { sl448: 'l2-inner-product', qc709: 'f3-adjoint' },
  },
]
