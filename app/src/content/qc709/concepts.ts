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
  /** The same idea in Spin Lab (a 448 concept id, content/concepts.ts): the map draws it as a cross-course edge
   * (judge's ruling 6 on the pilots, docs/roles/decisions/qc709-pilots.md). */
  sameAs?: string
}

/** Everything wrong with a 709 concept list (concepts.test.ts): an empty list means the graph is sound. */
export function conceptProblems(
  list: readonly QcConcept[],
  ctx: { chapters: readonly string[]; units: Readonly<Record<string, readonly string[]>>; concepts448: readonly string[] },
): string[] {
  const out: string[] = []
  const ids = new Set<string>()
  for (const c of list) {
    if (ids.has(c.id)) out.push(`${c.id}: duplicate id`)
    ids.add(c.id)
  }
  const at = new Map(list.map((c) => [c.id, ctx.chapters.indexOf(c.chapter)]))
  for (const c of list) {
    if (!c.id.startsWith('qc-')) out.push(`${c.id}: id must start qc-`)
    if (!ctx.chapters.includes(c.chapter)) out.push(`${c.id}: chapter ${c.chapter} is not in the outline`)
    if (c.unit && !(ctx.units[c.chapter] ?? []).includes(c.unit)) out.push(`${c.id}: unit ${c.unit} is not a unit of ${c.chapter}`)
    if (c.sameAs !== undefined && !ctx.concepts448.includes(c.sameAs)) out.push(`${c.id}: sameAs ${c.sameAs} is not a Spin Lab concept`)
    for (const n of c.needs) {
      if (!ids.has(n)) out.push(`${c.id}: needs unknown ${n}`)
      else if ((at.get(n) ?? -1) > (at.get(c.id) ?? -1)) out.push(`${c.id}: needs ${n}, taught in a LATER chapter`)
    }
  }
  const state = new Map<string, 1 | 2>()
  const needsOf = new Map<string, string[]>() // a duplicated id keeps every copy's needs, so no cycle hides behind it
  for (const c of list) needsOf.set(c.id, [...(needsOf.get(c.id) ?? []), ...c.needs])
  const visit = (id: string, path: string[]): void => {
    if (state.get(id) === 2) return
    if (state.get(id) === 1) {
      out.push(`cycle: ${[...path, id].join(' → ')}`)
      return
    }
    state.set(id, 1)
    for (const n of needsOf.get(id) ?? []) if (needsOf.has(n)) visit(n, [...path, id])
    state.set(id, 2)
  }
  for (const c of list) visit(c.id, [])
  return out
}

export const QC_CONCEPTS: QcConcept[] = [
  // Chapter Q1 (P-Q1-story §11.1). Its needs on F1's stations (qc-phase, qc-complex-plane, qc-complex-multiply) join when
  // F1's concepts land: F1 and Q1 were built in parallel, so neither lists the other's ids.
  { id: 'qc-sg-quantization', label: 'Two spots: the moment takes two values', chapter: 'Q1', unit: 'q1-two-spots', needs: [], sameAs: 'quantized' },
  { id: 'qc-measurement-prepares', label: 'A new axis erases the old answer', chapter: 'Q1', unit: 'q1-sequences', needs: ['qc-sg-quantization'], sameAs: 'prepares' },
  { id: 'qc-superposition', label: 'Superposition of states', chapter: 'Q1', unit: 'q1-superposition', needs: ['qc-measurement-prepares'], sameAs: 'vectors' },
  { id: 'qc-vector-space', label: 'The vector-space rules', chapter: 'Q1', unit: 'q1-vector-space', needs: ['qc-superposition'], sameAs: 'vector-space' },
  { id: 'qc-inner-product', label: 'Inner products, bras and norms', chapter: 'Q1', unit: 'q1-inner-product', needs: ['qc-vector-space'], sameAs: 'inner-product' },
]
