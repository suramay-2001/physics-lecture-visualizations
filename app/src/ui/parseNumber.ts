/**
 * Parse a learner's numeric answer: "0.75", "3/4", "√3/2", "sqrt(3)/2", "1/sqrt2", "cos(pi/8)^2",
 * "2 pi", "ħ/4" (ħ reads as 1, matching the engine's units). Recursive descent; never uses eval.
 * Returns null for anything it cannot read, so the UI can say "couldn't read that".
 *
 * A thin wrapper over physics/expr.ts (W-L1 §3.5): real mode, answer limits (S §4f: 200 chars, 64 tokens,
 * depth 32), evaluated with evalRealLoose so only the final value must be finite, exactly as before. The
 * differential fuzz in physics/expr.test.ts checks the wrapper against a verbatim copy of the old
 * implementation; the one intended difference is that inputs over those limits are rejected.
 */
import { LIMITS, evalRealLoose, parse } from '../physics/expr'

export function parseNumber(src: string): number | null {
  const res = parse(src, { mode: 'real', limits: LIMITS.answer })
  if (!res.ok) return null
  const v = evalRealLoose(res.ast)
  return Number.isFinite(v) ? v : null
}
