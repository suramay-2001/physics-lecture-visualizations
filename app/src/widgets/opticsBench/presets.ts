/**
 * The `optics-bench` presets registry (a lazy module: it rides in the widget's own chunk, never the entry). A preset id maps to everything
 * the generic parameter-sweep bench needs: the sliders, the plot's axes, up to four curves, optional markers and the live readouts.
 *
 * THE RULE for a preset (checked by `opticsBench/validate.ts` and by the source lint in OpticsBench.test.tsx): no result is typed here.
 * Every curve value, marker position and readout comes from a call into the engine (physics/…, tested against numpy there); the slider
 * limits and the axis ranges are setup, not results. Keep `sliders`, `x`, `y` (and `y2`) first in a preset: the lint reads from `curves:` on.
 *
 * Adding a preset = one entry here, one line of content (`widget: { kind: 'optics-bench', props: { preset: 'my-preset' } }` in a notes or
 * optics paragraph). No other file changes: the widget-spec gate (widgets/visualSpecs.test.tsx) reads this table, so an unknown id fails there.
 */
import { rabiFlipTime, rabiPeak } from '../../physics/dynamics'
import { HBAR, H_PLANCK, K_BOLTZMANN, U_ATOMIC, bohrMagneton } from '../../physics/constants'
import { AU_C6, fountainTime, langevinBarrier, partialWaves, quantumOnsetT, ramseyChance, ramseyWidth } from '../../physics/optics/collisions'
import {
  G_STANDARD,
  NA_D2,
  RB85_D2,
  RB87_D2,
  adiabaticLimits,
  beamForces,
  captureVelocity,
  chirpRate,
  circularOrbit,
  dipoleDepth,
  dipoleScatterRate,
  diffusionTemperature,
  dopplerFrictionMax,
  dopplerOverGamma,
  dopplerSteadyT,
  dopplerTemperature,
  gammaOverK,
  heuristicLevel,
  lightShiftGround,
  maxAcceleration,
  milcWindow,
  molassesBeta,
  molassesLinearityError,
  molassesPeak,
  motForce,
  motLinear,
  orbitN,
  quadrupoleU,
  recoilHeatingTime,
  scatterRate,
  secondOrderDoppler,
  sisyphusFriction,
  sisyphusHill,
  sisyphusPotential,
  slowRow,
  subDopplerLimit,
  thermalDeBroglie,
  trapAcceleration,
  vTrapLevels,
  vsrForce,
  vsrForcePair,
  vsrVelocity,
  waveNumber,
  zeemanOmega,
  zeemanProfile,
  zeemanSlower,
  type AtomLine,
} from '../../physics/optics/cooling'

export interface OpticsSlider {
  /** The key the preset's functions read from `p`: letters and digits, starting with a letter. */
  key: string
  /** Plain text, shown beside the slider. */
  label: string
  min: number
  max: number
  step: number
  default: number
  /** Shown after the value ('' for a pure number). */
  unit: string
}

export interface OpticsCurve {
  /** Plain text, in the legend. */
  label: string
  /** The curve's value at x (a non-finite value leaves a gap). */
  f: (x: number) => number
  /** Which vertical axis the curve is read against: `'left'` (the default) is `y`, `'right'` is the preset's `y2`. */
  axis?: 'left' | 'right'
}

export interface OpticsMarker {
  x: number
  label: string
}

export interface OpticsReadout {
  label: string
  value: number
  unit: string
  /** Decimals shown (0 to 8). */
  digits: number
}

/** The slider values by key. */
export type OpticsParams = Readonly<Record<string, number>>

export interface OpticsPreset {
  /** The widget's title bar. */
  title: string
  /** The one question the bench lets a reader answer by moving the sliders. */
  question: string
  sliders: OpticsSlider[]
  x: { label: string; unit: string; from: number; to: number }
  /** `from` and `to` fix the vertical range (a probability); without them the range follows the curves. */
  y: { label: string; unit: string; from?: number; to?: number }
  /**
   * The right-hand vertical axis, for a picture of two quantities with different units against one x (a field and a velocity along a
   * slower). Drawn, with its own ticks and unit, only when some curve says `axis: 'right'`; `from` and `to` fix its range like `y`'s.
   */
  y2?: { label: string; unit: string; from?: number; to?: number }
  /** One to four curves, drawn in this order; at least one is read against the left axis. */
  curves: (p: OpticsParams) => OpticsCurve[]
  markers?: (p: OpticsParams) => OpticsMarker[]
  readouts: (p: OpticsParams) => OpticsReadout[]
}

/**
 * The demo preset: the Lorentzian resonance line of a driven two-level atom (Townsend §4.4, Fig. 4.6). Two drive strengths are drawn
 * together and a marker sits at a detuning the reader chooses; the readouts are the engine's `rabiPeak` (the curve's height) and
 * `rabiFlipTime` (the time of the first complete flip on resonance), in the engine's units of ħ = 1.
 */
