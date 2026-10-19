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
import { L10_REVIEW } from './L10.review'
import { V } from './L10.values'
import { runCircuit } from '../physics/qc/circuit'
import type { Circuit } from '../physics/qc/circuit'
import { ampReadouts, resolveAmplitudes } from '../stage/svg/amplitudes'
import { BRIDGES_448 } from './bridges448'
import { layoutStates } from './stage'
import type { AmplitudesState, Beat, MatrixTableauState, TwoQubitState } from './stage'
import { bridgeRefs } from './walk'

const beats = L10.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) => [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])].flatMap((l) => layoutStates(l)).concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const prose = beats.filter((b) => b.id !== 'l10-no-table:b1').flatMap(textsOf)

describe('Lecture 10: shape', () => {
  it('eight units in the plan’s order with their beats, 32 challenges (5 of them Townsend-pass practice) and a review card each', () => {
    expect(L10.units.map((u) => u.id)).toEqual(['l10-local', 'l10-empty-centre', 'l10-correlations', 'l10-instructions', 'l10-ghz-game', 'l10-no-table', 'l10-quantum-wins', 'l10-what-ghz-proves'])
    expect(L10.units.map((u) => u.story!.length)).toEqual([7, 9, 10, 8, 5, 6, 8, 11])
    expect(L10.units.flatMap((u) => u.play)).toHaveLength(32)
    for (const u of L10.units) expect(u.review, u.id).toBeDefined()
    expect(beats.filter((b) => b.phase === 'clue')).toHaveLength(10)
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l10-local:b3', 'l10-local:b5b', 'l10-empty-centre:b1', 'l10-empty-centre:b7b', 'l10-correlations:b1', 'l10-correlations:b5b', 'l10-instructions:b4c', 'l10-no-table:b2', 'l10-quantum-wins:b3', 'l10-quantum-wins:b5'])
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

describe('Lecture 10: P-L10-review fixes (docs/roles/audits/P-L10-review.md)', () => {
  const beat = (id: string) => beats.find((b) => b.id === id)!
  const learner = (b: Beat) => [...textsOf(b), ...(b.refs ?? []).flatMap((r) => [r.where, r.adds])].join('\n')
  const unit = (id: string) => L10.units.find((u) => u.id === id)!

  it('item 1 (blocking): neither the review trap nor the unit pitfall says matched axes defeat a table; both say what a table can and cannot do', () => {
    const trap = L10_REVIEW['l10-correlations'].trap!
    const pit = (unit('l10-correlations').pitfalls ?? []).find((p) => p.startsWith('Treating'))!
    for (const t of [trap, pit]) {
      expect(t).not.toMatch(/struggles|push a table|together are what/)
      expect(t).toContain('copy all three matched axes') // a table CAN: 8 of the 64 (Unit 10.4)
      expect(t).toMatch(/8 of the 64/)
      expect(t).toMatch(/four GHZ conditions at once/) // what no table can do
      expect(t).toMatch(/mixed settings/)
    }
    // the numbers are the engine's: 8 of the 64 three-setting tables reproduce XX, YY and ZZ
    expect(V.l10Tables3).toBe(8)
    expect(V.l10Tables3Of).toBe(64)
  })
  it('item 2: the l10-no-table:b6 reveal caption describes the plan it draws (3 of 4), not a 50/50 average', () => {
    const r = beat('l10-no-table:b6').reveal!
    expect(r.caption).not.toMatch(/random|50\/50|average/)
    expect(r.caption).toMatch(/wins 3 of the 4 inputs/)
    const t = layoutStates(r.stage!)[0] as MatrixTableauState
    expect(Object.keys(t.values!).filter((k) => t.values![k] === t.targets![k])).toHaveLength(3)
    expect(Object.values(t.values!).every((v) => v === -1)).toBe(true) // “all four products are −1”
  })
  it('item 3: l10-quantum-wins:b5 draws both steps its caption names (after X_BX_C, then after Z_A); the second is −|G⟩', () => {
    const b = beat('l10-quantum-wins:b5')
    const st = b.stage as AmplitudesState
    const src = st.state as { circuit: Circuit; upTo: { from: number; to: number } }
    expect(src.upTo).toEqual({ from: 7, to: 8 })
    const run = runCircuit(src.circuit)
    const G = run.states[5]
    const after = (k: number) => run.states[k]
    // column 7 = X_B X_C |G⟩ (not ±|G⟩); column 8 = Z_A X_B X_C |G⟩ = −|G⟩
    expect(Math.max(...after(7).map((a, i) => Math.hypot(a.re - G[i].re, a.im - G[i].im)))).toBeGreaterThan(0.5)
    expect(Math.max(...after(7).map((a, i) => Math.hypot(a.re + G[i].re, a.im + G[i].im)))).toBeGreaterThan(0.5)
    expect(Math.max(...after(8).map((a, i) => Math.hypot(a.re + G[i].re, a.im + G[i].im)))).toBeLessThan(1e-9)
    expect(b.caption).toMatch(/X_BX_C.*Z_A/)
  })
  it('item 4: l10-correlations:b4 names the path and t before the caption uses t', () => {
    const b = beat('l10-correlations:b4')
    expect(b.text).toContain('\\cos t\\,|ud\\rangle - \\sin t\\,|du\\rangle')
    expect(b.text).toMatch(/t = 0/)
    expect(b.text).toMatch(/t = 45\^\\circ/)
    expect(b.caption).toMatch(/t = 30\^\\circ/)
    expect(b.caption).toMatch(/t = 45\^\\circ/)
  })
  it('item 5: no plan id (T1, T₁) in learner text; the l10-no-table:b5 caption names the lost input', () => {
    for (const b of beats) expect(learner(b), b.id).not.toMatch(/T₁|T₂|T₃|\bT[123]\b/)
    expect(beat('l10-no-table:b5').reveal!.caption).toMatch(/loses \$ZXX\$/)
  })
  it('item 6: “maximally entangled” is cited to §6.7 (with the end of §6.8 for the explanation), in the beat and in the unit', () => {
    const b = beat('l10-empty-centre:b7a')
    expect(b.refs!.some((r) => r.source === 'susskind' && r.where === '§6.7; end of §6.8')).toBe(true)
    expect(unit('l10-empty-centre').books.some((r) => r.source === 'susskind' && r.where === '§6.7; end of §6.8')).toBe(true)
    for (const r of [...b.refs!, ...unit('l10-empty-centre').books]) expect(r.where, 'the term is not at the end of §6.8 alone').not.toBe('end of §6.8')
  })
  it('items 7–9: the centre sentence gives a chance, the prepared spin is one spin, b7 says whose readout it is', () => {
    expect(beat('l10-empty-centre:b5').text).toMatch(/every axis gives \$\+1\$ with chance ½/)
    expect(beat('l10-empty-centre:b4').text).toMatch(/If the spin is prepared in state \$i\$/)
    expect(beat('l10-empty-centre:b7a').caption).toMatch(/is the pair’s, not Alice’s/)
    expect(beat('l10-empty-centre:b7a').text).toContain('\\mathrm{Tr}')
  })
  it('item 10: l10-what-ghz-proves captions state only what the stage draws (the product column, one input, the bars with bit 0)', () => {
    expect(beat('l10-what-ghz-proves:b1').caption).not.toMatch(/six fixed answers/)
    expect(beat('l10-what-ghz-proves:b1').caption).toMatch(/its product for each of the four inputs/)
    expect(beat('l10-what-ghz-proves:b5').caption).not.toMatch(/whatever the others measure/)
    expect(beat('l10-what-ghz-proves:b5').caption).toMatch(/the input \$ZXX\$/)
    expect(beat('l10-what-ghz-proves:b8').reveal!.caption).toMatch(/bars with Alice’s bit 0 total one half/)
  })
  it('item 11: every amplitude view built on a circuit hides the “after column” line; the resolver prints none for them', () => {
    const amps = beats.flatMap(statesOf).filter((s): s is AmplitudesState => s.kind === 'amplitudes' && 'circuit' in s.state)
    expect(amps.length).toBeGreaterThanOrEqual(8)
    for (const s of amps) {
      expect(s.showColumn).toBe(false)
      expect(ampReadouts(resolveAmplitudes(s, 0)).map((x) => x.name)).not.toContain('after')
    }
  })
  it('item 12: Try-it 2 of unit 7 points to the line above the table of rounds', () => {
    const tips = (unit('l10-quantum-wins').visual.tryThis ?? []).join('\n')
    expect(tips).toMatch(/line above the table of rounds/)
    expect(tips).not.toMatch(/under the ledger/)
  })
  it('item 13: Susskind’s Exercise 6.9 is credited on the sigma·tau beat, the unit books and the challenge title', () => {
    expect(beat('l10-correlations:b5a').text).toMatch(/Exercise 6\.9/)
    expect(beat('l10-correlations:b5a').refs![0].where).toMatch(/Exercise 6\.9/)
    expect(unit('l10-correlations').books[0].where).toMatch(/Exercise 6\.9/)
    expect(unit('l10-correlations').play.find((c) => c.id === 'l10-co-dot')!.title).toMatch(/Exercise 6\.9/)
  })
  it('item 14: the Rosetta beat does not coin a second “s” for an answer', () => {
    const t = beat('l10-no-table:b1').text
    expect(t).not.toMatch(/\$s = /)
    expect(t).toMatch(/Lecture 10 wrote it as a bit/)
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
      // ruling T7 (448-townsend.md): the Townsend teleportation beat is the one books beat that links out to 709
      if (b.phase === 'lecture' || (b.phase === 'books' && b.id !== 'l10-what-ghz-proves:b7c')) expect([...inText, ...inReveal], `${b.id} is the notes’ own line`).toEqual([])
      if (b.phase === 'clue') expect(inText, `${b.id}: the chip belongs in the reveal`).toEqual([])
    }
    const mine = ['sl-f6-operator', 'sl-q9-partial-trace', 'sl-q6-parities', 'sl-q10-chsh', 'sl-q10-hidden', 'sl-q10-no-signal', 'sl-q7-mermin']
    expect([...used].filter((id) => mine.includes(id)).sort()).toEqual([...mine].sort())
    for (const id of mine) expect(BRIDGES_448[id], id).toBeDefined()
    expect(bridgeRefs(beats.find((b) => b.id === 'l10-what-ghz-proves:b7c')!.text).sort()).toEqual(['sl-q11-teleport-circuit', 'sl-q13-no-cloning'])
    expect(BRIDGES_448['sl-q11-teleport-circuit']).toMatchObject({ course: 'qc709', lecture: 'Q11', unit: 'q11-teleport-circuit' })
  })
})

describe('Lecture 10: the Townsend pass (docs/roles/decisions/448-townsend.md)', () => {
  const find = (id: string) => beats.find((b) => b.id === id)!
  const NEW = ['l10-local:b5b', 'l10-empty-centre:b7b', 'l10-correlations:b5b', 'l10-instructions:b4b', 'l10-instructions:b4c', 'l10-instructions:b4d', 'l10-what-ghz-proves:b7b', 'l10-what-ghz-proves:b7c']
  it('eight new books beats, each citing Townsend by section and page, placed after the unit’s earlier books beat and before its clues', () => {
    for (const id of NEW) {
      const b = find(id)
      expect(b.phase, id).toBe('books')
      expect(b.text, id).toMatch(/Townsend §\d\.\d, pp?\. \d+/)
      expect(b.refs?.some((r) => r.source === 'townsend'), id).toBe(true)
    }
    for (const u of L10.units) {
      const arr = u.story!
      const firstClue = arr.findIndex((b) => b.phase === 'clue')
      for (const id of NEW.filter((n) => n.startsWith(`${u.id}:`))) {
        const at = arr.findIndex((b) => b.id === id)
        expect(at, id).toBeGreaterThan(-1)
        if (firstClue >= 0) expect(at, id).toBeLessThan(firstClue)
      }
    }
  })
  it('four derivations with two distinct views each; the units list a Townsend book entry', () => {
    for (const id of ['l10-local:b5b', 'l10-empty-centre:b7b', 'l10-correlations:b5b', 'l10-instructions:b4c']) {
      const views = find(id).derivation!.ground.filter((s) => s.view).map((s) => JSON.stringify(s.view))
      expect(new Set(views).size, id).toBeGreaterThanOrEqual(2)
    }
    for (const id of ['l10-local', 'l10-empty-centre', 'l10-correlations', 'l10-instructions', 'l10-what-ghz-proves']) expect(L10.units.find((u) => u.id === id)!.books.some((r) => r.source === 'townsend'), id).toBe(true)
  })
  it('the new visuals are engine pictures: Bell’s margin curve, the eight-table dots (y from V keys), the teleportation bars', () => {
    const curve = find('l10-instructions:b4d').stage as { kind: string; curve?: { fn: string } }
    expect(curve).toMatchObject({ kind: 'plot', curve: { fn: 'bellBisectGap' } })
    const pts = find('l10-instructions:b4c').stage as { points: { x: number; y: number }[] }
    expect(pts.points.map((p) => p.y)).toEqual([V.l10TwTableSame, ...Array(6).fill(V.l10TwTableMixed), V.l10TwTableSame])
    const tele = find('l10-what-ghz-proves:b7c').stage as AmplitudesState
    expect(tele.keep).toEqual([0, 1])
    expect(resolveAmplitudes(tele, 1).probs.every((p) => Math.abs(p - 0.25) < 1e-12)).toBe(true)
  })
  it('experimental numbers are in words only (ruling T4): no digits near the photon tests or the radio line', () => {
    const txt = [find('l10-instructions:b4d').text, find('l10-correlations:b5b').text].join('\n')
    expect(txt).not.toMatch(/\d+\s*standard deviations?|standard deviations?\s*\d|MHz|Hz\b|\b21 ?cm\b|µeV|eV\b|\b13 m\b/)
  })
  it('five practice questions, each tagged, with a full walkthrough and no homework label; none is assigned', () => {
    const pq = L10.units.flatMap((u) => u.play).filter((c) => c.practice)
    expect(pq.map((c) => c.id)).toEqual(['l10-pq-alice-z', 'l10-pq-x-conditional', 'l10-pq-phase-corr', 'l10-pq-biased-referee', 'l10-pq-stray-ghz'])
    for (const c of pq) {
      expect(c.walkthrough.length, c.id).toBeGreaterThan(0)
      expect(c.assigned, c.id).toBeUndefined()
      expect(JSON.stringify(c), c.id).not.toMatch(/\bH\d-\d/)
    }
    const ans = (id: string) => (pq.find((c) => c.id === id) as { answer: number }).answer
    expect(ans('l10-pq-alice-z')).toBeCloseTo(0.75, 12)
    expect(ans('l10-pq-x-conditional')).toBeCloseTo(0.0669872981, 9)
    expect(ans('l10-pq-phase-corr')).toBeCloseTo(Math.cos((50 * Math.PI) / 180), 12)
    expect(ans('l10-pq-biased-referee')).toBeCloseTo(5 / 6, 12)
    expect(ans('l10-pq-stray-ghz')).toBeCloseTo(Math.cos((20 * Math.PI) / 180) ** 2, 12)
    expect(pq.find((c) => c.id === 'l10-pq-phase-corr')!.practice).toBe('townsend')
    expect(pq.find((c) => c.id === 'l10-pq-phase-corr')!.refs?.[0].source).toBe('townsend')
  })
})

