/**
 * The mount point of the notation explainers (decisions/notation-explainers.md): the one thing App.tsx renders. With
 * "Explain notation" on it loads the listener (components/NotationRuntime.tsx: hover, click, tap, keyboard and the
 * state of the open card), which in turn loads the card and the dictionary the first time a card is wanted. Off, nothing
 * is fetched at all. Entry chunk: this file, the pref (ui/notationPref.ts), the toggle and the stylesheet.
 */
import { lazy, Suspense } from 'react'
import '../styles/notation.css'
import { IslandBoundary } from '../ui/ErrorBoundary'
import { useNotationOn } from '../ui/notationPref'

const NotationRuntime = lazy(() => import('./NotationRuntime'))

export function NotationHost() {
  const enabled = useNotationOn()
  if (!enabled) return null
  return (
    <IslandBoundary name="rich" fallback={null}>
      <Suspense fallback={null}>
        <NotationRuntime />
      </Suspense>
    </IslandBoundary>
  )
}