const lorentzian: OpticsPreset = {
  title: 'Resonance line of a driven two-level atom',
  question: 'How wide is the resonance line, and what sets its width?',
  sliders: [
    { key: 'w1', label: 'Drive strength ω₁', min: 0.25, max: 4, step: 0.05, default: 1, unit: '1/τ' },
    { key: 'w2', label: 'Comparison drive ω₁′', min: 0.25, max: 4, step: 0.05, default: 2, unit: '1/τ' },
    { key: 'delta', label: 'Marked detuning δ', min: -6, max: 6, step: 0.05, default: 1, unit: '1/τ' },
  ],
  x: { label: 'Detuning δ = ω₀ − ω', unit: '1/τ', from: -6, to: 6 },
  y: { label: 'Largest flip chance', unit: '', from: 0, to: 1 },
  curves: (p) => [
    { label: 'drive ω₁', f: (x) => rabiPeak(x, p.w1) },
    { label: 'comparison drive ω₁′', f: (x) => rabiPeak(x, p.w2) },
  ],
  markers: (p) => [{ x: p.delta, label: 'δ' }],
  readouts: (p) => [
    { label: 'Height at δ, drive ω₁', value: rabiPeak(p.delta, p.w1), unit: '', digits: 3 },
    { label: 'Height at δ, drive ω₁′', value: rabiPeak(p.delta, p.w2), unit: '', digits: 3 },
    { label: 'Height on resonance', value: rabiPeak(0, p.w1), unit: '', digits: 3 },
    { label: 'First full flip on resonance', value: rabiFlipTime(p.w1), unit: 'τ', digits: 2 },
  ],
}

/* ======================================================================================================================================
 * The Optics Lab presets (Metcalf and van der Straten; plan P-optics-lab §11). SETUP, not results: the atoms' stated data
 * (physics/optics), the unit factors below, the book's coefficients c = 0.125 and 0.097 (p. 41) and the design numbers of pp. 57 and 69
 * (the Na oven of Table 1.1, a 3 m thermal beam at 500 m/s). The bench has no log axes: where a quantity spans decades the curve is the
 * log₁₀ of it on a linear axis, said in the axis label. Every curve, marker and readout below calls the engine; the source lint reads
 * from each `curves:` on, so helpers (and every number they need) live above.
 * ====================================================================================================================================== */
