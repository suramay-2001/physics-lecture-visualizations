/**
 * The Papers section's pages (docs/specs/papers-platform.md §6; rulings papers.md R1, R2, R5). One lazy chunk: nothing here
 * reaches another course's first paint (build/chunks.test.ts rule (q)). Routes (App.tsx, paths.ts):
 *   #/papers                 the shelf: one card per paper (short title, authors, arXiv id + version, date, licence note) and
 *                            the background chapters (written ones listed, planned ones named);
 *   #/papers/ch/<id>         the lecture: the shared LecturePage over the compiled spec (content/load.ts → papers/compile.ts),
 *                            with the paper card on top; a spec that fails validation shows its problems instead;
 *   #/papers/refs/<id>       References used (R5): depth 1 or 2 (and via which), read vs cited, the part relied on, why, where the
 *                            idea is taught, and every step that relies on it;
 *   #/papers/prereq/<id>     the prerequisite map (R2): components/ConceptLines.tsx, one line per teaching chapter, each station
 *                            linked to the unit that teaches it.
 */
import { useEffect, useReducer, useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { ConceptLines, type ConceptLine, type ConceptStation } from '../components/ConceptLines'
import { chapterName, COURSES, isRegistered, metaFor, type CourseId } from '../content/courses'
import { loadPapersPack } from '../content/load'
import { metaById } from '../content/meta'
import { arxivHref, doiHref } from '../content/papers/links'
import { PAPER_CARDS, PLANNED_BACKGROUND, type PaperCard } from '../content/papers/registry'
import { paperIdOfFile } from '../papers/compile'
import type { PaperSpec, TeachRef } from '../papers/spec'
import { validatePaperSpec } from '../papers/validate'
import { lecturePath, paperPath, refAnchor } from '../paths'
import { LecturePage } from './LecturePage'
import { useHashScroll } from './useHashScroll'
import '../styles/papers.css'

/* ---------------------------------------------------------------------------------------------- */
/* Loading: the papers pack, a spec, and 709's light registry (for the names of 709 teaching units) */
/* ---------------------------------------------------------------------------------------------- */

type Load = 'loading' | 'ready' | 'failed'

/** The papers pack (glossaries, bridges), once per session; a retry after a failed chunk. */
function usePapersPack(wanted: boolean): [Load, () => void] {
  const [state, setState] = useState<Load>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!wanted) return
    let alive = true
    loadPapersPack().then(
      () => alive && setState('ready'),
      () => alive && setState('failed'),
    )
    return () => {
      alive = false
    }
  }, [wanted, attempt])
  return [state, () => (setState('loading'), setAttempt((n) => n + 1))]
}

/** Each spec is its own chunk (the same modules content/load.ts compiles), found by file name. */
const SPEC_MODULES = import.meta.glob<Record<string, unknown>>('../content/papers/[PB]*.paper.ts')
const specLoader = (id: string) => Object.entries(SPEC_MODULES).find(([f]) => paperIdOfFile(f) === id)?.[1]

type SpecLoad = { status: 'loading' } | { status: 'failed'; retry: () => void } | { status: 'invalid'; problems: string[] } | { status: 'ready'; spec: PaperSpec }

/** A chapter's spec, validated before anything is drawn from it (docs/specs/papers-platform.md §4, "load"). */
function useSpec(id: string): SpecLoad {
  const [state, setState] = useState<SpecLoad>({ status: 'loading' })
  const [attempt, retry] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    const load = specLoader(id)
    if (!load) return
    let alive = true
    setState({ status: 'loading' })
    load().then(
      (m) => {
        if (!alive) return
        const problems = validatePaperSpec(m[id])
        setState(problems.length ? { status: 'invalid', problems } : { status: 'ready', spec: m[id] as PaperSpec })
      },
      () => alive && setState({ status: 'failed', retry }),
    )
    return () => {
      alive = false
    }
  }, [id, attempt])
  return state
}

/** 709's light registry (its chapter and unit titles, its outline), fetched once for the names of 709 teaching places. */
type QcRegistry = typeof import('../content/qc709/registry')
let qcRegistry: QcRegistry | null = null
function useQcRegistry(): QcRegistry | null {
  const [, arrived] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    if (qcRegistry && isRegistered('qc709')) return
    let alive = true
    import('../content/qc709/registry').then(
      (m) => {
        qcRegistry = m
        if (alive) arrived()
      },
      () => {},
    )
    return () => {
      alive = false
    }
  }, [])
  return qcRegistry
}

