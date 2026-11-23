/**
 * The seven B5 recipes (papers/recipes.b5.ts): every output the chapter prints agrees with the numpy twin (pipeline/claims_papers/b5.py) at 1e-12, every challenge answer is the
 * independent value, every stage a recipe returns passes its kind's validator, bad parameters are refused with a path, and the cost of the exact enumerations stays small.
 */
import { describe, expect, it, vi } from 'vitest'
import claims from '../physics/__fixtures__/claims-papers/b5.json'
import checks from '../physics/__fixtures__/readout-b5.json'
import { validateLayout } from '../stage/resolve'
import '../stage/svg/kinds'
import { RECIPE_IDS, runRecipe, type RecipeRef } from './recipes'

vi.setConfig({ testTimeout: 60_000 })

const K = claims.values as Record<string, number>
const X = checks.values as Record<string, number>
const R = (recipe: string, params: object = {}): RecipeRef => ({ recipe, params }) as RecipeRef
const out = (ref: RecipeRef, name: string): number => {
  const r = runRecipe(ref)
  if (!r.ok) throw new Error(r.problems.join('\n'))
  return r.values[name]
}
const near = (got: number, want: number, tol = 1e-12): void => expect(Math.abs(got - want), `${got} vs ${want}`).toBeLessThan(tol)

const IN = { sigma: 0.9, photons: 20, background: 0.4 }
const pf = (sites: number[][], extra: object = {}) => R('pixel-frame', { rows: 5, cols: 9, sites, ...IN, ...extra })
const fc = (view: string, extra: object = {}) => R('filter-compare', { ...IN, tau: 1, view, ...extra })
const lf = (view: string, extra: object = {}) => R('learned-filter', { ...IN, p: 0.5, spacing: 2, view, ...extra })
const ld = (view: string, extra: object = {}) => R('linear-denoise', { ...IN, p: 0.5, view, ...extra })

