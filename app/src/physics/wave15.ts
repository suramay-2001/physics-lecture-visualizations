/**
 * Lecture 15 engine (448): group and phase velocity, two-wave fringes, the curvature of the free dispersion relation and the spreading scale. Every function is pure, ħ = 1 and lengths
 * in ℓ unless a call passes its own mass (or, for the SI helpers, its own constants). A lecture-only module: it is imported by content/L15.values.ts and by nothing in the entry chunk.
 * It builds on `omegaFree` of Lecture 14 (physics/wave14.ts). Numpy twin of every `l15…` key: pipeline/claims_448/l15.py (FFT grid, matrix exponential, tracked crests and fringes);
 * engine cases: physics/__fixtures__/wave15-cases.json. Tests: physics/wave15.test.ts.
 */
import { H_PLANCK } from './constants'
import { planeSamples } from './wave'
import { omegaFree } from './wave14'

/** v_g = dω/dk = ħk/m of the free relation ω = ħk²/2m (ħ = 1; m defaults to 1): the classical velocity p/m, here from the wave number. */
export function groupVelocity(k: number, m = 1): number {
  if (!(m > 0)) throw new Error('groupVelocity: the mass must be positive')
  return k / m
}

/** v_phase = ω/k = ħk/2m of one plane wave: the speed of its crests, half the group velocity for a free particle. */
export function phaseVelocity(k: number, m = 1): number {
  if (!(m > 0)) throw new Error('phaseVelocity: the mass must be positive')
  if (!(Math.abs(k) > 0)) throw new Error('phaseVelocity: k must be nonzero')
  return omegaFree(k, m) / k
}

/** The speed of the moving envelope of two waves, v_env = Δω/Δk = (ω₂ − ω₁)/(k₂ − k₁); for a free particle it is (k₁ + k₂)/2m, the group velocity at the mean wave number. */
export function pairEnvelopeSpeed(k1: number, k2: number, m = 1): number {
  if (!(Math.abs(k2 - k1) > 0)) throw new Error('pairEnvelopeSpeed: the two wave numbers must differ')
  return (omegaFree(k2, m) - omegaFree(k1, m)) / (k2 - k1)
}

/** The speed of the fast carrier of two waves, ω̄/k₀ with ω̄ the mean frequency and k₀ the mean wave number. */
export function pairCarrierSpeed(k1: number, k2: number, m = 1): number {
  const k0 = (k1 + k2) / 2
  if (!(Math.abs(k0) > 0)) throw new Error('pairCarrierSpeed: the mean wave number must be nonzero')
  return ((omegaFree(k1, m) + omegaFree(k2, m)) / 2) / k0
}

/** ω″ = ħ/m of the free relation, from a central difference of `omegaFree` of step h at the wave number k (exact for a parabola, to rounding). */
export function omegaSecond(m = 1, k = 3, h = 0.1): number {
  if (!(h > 0)) throw new Error('omegaSecond: the step must be positive')
  return (omegaFree(k + h, m) - 2 * omegaFree(k, m) + omegaFree(k - h, m)) / (h * h)
}

/** The spreading time 2mσ²/ħ of a Gaussian packet of position spread σ: the scale on which the spread of velocities Δp/m = ħ/2mσ carries parts a width apart. `hbar` defaults to 1. */
export function spreadScale(sigma: number, m = 1, hbar = 1): number {
  if (!(sigma > 0) || !(m > 0) || !(hbar > 0)) throw new Error('spreadScale: σ, m and ħ must be positive')
  return (2 * m * sigma * sigma) / hbar
}

/** The phase, in degrees, that the momentum component p has turned after a time t, −p²t/2m (a negative number: the phase falls). ħ = 1. */
export function componentPhaseDeg(p: number, t: number, m = 1): number {
  return (-omegaFree(p, m) * t * 180) / Math.PI
}

/** The momenta (both signs) that carry the free energy E: ±√(2mE). A negative energy has none. */
export function momentaOfEnergy(E: number, m = 1): number[] {
  if (!(m > 0)) throw new Error('momentaOfEnergy: the mass must be positive')
  if (E < 0) return []
  if (E === 0) return [0]
  const p = Math.sqrt(2 * m * E)
  return [-p, p]
}

