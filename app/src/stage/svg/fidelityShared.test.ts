/**
 * The SVG kinds' fidelity notes are shared (W-448 #5, rulings 448-L8L11 P6 and L10 R6). This file imports ONLY the kinds'
 * registration module and the lookup, never content/fidelity.svg.ts or the 709 pack, so it proves the path a 448 page
 * takes: loading the SVG kinds' chunk registers their notes, and a 448 passport's drawer is never empty for them.
 */
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import { STAGE_KINDS_448, STAGE_KINDS_709 } from '../../content/stage'

describe('before the SVG kinds load, 448 has only its own six drawers', () => {
  it('an SVG kind’s drawer is empty until its chunk has registered the notes', () => {
    for (const k of STAGE_KINDS_709) expect(fidelityOf(k), k).toEqual({ exact: [], schematic: [], misleading: [] })
    for (const k of STAGE_KINDS_448) expect(fidelityOf(k).exact.length, k).toBeGreaterThan(0)
  })
})

describe('after the SVG kinds load (a lecture that draws one is on the page)', () => {
  it('every SVG kind has a drawer for a 448 page, the same one a 709 page shows; 448’s own six are untouched', async () => {
    const before = STAGE_KINDS_448.map((k) => fidelityOf(k))
    await import('./kinds')
    for (const k of [...STAGE_KINDS_709, 'amplitudes-bell' as const]) {
      const f = fidelityOf(k)
      expect([f.exact.length, f.schematic.length, f.misleading.length].every((n) => n > 0), k).toBe(true)
      expect(fidelityOf(k, 'sl448'), k).toBe(f)
      expect(fidelityOf(k, 'qc709'), k).toBe(f) // no 709 pack loaded here: the shared module alone serves both courses
    }
    expect(STAGE_KINDS_448.map((k) => fidelityOf(k))).toEqual(before)
    // the 709-only variant stays out of 448's space
    expect(fidelityOf('plane-photon')).toEqual({ exact: [], schematic: [], misleading: [] })
  })
})
