/**
 * The notes kit (kit.ts): `notesProblems` fails on each kind of mistake, and a valid spec compiles into an ordinary
 * `Lecture` of the shape the shared lints expect. The fixture is INLINE (not under `__fixtures__`: build rule (k) is about
 * what ships, and this file is a test), so the kit is tested on its own before any real lecture exists.
 */
import { describe, expect, it } from 'vitest'
import { FIGURE_KINDS, PLACEHOLDER_KINDS } from '../../../stage/figures/FigureFor'
import { validateLayout } from '../../../stage/resolve'
import '../../../stage/svg/kinds' // registers the SVG stage kinds, as a page whose lecture uses them does
import type { Claim } from '../../schema'
import { layoutStates } from '../../stage'
import {
  FULL_WORDS,
  NOTES_FIGURE_KINDS,
  NOTES_NO_FIGURE,
  NOTES_VISUAL,
  NotesSpecError,
  firstPage,
  notesLecture,
  notesProblems,
  proseWords,
  sectionBridges,
  sentencesOf,
  specOfNotes,
  type NotesSpec,
} from './kit'

/** A sentence of exactly 23 words. */
const SENT = 'The quantum state of the atom is described by a ket, and the beam is split by the field into two separate parts.'
const para = (sentences: number): string => Array.from({ length: sentences }, () => SENT).join(' ')
const claim = (key: string): Claim => ({ text: `${key} · the chance is one half`, holds: () => true })
const FIG = { kind: 'amplitudes', state: { dir: '+x' }, mode: 'probability', labels: 'spin' } as const

/** A valid short lecture 7 notes: two sections, four paragraphs of 46 words (184 words), one figure, one claim, one symbol site. */
function fixture(edit?: (s: NotesSpec) => void): NotesSpec {
  const s: NotesSpec = {
    number: 7,
    title: 'A fixture lecture',
    date: '2026-09-02',
    topics: ['first topic', 'second topic', 'third topic'],
    length: 'short',
    symbols: { '\\psi': 'n7-first:b1', '\\alpha': 'n7-second' },
    sections: [
      {
        id: 'n7-first',
        label: '§A',
        title: 'The first section',
        pages: 'pp. 4–5',
        summary: 'The first section says what the beam does in one sentence.',
        body: [
          { text: `${para(2)} A state is $\\psi$.` },
          { text: para(2), figure: { stage: FIG, caption: 'The chance of each outcome is one half.' }, claims: [claim('n7Half')] },
        ],
      },
      {
        id: 'n7-second',
        label: '§B',
        title: 'The second section',
        pages: 'p. 6',
        summary: 'The second section adds a rule.',
        body: [{ text: para(2) }, { text: para(2) }],
      },
    ],
  }
  edit?.(s)
  return s
}
const problems = (edit?: (s: NotesSpec) => void) => notesProblems(fixture(edit), { layout: validateLayout })
const only = (edit: (s: NotesSpec) => void, needle: string) => {
  const found = problems(edit)
  expect(found.length, found.join('\n')).toBeGreaterThan(0)
  expect(
    found.some((f) => f.includes(needle)),
    `${needle} in:\n${found.join('\n')}`,
  ).toBe(true)
  for (const f of found) expect(f.startsWith('N7 '), f).toBe(true)
}

