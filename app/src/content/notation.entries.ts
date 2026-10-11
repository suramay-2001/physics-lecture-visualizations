/**
 * The notation dictionary's entries (see content/notationKit.ts for what an entry is). Every example's numbers are
 * computed by the engine when the card opens, never typed in; content/notation.test.ts checks each against its hand
 * value. Wording is the course's own: plain sentences, Ground-up ≤ 25 words, Formal ≤ 40, `$…$` for maths.
 *
 * `taught` points at the unit that teaches the notation (checked to exist). Notation no built chapter teaches has no
 * link: ≈, ∝, ⇒, ⇔, ±, ·, √, ∂ are school maths. mod, gcd and ⌊ ⌋ are taught in chapter F8 ("Hidden rhythms"): mod in
 * `f8-clock`, gcd in `f8-euclid`, and the floor (the whole part of a binary fraction, the quotients of a continued fraction)
 * in `f8-fractions`.
 */
import { c, abs, abs2, conj, expi, I, mul } from '../physics/complex'
import { apply, commutator, det2, diag2, dagger, identity, inner, mat, norm, norm2, outer, trace2, vconj, vec, type Mat, type Vec } from '../physics/linalg'
import { binaryEntropy } from '../physics/qc/info'
import { rankN } from '../physics/qc/cmat'
import { densityOf, partialTrace, purityN } from '../physics/qc/density'
import { cnot, cz, H, swap } from '../physics/qc/gates'
import { euclidSteps, gcd } from '../physics/qc/numtheory'
import { bell, kron, kronAll, ket } from '../physics/qc/state'
import { AXIS, dot, eigenHermitian2, expectation, KET, nDotSigma, prob, rotation, samePhysicalState, SIGMA_X, SIGMA_Y, SIGMA_Z, SZ, tiltXZ, unit, type NamedKet } from '../physics/spin'
import { texC, texCol, texMat, texNum, texRow } from '../ui/texfmt'
import { cx, parseLimits, tx, type Example, type NotationEntry, type Seg } from './notationKit'

const clean = (s?: string) => (s ?? '').replace(/[{}\s]/g, '')
const isNum = (s?: string) => !!s && /^\d+(\.\d+)?$/.test(s.trim())
const same = (a?: string, b?: string) => !!a && clean(a) === clean(b)
/** The number a unit-vector column or row prints as. */
const col = texCol
/** A central-difference slope: the engine of the d/dt and ∂ examples (no calculus library needed). */
const slope = (f: (x: number) => number, x: number, h = 1e-4) => (f(x + h) - f(x - h)) / (2 * h)
/**
 * A number in prose, written from a computed value (`5`, `0.707`, `25`). It is wrapped in invisible marks so `ex` can
 * check that the caption holds no digit that was typed by hand, and that each marked number equals a value in `values`.
 */
const MARK = '⁣'
const fmt = (x: number, digits = 3): string => {
  const r = Math.round(x * 10 ** digits) / 10 ** digits
  return (Object.is(r, -0) ? '0' : String(r)).replace('-', '−')
}
/** A number (or a bit string) written into a caption from a computed value. */
const N = (x: number | string, digits = 3): string => `${MARK}${typeof x === 'string' ? x : fmt(x, digits)}${MARK}`
/** Any digit: ASCII, superscript, subscript, vulgar fractions. */
const DIGITS = /[0-9²³¹⁰⁴-⁹₀-₉½¼¾]+/g
const MARKED = new RegExp(`${MARK}([^${MARK}]*)${MARK}`, 'g')
/**
 * An example. The caption's numbers must come through `N`: the digits `ex` finds outside the marks are reported as `typed`
 * (the digits of a ket, `$|01\rangle$`, name a state and are not numbers). The test (content/notation.numbers.test.ts) asserts
 * `typed` is empty and every `shown` number is one of `values` or `inputs`.
 */
const ex = (tex: string, says: string, values: Example['values'], inputs?: Example['inputs']): Example => {
  const shown: string[] = []
  const rest = says.replace(MARKED, (_m, t: string) => (shown.push(t), ' ')).replace(/\$\|[^$]*\\rangle\$/g, ' ')
  return { tex, says: says.replaceAll(MARK, ''), values, inputs, caption: { shown, typed: rest.match(DIGITS) ?? [] } }
}

/** `|{+x}⟩`, `i|{-z}⟩`: the named ket a result equals up to a phase factor, written with that factor (computed, never typed). */
function ketTex(v: Vec): string {
  for (const key of Object.keys(KET) as NamedKet[]) {
    if (!samePhysicalState(v, KET[key])) continue
    const f = inner(KET[key], v)
    const unit = Math.abs(f.im) < 1e-9 ? (Math.abs(f.re - 1) < 1e-9 ? '' : '-') : `${texC(f)}\\,`
    return `${unit}|{${key}}\\rangle`
  }
  return col(v)
}

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

/**
 * What a whole `⟨ … ⟩` is, from the TeX inside a |…|: an overlap ⟨a|b⟩ has one bar, a matrix element ⟨a|M|b⟩ two, an average
 * ⟨A⟩ none. Anything else that holds a ⟨ is `other`; no ⟨ at all is `none`.
 */
function bracketKind(of: string): { kind: 'overlap' | 'element' | 'average' | 'other' | 'none'; inner: string } {
  const m = /^\s*\\langle([\s\S]*)\\rangle\s*$/.exec(of)
  if (!m) return { kind: /\\langle/.test(of) ? 'other' : 'none', inner: of }
  const bars = (m[1].match(/(?<!\\)\||\\vert(?![A-Za-z])/g) ?? []).length
  return { kind: bars === 0 ? 'average' : bars === 1 ? 'overlap' : bars === 2 ? 'element' : 'other', inner: m[1].trim() }
}
/** A density matrix as written: ρ, ρ_A, \hat\rho, ρ². */
const isRho = (s?: string) => !!s && /^(?:\\hat\s*)?\\(?:rho|varrho)(?:[_^]\{?[\w]+\}?)*$/.test(s.trim())

