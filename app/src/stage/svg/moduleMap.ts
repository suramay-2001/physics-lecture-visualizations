/**
 * `module-map` (SVG; Papers P1): a drawing of the bicycle machine of Tour de gross (arXiv:2506.03094): M modules in a line, each a bicycle-code block (c qubits) and a logical processing unit
 * (LPU, u qubits) joined by 12 logical wires; neighbouring modules joined by an adapter (a qubits); one T factory (f qubits) joined by its own adapter (a-prime qubits), at the end of the line
 * or, in the triangular layout (Fig. 2b, at most 6 modules), in a second row beside module 1. Content writes INPUTS only (the code, the factory, M, the layout, what to highlight, which
 * readouts); every count is the engine's `tdgQubits` (physics/qec/tdg.ts, Eq. 25: q = M (c + u + a) - a + a' + f). c, a and a-prime are computed; u and f are the paper's REPORTED Table 1
 * estimates, badged so on their blocks, and q is labelled "uses Table 1's u and f". The chip yield y^J is `tdgYield(q)` with two couplers per qubit, which is OUR assumption (said so).
 * Block areas grow with the square root of the qubits they stand for; where a block sits is a drawing's choice (stage/svg/ModuleMapScene.tsx).
 *
 * Interpolation: when only M changes the modules are added or taken away one at a time (the layout re-flows); any other change of the machine switches at the half-way point; a change of
 * highlight (or focus) cross-fades, the old and the new light shown with weights 1 - t and t. Lazy chunk (stage/svg/kinds.ts).
 */
import type { ModuleMapHighlight, ModuleMapReadout, ModuleMapState } from '../../content/stage'
import { MODULE_MAP_CODES, MODULE_MAP_FACTORIES, MODULE_MAP_HIGHLIGHTS, MODULE_MAP_LAYOUTS, MODULE_MAP_READOUTS } from '../../content/stage'
import { tdgPerLogical, tdgQubits, tdgYield } from '../../physics/qec/tdg'
import type { SvgReadout } from '../svgKinds'
import type { ModuleMapInputs, ModuleMapLight, ResolvedModuleMap } from '../types'
import { fix, sci } from './draw'

/** Limits: M up to 1000 (more than 12 are drawn as a few modules and a "… k more …" marker), a triangular layout up to 6 modules, at most 5 readouts. */
export const MODULE_MAP_LIMITS = { M: 1000, drawn: 12, triangular: 6, readouts: 5 } as const

const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/* ------------------------------------------------ what is drawn, and what is lit ------------------------------------------------ */
/** The modules that are drawn (counted from 0): all of them up to 12; else modules 1-3 and the last two, with the number left out between them. */
export function shownModules(M: number): { shown: number[]; hidden: number } {
  if (M <= MODULE_MAP_LIMITS.drawn) return { shown: Array.from({ length: M }, (_, i) => i), hidden: 0 }
  return { shown: [0, 1, 2, M - 2, M - 1], hidden: M - 5 }
}

/** The parts of the picture a highlight can light: a code block, an LPU block, a pivot wire, the adapter after module i, the factory, the factory's adapter. */
export type MapPart = 'code' | 'lpu' | 'pivot' | 'wire' | 'adapter' | 'factory' | 'fadapter'

/** The module beside the factory (the one its adapter joins): the last in a line, the first in the triangular layout. */
export const factoryModule = (M: number, layout: 'linear' | 'triangular'): number => (layout === 'linear' ? M - 1 : 0)

/** Is part `part` of module `i` lit by this highlight? (`adapter` i = the adapter between module i and i + 1; `i` is ignored for the factory and its adapter.) */
export function isLit(h: ModuleMapHighlight, focus: number, part: MapPart, i: number, M: number, layout: 'linear' | 'triangular'): boolean {
  switch (h) {
    case 'none':
      return false
    case 'code':
      return part === 'code'
    case 'lpu':
      return part === 'lpu'
    case 'pivot':
      return part === 'pivot'
    case 'in-module':
      return (part === 'lpu' || part === 'pivot') && i === focus
    case 'inter-module':
      return (part === 'lpu' && (i === focus || i === focus + 1)) || (part === 'adapter' && i === focus)
    case 't-injection':
      return part === 'factory' || part === 'fadapter' || ((part === 'lpu' || part === 'pivot') && i === factoryModule(M, layout))
    case 'ghz':
      return part === 'pivot' || part === 'adapter'
  }
}

