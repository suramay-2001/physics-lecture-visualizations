/**
 * Claim kit shared by every lecture (was part of L1.values.ts). A claim is tied to one engine value by its key:
 * its text starts with `key · ` (content/claims.test.ts reads the key and checks the numpy twin). Keys are unique
 * across the whole course (content/values.ts merges every lecture's table and refuses a duplicate).
 * Also: exact fractions of engine values for display (tf / uf), whole percents and fixed decimals.
 */
import type { Claim } from './schema'

/** A claim builder typed to one lecture's value keys. */
export const keyedClaim =
  <K extends string>() =>
  (key: K, text: string, holds: () => boolean): Claim => ({ text: `${key} · ${text}`, holds })

/** The key of a keyed claim, or null. */
export const claimKey = (c: Claim): string | null => /^([A-Za-z0-9]+) · /.exec(c.text)?.[1] ?? null

export const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps

/** p/q with q ≤ 16 for an engine value, or throw (a displayed fraction must be exact). */
function ratio(x: number): [number, number] {
  for (let q = 1; q <= 16; q++) {
    const p = Math.round(x * q)
    if (Math.abs(p / q - x) < 1e-12) return [p, q]
  }
  throw new Error(`claimKit: ${x} is not a small fraction`)
}
/** TeX fraction of an engine value, e.g. 0.25 → '\\tfrac{1}{4}'. */
export function tf(x: number): string {
  const [p, q] = ratio(x)
  return q === 1 ? String(p) : `\\tfrac{${p}}{${q}}`
}
const GLYPH: Record<string, string> = { '1/2': '½', '1/4': '¼', '3/4': '¾', '1/8': '⅛', '3/8': '⅜' }
/** Unicode fraction of an engine value for captions, e.g. 0.125 → '⅛'. */
export function uf(x: number): string {
  const [p, q] = ratio(x)
  if (q === 1) return String(p)
  const g = GLYPH[`${p}/${q}`]
  if (!g) throw new Error(`claimKit: no glyph for ${p}/${q}`)
  return g
}
/** Whole percent, e.g. 0.25 → '25 %'. */
export const pct = (x: number): string => `${Math.round(x * 100)} %`
/** Fixed decimals. */
export const d = (x: number, digits = 3): string => x.toFixed(digits)