/** "Here X is the NOT gate acting on one qubit", or, for H^{⊗n}, "applied to each of n qubits". */
const gateHere = (letter: string, what: string, copies?: string): Seg[] =>
  copies ? [`Here ${letter} is the ${what} applied to each of `, cx(copies), ' qubits.'] : [`Here ${letter} is the ${what} acting on one qubit.`]

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
      return ex(
        `\\sum_{i=1}^{${n}} i^2 = ${terms.join(' + ')} = ${total}`,
        `The counter i takes the values ${N(1)} to ${N(n)}, so the parts are ${terms.map((x) => N(x)).join(', ')}. They add up to ${N(total)}.`,
        { n, total, last: terms[n - 1] },
        { first: 1, terms },
      )
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
      return ex(
        `\\prod_{k=1}^{${n}} k = ${factors.join(' \\cdot ')} = ${total}`,
        `The counter k takes ${N(1)} to ${N(n)}. Multiplying ${factors.slice(0, -1).map((x) => N(x)).join(', ')} and ${N(n)} gives ${N(total)}.`,
        { n, total },
        { first: 1, factors },
      )
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
      const at = v.findIndex((z) => z.re === 1)
      return ex(
        `${col(a)} \\otimes ${col(b)} = ${col(v)}`,
        `The first qubit is in $|0\\rangle$ and the second in $|1\\rangle$. The joint list has ${N(a.length)} × ${N(b.length)} = ${N(v.length)} numbers, with a single ${N(v[at].re)} in the place for $|01\\rangle$.`,
        { length: v.length, onePosition: at },
        { factorLength: a.length, amplitude: v[at].re },
      )
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
      const label = '0'.repeat(n)
      return ex(
        `|0\\rangle^{\\otimes ${n}} = |${label}\\rangle: \\; 2^{${n}} = ${v.length} \\text{ numbers}`,
        `Putting ${N(n)} copies of $|0\\rangle$ side by side gives the state $|${label}\\rangle$. Its list has $${N(2)}^{${N(n)}} = ${N(v.length)}$ numbers.`,
        { copies: n, length: v.length, onePosition: v.findIndex((z) => z.re === 1) },
        { base: 2 },
      )
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
      const bits = (x: number) => s(x).split('').map(Number)
      const pairs = bits(a).map((x, k) => `${N(x)}⊕${N(bits(b)[k])} = ${N(bits(r)[k])}`)
      return ex(
        `${s(a)} \\oplus ${s(b)} = ${s(r)}`,
        `Position by position: ${pairs.join(', ')}. The result is ${N(s(r))}.`,
        { result: r, ones: r.toString(2).split('1').length - 1, resultBits: s(r) },
        { a: s(a), b: s(b), zero: 0, one: 1 },
      )
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
    taught: { sl448: 'l3-eigen', qc709: 'f3-adjoint' },
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
      return ex(
        `z = ${texC(z)} \\;\\Rightarrow\\; z^* = ${texC(zc)},\\quad z z^* = ${texNum(zz.re)}`,
        `Only the sign of the i part changes. Multiplying the two gives ${N(zz.re)}, which is the size of z squared.`,
        { re: zc.re, im: zc.im, product: zz.re, size: abs(z) },
        { zRe: z.re, zIm: z.im },
      )
    },
    taught: { sl448: 'l2-complex', qc709: 'f1-plane' },
  },

  // ---- bras, kets and their relatives --------------------------------------------------------------------------------
  {
    id: 'ket',
    tex: '|\\psi\\rangle',
    name: 'Ket',
    say: 'ket psi',
    ground: 'A ket is a quantum state written as a column of numbers. The symbol inside is only its name.',
    formal: 'A ket $|\\psi\\rangle$ is a vector in the space of states; the symbol inside only names it. In a chosen basis it is the column of its amplitudes.',
    physics: 'A ket holds everything a quantum system can be said to be doing. The squared size of an amplitude, $|c|^2$, is the chance of the matching reading.',
    example: () => {
      const v = KET['+x']
      return ex(
        `|{+x}\\rangle = ${col(v)}`,
        `The state "spin up along x" is a column of two numbers, one for each of the two z-states. Their squares add up to ${N(norm2(v))}.`,
        { top: v[0].re, bottom: v[1].re, sumSquares: norm2(v) },
      )
    },
    here: (k, _track, course) => {
      const key = clean(k.a)
      if (key in KET) return ['This ket is the state ', cx(k.a), ': ', SPIN_LABEL[key], ', the column ', tx(col(KET[key as NamedKet])), '.']
      if (key === '0' || key === '1') return course === 'sl448' ? ['This ket is the state labelled ', cx(k.a), '.'] : ['This ket is the qubit state for the bit ', cx(k.a), '.']
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
      return ex(
        `|{+y}\\rangle = ${col(v)} \\;\\Rightarrow\\; \\langle{+y}| = ${texRow(b)}`,
        `Lay the column on its side, then flip the sign of every i. Here the second entry goes from $${N(v[1].im)}\\,i$ to $${N(b[1].im)}\\,i$.`,
        { secondIm: b[1].im, firstRe: b[0].re },
        { secondImBefore: v[1].im },
      )
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
      return ex(
        `\\langle{+z}|{+x}\\rangle = ${texNum(o.re)},\\quad |\\langle{+z}|{+x}\\rangle|^2 = ${texNum(p)}`,
        `The overlap of spin-up-along-z with spin-up-along-x is ${N(o.re)}. Squared, it is ${N(p)}: a ${N(p * 100)} % chance of finding "up along z".`,
        { overlap: o.re, chance: p, percent: p * 100 },
      )
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
      const plus = SIGMA_Z[0][0].re
      const minus = SIGMA_Z[1][1].re
      return ex(
        `\\langle{+x}|\\sigma_z|{+x}\\rangle = ${texNum(avg)},\\quad \\langle{+z}|\\sigma_x|{-z}\\rangle = ${texNum(entry.re)}`,
        `$\\sigma_z$ averages to ${N(avg)} in the state "up along x": half the readings are ${N(plus)} and half are ${N(minus)}. $\\sigma_x$ turns $|{-z}\\rangle$ into $|{+z}\\rangle$, so that entry is ${N(entry.re)}.`,
        { average: avg, entry: entry.re },
        { plusReading: plus, minusReading: minus },
      )
    },
    here: (k, track) => {
      if (!k.m) return null
      // ⟨b|_B ρ |b⟩_B : the bra carries a subscript, so this sandwiches only one PART of the system (the rest stays)
      if (k.lo) return ['This sandwiches ', cx(k.m), ' between the state ', cx(k.b), ' of the part ', cx(k.lo), ' only. What is left is an operator on the other part, not one number.']
      if (same(k.a, k.b)) {
        if (isRho(k.m)) return ['The chance of finding the state ', cx(k.b), ' when the system is in the mixed state ', cx(k.m), '.']
        return ['The average of ', cx(k.m), ' in the state ', cx(k.b), '.']
      }
      if (!k.a || !k.b) return null
      return track === 'formal'
        ? ['The (', cx(k.a), ', ', cx(k.b), ') matrix element of ', cx(k.m), '.']
        : ['How much ', cx(k.m), ' turns the state ', cx(k.b), ' into the state ', cx(k.a), '.']
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
      return ex(
        `\\langle\\sigma_z\\rangle = (+1)\\cdot ${texNum(up)} + (-1)\\cdot ${texNum(down)} = ${texNum(avg)}`,
        `In this state the reading ${N(1)} has chance ${N(up * 100)} % and ${N(-1)} has ${N(down * 100)} %. Weighting each reading by its chance gives an average of ${N(avg)}.`,
        { up, down, average: avg, upPercent: up * 100, downPercent: down * 100 },
        { plusReading: 1, minusReading: -1 },
      )
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
      return ex(
        `|{+z}\\rangle\\langle{+z}| = ${texMat(P)}`,
        `The column (${N(KET['+z'][0].re)}, ${N(KET['+z'][1].re)}) times its own row is a ${N(P.length)} × ${N(P.length)} table with a single ${N(P[0][0].re)}. It keeps the "up along z" part of a state and drops the rest.`,
        { p00: P[0][0].re, p11: P[1][1].re, trace: trace2(P).re },
        { size: P.length, zero: 0 },
      )
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
      return ex(
        `\\|(${v[0].re}, ${v[1].re})\\| = \\sqrt{${v[0].re}^2 + ${v[1].re}^2} = ${texNum(n)}`,
        `The arrow from the origin to (${N(v[0].re)}, ${N(v[1].re)}) is the hypotenuse of a right triangle with sides ${N(v[0].re)} and ${N(v[1].re)}, so its length is ${N(n)}.`,
        { length: n },
        { x: v[0].re, y: v[1].re },
      )
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
      return ex(
        `|${texC(z)}| = \\sqrt{${z.re}^2 + ${z.im}^2} = ${texNum(abs(z))}`,
        `The number $${N(z.re)} + ${N(z.im)}i$ sits ${N(z.re)} across and ${N(z.im)} up, so its distance from ${N(0)} is ${N(abs(z))}.`,
        { size: abs(z) },
        { re: z.re, im: z.im, origin: 0 },
      )
    },
    here: (k) => {
      if (!k.of) return null
      const b = bracketKind(k.of)
      // only ⟨a|b⟩ is an overlap, and only its square is a chance; ⟨A⟩ is an average and ⟨a|M|b⟩ a matrix element
      if (b.kind === 'overlap') return ['The size of an overlap. Squared, it is a chance.']
      if (b.kind === 'element') return ['The size of the matrix element ', cx(k.of), '.']
      if (b.kind === 'average') return ['The size of the average of ', cx(b.inner), '.']
      return ['The size of ', cx(k.of), '.']
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
      return ex(
        `[\\sigma_x, \\sigma_y] = ${texMat(C)} = ${texNum(C[0][0].im)}i\\,\\sigma_z`,
        `Doing $\\sigma_x$ then $\\sigma_y$ is not the same as $\\sigma_y$ then $\\sigma_x$: the difference is $${N(C[0][0].im)}i$ times $\\sigma_z$, which is not zero.`,
        { c00Im: C[0][0].im, c11Im: C[1][1].im, offDiagonal: abs(C[0][1]) },
      )
    },
    here: (k) =>
      k.a && k.b
        ? ['Here: ', cx(k.a), ' times ', cx(k.b), ' minus ', cx(k.b), ' times ', cx(k.a), ' (in ', cx(`${k.a}\\,${k.b}`), ', ', cx(k.b), ' acts first). Zero means the order does not matter.']
        : null,
    taught: { sl448: 'l7-compatible', qc709: 'f3-products' },
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
      const t = trace2(M).re
      return ex(
        `\\mathrm{Tr}${texMat(M)} = ${M[0][0].re} + ${M[1][1].re} = ${texNum(t)}`,
        `Only the ${N(M[0][0].re)} and the ${N(M[1][1].re)} on the diagonal count; the ${N(M[0][1].re)} and the ${N(M[1][0].re)} are ignored.`,
        { trace: t },
        { m00: M[0][0].re, m01: M[0][1].re, m10: M[1][0].re, m11: M[1][1].re },
      )
    },
    here: (k) => (k.of ? ['Here: add the diagonal of ', cx(k.of), '.'] : null),
    taught: { sl448: 'l6-mixture', qc709: 'f4-eigen' },
  },
  {
    id: 'partial-trace',
    tex: '\\mathrm{Tr}_B\\,\\rho',
    name: 'Partial trace (trace out one part)',
    say: 'the trace over B of rho, or trace out B',
    ground: 'Tr with a small label below it means: trace out that part of the system. What is left is the state of the other part, a table of numbers, not a single number.',
    formal: '$\\mathrm{Tr}_B\\,\\rho$ is the partial trace: sum over a basis of the traced-out part, $(\\rho_A)_{ac} = \\sum_b \\rho_{ab,cb}$. The result is an operator on the remaining part, and $\\mathrm{Tr}_B(M\\otimes N) = M\\,\\mathrm{Tr}\\,N$.',
    physics: 'Tracing out B leaves the state of A, which is everything that measurements on A alone can reveal. It is mixed when A and B were entangled.',
    example: () => {
      const rho = densityOf(bell('00+11'))
      const A = partialTrace(rho, [1])
      return ex(
        `\\mathrm{Tr}_B\\,|\\Phi^+\\rangle\\langle\\Phi^+| = ${texMat(A)}`,
        `The two-qubit Bell state gives qubit A no state of its own. Tracing out B leaves ${N(A[0][0].re)} on the diagonal and ${N(abs(A[0][1]))} elsewhere: a qubit with no preferred direction, purity ${N(purityN(A))}.`,
        { d00: A[0][0].re, d11: A[1][1].re, offDiagonal: abs(A[0][1]), purity: purityN(A) },
      )
    },
    here: (k) =>
      k.a
        ? ['Here: trace out the part ', cx(k.a), k.of ? ' of ' : '', ...(k.of ? [cx(k.of)] : []), '. What is left is an operator on the rest of the system, not a single number.']
        : null,
    taught: { qc709: 'q9-partial-trace' },
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
      const main = M[0][0].re * M[1][1].re
      const other = M[0][1].re * M[1][0].re
      const d = det2(M).re
      return ex(
        `\\det${texMat(M)} = ${M[0][0].re}\\cdot ${M[1][1].re} - ${M[0][1].re}\\cdot ${M[1][0].re} = ${texNum(d)}`,
        `Multiply down the main diagonal, ${N(M[0][0].re)} × ${N(M[1][1].re)} = ${N(main)}, and subtract the other diagonal, ${N(M[0][1].re)} × ${N(M[1][0].re)} = ${N(other)}.`,
        { det: d, mainDiagonal: main, otherDiagonal: other },
        { m00: M[0][0].re, m01: M[0][1].re, m10: M[1][0].re, m11: M[1][1].re },
      )
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
      return ex(
        `\\mathrm{diag}(${D[0][0].re}, ${D[1][1].re}) = ${texMat(D)}`,
        `The ${N(D[0][0].re)} and the ${N(D[1][1].re)} sit on the diagonal; the corners are ${N(abs(D[0][1]))}. It stretches the first direction by ${N(D[0][0].re)} and flips the second.`,
        { d00: D[0][0].re, d11: D[1][1].re, corner: abs(D[0][1]) },
      )
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
      return ex(
        `\\mathrm{rank}${texMat(M)} = ${rankN(M)}`,
        `The second row is exactly twice the first, so there is only one different row: the rank is ${N(rankN(M))}.`,
        { rank: rankN(M) },
      )
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
    physics: 'Two states of a qubit that are not multiples of each other span the whole qubit space. Every other state is a mix of them.',
    example: () => {
      const M = mat([[1, 1], [0, 1]])
      return ex(
        `\\mathrm{span}\\{(${M[0][0].re},${M[1][0].re}), (${M[0][1].re},${M[1][1].re})\\}:\\; \\mathrm{rank}${texMat(M)} = ${rankN(M)}`,
        'The two arrows point in different directions, so their span has two independent directions: it is the whole plane.',
        { dimension: rankN(M) },
        { m00: M[0][0].re, m01: M[0][1].re, m10: M[1][0].re, m11: M[1][1].re },
      )
    },
    taught: { qc709: 'f2-gram-schmidt' },
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
      const v = KET['+z']
      const out = apply(SIGMA_X, v)
      const row = (k: number) => `${N(SIGMA_X[k][0].re)}·${N(v[0].re)} + ${N(SIGMA_X[k][1].re)}·${N(v[1].re)} = ${N(out[k].re)}`
      return ex(
        `${texMat(SIGMA_X)}${col(v)} = ${col(out)}`,
        `Each row of the grid is paired with the column: row one gives ${row(0)}, row two gives ${row(1)}. The state flipped.`,
        { top: out[0].re, bottom: out[1].re },
        { x00: SIGMA_X[0][0].re, x01: SIGMA_X[0][1].re, x10: SIGMA_X[1][0].re, x11: SIGMA_X[1][1].re, v0: v[0].re, v1: v[1].re },
      )
    },
    here: (k, _track, course) => {
      const r = Number(k.lo)
      const q = Number(k.hi)
      if (!r || !q) return null
      if (q === 1) {
        // Spin Lab (448) speaks of spins, Physics 709 of qubits
        const n = Math.log2(r)
        const what = n % 1 === 0 && r > 1 ? (course === 'sl448' ? (n === 1 ? 'a spin state' : `a state of ${n} spins`) : `a state of ${n} qubit${n === 1 ? '' : 's'}`) : 'a set of amplitudes'
        return [`A column of ${r} numbers: a list, such as ${what}.`]
      }
      if (r === 1) return [`A row of ${q} numbers: the form a bra takes.`]
      // a square grid is only a table until the text says it acts on states (an amplitude table, a block matrix, a rotation of the plane are grids too)
      return r === q ? [`A ${r} × ${r} grid of numbers. When it acts on states, it is an operator on a space of ${r} states.`] : [`A ${r} × ${q} grid: it takes a column of ${q} numbers to a column of ${r}.`]
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
      return ex(
        `\\delta_{ij} = ${texMat(D)}`,
        `Row i and column j hold $\\delta_{ij}$: ${N(D[0][0].re)} on the diagonal where $i = j$, and ${N(D[0][1].re)} everywhere else.`,
        { d00: D[0][0].re, d01: D[0][1].re, trace: D.reduce((s, row, k) => s + row[k].re, 0) },
      )
    },
    here: (k) => (k.a && k.b ? ['Here: 1 if ', cx(k.a), ' and ', cx(k.b), ' are the same index, and 0 if they differ.'] : null),
    taught: { sl448: 'l4-basis', qc709: 'f2-orthonormal' },
  },
  {
    id: 'hat',
    tex: '\\hat A',
    name: 'Hat (operator, unit vector, or transform)',
    say: 'A hat',
    ground: 'A hat has three jobs. On a capital letter it marks an operator, a machine that turns states into states. On a small letter like n it marks a direction of length 1. On a list c, $\\hat c$ is its Fourier transform.',
    formal: '$\\hat A$ marks an operator on the state space, a linear map often written as a matrix in a basis. $\\hat n$ marks a unit vector in space, $\\|\\hat n\\| = 1$. On a list $c$, $\\hat c_k$ is its discrete Fourier transform.',
    physics: 'Every measurable quantity is an operator $\\hat A$, and the spin along a direction $\\hat n$ is built from $\\hat n$ itself.',
    example: () => {
      const n = unit([0.6, 0, 0.8])
      const len = Math.hypot(...n)
      return ex(
        `\\hat n = (${texNum(n[0])}, ${texNum(n[1])}, ${texNum(n[2])}),\\quad \\|\\hat n\\| = ${texNum(len)}`,
        `The numbers ${N(n[0])} and ${N(n[2])} are chosen so that ${N(n[0] ** 2)} + ${N(n[2] ** 2)} = ${N(n[0] ** 2 + n[2] ** 2)}: the arrow has length exactly ${N(len)}.`,
        { length: len },
        { nx: n[0], ny: n[1], nz: n[2], squareX: n[0] ** 2, squareZ: n[2] ** 2, squares: n[0] ** 2 + n[2] ** 2 },
      )
    },
    here: (k) => {
      const a = (k.of ?? '').trim()
      if (!a) return null
      // a hat is a unit vector only on the letters that name a direction; c (and f, g) is a Fourier coefficient (chapter F8)
      if (/^[nrmxyzab]$/.test(a)) return ['Here the hat on ', cx(a), ' marks a direction of length 1.']
      if (/^[cfg]$/.test(a)) return ['Here the hat on ', cx(a), ' marks the Fourier transform of the list ', cx(a), ': ', cx(`\\hat ${a}_k`), ' is its k-th number.']
      if (/^[a-z]$/.test(a)) return ['Here the hat on ', cx(a), ' marks a changed version of it (an operator, a direction or a transform: the chapter says which).']
      return ['Here the hat on ', cx(a), ' marks an operator.']
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
      const sq = v.map((z) => z.re ** 2)
      return ex(
        `\\vec v = (${v.map((z) => z.re).join(', ')}),\\quad |\\vec v| = \\sqrt{${sq.join(' + ')}} = ${texNum(norm(v))}`,
        'Three numbers locate an arrow in space. Its length comes from adding the squares of the three numbers and taking the root.',
        { length: norm(v) },
        { components: v.map((z) => z.re), squares: sq },
      )
    },
    here: (k) => (k.of ? ['Here: ', cx(k.of), ' is a vector with a size and a direction.'] : null),
    taught: { sl448: 'l6-bloch', qc709: 'q1-two-spots' },
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
      const z = AXIS.z
      const M = nDotSigma(z)
      return ex(
        `\\hat z\\cdot\\vec\\sigma = ${z[0]}\\,\\sigma_x + ${z[1]}\\,\\sigma_y + ${z[2]}\\,\\sigma_z = ${texMat(M)}`,
        `Dotting with the z direction keeps only $\\sigma_z$, because the x and y numbers of $\\hat z$ are ${N(z[0])}.`,
        { d00: M[0][0].re, d11: M[1][1].re },
        { x: z[0], y: z[1], z: z[2] },
      )
    },
    taught: { sl448: 'l5-inverse', qc709: 'q3-spin-operators' },
  },
  {
    id: 'sigma-dot',
    tex: '\\hat n\\cdot\\vec\\sigma',
    name: 'Spin matrix along a direction',
    say: 'n hat dot sigma vector',
    ground: '$\\hat n\\cdot\\vec\\sigma$ mixes the three spin matrices using the three numbers of the direction $\\hat n$. Measured along $\\hat n$, the spin readings are +1 and −1, in units of ħ/2.',
    formal: 'For a unit vector $\\hat n$, $\\hat n\\cdot\\vec\\sigma = n_x\\sigma_x + n_y\\sigma_y + n_z\\sigma_z$ is Hermitian with eigenvalues ±1. Its eigenvectors $|\\pm\\hat n\\rangle$ are the spin states pointing along $\\pm\\hat n$.',
    physics: 'A Stern–Gerlach magnet turned to $\\hat n$ measures the spin $S_n = (\\hbar/2)\\,\\hat n\\cdot\\vec\\sigma$. For a state with Bloch vector $\\vec r$, the average of $\\hat n\\cdot\\vec\\sigma$ is $\\hat n\\cdot\\vec r$.',
    example: () => {
      const deg = 60
      const n = tiltXZ((deg * Math.PI) / 180)
      const M = nDotSigma(n)
      const e = eigenHermitian2(M)
      return ex(
        `\\hat n = (\\sin ${deg}^\\circ, ${texNum(n[1])}, \\cos ${deg}^\\circ) \\Rightarrow \\hat n\\cdot\\vec\\sigma = ${texMat(M)}`,
        `Tilting the direction ${N(deg)}° from z mixes $\\sigma_z$ and $\\sigma_x$. The matrix still has only the values ${N(e.values[0])} and ${N(e.values[1])} (spin readings of plus and minus half of ħ), whatever the tilt.`,
        { d00: M[0][0].re, offDiagonal: M[0][1].re, high: e.values[0], low: e.values[1] },
        { tiltDegrees: deg, ny: n[1] },
      )
    },
    here: (k) => (k.a ? ['Here: the spin matrix along the direction ', cx(k.a), '. Its readings are +1 and −1, in units of ħ/2.'] : null),
    taught: { sl448: 'l5-inverse', qc709: 'q3-spin-operators' },
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
      return ex(
        `\\sigma_x |{+z}\\rangle = ${texMat(SIGMA_X)}${col(KET['+z'])} = ${col(out)} = ${ketTex(out)}`,
        `The ${N(out[1].re)} in the top slot moves to the bottom slot: up becomes down.`,
        { top: out[0].re, bottom: out[1].re },
        { x00: SIGMA_X[0][0].re, x01: SIGMA_X[0][1].re, x10: SIGMA_X[1][0].re, x11: SIGMA_X[1][1].re, v0: KET['+z'][0].re, v1: KET['+z'][1].re },
      )
    },
    here: (k) => (k.m === 'gate' ? gateHere('X', 'NOT gate', k.of) : ['Here: the spin matrix along x.']),
    taught: { sl448: 'l4-matrices', qc709: 'q3-spin-operators' },
  },
  {
    id: 'pauli-y',
    tex: '\\sigma_y',
    name: 'Pauli Y (spin along y)',
    say: 'sigma y, or the Y gate',
    ground: 'Y flips the two basis states and also puts in a factor of i or −i. As a table it is 0, −i on top and i, 0 below.',
    formal: '$\\sigma_y = Y = \\begin{pmatrix}0&-i\\\\i&0\\end{pmatrix} = iXZ$. It is Hermitian and unitary with $Y^2 = I$; as a gate it flips the bit and adds a quarter-turn of phase. Its eigenstates are $|{\\pm y}\\rangle$.',
    physics: '$\\sigma_y$ is the spin component along y, in units of $\\hbar/2$. It is the only Pauli matrix with complex entries, and its eigenstates $|{\\pm y}\\rangle$ have complex amplitudes.',
    example: () => {
      const out = apply(SIGMA_Y, KET['+z'])
      return ex(
        `\\sigma_y |{+z}\\rangle = ${texMat(SIGMA_Y)}${col(KET['+z'])} = ${col(out)} = ${ketTex(out)}`,
        'Up becomes down, times i. A pure factor of i changes no chance, so the physical state is the same as for $\\sigma_x$.',
        { topIm: out[0].im, bottomIm: out[1].im },
        { v0: KET['+z'][0].re, v1: KET['+z'][1].re },
      )
    },
    here: (k) => (k.m === 'gate' ? gateHere('Y', 'Y gate', k.of) : ['Here: the spin matrix along y.']),
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
      return ex(
        `\\sigma_z |{-z}\\rangle = ${texMat(SIGMA_Z)}${col(KET['-z'])} = ${col(out)} = ${ketTex(out)}`,
        `The state is multiplied by ${N(out[1].re)}. A global sign changes no chance, but the sign between two parts of a state does.`,
        { top: out[0].re, bottom: out[1].re },
        { v0: KET['-z'][0].re, v1: KET['-z'][1].re },
      )
    },
    here: (k) => (k.m === 'gate' ? gateHere('Z', 'Z gate', k.of) : ['Here: the spin matrix along z.']),
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
      const sq = out[0].re ** 2
      return ex(
        `H|0\\rangle = ${col(out)} = ${ketTex(out)}`,
        `The two entries are equal, each ${N(out[0].re)}. Squared, each is ${N(sq)}: equal chances for the two readings.`,
        { top: out[0].re, bottom: out[1].re, again: apply(H, out)[0].re },
        { square: sq },
      )
    },
    here: (k) => gateHere('H', 'Hadamard gate', k.of),
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
      const input = '10'
      const out = apply(cnot(), ket(input))
      const at = out.findIndex((z) => z.re === 1)
      const label = at.toString(2).padStart(2, '0')
      return ex(
        `\\mathrm{CNOT}\\,|${input}\\rangle = |${label}\\rangle`,
        `The control qubit is in $|1\\rangle$, so the target is flipped: $|${input}\\rangle$ becomes $|${label}\\rangle$.`,
        { outIndex: at },
      )
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
      return ex(
        `\\mathrm{CZ}\\,|11\\rangle = ${out[3].re < 0 ? '-' : ''}|11\\rangle`,
        'Only when both qubits are in $|1\\rangle$ does the sign flip.',
        { amplitude: out[3].re },
      )
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
      const at = out.findIndex((z) => z.re === 1)
      return ex(
        `\\mathrm{SWAP}\\,|01\\rangle = |${at.toString(2).padStart(2, '0')}\\rangle`,
        `The two qubit states trade places: $|01\\rangle$ becomes $|${at.toString(2).padStart(2, '0')}\\rangle$.`,
        { outIndex: at },
      )
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
      const yes = 3
      const no = 4
      const inn = set.includes(yes)
      const out = set.includes(no)
      return ex(
        `${yes} \\in \\{${set.join(', ')}\\} \\text{ is ${inn ? 'true' : 'false'};}\\quad ${no} \\in \\{${set.join(', ')}\\} \\text{ is ${out ? 'true' : 'false'}}`,
        `The set holds ${set.slice(0, -1).map((x) => N(x)).join(', ')} and ${N(set[set.length - 1])}. The number ${N(yes)} is one of them and ${N(no)} is ${out ? '' : 'not'}.`,
        { three: inn ? 1 : 0, four: out ? 1 : 0 },
        { set, yes, no },
      )
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
      return ex(
        `(${texC(v[0])}, ${texC(v[1])}) \\in \\mathbb{C}^{${v.length}};\\quad \\mathbb{C}^{2^{${n}}} \\text{ lists } ${2 ** n} \\text{ numbers}`,
        `A pair of complex numbers is one point of $\\mathbb{C}^{${N(v.length)}}$. With ${N(n)} qubits you need $${N(2)}^{${N(n)}} = ${N(2 ** n)}$ complex numbers.`,
        { dimension: v.length, threeQubits: 2 ** n },
        { base: 2, qubits: n, first: 1 },
      )
    },
    here: (k) => (k.of ? (isNum(k.of) ? ['Here: lists of ', cx(k.of), ' complex numbers.'] : ['Here: lists of ', cx(k.of), ' complex numbers (the exponent counts how many).']) : ['Here: single complex numbers.']),
    taught: { qc709: 'q1-vector-space' },
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
      const sq = v.map((z) => z.re ** 2)
      return ex(
        `(${v.map((z) => z.re).join(', ')}) \\in \\mathbb{R}^{${v.length}},\\quad \\text{length } ${texNum(norm(v))}`,
        `A list of three real numbers is one point of space. Its length is √(${sq.map((x) => N(x)).join(' + ')}) = ${N(norm(v))}.`,
        { dimension: v.length, length: norm(v) },
        { components: v.map((z) => z.re), squares: sq },
      )
    },
    here: (k) => (k.of ? ['Here: lists of ', cx(k.of), ' real numbers.'] : ['Here: single real numbers.']),
    taught: { qc709: 'q1-vector-space' },
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
      return ex(
        `e^{i\\pi/2} = ${texC(q)},\\quad e^{i\\pi} = ${texC(h)}`,
        `A quarter turn from ${N(1)} lands on i; a half turn lands on ${N(h.re)}. Both are still at distance ${N(abs(q))} from ${N(0)}.`,
        { quarterRe: q.re, quarterIm: q.im, halfRe: h.re, size: abs(q) },
        { start: 1, origin: 0 },
      )
    },
    here: (k) => {
      const p = phaseOf(k.of)
      if (!p) return null
      return p.angle ? ['Here: a turn by ', cx(p.angle), p.back ? ' the other way (clockwise) from 1.' : ' from 1 (counter-clockwise).'] : null
    },
    taught: { sl448: 'l2-complex', qc709: 'f1-euler' },
  },
  {
    id: 'exp-operator',
    tex: 'e^{-i\\theta\\hat n\\cdot\\vec\\sigma/2}',
    name: 'Exponential of an operator (a rotation or an evolution)',
    say: 'e to the minus i theta times an operator',
    ground: 'When an operator sits in the exponent, $e^{-i\\theta A}$ is an operator, not a number. It turns a state: the operator in the exponent names the axis, the number sets the angle.',
    formal: '$e^{-iM} = \\sum_k (-iM)^k/k!$ is defined by the power series of the operator $M$. For Hermitian $M$ it is unitary: it keeps lengths and overlaps. With $M = \\theta\\,\\hat n\\cdot\\vec\\sigma/2$ it rotates a spin by $\\theta$ about $\\hat n$; with $M = Ht/\\hbar$ it is time evolution.',
    physics: 'A turn of a spin about z by $\\varphi$ is $e^{-i\\varphi S_z/\\hbar}$. Letting a state run for a time $t$ under $H$ is $e^{-iHt/\\hbar}$. Both keep the length of the state.',
    example: () => {
      const quarter = Math.PI / 2
      const out = apply(rotation(AXIS.z, quarter), KET['+x'])
      const deg = (quarter * 180) / Math.PI
      const toY = abs(inner(KET['+y'], out))
      return ex(
        `e^{-i\\,(${fmt(deg)}^\\circ)\\,\\sigma_z/2}\\,|{+x}\\rangle \\cong |{+y}\\rangle`,
        `A turn by ${N(deg)}° about z takes "up along x" to "up along y". The overlap of the result with "up along y" has size ${N(toY)}, and its length is still ${N(norm(out))}.`,
        { turnDegrees: deg, overlapWithY: toY, length: norm(out) },
      )
    },
    here: (k) => (k.of ? ['Here the exponent is ', cx(k.of), ', which holds an operator: the whole expression is an operator (a rotation or an evolution), not a single number.'] : null),
    taught: { sl448: 'l6-generator', qc709: 'f4-unitary' },
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
      const chance = prob(KET['+z'], a)
      return ex(
        `i\\,|{+x}\\rangle \\cong |{+x}\\rangle: \\; P(+z) = ${texNum(chance)} \\text{ for both}`,
        `Multiplying a state by i only turns it a quarter turn as a whole. Both give the chance ${N(chance)} for "up along z".`,
        { same: samePhysicalState(a, b) ? 1 : 0, chanceA: chance, chanceB: prob(KET['+z'], b) },
      )
    },
    taught: { sl448: 'l11-two-level', qc709: 'f1-phase' },
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
      const lo = 0.3
      const hi = 0.6
      const small = abs2(c(lo))
      const big = abs2(c(hi))
      return ex(
        `P \\propto |c|^2:\\; c = ${lo} \\to ${texNum(small)},\\quad c = ${hi} \\to ${texNum(big)}`,
        `Doubling the amplitude from ${N(lo)} to ${N(hi)} multiplies the chance by ${N(big / small)}, because the chance goes with the square.`,
        { ratio: big / small },
        { small: lo, big: hi, chanceSmall: small, chanceBig: big },
      )
    },
    taught: {},
  },
  {
    id: 'arrow',
    tex: '\\to',
    name: 'Arrow (goes to, becomes)',
    say: 'goes to, or becomes',
    ground: 'An arrow points from the start to the end: A → B reads "A goes to B" or "A turns into B".',
    formal: 'A → B marks a map or a process from A to B, or a limit (x → 0). For a map M between spaces, $M\\colon V \\to W$ names its source and target; what M does to one state is written with ↦.',
    physics: 'Gates and measurements are maps of states: $\\sigma_x$ sends $|{+z}\\rangle$ to $|{-z}\\rangle$.',
    example: () => {
      const out = apply(SIGMA_X, KET['+z'])
      return ex(
        `|{+z}\\rangle \\xrightarrow{\\;\\sigma_x\\;} ${ketTex(out)}`,
        'Acting with $\\sigma_x$ on the state "up along z" produces the state "down along z".',
        { top: out[0].re, bottom: out[1].re },
      )
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
      const x0 = 3
      return ex(
        `x \\mapsto x^2:\\quad ${x0} \\mapsto ${f(x0)}`,
        `The rule squares its input, so the input ${N(x0)} is sent to ${N(f(x0))}.`,
        { out: f(x0) },
        { input: x0 },
      )
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
      const [p, q] = [v[0].re, v[1].re]
      return ex(
        `\\|(${p}, ${q})\\| = ${texNum(norm(v))} \\;\\Rightarrow\\; ${p}^2 + ${q}^2 = ${texNum(norm2(v))}`,
        `A state of length ${N(norm(v))} has chances ${N(p ** 2)} and ${N(q ** 2)}, and they add up to ${N(norm2(v))}.`,
        { total: norm2(v) },
        { p, q, chanceP: p ** 2, chanceQ: q ** 2, length: norm(v) },
      )
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
      return ex(
        `\\text{orthogonal} \\Leftrightarrow \\langle a|b\\rangle = 0:\\; \\langle{+z}|{-z}\\rangle = ${texNum(orth.re)},\\; \\langle{+z}|{+x}\\rangle = ${texNum(other.re)}`,
        `Up and down along z have overlap ${N(abs(orth))} and are orthogonal. Up along z and up along x have overlap ${N(abs(other))} and are not.`,
        { orthogonal: abs(orth), notOrthogonal: abs(other) },
        { zero: 0 },
      )
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
      return ex(
        `P(\\pm x \\mid {+z}) = ${texNum(plus)} \\text{ and } ${texNum(minus)}`,
        `Starting from "up along z", measuring along x gives + or − with chance ${N(plus)} each.`,
        { plus, minus },
      )
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
      const prods = a.map((x, k) => x * b[k])
      return ex(
        `(${a.join(', ')})\\cdot(${b.join(', ')}) = ${prods.map((_x, k) => `${a[k]}\\cdot ${b[k]}`).join(' + ')} = ${dot(a, b)}`,
        `Multiply matching entries, ${prods.slice(0, -1).map((x) => N(x)).join(', ')} and ${N(prods[prods.length - 1])}, then add them: ${N(dot(a, b))}.`,
        { dot: dot(a, b) },
        { a, b, products: prods },
      )
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
      const t0 = 2
      const p = 3
      const s = slope(f, t0)
      return ex(
        `\\frac{d}{dt}\\,t^${p} \\Big|_{t=${t0}} = ${p}\\cdot ${t0}^${p - 1} = ${texNum(Math.round(s))}`,
        `At $t = ${N(t0)}$ the curve $t^{${N(p)}}$ is climbing at ${N(Math.round(s))} units for every unit of t.`,
        { slope: Math.round(s) },
        { t0, power: p, lowerPower: p - 1 },
      )
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
      const x0 = 2
      const t0 = 3
      const s = slope((t) => f(x0, t), t0)
      return ex(
        `f = x\\,t^2 \\Rightarrow \\frac{\\partial f}{\\partial t} = 2xt = ${texNum(Math.round(s))}\\ \\text{at } x = ${x0},\\ t = ${t0}`,
        `Keep x fixed at ${N(x0)} and vary only t: the rate is ${N(2)} · ${N(x0)} · ${N(t0)} = ${N(Math.round(s))}.`,
        { slope: Math.round(s) },
        { x0, t0, factor: 2 },
      )
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
      const radicand = 2
      const r = Math.sqrt(radicand)
      const back = Math.SQRT1_2 ** 2
      return ex(
        `\\sqrt{${radicand}} \\approx ${r.toFixed(3)},\\quad \\left(\\tfrac{1}{\\sqrt${radicand}}\\right)^2 = ${texNum(back)}`,
        `The square root of ${N(radicand)} is about ${N(r)}. Its reciprocal squared is exactly ${N(back)}.`,
        { root: r, half: back },
        { radicand, reciprocal: Math.SQRT1_2 },
      )
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
    example: () => {
      const z = c(3, 4)
      return ex(
        `\\mathrm{Re}(${texC(z)}) = ${texNum(z.re)}`,
        `The real part is the ${N(z.re)}; the ${N(z.im)} belongs to the imaginary part.`,
        { re: z.re },
        { im: z.im },
      )
    },
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
    example: () => {
      const z = c(3, 4)
      return ex(
        `\\mathrm{Im}(${texC(z)}) = ${texNum(z.im)}`,
        `The imaginary part is the ${N(z.im)}, not ${N(z.im)}i: it is an ordinary real number.`,
        { im: z.im },
        { re: z.re },
      )
    },
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
      const a = 17
      const m = 12
      const r = ((a % m) + m) % m
      return ex(
        `${a} \\bmod ${m} = ${r}`,
        `The number ${N(m)} fits into ${N(a)} once, with ${N(r)} left over: ${N(a)} o’clock on a ${N(m)}-hour clock is ${N(r)}.`,
        { remainder: r },
        { a, modulus: m },
      )
    },
    taught: { qc709: 'f8-clock' },
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
      const a = 84
      const b = 36
      const steps = euclidSteps(a, b)
      const g = gcd(a, b)
      return ex(
        `\\gcd(${a}, ${b}) = ${g}`,
        `Euclid’s steps: ${steps.map((s) => `${N(s.a)} = ${N(s.q)}·${N(s.b)} + ${N(s.r)}`).join(', then ')}. The last nonzero remainder is ${N(g)}.`,
        { gcd: g },
        { a, b, steps: steps.flatMap((s) => [s.a, s.b, s.q, s.r]) },
      )
    },
    here: (k) => (k.of ? ['Here: the biggest common divisor of ', cx(k.of), '.'] : null),
    taught: { qc709: 'f8-euclid' },
  },
  {
    id: 'floor',
    tex: '\\lfloor x\\rfloor',
    name: 'Floor (round down)',
    say: 'the floor of',
    ground: '⌊x⌋ rounds x down to the nearest whole number at or below it.',
    formal: '⌊x⌋ is the largest integer not exceeding x. For negative x it rounds away from zero: ⌊−1.2⌋ = −2.',
    physics: 'Whole-number steps, such as how many full turns fit into an angle, are counted with the floor.',
    example: () => {
      const x = 3.7
      const y = -1.2
      return ex(
        `\\lfloor ${x} \\rfloor = ${Math.floor(x)},\\quad \\lfloor ${y} \\rfloor = ${Math.floor(y)}`,
        `Down from ${N(x)} is ${N(Math.floor(x))}. Down from ${N(y)} is ${N(Math.floor(y))}, which is further from zero.`,
        { up: Math.floor(x), negative: Math.floor(y) },
        { x, y },
      )
    },
    here: (k) => (k.of ? ['Here: ', cx(k.of), ' rounded down to a whole number.'] : null),
    taught: { qc709: 'f8-fractions' },
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
      const arg = 8
      const bits = Math.log2(arg)
      const half = 0.5
      const coin = binaryEntropy(half)
      return ex(
        `\\log_2 ${arg} = ${bits},\\quad -\\tfrac12\\log_2\\tfrac12 - \\tfrac12\\log_2\\tfrac12 = ${texNum(coin)}`,
        `Starting at ${N(1)} and doubling ${N(bits)} times gives ${N(arg)}. A fair coin carries exactly ${N(coin)} bit.`,
        { log8: bits, coin },
        { argument: arg, start: 1, half },
      )
    },
    taught: { qc709: 'f5-surprise' },
  },
  {
    id: 'hbar',
    tex: '\\hbar',
    name: 'h-bar (reduced Planck constant)',
    say: 'h bar',
    ground: 'ħ is a tiny constant of nature that sets the scale of quantum effects. A spin component of an electron reads only +ħ/2 or −ħ/2.',
    formal: 'ħ = h/2π ≈ 1.055 × 10⁻³⁴ J·s is the reduced Planck constant: the unit of angular momentum and the link E = ħω between energy and frequency.',
    physics: 'The two readings of a spin component, +ħ/2 and −ħ/2, sit one whole step of ħ apart. This course’s engine sets ħ = 1 and the screen adds the ħ back.',
    example: () => {
      const e = eigenHermitian2(SZ)
      return ex(
        `S_z = \\tfrac{\\hbar}{2}\\sigma_z:\\quad \\text{readings } ${texNum(e.values[0])}\\hbar \\text{ and } ${texNum(e.values[1])}\\hbar`,
        `In units of ħ the two readings are +${N(e.values[0])} and ${N(e.values[1])}.`,
        { up: e.values[0], down: e.values[1] },
      )
    },
    taught: { sl448: 'l1-quantized' },
  },
]
