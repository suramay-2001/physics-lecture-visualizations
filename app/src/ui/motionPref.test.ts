import { afterEach, describe, expect, it } from 'vitest'
import { prefersReducedMotion } from '../stage/store'
import { getMotionChoice, setMotionChoice } from './motionPref'

// Node test environment: no localStorage and no matchMedia — the choice must still hold for the session.
describe('motion preference precedence (Phase 4a topbar toggle)', () => {
  afterEach(() => setMotionChoice(null))
  it('follows the OS when the reader has not chosen (no OS signal here → motion on)', () => {
    expect(getMotionChoice()).toBeNull()
    expect(prefersReducedMotion()).toBe(false)
  })
  it("the reader's choice wins over the OS", () => {
    setMotionChoice('reduce')
    expect(prefersReducedMotion()).toBe(true)
    setMotionChoice('full')
    expect(prefersReducedMotion()).toBe(false)
  })
  it('works with storage unavailable (the choice holds for this visit)', () => {
    expect(() => setMotionChoice('reduce')).not.toThrow()
    expect(getMotionChoice()).toBe('reduce')
  })
})