const UNIT = { uK: 1e6, mK: 1e3, nm: 1e9, cm: 1e2, mm: 1e3, G: 1e4, ms: 1e3, us: 1e6, MHz: 1e-6, kHz: 1e-3, km: 1e-3, GHzPerMs: 1e-12, percent: 100, twoPi: 2 * Math.PI, GpercmToTpm: 1e-2, mmPerCm: 10, milli: 1e-3, e17: 1e17, u: U_ATOMIC } as const
/** The book's coefficients of the 3D sub-Doppler limit (p. 41, Eq. 3.13): lin⊥lin and σ⁺σ⁻. */
const C_LIN = 0.125
const C_SIGMA = 0.097
/** Design numbers: the Na oven of Table 1.1 (K), and the thermal beam of the Ramsey comparison (p. 69): 3 m at 500 m/s. */
const OVEN_NA = 712
/** The two sublevels m = ±½ of the Jg = ½ ground state. */
/** The long-range exponent of a van der Waals pair (the potential falls as R⁻⁶). */
const VDW_N = 6
const halfWavelength = (a: AtomLine): number => a.lambdaM / 2
const SUBLEVEL = { up: 0.5, down: -0.5 } as const
const BEAM = { length: 3, speed: 500 }
const pow10 = (e: number): number => 10 ** e
/** ħk², kg/s: the unit of a friction coefficient. */
const hbarKSquared = (a: AtomLine): number => HBAR * waveNumber(a) ** 2
const forceUnit = (a: AtomLine): number => maxAcceleration(a) * a.massKg
/** a/a_max of one beam on an atom of speed v moving against it (δ/γ = dl at rest). */
const decelFraction = (a: AtomLine, s: number, dl: number, v: number): number => (scatterRate(a, s, dl + dopplerOverGamma(a, v)) * 2) / a.gamma
const peakDecel = (a: AtomLine, s: number): number => maxAcceleration(a) * decelFraction(a, s, 0, 0)
/** The speed (m/s) at which an atom is resonant with a beam of detuning dl (δ/γ) it moves against. */
const resonantSpeed = (a: AtomLine, dl: number): number => -dl * gammaOverK(a)
/** The detuning (δ/γ) of the lowest steady-state Doppler temperature, found by scanning the engine's curve. */
function bestDetuning(a: AtomLine): number {
  let best = -0.05
  for (let i = 1; i <= 500; i++) {
    const dl = -(5 * i) / 500
    if (dopplerSteadyT(a, dl) < dopplerSteadyT(a, best)) best = dl
  }
  return best
}
const stopLengthAt = (a: AtomLine, accel: number): number => slowRow(a, OVEN_NA).vPeak ** 2 / (2 * accel)
const cavitySpeed = (h: number): number => (G_STANDARD * fountainTime(h)) / 2
const levelsKHz = (A: number): number[] => vTrapLevels(NA_D2.massKg, bohrMagneton() * A, 8).map((e) => (e / H_PLANCK) * UNIT.kHz)
/** Piecewise-linear through the levels at whole n (the curve of the picture; the levels themselves are its corners). */
const levelCurve = (A: number, n: number): number => {
  const e = levelsKHz(A)
  const i = Math.min(e.length - 2, Math.max(0, Math.floor(n) - 1))
  return e[i] + (e[i + 1] - e[i]) * (n - 1 - i)
}
const levelRatioToLaw = (A: number): number => levelsKHz(A)[1] / levelsKHz(A)[0] / 2 ** (2 / 3)
const motParams = (p: OpticsParams) => ({ s: p.s, dl: p.dl, A: p.A * UNIT.GpercmToTpm, muPrime: bohrMagneton() })
const slower = (p: OpticsParams) => zeemanSlower(NA_D2, p.v0, p.eta)
const sisyphusU1 = (p: OpticsParams): number => lightShiftGround(RB87_D2, p.s, p.dl, 1)
const vsrSpeed = (p: OpticsParams, kind: 'sigma' | 'lin'): number => vsrVelocity(zeemanOmega(RB85_D2.gF as number, p.B / UNIT.G), waveNumber(RB85_D2), kind)
const quadAccel = (p: OpticsParams): number => trapAcceleration(NA_D2.massKg, 1, p.A)
const collisionMass = (p: OpticsParams): number => (p.mu * UNIT.u) / 2
const dipoleOf = (p: OpticsParams, logd: number) => ({ depth: dipoleDepth(NA_D2, pow10(p.logs), -pow10(logd)), rate: dipoleScatterRate(NA_D2, pow10(p.logs), -pow10(logd)) })

/** O1: how far from resonance can a moving atom drift before the push stops? */
const slowerForce: OpticsPreset = {
  title: 'Radiation force on an atom moving against the slowing beam',
  question: 'How far from resonance can a moving atom drift before the push stops?',
  sliders: [
    { key: 's', label: 'Saturation s', min: 0.05, max: 20, step: 0.05, default: 1, unit: '' },
    { key: 's2', label: 'Comparison saturation s′', min: 0.05, max: 20, step: 0.05, default: 10, unit: '' },
    { key: 'dl', label: 'Detuning δ/γ', min: -6, max: 0, step: 0.1, default: -3, unit: '' },
  ],
  x: { label: 'Atom speed v', unit: 'm/s', from: 0, to: 60 },
  y: { label: 'Deceleration a/a_max', unit: '', from: 0, to: 1 },
  curves: (p) => [
    { label: 'saturation s', f: (v) => decelFraction(NA_D2, p.s, p.dl, v) },
    { label: 'saturation s′', f: (v) => decelFraction(NA_D2, p.s2, p.dl, v) },
  ],
  markers: (p) => [{ x: resonantSpeed(NA_D2, p.dl), label: 'resonance' }],
  readouts: (p) => [
    { label: 'Peak deceleration', value: peakDecel(NA_D2, p.s) * UNIT.km, unit: 'km/s²', digits: 0 },
    { label: 'Width γ√(1+s)/k', value: gammaOverK(NA_D2) * Math.sqrt(1 + p.s), unit: 'm/s', digits: 1 },
    { label: 'Stopping length at that deceleration', value: stopLengthAt(NA_D2, peakDecel(NA_D2, p.s)), unit: 'm', digits: 2 },
  ],
}

