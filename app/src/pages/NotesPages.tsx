/**
 * The 709 "Lecture notes" section (docs/roles/proposals/W-709-notes.md §2 to §4; rulings docs/roles/decisions/qc709-notes.md): the index at
 * `#/709/notes` and one reading page per class lecture at `#/709/notes/N8` (`/709/notes/L8` redirects: `L<k>` is 448's). Lazy chunk
 * (App.tsx); it imports no lecture, and the lecture it shows arrives as its own chunk (content/load.ts, build/chunks.test.ts rule (r)).
 *
 * A notes lecture is a plain reading column: sections (the notes' own markers and printed pages), paragraphs, and now and then a
 * figure drawn from an existing stage kind at the end of its hold (`SvgStill` for every SVG kind, `FigureFor` for the flat GL kinds
 * and for print). No stage host, no WebGL, no scroll story. A bridge in the prose leads into the chapter unit that teaches the
 * section, with the usual way back; the chapter unit leads back through a generated bridge (components/UnitNotesLink.tsx).
 */
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BridgeLink, BridgeNotes, BridgeNotesContext } from '../components/BridgeLink'
import { NotationKeySlot } from '../components/NotationKeySlot'
import { lookupBridge } from '../content/bridgeRegistry'
import { COURSES, chapterName, isNotesId } from '../content/courses'
import { useLecture } from '../content/load'
import { metaById } from '../content/meta'
import { chapterVocab } from '../content/notationVocab'
import { NOTES_META } from '../content/qc709/registry' // registers the notes listing (metaById, bridges, the reverse index) with the 709 registry
import type { Lecture, StageKind } from '../content/schema'
import { isSvgKind, layoutStates, type Beat } from '../content/stage'
import { bridgeRefs } from '../content/walk'
import type { NotesLectureMeta } from '../content/unitNotes'
import { coursePath, lecturePath } from '../paths'
import { FidelityNotes } from '../stage/StaticStory'
import { FigureFor } from '../stage/figures/FigureFor'
import { BeatContext, beatElement, focusQuietly, placeFromSearch, restoreWhenSettled } from '../stage/readingPosition'
import { SvgStill } from '../stage/SvgStill'
import { useSvgKinds } from '../stage/svgKinds'
import { NotationScopeContext, useNotationReady } from '../ui/notationPref'
import { useReadMode } from '../ui/readModePref'
import { Rich } from '../ui/Rich'
import { useTexReady } from '../ui/texLoader'
import { TrackContext, useTrack } from '../ui/trackPref'
import { useQcPack } from './useQcPack'
import '../styles/course709.css'
import '../styles/chapter709.css'
import '../styles/notes709.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** `2026-10-02` -> `2 Oct 2026` (fixed words: the same on every locale and time zone). */
export const fmtDate = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1] ?? '?'} ${m[1]}` : iso
}

/** The chapters a notes lecture feeds ("Q6, Q7"), in first-use order. */
export const feedsOf = (m: NotesLectureMeta): string[] => [...new Set(m.units.flatMap((u) => u.feeds.map((f) => f.chapter)))]

/** The stage kinds a lecture's figures draw (first-use order): a beat has a figure exactly when it has a caption. */
export function figureKinds(l: Lecture | undefined): StageKind[] {
  const out: StageKind[] = []
  for (const u of l?.units ?? []) for (const b of u.story ?? []) if (b.caption !== undefined) for (const s of layoutStates(b.stage)) if (!out.includes(s.kind)) out.push(s.kind)
  return out
}

/** Figure numbers `N8.1, N8.2, …`: one per paragraph that has a figure, through the lecture (beat id -> number). */
export function notesFigureNumbers(l: Lecture): Map<string, string> {
  const out = new Map<string, string>()
  let n = 0
  for (const u of l.units) for (const b of u.story ?? []) if (b.caption !== undefined) out.set(b.id, `${l.id}.${++n}`)
  return out
}

/** The bridge ids a section's paragraphs and captions use, each once, in reading order. */
export function sectionBridgeIds(unit: { story?: readonly Beat[] }): string[] {
  const ids: string[] = []
  for (const b of unit.story ?? []) for (const t of [b.text, b.caption ?? '']) for (const id of bridgeRefs(t)) if (!ids.includes(id)) ids.push(id)
  return ids
}

/** The marker and the title of a section: the unit title is `§C Bell basis` (the kit forbids a space inside a marker). */
const splitTitle = (title: string): { label: string; name: string } => {
  const i = title.indexOf(' ')
  return i < 0 ? { label: '', name: title } : { label: title.slice(0, i), name: title.slice(i + 1) }
}

/** One figure: the SVG kinds draw on screen with `SvgStill` (and print through `FigureFor`); the flat GL kinds draw through `FigureFor` on screen too. */
function NotesFigure({ beat, number }: { beat: Beat; number: string }) {
  const allSvg = layoutStates(beat.stage).every((s) => isSvgKind(s.kind))
  return (
    <div className="notes-figure" data-figure={number} data-flat={allSvg ? undefined : 'true'}>
      {allSvg && <SvgStill layout={beat.stage} course="qc709" />}
      <FigureFor layout={beat.stage} number={number} caption={beat.caption} course="qc709" />
      <p className="notes-caption">
        <b>Fig. {number}</b> <Rich as="span" text={beat.caption ?? ''} />
      </p>
      <FidelityNotes beat={beat} course="qc709" />
    </div>
  )
}

/** The reading column of a notes lecture (header, sections, notation key, pager): presentational, so a test can render it without the loader. */
export function NotesBody({ lecture }: { lecture: Lecture }) {
  const track = useTrack('qc709')
  const readMode = useReadMode()
  const notationScope = useMemo(() => {
    const vocab = chapterVocab(lecture)
    return { off: readMode || undefined, gates: true, bits: vocab.bits, sets: vocab.sets, spin: vocab.spin }
  }, [lecture, readMode])
  const figures = useMemo(() => notesFigureNumbers(lecture), [lecture])
  const meta = NOTES_META.find((m) => m.id === lecture.id)
  const at = NOTES_META.findIndex((m) => m.id === lecture.id)
  const prev = at > 0 ? NOTES_META[at - 1] : undefined
  const next = at >= 0 && at < NOTES_META.length - 1 ? NOTES_META[at + 1] : undefined
  const headLeft = `${COURSES.qc709.code} · ${chapterName(lecture.id)} · ${lecture.title}`
  // the running head of the print is a page margin box, which takes strings: hand them over as properties (as pages/LecturePage.tsx)
  useLayoutEffect(() => {
    const root = document.documentElement.style
    root.setProperty('--print-head-left', JSON.stringify(headLeft))
    root.setProperty('--print-head-right', JSON.stringify('Lecture notes'))
    return () => {
      root.removeProperty('--print-head-left')
      root.removeProperty('--print-head-right')
    }
  }, [headLeft])
  return (
    <TrackContext.Provider value={track}>
      <NotationScopeContext.Provider value={notationScope}>
        <article className="page page-709 notes-page" data-notes={lecture.id} data-figures={figures.size}>
          <p className="print-head" aria-hidden="true">
            <span>{headLeft}</span> <span>Lecture notes</span>
          </p>
          <header className="notes-head">
            <p className="eyebrow">
              {COURSES.qc709.code} · <Link to={coursePath('qc709', 'notes')}>Lecture notes</Link>
            </p>
            <h1>
              <span className="notes-h1-kicker">{chapterName(lecture.id)}</span> {lecture.title}
            </h1>
            <p className="notes-meta mono">
              {lecture.date ? `${fmtDate(lecture.date)} · ` : ''}
              {meta ? `printed ${meta.pages} of the notes` : ''}
            </p>
            <div className="outcomes notes-topics">
              <span className="eyebrow">In this lecture</span>
              <ul>
                {lecture.outcomes.map((o, k) => (
                  <li key={k}>{o}</li>
                ))}
              </ul>
            </div>
          </header>

          {lecture.units.map((u) => {
            const { label, name } = splitTitle(u.title)
            const bridges = sectionBridgeIds(u)
            const notes = new Map(bridges.map((id, i) => [id, i + 1]))
            return (
              <section key={u.id} id={u.id} className="notes-section" aria-labelledby={`${u.id}-title`}>
                <h2 id={`${u.id}-title`}>
                  <span className="notes-label">{label}</span> {name} <span className="notes-pages mono">{u.lecture.pages}</span>
                </h2>
                <BridgeNotesContext.Provider value={notes}>
                  {(u.story ?? []).map((b) => (
                    <div key={b.id} className="notes-beat" id={b.id} data-beat={b.id}>
                      <BeatContext.Provider value={b.id}>
                        <Rich text={b.text} />
                        {figures.has(b.id) && <NotesFigure beat={b} number={figures.get(b.id)!} />}
                      </BeatContext.Provider>
                    </div>
                  ))}
                </BridgeNotesContext.Provider>
                {bridges.length > 0 && (
                  <p className="notes-learn small">
                    <span className="eyebrow">Learn it in the chapter</span>
                    {bridges.map((id) => (
                      <Fragment key={id}>
                        <BridgeLink id={id}>{lookupBridge(id)?.label ?? ''}</BridgeLink>{' '}
                      </Fragment>
                    ))}
                  </p>
                )}
                <BridgeNotes ids={bridges} />
              </section>
            )
          })}

          {/* "Notation in this chapter": its chunk (the dictionary) is fetched when this slot nears the viewport or a print starts */}
          <NotationKeySlot lecture={lecture} track="ground" course="qc709" />

          <nav className="notes-pager" aria-label="Lecture notes">
            {prev ? <Link to={lecturePath(prev.id)}>← {chapterName(prev.id)}</Link> : <span />}
            <Link to={coursePath('qc709', 'notes')}>All lecture notes</Link>
            {next ? <Link to={lecturePath(next.id)}>{chapterName(next.id)} →</Link> : <span />}
          </nav>
        </article>
      </NotationScopeContext.Provider>
    </TrackContext.Provider>
  )
}

function Loading({ id, title, failed, retry }: { id: string; title?: string; failed: boolean; retry: () => void }) {
  return (
    <div className="page page-709 notes-page lecture-loading" aria-busy={!failed}>
      <p className="eyebrow">{chapterName(id)}</p>
      {title && <h1>{title}</h1>}
      {failed ? (
        <p role="alert">
          These notes did not load. Check the connection, then{' '}
          <button type="button" className="topbar-button" onClick={retry}>
            try again
          </button>
          .
        </p>
      ) : (
        <p className="small">Loading the notes…</p>
      )}
    </div>
  )
}

/** The route `#/709/notes/:id` for a known lecture: waits for the lecture's chunk, the 709 pack (glossary, bridges), the SVG kinds its figures draw, and KaTeX. */
function NotesLecture({ id }: { id: string }) {
  // only a notes id is a page here (`Q1` is a chapter: the registry knows it, this section does not)
  const meta = isNotesId(id.toUpperCase()) ? metaById(id) : undefined
  const { hash, search, pathname } = useLocation()
  const navigate = useNavigate()
  const [pack, retryPack] = useQcPack(!!meta)
  const load = useLecture(meta ? meta.id : '')
  const lecture = load.status === 'ready' ? load.lecture : undefined
  // the SVG kinds its figures draw are a lazy chunk; the reading page waits for them so every figure draws at once
  const kinds = useMemo(() => figureKinds(lecture), [lecture])
  const svgReady = useSvgKinds(kinds)
  const texReady = useTexReady(true)
  const notationGate = useNotationReady()
  const shown = useRef(false)
  const mounted = !!lecture && pack === 'ready' && svgReady.status === 'ready' && texReady.status === 'ready' && (notationGate || shown.current)
  useEffect(() => {
    if (mounted) shown.current = true
  }, [mounted])

  // a #section link can arrive before its lecture's chunk: scroll there once the lecture is on the page
  useEffect(() => {
    if (mounted && hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [mounted, hash])

  // `?at=<beat>&f=<frac>` (the way back from a bridge): that point of the paragraph goes under the centre line, focus moves to it
  // (outlined once), and the two parameters leave the URL (stage/readingPosition.ts, components/ReturnBar.tsx)
  const units = useMemo(() => lecture?.units.map((u) => u.id) ?? [], [lecture])
  const arrive = mounted ? placeFromSearch(search, units) : null
  const arriveKey = arrive ? `${arrive.beat}~${arrive.frac}` : ''
  const settle = useRef<(() => void) | null>(null)
  useEffect(() => () => settle.current?.(), [])
  useEffect(() => {
    if (!arrive) return
    settle.current?.()
    settle.current = restoreWhenSettled(arrive, {
      live: false,
      done: (ok) => {
        const el = beatElement(arrive.beat)
        if (ok && el) {
          focusQuietly(el)
          el.classList.add('arrived')
          setTimeout(() => el.classList.remove('arrived'), 2000)
        }
        const q = new URLSearchParams(search)
        q.delete('at')
        q.delete('f')
        const s = q.toString()
        navigate({ pathname, search: s ? `?${s}` : '', hash }, { replace: true })
      },
    })
  }, [arriveKey])

  if (!meta) return <NotFound id={id} />
  if (!mounted || !lecture) {
    const waits = [pack === 'failed' ? { retry: retryPack } : null, svgReady.status === 'failed' ? svgReady : null, texReady.status === 'failed' ? texReady : null, load.status === 'failed' ? load : null]
    const failed = waits.find((w) => w)
    return <Loading id={meta.id} title={meta.title} failed={!!failed} retry={failed ? failed.retry : () => undefined} />
  }
  return <NotesBody lecture={lecture} />
}

function NotFound({ id }: { id: string }) {
  return (
    <div className="page page-709 notes-page">
      <h1>No lecture notes called “{id.slice(0, 40)}”</h1>
      <p>
        <Link to={coursePath('qc709', 'notes')}>Back to the lecture notes</Link>
      </p>
    </div>
  )
}

/** One lecture's page: `L8` is the owner's spelling and redirects to the internal id `N8`; anything else unknown answers in words. */
export function NotesLecturePage({ id }: { id: string }) {
  const { search, hash } = useLocation()
  const asL = /^L([1-9]\d*)$/i.exec(id)
  if (asL) return <Navigate to={{ pathname: lecturePath(`N${asL[1]}`), search, hash }} replace />
  return <NotesLecture id={id} />
}

/** The route `#/709/notes/:id?` (App.tsx): the index at `/709/notes`, a lecture at `/709/notes/N8`. The param is named `id` because the bridge chips read the page's chapter from it. */
export default function Notes709() {
  const { id = '' } = useParams()
  return id === '' ? <NotesIndex /> : <NotesLecturePage id={id} />
}

/** `#/709/notes`: one row per built lecture, read from the light registry alone (no lecture chunk). */
export function NotesIndex() {
  return (
    <div className="page page-709 notes-page notes-index">
      <p className="eyebrow">{COURSES.qc709.code} · Lecture notes</p>
      <h1>Lecture notes</h1>
      <p className="section-lede">
        One page for each class lecture, in the order of the printed notes. A section names its printed pages, and links to the chapter units that teach it, so a
        note leads into the chapters and a chapter leads back to the notes.
      </p>
      {NOTES_META.length === 0 ? (
        <p>No lecture notes are written yet.</p>
      ) : (
        <ol className="notes-list">
          {NOTES_META.map((m) => {
            const feeds = feedsOf(m)
            return (
              <li key={m.id} className="notes-row" data-notes={m.id}>
                <h2>
                  <Link to={lecturePath(m.id)}>
                    <span className="notes-h1-kicker">{chapterName(m.id)}</span> {m.title}
                  </Link>
                </h2>
                <p className="notes-row-meta mono">
                  {fmtDate(m.date)} · {m.pages}
                  {feeds.length > 0 && ` · feeds ${feeds.join(', ')}`}
                </p>
                <p className="notes-row-topics">{m.topics.join('; ')}.</p>
                <ul className="notes-row-sections" aria-label={`Sections of ${chapterName(m.id)}`}>
                  {m.units.map((u) => (
                    <li key={u.id}>
                      <Link to={lecturePath(m.id, u.id)}>{u.title}</Link> <span className="notes-pages mono">{u.pages}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ol>
      )}
      <p className="small notes-later">Later lectures arrive after each class.</p>
    </div>
  )
}
