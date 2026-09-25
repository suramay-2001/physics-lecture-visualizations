/**
 * Interface changes D4 + D5 (Round 3 #10): the lab statistics a scene draws (`centroid`, `sigmaBand`,
 * `sigmaFraction`, `tallies`) are computed ONLY by the resolver (stage/resolve.ts `labStats`) and must equal
 * direct engine calls; interpolated frames recompute them; `beamTo` resolves and validates.
 */
import { describe, expect, it } from 'vitest'
import { V } from '../content/L1.values'
import { LECTURES } from '../content/index'
import type { Beat, LabState, StageLayout } from '../content/schema'
import { layoutStates } from '../content/stage'
import { binomialStd } from '../physics/random'
import { averageDeflection, benchTheory } from '../physics/sg'
import { KET, nDotSigma, probUpAlong, tiltXZ, variance } from '../physics/spin'
import { interpolate } from './interp'
import { DEG, resolve, validateStage } from './resolve'
import type { ResolvedLab } from './types'

const L1 = LECTURES.find((l) => l.id === 'L1')!
const beats: Beat[] = L1.units.flatMap((u) => u.story ?? [])
const beat = (id: string) => {
  const b = beats.find((x) => x.id === id)
  if (!b) throw new Error(`no beat ${id}`)
  return b
}
const labOf = (l: StageLayout): LabState => {
  const s = layoutStates(l).find((x) => x.kind === 'lab-r3')
  if (!s || s.kind !== 'lab-r3') throw new Error('no lab state')
  return s
}
const lab = (st: LabState, s: number) => resolve(st, s) as ResolvedLab

