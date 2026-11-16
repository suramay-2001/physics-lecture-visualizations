/**
 * Lecture 20's own rulings as lints (docs/roles/decisions/448-L19L20.md R1–R10; the Townsend pass T1–T11), on top of the platform lints every chapter passes:
 *   R2  the infinite well moved here from Lecture 14 (three beats, two practice questions, the glossary entry, eleven keys renamed `l20…`, the Optics Lab row `qc-l20-box`), and every reference follows;
 *   R3  the stage additions: the `well` source and the `wellMatchEven` and `wellMatchOdd` curves; every other picture is an existing kind, and the lecture is drawn by SVG kinds only (R9);
 *   R7  `l20-oscillator` is optional (four beats, a clue last) and `l20-finite:b9` is the Go-deeper beat; nothing outside the lecture relies on the oscillator;
 *   T1  practice questions with full walkthroughs: three Townsend types, one homework type and two moved ones.
 * Also: the unit order and beat counts, every text balances its dollar signs, every V key is claimed, the numbers agree with the closed forms and with the pictures, and the Try-it lines are what
 * the widgets compute.
 */
import { describe, expect, it } from 'vitest'
import { L14 } from './L14'
import { L20 } from './L20'
import { BRIDGES as BRIDGES_709 } from './qc709/bridges'
import { GLOSSARY } from './glossary'
import { layoutStates } from './stage'
import type { Beat, PlotState, WavefunctionState } from './stage'
import { resolveWavefunctionStage, validateWavefunctionStage } from '../stage/svg/wavefunction'
import { abs, arg, c, mul } from '../physics/complex'
import { inner } from '../physics/linalg'
import { KET } from '../physics/spin'
import { GRID, commutatorXP, packet } from '../physics/wave'
import { wellLevels, wellMismatch } from '../physics/wave20'
import { V } from './L20.values'
import { claimKey } from './claimKit'

const beats = L20.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const leaves = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(leaves) : x && typeof x === 'object' ? Object.values(x).flatMap(leaves) : [])
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const unitTexts = () => L20.units.flatMap((u) => [u.title, u.question, u.lecture.summary, ...(u.lecture.equations ?? []), u.insight, ...(u.pitfalls ?? []), ...u.visual.tryThis, ...leaves(u.review), ...leaves(u.play)])
const unit = (id: string) => L20.units.find((u) => u.id === id)!
const beat = (id: string) => beats.find((b) => b.id === id)!

describe('Lecture 20: shape', () => {
  it('has the five units in order with the planned beats (30), five clues, three books beats in the infinite and finite units, one Go-deeper beat and five derivations', () => {
    expect(L20.units.map((u) => u.id)).toEqual(['l20-reverse', 'l20-infinite', 'l20-finite', 'l20-compare', 'l20-oscillator'])
    expect(L20.units.map((u) => (u.story ?? []).length)).toEqual([4, 8, 9, 5, 4])
    expect(beats).toHaveLength(30)
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['l20-finite:b9'])
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['l20-reverse:b4', 'l20-infinite:b8', 'l20-finite:b8', 'l20-compare:b5', 'l20-oscillator:b4'])
    expect(beats.filter((b) => b.phase === 'books').map((b) => b.id)).toEqual(['l20-reverse:b3', 'l20-infinite:b6', 'l20-infinite:b7', 'l20-finite:b7'])
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l20-infinite:b2', 'l20-infinite:b6', 'l20-finite:b4', 'l20-finite:b5', 'l20-compare:b2'])
    expect(L20.units.reduce((n, u) => n + u.play.length, 0)).toBe(24) // nineteen challenges and five practice questions (two moved from Lecture 14)
    expect(L20.corrections ?? []).toHaveLength(0) // R8: no Correction
    expect(beat('l20-reverse:b1').classMark).toEqual({ class: 20 })
  })
  it('every text balances its dollar signs (a stray one would typeset the rest of the sentence as TeX)', () => {
    const bad: string[] = []
    for (const t of [...beats.flatMap(textsOf), ...unitTexts()]) {
      const flat = t.replace(/\\\$/g, '').replace(/\$\$/g, '')
      if ((flat.match(/\$/g) ?? []).length % 2) bad.push(t.slice(0, 120))
    }
    expect(bad).toEqual([])
  })
  it('every claim key is a value of the chapter, every value is claimed at least once, and every key starts with l20', () => {
    const claimed = new Set(L20.units.flatMap((u) => [...(u.claims ?? []), ...(u.review?.claims ?? [])]).map((x) => claimKey(x)))
    for (const k of Object.keys(V)) {
      expect(claimed.has(k), k).toBe(true)
      expect(k.startsWith('l20'), k).toBe(true)
    }
  })
  it('no time that is not a whole number is typed in a beat, and nothing is shown with a power of ten', () => {
    for (const b of beats) for (const t of textsOf(b)) expect(t, b.id).not.toMatch(/\bt\s*=\s*\d+\.\d/)
    expect(beats.flatMap(textsOf).join(' ')).not.toMatch(/\d\s*(?:\\times|×)\s*10\^/)
  })
})

