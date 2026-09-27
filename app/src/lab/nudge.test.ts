import { describe, expect, it } from 'vitest'
import { c } from '../physics/complex'
import { cnum, degText, ketText, matRows, signed, turnText, vec3, withUnit } from './format'
import { nudgeOf } from './nudge'

describe('keyboard twins of the drag handles', () => {
  it('1 axis: ← ↓ decrease, → ↑ increase; Shift is the fine step', () => {
    expect(nudgeOf('ArrowLeft', 1)).toEqual({ axis: 0, dir: -1, fine: false })
    expect(nudgeOf('ArrowDown', 1)).toEqual({ axis: 0, dir: -1, fine: false })
    expect(nudgeOf('ArrowUp', 1, true)).toEqual({ axis: 0, dir: 1, fine: true })
    expect(nudgeOf('PageUp', 1)).toBeNull()
  })
  it('2 and 3 axes: ← → first, ↓ ↑ second, Page Down / Page Up third (3 only)', () => {
    expect(nudgeOf('ArrowRight', 2)).toEqual({ axis: 0, dir: 1, fine: false })
    expect(nudgeOf('ArrowUp', 2)).toEqual({ axis: 1, dir: 1, fine: false })
    expect(nudgeOf('PageUp', 2)).toBeNull()
    expect(nudgeOf('PageDown', 3, true)).toEqual({ axis: 2, dir: -1, fine: true })
    expect(nudgeOf('a', 3)).toBeNull()
  })
})

describe('lab readout formatting', () => {
  it('complex amplitudes in exact form, a real minus', () => {
    expect(cnum(c(Math.SQRT1_2, 0))).toBe('1/√2')
    expect(cnum(c(0, -0.5))).toBe('−i/2')
    expect(cnum(c(0.25, 0.3))).toBe('1/4 + 0.30i')
    expect(ketText([c(Math.SQRT1_2), c(0, Math.SQRT1_2)])).toBe('(1/√2, i/√2)')
  })
  it('signs, vectors, degrees, turns, units', () => {
    expect(signed(0.5)).toBe('+0.5')
    expect(signed(-0.5)).toBe('−0.5')
    expect(signed(1e-9)).toBe('0')
    expect(vec3([0.5, -0.25, 0])).toBe('(0.5, −0.25, 0)')
    expect(degText(-Math.PI / 2)).toBe('−90°')
    expect(degText(-1e-12)).toBe('0°')
    expect(turnText(Math.PI / 2)).toBe('90°')
    expect(turnText(2 * Math.PI)).toBe('360° (1 lap)')
    expect(turnText(4.5 * Math.PI)).toBe('810° (2 laps + 90°)')
    expect(withUnit('0.5', 'hbar')).toBe('0.5 ħ')
    expect(withUnit('0', 'hbar')).toBe('0')
    expect(withUnit('0.5', 'none')).toBe('0.5')
  })
  it('matrix rows are aligned by column', () => {
    expect(matRows([[c(0), c(0, -0.5)], [c(0, 0.5), c(0)]])).toEqual(['[ 0    −i/2 ]', '[ i/2  0    ]'])
  })
})
