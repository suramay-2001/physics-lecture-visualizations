/**
 * `code` additions of the Papers background chapter B1 (P-B1-story §9.2 K-C): the toric, rotated and planar SOURCES, with the views 'torus', 'patch' and the Tanner 'layout', a `fault`, an
 * `operator` (and `operator2`), the `weights` / `stars` / `plaquettes` shows and a check-circuit `schedule`. Content writes inputs only (a size, a view, qubit numbers, an operator name, two corner
 * orders); the resolver takes every check, syndrome, operator, overlap, classification, step and flagged pair from physics/qec. These tests check each drawn fact against the engine through a
 * second route (the stabilizer-code syndrome, the engine's own lit-check function, its schedule checker), every validation limit with a message that names the field, the readouts, the
 * passport / vocabulary, and that the one scene names every qubit and check, draws no NaN and packs inside the box, in both modes, in every box down to a 375 px phone.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { CodeCorner, CodeState } from '../../content/stage'
import { CODE_CORNERS, CODE_PATCH_OPERATORS, CODE_TORIC_OPERATORS } from '../../content/stage'
import { ANCHORS } from '../../content/stageVocab'
import { Pauli } from '../../physics/qec/pauli'
import { planarSurfaceCode } from '../../physics/qec/planar'
import { checkSteps, patchChecks, scheduleCheck } from '../../physics/qec/schedule'
import { toricCode, toricInStabilizer, toricLit, toricOperator } from '../../physics/qec/toric'
import { rotatedSurfaceCode } from '../../physics/qec/codes'
import { FigureFor } from '../figures/FigureFor'
import { resolve, validateLayout, validateStage } from '../resolve'
import type { ResolvedCode } from '../types'
import { CodeScene, codeGeometry } from './CodeScene'
import { wrapLength } from './CodeSurfaceScene'
import { codeReadouts, validateCodeStage } from './code'
import { SURFACE_LIMITS } from './code.surface'
import './kinds'

const C = (st: Omit<CodeState, 'kind'>): CodeState => ({ kind: 'code', ...st })
const R = (st: Omit<CodeState, 'kind'>) => resolve(C(st), 1) as ResolvedCode
const bad = (st: Omit<CodeState, 'kind'>) => validateCodeStage(C(st))
const texts = (r: ResolvedCode) => codeReadouts(r).map((x) => x.text)
const lit = (r: ResolvedCode) => r.checks.filter((c) => c.flipped === 1).map((c) => c.label)
type Mode = 'stage' | 'print'
const draw = (r: ResolvedCode, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <CodeScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

/** The syndrome of a fault by the stabilizer-code route (Pauli commutation), as the labels of the checks that read −1, in the resolved order. */
function syndromeLabels(r: ResolvedCode, code: { stabilizer: () => { syndrome: (p: Pauli) => number[] } }, letters: string[], order: number[]): string[] {
  const syn = code.stabilizer().syndrome(Pauli.fromLetters(letters as ('I' | 'X' | 'Y' | 'Z')[]))
  return r.checks.filter((_, i) => syn[order[i]] === 1).map((c) => c.label)
}

describe('code B1: the sources, the vocabulary and the drawer', () => {
  it('the new fields and names are part of the stage vocabulary, and the drawer has the schedule note', () => {
    expect([...CODE_TORIC_OPERATORS]).toEqual(['z-loop-h', 'z-loop-v', 'x-cut-h', 'x-cut-v', 'plaquette'])
    expect([...CODE_PATCH_OPERATORS]).toEqual(['xbar', 'zbar'])
    expect([...CODE_CORNERS]).toEqual(['TL', 'TR', 'BL', 'BR'])
    expect(ANCHORS.code).toEqual(expect.arrayContaining(['fault', 'operator', 'wrap', 'schedule', 'flagged']))
    const f = fidelityOf('code')
    expect(f.schematic.map((i) => i.id)).toContain('qc-code-schedule-order')
    expect(f.misleading.map((i) => i.id)).toEqual(['qc-code-lit'])
  })
  it('a state names its source in exactly one way; the view defaults to the natural picture', () => {
    expect(validateStage(C({ toric: { L: 3 } }))).toEqual([])
    expect(R({ toric: { L: 3 } }).view).toBe('torus')
    expect(R({ rotated: { d: 3 } }).view).toBe('patch')
    expect(R({ planar: { d: 3 } }).view).toBe('patch')
    expect(R({ code: 'steane7' }).view).toBe('layout')
    expect(bad({})).toEqual(['code: exactly one of code, toric, rotated, planar (name a registry id or one of the three sources)'])
    expect(bad({ code: 'steane7', toric: { L: 3 } })).toEqual(['code: exactly one of code, toric, rotated, planar'])
    expect(bad({ toric: { L: 3 }, rotated: { d: 3 } })).toEqual(['code: exactly one of code, toric, rotated, planar'])
  })
  it('a split with another kind validates', () => {
    expect(validateLayout({ layout: 'split', top: C({ rotated: { d: 3 } }), bottom: { kind: 'plot', curve: { fn: 'identityP' } } })).toEqual([])
  })
})

