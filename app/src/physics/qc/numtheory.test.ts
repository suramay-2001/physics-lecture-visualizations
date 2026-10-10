/**
 * qc/numtheory.ts against numpy and Python (pipeline/make_numtheory_fixtures.py → __fixtures__/qc-numtheory.json: remainders and powers from Python's own
 * `%` and `pow` (inverses from `pow(a, -1, N)`), the Bezout value found by scanning a window of (x, y), orders by scanning the list of powers, Euler's
 * count from the product formula), plus properties over every modulus up to a bound: a·a⁻¹ ≡ 1 exactly when gcd = 1, the order divides the count of
 * units, the factors that come out divide N, the division lines of Euclid rebuild a and b, and the gcd is the least positive combination.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-numtheory.json?raw'
import { egcd, euclidSteps, factorFromOrder, gcd, mod, modInverse, modPow, multOrder, powersMod, unitsCount } from './numtheory'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)

describe('numtheory: remainders', () => {
  it('mod is the non-negative remainder (the trap: -3 mod 12 is 9, not -3)', () => {
    for (const [a, N, want] of FX.mod as [number, number, number][]) expect(mod(a, N), `${a} mod ${N}`).toBe(want)
    expect(mod(-3, 12)).toBe(9)
    expect(mod(14, 12)).toBe(2)
    expect(mod(9 + 5, 12)).toBe(2)
  })
  it('refuses a non-whole number or a modulus below 1', () => {
    expect(() => mod(2.5, 12)).toThrow()
    expect(() => mod(3, 0)).toThrow()
    expect(() => mod(3, -4)).toThrow()
  })
})

describe('numtheory: gcd, Euclid and the Bezout pair', () => {
  it('gcd matches Python on the table, in either order and for negatives', () => {
    for (const [a, b, g] of FX.gcd as [number, number, number][]) {
      expect(gcd(a, b), `gcd(${a}, ${b})`).toBe(g)
      expect(gcd(-a, b)).toBe(g)
    }
    expect(gcd(0, 0)).toBe(0)
  })
  it('the division lines match Python divmod and rebuild a and b', () => {
    for (const [key, lines] of Object.entries(FX.lines as Record<string, number[][]>)) {
      const [a, b] = key.split(',').map(Number)
      const steps = euclidSteps(a, b)
      expect(steps.map((s) => [s.a, s.b, s.q, s.r]), key).toEqual(lines)
      for (const s of steps) expect(s.a).toBe(s.q * s.b + s.r)
      expect(steps[steps.length - 1].r).toBe(0)
      expect(steps[steps.length - 1].b).toBe(gcd(a, b))
    }
    expect(euclidSteps(84, 36)).toEqual([
      { a: 84, b: 36, q: 2, r: 12 },
      { a: 36, b: 12, q: 3, r: 0 },
    ])
  })
  it('egcd returns g = ax + by, and g is the least positive value of ax + by (scanned by Python)', () => {
    for (const [key, least] of Object.entries(FX.bezout as Record<string, number>)) {
      const [a, b] = key.split(',').map(Number)
      const { g, x, y } = egcd(a, b)
      expect(a * x + b * y, key).toBe(g)
      expect(g).toBe(least)
      expect(g).toBe(gcd(a, b))
    }
    expect(egcd(84, 36)).toEqual({ g: 12, x: 1, y: -2 })
  })
  it('egcd holds over a grid of pairs, with negatives', () => {
    for (let a = -30; a <= 30; a++)
      for (let b = -30; b <= 30; b++) {
        const { g, x, y } = egcd(a, b)
        expect(a * x + b * y).toBe(g)
        expect(g).toBe(gcd(a, b))
      }
  })
})

describe('numtheory: inverses', () => {
  it('modInverse matches Python pow(a, -1, N), and null exactly where Python raises', () => {
    for (const [key, want] of Object.entries(FX.inverse as Record<string, number | null>)) {
      const [a, N] = key.split(',').map(Number)
      expect(modInverse(a, N), key).toBe(want)
    }
    expect(modInverse(2, 21)).toBe(11)
    expect(modInverse(4, 21)).toBe(16)
    expect(modInverse(3, 21)).toBeNull()
  })
  it('property: a·a⁻¹ ≡ 1 (mod N) when an inverse exists, and it exists iff gcd(a, N) = 1', () => {
    for (let N = 2; N <= 60; N++)
      for (let a = 0; a < N; a++) {
        const inv = modInverse(a, N)
        if (gcd(a, N) === 1) {
          expect(inv).not.toBeNull()
          expect(mod(a * inv!, N), `${a}⁻¹ mod ${N}`).toBe(1)
        } else expect(inv).toBeNull()
      }
  })
})

describe('numtheory: powers and orders', () => {
  it('modPow matches Python pow, including exponents and moduli far past 2³²', () => {
    for (const [x, e, N, want] of FX.pow as number[][]) expect(modPow(x, e, N), `${x}^${e} mod ${N}`).toBe(want)
    expect(modPow(2, 100, 21)).toBe(16)
    expect(modPow(2, 6, 21)).toBe(1)
  })
  it('powersMod lists x⁰, x¹, … and repeats with the order', () => {
    for (const [key, list] of Object.entries(FX.powers as Record<string, number[]>)) {
      const [x, N] = key.split(',').map(Number)
      expect(powersMod(x, N, list.length), key).toEqual(list)
    }
    expect(powersMod(2, 21, 7)).toEqual([1, 2, 4, 8, 16, 11, 1])
    expect(powersMod(3, 21, 7)).toEqual([1, 3, 9, 6, 18, 12, 15])
  })
  it('multOrder matches the scan of the whole list of powers, and is null when x shares a factor with N', () => {
    for (const [key, want] of Object.entries(FX.order as Record<string, number | null>)) {
      const [x, N] = key.split(',').map(Number)
      expect(multOrder(x, N), key).toBe(want)
    }
    expect(multOrder(2, 21)).toBe(6)
    expect(multOrder(5, 21)).toBe(6)
    expect(multOrder(3, 21)).toBeNull()
  })
  it('Euler’s count of units matches the product formula, and the order divides it (every unit, every N up to 80)', () => {
    for (const [N, want] of Object.entries(FX.units as Record<string, number>)) expect(unitsCount(Number(N)), `N = ${N}`).toBe(want)
    expect(unitsCount(21)).toBe(12)
    expect(FX.orderDividesUnits).toBe(true)
    for (let N = 2; N <= 80; N++) {
      const u = unitsCount(N)
      for (let x = 1; x < N; x++) if (gcd(x, N) === 1) expect(u % multOrder(x, N)!, `ord(${x}) | units(${N})`).toBe(0)
    }
  })
  it('property: x^order ≡ 1 and no smaller power is', () => {
    for (let N = 2; N <= 50; N++)
      for (let x = 1; x < N; x++) {
        const r = multOrder(x, N)
        if (r === null) continue
        expect(modPow(x, r, N)).toBe(1)
        for (let k = 1; k < r; k++) expect(modPow(x, k, N)).not.toBe(1)
      }
  })
  it('the exponent matters only mod the order: 2^100 ≡ 2^(100 mod 6) = 2^4 = 16 (mod 21)', () => {
    expect(100 % 6).toBe(4)
    expect(modPow(2, 100, 21)).toBe(modPow(2, 4, 21))
    expect(modPow(2, 4, 21)).toBe(16)
  })
})

describe('numtheory: from an order to factors', () => {
  it('factorFromOrder matches Python (with trial division confirming every factor) for the table of cases', () => {
    for (const [key, want] of Object.entries(FX.factors as Record<string, number[] | null>)) {
      const [x, N] = key.split(',').map(Number)
      const r = multOrder(x, N)
      expect(r === null ? null : factorFromOrder(x, r, N), key).toEqual(want)
    }
    expect(factorFromOrder(2, 6, 21)).toEqual([3, 7])
    expect(factorFromOrder(4, 3, 21)).toBeNull() // an odd order gives nothing
  })
  it('property: any factors returned are proper divisors of N whose product is N when N = pq', () => {
    for (const N of [15, 21, 33, 35, 39, 55, 77, 91])
      for (let x = 2; x < N; x++) {
        const r = multOrder(x, N)
        if (r === null) continue
        const f = factorFromOrder(x, r, N)
        if (f) {
          expect(N % f[0]).toBe(0)
          expect(N % f[1]).toBe(0)
          expect(f[0] * f[1]).toBe(N)
        }
      }
  })
  it('refuses a wrong order (r is not x’s order) and a power that is −1', () => {
    expect(factorFromOrder(2, 4, 21)).toBeNull() // 2^4 = 16 ≠ 1
    expect(factorFromOrder(5, 2, 21)).toBeNull() // order of 5 is 6, not 2
    // the worked case of the story: 2^3 = 8, 8² − 1 = 63 = 7·9
    expect(modPow(2, 3, 21)).toBe(8)
    expect(8 * 8 - 1).toBe(63)
    expect(gcd(7, 21)).toBe(7)
    expect(gcd(9, 21)).toBe(3)
  })
})
