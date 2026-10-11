/**
 * The loader of the TeX renderers (ui/tex.ts). KaTeX is ~260 KB raw / ~75 KB gzip and the home page renders no TeX, so it is
 * not part of the first paint (build/chunks.test.ts rule (p)): the first page that typesets (every lecture and chapter, the
 * Help and Formulas pages, the games, the lab) loads it once, and every later page finds it in memory.
 *
 *   loadTex()       the one dynamic import; a failed chunk may load on the next attempt
 *   texRenderers()  the module once it has loaded, else null
 *   useTexReady()   'ready' | 'loading' | 'failed' (+ retry), for a page that waits before it renders (LecturePage)
 *   useTex()        the module for a component that typesets; it SUSPENDS until the module has arrived (React `use`), so a page
 *                   that was not gated shows its Suspense fallback instead of unrendered TeX. `Tex`/`UserTex` (ui/Rich.tsx)
 *                   are the callers; a loaded module is returned at once, with no suspension and no flash.
 *   lazyTex(f)      React.lazy for a route page that typesets: the page's chunk and KaTeX load in parallel, so the page
 *                   mounts with the renderer already in memory (no suspension at all).
 *
 * The notation pre-processor (ui/notationMark.ts, loaded by ui/notationPref.ts) chains behind it, as before: a `<Tex>` can
 * only render once KaTeX is in, and the first one that renders with "Explain notation" on asks for the pre-processor. Until
 * it arrives the TeX is typeset plain (the marks add no size), so the listener (components/NotationRuntime.tsx, requested
 * when the app mounts) is long in place when the first mark appears.
 */
import { lazy, use, useEffect, useState, type ComponentType, type LazyExoticComponent } from 'react'

type TexModule = typeof import('./tex')

let mod: TexModule | null = null
let loading: Promise<TexModule> | null = null

/** The renderers once KaTeX has loaded, else null. */
export const texRenderers = (): TexModule | null => mod

/** Load KaTeX and the renderers once per session (a failed chunk may load on the next attempt). */
export function loadTex(): Promise<TexModule> {
  loading ??= import('./tex').then(
    (m) => (mod = m),
    (e: unknown) => {
      loading = null
      throw e
    },
  )
  return loading
}

/** 'ready' once KaTeX has loaded (at once when it already has); 'failed' offers `retry`. Starts the load when `wanted`. */
export function useTexReady(wanted = true): { status: 'ready' | 'loading' | 'failed'; retry: () => void } {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>(mod ? 'ready' : 'loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (mod || !wanted) return
    let alive = true
    loadTex().then(
      () => alive && setState('ready'),
      () => alive && setState('failed'),
    )
    return () => {
      alive = false
    }
  }, [wanted, attempt])
  return {
    status: mod || !wanted ? 'ready' : state === 'failed' ? 'failed' : 'loading',
    retry: () => (setState('loading'), setAttempt((a) => a + 1)),
  }
}

/** The renderers, suspending until KaTeX has arrived (a failed load throws to the nearest error boundary). */
export function useTex(): TexModule {
  return mod ?? use(loadTex())
}

/** `React.lazy` for a route page that typesets: its chunk and KaTeX load together. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyTex<T extends ComponentType<any>>(page: () => Promise<{ default: T }>): LazyExoticComponent<T> {
  return lazy(() => Promise.all([page(), loadTex()]).then(([m]) => m))
}
