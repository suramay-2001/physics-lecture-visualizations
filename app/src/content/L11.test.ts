/**
 * Lecture 11's own rulings as lints (docs/roles/decisions/448-L8L11.md, L11 section R1-R8, and P1-P6), on top of the platform lints
 * every chapter passes:
 *   R1  the `clocks` kind is drawn only in the last unit (and its widget is that unit's Try-it);
 *   R2  every clocks picture uses E₊ = 3ε and E₋ = ε, except the one "raise both levels" reveal (6ε and 4ε);
 *   R3  P(+x; t) = cos²(ωt/2) is in Go deeper 3 and nowhere in the notes' own line;
 *   R4  no class marker; the lecture's header reads "Class 11, second half"; ONE beat links back to Lecture 10's GHZ argument;
 *   R5  "≅" is stated once, in `l11-two-level:b2`, and the notes' "∼" is never used;
 *   R6  the `hamiltonian` gloss keeps `first` at Lecture 6, and `l11-generator:b2` is the one beat that introduces it;
 *   R7  the N-step overshoot numbers live only in Go deeper 2 (and its stretch challenge), never in `l11-generator:b3`;
 *   R8  Susskind & Friedman Lecture 4 is the books layer; Townsend appears only with the pages the plan names;
 *   P2  the three Go-deeper beats are the planned ones and carry no chip into the notes' own line;
 *   P4  chips into Physics 709 sit in Go-deeper beats only, each table entry used once.
 * Also: the unit order and beat counts match the plan, every text balances its dollar signs, and Rosetta R1 (θ(t) is the azimuth φ(t)).
 */
import { describe, expect, it } from 'vitest'
import { L11 } from './L11'
import { BRIDGES_448 } from './bridges448'
import { GLOSSARY } from './glossary'
import { layoutStates } from './stage'
import type { Beat, ClocksState, ComplexPlaneState, MatrixTableauState } from './stage'
import { bridgeRefs } from './walk'
import { complexReadouts, resolveComplexPlane } from '../stage/svg/complexPlane'
import { clocksReadouts, resolveClocksStage } from '../stage/svg/clocks'
import { matrixReadouts, resolveMatrixStage } from '../stage/svg/matrix'
import { ERROR_ROUNDS } from '../arcade/games'
import { L10 } from './L10'
import { V } from './L11.values'

const beats = L11.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
/** Every string inside a plain value, one by one (so each can be linted on its own). */
const leaves = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(leaves) : x && typeof x === 'object' ? Object.values(x).flatMap(leaves) : [])
const unitTexts = () =>
  L11.units.flatMap((u) => [u.title, u.question, u.lecture.summary, ...(u.lecture.equations ?? []), u.insight, ...(u.pitfalls ?? []), ...u.visual.tryThis, ...leaves(u.review), ...leaves(u.play)])
const allTexts = () => [...beats.flatMap(textsOf), ...unitTexts()]
const notesLine = beats.filter((b) => b.phase !== 'deeper')

describe('Lecture 11: shape', () => {
  it('has the six planned units in order, with the planned beat counts (36 on the notes’ line, 3 Go-deeper beats)', () => {
    expect(L11.units.map((u) => u.id)).toEqual(['l11-wait', 'l11-unitary', 'l11-generator', 'l11-schrodinger', 'l11-stationary', 'l11-two-level'])
    expect(L11.units.map((u) => (u.story ?? []).filter((b) => b.phase !== 'deeper').length)).toEqual([5, 5, 6, 6, 5, 9])
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['l11-unitary:b6', 'l11-generator:b7', 'l11-two-level:b10'])
    expect(beats.filter((b) => b.phase === 'clue')).toHaveLength(7)
    expect(beats.filter((b) => b.phase === 'books')).toHaveLength(6)
    expect(beats.filter((b) => b.derivation)).toHaveLength(6)
    expect(L11.units.reduce((n, u) => n + u.play.length, 0)).toBe(18)
  })
  it('every text balances its dollar signs (a stray one would typeset the rest of the sentence as TeX)', () => {
    for (const t of allTexts()) {
      const flat = t.replace(/\\\$/g, '').replace(/\$\$/g, '')
      expect((flat.match(/\$/g) ?? []).length % 2, t.slice(0, 80)).toBe(0)
    }
  })
})

