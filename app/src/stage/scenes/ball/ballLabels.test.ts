import { describe, expect, it } from 'vitest'
import { PASSPORT } from '../../../content/stage'
import { BALL_AXES, ballReadout, compareLabel, pointKind } from './ballLabels'

describe('bloch-ball wording', () => {
  it('pure on the surface, mixtures inside or at the centre', () => {
    expect(pointKind(1)).toBe('pure')
    expect(pointKind(0.999)).toBe('mixture')
    expect(ballReadout(1, 1)).toBe('pure: surface · Tr ρ² 1.00')
    expect(ballReadout(0, 0.5)).toBe('mixture: centre · Tr ρ² 0.50')
    expect(ballReadout(Math.SQRT1_2, 0.75)).toBe('mixture: inside · Tr ρ² 0.75')
  })
  it('shows Tr ρ² only when the beat shows purity; stays short for split stages', () => {
    expect(ballReadout(1, 1, false)).toBe('pure: surface · |r| 1.00')
    for (const r of [0, 0.5, 1]) expect(ballReadout(r, (1 + r * r) / 2).length).toBeLessThanOrEqual(28)
  })
  it('names the comparison ring', () => {
    expect(compareLabel([0, 0, 0])).toBe('oven: mixture')
    expect(compareLabel([0, 0, 0.4])).toBe('mixture')
  })
  it('never calls a mixture "partly up"', () => {
    for (const r of [0, 0.3, 0.9]) expect(ballReadout(r, (1 + r * r) / 2)).not.toMatch(/partly|up|down/i)
  })
  it('axes are expectation values, and the passport says it is not a place', () => {
    expect(BALL_AXES).toEqual(['⟨σx⟩', '⟨σy⟩', '⟨σz⟩'])
    expect(JSON.stringify(PASSPORT['bloch-ball'])).toMatch(/not a place/)
  })
})
