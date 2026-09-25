/**
 * The route-level error fallback (W-L1 §4.2 'route' island; S §4e): "Something broke on this page", a
 * link home, and a **Reset progress** button, so a damaged progress store can never leave a page that the
 * student cannot fix without clearing site data by hand.
 */
import { Link } from 'react-router-dom'
import { resetProgress } from '../resetProgress'

export function RouteFallback({ reset }: { reset: () => void }) {
  return (
    <div className="page" role="alert">
      <h1>Something broke on this page</h1>
      <p>
        Your progress is saved in this browser.{' '}
        <Link to="/" onClick={reset}>
          Go home
        </Link>{' '}
        or reload the page.
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
