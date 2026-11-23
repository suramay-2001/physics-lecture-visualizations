/**
 * The `optics-bench` presets of the Papers lecture P2, the GANDALF paper (P-P2-story §3; ruling G2): their own file, merged into the table by `presets.ts` (one spread), so the experiment track's
 * presets and these never share a line. THE RULE of presets.ts holds: no result is typed; every curve, marker and readout calls the engine (physics/readout/gandalf.ts, which wraps
 * physics/qec/timing.ts). The pipeline lab's defaults are our fit to the paper's Fig. 15 (t_g = 10 µs, t_den + t_c assumed), shown as such on the page; the printed bars are the engine's `FIG15`.
 */
import { FIG15, cyclePipelined, cycleUnpipelined, errorAfter, etaFactor, impliedClassTime, impliedReadGate, impliedReadGatePipelined, pipelineGain, ratio } from '../../physics/readout/gandalf'
import type { OpticsPreset } from './presets'

/** Percent to a fraction, and a rounded whole number of rounds (helpers sit above the presets: the source lint reads each preset from its `curves:` on). */
const PERCENT = 100
const fraction = (x: number): number => x / PERCENT
const rounds = (x: number): number => Math.max(1, Math.round(x))
const idx = (x: number): number => Math.min(FIG15.unp.length, Math.max(1, Math.round(x))) - 1

const pipelineLab: OpticsPreset = {
  title: 'Pipeline lab: Eq. 4 against Eq. 5',
  question: 'How much of the classical work does pipelining hide, and when does the classifier become the limit?',
  sliders: [
    { key: 'tg', label: 'Gate time t_g (our fit to Fig. 15)', min: 0.01, max: 0.5, step: 0.01, default: 0.01, unit: 'ms' },
    { key: 'tr', label: 'Readout (acquisition) time t_r', min: 0.5, max: 6, step: 0.5, default: 3, unit: 'ms' },
    { key: 'tden', label: 'Denoising time t_den (assumed)', min: 0, max: 1, step: 0.05, default: 0.1, unit: 'ms' },
    { key: 'tc', label: 'Classification time t_c', min: 0, max: 1, step: 0.05, default: 0.4, unit: 'ms' },
    { key: 'd', label: 'Rounds counted d', min: 10, max: 100, step: 10, default: 100, unit: '' },
  ],
  x: { label: 'Rounds d', unit: '', from: 1, to: 100 },
  y: { label: 'Time for d rounds', unit: 'ms' },
  curves: (p) => [
    { label: 'unpipelined, Eq. 4', f: (x) => cycleUnpipelined(rounds(x), p.tg, p.tr, p.tc) },
    { label: 'pipelined, Eq. 5', f: (x) => cyclePipelined(rounds(x), p.tg, p.tr, p.tden, p.tc) },
  ],
  markers: (p) => [{ x: p.d, label: 'd' }],
  readouts: (p) => [
    { label: 'Unpipelined time (Eq. 4)', value: cycleUnpipelined(p.d, p.tg, p.tr, p.tc), unit: 'ms', digits: 2 },
    { label: 'Pipelined time (Eq. 5)', value: cyclePipelined(p.d, p.tg, p.tr, p.tden, p.tc), unit: 'ms', digits: 2 },
    { label: 'Saving, T_unp minus T_pip', value: pipelineGain(p.d, p.tg, p.tr, p.tden, p.tc), unit: 'ms', digits: 2 },
    { label: 'Classical work over gate plus readout (must stay at or below 1)', value: ratio(p.tden + p.tc, p.tg + p.tr), unit: '', digits: 3 },
  ],
}

const etaCalc: OpticsPreset = {
  title: 'η calculator: a share of errors removed, as a factor',
  question: 'If a method removes η of a baseline’s errors, by what factor does the error fall, and what error is left?',
  sliders: [
    { key: 'eta', label: 'η, relative infidelity reduction', min: 0, max: 95, step: 1, default: 62, unit: '%' },
    { key: 'base', label: 'Baseline error', min: 0.5, max: 10, step: 0.5, default: 4, unit: '%' },
  ],
  x: { label: 'η', unit: '%', from: 0, to: 95 },
  y: { label: 'Factor 1/(1 − η)', unit: '×' },
  y2: { label: 'Error left from the baseline', unit: '%' },
  curves: (p) => [
    { label: 'error divided by', f: (x) => etaFactor(fraction(x)) },
    { label: 'error left (right axis)', f: (x) => errorAfter(p.base, fraction(x)), axis: 'right' },
  ],
  markers: (p) => [{ x: p.eta, label: 'η' }],
  readouts: (p) => [
    { label: 'Error divided by', value: etaFactor(fraction(p.eta)), unit: '×', digits: 3 },
    { label: 'Share of errors left', value: PERCENT * (1 - fraction(p.eta)), unit: '%', digits: 1 },
    { label: 'Error left from the baseline', value: errorAfter(p.base, fraction(p.eta)), unit: '%', digits: 3 },
  ],
}

const fig15Readback: OpticsPreset = {
  title: 'Fig. 15 back-reader: the times hidden in the printed bars',
  question: 'What classification time and what readout-plus-gate time do the printed bars imply, if the denoiser plus classifier takes the time you assume?',
  sliders: [
    { key: 'tol', label: 'Readout-error tolerance (a bar group)', min: 1, max: 3, step: 1, default: 1, unit: '%' },
    { key: 'tdc', label: 'Assumed t_den + t_c of GANDALF', min: 0, max: 0.5, step: 0.05, default: 0.1, unit: 'ms' },
  ],
  x: { label: 'Tolerance', unit: '%', from: 1, to: 3 },
  y: { label: 'Readout plus gate t_r + t_g', unit: 'ms' },
  curves: (p) => [
    { label: 'pipelined baseline (t_c read from the bars)', f: (x) => impliedReadGate(FIG15.unp[idx(x)], FIG15.rounds, impliedClassTime(FIG15.unp[0], FIG15.pip[0], FIG15.rounds)) },
    { label: 'GANDALF (with the assumed t_den + t_c)', f: (x) => impliedReadGatePipelined(FIG15.gan[idx(x)], FIG15.rounds, p.tdc) },
  ],
  markers: (p) => [{ x: p.tol, label: 'bars' }],
  readouts: (p) => [
    { label: 'Classification time of the baseline, from the bar gap', value: impliedClassTime(FIG15.unp[idx(p.tol)], FIG15.pip[idx(p.tol)], FIG15.rounds), unit: 'ms', digits: 3 },
    { label: 'Baseline t_r + t_g', value: impliedReadGate(FIG15.unp[idx(p.tol)], FIG15.rounds, impliedClassTime(FIG15.unp[0], FIG15.pip[0], FIG15.rounds)), unit: 'ms', digits: 3 },
    { label: 'GANDALF t_r + t_g (assumption shown)', value: impliedReadGatePipelined(FIG15.gan[idx(p.tol)], FIG15.rounds, p.tdc), unit: 'ms', digits: 3 },
    { label: 'Pipelined baseline bar over GANDALF bar', value: ratio(FIG15.pip[idx(p.tol)], FIG15.gan[idx(p.tol)]), unit: '×', digits: 3 },
  ],
}

export const P2_PRESETS: Readonly<Record<string, OpticsPreset>> = {
  'pipeline-lab': pipelineLab,
  'eta-calc': etaCalc,
  'fig15-readback': fig15Readback,
}
