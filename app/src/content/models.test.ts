/**
 * Lab-model truth lint (owner P; Round-3 #5). A lab stage with `model: 'classical'` draws the classical
 * PREDICTION (a continuous band), not the experiment. A stage with `field: 'uniform'` draws no split at all.
 * On such a "no-split" stage the beat's own words and numbers must agree with the picture:
 *
 *  1. Classical stages say so: "classical" / "classically" appears in the text or the caption.
 *  2. The text and caption never claim a quantum split: no two spots or beams, no ±ħ/2 or ±1 readings,
 *     no "quantized" / "only ever" / "nothing between", no halves, 50/50, percentages, fractions or decimals.
 *  3. No outcome numbers: the beat carries no claims, and the stage asks for no `readouts`.
 *
 * A reveal is checked against the stage it shows (its own, or the question's when it has none).
 * Runtime side (W1, Round-3 #5): the scene draws no ± tally / Born readout on these stages.
 */
import { describe, expect, it } from 'vitest'
import { LECTURES } from './index'
import { layoutStates, type Beat, type Claim, type LabState, type Lecture, type StageLayout } from './schema'

type NoSplit = 'classical' | 'uniform'

/** The no-split kinds a layout shows (a classical overlay wins over a uniform field). */
export function noSplitKinds(layout: StageLayout): { kind: NoSplit; state: LabState }[] {
  const out: { kind: NoSplit; state: LabState }[] = []
  for (const s of layoutStates(layout)) {
    if (s.kind !== 'lab-r3') continue
    if (s.model === 'classical') out.push({ kind: 'classical', state: s })
    else if (s.field === 'uniform') out.push({ kind: 'uniform', state: s })
  }
  return out
}

/**
 * Rich text → plain words: gloss and term tags keep their shown text, `\htmlClass{term-…}` is dropped, and
 * angles (inputs) and references (MIT 8.05, §1.2, pp. 3–5, Lecture 6) are blanked, as in claims.test.ts.
 */
const plain = (rich: string) =>
  rich
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\{\{([^}|]+)\|([^}]+)\}\}/g, '$2')
    .replace(/\\htmlClass\{[^}]*\}/g, '')
    .replace(/\d+(?:\.\d+)?\s*(?:°|\^\\circ|\^\{\\circ\})/g, ' ')
    .replace(/(?:§|\bpp?\.\s?|\bFig\.\s?|\beqs?\.\s?|\bLecture\s|\bMIT\s|\bL)\d+(?:[.–-]\d+)*/g, ' ')

