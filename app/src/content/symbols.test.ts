/**
 * P's plain-language lints (W-L1 §6.1; owner P). They run over `readingOrder` (content/walk.ts), i.e. the
 * order a student meets the text: outcomes → watch → corrections → per unit: story → lecture → books → …
 *
 *  1. Symbol before use: every TeX symbol is defined at or before its first use, by
 *     `Lecture.symbols` (symbol → unit / beat / site id), by a gloss tag `[[id]]` whose entry lists the
 *     symbol in `symbols`, or by the axis letters x, y, z. Kets need the ket notation AND the named ket;
 *     ⟨a|b⟩ needs the inner-product notation; ⟨X⟩ (no bar) needs the average notation. One definition per
 *     symbol, so a letter reused with a second meaning (θ for the moment and for the magnet tilt) fails.
 *  2. Gloss at first use: the first time a technical term appears in a unit's prose, it (or an earlier
 *     site) carries its gloss tag.
 *  3. The logic unit's orders are "z-first / x-first", never "order A / order B" (A, B are sets there).
 *  4. Sentences ≤ 25 words in core text (beats, reveals), summaries, insights, pitfalls, review cards,
 *     glosses and fidelity notes; review cards have ≤ 5 points.
 * The 14 FLAG rows of P2-L1-story §5 are the fixtures: each old sentence must be caught.
 */
import { describe, expect, it } from 'vitest'
import { FIDELITY, FIDELITY_VARIANT } from './fidelity'
import { GLOSSARY } from './glossary'
import { LECTURES } from './index'
import type { GlossEntry, Lecture } from './schema'
import { glossRefs, inlineTokens, readingOrder, splitDisplay, texSpans, texSymbols, type TextSite } from './walk'

/* ---------------------------------------------------------------------------------------------- */
/* Lint 1: symbol before use                                                                       */
/* ---------------------------------------------------------------------------------------------- */

const BASE = new Set(['x', 'y', 'z'])
/** Markup that texSymbols would otherwise read as letters, and notation that is not a symbol. */
const STRIP_RE = /\\(?:htmlClass|begin|end|color)\{[^}]*\}/g
const IGNORE = new Set(['\\circ'])

function ketsOf(label: string): string[] {
  if (!label) return []
  if (label.startsWith('\\pm')) {
    const r = label.slice(3)
    return [`|+${r}\\rangle`, `|-${r}\\rangle`]
  }
  return [`|${label}\\rangle`]
}

/**
 * Symbols (and notations) a TeX span needs a reader to know.
 * Brackets are taken out here, BEFORE `texSymbols`: its bra-ket regex (walk.ts, frozen) backtracks
 * exponentially on a `\\langle…\\rangle` average with no bar and many control words (reported to W in
 * docs/roles/interface-changes.md). With no `\\langle` left, its regexes fail fast.
 */
export function requiredSymbols(tex: string): string[] {
  const out = new Set<string>()
  const clean = (x: string) => x.replace(/[{}\s]/g, '')
  const NOT_RANGLE = '(?:(?!\\\\rangle)[^|])*?'
  let s = tex
    .replace(STRIP_RE, ' ')
    .replace(/_\{\\text\{([^}]*)\}\}/g, '_{$1}')
    .replace(/\\(?:text|mathrm|operatorname)\{[^}]*\}/g, ' ')
  s = s.replace(new RegExp(`\\\\langle(${NOT_RANGLE})\\|([^|]*?)\\\\rangle`, 'g'), (_, a: string, b: string) => {
    out.add('\\langle\\cdot|\\cdot\\rangle')
    for (const k of [...ketsOf(clean(a)), ...ketsOf(clean(b))]) out.add(k)
    return ' '
  })
  s = s.replace(/\|([^|]*?)\\rangle/g, (_, a: string) => {
    out.add('|\\cdot\\rangle')
    for (const k of ketsOf(clean(a))) out.add(k)
    return ' '
  })
  s = s.replace(new RegExp(`\\\\langle(${NOT_RANGLE})\\|`, 'g'), (_, a: string) => {
    out.add('\\langle\\cdot|')
    for (const k of ketsOf(clean(a))) out.add(k)
    return ' '
  })
  s = s.replace(new RegExp(`\\\\langle(${NOT_RANGLE})\\\\rangle`, 'g'), (_, a: string) => {
    out.add('\\langle\\cdot\\rangle')
    return ` ${a} `
  })
  s = s.replace(/\\[lr]angle/g, ' ')
  for (const raw of texSymbols(s)) if (!IGNORE.has(raw)) out.add(raw)
  return [...out]
}