describe('code B1: the toric code is the engine’s', () => {
  it('has 2LM edge qubits, LM stars and LM plaquettes of weight 4, k = 2, the engine’s supports', () => {
    for (const [L, M] of [[2, 2], [3, 3], [3, 4], [4, 3], [5, 2], [8, 8]] as const) {
      const r = R({ toric: { L, M } })
      const t = toricCode(L, M)
      expect([r.n, r.k, r.checks.length, r.qubits.length]).toEqual([2 * L * M, 2, 2 * L * M, 2 * L * M])
      expect(r.name).toBe(`toric code ${L} × ${M}`)
      expect(r.checks.filter((c) => c.kind === 'X')).toHaveLength(L * M)
      for (const c of r.checks) expect(c.support).toHaveLength(4)
      r.checks.slice(0, L * M).forEach((c, k) => expect(c.support, `star ${k}`).toEqual([...t.stars[k]].sort((a, b) => a - b)))
      r.checks.slice(L * M).forEach((c, k) => expect(c.support, `plaquette ${k}`).toEqual([...t.plaquettes[k]].sort((a, b) => a - b)))
      expect(r.surface!.wraps).toHaveLength(2 * (L + M))
      expect(r.surface!.counts).toEqual({ x: L * M, z: L * M, weights: { 4: 2 * L * M } })
    }
    expect(R({ toric: { L: 4 } }).id).toBe('toric-4x4')
    expect(R({ toric: { L: 3, M: 5 } }).id).toBe('toric-3x5')
  })
  it('a Z fault lights the stars at its ends, an X fault the plaquettes beside it, a Y fault both — each equal to the engine’s lit checks and to the stabilizer syndrome', () => {
    for (const [L, M] of [[3, 3], [4, 3], [6, 5]] as const) {
      const t = toricCode(L, M)
      for (const type of ['X', 'Y', 'Z'] as const)
        for (const qubits of [[0], [t.hEdge(1, 1)], [t.vEdge(0, M - 1), t.hEdge(L - 1, 0)], [0, 1, 2, t.vEdge(2, 1)]]) {
          const r = R({ toric: { L, M }, view: 'torus', fault: { type, qubits }, show: ['syndrome'] })
          const stars = type === 'X' ? [] : toricLit(t, 'Z', qubits)
          const plaq = type === 'Z' ? [] : toricLit(t, 'X', qubits).map((i) => i + L * M)
          const want = [...stars, ...plaq].map((i) => r.checks[i].label)
          expect(lit(r), `${type} ${qubits} on ${L}x${M}`).toEqual(want)
          // a second route: Pauli commutation through the stabilizer code (generators are the stars, then the plaquettes)
          const letters = Array.from({ length: t.n }, (_, q) => (qubits.includes(q) ? type : 'I'))
          expect(syndromeLabels(r, t.code, letters, r.checks.map((_, i) => i)), `${type} ${qubits}`).toEqual(want)
        }
    }
    // a single Z on one edge: the two stars at its ends; a single X: the two plaquettes either side
    expect(lit(R({ toric: { L: 3 }, fault: { type: 'Z', qubits: [0] }, show: ['syndrome'] }))).toEqual(['X1', 'X2'])
    expect(lit(R({ toric: { L: 3 }, fault: { type: 'X', qubits: [0] }, show: ['syndrome'] }))).toHaveLength(2)
    // a closed loop of Z lights nothing
    const loop = toricOperator(toricCode(4, 4), 'z-loop-h', 2).qubits
    expect(lit(R({ toric: { L: 4 }, fault: { type: 'Z', qubits: loop }, show: ['syndrome'] }))).toEqual([])
  })
  it('the lit checks are drawn only when asked for; the fault’s letters are always on its qubits', () => {
    const quiet = R({ toric: { L: 3 }, fault: { type: 'Z', qubits: [4] } })
    expect(lit(quiet)).toEqual([])
    expect(quiet.qubits[4].error).toBe('Z')
    expect(quiet.qubits.filter((q) => q.error)).toHaveLength(1)
    expect(quiet.syndrome).toBeNull()
  })
  it('the named operators are the engine’s, with the weight, the lit checks, the classification and the overlap it reports', () => {
    const t = toricCode(4, 3)
    for (const name of CODE_TORIC_OPERATORS)
      for (const at of name === 'plaquette' ? [0, 1, 2] : [0, 1, 2]) {
        const r = R({ toric: { L: 4, M: 3 }, operator: name, at, show: ['logical'] })
        const want = toricOperator(t, name, at)
        const op = r.surface!.operator!
        expect(op.qubits, `${name} ${at}`).toEqual([...want.qubits].sort((a, b) => a - b))
        expect(op.type).toBe(want.type)
        expect(op.weight).toBe(want.qubits.length)
        expect(op.lit).toEqual([])
        expect(op.classification).toBe(name === 'plaquette' ? 'stabilizer' : 'logical operator')
        expect(toricInStabilizer(t, want.type, want.qubits)).toBe(name === 'plaquette')
        expect(r.qubits.filter((q) => q.operator).map((q) => q.index)).toEqual(op.qubits)
      }
    expect(R({ toric: { L: 4, M: 3 }, operator: 'z-loop-h', at: 1 }).surface!.operator!.weight).toBe(4)
    expect(R({ toric: { L: 4, M: 3 }, operator: 'z-loop-v', at: 1 }).surface!.operator!.weight).toBe(3)
    expect(R({ toric: { L: 4, M: 3 }, operator: 'plaquette' }).surface!.operator!.weight).toBe(4)
  })
  it('a Z loop and an X cut across it share exactly one edge (they anticommute); two loops of one kind share none or one; a plaquette shares 0 or 2 with a star-side cut', () => {
    const r = R({ toric: { L: 4, M: 3 }, operator: 'z-loop-h', operator2: 'x-cut-v', at: 1, show: ['logical'] })
    expect(r.surface!.overlap).toHaveLength(1)
    expect(r.qubits.filter((q) => q.overlap).map((q) => q.index)).toEqual(r.surface!.overlap)
    expect(texts(r)).toContain('overlap 1: anticommute')
    const par = R({ toric: { L: 4, M: 3 }, operator: 'z-loop-h', operator2: 'x-cut-v', at: 0 })
    expect(par.surface!.overlap).toHaveLength(1)
    // a loop along a row (horizontal edges) and a loop up a column (vertical edges) have no edge in common
    const same = R({ toric: { L: 4, M: 3 }, operator: 'z-loop-h', operator2: 'z-loop-v', at: 1 })
    expect(same.surface!.overlap).toHaveLength(0)
    expect(texts(same)).toContain('overlap 0')
    // the loop up a column and the cut along a row both use vertical edges: they cross once
    expect(R({ toric: { L: 4, M: 3 }, operator: 'z-loop-v', operator2: 'x-cut-h', at: 2 }).surface!.overlap).toHaveLength(1)
    // the loop of Z along a row and the cut of X made of vertical edges have no edge in common
    const none = R({ toric: { L: 4, M: 3 }, operator: 'z-loop-h', operator2: 'x-cut-h', at: 1 })
    expect(none.surface!.overlap).toHaveLength(0)
    expect(texts(none)).toContain('overlap 0: commute')
    // a plaquette (Z type) and a cut (X type) meet an even number of times: they commute, as a check must with a logical operator
    expect(R({ toric: { L: 4, M: 3 }, operator: 'plaquette', operator2: 'x-cut-h', at: 1 }).surface!.overlap.length % 2).toBe(0)
  })
  it('the positions: edge qubits at the midpoints of a wrapped grid, stars at the vertices, plaquettes at the faces, y growing downward (north is up)', () => {
    const r = R({ toric: { L: 3, M: 2 }, view: 'torus' })
    const t = toricCode(3, 2)
    expect(r.qubits[t.hEdge(1, 1)]).toMatchObject({ x: 1.5, y: -1 })
    expect(r.qubits[t.vEdge(2, 0)]).toMatchObject({ x: 2, y: -0.5 })
    expect(r.checks[1 * 3 + 2]).toMatchObject({ kind: 'X', x: 2, y: -1 })
    expect(r.checks[6 + 1 * 3 + 2]).toMatchObject({ kind: 'Z', x: 2.5, y: -1.5 })
    // every check sits half a step from each qubit it touches (round the torus: the tile's border is not the edge of the code)
    for (const c of r.checks)
      for (const q of c.support) {
        const dx = Math.abs(r.qubits[q].x - c.x)
        const dy = Math.abs(r.qubits[q].y - c.y)
        expect(Math.hypot(Math.min(dx, 3 - dx), Math.min(dy, 2 - dy)), `${c.label} ${q}`).toBeCloseTo(0.5, 9)
      }
    // the wrap arrows: an edge that runs off the right border returns at the left; one that runs off the top returns at the bottom
    const out = r.surface!.wraps.filter((w) => w.end === 'out')
    expect(out.filter((w) => w.dir === 'E').map((w) => w.qubit).sort((a, b) => a - b)).toEqual([t.hEdge(2, 0), t.hEdge(2, 1)])
    expect(out.filter((w) => w.dir === 'N').map((w) => w.qubit).sort((a, b) => a - b)).toEqual([0, 1, 2].map((i) => t.vEdge(i, 1)))
    expect(r.surface!.frame).toEqual([-0.5, -1.5, 2.5, 0.5])
  })
})

