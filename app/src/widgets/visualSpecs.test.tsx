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
import ComplexPlaneQc, { ROOTS_RANGE } from './ComplexPlaneQc'
import { DepositStats } from './DepositStats'
import { LogicOrder } from './LogicOrder'
import { OperatorAction } from './OperatorAction'
import { OperatorBuilder } from './OperatorBuilder'
import Bb84Bench from './Bb84Bench'
import GhzGame from './GhzGame'
import TwoSpin from './TwoSpin'
import PairGrid from './PairGrid'
import PolarizationDial from './PolarizationDial'
import TwoClocks, { MEAN_RANGE, SPLIT_RANGE } from './TwoClocks'
import BitTable, { COST_RANGE, MAX_ROWS, STRING_WIDTH } from './BitTable'
import OracleBench from './OracleBench'
import OpticsBench from './OpticsBench'
import { OPTICS_PRESETS, hasPreset } from './opticsBench/presets'
import { opticsWidgetProblems } from './opticsBench/validate'
import { DJ_FAMILIES, N_RANGE, ORACLE_BENCH_MODES, legalCursors, type OracleBenchMode } from './oracleBenchModel'
import { BITS_GATES } from '../physics/qc/bits'
import { PhaseDial } from './PhaseDial'
import { Projector } from './Projector'
import { RealVsComplex } from './RealVsComplex'
import { SGLab } from './SGLab'
import { KET } from '../physics/spin'
import { LECTURES } from '../content/index'
import { QC_CHAPTERS } from '../content/qc709/index'
import { PAPER_CHAPTERS } from '../content/papers/index'
import { NOTES_CHAPTERS } from '../content/qc709/notes/index'
import { OPTICS_CHAPTERS } from '../content/qc709/optics/index'
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
  'two-spin': TwoSpin,
  'ghz-game': GhzGame,
  'two-clocks': TwoClocks,
  'bit-table': BitTable,
  'oracle-bench': OracleBench,
  'optics-bench': OpticsBench,
}

/** Renders a `visual` spec through its real (non-lazy) implementation — never through registry.tsx's wrappers. */
function renderSpec(spec: WidgetSpec): string {
  const props = (spec.props ?? {}) as Record<string, unknown>
  if (spec.kind === 'complex-plane') {
    const mode = props.mode
    if (mode === 'euler' || mode === 'phasor' || mode === 'roots')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return renderToString(<ComplexPlaneQc {...(props as any)} mode={mode} />)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return renderToString(<ComplexPlane {...(props as any)} />)
  }
  const C = DIRECT[spec.kind]
  return renderToString(<C {...props} />)
}

const chapters: Lecture[] = [...LECTURES, ...QC_CHAPTERS, ...PAPER_CHAPTERS]

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
  'two-spin': { file: 'TwoSpin', iface: 'TwoSpinProps' },
  'ghz-game': { file: 'GhzGame', iface: 'GhzGameProps' },
  'two-clocks': { file: 'TwoClocks', iface: 'TwoClocksProps' },
  'bit-table': { file: 'BitTable', iface: 'BitTableProps' },
  'oracle-bench': { file: 'OracleBench', iface: 'OracleBenchProps' },
  'optics-bench': { file: 'OpticsBench', iface: 'OpticsBenchProps' },
}

/** The property names of an exported props interface in a widget file. */
function declared(file: string, iface: string): string[] {
  const src = SRC[`./${file}.tsx`]
  const body = src && new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1]
  return body ? [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1]) : []
}

/**
 * The props that reach the widget for this spec. `complex-plane` is the one kind whose props depend on its `mode`: the
 * 448 modes (multiply, powers-of-i, conjugate) read `mode`, `z`, `w`; 'euler' reads `phi`, `n`; 'phasor' reads `phases`; 'roots'
 * reads `N`, `j` (widgets/ComplexPlane.tsx hands only those to its lazy 709 pane, whose own interface is ComplexPlaneQcProps).
 */
function allowedProps(spec: WidgetSpec): string[] {
  if (spec.kind === 'complex-plane') {
    const mode = (spec.props ?? {}).mode
    const all = declared('ComplexPlane', 'ComplexPlaneProps')
    const qc = declared('ComplexPlaneQc', 'ComplexPlaneQcProps')
    if (mode === 'euler') return ['mode', 'phi', 'n'].filter((k) => qc.includes(k))
    if (mode === 'phasor') return ['mode', 'phases'].filter((k) => qc.includes(k))
    if (mode === 'roots') return ['mode', 'N', 'j'].filter((k) => qc.includes(k))
    return all.filter((k) => !qc.includes(k) || k === 'mode')
  }
  const { file, iface } = PROPS_OF[spec.kind]
  return declared(file, iface)
}

