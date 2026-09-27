/**
 * Physics 709's concept graph (the 709 Map). Empty until chapters land: each written chapter adds its concepts here
 * (ids start `qc-`; content/courses.test.ts), with `needs` pointing at earlier 709 concepts. Part of the lazy course
 * pack (pack.ts), never the main chunk.
 */
export interface QcConcept {
  /** `qc-…` */
  id: string
  label: string
  /** The chapter that teaches it (Q4, F2). */
  chapter: string
  /** The unit that teaches it, once the chapter is written. */
  unit?: string
  needs: string[]
}

export const QC_CONCEPTS: QcConcept[] = []
