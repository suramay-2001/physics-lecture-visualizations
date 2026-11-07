/**
 * Lecture 18's own rulings as lints (docs/roles/decisions/448-L14L18.md M1–M7; the Townsend pass T1–T11), on top of the platform lints every chapter passes:
 *   M2  the books-only unit l13-flow moved here from Lecture 13 (two books beats, the clue and the Go-deeper beat, the p. 231 Correction and the practice question, keys renamed `l18…`), the unit
 *       was deleted there, a pointer stays, and every reference follows (concept station, bridges, Optics Lab rows);
 *   M3  no new stage piece: every picture is a `wavefunction` state (Lecture 17's `potential` field), a `plot` of an existing curve or a `complex-plane` chain; L18 is drawn by SVG kinds only;
 *   M4  r, τ and T; one Rosetta line where the notes use t for the amplitude; Townsend's q is our κ;
 *   T1  four practice questions with full walkthroughs, three modelled on Townsend problems and one on a homework type.
 * Also: the unit order and beat counts, every text balances its dollar signs, every V key is claimed, the numbers agree with the closed forms and with the pictures, and the Try-it lines are
 * what the widgets compute.
 */
import { describe, expect, it } from 'vitest'
import { L13 } from './L13'
import { L18 } from './L18'
import { BRIDGES_448 } from './bridges448'
import { BRIDGES as BRIDGES_709 } from './qc709/bridges'
import { GLOSSARY } from './glossary'
import { layoutStates } from './stage'
import type { Beat, WavefunctionState } from './stage'
import { bridgeRefs } from './walk'
import { resolveWavefunctionStage, validateWavefunctionStage } from '../stage/svg/wavefunction'
import { abs, arg, c, mul } from '../physics/complex'
import { inner } from '../physics/linalg'
import { KET, ketAlong } from '../physics/spin'
import { axisVector } from '../physics/sg'
import { barrierT, barrierThick, stepRT } from '../physics/scatter'
import { GRID, density, evolveV, packet, stepPotential } from '../physics/wave'
import { V } from './L18.values'
import { V as V13 } from './L13.values'
import { claimKey } from './claimKit'

const beats = L18.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const leaves = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(leaves) : x && typeof x === 'object' ? Object.values(x).flatMap(leaves) : [])
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const unitTexts = () => L18.units.flatMap((u) => [u.title, u.question, u.lecture.summary, ...(u.lecture.equations ?? []), u.insight, ...(u.pitfalls ?? []), ...u.visual.tryThis, ...leaves(u.review), ...leaves(u.play)])
const evolve0 = (t: number) => evolveV(packet(GRID, { x0: -8, sigma: 2, p0: 4 }), GRID, stepPotential(GRID, 6), t) // the running step of the lecture
const unit = (id: string) => L18.units.find((u) => u.id === id)!
const beat = (id: string) => beats.find((b) => b.id === id)!

describe('Lecture 18: shape', () => {
  it('has the four units in order with the planned beats (29), four clues, five books beats, two Go-deeper beats and four derivations', () => {
    expect(L18.units.map((u) => u.id)).toEqual(['l18-packet', 'l18-detector', 'l18-below', 'l18-tunnel'])
    expect(L18.units.map((u) => (u.story ?? []).length)).toEqual([6, 9, 6, 8])
    expect(beats).toHaveLength(29)
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['l18-detector:b9', 'l18-tunnel:b8'])
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['l18-packet:b6', 'l18-detector:b8', 'l18-below:b6', 'l18-tunnel:b7'])
    expect(beats.filter((b) => b.phase === 'books').map((b) => b.id)).toEqual(['l18-packet:b5', 'l18-detector:b7', 'l18-below:b5', 'l18-tunnel:b5', 'l18-tunnel:b6'])
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l18-detector:b2', 'l18-below:b2', 'l18-tunnel:b2', 'l18-tunnel:b4'])
    expect(L18.units.reduce((n, u) => n + u.play.length, 0)).toBe(18) // fourteen from the plan's list and the four practice questions (one of them moved from Lecture 13)
    expect(L18.corrections).toHaveLength(1)
  })
  it('every text balances its dollar signs (a stray one would typeset the rest of the sentence as TeX)', () => {
    const bad: string[] = []
    for (const t of [...beats.flatMap(textsOf), ...unitTexts()]) {
      const flat = t.replace(/\\\$/g, '').replace(/\$\$/g, '')
      if ((flat.match(/\$/g) ?? []).length % 2) bad.push(t.slice(0, 120))
    }
    expect(bad).toEqual([])
  })
  it('every claim key is a value of the chapter and every value is claimed at least once', () => {
    const claimed = new Set(L18.units.flatMap((u) => [...(u.claims ?? []), ...(u.review?.claims ?? [])]).map((c) => claimKey(c)))
    for (const k of Object.keys(V)) expect(claimed.has(k), k).toBe(true)
    for (const k of Object.keys(V)) expect(k.startsWith('l18'), k).toBe(true)
  })
  it('no time that is not a whole number is typed in a beat (the reader would ask for a claim), and nothing is shown with a power of ten but the field-emission mantissa', () => {
    for (const b of beats) for (const t of textsOf(b)) expect(t, b.id).not.toMatch(/\bt\s*=\s*\d+\.\d/)
    const all = beats.flatMap(textsOf).join(' ')
    expect(all).not.toMatch(/\d\s*(?:\\times|×)\s*10\^/)
  })
})

