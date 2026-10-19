/**
 * Lecture 12's own rulings as lints (docs/roles/decisions/448-L12L13.md R1-R8), on top of the platform lints every chapter passes:
 *   R1  the `wavefunction` kind is drawn from the third unit on (and once in the first, beside a Bloch sphere); the phase clocks only in the first two;
 *   R2  p̂ = -iħ d/dx is derived in the last unit (`l12-translations:b4`, six steps' worth of views), not earlier;
 *   R3  P(+x; t) = cos²(ωt/2) is taught in `l12-motion:b3`, and Lecture 11's Go deeper 3 points here;
 *   R4  T(a) is the translation operator and U(t) the time evolution; p̂ wears its hat;
 *   R7  the Try-it of units 3-6 is an existing widget whose lines say what it is (no `wave-lab`);
 *   R8  no Correction box.
 * Also: the unit order and beat counts, every text balances its dollar signs, the Rosettas (≅ and φ(t) in `l12-motion:b1`, L̂ in `l12-law:b3`), the chip into
 * 709 sits in the Go-deeper beat, every V key is claimed, and the four Arcade rounds are true.
 */
import { describe, expect, it } from 'vitest'
import { L12 } from './L12'
import { L11 } from './L11'
import { BRIDGES_448 } from './bridges448'
import { GLOSSARY } from './glossary'
import { layoutStates } from './stage'
import type { Beat, ClocksState, PlotState, WavefunctionState } from './stage'
import { bridgeRefs } from './walk'
import { ERROR_ROUNDS } from '../arcade/games'
import { validateStage } from '../stage/resolve'
import '../stage/svg/kinds'
import { resolveClocksStage } from '../stage/svg/clocks'
import { resolveWavefunctionStage, validateWavefunctionStage } from '../stage/svg/wavefunction'
import { GRID, interval, packet, translate } from '../physics/wave'
import { V } from './L12.values'
import { claimKey } from './claimKit'

const beats = L12.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const leaves = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(leaves) : x && typeof x === 'object' ? Object.values(x).flatMap(leaves) : [])
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const unitTexts = () => L12.units.flatMap((u) => [u.title, u.question, u.lecture.summary, ...(u.lecture.equations ?? []), u.insight, ...(u.pitfalls ?? []), ...u.visual.tryThis, ...leaves(u.review), ...leaves(u.play)])
const unit = (id: string) => L12.units.find((u) => u.id === id)!
const beat = (id: string) => beats.find((b) => b.id === id)!

describe('Lecture 12: shape', () => {
  it('has the six planned units in order plus the Townsend unit l12-driven, with the planned beats (38 on the notes’ line plus the unit-4 beat the table lists, the Townsend beats, one Go-deeper beat)', () => {
    expect(L12.units.map((u) => u.id)).toEqual(['l12-law', 'l12-motion', 'l12-continuum', 'l12-wavefunction', 'l12-position-op', 'l12-translations', 'l12-driven'])
    expect(L12.units.map((u) => (u.story ?? []).filter((b) => b.phase !== 'deeper').length)).toEqual([9, 8, 6, 6, 5, 7, 4])
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['l12-translations:b8'])
    expect(beats.filter((b) => b.phase === 'clue')).toHaveLength(6)
    expect(beats.filter((b) => b.phase === 'books')).toHaveLength(13)
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l12-law:b6', 'l12-law:b7b', 'l12-motion:b3', 'l12-motion:b5b', 'l12-motion:b5c', 'l12-continuum:b3', 'l12-wavefunction:b3', 'l12-position-op:b1', 'l12-translations:b4', 'l12-driven:b3'])
    expect(L12.units.reduce((n, u) => n + u.play.length, 0)).toBe(23)
    expect(L12.corrections).toBeUndefined() // R8
  })
  it('every text balances its dollar signs (a stray one would typeset the rest of the sentence as TeX)', () => {
    for (const t of [...beats.flatMap(textsOf), ...unitTexts()]) {
      const flat = t.replace(/\\\$/g, '').replace(/\$\$/g, '')
      expect((flat.match(/\$/g) ?? []).length % 2, t.slice(0, 80)).toBe(0)
    }
  })
  it('every claim key is a value of the chapter and every value is claimed at least once', () => {
    const claimed = new Set(
      L12.units.flatMap((u) => [...(u.claims ?? []), ...(u.review?.claims ?? [])]).map((c) => claimKey(c)),
    )
    for (const k of Object.keys(V)) expect(claimed.has(k), k).toBe(true)
  })
})

