/**
 * The TeX pre-processor of the notation explainers (decisions/notation-explainers.md): it wraps known notation in
 * KaTeX `\htmlData{notation=<id>,…}{…}` BEFORE the render, so the rendered maths carries `data-notation` marks the one
 * delegated listener (components/NotationHost.tsx) turns into cards. Pure and lossless: the source is split into
 * tokens, a mark wraps a self-contained, balanced run of them, and the output is the input with wrappers added.
 *
 * Why wrapping cannot change the typesetting: a KaTeX `\htmlData` group is an `.enclosing` span, which the spacing and
 * binary-operator logic looks THROUGH (katex 0.18 `checkPartialGroup`), so `a \htmlData{…}{\otimes} b` spaces exactly
 * like `a \otimes b` (ui/notationMark.test.ts renders every TeX span of both courses both ways and compares).
 *
 * What it never does:
 *  - nothing inside `\text{…}`, `\mathrm{…}`, `\operatorname{…}`, `\mathbf{…}` and the other text-like commands is
 *    marked (the few named operators `\mathrm{Tr}`, `\operatorname{diag}` … are marked as a whole);
 *  - a mark is never placed between a command and its unbraced argument (`\hat\sigma`, `\frac12`, `\left|`); a mark in
 *    an unbraced script gets braces: `^\dagger` becomes `^{\htmlData{…}{\dagger}}`;
 *  - on unbalanced braces or `\begin`/`\end` it returns the source untouched.
 * Context capture: a sum or product records its limits and summand, a bra-ket its pieces, a matrix its shape, …, as
 * encoded data values (ui/notationCodec.ts), so a card can say "add the next part once for every i from 1 to n".
 * Loaded lazily by `useNotationMarker` (ui/notationPref.ts); nothing here joins the entry chunk.
 */
import { encodePart, NOTATION_KEYS, type NotationCtx } from './notationCodec'

export interface NotationOpts {
  /** Physics 709: bare X, Y, Z, H, I in a formula that is plainly about gates are the gates (see `gateLetters`). */
  gates?: boolean
}

interface Tok {
  s: string
  /** w control word · c control symbol · o `{` · x `}` · s space · p anything else (one character) */
  k: 'w' | 'c' | 'o' | 'x' | 's' | 'p'
}
interface Mark {
  id: string
  end: number
  inner: string
  ctx?: NotationCtx
}

const TOKEN = /\\[A-Za-z]+|\\[\s\S]|\s+|[\s\S]/g

function lex(src: string): Tok[] {
  const out: Tok[] = []
  for (const m of src.matchAll(TOKEN)) {
    const s = m[0]
    out.push({ s, k: s[0] === '\\' ? (/[A-Za-z]/.test(s[1] ?? '') ? 'w' : 'c') : s === '{' ? 'o' : s === '}' ? 'x' : /^\s/.test(s) ? 's' : 'p' })
  }
  return out
}

const set = (words: string) => new Set(words.split(' '))
/** Commands whose braced argument is text, a name or a length: nothing inside is marked (a later group is maths again). */
const VERBATIM = set(
  'text textbf textit textrm textsf texttt mbox hbox mathrm mathbf mathsf mathit mathbb mathcal mathscr mathfrak boldsymbol bm operatorname phantom hphantom vphantom tag label hspace vspace kern mkern mskip rule color textcolor htmlClass htmlId htmlStyle htmlData href url includegraphics',
)
/** Commands that take arguments written with or without braces: an unbraced argument is copied as written. */
const ARGS: Record<string, number> = { hat: 1, vec: 1, bar: 1, tilde: 1, dot: 1, ddot: 1, check: 1, breve: 1, acute: 1, grave: 1, widehat: 1, widetilde: 1, overline: 1, underline: 1, overrightarrow: 1, sqrt: 1, frac: 2, tfrac: 2, dfrac: 2, binom: 2, tbinom: 2, dbinom: 2, mathbin: 1, mathrel: 1, mathop: 1, mathord: 1, xrightarrow: 1, underbrace: 1, overbrace: 1, cancel: 1, boxed: 1 }
/** Size and pairing commands: the delimiter that follows is copied as written. */
const DELIM = /^\\(?:left|right|middle|[bB]ig+[lrm]?)$/
/** Things inside a candidate bra, ket, absolute value, norm or bracket that mean it is not one. */
const STOP = set('& = ; \\\\ \\left \\right \\middle \\over \\atop \\choose \\quad \\qquad \\Rightarrow \\Leftrightarrow \\approx \\equiv \\neq \\ne \\le \\leq \\ge \\geq \\to \\rightarrow \\mapsto \\propto \\iff \\in \\cong \\sim')
/** The summand of a sum or product ends at one of these (outside any bracket). */
const SUM_END = set('+ - = , ; & \\\\ \\pm \\mp \\quad \\qquad \\approx \\equiv \\neq \\ne \\le \\leq \\ge \\geq \\to \\rightarrow \\Rightarrow \\mapsto \\propto \\cong \\in \\sim \\Leftrightarrow \\iff')
const MATRIX = set('pmatrix bmatrix matrix Bmatrix smallmatrix')
const MAX_SPAN = 48 // tokens a bra, ket, absolute value, norm or bracket may cover
const MAX_RAW = 64 // characters of captured TeX kept per data value
const GATE = set('X Y Z H I')
const BAR_STOPS = new Set([...STOP, '|', '\\vert', '\\langle'])
const BRA_STOPS = new Set([...STOP, '\\langle'])

