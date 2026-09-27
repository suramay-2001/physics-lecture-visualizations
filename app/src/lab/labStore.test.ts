import { afterEach, describe, expect, it } from 'vitest'
import { BENCHES, benchFromParam } from './benches'
import { _resetLabStore, getLab, labContextLost, LOSS_WINDOW_MS, restartLab, resetFrame, setPhi, stepPhi } from './labStore'

afterEach(() => _resetLabStore())

describe('lab store', () => {
  it('φ: set wraps into [0, 720), the pad steps ±15°, reset goes home', () => {
    setPhi(90)
    expect(getLab().phi).toBe(90)
    stepPhi(1)
    expect(getLab().phi).toBe(105)
    setPhi(0)
    stepPhi(-1)
    expect(getLab().phi).toBe(705)
    setPhi(1e9)
    expect(getLab().phi).toBeGreaterThanOrEqual(0)
    expect(getLab().phi).toBeLessThan(720)
    resetFrame()
    expect(getLab().phi).toBe(0)
  })

  it('an unchanged value does not notify (same state object)', () => {
    setPhi(30)
    const s = getLab()
    setPhi(30)
    expect(getLab()).toBe(s)
  })

  it('context loss: fallback, Restart remounts (epoch + 1); a second loss within 60 s gives up for the session', () => {
    labContextLost(1_000)
    expect(getLab()).toMatchObject({ lost: true, givenUp: false, epoch: 0 })
    restartLab()
    expect(getLab()).toMatchObject({ lost: false, epoch: 1 })
    labContextLost(1_000 + LOSS_WINDOW_MS - 1)
    expect(getLab()).toMatchObject({ lost: true, givenUp: true })
    restartLab()
    expect(getLab()).toMatchObject({ lost: true, givenUp: true, epoch: 1 })
  })

  it('two losses further apart than the window do not give up', () => {
    labContextLost(0)
    restartLab()
    labContextLost(LOSS_WINDOW_MS + 1)
    expect(getLab().givenUp).toBe(false)
  })
})

describe('bench ids (the only thing the URL can choose, ruling #7)', () => {
  it('#/lab is the frame check; planned ids resolve; anything else is null', () => {
    expect(benchFromParam(undefined)?.id).toBe('frame')
    expect(benchFromParam('')?.id).toBe('frame')
    expect(benchFromParam('operator')?.id).toBe('operator')
    for (const bad of ['frame', 'Operator', 'sg?preset=x', '__proto__', 'constructor', '../lab', 'toString']) expect(benchFromParam(bad), bad).toBeNull()
  })

  it('build order of the teaching benches (ruling #3); the frame check, the Operator Lab and the Grapher are built', () => {
    expect(BENCHES.map((b) => b.id)).toEqual(['frame', 'operator', 'grapher', 'sg', 'ball'])
    expect(BENCHES.filter((b) => b.built).map((b) => b.id)).toEqual(['frame', 'operator', 'grapher'])
  })
})