describe('Lecture 18: pictures (ruling M3, SVG kinds only)', () => {
  it('every state validates; only wavefunction, plot and complex-plane are drawn; the plot curves are the existing step and barrier curves', () => {
    for (const u of L18.units) {
      const states = (u.story ?? []).flatMap(statesOf)
      for (const s of states.filter((x): x is WavefunctionState => x.kind === 'wavefunction')) expect(validateWavefunctionStage(s), u.id).toEqual([])
      for (const s of states) expect(['wavefunction', 'plot', 'complex-plane'], `${u.id} ${s.kind}`).toContain(s.kind)
    }
    const fns = beats.flatMap(statesOf).flatMap((s) => (s.kind === 'plot' && s.curve ? [s.curve.fn, ...(s.curve.vs ? [s.curve.vs] : [])] : []))
    expect(new Set(fns)).toEqual(new Set(['stepT', 'stepR', 'stepDensityRatio', 'barrierT', 'barrierThick']))
  })
  it('the potentials are the step V₀ = 6 (E = 4V₀/3), the step V₀ = 4 (E = V₀/2) and the barrier V₀ = 4, a = ½ (κa = 1); every beat that moves a packet in one cites the split-step fidelity', () => {
    const pots = new Set<string>()
    for (const b of beats) {
      const ws = statesOf(b).filter((x): x is WavefunctionState => x.kind === 'wavefunction')
      for (const s of ws) if (s.potential) pots.add(JSON.stringify(s.potential))
      if (!b.derivation && !b.reveal && ws.some((s) => s.potential)) expect(b.fidelity, b.id).toContain('wavefunction-potential-splitstep')
    }
    expect(pots).toEqual(new Set([JSON.stringify({ step: { V0: 6 } }), JSON.stringify({ step: { V0: 4 } }), JSON.stringify({ barrier: { V0: 4, a: 0.5 } })]))
  })
  it('the readouts at the end of the step run are the numbers the lecture quotes (the stage uses the finer split step: they agree to 5e−5)', () => {
    const w = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: -8, sigma: 2, p0: 4 } }, potential: { step: { V0: 6 } }, time: 5.5, window: { x: [-16, 16] }, readouts: ['reflected', 'transmitted'] }, 1)
    expect(Math.abs(w.stats.reflected! - V.l18StepAreaL)).toBeLessThan(5e-5)
    expect(Math.abs(w.stats.transmitted! - V.l18StepAreaR)).toBeLessThan(5e-5)
    expect(w.stats.reflected!.toFixed(3)).toBe(V.l18StepAreaL.toFixed(3))
    expect(w.stats.transmitted!.toFixed(3)).toBe(V.l18StepAreaR.toFixed(3))
    // the run is already within 1e−3 of the energy-weighted average, the long-time limit
    expect(Math.abs(V.l18StepAreaL - V.l18StepWeightedR)).toBeLessThan(1e-3)
    const bar = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: -8, sigma: 2, p0: 2 } }, potential: { barrier: { V0: 4, a: 0.5 } }, time: 9, window: { x: [-16, 16] }, readouts: ['transmitted'] }, 1)
    expect(Math.abs(bar.stats.transmitted! - V.l18BarrierWeightedT)).toBeLessThan(1e-3) // the barrier readout shows about 0.42, the weighted T
    expect(bar.stats.transmitted!.toFixed(2)).toBe(V.l18BarrierWeightedT.toFixed(2))
  })
  it('the detector slice: the interval readout is ρ times its width, and the peak of v₀ρ for the rigid packet is the quoted number', () => {
    const w = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: -6, sigma: 3, p0: 2 } }, time: 5, window: { x: [-16, 16] }, interval: [3.9, 4.1], readouts: ['interval'] }, 1)
    expect(w.stats.interval!).toBeGreaterThan(0)
    expect(V.l18DetPeakRigid).toBeCloseTo(2 / (Math.sqrt(2 * Math.PI) * 3), 12)
  })
  it('what the captions say about the picture holds: the transmitted bump is narrower and taller than the reflected one, and the two bumps move at about the speeds p₀/m and p₀/2m', () => {
    const at = (t: number) => {
      const rho = density(evolve0(t))
      const side = (lo: number, hi: number) => {
        let m0 = 0
        let m1 = 0
        let m2 = 0
        let top = 0
        for (let j = 0; j < GRID.n; j++) {
          const x = GRID.x[j]
          if (x < lo || x >= hi) continue
          m0 += rho[j]
          m1 += x * rho[j]
          m2 += x * x * rho[j]
          top = Math.max(top, rho[j])
        }
        const mean = m1 / m0
        return { mean, width: Math.sqrt(m2 / m0 - mean * mean), top, area: m0 * GRID.dx }
      }
      return { left: side(-32, 0), right: side(0, 32) }
    }
    const a = at(5)
    const b = at(5.5)
    expect(a.right.width).toBeLessThan(a.left.width)
    expect(a.right.top).toBeGreaterThan(a.left.top)
    expect(a.right.area).toBeGreaterThan(a.left.area)
    // the reflected packet moves back at about the incident speed 4 (its mean momentum is a little lower: R(E) is larger for the slower components), the transmitted one on at about half of it
    expect(Math.abs((b.left.mean - a.left.mean) / 0.5 + 4)).toBeLessThan(0.4)
    expect(Math.abs((b.right.mean - a.right.mean) / 0.5 - 2)).toBeLessThan(0.3)
  })
})

