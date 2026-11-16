/**
 * Lecture 19's own rulings as lints (docs/roles/decisions/448-L19L20.md R1–R10; the Townsend pass T1–T11; docs/roles/decisions/448-L14L18.md M1–M7), on top of the platform lints every chapter passes:
 *   R1  the barrier result stays in Lecture 18: L19 links back (no second derivation of the App. A route) and cites the shared numbers under their L18 keys;
 *   R3  the stage source `barrierWave` draws the stationary state, and its readouts are the numbers the lecture quotes; every other picture is a packet run, a plot or a complex-plane stand-in;
 *   R6  Townsend Problem 6.21 and the p. 231 estimate are cited, Problem 6.23 only for the width question, and the microscope question carries no problem number of its own;
 *   R7  alpha decay is a labelled model; `l19-energy:b5` is the one Go-deeper beat;
 *   R8  the notes' t is τ (one Rosetta line), Townsend's F, G, C are our A, B, τ and his q our κ;
 *   T1  three practice questions with full walkthroughs.
 * Also: the unit order and beat counts, every text balances its dollar signs, every V key is claimed, the numbers agree with the closed forms and with the pictures, and the Try-it lines are what the widgets compute.
 */
import { describe, expect, it } from 'vitest'
import { L19 } from './L19'
import { BRIDGES_448 } from './bridges448'
import { GLOSSARY } from './glossary'
import { layoutStates } from './stage'
import type { Beat } from './stage'
import { bridgeRefs } from './walk'
import { arg, c, mul } from '../physics/complex'
import { barrierT, barrierThick } from '../physics/scatter'
import { transmissionAmplitude } from '../physics/wave19'
import { resolve, validateStage } from '../stage/resolve'
import type { ResolvedWavefunction } from '../stage/types'
import '../stage/svg/kinds'
import { V } from './L19.values'
import { V as V18 } from './L18.values'
import { claimKey } from './claimKit'

const beats = L19.units.flatMap((u) => u.story ?? [])
const beat = (id: string) => beats.find((b) => b.id === id)!
const unit = (id: string) => L19.units.find((u) => u.id === id)!
const statesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const leaves = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(leaves) : x && typeof x === 'object' ? Object.values(x).flatMap(leaves) : [])
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const unitTexts = () => L19.units.flatMap((u) => [u.title, u.question, u.lecture.summary, ...(u.lecture.equations ?? []), u.insight, ...(u.pitfalls ?? []), ...u.visual.tryThis, ...leaves(u.review), ...leaves(u.play)])

describe('Lecture 19: shape', () => {
  it('has the five units in order with the planned beats (25), four clues, three books beats, one Go-deeper beat and two derivations', () => {
    expect(L19.units.map((u) => u.id)).toEqual(['l19-recap', 'l19-regions', 'l19-match', 'l19-thick', 'l19-energy'])
    expect(L19.units.map((u) => (u.story ?? []).length)).toEqual([3, 3, 7, 7, 5])
    expect(beats).toHaveLength(25)
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['l19-recap:b3', 'l19-regions:b3', 'l19-match:b7', 'l19-thick:b7'])
    expect(beats.filter((b) => b.phase === 'books').map((b) => b.id)).toEqual(['l19-match:b6', 'l19-thick:b6', 'l19-energy:b4'])
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['l19-energy:b5'])
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l19-match:b3', 'l19-thick:b1'])
    expect(L19.units.map((u) => u.play.length)).toEqual([2, 2, 4, 6, 5])
    expect(L19.corrections ?? []).toHaveLength(0) // R8: no Correction
  })
  it('every text balances its dollar signs (a stray one would typeset the rest of the sentence as TeX)', () => {
    const bad: string[] = []
    for (const t of [...beats.flatMap(textsOf), ...unitTexts()]) {
      const flat = t.replace(/\\\$/g, '').replace(/\$\$/g, '')
      if ((flat.match(/\$/g) ?? []).length % 2) bad.push(t.slice(0, 120))
    }
    expect(bad).toEqual([])
  })
  it('every value of the chapter is claimed at least once, every key starts with l19, and the shared numbers carry their L18 keys (R1: no l19T1)', () => {
    const claimed = new Set(L19.units.flatMap((u) => [...(u.claims ?? []), ...(u.review?.claims ?? [])]).map((c) => claimKey(c)))
    for (const k of Object.keys(V)) {
      expect(claimed.has(k), k).toBe(true)
      expect(k.startsWith('l19'), k).toBe(true)
    }
    expect(Object.keys(V)).not.toContain('l19T1')
    for (const k of ['l18BarrierT1', 'l18BarrierInnerCurrent', 'l18TEV0T', 'l18ThickAtZero', 'l18BarrierT2', 'l18BarrierT3']) expect(claimed.has(k), k).toBe(true)
  })
})

