/**
 * P-L9 item 6: no literal underscore on the pair view's drawn labels. `scripted` turns "α_u" into α with a smaller, dropped tspan, and the
 * pair scene's factor strip and table titles use it, so the screen shows α with a subscript u, never "α_u".
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MatrixGridState } from '../../content/stage'
import { resolve } from '../resolve'
import type { ResolvedMatrix } from '../types'
import { MatrixScene } from './MatrixScene'
import { scripted } from './draw'
import './kinds'

const html = (node: React.ReactNode) => renderToString(<svg><text>{node}</text></svg>)
const plain = (h: string) => h.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '')

describe('scripted: SVG text with real subscripts', () => {
  it('drops each subscript by dy and climbs back before the next plain run; the text content has no underscore', () => {
    const h = html(scripted('α_u = 0.866'))
    expect(plain(h)).toBe('αu = 0.866')
    expect(h).toContain('dy="3"')
    expect(h).toContain('dy="-3"')
    expect(h).toContain('font-size="75%"')
  })
  it('two subscripts in one line: σ_A … σ_B', () => {
    const h = html(scripted('rows: σ_A ↓ · columns: σ_B →'))
    expect(plain(h)).toBe('rows: σA ↓ · columns: σB →')
    expect((h.match(/dy="3"/g) ?? []).length).toBe(2)
    expect((h.match(/dy="-3"/g) ?? []).length).toBe(2)
  })
  it('a string without a subscript is returned as plain text with no tspan', () => {
    expect(html(scripted('exact error rate 0.25'))).not.toContain('tspan')
  })
})

const pair = (extra: Partial<MatrixGridState>): MatrixGridState => ({
  kind: 'matrix',
  source: { coef: { pair: [{ thetaDeg: 60, phiDeg: 0 }, { thetaDeg: 90, phiDeg: 0 }] } },
  labels: 'ud',
  cells: 'amplitudes',
  factors: true,
  shot: 'M-GRID',
  ...extra,
})

describe('the pair scene draws no underscore', () => {
  const draw = (st: MatrixGridState) => plain(renderToString(<svg><MatrixScene state={resolve(st, 1) as ResolvedMatrix} mode="stage" width={380} height={780} slot="full" /></svg>))
  it('the factor strip reads αu, αd, βu, βd', () => {
    const t = draw(pair({}))
    expect(t).not.toMatch(/_/)
    for (const s of ['αu', 'αd', 'βu', 'βd']) expect(t, s).toContain(s)
  })
  it('the classical table title reads σA and σB', () => {
    const t = draw({ kind: 'matrix', source: { table: { classical: 'dealer' } }, shot: 'M-GRID' })
    expect(t).not.toMatch(/_/)
    expect(t).toContain('rows: σA ↓ · columns: σB →')
  })
})
