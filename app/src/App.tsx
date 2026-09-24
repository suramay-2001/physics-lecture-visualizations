import { lazy, Suspense, useEffect } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { COURSE } from './content'
import { Home } from './pages/Home'
import { LecturePage } from './pages/LecturePage'
import { HelpPage } from './pages/HelpPage'
import { FormulasPage } from './pages/FormulasPage'
import { ArcadePage } from './pages/ArcadePage'
import { MapPage } from './pages/MapPage'

// Phase-0 gate (throwaway): lazy so GSAP, three.js and the gate scenes stay out of the main chunk.
const GatePage = lazy(() => import('./gate/GatePage'))

function ScrollToHash() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
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
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>
          Interactive companion to Physics 448 lecture notes. Explanations are paraphrased; book references point to sections, so read the originals.
          Your progress is saved only in this browser.
        </p>
      </footer>
    </>
  )
}
