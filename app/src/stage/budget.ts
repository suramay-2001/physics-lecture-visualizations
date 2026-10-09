/**
 * The VARIANCE BUDGET readout (W-448 L8-A; Lecture 8 §8.1): the three Pauli variances (Δσ_x)², (Δσ_y)², (Δσ_z)² = 1 − r_i²
 * as three bars, stacked into one total bar with ticks at 2 and 3, and the line "total = 3 − r² = 2.00". On the Bloch sphere
 * the total is 2 whatever the state; at the centre of the ball it is 3. Every number comes from the resolved state
 * (physics/density.ts `pauliVariances`, `varianceTotal`); this module only draws them.
 *
 * THREE-FREE and engine-free. The overlay's readout node is plain text for every other readout; this one fills it with a few
 * DOM nodes once (textContent only, no markup is ever parsed) and updates widths and the one text line each frame.
 */
import { stage } from './store'

export const BUDGET_AXES = ['x', 'y', 'z'] as const
/** The total bar spans 0…3 (the most the three variances can add to): ticks at 2 (a pure state) and 3 (the centre). */
export const BUDGET_SPAN = 3

const f2 = (x: number): string => (Math.abs(x) < 0.005 ? 0 : x).toFixed(2).replace('-', '−')

/** "total = 3 − r² = 2.00": the text under the bars. */
export const budgetText = (v: readonly [number, number, number]): string => `total = 3 − r² = ${f2(v[0] + v[1] + v[2])}`
/** One row's text: "x 0.63". */
export const budgetRowText = (axis: 'x' | 'y' | 'z', x: number): string => `${axis} ${f2(x)}`
/** Width of a bar as a percentage of its track (a variance of 1 fills it; the total bar spans 0…3). */
export const budgetPct = (x: number, span = 1): number => Math.max(0, Math.min(100, (100 * x) / span))

const el = (tag: string, cls?: string): HTMLElement => {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  return n
}

function build(): HTMLElement {
  const root = el('span', 'budget')
  root.dataset.budget = '1'
  const title = el('span', 'budget-title')
  title.textContent = 'variance budget (Δσ)²'
  root.append(title)
  for (const a of BUDGET_AXES) {
    const row = el('span', 'budget-row')
    row.dataset.axis = a
    const name = el('b')
    name.textContent = a
    const track = el('i')
    const fill = el('u')
    track.append(fill)
    const val = el('em')
    row.append(name, track, val)
    root.append(row)
  }
  const tot = el('span', 'budget-total')
  const track = el('i')
  for (const a of BUDGET_AXES) {
    const seg = el('u')
    seg.dataset.seg = a
    track.append(seg)
  }
  for (const [at, label] of [[2, '2'], [3, '3']] as const) {
    const tick = el('s')
    tick.style.left = `${budgetPct(at, BUDGET_SPAN)}%`
    tick.dataset.tick = label
    track.append(tick)
  }
  tot.append(track)
  const ticks = el('span', 'budget-ticks')
  for (const [at, label] of [[2, '2'], [3, '3']] as const) {
    const t = el('span')
    t.style.left = `${budgetPct(at, BUDGET_SPAN)}%`
    t.textContent = label
    ticks.append(t)
  }
  const text = el('span', 'budget-text')
  root.append(tot, ticks, text)
  return root
}

/**
 * Write the budget into the overlay node `key` (= labelKey(viewKey, name)), or empty it with `null`. Rebuilds nothing after
 * the first call; unlike `writeReadout` it never touches textContent once built.
 */
export function writeBudget(key: string, v: readonly [number, number, number] | null): void {
  const node = stage.dom.get(key)
  if (!node) return
  if (!v) {
    if (node.firstElementChild) node.textContent = ''
    return
  }
  let root = node.firstElementChild as HTMLElement | null
  if (!root || root.dataset.budget !== '1') {
    node.textContent = ''
    root = build()
    node.append(root)
  }
  const rows = root.querySelectorAll<HTMLElement>('.budget-row')
  BUDGET_AXES.forEach((_a, i) => {
    const fill = rows[i].querySelector('u') as HTMLElement
    const w = `${budgetPct(v[i]).toFixed(2)}%`
    if (fill.style.width !== w) fill.style.width = w
    const val = rows[i].querySelector('em') as HTMLElement
    const t = f2(v[i])
    if (val.textContent !== t) val.textContent = t
  })
  // the stacked total: x, then y, then z, each as wide as its variance on the 0…3 span
  let left = 0
  const segs = root.querySelectorAll<HTMLElement>('.budget-total u')
  BUDGET_AXES.forEach((_, i) => {
    const seg = segs[i]
    const w = budgetPct(v[i], BUDGET_SPAN)
    seg.style.left = `${left.toFixed(2)}%`
    seg.style.width = `${w.toFixed(2)}%`
    left += w
  })
  const text = root.querySelector('.budget-text') as HTMLElement
  const t = budgetText(v)
  if (text.textContent !== t) text.textContent = t
}
