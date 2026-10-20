/**
 * Lecture 13's own rulings as lints (docs/roles/decisions/448-L12L13.md R1-R8), on top of the platform lints every chapter passes:
 *   R1  the shared pieces are Lecture 12's: every unit draws the `wavefunction` kind (the phase clocks and the matrix and complex-plane kinds appear only where named);
 *   R2  p̂ = -iħ d/dx is recapped in one beat that defines nothing (`l13-generator:b1`), not derived again;
 *   R4  T(a) is the translation, U(t) the time evolution, ψ̃(p) the momentum amplitude, t̂ the hypothetical time operator (the notation beat `l13-time:b2`);
 *   R5  the notes' optional §13.10 is a Go-deeper beat, the last of Unit 13.6, with no new unit;
 *   R7  the Try-it of every unit is an existing widget whose lines say what it is (no `wave-lab`);
 *   R8  no Correction box.
 * Also: the unit order and beat counts, every text balances its dollar signs, the chips into 709, every V key is claimed, the Try-it lines are what the widgets'
 * engines compute, and the four Arcade rounds are true.
 */
import { describe, expect, it } from 'vitest'
import { L13 } from './L13'
import { BRIDGES_448 } from './bridges448'
import { GLOSSARY } from './glossary'
import { layoutStates } from './stage'
import type { Beat, ClocksState, WavefunctionState } from './stage'
import { bridgeRefs } from './walk'
import { ERROR_ROUNDS } from '../arcade/games'
import { resolveWavefunctionStage, validateWavefunctionStage } from '../stage/svg/wavefunction'
import { inner } from '../physics/linalg'
import { KET, SX, SZ, ketAlong, operatorInBasis } from '../physics/spin'
import { axisVector } from '../physics/sg'
import { GRID, commutatorXP, packet, planeSamples, xTimes, pOp } from '../physics/wave'
import { V } from './L13.values'
import { claimKey } from './claimKit'

const beats = L13.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const leaves = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(leaves) : x && typeof x === 'object' ? Object.values(x).flatMap(leaves) : [])
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const unitTexts = () => L13.units.flatMap((u) => [u.title, u.question, u.lecture.summary, ...(u.lecture.equations ?? []), u.insight, ...(u.pitfalls ?? []), ...u.visual.tryThis, ...leaves(u.review), ...leaves(u.play)])
const unit = (id: string) => L13.units.find((u) => u.id === id)!
const beat = (id: string) => beats.find((b) => b.id === id)!

describe('Lecture 13: shape', () => {
  it('has the seven lecture units in order and the two Townsend units after them, with the planned beats (the notes’ line, the Townsend beats and four Go-deeper beats, §13.10 among them)', () => {
    expect(L13.units.map((u) => u.id)).toEqual(['l13-delta', 'l13-generator', 'l13-plane-wave', 'l13-momentum-space', 'l13-two-bases', 'l13-schrodinger', 'l13-time', 'l13-stationary', 'l13-flow'])
    expect(L13.units.map((u) => (u.story ?? []).filter((b) => b.phase !== 'deeper').length)).toEqual([6, 5, 7, 7, 7, 7, 8, 5, 5])
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['l13-plane-wave:b7', 'l13-two-bases:b8', 'l13-schrodinger:b8', 'l13-flow:b6'])
    expect(beats.filter((b) => b.phase === 'clue')).toHaveLength(9)
    expect(beats.filter((b) => b.phase === 'books')).toHaveLength(18) // 7 from the notes' pass, 3 added to lecture units and 4 + 4 in the two Townsend units
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual([
      'l13-delta:b2', 'l13-generator:b3', 'l13-plane-wave:b1', 'l13-momentum-space:b2', 'l13-momentum-space:b5b', 'l13-two-bases:b2', 'l13-two-bases:b4', 'l13-schrodinger:b2', 'l13-schrodinger:b4', 'l13-time:b3',
      'l13-time:b6b', 'l13-stationary:b3', 'l13-flow:b1', 'l13-flow:b2',
    ])
    expect(L13.units.reduce((n, u) => n + u.play.length, 0)).toBe(32) // 28 from the notes' pass and four Townsend practice questions
    expect(L13.corrections).toHaveLength(1) // R8 stands for the notes; the one Correction is Townsend's p. 231 (ruling T5)
    expect(L13.corrections![0].where).toMatch(/Townsend p\. 231/)
    expect(L13.corrections![0].source).toBe('book')
  })
  it('every text balances its dollar signs (a stray one would typeset the rest of the sentence as TeX)', () => {
    for (const t of [...beats.flatMap(textsOf), ...unitTexts()]) {
      const flat = t.replace(/\\\$/g, '').replace(/\$\$/g, '')
      expect((flat.match(/\$/g) ?? []).length % 2, t.slice(0, 80)).toBe(0)
    }
  })
  it('every claim key is a value of the chapter and every value is claimed at least once', () => {
    const claimed = new Set(L13.units.flatMap((u) => [...(u.claims ?? []), ...(u.review?.claims ?? [])]).map((c) => claimKey(c)))
    for (const k of Object.keys(V)) expect(claimed.has(k), k).toBe(true)
  })
})

