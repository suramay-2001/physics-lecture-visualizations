/**
 * Lecture 16's own rulings as lints (docs/roles/decisions/448-L14L18.md M1–M7; the Townsend pass T1–T11), on top of the platform lints every chapter passes:
 *   M2  the Townsend spreading beat and its clue (Ex. 6.4) and the Ehrenfest beat (§6.3) moved here from Lecture 13 (keys renamed `l16…`, three challenges moved, a pointer left in Lecture 13, every reference follows);
 *   M3  the two plot curves `packetWidth` and `packetWidthChirp` are the only stage addition; every other picture is a `wavefunction` state;
 *   M5  the glossary id `spreading-time` is Lecture 15's and only reused here; T1 four practice questions with full walkthroughs; the rate law of Unit 12.1 is recalled and not derived again.
 * Also: the unit order and beat counts, every text balances its dollar signs, every V key is claimed, the numbers agree with the closed forms, and the Try-it lines are what the widgets compute.
 */
import { describe, expect, it } from 'vitest'
import { L12 } from './L12'
import { L13 } from './L13'
import { L16 } from './L16'
import { BRIDGES_448 } from './bridges448'
import { GLOSSARY } from './glossary'
import { layoutStates } from './stage'
import type { Beat, WavefunctionState } from './stage'
import { bridgeRefs } from './walk'
import { resolveWavefunctionStage, validateWavefunctionStage } from '../stage/svg/wavefunction'
import { abs, arg, c, mul } from './../physics/complex'
import { clockHands } from '../physics/dynamics'
import { apply } from '../physics/linalg'
import { KET, Rz, SIGMA_X, expectation } from '../physics/spin'
import { V } from './L16.values'
import { V as V13 } from './L13.values'
import { claimKey } from './claimKit'

const beats = L16.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const leaves = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(leaves) : x && typeof x === 'object' ? Object.values(x).flatMap(leaves) : [])
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const unitTexts = () => L16.units.flatMap((u) => [u.title, u.question, u.lecture.summary, ...(u.lecture.equations ?? []), u.insight, ...(u.pitfalls ?? []), ...u.visual.tryThis, ...leaves(u.review), ...leaves(u.play)])
const unit = (id: string) => L16.units.find((u) => u.id === id)!
const beat = (id: string) => beats.find((b) => b.id === id)!

describe('Lecture 16: shape', () => {
  it('has the four units in order with the planned beats (27), four clues, four books beats, one Go-deeper beat and four derivations', () => {
    expect(L16.units.map((u) => u.id)).toEqual(['l16-start', 'l16-evolve', 'l16-spread', 'l16-ehrenfest'])
    expect(L16.units.map((u) => (u.story ?? []).length)).toEqual([6, 6, 8, 7])
    expect(beats).toHaveLength(27)
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['l16-spread:b8'])
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['l16-start:b6', 'l16-evolve:b6', 'l16-spread:b7', 'l16-ehrenfest:b7'])
    for (const u of L16.units.filter((x) => x.id !== 'l16-spread')) expect(u.story!.at(-1)!.phase, u.id).toBe('clue')
    expect(beats.filter((b) => b.phase === 'books').map((b) => b.id)).toEqual(['l16-start:b5', 'l16-evolve:b5', 'l16-spread:b6', 'l16-ehrenfest:b6'])
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l16-evolve:b2', 'l16-spread:b2', 'l16-ehrenfest:b2', 'l16-ehrenfest:b3'])
    expect(L16.units.reduce((n, u) => n + u.play.length, 0)).toBe(20) // sixteen from the plan's list (three of them moved from Lecture 13, ruling M2) and the four practice questions
    expect(L16.corrections ?? []).toHaveLength(0) // the notes have no slip (plan §8)
  })
  it('every text balances its dollar signs (a stray one would typeset the rest of the sentence as TeX)', () => {
    for (const t of [...beats.flatMap(textsOf), ...unitTexts()]) {
      const flat = t.replace(/\\\$/g, '').replace(/\$\$/g, '')
      expect((flat.match(/\$/g) ?? []).length % 2, t.slice(0, 80)).toBe(0)
    }
  })
  it('every claim key is a value of the chapter and every value is claimed at least once', () => {
    const claimed = new Set(L16.units.flatMap((u) => [...(u.claims ?? []), ...(u.review?.claims ?? [])]).map((c) => claimKey(c)))
    for (const k of Object.keys(V)) expect(claimed.has(k), k).toBe(true)
    for (const k of Object.keys(V)) expect(k.startsWith('l16'), k).toBe(true)
  })
})

