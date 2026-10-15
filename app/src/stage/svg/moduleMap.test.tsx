/**
 * `module-map` (Papers P1): the bicycle machine of Tour de gross drawn as modules in a line, adapters and a T factory. Content writes inputs only (the code, the factory, M, the layout, a
 * highlight, a focus, the readouts); the resolver takes every count from physics/qec/tdg.ts (`tdgQubits`, Eq. 25). These tests check the numbers against the engine, what each highlight lights,
 * every validation limit with a message that names the field, the readout text, the passport / drawer / vocabulary, interpolation (M steps, the machine switches, a highlight cross-fades), and that
 * the one scene draws in the live stage, the reading version and the print figure with no NaN, packs inside its box, keeps its labels off each other and names every block.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import { SVG_FIDELITY, SVG_FIDELITY_IDS } from '../../content/fidelity.svg'
import type { ModuleMapState } from '../../content/stage'
import { KIND_RENDER, MODULE_MAP_CODES, MODULE_MAP_FACTORIES, MODULE_MAP_HIGHLIGHTS, MODULE_MAP_LAYOUTS, MODULE_MAP_READOUTS, PASSPORT, STAGE_KINDS_709, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { tdgPerLogical, tdgQubits, tdgYield } from '../../physics/qec/tdg'
import { FigureFor, FIGURE_KINDS } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { firstNonFinite, resolve, validateLayout, validateStage } from '../resolve'
import { staticWidgetFor } from '../staticWidgets'
import { svgKindDef } from '../svgKinds'
import type { ResolvedModuleMap } from '../types'
import { packLines } from './CodeScene'
import { ModuleMapScene, legendRowCount, moduleMapGeometry } from './ModuleMapScene'
import { MAP_DIM, MODULE_MAP_LIMITS, factoryModule, isLit, litAmount, moduleMapReadouts, moduleMapSummary, partAlpha, shownModules, validateModuleMapStage, yieldText } from './moduleMap'
import './kinds'

type Machine = ModuleMapState['machine']
const S = (machine: Machine, extra: Omit<ModuleMapState, 'kind' | 'machine'> = {}): ModuleMapState => ({ kind: 'module-map', machine, ...extra })
const R = (machine: Machine, extra: Omit<ModuleMapState, 'kind' | 'machine'> = {}) => resolve(S(machine, extra), 1) as ResolvedModuleMap
const bad = (machine: Machine, extra: Omit<ModuleMapState, 'kind' | 'machine'> = {}) => validateModuleMapStage(S(machine, extra))
const texts = (r: ResolvedModuleMap) => moduleMapReadouts(r).map((x) => x.text)
type Mode = 'stage' | 'print'
const draw = (r: ResolvedModuleMap, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <ModuleMapScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )
const G10: Machine = { code: 'gross', factory: '1e-4', M: 10 }
const ALL_READOUTS = [...MODULE_MAP_READOUTS]
/** The print figure draws in the kind's own print box (taller for a state with many readout lines); the stage boxes are as given. */
const boxOf = (r: ResolvedModuleMap, mode: Mode, w: number, h: number): { w: number; h: number } => (mode === 'print' ? svgKindDef('module-map')!.printSize!(r) : { w, h })

