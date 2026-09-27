/**
 * Ground-up / Formal (W-709-platform §B "Toggle"; the approved Cryostat mockup's second segmented control). Shown only
 * for courses with two tracks, beside the Story/Read toggle and independent of it: either mode reads either track.
 * The stage is shared, so switching keeps the reading position (LecturePage passes the track to
 * useKeepReadingPosition). Choosing a track also drops a `?track=` override from the URL, so the choice takes effect.
 */
import { useLocation, useNavigate } from 'react-router-dom'
import { COURSES, type CourseId, type Track } from '../content/courses'
import { setTrack } from '../ui/trackPref'

const LABEL: Record<Track, string> = { ground: 'Ground-up', formal: 'Formal' }

export function TrackToggle({ course, track }: { course: CourseId; track: Track }) {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const tracks = COURSES[course].tracks
  if (tracks.length < 2) return null
  const choose = (t: Track) => {
    setTrack(course, t)
    const q = new URLSearchParams(search)
    if (q.has('track')) {
      q.delete('track')
      const s = q.toString()
      navigate({ pathname, search: s ? `?${s}` : '', hash }, { replace: true })
    }
  }
  return (
    <div className="mode-toggle track-toggle" role="group" aria-label="Which track">
      {tracks.map((t) => (
        <button key={t} type="button" aria-pressed={track === t} data-track={t} onClick={() => choose(t)}>
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