/**
 * The speed of the crests of the plane wave e^{i(px − p²t/2m)}: the crest of Re ψ nearest a point is the zero of Im ψ (with Re ψ > 0) found by bisection over a quarter of a wavelength either way,
 * at t = 0 (the crest at x = 0) and at t = dt (the crest that has moved there); the shift is divided by dt. The crest must move less than a quarter of a wavelength in dt, p²·dt/2m < π/2
 * (the default dt = 1 holds for |p| ≤ 1.77 at m = 1).
 */
export function crestSpeed(p: number, m = 1, dt = 1): number {
  if (!(Math.abs(p) > 0) || !(m > 0) || !(dt > 0)) throw new Error('crestSpeed: p must be nonzero and m and dt positive')
  if ((p * p * dt) / (2 * m) >= Math.PI / 2) throw new Error('crestSpeed: the crest moves more than a quarter of a wavelength in dt')
  const quarter = Math.PI / (2 * Math.abs(p))
  const crest = (t: number, centre: number): number => {
    const imAt = (x: number) => planeSamples([x], [p], { time: t / m }).im[0] // the plane factor e^{−ip²t/2} at time t/m is e^{−ip²t/2m}
    // Im ψ = sin(px − E t) falls through zero at a crest when p < 0 and rises when p > 0, so bracket by sign and keep the root where Re ψ > 0
    let a = centre - quarter
    let b = centre + quarter
    const fa = imAt(a)
    for (let i = 0; i < 100; i++) {
      const mid = (a + b) / 2
      if (imAt(mid) * fa <= 0) b = mid
      else a = mid
    }
    return (a + b) / 2
  }
  const x0 = crest(0, 0)
  return (crest(dt, x0) - x0) / dt
}

/** The relative phase sin(θ₂ − θ₁) of the two waves e^{ip₁x} and e^{ip₂x} at (x, t) after the free evolution: zero at every bright and dark fringe of their sum. */
function relativeSin(p1: number, p2: number, x: number, t: number): number {
  const a = planeSamples([x], [p1], { time: t })
  const b = planeSamples([x], [p2], { time: t })
  return a.re[0] * b.im[0] - a.im[0] * b.re[0]
}

/** The position of a fringe of (e^{ip₁x} + e^{ip₂x})/√2 at time t inside [lo, hi] (a bracketed zero of sin(θ₂ − θ₁), by bisection): follow one fringe by calling it at two times. */
export function fringePosition(p1: number, p2: number, lo: number, hi: number, t: number): number {
  let a = lo
  let b = hi
  if (relativeSin(p1, p2, a, t) * relativeSin(p1, p2, b, t) > 0) throw new Error('fringePosition: the bracket holds no fringe')
  for (let i = 0; i < 100; i++) {
    const m = (a + b) / 2
    if (relativeSin(p1, p2, a, t) * relativeSin(p1, p2, m, t) <= 0) b = m
    else a = m
  }
  return (a + b) / 2
}

/** The largest change of |ψ|² of a plane wave over the sampled x and the two times 0 and t: zero, since |e^{i(px − Et)}|² = 1 (the flat density of a momentum eigenstate). */
export function planeDensityVariation(p: number, xs: ArrayLike<number>, t: number): number {
  const w0 = planeSamples(xs, [p], { time: 0 })
  const w1 = planeSamples(xs, [p], { time: t })
  let lo = Infinity
  let hi = -Infinity
  for (let j = 0; j < xs.length; j++) {
    for (const w of [w0, w1]) {
      const rho = w.re[j] * w.re[j] + w.im[j] * w.im[j]
      lo = Math.min(lo, rho)
      hi = Math.max(hi, rho)
    }
  }
  return hi - lo
}

/** The envelope speed h/(mλ) = p/m of a packet of de Broglie wavelength λ (SI: metres, kilograms, m/s). */
export function groupSpeedFromWavelength(mass: number, lambdaM: number): number {
  if (!(mass > 0) || !(lambdaM > 0)) throw new Error('groupSpeedFromWavelength: the mass and the wavelength must be positive')
  return H_PLANCK / (mass * lambdaM)
}