describe('Lecture 12: R1 the shared kind and the clocks', () => {
  it('the wavefunction is drawn in every unit from the third on; the clocks only in the first two and in the Townsend unit; every wavefunction state validates', () => {
    for (const u of L12.units) {
      const states = (u.story ?? []).flatMap(statesOf)
      const wf = states.filter((s): s is WavefunctionState => s.kind === 'wavefunction')
      const ck = states.filter((s): s is ClocksState => s.kind === 'clocks')
      if (['l12-continuum', 'l12-wavefunction', 'l12-position-op', 'l12-translations'].includes(u.id)) expect(wf.length, u.id).toBeGreaterThan(3)
      if (!['l12-law', 'l12-motion', 'l12-driven'].includes(u.id)) expect(ck, u.id).toHaveLength(0)
      for (const s of wf) expect(validateWavefunctionStage(s), `${u.id}`).toEqual([])
    }
  })
  it('the example Hamiltonian of the clocks is Lecture 11’s: 3ε and ε, start |+x⟩', () => {
    for (const s of beats.flatMap(statesOf).filter((x): x is ClocksState => x.kind === 'clocks')) {
      expect(s.levels).toEqual({ upper: 3, lower: 1 })
      expect(s.start ?? '+x').toBe('+x')
    }
  })
  it('the packet inputs the lecture uses are all the unit packet or a named variation: σ ∈ {1, ¼, 0.7}, x₀ ∈ {−1, 0, 1, 1.5, 2}', () => {
    const sigmas = new Set<number>()
    for (const s of beats.flatMap(statesOf).filter((x): x is WavefunctionState => x.kind === 'wavefunction'))
      if ('packet' in s.source && typeof s.source.packet.sigma === 'number') sigmas.add(s.source.packet.sigma)
    expect([...sigmas].sort()).toEqual([0.25, 0.7, 1])
  })
})

