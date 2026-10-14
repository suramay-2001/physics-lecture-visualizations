/**
 * Chapter Q22's own invariants (rulings qc709-Q21Q22.md): the four Corrections each checked at a revealing point, the authored tableau rows against the engine's tableau trace,
 * the shape of the chapter (units, beats, phases, notation beats), every decimal in a challenge read from `V`, and the book references. (The generic lints, symbols before use,
 * claims against numpy, derivation views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { shorCode, steaneCode } from '../../physics/qec/codes'
import { Pauli } from '../../physics/qec/pauli'
import { sameStabilizerGroup, tableauTrace } from '../../physics/qec/q22'
import { StabilizerCode } from '../../physics/qec/stabilizer'
import { Tableau } from '../../physics/qec/tableau'
import { Q22 } from './Q22'
import { GLOSSARY } from './Q22.glossary'
import { C_BF0_X2, C_ENC_PF, C_MX, ENC_ROWS, G_62, M_62, M_7, V } from './Q22.values'
import { M_7 as F7_M7 } from './F7.values'

const units = Q22.units
const beats = units.flatMap((u) => u.story ?? [])
const corr = (where: string) => Q22.corrections!.find((c) => c.where === where)!

describe('Q22 shape: seven units, thirty-seven beats, seven clues, one Go-deeper beat, all books-phase', () => {
  it('has the planned units in order, with 5 + 6 + 6 + 5 + 5 + 5 + 5 beats', () => {
    expect(units.map((u) => u.id)).toEqual(['q22-linear-codes', 'q22-stabilizer', 'q22-check-matrix', 'q22-css', 'q22-decode', 'q22-clifford', 'q22-gottesman-knill'])
    expect(units.map((u) => (u.story ?? []).length)).toEqual([5, 6, 6, 5, 5, 5, 5])
    expect(beats).toHaveLength(37)
  })
  it('the phases run books → clue → deeper; no lecture or core beat; the only Go-deeper beat is the last of the last unit', () => {
    expect(new Set(beats.map((b) => b.phase))).toEqual(new Set(['books', 'clue', 'deeper']))
    expect(beats.filter((b) => b.phase === 'clue')).toHaveLength(7)
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['q22-gottesman-knill:b5'])
    for (const u of units) expect((u.story ?? [])[0].phase, `${u.id} opens with a books beat`).toBe('books')
  })
  it('the twelve notation beats each introduce one entry, in reading order', () => {
    const intro = beats.filter((b) => b.introduces?.length).map((b) => [b.id, b.introduces!.join()])
    expect(intro).toEqual([
      ['q22-linear-codes:b1', 'qc-generator-matrix'],
      ['q22-linear-codes:b3', 'qc-code-distance'],
      ['q22-linear-codes:b4', 'qc-dual-code'],
      ['q22-stabilizer:b1', 'qc-pauli-group'],
      ['q22-stabilizer:b2', 'qc-stabilizer-group'],
      ['q22-check-matrix:b1', 'qc-check-matrix'],
      ['q22-check-matrix:b2', 'qc-symplectic-product'],
      ['q22-check-matrix:b4', 'qc-logical-operator'],
      ['q22-check-matrix:b5', 'qc-code-nkd'],
      ['q22-css:b1', 'qc-css-code'],
      ['q22-decode:b1', 'qc-decoder'],
      ['q22-clifford:b1', 'qc-clifford'],
    ])
    expect(GLOSSARY.filter((g) => g.introduces).map((g) => g.id)).toEqual(intro.map(([, id]) => id))
    expect(GLOSSARY).toHaveLength(18)
  })
  it('every unit lists two books and every challenge hint list has exactly 3 hints', () => {
    for (const u of units) {
      expect(u.books.length, u.id).toBe(2)
      expect(u.play, u.id).toHaveLength(3)
      for (const p of u.play) expect(p.hints, p.id).toHaveLength(3)
    }
  })
})

describe('Q22 Corrections (ruling R6): four boxes, each an engine computation at a point where the slip shows, worded "our calculation finds …"', () => {
  it('there are four, all the book’s, in the order of the pages', () => {
    expect(Q22.corrections!.map((c) => c.where)).toEqual(['Bergou p. 173', 'Bergou p. 175', 'Bergou p. 182, Eq. 10.9, last line', 'Bergou p. 184, Eq. 10.14'])
    for (const c of Q22.corrections!) {
      expect(c.source).toBe('book')
      expect(c.shouldSay.startsWith('Our calculation finds')).toBe(true)
      expect(c.check()).toBe(true)
    }
  })
  it('E1 (p. 173): the Steane code has d = 3 and corrects every one-qubit error, so d > 2t + 1 fails at t = 1 while d ≥ 2t + 1 holds', () => {
    expect(V.q22DSteane).toBe(3)
    expect(V.q22E1Strict).toBe(0)
    expect(V.q22E1Ge).toBe(1)
    expect(V.q22SteaneAll1).toBe(21)
  })
  it('E2 (p. 175): the dual of the Hamming code has 7 nonzero words, all of weight 4, so its distance is 4, not 3', () => {
    expect(corr('Bergou p. 175').shouldSay).toContain('7 of them')
    expect(V.q22DualD).toBe(4)
    expect(V.q22HamD).toBe(3)
  })
  it('E3 (Eq. 10.9): the phase gate leaves Z alone and turns Y into −X, with no Z in it', () => {
    expect(V.q22SZS).toBeCloseTo(0, 12)
    expect(V.q22SYSminusX).toBeCloseTo(0, 12)
    expect(V.q22SYSZ).toBeCloseTo(0, 12)
  })
  it('E4 (Eq. 10.14): (−iY)² = −I, so a generator with that factor cannot lie in a stabilizer group', () => {
    expect(V.q22E4Square).toBeCloseTo(-1, 12)
    const minusIY = Pauli.parse('-iY')
    expect(minusIY.mul(minusIY).phase).toBe(2)
    expect(new StabilizerCode([minusIY]).check().hermitian).toBe(false)
  })
})

describe('Q22 stage data against the engine', () => {
  it('the authored tableau rows of the encoder are the engine’s tableau after each column', () => {
    const t = tableauTrace(C_ENC_PF)
    ENC_ROWS.forEach((rows, k) => expect(sameStabilizerGroup(t.steps[k], rows.map((r) => '+' + r)), `after column ${k}`).toBe(true))
  })
  it('measuring X on qubit 1 of |000⟩ with outcome 0 leaves X₁, Z₂, Z₃; outcome 1 leaves −X₁', () => {
    expect(sameStabilizerGroup(tableauTrace(C_MX, '0').steps[3], ['+XII', '+IZI', '+IIZ'])).toBe(true)
    expect(sameStabilizerGroup(tableauTrace(C_MX, '1').steps[3], ['-XII', '+IZI', '+IIZ'])).toBe(true)
    expect(V.q22MeasX).toBeCloseTo(0.5, 12)
  })
  it('the five-qubit cycle: after the parity CNOTs the tableau fixes both helper readings at 1, like the full simulation', () => {
    const t = new Tableau(5)
    t.cnot(0, 1).cnot(0, 2).px(1).cnot(0, 3).cnot(1, 3).cnot(1, 4).cnot(2, 4)
    expect(t.peekZ(3)).toBe(1)
    expect(t.peekZ(4)).toBe(1)
    expect(V.q22TabSyn).toBeCloseTo(1, 12)
    expect(sameStabilizerGroup(tableauTrace(C_BF0_X2, '11').steps.at(-1)!, ['+ZIIII', '+IZIII', '+IIZII', '-IIIZI', '-IIIIZ'])).toBe(true)
  })
  it('the check matrices are the chapter’s: M₇ is F7’s, the [6, 2] code is the kernel of its four checks, and M₆₂M₆₂ᵀ ≠ 0', () => {
    expect([...M_7]).toEqual([...F7_M7])
    expect(G_62).toEqual(['111000', '000111'])
    expect(M_62).toHaveLength(4)
    expect(V.q22Css62Fails).toBe(1)
  })
  it('logical operators are in the normalizer and outside the stabilizer group (not just commuting)', () => {
    const shor = shorCode().stabilizer()
    for (const [s, label] of [['XXXIIIIII', 'Z̄'], ['ZIIZIIZII', 'X̄']] as const) {
      const p = Pauli.parse(s)
      expect(shor.inNormalizer(p), label).toBe(true)
      expect(shor.inStabilizer(p), label).toBe(false)
    }
    const st = steaneCode().stabilizer()
    const x3 = Pauli.parse('XXXIIII')
    expect(st.isLogical(x3)).toBe(true)
    expect(st.isLogical(Pauli.parse('ZZZZZZZ'))).toBe(true)
    // Z1Z2 is a check of Shor's code, not a logical operator
    expect(shor.isLogical(Pauli.parse('ZZIIIIIII'))).toBe(false)
  })
})

describe('Q22 challenges and references', () => {
  it('every numeric answer is a value of V (nothing typed), with the tolerance the plan gives', () => {
    const values = new Set(Object.values(V))
    for (const u of units)
      for (const p of u.play)
        if (p.kind === 'numeric') {
          expect(values.has(p.answer), `${p.id}: ${p.answer}`).toBe(true)
          if (p.id === 'q22-d-pl') expect(p.tolerance).toBe(0.001)
          else if (p.id === 'q22-x-amp') expect(p.tolerance).toBe(0.005)
          else expect(p.tolerance, p.id).toBe(0)
        }
  })
  it('the answers are the plan’s: 8, 3, 4 · 16, 2 · 0, 3 · 1, 0.354 · 0.0415, 28 · 24 · 210, 1048576', () => {
    const num = (id: string) => {
      const c = units.flatMap((u) => u.play).find((p) => p.id === id)!
      return c.kind === 'numeric' ? c.answer : NaN
    }
    expect([num('q22-l-words'), num('q22-l-d62'), num('q22-l-dual'), num('q22-s-p1'), num('q22-s-dim'), num('q22-c-symp'), num('q22-c-d5'), num('q22-x-k'), num('q22-f-count'), num('q22-g-bits'), num('q22-g-amp'), num('q22-d-w3')]).toEqual([
      8, 3, 4, 16, 2, 0, 3, 1, 24, 210, 1048576, 28,
    ])
    expect(num('q22-x-amp')).toBeCloseTo(0.354, 3)
    expect(num('q22-d-pl')).toBeCloseTo(0.0415, 4)
  })
  it('the book references name Bergou and N&C with a section and a page', () => {
    for (const u of units) {
      expect(u.books.map((b) => b.source).sort(), u.id).toEqual(['bergou', 'nc'])
      for (const b of u.books) expect(b.where, u.id).toMatch(/p{1,2}\.\s?\d/)
    }
  })
  it('the source file names no theorem number in prose (the number reader would take it for a decimal)', async () => {
    const story = (await import('./Q22.story.ts?raw')).default
    expect(story).not.toMatch(/Thm\s+\d|Prop\.\s+\d|Table\s+\d/)
  })
})
