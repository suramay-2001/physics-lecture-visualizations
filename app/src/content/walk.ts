/**
 * Content walker: every authored string in reading order, plus the rich-string parsers the lints build on
 * (W-L1 §6.1; frozen at `l1-freeze`). Pure: no React, no DOM, no three.js.
 *
 * Rich-string syntax (rendered by ui/Rich.tsx, which uses `inlineTokens` below so the two cannot drift):
 *   $…$ inline TeX · $$…$$ display TeX · **bold** · *italic* · blank line = paragraph · "- " lines = list
 *   [[id]] / [[id|shown text]]  gloss (GLOSSARY id)
 *   {{id|shown text}}           prose term link (Beat.terms id)
 *   \htmlClass{term-id}{…}      TeX term link (trusted renderer only)
 */
import type { Lecture } from './schema'
import { ID_RE } from './stage'

export interface TextSite {
  /** 'l1-average:b2' | 'l1-average.clues[1].ask' | 'L1.corrections[0].says' … */
  where: string
  /** Field name: 'text' | 'caption' | 'reveal.text' | 'summary' | 'equation' | 'adds' | … */
  field: string
  text: string
  /** true when the whole string is display TeX (lecture equations, review equations). */
  tex?: 'display'
}

/**
 * Every authored string in reading order: outcomes → watch → corrections → per unit: story beats
 * (text, caption, reveal) → lecture → books → visual → clues → insight → pitfalls → review → play
 * (prompt, options, hints, walkthrough). Matches P2 §5. Units with a story still list lecture/books/clues:
 * they are authored text even when the story layout hides them.
 */
export function readingOrder(l: Lecture): TextSite[] {
  const out: TextSite[] = []
  const push = (where: string, field: string, text: string | undefined, tex?: 'display') => {
    if (text) out.push(tex ? { where, field, text, tex } : { where, field, text })
  }
  l.outcomes.forEach((o, i) => push(`${l.id}.outcomes[${i}]`, 'outcome', o))
  l.watch?.forEach((r, i) => push(`${l.id}.watch[${i}]`, 'adds', r.adds))
  l.corrections?.forEach((c, i) => {
    push(`${l.id}.corrections[${i}]`, 'says', c.says)
    push(`${l.id}.corrections[${i}]`, 'shouldSay', c.shouldSay)
  })
  for (const u of l.units) {
    push(u.id, 'title', u.title)
    push(u.id, 'question', u.question)
    for (const b of u.story ?? []) {
      push(b.id, 'text', b.text)
      push(b.id, 'caption', b.caption)
      push(b.id, 'reveal.text', b.reveal?.text)
      push(b.id, 'reveal.caption', b.reveal?.caption)
      b.refs?.forEach((r, i) => push(`${b.id}.refs[${i}]`, 'adds', r.adds))
    }
    push(`${u.id}.lecture`, 'summary', u.lecture.summary)
    u.lecture.equations?.forEach((e, i) => push(`${u.id}.lecture.equations[${i}]`, 'equation', e, 'display'))
    u.books.forEach((r, i) => push(`${u.id}.books[${i}]`, 'adds', r.adds))
    push(`${u.id}.visual`, 'caption', u.visual.caption)
    u.visual.tryThis.forEach((t, i) => push(`${u.id}.visual.tryThis[${i}]`, 'tryThis', t))
    u.clues.forEach((c, i) => {
      push(`${u.id}.clues[${i}]`, 'ask', c.ask)
      push(`${u.id}.clues[${i}]`, 'reveal', c.reveal)
    })
    push(u.id, 'insight', u.insight)
    u.pitfalls?.forEach((p, i) => push(`${u.id}.pitfalls[${i}]`, 'pitfall', p))
    if (u.review) {
      u.review.points.forEach((p, i) => push(`${u.id}.review.points[${i}]`, 'point', p))
      push(`${u.id}.review`, 'equations', u.review.equations, 'display')
      push(`${u.id}.review`, 'trap', u.review.trap)
    }
    if (u.beyondLecture) push(`${u.id}.beyondLecture`, 'why', u.beyondLecture.why)
    for (const c of u.play) {
      const w = `${u.id}.play.${c.id}`
      push(w, 'title', c.title)
      push(w, 'prompt', c.prompt)
      if (c.kind === 'choice')
        c.options.forEach((o, i) => {
          push(`${w}.options[${i}]`, 'text', o.text)
          push(`${w}.options[${i}]`, 'why', o.why)
        })
      if (c.kind === 'order') c.steps.forEach((s, i) => push(`${w}.steps[${i}]`, 'step', s))
      if (c.kind === 'numeric') push(w, 'unit', c.unit)
      c.hints.forEach((h, i) => push(`${w}.hints[${i}]`, 'hint', h.text))
      c.walkthrough.forEach((s, i) => push(`${w}.walkthrough[${i}]`, 'step', s.text))
    }
  }
  return out
}

