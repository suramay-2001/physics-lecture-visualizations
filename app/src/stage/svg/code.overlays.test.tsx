/**
 * `code` (P-Q21-story §9.2 K1): the overlays (error, syndrome, correction, residual, logical), the checks and words views, the bicycle tile's focused check and
 * shift, every validation limit with its message, and interpolation. Companion of code.test.tsx (route, vocabulary, engine agreement, scene).
 */
import { describe, expect, it } from 'vitest'
import type { CodeState } from '../../content/stage'
import { Pauli } from '../../physics/qec/pauli'
import { decoderOf, registeredCode } from '../../physics/qec/registry'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { ResolvedCode } from '../types'
import { CODE_LIMITS, codeFrom, codeInputs, codeReadouts, interpCodeStage, resolveCodeStage, validateCodeStage } from './code'
import './kinds'

const C = (st: Omit<CodeState, 'kind'>): CodeState => ({ kind: 'code', ...st })
const R = (st: Omit<CodeState, 'kind'>, s = 1) => resolve(C(st), s) as ResolvedCode
const texts = (r: ResolvedCode) => codeReadouts(r).map((x) => x.text)
const lit = (r: ResolvedCode) => r.checks.filter((c) => c.flipped === 1).map((c) => c.label)

describe('code: the overlays', () => {
  it('an error puts its letters on the hit qubits and nowhere else; no error, no syndrome', () => {
    const r = R({ code: 'steane7', error: 'X1Z4' })
    expect(r.error).toBe('XIIZIII')
    expect(r.qubits.map((q) => q.error)).toEqual(['X', null, null, 'Z', null, null, null])
    // the picture lights the checks only when asked
    expect(r.syndrome).toBeNull()
    expect(r.checks.every((c) => c.flipped === null)).toBe(true)
    const shown = R({ code: 'steane7', error: 'X1Z4', show: ['syndrome'] })
    expect(shown.syndrome).toBe(shown.checks.map((c) => c.flipped).join(''))
    const none = R({ code: 'steane7' })
    expect(none.error).toBeNull()
    expect(none.syndrome).toBeNull()
    expect(none.checks.every((c) => c.flipped === null)).toBe(true)
  })

  it('Steane, X on qubit 5: the lookup decoder undoes it exactly (the residual is the identity); the lit checks are the Z checks that hold qubit 5', () => {
    const r = R({ code: 'steane7', error: 'X5', show: ['syndrome', 'correction', 'residual'] })
    expect(lit(r)).toEqual(['Z1', 'Z3'])
    expect(r.correction).toBe('IIIIXII')
    expect(r.correctionSource).toBe('decoder')
    expect(r.residual).toBe('IIIIIII')
    expect(r.residualKind).toBe('identity')
    expect(texts(r)).toEqual(['n = 7 · k = 1 · d = 3', 'error: X on 5', 'Z1, Z3 read −1', 'pattern: + + + − + −', 'correction: X on 5', 'residual: identity'])
  })

  it('Steane, X on qubits 1 and 2: the table undoes a different flip (qubit 3), and what is left is a logical X', () => {
    const r = R({ code: 'steane7', error: 'X1X2', show: ['syndrome', 'correction', 'residual'] })
    expect(r.correction).toBe('IIXIIII')
    expect(r.residual).toBe('XXXIIII')
    expect(r.residualKind).toBe('logical-X')
    expect(r.qubits.map((q) => q.residual)).toEqual(['X', 'X', 'X', null, null, null, null])
    expect(texts(r)).toContain('residual: logical X')
  })

  it('Shor, Z on qubit 4: the same two X checks light for any Z in the block, and the residual is the identity or a check (degeneracy)', () => {
    const r = R({ code: 'shor9', error: 'Z4', show: ['syndrome', 'correction', 'residual'] })
    expect(lit(r)).toEqual(['X1', 'X2'])
    expect(r.residualKind).toBe('identity')
    // a different Z in the same block (qubit 5) has the same syndrome, so the table gives the same correction Z4 and the residual is Z4Z5, a product of checks
    const r5 = R({ code: 'shor9', error: 'Z5', show: ['syndrome', 'correction', 'residual'] })
    expect(r5.syndrome).toBe(r.syndrome)
    expect(r5.correction).toBe(r.correction)
    expect(r5.residualKind).toBe('check')
  })

  it('an authored correction replaces the decoder’s and is drawn as given; the residual follows from it', () => {
    const r = R({ code: 'steane7', error: 'X5', correction: 'X5', show: ['correction', 'residual'] })
    expect(r.correctionSource).toBe('authored')
    expect(r.residualKind).toBe('identity')
    // X1X3X7 has the same syndrome as X5 (a column of the Hamming matrix is the sum of three others); X5 × X1X3X7 = X1X3X5X7 is a weight-4 check pattern
    const alt = R({ code: 'steane7', error: 'X5', correction: 'X1X3X7', show: ['correction', 'residual'] })
    expect(alt.correctionSource).toBe('authored')
    expect(alt.residualKind).toBe('check')
    expect(texts(alt)).toContain('given: X on 1, 3, 7')
  })

  it('a syndrome the lookup table lacks says so: no correction, no residual', () => {
    // the Shor table lists errors up to weight 1; X on the same qubit of every row has a syndrome no single flip makes
    const e = registeredCode('shor9')
    const err = Pauli.parse('XIIXIIXII')
    expect(decoderOf(e)!.decode(e.stabilizer.syndrome(err))).toBeNull()
    const r = R({ code: 'shor9', error: 'X1X4X7', show: ['correction', 'residual'] })
    expect(r.correction).toBeNull()
    expect(r.correctionSource).toBe('none')
    expect(r.residualKind).toBeNull()
    expect(texts(r)).toContain('correction: none')
    expect(texts(r)).toContain('residual: none')
  })

  it('the five-qubit code is not CSS: its checks are “mixed” and its edges carry the letter each check applies', () => {
    const r = R({ code: 'five5' })
    expect(r.checks.map((c) => c.kind)).toEqual(['mixed', 'mixed', 'mixed', 'mixed'])
    expect(r.checks.map((c) => c.label)).toEqual(['g1', 'g2', 'g3', 'g4'])
    expect(r.checks[0].letters).toBe('XZZXI')
    const e0 = r.edges.filter((e) => e.check === 0)
    expect(e0.map((e) => [e.qubit, e.letter])).toEqual([[0, 'X'], [1, 'Z'], [2, 'Z'], [3, 'X']])
  })

  it('edges are the check matrix: every check has an edge to each qubit of its support and to none else', () => {
    for (const id of ['rep3', 'rep3x', 'shor9', 'steane7', 'five5', 'surface3', 'surface5'] as const) {
      const r = R({ code: id })
      const e = registeredCode(id)
      expect(r.edges.length, id).toBe(e.stabilizer.generators.reduce((a, g) => a + g.weight(), 0))
      for (const c of r.checks)
        expect(
          r.edges.filter((x) => x.check === c.index).map((x) => x.qubit),
          `${id} ${c.label}`,
        ).toEqual(c.support)
    }
  })

  it('a minimum-weight logical operator: its support carries rings (Shor: d = 3), and for the bicycle codes the paper’s weight-12 / weight-20 operator, an upper bound', () => {
    const s = R({ code: 'shor9', show: ['logical'] })
    expect(s.logical!.weight).toBe(3)
    expect(s.qubits.filter((q) => q.logical).length).toBe(3)
    expect(texts(s)).toContain('logical: X on 1, 2, 3')
    const g = R({ code: 'gross', show: ['logical'] })
    expect(g.logical!.weight).toBe(12)
    expect(g.qubits.filter((q) => q.logical).length).toBe(12)
    expect(texts(g)).toContain('logical op, weight 12')
    expect(g.distance).toEqual({ d: null, reported: 12, exact: false })
    expect(R({ code: 'two-gross', show: ['logical'] }).logical!.weight).toBe(20)
  })

  it('the surface code: plaquettes with half-discs on the boundary, one per check; Steane: three faces; the chains have none', () => {
    const s = R({ code: 'surface3' })
    expect(s.plaquettes.length).toBe(8)
    expect(s.plaquettes.filter((p) => p.apex).length).toBe(4)
    expect(s.plaquettes.filter((p) => !p.apex).every((p) => p.points.length === 4)).toBe(true)
    const st = R({ code: 'steane7' })
    expect(st.plaquettes.length).toBe(3)
    expect(st.plaquettes.every((p) => p.kind === 'XZ' && p.points.length === 4)).toBe(true)
    expect(R({ code: 'rep3' }).plaquettes.length).toBe(0)
  })

  it('n, k and d are the engine’s; the repetition codes have d = 1 against every Pauli; the bicycle d is the paper’s, reported', () => {
    expect(R({ code: 'surface5' })).toMatchObject({ n: 25, k: 1, rank: 24, distance: { d: 5, exact: true } })
    expect(R({ code: 'rep3' })).toMatchObject({ n: 3, k: 1, distance: { d: 1, exact: true } })
    expect(R({ code: 'gross' })).toMatchObject({ n: 144, k: 12, rank: 132 })
    expect(R({ code: 'two-gross' })).toMatchObject({ n: 288, k: 12, distance: { d: null, reported: 18 } })
  })
})

