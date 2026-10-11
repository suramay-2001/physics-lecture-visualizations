/**
 * Context-aware cards, end to end (notation explainers): TeX → the pre-processor captures the limits and pieces →
 * KaTeX renders them as `data-*` attributes → the card reads them back → the dictionary says what THIS formula says.
 * Each case is a formula as a chapter writes it and the sentence its card shows (card text is words and TeX pieces:
 * here TeX pieces are shown between dollar signs, the way the card typesets them).
 */
import { describe, expect, it } from 'vitest'
import { readMark } from '../ui/notationCodec'
import { markNotation } from '../ui/notationMark'
import { renderAuthoredTex } from '../ui/tex'
import { NOTATION_BY_ID } from './notation'
import type { Seg } from './notationKit'

/** Every mark of a TeX string as the card sees it: id and the sentence it would say, in document order. */
function cards(tex: string, track: 'ground' | 'formal' = 'ground', gates = false): { id: string; here: string }[] {
  const html = renderAuthoredTex(markNotation(tex, { gates }), false, true)
  const out: { id: string; here: string }[] = []
  for (const m of html.matchAll(/<span class="enclosing[^"]*" (data-notation="[^"]*"(?: data-[a-z]+="[^"]*")*)>/g)) {
    const dataset: Record<string, string> = {}
    for (const a of m[1].matchAll(/data-([a-z]+)="([^"]*)"/g)) dataset[a[1]] = a[2]
    const { id, ctx } = readMark({ dataset })
    const segs: readonly Seg[] = NOTATION_BY_ID.get(id)?.here?.(ctx, track) ?? []
    out.push({ id, here: segs.map((s) => (typeof s === 'string' ? s : `$${s.tex}$`)).join('') })
  }
  return out
}
const say = (tex: string, id: string, track: 'ground' | 'formal' = 'ground', gates = false) => cards(tex, track, gates).find((c) => c.id === id)?.here

describe('what a card says about the formula it was met in', () => {
  it('a sum over x from 0 to 2^n − 1 says exactly that', () => {
    expect(say('|\\psi\\rangle = \\sum_{x=0}^{2^n-1} c_x |x\\rangle', 'sum')).toBe('Add the next part once for every $x$ from $0$ to $2^n-1$. The part is $c_x |x\\rangle$.')
  })

  it('a sum with limits i = 1 to n', () => {
    expect(say('\\sum_{i=1}^{n} a_i b_i', 'sum')).toBe('Add the next part once for every $i$ from $1$ to $n$. The part is $a_i b_i$.')
  })

  it('a sum whose counter has no stated range', () => {
    expect(say('1 = \\sum_i |c_i|^2', 'sum')).toBe('Add the next part once for every possible $i$. The part is $|c_i|^2$.')
  })

  it('a sum over a condition, and over a set', () => {
    expect(say('\\sum_{j:\\,z_j=1} x_j', 'sum')).toBe('Add the next part once for every $j$ for which $z_j=1$. The part is $x_j$.')
    expect(say('\\sum_{x \\in S} p(x)', 'sum')).toBe('Add the next part once for every $x$ in $S$. The part is $p(x)$.')
  })

  it('the Formal voice says "term" for the part', () => {
    expect(say('\\sum_{k=1}^{N} k', 'sum', 'formal')).toBe('Add the next part once for every $k$ from $1$ to $N$. The term is $k$.')
  })

  it('a product says multiply', () => {
    expect(say('\\prod_{k=1}^{n} p_k', 'product')).toBe('Multiply the next part once for every $k$ from $1$ to $n$. The part is $p_k$.')
  })

  it('a bracket is the overlap of a with b', () => {
    expect(say('\\langle a|b\\rangle', 'braket')).toBe('The overlap of $a$ with $b$.')
    expect(say('|\\langle{+z}|\\psi\\rangle|^2', 'braket')).toBe('The overlap of ${+z}$ with $\\psi$.')
    expect(say('|\\langle{+z}|\\psi\\rangle|^2', 'abs')).toBe('The size of an overlap. Squared, it is a chance.')
  })

  it('a bra-operator-ket between the same state is the average of the operator in it', () => {
    expect(say('\\langle\\psi|M|\\psi\\rangle', 'sandwich')).toBe('The average of $M$ in the state $\\psi$.')
    expect(say('\\langle b|M|b\\rangle', 'sandwich')).toBe('The average of $M$ in the state $b$.')
    expect(say('\\langle i|\\hat A|j\\rangle', 'sandwich')).toBe('How much $\\hat A$ turns the state $j$ into the state $i$.')
  })

  it('kets, bras, averages, projectors', () => {
    expect(say('|{+x}\\rangle', 'ket')).toContain('spin up along x')
    expect(say('|1\\rangle', 'ket')).toBe('This ket is the qubit state for the bit $1$.')
    expect(say('|\\phi\\rangle', 'ket')).toBe('This ket is a state named $\\phi$.')
    expect(say('\\langle\\phi|', 'bra')).toBe('This is the bra of the state $\\phi$: ready to be put in front of a ket.')
    expect(say('\\langle S_z\\rangle', 'average')).toBe('Here: the average of $S_z$ over many repeats.')
    expect(say('|{+z}\\rangle\\langle{+z}|', 'outer')).toBe('A projector onto the state ${+z}$: it keeps the part of a state that lies along ${+z}$.')
  })

  it('matrices say how big they are and what that is', () => {
    expect(say('\\begin{pmatrix}1\\\\0\\\\0\\\\0\\end{pmatrix}', 'matrix')).toBe('A column of 4 numbers: a list, such as a state of 2 qubits.')
    expect(say('\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}', 'matrix')).toBe('A 2 × 2 grid: an operator on a space of 2 states.')
    expect(say('\\begin{pmatrix}1&2&3\\end{pmatrix}', 'matrix')).toBe('A row of 3 numbers: the form a bra takes.')
  })

  it('phases, roots, hats, trace, derivatives, tensor powers', () => {
    expect(say('e^{-i\\omega t}', 'phase')).toBe('Here: a turn by $\\omega t$ the other way (clockwise) from 1.')
    expect(say('\\sqrt{2}', 'sqrt')).toBe('Here: the number whose square is $2$, about 1.414.')
    expect(say('\\sqrt{1 - p}', 'sqrt')).toBe('Here: the square root of $1 - p$.')
    expect(say('\\hat n', 'hat')).toBe('Here the hat on $n$ marks a direction of length 1.')
    expect(say('\\hat H', 'hat')).toBe('Here the hat on $H$ marks an operator.')
    expect(say('\\mathrm{Tr}(\\rho A)', 'trace')).toBe('Here: add the diagonal of $\\rho A$.')
    expect(say('\\frac{d}{dt}|\\psi\\rangle', 'derivative')).toBe('Here: how fast things change with $t$.')
    expect(say('|0\\rangle^{\\otimes 3}', 'tensor-power')).toBe('Here: $3$ copies, so 8 amplitudes for a state.')
    expect(say('H^{\\otimes n}', 'tensor-power')).toBe('Here: $n$ copies side by side.')
    expect(say('\\delta_{jk}', 'kronecker')).toBe('Here: 1 if $j$ and $k$ are the same index, and 0 if they differ.')
    expect(say('[\\sigma_x, \\sigma_y]', 'commutator')).toBe('Here: $\\sigma_x$ times $\\sigma_y$ minus $\\sigma_y$ times $\\sigma_x$ (in $\\sigma_x\\,\\sigma_y$, $\\sigma_y$ acts first). Zero means the order does not matter.')
    expect(say('\\hat n\\cdot\\vec\\sigma', 'sigma-dot')).toBe('Here: the spin matrix along the direction $\\hat n$. Its readings are +1 and −1, in units of ħ/2.')
  })

  it('bare gate letters in a 709 formula say they are gates', () => {
    expect(say('X|0\\rangle = |1\\rangle', 'pauli-x', 'ground', true)).toBe('Here X is the NOT gate acting on one qubit.')
    expect(say('Z\\otimes I', 'identity', 'ground', true)).toBe('Here I is the identity gate: this qubit is left alone.')
    expect(say('X|0\\rangle', 'pauli-x', 'ground', false)).toBeUndefined()
  })

  it('a formula with several marks gives each its own sentence', () => {
    const c = cards('\\sum_{i=1}^{n} |c_i|^2 = \\langle\\psi|\\psi\\rangle')
    expect(c.map((x) => x.id)).toEqual(['sum', 'abs', 'braket'])
    expect(c[0].here).toContain('from $1$ to $n$')
    expect(c[1].here).toBe('The size of $c_i$.')
    expect(c[2].here).toBe('The overlap of $\\psi$ with $\\psi$.')
  })
})
