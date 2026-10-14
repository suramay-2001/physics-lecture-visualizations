/**
 * `code` (P-Q21-story §9.2 K1): the one scene (stage, reading version, print figure). Every disc and square carries an accessible name, the views draw no NaN, and in
 * every registered code, overlay and box shape nothing leaves the box and no two marks sit on top of each other (the label-collision pass of skill 09, as numbers).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CodeState } from '../../content/stage'
import { REGISTERED_CODE_IDS } from '../../physics/qec/registry'
import { FigureFor } from '../figures/FigureFor'
import { resolve } from '../resolve'
import type { ResolvedCode } from '../types'
import { CodeScene, checksGeometry, codeGeometry, letterColor, wordsGeometry, wrapLine } from './CodeScene'
import './kinds'

const C = (st: Omit<CodeState, 'kind'>): CodeState => ({ kind: 'code', ...st })
const R = (st: Omit<CodeState, 'kind'>) => resolve(C(st), 1) as ResolvedCode
type Mode = 'stage' | 'print'
const draw = (r: ResolvedCode, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <CodeScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

/** The boxes the scene is drawn in: the live stage in a portrait column, a wide pane, a split pane's top half, the reading version and the print figure. */
const BOXES: [Mode, number, number, boolean, 'full' | 'top' | 'bottom'][] = [
  ['stage', 506, 785, false, 'full'],
  ['stage', 700, 560, false, 'full'],
  ['stage', 506, 360, false, 'top'],
  ['stage', 320, 360, true, 'full'],
  ['print', 320, 360, false, 'full'],
]

const OVERLAYS: Partial<Record<string, Omit<CodeState, 'kind' | 'code'>[]>> = {
  rep3: [{}, { error: 'IXI', show: ['syndrome', 'correction', 'residual', 'logical'] }],
  rep3x: [{ error: 'IZI', show: ['syndrome', 'correction', 'residual'] }],
  shor9: [{}, { error: 'Z4X2', show: ['syndrome', 'correction', 'residual', 'logical'] }],
  steane7: [{}, { error: 'X1X2', show: ['syndrome', 'correction', 'residual', 'logical'] }, { error: 'Y4', show: ['syndrome', 'correction'] }],
  five5: [{}, { error: 'Z3', show: ['syndrome', 'correction', 'residual', 'logical'] }],
  surface3: [{}, { error: 'Y5X1', show: ['syndrome', 'correction', 'residual', 'logical'] }],
  surface5: [{}, { error: 'X7Z19', show: ['syndrome', 'correction', 'residual', 'logical'] }],
  gross: [{}, { focus: 'X20' }, { focus: ['X20', 'Z5'], shift: [3, -1] }, { error: 'X40', show: ['syndrome', 'logical'] }],
  'two-gross': [{}, { focus: 'Z70' }, { error: 'Z100', show: ['syndrome', 'logical'] }],
}

