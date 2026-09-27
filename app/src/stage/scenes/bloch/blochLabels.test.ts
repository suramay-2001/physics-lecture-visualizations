import { describe, expect, it } from 'vitest'
import { KET, Rz } from '../../../physics/spin'
import { apply } from '../../../physics/linalg'
import { axisName, blochReadout, ketLines } from './blochLabels'

describe('Bloch sphere readouts', () => {
  it('names coordinate axes (either sign) and nothing else', () => {
    expect(axisName([0, 0, 1])).toBe('z')
    expect(axisName([-1, 0, 0])).toBe('x')
    expect(axisName([0.6, 0.8, 0])).toBeNull()
  })
  it('says what the beat is about, in priority: measurement, rotation, phase, state', () => {
    expect(blochReadout({ pPlus: 0.8535533905932737, rot: null, globalPhase: 0 })).toBe('P(+) along n̂ = 0.854')
    expect(blochReadout({ pPlus: null, rot: { axis: [0, 0, 1], angle: Math.PI / 2 }, globalPhase: 0 })).toBe('rotation Rz(90°)')
    expect(blochReadout({ pPlus: null, rot: null, globalPhase: Math.PI })).toBe('phase 180° · same point')
    expect(blochReadout({ pPlus: null, rot: null, globalPhase: 0 })).toBe('pure state')
  })
  it('shows the ket, so the sign after a full turn is visible', () => {
    expect(ketLines(KET['+z'])).toEqual(['ψ₁ = 1', 'ψ₂ = 0'])
    expect(ketLines(apply(Rz(2 * Math.PI), KET['+z']))).toEqual(['ψ₁ = −1', 'ψ₂ = 0']) // same point, opposite sign
    expect(ketLines(KET['+y'])).toEqual(['ψ₁ = 1/√2', 'ψ₂ = i/√2'])
    expect(ketLines(KET['-y'])).toEqual(['ψ₁ = 1/√2', 'ψ₂ = −i/√2'])
    expect(ketLines(apply(Rz(Math.PI / 2), KET['+x']))).toEqual(['ψ₁ = 1/2 − i/2', 'ψ₂ = 1/2 + i/2'])
    for (const l of ketLines(apply(Rz(0.9), KET['+x']))) expect(l.length).toBeLessThanOrEqual(22) // fits the column
  })
})
