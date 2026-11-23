/**
 * The `optics-bench` presets of the Papers background chapter B5, "From pixels to bits" (P-B5-story §3; ruling G2): their own file, merged into the table by `presets.ts`
 * (one spread), so the experiment track's presets and these never share a line. THE RULE of presets.ts holds: no result is typed; every curve, marker and readout calls the engine
 * (physics/readout/classify.ts, physics/optics/imaging.ts). Our model throughout (N detected photons in a Gaussian spot of width σ pixels, a background b per pixel, Poisson counts);
 * the inputs are labelled illustrative, never an experiment's. The exact enumerations (the Gaussian-shaped and likelihood-ratio sums) run only in the readouts, at the slider values.
 */
import { normalTail } from '../../physics/optics/imaging'
import {
  bayesError,
  boxShare,
  classSignals,
  dprime2,
  flipPrior,
  llrWeights,
  logitShift,
  normalError,
  poissonSumError,
  posteriorBright,
  psfPixelShare,
  statisticError,
} from '../../physics/readout/classify'
import type { OpticsParams, OpticsPreset } from './presets'

/** The mean photons in the box and in one pixel (centre), and the d′ of the 3 × 3 box, at exposure `tau` (photons and background both times tau). */
const boxMean = (p: OpticsParams, sigma: number, tau: number): number => tau * p.photons * boxShare(3, sigma)
const centreMean = (p: OpticsParams, sigma: number, tau: number): number => tau * p.photons * psfPixelShare(sigma, 0) ** 2
const boxErr = (p: OpticsParams, sigma: number, tau: number): number => poissonSumError(9 * tau * p.background + boxMean(p, sigma, tau), 9 * tau * p.background).err
const centreErr = (p: OpticsParams, sigma: number, tau: number): number => poissonSumError(tau * p.background + centreMean(p, sigma, tau), tau * p.background).err
const normalEst = (p: OpticsParams, sigma: number, tau: number): number => {
  const s = classSignals(sigma, p.photons).map((x) => tau * x)
  const d2 = dprime2([s[2], s[1], s[2], s[1], s[0], s[1], s[2], s[1], s[2]], tau * p.background)
  return normalError(Math.sqrt(d2), normalTail)
}
const model = (p: OpticsParams, sigma: number, tau: number) => {
  const s = classSignals(sigma, p.photons).map((x) => tau * x)
  const b = tau * p.background
  return { s, bright: s.map((x) => b + x), dark: [b, b, b], llr: llrWeights(s, b) }
}
const exact = (p: OpticsParams, sigma: number, tau: number) => {
  const m = model(p, sigma, tau)
  return { llr: bayesError(m.bright, m.dark), gauss: statisticError(m.s, m.bright, m.dark).err, flat: statisticError([1, 1, 1], m.bright, m.dark).err, centre: statisticError([1, 0, 0], m.bright, m.dark).err }
}

/** A chance as a percentage, and the box's d′² at exposure tau (helpers sit above the presets: the source lint reads each preset from its `curves:` on). */
const asPercent = (x: number): number => 100 * x
const boxD2 = (p: OpticsParams, sigma: number, tau: number): number => {
  const s = classSignals(sigma, p.photons)
  return dprime2([s[2], s[1], s[2], s[1], s[0], s[1], s[2], s[1], s[2]].map((x) => tau * x), tau * p.background)
}
/** The prior the log-odds shift is measured from: one atom in ten sites. */
const SPARSE_PRIOR = 0.1

const SLIDERS = {
  sigma: { key: 'sigma', label: 'Spot width σ (our model)', min: 0.5, max: 1.5, step: 0.05, default: 0.9, unit: 'pixels' },
  photons: { key: 'photons', label: 'Photons per atom N (our model)', min: 5, max: 30, step: 1, default: 20, unit: '' },
  background: { key: 'background', label: 'Background b per pixel (our model)', min: 0.05, max: 2, step: 0.05, default: 0.4, unit: 'photons' },
} as const