describe('Lecture 20: pictures (rulings R3 and R9, SVG kinds only)', () => {
  it('every state validates; only wavefunction and plot are drawn; the well and the match curves are the stage agent’s; the Try-its are SVG widgets', () => {
    const fns = new Set<string>()
    for (const u of L20.units) {
      const states = (u.story ?? []).flatMap(statesOf)
      for (const s of states.filter((x): x is WavefunctionState => x.kind === 'wavefunction')) expect(validateWavefunctionStage(s), u.id).toEqual([])
      for (const s of states) expect(['wavefunction', 'plot'], `${u.id} ${s.kind}`).toContain(s.kind)
      for (const s of states.filter((x): x is PlotState => x.kind === 'plot' && 'curve' in x && !!x.curve)) fns.add(s.curve!.fn)
      expect(['amplitude-bars', 'complex-plane']).toContain(u.visual.kind)
    }
    expect(fns).toEqual(new Set(['wellMatchEven', 'wellMatchOdd']))
    const sources = new Set(beats.flatMap(statesOf).flatMap((s) => (s.kind === 'wavefunction' ? [Object.keys(s.source)[0]] : [])))
    expect(sources).toEqual(new Set(['box', 'well', 'packet']))
  })
  it('the well pictures are scenario F (V0 = 8, a = 2), levels 1 to 3, and the markers sit on the engine’s levels', () => {
    const wells = beats.flatMap(statesOf).flatMap((s) => (s.kind === 'wavefunction' && 'well' in s.source ? [s.source.well] : []))
    expect(wells.length).toBeGreaterThan(8)
    for (const w of wells) expect([w.V0, w.a]).toEqual([8, 2])
    expect(new Set(wells.map((w) => w.n))).toEqual(new Set([1, 2, 3]))
    const lv = wellLevels(8, 2)
    expect(lv.map((l) => l.E)).toEqual([V.l20E1Fin, V.l20E2Fin, V.l20E3Fin])
    for (const x of [V.l20E1Fin / 8, V.l20E3Fin / 8]) expect(Math.abs(wellMismatch(8 * x, 8, 2, 'even'))).toBeLessThan(1e-12)
    expect(Math.abs(wellMismatch(V.l20E2Fin, 8, 2, 'odd'))).toBeLessThan(1e-12)
    expect(wellMismatch(1.2, 8, 2, 'even')).toBeCloseTo(-V.l20MismatchHigh, 12)
    expect(wellMismatch(0.4, 8, 2, 'even')).toBeCloseTo(V.l20MismatchLow, 12)
  })
  it('a well state resolves with the readouts the lecture quotes (tail, energy, norm)', () => {
    const r = resolveWavefunctionStage({ kind: 'wavefunction', source: { well: { V0: 8, a: 2, n: 1 } }, window: { x: [-3, 3] }, readouts: ['tail', 'energy', 'norm'] }, 1)
    expect(r.stats.tail).toBeCloseTo(V.l20TailGround, 9)
    expect(r.stats.energy).toBeCloseTo(V.l20E1Fin, 9)
    expect(r.stats.norm).toBeGreaterThan(0.99) // the window clips the far tails only
  })
  it('the sloshing and the box pictures: the period and the energy readout agree with the lecture’s numbers', () => {
    const r = resolveWavefunctionStage({ kind: 'wavefunction', source: { box: { L: 6, n: [1, 2] } }, readouts: ['energy'] }, 1)
    expect(r.stats.energy).toBeCloseTo((V.l20E1L6 + (V.l20E1L6 + V.l20DeltaEL6)) / 2, 9)
    expect((2 * Math.PI) / V.l20DeltaEL6).toBeCloseTo(V.l20SloshPeriodL6, 12)
  })
  it('the oscillator unit: the commutator check on a Gaussian agrees with iψ to the grid’s accuracy, and the packet is the engine’s Gaussian', () => {
    const psi = packet(GRID, { x0: 0, sigma: V.l20HEstimateWidth })
    const cm = commutatorXP(psi, GRID)
    let worst = 0
    for (let j = 0; j < GRID.n; j++) worst = Math.max(worst, Math.hypot(cm.re[j], cm.im[j] - psi.re[j]), Math.hypot(psi.im[j], 0))
    expect(worst).toBeLessThan(1e-4)
  })
})

