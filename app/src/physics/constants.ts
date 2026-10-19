/**
 * SI constants for the few displayed numbers that leave the ħ = 1 world (Lecture 13: a helium atom's de Broglie wavelength, the spreading
 * time of an electron and of a marble). CODATA 2018 values (the 2022 set moves the electron mass by 1.4e-9 relative, which changes no displayed digit): h, e and c are
 * EXACT by the 2019 definition of the SI; the electron mass, u and the helium-4 atom mass are measured. The engine itself keeps ħ = 1; only a displayed SI number reads this file. The numpy twin
 * (pipeline/make_fixtures.py `lecture12_13_cases`) recomputes each value from other constants (ħ = h/2π, mₑ = 2R∞h/(cα²), m_He = m_α + 2mₑ).
 */

/** Planck's constant h, J·s (exact). */
export const H_PLANCK = 6.62607015e-34
/** ħ = h/2π, J·s. */
export const HBAR = H_PLANCK / (2 * Math.PI)
/** The elementary charge e, C (exact). */
export const E_CHARGE = 1.602176634e-19
/** The speed of light in vacuum c, m/s (exact). */
export const C_LIGHT = 299792458
/** The electron mass mₑ, kg (CODATA 2018). */
export const M_ELECTRON = 9.1093837015e-31
/** The unified atomic mass unit u, kg (CODATA 2018). */
export const U_ATOMIC = 1.6605390666e-27
/** The mass of a helium-4 atom, kg (4.00260325413 u; the atom of Townsend's double-slit example). */
export const M_HELIUM4 = 4.00260325413 * U_ATOMIC
/** One Julian year in seconds (365.25 days). */
export const YEAR_S = 3.15576e7

/** λ = h/(mv), the de Broglie wavelength, in metres. */
export const deBroglie = (mass: number, speed: number): number => H_PLANCK / (mass * speed)
/** The spreading time m a²/ħ of a packet of width a (the time the width has grown by the factor √2, when a = √2σ), in seconds. */
export const spreadTime = (mass: number, width: number): number => (mass * width * width) / HBAR
/** The spacing Lλ/d of the fringes at distance L behind two slits a distance d apart (small angles), in metres. */
export const fringeSpacing = (distance: number, wavelengthM: number, slitGap: number): number => (distance * wavelengthM) / slitGap

/** Boltzmann's constant k_B, J/K (exact by the 2019 definition of the SI). */
export const K_BOLTZMANN = 1.380649e-23
/** The mass of a silver atom, kg (107.8682 u, the standard atomic weight; the atom of Stern and Gerlach's oven). */
export const M_SILVER = 107.8682 * U_ATOMIC

/** The Bohr magneton μ_B = eħ/(2mₑ), J/T: the magnetic moment of one electron whose g-factor is 2 (Townsend Eq. 1.3, in SI units). */
export const bohrMagneton = (): number => (E_CHARGE * HBAR) / (2 * M_ELECTRON)

/**
 * The field gradient dB/dz (T/m) that puts the two spots of a Stern–Gerlach plate `separationM` apart. Atoms leave an oven at
 * `tempK` with mean kinetic energy 2 k_B T (so v² = 4 k_B T/m), cross a magnet of length `lengthM` with a force F = μ_B dB/dz along z
 * (a = F/m), and fly `driftM` further. Each spot is deflected by z = (a/v²)(L²/2 + L D) from the axis, half the separation.
 */
export function sgGradientForSeparation(a: { lengthM: number; driftM: number; tempK: number; separationM: number; massKg: number }): number {
  const v2 = (4 * K_BOLTZMANN * a.tempK) / a.massKg
  const accel = ((a.separationM / 2) * v2) / ((a.lengthM * a.lengthM) / 2 + a.lengthM * a.driftM)
  return (a.massKg * accel) / bohrMagneton()
}

/** The muon mass, kg (CODATA 2018; the particle of Townsend's g-factor example, §4.3). */
export const M_MUON = 1.883531627e-28
/** The g factor of a spin-½ particle of mass m and charge e that precesses at the frequency f (Hz) in a field B (T): ω₀ = g e B/2m with ω₀ = 2πf, so g = 4π m f/(e B). */
export const larmorG = (f: number, B: number, m: number): number => (4 * Math.PI * m * f) / (E_CHARGE * B)
/** The frequency c/λ (Hz) and the energy h c/λ (J) of a photon of wavelength λ (m). */
export const photonFrequency = (lambda: number): number => C_LIGHT / lambda
export const photonEnergy = (lambda: number): number => (H_PLANCK * C_LIGHT) / lambda