describe('code B1: the rotated patch is the engine’s', () => {
  it('has d² data qubits and d² − 1 checks (the bulk faces of weight 4 and the half-discs of weight 2), k = 1', () => {
    for (const d of [3, 5, 7, 9]) {
      const r = R({ rotated: { d } })
      expect([r.n, r.k, r.checks.length]).toEqual([d * d, 1, d * d - 1])
      expect(r.surface!.counts.weights).toEqual({ 4: (d - 1) * (d - 1), 2: 2 * (d - 1) })
      expect(r.surface!.counts.x + r.surface!.counts.z).toBe(d * d - 1)
      expect(r.plaquettes).toHaveLength(d * d - 1)
      expect(r.plaquettes.filter((p) => p.apex).length).toBe(2 * (d - 1))
      const eng = rotatedSurfaceCode(d)
      r.checks.forEach((c, i) => {
        expect(c.support).toEqual(eng.checks[i].qubits)
        expect(c.kind).toBe(eng.checks[i].type)
        expect([c.x, c.y]).toEqual(eng.checks[i].center)
      })
      r.qubits.forEach((q, i) => expect([q.x, q.y]).toEqual(eng.data[i]))
    }
  })
  it('a fault’s lit checks equal the stabilizer syndrome (a Z on a bulk qubit lights two X faces; on the Z-boundary edge, one)', () => {
    for (const d of [3, 5, 9]) {
      const eng = rotatedSurfaceCode(d)
      const stab = eng.code.stabilizer()
      // the stabilizer lists the X checks first, then the Z checks, each in the engine's check order
      const order: number[] = []
      let nx = 0
      const xCount = eng.checks.filter((c) => c.type === 'X').length
      let nz = 0
      eng.checks.forEach((c) => order.push(c.type === 'X' ? nx++ : xCount + nz++))
      for (const type of ['X', 'Y', 'Z'] as const)
        for (const qubits of [[0], [Math.floor((d * d) / 2)], [1, d, d + 1], [d * d - 1, d * d - 2]]) {
          const r = R({ rotated: { d }, fault: { type, qubits }, show: ['syndrome'] })
          const letters = Array.from({ length: d * d }, (_, q) => (qubits.includes(q) ? type : 'I'))
          const syn = stab.syndrome(Pauli.fromLetters(letters))
          const want = r.checks.filter((_, i) => syn[order[i]] === 1).map((c) => c.label)
          expect(lit(r), `d=${d} ${type} ${qubits}`).toEqual(want)
        }
    }
    const mid = R({ rotated: { d: 5 }, fault: { type: 'Z', qubits: [12] }, show: ['syndrome'] })
    expect(lit(mid)).toHaveLength(2)
    expect(mid.checks.filter((c) => c.flipped === 1).every((c) => c.kind === 'X')).toBe(true)
    expect(lit(R({ rotated: { d: 3 }, fault: { type: 'Z', qubits: [1] }, show: ['syndrome'] })).length).toBeGreaterThanOrEqual(1)
  })
  it('xbar and zbar are the engine’s logical operators: weight d, they light no check, they are not products of checks, and they meet in one qubit', () => {
    for (const d of [3, 5, 7]) {
      const eng = rotatedSurfaceCode(d)
      const r = R({ rotated: { d }, operator: 'xbar', operator2: 'zbar', show: ['logical'] })
      expect(r.surface!.operator).toMatchObject({ type: 'X', weight: d, lit: [], classification: 'logical operator' })
      expect(r.surface!.operator2).toMatchObject({ type: 'Z', weight: d, lit: [], classification: 'logical operator' })
      expect(r.surface!.operator!.qubits).toEqual([...eng.logicalX].sort((a, b) => a - b))
      expect(r.surface!.operator2!.qubits).toEqual([...eng.logicalZ].sort((a, b) => a - b))
      expect(r.surface!.overlap).toEqual([0])
      expect(texts(r)).toContain('overlap 1: anticommute')
      expect(texts(r)).toContain('logical operator')
    }
  })
  it('the schedule: the spokes, the clash count and the flagged pairs are the engine’s, for every pair of orders tried', () => {
    const pairs: [CodeCorner[], CodeCorner[]][] = [
      [['TL', 'TR', 'BL', 'BR'], ['TL', 'BL', 'TR', 'BR']],
      [['TL', 'TR', 'BL', 'BR'], ['TL', 'TR', 'BL', 'BR']],
      [['TL', 'TR', 'BL', 'BR'], ['BR', 'BL', 'TR', 'TL']],
      [['TR', 'TL', 'BR', 'BL'], ['TR', 'BR', 'TL', 'BL']],
      [['TL', 'BR', 'TR', 'BL'], ['BL', 'TR', 'BR', 'TL']],
    ]
    const seen = { valid: 0, flagged: 0, clash: 0 }
    for (const d of [3, 5])
      for (const [xOrder, zOrder] of pairs) {
        const r = R({ rotated: { d }, schedule: { xOrder, zOrder } })
        const eng = scheduleCheck(d, xOrder, zOrder)
        const s = r.surface!.schedule!
        expect([s.conflictFree, s.valid]).toEqual([eng.conflictFree, eng.valid])
        expect(s.violations).toEqual(eng.violations)
        expect(s.clashes).toEqual(eng.clashes)
        const patch = patchChecks(d)
        r.checks.forEach((c, i) => expect(c.steps, `check ${c.label}`).toEqual(checkSteps(patch[i], xOrder, zOrder)))
        const flaggedSet = new Set(eng.violations.flatMap((v) => [v.x, v.z]))
        expect(r.checks.filter((c) => c.flagged).map((c) => c.index)).toEqual([...flaggedSet].sort((a, b) => a - b))
        // a bulk check has four spokes numbered 1–4 once each, a boundary check two
        for (const c of r.checks) {
          expect(c.steps!.map((x) => x.step).sort()).toEqual(c.support.length === 4 ? [1, 2, 3, 4] : c.steps!.map((x) => x.step).sort())
          expect(c.steps).toHaveLength(c.support.length)
        }
        expect(r.qubits.filter((q) => q.clash).map((q) => q.index)).toEqual([...new Set(eng.clashes.map((c) => c.qubit))].sort((a, b) => a - b))
        if (eng.valid) seen.valid++
        if (eng.conflictFree && !eng.valid) seen.flagged++
        if (!eng.conflictFree) seen.clash++
      }
    // the tried orders include a valid one, a clash-free-but-flagged one and one with clashes
    expect(seen.valid).toBeGreaterThan(0)
    expect(seen.flagged).toBeGreaterThan(0)
    expect(seen.clash).toBeGreaterThan(0)
  })
  it('the readout says clash-free / valid / N flagged pairs / clash: n places', () => {
    const valid = R({ rotated: { d: 3 }, schedule: { xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['TL', 'BL', 'TR', 'BR'] } })
    expect(texts(valid)).toContain('clash-free · valid')
    // find, with the engine, one pair of orders with a clash and one that is clash-free but flagged
    const perms = (xs: CodeCorner[]): CodeCorner[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])))
    const all = perms([...CODE_CORNERS])
    let clashing: [CodeCorner[], CodeCorner[]] | null = null
    let flaggedPair: [CodeCorner[], CodeCorner[]] | null = null
    for (const x of all)
      for (const z of all) {
        const e = scheduleCheck(3, x, z)
        if (!clashing && !e.conflictFree) clashing = [x, z]
        if (!flaggedPair && e.conflictFree && !e.valid) flaggedPair = [x, z]
      }
    const c = R({ rotated: { d: 3 }, schedule: { xOrder: clashing![0], zOrder: clashing![1] } })
    const want = scheduleCheck(3, clashing![0], clashing![1])
    expect(texts(c)).toContain(`clash: ${want.clashes.length} place${want.clashes.length === 1 ? '' : 's'}`)
    const f = R({ rotated: { d: 3 }, schedule: { xOrder: flaggedPair![0], zOrder: flaggedPair![1] } })
    const wantF = scheduleCheck(3, flaggedPair![0], flaggedPair![1])
    expect(texts(f)).toContain('clash-free')
    expect(texts(f)).toContain(`${wantF.violations.length} flagged pairs`)
  })
})

