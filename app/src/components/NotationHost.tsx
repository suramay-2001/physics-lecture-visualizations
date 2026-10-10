/**
 * The ONE delegated listener of the notation explainers (decisions/notation-explainers.md). With "Explain notation"
 * on, every `<span data-notation>` KaTeX renders (ui/notationMark.ts adds them) opens a plain-English card
 * (components/NotationCard.tsx, loaded the first time one is wanted):
 *   - mouse: hovering a mark for 300 ms opens its card; clicking pins it; moving off closes an unpinned card after a
 *     short grace (and the card itself can be entered); a press anywhere else closes a pinned one;
 *   - touch: a tap pins the card, a tap elsewhere closes it (hover does not apply);
 *   - keyboard: a formula with marks is a tab stop (ui/Rich.tsx makes its `.katex` box focusable); focus shows the card
 *     of its first mark, ← → ↑ ↓ move between the marks, Enter or Space pins (and moves into the card's link), Esc
 *     closes and returns to the formula, leaving the formula closes the card;
 *   - screen readers: the formula's `aria-describedby` points at the open card, which is plain text.
 * Marks inside a glossary popover or a card are not explained (their TeX is not marked in the first place).
 * One listener per event type on `document`, however many formulas there are. Lives in the entry chunk, and small:
 * the card, the dictionary and the pre-processor are lazy.
 */
