/**
 * Lecture 14's own rulings as lints (docs/roles/decisions/448-L14L18.md M1–M7; the Townsend pass T1–T11), on top of the platform lints every chapter passes:
 *   M1  Units 13.6 and 13.7 stay in Lecture 13; Lecture 14 recaps each in one beat that names the unit and defines nothing, and owns only what its notes add;
 *   M2  the box (old l13-stationary) came here as the books-only Unit 14.6 and moved on to Lecture 20 (ruling R2 of docs/roles/decisions/448-L19L20.md): five units and four practice questions are left,
 *       a pointer in `l14-stationary:b6` and one in Lecture 13, and every reference follows;
 *   M3  the dispersion curves `freeOmega` and `linearOmega` are the only stage addition; every other picture is an existing kind;
 *   T1 four practice questions with full walkthroughs; T4 no experimental number in digits; M4/R4 the Rosetta line for V̂(ε) is in one beat only.
 * Also: the unit order and beat counts, every text balances its dollar signs, the chip into 709, every V key is claimed, the Try-it lines are what the widgets' engines compute.
 */
import { describe, expect, it } from 'vitest'
import { L13 } from './L13'
import { L14 } from './L14'
import { BRIDGES_448 } from './bridges448'
import { BRIDGES as BRIDGES_709 } from './qc709/bridges'
import { GLOSSARY } from './glossary'
import { layoutStates } from './stage'
import type { Beat, WavefunctionState } from './stage'
import { bridgeRefs } from './walk'
import { resolveWavefunctionStage, validateWavefunctionStage } from '../stage/svg/wavefunction'
import { clockHands } from '../physics/dynamics'
import { inner } from '../physics/linalg'
import { KET } from '../physics/spin'
import { GRID, boxEnergy, boxState, packet } from '../physics/wave'
import { kineticEnergy } from '../physics/wave14'
import { V } from './L14.values'
import { claimKey } from './claimKit'

const beats = L14.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const leaves = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(leaves) : x && typeof x === 'object' ? Object.values(x).flatMap(leaves) : [])
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const unitTexts = () => L14.units.flatMap((u) => [u.title, u.question, u.lecture.summary, ...(u.lecture.equations ?? []), u.insight, ...(u.pitfalls ?? []), ...u.visual.tryThis, ...leaves(u.review), ...leaves(u.play)])
const unit = (id: string) => L14.units.find((u) => u.id === id)!
const beat = (id: string) => beats.find((b) => b.id === id)!

describe('Lecture 14: shape', () => {
  it('has the five lecture units in order (the box moved to Lecture 20), with the planned beats', () => {
    expect(L14.units.map((u) => u.id)).toEqual(['l14-components', 'l14-schrodinger', 'l14-dispersion', 'l14-time', 'l14-stationary'])
    expect(L14.units.map((u) => (u.story ?? []).length)).toEqual([5, 6, 7, 4, 7])
    expect(beats.filter((b) => b.phase === 'deeper')).toHaveLength(0)
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['l14-components:b5', 'l14-schrodinger:b6', 'l14-dispersion:b7', 'l14-time:b4', 'l14-stationary:b7'])
    expect(beats.filter((b) => b.phase === 'books').map((b) => b.id)).toEqual(['l14-components:b4', 'l14-schrodinger:b5', 'l14-dispersion:b6', 'l14-stationary:b6'])
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l14-schrodinger:b2', 'l14-stationary:b2', 'l14-stationary:b4']) // dispersion:b2 links back to Unit 13.6 (review S1)
    expect(L14.units.reduce((n, u) => n + u.play.length, 0)).toBe(18)
    expect(L14.corrections ?? []).toHaveLength(0) // the notes have no slip (plan §8)
  })
  it('every text balances its dollar signs (a stray one would typeset the rest of the sentence as TeX)', () => {
    for (const t of [...beats.flatMap(textsOf), ...unitTexts()]) {
      const flat = t.replace(/\\\$/g, '').replace(/\$\$/g, '')
      expect((flat.match(/\$/g) ?? []).length % 2, t.slice(0, 80)).toBe(0)
    }
  })
  it('every claim key is a value of the chapter and every value is claimed at least once', () => {
    const claimed = new Set(L14.units.flatMap((u) => [...(u.claims ?? []), ...(u.review?.claims ?? [])]).map((c) => claimKey(c)))
    for (const k of Object.keys(V)) expect(claimed.has(k), k).toBe(true)
  })
})

