import { describe, expect, it } from 'vitest'
import { classify, compose } from '../../../physics/operators'
import { c } from '../../../physics/complex'
import { classReadout, drawScale, eigReadout, num, opLines, short, signedNum } from './opLabels'

const cls = (a0: number, a: [number, number, number]) => classify(compose({ a0: c(a0), a: a.map((x) => c(x)) as never }))

describe('operator-space readouts', () => {
  it('formats numbers with a real minus sign and no −0', () => {
    expect(num(-0.5)).toBe('−0.50')
    expect(num(-0.0001)).toBe('0.00')
    expect(signedNum(0.5)).toBe('+0.50')
    expect(signedNum(-0.5)).toBe('−0.50')
  })
  it('states A and its eigenvalues a₀ ± |a⃗|', () => {
    expect(opLines(0, [0, 0, 0.5])).toEqual(['a₀ = 0', 'a = (0, 0, 0.5)'])
    for (const l of opLines(-1.25, [0.5, -0.25, 1])) expect(l).not.toMatch(/\u20d7/) // no combining arrow in mono chrome
    expect(short(-0.25)).toBe('−0.25')
    expect(short(1)).toBe('1')
    expect(eigReadout([0.5, -0.5], [0, 0, 0.5])).toBe('λ = +0.5, −0.5')
    expect(eigReadout([1, 1], [0, 0, 0])).toBe('λ = 1 (all states)')
  })
  it('names the class: S_z is Hermitian; σ_z is also unitary and squares to I; (I+σ_z)/2 is a projector', () => {
    expect(classReadout(cls(0, [0, 0, 0.5]))).toBe('Hermitian')
    expect(classReadout(cls(0, [0, 0, 1]))).toBe('Hermitian · unitary · squares to I')
    expect(classReadout(cls(0.5, [0, 0, 0.5]))).toContain('projector')
  })
  it('halves the drawing only when an arrow would leave the frame', () => {
    expect(drawScale([1])).toBe(1)
    expect(drawScale([1, 1.8])).toBe(0.5)
  })
})
