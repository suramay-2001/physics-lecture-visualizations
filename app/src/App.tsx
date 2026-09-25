import { lazy, Suspense, useEffect } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { COURSE } from './content'
import { Home } from './pages/Home'
import { LecturePage } from './pages/LecturePage'
import { HelpPage } from './pages/HelpPage'
import { FormulasPage } from './pages/FormulasPage'
import { ArcadePage } from './pages/ArcadePage'
import { MapPage } from './pages/MapPage'
import { progress } from './progress'
import { useStageHostRequested } from './stage/demand'
import { setContextLost, useHostEpoch } from './stage/store'
import { IslandBoundary } from './ui/ErrorBoundary'

// Phase-0 gate (throwaway): lazy so GSAP, three.js and the gate scenes stay out of the main chunk.
const GatePage = lazy(() => import('./gate/GatePage'))
// The ONE stage canvas (W-L1 §2.1): lazy chunk, mounted after the first requestStageHost(), kept across routes.
const StageHost = lazy(() => import('./stage/StageHost'))
// DEV-only stage workbench (W-L1 §7.1): `import.meta.env.DEV` is false in builds, so this import is dropped.
const Workbench = import.meta.env.DEV ? lazy(() => import('./stage/Workbench')) : null
// DEV-only: the real LecturePage over the demo story fixture (e2e/story.spec.ts). Dropped from builds.
const DevLecture = import.meta.env.DEV ? lazy(() => import('./stage/DevLecture')) : null

/** Clear saved progress (S §4e: a corrupt store must never leave a page that cannot be fixed). */
function resetProgress() {
  try {
    progress.reset()
  } catch {
    /* the store itself may be the broken part */
  }
  try {
    localStorage.removeItem('spinlab.progress.v1')
  } catch {
    /* storage unavailable */
  }
}

function RouteFallback({ reset }: { reset: () => void }) {
  return (
    <div className="page" role="alert">
      <h1>Something broke on this page</h1>
      <p>
        Your progress is saved in this browser. <Link to="/" onClick={reset}>Go home</Link> or reload the page.
      </p>
      <p>
        If it keeps breaking, saved progress may be damaged.{' '}
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            resetProgress()
            reset()
          }}
        >
          Reset progress
        </button>
      </p>
    </div>
  )
}

function StageHostSlot() {
  const requested = useStageHostRequested()
  // a context restore bumps the epoch: the Canvas remounts with a fresh renderer (W-L1 §2.7)
  const epoch = useHostEpoch()
  if (!requested) return null
  return (
    <IslandBoundary name="stage-host" resetKeys={[epoch]} fallback={null} onError={() => setContextLost(true)}>
      <Suspense fallback={null}>
        <StageHost key={epoch} />
      </Suspense>
    </IslandBoundary>
  )
}

function ScrollToHash() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <NavLink to="/" className="wordmark" aria-label={`${COURSE.title} home`}>
          <span className="wordmark-mark" aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="6.5" r="3.2" className="wm-up" /><circle cx="12" cy="17.5" r="3.2" className="wm-down" /></svg>
          </span>
          {COURSE.title}
          <span className="wordmark-course">{COURSE.code}</span>
        </NavLink>
        <nav aria-label="Main">
          <NavLink to="/arcade">Arcade</NavLink>
          <NavLink to="/map">Concept map</NavLink>
          <NavLink to="/formulas">Formula sheet</NavLink>
          <NavLink to="/help">Help</NavLink>
        </nav>
      </header>
      <ScrollToHash />
      <main id="main">
        <IslandBoundary name="route" resetKeys={[pathname]} fallback={(_, reset) => <RouteFallback reset={reset} />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lecture/:id" element={<LecturePage />} />
          <Route path="/arcade" element={<ArcadePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/formulas" element={<FormulasPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route
            path="/gate"
            element={
              <Suspense fallback={<p className="page">Loading the gate…</p>}>
                <GatePage />
              </Suspense>
            }
          />
          {DevLecture && (
            <Route
              path="/dev/lecture/:id?"
              element={
                <Suspense fallback={<p className="page">Loading the demo lecture…</p>}>
                  <DevLecture />
                </Suspense>
              }
            />
          )}
          {Workbench && (
            <Route
              path="/dev/stage/:lecture?/:unit?"
              element={
                <Suspense fallback={<p className="page">Loading the workbench…</p>}>
                  <Workbench />
                </Suspense>
              }
            />
          )}
          <Route path="*" element={<Home />} />
        </Routes>
        </IslandBoundary>
      </main>
      <StageHostSlot />
      <footer className="footer">
        <p>
          Interactive companion to Physics 448 lecture notes. Explanations are paraphrased; book references point to sections, so read the originals.
          Your progress is saved only in this browser.
        </p>
      </footer>
    </>
  )
}