describe('Lecture 11: R1 and R2 the phase clocks', () => {
  it('the clocks kind is drawn in the last unit only, and its example levels are 3ε and ε (6ε and 4ε only in the one shift reveal)', () => {
    for (const u of L11.units) {
      const clocks = (u.story ?? []).flatMap(statesOf).filter((s): s is ClocksState => s.kind === 'clocks')
      if (u.id !== 'l11-two-level') expect(clocks, u.id).toHaveLength(0)
      else expect(clocks.length).toBeGreaterThan(6)
      for (const s of clocks) expect(s.start ?? '+x').toBe('+x')
    }
    const shifted = beats.flatMap(statesOf).filter((s): s is ClocksState => s.kind === 'clocks' && s.levels.upper !== 3)
    expect(shifted).toHaveLength(1)
    expect(shifted[0].levels).toEqual({ upper: 6, lower: 4 })
    expect(L11.units.find((u) => u.id === 'l11-two-level')!.visual).toMatchObject({ kind: 'two-clocks', props: { upper: 3, lower: 1, start: '+x' } })
  })
  it('the example Hamiltonian is H = diag(3ε, ε) wherever the lecture draws one', () => {
    const ops = beats.flatMap(statesOf).filter((s) => s.kind === 'operator-space')
    expect(ops.length).toBeGreaterThan(3)
    for (const s of ops) expect(s).toMatchObject({ op: { a0: 2, a: [0, 0, 1] } })
  })
})

describe('Lecture 11: R3 and R7 where the extra numbers live', () => {
  it('P(+x; t) = cos²(ωt/2) and ⟨S_x⟩ = ½ħ cos ωt appear in Go deeper 3 only', () => {
    for (const b of beats) {
      const t = textsOf(b).join(' ')
      if (b.id === 'l11-two-level:b10') {
        expect(t).toMatch(/\\cos\^2\(\\omega t\/2\)/)
        expect(t).toMatch(/Beyond the notes/)
      } else expect(t, b.id).not.toMatch(/\\cos\^2\(\\omega t\/2\)|\\langle S_x\\rangle = /)
    }
  })
  it('the N-step overshoot numbers (3.467, 1.276, 1.025, 1.0025, the Euler sizes) are in Go deeper 2 and its challenge, not in the notes’ beat l11-generator:b3', () => {
    const b3 = beats.find((b) => b.id === 'l11-generator:b3')!
    const b7 = beats.find((b) => b.id === 'l11-generator:b7')!
    for (const n of ['3.467', '1.276', '1.025', '1.0025', '1.862', '1.332', '1.0195']) {
      expect(textsOf(b3).join(' '), n).not.toContain(n)
      expect(textsOf(b7).join(' '), n).toContain(n)
    }
    for (const b of notesLine) for (const n of ['3.467', '1.276', '1.0025', '1.862', '1.0195']) expect(textsOf(b).join(' '), `${b.id} ${n}`).not.toContain(n)
    expect(b7.phase).toBe('deeper')
    expect(b7.text).toMatch(/Beyond the notes/)
  })
  it('P-L11-review item 1: no overshoot size is READ OUT in the picture of any beat on the notes’ line (the complex-plane kind’s Euler readout)', () => {
    const planes = notesLine.flatMap(statesOf).filter((s): s is ComplexPlaneState => s.kind === 'complex-plane')
    expect(planes.length).toBeGreaterThan(0)
    const b3 = beats.find((b) => b.id === 'l11-generator:b3')!
    const b3planes = statesOf(b3).filter((s): s is ComplexPlaneState => s.kind === 'complex-plane')
    expect(b3planes).toHaveLength(1)
    expect((b3planes[0].euler as { size?: boolean }).size).toBe(false)
    for (const s of planes.filter((p) => p.euler))
      for (const at of [0, 0.25, 0.5, 0.75, 1]) {
        const lines = complexReadouts(resolveComplexPlane(s, at)).map((x) => `${x.name}: ${x.text}`)
        for (const l of lines) expect(l, `${l} at ${at}`).not.toMatch(/^euler-(size|end)/)
        for (const n of ['1.862', '1.332', '1.019']) expect(lines.join(' | '), n).not.toContain(n)
      }
    // Go deeper 2 keeps the numbers in its text
    const b7 = beats.find((b) => b.id === 'l11-generator:b7')!
    for (const n of ['1.862', '1.332', '1.019']) expect(textsOf(b7).join(' '), n).toContain(n)
  })
})