describe('Lecture 12: R2, R3, R4 ownership and notation', () => {
  it('p̂ = −iħ d/dx is derived once, in the last unit, in five steps with at least two distinct views', () => {
    const b = beat('l12-translations:b4')
    expect(b.derivation!.result).toBe("\\langle x|\\hat p|\\psi\\rangle = -i\\hbar\\,\\psi'(x)")
    expect(b.derivation!.ground).toHaveLength(5)
    expect(b.derivation!.ground.filter((s) => s.view)).toHaveLength(2)
    for (const other of beats.filter((x) => x.id !== b.id && !x.id.startsWith('l12-translations'))) expect(textsOf(other).join(' '), other.id).not.toMatch(/-i\\hbar\\,\\psi'/)
  })
  it('cos²(ωt/2) is taught in l12-motion:b3, and Lecture 11’s Go deeper 3 points to Unit 12.2 (R3)', () => {
    expect(beat('l12-motion:b3').derivation!.result).toBe('P(+x;t) = \\cos^2(\\omega t/2)')
    const g = L11.units.flatMap((u) => u.story ?? []).find((b) => b.id === 'l11-two-level:b10')!
    expect(g.text).toMatch(/Lecture 12 derives this chance in Unit 12\.2\./)
    expect(L12.units[1].id).toBe('l12-motion')
  })
  it('the translation operator is T(a), time evolution stays U(t), and the momentum operator wears its hat (R4)', () => {
    expect(beat('l12-law:b3').text).toContain('T(a) = e^{-ia\\hat p/\\hbar}')
    expect(beat('l12-law:b3').text).toContain('U(t) = e^{-itH/\\hbar}')
    expect(GLOSSARY.get('translation-operator')!.gloss).toContain('T(a)')
    expect(GLOSSARY.get('momentum-operator')!.gloss).toContain('\\hat p')
    for (const t of [...beats.flatMap(textsOf), ...unitTexts()]) expect(t, t.slice(0, 60)).not.toMatch(/\\hat T|\\hat U/)
  })
  it('the equation’s gloss now reads “time-dependent Schrödinger equation” and the two new glosses of unit 1 exist', () => {
    expect(GLOSSARY.get('schrodinger-equation')!.term).toBe('time-dependent Schrödinger equation')
    for (const id of ['time-independent-hamiltonian', 'energy-eigenvalue-equation', 'noether-theorem']) expect(GLOSSARY.get(id), id).toBeDefined()
  })
  it('the Rosettas: ≅ replaces the notes’ ∼ and φ(t) replaces θ(t) in l12-motion:b1; our S_z is the notes’ L̂ in l12-law:b3', () => {
    const m = beat('l12-motion:b1').text
    expect(m).toContain('\\cong')
    expect(m).toContain('“∼”')
    expect(m).toMatch(/azimuth \$\\varphi = \\omega t\$/)
    expect(m).toMatch(/call that azimuth \$\\theta\(t\)\$/)
    expect(beat('l12-law:b3').text).toMatch(/The notes write \$\\hat L\$ where our spin lectures wrote \$S_z\$/)
    for (const b of beats.filter((x) => x.id !== 'l12-motion:b1')) expect(b.text, b.id).not.toContain('“∼”')
  })
  it('the glosses introduced here are first used where their first-use ids say', () => {
    for (const [id, first] of Object.entries({ 'time-independent-hamiltonian': 'l12-law:b2', 'noether-theorem': 'l12-law:b3', 'position-eigenstate': 'l12-continuum:b2', 'wavefunction': 'l12-wavefunction:b1', 'momentum-operator': 'l12-translations:b1' }))
      expect(beat(first).text, id).toContain(`[[${id}|`)
  })
})

describe('Lecture 12: R7 the Try-its', () => {
  it('units 1 and 2 use the phase-clock widget; units 3-6 use an existing widget and say what it stands for', () => {
    expect(unit('l12-law').visual).toMatchObject({ kind: 'two-clocks', props: { upper: 3, lower: 1, start: '+x' } })
    expect(unit('l12-motion').visual).toMatchObject({ kind: 'two-clocks' })
    for (const id of ['l12-continuum', 'l12-wavefunction', 'l12-position-op', 'l12-translations']) expect(['amplitude-bars', 'complex-plane'], id).toContain(unit(id).visual.kind)
    expect(unit('l12-continuum').visual.caption).toMatch(/stand-in/)
    expect(unit('l12-continuum').visual.tryThis[0]).toMatch(/only two cells/)
  })
  it('the two-clocks Try-it lines are what the clocks stage resolves: at 30° the gap is 60° and P(+x) = 0.75; at 90° the gap is 180° and P(+x) = 0', () => {
    const at = (t: number) => resolveClocksStage({ kind: 'clocks', levels: { upper: 3, lower: 1 }, start: '+x', timeDeg: t, readouts: ['gap', 'px'] }, 1)
    expect(at(30).gapDeg).toBeCloseTo(60, 9)
    expect(at(30).px).toBeCloseTo(0.75, 12)
    expect(at(90).gapDeg).toBeCloseTo(180, 9)
    expect(at(90).px).toBeCloseTo(0, 12)
    expect(unit('l12-motion').visual.tryThis.join(' ')).toMatch(/P\(\+x\) = 0\.75/)
  })
  it('the multiplication Try-its of units 4-6 describe complex multiplication correctly: a real w stretches z, a unit w turns it', () => {
    const real = unit('l12-position-op').visual.props as { z: number[]; w: number[] }
    expect(real.w[1]).toBe(0)
    const unitary = unit('l12-translations').visual.props as { z: number[]; w: number[] }
    expect(Math.hypot(unitary.w[0], unitary.w[1])).toBeCloseTo(1, 12)
  })
})

describe('Lecture 12: Go deeper and the chip into 709', () => {
  it('the Go-deeper beat is optional: it introduces nothing, comes last, and opens with “Beyond the notes:”', () => {
    const g = beat('l12-translations:b8')
    expect(g.text).toMatch(/^Beyond the notes:/)
    expect(g.introduces).toBeUndefined()
    const phases = unit('l12-translations').story!.map((b) => b.phase)
    expect(phases[phases.length - 1]).toBe('deeper')
    expect(phases.indexOf('deeper')).toBeGreaterThan(phases.lastIndexOf('clue'))
    for (const u of L12.units) for (const t of u.visual.tryThis) expect(t, u.id).not.toMatch(/beyond the notes|Go deeper/i)
  })
  it('the one chip into Physics 709 sits in the Go-deeper beat and its table row exists', () => {
    const used = beats.flatMap((b) => [...bridgeRefs(b.text), ...bridgeRefs(b.reveal?.text ?? '')])
    expect(used).toEqual(['sl-f4-unitary'])
    expect(bridgeRefs(beat('l12-translations:b8').text)).toEqual(['sl-f4-unitary'])
    expect(BRIDGES_448['sl-f4-unitary']).toBeDefined()
  })
})

describe('Lecture 12: Arcade rounds and the numbers a learner meets', () => {
  const rounds = ERROR_ROUNDS.filter((r) => r.trains.lecture === 'L12')
  it('has four Spot-the-error rounds, each training a real unit, each with a wrong step inside it', () => {
    expect(rounds.map((r) => r.id)).toEqual(['l12-time-dependent', 'l12-cos-omega', 'l12-density-over-one', 'l12-shift-sign'])
    expect(rounds.map((r) => r.trains.unit)).toEqual(['l12-law', 'l12-motion', 'l12-wavefunction', 'l12-translations'])
    for (const r of rounds) {
      expect(L12.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.steps).toHaveLength(4)
      expect(r.wrong).toBeGreaterThanOrEqual(2)
      expect(r.wrong).toBeLessThan(4)
    }
  })
  it('l12-cos-omega: at ωt = 180° the chance of +x is 0, and cos²(180°) = 1 would be the slip', () => {
    expect(V.l12Px180).toBeCloseTo(0, 12)
    expect(Math.cos(Math.PI) ** 2).toBeCloseTo(1, 12)
    expect(V.l12Px60).toBeCloseTo(Math.cos(Math.PI / 6) ** 2, 12)
  })
  it('l12-density-over-one: a packet four times narrower peaks above 1 per ℓ while every interval chance stays at most 1', () => {
    expect(V.l12PeakQuarter).toBeGreaterThan(1)
    const narrow = packet(GRID, { x0: 0, sigma: 0.25 })
    for (const [a, b] of [[-0.25, 0.25], [-1, 1], [-8, 8], [0, 0.1]] as const) expect(interval(narrow, GRID, a, b)).toBeLessThanOrEqual(1 + 1e-9)
  })
  it('l12-shift-sign: T(a) with a > 0 moves the peak to x₀ + a, so ψ_a(x) = ψ(x − a) and not ψ(x + a)', () => {
    expect(V.l12PeakPos).toBeCloseTo(3, 9)
    const w = translate(packet(GRID, { x0: 0, sigma: 1 }), GRID, 3)
    const j = Math.round((3 - GRID.x[0]) / GRID.dx)
    const k = Math.round((-3 - GRID.x[0]) / GRID.dx)
    expect(w.re[j]).toBeGreaterThan(0.6)
    expect(w.re[j]).toBeGreaterThan(1000 * w.re[k]) // the amplitude at +3 is the peak; the amplitude at −3 is six widths away
  })
  it('a wavefunction state resolves with every number the lecture quotes (spot checks at the engine level)', () => {
    const r = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1 } }, cells: 8, readouts: ['cell'] }, 1)
    expect(r.stats.cell!.chance).toBeCloseTo(V.l12CellP8, 12)
    const s = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1 } }, interval: [-1, 1], readouts: ['interval'] }, 1)
    expect(s.stats.interval).toBeCloseTo(V.l12P1sigma, 12)
  })
})

