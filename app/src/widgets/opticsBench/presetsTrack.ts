/**
 * The nine `optics-bench` presets of the experiment track (pages O7 to O11; plan P-optics-experiment-track §7), a separate file only to keep presets.ts short:
 * `presets.ts` spreads `TRACK_PRESETS` into its table, so the registry, the widget-spec gate and the source lints see one table (the lint in OpticsBench.test.tsx
 * reads this file too). THE RULE of presets.ts holds: no result is typed here. Every curve value, marker and readout is a call into the engine
 * (physics/optics/arrays.ts, imaging.ts, cooling.ts); slider limits, axis ranges and the unit factors below are setup. Cesium is the one atom.
 */
import { K_BOLTZMANN } from '../../physics/constants'
import { CS_D2, dopplerSteadyT, dopplerTemperature, lightShiftGround, subDopplerLimit } from '../../physics/optics/cooling'
import {
  fillChance,
  loadTimeTo,
  motLoad,
  parityDistribution,
  poissonP1,
  recoilGainK,
  refillEquilibrium,
  refillTrace,
  sitesNeeded,
  thermalRms,
  trapHeatTime,
  tweezerDepth,
  tweezerFreqs,
  tweezerPotential,
  tweezerScatter,
  depumpSurvival,
} from '../../physics/optics/arrays'
import { bestThreshold, collectionEfficiency, errorVsExposure, photonBudget, photonsFor, poissonPmf, thresholdError, toyOptimum } from '../../physics/optics/imaging'
import type { OpticsParams, OpticsPreset } from './presets'

/** Unit factors and fixed setup of these presets (none is a result). */
const U = { ms: 1e3, us: 1e6, mK: 1e3, uK: 1e6, nm: 1e9, um: 1e6, kHz: 1e-3, mega: 1e6, percent: 100, nano: 1e9, twoPi: 2 * Math.PI, half: 0.5, sq: 2 } as const
const C_LIN = 0.125 // the book's coefficients of the sub-Doppler limit (O3): lin⊥lin
const C_SIGMA = 0.097 // σ⁺σ⁻
const FRAC_FILLED = 0.95 // "95 % of the steady state"
const CONF = 0.99 // the confidence of a filled target
const PARITY_LARGE = 50 // a Poisson mean so large that the parity law has reached its ceiling
const SITES_ALL = 100 // the target size of the refill preset
const M_TARGET = 5 // a mean count of five makes a bright atom: the rule of page O10
const DEPUMP = 3.7e-4 // the stated depumping chance per scattered photon (Chow et al., see page O10)
const T_REF = 20e-6 // K: the cloud temperature of the tweezer preset
const SPAN_COUNTS = 40 // the histogram's x range ends at this count
const TAU_MIN = 30 // µs: the smallest exposure the toy optimum searches
const MU_BEST = 1 // the Poisson mean at which one atom is most likely

const tweezerOf = (p: OpticsParams) => {
  const lam = p.lam / U.nm
  const w0 = p.w0 / U.um
  const depth = tweezerDepth(p.P / U.ms, w0, lam)
  return { lam, w0, depth, freqs: tweezerFreqs(depth, CS_D2.massKg, w0, lam) }
}

/** O7: how fast does a MOT fill, and how many atoms does it hold in the end? */
const motLoadPreset: OpticsPreset = {
  title: 'Filling a magneto-optical trap',
  question: 'How long must you wait for the cloud, and how many atoms does it hold?',
  sliders: [
    { key: 'tau', label: 'Loss time constant τ', min: 20, max: 400, step: 10, default: 100, unit: 'ms' },
    { key: 'R', label: 'Capture rate R', min: 1, max: 500, step: 1, default: 100, unit: '10⁶ s⁻¹' },
  ],
  x: { label: 'Loading time t', unit: 'ms', from: 0, to: 1000 },
  y: { label: 'Atoms in the cloud', unit: '10⁶' },
  curves: (p) => [
    { label: 'N(t) = Rτ(1 − e^(−t/τ))', f: (t) => motLoad(p.R * U.mega, p.tau / U.ms, t / U.ms) / U.mega },
    { label: 'steady state Rτ', f: () => (p.R * U.mega * (p.tau / U.ms)) / U.mega },
  ],
  markers: (p) => [{ x: loadTimeTo(FRAC_FILLED, p.tau), label: '95 %' }],
  readouts: (p) => [
    { label: 'Steady state Rτ', value: (p.R * p.tau) / U.ms, unit: '10⁶ atoms', digits: 1 },
    { label: 'Time to 95 % of it', value: loadTimeTo(FRAC_FILLED, p.tau), unit: 'ms', digits: 0 },
    { label: 'That time in units of τ', value: loadTimeTo(FRAC_FILLED, 1), unit: 'τ', digits: 2 },
    { label: 'Atoms after one time constant', value: motLoad(p.R * U.mega, p.tau / U.ms, p.tau / U.ms) / U.mega, unit: '10⁶ atoms', digits: 1 },
  ],
}

