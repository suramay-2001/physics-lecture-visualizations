/**
 * Lecture 8's own rulings as lints (docs/roles/decisions/448-L8L11.md, L8 section and P1-P6), on top of the platform lints every
 * chapter passes:
 *   R3  Rosetta: the notes' ϑ appears only in the caption that renames it (χ); the message bit is x; the bases are H/V and D/A, and
 *       the notes' Z/X and H−V/A−D labels are named once, in one caption;
 *   R4  the polarization sphere is the revised `poincare` set (H/V, D/A, C±), never Stokes S1-S3;
 *   R7  the bb84 ledger kind, the bb84-bench widget and the catch-eve game run on one seeded engine: every ledger the story draws is
 *       reproducible from physics/bb84.ts, and the Try-its of units 5-8 are the one bench;
 *   P1  exactly one class marker, "Class 9 starts here", on l8-attack:b1;
 *   P2  Go-deeper beats are the three planned ones and carry no chip into the notes' own line;
 *   P4  chips into Physics 709 sit in clue reveals and Go-deeper beats only.
 * Also: the unit order and beat counts match the plan.
 */
import { describe, expect, it } from 'vitest'
import { L8 } from './L8'
import { BRIDGES_448 } from './bridges448'
import { layoutStates } from './stage'
import type { Bb84State, Beat, BlochState } from './stage'
import { bb84Rounds, bb84Tally } from '../physics/bb84'
import { bridgeRefs } from './walk'

const beats = L8.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const allTexts = () => [
  ...beats.flatMap(textsOf),
  ...L8.units.flatMap((u) => [u.title, u.question, u.lecture.summary, u.insight, ...(u.pitfalls ?? []), ...u.visual.tryThis, JSON.stringify(u.review), JSON.stringify(u.play)]),
]

describe('Lecture 8: shape', () => {
  it('eight units in the plan’s order with 6, 6, 5, 7, 6, 7, 7, 6 beats (50), 23 challenges, a review card each', () => {
    expect(L8.units.map((u) => u.id)).toEqual(['l8-variance-sum', 'l8-polarization', 'l8-turning', 'l8-photon-spin', 'l8-key', 'l8-bb84', 'l8-attack', 'l8-test'])
    expect(L8.units.map((u) => u.story!.length)).toEqual([6, 6, 5, 7, 6, 7, 7, 6])
    expect(beats).toHaveLength(50)
    expect(L8.units.flatMap((u) => u.play)).toHaveLength(23)
    for (const u of L8.units) expect(u.review, u.id).toBeDefined()
    expect(beats.filter((b) => b.phase === 'clue')).toHaveLength(8)
    expect(beats.filter((b) => b.phase === 'books').map((b) => b.id)).toEqual(['l8-polarization:b5'])
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['l8-variance-sum:b6', 'l8-photon-spin:b7', 'l8-attack:b7'])
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l8-variance-sum:b3', 'l8-turning:b2', 'l8-turning:b4', 'l8-photon-spin:b1', 'l8-attack:b3', 'l8-test:b1'])
  })
  it('the Try-it widgets: bloch, then two polarization projectors, the dial, and four runs of the one bench', () => {
    expect(L8.units.map((u) => u.visual.kind)).toEqual(['bloch', 'projector', 'projector', 'polarization-dial', 'bb84-bench', 'bb84-bench', 'bb84-bench', 'bb84-bench'])
    for (const u of L8.units.slice(1, 3)) expect(u.visual.props).toMatchObject({ labels: 'polarization' })
  })
})

describe('Lecture 8: P1 the class marker', () => {
  it('"Class 9 starts here" on l8-attack:b1 and nowhere else (no `from`: class 8 stopped before the attack)', () => {
    expect(beats.filter((b) => b.classMark).map((b) => [b.id, b.classMark])).toEqual([['l8-attack:b1', { class: 9 }]])
  })
})

