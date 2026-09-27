/**
 * The SG bench's schematic geometry (layout.ts) and the plate's marks (plate.ts): the picture draws what the engine
 * decided, in the right place.
 *   - frames are rigid (orthonormal, det +1); each magnet sits on the kept beam of the one before;
 *   - a magnet's + direction is the engine's `axisVector` of its tilt (in the untilted chain), so the + spot lies along
 *     the last magnet's n on the plate, and the knob drag inverts the knob's placement (tiltFromPoint);
 *   - stops sit on the blocked beam; pads beside each beam;
 *   - flight paths are finite, start at the source, end on the plate mark (plate atoms) or at their stop;
 *   - the plate's marks: one per plate atom of each volley (until the cap), + marks on the + side, arrival order;
 *     at most MAX_FLOWN atoms drawn in flight, and the volley lands within 1.8 s.
 */
import { describe, expect, it } from 'vitest'
import { axisVector } from '../../../physics/sg'
import { at, beamPoint, defl, flightPaths, landingOf, localOf, nLocal, PATH_POINTS, SG, sgLayout, tiltFromPoint, type Frame } from './layout'
import { MAX_DEPOSITS, MAX_FLOWN, seedOf, SETUPS, volleyOf, type SgSetup } from './model'
import { buildPlate, emptyPlate, layoutOfSetup, VOLLEY_MAX_S } from './plate'

const G = SG.spacing - SG.L
const rad = (d: number) => (d * Math.PI) / 180
function expectRigid(f: Frame) {
  const R = f.R
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      const dot = R[i] * R[j] + R[3 + i] * R[3 + j] + R[6 + i] * R[6 + j]
      expect(dot).toBeCloseTo(i === j ? 1 : 0, 10)
    }
  const det = R[0] * (R[4] * R[8] - R[5] * R[7]) - R[1] * (R[3] * R[8] - R[5] * R[6]) + R[2] * (R[3] * R[7] - R[4] * R[6])
  expect(det).toBeCloseTo(1, 10)
}
const setups: SgSetup[] = [SETUPS['l1-z'], SETUPS['l1-zxz'], SETUPS['l3-four'], SETUPS['l2-plus-y'], { source: '-x', tilts: [30, 135, 250], keep: ['-', '+'] }, { source: '+z', tilts: [0, 60, 0], keep: ['+', '-'] }]