/** How much of `part` is lit, 0 … 1 (the weights of the cross-fade summed over the lights that light it). */
export function litAmount(r: ResolvedModuleMap, part: MapPart, i: number): number {
  const { M, layout } = r.machine
  return r.light.reduce((s, l) => s + (isLit(l.highlight, l.focus, part, i, M, layout) ? l.w : 0), 0)
}

/** The strength a part is drawn with: 1 when nothing is highlighted, else dimmed to MAP_DIM unless lit (cross-faded). */
export const MAP_DIM = 0.28
export function partAlpha(r: ResolvedModuleMap, part: MapPart, i: number): number {
  const { M, layout } = r.machine
  return r.light.reduce((s, l) => s + l.w * (l.highlight === 'none' || isLit(l.highlight, l.focus, part, i, M, layout) ? 1 : MAP_DIM), 0)
}

/** The focus a highlight can use on a machine of M modules (the validator refuses the rest; interpolation can meet a smaller machine). */
const clampFocus = (h: ModuleMapHighlight, focus: number, M: number): number => Math.max(0, Math.min(focus, h === 'inter-module' ? M - 2 : M - 1))

/* ------------------------------------------------ resolve ------------------------------------------------ */
const MEMO = new Map<string, ResolvedModuleMap>()

/** Every derived field from the inputs (shared by resolve and interpolate); memoized, since a scroll re-resolves the same state every frame. */
export function moduleMapFrom(inp: ModuleMapInputs): ResolvedModuleMap {
  const key = JSON.stringify(inp)
  const hit = MEMO.get(key)
  if (hit) return hit
  const out = build(inp)
  if (MEMO.size > 64) MEMO.delete(MEMO.keys().next().value as string)
  MEMO.set(key, out)
  return out
}

function build(inp: ModuleMapInputs): ResolvedModuleMap {
  const { code, factory, M, layout } = inp.machine
  const t = tdgQubits(code, M, factory === 'none' ? null : factory)
  const y = tdgYield(t.q)
  const focus = clampFocus(inp.highlight, inp.focus, M)
  const light: ModuleMapLight[] = inp.fade
    ? [
        { highlight: inp.fade.highlight, focus: clampFocus(inp.fade.highlight, inp.fade.focus, M), w: 1 - inp.fade.t },
        { highlight: inp.highlight, focus, w: inp.fade.t },
      ]
    : [{ highlight: inp.highlight, focus, w: 1 }]
  const { shown, hidden } = shownModules(M)
  return {
    kind: 'module-map',
    machine: { code, factory, M, layout },
    parts: { c: t.c, u: t.u, a: t.a, aPrime: t.aPrime, f: t.f, d: t.d, dFactory: t.dFactory },
    n: t.n,
    q: t.q,
    perModule: t.perModule,
    perLogical: tdgPerLogical(code),
    yield: { junctions: y.junctions, yieldProb: y.yieldProb, oneIn: Number.isFinite(y.oneIn) ? y.oneIn : null },
    highlight: inp.highlight,
    focus,
    light,
    shown,
    hidden,
    readouts: inp.readouts,
    inputs: inp,
    shot: inp.shot,
  }
}

export function moduleMapInputs(st: ModuleMapState): ModuleMapInputs {
  const m = st.machine
  return {
    machine: { code: m.code, factory: m.factory, M: m.M, layout: m.layout ?? 'linear' },
    highlight: st.highlight ?? 'none',
    focus: st.focus ?? 0,
    readouts: st.readouts ? [...st.readouts] : [],
    shot: st.shot,
  }
}

