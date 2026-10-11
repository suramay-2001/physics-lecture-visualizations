/**
 * The widget registry: a widget kind in content → the component. EVERY widget is a lazy chunk, so the first paint carries none
 * of them (build/chunks.test.ts rule (p): no `widgets/*` module but this one is in the entry closure).
 *
 * A lecture page loads the chunks of the widgets the lecture shows BEFORE it renders (`lectureWidgetKinds` in
 * stage/lectureWidgets.ts, `useWidgetsReady` here: pages/LecturePage.tsx, beside the SVG kinds, KaTeX and the story scroll), so its widgets mount with the page, at their own
 * height, and nothing moves afterwards: a step link, a `#unit` deep link or a restored reading position has not been put out
 * by a late widget. The Bloch sphere is the exception: it brings three.js, so it keeps loading behind its placeholder. Anywhere
 * else a widget loads when it mounts and the Suspense fallback is a placeholder of about the widget's height
 * (`PLACEHOLDER_PX`, measured in the browser at 1440 px and 390 px); the lecture-wide height observer refreshes the story's
 * scroll triggers if a widget changes the height anyway.
 *
 * A kind that has loaded once is kept (`ready`) and renders directly the next time, with no Suspense at all: React holds a
 * second boundary's reveal back up to 300 ms after the first, and a clue's widget should not flash a placeholder.
 *
 * Some widgets pull in more than themselves, which is why they are lazy and not merely deferred: three.js (`bloch`), the
 * `matrix` stage kind (`pair-grid`), the BB84, GHZ, dynamics and oracle engines (physics/qc, stage/svg).
 */
import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType, type LazyExoticComponent } from 'react'
import type { WidgetKind, WidgetSpec } from '../content/schema'
import type { SGLabProps } from './SGLab'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWidget = ComponentType<any>

/** One dynamic import per kind (static strings, so the bundler gives each its own chunk). */
const LOAD: Record<WidgetKind, () => Promise<AnyWidget>> = {
  'sg-lab': () => import('./SGLab').then((m) => m.SGLab),
  'complex-plane': () => import('./ComplexPlane').then((m) => m.ComplexPlane),
  'real-vs-complex': () => import('./RealVsComplex').then((m) => m.RealVsComplex),
  'amplitude-bars': () => import('./AmplitudeBars').then((m) => m.AmplitudeBars),
  projector: () => import('./Projector').then((m) => m.Projector),
  'operator-action': () => import('./OperatorAction').then((m) => m.OperatorAction),
  'operator-builder': () => import('./OperatorBuilder').then((m) => m.OperatorBuilder),
  'basis-translator': () => import('./BasisTranslator').then((m) => m.BasisTranslator),
  // three.js is heavy: only pages that show a Bloch sphere download it
  bloch: () => import('./BlochSphere').then((m) => m.BlochSphere),
  'phase-dial': () => import('./PhaseDial').then((m) => m.PhaseDial),
  'deposit-stats': () => import('./DepositStats').then((m) => m.DepositStats),
  'logic-order': () => import('./LogicOrder').then((m) => m.LogicOrder),
  // the pair grid draws the `matrix` stage kind (physics/qc and stage/svg stay out of the entry)
  'pair-grid': () => import('./PairGrid').then((m) => m.default),
  // Lecture 8: the dial and the BB84 bench call the polarization / BB84 engine (physics/bb84.ts is shared by the bench, the ledger kind and the Arcade game)
  'polarization-dial': () => import('./PolarizationDial').then((m) => m.default),
  'bb84-bench': () => import('./Bb84Bench').then((m) => m.default),
  // Lecture 10: the two-spin picture draws the `two-qubit` kind and the GHZ game calls the shared qc engine; the Arcade game page imports the same component
  'two-spin': () => import('./TwoSpin').then((m) => m.default),
  'ghz-game': () => import('./GhzGame').then((m) => m.default),
  // Lecture 11: the two phase clocks draw the `clocks` SVG kind from the dynamics engine (physics/dynamics.ts)
  'two-clocks': () => import('./TwoClocks').then((m) => m.default),
  // Chapter F7: ordinary bits draw the `bits` and `plot` SVG kinds from physics/qc/bits.ts
  'bit-table': () => import('./BitTable').then((m) => m.default),
  // Chapters Q16 and Q17: the oracle bench draws the `circuit`, `amplitudes` and `grover-plane` SVG kinds from the oracle and Grover engines
  'oracle-bench': () => import('./OracleBench').then((m) => m.default),
}

export const widgetKinds = Object.keys(LOAD) as WidgetKind[]

/**
 * A widget's height in CSS px as the placeholder reserves it: [at a wide window, at a phone]. The median of every instance
 * on the 11 lectures and 26 chapters of the course (e2e measurement, 2026-10-11); a widget whose size depends on its props
 * (the complex plane's mode, the pair grid's classical table) is within about 15 % of it.
 */
