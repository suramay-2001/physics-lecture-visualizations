/**
 * The notation pre-processor and its trusted renderer (notation explainers). The corpus round-trip over every TeX span of
 * both courses is ui/notationMark.corpus.test.ts; here are the rules one by one: what is marked, what never is, what
 * context a mark captures, that a mark cannot change line breaking, and that the renderer accepts marks and nothing else.
 */
import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { decodePart, encodePart, NOTATION_ID, NOTATION_VALUE, readMark } from './notationCodec'
import { markNotation, notationIds } from './notationMark'
import { renderAuthoredTex, renderAuthoredTexStrict } from './tex'
import { stripMarks, unwrapMarks } from './notationMark.corpus.test'

const ids = (tex: string, gates = false) => notationIds(tex, { gates })
/** The context a mark carries, decoded: `ctxOf('\\sum_{i=1}^n a_i', 'sum')` → { lo: 'i=1', hi: 'n', of: 'a_i' }. */
function ctxOf(tex: string, id: string, gates = false): Record<string, string> {
  const m = markNotation(tex, { gates })
  const hit = new RegExp(`\\\\htmlData\\{notation=${id}((?:,[a-z]+=[A-Za-z0-9.]*)*)\\}`).exec(m)
  expect(hit, `${id} in ${m}`).not.toBeNull()
  const out: Record<string, string> = {}
  for (const kv of (hit![1] ?? '').split(',').filter(Boolean)) {
    const [k, v] = kv.split('=')
    out[k] = decodePart(v)
  }
  return out
}

