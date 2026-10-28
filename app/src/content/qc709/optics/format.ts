/**
 * Number helpers shared by the Optics Lab pages (a plain module, not a page: the optics glob in index.ts, loaders.ts and values.ts skips it, and the
 * chunk rule (r) lets a shared helper sit beside any one page): the engine number rounded to the digits a page prints, an integer with thousands
 * separators, and the tolerance a claim pins its number with.
 */
/** The engine's number rounded to the digits the page prints. */
export const r = (x: number, digits: number): number => Number(x.toFixed(digits))
/** An integer with thousands separators. */
export const n0 = (x: number): string => x.toLocaleString('en-US')
/** |a − b| ≤ tol: a claim pins its number to the one printed. */
export const near = (a: number, b: number, tol: number): boolean => Math.abs(a - b) <= tol
