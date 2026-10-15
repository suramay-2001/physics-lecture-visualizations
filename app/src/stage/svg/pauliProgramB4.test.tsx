/**
 * `pauli-program`, chapter B4's two modes. `compile`: a preset circuit with its first `upTo` gates slid to the end by physics/qec/pbc.ts (rotations collected with their current axes, a divider,
 * then the gates not yet passed); `branch`: planned axes against the executed ones (physics/qec/inject.ts). The picture draws engine values only: here the readouts, the columns, the validation
 * messages, the interpolation of the cursor and the one scene (no NaN, every column named) are checked.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { PauliProgramState } from '../../content/stage'
import { PBC_PRESETS } from '../../physics/qec/pbc'
import { interpolate } from '../interp'
import { resolve } from '../resolve'
import type { ResolvedPauliProgram } from '../types'
import { PauliProgramScene, columnTag } from './PauliProgramScene'
import { columnName, pauliProgramReadouts, validatePauliProgramStage } from './pauliProgram'
import './kinds'

const S = (st: Omit<PauliProgramState, 'kind'>): PauliProgramState => ({ kind: 'pauli-program', ...st })
const R = (st: Omit<PauliProgramState, 'kind'>) => resolve(S(st), 1) as ResolvedPauliProgram
const texts = (r: ResolvedPauliProgram) => pauliProgramReadouts(r).map((x) => x.text)
const bad = (st: Omit<PauliProgramState, 'kind'>) => validatePauliProgramStage(S(st))
const draw = (r: ResolvedPauliProgram, mode: 'stage' | 'print', w = 360, h = 330) =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <PauliProgramScene state={r} mode={mode} width={w} height={h} bare={false} slot="full" />
    </svg>,
  )

describe('compile mode', () => {
  it('the textbook Toffoli: 15 gates, 7 T-like rotations, one layer, final Clifford identity', () => {
    const r = R({ compile: { preset: 'toffoli-textbook', upTo: 15 } })
    expect(r.mode).toBe('compile')
    expect(r.columns).toHaveLength(7)
    expect(r.divider).toBeNull()
    expect(texts(r)).toEqual(['7 rotations', 'T-count 7', 'layers 1', 'final Clifford: identity', '5 axes changed'])
    expect(r.columns.every((c) => c.type === 'rot' && c.tLike)).toBe(true)
  })
  it('half way: the collected rotations, a divider, the gates not yet passed', () => {
    const r = R({ compile: { preset: 'toffoli-textbook', upTo: 5 } })
    expect(r.divider).toBe(2)
    expect(r.columns.filter((c) => c.type === 'gate').length).toBeGreaterThan(0)
    expect(texts(r)[0]).toBe('2 of 7 rotations placed')
    expect(texts(r).some((t) => t.startsWith('pending Clifford'))).toBe(true)
  })
  it('nothing slid yet: the written circuit, no divider', () => {
    const r = R({ compile: { preset: 'toffoli-textbook', upTo: 0 } })
    expect(r.columns).toHaveLength(15)
    expect(r.divider).toBeNull()
    expect(r.columns.filter((c) => c.type === 'gate')).toHaveLength(8)
  })
  it('the phase form: H, seven rotations, H; four axes change and the final Clifford is the identity', () => {
    const r = R({ compile: { preset: 'toffoli-phase', upTo: 9 } })
    expect(texts(r)).toEqual(['7 rotations', 'T-count 7', 'layers 1', 'final Clifford: identity', '4 axes changed'])
    expect(r.columns.map((c) => c.letters.join('')).sort()).toEqual(['IIX', 'IZI', 'IZX', 'ZII', 'ZIX', 'ZZI', 'ZZX'])
  })
  it('CNOT as three Clifford turns reads out CNOT as the final Clifford', () => {
    const r = R({ compile: { preset: 'cnot', upTo: 3 } })
    expect(texts(r)).toEqual(['3 Clifford turns', 'T-count 0', 'final Clifford: CNOT'])
  })
  it('a Clifford turn about Z before an X rotation: the rotation ends on Y (X → −Y in the paper convention)', () => {
    const r = R({ compile: { preset: 'z-then-x', upTo: 2 } })
    expect(r.columns).toHaveLength(1)
    expect(r.columns[0].letters).toEqual(['Y'])
    expect(r.columns[0].turn).toBe('+π/4')
  })
  it('every column has an accessible name and the scene draws with no NaN, live and in print', () => {
    for (const preset of ['toffoli-textbook', 'toffoli-phase', 'cnot', 'z-then-x'] as const)
      for (const upTo of [0, 1, PBC_PRESETS[preset].gates.length]) {
        const r = R({ compile: { preset, upTo } })
        for (const c of r.columns) expect(columnName(r, c)).toMatch(/^column \d+:/)
        for (const mode of ['stage', 'print'] as const) {
          const svg = draw(r, mode)
          expect(svg).not.toMatch(/NaN|undefined/)
          expect(svg).toContain('data-kind="pauli-program"')
        }
      }
  })
  it('the cursor moves in whole steps and any other change switches half way', () => {
    const a = R({ compile: { preset: 'toffoli-textbook', upTo: 0 } })
    const b = R({ compile: { preset: 'toffoli-textbook', upTo: 10 } })
    const mid = interpolate(a, b, 0.5) as ResolvedPauliProgram
    expect(mid.inputs.compile?.upTo).toBe(5)
    const c = R({ compile: { preset: 'cnot', upTo: 3 } })
    expect((interpolate(a, c, 0.2) as ResolvedPauliProgram).inputs.compile?.preset).toBe('toffoli-textbook')
    expect((interpolate(a, c, 0.8) as ResolvedPauliProgram).inputs.compile?.preset).toBe('cnot')
  })
  it('validation names the field', () => {
    expect(bad({ compile: { preset: 'nope' as never, upTo: 0 } })[0]).toMatch(/^pauli-program compile\.preset/)
    expect(bad({ compile: { preset: 'cnot', upTo: 4 } })[0]).toMatch(/^pauli-program compile\.upTo: a whole number 0–3/)
    expect(bad({ compile: { preset: 'cnot', upTo: 1.5 } })[0]).toMatch(/^pauli-program compile\.upTo/)
    expect(bad({ compile: { preset: 'cnot', upTo: 1 }, upTo: 1 })[0]).toMatch(/^pauli-program upTo/)
    expect(bad({ compile: { preset: 'cnot', upTo: 1, extra: 1 } as never })[0]).toMatch(/compile\.extra: unknown field/)
  })
})

describe('branch mode', () => {
  it('planned Z then X; an odd first reading runs the second turn about −Y', () => {
    const r = R({ branch: { axes: ['Z', 'X'], outcomes: [1, 0] } })
    expect(r.mode).toBe('branch')
    expect(r.columns.map((c) => c.executed)).toEqual(['Z', '−Y'])
    expect(columnTag(r.columns[1])).toBe('X→−Y')
    expect(texts(r)).toEqual(['2 injections', 'run about Z −Y', '1 axis changed', 'pending Clifford: Z(π/2)'])
  })
  it('three Z injections change nothing, whatever the readings', () => {
    const r = R({ branch: { axes: ['Z', 'Z', 'Z'], outcomes: [1, 1, 1] } })
    expect(texts(r)[2]).toBe('no axis changed')
    expect(r.hasLane).toBe(true)
  })
  it('draws without NaN and names every column', () => {
    const r = R({ branch: { axes: ['Z', 'X', 'Z', 'X'], outcomes: [1, 0, 1, 0] } })
    for (const c of r.columns) expect(columnName(r, c)).toContain('planned about')
    expect(draw(r, 'stage')).not.toMatch(/NaN|undefined/)
    expect(draw(r, 'print')).not.toMatch(/NaN|undefined/)
  })
  it('validation: 1–6 letters X, Y, Z and one reading each', () => {
    expect(bad({ branch: { axes: [], outcomes: [] } })[0]).toMatch(/^pauli-program branch\.axes/)
    expect(bad({ branch: { axes: ['Z', 'Q'], outcomes: [0, 0] } })[0]).toMatch(/^pauli-program branch\.axes/)
    expect(bad({ branch: { axes: ['Z', 'X'], outcomes: [0] } })[0]).toMatch(/^pauli-program branch\.outcomes/)
    expect(bad({ branch: { axes: ['Z'], outcomes: [2 as never] } })[0]).toMatch(/^pauli-program branch\.outcomes/)
  })
})