/* ---------------------------------------------------------------------------------------------- */
/* Shared pieces                                                                                    */
/* ---------------------------------------------------------------------------------------------- */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
/** '2025-06' → 'June 2025'. */
const monthYear = (d: string) => {
  const [y, m] = d.split('-').map(Number)
  return MONTHS[m - 1] ? `${MONTHS[m - 1]} ${y}` : d
}
const arxivLabel = (id: string, version?: number) => `arXiv:${id}${version ? `v${version}` : ''}`

function External({ href, children }: { href: string | undefined; children: ReactNode }) {
  return href ? (
    <a href={href} rel="noopener noreferrer" target="_blank">
      {children}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  ) : (
    <>{children}</>
  )
}

/** Authors, institution, arXiv id and version, date, licence note: the card's facts (a shelf card and the lecture's header). */
function PaperFacts({ card }: { card: Pick<PaperCard, 'authors' | 'institution' | 'arxiv' | 'date' | 'licence'> }) {
  return (
    <>
      {card.authors && (
        <p className="paper-authors">
          {card.authors.join(', ')}
          {card.institution && <span className="paper-institution"> · {card.institution}</span>}
        </p>
      )}
      {card.arxiv && (
        <p className="paper-ids mono">
          <External href={arxivHref(card.arxiv.id, card.arxiv.version)}>{arxivLabel(card.arxiv.id, card.arxiv.version)}</External>
          {card.date && ` · ${monthYear(card.date)}`}
        </p>
      )}
      {card.licence && <p className="paper-licence">{card.licence}</p>}
    </>
  )
}

