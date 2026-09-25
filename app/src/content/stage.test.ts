import { describe, expect, it } from 'vitest'
import { BEAT_ID_RE, beatLayout, checkBeatIds, layoutSlots, mainKind, passportOf, type Beat, type StageState } from './stage'

const lab: StageState = { kind: 'lab-r3', benches: [{ id: 'main', source: 'oven', devices: [{ axis: 'z' }] }] }
const plane: StageState = { kind: 'hilbert-plane', psi: '+x' }

describe('beat ids (decision #24: letter suffix for split beats)', () => {
  it('accepts b1…bn and lettered groups b5a, b5b', () => {
    expect(BEAT_ID_RE.test('l1-quantized:b5a')).toBe(true)
    expect(BEAT_ID_RE.test('l1-vectors:b7')).toBe(true)
    expect(BEAT_ID_RE.test('l1-vectors:b0')).toBe(false)
    expect(BEAT_ID_RE.test('L1:b1')).toBe(false)
    const ids = ['b1', 'b2', 'b3', 'b4', 'b5a', 'b5b', 'b6'].map((b) => `l1-quantized:${b}`)
    expect(checkBeatIds('l1-quantized', ids)).toEqual([])
  })

  it('rejects gaps, repeats, out-of-order letters, lone letters and a wrong prefix', () => {
    const at = (bs: string[], unit = 'u') => checkBeatIds(unit, bs.map((b) => `${unit}:${b}`))
    expect(at(['b1', 'b3']).join()).toMatch(/expected b2/)
    expect(at(['b1', 'b1']).join()).toMatch(/repeats b1/)
    expect(at(['b1', 'b2a', 'b2c']).join()).toMatch(/lettered a, b/)
    expect(at(['b1', 'b2b']).join()).toMatch(/starts at 'a'/)
    expect(at(['b1', 'b2a', 'b3']).join()).toMatch(/without a sibling/)
    expect(checkBeatIds('u', ['v:b1']).join()).toMatch(/prefix/)
  })
})

describe('layouts, passports, reveals', () => {
  it('split stacks top/bottom, inset keeps main first; the main kind leads the stage colour', () => {
    expect(layoutSlots({ layout: 'split', top: lab, bottom: plane }).map((s) => s.slot)).toEqual(['top', 'bottom'])
    expect(mainKind({ layout: 'inset', main: plane, inset: lab })).toBe('hilbert-plane')
  })

  it('passport comes from the kind; optical and Poincaré variants change the space', () => {
    expect(passportOf(lab).title).toMatch(/^PHYSICAL SPACE/)
    expect(passportOf({ ...lab, variant: 'optical' } as StageState).fidelityKey).toBe('optical')
    expect(passportOf({ kind: 'bloch', state: '+z', labels: 'poincare' }).fidelityKey).toBe('poincare')
  })

  it('a clue shows its question picture until revealed (decision #17)', () => {
    const b: Beat = { id: 'u:b1', phase: 'clue', text: 'q?', stage: plane, reveal: { text: 'a', stage: lab } }
    expect(beatLayout(b, false)).toBe(plane)
    expect(beatLayout(b, true)).toBe(lab)
    expect(beatLayout({ ...b, reveal: { text: 'a' } }, true)).toBe(plane)
  })
})
