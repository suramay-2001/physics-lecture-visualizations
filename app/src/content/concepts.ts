/**
 * The course's concept graph (Phase 4a item 6, the Concept map). Topic names are paraphrased from each
 * lecture's own overview (sources/L*, never copied); `needs` says what a concept builds on. Concepts of lectures
 * not built yet are real course topics shown as "in preparation": they never link anywhere.
 * concepts.test.ts: every need exists, the graph has no cycle, and nothing builds on a LATER lecture.
 */

export interface CourseLecture {
  id: string
  number: number
  title: string
}

/** Short titles for the map (L1's is its page title; the rest paraphrase the notes' own headings). */
export const COURSE_LECTURES: CourseLecture[] = [
  { id: 'L1', number: 1, title: 'Stern–Gerlach and the birth of the quantum state' },
  { id: 'L2', number: 2, title: 'States as vectors in a complex space' },
  { id: 'L3', number: 3, title: 'Quantum measurement' },
  { id: 'L4', number: 4, title: 'Measurement principles and spin operators' },
  { id: 'L5', number: 5, title: 'Spin matrices, expectation values and basis changes' },
  { id: 'L6', number: 6, title: 'Basis changes, the Bloch sphere and rotations' },
  { id: 'L7', number: 7, title: 'Rotations, compatible measurements and uncertainty' },
]

export interface Concept {
  id: string
  label: string
  lecture: string
  /** the built chapter that teaches it (a unit id of that lecture), when the lecture exists in the app */
  unit?: string
  needs: string[]
}

export const CONCEPTS: Concept[] = [
  // L1 (built)
  { id: 'quantized', label: 'Two spots: quantized outcomes', lecture: 'L1', unit: 'l1-quantized', needs: [] },
  { id: 'prepares', label: 'A measurement prepares a state', lecture: 'L1', unit: 'l1-sequential', needs: ['quantized'] },
  { id: 'probability', label: 'Random single atoms, cos²(θ/2), averages', lecture: 'L1', unit: 'l1-average', needs: ['prepares'] },
  { id: 'order', label: 'Measurement order matters', lecture: 'L1', unit: 'l1-logic', needs: ['prepares'] },
  { id: 'vectors', label: 'States are vectors', lecture: 'L1', unit: 'l1-vectors', needs: ['probability', 'order'] },
  // L2
  { id: 'vector-space', label: 'Kets and vector spaces', lecture: 'L2', unit: 'l2-vector-space', needs: ['vectors'] },
  { id: 'inner-product', label: 'Inner products and coordinates', lecture: 'L2', unit: 'l2-inner-product', needs: ['vector-space'] },
  { id: 'complex-numbers', label: 'Complex numbers as turns', lecture: 'L2', unit: 'l2-complex', needs: [] },
  { id: 'complex-amplitudes', label: 'Complex amplitudes and |±y⟩', lecture: 'L2', unit: 'l2-plus-y', needs: ['inner-product', 'probability', 'complex-numbers'] },
  { id: 'mutually-unbiased', label: 'Three mutually unbiased bases', lecture: 'L2', unit: 'l2-three-bases', needs: ['complex-amplitudes'] },
  // L3
  { id: 'operators', label: 'Linear operators and eigenvectors', lecture: 'L3', unit: 'l3-operators', needs: ['inner-product'] },
  { id: 'observables', label: 'Hermitian observables', lecture: 'L3', unit: 'l3-eigen', needs: ['operators'] },
  { id: 'born-rule', label: 'Born rule and the state update', lecture: 'L3', unit: 'l3-postulates', needs: ['observables', 'probability'] },
  // L3 also owns projectors and expectation values (the ownership rule: first lecture whose notes teach it)
  { id: 'projectors', label: 'Projectors and complete eigenbases', lecture: 'L3', unit: 'l3-projectors', needs: ['observables'] },
  { id: 'expectation', label: 'Expectation values and spread', lecture: 'L3', unit: 'l3-spread', needs: ['born-rule'] },
  // the notes' worked example (pp. 14–15): every built unit has a station on the map
  { id: 'repeat-measurement', label: 'One spin measured again and again', lecture: 'L3', unit: 'l3-spin-example', needs: ['born-rule'] },
  // L4 (second passes and the worked example are stations too: every built unit is on the map)
  { id: 'principles', label: 'Four principles, complete eigenbases', lecture: 'L4', unit: 'l4-basis', needs: ['projectors', 'born-rule'] },
  { id: 'yes-no', label: 'A projector as a yes/no question', lecture: 'L4', unit: 'l4-projectors', needs: ['projectors', 'principles'] },
  { id: 'full-prediction', label: 'One state, the whole prediction', lecture: 'L4', unit: 'l4-example', needs: ['principles', 'born-rule'] },
  { id: 'mean-matrix-form', label: 'The average as row × matrix × column', lecture: 'L4', unit: 'l4-average', needs: ['expectation', 'full-prediction'] },
  { id: 'spin-matrices', label: 'The spin matrices', lecture: 'L4', unit: 'l4-matrices', needs: ['observables', 'complex-amplitudes'] },
  { id: 'eigen-problem', label: 'Solving the eigenvalue problem', lecture: 'L4', unit: 'l4-eigen', needs: ['spin-matrices'] },
  // L5 (the two link-back units are stations too: every built unit is on the map)
  { id: 'spin-averages', label: 'Three spin averages from one column', lecture: 'L5', unit: 'l5-averages', needs: ['expectation', 'spin-matrices', 'complex-amplitudes'] },
  { id: 'eigen-coordinates', label: 'Eigenvectors as new coordinates', lecture: 'L5', unit: 'l5-inverse', needs: ['eigen-problem'] },
  { id: 'basis-change', label: 'Changing basis: states and operators', lecture: 'L5', unit: 'l5-coordinates', needs: ['eigen-coordinates', 'inner-product'] },
  { id: 'diagonalization', label: 'Diagonalizing an operator', lecture: 'L5', unit: 'l5-operators', needs: ['basis-change', 'eigen-problem'] },
  { id: 'basis-invariance', label: 'Predictions do not depend on the basis', lecture: 'L5', unit: 'l5-invariance', needs: ['basis-change', 'expectation'] },
  // L6
  { id: 'bloch-sphere', label: 'The Bloch sphere', lecture: 'L6', needs: ['expectation', 'complex-amplitudes', 'spin-averages'] },
  { id: 'passive-active', label: 'Basis change vs physical rotation', lecture: 'L6', needs: ['basis-change'] },
  { id: 'rz', label: 'Rz(φ) and its generator Sz', lecture: 'L6', needs: ['passive-active', 'bloch-sphere'] },
  // L7
  { id: 'full-turn', label: 'A full turn gives −|ψ⟩', lecture: 'L7', needs: ['rz'] },
  { id: 'commutators', label: 'Compatible measurements and commutators', lecture: 'L7', needs: ['order', 'projectors'] },
  { id: 'uncertainty', label: 'Spin uncertainty from the Bloch sphere', lecture: 'L7', needs: ['commutators', 'expectation', 'bloch-sphere'] },
]

export const conceptById = (id: string): Concept | undefined => CONCEPTS.find((c) => c.id === id)
/** Concepts that build directly on `id`. */
export const leadsTo = (id: string): Concept[] => CONCEPTS.filter((c) => c.needs.includes(id))