describe('Lecture 11: R4 no class marker, one link back to Lecture 10', () => {
  it('no beat carries a class marker, and the lecture header reads "Class 11, second half"', () => {
    for (const b of beats) expect(b.classMark, b.id).toBeUndefined()
    expect(L11.date).toBe('Class 11, second half')
  })
  it('exactly one beat recalls Lecture 10’s GHZ argument, it is the first of the lecture, and it defines nothing', () => {
    const mentions = beats.filter((b) => /Lecture 10|Unit 10\.\d/.test(textsOf(b).join(' ')))
    expect(mentions.map((b) => b.id)).toEqual(['l11-wait:b1'])
    expect(mentions[0].introduces).toBeUndefined()
    expect(mentions[0].phase).toBe('lecture')
    expect(mentions[0].text).toMatch(/GHZ/)
    // the notes' L11 §11.1–11.3 are Chapter 10's: nothing else in this lecture re-teaches the game
    for (const b of beats.filter((x) => x.id !== 'l11-wait:b1')) expect(textsOf(b).join(' '), b.id).not.toMatch(/GHZ|referee|instruction table/)
  })
})

describe('Lecture 11: R5 and R6 notation', () => {
  it('the Rosetta l11-two-level:b2 says the notes write “∼” and this app writes ≅; the tilde appears nowhere else', () => {
    const where = (re: RegExp) => beats.flatMap((b) => textsOf(b).map((t, i) => (re.test(t) ? `${b.id}#${i}` : ''))).filter(Boolean)
    expect(where(/is the same state as|equal up to an overall phase/)).toEqual(['l11-two-level:b2#0'])
    const rosetta = beats.find((b) => b.id === 'l11-two-level:b2')!.text
    expect(rosetta).toMatch(/The notes write \$Z\$ for \$\\sigma_z\$ and “∼” for “is the same state as”/)
    expect(rosetta).toMatch(/This app writes \$\\cong\$/)
    expect(where(/∼/)).toEqual(['l11-two-level:b2#0'])
    for (const t of allTexts()) expect(t, t.slice(0, 60)).not.toMatch(/\\sim/)
  })
  it('the hamiltonian gloss keeps first at Lecture 6 and is introduced (as notation) by l11-generator:b2 only', () => {
    const g = GLOSSARY.get('hamiltonian')!
    expect(g.first).toBe('l6-generator:b7')
    expect(g.introduces).toBe('notation')
    const hits = beats.filter((b) => b.introduces?.includes('hamiltonian')).map((b) => b.id)
    expect(hits).toEqual(['l11-generator:b2'])
    expect(beats.find((b) => b.id === 'l11-generator:b2')!.phase).toBe('lecture')
  })
  it('Rosetta R1: the notes’ θ(t) is the azimuth φ(t), named in one beat; φ(t) = ωt is never written θ(t) = ωt', () => {
    const b4 = beats.find((b) => b.id === 'l11-two-level:b4')!
    expect(b4.text).toMatch(/The notes call the azimuth \$\\theta\(t\)\$; here it is \$\\varphi\(t\)\$/)
    for (const t of allTexts()) expect(t, t.slice(0, 60)).not.toMatch(/\\theta\(t\) = \\omega t/)
  })
  it('the word "mixture" is used only to say the superposition is not one', () => {
    for (const t of allTexts().filter((x) => /mixture/i.test(x))) expect(t).toMatch(/superposition|is a different object/)
  })
})

