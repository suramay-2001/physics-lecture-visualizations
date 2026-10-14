import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { COURSES, courseOfId } from './content/courses'
import { useCourse } from './course/CourseContext'
import { coursePath, lecturePath } from './paths'
import { Home } from './pages/Home'
import { LecturePage } from './pages/LecturePage'
import { RouteFallback } from './components/RouteFallback'
import { LecturesMenu, MotionToggle, NotationToggle } from './components/TopbarControls'
import { CourseSwitcher } from './components/CourseSwitcher'
import { ReturnBar } from './components/ReturnBar'
import { NotationHost } from './components/NotationHost'
import { useStageHostRequested } from './stage/demand'
import { setContextLost, useHostEpoch } from './stage/store'
import { useMotionSync } from './stage/useLiveStage'
import { IslandBoundary } from './ui/ErrorBoundary'
import { applyCourseTheme } from './styles/courseTheme'
import { lazyTex } from './ui/texLoader'

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
const GamePage = lazyTex(() => import('./arcade/GamePage'))
// The Babylon lab (decisions/lab.md): the route chunk holds the DOM page only; Babylon loads behind a second
// dynamic import inside it (lab/useLabEngine.ts), never below 900 px. No topbar link until the S audit (#12).
const LabPage = lazyTex(() => import('./lab/LabPage'))
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
// (`lazyTex`: a page that typesets loads KaTeX beside its own chunk, so it mounts with the renderer in memory; ui/texLoader.ts)
const Chapter709 = lazyTex(() => import('./pages/Chapter709Page'))
const Map709 = lazy(() => import('./pages/Pages709').then((m) => ({ default: m.Map709 })))
const Arcade709 = lazy(() => import('./pages/Pages709').then((m) => ({ default: m.Arcade709 })))
const Formulas709 = lazyTex(() => import('./pages/Reading709').then((m) => ({ default: m.Formulas709 })))
const Help709 = lazyTex(() => import('./pages/Reading709').then((m) => ({ default: m.Help709 })))
const lazyPage = (el: React.ReactNode) => <Suspense fallback={<p className="page">Loading…</p>}>{el}</Suspense>

// The Papers section (docs/specs/papers-platform.md §6): one lazy chunk for its four pages, its pack and specs behind it
// (build/chunks.test.ts rule (q)); the lecture typesets, so it loads KaTeX beside its chunk.
const PapersShelf = lazy(() => import('./pages/PapersPages').then((m) => ({ default: m.PapersShelf })))
const PaperChapter = lazyTex(() => import('./pages/PapersPages'))
const PaperReferences = lazy(() => import('./pages/PapersPages').then((m) => ({ default: m.PaperReferences })))
const PaperPrereqs = lazy(() => import('./pages/PapersPages').then((m) => ({ default: m.PaperPrereqs })))