/** Every widget spec a unit shows, with a label for the failure message. */
function specsOf(u: Unit): [string, WidgetSpec][] {
  const out: [string, WidgetSpec][] = [['visual', u.visual]]
  u.clues.forEach((c, i) => c.show && out.push([`clue ${i + 1} show`, c.show]))
  // a notes or optics paragraph carries at most one widget of its own (content/qc709/notes/kit.ts NotesPara.widget)
  for (const b of u.story ?? []) if (b.widget) out.push([`${b.id} paragraph widget`, b.widget])
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
  if (spec.kind === 'two-spin') {
    // TwoSpin (Lecture 10): the path's angle is read only for the path state (read from widgets/TwoSpin.tsx)
    const state = p.state ?? 'singlet'
    if ('theta' in p && state !== 'path') out.push("theta does nothing unless state is 'path' (the singlet and |ud⟩ have no angle)")
  }
  if (spec.kind === 'ghz-game') {
    // GhzGame (Lecture 10): the quantum table has no plan to start, prove or lock; the pair warm-up has no proof (read from widgets/GhzGame.tsx)
    const mode = p.mode ?? 'table'
    if (mode === 'quantum') for (const k of ['start', 'proof', 'editable']) if (k in p) out.push(`${k} does nothing in the quantum game (there is no plan to write)`)
    if (mode === 'pair' && 'proof' in p) out.push('proof does nothing in the two-player warm-up (it multiplies the three-player rows)')
  }
  if (spec.kind === 'two-clocks') {
    // TwoClocks (Lecture 11) turns upper and lower into the sliders Ē and ħω: a pair outside their ranges is clamped, so the picture is not the one the spec names
    const u = typeof p.upper === 'number' ? p.upper : 3
    const l = typeof p.lower === 'number' ? p.lower : 1
    const w = u - l
    const m = (u + l) / 2
    if (!(w >= SPLIT_RANGE.min && w <= SPLIT_RANGE.max)) out.push(`upper − lower = ${w} is outside the ħω slider (${SPLIT_RANGE.min}–${SPLIT_RANGE.max}ε)`)
    if (!(m >= MEAN_RANGE.min && m <= MEAN_RANGE.max)) out.push(`(upper + lower)/2 = ${m} is outside the Ē slider (${MEAN_RANGE.min}–${MEAN_RANGE.max}ε)`)
    if (!(l >= 0)) out.push('lower is at least 0')
  }
  if (spec.kind === 'bit-table') {
    // BitTable (Chapter F7) shows one mode at a time; a prop for another mode does nothing (read from widgets/BitTable.tsx)
    const mode = p.mode ?? 'gate'
    const only: Record<string, string[]> = { gate: ['gate', 'view'], strings: ['a', 'b', 'combine'], reduce: ['rows'], cost: ['n'] }
    for (const [m, keys] of Object.entries(only)) if (mode !== m) for (const k of keys) if (k in p) out.push(`${k} does nothing in mode '${mode}' (it belongs to mode '${m}')`)
    // the two strings share one width, else the longer is cut to the shorter
    if (typeof p.a === 'string' && typeof p.b === 'string' && p.a.length !== p.b.length) out.push('a and b differ in width: the longer is cut to the shorter')
  }
  if (spec.kind === 'oracle-bench') {
    // OracleBench (Chapters Q16, Q17) shows one algorithm at a time; a prop for another algorithm, or for another function of the same one, does nothing (read from widgets/oracleBenchModel.ts normalizeSetup)
    const mode = (p.mode ?? 'dj') as string
    const family = mode === 'dj' ? (p.family ?? 'linear') : 'linear'
    const n = typeof p.n === 'number' ? p.n : 3
    if (mode !== 'dj' && 'family' in p) out.push("family does nothing outside mode 'dj' (Bernstein–Vazirani is always linear)")
    if (mode === 'dj' && family === 'balanced' && n < 3 && 'family' in p) out.push('the balanced step function is linear for n = 1 and 2, so the widget shows the linear function instead')
    if (mode === 'dj' && family === 'balanced') for (const k of ['a', 'b']) if (k in p) out.push(`${k} does nothing for the balanced step function (it has no hidden string or bit)`)
    if (mode === 'dj' && family === 'constant' && 'a' in p) out.push('a does nothing for a constant f')
    if (mode !== 'dj' && mode !== 'bv') for (const k of ['a', 'b']) if (k in p) out.push(`${k} does nothing in mode '${mode}' (it is the hidden string or bit of dj and bv)`)
    if (mode !== 'grover' && 'marked' in p) out.push("marked does nothing outside mode 'grover'")
    if (mode !== 'simon') for (const k of ['s', 'answer']) if (k in p) out.push(`${k} does nothing outside mode 'simon'`)
    if (mode !== 'hadamard' && 'x' in p) out.push("x does nothing outside mode 'hadamard' (it is the starting string of Hadamard signs)")
    if (mode === 'simon' && 'n' in p) out.push('n does nothing in mode simon (it always has 3 input wires)')
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
  'complex-plane.mode': oneOf('multiply', 'powers-of-i', 'conjugate', 'euler', 'phasor', 'roots'),
  // roots (Chapter F8): N equal turns (2-12, the stage kind's 12 arrows) and j corners per step (0-12), whole numbers
  'complex-plane.N': (v) => typeof v === 'number' && Number.isInteger(v) && v >= ROOTS_RANGE.nMin && v <= ROOTS_RANGE.nMax,
  'complex-plane.j': (v) => typeof v === 'number' && Number.isInteger(v) && v >= ROOTS_RANGE.jMin && v <= ROOTS_RANGE.jMax,
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
  'two-spin.state': oneOf('singlet', 'ud', 'path'),
  'two-spin.theta': (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 90,
  'two-spin.axisA': oneOf('x', 'y', 'z'),
  'two-spin.axisB': oneOf('x', 'y', 'z'),
  'two-spin.first': oneOf('A', 'B'),
  'two-spin.seed': (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0,
  'ghz-game.mode': oneOf('pair', 'table', 'quantum', 'both'),
  'ghz-game.rounds': (v) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 200,
  'ghz-game.seed': (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0,
  'ghz-game.start': oneOf('minus', 'plus', 't1'),
  // the sliders reach Ē <= 8ε and ħω <= 4ε (widgets/TwoClocks.tsx); upper - lower is the splitting, (upper + lower)/2 the mean
  'two-clocks.upper': (v) => typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 12,
  'two-clocks.lower': (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 12,
  'two-clocks.start': oneOf('+x', '+z', 'tilt'),
  // BitTable (Chapter F7): a gate the kind draws, strings of 0s and 1s up to the kind's width, one to four equal rows, n on the slider
  'bit-table.mode': oneOf('gate', 'strings', 'reduce', 'cost'),
  'bit-table.gate': (v) => (BITS_GATES as readonly unknown[]).includes(v),
  'bit-table.view': oneOf('table', 'map'),
  'bit-table.a': (v) => typeof v === 'string' && new RegExp(`^[01]{1,${STRING_WIDTH}}$`).test(v),
  'bit-table.b': (v) => typeof v === 'string' && new RegExp(`^[01]{1,${STRING_WIDTH}}$`).test(v),
  'bit-table.combine': oneOf('xor', 'dot'),
  'bit-table.rows': (v) => Array.isArray(v) && v.length >= 1 && v.length <= MAX_ROWS && v.every((s) => typeof s === 'string' && new RegExp(`^[01]{1,${STRING_WIDTH}}$`).test(s) && s.length === v[0].length),
  'bit-table.n': (v) => typeof v === 'number' && Number.isInteger(v) && v >= COST_RANGE.min && v <= COST_RANGE.max,
  // OracleBench (Chapters Q16, Q17): n inside the algorithm's range, strings inside 0 … 2ⁿ − 1, a start column the buttons can reach
  'oracle-bench.mode': oneOf(...ORACLE_BENCH_MODES),
  'oracle-bench.family': oneOf(...DJ_FAMILIES),
  'oracle-bench.b': oneOf(0, 1),
  'oracle-bench.answer': (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 3,
  'oracle-bench.s': (v) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 7,
  // OpticsBench (Optics Lab paragraphs): the preset must be a registered one (widgets/opticsBench/presets.ts); an unknown id fails here
  'optics-bench.preset': hasPreset,
}
/** Values of an oracle-bench spec that are only wrong for the algorithm it names: n inside that algorithm's range, strings inside 0 … 2ⁿ − 1, a start column its buttons reach. */
function oracleBenchCross(p: Record<string, unknown>): string[] {
  const mode = (p.mode ?? 'dj') as OracleBenchMode
  if (!ORACLE_BENCH_MODES.includes(mode)) return []
  const r = N_RANGE[mode]
  const out: string[] = []
  const whole = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v)
  const n = 'n' in p ? p.n : 3
  if ('n' in p && !(whole(n) && n >= r.min && n <= r.max)) out.push(`n = ${JSON.stringify(p.n)} (mode '${mode}' takes ${r.min}–${r.max})`)
  const N = whole(n) ? 2 ** n : 2 ** r.max
  for (const k of ['a', 'marked', 'x'] as const) if (k in p && !(whole(p[k]) && (p[k] as number) >= 0 && (p[k] as number) < N)) out.push(`${k} = ${JSON.stringify(p[k])} (a string of n bits is 0 … ${N - 1})`)
  if ('step' in p && !(whole(p.step) && legalCursors(mode).includes(p.step))) out.push(`step = ${JSON.stringify(p.step)} (mode '${mode}' can stand at ${legalCursors(mode).join(', ')})`)
  return out
}
const badValues = (spec: WidgetSpec): string[] => [
  ...Object.entries(spec.props ?? {}).flatMap(([k, v]) => (VALUE_OK[`${spec.kind}.${k}`]?.(v) === false ? [`${k} = ${JSON.stringify(v)}`] : [])),
  ...(spec.kind === 'oracle-bench' ? oracleBenchCross((spec.props ?? {}) as Record<string, unknown>) : []),
  // the preset itself must be sound (its sliders, axes, curves and readouts evaluate to finite numbers: widgets/opticsBench/validate.ts)
  ...(spec.kind === 'optics-bench' ? opticsWidgetProblems(spec) : []),
]

describe('props gate: the keys are read from the widgets', () => {
  it('finds the declared props of every widget kind (so an empty read cannot pass the gate)', () => {
    for (const [kind, { file, iface }] of Object.entries(PROPS_OF)) expect(declared(file, iface).length, `${kind}: no props read from ${file}.tsx ${iface}`).toBeGreaterThan(0)
    expect(declared('BlochSphere', 'BlochProps')).toEqual(['theta', 'phi', 'editable', 'measure', 'rotations', 'rotationAngles', 'landmarks'])
    expect(declared('OperatorAction', 'OperatorActionProps')).toEqual(['a', 'b', 'd', 'preset'])
    expect(declared('LogicOrder', 'LogicOrderProps')).toEqual(['seed'])
    expect(declared('PolarizationDial', 'PolarizationDialProps')).toEqual(['chi', 'analyzer', 'carrier', 'editable'])
    expect(declared('Bb84Bench', 'Bb84BenchProps')).toEqual(['eve', 'seed', 'testSize', 'editable'])
    expect(declared('TwoSpin', 'TwoSpinProps')).toEqual(['state', 'theta', 'axisA', 'axisB', 'first', 'seed', 'editable'])
    expect(declared('GhzGame', 'GhzGameProps')).toEqual(['mode', 'rounds', 'seed', 'proof', 'start', 'editable', 'onTable'])
    expect(declared('TwoClocks', 'TwoClocksProps')).toEqual(['upper', 'lower', 'start', 'editable'])
    expect(declared('BitTable', 'BitTableProps')).toEqual(['mode', 'gate', 'view', 'a', 'b', 'combine', 'rows', 'n'])
    expect(declared('OpticsBench', 'OpticsBenchProps')).toEqual(['preset'])
    expect(declared('OracleBench', 'OracleBenchProps')).toEqual(['mode', 'n', 'family', 'a', 'b', 'marked', 's', 'answer', 'x', 'step', 'editable'])
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'dj', family: 'linear', a: 5, b: 1 } })).toEqual([])
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'grover', n: 3, marked: 5 } })).toEqual([])
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'grover', a: 5, family: 'constant', s: 3 } })).toHaveLength(3)
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'bv', family: 'balanced', marked: 2 } })).toHaveLength(2)
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'simon', n: 4, a: 3 } })).toHaveLength(2)
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'dj', family: 'balanced', a: 2, b: 1 } })).toHaveLength(2)
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'dj', family: 'constant', a: 2 } })).toHaveLength(1)
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'dj', answer: 1, s: 2 } })).toHaveLength(2)
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'dj', family: 'balanced', n: 2 } })).toHaveLength(1)
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'hadamard', n: 3, x: 5, step: 1 } })).toEqual([])
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'hadamard', a: 5, b: 1, family: 'linear', marked: 1, s: 2, answer: 1 } })).toHaveLength(6)
    expect(dormantProps({ kind: 'oracle-bench', props: { mode: 'bv', n: 3, a: 5, x: 5 } })).toHaveLength(1)
    expect(dormantProps({ kind: 'oracle-bench', props: { x: 5 } })).toHaveLength(1)
    expect(badValues({ kind: 'oracle-bench', props: { mode: 'dj', n: 3, family: 'balanced', a: 7, b: 1, step: 2 } })).toEqual([])
    expect(badValues({ kind: 'oracle-bench', props: { mode: 'qft', b: 2, answer: 4, s: 0 } })).toHaveLength(4)
    expect(badValues({ kind: 'oracle-bench', props: { mode: 'dj', n: 5, a: 99, step: 2 } })).toHaveLength(2)
    expect(badValues({ kind: 'oracle-bench', props: { mode: 'grover', n: 3, marked: 8, step: 3 } })).toHaveLength(2)
    expect(badValues({ kind: 'oracle-bench', props: { mode: 'dj', step: 4 } })).toHaveLength(1)
    expect(badValues({ kind: 'oracle-bench', props: { mode: 'grover', n: 4, marked: 15, step: 21 } })).toEqual([])
    expect(badValues({ kind: 'oracle-bench', props: { mode: 'grover', n: 1 } })).toHaveLength(1)
    expect(badValues({ kind: 'oracle-bench', props: { mode: 'hadamard', n: 3, x: 5, step: 2 } })).toEqual([])
    expect(badValues({ kind: 'oracle-bench', props: { mode: 'hadamard', n: 3, x: 8, step: 3 } })).toHaveLength(2)
    expect(badValues({ kind: 'oracle-bench', props: { mode: 'hadamard', n: 5, x: -1 } })).toHaveLength(2)
    expect(badValues({ kind: 'oracle-bench', props: { mode: 'simon', s: 6, answer: 3, step: 5 } })).toEqual([])
    expect(dormantProps({ kind: 'bit-table', props: { mode: 'gate', gate: 'AND', view: 'map' } })).toEqual([])
    expect(dormantProps({ kind: 'bit-table', props: { mode: 'strings', a: '1011', b: '0110', gate: 'AND' } })).toHaveLength(1)
    expect(dormantProps({ kind: 'bit-table', props: { mode: 'reduce', rows: ['001', '111'], n: 5 } })).toHaveLength(1)
    expect(dormantProps({ kind: 'bit-table', props: { mode: 'strings', a: '101', b: '01' } })).toHaveLength(1)
    expect(dormantProps({ kind: 'bit-table', props: { n: 10 } })).toHaveLength(1)
    expect(badValues({ kind: 'bit-table', props: { gate: 'XNOR', view: 'graph', rows: ['00', '1'], n: 99, a: '12' } })).toHaveLength(5)
    expect(badValues({ kind: 'bit-table', props: { mode: 'reduce', rows: ['001', '111'] } })).toEqual([])
    expect(dormantProps({ kind: 'two-clocks', props: { upper: 3, lower: 1, start: '+x' } })).toEqual([])
    expect(dormantProps({ kind: 'two-clocks', props: { upper: 20, lower: 2 } })).toHaveLength(2)
    expect(dormantProps({ kind: 'two-clocks', props: { upper: 3, lower: 3 } })).toHaveLength(1)
    expect(badValues({ kind: 'two-clocks', props: { start: '+y' } })).toHaveLength(1)
    expect(declared('Projector', 'ProjectorProps')).toEqual(['state', 'basis', 'editableBasis', 'labels'])
    expect(allowedProps({ kind: 'complex-plane', props: { mode: 'multiply' } })).toEqual(['mode', 'z', 'w'])
    expect(allowedProps({ kind: 'complex-plane', props: { mode: 'euler' } })).toEqual(['mode', 'phi', 'n'])
    expect(allowedProps({ kind: 'complex-plane', props: { mode: 'phasor' } })).toEqual(['mode', 'phases'])
    expect(allowedProps({ kind: 'complex-plane', props: { mode: 'roots' } })).toEqual(['mode', 'N', 'j'])
    expect(badValues({ kind: 'complex-plane', props: { mode: 'roots', N: 13, j: 1 } })).toHaveLength(1)
    expect(badValues({ kind: 'complex-plane', props: { mode: 'roots', N: 8, j: 3 } })).toEqual([])
    expect(badValues({ kind: 'complex-plane', props: { mode: 'roots', N: 1.5, j: -1 } })).toHaveLength(2)
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
    expect(dormantProps({ kind: 'two-spin', props: { state: 'singlet', theta: 30 } })).toHaveLength(1)
    expect(dormantProps({ kind: 'two-spin', props: { state: 'path', theta: 30, axisA: 'z', axisB: 'x' } })).toEqual([])
    expect(badValues({ kind: 'two-spin', props: { axisA: 'q' } })).toHaveLength(1)
    expect(dormantProps({ kind: 'ghz-game', props: { mode: 'quantum', start: 't1' } })).toHaveLength(1)
    expect(dormantProps({ kind: 'ghz-game', props: { mode: 'pair', proof: true } })).toHaveLength(1)
    expect(dormantProps({ kind: 'ghz-game', props: { mode: 'both', start: 'minus', proof: true, rounds: 40, seed: 3 } })).toEqual([])
    expect(badValues({ kind: 'ghz-game', props: { mode: 'quartet', rounds: 0 } })).toHaveLength(2)
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

