import { describe, expect, it } from 'vitest'
import { L1 } from '../content/L1'
import { chapterCount, chapterSteps, stepId, whereAt } from './chapters'

describe('lecture chapters (Phase 4a navigation)', () => {
  it('names the existing order of every L1 unit (all have stories)', () => {
    for (const u of L1.units) {
      const keys = chapterSteps(u).map((s) => s.key)
      expect(keys.slice(0, 3)).toEqual(['story', 'try', 'intuition'])
      expect(keys.includes('play')).toBe(u.play.length > 0)
      expect(keys.includes('takeaway')).toBe(!!u.review)
    }
  })
  it('gives unique anchor ids and a zero-padded counter', () => {
    const ids = L1.units.flatMap((u) => chapterSteps(u).map((s) => stepId(u.id, s.key)))
    expect(new Set(ids).size).toBe(ids.length)
    expect(chapterCount(1, 5)).toBe('02 / 05')
    expect(chapterCount(9, 12)).toBe('10 / 12')
  })
  it('locates the reader: unit, fraction and step from the line', () => {
    const units = [
      { top: 100, bottom: 500 },
      { top: 600, bottom: 1000 },
    ]
    const steps = [
      [100, 300],
      [600, 700, 900],
    ]
    expect(whereAt(50, units, steps)).toEqual({ unit: -1, frac: 0, step: -1, stepFrac: 0 })
    expect(whereAt(300, units, steps)).toEqual({ unit: 0, frac: 0.4, step: 1, stepFrac: 0 })
    expect(whereAt(450, units, steps)).toMatchObject({ unit: 0, step: 1, stepFrac: 0.5 }) // step 1 runs 300 → 600
    expect(whereAt(550, units, steps).unit).toBe(0) // in the gap: still unit 0, nearly done
    expect(whereAt(800, units, steps)).toEqual({ unit: 1, frac: 0.5, step: 1, stepFrac: 0.5 })
    expect(whereAt(2000, units, steps)).toEqual({ unit: 1, frac: 1, step: 2, stepFrac: 1 })
  })
})
