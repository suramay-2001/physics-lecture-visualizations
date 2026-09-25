/**
 * Claim ledger (W-L1 §6.1; owner P).
 *  1. Every engine value in L1.values.ts matches its numpy twin in physics/__fixtures__/claims.json
 *     (pipeline/make_claim_fixtures.py: eigh kets, Lüders projectors, bisection, Malus's law).
 *  2. Every claim is keyed (`key · text`) and its key has a numpy value.
 *  3. Every decimal, fraction or percentage a student reads in a story beat (text, caption, reveal) or a
 *     review card equals, to its shown precision, the numpy value of a claim of that beat or its unit.
 *     Angles (45°, 60°) are inputs, not results, and are skipped, as are section/page numbers.
 */
import { describe, expect, it } from 'vitest'
import fixture from '../physics/__fixtures__/claims.json'
import { LECTURES } from './index'
import { V, claimKey } from './L1.values'
import type { Claim, Lecture } from './schema'

const NUMPY: Readonly<Record<string, number>> = fixture.values

/* ---------------------------------------------------------------------------------------------- */
/* Displayed numbers                                                                               */
/* ---------------------------------------------------------------------------------------------- */

export interface Shown {
  raw: string
  value: number
  /** Half a unit of the last shown digit (exact for fractions). */
  tol: number
}

const GLYPHS: Record<string, number> = { '½': 1 / 2, '¼': 1 / 4, '¾': 3 / 4, '⅛': 1 / 8, '⅜': 3 / 8, '⅓': 1 / 3, '⅔': 2 / 3 }
const EXACT = 1e-9

/** Decimals, fractions and percentages in a rich string (TeX included), in order of the rules below. */
export function shownNumbers(text: string): Shown[] {
  const out: Shown[] = []
  let s = text
  const eat = (re: RegExp, f: (m: RegExpMatchArray) => Shown | null) => {
    s = s.replace(re, (...args: unknown[]) => {
      const m = args.slice(0, -2) as unknown as RegExpMatchArray
      const r = f(m)
      if (r) out.push(r)
      return ' '
    })
  }
  // inputs and references, not results
  eat(/\d+(?:\.\d+)?\s*(?:°|\^\\circ|\^\{\\circ\})/g, () => null)
  eat(/(?:§|\bpp?\.\s?|\bFig\.\s?|\beqs?\.\s?|\bExps?\.\s?|\bProblem\s|\bDefinition\s|\bLecture\s|\bMIT\s|\bL)\d+(?:[.–-]\d+)*/g, () => null)
  // exact forms
  eat(/\\[td]?frac\{?(\d+)\}?\{?(\d+)\}?/g, (m) => ({ raw: m[0], value: Number(m[1]) / Number(m[2]), tol: EXACT }))
  eat(/[½¼¾⅛⅜⅓⅔]/g, (m) => ({ raw: m[0], value: GLYPHS[m[0]], tol: EXACT }))
  eat(/\b50\/50\b/g, (m) => ({ raw: m[0], value: 0.5, tol: EXACT }))
  eat(/(?<![\d.])(\d+)\s*\/\s*(\d+)(?![\d.])/g, (m) => ({ raw: m[0], value: Number(m[1]) / Number(m[2]), tol: EXACT }))
  // rounded forms
  eat(/(?<![\d.])(\d+(?:\.(\d+))?)\s*\\?%/g, (m) => ({ raw: m[0], value: Number(m[1]) / 100, tol: 0.5 * 10 ** -((m[2]?.length ?? 0) + 2) + 1e-12 }))
  eat(/(?<![\d.])(\d+)\.(\d+)(?![\d.])/g, (m) => ({ raw: m[0], value: Number(`${m[1]}.${m[2]}`), tol: 0.5 * 10 ** -m[2].length + 1e-12 }))
  return out
}

/* ---------------------------------------------------------------------------------------------- */
/* Sites and the claims in scope                                                                   */
/* ---------------------------------------------------------------------------------------------- */

interface Scoped {
  where: string
  text: string
  claims: Claim[]
}

function scopedSites(l: Lecture): Scoped[] {
  const out: Scoped[] = []
  for (const u of l.units) {
    const unitClaims = [...(u.claims ?? []), ...(u.review?.claims ?? [])]
    for (const b of u.story ?? []) {
      const claims = [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...unitClaims]
      for (const [field, text] of [
        ['text', b.text],
        ['caption', b.caption],
        ['reveal.text', b.reveal?.text],
        ['reveal.caption', b.reveal?.caption],
      ] as const)
        if (text) out.push({ where: `${b.id} ${field}`, text, claims })
    }
    if (u.review) {
      for (const [i, p] of u.review.points.entries()) out.push({ where: `${u.id}.review.points[${i}]`, text: p, claims: unitClaims })
      out.push({ where: `${u.id}.review.equations`, text: u.review.equations, claims: unitClaims })
      out.push({ where: `${u.id}.review.trap`, text: u.review.trap, claims: unitClaims })
    }
  }
  return out
}