/** O1: what field keeps a slowing atom resonant, and how long is the magnet? */
const zeemanSlowerPreset: OpticsPreset = {
  title: 'The field of a Zeeman slower',
  question: 'What field keeps a slowing atom resonant, and how long is the magnet?',
  sliders: [
    { key: 'v0', label: 'Entry speed v₀', min: 300, max: 1000, step: 10, default: 880, unit: 'm/s' },
    { key: 'eta', label: 'Design fraction η of the maximum deceleration', min: 0.3, max: 0.95, step: 0.05, default: 0.5, unit: '' },
  ],
  x: { label: 'Position z along the slower', unit: 'm', from: 0, to: 2 },
  y: { label: 'Field B', unit: 'G' },
  y2: { label: 'Resonant speed v_R', unit: 'm/s' },
  curves: (p) => [
    { label: 'field B(z)', f: (z) => zeemanProfile(slower(p), z).B * UNIT.G },
    { label: 'resonant speed v_R(z)', f: (z) => zeemanProfile(slower(p), z).vR, axis: 'right' },
  ],
  markers: (p) => [{ x: slower(p).z0, label: 'z₀' }],
  readouts: (p) => [
    { label: 'Length z₀', value: slower(p).z0, unit: 'm', digits: 3 },
    { label: 'Entry field B₀', value: slower(p).B0 * UNIT.G, unit: 'G', digits: 0 },
    { label: 'Stopping time', value: slower(p).tStop * UNIT.ms, unit: 'ms', digits: 2 },
    { label: 'Chirp rate for a laser sweep', value: chirpRate(NA_D2, p.eta) * UNIT.GHzPerMs, unit: 'GHz/ms', digits: 3 },
  ],
}

/** O2: where is the two-beam force linear, and how strong is the friction? */
const molassesForce: OpticsPreset = {
  title: 'The force of two opposed beams',
  question: 'Where is the two-beam force linear, and how strong is the friction?',
  sliders: [
    { key: 's', label: 'Saturation s per beam', min: 0.05, max: 5, step: 0.05, default: 1, unit: '' },
    { key: 'dl', label: 'Detuning δ/γ', min: -4, max: -0.1, step: 0.05, default: -0.5, unit: '' },
  ],
  x: { label: 'Atom speed v in units of γ/k', unit: '', from: -4, to: 4 },
  y: { label: 'Force F in units of ħkγ/2', unit: '' },
  curves: (p) => [
    { label: 'beam from the left', f: (x) => beamForces(NA_D2, p.s, p.dl, x * gammaOverK(NA_D2)).plus / forceUnit(NA_D2) },
    { label: 'beam from the right', f: (x) => beamForces(NA_D2, p.s, p.dl, x * gammaOverK(NA_D2)).minus / forceUnit(NA_D2) },
    { label: 'sum of the beams', f: (x) => beamForces(NA_D2, p.s, p.dl, x * gammaOverK(NA_D2)).sum / forceUnit(NA_D2) },
    { label: 'linear law −βv', f: (x) => (-molassesBeta(NA_D2, p.s, p.dl) * x * gammaOverK(NA_D2)) / forceUnit(NA_D2) },
  ],
  markers: (p) => [{ x: captureVelocity(NA_D2) / gammaOverK(NA_D2), label: 'v_c' }, { x: molassesPeak(NA_D2, p.s, p.dl) / gammaOverK(NA_D2), label: 'peak' }],
  readouts: (p) => [
    { label: 'Friction β in units of ħk²', value: molassesBeta(NA_D2, p.s, p.dl) / hbarKSquared(NA_D2), unit: '', digits: 3 },
    { label: 'Capture velocity v_c', value: captureVelocity(NA_D2), unit: 'm/s', digits: 2 },
    { label: 'Force peak at v', value: molassesPeak(NA_D2, p.s, p.dl) / gammaOverK(NA_D2), unit: 'γ/k', digits: 2 },
    { label: 'Shortfall of the linear law at v_c', value: molassesLinearityError(NA_D2, p.s, p.dl, captureVelocity(NA_D2)) * UNIT.percent, unit: '%', digits: 0 },
  ],
}

/** O2: which detuning gives the coldest molasses, and why is there a floor? */
const dopplerLimit: OpticsPreset = {
  title: 'The temperature of optical molasses',
  question: 'Which detuning gives the coldest molasses, and why is there a floor?',
  sliders: [
    { key: 'dl', label: 'Detuning δ/γ', min: -5, max: -0.05, step: 0.05, default: -0.5, unit: '' },
    { key: 's', label: 'Saturation s per beam', min: 0.01, max: 2, step: 0.01, default: 0.05, unit: '' },
  ],
  x: { label: 'Detuning δ/γ', unit: '', from: -5, to: -0.05 },
  y: { label: 'Temperature T/T_D', unit: '' },
  curves: (p) => [
    { label: 'at the slider saturation', f: (x) => diffusionTemperature(NA_D2, p.s, x) / dopplerTemperature(NA_D2) },
    { label: 'low-intensity limit', f: (x) => dopplerSteadyT(NA_D2, x) / dopplerTemperature(NA_D2) },
  ],
  markers: (p) => [{ x: p.dl, label: 'δ' }],
  readouts: (p) => [
    { label: 'Temperature of sodium at δ', value: diffusionTemperature(NA_D2, p.s, p.dl) * UNIT.uK, unit: 'µK', digits: 0 },
    { label: 'Best detuning δ/γ', value: bestDetuning(NA_D2), unit: '', digits: 2 },
    { label: 'Damping time M/β', value: (NA_D2.massKg / molassesBeta(NA_D2, p.s, p.dl)) * UNIT.us, unit: 'µs', digits: 0 },
    { label: 'One-axis rms speed', value: Math.sqrt((K_BOLTZMANN * diffusionTemperature(NA_D2, p.s, p.dl)) / NA_D2.massKg) * UNIT.cm, unit: 'cm/s', digits: 1 },
  ],
}