type Row = [ref: RecipeRef, output: string, key: string]
const ROWS: Row[] = [
  [pf([[2, 2]]), 'share0', 'b5PsfCenter'],
  [pf([[2, 2]]), 'shareEdge', 'b5PsfEdge'],
  [pf([[2, 2]]), 'shareCorner', 'b5PsfCorner'],
  [pf([[2, 2]]), 'roi3', 'b5PsfRoi3'],
  [pf([[2, 2]]), 'roi5', 'b5PsfRoi5'],
  [pf([[2, 2]]), 'sigC', 'b5SigC'],
  [pf([[2, 2]]), 'sigE', 'b5SigE'],
  [pf([[2, 2]]), 'sigK', 'b5SigK'],
  [pf([[2, 2], [2, 4]]), 'cross', 'b5CrossFrac2'],
  [pf([[2, 2], [2, 6]]), 'cross', 'b5CrossFrac4'],
  [pf([[2, 2]]), 'sigma', 'b5RoiSigma'],
  [pf([[2, 2]]), 'background', 'b5RoiBackground'],
  [R('pixel-frame', { rows: 5, cols: 5, sites: [[2, 2]], sigma: 0.6, photons: 20, background: 0.4 }), 'out3', 'b5OutsideSig06'],
  [R('pixel-frame', { rows: 5, cols: 5, sites: [[2, 2]], sigma: 1.2, photons: 20, background: 0.4 }), 'out3', 'b5OutsideSig12'],
  [fc('llr-line'), 'wLlrC', 'b5WLlrC'],
  [fc('llr-line'), 'wLlrE', 'b5WLlrE'],
  [fc('llr-line'), 'wLlrK', 'b5WLlrK'],
  [fc('llr-line'), 'threshold', 'b5LlrThreshold'],
  [fc('llr-line', { pixelS: 1.2, pixelN: 3 }), 'llrPixel', 'b5LlrOnePixel'],
  [fc('errors'), 'errCentre', 'b5ErrCenter'],
  [fc('errors'), 'errSquare', 'b5ErrSquare3'],
  [fc('errors'), 'errGauss', 'b5ErrGauss'],
  [fc('errors'), 'errLlr', 'b5ErrLlr'],
  [fc('errors'), 'errBayes', 'b5ErrBayes'],
  [fc('errors'), 'squarePoisson', 'b5SquarePoisson'],
  [fc('dprime'), 'dprime2', 'b5Dprime2'],
  [fc('dprime'), 'normalErrM', 'b5NormalErrM'],
  [fc('dprime'), 'normalErrE', 'b5NormalErrE'],
  [fc('dprime', { tau: 4 }), 'dprimeRatio', 'b5DprimeRatio4'],
  [fc('errors', { tau: 0.5 }), 'errLlr', 'b5ErrLlrTauHalf'],
  [fc('errors', { tau: 2 }), 'errLlr', 'b5ErrLlrTau2'],
  [fc('errors', { tau: 2 }), 'errSquare', 'b5ErrSquareTau2'],
  [fc('dprime'), 'sigma', 'b5MfSigma'],
  [fc('dprime'), 'background', 'b5MfBackground'],
  [R('filter-compare', { sigma: 0.9, photons: 20, background: 1, tau: 1, view: 'llr-line', pixelS: 3, pixelN: 0 }), 'llrPixelWeight', 'b5ClueW'],
  [R('filter-compare', { sigma: 0.9, photons: 20, background: 1, tau: 9, view: 'dprime' }), 'dprimeRatio', 'b5ClueRatio9'],
  [lf('profile'), 'xtW0', 'b5XtW0'],
  [lf('profile'), 'xtW1', 'b5XtW1'],
  [lf('profile'), 'xtW2', 'b5XtW2'],
  [lf('profile'), 'xtW3', 'b5XtW3'],
  [lf('profile'), 'xtN4', 'b5XtN4'],
  [lf('profile'), 'xtN5', 'b5XtN5'],
  [lf('profile'), 'xtN6', 'b5XtN6'],
  [lf('profile'), 'iso4', 'b5XtIso4'],
  [lf('profile'), 'iso5', 'b5XtIso5'],
  [lf('profile'), 'q', 'b5Q'],
  [lf('profile'), 'shrink', 'b5LsShrink'],
  [R('conv-stack', { layers: [{ k: 3, cin: 1, cout: 32 }, { k: 3, cin: 32, cout: 64 }, { k: 3, cin: 64, cout: 128 }], dense: [128, 2], input: 10, view: 'numbers' }), 'params', 'b5CnnSiteParams'],
  [R('conv-stack', { layers: [{ k: 3, cin: 1, cout: 32 }, { k: 3, cin: 32, cout: 64 }, { k: 3, cin: 64, cout: 128 }], view: 'numbers' }), 'rf', 'b5RfCnn'],
  [ld('bars'), 'd2Raw', 'b5D2Raw'],
  [ld('bars'), 'd2Wiener', 'b5D2Wiener'],
  [ld('bars'), 'd2BlurCentre', 'b5D2BlurCentre'],
  [ld('bars'), 'd2Crop3', 'b5D2Crop3'],
  [ld('bars'), 'd2Centre', 'b5D2Centre'],
  [ld('bars'), 'blurFrac', 'b5BlurFrac'],
  [ld('bars', { q: 3 }), 'shrinkQ', 'b5ClueShrink3'],
  [R('conv-stack', { layers: [{ k: 4, cin: 1, cout: 1, stride: 2 }, { k: 4, cin: 1, cout: 1, stride: 2 }, { k: 4, cin: 1, cout: 1, stride: 2 }, { k: 4, cin: 1, cout: 1 }, { k: 4, cin: 1, cout: 1 }], view: 'numbers' }), 'rf', 'b5Rf70'],
  [R('conv-stack', { layers: [{ k: 3, cin: 1, cout: 1, stride: 2, repeat: 4 }], view: 'numbers' }), 'rf', 'b5RfGdfD'],
  [R('cgan-terms', { D: 0.2, lambda: 200, l1: 0.0362, l1Reported: true }), 'l1Scaled', 'b5L1Scaled'],
  [R('cgan-terms', { D: 0.5, lambda: 200, l1: 0.0362 }), 'ganEq', 'b5GanEq'],
  [R('cgan-terms', { D: 0.2, lambda: 200, l1: 0.0362 }), 'ganTerm', 'b5GanFake02'],
  [R('cgan-terms', { D: 0.25, lambda: 200, l1: 0.02 }), 'ganTerm', 'b5ClueGan'],
  [R('cgan-terms', { D: 0.25, lambda: 200, l1: 0.02 }), 'l1Scaled', 'b5ClueL1'],
  [R('cgan-terms', { D: 0.5, lambda: 200, l1: 0.0362 }), 'smoothFloor', 'b5SmoothFloor'],
  [R('prior-posterior', { llr: -1, prior: 0.5 }), 'posterior', 'b5PostEqual'],
  [R('prior-posterior', { llr: -1, prior: 0.9 }), 'posterior', 'b5PostPrior90'],
  [R('prior-posterior', { llr: -1, prior: 0.9 }), 'flip', 'b5FlipPrior'],
  [R('prior-posterior', { llr: -1, prior: 0.5, prior2: 0.1 }), 'shift', 'b5ShiftLogit'],
  [R('prior-posterior', { llr: -2, prior: 0.8 }), 'posterior', 'b5CluePost'],
]
const GEN: RecipeRef = R('conv-stack', {
  layers: [
    { k: 3, cin: 1, cout: 64, bias: false },
    { k: 3, cin: 64, cout: 128, bias: false },
    { k: 3, cin: 128, cout: 256, bias: false },
    { k: 3, cin: 256, cout: 256, bias: false, repeat: 6 },
    { k: 4, cin: 256, cout: 128, bias: false },
    { k: 4, cin: 256, cout: 64, bias: false },
    { k: 3, cin: 128, cout: 1, bias: false },
  ],
  view: 'numbers',
})
const GEN1: RecipeRef = R('conv-stack', {
  layers: [
    { k: 3, cin: 1, cout: 64, bias: false },
    { k: 3, cin: 64, cout: 128, bias: false },
    { k: 3, cin: 128, cout: 256, bias: false },
    { k: 3, cin: 256, cout: 256, bias: false, repeat: 3 },
    { k: 4, cin: 256, cout: 128, bias: false },
    { k: 4, cin: 256, cout: 64, bias: false },
    { k: 3, cin: 128, cout: 1, bias: false },
  ],
  view: 'numbers',
})