describe('code: the checks view', () => {
  it('lists the generators as Pauli letters and each error with its syndrome', () => {
    const r = R({ code: 'shor9', view: 'checks', errors: ['X1', 'Z4', 'X7X8'] })
    expect(r.table!.rows.length).toBe(8)
    expect(r.table!.rows[0]).toEqual({ label: 'X1', letters: 'XXXXXXIII', kind: 'X' })
    expect(r.table!.rows[2]).toEqual({ label: 'Z1', letters: 'ZZIIIIIII', kind: 'Z' })
    expect(r.table!.errors.map((e) => e.letters)).toEqual(['XIIIIIIII', 'IIIZIIIII', 'IIIIIIXXI'])
    // the numpy fixture's X1: 00 on the X checks, 100000 on the Z checks
    expect(r.table!.errors[0].syndrome.join('')).toBe('00100000')
    expect(r.table!.errors[1].syndrome.join('')).toBe('11000000')
    expect(texts(r)).toEqual(['n = 9 · k = 1 · d = 3', '8 checks · 1 logical'])
    expect(r.error).toBeNull()
  })
  it('without errors it is the table alone; the five-qubit code and the d = 3 surface code fit it (n ≤ 9)', () => {
    expect(R({ code: 'five5', view: 'checks' }).table!.errors).toEqual([])
    expect(R({ code: 'surface3', view: 'checks', errors: ['Y5'] }).table!.rows.length).toBe(8)
  })
})

