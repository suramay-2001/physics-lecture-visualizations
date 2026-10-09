/**
 * Lecture 9's own rulings as lints (docs/roles/decisions/448-L8L11.md, L9 section), on top of the platform lints every chapter passes:
 *   R1  no `pair-grid` STAGE kind: every picture is the `matrix` kind's pair view (a `table` source or a `coef` source with
 *       pair fields), and the Try-it widget is the one `pair-grid` WIDGET;
 *   R2  exactly one class marker, "Class 9 · from minute 23", on l9-tensor:b1;
 *   R3  Rosetta: the notes' |ϕ⟩_B appears only in the caption that renames it; the proof's a, b, c, d likewise;
 *   R4  the determinant test and the product verdict (and the Try-it's opt-in switch) appear ONLY in Go-deeper beats;
 *   R6  the chapter stops at "the pair has a state, the spins do not": nothing here says what is known of each spin;
 *   R8  the dealer is "the dealer": Charlie is named once, in the caption that says the notes use that name.
 * Also: chips into 709 sit in clue reveals and Go-deeper beats only; the unit order and beat counts match the plan.
 */
import { describe, expect, it } from 'vitest'
import { L9 } from './L9'
import { BRIDGES_448 } from './bridges448'
import { layoutStates } from './stage'
import type { Beat, MatrixGridState } from './stage'
import { bridgeRefs } from './walk'

const beats = L9.units.flatMap((u) => u.story ?? [])
const matrixStatesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']

describe('Lecture 9: shape', () => {
  it('six units in the plan’s order, 6 + 6 + 6 + 6 + 7 + 8 beats, 18 challenges, a review card each', () => {
    expect(L9.units.map((u) => u.id)).toEqual(['l9-tensor', 'l9-classical', 'l9-two-spins', 'l9-product', 'l9-counting', 'l9-singlet'])
    expect(L9.units.map((u) => u.story!.length)).toEqual([6, 6, 6, 6, 7, 8])
    expect(L9.units.flatMap((u) => u.play)).toHaveLength(18)
    for (const u of L9.units) expect(u.review, u.id).toBeDefined()
    expect(beats.filter((b) => b.phase === 'clue')).toHaveLength(7)
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['l9-counting:b7', 'l9-singlet:b8'])
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l9-classical:b3', 'l9-product:b2', 'l9-product:b4', 'l9-counting:b3', 'l9-singlet:b3'])
  })
})

describe('Lecture 9: R1 no pair-grid stage kind', () => {
  it('every stage and derivation view of every beat is the matrix kind’s pair view', () => {
    for (const b of beats) {
      const states = matrixStatesOf(b)
      expect(states.length, b.id).toBeGreaterThan(0)
      for (const st of states) {
        expect(st.kind, `${b.id}`).toBe('matrix')
        const g = st as MatrixGridState
        expect('table' in g.source || 'coef' in g.source, `${b.id}: a table or a coef source`).toBe(true)
        if ('coef' in g.source) expect(g.labels === 'ud' || g.cells !== undefined || g.factors !== undefined || g.readouts !== undefined, `${b.id}: a coef source with pair fields`).toBe(true)
      }
    }
  })
  it('the six Try-it widgets are the one pair-grid widget', () => {
    expect(L9.units.map((u) => u.visual.kind)).toEqual(Array(6).fill('pair-grid'))
  })
})

describe('Lecture 9: R2 the class marker', () => {
  it('"Class 9 · from minute 23" on l9-tensor:b1 and nowhere else', () => {
    expect(beats.filter((b) => b.classMark).map((b) => [b.id, b.classMark])).toEqual([['l9-tensor:b1', { class: 9, from: 'minute 23' }]])
  })
})

describe('Lecture 9: R3 Rosetta lines', () => {
  it('the notes’ |ϕ⟩_B and a, b, c, d appear only in the captions that rename them', () => {
    const where = (re: RegExp) => beats.flatMap((b) => textsOf(b).map((t, i) => (re.test(t) ? `${b.id}#${i}` : ''))).filter(Boolean)
    expect(where(/\\phi\\rangle_B/)).toEqual(['l9-product:b1#1'])
    expect(where(/a, b, c, d/)).toEqual(['l9-singlet:b3#1'])
    expect(beats.find((b) => b.id === 'l9-classical:b1')!.caption).toContain('numbers painted on coins')
  })
})

describe('Lecture 9: R4 the determinant test is Go-deeper only', () => {
  it('only a Go-deeper beat (or its views) asks the stage for a det or a product readout', () => {
    for (const b of beats) {
      const readouts = matrixStatesOf(b).flatMap((s) => (s as MatrixGridState).readouts ?? [])
      const testy = readouts.filter((r) => r === 'det' || r === 'product')
      if (b.phase === 'deeper') continue
      expect(testy, `${b.id} (${b.phase}) shows the factoring test`).toEqual([])
    }
    const deeper = beats.filter((b) => b.phase === 'deeper').flatMap((b) => matrixStatesOf(b).flatMap((s) => (s as MatrixGridState).readouts ?? []))
    expect(deeper).toContain('product')
    expect(deeper).toContain('det')
  })
  it('the formula and the word "determinant" are not in the notes’ own line (beats, Try-it, intuition, review, challenges)', () => {
    const own = [
      ...beats.filter((b) => b.phase !== 'deeper').flatMap(textsOf),
      ...L9.units.flatMap((u) => [u.insight, ...(u.pitfalls ?? []), u.lecture.summary, ...u.visual.tryThis.filter((t) => !t.startsWith('Go deeper')), JSON.stringify(u.review)]),
      ...L9.units.flatMap((u) => u.play.map((c) => JSON.stringify(c))),
    ]
    for (const t of own) expect(t, t.slice(0, 60)).not.toMatch(/determinant|\\psi_\{uu\}\\psi_\{dd\} -|factoring test/i)
  })
  it('the one Try-it line that mentions the test says it is beyond the notes and the widget switch is opt-in', () => {
    const lines = L9.units.flatMap((u) => u.visual.tryThis).filter((t) => /factoring test/.test(t))
    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatch(/^Go deeper \(beyond the notes\)/)
    for (const u of L9.units) expect(u.visual.props).not.toHaveProperty('showDet')
  })
})

