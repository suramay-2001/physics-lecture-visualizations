/**
 * The contract of the lazy TeX renderers (ui/texLoader.ts): before KaTeX has arrived, a component that typesets suspends (so a
 * Suspense boundary shows its fallback, never unrendered maths); after, it renders at once; a failed chunk may load on the next
 * attempt. Each test takes a FRESH copy of the loader (the vitest setup file has already loaded the shared one).
 */
import { Suspense } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.doUnmock('./tex')
  vi.resetModules()
})

async function fresh() {
  vi.resetModules()
  const loader = await import('./texLoader')
  const rich = await import('./Rich')
  return { loader, rich }
}

describe('texLoader', () => {
  it('has no renderers until loadTex() resolves, then keeps them', async () => {
    const { loader } = await fresh()
    expect(loader.texRenderers()).toBeNull()
    const m = await loader.loadTex()
    expect(typeof m.renderAuthoredTex).toBe('function')
    expect(loader.texRenderers()).toBe(m)
    expect(await loader.loadTex()).toBe(m) // one import per session
  })

  it('a Tex rendered before KaTeX has arrived suspends to the fallback; after, it typesets', async () => {
    const { loader, rich } = await fresh()
    const tree = (
      <Suspense fallback={<i className="wait">waiting</i>}>
        <rich.Tex>{'x^2'}</rich.Tex>
      </Suspense>
    )
    const before = renderToString(tree)
    expect(before).toContain('waiting')
    expect(before).not.toContain('katex')
    await loader.loadTex()
    const after = renderToString(tree)
    expect(after).toContain('katex')
    expect(after).not.toContain('waiting')
  })

  it('a failed chunk may load on the next attempt', async () => {
    vi.resetModules()
    let calls = 0
    vi.doMock('./tex', () => {
      calls++
      if (calls === 1) throw new Error('chunk did not load')
      return { renderAuthoredTex: () => 'ok', renderUserTex: () => 'ok' }
    })
    const loader = await import('./texLoader')
    await expect(loader.loadTex()).rejects.toThrow()
    expect(loader.texRenderers()).toBeNull()
    const m = await loader.loadTex()
    expect(m.renderAuthoredTex('x')).toBe('ok')
  })
})
