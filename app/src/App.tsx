import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { COURSES, courseOfId } from './content/courses'
import { useCourse } from './course/CourseContext'
import { coursePath, lecturePath } from './paths'
import { Home } from './pages/Home'
import { LecturePage } from './pages/LecturePage'
import { HelpPage } from './pages/HelpPage'
import { FormulasPage } from './pages/FormulasPage'
import { ArcadePage } from './pages/ArcadePage'
import { MapPage } from './pages/MapPage'
import { RouteFallback } from './components/RouteFallback'
import { LecturesMenu, MotionToggle } from './components/TopbarControls'
import { CourseSwitcher } from './components/CourseSwitcher'
import { useStageHostRequested } from './stage/demand'
import { setContextLost, useHostEpoch } from './stage/store'
import { useMotionSync } from './stage/useLiveStage'
import { IslandBoundary } from './ui/ErrorBoundary'
import { applyCourseTheme } from './styles/courseTheme'

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
// The Babylon lab (decisions/lab.md): the route chunk holds the DOM page only; Babylon loads behind a second
// dynamic import inside it (lab/useLabEngine.ts), never below 900 px. No topbar link until the S audit (#12).
const LabPage = lazy(() => import('./lab/LabPage'))
const labRoute = (
  <Suspense fallback={<p className="page">Loading the lab…</p>}>
    <LabPage />
  </Suspense>
)
// DEV-only: the two Blender chapter openers until their place in the course is decided (Phase 3).
const OpenersPreview = import.meta.env.DEV ? lazy(() => import('./openers/OpenersPreview')) : null

// Physics 709 (W-709-platform §A): every 709 page is a lazy chunk, so neither 709 content nor its pages ever enter
// the first paint of 448 (chunk contract (h)). The course's light registry (outline + chapter list) rides with them.
const CourseHome709 = lazy(() => import('./pages/CourseHome709'))
const Chapter709 = lazy(() => import('./pages/Chapter709Page'))
const Map709 = lazy(() => import('./pages/Pages709').then((m) => ({ default: m.Map709 })))
const Arcade709 = lazy(() => import('./pages/Pages709').then((m) => ({ default: m.Arcade709 })))
const Formulas709 = lazy(() => import('./pages/Pages709').then((m) => ({ default: m.Formulas709 })))
const Help709 = lazy(() => import('./pages/Pages709').then((m) => ({ default: m.Help709 })))
const page709 = (el: React.ReactNode) => <Suspense fallback={<p className="page">Loading…</p>}>{el}</Suspense>

/** `#/448/lecture/L3#l3-x` → the canonical `#/lecture/L3#l3-x` (448 URLs stay canonical; the alias only redirects). */
function Alias448() {
  const { id = '' } = useParams()
  const { hash } = useLocation()
  return <Navigate to={{ pathname: id && courseOfId(id) === 'sl448' ? lecturePath(id) : '/', hash }} replace />
}

/** The document's course (main.tsx sets it before the first paint; this keeps it in step with navigation). */
function CourseTheme() {
  const course = useCourse()
  useLayoutEffect(() => applyCourseTheme(course), [course])
  return null
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
  const course = useCourse()
  const c = COURSES[course]
  useMotionSync() // app-wide: the topbar Motion toggle works on every page
  return (
    <>
      <CourseTheme />
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <div className="topbar-brand">
          <NavLink to={coursePath(course)} className="wordmark" aria-label={`${course === 'sl448' ? c.title : c.code} home`}>
            <span className="wordmark-mark" aria-hidden>
              {course === 'qc709' ? (
                // the cryostat's plates (gilt, chrome only)
                <svg viewBox="0 0 24 24" width="22" height="22"><rect x="1" y="3" width="22" height="3" className="wm-plate" /><rect x="4" y="10.5" width="16" height="3" className="wm-plate" /><rect x="7.5" y="18" width="9" height="3" className="wm-plate" /><rect x="11" y="6" width="2" height="12" className="wm-plate" opacity="0.5" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="6.5" r="3.2" className="wm-up" /><circle cx="12" cy="17.5" r="3.2" className="wm-down" /></svg>
              )}
            </span>
            {COURSES.sl448.title}
          </NavLink>
          <CourseSwitcher />
        </div>
        <nav aria-label="Main">
          <LecturesMenu />
          <NavLink to={coursePath(course, 'arcade')}>Arcade</NavLink>
          <NavLink to={coursePath(course, 'map')}>{course === 'sl448' ? 'Concept map' : 'Map'}</NavLink>
          <NavLink to={coursePath(course, 'formulas')}>{course === 'sl448' ? 'Formula sheet' : 'Formulas'}</NavLink>
          <NavLink to={coursePath(course, 'help')}>Help</NavLink>
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
          <Route path="/lab" element={labRoute} />
          <Route path="/lab/:bench" element={labRoute} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/formulas" element={<FormulasPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/448" element={<Alias448 />} />
          <Route path="/448/lecture/:id" element={<Alias448 />} />
          <Route path="/709" element={page709(<CourseHome709 />)} />
          <Route path="/709/ch/:id" element={page709(<Chapter709 />)} />
          <Route path="/709/map" element={page709(<Map709 />)} />
          <Route path="/709/arcade" element={page709(<Arcade709 />)} />
          <Route
            path="/709/arcade/:gameId"
            element={
              <Suspense fallback={<p className="page">Loading the game…</p>}>
                <GamePage />
              </Suspense>
            }
          />
          <Route path="/709/formulas" element={page709(<Formulas709 />)} />
          <Route path="/709/help" element={page709(<Help709 />)} />
          <Route path="/709/*" element={page709(<CourseHome709 />)} />
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
        <p>{c.footer}</p>
      </footer>
    </>
  )
}
