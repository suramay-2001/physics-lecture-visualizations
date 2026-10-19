/**
 * Townsend's recombining device (Fig. 1.4; 448 Townsend pass, plan G1 V1.1): `LabDevice.merge` resolves to the engine's identity
 * (sg.ts `Bench.merge`), validates, lays out a straight module with a hidden stop, and keeps the segment chip of the beam it leaves alone.
 */
import { describe, expect, it } from 'vitest'
import type { LabDevice, LabState } from '../content/schema'
import { benchLayout, LAB } from './scenes/lab/layout'
import { interpolate } from './interp'
import { resolve, validateStage } from './resolve'
import type { ResolvedLab } from './types'

const exp4: LabState = {
  kind: 'lab-r3',
  benches: [{ id: 'main', source: '+z', showPrep: true, devices: [{ axis: 'x', merge: true }, { axis: 'z' }] }],
  readouts: ['fractions'],
  flow: 'stream',
  shot: 'L-PLATE',
}
const exp3: LabState = { ...exp4, benches: [{ id: 'main', source: '+z', showPrep: true, devices: [{ axis: 'x', keep: '+' }, { axis: 'z' }] }] }
const lab = (st: LabState, s = 0.5) => resolve(st, s) as ResolvedLab

describe('LabDevice.merge', () => {
  it('Experiment 4 reads every atom up again; Experiment 3 splits the plate 1/4 and 1/4 of the beam', () => {
    const a = lab(exp4).benches[0]
    expect(a.theory.plus).toBeCloseTo(1, 12)
    expect(a.theory.minus).toBeCloseTo(0, 12)
    expect(a.theory.blocked[0]).toBe(0)
    expect(a.merge).toEqual([true, false])
    const b = lab(exp3).benches[0]
    expect(b.theory.plus).toBeCloseTo(0.25, 12)
    expect(b.theory.minus).toBeCloseTo(0.25, 12)
    expect(b.merge).toEqual([false, false])
  })

  it('the chip after the merged device is the chip before it (the state is untouched)', () => {
    const a = lab(exp4).benches[0]
    expect(a.chips[1]).toBe(a.chips[0])
  })

  it('validates: not on the last device, not with keep or openOther, one per bench, a prepared source', () => {
    expect(validateStage(exp4)).toEqual([])
    const mk = (devices: LabDevice[], source: 'oven' | '+z' = '+z'): LabState => ({ ...exp4, benches: [{ id: 'main', source, devices }] })
    expect(validateStage(mk([{ axis: 'x', keep: '+' }, { axis: 'z', merge: true }])).join(' ')).toMatch(/cannot be last/)
    expect(validateStage(mk([{ axis: 'x', merge: true, keep: '+' }, { axis: 'z' }])).join(' ')).toMatch(/takes no 'keep'/)
    expect(validateStage(mk([{ axis: 'x', merge: true, openOther: true }, { axis: 'z' }])).join(' ')).toMatch(/takes no 'keep'/)
    expect(validateStage(mk([{ axis: 'x', merge: true }, { axis: 'z', merge: true }, { axis: 'x' }])).join(' ')).toMatch(/at most one/)
    expect(validateStage(mk([{ axis: 'x', merge: true }, { axis: 'z' }], 'oven')).join(' ')).toMatch(/prepared source/)
  })

  it('lays the merged module out straight, with a hidden stop that keeps the indices aligned', () => {
    const L = benchLayout([0, Math.PI / 2, 0], ['+', '+'], { merge: [false, true, false] })
    expect(L.modules[1].merged).toBe(true)
    expect(L.modules[1].k).toBe(0)
    expect(L.stops[1].hidden).toBe(true)
    expect(L.stops[0].hidden).toBeUndefined()
    // the module after a merged one sits on the straight axis: in the merged module's own frame its entrance is (0, spacing, 0)
    const rel = L.modules[2].entrance.clone().applyMatrix4(L.modules[1].base.clone().invert())
    expect(Math.abs(rel.x)).toBeLessThan(1e-9)
    expect(Math.abs(rel.z)).toBeLessThan(1e-9)
    expect(rel.y).toBeCloseTo(LAB.spacing, 9)
  })

  it('a bench with and without merge is a different topology: the in-between frame switches at the half-way point', () => {
    const f0 = interpolate(lab(exp3, 0), lab(exp4, 0), 0.25) as ResolvedLab
    const f1 = interpolate(lab(exp3, 0), lab(exp4, 0), 0.75) as ResolvedLab
    expect(f0.benches[0].merge).toEqual([false, false])
    expect(f1.benches[0].merge).toEqual([true, false])
  })
})
