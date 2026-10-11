/**
 * Which widgets a lecture shows (widgets/registry.tsx loads them, pages/LecturePage.tsx waits for them): kept out of the registry
 * so that the registry, which the challenge cards and the Help page import, does not pull the stage's resolver along.
 */
import type { Lecture, WidgetKind } from '../content/schema'
import { layoutStates } from '../content/stage'
import { staticWidgetFor } from './staticWidgets'

/** Kinds the lecture page does not wait for: the Bloch sphere brings three.js, so it keeps loading behind its placeholder. */
const NOT_AWAITED: readonly WidgetKind[] = ['bloch']

/**
 * Every widget kind a lecture shows, in first-use order: each unit's Try-it, the clues' and the walkthroughs' pictures, the
 * challenges' widgets, and the 2-D widget the reading version puts beside a beat (stage/staticWidgets.ts). What the page waits
 * for is these, less the Bloch sphere.
 */
export function lectureWidgetKinds(l: Lecture | undefined): WidgetKind[] {
  const out: WidgetKind[] = []
  const add = (k: WidgetKind | undefined) => {
    if (k && !out.includes(k) && !NOT_AWAITED.includes(k)) out.push(k)
  }
  for (const u of l?.units ?? []) {
    add(u.visual.kind)
    for (const c of u.clues) add(c.show?.kind)
    for (const c of u.play) {
      add(c.widget?.kind)
      for (const w of c.walkthrough) add(w.show?.kind)
    }
    for (const b of u.story ?? []) for (const s of layoutStates(b.stage)) add(staticWidgetFor(s)?.kind)
  }
  return out
}