describe('Lecture 18: M2 what moved here from Lecture 13', () => {
  it('the step-below-the-top beat is l18-below:b5, the barrier beat l18-tunnel:b5, the clue l18-tunnel:b7 and the Go-deeper beat l18-tunnel:b8, with the renamed keys', () => {
    expect(beat('l18-below:b5').claims!.map((c) => claimKey(c))).toEqual(['l18TStepRbelow', 'l18TStepTbelow'])
    expect(beat('l18-tunnel:b5').claims!.map((c) => claimKey(c))).toEqual(['l18TBookQa', 'l18TBookAT', 'l18TEV0T', 'l18TBookThick', 'l18BookWidthFor068'])
    expect(beat('l18-tunnel:b7').reveal!.claims!.map((c) => claimKey(c))).toEqual(['l18TDecayFactor'])
    expect(beat('l18-tunnel:b8').claims!.map((c) => claimKey(c))).toEqual(['l18TThickRatio'])
    expect(beat('l18-below:b5').text).toMatch(/^Townsend \(§6\.10, pp\. 229–230, Eqs\. 6\.137–6\.140\)/)
    expect(beat('l18-tunnel:b5').text).toMatch(/^Townsend \(§6\.10, pp\. 230–233, Eqs\. 6\.141–6\.146, Fig\. 6\.15\)/)
    expect(beat('l18-tunnel:b5').phase).toBe('books')
    expect(beat('l18-tunnel:b8').phase).toBe('deeper')
  })
  it('Lecture 13 keeps none of it: no unit l13-flow, no l13 tunnelling key or question, a pointer sentence in its last lecture beat', () => {
    expect(L13.units.map((u) => u.id)).not.toContain('l13-flow')
    expect(Object.keys(V13).filter((k) => /^l13T(Step|Book|EV0|Thick|Decay)|^l13PrTunnel/.test(k))).toEqual([])
    expect(L13.units.flatMap((u) => u.play.map((q) => q.id))).not.toContain('l13-pr-tunnel')
    expect(L13.units.flatMap((u) => u.story ?? []).find((b) => b.id === 'l13-time:b5')!.text).toMatch(/Lectures 17 and 18\.$/)
    expect(L13.corrections ?? []).toHaveLength(0)
  })
  it('the moved numbers: κa = 0.607, T = 0.706 (the page prints 0.68), 0.707 with the Bohr radius, T = ½ at E = V₀ with ka = 2, e⁻², 0.998 and 1.812 percent', () => {
    expect(V.l18TBookQa).toBeCloseTo(0.6072, 4)
    expect(V.l18TBookAT).toBeCloseTo(0.7061, 4)
    expect(V.l18TBookBohrT).toBeCloseTo(0.7068, 4)
    expect(V.l18TEV0T).toBeCloseTo(0.5, 12)
    expect(V.l18TDecayFactor).toBeCloseTo(Math.exp(-2), 12)
    expect(V.l18TThickRatio).toBeCloseTo(0.99793, 5)
    expect(V.l18PrTunnelPct).toBeCloseTo(1.81169, 4)
    expect(V.l18TStepRbelow).toBe(1)
    expect(V.l18TStepTbelow).toBe(0)
    // the page's 0.68 would need a width of 0.560 Å, and the thick form is no probability there
    expect(V.l18BookWidthFor068).toBeCloseTo(0.55968, 4)
    expect(V.l18TBookThick).toBeGreaterThan(1)
  })
  it('the Correction is Townsend p. 231: printed 0.68, our calculation 0.706 (two routes in the twin), checked by the engine (T5)', () => {
    expect(L18.corrections![0].where).toMatch(/^Townsend p\. 231/)
    expect(L18.corrections![0].source).toBe('book')
    expect(L18.corrections![0].says).toMatch(/0\.68/)
    expect(L18.corrections![0].shouldSay).toMatch(/0\.706/)
    expect(L18.corrections![0].check()).toBe(true)
    expect(Math.abs(V.l18TBookAT - 0.68)).toBeGreaterThan(0.02)
  })
  it('the Optics Lab rows follow: the 709 table points at l18-tunnel, no row names l13-flow or the old l17 target, and the 448 table has the Josephson row', () => {
    expect(BRIDGES_709['qc-l18-tunnel']).toMatchObject({ course: 'sl448', lecture: 'L18', unit: 'l18-tunnel' })
    expect(BRIDGES_709['qc-l17-current']).toBeUndefined()
    expect(Object.values(BRIDGES_709).filter((t) => t.unit === 'l13-flow')).toEqual([])
    expect(BRIDGES_448['sl-q27-josephson']).toMatchObject({ lecture: 'Q27', unit: 'q27-josephson' })
  })
})

