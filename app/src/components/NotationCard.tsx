/**
 * The notation card (notation explainers, decisions/notation-explainers.md): the plain-English popover for one mark.
 * Loaded lazily by components/NotationHost.tsx the first time a card is wanted, together with the dictionary
 * (content/notation.ts). It reuses the glossary's popover (components/Popover.tsx, `.gloss-pop`) and says, in this order:
 * the symbol, its name and how to read it aloud; what it means (the reader's track: 709 Formal has its own voice, 448
 * and Ground-up one); a tiny worked example whose numbers the engine computed; what it means in this spot, built from
 * the text the pre-processor captured from THIS formula, and in physics; and a link to where it is taught, with the
 * usual return bar (components/BridgeLink.tsx). Its own maths is not itself explainable (`NotationScope` off).
 * Plain text throughout, so a screen reader that lands on the formula hears the card (`aria-describedby`).
 */
import { useEffect, useMemo, type ReactNode, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import { registerBridges } from '../content/bridgeRegistry'
import { meaningOf, NOTATION_BY_ID, physicsOf, taughtBridge, type Seg } from '../content/notation'
import { useCourse } from '../course/CourseContext'
import { NotationScopeContext } from '../ui/notationPref'
import { readMark } from '../ui/notationCodec'
import { Rich, Tex, UserTex } from '../ui/Rich'
import { TrackContext, useTrack } from '../ui/trackPref'
import { BridgeLink } from './BridgeLink'
import { Popover } from './Popover'

const OFF = { off: true } as const
const CHAPTER = /\/(?:lecture|ch)\/([A-Za-z]\d+)/

/** Card text: words and TeX pieces. */
function Segs({ of }: { of: readonly Seg[] }): ReactNode {
  return of.map((s, k) =>
    typeof s === 'string' ? s : s.user ? <UserTex key={k} src={s.tex} /> : <Tex key={k}>{s.tex}</Tex>,
  )
}

export interface NotationCardProps {
  id: string
  anchor: HTMLElement
  pinned: boolean
  /** move focus to the card's link once it is up (the keyboard pinned it) */
  focusIn: boolean
  popRef: RefObject<HTMLElement | null>
  onEnter: () => void
  onLeave: () => void
  onClose: () => void
}

export default function NotationCard({ id, anchor, pinned, focusIn, popRef, onEnter, onLeave, onClose }: NotationCardProps) {
  const course = useCourse()
  const { search, pathname } = useLocation()
  const track = useTrack(course, search)
  const { id: notation, ctx } = readMark(anchor)
  const entry = NOTATION_BY_ID.get(notation)
  const example = useMemo(() => entry?.example(), [entry])
  // idempotent: the same bridge object is registered again and again
  const bridge = entry ? taughtBridge(entry, course) : null
  if (bridge) registerBridges({ [bridge.id]: bridge.target })

  useEffect(() => {
    if (!pinned || !focusIn) return
    const raf = requestAnimationFrame(() => popRef.current?.querySelector<HTMLElement>('a[href]')?.focus())
    return () => cancelAnimationFrame(raf)
  }, [pinned, focusIn, popRef, anchor])

  if (!entry || !example) return null
  // what the pre-processor captured from this formula, in words; the physics follows it
  const here = entry.here?.(ctx, track) ?? null
  return (
    <TrackContext.Provider value={track}>
      <NotationScopeContext.Provider value={OFF}>
        <Popover id={id} anchor={anchor} popRef={popRef} role={bridge ? 'group' : 'tooltip'} label={entry.name} className="gloss-pop notation-card" onEnter={onEnter} onLeave={onLeave}>
          <span className="nc-head">
            <span className="nc-sym">
              <Tex>{entry.tex}</Tex>
            </span>
            <span className="nc-name">{entry.name}</span>
            {pinned && (
              <button type="button" className="nc-close" aria-label="Close this explanation" onClick={onClose}>
                ×
              </button>
            )}
          </span>
          <span className="nc-say">
            Read it as: <q>{entry.say}</q>
          </span>
          <span className="nc-block">
            <Rich as="span" text={meaningOf(entry, track)} />
          </span>
          <span className="nc-block nc-example">
            <span className="nc-label">Example</span>
            <span className="nc-ex-tex">
              <Tex>{example.tex}</Tex>
            </span>
            <span>{example.says}</span>
          </span>
          <span className="nc-block nc-here">
            <span className="nc-label">In this spot</span>
            {here && (
              <span className="nc-ctx">
                <Segs of={here} />{' '}
              </span>
            )}
            <Rich as="span" text={physicsOf(entry, track)} />
          </span>
          {bridge && (
            <span className="nc-link">
              <BridgeLink id={bridge.id} variant="gloss" chapter={CHAPTER.exec(pathname)?.[1]} />
            </span>
          )}
        </Popover>
      </NotationScopeContext.Provider>
    </TrackContext.Provider>
  )
}
