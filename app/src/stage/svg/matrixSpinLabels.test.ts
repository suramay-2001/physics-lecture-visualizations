/**
 * `matrix.labels: 'spin'` (448 Townsend pass, S2): a one-spin 2 x 2 matrix names its rows <+z|, <-z| and its columns |+z>, |-z>
 * (448 never writes |0>, |1> for a spin; 709 keeps those in its own lock). Nothing else about the grid changes.
 */
import { describe, expect, it } from 'vitest'
import type { MatrixGridState } from '../../content/stage'
import { resolveMatrixStage, validateMatrixStage } from './matrix'

const grid = (labels: MatrixGridState['labels'], source: MatrixGridState['source'] = { outer: [{ dir: '+x' }] }): MatrixGridState => ({ kind: 'matrix', source, labels, values: 'exact' })

describe("matrix labels: 'spin'", () => {
  it('names a one-spin matrix with the spin kets and keeps the engine cells', () => {
    const st = grid('spin')
    expect(validateMatrixStage(st)).toEqual([])
    const r = resolveMatrixStage(st, 0.5)
    expect(r.rowLabels).toEqual(['⟨+z|', '⟨−z|'])
    expect(r.colLabels).toEqual(['|+z⟩', '|−z⟩'])
    // |+x><+x| = 1/2 [[1, 1], [1, 1]]
    for (const row of r.cells) for (const z of row) expect(Math.abs(z.re - 0.5) + Math.abs(z.im)).toBeLessThan(1e-12)
  })
  it('the default labels are still the qubit kets |0>, |1>', () => {
    const r = resolveMatrixStage(grid(undefined), 0.5)
    expect(r.colLabels).toEqual(['|0⟩', '|1⟩'])
  })
  it('refuses a matrix of more than one spin', () => {
    const st = grid('spin', { pauli: 'XZ' })
    expect(validateMatrixStage(st).join(' ')).toMatch(/ONE spin/)
  })
})