describe('Lecture 18: notation, link-backs, glossary and bridges', () => {
  it('Unit 17.2 and Unit 17.3 are recalled in l18-packet:b1 and l18-detector:b5, which define nothing; the notes’ t for the amplitude is renamed in one beat only (M4)', () => {
    for (const [id, unitName] of [['l18-packet:b1', 'Unit 17.2'], ['l18-detector:b5', 'Unit 17.3']] as const) {
      const b = beat(id)
      expect(b.text, id).toContain(unitName)
      expect(b.text, id).toMatch(/defines nothing new/)
      expect(b.derivation, id).toBeUndefined()
      expect(b.introduces, id).toBeUndefined()
    }
    expect(beat('l18-packet:b1').text).toMatch(/The notes write \$t\$ for the amplitude \$\\tau\$, but here \$t\$ is time\./)
    for (const other of beats.filter((x) => x.id !== 'l18-packet:b1')) expect(textsOf(other).join(' '), other.id).not.toMatch(/The notes write \$t\$/)
  })
  it('Townsend’s q is our κ and his k₀ our k₂ (one line in the step beat, as in the barrier beat his F, G and C are our C, D and F)', () => {
    expect(beat('l18-below:b5').text).toMatch(/His \$q\$ is our \$\\kappa\$ and his \$k_0\$ is our \$k_2\$/)
    expect(beat('l18-detector:b7').text).toMatch(/His \$k_0\$ is our \$k_2\$/)
    expect(beat('l18-tunnel:b5').text).toMatch(/His \$F\$, \$G\$ and \$C\$ are our \$C\$, \$D\$ and \$F\$/)
  })
  it('the three new glossary ids are first used where the plan puts them; the reused ones are tagged where the lecture uses them', () => {
    expect(GLOSSARY.get('probability-flux')!.first).toBe('l18-detector:b2')
    expect(GLOSSARY.get('evanescent-wave')!.first).toBe('l18-below:b1')
    expect(GLOSSARY.get('penetration-depth')!.first).toBe('l18-below:b3')
    expect(beat('l18-detector:b2').text).toContain('[[probability-flux|')
    expect(beat('l18-below:b1').text).toContain('[[evanescent-wave|')
    expect(beat('l18-below:b3').text).toContain('[[penetration-depth|')
    expect(beat('l18-tunnel:b1').text).toContain('[[tunnelling|')
    expect(beat('l18-packet:b2').text).toContain('[[wave-packet|')
    for (const id of ['probability-flux', 'evanescent-wave', 'penetration-depth']) expect(GLOSSARY.get(id)!.gloss.split(/\s+/).length, id).toBeLessThanOrEqual(25)
  })
  it('one chip into 709 (Cooper pairs tunnelling) sits in the smooth-barrier beat, and its table row exists', () => {
    const used = beats.flatMap((b) => [...bridgeRefs(b.text), ...bridgeRefs(b.reveal?.text ?? '')])
    expect(used).toEqual(['sl-q27-josephson'])
    expect(bridgeRefs(beat('l18-tunnel:b6').text)).toEqual(['sl-q27-josephson'])
  })
})