describe('code: the words view', () => {
  it('Steane |0⟩ is the eight even Hamming words at 1/√8, |+⟩ all sixteen at 1/4; Shor |1⟩ has the − signs of Bergou’s word', () => {
    const z = R({ code: 'steane7', view: 'words', word: 0 }).words!
    expect(z.name).toBe('logical |0⟩')
    expect(z.terms.map((t) => t.bits)).toEqual(['0000000', '0001111', '0110011', '0111100', '1010101', '1011010', '1100110', '1101001'])
    for (const t of z.terms) expect(t.size).toBeCloseTo(1 / Math.sqrt(8), 12)
    expect(R({ code: 'steane7', view: 'words', word: 'plus' }).words!.terms.length).toBe(16)
    const one = R({ code: 'shor9', view: 'words', word: 1 }).words!
    expect(one.terms.filter((t) => t.re < 0).map((t) => t.bits)).toEqual(['000000111', '000111000', '111000000', '111111111'])
    expect(texts(R({ code: 'steane7', view: 'words', word: 0 }))).toEqual(['n = 7 · k = 1 · d = 3', '8 terms, each 0.354'])
  })
  it('the word defaults to |0⟩', () => {
    expect(R({ code: 'rep3', view: 'words' }).words!.name).toBe('logical |0⟩')
    expect(R({ code: 'rep3', view: 'words' }).words!.terms.map((t) => t.bits)).toEqual(['000'])
  })
})