/* ------------------------------------------------------------------------------------------------ */
/* Rich-string tokenizer (shared with ui/Rich.tsx)                                                   */
/* ------------------------------------------------------------------------------------------------ */

export type InlineToken =
  | { t: 'text'; v: string }
  | { t: 'tex'; v: string }
  | { t: 'bold'; v: string }
  | { t: 'italic'; v: string }
  | { t: 'gloss'; id: string; shown: string; valid: boolean }
  | { t: 'term'; id: string; shown: string; valid: boolean }

const INLINE_RE = /\$([^$]+)\$|\*\*([^*]+)\*\*|\*([^*]+)\*|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\{\{([^}|]+)\|([^}]+)\}\}/g

/** Inline tokens of one paragraph / span (no `$$` display blocks inside). Ids failing ID_RE are `valid: false`. */
export function inlineTokens(text: string): InlineToken[] {
  const out: InlineToken[] = []
  let last = 0
  for (const m of text.matchAll(INLINE_RE)) {
    const i = m.index ?? 0
    if (i > last) out.push({ t: 'text', v: text.slice(last, i) })
    if (m[1] !== undefined) out.push({ t: 'tex', v: m[1] })
    else if (m[2] !== undefined) out.push({ t: 'bold', v: m[2] })
    else if (m[3] !== undefined) out.push({ t: 'italic', v: m[3] })
    else if (m[4] !== undefined) {
      const id = m[4].trim()
      out.push({ t: 'gloss', id, shown: m[5] ?? id, valid: ID_RE.test(id) })
    } else {
      const id = m[6].trim()
      out.push({ t: 'term', id, shown: m[7], valid: ID_RE.test(id) })
    }
    last = i + m[0].length
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) })
  return out
}

/** Split into prose and `$$…$$` display parts (odd indices are display TeX), as Rich does per block. */
export function splitDisplay(text: string): string[] {
  return text.split(/\$\$([\s\S]+?)\$\$/g)
}

/** Every TeX span of a rich string (display and inline), in order. */
export function texSpans(text: string): { tex: string; display: boolean }[] {
  const out: { tex: string; display: boolean }[] = []
  splitDisplay(text).forEach((part, j) => {
    if (j % 2 === 1) out.push({ tex: part.trim(), display: true })
    else for (const tok of inlineTokens(part)) if (tok.t === 'tex') out.push({ tex: tok.v, display: false })
  })
  return out
}

/** Prose parts of a rich string (TeX removed), in order; used by the gloss/term scanners. */
function proseTokens(text: string): InlineToken[] {
  return splitDisplay(text)
    .filter((_, j) => j % 2 === 0)
    .flatMap((p) => inlineTokens(p))
}

/** Gloss ids used: `[[id]]` / `[[id|…]]` (also inside **bold** / *italic*). */
export function glossRefs(text: string): string[] {
  const ids: string[] = []
  const walk = (toks: InlineToken[]) => {
    for (const t of toks) {
      if (t.t === 'gloss') ids.push(t.id)
      else if (t.t === 'bold' || t.t === 'italic') walk(inlineTokens(t.v))
    }
  }
  walk(proseTokens(text))
  return ids
}

const HTMLCLASS_RE = /\\htmlClass\{term-([^}]*)\}/g

/** Term ids used: prose `{{id|…}}` and TeX `\htmlClass{term-id}{…}`. */
export function termRefs(text: string): string[] {
  const ids: string[] = []
  const walk = (toks: InlineToken[]) => {
    for (const t of toks) {
      if (t.t === 'term') ids.push(t.id)
      else if (t.t === 'bold' || t.t === 'italic') walk(inlineTokens(t.v))
    }
  }
  walk(proseTokens(text))
  for (const s of texSpans(text)) for (const m of s.tex.matchAll(HTMLCLASS_RE)) ids.push(m[1])
  return ids
}

/* ------------------------------------------------------------------------------------------------ */
/* TeX symbols (seed for P's symbol-before-use lint; heuristic by design)                            */
/* ------------------------------------------------------------------------------------------------ */