/** O3: how tall are the hills an atom climbs, and how much better is the friction? */
const sisyphusHills: OpticsPreset = {
  title: 'The light-shift hills of lin⊥lin cooling',
  question: 'How tall are the hills an atom climbs, and how much better is the friction?',
  sliders: [
    { key: 'dl', label: 'Detuning δ/γ', min: -12, max: -1, step: 0.5, default: -4, unit: '' },
    { key: 's', label: 'Saturation s per beam', min: 0.1, max: 2, step: 0.1, default: 0.5, unit: '' },
  ],
  x: { label: 'Position z in wavelengths', unit: 'λ', from: 0, to: 1 },
  y: { label: 'Light shift of the sublevel', unit: 'µK' },
  curves: (p) => [
    { label: 'sublevel m = +½', f: (z) => (sisyphusPotential(sisyphusU1(p), z, SUBLEVEL.up) / K_BOLTZMANN) * UNIT.uK },
    { label: 'sublevel m = −½', f: (z) => (sisyphusPotential(sisyphusU1(p), z, SUBLEVEL.down) / K_BOLTZMANN) * UNIT.uK },
  ],
  readouts: (p) => [
    { label: 'Light shift U₁ (⁸⁷Rb)', value: (sisyphusU1(p) / K_BOLTZMANN) * UNIT.uK, unit: 'µK', digits: 1 },
    { label: 'Hill height', value: (sisyphusHill(sisyphusU1(p)) / K_BOLTZMANN) * UNIT.uK, unit: 'µK', digits: 1 },
    { label: 'Friction over the Doppler maximum', value: sisyphusFriction(RB87_D2, p.dl) / dopplerFrictionMax(RB87_D2), unit: '', digits: 1 },
    { label: 'Limit, lin⊥lin (c = 0.125)', value: subDopplerLimit(sisyphusU1(p), C_LIN) * UNIT.uK, unit: 'µK', digits: 2 },
    { label: 'Limit, σ⁺σ⁻ (c = 0.097)', value: subDopplerLimit(sisyphusU1(p), C_SIGMA) * UNIT.uK, unit: 'µK', digits: 2 },
    { label: 'Doppler limit T_D (⁸⁷Rb)', value: dopplerTemperature(RB87_D2) * UNIT.uK, unit: 'µK', digits: 0 },
  ],
}

/** O3: where does a magnetic field push the cooled velocity? */
const vsrForcePreset: OpticsPreset = {
  title: 'Velocity-selective resonance in a magnetic field',
  question: 'Where does a magnetic field push the cooled velocity?',
  sliders: [
    { key: 'B', label: 'Magnetic field B', min: 0, max: 1.2, step: 0.02, default: 0.5, unit: 'G' },
    { key: 'vc', label: 'Capture velocity v_c', min: 4, max: 20, step: 1, default: 8, unit: 'cm/s' },
  ],
  x: { label: 'Atom speed v', unit: 'cm/s', from: -60, to: 60 },
  y: { label: 'Force in units of β v_c', unit: '' },
  curves: (p) => [
    { label: 'σ⁺σ⁻ (one resonance)', f: (v) => vsrForce(v / UNIT.cm, 1, vsrSpeed(p, 'sigma'), p.vc / UNIT.cm) / (p.vc / UNIT.cm) },
    { label: 'lin⊥lin (two resonances)', f: (v) => vsrForcePair(v / UNIT.cm, 1, vsrSpeed(p, 'lin'), p.vc / UNIT.cm) / (p.vc / UNIT.cm) },
  ],
  markers: (p) => [{ x: vsrSpeed(p, 'lin') * UNIT.cm, label: 'v_r, lin⊥lin' }, { x: vsrSpeed(p, 'sigma') * UNIT.cm, label: 'v_r, σ⁺σ⁻' }],
  readouts: (p) => [
    { label: 'Larmor frequency ω_Z/2π (⁸⁵Rb, F = 3)', value: zeemanOmega(RB85_D2.gF as number, p.B / UNIT.G) / UNIT.twoPi * UNIT.MHz, unit: 'MHz', digits: 3 },
    { label: 'Resonance speed v_r, lin⊥lin', value: vsrSpeed(p, 'lin') * UNIT.cm, unit: 'cm/s', digits: 1 },
    { label: 'Resonance speed v_r, σ⁺σ⁻', value: vsrSpeed(p, 'sigma') * UNIT.cm, unit: 'cm/s', digits: 1 },
    { label: 'Peak separation, lin⊥lin', value: (vsrSpeed(p, 'lin') + vsrSpeed(p, 'lin')) * UNIT.cm, unit: 'cm/s', digits: 1 },
    { label: 'Lower edge of the MILC window ω_Z/k', value: milcWindow(RB85_D2, RB85_D2.gF as number, p.B / UNIT.G).low * UNIT.cm, unit: 'cm/s', digits: 1 },
  ],
}

