/**
 * Static fallback widgets (W-L1 §2.9): for < 900 px, no WebGL, or a lost context, StaticStory shows one
 * existing 2D widget per (unit, kind), initialised to the state of the first beat that uses the kind.
 * Pure data (WidgetSpec), three-free. Kinds with no 2D widget yet are text-only until L6.
 */
import type { StageKind, StateOf, WidgetSpec } from '../content/schema'
import { DEG, deviceTiltDeg, planeAngle } from './resolve'

export const STATIC_WIDGET: { readonly [K in StageKind]: (s: StateOf<K>) => WidgetSpec | null } = {
  'lab-r3': (s) => {
    if (s.benches.length === 2) return { kind: 'logic-order' } // two parallel benches (l1-logic)
    const b = s.benches[0]
    const axes = b.devices.map((d) => {
      const deg = deviceTiltDeg(d, 1) // sweeps resolved at their end (s = 1)
      return deg === 0 ? 'z' : deg === 90 ? 'x' : Math.round(deg * 10) / 10
    })
    return {
      kind: 'sg-lab',
      props: { source: b.source, axes, keep: b.devices.slice(0, -1).map((d) => d.keep ?? '+'), editable: false, showTheory: true },
    }
  },
  'hilbert-plane': (s) =>
    s.psi === undefined
      ? null
      : { kind: 'projector', props: { state: Math.round((planeAngle(s.psi, 1) / DEG) * 10) / 10, basis: s.basis === 'x' ? 45 : 0, editableBasis: false } },
  bloch: () => null,
  'bloch-ball': () => null,
  hopf: () => null,
  'operator-space': () => null,
}

export function staticWidgetFor<K extends StageKind>(s: StateOf<K>): WidgetSpec | null {
  return (STATIC_WIDGET[s.kind as K] as (x: StateOf<K>) => WidgetSpec | null)(s)
}
