import { describe, expect, it } from 'vitest'
import type { Beat } from '../content/stage'
import { derivOverrideVersion, isRevealed, registerView, releaseUnit, setBeat, setDerivOverride, setRevealed, setScroll, stage, trackUnit } from './store'

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

  it('setDerivOverride (W-709 #11): idempotent on the same target, cross-fades from the previous one, cleared by setBeat', () => {
    const t = trackUnit('w', beats)
    const viewA = { kind: 'bloch', state: '+z' } as const
    const viewB = { kind: 'bloch', state: '-z' } as const
    expect(t.derivFrom).toBeNull()
    expect(t.derivTo).toBeNull()
    expect(t.derivMix).toBe(1)
    const v0 = derivOverrideVersion()

    // selecting a view starts a fade from null (no previous override) and bumps the version
    setDerivOverride('w', { layout: viewA, caption: 'A' })
    expect(t.derivFrom).toBeNull()
    expect(t.derivTo).toBe(viewA)
    expect(t.derivCaption).toBe('A')
    expect(t.derivMix).toBe(0) // stage.motion defaults true: fades in, does not snap
    expect(derivOverrideVersion()).toBe(v0 + 1)

    // the SAME target (reference equality) is a no-op: no new fade, no version bump
    setDerivOverride('w', { layout: viewA, caption: 'A' })
    expect(t.derivMix).toBe(0)
    expect(derivOverrideVersion()).toBe(v0 + 1)

    // a different target fades FROM the one just showing
    t.derivMix = 1 // pretend the first fade had settled
    setDerivOverride('w', { layout: viewB, caption: 'B' })
    expect(t.derivFrom).toBe(viewA)
    expect(t.derivTo).toBe(viewB)
    expect(t.derivMix).toBe(0)
    expect(derivOverrideVersion()).toBe(v0 + 2)

    // leaving the beat (setBeat to a different index) always returns to the beat-driven state
    setBeat(t, 1)
    expect(t.derivFrom).toBeNull()
    expect(t.derivTo).toBeNull()
    expect(t.derivCaption).toBeUndefined()
    expect(t.derivMix).toBe(1)

    // null clears an active override the same way (used when a step has no view / "Show all")
    setDerivOverride('w', { layout: viewA })
    setDerivOverride('w', null)
    expect(t.derivTo).toBeNull()
    releaseUnit('w')
  })
})
