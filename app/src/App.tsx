import { lazy, Suspense, useEffect } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { COURSE } from './content/meta'
import { Home } from './pages/Home'
import { LecturePage } from './pages/LecturePage'
import { HelpPage } from './pages/HelpPage'
import { FormulasPage } from './pages/FormulasPage'
import { ArcadePage } from './pages/ArcadePage'
import { MapPage } from './pages/MapPage'
import { RouteFallback } from './components/RouteFallback'
import { LecturesMenu, MotionToggle } from './components/TopbarControls'
import { useStageHostRequested } from './stage/demand'
import { setContextLost, useHostEpoch } from './stage/store'
import { useMotionSync } from './stage/useLiveStage'
import { IslandBoundary } from './ui/ErrorBoundary'

// Phase-0 gate (throwaway): lazy so GSAP, three.js and the gate scenes stay out of the main chunk.
// Phase-0 gate: DEV-only since round 3 (#20) — its `window.__gate` must not install in production builds.
const GatePage = import.meta.env.DEV ? lazy(() => import('./gate/GatePage')) : null
// The ONE stage canvas (W-L1 §2.1): lazy chunk, mounted after the first requestStageHost(), kept across routes.
const StageHost = lazy(() => import('./stage/StageHost'))
// DEV-only stage workbench (W-L1 §7.1): `import.meta.env.DEV` is false in builds, so this import is dropped.
const Workbench = import.meta.env.DEV ? lazy(() => import('./stage/Workbench')) : null
// DEV-only: the real LecturePage over the demo story fixture (e2e/story.spec.ts). Dropped from builds.
const DevLecture = import.meta.env.DEV ? lazy(() => import('./stage/DevLecture')) : null
// Arcade games: lazy, so SGLab puzzles and the golf sphere load only when a game is opened.
const GamePage = lazy(() => import('./arcade/GamePage'))
// DEV-only: the two Blender chapter openers until their place in the course is decided (Phase 3).
const OpenersPreview = import.meta.env.DEV ? lazy(() => import('./openers/OpenersPreview')) : null

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
  useMotionSync() // app-wide: the topbar Motion toggle works on every page
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
          <LecturesMenu />
          <NavLink to="/arcade">Arcade</NavLink>
          <NavLink to="/map">Concept map</NavLink>
          <NavLink to="/formulas">Formula sheet</NavLink>
          <NavLink to="/help">Help</NavLink>
          <MotionToggle />
        </nav>
      </header>
      <ScrollToHash />
      <main id="main">
        <IslandBoundary name="route" resetKeys={[pathname]} fallback={(_, reset) => <RouteFallback reset={reset} />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lecture/:id" element={<LecturePage />} />
          <Route path="/arcade" element={<ArcadePage />} />
          <Route
            path="/arcade/:gameId"
            element={
              <Suspense fallback={<p className="page">Loading the game…</p>}>
                <GamePage />
              </Suspense>
            }
          />
          <Route path="/map" element={<MapPage />} />
          <Route path="/formulas" element={<FormulasPage />} />
          <Route path="/help" element={<HelpPage />} />
          {GatePage && (
            <Route
              path="/gate"
              element={
                <Suspense fallback={<p className="page">Loading the gate…</p>}>
                  <GatePage />
                </Suspense>
              }
            />
          )}
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
          {OpenersPreview && (
            <Route
              path="/dev/openers"
              element={
                <Suspense fallback={<p className="page">Loading the openers…</p>}>
                  <OpenersPreview />
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
