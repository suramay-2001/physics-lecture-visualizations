/**
 * The checks behind the Corrections of paper lectures (rulings papers-P1.md R2, R4). A paper spec is DATA, so a correction there is
 * `{claim, printed, location, says, shouldSay}` (papers/spec.ts `CorrectionSpec`); the check itself is code and lives here, found by the claim key. A check receives
 * every engine value of the compiled paper (by claim key) and the number the paper prints, and answers true only when our calculation holds the difference the
 * correction states: it re-derives the engine's number from the other claims and compares it with the printed one, so a change in the engine or in a printed
 * input breaks the Corrections box instead of leaving a stale accusation. The validator (papers/validate.ts) refuses a correction whose key has no check here.
 * Lazy with the paper pack (chunk rule (q)); pure.
 */
export type CorrectionValues = Readonly<Record<string, number>>
export type CorrectionCheck = (values: CorrectionValues, printed: number) => boolean

const near = (a: number | undefined, b: number, tol: number): boolean => a !== undefined && Math.abs(a - b) <= tol

export const CORRECTION_CHECKS: Readonly<Record<string, CorrectionCheck>> = {
  // P1 E1 (p. 47; Fig. 2 caption, p. 5): the paper states one six-qubit table for both halves; the engine finds the transpose on qubits 7-12
  p1AxLowerDiff: (v, printed) => v.p1AxLowerDiff === 16 && v.p1AxLowerT === 0 && v.p1AxGap === 0 && v.p1AxLowerDiff !== printed,
  // P1 E2 (Table 3, p. 14): the 1e-4 gross factory's tau-bar of 73 against the paper's own rule, six timesteps per code cycle, from the reference's 18.1 cycles
  p1Dist4g: (v, printed) => near(v.p1Dist4g, 108.6, 0.05) && near(v.p1Dist4tg, 406.8, 0.05) && Math.round(v.p1Dist4tg) === 407 && Math.round(v.p1Dist4g) !== printed,
  // P1 E3 (p. 24): 510 native rotations against the 245 that Eq. 15 as written gives
  p1NatRot: (v, printed) => v.p1NatRot === 245 && v.p1NatRotAll === printed && v.p1PivotI === 284,
  // P1 E4 (Fig. 10b, p. 29; p. 30): 4817 qubits against Eq. 25 with Table 1
  p1Q4801: (v, printed) => v.p1Q4801 === 4801 && v.p1Q4817a29 === printed && v.p1QGap === 16,
  // P1 E5 (p. 30 against Table 9, p. 67): which T count the printed surface thresholds used
  p1ThT17: (v, printed) => near(v.p1ThT17, printed, 0.005) && !near(v.p1ThM17, printed, 0.005) && near(v.p1ThM17, 5.94, 0.005),
  // P1 E7 (Table 3 against Table 5): the 1e-3 two-gross cultivation factory's error, 2e-8 printed against Table 5's 2e-9
  p1FactRatio: (v, printed) => near(v.p1FactRatio, 10, 1e-6) && printed === 2e-8,
  // P1 E6 (Fig. 10a, row d = 5): n = 45 printed, but N_T = 7.0 needs n = 50
  p1RowD5Nt: (v, printed) => near(v.p1RowD5Nt, 7.8, 0.05) && near(v.p1RowD5NtN50, printed, 0.05) && v.p1RowD5N === 45 && v.p1RowD5N50 === 50,
}