describe('code: the bicycle tile', () => {
  it('a focused X check has six edges from the engine’s Tanner graph: four local, two long-range, and they name the qubits of that row of H_X', () => {
    const bb = registeredCode('gross').bb!
    const r = R({ code: 'gross', focus: 'X20' })
    const f = r.tile!.focus[0]
    expect(f.label).toBe('X20')
    expect(f.check).toBe(20)
    expect(f.edges.length).toBe(6)
    expect(f.edges.filter((e) => e.kind === 'local').length).toBe(4)
    expect(f.edges.filter((e) => e.kind === 'long').length).toBe(2)
    expect(f.edges.map((e) => e.qubit).sort((a, b) => a - b)).toEqual(bb.HX.rowSupport(20))
    expect(f.edges.every((e) => e.letter === 'X')).toBe(true)
    // the check of cell (3, 2) (index 3 × 6 + 2 = 20): A has x³y⁻¹ → the L qubit of cell (6, 1); B has x⁻¹y⁻³ → the R qubit of cell (2, 5)
    const long = f.edges.filter((e) => e.kind === 'long')
    expect(long.map((e) => e.target).sort()).toEqual(['L(6, 1)', 'R(2, 5)'])
    expect(long.find((e) => e.target === 'L(6, 1)')!.delta).toEqual([3, -1])
    // (dy = −3 and +3 are the same step on a ring of 6; the engine reports the signed copy in (−m/2, m/2])
    expect(long.find((e) => e.target === 'R(2, 5)')!.delta).toEqual([-1, 3])
    expect(texts(r)).toContain('X20: 4 near, 2 long')
  })
  it('a Z check names its qubits too (H_Z row), by index or by name; two focused checks are allowed', () => {
    const bb = registeredCode('gross').bb!
    const byName = R({ code: 'gross', focus: 'Z5' }).tile!.focus[0]
    const byIndex = R({ code: 'gross', focus: 72 + 5 }).tile!.focus[0]
    expect(byName).toEqual(byIndex)
    expect(byName.edges.map((e) => e.qubit).sort((a, b) => a - b)).toEqual(bb.HZ.rowSupport(5))
    expect(byName.edges.every((e) => e.letter === 'Z')).toBe(true)
    expect(R({ code: 'gross', focus: ['X20', 'Z5'] }).tile!.focus.map((f) => f.label)).toEqual(['X20', 'Z5'])
  })
  it('an edge that leaves the tile is marked as wrapping; the others end on their qubit', () => {
    const f = R({ code: 'gross', focus: 'X0' }).tile!.focus[0]
    // the check in cell (0, 0) has neighbours across the seam
    expect(f.edges.some((e) => e.wraps)).toBe(true)
    for (const e of f.edges) if (!e.wraps) expect(e.unrolled).toEqual(e.at)
  })
  it('the shift x³y⁻¹: every qubit moves (3, −1) cells, and the engine says it preserves both check families (the paper’s App. A.2)', () => {
    const r = R({ code: 'gross', shift: [3, -1] })
    expect(r.tile!.shift).toMatchObject({ a: 3, b: -1, name: 'x^3 y^-1', delta: [3, -1], preserves: true })
    expect(texts(r)).toEqual(['n = 144 · k = 12', 'd = 12 (paper)', 'shift x^3 y^-1', 'moves 3 east, 1 south', 'keeps the checks'])
    expect(R({ code: 'gross', shift: [1, 0] }).tile!.shift!.delta).toEqual([1, 0])
    expect(R({ code: 'gross', shift: [7, 0] }).tile!.shift!.delta).toEqual([-5, 0]) // the nearest signed copy on a ring of 12
  })
  it('a shift outside the paper’s list of generators still preserves the code (every monomial does)', () => {
    expect(R({ code: 'gross', shift: [5, 2] }).tile!.shift!.preserves).toBe(true)
  })
  it('the tile’s rectangle holds every dot; there are 144 qubits (72 L, 72 R) and 144 checks and no Tanner edges except the focused check’s', () => {
    const r = R({ code: 'gross' })
    const [x0, y0, x1, y1] = r.tile!.rect
    for (const p of [...r.qubits, ...r.checks]) {
      expect(p.x).toBeGreaterThan(x0)
      expect(p.x).toBeLessThan(x1)
      expect(p.y).toBeGreaterThan(y0)
      expect(p.y).toBeLessThan(y1)
    }
    expect(r.qubits.length).toBe(144)
    expect(r.checks.length).toBe(144)
    expect(r.qubits.filter((q) => q.family === 'L').length).toBe(72)
    expect(r.qubits[5].cell).toEqual([0, 5])
    expect(r.edges).toEqual([])
  })
})

