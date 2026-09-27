/**
 * `spinlab.qc709.track.v1` (ui/trackPref.ts): semi-trusted storage and an untrusted `?track=` query. Only a track the
 * course offers is ever returned; anything else is Ground-up (storage) or ignored (the URL). 448 has one track.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

class FakeStorage {
  data = new Map<string, string>()
  constructor(seed?: Record<string, string>) {
    for (const [k, v] of Object.entries(seed ?? {})) this.data.set(k, v)
  }
  getItem(k: string) {
    return this.data.has(k) ? this.data.get(k)! : null
  }
  setItem(k: string, v: string) {
    this.data.set(k, String(v))
  }
  removeItem(k: string) {
    this.data.delete(k)
  }
}

async function boot(storage: unknown) {
  vi.resetModules()
  vi.stubGlobal('localStorage', storage)
  return import('./trackPref')
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

const KEY = 'spinlab.qc709.track.v1'

describe('track pref: hostile storage', () => {
  it.each([
    ['unknown track', 'advanced'],
    ['JSON', '{"track":"formal"}'],
    ['padded', ' formal'],
    ['upper case', 'FORMAL'],
    ['prototype key', '__proto__'],
    ['oversized', 'formal'.repeat(1000)],
  ])('%s → Ground-up', async (_, raw) => {
    const m = await boot(new FakeStorage({ [KEY]: raw }))
    expect(m.getTrack('qc709')).toBe('ground')
  })
  it('a valid stored choice is read; storage that throws means Ground-up', async () => {
    expect((await boot(new FakeStorage({ [KEY]: 'formal' }))).getTrack('qc709')).toBe('formal')
    const throwing = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
      removeItem() {
        throw new Error('blocked')
      },
    }
    const m = await boot(throwing)
    expect(m.getTrack('qc709')).toBe('ground')
    m.setTrack('qc709', 'formal') // blocked storage: the choice still holds for this visit
    expect(m.getTrack('qc709')).toBe('formal')
  })
  it('448 is always Ground-up, whatever is stored or asked for', async () => {
    const m = await boot(new FakeStorage({ 'spinlab.sl448.track.v1': 'formal' }))
    expect(m.getTrack('sl448')).toBe('ground')
    m.setTrack('sl448', 'formal')
    expect(m.getTrack('sl448')).toBe('ground')
    expect(m.trackFromSearch('sl448', '?track=formal')).toBeNull()
  })
  it('setTrack stores only valid tracks, and Ground-up clears the key', async () => {
    const s = new FakeStorage()
    const m = await boot(s)
    m.setTrack('qc709', 'formal')
    expect(s.data.get(KEY)).toBe('formal')
    m.setTrack('qc709', 'bogus' as never)
    expect(s.data.get(KEY)).toBe('formal')
    m.setTrack('qc709', 'ground')
    expect(s.data.has(KEY)).toBe(false)
  })
})

describe('track pref: the ?track= override', () => {
  it.each([
    ['?track=formal', 'formal'],
    ['?at=q0-a:b2&track=ground&f=0.5', 'ground'],
    ['?track=Formal', null],
    ['?track=formal%00', null],
    ['?track=javascript:alert(1)', null],
    ['?track=', null],
    ['?tracks=formal', null],
    ['', null],
  ])('%s → %s', async (search, want) => {
    const m = await boot(new FakeStorage())
    expect(m.trackFromSearch('qc709', search)).toBe(want)
  })
})
