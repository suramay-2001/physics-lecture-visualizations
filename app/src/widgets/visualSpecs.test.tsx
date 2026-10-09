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
import Bb84Bench from './Bb84Bench'
import PairGrid from './PairGrid'
import PolarizationDial from './PolarizationDial'
import { PhaseDial } from './PhaseDial'
import { Projector } from './Projector'
import { RealVsComplex } from './RealVsComplex'
import { SGLab } from './SGLab'
import { KET } from '../physics/spin'
import { LECTURES } from '../content/index'
import { QC_CHAPTERS } from '../content/qc709/index'
import type { Lecture, Unit, WidgetKind, WidgetSpec } from '../content/schema'

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
  'pair-grid': PairGrid,
  'polarization-dial': PolarizationDial,
  'bb84-bench': Bb84Bench,
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
 * The props gate (P-F3/F4 review item 1, the class behind F2 item 1, Q11-Q13 and F5/F6): a Try-it spec once carried
 * props its widget does not take (op, compose, showDagger, basis, mode: 'binomial' ...). Every widget silently ignores
 * what it does not know, so the lines written under such a spec described a picture that never loaded. This now covers
 * EVERY chapter of both courses and every `WidgetSpec` a unit holds (its `visual`, each clue's `show`, each challenge's
 * `widget` and each walkthrough step's `show`): every prop key must be one the widget's own props interface declares.
 *
 * The allowed keys are read from the widget source (its exported `...Props` interface, via `?raw`), so a widget that
 * grows or loses a prop changes the gate with it - there is no hand list to drift. `PROPS_OF` is a
 * `Record<WidgetKind, ...>`, so a new widget kind will not compile until it is named here. Do not widen a list to make a
 * Try-it pass: build the prop into the widget, or rewrite the line so it is true on the widget as it renders.
 */
const SRC = import.meta.glob<string>('./*.tsx', { query: '?raw', import: 'default', eager: true })
const PROPS_OF: Record<WidgetKind, { file: string; iface: string }> = {
  'sg-lab': { file: 'SGLab', iface: 'SGLabProps' },
  'complex-plane': { file: 'ComplexPlane', iface: 'ComplexPlaneProps' },
  'real-vs-complex': { file: 'RealVsComplex', iface: 'RealVsComplexProps' },
  'amplitude-bars': { file: 'AmplitudeBars', iface: 'AmplitudeBarsProps' },
  projector: { file: 'Projector', iface: 'ProjectorProps' },
  'operator-action': { file: 'OperatorAction', iface: 'OperatorActionProps' },
  'operator-builder': { file: 'OperatorBuilder', iface: 'OperatorBuilderProps' },
  'basis-translator': { file: 'BasisTranslator', iface: 'BasisTranslatorProps' },
  bloch: { file: 'BlochSphere', iface: 'BlochProps' },
  'phase-dial': { file: 'PhaseDial', iface: 'PhaseDialProps' },
  'deposit-stats': { file: 'DepositStats', iface: 'DepositStatsProps' },
  'logic-order': { file: 'LogicOrder', iface: 'LogicOrderProps' },
  'pair-grid': { file: 'PairGrid', iface: 'PairGridProps' },
  'polarization-dial': { file: 'PolarizationDial', iface: 'PolarizationDialProps' },
  'bb84-bench': { file: 'Bb84Bench', iface: 'Bb84BenchProps' },
}

/** The property names of an exported props interface in a widget file. */
function declared(file: string, iface: string): string[] {
  const src = SRC[`./${file}.tsx`]
  const body = src && new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1]
  return body ? [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1]) : []
}

/**
 * The props that reach the widget for this spec. `complex-plane` is the one kind whose props depend on its `mode`: the
 * 448 modes (multiply, powers-of-i, conjugate) read `mode`, `z`, `w`; 'euler' reads `phi`, `n`; 'phasor' reads `phases`
 * (widgets/ComplexPlane.tsx hands only those to its lazy 709 pane, whose own interface is ComplexPlaneQcProps).
 */