describe.each([...NOTES_CHAPTERS, ...OPTICS_CHAPTERS].map((l) => [l.id, l] as const))('%s: paragraph widget specs (notes and Optics Lab pages)', (_, page) => {
  for (const u of page.units) {
    it(`${u.id}: every paragraph widget passes only props its widget declares, with values it can use`, () => {
      for (const [where, spec] of specsOf(u)) {
        const allowed = allowedProps(spec)
        expect(Object.keys(spec.props ?? {}).filter((k) => !allowed.includes(k)), `${u.id} ${where} (${spec.kind}): props the widget ignores (it takes: ${allowed.join(', ')})`).toEqual([])
        expect(dormantProps(spec), `${u.id} ${where} (${spec.kind}): dormant props`).toEqual([])
        expect(badValues(spec), `${u.id} ${where} (${spec.kind}): values the widget cannot use`).toEqual([])
      }
    })
    it(`${u.id}: every paragraph widget mounts without throwing or NaN/Infinity`, () => {
      for (const b of u.story ?? []) {
        if (!b.widget) continue
        let html = ''
        expect(() => (html = renderSpec(b.widget!)), `${b.id}: ${b.widget.kind} threw`).not.toThrow()
        expect(html.length, b.id).toBeGreaterThan(0)
        expect(html, b.id).not.toMatch(/NaN|Infinity/)
      }
    })
  }
})

