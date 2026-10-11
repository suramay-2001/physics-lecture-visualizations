/**
 * The failure classes of the independent review (docs/roles/audits/notation-review.md #7-#11, #14-#18, #23), each run over the
 * WHOLE course through the real path (the pre-processor, then the dictionary's sentence for the spot): the class no longer
 * appears where the review found it, and the sites the review listed are named here so they stay fixed.
 * Sites are written `chapter place` as the review wrote them (`L7 l7-uncertainty:b4`).
 */
import { describe, expect, it } from 'vitest'
import { corpusMarks, corpusSites, gatesOf, marksOf, type FoundMark, type Site } from '../ui/notationCorpus.testkit'
import { markNotation } from '../ui/notationMark'
import { renderUserTex } from '../ui/tex'
import { courseOfId } from './courses'
import { NOTATION_BY_ID } from './notation'
import type { Seg } from './notationKit'

const flat = (segs: readonly Seg[] | null | undefined) => (segs ?? []).map((s) => (typeof s === 'string' ? s : `$${s.tex}$`)).join('')
/** The sentence a card shows for a mark of a site, in that site's track and course. */
const sentence = (s: Site, m: FoundMark) => flat(NOTATION_BY_ID.get(m.id)?.here?.(m.ctx, s.track, courseOfId(s.chapter)))
const sitesAt = (chapter: string, where: string) => corpusSites().filter((s) => s.chapter === chapter && s.where === where)
/** Every (site, mark) of the sites the review listed; each listed place must exist. */
function listed(places: readonly string[], id?: string): { site: Site; mark: FoundMark }[] {
  const out: { site: Site; mark: FoundMark }[] = []
  for (const p of places) {
    const [chapter, where] = p.split(' ')
    const sites = sitesAt(chapter, where)
    expect(sites.length, `the review's site ${p} exists`).toBeGreaterThan(0)
    for (const site of sites) for (const mark of marksOf(site.tex, gatesOf(site.chapter))) if (!id || mark.id === id) out.push({ site, mark })
  }
  return out
}
const ids = (tex: string, gates = true) => marksOf(tex, gates).map((m) => m.id)

describe('review #7: |⟨…⟩| is an overlap only when the bracket holds a bar', () => {
  const SITES = [
    'L7 l7-uncertainty:b2', 'L7 l7-uncertainty:b4', 'L7 l7-uncertainty.lecture', 'L7 l7-uncertainty.lecture.equations[0]', 'L7 l7-uncertainty.visual.tryThis[0]',
    'L7 l7-uncertainty.play.l7-un-zero.options[3]', 'L7 l7-uncertainty.play.l7-un-gap', 'Q3 q3-uncertainty:b4.derivation', 'Q3 q3-uncertainty:b4.derivation.ground[2]',
    'Q3 q3-uncertainty.play.q3-u-floor', 'Q3 q3-uncertainty.play.q3-u-which', 'Q10 q10-violation.play.q10-v-tsirelson.hints[0]', 'Q10 q10-violation:b4.derivation.formal[1]',
  ]
  it('the size of an average, a commutator average or a spread product is never called an overlap or a chance', () => {
    const hits = listed(SITES, 'abs')
    expect(hits.length).toBeGreaterThan(10)
    for (const { site, mark } of hits) {
      if (!/\\langle/.test(mark.ctx.of ?? '')) continue
      expect(sentence(site, mark), `${site.chapter} ${site.where}: ${site.tex}`).not.toMatch(/overlap|chance/)
    }
  })
  it('across the course "overlap" and "chance" appear only for |⟨a|b⟩| (one bar inside the bracket)', () => {
    let overlaps = 0
    for (const { site, mark } of corpusMarks()) {
      if (mark.id !== 'abs') continue
      const s = sentence(site, mark)
      if (!/overlap|chance/.test(s)) continue
      overlaps++
      expect(/^\s*\\langle[^|]*(?<!\\)\|[^|]*\\rangle\s*$/.test(mark.ctx.of ?? ''), `${site.chapter} ${site.where}: ${site.tex}`).toBe(true)
    }
    expect(overlaps).toBeGreaterThan(20)
  })
  it('says what it is: the average of S_z, of [A, B], a matrix element', () => {
    const say = (tex: string) => {
      const site = { chapter: 'L7', track: 'ground', where: '', tex, display: false } as Site
      return marksOf(tex, false).filter((m) => m.id === 'abs').map((m) => sentence(site, m))[0]
    }
    expect(say('\\lvert\\langle S_z\\rangle\\rvert')).toBe('The size of the average of $S_z$.')
    expect(say('|\\langle[A,B]\\rangle|^2')).toBe('The size of the average of $[A,B]$.')
    expect(say('|\\langle a|b\\rangle|^2')).toBe('The size of an overlap. Squared, it is a chance.')
    expect(say('|\\langle a|M|b\\rangle|')).toBe('The size of the matrix element $\\langle a|M|b\\rangle$.')
  })
})