/** O7: how cold can the polarization-gradient step get, and how does it move with the detuning? */
const pgcWindow: OpticsPreset = {
  title: 'The polarization-gradient step on cesium',
  question: 'How far below the Doppler limit does the step reach, and where on the detuning axis?',
  sliders: [
    { key: 'dl', label: 'Detuning δ/γ', min: -30, max: -3, step: 0.5, default: -19.5, unit: '' },
    { key: 's', label: 'Saturation s per beam', min: 0.2, max: 3, step: 0.1, default: 1.2, unit: '' },
  ],
  x: { label: 'Detuning δ/γ', unit: '', from: -30, to: -3 },
  y: { label: 'Sub-Doppler limit', unit: 'µK' },
  y2: { label: 'Doppler theory', unit: 'µK' },
  curves: (p) => [
    { label: 'lin⊥lin limit (left axis)', f: (x) => subDopplerLimit(lightShiftGround(CS_D2, p.s, x), C_LIN) * U.uK },
    { label: 'σ⁺σ⁻ limit (left axis)', f: (x) => subDopplerLimit(lightShiftGround(CS_D2, p.s, x), C_SIGMA) * U.uK },
    { label: 'Doppler theory (right axis)', f: (x) => dopplerSteadyT(CS_D2, x) * U.uK, axis: 'right' },
  ],
  markers: (p) => [{ x: p.dl, label: 'δ' }],
  readouts: (p) => [
    { label: 'Light shift |U₁|', value: (Math.abs(lightShiftGround(CS_D2, p.s, p.dl)) / K_BOLTZMANN) * U.uK, unit: 'µK', digits: 2 },
    { label: 'Limit, lin⊥lin', value: subDopplerLimit(lightShiftGround(CS_D2, p.s, p.dl), C_LIN) * U.uK, unit: 'µK', digits: 3 },
    { label: 'Limit, σ⁺σ⁻', value: subDopplerLimit(lightShiftGround(CS_D2, p.s, p.dl), C_SIGMA) * U.uK, unit: 'µK', digits: 3 },
    { label: 'Doppler limit over lin⊥lin limit', value: dopplerTemperature(CS_D2) / subDopplerLimit(lightShiftGround(CS_D2, p.s, p.dl), C_LIN), unit: '', digits: 0 },
  ],
}