describe('Lecture 14: pictures', () => {
  it('every state validates; only existing kinds are drawn; the plot curves are the two dispersion relations', () => {
    for (const u of L14.units) {
      const states = (u.story ?? []).flatMap(statesOf)
      for (const s of states.filter((x): x is WavefunctionState => x.kind === 'wavefunction')) expect(validateWavefunctionStage(s), u.id).toEqual([])
      for (const s of states) expect(['wavefunction', 'clocks', 'plot', 'amplitudes'], `${u.id} ${s.kind}`).toContain(s.kind)
    }
    const fns = unit('l14-dispersion').story!.flatMap(statesOf).flatMap((s) => (s.kind === 'plot' && s.curve ? [s.curve.fn, ...(s.curve.vs ? [s.curve.vs] : [])] : []))
    expect(new Set(fns)).toEqual(new Set(['freeOmega', 'linearOmega']))
    expect(beat('l14-dispersion:b1').fidelity).toContain('plot-free-omega')
  })
  it('the stationary unit draws the width-4 box and the clocks, and a box state resolves with the energy the lecture quotes', () => {
    const r = resolveWavefunctionStage({ kind: 'wavefunction', source: { box: { L: 4, n: 1 } }, readouts: ['energy'] }, 1)
    expect(r.stats.energy).toBeCloseTo(V.l14BoxE1, 12)
    expect(new Set(unit('l14-stationary').story!.flatMap(statesOf).map((s) => s.kind))).toEqual(new Set(['wavefunction', 'clocks']))
  })
  it('a wavefunction state resolves with the numbers the lecture quotes (spot checks at the engine level)', () => {
    const c = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1 } }, cells: 512, readouts: ['cell'] }, 1)
    expect(c.stats.cell?.chance).toBeCloseTo(V.l14Cell512, 12)
    const k = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1, p0: 3 } }, readouts: ['pmean', 'pspread'] }, 1)
    expect(0.5 * k.stats.pmean! ** 2).toBeCloseTo(V.l14TkinMean, 9)
    expect(0.5 * k.stats.pspread! ** 2).toBeCloseTo(V.l14TkinSpread, 9)
    const s = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1, p0: 1.5 } }, shift: 3, time: 2, readouts: ['xmean'] }, 1)
    expect(s.stats.xmean!).toBeCloseTo(V.l14ShiftThenWait, 9)
    const e = resolveWavefunctionStage({ kind: 'wavefunction', source: { box: { L: 4, n: 2 } }, readouts: ['energy'] }, 1)
    expect(e.stats.energy!).toBeCloseTo(V.l14BoxE2, 12)
  })
})

describe('Lecture 14: M1 the recaps, the Rosetta line and the chip into 709', () => {
  it('Units 13.6 and 13.7 stay in Lecture 13; Lecture 14 names each in its recap beat and defines no term there', () => {
    expect(L13.units.map((u) => u.id)).toEqual(['l13-delta', 'l13-generator', 'l13-plane-wave', 'l13-momentum-space', 'l13-two-bases', 'l13-schrodinger', 'l13-time'])
    expect(beat('l14-schrodinger:b1').text).toContain('Unit 13.6')
    expect(beat('l14-time:b1').text).toContain('Unit 13.7')
    expect(beat('l14-components:b1').text).toContain('Unit 12.3')
    for (const id of ['l14-time:b1', 'l14-components:b1']) {
      expect(beat(id).text, id).not.toContain('[[')
      expect(beat(id).derivation, id).toBeUndefined()
      expect(beat(id).introduces, id).toBeUndefined()
    }
  })
  it('the notes’ V̂(ε) is written W(ε) in one beat only, and the dispersion relation is the one notation beat', () => {
    expect(beat('l14-time:b3').text).toMatch(/The notes write the unitary \$\\hat V\(\\epsilon\)\$; here it is \$W\(\\epsilon\)\$/)
    for (const other of beats.filter((x) => x.id !== 'l14-time:b3')) expect(textsOf(other).join(' '), other.id).not.toMatch(/\\hat V/)
    expect(beat('l14-dispersion:b1').introduces).toEqual(['dispersion-relation'])
    expect(GLOSSARY.get('dispersion-relation')!.introduces).toBe('notation')
    expect(GLOSSARY.get('infinite-well')!.first).toBe('l20-infinite:b1') // moved to Lecture 20 (ruling R2)
    expect(GLOSSARY.get('node')!.first).toBe('l14-stationary:b6')
    expect(GLOSSARY.get('time-independent-schrodinger')!.first).toBe('l14-stationary:b2')
  })
  it('one chip into 709 (a driven spin does not conserve energy) sits in the time unit, and its table row exists', () => {
    const used = beats.flatMap((b) => [...bridgeRefs(b.text), ...bridgeRefs(b.reveal?.text ?? '')])
    expect(used).toEqual(['sl-q24-rabi'])
    expect(bridgeRefs(beat('l14-time:b2').text)).toEqual(['sl-q24-rabi'])
    expect(BRIDGES_448['sl-q24-rabi'], 'sl-q24-rabi').toBeDefined()
  })
})