describe('review #8: an operator in the exponent is an operator exponential, not a phase factor', () => {
  const SITES = [
    'L5 l5-invariance:b6', 'L6 l6-generator', 'L6 l6-generator:b6', 'L6 l6-generator.lecture', 'L6 l6-generator.lecture.equations[0]', 'L6 l6-generator.play.l6-g-small-form.options[0]',
    'L7 l7-full-turn:b4', 'L7 l7-full-turn.review', 'L8 l8-photon-spin.lecture.equations[1]', 'L8 l8-photon-spin.review', 'L11 l11-wait:b3', 'L11 l11-two-level:b2.derivation.ground[1]',
    'L11 l11-two-level:b2.derivation.ground[2]', 'L11 l11-two-level:b2.derivation.ground[3]', 'F4 f4-unitary:b4', 'F4 f4-unitary.play.f4-u-rotation.hints[0]',
    'Q4 q4-one-qubit-gates:b3.derivation.ground[1]', 'Q4 q4-one-qubit-gates:b3.derivation.ground[2]', 'Q4 q4-one-qubit-gates:b3', 'Q4 q4-one-qubit-gates:b6.derivation.formal[1]', 'Q13 q13-from-unitary:b1',
  ]
  it('every operator exponential the review listed is now an exp-operator, and says it is an operator', () => {
    let found = 0
    for (const p of SITES) {
      const [chapter, where] = p.split(' ')
      const sites = sitesAt(chapter, where)
      expect(sites.length, p).toBeGreaterThan(0)
      const marks = sites.flatMap((site) => marksOf(site.tex, gatesOf(chapter)).map((mark) => ({ site, mark })))
      const exps = marks.filter((x) => x.mark.id === 'exp-operator')
      expect(exps.length, `${p}: an operator exponential`).toBeGreaterThan(0)
      found += exps.length
      for (const { site, mark } of exps) expect(sentence(site, mark), p).toMatch(/holds an operator.*not a single number/)
    }
    expect(found).toBeGreaterThanOrEqual(SITES.length)
  })
  it('no phase factor anywhere in the course has an operator in its exponent, and no card calls an operator exponential "a turn from 1"', () => {
    for (const { site, mark } of corpusMarks()) {
      if (mark.id === 'phase') expect(mark.ctx.of, `${site.chapter} ${site.where}: ${site.tex}`).not.toMatch(/\\(?:sigma|hat|vec|mathbf|boldsymbol)|[SJ]\s*_|[XYZH]/)
      if (mark.id === 'exp-operator') expect(sentence(site, mark)).not.toMatch(/from 1|counter-clockwise/)
    }
  })
  it('a plain phase factor is still a phase factor', () => {
    expect(ids('e^{i\\varphi}')).toEqual(['phase'])
    expect(ids('e^{-i\\omega t}')).toEqual(['phase'])
    expect(ids('e^{i\\pi/2}')).toEqual(['phase'])
    expect(ids('e^{-iHt/\\hbar}')).toEqual(['exp-operator', 'hbar'])
    expect(ids('e^{-i\\theta\\hat n\\cdot\\vec\\sigma/2}')).toEqual(['exp-operator', 'sigma-dot'])
  })
})