/** The links every paper offers: its lecture, its References used, its prerequisite map. */
function PaperLinks({ id, references, prerequisites, here }: { id: string; references: number; prerequisites: number; here?: 'lecture' | 'refs' | 'prereq' }) {
  const items: [string, string, 'lecture' | 'refs' | 'prereq'][] = [
    ['The lecture', lecturePath(id), 'lecture'],
    [`References used (${references})`, paperPath(id, 'refs'), 'refs'],
    [`Prerequisites (${prerequisites})`, paperPath(id, 'prereq'), 'prereq'],
  ]
  return (
    <nav className="paper-links" aria-label={`Chapter ${id}: its pages`}>
      <ul>
        {items.map(([label, to, k]) => (
          <li key={k}>
            {k === here ? (
              <span aria-current="page">{label}</span>
            ) : (
              <Link to={to} data-paper-link={k}>
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

const cardOf = (id: string): PaperCard | undefined => PAPER_CARDS.find((c) => c.id === id)

/** Not a written chapter: say so, and lead back to the shelf. */
function NotFound({ id }: { id: string }) {
  return (
    <div className="page papers-page">
      <p className="eyebrow">{COURSES.papers.code}</p>
      <h1>No chapter called “{id.slice(0, 40)}”</h1>
      <p>
        <Link to="/papers">Back to the shelf</Link>
      </p>
    </div>
  )
}

function Waiting({ id, failed, retry, what }: { id: string; failed: boolean; retry?: () => void; what: string }) {
  return (
    <div className="page lecture-loading papers-page" aria-busy={!failed}>
      <p className="eyebrow">Chapter {id}</p>
      {failed ? (
        <p role="alert">
          This {what} did not load. Check the connection, then{' '}
          <button type="button" className="topbar-button" onClick={retry}>
            try again
          </button>
          .
        </p>
      ) : (
        <p className="small">Loading the {what}…</p>
      )}
    </div>
  )
}

/** A spec that failed validation (it slipped past the gate): its problems, never a half-drawn page. */
function Invalid({ id, problems }: { id: string; problems: string[] }) {
  return (
    <div className="page papers-page">
      <p className="eyebrow">Chapter {id}</p>
      <h1>This chapter’s spec did not validate</h1>
      <div role="alert">
        <p>Nothing of it is drawn until every problem below is fixed (docs/specs/papers-platform.md §4):</p>
        <ul className="spec-problems mono">
          {problems.slice(0, 50).map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
      <p>
        <Link to="/papers">Back to the shelf</Link>
      </p>
    </div>
  )
}

/** "Physics 709 · Chapter Q6, unit 2 · The Bell basis" (or "… · planned"): where an idea is taught, in its course's words. */
function teachPlace(t: TeachRef, qc: QcRegistry | null): { text: string; to?: string; planned: boolean } {
  const c = COURSES[t.course]
  const meta = metaById(t.chapter)
  const k = t.unit && meta ? meta.units.findIndex((u) => u.id === t.unit) : -1
  if (meta && k >= 0) {
    const unitNo = t.course === 'sl448' ? `${meta.number}.${k + 1}` : String(k + 1)
    return { text: `${c.code} · ${chapterName(t.chapter)}, unit ${unitNo} · ${meta.units[k].title}`, to: lecturePath(t.chapter, t.unit), planned: false }
  }
  const outline = t.course === 'qc709' ? qc?.OUTLINE_CHAPTERS.find((o) => o.id === t.chapter) : undefined
  const title = meta?.title ?? outline?.title
  return { text: `${c.code} · ${chapterName(t.chapter)}${title ? ` · ${title}` : ''} (planned, not written yet)`, planned: true }
}

/* ---------------------------------------------------------------------------------------------- */
/* #/papers: the shelf                                                                              */
/* ---------------------------------------------------------------------------------------------- */

export function PapersShelf() {
  const papers = PAPER_CARDS.filter((c) => c.kind === 'paper')
  const background = PAPER_CARDS.filter((c) => c.kind === 'background')
  return (
    <div className="page papers-page papers-shelf">
      <p className="eyebrow">{COURSES.papers.fullTitle}</p>
      <h1>The reading desk</h1>
      <p className="section-lede">
        Research papers explained one at a time, in two tracks: Ground-up from school maths, Formal in full notation. Every step names the reference it
        relies on, every prerequisite links to the unit that teaches it, and the paper’s own numbers carry a <span className="reported-badge">Reported</span>{' '}
        badge, apart from the numbers this site computes.
      </p>
      <section aria-labelledby="shelf-papers">
        <h2 id="shelf-papers">Papers</h2>
        <ul className="paper-shelf">
          {papers.map((c) => (
            <li key={c.id}>
              <article className="paper-card" data-paper={c.id} aria-labelledby={`card-${c.id}`}>
                <p className="eyebrow">{chapterName(c.id)}</p>
                <h3 id={`card-${c.id}`}>
                  <Link to={lecturePath(c.id)}>{c.shortTitle ?? c.title}</Link>
                </h3>
                <p className="paper-lecture-title">{c.title}</p>
                <PaperFacts card={c} />
                <PaperLinks id={c.id} references={c.references} prerequisites={c.prerequisites} />
              </article>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="shelf-background">
        <h2 id="shelf-background">Background chapters</h2>
        <p>
          What no course textbook teaches becomes a background chapter of its own, shared by every paper that needs it; what a textbook does teach stays in Spin
          Lab or Physics 709, and a paper links there.
        </p>
        {background.length > 0 && (
          <ul className="paper-shelf">
            {background.map((c) => (
              <li key={c.id}>
                <article className="paper-card" data-paper={c.id}>
                  <p className="eyebrow">{chapterName(c.id)}</p>
                  <h3>
                    <Link to={lecturePath(c.id)}>{c.title}</Link>
                  </h3>
                  <PaperLinks id={c.id} references={c.references} prerequisites={c.prerequisites} />
                </article>
              </li>
            ))}
          </ul>
        )}
        <p className="planned-background">
          <span className="eyebrow">Planned, not written yet</span> {PLANNED_BACKGROUND.join('; ')}.
        </p>
      </section>
    </div>
  )
}

/* ---------------------------------------------------------------------------------------------- */
/* #/papers/ch/<id>: the lecture                                                                    */
/* ---------------------------------------------------------------------------------------------- */

function PaperAside({ id }: { id: string }) {
  const c = cardOf(id)
  if (!c) return null
  return (
    <div className="paper-aside">
      {c.kind === 'paper' && (
        <p className="eyebrow">
          The paper: <span className="paper-short">{c.shortTitle}</span>
        </p>
      )}
      <PaperFacts card={c} />
      <PaperLinks id={id} references={c.references} prerequisites={c.prerequisites} here="lecture" />
    </div>
  )
}

export default function PaperChapter() {
  const { id = '' } = useParams()
  const { search, hash } = useLocation()
  const upper = id.toUpperCase()
  const written = id === upper && !!metaById(upper) && metaFor('papers').some((m) => m.id === upper)
  const [pack, retry] = usePapersPack(written)
  const spec = useSpec(written ? upper : '')
  // a lower-case chapter id names the same chapter: the canonical URL is the upper-case one
  if (id !== upper && metaFor('papers').some((m) => m.id === upper)) return <Navigate to={{ pathname: lecturePath(upper), search, hash }} replace />
  if (!written) return <NotFound id={id} />
  if (spec.status === 'invalid') return <Invalid id={upper} problems={spec.problems} />
  if (spec.status === 'failed' || pack === 'failed') return <Waiting id={upper} failed retry={spec.status === 'failed' ? spec.retry : retry} what="chapter" />
  if (spec.status !== 'ready' || pack !== 'ready') return <Waiting id={upper} failed={false} what="chapter" />
  return <LecturePage aside={<PaperAside id={upper} />} />
}

/* ---------------------------------------------------------------------------------------------- */
/* #/papers/refs/<id>: References used (R5)                                                         */
/* ---------------------------------------------------------------------------------------------- */

/** The page head of a paper's own pages: the paper's name, and the links to its other pages. */
function PaperPageHead({ spec, here, title }: { spec: PaperSpec; here: 'refs' | 'prereq'; title: string }) {
  const c = cardOf(spec.id)
  return (
    <>
      <p className="eyebrow">
        {chapterName(spec.id)} · {spec.paper?.shortTitle ?? spec.title}
      </p>
      <h1>{title}</h1>
      <PaperLinks id={spec.id} references={c?.references ?? spec.references.length} prerequisites={c?.prerequisites ?? spec.prerequisites.length} here={here} />
    </>
  )
}

/** Wait for (and validate) a paper's spec, then draw `page` from it. */
function WithSpec({ page }: { page: (spec: PaperSpec) => ReactNode }) {
  const { id = '' } = useParams()
  const upper = id.toUpperCase()
  const written = !!specLoader(upper) && metaFor('papers').some((m) => m.id === upper)
  const spec = useSpec(written ? upper : '')
  if (!written) return <NotFound id={id} />
  if (spec.status === 'invalid') return <Invalid id={upper} problems={spec.problems} />
  if (spec.status === 'failed') return <Waiting id={upper} failed retry={spec.retry} what="page" />
  if (spec.status !== 'ready') return <Waiting id={upper} failed={false} what="page" />
  return <>{page(spec.spec)}</>
}

function ReferencesBody({ spec }: { spec: PaperSpec }) {
  useHashScroll()
  const { hash } = useLocation()
  const qc = useQcRegistry()
  const label = new Map(spec.references.map((r) => [r.id, r.label]))
  const steps = (refId: string) =>
    spec.units.flatMap((u, k) =>
      u.story
        .filter((b) => b.trail?.some((t) => t.ref === refId))
        .map((b) => ({ beat: b.id, unit: u, k, at: b.trail!.filter((t) => t.ref === refId).map((t) => t.at) })),
    )
  const ordered = [...spec.references].sort((a, b) => a.depth - b.depth)
  return (
    <div className="page papers-page papers-refs">
      <PaperPageHead spec={spec} here="refs" title="References used" />
      <p className="section-lede">
        Every reference this lecture leans on, followed only as far as a step needs it: depth 1 is cited by the paper itself, depth 2 by one of those. A
        reference is <strong>read</strong> when the part a step relies on was read, and <strong>cited</strong> while it is only cited. Each says where its idea is
        taught and which steps rely on it.
      </p>
      {ordered.length === 0 ? (
        <p>This chapter relies on no reference yet.</p>
      ) : (
        <ol className="ref-entries">
          {ordered.map((r) => {
            const taught = r.taughtIn ? teachPlace(r.taughtIn, qc) : null
            const used = steps(r.id)
            return (
              <li key={r.id}>
                <article id={refAnchor(r.id)} className="ref-entry" data-depth={r.depth} data-status={r.status} data-target={hash === `#${refAnchor(r.id)}` ? 'true' : undefined} tabIndex={-1} aria-labelledby={`${refAnchor(r.id)}-h`}>
                  <h2 id={`${refAnchor(r.id)}-h`}>{r.label}</h2>
                  <p className="ref-ids mono">
                    {r.arxiv && <External href={arxivHref(r.arxiv.id, r.arxiv.version)}>{arxivLabel(r.arxiv.id, r.arxiv.version)}</External>}
                    {r.arxiv && r.doi && ' · '}
                    {r.doi && <External href={doiHref(r.doi)}>doi:{r.doi}</External>}
                  </p>
                  <ul className="ref-tags">
                    <li className="ref-depth" data-depth={r.depth}>
                      {r.depth === 1 ? 'Depth 1 · cited by the paper' : `Depth 2 · cited by ${label.get(r.via ?? '') ?? r.via}`}
                    </li>
                    <li className="ref-status" data-status={r.status}>
                      {r.status === 'read' ? `Read: ${r.reliedOn}` : 'Cited only, not read yet'}
                    </li>
                  </ul>
                  <p>
                    <span className="ref-field">Why it is needed:</span> {r.why}
                  </p>
                  <p>
                    <span className="ref-field">Where the idea is taught:</span>{' '}
                    {taught ? taught.to ? <Link to={taught.to}>{taught.text}</Link> : taught.text : 'not taught on this site yet'}
                  </p>
                  {used.length > 0 && (
                    <div>
                      <span className="ref-field">Steps that rely on it:</span>
                      <ul className="ref-steps">
                        {used.map((s) => (
                          <li key={s.beat}>
                            <Link to={{ pathname: lecturePath(spec.id), search: `?at=${encodeURIComponent(s.beat)}&f=0.5` }}>
                              Unit {s.k + 1}, step {s.beat.split(':b')[1]} · {s.unit.title}
                            </Link>{' '}
                            <span className="small">({s.at.join('; ')})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

export function PaperReferences() {
  return <WithSpec page={(spec) => <ReferencesBody spec={spec} />} />
}

/* ---------------------------------------------------------------------------------------------- */
/* #/papers/prereq/<id>: the prerequisite map (R2)                                                  */
/* ---------------------------------------------------------------------------------------------- */

const COURSE_ORDER: readonly CourseId[] = ['sl448', 'qc709', 'papers']

function PrereqBody({ spec }: { spec: PaperSpec }) {
  useHashScroll()
  const qc = useQcRegistry()
  // one line per teaching chapter: Spin Lab's first, then 709's, then the Papers section's, each in the order the graph names them
  const chapters: TeachRef[] = []
  for (const n of spec.prerequisites) if (!chapters.some((c) => c.chapter === n.teach.chapter)) chapters.push(n.teach)
  chapters.sort((a, b) => COURSE_ORDER.indexOf(a.course) - COURSE_ORDER.indexOf(b.course))
  const lines: ConceptLine[] = chapters.map((t) => {
    const meta = metaById(t.chapter)
    const outline = t.course === 'qc709' ? qc?.OUTLINE_CHAPTERS.find((o) => o.id === t.chapter) : undefined
    const title = meta?.title ?? outline?.title ?? chapterName(t.chapter)
    return {
      id: t.chapter,
      anchor: `prereq-${t.chapter}`,
      num: t.course === 'sl448' && meta ? `L${meta.number}` : t.chapter,
      kicker: COURSES[t.course].code,
      title,
      built: !!meta,
      to: meta ? lecturePath(t.chapter) : undefined,
    }
  })
  const stations: ConceptStation[] = spec.prerequisites.map((n) => ({
    id: n.id,
    line: n.teach.chapter,
    label: n.label,
    to: n.teach.unit && metaById(n.teach.chapter) ? lecturePath(n.teach.chapter, n.teach.unit) : undefined,
    needs: n.needs,
  }))
  return (
    <div className="page papers-page map-page papers-prereq">
      <PaperPageHead spec={spec} here="prereq" title="Prerequisites" />
      <p className="section-lede">
        What this lecture builds on, each idea linked to the one unit that teaches it: in Spin Lab (Physics 448), in Physics 709, in a background chapter or in
        the lecture itself. Hover or focus an idea to see what it builds on (solid) and what builds on it (dashed). An idea whose chapter is not written yet is
        marked in preparation.
      </p>
      <ConceptLines lines={lines} stations={stations} />
    </div>
  )
}

export function PaperPrereqs() {
  return <WithSpec page={(spec) => <PrereqBody spec={spec} />} />
}