const filterLab: OpticsPreset = {
  title: 'Filter lab: which sum of the 3 × 3 box reads the atom best',
  question: 'How does the spot’s width change the chance of a wrong bit, and how far is a flat box from the best weights?',
  sliders: [SLIDERS.sigma, SLIDERS.photons, SLIDERS.background],
  x: { label: 'Spot width σ', unit: 'pixels', from: 0.5, to: 1.5 },
  y: { label: 'Chance of a wrong bit', unit: '', from: 0, to: 0.15 },
  curves: (p) => [
    { label: 'centre pixel only', f: (x) => centreErr(p, x, 1) },
    { label: 'flat 3×3 box', f: (x) => boxErr(p, x, 1) },
    { label: 'normal estimate from d′ (flat box d′)', f: (x) => normalEst(p, x, 1) },
  ],
  markers: (p) => [{ x: p.sigma, label: 'σ' }],
  readouts: (p) => {
    const e = exact(p, p.sigma, 1)
    return [
      { label: 'Centre pixel only', value: asPercent(e.centre), unit: '%', digits: 3 },
      { label: 'Flat 3×3 box', value: asPercent(e.flat), unit: '%', digits: 3 },
      { label: 'Gaussian-shaped sum', value: asPercent(e.gauss), unit: '%', digits: 3 },
      { label: 'Likelihood-ratio sum (the Bayes error)', value: asPercent(e.llr), unit: '%', digits: 3 },
    ]
  },
}

const exposureBench: OpticsPreset = {
  title: 'Exposure bench: more light, fewer wrong bits',
  question: 'How fast does the error fall when the exposure grows, and what does d′ alone predict?',
  sliders: [
    { key: 'tau', label: 'Exposure τ (photons and background × τ)', min: 0.25, max: 3, step: 0.25, default: 1, unit: '×' },
    SLIDERS.sigma,
    SLIDERS.photons,
    SLIDERS.background,
  ],
  x: { label: 'Exposure τ', unit: '×', from: 0.25, to: 3 },
  y: { label: 'Chance of a wrong bit', unit: '', from: 0, to: 0.15 },
  curves: (p) => [
    { label: 'centre pixel only', f: (x) => centreErr(p, p.sigma, x) },
    { label: 'flat 3×3 box', f: (x) => boxErr(p, p.sigma, x) },
    { label: 'normal estimate from d′', f: (x) => normalEst(p, p.sigma, x) },
  ],
  markers: (p) => [{ x: p.tau, label: 'τ' }],
  readouts: (p) => {
    const e = exact(p, p.sigma, p.tau)
    return [
      { label: 'Separation d′ of the box', value: Math.sqrt(boxD2(p, p.sigma, p.tau)), unit: '', digits: 2 },
      { label: 'Ratio d′(τ) / d′(1)', value: Math.sqrt(boxD2(p, p.sigma, p.tau) / boxD2(p, p.sigma, 1)), unit: '', digits: 3 },
      { label: 'Flat 3×3 box', value: asPercent(e.flat), unit: '%', digits: 4 },
      { label: 'Likelihood-ratio sum', value: asPercent(e.llr), unit: '%', digits: 4 },
    ]
  },
}

const priorBench: OpticsPreset = {
  title: 'Prior bench: a training prior can flip a faint frame',
  question: 'For a frame that favours “dark” by a given log-likelihood ratio, at what prior does a cleaner start to see an atom?',
  sliders: [
    { key: 'llr', label: 'Frame’s log-likelihood ratio (bright over dark)', min: -4, max: 4, step: 0.25, default: -1, unit: '' },
    { key: 'prior', label: 'Prior chance of an atom', min: 0.05, max: 0.95, step: 0.05, default: 0.5, unit: '' },
  ],
  x: { label: 'Prior chance of an atom', unit: '', from: 0.01, to: 0.99 },
  y: { label: 'Chance of an atom after the frame', unit: '', from: 0, to: 1 },
  curves: (p) => [
    { label: 'after the frame', f: (x) => posteriorBright(p.llr, x) },
    { label: 'no evidence (the prior itself)', f: (x) => posteriorBright(0, x) },
  ],
  markers: (p) => [{ x: p.prior, label: 'prior' }],
  readouts: (p) => [
    { label: 'Chance of an atom after the frame', value: posteriorBright(p.llr, p.prior), unit: '', digits: 3 },
    { label: 'Prior at which the frame is a coin flip', value: flipPrior(p.llr), unit: '', digits: 3 },
    { label: 'Shift of the log-odds from prior 0.1 to this prior', value: logitShift(SPARSE_PRIOR, p.prior), unit: '', digits: 3 },
  ],
}

export const B5_PRESETS: Readonly<Record<string, OpticsPreset>> = {
  'filter-lab': filterLab,
  'exposure-bench': exposureBench,
  'prior-bench': priorBench,
}