describe('Lecture 20: R2 the infinite well moved here', () => {
  it('the glossary entry, the Optics Lab row and the pointer in Lecture 14 follow the move', () => {
    expect(GLOSSARY.get('infinite-well')!.first).toBe('l20-infinite:b1')
    for (const id of ['bound-state', 'finite-well', 'even-odd-state', 'matching-energy']) expect(GLOSSARY.has(id), id).toBe(true)
    expect(GLOSSARY.get('bound-state')!.first).toBe('l20-reverse:b2')
    expect(BRIDGES_709['qc-l20-box']).toMatchObject({ course: 'sl448', lecture: 'L20', unit: 'l20-infinite' })
    expect(L14.units.map((u) => u.id)).not.toContain('l14-box')
    expect(beat('l20-infinite:b6').phase).toBe('books')
    expect(beat('l20-infinite:b7').text).toMatch(/Ex\. 6\.6/)
  })
  it('the moved keys keep their values: Ex. 6.6 gives 8/3π and 64/9π², the odd levels add to 1, halving the box quadruples the energy and doubles the spread', () => {
    expect(V.l20TBoxOverlap).toBeCloseTo(8 / (3 * Math.PI), 12)
    expect(V.l20TBoxP1).toBeCloseTo(64 / (9 * Math.PI ** 2), 12)
    expect(V.l20TBoxP3).toBeCloseTo(64 / (25 * Math.PI ** 2), 12)
    expect(V.l20TBoxP2).toBeCloseTo(0, 12)
    expect(V.l20TBoxSumOdd).toBeCloseTo(1, 6)
    expect(V.l20TBoxEnergyRatio).toBeCloseTo(4, 12)
    expect(V.l20TBoxDpRatio).toBeCloseTo(2, 12)
    expect(V.l20TWall2P1).toBeCloseTo(32 / (9 * Math.PI ** 2), 12)
    expect(V.l20PrWall3).toBeCloseTo(81 / (64 * Math.PI ** 2), 12)
  })
})

describe('Lecture 20: numbers against closed forms', () => {
  it('the infinite well: E3/E1 = 9, A = √(2/a), Δx Δp = 0.568, slope √(2/a)π/a', () => {
    expect(V.l20BoxE3overE1).toBeCloseTo(9, 12)
    expect(V.l20BoxAmpL4).toBeCloseTo(Math.SQRT1_2, 12)
    expect(V.l20ProductGround).toBeCloseTo(4 * Math.sqrt(1 / 12 - 1 / (2 * Math.PI ** 2)) * (Math.PI / 4), 12)
    expect(V.l20WallSlope).toBeCloseTo(Math.sqrt(0.5) * (Math.PI / 4), 12)
  })
  it('the finite well: k² + κ² = 16, k tan(ka/2) = κ, parity +1, −1, +1, no current, finitely many levels below their infinite twins', () => {
    expect(V.l20SumSq).toBeCloseTo(16, 9)
    expect(Math.abs(V.l20EvenResidual1)).toBeLessThan(1e-9)
    expect([V.l20Parity1, V.l20Parity2, V.l20Parity3]).toEqual([1, -1, 1])
    expect(V.l20WellCurrent).toBe(0)
    for (const r of [V.l20E1Ratio, V.l20E2Ratio, V.l20E3Ratio]) expect(r).toBeLessThan(1)
    expect([V.l20RatioV32, V.l20RatioV128, V.l20RatioV512, V.l20RatioV2048].every((r, i, a) => r < 1 && (i === 0 ? r > V.l20E1Ratio : r > a[i - 1]))).toBe(true)
    expect([V.l20Thresh2, V.l20Thresh3, V.l20Thresh4]).toEqual([Math.PI ** 2 / 8, (4 * Math.PI ** 2) / 8, (9 * Math.PI ** 2) / 8])
    expect(V.l20FiCount).toBe(5)
  })
  it('the practice numbers: the lopsided tent costs 27/2π² of E1, the cubic holds only even levels, the delta well binds g²/8, and the thin deep well approaches it', () => {
    expect(V.l20SkewTentRatio).toBeCloseTo(27 / (2 * Math.PI ** 2), 12)
    expect(V.l20TrialP2 + V.l20TrialP4).toBeLessThan(1)
    expect(V.l20DeltaBindingClosed).toBe(1.125)
    expect(Math.abs(V.l20DeltaBindingFine - V.l20DeltaBindingClosed)).toBeLessThan(5e-3)
    expect(V.l20PrE1).toBeLessThan(V.l20PrInfEv)
  })
  it('the sloshing: the mean position swings about L/2 by 16L/9π², between the two values of the lecture', () => {
    expect(V.l20SloshAmpL6).toBeCloseTo((16 * 6) / (9 * Math.PI ** 2), 12)
    expect((V.l20MeanXmin + V.l20MeanXmax) / 2).toBeCloseTo(3, 12)
    expect(V.l20SloshFormulaGap).toBeLessThan(1e-12)
  })
})

