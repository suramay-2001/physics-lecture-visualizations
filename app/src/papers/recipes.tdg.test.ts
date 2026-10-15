/**
 * The fourteen `tdg-*` recipes of the paper lecture P1 (papers/recipes.tdg.ts): every number the chapter prints is pinned here to the digits the page shows (the numpy twins of
 * pipeline/claims_papers/p1.py check the same values to 1e-12), every recipe returns a picture that passes the stage kinds' own validators, bad parameters are refused with a path,
 * and the ledger below runs every recipe at least once so that no output name goes unchecked.
 */
import { describe, expect, it, vi } from 'vitest'
import { validateLayout } from '../stage/resolve'
import '../stage/svg/kinds'
import { P1 } from '../content/papers/P1.paper'
import { RECIPE_IDS, runRecipe, type RecipeRef } from './recipes'
import type { ClaimSpec } from './spec'

vi.setConfig({ testTimeout: 120_000 })

const R = (recipe: string, params: object = {}): RecipeRef => ({ recipe, params }) as RecipeRef
const mm = (code: string, factory: string, extra: object = {}) => R('tdg-machine', { code, factory, ...extra })
const lpu = (code: string, mode: string, extra: object = {}) => R('tdg-lpu', { code, mode, ...extra })
const sa = (a: number, b: number, block = 'both') => R('tdg-shift-action', { code: 'gross', a, b, block })