function allowedProps(spec: WidgetSpec): string[] {
  if (spec.kind === 'complex-plane') {
    const mode = (spec.props ?? {}).mode
    const all = declared('ComplexPlane', 'ComplexPlaneProps')
    const qc = declared('ComplexPlaneQc', 'ComplexPlaneQcProps')
    if (mode === 'euler') return ['mode', 'phi', 'n'].filter((k) => qc.includes(k))
    if (mode === 'phasor') return ['mode', 'phases'].filter((k) => qc.includes(k))
    return all.filter((k) => !qc.includes(k) || k === 'mode')
  }
  const { file, iface } = PROPS_OF[spec.kind]
  return declared(file, iface)
}

/** Every widget spec a unit shows, with a label for the failure message. */
function specsOf(u: Unit): [string, WidgetSpec][] {
  const out: [string, WidgetSpec][] = [['visual', u.visual]]
  u.clues.forEach((c, i) => c.show && out.push([`clue ${i + 1} show`, c.show]))
  for (const ch of u.play) {
    if (ch.widget) out.push([`${ch.id} widget`, ch.widget])
    ch.walkthrough.forEach((w, i) => w.show && out.push([`${ch.id} walkthrough ${i + 1} show`, w.show]))
  }
  return out
}

/**
 * Props that are declared but dormant in the combination a spec passes them in: the widget takes the key yet ignores it
 * (read from each widget's code). Each rule returns the reason a prop of this spec does nothing.
 */
function dormantProps(spec: WidgetSpec): string[] {
  const p = (spec.props ?? {}) as Record<string, unknown>
  const out: string[] = []
  if (spec.kind === 'bloch' && 'rotationAngles' in p && p.rotations !== true) out.push('rotationAngles needs rotations: true (the rotation buttons are not drawn)')
  if (spec.kind === 'operator-action' && 'preset' in p) for (const k of ['a', 'b', 'd']) if (k in p) out.push(`${k} is overridden by preset`)
  if (spec.kind === 'sg-lab') {
    const axes = Array.isArray(p.axes) ? p.axes : ['z'] // SGLab's default bench is one device on z
    if (Array.isArray(p.keep) && p.keep.length !== axes.length - 1) out.push(`keep needs one entry per device but the last (${axes.length - 1}), else SGLab replaces it with all "+"`)
    if ('maxDevices' in p && p.editable === false) out.push('maxDevices only limits the Add device button, which editable: false hides')
  }
  if (spec.kind === 'pair-grid') {
    // PairGrid (Lecture 9) shows one table at a time; a prop for another table does nothing (read from widgets/PairGrid.tsx)
    const mode = p.mode ?? 'quantum'
    const frame = p.frame ?? 'spin'
    const preset = p.preset ?? 'product'
    const coins = p.coins ?? 'dealer'
    if (mode === 'classical') for (const k of ['frame', 'alice', 'bob', 'preset', 't', 'showDet']) if (k in p) out.push(`${k} does nothing in the classical table`)
    if (mode === 'quantum') for (const k of ['coins', 'pA', 'pB']) if (k in p) out.push(`${k} does nothing in the quantum tables`)
    if (mode === 'classical' && coins === 'dealer') for (const k of ['pA', 'pB']) if (k in p) out.push(`${k} does nothing for one dealer's coins (only for two separate dealers)`)
    if (mode === 'quantum' && frame === 'coin-die') for (const k of ['alice', 'bob', 'preset', 't', 'showDet']) if (k in p) out.push(`${k} does nothing in the photon ⊗ die table`)
    if (mode === 'quantum' && frame === 'spin' && preset === 'family') for (const k of ['alice', 'bob']) if (k in p) out.push(`${k} does nothing in the ud–du family (its one slider is t)`)
    if (mode === 'quantum' && frame === 'spin' && preset === 'product' && 't' in p) out.push('t does nothing for two separate spins (only for the family)')
  }
  return out
}

