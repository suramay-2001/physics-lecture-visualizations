/**
 * KaTeX renderer hardening (S-L1 §4a, finding S-05, decision #9). Two sinks feed innerHTML:
 *  - renderUserTex: anything a student typed — trust off, maxSize 10, maxExpand 50, 300-char and
 *    brace-depth-24 caps, a 40em cap on every length in the markup, never throws;
 *  - renderAuthoredTex: authored content — trust allows exactly \htmlClass{term-[a-z0-9-]+}, never throws;
 *  - renderAuthoredTexStrict (content gate): throws on ParseErrors AND on any untrusted command.
 * Every test asserts on the produced HTML, so a KaTeX upgrade that changes a default fails loudly.
 */
import { describe, expect, it } from 'vitest'
import { renderAuthoredTex, renderAuthoredTexStrict, renderUserTex, USER_TEX_MAX_BRACE_DEPTH, USER_TEX_MAX_LEN } from './tex'

const RENDERERS = [
  ['user', renderUserTex],
  ['authored', renderAuthoredTex],
] as const

/**
 * KaTeX escapes text (`<` → `&lt;`), so every literal `<…>` in its output is real markup. The inertness checks
 * therefore run on parsed tags and attribute NAMES, never on text or attribute values: a katex-error
 * `title="…"` legitimately echoes the typed source (escaped), including strings like `onclick=`.
 */