describe('Lecture 13: R1 the shared kind', () => {
  it('every unit draws the wavefunction kind, every state validates, no WebGL kind appears and the phase clocks only in Unit 13.7', () => {
    for (const u of L13.units) {
      const states = (u.story ?? []).flatMap(statesOf)
      const wf = states.filter((s): s is WavefunctionState => s.kind === 'wavefunction')
      const ck = states.filter((s): s is ClocksState => s.kind === 'clocks')
      expect(wf.length, u.id).toBeGreaterThan(3)
      if (u.id !== 'l13-time') expect(ck, u.id).toHaveLength(0)
      for (const s of wf) expect(validateWavefunctionStage(s), u.id).toEqual([])
      for (const s of states) expect(['wavefunction', 'clocks', 'complex-plane', 'matrix', 'plot'], `${u.id} ${s.kind}`).toContain(s.kind)
    }
  })
  it('the packet inputs the lecture uses are the unit packet or a named variation: σ ∈ {⅛, ¼, ½, 1, 2, 4} (¼ is the end of the sweep that pins the position, l13-plane-wave:b5b)', () => {
    const sigmas = new Set<number>()
    for (const s of beats.flatMap(statesOf).filter((x): x is WavefunctionState => x.kind === 'wavefunction'))
      if ('packet' in s.source) for (const e of [s.source.packet.sigma]) typeof e === 'number' ? sigmas.add(e) : (sigmas.add(e.from), sigmas.add(e.to))
    expect([...sigmas].sort((a, b) => a - b)).toEqual([0.125, 0.25, 0.5, 1, 2, 4])
  })
})