describe('code B1: the planar code is the engine’s', () => {
  it('has d² + (d−1)² data qubits and d(d−1) checks of each kind, each check on its engine support, one step from every qubit it touches', () => {
    for (const d of [3, 5, 7]) {
      const p = planarSurfaceCode(d)
      const r = R({ planar: { d } })
      expect([r.n, r.k, r.checks.length]).toEqual([d * d + (d - 1) * (d - 1), 1, 2 * d * (d - 1)])
      r.checks.slice(0, d * (d - 1)).forEach((c, i) => expect(c.support, `X${i}`).toEqual(p.code.HX.rowSupport(i)))
      r.checks.slice(d * (d - 1)).forEach((c, i) => expect(c.support, `Z${i}`).toEqual(p.code.HZ.rowSupport(i)))
      for (const c of r.checks) {
        expect(c.support.length === 4 || c.support.length === 3).toBe(true)
        for (const q of c.support) expect(Math.hypot(r.qubits[q].x - c.x, r.qubits[q].y - c.y), `${c.label} ${q}`).toBeCloseTo(0.5, 9)
      }
      expect(r.surface!.counts.weights).toEqual({ 4: 2 * (d - 1) * (d - 2), 3: 2 * (d - 1) * 2 })
    }
  })
  it('xbar / zbar light no check, are not products of checks, and meet in one qubit; a fault’s lit checks equal the stabilizer syndrome', () => {
    for (const d of [3, 5]) {
      const r = R({ planar: { d }, operator: 'xbar', operator2: 'zbar' })
      expect(r.surface!.operator).toMatchObject({ type: 'X', weight: d, lit: [], classification: 'logical operator' })
      expect(r.surface!.operator2).toMatchObject({ type: 'Z', weight: d, lit: [], classification: 'logical operator' })
      expect(r.surface!.overlap).toHaveLength(1)
      const p = planarSurfaceCode(d)
      for (const type of ['X', 'Z', 'Y'] as const) {
        const fr = R({ planar: { d }, fault: { type, qubits: [0, 4] }, show: ['syndrome'] })
        const letters = Array.from({ length: p.n }, (_, q) => ([0, 4].includes(q) ? type : 'I'))
        expect(syndromeLabels(fr, p.code, letters, fr.checks.map((_, i) => i)), `${d} ${type}`).toEqual(lit(fr))
      }
    }
  })
})

