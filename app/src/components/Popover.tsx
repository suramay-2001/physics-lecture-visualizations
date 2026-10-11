/**
 * The small popover both the glossary (components/Gloss.tsx) and the notation cards (components/NotationCard.tsx) use:
 * portalled to <body> (no reflow of the prose, so scroll-trigger positions never move; stacking z 20 above the stage
 * canvas), fixed under its anchor, flipped above it when there is no room below, and clamped to the viewport on both
 * axes, so it stays on screen on a 375 px phone; when it fits neither below nor above its anchor it takes the roomier side and
 * scrolls inside (it never covers its anchor). It follows scrolling, resizing and its own content growing.
 * Styling is `.gloss-pop` (stage/story.css); callers add a class for what is theirs.
 */
import { useLayoutEffect, useState, type FocusEvent, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'

export const POPOVER_MAX_W = 320
const MARGIN = 8

export interface PopoverProps {
  id: string
  anchor: HTMLElement
  popRef: RefObject<HTMLElement | null>
  /** 'tooltip' for plain text; 'group' (with `label`) when the popover holds a link or button. */
  role: 'tooltip' | 'group'
  label?: string
  className?: string
  onEnter?: () => void
  onLeave?: () => void
  onKey?: (e: KeyboardEvent) => void
  onBlur?: (e: FocusEvent) => void
  children: ReactNode
}

export function Popover({ id, anchor, popRef, role, label, className = 'gloss-pop', onEnter, onLeave, onKey, onBlur, children }: PopoverProps) {
  const [pos, setPos] = useState<{ left: number; top: number; maxHeight?: number } | null>(null)
  useLayoutEffect(() => {
    const place = () => {
      const r = anchor.getBoundingClientRect()
      const pop = popRef.current
      // the natural height: `scrollHeight`, so a card that scrolls inside a capped box still reports how tall it wants to be
      const h = pop ? Math.max(pop.offsetHeight, pop.scrollHeight) : 0
      const w = Math.min(POPOVER_MAX_W, innerWidth - 2 * MARGIN, pop?.offsetWidth ?? POPOVER_MAX_W)
      const left = Math.min(Math.max(MARGIN, r.left), Math.max(MARGIN, innerWidth - w - MARGIN))
      // below the anchor when it fits, else above when it fits, else the side with more room, scrolling inside, never over the anchor
      const below = innerHeight - r.bottom - 6 - MARGIN
      const above = r.top - 6 - MARGIN
      const up = h > below && (h <= above || above > below)
      const room = Math.max(60, up ? above : below)
      const shownH = Math.min(h, room)
      const top = up ? r.top - 6 - shownH : r.bottom + 6
      setPos((p) => {
        const next = { left, top: Math.max(MARGIN, Math.min(top, innerHeight - shownH - MARGIN)), maxHeight: h > room ? room : undefined }
        return p && p.left === next.left && p.top === next.top && p.maxHeight === next.maxHeight ? p : next
      })
    }
    place()
    addEventListener('scroll', place, { passive: true })
    addEventListener('resize', place)
    const ro = typeof ResizeObserver === 'undefined' || !popRef.current ? null : new ResizeObserver(place)
    if (ro && popRef.current) ro.observe(popRef.current)
    return () => {
      removeEventListener('scroll', place)
      removeEventListener('resize', place)
      ro?.disconnect()
    }
  }, [anchor, popRef])
  return createPortal(
    <span
      ref={popRef as RefObject<HTMLSpanElement>}
      role={role}
      aria-label={role === 'group' ? label : undefined}
      id={id}
      className={className}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onKeyDown={onKey}
      onBlur={onBlur}
      style={{ position: 'fixed', left: pos?.left ?? -9999, top: pos?.top ?? 0, maxWidth: `min(${POPOVER_MAX_W}px, calc(100vw - ${2 * MARGIN}px))`, maxHeight: pos?.maxHeight, overflowY: pos?.maxHeight ? 'auto' : undefined }}
    >
      {children}
    </span>,
    document.body,
  )
}
