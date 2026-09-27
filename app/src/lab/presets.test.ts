/**
 * Preset deep links are an allowlist (decisions/lab.md ruling 7): a crafted query can never set arbitrary state.
 * The query goes through `presetParam` → `presetFrom` (id shape + own key of a frozen null-prototype table) →
 * `applySetup`, which copies ONLY the setup the id names; nothing else in the query is read.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { INITIAL_PARAMS, SETUPS } from './benches/operator/model'
import { applySetup, opStore } from './benches/operator/store'
import { PRESET_ID, presetFrom, presetParam, presetTable } from './presets'

afterEach(() => opStore.reset())

describe('preset allowlist', () => {
  it('a table is frozen, has no prototype, and refuses ids of the wrong shape', () => {
    const t = presetTable({ a: 1, 'b-2': 2 })
    expect(Object.isFrozen(t)).toBe(true)
    expect(Object.getPrototypeOf(t)).toBeNull()
    expect(() => presetTable({ Bad: 1 })).toThrow()
    expect(() => presetTable({ 'a b': 1 })).toThrow()
  })

  it('only an own, well-shaped id is accepted', () => {
    const t = presetTable({ sx: 1, 'sz-lap': 2 })
    expect(presetFrom(t, 'sx')).toBe('sx')
    expect(presetFrom(t, 'sz-lap')).toBe('sz-lap')
    const crafted = [
      null,
      undefined,
      '',
      'SX',
      ' sx',
      'sx ',
      'sx%00',
      'sx&a0=5',
      'sx;a0=5',
      'sx?preset=sz',
      'constructor',
      '__proto__',
      'prototype',
      'toString',
      'valueOf',
      'hasOwnProperty',
      'a'.repeat(33),
      '{"a0":5}',
      'javascript:alert(1)',
      '../sx',
    ]
    for (const raw of crafted) expect(presetFrom(t, raw), String(raw)).toBeNull()
    expect(PRESET_ID.test('a'.repeat(32))).toBe(true)
  })

  it('the query: only the first `preset` value is read, and other parameters are never looked at', () => {
    expect(presetParam('?preset=sz-lap&a0=5&tau=99')).toBe('sz-lap')
    expect(presetParam('?a0=5&preset=sx&preset=sz')).toBe('sx')
    expect(presetParam('?a0=5')).toBeNull()
    expect(presetParam('?preset=%73%78')).toBe('sx') // URL decoding happens before the allowlist
    expect(presetParam('?preset=sx%26a0%3D5')).toBe('sx&a0=5') // …which then rejects the decoded payload
    expect(presetFrom(SETUPS, presetParam('?preset=sx%26a0%3D5'))).toBeNull()
  })

  it('a crafted query cannot set arbitrary state: the store only ever takes an allowlisted setup', () => {
    const queries = ['?preset=__proto__&a0=3', '?preset=constructor', '?a0=3&tau=9&preset=evil', '?preset=%7B%22a0%22%3A3%7D', '?preset=sx&a0=3&tau=9&B=sy']
    for (const q of queries) {
      opStore.reset()
      const id = presetFrom(SETUPS, presetParam(q))
      if (id) applySetup(id)
      const s = opStore.get()
      // nothing beyond what an allowlisted setup defines: a₀ stays the preset's, τ the default, no B
      expect(s.a0, q).toBe(0)
      expect(s.tau, q).toBe(INITIAL_PARAMS.tau)
      expect(s.B, q).toBeNull()
    }
    // the one allowlisted id among them did apply (and only it)
    opStore.reset()
    applySetup(presetFrom(SETUPS, presetParam('?preset=sx&a0=3&tau=9&B=sy'))!)
    expect(opStore.get().preset).toBe('sx')
    // applySetup ignores anything that is not an own key of the table
    opStore.reset()
    applySetup('constructor')
    applySetup('__proto__')
    expect(opStore.get()).toBe(opStore.get())
    expect(opStore.get().preset).toBe(INITIAL_PARAMS.preset)
  })
})