export interface Problem {
  where: string
  field: string
  symbol: string
}

/** Index of the first site at or inside `id` (a unit id, beat id, or site `where`). */
function sitePos(sites: readonly TextSite[], id: string): number {
  return sites.findIndex((s) => s.where === id || s.where.startsWith(`${id}.`) || s.where.startsWith(`${id}:`) || s.where.startsWith(`${id}[`))
}

/** Symbol-before-use over sites in reading order. Reports each symbol once, at its first bad use. */
export function lintSymbols(
  sites: readonly TextSite[],
  defs: Readonly<Record<string, string>>,
  gloss: ReadonlyMap<string, GlossEntry> = GLOSSARY,
): Problem[] {
  const out: Problem[] = []
  const defPos = new Map<string, number>()
  for (const [sym, id] of Object.entries(defs)) {
    const p = sitePos(sites, id)
    if (p < 0) out.push({ where: id, field: 'symbols', symbol: `${sym} (definition site not found)` })
    defPos.set(sym, p)
  }
  const glossed = new Set<string>()
  const reported = new Set<string>()
  sites.forEach((site, i) => {
    for (const id of glossRefs(site.text)) for (const s of gloss.get(id)?.symbols ?? []) glossed.add(s)
    const spans = site.tex === 'display' ? [site.text] : texSpans(site.text).map((s) => s.tex)
    for (const tex of spans)
      for (const sym of requiredSymbols(tex)) {
        if (BASE.has(sym) || glossed.has(sym) || reported.has(sym)) continue
        const p = defPos.get(sym)
        if (p !== undefined && p >= 0 && p <= i) continue
        reported.add(sym)
        out.push({ where: site.where, field: site.field, symbol: sym })
      }
  })
  return out
}

/* ---------------------------------------------------------------------------------------------- */
/* Lint 2: technical terms are glossed at first use                                                */
/* ---------------------------------------------------------------------------------------------- */

const TECH: Readonly<Record<string, RegExp>> = {
  'hilbert-space': /\bHilbert space/i,
  'state-space': /\bstate[ -]space\b/i,
  superposition: /\bsuperposition/i,
  'inner-product': /\binner product/i,
  'born-rule': /\bBorn rule/i,
  unpolarized: /\bunpolari[sz]ed/i,
  mixture: /\bmixture/i,
  'global-phase': /\bglobal phase|\boverall sign/i,
  'relative-phase': /\brelative (sign|phase)/i,
  qubit: /\bqubit/i,
  precession: /\bprecess/i,
  'hidden-label': /\bhidden (label|variable)/i,
  orthogonal: /\borthogonal/i,
  'orthonormal-basis': /\borthonormal/i,
  normalized: /\bnormali[sz]ed/i,
  'vector-space': /\bvector space/i,
  distinguishable: /\bperfectly distinguishable/i,
  expectation: /\bexpectation value/i,
  'bloch-sphere': /\bBloch sphere/i,
  'bloch-ball': /\bBloch ball/i,
}

/** Prose of a rich string (TeX removed; gloss/term shown text kept). */
function prose(text: string): string {
  return splitDisplay(text)
    .filter((_, j) => j % 2 === 0)
    .flatMap((p) => inlineTokens(p))
    .map((t) => (t.t === 'tex' ? ' ' : t.t === 'gloss' || t.t === 'term' ? t.shown : t.v))
    .join('')
}

