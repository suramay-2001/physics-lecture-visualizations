/**
 * Ground-up / Formal (W-709-platform §B "Toggle"; the approved Cryostat mockup's second segmented control). Shown only
 * for courses with two tracks, beside the Story/Read toggle and independent of it: either mode reads either track.
 * The stage is shared, so switching keeps the reading position (LecturePage passes the track to
 * useKeepReadingPosition). Choosing a track also drops a `?track=` override from the URL, so the choice takes effect.
 */
import { useLocation, useNavigate } from 'react-router-dom'
import { COURSES, type CourseId, type Track } from '../content/courses'
import { flushReadingProbe } from '../stage/readingPosition'
import { setTrack } from '../ui/trackPref'

const LABEL: Record<Track, string> = { ground: 'Ground-up', formal: 'Formal' }

/**
 * `compact`: the copy in the sticky unit rail (components/RouteRail.tsx), so a reader can switch tracks on the beat
 * they are reading. The header's copy sits at the top of the chapter, where switching keeps only the top. Its buttons
 * are named "Ground-up track here" / "Formal track here" (the visible word stays in the name, WCAG 2.5.3).
 */
export function TrackToggle({ course, track, compact = false }: { course: CourseId; track: Track; compact?: boolean }) {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const tracks = COURSES[course].tracks
  if (tracks.length < 2) return null
  const choose = (t: Track) => {
    flushReadingProbe() // the place as it is now, before the texts change
    setTrack(course, t)
    const q = new URLSearchParams(search)
    if (q.has('track')) {
      q.delete('track')
      const s = q.toString()
      navigate({ pathname, search: s ? `?${s}` : '', hash }, { replace: true })
    }
  }
  return (
    <div
      className={compact ? 'mode-toggle track-toggle compact' : 'mode-toggle track-toggle'}
      role="group"
      aria-label={compact ? 'Track for this page, keeps your place' : 'Which track'}
    >
      {tracks.map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={track === t}
          aria-label={compact ? `${LABEL[t]} track here` : undefined}
          data-track={t}
          onClick={() => choose(t)}
        >
          {LABEL[t]}
        </button>
      ))}
    </div>
  )
}

/** The one line under the toggles that says what the two tracks are (mockup `.track-hint`). */
export function TrackHint({ course }: { course: CourseId }) {
  if (COURSES[course].tracks.length < 2) return null
  return (
    <p className="track-hint">
      <b>Ground-up</b> starts from 9th-grade maths and shows every step. <b>Formal</b> uses the full notation. The stage is the same for both.
    </p>
  )
}