describe('layout', () => {
  it('frames are rigid; each magnet sits on the kept beam of the one before', () => {
    for (const s of setups) {
      const lay = layoutOfSetup(s)
      for (const m of [...lay.modules, ...(lay.prep ? [lay.prep] : [])]) {
        expectRigid(m.base)
        expectRigid(m.tilted)
      }
      expectRigid(lay.plate)
      for (let k = 0; k + 1 < lay.modules.length; k++) {
        const on = beamPoint(lay.modules[k], SG.L + G, s.keep[k] === '-' ? -1 : 1)
        const next = lay.modules[k + 1].base.o
        for (let c = 0; c < 3; c++) expect(next[c]).toBeCloseTo(on[c], 10)
      }
      expect(lay.modules).toHaveLength(s.tilts.length)
      expect(lay.stops).toHaveLength(s.tilts.length - 1)
      expect(!!lay.prep).toBe(s.source !== 'oven' && s.source[1] !== 'y')
      expect(lay.source.kind).toBe(s.source[1] === 'y' ? 'sealed' : 'oven')
      expect(lay.addPad === null).toBe(s.tilts.length >= 4)
      expect(lay.removePads.every((p) => (p === null) === (s.tilts.length === 1))).toBe(true)
    }
  })

  it('a lone magnet’s + direction is the engine’s axisVector of its tilt (turned only about the beam, +y)', () => {
    for (let t = 0; t < 360; t += 15) {
      const lay = sgLayout({ taus: [rad(t)], keep: [], source: { kind: 'oven' }, max: 4 })
      const m = lay.modules[0]
      const n = [m.tilted.R[2], m.tilted.R[5], m.tilted.R[8]] // the tilted frame's z = the magnet's + direction
      const e = axisVector(t)
      for (let c = 0; c < 3; c++) expect(n[c]).toBeCloseTo(e[c], 10)
      expect(n[1]).toBeCloseTo(0, 12)
    }
  })

  it('the knob drag inverts the knob: tiltFromPoint(ring knob at τ) = τ, and any point on the ray from the beam', () => {
    for (const s of setups) {
      const lay = layoutOfSetup(s)
      lay.modules.forEach((m, k) => {
        expect(tiltFromPoint(m, lay.rings[k].knob)).toBeCloseTo(s.tilts[k], 8)
        const far = at(m.base, [3 * Math.sin(m.tau), 7, 3 * Math.cos(m.tau)])
        expect(tiltFromPoint(m, far)).toBeCloseTo(s.tilts[k], 8)
      })
      expect(tiltFromPoint(lay.modules[0], lay.modules[0].base.o)).toBeNull()
    }
  })

  it('stops sit on the blocked beam; the ± pads sit beyond the + and − beams', () => {
    for (const s of setups) {
      const lay = layoutOfSetup(s)
      lay.stops.forEach((st, k) => {
        const m = lay.modules[k]
        const n = nLocal(m.tau)
        const l = localOf(m.base, st.frame.o)
        const along = l[0] * n[0] + l[2] * n[2]
        const keep = s.keep[k] === '-' ? -1 : 1
        expect(Math.sign(along)).toBe(-keep)
        expect(Math.abs(along)).toBeCloseTo(m.k * defl(SG.L + SG.stopGap), 10)
        const pp = localOf(m.base, st.pads.plus)
        const pm = localOf(m.base, st.pads.minus)
        expect(pp[0] * n[0] + pp[2] * n[2]).toBeGreaterThan(Math.abs(along))
        expect(pm[0] * n[0] + pm[2] * n[2]).toBeLessThan(-Math.abs(along))
      })
    }
  })
})

describe('flight paths and landing points', () => {
  it('the centre of each beam lands at ±SPOT along the last magnet’s n (plate-local), whatever the tilts', () => {
    const spot = SG.K * defl(SG.L + SG.plateGap)
    expect(spot).toBeCloseTo(SG.spot, 3)
    for (const s of setups) {
      const lay = layoutOfSetup(s)
      const n = nLocal(lay.modules[lay.modules.length - 1].tau)
      const tone = s.source[1] === 'y' ? 1 : 0
      for (const [end, sign] of [
        ['plus', 1],
        ['minus', -1],
      ] as const) {
        const p = landingOf(lay, { end, path: [...s.keep, end === 'plus' ? '+' : '-'] }, { x: 0, zj: 0, v: 1 }, tone)
        expect(p[0]).toBeCloseTo(sign * spot * n[0], 9)
        expect(p[2]).toBeCloseTo(sign * spot * n[2], 9)
      }
    }
  })

  it('paths are finite, start at the source, end on the plate mark or at the stop of the magnet that stopped them', () => {
    const s = SETUPS['l1-zxz']
    const lay = layoutOfSetup(s)
    const v = volleyOf(s, 400, seedOf(0))
    const looks = v.fates.map((_, i) => ({ x: ((i * 37) % 100) / 50 - 1, zj: (((i * 17) % 50) - 25) / 10, v: 0.9 + 0.2 * (((i * 13) % 100) / 100) }))
    const fp = flightPaths(lay, v.fates, looks, 0)
    expect(fp.points.every(Number.isFinite)).toBe(true)
    expect(fp.points.length).toBe(400 * PATH_POINTS * 3)
    const src = at(lay.source.frame, [0, 0, 0])
    v.fates.forEach((f, i) => {
      const P = (j: number) => [fp.points[3 * (i * PATH_POINTS + j)], fp.points[3 * (i * PATH_POINTS + j) + 1], fp.points[3 * (i * PATH_POINTS + j) + 2]]
      const first = P(0)
      expect(Math.hypot(first[0] - src[0], first[1] - src[1], first[2] - src[2])).toBeLessThan(1.5)
      const last = P(PATH_POINTS - 1)
      if (f.end === 'plus' || f.end === 'minus') {
        const mark = at(lay.plate, landingOf(lay, f, looks[i], 0))
        expect(Math.hypot(last[0] - mark[0], last[1] - mark[1], last[2] - mark[2])).toBeLessThan(0.05)
        // the last tone is the outcome at the last magnet
        expect(fp.tones[i * PATH_POINTS + PATH_POINTS - 1]).toBe(f.end === 'plus' ? 1 : 2)
      } else {
        const stop = lay.stops[f.end].frame.o
        expect(Math.hypot(last[0] - stop[0], last[1] - stop[1], last[2] - stop[2])).toBeLessThan(0.6)
        expect(fp.tones[i * PATH_POINTS + PATH_POINTS - 1]).toBe(f.path[f.end] === '+' ? 1 : 2)
      }
      // an oven atom is unpolarized before the first magnet
      expect(fp.tones[i * PATH_POINTS]).toBe(0)
    })
  })
})