function allClaims(l: Lecture): { where: string; claim: Claim }[] {
  return l.units.flatMap((u) => [
    ...(u.claims ?? []).map((claim) => ({ where: u.id, claim })),
    ...(u.review?.claims ?? []).map((claim) => ({ where: `${u.id}.review`, claim })),
    ...(u.story ?? []).flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? [])].map((claim) => ({ where: b.id, claim }))),
  ])
}

/** Displayed numbers that no claim in scope backs, as "where: raw". */
function unbacked(l: Lecture, numpy: Readonly<Record<string, number>> = NUMPY): string[] {
  const bad: string[] = []
  for (const site of scopedSites(l)) {
    const values = site.claims.map((c) => numpy[claimKey(c) ?? ''] ?? Number.NaN)
    for (const n of shownNumbers(site.text)) if (!values.some((v) => Math.abs(v - n.value) <= n.tol)) bad.push(`${site.where}: ${n.raw}`)
  }
  return bad
}

/* ---------------------------------------------------------------------------------------------- */
/* Tests                                                                                           */
/* ---------------------------------------------------------------------------------------------- */

describe('claims.json (numpy) ↔ engine (L1.values.ts)', () => {
  it('every engine value has a numpy twin, and no numpy key is stale', () => {
    expect(Object.keys(NUMPY).sort()).toEqual(Object.keys(V).sort())
  })
  it.each(Object.entries(V))('%s agrees with numpy', (key, value) => {
    expect(Math.abs(value - NUMPY[key]), `${key}: engine ${value} vs numpy ${NUMPY[key]}`).toBeLessThan(key === 'theta34' ? 1e-9 : 1e-12)
  })
})

describe('the number reader', () => {
  it('reads fractions, glyphs, 50/50, percentages and decimals; skips angles and references', () => {
    const got = shownNumbers('At 45°, $P(+) = \\tfrac{1}{2}$ or \\tfrac34; ⅛ + 50/50, 3/4, 25 %, ≈ 0.854 (§1.4, pp. 15–16, MIT 8.05, L1 p.4) $\\cos^2 22.5^\\circ$')
    expect(got.map((g) => g.raw.replace(/\s/g, ''))).toEqual(['\\tfrac{1}{2}', '\\tfrac34', '⅛', '50/50', '3/4', '25%', '0.854'])
    expect(got.map((g) => g.value)).toEqual([0.5, 0.75, 0.125, 0.5, 0.75, 0.25, 0.854])
  })
  it('ignores symbolic fractions', () => {
    expect(shownNumbers('$\\tfrac{1+\\cos\\theta}{2}$, $1/\\sqrt2$, $\\tfrac{\\hbar}{2}$, $2S_z/\\hbar$, ħ/2')).toEqual([])
  })
  it('a wrong number is caught (mutation: 0.854 → 0.845 in a copy of L1)', () => {
    const L = LECTURES.find((l) => l.id === 'L1')!
    const mutated: Lecture = {
      ...L,
      units: L.units.map((u) =>
        u.id !== 'l1-average' ? u : { ...u, story: u.story!.map((b) => (b.id === 'l1-average:b3' ? { ...b, caption: b.caption!.replace('0.854', '0.845') } : b)) },
      ),
    }
    expect(unbacked(mutated)).toEqual(['l1-average:b3 caption: 0.845'])
  })
})

describe.each(LECTURES.map((l) => [l.id, l] as const))('claim ledger: %s', (_, lecture) => {
  it('every claim is keyed, and its key has a numpy value', () => {
    const bad = allClaims(lecture)
      .map(({ where, claim }) => ({ where, key: claimKey(claim), text: claim.text }))
      .filter((c) => c.key === null || !(c.key in NUMPY))
    expect(bad).toEqual([])
  })
  it('every displayed decimal, fraction and percentage is backed by a claim of its beat or unit', () => {
    expect(unbacked(lecture)).toEqual([])
  })
  it('the reader finds numbers in every unit with a story or review (guard against a vacuous pass)', () => {
    for (const u of lecture.units.filter((x) => x.story?.length || x.review)) {
      const found = scopedSites({ ...lecture, units: [u] }).flatMap((s) => shownNumbers(s.text))
      expect(found.length, u.id).toBeGreaterThan(0)
    }
  })
})
