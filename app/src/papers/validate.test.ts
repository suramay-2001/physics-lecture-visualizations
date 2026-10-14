/**
 * Paper spec validation and compilation (docs/specs/papers-platform.md §2, §4): every spec on disk is valid against the real
 * registries and compiles into a two-track Lecture; every kind of mistake a spec can carry is refused with a message that
 * says where and what; reported claims (R3) stay apart from engine claims; the reference trail (R5) and the prerequisite
 * graph (R2) are checked. A spec that slipped past the gate is refused again at load time (compilePaper throws).
 */
import { describe, expect, it } from 'vitest'
import { claimKey } from '../content/claimKit'
import { P1 } from '../content/papers/P1.paper'
import { PAPER_SPECS } from '../content/papers/index'
import { reportedWhere, type Beat } from '../content/stage'
import { compilePaper } from './compile'
import { paperContext } from './context.testkit'
import type { PaperSpec, RecipeRef } from './spec'
import { PaperSpecError, validatePaperSpec } from './validate'

const ctx = paperContext()
/** A deep copy of P1 to break one thing in (the original is never touched). */
const p1 = (): PaperSpec & Record<string, unknown> => JSON.parse(JSON.stringify(P1))
const beat = (s: PaperSpec, id: string) => s.units.flatMap((u) => u.story).find((b) => b.id === id)! as PaperSpec['units'][number]['story'][number] & Record<string, unknown>

describe('every spec on disk', () => {
  it.each(PAPER_SPECS.map((s) => [s.id, s] as const))('%s is valid against the real registries', (_, s) => {
    expect(validatePaperSpec(s, ctx)).toEqual([])
  })
})

describe('compilePaper: a spec becomes an ordinary two-track Lecture', () => {
  const { lecture, values } = compilePaper(P1)
  const b1 = lecture.units[0].story![0]
  const b2 = lecture.units[0].story![1]
  it('recipe references become the stage states their recipes return', () => {
    expect(b1.stage).toEqual({ kind: 'amplitudes', state: { bell: 'Phi+' }, mode: 'probability' })
    expect(b2.stage).toEqual({ kind: 'amplitudes', state: { bell: 'Phi+' }, mode: 'amplitude' })
  })
  it('a computed claim is keyed, holds, and its engine value joins the ledger', () => {
    expect(b2.claims!.map(claimKey)).toEqual(['p1BellAmp'])
    expect(b2.claims![0].holds()).toBe(true)
    expect(values).toEqual({ p1BellAmp: Math.SQRT1_2 })
  })
  it('reported claims ride on their own field, never among the engine claims (R3)', () => {
    expect(b1.reported).toEqual(P1.units[0].story[0].reported)
    expect(b1.claims).toBeUndefined()
    expect(reportedWhere(b1.reported![0].at)).toBe('Figure 3b, p. 9')
    expect(reportedWhere({ kind: 'section', label: '2.1', page: 9 })).toBe('§2.1, p. 9')
    expect(reportedWhere({ kind: 'text', page: 12 })).toBe('p. 12')
  })
  it('a trail entry carries its reference’s short label (R5)', () => {
    expect(b2.trail).toEqual([{ ...P1.units[0].story[1].trail![0], label: 'Bravyi et al. 2024' }])
  })
  it('the unit reads like any chapter’s: source, Try-it, both insights; ids and number from the spec', () => {
    expect(lecture.id).toBe('P1')
    expect(lecture.number).toBe(1)
    const u = lecture.units[0]
    expect(u.lecture).toEqual({ summary: P1.units[0].source.summary, pages: '§2.1, p. 9' })
    expect(u.visual.kind).toBe('pair-grid')
    expect(u.insightFormal).toBeTruthy()
    expect(lecture.units[0].story!.every((b: Beat) => b.formal)).toBe(true)
  })
  it('compiles once per spec object (the loader and the eager registry share the same Lecture)', () => {
    expect(compilePaper(P1).lecture).toBe(lecture)
  })
})

