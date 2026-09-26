import { describe, expect, it } from 'vitest'
import { benchName, signed } from '../LabR3Scene'

const deg = (d: number) => (d * Math.PI) / 180
const two = (a: '+x' | '+z' | 'oven' | '-y', b: '+x' | '+z' | 'oven' | '-y') => [{ source: a }, { source: b }]

// Round 3 #14: "z-first / x-first" names measurement orders, which only the logic unit's truth tallies have.
describe('two-bench tag', () => {
  it('names orders only when the beat shows truth tallies', () => {
    expect(benchName({ readouts: ['truth-table'], benches: two('+z', '+z') }, { source: '+z', tilts: [0, deg(90)] }, 0)).toBe('z-first')
    expect(benchName({ readouts: ['tally-bars'], benches: two('+z', '+z') }, { source: '+z', tilts: [deg(90), 0] }, 1)).toBe('x-first')
  })
  it('names each bench by its source when the sources differ (l1-vectors:b7)', () => {
    expect(benchName({ readouts: ['fractions'], benches: two('+x', 'oven') }, { source: '+x', tilts: [0] }, 0)).toBe('|+x⟩ beam')
    expect(benchName({ readouts: [], benches: two('+x', 'oven') }, { source: 'oven', tilts: [0] }, 1)).toBe('oven beam')
    expect(benchName({ readouts: [], benches: [{ source: '-y' }] }, { source: '-y', tilts: [0] }, 0)).toBe('|−y⟩ beam')
  })
  it('names same-source benches by their measurement sequence (l1-logic:b5)', () => {
    expect(benchName({ readouts: [], benches: two('+z', '+z') }, { source: '+z', tilts: [0, deg(90)] }, 0)).toBe('z → x')
    expect(benchName({ readouts: [], benches: two('+z', '+z') }, { source: '+z', tilts: [deg(90), 0] }, 1)).toBe('x → z')
  })
})

describe('signed readout numbers', () => {
  it('uses a real minus sign and never shows −0.000', () => {
    expect(signed(-0.0004)).toBe('0.000')
    expect(signed(-0.707)).toBe('−0.707')
    expect(signed(0.707)).toBe('0.707')
  })
})
