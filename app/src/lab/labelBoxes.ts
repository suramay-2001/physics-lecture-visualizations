/**
 * What the lab's projected labels must keep clear of, and what they occupy (DOM, Babylon-free). The selectors are
 * shared by the placement pass (LabStage `useProjectedLabels`) and the measurement surface (`__lab.labels()`, e2e: no
 * two visible labels overlap, and no label covers a passport, a readout line or the caption: P review items 3, 12).
 * Kept small: it rides in the lab page chunk (build/chunks.test.ts budget).
 */
import type { LabelRect } from '../stage/labelLayout'

/** The overlay furniture a label never covers: passports, each readout LINE (not the whole column), the caption. */
export const LAB_RESERVED_SELECTOR = '.stage-passport, .stage-readout, .stage-caption, [data-reserve]'
/** The views a label stays inside (two-view benches); a label without a view uses the whole stage. */
export const LAB_VIEW_SELECTOR = '.lab-view[data-view]'

/** The visible projected labels of the lab stage and its furniture, as page rects [x, y, w, h]. */
export function labelBoxes(doc: Document): { labels: { key: string; box: LabelRect }[]; furniture: { what: string; box: LabelRect }[] } {
  const box = (el: Element): LabelRect => {
    const r = el.getBoundingClientRect()
    return [r.left, r.top, r.width, r.height]
  }
  const on = (sel: string) => [...doc.querySelectorAll<HTMLElement>(sel)].filter((el) => el.getBoundingClientRect().width > 0)
  return {
    labels: on('.lab-stage .lab-label[data-hidden="0"]').map((el) => ({ key: el.dataset.label ?? '', box: box(el) })),
    furniture: on(`.lab-stage :is(${LAB_RESERVED_SELECTOR})`).map((el) => ({ what: el.dataset.key ?? el.className, box: box(el) })),
  }
}