/** Unit-level sites only: the lecture header (outcomes, watch, errata) is a table of contents, not prose. */
const unitSites = (l: Lecture) => readingOrder(l).filter((s) => !s.where.startsWith(`${l.id}.`))

export function lintTerms(sites: readonly TextSite[]): Problem[] {
  const out: Problem[] = []
  for (const [id, re] of Object.entries(TECH)) {
    const first = sites.findIndex((s) => re.test(prose(s.text)))
    if (first < 0) continue
    const tagged = sites.slice(0, first + 1).some((s) => glossRefs(s.text).includes(id))
    if (!tagged) out.push({ where: sites[first].where, field: sites[first].field, symbol: `term:${id}` })
  }
  return out
}

/* ---------------------------------------------------------------------------------------------- */
/* Lint 3: order names in the logic unit                                                           */
/* ---------------------------------------------------------------------------------------------- */

export function lintOrderNames(sites: readonly TextSite[]): Problem[] {
  return sites.filter((s) => /\border [AB]\b/.test(prose(s.text))).map((s) => ({ where: s.where, field: s.field, symbol: 'order A/B' }))
}

/* ---------------------------------------------------------------------------------------------- */
/* Lint 4: sentence length                                                                         */
/* ---------------------------------------------------------------------------------------------- */

const ABBREV = /\b(pp?|Fig|figs?|eqs?|Exps?|Def|vs|e\.g|i\.e|No)\./g