describe('Lecture 19: pictures (rulings R3 and R9, SVG kinds only)', () => {
  it('every state validates; only wavefunction, plot and complex-plane are drawn; the plot curves are the existing barrier curves', () => {
    for (const b of beats)
      for (const s of statesOf(b)) {
        expect(validateStage(s), `${b.id}: ${s.kind}`).toEqual([])
        expect(['wavefunction', 'plot', 'complex-plane'], b.id).toContain(s.kind)
        if (s.kind === 'plot') expect(['barrierT', 'barrierThick'], b.id).toContain(s.curve?.fn)
      }
    for (const u of L19.units) expect(['amplitude-bars', 'complex-plane'], u.id).toContain(u.visual.kind)
  })
  it('every beat that draws the stationary state cites its fidelity item, and every beat that runs a packet in a potential cites the split-step one', () => {
    for (const b of beats) {
      const kinds = statesOf(b).filter((s) => s.kind === 'wavefunction') as { source: Record<string, unknown>; potential?: unknown }[]
      if (kinds.some((s) => 'barrierWave' in s.source) && !beat(b.id).derivation) expect(b.fidelity ?? b.reveal?.fidelity ?? [], b.id).toContain('wavefunction-barrier-stationary')
      if (kinds.some((s) => s.potential) && b.phase === 'lecture') expect(b.fidelity ?? [], b.id).toContain('wavefunction-potential-splitstep')
    }
  })
  it('the readouts of the stationary scenes are the numbers the lecture quotes: R and T for κa = 1, T for κa = 2, and a thousandth below the top', () => {
    const at = (E: number, V0: number, a: number) => resolve({ kind: 'wavefunction', source: { barrierWave: { E, V0, a } }, readouts: ['reflection', 'transmission'] }, 1) as ResolvedWavefunction
    expect(at(2, 4, 0.5).stats.reflection).toBeCloseTo(V.l19R1, 12)
    expect(at(2, 4, 0.5).stats.transmission).toBeCloseTo(V18.l18BarrierT1, 12)
    expect(at(2, 4, 1).stats.transmission).toBeCloseTo(V18.l18BarrierT2, 12)
    expect(at(1.998, 2, 1).stats.transmission).toBeCloseTo(V.l19LimitT999, 12)
  })
})

