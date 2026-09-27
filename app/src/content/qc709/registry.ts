/**
 * Physics 709's light registry: the outline (Parts, plates, every planned chapter) and the list of written chapters,
 * without the chapters themselves. Every 709 page imports it, so it arrives with the first 709 page's lazy chunk and
 * registers the chapter list with the app (`metaFor('qc709')`, `metaById('Q4')`, content/courses.ts). It must never
 * be imported by 448 code (chunk contract (h), build/chunks.test.ts).
 */
import { registerCourseMeta } from '../courses'
import { QC_META } from './meta.generated'

registerCourseMeta('qc709', QC_META)

export { QC_META }
export * from './outline'