/** Sentences of a rich string: TeX spans count as one word each, markup is dropped. */
export function sentences(text: string): string[] {
  const flat = splitDisplay(text)
    .map((p, j) => (j % 2 === 1 ? ' X ' : p))
    .join(' ')
  const plain = prose(flat.replace(/\$[^$]+\$/g, ' X ')).replace(/\*\*|\*/g, '').replace(ABBREV, '$1')
  return plain
    .split(/(?<=[.!?])["”’)]*\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
export const wordCount = (sentence: string): number => sentence.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

interface LongSentence {
  where: string
  words: number
  sentence: string
}
function longSentences(items: { where: string; text: string }[], max = 25): LongSentence[] {
  return items.flatMap(({ where, text }) =>
    sentences(text)
      .map((s) => ({ where, words: wordCount(s), sentence: s }))
      .filter((x) => x.words > max),
  )
}

/** The texts held to ≤ 25-word sentences. */
function plainTexts(l: Lecture): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = []
  for (const u of l.units) {
    for (const b of u.story ?? []) {
      out.push({ where: b.id, text: b.text })
      if (b.reveal) out.push({ where: `${b.id} reveal`, text: b.reveal.text })
    }
    out.push({ where: `${u.id}.summary`, text: u.lecture.summary }, { where: `${u.id}.insight`, text: u.insight })
    u.pitfalls?.forEach((p, i) => out.push({ where: `${u.id}.pitfalls[${i}]`, text: p }))
    if (u.review) {
      u.review.points.forEach((p, i) => out.push({ where: `${u.id}.review.points[${i}]`, text: p }))
      out.push({ where: `${u.id}.review.trap`, text: u.review.trap })
    }
  }
  return out
}

/* ---------------------------------------------------------------------------------------------- */
/* Fixtures: the 14 FLAG rows of P2 §5 (old wording, old place)                                    */
/* ---------------------------------------------------------------------------------------------- */

const site = (where: string, text: string, tex?: 'display'): TextSite => (tex ? { where, field: 'fixture', text, tex } : { where, field: 'fixture', text })

interface Fixture {
  row: string
  sites: TextSite[]
  defs?: Record<string, string>
  lint: 'symbols' | 'terms' | 'order'
  expect: string[]
}

const FLAGS: Fixture[] = [
  {
    row: 'σ used in quantized books before it is defined',
    sites: [site('l1-quantized.books[0]', 'Replaces the magnet with an idealized apparatus that only ever displays $\\sigma = \\pm 1$.')],
    lint: 'symbols',
    expect: ['\\sigma'],
  },
  {
    row: 'μ, B, ∇ in F = ∇(μ·B) never defined',
    sites: [site('l1-quantized.books[2]', 'Derives the deflecting force $F = \\nabla(\\mu\\cdot B)$.')],
    lint: 'symbols',
    expect: ['F', '\\nabla', '\\mu', 'B'],
  },
  {
    row: 'θ for the moment angle clashes with θ for the magnet tilt',
    sites: [
      site('l1-quantized.clues[0]', 'On the vertical component of its moment, $\\mu_z = \\mu\\cos\\theta$.'),
      site('l1-average:b1', 'Tilt the magnet by an angle $\\theta$ from $z$ toward $x$.'),
    ],
    defs: { '\\theta': 'l1-average:b1', '\\mu_z': 'l1-quantized.clues[0]', '\\mu': 'l1-quantized.clues[0]' },
    lint: 'symbols',
    expect: ['\\theta'],
  },
  {
    row: '|+z⟩ used in a quantized hint, defined only in the vectors unit',
    sites: [
      site('l1-quantized.play.l1-q-repeat.hints[1]', 'After a + result the atom is in $|{+z}\\rangle$.'),
      site('l1-vectors.lecture', 'Up is the ket $|{+z}\\rangle$.'),
    ],
    defs: { '|\\cdot\\rangle': 'l1-vectors.lecture', '|+z\\rangle': 'l1-vectors.lecture' },
    lint: 'symbols',
    expect: ['|\\cdot\\rangle', '|+z\\rangle'],
  },
  {
    row: '⟨+z|+z⟩ (bra and inner product) in a quantized hint',
    sites: [site('l1-quantized.play.l1-q-repeat.hints[2]', 'What is $|\\langle{+z}|{+z}\\rangle|^2$?')],
    defs: { '|\\cdot\\rangle': 'l1-quantized', '|+z\\rangle': 'l1-quantized' },
    lint: 'symbols',
    expect: ['\\langle\\cdot|\\cdot\\rangle'],
  },
  {
    row: '|⟨+x|+z⟩|² in the sequential walkthrough before the Born rule',
    sites: [site('l1-sequential.play.l1-s-zxz.walkthrough[1]', 'The SG$_x$ passes $|\\langle{+x}|{+z}\\rangle|^2 = \\tfrac12$ of them.')],
    defs: { '|\\cdot\\rangle': 'l1-sequential', '|+z\\rangle': 'l1-sequential', '|+x\\rangle': 'l1-sequential' },
    lint: 'symbols',
    expect: ['\\langle\\cdot|\\cdot\\rangle'],
  },
  {
    row: '|−x⟩ in a logic clue before the vectors unit names it',
    sites: [site('l1-logic.clues[1]', 'The x test must say left, leaving the atom in $|{-x}\\rangle$.')],
    defs: { '|\\cdot\\rangle': 'l1-logic' },
    lint: 'symbols',
    expect: ['|-x\\rangle'],
  },
  {
    row: 'N̂·M̂ clashes with n̂, m̂',
    sites: [site('l1-average.play.l1-a-errata.prompt', '(2) the average deflection is $\\hat N\\cdot\\hat M$.')],
    defs: { '\\hat n': 'l1-average', '\\hat m': 'l1-average' },
    lint: 'symbols',
    expect: ['\\hat N', '\\hat M'],
  },
  {
    row: 'σₙ and ⟨σₙ⟩ never named',
    sites: [site('l1-average.lecture.equations[0]', '\\langle \\sigma_n \\rangle = \\hat n\\cdot\\hat m', 'display')],
    defs: { '\\hat n': 'l1-average', '\\hat m': 'l1-average' },
    lint: 'symbols',
    expect: ['\\langle\\cdot\\rangle', '\\sigma_n'],
  },
  {
    row: 'θ between the axes left implicit',
    sites: [site('l1-average.lecture.equations[0]', '\\hat n\\cdot\\hat m = \\cos\\theta', 'display')],
    defs: { '\\hat n': 'l1-average', '\\hat m': 'l1-average' },
    lint: 'symbols',
    expect: ['\\theta'],
  },
  {
    row: 'average brackets ⟨·⟩ vs bra ⟨a| are separate notations',
    sites: [
      site('l1-quantized.play.l1-q-repeat.hints[2]', '[[inner-product|Overlap]]: $\\langle{+z}|{+z}\\rangle$.'),
      site('l1-average.lecture.equations[0]', '\\langle \\sigma_n \\rangle', 'display'),
    ],
    defs: { '|\\cdot\\rangle': 'l1-quantized', '|+z\\rangle': 'l1-quantized', '\\sigma_n': 'l1-average' },
    lint: 'symbols',
    expect: ['\\langle\\cdot\\rangle'],
  },
  {
    row: 'N in 1/√N clashes with N̂',
    sites: [site('l1-average.books[1]', 'The scatter shrinks like $1/\\sqrt N$.')],
    lint: 'symbols',
    expect: ['N'],
  },
  {
    row: 'Hilbert space used as a forward reference without a gloss',
    sites: [site('l1-average.clues[1]', 'The half angle will turn out to be the angle between state vectors in Hilbert space (Lecture 6).')],
    lint: 'terms',
    expect: ['term:hilbert-space'],
  },
  {
    row: 'sets A, B clash with "order A / order B"',
    sites: [
      site('l1-logic.books[1]', 'Union and intersection are commutative ($A\\cup B = B\\cup A$).'),
      site('l1-logic.clues[0]', 'In order A (z first), what does the z measurement report?'),
    ],
    lint: 'order',
    expect: ['order A/B'],
  },
]

function run(f: Fixture): string[] {
  const probs = f.lint === 'symbols' ? lintSymbols(f.sites, f.defs ?? {}) : f.lint === 'terms' ? lintTerms(f.sites) : lintOrderNames(f.sites)
  return probs.map((p) => p.symbol)
}

/* ---------------------------------------------------------------------------------------------- */
/* Tests                                                                                           */
/* ---------------------------------------------------------------------------------------------- */

describe('symbol lint: the 14 FLAG rows of P2 §5 are caught', () => {
  it('there are exactly 14 fixtures', () => expect(FLAGS.length).toBe(14))
  it.each(FLAGS.map((f) => [f.row, f] as const))('%s', (_, f) => {
    const got = run(f)
    for (const s of f.expect) expect(got, `${f.row}: expected "${s}" among ${JSON.stringify(got)}`).toContain(s)
  })
  it('the sets row also fails symbol-before-use for A and B without the union gloss', () => {
    expect(run({ ...FLAGS[13], lint: 'symbols' })).toEqual(expect.arrayContaining(['A', 'B']))
  })
  it('a gloss tag in the same sentence defines its symbols (the fixed Born-rule sentence passes)', () => {
    const fixed = site('l1-sequential.play.l1-s-zxz.walkthrough[1]', 'By the [[born-rule|Born rule]], it passes $|\\langle{+x}|{+z}\\rangle|^2$.')
    expect(lintSymbols([fixed], { '|\\cdot\\rangle': 'l1-sequential', '|+z\\rangle': 'l1-sequential', '|+x\\rangle': 'l1-sequential' })).toEqual([])
  })
  it('requiredSymbols reads kets, ± kets, bra-kets, averages and subscripts', () => {
    expect(requiredSymbols('|{\\pm x}\\rangle')).toEqual(['|\\cdot\\rangle', '|+x\\rangle', '|-x\\rangle'])
    expect(requiredSymbols('\\langle\\sigma_n\\rangle')).toEqual(['\\langle\\cdot\\rangle', '\\sigma_n'])
    expect(requiredSymbols('1/\\sqrt{N_{\\text{atoms}}}')).toEqual(['N_atoms'])
    expect(requiredSymbols('\\htmlClass{term-p}{P(+)} = \\cos 45^\\circ')).toEqual(['P'])
  })
})

describe.each(LECTURES.map((l) => [l.id, l] as const))('plain-language lints: %s', (_, lecture) => {
  const sites = readingOrder(lecture)

  it('every TeX symbol is defined before its first use', () => {
    expect(lintSymbols(sites, lecture.symbols ?? {})).toEqual([])
  })

  it('Lecture.symbols has no unused entries', () => {
    const used = new Set(sites.flatMap((s) => (s.tex === 'display' ? [s.text] : texSpans(s.text).map((t) => t.tex))).flatMap(requiredSymbols))
    const unused = Object.keys(lecture.symbols ?? {}).filter((k) => !used.has(k))
    expect(unused).toEqual([])
  })

  it('technical terms carry their gloss at first use', () => {
    expect(lintTerms(unitSites(lecture))).toEqual([])
  })

  it('no "order A / order B" (the logic orders are z-first / x-first)', () => {
    expect(lintOrderNames(sites)).toEqual([])
  })

  it('core text, summaries, insights, pitfalls and review cards: sentences ≤ 25 words', () => {
    expect(longSentences(plainTexts(lecture))).toEqual([])
  })

  it('review cards have ≤ 5 points', () => {
    for (const u of lecture.units) if (u.review) expect(u.review.points.length, u.id).toBeLessThanOrEqual(5)
  })
})

describe('mutation checks on the real L1', () => {
  const L = LECTURES.find((l) => l.id === 'L1')!
  const sites = readingOrder(L)
  it('moving a definition later is caught (|+x⟩ defined only in l1-vectors:b3)', () => {
    const defs = { ...(L.symbols ?? {}), '|+x\\rangle': 'l1-vectors:b3' }
    expect(lintSymbols(sites, defs).map((p) => p.symbol)).toContain('|+x\\rangle')
  })
  it('dropping a gloss tag is caught (no [[born-rule]] in the sequential walkthrough)', () => {
    const stripped = sites.map((s) => ({ ...s, text: s.text.replace('[[born-rule|Born rule]]', 'Born rule') }))
    const got = [...lintSymbols(stripped, L.symbols ?? {}), ...lintTerms(stripped.filter((s) => !s.where.startsWith('L1.')))].map((p) => p.symbol)
    expect(got).toEqual(expect.arrayContaining(['\\langle\\cdot|\\cdot\\rangle', 'term:born-rule']))
  })
})

describe('glossary and fidelity notes are plain', () => {
  it('each gloss is one sentence of ≤ 25 words', () => {
    const bad = [...GLOSSARY.values()].flatMap((g) => {
      const ss = sentences(g.gloss)
      return ss.length === 1 && wordCount(ss[0]) <= 25 ? [] : [{ id: g.id, sentences: ss.length, words: ss.map(wordCount) }]
    })
    expect(bad).toEqual([])
  })
  it('fidelity notes: sentences ≤ 25 words', () => {
    const items = [...Object.values(FIDELITY), ...Object.values(FIDELITY_VARIANT)].flatMap((f) => [...f.exact, ...f.schematic, ...f.misleading])
    expect(longSentences(items.map((i) => ({ where: i.id, text: i.text })))).toEqual([])
  })
  it('the sentence splitter keeps decimals and abbreviations whole', () => {
    expect(sentences('At 45° it is 0.854 (pp. 4–5). Next.')).toEqual(['At 45° it is 0.854 (pp 4–5).', 'Next.'])
    expect(sentences('The rule $P(+) = \\cos^2\\tfrac{\\theta}{2}$ holds.').map(wordCount)).toEqual([4])
  })
})