/** O4: how fast and how slow can an atom orbit and stay adiabatic? */
const quadrupoleOrbit: OpticsPreset = {
  title: 'Orbits in a quadrupole magnetic trap',
  question: 'How fast and how slow can an atom orbit and stay adiabatic?',
  sliders: [
    { key: 'A', label: 'Field gradient A', min: 0.1, max: 2, step: 0.05, default: 1, unit: 'T/m' },
    { key: 'rho', label: 'Orbit radius ρ', min: 1, max: 30, step: 1, default: 10, unit: 'mm' },
  ],
  x: { label: 'Distance from the centre', unit: 'cm', from: 0, to: 3 },
  y: { label: 'Potential energy U/k_B', unit: 'mK' },
  curves: (p) => [
    { label: 'radial direction', f: (r) => (quadrupoleU(1, p.A, r / UNIT.cm, 0) / K_BOLTZMANN) * UNIT.mK },
    { label: 'axial direction', f: (r) => (quadrupoleU(1, p.A, 0, r / UNIT.cm) / K_BOLTZMANN) * UNIT.mK },
  ],
  markers: (p) => [{ x: p.rho / UNIT.mmPerCm, label: 'orbit' }],
  readouts: (p) => [
    { label: 'Acceleration a = μA/M', value: quadAccel(p), unit: 'm/s²', digits: 0 },
    { label: 'Orbital speed v', value: circularOrbit(quadAccel(p), p.rho * UNIT.milli).v, unit: 'm/s', digits: 2 },
    { label: 'Orbital period T', value: circularOrbit(quadAccel(p), p.rho * UNIT.milli).period * UNIT.ms, unit: 'ms', digits: 1 },
    { label: 'Smallest adiabatic radius ρ_min', value: adiabaticLimits(quadAccel(p), NA_D2.massKg).rhoMin * UNIT.us, unit: 'µm', digits: 2 },
    { label: 'Smallest adiabatic speed v_min', value: adiabaticLimits(quadAccel(p), NA_D2.massKg).vMin * UNIT.cm, unit: 'cm/s', digits: 2 },
    { label: 'Orbit number n = ω_Z/ω_T', value: orbitN(NA_D2.massKg, circularOrbit(quadAccel(p), p.rho * UNIT.milli).v, p.rho * UNIT.milli), unit: '', digits: 0 },
  ],
}

/** O4: how do levels climb in a V-shaped well? */
const airyLevels: OpticsPreset = {
  title: 'Levels of a V-shaped well',
  question: 'How do levels climb in a V-shaped well?',
  sliders: [{ key: 'A', label: 'Field gradient A', min: 0.1, max: 2, step: 0.05, default: 1, unit: 'T/m' }],
  x: { label: 'Level number n', unit: '', from: 1, to: 8 },
  y: { label: 'Energy E_n/h', unit: 'kHz' },
  curves: (p) => [
    { label: 'exact levels (Airy)', f: (n) => levelCurve(p.A, n) },
    { label: 'orbit rule (3/2)E₁n^(2/3)', f: (n) => (heuristicLevel(NA_D2.massKg, trapAcceleration(NA_D2.massKg, 1, p.A), n) / H_PLANCK) * UNIT.kHz },
  ],
  readouts: (p) => [
    { label: 'Lowest level E₁/h', value: levelsKHz(p.A)[0], unit: 'kHz', digits: 2 },
    { label: 'Spacing E₂ − E₁', value: levelsKHz(p.A)[1] - levelsKHz(p.A)[0], unit: 'kHz', digits: 2 },
    { label: 'E₂/E₁ over the orbit-rule ratio', value: levelRatioToLaw(p.A), unit: '', digits: 2 },
  ],
}

