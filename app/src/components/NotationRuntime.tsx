/**
 * The ONE delegated listener of the notation explainers (decisions/notation-explainers.md), and the state of the open card.
 * Lazy: components/NotationHost.tsx (entry) loads it when "Explain notation" is on, after the first paint. With "Explain notation"
 * on, every `<span data-notation>` KaTeX renders (ui/notationMark.ts adds them) opens a plain-English card
 * (components/NotationCard.tsx, loaded the first time one is wanted):
 *   - mouse: hovering a mark for 300 ms opens its card; clicking pins it; moving off closes an unpinned card after a
 *     short grace (and the card itself can be entered); a press anywhere else closes a pinned one;
 *   - touch: a tap pins the card, a tap elsewhere closes it (hover does not apply);
 *   - keyboard (review #1-#3): formulas are gathered into reading groups with ONE Tab stop each (ui/notationFocus.ts). Focus
 *     on a formula shows an outline and a hint, never a card. The arrows move between the marks of the whole group (carrying
 *     the Tab stop to the next formula), Home and End jump to its first and last mark, Enter or Space opens and pins the card
 *     of the current mark and moves into its link, Esc closes it and returns to the formula. Tab and Shift+Tab inside the
 *     card go to the card's next control, or back to the formula at its ends (never to the browser's own controls); the ×
 *     button returns focus to the formula too. Leaving the formula and the card closes it;
 *   - screen readers: one visually hidden polite live region says the card's name, how to read it and its plain meaning when
 *     a card opens from the keyboard or its mark changes, and the mark's name and reading when the arrows move with no card
 *     open. The formula's `aria-describedby` points at the hint, or at the card while it is open, for an on-demand reread.
 * Marks inside a glossary popover or a card are not explained (their TeX is not marked in the first place).
 * One listener per event type on `document`, however many formulas there are. The card, the dictionary and the
 * pre-processor load on first use (rule (o) of build/chunks.test.ts).
 */
import { lazy, Suspense, useCallback, useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { IslandBoundary } from '../ui/ErrorBoundary'
import { explainedFormulas, groupOf, NOTATION_UNEXPLAINED, setStop } from '../ui/notationFocus'
import { readMark } from '../ui/notationCodec'
import { useNotationOn } from '../ui/notationPref'
import { useReadMode } from '../ui/readModePref'
import { Popover } from './Popover'

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
  /** opened from the keyboard: stays until focus leaves the formula and the card */
  key: boolean
  /** move focus to the card's link once it is on the page */
  focusIn: boolean
}

/** The mark under a node, when it is a real one in a formula that is explained. */
function markOf(n: EventTarget | null): HTMLElement | null {
  if (!(n instanceof Element)) return null
  const a = n.closest<HTMLElement>('[data-notation]')
  return a && a.closest('.katex-html') && !a.closest(NOTATION_UNEXPLAINED) ? a : null
}
const hostOf = (el: Element | null) => el?.closest<HTMLElement>('.katex') ?? null
const marksIn = (host: HTMLElement) => [...host.querySelectorAll<HTMLElement>('.katex-html [data-notation]')].filter((m) => markOf(m) === m)
const isHost = (t: EventTarget | null): t is HTMLElement => t instanceof HTMLElement && t.classList.contains('katex')
const isShown = (el: HTMLElement) => el.getClientRects().length > 0
/** Every mark of the reading group a formula belongs to, in reading order, across its formulas. */
const groupMarks = (host: HTMLElement) => explainedFormulas(groupOf(host)).filter(isShown).flatMap(marksIn)
/** Was focus put here by the keyboard? (A browser without :focus-visible counts every focus.) */
const focusVisible = (el: HTMLElement) => {
  try {
    return el.matches(':focus-visible')
  } catch {
    return true
  }
}

/** The words a screen reader gets for an open card: its name, how to read it, what it means, and what it says about this spot. */
function spokenCard(card: HTMLElement): string {
  const say = (el: Element | null) => {
    if (!el) return ''
    const c = el.cloneNode(true) as HTMLElement
    c.querySelectorAll('.katex-html, annotation, button, .nc-label, .nc-link').forEach((n) => n.remove())
    return (c.textContent ?? '').replace(/\s+/g, ' ').trim()
  }
  const blocks = card.querySelectorAll('.nc-block')
  const meaning = blocks[0]
  const here = card.querySelector('.nc-here')
  return [say(card.querySelector('.nc-name')), say(card.querySelector('.nc-say')), say(meaning ?? null), say(here)].filter(Boolean).join('. ').replace(/\.\./g, '.')
}

