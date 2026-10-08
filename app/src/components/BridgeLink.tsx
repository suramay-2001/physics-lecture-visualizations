/**
 * A bridge with a way back (W-709-platform §C; the approved mockup's `.bridge` chip: a swatch of 448's glass and its
 * typeface, "↑ Spin Lab 2.5"; up means out of the fridge). Both directions (interface change W-448 #4): a 709 chapter's
 * `qc-…` bridge opens a Spin Lab unit ("↑ Spin Lab 2.5"); a 448 lecture's `sl-…` bridge opens a 709 unit ("↓ Go further in
 * 709 · Chapter Q14", navy and gilt like the fridge). Following one:
 *   1. probes the reader's place: the beat under the centre line (stage/readingPosition.ts), or, when the link sits in
 *      another beat, the link's own position in that beat, so the same line comes back under the centre line;
 *   2. writes it into the CURRENT URL with history.replaceState (`?at=<beat>&f=<frac>`), so Back works too;
 *   3. pushes the target (lecturePath('L2') + ?ret=qc709~Q3~q3-bell:b4~0.42~formal + #l2-complex, or lecturePath('Q14') +
 *      ?ret=sl448~L8~l8-attack:b2~0.42~ground + #q14-min-error); ui/returnParam.ts parses `ret`, components/ReturnBar.tsx
 *      shows the way back. A bridge followed from a page that already carries a `ret` (a chain) carries that `ret`
 *      forward, so the way back always leads to where the reader left their own course.
 * A plain click is handled here; a middle click or a modified click opens the same href (built from the link's own
 * beat) in a new tab, whose return bar works the same way. In print, a bridge is a numbered footnote naming its
 * target (BridgeNotes, styles/print.css).
 */
import { createContext, useContext, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { useHref, useInRouterContext, useLocation, useNavigate, useParams } from 'react-router-dom'
import { bridgeChipText, bridgeGloss, bridgePlace, type BridgeTarget, leavesSpinLab, lookupBridge } from '../content/bridgeRegistry'
import { COURSES, COURSE_IDS, courseOfId, type CourseId } from '../content/courses'
import { metaById } from '../content/meta'
import { lecturePath } from '../paths'
import { BeatContext, beatElement, probeReadingPosition } from '../stage/readingPosition'
import { formatReturn, parseReturnSyntax, retOf } from '../ui/returnParam'
import { useTrackContext } from '../ui/trackPref'
import '../styles/bridge.css'

/** Print footnote numbers of the bridges on a page section (StaticStory provides one per unit). */
export const BridgeNotesContext = createContext<ReadonlyMap<string, number> | null>(null)

/** Router state a bridge leaves on its target, so the return bar can move focus to the target heading once. */
export interface BridgeArrival {
  bridgeArrival: { unit: string; beat: string | null }
}

/** The unit (and chapter-card heading) a bridge lands on, as an in-app path with its anchor. */
export const bridgePath = (t: BridgeTarget): { pathname: string; hash: string } => ({ pathname: lecturePath(t.lecture), hash: `#${t.unit}` })

/** The course whose chapter page this is (L8 → Spin Lab, Q3 / F2 → 709), or null for any other id. */
const chapterCourse = (chapter: string): CourseId | null => COURSE_IDS.find((c) => COURSES[c].chapterId.test(chapter) && courseOfId(chapter) === c) ?? null

/** Where the reader is, relative to the link: [place, frac] for the `ret` field, or null outside any beat. */
function placeOfLink(link: HTMLElement | null, ownBeat: string | null): { place: string; frac: number } | null {
  const probe = probeReadingPosition()
  if (!ownBeat) return probe ? { place: probe.beat, frac: probe.frac } : null
  if (probe?.beat === ownBeat) return { place: ownBeat, frac: probe.frac }
  const b = beatElement(ownBeat)
  if (b && link) {
    const br = b.getBoundingClientRect()
    const lr = link.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (lr.top + lr.height / 2 - br.top) / Math.max(1, br.height)))
    return { place: ownBeat, frac: Math.round(frac * 1000) / 1000 }
  }
  return { place: ownBeat, frac: 0.5 }
}

interface BridgeProps {
  id: string
  children?: ReactNode
  /** 'inline' = the prose chip; 'gloss' = "Learn it in Spin Lab 2.3" in a gloss popover. */
  variant?: 'inline' | 'gloss'
}

/** A bridge link; outside a router (server-rendered tests, print figures) it is the same chip without the way back. */
export function BridgeLink(props: BridgeProps) {
  return useInRouterContext() ? <RoutedBridge {...props} /> : <BridgeChip {...props} href={undefined} />
}

