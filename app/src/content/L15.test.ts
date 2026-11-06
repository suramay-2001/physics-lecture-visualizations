/**
 * Lecture 15's own rulings as lints (docs/roles/decisions/448-L14L18.md M1–M7; the Townsend pass T1–T11), on top of the platform lints every chapter passes:
 *   M2  the free-centre clue and the two-wave fringes moved here from Lecture 13 (keys renamed `l15…`, the three challenges moved, pointers left in Lecture 13, every reference follows);
 *   M3  no stage addition: the plot curves `freeOmega` and `linearOmega` of Lecture 14 are the only curves, every other picture is a `wavefunction` state;
 *   M5  the glossary id `spreading-time` is this lecture's (Lecture 16 reuses it); T1 three practice questions with full walkthroughs; T4 no number in digits that the engine did not compute.
 * Also: the unit order and beat counts, every text balances its dollar signs, the Rosetta line for the notes' φ(p, t) is in one beat only, every V key is claimed, the Try-it lines are what the
 * widgets' engines compute, and the stand-in for linear dispersion (a rigid shift) is exact.
 */
import { describe, expect, it } from 'vitest'
import { L13 } from './L13'
import { L15 } from './L15'
import { BRIDGES_448 } from './bridges448'
import { GLOSSARY } from './glossary'
import { layoutStates } from './stage'
import type { Beat, WavefunctionState } from './stage'
import { bridgeRefs } from './walk'
import { resolveWavefunctionStage, validateWavefunctionStage } from '../stage/svg/wavefunction'
import { clockHands } from '../physics/dynamics'
import { KET } from '../physics/spin'
import { GRID, freeEvolve, meanX, packet, spreadX, translate } from '../physics/wave'
import { V } from './L15.values'
import { V as V13 } from './L13.values'
import { claimKey } from './claimKit'

const beats = L15.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const leaves = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(leaves) : x && typeof x === 'object' ? Object.values(x).flatMap(leaves) : [])
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const unitTexts = () => L15.units.flatMap((u) => [u.title, u.question, u.lecture.summary, ...(u.lecture.equations ?? []), u.insight, ...(u.pitfalls ?? []), ...u.visual.tryThis, ...leaves(u.review), ...leaves(u.play)])
const unit = (id: string) => L15.units.find((u) => u.id === id)!
const beat = (id: string) => beats.find((b) => b.id === id)!

describe('Lecture 15: shape', () => {
  it('has the six units in order with the planned beats (34), clues last in each unit, five books beats and five derivations', () => {
    expect(L15.units.map((u) => u.id)).toEqual(['l15-puzzle', 'l15-free-eigenstate', 'l15-packet-evolution', 'l15-group-velocity', 'l15-dispersion', 'l15-gaussian'])
    expect(L15.units.map((u) => (u.story ?? []).length)).toEqual([3, 5, 6, 7, 6, 7])
    expect(beats).toHaveLength(34)
    expect(beats.filter((b) => b.phase === 'deeper')).toHaveLength(0)
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual([
      'l15-puzzle:b3', 'l15-free-eigenstate:b5', 'l15-packet-evolution:b6', 'l15-group-velocity:b7', 'l15-dispersion:b6', 'l15-gaussian:b7',
    ])
    for (const u of L15.units) expect(u.story!.at(-1)!.phase, u.id).toBe('clue')
    expect(beats.filter((b) => b.phase === 'books').map((b) => b.id)).toEqual([
      'l15-free-eigenstate:b4', 'l15-packet-evolution:b5', 'l15-group-velocity:b6', 'l15-dispersion:b5', 'l15-gaussian:b6',
    ])
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l15-free-eigenstate:b1', 'l15-packet-evolution:b2', 'l15-group-velocity:b2', 'l15-dispersion:b2', 'l15-gaussian:b3'])
    expect(L15.units.reduce((n, u) => n + u.play.length, 0)).toBe(27)
    expect(L15.corrections ?? []).toHaveLength(0) // the notes have no slip (plan §8)
  })
  it('every text balances its dollar signs (a stray one would typeset the rest of the sentence as TeX)', () => {
    for (const t of [...beats.flatMap(textsOf), ...unitTexts()]) {
      const flat = t.replace(/\\\$/g, '').replace(/\$\$/g, '')
      expect((flat.match(/\$/g) ?? []).length % 2, t.slice(0, 80)).toBe(0)
    }
  })
  it('every claim key is a value of the chapter and every value is claimed at least once', () => {
    const claimed = new Set(L15.units.flatMap((u) => [...(u.claims ?? []), ...(u.review?.claims ?? [])]).map((c) => claimKey(c)))
    for (const k of Object.keys(V)) expect(claimed.has(k), k).toBe(true)
    for (const k of Object.keys(V)) expect(k.startsWith('l15'), k).toBe(true)
  })
})

