/**
 * The Papers section's light registry: the shelf's cards and the list of written chapters, without the chapters (or their
 * specs) themselves. Every papers page imports it, so it arrives with the first papers page's lazy chunk and registers the
 * chapter list with the app (`metaFor('papers')`, `metaById('P1')`, content/courses.ts). Never imported by a 448 or 709
 * page (build/chunks.test.ts rule (q)); the course switcher and the return bar fetch it on demand.
 */
import { registerCourseMeta } from '../courses'
import { PAPER_CARDS, PAPERS_META } from './meta.generated'

registerCourseMeta('papers', PAPERS_META)

export { PAPER_CARDS, PAPERS_META }
export type { PaperCard } from './cards'

/**
 * What the Papers section plans to add, in words (rulings papers.md R2): material no course textbook teaches becomes shared
 * background chapters. Shown on the shelf until each is written; their ids are assigned when they are planned.
 */
export const PLANNED_BACKGROUND: readonly string[] = [
  'magic states',
  'Pauli-based computation',
  'quantum LDPC codes',
]
