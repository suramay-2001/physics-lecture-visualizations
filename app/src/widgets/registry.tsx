import { lazy, Suspense, type ComponentType } from 'react'
import type { WidgetKind, WidgetSpec } from '../content/schema'
import { SGLab } from './SGLab'
import { ComplexPlane } from './ComplexPlane'
import { RealVsComplex } from './RealVsComplex'
import { AmplitudeBars } from './AmplitudeBars'
import { Projector } from './Projector'
import { OperatorAction } from './OperatorAction'
import { OperatorBuilder } from './OperatorBuilder'
import { BasisTranslator } from './BasisTranslator'
import { PhaseDial } from './PhaseDial'
import { DepositStats } from './DepositStats'
import { LogicOrder } from './LogicOrder'

// three.js is heavy: only pages that show a Bloch sphere download it.
const BlochSphere = lazy(() => import('./BlochSphere').then((m) => ({ default: m.BlochSphere })))
// the pair grid draws the `matrix` stage kind (physics/qc and stage/svg stay out of the entry): lazy, like the 3D view
const PairGrid = lazy(() => import('./PairGrid'))
// Lecture 8: the dial and the BB84 bench call the polarization / BB84 engine (physics/bb84.ts is shared by the bench, the ledger kind and the Arcade game)
const PolarizationDial = lazy(() => import('./PolarizationDial'))
const Bb84Bench = lazy(() => import('./Bb84Bench'))
// Lecture 11: the two phase clocks draw the `clocks` SVG kind from the dynamics engine (physics/dynamics.ts), so the widget is lazy too
const TwoClocks = lazy(() => import('./TwoClocks'))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<WidgetKind, ComponentType<any>> = {
  'sg-lab': SGLab,
  'complex-plane': ComplexPlane,
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
  'pair-grid': PairGrid,
  'polarization-dial': PolarizationDial,
  'bb84-bench': Bb84Bench,
  'two-clocks': TwoClocks,
}

export const widgetKinds = Object.keys(REGISTRY) as WidgetKind[]

/** Render a widget from content. `key` resets its internal state when the spec changes. */
export function Widget({ spec }: { spec: WidgetSpec }) {
  const C = REGISTRY[spec.kind]
  return (
    <Suspense fallback={<div className="widget widget-loading">{spec.kind === 'bloch' ? 'Loading the 3D view…' : spec.kind === 'bb84-bench' || spec.kind === 'polarization-dial' || spec.kind === 'two-clocks' ? 'Loading the picture…' : 'Loading the table…'}</div>}>
      <C key={JSON.stringify(spec.props ?? {})} {...(spec.props ?? {})} />
      {spec.caption && <p className="widget-caption">{spec.caption}</p>}
    </Suspense>
  )
}