const BAD_TAGS = /^(a|img|image|script|iframe|frame|object|embed|style|link|meta|base|form|input|button|textarea|select|foreignobject|use|animate|set|video|audio|source|template|slot)$/i
const BAD_ATTRS = /^(on[a-z]+|href|xlink:href|src|srcset|id|name|action|formaction|background|poster|data-[a-z0-9-]*|is|srcdoc|ping)$/i
const TAG = /<([a-zA-Z][a-zA-Z0-9:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g
const ATTR = /\s+([^\s"'>/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g

function tagsOf(html: string) {
  const out: { tag: string; attrs: [string, string][] }[] = []
  for (const m of html.matchAll(TAG)) out.push({ tag: m[1], attrs: [...m[2].matchAll(ATTR)].map((a) => [a[1], a[2] ?? ''] as [string, string]) })
  return out
}
function expectInert(html: string, label = '') {
  // every '<' that starts a tag must parse as a well-formed tag (no half-open markup smuggled through)
  const opens = (html.match(/<[a-zA-Z]/g) ?? []).length
  const tags = tagsOf(html)
  expect(tags.length, `${label} unparsed tag`).toBe(opens)
  for (const { tag, attrs } of tags) {
    expect(tag, `${label} tag`).not.toMatch(BAD_TAGS)
    for (const [name, value] of attrs) {
      expect(name, `${label} <${tag}> attribute`).not.toMatch(BAD_ATTRS)
      expect(name, `${label} <${tag}> attribute name`).toMatch(/^[a-z][a-z0-9:-]*$/i)
      // `title` on a katex-error span is escaped echo text; `style` is the only attribute that could fetch or run
      if (name === 'style') expect(value, `${label} <${tag} style>`).not.toMatch(/javascript:|url\s*\(|expression\s*\(|@import|behavior\s*:|-moz-binding|image-set\s*\(/i)
    }
  }
}
const classesOf = (html: string) =>
  tagsOf(html).flatMap(({ attrs }) => attrs.filter(([n]) => n === 'class').flatMap(([, v]) => v.replace(/^["']|["']$/g, '').split(/\s+/)))
/** Largest |length| in em in the markup, skipping the <annotation> TeX echo and KaTeX's fixed-size <svg> tags. */
const maxEm = (html: string) =>
  Math.max(
    0,
    ...[...html.replace(/<annotation[\s\S]*?<\/annotation>/g, '').replace(/<svg\b[^>]*>/g, '<svg>').matchAll(/(-?\d*\.?\d+)em\b/g)].map((m) => Math.abs(Number(m[1]))),
  )
const timeMs = (f: () => void) => {
  const t0 = performance.now()
  f()
  return performance.now() - t0
}

describe('URL and HTML commands are rejected by both renderers', () => {
  const ATTACKS = [
    '\\href{javascript:alert(1)}{x}',
    '\\href{https://example.com}{x}',
    '\\url{javascript:alert(1)}',
    '\\url{https://example.com}',
    '\\includegraphics[height=1em]{https://example.com/x.png}',
    '\\includegraphics{x.png}',
    '\\htmlId{evil}{x}',
    '\\htmlStyle{background:url(https://example.com/x)}{x}',
    '\\htmlData{onclick=alert(1)}{x}',
    '\\htmlData{foo=bar}{x}',
    '\\htmlClass{evil}{x}',
    '\\htmlClass{term-X}{x}',
    '\\htmlClass{term-}{x}',
    '\\htmlClass{term-x y}{x}',
    '\\htmlClass{term-x" onclick="alert(1)}{x}',
    "\\htmlClass{term-x' onmouseover='alert(1)}{x}",
    '\\htmlClass{term-x>}{x}',
    '\\text{<img src=x onerror=alert(1)>}',
    '\\verb|<script>alert(1)</script>|',
    '<script>alert(1)</script>',
    '\\textcolor{red" onclick="alert(1)}{x}',
    '\\color{#f00;background:url(x)}x',
  ]
  for (const [name, render] of RENDERERS)
    it.each(ATTACKS)(`${name}: %s`, (src) => {
      let html = ''
      expect(() => (html = render(src))).not.toThrow()
      expectInert(html, src)
      for (const c of classesOf(html)) expect(c).not.toMatch(/^(evil|term-X|term-|term-x|y)$/)
    })

  it('user renderer: \\htmlClass{term-…} is NOT honoured (trust is off)', () => {
    expect(classesOf(renderUserTex('\\htmlClass{term-spin}{a}'))).not.toContain('term-spin')
  })

  it('authored renderer: exactly \\htmlClass{term-[a-z0-9-]+} is honoured', () => {
    expect(renderAuthoredTex('\\htmlClass{term-spin}{a}')).toContain('class="enclosing term-spin"')
    expect(renderAuthoredTex('\\htmlClass{term-s-z2}{a}')).toContain('class="enclosing term-s-z2"')
    expect(renderAuthoredTexStrict('\\htmlClass{term-spin}{a}')).toContain('class="enclosing term-spin"')
  })

  // KaTeX renders an untrusted command as red text even with throwOnError: true, so without a throwing trust
  // callback the content gate would ship "\href" in red instead of failing (found in the S build round).
  it.each(['\\href{https://example.com}{x}', '\\url{https://example.com}', '\\includegraphics{x.png}', '\\htmlClass{evil}{x}', '\\htmlClass{term-X}{x}', '\\htmlId{a}{x}', '\\htmlStyle{color:red}{x}', '\\htmlData{a=b}{x}', '\\zz'])(
    'authored strict renderer (content gate) throws on %s',
    (src) => {
      expect(() => renderAuthoredTexStrict(src)).toThrow()
    },
  )
})

describe('size and expansion caps', () => {
  it('user: \\rule{500em}{500em} is clamped to maxSize 10', () => {
    const html = renderUserTex('\\rule{500em}{500em}')
    expect(html).toContain('katex')
    expect(maxEm(html)).toBeLessThanOrEqual(10)
  })
  it('authored: \\rule{500em}{500em} is clamped to maxSize 20', () => {
    expect(maxEm(renderAuthoredTex('\\rule{500em}{500em}'))).toBeLessThanOrEqual(20)
  })

  // KaTeX clamps with Math.min(size, maxSize): negative sizes pass through unclamped (verified on 0.18.7).
  const NEGATIVE = [
    '\\raisebox{-900em}{x}',
    '\\raisebox{900em}{x}',
    '\\kern{-500em}',
    '\\kern-500em x',
    '\\hspace{-500em}',
    '\\hspace*{-500em}',
    '\\hskip-500em x',
    '\\mkern-9000mu x',
    '\\mskip-9000mu x',
    '\\rule{-500em}{1em}',
    '\\rule{1em}{-500em}',
    '\\rule[-500em]{1em}{1em}',
    '\\kern{-1000pt}',
    '\\kern{-100cm}',
    '\\kern{-50in}',
    '\\mathrlap{\\kern-500em x}',
    '\\def\\n{-900em}\\kern\\n x',
    '\\def\\n{-900}\\kern\\n em x',
    '\\sqrt[\\raisebox{-900em}{x}]{2}',
  ]
  it.each(NEGATIVE)('user: %s is refused or stays within 40em', (src) => {
    const html = renderUserTex(src)
    expect(html.includes('tex-user-error') || maxEm(html) <= 40).toBe(true)
    expect(maxEm(html)).toBeLessThanOrEqual(40)
  })

  it('user: ordinary tall input is still typeset (the 40em cap is not hit by normal maths)', () => {
    for (const src of ['\\begin{matrix}' + 'x\\\\'.repeat(20) + '\\end{matrix}', '\\frac{1}{'.repeat(20) + 'x' + '}'.repeat(20), '\\sqrt{'.repeat(20) + 'x' + '}'.repeat(20), '\\Bigg(\\frac{\\hbar}{2}\\Bigg)'])
      expect(renderUserTex(src)).not.toContain('tex-user-error')
  })

  it('macro bomb \\def\\a{\\a\\a}\\a stops fast in both renderers', () => {
    for (const [, render] of RENDERERS) {
      let html = ''
      expect(timeMs(() => (html = render('\\def\\a{\\a\\a}\\a')))).toBeLessThan(50)
      expect(html.length).toBeLessThan(20_000)
    }
  })
  it('user: expansion budget is 50 (a 64-way expansion is an error, not a render)', () => {
    const html = renderUserTex('\\def\\b{xx}\\def\\c{\\b\\b\\b\\b}\\def\\d{\\c\\c\\c\\c}\\d\\d\\d\\d')
    expect(html).toMatch(/Too many expansions/)
  })

  it('\\gdef does not leak between renders (no shared macros object)', () => {
    const before = renderUserTex('\\yy')
    renderUserTex('\\gdef\\yy{1}')
    expect(renderUserTex('\\yy')).toBe(before)
    renderAuthoredTex('\\gdef\\yy{1}')
    expect(renderUserTex('\\yy')).toBe(before)
    expect(renderAuthoredTex('\\yy')).toBe(renderAuthoredTex('\\yy'))
  })
})

describe('length and nesting caps (deep nesting throws RangeError inside KaTeX)', () => {
  it(`user: ${USER_TEX_MAX_LEN} chars render, ${USER_TEX_MAX_LEN + 1} are refused`, () => {
    expect(renderUserTex('x'.repeat(USER_TEX_MAX_LEN))).toContain('katex')
    const tooLong = renderUserTex('x'.repeat(USER_TEX_MAX_LEN + 1))
    expect(tooLong).toContain('tex-user-error')
    expect(tooLong).toContain('too long')
  })

  it(`user: brace depth ${USER_TEX_MAX_BRACE_DEPTH} renders, ${USER_TEX_MAX_BRACE_DEPTH + 1} is refused`, () => {
    const d = USER_TEX_MAX_BRACE_DEPTH
    expect(renderUserTex('{'.repeat(d) + 'x' + '}'.repeat(d))).not.toContain('tex-user-error')
    expect(renderUserTex('{'.repeat(d + 1) + 'x' + '}'.repeat(d + 1))).toContain('nested too deeply')
    expect(renderUserTex('{'.repeat(d + 1))).toContain('tex-user-error') // unbalanced: depth counted on the way in
  })

  const DEEP: [string, string][] = [
    ['x^{ ×800', 'x^{'.repeat(800) + 'x' + '}'.repeat(800)],
    ['\\sqrt{ ×800', '\\sqrt{'.repeat(800) + 'x' + '}'.repeat(800)],
    ['\\frac{1}{ ×800', '\\frac{1}{'.repeat(800) + 'x' + '}'.repeat(800)],
    ['{ ×2000', '{'.repeat(2000) + 'x' + '}'.repeat(2000)],
    ['\\left( ×1500', '\\left('.repeat(1500) + 'x' + '\\right)'.repeat(1500)],
  ]
  for (const [name, render] of RENDERERS)
    it.each(DEEP)(`${name}: %s does not throw and returns inert HTML`, (_label, src) => {
      let html = ''
      expect(() => (html = render(src))).not.toThrow()
      expect(typeof html).toBe('string')
      expectInert(html)
    })

  it('user: deep nesting is refused by the caps before KaTeX sees it', () => {
    for (const [, src] of DEEP) expect(renderUserTex(src)).toContain('tex-user-error')
  })

  it('authored: nesting that makes KaTeX throw RangeError becomes a "typeset error" span', () => {
    expect(renderAuthoredTex('x^{'.repeat(800) + 'x' + '}'.repeat(800))).toBe('<span class="tex-user-error">typeset error</span>')
  })

  it('60 bare \\sqrt (300 chars, no braces) renders without throwing', () => {
    expect(renderUserTex('\\sqrt'.repeat(60))).toContain('katex')
  })

  it('a 300-char input stays small (no output blow-up)', () => {
    for (const src of ['x'.repeat(300), '\\sqrt'.repeat(60), '\\;'.repeat(150), '\\color{red}x'.repeat(25)]) expect(renderUserTex(src).length).toBeLessThan(200_000)
  })

  it('non-string input is refused, not thrown', () => {
    expect(renderUserTex(42 as unknown as string)).toContain('not text')
    expect(renderUserTex(null as unknown as string)).toContain('not text')
  })

  it('refusals are escaped text, never markup', () => {
    for (const src of ['x'.repeat(USER_TEX_MAX_LEN + 1), '{'.repeat(40), '\\kern{-500em}'])
      expect(renderUserTex(src)).toMatch(/^<span class="tex-user-error">[^<>]*<\/span>$/)
  })
})

describe('fuzz: random mixes of dangerous tokens never throw and stay inert', () => {
  const PIECES = [
    '\\href{javascript:alert(1)}{', '\\url{', '\\htmlClass{term-a}{', '\\htmlClass{x" onclick="y}{', '\\htmlData{a=b}{', '\\htmlId{i}{',
    '\\htmlStyle{color:red}{', '\\includegraphics{', '<img src=x onerror=y>', '<script>', '"', "'", '&', '<', '>', '{', '}', '^', '_',
    '\\frac', '\\sqrt', '\\left(', '\\right)', '\\def\\a{\\a\\a}\\a', '\\gdef\\q{1}', '\\rule{99em}{99em}', '\\kern-99em', '\\raisebox{-99em}{',
    '\\text{', '\\verb|', '|', '\\color{', '\\textcolor{', 'x', '1', ' ', '\\\\', '\\begin{matrix}', '\\end{matrix}', '%',
  ]
  let seed = 448 // deterministic LCG so a failure reproduces
  const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32
  const cases: string[] = []
  for (let i = 0; i < 400; i++) {
    let s = ''
    const n = 1 + Math.floor(rnd() * 20)
    for (let k = 0; k < n; k++) s += PIECES[Math.floor(rnd() * PIECES.length)]
    cases.push(s)
  }
  for (const [name, render] of RENDERERS)
    it(`${name}: ${cases.length} random inputs`, () => {
      for (const src of cases) {
        let html = ''
        expect(() => (html = render(src)), src).not.toThrow()
        expectInert(html, src)
        if (name === 'user') {
          expect(classesOf(html).some((c) => c.startsWith('term-')), src).toBe(false)
          expect(maxEm(html), src).toBeLessThanOrEqual(40)
        }
      }
    })
})