describe('Lecture 11: P-L11-review fixes (docs/roles/audits/P-L11-review.md)', () => {
  const beat = (id: string) => beats.find((b) => b.id === id)!
  const unit = (id: string) => L11.units.find((u) => u.id === id)!

  it('item 2: l11-wait:b1 draws the GHZ tableau (eigenvalues +1, −1, −1, −1 against the needs: wins 4 of 4), so its caption’s ±1 are on the picture and no circuit cursor is printed', () => {
    const st = statesOf(beat('l11-wait:b1'))
    expect(st).toHaveLength(1)
    const tab = st[0] as MatrixTableauState
    expect(tab.kind).toBe('matrix')
    expect(tab.tableau).toEqual(['ZZZ', 'ZXX', 'XZX', 'XXZ'])
    const r = resolveMatrixStage(tab, 1)
    expect(r.view).toBe('tableau')
    if (r.view !== 'tableau') throw new Error('tableau')
    expect(r.rows.map((x) => x.eigen)).toEqual([1, -1, -1, -1])
    expect(r.rows.every((x) => x.ok === true)).toBe(true)
    expect(r.wins).toEqual({ k: 4, of: 4 })
    const printed = matrixReadouts(r).map((x) => x.text).join(' | ')
    expect(printed).not.toMatch(/after column/)
    expect(beat('l11-wait:b1').caption).toMatch(/its eigenvalue is \+1 on ZZZ and −1 on the other three/)
    expect(beat('l11-wait:b1').caption).not.toMatch(/basis states of size/) // the bars are gone, so is their claim
  })
  it('item 4: l11-schrodinger:b2 quotes the rate as −iE/ħ times the amplitude, not as a number for the pictured |+x⟩', () => {
    const c = beat('l11-schrodinger:b2').caption!
    expect(c).not.toMatch(/at \$t = 0\$ the \$\|\{\+z\}\\rangle\$ amplitude changes at the rate/)
    expect(c).toMatch(/each amplitude changes at \$-i\/\\hbar\$ times its energy times itself/)
    expect(c).toMatch(/-3i\\,\\varepsilon\/\\hbar\$ times that amplitude/)
    expect(V.l11DerivZ).toBeCloseTo(-3, 12) // the rate of the amplitude of a spin that STARTS in |+z⟩
  })
  it('item 5: the two-clocks Try-it 3 says the lone hand turns while the arrow and P(+x) stand still (and the engine agrees)', () => {
    const tips = unit('l11-two-level').visual.tryThis
    expect(tips[2]).not.toMatch(/nothing moves/)
    expect(tips[2]).toMatch(/that hand turns/)
    expect(tips[2]).toMatch(/the arrow and P\(\+x\) never move/)
    const at = (t: number) => resolveClocksStage({ kind: 'clocks', levels: { upper: 3, lower: 1 }, start: '+z', timeDeg: t, readouts: ['phases', 'px'] }, 1)
    const a = at(10)
    const b = at(40)
    expect(a.hands.angleDeg[0]).not.toBeCloseTo(b.hands.angleDeg[0], 3) // the one hand turns: −3t
    expect(a.px).toBeCloseTo(0.5, 12)
    expect(b.px).toBeCloseTo(0.5, 12)
    expect(clocksReadouts(a).map((x) => x.text).join(' ')).toMatch(/hand/)
  })
  it('item 6: l11-stationary:b4 caption describes H alone (levels and midpoint), not a state that moves', () => {
    const c = beat('l11-stationary:b4').caption!
    expect(c).toMatch(/^H alone: its two levels/)
    expect(c).not.toMatch(/while the state moves/)
  })
  it('item 7: “mixes” is not used for superpositions (the lecture reserves “mixture”)', () => {
    for (const t of allTexts()) expect(t, t.slice(0, 60)).not.toMatch(/\bmixes\b|\bequal mix\b/i)
    expect(leaves(unit('l11-stationary').play).join('\n')).toMatch(/equal superpositions of the two energies/)
  })
  it('item 8: no hand-typed decimal in the walkthroughs or the Arcade (exact forms; the one printed number comes from V)', () => {
    const play = leaves(unit('l11-unitary').play).join('\n')
    expect(play).not.toMatch(/1\.207|0\.207|0\.707 \+ 0\.5/)
    expect(play).toContain('\\tfrac{(1 + 1/\\sqrt2)^2}{2} + \\tfrac14')
    const round = ERROR_ROUNDS.find((x) => x.id === 'l11-keeps-z')!
    expect(round.why).not.toMatch(/1\.707/)
    expect(round.why).toContain('\\tfrac{1}{\\sqrt2}')
  })
  it('item 9: the generator Try-it uses the widget’s letter n and links it to the notes’ N once', () => {
    const v = unit('l11-generator').visual
    expect(v.caption).toMatch(/^n tiny turns chained/)
    expect(v.tryThis[0]).toMatch(/n = 1 \(the notes’ \$N\$/)
  })
  it('item 10: the stationary Try-it 1 does not call the pictured |+x⟩ an energy eigenstate', () => {
    const t = unit('l11-stationary').visual.tryThis[0]
    expect(t).not.toMatch(/energy eigenstate’s ket changes in just this way/)
    expect(t).toMatch(/An overall phase changes nothing observable; that is all an energy eigenstate ever gains/)
  })
  it('item 11: no chip label carries a raw underscore', () => {
    for (const [id, t] of Object.entries(BRIDGES_448)) expect(t.label, id).not.toMatch(/_/)
    expect(BRIDGES_448['sl-q4-one-qubit-gates'].label).toBe('One-qubit gates, the z rotation among them')
  })
  it('item 12: the value comments in L11.values.ts match the engine (to the digits they print)', () => {
    const src = Object.values(import.meta.glob<string>('/src/content/L11.values.ts', { query: '?raw', import: 'default', eager: true }))[0]
    for (const key of ['l11Over10', 'l11Over100', 'l11Over1000', 'l11Err1', 'l11Err10', 'l11Err100', 'l11Err1000', 'l11Euler1', 'l11Euler4', 'l11Euler64']) {
      const line = src.split('\n').find((l: string) => l.trimStart().startsWith(`${key}:`))!
      const m = /\/\/\s*(-?\d+\.(\d+))/.exec(line)!
      const half = 0.5 * 10 ** -m[2].length
      expect(Math.abs(Number(m[1]) - (V as unknown as Record<string, number>)[key]), `${key} says ${m[1]}`).toBeLessThanOrEqual(half + 1e-12)
    }
  })
  it('item 14: the recap names Unit 10.8 by its title (the eighth unit of Lecture 10)', () => {
    expect(beat('l11-wait:b1').text).toMatch(/\(Unit 10\.8, What the game proves\)/)
    expect(L10.units[7].title).toMatch(/^What the game proves/)
  })
})

describe('Lecture 11: R8 books and P2, P4 platform rulings', () => {
  it('the books layer is Susskind & Friedman Lecture 4 (§4.1–4.13); Townsend is cited once, §2.2 pp. 36–37', () => {
    const refs = beats.filter((b) => b.phase === 'books').flatMap((b) => b.refs ?? [])
    expect(refs).toHaveLength(7)
    expect(refs.filter((r) => r.source === 'susskind').map((r) => r.where)).toEqual(['§4.1–4.3', '§4.2–4.4', '§4.5–4.6', '§4.12–4.13', '§4.8, §4.10', '§4.11'])
    expect(refs.filter((r) => r.source === 'townsend').map((r) => r.where)).toEqual(['§2.2, pp. 36–37'])
    for (const u of L11.units) for (const r of u.books) expect(['susskind', 'townsend']).toContain(r.source)
  })
  it('Go-deeper beats are optional: none introduces anything, and the Try-it lines never lean on them', () => {
    for (const b of beats.filter((x) => x.phase === 'deeper')) {
      expect(b.introduces, b.id).toBeUndefined()
      expect(b.classMark, b.id).toBeUndefined()
      expect(b.text, b.id).toMatch(/^Beyond the notes:/)
    }
    for (const u of L11.units) for (const t of u.visual.tryThis) expect(t, u.id).not.toMatch(/beyond the notes|Go deeper/i)
    // the unit of every Go-deeper beat ends with it, after every clue
    for (const u of L11.units) {
      const phases = (u.story ?? []).map((b) => b.phase)
      const first = phases.indexOf('deeper')
      if (first >= 0) expect(phases.slice(first).every((p) => p === 'deeper')).toBe(true)
    }
  })
  it('chips into Physics 709 sit in Go-deeper beats only, and each table entry is used once', () => {
    const used: string[] = []
    for (const b of beats) {
      const inText = bridgeRefs(b.text)
      const inReveal = bridgeRefs(b.reveal?.text ?? '')
      used.push(...inText, ...inReveal)
      if (b.phase !== 'deeper') expect([...inText, ...inReveal], `${b.id} is the notes’ own line`).toEqual([])
    }
    expect(used.sort()).toEqual(['sl-f1-euler', 'sl-f4-unitary', 'sl-q4-one-qubit-gates'])
    for (const id of used) expect(BRIDGES_448[id], id).toBeDefined()
  })
})
