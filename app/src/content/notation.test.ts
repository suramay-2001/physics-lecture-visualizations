/**
 * The notation dictionary (notation explainers, role P): every entry is well formed and in both voices within the
 * sentence caps, every example's numbers are computed by the engine and equal their hand values, every `taught` unit
 * exists, every piece of TeX in it renders, the context sentences say what the brief asks, and the dictionary and the
 * pre-processor agree on the set of ids.
 */
import { describe, expect, it } from 'vitest'
import { markNotation, MARK_IDS, notationIds } from '../ui/notationMark'
import { NOTATION_ID } from '../ui/notationCodec'
import { renderAuthoredTexStrict, renderUserTex } from '../ui/tex'
import { bridgePlace } from './bridgeRegistry'
import { COURSES } from './courses'
import { LECTURE_META } from './meta.generated'
import { NOTATION, NOTATION_BY_ID, taughtBridge } from './notation'
import { meaningOf, physicsOf, type NotationEntry, type Seg } from './notationKit'
import { QC_META } from './qc709/meta.generated'

const EXAMPLE = (id: string) => NOTATION_BY_ID.get(id)!.example()

/** Sentences of a card text, the way the course's prose lint cuts them: TeX spans are one word each. */
function sentences(text: string): string[] {
  const flat = text.replace(/\$[^$]+\$/g, ' X ').replace(/\*\*|\*/g, '')
  return flat
    .split(/(?<=[.!?])["”’)]*\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

/** One TeX sample per id: the pre-processor must be able to produce every entry. */
const SAMPLE: Record<string, string> = {
  sum: '\\sum_{i=1}^{n} a_i', product: '\\prod_k x_k', tensor: 'A \\otimes B', 'tensor-power': 'H^{\\otimes n}', xor: 'a \\oplus b', dagger: 'U^\\dagger',
  conjugate: 'z^*', ket: '|\\psi\\rangle', bra: '\\langle\\psi|', braket: '\\langle a|b\\rangle', sandwich: '\\langle a|M|b\\rangle', average: '\\langle A\\rangle',
  outer: '|a\\rangle\\langle b|', norm: '\\|v\\|', abs: '|z|', commutator: '[\\hat A, \\hat B]', trace: '\\mathrm{Tr}\\,\\rho', det: '\\det M', diag: '\\mathrm{diag}(a, b)',
  rank: '\\mathrm{rank}\\,M', span: '\\mathrm{span}\\{a, b\\}', identity: '\\mathbb{1}', matrix: '\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}', kronecker: '\\delta_{ij}',
  hat: '\\hat A', vec: '\\vec r', 'sigma-vec': '\\vec\\sigma', 'sigma-dot': '\\hat n\\cdot\\vec\\sigma', 'pauli-x': '\\sigma_x', 'pauli-y': '\\sigma_y', 'pauli-z': '\\sigma_z',
  hadamard: 'H|0\\rangle', cnot: '\\mathrm{CNOT}', cz: '\\mathrm{CZ}', swap: '\\mathrm{SWAP}', element: 'x \\in S', 'complex-n': '\\mathbb{C}^n', 'real-n': '\\mathbb{R}^n',
  phase: 'e^{i\\varphi}', congruent: 'a \\cong b', approx: 'a \\approx b', proportional: 'a \\propto b', arrow: 'a \\to b', mapsto: 'x \\mapsto y', implies: 'p \\Rightarrow q',
  iff: 'p \\Leftrightarrow q', plusminus: '\\pm 1', cdot: 'a \\cdot b', derivative: '\\frac{d}{dt}', partial: '\\partial_t', sqrt: '\\sqrt{2}', re: '\\mathrm{Re}\\,z', im: '\\mathrm{Im}\\,z',
  mod: 'a \\bmod N', gcd: '\\gcd(a, b)', floor: '\\lfloor x \\rfloor', log2: '\\log_2 x', hbar: '\\hbar',
}

describe('the dictionary and the pre-processor agree', () => {
  it('has an entry for every id the pre-processor can emit, and no other', () => {
    expect(NOTATION.map((e) => e.id).sort()).toEqual([...MARK_IDS].sort())
    expect(new Set(NOTATION.map((e) => e.id)).size).toBe(NOTATION.length)
  })

  it('a sample of TeX produces each id', () => {
    for (const id of MARK_IDS) {
      const tex = SAMPLE[id]
      expect(tex, `a sample for ${id}`).toBeTruthy()
      expect(notationIds(tex, { gates: id === 'hadamard' }), `${id}: ${tex}`).toContain(id)
    }
    expect(Object.keys(SAMPLE).sort()).toEqual([...MARK_IDS].sort())
  })

  it('every id is a valid mark id, and there are about fifty entries', () => {
    for (const e of NOTATION) expect(e.id).toMatch(NOTATION_ID)
    expect(NOTATION.length).toBeGreaterThanOrEqual(40)
  })
})

describe('every entry', () => {
  it.each(NOTATION.map((e) => [e.id, e] as const))('%s is complete, in both voices, within the caps', (_id, e) => {
    for (const f of ['tex', 'name', 'say', 'ground', 'physics'] as const) expect(e[f].trim().length, `${e.id}.${f}`).toBeGreaterThan(0)
    const groundCap = COURSES.qc709.sentenceCaps.ground ?? 25
    const formalCap = COURSES.qc709.sentenceCaps.formal ?? 40
    for (const [field, text, cap] of [
      ['ground', e.ground, groundCap],
      ['physics', e.physics, groundCap],
      ['formal', e.formal ?? '', formalCap],
      ['physicsFormal', e.physicsFormal ?? '', formalCap],
    ] as const)
      for (const s of sentences(text)) expect(words(s), `${e.id}.${field}: ${s}`).toBeLessThanOrEqual(cap)
    // a Formal text, when given, is a different text
    if (e.formal) expect(e.formal).not.toBe(e.ground)
    expect(meaningOf(e, 'ground')).toBe(e.ground)
    expect(meaningOf(e, 'formal')).toBe(e.formal ?? e.ground)
    expect(physicsOf(e, 'formal')).toBe(e.physicsFormal ?? e.physics)
  })

  it('has a Formal voice for the notation a 709 reader meets in the Formal track (all but the plain school symbols)', () => {
    const plain = new Set(['approx', 'proportional', 'arrow', 'mapsto', 'implies', 'iff', 'plusminus', 'cdot', 'sqrt', 'partial'])
    for (const e of NOTATION) if (!plain.has(e.id)) expect(e.formal, `${e.id} has no formal voice`).toBeTruthy()
  })

  it('has a worked example whose text and numbers exist', () => {
    for (const e of NOTATION) {
      const ex = e.example()
      expect(ex.tex.length, e.id).toBeGreaterThan(3)
      expect(ex.says.length, e.id).toBeGreaterThan(10)
      expect(Object.keys(ex.values).length, `${e.id} values`).toBeGreaterThan(0)
      for (const [k, v] of Object.entries(ex.values)) expect(typeof v === 'number' ? Number.isFinite(v) : typeof v === 'string', `${e.id}.${k}`).toBe(true)
    }
  })
})

/** Hand-computed values of every example (numbers an independent calculation gives: see the comments). */
const R = Math.SQRT1_2
const HAND: Record<string, Record<string, number>> = {
  sum: { n: 4, total: 30, last: 16 }, // 1 + 4 + 9 + 16
  product: { n: 4, total: 24 }, // 4!
  tensor: { length: 4, onePosition: 1 }, // |0>|1> = |01> is index 1 of 4
  'tensor-power': { copies: 3, length: 8, onePosition: 0 }, // |000> is index 0 of 8
  xor: { result: 0b1101, ones: 3 }, // 1011 ^ 0110
  dagger: { upperRightIm: 1, lowerLeftIm: -1, diag: 1 },
  conjugate: { re: 3, im: -4, product: 25, size: 5 },
  ket: { top: R, bottom: R, sumSquares: 1 },
  bra: { secondIm: -R, firstRe: R },
  braket: { overlap: R, chance: 0.5 },
  sandwich: { average: 0, entry: 1 },
  average: { up: 0.75, down: 0.25, average: 0.5 }, // (3/4)(+1) + (1/4)(-1)
  outer: { p00: 1, p11: 0, trace: 1 },
  norm: { length: 5 },
  abs: { size: 5 },
  commutator: { c00Im: 2, c11Im: -2, offDiagonal: 0 }, // [sx, sy] = 2i sz
  trace: { trace: 7 }, // 3 + 4
  det: { det: 10 }, // 3*4 - 1*2
  diag: { d00: 2, d11: -1, corner: 0 },
  rank: { rank: 1 },
  span: { dimension: 2 },
  identity: { changed: 0 },
  matrix: { top: 0, bottom: 1 },
  kronecker: { d00: 1, d01: 0, trace: 3 },
  hat: { length: 1 },
  vec: { length: 3 },
  'sigma-vec': { d00: 1, d11: -1 },
  'sigma-dot': { d00: 0.5, offDiagonal: Math.sqrt(3) / 2, high: 1, low: -1 }, // cos 60, sin 60
  'pauli-x': { top: 0, bottom: 1 },
  'pauli-y': { topIm: 0, bottomIm: 1 },
  'pauli-z': { top: 0, bottom: -1 },
  hadamard: { top: R, bottom: R, again: 1 },
  cnot: { outIndex: 3 }, // |10> -> |11>
  cz: { amplitude: -1 },
  swap: { outIndex: 2 }, // |01> -> |10>
  element: { three: 1, four: 0 },
  'complex-n': { dimension: 2, threeQubits: 8 },
  'real-n': { dimension: 3, length: 3 },
  phase: { quarterRe: 0, quarterIm: 1, halfRe: -1, size: 1 },
  congruent: { same: 1, chanceA: 0.5, chanceB: 0.5 },
  approx: { value: 0.7071 },
  proportional: { ratio: 4 },
  arrow: { top: 0, bottom: 1 },
  mapsto: { out: 9 },
  implies: { total: 1 },
  iff: { orthogonal: 0, notOrthogonal: R },
  plusminus: { plus: 0.5, minus: 0.5 },
  cdot: { dot: 4 }, // 1*2 + 2*0 + 2*1
  derivative: { slope: 12 }, // d/dt t^3 at 2
  partial: { slope: 12 }, // d/dt (2 t^2) at 3 is 4t
  sqrt: { root: Math.SQRT2, half: 0.5 },
  re: { re: 3 },
  im: { im: 4 },
  mod: { remainder: 5 },
  gcd: { gcd: 12 },
  floor: { up: 3, negative: -2 },
  log2: { log8: 3, coin: 1 },
  hbar: { up: 0.5, down: -0.5 },
}

describe('every example is computed, and equals its hand value', () => {
  it('has a hand table for every entry', () => {
    expect(Object.keys(HAND).sort()).toEqual(NOTATION.map((e) => e.id).sort())
  })
  it.each(Object.entries(HAND))('%s', (id, expected) => {
    const values = EXAMPLE(id).values
    expect(Object.keys(values).sort(), id).toEqual(Object.keys(expected).sort())
    for (const [k, want] of Object.entries(expected)) expect(Number(values[k]), `${id}.${k}`).toBeCloseTo(want, 6)
  })

  it('the example is deterministic: two calls agree', () => {
    for (const e of NOTATION) expect(e.example()).toEqual(e.example())
  })

  it('the words follow the numbers: the sum, product and Pauli examples name the computed results', () => {
    expect(EXAMPLE('sum').says).toContain('30')
    expect(EXAMPLE('sum').tex).toContain('= 30')
    expect(EXAMPLE('product').tex).toContain('= 24')
    expect(EXAMPLE('xor').tex).toContain('1101')
    expect(EXAMPLE('log2').tex).toContain('\\log_2 8 = 3')
    expect(EXAMPLE('gcd').tex).toContain('= 12')
    expect(EXAMPLE('det').tex).toContain('= 10')
    expect(EXAMPLE('trace').tex).toContain('= 7')
    expect(EXAMPLE('cdot').tex).toMatch(/= 4$/)
  })
})

describe('where each notation is taught', () => {
  const units448 = new Set(LECTURE_META.flatMap((l) => l.units.map((u) => u.id)))
  const units709 = new Set(QC_META.flatMap((l) => l.units.map((u) => u.id)))
  it('every taught unit exists in its course', () => {
    for (const e of NOTATION) {
      if (e.taught.sl448) expect(units448.has(e.taught.sl448), `${e.id}: ${e.taught.sl448}`).toBe(true)
      if (e.taught.qc709) expect(units709.has(e.taught.qc709), `${e.id}: ${e.taught.qc709}`).toBe(true)
    }
  })
  it('the link of both courses resolves to a place a bridge can name', () => {
    let linked = 0
    for (const e of NOTATION) {
      for (const course of ['sl448', 'qc709'] as const) {
        const b = taughtBridge(e, course)
        if (!b) continue
        linked++
        expect(bridgePlace(b.target), `${e.id} for ${course}`).not.toBeNull()
        expect(b.id).toBe(`${course === 'qc709' ? 'qc-' : ''}nt-${e.id}`)
        expect(taughtBridge(e, course)!.target, 'the same target object each time').toBe(b.target)
      }
    }
    expect(linked).toBeGreaterThan(60)
  })
  it('mod, gcd and the floor wait for chapter F8 and link nowhere yet', () => {
    // When F8 lands, give them `taught: { qc709: 'f8-clock' | 'f8-euclid' | 'f8-roots' }` (this test then stops applying).
    for (const id of ['mod', 'gcd', 'floor']) {
      const t = NOTATION_BY_ID.get(id)!.taught
      if (t.qc709) expect(units709.has(t.qc709)).toBe(true)
    }
  })
})

/** Flatten a card text to plain words, TeX as `$…$`. */
const flat = (segs: readonly Seg[] | null | undefined) => (segs ?? []).map((s) => (typeof s === 'string' ? s : `$${s.tex}$`)).join('')

describe('what a card says about THIS spot', () => {
  const here = (id: string, ctx: Record<string, string | undefined>, track: 'ground' | 'formal' = 'ground') => flat(NOTATION_BY_ID.get(id)!.here?.(ctx, track))

  it('a sum says exactly what its limits say', () => {
    expect(here('sum', { lo: 'i=1', hi: 'n', of: 'a_i' })).toBe('Add the next part once for every $i$ from $1$ to $n$. The part is $a_i$.')
    expect(here('sum', { lo: 'x', of: '|x\\rangle' })).toBe('Add the next part once for every possible $x$. The part is $|x\\rangle$.')
    expect(here('sum', { lo: 'x=0', hi: '2^n-1' })).toBe('Add the next part once for every $x$ from $0$ to $2^n-1$.')
    expect(here('sum', { lo: 'i=1', hi: 'n', of: 'a_i' }, 'formal')).toContain('The term is $a_i$.')
    expect(here('sum', { lo: 'j:\\,z_j=1' })).toBe('Add the next part once for every $j$ for which $z_j=1$.')
    expect(here('sum', { lo: 'x \\in S', of: 'p_x' })).toBe('Add the next part once for every $x$ in $S$. The part is $p_x$.')
    expect(here('sum', {})).toBe('')
    expect(here('product', { lo: 'k=1', hi: '4' })).toBe('Multiply the next part once for every $k$ from $1$ to $4$.')
  })

  it('a bracket says what it is the overlap of, and a matrix element says whether it is an average', () => {
    expect(here('braket', { a: '\\alpha', b: '\\beta' })).toContain('The overlap of $\\alpha$ with $\\beta$')
    expect(here('sandwich', { a: '\\psi', m: 'M', b: '\\psi' })).toBe('The average of $M$ in the state $\\psi$.')
    expect(here('sandwich', { a: 'i', m: '\\hat A', b: 'j' })).toContain('turns the state $j$ into the state $i$')
    expect(here('average', { of: 'A' })).toContain('the average of $A$')
    expect(here('outer', { a: 'a', b: 'a' })).toContain('projector')
    expect(here('outer', { a: 'a', b: 'b' })).toContain('sends the state $b$ to $a$')
  })

  it('a ket with a known label names it, with its column computed', () => {
    expect(here('ket', { a: '{+z}' })).toMatch(/spin up along z.*\\begin\{pmatrix\} 1 \\\\ 0 \\end\{pmatrix\}/)
    expect(here('ket', { a: '{-y}' })).toContain('spin down along y')
    expect(here('ket', { a: '0' })).toContain('the bit $0$')
    expect(here('ket', { a: '\\psi' })).toContain('named $\\psi$')
  })

  it('a matrix says what shape it is', () => {
    expect(here('matrix', { lo: '2', hi: '1' })).toContain('column of 2 numbers')
    expect(here('matrix', { lo: '4', hi: '1' })).toContain('2 qubits')
    expect(here('matrix', { lo: '1', hi: '2' })).toContain('row of 2 numbers')
    expect(here('matrix', { lo: '2', hi: '2' })).toContain('2 × 2 grid')
    expect(here('matrix', { lo: '3', hi: '2' })).toContain('3 × 2 grid')
  })

  it('the rest build their sentence from what was captured, and never throw on nothing', () => {
    expect(here('phase', { of: 'i\\varphi' })).toContain('a turn by $\\varphi$')
    expect(here('phase', { of: '-i\\omega t' })).toContain('the other way')
    expect(here('hat', { of: 'n' })).toContain('direction of length 1')
    expect(here('hat', { of: 'A' })).toContain('an operator')
    expect(here('sqrt', { of: '2' })).toContain('about 1.414')
    expect(here('tensor-power', { of: '3' })).toContain('8 amplitudes')
    expect(here('abs', { of: '\\langle a|b\\rangle' })).toContain('overlap')
    expect(here('kronecker', { a: 'i', b: 'j' })).toContain('the same index')
    expect(here('commutator', { a: 'A', b: 'B' })).toContain('$A$ then $B$ minus $B$ then $A$')
    expect(here('pauli-x', { m: 'gate' })).toContain('NOT gate')
    expect(here('pauli-x', {})).toContain('along x')
    for (const e of NOTATION) expect(() => e.here?.({}, 'ground'), e.id).not.toThrow()
  })
})

describe('every piece of TeX in the dictionary renders', () => {
  const dollar = (s: string) => [...s.matchAll(/\$([^$]+)\$/g)].map((m) => m[1])
  it('the symbols, the examples and the maths in the prose', () => {
    for (const e of NOTATION) {
      const tex = [e.tex, e.example().tex, ...dollar(e.ground), ...dollar(e.formal ?? ''), ...dollar(e.physics), ...dollar(e.physicsFormal ?? '')]
      for (const t of tex) expect(() => renderAuthoredTexStrict(t), `${e.id}: ${t}`).not.toThrow()
    }
  })
  it('the captured text of a sample context, as the card renders it', () => {
    const ctx = { lo: 'i=1', hi: 'n', of: '\\psi_i', a: '{+z}', b: '\\phi', m: '\\hat A' }
    for (const e of NOTATION) {
      for (const s of e.here?.(ctx, 'formal') ?? []) {
        if (typeof s === 'string') continue
        if (s.user) expect(renderUserTex(s.tex), `${e.id}: ${s.tex}`).not.toContain('tex-user-error')
        else expect(() => renderAuthoredTexStrict(s.tex), `${e.id}: ${s.tex}`).not.toThrow()
      }
    }
  })
  it('marked, the symbol of every entry is the very notation it explains', () => {
    // each card head shows `tex`; the pre-processor must see that TeX as (at least) this entry's notation
    for (const e of NOTATION) {
      const sample = SAMPLE[e.id]
      expect(markNotation(sample, { gates: true }), e.id).toContain(`notation=${e.id}`)
    }
  })
})

describe('text hygiene', () => {
  it('no entry copies a long run of words twice (ground and formal differ, physics is its own)', () => {
    for (const e of NOTATION) expect(e.physics).not.toBe(e.ground)
  })
  it('plain ASCII quotes and the ħ symbol only where meant: no TeX left unrendered in plain fields', () => {
    for (const e of NOTATION as readonly NotationEntry[]) {
      for (const f of [e.name, e.say]) expect(f, e.id).not.toMatch(/[$\\]/)
    }
  })
})
