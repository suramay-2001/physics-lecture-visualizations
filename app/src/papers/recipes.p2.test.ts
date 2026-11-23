/**
 * The nine P2 recipes (papers/recipes.p2.ts): every output the lecture prints agrees with the numpy twin (pipeline/claims_papers/p2.py) at 1e-12, every challenge answer is the independent
 * value, every stage a recipe returns passes its kind's validator, and bad parameters are refused with a path.
 */
import { describe, expect, it } from 'vitest'
import claims from '../physics/__fixtures__/claims-papers/p2.json'
import checks from '../physics/__fixtures__/readout-p2.json'
import { validateLayout } from '../stage/resolve'
import '../stage/svg/kinds'
import { RECIPE_IDS, runRecipe, type RecipeRef } from './recipes'

const K = claims.values as Record<string, number>
const X = checks.values as Record<string, number>
const R = (recipe: string, params: object = {}): RecipeRef => ({ recipe, params }) as RecipeRef
const out = (ref: RecipeRef, name: string): number => {
  const r = runRecipe(ref)
  if (!r.ok) throw new Error(r.problems.join('\n'))
  return r.values[name]
}
const near = (got: number, want: number, tol = 1e-12): void => expect(Math.abs(got - want), `${got} vs ${want}`).toBeLessThan(tol)

const TL = { drawn: 3, d: 100, tg: 0.01, tr: 3, tden: 0.1, tc: 0.4 }
const F = (tol: number, view = 'readback', extra: object = {}) => R('fig15-readback', { tol, view, ...extra })
const PR = (a: number, b: number) => R('printed-ratio', { a, b, aLabel: 'a', bLabel: 'b' })
type Row = [ref: RecipeRef, output: string, key: string]
const ROWS: Row[] = [
  [R('platform-gap'), 'gapNA', 'p2GapNA'],
  [R('platform-gap'), 'gapSC', 'p2GapSC'],
  [R('platform-gap'), 'fracNA', 'p2ReadFracNA'],
  [R('platform-gap'), 'fracSC', 'p2ReadFracSC'],
  [R('platform-gap', { slower: 1000 }), 'scale', 'p2RuntimeScale'],
  [R('dual-path', { attenuation: 10, view: 'overlap' }), 'snrLoss', 'p2SnrSqrt'],
  [R('dual-path', { attenuation: 10, view: 'frames' }), 'expLo', 'p2ExpLo'],
  [R('dual-path', { attenuation: 10, view: 'frames' }), 'expHi', 'p2ExpHi'],
  [R('dual-path', { attenuation: 10, view: 'frames' }), 'sites', 'p2Sites'],
  [R('dual-path', { attenuation: 10, view: 'frames' }), 'split', 'p2Split'],
  [R('dual-path', { attenuation: 10, view: 'frames' }), 'sitesAllDurations', 'p2Sites14'],
  [PR(15, 4), 'ratio', 'p2MisRatio'],
  [PR(355000, 20000), 'ratio', 'p2ParRatioMF'],
  [PR(1270000, 355000), 'ratio', 'p2ParRatioFNN'],
  [PR(4.7e6, 355000), 'ratio', 'p2DenoiserRatio'],
  [PR(3.6, 2.9), 'ratio', 'p2CrossRatio5'],
  [PR(4, 3.2), 'ratio', 'p2CrossRatio9'],
  [PR(2.174, 0.201), 'ratio', 'p2Lat34'],
  [R('eta-factor', { eta: 60.9 }), 'factor', 'p2EtaMF'],
  [R('eta-factor', { eta: 62.1 }), 'factor', 'p2EtaCNN'],
  [R('eta-factor', { eta: 66.1 }), 'factor', 'p2EtaFNN'],
  [R('eta-factor', { eta: 64 }), 'factor', 'p2Eta5'],
  [R('eta-factor', { eta: 53 }), 'factor', 'p2Eta9'],
  [R('latency-tp', { view: 'table3' }), 'pixelRatio', 'p2PixelRatio'],
  [R('latency-tp', { view: 'table3' }), 'latRatio', 'p2LatRatio'],
  [R('latency-tp', { view: 'table3' }), 'perSite4', 'p2PerSite4'],
  [R('latency-tp', { view: 'table3' }), 'perSite64', 'p2PerSite64'],
  [R('latency-tp', { view: 'table4' }), 'latTp', 'p2LatTP'],
  [R('latency-tp', { view: 'table4' }), 'batch128', 'p2BatchTime'],
  [R('post-select', { sep: 2, cut: 1 }), 'keep', 'p2KeepFrac'],
  [R('post-select', { sep: 2, cut: 1 }), 'errKept', 'p2KeptErr'],
  [R('post-select', { sep: 2, cut: 1 }), 'errAll', 'p2PlainErr'],
  [R('readout-timeline', { mode: 'ac', ...TL }), 'tUnp', 'p2TUnp'],
  [R('readout-timeline', { mode: 'ac', ...TL }), 'tPip', 'p2TPip'],
  [R('readout-timeline', { mode: 'ac', ...TL }), 'saving', 'p2Saving'],
  [F(1), 'save', 'p2Save'],
  [F(1), 'savePct', 'p2SavePct'],
  [F(1), 'tc', 'p2TclImplied'],
  [F(1), 'trgBase', 'p2TroImplied1'],
  [F(2), 'trgBase', 'p2TroImplied2'],
  [F(3), 'trgBase', 'p2TroImplied3'],
  [F(1), 'ganTrg', 'p2GanTro1'],
  [F(2), 'ganTrg', 'p2GanTro2'],
  [F(3), 'ganTrg', 'p2GanTro3'],
  [F(1), 'ratio', 'p2Ratio1'],
  [F(2), 'ratio', 'p2Ratio2'],
  [F(3), 'ratio', 'p2Ratio3'],
  [F(3), 'equalDiff', 'p2EqualTro'],
  [F(3, 'text'), 'gap190', 'p2TextGap190'],
  [F(3, 'text'), 'gap152', 'p2TextGap152'],
  [F(3, 'text'), 'textRatio', 'p2TextRatio'],
  [R('trade-toy', { view: 'logical', d: 11 }), 'interior', 'p2UMin'],
  [R('trade-toy', { view: 'ratio', d: 11 }), 'grows', 'p2RatioGrows'],
]

