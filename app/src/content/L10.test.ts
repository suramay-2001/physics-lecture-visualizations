/**
 * Lecture 10's own rulings as lints (docs/roles/decisions/448-L8L11.md, L10 section), on top of the platform lints every chapter passes:
 *   R1  the class marker "Class 11 starts here" is `Beat.classMark` on l10-quantum-wins:b1 and nowhere else; the notes' Lecture 11 recap
 *       is folded into unit 6 (one sentence);
 *   R2  Lecture 11's names throughout (A_Z, A_X, answers ±1, the strings ZZZ, ZXX, XZX, XXZ); the notes' bit encoding (A_0, A_1, inputs
 *       as bits) appears in ONE Rosetta caption, l10-no-table:b1;
 *   R3  "the source" prepares the tables, the players are Alice, Bob and Charlie plus "the referee"; "Davie" and "referee Charlie"
 *       appear only in the Rosetta caption;
 *   R4  Go-deeper material is the 'deeper' phase, last in its unit, introducing nothing;
 *   R5  the stage uses the matrix kind's pair view for two spins (no `labels: 'ud'` on amplitude bars: A4 dropped) and the additive
 *       two-qubit / amplitudes / tableau fields;
 *   R7  ONE `ghz-game` widget serves units 4-8, `two-spin` units 1-3.
 * Also: chips into 709 sit in clue reveals and Go-deeper beats only, and every table entry for this lecture is used.
 */
import { describe, expect, it } from 'vitest'
import { L10 } from './L10'
import { BRIDGES_448 } from './bridges448'
import { layoutStates } from './stage'
import type { AmplitudesState, Beat, MatrixTableauState, TwoQubitState } from './stage'
import { bridgeRefs } from './walk'

const beats = L10.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) => [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])].flatMap((l) => layoutStates(l)).concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const prose = beats.filter((b) => b.id !== 'l10-no-table:b1').flatMap(textsOf)

describe('Lecture 10: shape', () => {
  it('eight units in the plan’s order with their beats, 27 challenges and a review card each', () => {
    expect(L10.units.map((u) => u.id)).toEqual(['l10-local', 'l10-empty-centre', 'l10-correlations', 'l10-instructions', 'l10-ghz-game', 'l10-no-table', 'l10-quantum-wins', 'l10-what-ghz-proves'])
    expect(L10.units.map((u) => u.story!.length)).toEqual([6, 8, 9, 5, 5, 6, 8, 9])
    expect(L10.units.flatMap((u) => u.play)).toHaveLength(27)
    for (const u of L10.units) expect(u.review, u.id).toBeDefined()
    expect(beats.filter((b) => b.phase === 'clue')).toHaveLength(10)
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l10-local:b3', 'l10-empty-centre:b1', 'l10-correlations:b1', 'l10-no-table:b2', 'l10-quantum-wins:b3', 'l10-quantum-wins:b5'])
  })
  it('no challenge is assigned homework (no homework covers Lecture 10)', () => {
    for (const c of L10.units.flatMap((u) => u.play)) expect(c.assigned, c.id).toBeUndefined()
  })
})

describe('Lecture 10: R1 the class marker', () => {
  it('"Class 11 starts here" on l10-quantum-wins:b1 and nowhere else; unit 6 says Lecture 11 re-ran the proof', () => {
    expect(beats.filter((b) => b.classMark).map((b) => [b.id, b.classMark])).toEqual([['l10-quantum-wins:b1', { class: 11 }]])
    expect(beats.find((b) => b.id === 'l10-no-table:b3')!.text).toMatch(/Lecture 11 opened by re-running this proof/)
  })
})

describe('Lecture 10: R2 and R3 the names', () => {
  it('the notes’ bit encoding (A_0, A_1, inputs as bits) is only in the Rosetta caption', () => {
    const rosetta = beats.find((b) => b.id === 'l10-no-table:b1')!
    expect(rosetta.caption).toMatch(/Lecture 10 names the inputs by bits/)
    expect(rosetta.caption).toMatch(/A_0/)
    expect(prose.join('\n')).not.toMatch(/A_0|A_1|input bit|output bit|bits 000/)
    expect(L10.units.flatMap((u) => u.play.map((c) => JSON.stringify(c))).join('\n')).not.toMatch(/A_0|A_1/)
  })
  it('the players are Alice, Bob and Charlie; “Davie” and “referee Charlie” appear only in the Rosetta caption', () => {
    const all = prose.join('\n')
    expect(all).not.toMatch(/Davie|referee Charlie|Charlie the referee|Charlie prepares|Charlie hands/)
    expect(beats.find((b) => b.id === 'l10-no-table:b1')!.caption).toMatch(/Davie/)
    expect(all).toMatch(/Alice, Bob and Charlie/)
    expect(all).toMatch(/the referee/i)
  })
  it('the instruction tables come from “the source”, and Charlie is not met before the three-spin unit', () => {
    expect(beats.find((b) => b.id === 'l10-instructions:b1')!.text).toMatch(/the source/)
    const early = L10.units.slice(0, 4).flatMap((u) => (u.story ?? []).flatMap(textsOf)).join('\n')
    expect(early).not.toMatch(/Charlie/)
  })
})