describe('notesProblems', () => {
  it('the fixture is valid, and its prose is what the windows count', () => {
    expect(problems()).toEqual([])
    expect(sentencesOf(SENT)).toEqual([SENT])
    expect(proseWords(para(2))).toBe(46)
    // a formula and markup are not prose words
    expect(proseWords('A state $\\psi$ is [[qc-ket|a ket]] and <<qc-q1-vector-space|Unit 1.4>> is **bold**.')).toBe(10)
  })

  it('fails on a bad number, title or date', () => {
    // (a bad number has no lecture id to start the message with)
    for (const n of [0, 1.5, 100]) expect(problems((s) => (s.number = n))[0], String(n)).toContain('number must be a whole number from 1 to 99')
    only((s) => (s.title = 'Has $math$'), 'title')
    only((s) => (s.date = '2026-02-30'), 'date')
    only((s) => (s.date = 'last week'), 'date')
  })

  it('fails on the topics list', () => {
    only((s) => (s.topics = ['one', 'two']), 'topics')
    only((s) => (s.topics = Array.from({ length: 9 }, (_, i) => `topic ${i}`)), 'topics')
    only((s) => (s.topics[0] = 'a $tex$ topic'), 'topics[0]')
  })

  it('fails on a bad section id and on a duplicate one', () => {
    only((s) => (s.sections[0].id = 'n7_first'), 'section id')
    only((s) => (s.sections[0].id = 'n8-first'), 'section id')
    only((s) => (s.sections[0].id = 'n7-First'), 'section id')
    only((s) => (s.sections[1].id = 'n7-first'), 'duplicate section')
  })

  it('fails on a bad label, title and page range; pages never decrease', () => {
    only((s) => (s.sections[0].label = '§A very long marker'), 'label')
    only((s) => (s.sections[0].label = '§A B'), 'no space')
    only((s) => (s.sections[0].label = ''), 'label')
    only((s) => (s.sections[0].title = 'A \\alpha title'), 'title')
    only((s) => (s.sections[0].pages = 'page 4'), 'pages')
    only((s) => (s.sections[0].pages = 'pp. 4-5'), 'pages') // a hyphen, not an en dash
    only((s) => (s.sections[0].pages = 'pp. 5–5'), 'must end after')
    only((s) => (s.sections[1].pages = 'p. 3'), 'before the previous section')
    expect(firstPage('pp. 12–14')).toBe(12)
    expect(firstPage('p. 7')).toBe(7)
    expect(firstPage('p. 0')).toBeNull()
  })

  it('fails on a summary that is two sentences or over 40 words', () => {
    only((s) => (s.sections[0].summary = 'One sentence. And another one.'), 'ONE sentence')
    only((s) => (s.sections[0].summary = `${Array.from({ length: 41 }, (_, i) => `w${i}`).join(' ')}.`), 'more than 40 words')
  })

  it('fails on a sentence of 41 words and on a paragraph over 120 words', () => {
    const w = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ')
    only((s) => (s.sections[1].body[0].text = `${w(41)}. ${para(1)}`), 'a sentence of 41 words')
    // 40 words in a sentence is allowed
    expect(problems((s) => (s.sections[1].body[0].text = `${w(40)}. ${para(2)}`))).toEqual([])
    only((s) => (s.sections[1].body[0].text = para(6)), 'has 138 words')
  })

  it('counts the lecture window on prose outside $…$: short 150 to 300, full 900 to 1,500', () => {
    only((s) => (s.sections[1].body = [{ text: para(1) }]), 'a short lecture holds 150 to 300 words')
    only((s) => s.sections.forEach((sec) => (sec.body = [{ text: para(4) }, { text: para(4) }, { text: para(4) }])), 'a short lecture holds 150 to 300 words') // 6 x 92 = 552
    only((s) => (s.length = 'full'), 'a full lecture')
    expect(FULL_WORDS).toEqual({ min: 900, max: 1500 })
    // 3 paragraphs a section is the short maximum, a fourth is too many
    only((s) => (s.sections[1].body = [{ text: para(1) }, { text: para(1) }, { text: para(1) }, { text: para(1) }]), 'needs 1 to 3 paragraphs')
    // a full lecture needs at least 2 paragraphs a section
    only((s) => {
      s.length = 'full'
      s.sections[1].body = [{ text: para(1) }]
    }, 'needs 2 to 12 paragraphs')
  })

  it('fails on TeX outside $…$', () => {
    only((s) => (s.sections[1].body[0].text = `${para(2)} The state \\alpha is a number.`), 'TeX command outside')
    only((s) => (s.sections[1].summary = 'The \\alpha rule in one sentence.'), 'must be plain text')
    only((s) => (s.sections[1].summary = 'The rule $c = 1$ in one sentence.'), 'must be plain text')
  })

  it('fails on a figure whose kind has no print figure (hopf), a bad caption, or a failing layout check', () => {
    only((s) => (s.sections[0].body[1].figure = { stage: { kind: 'hopf' } as never, caption: 'A caption.' }), 'kind "hopf"')
    only((s) => (s.sections[0].body[1].figure!.caption = 'One. Two.'), 'ONE sentence')
    only((s) => (s.sections[0].body[1].figure!.caption = 'It is \\alpha.'), 'TeX command outside')
    // the layout hook is what runs validateLayout: a state it refuses (an unknown shot) is reported with the figure's place
    only((s) => (s.sections[0].body[1].figure!.stage = { ...FIG, shot: 'no-such-shot' } as never), 'unknown shot "no-such-shot"')
    expect(notesProblems(fixture((s) => (s.sections[0].body[1].figure!.stage = { ...FIG, shot: 'no-such-shot' } as never)))).toEqual([]) // without the hook the kit alone does not look
    // a layout that repeats a kind is refused by the same hook
    only((s) => (s.sections[0].body[1].figure!.stage = { layout: 'split', top: FIG, bottom: FIG }), 'repeats a kind')
    // a split layout of two allowed kinds is fine
    expect(problems((s) => (s.sections[0].body[1].figure!.stage = { layout: 'split', top: FIG, bottom: { kind: 'complex-plane', z: { re: 1, im: 0 } } }))).toEqual([])
  })

  it('fails on a claim key that is neither this lecture’s own (n7Name) nor a 709 chapter’s (q8Name, ruling W12)', () => {
    only((s) => (s.sections[0].body[1].claims = [claim('n8Half')]), 'needs a key like n7Name') // another notes lecture's key
    only((s) => (s.sections[0].body[1].claims = [claim('n7half')]), 'needs a key like n7Name')
    only((s) => (s.sections[0].body[1].claims = [claim('l3Half')]), 'needs a key like n7Name') // a 448 key
    only((s) => (s.sections[0].body[1].claims = [claim('p1BellAmp')]), 'needs a key like n7Name') // a Papers key
    only((s) => (s.sections[0].body[1].claims = [{ text: 'no key here', holds: () => true }]), 'needs a key like n7Name')
    only((s) => (s.sections[0].body[1].claims = [claim('n7Half'), claim('n7Half')]), 'listed twice')
  })

  it('accepts a key a 709 chapter owns, beside or instead of the lecture’s own (one source of truth: ruling W12)', () => {
    expect(problems((s) => (s.sections[0].body[1].claims = [claim('q8ThermR')]))).toEqual([])
    expect(problems((s) => (s.sections[0].body[1].claims = [claim('n7Half'), claim('f2Phase'), claim('q12FamC06')]))).toEqual([])
    // the same chapter number may be cited in two paragraphs
    expect(problems((s) => (s.sections[1].body[0].claims = [claim('q8ThermR')]))).toEqual([])
  })

  it('fails on a symbol whose site is not in the lecture', () => {
    only((s) => (s.symbols['\\beta'] = 'n7-missing'), 'not a section of this lecture')
    only((s) => (s.symbols['\\beta'] = 'n7-first:b3'), 'no paragraph 3')
    only((s) => (s.symbols['\\beta'] = 'q1-superposition:b1'), 'not a section of this lecture')
  })

  it('reports every problem at once, each naming the lecture and the place', () => {
    const found = problems((s) => {
      s.sections[0].id = 'bad_id'
      s.sections[1].pages = 'nope'
      s.date = 'never'
    })
    expect(found.length).toBeGreaterThanOrEqual(3)
    expect(found.every((f) => f.startsWith('N7 '))).toBe(true)
    expect(found.some((f) => f.startsWith('N7 bad_id'))).toBe(true)
    expect(found.some((f) => f.startsWith('N7 n7-second.pages'))).toBe(true)
  })
})

