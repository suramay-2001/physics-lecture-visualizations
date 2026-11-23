/**
 * camera-frame B5 additions (P-B5-story §9.2): the 'learned' filter (population least squares, physics/readout/classify.ts), the 'rf' panel (the receptive field of a stack) and `layers`.
 */
import { describe, expect, it } from 'vitest'
import type { CameraFrameState } from '../../content/stage'
import { resolve, validateStage } from '../resolve'
import './kinds'
import type { ResolvedCameraFrame } from '../types'

const R = (st: CameraFrameState) => resolve(st, 1) as ResolvedCameraFrame
const problems = (st: unknown): string[] => validateStage(st as CameraFrameState)

describe('camera-frame: B5 additions (the learned filter, the receptive-field panel, layers)', () => {
  const two: CameraFrameState = { kind: 'camera-frame', rows: 5, cols: 7, sites: [[2, 2], [2, 4]], photons: 20, psf: 0.9, background: 0.4, roi: { size: 5 }, panel: [{ show: 'weights', filter: 'learned' }] }
  const alone: CameraFrameState = { ...two, sites: [[2, 2]] }
  it('the learned weights are the engine’s population filter: positive for an isolated atom, negative on a close neighbour’s pixels', () => {
    const w = R(two).panels[0].values
    const a = R(alone).panels[0].values
    expect(Math.max(...w)).toBeCloseTo(1, 12)
    expect(w[2 * 7 + 4]).toBeLessThan(0) // the neighbour’s centre, inside the ROI (columns 0 to 4)
    expect(a[2 * 7 + 4]).toBeGreaterThan(0)
    expect(R(two).panels[0].lo).toBeLessThan(0)
  })
  it('the receptive field panel is a box of the stack’s receptive field around the first atom, clipped to the frame', () => {
    const r = R({ kind: 'camera-frame', rows: 10, cols: 10, sites: [[4, 4]], photons: 20, psf: 0.9, background: 0.4, panel: [{ show: 'rf' }], layers: [3, 3, 3] })
    expect(r.panels[0].title).toBe('receptive field · 7×7')
    expect(r.panels[0].values.reduce((a, b) => a + b, 0)).toBe(49)
    const edge = R({ kind: 'camera-frame', rows: 10, cols: 10, sites: [[0, 0]], panel: [{ show: 'rf' }], layers: [3, 3, 3] })
    expect(edge.panels[0].values.reduce((a, b) => a + b, 0)).toBe(16)
  })
  it('validation: learned needs an atom and a ROI; layers need an rf panel and odd kernel sizes; an rf panel needs layers', () => {
    expect(problems(two)).toEqual([])
    expect(problems({ ...two, roi: undefined }).join()).toContain('learned filter needs an atom and a region of interest')
    expect(problems({ kind: 'camera-frame', rows: 6, cols: 6, sites: [[2, 2]], panel: [{ show: 'rf' }], layers: [3, 3] })).toEqual([])
    expect(problems({ kind: 'camera-frame', rows: 6, cols: 6, sites: [[2, 2]], panel: [{ show: 'rf' }] }).join()).toContain("'rf' panel needs layers")
    expect(problems({ kind: 'camera-frame', rows: 6, cols: 6, sites: [[2, 2]], panel: [{ show: 'photons' }], layers: [3] }).join()).toContain("only with an 'rf' panel")
    expect(problems({ kind: 'camera-frame', rows: 6, cols: 6, sites: [[2, 2]], panel: [{ show: 'rf' }], layers: [2, 4] }).join()).toContain('odd kernel sizes')
  })
})
