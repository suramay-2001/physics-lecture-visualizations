/**
 * Widgets W1 `two-spin` and W2 `ghz-game` (448 Lecture 10). The picture is the `two-qubit` kind's (W1) and the `matrix` tableau's (W2),
 * every number is the engine's; the Try-it lines of the lecture promise the numbers checked here. The controls themselves (toggles,
 * buttons) are exercised by the e2e spec.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { GHZ_ROWS, ghzGame } from '../physics/qc/ghz'
import GhzGame, { ghzTableau, planVerdict, startTable } from './GhzGame'
import TwoSpin, { twoSpinModel } from './TwoSpin'
import { resolveMatrixStage, validateMatrixStage } from '../stage/svg/matrix'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const text = (html: string) => html.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('two-spin: the empty centre is computed', () => {
  it('the singlet: both arrows of length 0, the table is −1 on its diagonal, every chance ½ and the same axes always opposite', () => {
    const m = twoSpinModel({ state: 'singlet', theta: 30, axisA: 'z', axisB: 'z' })
    close(Math.hypot(...m.r.rA), 0)
    close(Math.hypot(...m.r.rB), 0)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) close(m.r.T![i][j], i === j ? -1 : 0)
    close(m.exact.alicePlus, 0.5)
    close(m.exact.bobPlus, 0.5)
    close(m.exact.productMinus, 1)
  })

  it('toggled to |ud⟩: the arrows reach the surface and only the zz cell is filled; Alice measuring z is +1 every time, Bob x is a coin', () => {
    const m = twoSpinModel({ state: 'ud', theta: 30, axisA: 'z', axisB: 'x' })
    close(Math.hypot(...m.r.rA), 1)
    close(Math.hypot(...m.r.rB), 1)
    close(m.r.T![2][2], -1)
    close(m.r.T![0][0], 0)
    close(m.exact.alicePlus, 1)
    close(m.exact.bobPlus, 0.5)
    close(m.exact.productMinus, 0.5)
  })

  it('the path: |r_A| = cos 2t, the xx cell reaches −1 at 45°; at 30° the arrow is ½ long and xx = −0.866', () => {
    const at = (t: number) => twoSpinModel({ state: 'path', theta: t, axisA: 'z', axisB: 'x' })
    close(Math.hypot(...at(0).r.rA), 1)
    close(Math.hypot(...at(30).r.rA), 0.5)
    close(Math.hypot(...at(45).r.rA), 0)
    close(at(30).r.T![0][0], -Math.sqrt(3) / 2)
    close(at(45).r.T![0][0], -1)
    // Alice z, Bob x on the singlet: all four joint chances are ¼
    twoSpinModel({ state: 'singlet', theta: 0, axisA: 'z', axisB: 'x' }).joint.forEach((p) => close(p, 0.25))
  })

  it('renders the picture, the controls, the tally tables and the note, with no NaN', () => {
    const html = renderToString(<TwoSpin />)
    const t = text(html)
    expect(t).toContain('|r_A| = 0 · |r_B| = 0')
    expect(t).toContain('Measure 100 pairs')
    expect(t).toContain('Alice first')
    expect(t).toContain('Bob first')
    expect(t).toContain('exact chance')
    expect(t).toContain('both orders pooled')
    expect(html).not.toMatch(/NaN|Infinity/)
    // path state draws its slider; editable false hides the state and axis controls but keeps the buttons
    expect(renderToString(<TwoSpin state="path" theta={45} />)).toContain('type="range"')
    const locked = text(renderToString(<TwoSpin editable={false} />))
    expect(locked).not.toContain('product |ud⟩')
    expect(locked).toContain('Measure 1 pair')
  })
})

describe('ghz-game: the verdicts come from the engine', () => {
  it('the named starting plans are the notes\' plans: "always −1" wins ZXX, XZX, XXZ; A_Z = +1, A_X = −1 with the rest −1 loses ZXX', () => {
    const minus = planVerdict(startTable('minus'))
    expect(minus.wins).toBe(3)
    expect(minus.loses).toEqual(['ZZZ'])
    close(minus.longRun, 0.75)
    const t1 = planVerdict(startTable('t1'))
    expect(t1.wins).toBe(3)
    expect(t1.loses).toEqual(['ZXX'])
    expect(planVerdict(startTable('plus')).loses).toEqual(['ZXX', 'XZX', 'XXZ'])
    expect(planVerdict(startTable('plus')).wins).toBe(1)
  })

  it('no plan wins more than 3 of 4, the four row products always multiply to +1 and the four needs to −1', () => {
    const g = ghzGame()
    expect(g.maxWins).toBe(3)
    for (const { table } of g.tables) {
      const v = planVerdict(table)
      expect(v.wins).toBeLessThanOrEqual(3)
      expect(v.longRun).toBeLessThanOrEqual(0.75)
      expect(v.rowsProduct).toBe(1)
      expect(v.targetsProduct).toBe(-1)
      expect(v.best).toBe(3)
    }
  })

  it('the tableaux validate and resolve: the plan\'s card (wins k of 4) and |G⟩\'s eigenvalues (wins 4 of 4)', () => {
    const plan = ghzTableau({ table: startTable('minus') })
    expect(validateMatrixStage(plan)).toEqual([])
    expect(resolveMatrixStage(plan, 1).wins).toEqual({ k: 3, of: 4 })
    const g = ghzTableau({ state: true })
    expect(validateMatrixStage(g)).toEqual([])
    const r = resolveMatrixStage(g, 1)
    expect(r.wins).toEqual({ k: 4, of: 4 })
    expect(r.rows.map((x) => x.eigen)).toEqual([1, -1, -1, -1])
    expect(GHZ_ROWS.length).toBe(4)
  })

  it('renders each mode with its own controls, with no NaN', () => {
    const table = text(renderToString(<GhzGame mode="table" proof />))
    expect(table).toContain('This plan wins 3 of the 4 inputs and loses ZZZ')
    expect(table).toContain('The best any of the 64 plans does is 3 of 4')
    expect(table).toContain('Your four row products: −1, −1, −1, −1; multiplied: +1')
    expect(table).toContain('The four needs: +1, −1, −1, −1; multiplied: −1')
    expect(table).toContain('Play 20 rounds')
    expect(table).not.toContain('Shared state |G⟩:')
    const q = text(renderToString(<GhzGame mode="quantum" rounds={20} seed={7} />))
    expect(q).toContain('|G⟩ = ½(|000⟩ − |011⟩ − |101⟩ − |110⟩)')
    expect(q).toContain('Play 20 rounds')
    expect(q).not.toContain('This plan wins')
    const both = renderToString(<GhzGame mode="both" rounds={40} />)
    expect(text(both)).toContain('Play 40 rounds')
    expect(text(both)).toContain('This plan wins')
    expect(both).not.toMatch(/NaN|Infinity/)
    const pair = text(renderToString(<GhzGame mode="pair" />))
    expect(pair).toContain('This plan matches 0 of the 2 rows')
    expect(pair).toContain('4 of the 16 possible plans')
    expect(pair).toContain('Hide the plan: 20 pairs')
  })

  it('the proof line follows the plan: the t1 plan\'s row products multiply to +1 as well', () => {
    const t = text(renderToString(<GhzGame mode="table" proof start="t1" />))
    expect(t).toContain('Your four row products: +1, +1, −1, −1; multiplied: +1')
  })
})