describe('Lecture 14: the Try-its are what the widgets compute', () => {
  it('no unit uses wave-lab; the five widgets are the planned stand-ins', () => {
    expect(L14.units.map((u) => u.visual.kind)).toEqual(['amplitude-bars', 'two-clocks', 'two-clocks', 'two-clocks', 'two-clocks'])
    expect(unit('l14-components').visual.caption).toMatch(/stand-in/)
    expect(unit('l14-schrodinger').visual.caption).toMatch(/stand-in/)
  })
  it('components: at +x, measured along z, each outcome holds one half (amplitude-bars)', () => {
    const [up, down] = [KET['+z'], KET['-z']].map((k) => inner(k, KET['+x']))
    expect(up.re ** 2 + up.im ** 2).toBeCloseTo(0.5, 12)
    expect(down.re ** 2 + down.im ** 2).toBeCloseTo(0.5, 12)
    expect(unit('l14-components').visual.props).toMatchObject({ state: '+x', basis: 'z' })
  })
  it('dispersion: with energies 4ε and ε, the upper hand has turned 80° when the lower has turned 20° (two-clocks)', () => {
    expect(unit('l14-dispersion').visual.props).toEqual({ upper: 4, lower: 1, start: '+x' })
    const h = clockHands({ upper: 4, lower: 1 }, KET['+x'], (20 * Math.PI) / 180)
    expect(-h.turned[0] * (180 / Math.PI)).toBeCloseTo(80, 9)
    expect(-h.turned[1] * (180 / Math.PI)).toBeCloseTo(20, 9)
  })
  it('schrodinger and time: the hands are 60° apart at 30° and 90° apart at 45° for 3ε and ε', () => {
    for (const id of ['l14-schrodinger', 'l14-time']) expect(unit(id).visual.props).toEqual({ upper: 3, lower: 1, start: '+x' })
    expect((clockHands({ upper: 3, lower: 1 }, KET['+x'], Math.PI / 6).gap! * 180) / Math.PI).toBeCloseTo(60, 9)
    expect((clockHands({ upper: 3, lower: 1 }, KET['+x'], Math.PI / 4).gap! * 180) / Math.PI).toBeCloseTo(V.l14ClockGap90, 9)
  })
  it('stationary: one clock from +z has no gap (nothing moves), and the engine says the same of a single box level', () => {
    expect(unit('l14-stationary').visual.props).toEqual({ upper: 3, lower: 1, start: '+z' })
    expect(clockHands({ upper: 3, lower: 1 }, KET['+z'], 1.2).gap).toBeNull()
    expect(V.l14StationaryDrift).toBeLessThan(1e-12)
  })
})

describe('Lecture 14: the new numbers', () => {
  it('kinetic energy: 4.625 = 4.5 + 0.125; squeezing σ from 1 to ½ multiplies it by four; the tent is 3/(2mL²) and the cut top hat of width 2 grows as n/2', () => {
    expect(V.l14TkinP0).toBeCloseTo(V.l14TkinMean + V.l14TkinSpread, 9)
    expect(V.l14GaussTRatio).toBeCloseTo(4, 9)
    expect(kineticEnergy(packet(GRID, { x0: 0, sigma: 0.5 }), GRID)).toBeCloseTo(V.l14GaussTHalf, 12)
    expect(V.l14PrTentT).toBeCloseTo(3 / 8, 12)
    expect(V.l14TopHatT4).toBeCloseTo(2, 9)
    expect(V.l14TopHatT8).toBeCloseTo(4, 9)
  })
  it('the sloshing pair: direct terms 0.375, cross ±0.354, density 0.729 to 0.021 over half of 2π/(E₂ − E₁) = 6.79; the practice period is 12/π', () => {
    expect(V.l14SloshMean + V.l14CrossAmp).toBeCloseTo(V.l14SloshD0, 12)
    expect(V.l14SloshMean - V.l14CrossAmp).toBeCloseTo(V.l14SloshDHalf, 9)
    expect(V.l14SloshPeriod).toBeCloseTo((2 * Math.PI) / (boxEnergy(4, 2) - boxEnergy(4, 1)), 12)
    expect(V.l14PrPeriod).toBeCloseTo(12 / Math.PI, 12)
    expect(V.l14PrMeanE).toBeCloseTo(0.36 * boxEnergy(2, 1) + 0.64 * boxEnergy(2, 3), 12)
    expect(V.l14PhaseTurnDegMag).toBeCloseTo((boxEnergy(4, 1) * 4 * 180) / Math.PI, 9)
    const a = boxState(GRID, 4, 1, 4)
    const j = Math.round((2 - GRID.x[0]) / GRID.dx)
    expect(Math.atan2(a.im[j], a.re[j])).toBeLessThan(0) // the phase turns clockwise (negative)
  })
})

