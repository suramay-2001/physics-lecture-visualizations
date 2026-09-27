/**
 * `courses.last.v1` (ui/lastPlace.ts): semi-trusted storage, like the progress store. Whatever is stored, the switcher
 * only ever sees ids that pass their course's rules, and so only ever builds an in-app chapter link.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

const KEY = 'spinlab.courses.last.v1'

class FakeStorage {
  data = new Map<string, string>()
  constructor(seed?: string) {
    if (seed !== undefined) this.data.set(KEY, seed)
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
  return import('./lastPlace')
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('last place per course: hostile storage', () => {
  it.each([
    ['not JSON', '{"sl448":'],
    ['array', '[{"chapter":"L3"}]'],
    ['null', 'null'],
    ['a URL for a chapter', '{"sl448":{"chapter":"https://evil.example/"}}'],
    ['a path for a chapter', '{"sl448":{"chapter":"../../lab"}}'],
    ['709 id in 448', '{"sl448":{"chapter":"Q3"}}'],
    ['448 id in 709', '{"qc709":{"chapter":"L3"}}'],
    ['__proto__ course', '{"__proto__":{"chapter":"L3"}}'],
    ['unknown course', '{"ph999":{"chapter":"L3"}}'],
    ['oversized', JSON.stringify({ sl448: { chapter: 'L3', pad: 'x'.repeat(2000) } })],
  ])('%s → no place', async (_n, raw) => {
    const m = await boot(new FakeStorage(raw))
    expect(m.getPlaces()).toEqual({})
  })

  it('a unit must belong to its chapter; a bad unit is dropped, the chapter kept', async () => {
    const m = await boot(new FakeStorage('{"sl448":{"chapter":"L3","unit":"l4-other"},"qc709":{"chapter":"Q4","unit":"q4-gates"}}'))
    expect(m.getPlaces()).toEqual({ sl448: { chapter: 'L3' }, qc709: { chapter: 'Q4', unit: 'q4-gates' } })
    expect(m.sanitizePlaces({ sl448: { chapter: 'L3', unit: 'l3-x"><script>' } })).toEqual({ sl448: { chapter: 'L3' } })
  })

  it('storage that throws still works for the visit', async () => {
    const m = await boot({
      getItem() {
        throw new Error('SecurityError')
      },
      setItem() {
        throw new Error('QuotaExceededError')
      },
    })
    expect(m.getPlaces()).toEqual({})
    m.rememberPlace('L5', 'l5-basis')
    expect(m.getPlaces()).toEqual({ sl448: { chapter: 'L5', unit: 'l5-basis' } })
  })
})

describe('last place per course: round trip', () => {
  it('each course keeps its own place; invalid writes are ignored', async () => {
    const st = new FakeStorage()
    const m = await boot(st)
    m.rememberPlace('L3', 'l3-projectors')
    m.rememberPlace('Q4')
    m.rememberPlace('javascript:alert(1)')
    m.rememberPlace('L9', 'q9-mixed')
    expect(JSON.parse(st.getItem(KEY)!)).toEqual({ sl448: { chapter: 'L9' }, qc709: { chapter: 'Q4' } })
    const again = await boot(st)
    expect(again.getPlaces()).toEqual({ sl448: { chapter: 'L9' }, qc709: { chapter: 'Q4' } })
  })
})