describe('Lecture 19: the numbers agree with the closed forms (R1, R4)', () => {
  it('both routes give one T: the direct elimination, the route of Unit 18.4, the notes’ form and Townsend’s; and for k = κ the amplitude is e^{−ika}/cosh κa', () => {
    expect(V.l19L18Route).toBeCloseTo(V18.l18BarrierT1, 12)
    expect(V.l19AbsT ** 2).toBeCloseTo(V18.l18BarrierT1, 12)
    expect(V.l19AbsT).toBeCloseTo(1 / Math.cosh(1), 12)
    const t = transmissionAmplitude(2, 4, 0.5)
    expect(arg(t.tau)).toBeCloseTo(-1, 12) // −ka for k = 2, a = ½
    expect(V.l19R1 + V18.l18BarrierT1).toBeCloseTo(1, 12)
    expect(V.l19CurrentLeft).toBeCloseTo(V18.l18BarrierInnerCurrent, 12) // one current everywhere (the L18 inner current)
  })
  it('thick barrier: exact over thick is 0.964 and 0.995; doubling κa from 1.5 to 3 multiplies T by 0.0546, not one half; the exponent is 2κ', () => {
    const ratio = (qa: number) => barrierT(2, 4, qa / 2) / barrierThick(2, 4, qa / 2)
    expect(V.l19ThickRatio2).toBeCloseTo(ratio(2), 12)
    expect(V.l19ThickRatio3).toBeCloseTo(ratio(3), 12)
    expect(V.l19DoubleFactor).toBeCloseTo(barrierT(2, 4, 1.5) / barrierT(2, 4, 0.75), 12)
    expect(V.l19DoubleFactor).toBeLessThan(0.5)
    expect(V.l19LogSlopeMag).toBeCloseTo(V.l19TwoKappa, 1)
  })
  it('the thick form is wrong near the top and at zero width, the exact one is not: ½ at E = V₀ with ka = 2, and 1 at a → 0', () => {
    expect(V.l19LimitT).toBeCloseTo(0.5, 8)
    expect(Math.abs(V.l19LimitT999 - 0.5)).toBeLessThan(1e-3)
    expect(V18.l18ThickAtZero).toBe(4)
    expect(barrierT(2, 4, 1e-9)).toBeCloseTo(1, 9)
  })
  it('mass: κ of the proton over the electron is √(m_p/m_e); the electron passes with 0.7775 and the proton with about 10^−18.47', () => {
    expect(V.l19MassKappaRatio).toBeCloseTo(Math.sqrt(1836.15267343), 3)
    expect(V.l19TElectron).toBeGreaterThan(0.77)
    expect(V.l19TProtonLog10Mag).toBeGreaterThan(18)
    expect(V.l19TProtonLog10Mag).toBeLessThan(19)
  })
  it('examples: the microscope’s factor by the exact formula and the thick one agree to 1e-4; the alpha model’s exponents give 19.5 decades; the delta limit tends to 0.64 from below', () => {
    expect(Math.abs(V.l19StmFactorExact - V.l19StmFactorThick)).toBeLessThan(1e-4)
    expect(V.l19StmFactorThick).toBeCloseTo(Math.exp(-2 * V.l19StmKappa), 6)
    expect(V.l19GamowFactor10).toBeCloseTo((V.l19Gamow4 - V.l19Gamow8) / Math.LN10, 12)
    expect(V.l19DeltaTw1).toBeLessThan(V.l19DeltaTw2)
    expect(V.l19DeltaTw2).toBeLessThan(V.l19DeltaTw3)
    expect(V.l19DeltaTw3).toBeLessThan(V.l19DeltaTexact)
    expect(V.l19IncMeanKin).toBeGreaterThan(V.l19ReflKinMean)
    expect(V.l19TransKinMean).toBeGreaterThan(V.l19IncMeanKin)
  })
})

describe('Lecture 19: link-backs, notation, glossary and bridges', () => {
  it('Unit 18.1 and Unit 18.4 are recalled in l19-recap:b1 and l19-match:b1, which name them and carry no derivation; the route of Unit 18.4 is not derived again', () => {
    for (const [id, unitName] of [['l19-recap:b1', 'Unit 18.1'], ['l19-match:b1', 'Unit 18.4']] as const) {
      expect(beat(id).text, id).toContain(unitName)
      expect(beat(id).text, id).toMatch(/defines nothing new/)
      expect(beat(id).derivation, id).toBeUndefined()
    }
    for (const b of beats) expect(b.derivation ? textsOf(b).join(' ') : '', b.id).not.toMatch(/\\varphi\(a\) = F/)
  })
  it('the notes’ t is renamed in one beat only; Townsend’s F, G and C and his q are named once, in the books beat', () => {
    expect(beat('l19-regions:b2').text).toMatch(/The notes write \$t\$ for the amplitude \$\\tau\$, but here \$t\$ is time\./)
    for (const other of beats.filter((x) => x.id !== 'l19-regions:b2')) expect(textsOf(other).join(' '), other.id).not.toMatch(/The notes write \$t\$/)
    expect(beat('l19-match:b6').text).toMatch(/His \$F\$, \$G\$ and \$C\$ are our \$A\$, \$B\$ and \$\\tau\$/)
    expect(beat('l19-match:b6').text).toMatch(/his \$q\$ is our \$\\kappa\$/)
  })
  it('the four new glossary ids are first used where the plan puts them; the reused ones are tagged where the lecture uses them', () => {
    const first: Record<string, string> = { 'matching-conditions': 'l19-match:b1', 'thick-barrier': 'l19-thick:b2', 'scanning-tunnelling-microscope': 'l19-energy:b2', 'alpha-decay': 'l19-energy:b3' }
    for (const [id, at] of Object.entries(first)) {
      expect(GLOSSARY.get(id)!.first).toBe(at)
      expect(beat(at).text, id).toContain(`[[${id}|`)
      expect(GLOSSARY.get(id)!.gloss.split(/\s+/).length, id).toBeLessThanOrEqual(25)
    }
    expect(beat('l19-recap:b2').text).toContain('[[tunnelling|')
    expect(beat('l19-regions:b2').text).toContain('[[reflection-amplitude|')
  })
  it('one chip into 709 (Cooper pairs tunnelling) sits in the microscope beat, a second use of the existing row', () => {
    const used = beats.flatMap((b) => [...bridgeRefs(b.text), ...bridgeRefs(b.reveal?.text ?? '')])
    expect(used).toEqual(['sl-q27-josephson'])
    expect(bridgeRefs(beat('l19-energy:b2').text)).toEqual(['sl-q27-josephson'])
    expect(BRIDGES_448['sl-q27-josephson']).toBeDefined()
  })
  it('alpha decay is a labelled model with no reported half-life (T4)', () => {
    expect(beat('l19-energy:b3').text).toMatch(/a model, not a fit/)
    expect(beat('l19-energy:b3').text).toMatch(/predicts no half-lives/)
  })
})