describe('what is marked', () => {
  it.each([
    ['\\sum_{i=1}^{n} a_i', ['sum']],
    ['\\prod_k x_k', ['product']],
    ['|0\\rangle \\otimes |1\\rangle', ['ket', 'tensor', 'ket']],
    ['a \\oplus b', ['xor']],
    ['U^\\dagger U', ['dagger']],
    ['z^*', ['conjugate']],
    ['\\langle a|b\\rangle', ['braket']],
    ['\\langle a|M|b\\rangle', ['sandwich']],
    ['\\langle A\\rangle', ['average']],
    ['\\langle a|', ['bra']],
    ['|a\\rangle\\langle b|', ['outer']],
    ['\\|v\\|', ['norm']],
    ['\\lVert v\\rVert', ['norm']],
    ['|z|', ['abs']],
    ['\\lvert z\\rvert', ['abs']],
    ['[\\hat A, \\hat B]', ['commutator', 'hat', 'hat']],
    ['\\mathrm{Tr}(\\rho)', ['trace']],
    ['\\det M', ['det']],
    ['\\delta_{ij}', ['kronecker']],
    ['x \\in S', ['element']],
    ['\\mathbb{C}^n', ['complex-n']],
    ['\\text{ℝ}^3', ['real-n']],
    ['e^{i\\varphi}', ['phase']],
    ['A \\cong B', ['congruent']],
    ['x \\approx y', ['approx']],
    ['P \\propto a', ['proportional']],
    ['f \\to g', ['arrow']],
    ['x \\mapsto x^2', ['mapsto']],
    ['p \\Rightarrow q', ['implies']],
    ['\\hat n', ['hat']],
    ['\\vec r', ['vec']],
    ['\\vec\\sigma', ['sigma-vec']],
    ['\\hat n\\cdot\\vec\\sigma', ['sigma-dot']],
    ['\\sigma_x, \\hat\\sigma_z, \\sigma_{y}', ['pauli-x', 'pauli-z', 'pauli-y']],
    ['\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}', ['matrix']],
    ['\\frac{\\partial}{\\partial t}', ['partial']],
    ['\\frac{d}{dt}', ['derivative']],
    ['d/dt', ['derivative']],
    ['\\sqrt{2}', ['sqrt']],
    ['\\operatorname{Re} z, \\mathrm{Im} z', ['re', 'im']],
    ['a \\bmod N', ['mod']],
    ['x^r \\equiv 1 \\pmod{21}', ['mod']],
    ['x^r \\equiv 1 \\pmod N', ['mod']],
    ['\\gcd(a, b)', ['gcd']],
    ['\\lfloor x \\rfloor', ['floor']],
    ['\\log_2 8', ['log2']],
    ['\\hbar \\omega', ['hbar']],
    ['\\pm 1', ['plusminus']],
    ['a \\cdot b', ['cdot']],
    ['\\mathrm{diag}(1, 2)', ['diag']],
    ['\\mathrm{CNOT}', ['cnot']],
    ['H^{\\otimes n}', ['tensor-power']],
    ['\\mathrm{Tr}_B\\,\\rho', ['partial-trace']],
    ['\\operatorname{tr}_2\\,\\rho', ['partial-trace']],
    ['e^{-i\\varphi S_z/\\hbar}', ['exp-operator', 'hbar']],
    ['e^{-iHt}', ['exp-operator']],
    ['e^{-i\\theta\\hat n\\cdot\\vec\\sigma/2}', ['exp-operator', 'sigma-dot']],
  ])('%s', (tex, expected) => {
    expect(ids(tex)).toEqual(expected)
  })

  it('wraps the source, adding only wrappers', () => {
    const tex = '\\sum_{i=1}^{n} a_i\\,|\\psi_i\\rangle'
    const m = markNotation(tex)
    expect(m).toBe('\\htmlData{notation=sum,lo=i.3d1,hi=n,of=a.5fi.5c.2c.7c.5cpsi.5fi.5crangle}{\\sum_{i=1}^{n}} a_i\\,\\htmlData{notation=ket,a=.5cpsi.5fi}{|\\psi_i\\rangle}')
    expect(unwrapMarks(m)).toBe(tex)
  })

  it('returns the very same string when there is nothing to mark', () => {
    for (const tex of ['x^2 + y^2 = r^2', '\\alpha + \\beta', '', 'a_{ij}', '\\frac12']) expect(markNotation(tex)).toBe(tex)
  })

  it('nests: a ket inside a sum inside an absolute value', () => {
    expect(ids('|\\sum_i c_i \\langle a|b\\rangle|^2')).toEqual(['abs', 'sum', 'braket'])
  })

  it('a mark keeps its scripts: the script never takes the wrapper as its base', () => {
    expect(markNotation('|z|^2')).toContain('{|z|^2}')
    expect(markNotation('|0\\rangle^{\\otimes n}')).toContain('|0\\rangle^{\\htmlData{notation=tensor-power,of=n}{\\otimes n}}}')
    expect(markNotation('\\hat A^\\dagger')).toBe('\\htmlData{notation=hat,of=A}{\\hat A^{\\htmlData{notation=dagger}{\\dagger}}}')
  })

  it('a mark in an unbraced script gets braces (a function cannot be an unbraced script argument)', () => {
    expect(markNotation('A^\\dagger')).toBe('A^{\\htmlData{notation=dagger}{\\dagger}}')
    expect(markNotation('x_\\pm')).toBe('x_{\\mathbin{\\htmlData{notation=plusminus}{\\pm}}}')
    expect(markNotation('z^*')).toBe('z^{\\htmlData{notation=conjugate}{*}}')
    expect(() => renderAuthoredTexStrict(markNotation('A^\\dagger z^* x_\\pm'), false, true)).not.toThrow()
  })
})

