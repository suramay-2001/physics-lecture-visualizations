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
}

export const widgetKinds = Object.keys(REGISTRY) as WidgetKind[]

/** Render a widget from content. `key` resets its internal state when the spec changes. */
export function Widget({ spec }: { spec: WidgetSpec }) {
  const C = REGISTRY[spec.kind]
  return (
    <Suspense fallback={<div className="widget widget-loading">Loading the 3D view…</div>}>
      <C key={JSON.stringify(spec.props ?? {})} {...(spec.props ?? {})} />
      {spec.caption && <p className="widget-caption">{spec.caption}</p>}
    </Suspense>
  )
}
