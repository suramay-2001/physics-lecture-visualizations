/**
 * A Physics 709 chapter at `#/709/ch/:id` (lazy chunk). Three cases:
 *   - a written chapter (registered in qc709/meta.generated.ts): the shared LecturePage, once the course pack (709
 *     glossary, concepts) has loaded, since its prose may use 709 terms;
 *   - a chapter of the semester outline that is not written yet: where it sits (Part, plate), what it will cover,
 *     and "planned, not written yet". The home lists these without links; the URL still answers sensibly;
 *   - anything else: not found.
 * DEV only: `#/709/ch/Q0` renders the demo chapter (content/qc709/__fixtures__), which never ships
 * (build/chunks.test.ts (k)).
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { COURSES } from '../content/courses'
import { loadQcPack } from '../content/load'
import { metaById } from '../content/meta'
import { placeOf } from '../content/qc709/registry'
import type { Lecture } from '../content/schema'
import { coursePath } from '../paths'
import { Rich } from '../ui/Rich'
import { LecturePage } from './LecturePage'

const loadDemo = import.meta.env.DEV ? () => import('../content/qc709/__fixtures__/demoChapter').then((m) => m.Q0) : null

type Load = 'loading' | 'ready' | 'failed'

/** The course pack, loaded once per session (content/load.ts caches the promise). */
function useQcPack(wanted: boolean): [Load, () => void] {
  const [state, setState] = useState<Load>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!wanted) return
    let alive = true
    loadQcPack().then(
      () => alive && setState('ready'),
      () => alive && setState('failed'),
    )
    return () => {
      alive = false
    }
  }, [wanted, attempt])
  return [state, () => (setState('loading'), setAttempt((n) => n + 1))]
}

function Loading({ id, state, retry }: { id: string; state: Load; retry: () => void }) {
  return (
    <div className="page lecture-loading" aria-busy={state === 'loading'}>
      <p className="eyebrow">Chapter {id}</p>
      {state === 'failed' ? (
        <p role="alert">
          This chapter did not load. Check the connection, then{' '}
          <button type="button" className="topbar-button" onClick={retry}>
            try again
          </button>
          .
        </p>
      ) : (
        <p className="small">Loading the chapter…</p>
      )}
    </div>
  )
}

export default function Chapter709Page() {
  const { id = '' } = useParams()
  const isDemo = !!loadDemo && id.toUpperCase() === 'Q0'
  const written = !!metaById(id)
  const [pack, retry] = useQcPack(written || isDemo)
  const [demo, setDemo] = useState<Lecture>()
  useEffect(() => {
    if (isDemo && loadDemo) void loadDemo().then(setDemo)
  }, [isDemo])

  if (isDemo) return demo && pack === 'ready' ? <LecturePage lecture={demo} /> : <Loading id="Q0" state={pack} retry={retry} />
  if (written) return pack === 'ready' ? <LecturePage /> : <Loading id={id} state={pack} retry={retry} />

  const place = placeOf(id)
  if (!place) {
    return (
      <div className="page page-709">
        <h1>No chapter called “{id.slice(0, 40)}”</h1>
        <p>
          <Link to={coursePath('qc709')}>Back to the chapter list</Link>
        </p>
      </div>
    )
  }
  const { chapter, part, plate } = place
  return (
    <div className="page page-709 chapter-planned">
      <p className="eyebrow">
        {part.label} · {part.title} · Chapter {chapter.id}
      </p>
      <h1>{chapter.title}</h1>
      <p className="planned-plate">
        <span className="planned-temp" aria-hidden="true">
          {plate.temp}
        </span>
        <span className="visually-hidden">{plate.spoken}, </span>
        {plate.name}
      </p>
      {chapter.topics && (
        <p>
          Covers <Rich as="span" text={chapter.topics} />.
        </p>
      )}
      {chapter.src && <p className="small">Sources: {chapter.src}.</p>}
      <div className="coming-709" role="note">
        <p className="eyebrow">Planned, not written yet</p>
        <p>
          This chapter is on the {COURSES.qc709.code} semester map. It is written in the same story format as the other chapters, with a Ground-up and a Formal
          track.
        </p>
        <p>
          <Link to={coursePath('qc709')}>Back to the chapter list</Link>
        </p>
      </div>
    </div>
  )
}
