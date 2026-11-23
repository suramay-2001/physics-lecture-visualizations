/**
 * The seven `b5-*`-chapter recipes of the Papers background chapter B5, "From pixels to bits" (P-B5-story §9.3; rulings gandalf-batch.md G1–G3): allow-listed engine computations
 * (physics/readout/classify.ts, with the platform's physics/optics/imaging.ts) with typed parameters, returning props for the camera-frame and plot kinds and the named numbers a
 * computed claim may cite. Registered in papers/recipes.ts `RECIPES` through `B5_RECIPES`; their own file so chapters built in parallel append to separate files. Pure: no clock, no
 * randomness (a frame's seeded draw is the camera-frame kind's own). Our model throughout: N photons over a Gaussian spot of width σ pixels, a background b per pixel, Poisson counts.
 * Conventions as recipes.tdg.ts: scientific notation as a mantissa `...M` and a whole positive exponent `...E`; a negative quantity is returned as a positive magnitude.
 */
import type { CameraFrameState, PlotPoint, PlotPointsState, StageState } from '../content/stage'
import { normalTail, poissonPmf } from '../physics/optics/imaging'
import {
  CLASSES_3X3,
  bayesError,
  blurMatrix,
  boxShare,
  classSignals,
  convParams,
  denseParams,
  dprime2,
  flipPrior,
  ganTerms,
  isolatedQ,
  linearD2,
  llrOnePixel,
  llrWeights,
  logitShift,
  normalError,
  populationFilter,
  posteriorBright,
  poissonSumError,
  psfPixelShare,
  receptiveField,
  smoothedBceFloor,
  statisticError,
  windowShare,
  wienerSmoother,
} from '../physics/readout/classify'
import { bool, int, list, num, oneOf, optional, shape } from './params'
import type { RecipeDef } from './recipes'

const def = <P>(d: RecipeDef<P>): RecipeDef<P> => d

const pt = (x: number, y: number, label?: string, status?: PlotPoint['status'], group?: string): PlotPoint => ({ x, y, ...(label ? { label } : {}), ...(status ? { status } : {}), ...(group ? { group } : {}) })
const pts = (points: PlotPoint[], extra: Omit<PlotPointsState, 'kind' | 'points'>): StageState => ({ kind: 'plot', points, ...extra })
/** Scientific notation of a positive number below 1: the mantissa in [1, 10) and the whole exponent (the value is M × 10^−E). */
const sciNeg = (x: number): { m: number; e: number } => {
  const e = -Math.floor(Math.log10(x))
  return { m: x * 10 ** e, e }
}

/** The exact enumerations are the dear step: memoised by their inputs (a pure function, so a repeat run is free). */
const memo = new Map<string, number>()
const cached = (key: unknown[], f: () => number): number => {
  const k = JSON.stringify(key)
  let v = memo.get(k)
  if (v === undefined) {
    v = f()
    memo.set(k, v)
  }
  return v
}

/** The model of one atom among three symmetry classes at exposure `tau` (photons and background both × tau): class signals, bright and dark means, the likelihood-ratio weights. */
function model(sigma: number, photons: number, background: number, tau: number) {
  const s = classSignals(sigma, photons).map((x) => tau * x)
  const b = tau * background
  return { s, b, bright: s.map((x) => b + x), dark: [b, b, b], llr: llrWeights(s, b) }
}
type Model = ReturnType<typeof model>
const errOf = (name: 'centre' | 'flat' | 'gauss' | 'llr' | 'bayes', sigma: number, photons: number, background: number, tau: number, m: Model): number =>
  cached([name, sigma, photons, background, tau], () => {
    if (name === 'bayes') return bayesError(m.bright, m.dark)
    const w = name === 'centre' ? [1, 0, 0] : name === 'flat' ? [1, 1, 1] : name === 'llr' ? m.llr : m.s
    return statisticError(w, m.bright, m.dark).err
  })
const SIGMA = num(0.3, 1.5)
const PHOTONS = num(1, 200)
const BACKGROUND = num(0, 5)