describe('Lecture 16: pictures', () => {
  it('every state validates; only wavefunction and plot are drawn; the plot curves are the two width curves (ruling M3)', () => {
    for (const u of L16.units) {
      const states = (u.story ?? []).flatMap(statesOf)
      for (const s of states.filter((x): x is WavefunctionState => x.kind === 'wavefunction')) expect(validateWavefunctionStage(s), u.id).toEqual([])
      for (const s of states) expect(['wavefunction', 'plot'], `${u.id} ${s.kind}`).toContain(s.kind)
    }
    const fns = beats.flatMap(statesOf).flatMap((s) => (s.kind === 'plot' && s.curve ? [s.curve.fn, ...(s.curve.vs ? [s.curve.vs] : [])] : []))
    expect(new Set(fns)).toEqual(new Set(['packetWidth', 'packetWidthChirp']))
    expect(beat('l16-spread:b2').fidelity).toContain('plot-packet-width')
    expect(beat('l16-spread:b8').fidelity).toContain('plot-packet-width')
  })
  it('the p₀ = 3 packet is only run to t = 4 and shown in the window [−4, 16] (its centre reaches 12)', () => {
    for (const b of beats) {
      for (const s of statesOf(b).filter((x): x is WavefunctionState => x.kind === 'wavefunction')) {
        const p0 = 'packet' in s.source ? s.source.packet.p0 : undefined
        if (p0 === 3) {
          expect(s.window?.x, b.id).toEqual([-4, 16])
          const t = s.time
          const end = typeof t === 'number' ? t : t && typeof t === 'object' ? t.to : 0
          expect(end, b.id).toBeLessThanOrEqual(4)
        }
      }
    }
  })
  it('a wavefunction state resolves with the numbers the lecture quotes (spot checks at the engine level)', () => {
    const w = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1, p0: 3 } }, time: 4, readouts: ['xspread', 'pspread', 'pmean', 'product', 'peak', 'norm'] }, 1)
    expect(w.stats.xspread!).toBeCloseTo(V.l16FreeSd4, 9)
    expect(w.stats.pspread!).toBeCloseTo(V.l16FreeDp4, 9)
    expect(w.stats.pmean!).toBeCloseTo(V.l16FreeMeanP4, 9)
    expect(w.stats.product!).toBeCloseTo(V.l16Product4, 9)
    expect(w.stats.norm!).toBeCloseTo(V.l16Norm4, 9)
    const t2 = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1, p0: 3 } }, time: 2, readouts: ['xmean', 'peak', 'xspread'] }, 1)
    expect(t2.stats.xmean!).toBeCloseTo(V.l16Mean2, 9)
    expect(t2.stats.peak!).toBeCloseTo(V.l16PeakTs, 9)
    expect(t2.stats.xspread!).toBeCloseTo(V.l16FreeSd2, 9)
    const n = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 0.5 } }, time: 2, readouts: ['xspread'] }, 1)
    expect(n.stats.xspread!).toBeCloseTo(V.l16Dx05T2, 9)
  })
})

