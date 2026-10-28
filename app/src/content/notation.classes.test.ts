/**
 * The failure classes of the independent review (docs/roles/audits/notation-review.md #7-#11, #14-#18, #23), each run over the
 * WHOLE course through the real path (the pre-processor, then the dictionary's sentence for the spot): the class no longer
 * appears where the review found it, and the sites the review listed are named here so they stay fixed.
 * Sites are written `chapter place` as the review wrote them (`L7 l7-uncertainty:b4`).
 */
import { describe, expect, it, vi } from 'vitest'
import { corpusMarks, corpusSites, gatesOf, marksOf, vocabOf, type FoundMark, type Site } from '../ui/notationCorpus.testkit'
import { markNotation, type NotationOpts } from '../ui/notationMark'
import { renderUserTex } from '../ui/tex'
import { chapterVocab } from './notationVocab'
import { QC_CHAPTERS } from './qc709/index'
import { courseOfId } from './courses'
import { NOTATION_BY_ID, taughtBridge } from './notation'
import type { Seg } from './notationKit'

// Every test here scans the whole course (or the whole built JS), so the file gets a 60 s limit instead of vitest's 5 s
// default: the scans grew with the courses and timed out under load (the CI runner, two agents building in parallel).
vi.setConfig({ testTimeout: 60_000 })

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
    for (const site of sites) for (const mark of marksOf(site.tex, gatesOf(site.chapter), vocabOf(site.chapter))) if (!id || mark.id === id) out.push({ site, mark })
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
    'L5 l5-invariance:b6', 'L6 l6-generator', 'L6 l6-generator:b6a', 'L6 l6-generator.lecture', 'L6 l6-generator.lecture.equations[0]', 'L6 l6-generator.play.l6-g-small-form.options[0]',
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
      const marks = sites.flatMap((site) => marksOf(site.tex, gatesOf(chapter), vocabOf(chapter)).map((mark) => ({ site, mark })))
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
      const m = marksOf(s.tex, gatesOf(s.chapter), vocabOf(s.chapter))
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

