/**
 * `[[gloss]]` → a focusable button with a one-sentence popover (W-L1 §1.3; the "meeting it cold" layer).
 * The popover is portalled to <body> (no reflow of the prose, so scroll-trigger positions never move;
 * stacking z 20 above the stage canvas), positioned fixed under the button and clamped to the viewport.
 *   - hover intent: opens after 250 ms over the button, closes 150 ms after the pointer leaves both
 *   - click / Enter / Space pins it open (toggle); Esc closes and keeps focus on the button
 *   - focus shows it, blur hides it; `aria-describedby` points at it while open
 * Same props as W0, so Rich.tsx does not change.
 *
 * Two tracks: the popover reads the page's track (`GlossEntry.formal` in Formal). Bridges (W-709-platform §C): an
 * entry with `bridge` offers "Learn it in Spin Lab 2.3" (BridgeLink) inside the popover. Such a popover is interactive,
 * so it is a labelled group rather than a tooltip: pinning it (click / Enter / Space) moves focus to the link, Esc
 * returns focus to the term, and focus leaving both closes it.
 */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { lookupGloss } from '../content/glossRegistry'
import { pickGloss } from '../content/track'
import { Rich } from '../ui/Rich'
import { useTrackContext } from '../ui/trackPref'
import { BridgeLink } from './BridgeLink'

const OPEN_MS = 250
const CLOSE_MS = 150
const MAX_W = 320

interface PopoverProps {
  id: string
  anchor: HTMLElement
  text: string
  label: string
  bridge?: string
  popRef: RefObject<HTMLSpanElement | null>
  onEnter: () => void
  onLeave: () => void
  onKey: (e: KeyboardEvent) => void
  onBlur: (e: FocusEvent) => void
}

function GlossPopover({ id, anchor, text, label, bridge, popRef, onEnter, onLeave, onKey, onBlur }: PopoverProps) {
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  useLayoutEffect(() => {
    const place = () => {
      const r = anchor.getBoundingClientRect()
      const h = popRef.current?.offsetHeight ?? 0
      const w = Math.min(MAX_W, popRef.current?.offsetWidth ?? MAX_W)
      const left = Math.min(Math.max(8, r.left), innerWidth - w - 8)
      const below = r.bottom + 6
      const top = below + h > innerHeight - 8 && r.top - h - 6 > 8 ? r.top - h - 6 : below
      setPos({ left, top })
    }
    place()
    addEventListener('scroll', place, { passive: true })
    addEventListener('resize', place)
    return () => {
      removeEventListener('scroll', place)
      removeEventListener('resize', place)
    }
  }, [anchor, popRef])
  return createPortal(
    <span
      ref={popRef}
      role={bridge ? 'group' : 'tooltip'}
      aria-label={bridge ? label : undefined}
      id={id}
      className={bridge ? 'gloss-pop gloss-pop-bridge' : 'gloss-pop'}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onKeyDown={bridge ? onKey : undefined}
      onBlur={bridge ? onBlur : undefined}
      style={{ position: 'fixed', left: pos?.left ?? -9999, top: pos?.top ?? 0, maxWidth: MAX_W }}
    >
      <Rich as="span" text={text} />
      {bridge && (
        <span className="gloss-bridge">
          <BridgeLink id={bridge} variant="gloss" />
        </span>
      )}
    </span>,
    document.body,
  )
}

export function Gloss({ id, children }: { id: string; children: ReactNode }) {
  const entry = lookupGloss(id)
  const track = useTrackContext()
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const popId = useId()
  const [btn, setBtn] = useState<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLSpanElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  const later = (fn: () => void, ms: number) => {
    clear()
    timer.current = setTimeout(fn, ms)
  }
  useEffect(() => clear, [])
  const hoverIn = useCallback(() => later(() => setOpen(true), OPEN_MS), [])
  const hoverOut = useCallback(() => {
    if (!pinned) later(() => setOpen(false), CLOSE_MS)
  }, [pinned])
  const keepOpen = useCallback(() => clear(), [])
  const bridge = entry?.bridge
  // pinning an entry with a bridge moves focus into its popover (the link), once the popover is on the page
  const [focusIn, setFocusIn] = useState(false)
  useEffect(() => {
    if (!focusIn || !open) return
    const raf = requestAnimationFrame(() => {
      popRef.current?.querySelector<HTMLElement>('a[href]')?.focus()
      setFocusIn(false)
    })
    return () => cancelAnimationFrame(raf)
  }, [focusIn, open])

  if (!entry) return <span className="gloss gloss-missing">{children}</span>
  const close = () => {
    clear()
    setOpen(false)
    setPinned(false)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      const inside = !!popRef.current?.contains(document.activeElement)
      close()
      if (inside) btn?.focus()
    }
  }
  /** Focus moved: close, unless it went between the term and its interactive popover. */
  const onBlur = (e: FocusEvent) => {
    const to = e.relatedTarget as Node | null
    if (bridge && to && (popRef.current?.contains(to) || btn?.contains(to))) return
    close()
  }
  const shown = open && typeof document !== 'undefined'
  return (
    <span className="gloss-wrap">
      <button
        ref={setBtn}
        type="button"
        className="gloss"
        data-gloss={id}
        aria-expanded={open}
        aria-describedby={shown ? popId : undefined}
        onClick={() => {
          clear()
          const next = !(open && pinned)
          setPinned(next)
          setOpen(next)
          if (next && bridge) setFocusIn(true)
        }}
        onKeyDown={onKey}
        onFocus={() => setOpen(true)}
        onBlur={onBlur}
        onPointerEnter={hoverIn}
        onPointerLeave={hoverOut}
      >
        {children}
      </button>
      {shown && btn && (
        <GlossPopover
          id={popId}
          anchor={btn}
          text={`**${entry.term}**: ${pickGloss(entry, track)}`}
          label={entry.term.replace(/\$[^$]*\$/g, '').trim() || entry.id}
          bridge={bridge}
          popRef={popRef}
          onEnter={keepOpen}
          onLeave={hoverOut}
          onKey={onKey}
          onBlur={onBlur}
        />
      )}
    </span>
  )
}