describe('the plate’s marks and a volley’s flight', () => {
  it('one mark per plate atom, + marks on the + side; in order of arrival; the flight lands within 1.8 s', () => {
    const s = SETUPS['l1-zx']
    const v = volleyOf(s, 1000, seedOf(0))
    const p = buildPlate(s, emptyPlate(s), v, true)
    expect(p.count).toBe(v.counts.plus + v.counts.minus)
    expect(p.landed).toBe(v.counts.plus + v.counts.minus)
    expect(p.start).toBe(0)
    let plus = 0
    const n = nLocal(Math.PI / 2)
    for (let i = 0; i < p.count; i++) {
      const along = p.pos[3 * i] * n[0] + p.pos[3 * i + 2] * n[2]
      if (p.sign[i] === 1) {
        plus++
        expect(along).toBeGreaterThan(0)
      } else expect(along).toBeLessThan(0)
    }
    expect(plus).toBe(v.counts.plus)
    for (let i = 1; i < p.arrive!.length; i++) expect(p.arrive![i]).toBeGreaterThanOrEqual(p.arrive![i - 1])
    expect(p.flight!.n).toBe(1000)
    expect(p.flight!.end).toBeLessThanOrEqual(VOLLEY_MAX_S)
    for (let i = 0; i < p.flight!.n; i++) expect(p.flight!.t0[i] + p.flight!.dur[i]).toBeLessThanOrEqual(VOLLEY_MAX_S)
  })

  it('10 000 atoms: at most 2 000 fly; every plate atom gets a mark; a second volley appends; the plate stops at 20 000 marks', () => {
    const s = SETUPS['l1-z']
    let p = emptyPlate(s)
    let landed = 0
    for (let k = 0; k < 3; k++) {
      const v = volleyOf(s, 10000, seedOf(k))
      const before = p.count
      p = buildPlate(s, p, v, true)
      landed += v.counts.plus + v.counts.minus
      expect(p.flight!.n).toBeLessThanOrEqual(MAX_FLOWN)
      expect(p.start).toBe(before)
      expect(p.landed).toBe(landed)
    }
    expect(p.count).toBe(MAX_DEPOSITS)
    expect(p.landed).toBe(30000)
    // without motion there is no flight and every mark shows at once
    const q = buildPlate(s, emptyPlate(s), volleyOf(s, 100, seedOf(9)), false)
    expect(q.flight).toBeNull()
    expect(q.arrive).toBeNull()
    expect(q.start).toBe(q.count)
  })

  it('every number handed to the canvas is finite', () => {
    for (const s of setups) {
      const p = buildPlate(s, emptyPlate(s), volleyOf(s, 3000, seedOf(1)), true)
      expect(p.pos.subarray(0, 3 * p.count).every(Number.isFinite)).toBe(true)
      expect(p.flight!.points.every(Number.isFinite)).toBe(true)
      expect(p.flight!.t0.every(Number.isFinite) && p.flight!.dur.every((d) => Number.isFinite(d) && d > 0)).toBe(true)
    }
  })
})