describe('B5 recipes: every printed output agrees with the numpy twin', () => {
  it.each(ROWS.map((r) => [r[2], r] as const))('%s', (_, [ref, name, key]) => near(out(ref, name), K[key]))
  it('the two generator counts (with and without a second convolution per block)', () => {
    near(out(GEN, 'params'), K.b5GenParams2)
    near(out(GEN1, 'params'), K.b5GenParams1)
  })
  it('the likelihood-ratio statistic reaches the Bayes error through two routes', () => {
    near(out(fc('errors'), 'errLlr'), out(fc('errors'), 'errBayes'))
  })
})

describe('B5 recipes: challenge answers are the independent values', () => {
  it('roi', () => {
    near(out(R('pixel-frame', { rows: 5, cols: 5, sites: [[2, 2]], sigma: 0.6, photons: 20, background: 0.4 }), 'share0'), X['ch.roi.centre06'])
    near(out(R('pixel-frame', { rows: 5, cols: 5, sites: [[2, 2]], sigma: 1.2, photons: 20, background: 0.4 }), 'roi5'), X['ch.roi.box5s12'])
    expect(out(pf([[2, 2]]), 'dim5')).toBe(X['ch.roi.dim'])
  })
  it('matched filter', () => {
    near(out(R('filter-compare', { sigma: 0.9, photons: 20, background: 1, tau: 1, view: 'llr-line', pixelS: 3, pixelN: 0 }), 'llrPixelWeight'), X['ch.mf.w'])
    near(out(R('filter-compare', { sigma: 0.9, photons: 20, background: 1, tau: 9, view: 'dprime' }), 'dprimeRatio'), X['ch.mf.ratio'])
    // d² = Σ s²/b for s = (4, 1), b = (1, 1): the challenge's own arithmetic, 17
    expect(16 / 1 + 1 / 1).toBe(X['ch.mf.d2'])
  })
  it('cnn', () => {
    expect(out(R('conv-stack', { layers: [{ k: 3, cin: 16, cout: 32 }], view: 'numbers' }), 'params')).toBe(X['ch.cnn.conv'])
    expect(out(R('conv-stack', { layers: [3, 3, 3, 3].map((k) => ({ k, cin: 1, cout: 1 })), view: 'numbers' }), 'rf')).toBe(X['ch.cnn.rf'])
    near(out(lf('profile', { background: 1, ratio: [4, 1] }), 'wRatio'), X['ch.cnn.wratio'])
  })
  it('wiener and pix2pix', () => {
    near(out(ld('bars'), 'kernelCentre'), X['ch.wi.centre'])
    near(out(ld('bars', { q: 3 }), 'shrinkQ'), X['ch.wi.shrink'])
    near(out(R('cgan-terms', { D: 0.25, lambda: 200, l1: 0.02 }), 'ganTerm'), X['ch.p2.gan'])
    near(out(R('cgan-terms', { D: 0.25, lambda: 200, l1: 0.02 }), 'l1Scaled'), X['ch.p2.l1'])
    near(out(R('prior-posterior', { llr: -2, prior: 0.8 }), 'posterior'), X['ch.p2.post'])
  })
})