/** O8: the well that one tweezer makes, from the power, the waist and the wavelength. */
const tweezerWell: OpticsPreset = {
  title: 'The well of one tweezer on cesium',
  question: 'How deep is the well, how fast does an atom oscillate in it, and how long does the trap light itself take to heat it out?',
  sliders: [
    { key: 'P', label: 'Power at the atom', min: 0.2, max: 5, step: 0.1, default: 1.4, unit: 'mW' },
    { key: 'w0', label: 'Waist w₀', min: 0.7, max: 2, step: 0.01, default: 1.24, unit: 'µm' },
    { key: 'lam', label: 'Wavelength', min: 900, max: 1100, step: 1, default: 1061, unit: 'nm' },
  ],
  x: { label: 'Radial position r', unit: 'µm', from: -3, to: 3 },
  y: { label: 'Potential U(r)/k_B', unit: 'mK' },
  curves: (p) => [
    { label: 'Gaussian well', f: (r) => (tweezerPotential(tweezerOf(p).depth, tweezerOf(p).w0, tweezerOf(p).lam, r / U.um) / K_BOLTZMANN) * U.mK },
    { label: 'harmonic approximation', f: (r) => ((-tweezerOf(p).depth + (U.half * CS_D2.massKg * (U.twoPi * tweezerOf(p).freqs.fr) ** U.sq * (r / U.um) ** U.sq)) / K_BOLTZMANN) * U.mK },
  ],
  markers: (p) => [{ x: thermalRms(CS_D2.massKg, U.twoPi * tweezerOf(p).freqs.fr, T_REF) * U.um, label: 'σ at 20 µK' }],
  readouts: (p) => [
    { label: 'Depth U₀/k_B', value: (tweezerOf(p).depth / K_BOLTZMANN) * U.mK, unit: 'mK', digits: 3 },
    { label: 'Radial frequency f_r', value: tweezerOf(p).freqs.fr * U.kHz, unit: 'kHz', digits: 1 },
    { label: 'Axial frequency f_z', value: tweezerOf(p).freqs.fz * U.kHz, unit: 'kHz', digits: 2 },
    { label: 'Thermal rms size at 20 µK', value: thermalRms(CS_D2.massKg, U.twoPi * tweezerOf(p).freqs.fr, T_REF) * U.nm, unit: 'nm', digits: 0 },
    {
      label: 'Heating time by the trap light',
      value: trapHeatTime(tweezerOf(p).depth, tweezerScatter(p.P / U.ms, tweezerOf(p).w0, tweezerOf(p).lam), CS_D2.massKg, tweezerOf(p).lam),
      unit: 's',
      digits: 0,
    },
  ],
}

/** O9: the chance of one atom in a tweezer when atoms leave in pairs. */
const parityLoading: OpticsPreset = {
  title: 'Loading one atom in a tweezer',
  question: 'What share of the traps hold exactly one atom when pairs are lost together?',
  sliders: [{ key: 'mu', label: 'Mean number loaded μ', min: 0, max: 6, step: 0.05, default: 1, unit: '' }],
  x: { label: 'Mean number loaded μ', unit: '', from: 0, to: 6 },
  y: { label: 'Chance', unit: '', from: 0, to: 1 },
  curves: () => [
    { label: 'P(1) with pair loss', f: (mu) => parityDistribution(mu).p1 },
    { label: 'P(0) with pair loss', f: (mu) => parityDistribution(mu).p0 },
    { label: 'P(1) with no collisions', f: (mu) => poissonP1(mu) },
  ],
  markers: (p) => [{ x: p.mu, label: 'μ' }],
  readouts: (p) => [
    { label: 'P(1) with pair loss', value: parityDistribution(p.mu).p1, unit: '', digits: 4 },
    { label: 'Ceiling of that curve', value: parityDistribution(PARITY_LARGE).p1, unit: '', digits: 3 },
    { label: 'Best chance with no collisions', value: poissonP1(MU_BEST), unit: '', digits: 4 },
  ],
}

/** O9: how many sites must be loaded to fill a target. */
const sortSuccess: OpticsPreset = {
  title: 'Sites needed to fill a target',
  question: 'How many tweezer sites are needed to be sure of filling a target of M atoms?',
  sliders: [
    { key: 'M', label: 'Target size M', min: 20, max: 200, step: 5, default: 100, unit: 'atoms' },
    { key: 'p', label: 'Loading chance p', min: 0.3, max: 0.7, step: 0.002, default: 0.512, unit: '' },
  ],
  x: { label: 'Sites in the array N', unit: '', from: 50, to: 450 },
  y: { label: 'Chance that M or more are loaded', unit: '', from: 0, to: 1 },
  curves: (p) => [{ label: 'P(at least M of N loaded)', f: (n) => fillChance(Math.round(n), p.M, p.p) }],
  markers: (p) => [{ x: sitesNeeded(p.M, p.p, CONF), label: '99 %' }],
  readouts: (p) => [
    { label: 'Sites for a 99 % chance', value: sitesNeeded(p.M, p.p, CONF), unit: 'sites', digits: 0 },
    { label: 'Atoms loaded there on average', value: sitesNeeded(p.M, p.p, CONF) * p.p, unit: 'atoms', digits: 0 },
    { label: 'Spare atoms on average', value: sitesNeeded(p.M, p.p, CONF) * p.p - p.M, unit: 'atoms', digits: 0 },
  ],
}