/* ---------------------------------------------------------------------------------------------- */
/* pixel-frame: where one atom's light lands, ROI and crosstalk                                    */
/* ---------------------------------------------------------------------------------------------- */

export const pixelFrameRecipe = def({
  id: 'pixel-frame',
  version: 1,
  title: 'A frame of pixels with up to four atoms (our model: N photons, Gaussian width σ, background b): the shares of light, a ROI and a neighbour’s crosstalk',
  kinds: ['camera-frame'],
  params: shape({
    rows: int(3, 12),
    cols: int(3, 12),
    sites: list(list(int(0, 11), 2, 2), 1, 4),
    sigma: SIGMA,
    photons: PHOTONS,
    background: BACKGROUND,
    noise: optional(oneOf(['none', 'poisson'] as const)),
    seed: optional(int(0, 1_000_000)),
    roi: optional(int(1, 5)),
    /** Draw the ROI box without its photon-total readout (a clue's picture must not print the answer). */
    quiet: optional(bool()),
    show: optional(oneOf(['photons', 'counts', 'occupancy'] as const)),
    panels: optional(list(shape({ show: oneOf(['photons', 'counts', 'occupancy', 'weights'] as const), filter: optional(oneOf(['square', 'gauss', 'llr', 'centre', 'learned'] as const)) }), 1, 3)),
  }),
  rules: (p) => {
    const bad: string[] = []
    if (p.panels !== undefined && p.show !== undefined) bad.push('params.panels: give show or panels, not both')
    p.panels?.forEach((q, i) => {
      if (q.show === 'weights' && (q.filter === undefined || p.roi === undefined)) bad.push(`params.panels[${i}]: weights need a filter and a roi`)
      if (q.show !== 'weights' && q.filter !== undefined) bad.push(`params.panels[${i}]: a filter only goes with weights`)
      if (q.show === 'counts' && (p.noise ?? 'none') === 'none') bad.push(`params.panels[${i}]: 'counts' needs noise 'poisson'`)
      if (q.filter === 'llr' && !(p.background > 0)) bad.push(`params.panels[${i}]: the llr filter needs a background above 0`)
    })
    p.sites.forEach((s, i) => {
      if (s[0] >= p.rows || s[1] >= p.cols) bad.push(`params.sites[${i}]: inside the ${p.rows} × ${p.cols} frame`)
    })
    if (new Set(p.sites.map((s) => `${s[0]},${s[1]}`)).size !== p.sites.length) bad.push('params.sites: each atom once')
    if (p.roi !== undefined && (p.roi > p.rows || p.roi > p.cols)) bad.push('params.roi: no larger than the frame')
    if (p.show === 'counts' && (p.noise ?? 'none') === 'none') bad.push("params.show: 'counts' needs noise 'poisson'")
    return bad
  },
  run: (p) => {
    const sig = classSignals(p.sigma, p.photons)
    const dim5 = (() => {
      let n = 0
      for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if (psfPixelShare(p.sigma, i) * psfPixelShare(p.sigma, j) < 0.01) n++
      return n
    })()
    const values: Record<string, number> = {
      sigma: p.sigma,
      photons: p.photons,
      background: p.background,
      share0: psfPixelShare(p.sigma, 0) ** 2,
      shareEdge: psfPixelShare(p.sigma, 0) * psfPixelShare(p.sigma, 1),
      shareCorner: psfPixelShare(p.sigma, 1) ** 2,
      roi3: boxShare(3, p.sigma),
      roi5: boxShare(5, p.sigma),
      out3: 1 - boxShare(3, p.sigma),
      out5: 1 - boxShare(5, p.sigma),
      sigC: sig[0],
      sigE: sig[1],
      sigK: sig[2],
      dim5,
    }
    if (p.sites.length >= 2) values.cross = windowShare(Math.max(Math.abs(p.sites[1][0] - p.sites[0][0]), Math.abs(p.sites[1][1] - p.sites[0][1])), p.sigma, 1)
    const stage: CameraFrameState = {
      kind: 'camera-frame',
      rows: p.rows,
      cols: p.cols,
      sites: p.sites.map((s) => [s[0], s[1]] as [number, number]),
      photons: p.photons,
      psf: p.sigma,
      background: p.background,
      noise: p.noise ?? 'none',
      seed: p.seed ?? 7,
      ...(p.roi !== undefined ? { roi: { size: p.roi }, readouts: (p.quiet ? ['atoms'] : ['atoms', 'roi']) as ('atoms' | 'roi')[] } : {}),
      ...(p.panels !== undefined ? { panel: p.panels.map((q) => ({ show: q.show, ...(q.filter ? { filter: q.filter } : {}) })) } : { show: p.show ?? ((p.noise ?? 'none') === 'poisson' ? 'counts' : 'photons') }),
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* filter-compare: the best weighted sum, and what it beats                                        */
/* ---------------------------------------------------------------------------------------------- */

const FC_VIEWS = ['errors', 'tau', 'dprime', 'pmf', 'llr-line', 'wsx'] as const
const TAUS = [0.5, 1, 1.5, 2, 3] as const

export const filterCompareRecipe = def({
  id: 'filter-compare',
  version: 1,
  title: 'Weighted sums of a 3 × 3 box under our model: exact errors of the centre pixel, a flat sum, a Gaussian-shaped sum and the likelihood-ratio sum, at exposure τ (photons and background × τ)',
  kinds: ['plot'],
  params: shape({
    sigma: SIGMA,
    photons: PHOTONS,
    background: num(0.01, 5),
    tau: num(0.25, 9),
    view: oneOf(FC_VIEWS),
    pixelS: optional(num(0.01, 20)),
    pixelN: optional(int(0, 40)),
    pairS: optional(list(num(0, 100), 2, 2)),
    pairB: optional(list(num(0.01, 100), 2, 2)),
  }),
  rules: (p) => {
    const bad: string[] = []
    if ((p.pairS === undefined) !== (p.pairB === undefined)) bad.push('params.pairS: give pairS and pairB together')
    if ((p.view === 'errors' || p.view === 'tau') && p.tau > 4) bad.push('params.tau: the exact enumeration takes tau up to 4')
    if (p.view === 'tau' && p.tau !== 1) bad.push("params.tau: view 'tau' sweeps the exposure itself (leave tau at 1)")
    if ((p.pixelS !== undefined || p.pixelN !== undefined) && p.view !== 'llr-line' && p.view !== 'pmf') bad.push("params.pixelS, params.pixelN: only with view 'llr-line' or 'pmf'")
    return bad
  },
  run: (p) => {
    const m = model(p.sigma, p.photons, p.background, p.tau)
    const m1 = model(p.sigma, p.photons, p.background, 1)
    const pixS = p.pixelS ?? 1.2
    const pixN = p.pixelN ?? 3
    const d2 = dprime2([m.s[2], m.s[1], m.s[2], m.s[1], m.s[0], m.s[1], m.s[2], m.s[1], m.s[2]], m.b)
    const d21 = dprime2([m1.s[2], m1.s[1], m1.s[2], m1.s[1], m1.s[0], m1.s[1], m1.s[2], m1.s[1], m1.s[2]], m1.b)
    const normal = normalError(Math.sqrt(d21), normalTail)
    const ne = sciNeg(normal)
    const values: Record<string, number> = {
      sigma: p.sigma,
      photons: p.photons,
      background: p.background,
      wLlrC: m.llr[0],
      wLlrE: m.llr[1],
      wLlrK: m.llr[2],
      threshold: CLASSES_3X3.reduce((t, k, i) => t + k * m.s[i], 0),
      dprime2: d2,
      dprimeRatio: Math.sqrt(d2 / d21),
      normalErrM: ne.m,
      normalErrE: ne.e,
      pixelS: pixS,
      llrPixel: llrOnePixel(pixN, pixS, p.background),
      ...(p.pairS && p.pairB ? { pairD2: dprime2(p.pairS, p.pairB) } : {}),
      llrPixelWeight: Math.log1p(pixS / p.background),
      squarePoisson: poissonSumError(m.bright[0] + 4 * m.bright[1] + 4 * m.bright[2], 9 * m.b).err,
    }
    let stage: StageState
    if (p.view === 'errors') {
      const e = {
        centre: errOf('centre', p.sigma, p.photons, p.background, p.tau, m),
        flat: errOf('flat', p.sigma, p.photons, p.background, p.tau, m),
        gauss: errOf('gauss', p.sigma, p.photons, p.background, p.tau, m),
        llr: errOf('llr', p.sigma, p.photons, p.background, p.tau, m),
        bayes: errOf('bayes', p.sigma, p.photons, p.background, p.tau, m),
      }
      Object.assign(values, { errCentre: e.centre, errSquare: e.flat, errGauss: e.gauss, errLlr: e.llr, errBayes: e.bayes })
      stage = pts(
        [pt(1, e.centre, 'centre pixel', 'computed'), pt(2, e.gauss, 'Gaussian shape', 'computed'), pt(3, e.flat, 'flat 3×3 box', 'computed'), pt(4, e.llr, 'likelihood ratio', 'computed')],
        { xLabel: 'four ways to sum the box', yLabel: 'chance of a wrong bit', yScale: 'log' },
      )
    } else if (p.view === 'tau') {
      const points: PlotPoint[] = []
      for (const t of TAUS) {
        const mt = model(p.sigma, p.photons, p.background, t)
        points.push(pt(t, errOf('flat', p.sigma, p.photons, p.background, t, mt), undefined, 'computed', 'flat box'))
        points.push(pt(t, errOf('gauss', p.sigma, p.photons, p.background, t, mt), undefined, 'computed', 'Gaussian shape'))
        points.push(pt(t, errOf('llr', p.sigma, p.photons, p.background, t, mt), undefined, 'computed', 'likelihood ratio'))
      }
      stage = pts(points, { xLabel: 'exposure τ', yLabel: 'chance of a wrong bit', yScale: 'log' })
    } else if (p.view === 'dprime') {
      const points = [0.25, 0.5, 1, 2, 4].map((t) => {
        const mt = model(p.sigma, p.photons, p.background, t)
        return pt(t, Math.sqrt(dprime2([mt.s[2], mt.s[1], mt.s[2], mt.s[1], mt.s[0], mt.s[1], mt.s[2], mt.s[1], mt.s[2]], mt.b)), undefined, 'computed', 'd′')
      })
      stage = pts(points, { xLabel: 'exposure τ', yLabel: 'separation d′' })
    } else if (p.view === 'pmf') {
      const points: PlotPoint[] = []
      for (let n = 0; n <= 8; n++) {
        points.push(pt(n, poissonPmf(n, p.background), undefined, 'computed', 'dark'))
        points.push(pt(n, poissonPmf(n, p.background + pixS), undefined, 'computed', 'bright'))
      }
      stage = pts(points, { xLabel: 'counts in one pixel', yLabel: 'chance' })
    } else if (p.view === 'llr-line') {
      const points = Array.from({ length: 9 }, (_, n) => pt(n, llrOnePixel(n, pixS, p.background), undefined, 'computed', 'evidence'))
      stage = pts(points, { xLabel: 'counts in one pixel', yLabel: 'log-likelihood ratio', yLines: [{ y: 0, label: 'even odds' }] })
    } else {
      const xs = [0.25, 0.5, 1, 2, 3, 4, 5, 6]
      const points = [...xs.map((x) => pt(x, Math.log1p(x), undefined, 'computed', 'ln(1 + s/b)')), ...xs.map((x) => pt(x, x, undefined, 'computed', 's/b'))]
      stage = pts(points, { xLabel: 's/b in one pixel', yLabel: 'weight' })
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* learned-filter: weights fitted from labelled shots                                              */
/* ---------------------------------------------------------------------------------------------- */

const LF_VIEWS = ['profile', 'frame'] as const

export const learnedFilterRecipe = def({
  id: 'learned-filter',
  version: 1,
  title: 'The population least-squares filter of a 7-pixel strip (one atom at pixel 2, a neighbour `spacing` pixels away, each present with chance p), alone and crowded; its 2-D frame view',
  kinds: ['plot', 'camera-frame'],
  params: shape({
    sigma: SIGMA,
    photons: PHOTONS,
    background: num(0.01, 5),
    p: num(0.1, 0.9),
    spacing: int(1, 4),
    view: oneOf(LF_VIEWS),
    ratio: optional(list(num(0.01, 100), 2, 2)),
  }),
  run: (p) => {
    const strip = (c: number) => Array.from({ length: 7 }, (_, i) => p.photons * psfPixelShare(p.sigma, i - c))
    const sA = strip(2)
    const sB = strip(2 + p.spacing)
    const rel = (w: number[]) => w.map((x) => x / Math.max(...w))
    const iso = rel(populationFilter([sA], 0, p.p, p.background))
    const xt = rel(populationFilter([sA, sB], 0, p.p, p.background))
    const { q, shrink } = isolatedQ(sA, p.background, p.p)
    const [ra, rb] = p.ratio ?? [4, 1]
    const values: Record<string, number> = {
      sigma: p.sigma,
      background: p.background,
      q,
      shrink,
      wRatio: ra / (p.background + p.p * ra) / (rb / (p.background + p.p * rb)),
      negatives: xt.filter((x) => x < 0).length,
    }
    iso.forEach((x, i) => (values[`iso${i}`] = x))
    xt.forEach((x, i) => {
      values[`xtW${i}`] = x
      values[`xtN${i}`] = Math.abs(x)
    })
    let stage: StageState
    if (p.view === 'profile') {
      stage = pts([...iso.map((x, i) => pt(i, x, undefined, 'computed', 'atom alone')), ...xt.map((x, i) => pt(i, x, undefined, 'computed', 'with a neighbour'))], {
        xLabel: 'pixel along the strip',
        yLabel: 'weight, largest = 1',
        yLines: [{ y: 0, label: 'no weight' }],
      })
    } else {
      stage = {
        kind: 'camera-frame',
        rows: 5,
        cols: 7,
        sites: [[2, 2], [2, 2 + p.spacing]],
        photons: p.photons,
        psf: p.sigma,
        background: p.background,
        noise: 'none',
        roi: { size: 5 },
        panel: [{ show: 'photons' }, { show: 'weights', filter: 'learned' }],
      } satisfies CameraFrameState
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* linear-denoise: a linear cleaner, then a statistic                                              */
/* ---------------------------------------------------------------------------------------------- */

export const linearDenoiseRecipe = def({
  id: 'linear-denoise',
  version: 1,
  title: 'Linear pipelines on a 7-pixel strip (Gaussian approximation d² of the output): raw pixels, the Wiener smoother, blur then the centre pixel, a 3-pixel crop and the centre pixel alone',
  kinds: ['plot', 'camera-frame'],
  params: shape({
    sigma: SIGMA,
    photons: PHOTONS,
    background: num(0.01, 5),
    p: num(0.1, 0.9),
    view: oneOf(['bars', 'frame'] as const),
    seed: optional(int(0, 1_000_000)),
    q: optional(num(0, 100)),
  }),
  run: (p) => {
    const s = Array.from({ length: 7 }, (_, i) => p.photons * psfPixelShare(p.sigma, i - 2))
    const I = Array.from({ length: 7 }, (_, i) => Array.from({ length: 7 }, (_, j) => (i === j ? 1 : 0)))
    const K = blurMatrix(7)
    const raw = linearD2(I, s, p.background, p.p)
    const wiener = linearD2(wienerSmoother(s, p.background, p.p), s, p.background, p.p)
    const blur = linearD2([K[2]], s, p.background, p.p)
    const crop = linearD2(I.slice(1, 4), s, p.background, p.p)
    const centre = linearD2(I.slice(2, 3), s, p.background, p.p)
    const k = p.p * (1 - p.p) * (p.q ?? isolatedQ(s, p.background, p.p).q)
    const values: Record<string, number> = {
      sigma: p.sigma,
      background: p.background,
      d2Raw: raw,
      d2Wiener: wiener,
      d2BlurCentre: blur,
      d2Crop3: crop,
      d2Centre: centre,
      blurFrac: blur / raw,
      shrink: isolatedQ(s, p.background, p.p).shrink,
      shrinkQ: k / (1 + k),
      kernelCentre: K[3][3],
      kernelSide: K[3][2],
    }
    let stage: StageState
    if (p.view === 'bars') {
      stage = pts(
        [pt(1, centre, 'centre pixel alone', 'computed'), pt(2, blur, 'blur, then centre', 'computed'), pt(3, crop, '3-pixel crop', 'computed'), pt(4, wiener, 'Wiener smoother', 'computed'), pt(5, raw, 'best weights on raw', 'computed')],
        { xLabel: 'five linear pipelines', yLabel: 'output separation d²' },
      )
    } else {
      stage = {
        kind: 'camera-frame',
        rows: 7,
        cols: 7,
        sites: [[3, 3]],
        photons: p.photons,
        psf: p.sigma,
        background: p.background,
        noise: 'poisson',
        seed: p.seed ?? 7,
        denoise: 'wiener',
        panel: [{ show: 'counts' }, { show: 'denoised' }, { show: 'occupancy' }],
      } satisfies CameraFrameState
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* conv-stack: parameters and receptive field of a convolutional network                           */
/* ---------------------------------------------------------------------------------------------- */

const layerSpec = shape({ k: int(1, 7), cin: int(1, 512), cout: int(1, 512), stride: optional(int(1, 4)), bias: optional(bool()), repeat: optional(int(1, 8)) })

export const convStackRecipe = def({
  id: 'conv-stack',
  version: 1,
  title: 'A stack of convolution layers (kernel, channels in and out, stride, bias, repeat) and optional dense layers: parameters counted layer by layer and the receptive field (a layer repeated counts its parameters repeat times)',
  kinds: ['plot', 'camera-frame'],
  params: shape({
    layers: list(layerSpec, 1, 8),
    dense: optional(list(int(1, 100000), 1, 3)),
    input: optional(int(2, 64)),
    view: oneOf(['numbers', 'frame'] as const),
  }),
  rules: (p) => {
    const bad: string[] = []
    if (p.dense !== undefined && p.input === undefined) bad.push('params.dense: needs params.input (the side of the input image)')
    if (p.view === 'frame') {
      if (p.layers.some((l) => (l.stride ?? 1) !== 1 || l.k % 2 === 0)) bad.push("params.view: 'frame' draws stride-1 stacks with odd kernels")
      if ((p.input ?? 10) > 12) bad.push("params.input: a drawn frame is at most 12 pixels wide")
      if (p.layers.length > 6) bad.push("params.layers: a drawn footprint takes at most 6 layers")
    }
    if (p.dense !== undefined && p.input !== undefined) {
      const lost = p.layers.reduce((t, l) => t + (l.k - 1) * (l.repeat ?? 1), 0)
      if (p.input - lost < 1) bad.push(`params.input: the valid convolutions shrink ${p.input} pixels below 1`)
    }
    return bad
  },
  run: (p) => {
    const perLayer = p.layers.map((l) => convParams(l.k, l.cin, l.cout, l.bias ?? true) * (l.repeat ?? 1))
    const convTotal = perLayer.reduce((a, b) => a + b, 0)
    let denseTotal = 0
    let side = p.input ?? 0
    if (p.dense !== undefined && p.input !== undefined) {
      side = p.input - p.layers.reduce((t, l) => t + (l.k - 1) * (l.repeat ?? 1), 0)
      let nin = side * side * p.layers[p.layers.length - 1].cout
      for (const u of p.dense) {
        denseTotal += denseParams(nin, u)
        nin = u
      }
    }
    const rf = receptiveField(p.layers.flatMap((l) => Array.from({ length: l.repeat ?? 1 }, () => ({ k: l.k, stride: l.stride ?? 1 }))))
    const values: Record<string, number> = { params: convTotal + denseTotal, convParams: convTotal, denseParams: denseTotal, rf, layers: p.layers.reduce((t, l) => t + (l.repeat ?? 1), 0), side }
    let stage: StageState
    if (p.view === 'numbers') {
      stage = pts(
        perLayer.map((n, i) => pt(i + 1, n, `${p.layers[i].k}×${p.layers[i].k} ${p.layers[i].cin}→${p.layers[i].cout}`.slice(0, 24), 'computed')),
        { xLabel: 'layer, input first', yLabel: 'parameters', yScale: 'log' },
      )
    } else {
      const n = p.input ?? 10
      stage = {
        kind: 'camera-frame',
        rows: n,
        cols: n,
        sites: [[Math.floor(n / 2), Math.floor(n / 2)]],
        photons: 20,
        psf: 0.9,
        background: 0.4,
        noise: 'none',
        panel: [{ show: 'photons' }, { show: 'rf' }],
        layers: p.layers.flatMap((l) => Array.from({ length: l.repeat ?? 1 }, () => l.k)),
      } satisfies CameraFrameState
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* cgan-terms: the scale of the two terms of the pix2pix objective                                  */
/* ---------------------------------------------------------------------------------------------- */

export const cganTermsRecipe = def({
  id: 'cgan-terms',
  version: 1,
  title: 'The terms of the conditional-GAN objective: the generator’s GAN term −ln D, the weighted L1 term λ·L1 (the L1 value and λ are inputs; a reported L1 is flagged by `l1Reported`), the smoothed-target floor',
  kinds: ['plot'],
  params: shape({
    D: num(0.01, 0.99),
    lambda: num(1, 500),
    l1: num(0, 1),
    target: optional(num(0.5, 0.99)),
    l1Reported: optional(bool()),
  }),
  run: (p) => {
    const g = ganTerms(p.D)
    const half = ganTerms(0.5)
    const stage = pts(
      [pt(1, p.lambda * p.l1, 'λ·L1', p.l1Reported ? 'reported' : 'computed'), pt(2, g.generator, '−ln D', 'computed'), pt(3, half.generator, 'ln 2 (D = ½)', 'computed')],
      { xLabel: 'terms of the loss', yLabel: 'size of the term' },
    )
    return { stage, values: { D: p.D, ganTerm: g.generator, ganEq: half.generator, judgeFake: g.judgeFake, l1Scaled: p.lambda * p.l1, smoothFloor: smoothedBceFloor(p.target ?? 0.9), l1: p.l1, lambda: p.lambda } }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* prior-posterior: a training prior can flip a faint frame                                        */
/* ---------------------------------------------------------------------------------------------- */

export const priorPosteriorRecipe = def({
  id: 'prior-posterior',
  version: 1,
  title: 'Bayes’ rule for one site: the posterior chance of an atom after a frame with log-likelihood ratio llr, at a prior; the prior at which the frame is a coin flip; the shift of the log-odds between two priors (a toy argument, not a measurement of any denoiser)',
  kinds: ['plot'],
  params: shape({ llr: num(-8, 8), prior: num(0.01, 0.99), prior2: optional(num(0.01, 0.99)) }),
  run: (p) => {
    const post = posteriorBright(p.llr, p.prior)
    const points = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95].map((x) => pt(x, posteriorBright(p.llr, x), undefined, 'computed', 'posterior'))
    points.push(pt(p.prior, post, 'this prior', 'computed', 'chosen'))
    const stage = pts(points, { xLabel: 'prior chance of an atom', yLabel: 'chance after the frame', yLines: [{ y: 0.5, label: 'coin flip' }] })
    return { stage, values: { prior: p.prior, posterior: post, flip: flipPrior(p.llr), shift: Math.abs(logitShift(p.prior, p.prior2 ?? 0.1)), llrMagnitude: Math.abs(p.llr) } }
  },
})

export const B5_RECIPES = {
  'pixel-frame': pixelFrameRecipe,
  'filter-compare': filterCompareRecipe,
  'learned-filter': learnedFilterRecipe,
  'linear-denoise': linearDenoiseRecipe,
  'conv-stack': convStackRecipe,
  'cgan-terms': cganTermsRecipe,
  'prior-posterior': priorPosteriorRecipe,
} as const
