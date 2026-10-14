/**
 * TESTS ONLY: the full validation context of a paper spec (papers/validate.ts `PaperContext`), read from the eager
 * registries of all three courses. Importing it from application code would pull every chapter of every course into one
 * chunk, so only *.test.ts files import it.
 */
import { courseOfId } from '../content/courses'
import { LECTURES } from '../content/index'
import { PAPER_CHAPTERS } from '../content/papers/index'
import { QC_CHAPTERS } from '../content/qc709/index'
import { OUTLINE_CHAPTERS } from '../content/qc709/outline'
import type { PaperContext } from './validate'

export function paperContext(): PaperContext {
  const all = [...LECTURES, ...QC_CHAPTERS, ...PAPER_CHAPTERS]
  return {
    unitsOf: (chapter) => all.find((l) => l.id === chapter)?.units.map((u) => u.id),
    // 709's semester map lists every planned chapter; the Papers section plans its background chapters in words until each is
    // given an id (content/papers/registry.ts PLANNED_BACKGROUND), so no unwritten Papers chapter is "planned" yet
    planned: (chapter) => courseOfId(chapter) === 'qc709' && OUTLINE_CHAPTERS.some((c) => c.id === chapter && c.status !== 'built'),
  }
}
