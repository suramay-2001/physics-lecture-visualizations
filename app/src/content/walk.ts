/**
 * Content walker: every authored string in reading order, plus the rich-string parsers the lints build on
 * (W-L1 §6.1; frozen at `l1-freeze`). Pure: no React, no DOM, no three.js.
 *
 * Rich-string syntax (rendered by ui/Rich.tsx, which uses `inlineTokens` below so the two cannot drift):
 *   $…$ inline TeX · $$…$$ display TeX · **bold** · *italic* · blank line = paragraph · "- " lines = list
 *   [[id]] / [[id|shown text]]  gloss (GLOSSARY id)
 *   {{id|shown text}}           prose term link (Beat.terms id)
 *   <<id|shown text>>           bridge into Spin Lab with a way back (content/qc709/bridges.ts; interface change W-709 #3)
 *   \htmlClass{term-id}{…}      TeX term link (trusted renderer only)
 */
import { ID_RE } from './stage'

/* `readingOrder` lives in ./readingOrder.ts so that the first-paint chunk (Rich.tsx uses the tokenizer below) does not carry the walker only the
 * lints and the notation key use (build/chunks.test.ts rule (l)); the re-export keeps every import from './walk' working. */
export { readingOrder } from './readingOrder'

export interface TextSite {
  /** 'l1-average:b2' | 'l1-average.clues[1].ask' | 'L1.corrections[0].says' … */
  where: string
  /** Field name: 'text' | 'caption' | 'reveal.text' | 'summary' | 'equation' | 'adds' | … */
  field: string
  text: string
  /** true when the whole string is display TeX (lecture equations, review equations). */
  tex?: 'display'
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
  | { t: 'bridge'; id: string; shown: string; valid: boolean }

/**
 * Interface change W-709 #3 (2026-09-28, W-709-platform §C): `<<id|shown text>>` is a bridge (content/qc709/bridges.ts)
 * into Spin Lab with a way back (components/BridgeLink.tsx). Its shown text is plain (no nested markup), and it is a
 * reference, not prose: the claims reader skips it, the gloss and term scanners do not look inside it.
 */
const INLINE_RE = /\$([^$]+)\$|\*\*([^*]+)\*\*|\*([^*]+)\*|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\{\{([^}|]+)\|([^}]+)\}\}|<<([^>|]+)\|([^>]+)>>/g

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
    } else if (m[6] !== undefined) {
      const id = m[6].trim()
      out.push({ t: 'term', id, shown: m[7], valid: ID_RE.test(id) })
    } else {
      const id = m[8].trim()
      out.push({ t: 'bridge', id, shown: m[9], valid: ID_RE.test(id) })
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

/** Bridge ids used: `<<id|…>>` (also inside **bold** / *italic*), in order, repeats kept. */
export function bridgeRefs(text: string): string[] {
  const ids: string[] = []
  const walk = (toks: InlineToken[]) => {
    for (const t of toks) {
      if (t.t === 'bridge') ids.push(t.id)
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

const LANGLE = '\\langle'
const RANGLE = '\\rangle'
const isLetter = (c: string | undefined) => !!c && ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'))
/** t[i] = the first index ≥ i where `at(i)` holds (s.length if none). One backward pass: O(n). */
function nextIndex(s: string, at: (i: number) => boolean): Int32Array {
  const t = new Int32Array(s.length + 1)
  t[s.length] = s.length
  for (let i = s.length - 1; i >= 0; i--) t[i] = at(i) ? i : t[i + 1]
  return t
}

/**
 * Brakets `\langle A|B\rangle` → ' ' (calling `found(A, B)`), in linear time. Same matches as the former
 * regex `\\langle([^|\\]*(?:\\[a-zA-Z]+[^|\\]*)*)\|([^|]*?)\\rangle` (A: no bar, backslashes only as
 * control words; B: no bar, up to the first \rangle), whose nested quantifiers backtracked exponentially
 * on an average with no bar (interface change #1, 2026-09-25).
 */
function takeBrakets(s: string, found: (a: string, b: string) => void): string {
  const n = s.length
  const bar = nextIndex(s, (i) => s[i] === '|')
  const badSlash = nextIndex(s, (i) => s[i] === '\\' && !isLetter(s[i + 1]))
  const rangle = nextIndex(s, (i) => s.startsWith(RANGLE, i))
  let out = ''
  let last = 0
  let p = s.indexOf(LANGLE)
  while (p >= 0) {
    const a0 = p + LANGLE.length
    const j = bar[a0]
    if (j < n && badSlash[a0] >= j) {
      const k = rangle[j + 1]
      if (k < n && bar[j + 1] >= k) {
        found(s.slice(a0, j), s.slice(j + 1, k))
        out += s.slice(last, p) + ' '
        last = k + RANGLE.length
        p = s.indexOf(LANGLE, last)
        continue
      }
    }
    p = s.indexOf(LANGLE, p + 1)
  }
  return out + s.slice(last)
}

/** Bras `\langle A|` → ' ' (A: anything but a bar, up to the first bar), in linear time. */
function takeBras(s: string, found: (a: string) => void): string {
  const bar = nextIndex(s, (i) => s[i] === '|')
  let out = ''
  let last = 0
  let p = s.indexOf(LANGLE)
  while (p >= 0) {
    const j = bar[p + LANGLE.length]
    if (j >= s.length) break // no bar after this \langle, so none after any later one either
    found(s.slice(p + LANGLE.length, j))
    out += s.slice(last, p) + ' '
    last = j + 1
    p = s.indexOf(LANGLE, last)
  }
  return out + s.slice(last)
}

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
  rest = takeBrakets(rest, (a, b) => add(`\\langle ${clean(a)}|${clean(b)}\\rangle`))
  rest = rest.replace(/\|([^|]*?)\\rangle/g, (_, a: string) => {
    add(`|${clean(a)}\\rangle`)
    return ' '
  })
  rest = takeBras(rest, (a) => add(`\\langle ${clean(a)}|`))
  // hand tokenizer over what is left
  const src = rest
  let i = 0
  const WORD = /\\([a-zA-Z]+)/y
  const word = (): string | null => {
    WORD.lastIndex = i
    const m = WORD.exec(src)
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
