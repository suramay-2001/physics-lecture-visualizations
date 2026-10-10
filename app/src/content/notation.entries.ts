/**
 * The notation dictionary's entries (see content/notationKit.ts for what an entry is). Every example's numbers are
 * computed by the engine when the card opens, never typed in; content/notation.test.ts checks each against its hand
 * value. Wording is the course's own: plain sentences, Ground-up ≤ 25 words, Formal ≤ 40, `$…$` for maths.
 *
 * `taught` points at the unit that teaches the notation (checked to exist). Notation no built chapter teaches has no
 * link: ≈, ∝, ⇒, ⇔, ±, ·, √, ∂ are school maths; mod, gcd and ⌊ ⌋ wait for chapter F8 ("Hidden rhythms": `f8-clock`,
 * `f8-euclid`, `f8-roots`), so their cards link nowhere until it is merged.
 */
import { c, abs, abs2, conj, expi, I, mul } from '../physics/complex'
import { apply, commutator, det2, diag2, dagger, identity, inner, mat, norm, norm2, outer, trace2, vconj, vec, type Mat } from '../physics/linalg'
import { binaryEntropy } from '../physics/qc/info'
import { rankN } from '../physics/qc/cmat'
import { cnot, cz, H, swap } from '../physics/qc/gates'
import { kron, kronAll, ket } from '../physics/qc/state'
import { AXIS, dot, eigenHermitian2, expectation, KET, nDotSigma, prob, samePhysicalState, SIGMA_X, SIGMA_Y, SIGMA_Z, SZ, tiltXZ, unit, type NamedKet } from '../physics/spin'
import { texC, texCol, texMat, texNum, texRow } from '../ui/texfmt'
import { cx, parseLimits, tx, type Example, type NotationEntry, type Seg } from './notationKit'

const clean = (s?: string) => (s ?? '').replace(/[{}\s]/g, '')
const isNum = (s?: string) => !!s && /^\d+(\.\d+)?$/.test(s.trim())
const same = (a?: string, b?: string) => !!a && clean(a) === clean(b)
/** The number a unit-vector column or row prints as. */
const col = texCol
/** A central-difference slope: the engine of the d/dt and ∂ examples (no calculus library needed). */
const slope = (f: (x: number) => number, x: number, h = 1e-4) => (f(x + h) - f(x - h)) / (2 * h)
const ex = (tex: string, says: string, values: Example['values']): Example => ({ tex, says, values })

/** "Add the next part once for every i from 1 to n" and its product twin. */
function limitsSentence(verb: string, lo: string | undefined, hi: string | undefined, of: string | undefined, formal: boolean): Seg[] | null {
  const L = parseLimits(lo, hi)
  if (!L) return of ? [`${verb} the parts `, cx(of), ' over every case.'] : null
  const body: Seg[] = of ? (formal ? [' The term is ', cx(of), '.'] : [' The part is ', cx(of), '.']) : []
  if (L.set && L.v) return [`${verb} the next part once for every `, cx(L.v), ' in ', cx(L.set), '.', ...body]
  if (L.cond && L.v) return [`${verb} the next part once for every `, cx(L.v), ' for which ', cx(L.cond), '.', ...body]
  if (L.cond) return [`${verb} over every case with `, cx(L.cond), '.', ...body]
  if (L.v && L.from !== undefined && L.to !== undefined) return [`${verb} the next part once for every `, cx(L.v), ' from ', cx(L.from), ' to ', cx(L.to), '.', ...body]
  if (L.v && L.from !== undefined) return [`${verb} the next part once for every `, cx(L.v), ' starting at ', cx(L.from), '.', ...body]
  if (L.v) return [`${verb} the next part once for every possible `, cx(L.v), '.', ...body]
  return [`${verb} the parts up to `, cx(L.to), '.', ...body]
}

/** `i\varphi` → the angle `\varphi`; `-i\omega t` → turning the other way by `\omega t`. */
const phaseOf = (of?: string): { back: boolean; angle: string } | null => {
  const m = /^([-+]?)\s*i\s*(.*)$/.exec(of ?? '')
  return m ? { back: m[1] === '-', angle: m[2] } : null
}

const SPIN_LABEL: Record<string, string> = { '+z': 'spin up along z', '-z': 'spin down along z', '+x': 'spin up along x', '-x': 'spin down along x', '+y': 'spin up along y', '-y': 'spin down along y' }