describe('Lecture 15: pictures', () => {
  it('every state validates; only wavefunction and plot are drawn; the plot curves are the two dispersion relations of Lecture 14 (ruling M3)', () => {
    for (const u of L15.units) {
      const states = (u.story ?? []).flatMap(statesOf)
      for (const s of states.filter((x): x is WavefunctionState => x.kind === 'wavefunction')) expect(validateWavefunctionStage(s), u.id).toEqual([])
      for (const s of states) expect(['wavefunction', 'plot'], `${u.id} ${s.kind}`).toContain(s.kind)
    }
    const fns = unit('l15-dispersion').story!.flatMap(statesOf).flatMap((s) => (s.kind === 'plot' && s.curve ? [s.curve.fn, ...(s.curve.vs ? [s.curve.vs] : [])] : []))
    expect(new Set(fns)).toEqual(new Set(['freeOmega', 'linearOmega']))
    expect(beat('l15-dispersion:b2').fidelity).toContain('plot-free-omega')
    expect(beat('l15-dispersion:b3').fidelity).toContain('plot-free-omega')
  })
  it('the width demos use p₀ = 1.5 (the p₀ = 3 packet would wrap the periodic window at t = 6)', () => {
    for (const id of ['l15-packet-evolution:b3', 'l15-packet-evolution:b4', 'l15-dispersion:b1', 'l15-dispersion:b6']) {
      const s = statesOf(beat(id)).filter((x): x is WavefunctionState => x.kind === 'wavefunction')
      for (const w of s) expect('packet' in w.source && w.source.packet.p0, id).toBe(1.5)
    }
  })
  it('a wavefunction state resolves with the numbers the lecture quotes (spot checks at the engine level)', () => {
    const k = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1, p0: 1.5 } }, panels: ['position', 'momentum'], time: 6, readouts: ['xspread', 'pspread', 'pmean', 'peak'] }, 1)
    expect(k.stats.xspread!).toBeCloseTo(V.l15QuadWidth6, 9)
    expect(k.stats.pspread!).toBeCloseTo(V.l15DpT6, 9)
    expect(k.stats.pmean!).toBeCloseTo(V.l15MeanPT6, 9)
    const g = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 0.8, p0: 1.5 } }, time: 1.28, readouts: ['xspread'] }, 1)
    expect(g.stats.xspread! / 0.8).toBeCloseTo(V.l15WidthAtTSpread, 9)
    const c = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1, p0: 3 } }, time: 3, readouts: ['xmean'] }, 1)
    expect(c.stats.xmean!).toBeCloseTo(V.l15Centre3, 9)
    const sh = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1, p0: 1.5 } }, shift: 6, readouts: ['xspread'] }, 1)
    expect(sh.stats.xspread!).toBeCloseTo(V.l15LinearWidth6, 9)
  })
  it('the rigid shift that stands in for ω = ck keeps the whole shape: every sample of |ψ|² is the shifted one, and the width is untouched', () => {
    const psi = packet(GRID, { x0: 0, sigma: 1, p0: 1.5 })
    const moved = translate(psi, GRID, 6)
    expect(spreadX(moved, GRID)).toBeCloseTo(spreadX(psi, GRID), 12)
    expect(meanX(moved, GRID)).toBeCloseTo(6, 9)
    expect(spreadX(freeEvolve(psi, GRID, 6), GRID)).toBeGreaterThan(3 * spreadX(psi, GRID))
  })
})

describe('Lecture 15: M2 what moved here from Lecture 13', () => {
  it('the free-centre clue is the clue of l15-puzzle and the two-wave fringes are l15-group-velocity:b1; Lecture 13 keeps only pointers', () => {
    expect(beat('l15-puzzle:b3').reveal!.claims!.map((c) => claimKey(c))).toEqual(['l15FreeMean2'])
    expect(beat('l15-group-velocity:b1').claims!.map((c) => claimKey(c))).toEqual(['l15FringeSpacing', 'l15FringeSpeed', 'l15FringeSpeedFormula'])
    const l13 = L13.units.flatMap((u) => u.story ?? [])
    expect(l13.find((b) => b.id === 'l13-schrodinger:b3')!.text).toMatch(/Unit 15\.1/)
    expect(l13.find((b) => b.id === 'l13-schrodinger:b8')!.text).toMatch(/Unit 15\.4/)
    expect(Object.keys(V13).filter((k) => /FreeMean2|Fringe(Spacing|Speed)/.test(k))).toEqual([])
    const l13ids = L13.units.flatMap((u) => u.play.map((q) => q.id))
    for (const old of ['l13-sc-mean', 'l13-ee-space', 'l13-ee-speed']) expect(l13ids).not.toContain(old)
    const ids = L15.units.flatMap((u) => u.play.map((q) => q.id))
    for (const now of ['l15-pz-mean', 'l15-gv-fringe', 'l15-gv-fspeed']) expect(ids).toContain(now)
  })
  it('the moved numbers: fringes π ℓ apart moving at 3, the centre at 6, and the pair formula (p₁ + p₂)/2m', () => {
    expect(V.l15FringeSpacing).toBeCloseTo(Math.PI, 12)
    expect(V.l15FringeSpeed).toBeCloseTo(3, 12)
    expect(V.l15FringeSpeedFormula).toBeCloseTo(V.l15FringeSpeed, 12)
    expect(V.l15FreeMean2).toBeCloseTo(6, 9)
  })
})