describe('review #9 and #23: a gate letter is a gate only where it is one', () => {
  it('F5: X is a random variable in every formula of f5-spread (and nowhere in F5 is a letter a gate)', () => {
    const f5 = corpusSites().filter((s) => s.chapter === 'F5')
    expect(f5.length).toBeGreaterThan(50)
    for (const s of f5) for (const m of marksOf(s.tex, true)) expect(m.ctx.m, `F5 ${s.where}: ${s.tex}`).not.toBe('gate')
    for (const p of ['F5 f5-spread:b1', 'F5 f5-spread:b1.derivation.ground[2]', 'F5 f5-spread.books[0]', 'F5 f5-spread.review', 'F5 f5-spread.play.f5-s-die-sd.hints[1]']) {
      expect(sitesAt('F5', p.split(' ')[1]).length, p).toBeGreaterThan(0)
    }
  })
  it('Q10 |X| = 2, |∑P X| and Q12 Tr(X^{T_B}Y) have no gates (arbitrary values and operators)', () => {
    for (const tex of ['|X| = 2', '|S| = |\\sum P\\,X| \\le 2', '|S| = |\\sum P(\\cdots)X| \\le \\sum P(\\cdots)\\cdot2 = 2', '\\mathrm{Tr}(X^{T_B}Y) = \\mathrm{Tr}(XY^{T_B})'])
      expect(marksOf(tex, true).filter((m) => m.ctx.m === 'gate'), tex).toEqual([])
    for (const p of ['Q10 q10-hidden:b2.derivation.ground[3]', 'Q10 q10-hidden.play.q10-h-max', 'Q10 q10-chsh:b2', 'Q10 q10-chsh', 'Q12 q12-witness.review'])
      for (const { mark, site } of listed([p])) expect(mark.ctx.m, `${p}: ${site.tex}`).not.toBe('gate')
  })
  it('Q7 labels P_{XXX}, P_{YYX}, \\hat O_{XYY} are subscripts, not NOT gates', () => {
    for (const tex of ['P_{XXX}(\\text{even}) = \\tfrac14', 'P_{YYX}(\\text{odd}) = \\tfrac14', '\\hat O_{XYY}', '\\langle(\\Delta\\hat O_{XXX})^2\\rangle = 0'])
      expect(marksOf(tex, true).filter((m) => m.ctx.m === 'gate'), tex).toEqual([])
    for (const p of ['Q7 q7-bit-strings:b1.derivation', 'Q7 q7-bit-strings.review', 'Q7 q7-observables.review', 'Q7 q7-observables:b1', 'Q7 q7-observables:b6']) {
      const [chapter, where] = p.split(' ')
      const sites = sitesAt(chapter, where)
      expect(sites.length, p).toBeGreaterThan(0)
      for (const site of sites) if (/_\{[XYZ]{2,3}\}/.test(site.tex)) expect(marksOf(site.tex, true).filter((m) => m.ctx.m === 'gate'), `${p}: ${site.tex}`).toEqual([])
    }
  })
  it('the real gates are still gates: X|0⟩, XXX|000⟩, X^2 = I, X⊗Z, H^{⊗n}|0⟩, ⟨X⊗X⟩, Z⊗I', () => {
    for (const tex of ['X|0\\rangle = |1\\rangle', 'XXX|000\\rangle = |111\\rangle', 'X^2 = I', 'X\\otimes Z', 'H^{\\otimes n}|0\\rangle', '\\langle X\\otimes X\\rangle', 'Z\\otimes I', 'HXH = Z', 'X = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}'])
      expect(marksOf(tex, true).some((m) => m.ctx.m === 'gate'), tex).toBe(true)
  })
  it('across 709, a gate mark never sits on a letter inside a subscript or an exponent', () => {
    let formulas = 0
    for (const s of corpusSites()) {
      if (!gatesOf(s.chapter)) continue
      formulas++
      expect(gateMarksInScripts(markNotation(s.tex, { gates: true })), `${s.chapter} ${s.where}: ${s.tex}`).toEqual([])
    }
    expect(formulas).toBeGreaterThan(5000)
  })
})

/** The gate marks (m=gate) that sit inside a `_{…}` or `^{…}` group of marked TeX. */
function gateMarksInScripts(marked: string): string[] {
  const out: string[] = []
  const stack: boolean[] = [] // per open brace: is it a script group, or inside one?
  for (let i = 0; i < marked.length; i++) {
    const ch = marked[i]
    if (ch === '\\') {
      const m = /^\\htmlData\{notation=(pauli-[xyz]|hadamard|identity)((?:,[a-z]+=[A-Za-z0-9.]*)*)\}/.exec(marked.slice(i, i + 120))
      if (m && /,m=gate/.test(m[2]) && stack.some(Boolean)) out.push(m[1])
      i++
    } else if (ch === '{') stack.push(stack.some(Boolean) || /[_^]\s*$/.test(marked.slice(Math.max(0, i - 4), i)))
    else if (ch === '}') stack.pop()
  }
  return out
}