describe('Lecture 9: R6 and R8', () => {
  it('stops at "the pair has a state, the spins do not": no beat says what is known about one spin', () => {
    const all = beats.flatMap(textsOf).join('\n')
    expect(all).not.toMatch(/nothing is known|reduced state|each spin alone (shows|reads|gives)/i)
    expect(beats.find((b) => b.id === 'l9-singlet:b5')!.text).toMatch(/Lecture 10/)
  })
  it('the dealer is “the dealer”; Charlie is named once, to say the notes use that name', () => {
    const named = beats.flatMap((b) => textsOf(b).map((t, i) => (/Charlie/.test(t) ? `${b.id}#${i}` : ''))).filter(Boolean)
    expect(named).toEqual(['l9-classical:b1#1'])
    expect(beats.find((b) => b.id === 'l9-classical:b1')!.text).toMatch(/A dealer/)
  })
})

describe('Lecture 9: chips into Physics 709', () => {
  it('sit in clue reveals and Go-deeper beats only, and every table entry is used', () => {
    const used = new Set<string>()
    for (const b of beats) {
      const inText = bridgeRefs(b.text)
      const inReveal = bridgeRefs(b.reveal?.text ?? '')
      for (const id of [...inText, ...inReveal]) used.add(id)
      if (b.phase === 'lecture' || b.phase === 'books') expect([...inText, ...inReveal], `${b.id} is the notes’ own line`).toEqual([])
      if (b.phase === 'clue') expect(inText, `${b.id}: the chip belongs in the reveal`).toEqual([])
    }
    expect([...used].sort()).toEqual(Object.keys(BRIDGES_448).filter((k) => ['sl-f6-pairs', 'sl-f6-kron', 'sl-f6-growth', 'sl-f6-product-or-not', 'sl-q6-entangled', 'sl-q9-schmidt'].includes(k)).sort())
  })
})

describe('Lecture 9: the P review (P-L9-review.md) fixes', () => {
  const find = (id: string) => beats.find((b) => b.id === id)!
  it('item 1: the singlet caption writes α_u … in TeX, not as raw subscripts', () => {
    const c = find('l9-singlet:b3').caption!
    expect(c).toContain('$\\alpha_u, \\alpha_d, \\beta_u, \\beta_d$')
    expect(c.replace(/\$[^$]*\$/g, ''), 'outside $…$').not.toMatch(/_/) // the 448 raw-TeX lint (content.test.tsx) holds this for every string
  })
  it('item 2: the photon-die caption claims boxes, not chances (the frame table draws no chance); the 1/12 stays in the text', () => {
    const b = find('l9-tensor:b4')
    expect(b.caption).toBe('$2 \\times 6 = 12$ basis states, one box each')
    expect(b.text).toMatch(/chance \$\$?\\tfrac\{1\}\{12\}/)
  })
  it('item 3: both counting sweeps name their path and the letter t before the verdict', () => {
    for (const id of ['l9-counting:b5', 'l9-counting:b7']) expect(find(id).caption, id).toMatch(/\$\\cos t\\,\|ud\\rangle - \\sin t\\,\|du\\rangle\$, with \$t\$ from/)
    expect(find('l9-counting:b5').caption).not.toMatch(/product/)
    expect(find('l9-counting:b7').caption).toMatch(/only \$t = 0\$ is a product/)
    expect(L9.symbols!.t).toBe('l9-counting:b5')
  })
  it('item 4: the product sweep caption holds at the end of its own sweep (θ_A = 180°)', () => {
    expect(find('l9-product:b3').caption).toBe('each row is Bob’s row times one of Alice’s amplitudes')
  })
  it('item 5: the two-spin basis is linked at l9-two-spins:b2', () => {
    expect(find('l9-two-spins:b2').text).toMatch(/^\[\[two-spin-basis\|/)
  })
  it('items 7–8, 10: the coin scores a and b are named; Alice learns Bob’s coin from hers; “each spin’s state space”', () => {
    expect(find('l9-classical:b3').text).toMatch(/^Write \$a\$ and \$b\$ for the two scores\./)
    expect(find('l9-classical:b4').text).toMatch(/Looking at her own coin tells her which one Bob holds/)
    expect(find('l9-two-spins:b1').text).toMatch(/Each spin’s state space has two dimensions/)
  })
  it('item 9: the singlet summary names the step α_u ≠ 0 before β_u = 0', () => {
    expect(L9.units.find((u) => u.id === 'l9-singlet')!.lecture.summary).toMatch(/\\alpha_u\\beta_d \\ne 0\$, so \$\\alpha_u \\ne 0\$, and \$\\beta_u = 0\$/)
  })
  it('item 11: the product Try-it points at the readout line, not at amplitude column totals', () => {
    const t = L9.units.find((u) => u.id === 'l9-product')!.visual.tryThis[1]
    expect(t).toMatch(/readout stays at u 0\.5, d 0\.5/)
    expect(t).toMatch(/Boxes show/)
  })
  it('item 12: the two Go-deeper beats carry a ref', () => {
    for (const id of ['l9-counting:b7', 'l9-singlet:b8']) expect(find(id).refs?.length, id).toBeGreaterThan(0)
  })
})