describe('Lecture 16: M2 what moved here from Lecture 13', () => {
  it('the Townsend spreading beat and its clue are l16-spread:b6 and :b7, the Ehrenfest beat is l16-ehrenfest:b6, with the renamed keys; Lecture 13 keeps only a pointer', () => {
    expect(beat('l16-spread:b6').claims!.map((c) => claimKey(c))).toEqual(['l16FreeDp4', 'l16SpreadElectronMant', 'l16SpreadMarbleMant', 'l16SpreadMarbleYearsMant', 'l16SpreadElectronLog10'])
    expect(beat('l16-spread:b7').reveal!.claims!.map((c) => claimKey(c))).toEqual(['l16FreeSd2', 'l16FreeSd4'])
    expect(beat('l16-ehrenfest:b6').claims!.map((c) => claimKey(c))).toEqual(['l16EhrenfestDpDt'])
    expect(beat('l16-ehrenfest:b6').text).toMatch(/^Townsend §6\.3 \(pp\. 199–200/)
    const l13 = L13.units.flatMap((u) => u.story ?? [])
    expect(l13.find((b) => b.id === 'l13-schrodinger:b5')!.text).toMatch(/Lecture 16\.$/)
    for (const old of ['l13-schrodinger:b7', 'l13-time:b6a']) expect(l13.map((b) => b.id), old).not.toContain(old)
    expect(Object.keys(V13).filter((k) => /FreeDp4|FreeSd|SpreadElectron|SpreadMarble|EhrenfestDpDt/.test(k))).toEqual([])
    const l13ids = L13.units.flatMap((u) => u.play.map((q) => q.id))
    for (const old of ['l13-sc-sd', 'l13-sc-electron', 'l13-ti-ehren']) expect(l13ids).not.toContain(old)
    const ids = L16.units.flatMap((u) => u.play.map((q) => q.id))
    for (const now of ['l16-sp-sd', 'l16-sp-electron', 'l16-eh-ehren']) expect(ids).toContain(now)
  })
  it('the moved numbers: the widths √2 and √5, Δp one half, the electron’s time 10^{−16.06} s, the marble’s 3 × 10^17 years and the force −2', () => {
    expect(V.l16FreeSd2).toBeCloseTo(Math.SQRT2, 9)
    expect(V.l16FreeSd4).toBeCloseTo(Math.sqrt(5), 9)
    expect(V.l16FreeDp4).toBeCloseTo(0.5, 9)
    expect(V.l16SpreadElectronLog10).toBeCloseTo(-16.0636, 3)
    expect(V.l16SpreadMarbleYearsMant).toBeCloseTo(3.0048, 3)
    expect(V.l16EhrenfestDpDt).toBeCloseTo(-2, 9)
    expect(V.l16EhrenfestForceMean).toBeCloseTo(V.l16EhrenfestDpDt, 9) // the commutator route and −⟨V′⟩ agree
  })
})

describe('Lecture 16: recaps, Rosetta line, glossary and bridges', () => {
  it('Unit 15.3 and Unit 12.1 are recalled in l16-start:b1 and l16-ehrenfest:b1, which define nothing; the rate law is not derived again here', () => {
    for (const [id, unitName] of [['l16-start:b1', 'Unit 15.3'], ['l16-ehrenfest:b1', 'Unit 12.1']] as const) {
      const b = beat(id)
      expect(b.text, id).toContain(unitName)
      expect(b.text, id).toMatch(/defines nothing new/)
      expect(b.derivation, id).toBeUndefined()
      expect(b.introduces, id).toBeUndefined()
    }
    expect(L12.units.flatMap((u) => u.story ?? []).find((b) => b.id === 'l12-law:b7b')!.text).toMatch(/Lecture 16 uses this law/)
  })
  it('the notes’ φ(p, t) is renamed in one beat only; the 448 notation is kept', () => {
    expect(beat('l16-start:b4').text).toMatch(/The notes call it \$\\phi\(p,t\)\$; here it keeps its name \$\\tilde\\psi\(p,t\)\$/)
    for (const other of beats.filter((x) => x.id !== 'l16-start:b4')) expect(textsOf(other).join(' '), other.id).not.toMatch(/The notes call/)
  })
  it('the two new glossary ids are first used where the plan puts them; spreading-time stays Lecture 15’s (M5) and is only reused', () => {
    expect(GLOSSARY.get('ehrenfest-theorem')!.first).toBe('l16-ehrenfest:b4')
    expect(GLOSSARY.get('chirp')!.first).toBe('l16-spread:b8')
    expect(GLOSSARY.get('spreading-time')!.first).toBe('l15-gaussian:b3')
    expect(beat('l16-evolve:b1').text).toContain('[[spreading-time|spreading time]]')
    expect(beat('l16-ehrenfest:b4').text).toContain('[[ehrenfest-theorem|')
    expect(beat('l16-spread:b8').text).toContain('[[chirp|')
  })
  it('one chip into 709 (undoing dephasing) sits in the Go-deeper beat, and its table row exists', () => {
    const used = beats.flatMap((b) => [...bridgeRefs(b.text), ...bridgeRefs(b.reveal?.text ?? '')])
    expect(used).toEqual(['sl-q24-decoupling'])
    expect(bridgeRefs(beat('l16-spread:b8').text)).toEqual(['sl-q24-decoupling'])
    expect(BRIDGES_448['sl-q24-decoupling']).toMatchObject({ lecture: 'Q24', unit: 'q24-decoupling' })
  })
  it('§16.6 is Lecture 17’s: the lecture says so and ends on the two equations (the average force is not yet the force at the centre)', () => {
    expect(beat('l16-ehrenfest:b4').text).toMatch(/Lecture 17/)
    expect(beat('l16-ehrenfest:b5').text).toMatch(/average force, not yet the force at the centre/)
    expect(beat('l16-ehrenfest:b4').derivation).toBeUndefined()
  })
})

describe('Lecture 16: the Try-its are what the widgets compute', () => {
  it('no unit uses wave-lab; the widgets are the planned stand-ins and the captions say so', () => {
    expect(L16.units.map((u) => u.visual.kind)).toEqual(['complex-plane', 'complex-plane', 'two-clocks', 'bloch'])
    for (const u of L16.units) expect(u.visual.caption, u.id).toMatch(/stand-in/i)
  })
  it('start: multiplying by a number of size one keeps the length of z (0.8) and turns it by −53.13°', () => {
    const z = c(0.8, 0)
    const w = c(0.6, -0.8)
    expect(abs(w)).toBeCloseTo(1, 12)
    expect(abs(mul(z, w))).toBeCloseTo(0.8, 12)
    expect((arg(mul(z, w)) * 180) / Math.PI).toBeCloseTo(-53.1301, 3)
  })
  it('evolve: the factor 1 + iτ at τ = 1 has size √2 and angle 45°, and the widget’s w has size one and angle 45°', () => {
    const f = c(1, 1)
    expect(abs(f)).toBeCloseTo(Math.SQRT2, 12)
    expect((arg(f) * 180) / Math.PI).toBeCloseTo(45, 9)
    expect(unit('l16-evolve').visual.props).toEqual({ mode: 'multiply', z: [1, 0], w: [0.7071, 0.7071] })
    expect(abs(c(0.7071, 0.7071))).toBeCloseTo(1, 4)
  })
  it('spread: with energies 3ε and ε the hands are 60° apart at 30°, and the gap does not depend on the mean energy', () => {
    expect(unit('l16-spread').visual.props).toEqual({ upper: 3, lower: 1, start: '+x' })
    const gap = (levels: { upper: number; lower: number }, deg: number) => (clockHands(levels, KET['+x'], (deg * Math.PI) / 180).gap! * 180) / Math.PI
    expect(gap({ upper: 3, lower: 1 }, 30)).toBeCloseTo(60, 9)
    expect(gap({ upper: 5, lower: 3 }, 30)).toBeCloseTo(60, 9) // the mean energy moved up by 2ε: same gap
  })
  it('ehrenfest: two turns of 30° about z carry |+x⟩ to ⟨σx⟩ = cos 60°, an exactly classical turning of the average arrow', () => {
    expect(unit('l16-ehrenfest').visual.props).toMatchObject({ theta: 90, phi: 0, rotationAngles: [30, 90] })
    const psi = apply(Rz((60 * Math.PI) / 180), KET['+x'])
    expect(expectation(SIGMA_X, psi)).toBeCloseTo(Math.cos((60 * Math.PI) / 180), 12)
  })
})

describe('Lecture 16: the practice questions and the new numbers', () => {
  it('the four practice questions are tagged, name their source, carry full walkthroughs and are not assigned (T1); no homework label appears', () => {
    const qs = L16.units.flatMap((u) => u.play).filter((q) => q.practice)
    expect(qs.map((q) => `${q.id}:${q.practice}`)).toEqual(['l16-pr-width:homework', 'l16-pr-double:townsend', 'l16-pr-quartic:townsend', 'l16-pr-spin:homework'])
    for (const q of qs) {
      expect(q.walkthrough.length, q.id).toBeGreaterThan(1)
      expect(q.hints, q.id).toHaveLength(3)
      expect(q.assigned, q.id).toBeFalsy()
      expect(JSON.stringify(q), q.id).not.toMatch(/\bH\d-\d/)
      if (q.practice === 'townsend') expect(q.refs?.[0].where, q.id).toMatch(/^Problem 6\.\d+/)
    }
    const tol = Object.fromEntries(qs.map((q) => [q.id, q.kind === 'numeric' ? q.tolerance : -1]))
    expect(tol).toEqual({ 'l16-pr-width': 0.005, 'l16-pr-double': 0.01, 'l16-pr-quartic': 0.005, 'l16-pr-spin': 0.005 })
  })
  it('a whole-number answer is a whole number with tolerance 0; a decimal answer uses 0.005 (l16-pr-double, worked with rounded SI constants in its hints, uses 0.01)', () => {
    for (const q of L16.units.flatMap((u) => u.play)) {
      if (q.kind !== 'numeric') continue
      if (Number.isInteger(q.answer)) expect(q.tolerance, q.id).toBe(0)
      else expect(q.tolerance, q.id).toBe(q.id === 'l16-pr-double' ? 0.01 : 0.005)
    }
  })
  it('the numbers: the closed forms agree with the grid, the product grows as √(1 + τ²)/2, the chirp narrows first and returns, the means obey Ehrenfest', () => {
    expect(V.l16FormulaGap).toBeLessThan(1e-8)
    expect(V.l16FormulaT0Gap).toBeLessThan(1e-12)
    expect(V.l16TownsendGap).toBeLessThan(1e-12)
    expect(V.l16ProductTs).toBeCloseTo(Math.SQRT1_2, 9)
    expect(V.l16Product4).toBeCloseTo(Math.sqrt(5) / 2, 9)
    expect(V.l16Dp1 * V.l16FreeSd4 * 2).toBeCloseTo(Math.sqrt(5), 9) // Δp·Δx at t = 4, with Δp = 1/2
    expect(V.l16PeakTs).toBeCloseTo(V.l16Peak0 / Math.SQRT2, 9)
    expect(V.l16DxCross).toBeCloseTo(Math.sqrt(5) / 2, 9)
    expect(V.l16FarRatio).toBeCloseTo(Math.sqrt(101) / 10, 9)
    expect(V.l16ChirpMinWidth).toBeLessThan(1)
    expect(V.l16ChirpDxBack).toBeCloseTo(1, 6)
    expect(V.l16ChirpBackTime).toBeCloseTo(2 * V.l16ChirpFocusTime, 12)
    expect(V.l16EhrenfestDxdt).toBeCloseTo(1.5, 9)
    expect(V.l16EhrenfestFreeGap).toBeLessThan(1e-8)
    expect(V.l16PrQuarticDpdt).toBeCloseTo(-V.l16PrQuarticMean3, 9)
    expect(Math.abs(V.l16PrQuarticDpdt)).toBeGreaterThan(Math.abs(V.l16PrQuarticCentreForce)) // the mean force exceeds the force at the centre
    expect(V.l16PrSpinDZdt).toBeCloseTo(-Math.sin(Math.PI / 4), 9)
    expect(V.l16PrDoubleFs).toBeCloseTo(Math.sqrt(3) * V.l16PrTsFs, 9)
    expect(V.l16PrKinetic).toBeCloseTo(V.l16PrP2 / 2, 9)
  })
  it('the momentum spread and the mean momentum do not change with time (Δp and ⟨p⟩ at t = 0, 4 agree)', () => {
    expect(Math.abs(V.l16DpFixed)).toBeLessThan(1e-12)
    expect(V.l16FreeMeanP4).toBeCloseTo(3, 9)
    expect(Math.abs(V.l16CentreStays)).toBeLessThan(1e-12)
  })
})
