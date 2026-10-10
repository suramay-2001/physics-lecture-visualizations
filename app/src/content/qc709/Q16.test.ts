/**
 * Chapter Q16's own invariants, added with the review fixes (docs/roles/audits/P-Q16-review.md): the ruling that Bergou's ancilla circuit is drawn only in the first
 * Deutsch–Jozsa beat and the classical queries (R2), a caption on every clue question, and the two Ground symbols the review found undefined. (The generic lints,
 * symbols before use, claims against numpy, derivation views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import type { Beat, StageLayout, StageState } from '../schema'
import { Q16 } from './Q16'
import { C_DJA, F_BAL, F_BALN } from './Q16.values'

const beats: Beat[] = Q16.units.flatMap((u) => u.story ?? [])
const beat = (id: string): Beat => beats.find((b) => b.id === id)!

/** Every stage a beat shows: the question, the reveal, and every derivation view in either track (a split layout contributes both of its stages). */
function stagesOf(b: Beat): StageState[] {
  const flat = (s: StageState | StageLayout | undefined): StageState[] => (!s ? [] : 'layout' in s ? (s.layout === 'split' ? [s.top, s.bottom] : [s.main, s.inset]) : [s])
  const views = [...b.derivation?.ground ?? [], ...b.derivation?.formal ?? []].flatMap((st) => flat(st.view))
  return [...flat(b.stage), ...flat(b.reveal?.stage), ...views]
}
const drawsAncilla = (s: StageState): boolean => s.kind === 'circuit' && [C_DJA(F_BALN), C_DJA(F_BAL)].includes(s.circuit)

describe('Q16 review fixes (P-Q16-review)', () => {
  it('item 2: Bergou’s ancilla circuit is drawn in q16-dj:b1 only; every other stage, the classical-cost clue included, uses the phase form', () => {
    expect(beat('q16-dj:b1').stage && stagesOf(beat('q16-dj:b1')).some(drawsAncilla)).toBe(true)
    for (const b of beats.filter((x) => x.id !== 'q16-dj:b1')) expect(stagesOf(b).some(drawsAncilla), b.id).toBe(false)
  })
  it('item 5: every clue question has a caption on its own stage (as every Q15 clue does)', () => {
    const clues = beats.filter((b) => b.phase === 'clue')
    expect(clues.map((b) => b.id)).toEqual(['q16-hadamard-n:b4', 'q16-dj:b4', 'q16-classical-cost:b3', 'q16-bv:b4'])
    for (const b of clues) expect((b.caption ?? '').length, b.id).toBeGreaterThan(10)
  })
  it('item 1: the Ground text defines N before the classical-cost derivation uses it, and names the output state before the Deutsch–Jozsa derivation uses it', () => {
    expect(beat('q16-classical-cost:b1').text).toContain('$N = 2^n = 8$')
    expect(beat('q16-dj:b3').text).toContain('Call the state after the last column $|\\psi_{\\text{out}}\\rangle$')
  })
  it('item 4: the “about 2^{1-k}” remark carries its condition (N much larger than k) in the story and the review card', () => {
    const story = JSON.stringify(beat('q16-classical-cost:b2'))
    expect(story).toContain('about $2^{1-k}$ when $N$ is much larger than $k$')
    expect(JSON.stringify(Q16.units.find((u) => u.id === 'q16-classical-cost')!.review)).toContain('about $2^{1-k}$ when $N$ is much larger than $k$')
  })
  it('item 6: Bernstein–Vazirani’s “at least n” says what it is for, and that n + 1 finds b too', () => {
    expect(beat('q16-bv:b1').formal).toContain('for $a$ alone ($n + 1$ if $b$ is wanted too)')
  })
})