export default function NotationRuntime() {
  const enabled = useNotationOn()
  const { pathname } = useLocation()
  const cardId = useId()
  const hintId = `${cardId}-hint`
  const [open, setOpen] = useState<Open | null>(null)
  const [hint, setHint] = useState<HTMLElement | null>(null)
  const [live, setLive] = useState('')
  const cur = useRef<Open | null>(null)
  const timer = useRef<{ open?: number; close?: number; live?: number }>({})
  const cardRef = useRef<HTMLElement | null>(null)
  const hintRef = useRef<HTMLElement | null>(null)
  /** the formula the keyboard is on (the hint shows there) and the mark it points at */
  const kb = useRef<{ host: HTMLElement | null; mark: HTMLElement | null }>({ host: null, mark: null })
  const api = useRef<{ closeReturn: () => void }>({ closeReturn: () => undefined })
  const tick = useRef(false)

  /** Say something to a screen reader: the region is cleared first, so the same words are spoken again. */
  const announce = useCallback((text: string) => {
    clearTimeout(timer.current.live)
    setLive('')
    timer.current.live = window.setTimeout(() => {
      tick.current = !tick.current
      setLive(text + (tick.current ? '' : '​'))
    }, 40)
  }, [])

  /** What a formula is described by: the card while it is open for it, else the hint while the keyboard is on it, else nothing. */
  const describe = useCallback(
    (host: HTMLElement | null) => {
      if (!host) return
      const id = cur.current?.host === host ? cardId : kb.current.host === host ? hintId : null
      if (id) host.setAttribute('aria-describedby', id)
      else host.removeAttribute('aria-describedby')
    },
    [cardId, hintId],
  )

  const set = useCallback(
    (next: Open | null) => {
      const prev = cur.current
      if (prev && prev.anchor !== next?.anchor) prev.anchor.removeAttribute('data-nopen')
      cur.current = next
      next?.anchor.setAttribute('data-nopen', '')
      describe(prev?.host ?? null)
      describe(next?.host ?? null)
      setOpen(next)
    },
    [describe],
  )

  /** Point the keyboard at a mark (and its formula): the mark is highlighted, the formula described by the hint. */
  const point = useCallback(
    (host: HTMLElement | null, mark: HTMLElement | null) => {
      const k = kb.current
      if (k.mark && k.mark !== mark) k.mark.removeAttribute('data-nmark')
      const oldHost = k.host
      k.host = host
      k.mark = mark
      mark?.setAttribute('data-nmark', '')
      describe(oldHost)
      describe(host)
      setHint(host)
    },
    [describe],
  )

  useEffect(() => {
    if (!enabled) {
      set(null)
      point(null, null)
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
    /** Put the keyboard on a formula (it becomes its group's Tab stop) and on one of its marks. */
    const goTo = (mark: HTMLElement, focus: boolean) => {
      const host = hostOf(mark)
      if (!host) return
      setStop(host)
      point(host, mark)
      if (focus && document.activeElement !== host) host.focus()
    }
    /** Close the card; when focus was inside it, give focus back to the formula it explained. */
    const closeReturn = () => {
      const c = cur.current
      const inside = !!cardRef.current?.contains(document.activeElement)
      const host = c?.host ?? kb.current.host
      close()
      if (inside && host) host.focus()
    }
    api.current.closeReturn = closeReturn

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
    const focusin = (e: FocusEvent) => {
      const el = e.target
      if (!isHost(el) || !focusVisible(el)) return
      const marks = marksIn(el)
      if (!marks.length) return
      preload()
      setStop(el)
      // a card open on this formula keeps its mark; else the mark the keyboard was last on in it; else the first
      const remembered = kb.current.mark && el.contains(kb.current.mark) ? kb.current.mark : null
      point(el, cur.current?.host === el ? cur.current.anchor : (remembered ?? marks[0]))
    }
    const focusout = (e: FocusEvent) => {
      const to = e.relatedTarget as Node | null
      const c = cur.current
      // moving between the formula and its card, or on to another formula of the group, keeps everything
      if (to && (cardRef.current?.contains(to) || c?.host?.contains(to) || kb.current.host?.contains(to))) return
      // focus left the formula and the card: the hint goes, and an open card closes
      point(null, null)
      if (c) close()
    }
    const keydown = (e: KeyboardEvent) => {
      const c = cur.current
      const card = cardRef.current
      if (e.key === 'Escape') {
        // only a card that is actually open is closed (and only then is the key kept from other widgets)
        if (!c) return
        e.stopPropagation()
        closeReturn()
        return
      }
      const target = e.target as Node | null
      // inside the card: Tab goes to its next control, and at either end back to the formula (never out to the browser)
      if (c && card && target && card.contains(target)) {
        if (e.key !== 'Tab') return
        const items = [...card.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
        const first = items[0]
        const last = items[items.length - 1]
        const leave = !items.length || (e.shiftKey ? target === first || target === card : target === last)
        if (leave) {
          e.preventDefault()
          const host = c.host ?? kb.current.host
          close()
          host?.focus()
        }
        return
      }
      if (!isHost(e.target)) return
      const host = e.target
      const marks = marksIn(host)
      if (!marks.length) return
      const confirm = e.key === 'Enter' || e.key === ' '
      const here = kb.current.mark && host.contains(kb.current.mark) ? kb.current.mark : marks[0]
      if (confirm) {
        e.preventDefault()
        preload()
        if (c?.anchor === here && c.pinned) close()
        else {
          point(host, here)
          show(here, true, true, true)
        }
        return
      }
      const all = groupMarks(host)
      const at = all.indexOf(here)
      const to =
        e.key === 'ArrowRight' || e.key === 'ArrowDown' ? all[at + 1] : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? all[at - 1] : e.key === 'Home' ? all[0] : e.key === 'End' ? all[all.length - 1] : undefined
      if (!to || to === here) return
      e.preventDefault()
      preload()
      goTo(to, true)
      if (c) set({ ...c, anchor: to, host: hostOf(to), key: true, focusIn: false }) // an open card follows the mark (and is now the keyboard's)
      else void describeMark(to)
    }
    /** With no card open, say which notation the arrows landed on. */
    const describeMark = async (mark: HTMLElement) => {
      try {
        const { NOTATION_BY_ID } = await import('../content/notation')
        const entry = NOTATION_BY_ID.get(readMark(mark).id)
        if (entry && kb.current.mark === mark) announce(`${entry.name}. Read it as: ${entry.say}. Press Enter for the explanation.`)
      } catch {
        /* the dictionary did not load: the mark is still highlighted */
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
      clearTimeout(t.live)
      set(null)
      point(null, null)
    }
  }, [enabled, set, point, announce])

  // a card belongs to the page it was opened on, and Read mode takes the marks away from under an open one
  const readMode = useReadMode()
  useEffect(() => {
    set(null)
    point(null, null)
  }, [pathname, readMode, set, point])

  // a card that the keyboard opened, or moved to another mark, is read out once its text is on the page
  useEffect(() => {
    if (!open?.key) return
    let raf = 0
    let tries = 0
    const wait = () => {
      const card = cardRef.current
      if (card?.querySelector('.nc-name')) announce(spokenCard(card))
      else if (tries++ < 60) raf = requestAnimationFrame(wait)
    }
    wait()
    return () => cancelAnimationFrame(raf)
  }, [open?.key, open?.anchor, announce])

  if (!enabled) return null
  const keep = () => clearTimeout(timer.current.close)
  const leave = () => {
    if (open && !open.pinned && !open.key) {
      clearTimeout(timer.current.close)
      timer.current.close = window.setTimeout(() => set(null), CLOSE_MS)
    }
  }
  return (
    <>
      {/* A bare polite live region, not role="status": it is on every page, and a second status would hide the page's own
          status messages (the Arcade's "Solved." banner) from anything that looks for the page's status. */}
      <span className="visually-hidden notation-live" aria-live="polite" aria-atomic="true">
        {live}
      </span>
      {hint && !open && (
        <Popover id={hintId} anchor={hint} popRef={hintRef} role="tooltip" className="gloss-pop notation-hint">
          Enter explains the notation. Arrow keys move between marks. Esc closes.
        </Popover>
      )}
      {open && (
        <IslandBoundary name="rich" fallback={null} resetKeys={[open.anchor]}>
          <Suspense fallback={null}>
            <NotationCard id={cardId} anchor={open.anchor} pinned={open.pinned} focusIn={open.focusIn} popRef={cardRef} onEnter={keep} onLeave={leave} onClose={() => api.current.closeReturn()} />
          </Suspense>
        </IslandBoundary>
      )}
    </>
  )
}