describe('review #10: Tr with a subscript is the PARTIAL trace', () => {
  it('every Tr_B, Tr_2, Tr_3 of the course gets the partial-trace card, whose result is an operator', () => {
    let n = 0
    for (const s of corpusSites()) {
      if (!/\\(?:mathrm|operatorname)\{[Tt]r\}_/.test(s.tex)) continue
      const m = marksOf(s.tex, gatesOf(s.chapter))
      expect(m.map((x) => x.id), `${s.chapter} ${s.where}: ${s.tex}`).toContain('partial-trace')
      for (const x of m.filter((y) => y.id === 'partial-trace')) {
        n++
        expect(sentence(s, x), s.tex).toMatch(/trace out the part .* operator on the rest/)
        expect(sentence(s, x)).not.toMatch(/diagonal/)
      }
    }
    expect(n).toBeGreaterThan(20)
    for (const p of ['Q9 q9-partial-trace:b1', 'Q9 q9-partial-trace:b4.derivation', 'Q10 q10-no-signal', 'Q11 q11-swapping'])
      if (sitesAt(p.split(' ')[0], p.split(' ')[1]).length) expect(listed([p]).length).toBeGreaterThan(-1)
  })
  it('the full trace stays the full trace, a single number', () => {
    expect(ids('\\mathrm{Tr}(\\rho A)')).toEqual(['trace'])
    expect(ids('\\mathrm{Tr}\\,\\rho_A^2')).toEqual(['trace'])
    expect(ids('\\mathrm{Tr}_B\\,\\rho')).toEqual(['partial-trace'])
    expect(marksOf('\\mathrm{Tr}_B\\,\\rho', false)[0].ctx).toEqual({ a: 'B', of: '\\rho' })
  })
})

describe('review #11: the hat on c in F8 is the Fourier transform, not a unit vector', () => {
  it('no hat on c, f or g ever says "a direction of length 1"; F8 says Fourier', () => {
    let f8 = 0
    for (const { site, mark } of corpusMarks()) {
      if (mark.id !== 'hat') continue
      const s = sentence(site, mark)
      if (/^[cfg]$/.test(mark.ctx.of ?? '')) {
        expect(s, `${site.chapter} ${site.where}: ${site.tex}`).toMatch(/Fourier transform/)
        expect(s).not.toMatch(/direction/)
        if (site.chapter === 'F8') f8++
      }
      if (/^[A-Z]$/.test(mark.ctx.of ?? '')) expect(s).toMatch(/an operator/)
    }
    expect(f8).toBeGreaterThanOrEqual(8)
    for (const p of ['F8 f8-dft:b1', 'F8 f8-dft:b3.derivation', 'F8 f8-dft.visual.tryThis[0]', 'F8 f8-dft.play.f8-d-shift']) expect(sitesAt(p.split(' ')[0], p.split(' ')[1]).length, p).toBeGreaterThan(0)
  })
  it('n̂, r̂, x̂, ŷ, ẑ are still unit vectors', () => {
    const one = (tex: string) => flat(NOTATION_BY_ID.get('hat')!.here?.(marksOf(tex, false)[0].ctx, 'ground'))
    for (const l of ['n', 'r', 'x', 'y', 'z']) expect(one(`\\hat ${l}`)).toContain('direction of length 1')
  })
})

describe('review #14: H^{⊗n} is applied to n qubits', () => {
  it('every H with a tensor power says "each of n qubits"; a lone H says one qubit', () => {
    let n = 0
    for (const { site, mark } of corpusMarks()) {
      if (mark.id !== 'hadamard' && !/^pauli-[xyz]$/.test(mark.id)) continue
      if (mark.ctx.m !== 'gate') continue
      const s = sentence(site, mark)
      if (mark.ctx.of) {
        n++
        expect(s, `${site.chapter} ${site.where}: ${site.tex}`).toMatch(/applied to each of .* qubits/)
        expect(s).not.toMatch(/one qubit/)
      } else expect(s).toMatch(/acting on one qubit/)
    }
    expect(n).toBeGreaterThanOrEqual(8)
    for (const p of ['Q16 q16-hadamard-n:b2.derivation']) expect(sitesAt(p.split(' ')[0], p.split(' ')[1]).length, p).toBeGreaterThan(0)
  })
})

