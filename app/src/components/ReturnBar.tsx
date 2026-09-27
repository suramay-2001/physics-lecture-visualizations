/**
 * The way back from a bridge (W-709-platform §C; the approved Cryostat mockup's `.returnbar`: navy with a gilt edge,
 * frost type, "↓ Return to 709 · Chapter Q8 · Bell states, step 4"; down means back into the fridge). It is the only
 * 709 material on a 448 page. App-level, right under the top bar, sticky with it.
 *
 *   - Shown on any page whose URL carries a valid `ret` (ui/returnParam.ts: parsed field by field, then checked against
 *     the 709 chapter registry, loaded on demand): it survives a reload and a new tab, because the place is in the URL.
 *   - Carried forward: when the reader moves on inside the detour (another Spin Lab lecture, the map, a chained
 *     bridge), `ret` is added to the new URL, so the bar stays; it is dropped once the reader is back in the 709
 *     chapter, dismisses the bar, or goes Back past the bridge.
 *   - On arrival from a bridge, focus moves to the target unit's heading and a polite live region says where the
 *     reader is; the bridge's beat (if any) is put under the centre line.
 *   - Return: sets the reader's track back and opens the chapter at `?at=<beat>&f=<frac>`; the chapter page restores
 *     the place after its first story refresh and moves focus to the beat (pages/LecturePage.tsx).
 */
import { useEffect, useLayoutEffect, useReducer, useRef, useState, useSyncExternalStore } from 'react'
import { Link, useInRouterContext, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { COURSES, chapterName } from '../content/courses'
import { metaById } from '../content/meta'
import { lecturePath } from '../paths'
import { beatElement, focusQuietly, restoreWhenSettled } from '../stage/readingPosition'
import { parseReturn, parseReturnSyntax, retOf, stepOf, withRet, type KnownChapter, type ReturnPlace } from '../ui/returnParam'
import { setTrack } from '../ui/trackPref'
import type { BridgeArrival } from './BridgeLink'
import '../styles/returnBar.css'

/* ---------- the 709 registry, on demand (never in 448's first paint: chunk contract (h)) ---------- */

type Registry = typeof import('../content/qc709/registry')
let registry: Registry | null = null
const extra = new Map<string, { id: string; title: string; units: { id: string; title: string }[] }>()

/** DEV only: the demo chapter Q0 is a valid way back (content/qc709/__fixtures__; never in a production build). */
export function registerReturnChapter(l: { id: string; title: string; units: readonly { id: string; title: string }[] }): void {
  extra.set(l.id, { id: l.id, title: l.title, units: l.units.map((u) => ({ id: u.id, title: u.title })) })
}

export const knownChapter: KnownChapter = (id) => metaById(id) ?? extra.get(id)

async function loadRegistry(chapter: string): Promise<void> {
  registry ??= await import('../content/qc709/registry')
  if (import.meta.env.DEV && chapter === 'Q0' && !extra.has('Q0')) {
    const { Q0 } = await import('../content/qc709/__fixtures__/demoChapter')
    registerReturnChapter(Q0)
  }
  registryVersion++
  registrySubs.forEach((fn) => fn())
}
let registryVersion = 0
const registrySubs = new Set<() => void>()
const subscribeRegistry = (fn: () => void) => {
  registrySubs.add(fn)
  return () => registrySubs.delete(fn)
}

/** The way back the current URL offers (a valid `ret`), with its label and link; null when there is none. */
function useReturnWay() {
  const loc = useLocation()
  useSyncExternalStore(subscribeRegistry, () => registryVersion, () => 0)
  const raw = retOf(loc.search)
  const place = parseReturnSyntax(raw) ? parseReturn(raw, knownChapter) : null
  if (!place) return null
  const origin = lecturePath(place.chapter)
  const ch = knownChapter(place.chapter)!
  const unit = ch.units.find((u) => u.id === place.unit)
  const step = stepOf(place.beat)
  return {
    place,
    raw: raw!,
    origin,
    label: `Return to 709 · ${chapterName(place.chapter)} · ${unit?.title ?? ch.title}${step ? `, ${step}` : ''}`,
    temp: registry?.placeOf(place.chapter)?.plate.temp,
    back: {
      pathname: origin,
      search: place.beat ? `?at=${encodeURIComponent(place.beat)}&f=${place.frac}` : '',
      hash: place.beat ? '' : `#${place.unit}`,
    },
    onReturn: () => {
      carried = null
      setTrack('qc709', place.track)
    },
  }
}

/**
 * Keyboard: on arrival focus sits on the target unit's heading, deep in the page; this link, just before that heading
 * and visible only while focused, puts the way back one Shift+Tab away (the bar itself stays where a fresh page's
 * Tab order reaches it, right after the top bar). Rendered only on the unit a bridge landed on (UnitView's card).
 */
export function ReturnSkip({ unitId }: { unitId: string }) {
  return useInRouterContext() ? <RoutedReturnSkip unitId={unitId} /> : null
}
function RoutedReturnSkip({ unitId }: { unitId: string }) {
  const way = useReturnWay()
  const { hash } = useLocation()
  if (!way || hash !== `#${unitId}`) return null
  return (
    <Link className="rb-skip" to={way.back} state={{ returnArrival: true }} onClick={way.onReturn}>
      {way.label}
    </Link>
  )
}

/* ---------- carried forward within the tab ---------- */

/** The `ret` of the detour in progress (this tab, this session): added to the next pages until the reader is back. */
let carried: string | null = null
/** Arrivals already announced (a StrictMode re-run or a re-render must not move focus twice). */
const announced = new Set<string>()
/** The target beat's restore in progress (it outlives the effect: the arrival's own state clean-up re-renders). */
let arrivalSettle: (() => void) | null = null

/** The heading of a unit (its chapter card), or the unit itself, once the lecture has loaded. */
function waitFor(find: () => HTMLElement | null, ms = 8000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const t0 = performance.now()
    const tick = () => {
      const el = find()
      if (el) resolve(el)
      else if (performance.now() - t0 > ms) resolve(null)
      else requestAnimationFrame(tick)
    }
    tick()
  })
}

