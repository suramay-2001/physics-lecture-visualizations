/**
 * SI constants for the few displayed numbers that leave the ħ = 1 world (Lecture 13: a helium atom's de Broglie wavelength, the spreading
 * time of an electron and of a marble). CODATA 2018 values: h, e, c and k_B are EXACT by the 2019 definition of the SI; the electron mass and
 * the helium-4 atom mass are measured. The engine itself keeps ħ = 1; only a displayed SI number reads this file. The numpy twin
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
/** The spreading time m a²/ħ of a packet of width a (the time the width has grown by √2 or so), in seconds. */
export const spreadTime = (mass: number, width: number): number => (mass * width * width) / HBAR