describe('every output the lecture prints agrees with the numpy twin', () => {
  it.each(ROWS.map((r, i) => [i, r[2], r] as const))('%#: %s', (_i, key, [ref, name]) => near(out(ref, name), K[key]))
  it('the challenge answers are the independent values', () => {
    near(out(R('readout-timeline', { mode: 'ac', ...TL }), 'tPip'), X['ch.eq5'], 1e-9)
    near(out(R('readout-timeline', { mode: 'ac', ...TL }), 'saving'), X['ch.saving'], 1e-9)
    near(out(R('eta-factor', { eta: 62.1, base: 4 }), 'newErr'), X['ch.eta.newErr'])
    near(out(F(1), 'tc'), X['ch.tc'])
    near(out(R('latency-tp', { view: 'table4' }), 'batch128'), X['ch.batch'])
    near(out(R('conv-stack', { layers: [{ k: 3, cin: 128, cout: 256, bias: false }], view: 'numbers' }), 'params'), X['ch.enc3'], 0.5)
  })
  it('the generator and discriminator of Table 2 are counted by B5’s conv-stack: 4 695 744 or 2 926 272 weights, and 1 549 376', () => {
    const gen = (rep: number) =>
      R('conv-stack', {
        layers: [
          { k: 3, cin: 1, cout: 64, bias: false },
          { k: 3, cin: 64, cout: 128, bias: false },
          { k: 3, cin: 128, cout: 256, bias: false },
          { k: 3, cin: 256, cout: 256, bias: false, repeat: rep },
          { k: 4, cin: 256, cout: 128, bias: false },
          { k: 4, cin: 256, cout: 64, bias: false },
          { k: 3, cin: 128, cout: 1, bias: false },
        ],
        view: 'numbers',
      })
    near(out(gen(3), 'params'), K.p2GenParams1, 0.5)
    near(out(gen(6), 'params'), K.p2GenParams2, 0.5)
    near(
      out(
        R('conv-stack', {
          layers: [
            { k: 3, cin: 1, cout: 64, bias: false },
            { k: 3, cin: 64, cout: 128, bias: false },
            { k: 3, cin: 128, cout: 256, bias: false },
            { k: 3, cin: 256, cout: 512, bias: false },
            { k: 1, cin: 512, cout: 1, bias: false },
          ],
          view: 'numbers',
        }),
        'params',
      ),
      K.p2DiscParams,
      0.5,
    )
  })
  it('the cost of a stalling classifier is not the paper’s Eq. 5: hides is 0 when t_den + t_c exceeds t_g + t_r', () => {
    expect(out(R('readout-timeline', { mode: 'c', ...TL, tr: 0.3 }), 'hides')).toBe(0)
    expect(out(R('readout-timeline', { mode: 'c', ...TL }), 'hides')).toBe(1)
  })
})