/** Validate a broken copy of P1 and return only the problems that mention `needle` (the rest of P1 is valid). */
const check = (mutate: (s: ReturnType<typeof p1>) => void): string[] => {
  const s = p1()
  mutate(s)
  return validatePaperSpec(s, ctx)
}

describe('every kind of mistake is refused with where and what', () => {
  it.each<[string, (s: ReturnType<typeof p1>) => void, string[]]>([
    [
      'an empty object',
      (s) => Object.keys(s).forEach((k) => delete s[k]),
      [
        'spec specVersion: expected 1, got nothing',
        'spec id: expected a chapter id P<n> (a paper lecture) or B<n> (a background chapter), got nothing',
        "spec kind: expected 'paper' or 'background', got nothing",
        'spec title: expected non-empty text, got nothing',
        'spec outcomes: expected 1 to 8 outcomes (non-empty text), got nothing',
        'spec references: expected a list (may be empty), got nothing',
        'spec prerequisites: expected a list of nodes, got nothing',
        'spec units: expected at least one unit, got nothing',
      ],
    ],
    ['a future spec version', (s) => (s.specVersion = 2 as 1), ['P1 specVersion: expected 1, got 2']],
    ['a P chapter that says it is background', (s) => (s.kind = 'background'), ["P1 kind: a P chapter is kind 'paper' and a B chapter kind 'background' (P1 is 'background')", 'P1 paper: only a paper lecture (kind paper) carries paper metadata']],
    ['an unknown top-level field', (s) => (s.script = 'x'), ['P1 script: unknown field (allowed: specVersion, id, kind, title, paper, outcomes, references, prerequisites, symbols, symbolsFormal, units)']],
    ['a malformed arXiv id', (s) => (s.paper!.arxiv = { id: '2506.309', version: 1 }), ["P1 paper.arxiv: expected {id: 'NNNN.NNNNN', version: 1 or more}, got {\"id\":\"2506.309\",\"version\":1}"]],
    ['a long short title (the verbatim guard)', (s) => (s.paper!.shortTitle = 'A modular quantum computer based on bivariate bicycle codes'), ['P1 paper.shortTitle: at most 40 characters (has 59)', 'P1 paper.shortTitle: at most 8 words (a long title trips the verbatim guard: cite by short title + arXiv id)']],
    ['a unit id outside the chapter', (s) => (s.units[0].id = 'q1-checks'), ['P1 units[0].id: expected a unit id p1-…, got "q1-checks"']],
    ['a claim key without the capital that keeps it out of 448’s space', (s) => (beat(s, 'p1-checks:b2').claims![0].key = 'p1amp'), ['P1 p1-checks:b2.claims[0].key: expected a claim key p1<Name> (a capital, then letters and digits), got "p1amp"']],
    ['beats out of order', (s) => (beat(s, 'p1-checks:b2').id = 'p1-checks:b3'), ['P1 p1-checks.story: p1-checks:b3: expected b2']],
    ['a beat without its Formal text', (s) => delete (beat(s, 'p1-checks:b1') as Record<string, unknown>).formal, ['P1 p1-checks:b1.formal: expected non-empty text, got nothing']],
    ['a caption without its Formal caption', (s) => delete beat(s, 'p1-checks:b2').captionFormal, ['P1 p1-checks:b2.captionFormal: expected non-empty text, got nothing']],
    ['a stage of no known kind', (s) => (beat(s, 'p1-checks:b1').stage = { kind: 'hologram' } as never), ['P1 p1-checks:b1.stage: expected a stage state of a known kind or a recipe reference {recipe, params}, got {"kind":"hologram"}']],
    ['an unknown recipe', (s) => (beat(s, 'p1-checks:b1').stage = { recipe: 'run-this', params: {} } as never), ['P1 p1-checks:b1.stage.recipe: unknown recipe "run-this" (registered: bell-amplitudes, grover-plane, circuit-gates, toric-code, rotated-patch, qec-small-code, check-schedule, check-circuit, repetition-history, logical-error-curves, pauli-frame, qldpc-family, bb-code, bb-presentations, bb-schedule, bb-shift, bp-decode)']],
    ['a recipe parameter out of range', (s) => (beat(s, 'p1-checks:b1').stage = { recipe: 'grover-plane', params: { n: 99 } }), ['P1 p1-checks:b1.stage grover-plane params.n: expected a whole number from 1 to 10, got 99']],
    ['a claim citing an output the recipe does not have', (s) => (beat(s, 'p1-checks:b2').claims![0].value = 'a22'), ['P1 p1-checks:b2.claims[0].value: bell-amplitudes has no output "a22" (it has a00, p00, a01, p01, a10, p10, a11, p11)']],
    ['a claim key of another chapter', (s) => (beat(s, 'p1-checks:b2').claims![0].key = 'q1BellAmp'), ['P1 p1-checks:b2.claims[0].key: expected a claim key p1<Name> (a capital, then letters and digits), got "q1BellAmp"']],
    ['a trail entry to a reference the spec does not list', (s) => (beat(s, 'p1-checks:b2').trail![0].ref = 'gross24'), ['P1 p1-checks:b2.trail[0].ref: no reference "gross24" in this spec\'s references']],
    ['markup in a trail’s place', (s) => (beat(s, 'p1-checks:b2').trail![0].at = '$\\S 2$'), ['P1 p1-checks:b2.trail[0].at: plain words only (no TeX, [[gloss]], {{term}} or <<bridge>> markup)']],
    ['a reported number from another source', (s) => (beat(s, 'p1-checks:b1').reported![0].source = 'paper-xyz'), ['P1 p1-checks:b1.reported[0].source: a paper lecture reports its own paper\'s numbers (paper-tdg) or a reference\'s (one of bra24), got paper-xyz']],
    ['a reported number of a reference, located by a section label alone', (s) => Object.assign(beat(s, 'p1-checks:b1').reported![0], { source: 'bra24', at: { kind: 'section', label: '2.1' } }), []],
    ['a reported number of a reference with no label at all', (s) => Object.assign(beat(s, 'p1-checks:b1').reported![0], { source: 'bra24', at: { kind: 'text' } }), ['P1 p1-checks:b1.reported[0].at: a reference without printed pages is located by a section, table, figure or equation label']],
    ['a reported number of the paper without its page', (s) => (beat(s, 'p1-checks:b1').reported![0].at = { kind: 'section', label: '2.1' } as never), ['P1 p1-checks:b1.reported[0].at.page: expected the printed page (a whole number), got nothing']],
    ['a reported number with no exact location', (s) => (beat(s, 'p1-checks:b1').reported![0].at = { kind: 'table', page: 0 }), ["P1 p1-checks:b1.reported[0].at.label: a table is named by its label ('3', '3b', '2.1'), got nothing", 'P1 p1-checks:b1.reported[0].at.page: expected the printed page (a whole number), got 0']],
    ['a reported value written as TeX', (s) => (beat(s, 'p1-checks:b1').reported![0].value = '$10^{-7}$'), ['P1 p1-checks:b1.reported[0].value: the value as printed, in plain characters (write 10⁻⁷ or 1e-7, not TeX)']],
    [
      'a recipe that says it uses a reported number the spec does not have (R3)',
      (s) => (beat(s, 'p1-checks:b1').stage = { recipe: 'bell-amplitudes', params: { state: 'Phi+' }, uses: ['gross-distance'] }),
      ['P1 p1-checks:b1.stage.uses: no reported claim gross-distance in this spec'],
    ],
    ['a depth-2 reference with no way in', (s) => (s.references[0].depth = 2), ['P1 references.bra24.via: a depth-2 reference names the depth-1 reference it was reached through, got nothing']],
    ['a cited-only reference that claims a part relied on', (s) => (s.references[0].reliedOn = '§3'), ['P1 references[0].reliedOn: only a reference that was read names the part relied on']],
    ['a read reference without the part relied on', (s) => (s.references[0].status = 'read'), ['P1 references[0].reliedOn: expected non-empty text, got nothing']],
    ['a reference cited by its full title', (s) => (s.references[0].label = 'Bravyi and others on high threshold and low overhead fault tolerant memory'), ['P1 references[0].label: at most 11 words: cite by author and year (a 12+ word title trips the verbatim guard)']],
    ['a prerequisite that needs an unknown node', (s) => s.prerequisites[0].needs.push('magic'), ['P1 prerequisites.qubit.needs: no node magic']],
    ['a cycle in the prerequisite graph', (s) => s.prerequisites[0].needs.push('checks'), ['P1 prerequisites: the graph has a cycle: qubit → checks → stabilizer → bell → register → qubit']],
    ['a teaching unit that does not exist', (s) => (s.prerequisites[0].teach = { course: 'qc709', chapter: 'Q4', unit: 'q4-nope' }), ['P1 prerequisites[0].teach.unit: Q4 has no unit q4-nope']],
    ['a written chapter named without its unit', (s) => (s.prerequisites[0].teach = { course: 'qc709', chapter: 'Q4' }), ['P1 prerequisites[0].teach: Q4 is written: name the unit that teaches this']],
    ['a chapter of the wrong course', (s) => (s.prerequisites[0].teach = { course: 'sl448', chapter: 'Q4', unit: 'q4-qubit' }), ['P1 prerequisites[0].teach.chapter: expected a Physics 448 chapter id, got "Q4"']],
    ['a planned chapter that is on no plan', (s) => (s.prerequisites[0].teach = { course: 'papers', chapter: 'B7' }), ["P1 prerequisites[0].teach.chapter: B7 is neither written nor on Papers's plan"]],
  ])('%s', (_, mutate, want) => {
    expect(check(mutate)).toEqual(want)
  })

  it('reports every problem at once (here: three different ones)', () => {
    const got = check((s) => {
      s.title = ''
      beat(s, 'p1-checks:b2').trail![0].ref = 'nope'
      s.prerequisites[0].needs.push('nope')
    })
    expect(got).toHaveLength(3)
  })

  it('a hostile value never throws and never pollutes a prototype', () => {
    for (const x of [null, undefined, 0, 'P1', [], () => 1, JSON.parse('{"__proto__": {"polluted": 1}, "id": "P1"}')]) {
      expect(() => validatePaperSpec(x, ctx)).not.toThrow()
      expect(validatePaperSpec(x, ctx).length).toBeGreaterThan(0)
    }
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })

  it('at load time an invalid spec is refused again: compilePaper throws a PaperSpecError with every problem', () => {
    const s = p1()
    beat(s, 'p1-checks:b1').stage = { recipe: 'grover-plane', params: { n: 0 } }
    let err: unknown
    try {
      compilePaper(s)
    } catch (e) {
      err = e
    }
    expect(err).toBeInstanceOf(PaperSpecError)
    expect((err as PaperSpecError).problems).toEqual(['P1 p1-checks:b1.stage grover-plane params.n: expected a whole number from 1 to 10, got 0'])
  })
})

describe('build time: tsc refuses a recipe outside the registry and a parameter of the wrong type', () => {
  it('(type-level: these lines fail `npm run build` if the @ts-expect-error is not needed)', () => {
    // @ts-expect-error an unknown recipe id is not a RecipeRef
    const unknown: RecipeRef = { recipe: 'run-this', params: {} }
    // @ts-expect-error grover-plane's n is a number
    const wrongType: RecipeRef = { recipe: 'grover-plane', params: { n: '4' } }
    // @ts-expect-error bell-amplitudes knows only the four Bell states
    const wrongState: RecipeRef = { recipe: 'bell-amplitudes', params: { state: 'Chi+' } }
    const fine: RecipeRef = { recipe: 'circuit-gates', params: { qubits: 2, gates: [{ gate: 'H', target: 0 }] } }
    expect([unknown, wrongType, wrongState, fine]).toHaveLength(4)
  })
})