export function ReturnBar() {
  const loc = useLocation()
  const navType = useNavigationType()
  const navigate = useNavigate()
  const [, loaded] = useReducer((n: number) => n + 1, 0)
  const [said, setSaid] = useState('')
  const barRef = useRef<HTMLElement>(null)
  const raw = retOf(loc.search)
  const syntax = parseReturnSyntax(raw)
  const place: ReturnPlace | null = syntax ? parseReturn(raw, knownChapter) : null
  const needsRegistry = !!syntax && !place && (!registry || (import.meta.env.DEV && syntax.chapter === 'Q0' && !extra.has('Q0')))

  // an unknown chapter may just be a registry that has not arrived yet
  useEffect(() => {
    if (!needsRegistry || !syntax) return
    let alive = true
    loadRegistry(syntax.chapter).then(
      () => alive && loaded(),
      () => {},
    )
    return () => {
      alive = false
    }
  }, [needsRegistry, syntax?.chapter])

  // carry the way back forward through the detour; drop it once the reader is back in the 709 chapter
  const origin = place ? lecturePath(place.chapter) : null
  useEffect(() => {
    if (place && raw) {
      carried = loc.pathname === origin ? null : raw
      return
    }
    if (raw || !carried) return
    const c = parseReturnSyntax(carried)
    if (!c || loc.pathname === lecturePath(c.chapter) || navType !== 'PUSH') {
      carried = null
      return
    }
    navigate({ pathname: loc.pathname, search: withRet(loc.search, carried), hash: loc.hash }, { replace: true, state: loc.state })
  }, [loc.key])

  // on arrival from a bridge: the target beat under the centre line, focus on the unit heading, a polite announcement
  const arrival = (loc.state as Partial<BridgeArrival> | null)?.bridgeArrival
  useEffect(() => {
    if (!arrival || announced.has(loc.key)) return
    announced.add(loc.key)
    const path = loc.pathname
    waitFor(() => document.getElementById(`${arrival.unit}-title`) ?? document.getElementById(arrival.unit)).then((heading) => {
      // the reader may have moved on while the lecture loaded
      if (!heading || !location.hash.startsWith(`#${path}`)) return
      arrivalSettle?.()
      arrivalSettle =
        arrival.beat && beatElement(arrival.beat)
          ? restoreWhenSettled({ beat: arrival.beat, frac: 0.5 }, { live: !!document.querySelector('.story[data-mode="live"]') })
          : null
      focusQuietly(heading)
      setSaid(`Arrived at ${heading.textContent?.trim() ?? 'the unit'}. The bar at the top returns you to ${COURSES.qc709.code}.`)
      // once per arrival: a reload of this entry keeps the bar (the URL) but does not move focus again
      navigate({ pathname: loc.pathname, search: loc.search, hash: loc.hash }, { replace: true, state: null })
    })
  }, [loc.key])

  // the story's sticky stage and the unit anchors sit under the bar too: its height is a CSS variable (story.css,
  // styles/returnBar.css); the bar's face is 709's display face, fetched once (it is the only 709 material on a 448 page)
  const showBar = !!place && loc.pathname !== origin
  useLayoutEffect(() => {
    const el = barRef.current
    const root = document.documentElement
    if (!showBar || !el) return
    void import('../styles/fonts709').catch(() => {})
    const bar = document.querySelector<HTMLElement>('.topbar')
    const set = () => {
      root.style.setProperty('--return-bar-h', `${el.offsetHeight}px`)
      root.style.setProperty('--topbar-h', `${bar?.offsetHeight ?? 0}px`)
    }
    set()
    root.dataset.returnBar = 'on'
    const ro = new ResizeObserver(set)
    ro.observe(el)
    if (bar) ro.observe(bar)
    return () => {
      ro.disconnect()
      root.style.removeProperty('--return-bar-h')
      root.style.removeProperty('--topbar-h')
      delete root.dataset.returnBar
    }
  }, [showBar])

  const way = useReturnWay()
  const live = (
    <p className="visually-hidden" aria-live="polite">
      {said}
    </p>
  )
  if (!way || !showBar) return live
  const { label, temp, back } = way
  return (
    <>
      <nav className="return-bar" aria-label="Return to Physics 709" ref={barRef}>
        <div className="rb">
          <Link className="rb-go" to={back} state={{ returnArrival: true }} onClick={way.onReturn}>
            <span className="rb-arrow" aria-hidden="true">
              ↓
            </span>
            <span className="rb-label">{label}</span>
          </Link>
          {temp && (
            <span className="rb-temp" aria-hidden="true">
              {temp}
            </span>
          )}
          <button
            type="button"
            className="rb-x"
            aria-label="Dismiss the return bar"
            onClick={() => {
              carried = null
              navigate({ pathname: loc.pathname, search: withRet(loc.search, null), hash: loc.hash }, { replace: true, state: loc.state })
            }}
          >
            ×
          </button>
        </div>
      </nav>
      {live}
    </>
  )
}