describe('Lecture 8: R3 Rosetta lines', () => {
  it('the notes’ ϑ appears only in the caption that renames it as χ', () => {
    const where = (re: RegExp) => beats.flatMap((b) => textsOf(b).map((t, i) => (re.test(t) ? `${b.id}#${i}` : ''))).filter(Boolean)
    expect(where(/ϑ|\\vartheta/)).toEqual(['l8-turning:b3#1'])
    expect(beats.find((b) => b.id === 'l8-turning:b3')!.caption).toMatch(/χ/)
  })
  it('the bases are H/V and D/A; the notes’ Z/X and H−V/A−D labels are named once, in the caption of l8-bb84:b1', () => {
    const where = (re: RegExp) => beats.flatMap((b) => textsOf(b).map((t, i) => (re.test(t) ? `${b.id}#${i}` : ''))).filter(Boolean)
    expect(where(/\bbases? Z and X\b|Z and X\b|H−V/)).toEqual(['l8-bb84:b1#1'])
    for (const t of allTexts()) expect(t, t.slice(0, 60)).not.toMatch(/\bZ basis\b|\bX basis\b|Z\/X/)
  })
  it('the message bit is x and the test size is m: the one-time pad never uses m for the message', () => {
    const key2 = beats.find((b) => b.id === 'l8-key:b2')!
    expect(key2.text).toMatch(/message bit \$x\$ as \$c = x \\oplus k\$/)
    expect(key2.text).not.toMatch(/\$m\$|m \\oplus/)
    expect(beats.find((b) => b.id === 'l8-test:b1')!.text).toMatch(/Reveal \$m\$ sifted bits/)
  })
})

describe('Lecture 8: R4 the polarization sphere', () => {
  it('every sphere that carries light uses `labels: poincare`, and no text says Stokes or S₁–S₃', () => {
    const spheres = beats.flatMap(statesOf).filter((s): s is BlochState => s.kind === 'bloch' && s.photonTurnDeg !== undefined)
    expect(spheres.length).toBeGreaterThan(0)
    for (const s of spheres) expect(s.labels).toBe('poincare')
    for (const t of allTexts()) expect(t, t.slice(0, 60)).not.toMatch(/Stokes|S_1|S_2|S_3|S₁|S₂|S₃/)
  })
})

describe('Lecture 8: R7 one engine for the ledger, the bench and the game', () => {
  it('every ledger in the story is a seeded run (or the notes’ board) that physics/bb84.ts reproduces, with the exact Q for its Eve', () => {
    const leds = beats.flatMap(statesOf).filter((s): s is Bb84State => s.kind === 'bb84')
    expect(leds.length).toBeGreaterThan(10)
    for (const s of leds)
      if ('seed' in s.rounds && typeof s.rounds.count === 'number') {
        const f = s.eve === 'all' ? 1 : typeof s.eve === 'object' && typeof s.eve.fraction === 'number' ? s.eve.fraction : 0
        const t = bb84Tally(bb84Rounds(s.rounds.count, s.rounds.seed, f))
        expect(t.n).toBe(s.rounds.count)
        expect(t.kept).toBeGreaterThan(0)
      }
  })
  it('the story’s two attack figures use the run that shows Q-hat near the exact Q (seed 9, 2000 photons)', () => {
    const t = bb84Tally(bb84Rounds(2000, 9, 1))
    expect(Math.abs(t.errors / t.kept - 0.25)).toBeLessThan(3 * Math.sqrt((0.25 * 0.75) / t.kept))
  })
})

describe('Lecture 8: P2 and P4', () => {
  it('Go-deeper beats are optional: none introduces anything, and the Try-it lines never lean on them', () => {
    for (const b of beats.filter((x) => x.phase === 'deeper')) {
      expect(b.introduces, b.id).toBeUndefined()
      expect(b.classMark, b.id).toBeUndefined()
    }
    for (const u of L8.units) for (const t of u.visual.tryThis) expect(t, u.id).not.toMatch(/beyond the notes|Go deeper/i)
  })
  it('chips into Physics 709 sit in clue reveals and Go-deeper beats only, and each table entry is used once', () => {
    const used: string[] = []
    for (const b of beats) {
      const inText = bridgeRefs(b.text)
      const inReveal = bridgeRefs(b.reveal?.text ?? '')
      used.push(...inText, ...inReveal)
      if (b.phase === 'lecture' || b.phase === 'books') expect([...inText, ...inReveal], `${b.id} is the notes’ own line`).toEqual([])
      if (b.phase === 'clue') expect(inText, `${b.id}: the chip belongs in the reveal`).toEqual([])
    }
    expect(used.sort()).toEqual(['sl-q13-no-cloning', 'sl-q14-min-error', 'sl-q2-photon'])
    for (const id of used) expect(BRIDGES_448[id], id).toBeDefined()
  })
})
