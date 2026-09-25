import { describe, expect, it } from 'vitest'
import type { Beat } from '../content/stage'
import { isRevealed, registerView, releaseUnit, setBeat, setRevealed, setScroll, stage, trackUnit } from './store'

const beats: Beat[] = [
  { id: 'x:b1', phase: 'lecture', text: 'a', stage: { kind: 'hilbert-plane' } },
  { id: 'x:b2', phase: 'clue', text: 'b?', stage: { kind: 'hilbert-plane' }, reveal: { text: 'because' } },
]

describe('stage store (StrictMode-safe)', () => {
  it('track → release → track in the same tick returns the same object; a real release deletes it', async () => {
    const a = trackUnit('x', beats)
    releaseUnit('x')
    const b = trackUnit('x', beats)
    expect(b).toBe(a)
    releaseUnit('x')
    await new Promise((r) => setTimeout(r, 5))
    expect(stage.units.has('x')).toBe(false)
  })

  it('setBeat clamps and notifies only on change; setScroll derives the beat from uRaw', () => {
    const t = trackUnit('y', beats)
    setBeat(t, 5)
    expect(t.beat).toBe(1)
    setScroll(t, 0.4)
    expect(t.beat).toBe(0)
    expect(t.u).toBe(0.4)
    releaseUnit('y')
  })

  it('reveals only exist on beats with a reveal; registerView is idempotent', () => {
    trackUnit('z', beats)
    setRevealed('z', 0, true)
    expect(isRevealed('z', 0)).toBe(false)
    setRevealed('z', 'x:b2', true)
    expect(isRevealed('z', 1)).toBe(true)
    const off1 = registerView('z', 'hilbert-plane')
    const off2 = registerView('z', 'hilbert-plane')
    expect([...stage.views.keys()].filter((k) => k === 'z/hilbert-plane').length).toBe(1)
    off1()
    off2()
    expect(stage.views.has('z/hilbert-plane')).toBe(false)
    releaseUnit('z')
  })
})