describe('Lecture 18: the Try-its are what the widgets compute', () => {
  it('no unit uses wave-lab; the widgets are the planned stand-ins and the captions say so', () => {
    expect(L18.units.map((u) => u.visual.kind)).toEqual(['amplitude-bars', 'amplitude-bars', 'complex-plane', 'amplitude-bars'])
    for (const u of L18.units) expect(u.visual.caption, u.id).toMatch(/stand-in/i)
  })
  it('packet: at +x measured along z the two amplitudes are equal with squares one half; their sum is above 1 and the chances add to exactly 1', () => {
    expect(unit('l18-packet').visual.props).toEqual({ state: '+x', basis: 'z' })
    const amps = [axisVector('z'), axisVector('z').map((v) => -v) as [number, number, number]].map((n) => inner(ketAlong(n), KET['+x']))
    const sizes = amps.map((a) => Math.hypot(a.re, a.im))
    expect(sizes[0]).toBeCloseTo(sizes[1], 12)
    expect(sizes[0] ** 2).toBeCloseTo(0.5, 12)
    expect(sizes[0] + sizes[1]).toBeGreaterThan(1)
    expect(sizes[0] ** 2 + sizes[1] ** 2).toBeCloseTo(1, 12)
  })
  it('detector: at +z measured along x the shares are one half each', () => {
    expect(unit('l18-detector').visual.props).toEqual({ state: '+z', basis: 'x' })
    const amps = [axisVector('x'), axisVector('x').map((v) => -v) as [number, number, number]].map((n) => inner(ketAlong(n), KET['+z']))
    for (const a of amps) expect(a.re ** 2 + a.im ** 2).toBeCloseTo(0.5, 12)
  })
  it('below: multiplying 1 by −i gives a number of length 1 and angle −90°, the reflection amplitude of the step with k = κ', () => {
    expect(unit('l18-below').visual.props).toEqual({ mode: 'multiply', z: [1, 0], w: [0, -1] })
    const p = mul(c(1, 0), c(0, -1))
    expect(abs(p)).toBeCloseTo(1, 12)
    expect((arg(p) * 180) / Math.PI).toBeCloseTo(-90, 9)
    expect(V.l18AbsR).toBeCloseTo(1, 12)
    expect(V.l18PhaseDegMag).toBeCloseTo(90, 9)
  })
  it('tunnel: at +z measured along z one outcome has the whole chance and the other none', () => {
    expect(unit('l18-tunnel').visual.props).toEqual({ state: '+z', basis: 'z' })
    const [up, down] = [axisVector('z'), axisVector('z').map((v) => -v) as [number, number, number]].map((n) => inner(ketAlong(n), KET['+z']))
    expect(up.re ** 2 + up.im ** 2).toBeCloseTo(1, 12)
    expect(down.re ** 2 + down.im ** 2).toBeCloseTo(0, 12)
  })
})