describe('Q18 review #3: the bit dot product and the size of a set', () => {
  const BITS = (tex: string) => markNotation(tex, { bits: true })
  const isBits = (tex: string) => markNotation(tex, { bits: true }).includes('m=bits')
  const bitDot = (site: Site, m: FoundMark) => /bit dot product.*keep only whether the sum is odd/.test(sentence(site, m))

  it('between bit strings or bit variables a chapter that uses the bit dot product says so; elsewhere a dot stays a dot', () => {
    for (const tex of ['y \\cdot s = 0', '110 \\cdot x', 'x\\cdot 101', '(z\\oplus s)\\cdot y', 'a\\cdot x \\oplus b', '(-1)^{z\\cdot y}', '110 \\cdot 011 = 1', 'x_j\\cdot z_j', 'x\\cdot 0'])
      expect(isBits(tex), tex).toBe(true)
    // an ordinary product keeps the plain dot: two single bits, numbers, angles, names, powers, a call
    for (const tex of ['1\\cdot0 + 1\\cdot1', '5 \\cdot 6/2', '3 \\cdot 21 + 1', '225°\\cdot y', '180°\\cdot a/8', 'a\\cdot bi', 'bi\\cdot a', '2\\cdot2^{-(n+1)/2}', '0.75 \\cdot 0.5', 'x\\cdot z^2', 'f(x\\oplus y)\\cdot z', 'X\\cdot Z', '\\hat n\\cdot\\vec\\sigma'])
      expect(isBits(tex), tex).toBe(false)
    // and a chapter that never uses it is untouched, whatever the letters
    expect(markNotation('y \\cdot s = 0', {}).includes('m=bits')).toBe(false)
    expect(BITS('y \\cdot s = 0')).toContain('notation=cdot')
  })

  it('only F7, Q16 and Q18 read their text as using the bit dot product (they link the glossary entry qc-bit-dot)', () => {
    const chapters = corpusSites().map((s) => s.chapter)
    const bits = [...new Set(chapters)].filter((c) => vocabOf(c).bits)
    expect(bits.sort()).toEqual(['F7', 'Q16', 'Q18'])
    expect(vocabOf('F1').bits, 'F1 multiplies a·a').toBe(false)
    expect(vocabOf('F8').bits, 'F8 multiplies z·z').toBe(false)
  })

  it('every bit dot of Q18 says so, in both tracks; its plain products (5·6/2, 225°·y, 0.75·0.5, 3·21 + 1) do not', () => {
    const SITES = [
      'Q18 q18-simon:b3', 'Q18 q18-simon:b3.derivation', 'Q18 q18-simon:b3.derivation.ground[0]', 'Q18 q18-simon:b3.derivation.ground[1]', 'Q18 q18-simon:b3.derivation.ground[2]',
      'Q18 q18-simon:b3.derivation.formal[0]', 'Q18 q18-simon:b3.derivation.formal[1]', 'Q18 q18-simon:b3.derivation.formal[2]', 'Q18 q18-simon.review',
      'Q18 q18-simon.play.q18-s-perp.hints[0]', 'Q18 q18-simon.play.q18-s-perp.walkthrough[0]',
    ]
    const hits = listed(SITES, 'cdot')
    expect(hits.length).toBeGreaterThan(14)
    for (const { site, mark } of hits) {
      if (/^2\\cdot2/.test(site.tex)) continue // 2·2^{−(n+1)/2}: a plain product
      expect(mark.ctx.m, `${site.where}: ${site.tex}`).toBe('bits')
      expect(bitDot(site, mark), `${site.where}: ${site.tex}`).toBe(true)
    }
    for (const place of ['Q18 q18-simon:b5', 'Q18 q18-qft:b2', 'Q18 q18-qft:b5', 'Q18 q18-counting:b4', 'Q18 q18-qft.play.q18-q-gates.walkthrough[0]', 'Q18 q18-order.play.q18-o-27.walkthrough[0]'])
      for (const { site, mark } of listed([place], 'cdot')) {
        expect(mark.ctx.m, `${site.where}: ${site.tex}`).toBeUndefined()
        expect(sentence(site, mark), site.tex).toBe('')
      }
  })

  it('F7 and Q16 say it too, and no dot outside those three chapters is called the bit dot product', () => {
    let n = 0
    for (const { site, mark } of corpusMarks()) {
      if (mark.id !== 'cdot') continue
      if (mark.ctx.m === 'bits') {
        n++
        expect(['F7', 'Q16', 'Q18'], `${site.chapter} ${site.where}: ${site.tex}`).toContain(site.chapter)
        expect(bitDot(site, mark), `${site.chapter} ${site.where}: ${site.tex}`).toBe(true)
      } else expect(sentence(site, mark), `${site.chapter} ${site.where}`).not.toMatch(/bit dot/)
    }
    expect(n).toBeGreaterThan(100)
  })

  it('the card links to the unit that teaches it, F7.3, only for the bit dot', () => {
    const cdot = NOTATION_BY_ID.get('cdot')!
    expect(taughtBridge(cdot, 'qc709', { m: 'bits' })?.target).toMatchObject({ unit: 'f7-xor', lecture: 'F7', label: 'The bit dot product' })
    expect(taughtBridge(cdot, 'qc709', { m: 'bits' })?.id).toBe('qc-nt-cdot-f7-xor')
    expect(taughtBridge(cdot, 'qc709'), 'an ordinary dot has no link').toBeNull()
    expect(taughtBridge(cdot, 'sl448'), 'nor in Spin Lab').toBeNull()
    // the unit really writes it: f7-xor carries bit-dot marks
    const written = corpusMarks().some(({ site, mark }) => site.chapter === 'F7' && /^f7-xor/.test(site.where) && mark.id === 'cdot' && mark.ctx.m === 'bits')
    expect(written).toBe(true)
  })

  it('|G| and |K| of the hidden subgroup problem count elements; |S| of CHSH is still a size', () => {
    expect([...chapterVocab(QC_CHAPTERS.find((l) => l.id === 'Q18')!).sets].sort()).toEqual(['G', 'K'])
    const q18 = listed(['Q18 q18-order:b4'], 'abs')
    expect(q18.map(({ mark }) => mark.ctx.of)).toEqual(['G', 'K'])
    for (const { site, mark } of q18) {
      expect(mark.ctx.m).toBe('set')
      expect(sentence(site, mark)).toBe(`The number of elements of $${mark.ctx.of}$.`)
    }
    // the same bars around a number or a quantity stay a size
    for (const { site, mark } of listed(['Q10 q10-chsh:b2', 'Q10 q10-hidden:b2.derivation.ground[3]', 'Q15 q15-e91:b2'], 'abs')) {
      expect(mark.ctx.m, site.tex).toBeUndefined()
      expect(sentence(site, mark), site.tex).toMatch(/^The size of/)
    }
    // across the course only G and K are sets
    for (const { site, mark } of corpusMarks()) if (mark.ctx.m === 'set') expect(site.chapter + ' ' + mark.ctx.of, site.tex).toMatch(/^Q18 [GK]$/)
    expect(markNotation('|K| = 2', { sets: new Set(['K']) })).toContain('m=set')
    expect(markNotation('|K| = 2', {})).not.toContain('m=set')
  })
})