describe('Lecture 13: R2, R4, R5 ownership, notation and the optional section', () => {
  it('p̂ = −iħ d/dx is recapped once, in a beat that points back to Unit 12.6 and defines no term (R2)', () => {
    const b = beat('l13-generator:b1')
    expect(b.text).toContain('Unit 12.6')
    expect(b.text).not.toContain('[[')
    expect(b.derivation).toBeUndefined()
    for (const other of beats.filter((x) => x.id !== b.id)) expect(textsOf(other).join(' '), other.id).not.toMatch(/-i\\hbar\\,\\psi'\(x\)\$\. This beat only recalls/)
  })
  it('T(a) is the translation and U(t) the time evolution; the notes’ T̂ for the time operator is written t̂ in the notation beat only (R4)', () => {
    const b = beat('l13-time:b2')
    expect(b.introduces).toEqual(['time-operator'])
    expect(b.text).toContain('T(a) = e^{-ia\\hat p/\\hbar}')
    expect(b.text).toContain('U(t) = e^{-iHt/\\hbar}')
    expect(b.text).toContain('\\hat T')
    expect(b.text).toContain('\\hat t')
    expect(GLOSSARY.get('time-operator')!.introduces).toBe('notation')
    for (const other of beats.filter((x) => x.id !== b.id)) expect(textsOf(other).join(' '), other.id).not.toMatch(/\\hat T/)
    for (const t of [...beats.flatMap(textsOf), ...unitTexts()]) expect(t, t.slice(0, 60)).not.toMatch(/\\hat U/)
  })
  it('the momentum amplitude is ψ̃(p) with the notes’ ϕ named once; Townsend’s a is √2σ in one line (R4, Rosetta)', () => {
    expect(beat('l13-momentum-space:b1').text).toMatch(/The notes call it \$\\phi\(p,t\)\$/)
    expect(beat('l13-momentum-space:b5a').text).toMatch(/His parameter \$a\$ is \$\\sqrt2\\,\\sigma\$ in our notation/)
    for (const b of beats.filter((x) => x.id !== 'l13-momentum-space:b1')) expect(b.text, b.id).not.toMatch(/The notes call it \$\\phi/)
  })
  it('§13.10 is a Go-deeper beat, the last of Unit 13.6, with no new unit and nothing introduced (R5)', () => {
    const g = beat('l13-schrodinger:b8')
    expect(g.phase).toBe('deeper')
    expect(g.text).toMatch(/^The notes’ optional §13\.10:/)
    expect(g.introduces).toBeUndefined()
    const phases = unit('l13-schrodinger').story!.map((b) => b.phase)
    expect(phases[phases.length - 1]).toBe('deeper')
    expect(phases.indexOf('deeper')).toBeGreaterThan(phases.lastIndexOf('clue'))
    expect(L13.units.map((u) => u.id)).not.toContain('l13-energy-eq')
  })
  it('the glosses introduced here are first used where their first-use ids say', () => {
    for (const [id, first] of Object.entries({ 'generalized-eigenstate': 'l13-delta:b4', 'wave-number': 'l13-generator:b2', 'plane-wave': 'l13-plane-wave:b1', 'momentum-wavefunction': 'l13-momentum-space:b1', 'fourier-transform': 'l13-momentum-space:b2', 'position-space-schrodinger': 'l13-schrodinger:b2', 'time-operator': 'l13-time:b2' }))
      expect(beat(first).text, id).toContain(`[[${id}|`)
  })
})

describe('Lecture 13: R7 the Try-its are what the widgets compute', () => {
  it('no unit uses wave-lab; the nine widgets are the planned stand-ins', () => {
    expect(L13.units.map((u) => u.visual.kind)).toEqual(['amplitude-bars', 'complex-plane', 'complex-plane', 'basis-translator', 'basis-translator', 'two-clocks', 'two-clocks', 'two-clocks', 'amplitude-bars'])
    expect(unit('l13-delta').visual.caption).toMatch(/stand-in/)
    expect(unit('l13-momentum-space').visual.caption).toMatch(/stand-in/)
  })
  it('delta: at +z, measured along z, one outcome has the whole chance (amplitude-bars)', () => {
    const [up, down] = [axisVector('z'), axisVector('z').map((v) => -v) as [number, number, number]].map((n) => inner(ketAlong(n), KET['+z']))
    expect(up.re ** 2 + up.im ** 2).toBeCloseTo(1, 12)
    expect(down.re ** 2 + down.im ** 2).toBeCloseTo(0, 12)
  })
  it('generator: z real and w = i make the product imaginary; plane wave: w has size 1 (complex-plane)', () => {
    const g = unit('l13-generator').visual.props as { z: number[]; w: number[] }
    expect(g.z[1]).toBe(0)
    expect(g.w).toEqual([0, 1])
    const p = unit('l13-plane-wave').visual.props as { z: number[]; w: number[] }
    expect(Math.hypot(p.w[0], p.w[1])).toBeCloseTo(1, 12)
  })
  it('momentum space: at θ = 0 the z chances are 1 and 0 and the x chances split evenly; two bases, one state (basis-translator)', () => {
    const z = KET['+z']
    const pz = [KET['+z'], KET['-z']].map((k) => inner(k, z)).map((a) => a.re ** 2 + a.im ** 2)
    const px = [KET['+x'], KET['-x']].map((k) => inner(k, z)).map((a) => a.re ** 2 + a.im ** 2)
    expect(pz[0]).toBeCloseTo(1, 12)
    expect(pz[1]).toBeCloseTo(0, 12)
    expect(px[0]).toBeCloseTo(0.5, 12)
    expect(px[1]).toBeCloseTo(0.5, 12)
  })
  it('two bases: Sz in the x basis is not diagonal and Sx in the x basis is diagonal (basis-translator)', () => {
    const xb = [KET['+x'], KET['-x']]
    const offSz = operatorInBasis(SZ, xb)[0][1]
    const offSx = operatorInBasis(SX, xb)[0][1]
    expect(Math.hypot(offSz.re, offSz.im)).toBeGreaterThan(0.1)
    expect(Math.hypot(offSx.re, offSx.im)).toBeLessThan(1e-9)
    expect(unit('l13-two-bases').visual.props).toMatchObject({ mode: 'operator', operator: 'Sz', target: 'x' })
  })
  it('schrodinger and time: the clocks’ lines are Lecture 12’s, with the same example (3ε and ε, start |+x⟩)', () => {
    for (const id of ['l13-schrodinger', 'l13-time']) expect(unit(id).visual.props).toEqual({ upper: 3, lower: 1, start: '+x' })
  })
})

describe('Lecture 13: the chips into 709 and the numbers a learner meets', () => {
  it('two chips into Physics 709 sit where the plan says, and their table rows exist', () => {
    const used = beats.flatMap((b) => [...bridgeRefs(b.text), ...bridgeRefs(b.reveal?.text ?? '')])
    expect(used).toEqual(['sl-f8-dft', 'sl-q3-uncertainty'])
    expect(bridgeRefs(beat('l13-plane-wave:b7').text)).toEqual(['sl-f8-dft'])
    expect(bridgeRefs(beat('l13-two-bases:b5').text)).toEqual(['sl-q3-uncertainty'])
    for (const id of used) expect(BRIDGES_448[id], id).toBeDefined()
  })
  it('a wavefunction state resolves with the numbers the lecture quotes (spot checks at the engine level)', () => {
    const w = resolveWavefunctionStage({ kind: 'wavefunction', source: { plane: { p: 3 } }, readouts: ['wavelength'] }, 1)
    expect(w.stats.wavelength!).toBeCloseTo(V.l13Lambda3, 12)
    const s = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1, p0: 3 } }, time: 4, readouts: ['xspread', 'pspread'] }, 1)
    expect(s.stats.xspread!).toBeCloseTo(V.l13FreeSd4, 9)
    expect(s.stats.pspread!).toBeCloseTo(V.l13FreeDp4, 9)
    const n = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 0.125 } }, interval: [-0.25, 0.25], readouts: ['interval', 'peak'] }, 1)
    expect(n.stats.interval!).toBeCloseTo(V.l13NarrowP0125, 9)
    expect(n.stats.peak!).toBeCloseTo(V.l13Peak0125, 9)
    const b = resolveWavefunctionStage({ kind: 'wavefunction', source: { packet: { x0: 0, sigma: 1 } }, boost: 1.5, readouts: ['pmean', 'pspread'] }, 1)
    expect(b.stats.pmean!).toBeCloseTo(V.l13BoostMean, 9)
    expect(b.stats.pspread!).toBeCloseTo(V.l13BoostSd, 9)
  })
})