type Row = [ref: RecipeRef, out: string, want: number, digits?: number]
const ROWS: Row[] = [
  // machine (Eq. 25)
  [mm('gross', '1e-3', { M: 3 }), 'n', 33],
  [mm('gross', '1e-3', { M: 1 }), 'perLogical', 31.5],
  [mm('gross', '1e-3', { M: 1 }), 'surfQ13', 4044],
  [mm('gross', '1e-3', { M: 1 }), 'ratio13', 10.7, 1],
  [mm('gross', '1e-3', { M: 1 }), 'ratio11', 7.65, 2],
  [mm('gross', '1e-4', { M: 10 }), 'q', 4801],
  [mm('gross', '1e-4', { M: 10 }), 'qA29', 4817],
  [mm('gross', '1e-4', { M: 10 }), 'qGap', 16],
  [mm('two-gross', '1e-3', { M: 10 }), 'q', 8138],
  [mm('gross', '1e-3', { budget: 5000 }), 'n', 121],
  [mm('two-gross', '1e-3', { budget: 50000 }), 'n', 704],
  [mm('gross', '1e-4', { budget: 5000 }), 'n', 110],
  [mm('gross', '1e-4', { budget: 50000 }), 'n', 1342],
  [mm('two-gross', '1e-4', { budget: 50000 }), 'n', 440],
  [mm('two-gross', '1e-4', { budget: 500000 }), 'n', 6886],
  [mm('gross', '1e-3', { M: 1 }), 'dataShare', 11 / 12],
  [mm('gross', '1e-3', { M: 1 }), 'aPrimeD9', 17],
  // yield
  [R('tdg-yield'), 'oneIn5000', 2983],
  [R('tdg-yield'), 'oneIn6936', 66086],
  [R('tdg-yield'), 'yield1000', 0.202, 3],
  // basis and shifts
  [R('tdg-basis', { code: 'gross' }), 'n', 144],
  [R('tdg-basis', { code: 'gross' }), 'k', 12],
  [R('tdg-basis', { code: 'gross' }), 'touchShare', 0.25],
  [R('tdg-basis', { code: 'two-gross' }), 'wX7', 20],
  [R('tdg-pairing', { code: 'gross' }), 'diag', 12],
  [sa(1, 0), 'img1', 4],
  [sa(1, 0), 'img2', 6],
  [sa(1, 0), 'lowerDiff', 16],
  [sa(1, 0), 'classes', 36],
  [sa(6, 0), 'identity', 1],
  [sa(1, 0), 'identity', 0],
  // LPU, native, distribute, durations
  [lpu('gross', 'full'), 'u', 90],
  [lpu('two-gross', 'full'), 'u', 158],
  [lpu('two-gross', 'l'), 'lEbase', 30],
  [lpu('gross', 'full'), 'shareHalf', 0.2],
  [lpu('gross', 'full'), 'half9', 9],
  [R('tdg-native', { code: 'gross' }), 'rot', 245],
  [R('tdg-native', { code: 'gross' }), 'rotAll', 510],
  [R('tdg-native', { code: 'gross' }), 'offMean245G', 18.53, 2],
  [R('tdg-native', { code: 'gross' }), 'offMean510T', 16.46, 2],
  [R('tdg-distribute', { n: 33 }), 'M', 3],
  [R('tdg-distribute', { n: 33 }), 'zz100', 9],
  [R('tdg-durations', { code: 'gross' }), 'tauM', 120],
  [R('tdg-durations', { code: 'gross' }), 'nInter', 36],
  // failure spectrum
  [R('tdg-failure', { series: ['g-idle'], view: 'pp' }), 'nlGIdle3', 8.79, 2],
  [R('tdg-failure', { series: ['g-idle'], view: 'pp' }), 'nlTAut3', 14.49, 2],
  [R('tdg-failure', { series: ['g-idle'], view: 'pp' }), 'slope', 4.99, 2],
  [R('tdg-failure', { series: ['g-idle'], view: 'pp' }), 'p2gIdle3M', 8.1, 1],
  [R('tdg-failure', { series: ['g-idle'], view: 'pp' }), 'perFail4M', 2.08, 2],
  [R('tdg-failure', { series: ['g-idle'], view: 'pp' }), 'logGC4', -7.32, 2],
  // TFIM and the surface baseline
  [R('tdg-tfim', { view: 'failure' }), 'NR', 184000],
  [R('tdg-tfim', { view: 'failure' }), 'crossGM', 2.09, 2],
  [R('tdg-tfim', { view: 'failure' }), 'crossTM', 7.32, 2],
  [R('tdg-tfim', { view: 'failure' }), 'tLaw', 82.7, 1],
  [R('tdg-tfim', { view: 'failure' }), 'tPerRot', 84.5, 1],
  [R('tdg-tfim', { view: 'surface' }), 'thM17', 5.94, 2],
  [R('tdg-tfim', { view: 'surface' }), 'thT17', 5.89, 2],
  [R('tdg-capability'), 'nRatio2', 16.8, 1],
  [R('tdg-capability'), 'rowD5Nt', 7.8, 1],
  [R('tdg-capability'), 'rowD5NtN50', 7.0, 1],
  [R('tdg-family', { rMax: 3 }), 'famRatio5', 16.67, 2],
  [R('tdg-factory', { d1: 3 }), 'cult3', 351, 0],
  [R('tdg-factory', { d1: 3 }), 'cult3Exact', 352.5, 1],
  [R('tdg-factory', { d1: 5 }), 'cult5', 2167, 0],
  [R('tdg-factory', { d1: 3 }), 'dist4g', 108.6, 1],
]

const run = (ref: RecipeRef) => {
  const r = runRecipe(ref)
  if (!r.ok) throw new Error(r.problems.join('; '))
  return r
}

describe('tdg recipes: the numbers the chapter prints', () => {
  it.each(ROWS.map((r, i) => [i, r[0].recipe, r[1], r[2], r[3]] as const))('row %i: %s %s', (i, _id, out, want, digits) => {
    const got = run(ROWS[i][0]).values[out]
    expect(got, out).toBeDefined()
    if (digits === undefined) expect(got).toBeCloseTo(want, 9)
    else expect(Number(got.toFixed(digits))).toBe(Number(want.toFixed(digits)))
  })
})