/** O9: the empty fraction of an array that is refilled each round and loses atoms each round. */
const refillRounds: OpticsPreset = {
  title: 'Refilling an array',
  question: 'How empty does an array stay when each round refills some sites and loses a few atoms?',
  sliders: [
    { key: 'eps', label: 'Loss chance per round ε', min: 0, max: 0.05, step: 0.001, default: 0.01, unit: '' },
    { key: 'q', label: 'Refill chance per round q', min: 0.1, max: 1, step: 0.05, default: 0.5, unit: '' },
  ],
  x: { label: 'Round', unit: '', from: 0, to: 10 },
  y: { label: 'Empty fraction', unit: '', from: 0, to: 1 },
  curves: (p) => [
    { label: 'empty fraction', f: (k) => refillTrace(Math.round(k), p.eps, p.q)[Math.round(k)], step: true },
    { label: 'equilibrium ε/(q + ε)', f: () => refillEquilibrium(p.eps, p.q) },
  ],
  readouts: (p) => [
    { label: 'Empty after five rounds', value: refillTrace(M_TARGET, p.eps, p.q)[M_TARGET], unit: '', digits: 4 },
    { label: 'Equilibrium empty fraction', value: refillEquilibrium(p.eps, p.q), unit: '', digits: 4 },
    { label: 'Chance that 100 sites are all filled', value: (1 - refillEquilibrium(p.eps, p.q)) ** SITES_ALL, unit: '', digits: 3 },
    { label: 'Atoms lost per round from 100 sites', value: (1 - refillEquilibrium(p.eps, p.q)) * SITES_ALL * p.eps, unit: 'atoms', digits: 2 },
  ],
}

/** O10: the photons one atom gives and the camera counts. */
const photonBudgetPreset: OpticsPreset = {
  title: 'The photon budget of one cesium atom',
  question: 'How long must the light shine for a bright atom to show five counts, and how many photons does that cost?',
  sliders: [
    { key: 's', label: 'Saturation s', min: 0.1, max: 10, step: 0.1, default: 2, unit: '' },
    { key: 'dl', label: 'Detuning δ/γ', min: -8, max: 0, step: 0.1, default: -2, unit: '' },
    { key: 'NA', label: 'Numerical aperture', min: 0.2, max: 0.9, step: 0.05, default: 0.55, unit: '' },
    { key: 'eta', label: 'Total detection efficiency η', min: 0.002, max: 0.2, step: 0.002, default: 0.05, unit: '' },
  ],
  x: { label: 'Exposure τ', unit: 'ms', from: 0, to: 3 },
  y: { label: 'Mean counted photons', unit: '' },
  y2: { label: 'Chance of not being pumped away', unit: '', from: 0, to: 1 },
  curves: (p) => [
    { label: 'mean detected m (left axis)', f: (t) => photonBudget(CS_D2, p.s, p.dl, p.eta, t / U.ms).detected },
    { label: 'no depumping yet (right axis)', f: (t) => depumpSurvival(photonBudget(CS_D2, p.s, p.dl, p.eta, t / U.ms).scattered, DEPUMP), axis: 'right' },
  ],
  readouts: (p) => [
    { label: 'Scattering rate R', value: photonBudget(CS_D2, p.s, p.dl, p.eta, 1).R / U.mega, unit: '10⁶ s⁻¹', digits: 2 },
    { label: 'Ideal lens collection', value: collectionEfficiency(p.NA) * U.percent, unit: '%', digits: 1 },
    { label: 'Time for a mean count of five', value: (photonsFor(M_TARGET, p.eta) / photonBudget(CS_D2, p.s, p.dl, p.eta, 1).R) * U.ms, unit: 'ms', digits: 3 },
    { label: 'Photons scattered for that', value: photonsFor(M_TARGET, p.eta), unit: '', digits: 0 },
    { label: 'Heating by those photons, no cooling', value: photonsFor(M_TARGET, p.eta) * recoilGainK(CS_D2) * U.uK, unit: 'µK', digits: 1 },
  ],
}