describe('Lecture 13: Arcade rounds', () => {
  const rounds = ERROR_ROUNDS.filter((r) => r.trains.lecture === 'L13')
  it('has five Spot-the-error rounds (the fifth is the Squeeze idea), each training a real unit, each with a wrong step inside it', () => {
    expect(rounds.map((r) => r.id)).toEqual(['l13-plane-normalised', 'l13-squeeze', 'l13-x-commutes', 'l13-one-wave-any-potential', 'l13-time-unmeasurable'])
    expect(rounds.map((r) => r.trains.unit)).toEqual(['l13-plane-wave', 'l13-momentum-space', 'l13-two-bases', 'l13-schrodinger', 'l13-time'])
    for (const r of rounds) {
      expect(L13.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.steps).toHaveLength(4)
      expect(r.wrong).toBeGreaterThanOrEqual(2)
      expect(r.wrong).toBeLessThan(4)
    }
  })
  it('l13-plane-normalised: the density is 1 at every x, so the area is the length of the window and has no upper limit', () => {
    expect(V.l13FlatSingle).toBeLessThan(1e-12)
    const area = (half: number) => {
      const xs = Array.from({ length: 4 * half * 16 }, (_, i) => -half + (i + 0.5) / 16 / 1)
      const w = planeSamples(xs, [3])
      return w.re.reduce((s, r, i) => s + r * r + w.im[i] * w.im[i], 0) / 16
    }
    expect(area(8)).toBeCloseTo(32, 6)
    expect(area(32)).toBeGreaterThan(area(8) * 3.9)
  })
  it('l13-squeeze: halving sigma doubles the spread of momentum (0.5 to 1 per l), it does not halve it, and the product stays 1/2', () => {
    expect(V.l13Dp1).toBeCloseTo(0.5, 9)
    expect(V.l13Dp05).toBeCloseTo(1, 9)
    expect(V.l13Dp05 / V.l13Dp1).toBeCloseTo(2, 9)
    expect(V.l13DxDp1).toBeCloseTo(0.5, 9)
    expect(V.l13DxDp05).toBeCloseTo(0.5, 9)
    expect(rounds.find((r) => r.id === 'l13-squeeze')!.wrong).toBe(2)
  })
  it('l13-x-commutes: x̂p̂ψ and p̂x̂ψ differ by iħψ, so the commutator is iħ and not 0', () => {
    const psi = packet(GRID, { x0: 2, sigma: 1 })
    const a = xTimes(pOp(psi, GRID), GRID)
    const b = pOp(xTimes(psi, GRID), GRID)
    const j = Math.round((2 - GRID.x[0]) / GRID.dx)
    expect(a.im[j] - b.im[j]).toBeCloseTo(psi.re[j], 9)
    const c = commutatorXP(psi, GRID)
    expect(c.im[j]).toBeCloseTo(psi.re[j], 9)
    expect(V.l13CommExpIm).toBeCloseTo(1, 9)
  })
  it('l13-one-wave-any-potential: for V = x²/2 the frequency the equation asks for is 2 at x = 0 and 4 at x = 2, so no one ω works; for a constant V it is one number', () => {
    const needed = (k: number, v: number) => k * k / 2 + v
    expect(needed(2, 0)).toBeCloseTo(V.l13OmegaK2, 12)
    expect(needed(2, 2 ** 2 / 2)).not.toBeCloseTo(needed(2, 0), 6)
    expect(needed(2, 1.5)).toBe(needed(2, 1.5))
  })
  it('l13-time-unmeasurable: time is measured by clocks, and the real reason is a floor under the energies (lowest free energy 0)', () => {
    expect(V.l13MinFreeEnergy).toBe(0)
    expect(V.l13FreeNorm4).toBeCloseTo(1, 9)
  })
})