describe('what is never marked', () => {
  it('nothing inside \\text, \\mathrm, \\operatorname or other names', () => {
    for (const tex of ['\\text{sum over |x\\rangle and e^{i} and \\sum}', '\\mathrm{CNOTx}', '\\operatorname{argmax}', '\\mathbf{\\sigma_x}', '\\text{ ket } \\mathrm{abc}']) expect(markNotation(tex), tex).toBe(tex)
    // the maths around a \text is still marked
    expect(markNotation('\\text{if } |x\\rangle')).toBe('\\text{if } \\htmlData{notation=ket,a=x}{|x\\rangle}')
  })

  it('a bar that is not a bra, a ket or an absolute value stays plain', () => {
    for (const tex of ['P(a|b)', 'P(a|b) = P(c|d)', '\\{x | x > 0\\}', 'a | b']) expect(markNotation(tex), tex).toBe(tex)
  })

  it('an interval or a list is not a commutator', () => {
    for (const tex of ['[0, 1]', '[a, b]', '[x, y]', '[1, 2, 3]']) expect(markNotation(tex), tex).toBe(tex)
  })

  it('a delta with one index, or with a sum in it, is not a Kronecker delta', () => {
    for (const tex of ['\\delta_i', '\\delta_{i+1}', '\\delta = 3', '\\delta(x)']) expect(ids(tex), tex).not.toContain('kronecker')
  })

  it('e to a power that is not i·angle is not a phase', () => {
    for (const tex of ['e^2', 'e^{x}', 'e^{-t}']) expect(ids(tex), tex).toEqual([])
  })

  it('never between a command and its unbraced argument', () => {
    for (const tex of ['\\hat\\sigma', '\\bar\\sigma_z', '\\frac\\pi2 + \\frac12', '\\left|x\\right|', '\\left\\langle x\\right\\rangle', '\\big|x\\big|', '\\vec\\mu', '\\sqrt\\pi', '\\tilde\\psi']) {
      const m = markNotation(tex)
      expect(() => renderAuthoredTexStrict(m, false, true), `${tex} → ${m}`).not.toThrow()
    }
    expect(markNotation('\\left\\langle x\\right\\rangle')).toBe('\\left\\langle x\\right\\rangle')
  })

  it('unbalanced TeX is returned as written', () => {
    for (const tex of ['\\sum_{i=1 a_i', '|a\\rangle}', '\\begin{pmatrix}1 \\end{bmatrix}', '{']) expect(markNotation(tex), tex).toBe(tex)
  })

  it('leaves the arguments of \\htmlClass term links alone and marks the maths inside them', () => {
    const m = markNotation('\\htmlClass{term-ket}{|\\psi\\rangle} + \\sum_i')
    expect(m).toContain('\\htmlClass{term-ket}{\\htmlData{notation=ket')
    expect(() => renderAuthoredTexStrict(m, false, true)).not.toThrow()
  })
})