describe('Lecture 19: the Try-its are what the widgets compute', () => {
  it('the stand-ins are named as such, and no unit uses wave-lab', () => {
    expect(L19.units.map((u) => u.visual.kind)).toEqual(['amplitude-bars', 'complex-plane', 'complex-plane', 'amplitude-bars', 'amplitude-bars'])
    for (const u of L19.units) expect(u.visual.caption, u.id).toMatch(/stand-in/i)
  })
  it('regions: multiplying 1 by e^{i} gives a number of length 1 turned by about 57° (a turn with no growth)', () => {
    const w = unit('l19-regions').visual.props as { z: [number, number]; w: [number, number] }
    const p = mul(c(...w.z), c(...w.w))
    expect(Math.hypot(p.re, p.im)).toBeCloseTo(1, 3)
    expect((arg(p) * 180) / Math.PI).toBeCloseTo(57.3, 1)
  })
  it('match: the product is τ for κa = 1 with k = κ: length 0.648 and angle −57.3°', () => {
    const w = unit('l19-match').visual.props as { z: [number, number]; w: [number, number] }
    const p = mul(c(...w.z), c(...w.w))
    expect(Math.hypot(p.re, p.im)).toBeCloseTo(V.l19AbsT, 3)
    expect((arg(p) * 180) / Math.PI).toBeCloseTo(-V.l19PhaseTMag, 1)
  })
})

describe('Lecture 19: the practice questions and the numbers', () => {
  it('three practice questions, all Townsend-type, with full walkthroughs, none assigned (HW8 is submitted, R5)', () => {
    const practice = L19.units.flatMap((u) => u.play).filter((p) => p.practice)
    expect(practice.map((p) => p.id)).toEqual(['l19-pr-width', 'l19-pr-delta', 'l19-pr-stm'])
    for (const p of practice) {
      expect(p.practice, p.id).toBe('townsend')
      expect(p.walkthrough.length, p.id).toBeGreaterThanOrEqual(2)
      expect(p.refs?.length, p.id).toBeGreaterThan(0)
    }
    expect(JSON.stringify(L19)).not.toMatch(/"practice":"homework"/)
  })
  it('the problem citations follow the page images: 6.21 is the delta barrier, 6.23 is the width question, and the microscope question carries no problem number', () => {
    const play = (id: string) => L19.units.flatMap((u) => u.play).find((p) => p.id === id)!
    expect(play('l19-pr-delta').refs![0].where).toMatch(/Problem 6\.21/)
    expect(play('l19-pr-width').refs![0].where).toMatch(/Problem 6\.23/)
    expect(play('l19-pr-stm').refs![0].where).not.toMatch(/6\.\d\d/)
  })
  it('the practice numbers: the delta barrier transmits 0.590, the width for T = 1 % is 2.911 Å, a gap half an ångström wider cuts the current to 0.3144', () => {
    expect(V.l19PrDelta).toBeCloseTo(1 / (1 + 6.25 / 9), 12)
    expect(V.l19PrWidth).toBeGreaterThan(2.9)
    expect(V.l19PrWidth).toBeLessThan(2.92)
    expect(V.l19PrStm).toBeCloseTo(Math.exp(-2 * Math.sqrt(5.1 / 3.80998) * 0.5), 4)
  })
  it('a whole-number answer is a whole number with tolerance 0; decimals use 0.005 but for the larger ones (|B/A|, the width, the phase, the mass ratio, the decades)', () => {
    for (const p of L19.units.flatMap((u) => u.play)) {
      if (p.kind !== 'numeric') continue
      if (Number.isInteger(p.answer)) expect(p.tolerance, p.id).toBe(0)
      else expect(p.tolerance, p.id).toBeLessThanOrEqual(0.05)
    }
  })
})
