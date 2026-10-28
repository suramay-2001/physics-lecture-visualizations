/**
 * The Optics Lab's additions to the `plot` kind (Metcalf and van der Straten, plan P-optics-lab §10): six zero-parameter named curves and
 * twelve series functions, every y value computed by `physics/optics/` (never authored). A LAZY module: only `stage/svg/plot.ts` imports it
 * (the figure's own chunk), so none of it lands in the entry; the TYPES here are what `content/stage.ts` widens `PlotCurveName`, `SeriesFn`
 * and `PlotSeries.params` with (`import type`, erased). Each name appears once, in these tables: `plot.ts` spreads them into its own.
 * The fixed atom or model of a curve is part of its name's contract and is stated in the figure's caption (Na D2 for the slower, the
 * molasses and the de Broglie curve; Cs at 300 K for the vapour share; ⁸⁷Rb for the MOT, the lattice and the VSR force).
 */
import { HBAR, H_PLANCK, K_BOLTZMANN, bohrMagneton } from '../../physics/constants'
import { C6_NA_AU, AU_C6, langevinPotential, partialWaves, ramseyChance } from '../../physics/optics/collisions'
import {
  CS_D2,
  NA_D2,
  RB85_D2,
  RB87_D2,
  beamForces,
  boltzmannBelow,
  dipoleDepth,
  dipoleScatterRate,
  dopplerSteadyT,
  dopplerTemperature,
  dressed,
  gammaOverK,
  heuristicLevel,
  motForce,
  quadrupoleU,
  scatterRate,
  sisyphusPotential,
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
} from '../../physics/optics/cooling'

/* ----------------------------------------------------------------------------- the six named curves */
export const OPTICS_CURVE_NAMES = ['slowerField', 'dopplerTVsDetuning', 'dressedOmega', 'vaporFraction', 'deBroglieVsT', 'partialWaveCount'] as const
export type OpticsCurveName = (typeof OPTICS_CURVE_NAMES)[number]

const SLOWER = zeemanSlower(NA_D2, 879, 0.5)
const NA_MASS = NA_D2.massKg
const C6_NA = C6_NA_AU * AU_C6

/** `slowerField`: B/B₀ = v_R/v₀ against z/z₀ along a Na slower (z₀ and B₀ drop out); `dopplerTVsDetuning`: T/T_D against |δ|/γ (Na D2, Eq. 2.3);
 * `dressedOmega`: Ω/γ against δ/γ at s = 2; `vaporFraction`: the share of a 300 K Cs vapour below v_c against v_c (m/s); `deBroglieVsT`: the thermal λ_dB (nm) of Na against T (µK);
 * `partialWaveCount`: ℓ_c of a Na–Na collision (n = 6, C₆ = 1556 au, reduced mass M/2) against T (µK). */
export const OPTICS_CURVE_FNS: { readonly [K in OpticsCurveName]: (x: number) => number } = {
  slowerField: (x) => zeemanProfile(SLOWER, x * SLOWER.z0).B / SLOWER.B0,
  dopplerTVsDetuning: (x) => dopplerSteadyT(NA_D2, -x) / dopplerTemperature(NA_D2),
  dressedOmega: (x) => dressed(NA_D2, 2, x).omega / NA_D2.gamma,
  vaporFraction: (vc) => boltzmannBelow(vc, 300, CS_D2.massKg),
  deBroglieVsT: (tMicroK) => thermalDeBroglie(NA_MASS, tMicroK * 1e-6) * 1e9,
  partialWaveCount: (tMicroK) => partialWaves(6, C6_NA, NA_MASS / 2, tMicroK * 1e-6),
}
export const OPTICS_CURVE_RANGE: { readonly [K in OpticsCurveName]: { from: number; to: number } } = {
  slowerField: { from: 0, to: 1 },
  dopplerTVsDetuning: { from: 0.1, to: 5 },
  dressedOmega: { from: -4, to: 4 },
  vaporFraction: { from: 1, to: 100 },
  deBroglieVsT: { from: 0.1, to: 1000 },
  partialWaveCount: { from: 0.1, to: 1000 },
}
export const OPTICS_CURVE_NAME: { readonly [K in OpticsCurveName]: string } = {
  slowerField: 'B/B₀',
  dopplerTVsDetuning: 'T/T_D',
  dressedOmega: 'Ω/γ',
  vaporFraction: 'share below v_c',
  deBroglieVsT: 'λ_dB (nm)',
  partialWaveCount: 'ℓ_c',
}
export const OPTICS_CURVE_X: { readonly [K in OpticsCurveName]: string } = {
  slowerField: 'z/z₀',
  dopplerTVsDetuning: '|δ|/γ',
  dressedOmega: 'δ/γ',
  vaporFraction: 'v_c (m/s)',
  deBroglieVsT: 'T (µK)',
  partialWaveCount: 'T (µK)',
}
export const OPTICS_CURVE_BOUNDS: { readonly [K in OpticsCurveName]?: { min: number; max: number } } = {
  slowerField: { min: 0, max: 1 },
  vaporFraction: { min: 0, max: 1 },
  dopplerTVsDetuning: { min: 0, max: Infinity },
  deBroglieVsT: { min: 0, max: Infinity },
  partialWaveCount: { min: 0, max: Infinity },
}