export const ENTRIES: readonly NotationEntry[] = [
  // ---- sums and products ------------------------------------------------------------------------------------------
  {
    id: 'sum',
    tex: '\\sum',
    name: 'Sum sign (capital sigma)',
    say: 'the sum, over the counter, of',
    ground: 'Σ means: add these up. A counter sits under it and a stopping value above it. Write the part after the sign once for each counter value, then add them all.',
    formal: 'Σ adds the terms that follow it. With limits, the index runs through the integers from the lower value to the upper one; without them, it runs through every value in play. The order of adding does not matter.',
    physics: 'A quantum state is a sum of basis states, each with its own amplitude. An average is a sum of every possible reading times its chance.',
    example: () => {
      const n = 4
      const terms = Array.from({ length: n }, (_, k) => (k + 1) ** 2)
      const total = terms.reduce((a, b) => a + b, 0)
      return ex(`\\sum_{i=1}^{${n}} i^2 = ${terms.join(' + ')} = ${total}`, `The counter i takes the values 1 to ${n}, so the parts are ${terms.join(', ')}. They add up to ${total}.`, { n, total, last: terms[n - 1] })
    },
    here: (k, track) => limitsSentence('Add', k.lo, k.hi, k.of, track === 'formal'),
    taught: { sl448: 'l4-average', qc709: 'f5-average' },
  },
  {
    id: 'product',
    tex: '\\prod',
    name: 'Product sign (capital pi)',
    say: 'the product, over the counter, of',
    ground: 'Π means: multiply these together. Like Σ, it has a counter under it and a stopping value above it. Write the part once for each counter value and multiply the results.',
    formal: 'Π multiplies the factors that follow it. The index runs through the integers between the limits, and the order of multiplying does not matter. An empty product is 1, as an empty sum is 0.',
    physics: 'Chances of independent events multiply, and so do the parts of a joint state: n separate qubits give n one-qubit factors.',
    example: () => {
      const n = 4
      const factors = Array.from({ length: n }, (_, k) => k + 1)
      const total = factors.reduce((a, b) => a * b, 1)
      return ex(`\\prod_{k=1}^{${n}} k = ${factors.join(' \\cdot ')} = ${total}`, `The counter k takes 1 to ${n}. Multiplying 1, 2, 3 and 4 gives ${total}.`, { n, total })
    },
    here: (k, track) => limitsSentence('Multiply', k.lo, k.hi, k.of, track === 'formal'),
    taught: { qc709: 'f6-pairs' },
  },

  // ---- joining systems ---------------------------------------------------------------------------------------------
  {
    id: 'tensor',
    tex: '\\otimes',
    name: 'Tensor product (circled times)',
    say: 'tensor, or tensor product with',
    ground: 'A ⊗ B joins two separate systems into one. Every number in A is multiplied by every number in B, so the joint list is longer.',
    formal: 'The tensor (Kronecker) product combines two state spaces into the joint space of the pair. In components, every amplitude of the first factor multiplies every amplitude of the second, in a fixed order.',
    physics: 'Two separate qubits live together in a joint space. A joint state that cannot be written as one ⊗ product is entangled.',
    example: () => {
      const a = ket('0')
      const b = ket('1')
      const v = kron(a, b)
      return ex(`${col(a)} \\otimes ${col(b)} = ${col(v)}`, 'Qubit 0 is in state 0 and qubit 1 in state 1. The joint list has 2 × 2 = 4 numbers, with the single 1 in the place for "01".', { length: v.length, onePosition: v.findIndex((z) => z.re === 1) })
    },
    taught: { sl448: 'l9-tensor', qc709: 'f6-kron' },
  },
  {
    id: 'tensor-power',
    tex: 'H^{\\otimes n}',
    name: 'Tensor power (n copies)',
    say: 'H tensor n, or n copies of H side by side',
    ground: 'A circled times with a number above a symbol means that many copies side by side. For n qubits, the joint list has 2 to the power n numbers.',
    formal: '$X^{\\otimes n}$ is the tensor product of n copies of $X$. For a ket of one qubit it is a register of n qubits, a vector with 2ⁿ amplitudes; for a gate it is that gate applied to every qubit.',
    physics: 'A register of n qubits needs 2ⁿ amplitudes. That growth is why simulating many qubits on an ordinary computer gets hard.',
    example: () => {
      const n = 3
      const v = kronAll(Array.from({ length: n }, () => ket('0')))
      return ex(`|0\\rangle^{\\otimes ${n}} = |${'0'.repeat(n)}\\rangle: \\; 2^{${n}} = ${v.length} \\text{ numbers}`, `Three copies of $|0\\rangle$ give the state $|000\\rangle$. Its list has $2^3 = ${v.length}$ numbers, a single 1 and seven 0s.`, { copies: n, length: v.length, onePosition: v.findIndex((z) => z.re === 1) })
    },
    here: (k) => (isNum(k.of) ? ['Here: ', cx(k.of), ` copies, so ${2 ** Number(k.of)} amplitudes for a state.`] : k.of ? ['Here: ', cx(k.of), ' copies side by side.'] : null),
    taught: { qc709: 'q4-registers' },
  },
  {
    id: 'xor',
    tex: '\\oplus',
    name: 'XOR (circled plus)',
    say: 'x-or, or plus without carrying',
    ground: 'a ⊕ b adds two bits and throws the carry away. The answer is 1 when exactly one of the two is 1. For bit strings, do it position by position.',
    formal: 'On bits, ⊕ is addition mod 2 (exclusive or): 0 ⊕ 0 = 1 ⊕ 1 = 0 and 0 ⊕ 1 = 1 ⊕ 0 = 1. On bit strings it acts position by position, and a ⊕ b ⊕ b = a.',
    physics: 'A reversible gate such as CNOT adds the control bit to the target with ⊕, so nothing is lost and the step can run backwards.',
    example: () => {
      const a = 0b1011
      const b = 0b0110
      const r = a ^ b
      const s = (x: number) => x.toString(2).padStart(4, '0')
      return ex(`${s(a)} \\oplus ${s(b)} = ${s(r)}`, `Position by position: 1⊕0 = 1, 0⊕1 = 1, 1⊕1 = 0, 1⊕0 = 1. The result is ${s(r)}.`, { result: r, ones: r.toString(2).split('1').length - 1 })
    },
    taught: { sl448: 'l8-key', qc709: 'f7-xor' },
  },
  {
    id: 'dagger',
    tex: '^\\dagger',
    name: 'Dagger (adjoint)',
    say: 'dagger',
    ground: 'The dagger flips a table over its diagonal and turns every number into its complex conjugate. For a single number it just conjugates.',
    formal: 'The dagger takes the adjoint: the conjugate transpose of a matrix, the conjugate of a number. It reverses products, $(AB)^\\dagger = B^\\dagger A^\\dagger$, and turns a ket into the matching bra.',
    physics: 'A measurement belongs to an operator equal to its own dagger. An allowed change of a state is one whose dagger undoes it.',
    example: () => {
      const A: Mat = mat([[1, I], [0, 2]])
      const D = dagger(A)
      return ex(`A = ${texMat(A)} \\;\\Rightarrow\\; A^\\dagger = ${texMat(D)}`, 'The i in the top right moves to the bottom left and becomes −i. The diagonal has no i, so it stays.', { upperRightIm: A[0][1].im, lowerLeftIm: D[1][0].im, diag: D[0][0].re })
    },
    taught: { sl448: 'l11-unitary', qc709: 'f3-adjoint' },
  },
  {
    id: 'conjugate',
    tex: 'z^*',
    name: 'Complex conjugate (star)',
    say: 'z star, or the conjugate of z',
    ground: 'A star on a number means its complex conjugate: keep the real part, flip the sign of the imaginary part. A number times its star is its size squared.',
    formal: 'z* is the complex conjugate, the mirror image of z in the real axis: (a + bi)* = a − bi. Then z z* = |z|², which is real and not negative.',
    physics: 'Amplitudes are complex, and a chance is an amplitude times its own conjugate. The bra of a ket uses the conjugated amplitudes.',
    example: () => {
      const z = c(3, 4)
      const zc = conj(z)
      const zz = mul(z, zc)
      return ex(`z = ${texC(z)} \\;\\Rightarrow\\; z^* = ${texC(zc)},\\quad z z^* = ${texNum(zz.re)}`, 'Only the sign of the i part changes. Multiplying the two gives 25, which is the size of z squared.', { re: zc.re, im: zc.im, product: zz.re, size: abs(z) })
    },
    taught: { sl448: 'l2-inner-product', qc709: 'f1-plane' },
  },

  // ---- bras, kets and their relatives --------------------------------------------------------------------------------
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
      return ex(`|{+x}\\rangle = ${col(v)}`, 'The state "spin up along x" is a column of two numbers, one for each of the two z-states. Their squares add up to 1.', { top: v[0].re, bottom: v[1].re, sumSquares: norm2(v) })
    },
    here: (k) => {
      const key = clean(k.a)
      if (key in KET) return ['This ket is the state ', cx(k.a), ': ', SPIN_LABEL[key], ', the column ', tx(col(KET[key as NamedKet])), '.']
      if (key === '0' || key === '1') return ['This ket is the qubit state for the bit ', cx(k.a), '.']
      return k.a ? ['This ket is a state named ', cx(k.a), '.'] : null
    },
    taught: { sl448: 'l1-vectors', qc709: 'f2-vectors' },
  },
  {
    id: 'bra',
    tex: '\\langle\\psi|',
    name: 'Bra',
    say: 'bra psi',
    ground: 'A bra is a ket turned on its side into a row, with every number conjugated. A bra waits for a ket, and together they make one number.',
    formal: 'The bra $\\langle a|$ is the dual of the ket $|a\\rangle$: the row of conjugated amplitudes. It sends any ket $|b\\rangle$ to the number $\\langle a|b\\rangle$.',
    physics: 'The question "is the system in state a?" is a bra: put it in front of the state and you get an amplitude.',
    example: () => {
      const v = KET['+y']
      const b = vconj(v)
      return ex(`|{+y}\\rangle = ${col(v)} \\;\\Rightarrow\\; \\langle{+y}| = ${texRow(b)}`, 'Lay the column on its side, then flip the sign of every i. Here the second entry goes from i/√2 to −i/√2.', { secondIm: b[1].im, firstRe: b[0].re })
    },
    here: (k) => (k.a ? ['This is the bra of the state ', cx(k.a), ': ready to be put in front of a ket.'] : null),
    taught: { sl448: 'l2-inner-product', qc709: 'f2-inner-product' },
  },
  {
    id: 'braket',
    tex: '\\langle a|b\\rangle',
    name: 'Bracket (overlap, inner product)',
    say: 'bra a, ket b: the overlap of a with b',
    ground: '$\\langle a|b\\rangle$ is one number that says how much of state b points along state a. It is 1 when they match and 0 when they are completely different.',
    formal: '$\\langle a|b\\rangle$ is the inner product: conjugate the amplitudes of a, multiply them with those of b, and add. It is linear in b and conjugate-linear in a, and $\\langle a|a\\rangle$ = 1 for a normalized state.',
    physics: 'The chance of reading outcome a when the state is b is the squared size of the bracket, $|\\langle a|b\\rangle|^2$.',
    example: () => {
      const o = inner(KET['+z'], KET['+x'])
      const p = abs2(o)
      return ex(`\\langle{+z}|{+x}\\rangle = ${texNum(o.re)},\\quad |\\langle{+z}|{+x}\\rangle|^2 = ${texNum(p)}`, 'The overlap of spin-up-along-z with spin-up-along-x is 1/√2. Squared, it is ½: a 50 % chance of finding "up along z".', { overlap: o.re, chance: p })
    },
    here: (k) => (k.a && k.b ? ['The overlap of ', cx(k.a), ' with ', cx(k.b), '.'] : null),
    taught: { sl448: 'l2-inner-product', qc709: 'f2-inner-product' },
  },
  {
    id: 'sandwich',
    tex: '\\langle a|M|b\\rangle',
    name: 'Matrix element (bra, operator, ket)',
    say: 'bra a, M, ket b',
    ground: 'Start with state b, let M act on it, then take the overlap with a. The result is one number. When a and b are the same state, it is the average of M there.',
    formal: '$\\langle a|M|b\\rangle$ is the inner product of a with $M|b\\rangle$: the (a, b) entry of M in a basis containing both. For a = b it is the expectation value of M in that state.',
    physics: 'The average reading of an observable M in state ψ is $\\langle \\psi|M|\\psi\\rangle$. The entry $\\langle i|M|j\\rangle$ says how strongly M turns state j into state i.',
    example: () => {
      const avg = expectation(SIGMA_Z, KET['+x'])
      const entry = inner(KET['+z'], apply(SIGMA_X, KET['-z']))
      return ex(`\\langle{+x}|\\sigma_z|{+x}\\rangle = ${texNum(avg)},\\quad \\langle{+z}|\\sigma_x|{-z}\\rangle = ${texNum(entry.re)}`, '$\\sigma_z$ averages to 0 in the state "up along x": half the readings are +1 and half are −1. $\\sigma_x$ turns $|{-z}\\rangle$ into $|{+z}\\rangle$, so that entry is 1.', { average: avg, entry: entry.re })
    },
    here: (k) => {
      if (!k.m) return null
      if (same(k.a, k.b)) return ['The average of ', cx(k.m), ' in the state ', cx(k.b), '.']
      return k.a && k.b ? ['How much ', cx(k.m), ' turns the state ', cx(k.b), ' into the state ', cx(k.a), '.'] : null
    },
    taught: { sl448: 'l4-average', qc709: 'f3-matrix-of-map' },
  },
  {
    id: 'average',
    tex: '\\langle A\\rangle',
    name: 'Average (expectation value)',
    say: 'the average of A',
    ground: '$\\langle A\\rangle$ is the average of A: measure A on many identical copies of the state and average the readings. No single atom reads the average.',
    formal: '$\\langle A\\rangle = \\langle \\psi|A|\\psi\\rangle$ is the expectation value of the observable A in the state ψ: each possible reading times its probability, summed over all readings.',
    physics: 'It is what many repeats settle on, and it follows from the state alone. Averages are the classical-looking part of a quantum measurement.',
    example: () => {
      const psi = vec(Math.sqrt(3) / 2, 0.5)
      const up = prob(KET['+z'], psi)
      const down = prob(KET['-z'], psi)
      const avg = expectation(SIGMA_Z, psi)
      return ex(`\\langle\\sigma_z\\rangle = (+1)\\cdot ${texNum(up)} + (-1)\\cdot ${texNum(down)} = ${texNum(avg)}`, 'In this state the reading +1 has chance 75 % and −1 has 25 %. Weighting each reading by its chance gives an average of ½.', { up, down, average: avg })
    },
    here: (k) => (k.of ? ['Here: the average of ', cx(k.of), ' over many repeats.'] : null),
    taught: { sl448: 'l4-average', qc709: 'f5-average' },
  },
  {
    id: 'outer',
    tex: '|a\\rangle\\langle b|',
    name: 'Outer product (ket next to bra)',
    say: 'ket a, bra b',
    ground: '$|a\\rangle\\langle b|$ is a ket next to a bra. It is a table of numbers: apply it to a state c and you get $|a\\rangle$ times the overlap $\\langle b|c\\rangle$.',
    formal: '$|a\\rangle\\langle b|$ is the rank-one operator $c \\mapsto \\langle b|c\\rangle\\,|a\\rangle$, with matrix entries $a_i b_j^*$. For a normalized a it is, with b = a, the projector onto a.',
    physics: 'A yes/no question about a state is a projector $|a\\rangle\\langle a|$. Sums of them build every measurement and the identity.',
    example: () => {
      const P = outer(KET['+z'], KET['+z'])
      return ex(`|{+z}\\rangle\\langle{+z}| = ${texMat(P)}`, 'The column (1, 0) times its own row (1, 0) is a 2 × 2 table with a single 1. It keeps the "up along z" part of a state and drops the rest.', { p00: P[0][0].re, p11: P[1][1].re, trace: trace2(P).re })
    },
    here: (k) => {
      if (!k.a || !k.b) return null
      return same(k.a, k.b)
        ? ['A projector onto the state ', cx(k.a), ': it keeps the part of a state that lies along ', cx(k.a), '.']
        : ['An operator that sends the state ', cx(k.b), ' to ', cx(k.a), '.']
    },
    taught: { sl448: 'l3-projectors', qc709: 'q2-operators' },
  },

  // ---- sizes -------------------------------------------------------------------------------------------------------
  {
    id: 'norm',
    tex: '\\|v\\|',
    name: 'Norm (length)',
    say: 'the length of v',
    ground: 'Two bars around a vector mean its length: square the size of each number, add them, take the square root. A state of the system has length 1.',
    formal: '$\\|v\\| = \\sqrt{\\langle v|v\\rangle}$ is the length of v: the square root of the sum of the squared moduli of its components. A state vector is normalized, $\\|\\psi\\| = 1$.',
    physics: 'Total probability must be 1, which is the same as saying a state has length 1. Allowed changes of a state keep its length.',
    example: () => {
      const v = vec(3, 4)
      const n = norm(v)
      return ex(`\\|(3, 4)\\| = \\sqrt{3^2 + 4^2} = ${texNum(n)}`, 'The arrow from the origin to (3, 4) is the hypotenuse of a 3-4-5 triangle, so its length is 5.', { length: n })
    },
    here: (k) => (k.of ? ['The length of ', cx(k.of), '.'] : null),
    taught: { qc709: 'f2-norm-angle' },
  },
  {
    id: 'abs',
    tex: '|z|',
    name: 'Modulus (size)',
    say: 'the size of z',
    ground: 'Single bars around a number mean its size. For a real number, drop the sign. For a complex number, it is the distance from 0 in the plane.',
    formal: '|z| = √(z z*) is the modulus of z. For z = a + bi it is √(a² + b²); for a real number it is the usual absolute value.',
    physics: 'The squared size of an amplitude, |c|², is the chance of its outcome.',
    example: () => {
      const z = c(3, 4)
      return ex(`|${texC(z)}| = \\sqrt{3^2 + 4^2} = ${texNum(abs(z))}`, 'The number 3 + 4i sits 3 across and 4 up, so its distance from 0 is 5.', { size: abs(z) })
    },
    here: (k) => {
      if (!k.of) return null
      return /\\langle/.test(k.of) ? ['The size of an overlap. Squared, it is a chance.'] : ['The size of ', cx(k.of), '.']
    },
    taught: { sl448: 'l2-complex', qc709: 'f1-plane' },
  },
  {
    id: 'commutator',
    tex: '[A, B]',
    name: 'Commutator',
    say: 'the commutator of A and B',
    ground: '[A, B] means AB − BA: do B first, then A, and subtract doing A first, then B. It is zero exactly when the order does not matter.',
    formal: '[A, B] = AB − BA measures how far two operators are from commuting. It is zero exactly when the order does not matter, and then two Hermitian operators share a set of eigenstates.',
    physics: 'Two measurements can have sharp values together only when their operators commute. Otherwise the spreads obey an uncertainty floor.',
    example: () => {
      const C = commutator(SIGMA_X, SIGMA_Y)
      return ex(`[\\sigma_x, \\sigma_y] = ${texMat(C)} = 2i\\,\\sigma_z`, 'Doing $\\sigma_x$ then $\\sigma_y$ is not the same as $\\sigma_y$ then $\\sigma_x$: the difference is $2i$ times $\\sigma_z$, which is not zero.', { c00Im: C[0][0].im, c11Im: C[1][1].im, offDiagonal: abs(C[0][1]) })
    },
    here: (k) => (k.a && k.b ? ['Here: ', cx(k.a), ' then ', cx(k.b), ' minus ', cx(k.b), ' then ', cx(k.a), '. If it is zero, the order does not matter.'] : null),
    taught: { sl448: 'l7-order', qc709: 'f3-products' },
  },

  // ---- operators, matrices, trace ----------------------------------------------------------------------------------------
  {
    id: 'trace',
    tex: '\\mathrm{Tr}',
    name: 'Trace',
    say: 'the trace of',
    ground: 'Tr means: add up the numbers on the diagonal of a table, from top left to bottom right. The result is a single number.',
    formal: 'Tr M is the sum of the diagonal entries of M. It does not depend on the basis, and Tr(AB) = Tr(BA).',
    physics: 'The average of an observable A in a mixed state ρ is Tr(ρA). Tr ρ = 1 says the chances add up to 1.',
    example: () => {
      const M = mat([[3, 1], [2, 4]])
      return ex(`\\mathrm{Tr}${texMat(M)} = 3 + 4 = ${texNum(trace2(M).re)}`, 'Only the 3 and the 4 on the diagonal count; the 1 and the 2 are ignored.', { trace: trace2(M).re })
    },
    here: (k) => (k.of ? ['Here: add the diagonal of ', cx(k.of), '.'] : null),
    taught: { sl448: 'l6-mixture', qc709: 'f4-eigen' },
  },
  {
    id: 'det',
    tex: '\\det',
    name: 'Determinant',
    say: 'the determinant of',
    ground: 'For a 2 by 2 table, det is the top-left number times the bottom-right one, minus the product of the other two. It is 0 when the table squashes a direction flat.',
    formal: 'det M is the factor by which M scales areas (volumes, in higher dimension). It is the product of the eigenvalues, and M is invertible exactly when det M ≠ 0.',
    physics: 'Setting det(M − λI) = 0 finds the eigenvalues of M: the only readings a measurement of M can give.',
    example: () => {
      const M = mat([[3, 1], [2, 4]])
      return ex(`\\det${texMat(M)} = 3\\cdot 4 - 1\\cdot 2 = ${texNum(det2(M).re)}`, 'Multiply down the main diagonal, 3 × 4 = 12, and subtract the other diagonal, 1 × 2 = 2.', { det: det2(M).re })
    },
    here: (k) => (k.of ? ['Here: the determinant of ', cx(k.of), '.'] : null),
    taught: { sl448: 'l4-eigen', qc709: 'f4-eigen' },
  },
  {
    id: 'diag',
    tex: '\\mathrm{diag}',
    name: 'Diagonal matrix',
    say: 'diag, a diagonal table with',
    ground: 'diag(a, b, …) is a table with a, b, … down the diagonal and 0 everywhere else.',
    formal: 'diag(a₁, …, aₙ) is the n × n matrix with the aᵢ on the diagonal and zeros elsewhere. It acts by scaling each coordinate separately: it is the matrix of an operator in its own eigenbasis.',
    physics: 'In its own eigenbasis an observable is diagonal, and the readings it can give are the numbers on the diagonal.',
    example: () => {
      const D = diag2(2, -1)
      return ex(`\\mathrm{diag}(2, -1) = ${texMat(D)}`, 'The 2 and the −1 sit on the diagonal; the corners are 0. It stretches the first direction by 2 and flips the second.', { d00: D[0][0].re, d11: D[1][1].re, corner: abs(D[0][1]) })
    },
    here: (k) => (k.of ? ['Here: ', cx(k.of), ' goes down the diagonal.'] : null),
    taught: { sl448: 'l5-operators', qc709: 'f4-spectral' },
  },
  {
    id: 'rank',
    tex: '\\mathrm{rank}',
    name: 'Rank',
    say: 'the rank of',
    ground: 'The rank of a table of numbers counts how many of its rows are really different, not just multiples or sums of others.',
    formal: 'rank M is the dimension of the span of the columns (equally, of the rows) of M. It is the number of nonzero singular values, and M is invertible iff its rank equals its size.',
    physics: 'A joint state of two parts is a product exactly when its table of amplitudes has rank 1. A higher rank means entanglement.',
    example: () => {
      const M = mat([[1, 2], [2, 4]])
      return ex(`\\mathrm{rank}${texMat(M)} = ${rankN(M)}`, 'The second row is exactly twice the first, so there is only one different row: the rank is 1.', { rank: rankN(M) })
    },
    taught: { qc709: 'f6-product-or-not' },
  },
  {
    id: 'span',
    tex: '\\mathrm{span}',
    name: 'Span',
    say: 'the span of',
    ground: 'The span of some states is everything you can make by scaling them and adding the results.',
    formal: 'span{v₁, …, vₖ} is the set of all linear combinations of the vᵢ: the smallest subspace that contains them.',
    physics: 'Two different states of a qubit span the whole qubit space: every other state is a mix of them with amplitudes.',
    example: () => {
      const M = mat([[1, 1], [0, 1]])
      return ex(`\\mathrm{span}\\{(1,0), (1,1)\\}:\\; \\mathrm{rank}${texMat(M)} = ${rankN(M)}`, 'The two arrows point in different directions, so their span has two independent directions: it is the whole plane.', { dimension: rankN(M) })
    },
    taught: { qc709: 'q2-basis' },
  },
  {
    id: 'identity',
    tex: 'I',
    name: 'Identity',
    say: 'the identity, I or one-hat',
    ground: 'I is the do-nothing operator: it sends every state to itself. As a table it has 1s down the diagonal and 0s elsewhere.',
    formal: 'The identity $I$ (or $\\hat 1$) satisfies $I|\\psi\\rangle = |\\psi\\rangle$ for every state. In any basis its matrix has entries $\\delta_{ij}$, and it commutes with every operator.',
    physics: 'A complete set of states adds up to the identity, $\\sum |a\\rangle\\langle a| = I$: some outcome always happens, and the chances add up to 1.',
    example: () => {
      const out = apply(identity(2), KET['+y'])
      return ex(`I = ${texMat(identity(2))}, \\quad I\\,|{+y}\\rangle = ${col(out)}`, 'The state comes out exactly as it went in, including the i.', { changed: Math.max(...out.map((z, k) => abs(c(z.re - KET['+y'][k].re, z.im - KET['+y'][k].im)))) })
    },
    here: (k) => (k.m === 'gate' ? ['Here I is the identity gate: this qubit is left alone.'] : null),
    taught: { qc709: 'f3-linear-maps' },
  },
  {
    id: 'matrix',
    tex: '\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}',
    name: 'Matrix (or column, or row)',
    say: 'a table of numbers in brackets',
    ground: 'A grid of numbers in brackets. A single column is a state, a square grid is an operator, and the grid acts on a column by rows times column.',
    formal: 'A rectangular array of entries. In a basis, a column is a vector and a square matrix is a linear map; $M v$ takes each row of M against v: $(Mv)_i = \\sum_j M_{ij} v_j$.',
    physics: 'States are columns, measurements and gates are square matrices, and applying a gate is multiplying the column by its matrix.',
    example: () => {
      const out = apply(SIGMA_X, KET['+z'])
      return ex(`${texMat(SIGMA_X)}${col(KET['+z'])} = ${col(out)}`, 'Each row of the grid is paired with the column: row one gives 0·1 + 1·0 = 0, row two gives 1·1 + 0·0 = 1. The state flipped.', { top: out[0].re, bottom: out[1].re })
    },
    here: (k) => {
      const r = Number(k.lo)
      const q = Number(k.hi)
      if (!r || !q) return null
      if (q === 1) return [`A column of ${r} numbers: a list, such as a state of ${Math.log2(r) % 1 === 0 && r > 1 ? `${Math.log2(r)} qubit${Math.log2(r) === 1 ? '' : 's'}` : 'amplitudes'}.`]
      if (r === 1) return [`A row of ${q} numbers: the form a bra takes.`]
      return r === q ? [`A ${r} × ${r} grid: an operator on a space of ${r} states.`] : [`A ${r} × ${q} grid: it takes a column of ${q} numbers to a column of ${r}.`]
    },
    taught: { sl448: 'l3-operators', qc709: 'f3-matrix-of-map' },
  },
  {
    id: 'kronecker',
    tex: '\\delta_{ij}',
    name: 'Kronecker delta',
    say: 'delta i j',
    ground: 'δ with two indices is 1 when the two indices are equal and 0 otherwise. It picks out matching pairs.',
    formal: '$\\delta_{ij} = 1$ if $i = j$ and 0 if $i \\ne j$. It is the entry of the identity matrix, and it states orthonormality as $\\langle e_i|e_j\\rangle = \\delta_{ij}$.',
    physics: 'Orthonormal states satisfy $\\langle i|j\\rangle = \\delta_{ij}$: different outcomes are completely distinct, and each state has length 1.',
    example: () => {
      const D = identity(3)
      return ex(`\\delta_{ij} = ${texMat(D)}`, 'Row i and column j hold $\\delta_{ij}$: 1 on the diagonal where $i = j$, and 0 everywhere else.', { d00: D[0][0].re, d01: D[0][1].re, trace: D.reduce((s, row, k) => s + row[k].re, 0) })
    },
    here: (k) => (k.a && k.b ? ['Here: 1 if ', cx(k.a), ' and ', cx(k.b), ' are the same index, and 0 if they differ.'] : null),
    taught: { sl448: 'l4-basis', qc709: 'f2-orthonormal' },
  },
  {
    id: 'hat',
    tex: '\\hat A',
    name: 'Hat (operator, or unit vector)',
    say: 'A hat',
    ground: 'A hat has two jobs. On a capital letter it marks an operator, a machine that turns states into states. On a small letter like n it marks a direction of length 1.',
    formal: '$\\hat A$ marks an operator on the state space, a linear map often written as a matrix in a basis. $\\hat n$ marks a unit vector in space, $\\|\\hat n\\| = 1$.',
    physics: 'Every measurable quantity is an operator $\\hat A$, and the spin along a direction $\\hat n$ is built from $\\hat n$ itself.',
    example: () => {
      const n = unit([0.6, 0, 0.8])
      return ex(`\\hat n = (${texNum(n[0])}, ${texNum(n[1])}, ${texNum(n[2])}),\\quad \\|\\hat n\\| = ${texNum(Math.hypot(...n))}`, 'The numbers 0.6 and 0.8 are chosen so that 0.36 + 0.64 = 1: the arrow has length exactly 1.', { length: Math.hypot(...n) })
    },
    here: (k) => {
      const a = (k.of ?? '').trim()
      if (!a) return null
      return /^[a-z]$/.test(a) ? ['Here the hat on ', cx(a), ' marks a direction of length 1.'] : ['Here the hat on ', cx(a), ' marks an operator.']
    },
    taught: { sl448: 'l3-operators', qc709: 'f3-matrix-of-map' },
  },
  {
    id: 'vec',
    tex: '\\vec r',
    name: 'Arrow over a letter (vector)',
    say: 'vector r',
    ground: 'An arrow over a letter says the symbol is a vector. A vector has a size and a direction, like a position, a field or a spin direction.',
    formal: '$\\vec v$ is a vector in ordinary three-dimensional space, with components $(v_x, v_y, v_z)$. The arrow separates it from a ket or a single number.',
    physics: 'The Bloch vector $\\vec r$ places a spin state as a point in space. The magnetic field $\\vec B$ and the moment $\\vec\\mu$ are vectors too.',
    example: () => {
      const v = vec(1, 2, 2)
      return ex(`\\vec v = (1, 2, 2),\\quad |\\vec v| = \\sqrt{1 + 4 + 4} = ${texNum(norm(v))}`, 'Three numbers locate an arrow in space. Its length comes from adding the squares of the three numbers and taking the root.', { length: norm(v) })
    },
    here: (k) => (k.of ? ['Here: ', cx(k.of), ' is a vector with a size and a direction.'] : null),
    taught: { sl448: 'l6-bloch', qc709: 'q3-bloch' },
  },

  // ---- Pauli matrices and gates ------------------------------------------------------------------------------------------
  {
    id: 'sigma-vec',
    tex: '\\vec\\sigma',
    name: 'Sigma vector (the three spin matrices)',
    say: 'sigma vector',
    ground: '$\\vec\\sigma$ bundles the three spin matrices $\\sigma_x$, $\\sigma_y$, $\\sigma_z$ into one vector, so you can take dot products with directions.',
    formal: '$\\vec\\sigma = (\\sigma_x, \\sigma_y, \\sigma_z)$ is the vector of Pauli matrices. For a unit vector $\\hat n$, $\\hat n\\cdot\\vec\\sigma$ is the Pauli matrix along $\\hat n$.',
    physics: 'Spin along any direction $\\hat n$ is $(\\hbar/2)\\,\\hat n\\cdot\\vec\\sigma$. The three matrices are the three components of spin in one symbol.',
    example: () => {
      const M = nDotSigma(AXIS.z)
      return ex(`\\hat z\\cdot\\vec\\sigma = 0\\,\\sigma_x + 0\\,\\sigma_y + 1\\,\\sigma_z = ${texMat(M)}`, 'Dotting with the z direction keeps only $\\sigma_z$, because the x and y numbers of $\\hat z$ are 0.', { d00: M[0][0].re, d11: M[1][1].re })
    },
    taught: { sl448: 'l4-matrices', qc709: 'q3-spin-operators' },
  },
  {
    id: 'sigma-dot',
    tex: '\\hat n\\cdot\\vec\\sigma',
    name: 'Spin matrix along a direction',
    say: 'n hat dot sigma vector',
    ground: '$\\hat n\\cdot\\vec\\sigma$ mixes the three spin matrices using the three numbers of the direction $\\hat n$. Measured along $\\hat n$, the only readings are +1 and −1.',
    formal: 'For a unit vector $\\hat n$, $\\hat n\\cdot\\vec\\sigma = n_x\\sigma_x + n_y\\sigma_y + n_z\\sigma_z$ is Hermitian with eigenvalues ±1. Its eigenvectors $|\\pm\\hat n\\rangle$ are the spin states pointing along $\\pm\\hat n$.',
    physics: 'A Stern–Gerlach magnet turned to $\\hat n$ measures exactly this operator. For a state with Bloch vector $\\vec r$, its average is $\\hat n\\cdot\\vec r$.',
    example: () => {
      const n = tiltXZ(Math.PI / 3)
      const M = nDotSigma(n)
      const e = eigenHermitian2(M)
      return ex(`\\hat n = (\\sin 60^\\circ, 0, \\cos 60^\\circ) \\Rightarrow \\hat n\\cdot\\vec\\sigma = ${texMat(M)}`, 'Tilting the direction 60° from z mixes $\\sigma_z$ and $\\sigma_x$. The readings are still only +1 and −1, whatever the tilt.', { d00: M[0][0].re, offDiagonal: M[0][1].re, high: e.values[0], low: e.values[1] })
    },
    here: (k) => (k.a ? ['Here: the spin matrix along the direction ', cx(k.a), '. Its readings are +1 and −1.'] : null),
    taught: { sl448: 'l6-bloch', qc709: 'q3-bloch' },
  },
  {
    id: 'pauli-x',
    tex: '\\sigma_x',
    name: 'Pauli X (bit flip, spin along x)',
    say: 'sigma x, or the X gate',
    ground: 'X swaps the two basis states, $|{+z}\\rangle$ and $|{-z}\\rangle$ (the bits 0 and 1). As a table it is 0, 1 on top and 1, 0 below.',
    formal: '$\\sigma_x = X = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$ swaps the z-basis states; as a gate it is NOT. It is Hermitian and unitary, $X^2 = I$, and its eigenstates are $|{\\pm x}\\rangle$ with eigenvalues ±1.',
    physics: '$\\sigma_x$ is the spin component along x, in units of $\\hbar/2$. In circuits the same matrix is the bit flip.',
    example: () => {
      const out = apply(SIGMA_X, KET['+z'])
      return ex(`\\sigma_x |{+z}\\rangle = ${texMat(SIGMA_X)}${col(KET['+z'])} = ${col(out)} = |{-z}\\rangle`, 'The 1 in the top slot moves to the bottom slot: up becomes down, and 0 becomes 1.', { top: out[0].re, bottom: out[1].re })
    },
    here: (k) => (k.m === 'gate' ? ['Here X is the NOT gate acting on one qubit.'] : ['Here: the spin matrix along x.']),
    taught: { sl448: 'l4-matrices', qc709: 'q3-spin-operators' },
  },
  {
    id: 'pauli-y',
    tex: '\\sigma_y',
    name: 'Pauli Y (spin along y)',
    say: 'sigma y, or the Y gate',
    ground: 'Y flips the two basis states and also puts in a factor of i or −i. As a table it is 0, −i on top and i, 0 below.',
    formal: '$\\sigma_y = Y = \\begin{pmatrix}0&-i\\\\i&0\\end{pmatrix} = iXZ$. It is Hermitian and unitary with $Y^2 = I$; as a gate it flips the bit and adds a quarter-turn of phase. Its eigenstates are $|{\\pm y}\\rangle$.',
    physics: '$\\sigma_y$ is the spin component along y, in units of $\\hbar/2$. It is the only Pauli matrix with complex entries, which is why spin states need complex numbers.',
    example: () => {
      const out = apply(SIGMA_Y, KET['+z'])
      return ex(`\\sigma_y |{+z}\\rangle = ${texMat(SIGMA_Y)}${col(KET['+z'])} = ${col(out)} = i\\,|{-z}\\rangle`, 'Up becomes down, times i. A pure factor of i changes no chance, so the physical state is the same as for $\\sigma_x$.', { topIm: out[0].im, bottomIm: out[1].im })
    },
    here: (k) => (k.m === 'gate' ? ['Here Y is the Y gate acting on one qubit.'] : ['Here: the spin matrix along y.']),
    taught: { sl448: 'l4-matrices', qc709: 'q3-spin-operators' },
  },
  {
    id: 'pauli-z',
    tex: '\\sigma_z',
    name: 'Pauli Z (phase flip, spin along z)',
    say: 'sigma z, or the Z gate',
    ground: 'Z leaves $|{+z}\\rangle$ alone and turns $|{-z}\\rangle$ into minus itself. As a table it is 1 and −1 down the diagonal.',
    formal: '$\\sigma_z = Z = \\mathrm{diag}(1, -1)$ has the z-basis states as eigenvectors with eigenvalues +1 and −1. As a gate it flips the sign of $|1\\rangle$, a phase flip, and $Z^2 = I$.',
    physics: '$\\sigma_z$ is the spin component along z, in units of $\\hbar/2$: the reading is +1 for up and −1 for down.',
    example: () => {
      const out = apply(SIGMA_Z, KET['-z'])
      return ex(`\\sigma_z |{-z}\\rangle = ${texMat(SIGMA_Z)}${col(KET['-z'])} = ${col(out)} = -|{-z}\\rangle`, 'The state is multiplied by −1. A global sign changes no chance, but the sign between two parts of a state does.', { top: out[0].re, bottom: out[1].re })
    },
    here: (k) => (k.m === 'gate' ? ['Here Z is the Z gate acting on one qubit.'] : ['Here: the spin matrix along z.']),
    taught: { sl448: 'l4-matrices', qc709: 'q3-spin-operators' },
  },
  {
    id: 'hadamard',
    tex: 'H',
    name: 'Hadamard gate',
    say: 'H, the Hadamard gate',
    ground: 'H turns $|0\\rangle$ into an equal mix of $|0\\rangle$ and $|1\\rangle$. Applied twice, it undoes itself.',
    formal: '$H = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}$ swaps the z-basis and the x-basis: $H|0\\rangle = |+\\rangle$ and $H|1\\rangle = |-\\rangle$. It is Hermitian and unitary, so $H^2 = I$.',
    physics: 'Most quantum algorithms start by applying H to every qubit, which spreads the register over all its possible values at once.',
    example: () => {
      const out = apply(H, ket('0'))
      return ex(`H|0\\rangle = ${col(out)} = |{+x}\\rangle`, 'The two entries are equal, each 1/√2. Squared, each is ½: a 50-50 state.', { top: out[0].re, bottom: out[1].re, again: apply(H, out)[0].re })
    },
    here: () => ['Here H is the Hadamard gate acting on one qubit.'],
    taught: { qc709: 'q4-one-qubit-gates' },
  },
  {
    id: 'cnot',
    tex: '\\mathrm{CNOT}',
    name: 'CNOT (controlled NOT)',
    say: 'C-NOT, controlled not',
    ground: 'CNOT acts on two qubits. It flips the second one, the target, exactly when the first one, the control, is 1.',
    formal: '$\\mathrm{CNOT} = |0\\rangle\\langle 0| \\otimes I + |1\\rangle\\langle 1| \\otimes X$ applies X to the target when the control is $|1\\rangle$. On basis states, $\\mathrm{CNOT}|a, b\\rangle = |a, a \\oplus b\\rangle$.',
    physics: 'CNOT with a Hadamard makes entangled pairs, and it is the standard way two qubits are made to interact.',
    example: () => {
      const out = apply(cnot(), ket('10'))
      return ex(`\\mathrm{CNOT}\\,|10\\rangle = |${out.findIndex((z) => z.re === 1).toString(2).padStart(2, '0')}\\rangle`, 'The control is 1, so the target 0 is flipped: 10 becomes 11.', { outIndex: out.findIndex((z) => z.re === 1) })
    },
    taught: { qc709: 'q4-cnot' },
  },
  {
    id: 'cz',
    tex: '\\mathrm{CZ}',
    name: 'CZ (controlled Z)',
    say: 'C-Z, controlled Z',
    ground: 'CZ acts on two qubits. It changes the sign of the state $|11\\rangle$ and leaves the other three alone.',
    formal: '$\\mathrm{CZ} = \\mathrm{diag}(1, 1, 1, -1)$ multiplies $|11\\rangle$ by −1. It is symmetric in its two qubits and equals $(I \\otimes H)\\,\\mathrm{CNOT}\\,(I \\otimes H)$.',
    physics: 'CZ is the other common two-qubit gate: a sign that depends on both qubits at once, with no flip.',
    example: () => {
      const out = apply(cz(), ket('11'))
      return ex(`\\mathrm{CZ}\\,|11\\rangle = -|11\\rangle`, 'Only when both qubits are 1 does the sign flip.', { amplitude: out[3].re })
    },
    taught: { qc709: 'q4-circuits' },
  },
  {
    id: 'swap',
    tex: '\\mathrm{SWAP}',
    name: 'SWAP',
    say: 'swap',
    ground: 'SWAP exchanges the states of two qubits: what was in the first is now in the second.',
    formal: '$\\mathrm{SWAP}|a, b\\rangle = |b, a\\rangle$ on basis states, extended linearly. It is Hermitian, unitary and symmetric, and three CNOTs make one.',
    physics: 'Moving a quantum state from one qubit to another is a SWAP.',
    example: () => {
      const out = apply(swap(), ket('01'))
      return ex(`\\mathrm{SWAP}\\,|01\\rangle = |${out.findIndex((z) => z.re === 1).toString(2).padStart(2, '0')}\\rangle`, 'The 0 and the 1 trade places: 01 becomes 10.', { outIndex: out.findIndex((z) => z.re === 1) })
    },
    taught: { qc709: 'q4-circuits' },
  },

  // ---- numbers, sets, phases -------------------------------------------------------------------------------------------------
  {
    id: 'element',
    tex: '\\in',
    name: 'Is an element of',
    say: 'is in, or belongs to',
    ground: 'x ∈ S reads "x is in S": x is one of the members of the collection S. A slash through it, ∉, means "is not in".',
    formal: 'x ∈ S says that x is an element of the set S; x ∉ S says it is not. S ⊂ T says every element of S is in T.',
    physics: 'The readings a measurement can give form a set, such as $S_z \\in \\{+\\hbar/2, -\\hbar/2\\}$. A state of a qubit is a vector in $\\mathbb{C}^2$.',
    example: () => {
      const set = [1, 3, 5]
      const inn = set.includes(3)
      const out = set.includes(4)
      return ex('3 \\in \\{1, 3, 5\\} \\text{ is true;}\\quad 4 \\in \\{1, 3, 5\\} \\text{ is false}', 'The set holds 1, 3 and 5. The number 3 is one of them and 4 is not.', { three: inn ? 1 : 0, four: out ? 1 : 0 })
    },
    taught: { sl448: 'l1-quantized', qc709: 'f2-vectors' },
  },
  {
    id: 'complex-n',
    tex: '\\mathbb{C}^n',
    name: 'Complex numbers, and lists of n of them',
    say: 'C n, the complex n-space',
    ground: 'ℂ is the complex numbers. ℂⁿ is the collection of all lists of n complex numbers. A qubit state lives in ℂ², a list of two.',
    formal: 'ℂⁿ is the vector space of n-tuples of complex numbers with componentwise addition and scaling. It has dimension n over ℂ, and the state space of a qubit is ℂ².',
    physics: 'n qubits need ℂ to the power 2ⁿ: 2ⁿ complex numbers. That growth is why many qubits are hard to simulate.',
    example: () => {
      const v = vec(1, I)
      const n = 3
      return ex(`(1, i) \\in \\mathbb{C}^2;\\quad \\mathbb{C}^{2^{${n}}} \\text{ lists } ${2 ** n} \\text{ numbers}`, 'A pair of complex numbers is one point of ℂ². Three qubits need 2³ = 8 complex numbers.', { dimension: v.length, threeQubits: 2 ** n })
    },
    here: (k) => (k.of ? (isNum(k.of) ? ['Here: lists of ', cx(k.of), ' complex numbers.'] : ['Here: lists of ', cx(k.of), ' complex numbers (the exponent counts how many).']) : ['Here: single complex numbers.']),
    taught: { qc709: 'f2-vectors' },
  },
  {
    id: 'real-n',
    tex: '\\mathbb{R}^n',
    name: 'Real numbers, and lists of n of them',
    say: 'R n, the real n-space',
    ground: 'ℝ is the real numbers. ℝⁿ is the collection of all lists of n real numbers, like the points of a plane (ℝ²) or of space (ℝ³).',
    formal: 'ℝⁿ is the vector space of n-tuples of real numbers. ℝ² and ℝ³ are the plane and space with coordinates; the Bloch vector of a qubit lives in ℝ³.',
    physics: 'A spin direction is a point of ℝ³. Real-number states are enough for some questions, but spin along y needs the complex numbers.',
    example: () => {
      const v = vec(1, 2, 2)
      return ex(`(1, 2, 2) \\in \\mathbb{R}^3,\\quad \\text{length } ${texNum(norm(v))}`, 'A list of three real numbers is one point of space. Its length is √(1 + 4 + 4) = 3.', { dimension: v.length, length: norm(v) })
    },
    here: (k) => (k.of ? ['Here: lists of ', cx(k.of), ' real numbers.'] : ['Here: single real numbers.']),
    taught: { qc709: 'f2-vectors' },
  },
  {
    id: 'phase',
    tex: 'e^{i\\varphi}',
    name: 'Phase factor',
    say: 'e to the i phi',
    ground: '$e^{i\\varphi}$ is a point on the circle of radius 1, found by turning $\\varphi$ radians from the number 1. It changes direction but not size.',
    formal: '$e^{i\\varphi} = \\cos\\varphi + i\\sin\\varphi$ is the unit complex number at angle $\\varphi$. Multiplying by it rotates by $\\varphi$ and leaves the modulus unchanged.',
    physics: 'A phase factor changes the direction of an amplitude but no chance of its own. The phase between two parts of a state does change outcomes.',
    example: () => {
      const q = expi(Math.PI / 2)
      const h = expi(Math.PI)
      return ex(`e^{i\\pi/2} = ${texC(q)},\\quad e^{i\\pi} = ${texC(h)}`, 'A quarter turn from 1 lands on i; a half turn lands on −1. Both are still at distance 1 from 0.', { quarterRe: q.re, quarterIm: q.im, halfRe: h.re, size: abs(q) })
    },
    here: (k) => {
      const p = phaseOf(k.of)
      if (!p) return null
      return p.angle ? ['Here: a turn by ', cx(p.angle), p.back ? ' the other way (clockwise) from 1.' : ' from 1 (counter-clockwise).'] : null
    },
    taught: { sl448: 'l2-complex', qc709: 'f1-euler' },
  },
  {
    id: 'congruent',
    tex: '\\cong',
    name: 'The same as (up to phase, or relabelling)',
    say: 'is the same as, or is equivalent to',
    ground: '≅ means "the same, as far as it matters". For states, two kets are ≅ when they differ only by an overall phase factor, so every prediction agrees.',
    formal: 'A ≅ B asserts equivalence in the relevant sense: for kets, equality up to a global phase (the same ray); for spaces, an identification that keeps the structure, such as S² ≅ the rays of ℂ².',
    physics: 'A global phase cannot be seen: $|\\psi\\rangle$ and $e^{i\\theta}|\\psi\\rangle$ are the same physical state, and give the same chance for every outcome.',
    example: () => {
      const a = KET['+x']
      const b = a.map((z) => mul(z, I))
      return ex(`i\\,|{+x}\\rangle \\cong |{+x}\\rangle: \\; P(+z) = ${texNum(prob(KET['+z'], a))} \\text{ for both}`, 'Multiplying a state by i only turns it a quarter turn as a whole. Both give the chance ½ for "up along z".', { same: samePhysicalState(a, b) ? 1 : 0, chanceA: prob(KET['+z'], a), chanceB: prob(KET['+z'], b) })
    },
    taught: { sl448: 'l11-two-level', qc709: 'q3-bloch' },
  },

  // ---- relations and arrows ---------------------------------------------------------------------------------------------------
  {
    id: 'approx',
    tex: '\\approx',
    name: 'Approximately equal',
    say: 'is approximately',
    ground: '≈ means "close to, but not exactly equal". It is used when a number has been rounded.',
    formal: 'x ≈ y means x equals y up to a small error, here usually from rounding to a stated number of digits.',
    physics: 'Decimal values of quantum quantities are almost always rounded: the amplitude 1/√2 is about 0.707.',
    example: () => ex(`\\tfrac{1}{\\sqrt2} \\approx ${Math.SQRT1_2.toFixed(4)}`, 'The exact value has endless digits; four of them are kept here.', { value: Number(Math.SQRT1_2.toFixed(4)) }),
    taught: {},
  },
  {
    id: 'proportional',
    tex: '\\propto',
    name: 'Proportional to',
    say: 'is proportional to',
    ground: 'a ∝ b means a is a fixed multiple of b: double b and a doubles too.',
    formal: 'a ∝ b means a = k b for a constant k that does not depend on the variables under study; the constant is often fixed afterwards by normalization.',
    physics: 'A chance is proportional to the squared size of an amplitude, P ∝ |c|². The constant is fixed because all the chances add up to 1.',
    example: () => {
      const small = abs2(c(0.3))
      const big = abs2(c(0.6))
      return ex(`P \\propto |c|^2:\\; c = 0.3 \\to ${texNum(small)},\\quad c = 0.6 \\to ${texNum(big)}`, 'Doubling the amplitude from 0.3 to 0.6 multiplies the chance by 4, because the chance goes with the square.', { ratio: big / small })
    },
    taught: {},
  },
  {
    id: 'arrow',
    tex: '\\to',
    name: 'Arrow (goes to, becomes)',
    say: 'goes to, or becomes',
    ground: 'An arrow points from the start to the end: A → B reads "A goes to B" or "A turns into B".',
    formal: 'A → B marks a map or a process from A to B, or a limit (x → 0). For states, M: $|a\\rangle$ → $|b\\rangle$ says that M sends $|a\\rangle$ to $|b\\rangle$.',
    physics: 'Gates and measurements are maps of states: $\\sigma_x$ sends $|{+z}\\rangle$ to $|{-z}\\rangle$.',
    example: () => {
      const out = apply(SIGMA_X, KET['+z'])
      return ex(`|{+z}\\rangle \\xrightarrow{\\;\\sigma_x\\;} |{-z}\\rangle`, 'Acting with $\\sigma_x$ on the state "up along z" produces the state "down along z".', { top: out[0].re, bottom: out[1].re })
    },
    taught: { qc709: 'f3-linear-maps' },
  },
  {
    id: 'mapsto',
    tex: '\\mapsto',
    name: 'Maps to',
    say: 'maps to',
    ground: 'x ↦ y says what happens to one input x: it is sent to y. The little tail on the arrow marks a single example.',
    formal: '↦ states the rule of a map element by element, x ↦ f(x). It differs from →, which names the source and target of the whole map.',
    physics: 'A gate is described by what it does to each basis state: $|0\\rangle$ ↦ $|1\\rangle$ and $|1\\rangle$ ↦ $|0\\rangle$ for the NOT gate.',
    example: () => {
      const f = (x: number) => x * x
      return ex(`x \\mapsto x^2:\\quad 3 \\mapsto ${f(3)}`, 'The rule squares its input, so the input 3 is sent to 9.', { out: f(3) })
    },
    taught: { qc709: 'f3-linear-maps' },
  },
  {
    id: 'implies',
    tex: '\\Rightarrow',
    name: 'Implies',
    say: 'implies, or so',
    ground: 'p ⇒ q reads "if p is true, then q is true". The arrow points from the reason to the result.',
    formal: 'p ⇒ q is logical implication: whenever p holds, q holds. It does not claim the reverse; for that, see ⇔.',
    physics: 'Many steps in a derivation are implications: a state is normalized ⇒ its chances add up to 1.',
    example: () => {
      const v = vec(0.6, 0.8)
      return ex(`\\|(0.6, 0.8)\\| = 1 \\;\\Rightarrow\\; 0.6^2 + 0.8^2 = ${texNum(norm2(v))}`, 'A state of length 1 has chances 0.36 and 0.64, and they add up to 1.', { total: norm2(v) })
    },
    taught: {},
  },
  {
    id: 'iff',
    tex: '\\Leftrightarrow',
    name: 'If and only if',
    say: 'if and only if',
    ground: 'p ⇔ q means each one implies the other: p holds exactly when q holds.',
    formal: 'p ⇔ q (also written "iff") asserts both p ⇒ q and q ⇒ p: the two statements are equivalent.',
    physics: 'Two states can be perfectly told apart if and only if they are orthogonal: $\\langle a|b\\rangle$ = 0.',
    example: () => {
      const orth = inner(KET['+z'], KET['-z'])
      const other = inner(KET['+z'], KET['+x'])
      return ex(`\\text{orthogonal} \\Leftrightarrow \\langle a|b\\rangle = 0:\\; \\langle{+z}|{-z}\\rangle = ${texNum(orth.re)},\\; \\langle{+z}|{+x}\\rangle = ${texNum(other.re)}`, 'Up and down along z have overlap 0 and are orthogonal. Up along z and up along x have overlap 0.707 and are not.', { orthogonal: abs(orth), notOrthogonal: abs(other) })
    },
    taught: {},
  },
  {
    id: 'plusminus',
    tex: '\\pm',
    name: 'Plus or minus',
    say: 'plus or minus',
    ground: '± stands for two cases at once, one with + and one with −. The label $|{\\pm z}\\rangle$ means both $|{+z}\\rangle$ and $|{-z}\\rangle$.',
    formal: '± abbreviates two statements or values, one with each sign. In the label $|\\pm\\hat n\\rangle$ the sign names the two outcomes along $\\hat n$.',
    physics: 'A spin measurement has two outcomes, + and −, along whatever direction the magnet points.',
    example: () => {
      const plus = prob(KET['+x'], KET['+z'])
      const minus = prob(KET['-x'], KET['+z'])
      return ex(`P(\\pm x \\mid {+z}) = ${texNum(plus)} \\text{ and } ${texNum(minus)}`, 'Starting from "up along z", measuring along x gives + or − with chance ½ each.', { plus, minus })
    },
    taught: {},
  },
  {
    id: 'cdot',
    tex: '\\cdot',
    name: 'Dot (times, or dot product)',
    say: 'times, or dot',
    ground: 'A dot between numbers means multiply. Between two vectors it means the dot product: multiply matching entries and add the results.',
    formal: '$a\\cdot b$ is multiplication of scalars, or the dot product $\\sum_i a_ib_i$ of real vectors, which equals $|a||b|\\cos\\theta$. For complex vectors the inner product $\\langle a|b\\rangle$ conjugates the first one.',
    physics: 'The dot product of two directions is the cosine of the angle between them; $\\hat n\\cdot\\vec\\sigma$ uses it to build the spin matrix along $\\hat n$.',
    example: () => {
      const a: [number, number, number] = [1, 2, 2]
      const b: [number, number, number] = [2, 0, 1]
      return ex('(1, 2, 2)\\cdot(2, 0, 1) = 1\\cdot 2 + 2\\cdot 0 + 2\\cdot 1 = ' + dot(a, b), 'Multiply matching entries, 2, 0 and 2, then add them: 4.', { dot: dot(a, b) })
    },
    taught: {},
  },

  // ---- calculus, functions ------------------------------------------------------------------------------------------------
  {
    id: 'derivative',
    tex: '\\frac{d}{dt}',
    name: 'Rate of change (d over dt)',
    say: 'd by d t',
    ground: 'd/dt means "the rate of change with respect to t": how fast something changes as t goes up.',
    formal: 'd/dt is the derivative with respect to t. For a state $|\\psi(t)\\rangle$, $d|\\psi\\rangle$/dt is its instantaneous rate of change, which the Schrödinger equation sets.',
    physics: 'Quantum motion is a rate of change: iħ $d|\\psi\\rangle$/dt = $H|\\psi\\rangle$ says the Hamiltonian H tells the state how to turn.',
    example: () => {
      const f = (t: number) => t ** 3
      const s = slope(f, 2)
      return ex(`\\frac{d}{dt}\\,t^3 \\Big|_{t=2} = 3\\cdot 2^2 = ${texNum(Math.round(s))}`, 'At t = 2 the curve t³ is climbing at 12 units for every unit of t.', { slope: Math.round(s) })
    },
    here: (k) => (k.of ? ['Here: how fast things change with ', cx(k.of), '.'] : null),
    taught: { sl448: 'l11-schrodinger' },
  },
  {
    id: 'partial',
    tex: '\\partial',
    name: 'Partial derivative (curly d)',
    say: 'partial, or del',
    ground: '∂ is a curly d. ∂f/∂t is how fast f changes with t while everything else is held still.',
    formal: '∂f/∂t is the partial derivative: the rate of change of f with respect to t with all the other variables held fixed.',
    physics: 'A field that depends on position and time, like the magnet’s, changes in space by ∂/∂z and in time by ∂/∂t.',
    example: () => {
      const f = (x: number, t: number) => x * t * t
      const s = slope((t) => f(2, t), 3)
      return ex(`f = x\\,t^2 \\Rightarrow \\frac{\\partial f}{\\partial t} = 2xt = ${texNum(Math.round(s))}\\ \\text{at } x = 2,\\ t = 3`, 'Keep x fixed at 2 and vary only t: the rate is 2 · 2 · 3 = 12.', { slope: Math.round(s) })
    },
    here: (k) => (k.of ? ['Here: the change with ', cx(k.of), ' with the other variables held still.'] : null),
    taught: {},
  },
  {
    id: 'sqrt',
    tex: '\\sqrt{x}',
    name: 'Square root',
    say: 'the square root of',
    ground: '√x is the number that gives x when multiplied by itself.',
    formal: '√x is the non-negative number whose square is x. Amplitudes like 1/√2 appear because chances of ½ and ½ must add to 1.',
    physics: 'An equal share of a state has amplitude 1/√2: squaring it gives the chance ½.',
    example: () => {
      const r = Math.sqrt(2)
      return ex(`\\sqrt{2} \\approx ${r.toFixed(3)},\\quad \\left(\\tfrac{1}{\\sqrt2}\\right)^2 = ${texNum(Math.SQRT1_2 ** 2)}`, 'The square root of 2 is about 1.414. Its reciprocal squared is exactly ½.', { root: r, half: Math.SQRT1_2 ** 2 })
    },
    here: (k) => (isNum(k.of) ? ['Here: the number whose square is ', cx(k.of), `, about ${Number(Math.sqrt(Number(k.of)).toFixed(3))}.`] : k.of ? ['Here: the square root of ', cx(k.of), '.'] : null),
    taught: {},
  },
  {
    id: 're',
    tex: '\\mathrm{Re}',
    name: 'Real part',
    say: 'the real part of',
    ground: 'Re z is the real part of a complex number: for 3 + 4i it is 3, the part with no i.',
    formal: '$\\mathrm{Re}\\,z = (z + z^*)/2$ is the real part of $z = a + bi$, namely $a$. For an overlap $\\langle a|b\\rangle$, Re and Im together fix both its size and its phase.',
    physics: 'Averages of observables are real. Real parts of overlaps appear in how fast a state’s chance changes.',
    example: () => ex(`\\mathrm{Re}(${texC(c(3, 4))}) = ${texNum(c(3, 4).re)}`, 'The real part is the 3; the 4 belongs to the imaginary part.', { re: c(3, 4).re }),
    here: (k) => (k.of ? ['Here: the real part of ', cx(k.of), '.'] : null),
    taught: { sl448: 'l2-complex', qc709: 'f1-plane' },
  },
  {
    id: 'im',
    tex: '\\mathrm{Im}',
    name: 'Imaginary part',
    say: 'the imaginary part of',
    ground: 'Im z is the imaginary part of a complex number: for 3 + 4i it is 4, the number that multiplies i.',
    formal: '$\\mathrm{Im}\\,z = (z - z^*)/(2i)$ is the imaginary part of $z = a + bi$, namely $b$, which is a real number. It is the height of z in the complex plane.',
    physics: 'The sign of the imaginary part of an overlap tells which way a phase has turned.',
    example: () => ex(`\\mathrm{Im}(${texC(c(3, 4))}) = ${texNum(c(3, 4).im)}`, 'The imaginary part is the 4, not 4i: it is an ordinary real number.', { im: c(3, 4).im }),
    here: (k) => (k.of ? ['Here: the imaginary part of ', cx(k.of), '.'] : null),
    taught: { sl448: 'l2-complex', qc709: 'f1-plane' },
  },
  {
    id: 'mod',
    tex: '\\bmod',
    name: 'Modulo (remainder)',
    say: 'mod, or the remainder after dividing by',
    ground: 'a mod N is the remainder when a is divided by N. It wraps any number back into the range 0 to N − 1, like the hours on a clock.',
    formal: 'a mod N is the remainder of a after division by N, in {0, …, N−1}; a ≡ b (mod N) means N divides a − b. Sums and products respect it, and mod 2 is XOR.',
    physics: 'Periodic patterns, such as the rhythm a quantum computer looks for, are written with modular arithmetic.',
    example: () => {
      const r = ((17 % 12) + 12) % 12
      return ex(`17 \\bmod 12 = ${r}`, 'Twelve fits into 17 once, with 5 left over: 17 o’clock on a 12-hour clock is 5.', { remainder: r })
    },
    taught: {},
  },
  {
    id: 'gcd',
    tex: '\\gcd',
    name: 'Greatest common divisor',
    say: 'the greatest common divisor of',
    ground: 'gcd(a, b) is the biggest whole number that divides both a and b with nothing left over.',
    formal: 'gcd(a, b) is the largest integer dividing both a and b. Euclid’s algorithm finds it by repeating gcd(a, b) = gcd(b, a mod b) until the remainder is 0.',
    physics: 'The classical last step of a factoring method takes a gcd of a number with a number found by the quantum part.',
    example: () => {
      const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b))
      return ex(`\\gcd(84, 36) = ${g(84, 36)}`, 'Euclid’s steps: 84 = 2·36 + 12, then 36 = 3·12 + 0. The last nonzero remainder is 12.', { gcd: g(84, 36) })
    },
    here: (k) => (k.of ? ['Here: the biggest common divisor of ', cx(k.of), '.'] : null),
    taught: {},
  },
  {
    id: 'floor',
    tex: '\\lfloor x\\rfloor',
    name: 'Floor (round down)',
    say: 'the floor of',
    ground: '⌊x⌋ rounds x down to the nearest whole number at or below it.',
    formal: '⌊x⌋ is the largest integer not exceeding x. For negative x it rounds away from zero: ⌊−1.2⌋ = −2.',
    physics: 'Whole-number steps, such as how many full turns fit into an angle, are counted with the floor.',
    example: () => ex(`\\lfloor 3.7 \\rfloor = ${Math.floor(3.7)},\\quad \\lfloor -1.2 \\rfloor = ${Math.floor(-1.2)}`, 'Down from 3.7 is 3. Down from −1.2 is −2, which is further from zero.', { up: Math.floor(3.7), negative: Math.floor(-1.2) }),
    here: (k) => (k.of ? ['Here: ', cx(k.of), ' rounded down to a whole number.'] : null),
    taught: {},
  },
  {
    id: 'log2',
    tex: '\\log_2',
    name: 'Logarithm base 2',
    say: 'log base 2 of',
    ground: 'log₂ x asks: how many times must I double 1 to reach x? For example log₂ 8 = 3. It counts bits.',
    formal: '$\\log_2 x$ is the exponent $y$ with $2^y = x$. It measures information in bits: a choice among $N$ equally likely options carries $\\log_2 N$ bits.',
    physics: 'Entropy and information are counted in bits with log₂, and n qubits label 2ⁿ outcomes, since log₂ 2ⁿ = n.',
    example: () => {
      const bits = Math.log2(8)
      const coin = binaryEntropy(0.5)
      return ex(`\\log_2 8 = ${bits},\\quad -\\tfrac12\\log_2\\tfrac12 - \\tfrac12\\log_2\\tfrac12 = ${texNum(coin)}`, 'Doubling 1 three times gives 8. A fair coin carries exactly one bit.', { log8: bits, coin })
    },
    taught: { qc709: 'f5-surprise' },
  },
  {
    id: 'hbar',
    tex: '\\hbar',
    name: 'h-bar (reduced Planck constant)',
    say: 'h bar',
    ground: 'ħ is a tiny constant of nature that sets the scale of quantum effects. Spin values come in steps of ħ/2.',
    formal: 'ħ = h/2π ≈ 1.055 × 10⁻³⁴ J·s is the reduced Planck constant: the unit of angular momentum and the link E = ħω between energy and frequency.',
    physics: 'A spin component is always +ħ/2 or −ħ/2. This course’s engine sets ħ = 1 and the screen adds the ħ back.',
    example: () => {
      const e = eigenHermitian2(SZ)
      return ex(`S_z = \\tfrac{\\hbar}{2}\\sigma_z:\\quad \\text{readings } ${texNum(e.values[0])}\\hbar \\text{ and } ${texNum(e.values[1])}\\hbar`, 'In units of ħ the two readings are +½ and −½.', { up: e.values[0], down: e.values[1] })
    },
    taught: { sl448: 'l1-quantized' },
  },
]
