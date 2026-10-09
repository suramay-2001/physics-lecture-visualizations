/**
 * W-448 L11 visual QA: on the live stage's full view the passport (title, note, hue legend) covers the top-left ~112 px, so a matrix
 * grid starts below it (it used to start at 60 px and the first cell, or the first column label, hid under the passport). A split's
 * panes are short and keep the tighter margin.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MatrixGridState } from '../../content/stage'
import { resolve } from '../resolve'
import type { ResolvedMatrix } from '../types'
import { MatrixScene } from './MatrixScene'
import './kinds'

const grid = (labels: MatrixGridState['labels']): MatrixGridState => ({ kind: 'matrix', source: { gate: { name: 'Rz', params: [60] } }, labels, shot: 'M-GRID' })
/** The smallest y of any rectangle the scene draws (the grid's frame and cells). */
const topOf = (labels: MatrixGridState['labels'], slot: 'full' | 'top' | 'bottom', h = 780): number => {
  const html = renderToString(
    <svg>
      <MatrixScene state={resolve(grid(labels), 1) as ResolvedMatrix} mode="stage" width={380} height={h} slot={slot} />
    </svg>,
  )
  return Math.min(...[...html.matchAll(/<rect [^>]*?\by="([\d.]+)"/g)].map((m) => Number(m[1])))
}

describe('matrix grid: the passport leaves the first row of cells alone on the full view', () => {
  it('a full view starts the grid at 112 px or lower, with or without labels', () => {
    expect(topOf('none', 'full')).toBeGreaterThanOrEqual(112)
    expect(topOf('kets', 'full')).toBeGreaterThanOrEqual(112)
  })
  it('a split’s panes keep the tighter margin (their own passports sit in the pane’s corner)', () => {
    expect(topOf('none', 'top', 400)).toBeLessThan(112)
    expect(topOf('none', 'bottom', 400)).toBeLessThan(112)
  })
})