describe('Lecture 15: recaps, Rosetta line, glossary and bridges', () => {
  it('Unit 14.5 is recalled in l15-puzzle:b1, which defines nothing; the notes’ φ(p, t) is renamed in one beat only (R5)', () => {
    const b = beat('l15-puzzle:b1')
    expect(b.text).toContain('Unit 14.5')
    expect(b.text).toMatch(/defines nothing new/)
    expect(b.derivation).toBeUndefined()
    expect(b.introduces).toBeUndefined()
    expect(beat('l15-packet-evolution:b1').text).toMatch(/The notes call the amplitude \$\\phi\(p,t\)\$; here it keeps its name \$\\tilde\\psi\(p,t\)\$/)
    for (const other of beats.filter((x) => x.id !== 'l15-packet-evolution:b1')) expect(textsOf(other).join(' '), other.id).not.toMatch(/The notes call/)
  })
  it('the seven new glossary ids are first used where the plan puts them; spreading-time belongs to this lecture (M5)', () => {
    const firsts = { 'free-particle': 'l15-free-eigenstate:b1', envelope: 'l15-group-velocity:b2', 'group-velocity': 'l15-group-velocity:b3', 'phase-velocity': 'l15-group-velocity:b5', dispersion: 'l15-dispersion:b1', 'gaussian-packet': 'l15-gaussian:b1', 'spreading-time': 'l15-gaussian:b3' }
    for (const [id, first] of Object.entries(firsts)) expect(GLOSSARY.get(id)!.first, id).toBe(first)
    expect(GLOSSARY.get('chirp')).toBeUndefined() // the word is Lecture 16's; here it is said in plain words
    expect(textsOf(beat('l15-dispersion:b4')).join(' ')).not.toContain('[[chirp')
  })
  it('one chip into 709 (the uncertainty relation) sits in the Gaussian unit, and its table row exists', () => {
    const used = beats.flatMap((b) => [...bridgeRefs(b.text), ...bridgeRefs(b.reveal?.text ?? '')])
    expect(used).toEqual(['sl-q3-uncertainty'])
    expect(bridgeRefs(beat('l15-gaussian:b1').text)).toEqual(['sl-q3-uncertainty'])
    expect(BRIDGES_448['sl-q3-uncertainty']).toBeDefined()
  })
  it('the exact Gaussian width and Ehrenfest’s theorem are Lecture 16’s: this lecture says so and derives neither', () => {
    expect(beat('l15-gaussian:b4').text).toMatch(/derived in Lecture 16/)
    expect(beat('l15-group-velocity:b6').text).toMatch(/Lecture 16 derives it/)
    expect(beat('l15-gaussian:b4').derivation).toBeUndefined()
  })
})

describe('Lecture 15: the Try-its are what the widgets compute', () => {
  it('no unit uses wave-lab; the widgets are the planned stand-ins', () => {
    expect(L15.units.map((u) => u.visual.kind)).toEqual(['two-clocks', 'two-clocks', 'two-clocks', 'two-clocks', 'two-clocks', 'amplitude-bars'])
    for (const u of L15.units) expect(u.visual.caption).toMatch(/stand-in/)
  })
  it('puzzle and free-eigenstate: one clock from +z has no gap (nothing moves)', () => {
    for (const id of ['l15-puzzle', 'l15-free-eigenstate']) expect(unit(id).visual.props).toEqual({ upper: 3, lower: 1, start: '+z' })
    expect(clockHands({ upper: 3, lower: 1 }, KET['+z'], 1.2).gap).toBeNull()
    expect(clockHands({ upper: 3, lower: 1 }, KET['+x'], 1.2).gap).not.toBeNull()
  })
  it('packet-evolution, group-velocity, dispersion: with energies 4ε and ε the hands are 90° apart at 30°, and the gap does not depend on the mean energy', () => {
    for (const id of ['l15-packet-evolution', 'l15-group-velocity', 'l15-dispersion']) expect(unit(id).visual.props).toEqual({ upper: 4, lower: 1, start: '+x' })
    const gap = (levels: { upper: number; lower: number }, deg: number) => (clockHands(levels, KET['+x'], (deg * Math.PI) / 180).gap! * 180) / Math.PI
    expect(gap({ upper: 4, lower: 1 }, 30)).toBeCloseTo(90, 9)
    expect(gap({ upper: 6, lower: 3 }, 30)).toBeCloseTo(90, 9) // the mean energy moved up by 2ε: same gap
    expect(gap({ upper: 5, lower: 1 }, 30)).toBeGreaterThan(gap({ upper: 4, lower: 1 }, 30)) // a wider spread of rates parts the hands faster
  })
  it('gaussian: at +x, measured along z, each outcome holds one half (amplitude-bars)', () => {
    expect(unit('l15-gaussian').visual.props).toMatchObject({ state: '+x', basis: 'z' })
  })
})

