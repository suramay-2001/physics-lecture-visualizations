/**
 * Whole-number arithmetic for Chapter F8 "Hidden rhythms" (P-F8-story §9.1; N&C Appendix 4, printed pp. 625-638): remainders
 * and clocks mod N, the greatest common divisor and Euclid's algorithm, inverses, powers and the order of a number mod N, and
 * the step from an order to the factors of N. Pure functions of whole numbers; the products that can pass 2⁵³ go through BigInt,
 * so a power mod N is exact for every N a stage or a Try-it can name. Chapter Q18 reuses it for Shor's algorithm.
 *
 * Conventions: `mod(a, N)` is the remainder in {0, …, N − 1} for every whole a (so mod(−3, 12) = 9, not −3); a "clock" of N marks
 * is Z_N; the order of x mod N exists only when gcd(x, N) = 1 (otherwise `null`).
 */

const whole = (x: number, name: string): void => {
  if (!Number.isSafeInteger(x)) throw new Error(`${name} must be a whole number (got ${x})`)
}
const positive = (N: number, name = 'N'): void => {
  whole(N, name)
  if (N < 1) throw new Error(`${name} must be a whole number ≥ 1 (got ${N})`)
}

/** a mod N in {0, …, N − 1} for any whole a (the remainder N&C Eq. A4.2 calls r; never negative). */
export function mod(a: number, N: number): number {
  whole(a, 'a')
  positive(N)
  return ((a % N) + N) % N
}

/** gcd(a, b) ≥ 0 by Euclid's algorithm (N&C Thm A4.5, p. 628); gcd(a, 0) = |a| and gcd(0, 0) = 0. */
export function gcd(a: number, b: number): number {
  whole(a, 'a')
  whole(b, 'b')
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) [x, y] = [y, x % y]
  return x
}

/** One line of Euclid's algorithm: a = q·b + r, with 0 ≤ r < b. */
export interface EuclidStep {
  a: number
  b: number
  q: number
  r: number
}
/**
 * Every division line of Euclid's algorithm on a ≥ b > 0, stopping at the line whose remainder is 0:
 * 84, 36 → [84 = 2·36 + 12, 36 = 3·12 + 0]. The last divisor is the gcd.
 */
export function euclidSteps(a: number, b: number): EuclidStep[] {
  whole(a, 'a')
  whole(b, 'b')
  if (a < 1 || b < 1) throw new Error('euclidSteps: both numbers must be ≥ 1')
  const steps: EuclidStep[] = []
  let x = a
  let y = b
  while (y !== 0) {
    const q = Math.floor(x / y)
    const r = x - q * y
    steps.push({ a: x, b: y, q, r })
    ;[x, y] = [y, r]
  }
  return steps
}

/** The extended Euclid: g = gcd(a, b) = a·x + b·y with whole x, y (N&C Thm A4.2, p. 626: g is the least positive such value). */
export function egcd(a: number, b: number): { g: number; x: number; y: number } {
  whole(a, 'a')
  whole(b, 'b')
  let [r0, r1] = [a, b]
  let [x0, x1] = [1, 0]
  let [y0, y1] = [0, 1]
  while (r1 !== 0) {
    const q = Math.trunc(r0 / r1)
    ;[r0, r1] = [r1, r0 - q * r1]
    ;[x0, x1] = [x1, x0 - q * x1]
    ;[y0, y1] = [y1, y0 - q * y1]
  }
  return r0 < 0 ? { g: -r0, x: -x0, y: -y0 } : { g: r0, x: x0, y: y0 }
}

/** a⁻¹ mod N when it exists (iff gcd(a, N) = 1; N&C Cor. A4.4, p. 627), else null. The inverse is in {0, …, N − 1}; for N = 1 it is 0. */
export function modInverse(a: number, N: number): number | null {
  positive(N)
  const { g, x } = egcd(mod(a, N), N)
  return g === 1 ? mod(x, N) : null
}

/** x^e mod N for e ≥ 0 by repeated squaring (BigInt, so exact whatever the size of N). */
export function modPow(x: number, e: number, N: number): number {
  whole(x, 'x')
  whole(e, 'e')
  positive(N)
  if (e < 0) throw new Error('modPow: the exponent must be ≥ 0')
  const n = BigInt(N)
  let base = ((BigInt(x) % n) + n) % n
  let k = BigInt(e)
  let acc = 1n % n
  while (k > 0n) {
    if (k & 1n) acc = (acc * base) % n
    base = (base * base) % n
    k >>= 1n
  }
  return Number(acc)
}

/** The first `count` powers x⁰, x¹, … mod N (x⁰ = 1): the list whose period the chapter looks for. */
export function powersMod(x: number, N: number, count: number): number[] {
  positive(N)
  whole(count, 'count')
  const n = BigInt(N)
  const b = BigInt(mod(x, N))
  const out: number[] = []
  let v = 1n % n
  for (let k = 0; k < count; k++) {
    out.push(Number(v))
    v = (v * b) % n
  }
  return out
}

/**
 * The order of x mod N: the least r ≥ 1 with x^r ≡ 1 (mod N) (N&C A4.3, p. 633). It exists exactly when gcd(x, N) = 1; otherwise null.
 * Found by multiplying by x until the product returns to 1, so the loop runs at most N times.
 */
export function multOrder(x: number, N: number): number | null {
  positive(N)
  if (gcd(x, N) !== 1) return null
  const b = mod(x, N)
  let v = b
  for (let r = 1; r <= N; r++) {
    if (v === 1 % N) return r
    v = Number((BigInt(v) * BigInt(b)) % BigInt(N))
  }
  return null
}

/**
 * Euler's count of units: how many a in {1, …, N} have gcd(a, N) = 1 (the number of clock marks that have an inverse; N&C Thm A4.9,
 * p. 631). The chapter spells it in words: the symbol φ stays for phases. unitsCount(21) = 12.
 */
export function unitsCount(N: number): number {
  positive(N)
  let n = 0
  for (let a = 1; a <= N; a++) if (gcd(a, N) === 1) n++
  return n
}

/**
 * The two factors of N the order of x gives (N&C Thm A4.11, pp. 633-635): when r is even and x^{r/2} ≢ −1 (mod N), N divides
 * (x^{r/2} − 1)(x^{r/2} + 1) but neither factor alone, so gcd(x^{r/2} − 1, N) and gcd(x^{r/2} + 1, N) are proper factors. Returns
 * them smaller first; null when r is odd, when x^{r/2} ≡ −1, or when r is not x's order.
 */
export function factorFromOrder(x: number, r: number, N: number): [number, number] | null {
  positive(N)
  if (!Number.isSafeInteger(r) || r < 1 || r % 2 !== 0) return null
  if (modPow(x, r, N) !== 1 % N) return null
  const half = modPow(x, r / 2, N)
  if (half === N - 1) return null
  const a = gcd(half - 1, N)
  const b = gcd(half + 1, N)
  if (a <= 1 || a >= N || b <= 1 || b >= N) return null
  return a <= b ? [a, b] : [b, a]
}