/* ----------------------------------------------------------------------------- the twelve series functions */
export const OPTICS_SERIES_FNS = ['scatterVsDetuning', 'molassesForceVsV', 'sisyphusPotential', 'vsrForce', 'quadrupoleU', 'airyLevels', 'heuristicLevels', 'dipoleDepth', 'dipoleScatter', 'motForceVsZ', 'ramseyFringe', 'langevinPotential'] as const
export type OpticsSeriesFn = (typeof OPTICS_SERIES_FNS)[number]
/** The parameters these series take (a series names the ones its function needs): s, saturation per beam · delta, δ/γ · beam, which of the two beams · mg, ±½ · B, gauss · kind, σ⁺σ⁻ or lin⊥lin · axis · v, m/s · T, s · ell, the partial wave. */
export interface OpticsSeriesParams {
  s?: number
  delta?: number
  beam?: 'plus' | 'minus' | 'sum'
  mg?: 0.5 | -0.5
  B?: number
  kind?: 'sigma' | 'lin'
  axis?: 'radial' | 'axial'
  v?: number
  T?: number
  ell?: number
}
type Q = OpticsSeriesParams

const F0_NA = (HBAR * waveNumber(NA_D2) * NA_D2.gamma) / 2
const F0_RB = (HBAR * waveNumber(RB87_D2) * RB87_D2.gamma) / 2
const MOT = { s: 1, dl: -1, A: 0.1, muPrime: bohrMagneton() }
/** The VSR capture velocity of the figure: 8 cm/s (the preset's default). */
const VSR_VC = 0.08
const LEVELS = vTrapLevels(NA_MASS, bohrMagneton(), 6)
const levelKHz = (n: number): number => {
  const i = Math.min(LEVELS.length - 1, Math.max(0, Math.floor(n) - 1))
  const j = Math.min(LEVELS.length - 1, i + 1)
  const t = Math.min(1, Math.max(0, n - 1 - i))
  return ((1 - t) * LEVELS[i] + t * LEVELS[j]) / H_PLANCK / 1e3
}
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

export interface OpticsSeriesSpec {
  /** The x axis of the series: its default range, its name and whether a log axis is meaningful. */
  x: { from: number; to: number; label: string }
  /** The parameters it needs (and takes), each with its check (a message, or '' when fine). */
  params: { [K in keyof Q]-?: (v: unknown) => string }
  value: (q: Q, x: number) => number
  /** The legend name (at most 24 characters). */
  label: (q: Q) => string
  /** A signed quantity: the plot's axis may go below 0 and above 1. */
  signed: boolean
}
const pos = (name: string) => (v: unknown) => (isNum(v) && v > 0 ? '' : `${name} must be a number above 0`)
const any = (name: string) => (v: unknown) => (isNum(v) ? '' : `${name} must be a finite number`)
const oneOf = (name: string, set: readonly unknown[]) => (v: unknown) => (set.includes(v) ? '' : `${name} must be one of ${set.join(', ')}`)
const none = () => ''
const P: OpticsSeriesSpec['params'] = { s: none, delta: none, beam: none, mg: none, B: none, kind: none, axis: none, v: none, T: none, ell: none }
const g = (n: number, d = 2): string => String(Number(n.toFixed(d)))