/** O11: the two Poisson histograms and the cutoff between them. */
const countHistograms: OpticsPreset = {
  title: 'Bright and dark count histograms',
  question: 'Where should the cutoff go, and how often is a site misread?',
  sliders: [
    { key: 'mb', label: 'Bright mean m_b', min: 1, max: 30, step: 0.1, default: 9.2, unit: '' },
    { key: 'md', label: 'Dark mean m_d', min: 0, max: 2, step: 0.05, default: 0.2, unit: '' },
    { key: 'nc', label: 'Cutoff n_c', min: 0, max: 12, step: 1, default: 3, unit: 'counts' },
  ],
  x: { label: 'Counts n', unit: '', from: 0, to: SPAN_COUNTS },
  y: { label: 'Chance of n counts', unit: '' },
  curves: (p) => [
    { label: 'bright atom', f: (n) => poissonPmf(Math.round(n), p.mb), step: true },
    { label: 'dark site', f: (n) => poissonPmf(Math.round(n), p.md), step: true },
  ],
  markers: (p) => [{ x: p.nc, label: 'n_c' }],
  readouts: (p) => [
    { label: 'Error at this cutoff', value: thresholdError(p.mb, p.md, Math.round(p.nc)).err * U.percent, unit: '%', digits: 3 },
    { label: 'Bright atom missed', value: thresholdError(p.mb, p.md, Math.round(p.nc)).eb * U.percent, unit: '%', digits: 3 },
    { label: 'Dark site misread', value: thresholdError(p.mb, p.md, Math.round(p.nc)).ed * U.percent, unit: '%', digits: 3 },
    { label: 'Best cutoff', value: bestThreshold(p.mb, p.md).cutoff, unit: 'counts', digits: 0 },
    { label: 'Error at the best cutoff', value: bestThreshold(p.mb, p.md).err * U.percent, unit: '%', digits: 3 },
  ],
}

/** O11: the exposure that balances misreading against losing the atom (a toy). */
const exposureOptimum: OpticsPreset = {
  title: 'The best exposure (a labelled toy)',
  question: 'At what exposure do the misread error and the loss of the atom add up to least?',
  sliders: [
    { key: 'rb', label: 'Bright signal rate', min: 10, max: 100, step: 0.1, default: 54.4, unit: 'kcps' },
    { key: 'rg', label: 'Background rate', min: 0.1, max: 3, step: 0.01, default: 0.52, unit: 'kcps' },
    { key: 'lamL', label: 'Loss rate λ_L (a toy input)', min: 0.5, max: 20, step: 0.5, default: 4, unit: 's⁻¹' },
  ],
  x: { label: 'Exposure τ', unit: 'µs', from: 30, to: 600 },
  y: { label: 'log₁₀ of the error', unit: '' },
  curves: (p) => [
    { label: 'misread error', f: (t) => Math.log10(errorVsExposure(p.rb * 1e3, p.rg * 1e3, t / U.us).err) },
    { label: 'loss of the atom', f: (t) => Math.log10(1 - Math.exp((-p.lamL * t) / U.us)) },
    { label: 'total', f: (t) => Math.log10(errorVsExposure(p.rb * 1e3, p.rg * 1e3, t / U.us).err + 1 - Math.exp((-p.lamL * t) / U.us)) },
  ],
  markers: (p) => [{ x: toyOptimum(p.rb * 1e3, p.rg * 1e3, p.lamL, TAU_MIN).tau * U.us, label: 'best' }],
  readouts: (p) => [
    { label: 'Best exposure τ*', value: toyOptimum(p.rb * 1e3, p.rg * 1e3, p.lamL, TAU_MIN).tau * U.us, unit: 'µs', digits: 0 },
    { label: 'Total error there', value: toyOptimum(p.rb * 1e3, p.rg * 1e3, p.lamL, TAU_MIN).total * U.percent, unit: '%', digits: 3 },
    { label: 'Of which misread', value: toyOptimum(p.rb * 1e3, p.rg * 1e3, p.lamL, TAU_MIN).misread * U.percent, unit: '%', digits: 4 },
  ],
}

export const TRACK_PRESETS: Readonly<Record<string, OpticsPreset>> = {
  'mot-load': motLoadPreset,
  'pgc-window': pgcWindow,
  'tweezer-well': tweezerWell,
  'parity-loading': parityLoading,
  'sort-success': sortSuccess,
  'refill-rounds': refillRounds,
  'photon-budget': photonBudgetPreset,
  'count-histograms': countHistograms,
  'exposure-optimum': exposureOptimum,
}