describe('code scene: drawn from the resolved state only', () => {
  it('every disc and square carries an accessible name, in every code and box; no NaN; the anchors of what is drawn are present', () => {
    for (const id of REGISTERED_CODE_IDS)
      for (const ov of OVERLAYS[id]!) {
        const r = R({ code: id, ...ov })
        for (const [mode, w, h, bare, slot] of BOXES) {
          const html = draw(r, mode, w, h, bare, slot)
          const where = `${id} ${JSON.stringify(ov)} ${mode} ${w}x${h}`
          expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
          expect(html).toContain('data-kind="code"')
          expect(html.match(/aria-label="[^"]*data qubit[^"]*"/g)?.length, `${where}: qubits`).toBe(r.n)
          expect(html.match(/aria-label="[^"]*check [XZg]?\d+ on/g)?.length, `${where}: checks`).toBe(r.checks.length)
          expect(html).toContain('data-anchor="qubit"')
          expect(html).toContain('data-anchor="check"')
          if (r.edges.length) expect(html).toContain('data-anchor="edge"')
          if (r.error) expect(html).toContain('error ')
          if (r.logical) expect(html).toContain('data-anchor="logical"')
          if (r.tile?.focus.length) expect(html).toContain('data-anchor="stub"')
          if (r.tile?.shift) expect(html).toContain('data-anchor="shift"')
        }
      }
  })

  it('the lit squares are the syndrome’s: data-lit="1" appears once per check that reads −1', () => {
    for (const [id, error, want] of [['steane7', 'X5', 2], ['shor9', 'Z4', 2], ['surface5', 'X7Z19', 4], ['gross', 'X40', 3]] as const) {
      const r = R({ code: id, error, show: ['syndrome'] })
      const html = draw(r, 'stage', 506, 785)
      expect(html.match(/data-lit="1"/g)?.length, id).toBe(want)
      expect(html.match(/data-lit="0"/g)?.length, id).toBe(r.checks.length - want)
    }
    // without show: 'syndrome' no check is lit on the picture (the lit ring is drawn only when asked)
    const quiet = draw(R({ code: 'steane7', error: 'X5' }), 'stage', 506, 785)
    expect(quiet.includes('−1') || quiet.includes('data-lit="1"')).toBe(false)
  })

  it('names the qubit and what the overlays put on it, so a hit qubit is announced', () => {
    const html = draw(R({ code: 'steane7', error: 'X5', show: ['syndrome', 'correction', 'residual', 'logical'] }), 'stage', 506, 785)
    expect(html).toContain('data qubit 5: error X, correction X')
    expect(html).toContain('Z check Z1 on 4 qubits: IIIIIII'.replace('IIIIIII', 'ZIZIZIZ') + ', reads −1')
    expect(html).toContain('X check X1 on 4 qubits: XIXIXIX, reads +1')
  })

  it('the bicycle qubits are named by family and cell, the stage names the code and the figure carries its name and readouts as text lines', () => {
    const r = R({ code: 'gross', focus: 'X20' })
    const html = draw(r, 'stage', 506, 785)
    expect(html).toContain('L data qubit of cell (0, 0), number 1')
    expect(html).toContain('R data qubit of cell (0, 0), number 73')
    expect(html).toContain('gross code [[144, 12]]')
    const fig = draw(r, 'print', 320, 360)
    for (const t of ['gross code [[144, 12]]', 'n = 144 · k = 12', 'd = 12 (paper)', 'X20: 4 near, 2 long']) expect(fig).toContain(t)
    // the stub is labelled with its target
    expect(html).toContain('→ L(6, 1)')
    expect(html).toContain('→ R(2, 5)')
  })

  it('the figure puts “syndrome:” in front of the lit checks (the live column drops it for room) and wraps long lines', () => {
    const fig = draw(R({ code: 'surface5', error: 'X7Z19', show: ['syndrome', 'correction', 'residual'] }), 'print', 320, 360)
    expect(fig).toContain('syndrome: X8,X10,Z2,Z4 read −1')
    expect(wrapLine('aaa bbb ccc ddd', 8)).toEqual(['aaa bbb', '    ccc', '    ddd'])
    expect(wrapLine('short', 50)).toEqual(['short'])
  })

  it('the letters have the matrix tableau’s hues: X, Y, Z differ, I has none', () => {
    const hues = ['X', 'Y', 'Z'].map((l) => letterColor(l, 'stage'))
    expect(new Set(hues).size).toBe(3)
    expect(letterColor('I', 'stage')).toBeUndefined()
    expect(letterColor('X', 'print')).not.toBe(letterColor('X', 'stage'))
  })
})

describe('code scene: packing — inside the box, nothing on top of anything else', () => {
  for (const id of REGISTERED_CODE_IDS)
    it(`${id}: every qubit and check sits inside the box and clear of the others, in every box shape`, () => {
      for (const ov of OVERLAYS[id]!)
        for (const [mode, w, h, bare, slot] of BOXES) {
          const r = R({ code: id, ...ov })
          const g = codeGeometry(r, w, h, mode === 'print' || bare, slot)
          const where = `${id} ${JSON.stringify(ov)} ${mode} ${w}x${h} ${slot}`
          const marks = [
            ...r.qubits.map((q) => ({ ...g.at(q.x, q.y), r: g.disc, what: `qubit ${q.index + 1}` })),
            ...r.checks.map((c) => ({ ...g.at(c.x, c.y), r: g.sq, what: `check ${c.label}` })),
          ]
          for (const m of marks) {
            expect(m.x - m.r, `${where} ${m.what} left`).toBeGreaterThanOrEqual(0)
            expect(m.x + m.r, `${where} ${m.what} right`).toBeLessThanOrEqual(w)
            expect(m.y - m.r, `${where} ${m.what} top`).toBeGreaterThanOrEqual(g.area.y - 1)
            expect(m.y + m.r, `${where} ${m.what} bottom`).toBeLessThanOrEqual(g.area.y + g.area.h)
          }
          // no two marks overlap (their discs / squares, 1 px apart at least)
          let minGap = Infinity
          for (let i = 0; i < marks.length; i++)
            for (let j = i + 1; j < marks.length; j++) minGap = Math.min(minGap, Math.hypot(marks[i].x - marks[j].x, marks[i].y - marks[j].y) - marks[i].r - marks[j].r)
          expect(minGap, `${where}: two marks touch`).toBeGreaterThan(0.5)
          // the figure's own lines stay above the drawing, and fit the box
          if (g.lines.length) expect(6 + 13 * g.lines.length, where).toBeLessThanOrEqual(g.area.y + 1)
          expect(g.area.y + g.area.h, where).toBeLessThanOrEqual(h)
        }
    })

  it('the legend sits below every mark (its row is the last 22 px of the drawing area)', () => {
    for (const id of REGISTERED_CODE_IDS) {
      const r = R({ code: id })
      for (const [mode, w, h, bare, slot] of BOXES) {
        const g = codeGeometry(r, w, h, mode === 'print' || bare, slot)
        const lowest = Math.max(...r.qubits.map((q) => g.at(q.x, q.y).y + g.disc), ...r.checks.map((c) => g.at(c.x, c.y).y + g.sq))
        expect(lowest, `${id} ${mode} ${w}x${h}`).toBeLessThanOrEqual(g.area.y + g.area.h - 14)
      }
    }
  })
})