/** Control words that are notation, not symbols a reader must have met (layout, operators, functions). */
const NOT_SYMBOLS = new Set(
  (
    'frac tfrac dfrac sqrt left right big Big bigg Bigg cdot cdots ldots dots times div pm mp le leq ge geq ne neq approx ' +
    'equiv sim propto to rightarrow leftarrow Rightarrow Leftrightarrow mapsto in notin subset cup cap mid quad qquad text ' +
    'textbf textit mathrm mathbf mathit mathcal operatorname displaystyle tfrac binom begin end pmatrix bmatrix matrix ' +
    'langle rangle lvert rvert vert lVert rVert Vert cos sin tan exp ln log arg det tr max min lim sum prod int infty ' +
    'uparrow downarrow leftarrow to htmlClass color boxed underbrace overbrace underset overset phantom hline'
  ).split(' '),
)
const ACCENTS = new Set(['vec', 'hat', 'tilde', 'bar', 'dot', 'ddot', 'overline'])

/**
 * Symbols a TeX span introduces, normalized (braces and spaces dropped around simple arguments):
 * control-word symbols with their subscript ('\\hbar', '\\sigma_x', '\\nabla'), accented symbols
 * ('\\vec\\mu', '\\hat n', '\\vec B'), letters with a subscript ('S_z', 'a_0'), kets and bras
 * ('|+z\\rangle', '\\langle a|'), and every other standalone Latin letter ('P', 'n'). `\text{…}` is skipped.
 */
export function texSymbols(tex: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const add = (s: string) => {
    if (!seen.has(s)) {
      seen.add(s)
      out.push(s)
    }
  }
  // kets and bras first (their insides are labels, not symbols)
  const clean = (s: string) => s.replace(/[{}\s]/g, '')
  let rest = tex.replace(/\\text\{[^}]*\}|\\mathrm\{[^}]*\}|\\operatorname\{[^}]*\}/g, ' ')
  rest = rest.replace(/\\langle([^|\\]*(?:\\[a-zA-Z]+[^|\\]*)*)\|([^|]*?)\\rangle/g, (_, a: string, b: string) => {
    add(`\\langle ${clean(a)}|${clean(b)}\\rangle`)
    return ' '
  })
  rest = rest.replace(/\|([^|]*?)\\rangle/g, (_, a: string) => {
    add(`|${clean(a)}\\rangle`)
    return ' '
  })
  rest = rest.replace(/\\langle([^|]*?)\|/g, (_, a: string) => {
    add(`\\langle ${clean(a)}|`)
    return ' '
  })
  // hand tokenizer over what is left
  const src = rest
  let i = 0
  const word = (): string | null => {
    const m = /^\\([a-zA-Z]+)/.exec(src.slice(i))
    if (!m) return null
    i += m[0].length
    return m[1]
  }
  const group = (): string => {
    const close = src.indexOf('}', i)
    const body = src.slice(i + 1, close < 0 ? src.length : close)
    i = close < 0 ? src.length : close + 1
    return clean(body)
  }
  // subscript: _x, _{x}, _\mu
  const readSub = (): string => {
    if (src[i] !== '_') return ''
    i++
    if (src[i] === '{') return `_${group()}`
    if (src[i] === '\\') {
      const w = word()
      return w ? `_\\${w}` : ''
    }
    return src[i] ? `_${src[i++]}` : ''
  }
  // accent argument: \vec\mu, \vec{B}, \hat n
  const readArg = (): string => {
    while (src[i] === ' ') i++
    if (src[i] === '{') return group()
    if (src[i] === '\\') {
      const w = word()
      return w ? `\\${w}` : ''
    }
    return /[A-Za-z]/.test(src[i] ?? '') ? src[i++] : ''
  }
  while (i < src.length) {
    const ch = src[i]
    if (ch === '\\') {
      const cmd = word()
      if (!cmd) {
        i += 2
        continue
      }
      if (ACCENTS.has(cmd)) {
        const arg = readArg()
        const sub = readSub()
        if (arg) add(`\\${cmd}${arg.startsWith('\\') ? '' : ' '}${arg}${sub}`)
        continue
      }
      const sub = readSub()
      if (!NOT_SYMBOLS.has(cmd)) add(`\\${cmd}${sub}`)
      continue
    }
    if (/[A-Za-z]/.test(ch)) {
      i++
      add(ch + readSub())
      continue
    }
    i++
  }
  return out
}