describe('Lecture 15: the practice questions and the new numbers', () => {
  it('the three practice questions are tagged, name their source, carry full walkthroughs and are not assigned (T1); no homework label appears', () => {
    const qs = L15.units.flatMap((u) => u.play).filter((q) => q.practice)
    expect(qs.map((q) => `${q.id}:${q.practice}`)).toEqual(['l15-pr-dp:homework', 'l15-pr-boost:townsend', 'l15-pr-spread:townsend'])
    for (const q of qs) {
      expect(q.walkthrough.length, q.id).toBeGreaterThan(1)
      expect(q.hints, q.id).toHaveLength(3)
      expect(q.assigned, q.id).toBeFalsy()
      expect(JSON.stringify(q), q.id).not.toMatch(/\bH\d-\d/)
      if (q.practice === 'townsend') expect(q.refs?.[0].where, q.id).toMatch(/^Problem 6\.\d+/)
    }
    const tol = Object.fromEntries(qs.map((q) => [q.id, q.kind === 'numeric' ? q.tolerance : -1]))
    expect(tol).toEqual({ 'l15-pr-dp': 0.005, 'l15-pr-boost': 0, 'l15-pr-spread': 0.005 })
  })
  it('a whole-number answer is a whole number with tolerance 0; a decimal answer uses 0.005 (the phase in degrees uses 0.05)', () => {
    for (const q of L15.units.flatMap((u) => u.play)) {
      if (q.kind !== 'numeric') continue
      if (Number.isInteger(q.answer)) expect(q.tolerance, q.id).toBe(0)
      else expect(q.tolerance, q.id).toBe(q.id === 'l15-pe-phase' ? 0.05 : 0.005)
    }
  })
  it('the numbers: the group velocity is p/m, the crests go at half of it, the envelope of k = 2.8 and 3.2 moves at 3, the spreading time halves its square with σ', () => {
    expect(V.l15EnvSpeedNear).toBeCloseTo(3, 12)
    expect(V.l15CarrierSpeedNear).toBeCloseTo(4.52 / 3, 12)
    expect(V.l15GroupPhaseRatio).toBeCloseTo(2, 12)
    expect(V.l15PrCarrier45).toBeCloseTo(10.25 / 4.5, 12)
    expect(V.l15VgElectron).toBeCloseTo(2 * V.l15VphElectron, 12)
    expect(V.l15Tspread08).toBeCloseTo(1.28, 12)
    expect(V.l15TspreadRatio).toBeCloseTo(4, 12)
    expect(V.l15Dp08 * V.l15Dx08).toBeCloseTo(V.l15Prod08, 9)
    expect(V.l15PeakRatioT6).toBeCloseTo(1 / Math.sqrt(10), 9)
    expect(V.l15QuadWidth6).toBeCloseTo(Math.sqrt(10), 9)
    expect(V.l15PrSpreadFs).toBeCloseTo(8.638, 3)
    expect(V.l15TspreadEqTownsend).toBeCloseTo(1, 12)
  })
  it('the momentum spread and the mean momentum do not change with time (Δp and ⟨p⟩ at t = 0, 6 agree)', () => {
    expect(V.l15DpT6).toBeCloseTo(V.l15DpT0, 9)
    expect(V.l15MeanPT6).toBeCloseTo(V.l15MeanP15, 9)
    expect(V.l15PhiDrift).toBeLessThan(1e-9)
    expect(V.l15PrDpT5).toBeCloseTo(V.l15PrDp, 9)
  })
  it('no number is shown with a power of ten in a beat (T4: every digit on screen is computed)', () => {
    const all = beats.flatMap(textsOf).join(' ')
    expect(all).not.toMatch(/\d\s*(?:\\times|×)\s*10\^/)
  })
})
