import { describe, expect, it } from 'vitest'
import { parseNumber } from './parseNumber'

const cases: [string, number][] = [
  ['0.75', 0.75],
  ['3/4', 0.75],
  ['.5', 0.5],
  ['√3/2', Math.sqrt(3) / 2],
  ['sqrt(3)/2', Math.sqrt(3) / 2],
  ['1/sqrt2', Math.SQRT1_2],
  ['1/√2', Math.SQRT1_2],
  ['cos(pi/8)^2', Math.cos(Math.PI / 8) ** 2],
  ['2pi', 2 * Math.PI],
  ['-ħ/2', -0.5],
  ['ħ/4', 0.25],
  ['(1+√2)/2', (1 + Math.SQRT2) / 2],
  ['2^-1', 0.5],
  ['−1/2', -0.5],
  ['3 × 0.25', 0.75],
  ['1e-3', 0.001],
]

describe('parseNumber', () => {
  it.each(cases)('%s', (src, want) => {
    expect(parseNumber(src)).toBeCloseTo(want, 12)
  })
  it.each(['', 'abc', '3//4', '(1+2', 'alert(1)', '1/0'])('rejects %s', (src) => {
    expect(parseNumber(src)).toBeNull()
  })
  // decision #10: prototype members are not constants or functions (interim Object.hasOwn fix)
  it.each(['constructor', 'toString', '__proto__', 'hasOwnProperty(1)', 'valueOf', 'constructor(1)', 'constructor(2)*1', '1*constructor(3)'])('rejects prototype name %s', (src) => {
    expect(parseNumber(src)).toBeNull()
  })
})