describe('code B1: the Tanner-graph layout of the small sources', () => {
  it('draws a 3 × 3 torus, a 3 × 4 torus (24 qubits, the limit), a rotated d = 3 and 5 and a planar d = 3 with an edge to each qubit a check acts on', () => {
    for (const st of [{ toric: { L: 3 } }, { toric: { L: 3, M: 4 } }, { rotated: { d: 3 } }, { rotated: { d: 5 } }, { planar: { d: 3 } }] as const) {
      const r = R({ ...st, view: 'layout' })
      expect(r.view).toBe('layout')
      expect(r.edges).toHaveLength(r.checks.reduce((s, c) => s + c.support.length, 0))
      for (const e of r.edges) expect(r.checks[e.check].support).toContain(e.qubit)
      expect(validateStage(C({ ...st, view: 'layout' }))).toEqual([])
    }
    // a torus unrolls in four columns: stars | horizontal edges | vertical edges | plaquettes
    const t = R({ toric: { L: 3 }, view: 'layout' })
    expect(new Set(t.checks.filter((c) => c.kind === 'X').map((c) => c.x))).toEqual(new Set([0]))
    expect(new Set(t.checks.filter((c) => c.kind === 'Z').map((c) => c.x))).toEqual(new Set([7.5]))
  })
  it('lights, letters and operators carry through the layout', () => {
    const r = R({ toric: { L: 3 }, view: 'layout', fault: { type: 'Z', qubits: [0] }, operator: 'z-loop-h', operator2: 'x-cut-v', at: 1, show: ['syndrome', 'logical'] })
    expect(lit(r)).toEqual(['X1', 'X2'])
    const html = draw(r, 'stage', 506, 785)
    expect(html.match(/data-lit="1"/g)).toHaveLength(2)
    expect(html).toContain('data-anchor="operator"')
    expect(html).toContain('fault Z')
  })
  it('rejects a source that is too big for the layout, and points to the other view', () => {
    expect(bad({ toric: { L: 4 }, view: 'layout' })[0]).toMatch(/^code view: this toric source has 32 qubits and 32 checks; the layout draws at most 25 qubits and 24 checks \(use the 'torus' view\)/)
    expect(bad({ rotated: { d: 7 }, view: 'layout' })[0]).toMatch(/use the 'patch' view/)
    expect(bad({ planar: { d: 5 }, view: 'layout' })[0]).toMatch(/41 qubits and 40 checks/)
  })
})