describe('code scene: the table and the words fit', () => {
  it('the generator table and the error rows fit inside the area, with cells between 14 and 34 px, in every box', () => {
    for (const id of ['rep3', 'shor9', 'steane7', 'five5', 'surface3'] as const)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R({ code: id, view: 'checks', errors: ['X1', 'Z2', 'Y3', 'X1X2', 'Z1Z2', 'X3', 'Z3', 'Y1'] })
        const g = codeGeometry(r, w, h, mode === 'print' || bare, slot)
        const T = checksGeometry(r, g.area)
        const where = `${id} ${mode} ${w}x${h}`
        expect(T.cell, where).toBeGreaterThanOrEqual(14)
        expect(T.cell, where).toBeLessThanOrEqual(34)
        const rightEdge = T.x0 + T.cell * (r.n + 1 + r.table!.rows.length)
        expect(rightEdge, `${where} right`).toBeLessThanOrEqual(w)
        expect(T.x0 - T.labelW, `${where} left`).toBeGreaterThanOrEqual(0)
        expect(T.y0 + T.cell * (r.table!.rows.length + r.table!.errors.length + 3), `${where} bottom`).toBeLessThanOrEqual(g.area.y + g.area.h + 4)
        const html = draw(r, mode, w, h, bare, slot)
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-anchor="table"')
        expect(html).toContain('data-anchor="syndrome"')
      }
  })
  it('the words fit in the area: up to 16 rows of at least 14 px, the bars inside the box', () => {
    for (const [id, word] of [['steane7', 0], ['steane7', 'plus'], ['shor9', 1], ['rep3', 0], ['five5', 0], ['surface3', 1]] as const)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R({ code: id, view: 'words', word })
        const g = codeGeometry(r, w, h, mode === 'print' || bare, slot)
        const G = wordsGeometry(r, g.area)
        const where = `${id} ${word} ${mode} ${w}x${h}`
        expect(G.rh, where).toBeGreaterThanOrEqual(14)
        expect(G.barX + G.barW + 60, `${where} right`).toBeLessThanOrEqual(w + 2)
        expect(G.y0 + G.rh * r.words!.terms.length, `${where} bottom`).toBeLessThanOrEqual(g.area.y + g.area.h)
        expect(G.y0 - 22, `${where} top`).toBeGreaterThanOrEqual(g.area.y - 22)
        const html = draw(r, mode, w, h, bare, slot)
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-anchor="word"')
        expect(html.match(/aria-label="basis string/g)?.length, where).toBe(r.words!.terms.length)
      }
  })
})

describe('code: the print figure', () => {
  it('is the same scene in print ink, numbered, titled with the passport, with the readouts as its own lines', () => {
    const html = renderToString(<FigureFor layout={C({ code: 'steane7', error: 'X5', show: ['syndrome', 'correction', 'residual'], shot: 'CD-CODE' })} number="Q22.4" caption="a flip on qubit 5" />)
    expect(html).toContain('<figure class="print-figure"')
    expect(html).toContain('<title>Fig. Q22.4: CODE · qubits and checks</title>')
    expect(html).toContain('viewBox="0 0 320 360"')
    expect(html).toContain('svgk-print')
    expect(html).toContain('syndrome: Z1, Z3 read −1')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
  it('draws every registered code and view as a figure', () => {
    for (const id of REGISTERED_CODE_IDS) {
      const html = renderToString(<FigureFor layout={C({ code: id })} number="Q0.1" />)
      expect(html, id).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
    }
    for (const view of ['checks', 'words'] as const) expect(renderToString(<FigureFor layout={C({ code: 'steane7', view })} number="Q0.2" />)).toContain('data-view="' + view + '"')
  })
})