describe('code: validation (clear messages)', () => {
  const v = (st: Omit<CodeState, 'kind'>) => validateCodeStage(C(st))
  it('an unknown code id lists the registry', () => {
    expect(v({ code: 'steane' as never })).toEqual([expect.stringMatching(/code: unknown code "steane" \(the registry has rep3, rep3x, shor9, steane7, five5, surface3, surface5, gross, two-gross, c422\)/)])
  })
  it('an unknown view or show name; show names once; syndrome, correction and residual need an error; residual needs correction', () => {
    expect(v({ code: 'steane7', view: 'grid' as never })).toEqual([expect.stringMatching(/code view/)])
    expect(v({ code: 'steane7', show: ['syndrome', 'syndrome'], error: 'X1' })).toEqual([expect.stringMatching(/each name once/)])
    expect(v({ code: 'steane7', show: ['lit' as never], error: 'X1' })[0]).toMatch(/a list of 'syndrome', 'correction', 'residual', 'logical'/)
    expect(v({ code: 'steane7', show: ['syndrome'] })).toEqual([expect.stringMatching(/'syndrome' needs an `error`/)])
    expect(v({ code: 'steane7', show: ['correction'] })).toEqual([expect.stringMatching(/'correction' needs an `error`/)])
    expect(v({ code: 'steane7', error: 'X1', show: ['residual'] })).toEqual([expect.stringMatching(/'residual' is error × correction; add 'correction'/)])
    expect(v({ code: 'steane7', show: ['logical'] })).toEqual([])
  })
  it('an overlay on the wrong view is refused, naming the field and the view', () => {
    expect(v({ code: 'steane7', view: 'checks', error: 'X1' })[0]).toMatch(/code error: only the 'layout' view draws it \(this state is the 'checks' view\)/)
    expect(v({ code: 'steane7', view: 'words', show: ['syndrome'] })[0]).toMatch(/code show: only the 'layout' view/)
    expect(v({ code: 'steane7', view: 'words', correction: 'X1' })[0]).toMatch(/code correction: only the 'layout' view/)
    expect(v({ code: 'gross', view: 'checks', focus: 'X1' }).join('|')).toMatch(/code focus: only the 'layout' view/)
    expect(v({ code: 'steane7', error: 'X1', errors: ['X1'] })[0]).toMatch(/code errors: only the 'checks' view lists errors/)
    expect(v({ code: 'steane7', word: 1 })[0]).toMatch(/code word: only the 'words' view/)
  })
  it('the checks and words views draw at most 9 qubits; the layout draws at most 25 qubits and 24 checks (a bicycle code is a tile)', () => {
    expect(v({ code: 'surface5', view: 'checks' })).toEqual([expect.stringMatching(/the 'checks' view draws codes of at most 9 qubits \(surface5 has 25\); use the layout/)])
    expect(v({ code: 'gross', view: 'words' }).join('|')).toMatch(/at most 9 qubits \(gross has 144\)/)
    expect(v({ code: 'surface5' })).toEqual([])
    expect(v({ code: 'gross' })).toEqual([])
    expect(CODE_LIMITS).toMatchObject({ layoutQubits: 25, layoutChecks: 24, tableQubits: 9, errorsMax: 8, wordsMax: 16 })
  })
  it('the words view needs a known word and exactly one logical qubit', () => {
    expect(v({ code: 'surface3', view: 'words', word: 0 })).toEqual([])
    // |+⟩ of the d = 3 surface code has 16 + 16 = 32 strings, over the limit of 16
    expect(v({ code: 'surface3', view: 'words', word: 'plus' })).toEqual([expect.stringMatching(/32 strings; the words view draws at most 16/)])
    expect(v({ code: 'steane7', view: 'words', word: 'minus' as never })[0]).toMatch(/word: 0, 1 or 'plus'/)
    expect(v({ code: 'four' as never, view: 'words' })[0]).toMatch(/unknown code/)
  })
  it('a Pauli string of the wrong length, or naming a qubit the code does not have, is refused with the reason', () => {
    expect(v({ code: 'steane7', error: 'XXI' })[0]).toMatch(/code error: "XXI" has 3 letters, the code has 7 qubits/)
    expect(v({ code: 'steane7', error: 'X9' })[0]).toMatch(/code error: qubit 9 is outside 1 … 7/)
    expect(v({ code: 'steane7', view: 'checks', errors: ['X1', 'X9'] })[0]).toMatch(/code errors\[1\]: qubit 9 is outside 1 … 7/)
  })
  it('the checks view lists one to eight errors', () => {
    expect(v({ code: 'steane7', view: 'checks', errors: [] })[0]).toMatch(/one to 8 Pauli strings/)
    expect(v({ code: 'steane7', view: 'checks', errors: Array.from({ length: 9 }, () => 'X1') })[0]).toMatch(/one to 8 Pauli strings/)
    expect(v({ code: 'steane7', view: 'checks', errors: Array.from({ length: 8 }, (_, i) => `X${(i % 7) + 1}`) })).toEqual([])
  })
  it('an authored correction must have the error’s syndrome; it is drawn only with show correction; a code without a decoder needs one', () => {
    expect(v({ code: 'steane7', error: 'X5', correction: 'X1', show: ['correction'] })[0]).toMatch(/is not the error's/)
    expect(v({ code: 'steane7', error: 'X5', correction: 'X5' })[0]).toMatch(/drawn only with show: \['correction'\]/)
    expect(v({ code: 'steane7', error: 'X5', correction: 'X5', show: ['correction'] })).toEqual([])
    expect(v({ code: 'gross', error: 'X5', show: ['correction'] })[0]).toMatch(/gross has no lookup decoder; write the `correction`/)
    expect(v({ code: 'gross', error: 'X5', correction: 'X5', show: ['correction', 'residual'] })).toEqual([])
  })
  it('focus and shift belong to the bicycle codes, with limits', () => {
    expect(v({ code: 'steane7', focus: 1 })[0]).toMatch(/only the bicycle codes/)
    expect(v({ code: 'steane7', shift: [1, 0] })[0]).toMatch(/only the bicycle codes/)
    expect(v({ code: 'gross', focus: 144 })[0]).toMatch(/a check index from 0 to 143/)
    expect(v({ code: 'gross', focus: 'X72' })[0]).toMatch(/X checks run X0 … X71/)
    expect(v({ code: 'gross', focus: 'Q3' })[0]).toMatch(/a check index or a name like "X12"/)
    expect(v({ code: 'gross', focus: [1, 2, 3] })[0]).toMatch(/one or two checks/)
    expect(v({ code: 'gross', focus: ['X1', 'X1'] })[0]).toMatch(/each check once/)
    expect(v({ code: 'gross', shift: [1.5, 0] })[0]).toMatch(/two whole numbers/)
    expect(v({ code: 'gross', shift: [13, 0] })[0]).toMatch(/\|a\| ≤ 12 and \|b\| ≤ 6/)
    expect(v({ code: 'gross', focus: ['X1', 'Z7'], shift: [3, -1] })).toEqual([])
  })
  it('the shared entry points agree, and the resolved states are finite', () => {
    for (const st of [C({ code: 'gross', focus: 'X20', shift: [3, -1], error: 'X40', show: ['syndrome', 'logical'] }), C({ code: 'surface5', error: 'X7Z19', show: ['syndrome', 'correction', 'residual', 'logical'] })])
      expect(validateStage(st)).toEqual([])
  })
})

describe('code: interpolation', () => {
  const a = R({ code: 'steane7', error: 'X5', show: ['syndrome'] })
  const b = R({ code: 'shor9' })
  it('there is no continuous parameter: a change of picture switches at the half-way point and ends on either end exactly', () => {
    expect(interpCodeStage(a, b, 0)).toBe(a)
    expect(interpCodeStage(a, b, 1)).toBe(b)
    expect(interpCodeStage(a, b, 0.49)).toBe(a)
    expect(interpCodeStage(a, b, 0.5)).toBe(b)
    expect(interpolate(a, b, 0.2)).toBe(a)
    expect(interpolate(a, b, 0.8)).toBe(b)
  })
  it('the same inputs resolve to the same object (memoized), and the hold progress changes nothing', () => {
    expect(resolveCodeStage(C({ code: 'steane7', error: 'X5' }), 0)).toBe(resolveCodeStage(C({ code: 'steane7', error: 'X5' }), 1))
    expect(codeFrom(codeInputs(C({ code: 'rep3' })))).toBe(codeFrom(codeInputs(C({ code: 'rep3' }))))
  })
})