describe('the context a mark captures', () => {
  it('a sum: counter, limits, and the part being added', () => {
    expect(ctxOf('\\sum_{i=1}^{n} a_i b_i + c', 'sum')).toEqual({ lo: 'i=1', hi: 'n', of: 'a_i b_i' })
    expect(ctxOf('\\sum_x (-1)^{x\\cdot z} = 0', 'sum')).toEqual({ lo: 'x', of: '(-1)^{x\\cdot z}' })
    expect(ctxOf('\\sum_{x=0}^{2^n-1} c_x |x\\rangle', 'sum')).toMatchObject({ lo: 'x=0', hi: '2^n-1', of: 'c_x |x\\rangle' })
    expect(ctxOf('\\big(\\sum_x|x\\rangle\\big)', 'sum').of).toBe('|x\\rangle')
    expect(ctxOf('\\sum_{x_j=0}^{1}(-1)^{x_jz_j}\\Big)', 'sum')).toMatchObject({ lo: 'x_j=0', hi: '1' })
  })

  it('a product', () => {
    expect(ctxOf('\\prod_{k=1}^{4} k = 24', 'product')).toEqual({ lo: 'k=1', hi: '4', of: 'k' })
  })

  it('brackets, kets, brakets, matrix elements, averages, outer products', () => {
    expect(ctxOf('\\langle\\psi|\\phi\\rangle', 'braket')).toEqual({ a: '\\psi', b: '\\phi' })
    expect(ctxOf('\\langle i|\\hat A|j\\rangle', 'sandwich')).toEqual({ a: 'i', m: '\\hat A', b: 'j' })
    expect(ctxOf('|{+z}\\rangle', 'ket')).toEqual({ a: '{+z}' })
    expect(ctxOf('\\langle\\sigma_n\\rangle', 'average')).toEqual({ of: '\\sigma_n' })
    expect(ctxOf('|a\\rangle\\langle b|', 'outer')).toEqual({ a: 'a', b: 'b' })
    expect(ctxOf('\\langle a|', 'bra')).toEqual({ a: 'a' })
    expect(ctxOf('|\\alpha + \\beta|', 'abs')).toEqual({ of: '\\alpha + \\beta' })
  })

  it('a matrix: rows and columns', () => {
    expect(ctxOf('\\begin{pmatrix}1\\\\0\\end{pmatrix}', 'matrix')).toEqual({ lo: '2', hi: '1' })
    expect(ctxOf('\\begin{pmatrix}a&b&c\\\\d&e&f\\end{pmatrix}', 'matrix')).toEqual({ lo: '2', hi: '3' })
    expect(ctxOf('\\begin{bmatrix}1&0\\\\0&1\\\\\\end{bmatrix}', 'matrix')).toEqual({ lo: '2', hi: '2' })
  })

  it('the rest: phase, root, trace, Kronecker, derivative, commutator, floor', () => {
    expect(ctxOf('e^{-i\\omega t}', 'phase')).toEqual({ of: '-i\\omega t' })
    expect(ctxOf('\\sqrt{x^2 + y^2}', 'sqrt')).toEqual({ of: 'x^2 + y^2' })
    expect(ctxOf('\\mathrm{Tr}(\\rho A)', 'trace')).toEqual({ of: '\\rho A' })
    expect(ctxOf('\\delta_{jk}', 'kronecker')).toEqual({ a: 'j', b: 'k' })
    expect(ctxOf('\\frac{d}{dt} f', 'derivative')).toEqual({ of: 't' })
    expect(ctxOf('[\\sigma_x, \\sigma_y]', 'commutator')).toEqual({ a: '\\sigma_x', b: '\\sigma_y' })
    expect(ctxOf('\\lfloor x/2 \\rfloor', 'floor')).toEqual({ of: 'x/2' })
    expect(ctxOf('H^{\\otimes n}', 'tensor-power')).toEqual({ of: 'n' })
    expect(ctxOf('\\mathbb{C}^{2^n}', 'complex-n')).toEqual({ of: '2^n' })
  })

  it('an operand keeps its scripts and its arguments, and an environment is one piece (review #15)', () => {
    expect(ctxOf('\\det S_x', 'det')).toEqual({ of: 'S_x' })
    expect(ctxOf('\\det B_{z\\leftarrow x}', 'det')).toEqual({ of: 'B_{z\\leftarrow x}' })
    expect(ctxOf('\\det\\hat A', 'det')).toEqual({ of: '\\hat A' })
    expect(ctxOf('\\det\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}', 'det')).toEqual({ of: '\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}' })
    expect(ctxOf('\\mathrm{Tr}\\,\\rho_A^2', 'trace')).toEqual({ of: '\\rho_A^2' })
  })

  it('a partial trace records the traced-out part and what it acts on; a bra subscript is not part of M (review #10, #16)', () => {
    expect(ctxOf('\\mathrm{Tr}_B\\,\\rho', 'partial-trace')).toEqual({ a: 'B', of: '\\rho' })
    expect(ctxOf('\\mathrm{Tr}_{AB}(\\rho)', 'partial-trace')).toEqual({ a: 'AB', of: '\\rho' })
    expect(ctxOf('\\langle b|_B\\,\\rho\\,|b\\rangle_B', 'sandwich')).toEqual({ a: 'b', m: '\\rho', b: 'b', lo: 'B' })
    expect(ctxOf('\\langle b|\\rho|b\\rangle', 'sandwich')).toEqual({ a: 'b', m: '\\rho', b: 'b' })
  })

  it('captured TeX loses term links and keeps no more than 64 characters', () => {
    expect(ctxOf('\\sum_i \\htmlClass{term-p}{p_i}', 'sum').of).toBe('{p_i}')
    expect(ids('\\sum_i ' + 'a'.repeat(80))).toEqual(['sum'])
    expect(markNotation('\\sum_i ' + 'a'.repeat(80))).not.toMatch(/of=/)
  })

  it('reads a rendered mark back: readMark decodes the data attributes', () => {
    const html = renderAuthoredTex(markNotation('\\langle\\psi|\\phi\\rangle'), false, true)
    const data = /<span class="enclosing" data-notation="braket" data-a="([^"]*)" data-b="([^"]*)">/.exec(html)
    expect(data).not.toBeNull()
    const read = readMark({ dataset: { notation: 'braket', a: data![1], b: data![2] } })
    expect(read.id).toBe('braket')
    expect(read.ctx).toMatchObject({ a: '\\psi', b: '\\phi' })
  })
})