describe('code B1: validation — every limit, with a message that names the field', () => {
  it('sizes: a torus 2–8 (≤ 128 qubits), a rotated patch odd 3–9, a planar patch odd 3–7', () => {
    expect(bad({ toric: { L: 8, M: 8 } })).toEqual([])
    expect(bad({ toric: { L: 1 } })[0]).toMatch(/^code toric: \{ L, M\? \} whole numbers from 2 to 8/)
    expect(bad({ toric: { L: 9 } })[0]).toMatch(/^code toric/)
    expect(bad({ toric: { L: 3, M: 2.5 } })[0]).toMatch(/^code toric/)
    expect(bad({ toric: { L: 3, M: 9 } })[0]).toMatch(/^code toric/)
    expect(bad({ rotated: { d: 9 } })).toEqual([])
    expect(bad({ rotated: { d: 4 } })[0]).toMatch(/^code rotated: \{ d \} an odd whole number from 3 to 9/)
    expect(bad({ rotated: { d: 11 } })[0]).toMatch(/^code rotated/)
    expect(bad({ planar: { d: 7 } })).toEqual([])
    expect(bad({ planar: { d: 9 } })[0]).toMatch(/^code planar: \{ d \} an odd whole number from 3 to 7/)
    expect(bad({ planar: { d: 2 } })[0]).toMatch(/^code planar/)
    expect(SURFACE_LIMITS).toMatchObject({ torusMax: 8, torusQubits: 128, rotatedMax: 9, planarMax: 7, faultQubits: 24 })
  })
  it('views: a toric source is a torus or a layout, a patch is a patch or a layout, a registry code is neither', () => {
    expect(bad({ toric: { L: 3 }, view: 'patch' })).toEqual(["code view: a toric source is drawn as 'layout' or 'torus', not 'patch'"])
    expect(bad({ rotated: { d: 3 }, view: 'torus' })).toEqual(["code view: a rotated source is drawn as 'layout' or 'patch', not 'torus'"])
    expect(bad({ toric: { L: 3 }, view: 'checks' })[0]).toMatch(/^code view: a toric source is drawn as/)
    expect(bad({ code: 'steane7', view: 'torus' })).toEqual(["code view: 'torus' draws a toric source, not the registry code steane7"])
    expect(bad({ code: 'steane7', view: 'patch' })[0]).toMatch(/^code view: 'patch' draws a rotated or planar source/)
  })
  it('the fault: a type, 1–24 distinct qubits inside the code', () => {
    expect(bad({ toric: { L: 3 }, fault: { type: 'Z', qubits: [0, 17] } })).toEqual([])
    expect(bad({ toric: { L: 3 }, fault: { type: 'Q' as never, qubits: [0] } })).toEqual(["code fault.type: 'X', 'Y' or 'Z'"])
    expect(bad({ toric: { L: 3 }, fault: { type: 'Z', qubits: [] } })[0]).toMatch(/^code fault\.qubits: one to 24 qubit numbers/)
    expect(bad({ toric: { L: 3 }, fault: { type: 'Z', qubits: Array.from({ length: 25 }, (_, i) => i % 18) } })[0]).toMatch(/^code fault\.qubits: one to 24/)
    expect(bad({ toric: { L: 3 }, fault: { type: 'Z', qubits: [18] } })).toEqual(["code fault.qubits: qubit numbers from 0 to 17 (the engine's, counted from 0)"])
    expect(bad({ toric: { L: 3 }, fault: { type: 'Z', qubits: [-1] } })[0]).toMatch(/^code fault\.qubits/)
    expect(bad({ toric: { L: 3 }, fault: { type: 'Z', qubits: [2, 2] } })).toEqual(['code fault.qubits: each qubit once'])
    expect(bad({ code: 'steane7', fault: { type: 'Z', qubits: [0] } })[0]).toMatch(/^code fault: only the toric, rotated and planar sources take it/)
  })
  it('the operators: names by source, `at` in range, operator2 needs operator', () => {
    expect(bad({ toric: { L: 4, M: 3 }, operator: 'z-loop-h', at: 2 })).toEqual([])
    expect(bad({ toric: { L: 4, M: 3 }, operator: 'z-loop-h', at: 3 })).toEqual(["code at: a whole number from 0 to 2 for 'z-loop-h'"])
    expect(bad({ toric: { L: 4, M: 3 }, operator: 'z-loop-v', at: 3 })).toEqual([])
    expect(bad({ toric: { L: 4, M: 3 }, operator: 'z-loop-v', at: 4 })[0]).toMatch(/^code at: a whole number from 0 to 3 for 'z-loop-v'/)
    expect(bad({ toric: { L: 4, M: 3 }, operator: 'plaquette', at: 3 })[0]).toMatch(/for 'plaquette'/)
    expect(bad({ toric: { L: 4 }, operator: 'z-loop-h', at: 1.5 })[0]).toMatch(/^code at/)
    expect(bad({ toric: { L: 4 }, operator: 'xbar' })[0]).toMatch(/^code operator: a toric source draws 'z-loop-h', 'z-loop-v', 'x-cut-h', 'x-cut-v', 'plaquette'/)
    expect(bad({ rotated: { d: 3 }, operator: 'z-loop-h' })[0]).toMatch(/^code operator: a rotated source draws 'xbar', 'zbar'/)
    expect(bad({ rotated: { d: 3 }, operator: 'xbar', operator2: 'nope' as never })[0]).toMatch(/^code operator2/)
    expect(bad({ toric: { L: 3 }, operator2: 'z-loop-h' })).toEqual(['code operator2: needs `operator`'])
    expect(bad({ rotated: { d: 3 }, operator: 'xbar', at: 1 })).toEqual(['code at: only a toric operator takes `at` (the row, column or plaquette)'])
    expect(bad({ toric: { L: 3 }, at: 1 })).toEqual(['code at: needs an `operator`'])
    expect(bad({ code: 'steane7', operator: 'xbar' as never })[0]).toMatch(/^code operator: only the toric/)
  })
  it('show: names, syndrome needs a fault, logical needs an operator, stars / plaquettes are toric and not both, no correction on a new source', () => {
    expect(bad({ toric: { L: 3 }, show: ['stars', 'weights'] })).toEqual([])
    expect(bad({ toric: { L: 3 }, show: ['syndrome'] })).toEqual(["code show: 'syndrome' needs a `fault`"])
    expect(bad({ toric: { L: 3 }, show: ['logical'] })).toEqual(["code show: 'logical' draws the `operator`; give one"])
    expect(bad({ rotated: { d: 3 }, show: ['stars'] })).toEqual(["code show: 'stars' and 'plaquettes' highlight a toric code's checks"])
    expect(bad({ toric: { L: 3 }, show: ['stars', 'plaquettes'] })).toEqual(["code show: 'stars' or 'plaquettes', not both"])
    expect(bad({ toric: { L: 3 }, show: ['correction'] })[0]).toMatch(/^code show: 'correction' is for a registry code/)
    expect(bad({ toric: { L: 3 }, show: ['syndrome', 'syndrome'] }).join(' ')).toContain('each name once')
    expect(bad({ toric: { L: 3 }, show: ['x' as never] })[0]).toMatch(/^code show: a list of 'syndrome'/)
    expect(bad({ code: 'steane7', show: ['weights'] })).toEqual(["code show: 'weights' is for the toric, rotated and planar sources"])
  })
  it('the registry codes’ fields are refused on a new source', () => {
    expect(bad({ toric: { L: 3 }, error: 'X1' })[0]).toMatch(/^code error: only a registry code takes it/)
    expect(bad({ rotated: { d: 3 }, focus: 1 })[0]).toMatch(/^code focus: only a registry code takes it/)
    expect(bad({ planar: { d: 3 }, shift: [1, 0] })[0]).toMatch(/^code shift: only a registry code takes it/)
    expect(bad({ planar: { d: 3 }, word: 0 })[0]).toMatch(/^code word/)
  })
  it('schedule: a rotated patch in the patch view, two orders of the four corners', () => {
    const ok: [CodeCorner[], CodeCorner[]] = [['TL', 'TR', 'BL', 'BR'], ['TL', 'BL', 'TR', 'BR']]
    expect(bad({ rotated: { d: 3 }, schedule: { xOrder: ok[0], zOrder: ok[1] } })).toEqual([])
    expect(bad({ planar: { d: 3 }, schedule: { xOrder: ok[0], zOrder: ok[1] } })[0]).toMatch(/^code schedule: only a rotated patch has check circuits to order/)
    expect(bad({ toric: { L: 3 }, schedule: { xOrder: ok[0], zOrder: ok[1] } })[0]).toMatch(/^code schedule: only a rotated patch/)
    expect(bad({ rotated: { d: 3 }, view: 'layout', schedule: { xOrder: ok[0], zOrder: ok[1] } })).toEqual(["code schedule: drawn in the 'patch' view"])
    expect(bad({ rotated: { d: 3 }, schedule: { xOrder: ['TL', 'TL', 'BL', 'BR'], zOrder: ok[1] } })).toEqual(['code schedule.xOrder: the four corners TL, TR, BL, BR once each'])
    expect(bad({ rotated: { d: 3 }, schedule: { xOrder: ok[0], zOrder: ['TL', 'TR', 'BL'] as never } })).toEqual(['code schedule.zOrder: the four corners TL, TR, BL, BR once each'])
    expect(bad({ code: 'steane7', schedule: { xOrder: ok[0], zOrder: ok[1] } })[0]).toMatch(/^code schedule: only the toric/)
  })
})

