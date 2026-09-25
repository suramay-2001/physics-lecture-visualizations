/**
 * progress.ts hardening (S-L1 §4e, finding S-06, decision #10). localStorage is semi-trusted: whatever is
 * stored there (old schema, extension, hand-edited, truncated) must never crash a render. Each case seeds a
 * fake Storage, re-imports the module graph (progress.ts reads storage at import time) and server-renders
 * the Home page, which reads `p.challenges[id]?.solved` for every L1 challenge.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

const KEY = 'spinlab.progress.v1'

class FakeStorage {
  data = new Map<string, string>()
  writes = 0
  constructor(seed?: string) {
    if (seed !== undefined) this.data.set(KEY, seed)
  }
  getItem(k: string) {
    return this.data.has(k) ? this.data.get(k)! : null
  }
  setItem(k: string, v: string) {
    this.writes++
    this.data.set(k, String(v))
  }
  removeItem(k: string) {
    this.data.delete(k)
  }
}

async function boot(storage: unknown) {
  vi.resetModules()
  vi.stubGlobal('localStorage', storage)
  const mod = await import('./progress')
  const { Home } = await import('./pages/Home')
  const html = renderToString(createElement(MemoryRouter, null, createElement(Home)))
  // what every component sees through the hook (server snapshot = the loaded state)
  let seen: unknown
  const Probe = () => ((seen = mod.useProgress()), null)
  renderToString(createElement(Probe))
  return { mod, html, seen: seen as ReturnType<typeof mod.useProgress> }
}

/** The state components receive is always well-formed, whatever was stored. */
function expectWellFormed(s: { v: number; challenges: Record<string, unknown>; games: Record<string, unknown> }) {
  expect(s.v).toBe(1)
  expect(Object.getPrototypeOf(s.challenges)).toBeNull()
  expect(Object.getPrototypeOf(s.games)).toBeNull()
  for (const [id, r] of Object.entries(s.challenges)) {
    expect(id).toMatch(/^[A-Za-z0-9.:-][A-Za-z0-9._:-]{0,63}$/)
    const c = r as Record<string, unknown>
    expect(Object.keys(c).sort()).toEqual(['attempts', 'hintsUsed', 'peeked', 'solved'])
    expect(typeof c.solved === 'boolean' && typeof c.peeked === 'boolean').toBe(true)
    expect(Number.isInteger(c.attempts) && Number.isInteger(c.hintsUsed)).toBe(true)
  }
  for (const lvl of Object.values(s.games)) expect(Number.isInteger(lvl)).toBe(true)
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

const big = JSON.stringify({ challenges: { 'l1-q-classical': { solved: true } }, pad: 'x'.repeat(70 * 1024) })

// Every value here must boot to a working Home render (S-L1 §4e list, plus a few more shapes).
const HOSTILE: [string, string][] = [
  ['null', 'null'],
  ['array', '[]'],
  ['string', '"x"'],
  ['number', '42'],
  ['not JSON', '{"challenges":'],
  ['challenges null', '{"challenges":null}'],
  ['challenges array', '{"challenges":[1,2,3]}'],
  ['challenges string', '{"challenges":"solved"}'],
  ['record null', '{"challenges":{"l1-q-classical":null}}'],
  ['record array', '{"challenges":{"l1-q-classical":[true]}}'],
  ['__proto__ key', '{"challenges":{"__proto__":{"solved":true}}}'],
  ['constructor key', '{"challenges":{"constructor":{"solved":true}},"games":{"constructor":3}}'],
  ['top-level __proto__', '{"__proto__":{"challenges":{"x":{"solved":true}}}}'],
  ['games string level', '{"games":{"g":"9"}}'],
  ['games null', '{"games":null}'],
  ['70 KB blob', big],
  ['deep nesting', '['.repeat(5000) + ']'.repeat(5000)],
  ['wrong types', '{"challenges":{"a":{"solved":"yes","attempts":-1,"hintsUsed":1e9,"peeked":1}}}'],
]

describe('progress: hostile localStorage values never crash Home', () => {
  it.each(HOSTILE)('%s', async (_name, raw) => {
    const { html, seen } = await boot(new FakeStorage(raw))
    expect(html).toContain('The lectures')
    expect(html).toMatch(/"0 of \d+ challenges solved"/)
    expect(html).not.toMatch(/"[1-9]\d* of \d+ challenges solved"/) // nothing counts as solved
    expectWellFormed(seen)
  })

  it('storage that throws on every access still boots', async () => {
    const throwing = {
      getItem() {
        throw new Error('SecurityError')
      },
      setItem() {
        throw new Error('QuotaExceededError')
      },
    }
    const { mod, html } = await boot(throwing)
    expect(html).toContain('The lectures')
    expect(() => mod.progress.attempt('l1-q-classical', true)).not.toThrow()
  })

  it('no localStorage at all (SSR / blocked) still boots', async () => {
    const { html } = await boot(undefined)
    expect(html).toContain('The lectures')
  })
})

describe('progress: sanitize', () => {
  it('keeps valid records and drops invalid ones field by field', async () => {
    vi.resetModules()
    const { sanitize } = await import('./progress')
    const s = sanitize({
      v: 1,
      challenges: {
        'l1-q-classical': { solved: true, attempts: 3, hintsUsed: 2, peeked: false },
        'l1-q-repeat': { solved: 'true', attempts: 2.5, hintsUsed: 11, peeked: true },
        'bad id with spaces': { solved: true },
        __proto__x: { solved: true },
      },
      games: { 'sg-route': 4, neg: -1, frac: 1.5, huge: 1e9, str: '3' },
      extra: { anything: 1 },
    })
    expect(s.v).toBe(1)
    expect(Object.keys(s.challenges)).toEqual(['l1-q-classical', 'l1-q-repeat'])
    expect(s.challenges['l1-q-classical']).toEqual({ solved: true, attempts: 3, hintsUsed: 2, peeked: false })
    expect(s.challenges['l1-q-repeat']).toEqual({ solved: false, attempts: 0, hintsUsed: 0, peeked: true })
    expect(Object.keys(s.games)).toEqual(['sg-route'])
    expect('extra' in s).toBe(false)
  })

  it('maps are null-prototype: prototype names are never records', async () => {
    vi.resetModules()
    const { sanitize } = await import('./progress')
    const s = sanitize(JSON.parse('{"challenges":{"__proto__":{"solved":true},"constructor":{"solved":true}}}'))
    expect(Object.getPrototypeOf(s.challenges)).toBeNull()
    expect(Object.getPrototypeOf(s.games)).toBeNull()
    expect(Object.hasOwn(s.challenges, '__proto__')).toBe(false) // id rule rejects a leading underscore
    // 'constructor' passes the id rule but is an ordinary own record, not Object.prototype.constructor
    expect(s.challenges['constructor']).toEqual({ solved: true, attempts: 0, hintsUsed: 0, peeked: false })
    expect(s.challenges['toString']).toBeUndefined()
    expect(({} as Record<string, unknown>).solved).toBeUndefined() // Object.prototype untouched
  })

  it('caps the number of entries read back', async () => {
    vi.resetModules()
    const { sanitize, PROGRESS_LIMITS } = await import('./progress')
    const many: Record<string, unknown> = {}
    for (let i = 0; i < 2000; i++) many[`c${i}`] = { solved: true }
    const s = sanitize({ challenges: many, games: Object.fromEntries(Object.keys(many).map((k) => [k, 1])) })
    expect(Object.keys(s.challenges)).toHaveLength(PROGRESS_LIMITS.maxEntries)
    expect(Object.keys(s.games)).toHaveLength(PROGRESS_LIMITS.maxEntries)
  })

  it.each([null, undefined, 0, 'x', [], true, () => 1])('non-object %s gives the empty state', async (x) => {
    vi.resetModules()
    const { sanitize } = await import('./progress')
    const s = sanitize(x)
    expect(Object.keys(s.challenges)).toEqual([])
    expect(Object.keys(s.games)).toEqual([])
  })
})

describe('progress: size cap and corrupt side-copy', () => {
  it('an oversized value is ignored and a 1 KiB copy is kept under .corrupt', async () => {
    const st = new FakeStorage(big)
    const { mod } = await boot(st)
    const copy = st.getItem(KEY + '.corrupt')
    expect(copy).not.toBeNull()
    expect(copy!.length).toBe(mod.PROGRESS_LIMITS.corruptCopy)
  })

  it('unparseable JSON is ignored and copied aside', async () => {
    const st = new FakeStorage('{"challenges":{')
    await boot(st)
    expect(st.getItem(KEY + '.corrupt')).toBe('{"challenges":{')
  })

  it('a valid value round-trips and new writes stay null-prototype', async () => {
    const st = new FakeStorage(JSON.stringify({ v: 1, challenges: { 'l1-q-classical': { solved: true, attempts: 1, hintsUsed: 0, peeked: false } }, games: {} }))
    const { mod, html } = await boot(st)
    expect(html).toMatch(/"1 of \d+ challenges solved"/)
    mod.progress.attempt('l1-q-repeat', false)
    mod.progress.gameLevel('g', 2)
    const saved = JSON.parse(st.getItem(KEY)!)
    expect(saved.v).toBe(1)
    expect(saved.challenges['l1-q-classical'].solved).toBe(true)
    expect(saved.challenges['l1-q-repeat']).toEqual({ solved: false, attempts: 1, hintsUsed: 0, peeked: false })
    expect(saved.games).toEqual({ g: 2 })
    mod.progress.reset()
    expect(JSON.parse(st.getItem(KEY)!)).toEqual({ v: 1, challenges: {}, games: {} })
  })

  it('writes for a prototype-named id do not read Object.prototype members', async () => {
    const st = new FakeStorage()
    const { mod } = await boot(st)
    mod.progress.attempt('constructor', true)
    const saved = JSON.parse(st.getItem(KEY)!)
    expect(saved.challenges.constructor).toEqual({ solved: true, attempts: 1, hintsUsed: 0, peeked: false })
  })
})