describe('review #15: the operand keeps its scripts and is never a raw \\begin', () => {
  it('\\det S_x, \\det B_{z\\leftarrow x}, \\det R_z, \\det A_{jk}', () => {
    const of = (tex: string, id: string) => marksOf(tex, false).find((m) => m.id === id)?.ctx.of
    expect(of('\\det S_x', 'det')).toBe('S_x')
    expect(of('\\det B_{z\\leftarrow x}', 'det')).toBe('B_{z\\leftarrow x}')
    expect(of('\\det R_z', 'det')).toBe('R_z')
    expect(of('\\det A_{jk}', 'det')).toBe('A_{jk}')
    expect(of('\\det\\hat A', 'det')).toBe('\\hat A')
    expect(of('\\mathrm{Tr}\\sqrt{M}', 'trace')).toBe('\\sqrt{M}')
    expect(of('\\det\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}', 'det')).toBe('\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}')
  })
  it('every captured piece of TeX in the course renders as maths, never as red error text', () => {
    const seen = new Set<string>()
    const bad: string[] = []
    for (const { site, mark } of corpusMarks())
      for (const v of Object.values(mark.ctx)) {
        if (!v || seen.has(v)) continue
        seen.add(v)
        if (/tex-user-error/.test(renderUserTex(v))) bad.push(`${site.chapter} ${site.where} ${mark.id}: ${v}`)
      }
    expect(seen.size).toBeGreaterThan(1000)
    expect(bad.slice(0, 10)).toEqual([])
  })
  it('no captured value is a bare control word that needs an argument', () => {
    const NEEDS = /^\\(?:begin|end|hat|vec|bar|tilde|dot|frac|sqrt|binom|mathbf|mathrm|boldsymbol|operatorname|text|left|right)$/
    for (const { site, mark } of corpusMarks()) for (const [k, v] of Object.entries(mark.ctx)) expect(v ?? '', `${site.chapter} ${site.where} ${mark.id}.${k}: ${site.tex}`).not.toMatch(NEEDS)
  })
})

describe('review #16 and #18: ⟨b|_B ρ |b⟩_B, populations, and the Formal "matrix element"', () => {
  const sand = (tex: string, track: 'ground' | 'formal' = 'ground') => {
    const m = marksOf(tex, true).find((x) => x.id === 'sandwich')!
    return { m, text: flat(NOTATION_BY_ID.get('sandwich')!.here?.(m.ctx, track)) }
  }
  it('a bra with a subscript is a partial matrix element: the scripts do not leak into M', () => {
    const { m, text } = sand('\\langle b|_B\\,\\rho\\,|b\\rangle_B')
    expect(m.ctx).toMatchObject({ m: '\\rho', a: 'b', b: 'b', lo: 'B' })
    expect(text).toBe('This sandwiches $\\rho$ between the state $b$ of the part $B$ only. What is left is an operator on the other part, not one number.')
    for (const { site, mark } of listed(['Q9 q9-partial-trace:b1.derivation.ground[3]', 'Q9 q9-partial-trace:b1.derivation.formal[0]', 'Q9 q9-partial-trace.review'], 'sandwich')) {
      expect(mark.ctx.m, site.tex).not.toMatch(/^_/)
      expect(sentence(site, mark), site.tex).not.toMatch(/average/)
    }
  })
  it('⟨0|ρ|0⟩ is the chance of finding |0⟩, not "the average of ρ"', () => {
    expect(sand('\\langle 0|\\rho|0\\rangle').text).toBe('The chance of finding the state $0$ when the system is in the mixed state $\\rho$.')
    expect(sand('\\langle\\psi|M|\\psi\\rangle').text).toBe('The average of $M$ in the state $\\psi$.')
  })
  it('Formal: the (a, b) matrix element of M; Ground-up keeps "turns"', () => {
    expect(sand('\\langle i|\\hat A|j\\rangle', 'formal').text).toBe('The ($i$, $j$) matrix element of $\\hat A$.')
    expect(sand('\\langle i|\\hat A|j\\rangle', 'ground').text).toContain('turns the state')
  })
})

describe('review #17: a square grid is not always an operator, and 448 speaks of spins', () => {
  const matrix = (r: number, q: number, course?: 'sl448' | 'qc709') => flat(NOTATION_BY_ID.get('matrix')!.here?.({ lo: String(r), hi: String(q) }, 'ground', course))
  it('a 2 × 2 grid is "a grid of numbers", an operator only when it acts on states', () => {
    expect(matrix(2, 2)).toBe('A 2 × 2 grid of numbers. When it acts on states, it is an operator on a space of 2 states.')
  })
  it('Spin Lab says "a spin state", Physics 709 says "a state of 1 qubit"', () => {
    expect(matrix(2, 1, 'sl448')).toBe('A column of 2 numbers: a list, such as a spin state.')
    expect(matrix(4, 1, 'sl448')).toBe('A column of 4 numbers: a list, such as a state of 2 spins.')
    expect(matrix(2, 1, 'qc709')).toBe('A column of 2 numbers: a list, such as a state of 1 qubit.')
  })
  it('no card in the 448 chapters says "qubit"', () => {
    for (const { site, mark } of corpusMarks()) if (courseOfId(site.chapter) === 'sl448') expect(sentence(site, mark), `${site.chapter} ${site.where}: ${site.tex}`).not.toMatch(/qubit/i)
  })
})
