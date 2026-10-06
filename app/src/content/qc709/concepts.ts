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
  // F2 "Vectors and inner products" (P-F2-story §11.1). Four of the plan's five ids collide with ones Q1/Q2 already
  // own (qc-inner-product: Q1; qc-gram-schmidt: Q2) or would read confusingly against them (qc-norm, qc-orthonormal-basis
  // are free here, but qc-inner-product and qc-gram-schmidt are not): renamed with a `-station` suffix, the pattern
  // already used for a later chapter's own station on a concept an earlier one named first (e.g. qc-bell-basis-station).
  // "twin" (sameAs) vs "links" (bridge only, no sameAs) follows the plan's own column exactly, as F1's qc-phase does.
  { id: 'qc-ket', label: 'States as kets in ℂⁿ', chapter: 'F2', unit: 'f2-vectors', needs: [], sameAs: 'vectors' },
  { id: 'qc-inner-product-station', label: 'The inner product ⟨α|β⟩', chapter: 'F2', unit: 'f2-inner-product', needs: ['qc-ket'] },
  { id: 'qc-norm', label: 'Length, right angles, angle', chapter: 'F2', unit: 'f2-norm-angle', needs: ['qc-inner-product-station'] },
  { id: 'qc-orthonormal-basis', label: 'Frames and components', chapter: 'F2', unit: 'f2-orthonormal', needs: ['qc-norm'], sameAs: 'vectors' },
  { id: 'qc-gram-schmidt-station', label: 'Straightening a skew frame', chapter: 'F2', unit: 'f2-gram-schmidt', needs: ['qc-orthonormal-basis'] },
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
  // Chapter Q5 (P-Q5-story §11.1)
  { id: 'qc-deutsch-problem', label: "Deutsch's problem: constant or balanced", chapter: 'Q5', unit: 'q5-problem', needs: ['qc-cnot'] },
  { id: 'qc-oracle-kickback', label: 'Oracles and phase kickback', chapter: 'Q5', unit: 'q5-oracle', needs: ['qc-deutsch-problem', 'qc-circuits'] },
  { id: 'qc-quantum-parallelism', label: 'Quantum parallelism and its limit', chapter: 'Q5', unit: 'q5-one-value', needs: ['qc-oracle-kickback', 'qc-readout'] },
  { id: 'qc-deutsch-algorithm', label: "Deutsch's algorithm", chapter: 'Q5', unit: 'q5-deutsch', needs: ['qc-quantum-parallelism'] },
  { id: 'qc-mach-zehnder', label: 'The interferometer version', chapter: 'Q5', unit: 'q5-interferometer', needs: ['qc-deutsch-algorithm', 'qc-photon-frames', 'qc-phase'] },
  { id: 'qc-other-models', label: 'Adiabatic and measurement-based computing', chapter: 'Q5', unit: 'q5-other-models', needs: ['qc-deutsch-algorithm', 'qc-spectral'] },
  // Chapter Q7 (P-Q7-story §11.1).
  { id: 'qc-ghz', label: 'GHZ: all or nothing', chapter: 'Q7', unit: 'q7-ghz', needs: ['qc-bell-basis-station'] },
  { id: 'qc-ghz-brackets', label: 'Brackets in the x and y bases', chapter: 'Q7', unit: 'q7-brackets', needs: ['qc-ghz', 'qc-x-states', 'qc-complex-multiply'] },
  { id: 'qc-ghz-table', label: 'One formula for every run', chapter: 'Q7', unit: 'q7-parity-table', needs: ['qc-ghz-brackets'] },
  { id: 'qc-ghz-parity', label: 'Surviving strings carry the parity', chapter: 'Q7', unit: 'q7-bit-strings', needs: ['qc-ghz-table', 'qc-parities-station'] },
  { id: 'qc-mermin-observables', label: 'Four certain products', chapter: 'Q7', unit: 'q7-observables', needs: ['qc-ghz-parity', 'qc-uncertainty'] },
  { id: 'qc-mermin', label: 'Mermin: no instruction set', chapter: 'Q7', unit: 'q7-mermin', needs: ['qc-mermin-observables'] },

  // Chapter Q6 (P-Q6-story §11.1)
  { id: 'qc-composite', label: 'Two qubits: dimensions multiply', chapter: 'Q6', unit: 'q6-many', needs: ['qc-registers'] },
  { id: 'qc-operator-tensor-station', label: 'Operators on pairs', chapter: 'Q6', unit: 'q6-tensor', needs: ['qc-composite', 'qc-spin-operators'] },
  { id: 'qc-entanglement', label: 'Product and entangled states', chapter: 'Q6', unit: 'q6-entangled', needs: ['qc-operator-tensor-station'] },
  { id: 'qc-bell-basis-station', label: 'The Bell basis', chapter: 'Q6', unit: 'q6-bell-basis', needs: ['qc-entanglement', 'qc-circuits'] },
  { id: 'qc-bell-measurement-station', label: 'Reading and making Bell states', chapter: 'Q6', unit: 'q6-bell-circuit', needs: ['qc-bell-basis-station', 'qc-born-projector'] },
  { id: 'qc-parities-station', label: 'Parities and stabilizers', chapter: 'Q6', unit: 'q6-parities', needs: ['qc-bell-measurement-station', 'qc-uncertainty'] },

  // Chapter Q8 (P-Q8-story §11.1)
  { id: 'qc-lost-record', label: 'A lost record: mixture, not superposition', chapter: 'Q8', unit: 'q8-why', needs: ['qc-ghz', 'qc-bell-basis-station'], sameAs: 'mixtures' },
  { id: 'qc-density-matrix-station', label: 'One state as a matrix', chapter: 'Q8', unit: 'q8-pure-rho', needs: ['qc-born-projector', 'qc-operator-matrix'] },
  { id: 'qc-trace-rule', label: 'Averages as traces; how ρ moves', chapter: 'Q8', unit: 'q8-trace-rule', needs: ['qc-density-matrix-station', 'qc-observables', 'qc-uncertainty'], sameAs: 'mean-matrix-form' },
  { id: 'qc-mixed-states', label: 'Mixtures and purity', chapter: 'Q8', unit: 'q8-mixed', needs: ['qc-trace-rule'], sameAs: 'mixtures' },
  { id: 'qc-bloch-ball-station', label: 'The Bloch ball', chapter: 'Q8', unit: 'q8-ball', needs: ['qc-mixed-states', 'qc-bloch-sphere', 'qc-spin-operators'], sameAs: 'bloch-sphere' },
  { id: 'qc-recipes', label: 'One matrix, many recipes', chapter: 'Q8', unit: 'q8-recipes', needs: ['qc-bloch-ball-station', 'qc-spectral'], sameAs: 'mixtures' },

  // Chapter Q9 (P-Q9-story §11.1)
  { id: 'qc-partial-trace-station', label: 'Looking at one part: the partial trace', chapter: 'Q9', unit: 'q9-partial-trace', needs: ['qc-density-matrix-station', 'qc-bell-basis-station', 'qc-ghz'] },
  { id: 'qc-same-part', label: 'Same part, different whole', chapter: 'Q9', unit: 'q9-same-part', needs: ['qc-partial-trace-station', 'qc-lost-record'], sameAs: 'mixtures' },
  { id: 'qc-entropy-station', label: 'The entropy of a state', chapter: 'Q9', unit: 'q9-entropy', needs: ['qc-bloch-ball-station', 'qc-partial-trace-station'] },
  { id: 'qc-schmidt-station', label: 'The Schmidt form of a pair', chapter: 'Q9', unit: 'q9-schmidt', needs: ['qc-entropy-station', 'qc-entanglement'] },
  { id: 'qc-purification-station', label: 'Every mixture is part of something pure', chapter: 'Q9', unit: 'q9-purification', needs: ['qc-schmidt-station', 'qc-recipes'] },
  { id: 'qc-state-distance', label: 'Trace distance and fidelity', chapter: 'Q9', unit: 'q9-distance', needs: ['qc-bloch-ball-station', 'qc-inner-product'] },
  // Chapter Q11 (P-Q11-story §11.1). Q10 is merged, so `qc-no-signalling` is now a `needs` edge wherever Q11
  // invokes it (fix-pass item 5, P-Q11-review.md), on `qc-teleportation`, `qc-teleport-circuit` and `qc-swapping`.
  { id: 'qc-bell-cycle', label: 'The Bell basis as a toolkit', chapter: 'Q11', unit: 'q11-bell-tools', needs: ['qc-bell-basis-station', 'qc-spin-operators'] },
  { id: 'qc-dense-coding', label: 'Dense coding: two bits, one qubit', chapter: 'Q11', unit: 'q11-dense-coding', needs: ['qc-bell-cycle', 'qc-bell-measurement-station'] },
  { id: 'qc-teleportation', label: 'Teleportation', chapter: 'Q11', unit: 'q11-teleport-algebra', needs: ['qc-bell-cycle', 'qc-no-signalling'] },
  { id: 'qc-teleport-circuit', label: 'Teleportation: circuit and call', chapter: 'Q11', unit: 'q11-teleport-circuit', needs: ['qc-teleportation', 'qc-circuits', 'qc-no-signalling'] },
  { id: 'qc-swapping', label: 'Entanglement swapping and repeaters', chapter: 'Q11', unit: 'q11-swapping', needs: ['qc-teleportation', 'qc-bell-measurement-station', 'qc-no-signalling'] },
  // Chapter Q10 (P-Q10-story §11.1). Q9 is merged, so `q10-no-signal` also needs the partial-trace station
  // (fix-pass item 5, P-Q10-review.md).
  { id: 'qc-separable', label: 'Separable states: classical mixtures of products', chapter: 'Q10', unit: 'q10-separable', needs: ['qc-density-matrix-station', 'qc-entanglement', 'qc-operator-tensor-station'], sameAs: 'mixtures' },
  { id: 'qc-no-signalling', label: 'No signalling', chapter: 'Q10', unit: 'q10-no-signal', needs: ['qc-bell-basis-station', 'qc-partial-trace-station'] },
  { id: 'qc-lhv', label: 'Instruction sets: a classical story', chapter: 'Q10', unit: 'q10-hidden', needs: ['qc-mermin', 'qc-separable'] },
  { id: 'qc-chsh-station', label: 'The CHSH inequality', chapter: 'Q10', unit: 'q10-chsh', needs: ['qc-lhv', 'qc-operator-tensor-station'] },
  { id: 'qc-bell-violation', label: 'Breaking the ceiling: $2\\sqrt2$', chapter: 'Q10', unit: 'q10-violation', needs: ['qc-chsh-station', 'qc-bell-basis-station'] },

  // Chapter Q12 (P-Q12-story §11.1). The plan's own `needs` point partly at Q10 stations (qc-separable, qc-chsh),
  // not yet on this branch (Q10/Q11 are not built; qc709-Q10Q13.md's own build order runs E2+plot → {Q10,Q11} and
  // Q12 in parallel): those edges are dropped here rather than pointing at a non-existent id (as `conceptProblems`
  // requires); Q9's own forward prose references to Q10 are the same situation. No `sameAs`: 448 has no
  // entanglement-detection content (the plan's own note).
  { id: 'qc-ppt', label: 'The partial transpose test', chapter: 'Q12', unit: 'q12-ppt', needs: ['qc-density-matrix-station'] },
  { id: 'qc-witness', label: 'One observable that flags entanglement', chapter: 'Q12', unit: 'q12-witness', needs: ['qc-ppt', 'qc-observables'] },
  { id: 'qc-locc-station', label: 'Local moves and a shared coin', chapter: 'Q12', unit: 'q12-locc', needs: ['qc-bell-basis-station'] },
  { id: 'qc-entanglement-measure', label: 'Entanglement as a number', chapter: 'Q12', unit: 'q12-entropy', needs: ['qc-entropy-station'] },
  { id: 'qc-concurrence-station', label: 'Concurrence and negativity', chapter: 'Q12', unit: 'q12-concurrence', needs: ['qc-entanglement-measure', 'qc-schmidt-station'] },
  { id: 'qc-multipartite', label: 'GHZ, W and monogamy', chapter: 'Q12', unit: 'q12-multipartite', needs: ['qc-concurrence-station', 'qc-ghz'] },

  // Chapter Q13 (P-Q13-story §11.1). `needs` on Q12's partial transpose and Q10's no-signalling are deferred (both
  // build in parallel worktrees and have no concept entries here yet); add them once Q10 and Q12 merge.
  { id: 'qc-channel', label: 'Where channels come from', chapter: 'Q13', unit: 'q13-from-unitary', needs: ['qc-trace-rule', 'qc-partial-trace-station'] },
  { id: 'qc-cptp', label: 'What a channel preserves', chapter: 'Q13', unit: 'q13-properties', needs: ['qc-channel'] },
  { id: 'qc-stinespring-station', label: 'Every channel is a unitary', chapter: 'Q13', unit: 'q13-stinespring', needs: ['qc-channel'] },
  { id: 'qc-depolarizing-station', label: 'The shrinking Bloch ball', chapter: 'Q13', unit: 'q13-depolarizing', needs: ['qc-cptp', 'qc-bloch-ball-station'], sameAs: 'bloch-sphere' },
  { id: 'qc-no-cloning-station', label: 'Why you cannot copy a qubit', chapter: 'Q13', unit: 'q13-no-cloning', needs: ['qc-cnot'] },
  { id: 'qc-herbert', label: 'Cloning would break relativity', chapter: 'Q13', unit: 'q13-herbert', needs: ['qc-no-cloning-station'] },

  // Chapter F3 "Matrices and linear maps" (P-F3-story §11.1). F2's own stations (qc-ket, qc-orthonormal-basis,
  // qc-inner-product) are the natural `needs`, but F2 is built in parallel and has no concept entry here yet; these
  // start with no cross-chapter needs and the edges should be tightened once F2 merges. The change-of-basis station
  // is named `qc-change-of-basis-station` (not the bare `qc-change-of-basis`): Q2 already owns that exact id for its
  // own station (`q2-change`), and `conceptProblems` rejects a duplicate id in the same table.
  { id: 'qc-linear-operator', label: 'Linear maps on states', chapter: 'F3', unit: 'f3-linear-maps', needs: [], sameAs: 'operators' },
  { id: 'qc-matrix-of-map', label: 'A map as a table $A_{ij}$', chapter: 'F3', unit: 'f3-matrix-of-map', needs: ['qc-linear-operator'], sameAs: 'spin-matrices' },
  { id: 'qc-matrix-product', label: 'Composing maps; order matters', chapter: 'F3', unit: 'f3-products', needs: ['qc-matrix-of-map'] },
  { id: 'qc-adjoint', label: 'The adjoint; Hermitian and unitary operators', chapter: 'F3', unit: 'f3-adjoint', needs: ['qc-matrix-of-map'], sameAs: 'observables' },
  { id: 'qc-change-of-basis-station', label: 'The same map in a new frame', chapter: 'F3', unit: 'f3-change-of-basis', needs: ['qc-adjoint'], sameAs: 'basis-change' },

  // Chapter F4 "Eigenvalues, Hermitian and unitary operators, the spectral theorem" (P-F4-story §11.1). F4 is the
  // ground-up owner of this math going forward (qc709-foundations-rulings.md); Q3's own `qc-spectral` keeps its
  // `sameAs: 'eigen-problem'` mapping (not re-cut), and F4's twin of it reaches the SAME 448 concept.
  { id: 'qc-f4-eigen', label: 'Eigenvalues: the directions a matrix only stretches', chapter: 'F4', unit: 'f4-eigen', needs: ['qc-matrix-of-map'], sameAs: 'eigen-problem' },
  { id: 'qc-f4-hermitian', label: 'Hermitian tables: real stretches, right-angle directions', chapter: 'F4', unit: 'f4-hermitian', needs: ['qc-f4-eigen', 'qc-adjoint'] },
  { id: 'qc-f4-spectral', label: 'The spectral theorem and functions of a matrix', chapter: 'F4', unit: 'f4-spectral', needs: ['qc-f4-hermitian'], sameAs: 'eigen-problem' },
  { id: 'qc-f4-unitary', label: 'Unitaries: keeping every length; eigenvalues on the circle', chapter: 'F4', unit: 'f4-unitary', needs: ['qc-f4-eigen', 'qc-euler'] },
  { id: 'qc-f4-commuting', label: 'Commuting tables and a shared eigenbasis', chapter: 'F4', unit: 'f4-commuting', needs: ['qc-f4-spectral'] },
  { id: 'qc-f4-positive', label: 'Positive tables and matrix square roots', chapter: 'F4', unit: 'f4-positive', needs: ['qc-f4-spectral'] },

  // Chapter F5 "Chance with numbers" (P-F5-story §11.1). Ground-up owner of classical probability, expectation and
  // variance; `sameAs` ties the average/spread pair to 448's own bundled concept ('expectation', L3, "Expectation
  // values and spread") the way F3's stations do. No `sameAs` for probability itself (448's 'probability' is tied to
  // the Stern-Gerlach picture, not the abstract sample-space one F5 teaches first) or for surprise (448 has no
  // information-theory content).
  { id: 'qc-f5-probability', label: 'Probabilities over a list of outcomes', chapter: 'F5', unit: 'f5-probability', needs: [] },
  { id: 'qc-f5-average', label: 'Expectation: the number you expect', chapter: 'F5', unit: 'f5-average', needs: ['qc-f5-probability'], sameAs: 'expectation' },
  { id: 'qc-f5-spread', label: 'Variance and the $1/\\sqrt N$ law', chapter: 'F5', unit: 'f5-spread', needs: ['qc-f5-average'], sameAs: 'expectation' },
  { id: 'qc-f5-surprise', label: 'Information in bits: Shannon entropy', chapter: 'F5', unit: 'f5-surprise', needs: ['qc-f5-probability'] },

  // Chapter F6 "Tensor products" (P-F6-story §11.1, pending in the plan; authored here). Each station is named with
  // the "-station" suffix because its bare idea is already a concept-map node of Q6 (qc-composite, qc-operator-tensor-
  // station, qc-entanglement): F6 is the algebra's canonical owner GOING FORWARD (qc709-foundations-rulings.md), while
  // Q6's own already-built stations are not re-cut. No `sameAs`: 448 (single-spin) has no multi-system tensor content.
  { id: 'qc-joint-space-station', label: 'Two systems, one joint space', chapter: 'F6', unit: 'f6-pairs', needs: ['qc-orthonormal-basis'] },
  { id: 'qc-tensor-vector-station', label: 'The tensor product on vectors', chapter: 'F6', unit: 'f6-kron', needs: ['qc-joint-space-station'] },
  { id: 'qc-kronecker-matrix-station', label: 'The Kronecker product on operators', chapter: 'F6', unit: 'f6-operator', needs: ['qc-tensor-vector-station', 'qc-matrix-of-map'] },
  { id: 'qc-product-test-station', label: 'The product-versus-entangled test', chapter: 'F6', unit: 'f6-product-or-not', needs: ['qc-tensor-vector-station'] },
  { id: 'qc-tensor-growth-station', label: 'Inner products factor; the memory wall', chapter: 'F6', unit: 'f6-growth', needs: ['qc-tensor-vector-station', 'qc-kronecker-matrix-station'] },

  // Chapter Q14 (P-Q14-story §11.1)
  { id: 'qc-generalized-measurement', label: 'Reading a qubit through a meter', chapter: 'Q14', unit: 'q14-pointer', needs: ['qc-born-projector'], sameAs: 'born-rule' },
  { id: 'qc-povm', label: 'More answers than dimensions', chapter: 'Q14', unit: 'q14-povm', needs: ['qc-generalized-measurement'] },
  { id: 'qc-neumark', label: 'Every POVM is projective upstairs', chapter: 'Q14', unit: 'q14-neumark', needs: ['qc-povm', 'qc-stinespring-station'] },
  { id: 'qc-usd', label: 'Never wrong, sometimes unsure', chapter: 'Q14', unit: 'q14-usd', needs: ['qc-povm'] },
  { id: 'qc-helstrom', label: 'The fewest mistakes', chapter: 'Q14', unit: 'q14-min-error', needs: ['qc-povm', 'qc-state-distance'] },
  { id: 'qc-discrimination', label: 'The price of certainty', chapter: 'Q14', unit: 'q14-compare', needs: ['qc-usd', 'qc-helstrom'] },
]