/** Wording that claims the quantum result (checked on plain text, TeX included). */
export const SPLIT_CLAIMS: readonly [string, RegExp][] = [
  ['two outcomes', /\btwo\s+(?:separate\s+|distinct\s+)?(?:spots?|beams?|peaks?|outcomes?|results?|values?|marks?)\b/i],
  ['±ħ/2 value', /[±]\s*ħ|\\pm\s*\\?t?frac\{?\\hbar|\\hbar\}?\s*\/\s*2|ħ\s*\/\s*2|\\[td]?frac\{\\hbar\}\{?2/],
  ['±1 reading', /±\s*1(?![\d.])|\\pm\s*1(?![\d.])/],
  ['up or down', /\bup\s+or\s+down\b|\bup\s+and\s+down\b|[+−-]\s*spot\b|\bspots\b/i],
  ['discreteness', /\bquanti[sz]ed\b|\bdiscrete\b|\bonly ever\b|\bnothing between\b|\bexactly two\b/i],
  ['split number', /\bhalf\b(?!-)|\bhalves\b|\b50\s*\/\s*50\b|\d\s*\\?%|[½¼¾⅛⅜⅓⅔]|\\[td]?frac\{?\d+\}?\{?\d+\}?|(?<![\d.])\d+\s*\/\s*\d+(?![\d.])|(?<![\d.])\d+\.\d+/],
]

interface Site {
  where: string
  kinds: { kind: NoSplit; state: LabState }[]
  text: string
  caption?: string
  claims: Claim[]
}

function sites(l: Lecture): Site[] {
  const out: Site[] = []
  const beats: Beat[] = l.units.flatMap((u) => u.story ?? [])
  for (const b of beats) {
    const q = noSplitKinds(b.stage)
    if (q.length) out.push({ where: b.id, kinds: q, text: b.text, caption: b.caption, claims: b.claims ?? [] })
    if (b.reveal) {
      const r = noSplitKinds(b.reveal.stage ?? b.stage)
      if (r.length) out.push({ where: `${b.id} reveal`, kinds: r, text: b.reveal.text, caption: b.reveal.caption, claims: b.reveal.claims ?? [] })
    }
  }
  return out
}

/** Every broken rule, as "where: rule". */
export function noSplitViolations(l: Lecture): string[] {
  const bad: string[] = []
  for (const s of sites(l)) {
    const words = [s.text, s.caption ?? ''].map(plain)
    if (s.kinds.some((k) => k.kind === 'classical') && !words.some((w) => /\bclassical(?:ly)?\b/i.test(w)))
      bad.push(`${s.where}: classical stage, but neither text nor caption says "classical"`)
    for (const [name, re] of SPLIT_CLAIMS)
      for (const [field, w] of [['text', words[0]], ['caption', words[1]]] as const) if (re.test(w)) bad.push(`${s.where} ${field}: claims a split (${name})`)
    if (s.claims.length) bad.push(`${s.where}: carries claims (${s.claims.map((c) => c.text).join('; ')})`)
    for (const k of s.kinds) if (k.state.readouts?.length) bad.push(`${s.where}: ${k.kind} stage asks for readouts ${k.state.readouts.join(', ')}`)
  }
  return bad
}

/* ---------------------------------------------------------------------------------------------- */
/* Tests                                                                                           */
/* ---------------------------------------------------------------------------------------------- */

const L1 = LECTURES.find((l) => l.id === 'L1')!
const patch = (id: string, f: (b: Beat) => Beat): Lecture => ({
  ...L1,
  units: L1.units.map((u) => ({ ...u, story: u.story?.map((b) => (b.id === id ? f(b) : b)) })),
})
const QUANTUM_TEXT = L1.units.flatMap((u) => u.story ?? []).find((b) => b.id === 'l1-quantized:b3')!.text

describe.each(LECTURES.map((l) => [l.id, l] as const))('no-split stages: %s', (_, lecture) => {
  it('classical and uniform-field beats never claim a quantum split, and show no outcome numbers', () => {
    expect(noSplitViolations(lecture)).toEqual([])
  })
})

describe('no-split lint (guards)', () => {
  it('finds the classical beat l1-quantized:b2 and the uniform beat l1-quantized:b5a (non-vacuity)', () => {
    const found = sites(L1).map((s) => `${s.where}:${s.kinds.map((k) => k.kind).join('+')}`)
    expect(found).toContain('l1-quantized:b2:classical')
    expect(found).toContain('l1-quantized:b5a:uniform')
  })
  it('catches quantum wording on a classical beat (mutation: b2 text := b3 text)', () => {
    const bad = noSplitViolations(patch('l1-quantized:b2', (b) => ({ ...b, text: QUANTUM_TEXT })))
    expect(bad.some((m) => m.startsWith('l1-quantized:b2 text: claims a split (two outcomes)'))).toBe(true)
    expect(bad.some((m) => m.startsWith('l1-quantized:b2 text: claims a split (±ħ/2 value)'))).toBe(true)
  })
  it('catches a split number in a classical caption (mutation: "+ 50.0% · − 50.0%")', () => {
    const bad = noSplitViolations(patch('l1-quantized:b2', (b) => ({ ...b, caption: `${b.caption} · + 50.0% · − 50.0%` })))
    expect(bad).toContain('l1-quantized:b2 caption: claims a split (split number)')
  })
  it('catches a classical beat that does not say it is classical', () => {
    const bad = noSplitViolations(
      patch('l1-quantized:b2', (b) => ({ ...b, text: b.text.replace('[[classical|Classically]], each', 'Each'), caption: 'one continuous band' })),
    )
    expect(bad).toContain('l1-quantized:b2: classical stage, but neither text nor caption says "classical"')
  })
  it('catches claims and readouts on a no-split stage', () => {
    const withReadouts = patch('l1-quantized:b2', (b) => ({ ...b, stage: { ...(b.stage as LabState), readouts: ['fractions'] } }))
    expect(noSplitViolations(withReadouts)).toContain('l1-quantized:b2: classical stage asks for readouts fractions')
    const withClaims = patch('l1-quantized:b5a', (b) => ({ ...b, claims: [{ text: 'ovenZPlus · half in +', holds: () => true }] }))
    expect(noSplitViolations(withClaims)).toEqual(['l1-quantized:b5a: carries claims (ovenZPlus · half in +)'])
  })
})