describe('Lecture 14: M2 the box moved on to Lecture 20 (Townsend pass T1–T6; ruling R2 of the L19–L20 rulings)', () => {
  it('the box unit and its practice questions left; Lecture 14 keeps a one-line pointer in l14-stationary:b6 and Lecture 13 names Lecture 20', () => {
    expect(L14.units.map((u) => u.id)).not.toContain('l14-box')
    expect(L14.units.flatMap((u) => u.play.map((q) => q.id))).not.toContain('l14-pr-box-energy')
    expect(L14.units.flatMap((u) => u.play.map((q) => q.id))).not.toContain('l14-pr-wall')
    expect(beat('l14-stationary:b6').text).toMatch(/The box itself is solved in Lecture 20\.`?$/)
    expect(L13.units.flatMap((u) => u.story ?? []).find((b) => b.id === 'l13-schrodinger:b6')!.text).toMatch(/Unit 14\.5/)
    expect(L13.units.flatMap((u) => u.story ?? []).find((b) => b.id === 'l13-schrodinger:b6')!.text).toMatch(/Lecture 20/)
  })
  it('the four practice questions (three numeric, the top-hat choice) are tagged, name their source, carry full walkthroughs and are not assigned (T1); no homework label appears', () => {
    const qs = L14.units.flatMap((u) => u.play).filter((q) => q.practice)
    expect(qs.map((q) => `${q.id}:${q.practice}`)).toEqual(['l14-di-tophat:homework', 'l14-pr-kinetic:homework', 'l14-pr-period:homework', 'l14-pr-mean-energy:townsend'])
    for (const q of qs) {
      expect(q.walkthrough.length, q.id).toBeGreaterThan(1)
      expect(q.hints, q.id).toHaveLength(3)
      expect(q.assigned, q.id).toBeFalsy()
      expect(JSON.stringify(q), q.id).not.toMatch(/\bH\d-\d/)
      if (q.practice === 'townsend') expect(q.refs?.[0].where, q.id).toMatch(/^Problem 6\.\d+, end of Ch\. 6/)
    }
    const tol = Object.fromEntries(qs.map((q) => [q.id, q.kind === 'numeric' ? q.tolerance : -1]))
    expect(tol).toEqual({ 'l14-di-tophat': -1, 'l14-pr-kinetic': 0.005, 'l14-pr-period': 0.005, 'l14-pr-mean-energy': 0.005 })
  })
  it('every old name is gone: no l13-stationary unit, no l13 keys and no l14Box keys but the node count; the Optics Lab row now points at Lecture 20', () => {
    expect(L13.units.map((u) => u.id)).not.toContain('l13-stationary')
    expect(Object.keys(V).filter((k) => /^l13/.test(k))).toEqual([])
    expect(Object.keys(V).filter((k) => /^l14(TBox|TWall|PrE1|PrWall)/.test(k))).toEqual(['l14TBoxNodes4'])
    expect(BRIDGES_709['qc-l14-box']).toBeUndefined()
    expect(BRIDGES_709['qc-l20-box']).toMatchObject({ course: 'sl448', lecture: 'L20', unit: 'l20-infinite' })
    expect(BRIDGES_709['qc-l13-stationary']).toBeUndefined()
    expect(V.l14TBoxNodes4).toBe(3)
  })
  it('no number is shown with a power of ten in the lecture (T4: every digit on screen is computed)', () => {
    const all = beats.flatMap(textsOf).join(' ')
    expect(all).not.toMatch(/\d\s*(?:\\times|×)\s*10\^/)
  })
})