describe('module-map: the SVG route, the passport, the drawer and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with the plan’s passport, drawer, shot and anchors', () => {
    expect(KIND_RENDER['module-map']).toBe('svg')
    expect(STAGE_KINDS_709).toContain('module-map')
    expect(FIGURE_KINDS).toContain('module-map')
    expect(svgKindDef('module-map')).toBeDefined()
    expect(svgKindDef('module-map')!.print).toEqual({ w: 320, h: 220 })
    expect(PASSPORT['module-map']).toMatchObject({ title: 'ARCHITECTURE · modules (schematic)', fidelityKey: 'module-map' })
    expect(PASSPORT['module-map'].note).toMatch(/^schematic/)
    expect(passportOf(S(G10))).toBe(PASSPORT['module-map'])
    const f = fidelityOf('module-map')
    for (const list of Object.values(f)) expect(list.length).toBeGreaterThan(0)
    expect(f.schematic.map((i) => i.id)).toContain('qc-module-map-schematic')
    expect(f.schematic.find((i) => i.id === 'qc-module-map-schematic')!.text).toMatch(/areas grow with the square root of the qubit counts.*positions are a drawing.*u and f are the paper’s estimates/)
    expect(Object.keys(SVG_FIDELITY)).toContain('module-map')
    expect(SHOTS['module-map']).toEqual(['MM-MACHINE'])
    expect(ANCHORS['module-map']).toEqual(['module', 'code', 'lpu', 'pivot', 'adapter', 'factory', 'readout'])
    expect(staticWidgetFor(S(G10))).toBeNull()
    expect([...MODULE_MAP_CODES]).toEqual(['gross', 'two-gross'])
    expect([...MODULE_MAP_FACTORIES]).toEqual(['1e-3', '1e-4', 'none'])
    expect([...MODULE_MAP_LAYOUTS]).toEqual(['linear', 'triangular'])
    expect([...MODULE_MAP_HIGHLIGHTS]).toEqual(['none', 'code', 'lpu', 'pivot', 'in-module', 'inter-module', 't-injection', 'ghz'])
    expect(ALL_READOUTS).toEqual(['q', 'n', 'parts', 'perLogical', 'yield'])
    expect(MODULE_MAP_LIMITS).toMatchObject({ M: 1000, drawn: 12, triangular: 6, readouts: 5 })
  })
  it('resolve / validateStage reach it like any kind; an unknown shot is caught by the shared check; a split with another kind validates', () => {
    const st = S(G10, { shot: 'MM-MACHINE' })
    expect(validateStage(st)).toEqual([])
    expect(validateStage({ ...st, shot: 'X-NOPE' as never })).toEqual(['module-map: unknown shot "X-NOPE"'])
    expect(validateLayout({ layout: 'split', top: st, bottom: { kind: 'code', code: 'steane7' } })).toEqual([])
    expect(validateLayout({ layout: 'split', top: st, bottom: st })).toEqual(['layout repeats a kind: module-map + module-map'])
  })
  it('every drawer sentence of the kind and of the two variants is at most 25 words, the ids are unique, and the variants are registered with the kinds', () => {
    const variant = (k: 'surgery-lpu' | 'code-paper-ops') => fidelityOf(k)
    const all = [...Object.values(fidelityOf('module-map')), ...Object.values(variant('surgery-lpu')), ...Object.values(variant('code-paper-ops'))].flat()
    for (const i of all) for (const sentence of i.text.replace(/\*\*|\*/g, '').split(/(?<=[.!?])["”’)]*\s+/)) expect(sentence.split(/\s+/).filter((w: string) => /[\p{L}\p{N}]/u.test(w)).length, i.id).toBeLessThanOrEqual(25)
    for (const k of ['surgery-lpu', 'code-paper-ops'] as const) for (const list of Object.values(variant(k))) expect(list.length, k).toBeGreaterThan(0)
    expect(new Set(SVG_FIDELITY_IDS).size).toBe(SVG_FIDELITY_IDS.length)
    for (const id of all.map((i) => i.id)) {
      expect(id).toMatch(/^qc-[a-z0-9-]+$/)
      expect(SVG_FIDELITY_IDS).toContain(id)
    }
  })
})

describe('module-map: the numbers are the engine’s', () => {
  it('gross, M = 10, factory p = 1e-4: c 288, u 90 (reported), a 22, a′ 13, f 810 (reported), n 110, q 4801', () => {
    const r = R(G10)
    expect(r.parts).toMatchObject({ c: 288, u: 90, a: 22, aPrime: 13, f: 810, d: 12, dFactory: 7 })
    expect([r.n, r.q, r.perModule]).toEqual([110, 4801, 400])
    const t = tdgQubits('gross', 10, '1e-4')
    expect([r.q, r.n, r.parts.c, r.parts.a, r.parts.aPrime]).toEqual([t.q, t.n, t.c, t.a, t.aPrime])
    // Eq. 25 by hand: M (c + u + a) - a + a' + f
    expect(10 * (288 + 90 + 22) - 22 + 13 + 810).toBe(4801)
  })
  it('two-gross, M = 10, p = 1e-3: q = 8138 (a′ = 29 from the factory distance 15)', () => {
    const r = R({ code: 'two-gross', factory: '1e-3', M: 10 })
    expect([r.q, r.n, r.parts.c, r.parts.u, r.parts.a, r.parts.aPrime, r.parts.f, r.parts.dFactory]).toEqual([8138, 110, 576, 158, 34, 29, 463, 15])
  })
  it('no factory: a′ and f are 0 and q is the line of modules alone; the readout q is refused, the parts row loses the factory', () => {
    const r = R({ code: 'gross', factory: 'none', M: 10 })
    expect([r.parts.aPrime, r.parts.f, r.q]).toEqual([0, 0, 3978])
    expect(texts(R({ code: 'gross', factory: 'none', M: 10 }, { readouts: ['parts'] }))).toEqual(['c = 288 · u = 90 (reported) · a = 22'])
    expect(bad({ code: 'gross', factory: 'none', M: 10 }, { readouts: ['q'] })).toEqual(["module-map readouts: 'q' (Eq. 25) adds the factory and its adapter; set machine.factory to '1e-3' or '1e-4'"])
  })
  it('the physical qubits per logical qubit, the yield and the data qubits come from the engine too', () => {
    const r = R(G10)
    expect(r.perLogical).toEqual(tdgPerLogical('gross'))
    expect(r.perLogical).toMatchObject({ physical: 378, logical: 12, ratio: 31.5 })
    expect(R({ code: 'two-gross', factory: 'none', M: 2 }).perLogical.ratio).toBeCloseTo((576 + 158) / 12, 12)
    const y = tdgYield(4801)
    expect(r.yield).toEqual({ junctions: y.junctions, yieldProb: y.yieldProb, oneIn: y.oneIn })
    expect(r.yield.junctions).toBe(8 * 4801)
  })
  it('the yield of a huge machine underflows to 0: the resolved state stays finite and the text says "< 10⁻³⁰⁰"', () => {
    const r = R({ code: 'two-gross', factory: '1e-3', M: 1000 })
    expect(r.yield.yieldProb).toBe(0)
    expect(r.yield.oneIn).toBeNull()
    expect(firstNonFinite(r)).toBeNull()
    expect(yieldText(r)).toBe('y^J < 10⁻³⁰⁰')
    expect(validateStage(S({ code: 'two-gross', factory: '1e-3', M: 1000 }, { readouts: ['yield'] }))).toEqual([])
  })
  it('Eq. 25 grows by c + u + a per module', () => {
    const q = (M: number) => R({ code: 'gross', factory: '1e-4', M }).q
    expect(q(2) - q(1)).toBe(400)
    expect(q(11) - q(10)).toBe(400)
  })
})

describe('module-map: which modules are drawn', () => {
  it('up to 12 modules every one is drawn; beyond, modules 1–3, a gap marker and the last two', () => {
    expect(shownModules(1)).toEqual({ shown: [0], hidden: 0 })
    expect(shownModules(12)).toEqual({ shown: Array.from({ length: 12 }, (_, i) => i), hidden: 0 })
    expect(shownModules(13)).toEqual({ shown: [0, 1, 2, 11, 12], hidden: 8 })
    expect(shownModules(1000)).toEqual({ shown: [0, 1, 2, 998, 999], hidden: 995 })
    const r = R({ code: 'gross', factory: '1e-4', M: 40 })
    expect([r.shown, r.hidden]).toEqual([[0, 1, 2, 38, 39], 35])
  })
})

describe('module-map: a highlight lights what an instruction uses', () => {
  const M = 6
  const parts = ['code', 'lpu', 'pivot', 'adapter', 'factory', 'fadapter'] as const
  const litSet = (h: ModuleMapState['highlight'], focus = 0, layout: Machine['layout'] = 'linear'): string[] => {
    const r = R({ code: 'gross', factory: '1e-4', M, layout }, { highlight: h, focus })
    const out: string[] = []
    for (const part of parts) for (let i = 0; i < M; i++) if (litAmount(r, part, i) === 1 && (i === 0 || part === 'code' || part === 'lpu' || part === 'pivot' || part === 'adapter')) out.push(`${part}${part === 'factory' || part === 'fadapter' ? '' : i}`)
    return out
  }
  it("'none' lights nothing and dims nothing; every other highlight dims what it does not light", () => {
    const r = R({ code: 'gross', factory: '1e-4', M }, { highlight: 'none' })
    for (const part of parts) for (let i = 0; i < M; i++) expect([litAmount(r, part, i), partAlpha(r, part, i)]).toEqual([0, 1])
    const c = R({ code: 'gross', factory: '1e-4', M }, { highlight: 'code' })
    expect(partAlpha(c, 'code', 3)).toBe(1)
    expect(partAlpha(c, 'lpu', 3)).toBe(MAP_DIM)
    expect(partAlpha(c, 'wire', 3)).toBe(MAP_DIM)
  })
  it("'code' the code blocks, 'lpu' the LPU blocks, 'pivot' the pivots", () => {
    expect(litSet('code')).toEqual(['code0', 'code1', 'code2', 'code3', 'code4', 'code5'])
    expect(litSet('lpu')).toEqual(['lpu0', 'lpu1', 'lpu2', 'lpu3', 'lpu4', 'lpu5'])
    expect(litSet('pivot')).toEqual(['pivot0', 'pivot1', 'pivot2', 'pivot3', 'pivot4', 'pivot5'])
  })
  it("'in-module' the LPU of module focus (default 0) and its pivot", () => {
    expect(litSet('in-module')).toEqual(['lpu0', 'pivot0'])
    const r = R({ code: 'gross', factory: '1e-4', M }, { highlight: 'in-module', focus: 3 })
    expect([litAmount(r, 'lpu', 3), litAmount(r, 'pivot', 3), litAmount(r, 'lpu', 2), litAmount(r, 'code', 3), litAmount(r, 'adapter', 3)]).toEqual([1, 1, 0, 0, 0])
  })
  it("'inter-module' the LPUs of module focus and focus + 1 and the adapter between them", () => {
    const r = R({ code: 'gross', factory: '1e-4', M }, { highlight: 'inter-module', focus: 2 })
    expect([2, 3].map((i) => litAmount(r, 'lpu', i))).toEqual([1, 1])
    expect([0, 1, 4, 5].map((i) => litAmount(r, 'lpu', i))).toEqual([0, 0, 0, 0])
    expect([litAmount(r, 'adapter', 2), litAmount(r, 'adapter', 1), litAmount(r, 'adapter', 3)]).toEqual([1, 0, 0])
    expect(litAmount(r, 'pivot', 2)).toBe(0)
  })
  it("'t-injection' the factory, its adapter, the adjacent LPU and its pivot: the last module in a line, the first in the triangular layout", () => {
    const lin = R({ code: 'gross', factory: '1e-4', M }, { highlight: 't-injection' })
    expect([litAmount(lin, 'factory', 0), litAmount(lin, 'fadapter', 0), litAmount(lin, 'lpu', 5), litAmount(lin, 'pivot', 5), litAmount(lin, 'lpu', 0), litAmount(lin, 'pivot', 0), litAmount(lin, 'adapter', 4)]).toEqual([1, 1, 1, 1, 0, 0, 0])
    const tri = R({ code: 'gross', factory: '1e-4', M, layout: 'triangular' }, { highlight: 't-injection' })
    expect([litAmount(tri, 'lpu', 0), litAmount(tri, 'pivot', 0), litAmount(tri, 'lpu', 5)]).toEqual([1, 1, 0])
    expect([factoryModule(6, 'linear'), factoryModule(6, 'triangular')]).toEqual([5, 0])
  })
  it("'ghz' every pivot and every adapter", () => {
    expect(litSet('ghz')).toEqual(['pivot0', 'pivot1', 'pivot2', 'pivot3', 'pivot4', 'pivot5', 'adapter0', 'adapter1', 'adapter2', 'adapter3', 'adapter4', 'adapter5'])
    expect(isLit('ghz', 0, 'code', 0, 6, 'linear')).toBe(false)
  })
})

describe('module-map: the readouts print the engine’s numbers in the plan’s words', () => {
  it('q, n, the parts with u and f marked reported, the per-logical figure, the yield', () => {
    expect(texts(R(G10, { readouts: ALL_READOUTS }))).toEqual([
      "q = 4801 (uses Table 1's u and f)",
      'n = 11 M = 110',
      'c = 288 · u = 90 (reported) · a = 22',
      'a′ = 13 · f = 810 (reported)',
      '(c + u)/12 = 31.5 physical qubits per logical qubit',
      'chip yield y^J = 4.6 × 10⁻⁴ (1 in 2170)',
      'assumes two couplers per qubit (ours)',
    ])
    expect(texts(R({ code: 'two-gross', factory: '1e-3', M: 10 }, { readouts: ['q', 'perLogical'] }))).toEqual(["q = 8138 (uses Table 1's u and f)", '(c + u)/12 = 61.2 physical qubits per logical qubit'])
    expect(texts(R(G10))).toEqual([])
    expect(moduleMapReadouts(R(G10, { readouts: ALL_READOUTS })).map((x) => x.name)).toEqual(['q', 'n', 'parts', 'parts-factory', 'perLogical', 'yield', 'yield-note'])
  })
  it('a small machine’s yield is a percentage', () => {
    expect(texts(R({ code: 'gross', factory: 'none', M: 1 }, { readouts: ['yield'] }))[0]).toMatch(/^chip yield y\^J = \d+(\.\d)? % \(1 in \d+\)$/)
  })
  it('the accessible text lists the parts and q', () => {
    expect(moduleMapSummary(R(G10))).toBe("bicycle machine: gross code, 10 modules, linear layout, T factory, p\u00a0=\u00a010⁻⁴; c = 288, u = 90 (reported), a = 22, a′ = 13, f = 810 (reported); q = 4801 physical qubits (Eq. 25, uses Table 1's u and f), n = 110 data qubits")
    expect(moduleMapSummary(R({ code: 'gross', factory: 'none', M: 1 }))).toMatch(/^bicycle machine: gross code, 1 module, linear layout, no T factory; c = 288, u = 90 \(reported\), a = 22; q = 378 /)
  })
})

describe('module-map: validation names the field', () => {
  it('accepts every combination the plan allows', () => {
    for (const code of MODULE_MAP_CODES) for (const factory of MODULE_MAP_FACTORIES) for (const M of [1, 6, 7, 12, 13, 1000]) expect(bad({ code, factory, M }), `${code} ${factory} ${M}`).toEqual([])
    expect(bad({ code: 'gross', factory: '1e-4', M: 6, layout: 'triangular' }, { highlight: 't-injection', focus: 5, readouts: ALL_READOUTS })).toEqual([])
    expect(bad({ code: 'gross', factory: '1e-4', M: 6 }, { highlight: 'inter-module', focus: 4 })).toEqual([])
  })
  it('refuses a bad machine', () => {
    expect(bad({ code: 'b144' as never, factory: 'none', M: 3 })).toEqual([`module-map machine.code: one of 'gross', 'two-gross'`])
    expect(bad({ code: 'gross', factory: '1e-5' as never, M: 3 })).toEqual([`module-map machine.factory: one of '1e-3', '1e-4', 'none'`])
    for (const M of [0, 1001, 2.5, -1, Number.NaN]) expect(bad({ code: 'gross', factory: 'none', M }), String(M)).toEqual(['module-map machine.M: a whole number 1–1000'])
    expect(bad({ code: 'gross', factory: 'none', M: 3, layout: 'ring' as never })).toEqual([`module-map machine.layout: one of 'linear', 'triangular'`])
    expect(bad({ code: 'gross', factory: 'none', M: 3, zz: 1 } as never)).toEqual(['module-map machine.zz: unknown field (allowed: code, factory, M, layout)'])
  })
  it('the triangular layout takes at most 6 modules', () => {
    expect(bad({ code: 'gross', factory: '1e-4', M: 7, layout: 'triangular' })).toEqual(['module-map machine.layout: the triangular layout (Fig. 2b) draws at most 6 modules; this machine has 7'])
    expect(bad({ code: 'gross', factory: '1e-4', M: 6, layout: 'triangular' })).toEqual([])
  })
  it('focus is a module: 0 … M − 2 for inter-module, 0 … M − 1 otherwise', () => {
    expect(bad({ code: 'gross', factory: 'none', M: 4 }, { highlight: 'in-module', focus: 4 })[0]).toBe('module-map focus: a whole number 0–3 (a module counted from 0; this machine has 4 modules)')
    expect(bad({ code: 'gross', factory: 'none', M: 4 }, { highlight: 'in-module', focus: 3 })).toEqual([])
    expect(bad({ code: 'gross', factory: 'none', M: 4 }, { highlight: 'inter-module', focus: 3 })[0]).toMatch(/^module-map focus: a whole number 0–2 \('inter-module' lights module focus and focus \+ 1, so the last is M − 2; this machine has 4 modules\)$/)
    expect(bad({ code: 'gross', factory: 'none', M: 4 }, { highlight: 'inter-module', focus: 2 })).toEqual([])
    expect(bad({ code: 'gross', factory: 'none', M: 4 }, { focus: -1 })[0]).toMatch(/^module-map focus: a whole number 0–3/)
    expect(bad({ code: 'gross', factory: 'none', M: 4 }, { focus: 1.5 })).toEqual(['module-map focus: a whole number (a module counted from 0)'])
    expect(bad({ code: 'gross', factory: 'none', M: 1 }, { highlight: 'inter-module' })).toEqual(["module-map highlight: 'inter-module' lights the adapter between two modules; it needs M of at least 2"])
  })
  it('t-injection and the q readout need a factory; readouts: known names, each once, at most five', () => {
    expect(bad({ code: 'gross', factory: 'none', M: 3 }, { highlight: 't-injection' })).toEqual(["module-map highlight: 't-injection' lights the factory and needs one; set machine.factory to '1e-3' or '1e-4'"])
    expect(bad({ code: 'gross', factory: '1e-3', M: 3 }, { highlight: 't-injection' })).toEqual([])
    expect(bad(G10, { highlight: 'sparkle' as never })).toEqual([`module-map highlight: one of 'none', 'code', 'lpu', 'pivot', 'in-module', 'inter-module', 't-injection', 'ghz'`])
    expect(bad(G10, { readouts: ['qubits' as never] })).toEqual([`module-map readouts: a list of 'q', 'n', 'parts', 'perLogical', 'yield'`])
    expect(bad(G10, { readouts: ['q', 'q'] })).toEqual(['module-map readouts: each name once'])
    expect(bad(G10, { readouts: ['q', 'n', 'parts', 'perLogical', 'yield', 'q'] })).toEqual(['module-map readouts: each name once', 'module-map readouts: at most 5'])
    expect(bad(G10, { readouts: ALL_READOUTS })).toEqual([])
  })
  it('refuses a missing machine and unknown fields', () => {
    expect(validateModuleMapStage({ kind: 'module-map' } as never)).toEqual(['module-map machine: { code, factory, M, layout? }'])
    expect(validateModuleMapStage({ kind: 'module-map', machine: G10, color: 'red' } as never)).toEqual(['module-map color: unknown field (allowed: machine, highlight, focus, readouts, shot)'])
  })
})

describe('module-map: interpolation', () => {
  const a = resolve(S({ code: 'gross', factory: '1e-4', M: 2 }), 1) as ResolvedModuleMap
  const b = resolve(S({ code: 'gross', factory: '1e-4', M: 10 }), 1) as ResolvedModuleMap
  it('the ends are the states themselves', () => {
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
  })
  it('when only M changes the modules step through the whole numbers and the line re-lays out; q follows Eq. 25 at each step', () => {
    const seen = [0.1, 0.25, 0.5, 0.75, 0.9].map((t) => (interpolate(a, b, t) as ResolvedModuleMap).machine.M)
    expect(seen).toEqual([3, 4, 6, 8, 9])
    for (const t of [0.1, 0.5, 0.9]) {
      const m = interpolate(a, b, t) as ResolvedModuleMap
      expect(m.q).toBe(tdgQubits('gross', m.machine.M, '1e-4').q)
      expect(m.shown).toHaveLength(m.machine.M)
    }
    // growing past 12 turns the line into 3 + a gap marker + 2
    const big = resolve(S({ code: 'gross', factory: '1e-4', M: 30 }), 1) as ResolvedModuleMap
    const mid = interpolate(b, big, 0.8) as ResolvedModuleMap
    expect(mid.machine.M).toBe(26)
    expect(mid.shown).toEqual([0, 1, 2, 24, 25])
  })
  it('a change of the code, the factory or the layout switches at the half-way point', () => {
    const c = resolve(S({ code: 'two-gross', factory: '1e-3', M: 4 }), 1) as ResolvedModuleMap
    expect((interpolate(a, c, 0.49) as ResolvedModuleMap).machine).toEqual(a.machine)
    expect((interpolate(a, c, 0.5) as ResolvedModuleMap).machine).toEqual(c.machine)
    const lin = resolve(S({ code: 'gross', factory: '1e-4', M: 4 }), 1) as ResolvedModuleMap
    const tri = resolve(S({ code: 'gross', factory: '1e-4', M: 4, layout: 'triangular' }), 1) as ResolvedModuleMap
    expect((interpolate(lin, tri, 0.3) as ResolvedModuleMap).machine.layout).toBe('linear')
    expect((interpolate(lin, tri, 0.7) as ResolvedModuleMap).machine.layout).toBe('triangular')
  })
  it('a change of highlight cross-fades: the old light fades out as the new one fades in, and a part lit by both stays lit', () => {
    const base: Machine = { code: 'gross', factory: '1e-4', M: 5 }
    const x = resolve(S(base, { highlight: 'code' }), 1) as ResolvedModuleMap
    const y = resolve(S(base, { highlight: 'lpu' }), 1) as ResolvedModuleMap
    for (const t of [0.2, 0.5, 0.8]) {
      const m = interpolate(x, y, t) as ResolvedModuleMap
      expect(m.light.map((l) => l.highlight)).toEqual(['code', 'lpu'])
      expect(m.light.map((l) => l.w)).toEqual([1 - t, t])
      expect(litAmount(m, 'code', 0)).toBeCloseTo(1 - t, 12)
      expect(litAmount(m, 'lpu', 0)).toBeCloseTo(t, 12)
      expect(litAmount(m, 'pivot', 0)).toBe(0)
      expect(partAlpha(m, 'code', 0)).toBeCloseTo(1 - t + t * MAP_DIM, 12)
    }
    const z = resolve(S(base, { highlight: 'ghz' }), 1) as ResolvedModuleMap
    const w = resolve(S(base, { highlight: 'pivot' }), 1) as ResolvedModuleMap
    expect(litAmount(interpolate(z, w, 0.4) as ResolvedModuleMap, 'pivot', 2)).toBeCloseTo(1, 12)
    // the focus moves like a highlight
    const f0 = resolve(S(base, { highlight: 'in-module', focus: 0 }), 1) as ResolvedModuleMap
    const f3 = resolve(S(base, { highlight: 'in-module', focus: 3 }), 1) as ResolvedModuleMap
    const mid = interpolate(f0, f3, 0.25) as ResolvedModuleMap
    expect([litAmount(mid, 'lpu', 0), litAmount(mid, 'lpu', 3)]).toEqual([0.75, 0.25])
  })
  it('an interpolated state is a complete resolved state: finite, drawable, and its focus fits a smaller machine', () => {
    const big = resolve(S({ code: 'gross', factory: '1e-4', M: 9 }, { highlight: 'in-module', focus: 8 }), 1) as ResolvedModuleMap
    const small = resolve(S({ code: 'gross', factory: '1e-4', M: 2 }, { highlight: 'ghz' }), 1) as ResolvedModuleMap
    for (const t of [0.1, 0.4, 0.6, 0.9]) {
      const m = interpolate(big, small, t) as ResolvedModuleMap
      expect(firstNonFinite(m)).toBeNull()
      expect(m.light.every((l) => l.focus <= Math.max(0, m.machine.M - 1))).toBe(true)
      expect(draw(m, 'print', 320, 220)).not.toMatch(/NaN|Infinity|undefined/)
    }
  })
})

/** Every text element of a rendered figure with its box (6.2 px a character at 10–12 px type, 11 px tall). */
function textBoxes(html: string): { text: string; x0: number; x1: number; y0: number; y1: number }[] {
  const out: { text: string; x0: number; x1: number; y0: number; y1: number }[] = []
  for (const m of html.matchAll(/<text([^>]*)>(.*?)<\/text>/g)) {
    const attrs = m[1]
    const x = Number(/\bx="([-\d.]+)"/.exec(attrs)?.[1])
    const y = Number(/\by="([-\d.]+)"/.exec(attrs)?.[1])
    const anchor = /text-anchor="(\w+)"/.exec(attrs)?.[1] ?? 'start'
    const size = Number(/font-size:\s*([\d.]+)/.exec(attrs)?.[1] ?? 11)
    const text = m[2].replace(/<[^>]*>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
    if (!Number.isFinite(x) || !Number.isFinite(y) || !text) continue
    const w = text.length * size * 0.56
    const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x
    out.push({ text, x0, x1: x0 + w, y0: y - size * 0.8, y1: y + 2 })
  }
  return out
}
const clash = (a: ReturnType<typeof textBoxes>[number], b: ReturnType<typeof textBoxes>[number]) => a.x0 < b.x1 - 0.5 && b.x0 < a.x1 - 0.5 && a.y0 < b.y1 - 0.5 && b.y0 < a.y1 - 0.5

const BOXES = [
  ['stage', 640, 560, false, 'full'],
  ['stage', 375, 520, false, 'full'],
  ['stage', 375, 380, false, 'top'],
  ['stage', 375, 340, false, 'bottom'],
  ['print', 320, 220, false, 'full'],
  ['stage', 360, 260, true, 'full'],
] as const

const CASES: ModuleMapState[] = [
  S({ code: 'gross', factory: '1e-4', M: 10 }, { highlight: 'ghz', readouts: ALL_READOUTS }),
  S({ code: 'two-gross', factory: '1e-3', M: 12 }, { highlight: 'inter-module', focus: 5, readouts: ['q', 'n', 'parts'] }),
  S({ code: 'gross', factory: 'none', M: 1 }, { highlight: 'in-module' }),
  S({ code: 'gross', factory: '1e-3', M: 1 }, { highlight: 't-injection', readouts: ['parts'] }),
  S({ code: 'gross', factory: '1e-4', M: 13 }, { highlight: 'pivot' }),
  S({ code: 'two-gross', factory: '1e-3', M: 1000 }, { highlight: 'lpu', readouts: ['q', 'yield'] }),
  S({ code: 'gross', factory: '1e-4', M: 6, layout: 'triangular' }, { highlight: 't-injection', readouts: ['q', 'n'] }),
  S({ code: 'two-gross', factory: '1e-4', M: 2, layout: 'triangular' }, { highlight: 'code' }),
  S({ code: 'gross', factory: '1e-4', M: 1, layout: 'triangular' }, { readouts: ['parts', 'perLogical'] }),
  S({ code: 'gross', factory: 'none', M: 7 }, {}),
]

describe('module-map: the scene', () => {
  it('draws in the live stage, the reading version and the print figure with no NaN, and names every block', () => {
    for (const st of CASES)
      for (const [mode, w0, h0, bare, slot] of BOXES) {
        const r = resolve(st, 1) as ResolvedModuleMap
        const { w, h } = boxOf(r, mode, w0, h0)
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${r.machine.code} ${r.machine.factory} M${r.machine.M} ${r.machine.layout} ${mode} ${w}x${h} ${slot}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-kind="module-map"')
        const count = (re: RegExp) => (html.match(re) ?? []).length
        expect(count(/data-part="code"/g), `${where}: code blocks`).toBe(r.shown.length)
        expect(count(/data-part="lpu"/g), `${where}: LPUs`).toBe(r.shown.length)
        expect(count(/data-part="pivot"/g), `${where}: pivots`).toBe(r.shown.length)
        expect(count(/data-wire="/g), `${where}: wires`).toBe(12 * r.shown.length)
        const adjacent = r.shown.filter((m, k) => r.shown[k + 1] === m + 1).length
        expect(count(/data-part="adapter"/g), `${where}: adapters`).toBe(adjacent)
        expect(count(/data-part="factory"/g), `${where}: factory`).toBe(r.machine.factory === 'none' ? 0 : 1)
        expect(count(/data-part="fadapter"/g), `${where}: factory adapter`).toBe(r.machine.factory === 'none' ? 0 : 1)
        // the reported blocks are said to be reported: on their accessible names and in a badge
        expect(count(/aria-label="logical processing unit of module \d+: \d+ qubits \(reported, Table 1\)"/g), where).toBe(r.shown.length)
        if (r.machine.factory !== 'none') expect(html).toContain(`T factory: ${r.parts.f} qubits (reported, Table 1)`)
        expect(/data-badge="(u|uf)"/.test(html), where).toBe(true)
        expect(/data-badge="(f|uf)"/.test(html), where).toBe(r.machine.factory !== 'none')
        if (r.hidden) expect(html).toContain(`${r.hidden} more`)
        else expect(html).not.toMatch(/more</)
        expect(html).toContain(`code block of module ${r.shown[0] + 1}: ${r.parts.c} qubits (computed)`)
        expect(html.replace(/&#x27;/g, "'")).toContain(moduleMapSummary(r))
        for (const q of [1, 7]) expect(html).toContain(`logical qubit ${q} of module 1`)
        expect(html).toContain('dashed = reported')
      }
  })
  it('a lit part carries its ring and the others are dimmed; a cross-fade shows both rings at their weights', () => {
    const r = resolve(S({ code: 'gross', factory: '1e-4', M: 4 }, { highlight: 'inter-module', focus: 1 }), 1) as ResolvedModuleMap
    const html = draw(r, 'print', 320, 220)
    expect(html.match(/data-lit="1\.00"/g)?.length).toBe(3) // two LPUs and the adapter
    expect(html).toContain(`opacity="${MAP_DIM}"`)
    const x = resolve(S({ code: 'gross', factory: '1e-4', M: 4 }, { highlight: 'code' }), 1) as ResolvedModuleMap
    const y = resolve(S({ code: 'gross', factory: '1e-4', M: 4 }, { highlight: 'lpu' }), 1) as ResolvedModuleMap
    const mid = draw(interpolate(x, y, 0.25) as ResolvedModuleMap, 'print', 320, 220)
    expect(mid).toContain('data-lit="0.75"')
    expect(mid).toContain('data-lit="0.25"')
  })
  it('the linear layout puts the factory at the end of the line; the triangular one in a second row under module 1', () => {
    const lin = resolve(S({ code: 'gross', factory: '1e-4', M: 4 }), 1) as ResolvedModuleMap
    const gl = moduleMapGeometry(lin, 640, 560, false)
    const last = gl.modules[3]
    expect(gl.factory!.box.x).toBeGreaterThan(last.lpu.x + last.lpu.w)
    expect(gl.factory!.box.y).toBeLessThan(last.lpu.y + last.lpu.h)
    const tri = resolve(S({ code: 'gross', factory: '1e-4', M: 4, layout: 'triangular' }), 1) as ResolvedModuleMap
    const gt = moduleMapGeometry(tri, 640, 560, false)
    const first = gt.modules[0]
    expect(gt.factory!.box.y).toBeGreaterThan(first.lpu.y + first.lpu.h)
    expect(gt.factory!.box.x + gt.factory!.box.w / 2).toBeCloseTo(first.cx, 6)
    expect(gt.factory!.adapter.y).toBeGreaterThanOrEqual(first.lpu.y + first.lpu.h)
    expect(gt.factory!.adapter.y + gt.factory!.adapter.h).toBeLessThanOrEqual(gt.factory!.box.y + 1e-9)
  })
  it('block areas grow with the square root of the counts: code over LPU is (c/u)^(1/4) in side, the factory the biggest block, an adapter’s width grows with sqrt(a)', () => {
    const r = resolve(S({ code: 'gross', factory: '1e-4', M: 3 }), 1) as ResolvedModuleMap
    const g = moduleMapGeometry(r, 640, 560, false)
    const m = g.modules[0]
    expect((m.code.w * m.code.h) / (m.lpu.w * m.lpu.h)).toBeCloseTo(Math.sqrt(288 / 90), 9)
    expect((g.factory!.box.w * g.factory!.box.h) / (m.code.w * m.code.h)).toBeCloseTo(Math.sqrt(810 / 288), 9)
    const t = resolve(S({ code: 'two-gross', factory: '1e-4', M: 3 }), 1) as ResolvedModuleMap
    const gt = moduleMapGeometry(t, 640, 560, false)
    expect(gt.adapters[0].box.w / gt.u / (g.adapters[0].box.w / g.u)).toBeCloseTo(Math.sqrt(34 / 22), 9)
    // the same ratio from the area of the block: two-gross code over gross code
    expect((gt.modules[0].code.w * gt.modules[0].code.h) / gt.u ** 2 / ((m.code.w * m.code.h) / g.u ** 2)).toBeCloseTo(Math.sqrt(576 / 288), 9)
  })
  it('packs inside the box: every block clear of the text lines and the legend, modules apart, nothing leaves the box', () => {
    for (const st of CASES)
      for (const [mode, w0, h0, bare, slot] of BOXES) {
        const r = resolve(st, 1) as ResolvedModuleMap
        const { w, h } = boxOf(r, mode, w0, h0)
        const g = moduleMapGeometry(r, w, h, mode === 'print' || bare, slot)
        const where = `${r.machine.code} ${r.machine.factory} M${r.machine.M} ${r.machine.layout} ${mode} ${w}x${h} ${slot}`
        const boxes = [...g.modules.flatMap((m) => [m.code, m.lpu]), ...g.adapters.map((a) => a.box), ...(g.factory ? [g.factory.box, g.factory.adapter] : [])]
        for (const b of boxes) {
          expect(b.x, where).toBeGreaterThanOrEqual(g.area.x - 1)
          expect(b.x + b.w, where).toBeLessThanOrEqual(g.area.x + g.area.w + 1)
          expect(b.y, where).toBeGreaterThanOrEqual(g.area.y)
          expect(b.y + b.h, where).toBeLessThanOrEqual(g.legendY - 6)
        }
        for (let i = 1; i < g.modules.length; i++) expect(g.modules[i].code.x, `${where}: module ${i} touches the one before`).toBeGreaterThan(g.modules[i - 1].code.x + g.modules[i - 1].code.w)
        if (g.lines.length) expect(6 + 13 * g.lines.length, where).toBeLessThanOrEqual(g.area.y + 1)
        expect(g.badgeY + 2, where).toBeLessThanOrEqual(g.legendY - 8)
        expect(g.area.y + g.area.h, where).toBeLessThanOrEqual(h)
        expect(legendRowCount(r, g.area.w)).toBeGreaterThanOrEqual(1)
      }
  })
  it('no two text labels overlap, in any box, and none leaves it', () => {
    for (const st of CASES)
      for (const [mode, w0, h0, bare, slot] of BOXES) {
        const r = resolve(st, 1) as ResolvedModuleMap
        const { w, h } = boxOf(r, mode, w0, h0)
        const t = textBoxes(draw(r, mode, w, h, bare, slot))
        const where = `${r.machine.code} ${r.machine.factory} M${r.machine.M} ${r.machine.layout} ${mode} ${w}x${h} ${slot}`
        for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) expect(clash(t[i], t[j]), `${where}: "${t[i].text}" and "${t[j].text}"`).toBe(false)
        for (const b of t) {
          expect(b.x0, `${where}: ${b.text}`).toBeGreaterThanOrEqual(-1)
          expect(b.x1, `${where}: ${b.text}`).toBeLessThanOrEqual(w + 1)
        }
      }
  })
  it('the print figure is 320 × 220 and carries the readouts as text lines and the machine in its accessible text', () => {
    const light = S({ code: 'gross', factory: '1e-4', M: 10 }, { highlight: 'ghz', readouts: ['q', 'n'] })
    expect(renderToString(<FigureFor layout={light} number="P1.2" />)).toContain('viewBox="0 0 320 220"')
    // many readout lines make the figure taller (13 px a line beyond the third), never the drawing smaller
    const heavy = resolve(CASES[0], 1) as ResolvedModuleMap
    const lines = 1 + packLines(moduleMapReadouts(heavy).map((x) => x.text), 50).length
    expect(lines).toBeGreaterThan(3)
    expect(svgKindDef('module-map')!.printSize!(heavy)).toEqual({ w: 320, h: 220 + 13 * (lines - 3) })
    const html = renderToString(<FigureFor layout={CASES[0]} number="P1.2" />)
    expect(html).toContain(`viewBox="0 0 320 ${220 + 13 * (lines - 3)}"`)
    expect(html).toContain('<title>Fig. P1.2: ARCHITECTURE · modules (schematic)</title>')
    expect(html).toContain("q = 4801 (uses Table 1&#x27;s u and f)")
    expect(html).toContain('n = 11 M = 110')
    expect(html).toContain('svgk-print')
    expect(html).toContain('T factory: 810 qubits (reported, Table 1)')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
})