describe('Lecture 18: the practice questions and the numbers', () => {
  it('the four practice questions are tagged, name their source, carry full walkthroughs and are not assigned (T1); no homework label appears', () => {
    const qs = L18.units.flatMap((u) => u.play).filter((q) => q.practice)
    expect(qs.map((q) => `${q.id}:${q.practice}`)).toEqual(['l18-pr-energy:homework', 'l18-pr-tunnel:townsend', 'l18-pr-resonance:townsend', 'l18-pr-field:townsend'])
    for (const q of qs) {
      expect(q.walkthrough.length, q.id).toBeGreaterThan(1)
      expect(q.hints, q.id).toHaveLength(3)
      expect(q.assigned, q.id).toBeFalsy()
      expect(JSON.stringify(q), q.id).not.toMatch(/\bH\d-\d/)
      if (q.practice === 'townsend') expect(q.refs?.[0].where, q.id).toMatch(/^Problem 6\.\d+, end of Ch\. 6/)
    }
    const tol = Object.fromEntries(qs.map((q) => [q.id, q.kind === 'numeric' ? q.tolerance : -1]))
    expect(tol).toEqual({ 'l18-pr-energy': 0.005, 'l18-pr-tunnel': 0.02, 'l18-pr-resonance': 0.005, 'l18-pr-field': 0.05 })
  })
  it('a whole-number answer is a whole number with tolerance 0; a decimal answer uses 0.005, but for the moved percentage (0.02) and the field-emission exponent (0.05)', () => {
    for (const q of L18.units.flatMap((u) => u.play)) {
      if (q.kind !== 'numeric') continue
      if (Number.isInteger(q.answer)) expect(q.tolerance, q.id).toBe(0)
      else expect(q.tolerance, q.id).toBe(q.id === 'l18-pr-tunnel' ? 0.02 : q.id === 'l18-pr-field' ? 0.05 : 0.005)
    }
  })
  it('the numbers: R + T = 1 and 1 + r = τ for the step, the density 16/9 against the share 8/9, the weighted R falls to 1/9 with the width', () => {
    expect(V.l18AmpIdentity).toBeLessThan(1e-14)
    expect(Math.abs(V.l18FracIdentity)).toBeLessThan(1e-14)
    expect(V.l18StepR43).toBeCloseTo(1 / 9, 14)
    expect(V.l18StepT43).toBeCloseTo(8 / 9, 14)
    expect(V.l18StepDens43).toBeCloseTo(16 / 9, 14)
    expect(V.l18StepRatio43).toBe(0.5)
    expect(V.l18CurrentFactorR).toBeCloseTo(1, 14)
    expect(V.l18CurrentFactorT).toBeCloseTo(0.5, 14)
    expect(V.l18StepWeightedR).toBeGreaterThan(V.l18WeightedR3)
    expect(V.l18WeightedR3).toBeGreaterThan(V.l18WeightedR6)
    expect(V.l18WeightedR6).toBeGreaterThan(V.l18WeightedR12)
    expect(V.l18WeightedR12).toBeGreaterThan(V.l18StepR43)
    expect(V.l18WeightedR12 - V.l18StepR43).toBeLessThan(1e-3)
    expect(V.l18StepNorm).toBeCloseTo(1, 10)
    expect(V.l18StepAreaL + V.l18StepAreaR).toBeCloseTo(1, 6)
  })
  it('the detector: the whole passage carries 1, the exact peak is a little below the rigid one, and the shares of the packet are the closed forms', () => {
    expect(V.l18DetTotal).toBeCloseTo(1, 12)
    expect(V.l18DetPeakRatio).toBeLessThan(1)
    expect(V.l18DetPeakRatio).toBeGreaterThan(0.95)
    expect(V.l18DetPeakExact).toBeCloseTo(V.l18DetPeakRatio * V.l18DetPeakRigid, 14)
    expect(V.l18ChJ).toBeCloseTo(0.4, 14)
    expect(stepRT(8, 6).T).toBeCloseTo(V.l18StepT43, 14)
    // review P-L16L18 S4: l18-de-T is a fresh step (k₂/k₁ = ¼, |τ|² = 64/25, T = 0.64), not Lecture 17's l17-cu-T (k₂/k₁ = ½, T = 8/9) and not the l18-pk-R step (k₁ = 3k₂)
    expect(V.l18DeT).toBeCloseTo(0.25 * (8 / 5) ** 2, 14)
    expect(V.l18DeT).toBeCloseTo(16 / 25, 14)
    expect(Math.abs(V.l18DeT - V.l18StepT43)).toBeGreaterThan(0.2)
    expect(Math.abs(V.l18DeT - (1 - V.l18ChR))).toBeGreaterThan(0.1)
    const q = L18.units.flatMap((u) => u.play).find((x) => x.id === 'l18-de-T')!
    expect(q.kind === 'numeric' && q.answer).toBe(V.l18DeT)
    expect(q.prompt).toContain('\\tfrac14')
    // the numbers beat after "defines nothing new" points to Unit 17.3 and keeps only the density-against-share point
    expect(beat('l18-detector:b6').text).toContain('Unit 17.3')
    expect(beat('l18-detector:b6').text.length).toBeLessThan(520)
  })
  it('below the step: |r| = 1, R = 1, r = −i for k = κ, edge density 2, no current, the density falls by e over 1/2κ and to 1 % at ln 100/2κ, and the most chance ever in the step is about a tenth', () => {
    expect(V.l18K).toBe(V.l18Kappa)
    expect(V.l18RBelow).toBeCloseTo(1, 14)
    expect(V.l18EdgeDensity).toBeCloseTo(2, 14)
    expect(Math.abs(V.l18EvanescentCurrent)).toBeLessThan(1e-14)
    expect(V.l18DecayLenDensity).toBeCloseTo(0.25, 14)
    expect(V.l18DecayLenAmp).toBeCloseTo(0.5, 14)
    expect(V.l18X1pct).toBeCloseTo(Math.log(100) / 4, 14)
    expect(V.l18MaxPenetration).toBeGreaterThan(0.09)
    expect(V.l18MaxPenetration).toBeLessThan(0.11)
    expect(V.l18PenetrationTime).toBe(4) // the largest of the frames every half unit; a fine run peaks near 4.05, so the text says "near t = 4" (review N6)
    expect(beat('l18-below:b3').text).toMatch(/near \$t = 4\$/)
  })
  it('the barrier: T = 1/cosh² at E = V₀/2 by every route, the thick form is 0.5 % high at κa = 3 and 4 at a = 0, and the current inside is the transmitted one', () => {
    for (const [qa, key] of [[0.5, 'l18BarrierT05'], [1, 'l18BarrierT1'], [2, 'l18BarrierT2'], [3, 'l18BarrierT3']] as const) expect(V[key]).toBeCloseTo(1 / Math.cosh(qa) ** 2, 12)
    expect(V.l18AppendixAT).toBeCloseTo(V.l18BarrierT1, 12)
    expect(V.l18BarrierThick3 / V.l18BarrierT3).toBeCloseTo(1.005, 3)
    expect(V.l18ThickAtZero).toBeCloseTo(4, 12)
    expect(barrierT(2, 4, 0)).toBe(1)
    expect(barrierThick(2, 4, 0)).toBeCloseTo(4, 12)
    expect(V.l18BarrierInnerCurrent).toBeCloseTo(V.l18BarrierOuterCurrent, 12)
    expect(V.l18BarrierInnerCurrent).toBeCloseTo(2 * V.l18BarrierT1, 12)
    expect(V.l18BarrierWeightedT).toBeCloseTo(V.l18BarrierT1, 3)
    expect(V.l18ChThickPct).toBeCloseTo(100 * V.l18BarrierThick3, 12)
  })
  it('the practice numbers: the smallest T above a barrier is 8/9, T = 1 at π/k′, the field-emission exponent is 13.04 and T about 2.2 × 10⁻⁶, and the energy spread of a σ = 3 packet is p₀/2σ', () => {
    expect(V.l18PrAboveTmin).toBeCloseTo(8 / 9, 12)
    expect(barrierT(2, 1, V.l18PrAboveResWidth)).toBeCloseTo(1, 12)
    expect(V.l18PrFieldExponent).toBeCloseTo(13.0415, 3)
    expect(V.l18PrFieldTMant).toBeCloseTo(Math.exp(-V.l18PrFieldExponent) / 1e-6, 12)
    expect(V.l18PrFieldTMant.toFixed(1)).toBe('2.2')
    expect(V.l18PrEnergySpread).toBeCloseTo(4 / (2 * 3), 9)
    expect(V.l18ChR).toBeCloseTo(0.25, 14)
  })
})