/** O5: what does a far-detuned beam cost in depth and in scattering? */
const dipoleWell: OpticsPreset = {
  title: 'Depth and scattering of a far-detuned beam',
  question: 'What does a far-detuned beam cost in depth and in scattering?',
  sliders: [
    { key: 'logs', label: 'log₁₀ of the saturation s', min: 2, max: 10, step: 0.1, default: 8.3, unit: '' },
    { key: 'logd', label: 'log₁₀ of the detuning |δ|/γ', min: 2, max: 6, step: 0.1, default: 6, unit: '' },
  ],
  x: { label: 'log₁₀ of |δ|/γ', unit: '', from: 2, to: 6 },
  y: { label: 'log₁₀ of the depth / mK', unit: '' },
  y2: { label: 'log₁₀ of the scattering rate / s⁻¹', unit: '' },
  curves: (p) => [
    { label: 'depth (left axis)', f: (x) => Math.log10(dipoleOf(p, x).depth * UNIT.mK / K_BOLTZMANN) },
    { label: 'scattering rate (right axis)', f: (x) => Math.log10(dipoleOf(p, x).rate), axis: 'right' },
  ],
  markers: (p) => [{ x: p.logd, label: 'δ' }],
  readouts: (p) => [
    { label: 'Depth', value: (dipoleOf(p, p.logd).depth / K_BOLTZMANN) * UNIT.mK, unit: 'mK', digits: 2 },
    { label: 'Scattering rate', value: dipoleOf(p, p.logd).rate, unit: 's⁻¹', digits: 0 },
    { label: 'Recoil-heating time to the depth', value: recoilHeatingTime(dipoleOf(p, p.logd).depth, NA_D2, dipoleOf(p, p.logd).rate), unit: 's', digits: 2 },
    { label: 'Depth over ħγ', value: dipoleOf(p, p.logd).depth / (HBAR * NA_D2.gamma), unit: '', digits: 1 },
  ],
}

/** O5: how stiff and how damped is the trap for a given field gradient? */
const motForcePreset: OpticsPreset = {
  title: 'The force of a magneto-optical trap',
  question: 'How stiff and how damped is the trap for a given field gradient?',
  sliders: [
    { key: 's', label: 'Saturation s per beam', min: 0.1, max: 5, step: 0.1, default: 1, unit: '' },
    { key: 'dl', label: 'Detuning δ/γ', min: -6, max: -0.3, step: 0.1, default: -1, unit: '' },
    { key: 'A', label: 'Field gradient A', min: 2, max: 30, step: 1, default: 10, unit: 'G/cm' },
    { key: 'v', label: 'Atom speed v', min: 0, max: 1, step: 0.05, default: 0.5, unit: 'm/s' },
  ],
  x: { label: 'Position z', unit: 'mm', from: -10, to: 10 },
  y: { label: 'Force F in units of ħkγ/2', unit: '' },
  curves: (p) => [
    { label: 'atom at rest', f: (z) => motForce(RB87_D2, motParams(p), z / UNIT.mm, 0) / forceUnit(RB87_D2) },
    { label: 'atom at the slider speed', f: (z) => motForce(RB87_D2, motParams(p), z / UNIT.mm, p.v) / forceUnit(RB87_D2) },
  ],
  markers: (p) => [{ x: motLinear(RB87_D2, motParams(p)).size * UNIT.mm, label: 'size' }],
  readouts: (p) => [
    { label: 'Spring over damping κ/β', value: motLinear(RB87_D2, motParams(p)).kappa / motLinear(RB87_D2, motParams(p)).beta, unit: 'm⁻¹', digits: 0 },
    { label: 'Oscillation frequency ω/2π', value: motLinear(RB87_D2, motParams(p)).omega / UNIT.twoPi, unit: 'Hz', digits: 0 },
    { label: 'Damping rate β/M', value: motLinear(RB87_D2, motParams(p)).beta / RB87_D2.massKg, unit: 's⁻¹', digits: 0 },
    { label: 'Cloud half-size ħ|δ|/μ′A', value: motLinear(RB87_D2, motParams(p)).size * UNIT.mm, unit: 'mm', digits: 2 },
    { label: 'Damping ratio ζ', value: motLinear(RB87_D2, motParams(p)).zeta, unit: '', digits: 1 },
  ],
}

/** O6: how narrow does a fountain make the clock line? */
const ramseyFountain: OpticsPreset = {
  title: 'Ramsey fringes of a fountain clock',
  question: 'How narrow does a fountain make the clock line?',
  sliders: [{ key: 'h', label: 'Height above the cavity', min: 1, max: 60, step: 1, default: 15, unit: 'cm' }],
  x: { label: 'Detuning Δν from the clock line', unit: 'Hz', from: -5, to: 5 },
  y: { label: 'Chance of the transition', unit: '', from: 0, to: 1 },
  curves: (p) => [
    { label: 'fountain', f: (nu) => ramseyChance(nu, fountainTime(p.h / UNIT.cm)) },
    { label: 'thermal beam', f: (nu) => ramseyChance(nu, BEAM.length / BEAM.speed) },
  ],
  readouts: (p) => [
    { label: 'Time between passes T', value: fountainTime(p.h / UNIT.cm), unit: 's', digits: 3 },
    { label: 'Fringe width, fountain', value: ramseyWidth(fountainTime(p.h / UNIT.cm)), unit: 'Hz', digits: 2 },
    { label: 'Fringe width, thermal beam', value: ramseyWidth(BEAM.length / BEAM.speed), unit: 'Hz', digits: 1 },
    { label: 'Width ratio, beam over fountain', value: ramseyWidth(BEAM.length / BEAM.speed) / ramseyWidth(fountainTime(p.h / UNIT.cm)), unit: '', digits: 0 },
    { label: 'Second-order Doppler shift of the fountain atom', value: secondOrderDoppler(cavitySpeed(p.h / UNIT.cm)) * UNIT.e17, unit: '×10⁻¹⁷', digits: 2 },
  ],
}