export function resolveModuleMapStage(st: ModuleMapState, _s: number): ResolvedModuleMap {
  void _s
  return moduleMapFrom(moduleMapInputs(st))
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
/**
 * The same machine with only M changed: the module count steps through the whole numbers in between (modules appear or go one at a time, and the line re-lays out); any other change of the
 * machine switches at the half-way point; the readouts switch at the half-way point; a different highlight or focus cross-fades (the light of the old one fades out as the new one fades in).
 */
export function interpModuleMapStage(a: ResolvedModuleMap, b: ResolvedModuleMap, t: number): ResolvedModuleMap {
  if (t <= 0) return a
  if (t >= 1) return b
  const A = a.inputs
  const B = b.inputs
  const same = A.machine.code === B.machine.code && A.machine.factory === B.machine.factory && A.machine.layout === B.machine.layout
  const machine = same ? { ...A.machine, M: Math.max(1, Math.round(lerp(A.machine.M, B.machine.M, t))) } : t < 0.5 ? A.machine : B.machine
  const changed = A.highlight !== B.highlight || A.focus !== B.focus
  return moduleMapFrom({
    machine,
    highlight: B.highlight,
    focus: B.focus,
    readouts: t < 0.5 ? A.readouts : B.readouts,
    ...(changed ? { fade: { highlight: A.highlight, focus: A.focus, t } } : {}),
    shot: t < 0.5 ? A.shot : B.shot,
  })
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const where = (f: string): string => `module-map ${f}`
const list = (xs: readonly string[]): string => xs.map((v) => `'${v}'`).join(', ')
const KEYS = ['kind', 'machine', 'highlight', 'focus', 'readouts', 'shot'] as const
const MACHINE_KEYS = ['code', 'factory', 'M', 'layout'] as const

export function validateModuleMapStage(st: ModuleMapState): string[] {
  const errs: string[] = []
  for (const k of Object.keys(st)) if (!(KEYS as readonly string[]).includes(k)) errs.push(where(`${k}: unknown field (allowed: ${KEYS.filter((x) => x !== 'kind').join(', ')})`))
  const m = st.machine
  if (!m || typeof m !== 'object' || Array.isArray(m)) return [...errs, where('machine: { code, factory, M, layout? }')]
  for (const k of Object.keys(m)) if (!(MACHINE_KEYS as readonly string[]).includes(k)) errs.push(where(`machine.${k}: unknown field (allowed: ${MACHINE_KEYS.join(', ')})`))
  if (!(MODULE_MAP_CODES as readonly string[]).includes(m.code)) errs.push(where(`machine.code: one of ${list(MODULE_MAP_CODES)}`))
  if (!(MODULE_MAP_FACTORIES as readonly string[]).includes(m.factory)) errs.push(where(`machine.factory: one of ${list(MODULE_MAP_FACTORIES)}`))
  if (!isInt(m.M) || m.M < 1 || m.M > MODULE_MAP_LIMITS.M) errs.push(where(`machine.M: a whole number 1–${MODULE_MAP_LIMITS.M}`))
  if (m.layout !== undefined && !(MODULE_MAP_LAYOUTS as readonly string[]).includes(m.layout)) errs.push(where(`machine.layout: one of ${list(MODULE_MAP_LAYOUTS)}`))
  else if (m.layout === 'triangular' && isInt(m.M) && m.M > MODULE_MAP_LIMITS.triangular) errs.push(where(`machine.layout: the triangular layout (Fig. 2b) draws at most ${MODULE_MAP_LIMITS.triangular} modules; this machine has ${m.M}`))
  if (st.highlight !== undefined && !(MODULE_MAP_HIGHLIGHTS as readonly string[]).includes(st.highlight)) errs.push(where(`highlight: one of ${list(MODULE_MAP_HIGHLIGHTS)}`))
  else if (st.highlight === 't-injection' && m.factory === 'none') errs.push(where("highlight: 't-injection' lights the factory and needs one; set machine.factory to '1e-3' or '1e-4'"))
  if (st.focus !== undefined) {
    if (!isInt(st.focus)) errs.push(where('focus: a whole number (a module counted from 0)'))
    else if (isInt(m.M)) {
      const last = st.highlight === 'inter-module' ? m.M - 2 : m.M - 1
      if (st.focus < 0 || st.focus > last) {
        errs.push(where(st.highlight === 'inter-module' ? `focus: a whole number 0–${last} ('inter-module' lights module focus and focus + 1, so the last is M − 2; this machine has ${m.M} modules)` : `focus: a whole number 0–${last} (a module counted from 0; this machine has ${m.M} modules)`))
      }
    }
  }
  if (st.highlight === 'inter-module' && isInt(m.M) && m.M < 2) errs.push(where("highlight: 'inter-module' lights the adapter between two modules; it needs M of at least 2"))
  if (st.readouts !== undefined) {
    const rs = st.readouts
    if (!Array.isArray(rs) || !rs.every((x) => (MODULE_MAP_READOUTS as readonly string[]).includes(x))) errs.push(where(`readouts: a list of ${list(MODULE_MAP_READOUTS)}`))
    else {
      if (new Set(rs).size !== rs.length) errs.push(where('readouts: each name once'))
      if (rs.length > MODULE_MAP_LIMITS.readouts) errs.push(where(`readouts: at most ${MODULE_MAP_LIMITS.readouts}`))
      if (rs.includes('q') && m.factory === 'none') errs.push(where("readouts: 'q' (Eq. 25) adds the factory and its adapter; set machine.factory to '1e-3' or '1e-4'"))
    }
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
export const factoryText = (f: ResolvedModuleMap['machine']['factory']): string => (f === 'none' ? 'no T factory' : `T factory, p\u00a0=\u00a0${f === '1e-3' ? '10⁻³' : '10⁻⁴'}`)

/** y^J as text: a percentage when it is not tiny, else a power of ten; "< 10⁻³⁰⁰" when it underflows. */
export function yieldText(r: ResolvedModuleMap): string {
  const y = r.yield
  if (!(y.yieldProb > 0)) return 'y^J < 10⁻³⁰⁰'
  const v = y.yieldProb >= 0.01 ? `${fix(100 * y.yieldProb, 1)} %` : sci(y.yieldProb, 1)
  return `y^J = ${v}`
}

const PRINTERS: { readonly [K in ModuleMapReadout]: (r: ResolvedModuleMap) => SvgReadout[] } = {
  q: (r) => [{ name: 'q', text: `q = ${r.q} (Eq. 25)`, tone: 'plus' }],
  n: (r) => [{ name: 'n', text: `n = 11 M = ${r.n}`, tone: 'state' }],
  parts: (r) => {
    const p = r.parts
    const rows: SvgReadout[] = [
      { name: 'parts', text: `c = ${p.c} · a = ${p.a}`, tone: 'text' },
      { name: 'parts-lpu', text: `u = ${p.u} (reported)`, tone: 'text' },
    ]
    if (r.machine.factory !== 'none') rows.push({ name: 'parts-adapter', text: `a′ = ${p.aPrime}`, tone: 'text' }, { name: 'parts-factory', text: `f = ${p.f} (reported)`, tone: 'text' })
    return rows
  },
  perLogical: (r) => [{ name: 'perLogical', text: `(c+u)/${r.perLogical.logical} = ${fix(r.perLogical.ratio, 1)}`, tone: 'silver' }],
  yield: (r) => [
    { name: 'yield', text: `chip yield ${yieldText(r)}`, tone: 'op' },
    { name: 'yield-note', text: 'ours: 2 couplers/qubit', tone: 'silver' },
  ],
}

export function moduleMapReadouts(r: ResolvedModuleMap): SvgReadout[] {
  return r.readouts.flatMap((name) => PRINTERS[name](r))
}

/** The accessible text of a picture: the machine, its parts (u and f marked reported) and q. */
export function moduleMapSummary(r: ResolvedModuleMap): string {
  const p = r.parts
  const { code, M, factory } = r.machine
  const parts = [`c = ${p.c}`, `u = ${p.u} (reported)`, `a = ${p.a}`, ...(factory === 'none' ? [] : [`a′ = ${p.aPrime}`, `f = ${p.f} (reported)`])]
  return [
    `bicycle machine: ${code} code, ${M} module${M === 1 ? '' : 's'}, ${r.machine.layout} layout, ${factoryText(factory)}`,
    parts.join(', '),
    `q = ${r.q} physical qubits (Eq. 25, uses Table 1's u and f), n = ${r.n} data qubits`,
  ].join('; ')
}
