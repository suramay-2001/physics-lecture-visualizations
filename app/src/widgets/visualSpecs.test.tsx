/**
 * Widget spec gate (brief-709-widgets-wiring Job 1). Each unit's `visual` Try-it spec names a widget kind plus
 * `props: Record<string, unknown>` (content/schema.ts `WidgetSpec`) — nothing ties those props to the widget's own
 * prop interface at compile time, so a wrong-shaped prop (F4's `operator-action` with string props; a similar Q6
 * slip) passes `tsc` and only crashes a learner's page when they open that unit.
 *
 * `registry.tsx`'s `Widget` wraps `bloch` in `lazy` + `Suspense`, and `ComplexPlane` itself lazily loads its 709
 * euler/phasor pane (`ComplexPlaneQc`). React 19's `renderToString` does not support Suspense on the server: it
 * silently swaps in the fallback instead of throwing (confirmed by probing both paths while writing this test), so
 * rendering through those wrappers would hide a crash rather than catch one. This file renders each kind's real
 * implementation directly — the same components `ComplexPlaneQc.test.tsx` already renders this way — so every
 * `visual` spec in both courses actually executes its widget's render path.
 */
import type { ComponentType } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AmplitudeBars } from './AmplitudeBars'
import { BasisTranslator } from './BasisTranslator'
import { BlochSphere } from './BlochSphere'
import { ComplexPlane } from './ComplexPlane'
import ComplexPlaneQc from './ComplexPlaneQc'
import { DepositStats } from './DepositStats'
import { LogicOrder } from './LogicOrder'
import { OperatorAction } from './OperatorAction'
import { OperatorBuilder } from './OperatorBuilder'
import { PhaseDial } from './PhaseDial'
import { Projector } from './Projector'
import { RealVsComplex } from './RealVsComplex'
import { SGLab } from './SGLab'
import { LECTURES } from '../content/index'
import { QC_CHAPTERS } from '../content/qc709/index'
import type { Lecture, WidgetKind, WidgetSpec } from '../content/schema'

// Every kind except `complex-plane`, whose 709 modes need the special case below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DIRECT: Record<Exclude<WidgetKind, 'complex-plane'>, ComponentType<any>> = {
  'sg-lab': SGLab,
  'real-vs-complex': RealVsComplex,
  'amplitude-bars': AmplitudeBars,
  projector: Projector,
  'operator-action': OperatorAction,
  'operator-builder': OperatorBuilder,
  'basis-translator': BasisTranslator,
  bloch: BlochSphere,
  'phase-dial': PhaseDial,
  'deposit-stats': DepositStats,
  'logic-order': LogicOrder,
}

/** Renders a `visual` spec through its real (non-lazy) implementation — never through registry.tsx's wrappers. */
function renderSpec(spec: WidgetSpec): string {
  const props = (spec.props ?? {}) as Record<string, unknown>
  if (spec.kind === 'complex-plane') {
    const mode = props.mode
    if (mode === 'euler' || mode === 'phasor')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return renderToString(<ComplexPlaneQc {...(props as any)} mode={mode} />)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return renderToString(<ComplexPlane {...(props as any)} />)
  }
  const C = DIRECT[spec.kind]
  return renderToString(<C {...props} />)
}

const chapters: Lecture[] = [...LECTURES, ...QC_CHAPTERS]

describe.each(chapters.map((l) => [l.id, l] as const))('%s: Try-it widget specs', (_, chapter) => {
  for (const u of chapter.units) {
    it(`${u.id}: visual (${u.visual.kind}) mounts without throwing or NaN/Infinity`, () => {
      let html = ''
      expect(() => {
        html = renderSpec(u.visual)
      }, `${u.id}: visual kind "${u.visual.kind}" threw`).not.toThrow()
      expect(html.length, u.id).toBeGreaterThan(0)
      expect(html, `${u.id} (${u.visual.kind})`).not.toMatch(/NaN|Infinity/)
    })
  }
})

/**
 * P-F3/F4 review item 1 (the class behind F2 item 1 and Q11–Q13): a Try-it spec once carried props its widget does not
 * take (op, compose, showDagger, basis), which every widget silently ignores, so the lines written under them
 * described a picture that never loaded. For the chapters whose Try-its were checked line by line against the widget
 * code, every prop key must be one the widget's own interface declares.
 */
const WIDGET_PROPS: Partial<Record<WidgetKind, readonly string[]>> = {
  'operator-action': ['a', 'b', 'd', 'preset'],
  'operator-builder': ['axis'],
  'basis-translator': ['target', 'mode', 'operator', 'theta', 'phi'],
  bloch: ['theta', 'phi', 'editable', 'measure', 'rotations', 'rotationAngles', 'landmarks'],
}
const PROPS_CHECKED = ['F3', 'F4']

describe.each(chapters.filter((l) => PROPS_CHECKED.includes(l.id)).map((l) => [l.id, l] as const))('%s: Try-it props are the widget’s own', (_, chapter) => {
  for (const u of chapter.units) {
    it(`${u.id}: ${u.visual.kind} props are all declared by the widget`, () => {
      const allowed = WIDGET_PROPS[u.visual.kind]
      expect(allowed, `${u.visual.kind} needs an entry in WIDGET_PROPS`).toBeDefined()
      expect(Object.keys(u.visual.props ?? {}).filter((k) => !allowed!.includes(k)), `${u.id}: props the widget ignores`).toEqual([])
    })
  }
})
