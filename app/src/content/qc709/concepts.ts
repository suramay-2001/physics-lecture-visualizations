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
  // F1 "Numbers that turn" (P-F1-story §11.1): the four number stations are Spin Lab's "complex numbers as turns"
  { id: 'qc-imaginary-unit', label: 'The number i: a quarter turn', chapter: 'F1', unit: 'f1-number-line', needs: [], sameAs: 'complex-numbers' },
  { id: 'qc-complex-plane', label: 'Complex numbers as points: sum, size, mirror', chapter: 'F1', unit: 'f1-plane', needs: ['qc-imaginary-unit'], sameAs: 'complex-numbers' },
  { id: 'qc-complex-multiply', label: 'Multiplying: sizes multiply, angles add', chapter: 'F1', unit: 'f1-multiply', needs: ['qc-complex-plane'], sameAs: 'complex-numbers' },
  { id: 'qc-euler', label: 'Euler’s formula and the unit circle', chapter: 'F1', unit: 'f1-euler', needs: ['qc-complex-multiply'], sameAs: 'complex-numbers' },
  { id: 'qc-phase', label: 'Global and relative phase, interference', chapter: 'F1', unit: 'f1-phase', needs: ['qc-euler'] },
  // Chapter Q1 (P-Q1-story §11.1), with its needs on F1's stations (joined when the parallel pilots merged)
  { id: 'qc-sg-quantization', label: 'Two spots: the moment takes two values', chapter: 'Q1', unit: 'q1-two-spots', needs: [], sameAs: 'quantized' },
  { id: 'qc-measurement-prepares', label: 'A new axis erases the old answer', chapter: 'Q1', unit: 'q1-sequences', needs: ['qc-sg-quantization'], sameAs: 'prepares' },
  { id: 'qc-superposition', label: 'Superposition of states', chapter: 'Q1', unit: 'q1-superposition', needs: ['qc-measurement-prepares', 'qc-phase'], sameAs: 'vectors' },
  { id: 'qc-vector-space', label: 'The vector-space rules', chapter: 'Q1', unit: 'q1-vector-space', needs: ['qc-superposition', 'qc-complex-plane'], sameAs: 'vector-space' },
  { id: 'qc-inner-product', label: 'Inner products, bras and norms', chapter: 'Q1', unit: 'q1-inner-product', needs: ['qc-vector-space', 'qc-complex-multiply'], sameAs: 'inner-product' },
  // Chapter Q2 (P-Q2-story §11.1)
  { id: 'qc-basis', label: 'Independent arrows, bases, unique components', chapter: 'Q2', unit: 'q2-basis', needs: ['qc-inner-product'], sameAs: 'principles' },
  { id: 'qc-gram-schmidt', label: 'Gram–Schmidt builds an orthonormal basis', chapter: 'Q2', unit: 'q2-gram-schmidt', needs: ['qc-basis'] },
  { id: 'qc-x-states', label: 'The x states from the Stern–Gerlach facts', chapter: 'Q2', unit: 'q2-spin-space', needs: ['qc-basis', 'qc-phase'], sameAs: 'mutually-unbiased' },
  { id: 'qc-operator-matrix', label: 'Operators, outer products and tables', chapter: 'Q2', unit: 'q2-operators', needs: ['qc-basis'], sameAs: 'operators' },
  { id: 'qc-change-of-basis', label: 'Changing basis: U, H and UAU†', chapter: 'Q2', unit: 'q2-change', needs: ['qc-operator-matrix', 'qc-x-states'], sameAs: 'basis-change' },
  { id: 'qc-photon-frames', label: 'Photon polarization and turning frames', chapter: 'Q2', unit: 'q2-photon', needs: ['qc-change-of-basis', 'qc-euler'], sameAs: 'rz' },
  // Chapter Q3 (P-Q3-story §11.1), with its needs on Q2's stations (joined when the parallel builds merged)
  { id: 'qc-born-projector', label: 'Chances as projector sandwiches', chapter: 'Q3', unit: 'q3-born', needs: ['qc-superposition', 'qc-basis'], sameAs: 'born-rule' },
  { id: 'qc-bloch-sphere', label: 'The Bloch sphere: two angles per state', chapter: 'Q3', unit: 'q3-bloch', needs: ['qc-x-states', 'qc-euler'], sameAs: 'bloch-sphere' },
  { id: 'qc-spin-operators', label: 'Spin operators and Pauli matrices', chapter: 'Q3', unit: 'q3-spin-operators', needs: ['qc-born-projector', 'qc-bloch-sphere', 'qc-change-of-basis'], sameAs: 'spin-matrices' },
  { id: 'qc-observables', label: 'Averages and Hermitian observables', chapter: 'Q3', unit: 'q3-observables', needs: ['qc-spin-operators', 'qc-operator-matrix'], sameAs: 'observables' },
  { id: 'qc-spectral', label: 'Real eigenvalues, spectral form and spread', chapter: 'Q3', unit: 'q3-spectral', needs: ['qc-observables'], sameAs: 'eigen-problem' },
  { id: 'qc-uncertainty', label: 'Commutators and the uncertainty relation', chapter: 'Q3', unit: 'q3-uncertainty', needs: ['qc-spectral'], sameAs: 'uncertainty' },
  // Chapter Q4 (P-Q4-story §11.1)
  { id: 'qc-qubit', label: 'The qubit: two levels, one sphere', chapter: 'Q4', unit: 'q4-qubit', needs: ['qc-superposition', 'qc-bloch-sphere'] },
  { id: 'qc-one-qubit-gates', label: 'One-qubit gates as turns of the sphere', chapter: 'Q4', unit: 'q4-one-qubit-gates', needs: ['qc-qubit', 'qc-spin-operators', 'qc-change-of-basis'] },
  { id: 'qc-registers', label: 'Registers and the tensor product', chapter: 'Q4', unit: 'q4-registers', needs: ['qc-qubit', 'qc-vector-space'] },
  { id: 'qc-cnot', label: 'CNOT and controlled gates', chapter: 'Q4', unit: 'q4-cnot', needs: ['qc-registers', 'qc-one-qubit-gates'] },
  { id: 'qc-circuits', label: 'Circuits, Bell pairs and SWAP', chapter: 'Q4', unit: 'q4-circuits', needs: ['qc-cnot'] },
  { id: 'qc-readout', label: 'Reading a register', chapter: 'Q4', unit: 'q4-measure', needs: ['qc-circuits', 'qc-born-projector'] },
]