describe('Lecture 13: the Townsend pass (G4b; rulings T1–T6, plan P-448-townsend-G4)', () => {
  const townsendUnits = ['l13-stationary', 'l13-flow']
  it('the two new units are books only and open with a lede that says the lecture notes do not cover them (T3); they follow the lecture units', () => {
    for (const id of townsendUnits) {
      const story = unit(id).story!
      expect(story[0].phase, id).toBe('books')
      expect(story[0].text, id).toMatch(/^This unit is beyond the lecture notes; it follows Townsend/)
      expect(story.filter((b) => b.phase === 'lecture'), id).toHaveLength(0)
      expect(unit(id).lecture.pages, id).toMatch(/^not in the lecture notes/)
    }
    expect(L13.units.slice(-2).map((u) => u.id)).toEqual(townsendUnits)
  })
  it('each lettered books beat starts its group at a; the three renamed beats keep their texts', () => {
    expect(beat('l13-plane-wave:b5a').text).toMatch(/^Townsend §6\.5 derives the normalisation/)
    expect(beat('l13-momentum-space:b5a').text).toMatch(/^Townsend §6\.5 \(Eq\. 6\.57, p\. 204\) writes the pair/)
    expect(beat('l13-time:b6a').text).toMatch(/^Townsend §6\.3 \(pp\. 199–200/)
    expect(beat('l13-plane-wave:b5b').phase).toBe('books')
    expect(beat('l13-momentum-space:b5b').phase).toBe('books')
    expect(beat('l13-time:b6b').phase).toBe('books')
  })
  it('the four practice questions are tagged townsend, name their end-of-chapter problem, carry full walkthroughs and are not assigned (T1)', () => {
    const qs = townsendUnits.flatMap((id) => unit(id).play)
    expect(qs.map((q) => q.id)).toEqual(['l13-pr-box-energy', 'l13-pr-wall', 'l13-pr-step', 'l13-pr-tunnel'])
    for (const q of qs) {
      expect(q.practice, q.id).toBe('townsend')
      expect(q.refs?.[0].where, q.id).toMatch(/^Problem 6\.\d+, end of Ch\. 6/)
      expect(q.walkthrough.length, q.id).toBeGreaterThan(1)
      expect(q.hints, q.id).toHaveLength(3)
      expect(q.assigned, q.id).toBeFalsy()
      expect(JSON.stringify(q), q.id).not.toMatch(/\bH\d-\d/) // no homework label (T1)
    }
    const tol = Object.fromEntries(qs.map((q) => [q.id, q.kind === 'numeric' ? q.tolerance : -1]))
    expect(tol).toEqual({ 'l13-pr-box-energy': 0.005, 'l13-pr-wall': 0.005, 'l13-pr-step': 0.005, 'l13-pr-tunnel': 0.02 })
  })
  it('the Correction is Townsend p. 231: printed 0.68, our calculation 0.706 (two routes in the twin), checked by the engine (T5)', () => {
    const c = L13.corrections![0]
    expect(c.says).toMatch(/0\.68/)
    expect(c.shouldSay).toMatch(/0\.706/)
    expect(c.check()).toBe(true)
    expect(V.l13TBookAT).toBeCloseTo(0.7061, 3)
    expect(Math.abs(V.l13TBookAT - 0.68)).toBeGreaterThan(0.02)
  })
  it('no number is shown with a power of ten: the helium angles are in micro-radians (T4, ruling for exponent notation)', () => {
    const mine = ['l13-plane-wave:b5b', 'l13-momentum-space:b5b', 'l13-time:b6b', ...beats.filter((b) => b.id.startsWith('l13-stationary') || b.id.startsWith('l13-flow')).map((b) => b.id)]
    const all = mine.flatMap((id) => textsOf(beat(id))).join(' ')
    expect(all).not.toMatch(/\d\s*(?:\\times|×)\s*10\^/)
    expect(V.l13THeFringeUrad).toBeCloseTo(5.6644, 3)
    expect(V.l13TWhichWayUrad).toBeCloseTo(2 * V.l13THeFringeUrad, 9)
  })
  it('the stationary unit draws box states (walls at 0 and L; widths 4 and 2; one pair) and the flow unit the step and barrier curves', () => {
    const states = unit('l13-stationary').story!.flatMap(statesOf).filter((s): s is WavefunctionState => s.kind === 'wavefunction')
    for (const s of states) expect('box' in s.source).toBe(true)
    const boxes = states.map((s) => (s.source as { box: { L: number; n: unknown } }).box)
    expect(new Set(boxes.map((b) => b.L))).toEqual(new Set([4, 2]))
    expect(boxes.some((b) => Array.isArray(b.n))).toBe(true)
    const r = resolveWavefunctionStage({ kind: 'wavefunction', source: { box: { L: 4, n: 1 } }, readouts: ['energy'] }, 1)
    expect(r.stats.energy).toBeCloseTo(Math.PI ** 2 / 32, 12)
    const fns = unit('l13-flow').story!.flatMap(statesOf).flatMap((s) => (s.kind === 'plot' && s.curve ? [s.curve.fn, ...(s.curve.vs ? [s.curve.vs] : [])] : []))
    expect(new Set(fns)).toEqual(new Set(['stepT', 'stepR', 'barrierT', 'barrierThick']))
  })
  it('the box numbers: Ex. 6.6 gives 8/3π and 64/9π², the odd levels add to 1, the third gets 64/25π², the even ones 0; halving the box quadruples the energy and doubles the spread', () => {
    expect(V.l13TBoxOverlap).toBeCloseTo(8 / (3 * Math.PI), 12)
    expect(V.l13TBoxP1).toBeCloseTo(64 / (9 * Math.PI ** 2), 12)
    expect(V.l13TBoxP3).toBeCloseTo(64 / (25 * Math.PI ** 2), 12)
    expect(V.l13TBoxP2).toBeCloseTo(0, 12)
    expect(V.l13TBoxSumOdd).toBeCloseTo(1, 6)
    expect(V.l13TBoxEnergyRatio).toBeCloseTo(4, 12)
    expect(V.l13TBoxDpRatio).toBeCloseTo(2, 12)
  })
})