function BridgeChip({ id, children, variant = 'inline', href, onClick, onFocus, linkRef }: BridgeProps & {
  href: string | undefined
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  onFocus?: () => void
  linkRef?: RefObject<HTMLAnchorElement | null>
}) {
  const target = lookupBridge(id)
  const place = target ? bridgePlace(target) : null
  const notes = useContext(BridgeNotesContext)
  if (!target || !place) return <span className="bridge-missing">{children}</span>
  const n = notes?.get(id)
  const gloss = bridgeGloss(target, place.title)
  const where = `${COURSES[target.course].code}, ${place.title}${gloss ? `: ${gloss}` : ''}`
  const text = bridgeChipText(id, target, variant) ?? place.short
  return (
    <a
      ref={linkRef}
      className={`bridge bridge-${variant}`}
      href={href}
      data-bridge={id}
      data-to={target.course}
      data-from={leavesSpinLab(id, target) ? 'sl448' : undefined}
      onClick={onClick}
      onPointerDown={onFocus}
      onFocus={onFocus}
      title={where}
    >
      {variant === 'gloss' ? (
        <span className="bridge-text">{text}</span>
      ) : (
        <>
          {children && <span className="bridge-shown">{children}</span>}
          <span className="bridge-chip">
            <span className="bridge-go" aria-hidden="true">
              {leavesSpinLab(id, target) ? '↓' : '↑'}
            </span>
            <span className="bridge-text">{text}</span>
          </span>
        </>
      )}
      <span className="visually-hidden">{`, ${where}. A return bar brings you back.`}</span>
      {n !== undefined && (
        <sup className="print-fn" aria-hidden="true">
          {n}
        </sup>
      )}
    </a>
  )
}

function RoutedBridge({ id, children, variant = 'inline' }: BridgeProps) {
  const target = lookupBridge(id)
  const place = target ? bridgePlace(target) : null
  const { id: chapterParam = '' } = useParams()
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const track = useTrackContext()
  const ownBeat = useContext(BeatContext)
  const ref = useRef<HTMLAnchorElement>(null)
  // the course page this link sits on and its chapter: the way back leads here (a route id is case-insensitive)
  const chapter = metaById(chapterParam)?.id ?? chapterParam
  const from = chapterCourse(chapter)
  const carried = parseReturnSyntax(retOf(search)) ? retOf(search) : null
  const retFor = (p: { place: string; frac: number } | null): string | null =>
    carried ?? (from && p ? formatReturn({ course: from, chapter, unit: p.place.split(':')[0], beat: p.place.includes(':') ? p.place : null, frac: p.frac, track }) : null)
  // the href a new tab opens: the link's own beat until a pointer or focus refreshes it with the live position
  const [ret, setRet] = useState<string | null>(() => retFor(ownBeat ? { place: ownBeat, frac: 0.5 } : null))
  const to = target ? bridgePath(target) : { pathname: '/', hash: '' }
  const href = useHref({ pathname: to.pathname, search: ret ? `?ret=${ret}` : '', hash: to.hash })
  if (!target || !place) return <span className="bridge-missing">{children}</span>
  const refresh = () => setRet(retFor(placeOfLink(ref.current, ownBeat)))
  const follow = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    const p = placeOfLink(ref.current, ownBeat)
    const r = retFor(p)
    // 2. the way back, also for the browser's Back button: this entry now names the place (router state kept)
    if (from && p && !carried) {
      const q = new URLSearchParams(search)
      q.set('at', p.place)
      q.set('f', String(p.frac))
      history.replaceState(history.state, '', `${location.pathname}${location.search}#${pathname}?${q.toString()}${hash}`)
    }
    const state: BridgeArrival = { bridgeArrival: { unit: target.unit, beat: target.beat ?? null } }
    navigate({ pathname: to.pathname, search: r ? `?ret=${r}` : '', hash: to.hash }, { state })
  }
  return (
    <BridgeChip id={id} variant={variant} href={href} onClick={follow} onFocus={refresh} linkRef={ref}>
      {children}
    </BridgeChip>
  )
}

/**
 * The print footnotes of one section: each bridge named once, numbered in reading order, with its target
 * ("Spin Lab (Physics 448), Lecture 2, unit 2.3, “Numbers that turn”: complex numbers as turns"). Print only.
 */
export function BridgeNotes({ ids }: { ids: readonly string[] }) {
  const rows = ids.flatMap((id, i) => {
    const t = lookupBridge(id)
    const p = t && bridgePlace(t)
    return t && p ? [{ id, n: i + 1, t, p }] : []
  })
  if (!rows.length) return null
  return (
    <ol className="print-notes" aria-label="Bridges in this section">
      {rows.map(({ id, n, t, p }) => (
        <li key={id} value={n}>
          {t.course === 'sl448'
            ? `${COURSES.sl448.title} (${COURSES.sl448.code}), Lecture ${p.lectureNumber}, unit ${p.unitNumber}, “${p.title}”${bridgeGloss(t, p.title) ? `: ${t.label}` : ''}.`
            : `${COURSES[t.course].code}, ${p.short}: ${t.label}.`}
        </li>
      ))}
    </ol>
  )
}