const PLACEHOLDER_PX: Record<WidgetKind, readonly [number, number]> = {
  'sg-lab': [540, 610],
  'complex-plane': [530, 560],
  'real-vs-complex': [430, 760],
  'amplitude-bars': [225, 485],
  projector: [620, 850],
  'operator-action': [660, 830],
  'operator-builder': [293, 424],
  'basis-translator': [450, 670],
  bloch: [585, 940],
  'phase-dial': [480, 820],
  'deposit-stats': [315, 500],
  'logic-order': [390, 585],
  'pair-grid': [600, 570],
  'polarization-dial': [420, 600],
  'bb84-bench': [360, 480],
  'two-spin': [920, 1000],
  'ghz-game': [730, 940],
  'two-clocks': [845, 660],
  'bit-table': [560, 480],
  'oracle-bench': [1010, 1385],
}

/** Kinds that have loaded: they render directly from then on. */
const ready = new Map<WidgetKind, AnyWidget>()
const lazies = new Map<WidgetKind, LazyExoticComponent<AnyWidget>>()

const fetchKind = (kind: WidgetKind): Promise<AnyWidget> => LOAD[kind]().then((C) => (ready.set(kind, C), C))

function componentFor(kind: WidgetKind): AnyWidget {
  const done = ready.get(kind)
  if (done) return done
  let l = lazies.get(kind)
  if (!l) {
    l = lazy(() => fetchKind(kind).then((C) => ({ default: C })))
    lazies.set(kind, l)
  }
  return l
}

/** Are these kinds in memory? */
export const widgetsLoaded = (kinds: readonly WidgetKind[]): boolean => kinds.every((k) => ready.has(k))

/** Fetch the chunks of these kinds (those not loaded yet) once per session; a failed chunk may load on the next attempt. */
export const loadWidgets = (kinds: readonly WidgetKind[]): Promise<void> =>
  Promise.all(kinds.filter((k) => !ready.has(k)).map(fetchKind)).then(() => undefined)

/**
 * 'ready' once every kind in `kinds` has loaded (at once when none is needed or they are cached); 'failed' offers `retry`.
 * The same shape as `useSvgKinds` (stage/svgKinds.ts): LecturePage keeps its loading page up until both are ready.
 */
export function useWidgetsReady(kinds: readonly WidgetKind[]): { status: 'ready' | 'loading' | 'failed'; retry: () => void } {
  const needed = !widgetsLoaded(kinds)
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>(needed ? 'loading' : 'ready')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!needed) {
      setState('ready')
      return
    }
    let alive = true
    setState('loading')
    loadWidgets(kinds).then(
      () => alive && setState('ready'),
      () => alive && setState('failed'),
    )
    return () => {
      alive = false
    }
  }, [needed, kinds, attempt])
  return { status: needed ? (state === 'ready' ? 'loading' : state) : 'ready', retry: () => setAttempt((a) => a + 1) }
}

/** The stand-in while a widget's chunk loads: a frame of the widget's height (`PLACEHOLDER_PX`) with a line of text. */
export function WidgetPlaceholder({ kind }: { kind: WidgetKind }) {
  const [wide, narrow] = PLACEHOLDER_PX[kind]
  const text = kind === 'bloch' ? 'Loading the 3D view…' : kind === 'bb84-bench' || kind === 'polarization-dial' || kind === 'two-spin' || kind === 'two-clocks' || kind === 'bit-table' || kind === 'oracle-bench' ? 'Loading the picture…' : 'Loading the table…'
  return (
    <div className="widget widget-loading" data-widget-loading={kind} style={{ '--wph': `${wide}px`, '--wph-narrow': `${narrow}px` } as React.CSSProperties}>
      {text}
    </div>
  )
}

/** Render a widget from content. `key` resets its internal state when the spec changes. */
export function Widget({ spec }: { spec: WidgetSpec }) {
  // fixed for this instance until the kind changes: a widget that loaded after this one mounted must not remount it
  const C = useMemo(() => componentFor(spec.kind), [spec.kind])
  return (
    <Suspense fallback={<WidgetPlaceholder kind={spec.kind} />}>
      <C key={JSON.stringify(spec.props ?? {})} {...(spec.props ?? {})} />
      {spec.caption && <p className="widget-caption">{spec.caption}</p>}
    </Suspense>
  )
}

/** The Stern–Gerlach bench of the home page's hero, from the same lazy chunk as the lecture widgets. */
export function HeroSGLab(props: SGLabProps) {
  const C = useMemo(() => componentFor('sg-lab'), [])
  return (
    <Suspense fallback={<WidgetPlaceholder kind="sg-lab" />}>
      <C {...props} />
    </Suspense>
  )
}
