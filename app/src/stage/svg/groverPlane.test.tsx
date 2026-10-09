/**
 * `grover-plane` (709; SVG; P-Q17-story §9.2): the real plane Grover's search lives in. Content writes only inputs (n, how many strings are
 * marked, k steps, what to draw); the resolver takes every angle and chance from physics/qc/grover.ts. These tests check the resolved arrow
 * against a full simulation of the circuit and against the lecture's numbers, the sweep, the mirrors, the ghost, the arcs, the trail, Theorem 1's
 * picture proof, interpolation, every validation limit, the layout cross-check with the circuit and bars beside it, the readout text, and that
 * the one scene packs inside the box and draws with no NaN in every mode.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { AmplitudesState, CircuitStageState, GroverPlaneState } from '../../content/stage'
import { KIND_RENDER, PASSPORT, STAGE_KINDS_709, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { finalState, groverAngle, groverCircuit, groverOptimalK, groverPlane, groverSuccess } from '../../physics/qc/grover'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedGroverPlane } from '../types'
import { GROVER_PLANE_LIMITS, groverPlaneFrom, groverPlaneInputs, groverPlaneLayoutProblems, groverPlaneReadouts } from './groverPlane'
import { CircuitScene } from './CircuitScene'
import { GroverPlaneScene, groverPlaneLayout } from './GroverPlaneScene'
import './kinds'

const DEG = Math.PI / 180
const G = (x: Omit<GroverPlaneState, 'kind' | 'search'> & { search?: GroverPlaneState['search'] }): GroverPlaneState => ({ kind: 'grover-plane', search: { n: 3 }, ...x })
const R = (st: GroverPlaneState, s = 1) => resolve(st, s) as ResolvedGroverPlane
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('grover-plane: the SVG route, the passport and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with its own passport and drawer', () => {
    expect(KIND_RENDER['grover-plane']).toBe('svg')
    expect(STAGE_KINDS_709).toContain('grover-plane')
    expect(svgKindDef('grover-plane')).toBeDefined()
    expect(PASSPORT['grover-plane']).toMatchObject({ title: 'THE GROVER PLANE · a real 2-D slice of ℂᴺ', fidelityKey: 'grover-plane' })
    expect(PASSPORT['grover-plane'].note).toMatch(/^not a place · angles are state angles, not doubled/)
    expect(passportOf(G({ k: 0 }))).toBe(PASSPORT['grover-plane'])
    const f = fidelityOf('grover-plane')
    for (const list of Object.values(f)) expect(list.length).toBeGreaterThan(0)
    expect(Object.values(f).flat().map((i) => i.id).sort()).toEqual(['qc-gp-engine', 'qc-gp-not-bloch', 'qc-gp-real', 'qc-gp-shadow', 'qc-gp-slice'])
    expect(SHOTS['grover-plane']).toEqual(['G-PLANE'])
    expect(ANCHORS['grover-plane']).toEqual(['marked-axis', 'rest-axis', 'arrow', 'shadow', 'circle', 'mirror-x0perp', 'mirror-w0', 'arc-alpha', 'arc-step', 'trail', 'ghost', 'proof'])
    expect(svgKindDef('grover-plane')!.print).toEqual({ w: 320, h: 300 })
  })
})

describe('grover-plane: the resolved arrow is the engine’s (and a full simulation’s)', () => {
  it('N = 8: α = 20.70°, the step turns 41.41°, and k = 0, 1, 2, 3 point at 20.70°, 62.11°, 103.52°, 144.93° with chances 0.125, 0.78125, 0.9453, 0.3301', () => {
    const want = [[20.7048, 0.125], [62.1144, 0.78125], [103.5241, 0.9453125], [144.9337, 0.330078125]]
    want.forEach(([deg, p], k) => {
      const r = R(G({ k }))
      close(r.alphaDeg, 20.7048110546354, 1e-9)
      close(r.stepDeg, 41.4096221092708, 1e-9)
      close(r.angleDeg, deg, 5e-4)
      close(r.success, p, 1e-12)
      expect([r.N, r.M, r.n]).toEqual([8, 1, 3])
      expect(r.k).toBe(k)
    })
  })
  it('at a whole k the arrow IS the engine’s groverPlane and equals a full simulation of the circuit: marked amplitude = sin, unmarked amplitude × √(N−M) = cos', () => {
    for (const [n, marked, k] of [[3, [5], 0], [3, [5], 2], [4, [1, 6, 11, 12], 1], [5, [7], 4], [2, [3], 1]] as const) {
      const M = marked.length
      const r = R(G({ search: { n, marked: M }, k }))
      const [co, si] = groverPlane(2 ** n, M, k)
      close(r.arrow[0], co)
      close(r.arrow[1], si)
      const sim = finalState(groverCircuit(n, marked, k))
      close(sim[marked[0]].re * Math.sqrt(M), r.arrow[1], 1e-12)
      close(sim[(marked[0] as number) === 0 ? 1 : 0].re * Math.sqrt(2 ** n - M), r.arrow[0], 1e-12)
      close(r.success, groverSuccess(2 ** n, M, k))
    }
  })
  it('N = 1024: α = 1.79°, k* = 25 reaches 91.33° and the chance 0.9995; k = 12 sits at 0.4960', () => {
    const r = R(G({ search: { n: 10 }, k: 25, readouts: ['angle', 'success', 'kopt'] }))
    close(r.alphaDeg, 1.7908, 1e-3)
    close(r.angleDeg, 91.33, 0.05)
    expect(r.kopt.k).toBe(25)
    close(r.success, r.kopt.success, 1e-12)
    expect(r.success).toBeGreaterThan(0.99946)
    close(R(G({ search: { n: 10 }, k: 12 })).success, 0.4960, 5e-5)
  })
  it('N = 4 is one exact step (α = 30°, 3α = 90°); N = 16 with 4 marked is the same angle', () => {
    close(R(G({ search: { n: 2 }, k: 1 })).angleDeg, 90, 1e-9)
    close(R(G({ search: { n: 2 }, k: 1 })).success, 1)
    const m4 = R(G({ search: { n: 4, marked: 4 }, k: 1 }))
    close(m4.alphaDeg, 30, 1e-9)
    close(m4.success, 1)
    expect(m4.M).toBe(4)
  })
  it('k* is the engine’s closest-integer rule, with the angle and the chance at it', () => {
    for (const [n, marked] of [[3, 1], [4, 1], [4, 4], [6, 3], [10, 1]] as const) {
      const r = R(G({ search: { n, marked }, k: 0 }))
      expect(r.kopt.k).toBe(groverOptimalK(2 ** n, marked))
      close(r.kopt.angleDeg, (2 * r.kopt.k + 1) * groverAngle(2 ** n, marked) / DEG, 1e-9)
      close(r.kopt.success, groverSuccess(2 ** n, marked, r.kopt.k))
    }
  })
  it('a sweep resolves at each hold progress: whole steps give true Grover states, in-between the arrow is the same rotation part-way', () => {
    const st = G({ k: { from: 0, to: 4 } })
    close(R(st, 0).k, 0)
    close(R(st, 1).k, 4)
    close(R(st, 0.25).k, 1)
    close(R(st, 0.25).success, 0.78125)
    const half = R(st, 0.125)
    close(half.k, 0.5)
    close(half.angleDeg, 2 * 20.7048110546354, 1e-9)
    close(half.arrow[0] ** 2 + half.arrow[1] ** 2, 1)
    expect(groverPlaneInputs(st, 0.5).k).toBe(2)
  })
})

describe('grover-plane: the fields', () => {
  it('half: "oracle" gives the ghost, the arrow mirrored in the horizontal axis; without it there is none', () => {
    const r = R(G({ k: 2, half: 'oracle' }))
    expect(r.ghost).toEqual([r.arrow[0], -r.arrow[1]])
    expect(R(G({ k: 2 })).ghost).toBeNull()
  })
  it('mirrors: the horizontal axis (0°) and the line through |w₀⟩ at α, in the order asked', () => {
    const r = R(G({ k: 1, mirrors: ['w0', 'x0perp'] }))
    expect(r.mirrors.map((m) => m.name)).toEqual(['w0', 'x0perp'])
    close(r.mirrors[0].angleDeg, 20.7048110546354, 1e-9)
    expect(r.mirrors[1].angleDeg).toBe(0)
    expect(R(G({ k: 1 })).mirrors).toEqual([])
  })
  it('trail: the earlier arrows at (2j+1)α for j = 0 … k−1, empty at k = 0 and without the flag', () => {
    const r = R(G({ k: 3, trail: true }))
    expect(r.trail).toHaveLength(3)
    r.trail.forEach((a, j) => close(a, (2 * j + 1) * 20.7048110546354, 1e-9))
    expect(R(G({ k: 0, trail: true })).trail).toEqual([])
    expect(R(G({ k: 3 })).trail).toEqual([])
    expect(R(G({ k: { from: 0, to: 3 }, trail: true }), 0.5).trail).toHaveLength(2) // k = 1.5: arrows of steps 0 and 1 are behind the arrow
  })
  it('arcs are passed through; Theorem 1’s proof is v₁ on the horizontal (0° → 0° → 2α) or v₂ on |w₀⟩’s line (α → −α → 3α)', () => {
    expect(R(G({ k: 1, arcs: ['alpha', 'step'] })).arcs).toEqual(['alpha', 'step'])
    const v1 = R(G({ k: 0, proof: 'v1', mirrors: ['x0perp', 'w0'] })).proof!
    expect(v1.which).toBe('v1')
    close(v1.startDeg, 0)
    close(v1.firstDeg, 0)
    close(v1.secondDeg, 41.4096221092708, 1e-9)
    const v2 = R(G({ k: 0, proof: 'v2' })).proof!
    close(v2.startDeg, 20.7048110546354, 1e-9)
    close(v2.firstDeg, -20.7048110546354, 1e-9)
    close(v2.secondDeg, 3 * 20.7048110546354, 1e-9)
    // the second image is the start turned by 2α in both pictures
    close(v1.secondDeg - v1.startDeg, 41.4096221092708, 1e-9)
    close(v2.secondDeg - v2.startDeg, 41.4096221092708, 1e-9)
    expect(R(G({ k: 0 })).proof).toBeNull()
  })
})

describe('grover-plane: interpolation and readouts', () => {
  it('the same search lerps k (the arrow turns 2α per step); a different search switches at the half-way point; every output is recomputed', () => {
    const a = R(G({ k: 0 }))
    const b = R(G({ k: 2, readouts: ['success'], arcs: ['step'] }))
    const m = interpolate(a, b, 0.5) as ResolvedGroverPlane
    expect(m.k).toBe(1)
    close(m.success, 0.78125)
    expect(m.readouts).toEqual(['success'])
    expect((interpolate(a, b, 0.25) as ResolvedGroverPlane).readouts).toEqual([])
    expect((interpolate(a, b, 0.25) as ResolvedGroverPlane).k).toBe(0.5)
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    const c = R(G({ search: { n: 10 }, k: 25 }))
    const sw = interpolate(a, c, 0.4) as ResolvedGroverPlane
    expect([sw.n, sw.k]).toEqual([3, 0])
    expect([(interpolate(a, c, 0.6) as ResolvedGroverPlane).n, (interpolate(a, c, 0.6) as ResolvedGroverPlane).k]).toEqual([10, 25])
    // the in-between arrow stays on the unit circle
    for (const t of [0.1, 0.3, 0.7, 0.9]) {
      const f = interpolate(a, b, t) as ResolvedGroverPlane
      close(f.arrow[0] ** 2 + f.arrow[1] ** 2, 1)
    }
  })
  it('the readouts: the search and α always, then the steps, then the angle, chance and k* as asked, with a typographic minus-free format', () => {
    const r = R(G({ k: 2, readouts: ['angle', 'success', 'kopt'] }))
    expect(groverPlaneReadouts(r).map((x) => x.name)).toEqual(['search', 'alpha', 'steps', 'angle', 'success', 'kopt'])
    expect(groverPlaneReadouts(r).map((x) => x.text)).toEqual(['8 strings', 'α = 20.7°', 'k = 2', '(2k+1)α = 103.5°', 'chance = 0.9453', 'k* = 2, chance 0.9453'])
    expect(groverPlaneReadouts(R(G({ search: { n: 4, marked: 4 }, k: 1 }))).map((x) => x.text)).toEqual(['16 strings, 4 marked', 'α = 30°', 'k = 1'])
    expect(groverPlaneReadouts(R(G({ k: { from: 0, to: 2 } }), 0.25))[2].text).toBe('k = 0.5')
  })
})

describe('grover-plane: validation', () => {
  const v = (x: Parameters<typeof G>[0]) => validateStage(G(x))
  it('a valid state passes at every shape the chapter uses', () => {
    expect(v({ k: 0 })).toEqual([])
    expect(v({ k: 2, trail: true, readouts: ['angle', 'success'], arcs: ['alpha', 'step'] })).toEqual([])
    expect(v({ k: { from: 0, to: 3 }, mirrors: ['x0perp', 'w0'], half: 'oracle' })).toEqual([])
    expect(v({ search: { n: 10 }, k: 25, readouts: ['kopt'], shot: 'G-PLANE' })).toEqual([])
    expect(v({ search: { n: 4, marked: 4 }, k: 1 })).toEqual([])
    expect(v({ k: 0, proof: 'v1', mirrors: ['x0perp', 'w0'] })).toEqual([])
    expect(v({ k: 0, proof: 'v2', arcs: ['alpha'] })).toEqual([])
  })
  it('limits: n, marked, k, the trail, the arcs, the proof, the lists', () => {
    expect(v({ search: { n: 0 }, k: 0 }).join()).toMatch(/search.n/)
    expect(v({ search: { n: GROVER_PLANE_LIMITS.nMax + 1 }, k: 0 }).join()).toMatch(/search.n/)
    expect(v({ search: { n: 2.5 }, k: 0 }).join()).toMatch(/search.n/)
    expect(v({ search: { n: 3, marked: 0 }, k: 0 }).join()).toMatch(/search.marked/)
    expect(v({ search: { n: 3, marked: 8 }, k: 0 }).join()).toMatch(/1 ≤ M < N = 8/)
    expect(v({ search: { n: 3, marked: 1.5 }, k: 0 }).join()).toMatch(/search.marked/)
    expect(v({ k: -1 }).join()).toMatch(/0…64/)
    expect(v({ k: 65 }).join()).toMatch(/0…64/)
    expect(v({ k: 1.5 }).join()).toMatch(/whole number/)
    expect(v({ k: { from: 0, to: 2.5 } }).join()).toMatch(/whole number/)
    expect(v({ k: Number.NaN }).join()).toMatch(/non-finite/)
    expect(v({ k: 25, trail: true }).join()).toMatch(/up to 24/)
    expect(v({ k: 24, trail: true })).toEqual([])
    expect(v({ k: 0, arcs: ['step'] }).join()).toMatch(/k ≥ 1/)
    expect(v({ k: { from: 0, to: 2 }, arcs: ['step'] })).toEqual([])
    expect(v({ k: 1, proof: 'v1' }).join()).toMatch(/needs k = 0/)
    expect(v({ k: 0, proof: 'v1', half: 'oracle' }).join()).toMatch(/not together with/)
    expect(v({ k: 0, proof: 'v3' as never }).join()).toMatch(/'v1' or 'v2'/)
    expect(v({ k: 0, half: 'diffusion' as never }).join()).toMatch(/only 'oracle'/)
    expect(v({ k: 0, mirrors: ['x0perp', 'x0perp'] }).join()).toMatch(/each once/)
    expect(v({ k: 0, mirrors: ['bogus' as never] }).join()).toMatch(/names from/)
    expect(v({ k: 0, arcs: ['bogus' as never] }).join()).toMatch(/names from/)
    expect(v({ k: 0, readouts: ['bogus' as never] }).join()).toMatch(/names from/)
    expect(v({ k: 0, readouts: ['angle', 'angle'] }).join()).toMatch(/each once/)
  })
  it('the shot is the plane’s', () => {
    expect(v({ k: 0, shot: 'K-STD' as never })[0]).toMatch(/unknown shot/)
  })
  it('a plane beside a matrix or a Bloch sphere is different kinds, so a split validates', () => {
    expect(validateLayout({ layout: 'split', top: G({ k: 0 }), bottom: { kind: 'matrix', source: { pauli: 'Z' }, shot: 'M-GRID' } })).toEqual([])
  })
})

describe('grover-plane: the layout cross-check with the circuit and bars beside it', () => {
  const circ = (n: number, marked: number[], k: number, upTo?: number): CircuitStageState => ({ kind: 'circuit', circuit: groverCircuit(n, marked, k), ...(upTo === undefined ? {} : { upTo }), shot: 'Q-WIRES' })
  const amp = (n: number, marked: number[], k: number, upTo?: number): AmplitudesState => ({ kind: 'amplitudes', state: { circuit: groverCircuit(n, marked, k), ...(upTo === undefined ? {} : { upTo }) }, mode: 'signed', shot: 'A-BARS' })
  it('the bars read the plane’s search at the plane’s moment: column 1 + 4k, or 2 + 4k after the mark (half: oracle)', () => {
    for (const k of [0, 1, 2, 3]) {
      expect(groverPlaneLayoutProblems([G({ k }), amp(3, [5], 3, 1 + 4 * k)])).toEqual([])
      expect(groverPlaneLayoutProblems([G({ k, half: 'oracle' }), amp(3, [5], 3, 2 + 4 * k)])).toEqual([])
    }
    expect(groverPlaneLayoutProblems([G({ k: 2 }), amp(3, [5], 2)])).toEqual([]) // no upTo: the end, column 9
    expect(validateLayout({ layout: 'split', top: G({ k: 2 }), bottom: amp(3, [5], 2, 9) })).toEqual([])
    expect(validateLayout({ layout: 'split', top: G({ k: 0, half: 'oracle' }), bottom: amp(3, [5], 1, 2) })).toEqual([])
  })
  it('a circuit beside the plane is held to the same rules, and a mismatch names what differs', () => {
    expect(groverPlaneLayoutProblems([G({ k: 1 }), circ(3, [5], 1, 5)])).toEqual([])
    expect(groverPlaneLayoutProblems([G({ k: 1 }), circ(3, [5], 1, 4)]).join()).toMatch(/column 5, but the circuit cursor is at 4/)
    expect(groverPlaneLayoutProblems([G({ k: 1 }), amp(4, [5], 1, 5)]).join()).toMatch(/n = 3 but the circuit has 4 wires/)
    expect(groverPlaneLayoutProblems([G({ k: 1 }), amp(3, [5, 6], 1, 5)]).join()).toMatch(/marks M = 1 but the circuit's oracle marks 2/)
    expect(validateLayout({ layout: 'split', top: G({ k: 2 }), bottom: amp(3, [5], 2, 5) }).join()).toMatch(/k = 2, which is column 9/)
  })
  it('several marked strings, a swept plane or cursor, and a circuit with no marking column are not compared', () => {
    expect(groverPlaneLayoutProblems([G({ search: { n: 4, marked: 4 }, k: 1 }), amp(4, [1, 6, 11, 12], 1, 5)])).toEqual([])
    expect(groverPlaneLayoutProblems([G({ k: { from: 0, to: 3 } }), amp(3, [5], 3, 1)])).toEqual([])
    expect(groverPlaneLayoutProblems([G({ k: 1 }), { kind: 'amplitudes', state: { circuit: groverCircuit(3, [5], 1), upTo: { from: 0, to: 5 } }, shot: 'A-BARS' }])).toEqual([])
    expect(groverPlaneLayoutProblems([G({ k: 1 }), { kind: 'amplitudes', state: { ket: '000' }, shot: 'A-BARS' }])).toEqual([])
    expect(groverPlaneLayoutProblems([circ(3, [5], 1, 5), amp(3, [5], 1, 5)])).toEqual([])
  })
})

describe('Grover’s circuit labels draw with real subscripts (CircuitScene: an oracle box’s label goes through scripted)', () => {
  it('the marking box reads U with a subscript f and the third box −U with a subscript 0; no underscore reaches the page', () => {
    const r = resolve({ kind: 'circuit', circuit: groverCircuit(3, [5], 1), upTo: 5, shot: 'Q-WIRES' }, 1)
    const html = renderToString(
      <svg viewBox="0 0 560 300">
        <CircuitScene state={r as never} mode="stage" width={560} height={300} />
      </svg>,
    )
    const plain = html.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '')
    expect(plain).toContain('Uf')
    expect(plain).toContain('−U0')
    expect(plain).not.toMatch(/_/)
    expect(html).toContain('font-size="75%"')
  })
})

describe('grover-plane: the one scene (stage, reading version, print)', () => {
  const draw = (r: ResolvedGroverPlane, mode: 'stage' | 'print', w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
    renderToString(
      <svg viewBox={`0 0 ${w} ${h}`}>
        <GroverPlaneScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
      </svg>,
    )
  it('draws the axes, the arrow, its shadow and the circle with their anchors, labels and no NaN, in every mode and at several box shapes', () => {
    const r = R(G({ k: 2, readouts: ['angle', 'success'] }))
    for (const [mode, w, h, bare, slot] of [['stage', 560, 560, false, 'full'], ['stage', 380, 560, false, 'full'], ['stage', 560, 250, false, 'top'], ['stage', 560, 440, true, 'full'], ['print', 320, 300, false, 'full']] as const) {
      const html = draw(r, mode, w, h, bare, slot)
      expect(html, `${mode} ${w}x${h}`).not.toMatch(/NaN|Infinity|undefined/)
      for (const a of ['circle', 'rest-axis', 'marked-axis', 'shadow', 'arrow']) expect(html, a).toContain(`data-anchor="${a}"`)
      expect(html).toContain('data-kind="grover-plane"')
      expect(html).toContain('|x₀⊥⟩')
      expect(html).toContain('|x₀⟩ marked')
      expect(html).toContain('k = 2')
      expect(html).toContain('shadow 0.9723')
      expect(html).not.toMatch(/_/) // no literal underscore on any label
    }
  })
  it('the arrow’s label is |w₀⟩ at k = 0 and "k = n" after n steps; a swept k reads two decimals', () => {
    expect(draw(R(G({ k: 0 })), 'stage', 560, 560)).toContain('|w₀⟩')
    expect(draw(R(G({ k: 3 })), 'stage', 560, 560)).toContain('k = 3')
    expect(draw(R(G({ k: { from: 0, to: 2 } }), 0.25), 'stage', 560, 560)).toContain('k = 0.5')
  })
  it('only what is asked for is drawn: mirrors, arcs, the trail, the ghost, the proof and the k* marker', () => {
    const none = draw(R(G({ k: 2 })), 'stage', 560, 560)
    for (const a of ['mirror-x0perp', 'mirror-w0', 'arc-alpha', 'arc-step', 'trail', 'ghost', 'proof', 'kopt']) expect(none, a).not.toContain(`data-anchor="${a}"`)
    const all = draw(R(G({ k: 2, mirrors: ['x0perp', 'w0'], arcs: ['alpha', 'step'], trail: true, half: 'oracle', readouts: ['kopt'] })), 'stage', 560, 560)
    for (const a of ['mirror-x0perp', 'mirror-w0', 'arc-alpha', 'arc-step', 'trail', 'ghost', 'kopt']) expect(all, a).toContain(`data-anchor="${a}"`)
    expect(all).toContain('after the mark')
    expect(all).toContain('α = 20.7°')
    expect(all).toContain('2α = 41.4°')
    expect(all).toContain('k = 2 = k*') // the arrow is the best arrow here, so its own label says so
    // away from the best arrow the ring is named instead
    expect(draw(R(G({ k: 1, readouts: ['kopt'] })), 'stage', 560, 560)).toContain('k* = 2')
    expect(all).not.toMatch(/NaN|Infinity|undefined/)
    // the step arc needs a step: none at k = 0
    expect(draw(R(G({ k: 0, arcs: ['alpha', 'step'] })), 'stage', 560, 560)).not.toContain('data-anchor="arc-step"')
  })
  it('Theorem 1’s picture: v₁ = R₁v₁ on the horizontal, then R₂R₁v₁ at 2α; or v₂, R₁v₂ and R₂R₁v₂', () => {
    const v1 = draw(R(G({ k: 0, proof: 'v1', mirrors: ['x0perp', 'w0'] })), 'stage', 560, 560)
    expect(v1).toContain('data-anchor="proof"')
    expect(v1).toContain('v₁ = R₁v₁')
    expect(v1).toContain('R₂R₁v₁')
    expect(v1).toContain('M₁ the mark')
    expect(v1).toContain('M₂ through |w₀⟩')
    expect(v1).toContain('2α = 41.4°')
    const v2 = draw(R(G({ k: 0, proof: 'v2', mirrors: ['x0perp', 'w0'] })), 'stage', 560, 560)
    expect(v2).toContain('R₁v₂')
    expect(v2).toContain('R₂R₁v₂')
    expect(v2).not.toMatch(/NaN|Infinity|undefined/)
  })
  it('the print figure and the reading version carry the readouts as text lines; the live stage leaves them to the overlay', () => {
    const r = R(G({ k: 2, readouts: ['success'] }))
    expect(draw(r, 'print', 320, 300)).toContain('8 strings')
    expect(draw(r, 'print', 320, 300)).toContain('chance = 0.9453')
    expect(draw(r, 'stage', 560, 440, true)).toContain('chance = 0.9453')
    expect(draw(r, 'stage', 560, 560)).not.toContain('chance = 0.9453')
  })
  it('a long register draws without NaN (N = 1024: α = 1.79°, a tiny arc and a long trail)', () => {
    const r = R(G({ search: { n: 10 }, k: 24, trail: true, arcs: ['alpha', 'step'], mirrors: ['x0perp', 'w0'], readouts: ['angle', 'success', 'kopt'] }))
    const html = draw(r, 'stage', 560, 560)
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
    expect(r.trail).toHaveLength(24)
  })
  it('the circle and its labels never leave the drawing box, in any mode and at any slot', () => {
    for (const [w, h, own, slot] of [[560, 560, false, 'full'], [380, 560, false, 'full'], [640, 420, false, 'full'], [560, 250, false, 'top'], [560, 250, false, 'bottom'], [560, 440, true, 'full'], [320, 300, true, 'full'], [320, 220, true, 'full']] as const) {
      const r = R(G({ k: 2, readouts: ['angle', 'success', 'kopt'] }))
      const L = groverPlaneLayout(r, w, h, own, slot)
      expect(L.cx - L.R - 50, `${w}x${h} ${slot} left label room`).toBeGreaterThanOrEqual(L.area.x - 1e-9)
      expect(L.cx + L.R + 92, `${w}x${h} ${slot} right label room`).toBeLessThanOrEqual(L.area.x + L.area.w + 1e-9)
      expect(L.cy - L.R - 20, `${w}x${h} ${slot} top label room`).toBeGreaterThanOrEqual(L.area.y - 1e-9)
      expect(L.cy + L.R + 14, `${w}x${h} ${slot}`).toBeLessThanOrEqual(h - (own ? 4 : slot === 'top' ? 8 : 80))
      expect(L.R).toBeGreaterThan(20)
    }
  })
  it('the print figure is the stage picture: FigureFor draws the plane scene in print ink', () => {
    const html = renderToString(<FigureFor layout={G({ k: 2, readouts: ['success'] })} number="Q17.3" caption="two steps" />)
    expect(html).toContain('print-fig-svg svgk svgk-print')
    expect(html).toContain('data-kind="grover-plane"')
    expect(html).toContain('THE GROVER PLANE')
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
  })
  it('groverPlaneFrom is pure: the same inputs give the same plane (the resolver and the interpolator share it)', () => {
    const a = R(G({ k: 2 }))
    expect(groverPlaneFrom(a.inputs)).toEqual(a)
  })
})