/** `\htmlClass{term-x}` dropped from captured TeX (the card renders it with no term links), spaces squeezed. */
const plain = (s: string) => s.replace(/\\htmlClass\{[^}]*\}/g, '').replace(/\s+/g, ' ').trim()

/**
 * Marks that are one relation or binary-operator symbol. KaTeX allows a line break after a TOP-LEVEL relation or binary
 * operator (it looks at the node's own class), and a `\htmlData` wrapper hides the symbol's class. `\mathrel{…}` and
 * `\mathbin{…}` put the class back on the outside, so an inline formula wraps where it always did (and the spacing and
 * the "binary operator at the start is an ordinary symbol" rule see the same class).
 */
const REL = set('element approx proportional congruent arrow mapsto implies iff')
const BIN = set('plusminus cdot tensor xor')

const wrap = (m: Mark): string => {
  let keys = ''
  for (const k of NOTATION_KEYS) {
    const v = m.ctx?.[k]
    if (v) keys += `,${k}=${encodePart(v)}`
  }
  const mark = `\\htmlData{notation=${m.id}${keys}}{${m.inner}}`
  return REL.has(m.id) ? `\\mathrel{${mark}}` : BIN.has(m.id) ? `\\mathbin{${mark}}` : mark
}

/** TeX with every known piece of notation wrapped in `\htmlData{notation=…}`; the source itself when there is none. */
export function markNotation(src: string, opts: NotationOpts = {}): string {
  const t = lex(src)
  // balanced `{}` and `\begin…\end`, else leave the source alone
  const mate: number[] = new Array<number>(t.length).fill(-1)
  const envEnd = new Map<number, number>() // \begin index → index just past its `\end{…}`
  const envClose = new Map<number, number>() // \begin index → index of its `\end`
  const stack: number[] = []
  for (let i = 0; i < t.length; i++) {
    const tk = t[i]
    if (tk.k === 'o' || tk.s === '\\begin') stack.push(i)
    else if (tk.k === 'x') {
      const j = stack.pop()
      if (j === undefined || t[j].k !== 'o') return src
      mate[j] = i
      mate[i] = j
    } else if (tk.s === '\\end') {
      const j = stack.pop()
      if (j === undefined || t[j].s !== '\\begin') return src
      envClose.set(j, i)
    }
  }
  if (stack.length) return src
  // each \end{name} closes the \begin{name} with the same name
  const nameAt = (k: number) => {
    const g = t.findIndex((x, n) => n > k && x.k !== 's')
    return g >= 0 && t[g].k === 'o' ? t.slice(g + 1, mate[g]).map((x) => x.s).join('') : ''
  }
  for (const [b, e] of envClose) if (nameAt(b) !== nameAt(e)) return src
  for (const [b, e] of envClose) {
    let n = e + 1
    while (n < t.length && t[n].k === 's') n++
    envEnd.set(b, n < t.length && t[n].k === 'o' ? mate[n] + 1 : e + 1)
  }

  let marked = 0
  const raw = (a: number, b: number) => {
    let s = ''
    for (let i = a; i < b; i++) s += t[i].s
    return s
  }
  const nx = (i: number, hi: number) => {
    while (i < hi && t[i].k === 's') i++
    return i
  }
  const prevTok = (i: number) => {
    let j = i - 1
    while (j >= 0 && t[j].k === 's') j--
    return t[j] as Tok | undefined
  }
  const nextTok = (i: number) => {
    let j = i + 1
    while (j < t.length && t[j].k === 's') j++
    return t[j] as Tok | undefined
  }
  /** Index just past the argument that starts at `a` (a group, or one token). */
  const argEnd = (a: number) => (t[a].k === 'o' ? mate[a] + 1 : a + 1)
  /** The argument's own text, braces removed. */
  const argRaw = (a: number) => (t[a].k === 'o' ? raw(a + 1, mate[a]) : t[a].s)
  const cap = (s: string | undefined): string | undefined => {
    const p = s === undefined ? '' : plain(s)
    return p && p.length <= MAX_RAW ? p : undefined
  }
  /** The next token at this level: a group or an environment counts as one. */
  const step = (j: number) => (t[j].k === 'o' ? mate[j] + 1 : t[j].s === '\\begin' ? (envEnd.get(j) ?? j + 1) : j + 1)

  /** First token in [from, hi) at this level with `at(tok)`; -1 on a stop token, after MAX_SPAN tokens, or if none. */
  function seek(from: number, hi: number, at: (tk: Tok) => boolean, stops: ReadonlySet<string> = STOP): number {
    let n = 0
    for (let j = from; j < hi; j = step(j)) {
      if (++n > MAX_SPAN) return -1
      if (at(t[j])) return j
      if (stops.has(t[j].s)) return -1
    }
    return -1
  }
  /** Is there a token `s` at this level in [from, hi)? */
  const hasTop = (from: number, hi: number, s: string) => seek(from, hi, (tk) => tk.s === s, new Set()) >= 0
  const isBar = (tk: Tok) => tk.s === '|' || tk.s === '\\vert'
  const isRangle = (tk: Tok) => tk.s === '\\rangle'
  const isBarOrRangle = (tk: Tok) => isBar(tk) || isRangle(tk)

  /** One script argument (`_x`, `^{…}`): the text to emit, scanned for marks, braced when a mark sits in an unbraced one. */
  function scriptArg(a: number, sup: boolean): { text: string; end: number } {
    if (t[a].k === 'o') return { text: `{${scan(a + 1, mate[a], sup)}}`, end: mate[a] + 1 }
    const inner = scan(a, a + 1, sup, true)
    return { text: inner === t[a].s ? inner : `{${inner}}`, end: a + 1 }
  }

  /** A base (already emitted as `inner` up to `from`) with its scripts `_{lo}^{hi}` scanned; the raw lo and hi. */
  function withScripts(from: number, hi: number, inner: string): { end: number; inner: string; lo?: string; up?: string } {
    let j = from
    let lo: string | undefined
    let up: string | undefined
    for (;;) {
      const p = nx(j, hi)
      if (p >= hi) break
      const s = t[p].s
      if (s === '\\limits' || s === '\\nolimits') {
        inner += raw(j, p + 1)
        j = p + 1
        continue
      }
      if (s !== '_' && s !== '^') break
      const a = nx(p + 1, hi)
      if (a >= hi) break
      const arg = scriptArg(a, s === '^')
      if (s === '_') lo = argRaw(a)
      else up = argRaw(a)
      inner += raw(j, p) + s + raw(p + 1, a) + arg.text
      j = arg.end
    }
    return { end: j, inner, lo, up }
  }

  /** The scripts (and primes) that follow a mark at `from`: they stay inside it, so they keep the atom they belong to. */
  function absorb(from: number, hi: number): { end: number; text: string } {
    let j = from
    let text = ''
    for (;;) {
      const p = nx(j, hi)
      if (p >= hi) break
      if (t[p].s === "'") {
        text += raw(j, p + 1)
        j = p + 1
        continue
      }
      if (t[p].s !== '_' && t[p].s !== '^') break
      const a = nx(p + 1, hi)
      if (a >= hi) break
      const arg = scriptArg(a, t[p].s === '^')
      text += raw(j, p) + t[p].s + raw(p + 1, a) + arg.text
      j = arg.end
    }
    return { end: j, text }
  }

  /** What an operator word applies to: `(A)`, `\left(A\right)`, `{A}` or one symbol after it. */
  function operand(e: number, hi: number): string | undefined {
    let o = nx(e, hi)
    if (o < hi && DELIM.test(t[o].s)) o = nx(o + 1, hi)
    if (o >= hi) return undefined
    const open = t[o].s
    if (open === '(' || open === '[') {
      const close = open === '(' ? ')' : ']'
      let d = 0
      for (let j = o; j < hi && j - o <= MAX_SPAN; j++) {
        if (t[j].s === open) d++
        else if (t[j].s === close && --d === 0) return cap(raw(o + 1, j).replace(/\\(?:left|right|[bB]ig+[lr]?)\s*$/, ''))
      }
      return undefined
    }
    if (t[o].k === 'o') return cap(raw(o + 1, mate[o]))
    if (t[o].k === 'p' && /[A-Za-z0-9]/.test(open)) return open
    if (t[o].k === 'w' && !/^\\(?:left|right|big|Big|cdot|times|quad|qquad|langle|otimes)$/.test(open)) return open
    return undefined
  }

  /** The summand of a sum or product that ends at `e`: up to the next `+`, `-`, `=`, relation or closing bracket. */
  function summand(e: number, hi: number): string | undefined {
    let d = 0
    const from = nx(e, hi)
    let j = from
    for (let n = 0; j < hi; n++) {
      if (n > 40) return undefined
      const s = t[j].s
      if (d === 0 && SUM_END.has(s)) break
      if (DELIM.test(s)) {
        // \big( … \big): a size command belongs to the bracket after it
        const nb = nx(j + 1, hi)
        const b = nb < hi ? t[nb].s : ''
        if (b === ')' || b === ']') {
          if (--d < 0) break
          j = nb + 1
          continue
        }
        if (b === '(' || b === '[') {
          d++
          j = nb + 1
          continue
        }
        if (s === '\\right' && d === 0) break
      }
      if (s === '(' || s === '[') d++
      else if (s === ')' || s === ']') {
        if (--d < 0) break
      }
      j = step(j)
    }
    return j > from ? cap(raw(from, j)) : undefined
  }

  // ---- bras and kets ---------------------------------------------------------------------------------------------

  /** `\langle …` : an average ⟨A⟩, a bra ⟨a|, an overlap ⟨a|b⟩ or a matrix element ⟨a|M|b⟩. */
  function langle(i: number, hi: number): Mark | null {
    const b1 = seek(i + 1, hi, isBarOrRangle, BRA_STOPS)
    if (b1 < 0) return null
    if (isRangle(t[b1])) {
      if (b1 === i + 1 || hasTop(i + 1, b1, ',')) return null
      return { id: 'average', end: b1 + 1, inner: `\\langle${scan(i + 1, b1)}\\rangle`, ctx: { of: cap(raw(i + 1, b1)) } }
    }
    const a = cap(raw(i + 1, b1))
    const bra: Mark = { id: 'bra', end: b1 + 1, inner: `\\langle${scan(i + 1, b1)}${t[b1].s}`, ctx: { a } }
    const r = seek(b1 + 1, hi, isBarOrRangle, BRA_STOPS)
    if (r < 0) return bra
    if (isRangle(t[r])) return { id: 'braket', end: r + 1, inner: `\\langle${scan(i + 1, b1)}${t[b1].s}${scan(b1 + 1, r)}\\rangle`, ctx: { a, b: cap(raw(b1 + 1, r)) } }
    // a second bar: ⟨a|M|b⟩ when M looks like an operator and the \rangle follows
    const r2 = seek(r + 1, hi, isRangle, BRA_STOPS)
    const mid = raw(b1 + 1, r)
    if (r2 >= 0 && mid.trim() && !hasTop(b1 + 1, r, ',') && !hasTop(b1 + 1, r, '+') && !hasTop(b1 + 1, r, '(') && !hasTop(b1 + 1, r, '[')) {
      return {
        id: 'sandwich',
        end: r2 + 1,
        inner: `\\langle${scan(i + 1, b1)}${t[b1].s}${scan(b1 + 1, r)}${t[r].s}${scan(r + 1, r2)}\\rangle`,
        ctx: { a, m: cap(mid), b: cap(raw(r + 1, r2)) },
      }
    }
    return bra
  }

  /** `| …` : a ket |a⟩, an outer product |a⟩⟨b|, or an absolute value |z|. */
  function bar(i: number, hi: number): Mark | null {
    const r = seek(i + 1, hi, isRangle, BAR_STOPS)
    if (r > i + 1) {
      const ket = `|${scan(i + 1, r)}\\rangle`
      const l = nx(r + 1, hi)
      if (l < hi && t[l].s === '\\langle') {
        const b = seek(l + 1, hi, isBar, BAR_STOPS)
        // ⟨b| and not ⟨b|c⟩: no \rangle before the next bar or bra
        if (b > l + 1 && seek(b + 1, hi, isRangle, BAR_STOPS) < 0) {
          return { id: 'outer', end: b + 1, inner: `${ket}${raw(r + 1, l)}\\langle${scan(l + 1, b)}${t[b].s}`, ctx: { a: cap(raw(i + 1, r)), b: cap(raw(l + 1, b)) } }
        }
      }
      return { id: 'ket', end: r + 1, inner: ket, ctx: { a: cap(raw(i + 1, r)) } }
    }
    // an absolute value |…| (a bra-ket inside is allowed; nothing relational)
    let n = 0
    for (let j = i + 1; j < hi; ) {
      if (++n > MAX_SPAN) return null
      const tk = t[j]
      if (tk.s === '|') return j === i + 1 ? null : { id: 'abs', end: j + 1, inner: `|${scan(i + 1, j)}|`, ctx: { of: cap(raw(i + 1, j)) } }
      if (tk.s === '\\langle') {
        const e = seek(j + 1, hi, isRangle, BRA_STOPS)
        if (e < 0) return null
        j = e + 1
        continue
      }
      if (STOP.has(tk.s) || tk.s === ',' || isRangle(tk) || tk.s === '\\vert') return null
      j = step(j)
    }
    return null
  }

  /** `\| … \|`, `\lVert … \rVert`, `\lvert … \rvert`. */
  function pair(i: number, hi: number, id: 'norm' | 'abs', close: string): Mark | null {
    const j = seek(i + 1, hi, (tk) => tk.s === close, new Set([...STOP, ';']))
    if (j <= i + 1) return null
    return { id, end: j + 1, inner: `${t[i].s}${scan(i + 1, j)}${close}`, ctx: { of: cap(raw(i + 1, j)) } }
  }

  /** `[A, B]` with operator-looking A and B. */
  function bracket(i: number, hi: number): Mark | null {
    const close = seek(i + 1, hi, (tk) => tk.s === ']', new Set([...STOP, '[', '\\langle']))
    if (close < 0) return null
    const comma = seek(i + 1, close, (tk) => tk.s === ',', new Set())
    if (comma < 0 || hasTop(comma + 1, close, ',')) return null
    const a = plain(raw(i + 1, comma))
    const b = plain(raw(comma + 1, close))
    const OP = /^(?:\\hat\s*\{?\\?[A-Za-z]+\}?(?:_\{?\w+\}?)?|\\sigma(?:_\{?[A-Za-z0-9]+\}?)?|[A-Z](?:_\{?\w+\}?)?(?:\^\{?\w+\}?)?|\\mathrm\{[A-Za-z]+\}|\\vec\s*\\?\{?\\?\w+\}?)$/
    if (!OP.test(a) || !OP.test(b)) return null
    return { id: 'commutator', end: close + 1, inner: `[${scan(i + 1, comma)},${scan(comma + 1, close)}]`, ctx: { a: cap(a), b: cap(b) } }
  }

  // ---- accents, Pauli matrices, named operators, the rest ----------------------------------------------------------

  /** A Pauli subscript at `e` (right after `\sigma`): the axis and the index past it. */
  function axisAfter(e: number, hi: number): { axis: 'x' | 'y' | 'z'; end: number } | null {
    const u = nx(e, hi)
    if (u >= hi || t[u].s !== '_') return null
    const a = nx(u + 1, hi)
    if (a >= hi) return null
    const letter = argRaw(a).trim()
    return letter === 'x' || letter === 'y' || letter === 'z' ? { axis: letter, end: argEnd(a) } : null
  }

  /** `\hat n`, `\vec{r}`, `\vec\sigma` : accent, argument and where they end. */
  function accent(i: number, hi: number): { head: string; arg: string; a: number; end: number } | null {
    const head = t[i].s
    if (head !== '\\hat' && head !== '\\vec') return null
    const a = nx(i + 1, hi)
    return a < hi ? { head, arg: argRaw(a).trim(), a, end: argEnd(a) } : null
  }

  function accentMark(i: number, hi: number): Mark | null {
    const ac = accent(i, hi)
    if (!ac) return null
    // \hat\sigma_z : a Pauli matrix
    if (ac.head === '\\hat' && ac.arg === '\\sigma') {
      const ax = axisAfter(ac.end, hi)
      if (ax) return { id: `pauli-${ax.axis}`, end: ax.end, inner: raw(i, ax.end) }
    }
    // r⃗·σ⃗ and n̂·σ⃗ : the Bloch-vector notation
    const dotAt = nx(ac.end, hi)
    if (dotAt < hi && t[dotAt].s === '\\cdot') {
      const o = nx(dotAt + 1, hi)
      const other = o < hi ? accent(o, hi) : null
      if (other && (other.arg === '\\sigma') !== (ac.arg === '\\sigma')) {
        const vecRaw = ac.arg === '\\sigma' ? raw(o, other.end) : raw(i, ac.end)
        return { id: 'sigma-dot', end: other.end, inner: raw(i, other.end), ctx: { a: cap(vecRaw) } }
      }
    }
    if (ac.arg === '\\sigma') return { id: 'sigma-vec', end: ac.end, inner: raw(i, ac.end) }
    const arg = t[ac.a].k === 'o' ? `{${scan(ac.a + 1, mate[ac.a])}}` : t[ac.a].s
    return { id: ac.head === '\\hat' ? 'hat' : 'vec', end: ac.end, inner: `${t[i].s}${raw(i + 1, ac.a)}${arg}`, ctx: { of: cap(ac.arg) } }
  }

  /** `\mathrm{Tr}`, `\operatorname{diag}`, `\mathbb{C}`, `\text{ℂ}` : a named operator or number set. */
  function named(i: number, hi: number): Mark | null {
    const a = nx(i + 1, hi)
    if (a >= hi || t[a].k !== 'o') return null
    const word = raw(a + 1, mate[a]).trim()
    const head = t[i].s
    const end = mate[a] + 1
    const op = (id: string, applies = true): Mark => ({ id, end, inner: raw(i, end), ctx: applies ? { of: operand(end, hi) } : undefined })
    if (head === '\\mathrm' || head === '\\operatorname') {
      switch (word) {
        case 'Tr': case 'tr': return op('trace')
        case 'det': return op('det')
        case 'Re': return op('re')
        case 'Im': return op('im')
        case 'diag': return op('diag')
        case 'rank': return op('rank')
        case 'span': return op('span')
        case 'gcd': return op('gcd')
        case 'mod': return op('mod', false)
        case 'CNOT': return op('cnot', false)
        case 'CZ': return op('cz', false)
        case 'SWAP': return op('swap', false)
        default: return null
      }
    }
    if ((head === '\\mathbb' && (word === 'C' || word === 'R')) || (head === '\\text' && (word === 'ℂ' || word === 'ℝ'))) {
      const w = withScripts(end, hi, raw(i, end)) // with its exponent: ℂ^{2^n}
      return { id: word === 'C' || word === 'ℂ' ? 'complex-n' : 'real-n', end: w.end, inner: w.inner, ctx: { of: cap(w.up) } }
    }
    if (head === '\\mathbb' && (word === '1' || word === 'I')) return { id: 'identity', end, inner: raw(i, end) }
    return null
  }

  /** `e^{i…}` : a phase factor. */
  function phase(i: number, hi: number): Mark | null {
    const u = nx(i + 1, hi)
    if (u >= hi || t[u].s !== '^') return null
    const a = nx(u + 1, hi)
    if (a >= hi) return null
    const exp = argRaw(a).trim()
    if (!/^[-+]?\s*i(?![A-Za-z])/.test(exp)) return null
    const arg = scriptArg(a, true)
    return { id: 'phase', end: arg.end, inner: `e${raw(i + 1, u)}^${raw(u + 1, a)}${arg.text}`, ctx: { of: cap(exp) } }
  }

  /** `\frac{d}{dt}`, `\frac{\partial}{\partial t}`, `d/dt`. */
  function derivative(i: number, hi: number): Mark | null {
    if (t[i].k === 'w') {
      const a = nx(i + 1, hi)
      if (a >= hi || t[a].k !== 'o') return null
      const b = nx(mate[a] + 1, hi)
      if (b >= hi || t[b].k !== 'o') return null
      const top = raw(a + 1, mate[a]).trim()
      const bottom = raw(b + 1, mate[b]).trim()
      const D = String.raw`(?:d|\\partial|\\mathrm\{d\})`
      if (!new RegExp(`^${D}(?:\\^\\d)?$`).test(top)) return null
      const v = new RegExp(`^${D}\\s*_?\\{?\\s*([A-Za-z]|\\\\[A-Za-z]+)\\s*\\}?(?:\\^\\d)?$`).exec(bottom)
      if (!v) return null
      return { id: top.includes('partial') ? 'partial' : 'derivative', end: mate[b] + 1, inner: raw(i, mate[b] + 1), ctx: { of: v[1] } }
    }
    // d/dt as typed
    const s = nx(i + 1, hi)
    const d2 = s < hi && t[s].s === '/' ? nx(s + 1, hi) : hi
    const prev = t[i - 1]
    if (d2 < hi && t[d2].s === 'd' && d2 + 1 < hi && /^[A-Za-z]$/.test(t[d2 + 1].s) && !(prev && /^[A-Za-z]$/.test(prev.s))) {
      return { id: 'derivative', end: d2 + 2, inner: raw(i, d2 + 2), ctx: { of: t[d2 + 1].s } }
    }
    return null
  }

  /** `\sqrt{…}` with its optional index. */
  function sqrt(i: number, hi: number): Mark | null {
    let j = nx(i + 1, hi)
    if (j < hi && t[j].s === '[') {
      const c = seek(j + 1, hi, (tk) => tk.s === ']', new Set())
      if (c < 0) return null
      j = nx(c + 1, hi)
    }
    if (j >= hi) return null
    const arg = t[j].k === 'o' ? `{${scan(j + 1, mate[j])}}` : t[j].s
    return { id: 'sqrt', end: argEnd(j), inner: `${raw(i, j)}${arg}`, ctx: { of: cap(argRaw(j)) } }
  }

  /** `\delta_{ij}` : a Kronecker delta has two indices. */
  function kronecker(i: number, hi: number): Mark | null {
    const u = nx(i + 1, hi)
    if (u >= hi || t[u].s !== '_') return null
    const a = nx(u + 1, hi)
    if (a >= hi) return null
    const sub = argRaw(a).replace(/\s+/g, '')
    const idx = sub.match(/[A-Za-z](?:_\{?\d+\}?)?'*/g)
    const strip = (s: string) => s.replace(/[{},]/g, '')
    if (!idx || idx.length !== 2 || strip(idx.join('')) !== strip(sub)) return null
    return { id: 'kronecker', end: argEnd(a), inner: raw(i, argEnd(a)), ctx: { a: cap(idx[0]), b: cap(idx[1]) } }
  }

  /**
   * Bare X, Y, Z, H, I in Physics 709 (`opts.gates`). A letter alone proves nothing (X is also a random variable), so
   * the letters are marked only in a formula where at least one of them stands in a plainly gate-like place: next to a
   * ket, a tensor product, a dot or another gate letter, as a power X², H^{⊗n}, X†, or as `X = ` a matrix. In such a
   * formula every standalone gate letter that is not subscripted and does not follow \Delta is marked.
   */
  const isGate = (tk: Tok | undefined) => !!tk && tk.k === 'p' && GATE.has(tk.s)
  let gateLetters = false
  if (opts.gates) {
    for (let i = 0; i < t.length && !gateLetters; i++) {
      if (!isGate(t[i])) continue
      const before = prevTok(i)
      const after = nextTok(i)
      if (!after) {
        gateLetters = !!before && (before.s === '\\otimes' || before.s === '\\cdot' || isGate(before))
        continue
      }
      let hit = after.s === '|' || after.s === '\\otimes' || after.s === '\\cdot' || isGate(after) || (!!before && (before.s === '\\otimes' || before.s === '\\cdot' || isGate(before)))
      if (!hit && after.s === '^') {
        let j = i + 1
        while (t[j].s !== '^') j++
        const e = nx(j + 1, t.length)
        const first = e < t.length && t[e].k === 'o' ? t[nx(e + 1, t.length)]?.s : t[e]?.s
        hit = first === '2' || first === '\\dagger' || first === '\\otimes'
      }
      if (!hit && after.s === '=') {
        let j = i + 1
        while (t[j].s !== '=') j++
        hit = t[nx(j + 1, t.length)]?.s === '\\begin'
      }
      gateLetters = hit
    }
  }
  function gate(i: number): Mark | null {
    if (!gateLetters || !isGate(t[i])) return null
    const before = prevTok(i)
    const after = t[i + 1]
    if (before && /^\\(?:Delta|delta)$/.test(before.s)) return null
    if (after && (after.s === '_' || after.s === "'")) return null
    const id = t[i].s === 'I' ? 'identity' : t[i].s === 'H' ? 'hadamard' : `pauli-${t[i].s.toLowerCase()}`
    return { id, end: i + 1, inner: t[i].s, ctx: { m: 'gate' } }
  }

  // ---- the recogniser ----------------------------------------------------------------------------------------------

  /** The mark that starts at token `i` of [lo, hi), if any. `sup`: the range is (inside) a superscript. */
  function recognise(i: number, lo: number, hi: number, sup: boolean, arg: boolean): Mark | null {
    const tk = t[i]
    const simple = (id: string): Mark => ({ id, end: i + 1, inner: tk.s })
    if (tk.k === 'p') {
      switch (tk.s) {
        case '|': return bar(i, hi)
        case '[': return bracket(i, hi)
        case 'e': return phase(i, hi)
        case 'd': return derivative(i, hi)
        case '*': return sup && lo + 1 === hi ? simple('conjugate') : null
        default: return arg ? null : gate(i)
      }
    }
    if (tk.k === 'c') return tk.s === '\\|' ? pair(i, hi, 'norm', '\\|') : null
    if (tk.k !== 'w') return null
    switch (tk.s) {
      case '\\sum':
      case '\\prod': {
        const w = withScripts(i + 1, hi, tk.s)
        return { id: tk.s === '\\sum' ? 'sum' : 'product', end: w.end, inner: w.inner, ctx: { lo: cap(w.lo), hi: cap(w.up), of: summand(w.end, hi) } }
      }
      case '\\otimes':
        if (sup && i === nx(lo, hi) && nx(i + 1, hi) < hi) return { id: 'tensor-power', end: hi, inner: tk.s + scan(i + 1, hi), ctx: { of: cap(raw(i + 1, hi)) } }
        return simple('tensor')
      case '\\oplus': return simple('xor')
      case '\\dagger': return simple('dagger')
      case '\\ast': return sup && lo + 1 === hi ? simple('conjugate') : null
      case '\\langle': return langle(i, hi)
      case '\\lvert': return pair(i, hi, 'abs', '\\rvert')
      case '\\lVert': return pair(i, hi, 'norm', '\\rVert')
      case '\\hat':
      case '\\vec': return accentMark(i, hi)
      case '\\sigma': {
        const ax = axisAfter(i + 1, hi)
        return ax ? { id: `pauli-${ax.axis}`, end: ax.end, inner: raw(i, ax.end) } : null
      }
      case '\\delta': return kronecker(i, hi)
      case '\\in':
      case '\\notin': return simple('element')
      case '\\approx': return simple('approx')
      case '\\propto': return simple('proportional')
      case '\\cong': return simple('congruent')
      case '\\to':
      case '\\rightarrow':
      case '\\longrightarrow': return simple('arrow')
      case '\\mapsto': return simple('mapsto')
      // (\implies and \iff are macros that add their own spaces; marking them would move those inside the mark)
      case '\\Rightarrow': return simple('implies')
      case '\\Leftrightarrow': return simple('iff')
      case '\\pm':
      case '\\mp': return simple('plusminus')
      case '\\cdot': return simple('cdot')
      case '\\hbar': return simple('hbar')
      case '\\partial': return simple('partial')
      case '\\sqrt': return sqrt(i, hi)
      case '\\det': return { id: 'det', end: i + 1, inner: tk.s, ctx: { of: operand(i + 1, hi) } }
      case '\\Re': return { id: 're', end: i + 1, inner: tk.s, ctx: { of: operand(i + 1, hi) } }
      case '\\Im': return { id: 'im', end: i + 1, inner: tk.s, ctx: { of: operand(i + 1, hi) } }
      case '\\gcd': return { id: 'gcd', end: i + 1, inner: tk.s, ctx: { of: operand(i + 1, hi) } }
      case '\\bmod':
      case '\\pmod': return simple('mod')
      case '\\lfloor': {
        const r = seek(i + 1, hi, (x) => x.s === '\\rfloor', BRA_STOPS)
        return r > i + 1 ? { id: 'floor', end: r + 1, inner: `\\lfloor${scan(i + 1, r)}\\rfloor`, ctx: { of: cap(raw(i + 1, r)) } } : null
      }
      case '\\log': {
        const w = withScripts(i + 1, hi, tk.s)
        return w.lo?.trim() === '2' ? { id: 'log2', end: w.end, inner: w.inner } : null
      }
      case '\\mathrm':
      case '\\operatorname':
      case '\\mathbb':
      case '\\text': return named(i, hi)
      case '\\frac':
      case '\\tfrac':
      case '\\dfrac': return derivative(i, hi)
      case '\\begin': {
        const a = nx(i + 1, hi)
        const e = envClose.get(i)
        const end = envEnd.get(i)
        if (a >= hi || t[a].k !== 'o' || e === undefined || end === undefined || !MATRIX.has(raw(a + 1, mate[a]))) return null
        let rows = 1
        let cols = 1
        let c = 1
        for (let j = mate[a] + 1; j < e; j = step(j)) {
          if (t[j].s === '\\\\') {
            if (nx(j + 1, e) < e) rows++
            cols = Math.max(cols, c)
            c = 1
          } else if (t[j].s === '&') c++
        }
        cols = Math.max(cols, c)
        return { id: 'matrix', end, inner: `${raw(i, mate[a] + 1)}${scan(mate[a] + 1, e)}${raw(e, end)}`, ctx: { lo: String(rows), hi: String(cols) } }
      }
    }
    return null
  }

  // ---- the scanner -------------------------------------------------------------------------------------------------

  /**
   * Text for tokens [lo, hi) with marks. `sup`: the range is (the inside of) a superscript. `arg`: the range is one
   * token, the unbraced argument of a script. The output is the source with `\htmlData` wrappers added, nothing else.
   */
  function scan(lo: number, hi: number, sup = false, arg = false): string {
    let out = ''
    for (let i = lo; i < hi; ) {
      const tk = t[i]
      if (tk.k !== 's') {
        const m = recognise(i, lo, hi, sup, arg)
        if (m && m.end > i && m.end <= hi) {
          // a script after the mark belongs to its last atom, so it goes inside: the wrapper is never a script's base
          const tail = absorb(m.end, hi)
          marked++
          out += wrap({ ...m, inner: m.inner + tail.text })
          i = tail.end
          continue
        }
      }
      if (tk.k === 'o') {
        out += `{${scan(i + 1, mate[i])}}`
        i = mate[i] + 1
        continue
      }
      if (tk.s === '^' || tk.s === '_') {
        const a = nx(i + 1, hi)
        if (a >= hi) {
          out += raw(i, hi)
          break
        }
        const sa = scriptArg(a, tk.s === '^')
        out += tk.s + raw(i + 1, a) + sa.text
        i = sa.end
        continue
      }
      if (tk.k === 'w') {
        const name = tk.s.slice(1)
        // a size or pairing command: the delimiter after it is written as it is
        if (DELIM.test(tk.s)) {
          const d = nx(i + 1, hi)
          if (d < hi) {
            out += raw(i, d + 1)
            i = d + 1
          } else {
            out += tk.s
            i = hi
          }
          continue
        }
        // \begin{name} and \end{name} keep their name; the body is scanned by this loop
        if (name === 'begin' || name === 'end' || VERBATIM.has(name)) {
          const a = nx(i + 1, hi)
          if (a < hi && t[a].k === 'o') {
            out += raw(i, mate[a] + 1)
            i = mate[a] + 1
            continue
          }
        }
        const n = ARGS[name]
        if (n !== undefined) {
          out += tk.s
          i++
          if (name === 'sqrt') {
            const b = nx(i, hi)
            const c = b < hi && t[b].s === '[' ? seek(b + 1, hi, (x) => x.s === ']', new Set()) : -1
            if (c >= 0) {
              out += raw(i, c + 1)
              i = c + 1
            }
          }
          for (let left = n; left > 0 && i < hi; left--) {
            const a = nx(i, hi)
            if (a >= hi) break
            out += raw(i, a)
            if (t[a].k === 'o') {
              out += `{${scan(a + 1, mate[a])}}`
              i = mate[a] + 1
            } else {
              out += t[a].s
              i = a + 1
            }
          }
          continue
        }
      }
      out += tk.s
      i++
    }
    return out
  }

  const out = scan(0, t.length)
  return marked ? out : src
}

/** The notation ids a TeX string uses, in order of appearance (repeats kept). */
export function notationIds(src: string, opts: NotationOpts = {}): string[] {
  const marked = markNotation(src, opts)
  return marked === src ? [] : [...marked.matchAll(/\\htmlData\{notation=([a-z][a-z0-9-]*)/g)].map((m) => m[1])
}