describe('code B1: readouts', () => {
  it('are short lines that name the code, the checks, the fault and its syndrome, the operator and its overlap', () => {
    const r = R({ toric: { L: 3 }, fault: { type: 'Z', qubits: [0] }, operator: 'z-loop-h', operator2: 'x-cut-v', show: ['syndrome', 'logical'] })
    expect(texts(r)).toEqual([
      'n = 18 · k = 2',
      '9 stars · 9 plaquettes',
      'fault: Z on 1 qubit',
      'X1, X2 read −1',
      'Z operator · weight 3',
      'lights no check',
      'logical operator',
      'X operator · weight 3',
      'lights no check',
      'logical operator',
      'overlap 1: anticommute',
    ])
    for (const t of texts(r)) expect(t.length, t).toBeLessThanOrEqual(24)
    expect(texts(R({ rotated: { d: 5 } }))).toEqual(['n = 25 · k = 1 · d = 5', '24 checks: 16×4, 8×2'])
    expect(texts(R({ planar: { d: 3 } }))[1]).toBe('12 checks: 4×4, 8×3')
    expect(texts(R({ rotated: { d: 3 }, fault: { type: 'X', qubits: [4] }, show: ['syndrome'] }))).toContain('fault: X on 1 qubit')
  })
})

describe('code B1: the one scene', () => {
  const BOXES: [Mode, number, number, boolean, 'full' | 'top' | 'bottom'][] = [
    ['stage', 506, 785, false, 'full'],
    ['stage', 375, 640, false, 'full'],
    ['stage', 700, 560, false, 'full'],
    ['stage', 506, 360, false, 'top'],
    ['stage', 320, 360, true, 'full'],
    ['print', 320, 360, false, 'full'],
  ]
  const STATES: Omit<CodeState, 'kind'>[] = [
    { toric: { L: 3 } },
    { toric: { L: 4, M: 3 }, fault: { type: 'Y', qubits: [1, 9] }, show: ['syndrome', 'weights'] },
    { toric: { L: 8 }, operator: 'z-loop-h', operator2: 'x-cut-v', at: 3, show: ['logical'] },
    { toric: { L: 5, M: 4 }, show: ['stars'] },
    { toric: { L: 2 } },
    { toric: { L: 3 }, view: 'layout', fault: { type: 'Z', qubits: [0] }, operator: 'x-cut-h', show: ['syndrome', 'logical'] },
    { rotated: { d: 3 } },
    { rotated: { d: 5 }, fault: { type: 'X', qubits: [7, 12] }, show: ['syndrome', 'weights'] },
    { rotated: { d: 9 }, operator: 'xbar', operator2: 'zbar', show: ['logical'] },
    { rotated: { d: 7 }, schedule: { xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['BR', 'BL', 'TR', 'TL'] } },
    { rotated: { d: 3 }, schedule: { xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['TL', 'TR', 'BL', 'BR'] } },
    { rotated: { d: 5 }, view: 'layout', fault: { type: 'Z', qubits: [6] }, show: ['syndrome'] },
    { planar: { d: 3 } },
    { planar: { d: 7 }, fault: { type: 'Z', qubits: [3, 30] }, operator: 'xbar', show: ['syndrome', 'logical', 'weights'] },
    { planar: { d: 3 }, view: 'layout', operator: 'zbar' },
  ]
  it('names every qubit and check, draws no NaN, and draws one lit mark per check that reads −1, in every box and mode', () => {
    for (const st of STATES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${JSON.stringify(st)} ${mode} ${w}x${h} ${slot}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-kind="code"')
        expect(html.match(/aria-label="[^"]*(edge qubit|data qubit)[^"]*"/g)?.length, `${where}: qubits`).toBe(r.n)
        expect(html.match(/data-check="/g)?.length, `${where}: checks`).toBe(r.checks.length)
        expect(html.match(/data-lit="1"/g)?.length ?? 0, `${where}: lit`).toBe(r.checks.filter((c) => c.flipped === 1).length)
        expect(html).toContain('data-anchor="qubit"')
        expect(html).toContain('data-anchor="check"')
        if (r.view === 'torus') expect(html.match(/<title>edge qubit \d+: (this edge runs on|the edge comes in)/g)?.length, where).toBe(r.surface!.wraps.length)
        if (r.surface!.operator) expect(html).toContain('data-anchor="operator"')
        if (r.surface!.fault) expect(html).toContain('data-anchor="fault"')
        if (r.surface!.schedule) expect(html.match(/data-check-steps="/g)?.length, `${where}: spokes`).toBe(r.checks.length)
        if (r.surface!.schedule?.violations.length) expect(html).toContain('data-anchor="flagged"')
        if (r.surface!.weights) expect(html).toMatch(/>(2|3|4)<\/text>/)
      }
  })
  it('a star / plaquette highlight dims the other family; a lit check has its ring; the schedule’s flagged faces are outlined', () => {
    const dim = draw(R({ toric: { L: 3 }, show: ['stars'] }), 'stage', 506, 785)
    expect(dim.match(/opacity="0.22"/g)).toHaveLength(9)
    const none = draw(R({ toric: { L: 3 } }), 'stage', 506, 785)
    expect(none).not.toContain('opacity="0.22"')
    const flagged = R({ rotated: { d: 3 }, schedule: { xOrder: ['TL', 'TR', 'BL', 'BR'], zOrder: ['BR', 'BL', 'TR', 'TL'] } })
    const html = draw(flagged, 'stage', 506, 785)
    expect(html.match(/data-flagged="1"/g)?.length ?? 0).toBe(flagged.checks.filter((c) => c.flagged).length)
  })
  it('packing: every qubit and check sits inside the box and clear of the others; the figure’s text lines stay above; the legend is below everything', () => {
    for (const st of STATES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const g = codeGeometry(r, w, h, mode === 'print' || bare, slot)
        const where = `${JSON.stringify(st)} ${mode} ${w}x${h} ${slot}`
        const checksDrawn = r.view !== 'patch' || r.surface!.source === 'planar'
        const marks = [
          ...r.qubits.map((q) => ({ ...g.at(q.x, q.y), r: g.disc, what: `qubit ${q.index}` })),
          ...(checksDrawn ? r.checks.map((c) => ({ ...g.at(c.x, c.y), r: g.sq, what: `check ${c.label}` })) : []),
        ]
        for (const m of marks) {
          expect(m.x - m.r, `${where} ${m.what} left`).toBeGreaterThanOrEqual(0)
          expect(m.x + m.r, `${where} ${m.what} right`).toBeLessThanOrEqual(w)
          expect(m.y - m.r, `${where} ${m.what} top`).toBeGreaterThanOrEqual(g.area.y - 1)
          expect(m.y + m.r, `${where} ${m.what} bottom`).toBeLessThanOrEqual(g.area.y + g.area.h - 14)
        }
        let minGap = Infinity
        for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) minGap = Math.min(minGap, Math.hypot(marks[i].x - marks[j].x, marks[i].y - marks[j].y) - marks[i].r - marks[j].r)
        expect(minGap, `${where}: two marks touch`).toBeGreaterThan(0.5)
        if (g.lines.length) expect(6 + 13 * g.lines.length, where).toBeLessThanOrEqual(g.area.y + 1)
        expect(g.area.y + g.area.h, where).toBeLessThanOrEqual(h)
      }
  })
  it('the wrap arrows stay inside the box', () => {
    for (const L of [2, 3, 5, 8])
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R({ toric: { L, M: Math.min(8, L + 1) } })
        const g = codeGeometry(r, w, h, mode === 'print' || bare, slot)
        const len = wrapLength(g.unit, g.disc)
        for (const wr of r.surface!.wraps) {
          const p = g.at(wr.x, wr.y)
          const reach = g.disc + 2 + len
          const x = wr.dir === 'E' ? (wr.end === 'out' ? p.x + reach : p.x - len) : p.x
          const y = wr.dir === 'N' ? (wr.end === 'out' ? p.y - reach : p.y + len) : p.y
          expect(x, `L=${L} ${mode} ${w}x${h} x`).toBeGreaterThanOrEqual(0)
          expect(x, `L=${L} ${mode} ${w}x${h} x`).toBeLessThanOrEqual(w)
          expect(y, `L=${L} ${mode} ${w}x${h} y`).toBeGreaterThanOrEqual(g.area.y - 1)
          expect(y, `L=${L} ${mode} ${w}x${h} y`).toBeLessThanOrEqual(g.area.y + g.area.h)
        }
      }
  })
})

describe('code B1: the print figure', () => {
  it('is the same scene in print ink, numbered, titled with the passport, with the readouts as its own lines', () => {
    const html = renderToString(<FigureFor layout={C({ toric: { L: 3 }, fault: { type: 'Z', qubits: [0] }, show: ['syndrome'], shot: 'CD-CODE' })} number="B1.3" caption="a flip" />)
    expect(html).toContain('<title>Fig. B1.3: CODE · qubits and checks</title>')
    expect(html).toContain('viewBox="0 0 320 360"')
    expect(html).toContain('svgk-print')
    expect(html).toContain('toric code 3 × 3')
    expect(html).toContain('X1, X2 read −1')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
  it('draws every source and view as a figure', () => {
    for (const st of [{ toric: { L: 4 } }, { toric: { L: 3 }, view: 'layout' }, { rotated: { d: 5 } }, { planar: { d: 5 } }, { rotated: { d: 3 }, view: 'layout' }] as const)
      expect(renderToString(<FigureFor layout={C(st)} number="B1.4" />), JSON.stringify(st)).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
})