/**
 * Values a widget cannot use either: an unknown named ket, preset, axis or mode falls back to the widget's default (or
 * throws) just as an unknown key does. These mirror the unions in the widget interfaces (a legal value left off a list
 * fails loudly here and is added; an illegal one cannot pass).
 */
const isAxis = (v: unknown) => v === 'x' || v === 'y' || v === 'z' || (typeof v === 'number' && Number.isFinite(v))
const oneOf = (...xs: unknown[]) => (v: unknown) => xs.includes(v)
const namedKet = (v: unknown) => typeof v === 'string' && v in KET
const blochPair = (v: unknown) => Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number' && Number.isFinite(n))
const PRESET_KEYS = [...(/const PRESETS = \{([\s\S]*?)\n\}/.exec(SRC['./OperatorAction.tsx'])?.[1] ?? '').matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1])
const VALUE_OK: Record<string, (v: unknown) => boolean> = {
  'amplitude-bars.state': (v) => namedKet(v) || blochPair(v),
  'amplitude-bars.basis': isAxis,
  'deposit-stats.state': (v) => namedKet(v) || blochPair(v),
  'deposit-stats.axis': isAxis,
  'operator-builder.axis': isAxis,
  'bloch.measure': isAxis,
  'basis-translator.target': oneOf('x', 'y'),
  'basis-translator.mode': oneOf('state', 'operator'),
  'basis-translator.operator': oneOf('Sx', 'Sy', 'Sz'),
  'complex-plane.mode': oneOf('multiply', 'powers-of-i', 'conjugate', 'euler', 'phasor'),
  'operator-action.preset': (v) => PRESET_KEYS.includes(v as string),
  'sg-lab.source': (v) => v === 'oven' || namedKet(v),
  'sg-lab.axes': (v) => Array.isArray(v) && v.length > 0 && v.every(isAxis),
  'sg-lab.keep': (v) => Array.isArray(v) && v.every(oneOf('+', '-')),
  'pair-grid.mode': oneOf('quantum', 'classical'),
  'pair-grid.frame': oneOf('spin', 'coin-die'),
  'pair-grid.preset': oneOf('product', 'family'),
  'pair-grid.coins': oneOf('dealer', 'independent'),
  'pair-grid.alice': blochPair,
  'pair-grid.bob': blochPair,
  'pair-grid.t': (v) => typeof v === 'number' && v >= 0 && v <= 90,
  'pair-grid.pA': (v) => typeof v === 'number' && v >= 0 && v <= 1,
  'pair-grid.pB': (v) => typeof v === 'number' && v >= 0 && v <= 1,
  'polarization-dial.chi': (v) => typeof v === 'number' && Number.isFinite(v),
  'polarization-dial.analyzer': (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 175,
  'polarization-dial.carrier': oneOf('photon', 'electron'),
  'bb84-bench.eve': oneOf('off', 'all'),
  'bb84-bench.seed': (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0,
  'bb84-bench.testSize': (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 100,
}
const badValues = (spec: WidgetSpec): string[] =>
  Object.entries(spec.props ?? {}).flatMap(([k, v]) => (VALUE_OK[`${spec.kind}.${k}`]?.(v) === false ? [`${k} = ${JSON.stringify(v)}`] : []))

describe('props gate: the keys are read from the widgets', () => {
  it('finds the declared props of every widget kind (so an empty read cannot pass the gate)', () => {
    for (const [kind, { file, iface }] of Object.entries(PROPS_OF)) expect(declared(file, iface).length, `${kind}: no props read from ${file}.tsx ${iface}`).toBeGreaterThan(0)
    expect(declared('BlochSphere', 'BlochProps')).toEqual(['theta', 'phi', 'editable', 'measure', 'rotations', 'rotationAngles', 'landmarks'])
    expect(declared('OperatorAction', 'OperatorActionProps')).toEqual(['a', 'b', 'd', 'preset'])
    expect(declared('LogicOrder', 'LogicOrderProps')).toEqual(['seed'])
    expect(declared('PolarizationDial', 'PolarizationDialProps')).toEqual(['chi', 'analyzer', 'carrier', 'editable'])
    expect(declared('Bb84Bench', 'Bb84BenchProps')).toEqual(['eve', 'seed', 'testSize', 'editable'])
    expect(declared('Projector', 'ProjectorProps')).toEqual(['state', 'basis', 'editableBasis', 'labels'])
    expect(allowedProps({ kind: 'complex-plane', props: { mode: 'multiply' } })).toEqual(['mode', 'z', 'w'])
    expect(allowedProps({ kind: 'complex-plane', props: { mode: 'euler' } })).toEqual(['mode', 'phi', 'n'])
    expect(allowedProps({ kind: 'complex-plane', props: { mode: 'phasor' } })).toEqual(['mode', 'phases'])
  })
  it('catches what it is there to catch', () => {
    expect(allowedProps({ kind: 'operator-action' })).not.toContain('op')
    expect(allowedProps({ kind: 'deposit-stats' })).not.toContain('mode')
    expect(dormantProps({ kind: 'bloch', props: { rotationAngles: [90] } })).toHaveLength(1)
    expect(dormantProps({ kind: 'operator-action', props: { preset: 'σx', a: 1 } })).toHaveLength(1)
    expect(dormantProps({ kind: 'sg-lab', props: { axes: ['z', 'x', 'z'], keep: ['+'] } })).toHaveLength(1)
    expect(badValues({ kind: 'operator-action', props: { preset: 'σy' } })).toHaveLength(1)
    expect(badValues({ kind: 'amplitude-bars', props: { state: '+q' } })).toHaveLength(1)
    expect(PRESET_KEYS).toContain('σx')
    expect(declared('PairGrid', 'PairGridProps')).toEqual(['mode', 'frame', 'alice', 'bob', 'preset', 't', 'coins', 'pA', 'pB', 'showDet'])
    expect(dormantProps({ kind: 'pair-grid', props: { frame: 'coin-die', alice: [60, 0] } })).toHaveLength(1)
    expect(dormantProps({ kind: 'pair-grid', props: { mode: 'classical', coins: 'dealer', pA: 0.7 } })).toHaveLength(1)
    expect(dormantProps({ kind: 'pair-grid', props: { preset: 'family', t: 45, bob: [90, 0] } })).toHaveLength(1)
    expect(dormantProps({ kind: 'pair-grid', props: { frame: 'spin', preset: 'family', t: 45, showDet: true } })).toEqual([])
    expect(badValues({ kind: 'pair-grid', props: { preset: 'triplet' } })).toHaveLength(1)
    expect(badValues({ kind: 'pair-grid', props: { alice: [60, 0], bob: [90, 0], t: 45, coins: 'independent', pA: 0.7 } })).toEqual([])
  })
})

describe.each(chapters.map((l) => [l.id, l] as const))('%s: Try-it props are the widget’s own', (_, chapter) => {
  for (const u of chapter.units) {
    it(`${u.id}: every widget spec passes only props its widget declares`, () => {
      for (const [where, spec] of specsOf(u)) {
        const allowed = allowedProps(spec)
        expect(Object.keys(spec.props ?? {}).filter((k) => !allowed.includes(k)), `${u.id} ${where} (${spec.kind}): props the widget ignores (it takes: ${allowed.join(', ')})`).toEqual([])
      }
    })
    it(`${u.id}: no widget spec passes a prop its widget drops in that combination`, () => {
      for (const [where, spec] of specsOf(u)) {
        expect(dormantProps(spec), `${u.id} ${where} (${spec.kind}): dormant props`).toEqual([])
        expect(badValues(spec), `${u.id} ${where} (${spec.kind}): values the widget cannot use`).toEqual([])
      }
    })
  }
})
