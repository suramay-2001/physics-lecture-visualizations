/**
 * DEV-only preview of the two chapter openers (route #/dev/openers, dropped from builds like /gate). Placement
 * (user, 2026-09-27): the Hopf film is on the home page ("Where this is heading"); the belt trick waits for the
 * L6 rotations unit, so until L6 exists it is reviewed only here.
 * `window.__openers.triggers()` counts live `opener:*` ScrollTriggers for e2e/openers.spec.ts (module scope, so
 * it survives leaving the route and can show the count going back to 0).
 */
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotionSync } from '../stage/useLiveStage'
import OpenerScrub, { OPENER_TRIGGER_PREFIX } from './OpenerScrub'
import { OPENERS } from './openerCopy'

declare global {
  interface Window {
    __openers?: { triggers: () => number }
  }
}
window.__openers = { triggers: () => ScrollTrigger.getAll().filter((t) => String(t.vars.id ?? '').startsWith(OPENER_TRIGGER_PREFIX)).length }

export default function OpenersPreview() {
  useMotionSync()
  return (
    <div className="lecture">
      <h1>Chapter openers (preview)</h1>
      <p>Rendered in Blender from engine data (pipeline/blender). Scroll to scrub each film.</p>
      <OpenerScrub spec={OPENERS.hopf} />
      <OpenerScrub spec={OPENERS.belt} />
    </div>
  )
}