describe('review #22: the universal notation that was never marked', () => {
  const idsOf = (tex: string, opts: Pick<NotationOpts, 'spin'> = {}) => marksOf(tex, false, opts).map((m) => m.id)
  const markOf = (tex: string, id: string, opts: Pick<NotationOpts, 'spin'> = {}) => marksOf(tex, false, opts).find((m) => m.id === id)
  const chaptersOf = (id: string) => [...new Set(corpusMarks().filter((x) => x.mark.id === id).map((x) => x.site.chapter))]
  /** Occurrences of `re` in the corpus's TeX against the marks of `ids` on the same spans: no occurrence goes unmarked. */
  function coverage(re: RegExp, ids: readonly string[]): { n: number; missed: string[] } {
    let n = 0
    const missed: string[] = []
    for (const site of corpusSites()) {
      const k = [...site.tex.matchAll(re)].length
      if (!k) continue
      n += k
      const marks = marksOf(site.tex, gatesOf(site.chapter), vocabOf(site.chapter)).filter((m) => ids.includes(m.id)).length
      if (marks < k) missed.push(`${site.chapter} ${site.where}: ${site.tex}`)
    }
    return { n, missed }
  }

  describe('spin components S_x, S_y, S_z', () => {
    it('S_x, S_y, S_z are always a spin component (with a hat, a power or a dagger too); S_i, S_n, S_{\\hat n} only where the chapter writes the spin', () => {
      for (const tex of ['S_z', 'S_{x}', '\\hat S_z', '\\langle S_x\\rangle', 'S_y^\\dagger = S_y', 'S_z^2 = \\tfrac{\\hbar^2}{4}I']) expect(idsOf(tex), tex).toContain('spin-component')
      expect(markOf('S_{x}', 'spin-component')?.ctx).toEqual({ a: 'x' })
      for (const tex of ['S_i', 'S_n', 'S_{\\hat n}', 'S_{\\hat m}', '[S_j, S_k]']) {
        expect(idsOf(tex), `${tex} in a chapter that never writes S_x`).not.toContain('spin-component')
        expect(idsOf(tex, { spin: true }), tex).toContain('spin-component')
      }
      expect(markOf('S_{\\hat n}', 'spin-component', { spin: true })?.ctx).toEqual({ a: '\\hat n' })
    })
    it('Q10 and Q15 write S for the CHSH number, and nothing about it is a spin component', () => {
      for (const tex of ['S_\\chi = 2\\sqrt2 > 2', 'S_{\\text{product}} \\le 2', '|S| \\le 2', "S = E(a,b) - E(a,b')", 'S_1 + S_2']) {
        expect(idsOf(tex, { spin: true }), tex).not.toContain('spin-component')
        expect(idsOf(tex), tex).not.toContain('spin-component')
      }
      expect(vocabOf('Q10').spin).toBe(false)
      expect(vocabOf('Q15').spin).toBe(false)
      for (const c of ['Q10', 'Q15', 'Q9', 'Q14', 'Q16', 'Q17', 'Q18', 'F7', 'F8']) expect(chaptersOf('spin-component'), c).not.toContain(c)
    })
    it('across the course: every S_x, S_y, S_z is marked, in 15 or more chapters; the other subscripts only in chapters that write the spin', () => {
      const cov = coverage(/(?<![A-Za-z\\])S_\{?[xyz]\}?/g, ['spin-component'])
      expect(cov.n).toBeGreaterThan(500)
      expect(cov.missed.slice(0, 5).join('\n'), `${cov.missed.length} spans`).toBe('')
      expect(chaptersOf('spin-component').length).toBeGreaterThanOrEqual(15)
      for (const { site, mark } of corpusMarks()) {
        if (mark.id !== 'spin-component') continue
        const a = mark.ctx.a ?? ''
        if (!/^[xyz]$/.test(a)) expect(vocabOf(site.chapter).spin, `${site.chapter} ${site.where}: ${site.tex}`).toBe(true)
        expect(sentence(site, mark), `${site.chapter} ${site.where}`).toMatch(/^Here: the spin along (?:the \$[xyz]\$ axis|axis \$[ijk]\$, any one of x, y, z|the direction \$.+\$)\./)
      }
    })
  })

  describe('the cross product ×', () => {
    it('× between vectors is the cross product; between numbers, sizes and sets it is plain multiplication and stays unmarked', () => {
      for (const tex of ['\\hat n\\times\\hat m', '\\vec a\\times\\vec b', '\\hat z\\times\\vec r', '\\mathbf a\\times\\mathbf b', '\\vec{a}_1 \\times \\vec{b}', '(\\hat a\\times\\hat b)\\cdot\\vec S'])
        expect(idsOf(tex), tex).toContain('cross')
      for (const tex of ['\\tfrac12 \\times \\tfrac12', '2\\times2', '2 \\times 10^{-9}', 'i \\times (3 + 4i)', '\\hat P \\times 0.6', 'd_1\\times d_2', 'm \\times n', '0.6 \\times 0.6', 'N \\times N', '2 \\times 2 \\times 2 = 8'])
        expect(idsOf(tex), tex).not.toContain('cross')
    })
    it('across the course only L6, L7 and Q24 (the Bloch vector turning in a field, Eq. 12.10) cross vectors; every other × (150 or more) is a product of numbers and stays unmarked', () => {
      expect(chaptersOf('cross').sort()).toEqual(['L6', 'L7', 'Q24'])
      let plain = 0
      for (const { site, mark } of corpusMarks()) if (mark.id === 'cross') expect(site.tex, `${site.chapter} ${site.where}`).toMatch(/\\(?:hat|vec|mathbf)/)
      for (const site of corpusSites()) if (/\\times/.test(site.tex) && !/\\(?:hat|vec|mathbf)/.test(site.tex)) plain++
      expect(plain).toBeGreaterThan(150)
    })
  })

  describe('the signs ≠, ≤, ≥', () => {
    it('each spelling of the three is marked, and the strict signs and = are not', () => {
      expect(idsOf('a \\ne b, a \\neq b')).toEqual(['not-equal', 'not-equal'])
      expect(idsOf('a \\le b, a \\leq b')).toEqual(['at-most', 'at-most'])
      expect(idsOf('a \\ge b, a \\geq b')).toEqual(['at-least', 'at-least'])
      for (const tex of ['a < b', 'a > b', 'a = b', 'a \\lt b', 'a \\ll b', 'a \\gg b']) expect(idsOf(tex), tex).toEqual([])
    })
    it('the limits of a sum are still read whole', () => {
      const sum = markOf('\\sum_{1\\le i\\le n} a_i', 'sum')
      expect(sum?.ctx.lo).toBe('1\\le i\\le n')
      expect(idsOf('\\sum_{1\\le i\\le n} a_i')).toEqual(['sum', 'at-most', 'at-most'])
    })
    it('across the course: every ≠, ≤, ≥ is marked, each in 15 or more chapters', () => {
      for (const [re, id] of [[/\\neq?(?![A-Za-z])/g, 'not-equal'], [/\\leq?(?![A-Za-z])/g, 'at-most'], [/\\geq?(?![A-Za-z])/g, 'at-least']] as const) {
        const cov = coverage(re, [id])
        expect(cov.n, id).toBeGreaterThan(100)
        expect(cov.missed.slice(0, 5).join('\n'), `${id}: ${cov.missed.length} spans`).toBe('')
        expect(chaptersOf(id).length, id).toBeGreaterThanOrEqual(15)
      }
    })
  })

  describe('the spread ΔA', () => {
    it('Δ before an observable or a random variable is a spread, and says of what', () => {
      for (const [tex, of] of [['\\Delta A', 'A'], ['(\\Delta A)^2', 'A'], ['\\Delta S_z', 'S_z'], ['\\Delta S_{\\hat n}', 'S_{\\hat n}'], ['\\Delta\\hat O', '\\hat O'], ['\\Delta\\sigma_i', '\\sigma_i'], ['\\Delta X', 'X'], ['\\Delta\\bar X', '\\bar X'], ['\\Delta B/\\sqrt N', 'B']] as const)
        expect(markOf(tex, 'spread')?.ctx, tex).toEqual({ of })
      // the position-momentum pair, but not Δx or Δp on their own
      expect(idsOf('\\Delta x\\,\\Delta p_x \\ge \\hbar/2').filter((i) => i === 'spread')).toHaveLength(2)
    })
    it('Δ as a gap, an angle, a distance or an energy difference is not a spread', () => {
      for (const tex of ['\\Delta z = \\tfrac12 a t^2', '\\Delta\\varphi = 120^\\circ', '\\Delta\\chi = \\chi - \\chi_a', '-\\Delta \\le \\Delta z \\le \\Delta', '\\Delta E = \\hbar\\omega', '\\Delta x = 3', '\\Delta p', '\\Delta', '\\Delta t'])
        expect(idsOf(tex), tex).not.toContain('spread')
    })
    it("across the course: spreads in L3, L7, L8, L13, F5, Q3, Q7, and none in Q1 (Δz, the spot spacing) or on L7's Δφ and L8's Δχ", () => {
      expect(chaptersOf('spread').sort()).toEqual(['F5', 'L13', 'L3', 'L7', 'L8', 'Q3', 'Q7'])
      for (const { site, mark } of corpusMarks())
        if (mark.id === 'spread') {
          expect(mark.ctx.of ?? '', `${site.chapter} ${site.where}: ${site.tex}`).toMatch(/^(?:[A-Z]|\\hat [A-Z]|\\bar [A-Z]|\\sigma|x|p)/)
          expect(sentence(site, mark)).toMatch(/^Here: the spread of \$/)
        }
      for (const site of corpusSites()) if (/\\Delta\s*(?:z|\\varphi|\\chi)/.test(site.tex)) expect(marksOf(site.tex, gatesOf(site.chapter), vocabOf(site.chapter)).map((m) => m.id), site.tex).not.toContain('spread')
    })
  })

  describe('rotations R_z, R_x, R_y, R_n', () => {
    it('R with an axis is a rotation, with its angle when one follows; R_k, R_{pol}, R_θ and reflections are not', () => {
      expect(markOf('R_z(\\varphi)', 'rotation')?.ctx).toEqual({ a: 'z', of: '\\varphi' })
      expect(markOf('R_n(\\theta)', 'rotation')?.ctx).toEqual({ a: 'n', of: '\\theta' })
      expect(markOf('R_{\\hat n}(\\chi)', 'rotation')?.ctx).toEqual({ a: '\\hat n', of: '\\chi' })
      expect(markOf('R_x(\\pi/2)^2 = R_x(\\pi)', 'rotation')?.ctx).toEqual({ a: 'x', of: '\\pi/2' })
      expect(markOf('R_z', 'rotation')?.ctx).toEqual({ a: 'z' })
      for (const tex of ['R_k = \\mathrm{diag}(1, e^{2\\pi i/2^k})', 'R_{\\mathrm{pol}}(\\varphi)', 'R_\\theta', 'R_{w_0}R_{x_0^\\perp}', 'R_\\beta = \\cos2\\beta\\,Z + \\sin2\\beta\\,X', 'R_2 = S', 'R(2\\alpha)', 'R^\\dagger R'])
        expect(idsOf(tex), tex).not.toContain('rotation')
    })
    it('across the course: every R_x, R_y, R_z, R_n is marked; L8, F3, Q17 and Q18 have none; the card names the operator exponential', () => {
      const cov = coverage(/(?<![A-Za-z\\])R_\{?[xyzn]\}?(?![A-Za-z0-9_\\])/g, ['rotation'])
      expect(cov.n).toBeGreaterThan(100)
      expect(cov.missed.slice(0, 5).join('\n'), `${cov.missed.length} spans`).toBe('')
      const chs = chaptersOf('rotation')
      expect(chs.length).toBeGreaterThanOrEqual(7)
      for (const c of ['L8', 'F3', 'Q17', 'Q18']) expect(chs, c).not.toContain(c)
      for (const { site, mark } of corpusMarks()) if (mark.id === 'rotation') expect(sentence(site, mark), `${site.chapter} ${site.where}`).toMatch(/^Here: a turn about (?:the \$[xyzn]\$ axis|the direction \$.+\$)(?: through the angle \$.+\$)?\.$/)
      const rot = NOTATION_BY_ID.get('rotation')!
      expect(rot.physics).toMatch(/exponential of an operator/)
      expect(NOTATION_BY_ID.get('exp-operator')!.name).toMatch(/Exponential of an operator/)
      expect(rot.taught.sl448, 'the link goes where the operator exponential is derived').toBe(NOTATION_BY_ID.get('exp-operator')!.taught.sl448)
    })
  })

  describe('bold vectors', () => {
    it('\\mathbf r is the vector r⃗, \\boldsymbol\\sigma is σ⃗, and \\mathbf n·\\boldsymbol\\sigma is the spin matrix along n', () => {
      expect(markOf('\\mathbf r', 'vec')?.ctx).toEqual({ of: 'r' })
      expect(markOf('\\mathbf{n}', 'vec')?.ctx).toEqual({ of: 'n' })
      expect(idsOf('\\mathbf r_A')).toEqual(['vec'])
      expect(idsOf('|\\mathbf r|^2')).toEqual(['abs', 'vec'])
      expect(idsOf('\\boldsymbol\\sigma')).toEqual(['sigma-vec'])
      expect(idsOf('\\bm{\\sigma}')).toEqual(['sigma-vec'])
      expect(markOf('\\mathbf n\\cdot\\boldsymbol\\sigma', 'sigma-dot')?.ctx).toEqual({ a: '\\mathbf n' })
      expect(idsOf('e^{-i\\theta\\,\\mathbf n\\cdot\\boldsymbol\\sigma/2}')).toEqual(['exp-operator', 'sigma-dot'])
    })
    it('a bold capital (the integers mod N), a bold word, bold μ and bold σ_x are not vectors', () => {
      for (const tex of ['\\mathbf Z_N = \\{0,\\dots,N-1\\}', '\\mathbf{ab}', '\\boldsymbol\\mu', '\\mathbf{\\sigma_x}', '\\mathbf{1}']) expect(idsOf(tex), tex).toEqual([])
    })
    it('across the course: every bold vector is a vec or part of a sigma-dot, in 5 chapters', () => {
      const cov = coverage(/\\mathbf\s*\{?[a-z]\}?/g, ['vec', 'sigma-dot'])
      expect(cov.n).toBeGreaterThan(150)
      expect(cov.missed.slice(0, 5).join('\n'), `${cov.missed.length} spans`).toBe('')
      const cov2 = coverage(/\\boldsymbol\s*\{?\\sigma\}?/g, ['sigma-vec', 'sigma-dot'])
      expect(cov2.n).toBeGreaterThan(20)
      expect(cov2.missed.slice(0, 5).join('\n'), `${cov2.missed.length} spans`).toBe('')
      expect(new Set([...chaptersOf('vec'), ...chaptersOf('sigma-dot')].filter((c) => ['Q8', 'Q9', 'Q13', 'F4', 'F6'].includes(c))).size).toBe(5)
    })
  })
})