/** O6: at what temperature do collisions stop being classical? */
const matterWaveOnset: OpticsPreset = {
  title: 'Where cold collisions turn quantum',
  question: 'At what temperature do collisions stop being classical?',
  sliders: [
    { key: 'mu', label: 'Atomic mass', min: 1, max: 140, step: 1, default: 23, unit: 'u' },
    { key: 'C6', label: 'Dispersion constant C₆', min: 100, max: 10000, step: 4, default: 1556, unit: 'au' },
    { key: 'logT', label: 'log₁₀ of the temperature in µK', min: -1, max: 3, step: 0.1, default: 0, unit: '' },
  ],
  x: { label: 'log₁₀ of T in µK', unit: '', from: -1, to: 3 },
  y: { label: 'log₁₀ of the wavelength / nm', unit: '' },
  y2: { label: 'Largest partial wave ℓ_c', unit: '' },
  curves: (p) => [
    { label: 'thermal de Broglie wavelength (left axis)', f: (x) => Math.log10(thermalDeBroglie(p.mu * UNIT.u, pow10(x) / UNIT.uK) * UNIT.nm) },
    { label: 'half the light wavelength (left axis)', f: () => Math.log10(halfWavelength(NA_D2) * UNIT.nm) },
    { label: 'largest partial wave ℓ_c (right axis)', f: (x) => partialWaves(VDW_N, p.C6 * AU_C6, collisionMass(p), pow10(x) / UNIT.uK), axis: 'right' },
  ],
  markers: (p) => [{ x: p.logT, label: 'T' }],
  readouts: (p) => [
    { label: 'Thermal wavelength at T', value: thermalDeBroglie(p.mu * UNIT.u, pow10(p.logT) / UNIT.uK) * UNIT.nm, unit: 'nm', digits: 1 },
    { label: 'Largest partial wave ℓ_c at T', value: partialWaves(VDW_N, p.C6 * AU_C6, collisionMass(p), pow10(p.logT) / UNIT.uK), unit: '', digits: 2 },
    { label: 'Onset temperature T_Q', value: quantumOnsetT(VDW_N, p.C6 * AU_C6, collisionMass(p)) * UNIT.uK, unit: 'µK', digits: 1 },
    { label: 'Barrier radius R_c (ℓ = 1)', value: langevinBarrier(VDW_N, p.C6 * AU_C6, collisionMass(p), 1).Rc * UNIT.nm, unit: 'nm', digits: 2 },
    { label: 'Barrier height V(R_c) (ℓ = 1)', value: (langevinBarrier(VDW_N, p.C6 * AU_C6, collisionMass(p), 1).Vc / K_BOLTZMANN) * UNIT.uK, unit: 'µK', digits: 0 },
  ],
}

/** Every preset by id (kebab-case). The widget-spec gate and `OpticsBench` read this table. */
export const OPTICS_PRESETS: Readonly<Record<string, OpticsPreset>> = {
  lorentzian,
  'slower-force': slowerForce,
  'zeeman-slower': zeemanSlowerPreset,
  'molasses-force': molassesForce,
  'doppler-limit': dopplerLimit,
  'sisyphus-hills': sisyphusHills,
  'vsr-force': vsrForcePreset,
  'quadrupole-orbit': quadrupoleOrbit,
  'airy-levels': airyLevels,
  'dipole-well': dipoleWell,
  'mot-force': motForcePreset,
  'ramsey-fountain': ramseyFountain,
  'matter-wave-onset': matterWaveOnset,
}

export const OPTICS_PRESET_IDS: readonly string[] = Object.keys(OPTICS_PRESETS)

/** Is this a registered preset id? (an own key: `toString` and friends are not presets) */
export const hasPreset = (id: unknown): id is string => typeof id === 'string' && Object.prototype.hasOwnProperty.call(OPTICS_PRESETS, id)

/** The slider values a preset opens with. */
export const defaultParams = (preset: OpticsPreset): Record<string, number> => Object.fromEntries(preset.sliders.map((s) => [s.key, s.default]))