describe('notesLecture', () => {
  const lecture = notesLecture(fixture(), { layout: validateLayout })

  it('turns a spec into an ordinary Lecture', () => {
    expect(lecture.id).toBe('N7')
    expect(lecture.number).toBe(7)
    expect(lecture.title).toBe('A fixture lecture')
    expect(lecture.date).toBe('2026-09-02')
    expect(lecture.outcomes).toEqual(['first topic', 'second topic', 'third topic'])
    expect(lecture.prerequisites).toEqual([])
    expect(lecture.symbols).toEqual({ '\\psi': 'n7-first:b1', '\\alpha': 'n7-second' })
    expect(lecture.symbolsFormal).toBeUndefined()
    expect(lecture.corrections).toBeUndefined()
    expect(lecture.units.map((u) => u.id)).toEqual(['n7-first', 'n7-second'])
  })

  it('one section = one Unit (label and title, one-sentence summary as question and insight, no play), one paragraph = one Beat', () => {
    const [u] = lecture.units
    expect(u.title).toBe('§A The first section')
    expect(u.question).toBe(u.lecture.summary)
    expect(u.insight).toBe(u.lecture.summary)
    expect(u.lecture.pages).toBe('pp. 4–5')
    expect(u.books).toEqual([])
    expect(u.clues).toEqual([])
    expect(u.play).toEqual([])
    expect(u.insightFormal).toBeUndefined()
    expect(u.visual).toBe(NOTES_VISUAL)
    expect(u.story!.map((b) => b.id)).toEqual(['n7-first:b1', 'n7-first:b2'])
    expect(u.story!.every((b) => b.phase === 'lecture' && b.formal === undefined && !b.reveal && !b.derivation)).toBe(true)
    expect(u.claims).toHaveLength(1)
    expect(u.claims).toEqual(u.story![1].claims)
  })

  it('a beat has a caption exactly when its paragraph has a figure; stages carry forward within a section', () => {
    const [a, b] = lecture.units
    expect(a.story![0].caption).toBeUndefined()
    expect(a.story![1].caption).toBe('The chance of each outcome is one half.')
    // before any figure: the placeholder state, never drawn; after it: the same figure carried (no new picture)
    expect(a.story![0].stage).toBe(NOTES_NO_FIGURE)
    expect(a.story![1].stage).toEqual({ ...FIG })
    expect(b.story!.every((x) => x.stage === NOTES_NO_FIGURE && x.caption === undefined)).toBe(true)
    for (const unit of lecture.units) for (const beat of unit.story!) expect(validateLayout(beat.stage), beat.id).toEqual([])
    // and the carried-forward beat repeats the figure's stage when a later paragraph has none
    const carried = notesLecture(fixture((s) => s.sections[0].body.push({ text: para(1) })))
    expect(carried.units[0].story![2].stage).toEqual({ ...FIG })
    expect(carried.units[0].story![2].caption).toBeUndefined()
  })

  it('is deterministic: the same spec object gives the same Lecture, a second build the same JSON, and the spec is recoverable', () => {
    const spec = fixture()
    const first = notesLecture(spec)
    expect(notesLecture(spec)).toBe(first)
    expect(specOfNotes(first)).toBe(spec)
    const again = notesLecture(fixture())
    // functions (claims) are not data: compare the rest
    const strip = (l: unknown) => JSON.stringify(l)
    expect(strip(again)).toBe(strip(first))
  })

  it('throws a NotesSpecError listing every problem of an invalid spec', () => {
    const spec = fixture((s) => {
      s.sections[0].id = 'wrong'
      s.date = 'never'
    })
    let err: unknown
    try {
      notesLecture(spec)
    } catch (e) {
      err = e
    }
    expect(err).toBeInstanceOf(NotesSpecError)
    expect((err as NotesSpecError).problems.length).toBeGreaterThanOrEqual(2)
    expect((err as Error).message).toContain('N7 wrong')
  })

  it('lists the bridges of a section from its prose and captions, in order, each once', () => {
    const l = notesLecture(
      fixture((s) => {
        s.sections[0].body[0].text = `${para(1)} See <<qc-q1-superposition|Unit 1.3>> and <<qc-q1-vector-space|Unit 1.4>>, and again <<qc-q1-superposition|Unit 1.3>>.`
        s.sections[0].body[1].figure!.caption = 'The chance, as in <<qc-q1-sequences|Unit 1.2>>.'
      }),
    )
    expect(sectionBridges(l.units[0])).toEqual(['qc-q1-superposition', 'qc-q1-vector-space', 'qc-q1-sequences'])
    expect(sectionBridges(l.units[1])).toEqual([])
  })
})