describe('Lecture 10: R4 Go deeper', () => {
  it('four Go-deeper beats, each last in its unit, introducing nothing, with chips only where promised', () => {
    const deeper = beats.filter((b) => b.phase === 'deeper')
    expect(deeper.map((b) => b.id)).toEqual(['l10-correlations:b8', 'l10-correlations:b9', 'l10-quantum-wins:b8', 'l10-what-ghz-proves:b9'])
    for (const b of deeper) {
      expect(b.introduces ?? [], b.id).toEqual([])
      expect(b.classMark, b.id).toBeUndefined()
    }
  })
})

describe('Lecture 10: R5 the stage', () => {
  const states = beats.flatMap(statesOf)
  it('amplitude bars never carry a ud label set (A4 dropped); two spins are the matrix pair view', () => {
    for (const s of states.filter((x) => x.kind === 'amplitudes')) expect((s as AmplitudesState).labels, 'amplitudes labels').toBeUndefined()
    expect(states.some((s) => s.kind === 'matrix' && 'source' in s && 'coef' in s.source && s.labels === 'ud')).toBe(true)
  })
  it('the additive fields are used: the two-qubit pair family, the {terms} source and the tableau needs', () => {
    expect(states.some((s) => s.kind === 'two-qubit' && 'family' in (s as TwoQubitState).source && (s as TwoQubitState).source && ((s as TwoQubitState).source as { pair?: string }).pair === '01-10')).toBe(true)
    expect(states.some((s) => s.kind === 'amplitudes' && 'terms' in (s as AmplitudesState).state)).toBe(true)
    const tabs = states.filter((s): s is MatrixTableauState => s.kind === 'matrix' && 'tableau' in s)
    expect(tabs.some((t) => t.targets !== undefined)).toBe(true)
    expect(tabs.every((t) => t.players !== undefined)).toBe(true)
  })
  it('a plan’s card is the engine’s: every `values` card on stage is one of the three CARD tables', () => {
    const tabs = states.filter((s): s is MatrixTableauState => s.kind === 'matrix' && 'tableau' in s && (s as MatrixTableauState).values !== undefined && (s as MatrixTableauState).targets !== undefined)
    expect(tabs.length).toBeGreaterThan(5)
    for (const t of tabs) {
      const v = t.values!
      const wins = Object.keys(v).filter((r) => v[r] === t.targets![r]).length
      expect([1, 3]).toContain(wins) // every plan wins an odd number of the four inputs
      expect(Object.keys(v).reduce((p, r) => p * v[r], 1), 'a card’s four row products multiply to +1').toBe(1)
    }
  })
})

describe('Lecture 10: R7 the Try-it widgets', () => {
  it('units 1–3 are the two-spin widget and units 4–8 the one ghz-game widget', () => {
    expect(L10.units.map((u) => u.visual.kind)).toEqual(['two-spin', 'two-spin', 'two-spin', 'ghz-game', 'ghz-game', 'ghz-game', 'ghz-game', 'ghz-game'])
    expect(L10.units.map((u) => (u.visual.props as { mode?: string } | undefined)?.mode)).toEqual([undefined, undefined, undefined, 'pair', 'table', 'table', 'quantum', 'both'])
  })
})

describe('Lecture 10: chips into Physics 709', () => {
  it('sit in clue reveals and Go-deeper beats only, and every table entry is used', () => {
    const used = new Set<string>()
    for (const b of beats) {
      const inText = bridgeRefs(b.text)
      const inReveal = bridgeRefs(b.reveal?.text ?? '')
      for (const id of [...inText, ...inReveal]) used.add(id)
      if (b.phase === 'lecture' || b.phase === 'books') expect([...inText, ...inReveal], `${b.id} is the notes’ own line`).toEqual([])
      if (b.phase === 'clue') expect(inText, `${b.id}: the chip belongs in the reveal`).toEqual([])
    }
    const mine = ['sl-f6-operator', 'sl-q9-partial-trace', 'sl-q6-parities', 'sl-q10-chsh', 'sl-q10-hidden', 'sl-q10-no-signal', 'sl-q7-mermin']
    expect([...used].filter((id) => mine.includes(id)).sort()).toEqual([...mine].sort())
    for (const id of mine) expect(BRIDGES_448[id], id).toBeDefined()
  })
})