describe('the optics-bench gate itself (an unknown preset is an error)', () => {
  it('a registered preset passes; an unknown or inherited id, an extra prop and a missing preset are all caught', () => {
    expect(Object.keys(OPTICS_PRESETS).length).toBeGreaterThan(0)
    for (const id of Object.keys(OPTICS_PRESETS)) expect(badValues({ kind: 'optics-bench', props: { preset: id } }), id).toEqual([])
    expect(badValues({ kind: 'optics-bench', props: { preset: 'no-such-preset' } }).length).toBeGreaterThan(0)
    expect(badValues({ kind: 'optics-bench', props: { preset: 'toString' } }).length).toBeGreaterThan(0)
    expect(badValues({ kind: 'optics-bench', props: { preset: 7 } }).length).toBeGreaterThan(0)
    expect(badValues({ kind: 'optics-bench' }).length).toBeGreaterThan(0)
    expect(allowedProps({ kind: 'optics-bench', props: { preset: 'lorentzian', extra: 1 } })).toEqual(['preset'])
    expect(opticsWidgetProblems({ kind: 'optics-bench', props: { preset: 'lorentzian', extra: 1 } })).toHaveLength(1)
    expect(opticsWidgetProblems({ kind: 'bit-table' })).toEqual([]) // another kind is not this check's business
  })
})
