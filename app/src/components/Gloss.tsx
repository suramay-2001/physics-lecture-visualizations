/**
 * `[[gloss]]` → a focusable button with a one-sentence popover (W-L1 §1.3; the "meeting it cold" layer).
 * The popover is portalled to <body> (no reflow of the prose, so scroll-trigger positions never move;
 * stacking z 20 above the stage canvas), positioned fixed under the button and clamped to the viewport.
 *   - hover intent: opens after 250 ms over the button, closes 150 ms after the pointer leaves both
 *   - click / Enter / Space pins it open (toggle); Esc closes and keeps focus on the button
 *   - focus shows it, blur hides it; `aria-describedby` points at it while open
 * Same props as W0, so Rich.tsx does not change.
 */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { lookupGloss } from '../content/glossRegistry'
import { Rich } from '../ui/Rich'

const OPEN_MS = 250
const CLOSE_MS = 150
const MAX_W = 320

function GlossPopover({ id, anchor, text, onEnter, onLeave }: { id: string; anchor: HTMLElement; text: string; onEnter: () => void; onLeave: () => void }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  useLayoutEffect(() => {
    const place = () => {
      const r = anchor.getBoundingClientRect()
      const h = ref.current?.offsetHeight ?? 0
      const w = Math.min(MAX_W, ref.current?.offsetWidth ?? MAX_W)
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
  }, [anchor])
  return createPortal(
    <span
      ref={ref}
      role="tooltip"
      id={id}
      className="gloss-pop"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{ position: 'fixed', left: pos?.left ?? -9999, top: pos?.top ?? 0, maxWidth: MAX_W }}
    >
      <Rich as="span" text={text} />
    </span>,
    document.body,
  )
}

export function Gloss({ id, children }: { id: string; children: ReactNode }) {
  const entry = lookupGloss(id)
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const popId = useId()
  const [btn, setBtn] = useState<HTMLButtonElement | null>(null)
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

  if (!entry) return <span className="gloss gloss-missing">{children}</span>
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      clear()
      setOpen(false)
      setPinned(false)
    }
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
        }}
        onKeyDown={onKey}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          clear()
          setOpen(false)
          setPinned(false)
        }}
        onPointerEnter={hoverIn}
        onPointerLeave={hoverOut}
      >
        {children}
      </button>
      {shown && btn && (
        <GlossPopover id={popId} anchor={btn} text={`**${entry.term}**: ${entry.gloss}`} onEnter={keepOpen} onLeave={hoverOut} />
      )}
    </span>
  )
}