export const OPTICS_SERIES: { readonly [K in OpticsSeriesFn]: OpticsSeriesSpec } = {
  // R/(γ/2) of one beam against 2δ/γ (Eq. 1.1), Na D2
  scatterVsDetuning: {
    x: { from: -6, to: 6, label: '2δ/γ' },
    params: { ...P, s: pos('s') },
    value: (q, x) => scatterRate(NA_D2, q.s as number, x / 2) / (NA_D2.gamma / 2),
    label: (q) => `s = ${g(q.s as number)}`,
    signed: false,
  },
  // F/(ħkγ/2) of the +z beam, the −z beam or both, against v/(γ/k) (Eq. 2.1), Na D2
  molassesForceVsV: {
    x: { from: -3, to: 3, label: 'v/(γ/k)' },
    params: { ...P, s: pos('s'), delta: any('delta'), beam: oneOf('beam', ['plus', 'minus', 'sum']) },
    value: (q, x) => beamForces(NA_D2, q.s as number, q.delta as number, x * gammaOverK(NA_D2))[q.beam as 'plus' | 'minus' | 'sum'] / F0_NA,
    label: (q) => (q.beam === 'plus' ? 'beam from the left' : q.beam === 'minus' ? 'beam from the right' : 'sum of the beams'),
    signed: true,
  },
  // U/|U₁| of the m = ±½ sublevel against z/λ (model of ruling O3)
  sisyphusPotential: {
    x: { from: 0, to: 1, label: 'z/λ' },
    params: { ...P, mg: oneOf('mg', [0.5, -0.5]) },
    value: (q, x) => sisyphusPotential(-1, x, q.mg as 0.5 | -0.5),
    label: (q) => ((q.mg as number) > 0 ? 'm = +½' : 'm = −½'),
    signed: true,
  },
  // the force of Eq. 3.3 in units of β v_c, against v (cm/s), for ⁸⁵Rb (F = 3, g_F = 1/3) at B gauss: ONE resonance at +v_r for σ⁺σ⁻ light (p. 34), the pair at ±v_r for lin⊥lin
  vsrForce: {
    x: { from: -60, to: 60, label: 'v (cm/s)' },
    params: { ...P, B: (v) => (isNum(v) && v >= 0 && v <= 5 ? '' : 'B must be 0 to 5 gauss'), kind: oneOf('kind', ['sigma', 'lin']) },
    value: (q, x) => {
      const vr = vsrVelocity(zeemanOmega(RB85_D2.gF as number, (q.B as number) * 1e-4), waveNumber(RB85_D2), q.kind as 'sigma' | 'lin')
      return (q.kind === 'sigma' ? vsrForce(x / 100, 1, vr, VSR_VC) : vsrForcePair(x / 100, 1, vr, VSR_VC)) / VSR_VC
    },
    label: (q) => `${q.kind === 'sigma' ? 'σ⁺σ⁻' : 'lin⊥lin'}, ${g(q.B as number)} G`,
    signed: true,
  },
  // U/k_B (mK) of a Na moment (μ = μ_B) in a quadrupole of gradient 1 T/m, against the distance (cm) along the radial or the axial direction
  quadrupoleU: {
    x: { from: 0, to: 3, label: 'distance (cm)' },
    params: { ...P, axis: oneOf('axis', ['radial', 'axial']) },
    value: (q, x) => (quadrupoleU(1, 1, q.axis === 'radial' ? x * 1e-2 : 0, q.axis === 'axial' ? x * 1e-2 : 0) / K_BOLTZMANN) * 1e3,
    label: (q) => (q.axis === 'radial' ? 'radial' : 'axial'),
    signed: false,
  },
  // E_n/h (kHz) of the V-shaped well (Na, A = 1 T/m): exact levels at whole n, joined by straight lines between them
  airyLevels: {
    x: { from: 1, to: 6, label: 'n' },
    params: P,
    value: (_q, x) => levelKHz(x),
    label: () => 'exact levels',
    signed: false,
  },
  // (3/2)E₁n^{2/3}/h (kHz) of the heuristic orbits (same well)
  heuristicLevels: {
    x: { from: 1, to: 6, label: 'n' },
    params: P,
    value: (_q, x) => heuristicLevel(NA_MASS, trapAcceleration(NA_MASS, 1, 1), x) / H_PLANCK / 1e3,
    label: () => 'orbit rule',
    signed: false,
  },
  // depth and scattering rate against |δ|/γ, each divided by its value at |δ|/γ = 100 (Na D2, saturation s per beam)
  dipoleDepth: {
    x: { from: 100, to: 1e6, label: '|δ|/γ' },
    params: { ...P, s: pos('s') },
    value: (q, x) => dipoleDepth(NA_D2, q.s as number, -x) / dipoleDepth(NA_D2, q.s as number, -100),
    label: () => 'depth',
    signed: false,
  },
  dipoleScatter: {
    x: { from: 100, to: 1e6, label: '|δ|/γ' },
    params: { ...P, s: pos('s') },
    value: (q, x) => dipoleScatterRate(NA_D2, q.s as number, -x) / dipoleScatterRate(NA_D2, q.s as number, -100),
    label: () => 'scattering rate',
    signed: false,
  },
  // F/(ħkγ/2) of the MOT (⁸⁷Rb, s = 1, δ = −γ, A = 10 G/cm) against z (mm), for an atom of speed v
  motForceVsZ: {
    x: { from: -8, to: 8, label: 'z (mm)' },
    params: { ...P, v: (v) => (isNum(v) && v >= 0 && v <= 20 ? '' : 'v must be 0 to 20 m/s') },
    value: (q, x) => motForce(RB87_D2, MOT, x * 1e-3, q.v as number) / F0_RB,
    label: (q) => `v = ${g(q.v as number)} m/s`,
    signed: true,
  },
  // the Ramsey fringe cos²(πΔνT) against Δν (Hz)
  ramseyFringe: {
    x: { from: -3, to: 3, label: 'Δν (Hz)' },
    params: { ...P, T: pos('T') },
    value: (q, x) => ramseyChance(x, q.T as number),
    label: (q) => `T = ${g((q.T as number) * 1e3, 0)} ms`,
    signed: false,
  },
  // V(R)/k_B (µK) of the Na–Na pair (n = 6, C₆ = 1556 au, reduced mass M/2) against R (nm), for the partial wave ℓ
  langevinPotential: {
    x: { from: 4, to: 20, label: 'R (nm)' },
    params: { ...P, ell: (v) => (isNum(v) && Number.isInteger(v) && v >= 0 && v <= 6 ? '' : 'ell must be a whole number 0 to 6') },
    value: (q, x) => (langevinPotential(6, C6_NA, NA_MASS / 2, q.ell as number, x * 1e-9) / K_BOLTZMANN) * 1e6,
    label: (q) => `ℓ = ${q.ell}`,
    signed: true,
  },
}

export const isOpticsSeries = (fn: string): fn is OpticsSeriesFn => Object.prototype.hasOwnProperty.call(OPTICS_SERIES, fn)
/** Every problem of one optics series: unknown or unused parameters, a missing or invalid one. */
export function opticsSeriesProblems(where: string, fn: OpticsSeriesFn, params: Record<string, unknown>): string[] {
  const spec = OPTICS_SERIES[fn]
  const used = (Object.keys(spec.params) as (keyof Q)[]).filter((k) => spec.params[k] !== none)
  const out: string[] = []
  for (const key of Object.keys(params)) if (!(key in spec.params)) out.push(`${where}.params.${key}: unknown`)
  else if (!used.includes(key as keyof Q)) out.push(`${where}.params.${key}: ${fn} does not use it (it needs ${used.join(', ') || 'no parameters'})`)
  for (const key of used) {
    if (params[key] === undefined) out.push(`${where}.params.${key}: ${fn} needs it`)
    else {
      const msg = spec.params[key](params[key])
      if (msg) out.push(`${where}.params.${key}: ${msg}`)
    }
  }
  return out
}