describe('D4: centroid, σ band and truth tallies come from the engine', () => {
  it('l1-average:b4: one σ band per batch third, equal to √(Var σₙ / N) from the spin engine (the caption numbers)', () => {
    const st = labOf(beat('l1-average:b4').stage)
    const n45 = tiltXZ(45 * DEG)
    const varSigma = variance(nDotSigma(n45), KET['+z']) // Var σₙ for |+z⟩ read at 45°
    const p = probUpAlong(n45, [0, 0, 1])
    const caption = [V.band10, V.band100, V.band1000]
    ;[10, 100, 1000].forEach((N, k) => {
      const r = lab(st, (k + 0.5) / 3)
      expect(r.batch).toBe(k)
      expect(r.sigmaBand).toBeCloseTo(Math.sqrt(varSigma / N), 12)
      expect(r.sigmaBand).toBeCloseTo(caption[k], 12)
      expect(r.sigmaFraction).toBeCloseTo(binomialStd(N, p) / N, 12)
      expect(r.sigmaFraction).toBeCloseTo(Math.sqrt((p * (1 - p)) / N), 12)
      expect(r.sigmaBand! / r.sigmaFraction!).toBeCloseTo(2, 12)
      expect(r.centroid).toBeCloseTo(averageDeflection(45, 'z'), 12) // n̂·m̂ = cos 45°
    })
  })

  it('centroid = n̂·m̂ = cos θ along the l1-average:b2 sweep (180° → 0°)', () => {
    const st = labOf(beat('l1-average:b2').stage)
    for (const s of [0, 0.25, 0.5, 0.75, 1]) {
      const r = lab(st, s)
      const thetaDeg = r.benches[0].tilts[0] / DEG
      expect(r.centroid).toBeCloseTo(averageDeflection(thetaDeg, 'z'), 12)
      expect(r.sigmaBand).toBeUndefined() // no batches: no band
      expect(r.tallies).toBeUndefined() // no truth readouts
    }
  })

  it('centroid among the atoms that reach the plate (oven → z(+) → z: all land in +)', () => {
    const r = lab(labOf(beat('l1-quantized:b4').stage), 0.5)
    const t = benchTheory({ source: 'oven', axes: ['z', 'z'], keep: ['+'] })
    expect(r.centroid).toBeCloseTo((t.plus - t.minus) / (t.plus + t.minus), 12)
    expect(r.centroid).toBeCloseTo(1, 12)
  })

  it('l1-logic: z-first never false, x-first false 1/4 (benchTheory with every device keeping −)', () => {
    for (const id of ['l1-logic:b1', 'l1-logic:b2', 'l1-logic:b3', 'l1-logic:b4']) {
      const r = lab(labOf(beat(id).stage), 0.5)
      expect(r.benches.map((b) => b.id)).toEqual(['A', 'B'])
      const zFirstFalse = benchTheory({ source: '+z', axes: ['z', 'x'], keep: ['-'] }).minus
      const xFirstFalse = benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['-'] }).minus
      expect(r.tallies).toHaveLength(2)
      expect(r.tallies![0].false).toBeCloseTo(zFirstFalse, 12)
      expect(r.tallies![1].false).toBeCloseTo(xFirstFalse, 12)
      expect(r.tallies![0].false).toBeCloseTo(V.falseZFirst, 12)
      expect(r.tallies![1].false).toBeCloseTo(V.falseXFirst, 12)
      expect(r.tallies![1].true).toBeCloseTo(V.trueXFirst, 12)
      for (const t of r.tallies!) expect(t.true + t.false).toBeCloseTo(1, 12)
    }
  })

  it('every L1 lab beat (question and reveal, s = 0, ½, 1): stats are finite and in range', () => {
    let labs = 0
    for (const b of beats)
      for (const layout of [b.stage, b.reveal?.stage].filter((x): x is StageLayout => !!x))
        for (const st of layoutStates(layout)) {
          if (st.kind !== 'lab-r3') continue
          labs++
          for (const s of [0, 0.5, 1]) {
            const r = lab(st, s)
            if (r.centroid !== undefined) expect(Math.abs(r.centroid)).toBeLessThanOrEqual(1 + 1e-12)
            if (r.sigmaBand !== undefined) expect(r.sigmaBand).toBeGreaterThanOrEqual(0)
            expect(!!r.batches).toBe(r.sigmaBand !== undefined)
            const truth = r.readouts.includes('truth-table') || r.readouts.includes('tally-bars')
            expect(truth).toBe(r.tallies !== undefined)
          }
        }
    expect(labs).toBeGreaterThan(20)
  })

  it('interpolated frames recompute the statistics for their own tilts (no stale number mid-sweep)', () => {
    const at = (deg: number, extra: Partial<LabState> = {}): LabState => ({
      kind: 'lab-r3',
      benches: [{ id: 'main', source: '+z', showPrep: true, devices: [{ axis: deg }] }],
      ...extra,
    })
    const a = lab(at(0, { batches: [10] }), 0)
    const b = lab(at(90, { batches: [10] }), 0)
    for (const t of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      const f = interpolate(a, b, t)
      const deg = f.benches[0].tilts[0] / DEG
      expect(deg).toBeCloseTo(90 * t, 12)
      expect(f.centroid).toBeCloseTo(averageDeflection(deg, 'z'), 12)
      const p = probUpAlong(tiltXZ(deg * DEG), [0, 0, 1])
      expect(f.sigmaFraction).toBeCloseTo(binomialStd(10, p) / 10, 12)
    }
    // a frame between a truth-table beat and a plain one: tallies follow the picked side's readouts
    const logic = labOf(beat('l1-logic:b2').stage)
    const plain = lab({ ...logic, readouts: [] }, 0)
    expect(interpolate(lab(logic, 1), plain, 0.4).tallies).toHaveLength(2)
    expect(interpolate(lab(logic, 1), plain, 0.6).tallies).toBeUndefined()
  })
})

describe('D5: beamTo', () => {
  const base: LabState = { kind: 'lab-r3', benches: [{ id: 'main', source: 'oven', devices: [{ axis: 'z' }] }] }
  it("resolves to 'plate' by default and keeps 'gap'", () => {
    expect(lab(base, 0).beamTo).toBe('plate')
    expect(lab({ ...base, beamTo: 'gap' }, 0).beamTo).toBe('gap')
    expect(validateStage({ ...base, beamTo: 'gap' })).toEqual([])
    expect(validateStage({ ...base, beamTo: 'plate', readouts: ['fill-bar'] })).toEqual([])
  })
  it("rejects an unknown value, and plate readouts or batches on a 'gap' beat", () => {
    expect(validateStage({ ...base, beamTo: 'wall' as 'gap' }).join()).toMatch(/beamTo is 'gap' or 'plate'/)
    expect(validateStage({ ...base, beamTo: 'gap', readouts: ['fill-bar', 'fractions'] }).join()).toMatch(/plate readouts \[fill-bar\]/)
    expect(validateStage({ ...base, beamTo: 'gap', batches: [10] }).join()).toMatch(/batches need the plate/)
  })
  it('switches at t = ½ like every discrete field', () => {
    const a = lab({ ...base, beamTo: 'gap' }, 1)
    const b = lab(base, 0)
    expect(interpolate(a, b, 0.49).beamTo).toBe('gap')
    expect(interpolate(a, b, 0.51).beamTo).toBe('plate')
  })
})