describe('bare gate letters (Physics 709 only)', () => {
  it('X, Y, Z, H, I in a formula that is plainly about gates', () => {
    expect(ids('X|0\\rangle = |1\\rangle', true)).toEqual(['pauli-x', 'ket', 'ket'])
    expect(ids('HXH = Z', true)).toEqual(['hadamard', 'pauli-x', 'hadamard', 'pauli-z'])
    expect(ids('Z\\otimes I', true)).toEqual(['pauli-z', 'tensor', 'identity'])
    expect(ids('X^2 = I', true)).toEqual(['pauli-x', 'identity'])
    expect(ids('H^{\\otimes n}|0\\rangle', true)).toContain('hadamard')
    expect(ids('X = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}', true)).toContain('pauli-x')
  })

  it('not in 448, and not where a letter is only a variable', () => {
    expect(ids('X|0\\rangle', false)).toEqual(['ket'])
    for (const tex of ['\\langle X\\rangle = \\sum_x p_x x', '(\\Delta X)^2', 'X_1 + X_2', 'P(X = x)', 'H = S_z']) {
      expect(ids(tex, true).filter((i) => /^pauli|hadamard|identity/.test(i)), tex).toEqual([])
    }
  })

  it('not a mean square, an absolute value, a transposed operator, a subscript label or an exponent (review #9, #23)', () => {
    for (const tex of [
      '(\\Delta X)^2 = \\langle X^2\\rangle - \\langle X\\rangle^2', // F5: a mean square of a random variable
      '\\langle X^2 - 2\\mu X + \\mu^2\\rangle',
      '|X| = 2', // Q10: a CHSH value
      '|S| = |\\sum P\\,X| \\le 2',
      '\\mathrm{Tr}(X^{T_B}Y) = \\mathrm{Tr}(XY^{T_B})', // Q12: arbitrary operators
      'P_{XXX}(\\text{even}) = \\tfrac14,\\quad P_{YYX}(\\text{odd}) = \\tfrac14', // Q7: labels
      '\\hat O_{XYY}|\\mathrm{GHZ}\\rangle = -|\\mathrm{GHZ}\\rangle',
      'e^{-iHt/\\hbar}\\,|\\psi\\rangle', // H is the Hamiltonian in an exponent
    ])
      expect(ids(tex, true).filter((i) => /^pauli|hadamard|identity/.test(i)), tex).toEqual([])
  })

  it('a bar closes a ket only with a \\rangle; X² counts outside an average; a letter next to a bra-ket is a gate', () => {
    expect(ids('X|0\\rangle', true)).toEqual(['pauli-x', 'ket'])
    expect(ids('\\langle 0|X|1\\rangle', true)).toContain('pauli-x')
    expect(ids('X^2 = I', true)).toEqual(['pauli-x', 'identity'])
    expect(ids('\\langle X\\otimes X\\rangle', true).filter((i) => i === 'pauli-x')).toHaveLength(2)
  })

  it('H^{⊗n} knows its qubit count', () => {
    expect(ctxOf('H^{\\otimes n}|0\\rangle', 'hadamard', true)).toEqual({ of: 'n', m: 'gate' })
    expect(ctxOf('H|0\\rangle', 'hadamard', true)).toEqual({ m: 'gate' })
  })
})