import { lazy, Suspense, useCallback, useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { IslandBoundary } from '../ui/ErrorBoundary'
import { useNotationOn } from '../ui/notationPref'
import '../styles/notation.css'

const loadCard = () => import('./NotationCard')
const NotationCard = lazy(loadCard)
/** Start fetching the card (a failed fetch is retried by the next call; the maths just stays unexplained). */
const preload = () => void loadCard().catch(() => undefined)

const OPEN_MS = 300
const SWITCH_MS = 120
const CLOSE_MS = 220

interface Open {
  anchor: HTMLElement
  host: HTMLElement | null
  pinned: boolean
  /** opened from the keyboard: stays until focus leaves the formula */
  key: boolean
  /** move focus to the card's link once it is on the page */
  focusIn: boolean
}

/** The mark under a node, when it is a real one in a formula (not in a popover or a card). */
function markOf(n: EventTarget | null): HTMLElement | null {
  if (!(n instanceof Element)) return null
  const a = n.closest<HTMLElement>('[data-notation]')
  return a && a.closest('.katex-html') && !a.closest('.notation-card, .gloss-pop') ? a : null
}
const hostOf = (el: Element | null) => el?.closest<HTMLElement>('.katex') ?? null
const marksIn = (host: HTMLElement) => [...host.querySelectorAll<HTMLElement>('.katex-html [data-notation]')].filter((m) => markOf(m) === m)
const isHost = (t: EventTarget | null): t is HTMLElement => t instanceof HTMLElement && t.classList.contains('katex')

export function NotationHost() {
  const enabled = useNotationOn()
  const { pathname } = useLocation()
  const cardId = useId()
  const [open, setOpen] = useState<Open | null>(null)
  const cur = useRef<Open | null>(null)
  const timer = useRef<{ open?: number; close?: number }>({})
  const cardRef = useRef<HTMLElement | null>(null)

  const set = useCallback(
    (next: Open | null) => {
      const prev = cur.current
      if (prev && prev.anchor !== next?.anchor) prev.anchor.removeAttribute('data-nopen')
      if (prev?.host && prev.host !== next?.host) prev.host.removeAttribute('aria-describedby')
      cur.current = next
      next?.anchor.setAttribute('data-nopen', '')
      next?.host?.setAttribute('aria-describedby', cardId)
      setOpen(next)
    },
    [cardId],
  )

  useEffect(() => {
    if (!enabled) {
      set(null)
      return
    }
    const t = timer.current
    const clear = () => {
      clearTimeout(t.open)
      clearTimeout(t.close)
    }
    const close = () => {
      clear()
      set(null)
    }
    const show = (anchor: HTMLElement, pinned: boolean, key = false, focusIn = false) => {
      clear()
      set({ anchor, host: hostOf(anchor), pinned, key, focusIn })
    }
    const laterClose = () => {
      clearTimeout(t.close)
      t.close = window.setTimeout(close, CLOSE_MS)
    }

    const over = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const a = markOf(e.target)
      const c = cur.current
      if (a) {
        preload() // fetch the card while the 300 ms run
        clearTimeout(t.close)
        if (c && (c.anchor === a || c.pinned || c.key)) return
        clearTimeout(t.open)
        t.open = window.setTimeout(() => show(a, false), c ? SWITCH_MS : OPEN_MS)
        return
      }
      clearTimeout(t.open)
      if (e.target instanceof Element && e.target.closest('.notation-card')) clearTimeout(t.close)
      else if (c && !c.pinned && !c.key) laterClose()
    }
    const out = (e: PointerEvent) => {
      if (!e.relatedTarget && e.pointerType !== 'touch') {
        clearTimeout(t.open)
        if (cur.current && !cur.current.pinned && !cur.current.key) laterClose()
      }
    }
    const down = (e: PointerEvent) => {
      const c = cur.current
      const n = e.target as Node
      if (c && !cardRef.current?.contains(n) && !c.anchor.contains(n)) close()
    }
    const click = (e: MouseEvent) => {
      const a = markOf(e.target)
      if (!a) return
      const c = cur.current
      if (c?.anchor === a && c.pinned) close()
      else show(a, true)
    }
    let skipFocus = false
    const focusin = (e: FocusEvent) => {
      const el = e.target
      if (skipFocus || !isHost(el) || !el.matches(':focus-visible')) return
      const marks = marksIn(el)
      if (marks.length) {
        preload()
        show(marks[0], false, true)
      }
    }
    const focusout = (e: FocusEvent) => {
      const c = cur.current
      const to = e.relatedTarget as Node | null
      if (c && !(to && (cardRef.current?.contains(to) || c.host?.contains(to)))) close()
    }
    const keydown = (e: KeyboardEvent) => {
      const c = cur.current
      if (e.key === 'Escape') {
        if (!c) return
        e.stopPropagation()
        const inside = !!cardRef.current?.contains(document.activeElement)
        const host = c.host
        close()
        if (inside && host) {
          skipFocus = true // putting focus back on the formula must not open its card again
          host.focus()
          skipFocus = false
        }
        return
      }
      if (!isHost(e.target)) return
      const host = e.target
      const marks = marksIn(host)
      if (!marks.length) return
      const confirm = e.key === 'Enter' || e.key === ' '
      if (!c || c.host !== host) {
        if (confirm) {
          e.preventDefault()
          preload()
          show(marks[0], true, true, true)
        }
        return
      }
      const i = marks.indexOf(c.anchor)
      const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
      if (step && marks[i + step]) {
        e.preventDefault()
        set({ ...c, anchor: marks[i + step], focusIn: false })
      } else if (confirm) {
        e.preventDefault()
        if (c.pinned) close()
        else show(c.anchor, true, true, true)
      }
    }

    document.addEventListener('pointerover', over)
    document.addEventListener('pointerout', out)
    document.addEventListener('pointerdown', down)
    document.addEventListener('click', click)
    document.addEventListener('focusin', focusin)
    document.addEventListener('focusout', focusout)
    document.addEventListener('keydown', keydown, true) // capture: Esc closes the card before anything else listens
    return () => {
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerout', out)
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('click', click)
      document.removeEventListener('focusin', focusin)
      document.removeEventListener('focusout', focusout)
      document.removeEventListener('keydown', keydown, true)
      clear()
      set(null)
    }
  }, [enabled, set])

  // a card belongs to the page it was opened on
  useEffect(() => set(null), [pathname, set])

  if (!enabled || !open) return null
  const keep = () => clearTimeout(timer.current.close)
  const leave = () => {
    if (!open.pinned && !open.key) {
      clearTimeout(timer.current.close)
      timer.current.close = window.setTimeout(() => set(null), CLOSE_MS)
    }
  }
  return (
    <IslandBoundary name="rich" fallback={null} resetKeys={[open.anchor]}>
      <Suspense fallback={null}>
        <NotationCard id={cardId} anchor={open.anchor} pinned={open.pinned} focusIn={open.focusIn} popRef={cardRef} onEnter={keep} onLeave={leave} onClose={() => set(null)} />
      </Suspense>
    </IslandBoundary>
  )
}