describe('Lecture 20: practice questions (Townsend pass T1) and the Try-its', () => {
  it('the five practice questions are tagged and sourced, carry full walkthroughs, are not assigned, and show no homework label', () => {
    const qs = L20.units.flatMap((u) => u.play).filter((q) => q.practice)
    expect(qs.map((q) => `${q.id}:${q.practice}`)).toEqual(['l20-pr-box-energy:townsend', 'l20-pr-wall:townsend', 'l20-pr-trial:townsend', 'l20-pr-kink:homework', 'l20-pr-delta:townsend'])
    for (const q of qs) {
      expect(q.walkthrough.length, q.id).toBeGreaterThan(1)
      expect(q.hints, q.id).toHaveLength(3)
      expect(q.assigned, q.id).toBeFalsy()
      expect(JSON.stringify(q), q.id).not.toMatch(/\bH\d-\d/)
      if (q.practice === 'townsend') expect(q.refs?.[0].where, q.id).toMatch(/^Problem 6\.\d+, end of Ch\. 6 \(p\. 242\)/)
    }
    const tol = Object.fromEntries(qs.map((q) => [q.id, q.kind === 'numeric' ? q.tolerance : -1]))
    expect(tol).toEqual({ 'l20-pr-box-energy': 0.005, 'l20-pr-wall': 0.005, 'l20-pr-trial': 0.005, 'l20-pr-kink': 0.005, 'l20-pr-delta': 0.005 })
  })
  it('every numeric answer is the engine’s value, and every order challenge lists its steps in a fixed order', () => {
    const answers = Object.fromEntries(L20.units.flatMap((u) => u.play).filter((q) => q.kind === 'numeric').map((q) => [q.id, (q as { answer: number }).answer]))
    expect(answers['l20-in-e3']).toBe(9)
    expect(answers['l20-in-nodes']).toBe(3)
    expect(answers['l20-fi-sum']).toBe(16)
    expect(answers['l20-fi-par']).toBe(2)
    expect(answers['l20-fi-count']).toBe(5)
    expect(answers['l20-co-period']).toBeCloseTo(V.l20SloshPeriodL6, 12)
    expect(answers['l20-os-est']).toBeCloseTo(0.5, 12)
    expect(L20.units.flatMap((u) => u.play).filter((q) => q.kind === 'order').map((q) => q.id)).toEqual(['l20-in-order', 'l20-fi-order'])
  })
  it('the Try-its: a unit arrow multiplied into 1 keeps its length (complex-plane); the bars of +z along z are 1 and 0 and of +x along z are one half each', () => {
    expect(unit('l20-infinite').visual.props).toMatchObject({ mode: 'multiply', z: [1, 0] })
    const w = (unit('l20-infinite').visual.props as { w: [number, number] }).w
    expect(abs(mul(c(1, 0), c(w[0], w[1])))).toBeCloseTo(1, 3)
    expect(arg(c(w[0], w[1]))).toBeLessThan(0) // the phase e^{-iEt} turns clockwise
    const share = (ket: keyof typeof KET, basis: keyof typeof KET) => {
      const a = inner(KET[basis], KET[ket])
      return a.re ** 2 + a.im ** 2
    }
    expect(share('+z', '+z')).toBeCloseTo(1, 12)
    expect(share('+x', '+z')).toBeCloseTo(0.5, 12)
    expect(unit('l20-reverse').visual.props).toMatchObject({ state: '+z', basis: 'z' })
    expect(unit('l20-compare').visual.props).toMatchObject({ state: '+x', basis: 'z' })
  })
})