describe('tdg recipes: pictures validate, bad parameters are refused', () => {
  const ONE: RecipeRef[] = [
    mm('gross', '1e-3', { M: 3, highlight: 'pivot', readouts: ['parts'] }),
    mm('two-gross', '1e-4', { M: 4, layout: 'triangular', highlight: 't-injection' }),
    R('tdg-basis', { code: 'gross', ops: ['X1', 'Z7'], shift: { a: 1, b: 0 } }),
    R('tdg-pairing', { code: 'two-gross' }),
    sa(1, 0, 'upper'),
    sa(1, 0, 'lower'),
    R('tdg-native', { code: 'gross' }),
    R('tdg-native', { code: 'gross', view: 'offline' }),
    lpu('gross', 'full', { measure: 'Y1', readouts: ['V', 'E', 'cycles', 'kept', 'u'] }),
    lpu('two-gross', 'l'),
    R('tdg-distribute', { n: 50 }),
    R('tdg-durations', { code: 'two-gross' }),
    R('tdg-failure', { series: ['g-idle', 'g-aut'], view: 'pp', marker: 0.001 }),
    R('tdg-failure', { series: ['g-idle'], view: 'fw' }),
    R('tdg-failure', { series: ['g-idle', 'g-aut'], view: 'table2' }),
    R('tdg-failure', { series: ['2g-idle'], view: 'compare', d: 17 }),
    R('tdg-tfim', { view: 'failure', codes: 'gross' }),
    R('tdg-tfim', { view: 'surface', nT: 'text' }),
    R('tdg-capability'),
    R('tdg-family', { rMax: 2 }),
    R('tdg-yield', { marker: 378 }),
    R('tdg-factory', { d1: 5 }),
  ]
  it.each(ONE.map((r, i) => [i, r.recipe] as const))('picture %i (%s) passes validateLayout', (i) => {
    expect(validateLayout(run(ONE[i]).stage)).toEqual([])
  })
  it('every recipe of the family is exercised above', () => {
    const ids = new Set([...ROWS.map((r) => r[0].recipe), ...ONE.map((r) => r.recipe)])
    for (const id of RECIPE_IDS.filter((x) => x.startsWith('tdg-'))) expect(ids.has(id), id).toBe(true)
  })
  const refused = (ref: RecipeRef): string => {
    const r = runRecipe(ref, 'here')
    return r.ok ? '' : r.problems.join(' | ')
  }
  it('refuses what cannot be drawn', () => {
    expect(refused(mm('gross', 'none', { M: 2, readouts: ['q'] }))).toMatch(/q needs a factory/)
    expect(refused(mm('gross', '1e-3', { M: 8, layout: 'triangular' }))).toMatch(/at most 6 modules/)
    expect(refused(mm('gross', '1e-3'))).toMatch(/exactly one of M and budget/)
    expect(refused(R('tdg-distribute', { n: 5 }))).toMatch(/params\.n/)
    expect(refused(R('tdg-failure', { series: ['g-idle'], view: 'compare' }))).toMatch(/needs an odd distance/)
    expect(refused(R('tdg-failure', { series: ['nope'], view: 'pp' }))).toMatch(/params\.series/)
    expect(refused(R('tdg-factory', { d1: 4 }))).toMatch(/d1 = 3 and 5/)
    expect(refused(R('tdg-basis', { code: 'gross', ops: ['X1', 'X1'] }))).toMatch(/each operator once/)
  })
})

describe('tdg recipes: every claim of P1 cites an output the recipe really returns', () => {
  it('all claim and challenge references run', () => {
    const claims: ClaimSpec[] = []
    for (const u of P1.units) {
      for (const b of u.story) {
        claims.push(...(b.claims ?? []), ...(b.reveal?.claims ?? []))
        for (const side of ['ground', 'formal'] as const) for (const s of b.derivation?.[side] ?? []) claims.push(...(s.claims ?? []))
      }
    }
    expect(claims.length).toBeGreaterThan(150)
    for (const c of claims) expect(run(c.from).values[c.value], `${c.key} ← ${c.from.recipe}.${c.value}`).toBeTypeOf('number')
  })
})