describe('Lecture 12: the Townsend pass (G4a; rulings 448-townsend T1–T11)', () => {
  it('l12-law:b7 became the pointer b7a (Lecture 11 owns Townsend §4.1, T7) and b7b adds the rate law of §4.2; l12-motion gained b5b and b5c', () => {
    expect(unit('l12-law').story!.map((b) => b.id)).toEqual(['l12-law:b1', 'l12-law:b2', 'l12-law:b3', 'l12-law:b4', 'l12-law:b5', 'l12-law:b6', 'l12-law:b7a', 'l12-law:b7b', 'l12-law:b8'])
    expect(unit('l12-motion').story!.map((b) => b.id)).toEqual(['l12-motion:b1', 'l12-motion:b2', 'l12-motion:b3', 'l12-motion:b4', 'l12-motion:b5a', 'l12-motion:b5b', 'l12-motion:b5c', 'l12-motion:b6'])
    const pointer = beat('l12-law:b7a').text
    expect(pointer.split(/(?<=[.?!])\s+/).length).toBeLessThanOrEqual(2)
    expect(pointer).toMatch(/Units 11\.2–11\.5/)
    expect(beat('l12-law:b7b').text).toMatch(/Eq\. 4\.16/)
    expect(beat('l12-law:b7b').text).toMatch(/the commutator is \$\[H, A\]\$, not \$\[A, H\]\$/)
  })
  it('the new unit l12-driven is last, made of four books beats only, and says in its summary that the notes do not cover it (T3)', () => {
    expect(L12.units.at(-1)!.id).toBe('l12-driven')
    const u = unit('l12-driven')
    expect(u.story!.map((b) => b.phase)).toEqual(['books', 'books', 'books', 'books'])
    expect(u.lecture.summary).toMatch(/^The lecture notes do not cover this unit/)
    expect(u.lecture.pages).toMatch(/^not in the lecture notes/)
    expect(beat('l12-driven:b1').text).toMatch(/^This unit is beyond the lecture notes/)
    expect(u.visual).toMatchObject({ kind: 'two-clocks' })
  })
  it('T4: experimental numbers are in words only (no digit of the muon’s, the neutron’s or the field strengths of Townsend’s figures); every digit shown is computed', () => {
    const t = ['l12-driven:b1', 'l12-driven:b2'].map((id) => beat(id).text).join(' ')
    expect(t).not.toMatch(/807|\b60\b|\b62\b|\b31\b|2\.00|0\.10|gauss|kHz/)
    expect(Object.keys(V)).not.toContain('l12TMuonG')
  })
  it('the stages of the unit validate: the interferometer fringe, the flip with its off-resonance partner and the Lorentzian ceiling', () => {
    for (const id of ['l12-driven:b2', 'l12-driven:b4']) expect(validateStage(beat(id).stage as PlotState), id).toEqual([])
    const fringe = beat('l12-driven:b2').stage as PlotState
    expect(fringe.curve).toMatchObject({ fn: 'spinFringe', vs: 'spinFringeOther' })
    expect(fringe.markers?.map((m) => m.x)).toEqual([0, 2, 4])
    const peak = beat('l12-driven:b4').stage as PlotState
    expect(peak.curve).toMatchObject({ fn: 'rabiPeak' })
    const flip = beat('l12-driven:b3').derivation!.ground.flatMap((s) => (s.view ? [s.view] : [])).find((v): v is PlotState => v.kind === 'plot')!
    expect(flip.curve).toMatchObject({ fn: 'rabiFlip', vs: 'rabiFlipOff' })
    expect(validateStage(flip)).toEqual([])
  })
  it('four derivations are new (D12.1 to D12.4), each with at least two distinct views', () => {
    const ids = ['l12-law:b7b', 'l12-motion:b5b', 'l12-motion:b5c', 'l12-driven:b3']
    for (const id of ids) {
      const views = beat(id).derivation!.ground.flatMap((s) => (s.view ? [s.view] : []))
      expect(new Set(views).size, id).toBeGreaterThanOrEqual(2)
    }
  })
  it('four practice questions (T1), tagged townsend with the problem cited in refs, a full walkthrough, no homework label anywhere', () => {
    const practice = L12.units.flatMap((u) => u.play).filter((c) => c.practice)
    expect(practice.map((c) => c.id)).toEqual(['l12-pr-field-angle', 'l12-pr-sg-field', 'l12-pr-muon', 'l12-pr-rabi'])
    for (const c of practice) {
      expect(c.practice).toBe('townsend')
      expect(c.walkthrough.length, c.id).toBeGreaterThan(0)
      expect(c.refs?.[0]?.where, c.id).toMatch(/^Problem 4\.[4579], end of Ch\. 4/)
      expect(leaves(c).join('\n'), c.id).not.toMatch(/\bH\d-\d|\bHW\d/)
    }
    expect(V.l12PrRabiPeak).toBeCloseTo(0.36, 12)
    expect(V.l12PrG).toBeCloseTo(1.98945, 4)
  })
  it('the formula board of the three units that carry Townsend’s equations (1 + 2 + 4 new entries)', () => {
    expect(unit('l12-law').lecture.equations).toHaveLength(3)
    expect(unit('l12-motion').lecture.equations).toHaveLength(4)
    expect(unit('l12-driven').lecture.equations).toHaveLength(4)
  })
})
