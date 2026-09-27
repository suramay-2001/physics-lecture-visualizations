import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './styles/fonts'
import './index.css'
// Physics 709's Cryostat identity: every rule sits under :root[data-course='qc709'], after the tokens it overrides
import './styles/theme-cryostat.css'
import './app.css'
import './stage/story.css'
// D's overlay visuals (interface change D2): loaded once, right after the layout sheet they refine
import './stage/overlay.css'
// print notes (both courses): the reading version, figures, running head, bridges as footnotes; screen rules hide them
import './styles/print.css'
import App from './App'
import { courseOfHash } from './paths'
import { applyCourseTheme } from './styles/courseTheme'

// The course's identity before the first paint: #/709… is Physics 709 (data-course selects its theme and faces).
applyCourseTheme(courseOfHash(location.hash))

// Hash routing keeps deep links working on any static host without server rewrites.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
