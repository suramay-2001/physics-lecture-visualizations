import { type C } from '../physics/complex'
import { type Mat, type Vec } from '../physics/linalg'

/** Values students meet on the board, rendered the way they are written there. */
const EXACT: [number, string][] = [
  [Math.SQRT1_2, '\\tfrac{1}{\\sqrt2}'],
  [Math.sqrt(3) / 2, '\\tfrac{\\sqrt3}{2}'],
  [0.5, '\\tfrac12'],
  [0.25, '\\tfrac14'],
  [0.75, '\\tfrac34'],
  [Math.sqrt(3) / 4, '\\tfrac{\\sqrt3}{4}'],
  [1 / (2 * Math.SQRT2), '\\tfrac{1}{2\\sqrt2}'],
  [Math.SQRT2, '\\sqrt2'],
]

export function texNum(x: number, digits = 3): string {
  if (Math.abs(x) < 1e-10) return '0'
  const s = x < 0 ? '-' : ''
  const a = Math.abs(x)
  if (Math.abs(a - Math.round(a)) < 1e-10) return s + String(Math.round(a))
  for (const [v, t] of EXACT) if (Math.abs(a - v) < 1e-9) return s + t
  return s + a.toFixed(digits).replace(/0+$/, '')
}

export function texC(z: C, digits = 3): string {
  const re = Math.abs(z.re) < 1e-10 ? 0 : z.re
  const im = Math.abs(z.im) < 1e-10 ? 0 : z.im
  if (im === 0) return texNum(re, digits)
  const imAbs = Math.abs(im)
  const imPart = Math.abs(imAbs - 1) < 1e-10 ? 'i' : `${texNum(imAbs, digits)}\\,i`
  if (re === 0) return (im < 0 ? '-' : '') + imPart
  return `${texNum(re, digits)} ${im < 0 ? '-' : '+'} ${imPart}`
}

export const texMat = (M: Mat, digits = 3): string =>
  `\\begin{pmatrix} ${M.map((r) => r.map((z) => texC(z, digits)).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`

export const texCol = (v: Vec, digits = 3): string =>
  `\\begin{pmatrix} ${v.map((z) => texC(z, digits)).join(' \\\\ ')} \\end{pmatrix}`

export const texRow = (v: Vec, digits = 3): string =>
  `\\begin{pmatrix} ${v.map((z) => texC(z, digits)).join(' & ')} \\end{pmatrix}`