describe('figure kinds', () => {
  it('are exactly the print-figure kinds without the hopf placeholder (so the kit and FigureFor cannot drift)', () => {
    expect([...NOTES_FIGURE_KINDS].sort()).toEqual([...FIGURE_KINDS].sort())
    expect(PLACEHOLDER_KINDS).toEqual(['hopf'])
    expect(NOTES_FIGURE_KINDS.includes('hopf')).toBe(false)
    expect(layoutStates(NOTES_NO_FIGURE).every((s) => NOTES_FIGURE_KINDS.includes(s.kind))).toBe(true)
  })
})

/* ------------------------------------------------------------------------------------------------ */
/* The Optics Lab: the second collection of the same kit                                             */
/* ------------------------------------------------------------------------------------------------ */

/** The same fixture as an optics page O3: ids `O3`, sections `o3-…`, claim keys `o3…`, a book chapter instead of a class date. */
function opticsFixture(edit?: (s: NotesSpec) => void): NotesSpec {
  const f = fixture()
  const s: NotesSpec = {
    ...f,
    collection: 'optics',
    number: 3,
    date: undefined,
    book: 'Foot, Atomic Physics, ch. 9',
    symbols: { '\\psi': 'o3-first:b1', '\\alpha': 'o3-second' },
    sections: f.sections.map((sec) => ({
      ...sec,
      id: sec.id.replace('n7-', 'o3-'),
      body: sec.body.map((b) => ({ ...b, claims: b.claims?.map(() => claim('o3Half')) })),
    })),
  }
  delete s.date
  edit?.(s)
  return s
}
const opticsProblems = (edit?: (s: NotesSpec) => void) => notesProblems(opticsFixture(edit), { layout: validateLayout })