describe('B5 recipes: pictures pass their kind’s validator, bad parameters are refused with a path', () => {
  const refs: RecipeRef[] = [
    pf([[2, 2]], { roi: 3 }),
    pf([[2, 2], [2, 4]], { noise: 'poisson', seed: 7 }),
    fc('errors'),
    fc('tau'),
    fc('dprime'),
    fc('pmf'),
    fc('llr-line'),
    fc('wsx'),
    lf('profile'),
    lf('frame'),
    ld('bars'),
    ld('frame'),
    R('conv-stack', { layers: [3, 3, 3].map((k) => ({ k, cin: 1, cout: 1 })), view: 'frame', input: 10 }),
    R('conv-stack', { layers: [{ k: 3, cin: 1, cout: 4 }], view: 'numbers' }),
    R('cgan-terms', { D: 0.4, lambda: 100, l1: 0.1 }),
    R('prior-posterior', { llr: 1, prior: 0.3 }),
  ]
  it.each(refs.map((r, i) => [`${(r as { recipe: string }).recipe} #${i}`, r] as const))('%s', (_, ref) => {
    const r = runRecipe(ref)
    if (!r.ok) throw new Error(r.problems.join('\n'))
    expect(validateLayout(r.stage)).toEqual([])
  })
  it('refusals', () => {
    const bad = (ref: RecipeRef) => {
      const r = runRecipe(ref)
      return r.ok ? [] : r.problems.join('\n')
    }
    expect(bad(pf([[7, 7]]))).toContain('params.sites[0]')
    expect(bad(pf([[2, 2]], { show: 'counts' }))).toContain("'counts' needs noise")
    expect(bad(pf([[2, 2]], { roi: 9 }))).toContain('params.roi')
    expect(bad(fc('errors', { tau: 8 }))).toContain('params.tau')
    expect(bad(fc('tau', { tau: 2 }))).toContain('params.tau')
    expect(bad(fc('errors', { pixelS: 1 }))).toContain('params.pixelS')
    expect(bad(fc('errors', { background: 0 }))).toContain('params.background')
    expect(bad(R('conv-stack', { layers: [{ k: 3, cin: 1, cout: 1 }], view: 'numbers', dense: [4] }))).toContain('params.dense')
    expect(bad(R('conv-stack', { layers: [{ k: 4, cin: 1, cout: 1 }], view: 'frame' }))).toContain("params.view")
    expect(bad(R('prior-posterior', { llr: 20, prior: 0.5 }))).toContain('params.llr')
    expect(bad(R('cgan-terms', { D: 1, lambda: 1, l1: 0 }))).toContain('params.D')
    expect(RECIPE_IDS).toEqual(expect.arrayContaining(['pixel-frame', 'filter-compare', 'learned-filter', 'linear-denoise', 'conv-stack', 'cgan-terms', 'prior-posterior']))
  })
  it('the dear views stay cheap enough to run on every validation', () => {
    const t0 = performance.now()
    runRecipe(fc('tau'))
    runRecipe(fc('errors', { tau: 2 }))
    expect(performance.now() - t0).toBeLessThan(20_000)
  })
})