describe('line breaking: marks keep the class KaTeX uses to break an inline formula', () => {
  const bases = (html: string) => (html.match(/class="katex-base"/g) ?? []).length
  const render = (tex: string) => katex.renderToString(tex, { output: 'html', trust: true, strict: 'ignore', throwOnError: true })
  it.each(['a \\approx b', 'a \\to b', 'x \\in S', 'p \\Rightarrow q', 'a\\cdot b', 'a \\pm b', 'A\\otimes B', 'a \\oplus b', 'a \\propto b'])('%s may still break after its symbol', (tex) => {
    const marked = markNotation(tex)
    expect(marked).not.toBe(tex)
    expect(bases(render(marked))).toBe(bases(render(tex)))
    expect(stripMarks(render(marked))).toContain('class="katex-base"')
  })
})

describe('the codec: encoded TeX is plain letters, digits and dots', () => {
  it('round-trips ASCII, symbols and unicode', () => {
    for (const s of ['', 'i=1', '\\psi_{i,j}', 'a b', '%\\\\', '"<>&\'', 'ℂ² ħ ⟩', '{+z}', '.']) {
      const e = encodePart(s)
      expect(e).toMatch(NOTATION_VALUE)
      expect(decodePart(e)).toBe(s)
    }
  })
  it('ids are lowercase words with hyphens', () => {
    for (const ok of ['sum', 'tensor-power', 'pauli-x', 'log2']) expect(ok).toMatch(NOTATION_ID)
    for (const bad of ['', 'Sum', '1sum', 'a b', 'a"b', '-x', 'a'.repeat(30)]) expect(bad).not.toMatch(NOTATION_ID)
  })
})

describe('the trusted renderer: marks, and nothing else', () => {
  const ok = (tex: string) => renderAuthoredTex(tex, false, true)
  const hasMark = (html: string) => /<span class="enclosing" data-notation="/.test(html)

  it('renders a mark as a span with data attributes (and nothing executable)', () => {
    const html = ok('\\htmlData{notation=sum,lo=i.3d1,hi=n}{\\sum_{i=1}^{n}}')
    expect(html).toContain('<span class="enclosing" data-notation="sum" data-lo="i.3d1" data-hi="n">')
    expect(html).not.toMatch(/on[a-z]+=|href=|<a |<script|javascript:/)
  })

  it('without the notation switch the same TeX is refused', () => {
    expect(hasMark(renderAuthoredTex('\\htmlData{notation=sum}{x}'))).toBe(false)
  })

  it.each([
    '\\htmlData{onclick=alert(1)}{x}',
    '\\htmlData{notation=sum,onclick=alert(1)}{x}',
    '\\htmlData{notation=sum,foo=bar}{x}',
    '\\htmlData{foo=bar}{x}',
    '\\htmlData{notation=Sum}{x}',
    '\\htmlData{notation=a b}{x}',
    '\\htmlData{notation=sum,lo=<img>}{x}',
    '\\htmlData{notation=sum,lo=a b}{x}',
    '\\htmlData{notation=sum,lo=a"b}{x}',
    '\\htmlData{notation=sum,lo=' + 'a'.repeat(400) + '}{x}',
    '\\htmlData{notation=}{x}',
    '\\htmlId{evil}{x}',
    '\\htmlStyle{color:red}{x}',
    '\\href{https://example.com}{x}',
    '\\url{https://example.com}',
    '\\includegraphics{x.png}',
    '\\htmlClass{evil}{x}',
  ])('refuses %s', (tex) => {
    expect(hasMark(ok(tex))).toBe(false)
    expect(() => renderAuthoredTexStrict(tex, false, true)).toThrow()
    // (an error shows the typed source as TEXT, so look for attributes inside tags, not for words)
    expect(ok(tex)).not.toMatch(/<a\b|<[^>]*\s(?:on[a-z]+|href|src)=|<[^>]*style="[^"]*url\(/i)
  })

  it('still honours a term link next to a mark', () => {
    const html = ok('\\htmlClass{term-ket}{x} \\htmlData{notation=ket}{|a\\rangle}')
    expect(html).toContain('class="enclosing term-ket"')
    expect(hasMark(html)).toBe(true)
  })
})