// Physics 448's list pages that carry per-lecture data (the Arcade's rounds, the concept map's stations, the formula
// boards) are lazy chunks too, so the main chunk does not grow with every lecture (build/chunks.test.ts rule (n)). Each
// scrolls to its #anchor once it mounts (pages/useHashScroll.ts), because the router's scroll ran before the page existed.
const ArcadePage = lazy(() => import('./pages/ArcadePage').then((m) => ({ default: m.ArcadePage })))
const MapPage = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })))
const FormulasPage = lazyTex(() => import('./pages/FormulasPage').then((m) => ({ default: m.FormulasPage })))
// The Help page lists every challenge with its walkthrough (TeX, and every lecture's chunk): a lazy route too.
const HelpPage = lazyTex(() => import('./pages/HelpPage').then((m) => ({ default: m.HelpPage })))

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
              ) : course === 'papers' ? (
                // a page: a title rule over lines of text (the Papers section reads on Spin Lab's glass plate)
                <svg viewBox="0 0 24 24" width="22" height="22"><rect x="4.5" y="2" width="15" height="20" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="2" /><line x1="8" y1="11.5" x2="16" y2="11.5" stroke="currentColor" strokeWidth="1.2" /><line x1="8" y1="15" x2="14" y2="15" stroke="currentColor" strokeWidth="1.2" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="6.5" r="3.2" className="wm-up" /><circle cx="12" cy="17.5" r="3.2" className="wm-down" /></svg>
              )}
            </span>
            {COURSES.sl448.title}
          </NavLink>
          <CourseSwitcher />
        </div>
        <nav aria-label="Main">
          {course === 'papers' ? (
            // the Papers section's own pages hang off each paper (its lecture, References used, Prerequisites): the shelf lists them
            <NavLink to={coursePath(course)} end>
              Shelf
            </NavLink>
          ) : (
            <>
              <LecturesMenu />
              <NavLink to={coursePath(course, 'arcade')}>Arcade</NavLink>
              <NavLink to={coursePath(course, 'map')}>{course === 'sl448' ? 'Concept map' : 'Map'}</NavLink>
              <NavLink to={coursePath(course, 'formulas')}>{course === 'sl448' ? 'Formula sheet' : 'Formulas'}</NavLink>
              <NavLink to={coursePath(course, 'help')}>Help</NavLink>
            </>
          )}
          <NotationToggle />
          <MotionToggle />
        </nav>
      </header>
      {/* the way back from a bridge (only while the URL carries a valid `ret`; components/ReturnBar.tsx) */}
      <ReturnBar />
      {/* the one listener behind the notation cards (components/NotationHost.tsx) */}
      <NotationHost />
      <ScrollToHash />
      <main id="main">
        <IslandBoundary name="route" resetKeys={[pathname]} fallback={(_, reset) => <RouteFallback reset={reset} />}>
        {/* a safety net for a page that typesets before KaTeX has arrived (ui/texLoader.ts `useTex` suspends); every route that
            typesets waits for it first (`lazyTex`, LecturePage), so this shows only for the DEV pages */}
        <Suspense fallback={<p className="page">Loading…</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lecture/:id" element={<LecturePage />} />
          <Route path="/arcade" element={lazyPage(<ArcadePage />)} />
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
          <Route path="/map" element={lazyPage(<MapPage />)} />
          <Route path="/formulas" element={lazyPage(<FormulasPage />)} />
          <Route path="/help" element={lazyPage(<HelpPage />)} />
          <Route path="/448" element={<Alias448 />} />
          <Route path="/448/lecture/:id" element={<Alias448 />} />
          <Route path="/709" element={lazyPage(<CourseHome709 />)} />
          <Route path="/709/ch/:id" element={lazyPage(<Chapter709 />)} />
          <Route path="/709/map" element={lazyPage(<Map709 />)} />
          <Route path="/709/arcade" element={lazyPage(<Arcade709 />)} />
          <Route
            path="/709/arcade/:gameId"
            element={
              <Suspense fallback={<p className="page">Loading the game…</p>}>
                <GamePage />
              </Suspense>
            }
          />
          <Route path="/709/formulas" element={lazyPage(<Formulas709 />)} />
          <Route path="/709/help" element={lazyPage(<Help709 />)} />
          <Route path="/709/*" element={lazyPage(<CourseHome709 />)} />
          <Route path="/papers" element={lazyPage(<PapersShelf />)} />
          <Route path="/papers/ch/:id" element={lazyPage(<PaperChapter />)} />
          <Route path="/papers/refs/:id" element={lazyPage(<PaperReferences />)} />
          <Route path="/papers/prereq/:id" element={lazyPage(<PaperPrereqs />)} />
          <Route path="/papers/*" element={lazyPage(<PapersShelf />)} />
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
        </Suspense>
        </IslandBoundary>
      </main>
      <StageHostSlot />
      <footer className="footer">
        <p>{c.footer}</p>
      </footer>
    </>
  )
}
