import { describe, expect, it } from 'vitest'
import { L1_STORY } from '../../../content/L1.story'
import { layoutStates } from '../../../content/stage'
import { resolve } from '../../resolve'
import type { ResolvedLab } from '../../types'

// Round 3 #15: every l1-logic beat that shows truth tallies reads the proposition "up OR right" per order:
// z-first is never false, x-first is false 1/4 of the time. These are the numbers the lab readout prints.
describe('l1-logic truth readout', () => {
  const beats = L1_STORY['l1-logic'].filter((b) => {
    const s = layoutStates(b.stage).find((x) => x.kind === 'lab-r3')
    return s && s.kind === 'lab-r3' && s.readouts?.some((r) => r === 'truth-table' || r === 'tally-bars')
  })

  it('covers the tally beats', () => {
    expect(beats.length).toBeGreaterThanOrEqual(3)
  })

  it.each(beats.map((b) => [b.id, b] as const))('%s: z-first false 0, x-first false 1/4', (_, beat) => {
    const st = layoutStates(beat.stage).find((x) => x.kind === 'lab-r3')!
    const r = resolve(st as never, 1) as ResolvedLab
    expect(r.tallies).toHaveLength(2)
    expect(r.tallies![0].false).toBeCloseTo(0, 12)
    expect(r.tallies![1].false).toBeCloseTo(0.25, 12)
    for (const t of r.tallies!) expect(t.true + t.false).toBeCloseTo(1, 12)
  })
})