describe('stages and refusals', () => {
  const REFS: RecipeRef[] = [
    R('platform-gap'),
    R('readout-timeline', { mode: 'cycle', drawn: 1, d: 1, tg: 0.4, tr: 1, tden: 0, tc: 0, treset: 0.3 }),
    R('readout-timeline', { mode: 'abc', drawn: 4, d: 4, tg: 0.4, tr: 2, tden: 0.3, tc: 0.5 }),
    R('readout-timeline', { mode: 'ac', ...TL }),
    F(2, 'bars'),
    F(2, 'readback'),
    F(3, 'text'),
    R('eta-factor', { eta: 64 }),
    R('latency-tp', { view: 'table3' }),
    R('latency-tp', { view: 'table4' }),
    R('latency-tp', { view: 'table5' }),
    R('dual-path', { attenuation: 10, view: 'frames' }),
    R('dual-path', { attenuation: 10, view: 'overlap' }),
    PR(3.6, 2.9),
    R('post-select', { sep: 2, cut: 1 }),
    R('trade-toy', { view: 'parts', d: 11 }),
    R('trade-toy', { view: 'logical', d: 11 }),
    R('trade-toy', { view: 'ratio', d: 11 }),
  ]
  it.each(REFS.map((r, i) => [i, (r as { recipe: string }).recipe, r] as const))('%#: %s returns a stage its kind accepts', (_i, _id, ref) => {
    const r = runRecipe(ref)
    if (!r.ok) throw new Error(r.problems.join('\n'))
    expect(validateLayout(r.stage)).toEqual([])
  })
  it('bad parameters are refused with a path', () => {
    const p = (ref: RecipeRef): string[] => {
      const r = runRecipe(ref, 'here')
      return r.ok ? [] : r.problems
    }
    expect(p(R('readout-timeline', { mode: 'cycle', ...TL }))[0]).toMatch(/params\.treset/)
    expect(p(R('readout-timeline', { mode: 'a', ...TL, treset: 0.2 }))[0]).toMatch(/params\.treset/)
    expect(p(R('readout-timeline', { mode: 'a', ...TL, drawn: 9 }))[0]).toMatch(/params\.drawn/)
    expect(p(R('eta-factor', { eta: 100 }))[0]).toMatch(/params\.eta/)
    expect(p(R('trade-toy', { view: 'parts', d: 10 }))[0]).toMatch(/params\.d/)
    expect(p(R('fig15-readback', { tol: 4, view: 'bars' }))[0]).toMatch(/params\.tol/)
    expect(p(R('dual-path', { attenuation: 1, view: 'frames' }))[0]).toMatch(/params\.attenuation/)
    expect(RECIPE_IDS).toContain('trade-toy')
  })
})