describe('notesProblems: the Optics Lab collection', () => {
  it('a valid optics page passes: no class date, a book chapter, ids O3 / o3-… / o3…', () => {
    expect(opticsProblems()).toEqual([])
    const l = notesLecture(opticsFixture())
    expect(l.id).toBe('O3')
    expect(l.date).toBeUndefined()
    expect('date' in l).toBe(false)
    expect(l.units.map((u) => u.id)).toEqual(['o3-first', 'o3-second'])
    expect(l.units[0].story!.map((b) => b.id)).toEqual(['o3-first:b1', 'o3-first:b2'])
    expect(specOfNotes(l)?.book).toBe('Foot, Atomic Physics, ch. 9')
  })
  it('the notes collection is unchanged: N-ids, a required class date, no book field', () => {
    expect(notesLecture(fixture()).id).toBe('N7')
    expect(problems((s) => delete s.date).some((p) => p.includes('N7 date is required'))).toBe(true)
    only((s) => (s.book = 'Foot, ch. 9'), 'book')
  })
  it('every message starts with the optics id, and the section and claim patterns use the o-letter', () => {
    const found = opticsProblems((s) => {
      s.sections[0].id = 'n3-first'
      s.sections[1].id = 'o4-second'
    })
    expect(found.length).toBeGreaterThan(0)
    for (const f of found) expect(f.startsWith('O3 '), f).toBe(true)
    expect(found.some((f) => f.includes('must look like o3-bell-basis'))).toBe(true)
    const keys = opticsProblems((s) => (s.sections[0].body[1].claims = [claim('n3Half')]))
    expect(keys.some((f) => f.includes('o3Name'))).toBe(true)
    expect(opticsProblems((s) => (s.sections[0].body[1].claims = [claim('q8ThermR')]))).toEqual([]) // a chapter-owned key is still cited, not copied
  })
  it('an optics page needs a plain book chapter; a date is allowed but must be real', () => {
    for (const book of [undefined, '', 'Has $math$', 'x'.repeat(121)]) expect(opticsProblems((s) => (s.book = book)).some((f) => f.startsWith('O3 book')), String(book)).toBe(true)
    expect(opticsProblems((s) => (s.date = '2026-10-29'))).toEqual([])
    expect(opticsProblems((s) => (s.date = '2026-02-30')).some((f) => f.startsWith('O3 date'))).toBe(true)
    expect(opticsProblems((s) => (s.number = 0))[0]).toContain('O?0 number must be a whole number')
  })
})

describe('notesProblems: a paragraph widget', () => {
  const W = { kind: 'optics-bench', props: { preset: 'lorentzian' } } as const
  it('a paragraph may carry ONE widget; it compiles onto its beat and nothing else changes', () => {
    const spec = fixture((s) => (s.sections[1].body[0].widget = W))
    expect(notesProblems(spec, { layout: validateLayout })).toEqual([])
    const l = notesLecture(spec)
    expect(l.units[1].story![0].widget).toEqual(W)
    expect(l.units[1].story![1].widget).toBeUndefined()
    expect(l.units[0].story!.every((b) => b.widget === undefined)).toBe(true)
  })
  it('the Bloch sphere is refused (three.js, no stage host); an empty kind and a digit in a caption are caught', () => {
    only((s) => (s.sections[0].body[0].widget = { kind: 'bloch' }), 'three.js')
    only((s) => (s.sections[0].body[0].widget = { kind: '' as never }), 'needs a kind')
    only((s) => (s.sections[0].body[0].widget = { ...W, caption: 'The line at 0.2.' }), 'no digit')
    only((s) => (s.sections[0].body[0].widget = { ...W, caption: 'First sentence. Second sentence.' }), 'ONE plain sentence')
    expect(problems((s) => (s.sections[0].body[0].widget = { ...W, caption: 'The sliders move the curve.' }))).toEqual([])
  })
  it('the injected widget check runs on every paragraph widget and its messages are prefixed with the place', () => {
    const spec = fixture((s) => {
      s.sections[0].body[0].widget = W
      s.sections[1].body[1].widget = W
    })
    const found = notesProblems(spec, { layout: validateLayout, widget: () => ['unknown preset'] })
    expect(found).toEqual(['N7 n7-first:b1.widget unknown preset', 'N7 n7-second:b2.widget unknown preset'])
  })
})
