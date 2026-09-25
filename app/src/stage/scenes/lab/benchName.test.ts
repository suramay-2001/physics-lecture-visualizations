import { describe, expect, it } from 'vitest'
import { benchName } from '../LabR3Scene'

// Round 3 #14: "z-first / x-first" names measurement orders, which only the logic unit's truth tallies have.
describe('two-bench tag', () => {
  it('names orders only when the beat shows truth tallies', () => {
    expect(benchName({ readouts: ['truth-table'] }, { source: '+z' }, 0)).toBe('z-first')
    expect(benchName({ readouts: ['tally-bars'] }, { source: '+z' }, 1)).toBe('x-first')
  })
  it('names each bench by its source everywhere else (l1-vectors:b7)', () => {
    expect(benchName({ readouts: ['fractions'] }, { source: '+x' }, 0)).toBe('|+x⟩ beam')
    expect(benchName({ readouts: [] }, { source: 'oven' }, 1)).toBe('oven beam')
    expect(benchName({ readouts: [] }, { source: '-y' }, 0)).toBe('|−y⟩ beam')
  })
})
