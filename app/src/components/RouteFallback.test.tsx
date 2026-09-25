/** Route error fallback (W-L1 §4.2, S §4e): the page offers "Reset progress", and the reset clears the store. */
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { progress } from '../progress'
import { PROGRESS_KEY, resetProgress } from '../resetProgress'
import { RouteFallback } from './RouteFallback'

const G = globalThis as unknown as { localStorage?: Storage }

afterEach(() => {
  vi.restoreAllMocks()
  delete G.localStorage
})

describe('route fallback', () => {
  it('renders an alert with a link home and a Reset progress button', () => {
    const html = renderToString(
      <MemoryRouter>
        <RouteFallback reset={() => {}} />
      </MemoryRouter>,
    )
    expect(html).toContain('role="alert"')
    expect(html).toContain('Something broke on this page')
    expect(html).toMatch(/<button[^>]*>Reset progress<\/button>/)
  })

  it('resetProgress calls the public progress.reset() and removes the stored key', () => {
    const store = new Map<string, string>([[PROGRESS_KEY, '{"challenges":null}']])
    G.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    } as Storage
    const spy = vi.spyOn(progress, 'reset')
    resetProgress()
    expect(spy).toHaveBeenCalledOnce()
    expect(store.has(PROGRESS_KEY)).toBe(false)
  })

  it('never throws, even when the store and storage both throw', () => {
    vi.spyOn(progress, 'reset').mockImplementation(() => {
      throw new Error('broken store')
    })
    G.localStorage = {
      removeItem: () => {
        throw new Error('no storage')
      },
    } as unknown as Storage
    expect(() => resetProgress()).not.toThrow()
  })
})
