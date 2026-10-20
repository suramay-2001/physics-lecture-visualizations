/**
 * Lecture 1's which-path cases (review A, B1): the three ways the Experiment 3 / 4 bench can be arranged, and the
 * wording that states them. With the path recorded and both beams kept the last z magnet sends 1/2 of the beam down;
 * with one path blocked, 1/4 of the incoming beam; with the beams recombined and nothing recorded, none.
 */
import { describe, expect, it } from 'vitest'
import { benchTheory } from '../physics/sg'
import { L1 } from './L1'
import { V } from './L1.values'

const beats = L1.units.flatMap((u) => u.story ?? [])
const merged = beats.find((b) => b.id === 'l1-sequential:b5b')!

describe('Lecture 1: recorded, blocked and merged paths (B1)', () => {
  it('the engine gives 0 merged, 1/4 with one path blocked, 1/2 with the path recorded and both beams kept', () => {
    const blocked = benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['+'] }).minus
    const other = benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['-'] }).minus
    expect(V.l1TnExp4Down).toBeCloseTo(0, 12)
    expect(V.l1TnExp3Down).toBeCloseTo(blocked, 12)
    expect(V.l1TnExp3Down).toBeCloseTo(0.25, 12)
    expect(V.l1TnExp3Both).toBeCloseTo(blocked + other, 12)
    expect(V.l1TnExp3Both).toBeCloseTo(0.5, 12)
  })
  it('the merged-beam beat states all three cases and ties 1/4 to the blocked path, never to a recorded one', () => {
    const t = merged.text
    expect(t).toMatch(/Record the path but keep both beams, and \$\\tfrac\{1\}\{2\}\$ of the beam reads down/)
    expect(t).toMatch(/Block one path \(Experiment 3\) and a share \$\\tfrac\{1\}\{4\}\$ of the beam reads down/)
    expect(t).not.toMatch(/recorded, a share/)
    expect((merged.claims ?? []).map((c) => c.text.split(' · ')[0])).toEqual(expect.arrayContaining(['l1TnExp3Down', 'l1TnExp3Both']))
  })
  it('the formula board prints the blocked case as 1/4 and the recorded, both-kept case as 1/2', () => {
    const eq = L1.units.find((u) => u.id === 'l1-sequential')!.lecture.equations.join('\n')
    expect(eq).toContain('\\text{one path blocked}) = \\tfrac{1}{4}')
    expect(eq).toContain('\\text{path recorded, both beams kept}) = \\tfrac{1}{2}')
    expect(eq).not.toContain('\\text{path recorded}) = \\tfrac{1}{4}')
  })
})
